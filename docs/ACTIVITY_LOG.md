# Amul IntelliChain — Development Activity Log

## Project initiation

- **Project:** Amul IntelliChain
- **Description:** AI-powered dairy supply chain intelligence and blockchain traceability platform.
- **Development environment:** macOS Apple Silicon, VS Code, GitHub Copilot Agent.
- **Framework:** Next.js, TypeScript and Tailwind CSS.
- **Initial environment setup:** Completed, as confirmed by the project owner.
- **Initial application scaffold:** Completed, as confirmed by the project owner.
- **Current milestone:** Phase 6 — Final engineering, deployment, and portfolio
  readiness. The app is prepared for demonstration but has not been deployed,
  committed, or published.

## Development entries

### Phase 2 — Demand Forecasting and Inventory Intelligence

- **Date and time:** 2026-11-12 19:34 IST.
- **Objective:** Centralize deterministic dairy supply-chain data; implement
  statistical demand forecasting, interactive inventory analysis, dashboard
  calculations, automated tests, and phase documentation.
- **Files created:** `src/data/demand.ts`,
  `src/data/demand.test.ts`, `src/lib/forecasting/engine.ts`,
  `src/lib/forecasting/engine.test.ts`, `src/lib/inventory.ts`,
  `src/lib/inventory.test.ts`, `src/lib/dashboard-data.ts`,
  `src/lib/workspace-store.ts`, `src/lib/workspace-store.test.ts`,
  `src/components/forecasting/forecast-workspace.tsx`,
  `src/components/inventory/inventory-workspace.tsx`.
- **Files modified:** `src/types/index.ts`, `src/data/products.ts`,
  `src/data/locations.ts`, `src/data/inventory.ts`, `src/data/batches.ts`,
  `src/lib/calculations.ts`, `src/lib/mock-data.ts`,
  `src/components/dashboard/activity-feed.tsx`,
  `src/components/dashboard/demand-chart.tsx`,
  `src/components/dashboard/insights-panel.tsx`,
  `src/components/dashboard/kpi-card.tsx`,
  `src/components/dashboard/regional-inventory.tsx`,
  `src/components/dashboard/supply-chain-overview.tsx`, `src/app/page.tsx`,
  `src/app/forecasting/page.tsx`, `src/app/inventory/page.tsx`,
  `package.json`, `package-lock.json`, `README.md`, `CHANGELOG.md`,
  `docs/ACTIVITY_LOG.md`.
- **Dependencies installed or removed:** Added `tsx` as a development
  dependency to run TypeScript tests with Node's test runner. No other
  dependencies were added or removed.
- **Terminal commands executed:** `source "$HOME/.nvm/nvm.sh" && npm install
--save-dev tsx`; `source "$HOME/.nvm/nvm.sh" && npm run test`; `source
"$HOME/.nvm/nvm.sh" && npm run typecheck`; `source "$HOME/.nvm/nvm.sh" &&
npm run lint`; `source "$HOME/.nvm/nvm.sh" && npm run build`; targeted `npx
prettier --write` and `npx prettier --check` calls; `curl` HTTP smoke checks
  for all seven routes.
- **Features implemented:** 7,560 deterministic demand observations covering
  180 days × 6 products × 7 locations; selected-history aggregation; moving
  and weighted-moving averages; trend and weekday seasonality; backtest MAE,
  MAPE and accuracy; uncertainty intervals; adjustable forecast controls,
  calculated insights and recommendations; inventory risk and reorder
  calculations; searchable/filterable/sortable inventory table; detail panel;
  localStorage stock adjustments and activity logging; dashboard calculations
  based on shared mock data.
- **Bugs encountered:** Existing dashboard components referenced static mock
  data exports that were removed when centralizing data. Type checking also
  found missing insight types, an incorrect inventory-metric type import, and
  a duplicate variable declaration.
- **Bugs fixed:** Updated dashboard consumers to use the central dataset and
  calculations; restored the shared typed insight contract, corrected imports,
  and removed the duplicate declaration. Adjusted spike comparison windows to
  match the selected history length.
- **Tests performed and actual results:** `npm run test`: 9 passed, 0 failed.
  `npm run typecheck`: passed. `npm run lint`: passed. Targeted Prettier check:
  passed. `npm run build`: passed; all eight app routes were statically
  prerendered. Browser checks confirmed forecast product/location/horizon
  controls update metrics and recommendations; inventory search and location
  filters reduce 42 rows to the selected record; stock changes persist after
  reload and appear in Overview's activity feed; Forecasting and Inventory
  have no page overflow at a 390 px viewport width. HTTP checks for all seven
  user-facing routes returned 200.
