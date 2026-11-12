export type ProductCategory =
  "milk" | "butter" | "cheese" | "ice-cream" | "ghee";

export interface Product {
  productId: string;
  name: string;
  category: ProductCategory;
  unit: "litres" | "kg" | "packs";
  shelfLifeDays: number;
}

export type LocationType =
  "collection-centre" | "processing-facility" | "distribution-hub";

export interface Location {
  locationId: string;
  name: string;
  city: string;
  state: string;
  locationType: LocationType;
}

export interface DemandRecord {
  date: string;
  productId: string;
  locationId: string;
  actualDemand: number;
  predictedDemand: number;
}

export interface InventoryRecord {
  inventoryId: string;
  productId: string;
  locationId: string;
  currentStock: number;
  dailyDemand: number;
  expiryDate: string;
  reorderLevel: number;
}

export type BatchStatus =
  "collected" | "processing" | "in-transit" | "delivered";

export interface SupplyChainBatch {
  batchId: string;
  productId: string;
  quantity: number;
  collectionCentre: string;
  collectionCentreId: string;
  processingFacility: string;
  processingFacilityId: string;
  distributionHub: string;
  distributionHubId: string;
  currentStatus: BatchStatus;
  createdAt: string;
}

export const batchEventTypes = [
  "PROCUREMENT",
  "QUALITY_INSPECTION",
  "COLLECTION",
  "CHILLING",
  "PROCESSING",
  "PACKAGING",
  "DISPATCH",
  "CUSTODY_TRANSFER",
  "DELIVERY",
] as const;

export type BatchEventType = (typeof batchEventTypes)[number];

export interface BatchEvent {
  eventId: string;
  batchId: string;
  eventType: BatchEventType;
  timestamp: string;
  locationId: string;
  actorRole: string;
  description: string;
  metadata: Record<string, unknown>;
  previousHash: string;
  eventHash: string;
}

export type QualityStatus = "passed" | "review" | "failed";

export interface QualityInspection {
  inspectionId: string;
  batchId: string;
  inspectionDate: string;
  temperature: number;
  fatPercentage: number;
  snfPercentage: number;
  qualityStatus: QualityStatus;
  inspectorRole: string;
  remarks: string;
}

export type ForecastMethod = "moving-average" | "weighted-moving-average";
export type ForecastHorizon = 7 | 14 | 30;

export interface ForecastPoint {
  date: string;
  demand: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastMetrics {
  averageDemand: number;
  forecastAverage: number;
  forecastTotal: number;
  demandGrowthPercent: number;
  forecastAccuracy: number;
  meanAbsoluteError: number;
  meanAbsolutePercentageError: number | null;
}

export interface InsightItem {
  id: string;
  title: string;
  detail: string;
  impact: string;
  priority: "high" | "medium" | "low";
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind:
    "shipment" | "inventory" | "quality" | "traceability" | "stock-adjustment";
}

export interface StoredActivity {
  id: string;
  message: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  destination: string;
  carrier: string;
  eta: string;
  status: "in-transit" | "delivered" | "delayed" | "preparing";
  quantityCases: number;
}

export interface RegionalInventorySummary {
  region: string;
  state: string;
  riskPercent: number;
  monitoredFacilities: number;
  status: "Healthy" | "Watch" | "Attention";
}

export type AnomalyCategory =
  | "demand-spike"
  | "demand-drop"
  | "forecast-divergence"
  | "stockout-risk"
  | "excess-inventory"
  | "expiry-risk"
  | "shipment-delay"
  | "batch-gap"
  | "temperature-excursion"
  | "quality-concern";

export type AnomalySeverity = "Critical" | "High" | "Medium" | "Low";
export type AnomalyStatus = "Open" | "Acknowledged" | "Resolved";
export type EvidenceStrength = "Strong" | "Moderate" | "Limited";

export interface AnomalyEvidence {
  label: string;
  observed: string | number;
  baseline?: string | number;
  recordId: string;
}

export interface OperationalAnomaly {
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
  impactQuantity: number | null;
  impactUnit: string | null;
  estimatedFinancialExposure: number | null;
  impactAssumption: string;
  recommendation: string;
  evidence: AnomalyEvidence[];
  relatedRecordIds: string[];
  confidence: number;
  evidenceStrength: EvidenceStrength;
  status: AnomalyStatus;
}
