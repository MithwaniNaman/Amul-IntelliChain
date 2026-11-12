import { z } from "zod";

import { inventoryRecords } from "@/data/inventory";
import { products } from "@/data/products";
import type { InventoryRecord, StoredActivity } from "@/types";

const STORAGE_KEY = "amul-intellichain-phase2-workspace-v1";

const inventorySchema = z.object({
  inventoryId: z.string(),
  productId: z.string(),
  locationId: z.string(),
  currentStock: z.number().finite().nonnegative(),
  dailyDemand: z.number().finite().positive(),
  expiryDate: z.iso.date(),
  reorderLevel: z.number().finite().nonnegative(),
});

const activitySchema = z.object({
  id: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

const persistedWorkspaceSchema = z.object({
  inventory: z.array(inventorySchema),
  activities: z.array(activitySchema),
});

export interface WorkspaceSnapshot {
  inventory: InventoryRecord[];
  activities: StoredActivity[];
  error: string | null;
}

const initialSnapshot: WorkspaceSnapshot = {
  inventory: inventoryRecords,
  activities: [],
  error: null,
};

let currentSnapshot = initialSnapshot;
let lastStorageValue: string | null | undefined;
const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function readStorage(): WorkspaceSnapshot {
  if (typeof window === "undefined") {
    return initialSnapshot;
  }

  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    if (lastStorageValue !== "__unavailable__") {
      lastStorageValue = "__unavailable__";
      currentSnapshot = {
        ...initialSnapshot,
        error: "Local storage is unavailable. Stock changes cannot be saved.",
      };
    }
    return currentSnapshot;
  }

  if (serialized === lastStorageValue) {
    return currentSnapshot;
  }
  lastStorageValue = serialized;

  if (serialized === null) {
    currentSnapshot = initialSnapshot;
    return currentSnapshot;
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(serialized);
  } catch {
    currentSnapshot = {
      ...initialSnapshot,
      error:
        "Saved inventory data is invalid JSON. Clear the saved demo data to continue.",
    };
    return currentSnapshot;
  }

  const parsed = persistedWorkspaceSchema.safeParse(decoded);
  if (!parsed.success) {
    currentSnapshot = {
      ...initialSnapshot,
      error:
        "Saved inventory data has an invalid shape. Clear the saved demo data to continue.",
    };
    return currentSnapshot;
  }

  currentSnapshot = { ...parsed.data, error: null };
  return currentSnapshot;
}

export function getWorkspaceSnapshot(): WorkspaceSnapshot {
  return readStorage();
}

export function getWorkspaceServerSnapshot(): WorkspaceSnapshot {
  return initialSnapshot;
}

export function subscribeToWorkspace(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = () => {
    lastStorageValue = undefined;
    emitChange();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function persist(snapshot: WorkspaceSnapshot): void {
  if (snapshot.error) {
    throw new Error(snapshot.error);
  }

  const serialized = JSON.stringify({
    inventory: snapshot.inventory,
    activities: snapshot.activities,
  });
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    throw new Error("Unable to save the stock adjustment in local storage.");
  }

  currentSnapshot = snapshot;
  lastStorageValue = serialized;
  emitChange();
}

export function updateInventoryStock(
  inventoryId: string,
  currentStock: number,
): void {
  if (!Number.isFinite(currentStock) || currentStock < 0) {
    throw new RangeError("Stock must be a non-negative number.");
  }

  const snapshot = readStorage();
  const record = snapshot.inventory.find(
    (item) => item.inventoryId === inventoryId,
  );
  if (!record) {
    throw new Error("The selected inventory record no longer exists.");
  }

  const productName =
    products.find((product) => product.productId === record.productId)?.name ??
    record.productId;
  const previousStock = record.currentStock;
  const timestamp = new Date().toISOString();
  const nextActivity: StoredActivity = {
    id: `${Date.now()}-${inventoryId}`,
    message: `Stock adjusted for ${productName}: ${previousStock.toLocaleString()} → ${currentStock.toLocaleString()}`,
    timestamp,
  };

  persist({
    inventory: snapshot.inventory.map((item) =>
      item.inventoryId === inventoryId ? { ...item, currentStock } : item,
    ),
    activities: [nextActivity, ...snapshot.activities].slice(0, 20),
    error: null,
  });
}

export function resetWorkspaceDemoData(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    throw new Error("Unable to clear the saved demo data.");
  }
  currentSnapshot = initialSnapshot;
  lastStorageValue = null;
  emitChange();
}
