import Link from "next/link";
import { ArrowRight, CreditCard, ReceiptText, Undo2 } from "lucide-react";

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
    href: "/payments/transactions",
    icon: CreditCard,
    title: "Transactions",
    description:
      "Every payment across all gateways — card, wallet and cash — with fees and status.",
    accent: "bg-navy/5 text-navy",
  },
  {
    href: "/payments/invoices",
    icon: ReceiptText,
    title: "Invoices",
    description:
      "Issued and outstanding invoices for corporate and direct bookings.",
    accent: "bg-rating/10 text-rating",
  },
  {
    href: "/payments/refunds",
    icon: Undo2,
    title: "Refunds",
    description:
      "Refund requests, chargebacks and cancellation-policy paybacks.",
    accent: "bg-gold/15 text-gold",
  },
];

export default function PaymentsHubPage() {
  return (
    <PermissionGuard module="payments">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Transactions, invoices and refunds across every gateway.
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
                    Open section
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
