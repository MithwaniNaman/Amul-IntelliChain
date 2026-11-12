"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Boxes, Droplets, Gauge } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { useOverviewInventory } from "@/components/dashboard/overview-inventory-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMAND_END_DATE, historicalDemandRecords } from "@/data/demand";
import { products } from "@/data/products";
import { calculateInventoryRiskPercent } from "@/lib/inventory";

const milkProductIds = new Set(
  products
    .filter((product) => product.category === "milk")
    .map((product) => product.productId),
);

const milkDemandByDate = new Map<
  string,
  { actual: number; predicted: number }
>();

for (const record of historicalDemandRecords) {
  if (!milkProductIds.has(record.productId)) continue;
  const day = milkDemandByDate.get(record.date) ?? {
    actual: 0,
    predicted: 0,
  };
  day.actual += record.actualDemand;
  day.predicted += record.predictedDemand;
  milkDemandByDate.set(record.date, day);
}

const demandSeries = [...milkDemandByDate].slice(-28).map(([date, values]) => ({
  date,
  label: date.slice(5),
  actual: values.actual,
  predicted: values.predicted,
}));
const latestMilkDemand = demandSeries.at(-1)?.actual ?? 0;
const totalMilkDemand = demandSeries.reduce((sum, day) => sum + day.actual, 0);

export function AnalyticsWorkspace() {
  const { metrics } = useOverviewInventory();
  const milkInventory = metrics.filter(
    (item) => item.product.category === "milk",
  );
  const atRiskRecords = milkInventory.filter(
    (item) => item.health !== "Healthy",
  ).length;
  const milkStock = milkInventory.reduce(
    (sum, item) => sum + item.record.currentStock,
    0,
  );
  const latestDate = demandSeries.at(-1)?.date ?? DEMAND_END_DATE;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Product Analytics
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            A focused view of observed synthetic milk demand and current locally
            saved milk inventory health. No sales or revenue data is available.
          </p>
        </div>
        <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-amber-800">
          SIMULATED DEMONSTRATION DATA
        </span>
      </header>

      <section
        aria-label="Milk product analytics summary"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Milk demand · 28 days"
          value={totalMilkDemand.toLocaleString()}
          unit="litres across synthetic locations"
          change="observed values"
          icon={Droplets}
          tone="blue"
        />
        <KpiCard
          label="Latest daily milk demand"
          value={latestMilkDemand.toLocaleString()}
          unit={`litres · ${latestDate}`}
          change="latest synthetic day"
          icon={Gauge}
          tone="red"
        />
        <KpiCard
          label="Milk inventory at risk"
          value={`${calculateInventoryRiskPercent(milkInventory).toFixed(1)}%`}
          unit={`${atRiskRecords} of ${milkInventory.length} records`}
          change="saved stock and expiry values"
          icon={AlertTriangle}
          tone="amber"
        />
        <KpiCard
          label="Milk on hand"
          value={milkStock.toLocaleString()}
          unit="litres · locally saved demo stock"
          change="changes remain in this browser"
          icon={Boxes}
          tone="green"
        />
      </section>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Synthetic milk demand by day
          </CardTitle>
          <p className="text-xs text-slate-500">
            Full Cream and Toned Milk combined across all sample locations.
            Observed litres are compared with the prediction values stored in
            the synthetic history.
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="h-[280px] w-full"
            role="img"
            aria-label="Line chart comparing observed and stored predicted daily milk demand in litres for 28 synthetic days."
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={demandSeries}
                margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#eef1f5"
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  minTickGap={18}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  tickFormatter={(value: number) => value.toLocaleString()}
                  width={58}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} litres`,
                    name === "actual" ? "Observed" : "Stored prediction",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Observed"
                  stroke="#c62828"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Stored prediction"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-left text-xs">
              <caption className="sr-only">
                Seven latest synthetic daily milk demand observations and stored
                prediction values, in litres
              </caption>
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Observed (L)
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Stored prediction (L)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demandSeries.slice(-7).map((day) => (
                  <tr key={day.date}>
                    <th
                      scope="row"
                      className="px-3 py-2 font-medium text-slate-700"
                    >
                      {day.date}
                    </th>
                    <td className="px-3 py-2 text-slate-600">
                      {day.actual.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {day.predicted.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Both series are simulated. The prediction values are part of the
            generated history and are not an independent production forecast.
            Inventory risk uses saved stock, synthetic demand, and expiry dates;
            it is not a financial or food-safety assessment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
