"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";

import type { BookingChannelShare } from "@/lib/mock-data";

// Dataviz skill's validated default categorical 5-slot order (blue/orange/
// aqua/yellow/magenta) — this app has no categorical ramp of its own, and
// this order passes the CVD/contrast validator against the app's white card
// surface (see plan verification). Exported so the legend list built in the
// dashboard page can reuse the exact same slot-to-color mapping.
export const CHANNEL_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
      <p className="flex items-center gap-1.5 text-foreground">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: entry.payload?.fill }}
        />
        <span className="font-medium">{entry.name}</span>: {entry.value}%
      </p>
    </div>
  );
}

export function BookingChannelsChart({
  data,
  total,
}: {
  data: BookingChannelShare[];
  total: number;
}) {
  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={ChartTooltip} />
          <Pie
            data={data}
            dataKey="percent"
            nameKey="label"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.id} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-semibold text-navy">{total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">bookings</p>
      </div>
    </div>
  );
}
