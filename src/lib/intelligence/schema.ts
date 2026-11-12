import { z } from "zod";

export const detectionConfigSchema = z.object({
  demandSpikeMultiplier: z.number().finite().gt(1),
  demandDropMultiplier: z.number().finite().gt(0).lt(1),
  forecastErrorThresholdPercent: z.number().finite().nonnegative(),
  stockoutCriticalDays: z.number().finite().positive(),
  stockoutHighDays: z.number().finite().positive(),
  stockoutWatchDays: z.number().finite().positive(),
  excessInventoryDays: z.number().finite().positive(),
  expiryWindowDays: z.number().finite().nonnegative(),
  batchGapHours: z.number().finite().positive(),
  chilledMilkMaxTemperatureC: z.number().finite(),
  frozenProductMinTemperatureC: z.number().finite(),
  milkMinimumSnfPercent: z.number().finite().min(0).max(100),
});

export const anomalyCategories = [
  "demand-spike",
  "demand-drop",
  "forecast-divergence",
  "stockout-risk",
  "excess-inventory",
  "expiry-risk",
  "shipment-delay",
  "batch-gap",
  "temperature-excursion",
  "quality-concern",
] as const;

export const operationalAnomalySchema = z.object({
  id: z.string().min(1),
  ruleId: z.string().min(1),
  category: z.enum(anomalyCategories),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  productId: z.string().optional(),
  locationId: z.string().optional(),
  batchId: z.string().optional(),
  shipmentId: z.string().optional(),
  detectedAt: z.iso.datetime({ offset: true }),
  title: z.string().min(1),
  explanation: z.string().min(1),
  observedValue: z.union([z.number().finite(), z.string()]).nullable(),
  expectedValue: z.union([z.number().finite(), z.string()]).nullable(),
  impactQuantity: z.number().finite().nonnegative().nullable(),
  impactUnit: z.string().nullable(),
  estimatedFinancialExposure: z.number().finite().nonnegative().nullable(),
  impactAssumption: z.string().min(1),
  recommendation: z.string().min(1),
  evidence: z.array(
    z.object({
      label: z.string().min(1),
      observed: z.union([z.number().finite(), z.string()]),
      baseline: z.union([z.number().finite(), z.string()]).optional(),
      recordId: z.string().min(1),
    }),
  ),
  relatedRecordIds: z.array(z.string().min(1)),
  confidence: z.number().finite().min(0).max(1),
  evidenceStrength: z.enum(["Strong", "Moderate", "Limited"]),
  status: z.enum(["Open", "Acknowledged", "Resolved"]),
});
