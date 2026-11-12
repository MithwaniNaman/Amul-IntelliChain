"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { supplyChainBatches } from "@/data/batches";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import { AddEventDialog } from "@/components/traceability/add-event-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBatchHistory,
  getBatchLifecycleStatus,
  verifyBatchHistory,
  eventTypeLabels,
} from "@/lib/traceability/engine";
import {
  getTraceabilitySnapshot,
  type TraceabilitySnapshot,
} from "@/lib/traceability/store";
import type { BatchEventType } from "@/types";

const lifecycle: BatchEventType[] = [
  "PROCUREMENT",
  "QUALITY_INSPECTION",
  "COLLECTION",
  "CHILLING",
  "PROCESSING",
  "PACKAGING",
  "DISPATCH",
  "CUSTODY_TRANSFER",
  "DELIVERY",
];

export function BatchDetailWorkspace({ batchId }: { batchId: string }) {
  const [snapshot, setSnapshot] = useState<TraceabilitySnapshot | null>(null);
  const [verification, setVerification] = useState<{
    snapshot: TraceabilitySnapshot;
    verified: boolean;
    reason: string | null;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const batch = supplyChainBatches.find((item) => item.batchId === batchId);
  const history = useMemo(
    () =>
      snapshot && batch ? getBatchHistory(snapshot.events, batch.batchId) : [],
    [snapshot, batch],
  );
  const product =
    batch && products.find((item) => item.productId === batch.productId);
  const locationName = (id: string) =>
    locations.find((location) => location.locationId === id)?.name ?? id;
  const inspection = snapshot?.inspections
    .filter((item) => item.batchId === batchId)
    .at(-1);
  const eventByType = (type: BatchEventType) =>
    history.find((event) => event.eventType === type);
  const currentStageIndex = history.reduce(
    (index, event) => Math.max(index, lifecycle.indexOf(event.eventType)),
    -1,
  );
  const currentVerification =
    snapshot && verification?.snapshot === snapshot ? verification : null;
  const verificationState = !snapshot
    ? "pending"
    : !currentVerification
      ? "pending"
      : currentVerification.verified
        ? "verified"
        : "failed";
  const verified = verificationState === "verified";

  useEffect(() => {
    let active = true;
    void getTraceabilitySnapshot().then((result) => {
      if (active) setSnapshot(result);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!snapshot || !batch) return;
    let active = true;
    void verifyBatchHistory(history, batch.batchId)
      .then((result) => {
        if (active) {
          setVerification({
            snapshot,
            verified: result.verified,
            reason: result.reason,
          });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setVerification({
            snapshot,
            verified: false,
            reason:
              error instanceof Error
                ? error.message
                : "The local integrity check could not be completed.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [snapshot, batch, history]);

  async function verifyNow() {
    if (!batch || !snapshot) return;
    setChecking(true);
    try {
      const result = await verifyBatchHistory(history, batch.batchId);
      setVerification({
        snapshot,
        verified: result.verified,
        reason: result.reason,
      });
    } catch (error) {
      setVerification({
        snapshot,
        verified: false,
        reason:
          error instanceof Error
            ? error.message
            : "The local integrity check could not be completed.",
      });
    } finally {
      setChecking(false);
    }
  }

  if (!batch || !product) {
    return (
      <Card>
        <CardContent className="p-6">
          <h1 className="text-xl font-semibold">Batch not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            The requested batch ID is not in the synthetic registry.
          </p>
          <Button asChild className="mt-4">
            <Link href="/traceability">Back to registry</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const collection = locationName(batch.collectionCentreId);
  const processing = locationName(batch.processingFacilityId);
  const distribution = locationName(batch.distributionHubId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/traceability"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-700"
      >
        <ArrowLeft className="size-4" />
        Back to batch registry
      </Link>
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-red-200 bg-red-50 text-red-700"
          >
            Simulated public-safe batch view
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {batch.batchId}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {product.name} · {batch.quantity.toLocaleString()} {product.unit} ·
            Created {new Date(batch.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setEventOpen(true)}
            disabled={!snapshot || Boolean(snapshot.error)}
          >
            Add event
          </Button>
          <Button
            onClick={() => void verifyNow()}
            disabled={!snapshot || checking}
          >
            <ShieldCheck className="size-4" />
            {checking ? "Verifying…" : "Verify batch integrity"}
          </Button>
        </div>
      </header>

      {snapshot?.error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          {snapshot.error}
        </div>
      )}

      <div
        className={`flex items-start gap-3 rounded-xl border p-4 ${
          verified
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : verificationState === "failed"
              ? "border-rose-200 bg-rose-50 text-rose-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
        }`}
        aria-live="polite"
      >
        {verified ? (
          <ShieldCheck className="mt-0.5 size-5 shrink-0" />
        ) : verificationState === "pending" ? (
          <Clock3 className="mt-0.5 size-5 shrink-0" />
        ) : (
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
        )}
        <div>
          <p className="font-semibold">
            {verified
              ? "VERIFIED — recorded chain is internally consistent"
              : verificationState === "pending"
                ? "VERIFICATION PENDING"
                : "INTEGRITY CHECK FAILED"}
          </p>
          <p className="mt-1 text-sm">
            {verified
              ? "Every event hash, batch association, timestamp order, and previous-hash link passed recalculation."
              : (currentVerification?.reason ??
                (snapshot
                  ? "Checking the locally retained event history…"
                  : "Loading event history…"))}{" "}
            This local hash chain is not a blockchain and cannot prove that
            physical-world information is truthful.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Product journey</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-0 border-l border-slate-200 pl-6">
              {lifecycle.map((type, index) => {
                const event = eventByType(type);
                const state =
                  index < currentStageIndex
                    ? "complete"
                    : index === currentStageIndex
                      ? "current"
                      : "pending";
                const Icon =
                  state === "complete"
                    ? CheckCircle2
                    : state === "current"
                      ? Clock3
                      : Circle;
                return (
                  <li key={type} className="relative pb-6 last:pb-0">
                    <span
                      className={`absolute -left-[33px] flex size-4 items-center justify-center rounded-full ${state === "complete" ? "bg-emerald-100 text-emerald-700" : state === "current" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      <Icon className="size-3" />
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {eventTypeLabels[type]}
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {state}
                      </Badge>
                    </div>
                    {event ? (
                      <div className="mt-1 space-y-1 text-xs text-slate-500">
                        <p>
                          {new Date(event.timestamp).toLocaleString()} ·{" "}
                          {locationName(event.locationId)} · {event.actorRole}
                        </p>
                        <p>{event.description}</p>
                        <p className="font-mono text-[10px] break-all">
                          SHA-256 · {event.eventHash}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-600">
                        No event recorded yet.
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Batch overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Info
                label="Current stage"
                value={getBatchLifecycleStatus(
                  snapshot?.events ?? [],
                  batch.batchId,
                  batch.currentStatus,
                ).replaceAll("-", " ")}
              />
              <Info label="Collection location" value={collection} />
              <Info label="Processing facility" value={processing} />
              <Info label="Distribution destination" value={distribution} />
              <Info
                label="Packaging date"
                value={
                  eventByType("PACKAGING")
                    ? new Date(
                        eventByType("PACKAGING")!.timestamp,
                      ).toLocaleDateString()
                    : "Pending"
                }
              />
              <Info
                label="Delivery status"
                value={
                  eventByType("DELIVERY")
                    ? "Delivered (simulated)"
                    : "Not yet delivered"
                }
              />
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-medium text-slate-500">
                  Latest quality inspection
                </p>
                {inspection ? (
                  <p className="mt-1 text-slate-700">
                    {inspection.qualityStatus.toUpperCase()} ·{" "}
                    {inspection.temperature}°C · Fat {inspection.fatPercentage}%
                    · SNF {inspection.snfPercentage}%
                  </p>
                ) : (
                  <p className="mt-1 text-slate-500">No inspection recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Public-safe summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                This demonstration view contains product journey, synthetic
                quality values, facility names, and integrity status only.
              </p>
              <p>
                All records are simulated. No named employees, credentials,
                commercial source documents, or live transaction details are
                used.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Event hash ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Event ID",
                    "Timestamp",
                    "Event type",
                    "Previous hash",
                    "Current hash",
                    "Integrity",
                  ].map((item) => (
                    <th key={item} className="px-3 py-3 font-medium">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((event) => (
                  <tr key={event.eventId} className="align-top">
                    <td className="px-3 py-3 font-mono">
                      {event.eventId}
                      <details className="mt-2 max-w-56">
                        <summary className="cursor-pointer font-sans text-red-700">
                          Inspect event metadata
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-[10px]">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                        <p className="mt-2 text-slate-600">
                          {event.description}
                        </p>
                      </details>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {eventTypeLabels[event.eventType]}
                    </td>
                    <td className="max-w-40 px-3 py-3 font-mono text-[10px] break-all">
                      {event.previousHash}
                    </td>
                    <td className="max-w-40 px-3 py-3 font-mono text-[10px] break-all">
                      {event.eventHash}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          verified
                            ? "text-emerald-700"
                            : verificationState === "pending"
                              ? "text-amber-700"
                              : "text-rose-700"
                        }
                      >
                        {verified
                          ? "Verified"
                          : verificationState === "pending"
                            ? "Checking"
                            : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!history.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      {snapshot
                        ? "No events recorded for this batch."
                        : "Loading ledger…"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs leading-relaxed text-slate-500">
        A valid chain detects modifications to retained records and broken
        links. A purely local hash chain has no independent consensus or
        external checkpoint, so it cannot prove the truth of events or reliably
        detect removal of the final event.
      </p>
      <AddEventDialog
        batches={supplyChainBatches}
        defaultBatchId={batch.batchId}
        open={eventOpen}
        onOpenChange={setEventOpen}
        onSaved={setSnapshot}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800 capitalize">
        {value}
      </span>
    </div>
  );
}
