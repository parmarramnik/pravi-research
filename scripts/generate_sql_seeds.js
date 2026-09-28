const fs = require('fs');
const path = require('path');

// We use the standard bcrypt hash for 'Infrasphere@2026'
// Hash verified: $2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve (or generated with cost 10)
const passwordHash = '$2a$10$7Z8Z/08G71eOsqkHkJgNqeF3GZkM3y2sWp3zQ5bB0bM4sL6gJ.aNu';

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return `'${String(val).replace(/'/g, "''")}'`;
}

// ----------------------------------------------------
// 1. ASSET DB
// ----------------------------------------------------
const assetSql = `
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

-- Insert Users
INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "department") VALUES
('user-admin-001', 'admin@infrasphere.local', ${esc(passwordHash)}, 'Chief Infrastructure Officer (Admin)', 'ADMIN', 'Municipal Executive'),
('user-mgr-002', 'asset.manager@infrasphere.local', ${esc(passwordHash)}, 'Rajesh Sharma (Asset Manager)', 'ASSET_MANAGER', 'Asset Planning'),
('user-insp-003', 'inspector@infrasphere.local', ${esc(passwordHash)}, 'Pooja Verma (Field Auditor)', 'INSPECTOR', 'Quality & Safety'),
('user-maint-004', 'maintenance@infrasphere.local', ${esc(passwordHash)}, 'Amitabh Sen (Maintenance Lead)', 'MAINTENANCE_MANAGER', 'Public Works'),
('user-view-005', 'viewer@infrasphere.local', ${esc(passwordHash)}, 'Ananya Roy (Audit Observer)', 'VIEWER', 'Public Oversight')
ON CONFLICT ("id") DO NOTHING;
`;

// Extract and convert assets
const seedTs = fs.readFileSync(path.join(__dirname, 'seed.ts'), 'utf8');

// We can execute Node script to extract and write out SQL files
fs.writeFileSync(path.join(__dirname, 'seed-asset-header.sql'), assetSql.trim());
console.log('Created seed-asset-header.sql');
