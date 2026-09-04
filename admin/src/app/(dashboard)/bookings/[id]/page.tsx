"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  MapPin,
  Printer,
  Undo2,
  User,
  Wallet,
} from "lucide-react";

import type { BookingOut } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatAED } from "@/lib/finance";
import { useAdminBookings } from "@/lib/bookings";
import { usePermissions } from "@/lib/roles";
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
  requires_action: "bg-amber-100 text-amber-700",
  requires_confirmation: "bg-amber-100 text-amber-700",
  requires_payment_method: "bg-muted text-muted-foreground",
  failed: "bg-destructive/10 text-destructive",
  canceled: "bg-destructive/10 text-destructive",
  refunded: "bg-navy/10 text-navy",
  partially_refunded: "bg-navy/10 text-navy",
};

function money(currency: string, n: number) {
  return `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function moneyFmt(currency: string, n: number) {
  return `${currency} ${formatAED(n)}`;
}

function guestName(b: BookingOut) {
  return [b.guest_first_name, b.guest_last_name].filter(Boolean).join(" ") || b.guest_email;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right tabular-nums", strong ? "font-semibold text-navy" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { bookings: liveBookings, isLoading, error, refundPayment, isMutating } =
    useAdminBookings({ limit: 200 });
  const { can } = usePermissions();
  const canManage = can("bookings", "edit");

  const [booking, setBooking] = useState<BookingOut | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  // Resolve the record id (reference) against the fetched list, then fetch the
  // full booking detail so we always have the latest payment state.
  const id = params.id;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await callApi(() => api.admin.bookings.get(id));
        if (!cancelled) setBooking(data);
      } catch {
        if (cancelled) return;
        const fromList = liveBookings.find((b) => b.reference === id || b.id === id);
        if (fromList && !cancelled) setBooking(fromList);
      } finally {
        // no-op
      }
    }
    if (liveBookings.length > 0 || error) load();
    return () => {
      cancelled = true;
    };
  }, [id, liveBookings, error]);

  async function handleRefund() {
    if (!booking) return;
    if (!window.confirm(`Refund ${booking.reference} in full?`)) return;
    try {
      const updated = await refundPayment(booking.id);
      setBooking(updated);
      setNotice(`Refund issued for ${booking.reference}.`);
      setActionError("");
    } catch (err) {
      setActionError("Couldn't refund this booking.");
    }
  }

  const pendingLoad =
    (isLoading && liveBookings.length === 0 && !error) || (booking == null && error == null);

  return (
    <PermissionGuard module="bookings">
      <div className="space-y-6 p-6 lg:p-8 print:space-y-0 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/bookings" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Hotel Bookings
          </Button>
          <div className="flex items-center gap-2">
            {canManage && booking && (
              <Button variant="destructive" size="sm" onClick={handleRefund} disabled={isMutating}>
                <Undo2 data-icon="inline-start" />
                Refund
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer data-icon="inline-start" />
              Print
            </Button>
          </div>
        </div>

        {pendingLoad && (
          <div className="flex flex-col items-center justify-center gap-3 p-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading booking…</p>
          </div>
        )}

        {!pendingLoad && !booking && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Booking <span className="font-medium">{id}</span> not found.
            </CardContent>
          </Card>
        )}

        {booking && (
          <>
            {notice && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 print:hidden">
                {notice}
              </div>
            )}
            {actionError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive print:hidden">
                {actionError}
              </div>
            )}

            {/* Hero — property + status */}
            <Card className="overflow-hidden print:border-0 print:rounded-none print:shadow-none">
              {booking.room_image ? (
                <div className="relative h-44 w-full sm:h-56">
                  <img
                    src={booking.room_image}
                    alt={booking.property_name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-navy">{booking.property_name}</p>
                    {booking.location && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {booking.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-navy">{booking.reference}</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <Badge className={cn("rounded-full capitalize", statusBadge[booking.status])}>
                        {booking.status.replace(/_/g, " ")}
                      </Badge>
                      {booking.payment && (
                        <Badge
                          className={cn(
                            "rounded-full capitalize",
                            paymentBadge[booking.payment.status] ?? "bg-muted text-muted-foreground",
                          )}
                        >
                          {booking.payment.status.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stay details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  Stay details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Row label="Check-in" value={format(new Date(booking.check_in), "EEE, d MMM yyyy")} />
                <Row label="Check-out" value={format(new Date(booking.check_out), "EEE, d MMM yyyy")} />
                <Row
                  label="Total nights"
                  value={`${booking.nights} night${booking.nights > 1 ? "s" : ""}`}
                />
                <Row label="Room" value={booking.room_name} />
                <Row
                  label="Occupancy"
                  value={
                    `${booking.adults} adult${booking.adults > 1 ? "s" : ""}` +
                    (booking.children > 0
                      ? `, ${booking.children} child${booking.children > 1 ? "ren" : ""}` +
                        (booking.child_ages.length
                          ? ` (age ${booking.child_ages.join(", ")})`
                          : "")
                      : "") +
                    `, ${booking.rooms} room${booking.rooms > 1 ? "s" : ""}`
                  }
                />
                {booking.arrival_time && <Row label="Estimated arrival" value={booking.arrival_time} />}
                {booking.special_requests && (
                  <Row label="Special requests" value={booking.special_requests} />
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Guest info */}
              <SectionCard icon={User} title="Guest information">
                <Row label="Full name" value={guestName(booking)} />
                <Row label="Email" value={booking.guest_email} />
                <Row
                  label="Phone"
                  value={[booking.guest_dial_code, booking.guest_phone].filter(Boolean).join(" ") || "—"}
                />
                <Row label="Country" value={booking.guest_country ?? "—"} />
                <Row label="Booking for" value={booking.booking_for.replace(/_/g, " ")} />
                <Row
                  label="Booked on"
                  value={format(new Date(booking.created_at), "d MMM yyyy, HH:mm")}
                />
              </SectionCard>

              {/* Payment detail */}
              <SectionCard icon={CreditCard} title="Payment details">
                {booking.payment ? (
                  <>
                    <Row label="Status" value={booking.payment.status.replace(/_/g, " ")} strong />
                    <Row label="Amount" value={money(booking.currency, Number(booking.payment.amount))} />
                    <Row
                      label="Captured"
                      value={money(booking.currency, Number(booking.payment.amount_captured))}
                    />
                    <Row
                      label="Refunded"
                      value={money(booking.currency, Number(booking.payment.amount_refunded))}
                    />
                    <Row label="Capture method" value={booking.payment.capture_method.replace(/_/g, " ")} />
                    {booking.payment.card_brand && (
                      <Row label="Card" value={`${booking.payment.card_brand}`} />
                    )}
                    {booking.payment.card_last4 && (
                      <Row label="Card number" value={`•••• ${booking.payment.card_last4}`} />
                    )}
                    {booking.payment.error_message && (
                      <Row label="Error" value={booking.payment.error_message} />
                    )}
                  </>
                ) : (
                  <p className="py-2 text-sm text-muted-foreground">
                    {booking.payment_timing === "pay_later"
                      ? "Pay at stay — no card charged yet."
                      : "No payment recorded."}
                  </p>
                )}
                {booking.extras.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-sm font-medium text-navy">Extras</p>
                    {booking.extras.map((x) => (
                      <Row
                        key={x.extra_id}
                        label={x.title}
                        value={money(booking.currency, Number(x.price))}
                      />
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Price breakdown */}
            <SectionCard icon={Wallet} title="Price breakdown">
              <Row
                label="Nights subtotal"
                value={moneyFmt(booking.currency, Number(booking.nights_subtotal))}
              />
              <Row
                label="Extras"
                value={
                  Number(booking.extras_total) > 0
                    ? moneyFmt(booking.currency, Number(booking.extras_total))
                    : "—"
                }
              />
              <Row
                label="Taxes & fees"
                value={moneyFmt(booking.currency, Number(booking.taxes_fees))}
              />
              <Row
                label="Service fee"
                value={moneyFmt(booking.currency, Number(booking.service_fee))}
              />
              {booking.promo_code && (
                <Row
                  label={`Promo (${booking.promo_code})`}
                  value={`- ${moneyFmt(booking.currency, Number(booking.promo_discount))}`}
                />
              )}
              <div className="mt-1 border-t border-border pt-2">
                <Row
                  label={booking.payment_timing === "pay_later" ? "Amount held" : "Total paid"}
                  value={moneyFmt(booking.currency, Number(booking.total_amount))}
                  strong
                />
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
