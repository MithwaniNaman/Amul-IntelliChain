import {
  ArrowRight,
  Boxes,
  Building2,
  Milk,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { locations } from "@/data/locations";
import { supplyChainBatches } from "@/data/batches";

const stages: {
  name: string;
  detail: string;
  stat: string;
  icon: LucideIcon;
}[] = (() => {
  const countLocations = (type: (typeof locations)[number]["locationType"]) =>
    locations.filter((location) => location.locationType === type).length;
  const countBatches = (
    status: (typeof supplyChainBatches)[number]["currentStatus"],
  ) =>
    supplyChainBatches.filter((batch) => batch.currentStatus === status).length;

  return [
    {
      name: "Collection",
      detail: `${countLocations("collection-centre")} sample centres`,
      stat: `${supplyChainBatches.length} synthetic batches`,
      icon: Milk,
    },
    {
      name: "Processing",
      detail: `${countLocations("processing-facility")} sample facilities`,
      stat: `${countBatches("processing")} batches processing`,
      icon: Building2,
    },
    {
      name: "Distribution",
      detail: `${countLocations("distribution-hub")} sample hubs`,
      stat: `${countBatches("in-transit")} batches in transit`,
      icon: Truck,
    },
    {
      name: "Delivered",
      detail: `${countBatches("delivered")} completed batches`,
      stat: "Synthetic status records",
      icon: Store,
    },
    {
      name: "In progress",
      detail: `${supplyChainBatches.filter((batch) => batch.currentStatus !== "delivered").length} active batches`,
      stat: "Sample traceability data",
      icon: Boxes,
    },
  ];
})();

export function SupplyChainOverview() {
  return (
    <Card className="border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Supply chain overview
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              From collection to delivery
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Demo network
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {stages.map(({ name, detail, stat, icon: Icon }, index) => (
            <div key={name} className="relative">
              <div className="flex h-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 xl:flex-col xl:gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/70">
                  <Icon className="size-[17px]" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">{name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{detail}</p>
                  <p className="mt-2 text-[10px] font-semibold text-slate-700">
                    {stat}
                  </p>
                </div>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight
                  className="absolute top-1/2 -right-2.5 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-white text-slate-300 xl:block"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-slate-600">
          Stage counts are derived from the shared synthetic location and batch
          data.
        </p>
      </CardContent>
    </Card>
  );
}
