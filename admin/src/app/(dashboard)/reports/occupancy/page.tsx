"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  DoorOpen,
  KeyRound,
  TimerReset,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  occupancyKpis,
  occupancyLeadTime,
  occupancyMonthly,
  occupancyProperties,
} from "@/lib/occupancy";
import { PermissionGuard } from "@/components/permission-guard";
import { AreaChart } from "@/components/finance-charts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

function OccupancyPage() {
  const kpis = [
    {
      label: "Occupancy rate",
      value: `${occupancyKpis.rate}%`,
      delta: occupancyKpis.rateDelta,
      hint: "vs last month",
      icon: DoorOpen,
    },
    {
      label: "Booked nights",
      value: String(occupancyKpis.bookedNights),
      delta: occupancyKpis.bookedDelta,
      hint: `of ${occupancyKpis.availableNights} available`,
      icon: BedDouble,
    },
    {
      label: "Avg length of stay",
      value: `${occupancyKpis.avgStay} nights`,
      delta: occupancyKpis.avgStayDelta,
      hint: "per booking",
      icon: CalendarDays,
    },
    {
      label: "Cancellation rate",
      value: `${occupancyKpis.cancellationRate}%`,
      delta: -0.6,
      hint: `${occupancyKpis.cancellations} cancellations`,
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Occupancy Reports</h1>
          <p className="text-sm text-muted-foreground">
            Utilization and booking behavior across your portfolio.
          </p>
        </div>
        <Badge variant="outline" className="h-8 gap-1.5 px-2.5">
          <TimerReset data-icon="inline-start" className="size-3.5 text-gold" />
          August 2026
        </Badge>
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
                <CardTitle>Occupancy trend</CardTitle>
                <CardDescription>Monthly utilization, January – August</CardDescription>
              </div>
              <Badge className="bg-navy text-white">Target 82%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={occupancyMonthly.map((m) => ({
                label: m.label,
                value: m.occupancy,
              }))}
              color="#1b6e4b"
            />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Best month</p>
                <p className="text-sm font-semibold">July · 88%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Year average</p>
                <p className="text-sm font-semibold">75.3%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weekday vs weekend</p>
                <p className="text-sm font-semibold">72% / 91%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Booking lead time</CardTitle>
            <CardDescription>Days between booking and check-in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {occupancyLeadTime.map((l) => (
              <div key={l.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{l.label}</span>
                  <span className="text-sm font-medium tabular-nums">
                    {l.share}% · {l.bookings}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${l.share * 2.4}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <KeyRound className="size-3.5" />
              Half of bookings arrive within 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Occupancy by property</CardTitle>
          <CardDescription>
            Booked vs available nights · current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
            {occupancyProperties.map((p) => (
              <div key={p.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.location} · {p.bookedNights}/{p.availableNights} nights ·
                      avg stay {p.avgStay}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      className={cn(
                        "rounded-full",
                        p.occupancy >= 85
                          ? "bg-rating/10 text-rating"
                          : p.occupancy >= 75
                            ? "bg-gold/15 text-gold"
                            : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {p.occupancy}%
                    </Badge>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.occupancy}%`,
                      backgroundColor: p.occupancy >= 75 ? "#1b6e4b" : "#c9973c",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OccupancyReportsPage() {
  return (
    <PermissionGuard module="reports">
      <OccupancyPage />
    </PermissionGuard>
  );
}
