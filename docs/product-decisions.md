# Product decision log

These entries summarize decisions evidenced by the owner-provided project
brief and current implementation. They are not a record of customer research.

## DEC-001 — Use a shared deterministic synthetic dataset

- **Decision:** keep typed synthetic fixtures separate from UI components and
  derive the prototype metrics from those shared records.
- **Rationale:** repeatable tests and cross-module navigation are possible
  without representing operational data as real.
- **Trade-off:** generated trends cannot establish real forecast quality or
  business impact.
- **Revisit when:** approved source data and data ownership are confirmed.

## DEC-002 — Prefer transparent statistical forecasting for the demo

- **Decision:** use moving-average baselines, visible backtest metrics, and
  model-error intervals rather than a remote forecasting service.
- **Rationale:** method and evidence are inspectable without keys or external
  services.
- **Trade-off:** the method is intentionally simple and not validated against
  actual demand.
- **Revisit when:** a representative holdout and domain-approved baseline are
  available.

## DEC-003 — Demonstrate local hash-chain integrity, not a real blockchain

- **Decision:** use canonical SHA-256 event links in browser-persisted
  synthetic records; avoid Solidity/Hardhat and network dependencies.
- **Rationale:** demonstrate append/verify behavior without claiming a
  multi-party ledger or proof of physical events.
- **Trade-off:** a local owner can alter/remove the store; there is no
  independent consensus or trust anchor.
- **Revisit when:** organizations, write permissions, privacy constraints,
  and trust requirements justify a ledger architecture.

## DEC-004 — Make anomalies deterministic and operator-reviewed

- **Decision:** separate detection, impact estimation, recommendations, and a
  future explanation-provider interface. Persist only anomaly status/activity.
- **Rationale:** evidence remains reproducible and status controls cannot
  mutate the detection result.
- **Trade-off:** thresholds and confidence indicators are prototype
  assumptions, not validated model probabilities.
- **Revisit when:** authorized labeled evaluation shows a useful workflow and
  there is a governed reason to add AI explanations.

## DEC-005 — Keep monetary exposure unavailable without prices

- **Decision:** report unit-based hypothetical quantities and leave financial
  exposure unavailable.
- **Rationale:** no verified prices or financial loss inputs exist.
- **Trade-off:** the prototype cannot estimate a business-case value.
- **Revisit when:** finance-approved prices, cost definitions, and an outcome
  baseline are available.

## DEC-006 — Use browser-local persistence for the portfolio demo

- **Decision:** persist inventory adjustments, anomaly status, and traceability
  events only in localStorage.
- **Rationale:** the demonstration needs no server, user account, or secret.
- **Trade-off:** state is device-specific, editable by the browser owner, and
  not a durable or shared audit trail.
- **Revisit when:** a validated multi-user workflow and security model justify
  a backend.
