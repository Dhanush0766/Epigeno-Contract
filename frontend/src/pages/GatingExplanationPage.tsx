import React from 'react';
import { ShieldAlert, AlertTriangle, Layers } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import type { GateDecisionData, GatingExplanation } from '../types';

interface GatingExplanationPageProps {
  gate: GateDecisionData | null;
  explanation: GatingExplanation | null;
}

export const GatingExplanationPage: React.FC<GatingExplanationPageProps> = ({ gate, explanation }) => {
  const currentGate = gate?.current_gate || 'ALLOW';
  const pFail = gate?.p_fail ?? 0.041;
  const hysteresisApplied = gate?.hysteresis_applied ?? false;
  const reason = gate?.primary_reason || 'All compatibility envelopes nominal.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Pre-Emptive Gating & Root-Cause Explanation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated behavior governance, hysteresis dampening, and machine-readable attribution.
          </p>
        </div>
        <StatusBadge status={currentGate} size="lg" />
      </div>

      {/* Hero Gate Status Card */}
      <div
        className={`glass-panel p-6 border-l-4 ${
          currentGate === 'QUARANTINE'
            ? 'border-l-rose-500 bg-rose-950/20'
            : currentGate === 'REROUTE'
            ? 'border-l-orange-500 bg-orange-950/20'
            : currentGate === 'DEGRADE'
            ? 'border-l-amber-500 bg-amber-950/20'
            : 'border-l-emerald-500 bg-emerald-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Enforced Action State
            </span>
            <div className="text-3xl font-black text-white mt-1 flex items-center gap-3">
              <span>{currentGate}</span>
              <StatusBadge status={currentGate} size="md" />
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">{reason}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[180px]">
            <span className="text-[10px] uppercase font-bold text-slate-400">Predicted Failure Risk</span>
            <div
              className={`text-2xl font-black mt-1 ${
                pFail >= 0.75 ? 'text-rose-400' : pFail >= 0.25 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {(pFail * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500">
              {hysteresisApplied ? 'Hysteresis Locked' : 'Direct Gating'}
            </span>
          </div>
        </div>

        {/* Threshold Meter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-2">
            <span className="text-emerald-400">ALLOW (&lt;25%)</span>
            <span className="text-amber-400">DEGRADE (25%-50%)</span>
            <span className="text-orange-400">REROUTE (50%-75%)</span>
            <span className="text-rose-400">QUARANTINE (&ge;75%)</span>
          </div>
          <div className="relative w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div className="w-1/4 h-full bg-emerald-600/40 border-r border-slate-700" />
            <div className="w-1/4 h-full bg-amber-600/40 border-r border-slate-700" />
            <div className="w-1/4 h-full bg-orange-600/40 border-r border-slate-700" />
            <div className="w-1/4 h-full bg-rose-600/40" />

            {/* Indicator Needle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,1)]"
              style={{ left: `${Math.min(100, Math.max(0, pFail * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Structured Root-Cause Attribution Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attribution Card */}
        <div className="glass-panel p-5 space-y-3 text-xs">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-indigo-400" />
            Root-Cause Attribution Details
          </h3>

          <div className="space-y-2">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Primary Dimension:</span>
              <span className="font-semibold text-slate-200 uppercase">
                {explanation?.dominant_dimension || 'Structural'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Affected Gene:</span>
              <span className="font-mono text-indigo-300">
                {explanation?.affected_gene || 'request.amount'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Structural Shift:</span>
              <span className="font-mono text-rose-400 font-bold">
                {explanation?.structural_compatibility_shift || '1.00 -> 0.41'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Overall CS Shift:</span>
              <span className="font-mono text-amber-400 font-bold">
                {explanation?.overall_compatibility_shift || '0.976 -> 0.600'}
              </span>
            </div>
          </div>
        </div>

        {/* Machine-Readable JSON Export */}
        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Structured Explanation Payload
          </h3>

          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto h-48">
            {JSON.stringify(explanation || gate, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
