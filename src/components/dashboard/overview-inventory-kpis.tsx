"use client";

import { Boxes, TriangleAlert } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { useOverviewInventory } from "@/components/dashboard/overview-inventory-provider";
import { calculateInventoryRiskPercent } from "@/lib/inventory";

export function OverviewInventoryKpis() {
  const { metrics } = useOverviewInventory();
  const lowStockAlerts = metrics.filter(
    (item) => item.health === "Low stock" || item.health === "Critical",
  ).length;

  return (
    <>
      <KpiCard
        label="Inventory at Risk"
        value={`${calculateInventoryRiskPercent(metrics).toFixed(1)}%`}
        unit="product-location records needing attention"
        change={`${metrics.length} synthetic records`}
        icon={Boxes}
        tone="amber"
      />
      <KpiCard
        label="Low-Stock Alerts"
        value={lowStockAlerts.toString()}
        unit="critical and low-stock records"
        change="calculated from days of cover"
        icon={TriangleAlert}
        tone="amber"
      />
    </>
  );
}
