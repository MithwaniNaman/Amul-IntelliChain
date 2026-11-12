"use client";

import { format } from "date-fns";
import { Bell, ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { WorkspaceSearch } from "@/components/layout/workspace-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandMark, NavigationLinks } from "@/components/layout/sidebar";

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/forecasting": "Demand Forecasting",
  "/inventory": "Inventory Intelligence",
  "/traceability": "Batch Traceability",
  "/monitoring": "Supply Chain Monitoring",
  "/insights": "Intelligence",
  "/analytics": "Product Analytics",
  "/about": "About this project",
};

const subscribeToDate = () => () => {};
const getServerDateLabel = () => "Today";
const getClientDateLabel = () => format(new Date(), "EEE, d MMM yyyy");

export function Topbar() {
  const pathname = usePathname();
  const pageTitle =
    pathname.startsWith("/traceability/") && pathname !== "/traceability"
      ? "Batch Traceability"
      : (pageTitles[pathname] ?? "Overview");
  const dateLabel = useSyncExternalStore(
    subscribeToDate,
    getClientDateLabel,
    getServerDateLabel,
  );
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[290px] p-0">
            <SheetTitle className="sr-only">
              Amul IntelliChain navigation
            </SheetTitle>
            <div className="border-b border-slate-100 px-5 py-5">
              <BrandMark />
            </div>
            <div className="px-3 py-5">
              <NavigationLinks onSelect={() => setNavigationOpen(false)} />
            </div>
            <p className="px-5 text-xs leading-relaxed text-slate-500">
              Independent concept · Simulated demonstration data
            </p>
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {pageTitle}
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">{dateLabel}</p>
        </div>
      </div>

      <WorkspaceSearch />

      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600"
              aria-label="Open notifications"
            >
              <Bell className="size-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Demo alert center</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <p className="px-2 py-2 text-xs leading-relaxed text-slate-600">
              No live notification service is connected. Review synthetic
              rule-based signals in the Intelligence workspace.
            </p>
            <DropdownMenuItem asChild>
              <Link href="/insights">Open Intelligence workspace</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5 sm:px-2">
              <Avatar className="size-8">
                <AvatarFallback className="text-brand-red bg-red-50 text-xs font-semibold">
                  OP
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium text-slate-700 xl:block">
                Operations
              </span>
              <ChevronDown className="hidden size-3.5 text-slate-600 xl:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Demo operator · not signed in</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/about">About this portfolio demo</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Account and settings are not implemented
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
