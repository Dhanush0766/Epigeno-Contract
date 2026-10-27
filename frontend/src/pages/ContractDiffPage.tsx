import React, { useState } from 'react';
import { GitCompare, Sparkles, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import type { PcaeEvaluation } from '../types';

interface ContractDiffPageProps {
  currentContract?: any;
  pcae?: PcaeEvaluation | null;
}

export const ContractDiffPage: React.FC<ContractDiffPageProps> = () => {
  const [diffMode, setDiffMode] = useState<'breaking' | 'safe' | 'custom'>('breaking');

  // Sample comparison scenarios
  const originalSchema = {
    user_id: { type: 'string', required: true },
    amount: { type: 'number', required: true },
    currency: { type: 'string', required: true },
  };

  const proposedSchemas: Record<string, any> = {
    breaking: {
      user_id: { type: 'string', required: true },
      amount: { type: 'string', required: true }, // mutated to string
      currency: { type: 'string', required: true },
    },
    safe: {
      user_id: { type: 'string', required: true },
      amount: { type: 'number', required: true },
      currency: { type: 'string', required: true },
      phone: { type: 'string', required: false }, // added optional
    },
  };

  const activeProposed = proposedSchemas[diffMode] || proposedSchemas.breaking;

  // Impact metrics
  const isBreaking = diffMode === 'breaking';
  const originalCs = 0.976;
  const changedCs = isBreaking ? 0.60 : 0.971;
  const deltaCs = changedCs - originalCs;
  const ccps = (changedCs / originalCs) * 100;
  const risk = isBreaking ? 0.843 : 0.045;
  const gateAction = isBreaking ? 'QUARANTINE' : 'ALLOW';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            Contract Diff & Impact Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comparative semantic evaluation, Contract Change Preservation Score (CCPS), and automated impact gating.
          </p>
        </div>

        {/* Diff Mode Selector */}
        <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
          <button
            onClick={() => setDiffMode('breaking')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              diffMode === 'breaking' ? 'bg-rose-900/60 text-rose-300 font-bold border border-rose-700/60' : 'text-slate-400'
            }`}
          >
            Breaking (amount: string)
          </button>
          <button
            onClick={() => setDiffMode('safe')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              diffMode === 'safe' ? 'bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/60' : 'text-slate-400'
            }`}
          >
            Safe (+ phone)
          </button>
        </div>
      </div>

      {/* Two-Column Side-by-Side Diff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Contract Column */}
        <div className="glass-panel p-5 border-t-4 border-t-slate-500">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Baseline Active Contract</span>
              <h3 className="text-sm font-bold text-slate-100">PaymentContract v1.0.0</h3>
            </div>
            <StatusBadge status="ORIGINAL" size="sm" />
          </div>

          <div className="mt-4 space-y-2 font-mono text-xs">
            {Object.entries(originalSchema).map(([field, def]: [string, any]) => (
              <div
                key={field}
                className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-indigo-300 font-semibold">{field}</span>
                  <span className="text-slate-500">: {def.type}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {def.required ? 'required' : 'optional'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proposed Contract Column */}
        <div className={`glass-panel p-5 border-t-4 ${isBreaking ? 'border-t-rose-500' : 'border-t-emerald-500'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Candidate Mutation</span>
              <h3 className="text-sm font-bold text-slate-100">PaymentContract v2.0.0-candidate</h3>
            </div>
            <StatusBadge status={isBreaking ? 'BREAKING' : 'SAFE'} size="sm" />
          </div>

          <div className="mt-4 space-y-2 font-mono text-xs">
            {Object.entries(activeProposed).map(([field, def]: [string, any]) => {
              const origDef = (originalSchema as any)[field];
              const isTypeChanged = origDef && origDef.type !== def.type;
              const isAdded = !origDef;

              return (
                <div
                  key={field}
                  className={`p-2.5 rounded border flex items-center justify-between transition-all ${
                    isTypeChanged
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : isAdded
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{field}</span>
                    <span>
                      : {def.type}
                      {isTypeChanged && (
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-rose-900 text-rose-200">
                          was {origDef.type}
                        </span>
                      )}
                      {isAdded && (
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200">
                          NEW
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75">
                    {def.required ? 'required' : 'optional'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quantitative Impact Assessment Box */}
      <div className="glass-panel p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Compatibility & Impact Quantification
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Original CS</span>
            <div className="text-base font-bold text-slate-200 mt-1">{(originalCs * 100).toFixed(1)}%</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Changed CS</span>
            <div className={`text-base font-bold mt-1 ${isBreaking ? 'text-rose-400' : 'text-emerald-400'}`}>
              {(changedCs * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Delta (&Delta;CS)</span>
            <div className={`text-base font-bold mt-1 ${deltaCs < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {(deltaCs * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">CCPS Score</span>
            <div className="text-base font-bold text-cyan-300 mt-1">{ccps.toFixed(1)}%</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Risk</span>
            <div className={`text-base font-bold mt-1 ${risk > 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {(risk * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Gate Action</span>
            <StatusBadge status={gateAction} size="sm" />
          </div>
        </div>

        {/* Structured Explanation Banner */}
        <div className="mt-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <AlertTriangle className={`w-4 h-4 ${isBreaking ? 'text-rose-400' : 'text-emerald-400'}`} />
            Root-Cause Attribution:
          </div>
          <p className="text-slate-400 leading-relaxed">
            {isBreaking
              ? "Mutating 'amount' from number to string causes a structural schema mismatch on gene G-SCH-02. SCS drops to 0.41, pulling composite compatibility down to 0.60. P_fail surges to 84.3%, triggering pre-emptive QUARANTINE."
              : "Adding optional field 'phone' maintains backward compatibility with existing consumer contracts. SCS remains 0.98+, CCPS is 99.5%, Gate remains ALLOW."}
          </p>
        </div>
      </div>
    </div>
  );
};
