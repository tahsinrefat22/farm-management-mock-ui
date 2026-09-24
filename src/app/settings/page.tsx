"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Badge, Tabs, Note } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { CALC_RULES, DEFAULT_VALUES, SPECIES_CONFIG } from "@/lib/data";

const DECISIONS = [
  ["D-01", "Multiple farms", "One account owns any number of farms; every view shown for one/selected/all farms."],
  ["D-02", "Connectivity", "V1 is online; tolerates slow/dropped connections without losing data. Offline later."],
  ["D-03", "Farm size", "No limit on farms/animals/users per farm."],
  ["D-04", "Shared costs", "Split by cost units × days active; units from weight by default."],
  ["D-05", "Dry cows", "Cost while dry is carried forward to next lactation."],
  ["D-06", "Dairy cost scope", "Cost per litre counts dairy-purpose only; fattening excluded; young stock separate."],
  ["D-07", "Milk income", "Per-animal income = actual revenue shared by litres produced."],
  ["D-08", "Missing weights", "Uses default weight; every dependent figure marked."],
  ["D-09", "Feed", "Actual feed recorded; weight only splits group feed."],
  ["D-10", "Purchases & cost", "Purchase = stock, not expense. Cost when used/lost/written off (IAS 2)."],
  ["D-11", "Stock valuation", "Weighted average cost per item per farm; includes delivery & handling."],
  ["D-12", "Equipment", "Listed for tracking; cost expensed in month bought. No depreciation this release."],
  ["D-13", "Accounting scope", "Management accounting; animals are biological assets, outside IAS 2."],
];

const PRINCIPLES = [
  "Daily entry comes first — every daily screen must be fast and never lose what was typed.",
  "Estimates are labelled as estimates — a calculated figure is never used as evidence against itself.",
  "Never block, record and ask — an entry that looks wrong is saved and queued, not rejected.",
  "Money always traces to a record — every figure opens down to its transactions.",
  "Nothing is deleted — corrections are new entries, attributed and timestamped.",
  "Totals must reconcile — per-animal → per-farm → account; stock value = ledger balance.",
  "Spending is not cost — buying feed is spending; cost arrives as feed is used.",
  "Defaults are honest — every default states its source; sourceless ones are marked assumptions.",
];

const NFRS = [
  ["NFR-01", "Entry speed", "25-animal milking session < 90 s; feed entry < 30 s"],
  ["NFR-02", "Connectivity", "Online v1; typed data kept on device & auto-submitted; nothing lost"],
  ["NFR-03", "Offline-ready", "Client IDs, idempotent writes, device+server timestamps"],
  ["NFR-04", "Conflicts", "Two entries of same thing → both kept, raised as variance"],
  ["NFR-05", "Device", "Android 9, 2 GB RAM; install < 60 MB"],
  ["NFR-06", "Slow networks", "Daily screens load/submit on 3G within 5 s; photos upload in background"],
  ["NFR-07", "Scale", "1,000 animals & 500 items responsive; ledger filters < 3 s over 100k entries"],
  ["NFR-08", "Language", "Full Bangla & English, switchable per user, Bangla default"],
  ["NFR-09", "Numerals", "Bangla & English numerals accepted & selectable"],
  ["NFR-10", "Literacy", "Every daily action by icons & numbers; item photos"],
  ["NFR-11", "Audit", "Every create/update/reversal records actor, farm, device, time, prior value"],
  ["NFR-12", "Access control", "Role & farm permissions enforced on server, not just UI"],
  ["NFR-13", "Transactional integrity", "Stock movement & its ledger entry saved together or not at all"],
  ["NFR-14", "Share links", "Unguessable tokens, single scope, expiring"],
  ["NFR-15", "Backup", "Daily backup, documented restore, stated RPO"],
  ["NFR-16", "Availability", "99.5% monthly; maintenance outside milking hours"],
  ["NFR-17", "Peak load", "Eid season 10× booking & SMS traffic"],
  ["NFR-18", "Onboarding", "New farm to first milk entry < 20 min; 2nd farm < 5 min"],
  ["NFR-19", "Measurement", "Records entries delayed by lost connection, per farm"],
  ["NFR-20", "Support", "In-app support captures device state & last error"],
];

