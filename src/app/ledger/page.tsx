"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Table, Tabs, Note } from "@/components/ui";
import { FormModal, Modal } from "@/components/Modal";
import { DataTable } from "@/components/DataTable";
import { LEDGER, LEDGER_CATEGORIES, CONSOLIDATED_PL, PAYABLES, MONEY_ACCOUNTS, MONTH_CLOSE, FARMS } from "@/lib/data";
import { num, money } from "@/lib/format";

const FILTER_DIMS = ["Farm", "Account-level", "Date range", "Fiscal year/quarter/month", "Cost/cash view", "Entry type", "Category", "Inventory item", "Item type", "Batch", "Stock movement type", "Species", "Animal purpose", "Individual animal", "Shed/group", "Customer", "Supplier", "Payment method", "Money account", "Entered by", "Source module", "Backdated/reversed", "Amount range"];

export default function LedgerPage() {
  const { lang, role } = useApp();
  const [view, setView] = useState<"cost" | "cash">("cost");
  const [tab, setTab] = useState("Entries");
  const [modal, setModal] = useState(false);
  const [closeMonth, setCloseMonth] = useState<null | { farm: string; month: string }>(null);

  if (role === "worker" || role === "vet") {
    return (
      <div className="mx-auto max-w-lg pt-10 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-3 text-lg font-bold">The ledger is not visible to this role</h1>
        <p className="mt-2 text-sm text-stone-500">A worker&apos;s screen never shows any price, stock value, balance or profit figure (§2.2, AC-10). Switch to Owner or Manager.</p>
      </div>
    );
  }

  const totalIncome = LEDGER.filter((l) => l.type === "Income").reduce((s, l) => s + l.amount, 0);
  const totalCost = LEDGER.filter((l) => l.type === "Cost").reduce((s, l) => s + l.amount, 0);

  return (
    <div>
      <PageHeader
        module="Module G · Ledger"
        title="Ledger"
        subtitle="Every money event in one place. Double-entry underneath, but users never see debit or credit. Cost view drives profit; cash view drives the cash position."
        frs="FR-701 – FR-721 · D-10, D-13"
        actions={
          <>
            <div className="flex items-center rounded-lg border border-stone-300 p-0.5 text-sm">
              <button onClick={() => setView("cost")} className={`rounded-md px-3 py-1 font-medium ${view === "cost" ? "bg-money text-white" : "text-stone-600"}`}>Cost view</button>
              <button onClick={() => setView("cash")} className={`rounded-md px-3 py-1 font-medium ${view === "cash" ? "bg-money text-white" : "text-stone-600"}`}>Cash view</button>
            </div>
            <button className="btn-primary" onClick={() => setModal(true)}>＋ New entry</button>
          </>
        }
      />

      <FormModal
        open={modal} onClose={() => setModal(false)} wide
        title="New ledger entry" subtitle="Module G · FR-703 · manual expense / income / payment"
        saveLabel="Post entry"
        note="Most entries post automatically from other modules (FR-704). This is for manual items like utilities, rent, labour or a direct payment. Entries are append-only; a correction is a new reversing entry (FR-711)."
        fields={[
          { label: "Farm (or account level)", type: "select", options: ["Shapla Dairy", "Green Feedlot", "Rupsha Mixed Farm", "Account level"] },
          { label: "Date", type: "date" },
          { label: "Entry type", type: "select", options: ["Cost", "Income", "Payment"] },
          { label: "Category", type: "select", options: [...LEDGER_CATEGORIES.cost, ...LEDGER_CATEGORIES.income] },
          { label: "Amount (৳)", type: "number", placeholder: "e.g. 2400" },
          { label: "Payment method", type: "select", options: ["Cash", "bKash", "Nagad", "Bank", "—"] },
          { label: "Money account", type: "select", options: MONEY_ACCOUNTS.map((m) => m.name) },
          { label: "Customer / supplier", placeholder: "optional" },
          { label: "Animal / group", placeholder: "optional — otherwise shared (R-03)" },
          { label: "Shared cost?", type: "select", options: ["No", "Yes — split to animals by R-03"] },
          { label: "Note", type: "textarea", placeholder: "optional", col: 2 },
        ]}
      />

      <Modal
        open={!!closeMonth} onClose={() => setCloseMonth(null)}
        title="Close month" subtitle="Module G · FR-721"
        footer={<><button className="btn-ghost" onClick={() => setCloseMonth(null)}>Cancel</button><button className="btn-primary" onClick={() => setCloseMonth(null)}>Close month</button></>}
      >
        <p className="text-sm text-stone-700">Close <b>{closeMonth?.month}</b> for <b>{closeMonth?.farm}</b>?</p>
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          A closed month&apos;s figures no longer change. Corrections after this are posted in the current open month and marked as relating to {closeMonth?.month}. Only the owner can close months.
        </p>
      </Modal>

      <Note tone={view === "cost" ? "amber" : "blue"}>
        {view === "cost"
          ? "Cost view (FR-719): shows what was used, lost or earned. A purchase of feed is not here until the feed is used. Drives profit, cost per animal and cost per litre."
          : "Cash view (FR-719): shows what was paid and received, including stock purchases. Drives the cash position. Buying 3 months of feed shows the full purchase now."}
      </Note>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="daily" label="Income (filter)" value={money(totalIncome, lang)} />
        <Stat accent="money" label={view === "cost" ? "Cost (used)" : "Cash out"} value={money(view === "cost" ? totalCost : 33000, lang)} />
        <Stat accent="insight" label="Profit / loss" value={money(totalIncome - totalCost, lang)} trend="up" />
        <Stat accent="account" label="Stock held in ledger" value={money(68468, lang)} sub="= inventory valuation (FR-720)" />
      </div>

      <div className="mt-5">
        <Tabs tabs={["Entries", "Consolidated P&L", "Payables", "Money accounts", "Month close", "Filters & grouping"]} active={tab} onChange={setTab} />

        {tab === "Entries" && (
          <Card title={`Ledger entries — ${view} view (FR-701 – FR-704)`}>
            <DataTable
              head={["Date", "Farm", "Type", "Category", "Amount", "Method", "Party", "By", "Note"]}
              rows={LEDGER.filter((l) => view === "cost" ? l.type !== "Stock bought" : l.type !== "Cost")}
              searchText={(l) => `${l.category} ${l.party} ${l.note} ${l.farm} ${l.by}`}
              filters={[
                { key: "type", label: "Type", options: ["Income", "Cost", "Payment", "Stock bought"], match: (l, v) => l.type === v },
                { key: "farm", label: "Farm", options: ["Shapla Dairy", "Green Feedlot", "Rupsha Mixed", "Account level"], match: (l, v) => l.farm === v },
              ]}
              renderRow={(l, i) => (
                <tr key={i} className={l.backdated ? "bg-amber-50/50" : ""}>
                  <td className="td whitespace-nowrap">{l.date} {l.backdated && <Badge tone="amber">backdated</Badge>}</td>
                  <td className="td text-xs">{l.farm}</td>
                  <td className="td"><Badge tone={l.type === "Income" ? "green" : l.type === "Cost" ? "red" : l.type === "Payment" ? "blue" : "amber"}>{l.type}</Badge></td>
                  <td className="td">{l.category}</td>
                  <td className={`td font-medium ${l.type === "Cost" ? "text-red-600" : l.type === "Income" ? "text-daily" : ""}`}>{money(l.amount, lang)}</td>
                  <td className="td text-xs">{l.method}</td>
                  <td className="td text-xs">{l.party}{l.animal ? " · " + l.animal : ""}</td>
                  <td className="td text-xs text-stone-400">{l.by}</td>
                  <td className="td text-xs text-stone-500">{l.note}</td>
                </tr>
              )}
            />
            <Note>Entries are append-only — a correction is a new reversing entry, attributed & timestamped; the original stays visible (FR-711). Backdated entries recalc average & issue costs from their date forward, within open months (FR-712, R-25). Costs not tied to one animal are marked <b>shared</b> and distributed to that farm&apos;s animals by R-03 (FR-705). Viewable at three scopes — one farm, selected farms or all (FR-713); totals & category breakdown for any filter (FR-709).</Note>
          </Card>
        )}

        {tab === "Consolidated P&L" && (
          <Card title="Consolidated profit & loss — one column per farm (FR-715)">
            <Table head={["Category", ...FARMS.map((f) => f.name), "Account level", "Total"]}>
              {CONSOLIDATED_PL.rows.map((r) => {
                const total = r.f1 + r.f2 + r.f3 + r.acc;
                return (
                  <tr key={r.cat}>
                    <td className="td font-medium">{r.cat}</td>
                    <td className={`td ${r.f1 < 0 ? "text-red-600" : ""}`}>{money(r.f1, lang)}</td>
                    <td className={`td ${r.f2 < 0 ? "text-red-600" : ""}`}>{money(r.f2, lang)}</td>
                    <td className={`td ${r.f3 < 0 ? "text-red-600" : ""}`}>{money(r.f3, lang)}</td>
                    <td className={`td ${r.acc < 0 ? "text-red-600" : ""}`}>{money(r.acc, lang)}</td>
                    <td className={`td font-semibold ${total < 0 ? "text-red-600" : ""}`}>{money(total, lang)}</td>
                  </tr>
                );
              })}
              <tr className="bg-stone-100">
                <td className="td font-bold">Net profit</td>
                {(() => {
                  const cols = ["f1", "f2", "f3", "acc"] as const;
                  const sums = cols.map((c) => CONSOLIDATED_PL.rows.reduce((s, r) => s + (r[c] as number), 0));
                  const grand = sums.reduce((a, b) => a + b, 0);
                  return [...sums, grand].map((v, i) => <td key={i} className="td font-bold text-daily">{money(v, lang)}</td>);
                })()}
              </tr>
            </Table>
            <Note tone="green">Inter-farm transfers are excluded (FR-716), so moving an animal, stock or cash between farms never shows as profit or cost. Two-way tables (categories × farms, months × farms) supported (FR-714).</Note>
          </Card>
        )}

        {tab === "Payables" && (
          <Card title="Payables per supplier — aged (FR-707)">
            <DataTable
              head={["Supplier", "Farm", "Purchases (credit)", "Paid", "Returns", "Owed", "Due", "Ageing"]}
              rows={PAYABLES}
              searchText={(p) => `${p.supplier} ${p.farm}`}
              filters={[
                { key: "aging", label: "Ageing", options: ["Current", "30 days"], match: (p, v) => p.aging === v },
              ]}
              renderRow={(p, i) => (
                <tr key={i}>
                  <td className="td font-medium">{p.supplier}</td>
                  <td className="td text-xs">{p.farm}</td>
                  <td className="td">{money(p.purchases, lang)}</td>
                  <td className="td">{money(p.paid, lang)}</td>
                  <td className="td">{money(p.returns, lang)}</td>
                  <td className="td font-semibold text-red-600">{money(p.owed, lang)}</td>
                  <td className="td text-xs">{p.due}</td>
                  <td className="td"><Badge tone={p.aging === "Current" ? "green" : "amber"}>{p.aging}</Badge></td>
                </tr>
              )}
            />
          </Card>
        )}

        {tab === "Money accounts" && (
          <Card title="Cash, bank & mobile money — cash position (FR-710)">
            <DataTable
              head={["Account", "Type", "Farm / level", "Opening", "In", "Out", "Closing"]}
              rows={MONEY_ACCOUNTS}
              searchText={(m) => `${m.name} ${m.farm}`}
              filters={[
                { key: "type", label: "Type", options: ["Cash", "Bank", "Mobile"], match: (m, v) => m.type === v },
              ]}
              renderRow={(m, i) => (
                <tr key={i}>
                  <td className="td font-medium">{m.name}</td>
                  <td className="td"><Badge tone={m.type === "Bank" ? "blue" : m.type === "Mobile" ? "purple" : "gray"}>{m.type}</Badge></td>
                  <td className="td text-xs">{m.farm}</td>
                  <td className="td">{money(m.opening, lang)}</td>
                  <td className="td text-daily">{money(m.in, lang)}</td>
                  <td className="td text-red-600">{money(m.out, lang)}</td>
                  <td className="td font-semibold">{money(m.closing, lang)}</td>
                </tr>
              )}
            />
            <Note>Transfers between accounts supported. bKash/Nagad are recorded as references in this release; automated reconciliation is deferred.</Note>
          </Card>
        )}

        {tab === "Month close" && (
          <Card title="Close a month per farm (FR-721)">
            <Table head={["Farm", "Month", "Status", "Closed by", "On", "Action"]}>
              {MONTH_CLOSE.map((m, i) => (
                <tr key={i}>
                  <td className="td font-medium">{m.farm}</td>
                  <td className="td">{m.month}</td>
                  <td className="td"><Badge tone={m.status === "Closed" ? "gray" : "green"}>{m.status}</Badge></td>
                  <td className="td text-xs">{m.by}</td>
                  <td className="td text-xs">{m.on}</td>
                  <td className="td">{m.status === "Open" ? <button className="btn-primary text-xs" onClick={() => setCloseMonth({ farm: m.farm, month: m.month })}>Close month</button> : <button className="btn-ghost text-xs">Locked</button>}</td>
                </tr>
              ))}
            </Table>
            <Note tone="amber">A closed month&apos;s figures no longer change; corrections to it are posted in the current open month and marked as relating to the closed month. Only the owner can close months.</Note>
          </Card>
        )}

        {tab === "Filters & grouping" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Filter by any combination (FR-708)">
              <div className="flex flex-wrap gap-1.5">
                {FILTER_DIMS.map((d) => <span key={d} className="chip bg-stone-100 text-stone-600">{d}</span>)}
              </div>
            </Card>
            <Card title="Group & subtotal — one or two dimensions (FR-714)">
              <div className="flex flex-wrap gap-1.5">
                {["Farm", "Day/week/month/quarter/fiscal year", "Category", "Inventory item", "Item type", "Species", "Animal purpose", "Animal", "Shed/group", "Customer", "Supplier", "Payment method", "Money account"].map((d) => <span key={d} className="chip bg-insight/10 text-insight">{d}</span>)}
              </div>
              <Note tone="blue">Example: &quot;How much feed did all farms use last quarter, farm by farm, and how much did they buy?&quot; Save any scope + filters + grouping as a named view, reopened in one tap (FR-718). Compare any two periods side by side (FR-717).</Note>
            </Card>
            <Card title="Pre-set categories, extendable (FR-702)" className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><div className="mb-1 text-xs font-semibold uppercase text-red-500">Cost categories</div><div className="flex flex-wrap gap-1.5">{LEDGER_CATEGORIES.cost.map((c) => <span key={c} className="chip bg-red-50 text-red-600">{c}</span>)}</div></div>
                <div><div className="mb-1 text-xs font-semibold uppercase text-daily">Income categories</div><div className="flex flex-wrap gap-1.5">{LEDGER_CATEGORIES.income.map((c) => <span key={c} className="chip bg-green-50 text-green-700">{c}</span>)}</div></div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
