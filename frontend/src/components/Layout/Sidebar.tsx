import React from 'react';
import {
  LayoutDashboard,
  FileCode2,
  Bot,
  GitCompare,
  Cpu,
  Dna,
  ShieldAlert,
  BarChart3,
  GitBranch,
  Network,
  Boxes,
  Shuffle,
  History,
  BookOpen,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'contracts'
  | 'nlp'
  | 'diff'
  | 'pcae'
  | 'genome'
  | 'gating'
  | 'metrics'
  | 'evolution'
  | 'sync'
  | 'simulation'
  | 'morphing'
  | 'events'
  | 'patent';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unresolvedGating?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, unresolvedGating }) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'contracts' as NavTab, label: 'Contract Explorer', icon: FileCode2 },
    { id: 'nlp' as NavTab, label: 'NLP Assistant', icon: Bot, badge: 'Voice' },
    { id: 'diff' as NavTab, label: 'Contract Diff', icon: GitCompare },
    { id: 'pcae' as NavTab, label: 'PCAE / Compatibility', icon: Cpu },
    { id: 'genome' as NavTab, label: 'Genome & Epigenome', icon: Dna },
    { id: 'gating' as NavTab, label: 'Gating & Explanation', icon: ShieldAlert, alert: unresolvedGating },
    { id: 'metrics' as NavTab, label: 'Software Metrics', icon: BarChart3 },
    { id: 'evolution' as NavTab, label: 'Evolution & Proof Cert', icon: GitBranch },
    { id: 'sync' as NavTab, label: 'Quorum Sync', icon: Network },
    { id: 'simulation' as NavTab, label: 'Digital Twin Sandbox', icon: Boxes },
    { id: 'morphing' as NavTab, label: 'Behavior Morphing', icon: Shuffle },
    { id: 'events' as NavTab, label: 'Event History', icon: History },
    { id: 'patent' as NavTab, label: 'Patent Mapping', icon: BookOpen },
  ];

  return (
    <aside className="w-64 min-w-[16rem] h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-md p-3 select-none">
      <div>
        <div className="px-3 py-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                    {item.badge}
                  </span>
                )}
                {item.alert && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/60 text-xs text-slate-400">
        <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
          <span>Architecture</span>
          <span className="text-[10px] text-emerald-400 font-mono">ACO-ECG v1.0</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Consumer <span className="text-slate-300 font-mono">svc-order</span> &rarr; Provider <span className="text-slate-300 font-mono">svc-payment</span>
        </p>
      </div>
    </aside>
  );
};
