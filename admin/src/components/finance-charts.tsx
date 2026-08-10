"use client";

import { useId, useRef, useState } from "react";

import { formatAED } from "@/lib/finance";

export interface SeriesPoint {
  label: string;
  value: number;
}

function formatAxisValue(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k`;
  return String(value);
}

export function AreaChart({
  data,
  height = 230,
  color = "#14284b",
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rawId = useId();
  const gradId = `grad-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const W = 600;
  const H = height;
  const padX = 6;
  const padTop = 18;
  const padBottom = 24;

  const max = Math.max(...data.map((d) => d.value), 1) * 1.12;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const pts = data.map((d, i) => ({
    x: padX + step * i,
    y: padTop + innerH - (d.value / max) * innerH,
    label: d.label,
    value: d.value,
  }));

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${
    H - padBottom
  } L${pts[0].x.toFixed(1)},${H - padBottom} Z`;

  const gridLines = [0, 1, 2, 3, 4].map((i) => ({
    y: padTop + (innerH / 4) * i,
    value: Math.round(max - (max / 4) * i),
  }));

  const labelIndexes = Array.from(
    new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])
  );

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((x - padX) / step);
    setHover(Math.min(Math.max(idx, 0), data.length - 1));
  }

  const hovered = hover !== null ? pts[hover] : null;

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padX}
              x2={W - padX}
              y1={g.y}
              y2={g.y}
              stroke="#dbe1ea"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={W - padX}
              y={g.y - 5}
              textAnchor="end"
              fontSize="9.5"
              fill="#64748b"
            >
              {formatAxisValue(g.value)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {labelIndexes.map((i) => (
          <text
            key={i}
            x={pts[i].x}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
            fontSize="9.5"
            fill="#64748b"
          >
            {data[i].label}
          </text>
        ))}

        {hovered && (
          <g pointerEvents="none">
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={padTop - 6}
              y2={H - padBottom}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r="4.5"
              fill={color}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <g
              transform={`translate(${Math.min(Math.max(hovered.x, 64), W - 64)}, ${Math.max(
                padTop + 6,
                hovered.y - 36
              )})`}
            >
              <rect x="-58" y="-22" width="116" height="30" rx="6" fill="#0d1c37" />
              <text x="0" y="-9" textAnchor="middle" fill="#e6c878" fontSize="8.5">
                {hovered.label}
              </text>
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="600"
              >
                AED {formatAED(hovered.value)}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export function DonutChart({
  segments,
  size = 176,
  stroke = 22,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; color: string; value: number }[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <g transform={`rotate(-90 ${cx} ${cx})`}>
        {segments.map((seg) => {
          const frac = seg.value / total;
          const len = frac * circumference;
          const offset = -acc;
          acc += len;
          return (
            <circle
              key={seg.label}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={offset}
            >
              <title>{`${seg.label} · ${Math.round(frac * 100)}%`}</title>
            </circle>
          );
        })}
      </g>
      <text
        x={cx}
        y={cx - 3}
        textAnchor="middle"
        fontSize="17"
        fontWeight="600"
        fill="#14284b"
      >
        {centerValue}
      </text>
      <text
        x={cx}
        y={cx + 13}
        textAnchor="middle"
        fontSize="9.5"
        fill="#64748b"
      >
        {centerLabel}
      </text>
    </svg>
  );
}
