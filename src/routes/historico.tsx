import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { CheckCircle2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useGoals, frontsOf } from "@/lib/store";
import { quarterLabel, quarterRange } from "@/lib/quarters";
import { frontPct, overallPct, status, STATUS_LABEL } from "@/lib/progress";
import { buildBackup, backupFileName, downloadJson, parseBackup } from "@/lib/backup";
import { card, PageTitle, PriorityTag, Bar } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { deadlineStatus } from "@/lib/closure";

export const Route = createFileRoute("/historico")({
  head: () => ({ meta: [
    { title: "Histórico de metas por quarter · IA Agêntica" },
    { name: "description", content: "Registro das metas e Key Results concluídos em cada quarter, com exportação e importação do histórico." },
    { property: "og:title", content: "Histórico de metas por quarter" },
    { property: "og:description", content: "Metas concluídas e completude de cada quarter." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Historico,
});

function Historico() {
  const { quarters, customFronts, kr, dueDates, closedDates, setActiveQuarter } = useGoals();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const list = [...quarters].reverse();

  function exportar() {
    const s = useGoals.getState();
    const nome = backupFileName(s.activeQuarter);
    downloadJson(nome, JSON.stringify(buildBackup(s), null, 2));
    toast.success(`Arquivo ${nome} baixado.`);
  }

  async function importar(file: File) {
    try {
      const st = parseBackup(await file.text());
      useGoals.setState(st);
      toast.success(
        `Histórico carregado: ${st.quarters.length} quarter${st.quarters.length > 1 ? "s" : ""}, ` +
          `${st.customFronts.length} meta${st.customFronts.length === 1 ? "" : "s"} cadastrada${st.customFronts.length === 1 ? "" : "s"}.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível ler este arquivo.");
    }
  }

  return (
    <>
      <PageTitle title="Histórico" sub="Metas concluídas e completude de cada quarter.">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={exportar}>
            <Download className="h-4 w-4" />Exportar dados
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />Importar dados
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importar(f);
              e.target.value = "";
            }}
          />
        </div>
      </PageTitle>
      <p className="-mt-6 mb-8 text-sm text-muted-foreground">
        Os percentuais, as notas e as metas criadas ficam salvos apenas neste navegador. Exporte um
        arquivo para levar o histórico para outra máquina ou guardá-lo junto do projeto.
      </p>
      <div className="space-y-6">
        {list.map((q) => {
          const fronts = frontsOf(q, customFronts);
          const total = overallPct(fronts, kr);
          const done = fronts.filter((f) => frontPct(f, kr) >= 100);
          const krsDone = fronts.flatMap((f) => f.krs).filter((k) => (kr[k.id] ?? 0) >= 100).length;
          const krsAll = fronts.flatMap((f) => f.krs).length;
          const ended = Date.now() > quarterRange(q).end;
          return (
            <section key={q} className={card}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{quarterLabel(q)} <span className="ml-2 align-middle text-xs font-normal text-muted-foreground">{ended ? "Encerrado" : "Em andamento"}</span></h2>
                  <p className="text-sm text-muted-foreground">{done.length} de {fronts.length} metas concluídas · {krsDone} de {krsAll} KRs concluídos</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><div className="font-display text-3xl font-semibold">{total}%</div><div className="text-xs text-muted-foreground">completude geral</div></div>
                  <Button variant="outline" onClick={() => { setActiveQuarter(q); void nav({ to: "/" }); }}>Abrir quarter</Button>
                </div>
              </div>
              <div className="mt-3"><Bar pct={total} /></div>
              {!fronts.length ? <p className="mt-4 text-sm text-muted-foreground">Sem metas cadastradas.</p> : (
                <ul className="mt-4 divide-y">
                  {fronts.map((f) => {
                    const p = frontPct(f, kr);
                    return (
                      <li key={f.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                        {p >= 100 ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="h-4 w-4" />}
                        <PriorityTag p={f.priority} />
                        <span className={"flex-1 " + (p >= 100 ? "font-medium" : "")}>{f.name}</span>
                        <span className="text-muted-foreground">{deadlineStatus(dueDates[f.id], closedDates[f.id], p)?.label ?? STATUS_LABEL[status(p, new Date(), quarterRange(q))]}</span>
                        <span className="w-12 text-right font-semibold">{p}%</span>
                      </li>);
                  })}
                </ul>)}
            </section>);
        })}
      </div>
    </>
  );
}
