"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Tabs, Note } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { STANDARD_REPORTS, FARM_COMPARISON } from "@/lib/data";
import { num, money } from "@/lib/format";

export default function ReportsPage() {
  const { lang } = useApp();
  const [tab, setTab] = useState("Standard reports");

  return (
    <div>
      <PageHeader
        module="Module I · Reports"
        title="Reports"
        subtitle="Every report accepts the same farm scope as the ledger — one farm, selected farms or all farms. Every figure opens down to the transactions behind it."
        frs="FR-903 – FR-908"
        actions={<><button className="btn-ghost">⬇ PDF</button><button className="btn-ghost">⬇ Excel</button><button className="btn-primary">⬇ Export data (CSV/JSON)</button></>}
      />

      <div className="mt-1">
        <Tabs tabs={["Standard reports", "Farm comparison", "Export"]} active={tab} onChange={setTab} />

        {tab === "Standard reports" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STANDARD_REPORTS.map((r) => (
              <Card key={r.name}>
                <div className="flex items-start justify-between">
                  <div className="text-3xl">📑</div>
                  <Badge tone={r.module === "Ledger" ? "amber" : r.module === "Dairy" ? "green" : "blue"}>{r.module}</Badge>
                </div>
                <div className="mt-2 font-semibold text-stone-800">{r.name}</div>
                <div className="text-xs text-stone-500">{r.scope}</div>
                <div className="mt-3 flex gap-2">
                  <button className="btn-ghost flex-1 text-xs">Open</button>
                  <button className="btn-ghost text-xs">⬇</button>
                </div>
              </Card>
            ))}
            <Card className="bg-blue-50/40">
              <div className="text-3xl">🔎</div>
              <div className="mt-2 font-semibold">Every figure drills down (FR-906)</div>
              <p className="text-xs text-stone-500">No requirement is met by a report you must export to a spreadsheet to use (constraint §2.5). Reports export in Bangla or English (FR-907).</p>
            </Card>
          </div>
        )}

        {tab === "Farm comparison" && (
          <Card title="Farm comparison — key figures side by side (FR-905)">
            <DataTable
              head={["Farm", "Milk produced", "Cost / litre", "Profit / loss", "Stock value", "Receivables", "Attention"]}
              rows={FARM_COMPARISON}
              searchText={(f) => f.farm}
              renderRow={(f) => (
                <tr key={f.farm}>
                  <td className="td font-medium">{f.farm}</td>
                  <td className="td">{f.milk ? num(f.milk, lang) + " L" : "—"}</td>
                  <td className="td">{f.cpl ? "৳" + num(f.cpl, lang, 1) : "—"}</td>
                  <td className="td font-semibold text-daily">{money(f.profit, lang)}</td>
                  <td className="td">{money(f.stockValue, lang)}</td>
                  <td className="td">{money(f.receivables, lang)}</td>
                  <td className="td"><Badge tone={f.attention > 3 ? "red" : "amber"}>{num(f.attention, lang)}</Badge></td>
                </tr>
              )}
            />
          </Card>
        )}

        {tab === "Export" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card accent="insight" title="Complete data export (FR-908)">
              <p className="text-sm text-stone-500">Export the complete data of one farm or the whole account at any time, without contacting support (AC-11).</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-ghost">⬇ One farm — CSV</button>
                <button className="btn-ghost">⬇ One farm — JSON</button>
                <button className="btn-primary">⬇ Whole account — CSV + JSON</button>
              </div>
            </Card>
            <Card title="Report export (FR-907)">
              <p className="text-sm text-stone-500">Any report to PDF or spreadsheet, in Bangla or English.</p>
              <Note>All reports, SMS, item names and exports are available in both languages (NFR-08). Bangla & English numerals both accepted and selectable (NFR-09).</Note>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
