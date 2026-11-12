import assert from "node:assert/strict";
import test from "node:test";

import type { InventoryMetrics } from "@/lib/inventory";
import {
  estimateUnitExposure,
  filterAnomalies,
  generateRecommendation,
  getDefaultAnomalyAnalysis,
  getAnomalyWorkflowSnapshot,
  resetAnomalyWorkflow,
  runAnomalyDetection,
  setAnomalyStatus,
} from "@/lib/intelligence";
import type { BatchEvent, DemandRecord, QualityInspection } from "@/types";
import type { DetectionSources } from "./detection";

function makeDemandHistory(lastActual = 160, lastPrediction = 100) {
  const history: DemandRecord[] = [];
  for (let day = 0; day < 29; day += 1) {
    const date = new Date(Date.UTC(2026, 0, day + 1))
      .toISOString()
      .slice(0, 10);
    history.push({
      date,
      productId: "full-cream-milk",
      locationId: "mumbai",
      actualDemand: day === 28 ? lastActual : 100,
      predictedDemand: day === 28 ? lastPrediction : 100,
    });
  }
  return history;
}

function createSources(
  overrides: Partial<DetectionSources> = {},
): DetectionSources {
  return {
    demandRecords: [],
    inventoryMetrics: [],
    batches: [],
    shipments: [],
    events: [],
    inspections: [],
    asOfDate: "2026-01-29",
    ...overrides,
  };
}

function createInventoryMetric(
  overrides: Partial<InventoryMetrics> = {},
): InventoryMetrics {
  const record = {
    inventoryId: "INV-full-cream-milk-mumbai",
    productId: "full-cream-milk",
    locationId: "mumbai",
    currentStock: 80,
    dailyDemand: 100,
    expiryDate: "2026-01-30",
    reorderLevel: 300,
  };
  return {
    record,
    product: {
      productId: record.productId,
      name: "Full Cream Milk",
      category: "milk",
      unit: "litres",
      shelfLifeDays: 3,
    },
    location: {
      locationId: record.locationId,
      name: "Mumbai Hub",
      city: "Mumbai",
      state: "Maharashtra",
      locationType: "distribution-hub",
    },
    daysRemaining: 0.8,
    daysToExpiry: 1,
    stockoutRisk: "High",
    health: "Critical",
    recommendedReorderQuantity: 920,
    forecastAverageDailyDemand: 100,
    ...overrides,
  };
}

test("detects demand spikes and forecast divergence with explainable evidence", () => {
  const result = runAnomalyDetection(
    createSources({ demandRecords: makeDemandHistory() }),
  );
  const spike = result.anomalies.find(
    (anomaly) => anomaly.category === "demand-spike",
  );
  const divergence = result.anomalies.find(
    (anomaly) => anomaly.category === "forecast-divergence",
  );

  assert.equal(spike?.severity, "High");
  assert.equal(spike?.expectedValue, 100);
  assert.equal(spike?.impactUnit, "litres");
  assert.equal(
    spike?.evidence[0].recordId,
    "demand:full-cream-milk:mumbai:2026-01-29",
  );
  assert.equal(spike?.confidence, 0.91);
  assert.match(spike?.recommendation ?? "", /demand plan/i);
  assert.equal(divergence?.severity, "High");
  assert.equal(divergence?.impactQuantity, 60);
  assert.equal(divergence?.estimatedFinancialExposure, null);
});

test("classifies stockout severity and calculates transparent unit impact", () => {
  const result = runAnomalyDetection(
    createSources({ inventoryMetrics: [createInventoryMetric()] }),
  );
  const stockout = result.anomalies.find(
    (anomaly) => anomaly.category === "stockout-risk",
  );

  assert.equal(stockout?.severity, "Critical");
  assert.equal(stockout?.impactQuantity, 20);
  assert.equal(stockout?.impactUnit, "litres");
  assert.match(stockout?.recommendation ?? "", /920 litres/);
  assert.equal(stockout?.estimatedFinancialExposure, null);
  assert.match(stockout?.impactAssumption ?? "", /no product prices/i);
});

