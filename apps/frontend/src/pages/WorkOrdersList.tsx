import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { Wrench, Filter, ExternalLink, Clock, Timer, CalendarCheck } from 'lucide-react';

/** Compute human-readable elapsed time from a date */
function timeAgo(dateStr: string): { label: string; color: string } {
  const target = new Date(dateStr).getTime();
  const diffMs = Date.now() - target;
  const absDiffMs = Math.abs(diffMs);
  const mins = Math.floor(absDiffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  let label: string;
  if (days > 0) label = `${days}d ${hrs % 24}h`;
  else if (hrs > 0) label = `${hrs}h ${mins % 60}m`;
  else label = `${mins}m`;

  return { label: `${label} ago`, color: days > 14 ? 'text-amber-400' : 'text-slate-400' };
}

/** Calculate work order turnaround time */
function turnaroundTime(created: string, completed?: string): string {
  const start = new Date(created).getTime();
  const end = completed ? new Date(completed).getTime() : Date.now();
  const diffMs = end - start;
  if (diffMs < 0) return '—';

  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${Math.floor((diffMs % 3600000) / 60000)}m`;
  return `${Math.floor(diffMs / 60000)}m`;
}

export const WorkOrdersList: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/work-orders?status=${statusFilter}` : '/work-orders';
      const res = await apiClient.get(url);
      if (res.data.success) {
        setWorkOrders(res.data.data);
      }
    } catch (e) {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [statusFilter]);

  // Auto-refresh for live elapsed time
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-indigo-950/60 text-indigo-400 border-indigo-800';
      case 'ASSIGNED':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-800';
      case 'OPEN':
        return 'bg-amber-950/60 text-amber-400 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-950/80 text-rose-300 border-rose-700 font-bold';
      case 'HIGH':
        return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'NORMAL':
        return 'bg-[#1e293b] text-slate-300 border-[#334155]';
      case 'LOW':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-[#1e293b] text-slate-300 border-[#334155]';
    }
  };

  // Summary counts
  const openCount = workOrders.filter(wo => wo.status === 'OPEN' || wo.status === 'ASSIGNED').length;
  const activeCount = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
  const closedCount = workOrders.filter(wo => wo.status === 'COMPLETED').length;
  const totalSpend = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || wo.estimatedCost || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">MAINTENANCE & WORK ORDERS</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Technician assignments, corrective repairs, turnaround tracking & expenditure
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Summary pills */}
          <div className="flex items-center space-x-1.5 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-800">{openCount} Open</span>
            <span className="px-1.5 py-0.5 bg-indigo-950/60 text-indigo-400 border border-indigo-800">{activeCount} Active</span>
            <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800">{closedCount} Closed</span>
            <span className="px-1.5 py-0.5 bg-[#1e293b] text-slate-300 border border-[#334155]">₹{totalSpend.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1e293b] border border-[#334155] px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-[#1e293b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e293b] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Asset Code</th>
                <th className="py-2.5 px-3">Title & Purpose</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Turnaround</th>
                <th className="py-2.5 px-3">Assigned Lead</th>
                <th className="py-2.5 px-3">Cost (₹)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono">
                    Loading work orders...
                  </td>
                </tr>
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono">
                    No work orders found.
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => {
                  const created = timeAgo(wo.createdAt);
                  const tat = turnaroundTime(wo.createdAt, wo.actualEndDate);

                  return (
                    <tr key={wo.id} className="hover:bg-[#1e293b]/40">
                      <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">
                        {wo.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {wo.assetCode || wo.assetId?.substring(0, 8)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{wo.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{wo.description}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{wo.maintenanceType}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono border ${getPriorityStyle(wo.priority)}`}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono border ${getStatusStyle(wo.status)}`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Timer className="w-3 h-3 text-slate-500" />
                          <span className={`text-[11px] ${wo.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {tat}
                          </span>
                        </div>
                        <div className={`text-[10px] ${created.color} flex items-center space-x-1 mt-0.5`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>Created {created.label}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{wo.assignedTechnician || 'Unassigned'}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">
                        ₹{Number(wo.actualCost || wo.estimatedCost || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/assets/${wo.assetId}?tab=maintenance`}
                          className="px-2 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-indigo-300 inline-flex items-center space-x-1 font-mono text-xs"
                        >
                          <span>View Asset</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
