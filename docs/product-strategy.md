# Product strategy (proposed hypotheses)

## Product intent

Explore whether a role-oriented workspace can help dairy supply-chain
operations review a planning or fulfillment exception using demand, inventory,
shipment, and batch context. The current prototype demonstrates a technical
workflow only; it does not validate the need or business outcome.

## Provisional users and jobs

These are segments from the concept brief, not validated personas.

- **Demand planner:** compare recent demand with a short-horizon forecast and
  decide what requires review.
- **Inventory planner:** identify a product/location with limited cover or
  approaching expiry and investigate replenishment options.
- **Logistics operator:** review a shipment status exception and locate its
  relevant records.
- **Quality/traceability operator:** inspect a batch's sample observations
  and lifecycle evidence before deciding whether to escalate.

## Problem framing

**Hypothesis:** fragmented operational context may make exception review
slower or less consistent. A useful first product should surface the rule,
source observation, uncertainty/limitations, affected record, and proposed
human action together.

**Unknowns:** frequency and cost of these tasks; existing tools and workarounds;
who owns data and decisions; which signals are actionable; how alerts should
be prioritized; and what audit or retention requirements apply.

## Strategy sequence

1. **Discover:** interview representative users and map one decision workflow.
2. **Validate data feasibility:** confirm authorized identifiers, event
   timeliness, source quality, and data-sharing rights.
3. **Evaluate a narrow signal:** compare a simple baseline with expert labels
   on chronologically held-out data in shadow mode.
4. **Prototype operator review:** measure comprehension, actionability, and
   task completion before automating any action.
5. **Decide on integrations:** add storage, identity, AI explanations, or a
   ledger only when validated workflow requirements justify their risks and
   costs.

## Scope boundaries

Current scope: deterministic prototype, synthetic fixtures, browser-local
workflow state, transparent estimates, and navigable demo records.

Explicit non-goals: autonomous procurement, stock release/hold, real food
safety disposition, carrier dispatch, external AI inference, a production
blockchain, customer or revenue analytics, and multi-user operations.

## Prioritization method

No numeric RICE score is presented because reach, impact, confidence, and
effort are unmeasured. Use a qualitative decision sequence: user-validated
importance, data readiness, safety/privacy risk, measurable testability, and
implementation effort. Record assumptions and revisit order after discovery.

## Evidence bar

Treat every operational figure in this project as generated data. Do not
convert demo alert counts or forecast metrics into customer outcomes. A product
direction should be revisited if user interviews do not confirm the workflow,
the necessary data cannot be authorized, or shadow evaluation shows an
unacceptable alert burden.
