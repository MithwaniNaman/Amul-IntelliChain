import { Suspense } from "react";
import { connection } from "next/server";

import { MonitoringWorkspace } from "@/components/monitoring/monitoring-workspace";

async function MonitoringContent({
  searchParams,
}: {
  searchParams: Promise<{ shipment?: string | string[] }>;
}) {
  await connection();
  const { shipment } = await searchParams;
  return (
    <MonitoringWorkspace
      shipmentId={typeof shipment === "string" ? shipment : undefined}
      invalidQuery={Array.isArray(shipment)}
    />
  );
}

export default function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ shipment?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500"
        >
          Loading synthetic shipment records…
        </div>
      }
    >
      <MonitoringContent searchParams={searchParams} />
    </Suspense>
  );
}
