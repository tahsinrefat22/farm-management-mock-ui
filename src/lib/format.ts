import type { Lang } from "@/context/AppContext";

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBnDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

export function money(n: number, lang: Lang = "en"): string {
  const s = "৳" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return lang === "bn" ? toBnDigits(s) : s;
}

export function money2(n: number, lang: Lang = "en"): string {
  const s = "৳" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return lang === "bn" ? toBnDigits(s) : s;
}

export function num(n: number, lang: Lang = "en", digits = 0): string {
  const s = n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  return lang === "bn" ? toBnDigits(s) : s;
}

export function litres(n: number, lang: Lang = "en"): string {
  return num(n, lang, 1) + (lang === "bn" ? " লি" : " L");
}

export function kg(n: number, lang: Lang = "en"): string {
  return num(n, lang, 1) + (lang === "bn" ? " কেজি" : " kg");
}

export function pct(n: number, lang: Lang = "en"): string {
  return num(n, lang, 1) + "%";
}
