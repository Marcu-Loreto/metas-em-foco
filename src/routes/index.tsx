import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bar as RBar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { FRONTS, type Priority } from "@/data/goals";
import { useGoals } from "@/lib/store";
import { frontPct, overallPct, groupPct } from "@/lib/progress";
import { Bar, card, PageTitle, PriorityTag, Ring, StatusPill } from "@/components/app/bits";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard · Metas Q4/2026 IA Agêntica" },
    { name: "description", content: "Visão geral da completude das 7 frentes, KPIs e OKRs do Q4/2026." },
    { property: "og:title", content: "Dashboard · Metas Q4/2026" },
    { property: "og:description", content: "Completude por frente, KPIs e anotações." },
  ] }),
  component: Dashboard,
});

const FILTERS: (Priority | "Todas")[] = ["Todas", "P0", "P1", "P2"];

function Dashboard() {
  const { kr, kpiValue, notes, setKpi, setNote } = useGoals();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todas");
  const shown = FRONTS.filter((f) => filter === "Todas" || f.priority === filter);
  const total = overallPct(FRONTS, kr);
  const p0 = groupPct(FRONTS.filter((f) => f.priority === "P0"), kr);
  const rest = groupPct(FRONTS.filter((f) => f.priority !== "P0"), kr);
  const doneKrs = FRONTS.flatMap((f) => f.krs).filter((k) => (kr[k.id] ?? 0) >= 100).length;
  const allKrs = FRONTS.flatMap((f) => f.krs).length;
  const chart = FRONTS.map((f) => ({ name: f.id.toUpperCase(), pct: frontPct(f, kr), p0: f.priority === "P0" }));

  return (
    <>
      <PageTitle title="Dashboard" sub="Novembro e dezembro · fundação da IA agêntica externa" />
      <section className="grid gap-5 lg:grid-cols-[auto_1fr_1fr]">
        <div className={cn(card, "flex items-center gap-6")}>
          <Ring pct={total} label="geral ponderado" />
          <div className="space-y-1 text-sm">
            <div className="text-muted-foreground">KRs concluídos</div>
            <div className="font-display text-2xl font-semibold">{doneKrs}/{allKrs}</div>
            <StatusPill pct={total} />
          </div>
        </div>
        <div className={cn(card, "space-y-4")}>
          <h2 className="text-lg font-semibold">Alocação de capacidade</h2>
          <div><div className="mb-1 flex justify-between text-sm"><span>P0 · ~80% da capacidade</span><b>{p0}%</b></div><Bar pct={p0} /></div>
          <div><div className="mb-1 flex justify-between text-sm"><span>P1/P2 · ~20% da capacidade</span><b>{rest}%</b></div><Bar pct={rest} /></div>
          <p className="text-xs text-muted-foreground">O % geral pondera P0 em 80% e P1/P2 em 20%.</p>
        </div>
        <div className={card}>
          <h2 className="mb-2 text-lg font-semibold">Completude por frente</h2>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={chart} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <RBar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {chart.map((c) => <Cell key={c.name} fill={c.p0 ? "var(--chart-1)" : "var(--chart-2)"} />)}
                </RBar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="mt-10 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">KPIs por frente</h2>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("rounded-full px-4 py-1.5 text-sm", filter === f ? "bg-card font-medium shadow-soft" : "text-muted-foreground")}>{f}</button>
          ))}
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((f) => {
          const pct = frontPct(f, kr);
          const kpiPct = kpiValue[f.id] ?? 0;
          return (
            <article key={f.id} className={cn(card, "flex flex-col gap-4")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2"><PriorityTag p={f.priority} /><StatusPill pct={pct} /></div>
                <span className="font-display text-2xl font-semibold">{pct}%</span>
              </div>
              <div>
                <Link to="/metas" hash={f.id} className="font-display text-lg font-semibold hover:underline">{f.name}</Link>
                <p className="mt-1 text-sm text-muted-foreground">{f.objective}</p>
              </div>
              <Bar pct={pct} />
              <div className="rounded-xl bg-muted p-3 text-sm">
                <div className="flex justify-between"><span className="font-medium">KPI · {f.kpi.name}</span><b>{kpiPct}%</b></div>
                <div className="mt-1 text-xs text-muted-foreground">Meta: {f.kpi.target}</div>
                <div className="mt-1 text-xs text-muted-foreground">{f.kpi.frequency} · {f.kpi.owner}</div>
                <Slider className="mt-3" value={[kpiPct]} max={100} step={5} onValueChange={([v]) => setKpi(f.id, v ?? 0)} aria-label={`Atingimento do KPI ${f.kpi.name}`} />
              </div>
              <ul className="space-y-1 text-xs">
                {f.krs.map((k, i) => (
                  <li key={k.id} className="flex justify-between gap-2"><span className="truncate text-muted-foreground">KR{i + 1} · {k.text}</span><span>{kr[k.id] ?? 0}%</span></li>
                ))}
              </ul>
              <Textarea placeholder="Informações relevantes, bloqueios, decisões…" value={notes[f.id] ?? ""} onChange={(e) => setNote(f.id, e.target.value)} className="min-h-20 bg-background" />
            </article>
          );
        })}
      </section>
    </>
  );
}
