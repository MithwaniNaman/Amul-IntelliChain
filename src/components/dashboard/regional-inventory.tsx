"use client";

import { MapPinned } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRegionalInventorySummaries } from "@/lib/dashboard-data";
import { useOverviewInventory } from "@/components/dashboard/overview-inventory-provider";
import { cn } from "@/lib/utils";

const statusStyles = {
  Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Watch: "border-amber-200 bg-amber-50 text-amber-700",
  Attention: "border-red-200 bg-red-50 text-red-700",
};

export function RegionalInventory() {
  const { metrics, error } = useOverviewInventory();
  const regionalInventory = getRegionalInventorySummaries(metrics);

  return (
    <Card className="h-full border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MapPinned className="text-brand-blue size-4" aria-hidden="true" />
          Regional inventory
        </CardTitle>
        <p className="text-xs text-slate-500">
          Share of records needing inventory attention
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {regionalInventory.map((region) => (
          <div key={region.region}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  {region.region}
                </p>
                <p className="truncate text-[10px] text-slate-600">
                  {region.state}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn("text-[9px]", statusStyles[region.status])}
              >
                {region.status}
              </Badge>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  region.status === "Attention"
                    ? "bg-red-500"
                    : region.status === "Watch"
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                )}
                style={{ width: `${region.riskPercent}%` }}
                role="progressbar"
                aria-label={`${region.region} inventory risk`}
                aria-valuenow={region.riskPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-600">
              {region.riskPercent}% inventory at risk ·{" "}
              {region.monitoredFacilities} locations
            </p>
          </div>
        ))}
        <p className="border-t border-slate-100 pt-3 text-[10px] text-slate-600">
          Calculated from synthetic stock records and saved demo adjustments.
        </p>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
          >
            Saved stock could not be loaded; regional figures show the seed
            dataset. Open Inventory to review local data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
