const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Contracts
  getActiveContract: () => fetchJson<any>(`${API_BASE}/contracts/active`),
  getContractHistory: () => fetchJson<any>(`${API_BASE}/contracts/history`),
  computeDiff: (data: any) => fetchJson<any>(`${API_BASE}/contracts/diff`, { method: 'POST', body: JSON.stringify(data) }),
  mutateContract: (data: any) => fetchJson<any>(`${API_BASE}/contracts/mutate`, { method: 'POST', body: JSON.stringify(data) }),
  rollbackContract: (data?: any) => fetchJson<any>(`${API_BASE}/contracts/rollback`, { method: 'POST', body: JSON.stringify(data || {}) }),

  // Genotypes
  getActiveGenotype: () => fetchJson<any>(`${API_BASE}/genotypes/active`),
  methylateGene: (data: { gene_id: string; delta_mu: number; context?: string }) =>
    fetchJson<any>(`${API_BASE}/genotypes/methylate`, { method: 'POST', body: JSON.stringify(data) }),

  // PCAE
  getCurrentPcae: () => fetchJson<any>(`${API_BASE}/pcae/current`),
  triggerReEvaluation: (weights?: any) =>
    fetchJson<any>(`${API_BASE}/pcae/re-evaluate`, { method: 'POST', body: JSON.stringify(weights || {}) }),

  // Gating
  getCurrentGate: () => fetchJson<any>(`${API_BASE}/gating/current`),
  getExplanation: () => fetchJson<any>(`${API_BASE}/gating/explanation`),

  // NLP
  parseNlpCommand: (text: string, mode: 'TEXT' | 'VOICE' = 'TEXT') =>
    fetchJson<any>(`${API_BASE}/nlp/parse`, { method: 'POST', body: JSON.stringify({ text, mode }) }),
  executeNlpCommand: (data: { intent: string; entities: any; confirmed: boolean }) =>
    fetchJson<any>(`${API_BASE}/nlp/execute`, { method: 'POST', body: JSON.stringify(data) }),
  getNlpHistory: () => fetchJson<any>(`${API_BASE}/nlp/history`),

  // Metrics
  getAllMetrics: () => fetchJson<any>(`${API_BASE}/metrics/all`),

  // Quorum Sync
  triggerQuorumSync: (data?: any) =>
    fetchJson<any>(`${API_BASE}/sync/exchange`, { method: 'POST', body: JSON.stringify(data || {}) }),
  getSyncHistory: () => fetchJson<any>(`${API_BASE}/sync/history`),

  // Simulation
  simulateContract: (simulatedContract: any) =>
    fetchJson<any>(`${API_BASE}/simulation/evaluate`, { method: 'POST', body: JSON.stringify({ simulated_contract: simulatedContract }) }),
  simulateMorph: (payload?: any) =>
    fetchJson<any>(`${API_BASE}/simulation/morph`, { method: 'POST', body: JSON.stringify(payload || {}) }),

  // Evolution
  issueProofCertificate: (version?: string) =>
    fetchJson<any>(`${API_BASE}/evolution/certify`, { method: 'POST', body: JSON.stringify({ version }) }),
  evaluateCandidateEvolution: (data: any) =>
    fetchJson<any>(`${API_BASE}/evolution/evaluate-candidate`, { method: 'POST', body: JSON.stringify(data) }),

  // Events
  getEventLogs: (limit = 50, severity?: string) =>
    fetchJson<any>(`${API_BASE}/events/all?limit=${limit}${severity ? `&severity=${severity}` : ''}`),

  // Demo Scenarios
  runDemoScenario1: () => fetchJson<any>(`${API_BASE}/demo/scenario/1-breaking-change`, { method: 'POST' }),
  runDemoScenario2: () => fetchJson<any>(`${API_BASE}/demo/scenario/2-safe-change`, { method: 'POST' }),
  runDemoScenario3: () => fetchJson<any>(`${API_BASE}/demo/scenario/3-temporal-change`, { method: 'POST' }),
  runDemoScenario4: () => fetchJson<any>(`${API_BASE}/demo/scenario/4-resource-change`, { method: 'POST' }),
  runDemoScenario5: () => fetchJson<any>(`${API_BASE}/demo/scenario/5-rollback`, { method: 'POST' }),
  resetDemoBaseline: () => fetchJson<any>(`${API_BASE}/demo/reset`, { method: 'POST' }),
  dispatchOrder: (data?: any) => fetchJson<any>(`${API_BASE}/demo/dispatch-order`, { method: 'POST', body: JSON.stringify(data || {}) }),
};
