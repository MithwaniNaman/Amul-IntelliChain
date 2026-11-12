import type { ActivityItem, Shipment } from "@/types";

export const shipments: Shipment[] = [
  {
    id: "SHP-88421",
    destination: "Mumbai Distribution Hub",
    carrier: "Western Cold Chain",
    eta: "12:45 PM",
    status: "in-transit",
    quantityCases: 1840,
  },
  {
    id: "SHP-88419",
    destination: "Pune Distribution Hub",
    carrier: "Deccan Logistics",
    eta: "11:20 AM",
    status: "delivered",
    quantityCases: 1260,
  },
  {
    id: "SHP-88416",
    destination: "Jaipur Distribution Hub",
    carrier: "Northstar Freight",
    eta: "2:30 PM",
    status: "delayed",
    quantityCases: 980,
  },
  {
    id: "SHP-88412",
    destination: "Vadodara Retail Cluster",
    carrier: "Gujarat Express",
    eta: "1:10 PM",
    status: "preparing",
    quantityCases: 740,
  },
];

export const recentActivities: ActivityItem[] = [
  {
    id: "ACT-001",
    title: "Synthetic shipment marked delivered",
    detail: "SHP-88419 · 1,260 cases received at Pune Distribution Hub",
    time: "11:20 AM",
    kind: "shipment",
  },
  {
    id: "ACT-002",
    title: "Synthetic quality sample passed",
    detail: "Batch BATCH-AN-20261112-01 · 3.6°C",
    time: "10:48 AM",
    kind: "quality",
  },
  {
    id: "ACT-003",
    title: "Synthetic stock watch",
    detail: "Cheese · Mumbai Distribution Hub · 0.8 days of cover",
    time: "10:05 AM",
    kind: "inventory",
  },
  {
    id: "ACT-004",
    title: "Synthetic traceability record updated",
    detail: "Batch BATCH-RJ-20261112-02 · demo ledger",
    time: "9:42 AM",
    kind: "traceability",
  },
  {
    id: "ACT-005",
    title: "Synthetic collection recorded",
    detail: "Batch BATCH-AN-20261112-01 · 18,400 litres at Anand Dairy Collection",
    time: "8:15 AM",
    kind: "inventory",
  },
];
