import Link from "next/link";
import { ArrowRight, BarChart3, Coins, DoorOpen } from "lucide-react";

import { PermissionGuard } from "@/components/permission-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/reports/finance",
    icon: BarChart3,
    title: "Finance reports",
    description:
      "Revenue, refunds, channel performance, payment methods and the full transaction ledger.",
    accent: "bg-navy/5 text-navy",
  },
  {
    href: "/reports/occupancy",
    icon: DoorOpen,
    title: "Occupancy reports",
    description:
      "Utilization rates, booked nights, average length of stay and booking lead times.",
    accent: "bg-rating/10 text-rating",
  },
  {
    href: "/reports/payouts",
    icon: Coins,
    title: "Payout reports",
    description:
      "Bank settlements, payout schedule and partner module commissions owed.",
    accent: "bg-gold/15 text-gold",
  },
];

export default function ReportsHubPage() {
  return (
    <PermissionGuard module="reports">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analytics across finance, occupancy and payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {sections.map(({ href, icon: Icon, title, description, accent }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full transition-colors group-hover:border-navy/30 group-hover:bg-muted/30">
                <CardHeader>
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${accent}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-2 flex items-center justify-between gap-2">
                    {title}
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-navy">
                    Open report
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PermissionGuard>
  );
}
