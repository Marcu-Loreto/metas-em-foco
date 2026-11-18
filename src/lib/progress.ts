import type { Front } from "@/data/goals";
export type KrProgress = Record<string, number>;

export function frontPct(front: Front, kr: KrProgress): number {
  if (!front.krs.length) return 0;
  const sum = front.krs.reduce((s, k) => s + clamp(kr[k.id] ?? 0), 0);
  return Math.round(sum / front.krs.length);
}
/** P0 fronts share 80% of the weight, P1/P2 share 20%. */
export function frontWeight(front: Front, fronts: Front[]): number {
  const p0 = front.priority === "P0";
  const n = fronts.filter((f) => (f.priority === "P0") === p0).length;
  return (p0 ? 0.8 : 0.2) / n;
}
export function overallPct(fronts: Front[], kr: KrProgress): number {
  return Math.round(fronts.reduce((s, f) => s + frontWeight(f, fronts) * frontPct(f, kr), 0));
}
export function groupPct(fronts: Front[], kr: KrProgress): number {
  if (!fronts.length) return 0;
  return Math.round(fronts.reduce((s, f) => s + frontPct(f, kr), 0) / fronts.length);
}
export type Status = "concluido" | "no-prazo" | "atencao" | "risco";
/** Compare progress against time elapsed in the quarter (Nov 1 – Dec 31, 2026). */
export function status(pct: number, now = new Date()): Status {
  if (pct >= 100) return "concluido";
  const start = Date.UTC(2026, 10, 1), end = Date.UTC(2026, 11, 31);
  const elapsed = clamp(((now.getTime() - start) / (end - start)) * 100);
  if (pct >= elapsed - 10) return "no-prazo";
  if (pct >= elapsed - 25) return "atencao";
  return "risco";
}
export const STATUS_LABEL: Record<Status, string> = { concluido: "Concluído", "no-prazo": "No prazo", atencao: "Atenção", risco: "Em risco" };
export function clamp(n: number) { return Math.max(0, Math.min(100, n)); }
