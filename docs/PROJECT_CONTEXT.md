# Amul IntelliChain — Project Context and Handover

**Audit date:** 2026-11-12
**Repository branch:** `main`
**Current milestone:** Phases 1–6 have a synthetic, local portfolio prototype;
deployment and customer/data integrations remain unapproved and unimplemented.

This is a repository-grounded handover for a future engineer or AI assistant.
Statements about the product vision and development environment that are not
provable from code are identified as owner-confirmed or proposed. This document
does not imply that any connected operational system, AI model, or blockchain
exists.

## 1. Project overview

### Product vision

- **Name:** Amul IntelliChain.
- **Vision:** An independent dairy supply-chain intelligence and traceability
  concept exploring a shared review view for demand, inventory, logistics, and
  batch provenance. Current anomaly output is deterministic rules, not AI; the
  traceability ledger is local SHA-256, not a blockchain.
- **Business problem hypothesis:** Dairy products are perishable, demand and
  supply vary by product and region, and supply-chain handoffs need visibility.
  Better forecasting, replenishment signals, and trustworthy batch histories
  could help reduce stockouts, waste, and provenance gaps. This problem
  statement is a product hypothesis, not a finding from documented customer
  research.
- **Provisional target users:** Supply-chain operations teams; demand and
  replenishment planners; quality, compliance, and traceability teams. These
  segments are named in [product-requirements.md](./product-requirements.md),
  but formal personas and user validation are not present.
- **Core value proposition hypothesis:** Bring planning signals and batch
  history into one explainable workflow, with human-reviewed recommendations.
- **Intended use:** Independent product-innovation and portfolio demonstration.
  The current application is not suitable for operational decision-making.
- **Affiliation:** This is an independent conceptual project. It is not
  officially affiliated with, endorsed by, or operated by Amul or GCMMF. It
  does not use the official Amul logo.

### What is real versus simulated

There are no production or partner datasets. The following are synthetic,
fixed-date demonstration data:

- Six dairy product records and seven city/location records.
- 7,560 generated demand observations: 180 dates for each of 6 products × 7
  locations. Dates end on **2026-11-12**.
- Forty-two derived product/location inventory records with generated stock,
  demand, expiry, and reorder values.
- Six sample supply-chain batches with lifecycle status strings.
- Four sample shipments and five prewritten operational activity events in
  `src/lib/mock-data.ts`.
- Overview KPIs, forecast estimates, inventory risk, alerts, regional summaries,
  insights, and recommendations are calculated from the synthetic records or
  hard-coded demo rules; they are not actual business performance.
- A stock adjustment made in the UI is user-entered demo data persisted only in
  that browser's localStorage. It is not sent to an API or a shared database.

No live dairy network, procurement feed, inventory service, carrier/GPS/IoT
feed, identity system, AI provider, database, or real blockchain is connected.
Phase 3 adds only a local browser hash-chain demonstration. Phase 4 derives
rule-based anomalies from the synthetic records and persists only workflow
status locally. There are no synthetic unit prices; financial exposure is
unavailable, not zero or an actual loss.

## 2. Development history

### Phase 1 — Environment and initial scaffold

- The owner confirmed completion of initial environment setup and application
  scaffold in the project initiation section of
  [ACTIVITY_LOG.md](./ACTIVITY_LOG.md). That record identifies macOS Apple
  Silicon, VS Code, and GitHub Copilot Agent.
- The owner-confirmed foundation is Next.js, TypeScript, and Tailwind CSS. The
  present source additionally shows App Router, React, the shadcn component
  conventions, and the shared navigation/dashboard shell.
- Existing source contains a responsive sidebar/topbar shell, seven module
  routes, and an initial executive overview/dashboard foundation. The Overview
  has since been refactored in Phase 2; its current KPIs and panels should not
  be mistaken for the original static scaffold.
- Historical activity documentation does **not** record the original install
  commands, exact Phase 1 package versions, or a full Phase 1 file-by-file
  change list. Do not reconstruct or invent them. Current installed versions
  are listed in section 3 and are not proof of what was installed in Phase 1.

### Phase 2 — Shared data, forecasting, and inventory

- Added the shared product, location, demand, inventory, and batch TypeScript
  contracts in `src/types/index.ts` and fixtures/generation in `src/data/`.
- Created deterministic, 180-day demand history with gradual trend, weekly
  factors, periodic variation, deterministic noise, and occasional spikes.
- Implemented the reusable statistical engine in
  `src/lib/forecasting/engine.ts`: date/product/location aggregation, simple
  and weighted moving averages, trend and weekday factors, rolling backtest,
  MAE/MAPE/accuracy, and horizon-scaled error intervals.
- Implemented inventory health, days-of-cover, expiry and stockout rules, and a
  forecast-based replenishment quantity in `src/lib/inventory.ts`.
- Added interactive `/forecasting` and `/inventory` client workspaces. Inventory
  filters, sorting, a detail sheet, stock adjustment, local persistence, and
  local activity logging are present.
- Connected the Overview to computed synthetic demand, forecast accuracy,
  inventory risk, low-stock count, regional risk, batch status, and rule-based
  operational insights.
- Added four test files using Node's built-in test runner and `tsx`.
- Early integration typechecks exposed stale dashboard mock-data imports, a
  missing shared insight type, an inventory-metric type import error, and a
  duplicate declaration; those were corrected before the passing final checks.
- The owner confirmed Phases 1 and 2 as complete. The Phase 2 session record is
  in [ACTIVITY_LOG.md](./ACTIVITY_LOG.md); notable product changes are in
  [CHANGELOG.md](../CHANGELOG.md).

### Phase 3 — Batch traceability demonstration

- Extended the six existing batches with stable facility IDs and corrected
  the cheese batch's collection-centre role.
- Added synthetic batch events and quality inspections; implemented
  deterministic canonical serialization, Web Crypto SHA-256 per-batch chains,
  verification, Zod-validated local persistence, event append, and reset.
- Replaced the Traceability placeholder with a searchable/filterable registry,
  batch detail routes, lifecycle timeline, event ledger, quality summary,
  integrity checks, QR preview/copy/SVG-download, and activity-feed logging.
- No dependencies were installed; the existing `qrcode.react` package is now
  used. This is not a blockchain and has no external trust anchor.

### Phase 4 — Explainable supply-chain intelligence

- Added `src/lib/intelligence/` with typed/Zod-validated anomaly records,
  deterministic demand, inventory, shipment, batch-event, and quality rules,
  unit impact estimation, recommendations, filtering, and a future explanation
  provider interface. No external model is connected.
- Replaced the `/insights` placeholder with search and category/severity/status
  filters, anomaly distributions, source-linked evidence, impact assumptions,
  recommended actions, and `Open → Acknowledged → Resolved` controls.
- Persists only anomaly status and timestamped workflow activity in a separate
  browser-local Zod-validated store; detection/evidence remain derived from
  source records. Added a concise Overview intelligence panel using the same
  analysis and persisted statuses.
- Current synthetic run yielded 146 alerts: 109 demand spikes, 9 excess-stock,
  15 expiry-risk, 8 stockout, 1 explicitly delayed shipment, 2 temperature,
  and 2 quality concerns. The dataset does not trigger drop, forecast-error,
  or batch-gap rules; focused tests exercise those rules.
- The engine intentionally marks inventory movement and shipment-delay
  duration as unavailable because no movement ledger or planned/actual
  delivery timestamps exist. Financial exposure is unavailable because
  product prices are absent. Demonstration temperature and SNF limits are not
  operational specifications.
- Added `docs/intelligence-architecture.md` and
  `docs/anomaly-evaluation.md`; updated README and changelog. No dependencies
  were added or removed.

