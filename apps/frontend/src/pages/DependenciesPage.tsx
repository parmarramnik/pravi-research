import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import {
  Network,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { CategoryBadge, RiskBadge } from '../components/Badges';

export const DependenciesPage: React.FC = () => {
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [graphData, setGraphData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await apiClient.get('/assets?limit=50');
        if (res.data.success && res.data.data.length > 0) {
          setAssetsList(res.data.data);
          setSelectedAssetId(res.data.data[0].id);
        }
      } catch (e) {
        // error
      }
    };
    fetchAssets();
  }, []);

  const fetchGraph = async (assetId: string) => {
    if (!assetId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/assets/${assetId}/dependencies`);
      if (res.data.success) {
        setGraphData(res.data.data);
      }
    } catch (e) {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAssetId) {
      fetchGraph(selectedAssetId);
    }
  }, [selectedAssetId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">INTER-ASSET DEPENDENCY & CASCADE ANALYSIS</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Topology mapping, upstream supplies, and cascading failure impact propagation
          </p>
        </div>

        {/* Node selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Select Root Asset:</span>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] px-3 py-1.5 text-xs text-white font-mono focus:outline-none max-w-xs truncate"
          >
            {assetsList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.assetCode} — {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !graphData ? (
        <div className="py-16 text-center font-mono text-slate-400 text-xs">
          Calculating topological dependency network and downstream blast radius...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Failure Blast Radius Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Target Root Node</div>
              <div className="text-sm font-bold text-indigo-400 font-mono mt-1">
                {graphData.rootAsset.assetCode}
              </div>
              <div className="text-[11px] text-white truncate mt-0.5">{graphData.rootAsset.name}</div>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Direct Dependents</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {graphData.impactAnalysis?.directlyImpactedCount ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Immediate first-degree links</div>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Indirect Cascading Impact</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {graphData.impactAnalysis?.indirectlyImpactedCount ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Multi-hop dependent nodes</div>
            </div>

            <div className="bg-[#0f172a] border border-rose-900/60 p-3.5 bg-rose-950/10">
              <div className="text-[10px] font-mono text-rose-400 uppercase flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Total Disruption Blast Radius</span>
              </div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                {graphData.impactAnalysis?.totalAtRiskAssets ?? 0} Assets
              </div>
              <div className="text-[10px] text-rose-400 font-mono">Vulnerable if this node fails</div>
            </div>
          </div>

          {/* Visual Topology Diagram */}
          <div className="bg-[#0f172a] border border-[#1e293b] p-5">
            <h2 className="text-xs font-mono font-bold uppercase text-slate-300 mb-4 pb-2 border-b border-[#1e293b]">
              Topological Blast Radius Cascade
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-mono text-xs">
              {/* Upstream Column */}
              <div className="space-y-3">
                <div className="px-3 py-1.5 bg-[#1e293b] border border-[#334155] text-slate-300 font-bold uppercase text-[10px]">
                  ← 1. Upstream Suppliers (Feeds Root Node)
                </div>

                {graphData.upstream?.length === 0 ? (
                  <div className="p-3 bg-[#1e293b]/40 border border-[#334155] text-slate-500 text-[11px]">
                    No upstream suppliers registered.
                  </div>
                ) : (
                  graphData.upstream.map((u: any) => (
                    <div key={u.dependencyId} className="p-3 bg-[#1e293b] border border-[#334155] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-400 font-bold">{u.asset?.assetCode}</span>
                        <span className="text-[10px] px-1 bg-slate-800 text-slate-400">{u.relationship}</span>
                      </div>
                      <div className="text-white text-xs truncate">{u.asset?.name}</div>
                      <div className="text-[10px] text-slate-400">Criticality: {u.criticality}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Center Root Node */}
              <div className="space-y-3">
                <div className="px-3 py-1.5 bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold uppercase text-[10px] text-center">
                  ● 2. Target Subject Asset
                </div>

                <div className="p-4 bg-indigo-950/40 border-2 border-indigo-500 text-center space-y-2">
                  <span className="text-base font-bold text-white font-mono">{graphData.rootAsset.assetCode}</span>
                  <div className="text-xs text-indigo-200 font-semibold">{graphData.rootAsset.name}</div>
                  <div className="flex justify-center gap-1.5 pt-1">
                    <CategoryBadge category={graphData.rootAsset.category} />
                    <RiskBadge score={graphData.rootAsset.riskScore} />
                  </div>
                  <div className="text-[10px] text-slate-400 pt-2 border-t border-indigo-900">
                    If this asset suffers an unscheduled shutdown, failure cascades downstream.
                  </div>
                </div>
              </div>

              {/* Downstream Column */}
              <div className="space-y-3">
                <div className="px-3 py-1.5 bg-[#1e293b] border border-[#334155] text-rose-300 font-bold uppercase text-[10px]">
                  → 3. Downstream Dependents (Disrupted Upon Outage)
                </div>

                {graphData.downstream?.length === 0 ? (
                  <div className="p-3 bg-[#1e293b]/40 border border-[#334155] text-slate-500 text-[11px]">
                    No direct downstream dependents.
                  </div>
                ) : (
                  graphData.downstream.map((d: any) => (
                    <div key={d.dependencyId} className="p-3 bg-[#1e293b] border border-[#334155] space-y-1">
                      <div className="flex justify-between items-center">
                        <Link to={`/assets/${d.asset?.id}`} className="text-indigo-400 font-bold hover:underline">
                          {d.asset?.assetCode}
                        </Link>
                        <span className="text-[10px] px-1 bg-rose-950/60 text-rose-300 border border-rose-800">
                          {d.relationship}
                        </span>
                      </div>
                      <div className="text-white text-xs truncate">{d.asset?.name}</div>
                      <div className="text-[10px] text-amber-400 font-medium">Criticality: {d.criticality}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Critical Dependents Alert */}
          {graphData.impactAnalysis?.criticalAssetsAtRisk?.length > 0 && (
            <div className="p-4 bg-rose-950/30 border border-rose-800 text-xs font-mono space-y-1">
              <div className="font-bold text-rose-300 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>MISSION CRITICAL INFRASTRUCTURE AT RISK UPON FAILURE</span>
              </div>
              <p className="text-slate-300">
                The following essential facilities directly rely on this node and have no active bypass:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {graphData.impactAnalysis.criticalAssetsAtRisk.map((c: string) => (
                  <span key={c} className="px-2 py-1 bg-rose-950 border border-rose-700 text-rose-200 font-bold text-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
