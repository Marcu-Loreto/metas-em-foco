import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FRONTS, type Front } from "@/data/goals";
import { BASE_QUARTER, sortQuarters } from "@/lib/quarters";

export type CustomFront = Front & { quarter: string };
interface State {
  kr: Record<string, number>;
  kpiValue: Record<string, number>;
  notes: Record<string, string>;
  summary: string;
  summaries: Record<string, string>;
  activeQuarter: string;
  quarters: string[];
  customFronts: CustomFront[];
  dueDates: Record<string, string>;
  setDueDate: (id: string, v: string | null) => void;
  setKr: (id: string, v: number) => void;
  setKpi: (id: string, v: number) => void;
  setNote: (id: string, v: string) => void;
  setSummary: (v: string) => void;
  setActiveQuarter: (q: string) => void;
  addQuarter: (q: string) => void;
  addFront: (f: CustomFront) => void;
  removeFront: (id: string) => void;
}
export const useGoals = create<State>()(
  persist(
    (set) => ({
      kr: {}, kpiValue: {}, notes: {}, summary: "", summaries: {},
      activeQuarter: BASE_QUARTER, quarters: [BASE_QUARTER], customFronts: [], dueDates: {},
      setDueDate: (id, v) => set((s) => { const d = { ...s.dueDates }; if (v) d[id] = v; else delete d[id]; return { dueDates: d }; }),
      setKr: (id, v) => set((s) => ({ kr: { ...s.kr, [id]: v } })),
      setKpi: (id, v) => set((s) => ({ kpiValue: { ...s.kpiValue, [id]: v } })),
      setNote: (id, v) => set((s) => ({ notes: { ...s.notes, [id]: v } })),
      setSummary: (v) => set((s) => s.activeQuarter === BASE_QUARTER ? { summary: v } : { summaries: { ...s.summaries, [s.activeQuarter]: v } }),
      setActiveQuarter: (q) => set({ activeQuarter: q }),
      addQuarter: (q) => set((s) => ({ quarters: sortQuarters([...s.quarters, q]) })),
      addFront: (f) => set((s) => ({ customFronts: [...s.customFronts, f], quarters: sortQuarters([...s.quarters, f.quarter]) })),
      removeFront: (id) => set((s) => ({ customFronts: s.customFronts.filter((f) => f.id !== id) })),
    }),
    { name: "metas-q4-2026", skipHydration: true },
  ),
);
export function frontsOf(quarter: string, custom: CustomFront[]): Front[] {
  return [...(quarter === BASE_QUARTER ? FRONTS : []), ...custom.filter((f) => f.quarter === quarter)];
}
export function useFronts(): Front[] {
  const q = useGoals((s) => s.activeQuarter);
  const custom = useGoals((s) => s.customFronts);
  return frontsOf(q, custom);
}
export function summaryOf(s: Pick<State, "summary" | "summaries">, q: string) {
  return q === BASE_QUARTER ? s.summary : s.summaries[q] ?? "";
}
