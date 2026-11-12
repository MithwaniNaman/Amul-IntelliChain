# Product requirements

## Product concept

Amul IntelliChain is an independent concept for dairy supply chain intelligence.
It is not affiliated with or endorsed by Amul. The starter application uses
simulated data only; it is not connected to a dairy operator, AI service, or
blockchain network.

## Initial users

- Supply chain operations teams reviewing procurement, inventory, and delivery
  health.
- Planners comparing expected demand with actual volumes.
- Quality and traceability teams following product batches through facilities.

## Prototype scope (implemented)

- Responsive Overview with simulated demand, calculated forecast/inventory
  indicators, regional risk, recent sample activity, and a compact operational
  intelligence summary.
- Interactive demand forecasting with product/location/history/horizon
  controls and explicit historical-vs-forecast series.
- Searchable/filterable inventory records with synthetic stock adjustments
  persisted only in the current browser.
- Batch registry and detail views with synthetic lifecycle events, QR routes,
  quality examples, and local SHA-256 event-chain verification.
- Deterministic, evidence-linked supply-chain anomaly rules with category and
  status filters, unit-based hypothetical impact, recommendations, and a
  locally persisted operator review lifecycle.
- Synthetic shipment registry/detail and focused demand/inventory analytics.
- Cross-module search, accessible responsive navigation, and a project
  disclosure page.
- Typed fixture data is separated from calculations and UI components.

## Out of scope

The prototype has no external AI model, shared blockchain, API, database,
authentication, live dairy/carrier/sensor feed, sales/revenue reporting, or
automated operational action. See
[product-strategy.md](./product-strategy.md) for proposed validation steps and
[final-project-handover.md](./final-project-handover.md) for verified delivery
status.

## Product principles

- Label all demonstration values as simulated.
- Keep operational recommendations reviewable; do not imply automated actions.
- Do not represent demo trace IDs as on-chain proofs.
- Keep the dashboard readable and usable on desktop and mobile layouts.
- Keep product-management hypotheses and proposed experiments distinct from
  customer research or measured outcomes.
