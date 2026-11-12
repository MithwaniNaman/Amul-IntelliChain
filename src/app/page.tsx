import { ClipboardCheck, Droplets, Gauge, Activity } from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DemandChart } from "@/components/dashboard/demand-chart";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { IntelligenceOverview } from "@/components/intelligence/intelligence-overview";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { OverviewInventoryKpis } from "@/components/dashboard/overview-inventory-kpis";
import { OverviewInventoryProvider } from "@/components/dashboard/overview-inventory-provider";
import { RegionalInventory } from "@/components/dashboard/regional-inventory";
import { SupplyChainOverview } from "@/components/dashboard/supply-chain-overview";
import { Badge } from "@/components/ui/badge";
import { DEMAND_END_DATE, historicalDemandRecords } from "@/data/demand";
import { products } from "@/data/products";
import { supplyChainBatches } from "@/data/batches";
import {
  getDashboardDemandData,
  getForecastForSelection,
} from "@/lib/dashboard-data";

export default function OverviewPage() {
  const defaultForecast = getForecastForSelection(
    "full-cream-milk",
    "delhi",
    7,
  );
  const milkProductIds = new Set(
    products
      .filter((product) => product.category === "milk")
      .map((product) => product.productId),
  );
  const dailyMilkDemand = historicalDemandRecords
    .filter(
      (record) =>
        record.date === DEMAND_END_DATE && milkProductIds.has(record.productId),
    )
    .reduce((sum, record) => sum + record.actualDemand, 0);
  const activeBatches = supplyChainBatches.filter(
    (batch) => batch.currentStatus !== "delivered",
  ).length;

  return (
    <OverviewInventoryProvider>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Supply Chain Overview
              </h1>
              <span className="hidden size-2 rounded-full bg-emerald-500 sm:block" />
            </div>
            <p className="text-sm text-slate-500">
              Calculated from a shared 180-day synthetic demand and inventory
              dataset.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-amber-200 bg-amber-50 text-amber-800"
          >
            <Activity className="size-3" />
            SIMULATED DEMO DATA
          </Badge>
        </section>

        <section
          aria-label="Key performance indicators"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
        >
          <KpiCard
            label="Daily Milk Demand"
            value={dailyMilkDemand.toLocaleString()}
            unit="litres / day"
            change="latest synthetic day"
            icon={Droplets}
            tone="red"
          />
          <KpiCard
            label="Forecast Accuracy"
            value={`${defaultForecast.forecastAccuracy.toFixed(1)}%`}
            unit="28-day rolling backtest"
            change="weighted moving average"
            icon={Gauge}
            tone="blue"
          />
          <OverviewInventoryKpis />
          <KpiCard
            label="Active Traceability Batches"
            value={activeBatches.toString()}
            unit="synthetic batches in progress"
            change={`${supplyChainBatches.length} sample records`}
            icon={ClipboardCheck}
            tone="blue"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <DemandChart data={getDashboardDemandData(defaultForecast)} />
          <SupplyChainOverview />
        </section>

        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <RegionalInventory />
          <ActivityFeed />
          <InsightsPanel forecast={defaultForecast} />
          <IntelligenceOverview />
        </section>

        <p className="pb-2 text-center text-[10px] text-slate-600">
          Independent concept project · Metrics are calculated from synthetic
          data; no live dairy network, AI service, or blockchain is connected.
        </p>
      </div>
    </OverviewInventoryProvider>
  );
}
