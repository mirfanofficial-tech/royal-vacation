"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, FileText, MoreVertical, Plus, Search, Send, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatAED, type InvoiceStatus } from "@/lib/payments";
import { usePaymentsData } from "@/lib/payments-hooks";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusBadge: Record<InvoiceStatus, string> = {
  paid: "bg-rating/10 text-rating",
  sent: "bg-amber-600/10 text-amber-600",
  draft: "bg-muted text-muted-foreground",
  overdue: "bg-destructive/10 text-destructive",
};

const statusLabel: Record<InvoiceStatus, string> = {
  paid: "Paid",
  sent: "Sent",
  draft: "Draft",
  overdue: "Overdue",
};

function InvoicesPage() {
  const { invoices, isLoading } = usePaymentsData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          inv.number.toLowerCase().includes(q) ||
          inv.guest.toLowerCase().includes(q) ||
          inv.property.toLowerCase().includes(q) ||
          inv.bookingRef.toLowerCase().includes(q);
        const matchesStatus = status === "all" || inv.status === status;
        return matchesQuery && matchesStatus;
      }),
    [invoices, query, status]
  );

  const total = invoices.reduce((s, inv) => s + inv.total, 0);
  const paid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((s, inv) => s + inv.total, 0);
  const outstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((s, inv) => s + inv.total, 0);

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-20">
        <span className="text-sm text-muted-foreground">Loading invoices…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Issued and outstanding invoices for direct and corporate bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Send data-icon="inline-start" />
            Send reminder
          </Button>
          <Button size="sm">
            <Plus data-icon="inline-start" />
            New invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total issued", value: total, icon: FileText },
          { label: "Collected", value: paid, icon: Wallet },
          { label: "Outstanding", value: outstanding, icon: Send },
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
              <CardTitle>Invoice register</CardTitle>
              <CardDescription>
                Recent invoices with payment status.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search invoice, guest, property…"
                  aria-label="Search invoices"
                  className="h-8 w-64 pl-8"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "all" | InvoiceStatus)}
                aria-label="Filter by status"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-6 py-2.5">Invoice</th>
                  <th className="px-6 py-2.5">Guest</th>
                  <th className="px-6 py-2.5">Property</th>
                  <th className="px-6 py-2.5">Issued</th>
                  <th className="px-6 py-2.5">Due</th>
                  <th className="px-6 py-2.5">Status</th>
                  <th className="px-6 py-2.5 text-right">Total</th>
                  <th className="px-6 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-6 py-3">
                      <p className="font-medium">{inv.number}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {inv.bookingRef}
                      </p>
                    </td>
                    <td className="px-6 py-3 font-medium">{inv.guest}</td>
                    <td className="px-6 py-3 text-muted-foreground">{inv.property}</td>
                    <td className="px-6 py-3 text-muted-foreground">{inv.issuedAt}</td>
                    <td className="px-6 py-3 text-muted-foreground">{inv.dueDate}</td>
                    <td className="px-6 py-3">
                      <Badge className={cn("rounded-full", statusBadge[inv.status])}>
                        {statusLabel[inv.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <p className="font-semibold tabular-nums">
                        AED {formatAED(inv.total)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        incl. AED {formatAED(inv.tax)} VAT
                      </p>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="inline-flex items-center justify-center size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" />
                          }
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/payments/invoices/${inv.id}`} />}>
                            <Eye className="size-4" />
                            View invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      No invoices match your filters.
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

export default function PaymentInvoicesPage() {
  return (
    <PermissionGuard module="payments">
      <InvoicesPage />
    </PermissionGuard>
  );
}
