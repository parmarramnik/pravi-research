import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  ShieldAlert,
  Bell,
  User as UserIcon,
  LogOut,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await apiClient.get('/notifications/unread-count');
        if (res.data.success) {
          setUnreadCount(res.data.data.unreadCount || 0);
        }
      } catch (e) {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const demoAccounts = [
    { email: 'admin@infrasphere.local', label: 'Admin (Full Access)', role: 'ADMIN' },
    { email: 'asset.manager@infrasphere.local', label: 'Asset Manager (Inventory & Lifecycle)', role: 'ASSET_MANAGER' },
    { email: 'inspector@infrasphere.local', label: 'Inspector (Field Audits & Defects)', role: 'INSPECTOR' },
    { email: 'maintenance@infrasphere.local', label: 'Maintenance Mgr (Work Orders)', role: 'MAINTENANCE_MANAGER' },
    { email: 'viewer@infrasphere.local', label: 'Viewer (Read-Only)', role: 'VIEWER' },
  ];

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST'
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-[#0b1120] border-b border-[#1f2937] flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Brand & City Indicator */}
      <div className="flex items-center space-x-3">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
            IS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-base">INFRASPHERE</span>
              <span className="text-[10px] bg-[#1e293b] text-indigo-300 font-mono px-1.5 py-0.5 border border-[#334155]">
                AHMEDABAD CLUSTER
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Real-time Status Telemetry */}
      <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#111827] border border-[#1f2937]">
          <span className="w-2 h-2 bg-emerald-500"></span>
          <span className="text-slate-300">REAL-TIME TELEMETRY:</span>
          <span className="text-emerald-400 font-bold">{currentTime || 'LIVE'}</span>
        </div>
        <div className="px-2.5 py-1 bg-[#111827] border border-[#1f2937] text-slate-400">
          SCOPE: <span className="text-indigo-400 font-semibold">{user?.role || 'VIEWER'}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-2.5 py-1 text-xs bg-[#1e293b] border border-[#334155] text-slate-200 hover:bg-[#334155]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-indigo-300 font-semibold">{user?.role || 'ROLE'}</span>
            <span className="text-slate-400">({user?.name?.split(' ')[0]})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1 w-64 bg-[#0f172a] border border-[#334155] shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#1e293b]">
                Switch Demo Persona
              </div>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={async () => {
                    await switchDemoUser(acc.email);
                    setShowRoleMenu(false);
                    navigate(0);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#1e293b] flex flex-col ${
                    user?.email === acc.email ? 'bg-indigo-950/40 text-indigo-400 font-medium' : 'text-slate-300'
                  }`}
                >
                  <span className="font-medium">{acc.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{acc.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-1.5 text-slate-300 hover:text-white bg-[#1e293b] border border-[#334155]"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold px-1 min-w-4 text-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#1e293b] border border-[#334155]"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
