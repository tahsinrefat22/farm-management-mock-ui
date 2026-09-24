"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Tabs, Note, Bar, Spark } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { FATTENING, BOOKINGS, QURBANI_SHARES, PHOTO_TIMELINE } from "@/lib/data";
import { num, kg, money } from "@/lib/format";

export default function FatteningPage() {
  const { lang, role } = useApp();
  const [tab, setTab] = useState("Weight & projection");
  const [price, setPrice] = useState(195000);
  const [modal, setModal] = useState<null | "intake" | "booking">(null);

  // Qurbani buyer share link view (FR-612, §2.2)
  if (role === "buyer") return <BuyerShareView />;
  const totalInvested = FATTENING.reduce((s, f) => s + f.invested, 0);

  return (
    <div>
      <PageHeader
        module="Module F · Fattening & Qurbani"
        title="Fattening & Qurbani"
        subtitle="Money goes into an animal for months and comes back in one selling window, so this module is driven by weight and cost. Fattening cost never enters dairy cost per litre."
        frs="FR-601 – FR-612 · R-11, R-12, R-13"
        actions={<button className="btn-primary" onClick={() => setModal("intake")}>＋ Mark for fattening</button>}
      />

      <FormModal
        open={modal === "intake"} onClose={() => setModal(null)} wide
        title="Mark animal for fattening" subtitle="Module F · FR-601, FR-605" saveLabel="Start fattening"
        note="All costs accumulate against the animal from intake — purchase price, feed issued, treatments and its share of shared costs. Fattening cost never enters dairy cost per litre (D-06)."
        fields={[
          { label: "Animal", type: "select", options: ["BULL-215", "BULL-216", "GOAT-310"] },
          { label: "Intake date", type: "date" },
          { label: "Intake weight (kg)", type: "number", placeholder: "e.g. 300" },
          { label: "Target sale date (Eid)", type: "date" },
          { label: "Target weight (kg)", type: "number", placeholder: "e.g. 520" },
          { label: "Weighing interval", type: "select", options: ["Weekly (default)", "Fortnightly", "Monthly"] },
        ]}
      />
      <FormModal
        open={modal === "booking"} onClose={() => setModal(null)} wide
        title="Advance booking" subtitle="Module F · FR-607, FR-612" saveLabel="Save booking"
        note="A dated photo & weight record justifies the deposit and reduces disputes. Send the buyer an expiring link showing that animal's photos, weight trend and payment status — and nothing else."
        fields={[
          { label: "Animal", type: "select", options: FATTENING.map((f) => f.tag + " · " + f.name) },
          { label: "Buyer name", placeholder: "Full name" },
          { label: "Buyer mobile", placeholder: "+8801…" },
          { label: "Agreed price (৳)", type: "number", placeholder: "e.g. 195000" },
          { label: "Deposit (৳)", type: "number", placeholder: "e.g. 40000" },
          { label: "Delivery date", type: "select", options: ["Eid-ul-Adha 2027"] },
          { label: "Send buyer share link?", type: "select", options: ["Yes — expiring link", "No"] },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="money" label="Animals fattening" value={num(FATTENING.length, lang)} />
        <Stat accent="money" label="Total invested" value={money(totalInvested, lang)} sub="accumulated from intake" />
        <Stat accent="account" label="Behind target" value={num(FATTENING.filter((f) => f.projected < f.target).length, lang)} sub="while time to correct (FR-604)" trend="down" />
        <Stat accent="daily" label="Booked" value={num(FATTENING.filter((f) => f.booked).length, lang)} sub="advance bookings + shares" />
      </div>

      <div className="mt-5">
        <Tabs tabs={["Weight & projection", "Break-even", "Bookings", "Qurbani shares", "Photo timeline"]} active={tab} onChange={setTab} />

        {tab === "Weight & projection" && (
          <Card title="Weight targets & projection to Eid (FR-601 – FR-603)">
            <DataTable
              head={["Animal", "Intake", "Current", "Target", "ADG", "Projected", "Status"]}
              rows={FATTENING}
              searchText={(f) => `${f.tag} ${f.name}`}
              searchPlaceholder="Search animal…"
              filters={[
                { key: "status", label: "Status", options: ["On track", "Behind target"], match: (f, v) => v === "On track" ? f.projected >= f.target : f.projected < f.target },
                { key: "booked", label: "Booking", options: ["Booked", "Unbooked"], match: (f, v) => v === "Booked" ? f.booked : !f.booked },
              ]}
              renderRow={(f) => (
                <tr key={f.tag}>
                  <td className="td"><div className="font-medium">{f.tag}</div><div className="text-xs text-stone-400">{f.name}</div></td>
                  <td className="td text-xs">{kg(f.intakeWt, lang)}<br /><span className="text-stone-400">{f.intakeDate}</span></td>
                  <td className="td font-medium">{kg(f.current, lang)}</td>
                  <td className="td">{kg(f.target, lang)}</td>
                  <td className="td">{num(f.adg, lang, 2)} kg/d</td>
                  <td className="td">{kg(f.projected, lang)}</td>
                  <td className="td"><Badge tone={f.projected >= f.target ? "green" : "red"}>{f.projected >= f.target ? "On track" : "Short " + kg(f.target - f.projected, lang)}</Badge></td>
                </tr>
              )}
            />
            <Note tone="amber">Prompts weight recording at a configurable interval (default weekly, FR-602). Projected weight = latest + recent ADG × days remaining (R-12). Animals short of target are flagged while there is still time to correct (FR-604).</Note>
          </Card>
        )}

        {tab === "Break-even" && (
          <Card title="Break-even & margin calculator (FR-606 · R-13)">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-3 rounded-xl bg-stone-100 p-4">
                  <div className="text-sm font-medium">BULL-207 · Badshah</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div><div className="text-xs text-stone-400">Cost to date</div><div className="font-semibold">{money(121300, lang)}</div></div>
                    <div><div className="text-xs text-stone-400">Projected cost to sale</div><div className="font-semibold">{money(26700, lang)}</div></div>
                    <div className="col-span-2"><div className="text-xs text-stone-400">Break-even price</div><div className="text-xl font-bold text-money">{money(148000, lang)}</div></div>
                  </div>
                </div>
                <label className="text-xs font-medium uppercase text-stone-400">Try a sale price</label>
                <input type="range" min={120000} max={260000} step={5000} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 w-full accent-money" />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold">{money(price, lang)}</span>
                  <Badge tone={price - 148000 >= 0 ? "green" : "red"}>{price - 148000 >= 0 ? "Profit " : "Loss "}{money(Math.abs(price - 148000), lang)}</Badge>
                </div>
              </div>
              <Note>Break-even = cost to date + (avg daily cost over last 30 days × days remaining). Shows projected profit before sale and profit or loss at sale (FR-808). Final sale records actual weight, price & settlement, closes the animal&apos;s cost account and posts realised profit or loss (FR-608). Meat yield can be estimated from live weight × dressing % (FR-611, to confirm).</Note>
            </div>
          </Card>
        )}

        {tab === "Bookings" && (
          <Card title="Advance bookings against a specific animal (FR-607)" right={<button className="btn-primary text-xs" onClick={() => setModal("booking")}>＋ New booking</button>}>
            <DataTable
              head={["Animal", "Buyer", "Price", "Deposit", "Balance due", "Delivery", "Status", "Link"]}
              rows={BOOKINGS}
              searchText={(b) => `${b.animal} ${b.buyer} ${b.mobile}`}
              searchPlaceholder="Search bookings…"
              filters={[{ key: "status", label: "Status", options: ["Booked", "Part booked"], match: (b, v) => b.status === v }]}
              renderRow={(b, i) => (
                <tr key={i}>
                  <td className="td font-medium">{b.animal}</td>
                  <td className="td"><div>{b.buyer}</div><div className="text-xs text-stone-400">{b.mobile}</div></td>
                  <td className="td">{money(b.price, lang)}</td>
                  <td className="td text-daily">{money(b.deposit, lang)}</td>
                  <td className="td text-red-600">{money(b.balance, lang)}</td>
                  <td className="td text-xs">{b.delivery}</td>
                  <td className="td"><Badge tone={b.status === "Booked" ? "green" : "amber"}>{b.status}</Badge></td>
                  <td className="td">{b.shareLink && <button className="btn-ghost text-xs">📤 Share</button>}</td>
                </tr>
              )}
            />
            <Note>Season report per farm & across all farms: animals in, total invested, booked vs unbooked, collected vs due, projected profit (FR-609).</Note>
          </Card>
        )}

        {tab === "Qurbani shares" && (
          <Card title="Qurbani shares — BULL-211 · Raja (FR-610)">
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <Badge tone="blue">Default 7 shares / cattle</Badge>
              <Badge tone="gray">1 / goat · configurable per species</Badge>
            </div>
            <DataTable
              head={["Share", "Buyer", "Amount", "Payment"]}
              rows={QURBANI_SHARES}
              searchText={(s) => `${s.share} ${s.buyer}`}
              searchPlaceholder="Search shares…"
              filters={[{ key: "pay", label: "Payment", options: ["Paid", "Due", "Open"], match: (s, v) => v === "Open" ? s.buyer === "—" : v === "Paid" ? s.paid && s.buyer !== "—" : !s.paid && s.buyer !== "—" }]}
              renderRow={(s) => (
                <tr key={s.share}>
                  <td className="td font-medium">Share {s.share}</td>
                  <td className="td">{s.buyer}</td>
                  <td className="td">{money(s.amount, lang)}</td>
                  <td className="td">{s.buyer === "—" ? <Badge tone="gray">Open</Badge> : s.paid ? <Badge tone="green">Paid</Badge> : <Badge tone="amber">Due</Badge>}</td>
                </tr>
              )}
            />
            <Note tone="amber">Divide an animal&apos;s price into shares, each with a buyer and payment status. Scope to confirm (open question 2).</Note>
          </Card>
        )}

        {tab === "Photo timeline" && (
          <Card title="Dated photo & weight timeline (FR-612)">
            <div className="mb-4 flex items-center gap-4">
              <Spark points={PHOTO_TIMELINE.map((p) => p.wt)} color="#d97706" height={50} />
              <div className="text-sm text-stone-500">300 → 428 kg since intake</div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {PHOTO_TIMELINE.map((p, i) => (
                <div key={i} className="rounded-xl border border-stone-200 p-2 text-center">
                  <div className="flex h-16 items-center justify-center rounded-lg bg-amber-50 text-3xl">🐂</div>
                  <div className="mt-1 text-xs font-medium">{kg(p.wt, lang)}</div>
                  <div className="text-[10px] text-stone-400">{p.date}</div>
                  <div className="text-[10px] text-stone-500">{p.note}</div>
                </div>
              ))}
            </div>
            <Note>Send the booked buyer an expiring link showing that animal&apos;s photos, weight trend and payment status — and nothing else. A dated record justifies the deposit and reduces disputes at collection.</Note>
          </Card>
        )}
      </div>
    </div>
  );
}

function BuyerShareView() {
  const { lang } = useApp();
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 rounded-xl bg-account p-4 text-white">
        <div className="text-xs uppercase opacity-80">Qurbani buyer link · read-only · expires in 30 days</div>
        <div className="text-lg font-bold">Your animal: BULL-207 · Badshah</div>
      </div>
      <Card>
        <div className="flex h-40 items-center justify-center rounded-xl bg-amber-50 text-7xl">🐂</div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-stone-50 p-3"><div className="text-xs text-stone-400">Current weight</div><div className="text-xl font-bold">{kg(428, lang)}</div></div>
          <div className="rounded-lg bg-stone-50 p-3"><div className="text-xs text-stone-400">Amount paid</div><div className="text-xl font-bold text-daily">{money(40000, lang)}</div></div>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-xs font-medium text-stone-400">Weight trend</div>
          <Spark points={PHOTO_TIMELINE.map((p) => p.wt)} color="#d97706" height={50} />
        </div>
        <Note tone="green">You can see only this one animal — no other animal and no farm figure (§2.2).</Note>
      </Card>
    </div>
  );
}
