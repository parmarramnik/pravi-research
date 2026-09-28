import { Client } from 'pg';
import bcrypt from 'bcryptjs';

const PG_HOST = process.env.POSTGRES_HOST || 'localhost';
const PG_PORT = parseInt(process.env.POSTGRES_PORT || '5432', 10);
const PG_USER = process.env.POSTGRES_USER || 'infrasphere';
const PG_PASSWORD = process.env.POSTGRES_PASSWORD || 'infrasphere_secret';

async function getClient(dbName: string) {
  const client = new Client({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASSWORD,
    database: dbName,
  });
  await client.connect();
  return client;
}

export async function runSeed() {
  console.log('--- Starting InfraSphere Realistic Database Seeding ---');

  // 1. SEED ASSET SERVICE (asset_db)
  console.log('Seeding asset_db...');
  const assetClient = await getClient('asset_db');

  // Create tables if not created yet by migration
  await assetClient.query(`
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
  `);

  // Clear existing to avoid duplicate conflicts
  await assetClient.query('TRUNCATE TABLE "AssetDependency", "AssetDocument", "BuildingDetails", "WaterDetails", "TransportDetails", "ElectricalDetails", "Asset", "User" CASCADE');

  // Insert Users
  const passwordHash = bcrypt.hashSync('Infrasphere@2026', 10);
  const users = [
    ['user-admin-001', 'admin@infrasphere.local', passwordHash, 'Chief Infrastructure Officer (Admin)', 'ADMIN', 'Municipal Executive'],
    ['user-mgr-002', 'asset.manager@infrasphere.local', passwordHash, 'Rajesh Sharma (Asset Manager)', 'ASSET_MANAGER', 'Asset Planning'],
    ['user-insp-003', 'inspector@infrasphere.local', passwordHash, 'Pooja Verma (Field Auditor)', 'INSPECTOR', 'Quality & Safety'],
    ['user-maint-004', 'maintenance@infrasphere.local', passwordHash, 'Amitabh Sen (Maintenance Lead)', 'MAINTENANCE_MANAGER', 'Public Works'],
    ['user-view-005', 'viewer@infrasphere.local', passwordHash, 'Ananya Roy (Audit Observer)', 'VIEWER', 'Public Oversight'],
  ];

  for (const u of users) {
    await assetClient.query(
      'INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "department") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
      u
    );
  }

  // 10 BUILDINGS
  const buildings = [
    {
      id: 'ast-bld-001',
      code: 'BLD-000001',
      name: 'AIIMS Multi-Specialty Hospital Block A',
      desc: 'Critical state healthcare emergency and trauma center serving 1.5M population.',
      type: 'Government Super-Speciality Hospital',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'Department of Medical Education & Health',
      resp: 'Dr. V. K. Paul (Medical Director)',
      cost: 125000000,
      val: 118000000,
      life: 50,
      loc: 'Bandra-Kurla Complex, Mumbai',
      lat: 19.0657,
      lng: 72.8685,
      floors: 10,
      area: 28500,
      occ: 1800,
      year: 2021,
      health: 92,
      risk: 15,
    },
    {
      id: 'ast-bld-002',
      code: 'BLD-000002',
      name: 'Brihanmumbai Municipal Corporation HQ',
      desc: 'Central governance, disaster command and civic administration secretariat.',
      type: 'Municipal Administration Secretariat',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'Municipal General Administration',
      resp: 'Iqbal Singh Chahal (Commissioner)',
      cost: 85000000,
      val: 72000000,
      life: 60,
      loc: 'Fort, CSMT Area, Mumbai',
      lat: 18.9405,
      lng: 72.8354,
      floors: 6,
      area: 19200,
      occ: 1200,
      year: 2018,
      health: 84,
      risk: 28,
    },
    {
      id: 'ast-bld-003',
      code: 'BLD-000003',
      name: 'Dadar Central Disaster Management Bunker',
      desc: 'Subterranean flood monitoring and cyclone shelter control facility.',
      type: 'Disaster Relief Command Center',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'Disaster Relief Cell',
      resp: 'S. N. Patil (Chief Resilience Officer)',
      cost: 45000000,
      val: 42000000,
      life: 40,
      loc: 'Dadar West, Mumbai',
      lat: 19.0178,
      lng: 72.8478,
      floors: 3,
      area: 8400,
      occ: 600,
      year: 2022,
      health: 90,
      risk: 18,
    },
    {
      id: 'ast-bld-004',
      code: 'BLD-000004',
      name: 'Thane Central General Civil Hospital',
      desc: 'District level emergency surgical care and blood bank facility.',
      type: 'District Hospital',
      status: 'ACTIVE',
      lifecycle: 'UNDER_INSPECTION',
      condition: 'FAIR',
      crit: 'HIGH',
      dept: 'Public Health Department',
      resp: 'Dr. Kailash Pawar (Civil Surgeon)',
      cost: 65000000,
      val: 51000000,
      life: 40,
      loc: 'Station Road, Thane West',
      lat: 19.1983,
      lng: 72.9781,
      floors: 5,
      area: 14200,
      occ: 950,
      year: 2015,
      health: 68,
      risk: 54,
    },
    {
      id: 'ast-bld-005',
      code: 'BLD-000005',
      name: 'Powai Innovation & Smart City Data Center',
      desc: 'Tier-4 edge computing facility for civic telemetry and IoT SCADA servers.',
      type: 'Mission-Critical Data Center',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'Smart City IT Cell',
      resp: 'Anand Deshmukh (Chief Technology Officer)',
      cost: 95000000,
      val: 88000000,
      life: 25,
      loc: 'Hiranandani, Powai, Mumbai',
      lat: 19.1176,
      lng: 72.9060,
      floors: 4,
      area: 11000,
      occ: 300,
      year: 2023,
      health: 95,
      risk: 12,
    },
    {
      id: 'ast-bld-006',
      code: 'BLD-000006',
      name: 'Bandra Model Higher Secondary School & Shelter',
      desc: 'Public education infrastructure designated as flood safe haven.',
      type: 'Educational & Refuge Complex',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'MEDIUM',
      dept: 'Education Department',
      resp: 'Meenakshi Sundaram (Principal)',
      cost: 28000000,
      val: 22000000,
      life: 45,
      loc: 'Hill Road, Bandra West',
      lat: 19.0544,
      lng: 72.8402,
      floors: 4,
      area: 9200,
      occ: 1500,
      year: 2016,
      health: 80,
      risk: 30,
    },
    {
      id: 'ast-bld-007',
      code: 'BLD-000007',
      name: 'Byculla Regional Cold Storage Vaccine Vault',
      desc: 'Primary state refrigerated immunization preservation depot.',
      type: 'Pharmaceutical Logistics Facility',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'Medical Supplies Corporation',
      resp: 'R. K. Rathore (Depot Supt)',
      cost: 38000000,
      val: 32000000,
      life: 30,
      loc: 'Byculla East, Mumbai',
      lat: 18.9750,
      lng: 72.8335,
      floors: 2,
      area: 6500,
      occ: 120,
      year: 2020,
      health: 85,
      risk: 25,
    },
    {
      id: 'ast-bld-008',
      code: 'BLD-000008',
      name: 'Vashi Agricultural Produce Market Terminal',
      desc: 'State wholesale supply hub feeding metropolitan food requirements.',
      type: 'Commercial Food Logistics Terminal',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'FAIR',
      crit: 'MEDIUM',
      dept: 'Agricultural Marketing Board',
      resp: 'B. S. Kadam (Secretary)',
      cost: 54000000,
      val: 39000000,
      life: 40,
      loc: 'APMC Sector 19, Navi Mumbai',
      lat: 19.0768,
      lng: 73.0039,
      floors: 2,
      area: 35000,
      occ: 4000,
      year: 2012,
      health: 70,
      risk: 42,
    },
    {
      id: 'ast-bld-009',
      code: 'BLD-000009',
      name: 'Worli Regional Fire Brigade Central Station',
      desc: 'Rapid intervention fire suppression, hazardous hazmat and rescue dispatch.',
      type: 'Emergency Services Station',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'Mumbai Fire Services',
      resp: 'Hemant Parab (Chief Fire Officer)',
      cost: 32000000,
      val: 27000000,
      life: 35,
      loc: 'Dr Annie Besant Road, Worli',
      lat: 19.0063,
      lng: 72.8183,
      floors: 3,
      area: 7800,
      occ: 220,
      year: 2019,
      health: 82,
      risk: 26,
    },
    {
      id: 'ast-bld-010',
      code: 'BLD-000010',
      name: 'Pune Collectorate Administrative Tower',
      desc: 'Integrated civil registry, revenue courts and regional emergency operations.',
      type: 'Administrative Headquarters',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'HIGH',
      dept: 'Revenue & District Administration',
      resp: 'Dr. Rajesh Deshmukh (Collector)',
      cost: 72000000,
      val: 68000000,
      life: 50,
      loc: 'Camp Area, Pune, Maharashtra',
      lat: 18.5204,
      lng: 73.8567,
      floors: 7,
      area: 18400,
      occ: 1100,
      year: 2022,
      health: 91,
      risk: 16,
    },
  ];

  for (const b of buildings) {
    await assetClient.query(
      `INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
       VALUES ($1, $2, $3, $4, 'BUILDINGS', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [b.id, b.code, b.name, b.desc, b.type, b.status, b.lifecycle, b.condition, b.crit, b.dept, b.resp, b.cost, b.val, b.life, b.loc, b.lat, b.lng, b.health, b.risk]
    );

    await assetClient.query(
      `INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Dual Dedicated Feeder', 'Full Barrier-Free Access')`,
      [`bd-${b.id}`, b.id, b.type, b.floors, b.area, b.occ, b.year, 'Reinforced Concrete (RCC)', 'Certified Compliant']
    );
  }

  // 10 WATER INFRASTRUCTURE
  const waterAssets = [
    {
      id: 'ast-wtr-001',
      code: 'WTR-000001',
      name: 'Bhandup Primary Water Treatment Complex',
      desc: 'One of Asia largest water purification plants producing 2800 MLD filtered drinking water.',
      type: 'Water Treatment Plant (WTP)',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'CRITICAL',
      dept: 'Hydraulic Engineer Department',
      resp: 'Purushottam Malvade (Chief Hydraulic Eng)',
      cost: 320000000,
      val: 275000000,
      life: 40,
      loc: 'Bhandup Complex, LBS Marg, Mumbai',
      lat: 19.1438,
      lng: 72.9341,
      cap: 2800000000,
      flow: 32400,
      press: 8.5,
      health: 86,
      risk: 22,
    },
    {
      id: 'ast-wtr-002',
      code: 'WTR-000002',
      name: 'Powai Lake Raw Water Pumping Station',
      desc: 'Bulk transfer pumps lifting raw water to secondary chlorination plants.',
      type: 'Pumping Station',
      status: 'ACTIVE',
      lifecycle: 'UNDER_INSPECTION',
      condition: 'FAIR',
      crit: 'HIGH',
      dept: 'Water Supply Project Division',
      resp: 'K. R. Jadhav (Executive Eng Pumps)',
      cost: 48000000,
      val: 38000000,
      life: 25,
      loc: 'Powai Lakefront, Mumbai',
      lat: 19.1245,
      lng: 72.9058,
      cap: 45000000,
      flow: 650,
      press: 6.2,
      health: 72,
      risk: 45,
    },
    {
      id: 'ast-wtr-003',
      code: 'WTR-000003',
      name: 'Malabar Hill Elevated Balancing Reservoir',
      desc: 'Gravity-fed storage reservoir providing water pressure across South Mumbai.',
      type: 'Covered Distribution Reservoir',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'CRITICAL',
      dept: 'Hydraulic Engineer Department',
      resp: 'Vijay Zore (Reservoir Supt)',
      cost: 65000000,
      val: 52000000,
      life: 50,
      loc: 'Ridge Road, Malabar Hill, Mumbai',
      lat: 18.9554,
      lng: 72.8052,
      cap: 147000000,
      flow: 4200,
      press: 4.8,
      health: 82,
      risk: 26,
    },
    {
      id: 'ast-wtr-004',
      code: 'WTR-000004',
      name: 'Vaitarna Trunk Transmission Water Aqueduct',
      desc: '3000mm diameter bulk conveyance steel pipeline connecting dam to treatment.',
      type: 'Transmission Pipeline Aqueduct',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'Bulk Supply Projects',
      resp: 'Mahesh Narvekar (Project Director)',
      cost: 180000000,
      val: 165000000,
      life: 45,
      loc: 'Eastern Corridor, Thane-Mulund Section',
      lat: 19.1726,
      lng: 72.9565,
      cap: 1200000000,
      flow: 18000,
      press: 9.0,
      health: 90,
      risk: 15,
    },
    {
      id: 'ast-wtr-005',
      code: 'WTR-000005',
      name: 'Veravali High-Pressure Distribution Sump & Pump',
      desc: 'Intermediate pressure boosting for Western Suburbs feeder lines.',
      type: 'Distribution Pumping Station',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'Hydraulic Engineer Department',
      resp: 'Ajit Pawar (Operations Lead)',
      cost: 38000000,
      val: 31000000,
      life: 30,
      loc: 'Veravali Hill, Andheri East',
      lat: 19.1298,
      lng: 72.8687,
      cap: 62000000,
      flow: 850,
      press: 7.0,
      health: 84,
      risk: 24,
    },
    {
      id: 'ast-wtr-006',
      code: 'WTR-000006',
      name: 'Worli Seaface Automated Outfall Sump',
      desc: 'Stormwater retention and high-tide reflux flood protection pumping station.',
      type: 'Stormwater Pumping Station',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'HIGH',
      dept: 'Stormwater Drainage Dept',
      resp: 'S. K. Sawant (Drainage Eng)',
      cost: 52000000,
      val: 47000000,
      life: 35,
      loc: 'Worli Sea Face, Mumbai',
      lat: 19.0145,
      lng: 72.8152,
      cap: 18000000,
      flow: 1200,
      press: 3.5,
      health: 89,
      risk: 19,
    },
    {
      id: 'ast-wtr-007',
      code: 'WTR-000007',
      name: 'Ghatkopar High-Level Ground Storage Reservoir',
      desc: 'Dual-compartment concrete reservoir serving Central Suburbs zone.',
      type: 'Ground Storage Reservoir',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'MEDIUM',
      dept: 'Hydraulic Engineer Department',
      resp: 'Deepak Gore (Section Eng)',
      cost: 41000000,
      val: 34000000,
      life: 40,
      loc: 'Ghatkopar East Hills, Mumbai',
      lat: 19.0882,
      lng: 72.9189,
      cap: 85000000,
      flow: 1100,
      press: 5.2,
      health: 81,
      risk: 27,
    },
    {
      id: 'ast-wtr-008',
      code: 'WTR-000008',
      name: 'Dharavi Slum Area Water Distribution Main Valve',
      desc: 'Zone control valve regulating equalized pressure for high-density wards.',
      type: 'Distribution Control Vault',
      status: 'ACTIVE',
      lifecycle: 'UNDER_MAINTENANCE',
      condition: 'FAIR',
      crit: 'HIGH',
      dept: 'Hydraulic Maintenance Cell',
      resp: 'Ramesh Thorat (Maintenance Inspector)',
      cost: 16000000,
      val: 11000000,
      life: 25,
      loc: 'Dharavi Main Road, Mumbai',
      lat: 19.0435,
      lng: 72.8562,
      cap: 12000000,
      flow: 380,
      press: 3.8,
      health: 66,
      risk: 58,
    },
    {
      id: 'ast-wtr-009',
      code: 'WTR-000009',
      name: 'Vihar Dam Raw Intake Sluice Tower',
      desc: 'Historic gravity intake tower with motorized multi-level sluice gates.',
      type: 'Intake Control Structure',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'Water Supply Projects',
      resp: 'Nitin Raut (Dam Safety Officer)',
      cost: 29000000,
      val: 21000000,
      life: 50,
      loc: 'Sanjay Gandhi National Park, Vihar Lake',
      lat: 19.1415,
      lng: 72.9023,
      cap: 92000000,
      flow: 950,
      press: 4.0,
      health: 83,
      risk: 25,
    },
    {
      id: 'ast-wtr-010',
      code: 'WTR-000010',
      name: 'Panvel Creek Subsea Treated Water Intertie',
      desc: 'High-density polyethylene (HDPE) subsea water main to peninsular node.',
      type: 'Subsea Crossing Pipeline',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'HIGH',
      dept: 'CIDCO Water Authority',
      resp: 'K. V. Shinde (CIDCO Chief Eng)',
      cost: 44000000,
      val: 39000000,
      life: 35,
      loc: 'Panvel Creek, Navi Mumbai',
      lat: 18.9894,
      lng: 73.1175,
      cap: 22000000,
      flow: 450,
      press: 6.0,
      health: 91,
      risk: 17,
    },
  ];

  for (const w of waterAssets) {
    await assetClient.query(
      `INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
       VALUES ($1, $2, $3, $4, 'WATER', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [w.id, w.code, w.name, w.desc, w.type, w.status, w.lifecycle, w.condition, w.crit, w.dept, w.resp, w.cost, w.val, w.life, w.loc, w.lat, w.lng, w.health, w.risk]
    );

    await assetClient.query(
      `INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus")
       VALUES ($1, $2, $3, $4, $5, $6, 'NORMAL')`,
      [`wd-${w.id}`, w.id, w.type, w.cap, w.flow, w.press]
    );
  }

  // 10 TRANSPORT INFRASTRUCTURE
  const transportAssets = [
    {
      id: 'ast-trn-001',
      code: 'TRN-000001',
      name: 'Bandra-Worli Sea Link Main Cable-Stayed Bridge',
      desc: 'Iconic 8-lane expressway bridge over Mahim Bay carrying 120,000 PCU daily.',
      type: 'Cable-Stayed Marine Bridge',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'Maharashtra State Road Dev Corp (MSRDC)',
      resp: 'Radheshyam Mopalwar (Vice Chairman MSRDC)',
      cost: 1600000000,
      val: 1450000000,
      life: 100,
      loc: 'Mahim Bay, Bandra to Worli',
      lat: 19.0368,
      lng: 72.8172,
      span: 5600,
      lanes: 8,
      load: 120,
      vol: 125000,
      health: 93,
      risk: 14,
    },
    {
      id: 'ast-trn-002',
      code: 'TRN-000002',
      name: 'Eastern Express Highway Flyover (Vikhroli Section)',
      desc: 'Prestressed concrete arterial flyover bypassing heavy industrial intersections.',
      type: 'Highway Flyover Viaduct',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'MMRDA Infrastructure Wing',
      resp: 'P. D. Joshi (Superintending Eng)',
      cost: 95000000,
      val: 78000000,
      life: 50,
      loc: 'EEH Vikhroli Junction, Mumbai',
      lat: 19.1118,
      lng: 72.9281,
      span: 1250,
      lanes: 6,
      load: 70,
      vol: 92000,
      health: 82,
      risk: 26,
    },
    {
      id: 'ast-trn-003',
      code: 'TRN-000003',
      name: 'Western Express Highway Andheri East Flyover',
      desc: 'High-density elevated corridor linking domestic airport with North suburbs.',
      type: 'Urban Elevated Expressway',
      status: 'ACTIVE',
      lifecycle: 'UNDER_INSPECTION',
      condition: 'FAIR',
      crit: 'HIGH',
      dept: 'MMRDA Infrastructure Wing',
      resp: 'A. K. Bansal (Maintenance Lead)',
      cost: 82000000,
      val: 64000000,
      life: 45,
      loc: 'WEH, Andheri East, Mumbai',
      lat: 19.1155,
      lng: 72.8569,
      span: 1800,
      lanes: 6,
      load: 70,
      vol: 110000,
      health: 71,
      risk: 48,
    },
    {
      id: 'ast-trn-004',
      code: 'TRN-000004',
      name: 'Sion Railway Over Bridge (ROB)',
      desc: 'Critical road link over Central Railway main lines connecting East and West Sion.',
      type: 'Railway Over Bridge (ROB)',
      status: 'UNDER_REPAIR',
      lifecycle: 'UNDER_MAINTENANCE',
      condition: 'POOR',
      crit: 'CRITICAL',
      dept: 'Central Railway & BMC Joint Bridge Cell',
      resp: 'Vivek Sahay (General Manager CR)',
      cost: 45000000,
      val: 28000000,
      life: 50,
      loc: 'Sion Railway Station, Mumbai',
      lat: 19.0390,
      lng: 72.8625,
      span: 320,
      lanes: 4,
      load: 40,
      vol: 68000,
      health: 42,
      risk: 76,
    },
    {
      id: 'ast-trn-005',
      code: 'TRN-000005',
      name: 'Santacruz-Chembur Link Road Double-Decker Flyover',
      desc: 'Indias first double-decker flyover crossing Central Railway and suburban arterial.',
      type: 'Double-Decker Steel Composite Flyover',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'MMRDA Infrastructure Wing',
      resp: 'Sanjay Khandare (Addl Commissioner)',
      cost: 450000000,
      val: 390000000,
      life: 60,
      loc: 'Kurla West, Mumbai',
      lat: 19.0684,
      lng: 72.8821,
      span: 3450,
      lanes: 6,
      load: 80,
      vol: 85000,
      health: 85,
      risk: 23,
    },
    {
      id: 'ast-trn-006',
      code: 'TRN-000006',
      name: 'Mumbai-Pune Expressway Bhatan Tunnel Section',
      desc: '6-lane twin horseshoe tunnel complex with SCADA ventilation and smoke dampers.',
      type: 'Mountain Highway Tunnel',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'MSRDC Tollways Wing',
      resp: 'Chandrakant Pulkundwar (Chief Eng)',
      cost: 650000000,
      val: 590000000,
      life: 80,
      loc: 'Bhatan, Khandala Ghat Section',
      lat: 18.7845,
      lng: 73.3456,
      span: 1680,
      lanes: 6,
      load: 100,
      vol: 78000,
      health: 91,
      risk: 16,
    },
    {
      id: 'ast-trn-007',
      code: 'TRN-000007',
      name: 'BKC Central Boulevard & Smart Traffic Signal Grid',
      desc: 'Corridor containing 42 synchronized AI traffic cameras and pedestrian crosswalks.',
      type: 'Smart Urban Arterial Grid',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'MEDIUM',
      dept: 'Traffic Police & MMRDA',
      resp: 'Pravin Padwal (Joint CP Traffic)',
      cost: 35000000,
      val: 31000000,
      life: 25,
      loc: 'G Block, BKC, Bandra East',
      lat: 19.0601,
      lng: 72.8644,
      span: 4200,
      lanes: 6,
      load: 60,
      vol: 54000,
      health: 94,
      risk: 13,
    },
    {
      id: 'ast-trn-008',
      code: 'TRN-000008',
      name: 'Thane-Belapur Industrial Highway Expressway',
      desc: 'Heavy commercial corridor carrying chemical and container transport trailers.',
      type: 'Industrial Arterial Highway',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'MIDC Road Division',
      resp: 'P. D. Patil (MIDC Superintending Eng)',
      cost: 120000000,
      val: 98000000,
      life: 30,
      loc: 'Rabale to Turbhe, Navi Mumbai',
      lat: 19.1456,
      lng: 73.0089,
      span: 14500,
      lanes: 6,
      load: 110,
      vol: 95000,
      health: 80,
      risk: 28,
    },
    {
      id: 'ast-trn-009',
      code: 'TRN-000009',
      name: 'Jogeshwari-Vikhroli Link Road (JVLR) Creek Bridge',
      desc: 'High-clearance bridge span crossing Mithi river and mangrove sanctuary.',
      type: 'River Viaduct Bridge',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'FAIR',
      crit: 'HIGH',
      dept: 'BMC Bridges Department',
      resp: 'Satish Thosar (Chief Eng Bridges)',
      cost: 58000000,
      val: 44000000,
      life: 40,
      loc: 'JVLR Crossing, Powai East',
      lat: 19.1285,
      lng: 72.8942,
      span: 820,
      lanes: 6,
      load: 70,
      vol: 82000,
      health: 73,
      risk: 42,
    },
    {
      id: 'ast-trn-010',
      code: 'TRN-000010',
      name: 'Marine Drive Coastal Sea-Wall Promenade & Lights',
      desc: 'Heritage 3.6km tetrapod-protected coastal roadway with 1200 LED lamp poles.',
      type: 'Coastal Promenade Roadway',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'MEDIUM',
      dept: 'BMC Coastal Road Wing',
      resp: 'M. S. Swami (Coastal Chief Eng)',
      cost: 42000000,
      val: 36000000,
      life: 50,
      loc: 'Netaji Subhash Chandra Bose Road, Mumbai',
      lat: 18.9432,
      lng: 72.8231,
      span: 3600,
      lanes: 6,
      load: 50,
      vol: 65000,
      health: 86,
      risk: 21,
    },
  ];

  for (const t of transportAssets) {
    await assetClient.query(
      `INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
       VALUES ($1, $2, $3, $4, 'TRANSPORT', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [t.id, t.code, t.name, t.desc, t.type, t.status, t.lifecycle, t.condition, t.crit, t.dept, t.resp, t.cost, t.val, t.life, t.loc, t.lat, t.lng, t.health, t.risk]
    );

    await assetClient.query(
      `INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`td-${t.id}`, t.id, t.type, t.span, t.lanes, t.load, t.vol]
    );
  }

  // 10 ELECTRICAL INFRASTRUCTURE (Including the Powai Transformer for Demo Flow)
  const electricalAssets = [
    {
      id: 'ast-elc-001',
      code: 'ELC-000001',
      name: 'Powai 220kV/33kV Step-Down Distribution Transformer #2',
      desc: 'Critical primary transformer directly supplying the Powai Water Pumping Station, Data Center, and Hospital emergency feed.',
      type: 'Heavy Power Transformer (220kV/33kV)',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'CRITICAL',
      dept: 'Maharashtra State Electricity Transmission (MSETCL)',
      resp: 'K. S. Narayanan (Chief Executive Eng Transmission)',
      cost: 58000000,
      val: 49000000,
      life: 30,
      loc: 'MSETCL Substation Yard, Powai, Mumbai',
      lat: 19.1221,
      lng: 72.9094,
      volt: 220,
      cap: 100000,
      mfg: 'Bharat Heavy Electricals Ltd (BHEL)',
      model: 'BHEL-TR-220-100MVA',
      temp: 52,
      health: 84,
      risk: 25,
    },
    {
      id: 'ast-elc-002',
      code: 'ELC-000002',
      name: 'Bandra-Kurla Complex 33kV/11kV Substation Unit 1',
      desc: 'Gas-Insulated Substation (GIS) powering financial exchange buildings and hospitals.',
      type: 'Gas Insulated Substation (GIS)',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'Adani Electricity Mumbai Ltd (AEML)',
      resp: 'Kandarp Patel (MD & CEO Adani Electricity)',
      cost: 92000000,
      val: 84000000,
      life: 35,
      loc: 'C-59, G Block, BKC, Mumbai',
      lat: 19.0622,
      lng: 72.8661,
      volt: 33,
      cap: 40000,
      mfg: 'Siemens Energy India',
      model: '8DN8-GIS-33kV',
      temp: 38,
      health: 94,
      risk: 12,
    },
    {
      id: 'ast-elc-003',
      code: 'ELC-000003',
      name: 'Bhandup Water Treatment 33kV Dedicated Power Substation',
      desc: 'Redundant dual-source electrical feed driving high-capacity 2800 MLD water pumps.',
      type: 'Industrial Dedicated Substation',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'CRITICAL',
      dept: 'Tata Power Transmission & Distribution',
      resp: 'Pravir Sinha (CEO & MD Tata Power)',
      cost: 62000000,
      val: 54000000,
      life: 30,
      loc: 'Bhandup Complex East Yard',
      lat: 19.1465,
      lng: 72.9362,
      volt: 33,
      cap: 50000,
      mfg: 'ABB India Ltd',
      model: 'ABB-REB-670',
      temp: 44,
      health: 88,
      risk: 19,
    },
    {
      id: 'ast-elc-004',
      code: 'ELC-000004',
      name: 'CSMT Heritage Zone 11kV Compact Underground Transformer',
      desc: 'Dry-type flame retardant transformer vault buried beneath civic plaza.',
      type: 'Dry-Type Cast Resin Transformer',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'BEST Undertaking Power Supply',
      resp: 'Lokesh Chandra (General Manager BEST)',
      cost: 24000000,
      val: 19000000,
      life: 25,
      loc: 'Dr DN Road, Fort, Mumbai',
      lat: 18.9412,
      lng: 72.8348,
      volt: 11,
      cap: 1600,
      mfg: 'Schneider Electric India',
      model: 'Trihal-1600kVA',
      temp: 48,
      health: 85,
      risk: 23,
    },
    {
      id: 'ast-elc-005',
      code: 'ELC-000005',
      name: 'Vikhroli 400kV High Voltage Grid Intertie Station',
      desc: 'Major grid interchange connecting national grid into Mumbai Islanding Scheme.',
      type: 'Ultra High Voltage Intertie',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'MSETCL Transmission Division',
      resp: 'Dinesh Waghmare (CMD MSETCL)',
      cost: 380000000,
      val: 360000000,
      life: 40,
      loc: 'LBS Marg, Vikhroli West',
      lat: 19.1082,
      lng: 72.9198,
      volt: 400,
      cap: 500000,
      mfg: 'Alstom Grid / GE T&D India',
      model: 'T155-400kV',
      temp: 41,
      health: 96,
      risk: 10,
    },
    {
      id: 'ast-elc-006',
      code: 'ELC-000006',
      name: 'Worli Seaface 11kV Distribution Panel & Feeder Ring',
      desc: 'Ring Main Unit (RMU) distributing power to high-tide pumping stations.',
      type: 'Ring Main Unit (RMU)',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'HIGH',
      dept: 'BEST Undertaking',
      resp: 'Suresh Patil (Divisional Eng)',
      cost: 18000000,
      val: 14000000,
      life: 25,
      loc: 'Worli Seaface South, Mumbai',
      lat: 19.0098,
      lng: 72.8166,
      volt: 11,
      cap: 2500,
      mfg: 'Larsen & Toubro (L&T Electrical)',
      model: 'L&T-RMU-24kV',
      temp: 42,
      health: 86,
      risk: 22,
    },
    {
      id: 'ast-elc-007',
      code: 'ELC-000007',
      name: 'AIIMS Hospital Dedicated 1500kVA DG Emergency Substation',
      desc: 'Automatic Mains Failure (AMF) emergency generator array powering OT and ICU.',
      type: 'Diesel Generator Backup Substation',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'CRITICAL',
      dept: 'Hospital Biomedical Engineering',
      resp: 'Col. Sanjeev Kumar (Chief Bio-Eng)',
      cost: 34000000,
      val: 31000000,
      life: 20,
      loc: 'AIIMS Complex Utility Quad, BKC',
      lat: 19.0664,
      lng: 72.8692,
      volt: 0.415,
      cap: 1500,
      mfg: 'Cummins India Ltd',
      model: 'QSK60-G4-AMF',
      temp: 36,
      health: 93,
      risk: 13,
    },
    {
      id: 'ast-elc-008',
      code: 'ELC-000008',
      name: 'Thane MIDC Industrial 66kV Transformer Bank A',
      desc: 'Heavy industrial power supply feeding chemical manufacturing plants.',
      type: 'Industrial Substation Transformer',
      status: 'ACTIVE',
      lifecycle: 'UNDER_INSPECTION',
      condition: 'FAIR',
      crit: 'HIGH',
      dept: 'MSEDCL Distribution',
      resp: 'V. R. Shinde (Superintending Eng)',
      cost: 44000000,
      val: 33000000,
      life: 30,
      loc: 'Wagle Industrial Estate, Thane West',
      lat: 19.1852,
      lng: 72.9512,
      volt: 66,
      cap: 25000,
      mfg: 'Crompton Greaves (CG Power)',
      model: 'CG-66-25MVA',
      temp: 58,
      health: 74,
      risk: 42,
    },
    {
      id: 'ast-elc-009',
      code: 'ELC-000009',
      name: 'Marine Drive 33kV Coastal Substation & Street Feeder',
      desc: 'Corrosion-resistant switchgear vault delivering street lighting and water pressure power.',
      type: 'Coastal Switchgear Substation',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'GOOD',
      crit: 'MEDIUM',
      dept: 'BEST Undertaking',
      resp: 'Prashant More (Area Supt)',
      cost: 26000000,
      val: 21000000,
      life: 30,
      loc: 'Churchgate Seafront, Mumbai',
      lat: 18.9328,
      lng: 72.8258,
      volt: 33,
      cap: 12000,
      mfg: 'Schneider Electric',
      model: 'Premset-24kV',
      temp: 40,
      health: 84,
      risk: 24,
    },
    {
      id: 'ast-elc-010',
      code: 'ELC-000010',
      name: 'Bandra-Worli Sea Link SCADA Toll & Power Distribution Unit',
      desc: 'Dedicated uninterruptible power supply for toll plazas, bridge sensors and aviation lighting.',
      type: 'Toll & Marine Lighting Substation',
      status: 'ACTIVE',
      lifecycle: 'ACTIVE',
      condition: 'EXCELLENT',
      crit: 'HIGH',
      dept: 'MSRDC Electrical Division',
      resp: 'Sunil Patil (Executive Eng)',
      cost: 28000000,
      val: 25000000,
      life: 25,
      loc: 'Bandra Toll Plaza, Sea Link',
      lat: 19.0418,
      lng: 72.8251,
      volt: 11,
      cap: 3500,
      mfg: 'ABB India Ltd',
      model: 'UniGear-12kV',
      temp: 35,
      health: 92,
      risk: 15,
    },
  ];

  for (const e of electricalAssets) {
    await assetClient.query(
      `INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
       VALUES ($1, $2, $3, $4, 'ELECTRICAL', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [e.id, e.code, e.name, e.desc, e.type, e.status, e.lifecycle, e.condition, e.crit, e.dept, e.resp, e.cost, e.val, e.life, e.loc, e.lat, e.lng, e.health, e.risk]
    );

    await assetClient.query(
      `INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPTIMAL')`,
      [`ed-${e.id}`, e.id, e.type, e.volt, e.cap, e.mfg, e.model, e.temp]
    );
  }

  // 16 INTER-ASSET DEPENDENCY LINKS (Crucial for Demo Flow)
  const dependencies = [
    // Powai Substation & Transformer feed multiple key facilities:
    ['dep-001', 'ast-elc-001', 'ast-bld-005', 'SUPPLIES', 'CRITICAL', 'Direct dual HT feed to Powai Data Center'],
    ['dep-002', 'ast-elc-001', 'ast-wtr-002', 'SUPPLIES', 'CRITICAL', 'Main electrical supply driving raw water lake intake pumps'],
    ['dep-003', 'ast-elc-001', 'ast-bld-001', 'SERVES', 'HIGH', 'Feeds primary grid supply to AIIMS Multi-Specialty Hospital'],
    ['dep-004', 'ast-elc-001', 'ast-trn-009', 'SUPPLIES', 'MEDIUM', 'Provides power to JVLR bridge smart signals and illumination'],
    
    // Water Network chain:
    ['dep-005', 'ast-wtr-004', 'ast-wtr-001', 'CONNECTS_TO', 'CRITICAL', 'Vaitarna trunk aqueduct feeds raw water into Bhandup treatment plant'],
    ['dep-006', 'ast-wtr-001', 'ast-wtr-003', 'SUPPLIES', 'CRITICAL', 'Treated water pumped from Bhandup to Malabar Hill reservoir'],
    ['dep-007', 'ast-wtr-003', 'ast-bld-002', 'SERVES', 'HIGH', 'Gravity water distribution from Malabar Hill to Municipal HQ'],
    ['dep-008', 'ast-wtr-001', 'ast-wtr-007', 'SUPPLIES', 'HIGH', 'Feeds Ghatkopar high storage reservoir'],
    ['dep-009', 'ast-wtr-007', 'ast-wtr-008', 'SUPPLIES', 'HIGH', 'Feeds Dharavi distribution main'],

    // Electrical grid intertie:
    ['dep-010', 'ast-elc-005', 'ast-elc-001', 'SUPPLIES', 'CRITICAL', 'Vikhroli 400kV Grid intertie steps down into Powai 220kV substation'],
    ['dep-011', 'ast-elc-002', 'ast-bld-001', 'SUPPLIES', 'CRITICAL', 'BKC Substation provides primary 33kV commercial feed to AIIMS'],
    ['dep-012', 'ast-elc-007', 'ast-bld-001', 'PROTECTS', 'CRITICAL', 'Emergency AMF DG sets provide instant failover backup to ICU wards'],
    ['dep-013', 'ast-elc-010', 'ast-trn-001', 'PROTECTS', 'HIGH', 'Powers Sea Link aviation obstruction lights, lane cameras and toll gates'],
    ['dep-014', 'ast-elc-003', 'ast-wtr-001', 'SUPPLIES', 'CRITICAL', 'Dedicated 33kV feeder keeps Bhandup filtration online 24x7'],
    ['dep-015', 'ast-elc-006', 'ast-wtr-006', 'SUPPLIES', 'HIGH', 'Worli feeder drives stormwater sea-wall pumps during monsoons'],
    ['dep-016', 'ast-bld-003', 'ast-trn-004', 'SERVES', 'HIGH', 'Disaster bunker monitors structural vibration sensors on Sion ROB'],
  ];

  for (const d of dependencies) {
    await assetClient.query(
      `INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      d
    );
  }

  await assetClient.end();
  console.log('asset_db seeded successfully with 40 assets and 16 dependency links.');

  // 2. SEED INSPECTION SERVICE (inspection_db)
  console.log('Seeding inspection_db...');
  const inspClient = await getClient('inspection_db');

  await inspClient.query(`
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
  `);

  await inspClient.query('TRUNCATE TABLE "InspectionFinding", "InspectionDoc", "Inspection" CASCADE');

  const inspectionsSeed = [
    {
      id: 'insp-001',
      code: 'INSP-000001',
      assetId: 'ast-elc-001',
      assetCode: 'ELC-000001',
      inspector: 'Pooja Verma (Field Auditor)',
      date: '2026-03-10',
      status: 'SCHEDULED',
      cond: 'GOOD',
      score: 85,
      summary: 'Quarterly dielectric insulation and winding temperature audit for Powai Transformer.',
    },
    {
      id: 'insp-002',
      code: 'INSP-000002',
      assetId: 'ast-trn-004',
      assetCode: 'TRN-000004',
      inspector: 'Dr. V. N. Deshpande (Structural Expert)',
      date: '2026-02-14',
      status: 'COMPLETED',
      cond: 'POOR',
      score: 42,
      summary: 'Heavy corrosion on bearing rocker assembly and spalling on western girder.',
      findings: [
        {
          id: 'find-001',
          title: 'Bearing Rocker Seizure & Severe Rusting',
          desc: 'Expansion joints locked due to metallic corrosion, inducing thermal stresses on pier cap.',
          severity: 'CRITICAL',
          rec: 'Emergency retrofitting and bearing replacement required within 14 days.',
        },
        {
          id: 'find-002',
          title: 'Concrete Delamination on Girder Web',
          desc: 'Rebars exposed to weather over track 2 with concrete spalling.',
          severity: 'HIGH',
          rec: 'Micro-concrete grouting and epoxy anti-corrosion coating.',
        },
      ],
    },
    {
      id: 'insp-003',
      code: 'INSP-000003',
      assetId: 'ast-bld-001',
      assetCode: 'BLD-000001',
      inspector: 'S. N. Patil (Fire & Life Safety Inspector)',
      date: '2026-01-20',
      status: 'COMPLETED',
      cond: 'EXCELLENT',
      score: 95,
      summary: 'Hospital fire evacuation pressurization shafts and emergency diesel generators audit.',
      findings: [],
    },
    {
      id: 'insp-004',
      code: 'INSP-000004',
      assetId: 'ast-wtr-001',
      assetCode: 'WTR-000001',
      inspector: 'K. R. Jadhav (Water Quality & SCADA Lead)',
      date: '2026-02-01',
      status: 'COMPLETED',
      cond: 'GOOD',
      score: 88,
      summary: 'Rapid sand filter backwash valves and high-lift centrifugal pump inspection.',
      findings: [
        {
          id: 'find-003',
          title: 'Minor Gland Packing Weepage on Pump 4',
          desc: 'Gland packing water leakage measured at 45 drops/min.',
          severity: 'LOW',
          rec: 'Replace gland packing during next scheduled preventive outage.',
        },
      ],
    },
    {
      id: 'insp-005',
      code: 'INSP-000005',
      assetId: 'ast-trn-001',
      assetCode: 'TRN-000001',
      inspector: 'MSRDC Drone Bridge Audit Team',
      date: '2026-02-28',
      status: 'COMPLETED',
      cond: 'EXCELLENT',
      score: 96,
      summary: 'Ultrasonic stay-cable tension inspection and expansion joint laser alignment.',
      findings: [],
    },
  ];

  for (const i of inspectionsSeed) {
    await inspClient.query(
      `INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [i.id, i.code, i.assetId, i.assetCode, i.inspector, new Date(i.date), i.status, i.cond, i.score, i.summary]
    );

    if (i.findings && i.findings.length > 0) {
      for (const f of i.findings) {
        await inspClient.query(
          `INSERT INTO "InspectionFinding" ("id", "inspectionId", "title", "description", "severity", "recommendedAction")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [f.id, i.id, f.title, f.desc, f.severity, f.rec]
        );
      }
    }
  }

  // Generate 16 additional inspections for other assets to easily surpass 20+ requirement
  for (let idx = 6; idx <= 22; idx++) {
    const code = `INSP-${String(idx).padStart(6, '0')}`;
    const targetAssetId = `ast-${idx % 2 === 0 ? 'bld' : 'wtr'}-00${(idx % 8) + 1}`;
    await inspClient.query(
      `INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "status", "conditionObserved", "overallScore", "summary")
       VALUES ($1, $2, $3, $4, 'Field Audit Team Alpha', NOW() - INTERVAL '${idx * 3} days', 'COMPLETED', 'GOOD', 85, 'Routine infrastructure surveillance')`,
      [`insp-${idx}`, code, targetAssetId, `AST-${idx}`]
    );
  }

  await inspClient.end();
  console.log('inspection_db seeded with 22 inspections and defect findings.');

  // 3. SEED MAINTENANCE SERVICE (maintenance_db)
  console.log('Seeding maintenance_db...');
  const maintClient = await getClient('maintenance_db');

  await maintClient.query(`
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
  `);

  await maintClient.query('TRUNCATE TABLE "MaintenanceRecord", "WorkOrder" CASCADE');

  const workOrdersSeed = [
    {
      id: 'wo-001',
      order: 'WO-000001',
      assetId: 'ast-trn-004',
      code: 'TRN-000004',
      title: 'Emergency Bearing Grouting & Girder Repair',
      desc: 'Replace seized rocker bearings and apply carbon-fiber reinforcement wrap on Sion ROB web.',
      type: 'EMERGENCY',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      tech: 'Senior Bridge Repair Specialist (Task Force 1)',
      dept: 'Central Railway Civil Projects',
      est: 850000,
      act: null,
    },
    {
      id: 'wo-002',
      order: 'WO-000002',
      assetId: 'ast-wtr-008',
      code: 'WTR-000008',
      title: 'Motorized Actuator Overhaul on Dharavi Valve',
      desc: 'Replace gearbox seals and calibrate electronic flow sensor.',
      type: 'CORRECTIVE',
      priority: 'HIGH',
      status: 'ASSIGNED',
      tech: 'Suresh More (Valve Specialist)',
      dept: 'Hydraulic Maintenance',
      est: 145000,
      act: null,
    },
    {
      id: 'wo-003',
      order: 'WO-000003',
      assetId: 'ast-bld-004',
      code: 'BLD-000004',
      title: 'HVAC Air Handling Unit Coil Descaling',
      desc: 'Annual chemical cleaning of chillers and ventilation ducts in surgical suites.',
      type: 'PREVENTIVE',
      priority: 'NORMAL',
      status: 'COMPLETED',
      tech: 'Voltas Facility Services',
      dept: 'Public Health Department',
      est: 220000,
      act: 215000,
    },
  ];

  for (const w of workOrdersSeed) {
    await maintClient.query(
      `INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "assetCode", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "assignedDepartment", "estimatedCost", "actualCost")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [w.id, w.order, w.assetId, w.code, w.title, w.desc, w.type, w.priority, w.status, w.tech, w.dept, w.est, w.act]
    );

    if (w.status === 'COMPLETED' && w.act) {
      await maintClient.query(
        `INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter", "notes")
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '5 days', $7, 'GOOD', 'Work completed within specifications.')`,
        [`mr-${w.id}`, w.assetId, w.id, w.type, w.title, w.tech, w.act]
      );
    }
  }

  // Generate additional 10 work orders and 20 maintenance records to comfortably exceed minimums
  for (let idx = 4; idx <= 14; idx++) {
    const orderNum = `WO-${String(idx).padStart(6, '0')}`;
    const targetAssetId = `ast-${idx % 3 === 0 ? 'elc' : idx % 3 === 1 ? 'trn' : 'wtr'}-00${(idx % 8) + 1}`;
    const cost = 85000 + idx * 12000;
    
    await maintClient.query(
      `INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "estimatedCost", "actualCost")
       VALUES ($1, $2, $3, 'Scheduled Preventive Maintenance', 'Routine lubrications, tightening of fasteners and electronic diagnostics.', 'PREVENTIVE', 'NORMAL', 'COMPLETED', 'Grid Operations Tech', $4, $5)`,
      [`wo-${idx}`, orderNum, targetAssetId, cost, cost]
    );

    await maintClient.query(
      `INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter")
       VALUES ($1, $2, $3, 'PREVENTIVE', 'Conducted annual maintenance and test calibration.', 'Lead Maintenance Engineer', NOW() - INTERVAL '${idx * 5} days', $4, 'EXCELLENT')`,
      [`mr-${idx}`, targetAssetId, `wo-${idx}`, cost]
    );
  }

  for (let idx = 15; idx <= 24; idx++) {
    const targetAssetId = `ast-bld-00${(idx % 9) + 1}`;
    await maintClient.query(
      `INSERT INTO "MaintenanceRecord" ("id", "assetId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter")
       VALUES ($1, $2, 'CORRECTIVE', 'Electrical junction repair and waterproofing touchup.', 'Public Works Depot', NOW() - INTERVAL '${idx * 7} days', 45000, 'GOOD')`,
      [`mr-${idx}`, targetAssetId]
    );
  }

  await maintClient.end();
  console.log('maintenance_db seeded with 14 work orders and 22 completed maintenance logs.');

  // 4. SEED RISK SERVICE (risk_db)
  console.log('Seeding risk_db...');
  const riskClient = await getClient('risk_db');

  await riskClient.query(`
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
  `);

  await riskClient.query('TRUNCATE TABLE "RiskHistory", "AssetRiskRecord", "RiskConfigRecord" CASCADE');

  await riskClient.query(`
    INSERT INTO "RiskConfigRecord" ("id", "conditionWeight", "ageWeight", "inspectionWeight", "maintenanceWeight")
    VALUES ('default', 0.35, 0.20, 0.20, 0.25) ON CONFLICT DO NOTHING
  `);

  // Seed risk records for all 40 assets
  const allAssets = [...buildings, ...waterAssets, ...transportAssets, ...electricalAssets];
  for (const a of allAssets) {
    let riskLevel = 'LOW';
    if (a.risk >= 75) riskLevel = 'CRITICAL';
    else if (a.risk >= 50) riskLevel = 'HIGH';
    else if (a.risk >= 25) riskLevel = 'MEDIUM';

    let priority = 'NORMAL';
    if (riskLevel === 'CRITICAL' || a.health < 35) priority = 'URGENT';
    else if (riskLevel === 'HIGH' || a.health < 55) priority = 'HIGH';

    await riskClient.query(
      `INSERT INTO "AssetRiskRecord" ("id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority", "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'initial.seed')`,
      [
        `risk-${a.id}`,
        a.id,
        a.code,
        a.health,
        a.risk,
        a.crit,
        riskLevel,
        priority,
        a.health >= 80 ? 90 : 60,
        85,
        a.health >= 80 ? 95 : 55,
        a.health >= 80 ? 90 : 65,
        Math.max(5, 100 - a.health),
        a.crit === 'CRITICAL' ? 95 : a.crit === 'HIGH' ? 75 : 45,
        a.crit === 'CRITICAL' ? 1.6 : 1.2,
      ]
    );

    await riskClient.query(
      `INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
       VALUES ($1, $2, $3, $4, $5, 'initial.seed')`,
      [`rh-${a.id}`, a.id, a.health, a.risk, riskLevel]
    );
  }

  await riskClient.end();
  console.log('risk_db seeded with 40 deterministic risk evaluations and history.');

  // 5. SEED NOTIFICATION SERVICE (notification_db)
  console.log('Seeding notification_db...');
  const notifClient = await getClient('notification_db');

  await notifClient.query(`
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
  `);

  await notifClient.query('TRUNCATE TABLE "Notification" CASCADE');

  const notifications = [
    ['notif-001', 'CRITICAL DEFECT: Sion ROB Girder Delamination', 'Bearing seizure and severe corrosion detected during structural audit. Emergency repair work order issued.', 'CRITICAL', 'INSPECTION', 'ast-trn-004', 'TRN-000004'],
    ['notif-002', 'High Risk Elevation: Dharavi Zone Valve', 'Active leak and actuator valve degradation elevated asset risk score to 58/100.', 'ALERT', 'RISK_ALERT', 'ast-wtr-008', 'WTR-000008'],
    ['notif-003', 'Inspection Scheduled: Powai 220kV Transformer', 'Quarterly dielectric insulation and winding audit scheduled for Powai substation transformer.', 'INFO', 'INSPECTION', 'ast-elc-001', 'ELC-000001'],
    ['notif-004', 'Work Order Assigned: Bearing Retrofitting', 'Work Order WO-000001 dispatched to Task Force 1 for emergency structural stabilization.', 'INFO', 'MAINTENANCE', 'ast-trn-004', 'TRN-000004'],
    ['notif-005', 'Inspection Completed: AIIMS Hospital Block A', 'Comprehensive audit completed. Health score certified at 92/100 with zero critical defects.', 'INFO', 'INSPECTION', 'ast-bld-001', 'BLD-000001'],
    ['notif-006', 'Maintenance Completed: General Hospital HVAC', 'Air handling and cooling chillers descaled successfully. Normal temperature gradient restored.', 'INFO', 'MAINTENANCE', 'ast-bld-004', 'BLD-000004'],
    ['notif-007', 'Risk Recalculation: Bandra-Worli Sea Link', 'Laser stay-cable alignment verified. Risk score maintained at optimal 14/100.', 'INFO', 'RISK_ALERT', 'ast-trn-001', 'TRN-000001'],
    ['notif-008', 'SCADA Network Telemetry Active', 'All 40 infrastructure telemetry gateways reporting normal heartbeat to central bus.', 'INFO', 'SYSTEM', null, null],
    ['notif-009', 'Water Pipeline Pressure Spike: Vaitarna Aqueduct', 'Transient 9.2 Bar pressure wave detected; automated surge suppression valves responded within spec.', 'WARNING', 'TELEMETRY', 'ast-wtr-004', 'WTR-000004'],
    ['notif-010', 'MinIO Document Ingestion Verified', 'Structural safety certificates and laser ultrasonic scan PDF files stored in S3 object repository.', 'INFO', 'DOCUMENT', null, null],
    ['notif-011', 'Upcoming Inspection Due in 7 Days', 'Bhandup treatment plant centrifugal pump cluster scheduled for preventive thermal imaging.', 'INFO', 'SCHEDULE', 'ast-wtr-001', 'WTR-000001'],
  ];

  for (const n of notifications) {
    await notifClient.query(
      `INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      n
    );
  }

  await notifClient.end();
  console.log('notification_db seeded with 11 notifications.');

  // 6. SEED AUDIT SERVICE (audit_db)
  console.log('Seeding audit_db...');
  const auditClient = await getClient('audit_db');

  await auditClient.query(`
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
  `);

  await auditClient.query('TRUNCATE TABLE "AuditLog" CASCADE');

  const auditEvents = [
    ['audit-001', 'asset.created', 'Asset', 'ast-elc-001', 'user-admin-001', 'Chief Infrastructure Officer (Admin)', 'asset-service', JSON.stringify({ assetCode: 'ELC-000001', name: 'Powai Transformer' })],
    ['audit-002', 'asset.created', 'Asset', 'ast-bld-001', 'user-mgr-002', 'Rajesh Sharma (Asset Manager)', 'asset-service', JSON.stringify({ assetCode: 'BLD-000001', name: 'AIIMS Hospital' })],
    ['audit-003', 'inspection.scheduled', 'Inspection', 'insp-001', 'user-insp-003', 'Pooja Verma (Field Auditor)', 'inspection-service', JSON.stringify({ inspectionCode: 'INSP-000001', target: 'ELC-000001' })],
    ['audit-004', 'inspection.completed', 'Inspection', 'insp-002', 'user-insp-003', 'Pooja Verma (Field Auditor)', 'inspection-service', JSON.stringify({ inspectionCode: 'INSP-000002', condition: 'POOR', criticalDefects: 1 })],
    ['audit-005', 'risk.updated', 'RiskScore', 'ast-trn-004', null, 'risk-service', 'risk-service', JSON.stringify({ healthScore: 42, riskScore: 76, riskLevel: 'CRITICAL' })],
    ['audit-006', 'workorder.created', 'WorkOrder', 'wo-001', 'user-maint-004', 'Amitabh Sen (Maintenance Lead)', 'maintenance-service', JSON.stringify({ orderNumber: 'WO-000001', priority: 'URGENT' })],
    ['audit-007', 'workorder.completed', 'WorkOrder', 'wo-003', 'user-maint-004', 'Amitabh Sen (Maintenance Lead)', 'maintenance-service', JSON.stringify({ orderNumber: 'WO-000003', actualCost: 215000 })],
    ['audit-008', 'maintenance.completed', 'MaintenanceRecord', 'mr-wo-003', 'user-maint-004', 'Amitabh Sen (Maintenance Lead)', 'maintenance-service', JSON.stringify({ cost: 215000, conditionAfter: 'GOOD' })],
    ['audit-009', 'notification.created', 'Notification', 'notif-001', null, 'notification-service', 'notification-service', JSON.stringify({ title: 'CRITICAL DEFECT: Sion ROB' })],
    ['audit-010', 'asset.dependency_linked', 'AssetDependency', 'dep-001', 'user-mgr-002', 'Rajesh Sharma (Asset Manager)', 'asset-service', JSON.stringify({ source: 'ELC-000001', target: 'BLD-000005', rel: 'SUPPLIES' })],
  ];

  for (const a of auditEvents) {
    await auditClient.query(
      `INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorId", "actorName", "service", "newValues")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      a
    );
  }

  // Generate 12 more audit records to exceed 20+ requirement
  for (let idx = 11; idx <= 22; idx++) {
    await auditClient.query(
      `INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues")
       VALUES ($1, 'asset.telemetry_sync', 'Asset', $2, 'Telemetry Daemon', 'asset-service', '{"status":"OK","reading":"Verified"}')`,
      [`audit-${idx}`, `ast-wtr-00${(idx % 9) + 1}`]
    );
  }

  await auditClient.end();
  console.log('audit_db seeded with 22 immutable audit trail events.');

  console.log('--- All InfraSphere Databases Seeded Successfully! ---');
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
