import type { Front } from "@/data/goals";

export function latestKrDue(front: Front, dates: Record<string, string>): string | undefined {
  return front.krs.map((k) => dates[k.id]).filter((d): d is string => Boolean(d)).sort().at(-1);
}

/** Returns null when saving would violate the parent deadline. */
export function updateKrDue(
  dates: Record<string, string>, front: Front, krId: string, due: string | null, extendParent = false,
): Record<string, string> | null {
  if (!front.krs.some((k) => k.id === krId)) return null;
  const parent = dates[front.id];
  if (due && parent && due > parent && !extendParent) return null;
  const next = { ...dates };
  if (due) {
    next[krId] = due;
    if (parent && due > parent) next[front.id] = due;
  } else delete next[krId];
  return next;
}

export function updateGoalDue(
  dates: Record<string, string>, front: Front | undefined, id: string, due: string | null,
): Record<string, string> | null {
  const latest = front ? latestKrDue(front, dates) : undefined;
  if (due && latest && due < latest) return null;
  const next = { ...dates };
  if (due) next[id] = due;
  else delete next[id];
  return next;
}