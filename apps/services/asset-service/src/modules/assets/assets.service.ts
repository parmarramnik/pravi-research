import { prisma } from '../../database/prisma';
import { RabbitMQClient } from '../../messaging/rabbitmq';
import { EVENT_ROUTING_KEYS } from '@infrasphere/shared-events';
import {
  AssetCategory,
  AssetCondition,
  AssetStatus,
  CriticalityLevel,
  LifecycleStatus,
  DependencyRelationship,
} from '@infrasphere/shared-types';

export class AssetsService {
  private rabbit = RabbitMQClient.getInstance();

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    condition?: string;
    criticality?: string;
    ownerDepartment?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.condition) where.condition = query.condition;
    if (query.criticality) where.criticality = query.criticality;
    if (query.ownerDepartment) where.ownerDepartment = { contains: query.ownerDepartment, mode: 'insensitive' };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { assetCode: { contains: query.search, mode: 'insensitive' } },
        { locationName: { contains: query.search, mode: 'insensitive' } },
        { assetType: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, assets] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buildingDetails: true,
          waterDetails: true,
          transportDetails: true,
          electricalDetails: true,
          _count: {
            select: {
              upstreamDependencies: true,
              downstreamDependencies: true,
              documents: true,
            },
          },
        },
      }),
    ]);

    return {
      assets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMapMarkers(filters?: { category?: string; status?: string; condition?: string; riskLevel?: string }) {
    const where: any = {};
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.condition) where.condition = filters.condition;

    const assets = await prisma.asset.findMany({
      where,
      select: {
        id: true,
        assetCode: true,
        name: true,
        category: true,
        assetType: true,
        status: true,
        condition: true,
        criticality: true,
        locationName: true,
        latitude: true,
        longitude: true,
        geometryType: true,
        coordinatesJson: true,
        healthScore: true,
        riskScore: true,
        ownerDepartment: true,
        responsiblePerson: true,
      },
    });

    return assets.map((a: any) => {
      let geojsonGeometry: any = {
        type: a.geometryType || 'Point',
        coordinates: [a.longitude, a.latitude],
      };
      if (a.coordinatesJson) {
        try {
          geojsonGeometry = JSON.parse(a.coordinatesJson);
        } catch (e) {
          // fallback to point
        }
      }

      return {
        id: a.id,
        assetCode: a.assetCode,
        name: a.name,
        category: a.category,
        assetType: a.assetType,
        status: a.status,
        condition: a.condition,
        criticality: a.criticality,
        locationName: a.locationName,
        latitude: a.latitude,
        longitude: a.longitude,
        healthScore: a.healthScore ?? 80,
        riskScore: a.riskScore ?? 20,
        geometry: geojsonGeometry,
        ownerDepartment: a.ownerDepartment,
      };
    });
  }

  async findById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        buildingDetails: true,
        waterDetails: true,
        transportDetails: true,
        electricalDetails: true,
        upstreamDependencies: {
          include: {
            targetAsset: {
              select: {
                id: true,
                assetCode: true,
                name: true,
                category: true,
                condition: true,
                criticality: true,
                healthScore: true,
                riskScore: true,
              },
            },
          },
        },
        downstreamDependencies: {
          include: {
            sourceAsset: {
              select: {
                id: true,
                assetCode: true,
                name: true,
                category: true,
                condition: true,
                criticality: true,
                healthScore: true,
                riskScore: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    return asset;
  }

  async create(data: any) {
    // Generate human-readable assetCode if not given
    if (!data.assetCode) {
      const prefixMap: Record<string, string> = {
        BUILDINGS: 'BLD',
        WATER: 'WTR',
        TRANSPORT: 'TRN',
        ELECTRICAL: 'ELC',
      };
      const prefix = prefixMap[data.category] || 'AST';
      const count = await prisma.asset.count({ where: { category: data.category } });
      data.assetCode = `${prefix}-${String(count + 1).padStart(6, '0')}`;
    }

    const {
      buildingDetails,
      waterDetails,
      transportDetails,
      electricalDetails,
      ...coreFields
    } = data;

    // Use transaction to create asset and domain-specific details
    const created = await prisma.$transaction(async (tx: any) => {
      const asset = await tx.asset.create({
        data: {
          ...coreFields,
          installationDate: coreFields.installationDate ? new Date(coreFields.installationDate) : undefined,
          constructionDate: coreFields.constructionDate ? new Date(coreFields.constructionDate) : undefined,
          warrantyStart: coreFields.warrantyStart ? new Date(coreFields.warrantyStart) : undefined,
          warrantyEnd: coreFields.warrantyEnd ? new Date(coreFields.warrantyEnd) : undefined,
        },
      });

      if (asset.category === 'BUILDINGS' && buildingDetails) {
        await tx.buildingDetails.create({
          data: {
            ...buildingDetails,
            assetId: asset.id,
          },
        });
      } else if (asset.category === 'WATER' && waterDetails) {
        await tx.waterDetails.create({
          data: {
            ...waterDetails,
            installationDate: waterDetails.installationDate ? new Date(waterDetails.installationDate) : undefined,
            assetId: asset.id,
          },
        });
      } else if (asset.category === 'TRANSPORT' && transportDetails) {
        await tx.transportDetails.create({
          data: {
            ...transportDetails,
            assetId: asset.id,
          },
        });
      } else if (asset.category === 'ELECTRICAL' && electricalDetails) {
        await tx.electricalDetails.create({
          data: {
            ...electricalDetails,
            assetId: asset.id,
          },
        });
      }

      return tx.asset.findUnique({
        where: { id: asset.id },
        include: {
          buildingDetails: true,
          waterDetails: true,
          transportDetails: true,
          electricalDetails: true,
        },
      });
    });

    // Publish RabbitMQ domain event
    if (created) {
      await this.rabbit.publish(EVENT_ROUTING_KEYS.ASSET_CREATED, { asset: created });
    }

    return created;
  }

  async update(id: string, data: any) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) return null;

    const {
      buildingDetails,
      waterDetails,
      transportDetails,
      electricalDetails,
      ...coreFields
    } = data;

    const updated = await prisma.$transaction(async (tx: any) => {
      const asset = await tx.asset.update({
        where: { id },
        data: {
          ...coreFields,
          installationDate: coreFields.installationDate ? new Date(coreFields.installationDate) : undefined,
          constructionDate: coreFields.constructionDate ? new Date(coreFields.constructionDate) : undefined,
          warrantyStart: coreFields.warrantyStart ? new Date(coreFields.warrantyStart) : undefined,
          warrantyEnd: coreFields.warrantyEnd ? new Date(coreFields.warrantyEnd) : undefined,
        },
      });

      if (asset.category === 'BUILDINGS' && buildingDetails) {
        await tx.buildingDetails.upsert({
          where: { assetId: id },
          create: { ...buildingDetails, assetId: id },
          update: buildingDetails,
        });
      } else if (asset.category === 'WATER' && waterDetails) {
        await tx.waterDetails.upsert({
          where: { assetId: id },
          create: { ...waterDetails, assetId: id },
          update: waterDetails,
        });
      } else if (asset.category === 'TRANSPORT' && transportDetails) {
        await tx.transportDetails.upsert({
          where: { assetId: id },
          create: { ...transportDetails, assetId: id },
          update: transportDetails,
        });
      } else if (asset.category === 'ELECTRICAL' && electricalDetails) {
        await tx.electricalDetails.upsert({
          where: { assetId: id },
          create: { ...electricalDetails, assetId: id },
          update: electricalDetails,
        });
      }

      return tx.asset.findUnique({
        where: { id },
        include: {
          buildingDetails: true,
          waterDetails: true,
          transportDetails: true,
          electricalDetails: true,
        },
      });
    });

    if (updated) {
      await this.rabbit.publish(EVENT_ROUTING_KEYS.ASSET_UPDATED, {
        assetId: id,
        previousCondition: existing.condition as AssetCondition,
        newCondition: updated.condition as AssetCondition,
        changes: data,
      });
    }

    return updated;
  }

  async delete(id: string) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) return null;

    await prisma.asset.delete({ where: { id } });

    await this.rabbit.publish(EVENT_ROUTING_KEYS.ASSET_DELETED, {
      assetId: id,
      assetCode: existing.assetCode,
    });

    return true;
  }

  async addDependency(sourceAssetId: string, targetAssetId: string, relationship: string, criticality: string, notes?: string) {
    return prisma.assetDependency.create({
      data: {
        sourceAssetId,
        targetAssetId,
        relationship,
        criticality,
        notes,
      },
      include: {
        sourceAsset: { select: { id: true, assetCode: true, name: true } },
        targetAsset: { select: { id: true, assetCode: true, name: true } },
      },
    });
  }

  async removeDependency(id: string) {
    return prisma.assetDependency.delete({ where: { id } });
  }

  /**
   * Complete Dependency Graph & Failure Impact Simulation
   * Answers:
   * 1. What depends on this asset?
   * 2. What does this asset depend on?
   * 3. If this asset fails, which downstream assets are affected?
   */
  async getDependencyGraph(assetId: string) {
    const rootAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        assetCode: true,
        name: true,
        category: true,
        criticality: true,
        healthScore: true,
        riskScore: true,
      },
    });

    if (!rootAsset) return null;

    // Direct Upstream (Assets this asset depends on: Target assets where source = assetId)
    const upstream = await prisma.assetDependency.findMany({
      where: { sourceAssetId: assetId },
      include: {
        targetAsset: {
          select: {
            id: true,
            assetCode: true,
            name: true,
            category: true,
            criticality: true,
            healthScore: true,
            riskScore: true,
          },
        },
      },
    });

    // Downstream (Assets that depend on this asset: Source assets where target = assetId)
    const downstream = await prisma.assetDependency.findMany({
      where: { targetAssetId: assetId },
      include: {
        sourceAsset: {
          select: {
            id: true,
            assetCode: true,
            name: true,
            category: true,
            criticality: true,
            healthScore: true,
            riskScore: true,
          },
        },
      },
    });

    // BFS Failure Impact Cascade Simulation
    const visited = new Set<string>([assetId]);
    const queue: { id: string; depth: number }[] = [{ id: assetId, depth: 0 }];
    const impactPath: { sourceId: string; targetId: string; relationship: string; depth: number }[] = [];
    const affectedAssetIds: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      // Find what depends on `current.id` (meaning current supplies or is depended upon by sourceAsset)
      const depLinks = await prisma.assetDependency.findMany({
        where: { targetAssetId: current.id },
      });

      for (const link of depLinks) {
        impactPath.push({
          sourceId: current.id,
          targetId: link.sourceAssetId,
          relationship: link.relationship,
          depth: current.depth + 1,
        });

        if (!visited.has(link.sourceAssetId)) {
          visited.add(link.sourceAssetId);
          affectedAssetIds.push(link.sourceAssetId);
          queue.push({ id: link.sourceAssetId, depth: current.depth + 1 });
        }
      }
    }

    const affectedAssets = await prisma.asset.findMany({
      where: { id: { in: affectedAssetIds } },
      select: {
        id: true,
        assetCode: true,
        name: true,
        category: true,
        criticality: true,
        healthScore: true,
        riskScore: true,
      },
    });

    const criticalAtRisk = affectedAssets.filter((a: any) => a.criticality === 'CRITICAL' || a.criticality === 'HIGH');

    return {
      rootAsset,
      upstream: upstream.map((u: any) => ({
        dependencyId: u.id,
        relationship: u.relationship,
        criticality: u.criticality,
        asset: u.targetAsset,
      })),
      downstream: downstream.map((d: any) => ({
        dependencyId: d.id,
        relationship: d.relationship,
        criticality: d.criticality,
        asset: d.sourceAsset,
      })),
      impactAnalysis: {
        rootAssetId: assetId,
        directlyImpactedCount: downstream.length,
        indirectlyImpactedCount: Math.max(0, affectedAssetIds.length - downstream.length),
        totalAtRiskAssets: affectedAssetIds.length,
        criticalAssetsAtRisk: criticalAtRisk.map((c: any) => `${c.assetCode} (${c.name})`),
        affectedAssets,
        impactPath,
      },
    };
  }

  async getDashboardStatistics() {
    const [
      totalAssets,
      activeAssets,
      criticalAssets,
      underMaintenance,
      buildingsCount,
      waterCount,
      transportCount,
      electricalCount,
      excellentCondition,
      goodCondition,
      fairCondition,
      poorCondition,
      criticalCondition,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'ACTIVE' } }),
      prisma.asset.count({ where: { status: 'CRITICAL' } }),
      prisma.asset.count({ where: { lifecycleStatus: 'UNDER_MAINTENANCE' } }),
      prisma.asset.count({ where: { category: 'BUILDINGS' } }),
      prisma.asset.count({ where: { category: 'WATER' } }),
      prisma.asset.count({ where: { category: 'TRANSPORT' } }),
      prisma.asset.count({ where: { category: 'ELECTRICAL' } }),
      prisma.asset.count({ where: { condition: 'EXCELLENT' } }),
      prisma.asset.count({ where: { condition: 'GOOD' } }),
      prisma.asset.count({ where: { condition: 'FAIR' } }),
      prisma.asset.count({ where: { condition: 'POOR' } }),
      prisma.asset.count({ where: { condition: 'CRITICAL' } }),
    ]);

    return {
      totalAssets,
      activeAssets,
      criticalAssets,
      underMaintenance,
      categoryBreakdown: [
        { category: 'BUILDINGS', count: buildingsCount },
        { category: 'WATER', count: waterCount },
        { category: 'TRANSPORT', count: transportCount },
        { category: 'ELECTRICAL', count: electricalCount },
      ],
      conditionDistribution: [
        { condition: 'EXCELLENT', count: excellentCondition },
        { condition: 'GOOD', count: goodCondition },
        { condition: 'FAIR', count: fairCondition },
        { condition: 'POOR', count: poorCondition },
        { condition: 'CRITICAL', count: criticalCondition },
      ],
    };
  }
}
