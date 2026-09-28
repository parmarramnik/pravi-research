const fs = require('fs');
const path = require('path');

console.log('--- Generating Ahmedabad SQL Seed Files ---');

const PASS_HASH = '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve';

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return `'${String(val).replace(/'/g, "''")}'`;
}

// 1. ASSET SQL
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
('user-admin-001', 'admin@infrasphere.local', ${esc(PASS_HASH)}, 'Chief City Infrastructure Officer (Admin)', 'ADMIN', 'Ahmedabad Municipal Corporation (AMC)'),
('user-mgr-002', 'asset.manager@infrasphere.local', ${esc(PASS_HASH)}, 'Hiren Patel (Asset Planning Lead)', 'ASSET_MANAGER', 'AMC Urban Development Authority'),
('user-insp-003', 'inspector@infrasphere.local', ${esc(PASS_HASH)}, 'Bhavik Shah (Field Auditor & Safety)', 'INSPECTOR', 'Quality & Structural Safety Wing'),
('user-maint-004', 'maintenance@infrasphere.local', ${esc(PASS_HASH)}, 'Dhaval Trivedi (Public Works Lead)', 'MAINTENANCE_MANAGER', 'Engineering & Public Works'),
('user-view-005', 'viewer@infrasphere.local', ${esc(PASS_HASH)}, 'Neha Joshi (Public Oversight & Citizen Audit)', 'VIEWER', 'Civic Transparency Directorate');
`;

// Require the arrays from generate_ahmedabad_seed.js
const seedContent = fs.readFileSync(path.join(__dirname, 'generate_ahmedabad_seed.js'), 'utf8');

function extractArr(name) {
  const marker = `const ${name} = [`;
  const idx = seedContent.indexOf(marker);
  let open = 0, end = -1;
  for (let i = idx + marker.length - 1; i < seedContent.length; i++) {
    if (seedContent[i] === '[') open++;
    else if (seedContent[i] === ']') {
      open--;
      if (open === 0) { end = i; break; }
    }
  }
  return eval(seedContent.substring(idx + marker.length - 1, end + 1));
}

const blds = extractArr('AHMEDABAD_BUILDINGS');
const wtrs = extractArr('AHMEDABAD_WATER');
const trns = extractArr('AHMEDABAD_TRANSPORT');
const elcs = extractArr('AHMEDABAD_ELECTRICAL');
const deps = extractArr('AHMEDABAD_DEPENDENCIES');

for (const b of blds) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(b.id)}, ${esc(b.code)}, ${esc(b.name)}, ${esc(b.desc)}, 'BUILDINGS', ${esc(b.type)}, ${esc(b.status)}, ${esc(b.lifecycle)}, ${esc(b.condition)}, ${esc(b.crit)}, ${esc(b.dept)}, ${esc(b.resp)}, ${esc(b.cost)}, ${esc(b.val)}, ${esc(b.life)}, ${esc(b.loc)}, ${esc(b.lat)}, ${esc(b.lng)}, ${esc(b.health)}, ${esc(b.risk)});
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
(${esc('bd-' + b.id)}, ${esc(b.id)}, ${esc(b.type)}, ${esc(b.floors)}, ${esc(b.area)}, ${esc(b.occ)}, ${esc(b.year)}, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');
`;
}

