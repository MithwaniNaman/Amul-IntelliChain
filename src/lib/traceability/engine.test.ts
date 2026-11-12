import assert from "node:assert/strict";
import test from "node:test";

import type { BatchEvent } from "@/types";

import {
  createBatchEvent,
  getBatchHistory,
  verifyBatchHistory,
} from "./engine";
import { calculateEventHash, canonicalSerialize, GENESIS_HASH } from "./hash";

function entry(
  eventId: string,
  timestamp: string,
  description = "Synthetic checkpoint",
): Omit<BatchEvent, "previousHash" | "eventHash"> {
  return {
    eventId,
    batchId: "BATCH-TEST",
    eventType: "COLLECTION",
    timestamp,
    locationId: "anand",
    actorRole: "Collection operator",
    description,
    metadata: { simulated: true, nested: { z: 2, a: 1 } },
  };
}

async function twoEvents(): Promise<BatchEvent[]> {
  const first = await createBatchEvent(
    entry("event-1", "2026-11-12T05:00:00Z"),
  );
  const second = await createBatchEvent(
    entry("event-2", "2026-11-12T06:00:00Z"),
    first.eventHash,
  );
  return [first, second];
}

test("SHA-256 hashes are deterministic and canonical serialization ignores key order", async () => {
  const event = (await twoEvents())[0];
  assert.equal(await calculateEventHash(event), event.eventHash);
  assert.equal(event.eventHash.length, 64);
  assert.equal(
    canonicalSerialize({ b: 2, a: { y: 1, x: 0 } }),
    canonicalSerialize({ a: { x: 0, y: 1 }, b: 2 }),
  );
});

test("genesis and sequential events link to the preceding hash", async () => {
  const events = await twoEvents();
  assert.equal(events[0].previousHash, GENESIS_HASH);
  assert.equal(events[1].previousHash, events[0].eventHash);
  assert.deepEqual(await verifyBatchHistory(events, "BATCH-TEST"), {
    verified: true,
    reason: null,
    eventId: null,
    verifiedCount: 2,
  });
});

test("verification detects modified contents and broken previous hashes", async () => {
  const events = await twoEvents();
  const modified = [
    { ...events[0], description: "Changed after hashing" },
    events[1],
  ];
  assert.match(
    (await verifyBatchHistory(modified, "BATCH-TEST")).reason ?? "",
    /contents/,
  );

  const broken = [events[0], { ...events[1], previousHash: GENESIS_HASH }];
  assert.match(
    (await verifyBatchHistory(broken, "BATCH-TEST")).reason ?? "",
    /genesis hash|previous-event hash/,
  );
});

test("verification detects deleted, reordered, and wrong-batch events", async () => {
  const events = await twoEvents();
  const deleted = await createBatchEvent(
    entry("event-3", "2026-11-12T07:00:00Z"),
    events[1].eventHash,
  );
  assert.equal(
    (await verifyBatchHistory([events[0], deleted], "BATCH-TEST")).verified,
    false,
  );
  assert.equal(
    (await verifyBatchHistory([...events].reverse(), "BATCH-TEST")).verified,
    false,
  );
  assert.match(
    (
      await verifyBatchHistory(
        [{ ...events[0], batchId: "OTHER" }],
        "BATCH-TEST",
      )
    ).reason ?? "",
    /different batch/,
  );
});

test("batch history retrieval preserves ledger ordering", async () => {
  const events = await twoEvents();
  const other = await createBatchEvent({
    ...entry("other-event", "2026-11-12T05:30:00Z"),
    batchId: "OTHER",
  });
  assert.deepEqual(
    getBatchHistory([events[0], other, events[1]], "BATCH-TEST"),
    events,
  );
});
