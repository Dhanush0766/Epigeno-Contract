import React, { useState } from 'react';
import { FileCode, Dna, Info, Layers, Lock, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import type { Gene } from '../types';

interface ContractExplorerPageProps {
  contract: any;
  genes: Gene[];
}

export const ContractExplorerPage: React.FC<ContractExplorerPageProps> = ({ contract, genes }) => {
  const [selectedGene, setSelectedGene] = useState<Gene | null>(null);

  const reqProps = contract?.provider_contract?.request_schema?.properties || {};
  const reqRequired = new Set(contract?.provider_contract?.request_schema?.required || []);
  const invariants = contract?.provider_contract?.invariants || [];
  const temporal = contract?.provider_contract?.temporal_constraints || {};
  const resource = contract?.provider_contract?.resource_constraints || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            Contract Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Endpoint: <span className="font-mono text-slate-200">POST {contract?.provider_contract?.endpoint || '/payment'}</span> (Active Version: {contract?.version || '1.0.0'})
          </p>
        </div>
        <StatusBadge status="ACTIVE" size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schema & Gene Breakdown Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Schema Fields */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Request Payload Schema & Genes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Required</th>
                    <th className="py-2.5 px-3">Gene ID</th>
                    <th className="py-2.5 px-3">Methylation (&mu;)</th>
                    <th className="py-2.5 px-3">Expression (X)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {Object.entries(reqProps).map(([field, def]: [string, any]) => {
                    const isReq = reqRequired.has(field);
                    const gene = genes.find((g) => g.path === `request.${field}`);
                    return (
                      <tr
                        key={field}
                        onClick={() => gene && setSelectedGene(gene)}
                        className={`cursor-pointer hover:bg-slate-800/60 transition-colors ${
                          selectedGene?.path === `request.${field}` ? 'bg-indigo-950/40 border-l-2 border-l-indigo-500' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          {field}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-300">{def.type}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              isReq ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isReq ? 'Required' : 'Optional'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{gene?.gene_id || 'G-SCH'}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-amber-400">
                          {gene?.methylation ? gene.methylation.toFixed(2) : '0.00'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-emerald-400">
                          {gene?.expression ? gene.expression.toFixed(2) : '1.00'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Constraints & Invariants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Semantic Invariants
              </h4>
              <ul className="space-y-2 text-xs">
                {invariants.map((inv: any, i: number) => (
                  <li key={i} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                    <span className="font-mono text-indigo-300 text-[11px]">{inv.expression}</span>
                    <span className="text-slate-400 text-[10px]">{inv.description || 'Invariant constraint'}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Performance Envelopes
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Max Latency:</span>
                  <span className="font-mono text-emerald-300">&le; {temporal.max_latency_ms || 2000}ms</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Min Throughput:</span>
                  <span className="font-mono text-emerald-300">&ge; {resource.min_throughput_rps || 500} RPS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Gene Inspector Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Dna className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gene Inspector</h3>
          </div>

          {selectedGene ? (
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Gene Identifier</span>
                <div className="text-base font-bold font-mono text-indigo-300">{selectedGene.gene_id}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Gene Family</span>
                <div className="font-semibold text-slate-200">{selectedGene.family}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Schema Path</span>
                <div className="font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {selectedGene.path}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Value / Type Guarantee</span>
                <div className="font-mono text-emerald-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {selectedGene.value_type}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Methylation (&mu;)</span>
                  <div className="text-sm font-bold text-amber-400">{selectedGene.methylation?.toFixed(2) || '0.00'}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Expression (X)</span>
                  <div className="text-sm font-bold text-emerald-400">{selectedGene.expression?.toFixed(2) || '1.00'}</div>
                </div>
              </div>
              <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 leading-relaxed">
                Expression Formula: <code>X_i = w_i &times; (1 - &mu;_i)</code>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Info className="w-6 h-6 mx-auto mb-2 text-slate-600" />
              Click any schema field or gene on the left to inspect detailed genotype and epigenetic expression metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
