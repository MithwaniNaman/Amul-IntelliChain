import { Suspense } from "react";
import { connection } from "next/server";

import { InventoryWorkspace } from "@/components/inventory/inventory-workspace";
import { inventoryRecords } from "@/data/inventory";

async function InventoryContent({
  searchParams,
}: {
  searchParams: Promise<{ record?: string | string[] }>;
}) {
  await connection();
  const { record } = await searchParams;
  const initialRecordId =
    typeof record === "string" &&
    inventoryRecords.some((item) => item.inventoryId === record)
      ? record
      : undefined;
  return (
    <InventoryWorkspace
      key={initialRecordId ?? "default"}
      initialRecordId={initialRecordId}
    />
  );
}

export default function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ record?: string | string[] }>;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Inventory Intelligence
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor stock health, days of cover, expiry, and replenishment across
          the synthetic network.
        </p>
      </header>
      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500"
          >
            Loading selected inventory record…
          </div>
        }
      >
        <InventoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
