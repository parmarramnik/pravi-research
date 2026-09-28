
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

TRUNCATE TABLE "RiskHistory", "RiskConfigRecord", "AssetRiskRecord" CASCADE;

INSERT INTO "RiskConfigRecord" ("id", "conditionWeight", "ageWeight", "inspectionWeight", "maintenanceWeight")
VALUES ('default', 0.35, 0.20, 0.20, 0.25);

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-001', 'ast-bld-001', 'BLD-000001', 94, 12, 'CRITICAL', 'LOW', 'LOW', 94, 80, 85, 90, 12, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-001', 'ast-bld-001', 94, 12, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-002', 'ast-bld-002', 'BLD-000002', 86, 22, 'HIGH', 'LOW', 'LOW', 86, 80, 85, 90, 22, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-002', 'ast-bld-002', 86, 22, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-003', 'ast-bld-003', 'BLD-000003', 91, 14, 'CRITICAL', 'LOW', 'LOW', 91, 80, 85, 90, 14, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-003', 'ast-bld-003', 91, 14, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-004', 'ast-bld-004', 'BLD-000004', 84, 25, 'HIGH', 'MEDIUM', 'NORMAL', 84, 80, 85, 90, 25, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-004', 'ast-bld-004', 84, 25, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-005', 'ast-bld-005', 'BLD-000005', 96, 10, 'CRITICAL', 'LOW', 'LOW', 96, 80, 85, 90, 10, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-005', 'ast-bld-005', 96, 10, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-006', 'ast-bld-006', 'BLD-000006', 93, 16, 'MEDIUM', 'LOW', 'LOW', 93, 80, 85, 90, 16, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-006', 'ast-bld-006', 93, 16, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-007', 'ast-bld-007', 'BLD-000007', 87, 21, 'HIGH', 'LOW', 'LOW', 87, 80, 85, 90, 21, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-007', 'ast-bld-007', 87, 21, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-008', 'ast-bld-008', 'BLD-000008', 72, 36, 'HIGH', 'MEDIUM', 'NORMAL', 72, 80, 85, 90, 36, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-008', 'ast-bld-008', 72, 36, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-009', 'ast-bld-009', 'BLD-000009', 81, 26, 'MEDIUM', 'MEDIUM', 'NORMAL', 81, 80, 85, 90, 26, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-009', 'ast-bld-009', 81, 26, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-bld-010', 'ast-bld-010', 'BLD-000010', 85, 28, 'CRITICAL', 'MEDIUM', 'NORMAL', 85, 80, 85, 90, 28, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-bld-010', 'ast-bld-010', 85, 28, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-001', 'ast-wtr-001', 'WTR-000001', 93, 14, 'CRITICAL', 'LOW', 'LOW', 93, 80, 85, 90, 14, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-001', 'ast-wtr-001', 93, 14, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-002', 'ast-wtr-002', 'WTR-000002', 88, 20, 'CRITICAL', 'LOW', 'LOW', 88, 80, 85, 90, 20, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-002', 'ast-wtr-002', 88, 20, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-003', 'ast-wtr-003', 'WTR-000003', 85, 24, 'HIGH', 'LOW', 'LOW', 85, 80, 85, 90, 24, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-003', 'ast-wtr-003', 85, 24, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-004', 'ast-wtr-004', 'WTR-000004', 91, 16, 'HIGH', 'LOW', 'LOW', 91, 80, 85, 90, 16, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-004', 'ast-wtr-004', 91, 16, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-005', 'ast-wtr-005', 'WTR-000005', 86, 22, 'HIGH', 'LOW', 'LOW', 86, 80, 85, 90, 22, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-005', 'ast-wtr-005', 86, 22, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-006', 'ast-wtr-006', 'WTR-000006', 83, 26, 'MEDIUM', 'MEDIUM', 'NORMAL', 83, 80, 85, 90, 26, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-006', 'ast-wtr-006', 83, 26, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-007', 'ast-wtr-007', 'WTR-000007', 74, 38, 'HIGH', 'MEDIUM', 'NORMAL', 74, 80, 85, 90, 38, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-007', 'ast-wtr-007', 74, 38, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-008', 'ast-wtr-008', 'WTR-000008', 84, 27, 'CRITICAL', 'MEDIUM', 'NORMAL', 84, 80, 85, 90, 27, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-008', 'ast-wtr-008', 84, 27, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-009', 'ast-wtr-009', 'WTR-000009', 92, 15, 'HIGH', 'LOW', 'LOW', 92, 80, 85, 90, 15, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-009', 'ast-wtr-009', 92, 15, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-wtr-010', 'ast-wtr-010', 'WTR-000010', 87, 19, 'MEDIUM', 'LOW', 'LOW', 87, 80, 85, 90, 19, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-wtr-010', 'ast-wtr-010', 87, 19, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-001', 'ast-trn-001', 'TRN-000001', 96, 9, 'CRITICAL', 'LOW', 'LOW', 96, 80, 85, 90, 9, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-001', 'ast-trn-001', 96, 9, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-002', 'ast-trn-002', 'TRN-000002', 82, 28, 'HIGH', 'MEDIUM', 'NORMAL', 82, 80, 85, 90, 28, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-002', 'ast-trn-002', 82, 28, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-003', 'ast-trn-003', 'TRN-000003', 85, 24, 'HIGH', 'LOW', 'LOW', 85, 80, 85, 90, 24, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-003', 'ast-trn-003', 85, 24, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-004', 'ast-trn-004', 'TRN-000004', 93, 13, 'CRITICAL', 'LOW', 'LOW', 93, 80, 85, 90, 13, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-004', 'ast-trn-004', 93, 13, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-005', 'ast-trn-005', 'TRN-000005', 89, 18, 'CRITICAL', 'LOW', 'LOW', 89, 80, 85, 90, 18, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-005', 'ast-trn-005', 89, 18, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-006', 'ast-trn-006', 'TRN-000006', 84, 25, 'HIGH', 'MEDIUM', 'NORMAL', 84, 80, 85, 90, 25, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-006', 'ast-trn-006', 84, 25, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-007', 'ast-trn-007', 'TRN-000007', 88, 19, 'CRITICAL', 'LOW', 'LOW', 88, 80, 85, 90, 19, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-007', 'ast-trn-007', 88, 19, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-008', 'ast-trn-008', 'TRN-000008', 94, 11, 'HIGH', 'LOW', 'LOW', 94, 80, 85, 90, 11, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-008', 'ast-trn-008', 94, 11, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-009', 'ast-trn-009', 'TRN-000009', 93, 13, 'MEDIUM', 'LOW', 'LOW', 93, 80, 85, 90, 13, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-009', 'ast-trn-009', 93, 13, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-trn-010', 'ast-trn-010', 'TRN-000010', 86, 23, 'HIGH', 'LOW', 'LOW', 86, 80, 85, 90, 23, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-trn-010', 'ast-trn-010', 86, 23, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-001', 'ast-elc-001', 'ELC-000001', 87, 21, 'CRITICAL', 'LOW', 'LOW', 87, 80, 85, 90, 21, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-001', 'ast-elc-001', 87, 21, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-002', 'ast-elc-002', 'ELC-000002', 92, 15, 'HIGH', 'LOW', 'LOW', 92, 80, 85, 90, 15, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-002', 'ast-elc-002', 92, 15, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-003', 'ast-elc-003', 'ELC-000003', 88, 18, 'MEDIUM', 'LOW', 'LOW', 88, 80, 85, 90, 18, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-003', 'ast-elc-003', 88, 18, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-004', 'ast-elc-004', 'ELC-000004', 94, 12, 'CRITICAL', 'LOW', 'LOW', 94, 80, 85, 90, 12, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-004', 'ast-elc-004', 94, 12, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-005', 'ast-elc-005', 'ELC-000005', 93, 14, 'MEDIUM', 'LOW', 'LOW', 93, 80, 85, 90, 14, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-005', 'ast-elc-005', 93, 14, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-006', 'ast-elc-006', 'ELC-000006', 73, 39, 'HIGH', 'MEDIUM', 'NORMAL', 73, 80, 85, 90, 39, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-006', 'ast-elc-006', 73, 39, 'MEDIUM', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-007', 'ast-elc-007', 'ELC-000007', 95, 11, 'CRITICAL', 'LOW', 'LOW', 95, 80, 85, 90, 11, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-007', 'ast-elc-007', 95, 11, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-008', 'ast-elc-008', 'ELC-000008', 92, 16, 'MEDIUM', 'LOW', 'LOW', 92, 80, 85, 90, 16, 50, 1, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-008', 'ast-elc-008', 92, 16, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-009', 'ast-elc-009', 'ELC-000009', 96, 8, 'CRITICAL', 'LOW', 'LOW', 96, 80, 85, 90, 8, 50, 1.4, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-009', 'ast-elc-009', 96, 8, 'LOW', 'initial.seed');

INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES ('risk-ast-elc-010', 'ast-elc-010', 'ELC-000010', 86, 22, 'HIGH', 'LOW', 'LOW', 86, 80, 85, 90, 22, 50, 1.2, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES ('rh-ast-elc-010', 'ast-elc-010', 86, 22, 'LOW', 'initial.seed');
