# Portfolio case study: Amul IntelliChain

## Summary

Amul IntelliChain is an independent conceptual product prototype for a dairy
supply-chain intelligence workspace. It explores how a planner might move
from an operational signal to its source evidence and a human-reviewed next
step. This is not an Amul-affiliated product and has no live dairy-network
integration.

## Problem hypothesis

Supply-chain planners may need to reconcile demand, inventory, shipment, and
batch records across separate workflows. A shared, explainable workspace
could help them notice exceptions, understand the underlying evidence, and
decide what to investigate next.

This is a product hypothesis drawn from the initial concept brief, not a
validated customer problem. No interviews, observed workflows, usage data, or
market evidence are represented here.

## Product approach

The prototype focuses on an end-to-end review loop:

1. Summarize simulated demand and inventory on Overview.
2. Inspect a transparent statistical forecast and its assumptions.
3. Search and adjust synthetic inventory with local persistence.
4. Detect deterministic anomalies and show rule, evidence, estimated unit
   impact, and recommendation.
5. Acknowledge or resolve a finding without modifying its source evidence.
6. Open a related shipment, forecast, inventory record, or batch.
7. Verify a locally retained batch event hash chain and inspect its QR route.

## Product and engineering trade-offs

- **Explainability before external AI:** deterministic thresholds and evidence
  are easier to inspect in a synthetic portfolio demo. No model provider or
  API key is used.
- **Local hash chain before a blockchain:** demonstrates canonical hashing,
  ordering, and tamper checks without implying a shared ledger or physical
  truth.
- **Browser storage before a backend:** keeps the demo reproducible and
  dependency-light, but provides no shared identity, authorization, or durable
  audit history.
- **Synthetic records before operational data:** permits safe iteration while
  limiting conclusions to interface and algorithm behavior.
- **No fabricated financial outcome:** product prices and confirmed loss data
  are absent, so financial exposure is unavailable.

## What can be demonstrated

- Product/location/horizon forecast selection and recalculated metrics.
- Inventory search, filters, stock adjustment, local persistence, and
  Overview/Analytics recalculation.
- Explainable rule-based anomaly filtering, detail inspection, status
  persistence, and related-record navigation.
- Synthetic shipment registry/detail and local batch-event verification.
- Responsive navigation, a cross-module search palette, and About disclosures.

## What is not demonstrated

Real forecasting accuracy, business savings, stockout reduction, food-safety
outcomes, partner adoption, transaction integrity across organizations,
production readiness, or customer value. All records and evaluated detector
counts are synthetic.

## Evaluation and next decisions

The next product step is discovery with authorized supply-chain planners,
logistics operators, and quality/traceability roles. Confirm the job,
information needed, decision rights, and data ownership before prioritizing
integrations. If the job is validated, compare rule alerts against a
chronologically held-out, domain-labeled dataset and a simple baseline. See
[product-strategy.md](./product-strategy.md),
[product-metrics.md](./product-metrics.md), and
[experimentation-plan.md](./experimentation-plan.md). The current plan is
proposed; it is not research or an experiment already completed.

## Suggested repository presentation

**Description:** `Independent dairy supply-chain intelligence concept with explainable anomalies, synthetic forecasting, local inventory workflows, and batch traceability.`

**Suggested topics:** `nextjs`, `typescript`, `supply-chain`, `dairy`,
`forecasting`, `anomaly-detection`, `product-management`, `portfolio-project`.

Do not add Amul/GCMMF affiliation claims or suggest that generated values
describe their operations.
