import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Sliders, User, Bell, Cpu, Shield, Database, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();

  const [notificationSound, setNotificationSound] = useState<boolean>(true);
  const [criticalPushAlerts, setCriticalPushAlerts] = useState<boolean>(true);
  const [mlAnomalyAlerts, setMlAnomalyAlerts] = useState<boolean>(true);
  const [simulatorCadence, setSimulatorCadence] = useState<number>(3);
  const [anomalyContamination, setAnomalyContamination] = useState<number>(5);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System preferences saved successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="pb-2 border-b border-space-border">
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-sky-400" />
          <span>Mission Console System Settings</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          NETWORK TOPOLOGY, OPERATIONAL PREFERENCES, AND SUBSYSTEM STATUS
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Info */}
        <div className="glass-panel p-6 rounded-2xl border border-space-border space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-sky-400" />
            <span>Operator Identity & Credentials</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <span className="text-slate-500 block mb-1">OPERATOR NAME</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-white font-medium">
                {user?.name || 'Commander Alex Vance'}
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">MISSION EMAIL</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-white font-medium">
                {user?.email || 'operator@cosmic.nasa.gov'}
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">CLEARANCE LEVEL</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-sky-400 font-bold">
                {user?.role || 'Mission Operator'}
              </div>
            </div>
          </div>
        </div>

        {/* Subsystem Topology Health */}
        <div className="glass-panel p-6 rounded-2xl border border-space-border space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>System Telemetry Topology Status</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">BACKEND & SOCKET.IO</span>
                <span className="text-white font-bold">Port 5000</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isConnected ? 'STREAMING' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">FASTAPI ML SERVICE</span>
                <span className="text-white font-bold">Port 8000</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ONLINE
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">MONGODB STORAGE</span>
                <span className="text-white font-bold">Port 27017</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Notification & Telemetry Cadence */}
        <div className="glass-panel p-6 rounded-2xl border border-space-border space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Notification & Simulator Tuning</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={criticalPushAlerts}
                onChange={(e) => setCriticalPushAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-900 border-slate-700"
              />
              <span className="text-slate-200">Push immediate toast notification for Critical Rule Alerts</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mlAnomalyAlerts}
                onChange={(e) => setMlAnomalyAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-900 border-slate-700"
              />
              <span className="text-slate-200">Notify on AI Isolation Forest Multivariate Anomaly flag</span>
            </label>

            <div className="pt-2">
              <label className="block text-slate-400 mb-1">
                Telemetry Sampling Cadence ({simulatorCadence} seconds)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={simulatorCadence}
                onChange={(e) => setSimulatorCadence(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-bold flex items-center space-x-2 shadow-glow-primary transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Apply Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
