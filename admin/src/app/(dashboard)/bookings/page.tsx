"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BadgeCheck,
  CalendarCheck,
  CircleDollarSign,
  Loader2,
  MoreHorizontal,
  Search,
  Undo2,
  Wallet,
} from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useAdminBookings } from "@/lib/bookings";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  confirmed: "bg-rating/10 text-rating",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-navy/10 text-navy",
  cancelled: "bg-destructive/10 text-destructive",
  no_show: "bg-destructive/10 text-destructive",
};

const paymentBadge: Record<string, string> = {
  succeeded: "bg-rating/10 text-rating",
  requires_capture: "bg-amber-100 text-amber-700",
  processing: "bg-amber-100 text-amber-700",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-navy/10 text-navy",
  partially_refunded: "bg-navy/10 text-navy",
};

const STATUS_FILTERS = ["all", "confirmed", "pending", "completed", "cancelled", "no_show"] as const;

function money(currency: string, n: number) {
  return `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function guestName(b: BookingOut) {
  return [b.guest_first_name, b.guest_last_name].filter(Boolean).join(" ") || b.guest_email;
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function BookingsScreen() {
  const { bookings, summary, isLoading, error, capturePayment, refundPayment, isMutating } =
    useAdminBookings({ limit: 200 });
  const { can } = usePermissions();
  const canManage = can("bookings", "edit");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const matchesQuery =
        !q ||
        `${b.reference} ${b.property_name} ${guestName(b)} ${b.guest_email}`
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [bookings, query, statusFilter]);

  function flash(msg: string) {
    setNotice(msg);
    setActionError("");
    window.setTimeout(() => setNotice(""), 5000);
  }

  async function handleCapture(b: BookingOut) {
    try {
      await capturePayment(b.id);
      flash(`Payment captured for ${b.reference}.`);
    } catch (err) {
      setActionError(errorMessage(err, "Couldn't capture this payment."));
    }
  }

  async function handleRefund(b: BookingOut) {
    if (!window.confirm(`Refund ${b.reference} in full?`)) return;
    try {
      await refundPayment(b.id);
      flash(`Refund issued for ${b.reference}.`);
    } catch (err) {
      setActionError(errorMessage(err, "Couldn't refund this booking."));
    }
  }

  const stats = [
    { label: "Total bookings", value: summary.total, icon: CalendarCheck },
    { label: "Confirmed", value: summary.confirmed, icon: BadgeCheck },
    { label: "Pending", value: summary.pending, icon: Loader2 },
    {
      label: "Booking value",
      value: money(summary.currency, summary.revenue),
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Live reservations from the booking &amp; payment flow.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <BadgeCheck className="size-4 shrink-0" />
          {notice}
        </div>
      )}
      {(actionError || error) && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {actionError || "Couldn't load bookings."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>All bookings</CardTitle>
              <CardDescription>
                {filtered.length} of {bookings.length} shown.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reference, guest, property…"
                  aria-label="Search bookings"
                  className="h-8 w-64 pl-8"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as (typeof STATUS_FILTERS)[number])
                }
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Filter by status"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All statuses" : s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Booking</th>
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Dates</th>
                  <th className="px-6 py-3 font-medium">Guests</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Payment</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((b) => {
                    const canCapture = b.payment?.status === "requires_capture";
                    const canRefund =
                      b.payment != null &&
                      ["succeeded", "requires_capture", "partially_refunded"].includes(
                        b.payment.status,
                      );
                    return (
                      <tr key={b.id} className="hover:bg-muted/40">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-navy/10 text-navy">
                              <CalendarCheck className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-navy">{b.reference}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {b.property_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <p className="font-medium">{guestName(b)}</p>
                          <p className="truncate text-xs text-muted-foreground">{b.guest_email}</p>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {format(new Date(b.check_in), "d MMM")} &rarr;{" "}
                          {format(new Date(b.check_out), "d MMM yyyy")}
                          <span className="ml-1 text-xs">({b.nights}n)</span>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {b.adults + b.children} · {b.rooms} room{b.rooms > 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-3 font-medium tabular-nums">
                          {money(b.currency, Number(b.total_amount))}
                        </td>
                        <td className="px-6 py-3">
                          {b.payment ? (
                            <Badge
                              className={cn(
                                "rounded-full capitalize",
                                paymentBadge[b.payment.status] ?? "bg-muted text-muted-foreground",
                              )}
                            >
                              {b.payment.status.replace(/_/g, " ")}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {b.payment_timing === "pay_later" ? "Pay at stay" : "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <Badge
                            className={cn(
                              "rounded-full capitalize",
                              statusBadge[b.status] ?? "bg-muted text-muted-foreground",
                            )}
                          >
                            {b.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {canManage && (canCapture || canRefund) ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label="Booking actions"
                                disabled={isMutating}
                                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" alignOffset={-8}>
                                {canCapture && (
                                  <DropdownMenuItem onClick={() => handleCapture(b)}>
                                    <CircleDollarSign />
                                    Capture payment
                                  </DropdownMenuItem>
                                )}
                                {canCapture && canRefund && <DropdownMenuSeparator />}
                                {canRefund && (
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleRefund(b)}
                                  >
                                    <Undo2 />
                                    Refund booking
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      {bookings.length === 0
                        ? "No bookings yet."
                        : "No bookings match your filters."}
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

export default function BookingsPage() {
  return (
    <PermissionGuard module="bookings">
      <BookingsScreen />
    </PermissionGuard>
  );
}
