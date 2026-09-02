"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarX, CreditCard, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatAED } from "@/lib/finance";
import { getBooking } from "@/lib/reports";
import { bookingMargin } from "@/lib/reports-data";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusBadge: Record<string, string> = {
  confirmed: "bg-amber-600/10 text-amber-600",
  completed: "bg-rating/10 text-rating",
  cancelled: "bg-destructive/10 text-destructive",
  no_show: "bg-destructive/10 text-destructive",
  paid: "bg-rating/10 text-rating",
  processed: "bg-rating/10 text-rating",
  pending: "bg-amber-600/10 text-amber-600",
  failed: "bg-destructive/10 text-destructive",
};

const aed = (n: number) => `AED ${formatAED(n)}`;

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums", strong && "font-semibold text-navy")}>{value}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const booking = getBooking(params.id);

  return (
    <PermissionGuard module="reports">
      <div className="space-y-6 p-6 lg:p-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          render={<Link href="/reports/bookings" />}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to Booking Report
        </Button>

        {!booking ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Booking <span className="font-medium">{params.id}</span> not found.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-navy">{booking.id}</h1>
              <Badge className={cn("rounded-full capitalize", statusBadge[booking.status])}>
                {booking.status.replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {booking.channel} · supplier ref {booking.supplierRef}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Guest</CardTitle>
                </CardHeader>
                <CardContent>
                  <Row label="Name" value={booking.guestName} />
                  <Row label="Email" value={booking.guestEmail} />
                  <Row label="Booked on" value={booking.createdAt} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stay</CardTitle>
                </CardHeader>
                <CardContent>
                  <Row label="Hotel" value={`${booking.hotel}, ${booking.city}`} />
                  <Row
                    label="Dates"
                    value={`${booking.checkIn} → ${booking.checkOut} (${booking.nights} nights)`}
                  />
                  <div className="mt-2 space-y-1.5 border-t border-border pt-2">
                    {booking.rooms.map((r, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {r.occupancy} · {r.boardBasis}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rate breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Row label="Gross (guest paid)" value={aed(booking.grossAmount)} />
                  <Row label="Supplier cost" value={`- ${aed(booking.supplierCost)}`} />
                  <Row label="Taxes & fees" value={`- ${aed(booking.taxesFees)}`} />
                  <div className="mt-1 border-t border-border pt-1">
                    <Row label="Net margin" value={aed(bookingMargin(booking))} strong />
                  </div>
                </CardContent>
              </Card>

              {booking.cancellation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarX className="size-4 text-destructive" />
                      Cancellation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Row label="Cancelled on" value={booking.cancellation.date} />
                    <Row label="Reason" value={booking.cancellation.reason} />
                    <Row label="Penalty kept" value={aed(booking.cancellation.penalty)} />
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-4" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-border text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium">Gateway</th>
                        <th className="px-4 py-2.5 font-medium">Reference</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {booking.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2.5">{p.date}</td>
                          <td className="px-4 py-2.5">{p.method}</td>
                          <td className="px-4 py-2.5">{p.gatewayRef}</td>
                          <td className="px-4 py-2.5">
                            <Badge className={cn("rounded-full capitalize", statusBadge[p.status])}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{aed(p.amount)}</td>
                        </tr>
                      ))}
                      {booking.payments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No payments recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Undo2 className="size-4" />
                  Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-border text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium">Gateway</th>
                        <th className="px-4 py-2.5 font-medium">Reason</th>
                        <th className="px-4 py-2.5 font-medium">Reference</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {booking.refunds.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-2.5">{r.date}</td>
                          <td className="px-4 py-2.5">{r.method}</td>
                          <td className="px-4 py-2.5">{r.reason}</td>
                          <td className="px-4 py-2.5">{r.gatewayRef}</td>
                          <td className="px-4 py-2.5">
                            <Badge className={cn("rounded-full capitalize", statusBadge[r.status])}>
                              {r.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{aed(r.amount)}</td>
                        </tr>
                      ))}
                      {booking.refunds.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                            No refunds issued.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
