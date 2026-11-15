import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { healthService } from '../services/health';
import { astronautService } from '../services/astronauts';
import { simulatorService } from '../services/simulator';
import { Astronaut, HealthReading, SensorStatus } from '../types';
import {
  HeartPulse,
  Droplets,
  Flame,
  Activity,
  Wind,
  Footprints,
  Play,
  Square,
  RefreshCw,
  AlertOctagon,
  Radio,
  Sliders,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LiveMonitoring: React.FC = () => {
  const { latestReading } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>(
    searchParams.get('astronaut') || 'AST-001'
  );

  const [currentReading, setCurrentReading] = useState<HealthReading | null>(null);
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [currentScenario, setCurrentScenario] = useState<string>('Normal resting condition');
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<string>('Normal');
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>('Connected');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');

  // Load crew list & initial historical records for chosen astronaut
  useEffect(() => {
    const init = async () => {
      try {
        const astroList = await astronautService.getAll().catch(() => []);
        setAstronauts(astroList);

        const targetId = searchParams.get('astronaut') || (astroList[0]?.astronautId ?? 'AST-001');
        setSelectedAstronautId(targetId);

        // Fetch latest & history
        const [latest, hist] = await Promise.all([
          healthService.getLatest(targetId).catch(() => null),
          healthService.getHistory(targetId, 25).catch(() => []),
        ]);

        if (latest) {
          setCurrentReading(latest);
          setSensorStatus(latest.sensorStatus);
          setLastUpdatedTime(new Date(latest.timestamp).toLocaleTimeString());
        }

        if (hist && hist.length > 0) {
          const mapped = hist.map((r: HealthReading) => ({
            time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            heartRate: r.heartRate,
            spo2: r.spo2,
            temp: r.temperature,
            respiratory: r.respiratoryRate,
            systolic: r.systolicBP,
            diastolic: r.diastolicBP,
          }));
          setChartSeries(mapped);
        }
      } catch (err) {
        console.error('Error initializing live monitoring', err);
      }
    };

    init();
  }, [selectedAstronautId, searchParams]);

  // Handle live incoming telemetry from Socket.IO
  useEffect(() => {
    if (latestReading && latestReading.astronautId === selectedAstronautId) {
      setCurrentReading(latestReading);
      setSensorStatus(latestReading.sensorStatus);
      setLastUpdatedTime(new Date(latestReading.timestamp).toLocaleTimeString());

      setChartSeries((prev) => {
        const next = [
          ...prev.slice(-24),
          {
            time: new Date(latestReading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            heartRate: latestReading.heartRate,
            spo2: latestReading.spo2,
            temp: latestReading.temperature,
            respiratory: latestReading.respiratoryRate,
            systolic: latestReading.systolicBP,
            diastolic: latestReading.diastolicBP,
          },
        ];
        return next;
      });
    }
  }, [latestReading, selectedAstronautId]);

  const handleSelectAstronaut = (id: string) => {
    setSelectedAstronautId(id);
    setSearchParams({ astronaut: id });
  };

  const handleStartSim = async () => {
    try {
      await simulatorService.start({ scenario: selectedScenarioOption });
      setIsSimRunning(true);
      toast.success('Simulation telemetry engine started');
    } catch {
      toast.error('Failed to start simulator');
    }
  };

  const handleStopSim = async () => {
    try {
      await simulatorService.stop();
      setIsSimRunning(false);
      toast.success('Simulation telemetry engine paused');
    } catch {
      toast.error('Failed to pause simulator');
    }
  };

  const handleTriggerScenario = async (sc: string) => {
    try {
      setSelectedScenarioOption(sc);
      setCurrentScenario(sc);
      await simulatorService.setScenario(sc, selectedAstronautId);
      toast(`Triggered scenario: ${sc}`, { icon: '🚀' });
    } catch {
      toast.error('Failed to set scenario');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <span>Bio-Telemetry Live Monitor</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            HIGH-FREQUENCY ORBITAL LIFE SIGN MONITORING // ZERO-G BIOHARNESS
          </p>
        </div>

        {/* Astronaut Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0">
          {astronauts.map((astro) => (
            <button
              key={astro.astronautId}
              onClick={() => handleSelectAstronaut(astro.astronautId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                selectedAstronautId === astro.astronautId
                  ? 'bg-sky-500 text-white font-bold shadow-glow-primary'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{astro.astronautId} ({astro.name.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Control & Scenario Bar */}
      <div className="glass-panel p-4 rounded-xl border border-space-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-300 font-semibold flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Simulator Engine:</span>
          </span>
          {isSimRunning ? (
            <button
              onClick={handleStopSim}
              className="px-3 py-1.5 rounded bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center space-x-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Pause Telemetry</span>
            </button>
          ) : (
            <button
              onClick={handleStartSim}
              className="px-3 py-1.5 rounded bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center space-x-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Stream Telemetry</span>
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-800 text-[11px] font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Last Packet: {lastUpdatedTime}</span>
          </div>
        </div>

        {/* Preset Scenarios */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Trigger Scenario:</span>
          {[
            { label: 'Normal Rest', val: 'Normal resting condition', color: 'hover:border-emerald-500' },
            { label: 'Physical Activity', val: 'Physical activity', color: 'hover:border-sky-500' },
            { label: 'Sleep/Rest', val: 'Sleep/rest condition', color: 'hover:border-indigo-500' },
            { label: 'Tachycardia', val: 'Elevated heart rate', color: 'hover:border-rose-500' },
            { label: 'Hypoxia (Low SpO2)', val: 'Reduced SpO2', color: 'hover:border-purple-500' },
            { label: 'Hyperthermia', val: 'Increased temperature', color: 'hover:border-amber-500' },
            { label: 'Sensor Dropout', val: 'Sensor disconnection', color: 'hover:border-slate-500' },
          ].map((sc) => (
            <button
              key={sc.val}
              onClick={() => handleTriggerScenario(sc.val)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono border border-slate-800 bg-slate-900/90 text-slate-300 transition-colors ${
                currentScenario === sc.val ? 'border-sky-400 text-sky-400 font-bold bg-sky-950/40' : sc.color
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Vital Sign Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Heart Rate */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">HEART RATE</span>
            <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-white">
            {currentReading ? Math.round(currentReading.heartRate) : 72}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">Normal: 60-100</span>
            <span className="text-rose-400 font-semibold">BPM</span>
          </div>
        </div>

        {/* Blood Oxygen SpO2 */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">SPO2 SATURATION</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-white">
            {currentReading ? currentReading.spo2.toFixed(1) : '98.4'}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">Normal: 95-100</span>
            <span className="text-sky-400 font-semibold">%</span>
          </div>
        </div>

        {/* Core Body Temperature */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">CORE TEMP</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-white">
            {currentReading ? currentReading.temperature.toFixed(1) : '36.8'}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">Normal: 36.5-37.5</span>
            <span className="text-amber-400 font-semibold">°C</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">BLOOD PRESSURE</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {currentReading ? `${currentReading.systolicBP}/${currentReading.diastolicBP}` : '118/78'}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">Normal: &lt;130/85</span>
            <span className="text-purple-400 font-semibold">mmHg</span>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">RESPIRATION</span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-white">
            {currentReading ? currentReading.respiratoryRate : 16}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">Normal: 12-20</span>
            <span className="text-teal-400 font-semibold">BPM</span>
          </div>
        </div>

        {/* Physical Activity Level */}
        <div className="glass-panel p-4 rounded-xl border border-space-border relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono">MET WORKLOAD</span>
            <Footprints className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {currentReading
              ? currentReading.activityLevel === 0
                ? 'Rest (0)'
                : currentReading.activityLevel === 1
                ? 'Nominal (1)'
                : currentReading.activityLevel === 2
                ? 'Active (2)'
                : 'Strenuous (3)'
              : 'Nominal (1)'}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">State</span>
            <span className="text-indigo-400 font-semibold">Index 0-3</span>
          </div>
        </div>
      </div>

      {/* Synchronized Real-Time Charts (Heart Rate & Respiratory + Blood Pressure) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate & SpO2 Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-space-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>Heart Rate & SpO2 Time-Series</span>
            </h2>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-rose-400">● HR</span>
              <span className="text-sky-400">● SpO2</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} domain={[50, 180]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={false}
                  name="Heart Rate"
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  name="SpO2 (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Pressure & Core Temp Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-space-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Systolic / Diastolic Pressure & Respiration</span>
            </h2>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-purple-400">● Systolic</span>
              <span className="text-teal-400">● Diastolic</span>
              <span className="text-amber-400">● Respiration</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} domain={[10, 170]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={false}
                  name="Systolic BP"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  dot={false}
                  name="Diastolic BP"
                />
                <Line
                  type="monotone"
                  dataKey="respiratory"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Respiratory Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
