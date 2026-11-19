import { createFileRoute } from "@tanstack/react-router";
import { useGoals, useFronts } from "@/lib/store";
import { frontPct } from "@/lib/progress";
import { Bar, card, PageTitle, PriorityTag, StatusPill } from "@/components/app/bits";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/metas")({
  head: () => ({ meta: [
    { title: "Metas · Q4/2026 IA Agêntica" },
    { name: "description", content: "As 7 frentes estratégicas com objetivos, riscos, dependências e Key Results." },
    { property: "og:title", content: "Metas · Q4/2026 IA Agêntica" },
    { property: "og:description", content: "Frentes estratégicas e Key Results com % de completude." },
  ] }),
  component: Metas,
});

function Metas() {
  const { kr, setKr } = useGoals();
  const fronts = useFronts();
  return (
    <>
      <PageTitle title="Metas" sub="Atualize o % de cada Key Result — a frente é a média dos seus KRs." />
      <Accordion type="multiple" defaultValue={[fronts[0]?.id ?? ""]} className="space-y-4">
        {fronts.map((f) => {
          const pct = frontPct(f, kr);
          return (
            <AccordionItem key={f.id} value={f.id} id={f.id} className={card + " border-b"}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 flex-wrap items-center gap-3 pr-4 text-left">
                  <PriorityTag p={f.priority} />
                  <span className="font-display text-lg font-semibold">{f.name}</span>
                  <StatusPill pct={pct} />
                  <div className="ml-auto flex w-48 items-center gap-3"><Bar pct={pct} /><b className="w-10 text-right">{pct}%</b></div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 pt-2 text-sm md:grid-cols-2">
                  <Info t="Objetivo (OKR)" v={f.okrObjective} />
                  <Info t="Resultados esperados" v={f.expected} />
                  <Info t="Iniciativas prioritárias" v={f.initiatives} />
                  <Info t="Dependências" v={f.dependencies} />
                  <Info t="Riscos" v={f.risks} />
                  <Info t="Critério de conclusão" v={f.completion} />
                </div>
                <div className="mt-4 grid gap-2 rounded-xl bg-muted p-3 text-xs md:grid-cols-3">
                  <Info t="Novembro" v={f.plan.nov} /><Info t="Dezembro" v={f.plan.dec} /><Info t="Fechamento / 2027" v={f.plan.close} />
                </div>
                <h3 className="mt-6 mb-3 text-base font-semibold">Key Results</h3>
                <ul className="space-y-3">
                  {f.krs.map((k, i) => {
                    const v = kr[k.id] ?? 0;
                    return (
                      <li key={k.id} className="grid items-center gap-3 rounded-xl border bg-background p-3 md:grid-cols-[auto_1fr_220px_48px]">
                        <Checkbox checked={v >= 100} onCheckedChange={(c) => setKr(k.id, c ? 100 : 0)} aria-label={`Concluir KR${i + 1}`} />
                        <span><b>KR{i + 1}</b> · {k.text}</span>
                        <Slider value={[v]} max={100} step={5} onValueChange={([n]) => setKr(k.id, n ?? 0)} aria-label={`Progresso KR${i + 1}`} />
                        <b className="text-right">{v}%</b>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
}
function Info({ t, v }: { t: string; v: string }) {
  return <div><div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t}</div><div className="mt-0.5">{v}</div></div>;
}
