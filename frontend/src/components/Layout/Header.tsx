import React from 'react';
import { Activity, Dna, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../UI/StatusBadge';
import type { GateAction } from '../../types';

interface HeaderProps {
  currentGate: GateAction;
  csScore: number;
  pFail: number;
  versionTag: string;
  isWsConnected: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGate,
  csScore,
  pFail,
  versionTag,
  isWsConnected,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-md shadow-indigo-900/40">
          <Dna className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">ACO / ECG Platform</h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 font-semibold tracking-wider uppercase">
              Autonomous Contract Organism
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Predictive Compatibility & Pre-Emptive Behavior Gating
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* KPI Quick Badges */}
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-xs">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Compatibility:</span>
            <span className="font-bold text-slate-200">{(csScore * 100).toFixed(1)}%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Risk (P_fail):</span>
            <span className={`font-bold ${pFail >= 0.75 ? 'text-rose-400' : pFail >= 0.25 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {(pFail * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Genome:</span>
            <span className="font-mono font-bold text-indigo-300">{versionTag || 'v1.0.0'}</span>
          </div>
        </div>

        {/* Gate Status Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Active Gate:</span>
          <StatusBadge status={currentGate} size="lg" />
        </div>

        {/* WebSocket Connection Status */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <button
            onClick={onRefresh}
            title="Refresh State"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div
            title={isWsConnected ? 'Live WebSocket Feed Active' : 'WebSocket Disconnected'}
            className="flex items-center gap-1.5 text-xs font-medium"
          >
            {isWsConnected ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">LIVE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <WifiOff className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">OFFLINE</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