export default function SettingsPage() {
  const { role } = useApp();
  const [tab, setTab] = useState("Species config");

  if (role !== "owner") {
    return <div className="mx-auto max-w-lg pt-10 text-center"><div className="text-5xl">🔒</div><h1 className="mt-3 text-lg font-bold">Owner only</h1><p className="mt-2 text-sm text-stone-500">Managing settings & rules is restricted to the account owner.</p></div>;
  }

  return (
    <div>
      <PageHeader
        module="Settings & rules"
        title="Settings, Defaults & Calculation Rules"
        subtitle="The single source of truth for every calculated figure. Every default is configurable and states where it came from — sourced, from the earlier spec, from the brief, or an assumption to validate."
        frs="§5 Calculation rules · §5.6 Defaults · §1.4–1.5 · §7 NFRs"
      />

      <Tabs tabs={["Species config", "Calculation rules", "Default values", "Decisions log", "Design principles", "Non-functional"]} active={tab} onChange={setTab} />

      {tab === "Species config" && (
        <Card title="Species & breed configuration (FR-110)">
          <DataTable
            head={["Species", "Gestation", "Heat cycle", "Dry-off", "Cost unit mode", "Default adult weight", "Weigh interval", "Qurbani shares"]}
            rows={SPECIES_CONFIG}
            searchText={(s) => s.species}
            renderRow={(s) => (
              <tr key={s.species}>
                <td className="td font-medium">{s.species}</td>
                <td className="td">{s.gestation}</td>
                <td className="td">{s.heat}</td>
                <td className="td">{s.dryOff}</td>
                <td className="td text-xs">{s.costUnit}</td>
                <td className="td">{s.defWeightAdult}</td>
                <td className="td">{s.weighInterval}</td>
                <td className="td">{s.qurbaniShares}</td>
              </tr>
            )}
          />
          <Note>New species are added by configuration, without code changes (FR-110). Gestation can be set per breed. Cost unit mode: weight-based (default), stage table, or equal split (D-04).</Note>
        </Card>
      )}

      {tab === "Calculation rules" && (
        <Card title="Calculation rules R-01 – R-25 (§5)">
          <DataTable
            head={["Rule", "Figure", "Formula"]}
            rows={CALC_RULES}
            searchText={(r) => `${r.id} ${r.figure} ${r.formula}`}
            renderRow={(r) => (
              <tr key={r.id}>
                <td className="td font-mono text-xs font-semibold text-account">{r.id}</td>
                <td className="td font-medium">{r.figure}</td>
                <td className="td text-xs text-stone-600">{r.formula}</td>
              </tr>
            )}
          />
          <Note tone="green">Reconciliation guarantee: every allocation rule divides an actual recorded amount, so per-animal figures always add up to the farm total, and farm totals to the account total. Stock value always equals the ledger stock balance.</Note>
        </Card>
      )}

      {tab === "Default values" && (
        <Card title="Default values & their sources (§5.6) — every default is configurable">
          <DataTable
            head={["Setting", "Default", "Status", "Basis"]}
            rows={DEFAULT_VALUES}
            searchText={(d) => `${d.setting} ${d.basis}`}
            filters={[{ key: "status", label: "Status", options: ["Sourced", "Earlier spec", "Brief", "Assumption"], match: (d, v) => d.status === v }]}
            renderRow={(d) => (
              <tr key={d.setting}>
                <td className="td font-medium">{d.setting}</td>
                <td className="td">{d.value}</td>
                <td className="td"><Badge tone={d.status === "Sourced" ? "green" : d.status === "Assumption" ? "red" : d.status === "Brief" ? "purple" : "blue"}>{d.status}</Badge></td>
                <td className="td text-xs text-stone-500">{d.basis}</td>
              </tr>
            )}
          />
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge tone="green">Sourced — published source</Badge>
            <Badge tone="blue">Earlier spec</Badge>
            <Badge tone="purple">Brief</Badge>
            <Badge tone="red">Assumption to validate</Badge>
          </div>
        </Card>
      )}

      {tab === "Decisions log" && (
        <Card title="Decisions log (§1.5) — each binding on the requirements until revised">
          <DataTable
            head={["ID", "Topic", "Decision"]}
            rows={DECISIONS}
            searchText={(d) => d.join(" ")}
            renderRow={(d) => (
              <tr key={d[0]}><td className="td font-mono text-xs font-semibold text-account">{d[0]}</td><td className="td font-medium whitespace-nowrap">{d[1]}</td><td className="td text-xs text-stone-600">{d[2]}</td></tr>
            )}
          />
        </Card>
      )}

      {tab === "Design principles" && (
        <Card title="Design principles (§1.4) — decide trade-offs wherever a requirement is unclear">
          <ol className="space-y-2">
            {PRINCIPLES.map((p, i) => (
              <li key={i} className="flex gap-3 rounded-lg bg-stone-50 px-3 py-2 text-sm"><span className="font-bold text-account">{i + 1}</span><span>{p}</span></li>
            ))}
          </ol>
        </Card>
      )}

      {tab === "Non-functional" && (
        <Card title="Non-functional requirements (§7)">
          <DataTable
            head={["ID", "Area", "Requirement"]}
            rows={NFRS}
            searchText={(n) => n.join(" ")}
            renderRow={(n) => (
              <tr key={n[0]}><td className="td font-mono text-xs font-semibold text-insight">{n[0]}</td><td className="td font-medium whitespace-nowrap">{n[1]}</td><td className="td text-xs text-stone-600">{n[2]}</td></tr>
            )}
          />
        </Card>
      )}
    </div>
  );
}
