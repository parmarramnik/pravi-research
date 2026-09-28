
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "AssetRiskRecord" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT UNIQUE NOT NULL,
  "assetCode" TEXT,
  "healthScore" DOUBLE PRECISION NOT NULL,
  "riskScore" DOUBLE PRECISION NOT NULL,
  "criticality" TEXT NOT NULL,
  "riskLevel" TEXT NOT NULL,
  "maintenancePriority" TEXT NOT NULL,
  "conditionScore" DOUBLE PRECISION NOT NULL,
  "ageScore" DOUBLE PRECISION NOT NULL,
  "inspectionScore" DOUBLE PRECISION NOT NULL,
  "maintenanceScore" DOUBLE PRECISION NOT NULL,
  "probabilityScore" DOUBLE PRECISION NOT NULL,
  "impactScore" DOUBLE PRECISION NOT NULL,
  "criticalityMultiplier" DOUBLE PRECISION NOT NULL,
  "triggerEvent" TEXT,
  "lastCalculatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "RiskConfigRecord" (
  "id" TEXT PRIMARY KEY,
  "conditionWeight" DOUBLE PRECISION DEFAULT 0.35,
  "ageWeight" DOUBLE PRECISION DEFAULT 0.20,
  "inspectionWeight" DOUBLE PRECISION DEFAULT 0.20,
  "maintenanceWeight" DOUBLE PRECISION DEFAULT 0.25,
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "RiskHistory" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT NOT NULL,
  "healthScore" DOUBLE PRECISION NOT NULL,
  "riskScore" DOUBLE PRECISION NOT NULL,
  "riskLevel" TEXT NOT NULL,
  "triggerEvent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

TRUNCATE TABLE "RiskHistory", "AssetRiskRecord", "RiskConfigRecord" CASCADE;

