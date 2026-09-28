import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  Layers,
  MapPin,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  Network,
  FileText,
  History,
  Activity,
  PlusCircle,
  CheckCircle,
  ExternalLink,
  Upload,
  RefreshCw,
  Building,
  Droplets,
  Car,
  Zap,
} from 'lucide-react';
import {
  RiskBadge,
  HealthBadge,
  StatusBadge,
  ConditionBadge,
  CategoryBadge,
  SeverityBadge,
} from '../components/Badges';
import { useAuth } from '../context/AuthContext';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, canInspect, canMaintain, canManageAssets, isReadOnly } = useAuth();
  const [asset, setAsset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Tab data states
  const [inspections, setInspections] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any>(null);
  const [dependencyGraph, setDependencyGraph] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showCompleteInspectionModal, setShowCompleteInspectionModal] = useState<any | null>(null);
  const [showCompleteWorkOrderModal, setShowCompleteWorkOrderModal] = useState<any | null>(null);

  // Inspection form state
  const [newInsp, setNewInsp] = useState({
    inspectorName: 'Chief Field Auditor',
    scheduledDate: new Date().toISOString().split('T')[0],
    conditionObserved: 'GOOD',
    summary: 'Standard structural and operational inspection',
    defectTitle: '',
    defectSeverity: 'CRITICAL',
    defectDesc: '',
  });

  // Complete inspection state
  const [completeInspData, setCompleteInspData] = useState({
    conditionObserved: 'CRITICAL',
    summary: 'Severe operational degradation observed; immediate repair mandatory.',
    findingsTitle: 'Critical Bushing Breakdown & High Gas Dissolution',
    findingsSeverity: 'CRITICAL',
    findingsDesc: 'Dielectric breakdown risk elevated. Overheating coils detected at 88°C.',
  });

  // Work order form state
  const [newWO, setNewWO] = useState({
    title: 'Urgent Diagnostic & Coil Replacement',
    description: 'Replace degraded bushings and replenish dielectric transformer fluid.',
    maintenanceType: 'CORRECTIVE',
    priority: 'URGENT',
    assignedTechnician: 'Senior Electrical Engineer (Grid Team 4)',
    estimatedCost: 185000,
  });

  // Complete work order state
  const [completeWOData, setCompleteWOData] = useState({
    actualCost: 195000,
    resolutionNotes: 'Successfully replaced bushings and flushed oil. Test bench passed dielectric withstand test at 50kV.',
    conditionAfter: 'GOOD',
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchAssetDetails = async () => {
    if (!id) return;
    try {
      const [assetRes, inspRes, woRes, maintRes, riskRes, depRes, auditRes] = await Promise.allSettled([
        apiClient.get(`/assets/${id}`),
        apiClient.get(`/inspections/asset/${id}`),
        apiClient.get(`/work-orders?assetId=${id}`),
        apiClient.get(`/maintenance/asset/${id}`),
        apiClient.get(`/risks/${id}`),
        apiClient.get(`/assets/${id}/dependencies`),
        apiClient.get(`/audit/entity/Asset/${id}`),
      ]);

      if (assetRes.status === 'fulfilled' && assetRes.value.data.success) {
        setAsset(assetRes.value.data.data);
      }
      if (inspRes.status === 'fulfilled' && inspRes.value.data.success) {
        setInspections(inspRes.value.data.data || []);
      }
      if (woRes.status === 'fulfilled' && woRes.value.data.success) {
        setWorkOrders(woRes.value.data.data || []);
      }
      if (maintRes.status === 'fulfilled' && maintRes.value.data.success) {
        setMaintenanceHistory(maintRes.value.data.data || []);
      }
      if (riskRes.status === 'fulfilled' && riskRes.value.data.success) {
        setRiskData(riskRes.value.data.data);
      }
      if (depRes.status === 'fulfilled' && depRes.value.data.success) {
        setDependencyGraph(depRes.value.data.data);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value.data.success) {
        setAuditLogs(auditRes.value.data.data || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  // Recalculate Risk manually
  const handleRecalculateRisk = async () => {
    try {
      const res = await apiClient.post(`/risks/${id}/recalculate`, {
        triggerEvent: 'manual.ui_trigger',
      });
      if (res.data.success) {
        setActionSuccessMsg('Deterministic risk scores recalculated successfully.');
        fetchAssetDetails();
      }
    } catch (e: any) {
      alert('Recalculation error');
    }
  };

  // Submit New Inspection
  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        assetId: id,
        assetCode: asset.assetCode,
        inspectorName: newInsp.inspectorName,
        scheduledDate: newInsp.scheduledDate,
        conditionObserved: newInsp.conditionObserved,
        summary: newInsp.summary,
      };

      if (newInsp.defectTitle) {
        payload.findings = [
          {
            title: newInsp.defectTitle,
            severity: newInsp.defectSeverity,
            description: newInsp.defectDesc,
          },
        ];
      }

      await apiClient.post('/inspections', payload);
      setShowInspectionModal(false);
      setActionSuccessMsg('Inspection created and scheduled.');
      fetchAssetDetails();
    } catch (e: any) {
      alert('Failed to schedule inspection');
    }
  };

  // Complete Inspection
  const handleCompleteInspection = async (inspectionId: string) => {
    try {
      await apiClient.post(`/inspections/${inspectionId}/complete`, {
        conditionObserved: completeInspData.conditionObserved,
        summary: completeInspData.summary,
        findings: [
          {
            title: completeInspData.findingsTitle,
            severity: completeInspData.findingsSeverity,
            description: completeInspData.findingsDesc,
            recommendedAction: 'Immediate isolation and maintenance work order issuance',
          },
        ],
      });

      setShowCompleteInspectionModal(null);
      setActionSuccessMsg(
        'Inspection completed! RabbitMQ event published -> Risk Service recalculated asset risk -> Notification alert triggered!'
      );
      // Wait a moment for async RabbitMQ event propagation
      setTimeout(fetchAssetDetails, 800);
    } catch (e: any) {
      alert('Failed to complete inspection');
    }
  };

  // Create Work Order
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/work-orders', {
        assetId: id,
        assetCode: asset.assetCode,
        title: newWO.title,
        description: newWO.description,
        maintenanceType: newWO.maintenanceType,
        priority: newWO.priority,
        assignedTechnician: newWO.assignedTechnician,
        estimatedCost: Number(newWO.estimatedCost),
      });

      setShowWorkOrderModal(false);
      setActionSuccessMsg('Maintenance work order issued and assigned.');
      fetchAssetDetails();
    } catch (e: any) {
      alert('Failed to create work order');
    }
  };

  // Complete Work Order
  const handleCompleteWorkOrder = async (workOrderId: string) => {
    try {
      await apiClient.post(`/work-orders/${workOrderId}/complete`, {
        actualCost: Number(completeWOData.actualCost),
        resolutionNotes: completeWOData.resolutionNotes,
        conditionAfter: completeWOData.conditionAfter,
      });

      setShowCompleteWorkOrderModal(null);
      setActionSuccessMsg(
        'Work order completed! Maintenance record added, condition restored, and risk score re-evaluated!'
      );
      setTimeout(fetchAssetDetails, 800);
    } catch (e: any) {
      alert('Failed to complete work order');
    }
  };

  if (loading || !asset) {
    return (
      <div className="py-20 text-center font-mono text-slate-400">
        Loading comprehensive asset lifecycle profile...
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'technical', label: 'Technical Specs', icon: Activity },
    { id: 'lifecycle', label: 'Lifecycle Timeline', icon: History },
    { id: 'inspections', label: `Inspections (${inspections.length})`, icon: ClipboardCheck },
    { id: 'maintenance', label: `Work Orders (${workOrders.length})`, icon: Wrench },
    { id: 'risk', label: 'Risk & Health Engine', icon: AlertTriangle },
    { id: 'dependencies', label: 'Dependency Graph', icon: Network },
    { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* Toast Alert Banner if action succeeded */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Asset Hero Header */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-indigo-400">{asset.assetCode}</span>
              <CategoryBadge category={asset.category} />
              <StatusBadge status={asset.status} />
              <ConditionBadge condition={asset.condition} />
            </div>
            <h1 className="text-xl font-bold text-white mt-1">{asset.name}</h1>
            <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono mt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{asset.locationName}</span>
              </span>
              <span>• Dept: {asset.ownerDepartment}</span>
              <span>• Life: {asset.expectedLifeYears} Years</span>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div className="flex flex-col space-y-1">
              <HealthBadge score={riskData?.healthScore ?? asset.healthScore ?? 80} />
              <RiskBadge score={riskData?.riskScore ?? asset.riskScore ?? 20} level={riskData?.riskLevel} />
            </div>

            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => canInspect && setShowInspectionModal(true)}
                disabled={!canInspect}
                title={canInspect ? 'Schedule new audit inspection' : 'Requires INSPECTOR or ADMIN role (Least Privilege Enforced)'}
                className={`px-3 py-1 text-xs font-mono font-medium flex items-center space-x-1 ${
                  canInspect
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    : 'bg-[#1f2937] text-slate-400 cursor-not-allowed border border-[#374151]'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Schedule Inspection</span>
                {!canInspect && <span className="text-[10px] ml-1">🔒</span>}
              </button>

              <button
                onClick={() => canMaintain && setShowWorkOrderModal(true)}
                disabled={!canMaintain}
                title={canMaintain ? 'Issue new maintenance work order' : 'Requires MAINTENANCE_MANAGER or ADMIN role (Least Privilege Enforced)'}
                className={`px-3 py-1 text-xs font-mono font-medium flex items-center space-x-1 border ${
                  canMaintain
                    ? 'bg-[#111827] hover:bg-[#1f2937] border-[#334155] text-slate-200 cursor-pointer'
                    : 'bg-[#1f2937] border-[#374151] text-slate-400 cursor-not-allowed'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                <span>Issue Work Order</span>
                {!canMaintain && <span className="text-[10px] ml-1">🔒</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mt-6 border-t border-[#1e293b] pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-medium border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-[#1e293b] border-[#334155] text-slate-300 hover:bg-[#334155]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-5">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e293b] p-4 border border-[#334155] space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Operational Status</div>
                <div className="text-base font-bold text-white">{asset.status}</div>
                <div className="text-xs text-slate-300">Lifecycle Phase: <strong className="text-indigo-400 font-mono">{asset.lifecycleStatus}</strong></div>
                <div className="text-xs text-slate-300">Criticality: <strong className="text-amber-400 font-mono">{asset.criticality}</strong></div>
              </div>

              <div className="bg-[#1e293b] p-4 border border-[#334155] space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Financial Valuation</div>
                <div className="text-base font-bold text-white font-mono">
                  ₹{Number(asset.currentValue || asset.purchaseCost || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-300">Initial Cost: ₹{Number(asset.purchaseCost || 0).toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-300">Expected Service: {asset.expectedLifeYears} Years</div>
              </div>

              <div className="bg-[#1e293b] p-4 border border-[#334155] space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Governance & Ownership</div>
                <div className="text-base font-bold text-white">{asset.ownerDepartment}</div>
                <div className="text-xs text-slate-300">Responsible Lead: {asset.responsiblePerson}</div>
                <div className="text-xs text-slate-300 font-mono">Installed: {asset.installationDate ? new Date(asset.installationDate).toLocaleDateString() : '2022-04-10'}</div>
              </div>
            </div>

            {/* Description & Geographic Summary */}
            <div className="border-t border-[#1e293b] pt-4">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300 mb-2">Description & Mission</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#1e293b]/50 p-3 border border-[#334155]">
                {asset.description || 'Primary critical utility serving municipal district with high resilience requirements.'}
              </p>
            </div>

            {/* AI Assistant Quick Callout */}
            <div className="bg-indigo-950/20 border border-indigo-800 p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-indigo-300 flex items-center space-x-1.5">
                  <span>AI Infrastructure Intelligence</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Query Google Gemini regarding the risk factors, cascading dependencies, or maintenance history for this asset.
                </p>
              </div>
              <Link
                to={`/ai-assistant?assetId=${asset.id}`}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-medium shrink-0"
              >
                Analyze with Gemini →
              </Link>
            </div>
          </div>
        )}

        {/* 2. TECHNICAL SPECS TAB */}
        {activeTab === 'technical' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-300 border-b border-[#1e293b] pb-2">
              Domain Specifications: {asset.category}
            </h3>

            {asset.category === 'BUILDINGS' && asset.buildingDetails && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Type</div>
                  <div className="text-white font-bold">{asset.buildingDetails.buildingType}</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Floors</div>
                  <div className="text-white font-bold">{asset.buildingDetails.numberOfFloors} Floors</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Total Area</div>
                  <div className="text-white font-bold">{asset.buildingDetails.totalAreaSqMeters} m²</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Occupancy</div>
                  <div className="text-white font-bold">{asset.buildingDetails.occupancyCapacity} People</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Structure</div>
                  <div className="text-white font-bold">{asset.buildingDetails.structuralMaterial}</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Fire Safety</div>
                  <div className="text-emerald-400 font-bold">{asset.buildingDetails.fireSafetyStatus}</div>
                </div>
              </div>
            )}

            {asset.category === 'WATER' && asset.waterDetails && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Water Type</div>
                  <div className="text-white font-bold">{asset.waterDetails.waterAssetType}</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Capacity</div>
                  <div className="text-white font-bold">{asset.waterDetails.capacityLiters?.toLocaleString()} Liters</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Discharge Flow</div>
                  <div className="text-white font-bold">{asset.waterDetails.flowRateLps} L/s</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Pressure</div>
                  <div className="text-white font-bold">{asset.waterDetails.pressureBar} Bar</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Pump Power</div>
                  <div className="text-white font-bold">{asset.waterDetails.pumpPowerKw} kW</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Operating Status</div>
                  <div className="text-emerald-400 font-bold">{asset.waterDetails.operatingStatus}</div>
                </div>
              </div>
            )}

            {asset.category === 'TRANSPORT' && asset.transportDetails && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Type</div>
                  <div className="text-white font-bold">{asset.transportDetails.transportAssetType}</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Length / Span</div>
                  <div className="text-white font-bold">
                    {asset.transportDetails.bridgeLengthMeters || asset.transportDetails.roadLengthKm * 1000} Meters
                  </div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Load Rating</div>
                  <div className="text-white font-bold">{asset.transportDetails.loadCapacityTons} Tons</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Lanes</div>
                  <div className="text-white font-bold">{asset.transportDetails.numberOfLanes} Lanes</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Surface Material</div>
                  <div className="text-white font-bold">{asset.transportDetails.surfaceMaterial}</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Traffic Volume</div>
                  <div className="text-white font-bold">{asset.transportDetails.trafficVolumePcuPerDay?.toLocaleString()} PCU/Day</div>
                </div>
              </div>
            )}

            {asset.category === 'ELECTRICAL' && asset.electricalDetails && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Type</div>
                  <div className="text-white font-bold">{asset.electricalDetails.electricalAssetType}</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Rated Voltage</div>
                  <div className="text-white font-bold">{asset.electricalDetails.voltageKv} kV</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Power Capacity</div>
                  <div className="text-white font-bold">{asset.electricalDetails.capacityKva} kVA</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Phase Count</div>
                  <div className="text-white font-bold">{asset.electricalDetails.phaseCount} Phase</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Manufacturer / Model</div>
                  <div className="text-white font-bold">{asset.electricalDetails.manufacturer} ({asset.electricalDetails.model})</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Operating Temp</div>
                  <div className="text-white font-bold">{asset.electricalDetails.operatingTemperatureC}°C</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. LIFECYCLE TIMELINE TAB */}
        {activeTab === 'lifecycle' && (() => {
          // Compute lifecycle phase based on real data
          const hasScheduledInspections = inspections.some((i: any) => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS');
          const hasOpenWorkOrders = workOrders.some((wo: any) => wo.status !== 'COMPLETED');
          const lastCompletedInspection = inspections.find((i: any) => i.status === 'COMPLETED');

          // Determine current lifecycle phase from asset state
          let currentPhase = asset.lifecycleStatus || 'ACTIVE';
          if (hasScheduledInspections) currentPhase = 'UNDER_INSPECTION';
          else if (hasOpenWorkOrders) currentPhase = 'UNDER_MAINTENANCE';

          // Compute next inspection due (90 days from last completed)
          const lastInspDate = lastCompletedInspection
            ? new Date(lastCompletedInspection.completedDate || lastCompletedInspection.scheduledDate)
            : null;
          const nextInspDue = lastInspDate
            ? new Date(lastInspDate.getTime() + 90 * 24 * 3600000)
            : null;
          const daysToNextInsp = nextInspDue
            ? Math.ceil((nextInspDue.getTime() - Date.now()) / (24 * 3600000))
            : null;

          // Compute asset age
          const installDate = asset.installationDate ? new Date(asset.installationDate) : new Date(asset.createdAt);
          const ageMs = Date.now() - installDate.getTime();
          const ageDays = Math.floor(ageMs / (24 * 3600000));
          const ageYears = Math.floor(ageDays / 365);
          const ageRemDays = ageDays % 365;
          const remainingLife = Math.max(0, (asset.expectedLifeYears || 30) - ageYears);

          // Build phases with real dates
          const phases = [
            { name: 'PLANNED', date: new Date(new Date(installDate).getTime() - 365 * 24 * 3600000).toLocaleDateString(), done: true },
            { name: 'PROCUREMENT', date: new Date(new Date(installDate).getTime() - 180 * 24 * 3600000).toLocaleDateString(), done: true },
            { name: 'INSTALLED', date: installDate.toLocaleDateString(), done: true },
            { name: 'ACTIVE', date: installDate.toLocaleDateString(), current: currentPhase === 'ACTIVE' },
            { name: 'UNDER_INSPECTION', date: hasScheduledInspections ? 'In Progress' : `${inspections.length} completed`, current: currentPhase === 'UNDER_INSPECTION' },
            { name: 'UNDER_MAINTENANCE', date: hasOpenWorkOrders ? 'Work Orders Open' : `${workOrders.filter((wo: any) => wo.status === 'COMPLETED').length} completed`, current: currentPhase === 'UNDER_MAINTENANCE' },
            { name: 'DECOMMISSIONED', date: remainingLife <= 0 ? 'Due' : `~${remainingLife}y remaining`, done: false },
          ];

          // Build chronological milestone log from real events
          const milestones: { date: Date; label: string; type: string }[] = [];
          milestones.push({ date: installDate, label: 'Asset installed and commissioned', type: 'ASSET_INSTALLED' });
          milestones.push({ date: new Date(asset.createdAt), label: 'Asset registered in InfraSphere database', type: 'ASSET_REGISTERED' });

          inspections.forEach((i: any) => {
            milestones.push({
              date: new Date(i.scheduledDate),
              label: `${i.inspectionCode} — ${i.status} (${i.conditionObserved}) ${i.findings?.length ? `• ${i.findings.length} defect(s)` : ''}`,
              type: `INSPECTION_${i.status}`,
            });
          });

          maintenanceHistory.forEach((m: any) => {
            milestones.push({
              date: new Date(m.completionDate),
              label: `${m.description} • Restored to ${m.conditionAfter} • ₹${m.cost?.toLocaleString('en-IN')}`,
              type: 'MAINTENANCE_COMPLETED',
            });
          });

          workOrders.filter((wo: any) => wo.status !== 'COMPLETED').forEach((wo: any) => {
            milestones.push({
              date: new Date(wo.createdAt),
              label: `${wo.orderNumber} — ${wo.title} [${wo.status}] (${wo.priority})`,
              type: 'WORKORDER_OPEN',
            });
          });

          milestones.sort((a, b) => b.date.getTime() - a.date.getTime());

          const getEventColor = (type: string) => {
            if (type.includes('INSPECTION_COMPLETED')) return 'text-emerald-400';
            if (type.includes('INSPECTION_SCHEDULED') || type.includes('INSPECTION_IN_PROGRESS')) return 'text-cyan-400';
            if (type.includes('MAINTENANCE')) return 'text-amber-400';
            if (type.includes('WORKORDER')) return 'text-rose-400';
            return 'text-indigo-400';
          };

          return (
            <div className="space-y-6">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300 border-b border-[#1e293b] pb-2">
                Asset Lifecycle Progression
              </h3>

              {/* Asset Age & Remaining Life Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Asset Age</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">{ageYears}y {ageRemDays}d</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Remaining Design Life</div>
                  <div className={`text-base font-bold font-mono mt-0.5 ${remainingLife <= 5 ? 'text-rose-400' : remainingLife <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {remainingLife} years
                  </div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Current Phase</div>
                  <div className="text-base font-bold font-mono text-indigo-400 mt-0.5">{currentPhase}</div>
                </div>
                <div className="bg-[#1e293b] p-3 border border-[#334155]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Next Inspection Due</div>
                  <div className={`text-sm font-bold font-mono mt-0.5 ${
                    daysToNextInsp == null ? 'text-slate-500'
                      : daysToNextInsp < 0 ? 'text-rose-400'
                        : daysToNextInsp < 14 ? 'text-amber-400'
                          : 'text-emerald-400'
                  }`}>
                    {daysToNextInsp == null
                      ? 'No history'
                      : daysToNextInsp < 0
                        ? `Overdue by ${Math.abs(daysToNextInsp)}d`
                        : `In ${daysToNextInsp}d`}
                  </div>
                  {nextInspDue && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{nextInspDue.toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                {phases.map((step, idx) => (
                  <div
                    key={step.name}
                    className={`p-2 border ${
                      step.current
                        ? 'bg-indigo-950/80 border-indigo-500 text-white font-bold'
                        : step.done
                          ? 'bg-[#1e293b] border-emerald-800/40 text-emerald-400/60'
                          : 'bg-[#1e293b] border-[#334155] text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">{idx + 1}. {step.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{step.date}</div>
                  </div>
                ))}
              </div>

              {/* Milestone Activity Log */}
              <div className="border-t border-[#1e293b] pt-4">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-300 mb-3">
                  Chronological Milestone Log ({milestones.length} events)
                </h4>
                <div className="space-y-2 text-xs font-mono max-h-96 overflow-y-auto">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="p-3 bg-[#1e293b] border border-[#334155] flex justify-between items-start">
                      <div>
                        <span className={`font-bold ${getEventColor(m.type)}`}>{m.type}:</span>
                        <span className="text-slate-300 ml-1.5">{m.label}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0 ml-4">{m.date.toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4. INSPECTIONS TAB */}
        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
                Quality & Condition Inspections
              </h3>
              <button
                onClick={() => setShowInspectionModal(true)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-medium flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Schedule New Inspection</span>
              </button>
            </div>

            {inspections.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-slate-400">
                No inspection records logged for this asset.
              </div>
            ) : (
              <div className="space-y-3">
                {inspections.map((i) => {
                  // Compute lifecycle duration
                  const schedDate = new Date(i.scheduledDate).getTime();
                  const endDate = i.completedDate ? new Date(i.completedDate).getTime() : Date.now();
                  const durationMs = endDate - schedDate;
                  const durationHrs = Math.floor(durationMs / 3600000);
                  const durationDays = Math.floor(durationHrs / 24);
                  const durationStr = durationDays > 0
                    ? `${durationDays}d ${durationHrs % 24}h`
                    : durationHrs > 0
                      ? `${durationHrs}h ${Math.floor((durationMs % 3600000) / 60000)}m`
                      : `${Math.floor(durationMs / 60000)}m`;

                  const statusStyle = i.status === 'COMPLETED'
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                    : i.status === 'IN_PROGRESS'
                      ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800'
                      : 'bg-amber-950/60 text-amber-400 border-amber-800';

                  return (
                    <div key={i.id} className="bg-[#1e293b] border border-[#334155] p-4 text-xs font-mono">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-indigo-400 font-bold">{i.inspectionCode}</span>
                          <span className={`px-1.5 py-0.5 text-[10px] border ${statusStyle}`}>
                            {i.status}
                          </span>
                          <ConditionBadge condition={i.conditionObserved} />
                          {i.overallScore != null && (
                            <span className={`px-1.5 py-0.5 text-[10px] border font-bold ${
                              i.overallScore >= 70 ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                                : i.overallScore >= 40 ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                                  : 'bg-rose-950/60 text-rose-400 border-rose-800'
                            }`}>
                              Score: {i.overallScore}/100
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] space-x-3">
                          <span>Date: {new Date(i.scheduledDate).toLocaleDateString()}</span>
                          <span>Inspector: {i.inspectorName}</span>
                          <span>Duration: <strong className={i.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-200'}>{durationStr}</strong></span>
                        </div>
                      </div>

                      <div className="mt-2 text-slate-300">{i.summary || 'Routine lifecycle evaluation.'}</div>

                      {/* Completion details */}
                      {i.completedDate && (
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-3">
                          <span>Completed: {new Date(i.completedDate).toLocaleString()}</span>
                          {i.nextInspectionDate && (
                            <span>Next Due: <strong className="text-indigo-400">{new Date(i.nextInspectionDate).toLocaleDateString()}</strong></span>
                          )}
                        </div>
                      )}

                      {/* Defect Findings */}
                      {i.findings && i.findings.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#334155] space-y-1.5">
                          <div className="text-[10px] uppercase text-slate-400 font-bold">Defect Findings ({i.findings.length}):</div>
                          {i.findings.map((f: any) => (
                            <div key={f.id || f.title} className="p-2 bg-[#0f172a] border border-[#334155] flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-white">{f.title}</div>
                                <div className="text-[11px] text-slate-400">{f.description}</div>
                                {f.recommendedAction && (
                                  <div className="text-[10px] text-indigo-400 mt-0.5">Action: {f.recommendedAction}</div>
                                )}
                              </div>
                              <SeverityBadge severity={f.severity} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Complete Inspection Action */}
                      {i.status === 'SCHEDULED' && (
                        <div className="mt-3 pt-2 border-t border-[#334155] flex justify-end">
                          <button
                            onClick={() => setShowCompleteInspectionModal(i)}
                            className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white text-xs font-mono font-bold flex items-center space-x-1"
                          >
                            <span>Complete & Log Critical Findings</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. MAINTENANCE & WORK ORDERS TAB */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
                Work Orders & Corrective Maintenance
              </h3>
              <button
                onClick={() => setShowWorkOrderModal(true)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-medium flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Work Order</span>
              </button>
            </div>

            {/* Active Work Orders */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold">Work Orders</h4>
              {workOrders.length === 0 ? (
                <div className="text-center py-4 text-xs font-mono text-slate-400 bg-[#1e293b] p-4">
                  No active work orders.
                </div>
              ) : (
                workOrders.map((wo) => (
                  <div key={wo.id} className="bg-[#1e293b] border border-[#334155] p-4 text-xs font-mono">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-indigo-400 font-bold">{wo.orderNumber}</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {wo.status}
                        </span>
                        <span className="text-amber-400 text-[10px] font-bold">[{wo.priority}]</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Cost: ₹{Number(wo.actualCost || wo.estimatedCost || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="mt-2 text-white font-medium">{wo.title}</div>
                    <div className="text-[11px] text-slate-300 mt-1">{wo.description}</div>
                    <div className="mt-2 text-[10px] text-slate-400">Assigned Technician: {wo.assignedTechnician}</div>

                    {wo.status !== 'COMPLETED' && (
                      <div className="mt-3 pt-2 border-t border-[#334155] flex justify-end">
                        <button
                          onClick={() => setShowCompleteWorkOrderModal(wo)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Complete Repair & Restore Risk</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Historical Maintenance Records */}
            <div className="border-t border-[#1e293b] pt-4 space-y-3">
              <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold">Completed Repair Records</h4>
              {maintenanceHistory.length === 0 ? (
                <div className="text-center py-4 text-xs font-mono text-slate-400">No completed repair history.</div>
              ) : (
                maintenanceHistory.map((m) => (
                  <div key={m.id} className="p-3 bg-[#1e293b]/60 border border-[#334155] text-xs font-mono flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{m.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Performed by {m.performedBy} • Restored condition: <span className="text-emerald-400">{m.conditionAfter}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">₹{m.cost.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">{new Date(m.completionDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 6. RISK & HEALTH ENGINE TAB */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <div>
                <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
                  Deterministic Rule-Based Risk Engine
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Calculated deterministically without machine learning models
                </p>
              </div>
              <button
                onClick={handleRecalculateRisk}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white text-xs font-mono flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Force Recalculate</span>
              </button>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1e293b] p-4 border border-[#334155]">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Deterministic Health Score</div>
                <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                  {riskData?.healthScore ?? asset.healthScore ?? 80}/100
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  Formula: 0.35 * Condition + 0.20 * Age + 0.20 * Inspection + 0.25 * Maintenance
                </div>
              </div>

              <div className="bg-[#1e293b] p-4 border border-[#334155]">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Deterministic Risk Score</div>
                <div className="text-3xl font-bold font-mono text-rose-400 mt-1">
                  {riskData?.riskScore ?? asset.riskScore ?? 20}/100
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  Formula: (Probability * Impact / 100) * Criticality Multiplier
                </div>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="bg-[#1e293b] p-4 border border-[#334155]">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-300 mb-3">Formula Breakdown Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#0f172a] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Condition Score</div>
                  <div className="text-white font-bold mt-0.5">{riskData?.conditionScore ?? 80}/100</div>
                </div>
                <div className="bg-[#0f172a] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Age Score</div>
                  <div className="text-white font-bold mt-0.5">{riskData?.ageScore ?? 85}/100</div>
                </div>
                <div className="bg-[#0f172a] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Inspection Score</div>
                  <div className="text-white font-bold mt-0.5">{riskData?.inspectionScore ?? 95}/100</div>
                </div>
                <div className="bg-[#0f172a] p-3 border border-[#334155]">
                  <div className="text-slate-400 text-[10px]">Maintenance Score</div>
                  <div className="text-white font-bold mt-0.5">{riskData?.maintenanceScore ?? 90}/100</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. DEPENDENCY GRAPH TAB */}
        {activeTab === 'dependencies' && (
          <div className="space-y-6">
            <div className="border-b border-[#1e293b] pb-2">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
                Asset Dependency & Failure Cascade Analysis
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simulates operational disruption if this asset undergoes failure or outage
              </p>
            </div>

            {/* Impact Analysis Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#1e293b] p-3.5 border border-[#334155]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Direct Dependents</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {dependencyGraph?.downstream?.length ?? 0} Assets
                </div>
              </div>
              <div className="bg-[#1e293b] p-3.5 border border-[#334155]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Total At-Risk Upon Failure</div>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                  {dependencyGraph?.impactAnalysis?.totalAtRiskAssets ?? 0} Assets
                </div>
              </div>
              <div className="bg-[#1e293b] p-3.5 border border-[#334155]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Critical Infrastructure Dependents</div>
                <div className="text-sm font-bold font-mono text-amber-400 mt-1">
                  {dependencyGraph?.impactAnalysis?.criticalAssetsAtRisk?.length || 'None'}
                </div>
              </div>
            </div>

            {/* Downstream Assets List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
                Downstream Assets Depending on this Node:
              </h4>

              {!dependencyGraph?.downstream || dependencyGraph.downstream.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 p-4 bg-[#1e293b]">
                  No downstream dependencies registered.
                </div>
              ) : (
                dependencyGraph.downstream.map((dep: any) => (
                  <div
                    key={dep.dependencyId}
                    className="p-3 bg-[#1e293b] border border-[#334155] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center space-x-2">
                        <Link to={`/assets/${dep.asset?.id}`} className="text-indigo-400 hover:underline">
                          {dep.asset?.assetCode}
                        </Link>
                        <span>— {dep.asset?.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Relationship: <strong className="text-slate-200">{dep.relationship}</strong> | Criticality: <strong className="text-amber-400">{dep.criticality}</strong>
                      </div>
                    </div>
                    <Link
                      to={`/assets/${dep.asset?.id}`}
                      className="px-2.5 py-1 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-indigo-300 inline-flex items-center space-x-1"
                    >
                      <span>Inspect Node</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Upstream Assets List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
                Upstream Suppliers & Pre-requisites (This Node Depends On):
              </h4>

              {!dependencyGraph?.upstream || dependencyGraph.upstream.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 p-4 bg-[#1e293b]">
                  No upstream suppliers registered.
                </div>
              ) : (
                dependencyGraph.upstream.map((dep: any) => (
                  <div
                    key={dep.dependencyId}
                    className="p-3 bg-[#1e293b] border border-[#334155] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center space-x-2">
                        <Link to={`/assets/${dep.asset?.id}`} className="text-indigo-400 hover:underline">
                          {dep.asset?.assetCode}
                        </Link>
                        <span>— {dep.asset?.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Relationship: <strong className="text-slate-200">{dep.relationship}</strong>
                      </div>
                    </div>
                    <Link
                      to={`/assets/${dep.asset?.id}`}
                      className="px-2.5 py-1 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] text-indigo-300 inline-flex items-center space-x-1"
                    >
                      <span>Inspect Node</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 8. AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-300 border-b border-[#1e293b] pb-2">
              Immutable Asset Audit Trail
            </h3>

            {auditLogs.length === 0 ? (
              <div className="text-xs font-mono text-slate-400 text-center py-6">
                No direct audit log entries found for this asset ID.
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#1e293b] border border-[#334155] text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-400 text-[10px]">
                      <span className="font-bold text-indigo-400 uppercase">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-200 mt-1">
                      Actor: <strong>{log.actorName || 'System Service'}</strong> ({log.service})
                    </div>
                    {log.newValues && (
                      <pre className="mt-2 p-2 bg-[#0f172a] border border-[#334155] text-[10px] text-slate-300 overflow-x-auto max-h-32">
                        {log.newValues}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SCHEDULE INSPECTION MODAL */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-[#334155] max-w-lg w-full p-5 space-y-4 text-xs font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
              <h3 className="font-bold text-white text-sm">Schedule Inspection for {asset.assetCode}</h3>
              <button onClick={() => setShowInspectionModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Inspector Name</label>
                <input
                  type="text"
                  value={newInsp.inspectorName}
                  onChange={(e) => setNewInsp({ ...newInsp, inspectorName: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={newInsp.scheduledDate}
                  onChange={(e) => setNewInsp({ ...newInsp, scheduledDate: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Summary / Objective</label>
                <input
                  type="text"
                  value={newInsp.summary}
                  onChange={(e) => setNewInsp({ ...newInsp, summary: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-3 py-1.5 bg-[#1e293b] text-slate-300 border border-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE INSPECTION MODAL (Demo Flow Step 10) */}
      {showCompleteInspectionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-[#334155] max-w-lg w-full p-5 space-y-4 text-xs font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
              <h3 className="font-bold text-rose-400 text-sm">
                Complete Inspection: {showCompleteInspectionModal.inspectionCode}
              </h3>
              <button onClick={() => setShowCompleteInspectionModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Condition Observed Post-Audit</label>
                <select
                  value={completeInspData.conditionObserved}
                  onChange={(e) => setCompleteInspData({ ...completeInspData, conditionObserved: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                >
                  <option value="CRITICAL">CRITICAL (Defect Active)</option>
                  <option value="POOR">POOR (Severe Deterioration)</option>
                  <option value="FAIR">FAIR (Functional with wear)</option>
                  <option value="GOOD">GOOD (Operating Normal)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Critical Finding Defect Title</label>
                <input
                  type="text"
                  value={completeInspData.findingsTitle}
                  onChange={(e) => setCompleteInspData({ ...completeInspData, findingsTitle: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Finding Severity</label>
                <select
                  value={completeInspData.findingsSeverity}
                  onChange={(e) => setCompleteInspData({ ...completeInspData, findingsSeverity: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Inspection Summary & Finding Notes</label>
                <textarea
                  rows={2}
                  value={completeInspData.findingsDesc}
                  onChange={(e) => setCompleteInspData({ ...completeInspData, findingsDesc: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteInspectionModal(null)}
                  className="px-3 py-1.5 bg-[#1e293b] text-slate-300 border border-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteInspection(showCompleteInspectionModal.id)}
                  className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold"
                >
                  Publish & Trigger Recalculation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {showWorkOrderModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-[#334155] max-w-lg w-full p-5 space-y-4 text-xs font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
              <h3 className="font-bold text-white text-sm">Create Work Order for {asset.assetCode}</h3>
              <button onClick={() => setShowWorkOrderModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Work Order Title</label>
                <input
                  type="text"
                  value={newWO.title}
                  onChange={(e) => setNewWO({ ...newWO, title: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Maintenance Type</label>
                <select
                  value={newWO.maintenanceType}
                  onChange={(e) => setNewWO({ ...newWO, maintenanceType: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                >
                  <option value="CORRECTIVE">CORRECTIVE (Repair defect)</option>
                  <option value="PREVENTIVE">PREVENTIVE (Routine service)</option>
                  <option value="EMERGENCY">EMERGENCY (Outage mitigation)</option>
                  <option value="REPLACEMENT">REPLACEMENT (Part replacement)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority</label>
                <select
                  value={newWO.priority}
                  onChange={(e) => setNewWO({ ...newWO, priority: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                >
                  <option value="URGENT">URGENT (Immediate Dispatch)</option>
                  <option value="HIGH">HIGH</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={newWO.assignedTechnician}
                  onChange={(e) => setNewWO({ ...newWO, assignedTechnician: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={newWO.estimatedCost}
                  onChange={(e) => setNewWO({ ...newWO, estimatedCost: Number(e.target.value) })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowWorkOrderModal(false)}
                  className="px-3 py-1.5 bg-[#1e293b] text-slate-300 border border-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Create & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE WORK ORDER MODAL (Demo Flow Step 19) */}
      {showCompleteWorkOrderModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-[#334155] max-w-lg w-full p-5 space-y-4 text-xs font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
              <h3 className="font-bold text-emerald-400 text-sm">
                Complete Work Order: {showCompleteWorkOrderModal.orderNumber}
              </h3>
              <button onClick={() => setShowCompleteWorkOrderModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Actual Incurred Cost (₹)</label>
                <input
                  type="number"
                  value={completeWOData.actualCost}
                  onChange={(e) => setCompleteWOData({ ...completeWOData, actualCost: Number(e.target.value) })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Restored Condition After Repair</label>
                <select
                  value={completeWOData.conditionAfter}
                  onChange={(e) => setCompleteWOData({ ...completeWOData, conditionAfter: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                >
                  <option value="EXCELLENT">EXCELLENT (Fully overhauled)</option>
                  <option value="GOOD">GOOD (Operating within spec)</option>
                  <option value="FAIR">FAIR (Temporary repair)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Work Order Resolution Notes</label>
                <textarea
                  rows={3}
                  value={completeWOData.resolutionNotes}
                  onChange={(e) => setCompleteWOData({ ...completeWOData, resolutionNotes: e.target.value })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteWorkOrderModal(null)}
                  className="px-3 py-1.5 bg-[#1e293b] text-slate-300 border border-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteWorkOrder(showCompleteWorkOrderModal.id)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Mark Completed & Restore Score
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
