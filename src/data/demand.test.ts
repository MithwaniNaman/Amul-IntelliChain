import assert from "node:assert/strict";
import test from "node:test";

import {
  DEMAND_END_DATE,
  HISTORY_DAYS,
  historicalDemandRecords,
} from "./demand";
import { locations } from "./locations";
import { products } from "./products";

test("provides 180 daily observations for every product-location pair", () => {
  assert.equal(
    historicalDemandRecords.length,
    HISTORY_DAYS * products.length * locations.length,
  );
  const counts = new Map<string, number>();
  const dates = new Set<string>();

  for (const record of historicalDemandRecords) {
    const key = `${record.productId}:${record.locationId}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    dates.add(record.date);
    assert.ok(record.actualDemand > 0);
    assert.ok(record.predictedDemand > 0);
  }

  assert.equal(counts.size, products.length * locations.length);
  assert.ok([...counts.values()].every((count) => count === HISTORY_DAYS));
  assert.equal(dates.size, HISTORY_DAYS);
  assert.ok(dates.has(DEMAND_END_DATE));
});
