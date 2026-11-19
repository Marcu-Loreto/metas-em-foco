import { cn } from "@/lib/utils";
import { status, STATUS_LABEL, type Status } from "@/lib/progress";
import type { Priority } from "@/data/goals";
import { useGoals } from "@/lib/store";
import { quarterRange } from "@/lib/quarters";

const STATUS_CLS: Record<Status, string> = {
  concluido: "bg-success-soft text-success-ink",
  "no-prazo": "bg-secondary text-secondary-foreground",
  atencao: "bg-warn-soft text-warn-ink",
  risco: "bg-risk-soft text-risk-ink",
};
export function StatusPill({ pct }: { pct: number }) {
  const q = useGoals((st) => st.activeQuarter);
  const s = status(pct, new Date(), quarterRange(q));
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLS[s])}>{STATUS_LABEL[s]}</span>;
}
const PRI_CLS: Record<Priority, string> = {
  P0: "bg-primary text-primary-foreground",
  P1: "bg-accent text-accent-foreground",
  P2: "bg-lavender text-lavender-ink",
};
export function PriorityTag({ p }: { p: Priority }) {
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", PRI_CLS[p])}>{p}</span>;
}
export function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
export function Ring({ pct, size = 140, label }: { pct: number; size?: number; label?: string }) {
  const r = size / 2 - 10, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={10} className="fill-none stroke-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={10} strokeLinecap="round"
          className="fill-none stroke-primary transition-all duration-700" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="font-display text-3xl font-semibold">{pct}%</div>{label && <div className="text-xs text-muted-foreground">{label}</div>}</div>
      </div>
    </div>
  );
}
export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>
      {children}
    </div>
  );
}
export const card = "rounded-2xl border bg-card p-5 shadow-soft";