INSERT INTO "RiskConfigRecord" ("id", "conditionWeight", "ageWeight", "inspectionWeight", "maintenanceWeight")
VALUES ('default', 0.35, 0.20, 0.20, 0.25) ON CONFLICT DO NOTHING;

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-001', 'ast-bld-001', 'BLD-000001', 92, 15, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 8, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-001', 'ast-bld-001', 92, 15, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-002', 'ast-bld-002', 'BLD-000002', 84, 28, 'HIGH', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 16, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-002', 'ast-bld-002', 84, 28, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-003', 'ast-bld-003', 'BLD-000003', 90, 18, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 10, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-003', 'ast-bld-003', 90, 18, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-004', 'ast-bld-004', 'BLD-000004', 68, 54, 'HIGH', 'HIGH', 'HIGH', 60, 85, 55, 65, 32, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-004', 'ast-bld-004', 68, 54, 'HIGH', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-005', 'ast-bld-005', 'BLD-000005', 95, 12, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 5, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-005', 'ast-bld-005', 95, 12, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-006', 'ast-bld-006', 'BLD-000006', 80, 30, 'MEDIUM', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 20, 45, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-006', 'ast-bld-006', 80, 30, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-007', 'ast-bld-007', 'BLD-000007', 85, 25, 'HIGH', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 15, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-007', 'ast-bld-007', 85, 25, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-008', 'ast-bld-008', 'BLD-000008', 70, 42, 'MEDIUM', 'MEDIUM', 'NORMAL', 60, 85, 55, 65, 30, 45, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-008', 'ast-bld-008', 70, 42, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-009', 'ast-bld-009', 'BLD-000009', 82, 26, 'HIGH', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 18, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-009', 'ast-bld-009', 82, 26, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-bld-010', 'ast-bld-010', 'BLD-000010', 91, 16, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 9, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-bld-010', 'ast-bld-010', 91, 16, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-001', 'ast-wtr-001', 'WTR-000001', 86, 22, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 14, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-001', 'ast-wtr-001', 86, 22, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-002', 'ast-wtr-002', 'WTR-000002', 72, 45, 'HIGH', 'MEDIUM', 'NORMAL', 60, 85, 55, 65, 28, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-002', 'ast-wtr-002', 72, 45, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-003', 'ast-wtr-003', 'WTR-000003', 82, 26, 'CRITICAL', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 18, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-003', 'ast-wtr-003', 82, 26, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-004', 'ast-wtr-004', 'WTR-000004', 90, 15, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 10, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-004', 'ast-wtr-004', 90, 15, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-005', 'ast-wtr-005', 'WTR-000005', 84, 24, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 16, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-005', 'ast-wtr-005', 84, 24, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-006', 'ast-wtr-006', 'WTR-000006', 89, 19, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 11, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-006', 'ast-wtr-006', 89, 19, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-007', 'ast-wtr-007', 'WTR-000007', 81, 27, 'MEDIUM', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 19, 45, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-007', 'ast-wtr-007', 81, 27, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-008', 'ast-wtr-008', 'WTR-000008', 66, 58, 'HIGH', 'HIGH', 'HIGH', 60, 85, 55, 65, 34, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-008', 'ast-wtr-008', 66, 58, 'HIGH', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-009', 'ast-wtr-009', 'WTR-000009', 83, 25, 'HIGH', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 17, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-009', 'ast-wtr-009', 83, 25, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-wtr-010', 'ast-wtr-010', 'WTR-000010', 91, 17, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 9, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-wtr-010', 'ast-wtr-010', 91, 17, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-001', 'ast-trn-001', 'TRN-000001', 93, 14, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 7, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-001', 'ast-trn-001', 93, 14, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-002', 'ast-trn-002', 'TRN-000002', 82, 26, 'HIGH', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 18, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-002', 'ast-trn-002', 82, 26, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-003', 'ast-trn-003', 'TRN-000003', 71, 48, 'HIGH', 'MEDIUM', 'NORMAL', 60, 85, 55, 65, 29, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-003', 'ast-trn-003', 71, 48, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-004', 'ast-trn-004', 'TRN-000004', 42, 76, 'CRITICAL', 'CRITICAL', 'URGENT', 60, 85, 55, 65, 58, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-004', 'ast-trn-004', 42, 76, 'CRITICAL', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-005', 'ast-trn-005', 'TRN-000005', 85, 23, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 15, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-005', 'ast-trn-005', 85, 23, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-006', 'ast-trn-006', 'TRN-000006', 91, 16, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 9, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-006', 'ast-trn-006', 91, 16, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-007', 'ast-trn-007', 'TRN-000007', 94, 13, 'MEDIUM', 'LOW', 'NORMAL', 90, 85, 95, 90, 6, 45, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-007', 'ast-trn-007', 94, 13, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-008', 'ast-trn-008', 'TRN-000008', 80, 28, 'HIGH', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 20, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-008', 'ast-trn-008', 80, 28, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-009', 'ast-trn-009', 'TRN-000009', 73, 42, 'HIGH', 'MEDIUM', 'NORMAL', 60, 85, 55, 65, 27, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-009', 'ast-trn-009', 73, 42, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-trn-010', 'ast-trn-010', 'TRN-000010', 86, 21, 'MEDIUM', 'LOW', 'NORMAL', 90, 85, 95, 90, 14, 45, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-trn-010', 'ast-trn-010', 86, 21, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-001', 'ast-elc-001', 'ELC-000001', 84, 25, 'CRITICAL', 'MEDIUM', 'NORMAL', 90, 85, 95, 90, 16, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-001', 'ast-elc-001', 84, 25, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-002', 'ast-elc-002', 'ELC-000002', 94, 12, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 6, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-002', 'ast-elc-002', 94, 12, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-003', 'ast-elc-003', 'ELC-000003', 88, 19, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 12, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-003', 'ast-elc-003', 88, 19, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-004', 'ast-elc-004', 'ELC-000004', 85, 23, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 15, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-004', 'ast-elc-004', 85, 23, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-005', 'ast-elc-005', 'ELC-000005', 96, 10, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 5, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-005', 'ast-elc-005', 96, 10, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-006', 'ast-elc-006', 'ELC-000006', 86, 22, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 14, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-006', 'ast-elc-006', 86, 22, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-007', 'ast-elc-007', 'ELC-000007', 93, 13, 'CRITICAL', 'LOW', 'NORMAL', 90, 85, 95, 90, 7, 95, 1.6, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-007', 'ast-elc-007', 93, 13, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-008', 'ast-elc-008', 'ELC-000008', 74, 42, 'HIGH', 'MEDIUM', 'NORMAL', 60, 85, 55, 65, 26, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-008', 'ast-elc-008', 74, 42, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-009', 'ast-elc-009', 'ELC-000009', 84, 24, 'MEDIUM', 'LOW', 'NORMAL', 90, 85, 95, 90, 16, 45, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-009', 'ast-elc-009', 84, 24, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
('risk-ast-elc-010', 'ast-elc-010', 'ELC-000010', 92, 15, 'HIGH', 'LOW', 'NORMAL', 90, 85, 95, 90, 8, 75, 1.2, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
('rh-ast-elc-010', 'ast-elc-010', 92, 15, 'LOW', 'initial.seed');
