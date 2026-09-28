const { Client } = require('pg');
const bcrypt = require('bcryptjs');

console.log('--- Generating & Seeding Ahmedabad Infrastructure Dataset ---');

const PG_HOST = process.env.POSTGRES_HOST || 'localhost';
const PG_PORT = parseInt(process.env.POSTGRES_PORT || '5432', 10);
const PG_USER = process.env.POSTGRES_USER || 'infrasphere';
const PG_PASSWORD = process.env.POSTGRES_PASSWORD || 'infrasphere_secret';

async function getClient(dbName) {
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

// Pre-calculated hash for 'Infrasphere@2026'
const PASS_HASH = '$2a$10$w3bYJvA.o9dYxPfxnCgYf.kK/V.aQv1j9f4Cwqx.q5ZkQy6c4gHve';

const AHMEDABAD_USERS = [
  ['user-admin-001', 'admin@infrasphere.local', PASS_HASH, 'Chief City Infrastructure Officer (Admin)', 'ADMIN', 'Ahmedabad Municipal Corporation (AMC)'],
  ['user-mgr-002', 'asset.manager@infrasphere.local', PASS_HASH, 'Hiren Patel (Asset Planning Lead)', 'ASSET_MANAGER', 'AMC Urban Development Authority'],
  ['user-insp-003', 'inspector@infrasphere.local', PASS_HASH, 'Bhavik Shah (Field Auditor & Safety)', 'INSPECTOR', 'Quality & Structural Safety Wing'],
  ['user-maint-004', 'maintenance@infrasphere.local', PASS_HASH, 'Dhaval Trivedi (Public Works Lead)', 'MAINTENANCE_MANAGER', 'Engineering & Public Works'],
  ['user-view-005', 'viewer@infrasphere.local', PASS_HASH, 'Neha Joshi (Public Oversight & Citizen Audit)', 'VIEWER', 'Civic Transparency Directorate'],
];

// 10 Ahmedabad Buildings
const AHMEDABAD_BUILDINGS = [
  {
    id: 'ast-bld-001',
    code: 'BLD-000001',
    name: 'Ahmedabad Civil Hospital & Multi-Specialty Trauma Center',
    desc: 'Largest tertiary healthcare and trauma emergency complex in Asia serving 2.5M population.',
    type: 'Government Super-Speciality Hospital',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'Gujarat Health & Family Welfare Department',
    resp: 'Dr. Rakesh Joshi (Medical Superintendent)',
    cost: 145000000,
    val: 138000000,
    life: 50,
    loc: 'Asarwa, Ahmedabad',
    lat: 23.0532,
    lng: 72.6033,
    floors: 12,
    area: 42000,
    occ: 3200,
    year: 2021,
    health: 94,
    risk: 12,
  },
  {
    id: 'ast-bld-002',
    code: 'BLD-000002',
    name: 'AMC Danapith Municipal Secretariat & Command Center',
    desc: 'Central municipal governance, smart city integrated command and disaster management HQ.',
    type: 'Municipal Administration Secretariat',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'Ahmedabad Municipal Corporation',
    resp: 'M. Thennarasan (Municipal Commissioner)',
    cost: 85000000,
    val: 74000000,
    life: 60,
    loc: 'Danapith, Khadia, Ahmedabad',
    lat: 23.0245,
    lng: 72.5878,
    floors: 8,
    area: 18500,
    occ: 950,
    year: 2018,
    health: 86,
    risk: 22,
  },
  {
    id: 'ast-bld-003',
    code: 'BLD-000003',
    name: 'Gujarat High Court Judicial Complex',
    desc: 'Apex judicial headquarters for Gujarat State with supreme security, data vaults and courtrooms.',
    type: 'Judicial Secretariat',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'High Court of Gujarat Registry',
    resp: 'Chief Judicial Registrar',
    cost: 120000000,
    val: 105000000,
    life: 75,
    loc: 'Sola, SG Highway, Ahmedabad',
    lat: 23.0825,
    lng: 72.5284,
    floors: 7,
    area: 36000,
    occ: 1800,
    year: 2017,
    health: 91,
    risk: 14,
  },
  {
    id: 'ast-bld-004',
    code: 'BLD-000004',
    name: 'IIM Ahmedabad Heritage Academic Campus',
    desc: 'Premier national educational institution campus with heritage architectural red-brick structures.',
    type: 'Premier Educational Campus',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'IIM-A Board of Governors',
    resp: 'Dean of Infrastructure & Estate',
    cost: 95000000,
    val: 82000000,
    life: 70,
    loc: 'Vastrapur, Ahmedabad',
    lat: 23.0328,
    lng: 72.5312,
    floors: 4,
    area: 25000,
    occ: 1200,
    year: 2012,
    health: 84,
    risk: 25,
  },
  {
    id: 'ast-bld-005',
    code: 'BLD-000005',
    name: 'Sardar Vallabhbhai Patel (SVP) Institute of Medical Sciences',
    desc: '1500-bed ultra-modern municipal paperless super-speciality hospital with air ambulance rooftop pad.',
    type: 'Super-Specialty Municipal Hospital',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'AMC Medical Education Trust',
    resp: 'Dr. Saurabh Patel (Director)',
    cost: 175000000,
    val: 165000000,
    life: 50,
    loc: 'Ellisbridge, Riverfront, Ahmedabad',
    lat: 23.0221,
    lng: 72.5701,
    floors: 17,
    area: 55000,
    occ: 4000,
    year: 2019,
    health: 96,
    risk: 10,
  },
  {
    id: 'ast-bld-006',
    code: 'BLD-000006',
    name: 'Gujarat Science City Robotics & Aerospace Gallery',
    desc: 'Public state scientific exploration center, dome planetarium and advanced technology labs.',
    type: 'Public Scientific Exhibition Complex',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'MEDIUM',
    dept: 'Gujarat Council of Science City',
    resp: 'Executive Director (Science City)',
    cost: 65000000,
    val: 59000000,
    life: 40,
    loc: 'Science City Road, Ahmedabad',
    lat: 23.0768,
    lng: 72.4975,
    floors: 4,
    area: 19500,
    occ: 1500,
    year: 2021,
    health: 93,
    risk: 16,
  },
  {
    id: 'ast-bld-007',
    code: 'BLD-000007',
    name: 'Sabarmati Riverfront Development House',
    desc: 'Central control room and promenade operations headquarters managing 11km riverfront infrastructure.',
    type: 'Riverfront Operational Secretariat',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'Sabarmati Riverfront Development Corp Ltd (SRFDCL)',
    resp: 'Managing Director (SRFDCL)',
    cost: 45000000,
    val: 39000000,
    life: 50,
    loc: 'Ashram Road, West Promenade, Ahmedabad',
    lat: 23.0392,
    lng: 72.5746,
    floors: 5,
    area: 12000,
    occ: 450,
    year: 2016,
    health: 87,
    risk: 21,
  },
  {
    id: 'ast-bld-008',
    code: 'BLD-000008',
    name: 'Ahmedabad Central Inter-State Bus Port (Geeta Mandir)',
    desc: 'Public transport hub with 18 bays handling 1500 buses daily and integrated commercial transit concourse.',
    type: 'Multi-Modal Bus Terminal',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'FAIR',
    crit: 'HIGH',
    dept: 'GSRTC & Ahmedabad Urban Transport',
    resp: 'Divisional Controller (GSRTC Central)',
    cost: 55000000,
    val: 44000000,
    life: 40,
    loc: 'Geeta Mandir, Astodia, Ahmedabad',
    lat: 23.0116,
    lng: 72.5934,
    floors: 4,
    area: 22000,
    occ: 3500,
    year: 2015,
    health: 72,
    risk: 36,
  },
  {
    id: 'ast-bld-009',
    code: 'BLD-000009',
    name: 'Gujarat University Administrative Bhavan',
    desc: 'Higher educational administration building coordinating 300+ affiliated colleges across Gujarat.',
    type: 'University Administrative Bhavan',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'MEDIUM',
    dept: 'Gujarat University Senate',
    resp: 'Registrar (Gujarat University)',
    cost: 42000000,
    val: 33000000,
    life: 50,
    loc: 'Navrangpura, Ahmedabad',
    lat: 23.0366,
    lng: 72.5458,
    floors: 5,
    area: 16000,
    occ: 800,
    year: 2011,
    health: 81,
    risk: 26,
  },
  {
    id: 'ast-bld-010',
    code: 'BLD-000010',
    name: 'GIDC Vatva Industrial Command & Environmental Center',
    desc: 'Industrial environmental monitoring station and emergency toxic gas containment headquarters.',
    type: 'Industrial Estate Disaster Command',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'CRITICAL',
    dept: 'Gujarat Industrial Development Corporation',
    resp: 'Estate Manager (GIDC Vatva)',
    cost: 38000000,
    val: 31000000,
    life: 40,
    loc: 'Phase IV, GIDC Vatva, Ahmedabad',
    lat: 22.9648,
    lng: 72.6358,
    floors: 3,
    area: 9500,
    occ: 300,
    year: 2017,
    health: 85,
    risk: 28,
  },
];

// 10 Ahmedabad Water Assets
const AHMEDABAD_WATER = [
  {
    id: 'ast-wtr-001',
    code: 'WTR-000001',
    name: 'Kotarpur Water Treatment Plant (650 MLD)',
    desc: 'Primary municipal surface water purification complex treating Narmada canal bulk water for 40% of Ahmedabad.',
    type: 'Surface Water Treatment Plant',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'AMC Water Resources & Supply Dept',
    resp: 'P. K. Goswami (Chief Hydraulic Engineer)',
    cost: 95000000,
    val: 88000000,
    life: 40,
    loc: 'Kotarpur, Sabarmati Riverfront, Ahmedabad',
    lat: 23.0894,
    lng: 72.6258,
    cap: 650000000,
    flow: 7500,
    press: 5.5,
    health: 93,
    risk: 14,
  },
  {
    id: 'ast-wtr-002',
    code: 'WTR-000002',
    name: 'Jaspur Water Treatment & Supply Complex (400 MLD)',
    desc: 'Major western quadrant water treatment facility supplying SG Highway, Chandkheda, and Motera zones.',
    type: 'Surface Water Treatment Plant',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'CRITICAL',
    dept: 'AMC Water Supply Directorate',
    resp: 'Harish Makwana (Superintending Engineer)',
    cost: 78000000,
    val: 71000000,
    life: 35,
    loc: 'Jaspur-Chandkheda Link Road, Ahmedabad',
    lat: 23.1362,
    lng: 72.5631,
    cap: 400000000,
    flow: 4600,
    press: 5.2,
    health: 88,
    risk: 20,
  },
  {
    id: 'ast-wtr-003',
    code: 'WTR-000003',
    name: 'French Well Sub-Surface Sabarmati River Intake Station',
    desc: 'Radial collector well capturing natural alluvial aquifer filtered water beneath the Sabarmati riverbed.',
    type: 'Radial Collector Intake Well',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'AMC Water Supply Directorate',
    resp: 'R. K. Dave (Hydraulic Executive)',
    cost: 32000000,
    val: 27000000,
    life: 30,
    loc: 'Dudheshwar Waterworks, Ahmedabad',
    lat: 23.0518,
    lng: 72.5772,
    cap: 120000000,
    flow: 1800,
    press: 4.8,
    health: 85,
    risk: 24,
  },
  {
    id: 'ast-wtr-004',
    code: 'WTR-000004',
    name: 'Vastrapur High-Pressure Underground Water Reservoir',
    desc: '40 ML capacity subterranean storage balancing western zone peak morning water demand.',
    type: 'Underground Balancing Reservoir (UGR)',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'HIGH',
    dept: 'AMC West Zone Engineering',
    resp: 'Ketan Pandya (Zonal Water Engineer)',
    cost: 28000000,
    val: 25000000,
    life: 50,
    loc: 'Vastrapur Lake Road, Ahmedabad',
    lat: 23.0354,
    lng: 72.5298,
    cap: 40000000,
    flow: 850,
    press: 4.2,
    health: 91,
    risk: 16,
  },
  {
    id: 'ast-wtr-005',
    code: 'WTR-000005',
    name: 'Bodakdev Master Water Distribution & Pumping Station',
    desc: 'Quadruple 350kW centrifugal pumps supplying treated water to Bodakdev, Judges Bungalow, and Satellite wards.',
    type: 'Zonal Booster Pumping Station',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'AMC New West Zone',
    resp: 'Suresh Prajapati (Junior Engineer)',
    cost: 22000000,
    val: 18500000,
    life: 25,
    loc: 'Bodakdev Near Pakwan Crossing, Ahmedabad',
    lat: 23.0425,
    lng: 72.5165,
    cap: 25000000,
    flow: 650,
    press: 4.5,
    health: 86,
    risk: 22,
  },
  {
    id: 'ast-wtr-006',
    code: 'WTR-000006',
    name: 'Kankaria South Elevated Service Water Tank',
    desc: 'Reinforced concrete staging overhead reservoir serving Maninagar and South Ahmedabad wards.',
    type: 'Elevated Service Reservoir (ESR)',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'MEDIUM',
    dept: 'AMC South Zone Water Supply',
    resp: 'Dinesh Solanki (Maintenance Supervisor)',
    cost: 15000000,
    val: 12000000,
    life: 50,
    loc: 'Kankaria Gate 3, Maninagar, Ahmedabad',
    lat: 23.0062,
    lng: 72.6025,
    cap: 8500000,
    flow: 350,
    press: 3.8,
    health: 83,
    risk: 26,
  },
  {
    id: 'ast-wtr-007',
    code: 'WTR-000007',
    name: 'Naroda GIDC Heavy Booster Sump & Distribution Unit',
    desc: 'Heavy industrial grade water supply booster catering to manufacturing, pharma and metal processing clusters.',
    type: 'Industrial Booster Pumping Station',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'FAIR',
    crit: 'HIGH',
    dept: 'GIDC Water Infrastructure',
    resp: 'Manoj Parmar (Assistant Engineer)',
    cost: 19500000,
    val: 14800000,
    life: 25,
    loc: 'Road No. 12, GIDC Naroda, Ahmedabad',
    lat: 23.0742,
    lng: 72.6582,
    cap: 18000000,
    flow: 500,
    press: 4.0,
    health: 74,
    risk: 38,
  },
  {
    id: 'ast-wtr-008',
    code: 'WTR-000008',
    name: 'Pirana 180 MLD Sewage Treatment & Bioremediation Plant',
    desc: 'Sequential batch reactor STP treating urban municipal wastewater before discharge into downstream Sabarmati.',
    type: 'Biological Sewage Treatment Plant',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'CRITICAL',
    dept: 'AMC Drainage & Sewerage Project',
    resp: 'B. S. Rabari (Project Director)',
    cost: 65000000,
    val: 57000000,
    life: 30,
    loc: 'Pirana Road, South Sabarmati Bank, Ahmedabad',
    lat: 22.9815,
    lng: 72.5684,
    cap: 180000000,
    flow: 2100,
    press: 3.0,
    health: 84,
    risk: 27,
  },
  {
    id: 'ast-wtr-009',
    code: 'WTR-000009',
    name: 'Bopal-Ghuma 1200mm Bulk Transmission Ductile Iron Pipeline',
    desc: '14.5km primary feeder transmission main carrying potable water from Jaspur WTP to rapid growth western suburbs.',
    type: 'Ductile Iron Bulk Transmission Main',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'HIGH',
    dept: 'AUDA & AMC Joint Water Project',
    resp: 'Tarun Vaghela (Pipeline Superintendent)',
    cost: 38000000,
    val: 35000000,
    life: 40,
    loc: 'South Bopal Ring Road Junction, Ahmedabad',
    lat: 23.0285,
    lng: 72.4682,
    cap: 90000000,
    flow: 1100,
    press: 4.8,
    health: 92,
    risk: 15,
  },
  {
    id: 'ast-wtr-010',
    code: 'WTR-000010',
    name: 'Sabarmati Riverfront Circulation & Promenade Irrigation Sump',
    desc: 'Automated reclaimed water filtration and drip irrigation network servicing 11km riverfront flower gardens.',
    type: 'Recycled Water Circulation Network',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'MEDIUM',
    dept: 'SRFDCL Horticulture Wing',
    resp: 'Girish Rawal (Horticulture Officer)',
    cost: 16000000,
    val: 13500000,
    life: 25,
    loc: 'Riverfront West Promenade near Subhash Bridge, Ahmedabad',
    lat: 23.0315,
    lng: 72.5731,
    cap: 5000000,
    flow: 220,
    press: 3.5,
    health: 87,
    risk: 19,
  },
];

// 10 Ahmedabad Transport Assets
const AHMEDABAD_TRANSPORT = [
  {
    id: 'ast-trn-001',
    code: 'TRN-000001',
    name: 'Atal Pedestrian Suspension Bridge',
    desc: 'Iconic 300m steel truss pedestrian bridge connecting east and west promenades with kite-inspired architecture.',
    type: 'Cable Stayed Pedestrian Truss Bridge',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'Sabarmati Riverfront Development Corp',
    resp: 'Vipul Patel (Chief Structural Engineer)',
    cost: 74000000,
    val: 71000000,
    life: 60,
    loc: 'Sabarmati Riverfront West, Ahmedabad',
    lat: 23.0274,
    lng: 72.5742,
    span: 300,
    lanes: 0,
    load: 120,
    vol: 25000,
    health: 96,
    risk: 9,
  },
  {
    id: 'ast-trn-002',
    code: 'TRN-000002',
    name: 'Ellis Bridge Historic River Crossing Structure',
    desc: 'Historic 1892 bowstring arch bridge with modern parallel vehicular spans linking Old City to Modern Ahmedabad.',
    type: 'Steel Truss & Concrete Composite Bridge',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'AMC Bridge Engineering Division',
    resp: 'K. R. Barot (Senior Bridge Engineer)',
    cost: 48000000,
    val: 38000000,
    life: 80,
    loc: 'Ellisbridge Crossing, Sabarmati, Ahmedabad',
    lat: 23.0232,
    lng: 72.5721,
    span: 420,
    lanes: 4,
    load: 40,
    vol: 85000,
    health: 82,
    risk: 28,
  },
  {
    id: 'ast-trn-003',
    code: 'TRN-000003',
    name: 'Nehru Bridge Major Arterial Crossway',
    desc: 'Post-tensioned RCC cantilever box girder carrying heavy traffic between Ashram Road and Lal Darwaja.',
    type: 'Prestressed Concrete Box Girder Bridge',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'AMC Bridge Project Wing',
    resp: 'Jignesh Patel (Project Executive)',
    cost: 52000000,
    val: 41000000,
    life: 60,
    loc: 'Ashram Road to Rupali Cinema, Ahmedabad',
    lat: 23.0298,
    lng: 72.5786,
    span: 380,
    lanes: 6,
    load: 65,
    vol: 110000,
    health: 85,
    risk: 24,
  },
  {
    id: 'ast-trn-004',
    code: 'TRN-000004',
    name: 'Sardar Patel Ring Road West Expressway (SPRR)',
    desc: '76km peripheral 6-lane toll expressway diverting intercity freight traffic around Ahmedabad metropolis.',
    type: 'High-Speed Peripheral Expressway',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'AUDA Road Infrastructure Division',
    resp: 'Executive Engineer (AUDA Roads)',
    cost: 165000000,
    val: 148000000,
    life: 40,
    loc: 'Bopal - Shilaj Crossing, SPRR, Ahmedabad',
    lat: 23.0520,
    lng: 72.4625,
    span: 12500,
    lanes: 6,
    load: 90,
    vol: 140000,
    health: 93,
    risk: 13,
  },
  {
    id: 'ast-trn-005',
    code: 'TRN-000005',
    name: 'SG Highway 6-Lane Elevated Flyover Corridor',
    desc: 'Continuous elevated viaduct reducing congestion across Thaltej, Pakwan, and Iskcon commercial intersections.',
    type: 'Prestressed Elevated Viaduct',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'CRITICAL',
    dept: 'National Highways & Gujarat R&B Dept',
    resp: 'S. N. Vankar (Executive Engineer NH)',
    cost: 135000000,
    val: 122000000,
    life: 50,
    loc: 'Thaltej-Pakwan Junction, SG Highway, Ahmedabad',
    lat: 23.0485,
    lng: 72.5182,
    span: 4100,
    lanes: 6,
    load: 75,
    vol: 165000,
    health: 89,
    risk: 18,
  },
  {
    id: 'ast-trn-006',
    code: 'TRN-000006',
    name: 'Shivranjani - IIM Janmarg BRTS Dedicated Transit Corridor',
    desc: 'Dedicated median bus rapid transit corridor with smart automated fare gates and GPS real-time bus tracking.',
    type: 'Dedicated Bus Rapid Transit (BRTS)',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'Ahmedabad Janmarg Limited (AJL)',
    resp: 'General Manager (AJL Operations)',
    cost: 32000000,
    val: 26000000,
    life: 30,
    loc: 'Shivranjani Cross Roads, Satellite, Ahmedabad',
    lat: 23.0258,
    lng: 72.5325,
    span: 3200,
    lanes: 2,
    load: 35,
    vol: 65000,
    health: 84,
    risk: 25,
  },
  {
    id: 'ast-trn-007',
    code: 'TRN-000007',
    name: 'Kalupur Multi-Modal Railway Interchange & Bullet Train Terminal',
    desc: 'Central junction integrating Western Railway, Ahmedabad Metro, BRTS, and upcoming High Speed Rail (MAHSR).',
    type: 'Multi-Modal Railway Transit Terminal',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'CRITICAL',
    dept: 'Indian Railways & GMRC',
    resp: 'Divisional Railway Manager (Western Railway)',
    cost: 210000000,
    val: 198000000,
    life: 75,
    loc: 'Kalupur Station Square, Ahmedabad',
    lat: 23.0289,
    lng: 72.6008,
    span: 850,
    lanes: 12,
    load: 120,
    vol: 220000,
    health: 88,
    risk: 19,
  },
  {
    id: 'ast-trn-008',
    code: 'TRN-000008',
    name: 'Motera Narendra Modi Stadium Metro Station & Skywalk',
    desc: 'Elevated rapid transit terminal designed to evacuate 130,000 stadium spectators with dedicated skywalk.',
    type: 'Elevated Rapid Transit Metro Station',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'HIGH',
    dept: 'Gujarat Metro Rail Corporation (GMRC)',
    resp: 'Chief Operating Officer (GMRC)',
    cost: 88000000,
    val: 82000000,
    life: 50,
    loc: 'Motera Stadium Road, Sabarmati, Ahmedabad',
    lat: 23.0915,
    lng: 72.5972,
    span: 450,
    lanes: 2,
    load: 50,
    vol: 75000,
    health: 94,
    risk: 11,
  },
  {
    id: 'ast-trn-009',
    code: 'TRN-000009',
    name: 'Sindhu Bhavan Road Smart Boulevard & Adaptive Traffic Network',
    desc: 'Prime 4.2km commercial corridor featuring smart adaptive signalization, underground utility ducts and LED lighting.',
    type: 'Smart Urban Arterial Boulevard',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'MEDIUM',
    dept: 'AMC Smart City Development Ltd',
    resp: 'Zonal Traffic Executive',
    cost: 45000000,
    val: 41000000,
    life: 30,
    loc: 'Sindhu Bhavan Road, Bodakdev, Ahmedabad',
    lat: 23.0421,
    lng: 72.4965,
    span: 4200,
    lanes: 6,
    load: 45,
    vol: 92000,
    health: 93,
    risk: 13,
  },
  {
    id: 'ast-trn-010',
    code: 'TRN-000010',
    name: 'Subhash Bridge Airport Corridor Interchange Flyover',
    desc: 'Multi-level vehicular flyover separating RTO, Sabarmati Ashram tourists and Ahmedabad International Airport traffic.',
    type: 'Multi-Arm Grade Separator Flyover',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'AMC Bridge Engineering Division',
    resp: 'Nitin Bhatt (Bridge Inspector)',
    cost: 58000000,
    val: 47000000,
    life: 50,
    loc: 'Subhash Bridge Circle, Sabarmati, Ahmedabad',
    lat: 23.0645,
    lng: 72.5842,
    span: 920,
    lanes: 4,
    load: 60,
    vol: 98000,
    health: 86,
    risk: 23,
  },
];

// 10 Ahmedabad Electrical Assets
const AHMEDABAD_ELECTRICAL = [
  {
    id: 'ast-elc-001',
    code: 'ELC-000001',
    name: 'Torrent Power 220kV Master Grid Substation (Sabarmati)',
    desc: 'Central high-voltage transmission & bulk transformation hub energizing northern Ahmedabad and riverfront grid.',
    type: 'High-Voltage Grid Substation (220kV)',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'CRITICAL',
    dept: 'Torrent Power Transmission Division',
    resp: 'Nilesh Gandhi (Chief Grid Operations)',
    cost: 65000000,
    val: 58000000,
    life: 35,
    loc: 'Sabarmati Power Station Enclave, Ahmedabad',
    lat: 23.0784,
    lng: 72.5862,
    volt: 220,
    cap: 350000,
    mfg: 'Siemens India Ltd',
    model: 'SMR-220-GIS-Series',
    temp: 64.2,
    health: 87,
    risk: 21,
  },
  {
    id: 'ast-elc-002',
    code: 'ELC-000002',
    name: 'Bodakdev 66/11kV Distribution Power Substation',
    desc: 'Major primary stepping-down substation feeding SG Highway corporate high-rises and residential colonies.',
    type: 'Primary Stepping-Down Substation',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'HIGH',
    dept: 'Torrent Power Distribution West',
    resp: 'Rohan Mehra (Substation Engineer)',
    cost: 28000000,
    val: 25000000,
    life: 30,
    loc: 'Bodakdev Near Judges Bungalow, Ahmedabad',
    lat: 23.0412,
    lng: 72.5215,
    volt: 66,
    cap: 90000,
    mfg: 'ABB Power Grids India',
    model: 'SafeRing-66kV',
    temp: 52.8,
    health: 92,
    risk: 15,
  },
  {
    id: 'ast-elc-003',
    code: 'ELC-000003',
    name: 'Prahlad Nagar Commercial Step-Down Transformer Bank',
    desc: 'High-density pad-mounted 11kV/415V step-down transformer cluster powering IT ITES offices and corporate centers.',
    type: 'Pad-Mounted Distribution Transformer',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'MEDIUM',
    dept: 'Torrent Power Urban Maintenance',
    resp: 'Girish Joshi (Distribution Engineer)',
    cost: 7500000,
    val: 6200000,
    life: 25,
    loc: 'Prahlad Nagar Corporate Road, Ahmedabad',
    lat: 23.0118,
    lng: 72.5085,
    volt: 11,
    cap: 2500,
    mfg: 'Schneider Electric',
    model: 'Trihal Dry Cast-Resin',
    temp: 56.4,
    health: 88,
    risk: 18,
  },
  {
    id: 'ast-elc-004',
    code: 'ELC-000004',
    name: 'Ahmedabad Metro Line 1 Traction Power Substation (TSS)',
    desc: 'Dedicated 25kV AC overhead catenary traction power supply for Metro East-West corridor trains.',
    type: 'Metro Rail Traction Power Substation',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'GMRC Electrical & Traction Directorate',
    resp: 'Vikas Sharma (Director Rolling Stock & Power)',
    cost: 42000000,
    val: 39000000,
    life: 35,
    loc: 'Apparel Park Depot, Khokhra, Ahmedabad',
    lat: 23.0142,
    lng: 72.6145,
    volt: 25,
    cap: 45000,
    mfg: 'Alstom Transport India',
    model: 'HES-25kV-MetroTraction',
    temp: 48.6,
    health: 94,
    risk: 12,
  },
  {
    id: 'ast-elc-005',
    code: 'ELC-000005',
    name: 'Sabarmati Solar Rooftop & Renewable Injection Hub',
    desc: 'Microgrid synchronous inverter hub combining 12MW distributed canal-top and rooftop solar generation.',
    type: 'Renewable Solar Injection Hub',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'MEDIUM',
    dept: 'Gujarat Energy Development Agency (GEDA)',
    resp: 'Anil Vyas (Solar Systems Engineer)',
    cost: 18500000,
    val: 16800000,
    life: 25,
    loc: 'Sabarmati D-Cabin Solar Yard, Ahmedabad',
    lat: 23.0825,
    lng: 72.5912,
    volt: 11,
    cap: 12000,
    mfg: 'Delta Electronics',
    model: 'M125HV-GridTied',
    temp: 45.2,
    health: 93,
    risk: 14,
  },
  {
    id: 'ast-elc-006',
    code: 'ELC-000006',
    name: 'GIDC Naroda Heavy Industrial Distribution Transformer T-4',
    desc: 'Oil-immersed heavy power transformer supporting continuous dye chemical synthesis reactors.',
    type: 'Industrial Oil-Immersed Power Transformer',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'FAIR',
    crit: 'HIGH',
    dept: 'UGVCL / GIDC Industrial Grid',
    resp: 'Pravin Modi (Industrial Electrical Inspector)',
    cost: 12000000,
    val: 8800000,
    life: 25,
    loc: 'Phase 2, GIDC Naroda, Ahmedabad',
    lat: 23.0785,
    lng: 72.6621,
    volt: 22,
    cap: 6300,
    mfg: 'Bharat Bijlee',
    model: 'ONAN-22kV-Heavy',
    temp: 72.5,
    health: 73,
    risk: 39,
  },
  {
    id: 'ast-elc-007',
    code: 'ELC-000007',
    name: 'GIFT City Interconnection Power Feeder Switching Station',
    desc: 'Dual-circuit redundant 66kV transmission feeder interconnecting Northern Ahmedabad with GIFT Financial Hub.',
    type: 'Redundant Inter-Grid Switching Station',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'Gujarat Energy Transmission Corp (GETCO)',
    resp: 'Ashok Rao (Superintending Engineer)',
    cost: 38000000,
    val: 35000000,
    life: 40,
    loc: 'Zundal - Chandkheda Bypass, Ahmedabad',
    lat: 23.1185,
    lng: 72.5832,
    volt: 66,
    cap: 120000,
    mfg: 'L&T Electrical & Automation',
    model: 'GIS-Dual-Busbar-66',
    temp: 50.1,
    health: 95,
    risk: 11,
  },
  {
    id: 'ast-elc-008',
    code: 'ELC-000008',
    name: 'Science City 11kV Underground Captive Transformer Unit',
    desc: 'Underground compact substation providing uninterruptible clean power to planetarium lasers and IMAX projection.',
    type: 'Compact Underground Substation (CSS)',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'MEDIUM',
    dept: 'Science City Facilities & Power',
    resp: 'Kavita Dave (Estate Engineer)',
    cost: 8500000,
    val: 7600000,
    life: 25,
    loc: 'Science City Road, Sola, Ahmedabad',
    lat: 23.0745,
    lng: 72.4998,
    volt: 11,
    cap: 3150,
    mfg: 'Schneider Electric',
    model: 'BIOSCO-CSS-11kV',
    temp: 49.3,
    health: 92,
    risk: 16,
  },
  {
    id: 'ast-elc-009',
    code: 'ELC-000009',
    name: 'SVP Hospital Dedicated Dual Hospital Feeder Transformer Unit',
    desc: 'Dual dedicated 11kV transformers with automatic static transfer switch (STS) feeding ICU & surgical theaters.',
    type: 'Critical Healthcare Substation Unit',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'EXCELLENT',
    crit: 'CRITICAL',
    dept: 'AMC SVP Hospital Engineering Works',
    resp: 'Chief Hospital Electrical Officer',
    cost: 16000000,
    val: 14500000,
    life: 30,
    loc: 'SVP Hospital Basement Power Vault, Ahmedabad',
    lat: 23.0225,
    lng: 72.5695,
    volt: 11,
    cap: 5000,
    mfg: 'ABB India Ltd',
    model: 'CastResin-CriticalHealth',
    temp: 47.8,
    health: 96,
    risk: 8,
  },
  {
    id: 'ast-elc-010',
    code: 'ELC-000010',
    name: 'Sanand - Sarkhej Automotive Heavy Switchyard',
    desc: 'Heavy 132/33kV industrial transmission switchyard supplying continuous automotive assembly robotics plants.',
    type: 'Heavy Industrial Transmission Switchyard',
    status: 'ACTIVE',
    lifecycle: 'ACTIVE',
    condition: 'GOOD',
    crit: 'HIGH',
    dept: 'GETCO Transmission Circle',
    resp: 'Mahesh Patel (Switchyard Manager)',
    cost: 54000000,
    val: 47000000,
    life: 35,
    loc: 'Sarkhej-Bavla Highway, Ahmedabad Outer',
    lat: 22.9985,
    lng: 72.4652,
    volt: 132,
    cap: 160000,
    mfg: 'Siemens Energy India',
    model: 'AirInsulated-132kV',
    temp: 58.2,
    health: 86,
    risk: 22,
  },
];

// Realistic Ahmedabad Dependency Links
// Note: ELC-000001 (Torrent Power Sabarmati Substation) is the master hub
const AHMEDABAD_DEPENDENCIES = [
  ['dep-001', 'ast-elc-001', 'ast-bld-001', 'SUPPLIES', 'CRITICAL', 'Torrent Power Master Substation provides 220kV primary grid feed to Civil Hospital & Trauma Center'],
  ['dep-002', 'ast-elc-001', 'ast-bld-005', 'SUPPLIES', 'CRITICAL', 'Primary power feed to SVP Super-Speciality Hospital'],
  ['dep-003', 'ast-elc-001', 'ast-wtr-001', 'SUPPLIES', 'CRITICAL', 'Power feed to Kotarpur Water Treatment Plant high-lift pumps (650 MLD)'],
  ['dep-004', 'ast-elc-001', 'ast-trn-008', 'SUPPLIES', 'HIGH', 'Power feed to Motera Metro Station and Stadium Transit Hub'],
  ['dep-005', 'ast-elc-001', 'ast-elc-002', 'SUPPLIES', 'CRITICAL', '220kV to 66kV transmission interconnect to Bodakdev primary substation'],
  ['dep-006', 'ast-elc-002', 'ast-trn-005', 'SUPPLIES', 'HIGH', 'Power supply to SG Highway Elevated Corridor intelligent lighting and CCTV network'],
  ['dep-007', 'ast-elc-002', 'ast-bld-004', 'SUPPLIES', 'MEDIUM', 'Electricity supply to IIM Ahmedabad Heritage Campus'],
  ['dep-008', 'ast-elc-002', 'ast-wtr-005', 'SUPPLIES', 'CRITICAL', 'Powers Bodakdev master water distribution pumping station'],
  ['dep-009', 'ast-wtr-001', 'ast-bld-001', 'SUPPLIES', 'CRITICAL', 'Kotarpur WTP provides treated potable water pipeline to Civil Hospital'],
  ['dep-010', 'ast-wtr-001', 'ast-wtr-004', 'SUPPLIES', 'HIGH', 'Bulk water supply to Vastrapur Underground Reservoir'],
  ['dep-011', 'ast-wtr-004', 'ast-bld-004', 'SUPPLIES', 'MEDIUM', 'Water distribution to IIM Ahmedabad campus'],
  ['dep-012', 'ast-elc-009', 'ast-bld-005', 'PROTECTS', 'CRITICAL', 'Dedicated dual hospital transformer protects SVP Hospital Intensive Care Units'],
  ['dep-013', 'ast-trn-001', 'ast-bld-007', 'CONNECTS_TO', 'HIGH', 'Atal Bridge west landing connects directly to Riverfront Development House'],
  ['dep-014', 'ast-elc-004', 'ast-trn-007', 'SUPPLIES', 'CRITICAL', 'Metro traction substation powers passenger lines through Kalupur Interchange'],
  ['dep-015', 'ast-wtr-002', 'ast-wtr-009', 'SUPPLIES', 'HIGH', 'Jaspur WTP feeds Bopal-Ghuma 1200mm bulk water transmission pipeline'],
  ['dep-016', 'ast-wtr-003', 'ast-bld-002', 'SUPPLIES', 'HIGH', 'Dudheshwar river water station supplies AMC Danapith Secretariat'],
];

async function seedAhmedabad() {
  console.log('Connecting to PostgreSQL databases...');

  // 1. ASSET DB
  const assetClient = await getClient('asset_db');
  console.log('Seeding asset_db with Ahmedabad infrastructure...');

  await assetClient.query('TRUNCATE TABLE "AssetDependency", "AssetDocument", "BuildingDetails", "WaterDetails", "TransportDetails", "ElectricalDetails", "Asset", "User" CASCADE');

  for (const u of AHMEDABAD_USERS) {
    await assetClient.query(
      'INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "department") VALUES ($1, $2, $3, $4, $5, $6)',
      u
    );
  }

  // Insert Buildings
  for (const b of AHMEDABAD_BUILDINGS) {
    await assetClient.query(`
      INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
      VALUES ($1, $2, $3, $4, 'BUILDINGS', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `, [b.id, b.code, b.name, b.desc, b.type, b.status, b.lifecycle, b.condition, b.crit, b.dept, b.resp, b.cost, b.val, b.life, b.loc, b.lat, b.lng, b.health, b.risk]);

    await assetClient.query(`
      INSERT INTO "BuildingDetails" ("id", "assetId", "buildingType", "numberOfFloors", "totalAreaSqMeters", "occupancyCapacity", "constructionYear", "structuralMaterial", "fireSafetyStatus", "waterConnectionStatus", "accessibilityStatus")
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Reinforced Concrete (RCC)', 'Certified Compliant', 'Dual Dedicated Feeder', 'Full Barrier-Free Access')
    `, ['bd-' + b.id, b.id, b.type, b.floors, b.area, b.occ, b.year]);
  }

  // Insert Water
  for (const w of AHMEDABAD_WATER) {
    await assetClient.query(`
      INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
      VALUES ($1, $2, $3, $4, 'WATER', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `, [w.id, w.code, w.name, w.desc, w.type, w.status, w.lifecycle, w.condition, w.crit, w.dept, w.resp, w.cost, w.val, w.life, w.loc, w.lat, w.lng, w.health, w.risk]);

    await assetClient.query(`
      INSERT INTO "WaterDetails" ("id", "assetId", "waterAssetType", "capacityLiters", "flowRateLps", "pressureBar", "operatingStatus")
      VALUES ($1, $2, $3, $4, $5, $6, 'NORMAL')
    `, ['wd-' + w.id, w.id, w.type, w.cap, w.flow, w.press]);
  }

  // Insert Transport
  for (const t of AHMEDABAD_TRANSPORT) {
    await assetClient.query(`
      INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
      VALUES ($1, $2, $3, $4, 'TRANSPORT', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `, [t.id, t.code, t.name, t.desc, t.type, t.status, t.lifecycle, t.condition, t.crit, t.dept, t.resp, t.cost, t.val, t.life, t.loc, t.lat, t.lng, t.health, t.risk]);

    await assetClient.query(`
      INSERT INTO "TransportDetails" ("id", "assetId", "transportAssetType", "bridgeLengthMeters", "numberOfLanes", "loadCapacityTons", "trafficVolumePcuPerDay")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, ['td-' + t.id, t.id, t.type, t.span, t.lanes, t.load, t.vol]);
  }

  // Insert Electrical
  for (const e of AHMEDABAD_ELECTRICAL) {
    await assetClient.query(`
      INSERT INTO "Asset" ("id", "assetCode", "name", "description", "category", "assetType", "status", "lifecycleStatus", "condition", "criticality", "ownerDepartment", "responsiblePerson", "purchaseCost", "currentValue", "expectedLifeYears", "locationName", "latitude", "longitude", "healthScore", "riskScore")
      VALUES ($1, $2, $3, $4, 'ELECTRICAL', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `, [e.id, e.code, e.name, e.desc, e.type, e.status, e.lifecycle, e.condition, e.crit, e.dept, e.resp, e.cost, e.val, e.life, e.loc, e.lat, e.lng, e.health, e.risk]);

    await assetClient.query(`
      INSERT INTO "ElectricalDetails" ("id", "assetId", "electricalAssetType", "voltageKv", "capacityKva", "manufacturer", "model", "operatingTemperatureC", "operatingStatus")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPTIMAL')
    `, ['ed-' + e.id, e.id, e.type, e.volt, e.cap, e.mfg, e.model, e.temp]);
  }

  // Insert Dependencies
  for (const d of AHMEDABAD_DEPENDENCIES) {
    await assetClient.query(`
      INSERT INTO "AssetDependency" ("id", "sourceAssetId", "targetAssetId", "relationship", "criticality", "notes")
      VALUES ($1, $2, $3, $4, $5, $6)
    `, d);
  }
  await assetClient.end();
  console.log('asset_db populated with 40 Ahmedabad assets and 16 dependencies!');

  // 2. RISK DB
  const riskClient = await getClient('risk_db');
  console.log('Seeding risk_db for Ahmedabad assets...');
  await riskClient.query('TRUNCATE TABLE "RiskHistory", "RiskConfigRecord", "AssetRiskRecord" CASCADE');

  const allAssets = [...AHMEDABAD_BUILDINGS, ...AHMEDABAD_WATER, ...AHMEDABAD_TRANSPORT, ...AHMEDABAD_ELECTRICAL];
  for (const a of allAssets) {
    const riskLevel = a.risk >= 75 ? 'CRITICAL' : a.risk >= 50 ? 'HIGH' : a.risk >= 25 ? 'MEDIUM' : 'LOW';
    const maintPriority = a.risk >= 75 ? 'URGENT' : a.risk >= 50 ? 'HIGH' : a.risk >= 25 ? 'NORMAL' : 'LOW';

    await riskClient.query(`
      INSERT INTO "AssetRiskRecord" (
        "id", "assetId", "assetCode", "healthScore", "riskScore", "criticality", "riskLevel", "maintenancePriority",
        "conditionScore", "ageScore", "inspectionScore", "maintenanceScore", "probabilityScore", "impactScore", "criticalityMultiplier", "triggerEvent"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'initial.seed')
    `, [
      'risk-' + a.id, a.id, a.code, a.health, a.risk, a.crit, riskLevel, maintPriority,
      a.health, 80, 85, 90, a.risk, 50, a.crit === 'CRITICAL' ? 1.4 : a.crit === 'HIGH' ? 1.2 : 1.0
    ]);

    await riskClient.query(`
      INSERT INTO "RiskHistory" ("id", "assetId", "healthScore", "riskScore", "riskLevel", "triggerEvent")
      VALUES ($1, $2, $3, $4, $5, 'initial.seed')
    `, ['rh-' + a.id, a.id, a.health, a.risk, riskLevel]);
  }
  await riskClient.end();
  console.log('risk_db populated with 40 Ahmedabad risk records!');

  // 3. INSPECTION DB
  const inspClient = await getClient('inspection_db');
  console.log('Seeding inspection_db for Ahmedabad assets...');
  await inspClient.query('TRUNCATE TABLE "InspectionDoc", "InspectionFinding", "Inspection" CASCADE');

  const inspRecords = [
    {
      id: 'insp-001',
      code: 'INSP-000001',
      assetId: 'ast-elc-001',
      assetCode: 'ELC-000001',
      inspector: 'Bhavik Shah (Field Auditor & Safety)',
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      cond: 'GOOD',
      score: 88,
      summary: 'Periodic bi-annual thermographic inspection of 220kV busbars and transformers at Sabarmati Substation.',
      findings: [
        { id: 'fnd-001', title: 'Minor Bushing Oil Seepage', desc: 'Slight non-critical oil film observed around secondary bushing terminal B.', severity: 'LOW', rec: 'Wipe clean and monitor at next monthly audit.' }
      ]
    },
    {
      id: 'insp-002',
      code: 'INSP-000002',
      assetId: 'ast-bld-001',
      assetCode: 'BLD-000001',
      inspector: 'Bhavik Shah (Field Auditor & Safety)',
      date: new Date(Date.now() - 8 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      cond: 'EXCELLENT',
      score: 95,
      summary: 'Annual seismic resistance and emergency fire system compliance audit for Ahmedabad Civil Hospital Trauma Wing.',
      findings: []
    },
    {
      id: 'insp-003',
      code: 'INSP-000003',
      assetId: 'ast-trn-001',
      assetCode: 'TRN-000001',
      inspector: 'Bhavik Shah (Field Auditor & Safety)',
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      cond: 'EXCELLENT',
      score: 98,
      summary: 'Ultrasonic weld test and tension verification on Atal Pedestrian Bridge suspension cables across Sabarmati.',
      findings: []
    },
    {
      id: 'insp-004',
      code: 'INSP-000004',
      assetId: 'ast-wtr-001',
      assetCode: 'WTR-000001',
      inspector: 'Bhavik Shah (Field Auditor & Safety)',
      date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      status: 'COMPLETED',
      cond: 'EXCELLENT',
      score: 94,
      summary: 'Water purification filter bed integrity and chlorine dispersion calibration audit at Kotarpur WTP.',
      findings: []
    }
  ];

  for (const ins of inspRecords) {
    await inspClient.query(`
      INSERT INTO "Inspection" ("id", "inspectionCode", "assetId", "assetCode", "inspectorName", "scheduledDate", "completedDate", "status", "conditionObserved", "overallScore", "summary")
      VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, $10)
    `, [ins.id, ins.code, ins.assetId, ins.assetCode, ins.inspector, ins.date, ins.status, ins.cond, ins.score, ins.summary]);

    for (const f of ins.findings) {
      await inspClient.query(`
        INSERT INTO "InspectionFinding" ("id", "inspectionId", "title", "description", "severity", "recommendedAction")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [f.id, ins.id, f.title, f.desc, f.severity, f.rec]);
    }
  }
  await inspClient.end();
  console.log('inspection_db seeded for Ahmedabad!');

  // 4. MAINTENANCE DB
  const maintClient = await getClient('maintenance_db');
  console.log('Seeding maintenance_db for Ahmedabad assets...');
  await maintClient.query('TRUNCATE TABLE "MaintenanceRecord", "WorkOrder" CASCADE');

  const workOrders = [
    {
      id: 'wo-001',
      number: 'WO-000001',
      assetId: 'ast-elc-001',
      assetCode: 'ELC-000001',
      title: 'Routine Oil Filtration & Dissolved Gas Analysis (DGA)',
      desc: 'Annual transformer oil dehydration and dielectric breakdown voltage testing at Sabarmati 220kV Grid.',
      type: 'PREVENTIVE',
      priority: 'NORMAL',
      status: 'COMPLETED',
      tech: 'Dhaval Trivedi (Public Works Lead)',
      dept: 'Torrent Power Maintenance Circle',
      cost: 45000,
      actualCost: 42500,
      recDesc: 'Dehydrated 4000L transformer dielectric oil. BDV value raised from 48kV to 72kV. Operating temperature returned to nominal 58C.',
      condAfter: 'GOOD'
    },
    {
      id: 'wo-002',
      number: 'WO-000002',
      assetId: 'ast-wtr-001',
      assetCode: 'WTR-000001',
      title: 'Kotarpur High-Lift Pump Impeller Dynamic Balancing',
      desc: 'Scheduled vibration dampening and bearing replacement for 650 MLD Raw Water Pump No. 3.',
      type: 'PREVENTIVE',
      priority: 'NORMAL',
      status: 'COMPLETED',
      tech: 'Suresh Prajapati (Mechanical Lead)',
      dept: 'AMC Hydraulic Workshop',
      cost: 85000,
      actualCost: 78000,
      recDesc: 'Replaced heavy roller bearings with SKF spherical assemblies. Vibration reduced from 4.8 mm/s to 1.1 mm/s.',
      condAfter: 'EXCELLENT'
    },
    {
      id: 'wo-003',
      number: 'WO-000003',
      assetId: 'ast-trn-005',
      assetCode: 'TRN-000005',
      title: 'SG Highway Flyover Expansion Joint Elastomeric Sealing',
      desc: 'Sealing expansion gap joints at Thaltej junction to prevent monsoon water ingress.',
      type: 'PREVENTIVE',
      priority: 'HIGH',
      status: 'OPEN',
      tech: 'Dhaval Trivedi (Public Works Lead)',
      dept: 'AMC Bridge Engineering Division',
      cost: 120000,
      actualCost: null,
      recDesc: null,
      condAfter: null
    }
  ];

  for (const wo of workOrders) {
    await maintClient.query(`
      INSERT INTO "WorkOrder" ("id", "orderNumber", "assetId", "assetCode", "title", "description", "maintenanceType", "priority", "status", "assignedTechnician", "assignedDepartment", "estimatedCost", "actualCost")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [wo.id, wo.number, wo.assetId, wo.assetCode, wo.title, wo.desc, wo.type, wo.priority, wo.status, wo.tech, wo.dept, wo.cost, wo.actualCost]);

    if (wo.recDesc) {
      await maintClient.query(`
        INSERT INTO "MaintenanceRecord" ("id", "assetId", "workOrderId", "maintenanceType", "description", "performedBy", "completionDate", "cost", "conditionAfter")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)
      `, ['mr-' + wo.id, wo.assetId, wo.id, wo.type, wo.recDesc, wo.tech, wo.actualCost, wo.condAfter]);
    }
  }
  await maintClient.end();
  console.log('maintenance_db seeded for Ahmedabad!');

  // 5. NOTIFICATION DB
  const notifClient = await getClient('notification_db');
  console.log('Seeding notification_db for Ahmedabad...');
  await notifClient.query('TRUNCATE TABLE "Notification" CASCADE');

  const notifications = [
    ['notif-001', 'System Initialized: Ahmedabad Urban Infrastructure Cluster', 'All 40 Ahmedabad assets, GIS spatial coordinates and dependency links loaded.', 'INFO', 'SYSTEM', null, null, false],
    ['notif-002', 'Inspection Due in 14 Days: SVP Hospital Dedicated Feeder', 'Bi-annual safety audit scheduled for ELC-000009 at SVP Hospital Ellisbridge.', 'INFO', 'INSPECTION', 'ast-elc-009', 'ELC-000009', false],
    ['notif-003', 'Maintenance Completed: Sabarmati 220kV Master Transformer', 'Routine Oil Filtration & DGA completed for ELC-000001. Dielectric breakdown voltage verified nominal.', 'INFO', 'MAINTENANCE', 'ast-elc-001', 'ELC-000001', false],
    ['notif-004', 'Monsoon Drainage Readiness Alert: Pirana STP', 'Continuous flow telemetry active at Pirana 180 MLD treatment facility.', 'INFO', 'MONITORING', 'ast-wtr-008', 'WTR-000008', true],
  ];

  for (const n of notifications) {
    await notifClient.query(`
      INSERT INTO "Notification" ("id", "title", "message", "severity", "category", "assetId", "assetCode", "isRead")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, n);
  }
  await notifClient.end();
  console.log('notification_db seeded for Ahmedabad!');

  // 6. AUDIT DB
  const auditClient = await getClient('audit_db');
  console.log('Seeding audit_db for Ahmedabad provenance...');
  await auditClient.query('TRUNCATE TABLE "AuditLog" CASCADE');

  const auditLogs = [
    ['audit-001', 'asset.created', 'Asset', 'ast-elc-001', 'Hiren Patel (Asset Planning Lead)', 'asset-service', JSON.stringify({ assetCode: 'ELC-000001', name: 'Torrent Power 220kV Master Grid Substation (Sabarmati)', location: 'Sabarmati, Ahmedabad' })],
    ['audit-002', 'asset.created', 'Asset', 'ast-bld-001', 'Hiren Patel (Asset Planning Lead)', 'asset-service', JSON.stringify({ assetCode: 'BLD-000001', name: 'Ahmedabad Civil Hospital', location: 'Asarwa, Ahmedabad' })],
    ['audit-003', 'asset.created', 'Asset', 'ast-wtr-001', 'Hiren Patel (Asset Planning Lead)', 'asset-service', JSON.stringify({ assetCode: 'WTR-000001', name: 'Kotarpur Water Treatment Plant', location: 'Kotarpur, Ahmedabad' })],
    ['audit-004', 'asset.created', 'Asset', 'ast-trn-001', 'Hiren Patel (Asset Planning Lead)', 'asset-service', JSON.stringify({ assetCode: 'TRN-000001', name: 'Atal Pedestrian Suspension Bridge', location: 'Sabarmati Riverfront, Ahmedabad' })],
    ['audit-005', 'inspection.completed', 'Inspection', 'insp-001', 'Bhavik Shah (Field Auditor & Safety)', 'inspection-service', JSON.stringify({ inspectionCode: 'INSP-000001', assetCode: 'ELC-000001', condition: 'GOOD', score: 88 })],
    ['audit-006', 'workorder.completed', 'WorkOrder', 'wo-001', 'Dhaval Trivedi (Public Works Lead)', 'maintenance-service', JSON.stringify({ orderNumber: 'WO-000001', assetCode: 'ELC-000001', cost: 42500 })],
  ];

  for (const a of auditLogs) {
    await auditClient.query(`
      INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "actorName", "service", "newValues")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, a);
  }
  await auditClient.end();
  console.log('audit_db seeded for Ahmedabad!');

  console.log('\n--- ALL 6 DATABASES SUCCESSFULLY SEEDED WITH AHMEDABAD INFRASTRUCTURE! ---');
}

seedAhmedabad().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
