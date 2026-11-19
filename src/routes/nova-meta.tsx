import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Priority } from "@/data/goals";
import { useGoals } from "@/lib/store";
import { quarterLabel } from "@/lib/quarters";
import { card, PageTitle, PriorityTag } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/nova-meta")({
  head: () => ({ meta: [
    { title: "Nova meta · Cadastro de metas e KPIs por quarter" },
    { name: "description", content: "Cadastre novas metas, Key Results e KPIs para próximos quarters, como Q1/2027." },
    { property: "og:title", content: "Nova meta · Cadastro por quarter" },
    { property: "og:description", content: "Cadastre metas, OKRs e KPIs para novos quarters." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: NovaMeta,
});

const empty = { name: "", objective: "", okrObjective: "", expected: "", initiatives: "", dependencies: "", risks: "", completion: "",
  kpiName: "", formula: "", baseline: "", target: "", frequency: "Semanal", owner: "Marcu" };

function NovaMeta() {
  const { quarters, activeQuarter, customFronts, addFront, removeFront, setActiveQuarter } = useGoals();
  const nav = useNavigate();
  const [qn, setQn] = useState("1"), [year, setYear] = useState("2027");
  const [quarter, setQuarter] = useState(activeQuarter === "Q4-2026" ? "Q1-2027" : activeQuarter);
  const [priority, setPriority] = useState<Priority>("P0");
  const [f, setF] = useState(empty);
  const [krs, setKrs] = useState<string[]>([""]);
  const [err, setErr] = useState("");
  const options = [...new Set([...quarters, quarter])];
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function save() {
    const list = krs.map((k) => k.trim()).filter(Boolean);
    if (!f.name.trim() || !f.kpiName.trim() || !list.length) { setErr("Preencha o nome da meta, ao menos 1 Key Result e o nome do KPI."); return; }
    const id = `${quarter.toLowerCase()}-${Date.now().toString(36)}`;
    addFront({ id, quarter, priority, name: f.name.trim(), objective: f.objective, justification: "", okrObjective: f.okrObjective || f.objective,
      expected: f.expected, initiatives: f.initiatives, dependencies: f.dependencies, risks: f.risks, completion: f.completion,
      krs: list.map((text, i) => ({ id: `${id}-kr${i + 1}`, text })),
      kpi: { name: f.kpiName, formula: f.formula, baseline: f.baseline, target: f.target, frequency: f.frequency, owner: f.owner },
      plan: { nov: "", dec: "", close: "" } });
    setActiveQuarter(quarter);
    setF(empty); setKrs([""]); setErr("");
    void nav({ to: "/metas" });
  }

  const mine = customFronts.filter((c) => c.quarter === quarter);
  return (
    <>
      <PageTitle title="Nova meta" sub="Cadastre metas, Key Results e KPIs para um novo quarter." />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className={card + " space-y-5"}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1"><Label>Quarter</Label>
              <select className="h-9 rounded-md border bg-background px-3 text-sm" value={quarter} onChange={(e) => setQuarter(e.target.value)}>
                {options.map((q) => <option key={q} value={q}>{quarterLabel(q)}</option>)}
              </select></div>
            <span className="pb-2 text-sm text-muted-foreground">ou criar</span>
            <select aria-label="Trimestre" className="h-9 rounded-md border bg-background px-2 text-sm" value={qn} onChange={(e) => setQn(e.target.value)}>
              {["1", "2", "3", "4"].map((n) => <option key={n} value={n}>Q{n}</option>)}</select>
            <Input aria-label="Ano" className="w-24" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            <Button variant="outline" onClick={() => year.length === 4 && setQuarter(`Q${qn}-${year}`)}>Usar este quarter</Button>
          </div>
          <div className="space-y-1"><Label>Prioridade</Label>
            <div className="flex gap-2">{(["P0", "P1", "P2"] as Priority[]).map((p) => (
              <button key={p} type="button" onClick={() => setPriority(p)} className={"rounded-lg border px-3 py-1.5 " + (priority === p ? "ring-2 ring-primary" : "")}><PriorityTag p={p} /></button>))}</div></div>
          <F l="Nome da meta *"><Input value={f.name} onChange={set("name")} placeholder="Ex.: Escalar o Agente Uau para novos canais" /></F>
          <F l="Objetivo"><Textarea value={f.objective} onChange={set("objective")} /></F>
          <F l="Objetivo do OKR"><Textarea value={f.okrObjective} onChange={set("okrObjective")} /></F>
          <div className="space-y-2"><Label>Key Results *</Label>
            {krs.map((k, i) => (
              <div key={i} className="flex gap-2">
                <Input value={k} placeholder={`KR${i + 1}`} onChange={(e) => setKrs(krs.map((x, j) => (j === i ? e.target.value : x)))} />
                <Button variant="ghost" size="icon" aria-label="Remover KR" onClick={() => setKrs(krs.length > 1 ? krs.filter((_, j) => j !== i) : [""])}><Trash2 className="h-4 w-4" /></Button>
              </div>))}
            <Button variant="outline" size="sm" onClick={() => setKrs([...krs, ""])}><Plus className="h-4 w-4" />Adicionar KR</Button></div>
          <div className="grid gap-4 rounded-xl bg-muted p-4 md:grid-cols-2">
            <F l="Nome do KPI *"><Input value={f.kpiName} onChange={set("kpiName")} /></F>
            <F l="Fórmula"><Input value={f.formula} onChange={set("formula")} /></F>
            <F l="Baseline"><Input value={f.baseline} onChange={set("baseline")} /></F>
            <F l="Meta"><Input value={f.target} onChange={set("target")} /></F>
            <F l="Frequência"><Input value={f.frequency} onChange={set("frequency")} /></F>
            <F l="Responsável"><Input value={f.owner} onChange={set("owner")} /></F>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <F l="Resultados esperados"><Textarea value={f.expected} onChange={set("expected")} /></F>
            <F l="Iniciativas"><Textarea value={f.initiatives} onChange={set("initiatives")} /></F>
            <F l="Dependências"><Textarea value={f.dependencies} onChange={set("dependencies")} /></F>
            <F l="Riscos"><Textarea value={f.risks} onChange={set("risks")} /></F>
          </div>
          <F l="Critério de conclusão"><Textarea value={f.completion} onChange={set("completion")} /></F>
          {err && <p className="text-sm text-risk-ink">{err}</p>}
          <Button onClick={save}>Salvar meta no {quarterLabel(quarter)}</Button>
        </div>
        <div className={card + " h-fit space-y-3"}>
          <h2 className="font-display text-lg font-semibold">Metas cadastradas · {quarterLabel(quarter)}</h2>
          {!mine.length && <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada ainda neste quarter.</p>}
          {mine.map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-2 rounded-xl bg-muted p-3 text-sm">
              <div><PriorityTag p={m.priority} /> <span className="font-medium">{m.name}</span>
                <div className="text-xs text-muted-foreground">{m.krs.length} KRs · KPI: {m.kpi.name}</div></div>
              <Button variant="ghost" size="icon" aria-label="Excluir meta" onClick={() => confirm("Excluir esta meta?") && removeFront(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>))}
        </div>
      </div>
    </>
  );
}
function F({ l, children }: { l: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{l}</Label>{children}</div>;
}
