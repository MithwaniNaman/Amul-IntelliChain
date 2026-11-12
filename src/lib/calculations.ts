import { calculateForecastErrors } from "@/lib/forecasting/engine";
import type { InventoryRecord } from "@/types";

export function calculateForecastAccuracy(
  actual: readonly number[],
  forecast: readonly number[],
): number {
  return calculateForecastErrors(actual, forecast).forecastAccuracy;
}

export function calculateDaysOfCover(
  inventory: Pick<InventoryRecord, "currentStock" | "dailyDemand">,
): number {
  if (inventory.dailyDemand <= 0) {
    return 0;
  }

  return Math.round((inventory.currentStock / inventory.dailyDemand) * 10) / 10;
}

export function isInventoryAtRisk(
  inventory: Pick<
    InventoryRecord,
    "currentStock" | "dailyDemand" | "reorderLevel"
  >,
): boolean {
  return (
    inventory.currentStock <= inventory.reorderLevel ||
    calculateDaysOfCover(inventory) < 2
  );
}
