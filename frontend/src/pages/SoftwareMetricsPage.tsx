import React, { useState } from 'react';
import { BarChart3, Bot, Cpu, Gauge, BookOpen, Sparkles } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import type { SoftwareMetrics } from '../types';

interface SoftwareMetricsPageProps {
  metrics: SoftwareMetrics | null;
}

// Smart value formatter based on metric key and context
function formatMetricValue(key: string, value: number | string): string {
  if (typeof value === 'string') return value;
  // Rate / probability metrics (0–1 scale → show as %)
  if (
    key.includes('rate') ||
    key.includes('accuracy') ||
    key.includes('precision') ||
    key.includes('recall') ||
    key.includes('f1') ||
    key.includes('false_positive') ||
    key.includes('predictive') ||
    key.includes('baseline') ||
    key.includes('scs') ||
    key.includes('semcs') ||
    key.includes('tcs') ||
    key.includes('rcs') ||
    key.includes('cs') ||
    key.includes('p_fail') ||
    key.includes('quarantine_risk') ||
    key.includes('breaking') ||
    key === 'compatibility'
  ) {
    return `${(value * 100).toFixed(1)}%`;
  }
  // Latency/bandwidth/bytes — show with unit suffix
  if (key.includes('ms') || key.includes('latency') || key.includes('mttp') || key.includes('mttd') || key.includes('mttr')) {
    return `${value}ms`;
  }
  if (key.includes('kb') || key.includes('bandwidth')) return `${value} KB`;
  if (key.includes('bytes') || key.includes('storage')) return `${value} B`;
  // Already-percentage metrics (ccps, pcg, age are already 0-100 scale)
  if (key === 'ccps' || key === 'pcg' || key === 'age') return `${(value as number).toFixed(1)}%`;
  // Command execution accuracy
  if (key.includes('command_execution')) return `${(value * 100).toFixed(1)}%`;
  return String(value);
}

export const SoftwareMetricsPage: React.FC<SoftwareMetricsPageProps> = ({ metrics }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'nlp' | 'pcae' | 'system' | 'project' | 'reference'>('all');

  const nlp = metrics?.nlp_metrics || {};
  const pcae = metrics?.pcae_metrics || {};
  const sys = metrics?.system_metrics || {};
  const proj = metrics?.project_metrics || {};
  const ref = metrics?.reference_benchmarks || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Software & System Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical runtime performance, NLP F1-scores, Pre-Emptive Gain (PCG), and literature reference benchmarks.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
          {(['all', 'nlp', 'pcae', 'system', 'project', 'reference'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Project: CCPS, PCG, AGE */}
        {(activeTab === 'all' || activeTab === 'project') && (
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                ACO / ECG Project Metrics
              </h3>
              <span className="ml-auto text-[10px] text-slate-500 italic">Computed from live evaluation data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(proj).map(([key, m]: [string, any]) => (
                <div key={key} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase">{key.toUpperCase()}</span>
                    <StatusBadge status={m.label || 'DEMO DATA'} size="sm" />
                  </div>
                  <div className="text-2xl font-black text-cyan-300 mt-2">
                    {formatMetricValue(key, m.value)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NLP F1 */}
        {(activeTab === 'all' || activeTab === 'nlp') && (
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Bot className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                NLP Intent & Entity Classifier Metrics
              </h3>
              <span className="ml-auto text-[10px] text-slate-500 italic">[DEMO DATA] — computed over 15-class corpus</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(nlp).map(([key, m]: [string, any]) => (
                <div key={key} className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                    <StatusBadge status={m.label || 'DEMO DATA'} size="sm" />
                  </div>
                  <div className="text-xl font-bold text-indigo-300 mt-1.5">
                    {formatMetricValue(key, m.value)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PCAE live scores */}
        {(activeTab === 'all' || activeTab === 'pcae') && (
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                PCAE Compatibility Dimension Scores
              </h3>
              <span className="ml-auto text-[10px] text-slate-500 italic">[MEASURED] — from live engine evaluation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(pcae).map(([key, m]: [string, any]) => (
                <div key={key} className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase">{key}</span>
                    <StatusBadge status={m.label || 'MEASURED'} size="sm" />
                  </div>
                  <div className="text-xl font-bold text-emerald-300 mt-1.5">
                    {formatMetricValue(key, m.value)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System operational */}
        {(activeTab === 'all' || activeTab === 'system') && (
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <Gauge className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                System Latency, Prevention & Recovery Metrics
              </h3>
              <span className="ml-auto text-[10px] text-slate-500 italic">[DEMO DATA] — measured from simulated telemetry</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(sys).map(([key, m]: [string, any]) => (
                <div key={key} className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase">{key.replace(/_/g, ' ')}</span>
                    <StatusBadge status={m.label || 'DEMO DATA'} size="sm" />
                  </div>
                  <div className="text-xl font-bold text-amber-300 mt-1.5">
                    {formatMetricValue(key, m.value)} {!formatMetricValue(key, m.value).includes(m.unit || '') && m.unit ? m.unit : ''}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference benchmarks from patent */}
        {(activeTab === 'all' || activeTab === 'reference') && (
          <div className="glass-panel p-5 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Patent & Academic Reference Benchmarks
              </h3>
              <span className="ml-auto text-[10px] text-slate-500 italic">[REFERENCE] — from ECG/ACO patent specification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(ref).map(([key, m]: [string, any]) => (
                <div key={key} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300 uppercase">{key.replace(/_/g, ' ')}</span>
                    <StatusBadge status="REFERENCE" size="sm" />
                  </div>
                  <div className="text-xl font-bold text-purple-300 mt-2">
                    {formatMetricValue(key, m.value)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
