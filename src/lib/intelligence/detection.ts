import { DEMAND_END_DATE, historicalDemandRecords } from "@/data/demand";
import { inventoryRecords } from "@/data/inventory";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import { shipments } from "@/lib/mock-data";
import { getAllInventoryMetrics } from "@/lib/dashboard-data";
import type { InventoryMetrics } from "@/lib/inventory";
import { getTraceabilitySnapshot } from "@/lib/traceability/store";
import type {
  AnomalyCategory,
  AnomalyEvidence,
  AnomalySeverity,
  DemandRecord,
  InventoryRecord,
  OperationalAnomaly,
  QualityInspection,
  Shipment,
  SupplyChainBatch,
  BatchEvent,
} from "@/types";
import { supplyChainBatches } from "@/data/batches";
import { estimateUnitExposure } from "./impact";
import { generateRecommendation } from "./recommendations";
import { detectionConfigSchema, operationalAnomalySchema } from "./schema";

export interface DetectionConfig {
  demandSpikeMultiplier: number;
  demandDropMultiplier: number;
  forecastErrorThresholdPercent: number;
  stockoutCriticalDays: number;
  stockoutHighDays: number;
  stockoutWatchDays: number;
  excessInventoryDays: number;
  expiryWindowDays: number;
  batchGapHours: number;
  chilledMilkMaxTemperatureC: number;
  frozenProductMinTemperatureC: number;
  milkMinimumSnfPercent: number;
}

export const defaultDetectionConfig: DetectionConfig = {
  demandSpikeMultiplier: 1.24,
  demandDropMultiplier: 0.76,
  forecastErrorThresholdPercent: 8,
  stockoutCriticalDays: 1,
  stockoutHighDays: 2,
  stockoutWatchDays: 3,
  excessInventoryDays: 12,
  expiryWindowDays: 3,
  batchGapHours: 24,
  chilledMilkMaxTemperatureC: 4,
  frozenProductMinTemperatureC: -18,
  milkMinimumSnfPercent: 8.3,
};

export interface DetectionSources {
  demandRecords: readonly DemandRecord[];
  inventoryMetrics: readonly InventoryMetrics[];
  batches: readonly SupplyChainBatch[];
  shipments: readonly Shipment[];
  events: readonly BatchEvent[];
  inspections: readonly QualityInspection[];
  asOfDate: string;
}

export interface DetectionResult {
  anomalies: OperationalAnomaly[];
  warnings: string[];
  unavailableDetectors: string[];
}

const productById = new Map(
  products.map((product) => [product.productId, product]),
);
const locationById = new Map(
  locations.map((location) => [location.locationId, location]),
);
const CHILLED_CATEGORIES = new Set(["milk"]);

function average(values: readonly number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;
}

function validNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function confidenceForSample(
  sampleCount: number,
  deviationRatio: number,
): number {
  return (
    Math.round(
      Math.min(
        0.98,
        0.55 +
          (Math.min(sampleCount, 28) / 28) * 0.25 +
          Math.min(Math.abs(deviationRatio), 1) * 0.18,
      ) * 100,
    ) / 100
  );
}

function strengthForConfidence(
  confidence: number,
): OperationalAnomaly["evidenceStrength"] {
  return confidence >= 0.85
    ? "Strong"
    : confidence >= 0.7
      ? "Moderate"
      : "Limited";
}

