import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FRONTS, type Front } from "@/data/goals";
import { BASE_QUARTER, sortQuarters } from "@/lib/quarters";
import { updateGoalDue, updateKrDue } from "@/lib/due-policy";
import { localDate, reconcileFrontClosure } from "@/lib/closure";

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
  closedDates: Record<string, string>;
  setClosedDate: (id: string, v: string | null) => void;
  setDueDate: (id: string, v: string | null) => boolean;
  setKrDueDate: (frontId: string, krId: string, v: string | null, extendParent?: boolean) => boolean;
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
    (set, get) => ({
      kr: {}, kpiValue: {}, notes: {}, summary: "", summaries: {},
      activeQuarter: BASE_QUARTER, quarters: [BASE_QUARTER], customFronts: [], dueDates: {}, closedDates: {},
      setClosedDate: (id, v) => set((s) => {
        const fronts = [...FRONTS, ...s.customFronts];
        const goal = fronts.find((f) => f.id === id);
        const parent = goal ?? fronts.find((f) => f.krs.some((k) => k.id === id));
        if (!parent) return {};
        const closedDates = { ...s.closedDates };
        const kr = { ...s.kr };
        if (v) {
          closedDates[id] = v;
          if (goal) {
            for (const k of goal.krs) { kr[k.id] = 100; closedDates[k.id] ??= v; }
          } else kr[id] = 100;
        } else delete closedDates[id];
        return { kr, closedDates: goal ? closedDates : reconcileFrontClosure(parent, kr, closedDates) };
      }),
      setDueDate: (id, v) => {
        const s = get();
        const front = [...FRONTS, ...s.customFronts].find((f) => f.id === id);
        const dueDates = updateGoalDue(s.dueDates, front, id, v);
        if (!dueDates) return false;
        set({ dueDates });
        return true;
      },
      setKrDueDate: (frontId, krId, v, extendParent = false) => {
        const s = get();
        const front = [...FRONTS, ...s.customFronts].find((f) => f.id === frontId);
        if (!front) return false;
        const dueDates = updateKrDue(s.dueDates, front, krId, v, extendParent);
        if (!dueDates) return false;
        set({ dueDates });
        return true;
      },
      setKr: (id, v) => set((s) => {
        const kr = { ...s.kr, [id]: v };
        const closedDates = { ...s.closedDates };
        if (v >= 100 && (s.kr[id] ?? 0) < 100) closedDates[id] = localDate();
        if (v < 100) delete closedDates[id];
        const parent = [...FRONTS, ...s.customFronts].find((f) => f.krs.some((k) => k.id === id));
        return { kr, closedDates: reconcileFrontClosure(parent, kr, closedDates) };
      }),
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