- **Known limitations:** Data and recommendations are synthetic and
  deterministic; statistical confidence intervals are simplified; stock
  changes persist only in the local browser; there is no live data source,
  connected LLM, backend audit trail, or blockchain. `npm install` reported 12
  dependency-tree audit advisories (2 low and 10 moderate); no broad automated
  dependency upgrade was applied.
- **Next development milestone:** Finish production-build and all-route
  validation was completed in the project-context audit. Begin Phase 3 by
  designing traceability events and evaluating blockchain integration.

### Project context and handover audit

- **Date and time:** 2026-11-12 19:50 IST.
- **Phase:** Phase 2 follow-up documentation.
- **Objective:** Audit current source, package/configuration, routes, prior docs,
  test/build status, and Git/deployment evidence; create a durable continuation
  handover.
- **Files created:** `docs/PROJECT_CONTEXT.md`.
- **Files modified:** `docs/ACTIVITY_LOG.md`, `CHANGELOG.md`.
- **Dependencies installed or removed:** None.
- **Terminal commands executed:** `node --version`; `npm --version`; `npm ls
--depth=0`; `npm run typecheck`; `npm run lint`; `npm run test`; `npm run
build`; targeted `npx prettier --check`; `git status --short`; `git branch
--show-current`; `git branch --list`; `git log`; `git remote`; `git config
--get user.name`; `git config --get user.email`; `curl` smoke checks for all
  seven user routes; targeted `rg` searches for package usage, environment
  access, and deployment/source integrations.
- **Features implemented:** No application feature changes. Added the
  repository-grounded project context document covering the verified
  architecture, implementation matrix, formulas, status, limitations,
  product-management context, and proposed roadmap.
- **Bugs encountered:** Existing architecture, product-requirements, roadmap,
  and Insights placeholder copy still describe parts of the Phase 1 starter
  and are stale relative to Phase 2. Overview stock summary KPIs use base
  fixture records rather than browser-persisted stock overrides.
- **Bugs fixed:** Updated the Phase 2 next-milestone note to reflect the
  successful production build and all-route checks. No application bug fixes
  were made in this documentation-only session.
- **Tests performed and actual results:** `npm run typecheck`, `npm run lint`,
  targeted Prettier check, and `npm run build` passed; `npm run test` passed
  9/9; all seven user routes returned HTTP 200. `npm ls --depth=0` completed
  and reported the installed top-level package versions. The audit found the
  latest commit is the initial commit and the working tree is not clean.
- **Known limitations:** No formal personas, user research, validated business
  metrics, deployment setup, CI workflows, database/API, or production
  integrations were found. See `PROJECT_CONTEXT.md` for the detailed
  limitations and verified repository state.
- **Next development milestone:** Phase 3 — define batch-event and trust
  requirements, select a traceability architecture, and then implement
  registration/verification/QR behavior only after those decisions.

### Phase 3 — Blockchain traceability and batch lifecycle

- **Date and time:** 2026-11-12 19:55 IST.
- **Objective:** Replace the Traceability placeholder with a synthetic batch
  registry, event lifecycle, local tamper-evident hash chains, QR lookup, and
  validated persistence; document limitations and architecture.
- **Files created:** `src/data/quality-inspections.ts`;
  `src/lib/traceability/{hash,engine,demo,store}.ts` and focused tests;
  `src/components/traceability/{add-event-dialog,batch-detail-workspace,traceability-workspace}.tsx`;
  `src/app/traceability/[batchId]/page.tsx`;
  `docs/traceability-architecture.md`.
- **Files modified:** `src/types/index.ts`, `src/data/batches.ts`,
  `src/app/traceability/page.tsx`, `src/components/dashboard/activity-feed.tsx`,
  `package.json`, `README.md`, `CHANGELOG.md`,
  `docs/PROJECT_CONTEXT.md`, and this log.
- **Dependencies installed or removed:** None. Reused installed `qrcode.react`,
  Zod, Node test runner, and Web Crypto API.
- **Terminal commands executed:** `npm run typecheck`; `npm run lint`;
  `npm run test`; `npm run build`; targeted `npx prettier --write` and
  `npx prettier --check`; `curl` HTTP smoke checks for app routes and all six
  seeded batch detail/QR URLs.
- **Features implemented:** SHA-256 canonical event hashes, genesis and
  previous-event links, chronology and batch checks, modified/deleted/reordered
  event detection, localStorage persistence/reset, synthetic quality records,
  searchable/filterable batch registry, detail lifecycle and event ledger,
  verification UI, quality-inspection form, new event append, QR preview/URL
  copy/SVG download, and Overview activity-feed entries.
