# Product metrics (proposed; not instrumented)

This document defines candidate measurements for a future, authorized
evaluation. No telemetry, production baseline, customer sample, or validated
target exists in this project.

## Candidate outcome

**Primary workflow outcome:** proportion of eligible exception-review tasks
where an operator can find the supporting source record and record an
appropriate next step within the agreed task window.

Before using this measure, define eligible tasks, the task window, the
operator role, actionability rubric, and an independent reviewer. It is not
currently measurable from this prototype.

## Metric definitions

| Metric                    | Proposed definition                                                                                                | Required source                                   | Current status                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------- |
| Forecast error            | MAE and WAPE on a chronologically held-out window; report bias and a seasonal-naive baseline                       | Authorized actual demand and timestamped forecast | Synthetic backtest only; not an outcome      |
| Alert precision           | `TP / (TP + FP)` using independently reviewed anomaly labels                                                       | Versioned rule output and adjudicated labels      | Not measurable against unlabeled fixtures    |
| Alert recall              | `TP / (TP + FN)` using all labeled anomalies in scope                                                              | Complete reviewed event set                       | Not measurable against unlabeled fixtures    |
| Alert burden              | Alerts per product/location/week and share judged actionable                                                       | Stable entity/time identifiers and review labels  | Synthetic counts only                        |
| Review completion         | Completed eligible tasks / started eligible tasks                                                                  | Consented product events and task definition      | Not instrumented                             |
| Time to decision          | Median time from review start to a recorded operator decision                                                      | Timestamped, role-approved workflow events        | Local demo timestamps only                   |
| Stockout/expiry outcome   | Rate per agreed unit/time denominator, before and after a controlled evaluation                                    | Authorized inventory movements and outcome labels | No movement ledger or confirmed waste source |
| Traceability task success | Share of assigned batch lookups that reach the correct authorized record and complete the required integrity check | Test tasks and approved event source              | Local synthetic hashes only                  |

For every percentage, report the numerator, denominator, sample size, period,
and uncertainty. If a denominator is zero or data is missing, report
unavailable rather than 0% or 100%.

## Guardrails

- No automated inventory, quality-disposition, or shipment action.
- No exposure of personal, partner-sensitive, or commercially sensitive data.
- Review false-positive burden by role, product, location, and category.
- Show source time, data-quality gaps, and model/rule version.
- No claim of food-safety or financial benefit without domain and finance
  validation.

## Instrumentation prerequisites

Obtain privacy/security approval; define event purpose, retention, access,
consent/legal basis, and deletion; avoid collecting free-text sensitive
details; and separate product telemetry from operational source records.
LocalStorage activity in the demo is not analytics instrumentation and should
not be treated as user behavior data.
