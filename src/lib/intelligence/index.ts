import type { OperationalAnomaly } from "@/types";

import {
  getDefaultAnomalyAnalysis,
  runAnomalyDetection,
  type DetectionConfig,
  type DetectionResult,
  type DetectionSources,
} from "./detection";
import { summarizeEstimatedFinancialExposure } from "./impact";

export {
  getDefaultAnomalyAnalysis,
  runAnomalyDetection,
  type DetectionConfig,
  type DetectionResult,
  type DetectionSources,
} from "./detection";
export {
  estimateUnitExposure,
  summarizeEstimatedFinancialExposure,
} from "./impact";
export {
  explainWithDeterministicEvidence,
  type AnomalyExplanationProvider,
} from "./explanations";
export {
  generateRecommendation,
  type RecommendationContext,
} from "./recommendations";
export { filterAnomalies, type AnomalyFilters } from "./filters";
export {
  getAnomalyWorkflowServerSnapshot,
  getAnomalyWorkflowSnapshot,
  resetAnomalyWorkflow,
  setAnomalyStatus,
  subscribeToAnomalyWorkflow,
  type AnomalyWorkflowSnapshot,
} from "./store";

export interface AnomalySummary {
  total: number;
  criticalActive: number;
  highActive: number;
  open: number;
  acknowledged: number;
  resolved: number;
  estimatedFinancialExposure: number | null;
  mostAffectedProductId: string | null;
  mostAffectedLocationId: string | null;
}

export function summarizeAnomalies(
  anomalies: readonly OperationalAnomaly[],
): AnomalySummary {
  const active = anomalies.filter((item) => item.status !== "Resolved");
  const groupMostFrequently = (
    selector: (item: OperationalAnomaly) => string | undefined,
  ): string | null => {
    const counts = new Map<string, number>();
    for (const anomaly of active) {
      const value = selector(anomaly);
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return (
      [...counts.entries()].sort(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
      )[0]?.[0] ?? null
    );
  };

  return {
    total: anomalies.length,
    criticalActive: active.filter((item) => item.severity === "Critical")
      .length,
    highActive: active.filter((item) => item.severity === "High").length,
    open: anomalies.filter((item) => item.status === "Open").length,
    acknowledged: anomalies.filter((item) => item.status === "Acknowledged")
      .length,
    resolved: anomalies.filter((item) => item.status === "Resolved").length,
    estimatedFinancialExposure: summarizeEstimatedFinancialExposure(anomalies),
    mostAffectedProductId: groupMostFrequently((item) => item.productId),
    mostAffectedLocationId: groupMostFrequently((item) => item.locationId),
  };
}

export function analyzeAnomalies(
  sources: DetectionSources,
  config?: DetectionConfig,
): DetectionResult {
  return runAnomalyDetection(sources, config);
}

export { getDefaultAnomalyAnalysis as getAnomalyAnalysis };
