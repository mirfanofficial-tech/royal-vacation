"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarCheck,
  Coins,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Percent,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  financeChannels,
  financeGatewayBalances,
  financePaymentMethods,
  financePropertyRows,
  financeRanges,
  financeTaxFees,
  financeTransactions,
  formatAED,
  type FinanceTxnStatus,
} from "@/lib/finance";
import { PermissionGuard } from "@/components/permission-guard";
import { AreaChart, DonutChart } from "@/components/finance-charts";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusBadge: Record<FinanceTxnStatus, string> = {
  paid: "bg-rating/10 text-rating",
  pending: "bg-amber-600/10 text-amber-600",
  refunded: "bg-destructive/10 text-destructive",
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

function FinancePage() {
  const [rangeId, setRangeId] = useState("this-year");
  const [txnQuery, setTxnQuery] = useState("");
  const [txnStatus, setTxnStatus] = useState<"all" | FinanceTxnStatus>("all");

  const range = financeRanges.find((r) => r.id === rangeId) ?? financeRanges[0];

  const kpis = useMemo(
    () => [
      {
        label: "Gross revenue",
        value: `AED ${formatAED(range.revenue)}`,
        delta: range.deltaRevenue,
        hint: "Incl. taxes & fees",
        icon: Wallet,
      },
      {
        label: "Bookings",
        value: String(range.bookings),
        delta: range.deltaBookings,
        hint: `${Math.round(range.bookings / 7.4)} per week`,
        icon: CalendarCheck,
      },
      {
        label: "Refunds",
        value: `AED ${formatAED(range.refunds)}`,
        delta: range.deltaRefunds,
        hint: `${Math.round((range.refunds / range.revenue) * 100)}% of revenue`,
        icon: Receipt,
      },
      {
        label: "Average daily rate",
        value: `AED ${formatAED(range.adr)}`,
        delta: 4.2,
        hint: "Per occupied night",
        icon: Coins,
      },
    ],
    [range]
  );

  const channelTotal = financeChannels.reduce((s, c) => s + c.amount, 0);

  const filteredTxns = financeTransactions.filter((txn) => {
    const q = txnQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      txn.reference.toLowerCase().includes(q) ||
      txn.description.toLowerCase().includes(q) ||
      txn.method.toLowerCase().includes(q);
    const matchesStatus = txnStatus === "all" || txn.status === txnStatus;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Finance Reports</h1>
          <p className="text-sm text-muted-foreground">
            Revenue, refunds and channel performance across your portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
            {financeRanges.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRangeId(r.id)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  rangeId === r.id
                    ? "bg-navy text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Badge variant="outline" className="h-8 gap-1.5 px-2.5">
            <Banknote data-icon="inline-start" className="size-3.5 text-gold" />
            AED
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Export report"
              className="outline-none"
            >
              <Button variant="outline" size="sm">
                <Download data-icon="inline-start" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" alignOffset={-8} className="w-48">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => undefined}>
                <FileSpreadsheet />
                CSV spreadsheet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => undefined}>
                <FileText />
                PDF report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => undefined}>
                <CalendarCheck />
                Schedule monthly report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle>Revenue trend</CardTitle>
                <CardDescription>
                  {range.label} · compared to the previous period
                </CardDescription>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rating/10 px-2.5 py-1 text-xs font-semibold text-rating">
                <ArrowUpRight className="size-3.5" />
                +{range.deltaRevenue}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart data={range.series} />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-semibold">AED {formatAED(range.revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Avg {range.series.length > 12 ? "month" : range.series.length > 8 ? "day" : "period"}
                </p>
                <p className="text-sm font-semibold">
                  AED{" "}
                  {formatAED(
                    Math.round(
                      range.revenue / range.series.length
                    )
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peak</p>
                <p className="text-sm font-semibold">
                  AED{" "}
                  {formatAED(
                    Math.max(...range.series.map((s) => s.value))
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Revenue by channel</CardTitle>
            <CardDescription>Share of gross revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center pt-2">
              <DonutChart
                segments={financeChannels.map((c) => ({
                  label: c.name,
                  color: c.color,
                  value: c.amount,
                }))}
                centerValue={`AED ${formatAED(channelTotal / 1000)}k`}
                centerLabel="gross revenue"
              />
            </div>
            <div className="space-y-2">
              {financeChannels.map((c) => (
                <div key={c.name} className="flex items-center gap-2.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.share}%
                  </span>
                  <span className="w-20 text-right text-sm font-medium tabular-nums">
                    AED {formatAED(c.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Revenue by property</CardTitle>
            <CardDescription>Ranked by gross revenue · {range.label}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {financePropertyRows.map((p) => (
              <div key={p.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.location} · {p.bookings} bookings
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {p.share}%
                    </span>
                    <p className="w-24 text-right text-sm font-semibold tabular-nums">
                      AED {formatAED(p.revenue)}
                    </p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-navy"
                    style={{
                      width: `${Math.round((p.revenue / 268800) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Payment methods</CardTitle>
              <CardDescription>Captured via active gateways</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {financePaymentMethods.map((m) => (
                <div key={m.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{m.name}</span>
                    <span className="text-sm font-medium tabular-nums">
                      AED {formatAED(m.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${m.share * 2}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              ))}
              <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                <CreditCard className="size-3.5" />
                Settlements reconcile daily at 03:00
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Tax &amp; fees</CardTitle>
              <CardDescription>Held and payable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {financeTaxFees.map((t) => (
                <div key={t.label} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.note}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    AED {formatAED(t.amount)}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Percent className="size-4 text-gold" />
                  Total held
                </p>
                <p className="text-sm font-semibold">
                  AED {formatAED(financeTaxFees.reduce((s, t) => s + t.amount, 0))}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Gateway balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financeGatewayBalances.map((g) => (
                <div key={g.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      <Landmark className="size-3.5" />
                    </span>
                    <span className="text-sm font-medium">{g.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      AED {formatAED(g.balance)}
                    </p>
                    {g.pending > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {formatAED(g.pending)} pending
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Latest payments and refunds across all gateways.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={txnQuery}
                  onChange={(e) => setTxnQuery(e.target.value)}
                  placeholder="Search reference or guest…"
                  aria-label="Search transactions"
                  className="h-8 w-56 pl-8"
                />
              </div>
              <select
                value={txnStatus}
                onChange={(e) =>
                  setTxnStatus(e.target.value as "all" | FinanceTxnStatus)
                }
                aria-label="Filter by status"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-6 py-2.5">Date</th>
                  <th className="px-6 py-2.5">Reference</th>
                  <th className="px-6 py-2.5">Description</th>
                  <th className="px-6 py-2.5">Channel</th>
                  <th className="px-6 py-2.5">Method</th>
                  <th className="px-6 py-2.5">Status</th>
                  <th className="px-6 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTxns.map((txn) => (
                  <tr key={txn.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-6 py-3 text-muted-foreground">{txn.date}</td>
                    <td className="px-6 py-3 font-mono text-xs">{txn.reference}</td>
                    <td className="px-6 py-3">{txn.description}</td>
                    <td className="px-6 py-3 text-muted-foreground">{txn.channel}</td>
                    <td className="px-6 py-3 text-muted-foreground">{txn.method}</td>
                    <td className="px-6 py-3">
                      <Badge className={cn("rounded-full capitalize", statusBadge[txn.status])}>
                        {txn.status}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "px-6 py-3 text-right font-semibold tabular-nums",
                        txn.status === "refunded" && "text-destructive"
                      )}
                    >
                      {txn.status === "refunded" ? "−" : ""}AED{" "}
                      {formatAED(txn.amount)}
                    </td>
                  </tr>
                ))}
                {filteredTxns.length === 0 && (
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

export default function FinanceReportsPage() {
  return (
    <PermissionGuard module="reports">
      <FinancePage />
    </PermissionGuard>
  );
}
