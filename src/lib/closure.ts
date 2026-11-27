import type { Front } from "@/data/goals";
import { daysLeft, daysLeftLabel } from "@/lib/due";

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function deadlineStatus(due: string | undefined, closed: string | undefined, pct: number, today = new Date()) {
  if (closed) {
    if (!due) return { label: "Fechada · sem estimativa", tone: "success" } as const;
    if (closed < due) return { label: "Adiantado", tone: "success" } as const;
    if (closed === due) return { label: "Fechada no prazo", tone: "success" } as const;
    return { label: "Fechada com atraso", tone: "risk" } as const;
  }
  if (pct >= 100) return { label: "Concluída · fechamento não registrado", tone: "neutral" } as const;
  if (!due) return undefined;
  const n = daysLeft(due, today);
  return { label: daysLeftLabel(n), tone: n < 0 ? "risk" : n <= 7 ? "warn" : "neutral" } as const;
}

export function reconcileFrontClosure(front: Front | undefined, kr: Record<string, number>, closed: Record<string, string>) {
  const next = { ...closed };
  if (!front) return next;
  if (front.krs.length && front.krs.every((k) => (kr[k.id] ?? 0) >= 100 && next[k.id])) {
    const latest = front.krs.map((k) => next[k.id] ?? "").sort().at(-1);
    if (latest) next[front.id] = latest;
  } else delete next[front.id];
  return next;
}