- **Bugs encountered:** Initial production build found a render-time current
  date in the dialog and Next.js 16 prerender constraints for the dynamic batch
  route. An initial lint run also flagged a state update inside an effect; the
  shared browser contained a stale persisted traceability record rejected by
  schema validation.
- **Bugs fixed:** Initialize the date on input focus, statically generate detail
  paths for the six seeded batches, and keep the date update in the user event
  handler. A test assertion was corrected to accept the specific genesis-link
  diagnostic. Reset the stale browser traceability data to the synthetic seed.
- **Tests performed and actual results:** `npm run typecheck` passed;
  `npm run lint` passed; `npm run test` passed 16/16; `npm run build` passed
  with the registry and six seeded detail routes generated; all app routes and
  six batch URLs returned HTTP 200; targeted Prettier check passed. Browser
  checks confirmed the product filter reduced six records to one and the QR
  preview rendered a URL for the matching batch. The QR destination route
  returned HTTP 200.
- **Known limitations:** Browser-local data is not a blockchain, has no
  signatures or independent trust anchor, and cannot detect removal of a
  terminal event. It does not prove real-world truth. No credentials, real
  people, or live operational feeds are involved. The QR was rendered and its
  destination checked, but scanning on a separate device and downloading the
  SVG were not manually verified. No complete browser test suite exists.
- **Next development milestone:** Phase 4 — validate a real, authorized
  forecasting/anomaly use case and evaluation plan before adding an AI provider.

### Phase 4 — Explainable supply-chain intelligence and anomaly detection

- **Date:** 2026-11-12.
- **Objective:** Replace the Insights placeholder with a deterministic,
  evidence-linked anomaly review workspace; quantify unit exposure without
  inventing prices; add operator status persistence, Overview summary, focused
  tests, and architecture/evaluation documentation.
- **Files created:** `src/lib/intelligence/{detection,schema,impact,recommendations,filters,explanations,index,store}.ts`;
  `src/lib/intelligence/intelligence.test.ts`;
  `src/components/intelligence/{intelligence-workspace,intelligence-overview}.tsx`;
  `docs/intelligence-architecture.md`; `docs/anomaly-evaluation.md`.
- **Files modified:** `src/types/index.ts`, `package.json`,
  `src/app/{page,insights/page,forecasting/page,inventory/page,monitoring/page}.tsx`,
  `src/components/{layout/sidebar,layout/topbar,dashboard/insights-panel,forecasting/forecast-workspace,inventory/inventory-workspace}.tsx`,
  `README.md`, `CHANGELOG.md`, `docs/PROJECT_CONTEXT.md`, and this log.
- **Dependencies installed or removed:** None. Reused Zod, Node's built-in
  test runner, Next.js App Router, and existing browser-local storage patterns.
- **Features implemented:** deterministic demand spike/drop and forecast-error
  rules; stockout, excess-cover, and expiry rules; explicit delayed shipment
  status; per-batch event timestamp gaps; quality status, milk SNF, and
  product-category temperature checks; stable anomaly IDs and duplicate
  prevention; Zod validation; unit impact assumptions; category-specific
  recommendations; confidence/evidence strength; search and filters; severity
  and category distributions; evidence/detail Sheet; acknowledge/resolve
  workflow and activity history in localStorage; compact Overview summary;
  query links to selected forecast/inventory/shipment records and batch detail.
- **Synthetic coverage observed:** 146 alerts (109 demand spikes, 9 excess
  inventory, 15 expiry risk, 8 stockout risk, 1 shipment delay, 2 temperature
  excursions, 2 quality concerns). The shared fixture does not trigger demand
  drops, forecast divergence, or batch gaps; tests use controlled inputs for
  those rules.
- **Bugs encountered and fixed:** TypeScript caught a wrong `InventoryMetrics`
  import and warning-count tuple inference; fixed the imports/types. ESLint
  rejected synchronous workflow-state loading inside an effect; replaced it
  with the existing `useSyncExternalStore` pattern. A test initially assumed
  per-record rather than per-source warning aggregation; corrected its
  assertion. Invalid/missing inspection readings are skipped and surfaced.
- **Tests and actual results:** `npm run typecheck` passed; `npm run lint`
  passed; `npm test` passed 25/25; `npm run build` passed, producing static
  output and partially prerendered URL-dependent forecast, inventory, and
  shipment content. Targeted Prettier check passed. Manual browser validation
  verified shipment category filtering (1 of 146), evidence and
  recommendation details, status acknowledgement and resolution after reload,
  shipment details navigation, forecast product/location query selection, and
  the target inventory row from its record query. At a 390px viewport, the
  Intelligence page and Overview document and body widths were 390px. These
  are manual checks, not an automated browser suite.
