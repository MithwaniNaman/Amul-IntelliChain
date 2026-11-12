"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { inventoryRecords } from "@/data/inventory";
import {
  dashboardInventoryMetrics,
  getAllInventoryMetrics,
} from "@/lib/dashboard-data";
import type { InventoryMetrics } from "@/lib/inventory";
import {
  getWorkspaceServerSnapshot,
  getWorkspaceSnapshot,
  subscribeToWorkspace,
} from "@/lib/workspace-store";

interface OverviewInventoryValue {
  metrics: InventoryMetrics[];
  error: string | null;
}

const OverviewInventoryContext = createContext<OverviewInventoryValue | null>(
  null,
);

export function OverviewInventoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const workspace = useSyncExternalStore(
    subscribeToWorkspace,
    getWorkspaceSnapshot,
    getWorkspaceServerSnapshot,
  );
  const metrics = useMemo(
    () =>
      workspace.inventory === inventoryRecords
        ? dashboardInventoryMetrics
        : getAllInventoryMetrics(workspace.inventory),
    [workspace.inventory],
  );
  const value = useMemo(
    () => ({ metrics, error: workspace.error }),
    [metrics, workspace.error],
  );

  return (
    <OverviewInventoryContext.Provider value={value}>
      {children}
    </OverviewInventoryContext.Provider>
  );
}

export function useOverviewInventory(): OverviewInventoryValue {
  const value = useContext(OverviewInventoryContext);
  if (!value) {
    throw new Error(
      "Overview inventory widgets must be inside OverviewInventoryProvider.",
    );
  }
  return value;
}
