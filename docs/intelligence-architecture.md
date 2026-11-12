# Supply Chain Intelligence Architecture

## Scope and trust boundary

The `/insights` route is an explainable, deterministic anomaly-review
workspace. It uses no LLM, external AI provider, API key, or network service.
Signals and recommendations are generated from synthetic demonstration
records; they are not production alerts, food-safety decisions, or evidence of
real financial loss. This independent conceptual project is not affiliated
with Amul or GCMMF.

The principal modules are:

- `src/lib/intelligence/detection.ts`: source composition, rule evaluation,
  stable IDs, duplicate prevention, and unavailable-data warnings.
- `src/lib/intelligence/schema.ts`: Zod validation for configuration and
  generated anomaly records.
- `src/lib/intelligence/impact.ts`: unit exposure estimates and safe
  financial-exposure aggregation.
- `src/lib/intelligence/recommendations.ts`: deterministic, category-specific
  next actions.
- `src/lib/intelligence/explanations.ts`: structured evidence explanation
  contract and deterministic renderer. A future provider can implement
  `AnomalyExplanationProvider`; the application does not currently register or
  call one.
- `src/lib/intelligence/filters.ts`: pure search and category/severity/status
  filtering.
- `src/lib/intelligence/store.ts`: Zod-validated browser-local status and
  activity persistence. Detection results are always recalculated from source
  data and are not written to this store.
- `src/components/intelligence/`: `/insights` workspace and the compact
  Overview summary.

```text
synthetic demand ─────────┐
inventory + forecast ─────┤
batch events + inspections ├─> deterministic detectors
shipment fixtures ────────┘           │
                              impact estimates
                              recommendations
                              evidence-linked anomalies
                                  │             │
                             insights UI    overview summary
                                  │
                         local workflow state
                    (Open -> Acknowledged -> Resolved)
```

## Source data and coverage

| Input               | Source                                                                                | Detector use                                                    | Limitation                                                                   |
| ------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Demand              | 180 synthetic observations for each product/location in `src/data/demand.ts`          | Historical spike/drop and recorded forecast divergence          | Fixed reference date; no actual demand service                               |
| Inventory           | 42 generated product/location rows; calculated cover and reorder metrics              | Stockout, excess cover, expiry sell-through                     | No movement ledger, inventory lots, or live balance                          |
| Shipments           | Four static rows in `src/lib/mock-data.ts`                                            | Explicit `status === "delayed"` only                            | No delivery timestamps, ETA variance, item-to-batch link, or financial price |
| Batch events        | Per-batch locally persisted hash-chain records from the traceability module           | Consecutive event timestamp gaps                                | Synthetic history; a gap does not prove a missing physical event             |
| Quality inspections | Six synthetic records in `src/data/quality-inspections.ts` and the traceability store | Explicit review/failure, milk SNF, product-category temperature | Demonstration values and thresholds; not validated quality policy            |

Inventory movement detection is unavailable because there is no stock-movement
history. Delay duration and delayed-shipment revenue impact are unavailable
because planned and actual delivery timestamps and product prices are absent.
The engine reports these coverage gaps rather than fabricating observations.

## Rule definitions

All values below are configurable defaults in `defaultDetectionConfig`.
They are prototype thresholds, not operating standards.

| Category              | Detection rule                                                                                                              | Severity                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Demand spike          | For each product/location/day with 28 preceding valid observations, flag when actual demand is at least 1.24× their mean    | Medium; High at ≥50% above baseline                                                     |
| Demand drop           | Same 28-observation baseline; flag at or below 0.76× the mean                                                               | Medium; High at ≥50% below baseline                                                     |
| Forecast divergence   | `abs(actual − recorded prediction) / actual × 100` ≥8%; zero actual is not used as a percentage denominator                 | Medium; High at ≥20%                                                                    |
| Stockout risk         | `days cover = current stock / recorded daily demand`; flag at ≤3 days                                                       | Critical at ≤1 day; High at ≤2; otherwise Medium                                        |
| Excess inventory      | Flag when days of cover is >12 days                                                                                         | Medium; High above 21 days                                                              |
| Expiry risk           | Flag when expiry is ≤3 days away (or already passed), expiry occurs no later than stock sell-through, and stock is positive | High when expiry is ≤1 day and estimated quantity at risk is positive; otherwise Medium |
| Shipment delay        | Flag only a source record explicitly marked `delayed`                                                                       | High; delay duration is unknown                                                         |
| Batch event gap       | For adjacent valid timestamps within the same batch, flag when elapsed time is >24 hours                                    | Medium; Critical at ≥72 hours                                                           |
| Temperature excursion | Chilled milk >4°C; ice cream warmer than −18°C                                                                              | Medium; High when the reading is >2°C beyond the threshold                              |
| Quality concern       | Explicit status `review`/`failed`; or milk SNF below 8.3%                                                                   | Review = High, failed = Critical; SNF = Medium                                          |

