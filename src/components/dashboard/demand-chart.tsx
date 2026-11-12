"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardDemandPoint } from "@/lib/dashboard-data";

export function DemandChart({ data }: { data: DashboardDemandPoint[] }) {
  return (
    <Card className="h-full border-slate-200/80 shadow-sm shadow-slate-900/[0.02]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold text-slate-900">
            Demand vs. actual
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            Full Cream Milk · Delhi · litres per day
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
          28 days + 7-day forecast
        </span>
      </CardHeader>
      <CardContent className="px-2 pt-3 sm:px-4">
        <div
          className="h-[270px] w-full"
          role="img"
          aria-label="Line chart comparing actual and forecast daily litres for Full Cream Milk in Delhi, including 28 historical days and a 7-day synthetic forecast."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 0, left: -14 }}
            >
              <defs>
                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#eef1f5"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={(value: number) => value.toLocaleString()}
                width={42}
              />
              <Tooltip
                cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, .08)",
                  fontSize: 12,
                }}
                formatter={(value) => [
                  Array.isArray(value)
                    ? `${Number(value[0]).toLocaleString()}–${Number(value[1]).toLocaleString()} litres`
                    : `${Number(value).toLocaleString()} litres`,
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 10, color: "#64748b" }}
              />
              <Area
                type="monotone"
                dataKey="confidenceInterval"
                name="95% confidence interval"
                stroke="none"
                fill="#bfdbfe"
                fillOpacity={0.45}
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#forecastFill)"
                activeDot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#c62828"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#c62828", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="px-2 pb-1 text-[10px] text-slate-600">
          Simulated demonstration data · not a live operational feed
        </p>
      </CardContent>
    </Card>
  );
}