test("detects demand drops, excess stock, expiry exposure, and quality readings", () => {
  const history = makeDemandHistory(60, 60);
  const excess = createInventoryMetric({
    record: {
      inventoryId: "INV-EXCESS",
      productId: "full-cream-milk",
      locationId: "mumbai",
      currentStock: 1_500,
      dailyDemand: 100,
      expiryDate: "2026-03-01",
      reorderLevel: 300,
    },
    daysRemaining: 15,
    daysToExpiry: 31,
    health: "Healthy",
  });
  const nearExpiry = createInventoryMetric({
    record: {
      inventoryId: "INV-EXPIRY",
      productId: "full-cream-milk",
      locationId: "mumbai",
      currentStock: 400,
      dailyDemand: 100,
      expiryDate: "2026-01-30",
      reorderLevel: 300,
    },
    daysRemaining: 4,
    daysToExpiry: 1,
    health: "Expiry risk",
  });
  const batch = {
    batchId: "B-QUALITY",
    productId: "toned-milk",
    quantity: 500,
    collectionCentre: "Collection",
    collectionCentreId: "rajkot",
    processingFacility: "Processing",
    processingFacilityId: "ahmedabad",
    distributionHub: "Hub",
    distributionHubId: "delhi",
    currentStatus: "processing" as const,
    createdAt: "2026-01-29T00:00:00Z",
  };
  const inspection: QualityInspection = {
    inspectionId: "QI-REVIEW",
    batchId: batch.batchId,
    inspectionDate: "2026-01-29T10:00:00Z",
    temperature: 5.2,
    fatPercentage: 3.1,
    snfPercentage: 8.1,
    qualityStatus: "review",
    inspectorRole: "inspector",
    remarks: "Synthetic reading for testing.",
  };
  const result = runAnomalyDetection(
    createSources({
      demandRecords: history,
      inventoryMetrics: [excess, nearExpiry],
      batches: [batch],
      inspections: [inspection],
    }),
  );
  const categories = new Set(
    result.anomalies.map((anomaly) => anomaly.category),
  );

  assert.ok(categories.has("demand-drop"));
  assert.ok(categories.has("excess-inventory"));
  assert.ok(categories.has("expiry-risk"));
  assert.ok(categories.has("quality-concern"));
  assert.ok(categories.has("temperature-excursion"));
  assert.equal(
    result.anomalies.find((anomaly) => anomaly.category === "expiry-risk")
      ?.impactQuantity,
    300,
  );
});

test("detects explicit shipment delay and batch event gaps without inventing timestamps", () => {
  const batch = {
    batchId: "B-1",
    productId: "full-cream-milk",
    quantity: 100,
    collectionCentre: "Collection",
    collectionCentreId: "anand",
    processingFacility: "Processing",
    processingFacilityId: "ahmedabad",
    distributionHub: "Hub",
    distributionHubId: "mumbai",
    currentStatus: "in-transit" as const,
    createdAt: "2026-01-29T00:00:00Z",
  };
  const events: BatchEvent[] = [
    {
      eventId: "B-1-E1",
      batchId: "B-1",
      eventType: "COLLECTION",
      timestamp: "2026-01-29T00:00:00Z",
      locationId: "anand",
      actorRole: "operator",
      description: "Synthetic checkpoint",
      metadata: {},
      previousHash: "a".repeat(64),
      eventHash: "b".repeat(64),
    },
    {
      eventId: "B-1-E2",
      batchId: "B-1",
      eventType: "PROCESSING",
      timestamp: "2026-01-30T01:00:00Z",
      locationId: "ahmedabad",
      actorRole: "operator",
      description: "Synthetic checkpoint",
      metadata: {},
      previousHash: "b".repeat(64),
      eventHash: "c".repeat(64),
    },
  ];
  const result = runAnomalyDetection(
    createSources({
      batches: [batch],
      events,
      shipments: [
        {
          id: "SHP-DELAYED",
          destination: "Mumbai Hub",
          carrier: "Demo carrier",
          eta: "2:30 PM",
          status: "delayed",
          quantityCases: 20,
        },
      ],
    }),
  );

  const shipmentDelay = result.anomalies.find(
    (anomaly) => anomaly.category === "shipment-delay",
  );
  const batchGap = result.anomalies.find(
    (anomaly) => anomaly.category === "batch-gap",
  );
  assert.equal(shipmentDelay?.observedValue, "delayed");
  assert.equal(shipmentDelay?.expectedValue, "in-transit or delivered");
  assert.equal(shipmentDelay?.impactQuantity, 20);
  assert.equal(batchGap?.observedValue, 25);
  assert.equal(batchGap?.severity, "Medium");
});

