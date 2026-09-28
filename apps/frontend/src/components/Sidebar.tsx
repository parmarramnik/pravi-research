import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Layers,
  PlusCircle,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  Bot,
  History,
  Bell,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, canManageAssets, canAudit, isReadOnly } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/map', label: 'GIS Map', icon: MapPin },
    { to: '/assets', label: 'Asset Inventory', icon: Layers },
    ...(canManageAssets
      ? [{ to: '/assets/new', label: 'Register Asset', icon: PlusCircle, badge: 'MUTATION' }]
      : []),
    { to: '/inspections', label: 'Inspections', icon: ClipboardCheck },
    { to: '/work-orders', label: 'Work Orders', icon: Wrench },
    { to: '/risks', label: 'Risk Analytics', icon: AlertTriangle },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { to: '/notifications', label: 'Alerts', icon: Bell },
    ...(canAudit || user?.role === 'ADMIN'
      ? [{ to: '/audit', label: 'Audit Trail', icon: History, badge: 'ADMIN' }]
      : []),
  ];

  return (
    <aside className="w-56 bg-[#0b1120] border-r border-[#1f2937] flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 select-none">
      <nav className="p-2 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Operations</span>
          <span className="text-[9px] bg-[#1f2937] text-slate-400 px-1 py-0.2">LEAST PRIVILEGE</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium border-l-2 ${
                  isActive
                    ? 'bg-[#111827] text-indigo-400 border-indigo-500 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#111827]/60 border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono bg-indigo-950 text-indigo-300 px-1 py-0.5 border border-indigo-800">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1f2937] bg-[#070b14]">
        {/* Role privilege summary box */}
        <div className="p-2 bg-[#111827] border border-[#1f2937] mb-2">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">{user?.role || 'VIEWER'}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {isReadOnly ? 'Read-only audit scope active.' : 'Role-gated operational access.'}
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-1">
          InfraSphere v1.0.0
        </div>
      </div>
    </aside>
  );
};
