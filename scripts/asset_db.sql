
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
('user-admin-001', 'admin@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Chief Infrastructure Officer (Admin)', 'ADMIN', 'Municipal Executive'),
('user-mgr-002', 'asset.manager@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Rajesh Sharma (Asset Manager)', 'ASSET_MANAGER', 'Asset Planning'),
('user-insp-003', 'inspector@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Pooja Verma (Field Auditor)', 'INSPECTOR', 'Quality & Safety'),
('user-maint-004', 'maintenance@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Amitabh Sen (Maintenance Lead)', 'MAINTENANCE_MANAGER', 'Public Works'),
('user-view-005', 'viewer@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Ananya Roy (Audit Observer)', 'VIEWER', 'Public Oversight');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-001', 'BLD-000001', 'AIIMS Multi-Specialty Hospital Block A', 'Critical state healthcare emergency and trauma center serving 1.5M population.', 'BUILDINGS', 'Government Super-Speciality Hospital', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Department of Medical Education & Health', 'Dr. V. K. Paul (Medical Director)', 125000000, 118000000, 50, 'Bandra-Kurla Complex, Mumbai', 19.0657, 72.8685, 92, 15);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-001', 'ast-bld-001', 'Government Super-Speciality Hospital', 10, 28500, 1800, 2021, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-002', 'BLD-000002', 'Brihanmumbai Municipal Corporation HQ', 'Central governance, disaster command and civic administration secretariat.', 'BUILDINGS', 'Municipal Administration Secretariat', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Municipal General Administration', 'Iqbal Singh Chahal (Commissioner)', 85000000, 72000000, 60, 'Fort, CSMT Area, Mumbai', 18.9405, 72.8354, 84, 28);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-002', 'ast-bld-002', 'Municipal Administration Secretariat', 6, 19200, 1200, 2018, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-003', 'BLD-000003', 'Dadar Central Disaster Management Bunker', 'Subterranean flood monitoring and cyclone shelter control facility.', 'BUILDINGS', 'Disaster Relief Command Center', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Disaster Relief Cell', 'S. N. Patil (Chief Resilience Officer)', 45000000, 42000000, 40, 'Dadar West, Mumbai', 19.0178, 72.8478, 90, 18);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-003', 'ast-bld-003', 'Disaster Relief Command Center', 3, 8400, 600, 2022, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-004', 'BLD-000004', 'Thane Central General Civil Hospital', 'District level emergency surgical care and blood bank facility.', 'BUILDINGS', 'District Hospital', 'ACTIVE', 'UNDER_INSPECTION', 'FAIR', 'HIGH', 'Public Health Department', 'Dr. Kailash Pawar (Civil Surgeon)', 65000000, 51000000, 40, 'Station Road, Thane West', 19.1983, 72.9781, 68, 54);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-004', 'ast-bld-004', 'District Hospital', 5, 14200, 950, 2015, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-005', 'BLD-000005', 'Powai Innovation & Smart City Data Center', 'Tier-4 edge computing facility for civic telemetry and IoT SCADA servers.', 'BUILDINGS', 'Mission-Critical Data Center', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Smart City IT Cell', 'Anand Deshmukh (Chief Technology Officer)', 95000000, 88000000, 25, 'Hiranandani, Powai, Mumbai', 19.1176, 72.906, 95, 12);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-005', 'ast-bld-005', 'Mission-Critical Data Center', 4, 11000, 300, 2023, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-006', 'BLD-000006', 'Bandra Model Higher Secondary School & Shelter', 'Public education infrastructure designated as flood safe haven.', 'BUILDINGS', 'Educational & Refuge Complex', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'Education Department', 'Meenakshi Sundaram (Principal)', 28000000, 22000000, 45, 'Hill Road, Bandra West', 19.0544, 72.8402, 80, 30);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-006', 'ast-bld-006', 'Educational & Refuge Complex', 4, 9200, 1500, 2016, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-007', 'BLD-000007', 'Byculla Regional Cold Storage Vaccine Vault', 'Primary state refrigerated immunization preservation depot.', 'BUILDINGS', 'Pharmaceutical Logistics Facility', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Medical Supplies Corporation', 'R. K. Rathore (Depot Supt)', 38000000, 32000000, 30, 'Byculla East, Mumbai', 18.975, 72.8335, 85, 25);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-007', 'ast-bld-007', 'Pharmaceutical Logistics Facility', 2, 6500, 120, 2020, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-008', 'BLD-000008', 'Vashi Agricultural Produce Market Terminal', 'State wholesale supply hub feeding metropolitan food requirements.', 'BUILDINGS', 'Commercial Food Logistics Terminal', 'ACTIVE', 'ACTIVE', 'FAIR', 'MEDIUM', 'Agricultural Marketing Board', 'B. S. Kadam (Secretary)', 54000000, 39000000, 40, 'APMC Sector 19, Navi Mumbai', 19.0768, 73.0039, 70, 42);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-008', 'ast-bld-008', 'Commercial Food Logistics Terminal', 2, 35000, 4000, 2012, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-009', 'BLD-000009', 'Worli Regional Fire Brigade Central Station', 'Rapid intervention fire suppression, hazardous hazmat and rescue dispatch.', 'BUILDINGS', 'Emergency Services Station', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Mumbai Fire Services', 'Hemant Parab (Chief Fire Officer)', 32000000, 27000000, 35, 'Dr Annie Besant Road, Worli', 19.0063, 72.8183, 82, 26);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-009', 'ast-bld-009', 'Emergency Services Station', 3, 7800, 220, 2019, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-010', 'BLD-000010', 'Pune Collectorate Administrative Tower', 'Integrated civil registry, revenue courts and regional emergency operations.', 'BUILDINGS', 'Administrative Headquarters', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'Revenue & District Administration', 'Dr. Rajesh Deshmukh (Collector)', 72000000, 68000000, 50, 'Camp Area, Pune, Maharashtra', 18.5204, 73.8567, 91, 16);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-010', 'ast-bld-010', 'Administrative Headquarters', 7, 18400, 1100, 2022, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-001', 'WTR-000001', 'Bhandup Primary Water Treatment Complex', 'One of Asia largest water purification plants producing 2800 MLD filtered drinking water.', 'WATER', 'Water Treatment Plant (WTP)', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'Hydraulic Engineer Department', 'Purushottam Malvade (Chief Hydraulic Eng)', 320000000, 275000000, 40, 'Bhandup Complex, LBS Marg, Mumbai', 19.1438, 72.9341, 86, 22);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-001', 'ast-wtr-001', 'Water Treatment Plant (WTP)', 2800000000, 32400, 8.5, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-002', 'WTR-000002', 'Powai Lake Raw Water Pumping Station', 'Bulk transfer pumps lifting raw water to secondary chlorination plants.', 'WATER', 'Pumping Station', 'ACTIVE', 'UNDER_INSPECTION', 'FAIR', 'HIGH', 'Water Supply Project Division', 'K. R. Jadhav (Executive Eng Pumps)', 48000000, 38000000, 25, 'Powai Lakefront, Mumbai', 19.1245, 72.9058, 72, 45);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-002', 'ast-wtr-002', 'Pumping Station', 45000000, 650, 6.2, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-003', 'WTR-000003', 'Malabar Hill Elevated Balancing Reservoir', 'Gravity-fed storage reservoir providing water pressure across South Mumbai.', 'WATER', 'Covered Distribution Reservoir', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'Hydraulic Engineer Department', 'Vijay Zore (Reservoir Supt)', 65000000, 52000000, 50, 'Ridge Road, Malabar Hill, Mumbai', 18.9554, 72.8052, 82, 26);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-003', 'ast-wtr-003', 'Covered Distribution Reservoir', 147000000, 4200, 4.8, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-004', 'WTR-000004', 'Vaitarna Trunk Transmission Water Aqueduct', '3000mm diameter bulk conveyance steel pipeline connecting dam to treatment.', 'WATER', 'Transmission Pipeline Aqueduct', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Bulk Supply Projects', 'Mahesh Narvekar (Project Director)', 180000000, 165000000, 45, 'Eastern Corridor, Thane-Mulund Section', 19.1726, 72.9565, 90, 15);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-004', 'ast-wtr-004', 'Transmission Pipeline Aqueduct', 1200000000, 18000, 9, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-005', 'WTR-000005', 'Veravali High-Pressure Distribution Sump & Pump', 'Intermediate pressure boosting for Western Suburbs feeder lines.', 'WATER', 'Distribution Pumping Station', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Hydraulic Engineer Department', 'Ajit Pawar (Operations Lead)', 38000000, 31000000, 30, 'Veravali Hill, Andheri East', 19.1298, 72.8687, 84, 24);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-005', 'ast-wtr-005', 'Distribution Pumping Station', 62000000, 850, 7, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-006', 'WTR-000006', 'Worli Seaface Automated Outfall Sump', 'Stormwater retention and high-tide reflux flood protection pumping station.', 'WATER', 'Stormwater Pumping Station', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'Stormwater Drainage Dept', 'S. K. Sawant (Drainage Eng)', 52000000, 47000000, 35, 'Worli Sea Face, Mumbai', 19.0145, 72.8152, 89, 19);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-006', 'ast-wtr-006', 'Stormwater Pumping Station', 18000000, 1200, 3.5, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-007', 'WTR-000007', 'Ghatkopar High-Level Ground Storage Reservoir', 'Dual-compartment concrete reservoir serving Central Suburbs zone.', 'WATER', 'Ground Storage Reservoir', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'Hydraulic Engineer Department', 'Deepak Gore (Section Eng)', 41000000, 34000000, 40, 'Ghatkopar East Hills, Mumbai', 19.0882, 72.9189, 81, 27);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-007', 'ast-wtr-007', 'Ground Storage Reservoir', 85000000, 1100, 5.2, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-008', 'WTR-000008', 'Dharavi Slum Area Water Distribution Main Valve', 'Zone control valve regulating equalized pressure for high-density wards.', 'WATER', 'Distribution Control Vault', 'ACTIVE', 'UNDER_MAINTENANCE', 'FAIR', 'HIGH', 'Hydraulic Maintenance Cell', 'Ramesh Thorat (Maintenance Inspector)', 16000000, 11000000, 25, 'Dharavi Main Road, Mumbai', 19.0435, 72.8562, 66, 58);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-008', 'ast-wtr-008', 'Distribution Control Vault', 12000000, 380, 3.8, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-009', 'WTR-000009', 'Vihar Dam Raw Intake Sluice Tower', 'Historic gravity intake tower with motorized multi-level sluice gates.', 'WATER', 'Intake Control Structure', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Water Supply Projects', 'Nitin Raut (Dam Safety Officer)', 29000000, 21000000, 50, 'Sanjay Gandhi National Park, Vihar Lake', 19.1415, 72.9023, 83, 25);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-009', 'ast-wtr-009', 'Intake Control Structure', 92000000, 950, 4, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-010', 'WTR-000010', 'Panvel Creek Subsea Treated Water Intertie', 'High-density polyethylene (HDPE) subsea water main to peninsular node.', 'WATER', 'Subsea Crossing Pipeline', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'CIDCO Water Authority', 'K. V. Shinde (CIDCO Chief Eng)', 44000000, 39000000, 35, 'Panvel Creek, Navi Mumbai', 18.9894, 73.1175, 91, 17);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-010', 'ast-wtr-010', 'Subsea Crossing Pipeline', 22000000, 450, 6, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-001', 'TRN-000001', 'Bandra-Worli Sea Link Main Cable-Stayed Bridge', 'Iconic 8-lane expressway bridge over Mahim Bay carrying 120,000 PCU daily.', 'TRANSPORT', 'Cable-Stayed Marine Bridge', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Maharashtra State Road Dev Corp (MSRDC)', 'Radheshyam Mopalwar (Vice Chairman MSRDC)', 1600000000, 1450000000, 100, 'Mahim Bay, Bandra to Worli', 19.0368, 72.8172, 93, 14);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-001', 'ast-trn-001', 'Cable-Stayed Marine Bridge', 5600, 8, 120, 125000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-002', 'TRN-000002', 'Eastern Express Highway Flyover (Vikhroli Section)', 'Prestressed concrete arterial flyover bypassing heavy industrial intersections.', 'TRANSPORT', 'Highway Flyover Viaduct', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'MMRDA Infrastructure Wing', 'P. D. Joshi (Superintending Eng)', 95000000, 78000000, 50, 'EEH Vikhroli Junction, Mumbai', 19.1118, 72.9281, 82, 26);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-002', 'ast-trn-002', 'Highway Flyover Viaduct', 1250, 6, 70, 92000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-003', 'TRN-000003', 'Western Express Highway Andheri East Flyover', 'High-density elevated corridor linking domestic airport with North suburbs.', 'TRANSPORT', 'Urban Elevated Expressway', 'ACTIVE', 'UNDER_INSPECTION', 'FAIR', 'HIGH', 'MMRDA Infrastructure Wing', 'A. K. Bansal (Maintenance Lead)', 82000000, 64000000, 45, 'WEH, Andheri East, Mumbai', 19.1155, 72.8569, 71, 48);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-003', 'ast-trn-003', 'Urban Elevated Expressway', 1800, 6, 70, 110000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-004', 'TRN-000004', 'Sion Railway Over Bridge (ROB)', 'Critical road link over Central Railway main lines connecting East and West Sion.', 'TRANSPORT', 'Railway Over Bridge (ROB)', 'UNDER_REPAIR', 'UNDER_MAINTENANCE', 'POOR', 'CRITICAL', 'Central Railway & BMC Joint Bridge Cell', 'Vivek Sahay (General Manager CR)', 45000000, 28000000, 50, 'Sion Railway Station, Mumbai', 19.039, 72.8625, 42, 76);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-004', 'ast-trn-004', 'Railway Over Bridge (ROB)', 320, 4, 40, 68000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-005', 'TRN-000005', 'Santacruz-Chembur Link Road Double-Decker Flyover', 'Indias first double-decker flyover crossing Central Railway and suburban arterial.', 'TRANSPORT', 'Double-Decker Steel Composite Flyover', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'MMRDA Infrastructure Wing', 'Sanjay Khandare (Addl Commissioner)', 450000000, 390000000, 60, 'Kurla West, Mumbai', 19.0684, 72.8821, 85, 23);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-005', 'ast-trn-005', 'Double-Decker Steel Composite Flyover', 3450, 6, 80, 85000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-006', 'TRN-000006', 'Mumbai-Pune Expressway Bhatan Tunnel Section', '6-lane twin horseshoe tunnel complex with SCADA ventilation and smoke dampers.', 'TRANSPORT', 'Mountain Highway Tunnel', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'MSRDC Tollways Wing', 'Chandrakant Pulkundwar (Chief Eng)', 650000000, 590000000, 80, 'Bhatan, Khandala Ghat Section', 18.7845, 73.3456, 91, 16);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-006', 'ast-trn-006', 'Mountain Highway Tunnel', 1680, 6, 100, 78000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-007', 'TRN-000007', 'BKC Central Boulevard & Smart Traffic Signal Grid', 'Corridor containing 42 synchronized AI traffic cameras and pedestrian crosswalks.', 'TRANSPORT', 'Smart Urban Arterial Grid', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'MEDIUM', 'Traffic Police & MMRDA', 'Pravin Padwal (Joint CP Traffic)', 35000000, 31000000, 25, 'G Block, BKC, Bandra East', 19.0601, 72.8644, 94, 13);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-007', 'ast-trn-007', 'Smart Urban Arterial Grid', 4200, 6, 60, 54000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-008', 'TRN-000008', 'Thane-Belapur Industrial Highway Expressway', 'Heavy commercial corridor carrying chemical and container transport trailers.', 'TRANSPORT', 'Industrial Arterial Highway', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'MIDC Road Division', 'P. D. Patil (MIDC Superintending Eng)', 120000000, 98000000, 30, 'Rabale to Turbhe, Navi Mumbai', 19.1456, 73.0089, 80, 28);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-008', 'ast-trn-008', 'Industrial Arterial Highway', 14500, 6, 110, 95000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-009', 'TRN-000009', 'Jogeshwari-Vikhroli Link Road (JVLR) Creek Bridge', 'High-clearance bridge span crossing Mithi river and mangrove sanctuary.', 'TRANSPORT', 'River Viaduct Bridge', 'ACTIVE', 'ACTIVE', 'FAIR', 'HIGH', 'BMC Bridges Department', 'Satish Thosar (Chief Eng Bridges)', 58000000, 44000000, 40, 'JVLR Crossing, Powai East', 19.1285, 72.8942, 73, 42);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-009', 'ast-trn-009', 'River Viaduct Bridge', 820, 6, 70, 82000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-010', 'TRN-000010', 'Marine Drive Coastal Sea-Wall Promenade & Lights', 'Heritage 3.6km tetrapod-protected coastal roadway with 1200 LED lamp poles.', 'TRANSPORT', 'Coastal Promenade Roadway', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'BMC Coastal Road Wing', 'M. S. Swami (Coastal Chief Eng)', 42000000, 36000000, 50, 'Netaji Subhash Chandra Bose Road, Mumbai', 18.9432, 72.8231, 86, 21);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-010', 'ast-trn-010', 'Coastal Promenade Roadway', 3600, 6, 50, 65000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-001', 'ELC-000001', 'Powai 220kV/33kV Step-Down Distribution Transformer #2', 'Critical primary transformer directly supplying the Powai Water Pumping Station, Data Center, and Hospital emergency feed.', 'ELECTRICAL', 'Heavy Power Transformer (220kV/33kV)', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'Maharashtra State Electricity Transmission (MSETCL)', 'K. S. Narayanan (Chief Executive Eng Transmission)', 58000000, 49000000, 30, 'MSETCL Substation Yard, Powai, Mumbai', 19.1221, 72.9094, 84, 25);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-001', 'ast-elc-001', 'Heavy Power Transformer (220kV/33kV)', 220, 100000, 'Bharat Heavy Electricals Ltd (BHEL)', 'BHEL-TR-220-100MVA', 52, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-002', 'ELC-000002', 'Bandra-Kurla Complex 33kV/11kV Substation Unit 1', 'Gas-Insulated Substation (GIS) powering financial exchange buildings and hospitals.', 'ELECTRICAL', 'Gas Insulated Substation (GIS)', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Adani Electricity Mumbai Ltd (AEML)', 'Kandarp Patel (MD & CEO Adani Electricity)', 92000000, 84000000, 35, 'C-59, G Block, BKC, Mumbai', 19.0622, 72.8661, 94, 12);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-002', 'ast-elc-002', 'Gas Insulated Substation (GIS)', 33, 40000, 'Siemens Energy India', '8DN8-GIS-33kV', 38, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-003', 'ELC-000003', 'Bhandup Water Treatment 33kV Dedicated Power Substation', 'Redundant dual-source electrical feed driving high-capacity 2800 MLD water pumps.', 'ELECTRICAL', 'Industrial Dedicated Substation', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'Tata Power Transmission & Distribution', 'Pravir Sinha (CEO & MD Tata Power)', 62000000, 54000000, 30, 'Bhandup Complex East Yard', 19.1465, 72.9362, 88, 19);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-003', 'ast-elc-003', 'Industrial Dedicated Substation', 33, 50000, 'ABB India Ltd', 'ABB-REB-670', 44, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-004', 'ELC-000004', 'CSMT Heritage Zone 11kV Compact Underground Transformer', 'Dry-type flame retardant transformer vault buried beneath civic plaza.', 'ELECTRICAL', 'Dry-Type Cast Resin Transformer', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'BEST Undertaking Power Supply', 'Lokesh Chandra (General Manager BEST)', 24000000, 19000000, 25, 'Dr DN Road, Fort, Mumbai', 18.9412, 72.8348, 85, 23);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-004', 'ast-elc-004', 'Dry-Type Cast Resin Transformer', 11, 1600, 'Schneider Electric India', 'Trihal-1600kVA', 48, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-005', 'ELC-000005', 'Vikhroli 400kV High Voltage Grid Intertie Station', 'Major grid interchange connecting national grid into Mumbai Islanding Scheme.', 'ELECTRICAL', 'Ultra High Voltage Intertie', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'MSETCL Transmission Division', 'Dinesh Waghmare (CMD MSETCL)', 380000000, 360000000, 40, 'LBS Marg, Vikhroli West', 19.1082, 72.9198, 96, 10);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-005', 'ast-elc-005', 'Ultra High Voltage Intertie', 400, 500000, 'Alstom Grid / GE T&D India', 'T155-400kV', 41, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-006', 'ELC-000006', 'Worli Seaface 11kV Distribution Panel & Feeder Ring', 'Ring Main Unit (RMU) distributing power to high-tide pumping stations.', 'ELECTRICAL', 'Ring Main Unit (RMU)', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'BEST Undertaking', 'Suresh Patil (Divisional Eng)', 18000000, 14000000, 25, 'Worli Seaface South, Mumbai', 19.0098, 72.8166, 86, 22);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-006', 'ast-elc-006', 'Ring Main Unit (RMU)', 11, 2500, 'Larsen & Toubro (L&T Electrical)', 'L&T-RMU-24kV', 42, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-007', 'ELC-000007', 'AIIMS Hospital Dedicated 1500kVA DG Emergency Substation', 'Automatic Mains Failure (AMF) emergency generator array powering OT and ICU.', 'ELECTRICAL', 'Diesel Generator Backup Substation', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Hospital Biomedical Engineering', 'Col. Sanjeev Kumar (Chief Bio-Eng)', 34000000, 31000000, 20, 'AIIMS Complex Utility Quad, BKC', 19.0664, 72.8692, 93, 13);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-007', 'ast-elc-007', 'Diesel Generator Backup Substation', 0.415, 1500, 'Cummins India Ltd', 'QSK60-G4-AMF', 36, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-008', 'ELC-000008', 'Thane MIDC Industrial 66kV Transformer Bank A', 'Heavy industrial power supply feeding chemical manufacturing plants.', 'ELECTRICAL', 'Industrial Substation Transformer', 'ACTIVE', 'UNDER_INSPECTION', 'FAIR', 'HIGH', 'MSEDCL Distribution', 'V. R. Shinde (Superintending Eng)', 44000000, 33000000, 30, 'Wagle Industrial Estate, Thane West', 19.1852, 72.9512, 74, 42);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-008', 'ast-elc-008', 'Industrial Substation Transformer', 66, 25000, 'Crompton Greaves (CG Power)', 'CG-66-25MVA', 58, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-009', 'ELC-000009', 'Marine Drive 33kV Coastal Substation & Street Feeder', 'Corrosion-resistant switchgear vault delivering street lighting and water pressure power.', 'ELECTRICAL', 'Coastal Switchgear Substation', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'BEST Undertaking', 'Prashant More (Area Supt)', 26000000, 21000000, 30, 'Churchgate Seafront, Mumbai', 18.9328, 72.8258, 84, 24);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-009', 'ast-elc-009', 'Coastal Switchgear Substation', 33, 12000, 'Schneider Electric', 'Premset-24kV', 40, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-010', 'ELC-000010', 'Bandra-Worli Sea Link SCADA Toll & Power Distribution Unit', 'Dedicated uninterruptible power supply for toll plazas, bridge sensors and aviation lighting.', 'ELECTRICAL', 'Toll & Marine Lighting Substation', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'MSRDC Electrical Division', 'Sunil Patil (Executive Eng)', 28000000, 25000000, 25, 'Bandra Toll Plaza, Sea Link', 19.0418, 72.8251, 92, 15);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-010', 'ast-elc-010', 'Toll & Marine Lighting Substation', 11, 3500, 'ABB India Ltd', 'UniGear-12kV', 35, 'OPTIMAL');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-001', 'ast-elc-001', 'ast-bld-005', 'SUPPLIES', 'CRITICAL', 'Direct dual HT feed to Powai Data Center');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-002', 'ast-elc-001', 'ast-wtr-002', 'SUPPLIES', 'CRITICAL', 'Main electrical supply driving raw water lake intake pumps');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-003', 'ast-elc-001', 'ast-bld-001', 'SERVES', 'HIGH', 'Feeds primary grid supply to AIIMS Multi-Specialty Hospital');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-004', 'ast-elc-001', 'ast-trn-009', 'SUPPLIES', 'MEDIUM', 'Provides power to JVLR bridge smart signals and illumination');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-005', 'ast-wtr-004', 'ast-wtr-001', 'CONNECTS_TO', 'CRITICAL', 'Vaitarna trunk aqueduct feeds raw water into Bhandup treatment plant');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-006', 'ast-wtr-001', 'ast-wtr-003', 'SUPPLIES', 'CRITICAL', 'Treated water pumped from Bhandup to Malabar Hill reservoir');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-007', 'ast-wtr-003', 'ast-bld-002', 'SERVES', 'HIGH', 'Gravity water distribution from Malabar Hill to Municipal HQ');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-008', 'ast-wtr-001', 'ast-wtr-007', 'SUPPLIES', 'HIGH', 'Feeds Ghatkopar high storage reservoir');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-009', 'ast-wtr-007', 'ast-wtr-008', 'SUPPLIES', 'HIGH', 'Feeds Dharavi distribution main');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-010', 'ast-elc-005', 'ast-elc-001', 'SUPPLIES', 'CRITICAL', 'Vikhroli 400kV Grid intertie steps down into Powai 220kV substation');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-011', 'ast-elc-002', 'ast-bld-001', 'SUPPLIES', 'CRITICAL', 'BKC Substation provides primary 33kV commercial feed to AIIMS');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-012', 'ast-elc-007', 'ast-bld-001', 'PROTECTS', 'CRITICAL', 'Emergency AMF DG sets provide instant failover backup to ICU wards');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-013', 'ast-elc-010', 'ast-trn-001', 'PROTECTS', 'HIGH', 'Powers Sea Link aviation obstruction lights, lane cameras and toll gates');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-014', 'ast-elc-003', 'ast-wtr-001', 'SUPPLIES', 'CRITICAL', 'Dedicated 33kV feeder keeps Bhandup filtration online 24x7');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-015', 'ast-elc-006', 'ast-wtr-006', 'SUPPLIES', 'HIGH', 'Worli feeder drives stormwater sea-wall pumps during monsoons');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-016', 'ast-bld-003', 'ast-trn-004', 'SERVES', 'HIGH', 'Disaster bunker monitors structural vibration sensors on Sion ROB');
