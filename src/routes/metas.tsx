import { createFileRoute } from "@tanstack/react-router";
import { useGoals, useFronts } from "@/lib/store";
import { frontPct } from "@/lib/progress";
import { Bar, card, PageTitle, PriorityTag, StatusPill } from "@/components/app/bits";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { daysLeft, daysLeftLabel } from "@/lib/due";
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
  const { kr, setKr, dueDates, setDueDate } = useGoals();
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
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
                  {dueDates[f.id] && today && <DaysBadge n={daysLeft(dueDates[f.id]!, today)} />}
                  <div className="ml-auto flex w-48 items-center gap-3"><Bar pct={pct} /><b className="w-10 text-right">{pct}%</b></div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <DuePicker value={dueDates[f.id]} onChange={(v) => setDueDate(f.id, v)} />
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

function DaysBadge({ n }: { n: number }) {
  const tone = n < 0 ? "bg-destructive/15 text-destructive" : n <= 7 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground";
  return <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " + tone}><CalendarIcon className="h-3 w-3" />{daysLeftLabel(n)}</span>;
}
function DuePicker({ value, onChange }: { value: string | undefined; onChange: (v: string | null) => void }) {
  const date = value ? new Date(value + "T12:00:00") : undefined;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data de finalização</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={date ? "" : "text-muted-foreground"} aria-label="Escolher data de finalização">
            <CalendarIcon />{date ? format(date, "dd/MM/yyyy") : "Definir data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" locale={ptBR} selected={date} onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : null)} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
      {value && <Button variant="ghost" size="sm" onClick={() => onChange(null)}>Limpar</Button>}
    </div>
  );
}
