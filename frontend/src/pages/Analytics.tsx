import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics';
import { astronautService } from '../services/astronauts';
import { Astronaut } from '../types';
import { LineChart as ChartIcon, BarChart3, TrendingUp, PieChart, Activity, Zap } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Synthetic trend dataset for demonstration analytics
  const [trendData, setTrendData] = useState<any[]>([
    { day: 'Mon', avgHR: 72, avgSpO2: 98.4, avgTemp: 36.7, anomalies: 1 },
    { day: 'Tue', avgHR: 75, avgSpO2: 98.1, avgTemp: 36.8, anomalies: 0 },
    { day: 'Wed', avgHR: 79, avgSpO2: 97.6, avgTemp: 36.9, anomalies: 2 },
    { day: 'Thu', avgHR: 74, avgSpO2: 98.3, avgTemp: 36.7, anomalies: 0 },
    { day: 'Fri', avgHR: 88, avgSpO2: 95.8, avgTemp: 37.4, anomalies: 4 },
    { day: 'Sat', avgHR: 73, avgSpO2: 98.5, avgTemp: 36.6, anomalies: 0 },
    { day: 'Sun', avgHR: 71, avgSpO2: 98.7, avgTemp: 36.6, anomalies: 1 },
  ]);

  const [astroComparison, setAstroComparison] = useState<any[]>([
    { id: 'AST-001', name: 'Alex Vance', avgHR: 74, avgSpO2: 98.2, anomalyScore: 0.12 },
    { id: 'AST-002', name: 'Sarah Connor', avgHR: 78, avgSpO2: 98.5, anomalyScore: 0.08 },
    { id: 'AST-003', name: 'Elena Rostova', avgHR: 82, avgSpO2: 97.4, anomalyScore: 0.22 },
    { id: 'AST-004', name: 'Kenji Sato', avgHR: 71, avgSpO2: 99.1, anomalyScore: 0.05 },
    { id: 'AST-005', name: 'Marcus Brody', avgHR: 94, avgSpO2: 94.8, anomalyScore: 0.74 },
    { id: 'AST-006', name: 'Nadia Chen', avgHR: 75, avgSpO2: 98.0, anomalyScore: 0.15 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const astros = await astronautService.getAll().catch(() => []);
        setAstronauts(astros);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>Longitudinal Telemetry & Statistical Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            CREW-WIDE VITAL SIGN DISTRIBUTIONS, RESTING BASELINES, AND DRIFT METRICS
          </p>
        </div>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 rounded-xl border border-space-border">
          <span className="text-[10px] text-slate-400 uppercase">Fleet Mean Resting HR</span>
          <div className="text-2xl font-bold text-sky-400 mt-1">74.2 BPM</div>
          <span className="text-[10px] text-emerald-400">Within optimal microgravity range</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-space-border">
          <span className="text-[10px] text-slate-400 uppercase">Fleet Mean SpO2</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">98.1 %</div>
          <span className="text-[10px] text-slate-400">Cabin O2 mix: 21.0%</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-space-border">
          <span className="text-[10px] text-slate-400 uppercase">Weekly Anomaly Count</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">8 Flags</div>
          <span className="text-[10px] text-amber-400/80">6 Resolved • 2 Monitored</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-space-border">
          <span className="text-[10px] text-slate-400 uppercase">Sensory Uptime</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">99.8%</div>
          <span className="text-[10px] text-slate-400">Packet continuity validated</span>
        </div>
      </div>

      {/* 7-Day Longitudinal Trend Line Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-space-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Weekly Vital Signs Drift & Multi-day Averages</span>
          </h2>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-rose-400">● Avg HR (BPM)</span>
            <span className="text-sky-400">● Avg SpO2 (%)</span>
            <span className="text-amber-400">● Avg Temp (°C)</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} domain={[30, 110]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <Line type="monotone" dataKey="avgHR" stroke="#f43f5e" strokeWidth={2.5} name="Average HR" />
              <Line type="monotone" dataKey="avgSpO2" stroke="#38bdf8" strokeWidth={2.5} name="Average SpO2" />
              <Line type="monotone" dataKey="avgTemp" stroke="#f59e0b" strokeWidth={2} name="Average Temp" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Astronaut Comparative Multi-Bar Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-space-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Cross-Crew Health Profile Comparison</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Relative Anomaly Probability Score (0-1)</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={astroComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="id" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <Bar dataKey="anomalyScore" name="Anomaly Deviation Score" radius={[6, 6, 0, 0]}>
                {astroComparison.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.anomalyScore > 0.5 ? '#ef4444' : entry.anomalyScore > 0.2 ? '#f59e0b' : '#38bdf8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
