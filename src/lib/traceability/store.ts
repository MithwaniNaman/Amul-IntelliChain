import { z } from "zod";

import { supplyChainBatches } from "@/data/batches";
import { qualityInspections } from "@/data/quality-inspections";
import { batchEventTypes } from "@/types";
import type { BatchEvent, QualityInspection, StoredActivity } from "@/types";

import {
  createBatchEvent,
  getBatchHistory,
  verifyBatchHistory,
} from "./engine";
import { GENESIS_HASH } from "./hash";
import { createDemoLedger } from "./demo";

const STORAGE_KEY = "amul-intellichain-traceability-v1";
const timestampSchema = z
  .string()
  .refine((value) => Number.isFinite(Date.parse(value)));
const qualityInspectionSchema = z.object({
  inspectionId: z.string().min(1),
  batchId: z.string().min(1),
  inspectionDate: timestampSchema,
  temperature: z.number().finite(),
  fatPercentage: z.number().finite().min(0).max(100),
  snfPercentage: z.number().finite().min(0).max(100),
  qualityStatus: z.enum(["passed", "review", "failed"]),
  inspectorRole: z.string().min(1),
  remarks: z.string(),
});
const batchEventSchema = z.object({
  eventId: z.string().min(1),
  batchId: z.string().min(1),
  eventType: z.enum(batchEventTypes),
  timestamp: timestampSchema,
  locationId: z.string().min(1),
  actorRole: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()),
  previousHash: z.string().regex(/^[a-f0-9]{64}$/),
  eventHash: z.string().regex(/^[a-f0-9]{64}$/),
});
const storedActivitySchema = z.object({
  id: z.string().min(1),
  message: z.string(),
  timestamp: timestampSchema,
});
const snapshotSchema = z.object({
  events: z.array(batchEventSchema),
  inspections: z.array(qualityInspectionSchema),
  activities: z.array(storedActivitySchema),
});

export interface TraceabilitySnapshot {
  events: BatchEvent[];
  inspections: QualityInspection[];
  activities: StoredActivity[];
  error: string | null;
}

async function demoSnapshot(
  error: string | null = null,
): Promise<TraceabilitySnapshot> {
  return {
    events: await createDemoLedger(),
    inspections: qualityInspections,
    activities: [],
    error,
  };
}

function persist(snapshot: TraceabilitySnapshot): void {
  const serialized = JSON.stringify({
    events: snapshot.events,
    inspections: snapshot.inspections,
    activities: snapshot.activities,
  });
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    throw new Error("Unable to save the traceability ledger in local storage.");
  }
}

export async function getTraceabilitySnapshot(): Promise<TraceabilitySnapshot> {
  if (typeof window === "undefined") return demoSnapshot();
  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return demoSnapshot(
      "Local storage is unavailable; ledger changes cannot be saved.",
    );
  }
  if (serialized === null) {
    const initial = await demoSnapshot();
    try {
      persist(initial);
    } catch (error) {
      return {
        ...initial,
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize the traceability ledger.",
      };
    }
    return initial;
  }

  try {
    const decoded: unknown = JSON.parse(serialized);
    const parsed = snapshotSchema.safeParse(decoded);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.length ? issue.path.join(".") : "root";
      return demoSnapshot(
        `Saved traceability data is invalid at ${field}. Reset to demo data before continuing.`,
      );
    }
    const knownBatchIds = new Set(
      supplyChainBatches.map((batch) => batch.batchId),
    );
    if (parsed.data.events.some((event) => !knownBatchIds.has(event.batchId))) {
      return demoSnapshot(
        "Saved traceability data refers to an unknown batch. Reset to demo data before continuing.",
      );
    }
    return { ...parsed.data, error: null };
  } catch {
    return demoSnapshot(
      "Saved traceability data is corrupted. Reset to demo data before continuing.",
    );
  }
}

export async function appendBatchEvent(
  input: Omit<BatchEvent, "previousHash" | "eventHash">,
  inspection?: QualityInspection,
): Promise<TraceabilitySnapshot> {
  const snapshot = await getTraceabilitySnapshot();
  if (snapshot.error) throw new Error(snapshot.error);
  if (!supplyChainBatches.some((batch) => batch.batchId === input.batchId)) {
    throw new Error("Select an existing batch before adding an event.");
  }
  const history = getBatchHistory(snapshot.events, input.batchId);
  const verification = await verifyBatchHistory(history, input.batchId);
  if (!verification.verified) {
    throw new Error(
      `Cannot append to an unverified history: ${verification.reason}`,
    );
  }
  const previous = history.at(-1);
  if (
    previous &&
    Date.parse(input.timestamp) <= Date.parse(previous.timestamp)
  ) {
    throw new Error(
      "New events must be later than the last event in the batch history.",
    );
  }
  if (snapshot.events.some((event) => event.eventId === input.eventId)) {
    throw new Error("Event identifiers must be unique.");
  }

  const event = await createBatchEvent(
    input,
    previous?.eventHash ?? GENESIS_HASH,
  );
  const validatedEvent = batchEventSchema.parse(event);
  let inspections = snapshot.inspections;
  if (input.eventType === "QUALITY_INSPECTION") {
    if (!inspection)
      throw new Error(
        "Quality inspection details are required for this event.",
      );
    const validatedInspection = qualityInspectionSchema.parse(inspection);
    if (validatedInspection.batchId !== input.batchId) {
      throw new Error("Inspection and event must belong to the same batch.");
    }
    inspections = [
      ...inspections.filter(
        (item) => item.inspectionId !== validatedInspection.inspectionId,
      ),
      validatedInspection,
    ];
  } else if (inspection) {
    throw new Error(
      "Inspection details are only valid for a quality inspection event.",
    );
  }

  const next: TraceabilitySnapshot = {
    events: [...snapshot.events, validatedEvent],
    inspections,
    activities: [
      {
        id: `trace-${event.eventId}`,
        message: `${input.eventType.replaceAll("_", " ")} recorded for ${input.batchId}`,
        timestamp: input.timestamp,
      },
      ...snapshot.activities,
    ].slice(0, 40),
    error: null,
  };
  persist(next);
  return next;
}

export async function resetTraceabilityDemoData(): Promise<TraceabilitySnapshot> {
  if (typeof window === "undefined")
    throw new Error("Reset is only available in a browser.");
  const initial = await demoSnapshot();
  persist(initial);
  return initial;
}
