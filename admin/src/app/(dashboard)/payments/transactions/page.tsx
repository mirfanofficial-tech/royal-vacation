"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatAED,
  paymentKpis,
  paymentTransactions,
  type PaymentTxnStatus,
} from "@/lib/payments";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const statusBadge: Record<PaymentTxnStatus, string> = {
  paid: "bg-rating/10 text-rating",
  pending: "bg-amber-600/10 text-amber-600",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-navy/10 text-navy",
};

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        up ? "text-rating" : "text-destructive"
      )}
    >
      <Icon className="size-3.5" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | PaymentTxnStatus>("all");

  const kpis = [
    {
      label: "Processed · 7 days",
      value: `AED ${formatAED(paymentKpis.processedVolume)}`,
      delta: 12.4,
      hint: "12 transactions",
      icon: Wallet,
    },
    {
      label: "Success rate",
      value: `${paymentKpis.successRate}%`,
      delta: 1.8,
      hint: "Gateway approved",
      icon: BadgeCheck,
    },
    {
      label: "Gateway fees",
      value: `AED ${formatAED(paymentKpis.gatewayFees)}`,
      delta: 3.1,
      hint: "≈ 4.3% of volume",
      icon: CreditCard,
    },
    {
      label: "Outstanding invoices",
      value: `AED ${formatAED(paymentKpis.outstandingInvoices)}`,
      delta: -6.2,
      hint: "Due within 30 days",
      icon: Receipt,
    },
  ];

  const filtered = useMemo(
    () =>
      paymentTransactions.filter((txn) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          txn.bookingRef.toLowerCase().includes(q) ||
          txn.guest.toLowerCase().includes(q) ||
          txn.property.toLowerCase().includes(q) ||
          txn.method.toLowerCase().includes(q);
        const matchesStatus = status === "all" || txn.status === status;
        return matchesQuery && matchesStatus;
      }),
    [query, status]
  );

  const paid = paymentTransactions.filter((t) => t.status === "paid").length;
  const pending = paymentTransactions.filter((t) => t.status === "pending").length;
  const failed = paymentTransactions.filter((t) => t.status === "failed").length;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Every payment captured across all gateways.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rating" /> {paid} paid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" /> {pending} pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" /> {failed} failed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, delta, hint, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <div className="flex items-center justify-between">
                <Delta value={delta} />
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Payment history</CardTitle>
              <CardDescription>
                Recent charges across card, wallet, transfer and cash.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reference, guest, property…"
                  aria-label="Search transactions"
                  className="h-8 w-64 pl-8"
                />
              </div>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "all" | PaymentTxnStatus)
                }
                aria-label="Filter by status"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-6 py-2.5">Date</th>
                  <th className="px-6 py-2.5">Reference</th>
                  <th className="px-6 py-2.5">Guest</th>
                  <th className="px-6 py-2.5">Property</th>
                  <th className="px-6 py-2.5">Method</th>
                  <th className="px-6 py-2.5">Status</th>
                  <th className="px-6 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((txn) => (
                  <tr key={txn.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-6 py-3 text-muted-foreground">{txn.date}</td>
                    <td className="px-6 py-3 font-mono text-xs">{txn.bookingRef}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{txn.guest}</p>
                      <p className="text-xs text-muted-foreground">{txn.guestEmail}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-foreground">{txn.property}</p>
                      <p className="text-xs text-muted-foreground">{txn.channel}</p>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{txn.method}</td>
                    <td className="px-6 py-3">
                      <Badge className={cn("rounded-full capitalize", statusBadge[txn.status])}>
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <p
                        className={cn(
                          "font-semibold tabular-nums",
                          txn.status === "refunded" && "text-destructive"
                        )}
                      >
                        {txn.status === "refunded" ? "−" : ""}AED {formatAED(txn.amount)}
                      </p>
                      {txn.fee > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          fee AED {formatAED(txn.fee)}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      No transactions match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentTransactionsPage() {
  return (
    <PermissionGuard module="payments">
      <TransactionsPage />
    </PermissionGuard>
  );
}
