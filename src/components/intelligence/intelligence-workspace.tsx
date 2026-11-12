"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CircleAlert,
  CircleCheck,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import {
  filterAnomalies,
  getDefaultAnomalyAnalysis,
  getAnomalyWorkflowServerSnapshot,
  setAnomalyStatus,
  subscribeToAnomalyWorkflow,
  summarizeAnomalies,
  type DetectionResult,
} from "@/lib/intelligence";
import { getAnomalyWorkflowSnapshot } from "@/lib/intelligence/store";
import { getWorkspaceSnapshot } from "@/lib/workspace-store";
import type {
  AnomalyCategory,
  AnomalySeverity,
  AnomalyStatus,
  OperationalAnomaly,
} from "@/types";

const categoryLabels: Record<AnomalyCategory, string> = {
  "demand-spike": "Demand spike",
  "demand-drop": "Demand drop",
  "forecast-divergence": "Forecast divergence",
  "stockout-risk": "Stockout risk",
  "excess-inventory": "Excess inventory",
  "expiry-risk": "Expiry risk",
  "shipment-delay": "Shipment delay",
  "batch-gap": "Batch event gap",
  "temperature-excursion": "Temperature excursion",
  "quality-concern": "Quality concern",
};

const severityStyles: Record<AnomalySeverity, string> = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
};

const statusStyles: Record<AnomalyStatus, string> = {
  Open: "border-red-200 bg-red-50 text-red-700",
  Acknowledged: "border-blue-200 bg-blue-50 text-blue-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function formatValue(value: number | string | null): string {
  if (value === null) return "Not available";
  return typeof value === "number" ? value.toLocaleString() : value;
}

function getRelatedHref(anomaly: OperationalAnomaly): string | null {
  if (anomaly.batchId) {
    return `/traceability/${encodeURIComponent(anomaly.batchId)}`;
  }
  if (anomaly.shipmentId) {
    return `/monitoring?shipment=${encodeURIComponent(anomaly.shipmentId)}`;
  }
  if (
    anomaly.category === "stockout-risk" ||
    anomaly.category === "excess-inventory" ||
    anomaly.category === "expiry-risk"
  ) {
    const inventoryId = anomaly.relatedRecordIds.find((id) =>
      id.startsWith("INV-"),
    );
    return inventoryId
      ? `/inventory?record=${encodeURIComponent(inventoryId)}`
      : "/inventory";
  }
  if (
    anomaly.category === "demand-spike" ||
    anomaly.category === "demand-drop" ||
    anomaly.category === "forecast-divergence"
  ) {
    const params = new URLSearchParams();
    if (anomaly.productId) params.set("product", anomaly.productId);
    if (anomaly.locationId) params.set("location", anomaly.locationId);
    return `/forecasting?${params.toString()}`;
  }
  return null;
}

function readableTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function entityLabel(anomaly: OperationalAnomaly): string {
  const product = products.find((item) => item.productId === anomaly.productId);
  const location = locations.find(
    (item) => item.locationId === anomaly.locationId,
  );
  const entities = [
    product?.name,
    location?.name,
    anomaly.batchId,
    anomaly.shipmentId,
  ].filter(Boolean);
  return entities.join(" · ") || "Network-wide";
}

function CountCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "red" | "amber" | "blue" | "slate";
}) {
  const tones = {
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {detail}
          </p>
        </div>
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function Distribution({
  title,
  values,
}: {
  title: string;
  values: Array<{ label: string; count: number; color: string }>;
}) {
  const max = Math.max(1, ...values.map((item) => item.count));
  return (
    <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {values.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between gap-3 text-xs">
              <span className="truncate text-slate-600">{item.label}</span>
              <span className="font-medium text-slate-800 tabular-nums">
                {item.count}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function IntelligenceWorkspace() {
  const [analysis, setAnalysis] = useState<DetectionResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const workflow = useSyncExternalStore(
    subscribeToAnomalyWorkflow,
    getAnomalyWorkflowSnapshot,
    getAnomalyWorkflowServerSnapshot,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AnomalyCategory | "all">("all");
  const [severity, setSeverity] = useState<AnomalySeverity | "all">("all");
  const [status, setStatus] = useState<AnomalyStatus | "all">("all");

  useEffect(() => {
    let active = true;
    void getDefaultAnomalyAnalysis(getWorkspaceSnapshot().inventory)
      .then((result) => {
        if (active) setAnalysis(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setAnalysisError(
            error instanceof Error
              ? error.message
              : "Unable to calculate the anomaly analysis.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const anomalies = useMemo(
    () =>
      (analysis?.anomalies ?? []).map((anomaly) => ({
        ...anomaly,
        status: workflow.statuses[anomaly.id]?.status ?? "Open",
      })),
    [analysis, workflow.statuses],
  );
  const summary = summarizeAnomalies(anomalies);
  const filtered = filterAnomalies(anomalies, {
    query,
    category,
    severity,
    status,
  });
  const selected =
    anomalies.find((anomaly) => anomaly.id === selectedId) ?? null;
  const categories = Object.keys(categoryLabels) as AnomalyCategory[];
  const activeByCategory = categories
    .map((item) => ({
      label: categoryLabels[item],
      count: anomalies.filter(
        (anomaly) => anomaly.category === item && anomaly.status !== "Resolved",
      ).length,
      color: "bg-blue-500",
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);
  const severities: AnomalySeverity[] = ["Critical", "High", "Medium", "Low"];
  const severityDistribution = severities.map((item) => ({
    label: item,
    count: anomalies.filter(
      (anomaly) => anomaly.severity === item && anomaly.status !== "Resolved",
    ).length,
    color:
      item === "Critical"
        ? "bg-red-600"
        : item === "High"
          ? "bg-orange-500"
          : item === "Medium"
            ? "bg-amber-400"
            : "bg-slate-400",
  }));

  function changeStatus(
    anomaly: OperationalAnomaly,
    nextStatus: Exclude<AnomalyStatus, "Open">,
  ) {
    try {
      setAnomalyStatus(
        anomaly.id,
        nextStatus,
        anomalies,
        new Date().toISOString(),
      );
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Unable to update the anomaly status.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <section
        aria-label="Anomaly overview"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <CountCard
          label="Detected anomalies"
          value={summary.total.toLocaleString()}
          detail={`${summary.open} open · ${summary.acknowledged} acknowledged · ${summary.resolved} resolved`}
          icon={CircleAlert}
          tone="blue"
        />
        <CountCard
          label="Critical / high active"
          value={`${summary.criticalActive} / ${summary.highActive}`}
          detail="Open or acknowledged; rule-detected"
          icon={ShieldAlert}
          tone="red"
        />
        <CountCard
          label="Estimated financial exposure"
          value={
            summary.estimatedFinancialExposure === null
              ? "Unavailable"
              : summary.estimatedFinancialExposure.toLocaleString()
          }
          detail="No synthetic product prices are available"
          icon={AlertTriangle}
          tone="amber"
        />
        <CountCard
          label="Current workflow"
          value={`${summary.open} open`}
          detail="Status changes persist in this browser"
          icon={CircleCheck}
          tone="slate"
        />
      </section>

      {analysisError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {analysisError}
        </div>
      )}
      {workflow.error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {workflow.error}
        </div>
      )}
      {!analysis && !analysisError && (
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500"
        >
          Calculating deterministic rules against the synthetic operational
          data…
        </div>
      )}

      {analysis && (
        <>
          {analysis.warnings.map((warning) => (
            <div
              key={warning}
              role="status"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {warning}
            </div>
          ))}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(270px,0.7fr)]">
            <Distribution
              title="Active anomalies by category"
              values={activeByCategory}
            />
            <Distribution
              title="Active anomalies by severity"
              values={severityDistribution}
            />
          </div>

          <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
            <CardHeader className="gap-3 border-b border-slate-100 pb-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Filter
                      className="size-4 text-slate-500"
                      aria-hidden="true"
                    />
                    Anomaly queue
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    {filtered.length} of {anomalies.length} deterministic
                    signals
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="w-fit border-slate-200 bg-slate-50 text-slate-600"
                >
                  SIMULATED DATA
                </Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(230px,1fr)_repeat(3,minmax(130px,0.5fr))]">
                <label className="relative">
                  <Search
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-600"
                    aria-hidden="true"
                  />
                  <Input
                    aria-label="Search anomalies"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search title, product, record…"
                    className="pl-9"
                  />
                </label>
                <Select
                  value={category}
                  onValueChange={(value) =>
                    setCategory(value as AnomalyCategory | "all")
                  }
                >
                  <SelectTrigger
                    aria-label="Filter by category"
                    className="w-full"
                  >
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {categoryLabels[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={severity}
                  onValueChange={(value) =>
                    setSeverity(value as AnomalySeverity | "all")
                  }
                >
                  <SelectTrigger
                    aria-label="Filter by severity"
                    className="w-full"
                  >
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    {severities.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as AnomalyStatus | "all")
                  }
                >
                  <SelectTrigger
                    aria-label="Filter by status"
                    className="w-full"
                  >
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Signal</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Severity</th>
                      <th className="px-4 py-3 font-semibold">
                        Affected entity
                      </th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((anomaly) => (
                      <tr
                        key={anomaly.id}
                        className="cursor-pointer hover:bg-slate-50/80"
                        onClick={() => setSelectedId(anomaly.id)}
                      >
                        <td className="max-w-[280px] px-4 py-3">
                          <p className="truncate font-semibold text-slate-800">
                            {anomaly.title}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-slate-500">
                            {readableTime(anomaly.detectedAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {categoryLabels[anomaly.category]}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={severityStyles[anomaly.severity]}
                          >
                            {anomaly.severity}
                          </Badge>
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                          {entityLabel(anomaly)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={statusStyles[anomaly.status]}
                          >
                            {anomaly.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(anomaly.id);
                            }}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-slate-100 md:hidden">
                {filtered.map((anomaly) => (
                  <button
                    key={anomaly.id}
                    type="button"
                    onClick={() => setSelectedId(anomaly.id)}
                    className="block w-full px-4 py-4 text-left hover:bg-slate-50"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-xs leading-relaxed font-semibold text-slate-800">
                          {anomaly.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-500">
                          {categoryLabels[anomaly.category]}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className={severityStyles[anomaly.severity]}
                      >
                        {anomaly.severity}
                      </Badge>
                    </span>
                    <span className="mt-3 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                      <span className="truncate">{entityLabel(anomaly)}</span>
                      <span>{anomaly.status}</span>
                    </span>
                  </button>
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-slate-500">
                  No anomalies match these filters.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)]">
            <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock3
                    className="size-4 text-slate-500"
                    aria-hidden="true"
                  />
                  Workflow activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workflow.activities.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No operator status changes have been recorded in this
                    browser.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {workflow.activities.slice(0, 5).map((activity) => (
                      <li
                        key={activity.id}
                        className="flex items-start justify-between gap-3 text-xs"
                      >
                        <span className="min-w-0">
                          <span className="block font-medium text-slate-700">
                            {activity.message}
                          </span>
                          <span className="mt-0.5 block truncate text-slate-500">
                            {activity.anomalyId}
                          </span>
                        </span>
                        <time className="shrink-0 text-[10px] text-slate-600">
                          {readableTime(activity.timestamp)}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 bg-slate-50/70 shadow-sm shadow-slate-900/[0.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Detector coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-600">
                {analysis.unavailableDetectors.map((item) => (
                  <p key={item} className="flex gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
                    {item}
                  </p>
                ))}
                <p className="pt-1 text-[10px] leading-relaxed text-slate-500">
                  All rules and thresholds are deterministic demonstration
                  logic, not model output or production quality limits.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto sm:max-w-xl"
        >
          {selected && (
            <>
              <SheetHeader className="border-b border-slate-100 pr-12">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={severityStyles[selected.severity]}
                  >
                    {selected.severity}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={statusStyles[selected.status]}
                  >
                    {selected.status}
                  </Badge>
                </div>
                <SheetTitle className="pt-2 text-left text-lg leading-snug">
                  {selected.title}
                </SheetTitle>
                <SheetDescription className="text-left">
                  {categoryLabels[selected.category]} ·{" "}
                  {readableTime(selected.detectedAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 p-4">
                <section>
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Why this was detected
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {selected.explanation}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Rule: <code>{selected.ruleId}</code> · Evidence strength:{" "}
                    {selected.evidenceStrength} (
                    {Math.round(selected.confidence * 100)}%)
                  </p>
                </section>
                <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <h3 className="text-xs font-semibold text-slate-800">
                    Observed evidence
                  </h3>
                  <dl className="mt-2 space-y-2">
                    <div className="flex justify-between gap-4 text-xs">
                      <dt className="text-slate-500">Observed value</dt>
                      <dd className="text-right font-medium text-slate-800">
                        {formatValue(selected.observedValue)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 text-xs">
                      <dt className="text-slate-500">Expected / baseline</dt>
                      <dd className="text-right font-medium text-slate-800">
                        {formatValue(selected.expectedValue)}
                      </dd>
                    </div>
                    {selected.evidence.map((item) => (
                      <div
                        key={`${item.recordId}:${item.label}`}
                        className="border-t border-slate-200 pt-2 text-xs"
                      >
                        <dt className="font-medium text-slate-700">
                          {item.label}
                        </dt>
                        <dd className="mt-1 flex flex-wrap justify-between gap-2 text-slate-600">
                          <span>
                            {formatValue(item.observed)}
                            {item.baseline !== undefined &&
                              ` · baseline ${formatValue(item.baseline)}`}
                          </span>
                          <code className="text-[10px] text-slate-600">
                            {item.recordId}
                          </code>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section>
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Potential business impact
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selected.impactQuantity === null
                      ? "No quantity estimate available"
                      : `${selected.impactQuantity.toLocaleString()} ${selected.impactUnit ?? "units"}`}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {selected.impactAssumption}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-600">
                    Estimated financial exposure: unavailable
                  </p>
                </section>
                <section className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
                  <h3 className="text-xs font-semibold text-blue-900">
                    Recommended next action
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-blue-900/80">
                    {selected.recommendation}
                  </p>
                </section>
                <section className="flex flex-wrap items-center gap-2">
                  {!workflow.statuses[selected.id] && (
                    <Button
                      variant="outline"
                      onClick={() => changeStatus(selected, "Acknowledged")}
                    >
                      <Check />
                      Acknowledge
                    </Button>
                  )}
                  {selected.status !== "Resolved" && (
                    <Button onClick={() => changeStatus(selected, "Resolved")}>
                      <CircleCheck />
                      Resolve
                    </Button>
                  )}
                  {getRelatedHref(selected) && (
                    <Button variant="ghost" asChild>
                      <Link href={getRelatedHref(selected) ?? "/insights"}>
                        Open related workspace
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  )}
                </section>
                {workflow.statuses[selected.id] && (
                  <p className="text-[10px] text-slate-600">
                    Status updated{" "}
                    {readableTime(workflow.statuses[selected.id].updatedAt)}
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
