import Link from "next/link";
import { ArrowUpRight, RadioTower } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shipments } from "@/lib/mock-data";
import type { Shipment } from "@/types";

const statusStyles: Record<Shipment["status"], string> = {
  preparing: "border-slate-200 bg-slate-50 text-slate-700",
  "in-transit": "border-blue-200 bg-blue-50 text-blue-700",
  delayed: "border-orange-200 bg-orange-50 text-orange-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function MonitoringWorkspace({
  shipmentId,
  invalidQuery = false,
}: {
  shipmentId?: string;
  invalidQuery?: boolean;
}) {
  const selected = shipments.find((shipment) => shipment.id === shipmentId);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Supply Chain Monitoring
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Review the small synthetic shipment sample. No live location,
            carrier, sensor, or delivery-time feed is connected.
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit border-amber-200 bg-amber-50 text-amber-800"
        >
          SIMULATED SHIPMENTS
        </Badge>
      </header>

      {invalidQuery && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Choose one shipment record at a time.
        </p>
      )}
      {shipmentId && !selected && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          No synthetic shipment matches “{shipmentId}”. Choose a record from the
          list below.
        </p>
      )}

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Shipment sample</CardTitle>
          <p className="text-xs text-slate-500">
            {shipments.length} static demonstration records · quantities are
            listed cases, not sales or loss
          </p>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
              <RadioTower
                className="mx-auto size-6 text-slate-600"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No shipment records are available.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                This demo has no connected carrier feed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[690px] text-left text-sm">
                <caption className="sr-only">
                  Synthetic shipment records and their static statuses
                </caption>
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Shipment
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Destination
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Listed ETA
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Quantity
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className={
                        shipment.id === selected?.id ? "bg-red-50/60" : ""
                      }
                    >
                      <th
                        scope="row"
                        className="px-3 py-3 text-left font-semibold text-slate-800"
                      >
                        {shipment.id}
                      </th>
                      <td className="px-3 py-3 text-slate-600">
                        {shipment.destination}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant="outline"
                          className={statusStyles[shipment.status]}
                        >
                          {shipment.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {shipment.eta}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {shipment.quantityCases.toLocaleString()} cases
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/monitoring?shipment=${encodeURIComponent(shipment.id)}`}
                          aria-label={`View shipment ${shipment.id}`}
                          className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                        >
                          View <ArrowUpRight className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selected ? (
        <Card className="max-w-3xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">
                {selected.id} · synthetic detail
              </CardTitle>
              <Badge
                variant="outline"
                className={statusStyles[selected.status]}
              >
                {selected.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Destination" value={selected.destination} />
              <Detail label="Carrier label" value={selected.carrier} />
              <Detail label="Listed ETA" value={selected.eta} />
              <Detail
                label="Listed quantity"
                value={`${selected.quantityCases.toLocaleString()} cases`}
              />
            </dl>
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              The ETA is a clock label, not a timestamp. Delay duration, GPS
              observations, linked batch details, and confirmed financial loss
              are unavailable.
            </p>
            <Link
              href="/insights"
              className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              Return to Intelligence
            </Link>
          </CardContent>
        </Card>
      ) : (
        !invalidQuery && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Select a shipment to inspect its static details.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              The sample is not a live monitoring or tracking service.
            </p>
          </div>
        )
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
