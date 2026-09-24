import type { Lang } from "@/context/AppContext";

type Dict = Record<string, { en: string; bn: string }>;

export const T: Dict = {
  appName: { en: "Farm Manager", bn: "ফার্ম ম্যানেজার" },
  dashboard: { en: "Owner Dashboard", bn: "মালিক ড্যাশবোর্ড" },
  managerHome: { en: "Manager Home", bn: "ম্যানেজার হোম" },
  farms: { en: "Farms & Accounts", bn: "খামার ও অ্যাকাউন্ট" },
  animals: { en: "Animals", bn: "পশু" },
  inventory: { en: "Inventory", bn: "মজুদ" },
  feeding: { en: "Feeding", bn: "খাদ্য" },
  health: { en: "Health", bn: "স্বাস্থ্য" },
  reproduction: { en: "Reproduction", bn: "প্রজনন" },
  dairy: { en: "Dairy", bn: "দুগ্ধ" },
  fattening: { en: "Fattening & Qurbani", bn: "মোটাতাজাকরণ ও কোরবানি" },
  ledger: { en: "Ledger", bn: "খতিয়ান" },
  profitability: { en: "Profitability", bn: "লাভজনকতা" },
  reports: { en: "Reports", bn: "রিপোর্ট" },
  settings: { en: "Settings & Rules", bn: "সেটিংস ও নিয়ম" },
  allFarms: { en: "All farms", bn: "সব খামার" },
  selected: { en: "Selected", bn: "নির্বাচিত" },
  costView: { en: "Cost view", bn: "খরচ ভিউ" },
  cashView: { en: "Cash view", bn: "নগদ ভিউ" },
  attention: { en: "Needs attention", bn: "মনোযোগ প্রয়োজন" },
  today: { en: "Today", bn: "আজ" },
};

export function t(key: string, lang: Lang): string {
  const e = T[key];
  return e ? e[lang] : key;
}
