import type { LucideIcon } from "lucide-react";
import { ArrowRight, CircleCheck, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ModuleStarter({
  title,
  description,
  icon: Icon,
  highlights,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-blue-200 bg-blue-50 text-blue-700"
          >
            Module preview
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <Button variant="outline" disabled>
          Coming soon <ArrowRight className="size-4" />
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white pb-5">
          <div className="flex items-center gap-3">
            <div className="text-brand-red flex size-11 items-center justify-center rounded-xl bg-red-50">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base">
                A clearer view of your operations
              </CardTitle>
              <CardDescription className="mt-1">
                This module will use the shared simulated dataset as its
                foundation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4"
            >
              {index === 0 ? (
                <CircleCheck className="text-brand-green mt-0.5 size-4 shrink-0" />
              ) : (
                <CircleDashed className="mt-0.5 size-4 shrink-0 text-slate-600" />
              )}
              <span className="text-sm leading-5 text-slate-600">
                {highlight}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs leading-relaxed text-blue-800">
        Starter layout only: no live data source, AI service, or blockchain
        network is connected. All displayed product concepts and figures are
        simulated.
      </div>
    </div>
  );
}
