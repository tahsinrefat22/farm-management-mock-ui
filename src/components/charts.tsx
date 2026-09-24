"use client";

import React from "react";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as RBarChart,
  Bar,
  LabelList,
} from "recharts";

// ---------------------------------------------------------------------------
// Dashboard charts built on Recharts (interactive tooltips + legends).
// Colours follow the SRS module palette.
// ---------------------------------------------------------------------------

export const CHART_COLORS = {
  daily: "#16a34a",
  money: "#d97706",
  insight: "#2563eb",
  account: "#14532d",
  red: "#ef4444",
  purple: "#7c3aed",
  teal: "#0d9488",
  stone: "#a8a29e",
};

export type Segment = { label: string; value: number; color: string };
export type LineSeries = { label: string; color: string; points: number[] };

// Shared, prettified tooltip ------------------------------------------------
function ChartTooltip({
  active,
  payload,
  label,
  format = (n: number) => String(n),
}: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label !== undefined && label !== "" && (
        <div className="mb-1 font-semibold text-stone-700">{label}</div>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color || p.payload?.color || p.fill }} />
          <span className="text-stone-500">{p.name}</span>
          <span className="ml-auto pl-3 font-semibold text-stone-900">{format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Line chart ----------------------------------------------------------------
export function LineChart({
  labels,
  series,
  format = (n: number) => String(n),
}: {
  labels: string[];
  series: LineSeries[];
  format?: (n: number) => string;
  height?: number;
  yZero?: boolean;
}) {
  const data = labels.map((l, i) => {
    const row: Record<string, number | string> = { name: l };
    series.forEach((s) => { row[s.label] = s.points[i]; });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <RLineChart data={data} margin={{ top: 10, right: 14, left: -6, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#e7e5e4" }} tick={{ fontSize: 11, fill: "#a8a29e" }} dy={4} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#a8a29e" }} width={42} tickFormatter={format} domain={["dataMin - 15", "dataMax + 10"]} />
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: "#d6d3d1", strokeDasharray: "4 4" }} />
        <Legend verticalAlign="bottom" height={30} iconType="plainline" wrapperStyle={{ fontSize: 12, color: "#57534e" }} />
        {series.map((s) => (
          <Line
            key={s.label}
            type="monotone"
            dataKey={s.label}
            stroke={s.color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#fff", stroke: s.color, strokeWidth: 2 }}
            activeDot={{ r: 5, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        ))}
      </RLineChart>
    </ResponsiveContainer>
  );
}

// Donut / pie ---------------------------------------------------------------
export function Donut({
  data,
  size = 168,
  thickness = 26,
  centerTop,
  centerSub,
  format = (n: number) => String(n),
}: {
  data: Segment[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerSub?: string;
  format?: (n: number) => string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <PieChart width={size} height={size} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx={size / 2}
            cy={size / 2}
            innerRadius={size / 2 - thickness - 3}
            outerRadius={size / 2 - 3}
            paddingAngle={1.5}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip format={format} />} />
        </PieChart>
        {centerTop && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-stone-900">{centerTop}</div>
            {centerSub && <div className="text-[10px] text-stone-400">{centerSub}</div>}
          </div>
        )}
      </div>
      <div className="min-w-[130px] flex-1 space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="truncate text-stone-600">{d.label}</span>
            <span className="ml-auto font-medium text-stone-800">{format(d.value)}</span>
            <span className="w-9 text-right text-stone-400">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar chart -----------------------------------------------------------------
export function BarChart({
  data,
  height = 150,
  format = (n: number) => String(n),
}: {
  data: Segment[];
  height?: number;
  format?: (n: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height + 28}>
      <RBarChart data={data} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#e7e5e4" }} tick={{ fontSize: 11, fill: "#78716c" }} dy={4} />
        <YAxis hide />
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ fill: "#f5f5f4" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
          <LabelList dataKey="value" position="top" formatter={(v: any) => format(Number(v))} style={{ fontSize: 10, fontWeight: 600, fill: "#44403c" }} />
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  );
}
