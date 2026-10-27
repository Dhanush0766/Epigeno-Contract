import React, { useState } from 'react';
import { Cpu, Layers, Lock, Clock, Gauge, Sliders, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import type { PcaeEvaluation, PredictionData } from '../types';

interface PcaeCompatibilityPageProps {
  pcae: PcaeEvaluation | null;
  prediction: PredictionData | null;
}

export const PcaeCompatibilityPage: React.FC<PcaeCompatibilityPageProps> = ({ pcae, prediction }) => {
  const [alpha, setAlpha] = useState(0.25);
  const [beta, setBeta] = useState(0.25);
  const [gamma, setGamma] = useState(0.25);
  const [delta, setDelta] = useState(0.25);

  const scs = pcae?.scs ?? 1.0;
  const semcs = pcae?.semcs ?? 0.98;
  const tcs = pcae?.tcs ?? 0.95;
  const rcs = pcae?.rcs ?? 0.97;
  const cs = pcae?.cs ?? (alpha * scs + beta * semcs + gamma * tcs + delta * rcs);
  const pFail = prediction?.p_fail ?? 0.041;
  const affectedGenes = pcae?.affected_genes || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Predictive Compatibility Assessment Engine (PCAE)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multi-dimensional evaluation across Structural, Semantic, Temporal, and Resource boundaries.
          </p>
        </div>
        <StatusBadge status="PREDICTIVE ACTIVE" size="md" />
      </div>

      {/* 4 Large Sub-Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SCS */}
        <div className="glass-panel p-4 border-t-2 border-t-indigo-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Structural (SCS)</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{(scs * 100).toFixed(1)}%</div>
          <p className="mt-1 text-[11px] text-slate-400">Schema, types & requiredness</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${scs >= 0.8 ? 'bg-indigo-500' : 'bg-rose-500'}`}
              style={{ width: `${scs * 100}%` }}
            />
          </div>
        </div>

        {/* SemCS */}
        <div className="glass-panel p-4 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Semantic (SemCS)</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{(semcs * 100).toFixed(1)}%</div>
          <p className="mt-1 text-[11px] text-slate-400">Bounded constraints & invariants</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${semcs >= 0.8 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${semcs * 100}%` }}
            />
          </div>
        </div>

        {/* TCS */}
        <div className="glass-panel p-4 border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Temporal (TCS)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{(tcs * 100).toFixed(1)}%</div>
          <p className="mt-1 text-[11px] text-slate-400">Latency & timeout envelopes</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${tcs >= 0.8 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${tcs * 100}%` }}
            />
          </div>
        </div>

        {/* RCS */}
        <div className="glass-panel p-4 border-t-2 border-t-cyan-500">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Resource (RCS)</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{(rcs * 100).toFixed(1)}%</div>
          <p className="mt-1 text-[11px] text-slate-400">Throughput & concurrency</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${rcs >= 0.8 ? 'bg-cyan-500' : 'bg-rose-500'}`}
              style={{ width: `${rcs * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Composite CS & Configurable Weights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Score Hero */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Overall Assessment</span>
            <h3 className="text-sm font-bold text-slate-200 mt-0.5">Composite Compatibility Score (CS)</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{(cs * 100).toFixed(1)}%</span>
              <span className="text-xs text-slate-400 font-mono">
                P_fail: {(pFail * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
              CS = &alpha;&middot;SCS + &beta;&middot;SemCS + &gamma;&middot;TCS + &delta;&middot;RCS
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Sigmoid Failure Risk: <code>P_fail = &sigma;(8.0&middot;(0.80 - CS) + 3.5&middot;trend)</code>
          </div>
        </div>

        {/* Weights Tuner */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Configurable Dimension Weights (&alpha;, &beta;, &gamma;, &delta;)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>&alpha; (Structural):</span>
                <span className="font-mono text-indigo-400">{alpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>&beta; (Semantic):</span>
                <span className="font-mono text-emerald-400">{beta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>&gamma; (Temporal):</span>
                <span className="font-mono text-amber-400">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>&delta; (Resource):</span>
                <span className="font-mono text-cyan-400">{delta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={delta}
                onChange={(e) => setDelta(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Affected Genes Table */}
      <div className="glass-panel p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Detected Incompatibilities & Affected Genes
        </h3>

        {affectedGenes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Gene Path</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Reason / Details</th>
                  <th className="py-2.5 px-3">Score Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {affectedGenes.map((g, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono text-indigo-300 font-semibold">{g.path}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={g.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{g.reason}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-400">
                      {g.impact?.toFixed(2) || '-0.50'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-emerald-400 bg-emerald-950/20 rounded-lg border border-emerald-900/40">
            No compatibility violations or gene mutations detected. All operational envelopes are satisfied.
          </div>
        )}
      </div>
    </div>
  );
};
