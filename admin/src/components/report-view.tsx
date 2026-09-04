"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Loader2, MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatAED } from "@/lib/finance";
import {
  downloadCsv,
  optionsFor,
  rangeOptions,
  reportRegistry,
  toCsv,
  type ColumnFormat,
  type ReportFilters,
} from "@/lib/reports";
import {
  realBookingsToReport,
  reportBookings,
  type ReportBooking,
} from "@/lib/reports-data";
import { useAdminBookings } from "@/lib/bookings";
import { AreaChart } from "@/components/finance-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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

function formatCell(value: string | number | undefined, format: ColumnFormat | undefined) {
  if (value == null || value === "") return "—";
  if (format === "currency") return `AED ${formatAED(Number(value))}`;
  return String(value);
}

export function ReportView({ reportKey }: { reportKey: string }) {
  const def = reportRegistry[reportKey];
  const router = useRouter();

  const [filters, setFilters] = useState<ReportFilters>({
    range: "this-year",
    hotel: "all",
    status: "all",
    channel: "all",
    method: "all",
  });

  // Real bookings from the backend, falling back to the demo dataset when the
  // API is unavailable (e.g. reports opened without a live backend).
  const { bookings: liveBookings, isLoading, error } = useAdminBookings({ limit: 200 });
  const source = useMemo<ReportBooking[]>(() => {
    if (liveBookings && liveBookings.length > 0) {
      return realBookingsToReport(liveBookings);
    }
    if (error) {
      return reportBookings;
    }
    return [];
  }, [liveBookings, error]);

  const opts = useMemo(() => optionsFor(def.key, source), [def.key, source]);

  // Reset any filter whose selected value is no longer present in the live
  // option set so we never silently filter to zero results.
  const filtersRef = useRef(filters);
  useEffect(() => {
    const prev = filtersRef.current;
    let next = { ...prev };
    let changed = false;
    if (prev.hotel !== "all" && !opts.hotels.includes(prev.hotel)) {
      next = { ...next, hotel: "all" };
      changed = true;
    }
    if (prev.channel !== "all" && !opts.channels.includes(prev.channel)) {
      next = { ...next, channel: "all" };
      changed = true;
    }
    if (prev.method !== "all" && !opts.methods.includes(prev.method)) {
      next = { ...next, method: "all" };
      changed = true;
    }
    if (changed) setFilters(next);
    filtersRef.current = next;
  }, [opts]);

  const result = useMemo(() => {
    if (source.length === 0) return null;
    return def.run(filters, source);
  }, [def, filters, source]);

  function set<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleExport() {
    if (result) downloadCsv(`${def.key}-report.csv`, toCsv(def.columns, result.rows));
  }

  if (isLoading && source.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading report data…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{def.title}</h1>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No booking data available yet. Bookings made in the platform will appear here.
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = result;

  return (
    <div className="space-y-6 p-6 lg:p-8 print:space-y-0 print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{def.title}</h1>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={data.rows.length === 0}>
            <Download data-icon="inline-start" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        {data.summary.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b print:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>{data.rows.length} row(s).</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {def.filters.includes("range") && (
                <select
                  aria-label="Date range"
                  className={selectClass}
                  value={filters.range}
                  onChange={(e) => set("range", e.target.value as ReportFilters["range"])}
                >
                  {rangeOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              )}
              {def.filters.includes("hotel") && (
                <select
                  aria-label="Hotel"
                  className={selectClass}
                  value={filters.hotel}
                  onChange={(e) => set("hotel", e.target.value)}
                >
                  <option value="all">All hotels</option>
                  {opts.hotels.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              )}
              {def.filters.includes("status") && (
                <select
                  aria-label="Status"
                  className={selectClass}
                  value={filters.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="all">All statuses</option>
                  {opts.statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              )}
              {def.filters.includes("channel") && (
                <select
                  aria-label="Channel"
                  className={selectClass}
                  value={filters.channel}
                  onChange={(e) => set("channel", e.target.value)}
                >
                  <option value="all">All channels</option>
                  {opts.channels.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
              {def.filters.includes("method") && (
                <select
                  aria-label="Gateway"
                  className={selectClass}
                  value={filters.method}
                  onChange={(e) => set("method", e.target.value)}
                >
                  <option value="all">All gateways</option>
                  {opts.methods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.series && data.series.length > 1 && (
            <div className="border-b border-border p-4">
              <AreaChart data={data.series} />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  {def.columns.map((c) => (
                    <th
                      key={c.key}
                      className={cn("px-4 py-3 font-medium", c.align === "right" && "text-right")}
                    >
                      {c.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.rows.map((row, i) => {
                  const href = row._href;
                  return (
                    <tr
                      key={i}
                      className="hover:bg-muted/40"
                    >
                      {def.columns.map((c) => (
                        <td
                          key={c.key}
                          className={cn(
                            "px-4 py-3",
                            c.align === "right" && "text-right tabular-nums",
                            c.key === "id" || c.key === "booking" ? "font-medium" : undefined
                          )}
                        >
                          {c.format === "status" ? (
                            <Badge
                              className={cn(
                                "rounded-full capitalize",
                                statusBadge[String(row[c.key])] ?? "bg-muted text-muted-foreground"
                              )}
                            >
                              {String(row[c.key]).replace("_", " ")}
                            </Badge>
                          ) : (
                            formatCell(row[c.key], c.format)
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        {href && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button className="inline-flex items-center justify-center size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" />
                              }
                            >
                              <MoreVertical className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(href)}>
                                <Eye className="size-4" />
                                View details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {data.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={def.columns.length + 1}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No data for the selected filters.
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
