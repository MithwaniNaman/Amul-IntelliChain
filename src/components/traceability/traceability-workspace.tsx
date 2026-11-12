"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Copy,
  Download,
  Fingerprint,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { supplyChainBatches } from "@/data/batches";
import { products } from "@/data/products";
import { AddEventDialog } from "@/components/traceability/add-event-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { locations } from "@/data/locations";
import {
  getBatchHistory,
  getBatchLifecycleStatus,
  verifyBatchHistory,
} from "@/lib/traceability/engine";
import {
  getTraceabilitySnapshot,
  resetTraceabilityDemoData,
  type TraceabilitySnapshot,
} from "@/lib/traceability/store";
import type { QualityStatus } from "@/types";

function qualityFor(snapshot: TraceabilitySnapshot, batchId: string) {
  return (
    snapshot.inspections
      .filter((inspection) => inspection.batchId === batchId)
      .at(-1)?.qualityStatus ?? "review"
  );
}

function StageBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className="capitalize">
      {value.replaceAll("-", " ")}
    </Badge>
  );
}

export function TraceabilityWorkspace() {
  const [snapshot, setSnapshot] = useState<TraceabilitySnapshot | null>(null);
  const [verification, setVerification] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [eventOpen, setEventOpen] = useState(false);
  const [qrBatchId, setQrBatchId] = useState<string | null>(null);
  const qrTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

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
    let active = true;
    if (!snapshot) return;
    void Promise.all(
      supplyChainBatches.map(
        async (batch) =>
          [
            batch.batchId,
            (
              await verifyBatchHistory(
                getBatchHistory(snapshot.events, batch.batchId),
                batch.batchId,
              )
            ).verified,
          ] as const,
      ),
    ).then((results) => {
      if (active) setVerification(Object.fromEntries(results));
    });
    return () => {
      active = false;
    };
  }, [snapshot]);

  const filtered = useMemo(
    () =>
      supplyChainBatches.filter((batch) => {
        const product = products.find(
          (item) => item.productId === batch.productId,
        );
        const quality = snapshot
          ? qualityFor(snapshot, batch.batchId)
          : "review";
        const status = snapshot
          ? getBatchLifecycleStatus(
              snapshot.events,
              batch.batchId,
              batch.currentStatus,
            )
          : batch.currentStatus;
        const matchesText = `${batch.batchId} ${product?.name ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return (
          matchesText &&
          (productFilter === "all" || batch.productId === productFilter) &&
          (statusFilter === "all" || status === statusFilter) &&
          (qualityFilter === "all" || quality === qualityFilter) &&
          (verificationFilter === "all" ||
            (verification[batch.batchId] ? "verified" : "failed") ===
              verificationFilter)
        );
      }),
    [
      query,
      productFilter,
      statusFilter,
      qualityFilter,
      verificationFilter,
      snapshot,
      verification,
    ],
  );

  const qrBatch = supplyChainBatches.find(
    (batch) => batch.batchId === qrBatchId,
  );
  const batchUrl =
    qrBatchId && typeof window !== "undefined"
      ? `${window.location.origin}/traceability/${encodeURIComponent(qrBatchId)}`
      : "";
  const qualityLabel = (status: QualityStatus) =>
    status === "passed" ? "Passed" : status === "failed" ? "Failed" : "Review";

  async function handleReset() {
    setBusy(true);
    try {
      setSnapshot(await resetTraceabilityDemoData());
    } catch (error) {
      setSnapshot((current) =>
        current
          ? {
              ...current,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to reset demo data.",
            }
          : current,
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(batchUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadQr() {
    const svg = document.getElementById("traceability-qr");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(
      new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${qrBatchId}-traceability.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const loaded = Boolean(snapshot);
  const verifiedCount = Object.values(verification).filter(Boolean).length;
  const attentionCount = snapshot
    ? supplyChainBatches.filter(
        (batch) =>
          qualityFor(snapshot, batch.batchId) !== "passed" ||
          verification[batch.batchId] === false,
      ).length
    : 0;
  const currentStatus = (batchId: string) => {
    const batch = supplyChainBatches.find((item) => item.batchId === batchId);
    return snapshot && batch
      ? getBatchLifecycleStatus(snapshot.events, batchId, batch.currentStatus)
      : (batch?.currentStatus ?? "collected");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-red-200 bg-red-50 text-red-700"
          >
            Simulated traceability ledger
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Batch traceability
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Explore synthetic dairy journeys and verify their local SHA-256
            event chains. This is not a blockchain or proof of physical events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void handleReset()}
            disabled={busy}
          >
            <RotateCcw className="size-4" /> Reset demo data
          </Button>
          <Button
            onClick={() => setEventOpen(true)}
            disabled={!loaded || Boolean(snapshot?.error)}
          >
            <Plus className="size-4" /> Record event
          </Button>
        </div>
      </header>

      {snapshot?.error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          {snapshot.error} Reset the demo data to continue.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            title: "Total batches",
            value: supplyChainBatches.length,
            icon: Fingerprint,
          },
          {
            title: "In transit",
            value: supplyChainBatches.filter(
              (batch) => currentStatus(batch.batchId) === "in-transit",
            ).length,
            icon: Truck,
          },
          {
            title: "Delivered",
            value: supplyChainBatches.filter(
              (batch) => currentStatus(batch.batchId) === "delivered",
            ).length,
            icon: Check,
          },
          {
            title: "Needs attention",
            value: attentionCount,
            icon: CircleAlert,
          },
          {
            title: "Verified histories",
            value: `${verifiedCount}/${loaded ? supplyChainBatches.length : "—"}`,
            icon: ShieldCheck,
          },
        ].map((item) => (
          <Card key={item.title} className="border-slate-200/80 shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-slate-500">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {loaded ? item.value : "—"}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <item.icon className="size-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Batch registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search className="absolute top-2.5 left-2.5 size-4 text-slate-600" />
              <Input
                className="pl-9"
                placeholder="Search batch or product"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search batches by ID or product"
              />
            </div>
            <select
              aria-label="Filter by product"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
            >
              <option value="all">All products</option>
              {products.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by lifecycle status"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All stages</option>
              {["collected", "processing", "in-transit", "delivered"].map(
                (stage) => (
                  <option key={stage} value={stage}>
                    {stage.replaceAll("-", " ")}
                  </option>
                ),
              )}
            </select>
            <select
              aria-label="Filter by quality status"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={qualityFilter}
              onChange={(event) => setQualityFilter(event.target.value)}
            >
              <option value="all">All quality</option>
              <option value="passed">Passed</option>
              <option value="review">Review</option>
              <option value="failed">Failed</option>
            </select>
            <select
              aria-label="Filter by verification status"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={verificationFilter}
              onChange={(event) => setVerificationFilter(event.target.value)}
            >
              <option value="all">All verification</option>
              <option value="verified">Verified</option>
              <option value="failed">Tampered / unavailable</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  {[
                    "Batch ID",
                    "Product / quantity",
                    "Collection",
                    "Processing",
                    "Current stage",
                    "Quality",
                    "Integrity",
                    "",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((batch) => {
                  const product = products.find(
                    (item) => item.productId === batch.productId,
                  );
                  const quality = snapshot
                    ? qualityFor(snapshot, batch.batchId)
                    : "review";
                  const collection = locations.find(
                    (location) =>
                      location.locationId === batch.collectionCentreId,
                  );
                  const processing = locations.find(
                    (location) =>
                      location.locationId === batch.processingFacilityId,
                  );
                  return (
                    <tr key={batch.batchId} className="hover:bg-slate-50/70">
                      <td className="px-3 py-3">
                        <Link
                          className="font-semibold text-red-700 hover:underline"
                          href={`/traceability/${encodeURIComponent(batch.batchId)}`}
                        >
                          {batch.batchId}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium text-slate-800">
                          {product?.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {batch.quantity.toLocaleString()} {product?.unit}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {collection?.name ?? batch.collectionCentre}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {processing?.name ?? batch.processingFacility}
                      </td>
                      <td className="px-3 py-3">
                        <StageBadge value={currentStatus(batch.batchId)} />
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant="outline"
                          className={
                            quality === "passed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }
                        >
                          {qualityLabel(quality)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${verification[batch.batchId] ? "text-emerald-700" : "text-amber-700"}`}
                        >
                          <ShieldCheck className="size-3.5" />
                          {verification[batch.batchId]
                            ? "Verified"
                            : loaded
                              ? "Check"
                              : "Loading"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(event) => {
                            qrTriggerRef.current = event.currentTarget;
                            setQrBatchId(batch.batchId);
                          }}
                          aria-label={`QR code for ${batch.batchId}`}
                        >
                          QR
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-10 text-center text-sm text-slate-500"
                    >
                      No batches match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            All records and measurements are synthetic. Hash-chain verification
            proves only that the locally stored event contents remain internally
            consistent.
          </p>
        </CardContent>
      </Card>

      <AddEventDialog
        batches={supplyChainBatches}
        open={eventOpen}
        onOpenChange={setEventOpen}
        onSaved={setSnapshot}
      />

      <Dialog
        open={Boolean(qrBatch)}
        onOpenChange={(open) => {
          if (!open) setQrBatchId(null);
        }}
      >
        <DialogContent
          className="max-w-sm"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            qrTriggerRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Batch QR preview</DialogTitle>
            <DialogDescription>
              Scan or download this code to open the simulated public-safe batch
              journey.
            </DialogDescription>
          </DialogHeader>
          {qrBatch && (
            <div className="grid justify-items-center gap-4">
              <div className="rounded-xl border bg-white p-4">
                <QRCodeSVG
                  id="traceability-qr"
                  value={batchUrl}
                  size={208}
                  level="M"
                  includeMargin
                  role="img"
                  aria-label={`QR code for batch ${qrBatch.batchId}`}
                />
              </div>
              <p className="text-center text-xs break-all text-slate-500">
                {batchUrl}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void copyUrl()}>
                  <Copy className="size-4" />
                  {copied ? "Copied" : "Copy URL"}
                </Button>
                <Button onClick={downloadQr}>
                  <Download className="size-4" />
                  Download SVG
                </Button>
              </div>
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:underline"
                href={`/traceability/${encodeURIComponent(qrBatch.batchId)}`}
              >
                <ArrowUpRight className="size-4" />
                Open batch view
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
