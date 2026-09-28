import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
  TrendingUp,
  MapPin,
  Bot,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { RiskBadge, StatusBadge, ConditionBadge } from '../components/Badges';

export const Dashboard: React.FC = () => {
  const { user, canManageAssets } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, assetsRes, notifRes] = await Promise.allSettled([
        apiClient.get('/analytics/dashboard'),
        apiClient.get('/assets?limit=6'),
        apiClient.get('/notifications?limit=5'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data.success) {
        setStats(dashRes.value.data.data);
      }
      if (assetsRes.status === 'fulfilled' && assetsRes.value.data.success) {
        setRecentAssets(assetsRes.value.data.data);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
        setAlerts(notifRes.value.data.data);
      }
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time polling every 10 seconds
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const categoryColors: Record<string, string> = {
    BUILDINGS: '#0284c7',
    WATER: '#0891b2',
    TRANSPORT: '#d97706',
    ELECTRICAL: '#7c3aed',
  };

  const conditionColors: Record<string, string> = {
    EXCELLENT: '#059669',
    GOOD: '#4f46e5',
    FAIR: '#d97706',
    POOR: '#e11d48',
    CRITICAL: '#9f1239',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1f2937]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              AHMEDABAD METROPOLITAN INFRASTRUCTURE COMMAND
            </h1>
            <span className="flex items-center space-x-1 text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 border border-emerald-800">
              <span className="w-1.5 h-1.5 bg-emerald-400"></span>
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            40 geo-referenced municipal assets across AMC & AUDA jurisdictions • Real-time deterministic risk engine
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {canManageAssets ? (
            <Link
              to="/assets/new"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Asset</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#111827] border border-[#1f2937] text-slate-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user?.role || 'VIEWER'}: READ-ONLY</span>
            </div>
          )}
          <Link
            to="/map"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] text-white text-xs font-mono font-medium"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ahmedabad GIS Map</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] text-white text-xs font-mono font-medium"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Assets</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{stats?.totalAssets ?? 40}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">4 Core Domains</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Active Operational</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{stats?.activeAssets ?? 34}</div>
          <div className="text-[10px] text-emerald-500 font-mono mt-0.5">Online & functional</div>
        </div>

        <div className="bg-[#0f172a] border border-rose-900/60 p-3.5 bg-rose-950/10">
          <div className="text-[11px] font-mono text-rose-400 uppercase flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Critical Assets</span>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{stats?.criticalAssets ?? 3}</div>
          <div className="text-[10px] text-rose-400 font-mono mt-0.5">Immediate review req.</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Under Maintenance</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{stats?.underMaintenance ?? 4}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Active work orders</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Open Work Orders</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{stats?.openWorkOrders ?? 8}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Assigned to technicians</div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] p-3.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Maintenance Spend</div>
          <div className="text-2xl font-bold text-slate-200 mt-1 font-mono">
            ₹{stats?.totalMaintenanceSpend ? (stats.totalMaintenanceSpend / 100000).toFixed(1) + 'L' : '28.4L'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Year to date</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b]">
            <h2 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Asset Inventory by Category
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Total Count</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.categoryBreakdown || [
                  { category: 'BUILDINGS', count: 10 },
                  { category: 'WATER', count: 10 },
                  { category: 'TRANSPORT', count: 10 },
                  { category: 'ELECTRICAL', count: 10 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 0, fontSize: 12 }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="count">
                  {(stats?.categoryBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Condition Distribution */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b]">
            <h2 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Observed Condition Distribution
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Physical Health</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.conditionDistribution || [
                  { condition: 'EXCELLENT', count: 14 },
                  { condition: 'GOOD', count: 16 },
                  { condition: 'FAIR', count: 6 },
                  { condition: 'POOR', count: 3 },
                  { condition: 'CRITICAL', count: 1 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="condition" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 0, fontSize: 12 }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="count">
                  {(stats?.conditionDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cond-${index}`} fill={conditionColors[entry.condition] || '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables: Recent Assets & Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Assets Table */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b]">
            <h2 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Recently Tracked Assets
            </h2>
            <Link to="/assets" className="text-xs font-mono text-indigo-400 hover:text-indigo-300">
              View All Assets →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e293b] text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Asset Code</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Risk Level</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {recentAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#1e293b]/50">
                    <td className="py-2.5 px-3 font-mono text-indigo-400 font-medium">
                      {asset.assetCode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{asset.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1e293b] text-slate-300 border border-[#334155]">
                        {asset.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge score={asset.riskScore} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/assets/${asset.id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-[#0f172a] border border-[#1e293b] p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b]">
            <h2 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Critical Alerts & Events
            </h2>
            <Link to="/notifications" className="text-xs font-mono text-indigo-400 hover:text-indigo-300">
              All ({alerts.length})
            </Link>
          </div>

          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="text-xs text-slate-400 font-mono py-4 text-center">No active critical alerts.</div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-2.5 border text-xs ${
                    al.severity === 'CRITICAL'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : al.severity === 'ALERT'
                      ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                      : 'bg-[#1e293b] border-[#334155] text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{al.title}</span>
                    <span className="text-[10px] font-mono opacity-60">
                      {new Date(al.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">{al.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
