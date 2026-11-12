# Interview demo script (3–5 minutes)

## Before the call

- Start with `npm ci`, then `npm run dev`, and open `http://localhost:3000`.
- Use the Overview's `SIMULATED DEMO DATA` badge as the opening disclosure.
- Optionally reset inventory, traceability, and intelligence status data to
  make the demonstration repeatable. These controls affect only local browser
  storage.
- If an interaction fails, reload the route, use the sidebar or the
  cross-module search, and return to the Overview. Do not claim a failed action
  succeeded.

## 0:00–0:30 — Frame the problem hypothesis

**Say:** “This is an independent concept exploring whether dairy supply-chain
teams could benefit from a shared view of demand, inventory risk, batch
provenance, and explainable operational signals. The user problems are
hypotheses, not research findings.”

**Show:** Overview and its simulated-data disclosure.

**Highlight:** One dashboard, multiple workflows, and shared source fixtures.

## 0:30–1:10 — Executive Overview

**Click:** Overview.

**Say:** “These are deterministic calculations from synthetic records. The
stock-risk number is a product-location ratio, not a financial KPI or a
measured business outcome.”

**Highlight:** Demand-versus-actual chart, regional risk, recent sample
activity, and the compact anomaly summary. Point out that inventory changes
saved in this browser feed the overview widgets.

**Do not claim:** Live procurement volume, verified forecast performance,
customer impact, or production alert levels.

## 1:10–1:50 — Demand Forecasting

**Click:** Demand Forecasting; select a product/location and change the
forecast horizon.

**Say:** “The model is a transparent moving-average baseline with a simple
weekday adjustment and rolling backtest. The uncertainty interval and accuracy
are calculated from generated history, not calibrated on real operations.”

**Highlight:** Historical actuals versus stored estimates, forecast horizon,
MAE/MAPE, and the input-dependent output.

## 1:50–2:30 — Inventory issue

**Click:** Inventory Intelligence; filter to critical stock or search for
`INV-full-cream-milk-anand`; open its details.

**Say:** “The record shows a synthetic days-of-cover calculation. The action
here is an illustrative stock adjustment, saved only in this browser; it
doesn't create a purchase order.”

**Highlight:** Days remaining, expiry, suggested reorder, local persistence,
and the updated risk value on Overview.

**Fallback:** If the record is filtered out, clear the filters and search its
inventory ID. Do not change data that is not part of the demo.

## 2:30–3:20 — Investigate and act on an anomaly

**Click:** Intelligence; filter the category to **Shipment delay**; inspect the
`SHP-88416` record.

**Say:** “The rule is triggered by an explicit synthetic `delayed` status.
The listed 980 cases are a potential affected quantity, not lost sales or
confirmed exposure. There are no product prices or planned/actual delivery
timestamps.”

**Highlight:** Rule ID, observed status, evidence record ID, recommendation,
financial exposure marked unavailable, and acknowledge/resolve workflow.
Open the related shipment view to show record navigation.

## 3:20–4:00 — Trace a batch

**Click:** Batch Traceability; inspect `BATCH-AN-20261112-01`; open its QR
preview and the matching detail page; run **Verify batch integrity**.

**Say:** “This recalculates a local SHA-256 event chain. It demonstrates
internal consistency of retained browser records; it is not a blockchain,
independent trust anchor, or proof that physical events occurred.”

**Highlight:** Event hashes, lifecycle events, synthetic quality values, and
the public-safe route/QR destination.

## 4:00–4:40 — Limitations and next decisions

**Say:** “Before an operational pilot, I would validate the user job with
planners and quality operators, obtain authorized timestamped data, have
domain experts label anomalies, run chronological held-out evaluation, and
start in shadow mode. I would not add an LLM or ledger until data rights,
workflow value, evaluation, and security needs are established.”

**Show:** About page and its independent-project, synthetic-data, local
persistence, and integration disclosures.

## What not to claim

- Official Amul/GCMMF affiliation or endorsement.
- Real dairy locations, customers, shipments, production data, or financial
  loss.
- A deployed AI model, a real blockchain, or proof of product authenticity.
- Validated food-safety thresholds, real forecasting accuracy, saved cost, or
  measured user/business outcomes.
- Deployment or comprehensive accessibility/security certification.

## Screenshot capture checklist

Capture real application pages only after checking the disclosure and hiding
browser-local personal information. Suggested views and viewport sizes are
listed in [screenshots/README.md](./screenshots/README.md). No screenshots are
included in this repository yet.
