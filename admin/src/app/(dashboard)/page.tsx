"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Bed,
  CalendarCheck,
  CircleCheck,
  Download,
  Filter,
  Plus,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import {
  bookingChannels,
  dashboardKpis,
  dashboardSecondaryMetrics,
  mockBookings,
  mockProperties,
  recentGuestReviews,
  requiresAttentionMock,
  revenueByMonth,
  topDestinations,
  topPerformingProperties,
  type BookingStatus,
  type DashboardAccent,
} from "@/lib/mock-data";
import { useBlogCommentsQuery } from "@/lib/blog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { RevenueBookingsChart } from "@/components/dashboard/revenue-bookings-chart";
import { BookingChannelsChart, CHANNEL_COLORS } from "@/components/dashboard/booking-channels-chart";
import { cn } from "@/lib/utils";

const DATE_RANGES = ["7D", "30D", "90D", "YTD"] as const;

const kpiIcons: Record<string, LucideIcon> = {
  gbv: Wallet,
  bookings: CalendarCheck,
  occupancy: Bed,
  cancellation: XCircle,
};

const accentBg: Record<DashboardAccent, string> = {
  navy: "bg-navy",
  gold: "bg-gold",
  rating: "bg-rating",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

const statusVariant: Record<BookingStatus, "default" | "secondary" | "outline" | "destructive"> = {
  confirmed: "default",
  pending: "outline",
  completed: "secondary",
  cancelled: "destructive",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<(typeof DATE_RANGES)[number]>("30D");
  const [bookingSortDesc, setBookingSortDesc] = useState(true);

  const { data: pendingComments } = useBlogCommentsQuery({ status: "pending" });
  const pendingCommentCount = pendingComments?.length ?? 0;

  const attentionItems = useMemo(() => {
    const items = [...requiresAttentionMock];
    if (pendingCommentCount > 0) {
      items.unshift({
        id: "pending-comments",
        label: `${pendingCommentCount} blog comment${pendingCommentCount === 1 ? "" : "s"} awaiting moderation`,
        sublabel: "Live count from the comments inbox",
        actionLabel: "Review",
        href: "/blogs/comments?status=pending",
      });
    }
    return items;
  }, [pendingCommentCount]);

  const sortedBookings = useMemo(
    () =>
      [...mockBookings].sort((a, b) =>
        bookingSortDesc
          ? b.checkIn.localeCompare(a.checkIn)
          : a.checkIn.localeCompare(b.checkIn)
      ),
    [bookingSortDesc]
  );

  const peakMonth = useMemo(
    () => revenueByMonth.reduce((max, m) => (m.thisYear > max.thisYear ? m : max)),
    []
  );
  const avgMonthly = Math.round(
    revenueByMonth.reduce((sum, m) => sum + m.thisYear, 0) / revenueByMonth.length
  );
  const yoyGrowth = (
    ((revenueByMonth.reduce((s, m) => s + m.thisYear, 0) -
      revenueByMonth.reduce((s, m) => s + m.lastYear, 0)) /
      revenueByMonth.reduce((s, m) => s + m.lastYear, 0)) *
    100
  ).toFixed(1);

  const totalChannelBookings = 1842; // matches the "Confirmed bookings" KPI tile
  const avgRating = (
    recentGuestReviews.reduce((s, r) => s + r.rating, 0) / recentGuestReviews.length
  ).toFixed(1);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Portfolio performance across {mockProperties.length} properties
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-white p-0.5">
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  dateRange === range
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download data-icon="inline-start" />
            Export
          </Button>
          <Button size="sm">
            <Plus data-icon="inline-start" />
            New booking
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-xs text-muted-foreground">
        <CircleCheck className="size-4 shrink-0 text-rating" />
        <span>
          <span className="font-medium text-foreground">Demo data</span> — every figure below is
          mock. No bookings, revenue or review data exists in the backend yet.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => {
          const Icon = kpiIcons[kpi.id];
          const isUp = kpi.trendDirection === "up";
          return (
            <Card key={kpi.id}>
              <CardContent className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-navy/5 text-navy">
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      isUp ? "text-rating" : "text-destructive"
                    )}
                  >
                    {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {kpi.trendPercent}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card size="sm">
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {dashboardSecondaryMetrics.map((metric) => (
            <div key={metric.id}>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-semibold text-foreground">{metric.value}</span>
                <span className="text-xs text-muted-foreground">{metric.delta}</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue &amp; bookings</CardTitle>
            <CardDescription>Gross booking value by month, this year vs last</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueBookingsChart data={revenueByMonth} />
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Peak month</p>
                <p className="font-semibold text-foreground">
                  {peakMonth.month} &middot; AED {peakMonth.thisYear.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. monthly</p>
                <p className="font-semibold text-foreground">AED {avgMonthly.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">YoY growth</p>
                <p className="font-semibold text-rating">+{yoyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking channels</CardTitle>
            <CardDescription>Share of confirmed bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingChannelsChart data={bookingChannels} total={totalChannelBookings} />
            <div className="mt-2 space-y-2">
              {bookingChannels.map((channel, index) => (
                <div key={channel.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length] }}
                    />
                    {channel.label}
                  </span>
                  <span className="font-medium text-foreground">{channel.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Top performing properties</CardTitle>
              <CardDescription>Ranked by revenue this period</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/stays/property-types" />}>
              View all
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {topPerformingProperties.map((property, index) => (
                <div key={property.id} className="flex flex-wrap items-center gap-4 py-3">
                  <span className="w-5 shrink-0 text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white",
                      accentBg[property.accent]
                    )}
                  >
                    {property.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{property.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="w-full shrink-0 sm:w-32">
                    <p className="text-xs text-muted-foreground">{property.occupancy}% occupancy</p>
                    <Progress
                      value={property.occupancy}
                      className="mt-1"
                      indicatorClassName={accentBg[property.accent]}
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {property.currency} {property.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top destinations</CardTitle>
            <CardDescription>Bookings by city</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDestinations.map((destination) => {
              const pct = (destination.bookings / topDestinations[0].bookings) * 100;
              return (
                <div key={destination.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{destination.city}</span>
                    <span className="text-xs text-muted-foreground">
                      {destination.bookings.toLocaleString()} bookings
                    </span>
                  </div>
                  <Progress value={pct} className="mt-1.5" indicatorClassName="bg-gold" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>Latest {mockBookings.length} reservations across all channels</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter data-icon="inline-start" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBookingSortDesc((v) => !v)}>
              <ArrowUpDown data-icon="inline-start" />
              Sort
            </Button>
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Booking</th>
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Dates</th>
                  <th className="px-6 py-3 font-medium">Channel</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/40">
                    <td className="px-6 py-3 font-medium text-navy">#{booking.id}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback className="bg-navy/10 text-xs font-semibold text-navy">
                            {initials(booking.guest)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{booking.guest}</p>
                          <p className="truncate text-xs text-muted-foreground">{booking.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{booking.property}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {booking.checkIn} &rarr; {booking.checkOut} &middot; {booking.nights}n
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{booking.channel}</td>
                    <td className="px-6 py-3 font-semibold text-foreground">
                      {booking.currency} {booking.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requires attention</CardTitle>
            <CardDescription>{attentionItems.length} open items across operations</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p>
                </div>
                {item.href !== "#" ? (
                  <Button variant="outline" size="sm" render={<Link href={item.href} />}>
                    {item.actionLabel}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    {item.actionLabel}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent guest reviews</CardTitle>
            <CardDescription>
              Average {avgRating} from {recentGuestReviews.length} reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recentGuestReviews.map((review) => (
              <div key={review.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-navy/10 text-xs font-semibold text-navy">
                        {initials(review.guestName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {review.guestName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{review.property}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3",
                          i < review.rating ? "fill-gold text-gold" : "text-border"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{review.timeAgo}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
