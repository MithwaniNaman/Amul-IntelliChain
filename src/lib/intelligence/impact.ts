import type { OperationalAnomaly } from "@/types";

export interface ImpactEstimate {
  quantity: number | null;
  unit: string | null;
  financialExposure: number | null;
  assumption: string;
}

export function estimateUnitExposure(
  quantity: number | null,
  unit: string | null,
  assumption: string,
): ImpactEstimate {
  return {
    quantity:
      quantity !== null && Number.isFinite(quantity)
        ? Math.max(0, Math.round(quantity * 10) / 10)
        : null,
    unit,
    financialExposure: null,
    assumption: `${assumption} Financial exposure is unavailable because the synthetic dataset contains no product prices.`,
  };
}

export function summarizeEstimatedFinancialExposure(
  anomalies: readonly OperationalAnomaly[],
): number | null {
  const knownEstimates = anomalies
    .map((anomaly) => anomaly.estimatedFinancialExposure)
    .filter((value): value is number => value !== null);
  return knownEstimates.length === 0
    ? null
    : knownEstimates.reduce((total, value) => total + value, 0);
}
