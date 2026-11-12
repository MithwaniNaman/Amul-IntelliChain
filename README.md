# Amul IntelliChain

An independent concept for dairy supply chain intelligence and traceability.
This project is not affiliated with or endorsed by Amul. Operational figures,
locations, demand records, inventory, shipments, and traceability records are
simulated demonstration data.

## Run locally

Requirements: Node.js 22.x and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

For production-build browser workflows, install Playwright Chromium, build,
then run the browser suite:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

GitHub Actions runs typecheck, lint, unit tests, build, and the Chromium
end-to-end suite on pushes to `main` and pull requests.

The latest local validation passed typecheck, lint, 25 unit tests, production
build, and 8 Playwright tests. It ran on Node.js 26.13.1; the configured Node.js
22.x CI job has not yet been observed in a hosted run. `npm audit` reports 12
development-tree findings (2 low, 10 moderate); `npm audit --omit=dev` reports
zero production advisories. See the [final handover](./docs/final-project-handover.md)
for exact results and limitations.

## Product features

- **Overview:** calculated demand, rolling forecast accuracy, stock-health risk,
  low-stock alerts, sample batch status, regional inventory risk, and
  rule-based operational insights.
- **Demand Forecasting (`/forecasting`):** choose a product, location, 7/14/30
  day horizon, moving-average method, and 30/90/180 day history. The chart and
  metrics update with each selection and show historical values separately
  from forecasts and uncertainty intervals.
- **Inventory Intelligence (`/inventory`):** search and filter the 42
  product-location records, sort by key columns, inspect a detail panel, and
  adjust stock. Changes and their activity entries persist in this browser's
  localStorage.
- **Supply Chain Intelligence (`/insights`):** deterministic demand, stock,
  expiry, shipment, batch-event, and quality rules with source-linked evidence,
  unit-based potential impact estimates, recommendations, filters, and a
  local acknowledge/resolve workflow. The output is rule-based, not
  AI-generated.
- **Supply Chain Monitoring (`/monitoring`):** synthetic shipment registry and
  selected-record details for anomaly investigation; no live carrier, GPS, or
  sensor feed.
- **Product Analytics (`/analytics`):** same-unit milk demand trends and
  persisted synthetic inventory summaries; no sales or revenue metrics.
- **Cross-module search:** keyboard-accessible command palette for products,
  locations, batches, inventory, shipments, and workspaces.
- **Batch Traceability (`/traceability`):** browse six synthetic batches,
  filter their lifecycle and quality state, inspect per-batch event histories,
  append simulated events, and verify locally persisted SHA-256 hash chains.
  Batch detail routes support QR preview, URL copy, and SVG QR download.
- **About (`/about`):** independent-project, simulated-data, persistence, and
  integration disclosures.

## Shared synthetic dataset

`src/types/index.ts` defines the product, location, demand, inventory, and batch
contracts. Records are maintained in `src/data/`; demand generation creates 180
daily observations for each of six products across seven locations (7,560
observations total). The deterministic series includes gradual trends, weekly
seasonality, periodic variation, and occasional spikes. Its reference date is
fixed at 2026-11-12 so every metric is repeatable.

## Forecasting methodology

The reusable engine in `src/lib/forecasting/engine.ts` aggregates selected
historical records and supports simple and linearly weighted moving averages.
It calculates recent trend, applies a bounded weekday-seasonality factor, and
backtests one-day estimates against the trailing observations. Forecast
accuracy is `100 - MAPE` (floored at zero); MAE includes all observations, while
MAPE excludes zero actuals and is unavailable if every actual is zero.
Confidence intervals use the rolling backtest RMSE and widen with the forecast
horizon. These transparent statistical calculations are not LLM predictions.

## Inventory calculations

Days of cover is current stock divided by recent average daily demand. Health
uses the calculated cover, reorder level, and expiry timing: less than one day
is critical; up to three days or at/below reorder level is low stock; inventory
expected to expire within three days before it is sold is an expiry risk.
Suggested replenishment is the non-negative difference between current stock
and the larger of twice the reorder level or the selected seven-day forecast
total. These are demo planning rules, not production policies.

Stock adjustments are saved only in the current browser's localStorage. There
is no backend synchronization, live inventory feed, connected AI service, or
deployed blockchain.

## Operational intelligence

The rules in `src/lib/intelligence/` compare demand with its preceding
28-observation baseline, detect forecast error, evaluate stock cover/excess and
expiry, inspect explicit delayed-shipment status, check gaps between recorded
batch events, and review synthetic quality/temperature readings. Thresholds,
evidence-confidence scoring, unit impact formulas, known unavailable
observations, and limitations are documented in
[docs/intelligence-architecture.md](./docs/intelligence-architecture.md).
The evaluation scenarios and future precision/recall plan are in
[docs/anomaly-evaluation.md](./docs/anomaly-evaluation.md).

Potential unit exposure is a planning estimate, not observed loss. No product
prices are present, so financial exposure is shown as unavailable rather than
invented. Inventory movement anomalies and shipment delay duration are also
unavailable because the source data has no stock-movement ledger or planned /
actual delivery timestamps. Temperature limits are demonstration thresholds,
not food-safety guidance.

## Known limitations and next milestone

- All results are deterministic synthetic data; they must not be used for
  actual procurement, inventory, logistics, or quality decisions.
- The statistical model and confidence interval are intentionally simple and
  are not calibrated against real operational history.
- Local stock changes are device/browser-specific and can be cleared with
  browser storage; there is no authentication or shared audit backend.
- Blockchain contracts are not implemented. The Phase 3 traceability module
  adds a local hash-chain demonstration only; it is not a blockchain, does not
  prove physical events, and stores demo records in browser localStorage. See
  [docs/traceability-architecture.md](./docs/traceability-architecture.md) for
  the data and integrity limitations.
- Phase 4 adds a rule-based operational intelligence workspace without an
  external AI model. Product analytics and monitoring are illustrative views
  of existing synthetic records, not production reporting or live tracking.
- Product strategy and experiment documents are proposals, not evidence of
  completed user research or experiments.

## Project and delivery documentation

- [Product case study](./docs/portfolio-case-study.md)
- [Product strategy](./docs/product-strategy.md), [metrics](./docs/product-metrics.md),
  [experimentation plan](./docs/experimentation-plan.md), and
  [decision log](./docs/product-decisions.md) (proposed; no research results
  are claimed)
- [Architecture](./docs/architecture.md),
  [intelligence rules](./docs/intelligence-architecture.md), and
  [anomaly evaluation plan](./docs/anomaly-evaluation.md)
- [Deployment guide](./docs/deployment-guide.md) and
  [3–5 minute demo script](./docs/demo-script.md)
- [Project handover](./docs/final-project-handover.md) and
  [development activity log](./docs/ACTIVITY_LOG.md)
- [Screenshot capture checklist](./docs/screenshots/README.md); no fabricated
  screenshots are included

Suggested repository description: “Independent dairy supply-chain
intelligence concept with explainable anomalies, synthetic forecasting, local
inventory workflows, and batch traceability.” Suggested topics:
`nextjs`, `typescript`, `supply-chain`, `dairy`, `forecasting`,
`anomaly-detection`, `product-management`, `portfolio-project`.
