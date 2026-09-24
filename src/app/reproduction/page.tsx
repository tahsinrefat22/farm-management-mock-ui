"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Tabs, Note } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { REPRO_STATES, REPRO_TASKS, BREEDING_PERF } from "@/lib/data";
import { num } from "@/lib/format";

const STAGES = ["Open", "Served", "Pregnant", "Near delivery", "Delivered", "Open"];

export default function ReproductionPage() {
  const { lang } = useApp();
  const [tab, setTab] = useState("Pipeline");
  const [modal, setModal] = useState<null | "breeding" | "birth">(null);

  return (
    <div>
      <PageHeader
        module="Module D · Reproduction"
        title="Reproduction"
        subtitle="Each female is always in exactly one reproductive state. Every change of state creates the next task automatically, with a date."
        frs="FR-401 – FR-413 · R-14"
        actions={<button className="btn-primary" onClick={() => setModal("breeding")}>＋ Record breeding</button>}
      />

      <FormModal
        open={modal === "breeding"} onClose={() => setModal(null)} wide
        title="Record breeding" subtitle="Module D · FR-403, FR-405" saveLabel="Record breeding"
        note="Moves the animal to Served. For AI, the straw is issued from inventory and its cost charged to the animal; a technician's fee is a separate expense line. Expected delivery = breeding date + gestation (R-14)."
        fields={[
          { label: "Female animal", type: "select", options: ["COW-115 · Tara", "GOAT-308", "COW-120"] },
          { label: "Date", type: "date" },
          { label: "Method", type: "select", options: ["AI (artificial insemination)", "Natural"] },
          { label: "Bull / semen straw", type: "select", options: ["HF Semen Straw · HF-2291", "Bull: SW-11", "Buck: BB-3"] },
          { label: "Technician", type: "select", options: ["AI Tech (DLS)", "Dr. Nasima Akter", "—"] },
          { label: "Technician fee (৳)", type: "number", placeholder: "optional, separate line" },
        ]}
      />
      <FormModal
        open={modal === "birth"} onClose={() => setModal(null)} wide
        title="Record birth" subtitle="Module D · FR-409, FR-410" saveLabel="Record birth"
        note="Recording a birth closes the dry period and opens a new lactation. Every live newborn is registered as an animal automatically — mother, father, species, farm and DOB pre-filled (FR-410)."
        fields={[
          { label: "Mother", type: "select", options: ["GOAT-301 · Chuti", "COW-103 · Rani", "COW-102 · Shona"] },
          { label: "Date", type: "date" },
          { label: "Number born", type: "number", value: "2", hint: "Goats often twin or triplet" },
          { label: "Young 1 — sex / outcome / weight", placeholder: "Female · live · 1.2 kg", col: 2 },
          { label: "Young 2 — sex / outcome / weight", placeholder: "Male · live · 1.1 kg", col: 2 },
          { label: "Complication (if any)", type: "textarea", placeholder: "optional" },
        ]}
      />

      {/* State pipeline */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          {STAGES.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className={`chip ${["Pregnant", "Near delivery"].includes(s) ? "bg-purple-100 text-purple-700" : "bg-account-light text-account"}`}>{s}</span>
              {i < STAGES.length - 1 && <span className="text-stone-300">→</span>}
            </div>
          ))}
          <span className="ml-3 text-xs text-stone-400">Observed heat is recorded and the next heat scheduled while open (FR-402). A negative check or lost pregnancy returns the animal to Open, keeping the record in history (FR-411).</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="daily" label="Open (ready)" value={num(REPRO_STATES.filter((r) => r.state === "Open").length, lang)} />
        <Stat accent="account" label="Pregnant" value={num(REPRO_STATES.filter((r) => r.state === "Pregnant").length, lang)} />
        <Stat accent="account" label="Dry" value={num(REPRO_STATES.filter((r) => r.state === "Dry").length, lang)} sub="dry-period cost carrying (D-05)" />
        <Stat accent="daily" label="Tasks next 7 days" value={num(REPRO_TASKS.length, lang)} />
      </div>

      <div className="mt-5">
        <Tabs tabs={["Pipeline", "Task calendar", "Breeding performance", "Births"]} active={tab} onChange={setTab} />

        {tab === "Pipeline" && (
          <Card title="Every female's current state (FR-401)">
            <DataTable
              head={["Animal", "State", "Detail", "Next task"]}
              rows={REPRO_STATES}
              searchText={(r) => `${r.tag} ${r.detail}`}
              searchPlaceholder="Search animals…"
              filters={[
                {
                  key: "state",
                  label: "State",
                  options: ["Open", "Served", "Pregnant", "Near delivery", "Milking", "Dry"],
                  match: (r, v) => r.state === v,
                },
              ]}
              renderRow={(r) => (
                <tr key={r.tag}>
                  <td className="td font-medium">{r.tag}</td>
                  <td className="td"><Badge tone={r.state === "Pregnant" ? "purple" : r.state === "Milking" ? "green" : r.state === "Dry" ? "amber" : "blue"}>{r.state}</Badge></td>
                  <td className="td text-xs">{r.detail}</td>
                  <td className="td text-xs text-stone-500">{r.next}</td>
                </tr>
              )}
            />
            <Note>Expected delivery = breeding date + gestation (cattle 280 d, goat 146 d; per breed) — R-14. Pregnancy timeline lists every medicine, vaccine, treatment and weight during the pregnancy (FR-406).</Note>
          </Card>
        )}

        {tab === "Task calendar" && (
          <Card title="Today & next 7 days — all reproductive tasks (FR-413)">
            <div className="space-y-2">
              {REPRO_TASKS.map((tk, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-stone-100 px-3 py-2">
                  <Badge tone={tk.date === "Today" ? "green" : "gray"}>{tk.date}</Badge>
                  <span className="text-lg">{tk.type === "delivery" ? "🐣" : tk.type === "breeding" ? "🧬" : tk.type === "dryoff" ? "🥛" : tk.type === "vaccine" ? "💉" : "🔎"}</span>
                  <div className="flex-1"><div className="text-sm font-medium">{tk.task}</div><div className="text-xs text-stone-500">{tk.animal} · {tk.farm}</div></div>
                  <button className="btn-ghost text-xs">Record result</button>
                </div>
              ))}
            </div>
            <Note tone="amber">A pregnancy-check task is created a configurable number of days after breeding (default 45, FR-404). Delivery reminders fire 30 and 20 days before, and on the date itself (FR-407). Dry-off task defaults to 60 days before delivery for cattle (FR-408).</Note>
          </Card>
        )}

        {tab === "Breeding performance" && (
          <Card title="Per-animal breeding performance (FR-412)">
            <DataTable
              head={["Animal", "Days open", "Calving interval", "Services / pregnancy"]}
              rows={BREEDING_PERF}
              searchText={(b) => `${b.tag}`}
              searchPlaceholder="Search animals…"
              renderRow={(b) => (
                <tr key={b.tag}><td className="td font-medium">{b.tag}</td><td className="td">{num(b.daysOpen, lang)}</td><td className="td">{b.calvingInterval}</td><td className="td">{num(b.servicesPerPreg, lang, 1)}</td></tr>
              )}
            />
          </Card>
        )}

        {tab === "Births" && (
          <Card title="Record a birth (FR-409, FR-410)">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <F label="Mother" value="GOAT-301 · Chuti" />
                <F label="Date" value="3 Dec 2026 (expected)" />
                <F label="Number born" value="2 (goats often twin)" />
                <div className="grid grid-cols-2 gap-2">
                  <F label="Young 1" value="Female · live · 1.2 kg" />
                  <F label="Young 2" value="Male · live · 1.1 kg" />
                </div>
                <button className="btn-primary w-full" onClick={() => setModal("birth")}>Record birth</button>
              </div>
              <Note tone="green">Recording a birth closes the dry period and opens a new lactation. Every live newborn is registered as an animal automatically — mother, father, species, farm and DOB pre-filled (FR-410).</Note>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</div><div className="mt-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">{value}</div></div>;
}
