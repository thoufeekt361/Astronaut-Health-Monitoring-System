import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Radio, Bell, Shield, User as UserIcon, LogOut, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-space-border bg-[#07111F]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left: Mission Brand & Status */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-glow-primary">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-white">COSMIC SIX</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                NASA 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight">ASTRONAUT HEALTH TELEMETRY</p>
          </div>
        </Link>

        {/* Realtime Socket Status */}
        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
            }`}
          />
          <span className="text-xs font-mono text-slate-300">
            {isConnected ? 'TELEMETRY STREAM: ONLINE' : 'STREAM: OFFLINE'}
          </span>
        </div>
      </div>

      {/* Center: Mission UTC Clock */}
      <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-900/60 border border-slate-800 font-mono text-xs text-sky-300">
        <Clock className="w-3.5 h-3.5 text-sky-400" />
        <span>{utcTime || 'SYNCHRONIZING UTC...'}</span>
      </div>

      {/* Right: User & Actions */}
      <div className="flex items-center space-x-4">
        <Link
          to="/alerts"
          className="relative p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-space-border text-slate-300 hover:text-white transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4 text-amber-400" />
        </Link>

        {/* User Card */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-sky-500/40 flex items-center justify-center text-sky-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-none">{user?.name || 'Operator'}</div>
            <div className="text-[10px] font-mono text-sky-400 mt-1 flex items-center space-x-1">
              <Shield className="w-2.5 h-2.5" />
              <span>{user?.role || 'Mission Specialist'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
            title="Sign out of mission console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
