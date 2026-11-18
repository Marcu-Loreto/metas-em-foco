import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  kr: Record<string, number>;
  kpiValue: Record<string, number>;
  notes: Record<string, string>;
  summary: string;
  setKr: (id: string, v: number) => void;
  setKpi: (id: string, v: number) => void;
  setNote: (id: string, v: string) => void;
  setSummary: (v: string) => void;
}
export const useGoals = create<State>()(
  persist(
    (set) => ({
      kr: {}, kpiValue: {}, notes: {}, summary: "",
      setKr: (id, v) => set((s) => ({ kr: { ...s.kr, [id]: v } })),
      setKpi: (id, v) => set((s) => ({ kpiValue: { ...s.kpiValue, [id]: v } })),
      setNote: (id, v) => set((s) => ({ notes: { ...s.notes, [id]: v } })),
      setSummary: (v) => set({ summary: v }),
    }),
    { name: "metas-q4-2026", skipHydration: true },
  ),
);
