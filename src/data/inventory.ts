import { DEMAND_END_DATE, historicalDemandRecords } from "@/data/demand";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import type { InventoryRecord } from "@/types";

function createInventoryRecords(): InventoryRecord[] {
  return products.flatMap((product, productIndex) =>
    locations.map((location, locationIndex) => {
      const recentDemand = historicalDemandRecords
        .filter(
          (record) =>
            record.productId === product.productId &&
            record.locationId === location.locationId,
        )
        .slice(-14);
      const dailyDemand = Math.max(
        1,
        Math.round(
          recentDemand.reduce((sum, record) => sum + record.actualDemand, 0) /
            Math.max(recentDemand.length, 1),
        ),
      );
      const sequence = productIndex * locations.length + locationIndex;
      const daysOfStock =
        sequence % 13 === 0
          ? 0.8
          : sequence % 9 === 0
            ? 2.2
            : 7 + (sequence % 8);
      const expiryInDays =
        sequence % 17 === 0
          ? 1
          : sequence % 11 === 0
            ? 3
            : Math.min(product.shelfLifeDays, 12 + (sequence % 20));
      const expiryDate = new Date(`${DEMAND_END_DATE}T00:00:00.000Z`);
      expiryDate.setUTCDate(expiryDate.getUTCDate() + expiryInDays);

      return {
        inventoryId: `INV-${product.productId}-${location.locationId}`,
        productId: product.productId,
        locationId: location.locationId,
        currentStock: Math.round(dailyDemand * daysOfStock),
        dailyDemand,
        expiryDate: expiryDate.toISOString().slice(0, 10),
        reorderLevel: dailyDemand * 3,
      };
    }),
  );
}

export const inventoryRecords = createInventoryRecords();