function makeAnomaly(input: {
  id: string;
  ruleId: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  productId?: string;
  locationId?: string;
  batchId?: string;
  shipmentId?: string;
  detectedAt: string;
  title: string;
  explanation: string;
  observedValue: number | string | null;
  expectedValue: number | string | null;
  impactQuantity?: number | null;
  impactUnit?: string | null;
  impactAssumption: string;
  recommendationContext?: Parameters<typeof generateRecommendation>[1];
  evidence: AnomalyEvidence[];
  confidence: number;
}): OperationalAnomaly {
  const impact = estimateUnitExposure(
    input.impactQuantity ?? null,
    input.impactUnit ?? null,
    input.impactAssumption,
  );
  return operationalAnomalySchema.parse({
    ...input,
    impactQuantity: impact.quantity,
    impactUnit: impact.unit,
    estimatedFinancialExposure: impact.financialExposure,
    impactAssumption: impact.assumption,
    recommendation: generateRecommendation(
      input.category,
      input.recommendationContext ?? {
        productName: input.productId
          ? productById.get(input.productId)?.name
          : undefined,
        locationName: input.locationId
          ? locationById.get(input.locationId)?.name
          : undefined,
        batchId: input.batchId,
        shipmentId: input.shipmentId,
      },
    ),
    evidence: input.evidence,
    relatedRecordIds: input.evidence.map((item) => item.recordId),
    confidence: input.confidence,
    evidenceStrength: strengthForConfidence(input.confidence),
    status: "Open",
  });
}

function validDemandRecord(record: DemandRecord): boolean {
  return (
    typeof record.productId === "string" &&
    record.productId.length > 0 &&
    typeof record.locationId === "string" &&
    record.locationId.length > 0 &&
    Number.isFinite(Date.parse(`${record.date}T00:00:00.000Z`)) &&
    validNumber(record.actualDemand) &&
    validNumber(record.predictedDemand)
  );
}