### Phases 5–6 — Product documentation and portfolio readiness

- Added provisional product strategy, metrics, experiment, decision, and
  case-study documents. They explicitly describe hypotheses and proposed
  evaluation; no discovery or experiment results are claimed.
- Made Overview inventory/risk reflect local stock changes; added synthetic
  Monitoring and same-unit Analytics views, cross-module search, About
  disclosures, and demonstrative notification/profile menus.
- Added global error/not-found states, hardened invalid batch handling,
  corrected QR dialog focus restoration, and gave charts accessible
  descriptions. Updated low-contrast labels and disabled button styling after
  automated WCAG checks surfaced issues.
- Added Playwright/axe-core browser tests, CI workflow, deployment guide, demo
  script, screenshot checklist, and final handover. No deployment, commit, or
  publication occurred.

### Current audit verification

Commands were run in this audit on the current checkout:

| Check                   | Result                                                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                | Passed; 662 packages added, 669 audited. npm reported 12 advisories and install-script allowlist warnings.                                                                                |
| `npm run typecheck`     | Passed.                                                                                                                                                                                   |
| `npm run lint`          | Passed.                                                                                                                                                                                   |
| `npm run test`          | Passed: 25 tests, 0 failures.                                                                                                                                                             |
| `npm run build`         | Passed on Next.js 16.4.6; 18 pages generated, including partially prerendered query-dependent routes.                                                                                     |
| `npm run test:e2e`      | Passed: 8 Playwright tests. Covers nine routes without browser console errors, inventory filters, record/workflow navigation, reload persistence, invalid stock input, and 390px layouts. |
| Axe accessibility scans | No WCAG 2.1 A/AA violations on the nine core routes and tested Dialog/Sheet states.                                                                                                       |
| Targeted Prettier check | Passed for changed code, config, and documentation.                                                                                                                                       |
| `npm audit`             | 12 development-tree findings: 2 low and 10 moderate.                                                                                                                                      |
| `npm audit --omit=dev`  | Passed: 0 production advisories.                                                                                                                                                          |

`npm audit fix --dry-run` showed no non-breaking remediation for the reported
advisories; npm proposes a breaking `shadcn@1.0.0` upgrade with
`--force`, which was not applied. The final validation ran on Node.js 26.13.1
and npm 11.20.0. CI is configured for Node.js 22.x but has not yet been
observed in a hosted run. Exact commands and caveats are recorded in
[final-project-handover.md](./final-project-handover.md).

## 3. Current technology stack

### Runtime and configuration

- **Runtime observed locally:** Node.js `v26.13.1`; npm `11.20.0`. CI and
  documented reproducible setup use Node.js 22.x.
- **Package manager:** npm, with `package-lock.json` (lockfile version 3);
  project package version is `0.1.0`.
- **Framework:** Next.js `16.4.6`; React and React DOM `19.3.1`.
- **TypeScript:** `6.0.3`; `tsconfig.json` enables `strict`, `noEmit`, isolated
  modules, the `react-jsx` transform, bundler module resolution, and
  `@/*` → `src/*`.
- **Type target:** ES2017, with DOM and `esnext` libraries.
- **Next configuration:** `next.config.ts` enables Cache Components and
  Partial Prefetching, and configures the Tailwind Turbopack CSS loader.
- **CSS:** Tailwind CSS `4.3.5`, loaded in `src/app/globals.css`; project theme
  tokens define brand red, blue, green, light neutral backgrounds, and chart
  colors.
- **Component conventions:** shadcn/ui CLI package `4.23.0`, configured by
  `components.json` (`radix-nova`, RSC, Lucide). Generated/reusable primitives
  are in `src/components/ui/`.
- **Lint/format:** ESLint `9.39.5` with `eslint-config-next` `16.4.6`;
  Prettier `3.10.1` with `prettier-plugin-tailwindcss` `0.8.1`.
- `package.json` does not declare environment variables or an `engines` range.
  `.env.example` contains comments only; `src/` contains no `process.env`,
  `NEXT_PUBLIC_*`, or fetch-based service integration.

### Installed top-level packages

The versions below are the installed versions reported by `npm ls --depth=0`
during this audit; `package.json` uses compatible semver ranges for most
packages.

