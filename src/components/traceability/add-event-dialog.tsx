"use client";

import { useState } from "react";

import { locations } from "@/data/locations";
import {
  batchEventTypes,
  type BatchEventType,
  type QualityStatus,
} from "@/types";
import type { SupplyChainBatch } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  appendBatchEvent,
  type TraceabilitySnapshot,
} from "@/lib/traceability/store";
import { eventTypeLabels } from "@/lib/traceability/engine";

export function AddEventDialog({
  batches,
  defaultBatchId,
  onOpenChange,
  onSaved,
  open,
}: {
  batches: SupplyChainBatch[];
  defaultBatchId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (snapshot: TraceabilitySnapshot) => void;
}) {
  const [batchId, setBatchId] = useState(
    defaultBatchId ?? batches[0]?.batchId ?? "",
  );
  const [eventType, setEventType] = useState<BatchEventType>("COLLECTION");
  const [locationId, setLocationId] = useState(locations[0]?.locationId ?? "");
  const [actorRole, setActorRole] = useState("Collection operator");
  const [timestamp, setTimestamp] = useState("");
  const [description, setDescription] = useState("");
  const [temperature, setTemperature] = useState("4");
  const [fatPercentage, setFatPercentage] = useState("4.2");
  const [snfPercentage, setSnfPercentage] = useState("8.6");
  const [qualityStatus, setQualityStatus] = useState<QualityStatus>("passed");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      const eventTimestamp = new Date(
        String(formData.get("timestamp")),
      ).toISOString();
      const inspectionId = `QI-${crypto.randomUUID()}`;
      const inspection =
        eventType === "QUALITY_INSPECTION"
          ? {
              inspectionId,
              batchId,
              inspectionDate: eventTimestamp,
              temperature: Number(temperature),
              fatPercentage: Number(fatPercentage),
              snfPercentage: Number(snfPercentage),
              qualityStatus,
              inspectorRole: actorRole,
              remarks,
            }
          : undefined;
      const snapshot = await appendBatchEvent(
        {
          eventId: `EVT-${crypto.randomUUID()}`,
          batchId,
          eventType,
          timestamp: eventTimestamp,
          locationId,
          actorRole,
          description: String(formData.get("description")).trim(),
          metadata: {
            simulated: true,
            source: "traceability-demo-ui",
            ...(eventType === "QUALITY_INSPECTION" ? { inspectionId } : {}),
          },
        },
        inspection,
      );
      onSaved(snapshot);
      onOpenChange(false);
      setDescription("");
      setRemarks("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save this event.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record a batch event</DialogTitle>
          <DialogDescription>
            New events append to the current hash chain. Existing events cannot
            be silently edited.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-medium text-slate-600">
            Batch
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={batchId}
              onChange={(event) => setBatchId(event.target.value)}
            >
              {batches.map((batch) => (
                <option key={batch.batchId} value={batch.batchId}>
                  {batch.batchId}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-slate-600">
            Event type
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={eventType}
              onChange={(event) =>
                setEventType(event.target.value as BatchEventType)
              }
            >
              {batchEventTypes.map((type) => (
                <option key={type} value={type}>
                  {eventTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-slate-600">
            Location
            <select
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
            >
              {locations.map((location) => (
                <option key={location.locationId} value={location.locationId}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-slate-600">
            Responsible role
            <Input
              required
              minLength={2}
              value={actorRole}
              onChange={(event) => setActorRole(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-slate-600">
            Event date and time
            <Input
              required
              type="datetime-local"
              name="timestamp"
              value={timestamp}
              onFocus={() => {
                if (!timestamp) {
                  setTimestamp(new Date().toISOString().slice(0, 16));
                }
              }}
              onChange={(event) => setTimestamp(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-slate-600 sm:col-span-2">
            Description
            <Input
              required
              minLength={3}
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe this simulated operational checkpoint"
            />
          </label>
          {eventType === "QUALITY_INSPECTION" && (
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 sm:grid-cols-2">
              <p className="text-sm font-semibold sm:col-span-2">
                Quality inspection details
              </p>
              <label className="grid gap-1.5 text-xs text-slate-600">
                Temperature (°C)
                <Input
                  required
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(event) => setTemperature(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs text-slate-600">
                Fat (%)
                <Input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={fatPercentage}
                  onChange={(event) => setFatPercentage(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs text-slate-600">
                SNF (%)
                <Input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={snfPercentage}
                  onChange={(event) => setSnfPercentage(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs text-slate-600">
                Outcome
                <select
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                  value={qualityStatus}
                  onChange={(event) =>
                    setQualityStatus(event.target.value as QualityStatus)
                  }
                >
                  <option value="passed">Passed</option>
                  <option value="review">Review</option>
                  <option value="failed">Failed</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs text-slate-600 sm:col-span-2">
                Inspector remarks
                <Input
                  required
                  minLength={2}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                />
              </label>
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700 sm:col-span-2">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Append event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
