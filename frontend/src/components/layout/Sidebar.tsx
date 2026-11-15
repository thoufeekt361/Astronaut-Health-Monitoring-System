import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Users,
  Compass,
  AlertTriangle,
  LineChart,
  BrainCircuit,
  FileSpreadsheet,
  FileText,
  Sliders,
  Cpu,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Vitals Monitor', path: '/monitoring', icon: Activity, badge: 'REALTIME', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'Astronaut Roster', path: '/astronauts', icon: Users },
  { name: 'Space Missions', path: '/missions', icon: Compass },
  { name: 'Alerts & Safety', path: '/alerts', icon: AlertTriangle },
  { name: 'Analytics & Trends', path: '/analytics', icon: LineChart },
  { name: 'AI Predictions', path: '/predictions', icon: BrainCircuit, badge: 'ML-IF', badgeColor: 'bg-purple-500/20 text-purple-300' },
  { name: 'Health Telemetry Log', path: '/records', icon: FileSpreadsheet },
  { name: 'Mission Reports', path: '/reports', icon: FileText },
  { name: 'Console Settings', path: '/settings', icon: Sliders },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0A1628]/90 border-r border-space-border flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
          Mission Navigation
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Simulator Quick Status Widget at bottom */}
      <div className="p-4 m-3 rounded-lg bg-slate-900/90 border border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span className="font-semibold">Telemetry Engine</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Synthetic bio-sensor stream configured for 6 astronauts on deep-space transit.
        </p>
        <div className="mt-2 text-[9px] font-mono text-emerald-400 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Demonstration Mode</span>
        </div>
      </div>
    </aside>
  );
};
