/** Whole days from `today` to the due date "yyyy-MM-dd" (0 = due today, negative = overdue). */
export function daysLeft(due: string, today = new Date()): number {
  const [y, m, d] = due.split("-").map(Number);
  const end = Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((end - now) / 86_400_000);
}
export function daysLeftLabel(n: number): string {
  if (n === 0) return "Vence hoje";
  if (n === 1) return "Falta 1 dia";
  if (n > 1) return `Faltam ${n} dias`;
  return n === -1 ? "Atrasada 1 dia" : `Atrasada ${-n} dias`;
}
