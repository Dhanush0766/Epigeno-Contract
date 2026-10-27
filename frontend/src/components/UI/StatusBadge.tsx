import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showDot = true }) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  // ── GREEN: success / nominal / safe states ──
  if (
    norm === 'ALLOW' ||
    norm === 'ACTIVE' ||
    norm === 'SAFE' ||
    norm === 'SUCCESS' ||
    norm === 'ATTESTED' ||
    norm === 'VERIFIED' ||
    norm === 'APPROVE' ||
    norm === 'APPROVED' ||
    norm === 'LIVE MICROSERVICES' ||
    norm === 'FULL IMPLEMENTATION' ||
    norm === 'ACADEMIC SPECIFICATION' ||
    norm === 'LIVE' ||
    norm === 'MEASURED' ||
    norm === 'UP'
  ) {
    style = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
    dotColor = 'bg-emerald-400';

  // ── AMBER: degraded / warning / pending states ──
  } else if (
    norm === 'DEGRADE' ||
    norm === 'WARNING' ||
    norm === 'PENDING' ||
    norm === 'DEMO DATA' ||
    norm === 'PROTOTYPE IMPLEMENTATION'
  ) {
    style = 'bg-amber-950/60 text-amber-400 border-amber-800/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
    dotColor = 'bg-amber-400';

  // ── ORANGE: reroute / redirect ──
  } else if (norm === 'REROUTE') {
    style = 'bg-orange-950/60 text-orange-400 border-orange-800/80 shadow-[0_0_12px_rgba(249,115,22,0.2)]';
    dotColor = 'bg-orange-400';

  // ── RED: critical / breaking / quarantine ──
  } else if (
    norm === 'QUARANTINE' ||
    norm === 'CRITICAL' ||
    norm === 'BREAKING' ||
    norm === 'FAILED' ||
    norm === 'REJECTED' ||
    norm === 'REJECT' ||
    norm === 'ERROR'
  ) {
    style = 'bg-rose-950/70 text-rose-400 border-rose-800/80 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse';
    dotColor = 'bg-rose-400';

  // ── INDIGO/BLUE: informational labels ──
  } else if (
    norm === 'REFERENCE' ||
    norm === 'ACADEMIC SPECIFICATION' ||
    norm === 'PATENT' ||
    norm === 'ORIGINAL'
  ) {
    style = 'bg-purple-950/60 text-purple-300 border-purple-700/60';
    dotColor = 'bg-purple-400';

  } else if (
    norm === 'PREDICTIVE ACTIVE' ||
    norm === 'VOICE ENABLED' ||
    norm === 'SANDBOX ISOLATED' ||
    norm === 'CRYPTOGRAPHICALLY IMMUTABLE'
  ) {
    style = 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60';
    dotColor = 'bg-indigo-400';

  } else if (norm === 'INFO') {
    style = 'bg-sky-950/60 text-sky-300 border-sky-700/60';
    dotColor = 'bg-sky-400';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide ${style} ${sizeClasses}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {norm}
    </span>
  );
};
