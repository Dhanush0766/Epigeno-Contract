import React, { useState } from 'react';
import { History, Search, Filter, Eye } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { Modal } from '../components/UI/Modal';
import type { EventLogItem } from '../types';

interface EventHistoryPageProps {
  events: EventLogItem[];
}

export const EventHistoryPage: React.FC<EventHistoryPageProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [inspectEvent, setInspectEvent] = useState<EventLogItem | null>(null);

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(e.payload).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || e.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Audit Log & Event Stream
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological ledger of contract creations, epigenetic learning events, PCAE evaluations, and gate decisions.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">Total Recorded: {events.length}</span>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search event type, correlation ID, or payload..."
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Severity:</span>
          {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                severityFilter === sev ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Payload Summary</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{evt.event_type}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-300">
                    {evt.service_id || 'svc-payment-01'}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={evt.severity} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                    {JSON.stringify(evt.payload)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setInspectEvent(evt)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Payload Inspector Modal */}
      <Modal
        isOpen={!!inspectEvent}
        onClose={() => setInspectEvent(null)}
        title={`Event Payload: ${inspectEvent?.event_type || ''}`}
        confirmText="Close"
        onConfirm={() => setInspectEvent(null)}
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Event ID:</span>
            <span className="text-slate-200">{inspectEvent?.event_id}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Timestamp:</span>
            <span className="text-slate-200">{inspectEvent?.timestamp}</span>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-60">
            {JSON.stringify(inspectEvent?.payload || {}, null, 2)}
          </pre>
        </div>
      </Modal>
    </div>
  );
};
