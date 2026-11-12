import type { BatchEvent } from "@/types";

export const GENESIS_HASH = "0".repeat(64);

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, normalize(entry)]),
    );
  }
  return value;
}

export function canonicalSerialize(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function canonicalEventPayload(
  event: BatchEvent,
): Omit<BatchEvent, "eventHash"> {
  return {
    eventId: event.eventId,
    batchId: event.batchId,
    eventType: event.eventType,
    timestamp: event.timestamp,
    locationId: event.locationId,
    actorRole: event.actorRole,
    description: event.description,
    metadata: event.metadata,
    previousHash: event.previousHash,
  };
}

export async function calculateEventHash(event: BatchEvent): Promise<string> {
  const bytes = new TextEncoder().encode(
    canonicalSerialize(canonicalEventPayload(event)),
  );
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
