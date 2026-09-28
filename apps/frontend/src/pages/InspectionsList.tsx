import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Filter, ExternalLink, Clock, Timer, CalendarCheck } from 'lucide-react';
import { ConditionBadge, SeverityBadge } from '../components/Badges';

/** Compute human-readable elapsed or remaining time from a date */
function timeRelative(dateStr: string, isDeadline = false): { label: string; color: string } {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diffMs = isDeadline ? target - now : now - target;
  const absDiffMs = Math.abs(diffMs);

  const mins = Math.floor(absDiffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  let label: string;
  if (days > 0) label = `${days}d ${hrs % 24}h`;
  else if (hrs > 0) label = `${hrs}h ${mins % 60}m`;
  else label = `${mins}m`;

  if (isDeadline) {
    if (diffMs < 0) return { label: `Overdue by ${label}`, color: 'text-rose-400' };
    if (days <= 1) return { label: `Due in ${label}`, color: 'text-amber-400' };
    return { label: `Due in ${label}`, color: 'text-slate-300' };
  }

  return { label: `${label} ago`, color: days > 30 ? 'text-amber-400' : 'text-slate-400' };
}

/** Calculate inspection lifecycle duration (scheduled → completed) */
function lifecycleDuration(scheduled: string, completed?: string): string {
  const start = new Date(scheduled).getTime();
  const end = completed ? new Date(completed).getTime() : Date.now();
  const diffMs = end - start;
  if (diffMs < 0) return '—';

  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${Math.floor((diffMs % 3600000) / 60000)}m`;
  return `${Math.floor(diffMs / 60000)}m`;
}

export const InspectionsList: React.FC = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/inspections?status=${statusFilter}` : '/inspections';
      const res = await apiClient.get(url);
      if (res.data.success) {
        setInspections(res.data.data);
      }
    } catch (e) {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [statusFilter]);

  // Auto-refresh timer for live elapsed/remaining time
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
      case 'SCHEDULED':
        return 'bg-amber-950/60 text-amber-400 border-amber-800';
      case 'CANCELLED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Summary counts
  const scheduledCount = inspections.filter(i => i.status === 'SCHEDULED').length;
  const inProgressCount = inspections.filter(i => i.status === 'IN_PROGRESS').length;
  const completedCount = inspections.filter(i => i.status === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">QUALITY & SAFETY INSPECTIONS</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Lifecycle tracking, defect severities, and compliance evaluations
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-800">{scheduledCount} Scheduled</span>
            <span className="px-1.5 py-0.5 bg-indigo-950/60 text-indigo-400 border border-indigo-800">{inProgressCount} Active</span>
            <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800">{completedCount} Closed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1e293b] border border-[#334155] px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
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
                <th className="py-2.5 px-3">Inspection Code</th>
                <th className="py-2.5 px-3">Asset Code</th>
                <th className="py-2.5 px-3">Scheduled Date</th>
                <th className="py-2.5 px-3">Auditor</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Lifecycle Duration</th>
                <th className="py-2.5 px-3">Condition Observed</th>
                <th className="py-2.5 px-3">Defects Logged</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono">
                    Loading inspections...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono">
                    No inspections found.
                  </td>
                </tr>
              ) : (
                inspections.map((i) => {
                  const scheduled = timeRelative(i.scheduledDate, i.status === 'SCHEDULED');
                  const duration = lifecycleDuration(i.scheduledDate, i.completedDate);

                  return (
                    <tr key={i.id} className="hover:bg-[#1e293b]/40">
                      <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">
                        {i.inspectionCode}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {i.assetCode || i.assetId.substring(0, 8)}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="text-slate-300">{new Date(i.scheduledDate).toLocaleDateString()}</div>
                        <div className={`text-[10px] ${scheduled.color} flex items-center space-x-1 mt-0.5`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{scheduled.label}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{i.inspectorName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono border ${getStatusStyle(i.status)}`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Timer className="w-3 h-3 text-slate-500" />
                          <span className={`text-[11px] ${i.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {duration}
                          </span>
                        </div>
                        {i.completedDate && (
                          <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                            <CalendarCheck className="w-2.5 h-2.5" />
                            <span>{new Date(i.completedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <ConditionBadge condition={i.conditionObserved} />
                      </td>
                      <td className="py-2.5 px-3">
                        {i.findings?.length > 0 ? (
                          <span className="text-[10px] font-mono font-bold text-rose-400">
                            {i.findings.length} Defect{i.findings.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {i.overallScore != null ? (
                          <span className={`text-[11px] font-bold ${
                            i.overallScore >= 70 ? 'text-emerald-400'
                              : i.overallScore >= 40 ? 'text-amber-400'
                                : 'text-rose-400'
                          }`}>
                            {i.overallScore}/100
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/assets/${i.assetId}?tab=inspections`}
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
