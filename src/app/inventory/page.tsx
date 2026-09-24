"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Table, Tabs, Note } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { ITEMS, BATCHES, MOVEMENTS, STOCK_COUNTS } from "@/lib/data";
import { num, money } from "@/lib/format";

export default function InventoryPage() {
  const { lang, role } = useApp();
  const [tab, setTab] = useState("Items & stock");
  const [modal, setModal] = useState<null | "purchase" | "count" | "item">(null);
  const showMoney = role !== "worker";
  const totalValue = ITEMS.reduce((s, i) => s + i.value, 0);

  const tabs = ["Items & stock", "Purchases", "Movements", "Batches & expiry", "Stock count", "Valuation & usage"];

  return (
    <div>
      <PageHeader
        module="Module B · Inventory"
        title="Inventory"
        subtitle="Everything the farm buys, stores and uses up — fully connected to the ledger. Spending is not cost: a purchase adds stock and records payment; cost is recorded only when an item is used, lost or written off."
        frs="FR-201 – FR-222 · D-10, D-11 · IAS 2"
        actions={<><button className="btn-ghost" onClick={() => setModal("count")}>＋ Stock count</button><button className="btn-primary" onClick={() => setModal("purchase")}>＋ Record purchase</button></>}
      />

      <FormModal
        open={modal === "purchase"} onClose={() => setModal(null)} wide
        title="Record purchase" subtitle="Module B · FR-204, FR-205 · IAS 2" saveLabel="Save purchase"
        note="A purchase adds stock and records the payment — never an expense (D-10). Extra costs are spread across lines by value (R-19) and update the weighted average cost. Batch & expiry captured where relevant."
        fields={[
          { label: "Farm", type: "select", options: ["Shapla Dairy", "Green Feedlot", "Rupsha Mixed Farm"] },
          { label: "Supplier", type: "select", options: ["Rahim Traders", "Feed Mill Ltd", "Vet Pharma"] },
          { label: "Date", type: "date" },
          { label: "Item", type: "select", options: ITEMS.map((i) => i.name) },
          { label: "Last price paid (FR-221)", type: "static", value: "৳34.00 / kg · Rahim Traders (18 Sep) — price history kept per item & supplier" },
          { label: "Quantity (bought unit)", type: "number", placeholder: "e.g. 10 sacks" },
          { label: "Total price (৳)", type: "number", placeholder: "e.g. 17000" },
          { label: "Extra costs — delivery/loading (৳)", type: "number", placeholder: "spread by value (R-19)" },
          { label: "Batch number (if relevant)", placeholder: "e.g. FMD-2026A" },
          { label: "Expiry date (if relevant)", type: "date" },
          { label: "Payment status", type: "select", options: ["Paid in full", "Part paid", "On credit"] },
          { label: "Payment method", type: "select", options: ["Cash", "bKash", "Nagad", "Bank"] },
        ]}
      />
      <FormModal
        open={modal === "count"} onClose={() => setModal(null)}
        title="Physical stock count" subtitle="Module B · FR-213 · R-24" saveLabel="Post count"
        note="The difference from the system balance posts as a named variance at weighted average cost — never silently overwriting. Variances above the owner limit need owner approval (FR-214)."
        fields={[
          { label: "Farm", type: "select", options: ["Shapla Dairy", "Green Feedlot", "Rupsha Mixed Farm"] },
          { label: "Date", type: "date" },
          { label: "Counted by", type: "select", options: ["Karim Sheikh", "Rahim Uddin"] },
          { label: "Scope", type: "select", options: ["All items", "Feed only", "Medicine & vaccine", "Chosen set"] },
          { label: "Reason / note", type: "textarea", placeholder: "e.g. month-end count", col: 2 },
        ]}
      />
      <FormModal
        open={modal === "item"} onClose={() => setModal(null)} wide
        title="Add inventory item" subtitle="Module B · FR-201, FR-202" saveLabel="Save item"
        note="Items are held at account level and shared by every farm; each farm keeps its own stock. Define conversions between the bought, stocked and used units."
        fields={[
          { label: "Name (English)", placeholder: "e.g. Wheat Bran" },
          { label: "Name (Bangla)", placeholder: "e.g. গমের ভুষি" },
          { label: "Type", type: "select", options: ["feed", "medicine", "vaccine", "semen straw", "consumable", "equipment", "other"] },
          { label: "Stock unit", type: "select", options: ["kg", "ml", "dose", "straw", "bolus", "pcs", "unit"] },
          { label: "Bought unit → stock", placeholder: "e.g. 1 sack = 50 kg" },
          { label: "Used unit", placeholder: "e.g. kg / ml / dose" },
          { label: "Batch tracked?", type: "select", options: ["No", "Yes (with expiry)"] },
          { label: "Reorder level (days of cover)", type: "number", placeholder: "e.g. 10" },
          { label: "Photo", type: "photo" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {showMoney && <Stat accent="money" label="Stock value on hand" value={money(totalValue, lang)} sub="weighted avg cost = ledger balance (R-22)" />}
        <Stat accent="account" label="Items tracked" value={num(ITEMS.length, lang)} sub="feed, medicine, vaccine, straws…" />
        <Stat accent="red" label="Low stock" value={num(ITEMS.filter((i) => i.daysCover !== null && i.daysCover <= i.reorderDays).length, lang)} sub="days-of-cover based (R-23)" trend="down" />
        <Stat accent="red" label="Batches expiring" value={num(BATCHES.filter((b) => b.status.startsWith("Expiring")).length, lang)} sub="warn 30 d before (FR-207)" />
      </div>

      <div className="mt-5">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === "Items & stock" && (
          <Card title="Item list (account level) & per-farm stock (FR-201, FR-210)"
            right={<button className="btn-primary text-xs" onClick={() => setModal("item")}>＋ Add item</button>}>
            <DataTable
              head={["Item", "Type", "Units (buy → stock → use)", "On hand", showMoney ? "Avg cost" : "", showMoney ? "Value" : "", "Cover", "Reorder"]}
              rows={ITEMS}
              searchText={(i) => `${i.name} ${i.nameBn} ${i.type}`}
              searchPlaceholder="Search items…"
              filters={[
                { key: "type", label: "Type", options: ["feed", "medicine", "vaccine", "semen straw", "consumable", "equipment", "other"], match: (i, v) => i.type === v },
                { key: "stock", label: "Stock", options: ["Low stock", "In stock"], match: (i, v) => v === "Low stock" ? i.daysCover !== null && i.daysCover <= i.reorderDays : !(i.daysCover !== null && i.daysCover <= i.reorderDays) },
              ]}
              renderRow={(i) => (
                <tr key={i.id}>
                  <td className="td"><div className="flex items-center gap-2"><span className="text-lg">{i.photo}</span><div><div className="font-medium">{i.name}</div><div className="text-xs text-stone-400">{i.nameBn}</div></div></div></td>
                  <td className="td"><Badge tone={i.type === "feed" ? "green" : i.type === "vaccine" || i.type === "medicine" ? "blue" : i.type === "equipment" ? "purple" : "gray"}>{i.type}</Badge></td>
                  <td className="td text-xs text-stone-500">{i.conversion}</td>
                  <td className="td font-medium">{num(i.qty, lang)} {i.stockUnit}</td>
                  {showMoney ? <td className="td">৳{num(i.avgCost, lang, 1)}</td> : <td className="td" />}
                  {showMoney ? <td className="td">{money(i.value, lang)}{i.avgCost === 0 && <Badge tone="green">free/DLS</Badge>}</td> : <td className="td" />}
                  <td className="td">{i.daysCover === null ? "—" : <Badge tone={i.daysCover <= i.reorderDays ? "red" : "green"}>{i.daysCover}d</Badge>}</td>
                  <td className="td text-xs">{i.reorderDays ? i.reorderDays + "d" : "—"}</td>
                </tr>
              )}
            />
            <Note>Free/donated items (e.g. DLS vaccines) are recorded at zero cost so batches are tracked without changing cost figures (FR-216). Every item defines unit conversions between bought, stocked and used units (FR-202).</Note>
          </Card>
        )}

        {tab === "Purchases" && (
          <Card title="Record a purchase (FR-204, FR-205)">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-3 text-sm">
                <F label="Farm" value="Shapla Dairy" />
                <F label="Supplier" value="Rahim Traders" />
                <div className="rounded-lg border border-stone-200 p-3">
                  <div className="mb-2 text-xs font-semibold text-stone-500">Item lines</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span>Wheat Bran — 10 sacks (500 kg)</span><span>৳17,000</span></div>
                    <div className="flex justify-between"><span>Oil Cake — 5 sacks (200 kg)</span><span>৳10,400</span></div>
                    <div className="flex justify-between text-stone-400"><span>+ Delivery & loading (spread by value, R-19)</span><span>৳600</span></div>
                  </div>
                </div>
                <F label="Payment status" value="Part paid (৳20,000) · rest on credit" />
                <div className="flex justify-end">
                  <button className="btn-primary">Save purchase</button>
                </div>
              </div>
              <Note tone="amber">A purchase increases stock quantity & value, spreads extra costs by value (R-19), updates weighted average cost, and posts to the ledger as <b>stock bought</b> with cash paid or a supplier payable — never an expense (D-10), except equipment (D-12). Batch number & expiry captured where relevant.</Note>
            </div>
          </Card>
        )}

        {tab === "Movements" && (
          <Card title="Movement history — every in & out (FR-211)">
            <DataTable
              head={["Date", "Type", "Item", "Farm", "Qty", showMoney ? "Value" : "", "By", "Reference"]}
              rows={MOVEMENTS}
              searchText={(m) => `${m.item} ${m.farm} ${m.by} ${m.ref}`}
              searchPlaceholder="Search movements…"
              filters={[
                { key: "type", label: "Movement", options: ["Purchase", "Issue", "Transfer", "Return", "Count variance", "Write-off", "Opening"], match: (m, v) => m.type === v },
              ]}
              renderRow={(m, i) => (
                <tr key={i}>
                  <td className="td whitespace-nowrap">{m.date}</td>
                  <td className="td"><Badge tone={m.type === "Purchase" || m.type === "Opening" ? "green" : m.type === "Issue" ? "blue" : m.type === "Write-off" ? "red" : m.type === "Transfer" ? "purple" : "amber"}>{m.type}</Badge></td>
                  <td className="td">{m.item}</td>
                  <td className="td text-xs">{m.farm}</td>
                  <td className="td font-medium">{m.qty}</td>
                  {showMoney ? <td className={`td ${m.value < 0 ? "text-red-600" : ""}`}>{money(m.value, lang)}</td> : <td className="td" />}
                  <td className="td text-xs">{m.by}</td>
                  <td className="td text-xs text-stone-500">{m.ref}</td>
                </tr>
              )}
            />
            <Note>A balance is never edited directly (constraint §2.5). Opening stock at setup posts as an opening balance, never an expense (FR-203). Stock is issued through the screen where the work happens — feed, treatment, breeding straw, general issue — so nobody records usage twice (FR-208). Items transfer between farms at the sending farm&apos;s weighted average cost, excluded from consolidated totals (FR-219). Issue larger than stock is saved, valued by R-21 and placed in a reconciliation queue asking for a reason (FR-212) — never blocked. Returns to a supplier reduce stock and the amount owed (FR-215).</Note>
          </Card>
        )}

        {tab === "Batches & expiry" && (
          <Card title="Batch tracking — issue earliest expiry first (FR-206, FR-207)">
            <DataTable
              head={["Item", "Batch", "Expiry", "Qty on hand", "Status"]}
              rows={BATCHES}
              searchText={(b) => `${b.item} ${b.batch}`}
              searchPlaceholder="Search batches…"
              filters={[{ key: "status", label: "Status", options: ["Expiring", "OK"], match: (b, v) => v === "Expiring" ? b.status.startsWith("Expiring") : !b.status.startsWith("Expiring") }]}
              renderRow={(b, i) => (
                <tr key={i}>
                  <td className="td font-medium">{b.item}</td>
                  <td className="td font-mono text-xs">{b.batch}</td>
                  <td className="td">{b.expiry}</td>
                  <td className="td">{num(b.qty, lang)}</td>
                  <td className="td"><Badge tone={b.status.startsWith("Expiring") ? "red" : "green"}>{b.status}</Badge></td>
                </tr>
              )}
            />
            <Note tone="amber">An expired batch cannot be issued without a manager override and a recorded reason (FR-207).</Note>
          </Card>
        )}

        {tab === "Stock count" && (
          <Card title="Physical stock counts (FR-213)">
            <DataTable
              head={["Count", "Date", "Farm", "By", "Items", "Variances", showMoney ? "Value" : "", "Approved", "Reason"]}
              rows={STOCK_COUNTS}
              searchText={(c) => `${c.id} ${c.farm} ${c.by} ${c.reason}`}
              searchPlaceholder="Search counts…"
              filters={[{ key: "var", label: "Variances", options: ["Has variances", "Matched"], match: (c, v) => v === "Has variances" ? c.variances > 0 : c.variances === 0 }]}
              renderRow={(c) => (
                <tr key={c.id}>
                  <td className="td font-mono text-xs">{c.id}</td>
                  <td className="td">{c.date}</td>
                  <td className="td">{c.farm}</td>
                  <td className="td text-xs">{c.by}</td>
                  <td className="td">{num(c.items, lang)}</td>
                  <td className="td">{c.variances ? <Badge tone="amber">{c.variances}</Badge> : <Badge tone="green">0</Badge>}</td>
                  {showMoney ? <td className={`td ${c.value < 0 ? "text-red-600" : ""}`}>{money(c.value, lang)}</td> : <td className="td" />}
                  <td className="td text-xs">{c.approved}</td>
                  <td className="td text-xs text-stone-500">{c.reason}</td>
                </tr>
              )}
            />
            <Note>The difference from the system balance posts as a named variance at weighted average cost (R-24), with a required reason — never silently overwriting. Write-offs / variances above an owner-set value need owner approval (FR-214).</Note>
          </Card>
        )}

        {tab === "Valuation & usage" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Inventory valuation (FR-218)">
              <Table head={["Item type", "Qty basis", "Value"]}>
                <tr><td className="td">Feed</td><td className="td text-xs">kg</td><td className="td font-medium">{money(60140, lang)}</td></tr>
                <tr><td className="td">Medicine & vaccine</td><td className="td text-xs">dose / ml</td><td className="td font-medium">{money(3448, lang)}</td></tr>
                <tr><td className="td">Semen straws</td><td className="td text-xs">straw</td><td className="td font-medium">{money(3840, lang)}</td></tr>
                <tr><td className="td">Consumables</td><td className="td text-xs">pcs</td><td className="td font-medium">{money(1040, lang)}</td></tr>
                <tr className="bg-stone-50"><td className="td font-bold">Total</td><td className="td" /><td className="td font-bold">{money(68468, lang)}</td></tr>
              </Table>
              <Note tone="green">Total always equals the stock balance in the ledger for every farm at every date (R-22, FR-720). Any mismatch is a system error raised to the owner.</Note>
            </Card>
            <Card title="Usage report (FR-220)">
              <Table head={["Item", "Used (mo)", "Cost", "Purchased"]}>
                <tr><td className="td">Napier Silage</td><td className="td">5,400 kg</td><td className="td">{money(51300, lang)}</td><td className="td">6,000 kg</td></tr>
                <tr><td className="td">Wheat Bran</td><td className="td">920 kg</td><td className="td">{money(31280, lang)}</td><td className="td">1,000 kg</td></tr>
                <tr><td className="td">FMD Vaccine</td><td className="td">28 dose</td><td className="td">{money(616, lang)}</td><td className="td">50 dose</td></tr>
              </Table>
              <Note>Quantity & cost used by item, type, period, farm, group and animal — purchases against usage for any period.</Note>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</div><div className="mt-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">{value}</div></div>;
}
