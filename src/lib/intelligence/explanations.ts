import type { OperationalAnomaly } from "@/types";

export interface AnomalyExplanationProvider {
  explain(anomaly: OperationalAnomaly): Promise<string>;
}

export function explainWithDeterministicEvidence(
  anomaly: OperationalAnomaly,
): string {
  const evidence = anomaly.evidence
    .map(
      (item) =>
        `${item.label}: ${item.observed}${item.baseline === undefined ? "" : ` (baseline ${item.baseline})`}`,
    )
    .join("; ");
  return evidence
    ? `${anomaly.explanation} Evidence: ${evidence}.`
    : anomaly.explanation;
}
