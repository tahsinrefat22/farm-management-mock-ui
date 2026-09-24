"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Table, Tabs, Note, Spark } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { COST_PER_ANIMAL, COST_PER_LITRE, ATTENTION } from "@/lib/data";
import { num, money } from "@/lib/format";

export default function ProfitabilityPage() {
  const { lang, role } = useApp();
  const [tab, setTab] = useState("Attention list");

  if (role === "worker") {
    return <div className="mx-auto max-w-lg pt-10 text-center"><div className="text-5xl">🔒</div><h1 className="mt-3 text-lg font-bold">Not visible to workers</h1><p className="mt-2 text-sm text-stone-500">No cost or profit figure is shown to a worker (§2.2).</p></div>;
  }

  return (
    <div>
      <PageHeader
        module="Module H · Profitability & performance"
        title="Profitability & Performance"
        subtitle="Cost per animal, cost per litre and performance alerts. Per-animal figures always add up to per-farm figures, which add up to the account total."
        frs="FR-801 – FR-812 · R-03 to R-10, R-15"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="insight" label="Cost / litre (all dairy, mo)" value={"৳" + num(37.1, lang, 1)} sub="dairy-purpose only (D-06)" trend="up" />
        <Stat accent="money" label="Avg cost / animal" value={money(113625, lang)} sub="to date, all pools" />
        <Stat accent="red" label="Needs attention" value={num(ATTENTION.length, lang)} sub="ranked, all farms" trend="down" />
        <Stat accent="daily" label="Best cost / litre" value={"৳" + num(33.9, lang, 1)} sub="COW-101 · Lalima" />
      </div>

      <div className="mt-5">
        <Tabs tabs={["Attention list", "Cost per animal", "Cost per litre", "Dairy profit", "Trends"]} active={tab} onChange={setTab} />

        {tab === "Attention list" && (
          <Card title="Ranked 'needs attention' — animals + stock warnings together (FR-809, FR-810)">
            <div className="space-y-2">
              {ATTENTION.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-stone-100 px-3 py-2.5">
                  <span className="text-lg font-bold text-stone-300">{i + 1}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${a.severity === "high" ? "bg-red-500" : a.severity === "med" ? "bg-amber-500" : "bg-stone-400"}`} />
                  <div className="flex-1"><div className="text-sm font-medium">{a.animal}</div><div className="text-xs text-stone-500">{a.reason}</div></div>
                  <Badge tone={a.severity === "high" ? "red" : a.severity === "med" ? "amber" : "gray"}>{a.farm}</Badge>
                </div>
              ))}
            </div>
            <Note tone="amber">Flags: milk &gt;15% below own 7-day average (R-15); weight gain below expected; weight loss between weighings; feed cost/litre in worst 10%; missing/stale weights; overdue health tasks. Stock warnings (low stock, expiring batches, awaiting reconciliation) appear alongside.</Note>
          </Card>
        )}

        {tab === "Cost per animal" && (
          <Card title="Total cost per animal to date (FR-801 · R-04)">
            <DataTable
              head={["Animal", "Purpose", "Purchase", "Feed", "Health & straws", "Shared cost", "Total", "Note"]}
              rows={COST_PER_ANIMAL}
              searchText={(c) => `${c.tag} ${c.purpose}`}
              filters={[
                { key: "purpose", label: "Purpose", options: ["dairy", "fattening", "breeding", "young stock"], match: (c, v) => c.purpose === v },
              ]}
              renderRow={(c) => (
                <tr key={c.tag}>
                  <td className="td font-medium">{c.tag}</td>
                  <td className="td"><Badge tone={c.purpose === "dairy" ? "green" : c.purpose === "fattening" ? "amber" : "gray"}>{c.purpose}</Badge></td>
                  <td className="td">{money(c.purchase, lang)}</td>
                  <td className="td">{money(c.feed, lang)}</td>
                  <td className="td">{money(c.health, lang)}</td>
                  <td className="td">{money(c.shared, lang)}</td>
                  <td className="td font-semibold">{money(c.total, lang)}</td>
                  <td className="td text-xs text-stone-400">{c.note}</td>
                </tr>
              )}
            />
            <Note>A farm&apos;s shared costs are split across its animals by cost units × days active (FR-803 · R-03). Cost units come from weight by default, so a Black Bengal goat carries a small share; animals bought/sold mid-period carry only their days. Also available: cost per animal for any period excluding purchase price (FR-802).</Note>
          </Card>
        )}

        {tab === "Cost per litre" && (
          <Card title="Cost per litre — per animal, per herd, across farms (FR-804 · R-05, R-07)">
            <DataTable
              head={["Scope", "Cost", "Litres", "Cost / litre"]}
              rows={COST_PER_LITRE}
              searchText={(c) => `${c.scope}`}
              renderRow={(c, i) => (
                <tr key={i} className={c.scope.startsWith("All") ? "bg-stone-50 font-medium" : ""}>
                  <td className="td">{c.scope}</td>
                  <td className="td">{money(c.cost, lang)}</td>
                  <td className="td">{num(c.litres, lang)}</td>
                  <td className="td font-semibold text-insight">৳{num(c.cpl, lang, 1)}</td>
                </tr>
              )}
            />
            <Note tone="blue">Dairy herd = dairy-purpose animals (milking & dry). Fattening animals never count; young stock excluded by default and reported separately as replacement cost, with a farm setting to include them (FR-807, D-06). Cost from a dry period is carried forward to the next lactation (R-06, D-05).</Note>
          </Card>
        )}

        {tab === "Dairy profit" && (
          <Card title="Profit / loss per dairy animal (FR-806 · R-10)">
            <Table head={["Animal", "Month", "Milk income (R-08)", "Cost", "Profit / status"]}>
              <tr><td className="td font-medium">COW-101</td><td className="td">Sep 2026</td><td className="td text-daily">{money(15120, lang)}</td><td className="td">{money(9800, lang)}</td><td className="td font-semibold text-daily">+{money(5320, lang)}</td></tr>
              <tr><td className="td font-medium">COW-103</td><td className="td">Sep 2026</td><td className="td text-daily">{money(11800, lang)}</td><td className="td">{money(10200, lang)}</td><td className="td font-semibold text-daily">+{money(1600, lang)}</td></tr>
              <tr className="bg-amber-50"><td className="td font-medium">COW-102</td><td className="td">Sep 2026 (dry)</td><td className="td text-stone-400">—</td><td className="td">{money(4200, lang)}</td><td className="td"><Badge tone="amber">Carried to next lactation</Badge></td></tr>
            </Table>
            <Note>A dry month shows its cost as &quot;carried to next lactation&quot;, not as a loss. If an animal leaves before delivering, the carried cost stays in her lifetime cost and the farm&apos;s dairy cost, so it is never lost (FR-805).</Note>
          </Card>
        )}

        {tab === "Trends" && (
          <Card title="Trends per animal — milk, weight, cost over time (FR-812)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { t: "Milk (L/day) — COW-101", pts: [7.2, 7.8, 8.1, 8.4, 8.0, 8.2, 8.1], c: "#16a34a" },
                { t: "Weight (kg) — BULL-207", pts: [300, 340, 372, 405, 428], c: "#d97706" },
                { t: "Cost/litre (৳) — Shapla herd", pts: [41, 40, 39, 38.4, 37.5, 37.1], c: "#2563eb" },
              ].map((s) => (
                <div key={s.t} className="rounded-xl border border-stone-200 p-3">
                  <div className="text-xs font-medium text-stone-500">{s.t}</div>
                  <div className="mt-2"><Spark points={s.pts} color={s.c} height={56} /></div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
