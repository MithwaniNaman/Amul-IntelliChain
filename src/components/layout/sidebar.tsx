"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Boxes,
  BrainCircuit,
  ClipboardList,
  Droplets,
  LayoutDashboard,
  Milk,
  PackageSearch,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/forecasting", label: "Demand Forecasting", icon: BarChart3 },
  { href: "/inventory", label: "Inventory Intelligence", icon: Boxes },
  {
    href: "/traceability",
    label: "Batch Traceability",
    icon: ClipboardList,
  },
  { href: "/monitoring", label: "Supply Chain Monitoring", icon: Activity },
  { href: "/insights", label: "Intelligence", icon: BrainCircuit },
  { href: "/analytics", label: "Product Analytics", icon: PackageSearch },
];

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-brand-red flex size-10 items-center justify-center rounded-xl text-white shadow-sm shadow-red-900/15">
        <Milk className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight text-slate-950">
          Amul IntelliChain
        </p>
        <p className="text-[11px] font-medium text-slate-500">
          Supply chain intelligence
        </p>
      </div>
    </div>
  );
}

export function NavigationLinks({ onSelect }: { onSelect?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="space-y-1">
      {navigationItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            onClick={onSelect}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700",
              isActive
                ? "text-brand-red bg-red-50"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <Icon className="size-[17px] shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
            {isActive && (
              <span className="bg-brand-red ml-auto size-1.5 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-slate-200/80 bg-white md:flex md:flex-col">
      <div className="flex h-[72px] items-center border-b border-slate-100 px-5">
        <BrandMark />
      </div>
      <div className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.14em] text-slate-600 uppercase">
          Workspace
        </p>
        <NavigationLinks />
      </div>
      <div className="mx-4 mb-4 rounded-xl border border-slate-200/80 bg-slate-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Droplets className="text-brand-blue size-4" aria-hidden="true" />
          Demo environment
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          All operational figures are simulated for demonstration only. This is
          an independent concept and is not affiliated with Amul.
        </p>
      </div>
    </aside>
  );
}