- **Known limitations:** All source observations are synthetic. Financial
  exposure is unavailable without prices; shipment delay duration is
  unavailable without planned/actual delivery timestamps; inventory movement
  is unavailable without a movement ledger. Temperature and SNF limits are
  demo assumptions, not operating standards. Status history is per-browser;
  no external AI or operational action is connected.
- **Next development milestone:** Phase 5 — validate target users and jobs,
  write a research-grounded PRD/personas, prioritize with an explicit method,
  and define outcome/guardrail metrics before considering any production
  integrations or AI provider.

### Phases 5–6 — Product definition and portfolio readiness

- **Date and time:** 2026-11-12 22:38 IST.
- **Objective:** Make the project explainable, reproducible, accessible,
  testable, and suitable for an interview portfolio without claiming
  production integrations or validated real-world outcomes.
- **Files created:** `e2e/portfolio.spec.ts`, `playwright.config.ts`,
  `.github/workflows/ci.yml`, `docs/deployment-guide.md`,
  `docs/demo-script.md`, `docs/portfolio-case-study.md`,
  `docs/product-strategy.md`, `docs/product-metrics.md`,
  `docs/experimentation-plan.md`, `docs/product-decisions.md`,
  `docs/screenshots/README.md`, and `docs/final-project-handover.md`.
- **Files modified:** README and changelog; project context and activity
  records; architecture, product requirements, and roadmap; route-level
  error/not-found behavior; Overview, Analytics, Monitoring, search, inventory,
  traceability, forecasting, intelligence, navigation, and shared UI
  accessibility.
- **Dependencies installed or removed:** Added `@playwright/test` and
  `@axe-core/playwright` as development dependencies for end-to-end workflows
  and automated accessibility checks. No AI, blockchain, backend, or runtime
  integration was added.
- **Terminal commands executed:** `npm ci`; `npm run typecheck`; `npm run
lint`; `npm run test`; `npm run build`; `npm run test:e2e`; targeted
  `npx prettier --write` and `npx prettier --check`; `npm audit`; `npm audit
--omit=dev`; `npm audit fix --dry-run`; repository status, remote, and
  environment-filename/ignore checks; targeted source searches.
- **Features implemented:** Inventory risk on Overview reflects local edits;
  Monitoring and Analytics use the shared synthetic dataset; cross-module
  search opens relevant records; notification/profile controls clearly state
  their demo-only status; About and route error/not-found disclosures; batch
  and QR navigation; responsive layout; chart descriptions; inventory input
  validation; keyboard focus restoration; and a CI-configured Playwright/axe
  suite. Added deployment, demo, product-management, screenshot, and handover
  documentation. No screenshot was fabricated.
- **Bugs encountered and fixed:** Corrected an inventory data import that
  failed type checking, restored QR-trigger focus after closing its dialog,
  resolved automated contrast/name findings, described charts for assistive
  technologies, and added clear feedback for invalid stock input. A new
  inventory-filter browser assertion initially matched both the search input
  and location control; it was narrowed to the select containing the
  “All locations” option. The final browser suite then passed. Unknown batch
  pages render not-found content, but streaming can leave the HTTP status at
  200; this Next.js behavior is documented rather than concealed.
- **Tests performed and actual results:** `npm ci` passed (662 packages added,
  669 audited); `npm run typecheck`, `npm run lint`, and targeted Prettier
  checks passed; `npm run test` passed 25/25; `npm run build` passed on Next.js
  16.4.6; `npm run test:e2e` passed 8/8. Browser coverage includes route
  behavior without console errors, inventory filtering and adjustment,
  workflow persistence, valid/invalid related-record navigation, 390px mobile
  layout, and axe-core WCAG 2.1 A/AA checks on nine routes and interactive
  overlays. `npm audit` reported 12 development-tree findings (2 low, 10
  moderate); `npm audit --omit=dev` reported zero. The audit's proposed
  remediation requires a breaking shadcn upgrade; no force upgrade was made.
- **Known limitations:** Validation ran locally on Node.js 26.13.1; the Node
  22.x CI workflow has not yet been observed in a hosted run. Automated
  accessibility checks are not a manual audit or certification. All product
  data remains synthetic and localStorage persistence is per-browser. No
  deployment or publication occurred.
- **Next development milestone:** Owner review before any commit or
  publication. Optional deployment can follow the documented Vercel steps.
  Product work should next validate user needs and data governance before
  considering real operational sources or external services.
