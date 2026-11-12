# Traceability architecture decision

## Decision and scope

Use an off-chain synthetic data model with a locally persisted, per-batch SHA-256
hash chain for event integrity demonstrations. Product, batch, facility,
quality-inspection, actor-role, descriptions, and event metadata remain
off-chain. Each ledger event includes only its identifiers and descriptive
fields plus its previous and current hashes.

This design is intentionally a local prototype, not a blockchain. It has no
consensus, distributed replicas, wallet, signing keys, RPC endpoint, smart
contract, independent timestamp authority, or external trust anchor. A valid
hash chain shows only that retained data is internally consistent with its
stored links; it does not prove that a physical event or measurement happened.

## Data model

- `SupplyChainBatch` retains the six demonstration batch IDs and adds stable
  collection-centre, processing-facility, and distribution-hub location IDs.
- `BatchEvent` stores event ID, batch ID, one of the supported lifecycle event
  types, timestamp, location ID, generic actor role, description, JSON-like
  metadata, previous hash, and calculated event hash.
- `QualityInspection` is an off-chain record linked to a batch and inspection
  event. It contains synthetic temperature, fat, SNF, outcome, role, and
  remarks.
- Demo events and inspections are deterministic synthetic fixtures. Events
  are grouped into independent chains per batch; event order is chronological.

## Hashing and canonical serialization

`src/lib/traceability/hash.ts` recursively sorts object keys, preserves array
order, omits undefined object values, and serializes the result as compact JSON.
The hash payload explicitly includes `eventId`, `batchId`, `eventType`,
`timestamp`, `locationId`, `actorRole`, `description`, `metadata`, and
`previousHash`; `eventHash` itself is excluded. `TextEncoder` converts the
canonical UTF-8 bytes and the Web Crypto API computes SHA-256, represented as
lowercase hexadecimal.

The first event references a defined 64-zero genesis hash. Each next event
references the prior event's calculated hash. The append operation rejects
non-chronological timestamps and refuses to extend an invalid existing chain.
Corrections are represented as new events; existing records are not silently
edited.

## Verification

Verification walks the supplied history in stored order. It checks expected
batch association, unique event IDs, parseable chronological timestamps, the
genesis and previous-hash links, and a fresh SHA-256 hash for every event.
Failures include the affected event and a reason; the UI presents the failure
instead of displaying a success-shaped fallback.

Deleting or reordering an interior event, changing hashed content, changing a
batch association, or breaking a previous-hash link is detectable. Without an
external checkpoint, a party able to rewrite the complete local history can
recalculate it; removing a terminal suffix (including only the last event)
cannot be proven from the remaining chain alone. A trusted server, signature,
independent checkpoint, or replicated ledger would be needed to address that.

## Persistence and QR lookup

Events, quality inspections, and traceability activity entries use the
`amul-intellichain-traceability-v1` localStorage namespace, separate from the
Phase 2 inventory workspace. Zod validates the stored record shape before it
is used. Invalid data is not trusted; the UI reports an error and offers a
reset to the six seed batches. Local storage is device/browser-specific and is
not an authorization or audit boundary.

The installed `qrcode.react` package renders a QR code pointing to the current
origin plus `/traceability/[batchId]`. The detail route displays only
demonstration product, facility, generic role, synthetic quality, event, and
hash information. QR image download is SVG. No employee identity, credential,
or real commercial data is included.

## Security and integrity limitations

- A hash chain is tamper-evident only relative to the copy being checked; it
  does not prevent edits or establish who created an event.
- Browser localStorage can be edited, cleared, or replaced by its user.
- There is no authentication, authorization, privacy boundary, encryption,
  signing key, retention guarantee, or independent timestamp source.
- Hash validity is not source-data truth. Synthetic readings must not be used
  for quality, compliance, or procurement decisions.
- Do not put credentials, personal information, or confidential business
  records in the demo metadata.

## Future integration options

Only after user, trust, and data-governance requirements are validated, compare
a signed centralized append-only service, a permissioned ledger, and an EVM
network. Define identity, correction, privacy, retention, throughput, cost,
availability, and verification requirements first. Keep sensitive details
off-chain and consider anchoring only approved event hashes or commitments.
Solidity/Hardhat, wallets, RPC services, and blockchain deployment are not part
of this phase.
