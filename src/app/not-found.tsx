import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-xl items-center">
      <Card className="w-full border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>Page or record not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-600">
            The requested page or synthetic batch record is not available in
            this demonstration.
          </p>
          <Button asChild className="mt-5">
            <Link href="/">Return to Overview</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
