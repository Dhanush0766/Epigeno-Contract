import React, { useState } from 'react';
import { Network, Server, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { api } from '../services/api';
import type { QuorumSyncResult } from '../types';

export const QuorumSyncPage: React.FC = () => {
  const [syncResult, setSyncResult] = useState<QuorumSyncResult | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunQuorum = async () => {
    try {
      setIsLoading(true);
      const res = await api.triggerQuorumSync({
        source_node: 'Node-A',
        simulate_failure: simulateFailure,
      });
      setSyncResult(res);
    } catch (e: any) {
      alert(`Sync failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            Genome Exchange Protocol & Quorum Synchronization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multi-node peer attestation, delta hashing, and 2-of-3 threshold consensus simulation.
          </p>
        </div>
        <StatusBadge status="PROTOTYPE IMPLEMENTATION" size="md" />
      </div>

      {/* Cluster Control & Trigger Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Simulate Node-C Desynchronization (Byzantine Fault)</span>
          </label>
        </div>

        <button
          disabled={isLoading}
          onClick={handleRunQuorum}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all shadow-md shadow-indigo-950/50 text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Execute Quorum Exchange Protocol
        </button>
      </div>

      {/* 3-Node Cluster Visual Representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Node-A (Leader)', 'Node-B (Validator)', 'Node-C (Validator)'].map((nodeName, idx) => {
          const nodeKey = `Node-${String.fromCharCode(65 + idx)}`;
          const detail = syncResult?.nodes_detail.find((n) => n.node_id === nodeKey);
          const isApproved = detail?.vote === 'APPROVE';

          return (
            <div
              key={nodeKey}
              className={`glass-panel p-5 border-t-4 transition-all ${
                detail
                  ? isApproved
                    ? 'border-t-emerald-500 bg-emerald-950/10'
                    : 'border-t-rose-500 bg-rose-950/10'
                  : 'border-t-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-slate-100 text-xs">{nodeName}</span>
                </div>
                {detail && <StatusBadge status={detail.vote} size="sm" />}
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Role:</span>
                  <span className="font-semibold text-slate-200">{detail?.role || (idx === 0 ? 'LEADER' : 'VALIDATOR')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Vote Latency:</span>
                  <span className="font-mono text-indigo-300">{detail ? `${detail.latency_ms}ms` : '--'}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">Attested Delta Hash:</span>
                  <div className="text-[10px] font-mono text-slate-400 truncate bg-slate-900 p-1.5 rounded">
                    {detail?.verified_hash || '0xWaitingForRound...'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attestation Status Banner */}
      {syncResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex flex-col md:flex-row items-center justify-between gap-3 ${
            syncResult.status === 'ATTESTED'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {syncResult.status === 'ATTESTED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <div className="font-bold text-sm">
                Quorum Status: {syncResult.status} ({syncResult.votes_approved}/{syncResult.votes_total} Approved)
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                Delta Hash: <span className="font-mono">{syncResult.delta_hash}</span>
              </p>
            </div>
          </div>
          <StatusBadge status={syncResult.status} size="md" />
        </div>
      )}
    </div>
  );
};
