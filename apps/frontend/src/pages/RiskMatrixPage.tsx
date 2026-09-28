import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { AlertTriangle, Settings, RefreshCw, ExternalLink } from 'lucide-react';
import { RiskBadge, HealthBadge } from '../components/Badges';

export const RiskMatrixPage: React.FC = () => {
  const [matrix, setMatrix] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const [matrixRes, risksRes, configRes] = await Promise.allSettled([
        apiClient.get('/risks/matrix'),
        apiClient.get('/risks?limit=20'),
        apiClient.get('/risks/config'),
      ]);

      if (matrixRes.status === 'fulfilled' && matrixRes.value.data.success) {
        setMatrix(matrixRes.value.data.data);
      }
      if (risksRes.status === 'fulfilled' && risksRes.value.data.success) {
        setRisks(risksRes.value.data.data);
      }
      if (configRes.status === 'fulfilled' && configRes.value.data.success) {
        setConfig(configRes.value.data.data);
      }
    } catch (e) {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch('/risks/config', config);
      setShowConfigModal(false);
      fetchRiskData();
    } catch (e) {
      alert('Failed to update scoring configuration');
    }
  };

  const riskLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const criticalityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">DETERMINISTIC RISK & HEALTH ENGINE</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Rule-based multi-criteria risk matrix without probabilistic machine learning models
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white text-xs font-mono font-medium self-start md:self-auto"
        >
          <Settings className="w-3.5 h-3.5 text-indigo-400" />
          <span>Configure Scoring Weights</span>
        </button>
      </div>

      {/* 4x4 Risk Matrix */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-5">
        <h2 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3">
          4x4 Risk Level vs Criticality Heat Matrix
        </h2>

        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Header row */}
            <div className="grid grid-cols-5 text-center text-xs font-mono font-semibold text-slate-400 mb-1">
              <div className="text-left text-[11px] uppercase">Risk \ Criticality</div>
              <div>LOW</div>
              <div>MEDIUM</div>
              <div>HIGH</div>
              <div className="text-rose-400">CRITICAL</div>
            </div>

            {/* Matrix rows */}
            {riskLevels.map((rLevel) => (
              <div key={rLevel} className="grid grid-cols-5 gap-1.5 mb-1.5 font-mono text-xs">
                <div className={`p-3 font-bold border flex items-center ${
                  rLevel === 'CRITICAL' ? 'bg-rose-950/40 border-rose-900 text-rose-300' :
                  rLevel === 'HIGH' ? 'bg-amber-950/40 border-amber-900 text-amber-300' :
                  rLevel === 'MEDIUM' ? 'bg-yellow-950/30 border-yellow-900 text-yellow-300' :
                  'bg-emerald-950/30 border-emerald-900 text-emerald-300'
                }`}>
                  {rLevel}
                </div>

                {criticalityLevels.map((cLevel) => {
                  const count = matrix?.[rLevel]?.[cLevel] ?? 0;
                  let bg = 'bg-[#1e293b] border-[#334155] text-slate-400';
                  if (count > 0) {
                    if (rLevel === 'CRITICAL' || cLevel === 'CRITICAL') {
                      bg = 'bg-rose-950/70 border-rose-700 text-white font-bold';
                    } else if (rLevel === 'HIGH' || cLevel === 'HIGH') {
                      bg = 'bg-amber-950/60 border-amber-700 text-amber-200 font-bold';
                    } else {
                      bg = 'bg-indigo-950/50 border-indigo-700 text-indigo-200';
                    }
                  }

                  return (
                    <div
                      key={cLevel}
                      className={`p-3 text-center border flex flex-col items-center justify-center ${bg}`}
                    >
                      <span className="text-lg">{count}</span>
                      <span className="text-[10px] opacity-70">Assets</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculated Risk Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] overflow-hidden">
        <div className="p-3 border-b border-[#1e293b] flex justify-between items-center">
          <h2 className="text-xs font-mono font-bold uppercase text-slate-300">
            Computed Asset Risk Evaluations ({risks.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">Deterministic Score Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e293b] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Asset Code</th>
                <th className="py-2.5 px-3">Health Score</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Criticality</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Maintenance Priority</th>
                <th className="py-2.5 px-3">Last Trigger Event</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {risks.map((r) => (
                <tr key={r.id} className="hover:bg-[#1e293b]/40">
                  <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">
                    <Link to={`/assets/${r.assetId}`} className="hover:underline">
                      {r.assetCode || r.assetId.substring(0, 8)}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-emerald-400 font-bold">{r.healthScore}/100</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-rose-400 font-bold">{r.riskScore}/100</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{r.criticality}</td>
                  <td className="py-2.5 px-3">
                    <RiskBadge level={r.riskLevel} />
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono border ${
                      r.maintenancePriority === 'URGENT'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-700 font-bold'
                        : r.maintenancePriority === 'HIGH'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                        : 'bg-[#1e293b] text-slate-300 border-[#334155]'
                    }`}>
                      {r.maintenancePriority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                    {r.triggerEvent || 'initial.seed'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      to={`/assets/${r.assetId}?tab=risk`}
                      className="px-2 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-indigo-300 inline-flex items-center space-x-1 font-mono text-xs"
                    >
                      <span>Breakdown</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Weights Config Modal */}
      {showConfigModal && config && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-[#334155] max-w-md w-full p-5 space-y-4 text-xs font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
              <h3 className="font-bold text-white text-sm">Deterministic Rule Scoring Weights</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateConfig} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Condition Weight (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.conditionWeight}
                  onChange={(e) => setConfig({ ...config, conditionWeight: Number(e.target.value) })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Age Weight (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.ageWeight}
                  onChange={(e) => setConfig({ ...config, ageWeight: Number(e.target.value) })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Inspection Weight (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.inspectionWeight}
                  onChange={(e) => setConfig({ ...config, inspectionWeight: Number(e.target.value) })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Maintenance Weight (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.maintenanceWeight}
                  onChange={(e) => setConfig({ ...config, maintenanceWeight: Number(e.target.value) })}
                  className="w-full bg-[#1e293b] border border-[#334155] p-2 text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 bg-[#1e293b] text-slate-300 border border-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
