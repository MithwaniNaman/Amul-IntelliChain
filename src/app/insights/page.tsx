import { IntelligenceWorkspace } from "@/components/intelligence/intelligence-workspace";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Supply Chain Intelligence
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Review explainable operational signals, inspect their evidence and
            potential impact, and record the next operator action.
          </p>
        </div>
        <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-blue-700 uppercase">
          Rule-based demonstration
        </span>
      </header>
      <IntelligenceWorkspace />
    </div>
  );
}
