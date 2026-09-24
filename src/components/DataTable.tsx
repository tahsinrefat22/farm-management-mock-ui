"use client";

import React, { useMemo, useState } from "react";
import { Table } from "@/components/ui";

// ---------------------------------------------------------------------------
// A table with a built-in filter toolbar: free-text search + dropdown filters.
// Each page keeps its own bespoke row rendering via the `renderRow` prop.
// ---------------------------------------------------------------------------

export type FilterDef<T> = {
  key: string;
  label: string;
  options: string[];
  match: (row: T, value: string) => boolean;
};

export function DataTable<T>({
  head,
  rows,
  renderRow,
  searchText,
  searchPlaceholder = "Search…",
  filters = [],
  minWidth,
}: {
  head: string[];
  rows: T[];
  renderRow: (row: T, i: number) => React.ReactNode;
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  filters?: FilterDef<T>[];
  minWidth?: number;
}) {
  const [q, setQ] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (q && searchText && !searchText(r).toLowerCase().includes(q.toLowerCase())) return false;
        for (const f of filters) {
          const v = vals[f.key] ?? "All";
          if (v !== "All" && !f.match(r, v)) return false;
        }
        return true;
      }),
    [rows, q, vals, filters, searchText]
  );

  const active = q.length > 0 || Object.values(vals).some((v) => v && v !== "All");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {searchText && (
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-52 rounded-lg border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-account focus:outline-none focus:ring-1 focus:ring-account sm:w-64"
            />
          </div>
        )}
        {filters.map((f) => (
          <select
            key={f.key}
            value={vals[f.key] ?? "All"}
            onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
            className={`rounded-lg border px-2 py-1.5 text-sm focus:border-account focus:outline-none focus:ring-1 focus:ring-account ${
              (vals[f.key] ?? "All") !== "All" ? "border-account bg-account-light text-account" : "border-stone-300 bg-white text-stone-700"
            }`}
          >
            <option value="All">{f.label}: All</option>
            {f.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-stone-400">
          {active && (
            <button
              onClick={() => { setQ(""); setVals({}); }}
              className="rounded-md border border-stone-300 px-2 py-1 font-medium text-stone-600 hover:bg-stone-50"
            >
              Clear
            </button>
          )}
          <span>{filtered.length} of {rows.length}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-200 py-10 text-center text-sm text-stone-400">
          No rows match the current filters.
        </div>
      ) : (
        <Table head={head}>{filtered.map((r, i) => renderRow(r, i))}</Table>
      )}
    </div>
  );
}