test("reports invalid or missing observations and skips them safely", () => {
  const invalidDemand = {
    date: "2026-01-29",
    productId: "full-cream-milk",
    locationId: "mumbai",
    actualDemand: Number.NaN,
    predictedDemand: 1,
  } as DemandRecord;
  const invalidInspection = {
    inspectionId: "QI-BAD",
    batchId: "B-1",
    inspectionDate: "2026-01-29T00:00:00Z",
    temperature: undefined,
    fatPercentage: 3,
    snfPercentage: 9,
    qualityStatus: "review",
    inspectorRole: "inspector",
    remarks: "",
  } as unknown as QualityInspection;
  const nonfiniteInspection = {
    ...invalidInspection,
    inspectionId: "QI-NONFINITE",
    temperature: Number.NaN,
  } as QualityInspection;
  const result = runAnomalyDetection(
    createSources({
      demandRecords: [invalidDemand],
      inspections: [invalidInspection, nonfiniteInspection],
    }),
  );

  assert.equal(result.anomalies.length, 0);
  assert.equal(result.warnings.length, 2);
  assert.ok(result.warnings.some((warning) => warning.includes("demand")));
  assert.ok(
    result.warnings.some((warning) => warning.includes("quality inspection")),
  );
});

test("detects seeded shipment, inventory, and quality anomalies from shared fixtures", async () => {
  const result = await getDefaultAnomalyAnalysis();
  const delay = result.anomalies.find(
    (anomaly) => anomaly.id === "shipment-delay:SHP-88416",
  );
  const temperature = result.anomalies.find(
    (anomaly) =>
      anomaly.category === "temperature-excursion" &&
      anomaly.relatedRecordIds.includes("QI-RJ-20261112-02"),
  );
  const qualityReview = result.anomalies.find(
    (anomaly) =>
      anomaly.category === "quality-concern" &&
      anomaly.relatedRecordIds.includes("QI-RJ-20261112-02"),
  );
  const stockout = result.anomalies.find(
    (anomaly) => anomaly.id === "stockout-risk:INV-cheese-mumbai",
  );

  assert.equal(delay?.impactQuantity, 980);
  assert.equal(delay?.impactUnit, "cases");
  assert.equal(temperature?.observedValue, 4.7);
  assert.equal(temperature?.expectedValue, 4);
  assert.equal(qualityReview?.observedValue, "review");
  assert.equal(stockout?.observedValue, 0.8);
});

test("deduplicates repeated demand observations deterministically", () => {
  const history = makeDemandHistory();
  const result = runAnomalyDetection(
    createSources({ demandRecords: [...history, history.at(-1)!] }),
  );
  const ids = result.anomalies.map((anomaly) => anomaly.id);
  assert.equal(ids.length, new Set(ids).size);
});

test("estimates unit exposure without presenting it as financial loss", () => {
  const estimate = estimateUnitExposure(
    12.34,
    "litres",
    "Potential quantity above the sell-through rate.",
  );
  assert.equal(estimate.quantity, 12.3);
  assert.equal(estimate.financialExposure, null);
  assert.match(estimate.assumption, /no product prices/i);
  assert.match(
    generateRecommendation("shipment-delay", { shipmentId: "SHP-1" }),
    /SHP-1/,
  );
});

test("filters by query and status and persists workflow changes", () => {
  const [anomaly] = runAnomalyDetection(
    createSources({ demandRecords: makeDemandHistory() }),
  ).anomalies;
  assert.ok(anomaly);
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map<string, string>();
  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });

  try {
    resetAnomalyWorkflow();
    const acknowledged = setAnomalyStatus(
      anomaly.id,
      "Acknowledged",
      [anomaly],
      "2026-01-29T12:00:00.000Z",
    );
    assert.equal(acknowledged.statuses[anomaly.id]?.status, "Acknowledged");
    const resolved = setAnomalyStatus(
      anomaly.id,
      "Resolved",
      [anomaly],
      "2026-01-29T13:00:00.000Z",
    );
    assert.equal(resolved.statuses[anomaly.id]?.status, "Resolved");
    assert.equal(getAnomalyWorkflowSnapshot().activities.length, 2);
    assert.equal(
      filterAnomalies([{ ...anomaly, status: "Acknowledged" }], {
        query: "full-cream-milk",
        status: "Acknowledged",
      }).length,
      1,
    );
    assert.equal(
      filterAnomalies([anomaly], {
        category: anomaly.category,
        severity: anomaly.severity,
      }).length,
      1,
    );
    assert.equal(
      filterAnomalies([anomaly], { query: "not-a-match" }).length,
      0,
    );
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  }
});
