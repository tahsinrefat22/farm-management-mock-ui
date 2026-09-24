"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Table, Tabs, Note } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { FARMS, USERS, ROLE_MATRIX, ACCOUNT } from "@/lib/data";
import { num } from "@/lib/format";

export default function FarmsPage() {
  const { lang } = useApp();
  const [tab, setTab] = useState("Farms");
  const [modal, setModal] = useState<null | "farm" | "user">(null);

  const farmForm = (
    <FormModal
      open={modal === "farm"} onClose={() => setModal(null)} wide
      title="Create farm" subtitle="Module 0 · FR-001, FR-005, NFR-18" saveLabel="Create farm"
      note="Settings default from account level and can be overridden per farm (FR-005). Copy settings from an existing farm to reach first milk entry in under 5 minutes (NFR-18)."
      fields={[
        { label: "Farm name", placeholder: "e.g. Padma Dairy" },
        { label: "Location", placeholder: "e.g. Kushtia" },
        { label: "Type", type: "select", options: ["dairy", "fattening", "mixed"] },
        { label: "Copy settings from", type: "select", options: ["— none —", ...FARMS.map((f) => f.name)] },
        { label: "Species at launch", type: "select", options: ["Cattle", "Goat", "Cattle & Goat"] },
        { label: "Cost unit mode", type: "select", options: ["Weight-based (default)", "Stage table", "Equal split"] },
      ]}
    />
  );
  const userForm = (
    <FormModal
      open={modal === "user"} onClose={() => setModal(null)}
      title="Add user / assign role" subtitle="Module 0 · FR-003 · §2.2" saveLabel="Send invite"
      note="Roles are assigned per farm. Vets and buyers get an expiring, unguessable link — no account (NFR-14)."
      fields={[
        { label: "Name", placeholder: "Full name" },
        { label: "Role", type: "select", options: ["Farm manager", "Worker / milker", "Veterinarian", "Qurbani buyer"] },
        { label: "Assign farms", type: "select", options: ["All farms", ...FARMS.map((f) => f.name)] },
        { label: "Mobile / link", placeholder: "+8801…" },
        { label: "Link expiry (vet/buyer)", type: "select", options: ["7 days", "14 days", "30 days"] },
      ]}
    />
  );

  return (
    <div>
      <PageHeader
        module="Module 0 · Farms & accounts"
        title="Farms & Accounts"
        subtitle="One owner, any number of farms. Every record belongs to exactly one farm; customers, suppliers and the item list are shared at account level. Staff get access farm by farm."
        frs="FR-001 – FR-010 · D-01, D-03"
        actions={<button className="btn-primary" onClick={() => setModal("farm")}>＋ Create farm</button>}
      />
      {farmForm}
      {userForm}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="account" label="Farms" value={num(ACCOUNT.farms, lang)} sub="no limit per account (D-03)" />
        <Stat accent="account" label="Total animals" value={num(ACCOUNT.totalAnimals, lang)} />
        <Stat accent="account" label="Fiscal year" value={<span className="text-base">{ACCOUNT.fiscalYear}</span>} sub="configurable per account" />
        <Stat accent="account" label="Users" value={num(USERS.length, lang)} sub="roles assigned per farm" />
      </div>

      <div className="mt-5">
        <Tabs tabs={["Farms", "Users & roles", "Transfers", "Shared settings"]} active={tab} onChange={setTab} />

        {tab === "Farms" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {FARMS.map((f) => (
              <Card key={f.id}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: f.color + "22" }}>🚜</div>
                  <div>
                    <div className="font-bold text-stone-900">{lang === "bn" ? f.nameBn : f.name}</div>
                    <div className="text-xs text-stone-500">{f.location}</div>
                  </div>
                  <Badge tone={f.type === "dairy" ? "green" : f.type === "fattening" ? "amber" : "blue"}>{f.type}</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-stone-50 p-2"><dt className="text-stone-400">Animals</dt><dd className="font-semibold">{num(f.animals, lang)}</dd></div>
                  <div className="rounded-lg bg-stone-50 p-2"><dt className="text-stone-400">Own animals, stock, staff & ledger (FR-002)</dt><dd className="font-semibold">Yes · never mixed</dd></div>
                </dl>
                <div className="mt-3 flex gap-2">
                  <button className="btn-ghost flex-1 text-xs">Open</button>
                  <button className="btn-ghost flex-1 text-xs">Settings</button>
                </div>
              </Card>
            ))}
            <Card className="border-2 border-dashed border-stone-300 bg-stone-50/50">
              <button onClick={() => setModal("farm")} className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 text-stone-400">
                <span className="text-3xl">＋</span>
                <span className="text-sm font-medium">Add a farm</span>
                <span className="text-xs">Copy settings from existing — ready in &lt;5 min (NFR-18)</span>
              </button>
            </Card>
          </div>
        )}

        {tab === "Users & roles" && (
          <div className="space-y-4">
            <Card title="Farm memberships (FR-003)" right={<button className="btn-primary text-xs" onClick={() => setModal("user")}>＋ Add user</button>}>
              <DataTable
                head={["User", "Role", "Farms", "Contact", "Access", "Status"]}
                rows={USERS}
                searchText={(u) => `${u.name} ${u.role} ${u.access}`}
                searchPlaceholder="Search name, role or access…"
                filters={[
                  {
                    key: "role",
                    label: "Role",
                    options: ["Owner", "Farm manager", "Worker / milker", "Veterinarian", "Qurbani buyer"],
                    match: (u, v) => u.role === v,
                  },
                  {
                    key: "status",
                    label: "Status",
                    options: ["Active", "Link (expires)", "Invited"],
                    match: (u, v) => u.status === v,
                  },
                ]}
                renderRow={(u) => (
                  <tr key={u.id}>
                    <td className="td font-medium">{u.name}</td>
                    <td className="td"><Badge tone={u.role === "Owner" ? "purple" : u.role.includes("manager") ? "blue" : u.role.includes("Worker") ? "green" : "gray"}>{u.role}</Badge></td>
                    <td className="td">{u.farms.includes("all") ? "All farms" : u.farms.map((id) => FARMS.find((f) => f.id === id)?.name).join(", ")}</td>
                    <td className="td text-xs">{u.phone === "link" ? <Badge tone="amber">Expiring link</Badge> : u.phone}</td>
                    <td className="td text-xs text-stone-500">{u.access}</td>
                    <td className="td text-xs">{u.status}</td>
                  </tr>
                )}
              />
              <Note>Vets and buyers reach the system by an expiring, unguessable link — no account (§2.2, NFR-14). A worker&apos;s screen never shows money; nobody deletes a posted transaction.</Note>
            </Card>

            <Card title="What each role can and cannot do (§2.2)">
              <DataTable
                head={["Role", "Works", "Can do", "Cannot do"]}
                rows={ROLE_MATRIX}
                searchText={(r) => `${r.role} ${r.can} ${r.cannot}`}
                searchPlaceholder="Search role or permission…"
                renderRow={(r) => (
                  <tr key={r.role}>
                    <td className="td font-semibold whitespace-nowrap">{r.role}</td>
                    <td className="td text-xs text-stone-500">{r.where}</td>
                    <td className="td text-xs">{r.can}</td>
                    <td className="td text-xs text-red-600">{r.cannot}</td>
                  </tr>
                )}
              />
            </Card>
          </div>
        )}

        {tab === "Transfers" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card accent="account" title="Transfer an animal (FR-006)">
              <div className="space-y-3 text-sm">
                <Field label="Animal" value="COW-118 · Moyna (Shapla Dairy)" />
                <Field label="To farm" value="Rupsha Mixed Farm" />
                <Field label="Transfer date" value="24 Sep 2026" />
                <Note tone="green">Full history and accumulated cost (৳96,500) move with the animal. Each farm&apos;s reports show it only for the days it was there.</Note>
                <button className="btn-primary w-full">Transfer animal</button>
              </div>
            </Card>
            <Card accent="money" title="Transfer stock / cash (FR-007)">
              <div className="space-y-3 text-sm">
                <Field label="Item / cash" value="Wheat Bran — 100 kg" />
                <Field label="From → To" value="Shapla → Rupsha" />
                <Field label="Value (sending farm avg cost)" value="৳3,400 (@ ৳34/kg)" />
                <Note tone="amber">Recorded on both sides. Excluded from consolidated income & expense (FR-716) so it never appears as profit or cost at account level.</Note>
                <button className="btn-primary w-full">Record transfer</button>
              </div>
            </Card>
          </div>
        )}

        {tab === "Shared settings" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card accent="account" title="Account-level, shared by every farm (FR-008)">
              <ul className="space-y-2 text-sm">
                {["Inventory item list (names, units, conversions)", "Customers & suppliers", "Money accounts (cash, bank, bKash, Nagad)", "Default settings & calculation rules", "Fiscal year (Jul–Jun)"].map((x) => (
                  <li key={x} className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">✅ {x}</li>
                ))}
              </ul>
            </Card>
            <Card accent="account" title="Account-level expenses (FR-009)">
              <p className="mb-3 text-sm text-stone-500">Costs that serve several farms are allocated to farms by rule R-18.</p>
              <Table head={["Expense", "Amount", "Allocation"]}>
                <tr><td className="td">Shared staff</td><td className="td">৳24,000</td><td className="td text-xs">By cost units × days</td></tr>
                <tr><td className="td">Owner&apos;s vehicle</td><td className="td">৳8,000</td><td className="td text-xs">Fixed % per farm</td></tr>
                <tr><td className="td">Accountant</td><td className="td">৳5,000</td><td className="td text-xs">By cost units × days</td></tr>
              </Table>
              <Note>Settings default from account level and can be overridden per farm (FR-005).</Note>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</div>
      <div className="mt-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">{value}</div>
    </div>
  );
}
