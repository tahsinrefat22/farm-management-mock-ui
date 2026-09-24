"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, Stat, Badge, Table, Tabs, Note } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { FormModal } from "@/components/Modal";
import { FEED_GROUPS, FEED_ALLOCATION } from "@/lib/data";
import { num, kg, money } from "@/lib/format";

export default function FeedingPage() {
  const { lang, role } = useApp();
  const [tab, setTab] = useState("Feed given");
  const [modal, setModal] = useState(false);
  const showMoney = role !== "worker";

  return (
    <div>
      <PageHeader
        module="Module B · Feeding"
        title="Feed given & allocation"
        subtitle="Record the actual feed given each day (per group or per animal). Each entry issues that feed from inventory. Body weight only splits group feed among animals — it never judges whether an animal is eating less."
        frs="FR-251 – FR-257 · D-09 · R-01, R-02"
        actions={<button className="btn-primary" onClick={() => setModal(true)}>＋ Feed round</button>}
      />

      <FormModal
        open={modal} onClose={() => setModal(false)} wide
        title="Record feed round" subtitle="Module B · FR-251, FR-252" saveLabel="Issue feed"
        note="Each feed round issues stock from that farm's inventory (FR-209). Group feeding splits by weight × stage rate (R-01); individual feeding uses the recorded amount directly."
        fields={[
          { label: "Farm", type: "select", options: ["Shapla Dairy", "Green Feedlot", "Rupsha Mixed Farm"] },
          { label: "Group / shed", type: "select", options: ["Milking Shed A", "Milking Shed B", "Dry Shed", "Fattening Pen 1"] },
          { label: "Feeding mode", type: "select", options: ["Group", "Individual"] },
          { label: "Date", type: "date" },
          { label: "Napier Silage (kg)", type: "number", value: "180", hint: "Pre-filled from yesterday" },
          { label: "Wheat Bran (kg)", type: "number", value: "42", hint: "Pre-filled from yesterday" },
          { label: "Oil Cake (kg)", type: "number", value: "18", hint: "Pre-filled from yesterday" },
          { label: "Note", type: "text", placeholder: "optional" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat accent="daily" label="Groups fed today" value={num(FEED_GROUPS.length, lang)} sub="pre-filled from yesterday (FR-252)" />
        {showMoney && <Stat accent="money" label="Feed cost today" value={money(FEED_GROUPS.reduce((s, g) => s + g.costDay, 0), lang)} sub="issued at weighted-avg cost" />}
        <Stat accent="account" label="Weight flags" value={num(FEED_ALLOCATION.filter((r) => r.flag).length, lang)} sub="default / stale weights used" trend="down" />
      </div>

      <div className="mt-5">
        <Tabs tabs={["Feed given", "Per-animal allocation", "Given vs predicted"]} active={tab} onChange={setTab} />

        {tab === "Feed given" && (
          <Card title="Today's feed rounds — confirm in one tap (FR-252)">
            <DataTable
              head={["Group / farm", "Mode", "Animals", "Silage kg", "Bran kg", "Cake kg", showMoney ? "Cost" : "", "Action"]}
              rows={FEED_GROUPS}
              searchText={(g) => `${g.group} ${g.farm}`}
              searchPlaceholder="Search groups…"
              filters={[
                { key: "mode", label: "Mode", options: ["Group", "Individual"], match: (g, v) => g.mode === v },
                { key: "farm", label: "Farm", options: ["Shapla Dairy", "Green Feedlot", "Rupsha Mixed Farm"], match: (g, v) => g.farm === v },
              ]}
              renderRow={(g) => (
                <tr key={g.group}>
                  <td className="td"><div className="font-medium">{g.group}</div><div className="text-xs text-stone-400">{g.farm}</div></td>
                  <td className="td"><Badge tone={g.mode === "Group" ? "blue" : "green"}>{g.mode}</Badge></td>
                  <td className="td">{num(g.animals, lang)}</td>
                  <td className="td">{num(g.silage, lang)}</td>
                  <td className="td">{num(g.bran, lang)}</td>
                  <td className="td">{num(g.cake, lang)}</td>
                  {showMoney ? <td className="td font-medium">{money(g.costDay, lang)}</td> : <td className="td" />}
                  <td className="td">{g.prevSame ? <button className="btn-ghost text-xs">✓ Same as yesterday</button> : <button className="btn-primary text-xs">Edit & save</button>}</td>
                </tr>
              )}
            />
            <Note tone="green">Each feed round issues stock from that farm&apos;s inventory (FR-209), so nobody records usage twice. Group feeding is allocated (FR-253); <b>individual feeding uses the recorded amount per animal directly, no allocation (FR-254)</b>. A normal day&apos;s feed entry completes in under 30 seconds (NFR-01).</Note>
          </Card>
        )}

        {tab === "Per-animal allocation" && (
          <Card title="Group feed split by weight × stage rate (FR-253 · R-01) · cost per animal (FR-255 · R-02)">
            <DataTable
              head={["Animal", "Weight", "Stage rate", "Share", "Silage kg", showMoney ? "Feed cost/day (R-02)" : "", "Note"]}
              rows={FEED_ALLOCATION}
              searchText={(r) => r.tag}
              searchPlaceholder="Search animal…"
              filters={[{ key: "flag", label: "Weight flag", options: ["Default weight", "Stale weight", "OK"], match: (r, v) => v === "OK" ? !r.flag : r.flag === v }]}
              renderRow={(r) => (
                <tr key={r.tag}>
                  <td className="td font-medium">{r.tag}</td>
                  <td className="td">{kg(r.weight, lang)}</td>
                  <td className="td">{num(r.stageRate, lang, 1)}%</td>
                  <td className="td">{r.share}</td>
                  <td className="td">{num(r.silage, lang, 1)}</td>
                  {showMoney ? <td className="td font-medium">{money(r.cost, lang)}</td> : <td className="td" />}
                  <td className="td">{r.flag && <Badge tone={r.flag.includes("Default") ? "red" : "amber"}>{r.flag}</Badge>}</td>
                </tr>
              )}
            />
            <Note tone="amber">Allocated feed is an <b>estimate</b> and is labelled everywhere it appears. Animals on default/stale weights are listed in the attention list with a prompt to weigh them (FR-257).</Note>
          </Card>
        )}

        {tab === "Given vs predicted" && (
          <Card title="Consistency check (FR-256)">
            <Table head={["Group", "Given (7-day avg)", "Predicted from weights", "Gap", "Flag"]}>
              <tr><td className="td font-medium">Milking Shed A</td><td className="td">180 kg</td><td className="td">176 kg</td><td className="td">+2%</td><td className="td"><Badge tone="green">OK</Badge></td></tr>
              <tr><td className="td font-medium">Milking Shed B</td><td className="td">110 kg</td><td className="td">128 kg</td><td className="td">-14%</td><td className="td"><Badge tone="amber">Consistent gap — review</Badge></td></tr>
              <tr><td className="td font-medium">Fattening Pen 1</td><td className="td">240 kg</td><td className="td">232 kg</td><td className="td">+3%</td><td className="td"><Badge tone="green">OK</Badge></td></tr>
            </Table>
            <Note>Underperformance is judged from <b>output</b> (milk & weight gain) in Profitability, never from the allocated feed figure (D-09).</Note>
          </Card>
        )}
      </div>
    </div>
  );
}
