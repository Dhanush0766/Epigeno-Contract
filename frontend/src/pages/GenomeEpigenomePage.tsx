import React, { useState } from 'react';
import { Dna, Sliders, Code2, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { api } from '../services/api';
import type { Gene, Genotype, Epigenome, EcgIrInstruction } from '../types';

interface GenomeEpigenomePageProps {
  genotype: Genotype | null;
  epigenome: Epigenome | null;
  expressedGenes: Gene[];
  ecgIr: EcgIrInstruction[];
  lineage: any[];
  onMethylationChanged?: () => void;
}

export const GenomeEpigenomePage: React.FC<GenomeEpigenomePageProps> = ({
  genotype,
  expressedGenes,
  ecgIr,
  onMethylationChanged,
}) => {
  const [tuningGeneId, setTuningGeneId] = useState<string>('G-SCH-01');
  const [deltaMu, setDeltaMu] = useState<number>(0.1);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApplyMethylation = async () => {
    try {
      setIsUpdating(true);
      await api.methylateGene({
        gene_id: tuningGeneId,
        delta_mu: deltaMu,
        context: 'operator_manual_tuning',
      });
      if (onMethylationChanged) onMethylationChanged();
    } catch (e: any) {
      alert(`Failed to update methylation: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Dna className="w-5 h-5 text-indigo-400" />
            Genome, Epigenome & ECG-IR
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable cryptographic genotype lineage, reversible methylation ($\mu$), and intermediate representation (ECG-IR).
          </p>
        </div>
        <StatusBadge status="CRYPTOGRAPHICALLY IMMUTABLE" size="md" />
      </div>

      {/* Top 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Genotype</span>
          <div className="text-base font-bold font-mono text-indigo-300 mt-1">
            {genotype?.genotype_id || 'GT-PAYMENT-V1_0_0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            SHA-256: <span className="font-mono">{genotype?.hash_sha256 || '7f83b1657ff1fc53b92dc181...'}</span>
          </div>
        </div>

        <div className="glass-panel p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400">Epigenome Profile</span>
          <div className="text-base font-bold text-slate-100 mt-1">Dynamic Methylation Map</div>
          <div className="text-[11px] text-amber-400 mt-1">
            Reversible conditioning: &mu; &isin; [0, 1.0]
          </div>
        </div>

        <div className="glass-panel p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400">Expression Metric</span>
          <div className="text-base font-bold text-emerald-400 mt-1">X_i = w_i &times; (1 - &mu;_i)</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Effective gene expression strength
          </div>
        </div>
      </div>

      {/* Expressed Genome & Methylation Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expressed Genes Table */}
        <div className="lg:col-span-2 glass-panel p-5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Dna className="w-4 h-4 text-indigo-400" />
            Expressed Genome ($X_i$)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Gene ID</th>
                  <th className="py-2.5 px-3">Family</th>
                  <th className="py-2.5 px-3">Path</th>
                  <th className="py-2.5 px-3">Weight ($w$)</th>
                  <th className="py-2.5 px-3">Methylation (&mu;)</th>
                  <th className="py-2.5 px-3">Expression ($X$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {expressedGenes.map((g) => (
                  <tr
                    key={g.gene_id}
                    onClick={() => setTuningGeneId(g.gene_id)}
                    className={`cursor-pointer hover:bg-slate-800/60 transition-colors ${
                      tuningGeneId === g.gene_id ? 'bg-indigo-950/40 border-l-2 border-l-indigo-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-300">{g.gene_id}</td>
                    <td className="py-2.5 px-3 text-slate-400">{g.family}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{g.path}</td>
                    <td className="py-2.5 px-3 font-mono">{g.weight.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">
                      {g.methylation ? g.methylation.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {g.expression ? g.expression.toFixed(2) : g.weight.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methylation Dynamic Controller */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Methylation Tuner (&mu;)
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Target Gene:</label>
              <select
                value={tuningGeneId}
                onChange={(e) => setTuningGeneId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
              >
                {expressedGenes.map((g) => (
                  <option key={g.gene_id} value={g.gene_id}>
                    {g.gene_id} ({g.path})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Methylation Shift (&Delta;&mu;):</span>
                <span className="font-mono text-amber-400">
                  {deltaMu > 0 ? `+${deltaMu.toFixed(2)}` : deltaMu.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={deltaMu}
                onChange={(e) => setDeltaMu(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <button
              disabled={isUpdating}
              onClick={handleApplyMethylation}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-all shadow-md shadow-amber-950/40 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              Apply Epigenetic Shift
            </button>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong>Epigenetic Guarantee:</strong> Modifying gene methylation dampens active expression without mutating the committed genotype hash.
            </div>
          </div>
        </div>
      </div>

      {/* ECG-IR Instruction Stream Table */}
      <div className="glass-panel p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          ECG Intermediate Representation (ECG-IR) Bytecode Stream
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">PC</th>
                <th className="py-2 px-3">Opcode</th>
                <th className="py-2 px-3">Operand</th>
                <th className="py-2 px-3">Gene ID</th>
                <th className="py-2 px-3">Weight ($X_i$)</th>
                <th className="py-2 px-3">Instruction Semantics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-[11px]">
              {ecgIr.map((inst) => (
                <tr key={inst.pc} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-500">{inst.pc.toString().padStart(3, '0')}</td>
                  <td className="py-2 px-3 font-bold text-indigo-400">{inst.opcode}</td>
                  <td className="py-2 px-3 text-emerald-300">{inst.operand}</td>
                  <td className="py-2 px-3 text-slate-400">{inst.gene_id}</td>
                  <td className="py-2 px-3 text-amber-400">{inst.weight.toFixed(2)}</td>
                  <td className="py-2 px-3 text-slate-400 font-sans text-xs">{inst.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
