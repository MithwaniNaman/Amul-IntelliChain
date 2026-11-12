import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const disclosures = [
  {
    title: "Independent concept",
    detail:
      "Amul IntelliChain is an independent portfolio demonstration. It is not affiliated with, endorsed by, or operated by Amul or any dairy company.",
  },
  {
    title: "Synthetic data only",
    detail:
      "Demand, stock, locations, batches, shipment statuses, quality observations, and operational signals are generated examples. They do not describe real facilities, products, staff, or events.",
  },
  {
    title: "Local demonstration workflows",
    detail:
      "Inventory adjustments, anomaly status, and traceability event examples are stored in this browser. Clearing browser storage removes those changes.",
  },
  {
    title: "No external services",
    detail:
      "The app does not connect to a real AI model, blockchain network, database, carrier, IoT sensor, or authentication provider. Hash-chain verification only evaluates locally retained demonstration events.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-3">
        <Badge
          variant="outline"
          className="border-red-200 bg-red-50 text-red-700"
        >
          PORTFOLIO DEMONSTRATION
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          About Amul IntelliChain
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          A conceptual dairy supply-chain intelligence workspace exploring
          transparent forecasts, inventory workflows, batch traceability, and
          explainable operational signals.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {disclosures.map((item) => (
          <Card key={item.title} className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-600">
                {item.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
