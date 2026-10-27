import React, { useState } from 'react';
import { Shuffle, Play, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { api } from '../services/api';

export const BehaviorMorphingPage: React.FC = () => {
  const [samplePayload] = useState({
    user_id: 'U100',
    amount: 100.5,
    currency: 'INR',
  });
  const [morphResult, setMorphResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunMorph = async () => {
    try {
      setIsLoading(true);
      const res = await api.simulateMorph({ payload: samplePayload });
      setMorphResult(res);
    } catch (e: any) {
      alert(`Morphing failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-indigo-400" />
            Behavior Morphing & Dynamic Adapters
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic request transformation and runtime adapter insertion to reconcile incompatible interactions.
          </p>
        </div>
        <StatusBadge status="PROTOTYPE IMPLEMENTATION" size="md" />
      </div>

      {/* Morphing Pipeline Visualizer */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
          Request Morphing Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Box 1: Original Inbound Request */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">1. Inbound Consumer Payload</span>
            <pre className="p-2 rounded bg-slate-950 font-mono text-[11px] text-indigo-300">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
            <span className="text-[10px] text-slate-500">amount: number (float)</span>
          </div>

          {/* Box 2: Adapter Transformation */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-indigo-300">2. Behavior Morphing Adapter</span>
            <div className="py-2 font-mono text-xs text-slate-200">
              CAST_FLOAT_TO_STRING(amount)
            </div>
            <button
              disabled={isLoading}
              onClick={handleRunMorph}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-indigo-950/40 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Evaluate Adapter Bridge
            </button>
          </div>

          {/* Box 3: Transformed Provider Payload */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">3. Transformed Provider Payload</span>
            <pre className="p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-300">
              {JSON.stringify(morphResult?.morphed_payload || { user_id: 'U100', amount: '100.5', currency: 'INR' }, null, 2)}
            </pre>
            <span className="text-[10px] text-slate-500">amount: string</span>
          </div>
        </div>

        {/* Morphing Assessment Results */}
        {morphResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Pre-Morph Compatibility:</span>
              <span className="text-lg font-bold text-rose-400">
                {(morphResult.pre_morph_cs * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Post-Morph Compatibility:</span>
              <span className="text-lg font-bold text-emerald-400">
                {(morphResult.post_morph_cs * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Adapter Accepted:</span>
              <span className="font-bold text-emerald-400">YES (&ge; 85%)</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-slate-400 block mb-1">Final Gating Action:</span>
              <StatusBadge status="REROUTE" size="sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