function detectDemand(
  sources: DetectionSources,
  config: DetectionConfig,
): { anomalies: OperationalAnomaly[]; invalidCount: number } {
  const anomalies: OperationalAnomaly[] = [];
  const validRecords = sources.demandRecords.filter(validDemandRecord);
  const invalidCount = sources.demandRecords.length - validRecords.length;
  const groups = new Map<string, DemandRecord[]>();

  for (const record of validRecords) {
    const key = `${record.productId}:${record.locationId}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }

  for (const records of groups.values()) {
    records.sort((left, right) => left.date.localeCompare(right.date));
    for (let index = 28; index < records.length; index += 1) {
      const current = records[index];
      const baselineRows = records.slice(index - 28, index);
      const baseline = average(
        baselineRows.map((record) => record.actualDemand),
      );
      if (baseline <= 0) continue;

      const deviation = (current.actualDemand - baseline) / baseline;
      const productName =
        productById.get(current.productId)?.name ?? current.productId;
      const productUnit = productById.get(current.productId)?.unit ?? "units";
      const locationName =
        locationById.get(current.locationId)?.name ?? current.locationId;
      const key = `${current.productId}-${current.locationId}-${current.date}`;
      const base = {
        detectedAt: `${current.date}T12:00:00.000Z`,
        productId: current.productId,
        locationId: current.locationId,
        recommendationContext: {
          productName,
          unit: productUnit,
          locationName,
        },
        confidence: confidenceForSample(baselineRows.length, deviation),
      };

      if (deviation >= config.demandSpikeMultiplier - 1) {
        anomalies.push(
          makeAnomaly({
            ...base,
            id: `demand-spike:${key}`,
            ruleId: "demand-spike-v1",
            category: "demand-spike",
            severity: deviation >= 0.5 ? "High" : "Medium",
            title: `${productName} demand spike in ${locationName}`,
            explanation: `Actual demand was ${Math.round(deviation * 100)}% above the preceding 28 valid daily observations.`,
            observedValue: current.actualDemand,
            expectedValue: Math.round(baseline),
            impactQuantity: current.actualDemand - baseline,
            impactUnit: productUnit,
            impactAssumption:
              "Demand above the historical baseline is an estimate of potential incremental demand, not confirmed lost sales.",
            evidence: [
              {
                label: "Actual demand",
                observed: current.actualDemand,
                baseline: Math.round(baseline),
                recordId: `demand:${current.productId}:${current.locationId}:${current.date}`,
              },
            ],
          }),
        );
      } else if (deviation <= config.demandDropMultiplier - 1) {
        anomalies.push(
          makeAnomaly({
            ...base,
            id: `demand-drop:${key}`,
            ruleId: "demand-drop-v1",
            category: "demand-drop",
            severity: deviation <= -0.5 ? "High" : "Medium",
            title: `${productName} demand drop in ${locationName}`,
            explanation: `Actual demand was ${Math.round(Math.abs(deviation) * 100)}% below the preceding 28 valid daily observations.`,
            observedValue: current.actualDemand,
            expectedValue: Math.round(baseline),
            impactQuantity: baseline - current.actualDemand,
            impactUnit: productUnit,
            impactAssumption:
              "The difference from historical demand is a planning variance, not confirmed unsold inventory.",
            evidence: [
              {
                label: "Actual demand",
                observed: current.actualDemand,
                baseline: Math.round(baseline),
                recordId: `demand:${current.productId}:${current.locationId}:${current.date}`,
              },
            ],
          }),
        );
      }

      const forecastErrorPercent =
        current.actualDemand === 0
          ? 0
          : (Math.abs(current.actualDemand - current.predictedDemand) /
              current.actualDemand) *
            100;
      if (forecastErrorPercent >= config.forecastErrorThresholdPercent) {
        anomalies.push(
          makeAnomaly({
            ...base,
            id: `forecast-divergence:${key}`,
            ruleId: "forecast-divergence-v1",
            category: "forecast-divergence",
            severity: forecastErrorPercent >= 20 ? "High" : "Medium",
            title: `${productName} forecast diverged in ${locationName}`,
            explanation: `The absolute difference between the recorded prediction and actual demand was ${forecastErrorPercent.toFixed(1)}% of actual demand (threshold ${config.forecastErrorThresholdPercent}%).`,
            observedValue: current.actualDemand,
            expectedValue: current.predictedDemand,
            impactQuantity: Math.abs(
              current.actualDemand - current.predictedDemand,
            ),
            impactUnit: productUnit,
            impactAssumption:
              "Absolute forecast error is a demand-planning variance, not a financial loss.",
            evidence: [
              {
                label: "Actual vs recorded prediction",
                observed: current.actualDemand,
                baseline: current.predictedDemand,
                recordId: `demand:${current.productId}:${current.locationId}:${current.date}`,
              },
            ],
          }),
        );
      }
    }
  }

  return { anomalies, invalidCount };
}

function detectInventory(
  metrics: readonly InventoryMetrics[],
  config: DetectionConfig,
  asOfDate: string,
): { anomalies: OperationalAnomaly[]; invalidCount: number } {
  const anomalies: OperationalAnomaly[] = [];
  let invalidCount = 0;
  for (const metric of metrics) {
    const { record, product, location, daysRemaining, daysToExpiry } = metric;
    if (
      !validNumber(record.currentStock) ||
      !Number.isFinite(record.dailyDemand) ||
      record.dailyDemand <= 0 ||
      !Number.isFinite(daysRemaining) ||
      !Number.isFinite(daysToExpiry)
    ) {
      invalidCount += 1;
      continue;
    }
    const evidence = (label: string, value: number, baseline: number) => ({
      label,
      observed: Math.round(value * 10) / 10,
      baseline: Math.round(baseline * 10) / 10,
      recordId: record.inventoryId,
    });

    if (daysRemaining <= config.stockoutWatchDays) {
      const severity =
        daysRemaining <= config.stockoutCriticalDays
          ? "Critical"
          : daysRemaining <= config.stockoutHighDays
            ? "High"
            : "Medium";
      anomalies.push(
        makeAnomaly({
          id: `stockout-risk:${record.inventoryId}`,
          ruleId: "stockout-cover-v1",
          category: "stockout-risk",
          severity,
          productId: record.productId,
          locationId: record.locationId,
          detectedAt: `${asOfDate}T12:00:00.000Z`,
          title: `${product.name} stock cover is low in ${location.name}`,
          explanation: `Current stock covers an estimated ${daysRemaining.toFixed(1)} days at the recorded daily demand rate; the watch threshold is ${config.stockoutWatchDays} days.`,
          observedValue: daysRemaining,
          expectedValue: config.stockoutWatchDays,
          impactQuantity: Math.max(0, record.dailyDemand - record.currentStock),
          impactUnit: product.unit,
          impactAssumption:
            "Potential uncovered demand for one day is a planning estimate; no lost sale is confirmed.",
          recommendationContext: {
            productName: product.name,
            unit: product.unit,
            locationName: location.name,
            recommendedReorderQuantity: metric.recommendedReorderQuantity,
          },
          evidence: [
            evidence(
              "Days of stock cover",
              daysRemaining,
              config.stockoutWatchDays,
            ),
          ],
          confidence: 0.9,
        }),
      );
    }

    if (daysRemaining > config.excessInventoryDays) {
      const excess = Math.max(
        0,
        record.currentStock - record.dailyDemand * config.excessInventoryDays,
      );
      const alternate = metrics.find(
        (candidate) =>
          candidate.record.productId === record.productId &&
          candidate.record.locationId !== record.locationId &&
          candidate.daysRemaining <= config.stockoutWatchDays,
      );
      anomalies.push(
        makeAnomaly({
          id: `excess-inventory:${record.inventoryId}`,
          ruleId: "excess-cover-v1",
          category: "excess-inventory",
          severity: daysRemaining > 21 ? "High" : "Medium",
          productId: record.productId,
          locationId: record.locationId,
          detectedAt: `${asOfDate}T12:00:00.000Z`,
          title: `${product.name} has extended stock cover in ${location.name}`,
          explanation: `Current stock covers ${daysRemaining.toFixed(1)} days of recorded daily demand, above the ${config.excessInventoryDays}-day excess-stock threshold.`,
          observedValue: daysRemaining,
          expectedValue: config.excessInventoryDays,
          impactQuantity: excess,
          impactUnit: product.unit,
          impactAssumption:
            "Units above the 12-day planning threshold are exposed to holding and, where applicable, shelf-life risk; this is not a booked cost.",
          recommendationContext: {
            productName: product.name,
            locationName: location.name,
            alternateLocationName: alternate?.location.name,
          },
          evidence: [
            evidence(
              "Days of stock cover",
              daysRemaining,
              config.excessInventoryDays,
            ),
          ],
          confidence: 0.88,
        }),
      );
    }

    if (
      daysToExpiry <= config.expiryWindowDays &&
      daysToExpiry <= daysRemaining &&
      record.currentStock > 0
    ) {
      const expectedSellThrough =
        record.dailyDemand * Math.max(0, daysToExpiry);
      const quantityAtRisk = Math.max(
        0,
        record.currentStock - expectedSellThrough,
      );
      anomalies.push(
        makeAnomaly({
          id: `expiry-risk:${record.inventoryId}`,
          ruleId: "expiry-sell-through-v1",
          category: "expiry-risk",
          severity: daysToExpiry <= 1 && quantityAtRisk > 0 ? "High" : "Medium",
          productId: record.productId,
          locationId: record.locationId,
          detectedAt: `${asOfDate}T12:00:00.000Z`,
          title: `${product.name} may expire before sell-through in ${location.name}`,
          explanation:
            daysToExpiry < 0
              ? `The recorded expiry date passed ${Math.abs(daysToExpiry)} day(s) ago; stock covers ${daysRemaining.toFixed(1)} days at the current daily-demand rate.`
              : `${daysToExpiry} days remain until the recorded expiry date, while stock covers ${daysRemaining.toFixed(1)} days at the current daily-demand rate.`,
          observedValue: daysToExpiry,
          expectedValue: daysRemaining,
          impactQuantity: quantityAtRisk,
          impactUnit: product.unit,
          impactAssumption:
            "Potential unsold quantity assumes demand remains at the recorded daily rate through expiry; waste is not confirmed.",
          recommendationContext: {
            productName: product.name,
            locationName: location.name,
          },
          evidence: [
            evidence("Days to expiry", daysToExpiry, daysRemaining),
            {
              label: "Expiry date",
              observed: record.expiryDate,
              recordId: record.inventoryId,
            },
          ],
          confidence: 0.9,
        }),
      );
    }
  }
  return { anomalies, invalidCount };
}

function detectShipments(
  shipmentsData: readonly Shipment[],
  asOfDate: string,
): { anomalies: OperationalAnomaly[]; invalidCount: number } {
  const anomalies: OperationalAnomaly[] = [];
  let invalidCount = 0;
  for (const shipment of shipmentsData) {
    if (
      !shipment.id ||
      !Number.isFinite(shipment.quantityCases) ||
      shipment.quantityCases < 0 ||
      !["in-transit", "delivered", "delayed", "preparing"].includes(
        shipment.status,
      )
    ) {
      invalidCount += 1;
      continue;
    }
    if (shipment.status === "delayed") {
      anomalies.push(
        makeAnomaly({
          id: `shipment-delay:${shipment.id}`,
          ruleId: "explicit-shipment-delay-v1",
          category: "shipment-delay",
          severity: "High",
          shipmentId: shipment.id,
          detectedAt: `${asOfDate}T12:00:00.000Z`,
          title: `Shipment ${shipment.id} is marked delayed`,
          explanation: `The synthetic shipment record has an explicit delayed status. An ETA is shown but no planned-versus-actual delivery timestamps are available to calculate delay duration.`,
          observedValue: shipment.status,
          expectedValue: "in-transit or delivered",
          impactQuantity: shipment.quantityCases,
          impactUnit: "cases",
          impactAssumption:
            "All cases on a delayed shipment are treated as potentially affected; this is not a confirmed loss or delay duration.",
          recommendationContext: {
            shipmentId: shipment.id,
            locationName: shipment.destination,
          },
          evidence: [
            {
              label: "Shipment status",
              observed: shipment.status,
              baseline: `ETA ${shipment.eta}`,
              recordId: shipment.id,
            },
            {
              label: "Shipment quantity",
              observed: shipment.quantityCases,
              recordId: shipment.id,
            },
          ],
          confidence: 0.9,
        }),
      );
    }
  }
  return { anomalies, invalidCount };
}

function detectBatchGaps(
  batches: readonly SupplyChainBatch[],
  events: readonly BatchEvent[],
  config: DetectionConfig,
): { anomalies: OperationalAnomaly[]; invalidCount: number } {
  const anomalies: OperationalAnomaly[] = [];
  let invalidCount = 0;
  for (const batch of batches) {
    const history = events
      .filter((event) => event.batchId === batch.batchId)
      .filter((event) => {
        const valid = Number.isFinite(Date.parse(event.timestamp));
        if (!valid) invalidCount += 1;
        return valid;
      })
      .sort(
        (left, right) =>
          Date.parse(left.timestamp) - Date.parse(right.timestamp),
      );
    for (let index = 1; index < history.length; index += 1) {
      const previous = history[index - 1];
      const current = history[index];
      const gapHours =
        (Date.parse(current.timestamp) - Date.parse(previous.timestamp)) /
        3_600_000;
      if (!Number.isFinite(gapHours) || gapHours <= config.batchGapHours) {
        continue;
      }
      anomalies.push(
        makeAnomaly({
          id: `batch-gap:${batch.batchId}:${previous.eventId}:${current.eventId}`,
          ruleId: "batch-event-gap-v1",
          category: "batch-gap",
          severity: gapHours >= 72 ? "Critical" : "Medium",
          productId: batch.productId,
          batchId: batch.batchId,
          detectedAt: current.timestamp,
          title: `Long event gap for batch ${batch.batchId}`,
          explanation: `${current.eventType} was recorded ${gapHours.toFixed(1)} hours after ${previous.eventType}, exceeding the ${config.batchGapHours}-hour demonstration threshold.`,
          observedValue: Math.round(gapHours * 10) / 10,
          expectedValue: config.batchGapHours,
          impactAssumption:
            "Elapsed time is calculated from consecutive recorded event timestamps; missing events cannot be confirmed from this gap alone.",
          recommendationContext: { batchId: batch.batchId },
          evidence: [
            {
              label: `Previous event (${previous.eventType})`,
              observed: previous.timestamp,
              recordId: previous.eventId,
            },
            {
              label: `Next event (${current.eventType})`,
              observed: current.timestamp,
              recordId: current.eventId,
            },
          ],
          confidence: 0.82,
        }),
      );
    }
  }
  return { anomalies, invalidCount };
}

function detectQuality(
  batches: readonly SupplyChainBatch[],
  inspections: readonly QualityInspection[],
  config: DetectionConfig,
): { anomalies: OperationalAnomaly[]; invalidCount: number } {
  const batchById = new Map(batches.map((batch) => [batch.batchId, batch]));
  let invalidCount = 0;
  const anomalies = inspections.flatMap((inspection) => {
    if (
      !inspection.inspectionId ||
      !Number.isFinite(Date.parse(inspection.inspectionDate)) ||
      !Number.isFinite(inspection.temperature) ||
      !Number.isFinite(inspection.fatPercentage) ||
      !Number.isFinite(inspection.snfPercentage) ||
      inspection.fatPercentage < 0 ||
      inspection.fatPercentage > 100 ||
      inspection.snfPercentage < 0 ||
      inspection.snfPercentage > 100 ||
      !["passed", "review", "failed"].includes(inspection.qualityStatus)
    ) {
      invalidCount += 1;
      return [];
    }
    const batch = batchById.get(inspection.batchId);
    if (!batch) {
      invalidCount += 1;
      return [];
    }
    const product = productById.get(batch.productId);
    const locationId = batch.collectionCentreId;
    const productName = product?.name ?? batch.productId;
    const locationName = locationById.get(locationId)?.name ?? locationId;
    const concerns: Array<{
      category: AnomalyCategory;
      title: string;
      explanation: string;
      observed: number | string;
      expected: number | string;
      severity: AnomalySeverity;
      ruleId: string;
      impact: string;
    }> = [];

    if (inspection.qualityStatus !== "passed") {
      concerns.push({
        category: "quality-concern",
        title: `Quality inspection needs review for ${batch.batchId}`,
        explanation: `Inspection ${inspection.inspectionId} has status "${inspection.qualityStatus}".`,
        observed: inspection.qualityStatus,
        expected: "passed",
        severity: inspection.qualityStatus === "failed" ? "Critical" : "High",
        ruleId: "inspection-status-v1",
        impact: "Potentially affected batch quantity",
      });
    }
    const temperatureExcursion =
      product?.category && CHILLED_CATEGORIES.has(product.category)
        ? inspection.temperature > config.chilledMilkMaxTemperatureC
        : product?.category === "ice-cream"
          ? inspection.temperature > config.frozenProductMinTemperatureC
          : false;
    if (temperatureExcursion) {
      const threshold =
        product?.category === "ice-cream"
          ? config.frozenProductMinTemperatureC
          : config.chilledMilkMaxTemperatureC;
      concerns.push({
        category: "temperature-excursion",
        title: `Temperature outside demo threshold for ${batch.batchId}`,
        explanation: `${productName} inspection recorded ${inspection.temperature}°C; the demonstration threshold is ${product?.category === "ice-cream" ? "at or below" : "at or below"} ${threshold}°C.`,
        observed: inspection.temperature,
        expected: threshold,
        severity: inspection.temperature > threshold + 2 ? "High" : "Medium",
        ruleId: "product-temperature-demo-threshold-v1",
        impact: "Batch quantity requiring temperature review",
      });
    }
    if (
      product?.category === "milk" &&
      inspection.snfPercentage < config.milkMinimumSnfPercent
    ) {
      concerns.push({
        category: "quality-concern",
        title: `SNF reading below demo threshold for ${batch.batchId}`,
        explanation: `Recorded SNF was ${inspection.snfPercentage}%, below the ${config.milkMinimumSnfPercent}% demonstration threshold.`,
        observed: inspection.snfPercentage,
        expected: config.milkMinimumSnfPercent,
        severity: "Medium",
        ruleId: "milk-snf-demo-threshold-v1",
        impact: "Batch quantity requiring quality review",
      });
    }

    return concerns.map((concern) =>
      makeAnomaly({
        id: `${concern.category}:${concern.ruleId}:${inspection.inspectionId}`,
        ruleId: concern.ruleId,
        category: concern.category,
        severity: concern.severity,
        productId: batch.productId,
        locationId,
        batchId: batch.batchId,
        detectedAt: inspection.inspectionDate,
        title: concern.title,
        explanation: concern.explanation,
        observedValue: concern.observed,
        expectedValue: concern.expected,
        impactQuantity: batch.quantity,
        impactUnit: product?.unit ?? "units",
        impactAssumption: `${concern.impact}; the reading is synthetic and does not establish that the full quantity is affected.`,
        recommendationContext: {
          productName,
          locationName,
          batchId: batch.batchId,
        },
        evidence: [
          {
            label:
              concern.category === "quality-concern"
                ? "Quality reading"
                : "Temperature reading",
            observed: concern.observed,
            baseline: concern.expected,
            recordId: inspection.inspectionId,
          },
          {
            label: "Batch quantity",
            observed: batch.quantity,
            recordId: batch.batchId,
          },
        ],
        confidence: concern.category === "temperature-excursion" ? 0.78 : 0.9,
      }),
    );
  });
  return { anomalies, invalidCount };
}

export function runAnomalyDetection(
  sources: DetectionSources,
  config: DetectionConfig = defaultDetectionConfig,
): DetectionResult {
  const parsedConfig = detectionConfigSchema.parse(config);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(sources.asOfDate) ||
    !Number.isFinite(Date.parse(`${sources.asOfDate}T00:00:00.000Z`))
  ) {
    throw new RangeError(
      "Anomaly analysis requires a valid ISO reference date.",
    );
  }
  const demand = detectDemand(sources, parsedConfig);
  const inventory = detectInventory(
    sources.inventoryMetrics,
    parsedConfig,
    sources.asOfDate,
  );
  const shipmentsResult = detectShipments(sources.shipments, sources.asOfDate);
  const batchGaps = detectBatchGaps(
    sources.batches,
    sources.events,
    parsedConfig,
  );
  const quality = detectQuality(
    sources.batches,
    sources.inspections,
    parsedConfig,
  );
  const detected = [
    ...demand.anomalies,
    ...inventory.anomalies,
    ...shipmentsResult.anomalies,
    ...batchGaps.anomalies,
    ...quality.anomalies,
  ];
  const unique = new Map<string, OperationalAnomaly>();
  for (const anomaly of detected) {
    if (!unique.has(anomaly.id)) unique.set(anomaly.id, anomaly);
  }
  const anomalies = [...unique.values()].sort(
    (left, right) =>
      Date.parse(right.detectedAt) - Date.parse(left.detectedAt) ||
      left.id.localeCompare(right.id),
  );

  const invalidSources: Array<[string, number]> = [
    ["demand", demand.invalidCount],
    ["inventory", inventory.invalidCount],
    ["shipment", shipmentsResult.invalidCount],
    ["batch event", batchGaps.invalidCount],
    ["quality inspection", quality.invalidCount],
  ];

  return {
    anomalies,
    warnings: invalidSources
      .filter(([, count]) => count > 0)
      .map(
        ([source, count]) =>
          `Skipped ${count} invalid ${source} observation(s).`,
      ),
    unavailableDetectors: [
      "Inventory movement anomaly: no stock-movement history is present.",
      "Shipment delay duration: no planned-versus-actual delivery timestamps are present.",
    ],
  };
}

export async function getDefaultAnomalyAnalysis(
  records: readonly InventoryRecord[] = inventoryRecords,
): Promise<DetectionResult> {
  const traceability = await getTraceabilitySnapshot();
  const inventoryMetrics = getAllInventoryMetrics(records);
  const result = runAnomalyDetection({
    demandRecords: historicalDemandRecords,
    inventoryMetrics,
    batches: supplyChainBatches,
    shipments,
    events: traceability.events,
    inspections: traceability.inspections,
    asOfDate: DEMAND_END_DATE,
  });
  return {
    ...result,
    warnings: traceability.error
      ? [...result.warnings, traceability.error]
      : result.warnings,
  };
}
