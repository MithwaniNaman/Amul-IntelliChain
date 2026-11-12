import assert from "node:assert/strict";
import test from "node:test";

import { forecastDemand } from "./forecasting/engine";
import {
  calculateDaysRemaining,
  calculateDaysToExpiry,
  calculateInventoryMetrics,
} from "./inventory";
import type { DemandRecord, InventoryRecord, Location, Product } from "@/types";

const product: Product = {
  productId: "full-cream-milk",
  name: "Full Cream Milk",
  category: "milk",
  unit: "litres",
  shelfLifeDays: 7,
};
const location: Location = {
  locationId: "delhi",
  name: "Delhi Hub",
  city: "Delhi",
  state: "Delhi",
  locationType: "distribution-hub",
};
const history: DemandRecord[] = Array.from({ length: 35 }, (_, index) => {
  const date = new Date("2026-11-12T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - (34 - index));
  return {
    date: date.toISOString().slice(0, 10),
    productId: product.productId,
    locationId: location.locationId,
    actualDemand: 10,
    predictedDemand: 10,
  };
});

function makeForecast() {
  return forecastDemand(history, {
    productId: product.productId,
    locationId: location.locationId,
    horizon: 7,
    method: "moving-average",
    historyDays: 35,
    asOfDate: "2026-11-12",
  });
}

function makeInventory(
  currentStock: number,
  expiryDate: string,
): InventoryRecord {
  return {
    inventoryId: "INV-001",
    productId: product.productId,
    locationId: location.locationId,
    currentStock,
    dailyDemand: 10,
    expiryDate,
    reorderLevel: 30,
  };
}

test("calculates days of cover and rejects invalid stock values", () => {
  assert.equal(calculateDaysRemaining(25, 10), 2.5);
  assert.equal(calculateDaysRemaining(25, 0), 0);
  assert.throws(() => calculateDaysRemaining(-1, 10), RangeError);
  assert.equal(calculateDaysToExpiry("2026-11-15", "2026-11-12"), 3);
  assert.throws(
    () => calculateDaysToExpiry("invalid", "2026-11-12"),
    RangeError,
  );
});

test("classifies stockout and expiry risks and calculates forecast-informed reorder", () => {
  const critical = calculateInventoryMetrics(
    makeInventory(5, "2026-11-20"),
    product,
    location,
    makeForecast(),
    "2026-11-12",
  );
  assert.equal(critical.daysRemaining, 0.5);
  assert.equal(critical.health, "Critical");
  assert.equal(critical.stockoutRisk, "High");
  assert.equal(critical.recommendedReorderQuantity, 65);

  const expiryRisk = calculateInventoryMetrics(
    makeInventory(100, "2026-11-14"),
    product,
    location,
    makeForecast(),
    "2026-11-12",
  );
  assert.equal(expiryRisk.health, "Expiry risk");
  assert.equal(expiryRisk.stockoutRisk, "Low");
});
