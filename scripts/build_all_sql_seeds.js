const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Generating InfraSphere Production SQL Seed Files ---');

// Standard bcrypt hash for password 'Infrasphere@2026'
// Pre-calculated with bcrypt cost 10
const PASS_HASH = '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve';

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return `'${String(val).replace(/'/g, "''")}'`;
}

// ==========================================
// 1. ASSET DB
// ==========================================
let assetSql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "department" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Asset" (
  "id" TEXT PRIMARY KEY,
  "assetCode" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "assetType" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "lifecycleStatus" TEXT NOT NULL,
  "condition" TEXT NOT NULL,
  "ownerDepartment" TEXT NOT NULL,
  "responsiblePerson" TEXT NOT NULL,
  "installationDate" TIMESTAMP,
  "constructionDate" TIMESTAMP,
  "purchaseCost" DOUBLE PRECISION,
  "currentValue" DOUBLE PRECISION,
  "expectedLifeYears" INTEGER DEFAULT 20,
  "warrantyStart" TIMESTAMP,
  "warrantyEnd" TIMESTAMP,
  "criticality" TEXT NOT NULL,
  "locationName" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "geometryType" TEXT DEFAULT 'Point',
  "coordinatesJson" TEXT,
  "healthScore" DOUBLE PRECISION DEFAULT 80,
  "riskScore" DOUBLE PRECISION DEFAULT 20,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "BuildingDetails" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT UNIQUE NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "buildingType" TEXT NOT NULL,
  "numberOfFloors" INTEGER DEFAULT 1,
  "totalAreaSqMeters" DOUBLE PRECISION NOT NULL,
  "occupancyCapacity" INTEGER NOT NULL,
  "constructionYear" INTEGER NOT NULL,
  "structuralMaterial" TEXT NOT NULL,
  "fireSafetyStatus" TEXT NOT NULL,
  "electricityCapacityKw" DOUBLE PRECISION,
  "waterConnectionStatus" TEXT NOT NULL,
  "accessibilityStatus" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "WaterDetails" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT UNIQUE NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "waterAssetType" TEXT NOT NULL,
  "capacityLiters" DOUBLE PRECISION,
  "flowRateLps" DOUBLE PRECISION,
  "pressureBar" DOUBLE PRECISION,
  "pipeDiameterMm" DOUBLE PRECISION,
  "pipeMaterial" TEXT,
  "pumpPowerKw" DOUBLE PRECISION,
  "treatmentCapacityMld" DOUBLE PRECISION,
  "installationDate" TIMESTAMP,
  "operatingStatus" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "TransportDetails" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT UNIQUE NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "transportAssetType" TEXT NOT NULL,
  "roadType" TEXT,
  "roadLengthKm" DOUBLE PRECISION,
  "bridgeLengthMeters" DOUBLE PRECISION,
  "bridgeWidthMeters" DOUBLE PRECISION,
  "loadCapacityTons" DOUBLE PRECISION,
  "numberOfLanes" INTEGER,
  "surfaceMaterial" TEXT,
  "trafficVolumePcuPerDay" DOUBLE PRECISION,
  "lightingStatus" TEXT
);

