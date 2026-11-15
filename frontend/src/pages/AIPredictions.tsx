import React, { useState, useEffect } from 'react';
import { mlService } from '../services/ml';
import { useSocket } from '../context/SocketContext';
import { Prediction } from '../types';
import {
  BrainCircuit,
  Cpu,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Binary,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AIPredictions: React.FC = () => {
  const { recentAnomaly } = useSocket();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [modelStatus, setModelStatus] = useState<any>({
    status: 'ONLINE',
    model: 'Isolation Forest (scikit-learn)',
    nEstimators: 100,
    contamination: 0.05,
    featuresTrained: 7,
    lastTrained: '2026-11-13 14:00 UTC',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [preds, status] = await Promise.all([
        mlService.getPredictions(30).catch(() => []),
        mlService.getModelStatus().catch(() => null),
      ]);
      setPredictions(preds);
      if (status) setModelStatus(status);
    } catch (err) {
      console.error(err);
      toast.error('Failed to query ML inference engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to live Socket.IO anomalies
  useEffect(() => {
    if (recentAnomaly) {
      setPredictions((prev) => [recentAnomaly, ...prev.slice(0, 29)]);
    }
  }, [recentAnomaly]);

  const handleRetrain = async () => {
    try {
      setIsRetraining(true);
      toast.loading('Synthesizing baseline telemetry & fitting Isolation Forest...', { id: 'retrain' });
      await mlService.retrainModel();
      toast.success('Isolation Forest model re-calibrated successfully!', { id: 'retrain' });
      loadData();
    } catch {
      toast.error('Model retraining failed', { id: 'retrain' });
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-space-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <span>AI Predictive Anomaly Detection Engine</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            UNSUPERVISED ISOLATION FOREST // MULTIVARIATE CORRELATION ANALYSIS
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="px-3.5 py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-300 text-xs font-mono font-medium flex items-center space-x-2 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Recalibrating Model...' : 'Retrain Isolation Forest'}</span>
        </button>
      </div>

      {/* Model Spec Card & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ML Status Card */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-300 uppercase font-semibold flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Model Architecture</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {modelStatus.status || 'OPERATIONAL'}
            </span>
          </div>

          <div className="text-sm font-bold text-white font-mono">
            {modelStatus.model || 'Isolation Forest (Ensemble)'}
          </div>

          <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-purple-500/20">
            <div className="flex justify-between">
              <span className="text-slate-400">Tree Estimators:</span>
              <span className="text-purple-300 font-semibold">{modelStatus.nEstimators || 100} Trees</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Contamination:</span>
              <span className="text-purple-300 font-semibold">{(modelStatus.contamination || 0.05) * 100}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Feature Dimensions:</span>
              <span className="text-purple-300 font-semibold">7 Physiological Vectors</span>
            </div>
          </div>
        </div>

        {/* Isolation Forest Conceptual Guide */}
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-space-border space-y-2">
          <h3 className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wide flex items-center space-x-1.5">
            <Layers className="w-4 h-4" />
            <span>Why Isolation Forest for Astronaut Health?</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Astronaut vital signs do not exist in isolation. A heart rate of 115 BPM during intense physical exercise is completely nominal; however, that same 115 BPM coupled with a low activity level index (0 or 1) and reduced $SpO_2$ denotes an uncharacteristic physiological outlier.
          </p>
          <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-amber-400 font-bold block mb-1">Architecture Boundary:</span>
            Rule-based threshold alerts (e.g. HR &gt; 160 BPM) remain independent and active at all times. The Isolation Forest operates asynchronously to isolate non-linear multidimensional drift before clinical bounds are crossed.
          </div>
        </div>
      </div>

      {/* Historical Anomaly Scoring Logs */}
      <div className="glass-panel rounded-2xl border border-space-border overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase text-slate-300 tracking-wider">
            Inference Telemetry Log ({predictions.length} Logged Runs)
          </h2>
          <span className="text-[11px] font-mono text-slate-500">Live Scored via FastAPI</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Astronaut</th>
                <th className="py-3 px-4">Anomaly Score</th>
                <th className="py-3 px-4">Status Verdict</th>
                <th className="py-3 px-4">Model Attribution & Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {predictions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No predictions recorded yet. Telemetry simulator runs continuous inference batches.
                  </td>
                </tr>
              ) : (
                predictions.map((p, idx) => {
                  const score = typeof p.anomalyScore === 'number' ? p.anomalyScore : 0.2;
                  const isAnomaly = p.isAnomaly || score >= 0.6;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(p.timestamp).toLocaleTimeString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-bold text-sky-300">
                        {p.astronautId}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full ${
                                isAnomaly ? 'bg-rose-500' : score > 0.35 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.round(score * 100))}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-xs font-bold ${
                              isAnomaly ? 'text-rose-400' : 'text-slate-300'
                            }`}
                          >
                            {score.toFixed(3)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isAnomaly
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isAnomaly ? 'Anomaly Detected' : 'Nominal Baseline'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 max-w-xl text-[11px] leading-relaxed">
                        {p.explanation || 'Vital signs correlate consistently with normal baseline telemetry distribution.'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