for (const w of wtrs) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(w.id)}, ${esc(w.code)}, ${esc(w.name)}, ${esc(w.desc)}, 'WATER', ${esc(w.type)}, ${esc(w.status)}, ${esc(w.lifecycle)}, ${esc(w.condition)}, ${esc(w.crit)}, ${esc(w.dept)}, ${esc(w.resp)}, ${esc(w.cost)}, ${esc(w.val)}, ${esc(w.life)}, ${esc(w.loc)}, ${esc(w.lat)}, ${esc(w.lng)}, ${esc(w.health)}, ${esc(w.risk)});
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
(${esc('wd-' + w.id)}, ${esc(w.id)}, ${esc(w.type)}, ${esc(w.cap)}, ${esc(w.flow)}, ${esc(w.press)}, 'NORMAL');
`;
}

for (const t of trns) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(t.id)}, ${esc(t.code)}, ${esc(t.name)}, ${esc(t.desc)}, 'TRANSPORT', ${esc(t.type)}, ${esc(t.status)}, ${esc(t.lifecycle)}, ${esc(t.condition)}, ${esc(t.crit)}, ${esc(t.dept)}, ${esc(t.resp)}, ${esc(t.cost)}, ${esc(t.val)}, ${esc(t.life)}, ${esc(t.loc)}, ${esc(t.lat)}, ${esc(t.lng)}, ${esc(t.health)}, ${esc(t.risk)});
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
(${esc('td-' + t.id)}, ${esc(t.id)}, ${esc(t.type)}, ${esc(t.span)}, ${esc(t.lanes)}, ${esc(t.load)}, ${esc(t.vol)});
`;
}

for (const e of elcs) {
  assetSql += `
INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
(${esc(e.id)}, ${esc(e.code)}, ${esc(e.name)}, ${esc(e.desc)}, 'ELECTRICAL', ${esc(e.type)}, ${esc(e.status)}, ${esc(e.lifecycle)}, ${esc(e.condition)}, ${esc(e.crit)}, ${esc(e.dept)}, ${esc(e.resp)}, ${esc(e.cost)}, ${esc(e.val)}, ${esc(e.life)}, ${esc(e.loc)}, ${esc(e.lat)}, ${esc(e.lng)}, ${esc(e.health)}, ${esc(e.risk)});
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
(${esc('ed-' + e.id)}, ${esc(e.id)}, ${esc(e.type)}, ${esc(e.volt)}, ${esc(e.cap)}, ${esc(e.mfg)}, ${esc(e.model)}, ${esc(e.temp)}, 'OPTIMAL');
`;
}

for (const d of deps) {
  assetSql += `
INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
(${esc(d[0])}, ${esc(d[1])}, ${esc(d[2])}, ${esc(d[3])}, ${esc(d[4])}, ${esc(d[5])});
`;
}

fs.writeFileSync(path.join(__dirname, 'ahmedabad_asset_db.sql'), assetSql);
console.log('Written ahmedabad_asset_db.sql');

// 2. RISK SQL
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

TRUNCATE TABLE "RiskHistory", "RiskConfigRecord", "AssetRiskRecord" CASCADE;

INSERT INTO "RiskConfigRecord" ("id", "conditionWeight", "ageWeight", "inspectionWeight", "maintenanceWeight")
VALUES ('default', 0.35, 0.20, 0.20, 0.25);
`;

const allAssets = [...blds, ...wtrs, ...trns, ...elcs];
for (const a of allAssets) {
  const riskLevel = a.risk >= 75 ? 'CRITICAL' : a.risk >= 50 ? 'HIGH' : a.risk >= 25 ? 'MEDIUM' : 'LOW';
  const maintPriority = a.risk >= 75 ? 'URGENT' : a.risk >= 50 ? 'HIGH' : a.risk >= 25 ? 'NORMAL' : 'LOW';

  riskSql += `
INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
VALUES (${esc('risk-' + a.id)}, ${esc(a.id)}, ${esc(a.code)}, ${a.health}, ${a.risk}, ${esc(a.crit)}, ${esc(riskLevel)}, ${esc(maintPriority)}, ${a.health}, 80, 85, 90, ${a.risk}, 50, ${a.crit === 'CRITICAL' ? 1.4 : a.crit === 'HIGH' ? 1.2 : 1.0}, 'initial.seed');

INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
VALUES (${esc('rh-' + a.id)}, ${esc(a.id)}, ${a.health}, ${a.risk}, ${esc(riskLevel)}, 'initial.seed');
`;
}
fs.writeFileSync(path.join(__dirname, 'ahmedabad_risk_db.sql'), riskSql);
console.log('Written ahmedabad_risk_db.sql');
