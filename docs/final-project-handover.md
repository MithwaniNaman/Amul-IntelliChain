# Final Project Handover

## Portfolio status

Amul IntelliChain is a reproducible, interactive portfolio demonstration of
dairy supply-chain forecasting, inventory workflows, batch traceability, and
explainable operational alerts. It is **not a production system**, has not been
deployed, and is not affiliated with or endorsed by Amul. Operational records
and outputs are deterministic synthetic demonstration data.

The current validation ran locally on Node.js `v26.13.1` and npm `11.20.0`.
The README, deployment guide, and CI target Node.js 22.x; CI is configured for
that runtime, but was not run from this local environment.

## What is implemented and demonstrable

| Route                     | Demonstration                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                       | Executive overview with demand, forecast, persisted inventory risk, regional exposure, activity, and a concise intelligence summary.                      |
| `/forecasting`            | Product/location/history/horizon selection, deterministic forecast, uncertainty intervals, and model metrics.                                             |
| `/inventory`              | Searchable and filterable product-location inventory, record details, validated stock adjustment, and browser-local persistence.                          |
| `/traceability`           | Synthetic batch registry, filtering, local hash-chain verification, and QR preview.                                                                       |
| `/traceability/[batchId]` | Batch lifecycle and event evidence, quality summary, verification, QR destination, and simulated event workflow.                                          |
| `/insights`               | Deterministic anomaly counts/distributions, filters, evidence, estimated unit impact, recommendations, and persisted Open/Acknowledged/Resolved workflow. |
| `/monitoring`             | Synthetic shipment registry and selected shipment details; anomaly links open the relevant record.                                                        |
| `/analytics`              | Demand and inventory views based on existing synthetic data; no sales or revenue claims.                                                                  |
| `/about`                  | Independent-project, synthetic-data, persistence, and integration disclosures.                                                                            |

Forecasting, Inventory, and Monitoring show Suspense loading statuses while
query-dependent content is prepared; the app has a route error boundary and
custom not-found page. Monitoring also gives explicit feedback for unknown and
repeated shipment query parameters. Browser checks cover the nine routes
above, including a seeded batch detail. The unknown batch route displays the
not-found UI and `noindex`; because Next.js Cache Components may begin
streaming before `notFound()` is reached, the streamed response can still have
HTTP status 200. This limitation is documented and should be revisited if
strict HTTP 404 behavior becomes a deployment requirement.

## What is synthetic, persisted, and not integrated

- Products, locations, demand, inventory, shipments, batch events, quality
  readings, and alert examples are synthetic.
- Forecasting uses deterministic moving-average methods, bounded weekday
  seasonality, backtested error metrics, and horizon-widening intervals. Its
  `100 - MAPE` accuracy display is not a real-world performance claim.
- Inventory cover and risk are calculated from the demo stock and demand.
  Suggested replenishment follows the documented demonstration rule, not an
  approved operating policy.
- Anomaly impact is a unit-based planning estimate, not realized loss. Product
  prices are absent, so financial exposure is unavailable. Thresholds for
  temperature and quality are examples, not food-safety specifications.
- Inventory edits, traceability demo events, and anomaly statuses/activity are
  stored in the visitor's browser localStorage. They are not shared, backed up,
  authenticated, or retained in a server database.
- Hash-chain verification checks internal consistency of locally stored
  records; it is not a blockchain, signed attestation, or proof of a physical
  event.
- No external AI provider, database, authentication, payment, carrier/GPS,
  sensor, blockchain network, or operational data integration is connected.
  The application requires no API key.

## Security and dependencies

- `.env*` is ignored by Git except the explicitly allowed `.env.example`.
  Filename and ignore-rule checks found only `.env.example` at the repository
  root; no real environment secret was opened or required. Source searches
  found no application `process.env`, `NEXT_PUBLIC_*`, external `fetch`,
  dynamic HTML injection, or `eval` use. Playwright uses `process.env.CI` for
  test-runner settings only.
- Browser-persisted structured data is schema-validated before use; malformed
  traceability storage is surfaced rather than silently trusted. These
  browser-only controls are not a substitute for server-side security.
