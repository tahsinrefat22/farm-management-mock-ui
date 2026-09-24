"use client";

import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Note } from "@/components/ui";
import { REPRO_TASKS, ATTENTION, ITEMS, BATCHES } from "@/lib/data";
import { num } from "@/lib/format";
import Link from "next/link";

export default function ManagerHome() {
  const { lang } = useApp();
  const lowStock = ITEMS.filter((i) => i.daysCover !== null && i.daysCover <= i.reorderDays);
  const expiring = BATCHES.filter((b) => b.status.startsWith("Expiring"));

  return (
    <div>
      <PageHeader
        module="Module I · Manager home"
        title="Manager Home"
        subtitle="Seven-day task list, the attention list and stock warnings for the manager's assigned farms only — no consolidated views, no owner-only profit."
        frs="FR-902 · role scope §2.2"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat accent="daily" label="Tasks next 7 days" value={num(REPRO_TASKS.length, lang)} sub="breedings, checks, dry-offs, deliveries, vaccinations" />
        <Stat accent="money" label="Stock warnings" value={num(lowStock.length + expiring.length, lang)} sub={`${lowStock.length} low · ${expiring.length} expiring`} trend="down" />
        <Stat accent="account" label="Animals to check" value={num(ATTENTION.filter((a) => a.animal.startsWith("COW") || a.animal.startsWith("BULL") || a.animal.startsWith("GOAT")).length, lang)} sub="milk / weight flags" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card accent="daily" title="Seven-day tasks (FR-413)" className="lg:col-span-2">
          <div className="space-y-2">
            {REPRO_TASKS.map((tk, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-stone-100 px-3 py-2">
                <Badge tone={tk.date === "Today" ? "green" : "gray"}>{tk.date}</Badge>
                <div className="flex-1">
                  <div className="text-sm font-medium">{tk.task}</div>
                  <div className="text-xs text-stone-500">{tk.animal} · {tk.farm}</div>
                </div>
                <button className="btn-ghost text-xs">Record</button>
              </div>
            ))}
          </div>
        </Card>

        <Card accent="money" title="Stock warnings (FR-217, FR-207)">
          <div className="space-y-2">
            {lowStock.map((i) => (
              <div key={i.id} className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm">
                <div className="font-medium">{i.photo} {i.name}</div>
                <div className="text-xs text-amber-700">Low — {i.daysCover} days of cover (reorder at {i.reorderDays}d)</div>
              </div>
            ))}
            {expiring.map((b, i) => (
              <div key={i} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm">
                <div className="font-medium">{b.item}</div>
                <div className="text-xs text-red-700">Batch {b.batch} — {b.status}</div>
              </div>
            ))}
          </div>
          <Note tone="amber">Reminders escalate to the owner after 48 h (FR-304). An expired batch can&apos;t be issued without a manager override & reason.</Note>
        </Card>
      </div>

      <Card accent="account" title="Attention list (FR-810)" className="mt-4"
        right={<Link href="/profitability" className="text-xs font-medium text-account">Full list →</Link>}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ATTENTION.map((a, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-stone-100 px-3 py-2">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.severity === "high" ? "bg-red-500" : a.severity === "med" ? "bg-amber-500" : "bg-stone-400"}`} />
              <div>
                <div className="text-sm font-medium">{a.animal}</div>
                <div className="text-xs text-stone-500">{a.reason} · {a.farm}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
