import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building,
  Droplets,
  Car,
  Zap,
  MapPin,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AssetCreate: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Core Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    category: 'BUILDINGS',
    assetType: 'Hospital',
    status: 'ACTIVE',
    lifecycleStatus: 'ACTIVE',
    condition: 'EXCELLENT',
    criticality: 'HIGH',
    ownerDepartment: 'Public Works & Infrastructure Dept',
    responsiblePerson: 'Senior Executive Engineer',
    expectedLifeYears: 30,
    purchaseCost: 50000000,
    currentValue: 48000000,
    locationName: 'Navrangpura / SG Highway, Ahmedabad, Gujarat',
    latitude: 23.0366,
    longitude: 72.5458,
    geometryType: 'Point',

    // Buildings specific
    buildingType: 'Government Hospital',
    numberOfFloors: 8,
    totalAreaSqMeters: 14500,
    occupancyCapacity: 1200,
    constructionYear: 2021,
    structuralMaterial: 'Reinforced Concrete (RCC)',
    fireSafetyStatus: 'Certified Fire Compliant',
    electricityCapacityKw: 750,
    waterConnectionStatus: 'Dual Dedicated Municipal Feeder',
    accessibilityStatus: 'Fully Divyang Accessible',

    // Water specific
    waterAssetType: 'Pumping Station',
    capacityLiters: 5000000,
    flowRateLps: 450,
    pressureBar: 6.5,
    pipeDiameterMm: 600,
    pipeMaterial: 'Ductile Iron (DI)',
    pumpPowerKw: 250,
    treatmentCapacityMld: 50,
    waterOperatingStatus: 'NORMAL',

    // Transport specific
    transportAssetType: 'Flyover / Bridge',
    roadType: 'Arterial Corridor',
    roadLengthKm: 2.8,
    bridgeLengthMeters: 450,
    bridgeWidthMeters: 24,
    loadCapacityTons: 70,
    numberOfLanes: 6,
    surfaceMaterial: 'Dense Bituminous Macadam (DBM)',
    trafficVolumePcuPerDay: 48000,
    lightingStatus: 'Smart LED Grid Active',

    // Electrical specific
    electricalAssetType: 'Distribution Transformer',
    voltageKv: 33,
    capacityKva: 2500,
    currentLoadAmps: 680,
    phaseCount: 3,
    manufacturer: 'Bharat Heavy Electricals Ltd (BHEL)',
    model: 'BHEL-TX-33-2500',
    operatingTemperatureC: 45,
    powerRatingKw: 2000,
    electricalOperatingStatus: 'OPTIMAL',
  });

  const handleChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleCategorySelect = (cat: string) => {
    const defaultTypes: Record<string, string> = {
      BUILDINGS: 'Government Hospital',
      WATER: 'Water Treatment Plant',
      TRANSPORT: 'Highway Flyover',
      ELECTRICAL: 'Distribution Substation Transformer',
    };
    setFormData((prev: any) => ({
      ...prev,
      category: cat,
      assetType: defaultTypes[cat] || 'Infrastructure Node',
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const payload: any = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      assetType: formData.assetType,
      status: formData.status,
      lifecycleStatus: formData.lifecycleStatus,
      condition: formData.condition,
      criticality: formData.criticality,
      ownerDepartment: formData.ownerDepartment,
      responsiblePerson: formData.responsiblePerson,
      expectedLifeYears: Number(formData.expectedLifeYears),
      purchaseCost: Number(formData.purchaseCost),
      currentValue: Number(formData.currentValue),
      locationName: formData.locationName,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      geometryType: formData.geometryType,
    };

    if (formData.category === 'BUILDINGS') {
      payload.buildingDetails = {
        buildingType: formData.buildingType,
        numberOfFloors: Number(formData.numberOfFloors),
        totalAreaSqMeters: Number(formData.totalAreaSqMeters),
        occupancyCapacity: Number(formData.occupancyCapacity),
        constructionYear: Number(formData.constructionYear),
        structuralMaterial: formData.structuralMaterial,
        fireSafetyStatus: formData.fireSafetyStatus,
        electricityCapacityKw: Number(formData.electricityCapacityKw),
        waterConnectionStatus: formData.waterConnectionStatus,
        accessibilityStatus: formData.accessibilityStatus,
      };
    } else if (formData.category === 'WATER') {
      payload.waterDetails = {
        waterAssetType: formData.waterAssetType,
        capacityLiters: Number(formData.capacityLiters),
        flowRateLps: Number(formData.flowRateLps),
        pressureBar: Number(formData.pressureBar),
        pipeDiameterMm: Number(formData.pipeDiameterMm),
        pipeMaterial: formData.pipeMaterial,
        pumpPowerKw: Number(formData.pumpPowerKw),
        treatmentCapacityMld: Number(formData.treatmentCapacityMld),
        operatingStatus: formData.waterOperatingStatus || 'ACTIVE',
      };
    } else if (formData.category === 'TRANSPORT') {
      payload.transportDetails = {
        transportAssetType: formData.transportAssetType,
        roadType: formData.roadType,
        roadLengthKm: Number(formData.roadLengthKm),
        bridgeLengthMeters: Number(formData.bridgeLengthMeters),
        bridgeWidthMeters: Number(formData.bridgeWidthMeters),
        loadCapacityTons: Number(formData.loadCapacityTons),
        numberOfLanes: Number(formData.numberOfLanes),
        surfaceMaterial: formData.surfaceMaterial,
        trafficVolumePcuPerDay: Number(formData.trafficVolumePcuPerDay),
        lightingStatus: formData.lightingStatus,
      };
    } else if (formData.category === 'ELECTRICAL') {
      payload.electricalDetails = {
        electricalAssetType: formData.electricalAssetType,
        voltageKv: Number(formData.voltageKv),
        capacityKva: Number(formData.capacityKva),
        currentLoadAmps: Number(formData.currentLoadAmps),
        phaseCount: Number(formData.phaseCount),
        manufacturer: formData.manufacturer,
        model: formData.model,
        operatingTemperatureC: Number(formData.operatingTemperatureC),
        powerRatingKw: Number(formData.powerRatingKw),
        operatingStatus: formData.electricalOperatingStatus || 'ACTIVE',
      };
    }

    try {
      const res = await apiClient.post('/assets', payload);
      setLoading(false);
      if (res.data.success && res.data.data) {
        navigate(`/assets/${res.data.data.id}`);
      } else {
        setError('Asset registration failed. Check inputs.');
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.response?.data?.error?.message || e.message || 'Creation failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">REGISTER INFRASTRUCTURE ASSET</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Step-by-step verification and GIS spatial integration wizard
          </p>
        </div>
        <Link
          to="/assets"
          className="text-xs font-mono text-slate-400 hover:text-slate-200 border border-[#334155] px-3 py-1.5 bg-[#1e293b]"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Progress Bar */}
      <div className="grid grid-cols-5 gap-1 font-mono text-[10px] uppercase text-center">
        {[
          { num: 1, label: '1. Basic Info' },
          { num: 2, label: '2. Domain Category' },
          { num: 3, label: '3. Technical Specs' },
          { num: 4, label: '4. GIS Location' },
          { num: 5, label: '5. Review & Submit' },
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2 px-1 border ${
              step === s.num
                ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                : step > s.num
                ? 'bg-[#1e293b] border-emerald-700 text-emerald-400'
                : 'bg-[#0f172a] border-[#1e293b] text-slate-500'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-6 space-y-5">
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1e293b]">
              Step 1: General Asset Details
            </h2>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                placeholder="e.g. AIIMS Multi-Speciality Ward Block B"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Description / Purpose
              </label>
              <textarea
                rows={3}
                placeholder="Detailed description of the asset's structural purpose, service territory, or operational history..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Expected Lifecycle (Years)
                </label>
                <input
                  type="number"
                  value={formData.expectedLifeYears}
                  onChange={(e) => handleChange('expectedLifeYears', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Purchase / Construction Cost (₹)
                </label>
                <input
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => handleChange('purchaseCost', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Current Book Value (₹)
                </label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => handleChange('currentValue', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Category & Asset Type */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1e293b]">
              Step 2: Infrastructure Domain Category
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  id: 'BUILDINGS',
                  title: 'Buildings & Facilities',
                  icon: Building,
                  desc: 'Hospitals, civic offices, schools, emergency depots',
                  color: 'border-sky-700 bg-sky-950/20 text-sky-400',
                },
                {
                  id: 'WATER',
                  title: 'Water Infrastructure',
                  icon: Droplets,
                  desc: 'Pumping stations, treatment plants, distribution mains',
                  color: 'border-cyan-700 bg-cyan-950/20 text-cyan-400',
                },
                {
                  id: 'TRANSPORT',
                  title: 'Transport Corridor',
                  icon: Car,
                  desc: 'Bridges, flyovers, arterial roads, highway culverts',
                  color: 'border-amber-700 bg-amber-950/20 text-amber-400',
                },
                {
                  id: 'ELECTRICAL',
                  title: 'Electrical & Power Grid',
                  icon: Zap,
                  desc: 'Substation transformers, HT panels, distribution equipment',
                  color: 'border-violet-700 bg-violet-950/20 text-violet-400',
                },
              ].map((c) => {
                const Icon = c.icon;
                const isSelected = formData.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategorySelect(c.id)}
                    className={`p-4 border text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-[#1e293b] bg-[#1e293b]/40 hover:border-[#334155]'
                    }`}
                  >
                    <div>
                      <Icon className={`w-6 h-6 mb-2 ${c.color.split(' ')[2]}`} />
                      <div className="font-bold text-white text-xs">{c.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">{c.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="mt-3 text-[10px] font-mono text-indigo-400 font-bold uppercase">
                        ✓ Selected Domain
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Asset Specific Type
              </label>
              <input
                type="text"
                value={formData.assetType}
                onChange={(e) => handleChange('assetType', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: Domain-Specific Technical Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1e293b]">
              Step 3: {formData.category} Domain Technical Specifications
            </h2>

            {/* BUILDINGS DETAILS */}
            {formData.category === 'BUILDINGS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Building Classification</label>
                  <input
                    type="text"
                    value={formData.buildingType}
                    onChange={(e) => handleChange('buildingType', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Number of Floors</label>
                  <input
                    type="number"
                    value={formData.numberOfFloors}
                    onChange={(e) => handleChange('numberOfFloors', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Total Built-Up Area (m²)</label>
                  <input
                    type="number"
                    value={formData.totalAreaSqMeters}
                    onChange={(e) => handleChange('totalAreaSqMeters', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Occupancy Capacity (Persons)</label>
                  <input
                    type="number"
                    value={formData.occupancyCapacity}
                    onChange={(e) => handleChange('occupancyCapacity', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Structural Frame Material</label>
                  <input
                    type="text"
                    value={formData.structuralMaterial}
                    onChange={(e) => handleChange('structuralMaterial', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Fire Safety Status</label>
                  <input
                    type="text"
                    value={formData.fireSafetyStatus}
                    onChange={(e) => handleChange('fireSafetyStatus', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* WATER DETAILS */}
            {formData.category === 'WATER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Capacity (Liters)</label>
                  <input
                    type="number"
                    value={formData.capacityLiters}
                    onChange={(e) => handleChange('capacityLiters', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Discharge Flow Rate (LPS)</label>
                  <input
                    type="number"
                    value={formData.flowRateLps}
                    onChange={(e) => handleChange('flowRateLps', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Working Pressure (Bar)</label>
                  <input
                    type="number"
                    value={formData.pressureBar}
                    onChange={(e) => handleChange('pressureBar', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Pump Motor Power (kW)</label>
                  <input
                    type="number"
                    value={formData.pumpPowerKw}
                    onChange={(e) => handleChange('pumpPowerKw', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* TRANSPORT DETAILS */}
            {formData.category === 'TRANSPORT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Corridor Length (km)</label>
                  <input
                    type="number"
                    value={formData.roadLengthKm}
                    onChange={(e) => handleChange('roadLengthKm', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Span Length (Meters)</label>
                  <input
                    type="number"
                    value={formData.bridgeLengthMeters}
                    onChange={(e) => handleChange('bridgeLengthMeters', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Load Rating (Tons)</label>
                  <input
                    type="number"
                    value={formData.loadCapacityTons}
                    onChange={(e) => handleChange('loadCapacityTons', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Traffic Volume (PCU/Day)</label>
                  <input
                    type="number"
                    value={formData.trafficVolumePcuPerDay}
                    onChange={(e) => handleChange('trafficVolumePcuPerDay', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* ELECTRICAL DETAILS */}
            {formData.category === 'ELECTRICAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Voltage Rating (kV)</label>
                  <input
                    type="number"
                    value={formData.voltageKv}
                    onChange={(e) => handleChange('voltageKv', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Capacity Rating (kVA)</label>
                  <input
                    type="number"
                    value={formData.capacityKva}
                    onChange={(e) => handleChange('capacityKva', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Model Specification</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: GIS Spatial Location & Ownership */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1e293b]">
              Step 4: GIS Spatial Coordinates & Governance
            </h2>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Location Name / Landmark *</label>
              <input
                type="text"
                value={formData.locationName}
                onChange={(e) => handleChange('locationName', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] px-3 py-2 text-sm text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Geometry Type</label>
                <select
                  value={formData.geometryType}
                  onChange={(e) => handleChange('geometryType', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value="Point">Point (Equipment, Buildings, Stations)</option>
                  <option value="LineString">LineString (Pipelines, Roadways, HT Lines)</option>
                  <option value="Polygon">Polygon (Boundaries, Reservoirs, Parks)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Initial Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value="EXCELLENT">EXCELLENT (Brand New)</option>
                  <option value="GOOD">GOOD (Operational)</option>
                  <option value="FAIR">FAIR (Minor Aging)</option>
                  <option value="POOR">POOR (Attention Needed)</option>
                  <option value="CRITICAL">CRITICAL (Defect Active)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Criticality Level</label>
                <select
                  value={formData.criticality}
                  onChange={(e) => handleChange('criticality', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL (Mission Essential)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Managing Department</label>
                <input
                  type="text"
                  value={formData.ownerDepartment}
                  onChange={(e) => handleChange('ownerDepartment', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider pb-2 border-b border-[#1e293b]">
              Step 5: Review Infrastructure Registration
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#1e293b]/40 p-4 border border-[#334155]">
              <div>
                <div className="text-slate-400 uppercase text-[10px]">Asset Name:</div>
                <div className="text-white font-bold text-sm mt-0.5">{formData.name}</div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px]">Category & Type:</div>
                <div className="text-indigo-400 font-bold mt-0.5">{formData.category} / {formData.assetType}</div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px]">Location:</div>
                <div className="text-slate-200 mt-0.5">{formData.locationName} ({formData.latitude}, {formData.longitude})</div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px]">Condition & Criticality:</div>
                <div className="text-slate-200 mt-0.5">{formData.condition} | {formData.criticality}</div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px]">Managing Department:</div>
                <div className="text-slate-200 mt-0.5">{formData.ownerDepartment}</div>
              </div>

              <div>
                <div className="text-slate-400 uppercase text-[10px]">Expected Lifetime / Cost:</div>
                <div className="text-slate-200 mt-0.5">{formData.expectedLifeYears} Years / ₹{Number(formData.purchaseCost).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-800 text-indigo-300 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>
                Upon creation, an initial deterministic health score will be assigned and an <code>asset.created</code> event will be published to RabbitMQ.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1e293b]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-300 text-xs font-mono uppercase flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !formData.name) {
                  setError('Please provide an asset name');
                  return;
                }
                setError('');
                setStep(step + 1);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono uppercase flex items-center space-x-1 font-semibold"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono uppercase flex items-center space-x-1 font-bold"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Confirm & Register Asset'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