CREATE TABLE IF NOT EXISTS "ElectricalDetails" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT UNIQUE NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "electricalAssetType" TEXT NOT NULL,
  "voltageKv" DOUBLE PRECISION NOT NULL,
  "capacityKva" DOUBLE PRECISION,
  "currentLoadAmps" DOUBLE PRECISION,
  "phaseCount" INTEGER DEFAULT 3,
  "manufacturer" TEXT,
  "model" TEXT,
  "operatingTemperatureC" DOUBLE PRECISION,
  "powerRatingKw" DOUBLE PRECISION,
  "operatingStatus" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "AssetDependency" (
  "id" TEXT PRIMARY KEY,
  "sourceAssetId" TEXT NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "targetAssetId" TEXT NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "relationship" TEXT NOT NULL,
  "criticality" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AssetDocument" (
  "id" TEXT PRIMARY KEY,
  "assetId" TEXT NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "url" TEXT,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

TRUNCATE TABLE "AssetDependency", "AssetDocument", "BuildingDetails", "WaterDetails", "TransportDetails", "ElectricalDetails", "Asset", "User" CASCADE;

INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "department") VALUES
('user-admin-001', 'admin@infrasphere.local', ${esc(PASS_HASH)}, 'Chief Infrastructure Officer (Admin)', 'ADMIN', 'Municipal Executive'),
('user-mgr-002', 'asset.manager@infrasphere.local', ${esc(PASS_HASH)}, 'Rajesh Sharma (Asset Manager)', 'ASSET_MANAGER', 'Asset Planning'),
('user-insp-003', 'inspector@infrasphere.local', ${esc(PASS_HASH)}, 'Pooja Verma (Field Auditor)', 'INSPECTOR', 'Quality & Safety'),
('user-maint-004', 'maintenance@infrasphere.local', ${esc(PASS_HASH)}, 'Amitabh Sen (Maintenance Lead)', 'MAINTENANCE_MANAGER', 'Public Works'),
('user-view-005', 'viewer@infrasphere.local', ${esc(PASS_HASH)}, 'Ananya Roy (Audit Observer)', 'VIEWER', 'Public Oversight');
`;

// Extract assets from seed.ts
const seedTsContent = fs.readFileSync(path.join(__dirname, 'seed.ts'), 'utf8');

// Helper to eval sub-arrays from seed.ts safely
function extractArray(varName) {
  const startMarker = `const ${varName} = [`;
  const startIndex = seedTsContent.indexOf(startMarker);
  if (startIndex === -1) throw new Error(`Could not find ${varName}`);
  
  // Find matching closing bracket
  let openCount = 0;
  let endIndex = -1;
  for (let i = startIndex + startMarker.length - 1; i < seedTsContent.length; i++) {
    if (seedTsContent[i] === '[') openCount++;
    else if (seedTsContent[i] === ']') {
      openCount--;
      if (openCount === 0) {
        endIndex = i;
        break;
      }
    }
  }
  const code = seedTsContent.substring(startIndex + startMarker.length - 1, endIndex + 1);
  return eval(code);
}

const buildings = extractArray('buildings');
const waterAssets = extractArray('waterAssets');
const transportAssets = extractArray('transportAssets');
const electricalAssets = extractArray('electricalAssets');
const dependencies = extractArray('dependencies');

// Build Buildings SQL
for (const b of buildings) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(b.id)}, ${esc(b.code)}, ${esc(b.name)}, ${esc(b.desc)}, 'BUILDINGS', ${esc(b.type)}, ${esc(b.status)}, ${esc(b.lifecycle)}, ${esc(b.condition)}, ${esc(b.crit)}, ${esc(b.dept)}, ${esc(b.resp)}, ${esc(b.cost)}, ${esc(b.val)}, ${esc(b.life)}, ${esc(b.loc)}, ${esc(b.lat)}, ${esc(b.lng)}, ${esc(b.health)}, ${esc(b.risk)});
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
(${esc('bd-' + b.id)}, ${esc(b.id)}, ${esc(b.type)}, ${esc(b.floors)}, ${esc(b.area)}, ${esc(b.occ)}, ${esc(b.year)}, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');
`;
}

// Build Water SQL
for (const w of waterAssets) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(w.id)}, ${esc(w.code)}, ${esc(w.name)}, ${esc(w.desc)}, 'WATER', ${esc(w.type)}, ${esc(w.status)}, ${esc(w.lifecycle)}, ${esc(w.condition)}, ${esc(w.crit)}, ${esc(w.dept)}, ${esc(w.resp)}, ${esc(w.cost)}, ${esc(w.val)}, ${esc(w.life)}, ${esc(w.loc)}, ${esc(w.lat)}, ${esc(w.lng)}, ${esc(w.health)}, ${esc(w.risk)});
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
(${esc('wd-' + w.id)}, ${esc(w.id)}, ${esc(w.type)}, ${esc(w.cap)}, ${esc(w.flow)}, ${esc(w.press)}, 'NORMAL');
`;
}

// Build Transport SQL
for (const t of transportAssets) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(t.id)}, ${esc(t.code)}, ${esc(t.name)}, ${esc(t.desc)}, 'TRANSPORT', ${esc(t.type)}, ${esc(t.status)}, ${esc(t.lifecycle)}, ${esc(t.condition)}, ${esc(t.crit)}, ${esc(t.dept)}, ${esc(t.resp)}, ${esc(t.cost)}, ${esc(t.val)}, ${esc(t.life)}, ${esc(t.loc)}, ${esc(t.lat)}, ${esc(t.lng)}, ${esc(t.health)}, ${esc(t.risk)});
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
(${esc('td-' + t.id)}, ${esc(t.id)}, ${esc(t.type)}, ${esc(t.span)}, ${esc(t.lanes)}, ${esc(t.load)}, ${esc(t.vol)});
`;
}

