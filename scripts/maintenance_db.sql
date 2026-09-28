
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "WorkOrder" (
  "id" TEXT PRIMARY KEY,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "assetId" TEXT NOT NULL,
  "assetCode" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "maintenanceType" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "assignedTechnician" TEXT,
  "assignedDepartment" TEXT,
  "scheduledStartDate" TIMESTAMP,
  "scheduledEndDate" TIMESTAMP,
  "actualStartDate" TIMESTAMP,
  "actualEndDate" TIMESTAMP,
  "estimatedCost" DOUBLE PRECISION DEFAULT 0,
  "actualCost" DOUBLE PRECISION,
  "resolutionNotes" TEXT,
  "partsReplaced" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MaintenanceRecord" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT NOT NULL,
  "workOrderId" TEXT,
  "maintenanceType" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "performedBy" TEXT NOT NULL,
  "completionDate" TIMESTAMP NOT NULL,
  "cost" DOUBLE PRECISION NOT NULL,
  "conditionAfter" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

TRUNCATE TABLE "MaintenanceRecord", "WorkOrder" CASCADE;

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "assetCode", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "assignedDepartment", "estimatedCost", "actualCost") VALUES
('wo-001', 'WO-000001', 'ast-trn-004', 'TRN-000004', 'Emergency Bearing Grouting & Girder Repair', 'Replace seized rocker bearings and apply carbon-fiber reinforcement wrap on Sion ROB web.', 'EMERGENCY', 'URGENT', 'IN_PROGRESS', 'Senior Bridge Repair Specialist (Task Force 1)', 'Central Railway Civil Projects', 850000, NULL);

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "assetCode", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "assignedDepartment", "estimatedCost", "actualCost") VALUES
('wo-002', 'WO-000002', 'ast-wtr-008', 'WTR-000008', 'Motorized Actuator Overhaul on Dharavi Valve', 'Replace gearbox seals and calibrate electronic flow sensor.', 'CORRECTIVE', 'HIGH', 'ASSIGNED', 'Suresh More (Valve Specialist)', 'Hydraulic Maintenance', 145000, NULL);

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "assetCode", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "assignedDepartment", "estimatedCost", "actualCost") VALUES
('wo-003', 'WO-000003', 'ast-bld-004', 'BLD-000004', 'HVAC Air Handling Unit Coil Descaling', 'Annual chemical cleaning of chillers and ventilation ducts in surgical suites.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Voltas Facility Services', 'Public Health Department', 220000, 215000);

INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter", "notes") VALUES
('mr-wo-003', 'ast-bld-004', 'wo-003', 'PREVENTIVE', 'HVAC Air Handling Unit Coil Descaling', 'Voltas Facility Services', NOW() - INTERVAL '5 days', 215000, 'GOOD', 'Work completed within specifications.');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-4', 'WO-000004', 'ast-trn-005', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 133000, 133000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-4', 'ast-trn-005', 'wo-4', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '20 days', 133000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-5', 'WO-000005', 'ast-wtr-006', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 145000, 145000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-5', 'ast-wtr-006', 'wo-5', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '25 days', 145000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-6', 'WO-000006', 'ast-elc-007', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 157000, 157000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-6', 'ast-elc-007', 'wo-6', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '30 days', 157000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-7', 'WO-000007', 'ast-trn-008', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 169000, 169000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-7', 'ast-trn-008', 'wo-7', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '35 days', 169000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-8', 'WO-000008', 'ast-wtr-001', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 181000, 181000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-8', 'ast-wtr-001', 'wo-8', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '40 days', 181000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-9', 'WO-000009', 'ast-elc-002', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 193000, 193000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-9', 'ast-elc-002', 'wo-9', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '45 days', 193000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-10', 'WO-000010', 'ast-trn-003', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 205000, 205000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-10', 'ast-trn-003', 'wo-10', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '50 days', 205000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-11', 'WO-000011', 'ast-wtr-004', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 217000, 217000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-11', 'ast-wtr-004', 'wo-11', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '55 days', 217000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-12', 'WO-000012', 'ast-elc-005', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 229000, 229000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-12', 'ast-elc-005', 'wo-12', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '60 days', 229000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-13', 'WO-000013', 'ast-trn-006', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 241000, 241000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-13', 'ast-trn-006', 'wo-13', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '65 days', 241000, 'EXCELLENT');

INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
('wo-14', 'WO-000014', 'ast-wtr-007', 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', 253000, 253000);
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-14', 'ast-wtr-007', 'wo-14', 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '70 days', 253000, 'EXCELLENT');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-15', 'ast-bld-007', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '105 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-16', 'ast-bld-008', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '112 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-17', 'ast-bld-009', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '119 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-18', 'ast-bld-001', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '126 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-19', 'ast-bld-002', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '133 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-20', 'ast-bld-003', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '140 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-21', 'ast-bld-004', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '147 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-22', 'ast-bld-005', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '154 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-23', 'ast-bld-006', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '161 days', 45000, 'GOOD');

INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
('mr-24', 'ast-bld-007', 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '168 days', 45000, 'GOOD');
