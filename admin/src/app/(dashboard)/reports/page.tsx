import Link from "next/link";
import {
  ArrowRight,
  CalendarX,
  CreditCard,
  FileText,
  TrendingUp,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import { PermissionGuard } from "@/components/permission-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportCard {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  group: "Bookings" | "Finance";
}

const reports: ReportCard[] = [
  {
    href: "/reports/bookings",
    icon: FileText,
    title: "Booking Report",
    description: "Every booking made on the platform, with gross value and net margin.",
    accent: "bg-navy/5 text-navy",
    group: "Bookings",
  },
  {
    href: "/reports/cancellations",
    icon: CalendarX,
    title: "Cancellation Report",
    description: "Cancelled bookings with the penalty kept and the amount refunded.",
    accent: "bg-destructive/10 text-destructive",
    group: "Bookings",
  },
  {
    href: "/reports/payments",
    icon: CreditCard,
    title: "Payment Report",
    description: "Payments captured through the payment gateways.",
    accent: "bg-rating/10 text-rating",
    group: "Finance",
  },
  {
    href: "/reports/revenue",
    icon: TrendingUp,
    title: "Revenue Report",
    description: "Gross revenue, supplier cost, taxes and net margin by month.",
    accent: "bg-gold/15 text-gold",
    group: "Finance",
  },
  {
    href: "/reports/refunds",
    icon: Undo2,
    title: "Refund Report",
    description: "Refunds issued to guests, with reason, gateway and status.",
    accent: "bg-sky-600/10 text-sky-600",
    group: "Finance",
  },
];

const groups: ReportCard["group"][] = ["Bookings", "Finance"];

export default function ReportsHubPage() {
  return (
    <PermissionGuard module="reports">
      <div className="space-y-8 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Booking and finance reporting across the platform.
          </p>
        </div>

        {groups.map((group) => (
          <div key={group} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {group}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reports
                .filter((r) => r.group === group)
                .map(({ href, icon: Icon, title, description, accent }) => (
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
                        <span className="text-xs font-medium text-navy">Open report</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </PermissionGuard>
  );
}
