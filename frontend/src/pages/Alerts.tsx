import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alerts';
import { useSocket } from '../context/SocketContext';
import { Alert, AlertSeverity, AlertStatus } from '../types';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock, Filter, Eye, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Alerts: React.FC = () => {
  const { recentAlert } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [summary, setSummary] = useState({
    critical: 0,
    warning: 0,
    informational: 0,
    total: 0,
  });

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        alertService.getAll({
          severity: severityFilter === 'ALL' ? undefined : severityFilter,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
        alertService.getSummary().catch(() => ({ critical: 0, warning: 0, informational: 0, total: 0 })),
      ]);
      setAlerts(list);
      setSummary(sum);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load alert queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  // Push new real-time alert into state
  useEffect(() => {
    if (recentAlert) {
      setAlerts((prev) => [recentAlert, ...prev.filter((a) => a._id !== recentAlert._id)]);
      setSummary((prev) => ({
        ...prev,
        total: prev.total + 1,
        critical: recentAlert.severity === 'Critical' ? prev.critical + 1 : prev.critical,
        warning: recentAlert.severity === 'Warning' ? prev.warning + 1 : prev.warning,
      }));
    }
  }, [recentAlert]);

  const handleAcknowledge = async (id: string) => {
    try {
      const updated = await alertService.acknowledge(id);
      setAlerts((prev) => prev.map((a) => (a._id === id ? updated : a)));
      toast.success('Alert acknowledged by medical staff');
    } catch {
      toast.error('Acknowledge failed');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const updated = await alertService.resolve(id);
      setAlerts((prev) => prev.map((a) => (a._id === id ? updated : a)));
      toast.success('Alert resolved and archived');
      loadAlerts();
    } catch {
      toast.error('Resolve failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Dual-Engine Mission Alerts & Incident Response</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            DETERMINISTIC SAFETY BOUNDS & AI ANOMALY INCIDENT STREAM
          </p>
        </div>
      </div>

      {/* Severity Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
          <span className="text-[11px] text-rose-400 uppercase font-semibold">Critical Incidents</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.critical}</div>
          <span className="text-[10px] text-rose-400/80">Immediate clinical triage</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
          <span className="text-[11px] text-amber-400 uppercase font-semibold">Warnings</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.warning}</div>
          <span className="text-[10px] text-amber-400/80">Observation & monitoring</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-sky-500/30 bg-sky-950/20">
          <span className="text-[11px] text-sky-400 uppercase font-semibold">Informational</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.informational}</div>
          <span className="text-[10px] text-sky-400/80">Routine telemetry drift</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-space-border">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Logged</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.total}</div>
          <span className="text-[10px] text-slate-500">All historical incidents</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl border border-space-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-semibold">Severity:</span>
          {['ALL', 'Critical', 'Warning', 'Informational'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded transition-colors ${
                severityFilter === sev
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-semibold">Status:</span>
          {['ALL', 'Active', 'Acknowledged', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === st
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl border border-space-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Alert ID & Time</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Astronaut</th>
                <th className="py-3 px-4">Title & Telemetry Diagnosis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching alerts found in current telemetry filter.
                  </td>
                </tr>
              ) : (
                alerts.map((al) => (
                  <tr key={al._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{al.alertId}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(al.createdAt).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          al.severity === 'Critical'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : al.severity === 'Warning'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                        }`}
                      >
                        {al.severity}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          al.source === 'ML-Anomaly'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {al.source}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-bold text-sky-300">
                      {al.astronautId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-xs">{al.title}</div>
                      <div className="text-[11px] text-slate-400 max-w-md line-clamp-2">
                        {al.description}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          al.status === 'Active'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : al.status === 'Acknowledged'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {al.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                      {al.status === 'Active' && (
                        <button
                          onClick={() => handleAcknowledge(al._id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[10px] transition-colors"
                        >
                          Ack
                        </button>
                      )}
                      {al.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(al._id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500 text-[10px] transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
