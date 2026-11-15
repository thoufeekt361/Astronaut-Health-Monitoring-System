import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { healthService } from '../services/health';
import { alertService } from '../services/alerts';
import { astronautService } from '../services/astronauts';
import { missionService } from '../services/missions';
import { Astronaut, Mission, Alert, HealthReading, TelemetrySummary } from '../types';
import {
  Users,
  Compass,
  HeartPulse,
  AlertTriangle,
  Radio,
  Cpu,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Flame,
  Droplets,
  Wind,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { latestReading, recentAlert } = useSocket();

  const [summary, setSummary] = useState<TelemetrySummary>({
    totalAstronauts: 6,
    activeMissions: 2,
    healthyCount: 5,
    attentionCount: 1,
    criticalCount: 0,
    activeAlerts: 1,
    connectedSensors: 24,
    mlServiceStatus: 'online',
  });

  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, astroRes, missRes, alertRes] = await Promise.all([
          healthService.getSummary().catch(() => null),
          astronautService.getAll().catch(() => []),
          missionService.getAll().catch(() => []),
          alertService.getAll({ limit: 5 }).catch(() => []),
        ]);

        if (sumRes) setSummary(sumRes);
        if (astroRes) setAstronauts(astroRes);
        if (missRes) setMissions(missRes);
        if (alertRes) setRecentAlerts(alertRes);

        // Fetch historical readings for initial chart
        if (astroRes && astroRes.length > 0) {
          const history = await healthService.getHistory(astroRes[0].astronautId, 20).catch(() => []);
          const formatted = history.map((h: HealthReading) => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            heartRate: h.heartRate,
            spo2: h.spo2,
            temp: h.temperature,
          }));
          setChartData(formatted);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time update via Socket.IO
  useEffect(() => {
    if (latestReading) {
      setChartData((prev) => {
        const next = [
          ...prev.slice(-19),
          {
            time: new Date(latestReading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            heartRate: latestReading.heartRate,
            spo2: latestReading.spo2,
            temp: latestReading.temperature,
          },
        ];
        return next;
      });
    }
  }, [latestReading]);

  // Real-time alerts
  useEffect(() => {
    if (recentAlert) {
      setRecentAlerts((prev) => [recentAlert, ...prev.filter((a) => a._id !== recentAlert._id).slice(0, 4)]);
      setSummary((prev) => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    }
  }, [recentAlert]);

  const handleAcknowledge = async (id: string) => {
    try {
      await alertService.acknowledge(id);
      setRecentAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'Acknowledged' as const } : a))
      );
      toast.success('Alert acknowledged');
    } catch {
      toast.error('Could not acknowledge alert');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertService.resolve(id);
      setRecentAlerts((prev) => prev.filter((a) => a._id !== id));
      setSummary((prev) => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }));
      toast.success('Alert resolved');
    } catch {
      toast.error('Could not resolve alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <span>Mission Control Central Command</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            ORBITAL HEALTH TELEMETRY // ARTEMIS & DEEP SPACE MISSIONS
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/monitoring"
            className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium flex items-center space-x-2 shadow-glow-primary transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Open Vitals Monitor</span>
          </Link>
          <Link
            to="/predictions"
            className="px-3.5 py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 text-xs font-medium flex items-center space-x-2 transition-all"
          >
            <Cpu className="w-4 h-4" />
            <span>AI Anomaly Engine</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Astronauts */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CREW SIZE</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {summary.totalAstronauts}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center">
            <span>Active Roster</span>
          </div>
        </div>

        {/* Active Missions */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>MISSIONS</span>
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-300">
            {summary.activeMissions}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Deep-Space Transit</div>
        </div>

        {/* Healthy Astronauts */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>HEALTHY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {summary.healthyCount}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Nominal Vitals</div>
        </div>

        {/* Requiring Attention */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ATTENTION</span>
            <HeartPulse className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {summary.attentionCount}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">Mild Trend Drift</div>
        </div>

        {/* Active Alerts */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {summary.activeAlerts}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1">Immediate Safety Review</div>
        </div>

        {/* Connected Sensors */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SENSORS</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">
            {summary.connectedSensors}
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1">Bio-telemetry Pods</div>
        </div>
      </div>

      {/* Main Grid: Live Telemetry Chart & Current Live Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Vitals Telemetry Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-space-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>Real-Time Fleet Heart Rate & SpO2 Waveform</span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Continuous telemetry sampling (2-5s cadence)
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300">Heart Rate (BPM)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-300">SpO2 (%)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="spo2Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} domain={[50, 180]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#hrGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="spo2"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spo2Gradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Incoming Telemetry Snapshot */}
        <div className="glass-panel p-5 rounded-2xl border border-space-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>Latest Telemetry Packet</span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Target: {latestReading?.astronautId || 'AST-001 (Commander Vance)'}
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              STREAMING
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Heart Rate */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Heart Rate</span>
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono text-white">
                  {latestReading ? Math.round(latestReading.heartRate) : 74}
                </span>
                <span className="text-[10px] font-mono text-slate-400">BPM</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Oxygen SpO2</span>
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono text-white">
                  {latestReading ? latestReading.spo2.toFixed(1) : '98.5'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">%</span>
              </div>
            </div>

            {/* Core Temp */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Core Temp</span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono text-white">
                  {latestReading ? latestReading.temperature.toFixed(1) : '36.8'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">°C</span>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Blood Pressure</span>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono text-white">
                  {latestReading ? `${latestReading.systolicBP}/${latestReading.diastolicBP}` : '120/80'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">mmHg</span>
              </div>
            </div>

            {/* Respiratory Rate */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Respiratory Rate</span>
                <Wind className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono text-white">
                  {latestReading ? latestReading.respiratoryRate : 16}
                </span>
                <span className="text-[10px] font-mono text-slate-400">breaths/min</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Source: BioHarness Pro Mk.IV</span>
            <span>Packet Delay: &lt;18ms</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Active Alerts & Astronaut Roster Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="glass-panel p-5 rounded-2xl border border-space-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Real-Time Safety & ML Incident Queue</span>
            </h2>
            <Link to="/alerts" className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500 bg-slate-900/40 rounded-xl">
                No active health alerts. All vital parameters within configured tolerances.
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          alert.severity === 'Critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : alert.severity === 'Warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-medium text-white">{alert.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">[{alert.astronautId}]</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{alert.description}</p>
                  </div>

                  <div className="flex items-center space-x-2 pl-3">
                    {alert.status === 'Active' && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[10px] font-mono transition-colors"
                      >
                        Ack
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-950/40 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 hover:border-emerald-500 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Astronaut Fleet Health Roster */}
        <div className="glass-panel p-5 rounded-2xl border border-space-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Astronaut Crew Telemetry Status</span>
            </h2>
            <Link to="/astronauts" className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1">
              <span>Manage Crew</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {astronauts.map((astro) => (
              <div key={astro.astronautId} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-sky-500/30 flex items-center justify-center text-xs font-mono font-bold text-sky-300">
                    {astro.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{astro.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {astro.astronautId} • {astro.role} • {astro.missionId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      astro.status === 'Healthy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : astro.status === 'Warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {astro.status}
                  </span>
                  <Link
                    to={`/monitoring?astronaut=${astro.astronautId}`}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
                    title="Focus Live Telemetry"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
