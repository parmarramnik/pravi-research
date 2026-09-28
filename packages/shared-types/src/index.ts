/**
 * InfraSphere Shared Domain Types & Enums
 */

// ==========================================
// 1. Roles & Authentication
// ==========================================
export enum UserRole {
  ADMIN = 'ADMIN',
  ASSET_MANAGER = 'ASSET_MANAGER',
  INSPECTOR = 'INSPECTOR',
  MAINTENANCE_MANAGER = 'MAINTENANCE_MANAGER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ==========================================
// 2. Asset Enums & Interfaces
// ==========================================
export enum AssetCategory {
  BUILDINGS = 'BUILDINGS',
  WATER = 'WATER',
  TRANSPORT = 'TRANSPORT',
  ELECTRICAL = 'ELECTRICAL',
}

export enum LifecycleStatus {
  PLANNED = 'PLANNED',
  PROCUREMENT = 'PROCUREMENT',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  INSTALLED = 'INSTALLED',
  ACTIVE = 'ACTIVE',
  UNDER_INSPECTION = 'UNDER_INSPECTION',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  DECOMMISSIONED = 'DECOMMISSIONED',
  DISPOSED = 'DISPOSED',
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DAMAGED = 'DAMAGED',
  CRITICAL = 'CRITICAL',
  UNDER_REPAIR = 'UNDER_REPAIR',
  RETIRED = 'RETIRED',
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL',
}

export enum CriticalityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DependencyRelationship {
  DEPENDS_ON = 'DEPENDS_ON',
  SUPPLIES = 'SUPPLIES',
  CONNECTS_TO = 'CONNECTS_TO',
  LOCATED_IN = 'LOCATED_IN',
  SERVES = 'SERVES',
  PROTECTS = 'PROTECTS',
  REPLACED_BY = 'REPLACED_BY',
}

export interface GeoJsonGeometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: any; // [lng, lat] for Point, [[lng, lat], ...] for LineString, etc.
}

export interface BuildingDetails {
  id?: string;
  assetId?: string;
  buildingType: string;
  numberOfFloors: number;
  totalAreaSqMeters: number;
  occupancyCapacity: number;
  constructionYear: number;
  structuralMaterial: string;
  fireSafetyStatus: string;
  electricityCapacityKw?: number;
  waterConnectionStatus: string;
  accessibilityStatus: string;
}

export interface WaterDetails {
  id?: string;
  assetId?: string;
  waterAssetType: string;
  capacityLiters?: number;
  flowRateLps?: number;
  pressureBar?: number;
  pipeDiameterMm?: number;
  pipeMaterial?: string;
  pumpPowerKw?: number;
  treatmentCapacityMld?: number;
  installationDate?: string;
  operatingStatus: string;
}

export interface TransportDetails {
  id?: string;
  assetId?: string;
  transportAssetType: string;
  roadType?: string;
  roadLengthKm?: number;
  bridgeLengthMeters?: number;
  bridgeWidthMeters?: number;
  loadCapacityTons?: number;
  numberOfLanes?: number;
  surfaceMaterial?: string;
  trafficVolumePcuPerDay?: number;
  lightingStatus?: string;
}

export interface ElectricalDetails {
  id?: string;
  assetId?: string;
  electricalAssetType: string;
  voltageKv: number;
  capacityKva?: number;
  currentLoadAmps?: number;
  phaseCount: number;
  manufacturer?: string;
  model?: string;
  operatingTemperatureC?: number;
  powerRatingKw?: number;
  operatingStatus: string;
}

export interface AssetDependency {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  relationship: DependencyRelationship;
  criticality: CriticalityLevel;
  notes?: string;
  targetAsset?: Asset;
  sourceAsset?: Asset;
}

export interface DocumentAttachment {
  id: string;
  assetId?: string;
  inspectionId?: string;
  maintenanceId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  description?: string;
  category: AssetCategory;
  assetType: string;
  status: AssetStatus;
  lifecycleStatus: LifecycleStatus;
  condition: AssetCondition;
  ownerDepartment: string;
  responsiblePerson: string;
  installationDate?: string;
  constructionDate?: string;
  purchaseCost?: number;
  currentValue?: number;
  expectedLifeYears: number;
  warrantyStart?: string;
  warrantyEnd?: string;
  criticality: CriticalityLevel;
  locationName: string;
  latitude: number;
  longitude: number;
  geometry?: GeoJsonGeometry;
  
  // Dynamic domain details
  buildingDetails?: BuildingDetails;
  waterDetails?: WaterDetails;
  transportDetails?: TransportDetails;
  electricalDetails?: ElectricalDetails;

  // Relations
  dependencies?: AssetDependency[];
  documents?: DocumentAttachment[];

