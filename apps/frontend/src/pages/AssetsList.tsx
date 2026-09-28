import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  PlusCircle,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import {
  RiskBadge,
  HealthBadge,
  StatusBadge,
  ConditionBadge,
  CategoryBadge,
} from '../components/Badges';

export const AssetsList: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAssets = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (condition) params.set('condition', condition);
      if (status) params.set('status', status);

      const res = await apiClient.get(`/assets?${params.toString()}`);
      if (res.data.success) {
        setAssets(res.data.data);
        if (res.data.meta) setMeta(res.data.meta);
      }
    } catch (e) {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(1);
  }, [category, condition, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets(1);
  };

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to decommission and delete asset ${code}?`)) {
      try {
        await apiClient.delete(`/assets/${id}`);
        fetchAssets(meta.page);
      } catch (e) {
        alert('Failed to delete asset');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">INFRASTRUCTURE ASSET REGISTRY</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Centralized inventory across Buildings, Water, Transport, and Electrical domains
          </p>
        </div>
        <Link
          to="/assets/new"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-medium self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Asset</span>
        </Link>
      </div>

      {/* Domain Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1e293b] pb-3">
        {[
          { label: 'All Domains', val: '' },
          { label: 'Buildings & Facilities', val: 'BUILDINGS' },
          { label: 'Water Infrastructure', val: 'WATER' },
          { label: 'Transport Infrastructure', val: 'TRANSPORT' },
          { label: 'Electrical & Power', val: 'ELECTRICAL' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setCategory(tab.val)}
            className={`px-3 py-1 text-xs font-mono font-medium border ${
              category === tab.val
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-[#1e293b] border-[#334155] text-slate-300 hover:bg-[#334155]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by code, name, location, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-200 font-mono"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2">
          {/* Condition Filter */}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none"
          >
            <option value="">All Conditions</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="CRITICAL">Critical</option>
            <option value="UNDER_REPAIR">Under Repair</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e293b] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Asset Code</th>
                <th className="py-2.5 px-3">Asset Name & Type</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Health / Risk</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                    Loading asset inventory...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                    No assets matching the selected criteria.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#1e293b]/40">
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">
                      <Link to={`/assets/${asset.id}`} className="hover:underline">
                        {asset.assetCode}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white">{asset.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{asset.assetType}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <CategoryBadge category={asset.category} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <div>{asset.locationName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <ConditionBadge condition={asset.condition} />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col space-y-1">
                        <HealthBadge score={asset.healthScore ?? 80} />
                        <RiskBadge score={asset.riskScore ?? 20} />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2 font-mono">
                        <Link
                          to={`/assets/${asset.id}`}
                          className="px-2 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-indigo-300 hover:text-white inline-flex items-center space-x-1"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(asset.id, asset.assetCode)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Decommission Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#1e293b] bg-[#090d16]/30 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing <strong className="text-white">{(meta.page - 1) * meta.limit + 1}</strong> -{' '}
            <strong className="text-white">{Math.min(meta.total, meta.page * meta.limit)}</strong> of{' '}
            <strong className="text-white">{meta.total}</strong> assets
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => fetchAssets(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </button>
            <span className="px-2 py-1 bg-[#1e293b] border border-[#334155] text-white">
              {meta.page} / {meta.totalPages || 1}
            </span>
            <button
              onClick={() => fetchAssets(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
