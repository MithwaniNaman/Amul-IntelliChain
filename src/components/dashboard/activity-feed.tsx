"use client";

import {
  Activity,
  Boxes,
  ClipboardCheck,
  PackageCheck,
  Thermometer,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useSyncExternalStore } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivities } from "@/lib/mock-data";
import {
  getWorkspaceServerSnapshot,
  getWorkspaceSnapshot,
  subscribeToWorkspace,
} from "@/lib/workspace-store";
import { getTraceabilitySnapshot } from "@/lib/traceability/store";
import type { ActivityItem } from "@/types";
import { useEffect, useState } from "react";

const activityIcons: Record<ActivityItem["kind"], LucideIcon> = {
  shipment: Truck,
  inventory: PackageCheck,
  quality: Thermometer,
  traceability: ClipboardCheck,
  "stock-adjustment": Boxes,
};

export function ActivityFeed() {
  const [traceActivities, setTraceActivities] = useState<
    Array<{ id: string; message: string; timestamp: string }>
  >([]);
  useEffect(() => {
    let active = true;
    void getTraceabilitySnapshot().then((snapshot) => {
      if (active) setTraceActivities(snapshot.activities);
    });
    return () => {
      active = false;
    };
  }, []);
  const workspace = useSyncExternalStore(
    subscribeToWorkspace,
    getWorkspaceSnapshot,
    getWorkspaceServerSnapshot,
  );
  const activities = [
    ...traceActivities.map((item) => ({
      id: item.id,
      title: "Batch traceability event recorded",
      detail: item.message,
      time: format(new Date(item.timestamp), "h:mm a"),
      kind: "traceability" as const,
    })),
    ...workspace.activities.map((item) => ({
      id: item.id,
      title: "Inventory stock adjusted",
      detail: item.message,
      time: format(new Date(item.timestamp), "h:mm a"),
      kind: "stock-adjustment" as const,
    })),
    ...recentActivities,
  ].slice(0, 5);

  return (
    <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Activity className="size-4 text-slate-500" aria-hidden="true" />
          Recent activity
        </CardTitle>
        <p className="text-xs text-slate-500">
          Recent operational and stock adjustment events
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.kind];

            return (
              <li key={activity.id} className="relative flex gap-3">
                {index < activities.length - 1 && (
                  <span className="absolute top-9 left-[15px] h-[calc(100%+2px)] w-px bg-slate-100" />
                )}
                <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800">
                      {activity.title}
                    </p>
                    <time className="shrink-0 text-[10px] text-slate-600">
                      {activity.time}
                    </time>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {activity.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
