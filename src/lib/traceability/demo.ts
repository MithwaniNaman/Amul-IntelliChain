import { supplyChainBatches } from "@/data/batches";
import { qualityInspections } from "@/data/quality-inspections";
import { locations } from "@/data/locations";
import type { BatchEventType } from "@/types";

import { buildLedger, type NewBatchEvent } from "./engine";

const journey: Array<{
  eventType: BatchEventType;
  locationIndex: number;
  actorRole: string;
  description: string;
}> = [
  {
    eventType: "PROCUREMENT",
    locationIndex: 0,
    actorRole: "Collection operator",
    description: "Illustrative raw milk procurement recorded.",
  },
  {
    eventType: "QUALITY_INSPECTION",
    locationIndex: 0,
    actorRole: "Quality inspector",
    description: "Synthetic intake sample recorded for demonstration.",
  },
  {
    eventType: "COLLECTION",
    locationIndex: 0,
    actorRole: "Collection operator",
    description: "Illustrative collection quantity confirmed.",
  },
  {
    eventType: "CHILLING",
    locationIndex: 0,
    actorRole: "Cold-chain operator",
    description: "Synthetic chilling checkpoint recorded.",
  },
  {
    eventType: "PROCESSING",
    locationIndex: 1,
    actorRole: "Processing operator",
    description: "Illustrative processing step recorded.",
  },
  {
    eventType: "PACKAGING",
    locationIndex: 1,
    actorRole: "Packaging operator",
    description: "Illustrative packaging step recorded.",
  },
  {
    eventType: "DISPATCH",
    locationIndex: 2,
    actorRole: "Dispatch operator",
    description: "Illustrative dispatch recorded.",
  },
  {
    eventType: "CUSTODY_TRANSFER",
    locationIndex: 2,
    actorRole: "Logistics coordinator",
    description: "Synthetic custody handoff recorded.",
  },
  {
    eventType: "DELIVERY",
    locationIndex: 2,
    actorRole: "Receiving operator",
    description: "Illustrative delivery confirmation recorded.",
  },
];

const statusEventCounts = {
  collected: 4,
  processing: 5,
  "in-transit": 8,
  delivered: 9,
} as const;

export async function createDemoLedger() {
  const inputs: NewBatchEvent[] = [];
  for (const batch of supplyChainBatches) {
    const count = statusEventCounts[batch.currentStatus];
    const start = Date.parse(batch.createdAt);
    for (const [index, stage] of journey.slice(0, count).entries()) {
      const locationId =
        index === 4 || index === 5
          ? batch.processingFacilityId
          : index >= 6
            ? batch.distributionHubId
            : batch.collectionCentreId;
      const locationName = locations.find(
        (location) => location.locationId === locationId,
      )?.name;
      inputs.push({
        eventId: `${batch.batchId}-EVT-${String(index + 1).padStart(2, "0")}`,
        batchId: batch.batchId,
        eventType: stage.eventType,
        timestamp: new Date(start + index * 12 * 60_000).toISOString(),
        locationId,
        actorRole: stage.actorRole,
        description: `${stage.description} Location: ${locationName ?? locationId}.`,
        metadata:
          stage.eventType === "QUALITY_INSPECTION"
            ? {
                inspectionId: qualityInspections.find(
                  (inspection) => inspection.batchId === batch.batchId,
                )?.inspectionId,
              }
            : { simulated: true },
      });
    }
  }

  inputs.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  return buildLedger(inputs);
}
