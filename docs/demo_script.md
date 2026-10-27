# Demonstration Script & Scenario Runbook

This runbook guides evaluators and researchers through the five canonical demonstration scenarios showcasing the pre-emptive capabilities of the ACO / ECG architecture.

---

## Initial Healthy Baseline State
- **Services**: `order-service` (Consumer) $\to$ `payment-service` (Provider)
- **Active Contract**: `PaymentContract v1.0.0`
- **Compatibility Score ($CS$)**: `97.6%` ($SCS=1.0, SemCS=0.98, TCS=0.95, RCS=0.97$)
- **Predicted Failure Risk ($P_{fail}$)**: `4.1%`
- **Active Gate Action**: `ALLOW` (Green status badge)
- **Genotype Lineage**: `GT-PAYMENT-V1-INIT` (SHA-256: `7f83b...`)

---

## Scenario 1: Breaking Change (Type Mutation)
### Goal
Demonstrate how mutating a core required field type triggers pre-emptive `QUARANTINE` gating before any HTTP request fails.

### Execution Steps
1. Navigate to **NLP Assistant** view or use the quick demo button in the top bar.
2. Enter command:
   ```text
   Change amount from number to string.
   ```
3. **NLP Detection**:
   - Intent: `CHANGE_TYPE` (Confidence: `98.2%`)
   - Entities: `field: "amount"`, `old_type: "number"`, `new_type: "string"`
   - Risk Assessment: `BREAKING / CRITICAL`
4. Click **[Apply Change]** on the confirmation modal.
5. **Observed System Dynamics**:
   - Contract Version incremented to `v2.0.0-draft` $\to$ committed as `v2.0.0`.
   - New immutable Genotype generated with parent SHA-256 pointer.
   - **PCAE Re-evaluation**: Structural Compatibility ($SCS$) plummets to `0.41`; overall $CS$ drops to `0.60`.
   - **Predictive Risk**: $P_{fail}$ surges to `84.3%`.
   - **Gating Decision**: Transitions to `QUARANTINE`.
   - **Explanation Engine**: Explains `Type incompatibility on gene G-SCH-02 (amount expected number, provided string)`.
   - WebSocket broadcasts event to all connected dashboard clients instantly.

---

## Scenario 2: Safe Evolution (Optional Field Addition)
### Goal
Demonstrate backward-compatible contract extension that maintains high preservation.

### Execution Steps
1. In the NLP Assistant or top demo bar:
   ```text
   Add an optional customer phone number.
   ```
2. **NLP Detection**: Intent `ADD_FIELD`, `field: "phone"`, `type: "string"`, `required: false`.
3. Click **[Apply Change]**.
4. **Observed System Dynamics**:
   - $SCS$ remains at `0.98+`; $CS$ remains `97.1%`.
   - $\text{CCPS} = \frac{0.971}{0.976} \times 100\% = 99.5\%$ (`SAFE`).
   - Gate remains `ALLOW`.

---

## Scenario 3: Temporal Constraint Degradation
### Goal
Demonstrate how changing performance envelopes degrades $TCS$ and triggers `DEGRADE` / `REROUTE`.

### Execution Steps
1. Enter command:
   ```text
   Change payment timeout from 2 seconds to 5 seconds.
   ```
2. **Observed System Dynamics**:
   - $TCS$ shifts from `0.95` down to `0.58`.
   - Composite $CS$ drops to `0.76`.
   - $P_{fail}$ rises to `38.2%`.
   - Gate transitions to `DEGRADE` (Consumer is instructed to use caching / async processing).

---

## Scenario 4: Resource Constraint Modification
### Goal
Demonstrate capacity constraint alterations affecting $RCS$.

### Execution Steps
1. Enter command:
   ```text
   Reduce throughput requirement to 100 requests per second.
   ```
2. **Observed System Dynamics**:
   - $RCS$ adjusts relative to provider capacity.
   - Live resource metric chart updates immediately.

---

## Scenario 5: Instantaneous Rollback
### Goal
Demonstrate instant atomic rollback to the previous stable genotype state without destroying historical provenance.

### Execution Steps
1. Enter command:
   ```text
   Rollback the last change.
   ```
2. **Observed System Dynamics**:
   - System points active contract pointer back to `v1.0.0`.
   - Genotype lineage registers a `ROLLBACK_EVENT` preserving full audit trail.
   - PCAE re-evaluates to $CS = 97.6\%$, $P_{fail} = 4.1\%$.
   - Gate returns smoothly to `ALLOW`.
