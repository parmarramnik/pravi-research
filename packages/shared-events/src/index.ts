/**
 * InfraSphere RabbitMQ Event Bus Definitions & Payloads
 */
import {
  Asset,
  Inspection,
  Finding,
  WorkOrder,
  MaintenanceRecord,
  AssetRisk,
  Notification,
  AssetCondition,
  FindingSeverity,
} from '@infrasphere/shared-types';

export const RABBITMQ_EXCHANGE = 'infrastructure.events';

export const EVENT_ROUTING_KEYS = {
  // Asset events
  ASSET_CREATED: 'asset.created',
  ASSET_UPDATED: 'asset.updated',
  ASSET_DELETED: 'asset.deleted',

  // Inspection events
  INSPECTION_CREATED: 'inspection.created',
  INSPECTION_COMPLETED: 'inspection.completed',

  // Maintenance & Work Order events
  MAINTENANCE_CREATED: 'maintenance.created',
  MAINTENANCE_COMPLETED: 'maintenance.completed',
  WORKORDER_CREATED: 'workorder.created',
  WORKORDER_COMPLETED: 'workorder.completed',

  // Risk events
  RISK_UPDATED: 'risk.updated',

  // Notification events
  NOTIFICATION_CREATED: 'notification.created',
} as const;

export type EventRoutingKey =
  typeof EVENT_ROUTING_KEYS[keyof typeof EVENT_ROUTING_KEYS];

export interface DomainEvent<T = any> {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: string;
  payload: T;
}

// Payload definitions
export interface AssetCreatedPayload {
  asset: Asset;
}

export interface AssetUpdatedPayload {
  assetId: string;
  previousCondition?: AssetCondition;
  newCondition?: AssetCondition;
  changes: Partial<Asset>;
}

export interface AssetDeletedPayload {
  assetId: string;
  assetCode: string;
}

export interface InspectionCreatedPayload {
  inspectionId: string;
  assetId: string;
  scheduledDate: string;
}

export interface InspectionCompletedPayload {
  inspectionId: string;
  assetId: string;
  assetCode?: string;
  conditionObserved: AssetCondition;
  overallScore?: number;
  criticalFindingsCount: number;
  highFindingsCount: number;
  findings: Finding[];
  completedDate: string;
}

export interface MaintenanceCreatedPayload {
  maintenanceId: string;
  assetId: string;
  type: string;
  estimatedCost?: number;
}

export interface MaintenanceCompletedPayload {
  record: MaintenanceRecord;
  assetId: string;
  conditionAfter: AssetCondition;
  cost: number;
}

export interface WorkOrderCreatedPayload {
  workOrder: WorkOrder;
}

export interface WorkOrderCompletedPayload {
  workOrderId: string;
  assetId: string;
  actualCost: number;
  completedAt: string;
}

export interface RiskUpdatedPayload {
  assetRisk: AssetRisk;
}

export interface NotificationCreatedPayload {
  notification: Notification;
}

/**
 * Creates a standard DomainEvent envelope with UUID and ISO timestamp
 */
export function createDomainEvent<T>(
  eventType: string,
  source: string,
  payload: T,
  customEventId?: string
): DomainEvent<T> {
  return {
    eventId: customEventId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)),
    eventType,
    timestamp: new Date().toISOString(),
    source,
    payload,
  };
}
