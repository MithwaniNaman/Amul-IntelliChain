import type { BatchEvent, BatchEventType, BatchStatus } from "@/types";

import { calculateEventHash, GENESIS_HASH } from "./hash";

export type NewBatchEvent = Omit<BatchEvent, "previousHash" | "eventHash">;

export async function createBatchEvent(
  input: NewBatchEvent,
  previousHash = GENESIS_HASH,
): Promise<BatchEvent> {
  const event: BatchEvent = { ...input, previousHash, eventHash: "" };
  return { ...event, eventHash: await calculateEventHash(event) };
}

export async function buildLedger(
  entries: NewBatchEvent[],
): Promise<BatchEvent[]> {
  const previousByBatch = new Map<string, string>();
  const events: BatchEvent[] = [];

  for (const entry of entries) {
    const previousHash = previousByBatch.get(entry.batchId) ?? GENESIS_HASH;
    const event = await createBatchEvent(entry, previousHash);
    previousByBatch.set(entry.batchId, event.eventHash);
    events.push(event);
  }

  return events;
}

export function getBatchHistory(
  events: BatchEvent[],
  batchId: string,
): BatchEvent[] {
  return events.filter((event) => event.batchId === batchId);
}

export function getBatchLifecycleStatus(
  events: BatchEvent[],
  batchId: string,
  fallback: BatchStatus,
): BatchStatus {
  const lastType = getBatchHistory(events, batchId).at(-1)?.eventType;
  if (lastType === "DELIVERY") return "delivered";
  if (lastType === "DISPATCH" || lastType === "CUSTODY_TRANSFER") {
    return "in-transit";
  }
  if (lastType === "PROCESSING" || lastType === "PACKAGING") {
    return "processing";
  }
  return lastType ? "collected" : fallback;
}

export interface VerificationResult {
  verified: boolean;
  reason: string | null;
  eventId: string | null;
  verifiedCount: number;
}

export async function verifyBatchHistory(
  events: BatchEvent[],
  expectedBatchId: string,
): Promise<VerificationResult> {
  if (!events.length) {
    return {
      verified: false,
      reason: "No events were found for this batch.",
      eventId: null,
      verifiedCount: 0,
    };
  }

  const seenIds = new Set<string>();
  let previousHash = GENESIS_HASH;
  let previousTimestamp = Number.NEGATIVE_INFINITY;

  for (const event of events) {
    if (event.batchId !== expectedBatchId) {
      return {
        verified: false,
        reason: "An event is associated with a different batch.",
        eventId: event.eventId,
        verifiedCount: seenIds.size,
      };
    }
    if (seenIds.has(event.eventId)) {
      return {
        verified: false,
        reason: "Duplicate event identifiers were found.",
        eventId: event.eventId,
        verifiedCount: seenIds.size,
      };
    }
    seenIds.add(event.eventId);

    const timestamp = Date.parse(event.timestamp);
    if (!Number.isFinite(timestamp) || timestamp < previousTimestamp) {
      return {
        verified: false,
        reason: "Events are not in chronological sequence.",
        eventId: event.eventId,
        verifiedCount: seenIds.size - 1,
      };
    }
    previousTimestamp = timestamp;

    if (event.previousHash !== previousHash) {
      return {
        verified: false,
        reason:
          event.previousHash === GENESIS_HASH
            ? "A later event incorrectly references the genesis hash; an event may be missing or reordered."
            : "The previous-event hash reference is broken; an event may be missing or reordered.",
        eventId: event.eventId,
        verifiedCount: seenIds.size - 1,
      };
    }

    const recalculated = await calculateEventHash(event);
    if (recalculated !== event.eventHash) {
      return {
        verified: false,
        reason: "The event contents do not match its stored SHA-256 hash.",
        eventId: event.eventId,
        verifiedCount: seenIds.size - 1,
      };
    }
    previousHash = event.eventHash;
  }

  return {
    verified: true,
    reason: null,
    eventId: null,
    verifiedCount: events.length,
  };
}

export const eventTypeLabels: Record<BatchEventType, string> = {
  PROCUREMENT: "Milk procurement",
  QUALITY_INSPECTION: "Quality inspection",
  COLLECTION: "Collection",
  CHILLING: "Chilling",
  PROCESSING: "Processing",
  PACKAGING: "Packaging",
  DISPATCH: "Dispatch",
  CUSTODY_TRANSFER: "Custody transfer",
  DELIVERY: "Delivery",
};
