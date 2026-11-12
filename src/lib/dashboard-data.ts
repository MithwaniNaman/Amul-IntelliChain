import { historicalDemandRecords } from "@/data/demand";
import { inventoryRecords } from "@/data/inventory";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import { supplyChainBatches } from "@/data/batches";
import { DEMAND_END_DATE } from "@/data/demand";
import { forecastDemand, type ForecastResult } from "@/lib/forecasting/engine";
import {
  calculateInventoryMetrics,
  calculateInventoryRiskPercent,
  type InventoryMetrics,
} from "@/lib/inventory";
import type {
  ForecastMethod,
  InsightItem,
  InventoryRecord,
  RegionalInventorySummary,
} from "@/types";

export interface DashboardDemandPoint {
  date: string;
  actual: number | null;
  forecast: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  confidenceInterval: [number, number] | null;
}

export type OverviewForecastSummary = Pick<
  ForecastResult,
  "productId" | "locationId" | "demandGrowthPercent" | "forecastTotal"
>;

export const DEFAULT_FORECAST_METHOD: ForecastMethod =
  "weighted-moving-average";

const demandBySelection = new Map<string, typeof historicalDemandRecords>();

for (const record of historicalDemandRecords) {
  const key = `${record.productId}:${record.locationId}`;
  const selectionRecords = demandBySelection.get(key);
  if (selectionRecords) {
    selectionRecords.push(record);
  } else {
    demandBySelection.set(key, [record]);
  }
}

export function getForecastForSelection(
  productId: string,
  locationId: string,
  horizon: 7 | 14 | 30 = 7,
  method: ForecastMethod = DEFAULT_FORECAST_METHOD,
  historyDays = 90,
): ForecastResult {
  const selectionRecords =
    demandBySelection.get(`${productId}:${locationId}`) ?? [];
  return forecastDemand(selectionRecords, {
    productId,
    locationId,
    horizon,
    method,
    historyDays,
    asOfDate: DEMAND_END_DATE,
  });
}

export function getDashboardDemandData(
  forecast: ForecastResult,
): DashboardDemandPoint[] {
  const historical = forecast.history.slice(-28).map((record) => ({
    date: record.date.slice(5),
    actual: record.actualDemand,
    forecast: record.predictedDemand,
    lowerBound: null,
    upperBound: null,
    confidenceInterval: null,
  }));
  const future = forecast.forecast.map((point) => ({
    date: point.date.slice(5),
    actual: null,
    forecast: point.demand,
    lowerBound: point.lowerBound,
    upperBound: point.upperBound,
    confidenceInterval: [point.lowerBound, point.upperBound] as [
      number,
      number,
    ],
  }));

  return [...historical, ...future];
}

export function getAllInventoryMetrics(
  records: readonly InventoryRecord[] = inventoryRecords,
): InventoryMetrics[] {
  const productById = new Map(
    products.map((product) => [product.productId, product]),
  );
  const locationById = new Map(
    locations.map((location) => [location.locationId, location]),
  );

  return records.flatMap((record) => {
    const product = productById.get(record.productId);
    const location = locationById.get(record.locationId);
    if (!product || !location) {
      return [];
    }

    const forecast = getForecastForSelection(
      record.productId,
      record.locationId,
    );
    return [
      calculateInventoryMetrics(
        record,
        product,
        location,
        forecast,
        DEMAND_END_DATE,
      ),
    ];
  });
}

export const dashboardInventoryMetrics = getAllInventoryMetrics();

export function getRegionalInventorySummaries(
  metrics: readonly InventoryMetrics[],
): RegionalInventorySummary[] {
  return locations.reduce((regions, location) => {
    const existing = regions.find((region) => region.state === location.state);
    const locationMetrics = metrics.filter(
      (metric) => metric.location.locationId === location.locationId,
    );
    const riskPercent = calculateInventoryRiskPercent(locationMetrics);
    const status =
      riskPercent >= 50 ? "Attention" : riskPercent >= 25 ? "Watch" : "Healthy";

    if (existing) {
      existing.riskPercent = Math.round(
        (existing.riskPercent * existing.monitoredFacilities + riskPercent) /
          (existing.monitoredFacilities + 1),
      );
      existing.monitoredFacilities += 1;
      if (
        status === "Attention" ||
        (status === "Watch" && existing.status === "Healthy")
      ) {
        existing.status = status;
      }
    } else {
      regions.push({
        region: location.state,
        state: location.state,
        riskPercent,
        monitoredFacilities: 1,
        status,
      });
    }
    return regions;
  }, [] as RegionalInventorySummary[]);
}

export const regionalInventory = getRegionalInventorySummaries(
  dashboardInventoryMetrics,
);

export function getOperationalInsights(
  forecast: OverviewForecastSummary,
  inventory: readonly InventoryMetrics[],
): InsightItem[] {
  const product = products.find(
    (item) => item.productId === forecast.productId,
  );
  const location = locations.find(
    (item) => item.locationId === forecast.locationId,
  );
  const name = product?.name ?? "Selected product";
  const city = location?.city ?? "selected location";
  const highestRisk = [...inventory].sort(
    (left, right) => left.daysRemaining - right.daysRemaining,
  )[0];
  const trendTitle =
    forecast.demandGrowthPercent > 2
      ? "Demand is trending upward"
      : forecast.demandGrowthPercent < -2
        ? "Demand is trending downward"
        : "Demand is relatively stable";
  const trendDetail =
    forecast.demandGrowthPercent > 2
      ? `Calculated ${name} demand in ${city} is up ${forecast.demandGrowthPercent.toFixed(1)}% against its historical average.`
      : forecast.demandGrowthPercent < -2
        ? `Calculated ${name} demand in ${city} is down ${Math.abs(forecast.demandGrowthPercent).toFixed(1)}% against its historical average.`
        : `Calculated ${name} demand in ${city} is within 2% of its historical average.`;

  const insights: InsightItem[] = [
    {
      id: "forecast-trend",
      title: trendTitle,
      detail: trendDetail,
      impact: `Forecast total: ${Math.round(forecast.forecastTotal).toLocaleString()} units`,
      priority: forecast.demandGrowthPercent > 5 ? "high" : "medium",
    },
  ];

  if (highestRisk && highestRisk.health !== "Healthy") {
    insights.push({
      id: "inventory-risk",
      title: `${highestRisk.product.name} stock needs review in ${highestRisk.location.city}`,
      detail: `${highestRisk.daysRemaining.toFixed(1)} days of cover remain; health classification is ${highestRisk.health.toLowerCase()}.`,
      impact: `Suggested reorder: ${highestRisk.recommendedReorderQuantity.toLocaleString()} ${highestRisk.product.unit}`,
      priority: highestRisk.health === "Critical" ? "high" : "medium",
    });
  }

  const activeBatches = supplyChainBatches.filter(
    (batch) => batch.currentStatus !== "delivered",
  ).length;
  insights.push({
    id: "batch-monitoring",
    title: "Traceability records are ready for review",
    detail: `${activeBatches} of ${supplyChainBatches.length} synthetic batches are still in progress.`,
    impact: "Demo batch data only",
    priority: "low",
  });

  return insights.slice(0, 3);
}
