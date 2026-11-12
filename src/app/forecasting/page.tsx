import { Suspense } from "react";
import { connection } from "next/server";

import { ForecastWorkspace } from "@/components/forecasting/forecast-workspace";
import { locations } from "@/data/locations";
import { products } from "@/data/products";

async function ForecastingContent({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string | string[];
    location?: string | string[];
  }>;
}) {
  await connection();
  const query = await searchParams;
  const productId =
    typeof query.product === "string" &&
    products.some((product) => product.productId === query.product)
      ? query.product
      : undefined;
  const locationId =
    typeof query.location === "string" &&
    locations.some((location) => location.locationId === query.location)
      ? query.location
      : undefined;
  return (
    <ForecastWorkspace
      key={`${productId ?? "default"}:${locationId ?? "default"}`}
      initialProductId={productId}
      initialLocationId={locationId}
    />
  );
}

export default function ForecastingPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string | string[];
    location?: string | string[];
  }>;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Demand Forecasting
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Explore transparent statistical forecasts across the synthetic dairy
          supply chain.
        </p>
      </header>
      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500"
          >
            Loading selected forecast…
          </div>
        }
      >
        <ForecastingContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
