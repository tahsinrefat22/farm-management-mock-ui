"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Small reusable UI primitives shared across every module screen.
// ---------------------------------------------------------------------------

export function PageHeader({
  title,
  subtitle,
  module,
  frs,
  actions,
}: {
  title: string;
  subtitle?: string;
  module?: string;
  frs?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {module && <span className="chip bg-stone-100 text-stone-600">{module}</span>}
          <h1 className="text-xl font-bold tracking-tight text-stone-900">{title}</h1>
        </div>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-stone-500">{subtitle}</p>}
        {frs && <p className="mt-1 font-mono text-[11px] text-stone-400">{frs}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
  right,
  accent,
  fill,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
  accent?: "account" | "daily" | "money" | "insight";
  fill?: boolean;
}) {
  const bar =
    accent === "account" ? "border-t-account" :
    accent === "daily" ? "border-t-daily" :
    accent === "money" ? "border-t-money" :
    accent === "insight" ? "border-t-insight" : "";
  return (
    <div className={`card ${accent ? "border-t-4 " + bar : ""} ${fill ? "flex h-full flex-col" : ""} ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
          {right}
        </div>
      )}
      <div className={`p-4 ${fill ? "min-h-0 flex-1" : ""}`}>{children}</div>
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  trend,
  accent = "account",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  trend?: "up" | "down" | "flat";
  accent?: "account" | "daily" | "money" | "insight" | "red";
}) {
  const dot =
    accent === "money" ? "bg-money" : accent === "insight" ? "bg-insight" : accent === "daily" ? "bg-daily" : accent === "red" ? "bg-red-500" : "bg-account";
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-2 stat-num">{value}</div>
      {sub && (
        <div className={`mt-1 text-xs ${trend === "up" ? "text-daily" : trend === "down" ? "text-red-600" : "text-stone-500"}`}>
          {trend === "up" ? "▲ " : trend === "down" ? "▼ " : ""}
          {sub}
        </div>
      )}
    </div>
  );
}

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: string }) {
  const map: Record<string, string> = {
    gray: "bg-stone-100 text-stone-600",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={`chip ${map[tone] || map.gray}`}>{children}</span>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-full border-collapse">
        <thead>
          <tr className="border-b border-stone-200">
            {head.map((h, i) => (
              <th key={i} className="th whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1 border-b border-stone-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
            active === tab
              ? "border-account text-account"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function Bar({ value, max, tone = "account" }: { value: number; max: number; tone?: string }) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  const col = tone === "money" ? "bg-money" : tone === "insight" ? "bg-insight" : tone === "red" ? "bg-red-500" : "bg-daily";
  return (
    <div className="h-2 w-full rounded-full bg-stone-100">
      <div className={`h-2 rounded-full ${col}`} style={{ width: pct + "%" }} />
    </div>
  );
}

export function Note({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "amber" | "green" }) {
  const map = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-green-200 bg-green-50 text-green-800",
  };
  return <div className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${map[tone]}`}>{children}</div>;
}

// Simple SVG sparkline / line chart for trends
export function Spark({ points, color = "#16a34a", height = 40 }: { points: number[]; color?: string; height?: number }) {
  if (points.length === 0) return null;
  const w = 120;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1 || 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - ((p - min) / range) * (height - 6) - 3}`)
    .join(" ");
  return (
    <svg width={w} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
