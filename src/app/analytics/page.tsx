import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";
import { OverviewInventoryProvider } from "@/components/dashboard/overview-inventory-provider";

export default function AnalyticsPage() {
  return (
    <OverviewInventoryProvider>
      <AnalyticsWorkspace />
    </OverviewInventoryProvider>
  );
}
