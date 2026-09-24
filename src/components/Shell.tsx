"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp, Role } from "@/context/AppContext";
import { FARMS } from "@/lib/data";
import { t } from "@/lib/i18n";

const NAV: { group: string; groupBn: string; accent: string; items: { href: string; key: string; icon: string; roles: Role[] }[] }[] = [
  {
    group: "Account structure", groupBn: "অ্যাকাউন্ট", accent: "bg-account",
    items: [
      { href: "/", key: "dashboard", icon: "📊", roles: ["owner"] },
      { href: "/manager", key: "managerHome", icon: "🏠", roles: ["owner", "manager"] },
      { href: "/farms", key: "farms", icon: "🚜", roles: ["owner", "manager"] },
    ],
  },
  {
    group: "Daily records", groupBn: "দৈনিক রেকর্ড", accent: "bg-daily",
    items: [
      { href: "/animals", key: "animals", icon: "🐄", roles: ["owner", "manager", "worker", "vet"] },
      { href: "/feeding", key: "feeding", icon: "🌾", roles: ["owner", "manager", "worker"] },
      { href: "/health", key: "health", icon: "💉", roles: ["owner", "manager", "vet"] },
      { href: "/reproduction", key: "reproduction", icon: "🧬", roles: ["owner", "manager", "vet"] },
      { href: "/dairy", key: "dairy", icon: "🥛", roles: ["owner", "manager", "worker"] },
    ],
  },
  {
    group: "Money, stock & sales", groupBn: "টাকা ও মজুদ", accent: "bg-money",
    items: [
      { href: "/inventory", key: "inventory", icon: "📦", roles: ["owner", "manager", "worker"] },
      { href: "/fattening", key: "fattening", icon: "🐂", roles: ["owner", "manager", "buyer"] },
      { href: "/ledger", key: "ledger", icon: "📒", roles: ["owner", "manager"] },
    ],
  },
  {
    group: "Insight & reporting", groupBn: "বিশ্লেষণ", accent: "bg-insight",
    items: [
      { href: "/profitability", key: "profitability", icon: "📈", roles: ["owner", "manager"] },
      { href: "/reports", key: "reports", icon: "📑", roles: ["owner", "manager"] },
      { href: "/settings", key: "settings", icon: "⚙️", roles: ["owner"] },
    ],
  },
];

const ROLES: { id: Role; label: string }[] = [
  { id: "owner", label: "Owner" },
  { id: "manager", label: "Manager" },
  { id: "worker", label: "Worker" },
  { id: "vet", label: "Vet" },
  { id: "buyer", label: "Buyer" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { role, setRole, lang, setLang, scope, setScope, scopeLabel } = useApp();
  const path = usePathname();
  const [farmMenu, setFarmMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Share-link roles get a stripped view rendered by the page itself.
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 h-screen w-64 shrink-0 overflow-y-auto border-r border-stone-200 bg-white transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-account text-lg">🐄</div>
          <div>
            <div className="text-sm font-bold leading-tight text-stone-900">{t("appName", lang)}</div>
            <div className="text-[11px] text-stone-400">Multi-farm · {ACCOUNT_NAME}</div>
          </div>
        </div>
        <nav className="px-2 py-3">
          {NAV.map((g) => {
            const items = g.items.filter((i) => i.roles.includes(role));
            if (items.length === 0) return null;
            return (
              <div key={g.group} className="mb-4">
                <div className="flex items-center gap-2 px-3 pb-1">
                  <span className={`h-2 w-2 rounded-full ${g.accent}`} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    {lang === "bn" ? g.groupBn : g.group}
                  </span>
                </div>
                {items.map((it) => {
                  const active = path === it.href;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setMobileNav(false)}
                      className={`nav-link ${active ? "nav-link-active" : ""}`}
                    >
                      <span className="text-base">{it.icon}</span>
                      <span>{t(it.key, lang)}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="px-4 pb-6 text-[10px] leading-relaxed text-stone-400">
          UI mock-up · dummy data. Based on Farm Management System SRS v1.3.
        </div>
      </aside>

      {mobileNav && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setMobileNav(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mock-up notice banner */}
        {showBanner && (
          <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-100 px-4 py-2 text-amber-900">
            <span className="mt-0.5 text-sm">🔎</span>
            <p className="flex-1 text-xs leading-relaxed sm:text-sm">
              {lang === "bn" ? (
                <><b>এটি একটি প্রিভিউ মকআপ — চূড়ান্ত ডিজাইন নয়।</b> আসন্ন ফার্ম ম্যানেজমেন্ট সিস্টেমের একটি ধারণা দিতে তৈরি। প্রদর্শিত সব তথ্য নমুনা।</>
              ) : (
                <><b>This is a preview mock-up — not the final design.</b> It&apos;s a UI concept made to give a taste of the upcoming Farm Management System. All data shown is sample data.</>
              )}
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="rounded-md px-1.5 py-0.5 text-amber-700 hover:bg-amber-200"
              title={lang === "bn" ? "বন্ধ করুন" : "Dismiss"}
            >
              ✕
            </button>
          </div>
        )}
        {/* Header */}
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-stone-200 bg-white/90 px-4 py-2.5 backdrop-blur">
          <button className="btn-ghost lg:hidden" onClick={() => setMobileNav(true)}>☰</button>

          {/* Farm switcher (FR-004) */}
          <div className="relative">
            <button className="btn-ghost" onClick={() => setFarmMenu((v) => !v)}>
              🚜 <span className="font-semibold">{scopeLabel}</span> ▾
            </button>
            {farmMenu && (
              <div className="absolute left-0 top-11 z-30 w-64 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Scope (FR-004)</div>
                <button
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-stone-100"
                  onClick={() => { setScope({ mode: "all", farmIds: FARMS.map((f) => f.id) }); setFarmMenu(false); }}
                >
                  🌐 All farms {role === "owner" ? "" : "(owner only)"}
                </button>
                <div className="my-1 border-t border-stone-100" />
                {FARMS.map((f) => (
                  <button
                    key={f.id}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-stone-100"
                    onClick={() => { setScope({ mode: "single", farmIds: [f.id] }); setFarmMenu(false); }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                    {f.name}
                    <span className="ml-auto text-[10px] text-stone-400">{f.type}</span>
                  </button>
                ))}
                <div className="my-1 border-t border-stone-100" />
                <button
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-stone-100"
                  onClick={() => { setScope({ mode: "selected", farmIds: ["f1", "f3"] }); setFarmMenu(false); }}
                >
                  ✅ Selected farms (Shapla + Rupsha)
                </button>
              </div>
            )}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Role switcher (demo of §2.2 role separation) */}
            <div className="flex items-center rounded-lg border border-stone-300 bg-white p-0.5 text-xs">
              <span className="px-1.5 text-stone-400">Role:</span>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`rounded-md px-2 py-1 font-medium ${role === r.id ? "bg-account text-white" : "text-stone-600 hover:bg-stone-100"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {/* Language toggle (NFR-08) */}
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="btn-ghost font-semibold"
              title="Switch language (NFR-08)"
            >
              {lang === "en" ? "বাংলা" : "EN"}
            </button>
            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-account text-sm text-white sm:flex">A</div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

const ACCOUNT_NAME = "Rahmatullah Farms";
