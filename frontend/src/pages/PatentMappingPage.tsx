import React from 'react';
import { BookOpen } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';

export const PatentMappingPage: React.FC = () => {
  const mappings = [
    {
      concept: 'Contract-as-Genome Representation',
      module: 'backend/app/engines/gene_extractor.py',
      endpoint: 'GET /api/contracts/{id}/genes',
      view: 'Contract Explorer, Genome Page',
      status: 'FULL IMPLEMENTATION',
      desc: 'Decomposes API specifications into 5 typed, weighted gene families (SCHEMA, INVARIANT, TEMPORAL, RESOURCE, ERROR_TAXONOMY).',
    },
    {
      concept: 'Immutable Genotype Lineage',
      module: 'backend/app/engines/genotype_manager.py',
      endpoint: 'GET /api/genotypes/{id}/lineage',
      view: 'Genome & Epigenome',
      status: 'FULL IMPLEMENTATION',
      desc: 'Enforces strictly immutable committed versioning with SHA-256 cryptographic hashes and parent lineage pointers.',
    },
    {
      concept: 'Reversible Epigenetic Methylation',
      module: 'backend/app/engines/epigenome_manager.py',
      endpoint: 'POST /api/epigenomes/{id}/methylate',
      view: 'Genome & Epigenome',
      status: 'FULL IMPLEMENTATION',
      desc: 'Implements bounded methylation mu in [0, 1] and expression X_i(t) = w_i * (1 - mu_i) for runtime adaptation.',
    },
    {
      concept: 'Predictive Compatibility Assessment (PCAE)',
      module: 'backend/app/engines/pcae_engine.py',
      endpoint: 'POST /api/pcae/evaluate',
      view: 'PCAE / Compatibility',
      status: 'FULL IMPLEMENTATION',
      desc: 'Evaluates SCS (Structural), SemCS (Semantic bounded), TCS (Temporal), and RCS (Resource) composite scoring.',
    },
    {
      concept: 'Predictive Failure Probability (P_fail)',
      module: 'backend/app/engines/prediction_engine.py',
      endpoint: 'GET /api/pcae/current',
      view: 'Overview, PCAE, Gating',
      status: 'FULL IMPLEMENTATION',
      desc: 'Estimates near-future incompatibility risk via sigmoid dynamics over actual historical telemetry.',
    },
    {
      concept: 'Pre-Emptive Gating & Hysteresis',
      module: 'backend/app/engines/gating_engine.py',
      endpoint: 'GET /api/gating/current',
      view: 'Gating & Explanation',
      status: 'FULL IMPLEMENTATION',
      desc: 'Automates ALLOW / DEGRADE / REROUTE / QUARANTINE action state switching with hysteresis boundary dampening.',
    },
    {
      concept: 'Attested Quorum Synchronization',
      module: 'backend/app/engines/quorum_sync.py',
      endpoint: 'POST /api/sync/exchange',
      view: 'Quorum Synchronization',
      status: 'PROTOTYPE IMPLEMENTATION',
      desc: 'Simulates 3-node peer consensus with delta hashing and 2-of-3 threshold voting.',
    },
    {
      concept: 'Compatibility Proof Certificate',
      module: 'backend/app/engines/evolution_engine.py',
      endpoint: 'POST /api/evolution/certify',
      view: 'Evolution & Proof Certs',
      status: 'PROTOTYPE IMPLEMENTATION',
      desc: 'Generates cryptographically signed migration safety certificates for candidate contract evolutions.',
    },
    {
      concept: 'Intermediate Representation (ECG-IR)',
      module: 'backend/app/engines/ecg_ir_engine.py',
      endpoint: 'GET /api/genotypes/active',
      view: 'Genome Page (ECG-IR tab)',
      status: 'PROTOTYPE IMPLEMENTATION',
      desc: 'Compiles expressed genes into executable linear bytecode verification instructions.',
    },
    {
      concept: 'Behavior Morphing Adapters',
      module: 'backend/app/engines/behavior_morphing.py',
      endpoint: 'POST /api/simulation/morph',
      view: 'Behavior Morphing',
      status: 'PROTOTYPE IMPLEMENTATION',
      desc: 'Simulates runtime request payload adaptation and re-evaluates post-morph compatibility.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Patent & Academic Mapping Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explicit traceability linking ECG / ACO patent concepts to backend implementation modules, APIs, and UI views.
          </p>
        </div>
        <StatusBadge status="ACADEMIC SPECIFICATION" size="md" />
      </div>

      <div className="glass-panel p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Patent / Theoretical Concept</th>
                <th className="py-2.5 px-3">Implementation Module</th>
                <th className="py-2.5 px-3">API Route</th>
                <th className="py-2.5 px-3">Dashboard View</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {mappings.map((m, i) => (
                <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{m.concept}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{m.desc}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-indigo-300">{m.module}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{m.endpoint}</td>
                  <td className="py-3 px-3 text-slate-200">{m.view}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={m.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
