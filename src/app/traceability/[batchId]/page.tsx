import { Suspense } from "react";
import { notFound } from "next/navigation";

import { BatchDetailWorkspace } from "@/components/traceability/batch-detail-workspace";
import { supplyChainBatches } from "@/data/batches";

export function generateStaticParams() {
  return supplyChainBatches.map((batch) => ({ batchId: batch.batchId }));
}

async function BatchDetailContent({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  if (!supplyChainBatches.some((batch) => batch.batchId === batchId)) {
    notFound();
  }
  return <BatchDetailWorkspace batchId={batchId} />;
}

export default function BatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500"
        >
          Loading batch record…
        </div>
      }
    >
      <BatchDetailContent params={params} />
    </Suspense>
  );
}
