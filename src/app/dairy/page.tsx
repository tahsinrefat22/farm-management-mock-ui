"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Tabs, Note, Bar } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { MILK_SESSION, MILK_USE, CUSTOMERS } from "@/lib/data";
import { num, litres, money } from "@/lib/format";

export default function DairyPage() {
  const { lang, role } = useApp();
  const [tab, setTab] = useState(role === "worker" ? "Milk entry" : "Milk entry");
  const [modal, setModal] = useState<null | "session" | "customer">(null);
  const showMoney = role !== "worker";
  const totalOutstanding = CUSTOMERS.reduce((s, c) => s + c.outstanding, 0);

  const tabs = ["Milk entry", "Session summary"];
  if (showMoney) tabs.push("Customers & sales", "Receivables", "Reconciliation");

  return (
    <div>
      <PageHeader
        module="Module E · Dairy"
        title="Dairy"
        subtitle="Milk yield per animal per session, milk sales and customer receivables. Pre-filled from last value — a normal session is confirmed in one tap, only changed rows typed."
        frs="FR-501 – FR-512 · R-08, R-09"
        actions={<button className="btn-primary" onClick={() => setModal("session")}>＋ Start session</button>}
      />

      <FormModal
        open={modal === "session"} onClose={() => setModal(null)}
        title="Start milking session" subtitle="Module E · FR-501, FR-502" saveLabel="Open session"
        note="Rows pre-fill with each animal's last value for the session — confirm unchanged rows in one tap, type only the changes. A 25-animal session completes in under 90 s (NFR-01)."
        fields={[
          { label: "Farm", type: "select", options: ["Shapla Dairy", "Rupsha Mixed Farm"] },
          { label: "Session", type: "select", options: ["Morning", "Evening"] },
          { label: "Date", type: "date" },
          { label: "Narrow by shed / group", type: "select", options: ["All", "Milking Shed A", "Milking Shed B"] },
        ]}
      />
      <FormModal
        open={modal === "customer"} onClose={() => setModal(null)} wide
        title="Register customer" subtitle="Module E · FR-505" saveLabel="Save customer"
        fields={[
          { label: "Name", placeholder: "e.g. Rahela Store" },
          { label: "Mobile", placeholder: "+8801…" },
          { label: "Type", type: "select", options: ["Household", "Shop", "Wholesaler"] },
          { label: "Agreed rate (৳/litre)", type: "number", placeholder: "e.g. 68" },
          { label: "Payment terms", type: "select", options: ["Cash", "Monthly credit"] },
          { label: "Standing daily order (litres)", type: "number", placeholder: "e.g. 20" },
          { label: "Address", type: "textarea", placeholder: "optional" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="daily" label="Produced today" value={litres(MILK_USE.produced, lang)} sub="morning + evening" />
        <Stat accent="money" label="Sold today" value={litres(MILK_USE.sold, lang)} />
        {showMoney ? <Stat accent="money" label="Outstanding (receivable)" value={money(totalOutstanding, lang)} trend="down" sub="across all customers" />
          : <Stat accent="account" label="Not milked" value={num(MILK_SESSION.filter((m) => m.flag.includes("Not milked")).length, lang)} sub="with reason, not zero" />}
        <Stat accent="account" label="Value not realised" value={litres(MILK_USE.home + MILK_USE.calves + MILK_USE.spoiled, lang)} sub="home, calves, spoiled (R-09)" />
      </div>

      <div className="mt-5">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === "Milk entry" && (
          <Card title="Morning session — pre-filled, confirm changed rows only (FR-502)">
            <DataTable
              head={["Animal", "Last", "Morning", "Evening", "7-day avg", "Flag"]}
              rows={MILK_SESSION}
              searchText={(m) => `${m.tag} ${m.name}`}
              searchPlaceholder="Search tag or name…"
              filters={[
                {
                  key: "state",
                  label: "Row",
                  options: ["Below average", "Not milked", "Normal"],
                  match: (m, v) =>
                    v === "Below average"
                      ? m.flag.includes("below")
                      : v === "Not milked"
                      ? m.flag.includes("Not milked")
                      : !m.flag,
                },
              ]}
              renderRow={(m) => (
                <tr key={m.tag} className={m.flag.includes("below") ? "bg-red-50" : ""}>
                  <td className="td"><div className="font-medium">{m.tag}</div><div className="text-xs text-stone-400">{m.name}</div></td>
                  <td className="td text-stone-400">{m.last ? num(m.last, lang, 1) : "—"}</td>
                  <td className="td font-medium">{m.morning ? num(m.morning, lang, 1) : "—"}</td>
                  <td className="td font-medium">{m.evening ? num(m.evening, lang, 1) : "—"}</td>
                  <td className="td text-stone-500">{m.avg7 ? num(m.avg7, lang, 1) : "—"}</td>
                  <td className="td">{m.flag && <Badge tone={m.flag.includes("below") ? "red" : "gray"}>{m.flag}</Badge>}</td>
                </tr>
              )}
            />
            <Note tone="green">Mark an animal <b>not milked</b> with a reason (dry, sick, withdrawal, delivered) rather than a zero (FR-503). A 25-animal session completes in under 90 s (NFR-01). Withdrawal warning shows here (FR-305).</Note>
          </Card>
        )}

        {tab === "Session summary" && (
          <Card title="After the session — the worker gets something back the same day (FR-811)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-daily p-4 text-white">
                <div className="text-xs uppercase opacity-80">This session</div>
                <div className="text-2xl font-bold">{litres(148, lang)}</div>
                <div className="text-xs opacity-80">vs 141 L same session last week ▲</div>
              </div>
              <div className="rounded-xl bg-stone-100 p-4">
                <div className="text-xs uppercase text-stone-500">Produced vs sold</div>
                <div className="text-2xl font-bold">{litres(MILK_USE.produced, lang)} / {litres(MILK_USE.sold, lang)}</div>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <div className="text-xs uppercase text-red-600">Below own average</div>
                <div className="text-2xl font-bold text-red-700">1 animal</div>
                <div className="text-xs text-red-600">COW-118 · Moyna (↓22%)</div>
              </div>
            </div>
            <Note>This is part of the daily entry flow, not a report — the person entering data must get feedback the same day or entry stops.</Note>
          </Card>
        )}

        {tab === "Customers & sales" && showMoney && (
          <Card title="Customers & standing daily orders (FR-505, FR-506)" right={<button className="btn-primary text-xs" onClick={() => setModal("customer")}>＋ Add customer</button>}>
            <DataTable
              head={["Customer", "Type", "Rate", "Terms", "Standing order", "Outstanding"]}
              rows={CUSTOMERS}
              searchText={(c) => `${c.name} ${c.mobile}`}
              searchPlaceholder="Search name or mobile…"
              filters={[
                {
                  key: "type",
                  label: "Type",
                  options: ["Household", "Shop", "Wholesaler"],
                  match: (c, v) => c.type === v,
                },
                {
                  key: "bal",
                  label: "Balance",
                  options: ["Outstanding", "Clear"],
                  match: (c, v) => (v === "Outstanding" ? c.outstanding > 0 : c.outstanding === 0),
                },
              ]}
              renderRow={(c) => (
                <tr key={c.id}>
                  <td className="td"><div className="font-medium">{c.name}</div><div className="text-xs text-stone-400">{c.mobile}</div></td>
                  <td className="td"><Badge tone={c.type === "Wholesaler" ? "blue" : c.type === "Shop" ? "amber" : "gray"}>{c.type}</Badge></td>
                  <td className="td">৳{num(c.rate, lang)}/L</td>
                  <td className="td text-xs">{c.terms}</td>
                  <td className="td">{litres(c.standingOrder, lang)}/day</td>
                  <td className="td">{c.outstanding > 0 ? <span className="font-medium text-red-600">{money(c.outstanding, lang)}</span> : <Badge tone="green">Clear</Badge>}</td>
                </tr>
              )}
            />
            <Note tone="amber">A standing daily order lets a normal day be confirmed instead of typed. The sale screen warns when a customer&apos;s outstanding balance exceeds a configurable limit (FR-508). Month-end statement can be shared by SMS / PDF (FR-511).</Note>
          </Card>
        )}

        {tab === "Receivables" && showMoney && (
          <Card title="Receivables — aged (FR-706)">
            <DataTable
              head={["Customer", "Billed", "Paid", "Outstanding", "Current", "30d", "60d", "90d+"]}
              rows={CUSTOMERS}
              searchText={(c) => `${c.name}`}
              searchPlaceholder="Search name…"
              filters={[
                {
                  key: "bal",
                  label: "Balance",
                  options: ["Outstanding", "Clear"],
                  match: (c, v) => (v === "Outstanding" ? c.outstanding > 0 : c.outstanding === 0),
                },
              ]}
              renderRow={(c) => (
                <tr key={c.id}>
                  <td className="td font-medium">{c.name}</td>
                  <td className="td">{money(c.billed, lang)}</td>
                  <td className="td">{money(c.paid, lang)}</td>
                  <td className="td font-semibold text-red-600">{money(c.outstanding, lang)}</td>
                  <td className="td">{money(c.aging.current, lang)}</td>
                  <td className="td">{money(c.aging.d30, lang)}</td>
                  <td className="td">{money(c.aging.d60, lang)}</td>
                  <td className="td text-red-600">{money(c.aging.d90, lang)}</td>
                </tr>
              )}
            />
            <Note>Record customer payments part or full with method (cash, bKash, Nagad, bank) and reference (FR-507). Sorted by amount overdue, per farm or combined.</Note>
          </Card>
        )}

        {tab === "Reconciliation" && showMoney && (
          <Card title="Daily milk reconciliation (FR-509) · milk not sold recorded separately (FR-504)">
            <div className="space-y-2">
              {[["Produced", MILK_USE.produced, "daily"], ["Sold", MILK_USE.sold, "money"], ["Fed to calves", MILK_USE.calves, "account"], ["Used at home", MILK_USE.home, "account"], ["Spoiled", MILK_USE.spoiled, "red"]].map(([l, v, tone]) => (
                <div key={l as string}>
                  <div className="flex justify-between text-sm"><span>{l}</span><span className="font-medium">{litres(v as number, lang)}</span></div>
                  <Bar value={v as number} max={MILK_USE.produced} tone={tone as string} />
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-stone-100 p-3 text-sm">
              Unexplained difference: <b>{litres(MILK_USE.produced - MILK_USE.sold - MILK_USE.home - MILK_USE.calves - MILK_USE.spoiled, lang)}</b> — shown to the owner.
            </div>
            <Note tone="amber">Realised milk income per animal (FR-510) shares actual milk revenue by litres produced (R-08), so per-animal income always adds up to the ledger. Value not realised (R-09) is shown separately, never counted as income.</Note>
          </Card>
        )}
      </div>
    </div>
  );
}
