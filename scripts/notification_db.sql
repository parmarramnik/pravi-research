
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "assetId" TEXT,
  "assetCode" TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

TRUNCATE TABLE "Notification" CASCADE;

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-001', 'CRITICAL DEFECT: Sion ROB Girder Delamination', 'Bearing seizure and severe corrosion detected during structural audit. Emergency repair work order issued.', 'CRITICAL', 'INSPECTION', 'ast-trn-004', 'TRN-000004');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-002', 'High Risk Elevation: Dharavi Zone Valve', 'Active leak and actuator valve degradation elevated asset risk score to 58/100.', 'ALERT', 'RISK_ALERT', 'ast-wtr-008', 'WTR-000008');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-003', 'Inspection Scheduled: Powai 220kV Transformer', 'Quarterly dielectric insulation and winding audit scheduled for Powai substation transformer.', 'INFO', 'INSPECTION', 'ast-elc-001', 'ELC-000001');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-004', 'Work Order Assigned: Bearing Retrofitting', 'Work Order WO-000001 dispatched to Task Force 1 for emergency structural stabilization.', 'INFO', 'MAINTENANCE', 'ast-trn-004', 'TRN-000004');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-005', 'Inspection Completed: AIIMS Hospital Block A', 'Comprehensive audit completed. Health score certified at 92/100 with zero critical defects.', 'INFO', 'INSPECTION', 'ast-bld-001', 'BLD-000001');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-006', 'Maintenance Completed: General Hospital HVAC', 'Air handling and cooling chillers descaled successfully. Normal temperature gradient restored.', 'INFO', 'MAINTENANCE', 'ast-bld-004', 'BLD-000004');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-007', 'Risk Recalculation: Bandra-Worli Sea Link', 'Laser stay-cable alignment verified. Risk score maintained at optimal 14/100.', 'INFO', 'RISK_ALERT', 'ast-trn-001', 'TRN-000001');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-008', 'SCADA Network Telemetry Active', 'All 40 infrastructure telemetry gateways reporting normal heartbeat to central bus.', 'INFO', 'SYSTEM', NULL, NULL);

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-009', 'Water Pipeline Pressure Spike: Vaitarna Aqueduct', 'Transient 9.2 Bar pressure wave detected; automated surge suppression valves responded within spec.', 'WARNING', 'TELEMETRY', 'ast-wtr-004', 'WTR-000004');

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-010', 'MinIO Document Ingestion Verified', 'Structural safety certificates and laser ultrasonic scan PDF files stored in S3 object repository.', 'INFO', 'DOCUMENT', NULL, NULL);

INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
('notif-011', 'Upcoming Inspection Due in 7 Days', 'Bhandup treatment plant centrifugal pump cluster scheduled for preventive thermal imaging.', 'INFO', 'SCHEDULE', 'ast-wtr-001', 'WTR-000001');
