import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import {
  Filter,
  Search,
  Layers,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Activity,
  Network,
  X,
} from 'lucide-react';
import { RiskBadge, HealthBadge, StatusBadge, ConditionBadge, CategoryBadge } from '../components/Badges';

// Custom Flat HTML Markers using L.divIcon
function createCategoryDivIcon(category: string, isCritical: boolean = false) {
  let color = '#4f46e5';
  let char = 'A';

  switch (category) {
    case 'BUILDINGS':
      color = '#0284c7';
      char = 'B';
      break;
    case 'WATER':
      color = '#0891b2';
      char = 'W';
      break;
    case 'TRANSPORT':
      color = '#d97706';
      char = 'T';
      break;
    case 'ELECTRICAL':
      color = '#7c3aed';
      char = 'E';
      break;
  }

  const border = isCritical ? 'border-2 border-rose-500' : 'border border-slate-900';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: white; font-family: monospace; font-size: 11px; font-weight: bold;" class="${border} shadow-lg">${char}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Controller component to smoothly center map
const MapCenterController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const GisMap: React.FC = () => {
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Default coordinates centered on Ahmedabad urban infrastructure cluster
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.0325, 72.5650]);
  const [mapZoom, setMapZoom] = useState<number>(12);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await apiClient.get('/assets/map');
        if (res.data.success) {
          setMarkers(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedAsset(res.data.data[0]);
          }
        }
      } catch (e) {
        // error
      } finally {
        setLoading(false);
      }
    };
    fetchMarkers();
  }, []);

  const filteredMarkers = markers.filter((m) => {
    if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (conditionFilter !== 'ALL' && m.condition !== conditionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.assetCode.toLowerCase().includes(q) ||
        m.locationName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectMarker = (marker: any) => {
    setSelectedAsset(marker);
    if (marker.latitude && marker.longitude) {
      setMapCenter([marker.latitude, marker.longitude]);
      setMapZoom(14);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-6">
      {/* Top Filter Strip */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="font-mono uppercase font-bold text-slate-200">GIS Map Filters:</span>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] px-2 py-1 text-slate-200 font-mono focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="BUILDINGS">Buildings</option>
            <option value="WATER">Water</option>
            <option value="TRANSPORT">Transport</option>
            <option value="ELECTRICAL">Electrical</option>
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] px-2 py-1 text-slate-200 font-mono focus:outline-none"
          >
            <option value="ALL">All Conditions</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1e293b] border border-[#334155] px-2 py-1 text-slate-200 font-mono focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CRITICAL">Critical</option>
            <option value="UNDER_REPAIR">Under Repair</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Search Input & Marker Count */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search assets or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1e293b] border border-[#334155] pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 font-mono focus:outline-none w-56"
            />
          </div>
          <span className="font-mono text-slate-400">
            Showing <strong className="text-white">{filteredMarkers.length}</strong> / {markers.length} Assets
          </span>
        </div>
      </div>

      {/* Main Map + Right Inspection Drawer */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Leaflet Map Container */}
        <div className="flex-1 h-full z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterController center={mapCenter} zoom={mapZoom} />

            {filteredMarkers.map((m) => {
              const isCrit = m.criticality === 'CRITICAL' || m.status === 'CRITICAL' || m.riskScore >= 70;
              return (
                <Marker
                  key={m.id}
                  position={[m.latitude, m.longitude]}
                  icon={createCategoryDivIcon(m.category, isCrit)}
                  eventHandlers={{
                    click: () => handleSelectMarker(m),
                  }}
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-sm text-indigo-400 font-mono">{m.assetCode}</div>
                      <div className="font-medium text-white mt-0.5">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{m.locationName}</div>
                      <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center">
                        <span className="font-mono text-[10px]">RISK: {m.riskScore}/100</span>
                        <Link
                          to={`/assets/${m.id}`}
                          className="text-[10px] text-indigo-400 font-mono underline font-semibold"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Asset Details Drawer */}
        {selectedAsset && (
          <div className="w-80 bg-[#0f172a] border-l border-[#1e293b] flex flex-col h-full z-10 overflow-y-auto">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Selected GIS Node
                </span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">{selectedAsset.assetCode}</h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-white leading-snug">{selectedAsset.name}</h4>
                <div className="text-slate-400 text-[11px] mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{selectedAsset.locationName}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <CategoryBadge category={selectedAsset.category} />
                <StatusBadge status={selectedAsset.status} />
                <ConditionBadge condition={selectedAsset.condition} />
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e293b]">
                <div className="bg-[#1e293b] p-2.5 border border-[#334155]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Health Score</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedAsset.healthScore ?? 80}/100
                  </div>
                </div>
                <div className="bg-[#1e293b] p-2.5 border border-[#334155]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Risk Score</div>
                  <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                    {selectedAsset.riskScore ?? 20}/100
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-[#1e293b] p-2.5 border border-[#334155] font-mono text-[11px] space-y-1">
                <div className="text-slate-400 uppercase text-[10px]">Geographic Coordinates</div>
                <div className="text-slate-200">LAT: {selectedAsset.latitude}</div>
                <div className="text-slate-200">LNG: {selectedAsset.longitude}</div>
                <div className="text-slate-400 text-[10px]">TYPE: {selectedAsset.geometry?.type || 'Point'}</div>
              </div>

              {/* Department & Owner */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Responsible Department</div>
                <div className="text-slate-200 font-medium">{selectedAsset.ownerDepartment || 'Municipal Operations'}</div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-4 border-t border-[#1e293b] space-y-2">
                <Link
                  to={`/assets/${selectedAsset.id}`}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs uppercase tracking-wider font-semibold"
                >
                  <span>Open Full Lifecycle Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to={`/assets/${selectedAsset.id}?tab=dependencies`}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white font-mono text-xs uppercase"
                >
                  <Network className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Simulate Failure Impact</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