// Build Electrical SQL
for (const e of electricalAssets) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(e.id)}, ${esc(e.code)}, ${esc(e.name)}, ${esc(e.desc)}, 'ELECTRICAL', ${esc(e.type)}, ${esc(e.status)}, ${esc(e.lifecycle)}, ${esc(e.condition)}, ${esc(e.crit)}, ${esc(e.dept)}, ${esc(e.resp)}, ${esc(e.cost)}, ${esc(e.val)}, ${esc(e.life)}, ${esc(e.loc)}, ${esc(e.lat)}, ${esc(e.lng)}, ${esc(e.health)}, ${esc(e.risk)});
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
(${esc('ed-' + e.id)}, ${esc(e.id)}, ${esc(e.type)}, ${esc(e.volt)}, ${esc(e.cap)}, ${esc(e.mfg)}, ${esc(e.model)}, ${esc(e.temp)}, 'OPTIMAL');
`;
}

// Build Dependencies SQL
for (const d of dependencies) {
  assetSql += `
INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
(${esc(d[0])}, ${esc(d[1])}, ${esc(d[2])}, ${esc(d[3])}, ${esc(d[4])}, ${esc(d[5])});
`;
}

fs.writeFileSync(path.join(__dirname, 'asset_db.sql'), assetSql);
console.log('Generated asset_db.sql');

// ==========================================
// 2. INSPECTION DB
// ==========================================
let inspSql = `
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
`;

const inspectionsSeed = extractArray('inspectionsSeed');
for (const i of inspectionsSeed) {
  inspSql += `
INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
(${esc(i.id)}, ${esc(i.code)}, ${esc(i.assetId)}, ${esc(i.assetCode)}, ${esc(i.inspector)}, ${esc(i.date)}, ${esc(i.status)}, ${esc(i.cond)}, ${esc(i.score)}, ${esc(i.summary)});
`;
  if (i.findings) {
    for (const f of i.findings) {
      inspSql += `
INSERT INTO "InspectionFinding" ("id", "inspectionId", "title", "description", "severity", "recommendedAction") VALUES
(${esc(f.id)}, ${esc(i.id)}, ${esc(f.title)}, ${esc(f.desc)}, ${esc(f.severity)}, ${esc(f.rec)});
`;
    }
  }
}

for (let idx = 6; idx <= 22; idx++) {
  const code = `INSP-${String(idx).padStart(6, '0')}`;
  const targetAssetId = `ast-${idx % 2 === 0 ? 'bld' : 'wtr'}-00${(idx % 8) + 1}`;
  inspSql += `
INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary") VALUES
(${esc('insp-' + idx)}, ${esc(code)}, ${esc(targetAssetId)}, ${esc('AST-' + idx)}, 'Field Audit Team Alpha', NOW() - INTERVAL '${idx * 3} days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance');
`;
}

fs.writeFileSync(path.join(__dirname, 'inspection_db.sql'), inspSql);
console.log('Generated inspection_db.sql');

// ==========================================
// 3. MAINTENANCE DB
// ==========================================
let maintSql = `
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
`;

const workOrdersSeed = extractArray('workOrdersSeed');
for (const w of workOrdersSeed) {
  maintSql += `
INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "assetCode", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "assignedDepartment", "estimatedCost", "actualCost") VALUES
(${esc(w.id)}, ${esc(w.order)}, ${esc(w.assetId)}, ${esc(w.code)}, ${esc(w.title)}, ${esc(w.desc)}, ${esc(w.type)}, ${esc(w.priority)}, ${esc(w.status)}, ${esc(w.tech)}, ${esc(w.dept)}, ${esc(w.est)}, ${esc(w.act)});
`;
  if (w.status === 'COMPLETED' && w.act) {
    maintSql += `
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter", "notes") VALUES
(${esc('mr-' + w.id)}, ${esc(w.assetId)}, ${esc(w.id)}, ${esc(w.type)}, ${esc(w.title)}, ${esc(w.tech)}, NOW() - INTERVAL '5 days', ${esc(w.act)}, 'GOOD', 'Work completed within specifications.');
`;
  }
}

for (let idx = 4; idx <= 14; idx++) {
  const orderNum = `WO-${String(idx).padStart(6, '0')}`;
  const targetAssetId = `ast-${idx % 3 === 0 ? 'elc' : idx % 3 === 1 ? 'trn' : 'wtr'}-00${(idx % 8) + 1}`;
  const cost = 85000 + idx * 12000;
  maintSql += `
INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost") VALUES
(${esc('wo-' + idx)}, ${esc(orderNum)}, ${esc(targetAssetId)}, 'Scheduled Preventive Maintenance', 'Routine lubrications, diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', ${esc(cost)}, ${esc(cost)});
INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
(${esc('mr-' + idx)}, ${esc(targetAssetId)}, ${esc('wo-' + idx)}, 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '${idx * 5} days', ${esc(cost)}, 'EXCELLENT');
`;
}

for (let idx = 15; idx <= 24; idx++) {
  const targetAssetId = `ast-bld-00${(idx % 9) + 1}`;
  maintSql += `
INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter") VALUES
(${esc('mr-' + idx)}, ${esc(targetAssetId)}, 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '${idx * 7} days', 45000, 'GOOD');
`;
}

fs.writeFileSync(path.join(__dirname, 'maintenance_db.sql'), maintSql);
console.log('Generated maintenance_db.sql');

// ==========================================
// 4. RISK DB
// ==========================================
let riskSql = `
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
`;

const allAssets = [...buildings, ...waterAssets, ...transportAssets, ...electricalAssets];
for (const a of allAssets) {
  let riskLevel = 'LOW';
  if (a.risk >= 75) riskLevel = 'CRITICAL';
  else if (a.risk >= 50) riskLevel = 'HIGH';
  else if (a.risk >= 25) riskLevel = 'MEDIUM';

  let priority = 'NORMAL';
  if (riskLevel === 'CRITICAL' || a.health < 35) priority = 'URGENT';
  else if (riskLevel === 'HIGH' || a.health < 55) priority = 'HIGH';

  const condScore = a.health >= 80 ? 90 : 60;
  const ageScore = 85;
  const inspScore = a.health >= 80 ? 95 : 55;
  const maintScore = a.health >= 80 ? 90 : 65;
  const probScore = Math.max(5, 100 - a.health);
  const impactScore = a.crit === 'CRITICAL' ? 95 : a.crit === 'HIGH' ? 75 : 45;
  const critMult = a.crit === 'CRITICAL' ? 1.6 : 1.2;

  riskSql += `
INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent") VALUES
(${esc('risk-' + a.id)}, ${esc(a.id)}, ${esc(a.code)}, ${esc(a.health)}, ${esc(a.risk)}, ${esc(a.crit)}, ${esc(riskLevel)}, ${esc(priority)}, ${esc(condScore)}, ${esc(ageScore)}, ${esc(inspScore)}, ${esc(maintScore)}, ${esc(probScore)}, ${esc(impactScore)}, ${esc(critMult)}, 'initial.seed');
INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent") VALUES
(${esc('rh-' + a.id)}, ${esc(a.id)}, ${esc(a.health)}, ${esc(a.risk)}, ${esc(riskLevel)}, 'initial.seed');
`;
}

fs.writeFileSync(path.join(__dirname, 'risk_db.sql'), riskSql);
console.log('Generated risk_db.sql');

// ==========================================
// 5. NOTIFICATION DB
// ==========================================
let notifSql = `
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
`;

const notifications = extractArray('notifications');
for (const n of notifications) {
  notifSql += `
INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode") VALUES
(${esc(n[0])}, ${esc(n[1])}, ${esc(n[2])}, ${esc(n[3])}, ${esc(n[4])}, ${esc(n[5])}, ${esc(n[6])});
`;
}

fs.writeFileSync(path.join(__dirname, 'notification_db.sql'), notifSql);
console.log('Generated notification_db.sql');

// ==========================================
// 6. AUDIT DB
// ==========================================
let auditSql = `
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
`;

const auditEvents = extractArray('auditEvents');
for (const a of auditEvents) {
  auditSql += `
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues") VALUES
(${esc(a[0])}, ${esc(a[1])}, ${esc(a[2])}, ${esc(a[3])}, ${esc(a[4])}, ${esc(a[5])}, ${esc(a[6])}, ${esc(a[7])});
`;
}

for (let idx = 11; idx <= 22; idx++) {
  auditSql += `
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues") VALUES
(${esc('audit-' + idx)}, 'asset.telemetry_sync', 'Asset', ${esc('ast-wtr-00' + ((idx % 9) + 1))}, 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}');
`;
}

fs.writeFileSync(path.join(__dirname, 'audit_db.sql'), auditSql);
console.log('Generated audit_db.sql');

console.log('All 6 SQL Seed Files Generated Successfully!');
