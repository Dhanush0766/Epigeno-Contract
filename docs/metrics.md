# Software Metrics & Mathematical Formulations

This document specifies the exact mathematical formulas, statistical derivations, and categorization rules for all software metrics implemented across the ACO / ECG platform.

---

## 1. Metrics Categorization & Strict Separation

To maintain academic rigor and clarity, metrics are separated into four non-overlapping domains:

```text
+-----------------------------------------------------------------------------+
|                               SOFTWARE METRICS                              |
+----------------------+-----------------------+------------------------------+
|   NLP METRICS        |     PCAE METRICS      |     CONTRACT METRICS         |
| - Intent Accuracy    | - SCS, SemCS          | - CCPS (Change Preservation) |
| - Intent/Entity F1   | - TCS, RCS, CS        | - Gene Mutation Rate         |
| - Execution Accuracy | - P_fail Risk         | - Structural Delta           |
+----------------------+-----------------------+------------------------------+
|                      |  SYSTEM / PROJECT     |                              |
|                      | - PCG (Pre-emptive)   | - MTTR, MTTD, MTTP           |
|                      | - AGE (Efficiency)    | - Decision-Cycle Latency     |
+----------------------+-----------------------+------------------------------+
```

> [!CAUTION]
> - **NLP Confidence $\ne$ Compatibility Score**: NLP Confidence measures conversational intent extraction certainty; Compatibility Score measures inter-service operational alignment.
> - **Compatibility Score $\ne$ ML Accuracy**: Compatibility Score is a deterministic domain overlap metric, not statistical classifier accuracy.
> - **CCPS $\ne$ NLP Accuracy**: Contract Change Preservation Score measures degree of invariant and compatibility preservation across versions.

---

## 2. Mathematical Formulations

### 2.1 Contract Change Preservation Score (CCPS)
Measures the retention of overall system compatibility following a proposed contract mutation:
$$\text{CCPS} = \frac{CS_{\text{changed}}}{CS_{\text{original}}} \times 100\%$$
- **Range**: $[0\%, 100+\%]$
- **Interpretation**: $\text{CCPS} \ge 95\%$ indicates a safe, non-breaking evolution. $\text{CCPS} < 75\%$ signals a severe breaking change requiring quarantine or adaptation.

### 2.2 Pre-Emptive Compatibility Gain (PCG)
Quantifies the operational reliability gained by pre-emptively gating or degrading before runtime failure cascades occur:
$$\text{PCG} = \frac{\text{Averted Runtime Faults} - \text{False Positive Gating Penalties}}{\text{Total Potential Incompatibility Events}} \times 100\%$$

### 2.3 Adaptive Genome Efficiency (AGE)
Measures the responsiveness and dampening efficiency of epigenetic methylation in mitigating transient environmental volatility:
$$\text{AGE} = \frac{\sum_{i=1}^N \Delta \mu_i \cdot w_i}{\text{Decision Latency (ms)} \times \text{Storage Growth (bytes)}} \times 10^3$$

### 2.4 Mean Time to Prevention (MTTP) vs Mean Time to Detection (MTTD)
- **MTTP (Mean Time to Prevention)**: Average time elapsed between contract mutation proposal and pre-emptive gate enforcement (target: $< 25\text{ ms}$).
- **MTTD (Mean Time to Detection)**: Time to detect runtime failure in legacy un-gated systems (typical: $> 1200\text{ ms}$).
- **MTTR (Mean Time to Recovery)**: Average duration to execute an automated or operator-approved contract rollback (target: $< 50\text{ ms}$).

### 2.5 NLP Intent & Entity Evaluation Formulas
$$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}, \quad F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$
Evaluated over historical operator commands and benchmark golden sets.

---

## 3. Data Source Attribution & UI Labeling

Every numeric KPI in the dashboard carries one of three explicit origin badges:

1. `[MEASURED]`: Calculated dynamically in real time from live database events, current engine executions, and system clocks.
2. `[DEMO DATA]`: Deterministic baseline historical telemetry seeded into the database for rich visualization and trend continuity.
3. `[REFERENCE]`: Literature benchmark values from foundational academic papers and patents, displayed for comparative analysis only.
