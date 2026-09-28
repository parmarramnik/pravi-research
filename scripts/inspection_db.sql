
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "Inspection" (
  "id" TEXT PRIMARY KEY,
  "inspectionCode" TEXT UNIQUE NOT NULL,
  "assetId" TEXT NOT NULL,
  "assetCode" TEXT,
  "inspectorName" TEXT NOT NULL,
  "inspectorId" TEXT,
  "scheduledDate" TIMESTAMP NOT NULL,
  "completedDate" TIMESTAMP,
  "status" TEXT NOT NULL,
  "conditionObserved" TEXT NOT NULL,
  "overallScore" DOUBLE PRECISION,
  "summary" TEXT,
  "nextInspectionDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "InspectionFinding" (
  "id" TEXT PRIMARY KEY,
  "inspectionId" TEXT NOT NULL REFERENCES "Inspection"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "category" TEXT,
  "recommendedAction" TEXT,
  "resolved" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "InspectionDoc" (
  "id" TEXT PRIMARY KEY,
  "inspectionId" TEXT NOT NULL REFERENCES "Inspection"("id") ON DELETE CASCADE,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "url" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

TRUNCATE TABLE "InspectionFinding", "InspectionDoc", "Inspection" CASCADE;

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-001', 'INSP-000001', 'ast-elc-001', 'ELC-000001', 'Pooja Verma (Field Auditor)', '2026-03-10', 'SCHEDULED', 'GOOD', 85, 'Quarterly dielectric insulation and winding temperature audit for Powai Transformer.');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-002', 'INSP-000002', 'ast-trn-004', 'TRN-000004', 'Dr. V. N. Deshpande (Structural Expert)', '2026-02-14', 'COMPLETED', 'POOR', 42, 'Heavy corrosion on bearing rocker assembly and spalling on western girder.');

INSERT INTO "InspectionFinding" ("id", "inspectionId", "title", "description", "severity", "recommendedAction") VALUES
('find-001', 'insp-002', 'Bearing Rocker Seizure & Severe Rusting', 'Expansion joints locked due to metallic corrosion, inducing thermal stresses on pier cap.', 'CRITICAL', 'Emergency retrofitting and bearing replacement required within 14 days.');

INSERT INTO "InspectionFinding" ("id", "inspectionId", "title", "description", "severity", "recommendedAction") VALUES
('find-002', 'insp-002', 'Concrete Delamination on Girder Web', 'Rebars exposed to weather over track 2 with concrete spalling.', 'HIGH', 'Micro-concrete grouting and epoxy anti-corrosion coating.');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-003', 'INSP-000003', 'ast-bld-001', 'BLD-000001', 'S. N. Patil (Fire & Life Safety Inspector)', '2026-01-20', 'COMPLETED', 'EXCELLENT', 95, 'Hospital fire evacuation pressurization shafts and emergency diesel generators audit.');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-004', 'INSP-000004', 'ast-wtr-001', 'WTR-000001', 'K. R. Jadhav (Water Quality & SCADA Lead)', '2026-02-01', 'COMPLETED', 'GOOD', 88, 'Rapid sand filter backwash valves and high-lift centrifugal pump inspection.');

INSERT INTO "InspectionFinding" ("id", "inspectionId", "title", "description", "severity", "recommendedAction") VALUES
('find-003', 'insp-004', 'Minor Gland Packing Weepage on Pump 4', 'Gland packing water leakage measured at 45 drops/min.', 'LOW', 'Replace gland packing during next scheduled preventive outage.');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-005', 'INSP-000005', 'ast-trn-001', 'TRN-000001', 'MSRDC Drone Bridge Audit Team', '2026-02-28', 'COMPLETED', 'EXCELLENT', 96, 'Ultrasonic stay-cable tension inspection and expansion joint laser alignment.');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-6', 'INSP-000006', 'ast-bld-007', 'AST-6', 'Field Audit Team Alpha', NOW() - INTERVAL '18 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-7', 'INSP-000007', 'ast-wtr-008', 'AST-7', 'Field Audit Team Alpha', NOW() - INTERVAL '21 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-8', 'INSP-000008', 'ast-bld-001', 'AST-8', 'Field Audit Team Alpha', NOW() - INTERVAL '24 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-9', 'INSP-000009', 'ast-wtr-002', 'AST-9', 'Field Audit Team Alpha', NOW() - INTERVAL '27 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-10', 'INSP-000010', 'ast-bld-003', 'AST-10', 'Field Audit Team Alpha', NOW() - INTERVAL '30 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-11', 'INSP-000011', 'ast-wtr-004', 'AST-11', 'Field Audit Team Alpha', NOW() - INTERVAL '33 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-12', 'INSP-000012', 'ast-bld-005', 'AST-12', 'Field Audit Team Alpha', NOW() - INTERVAL '36 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-13', 'INSP-000013', 'ast-wtr-006', 'AST-13', 'Field Audit Team Alpha', NOW() - INTERVAL '39 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-14', 'INSP-000014', 'ast-bld-007', 'AST-14', 'Field Audit Team Alpha', NOW() - INTERVAL '42 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-15', 'INSP-000015', 'ast-wtr-008', 'AST-15', 'Field Audit Team Alpha', NOW() - INTERVAL '45 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-16', 'INSP-000016', 'ast-bld-001', 'AST-16', 'Field Audit Team Alpha', NOW() - INTERVAL '48 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-17', 'INSP-000017', 'ast-wtr-002', 'AST-17', 'Field Audit Team Alpha', NOW() - INTERVAL '51 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-18', 'INSP-000018', 'ast-bld-003', 'AST-18', 'Field Audit Team Alpha', NOW() - INTERVAL '54 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-19', 'INSP-000019', 'ast-wtr-004', 'AST-19', 'Field Audit Team Alpha', NOW() - INTERVAL '57 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-20', 'INSP-000020', 'ast-bld-005', 'AST-20', 'Field Audit Team Alpha', NOW() - INTERVAL '60 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-21', 'INSP-000021', 'ast-wtr-006', 'AST-21', 'Field Audit Team Alpha', NOW() - INTERVAL '63 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');

INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
('insp-22', 'INSP-000022', 'ast-bld-007', 'AST-22', 'Field Audit Team Alpha', NOW() - INTERVAL '66 days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');
