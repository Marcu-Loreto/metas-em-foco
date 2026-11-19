import type { Front } from "@/data/goals";
import { frontPct, overallPct, groupPct, status, STATUS_LABEL } from "@/lib/progress";

interface Data { fronts: Front[]; quarterLabel: string; range: { start: number; end: number }; kr: Record<string, number>; kpiValue: Record<string, number>; notes: Record<string, string>; summary: string }
const LIME: [number, number, number] = [126, 147, 0];

export async function buildReportPdf(d: Data): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...LIME); doc.rect(0, 0, W, 30, "F");
  doc.setTextColor(255); doc.setFontSize(18); doc.text(`Relatório Final · ${d.quarterLabel} – IA Agêntica`, 14, 15);
  doc.setFontSize(10); doc.text(`Gestor: Marcu · Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 23);
  doc.setTextColor(40);
  const total = overallPct(d.fronts, d.kr);
  doc.setFontSize(12);
  doc.text(`Completude geral (ponderada): ${total}%`, 14, 40);
  doc.text(`P0: ${groupPct(d.fronts.filter((f) => f.priority === "P0"), d.kr)}%   ·   P1/P2: ${groupPct(d.fronts.filter((f) => f.priority !== "P0"), d.kr)}%`, 14, 47);
  let y = 54;
  if (d.summary.trim()) {
    doc.setFontSize(11); doc.text("Resumo executivo", 14, y); y += 5;
    doc.setFontSize(9); const lines = doc.splitTextToSize(d.summary, W - 28); doc.text(lines, 14, y); y += lines.length * 4 + 4;
  }
  const head = { fillColor: LIME, textColor: 255 } as const;
  autoTable(doc, { startY: y, headStyles: head, styles: { fontSize: 8 },
    head: [["Prio", "Frente", "%", "Status", "KPI", "KPI %"]],
    body: d.fronts.map((f) => { const p = frontPct(f, d.kr); return [f.priority, f.name, `${p}%`, STATUS_LABEL[status(p, new Date(), d.range)], f.kpi.name, `${d.kpiValue[f.id] ?? 0}%`]; }) });
  for (const f of d.fronts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const last = (doc as any).lastAutoTable.finalY as number;
    autoTable(doc, { startY: last + 8, headStyles: head, styles: { fontSize: 8 }, columnStyles: { 0: { cellWidth: 150 } },
      head: [[`[${f.priority}] ${f.name} — ${frontPct(f, d.kr)}%`, "%"]],
      body: [
        ...f.krs.map((k, i) => [`KR${i + 1}: ${k.text}`, `${d.kr[k.id] ?? 0}%`]),
        [`KPI: ${f.kpi.name} · Meta: ${f.kpi.target}`, `${d.kpiValue[f.id] ?? 0}%`],
        [`Critério de conclusão: ${f.completion}`, ""],
        ...(d.notes[f.id]?.trim() ? [[`Notas: ${d.notes[f.id]}`, ""]] : []),
      ] });
  }
  return doc.output("blob");
}
