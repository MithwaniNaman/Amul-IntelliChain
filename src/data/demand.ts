import { locations } from "@/data/locations";
import { products } from "@/data/products";
import type { DemandRecord } from "@/types";

export const DEMAND_END_DATE = "2026-11-12";
export const HISTORY_DAYS = 180;

const productBaselines = [14_000, 11_800, 1_650, 980, 1_900, 1_250];
const locationMultipliers = [0.92, 1.18, 0.96, 1.08, 0.84, 1.42, 1.36];
const weeklyFactors = [0.97, 0.98, 1, 1.02, 1.04, 1.1, 1.14];
const deterministicNoise = [0.96, 1.03, 1, 1.05, 0.98, 1.02, 0.94, 1.01, 1.04];

function isoDateFromEnd(daysBack: number): string {
  const date = new Date(`${DEMAND_END_DATE}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - daysBack);
  return date.toISOString().slice(0, 10);
}

function createHistoricalDemand(): DemandRecord[] {
  const records: DemandRecord[] = [];

  products.forEach((product, productIndex) => {
    locations.forEach((location, locationIndex) => {
      for (let daysBack = HISTORY_DAYS - 1; daysBack >= 0; daysBack -= 1) {
        const date = isoDateFromEnd(daysBack);
        const dateObject = new Date(`${date}T00:00:00.000Z`);
        const dayNumber = HISTORY_DAYS - daysBack - 1;
        const weekdayFactor = weeklyFactors[dateObject.getUTCDay()];
        const longCycle = 1 + 0.055 * Math.sin((2 * Math.PI * dayNumber) / 83);
        const gradualTrend = 0.94 + (0.12 * dayNumber) / HISTORY_DAYS;
        const noiseIndex =
          (dayNumber * 3 + productIndex * 5 + locationIndex * 7) %
          deterministicNoise.length;
        const spike =
          (dayNumber + productIndex * 13 + locationIndex * 7) % 47 === 0
            ? 1.32
            : 1;
        const actualDemand = Math.max(
          1,
          Math.round(
            productBaselines[productIndex] *
              locationMultipliers[locationIndex] *
              weekdayFactor *
              longCycle *
              gradualTrend *
              deterministicNoise[noiseIndex] *
              spike,
          ),
        );
        const predictionFactor =
          0.985 +
          (((dayNumber + productIndex + locationIndex * 2) % 9) - 4) * 0.008;
        const predictedDemand = Math.max(
          1,
          Math.round(actualDemand * predictionFactor),
        );

        records.push({
          date,
          productId: product.productId,
          locationId: location.locationId,
          actualDemand,
          predictedDemand,
        });
      }
    });
  });

  return records;
}

export const historicalDemandRecords = createHistoricalDemand();
