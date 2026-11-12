import type { AnomalyCategory, OperationalAnomaly } from "@/types";

export interface RecommendationContext {
  productName?: string;
  unit?: string;
  locationName?: string;
  inventoryCoverDays?: number;
  recommendedReorderQuantity?: number;
  alternateLocationName?: string;
  batchId?: string;
  shipmentId?: string;
}

export function generateRecommendation(
  category: AnomalyCategory,
  context: RecommendationContext,
): string {
  const product = context.productName ?? "the affected product";
  const location = context.locationName ?? "the affected location";

  switch (category) {
    case "demand-spike":
      return `Review the ${product} demand plan for ${location} and compare replenishment needs with available stock before changing orders.`;
    case "demand-drop":
      return `Validate the ${product} demand drop in ${location} with the local operations team before reducing planned replenishment.`;
    case "forecast-divergence":
      return `Review recent ${product} actuals and the forecast for ${location} before using the current projection in a replenishment decision.`;
    case "stockout-risk":
      return `Prioritize a stock check for ${product} in ${location}; the calculated reorder suggestion is ${Math.max(0, Math.round(context.recommendedReorderQuantity ?? 0)).toLocaleString()} ${context.unit ?? "units"}.`;
    case "excess-inventory":
      return context.alternateLocationName
        ? `Review planned replenishment for ${product} in ${location} and assess a safe transfer to ${context.alternateLocationName}.`
        : `Review planned replenishment and shelf-life constraints for ${product} in ${location}; avoid adding stock until the excess is understood.`;
    case "expiry-risk":
      return `Prioritize first-expiry-first-out handling for ${product} in ${location} and assess whether safe redistribution is possible before expiry.`;
    case "shipment-delay":
      return `Contact the carrier for ${context.shipmentId ?? "the affected shipment"}, confirm its current status and revised arrival time, and notify ${location}.`;
    case "batch-gap":
      return `Ask the responsible operator to verify the missing milestone for ${context.batchId ?? "the affected batch"} and record a confirmed event.`;
    case "temperature-excursion":
      return `Place the affected lot on quality review and verify the temperature with a calibrated device before release.`;
    case "quality-concern":
      return `Hold routine release of the affected lot until a qualified operator reviews the inspection and records a disposition.`;
  }
}

export function attachRecommendation(
  anomaly: OperationalAnomaly,
  context: RecommendationContext,
): OperationalAnomaly {
  return {
    ...anomaly,
    recommendation: generateRecommendation(anomaly.category, context),
  };
}
