"use client";

import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultAnomalyAnalysis } from "@/lib/intelligence";
import { getAnomalyWorkflowSnapshot } from "@/lib/intelligence/store";
import { getWorkspaceSnapshot } from "@/lib/workspace-store";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import type { OperationalAnomaly } from "@/types";

const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function relatedEntity(anomaly: OperationalAnomaly): string {
  const product = products.find((item) => item.productId === anomaly.productId);
  const location = locations.find(
    (item) => item.locationId === anomaly.locationId,
  );
  return (
    product?.name ??
    location?.name ??
    anomaly.batchId ??
    anomaly.shipmentId ??
    "Supply chain"
  );
}

export function IntelligenceOverview() {
  const [anomalies, setAnomalies] = useState<OperationalAnomaly[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getDefaultAnomalyAnalysis(getWorkspaceSnapshot().inventory)
      .then((result) => {
        if (!active) return;
        const workflow = getAnomalyWorkflowSnapshot();
        setAnomalies(
          result.anomalies.map((anomaly) => ({
            ...anomaly,
            status: workflow.statuses[anomaly.id]?.status ?? "Open",
          })),
        );
        if (workflow.error) setLoadError(workflow.error);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load operational intelligence.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const active = anomalies.filter((item) => item.status !== "Resolved");
    const critical = active.filter((item) => item.severity === "Critical");
    const mostAffected = new Map<string, number>();
    for (const anomaly of active) {
      const entity = relatedEntity(anomaly);
      mostAffected.set(entity, (mostAffected.get(entity) ?? 0) + 1);
    }
    const frequentEntity = [...mostAffected.entries()].sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )[0]?.[0];
    const latest = [...active]
      .sort(
        (left, right) =>
          severityOrder[left.severity] - severityOrder[right.severity] ||
          right.detectedAt.localeCompare(left.detectedAt),
      )
      .slice(0, 3);
    return { active, critical, frequentEntity, latest };
  }, [anomalies]);

  return (
    <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldAlert className="size-4 text-red-600" aria-hidden="true" />
            Operational intelligence
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            Deterministic rules · synthetic data
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/insights">
            View workspace
            <ArrowRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError && (
          <p role="status" className="text-xs text-amber-800">
            {loadError}
          </p>
        )}
        {anomalies.length === 0 && !loadError ? (
          <p className="text-xs text-slate-500">
            Calculating operational signals…
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-[10px] font-medium text-slate-500">
                  Critical active
                </p>
                <p className="mt-1 text-xl font-semibold text-red-700">
                  {summary.critical.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-500">
                  Highest financial exposure
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Unavailable
                </p>
                <p className="text-[9px] text-slate-500">
                  No product price data
                </p>
              </div>
            </div>
            {summary.frequentEntity && (
              <p className="text-xs text-slate-600">
                Most frequently affected record:{" "}
                <span className="font-semibold text-slate-800">
                  {summary.frequentEntity}
                </span>
              </p>
            )}
            {summary.latest.length > 0 && (
              <ul className="space-y-2">
                {summary.latest.map((anomaly) => (
                  <li
                    key={anomaly.id}
                    className="flex items-start gap-2 rounded-lg border border-slate-100 p-2.5"
                  >
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-slate-800">
                        {anomaly.title}
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        {relatedEntity(anomaly)} · {anomaly.status}
                      </span>
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        anomaly.severity === "Critical"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : anomaly.severity === "High"
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {anomaly.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] leading-relaxed text-slate-600">
              Potential unit exposure is a planning estimate, not a confirmed
              loss. No external AI provider is connected.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
