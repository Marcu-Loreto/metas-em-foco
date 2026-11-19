import { createFileRoute } from "@tanstack/react-router";
import { useGoals, useFronts } from "@/lib/store";
import { frontPct, overallPct } from "@/lib/progress";
import { card, PageTitle, PriorityTag, Bar } from "@/components/app/bits";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kpis")({
  head: () => ({ meta: [
    { title: "KPIs & OKRs · Q4/2026 IA Agêntica" },
    { name: "description", content: "KPIs com fórmula, baseline, meta, frequência e responsável, e seus OKRs." },
    { property: "og:title", content: "KPIs & OKRs · Q4/2026" },
    { property: "og:description", content: "Indicadores e Key Results vinculados de cada frente." },
  ] }),
  component: Kpis,
});

function Kpis() {
  const { kr, kpiValue, notes, setKpi, setNote } = useGoals();
  const fronts = useFronts();
  return (
    <>
      <PageTitle title="KPIs & OKRs" sub={`Cada KPI com o objetivo e os Key Results que o sustentam. Progresso geral ponderado: ${overallPct(fronts, kr)}%`} />
      <div className="space-y-5">
        {fronts.map((f) => {
          const v = kpiValue[f.id] ?? 0;
          return (
            <article key={f.id} className={cn(card, "grid gap-6 lg:grid-cols-[1.1fr_1fr]")}>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><PriorityTag p={f.priority} />{f.name}</div>
                <h2 className="mt-2 text-xl font-semibold">{f.kpi.name}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <D t="Fórmula" v={f.kpi.formula} full /><D t="Baseline" v={f.kpi.baseline} /><D t="Meta Q4" v={f.kpi.target} />
                  <D t="Frequência" v={f.kpi.frequency} /><D t="Responsável" v={f.kpi.owner} />
                </dl>
                <div className="mt-4 flex items-center gap-3"><Slider value={[v]} max={100} step={5} onValueChange={([n]) => setKpi(f.id, n ?? 0)} aria-label="Atingimento do KPI" /><b className="w-12 text-right">{v}%</b></div>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Objetivo</div>
                <p className="mb-3 text-sm">{f.okrObjective}</p>
                <div className="mb-3"><div className="mb-1 flex justify-between text-sm font-medium"><span>Completude da meta (média dos KRs)</span><b>{frontPct(f, kr)}%</b></div><Bar pct={frontPct(f, kr)} /></div>
                <ul className="space-y-2">
                  {f.krs.map((k, i) => (
                    <li key={k.id} className="text-sm"><div className="flex justify-between gap-2"><span>KR{i + 1} · {k.text}</span><b>{kr[k.id] ?? 0}%</b></div><div className="mt-1"><Bar pct={kr[k.id] ?? 0} /></div></li>
                  ))}
                </ul>
                <Textarea className="mt-4 bg-background" placeholder="Notas sobre este KPI…" value={notes[f.id] ?? ""} onChange={(e) => setNote(f.id, e.target.value)} />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
function D({ t, v, full }: { t: string; v: string; full?: boolean }) {
  return <div className={full ? "col-span-2" : ""}><dt className="text-xs text-muted-foreground">{t}</dt><dd>{v}</dd></div>;
}
