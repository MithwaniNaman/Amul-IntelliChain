"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  ChartNoAxesCombined,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { DEMAND_END_DATE, historicalDemandRecords } from "@/data/demand";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  forecastDemand,
  getDemandPatternInsights,
} from "@/lib/forecasting/engine";
import type { ForecastHorizon, ForecastMethod } from "@/types";

const fieldClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-100";

interface ChartPoint {
  date: string;
  actual: number | null;
  historicalEstimate: number | null;
  forecast: number | null;
  interval: [number, number] | null;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

export function ForecastWorkspace({
  initialProductId,
  initialLocationId,
}: {
  initialProductId?: string;
  initialLocationId?: string;
}) {
  const [productId, setProductId] = useState(
    initialProductId ?? products[0]?.productId ?? "",
  );
  const [locationId, setLocationId] = useState(
    initialLocationId ?? locations[0]?.locationId ?? "",
  );
  const [horizon, setHorizon] = useState<ForecastHorizon>(7);
  const [method, setMethod] = useState<ForecastMethod>(
    "weighted-moving-average",
  );
  const [historyDays, setHistoryDays] = useState(90);

  const selectedProduct = products.find((item) => item.productId === productId);
  const forecast = selectedProduct
    ? forecastDemand(historicalDemandRecords, {
        productId,
        locationId,
        horizon,
        method,
        historyDays,
        asOfDate: DEMAND_END_DATE,
      })
    : null;

  const chartData: ChartPoint[] = forecast
    ? [
        ...forecast.history.map((record) => ({
          date: record.date,
          actual: record.actualDemand,
          historicalEstimate: record.predictedDemand,
          forecast: null,
          interval: null,
        })),
        ...forecast.forecast.map((point) => ({
          date: point.date,
          actual: null,
          historicalEstimate: null,
          forecast: point.demand,
          interval: [point.lowerBound, point.upperBound] as [number, number],
        })),
      ]
    : [];
  const insights = forecast ? getDemandPatternInsights(forecast.history) : [];
  const selectedLocation = locations.find(
    (item) => item.locationId === locationId,
  );
  const recommendation =
    forecast && selectedProduct && selectedLocation
      ? forecast.demandGrowthPercent > 2
        ? `Forecasted demand for ${selectedProduct.name} in ${selectedLocation.city} is increasing by ${forecast.demandGrowthPercent.toFixed(1)}%. Consider increasing planned inventory allocation by approximately ${formatNumber(forecast.forecastAverage - forecast.averageDemand)} ${selectedProduct.unit} per day.`
        : forecast.demandGrowthPercent < -2
          ? `Forecasted demand for ${selectedProduct.name} in ${selectedLocation.city} is decreasing by ${Math.abs(forecast.demandGrowthPercent).toFixed(1)}%. Review replenishment plans to avoid excess stock.`
          : `Forecasted demand for ${selectedProduct.name} in ${selectedLocation.city} is stable. Maintain the current replenishment plan and monitor actual demand.`
      : "Choose a product and location with available history to generate a recommendation.";
  const today = forecast?.history.at(-1)?.date;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Average daily demand"
          value={forecast ? formatNumber(forecast.averageDemand) : "—"}
          unit={selectedProduct?.unit ?? "units"}
        />
        <MetricCard
          label="Forecast daily demand"
          value={forecast ? formatNumber(forecast.forecastAverage) : "—"}
          unit={`${horizon}-day average · ${selectedProduct?.unit ?? "units"}`}
        />
        <MetricCard
          label="Demand growth"
          value={
            forecast
              ? `${forecast.demandGrowthPercent > 0 ? "+" : ""}${forecast.demandGrowthPercent.toFixed(1)}%`
              : "—"
          }
          unit="forecast average vs. historical average"
          positive={forecast ? forecast.demandGrowthPercent >= 0 : undefined}
        />
        <MetricCard
          label="Backtest forecast error"
          value={
            forecast
              ? `${forecast.meanAbsoluteError.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "—"
          }
          unit={`${selectedProduct?.unit ?? "units"} MAE · ${forecast && forecast.meanAbsolutePercentageError !== null ? `${forecast.meanAbsolutePercentageError.toFixed(1)}% MAPE` : "MAPE unavailable"}`}
        />
      </section>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle className="text-base">Demand forecast</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Historical actuals and estimates are separated from the future
                forecast. Shaded area shows the 95% model-error interval.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SelectField
                label="Product"
                value={productId}
                onChange={setProductId}
              >
                {products.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Location"
                value={locationId}
                onChange={setLocationId}
              >
                {locations.map((location) => (
                  <option key={location.locationId} value={location.locationId}>
                    {location.city}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Forecast horizon"
                value={horizon}
                onChange={(value) =>
                  setHorizon(Number(value) as ForecastHorizon)
                }
              >
                {[7, 14, 30].map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Method"
                value={method}
                onChange={(value) => setMethod(value as ForecastMethod)}
              >
                <option value="moving-average">Moving average</option>
                <option value="weighted-moving-average">
                  Weighted moving average
                </option>
              </SelectField>
              <SelectField
                label="Historical range"
                value={historyDays}
                onChange={(value) => setHistoryDays(Number(value))}
              >
                {[30, 90, 180].map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!forecast || forecast.history.length === 0 ? (
            <div
              className="flex min-h-64 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500"
              role="status"
            >
              <AlertCircle className="size-4" aria-hidden="true" />
              No historical demand is available for this selection.
            </div>
          ) : (
            <>
              <div
                className="h-[340px] w-full"
                role="img"
                aria-label={`${selectedProduct?.name ?? "Selected product"} demand in ${selectedLocation?.city ?? "selected location"}: ${historyDays} days of synthetic actuals and historical estimates followed by a ${horizon}-day forecast and illustrative uncertainty interval.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 12, right: 12, bottom: 4, left: 4 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#eef1f5"
                      strokeDasharray="3 4"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value: string) => value.slice(5)}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={22}
                    />
                    <YAxis
                      tickFormatter={(value: number) => value.toLocaleString()}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={64}
                    />
                    <Tooltip
                      labelFormatter={(value) => String(value)}
                      formatter={(value, name) => [
                        Array.isArray(value)
                          ? `${Number(value[0]).toLocaleString()}–${Number(value[1]).toLocaleString()}`
                          : Number(value).toLocaleString(),
                        name,
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={30}
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{ fontSize: 10 }}
                    />
                    {today && (
                      <ReferenceLine
                        x={today}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        label={{
                          value: "Forecast starts",
                          fill: "#64748b",
                          fontSize: 10,
                          position: "insideTopRight",
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="interval"
                      name="95% confidence interval"
                      stroke="none"
                      fill="#bfdbfe"
                      fillOpacity={0.45}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="historicalEstimate"
                      name="Historical estimate"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Forecast"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Historical actual"
                      stroke="#c62828"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-[10px] text-slate-600">
                Synthetic demonstration data · Model:{" "}
                {method === "moving-average"
                  ? "moving average"
                  : "weighted moving average"}
                {" · "}
                {historyDays} days history ending {DEMAND_END_DATE}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Demand pattern insights</CardTitle>
            <p className="text-xs text-slate-500">
              Calculated from the selected product, location, and history range
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {forecast && (
              <>
                <InsightRow
                  title={
                    forecast.demandGrowthPercent > 2
                      ? "Growing demand"
                      : forecast.demandGrowthPercent < -2
                        ? "Declining demand"
                        : "Stable demand"
                  }
                  detail={`Forecast average is ${forecast.demandGrowthPercent >= 0 ? "" : "−"}${Math.abs(forecast.demandGrowthPercent).toFixed(1)}% versus the historical average.`}
                  tone={
                    forecast.demandGrowthPercent > 2
                      ? "blue"
                      : forecast.demandGrowthPercent < -2
                        ? "amber"
                        : "green"
                  }
                />
                {insights.map((insight) => (
                  <InsightRow
                    key={insight.kind}
                    title={insight.title}
                    detail={insight.detail}
                    tone={insight.kind === "spike" ? "amber" : "blue"}
                  />
                ))}
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-red-100 bg-red-50/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ChartNoAxesCombined className="size-4 text-red-700" />
              <CardTitle className="text-sm">Planning recommendation</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Rule-based guidance from the selected statistical forecast
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-700">{recommendation}</p>
            <Badge variant="outline" className="mt-4 border-red-200 bg-white">
              Simulated data · no connected AI service
            </Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-32">
      <span className="mb-1.5 block text-[10px] font-medium text-slate-500">
        {label}
      </span>
      <select
        className={fieldClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function MetricCard({
  label,
  value,
  unit,
  positive,
}: {
  label: string;
  value: string;
  unit: string;
  positive?: boolean;
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-2 flex items-center gap-1">
          {positive !== undefined &&
            (positive ? (
              <ArrowUpRight className="size-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="size-4 text-amber-600" />
            ))}
          <p className="text-xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <p className="mt-1 text-[10px] text-slate-600">{unit}</p>
      </CardContent>
    </Card>
  );
}

function InsightRow({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "blue" | "amber" | "green";
}) {
  const toneClass = {
    blue: "border-blue-100 bg-blue-50/60",
    amber: "border-amber-100 bg-amber-50/60",
    green: "border-emerald-100 bg-emerald-50/60",
  }[tone];

  return (
    <article className={`rounded-lg border p-3 ${toneClass}`}>
      <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
    </article>
  );
}
