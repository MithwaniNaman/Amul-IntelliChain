import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneStyles = {
  red: "bg-red-50 text-brand-red",
  blue: "bg-blue-50 text-brand-blue",
  green: "bg-emerald-50 text-brand-green",
  amber: "bg-amber-50 text-amber-700",
};

export function KpiCard({
  label,
  value,
  unit,
  change,
  changeDirection = "neutral",
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  change: string;
  changeDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  tone: keyof typeof toneStyles;
}) {
  const ChangeIcon =
    changeDirection === "up"
      ? ArrowUpRight
      : changeDirection === "down"
        ? ArrowDownRight
        : null;

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              toneStyles[tone],
            )}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-semibold",
              changeDirection === "neutral"
                ? "bg-slate-100 text-slate-600"
                : "bg-emerald-50 text-emerald-700",
            )}
          >
            {ChangeIcon && <ChangeIcon className="size-3" aria-hidden="true" />}
            {change}
          </span>
        </div>
        <p className="mt-4 text-[11px] font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-[22px] leading-none font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1.5 text-[10px] text-slate-600">{unit}</p>
      </CardContent>
    </Card>
  );
}
