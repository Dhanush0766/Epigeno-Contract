import React, { useState } from 'react';
import { Boxes, Play, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { api } from '../services/api';

export const DigitalTwinPage: React.FC = () => {
  const [simField, setSimField] = useState('amount');
  const [simType, setSimType] = useState('string');
  const [simTimeout, setSimTimeout] = useState(2000);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunSimulation = async () => {
    try {
      setIsLoading(true);
      const simulatedContract = {
        request_schema: {
          type: 'object',
          required: ['user_id', 'amount', 'currency'],
          properties: {
            user_id: { type: 'string' },
            [simField]: { type: simType },
            currency: { type: 'string' },
          },
        },
        temporal_constraints: {
          max_latency_ms: simTimeout,
        },
        resource_constraints: {
          min_throughput_rps: 500,
        },
      };

      const res = await api.simulateContract(simulatedContract);
      setSimulationResult(res);
    } catch (e: any) {
      alert(`Simulation error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-400" />
            Digital Twin Simulation Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate prospective mutations in an isolated memory shadow copy without altering production contracts.
          </p>
        </div>
        <StatusBadge status="SANDBOX ISOLATED" size="md" />
      </div>

      {/* Simulator Control Card */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
          Hypothetical Mutation Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Target Field:</label>
            <input
              type="text"
              value={simField}
              onChange={(e) => setSimField(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Simulated Type:</label>
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none"
            >
              <option value="string">string (Type Mutation)</option>
              <option value="number">number (Numeric Float)</option>
              <option value="boolean">boolean</option>
              <option value="object">object (Nested Complex)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Latency Limit (ms):</label>
            <input
              type="number"
              value={simTimeout}
              onChange={(e) => setSimTimeout(parseInt(e.target.value) || 2000)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        <button
          disabled={isLoading}
          onClick={handleRunSimulation}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all shadow-md shadow-indigo-950/50 flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Execute Digital Twin Sandbox Simulation
        </button>
      </div>

      {/* Side-by-Side Comparison: Live vs Simulated */}
      {simulationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Production State */}
          <div className="glass-panel p-5 border-t-4 border-t-slate-500">
            <span className="text-[10px] uppercase font-bold text-slate-400">Production Baseline</span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">Live Environment</h3>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Compatibility (CS):</span>
                <span className="font-bold text-emerald-400">
                  {(simulationResult.live_state.cs * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Failure Risk ($P_{'{fail}'}$):</span>
                <span className="font-mono text-slate-300">
                  {(simulationResult.live_state.p_fail * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Gate State:</span>
                <StatusBadge status={simulationResult.live_state.gate} size="sm" />
              </div>
            </div>
          </div>

          {/* Simulated Twin State */}
          <div
            className={`glass-panel p-5 border-t-4 ${
              simulationResult.is_safe_to_apply ? 'border-t-emerald-500' : 'border-t-rose-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Digital Twin Sandbox</span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">Simulated State</h3>
              </div>
              <StatusBadge status={simulationResult.simulated_state.gate} size="sm" />
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Predicted CS:</span>
                <span
                  className={`font-bold ${
                    simulationResult.simulated_state.cs >= 0.8 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {(simulationResult.simulated_state.cs * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Predicted Risk:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {(simulationResult.simulated_state.p_fail * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Preservation (CCPS):</span>
                <span className="font-bold text-cyan-300">
                  {simulationResult.simulated_state.ccps.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