  // Computed/Linked scores (optional on asset model)
  healthScore?: number;
  riskScore?: number;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. Inspection Enums & Interfaces
// ==========================================
export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FindingSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Finding {
  id?: string;
  inspectionId?: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  category?: string;
  recommendedAction?: string;
  photos?: string[];
  resolved?: boolean;
}

export interface Inspection {
  id: string;
  inspectionCode: string;
  assetId: string;
  inspectorName: string;
  inspectorId?: string;
  scheduledDate: string;
  completedDate?: string;
  status: InspectionStatus;
  conditionObserved: AssetCondition;
  overallScore?: number; // 0-100
  summary?: string;
  findings: Finding[];
  documents?: DocumentAttachment[];
  nextInspectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Maintenance & Work Order Enums & Interfaces
// ==========================================
export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  EMERGENCY = 'EMERGENCY',
  INSPECTION_REPAIR = 'INSPECTION_REPAIR',
  REPLACEMENT = 'REPLACEMENT',
  UPGRADE = 'UPGRADE',
}

export enum WorkOrderStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  assetId: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  priority: MaintenancePriority;
  status: WorkOrderStatus;
  assignedTechnician?: string;
  assignedDepartment?: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedCost: number;
  actualCost?: number;
  resolutionNotes?: string;
  partsReplaced?: string[];
  documents?: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  workOrderId?: string;
  maintenanceType: MaintenanceType;
  description: string;
  performedBy: string;
  completionDate: string;
  cost: number;
  conditionAfter: AssetCondition;
  notes?: string;
  createdAt: string;
}

// ==========================================
// 5. Risk & Health Enums & Interfaces
// ==========================================
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface RiskScoreBreakdown {
  conditionScore: number;     // 0-100
  ageScore: number;           // 0-100 (deterioration based on expected life)
  inspectionScore: number;    // 0-100 (findings/severity impact)
  maintenanceScore: number;   // 0-100 (overdue maintenance or maintenance frequency)
  probabilityScore: number;   // 0-100 (likelihood of failure)
  impactScore: number;        // 0-100 (consequence of failure)
  criticalityMultiplier: number; // e.g. 1.0 to 1.5
}

export interface AssetRisk {
  id: string;
  assetId: string;
  healthScore: number;        // 0-100 (deterministic: higher is better)
  riskScore: number;          // 0-100 (deterministic: higher is riskier)
  criticality: CriticalityLevel;
  riskLevel: RiskLevel;
  maintenancePriority: MaintenancePriority;
  breakdown: RiskScoreBreakdown;
  lastCalculatedAt: string;
  triggerEvent?: string;
}

export interface RiskConfig {
  conditionWeight: number;    // default 0.35
  ageWeight: number;          // default 0.20
  inspectionWeight: number;   // default 0.20
  maintenanceWeight: number;  // default 0.25
  criticalMultiplierMap: Record<CriticalityLevel, number>;
  healthThresholds: {
    critical: number; // < 25
    poor: number;     // < 50
    fair: number;     // < 75
    good: number;     // < 90
    excellent: number; // >= 90
  };
  riskThresholds: {
    low: number;      // < 25
    medium: number;   // < 50
    high: number;     // < 75
    critical: number; // >= 75
  };
}

// ==========================================
// 6. Notification Enums & Interfaces
// ==========================================
export enum NotificationSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  CRITICAL = 'CRITICAL',
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: string;
  assetId?: string;
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// 7. Audit Service Enums & Interfaces
// ==========================================
export interface AuditLog {
  id: string;
  action: string;             // e.g. "asset.created", "inspection.completed"
  entity: string;             // e.g. "Asset", "Inspection", "WorkOrder"
  entityId: string;
  actorId?: string;
  actorName?: string;
  service: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  timestamp: string;
}

// ==========================================
// 8. Dependency Impact & Graph
// ==========================================
export interface DependencyGraphNode {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  criticality: CriticalityLevel;
  riskLevel: RiskLevel;
  healthScore: number;
}

export interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: DependencyRelationship;
  criticality: CriticalityLevel;
}

export interface DependencyImpactAnalysis {
  rootAssetId: string;
  directlyImpactedCount: number;
  indirectlyImpactedCount: number;
  totalAtRiskAssets: number;
  criticalAssetsAtRisk: string[];
  impactPath: {
    sourceId: string;
    targetId: string;
    relationship: DependencyRelationship;
    depth: number;
  }[];
}

// ==========================================
// 9. AI Assistant Requests & Responses
// ==========================================
export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AiChatRequest {
  query: string;
  assetId?: string;
  history?: { role: string; content: string }[];
}

export interface AiChatResponse {
  answer: string;
  factsUsed: {
    assetCode?: string;
    name?: string;
    healthScore?: number;
    riskScore?: number;
    criticality?: string;
    status?: string;
    findingsCount?: number;
    openWorkOrdersCount?: number;
    dependenciesCount?: number;
  };
  suggestions?: string[];
  timestamp: string;
}

// ==========================================
// 10. API Generic Envelope
// ==========================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface DashboardStatistics {
  totalAssets: number;
  activeAssets: number;
  criticalAssets: number;
  underMaintenance: number;
  upcomingInspections: number;
  openWorkOrders: number;
  categoryBreakdown: { category: AssetCategory; count: number }[];
  conditionDistribution: { condition: AssetCondition; count: number }[];
  riskDistribution: { riskLevel: RiskLevel; count: number }[];
  monthlyMaintenanceCost: { month: string; cost: number }[];
  recentAlerts: Notification[];
}
