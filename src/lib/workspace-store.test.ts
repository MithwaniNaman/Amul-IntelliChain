import assert from "node:assert/strict";
import test from "node:test";

import { inventoryRecords } from "@/data/inventory";
import {
  getWorkspaceSnapshot,
  resetWorkspaceDemoData,
  updateInventoryStock,
} from "./workspace-store";

test("stock adjustments persist locally and reset to the original synthetic data", () => {
  const previousWindow = globalThis.window;
  const storage = new Map<string, string>();
  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });

  try {
    const original = inventoryRecords[0];
    updateInventoryStock(original.inventoryId, original.currentStock + 25);

    const updated = getWorkspaceSnapshot();
    assert.equal(updated.inventory[0].currentStock, original.currentStock + 25);
    assert.equal(updated.activities.length, 1);
    assert.match(updated.activities[0].message, /Full Cream Milk/);

    resetWorkspaceDemoData();
    assert.equal(storage.size, 0);
    assert.equal(
      getWorkspaceSnapshot().inventory[0].currentStock,
      original.currentStock,
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
