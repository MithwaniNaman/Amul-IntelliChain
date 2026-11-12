import type { ForecastResult } from "@/lib/forecasting/engine";
import type { InventoryRecord, Location, Product } from "@/types";

export type StockHealth = "Healthy" | "Low stock" | "Critical" | "Expiry risk";

export interface InventoryMetrics {
  record: InventoryRecord;
  product: Product;
  location: Location;
  daysRemaining: number;
  daysToExpiry: number;
  stockoutRisk: "Low" | "Medium" | "High";
  health: StockHealth;
  recommendedReorderQuantity: number;
  forecastAverageDailyDemand: number;
}

export function calculateDaysRemaining(
  currentStock: number,
  dailyDemand: number,
): number {
  if (!Number.isFinite(currentStock) || currentStock < 0) {
    throw new RangeError("Current stock must be a non-negative number.");
  }
  if (!Number.isFinite(dailyDemand) || dailyDemand <= 0) {
    return 0;
  }

  return Math.round((currentStock / dailyDemand) * 10) / 10;
}

export function calculateDaysToExpiry(
  expiryDate: string,
  asOfDate: string,
): number {
  const expiry = Date.parse(`${expiryDate}T00:00:00.000Z`);
  const asOf = Date.parse(`${asOfDate}T00:00:00.000Z`);
  if (!Number.isFinite(expiry) || !Number.isFinite(asOf)) {
    throw new RangeError("Expiry and reference dates must be valid ISO dates.");
  }

  return Math.ceil((expiry - asOf) / 86_400_000);
}

export function calculateInventoryMetrics(
  record: InventoryRecord,
  product: Product,
  location: Location,
  forecast: ForecastResult,
  asOfDate: string,
): InventoryMetrics {
  const daysRemaining = calculateDaysRemaining(
    record.currentStock,
    record.dailyDemand,
  );
  const daysToExpiry = calculateDaysToExpiry(record.expiryDate, asOfDate);
  const expiringBeforeSale = daysToExpiry <= daysRemaining;
  const health: StockHealth =
    expiringBeforeSale && daysToExpiry <= 3
      ? "Expiry risk"
      : daysRemaining < 1
        ? "Critical"
        : daysRemaining <= 3 || record.currentStock <= record.reorderLevel
          ? "Low stock"
          : "Healthy";
  const stockoutRisk =
    daysRemaining < 1 ? "High" : daysRemaining <= 3 ? "Medium" : "Low";
  const targetStock = Math.max(record.reorderLevel * 2, forecast.forecastTotal);

  return {
    record,
    product,
    location,
    daysRemaining,
    daysToExpiry,
    stockoutRisk,
    health,
    recommendedReorderQuantity: Math.max(
      0,
      Math.ceil(targetStock - record.currentStock),
    ),
    forecastAverageDailyDemand: forecast.forecastAverage,
  };
}

export function calculateInventoryRiskPercent(
  metrics: readonly InventoryMetrics[],
): number {
  if (metrics.length === 0) {
    return 0;
  }

  const atRisk = metrics.filter((item) => item.health !== "Healthy").length;
  return Math.round((atRisk / metrics.length) * 1000) / 10;
}
