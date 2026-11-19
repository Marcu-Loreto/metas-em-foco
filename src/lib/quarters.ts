export interface QuarterRange { start: number; end: number }
export const BASE_QUARTER = "Q4-2026";
/** "Q1-2027" -> "Q1/2027" */
export const quarterLabel = (id: string) => id.replace("-", "/");
/** Calendar quarter range; Q4/2026 keeps the plan's Nov 1 – Dec 31 window. */
export function quarterRange(id: string): QuarterRange {
  if (id === BASE_QUARTER) return { start: Date.UTC(2026, 10, 1), end: Date.UTC(2026, 11, 31) };
  const m = /^Q([1-4])-(\d{4})$/.exec(id);
  const q = Number(m?.[1] ?? 1), y = Number(m?.[2] ?? 2027);
  return { start: Date.UTC(y, (q - 1) * 3, 1), end: Date.UTC(y, q * 3, 0) };
}
export function sortQuarters(ids: string[]) {
  const key = (id: string) => { const [q, y] = id.slice(1).split("-"); return Number(y) * 10 + Number(q); };
  return [...new Set(ids)].sort((a, b) => key(a) - key(b));
}
