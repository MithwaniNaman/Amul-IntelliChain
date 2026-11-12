# Experimentation plan (proposed, not run)

## Experiment 1: Is evidence-linked anomaly review useful?

**Hypothesis:** Operators reviewing a supported exception can identify its
source evidence and choose an appropriate investigation step more reliably
with a combined anomaly/evidence view than with a signal-only view.

**Design:** After discovery and data authorization, run moderated, synthetic or
de-identified task sessions. Randomize task order between (A) a signal-only
list and (B) the evidence-linked prototype to reduce learning/order effects.
Use matched tasks, a written actionability rubric, and an independent reviewer.

**Primary measure:** task completion and correct evidence identification,
defined before recruitment. **Guardrails:** time burden, confidence
calibration, false-alert interpretation, and accidental treatment of a
hypothetical quantity as financial loss.

**Decision:** proceed only if the pre-agreed minimum improvement `T` is met
without guardrail regression. Set `T`, sample size, confidence approach, and
task window with stakeholders before data collection; none are invented here.

## Experiment 2: Are deterministic rules worth a shadow evaluation?

**Hypothesis:** A narrow set of agreed demand and stock rules can surface
review-worthy exceptions at an acceptable alert volume on authorized,
historical data.

**Design:** Select one product/location context and one alert category with
domain experts. Freeze thresholds on a tuning period; evaluate on a later
chronological holdout labeled independently. Compare with current workflow
and a simple baseline. Do not show alerts to operators as operational
instructions during initial shadow mode.

**Primary measures:** category-level precision, recall, weekly alert burden,
duplicate rate, and median observation-to-alert delay. **Guardrails:** missing
data rate, uneven alert burden across locations, and reviewers' disagreement.

**Decision:** tune, narrow, or stop based on pre-registered criteria and
rollback conditions. Do not auto-execute recommendations.

## Prerequisites and risks

- Confirm user need, source ownership, lawful access, privacy, and retention.
- Establish stable identifiers, event time semantics, quality rules, and label
  guidance.
- Avoid leakage with chronological splits; keep the final holdout untouched
  until the rule is frozen.
- Record evaluation code, thresholds, dataset version, adjudication protocol,
  sample sizes, and limitations.
- Synthetic fixtures support deterministic regression tests only. They are
  not evidence that either experiment has succeeded.

## Current status

No experiment has run. There are no participants, cohorts, production labels,
or measured outcomes in this repository.