The milk/ice-cream temperature limits and milk SNF value are synthetic
demonstration assumptions. They are not regulatory or product-release
guidance. Other product categories are not assigned a temperature threshold in
this phase.

Invalid or missing demand, inventory, shipment, event, or inspection
observations are skipped with a source-specific warning when detected.
Generated anomaly records and configurable thresholds are validated with Zod.
Stable IDs combine the rule and source record/product-location/date; a final
ID map suppresses duplicate findings.

## Impact estimates and assumptions

The UI separates observable values, calculated unit estimates, and financial
exposure:

- Demand spike: `max(0, actual − preceding 28-day average)` in the product's
  declared base unit (for example litres or kg) of potential incremental
  demand. This is not confirmed lost sales.
- Demand drop: `max(0, historical average − actual)` in the product's declared
  base unit of demand-plan variance, not confirmed unsold inventory.
- Forecast divergence: `abs(actual − recorded prediction)` in the product's
  declared base unit of planning error.
- Stockout: `max(0, daily demand − current stock)` in the product's declared
  base unit of potential one-day uncovered demand. A zero value means current
  stock still covers this one-day proxy even though the configured cover alert
  fired.
- Excess stock: `max(0, current stock − daily demand × 12)` in the product's
  declared base unit above the demonstration cover threshold; this is not a
  carrying cost.
- Expiry: `max(0, current stock − daily demand × max(days to expiry, 0))`
  in the product's declared base unit potentially unsold before expiry; this
  is not confirmed waste.
- Delayed shipment: all listed cases are treated as potentially affected. No
  delay duration or actual loss is inferred.
- Batch/quality/temperature: batch quantity is shown as a quantity requiring
  review, not as confirmed damaged volume.

The shared records contain no product prices. Every `estimatedFinancialExposure`
is therefore `null`, the summary returns `null`, and the UI explicitly says
“Unavailable.” Do not substitute market prices, list values, or arbitrary
currency estimates.

## Evidence strength and workflow

For quantitative demand rules, confidence is a transparent evidence-strength
score, not a calibrated probability:

```text
round(min(0.98,
  0.55
  + 0.25 × min(preceding sample count, 28) / 28
  + 0.18 × min(abs(relative deviation), 1)
), 2)
```

Fixed evidence scores are used for inventory (0.90/0.88), explicit shipment
status (0.90), batch timestamp gaps (0.82), temperature (0.78), and categorical
or quality readings (0.90). The UI maps ≥0.85 to Strong, ≥0.70 to Moderate,
and lower scores to Limited. These scores are heuristic and should not be
presented as statistical confidence or production model probabilities.

Each anomaly has a stable ID, category, severity, affected identifiers,
detection timestamp, rule ID, explanation, observed and expected values,
unit-impact estimate, null financial estimate, recommendation, evidence with
source record IDs, confidence/evidence strength, and an initial `Open` status.
`store.ts` persists only operator status and timestamped activity:

```text
Open -> Acknowledged -> Resolved
  └-----------------> Resolved
```

Status changes cannot edit the derived evidence or detection result. Local
storage is browser/device-specific; clearing it loses review history. There is
no identity, authorization, shared audit trail, or server synchronization.

Recommendations are deterministic prompts for human review: validate demand,
review the forecast, check suggested reorder, assess a safe inventory transfer,
apply first-expiry-first-out handling, investigate an explicitly delayed
shipment, verify a missing batch milestone, or request a qualified quality
review. The UI does not create purchase orders, release/hold stock, contact
carriers, or write new traceability events automatically.

## Future AI boundary and limitations

`AnomalyExplanationProvider` in `explanations.ts` defines a future structured
input/output seam. Detection, impact, and recommendation functions remain
independent. No provider is installed, configured, or invoked; deterministic
text must not be described as AI-generated. A future provider would require
approved data access, redaction, human review, prompt/version governance,
measurable evaluation, and explicit error handling.

The fixed demo date and data do not model changing live state. Detection
thresholds have not been tuned or validated against a labeled dataset.
Repeated demand rules can surface many events, and synthetic temporal patterns
may cause false positives. Local status data is not a durable audit record.
See [anomaly-evaluation.md](./anomaly-evaluation.md) for evaluation
definitions, scenarios, and a real-data validation plan.