- `npm audit` reported 12 development-tree advisories: 2 low and 10 moderate.
  The reported vulnerable paths include `deepmerge` via the shadcn CLI and
  `minimatch` via shadcn/ts-morph and ESLint tooling. `npm audit --omit=dev`
  reported zero production advisories. The audit's proposed fix requires
  `npm audit fix --force` and a breaking `shadcn@1.0.0` upgrade; a dry run
  showed no non-breaking remediation, so no forced upgrade was applied.
- npm also warned that ESLint `9.39.5` is deprecated and that install scripts
  for `esbuild` and `fsevents` are not covered by the local npm install-script
  allowlist. The clean install, lint, build, and tests still completed. These
  warnings are not hidden; review and upgrade dependencies in a dedicated,
  compatibility-tested change.
- Automated axe-core checks reported no WCAG 2.1 A/AA violations on the nine
  core routes and checked dialog/sheet states. Playwright also checks visible
  keyboard focus, Escape behavior and QR-trigger focus restoration, labeled
  controls, an invalid stock input error, and mobile navigation. This is not a
  manual screen-reader audit or accessibility certification.

## Validation performed

All commands below were run on the current checkout after a clean install.

| Command                         | Observed result                                                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                        | Passed; 662 packages added, 669 audited. npm reported 12 advisories and the install-script warnings listed above.                                                                                                          |
| `npm run typecheck`             | Passed.                                                                                                                                                                                                                    |
| `npm run lint`                  | Passed.                                                                                                                                                                                                                    |
| `npm run test`                  | Passed: 25 tests, 0 failures.                                                                                                                                                                                              |
| `npm run build`                 | Passed on Next.js 16.4.6; 18 pages generated, including partial prerendering for query-dependent pages.                                                                                                                    |
| `npm run test:e2e`              | Passed: 8 Playwright tests, 0 failures. Includes location filtering, inventory and anomaly persistence, batch/QR navigation, search, valid/invalid monitoring links, 390px layouts, browser-console checks, and axe scans. |
| Targeted `npx prettier --check` | Passed for changed code, config, and documentation.                                                                                                                                                                        |
| `npm audit`                     | 12 findings: 2 low, 10 moderate; all in the development dependency tree.                                                                                                                                                   |
| `npm audit --omit=dev`          | Passed: 0 production advisories.                                                                                                                                                                                           |

## Run locally

Use Node.js 22.x and npm:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. To reproduce the production checks:

```bash
npm run typecheck
npm run lint
npm run test
npx playwright install chromium
npm run build
npm run test:e2e
```

See [README.md](../README.md) for product and calculation summaries and
[docs/deployment-guide.md](./deployment-guide.md) for deployment steps. Vercel
is a suitable future host; no deployment, account connection, or publication
has occurred.

## Interview demo

Use the 3–5 minute narration and fallback notes in
[docs/demo-script.md](./demo-script.md). The path is: introduce the problem
hypothesis; show Overview; adjust a forecast; inspect and change inventory;
filter and investigate a shipment anomaly; open a batch and verify its local
hash chain; then explain the synthetic-data and integration limitations.
Describe outcomes as product hypotheses and deterministic demonstrations, not
validated operational impact.

## Known limitations and next opportunities

- The full test suite was run on local Node.js 26.13.1; the Node.js 22.x CI
  workflow is configured but has not yet been observed in a hosted CI run.
- Unknown batch requests render the correct not-found content and `noindex`,
  but may return HTTP 200 after streaming starts.
- Automated accessibility scans and browser flows do not replace manual
  assistive-technology testing or real-user research.
- Synthetic data cannot establish forecast accuracy, detection precision or
  recall, financial benefit, food-safety suitability, or operational value.
- Product strategy, metrics, experiment plans, and the case study are
  explicitly proposals; no user research or experiment outcomes are claimed.
- Future work should begin with authorized real-user discovery and governed,
  de-identified operational data; define ground-truth labels and evaluate
  detection precision/recall; then assess shared persistence, authentication,
  data lineage, security, and operational integration requirements. Consider
  live AI, carrier/sensor feeds, or blockchain only after validated user needs
  and trust requirements justify them.
