import { z } from "zod";

import type { AnomalyStatus, OperationalAnomaly } from "@/types";

const STORAGE_KEY = "amul-intellichain-intelligence-v1";
const timestampSchema = z.iso.datetime({ offset: true });

const workflowEntrySchema = z.object({
  status: z.enum(["Acknowledged", "Resolved"]),
  updatedAt: timestampSchema,
});
const workflowActivitySchema = z.object({
  id: z.string().min(1),
  anomalyId: z.string().min(1),
  message: z.string().min(1),
  timestamp: timestampSchema,
});
const persistedWorkflowSchema = z.object({
  statuses: z.record(z.string(), workflowEntrySchema),
  activities: z.array(workflowActivitySchema).max(100),
});

export interface AnomalyWorkflowActivity {
  id: string;
  anomalyId: string;
  message: string;
  timestamp: string;
}

export interface AnomalyWorkflowSnapshot {
  statuses: Record<
    string,
    { status: "Acknowledged" | "Resolved"; updatedAt: string }
  >;
  activities: AnomalyWorkflowActivity[];
  error: string | null;
}

const emptySnapshot: AnomalyWorkflowSnapshot = {
  statuses: {},
  activities: [],
  error: null,
};

let currentSnapshot = emptySnapshot;
let lastStorageValue: string | null | undefined;
const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function readSnapshot(): AnomalyWorkflowSnapshot {
  if (typeof window === "undefined") return emptySnapshot;
  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    if (lastStorageValue !== "__unavailable__") {
      lastStorageValue = "__unavailable__";
      currentSnapshot = {
        ...emptySnapshot,
        error:
          "Local storage is unavailable; anomaly status changes cannot be saved.",
      };
    }
    return currentSnapshot;
  }
  if (serialized === lastStorageValue) return currentSnapshot;
  lastStorageValue = serialized;
  if (serialized === null) {
    currentSnapshot = emptySnapshot;
    return currentSnapshot;
  }

  try {
    const parsed = persistedWorkflowSchema.safeParse(JSON.parse(serialized));
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path.join(".") || "root";
      currentSnapshot = {
        ...emptySnapshot,
        error: `Saved anomaly workflow data is invalid at ${field}. Reset the workflow data before continuing.`,
      };
      return currentSnapshot;
    }
    currentSnapshot = { ...parsed.data, error: null };
    return currentSnapshot;
  } catch {
    currentSnapshot = {
      ...emptySnapshot,
      error:
        "Saved anomaly workflow data is corrupted. Reset the workflow data before continuing.",
    };
    return currentSnapshot;
  }
}

export function getAnomalyWorkflowSnapshot(): AnomalyWorkflowSnapshot {
  return readSnapshot();
}

export function getAnomalyWorkflowServerSnapshot(): AnomalyWorkflowSnapshot {
  return emptySnapshot;
}

export function subscribeToAnomalyWorkflow(listener: () => void): () => void {
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

function persist(snapshot: AnomalyWorkflowSnapshot): void {
  if (snapshot.error) throw new Error(snapshot.error);
  const valid = persistedWorkflowSchema.parse({
    statuses: snapshot.statuses,
    activities: snapshot.activities,
  });
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {
    throw new Error("Unable to save the anomaly workflow in local storage.");
  }
  currentSnapshot = snapshot;
  lastStorageValue = JSON.stringify(valid);
  emitChange();
}

export function setAnomalyStatus(
  anomalyId: string,
  status: Exclude<AnomalyStatus, "Open">,
  anomalies: readonly OperationalAnomaly[],
  now = new Date().toISOString(),
): AnomalyWorkflowSnapshot {
  if (typeof window === "undefined") {
    throw new Error("Anomaly status changes are only available in a browser.");
  }
  if (!anomalies.some((anomaly) => anomaly.id === anomalyId)) {
    throw new Error("The selected anomaly is no longer available.");
  }
  if (!timestampSchema.safeParse(now).success) {
    throw new RangeError(
      "Anomaly status timestamp must be a valid ISO datetime.",
    );
  }

  const snapshot = readSnapshot();
  if (snapshot.error) throw new Error(snapshot.error);
  const currentStatus = snapshot.statuses[anomalyId]?.status ?? "Open";
  if (currentStatus === status) return snapshot;
  if (currentStatus === "Resolved") {
    throw new Error(
      "Resolved anomalies cannot be changed through this workflow.",
    );
  }
  if (currentStatus === "Acknowledged" && status === "Acknowledged") {
    return snapshot;
  }
  const next: AnomalyWorkflowSnapshot = {
    statuses: {
      ...snapshot.statuses,
      [anomalyId]: { status, updatedAt: now },
    },
    activities: [
      {
        id: `${anomalyId}:${now}`,
        anomalyId,
        message: `${anomalyId} marked ${status.toLowerCase()}`,
        timestamp: now,
      },
      ...snapshot.activities,
    ].slice(0, 100),
    error: null,
  };
  persist(next);
  return next;
}

export function resetAnomalyWorkflow(): void {
  if (typeof window === "undefined") {
    throw new Error("Anomaly workflow reset is only available in a browser.");
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    throw new Error("Unable to clear the saved anomaly workflow.");
  }
  currentSnapshot = emptySnapshot;
  lastStorageValue = null;
  emitChange();
}
