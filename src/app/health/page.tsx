"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Tabs, Note } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { TREATMENTS, VACCINE_SCHEDULE, WITHDRAWAL_ACTIVE } from "@/lib/data";
import { num, money } from "@/lib/format";

export default function HealthPage() {
  const { lang, role } = useApp();
  const [tab, setTab] = useState("Treatments");
  const [modal, setModal] = useState(false);
  const showMoney = role !== "worker";

  return (
    <div>
      <PageHeader
        module="Module C · Health"
        title="Health"
        subtitle="Treatments and vaccination schedules. Medicine, vaccines and batches live in inventory — the treatment screen shows only batches in stock on that farm, earliest expiry first."
        frs="FR-301 – FR-307"
        actions={<button className="btn-primary" onClick={() => setModal(true)}>＋ Record treatment</button>}
      />

      <FormModal
        open={modal} onClose={() => setModal(false)} wide
        title="Record treatment / vaccination" subtitle="Module C · FR-301, FR-302" saveLabel="Record"
        note="Only batches in stock on that farm are shown, earliest expiry first (FR-302). Cost comes from inventory at issue cost; a vet's fee is a separate expense line."
        fields={[
          { label: "Date", type: "date" },
          { label: "Animal or group", type: "select", options: ["COW-118 · Moyna", "Milking Shed A (14)", "Goat Shed (11)", "BULL-207 · Badshah"] },
          { label: "Reason", placeholder: "e.g. Mastitis, routine vaccination" },
          { label: "Medicine / vaccine (in stock)", type: "select", options: ["Oxytetracycline · OTC-8841", "FMD Vaccine · FMD-2026A", "PPR Vaccine (DLS) · PPR-DLS-114", "Albendazole · ALB-552"] },
          { label: "Dose", placeholder: "e.g. 20 ml / 1 bolus" },
          { label: "Withdrawal period", type: "select", options: ["None", "Milk 3 days", "Milk 4 days", "Meat 14 days"] },
          { label: "Administered by", type: "select", options: ["Dr. Nasima Akter", "Karim Sheikh", "Rahim Uddin"] },
          { label: "Vet / technician fee (৳)", type: "number", placeholder: "optional, separate line" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="daily" label="Treatments this week" value={num(TREATMENTS.length, lang)} />
        <Stat accent="account" label="Vaccinations due (7d)" value={num(VACCINE_SCHEDULE.filter((v) => v.status.includes("Due")).length, lang)} sub="escalates to owner after 48h" trend="down" />
        <Stat accent="red" label="Animals in withdrawal" value={num(WITHDRAWAL_ACTIVE.length, lang)} sub="milk / meat not saleable" />
        {showMoney && <Stat accent="money" label="Health cost (mo)" value={money(26400, lang)} sub="from inventory + vet fees" />}
      </div>

      <div className="mt-5">
        <Tabs tabs={["Treatments", "Vaccination schedule", "Withdrawal periods"]} active={tab} onChange={setTab} />

        {tab === "Treatments" && (
          <Card title="Treatment & vaccination log (FR-301)">
            <DataTable
              head={["Date", "Animal / group", "Reason", "Medicine · batch", "Dose", "Withdrawal", "By", showMoney ? "Cost" : ""]}
              rows={TREATMENTS}
              searchText={(t) => `${t.animal} ${t.reason} ${t.medicine} ${t.by}`}
              searchPlaceholder="Search treatments…"
              filters={[
                {
                  key: "withdrawal",
                  label: "Withdrawal",
                  options: ["None", "Milk", "Meat"],
                  match: (t, v) => (v === "None" ? t.withdrawal === "None" : t.withdrawal.startsWith(v)),
                },
              ]}
              renderRow={(t, i) => (
                <tr key={i}>
                  <td className="td whitespace-nowrap">{t.date}</td>
                  <td className="td">{t.animal}</td>
                  <td className="td">{t.reason}</td>
                  <td className="td text-xs">{t.medicine}</td>
                  <td className="td">{t.dose}</td>
                  <td className="td"><Badge tone={t.withdrawal === "None" ? "green" : "amber"}>{t.withdrawal}</Badge></td>
                  <td className="td text-xs">{t.by}</td>
                  {showMoney ? <td className="td">{money(t.cost, lang)}{t.vetFee ? <span className="text-xs text-stone-400"> +vet ৳{t.vetFee}</span> : ""}</td> : <td className="td" />}
                </tr>
              )}
            />
            <Note>Cost comes from inventory at issue cost (FR-209); a vet&apos;s fee is a separate expense line. Group treatments split cost equally across the animals treated (FR-306).</Note>
          </Card>
        )}

        {tab === "Vaccination schedule" && (
          <Card title="Schedule per animal / group — species defaults (FR-303)">
            <DataTable
              head={["Group / animal", "Vaccine", "Last given", "Next due", "Interval", "Status"]}
              rows={VACCINE_SCHEDULE}
              searchText={(v) => `${v.animal} ${v.vaccine}`}
              searchPlaceholder="Search schedule…"
              filters={[
                {
                  key: "status",
                  label: "Status",
                  options: ["Due", "Done", "Scheduled", "Interval TBC"],
                  match: (s, v) => (v === "Interval TBC" ? s.status.includes("TBC") : s.status.includes(v)),
                },
              ]}
              renderRow={(v, i) => (
                <tr key={i}>
                  <td className="td font-medium">{v.animal}</td>
                  <td className="td">{v.vaccine}</td>
                  <td className="td">{v.last}</td>
                  <td className="td">{v.next}</td>
                  <td className="td text-xs">{v.interval}</td>
                  <td className="td"><Badge tone={v.status.includes("Due") ? "red" : v.status.includes("Done") ? "green" : v.status.includes("TBC") ? "amber" : "gray"}>{v.status}</Badge></td>
                </tr>
              )}
            />
            <Note tone="amber">Cattle defaults: FMD, HS, anthrax, black quarter, lumpy skin disease + deworming. Goats: PPR + deworming. Intervals from a regional schedule — <b>to be confirmed by a Bangladeshi vet</b>. Reminders warn if the needed vaccine is not in stock (FR-304).</Note>
          </Card>
        )}

        {tab === "Withdrawal periods" && (
          <Card title="Active withdrawal periods (FR-305)">
            <div className="space-y-2">
              {WITHDRAWAL_ACTIVE.map((w, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                  <span className="text-xl">⛔</span>
                  <div className="flex-1"><div className="font-medium">{w.animal}</div><div className="text-xs text-red-700">{w.note}</div></div>
                  <div className="text-right"><Badge tone="red">{w.type} until {w.until}</Badge></div>
                </div>
              ))}
            </div>
            <Note tone="amber">The milk entry and milk sale screens warn when an animal is inside a withdrawal period. Selling milk from an animal under antibiotic withdrawal is the fastest way to lose a wholesale buyer permanently.</Note>
          </Card>
        )}
      </div>
    </div>
  );
}
