import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reports';
import { astronautService } from '../services/astronauts';
import { missionService } from '../services/missions';
import { Astronaut, Mission } from '../types';
import { FileText, Download, Printer, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('daily');
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedAstronaut, setSelectedAstronaut] = useState<string>('AST-001');
  const [selectedMission, setSelectedMission] = useState<string>('MIS-ARTEMIS-VI');
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      const [astros, miss] = await Promise.all([
        astronautService.getAll().catch(() => []),
        missionService.getAll().catch(() => []),
      ]);
      setAstronauts(astros);
      setMissions(miss);
    };
    init();
  }, []);

  const handleExportCsv = () => {
    const url = reportService.exportCsvUrl(selectedAstronaut, selectedMission);
    window.open(url, '_blank');
    toast.success('Generated CSV report');
  };

  const handleExportPdf = () => {
    const url = reportService.exportPdfUrl(selectedAstronaut, selectedMission);
    window.open(url, '_blank');
    toast.success('Generated printable PDF report');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Flight Surgeon & Mission Health Reports</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            FORMAL TELEMETRY DOSSIERS, INCIDENT SUMMARIES, AND EXPORT COMPLIANCE
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-mono font-medium flex items-center space-x-2 shadow-glow-primary transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* Report Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: 'daily', title: 'Daily Telemetry Summary', desc: '24-hour physiological mean vitals and circadian rhythm trends.' },
          { id: 'weekly', title: 'Weekly Fleet Assessment', desc: '7-day longitudinal stability, work-rest cycles, and cumulative metrics.' },
          { id: 'mission', title: 'Mission Health Dossier', desc: 'Environmental habitability response and long-duration mission logs.' },
          { id: 'alerts', title: 'Incident & Anomaly Audit', desc: 'Full log of rule-based breaches and machine learning anomaly flags.' },
        ].map((rep) => (
          <div
            key={rep.id}
            onClick={() => setReportType(rep.id)}
            className={`cursor-pointer glass-panel p-5 rounded-2xl border transition-all ${
              reportType === rep.id
                ? 'border-sky-500 bg-sky-950/20 shadow-glow-primary'
                : 'border-space-border hover:border-slate-700'
            }`}
          >
            <h3 className="text-sm font-bold text-white mb-1">{rep.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{rep.desc}</p>
          </div>
        ))}
      </div>

      {/* Generated Report Preview Shell */}
      <div className="glass-panel p-8 rounded-2xl border border-space-border space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
              NATIONAL AERONAUTICS AND SPACE ADMINISTRATION // SPACE APPS 2026
            </div>
            <h2 className="text-xl font-bold text-white mt-1 uppercase">
              COSMIC SIX // OFFICIAL HEALTH REPORT
            </h2>
            <div className="text-xs font-mono text-slate-400 mt-1">
              REPORT TYPE: {reportType.toUpperCase()} // GENERATED: {new Date().toUTCString()}
            </div>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED DOSSIER</span>
          </div>
        </div>

        {/* Report Content Mock/Preview */}
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-sky-400 font-bold uppercase text-[11px] block">
              1. Executive Mission Health Summary
            </span>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              During the designated reporting window, all 6 active crew members maintained nominal autonomic regulation and core homeostasis in microgravity. Average fleet heart rate remained within expected basal boundaries (74 ± 6 BPM). Mean arterial oxygen saturation was sustained at 98.2%.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-purple-400 font-bold uppercase text-[11px] block">
              2. Machine Learning Predictive Anomaly Report
            </span>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              Isolation Forest unsupervised evaluation completed 1,420 multi-parameter inferences. No sustained cluster anomalies detected. Isolated excursions under physical exercise simulation exhibited appropriate cardiovascular recovery curves.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold uppercase text-[11px] block">
              3. Clinical Recommendation & Directive
            </span>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              Continue scheduled microgravity resistance exercise counter-measures (ARED protocol). BioHarness battery exchange recommended for AST-005 prior to EVA deployment.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Flight Surgeon Clearance: APPROVED</span>
          <span>COSMIC SIX Telemetry Engine v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
