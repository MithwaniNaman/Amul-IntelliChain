# Changelog

Significant product changes are recorded here in reverse chronological order.

## Phases 5–6 — Product definition and portfolio readiness

- Added product strategy, metrics, experiment plan, decision log, and case
  study documents that distinguish hypotheses from validated findings.
- Completed the demo workflows across Overview, Forecasting, Inventory,
  Traceability, Intelligence, Monitoring, Analytics, and About; added
  cross-module search and clearly demonstrative notification/profile controls.
- Improved error/not-found disclosures, input validation, chart descriptions,
  keyboard focus restoration, contrast, and mobile layouts.
- Added Playwright end-to-end workflows, axe-core accessibility checks, and a
  GitHub Actions validation workflow. Browser coverage includes route console
  errors, filters, invalid input, persistence, mobile layouts, and the shipment
  empty/invalid-query states.
- Added deployment, interview-demo, screenshot-capture, and final handover
  documentation. Deployment and publication have not occurred.
- Final local checks: typecheck, lint, 25 unit tests, production build, 8
  browser tests, and targeted formatting passed. The full dependency audit
  reports 12 development-tree advisories; production dependencies report
  zero. See [final handover](./docs/final-project-handover.md) for details.

## Phase 1 — Initial scaffold

- Initial development environment setup and Next.js application scaffold
  confirmed complete by the project owner.

## Phase 2 — Demand forecasting and inventory intelligence

- Added a deterministic 180-day demand history for all six products and seven
  locations, plus shared product, location, inventory, and batch contracts.
- Implemented selectable moving-average forecasts, trend and weekday
  seasonality adjustments, rolling error metrics, and horizon-based confidence
  intervals.
- Added interactive forecasting and inventory workspaces with filters, sorting,
  record details, rule-based recommendations, and local stock-change
  persistence.
- Connected the overview KPIs, demand chart, regional risk view, batch status,
  activity feed, and operational insights to shared synthetic data and
  calculations.
- Added automated tests for dataset coverage, forecasting, inventory risk, and
  localStorage persistence.
- Statistical outputs and stock adjustments remain demonstration-only; no live
  AI service, operational data feed, or blockchain integration is connected.

## Project context and handover

- Added [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md), a codebase-audited
  handover covering current architecture, verified feature status, formulas,
  testing, Git/deployment state, product context, and the proposed roadmap.

## Phase 3 — Batch traceability demonstration

- Added synthetic batch lifecycle events, stable facility IDs, quality
  inspection records, and corrected the cheese batch's collection-centre role.
- Implemented per-batch canonical SHA-256 hash chains, verification, validated
  browser persistence, append-only event entry, and batch-history views.
- Replaced the traceability starter route with a searchable/filterable registry,
  batch detail timelines, integrity results, quality summaries, and event
  metadata inspection.
- Added QR previews linking to public-safe demonstration batch routes, plus
  copy-URL and SVG download actions.
- Documented that local hash-chain verification is not a blockchain or proof of
  physical-world truth. No blockchain, wallet, or chain dependencies added.

## Phase 4 — Explainable supply-chain intelligence

- Added a deterministic, Zod-validated anomaly engine for demand spikes/drops,
  forecast divergence, stockout/excess/expiry risk, explicit shipment delays,
  batch-event gaps, and synthetic quality/temperature concerns.
- Added unit-based impact estimates and category-specific operator
  recommendations. Financial exposure remains explicitly unavailable because
  the shared data contains no product prices.
- Replaced the `/insights` starter with a searchable and filterable intelligence
  workspace, category/severity distributions, anomaly evidence details, and
  acknowledge/resolve workflow persisted in browser localStorage.
- Added a compact Overview intelligence panel and removed copy that described
  deterministic rules as AI-generated output.
- Added deterministic unit tests and architecture/evaluation documentation.
  No AI provider or new dependency was introduced.
