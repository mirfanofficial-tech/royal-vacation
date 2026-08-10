import {
  Building2,
  CalendarCheck,
  CircleCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import {
  mockBookings,
  mockGuests,
  mockProperties,
} from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const totalRevenue = mockProperties.reduce(
    (sum, property) => sum + property.revenue,
    0
  );
  const activeBookings = mockBookings.filter(
    (booking) => booking.status === "confirmed" || booking.status === "pending"
  ).length;
  const occupancyRate = Math.round(
    (mockProperties.filter((p) => p.status === "active").length /
      mockProperties.length) *
      100
  );

  const stats = [
    { label: "Properties", value: mockProperties.length, icon: Building2 },
    { label: "Active bookings", value: activeBookings, icon: CalendarCheck },
    { label: "Total guests", value: mockGuests.length, icon: Users },
    { label: "Revenue (AED)", value: totalRevenue.toLocaleString(), icon: Wallet },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your vacation rental business.
          </p>
        </div>

        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <CircleCheck className="size-5 text-rating" />
            <div>
              <p className="text-xs font-medium">Demo data</p>
              <p className="text-xs text-muted-foreground">
                Mock data &middot; occupancy {occupancyRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>
              Latest reservations across all properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {mockBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {booking.guest} · {booking.property}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.checkIn} &rarr; {booking.checkOut} ·{" "}
                      {booking.nights} nights
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="secondary">{booking.status}</Badge>
                    <p className="text-sm font-semibold">
                      {booking.currency} {booking.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top properties</CardTitle>
            <CardDescription>Ranked by revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {[...mockProperties]
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {property.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {property.type} · {property.location}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="size-3" />
                        {property.rating}
                      </span>
                      <p className="text-sm font-semibold">
                        {property.currency}{" "}
                        {property.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