| Group                 | Installed packages                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application           | `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`                                                                                                                                                                                                           |
| UI and styles         | `radix-ui@1.8.1`, `class-variance-authority@0.7.1`, `clsx@2.1.1`, `cn@0.5.2`, `cmdk@1.1.1`, `lucide-react@1.72.0`, `next-themes@0.4.6`, `sonner@2.0.8`, `tailwind-merge@3.7.0`, `tailwindcss@4.3.5`, `tw-animate-css@1.4.0`, `@tailwindcss/turbopack@4.3.5` |
| Charts/data utilities | `recharts@3.10.1`, `date-fns@4.4.0`, `zod@4.6.7`                                                                                                                                                                                                            |
| Installed utilities   | `@tanstack/react-table@9.3.1`, `qrcode.react@4.2.0`                                                                                                                                                                                                         |
| TypeScript/test       | `typescript@6.0.3`, `tsx@4.23.15`, `@types/node@26.6.6`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`                                                                                                                                                   |
| Developer tooling     | `eslint@9.39.5`, `eslint-config-next@16.4.6`, `prettier@3.10.1`, `prettier-plugin-tailwindcss@0.8.1`, `shadcn@4.23.0`                                                                                                                                       |

### Actually used versus merely installed

- **Used by current routes/runtime:** Next.js, React, React DOM, Tailwind,
  `radix-ui`, `class-variance-authority`, `cn`, Lucide, Recharts, date-fns,
  Zod, Sonner, and `cmdk` (cross-module search). `next-themes` is used by the
  Sonner wrapper.
- **Installed but not directly used by current feature code:** TanStack React
  Table (the inventory screen uses a native HTML table), `clsx`, and
  `tailwind-merge` (neither is directly imported from `src/`; the `cn` helper
  package is imported instead). Their continued need should be reviewed.
- **Used:** `qrcode.react` renders batch QR previews and supports SVG download
  and URL copy in the traceability registry.
- **Planned but not installed:** Solidity compiler/Hardhat or other chain
  tooling; an AI SDK/provider; database/ORM, API, authentication, and
  production integration clients.
- **Testing:** Node's built-in `node:test`/`node:assert/strict` through `tsx`;
  Playwright production-build tests use `@playwright/test`, with
  `@axe-core/playwright` for WCAG 2.1 A/AA automated checks. No Vitest or Jest
  is installed.

### npm scripts

`npm run dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`,
`format`, and `format:check` are defined in `package.json`. The E2E command
requires a production build; repository-wide `format` can touch unrelated
files, so use targeted Prettier commands and review the diff.

## 4. Current project structure

```text
.
├── AGENTS.md
├── CHANGELOG.md
├── README.md
├── components.json
├── e2e/
│   └── portfolio.spec.ts
├── playwright.config.ts
├── docs/
│   ├── ACTIVITY_LOG.md
│   ├── anomaly-evaluation.md
│   ├── deployment-guide.md
│   ├── demo-script.md
│   ├── experimentation-plan.md
│   ├── final-project-handover.md
│   ├── intelligence-architecture.md
│   ├── portfolio-case-study.md
│   ├── PROJECT_CONTEXT.md
│   ├── product-decisions.md
│   ├── product-metrics.md
│   ├── product-strategy.md
│   ├── traceability-architecture.md
│   ├── architecture.md
│   ├── product-requirements.md
│   └── product-roadmap.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── .github/workflows/ci.yml
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   ├── window.svg
│   └── images/.gitkeep
├── src/
│   ├── app/
│   │   ├── about/page.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── analytics/page.tsx
│   │   ├── forecasting/page.tsx
│   │   ├── insights/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── monitoring/page.tsx
│   │   ├── traceability/
│   │   │   ├── [batchId]/page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── analytics/
│   │   ├── dashboard/
│   │   ├── forecasting/
│   │   ├── intelligence/
│   │   ├── inventory/
│   │   ├── traceability/
│   │   │   ├── add-event-dialog.tsx
│   │   │   ├── batch-detail-workspace.tsx
│   │   │   └── traceability-workspace.tsx
│   │   ├── layout/
│   │   ├── monitoring/
│   │   └── ui/
│   ├── data/
│   │   ├── batches.ts
│   │   ├── demand.ts
│   │   ├── demand.test.ts
│   │   ├── inventory.ts
│   │   ├── quality-inspections.ts
│   │   ├── locations.ts
│   │   └── products.ts
│   ├── lib/
│   │   ├── intelligence/
│   │   │   ├── detection.ts
│   │   │   ├── explanations.ts
│   │   │   ├── filters.ts
│   │   │   ├── impact.ts
│   │   │   ├── index.ts
│   │   │   ├── intelligence.test.ts
│   │   │   ├── recommendations.ts
│   │   │   ├── schema.ts
│   │   │   └── store.ts
│   │   ├── traceability/
│   │   │   ├── demo.ts
│   │   │   ├── engine.ts
│   │   │   ├── engine.test.ts
│   │   │   ├── hash.ts
│   │   │   ├── store.ts
│   │   │   └── store.test.ts
│   │   ├── forecasting/engine.ts
│   │   ├── forecasting/engine.test.ts
│   │   ├── calculations.ts
│   │   ├── dashboard-data.ts
│   │   ├── inventory.ts
│   │   ├── inventory.test.ts
│   │   ├── mock-data.ts
│   │   ├── utils.ts
│   │   ├── workspace-store.ts
│   │   └── workspace-store.test.ts
│   └── types/index.ts
├── tsconfig.json
└── .env.example
```

`.gitignore`, `.prettierrc.json`, and the generated `next-env.d.ts` also exist.
`node_modules/` and `.next/` are local generated/ignored content and are not
part of the source tree. No `contracts/`, `scripts/`, `src/hooks/`, database,
or production API exists. `.github/workflows/ci.yml` runs validation.

### Responsibilities and important files

- [`src/app/`](../src/app/): App Router entry points. `layout.tsx` sets metadata,
  global CSS, shared shell, TooltipProvider, and Sonner toaster. `page.tsx` is
  Overview; child route folders provide the module and About pages. The error
  and not-found files provide route-level recovery states.
- [`src/components/layout/`](../src/components/layout/): `app-shell.tsx`
  composes sidebar/topbar; `sidebar.tsx` provides route links and responsive
  navigation links; `workspace-search.tsx` provides cross-module search;
  `topbar.tsx` presents the route title, date, mobile menu, search, explicitly
  demonstrative notification/profile controls.
- [`src/components/analytics/`](../src/components/analytics/) and
  [`src/components/monitoring/`](../src/components/monitoring/) render focused
  synthetic demand/inventory and shipment registry views.
- [`src/components/dashboard/`](../src/components/dashboard/): Overview
  presentation components for KPI cards, Recharts demand, supply-chain stage
  summary, regional inventory risk, activity, calculated insights, and the
  compact intelligence overview.
- [`src/components/intelligence/`](../src/components/intelligence/):
  `/insights` workspace, search/filter UI, anomaly evidence Sheet, workflow
  controls, and Overview summary component.
- [`src/components/forecasting/forecast-workspace.tsx`](../src/components/forecasting/forecast-workspace.tsx):
  client-side selectors, computed KPI display, chart, insights, and recommendation.
- [`src/components/inventory/inventory-workspace.tsx`](../src/components/inventory/inventory-workspace.tsx):
  client-side filters/sorting, table, detail Sheet, and local stock update.
- [`src/components/ui/`](../src/components/ui/): shadcn/Radix-style UI
  primitives. Some (Command, Dialog, Tabs, Table, QR-related capabilities) are
  not used in the Phase 2 workflows.
- [`src/data/`](../src/data/): product/location/batch fixtures, generated
  demand history, and inventory generated from that history.
- [`src/types/index.ts`](../src/types/index.ts): shared contracts for domain
  records, forecasts, regional summaries, and activity.
- [`src/lib/forecasting/engine.ts`](../src/lib/forecasting/engine.ts): pure
  statistical calculations and pattern insights.
- [`src/lib/inventory.ts`](../src/lib/inventory.ts): stock health, cover,
  expiry, stockout, reorder, and risk percentage functions.
- [`src/lib/dashboard-data.ts`](../src/lib/dashboard-data.ts): composes source
  records into forecast, inventory, regional, and operational-insight data for
  pages/widgets.
- [`src/lib/workspace-store.ts`](../src/lib/workspace-store.ts): Zod-validated
  localStorage snapshot, updates, reset-on-error action, and subscriber support.
- [`src/lib/mock-data.ts`](../src/lib/mock-data.ts): remaining static shipment
  and recent activity examples; these are not part of the central demand or
  inventory generator.
- [`src/lib/traceability/`](../src/lib/traceability/): canonical SHA-256
  payload hashing, seed-ledger generation, verification, validated local
  persistence, event append, and focused tests.
- [`src/components/traceability/`](../src/components/traceability/): searchable
  batch registry, event/quality entry dialog, QR preview, and detail timeline
  and hash-ledger workspaces.
- [`src/data/quality-inspections.ts`](../src/data/quality-inspections.ts):
  synthetic inspection values linked to the six seed batches.
- [`src/lib/intelligence/`](../src/lib/intelligence/): deterministic anomaly
  detection, impact/recommendations, evidence explanation interface, Zod
  schemas, pure filtering, local workflow persistence, summaries, and focused
  Node tests.
- [`docs/intelligence-architecture.md`](./intelligence-architecture.md) and
  [`docs/anomaly-evaluation.md`](./anomaly-evaluation.md): rule definitions,
  assumptions, source coverage, evaluation scenarios, and future validation.
- [`src/lib/calculations.ts`](../src/lib/calculations.ts): legacy helper
  wrappers for accuracy/days-of-cover/risk. Current pages primarily call the
  dedicated forecasting and inventory modules; these wrappers have no direct
  consumer in `src/` at audit time.
- [`public/`](../public/): stock Next.js SVG assets and an empty images
  placeholder. No brand logo or product imagery is present.
- [`docs/`](./): product requirements, roadmap, architecture, development log,
  and this handover. The older architecture, requirements, and roadmap docs
  predate Phase 2 and need a later refresh to avoid conflicting descriptions.

Before changing framework code, read [`AGENTS.md`](../AGENTS.md). It directs
agents to consult the installed Next.js 16 local documentation at
`node_modules/next/dist/docs/` for the relevant APIs before editing.

## 5. Feature implementation matrix

`COMPLETE` means implemented at the current synthetic-demo scope, not
production-ready. `PARTIALLY COMPLETE` means a limited implementation exists.
`PLACEHOLDER` means a route or UX shell exists without the underlying workflow.
`NOT STARTED` means no feature implementation exists. `NEEDS VERIFICATION` is
reserved for code that exists but has not been verified; none of the major
Phase 2 paths below are in that category.

| Feature                                                    | Status             | Implementation location                                                                                  | Description                                                                                                             | Outstanding work                                                                                                                                       |
| ---------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application: route navigation                              | COMPLETE           | `src/components/layout/sidebar.tsx`; `src/app/*/page.tsx`                                                | Seven module links plus About; route/search/deep-link flows are covered by Playwright.                                  | Unknown dynamic batch renders the not-found UI after streaming; HTTP status may be 200.                                                                |
| Application: sidebar                                       | COMPLETE           | `src/components/layout/sidebar.tsx`; `topbar.tsx`                                                        | Desktop sidebar, active route state, mobile Sheet menu, visible keyboard focus.                                         | Manual testing is limited to Chromium and common demo workflows.                                                                                       |
| Application: topbar                                        | COMPLETE           | `src/components/layout/topbar.tsx`; `workspace-search.tsx`                                               | Cross-module command palette; notifications/profile clearly disclose demo-only behavior.                                | No real notification service, account, or settings.                                                                                                    |
| Application: responsive shell                              | COMPLETE           | `src/components/layout/app-shell.tsx`; `sidebar.tsx`; `topbar.tsx`                                       | Production browser checks at 390px cover all core routes; mobile navigation and Axe checks pass.                        | No comprehensive device/browser or accessibility certification.                                                                                        |
| Application: Overview dashboard                            | COMPLETE           | `src/app/page.tsx`; `src/components/dashboard/`; `src/components/intelligence/intelligence-overview.tsx` | Synthetic KPIs, chart, stage, regional risk, activity, insights, anomaly summary; inventory values reflect saved edits. | No live feeds or verified business outcomes; local workflow status is browser-specific.                                                                |
| Data: synthetic dataset                                    | COMPLETE           | `src/data/`                                                                                              | Central fixed-date demo data; demand coverage is tested.                                                                | Replace only after agreed data contracts and authorized source; maintain demo labels meanwhile.                                                        |
| Data: products                                             | COMPLETE           | `src/data/products.ts`                                                                                   | Six records: Full Cream Milk, Toned Milk, Butter, Cheese, Ice Cream, Ghee.                                              | Confirm units/category rules with real operators before production.                                                                                    |
| Data: locations                                            | COMPLETE           | `src/data/locations.ts`                                                                                  | Seven locations: Anand, Ahmedabad, Vadodara, Surat, Rajkot, Mumbai, Delhi, with state and type.                         | Facility registry and roles are synthetic; validate referential semantics.                                                                             |
| Data: demand history                                       | COMPLETE           | `src/data/demand.ts`; `src/data/demand.test.ts`                                                          | 180 daily records for every product/location pair (7,560 total).                                                        | Fixed reference date; no ingestion, missing-data, or real forecast validation.                                                                         |
| Data: inventory                                            | COMPLETE           | `src/data/inventory.ts`                                                                                  | 42 deterministic inventory records derived from the last 14 daily demand observations and seed formulas.                | Inventory values and expiry are synthetic; no stock movement ledger.                                                                                   |
| Data: batches                                              | PARTIALLY COMPLETE | `src/data/batches.ts`; `src/types/index.ts`                                                              | Six sample batch records and statuses.                                                                                  | No event history or reference validation; at least one sample `collectionCentre` is a distribution hub, so location-role consistency needs correction. |
| Data: shared TypeScript contracts                          | COMPLETE           | `src/types/index.ts`                                                                                     | Product, location, demand, inventory, batch, forecast, shipment, activity, and anomaly interfaces/unions.               | Add API boundary and foreign-key validation if real service integrations are approved.                                                                 |
| Forecast: moving average                                   | COMPLETE           | `src/lib/forecasting/engine.ts`                                                                          | Mean of up to the latest 14 history values.                                                                             | Validate model choice against seasonal-naive and real baselines.                                                                                       |
| Forecast: weighted moving average                          | COMPLETE           | `src/lib/forecasting/engine.ts`                                                                          | Linear weights increase from oldest (1) to newest (n) within the 14-day window.                                         | Calibrate window/weights on out-of-sample data.                                                                                                        |
| Forecast: demand trend                                     | COMPLETE           | `src/lib/forecasting/engine.ts`                                                                          | Compares recent and preceding periods up to 14 days each.                                                               | Trend is capped for forecast use; add bias and horizon validation.                                                                                     |
| Forecast: weekly seasonality                               | COMPLETE           | `src/lib/forecasting/engine.ts`                                                                          | Same-weekday average over up to eight matches relative to trailing 56-day mean, clamped to 0.8–1.2.                     | Simple heuristic; no confidence or holiday/region-specific calendar.                                                                                   |
| Forecast: confidence interval                              | PARTIALLY COMPLETE | `src/lib/forecasting/engine.ts`; Recharts workspaces                                                     | Uses rolling one-step RMSE × 1.96 × √(step/7), lower bound floored at zero.                                             | Not a calibrated 95% interval; assess coverage/residual assumptions before communicating statistically.                                                |
| Forecast: MAE                                              | COMPLETE           | `src/lib/forecasting/engine.ts`                                                                          | Mean absolute backtest error across evaluated points.                                                                   | State backtest period and units in all reporting; validate with production history.                                                                    |
| Forecast: MAPE/accuracy                                    | COMPLETE           | `src/lib/forecasting/engine.ts`                                                                          | MAPE skips zero actuals; `null` if all actuals are zero. Accuracy is `max(0, 100 − MAPE)`.                              | No WAPE/weighted metric; small values can make MAPE unstable.                                                                                          |
| Forecast: product/location/horizon/method/history controls | COMPLETE           | `src/components/forecasting/forecast-workspace.tsx`                                                      | Controls update forecast output; horizon 7/14/30, history 30/90/180.                                                    | Controls are not in URL or persisted; no scenario comparison/export.                                                                                   |
| Forecast: dynamic visualization                            | COMPLETE           | `src/components/forecasting/forecast-workspace.tsx`; `src/components/dashboard/demand-chart.tsx`         | Actuals, historical estimates, future forecast, and uncertainty area are rendered from selected records.                | Add automated rendering tests and richer accessible chart description.                                                                                 |
| Forecast: demand recommendations                           | COMPLETE           | `forecast-workspace.tsx`; `src/lib/dashboard-data.ts`                                                    | Rule-based recommendation follows calculated growth direction; Overview insight uses selected default forecast.         | Not AI-generated; advice is not operationally validated or actioned.                                                                                   |
| Inventory: stock and cover calculations                    | COMPLETE           | `src/lib/inventory.ts`                                                                                   | Cover is stock ÷ daily demand; forecast average/total supports detail/reorder.                                          | Define edge policies with users for zero/negative/unknown demand and units.                                                                            |
| Inventory: reorder threshold                               | COMPLETE           | `src/data/inventory.ts`; `src/lib/inventory.ts`                                                          | Seed reorder level is 3× recent average demand; used for health and reorder target.                                     | The factor is an arbitrary demo policy, not a configured business rule.                                                                                |
| Inventory: stockout risk                                   | COMPLETE           | `src/lib/inventory.ts`                                                                                   | High if cover <1 day; medium if ≤3 days; otherwise low.                                                                 | Thresholds need calibration and real lead-time/safety-stock input.                                                                                     |
| Inventory: expiry risk                                     | PARTIALLY COMPLETE | `src/lib/inventory.ts`                                                                                   | Marks expiry risk when expiry is before expected sell-through and within 3 days; precedence is ahead of low/critical.   | Simplified single expiry date; no lot-level FEFO, shrinkage, temperature or expiry ledger.                                                             |
| Inventory: reorder recommendation                          | COMPLETE           | `src/lib/inventory.ts`                                                                                   | `ceil(max(2 × reorder level, 7-day forecast total) − stock)`, floored at zero.                                          | No order size, supplier lead time, capacity, MOQ, or expiry optimization.                                                                              |
| Inventory: search/filter/sort                              | COMPLETE           | `src/components/inventory/inventory-workspace.tsx`                                                       | Search by product/city/state; filter product/location/health; sortable product/location/stock/cover/health.             | No pagination, server query, URL state, or persisted preferences.                                                                                      |
| Inventory: details and quantity adjustment                 | COMPLETE           | `inventory-workspace.tsx`; `src/lib/workspace-store.ts`                                                  | Sheet displays metrics/recommendation and saves a validated nonnegative stock quantity.                                 | Demo-only action; no authorization, unit precision policy, or stock movement audit backend.                                                            |
| Inventory: local persistence                               | COMPLETE           | `src/lib/workspace-store.ts`; E2E workflow                                                               | Zod-validated localStorage snapshot; stock adjustment persists across reload and recalculates Overview/Analytics.       | Device/browser only; no shared API, authorization, or back-end audit trail.                                                                            |
| Dashboard: KPI calculations                                | COMPLETE           | `src/app/page.tsx`; `src/lib/dashboard-data.ts`                                                          | Daily milk demand, forecast metric, persisted inventory risk, active batches, compact operational alerts.               | Synthetic calculations; demand is not procurement; no real on-time delivery metric or financial result.                                                |
| Dashboard: demand chart                                    | COMPLETE           | `src/components/dashboard/demand-chart.tsx`; `dashboard-data.ts`                                         | 28 days of full-cream-milk/Delhi history plus a seven-day forecast and interval.                                        | Default fixed selection/horizon; chart labels need richer units/accessible data table for production.                                                  |
| Dashboard: inventory alerts                                | PARTIALLY COMPLETE | `src/app/page.tsx`; `dashboard-data.ts`                                                                  | Shows count of Low stock/Critical records and a separate total at-risk percent.                                         | No alert routing/dismissal; seeded summary is not localStorage-aware.                                                                                  |
| Dashboard: operational insights                            | PARTIALLY COMPLETE | `src/lib/dashboard-data.ts`; `insights-panel.tsx`; `intelligence-overview.tsx`                           | Existing calculated insights plus critical anomaly count, affected product/location, and recent alerts.                 | All rules use synthetic data; no live feed, verified financial impact, or production alert delivery.                                                   |
| Blockchain traceability                                    | DEMONSTRATION ONLY | `src/lib/traceability/`; `src/components/traceability/`; `/traceability/[batchId]`                       | Synthetic registry, append-event UI, per-batch SHA-256 chain, local verification, quality records, accessible QR.       | Not a blockchain; no signatures, independent checkpoint, shared backend, or proof of physical events.                                                  |
| Solidity smart contracts                                   | NOT STARTED        | None                                                                                                     | No contract source or chain configuration exists.                                                                       | Decide trust, privacy, and ledger model before adding tooling.                                                                                         |
| QR traceability                                            | COMPLETE           | `TraceabilityWorkspace`; `/traceability/[batchId]`                                                       | QR preview, current-origin batch URL, copy, SVG download, and batch lookup route.                                       | No scanner or deployed/public host; localStorage remains browser-specific.                                                                             |
| AI assistant                                               | NOT STARTED        | None; explanation seam in `src/lib/intelligence/explanations.ts`                                         | No LLM client/provider, prompt, retrieval, or assistant workflow; rules are not labeled AI-generated.                   | Requires approved data, permissions, human review, model governance, and evaluation.                                                                   |
| Anomaly detection                                          | COMPLETE           | `src/lib/intelligence/detection.ts`; `schema.ts`; `intelligence.test.ts`                                 | Deterministic demand, forecast-error, inventory, shipment-status, event-gap, and quality/temperature rules.             | Synthetic thresholds only; no labeled real dataset or production precision/recall.                                                                     |
| Anomaly impact estimation                                  | PARTIALLY COMPLETE | `src/lib/intelligence/impact.ts`; detail Sheet                                                           | Computes potential unit exposure and labels assumptions; financial estimate stays unavailable without prices.           | No real product prices, validated cost model, or confirmed loss outcomes.                                                                              |
| Anomaly recommendations                                    | COMPLETE           | `src/lib/intelligence/recommendations.ts`                                                                | Every supported rule maps to a deterministic review action grounded in the affected record.                             | Suggestions are not approved operating policy and do not execute transactions.                                                                         |
| Intelligence filters and distributions                     | COMPLETE           | `src/lib/intelligence/filters.ts`; `src/components/intelligence/intelligence-workspace.tsx`              | Search plus category/severity/status filters; category and severity breakdowns.                                         | No saved views, pagination, export, or URL-persisted filters.                                                                                          |
| Anomaly lifecycle and persistence                          | COMPLETE           | `src/lib/intelligence/store.ts`; intelligence workspace; E2E                                             | Open/Acknowledged/Resolved lifecycle and activity log persist in browser localStorage.                                  | No identity, backend, shared audit trail, or status reversal/reopen action.                                                                            |
| Supply-chain monitoring                                    | DEMONSTRATION ONLY | `/monitoring`; `src/lib/mock-data.ts`; `MonitoringWorkspace`                                             | Shipment registry, selected shipment detail, explicit invalid-query and empty states, linked from Intelligence.         | No sensor, GPS, carrier, temperature stream, actual timestamp, or live alert workflow.                                                                 |
| Product analytics                                          | DEMONSTRATION ONLY | `/analytics`; `AnalyticsWorkspace`                                                                       | Same-unit synthetic milk-demand trend, accessible chart description/table, and locally persisted inventory summaries.   | No sales, revenue, customer, or production analytics.                                                                                                  |
| Product analytics                                          | PLACEHOLDER        | `/analytics`                                                                                             | Starter text only; product catalog is available as synthetic fixture.                                                   | No sales/customer data, metrics, cohort, filter, or analytics instrumentation.                                                                         |

## 6. Data architecture and business logic

### Entity relationships and identifiers

- `Product.productId` joins demand, inventory, and batch records to the product
  fixture.
- `Location.locationId` joins demand and inventory to a location. The fixture
  also carries a display name, city, state, and a
  `collection-centre`/`processing-facility`/`distribution-hub` type.
- A demand observation is keyed in practice by date + productId + locationId;
  the model has no separate demand ID.
- Inventory uses a generated
  `INV-${productId}-${locationId}` `inventoryId`, one record per product and
  location. Seed stock and expiry values are deterministic.
- A batch has `batchId`, `productId`, quantity, three location-name strings,
  status, and creation timestamp. The location names are not IDs and no schema
  currently verifies that their declared roles are correct.
- Shipment IDs and activity IDs are separate sample strings in
  `src/lib/mock-data.ts`; there is no shipment-to-batch relationship model.

### Synthetic dataset generation

`src/data/demand.ts` loops through every product, location, and day from
`DEMAND_END_DATE - 179` through `DEMAND_END_DATE`. Each positive integer actual
is computed from:

```text
product baseline
× location multiplier
× weekday factor
× 83-day sinusoidal cycle
× gradual trend
× deterministic noise factor
× occasional 1.32 spike
```

The mock prediction is actual demand multiplied by a deterministic factor near
1.0. This `predictedDemand` field is used as the historical estimate line; the
forecast KPIs and forecast horizon use the statistical engine instead.

`src/data/inventory.ts` calculates each record's daily demand as the rounded
mean of the most recent 14 actual observations. Stock is daily demand multiplied
by a deterministic days-of-stock seed (mostly 7–14 days, with selected 0.8- and
2.2-day cases). Expiry is generated from the fixed as-of date and product shelf
life/sequence rules. This is a synthetic fixture, not a live inventory balance.

### Forecast calculations

1. **Aggregation:** choose the selected `productId`, `locationId`, and date
   interval `[asOfDate − historyDays + 1, asOfDate]`. Actuals are summed by
   date; duplicate predicted values on a date are averaged. Output is sorted by
   ISO date.
2. **Moving average:** mean of the last up-to-14 actual values.
3. **Weighted moving average:** for `n` selected values, compute
   `Σ(valueᵢ × i) / Σ(i)`, where the oldest selected point has weight 1 and the
   newest has weight `n`.
4. **Trend:** compare the means of the most recent period and immediately
   preceding period, each at most 14 points. Return `(recent − previous) /
previous × 100`, rounded to one decimal; if the prior mean is zero, return
   zero.
5. **Seasonality:** for each future date, compare the mean of up to eight recent
   observations with the same UTC weekday to the trailing-56-observation mean.
   The ratio is clamped to `[0.8, 1.2]`; insufficient history/matches gives 1.
6. **Forecast:** cap the trend used in the projection to ±15%, scale it linearly
   by `step / horizon`, and multiply the chosen baseline by that trend factor
   and weekday factor. Floor at zero and round to an integer.
7. **Backtest:** evaluate one-day moving-average estimates using up to the
   previous 14 actual observations for each of the trailing 28 available
   points (never earlier than index 14). The selected average method changes
   these estimates. Backtest estimates do not apply the forecast trend or
   weekday adjustment.
8. **Error metrics:** `MAE = mean(|actual − estimate|)`; `MAPE` is the mean
   absolute percentage error only for nonzero actuals. Accuracy is
   `max(0, 100 − MAPE)`, rounded to one decimal. If no backtest points exist,
   MAE/accuracy are 0 and MAPE is null; if every evaluated actual is zero,
   MAPE is null and accuracy is 0.
9. **Interval:** `RMSE × 1.96 × √(step/7)` is added/subtracted from the point
   estimate; the lower end is floored at zero.
10. **Displayed growth:** compare mean forecast demand over the selected horizon
    with the mean actual demand over the selected history.

These are transparent prototype heuristics. The interval multiplier does not
demonstrate 95% empirical coverage; the model has not been evaluated against
real or held-out operational data.

### Inventory and recommendation calculations

- `daysRemaining = round(currentStock / dailyDemand, 1)`. Invalid negative
  stock throws; nonpositive demand returns 0.
- `daysToExpiry = ceil((expiryDate − asOfDate) / 86,400,000)`.
- Health classification order:
  1. **Expiry risk** if the product is expected to expire before sell-through
     and expiry is within 3 days.
  2. **Critical** if cover is below 1 day.
  3. **Low stock** if cover is at most 3 days or stock is at/below reorder
     level.
  4. **Healthy** otherwise.
- Stockout risk is High below 1 day, Medium up to 3 days, Low otherwise. It
  does not incorporate supplier lead time.
- Seed reorder point is three days of recent demand. Reorder target is
  `max(2 × reorderLevel, selected 7-day forecast total)`. Recommended quantity
  is `ceil(max(0, target − currentStock))`.
- Inventory-at-risk percentage is the percentage of records not classified
  Healthy, rounded to one decimal. Regional figures group locations by state
  and average each location's risk percentage; “Watch” begins at 25%, and
  “Attention” at 50%.
- Forecasting-page recommendations are thresholded text: more than +2% means
  increase planned allocation by the daily forecast-vs-history difference;
  below −2% means review replenishment for excess; otherwise maintain and
  monitor. These are not LLM outputs or purchase actions.
- Overview insights combine forecast direction, the lowest-days-cover
  nonhealthy inventory row, and derived active-batch count. Pattern insights
  compare the recent maximum with an equal-length previous-period mean using a
  24% threshold.

### Intelligence detection and impact calculations

`src/lib/intelligence/detection.ts` runs over valid demand records, current
`InventoryMetrics`, explicit shipment fixtures, persisted traceability events,
and synthetic quality inspections. Its date is the dataset's fixed
`DEMAND_END_DATE`, not the computer clock. See
[intelligence-architecture.md](./intelligence-architecture.md) for all rule
thresholds and examples.

- Demand uses a 28-valid-observation historical mean. It flags ≥24% spikes and
  ≥24% drops. It separately flags absolute recorded-forecast error ≥8% of a
  nonzero actual (High at ≥20%). Confidence for these rules is the capped
  deterministic evidence score described in the architecture document, not a
  calibrated probability.
- Stockout alerts at ≤3 cover days (Critical ≤1, High ≤2); excess stock alerts
  above 12 cover days (High above 21). Expiry risk compares days-to-expiry to
  sell-through and estimates potentially unsold units as
  `max(0, stock − daily demand × max(days to expiry, 0))`.
- A shipment alert uses only the explicit `delayed` status and may show the
  listed case quantity. It does not derive delay hours from the clock-like ETA.
  Batch alerts compare consecutive per-batch event timestamps and flag gaps
  over 24 hours (Critical at 72 hours); a gap is not proof of a missing
  physical milestone.
- Quality rules flag recorded `review`/`failed` status, milk SNF below the
  demonstration 8.3% threshold, milk above 4°C, and ice cream warmer than
  −18°C. Those limits are demonstration assumptions, not operating standards.
- Unit exposure is explicitly hypothetical planning impact. No synthetic
  product prices are available, so financial exposure and portfolio-level
  currency totals remain unavailable rather than being imputed.
- Unsupported detectors are surfaced: inventory movement needs a movement
  ledger; delay duration needs planned and actual delivery timestamps.

Generated anomaly IDs are deterministic from rule/source identifiers and are
deduplicated by ID. Zod validates configuration/output. Recommendations are
human-review prompts and do not adjust inventory, create orders, or contact a
carrier. The future `AnomalyExplanationProvider` seam accepts structured
evidence; no external model is installed or called.

Workflow status and activity are the only persisted anomaly state. The browser
store uses `amul-intellichain-intelligence-v1`; evidence and detection results
remain derived and immutable through these controls. Current fixture coverage
is 146 alerts: 109 demand spikes, 9 excess-stock, 15 expiry-risk, 8 stockout,
1 shipment delay, 2 temperature, and 2 quality concerns. The fixture does not
trigger demand-drop, forecast-divergence, or batch-gap, though focused tests
exercise those paths.

### Data flow and remaining hardcoded values

```text
products.ts + locations.ts
       ├── demand.ts ──> historicalDemandRecords ──> forecasting engine
       │                                           ├── Forecasting workspace
       │                                           └── Overview chart/KPI/insights
       └── inventory.ts (trailing-14-day demand + deterministic seeds)
                  └── dashboard-data.ts + inventory.ts calculations
                         ├── Inventory workspace
                         └── Overview KPI/regional risk/insights

batches.ts ──> Overview stage counts, active batch count, batch insight
mock-data.ts ──> static shipment/activity examples ──> Overview activity feed
inventory-workspace ──> workspace-store.ts ──> localStorage
                                            ├── Inventory page reads overrides
                                            ├── Overview and Analytics recalculate
                                            └── Activity feed reads adjustments
batch fixtures + quality-inspections.ts ──> traceability/demo.ts ──> SHA-256 per-batch chains
traceability-workspace ──> traceability/store.ts ──> localStorage
                                             ├── registry and verification
                                             ├── batch detail timeline/ledger
                                             └── Overview traceability activity
source records + inventory snapshot + traceability snapshot
         └── intelligence/detection.ts ──> anomalies + evidence
                 ├── intelligence workspace and Overview summary
                 └── intelligence/store.ts ──> localStorage workflow only
```

Hash payload and limitations are specified in
[traceability-architecture.md](./traceability-architecture.md). Local hash
verification is not a chain consensus or physical-world proof.

The Overview inventory KPIs and regional risk now use the same validated
browser-local stock overrides as Inventory and Analytics. A Playwright workflow
changes a stock value, reloads it, and confirms the Overview risk recalculates.
These values remain per-browser demo state, not shared operational inventory.

Other fixed/illustrative values include product baselines and noise/seasonality
arrays; the stock/expiry seed rules; Phase 4 detection thresholds (24% demand
change, 8% forecast error, 1/2/3-day cover bands, 12/21-day excess-cover bands,
3-day expiry window, 24/72-hour event gaps, 4°C/−18°C temperature values, and
8.3% milk SNF); evidence scores; 0.8–1.2 seasonality clamp; ±15% forecast trend
cap; 1.96 interval multiplier; inventory health thresholds and 3× reorder
policy; 25%/50% regional bands; Overview default Full Cream Milk/Delhi weighted
forecast; static shipments and activity examples; two hardcoded topbar
notification messages; and the “Coming soon” module copy. They must not be
interpreted as measured operational values. Overview's original demand,
forecast, inventory, and batch KPIs are derived from fixed synthetic data,
not literal KPI constants.
The Overview “Daily Milk Demand” sums demand for the two milk products over all
seven locations on the fixed last date; it is not a procurement-volume measure.

## 7. Routes and user experience

| URL                       | Page purpose and implementation                                                                                      | Main interactions/data                                                                                                                      | Limitations                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/`                       | Executive Overview in `src/app/page.tsx`; modular KPI, chart, regional, activity, insight, and intelligence widgets. | Calculated synthetic indicators; inventory and regional risk reflect browser-saved stock edits; compact alerts share Intelligence status.   | No operational feed or verified business outcomes.                                                      |
| `/forecasting`            | Demand planning workspace.                                                                                           | Product/location/history/horizon/method controls update model output and a chart with an accessible text description.                       | Fixed synthetic as-of date; moving-average heuristic only; no calibration or external forecast.         |
| `/inventory`              | Stock health workspace.                                                                                              | Search, filters, sorting, details Sheet, validated simulated stock adjustment and reload persistence.                                       | Forty-two synthetic records; localStorage is browser-specific; no purchase order or shared audit trail. |
| `/traceability`           | Synthetic batch registry.                                                                                            | Search/filter batches; append sample events; preview/download QR; local reset and verification.                                             | Local-only hash chain; no shared ledger or independent history anchor.                                  |
| `/traceability/[batchId]` | Batch detail, statically generated for seeded records.                                                               | Product journey, event hashes, integrity verification, quality summary, append event, and QR navigation.                                    | Cannot prove physical events or detect removal of a terminal suffix without a trusted checkpoint.       |
| `/monitoring`             | Shipment registry with query-selected record details.                                                                | Static synthetic carrier label, destination, status, ETA label, quantity, invalid-query and empty states.                                   | No live carrier, GPS, sensor, timestamped ETA, or dispatch action.                                      |
| `/insights`               | Deterministic Supply Chain Intelligence workspace.                                                                   | Search/filter, distribution summaries, evidence detail, unit estimates, recommendations, related links, persisted status/activity workflow. | Rules and thresholds are synthetic; no external AI or financial exposure.                               |
| `/analytics`              | Focused milk demand and inventory view.                                                                              | Same-unit demand series and accessible table alternative; inventory uses locally saved demo state.                                          | No sales, revenue, customer, or production analytics.                                                   |
| `/about`                  | Independent-project and data/integration disclosure.                                                                 | Explains synthetic records, local storage, and absent external services.                                                                    | No user account or external project affiliation.                                                        |

Production-build browser tests cover every route. An unknown batch renders the
custom not-found UI and `noindex`; because the check runs inside a Suspense
boundary with Next.js Cache Components, streaming can commit an HTTP 200 before
`notFound()` renders. Next.js documents this behavior. The user-facing
not-found state is correct, but the status code is a known limitation.

## 8. Testing and technical health

### Verified now

The Phase 6 validation table and exact results are maintained in
[final-project-handover.md](./final-project-handover.md) and the latest entry
in [ACTIVITY_LOG.md](./ACTIVITY_LOG.md). Repeatable checks include Node unit
tests, Playwright workflows on the production build, and Axe WCAG 2.1 A/AA
checks for all core routes plus open Dialog/Sheet states.

### Gaps, caveats, and technical debt

- Playwright and Axe checks run in Chromium only. They are an automated
  accessibility baseline, not a complete manual WCAG audit or certification.
- Browser suite exercises deterministic demonstration flows and can miss
  unmodeled browser/runtime issues.
- The model's confidence interval and stock policies are simple, hand-selected
  heuristics. No backtest report, real data, baseline comparison, calibration,
  or fairness/quality assessment exists.
- Client workspaces load and calculate from the full small synthetic array.
  `getAllInventoryMetrics` runs a forecast for each product/location pair;
  indexing/caching and server-side aggregation may be needed for larger data.
- Data references are plain strings/IDs without runtime foreign-key
  verification. A fixture already has a collection-centre role mismatch.
- Overview and Analytics recalculate from browser-persisted stock overrides;
  those overrides remain local to each browser.
- Intelligence rules are deterministic but uncalibrated. No precision/recall
  results, domain-reviewed labels, financial estimates, inventory movement
  ledger, or planned-versus-actual delivery timestamps exist.
- `src/lib/calculations.ts` has legacy wrappers with no direct `src/` consumer.
  `shipments` is exported by `src/lib/mock-data.ts` but is not rendered by the
  current routes.
- The full npm audit reports 2 low and 10 moderate development-tree
  advisories; `npm audit --omit=dev` reports 0 vulnerabilities. The findings
  and deferred breaking upgrade are detailed in the final handover.
- The new traceability ledger is browser-local and has no signatures, external
  checkpoint, remote store, or chain consensus. Removing a terminal event cannot
  be detected without an independent trusted checkpoint.
- Unknown dynamic batch requests show a not-found UI but can return HTTP 200
  after streaming begins; see the route-segment behavior above.

## 9. Git, deployment, and configuration status

- **Git:** repository initialized; current local branch is `main`; the only
  local branch found is `main`. Remote name `origin` is configured. The latest
  commit is `d3c863d` (`Initial commit`, dated 2026-11-12).
- **Working tree:** Phase 6 changes remain uncommitted/untracked alongside the
  pre-existing project work. No changes were committed, reset, discarded, or
  published. The only commit remains the initial scaffold; Git author name/email
  are not configured. Preserve owner changes and stage/commit only with
  approval.
- **Remote:** `origin` points to `MithwaniNaman/Amul-IntelliChain`. No
  authenticated remote operation, push, or publication was performed.
- **Deployment:** `.github/workflows/ci.yml` now runs install, Playwright
  browser setup, typecheck, lint, unit tests, production build, and E2E on
  pull requests and pushes to `main`. Vercel is documented as the recommended
  host in `docs/deployment-guide.md`; there is no Vercel project or verified
  public deployment. `public/vercel.svg` is only a static asset.
- **Environment:** `.env.example` is the documented template; no application
  environment variables or service credentials are required. `.gitignore`
  ignores `.env*` except `.env.example`. The Phase 6 check inspected only
  environment file names/ignore rules and source access patterns, not secret
  file contents.

## 10. Product-management context

The owner describes this as a Microsoft Product Manager MBA Intern portfolio
project. That is portfolio context, not a product feature or evidence of
Microsoft, Amul, or GCMMF affiliation.

- **Vision and users:** see section 1. Operations, planners, and
  quality/traceability roles are provisional segments from the existing
  product-requirements document, not validated personas.
- **Customer problems:** demand volatility, spoilage/expiry, stock imbalance,
  and limited batch provenance are product hypotheses. No discovery interviews,
  workflow observation, customer quotes, or market-sizing evidence was found.
- **Implemented product decisions:** Phase 1 established a visible dashboard
  and route map. Phase 2 prioritized a shared synthetic dataset, transparent
  demand/inventory calculations, working filters, and persistence. Phase 3
  added a local, inspectable traceability hash-chain demo while still deferring
  blockchain dependencies. Phase 4 prioritized explainable deterministic
  alerts, source evidence, human review, and explicit data-coverage limits
  instead of adding an unvalidated external AI model. This sequencing is
  evidenced by owner instructions, code, and phase documentation.
- **Not implemented:** research-backed personas; RICE scoring; analytics
  instrumentation; user access model; validated business case; or product
  success dashboard. Strategy, metrics, experiment, and decision documents
  were added as proposed artifacts, not as findings.
- **Business value hypotheses (not measured):** lower stockout/expiry rates,
  better forecast error than a simple baseline, shorter planning/reconciliation
  time, and faster/stronger batch provenance verification.
- **Product metrics:** dashboard numbers (forecast accuracy, demand, risk,
  alerts, batches) are synthetic operational examples, not product success
  metrics. There is no telemetry, adoption data, or conversion funnel.
- **Candidate success measures for future validation:** out-of-sample MAE/WAPE
  and forecast bias vs seasonal-naive baseline; stockout and expiry/write-off
  rates; planner time per replenishment decision; trace lookup completion and
  verification success; false-alert rate; and task completion/adoption by
  persona. Define baselines, owners, windows, and data rights before treating
  these as goals.
- **Portfolio opportunity:** show problem framing, evidence/assumptions,
  prioritization trade-offs, safe AI/ledger architecture, measurable
  experiments, and a working demo. Avoid presenting synthetic operating results
  as customer impact.

## 11. Prioritized next-development roadmap

The roadmap below combines implemented prototypes and proposed work. Phases 1–2
were owner-confirmed complete; Phases 3–4 have local synthetic demonstrations,
not production integrations. Phase 5 is the next proposed product milestone.
Dependencies and success criteria are suggestions requiring product-owner
agreement.

### Phase 3 — Blockchain traceability (local demonstration implemented)

- **Implemented:** synthetic batch/event and quality contracts; registration
  via batch registry; collection, processing, quality, custody-transfer, and
  delivery event append; integrity verification; QR-linked batch detail.
- **Dependencies:** validated traceability use case and actors; stable batch
  identifiers; source-of-truth and data ownership; permission/identity model;
  privacy and threat-model review; architecture decision on public vs
  permissioned ledger and on-chain vs off-chain data.
- **Next for a real ledger:** evaluate ledger alternatives before adding dependencies. If an EVM
  design is selected, define Solidity contracts and local tests (for example
  Hardhat only after the choice); keep sensitive commercial/consumer data off
  chain and place only appropriate hashes/references and minimal events on
  chain. Integrate with the current synthetic batches first.
- **Impact hypothesis:** improve auditability and stakeholder confidence in
  provenance; not inherently proof that physical goods or sensor readings are
  authentic.
- **Future acceptance evidence:** a batch lifecycle can be registered, appended,
  queried, and tamper-evidently verified in a test environment; duplicate or
  unauthorized writes are rejected; a QR lookup opens the correct batch and
  discloses only approved fields; user can distinguish demo/testnet from
  production proof.
- **Risks:** key management, transaction cost/latency, privacy, partner
  onboarding, incorrect off-chain inputs, and mistaken “blockchain means true”
  claims.

### Phase 4 — Explainable supply-chain intelligence (prototype implemented)

- **Implemented:** deterministic rules for demand spikes/drops and forecast
  divergence; stockout, excess, and expiry; explicit delayed shipment status;
  batch event gaps; and synthetic quality/temperature concerns. Added
  source-linked evidence, unit-based hypothetical impact, recommendations,
  filtering, detail inspection, and a persisted local acknowledge/resolve
  workflow. Added a concise Overview summary and test/evaluation documentation.
- **Not implemented:** external AI provider, natural-language model inference,
  real sensor/carrier integration, real financial exposure, stock-movement
  analysis, or validated production alert thresholds. The explanation provider
  interface is only an extension seam.
- **Next validation dependencies:** approved/labeled operational data; domain
  agreement on anomaly definitions; chronological evaluation windows;
  precision/recall and alert-volume baselines; model governance and human
  review if AI is later considered. See
  [anomaly-evaluation.md](./anomaly-evaluation.md).
- **Impact hypothesis:** earlier detection and less operator triage effort,
  subject to future evidence. Current synthetic alert counts are not impact
  measures.
- **Risks:** synthetic patterns, false positives/negatives, arbitrary
  thresholds, sparse observations, and confusion of unit exposure with
  financial loss. No output currently changes operational state.

### Phase 5 — Product-management artifacts (proposed, not validated)

- Added a provisional strategy, candidate metrics, experiment plan, and product
  decision log to support portfolio discussion.
- No interviews, validated personas, experiment, telemetry, RICE scoring,
  market evidence, or user outcomes are claimed. These materials explicitly
  label assumptions and proposed methods.
- Further product work should begin with discovery, data authorization, and a
  domain-reviewed evaluation plan rather than adding integrations.

### Phase 6 — Portfolio readiness (local preparation complete)

- Added focused Analytics and Monitoring views, cross-module search, explicit
  demonstration account/notification copy, About disclosures, responsive
  keyboard navigation, and query/error/empty states.
- Added Playwright workflows for route, forecast, inventory, traceability,
  intelligence, shipment, About, persistence, and 390px mobile checks. Axe
  checks WCAG 2.1 A/AA on core routes and open Dialog/Sheet states.
- Added CI, Vercel deployment instructions, a 3–5 minute demo script, and a
  handover. This is deployment preparation only; no hosting account or public
  deployment was created.
- **Next:** obtain owner approval before any commit/push/deploy. Validate user
  jobs and data ownership before claiming product readiness. See
  [final-project-handover.md](./final-project-handover.md).

## 12. Handover instructions for the next assistant

1. Read this file, `AGENTS.md`, `README.md`, `docs/ACTIVITY_LOG.md`,
   `docs/architecture.md`, `docs/product-requirements.md`, and
   `docs/product-roadmap.md` before implementing. Treat older documentation
   that conflicts with code as stale and update it when directly relevant.
2. Preserve the existing App Router, Tailwind/shadcn design, shared data model,
   and working Forecasting/Inventory workflows. Make surgical changes.
3. Before editing Next.js APIs, follow `AGENTS.md` and inspect the relevant
   local Next.js 16 docs in `node_modules/next/dist/docs/`.
4. Keep every generated record and derived metric clearly marked synthetic
   until a real authorized source exists. Never imply official Amul/GCMMF
   affiliation, on-chain proof, AI inference, or business impact without
   evidence.
5. Do not add Solidity, AI-provider, database, or deployment dependencies until
   their architecture and requirements are approved. Do not expose secrets.
6. Preserve the uncommitted working tree. Inspect `git status` before editing,
   and do not reset, overwrite, or commit files without authorization.
7. After changes, run the narrow tests plus `npm run typecheck`, `npm run lint`,
   `npm test`, `npm run build`, and `npm run test:e2e`. E2E requires a
   production build and installed Playwright Chromium.
