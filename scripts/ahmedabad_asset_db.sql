
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
('user-admin-001', 'admin@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Chief City Infrastructure Officer (Admin)', 'ADMIN', 'Ahmedabad Municipal Corporation (AMC)'),
('user-mgr-002', 'asset.manager@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Hiren Patel (Asset Planning Lead)', 'ASSET_MANAGER', 'AMC Urban Development Authority'),
('user-insp-003', 'inspector@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Bhavik Shah (Field Auditor & Safety)', 'INSPECTOR', 'Quality & Structural Safety Wing'),
('user-maint-004', 'maintenance@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Dhaval Trivedi (Public Works Lead)', 'MAINTENANCE_MANAGER', 'Engineering & Public Works'),
('user-view-005', 'viewer@infrasphere.local', '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve', 'Neha Joshi (Public Oversight & Citizen Audit)', 'VIEWER', 'Civic Transparency Directorate');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-001', 'BLD-000001', 'Ahmedabad Civil Hospital & Multi-Specialty Trauma Center', 'Largest tertiary healthcare and trauma emergency complex in Asia serving 2.5M population.', 'BUILDINGS', 'Government Super-Speciality Hospital', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Gujarat Health & Family Welfare Department', 'Dr. Rakesh Joshi (Medical Superintendent)', 145000000, 138000000, 50, 'Asarwa, Ahmedabad', 23.0532, 72.6033, 94, 12);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-001', 'ast-bld-001', 'Government Super-Speciality Hospital', 12, 42000, 3200, 2021, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-002', 'BLD-000002', 'AMC Danapith Municipal Secretariat & Command Center', 'Central municipal governance, smart city integrated command and disaster management HQ.', 'BUILDINGS', 'Municipal Administration Secretariat', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Ahmedabad Municipal Corporation', 'M. Thennarasan (Municipal Commissioner)', 85000000, 74000000, 60, 'Danapith, Khadia, Ahmedabad', 23.0245, 72.5878, 86, 22);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-002', 'ast-bld-002', 'Municipal Administration Secretariat', 8, 18500, 950, 2018, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-003', 'BLD-000003', 'Gujarat High Court Judicial Complex', 'Apex judicial headquarters for Gujarat State with supreme security, data vaults and courtrooms.', 'BUILDINGS', 'Judicial Secretariat', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'High Court of Gujarat Registry', 'Chief Judicial Registrar', 120000000, 105000000, 75, 'Sola, SG Highway, Ahmedabad', 23.0825, 72.5284, 91, 14);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-003', 'ast-bld-003', 'Judicial Secretariat', 7, 36000, 1800, 2017, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-004', 'BLD-000004', 'IIM Ahmedabad Heritage Academic Campus', 'Premier national educational institution campus with heritage architectural red-brick structures.', 'BUILDINGS', 'Premier Educational Campus', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'IIM-A Board of Governors', 'Dean of Infrastructure & Estate', 95000000, 82000000, 70, 'Vastrapur, Ahmedabad', 23.0328, 72.5312, 84, 25);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-004', 'ast-bld-004', 'Premier Educational Campus', 4, 25000, 1200, 2012, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-005', 'BLD-000005', 'Sardar Vallabhbhai Patel (SVP) Institute of Medical Sciences', '1500-bed ultra-modern municipal paperless super-speciality hospital with air ambulance rooftop pad.', 'BUILDINGS', 'Super-Specialty Municipal Hospital', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'AMC Medical Education Trust', 'Dr. Saurabh Patel (Director)', 175000000, 165000000, 50, 'Ellisbridge, Riverfront, Ahmedabad', 23.0221, 72.5701, 96, 10);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-005', 'ast-bld-005', 'Super-Specialty Municipal Hospital', 17, 55000, 4000, 2019, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-006', 'BLD-000006', 'Gujarat Science City Robotics & Aerospace Gallery', 'Public state scientific exploration center, dome planetarium and advanced technology labs.', 'BUILDINGS', 'Public Scientific Exhibition Complex', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'MEDIUM', 'Gujarat Council of Science City', 'Executive Director (Science City)', 65000000, 59000000, 40, 'Science City Road, Ahmedabad', 23.0768, 72.4975, 93, 16);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-006', 'ast-bld-006', 'Public Scientific Exhibition Complex', 4, 19500, 1500, 2021, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-007', 'BLD-000007', 'Sabarmati Riverfront Development House', 'Central control room and promenade operations headquarters managing 11km riverfront infrastructure.', 'BUILDINGS', 'Riverfront Operational Secretariat', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Sabarmati Riverfront Development Corp Ltd (SRFDCL)', 'Managing Director (SRFDCL)', 45000000, 39000000, 50, 'Ashram Road, West Promenade, Ahmedabad', 23.0392, 72.5746, 87, 21);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-007', 'ast-bld-007', 'Riverfront Operational Secretariat', 5, 12000, 450, 2016, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-008', 'BLD-000008', 'Ahmedabad Central Inter-State Bus Port (Geeta Mandir)', 'Public transport hub with 18 bays handling 1500 buses daily and integrated commercial transit concourse.', 'BUILDINGS', 'Multi-Modal Bus Terminal', 'ACTIVE', 'ACTIVE', 'FAIR', 'HIGH', 'GSRTC & Ahmedabad Urban Transport', 'Divisional Controller (GSRTC Central)', 55000000, 44000000, 40, 'Geeta Mandir, Astodia, Ahmedabad', 23.0116, 72.5934, 72, 36);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-008', 'ast-bld-008', 'Multi-Modal Bus Terminal', 4, 22000, 3500, 2015, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-009', 'BLD-000009', 'Gujarat University Administrative Bhavan', 'Higher educational administration building coordinating 300+ affiliated colleges across Gujarat.', 'BUILDINGS', 'University Administrative Bhavan', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'Gujarat University Senate', 'Registrar (Gujarat University)', 42000000, 33000000, 50, 'Navrangpura, Ahmedabad', 23.0366, 72.5458, 81, 26);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-009', 'ast-bld-009', 'University Administrative Bhavan', 5, 16000, 800, 2011, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-bld-010', 'BLD-000010', 'GIDC Vatva Industrial Command & Environmental Center', 'Industrial environmental monitoring station and emergency toxic gas containment headquarters.', 'BUILDINGS', 'Industrial Estate Disaster Command', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'Gujarat Industrial Development Corporation', 'Estate Manager (GIDC Vatva)', 38000000, 31000000, 40, 'Phase IV, GIDC Vatva, Ahmedabad', 22.9648, 72.6358, 85, 28);
INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus") VALUES
('bd-ast-bld-010', 'ast-bld-010', 'Industrial Estate Disaster Command', 3, 9500, 300, 2017, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-001', 'WTR-000001', 'Kotarpur Water Treatment Plant (650 MLD)', 'Primary municipal surface water purification complex treating Narmada canal bulk water for 40% of Ahmedabad.', 'WATER', 'Surface Water Treatment Plant', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'AMC Water Resources & Supply Dept', 'P. K. Goswami (Chief Hydraulic Engineer)', 95000000, 88000000, 40, 'Kotarpur, Sabarmati Riverfront, Ahmedabad', 23.0894, 72.6258, 93, 14);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-001', 'ast-wtr-001', 'Surface Water Treatment Plant', 650000000, 7500, 5.5, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-002', 'WTR-000002', 'Jaspur Water Treatment & Supply Complex (400 MLD)', 'Major western quadrant water treatment facility supplying SG Highway, Chandkheda, and Motera zones.', 'WATER', 'Surface Water Treatment Plant', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'AMC Water Supply Directorate', 'Harish Makwana (Superintending Engineer)', 78000000, 71000000, 35, 'Jaspur-Chandkheda Link Road, Ahmedabad', 23.1362, 72.5631, 88, 20);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-002', 'ast-wtr-002', 'Surface Water Treatment Plant', 400000000, 4600, 5.2, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-003', 'WTR-000003', 'French Well Sub-Surface Sabarmati River Intake Station', 'Radial collector well capturing natural alluvial aquifer filtered water beneath the Sabarmati riverbed.', 'WATER', 'Radial Collector Intake Well', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'AMC Water Supply Directorate', 'R. K. Dave (Hydraulic Executive)', 32000000, 27000000, 30, 'Dudheshwar Waterworks, Ahmedabad', 23.0518, 72.5772, 85, 24);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-003', 'ast-wtr-003', 'Radial Collector Intake Well', 120000000, 1800, 4.8, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-004', 'WTR-000004', 'Vastrapur High-Pressure Underground Water Reservoir', '40 ML capacity subterranean storage balancing western zone peak morning water demand.', 'WATER', 'Underground Balancing Reservoir (UGR)', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'AMC West Zone Engineering', 'Ketan Pandya (Zonal Water Engineer)', 28000000, 25000000, 50, 'Vastrapur Lake Road, Ahmedabad', 23.0354, 72.5298, 91, 16);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-004', 'ast-wtr-004', 'Underground Balancing Reservoir (UGR)', 40000000, 850, 4.2, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-005', 'WTR-000005', 'Bodakdev Master Water Distribution & Pumping Station', 'Quadruple 350kW centrifugal pumps supplying treated water to Bodakdev, Judges Bungalow, and Satellite wards.', 'WATER', 'Zonal Booster Pumping Station', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'AMC New West Zone', 'Suresh Prajapati (Junior Engineer)', 22000000, 18500000, 25, 'Bodakdev Near Pakwan Crossing, Ahmedabad', 23.0425, 72.5165, 86, 22);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-005', 'ast-wtr-005', 'Zonal Booster Pumping Station', 25000000, 650, 4.5, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-006', 'WTR-000006', 'Kankaria South Elevated Service Water Tank', 'Reinforced concrete staging overhead reservoir serving Maninagar and South Ahmedabad wards.', 'WATER', 'Elevated Service Reservoir (ESR)', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'AMC South Zone Water Supply', 'Dinesh Solanki (Maintenance Supervisor)', 15000000, 12000000, 50, 'Kankaria Gate 3, Maninagar, Ahmedabad', 23.0062, 72.6025, 83, 26);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-006', 'ast-wtr-006', 'Elevated Service Reservoir (ESR)', 8500000, 350, 3.8, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-007', 'WTR-000007', 'Naroda GIDC Heavy Booster Sump & Distribution Unit', 'Heavy industrial grade water supply booster catering to manufacturing, pharma and metal processing clusters.', 'WATER', 'Industrial Booster Pumping Station', 'ACTIVE', 'ACTIVE', 'FAIR', 'HIGH', 'GIDC Water Infrastructure', 'Manoj Parmar (Assistant Engineer)', 19500000, 14800000, 25, 'Road No. 12, GIDC Naroda, Ahmedabad', 23.0742, 72.6582, 74, 38);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-007', 'ast-wtr-007', 'Industrial Booster Pumping Station', 18000000, 500, 4, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-008', 'WTR-000008', 'Pirana 180 MLD Sewage Treatment & Bioremediation Plant', 'Sequential batch reactor STP treating urban municipal wastewater before discharge into downstream Sabarmati.', 'WATER', 'Biological Sewage Treatment Plant', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'AMC Drainage & Sewerage Project', 'B. S. Rabari (Project Director)', 65000000, 57000000, 30, 'Pirana Road, South Sabarmati Bank, Ahmedabad', 22.9815, 72.5684, 84, 27);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-008', 'ast-wtr-008', 'Biological Sewage Treatment Plant', 180000000, 2100, 3, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-009', 'WTR-000009', 'Bopal-Ghuma 1200mm Bulk Transmission Ductile Iron Pipeline', '14.5km primary feeder transmission main carrying potable water from Jaspur WTP to rapid growth western suburbs.', 'WATER', 'Ductile Iron Bulk Transmission Main', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'AUDA & AMC Joint Water Project', 'Tarun Vaghela (Pipeline Superintendent)', 38000000, 35000000, 40, 'South Bopal Ring Road Junction, Ahmedabad', 23.0285, 72.4682, 92, 15);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-009', 'ast-wtr-009', 'Ductile Iron Bulk Transmission Main', 90000000, 1100, 4.8, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-wtr-010', 'WTR-000010', 'Sabarmati Riverfront Circulation & Promenade Irrigation Sump', 'Automated reclaimed water filtration and drip irrigation network servicing 11km riverfront flower gardens.', 'WATER', 'Recycled Water Circulation Network', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'SRFDCL Horticulture Wing', 'Girish Rawal (Horticulture Officer)', 16000000, 13500000, 25, 'Riverfront West Promenade near Subhash Bridge, Ahmedabad', 23.0315, 72.5731, 87, 19);
INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus") VALUES
('wd-ast-wtr-010', 'ast-wtr-010', 'Recycled Water Circulation Network', 5000000, 220, 3.5, 'NORMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-001', 'TRN-000001', 'Atal Pedestrian Suspension Bridge', 'Iconic 300m steel truss pedestrian bridge connecting east and west promenades with kite-inspired architecture.', 'TRANSPORT', 'Cable Stayed Pedestrian Truss Bridge', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Sabarmati Riverfront Development Corp', 'Vipul Patel (Chief Structural Engineer)', 74000000, 71000000, 60, 'Sabarmati Riverfront West, Ahmedabad', 23.0274, 72.5742, 96, 9);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-001', 'ast-trn-001', 'Cable Stayed Pedestrian Truss Bridge', 300, 0, 120, 25000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-002', 'TRN-000002', 'Ellis Bridge Historic River Crossing Structure', 'Historic 1892 bowstring arch bridge with modern parallel vehicular spans linking Old City to Modern Ahmedabad.', 'TRANSPORT', 'Steel Truss & Concrete Composite Bridge', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'AMC Bridge Engineering Division', 'K. R. Barot (Senior Bridge Engineer)', 48000000, 38000000, 80, 'Ellisbridge Crossing, Sabarmati, Ahmedabad', 23.0232, 72.5721, 82, 28);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-002', 'ast-trn-002', 'Steel Truss & Concrete Composite Bridge', 420, 4, 40, 85000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-003', 'TRN-000003', 'Nehru Bridge Major Arterial Crossway', 'Post-tensioned RCC cantilever box girder carrying heavy traffic between Ashram Road and Lal Darwaja.', 'TRANSPORT', 'Prestressed Concrete Box Girder Bridge', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'AMC Bridge Project Wing', 'Jignesh Patel (Project Executive)', 52000000, 41000000, 60, 'Ashram Road to Rupali Cinema, Ahmedabad', 23.0298, 72.5786, 85, 24);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-003', 'ast-trn-003', 'Prestressed Concrete Box Girder Bridge', 380, 6, 65, 110000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-004', 'TRN-000004', 'Sardar Patel Ring Road West Expressway (SPRR)', '76km peripheral 6-lane toll expressway diverting intercity freight traffic around Ahmedabad metropolis.', 'TRANSPORT', 'High-Speed Peripheral Expressway', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'AUDA Road Infrastructure Division', 'Executive Engineer (AUDA Roads)', 165000000, 148000000, 40, 'Bopal - Shilaj Crossing, SPRR, Ahmedabad', 23.052, 72.4625, 93, 13);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-004', 'ast-trn-004', 'High-Speed Peripheral Expressway', 12500, 6, 90, 140000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-005', 'TRN-000005', 'SG Highway 6-Lane Elevated Flyover Corridor', 'Continuous elevated viaduct reducing congestion across Thaltej, Pakwan, and Iskcon commercial intersections.', 'TRANSPORT', 'Prestressed Elevated Viaduct', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'National Highways & Gujarat R&B Dept', 'S. N. Vankar (Executive Engineer NH)', 135000000, 122000000, 50, 'Thaltej-Pakwan Junction, SG Highway, Ahmedabad', 23.0485, 72.5182, 89, 18);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-005', 'ast-trn-005', 'Prestressed Elevated Viaduct', 4100, 6, 75, 165000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-006', 'TRN-000006', 'Shivranjani - IIM Janmarg BRTS Dedicated Transit Corridor', 'Dedicated median bus rapid transit corridor with smart automated fare gates and GPS real-time bus tracking.', 'TRANSPORT', 'Dedicated Bus Rapid Transit (BRTS)', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'Ahmedabad Janmarg Limited (AJL)', 'General Manager (AJL Operations)', 32000000, 26000000, 30, 'Shivranjani Cross Roads, Satellite, Ahmedabad', 23.0258, 72.5325, 84, 25);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-006', 'ast-trn-006', 'Dedicated Bus Rapid Transit (BRTS)', 3200, 2, 35, 65000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-007', 'TRN-000007', 'Kalupur Multi-Modal Railway Interchange & Bullet Train Terminal', 'Central junction integrating Western Railway, Ahmedabad Metro, BRTS, and upcoming High Speed Rail (MAHSR).', 'TRANSPORT', 'Multi-Modal Railway Transit Terminal', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'Indian Railways & GMRC', 'Divisional Railway Manager (Western Railway)', 210000000, 198000000, 75, 'Kalupur Station Square, Ahmedabad', 23.0289, 72.6008, 88, 19);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-007', 'ast-trn-007', 'Multi-Modal Railway Transit Terminal', 850, 12, 120, 220000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-008', 'TRN-000008', 'Motera Narendra Modi Stadium Metro Station & Skywalk', 'Elevated rapid transit terminal designed to evacuate 130,000 stadium spectators with dedicated skywalk.', 'TRANSPORT', 'Elevated Rapid Transit Metro Station', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'Gujarat Metro Rail Corporation (GMRC)', 'Chief Operating Officer (GMRC)', 88000000, 82000000, 50, 'Motera Stadium Road, Sabarmati, Ahmedabad', 23.0915, 72.5972, 94, 11);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-008', 'ast-trn-008', 'Elevated Rapid Transit Metro Station', 450, 2, 50, 75000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-009', 'TRN-000009', 'Sindhu Bhavan Road Smart Boulevard & Adaptive Traffic Network', 'Prime 4.2km commercial corridor featuring smart adaptive signalization, underground utility ducts and LED lighting.', 'TRANSPORT', 'Smart Urban Arterial Boulevard', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'MEDIUM', 'AMC Smart City Development Ltd', 'Zonal Traffic Executive', 45000000, 41000000, 30, 'Sindhu Bhavan Road, Bodakdev, Ahmedabad', 23.0421, 72.4965, 93, 13);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-009', 'ast-trn-009', 'Smart Urban Arterial Boulevard', 4200, 6, 45, 92000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-trn-010', 'TRN-000010', 'Subhash Bridge Airport Corridor Interchange Flyover', 'Multi-level vehicular flyover separating RTO, Sabarmati Ashram tourists and Ahmedabad International Airport traffic.', 'TRANSPORT', 'Multi-Arm Grade Separator Flyover', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'AMC Bridge Engineering Division', 'Nitin Bhatt (Bridge Inspector)', 58000000, 47000000, 50, 'Subhash Bridge Circle, Sabarmati, Ahmedabad', 23.0645, 72.5842, 86, 23);
INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay") VALUES
('td-ast-trn-010', 'ast-trn-010', 'Multi-Arm Grade Separator Flyover', 920, 4, 60, 98000);

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-001', 'ELC-000001', 'Torrent Power 220kV Master Grid Substation (Sabarmati)', 'Central high-voltage transmission & bulk transformation hub energizing northern Ahmedabad and riverfront grid.', 'ELECTRICAL', 'High-Voltage Grid Substation (220kV)', 'ACTIVE', 'ACTIVE', 'GOOD', 'CRITICAL', 'Torrent Power Transmission Division', 'Nilesh Gandhi (Chief Grid Operations)', 65000000, 58000000, 35, 'Sabarmati Power Station Enclave, Ahmedabad', 23.0784, 72.5862, 87, 21);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-001', 'ast-elc-001', 'High-Voltage Grid Substation (220kV)', 220, 350000, 'Siemens India Ltd', 'SMR-220-GIS-Series', 64.2, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-002', 'ELC-000002', 'Bodakdev 66/11kV Distribution Power Substation', 'Major primary stepping-down substation feeding SG Highway corporate high-rises and residential colonies.', 'ELECTRICAL', 'Primary Stepping-Down Substation', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'HIGH', 'Torrent Power Distribution West', 'Rohan Mehra (Substation Engineer)', 28000000, 25000000, 30, 'Bodakdev Near Judges Bungalow, Ahmedabad', 23.0412, 72.5215, 92, 15);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-002', 'ast-elc-002', 'Primary Stepping-Down Substation', 66, 90000, 'ABB Power Grids India', 'SafeRing-66kV', 52.8, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-003', 'ELC-000003', 'Prahlad Nagar Commercial Step-Down Transformer Bank', 'High-density pad-mounted 11kV/415V step-down transformer cluster powering IT ITES offices and corporate centers.', 'ELECTRICAL', 'Pad-Mounted Distribution Transformer', 'ACTIVE', 'ACTIVE', 'GOOD', 'MEDIUM', 'Torrent Power Urban Maintenance', 'Girish Joshi (Distribution Engineer)', 7500000, 6200000, 25, 'Prahlad Nagar Corporate Road, Ahmedabad', 23.0118, 72.5085, 88, 18);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-003', 'ast-elc-003', 'Pad-Mounted Distribution Transformer', 11, 2500, 'Schneider Electric', 'Trihal Dry Cast-Resin', 56.4, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-004', 'ELC-000004', 'Ahmedabad Metro Line 1 Traction Power Substation (TSS)', 'Dedicated 25kV AC overhead catenary traction power supply for Metro East-West corridor trains.', 'ELECTRICAL', 'Metro Rail Traction Power Substation', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'GMRC Electrical & Traction Directorate', 'Vikas Sharma (Director Rolling Stock & Power)', 42000000, 39000000, 35, 'Apparel Park Depot, Khokhra, Ahmedabad', 23.0142, 72.6145, 94, 12);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-004', 'ast-elc-004', 'Metro Rail Traction Power Substation', 25, 45000, 'Alstom Transport India', 'HES-25kV-MetroTraction', 48.6, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-005', 'ELC-000005', 'Sabarmati Solar Rooftop & Renewable Injection Hub', 'Microgrid synchronous inverter hub combining 12MW distributed canal-top and rooftop solar generation.', 'ELECTRICAL', 'Renewable Solar Injection Hub', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'MEDIUM', 'Gujarat Energy Development Agency (GEDA)', 'Anil Vyas (Solar Systems Engineer)', 18500000, 16800000, 25, 'Sabarmati D-Cabin Solar Yard, Ahmedabad', 23.0825, 72.5912, 93, 14);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-005', 'ast-elc-005', 'Renewable Solar Injection Hub', 11, 12000, 'Delta Electronics', 'M125HV-GridTied', 45.2, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-006', 'ELC-000006', 'GIDC Naroda Heavy Industrial Distribution Transformer T-4', 'Oil-immersed heavy power transformer supporting continuous dye chemical synthesis reactors.', 'ELECTRICAL', 'Industrial Oil-Immersed Power Transformer', 'ACTIVE', 'ACTIVE', 'FAIR', 'HIGH', 'UGVCL / GIDC Industrial Grid', 'Pravin Modi (Industrial Electrical Inspector)', 12000000, 8800000, 25, 'Phase 2, GIDC Naroda, Ahmedabad', 23.0785, 72.6621, 73, 39);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-006', 'ast-elc-006', 'Industrial Oil-Immersed Power Transformer', 22, 6300, 'Bharat Bijlee', 'ONAN-22kV-Heavy', 72.5, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-007', 'ELC-000007', 'GIFT City Interconnection Power Feeder Switching Station', 'Dual-circuit redundant 66kV transmission feeder interconnecting Northern Ahmedabad with GIFT Financial Hub.', 'ELECTRICAL', 'Redundant Inter-Grid Switching Station', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'Gujarat Energy Transmission Corp (GETCO)', 'Ashok Rao (Superintending Engineer)', 38000000, 35000000, 40, 'Zundal - Chandkheda Bypass, Ahmedabad', 23.1185, 72.5832, 95, 11);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-007', 'ast-elc-007', 'Redundant Inter-Grid Switching Station', 66, 120000, 'L&T Electrical & Automation', 'GIS-Dual-Busbar-66', 50.1, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-008', 'ELC-000008', 'Science City 11kV Underground Captive Transformer Unit', 'Underground compact substation providing uninterruptible clean power to planetarium lasers and IMAX projection.', 'ELECTRICAL', 'Compact Underground Substation (CSS)', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'MEDIUM', 'Science City Facilities & Power', 'Kavita Dave (Estate Engineer)', 8500000, 7600000, 25, 'Science City Road, Sola, Ahmedabad', 23.0745, 72.4998, 92, 16);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-008', 'ast-elc-008', 'Compact Underground Substation (CSS)', 11, 3150, 'Schneider Electric', 'BIOSCO-CSS-11kV', 49.3, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-009', 'ELC-000009', 'SVP Hospital Dedicated Dual Hospital Feeder Transformer Unit', 'Dual dedicated 11kV transformers with automatic static transfer switch (STS) feeding ICU & surgical theaters.', 'ELECTRICAL', 'Critical Healthcare Substation Unit', 'ACTIVE', 'ACTIVE', 'EXCELLENT', 'CRITICAL', 'AMC SVP Hospital Engineering Works', 'Chief Hospital Electrical Officer', 16000000, 14500000, 30, 'SVP Hospital Basement Power Vault, Ahmedabad', 23.0225, 72.5695, 96, 8);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-009', 'ast-elc-009', 'Critical Healthcare Substation Unit', 11, 5000, 'ABB India Ltd', 'CastResin-CriticalHealth', 47.8, 'OPTIMAL');

INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore") VALUES
('ast-elc-010', 'ELC-000010', 'Sanand - Sarkhej Automotive Heavy Switchyard', 'Heavy 132/33kV industrial transmission switchyard supplying continuous automotive assembly robotics plants.', 'ELECTRICAL', 'Heavy Industrial Transmission Switchyard', 'ACTIVE', 'ACTIVE', 'GOOD', 'HIGH', 'GETCO Transmission Circle', 'Mahesh Patel (Switchyard Manager)', 54000000, 47000000, 35, 'Sarkhej-Bavla Highway, Ahmedabad Outer', 22.9985, 72.4652, 86, 22);
INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus") VALUES
('ed-ast-elc-010', 'ast-elc-010', 'Heavy Industrial Transmission Switchyard', 132, 160000, 'Siemens Energy India', 'AirInsulated-132kV', 58.2, 'OPTIMAL');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-001', 'ast-elc-001', 'ast-bld-001', 'SUPPLIES', 'CRITICAL', 'Torrent Power Master Substation provides 220kV primary grid feed to Civil Hospital & Trauma Center');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-002', 'ast-elc-001', 'ast-bld-005', 'SUPPLIES', 'CRITICAL', 'Primary power feed to SVP Super-Speciality Hospital');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-003', 'ast-elc-001', 'ast-wtr-001', 'SUPPLIES', 'CRITICAL', 'Power feed to Kotarpur Water Treatment Plant high-lift pumps (650 MLD)');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-004', 'ast-elc-001', 'ast-trn-008', 'SUPPLIES', 'HIGH', 'Power feed to Motera Metro Station and Stadium Transit Hub');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-005', 'ast-elc-001', 'ast-elc-002', 'SUPPLIES', 'CRITICAL', '220kV to 66kV transmission interconnect to Bodakdev primary substation');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-006', 'ast-elc-002', 'ast-trn-005', 'SUPPLIES', 'HIGH', 'Power supply to SG Highway Elevated Corridor intelligent lighting and CCTV network');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-007', 'ast-elc-002', 'ast-bld-004', 'SUPPLIES', 'MEDIUM', 'Electricity supply to IIM Ahmedabad Heritage Campus');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-008', 'ast-elc-002', 'ast-wtr-005', 'SUPPLIES', 'CRITICAL', 'Powers Bodakdev master water distribution pumping station');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-009', 'ast-wtr-001', 'ast-bld-001', 'SUPPLIES', 'CRITICAL', 'Kotarpur WTP provides treated potable water pipeline to Civil Hospital');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-010', 'ast-wtr-001', 'ast-wtr-004', 'SUPPLIES', 'HIGH', 'Bulk water supply to Vastrapur Underground Reservoir');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-011', 'ast-wtr-004', 'ast-bld-004', 'SUPPLIES', 'MEDIUM', 'Water distribution to IIM Ahmedabad campus');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-012', 'ast-elc-009', 'ast-bld-005', 'PROTECTS', 'CRITICAL', 'Dedicated dual hospital transformer protects SVP Hospital Intensive Care Units');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-013', 'ast-trn-001', 'ast-bld-007', 'CONNECTS_TO', 'HIGH', 'Atal Bridge west landing connects directly to Riverfront Development House');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-014', 'ast-elc-004', 'ast-trn-007', 'SUPPLIES', 'CRITICAL', 'Metro traction substation powers passenger lines through Kalupur Interchange');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-015', 'ast-wtr-002', 'ast-wtr-009', 'SUPPLIES', 'HIGH', 'Jaspur WTP feeds Bopal-Ghuma 1200mm bulk water transmission pipeline');

INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes") VALUES
('dep-016', 'ast-wtr-003', 'ast-bld-002', 'SUPPLIES', 'HIGH', 'Dudheshwar river water station supplies AMC Danapith Secretariat');
