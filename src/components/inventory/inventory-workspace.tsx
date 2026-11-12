"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Boxes,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { toast } from "sonner";

import { locations } from "@/data/locations";
import { inventoryRecords } from "@/data/inventory";
import { products } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  dashboardInventoryMetrics,
  getAllInventoryMetrics,
} from "@/lib/dashboard-data";
import type { InventoryMetrics, StockHealth } from "@/lib/inventory";
import {
  getWorkspaceServerSnapshot,
  getWorkspaceSnapshot,
  resetWorkspaceDemoData,
  subscribeToWorkspace,
  updateInventoryStock,
} from "@/lib/workspace-store";

const healthStyles: Record<StockHealth, string> = {
  Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Low stock": "border-amber-200 bg-amber-50 text-amber-700",
  Critical: "border-red-200 bg-red-50 text-red-700",
  "Expiry risk": "border-violet-200 bg-violet-50 text-violet-700",
};

type SortKey = "product" | "location" | "stock" | "daysRemaining" | "health";

function formatQuantity(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function InventoryWorkspace({
  initialRecordId,
}: {
  initialRecordId?: string;
}) {
  const workspace = useSyncExternalStore(
    subscribeToWorkspace,
    getWorkspaceSnapshot,
    getWorkspaceServerSnapshot,
  );
  const [query, setQuery] = useState(initialRecordId ?? "");
  const [productId, setProductId] = useState("all");
  const [locationId, setLocationId] = useState("all");
  const [health, setHealth] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("daysRemaining");
  const [sortAscending, setSortAscending] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState("");

  const metrics = useMemo(
    () =>
      workspace.inventory === inventoryRecords
        ? dashboardInventoryMetrics
        : getAllInventoryMetrics(workspace.inventory),
    [workspace.inventory],
  );
  const filteredMetrics = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const result = metrics.filter((item) => {
      const matchesSearch =
        search.length === 0 ||
        item.product.name.toLocaleLowerCase().includes(search) ||
        item.location.city.toLocaleLowerCase().includes(search) ||
        item.location.state.toLocaleLowerCase().includes(search) ||
        item.record.inventoryId.toLocaleLowerCase().includes(search);
      return (
        matchesSearch &&
        (productId === "all" || item.product.productId === productId) &&
        (locationId === "all" || item.location.locationId === locationId) &&
        (health === "all" || item.health === health)
      );
    });

    return result.sort((left, right) => {
      let difference: number;
      if (sortKey === "product") {
        difference = left.product.name.localeCompare(right.product.name);
      } else if (sortKey === "location") {
        difference = left.location.city.localeCompare(right.location.city);
      } else if (sortKey === "health") {
        difference = left.health.localeCompare(right.health);
      } else {
        difference =
          sortKey === "stock"
            ? left.record.currentStock - right.record.currentStock
            : left.daysRemaining - right.daysRemaining;
      }
      return sortAscending ? difference : -difference;
    });
  }, [health, locationId, metrics, productId, query, sortAscending, sortKey]);
  const selected = metrics.find(
    (item) => item.record.inventoryId === selectedId,
  );
  const atRiskCount = metrics.filter(
    (item) => item.health !== "Healthy",
  ).length;
  const criticalCount = metrics.filter(
    (item) => item.health === "Critical",
  ).length;
  const averageCover =
    metrics.length === 0
      ? 0
      : metrics.reduce((sum, item) => sum + item.daysRemaining, 0) /
        metrics.length;

  function changeSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortAscending((current) => !current);
    } else {
      setSortKey(nextSortKey);
      setSortAscending(true);
    }
  }

  function openDetails(item: InventoryMetrics) {
    setSelectedId(item.record.inventoryId);
    setStockInput(String(item.record.currentStock));
  }

  function saveStock() {
    if (!selected) {
      return;
    }
    const nextStock = Number(stockInput);
    if (!Number.isFinite(nextStock) || nextStock < 0) {
      toast.error("Enter a non-negative stock quantity.");
      return;
    }

    try {
      updateInventoryStock(selected.record.inventoryId, nextStock);
      toast.success("Demo stock quantity updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update stock.",
      );
    }
  }

  function resetSavedData() {
    try {
      resetWorkspaceDemoData();
      toast.success("Saved demo inventory has been reset.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to reset demo stock.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Product-location records"
          value={metrics.length.toString()}
          detail="Synthetic inventory records"
          icon={Boxes}
        />
        <SummaryCard
          label="Records needing attention"
          value={atRiskCount.toString()}
          detail={`${criticalCount} classified as critical`}
          icon={TriangleAlert}
        />
        <SummaryCard
          label="Average days of cover"
          value={averageCover.toFixed(1)}
          detail="Stock divided by recent daily demand"
          icon={ArrowUpDown}
        />
      </section>

      {workspace.error && (
        <div
          className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>{workspace.error}</p>
          <Button variant="outline" size="sm" onClick={resetSavedData}>
            Reset saved demo stock
          </Button>
        </div>
      )}

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label className="relative min-w-56 flex-1">
                <span className="sr-only">Search product or location</span>
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-600" />
                <Input
                  className="pl-9"
                  placeholder="Search product or location"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <FilterSelect
                label="Product"
                value={productId}
                onChange={setProductId}
              >
                <option value="all">All products</option>
                {products.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect
                label="Location"
                value={locationId}
                onChange={setLocationId}
              >
                <option value="all">All locations</option>
                {locations.map((location) => (
                  <option key={location.locationId} value={location.locationId}>
                    {location.city}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect label="Health" value={health} onChange={setHealth}>
                <option value="all">All health states</option>
                {(
                  ["Healthy", "Low stock", "Critical", "Expiry risk"] as const
                ).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <p className="text-xs text-slate-500">
              {filteredMetrics.length} of {metrics.length} records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] tracking-wide text-slate-500 uppercase">
                <tr>
                  <SortHeader
                    label="Product"
                    sortKey="product"
                    activeSort={sortKey}
                    ascending={sortAscending}
                    onClick={changeSort}
                  />
                  <SortHeader
                    label="Location"
                    sortKey="location"
                    activeSort={sortKey}
                    ascending={sortAscending}
                    onClick={changeSort}
                  />
                  <SortHeader
                    label="Current stock"
                    sortKey="stock"
                    activeSort={sortKey}
                    ascending={sortAscending}
                    onClick={changeSort}
                  />
                  <SortHeader
                    label="Days remaining"
                    sortKey="daysRemaining"
                    activeSort={sortKey}
                    ascending={sortAscending}
                    onClick={changeSort}
                  />
                  <th className="px-4 py-3 font-medium">Reorder point</th>
                  <th className="px-4 py-3 font-medium">Suggested reorder</th>
                  <SortHeader
                    label="Health"
                    sortKey="health"
                    activeSort={sortKey}
                    ascending={sortAscending}
                    onClick={changeSort}
                  />
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMetrics.map((item) => (
                  <tr
                    key={item.record.inventoryId}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-600">
                        {item.product.unit}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {item.location.city}, {item.location.state}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {formatQuantity(item.record.currentStock)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {item.daysRemaining.toFixed(1)} days
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {formatQuantity(item.record.reorderLevel)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {formatQuantity(item.recommendedReorderQuantity)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className={healthStyles[item.health]}
                      >
                        {item.health}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetails(item)}
                        aria-label={`View ${item.product.name} inventory in ${item.location.city}`}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredMetrics.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No inventory records match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-100 px-4 py-3 text-[10px] text-slate-600">
            All inventory records are synthetic. Stock edits are saved locally
            in this browser only.
          </p>
        </CardContent>
      </Card>

      <Sheet
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="border-b border-slate-100 pb-4">
                <Badge
                  variant="outline"
                  className={`mb-2 w-fit ${healthStyles[selected.health]}`}
                >
                  {selected.health}
                </Badge>
                <SheetTitle>{selected.product.name}</SheetTitle>
                <SheetDescription>
                  {selected.location.city}, {selected.location.state} ·
                  inventory details
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <DetailMetric
                    label="Days of stock"
                    value={`${selected.daysRemaining.toFixed(1)} days`}
                  />
                  <DetailMetric
                    label="Daily demand"
                    value={`${formatQuantity(selected.record.dailyDemand)} ${selected.product.unit}`}
                  />
                  <DetailMetric
                    label="Reorder point"
                    value={`${formatQuantity(selected.record.reorderLevel)} ${selected.product.unit}`}
                  />
                  <DetailMetric
                    label="Expiry"
                    value={
                      selected.daysToExpiry < 0
                        ? `${Math.abs(selected.daysToExpiry)} days overdue`
                        : `${selected.daysToExpiry} days`
                    }
                  />
                  <DetailMetric
                    label="Stockout risk"
                    value={selected.stockoutRisk}
                  />
                  <DetailMetric
                    label="Forecasted daily demand"
                    value={`${formatQuantity(selected.forecastAverageDailyDemand)} ${selected.product.unit}`}
                  />
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-xs font-semibold text-slate-800">
                    Replenishment recommendation
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600">
                    Plan to add{" "}
                    <strong>
                      {formatQuantity(selected.recommendedReorderQuantity)}{" "}
                      {selected.product.unit}
                    </strong>{" "}
                    to cover the next forecast horizon and maintain the reorder
                    buffer.
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="stock-quantity"
                  >
                    Simulated stock adjustment ({selected.product.unit})
                  </label>
                  <Input
                    id="stock-quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={stockInput}
                    onChange={(event) => setStockInput(event.target.value)}
                  />
                  <p className="text-[10px] text-slate-600">
                    Saves this demo change to localStorage on this device.
                  </p>
                  <Button className="w-full" onClick={saveStock}>
                    Save stock quantity
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-36">
      <span className="mb-1.5 block text-[10px] font-medium text-slate-500">
        {label}
      </span>
      <select
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function SortHeader({
  label,
  sortKey,
  activeSort,
  ascending,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  activeSort: SortKey;
  ascending: boolean;
  onClick: (key: SortKey) => void;
}) {
  const Icon =
    activeSort !== sortKey ? ArrowUpDown : ascending ? ArrowUp : ArrowDown;

  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 hover:text-slate-800"
        onClick={() => onClick(sortKey)}
      >
        {label}
        <Icon className="size-3" aria-hidden="true" />
      </button>
    </th>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Boxes;
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-[10px] text-slate-600">{detail}</p>
        </div>
        <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}
