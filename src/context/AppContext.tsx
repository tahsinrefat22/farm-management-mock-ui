"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { FARMS } from "@/lib/data";

export type Role = "owner" | "manager" | "worker" | "vet" | "buyer";
export type Lang = "en" | "bn";
export type Scope = { mode: "all" | "single" | "selected"; farmIds: string[] };

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  scope: Scope;
  setScope: (s: Scope) => void;
  scopeLabel: string;
  // which farm ids are currently in view
  activeFarmIds: string[];
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("owner");
  const [lang, setLang] = useState<Lang>("en");
  const [scope, setScope] = useState<Scope>({ mode: "all", farmIds: FARMS.map((f) => f.id) });

  const activeFarmIds = useMemo(() => {
    if (scope.mode === "all") return FARMS.map((f) => f.id);
    return scope.farmIds;
  }, [scope]);

  const scopeLabel = useMemo(() => {
    if (scope.mode === "all") return lang === "bn" ? "সব খামার" : "All farms";
    if (scope.mode === "single") {
      const f = FARMS.find((x) => x.id === scope.farmIds[0]);
      return f ? f.name : "Farm";
    }
    return (lang === "bn" ? "নির্বাচিত: " : "Selected: ") + scope.farmIds.length + (lang === "bn" ? " খামার" : " farms");
  }, [scope, lang]);

  return (
    <AppContext.Provider value={{ role, setRole, lang, setLang, scope, setScope, scopeLabel, activeFarmIds }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
