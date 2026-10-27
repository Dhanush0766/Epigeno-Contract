import React, { useState } from 'react';
import { Play, RotateCcw, AlertOctagon, CheckCircle2, Clock, Gauge, Undo2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface DemoBarProps {
  onScenarioTriggered?: () => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({ onScenarioTriggered }) => {
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const runScenario = async (id: string, name: string, fn: () => Promise<any>) => {
    try {
      setIsRunning(id);
      setMessage(`Executing ${name}...`);
      await fn();
      setMessage(`${name} completed.`);
      if (onScenarioTriggered) onScenarioTriggered();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsRunning(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-indigo-400 text-[11px]">
          <Play className="w-3.5 h-3.5 fill-indigo-400" />
          Guided Demo Mode:
        </span>
        {message && (
          <span className="text-slate-300 font-medium bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {message}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Demo 1: Breaking */}
        <button
          disabled={!!isRunning}
          onClick={() => runScenario('demo1', 'Demo 1 (Breaking Change)', api.runDemoScenario1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-rose-300 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900/60 hover:border-rose-600 transition-all disabled:opacity-50 shadow-sm"
        >
          {isRunning === 'demo1' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
          Demo 1: Breaking Type
        </button>

        {/* Demo 2: Safe */}
        <button
          disabled={!!isRunning}
          onClick={() => runScenario('demo2', 'Demo 2 (Safe Change)', api.runDemoScenario2)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 hover:border-emerald-600 transition-all disabled:opacity-50 shadow-sm"
        >
          {isRunning === 'demo2' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          Demo 2: Safe Field
        </button>

        {/* Demo 3: Temporal */}
        <button
          disabled={!!isRunning}
          onClick={() => runScenario('demo3', 'Demo 3 (Temporal Change)', api.runDemoScenario3)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 hover:border-amber-600 transition-all disabled:opacity-50 shadow-sm"
        >
          {isRunning === 'demo3' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
          Demo 3: Temporal
        </button>

        {/* Demo 4: Resource */}
        <button
          disabled={!!isRunning}
          onClick={() => runScenario('demo4', 'Demo 4 (Resource Change)', api.runDemoScenario4)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/60 hover:border-cyan-600 transition-all disabled:opacity-50 shadow-sm"
        >
          {isRunning === 'demo4' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gauge className="w-3.5 h-3.5 text-cyan-400" />}
          Demo 4: Resource
        </button>

        {/* Demo 5: Rollback */}
        <button
          disabled={!!isRunning}
          onClick={() => runScenario('demo5', 'Demo 5 (Rollback)', api.runDemoScenario5)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900/60 hover:border-indigo-600 transition-all disabled:opacity-50 shadow-sm"
        >
          {isRunning === 'demo5' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5 text-indigo-400" />}
          Demo 5: Rollback
        </button>

        {/* Reset Baseline */}
        <button
          disabled={!!isRunning}
          onClick={() => runScenario('reset', 'Baseline Reset', api.resetDemoBaseline)}
          title="Reset to v1.0.0 nominal baseline"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium text-slate-400 bg-slate-800 hover:text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          {isRunning === 'reset' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          Reset
        </button>
      </div>
    </div>
  );
};
