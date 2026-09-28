import { prisma } from '../../database/prisma';
import { RabbitMQClient } from '../../messaging/rabbitmq';
import { EVENT_ROUTING_KEYS } from '@infrasphere/shared-events';
import {
  computeDeterministicHealth,
  computeDeterministicRisk,
  DEFAULT_RISK_CONFIG,
  StructuredLogger,
} from '@infrasphere/shared-utils';
import {
  CriticalityLevel,
  RiskLevel,
  MaintenancePriority,
  AssetCondition,
  FindingSeverity,
} from '@infrasphere/shared-types';

const logger = new StructuredLogger('RiskService:Engine');

export class RisksService {
  private rabbit = RabbitMQClient.getInstance();

  async getAssetRisk(assetId: string) {
    return prisma.assetRiskRecord.findUnique({
      where: { assetId },
    });
  }

  async getAllRisks(query: { riskLevel?: string; priority?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.riskLevel) where.riskLevel = query.riskLevel;
    if (query.priority) where.maintenancePriority = query.priority;

    const [total, risks] = await Promise.all([
      prisma.assetRiskRecord.count({ where }),
      prisma.assetRiskRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { riskScore: 'desc' },
      }),
    ]);

    return {
      risks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRiskMatrix() {
    const records = await prisma.assetRiskRecord.findMany({
      select: {
        riskLevel: true,
        criticality: true,
      },
    });

    const matrix: Record<string, Record<string, number>> = {
      CRITICAL: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      HIGH: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      MEDIUM: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      LOW: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    };

    for (const r of records) {
      if (matrix[r.riskLevel] && matrix[r.riskLevel][r.criticality] !== undefined) {
        matrix[r.riskLevel][r.criticality]++;
      }
    }

    return matrix;
  }

  /**
   * Deterministic rule-based recalculation of asset risk & health scores.
   * Can be triggered on events (inspection.completed, maintenance.completed)
   * or manually via API.
   */
  async recalculateRisk(
    assetId: string,
    triggerEvent: string = 'manual.recalculate',
    hints?: {
      condition?: AssetCondition;
      criticality?: CriticalityLevel;
      installationDate?: string;
      expectedLifeYears?: number;
      findings?: { severity: FindingSeverity }[];
      openWorkOrdersCount?: number;
      assetCode?: string;
    }
  ) {
    logger.info('Recalculating deterministic risk score', { assetId, triggerEvent });

    // Fetch config or use defaults
    const configRecord = await prisma.riskConfigRecord.findUnique({ where: { id: 'default' } });
    const config = {
      ...DEFAULT_RISK_CONFIG,
      conditionWeight: configRecord?.conditionWeight ?? DEFAULT_RISK_CONFIG.conditionWeight,
      ageWeight: configRecord?.ageWeight ?? DEFAULT_RISK_CONFIG.ageWeight,
      inspectionWeight: configRecord?.inspectionWeight ?? DEFAULT_RISK_CONFIG.inspectionWeight,
      maintenanceWeight: configRecord?.maintenanceWeight ?? DEFAULT_RISK_CONFIG.maintenanceWeight,
    };

    // If external hints provided (e.g. from inspection.completed event), use them
    let condition = hints?.condition || AssetCondition.GOOD;
    let criticality = hints?.criticality || CriticalityLevel.MEDIUM;
    let installationDate = hints?.installationDate;
    let expectedLifeYears = hints?.expectedLifeYears || 20;
    let findings = hints?.findings || [];
    let openWorkOrdersCount = hints?.openWorkOrdersCount || 0;
    let assetCode = hints?.assetCode;

    // Fetch fresh details from Asset Service if available
    try {
      const assetUrl = `${process.env.ASSET_SERVICE_URL || 'http://localhost:3001'}/api/assets/${assetId}`;
      const res = await fetch(assetUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const a = json.data;
          condition = a.condition as AssetCondition;
          criticality = a.criticality as CriticalityLevel;
          installationDate = a.installationDate;
          expectedLifeYears = a.expectedLifeYears || 20;
          assetCode = a.assetCode;
        }
      }
    } catch (e: any) {
      // Continue with available data
    }

    // Additional active defect weight if findings contain critical or high issues
    let activeDefectWeight = 0;
    for (const f of findings) {
      if (f.severity === FindingSeverity.CRITICAL) activeDefectWeight += 35;
      else if (f.severity === FindingSeverity.HIGH) activeDefectWeight += 20;
      else if (f.severity === FindingSeverity.MEDIUM) activeDefectWeight += 10;
    }

    // 1. Calculate deterministic health score
    const healthResult = computeDeterministicHealth(
      condition,
      installationDate,
      expectedLifeYears,
      findings,
      openWorkOrdersCount,
      activeDefectWeight > 30, // hasEmergency
      3,
      config
    );

    // 2. Calculate deterministic risk score & priority
    const riskResult = computeDeterministicRisk(
      healthResult.healthScore,
      criticality,
      activeDefectWeight,
      config
    );

    // 3. Upsert into database
    const saved = await prisma.assetRiskRecord.upsert({
      where: { assetId },
      create: {
        assetId,
        assetCode,
        healthScore: healthResult.healthScore,
        riskScore: riskResult.riskScore,
        criticality,
        riskLevel: riskResult.riskLevel,
        maintenancePriority: riskResult.maintenancePriority,
        conditionScore: healthResult.breakdown.conditionScore || 80,
        ageScore: healthResult.breakdown.ageScore || 80,
        inspectionScore: healthResult.breakdown.inspectionScore || 90,
        maintenanceScore: healthResult.breakdown.maintenanceScore || 85,
        probabilityScore: riskResult.probabilityScore,
        impactScore: riskResult.impactScore,
        criticalityMultiplier: riskResult.criticalityMultiplier,
        triggerEvent,
        lastCalculatedAt: new Date(),
      },
      update: {
        assetCode: assetCode || undefined,
        healthScore: healthResult.healthScore,
        riskScore: riskResult.riskScore,
        criticality,
        riskLevel: riskResult.riskLevel,
        maintenancePriority: riskResult.maintenancePriority,
        conditionScore: healthResult.breakdown.conditionScore || 80,
        ageScore: healthResult.breakdown.ageScore || 80,
        inspectionScore: healthResult.breakdown.inspectionScore || 90,
        maintenanceScore: healthResult.breakdown.maintenanceScore || 85,
        probabilityScore: riskResult.probabilityScore,
        impactScore: riskResult.impactScore,
        criticalityMultiplier: riskResult.criticalityMultiplier,
        triggerEvent,
        lastCalculatedAt: new Date(),
      },
    });

    // 4. Save history record
    await prisma.riskHistory.create({
      data: {
        assetId,
        healthScore: healthResult.healthScore,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        triggerEvent,
      },
    });

    // 5. Update Asset in Asset Service (Sync health & risk scores)
    try {
      const assetUpdateUrl = `${process.env.ASSET_SERVICE_URL || 'http://localhost:3001'}/api/assets/${assetId}`;
      await fetch(assetUpdateUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthScore: healthResult.healthScore,
          riskScore: riskResult.riskScore,
        }),
      });
    } catch (e: any) {
      // Non-blocking
    }

    // 6. Publish RabbitMQ event
    await this.rabbit.publish(EVENT_ROUTING_KEYS.RISK_UPDATED, {
      assetRisk: {
        id: saved.id,
        assetId: saved.assetId,
        healthScore: saved.healthScore,
        riskScore: saved.riskScore,
        criticality: saved.criticality as CriticalityLevel,
        riskLevel: saved.riskLevel as RiskLevel,
        maintenancePriority: saved.maintenancePriority as MaintenancePriority,
        lastCalculatedAt: saved.lastCalculatedAt.toISOString(),
        triggerEvent: saved.triggerEvent || undefined,
        breakdown: {
          conditionScore: saved.conditionScore,
          ageScore: saved.ageScore,
          inspectionScore: saved.inspectionScore,
          maintenanceScore: saved.maintenanceScore,
          probabilityScore: saved.probabilityScore,
          impactScore: saved.impactScore,
          criticalityMultiplier: saved.criticalityMultiplier,
        },
      },
    });

    return saved;
  }
}
