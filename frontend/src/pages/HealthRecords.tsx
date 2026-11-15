import React, { useState, useEffect } from 'react';
import { healthService } from '../services/health';
import { astronautService } from '../services/astronauts';
import { missionService } from '../services/missions';
import { reportService } from '../services/reports';
import { HealthReading, Astronaut, Mission } from '../types';
import { FileSpreadsheet, Download, Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const HealthRecords: React.FC = () => {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedAstronaut, setSelectedAstronaut] = useState<string>('ALL');
  const [selectedMission, setSelectedMission] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await healthService.getAllReadings({
        astronautId: selectedAstronaut === 'ALL' ? undefined : selectedAstronaut,
        missionId: selectedMission === 'ALL' ? undefined : selectedMission,
        page,
        limit: 15,
      });

      if (res && res.data) {
        setReadings(res.data);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total || res.data.length);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load telemetry archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      const [astros, miss] = await Promise.all([
        astronautService.getAll().catch(() => []),
        missionService.getAll().catch(() => []),
      ]);
      setAstronauts(astros);
      setMissions(miss);
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [selectedAstronaut, selectedMission, page]);

  const handleExportCsv = () => {
    const url = reportService.exportCsvUrl(
      selectedAstronaut === 'ALL' ? undefined : selectedAstronaut,
      selectedMission === 'ALL' ? undefined : selectedMission
    );
    window.open(url, '_blank');
    toast.success('Downloading telemetry CSV...');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <span>Health Telemetry Historical Logs</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            CHRONOLOGICAL TIME-SERIES ARCHIVE & TIME-STAMPED MEASUREMENTS
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-mono font-medium flex items-center space-x-2 shadow-glow-primary transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Telemetry (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-space-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-4 flex-wrap gap-y-2">
          {/* Astronaut filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Crew Member:</span>
            <select
              value={selectedAstronaut}
              onChange={(e) => {
                setSelectedAstronaut(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Astronauts</option>
              {astronauts.map((a) => (
                <option key={a.astronautId} value={a.astronautId}>
                  {a.astronautId} - {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mission filter */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Mission:</span>
            <select
              value={selectedMission}
              onChange={(e) => {
                setSelectedMission(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Missions</option>
              {missions.map((m) => (
                <option key={m.missionId} value={m.missionId}>
                  {m.missionId} - {m.missionName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          Total Packets in View: <span className="text-sky-400 font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="glass-panel rounded-2xl border border-space-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">UTC Timestamp</th>
                <th className="py-3 px-4">Astronaut</th>
                <th className="py-3 px-4">Heart Rate</th>
                <th className="py-3 px-4">SpO2</th>
                <th className="py-3 px-4">Core Temp</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Respiration</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Sensor Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No records found for current filter.
                  </td>
                </tr>
              ) : (
                readings.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-400">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-bold text-sky-300">
                      {r.astronautId}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-rose-400 font-bold">
                      {Math.round(r.heartRate)} BPM
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-sky-400 font-bold">
                      {r.spo2.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-amber-400">
                      {r.temperature.toFixed(1)}°C
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-purple-300">
                      {r.systolicBP}/{r.diastolicBP} mmHg
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-teal-300">
                      {r.respiratoryRate} bpm
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-300">
                      Level {r.activityLevel}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          r.sensorStatus === 'Connected'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {r.sensorStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
