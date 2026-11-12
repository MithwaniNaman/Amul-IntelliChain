import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Amul IntelliChain | Supply Chain Intelligence",
    template: "%s | Amul IntelliChain",
  },
  description:
    "An independent dairy supply chain intelligence concept with simulated forecasting, inventory, and traceability data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
