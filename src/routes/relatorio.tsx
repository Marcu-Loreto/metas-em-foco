import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { useGoals, useFronts, summaryOf } from "@/lib/store";
import { quarterLabel, quarterRange } from "@/lib/quarters";
import { frontPct, overallPct } from "@/lib/progress";
import { buildReportPdf, reportFileName } from "@/lib/report-pdf";
import { Bar, card, PageTitle, PriorityTag, Ring, StatusPill } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GoalDuePicker } from "@/components/app/kr-due-date";

export const Route = createFileRoute("/relatorio")({
  head: () => ({ meta: [
    { title: "Relatório final · Q4/2026 IA Agêntica" },
    { name: "description", content: "Relatório consolidado das metas, KRs, KPIs e anotações, com exportação em PDF." },
    { property: "og:title", content: "Relatório final · Q4/2026" },
    { property: "og:description", content: "Consolidação do Q4/2026 exportável em PDF." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Relatorio,
});

function Relatorio() {
  const s = useGoals();
  const fronts = useFronts();
  const ql = quarterLabel(s.activeQuarter);
  const summary = summaryOf(s, s.activeQuarter);
  const [busy, setBusy] = useState(false);
  const total = overallPct(fronts, s.kr);
  async function exportPdf() {
    setBusy(true);
    try {
      const blob = await buildReportPdf({ ...s, summary, fronts, quarterLabel: ql, range: quarterRange(s.activeQuarter) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = reportFileName(s.activeQuarter);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } finally { setBusy(false); }
  }
  return (
    <>
      <PageTitle title="Relatório final" sub={`Consolidação do ${ql} para apresentação.`}>
        <Button onClick={exportPdf} disabled={busy} size="lg" className="rounded-full"><Download className="h-4 w-4" />{busy ? "Gerando…" : "Exportar PDF"}</Button>
      </PageTitle>
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <div className={card + " grid place-items-center"}><Ring pct={total} size={170} label="geral ponderado" /></div>
        <div className={card}>
          <h2 className="mb-2 text-lg font-semibold">Resumo executivo</h2>
          <Textarea className="min-h-32 bg-background" placeholder="Principais entregas, aprendizados e próximos passos para 2027…" value={summary} onChange={(e) => s.setSummary(e.target.value)} />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {fronts.map((f) => {
          const p = frontPct(f, s.kr);
          return (
            <section key={f.id} className={card + " min-w-0 break-words"}>
              <div className="flex flex-wrap items-center gap-3"><PriorityTag p={f.priority} /><h3 className="text-lg font-semibold">{f.name}</h3><StatusPill pct={p} /><b className="ml-auto">{p}%</b></div>
              <div className="mt-3"><Bar pct={p} /></div>
              <GoalDuePicker front={f} />
              <ul className="mt-3 grid gap-1 text-sm md:grid-cols-2">
                {f.krs.map((k, i) => <li key={k.id} className="flex justify-between gap-3"><span className={(s.kr[k.id] ?? 0) >= 100 ? "" : "text-muted-foreground"}>KR{i + 1} · {k.text}</span><span>{s.kr[k.id] ?? 0}%</span></li>)}
              </ul>
              <p className="mt-3 text-sm"><b>KPI:</b> {f.kpi.name} — {s.kpiValue[f.id] ?? 0}% · <span className="text-muted-foreground">Meta: {f.kpi.target}</span></p>
              {s.notes[f.id] && <p className="mt-2 rounded-xl bg-muted p-3 text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{s.notes[f.id]}</p>}
            </section>
          );
        })}
      </div>
    </>
  );
}
