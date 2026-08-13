"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import type { MonthlyRevenue } from "@/lib/mock-data";

function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey as string} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}:{" "}
          <span className="font-medium text-foreground">
            AED {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function RevenueBookingsChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={3} barCategoryGap="28%" margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="month"
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={40}
          />
          <Tooltip content={ChartTooltip} cursor={{ fill: "var(--muted)" }} />
          <Legend
            verticalAlign="top"
            align="right"
            height={32}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
          <Bar dataKey="thisYear" name="This year" fill="var(--navy)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="lastYear" name="Last year" fill="var(--border)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
