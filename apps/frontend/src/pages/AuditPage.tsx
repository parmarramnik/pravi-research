import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { History, Filter, ChevronDown, ChevronRight } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const url = entityFilter ? `/audit?entity=${entityFilter}` : '/audit';
      const res = await apiClient.get(url);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [entityFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">SYSTEM AUDIT TRAIL</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Immutable, append-only provenance record across all microservices
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
          >
            <option value="">All Entities</option>
            <option value="Asset">Assets</option>
            <option value="Inspection">Inspections</option>
            <option value="WorkOrder">Work Orders</option>
            <option value="RiskScore">Risk Calculations</option>
          </select>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-[#1e293b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e293b] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Entity ID</th>
                <th className="py-2.5 px-3">Actor / Source</th>
                <th className="py-2.5 px-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading audit log...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No audit records found.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-[#1e293b]/40">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-800 font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white font-medium">{log.entity}</td>
                        <td className="py-2.5 px-3 text-slate-400">{log.entityId.substring(0, 12)}...</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {log.actorName || log.service}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            className="px-2 py-0.5 bg-[#1e293b] border border-[#334155] text-slate-300 hover:text-white inline-flex items-center space-x-1"
                          >
                            <span>Diff</span>
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && log.newValues && (
                        <tr>
                          <td colSpan={6} className="p-3 bg-[#090d16] border-b border-[#1e293b]">
                            <pre className="text-[10px] text-slate-300 overflow-x-auto max-h-40 bg-[#0f172a] p-2 border border-[#334155]">
                              {log.newValues}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
