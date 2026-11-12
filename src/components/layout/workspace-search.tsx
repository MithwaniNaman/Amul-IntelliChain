"use client";

import { Command as CommandIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supplyChainBatches } from "@/data/batches";
import { inventoryRecords } from "@/data/inventory";
import { locations } from "@/data/locations";
import { products } from "@/data/products";
import { shipments } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface SearchEntry {
  label: string;
  description: string;
  href: string;
  value: string;
}

const navigationEntries: SearchEntry[] = [
  { label: "Overview", description: "Dashboard", href: "/", value: "overview" },
  {
    label: "Demand Forecasting",
    description: "Forecast product demand",
    href: "/forecasting",
    value: "demand forecasting",
  },
  {
    label: "Inventory Intelligence",
    description: "Stock, expiry, and replenishment",
    href: "/inventory",
    value: "inventory intelligence",
  },
  {
    label: "Batch Traceability",
    description: "Synthetic batch records",
    href: "/traceability",
    value: "batch traceability",
  },
  {
    label: "Supply Chain Monitoring",
    description: "Synthetic shipment records",
    href: "/monitoring",
    value: "supply chain monitoring shipments",
  },
  {
    label: "Intelligence",
    description: "Rule-based operational signals",
    href: "/insights",
    value: "intelligence anomalies alerts",
  },
  {
    label: "Product Analytics",
    description: "Observed demand and stock health",
    href: "/analytics",
    value: "product analytics demand stock",
  },
  {
    label: "About this project",
    description: "Scope, data, and integration disclosures",
    href: "/about",
    value: "about independent concept synthetic data disclosure",
  },
];

const productEntries = products.map((product) => ({
  label: product.name,
  description: `Forecasting · ${product.category}`,
  href: `/forecasting?product=${encodeURIComponent(product.productId)}`,
  value: `${product.name} ${product.category} forecasting demand`,
}));

const locationEntries = locations.map((location) => ({
  label: location.name,
  description: `Forecasting · ${location.city}, ${location.state}`,
  href: `/forecasting?location=${encodeURIComponent(location.locationId)}`,
  value: `${location.name} ${location.city} ${location.state} forecasting`,
}));

const inventoryEntries = inventoryRecords.map((record) => {
  const product = products.find((item) => item.productId === record.productId);
  const location = locations.find(
    (item) => item.locationId === record.locationId,
  );
  const label = `${product?.name ?? record.productId} · ${location?.city ?? record.locationId}`;
  return {
    label,
    description: `Inventory · ${record.inventoryId}`,
    href: `/inventory?record=${encodeURIComponent(record.inventoryId)}`,
    value: `${label} ${record.inventoryId} stock inventory`,
  };
});

const batchEntries = supplyChainBatches.map((batch) => {
  const product = products.find((item) => item.productId === batch.productId);
  return {
    label: batch.batchId,
    description: `Batch traceability · ${product?.name ?? batch.productId}`,
    href: `/traceability/${encodeURIComponent(batch.batchId)}`,
    value: `${batch.batchId} ${product?.name ?? batch.productId} batch`,
  };
});

const shipmentEntries = shipments.map((shipment) => ({
  label: shipment.id,
  description: `Shipment · ${shipment.destination} · ${shipment.status}`,
  href: `/monitoring?shipment=${encodeURIComponent(shipment.id)}`,
  value: `${shipment.id} ${shipment.destination} ${shipment.carrier} ${shipment.status}`,
}));

export function WorkspaceSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function navigate(entry: SearchEntry) {
    setOpen(false);
    router.push(entry.href);
  }

  function renderEntries(entries: SearchEntry[]) {
    return entries.map((entry) => (
      <CommandItem
        key={entry.href}
        value={entry.value}
        onSelect={() => navigate(entry)}
        className="min-h-11"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{entry.label}</span>
          <span className="text-muted-foreground block truncate text-xs">
            {entry.description}
          </span>
        </span>
        <CommandShortcut>↵</CommandShortcut>
      </CommandItem>
    ));
  }

  return (
    <>
      <div className="hidden w-full max-w-[360px] flex-1 gap-2 lg:flex">
        <Button
          variant="outline"
          className="h-9 w-full justify-start gap-2 bg-slate-50 text-xs font-normal text-slate-500 shadow-none hover:bg-white"
          onClick={() => setOpen(true)}
        >
          <Search className="size-4 text-slate-600" aria-hidden="true" />
          <span className="flex-1 text-left">Search products and records…</span>
          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">
            <CommandIcon className="size-3" aria-hidden="true" /> K
          </span>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        aria-label="Search workspace"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" aria-hidden="true" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search the workspace"
        description="Find modules, products, locations, inventory records, batches, and shipments."
        className="max-w-2xl"
      >
        <Command>
          <CommandInput
            aria-label="Search modules and synthetic records"
            placeholder="Search modules, products, locations, inventory, batches, shipments…"
          />
          <CommandList>
            <CommandEmpty>No matching modules or records.</CommandEmpty>
            <CommandGroup heading="Modules">
              {renderEntries(navigationEntries)}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Products">
              {renderEntries(productEntries)}
            </CommandGroup>
            <CommandGroup heading="Locations">
              {renderEntries(locationEntries)}
            </CommandGroup>
            <CommandGroup heading="Inventory records">
              {renderEntries(inventoryEntries)}
            </CommandGroup>
            <CommandGroup heading="Batches">
              {renderEntries(batchEntries)}
            </CommandGroup>
            <CommandGroup heading="Shipments">
              {renderEntries(shipmentEntries)}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
