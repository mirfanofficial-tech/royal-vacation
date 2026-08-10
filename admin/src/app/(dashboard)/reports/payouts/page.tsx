"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CircleAlert,
  Clock,
  Coins,
  Landmark,
  Search,
  Send,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  moduleCommissions,
  payoutKpis,
  payoutRecords,
  formatPayout,
  type PayoutStatus,
} from "@/lib/payouts";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const statusBadge: Record<PayoutStatus, string> = {
  scheduled: "bg-navy/10 text-navy",
  processing: "bg-amber-600/10 text-amber-600",
  paid: "bg-rating/10 text-rating",
  failed: "bg-destructive/10 text-destructive",
};

const statusIcon: Record<PayoutStatus, typeof Clock> = {
  scheduled: CalendarClock,
  processing: Clock,
  paid: BadgeCheck,
  failed: CircleAlert,
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

function PayoutsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      payoutRecords.filter((p) => {
        const q = query.trim().toLowerCase();
        return (
          !q ||
          p.source.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q)
        );
      }),
    [query]
  );

  const kpis = [
    {
      label: "Paid out · 30 days",
      value: `AED ${formatPayout(payoutKpis.paidOut)}`,
      delta: payoutKpis.paidOutDelta,
      hint: "vs previous 30 days",
      icon: Banknote,
    },
    {
      label: "Next payout",
      value: `AED ${formatPayout(payoutKpis.nextPayout)}`,
      delta: payoutKpis.paidOutDelta,
      hint: payoutKpis.nextPayoutDate,
      icon: Send,
    },
    {
      label: "Pending settlements",
      value: `AED ${formatPayout(payoutKpis.pending)}`,
      delta: -2.4,
      hint: "1 payout processing",
      icon: Clock,
    },
    {
      label: "Failed payouts",
      value: `AED ${formatPayout(payoutKpis.failed)}`,
      delta: 100,
      hint: "Amadeus · review required",
      icon: CircleAlert,
    },
  ];

  const totalCommissions = moduleCommissions.reduce((s, m) => s + m.commission, 0);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Payout Reports</h1>
          <p className="text-sm text-muted-foreground">
            Settlements to your bank accounts and partner commissions owed.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Landmark data-icon="inline-start" />
          Bank accounts
        </Button>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Payout schedule</CardTitle>
                <CardDescription>
                  Upcoming and recent settlements to your accounts.
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search payouts…"
                  aria-label="Search payouts"
                  className="h-8 w-56 pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="px-6 py-2.5">Scheduled</th>
                    <th className="px-6 py-2.5">Source</th>
                    <th className="px-6 py-2.5">Description</th>
                    <th className="px-6 py-2.5">To</th>
                    <th className="px-6 py-2.5">Status</th>
                    <th className="px-6 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const Icon = statusIcon[p.status];
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-muted/40">
                        <td className="px-6 py-3 text-muted-foreground">{p.scheduled}</td>
                        <td className="px-6 py-3 font-medium">{p.source}</td>
                        <td className="px-6 py-3 text-muted-foreground">{p.description}</td>
                        <td className="px-6 py-3 text-muted-foreground">{p.method}</td>
                        <td className="px-6 py-3">
                          <Badge
                            className={cn(
                              "rounded-full capitalize",
                              statusBadge[p.status]
                            )}
                          >
                            <Icon className="size-3" />
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-right font-semibold tabular-nums">
                          AED {formatPayout(p.amount)}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        No payouts match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Module commissions</CardTitle>
            <CardDescription>Owed to partner API providers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {moduleCommissions.map((m) => (
              <div key={m.module} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.module}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.category} · {m.commissionRate}% of AED{" "}
                    {formatPayout(m.gross)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    Due {m.due}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  AED {formatPayout(m.commission)}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Coins className="size-4 text-gold" />
                Total owed
              </p>
              <p className="text-sm font-semibold">
                AED {formatPayout(totalCommissions)}
              </p>
            </div>
            <p className="flex items-start gap-1.5 rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
              <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
              Amadeus commission of AED 11,800 failed to transfer. Review the
              bank details before the next settlement run.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PayoutReportsPage() {
  return (
    <PermissionGuard module="reports">
      <PayoutsPage />
    </PermissionGuard>
  );
}
