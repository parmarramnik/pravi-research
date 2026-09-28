
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "actorId" TEXT,
  "actorName" TEXT,
  "service" TEXT NOT NULL,
  "oldValues" TEXT,
  "newValues" TEXT,
  "ipAddress" TEXT,
  "timestamp" TIMESTAMP DEFAULT NOW()
);

TRUNCATE TABLE "AuditLog" CASCADE;

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-001', 'asset.created', 'Asset', 'ast-elc-001', 'user-admin-001', 'Chief Infrastructure Officer (Admin)', 'asset-service', '{"assetCode":"ELC-000001","name":"Powai Transformer"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-002', 'asset.created', 'Asset', 'ast-bld-001', 'user-mgr-002', 'Rajesh Sharma (Asset Manager)', 'asset-service', '{"assetCode":"BLD-000001","name":"AIIMS Hospital"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-003', 'inspection.scheduled', 'Inspection', 'insp-001', 'user-insp-003', 'Pooja Verma (Field Auditor)', 'inspection-service', '{"inspectionCode":"INSP-000001","target":"ELC-000001"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-004', 'inspection.completed', 'Inspection', 'insp-002', 'user-insp-003', 'Pooja Verma (Field Auditor)', 'inspection-service', '{"inspectionCode":"INSP-000002","condition":"POOR","criticalDefects":1}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-005', 'risk.updated', 'RiskScore', 'ast-trn-004', NULL, 'risk-service', 'risk-service', '{"healthScore":42,"riskScore":76,"riskLevel":"CRITICAL"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-006', 'workorder.created', 'WorkOrder', 'wo-001', 'user-maint-004', 'Amitabh Sen (Maintenance Lead)', 'maintenance-service', '{"orderNumber":"WO-000001","priority":"URGENT"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-007', 'workorder.completed', 'WorkOrder', 'wo-003', 'user-maint-004', 'Amitabh Sen (Maintenance Lead)', 'maintenance-service', '{"orderNumber":"WO-000003","actualCost":215000}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-008', 'maintenance.completed', 'MaintenanceRecord', 'mr-wo-003', 'user-maint-004', 'Amitabh Sen (Maintenance Lead)', 'maintenance-service', '{"cost":215000,"conditionAfter":"GOOD"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-009', 'notification.created', 'Notification', 'notif-001', NULL, 'notification-service', 'notification-service', '{"title":"CRITICAL DEFECT: Sion ROB"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
('audit-010', 'asset.dependency_linked', 'AssetDependency', 'dep-001', 'user-mgr-002', 'Rajesh Sharma (Asset Manager)', 'asset-service', '{"source":"ELC-000001","target":"BLD-000005","rel":"SUPPLIES"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-11', 'asset.telemetry_sync', 'Asset', 'ast-wtr-003', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-12', 'asset.telemetry_sync', 'Asset', 'ast-wtr-004', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-13', 'asset.telemetry_sync', 'Asset', 'ast-wtr-005', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-14', 'asset.telemetry_sync', 'Asset', 'ast-wtr-006', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-15', 'asset.telemetry_sync', 'Asset', 'ast-wtr-007', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-16', 'asset.telemetry_sync', 'Asset', 'ast-wtr-008', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-17', 'asset.telemetry_sync', 'Asset', 'ast-wtr-009', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-18', 'asset.telemetry_sync', 'Asset', 'ast-wtr-001', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-19', 'asset.telemetry_sync', 'Asset', 'ast-wtr-002', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-20', 'asset.telemetry_sync', 'Asset', 'ast-wtr-003', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-21', 'asset.telemetry_sync', 'Asset', 'ast-wtr-004', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');

INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
('audit-22', 'asset.telemetry_sync', 'Asset', 'ast-wtr-005', 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');
