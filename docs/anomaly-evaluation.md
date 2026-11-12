# Anomaly Detection Evaluation Plan

## Evaluation goals

The current engine is a deterministic rules prototype operating on synthetic
fixtures. This plan defines how its alerts could be evaluated; it does not
claim real-world accuracy. Do not select or tune thresholds from the same
period used to report final results.

## Metrics

For a fixed evaluation window and anomaly category:

- **True positive (TP):** an alert matches a domain-reviewed, independently
  labeled operational anomaly under a documented matching rule.
- **False positive (FP):** an alert has no corresponding labeled anomaly.
- **False negative (FN):** a labeled anomaly has no corresponding alert.
- **Precision:** `TP / (TP + FP)`. This is the share of emitted alerts that are
  confirmed.
- **Recall:** `TP / (TP + FN)`. This is the share of labeled anomalies found.

When a denominator is zero, report the metric as unavailable; do not silently
report 0% or 100%. Report counts and sample size beside each percentage. Review
precision and recall separately by category, product, location, severity, and
time period. Include alert volume per product/location/week, duplicate rate,
median time from source observation to alert, operator acknowledgement and
resolution time, and the share of alerts judged actionable.

For eventual financial outcomes, compare measured outcomes to an explicitly
defined baseline and control for seasonality and operational changes. Current
data has no prices or verified outcomes, so it supports no revenue, waste-cost,
or savings metric.

## Deterministic test scenarios

| Detector             | Positive scenario                                                  | Negative/edge scenario                                       | Expected behavior                                                                |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Demand spike         | Last actual ≥124% of preceding 28-day mean                         | Value just below threshold; fewer than 29 valid daily points | Detect positive; do not detect boundary-below or insufficient-history case       |
| Demand drop          | Last actual ≤76% of preceding 28-day mean                          | Value just above threshold                                   | Detect only at/below configured boundary                                         |
| Forecast divergence  | Absolute prediction error ≥8% of nonzero actual; include ≥20% case | Error below threshold; invalid or missing prediction         | Detect and assign threshold severity; skip/report invalid observation            |
| Stockout             | Cover at 0.8, 1.5, 2.2, and 3.1 days                               | Zero/negative stock, nonfinite demand, missing metrics       | Verify Critical/High/Medium/no alert boundaries; skip invalid metrics            |
| Excess inventory     | Cover >12 and >21 days                                             | Cover at or below 12 days                                    | Detect only above threshold and distinguish severity                             |
| Expiry               | Expiry in one day and cover extends past expiry                    | Expiry after sell-through or stock is zero                   | Calculate a nonnegative potential quantity, not confirmed waste                  |
| Shipment delay       | Explicit delayed status with quantity                              | Other status; invalid quantity; no timestamps                | Alert only on explicit delayed status; never infer delay hours                   |
| Batch gap            | Consecutive events >24 and ≥72 hours apart                         | Gap ≤24 hours; invalid timestamp                             | Verify threshold and severity; label gap as missing-event possibility, not proof |
| Temperature          | Chilled reading above 4°C; frozen reading warmer than −18°C        | At-threshold reading, non-dairy category, missing reading    | Detect only a supported observation and category; never invent telemetry         |
| Quality              | `review` / `failed` status or milk SNF <8.3%                       | Passed status and in-range synthetic reading                 | Detect supported quality concern and preserve inspection ID                      |
| Duplicate prevention | Same source record supplied twice                                  | Same rule on distinct dates/record IDs                       | One anomaly per stable ID; preserve separate events                              |
| Workflow persistence | Acknowledge and resolve; reload snapshot                           | Unknown ID, corrupt storage, attempt backward transition     | Persist only status/activity; surface invalid state/error                        |
| Filtering            | Query plus category/severity/status filters                        | No matching results; empty query                             | Return only the intersection of selected filters                                 |

Focused executable cases for the current engine are in
`src/lib/intelligence/intelligence.test.ts`. They verify deterministic rule
outputs, severity, unit impact, recommendations, invalid-data warnings,
deduplication, filters, and workflow persistence.

## Current synthetic fixture coverage

During implementation, a run against the shared generated records produced:

| Category              | Alerts |
| --------------------- | -----: |
| Demand spike          |    109 |
| Demand drop           |      0 |
| Forecast divergence   |      0 |
| Stockout risk         |      8 |
| Excess inventory      |      9 |
| Expiry risk           |     15 |
| Shipment delay        |      1 |
| Batch event gap       |      0 |
| Temperature excursion |      2 |
| Quality concern       |      2 |

These are deterministic fixture counts, not precision, recall, expected
production alert volume, or evidence that all categories have been validated.
Demand-drop, forecast-divergence, and batch-gap behavior is covered by targeted
synthetic test inputs even though the shared fixture does not currently trigger
those rules.

The current sample includes shipment `SHP-88416` explicitly marked `delayed`
(980 listed cases, not a loss), a milk inspection at 4.7°C against the
demonstration 4°C limit, and a `review` inspection with SNF 8.2% against the
demonstration 8.3% threshold. Stockout examples use derived stock cover and
synthetic inventory IDs. No product prices, stock movements, or actual
delivery timestamps are available.

## Known false-positive and false-negative modes

Examples of **false positives**:

- A legitimate promotion, calendar event, or bulk order raises demand above
  the mean and is flagged as anomalous.
- A stock record's synthetic one-day demand proxy differs from actual
  replenishment lead time, although available stock may be adequate.
- A valid operational pause creates a long interval between batch events.
- A quality reading crosses a demonstration threshold that is not a validated
  product specification or measurement.
- The generated periodic demand pattern repeatedly creates alerts despite
  being intentional in the fixture.

Examples of **false negatives**:

- A material demand change under the 24% threshold is not flagged by spike or
  drop rules.
- A forecast bias below the configured 8% daily error is not surfaced by the
  divergence rule.
- Shipment delay duration cannot be detected if the source status is not
  updated to `delayed`; duration cannot be calculated from the clock-only ETA.
- Inventory movement anomalies cannot be detected without a movement ledger.
- Temperature excursions between sample inspections cannot be detected from
  sparse observations.
- A missing batch lifecycle stage cannot be proven from adjacent events alone.

## Real-data validation plan

Before any operational pilot:

1. Agree on a specific user/job and what qualifies as an actionable anomaly
   with planners, logistics, and qualified quality operators.
2. Obtain authorized, privacy-reviewed historical data with stable product,
   facility, shipment, batch, and timestamp identifiers. Include stock
   snapshots and movement events, planned/actual delivery timestamps,
   sufficient temperature sampling, and quality specifications with provenance.
3. Have domain reviewers label an independent set of events using a written
   adjudication guide. Record disagreement and uncertain labels rather than
   forcing binary truth.
4. Split train/tuning and held-out evaluation chronologically to avoid future
   leakage. Compare the rules to simple operational baselines (seasonal-naive,
   existing thresholds, and current human triage where available).
5. Report category-level precision, recall, alert volume, lead time, and
   operator actionability with confidence intervals or small-sample warnings.
   Examine performance by location/product and identify uneven alert burden.
6. Conduct a shadow-mode review before exposing alerts to a decision workflow.
   Capture acknowledge/resolve outcomes and false-positive reasons, but do not
   automatically change inventory, shipments, or quality disposition.
7. Reassess thresholds with users, repeat the held-out evaluation, document
   version and rollback criteria, and only then consider a bounded AI
   explanation layer. Any monetary-impact model needs approved price/cost
   sources and finance review.

Synthetic fixtures are useful for deterministic regression tests only. They
cannot establish production precision/recall, alert usefulness, business
impact, food-safety performance, or customer value.
