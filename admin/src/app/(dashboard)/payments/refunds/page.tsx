"use client";

import { useMemo, useState } from "react";
import { Clock, Search, Undo2, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatAED,
  paymentRefunds,
  type RefundStatus,
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

const statusBadge: Record<RefundStatus, string> = {
  completed: "bg-rating/10 text-rating",
  processing: "bg-amber-600/10 text-amber-600",
  pending: "bg-navy/10 text-navy",
};

function RefundsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RefundStatus>("all");

  const filtered = useMemo(
    () =>
      paymentRefunds.filter((ref) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          ref.bookingRef.toLowerCase().includes(q) ||
          ref.guest.toLowerCase().includes(q) ||
          ref.property.toLowerCase().includes(q) ||
          ref.reason.toLowerCase().includes(q);
        const matchesStatus = status === "all" || ref.status === status;
        return matchesQuery && matchesStatus;
      }),
    [query, status]
  );

  const totalRefunded = paymentRefunds
    .filter((r) => r.status === "completed" || r.status === "processing")
    .reduce((s, r) => s + r.amount, 0);
  const inFlight = paymentRefunds
    .filter((r) => r.status === "processing")
    .reduce((s, r) => s + r.amount, 0);
  const pending = paymentRefunds
    .filter((r) => r.status === "pending")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Refunds</h1>
        <p className="text-sm text-muted-foreground">
          Refund requests, chargebacks and cancellation-policy paybacks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Refunded + processing", value: totalRefunded, icon: Undo2 },
          { label: "In flight", value: inFlight, icon: Clock },
          { label: "Awaiting review", value: pending, icon: Wallet },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                AED {formatAED(value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Refund requests</CardTitle>
              <CardDescription>
                Issued paybacks and chargebacks awaiting settlement.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search booking, guest, property…"
                  aria-label="Search refunds"
                  className="h-8 w-64 pl-8"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "all" | RefundStatus)}
                aria-label="Filter by status"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-6 py-2.5">Date</th>
                  <th className="px-6 py-2.5">Booking</th>
                  <th className="px-6 py-2.5">Guest</th>
                  <th className="px-6 py-2.5">Property</th>
                  <th className="px-6 py-2.5">Reason</th>
                  <th className="px-6 py-2.5">Status</th>
                  <th className="px-6 py-2.5 text-right">Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ref) => (
                  <tr key={ref.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-6 py-3 text-muted-foreground">{ref.date}</td>
                    <td className="px-6 py-3 font-mono text-xs">{ref.bookingRef}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{ref.guest}</p>
                      <p className="text-xs text-muted-foreground">{ref.initiatedBy}</p>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{ref.property}</td>
                    <td className="max-w-[240px] px-6 py-3 text-muted-foreground">
                      <p className="truncate">{ref.reason}</p>
                    </td>
                    <td className="px-6 py-3">
                      <Badge className={cn("rounded-full capitalize", statusBadge[ref.status])}>
                        {ref.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <p className="font-semibold tabular-nums">
                        AED {formatAED(ref.amount)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        of AED {formatAED(ref.original)} charged
                      </p>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      No refunds match your filters.
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

export default function PaymentRefundsPage() {
  return (
    <PermissionGuard module="payments">
      <RefundsPage />
    </PermissionGuard>
  );
}
