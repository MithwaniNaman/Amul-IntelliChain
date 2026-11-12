"use client";

import { ArrowUpRight, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOverviewInventory } from "@/components/dashboard/overview-inventory-provider";
import {
  getOperationalInsights,
  type OverviewForecastSummary,
} from "@/lib/dashboard-data";

const priorityClasses = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-blue-200 bg-blue-50 text-blue-700",
};

export function InsightsPanel({
  forecast,
}: {
  forecast: OverviewForecastSummary;
}) {
  const { metrics } = useOverviewInventory();
  const insights = getOperationalInsights(forecast, metrics);

  return (
    <Card className="h-full border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
            Operational insights
          </CardTitle>
          <Badge
            variant="outline"
            className="border-violet-200 bg-violet-50 text-violet-700"
          >
            Demo
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          Rule-based recommendations from calculated demo data
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="rounded-xl border border-slate-100 bg-white p-3.5 transition-colors hover:border-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xs leading-5 font-semibold text-slate-800">
                {insight.title}
              </h3>
              <Badge
                variant="outline"
                className={`shrink-0 text-[9px] capitalize ${priorityClasses[insight.priority]}`}
              >
                {insight.priority}
              </Badge>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
              {insight.detail}
            </p>
            <p className="text-brand-blue mt-2 inline-flex items-center gap-1 text-[10px] font-medium">
              {insight.impact}
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </p>
          </article>
        ))}
        <p className="pt-1 text-[10px] text-slate-600">
          No LLM or external AI service is connected.
        </p>
      </CardContent>
    </Card>
  );
}
