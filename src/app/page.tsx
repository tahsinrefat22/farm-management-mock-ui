"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Bar, Note, Spark } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { Donut, BarChart, LineChart, CHART_COLORS } from "@/components/charts";
import { DASH, ATTENTION, FARM_COMPARISON, REPRO_TASKS, MILK_USE, MILK_WEEK, INCOME_MIX, ANIMALS } from "@/lib/data";
import { money, litres, num, pct } from "@/lib/format";
import Link from "next/link";

export default function Dashboard() {
  const { lang, role, scopeLabel } = useApp();
  const [quick, setQuick] = useState(false);

  if (role === "worker" || role === "vet" || role === "buyer") {
    return (
      <div className="mx-auto max-w-lg pt-10 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-3 text-lg font-bold">Owner dashboard is not visible to this role</h1>
        <p className="mt-2 text-sm text-stone-500">
          A worker&apos;s screen never shows money (§2.2). Switch the role to <b>Owner</b> to see cost, profit and stock
          value. Workers see the milking summary; vets see health; buyers see their one animal.
        </p>
        <Link href="/dairy" className="btn-primary mt-4">Go to daily entry →</Link>
      </div>
    );
  }

  // ---- chart data derived from the same dummy data ----
  const herdSeg = (["dairy", "fattening", "breeding", "young stock"] as const).map((p, i) => ({
    label: p,
    value: ANIMALS.filter((a) => a.status === "Active" && a.purpose === p).length,
    color: [CHART_COLORS.daily, CHART_COLORS.money, CHART_COLORS.purple, CHART_COLORS.stone][i],
  }));
  const milkSeg = [
    { label: "Sold", value: MILK_USE.sold, color: CHART_COLORS.money },
    { label: "Fed to calves", value: MILK_USE.calves, color: CHART_COLORS.daily },
    { label: "Used at home", value: MILK_USE.home, color: CHART_COLORS.insight },
    { label: "Spoiled", value: MILK_USE.spoiled, color: CHART_COLORS.red },
  ];
  const incomeSeg = INCOME_MIX.map((x, i) => ({
    label: x.label,
    value: x.value,
    color: [CHART_COLORS.daily, CHART_COLORS.money, CHART_COLORS.purple, CHART_COLORS.stone][i],
  }));
  const farmColors = [CHART_COLORS.daily, CHART_COLORS.money, CHART_COLORS.insight];
  const profitBars = FARM_COMPARISON.map((f, i) => ({ label: f.farm.split(" ")[0], value: f.profit, color: farmColors[i % 3] }));
  const receivableBars = FARM_COMPARISON.map((f) => ({ label: f.farm.split(" ")[0], value: f.receivables, color: CHART_COLORS.account }));
  const stockBars = FARM_COMPARISON.map((f, i) => ({ label: f.farm.split(" ")[0], value: f.stockValue, color: farmColors[i % 3] }));
  const kFmt = (n: number) => (n ? "৳" + num(Math.round(n / 1000), lang) + "k" : "৳0");
  const activeHerd = herdSeg.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <PageHeader
        module="Module I · Reports & dashboard"
        title="Owner Dashboard"
        subtitle={`First screen answers, without scrolling, for ${scopeLabel}: milk today vs last week, cash collected vs billed, animals needing attention, and cost per litre this month.`}
        frs="FR-901 · scope FR-904"
        actions={<><button className="btn-ghost">Export PDF</button><button className="btn-primary" onClick={() => setQuick(true)}>＋ Quick entry</button></>}
      />

      <Modal open={quick} onClose={() => setQuick(false)} title="Quick entry" subtitle="Jump to a daily entry screen"
        footer={<button className="btn-ghost" onClick={() => setQuick(false)}>Close</button>}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/dairy", icon: "🥛", label: "Milk session" },
            { href: "/feeding", icon: "🌾", label: "Feed round" },
            { href: "/health", icon: "💉", label: "Treatment" },
            { href: "/reproduction", icon: "🧬", label: "Breeding" },
            { href: "/inventory", icon: "📦", label: "Purchase" },
            { href: "/animals", icon: "🐄", label: "Register animal" },
          ].map((x) => (
            <Link key={x.href} href={x.href} onClick={() => setQuick(false)}
              className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-3 text-sm font-medium hover:bg-stone-50">
              <span className="text-xl">{x.icon}</span> {x.label}
            </Link>
          ))}
        </div>
      </Modal>

      {/* KPI row (FR-901) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat accent="daily" label="Milk today" value={litres(DASH.milkToday, lang)}
          trend="up" sub={`vs ${litres(DASH.milkLastWeek, lang)} last week (+${num(DASH.milkToday - DASH.milkLastWeek, lang)} L)`} />
        <Stat accent="money" label="Cash collected this month" value={money(DASH.cashCollected, lang)}
          trend="down" sub={`billed ${money(DASH.cashBilled, lang)} · ${pct((DASH.cashCollected / DASH.cashBilled) * 100, lang)} collected`} />
        <Stat accent="insight" label="Cost / litre this month" value={"৳" + num(DASH.cplMonth, lang, 1)}
          trend="up" sub={`vs ৳${num(DASH.cplLastMonth, lang, 1)} last month (dairy herd only)`} />
        <Stat accent="account" label="Animals needing attention" value={num(DASH.attentionCount, lang)}
          sub="milk drops, weight, stock & health" trend="down" />
      </div>

      {/* Charts row A */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card accent="daily" title="Milk produced vs sold — last 7 days" className="lg:col-span-2" fill>
          <LineChart
            labels={MILK_WEEK.map((d) => d.day)}
            series={[
              { label: "Produced", color: CHART_COLORS.daily, points: MILK_WEEK.map((d) => d.produced) },
              { label: "Sold", color: CHART_COLORS.money, points: MILK_WEEK.map((d) => d.sold) },
            ]}
            format={(n) => num(n, lang)}
          />
        </Card>
        <div className="flex flex-col gap-4">
          <Card accent="account" title="Herd composition">
            <Donut data={herdSeg} size={140} thickness={22} centerTop={num(activeHerd, lang)} centerSub="active" format={(n) => num(n, lang)} />
          </Card>
          <Card accent="money" title="Stock value by farm">
            <BarChart data={stockBars} height={120} format={kFmt} />
          </Card>
        </div>
      </div>

      {/* Charts row B */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card accent="insight" title="Profit by farm — this month">
          <BarChart data={profitBars} format={kFmt} />
        </Card>
        <Card accent="money" title="Receivables by farm">
          <BarChart data={receivableBars} format={kFmt} />
        </Card>
        <Card accent="daily" title="Income mix — this month">
          <Donut data={incomeSeg} centerTop={"৳" + num(Math.round(incomeSeg.reduce((s, d) => s + d.value, 0) / 1000), lang) + "k"} centerSub="income" format={(n) => money(n, lang)} />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Farm comparison (FR-905) */}
        <Card accent="insight" title="Farm comparison (FR-905)" className="lg:col-span-2"
          right={<Badge tone="blue">{scopeLabel}</Badge>}>
          <DataTable
            head={["Farm", "Milk (L)", "Cost/L", "Profit (mo)", "Stock value", "Receivables", "Attention"]}
            rows={FARM_COMPARISON}
            searchText={(f) => f.farm}
            searchPlaceholder="Search farm…"
            filters={[{ key: "milk", label: "Type", options: ["Dairy (produces milk)", "Fattening only"], match: (f, v) => v === "Dairy (produces milk)" ? f.milk > 0 : f.milk === 0 }]}
            renderRow={(f) => (
              <tr key={f.farm}>
                <td className="td font-medium">{f.farm}</td>
                <td className="td">{f.milk ? num(f.milk, lang) : "—"}</td>
                <td className="td">{f.cpl ? "৳" + num(f.cpl, lang, 1) : "—"}</td>
                <td className="td font-semibold text-daily">{money(f.profit, lang)}</td>
                <td className="td">{money(f.stockValue, lang)}</td>
                <td className="td">{money(f.receivables, lang)}</td>
                <td className="td"><Badge tone={f.attention > 3 ? "red" : "amber"}>{num(f.attention, lang)}</Badge></td>
              </tr>
            )}
          />
          <Note tone="blue" >Every figure opens down to the transactions behind it (FR-906). Consolidated totals exclude inter-farm transfers (FR-716).</Note>
        </Card>

        {/* Milk reconciliation snapshot */}
        <Card accent="daily" title="Milk today — where it went">
          <div className="space-y-2 text-sm">
            {[
              ["Produced", MILK_USE.produced, "daily"],
              ["Sold", MILK_USE.sold, "money"],
              ["Fed to calves", MILK_USE.calves, "account"],
              ["Used at home", MILK_USE.home, "account"],
              ["Spoiled", MILK_USE.spoiled, "red"],
            ].map(([label, val, tone]) => (
              <div key={label as string}>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600">{label}</span>
                  <span className="font-medium">{litres(val as number, lang)}</span>
                </div>
                <Bar value={val as number} max={MILK_USE.produced} tone={tone as string} />
              </div>
            ))}
          </div>
          <Note tone="amber">Milk that leaves the shed but never becomes revenue is shown as <b>value not realised</b> (R-09), never as income.</Note>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Attention list (FR-810) */}
        <Card accent="account" title="Needs attention today (FR-810)"
          right={<Link href="/profitability" className="text-xs font-medium text-account">View all →</Link>}>
          <div className="space-y-2">
            {ATTENTION.slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-stone-100 px-3 py-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.severity === "high" ? "bg-red-500" : a.severity === "med" ? "bg-amber-500" : "bg-stone-400"}`} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-stone-800">{a.animal}</div>
                  <div className="text-xs text-stone-500">{a.reason} · {a.farm}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Task list (FR-413) */}
        <Card accent="daily" title="Tasks — today & next 7 days (FR-413)"
          right={<Link href="/reproduction" className="text-xs font-medium text-account">Calendar →</Link>}>
          <div className="space-y-2">
            {REPRO_TASKS.map((tk, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-stone-100 px-3 py-2">
                <Badge tone={tk.date === "Today" ? "green" : "gray"}>{tk.date}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-stone-800">{tk.task}</div>
                  <div className="text-xs text-stone-500">{tk.animal} · {tk.farm}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
