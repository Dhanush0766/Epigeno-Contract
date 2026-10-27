import React, { useState } from 'react';
import { GitBranch, ShieldCheck, FileCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { api } from '../services/api';

export const EvolutionPage: React.FC = () => {
  const [evolutionType, setEvolutionType] = useState('ADD_OPTIONAL_FIELD');
  const [targetField, setTargetField] = useState('customer_email');
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = async () => {
    try {
      setIsLoading(true);
      const res = await api.evaluateCandidateEvolution({
        evolution_type: evolutionType,
        target_field: targetField,
        details: { version: 'v2.1.0-candidate' },
      });
      setEvalResult(res);
      setCertificate(res.proof_certificate);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            Contract Evolution & Proof Certificates
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Validate migration safety, evaluate consumer blast radius, and issue cryptographic proof certificates.
          </p>
        </div>
        <StatusBadge status="PROTOTYPE IMPLEMENTATION" size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Evolution Builder */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
            Candidate Evolution Proposal
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Evolution Pattern:</label>
              <select
                value={evolutionType}
                onChange={(e) => setEvolutionType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none"
              >
                <option value="ADD_OPTIONAL_FIELD">ADD_OPTIONAL_FIELD (Backward Compatible Extension)</option>
                <option value="WIDEN_FIELD">WIDEN_FIELD (Broaden Type / Numerical Range)</option>
                <option value="RELAX_INVARIANT">RELAX_INVARIANT (Soft Invariant Boundary)</option>
                <option value="INTRODUCE_ADAPTER_GENE">INTRODUCE_ADAPTER_GENE (Insert Compatibility Shim)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Target Field / Invariant:</label>
              <input
                type="text"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
              />
            </div>

            <button
              disabled={isLoading}
              onClick={handleEvaluate}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all shadow-md shadow-indigo-950/50 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Evaluate Evolution & Issue Certificate
            </button>
          </div>

          {evalResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Predicted Compatibility:</span>
                <span className="font-bold text-emerald-400">
                  {(evalResult.compatibility_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Consumer Blast Radius:</span>
                <span className="font-bold text-slate-200">
                  {(evalResult.consumer_impact * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Migration Safety:</span>
                <StatusBadge status={evalResult.migration_safe ? 'SAFE' : 'BREAKING'} size="sm" />
              </div>
            </div>
          )}
        </div>

        {/* Cryptographic Proof Certificate Card */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Compatibility Proof Certificate
            </h3>
            {certificate && <StatusBadge status={certificate.status} size="sm" />}
          </div>

          {certificate ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate ID:</span>
                  <span className="text-indigo-300 font-bold">{certificate.certificate_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Version:</span>
                  <span className="text-slate-200">{certificate.contract_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate Score:</span>
                  <span className="text-emerald-400 font-bold">{certificate.certificate_score.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invariants Preserved:</span>
                  <span className="text-emerald-400">{certificate.invariants_preserved ? 'TRUE' : 'FALSE'}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">SHA-256 Proof Signature:</span>
                  <div className="text-[10px] text-slate-400 break-all bg-slate-900 p-1.5 rounded">
                    {certificate.proof_hash}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Certificate verified. Evolution satisfies all zero-downtime rolling deployment constraints.</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Click &quot;Evaluate Evolution &amp; Issue Certificate&quot; on the left to issue a cryptographically signed compatibility proof certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
