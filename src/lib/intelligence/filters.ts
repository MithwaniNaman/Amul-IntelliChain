import type {
  AnomalyCategory,
  AnomalySeverity,
  AnomalyStatus,
  OperationalAnomaly,
} from "@/types";

export interface AnomalyFilters {
  query?: string;
  category?: AnomalyCategory | "all";
  severity?: AnomalySeverity | "all";
  status?: AnomalyStatus | "all";
}

export function filterAnomalies(
  anomalies: readonly OperationalAnomaly[],
  filters: AnomalyFilters,
): OperationalAnomaly[] {
  const query = filters.query?.trim().toLocaleLowerCase() ?? "";
  return anomalies.filter((anomaly) => {
    if (
      filters.category &&
      filters.category !== "all" &&
      anomaly.category !== filters.category
    ) {
      return false;
    }
    if (
      filters.severity &&
      filters.severity !== "all" &&
      anomaly.severity !== filters.severity
    ) {
      return false;
    }
    if (
      filters.status &&
      filters.status !== "all" &&
      anomaly.status !== filters.status
    ) {
      return false;
    }
    if (!query) return true;
    const searchable = [
      anomaly.title,
      anomaly.explanation,
      anomaly.recommendation,
      anomaly.productId,
      anomaly.locationId,
      anomaly.batchId,
      anomaly.shipmentId,
      ...anomaly.relatedRecordIds,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return searchable.includes(query);
  });
}
