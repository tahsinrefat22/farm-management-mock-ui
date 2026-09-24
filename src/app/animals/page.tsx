"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Table, Tabs, Note, Spark } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { ANIMALS, FARMS, WEIGHT_HISTORY, LINEAGE, HEALTH_TIMELINE, COST_PER_ANIMAL } from "@/lib/data";
import { num, kg, money } from "@/lib/format";

export default function AnimalsPage() {
  const { lang, activeFarmIds, role } = useApp();
  const [sel, setSel] = useState<string | null>("a1");
  const [modal, setModal] = useState<null | "register" | "import" | "weight">(null);

  const list = ANIMALS.filter((a) => activeFarmIds.includes(a.farmId));
  const animal = ANIMALS.find((a) => a.id === sel) || list[0];
  const showMoney = role !== "worker" && role !== "vet";

  return (
    <div>
      <PageHeader
        module="Module A · Animals"
        title="Animals"
        subtitle="Profiles, weight history and family tree. Register with only tag, species and approximate age — the system asks for missing fields later, never at registration."
        frs="FR-101 – FR-112"
        actions={<><button className="btn-ghost" onClick={() => setModal("import")}>⬆ Bulk import (FR-112)</button><button className="btn-primary" onClick={() => setModal("register")}>＋ Register animal</button></>}
      />

      <FormModal
        open={modal === "register"} onClose={() => setModal(null)} wide
        title="Register animal" subtitle="Module A · FR-101, FR-111"
        saveLabel="Register"
        note="Partial history is fine — only tag, species and approximate age are needed. The system asks for missing fields later, never at registration (FR-111)."
        fields={[
          { label: "Tag ID (unique per farm)", placeholder: "e.g. COW-142", value: "" },
          { label: "Name (optional)", placeholder: "e.g. Lalima", value: "" },
          { label: "Farm", type: "select", options: FARMS.map((f) => f.name) },
          { label: "Species", type: "select", options: ["Cattle", "Goat"] },
          { label: "Breed", type: "select", options: ["Holstein Cross", "Sahiwal", "Brahman Cross", "Black Bengal", "Local"] },
          { label: "Sex", type: "select", options: ["Female", "Male"] },
          { label: "Date of birth / est. age", type: "date" },
          { label: "Purpose", type: "select", options: ["dairy", "fattening", "breeding", "young stock"] },
          { label: "Origin", type: "select", options: ["Born on farm", "Purchased"] },
          { label: "Purchase price (if bought)", type: "number", placeholder: "৳", hint: "Becomes the animal's opening cost (FR-102)" },
          { label: "Mother (dam) tag", placeholder: "e.g. COW-101" },
          { label: "Father (sire) / semen straw", placeholder: "e.g. AI: HF-2291" },
          { label: "Photo", type: "photo" },
        ]}
      />
      <FormModal
        open={modal === "import"} onClose={() => setModal(null)}
        title="Bulk import animals" subtitle="Module A · FR-112" saveLabel="Import"
        note="Download the spreadsheet template, fill it, and import into the chosen farm."
        fields={[
          { label: "Target farm", type: "select", options: FARMS.map((f) => f.name), col: 2 },
          { label: "Spreadsheet file", type: "photo", col: 2 },
          { label: "Template", type: "static", value: "animals_import_template.xlsx", col: 2 },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Stat accent="daily" label="Active animals" value={num(list.filter((a) => a.status === "Active").length, lang)} />
        <Stat accent="daily" label="Dairy purpose" value={num(list.filter((a) => a.purpose === "dairy").length, lang)} />
        <Stat accent="money" label="Fattening" value={num(list.filter((a) => a.purpose === "fattening").length, lang)} />
        <Stat accent="account" label="Young stock" value={num(list.filter((a) => a.purpose === "young stock").length, lang)} sub="future milkers (replacement cost)" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* List */}
        <Card className="lg:col-span-2">
          <DataTable
            head={["Animal", "Purpose", "Weight", "State"]}
            rows={list}
            searchText={(a) => `${a.tag} ${a.name ?? ""} ${a.breed}`}
            searchPlaceholder="Search tag / name…"
            filters={[
              { key: "purpose", label: "Purpose", options: ["dairy", "fattening", "breeding", "young stock"], match: (a, v) => a.purpose === v },
              { key: "status", label: "Status", options: ["Active", "Sold", "Died", "Culled"], match: (a, v) => a.status === v },
            ]}
            renderRow={(a) => (
              <tr key={a.id} onClick={() => setSel(a.id)} className={`cursor-pointer ${sel === a.id ? "bg-account-light" : "hover:bg-stone-50"}`}>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{a.photo}</span>
                    <div>
                      <div className="font-medium">{a.tag}</div>
                      <div className="text-xs text-stone-400">{a.name && a.name !== "—" ? a.name + " · " : ""}{a.breed}</div>
                    </div>
                  </div>
                </td>
                <td className="td"><Badge tone={a.purpose === "dairy" ? "green" : a.purpose === "fattening" ? "amber" : "gray"}>{a.purpose}</Badge></td>
                <td className="td whitespace-nowrap">{kg(a.weight, lang)} {a.weightStale && <Badge tone="amber">stale</Badge>}{a.weightDefault && <Badge tone="red">default</Badge>}</td>
                <td className="td text-xs">{a.status === "Active" ? a.repro || "—" : <Badge tone="gray">{a.status}</Badge>}</td>
              </tr>
            )}
          />
        </Card>

        {/* Detail */}
        {animal && <AnimalDetail id={animal.id} showMoney={showMoney} />}
      </div>
    </div>
  );
}

function AnimalDetail({ id, showMoney }: { id: string; showMoney: boolean }) {
  const { lang } = useApp();
  const a = ANIMALS.find((x) => x.id === id)!;
  const [tab, setTab] = useState("Profile");
  const [wOpen, setWOpen] = useState(false);
  const farm = FARMS.find((f) => f.id === a.farmId);
  // Use the curated breakdown when we have one; otherwise derive an illustrative
  // split from the animal's total cost so every animal's Cost tab renders.
  const cost =
    COST_PER_ANIMAL.find((c) => c.tag === a.tag) ??
    (() => {
      const total = a.costToDate;
      const bornOnFarm = !!a.motherTag && !a.tag.startsWith("BULL");
      const purchase = bornOnFarm ? 0 : Math.round(total * 0.5);
      const feed = Math.round(total * (bornOnFarm ? 0.6 : 0.3));
      const health = Math.round(total * 0.05);
      const shared = total - purchase - feed - health;
      return { tag: a.tag, purpose: a.purpose, purchase, feed, health, shared, total, note: bornOnFarm ? "Born on farm" : "" };
    })();
  const tabs = ["Profile", "Weight", "Family tree", "Health"];
  if (showMoney) tabs.push("Cost");

  return (
    <Card className="lg:col-span-3">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 text-3xl">{a.photo}</div>
        <div>
          <div className="flex items-center gap-2"><h2 className="text-lg font-bold">{a.tag}</h2>{a.name && a.name !== "—" && <span className="text-stone-500">· {a.name}</span>}</div>
          <div className="text-xs text-stone-500">{a.species} · {a.breed} · {a.sex === "F" ? "Female" : "Male"} · {farm?.name}</div>
        </div>
        <div className="ml-auto flex gap-2">
          {a.weightStale && <Badge tone="amber">Weigh soon</Badge>}
          <Badge tone={a.status === "Active" ? "green" : "gray"}>{a.status}</Badge>
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "Profile" && (
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <Info label="Tag ID (unique/farm)" value={a.tag} />
          <Info label="Date of birth" value={a.dob} />
          <Info label="Purpose — with dated history (FR-103)" value={a.purpose} />
          <Info label="Reproductive state" value={a.repro || "—"} />
          <Info label="Shed / group — moves kept with date (FR-106)" value={a.group} />
          <Info label="Weight method" value={a.weightMethod} />
          <Info label="Mother (dam)" value={a.motherTag || "—"} />
          <Info label="Father (sire)" value={a.fatherTag || "—"} />
          <Info label="Origin" value={a.tag.startsWith("CALF") || a.motherTag ? "Born on farm" : "Purchased"} />
          <div className="col-span-full">
            <Note>Purpose changes keep their date — purpose decides which cost pool the animal is in (D-06). Lifecycle exit (sold/died/culled/lost) keeps the record in history (FR-104).</Note>
          </div>
        </div>
      )}

      {tab === "Weight" && (
        <div>
          <div className="mb-3 flex items-center gap-4">
            <div><div className="text-xs text-stone-400">Latest</div><div className="stat-num">{kg(a.weight, lang)}</div></div>
            <Spark points={WEIGHT_HISTORY.map((w) => w.weight)} />
            <button className="btn-primary ml-auto" onClick={() => setWOpen(true)}>＋ Record weight</button>
          </div>
          <FormModal
            open={wOpen} onClose={() => setWOpen(false)}
            title={`Record weight — ${a.tag}`} subtitle="Module A · FR-105" saveLabel="Record"
            note="Each entry records the method (scale or tape estimate) and who recorded it. A stale weight is flagged for re-weighing (R-17)."
            fields={[
              { label: "Weight (kg)", type: "number", placeholder: "e.g. 465" },
              { label: "Method", type: "select", options: ["Scale", "Tape estimate"] },
              { label: "Date", type: "date" },
              { label: "Recorded by", type: "select", options: ["Karim Sheikh", "Jamal Miah", "Rahim Uddin"] },
            ]}
          />
          <Table head={["Date", "Weight", "Method", "Recorded by"]}>
            {WEIGHT_HISTORY.slice().reverse().map((w, i) => (
              <tr key={i}><td className="td">{w.date}</td><td className="td font-medium">{kg(w.weight, lang)}</td><td className="td"><Badge tone={w.method === "Scale" ? "green" : "gray"}>{w.method}</Badge></td><td className="td">{w.by}</td></tr>
            ))}
          </Table>
          <Note tone="amber">A weight older than the stale limit (90 d dairy/breeding, 14 d fattening) is still used but flagged (R-17). Missing weight uses a species/stage default and marks dependent figures (R-16, D-08).</Note>
        </div>
      )}

      {tab === "Family tree" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-stone-400">Ancestors (3 generations up)</div>
            {LINEAGE.ancestors.map((x, i) => (
              <div key={i} className="mb-2 rounded-lg border border-stone-100 px-3 py-2 text-sm"><div className="font-medium">{x.rel}: {x.tag}</div><div className="text-xs text-stone-500">{x.note}</div></div>
            ))}
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-stone-400">Offspring (down)</div>
            {LINEAGE.offspring.map((x, i) => (
              <div key={i} className="mb-2 rounded-lg border border-stone-100 px-3 py-2 text-sm"><div className="font-medium">{x.rel}: {x.tag}</div><div className="text-xs text-stone-500">{x.note}</div></div>
            ))}
            <Note>Lineage view of at least three generations up and down, each ancestor with a short health &amp; performance summary (FR-108). Links work across farms of the same account (FR-107). Planned close-breeding is warned (FR-109). Newborns link to parents automatically at birth (FR-410).</Note>
          </div>
        </div>
      )}

      {tab === "Health" && (
        <div>
          <div className="relative ml-2 border-l-2 border-stone-200 pl-4">
            {HEALTH_TIMELINE.map((h, i) => (
              <div key={i} className="mb-3">
                <div className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-daily" />
                <div className="text-xs text-stone-400">{h.date}</div>
                <div className="text-sm"><Badge tone={h.kind === "Vaccine" ? "blue" : h.kind === "Birth" ? "purple" : "gray"}>{h.kind}</Badge> {h.text}</div>
              </div>
            ))}
          </div>
          <Note>Health timeline covers treatments, vaccinations and weight changes (FR-307).</Note>
        </div>
      )}

      {tab === "Cost" && cost && (
        <div>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 text-sm">
            <Info label="Purchase / opening" value={money(cost.purchase, lang)} />
            <Info label="Feed issued" value={money(cost.feed, lang)} />
            <Info label="Treatments & straws" value={money(cost.health, lang)} />
            <Info label="Share of shared cost" value={money(cost.shared, lang)} />
          </div>
          <div className="rounded-xl bg-account p-4 text-white">
            <div className="text-xs uppercase opacity-80">Total cost to date (R-04)</div>
            <div className="text-2xl font-bold">{money(cost.total, lang)}</div>
            {cost.note && <div className="text-xs opacity-80">{cost.note}</div>}
          </div>
          <div className="mt-3">
            <Note>Every figure opens down to the transactions behind it (FR-906). Shared cost split by cost units × days active (R-03).</Note>
          </div>
        </div>
      )}
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-stone-400">{label}</div>
      <div className="mt-0.5 font-medium text-stone-800">{value}</div>
    </div>
  );
}
