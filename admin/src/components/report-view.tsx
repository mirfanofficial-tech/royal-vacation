"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatAED } from "@/lib/finance";
import {
  downloadCsv,
  rangeOptions,
  reportRegistry,
  toCsv,
  type ColumnFormat,
  type ReportFilters,
} from "@/lib/reports";
import {
  reportChannels,
  reportHotels,
  reportPaymentMethods,
} from "@/lib/reports-data";
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

const STATUS_OPTIONS: Record<string, string[]> = {
  bookings: ["confirmed", "completed", "cancelled", "no_show"],
  payments: ["paid", "pending", "failed"],
  refunds: ["processed", "pending", "failed"],
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

  const result = useMemo(() => def.run(filters), [def, filters]);

  function set<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleExport() {
    downloadCsv(`${def.key}-report.csv`, toCsv(def.columns, result.rows));
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{def.title}</h1>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={result.rows.length === 0}>
          <Download data-icon="inline-start" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {result.summary.map((s) => (
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
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>{result.rows.length} row(s).</CardDescription>
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
                  {reportHotels.map((h) => (
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
                  {(STATUS_OPTIONS[def.key] ?? []).map((s) => (
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
                  {reportChannels.map((c) => (
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
                  {reportPaymentMethods.map((m) => (
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
          {result.series && result.series.length > 1 && (
            <div className="border-b border-border p-4">
              <AreaChart data={result.series} />
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.rows.map((row, i) => {
                  const href = row._href;
                  return (
                  <tr
                    key={i}
                    onClick={href ? () => router.push(href) : undefined}
                    className={cn("hover:bg-muted/40", href && "cursor-pointer")}
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
                  </tr>
                  );
                })}
                {result.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={def.columns.length}
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
