import assert from "node:assert/strict";
import test from "node:test";

import { supplyChainBatches } from "@/data/batches";

import {
  appendBatchEvent,
  getTraceabilitySnapshot,
  resetTraceabilityDemoData,
} from "./store";
import { getBatchHistory, verifyBatchHistory } from "./engine";

test("traceability data seeds six batches and persists appended events across reads", async () => {
  const previousWindow = globalThis.window;
  const storage = new Map<string, string>();
  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });

  try {
    const initial = await resetTraceabilityDemoData();
    assert.equal(supplyChainBatches.length, 6);
    assert.equal(new Set(initial.events.map((event) => event.batchId)).size, 6);

    const batch = supplyChainBatches[0];
    const appended = await appendBatchEvent({
      eventId: "test-event-append",
      batchId: batch.batchId,
      eventType: "CUSTODY_TRANSFER",
      timestamp: "2026-11-13T05:00:00.000Z",
      locationId: batch.distributionHubId,
      actorRole: "Logistics coordinator",
      description: "Synthetic custody transfer added in test.",
      metadata: { simulated: true },
    });

    const reloaded = await getTraceabilitySnapshot();
    const history = getBatchHistory(reloaded.events, batch.batchId);
    assert.equal(reloaded.error, null);
    assert.equal(history.at(-1)?.eventId, "test-event-append");
    assert.equal(appended.activities.length, 1);
    assert.equal(
      (await verifyBatchHistory(history, batch.batchId)).verified,
      true,
    );
  } finally {
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previousWindow,
      });
    }
  }
});

test("corrupted local storage is surfaced without trusting its contents", async () => {
  const previousWindow = globalThis.window;
  const fakeWindow = {
    localStorage: {
      getItem: () => "{broken",
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });
  try {
    const snapshot = await getTraceabilitySnapshot();
    assert.match(snapshot.error ?? "", /corrupted/);
    assert.equal(
      new Set(snapshot.events.map((event) => event.batchId)).size,
      6,
    );
  } finally {
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previousWindow,
      });
    }
  }
});
