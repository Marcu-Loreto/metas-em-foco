import type { Front, Priority } from "@/data/goals";
import type { CustomFront } from "@/lib/store";
import { BASE_QUARTER, sortQuarters } from "@/lib/quarters";

export const BACKUP_APP = "metas-q4-2026";
export const BACKUP_VERSION = 1;

export type BackupState = {
  kr: Record<string, number>;
  kpiValue: Record<string, number>;
  notes: Record<string, string>;
  summary: string;
  summaries: Record<string, string>;
  activeQuarter: string;
  quarters: string[];
  customFronts: CustomFront[];
  dueDates: Record<string, string>;
  closedDates: Record<string, string>;
};

export type BackupFile = {
  app: string;
  version: number;
  exportedAt: string;
  state: BackupState;
};

const PRIORITIES: Priority[] = ["P0", "P1", "P2"];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function numMap(v: unknown, field: string): Record<string, number> {
  if (!isRecord(v)) throw new Error(`O campo "${field}" não está num formato válido.`);
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "number" && Number.isFinite(val)) {
      out[k] = Math.min(100, Math.max(0, Math.round(val)));
    }
  }
  return out;
}

function strMap(v: unknown, field: string): Record<string, string> {
  if (!isRecord(v)) throw new Error(`O campo "${field}" não está num formato válido.`);
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) if (typeof val === "string") out[k] = val;
  return out;
}

const str = (v: unknown, field: string) => {
  if (typeof v !== "string") throw new Error(`O campo "${field}" está incompleto.`);
  return v;
};

/** Keeps only the fields the app knows, so an edited/hand-written file can't inject junk. */
function normalizeFront(v: unknown, i: number): CustomFront {
  if (!isRecord(v)) throw new Error(`A meta nº ${i + 1} está inválida.`);
  const id = str(v["id"], `id da meta nº ${i + 1}`);
  const priority = v["priority"];
  const krs = Array.isArray(v["krs"]) ? v["krs"] : [];
  const kpi = isRecord(v["kpi"]) ? v["kpi"] : {};
  const plan = isRecord(v["plan"]) ? v["plan"] : {};
  return {
    id,
    quarter: str(v["quarter"], `quarter da meta "${id}"`),
    priority: PRIORITIES.includes(priority as Priority) ? (priority as Priority) : "P2",
    name: str(v["name"], `nome da meta "${id}"`),
    objective: typeof v["objective"] === "string" ? v["objective"] : "",
    justification: typeof v["justification"] === "string" ? v["justification"] : "",
    okrObjective: typeof v["okrObjective"] === "string" ? v["okrObjective"] : "",
    expected: typeof v["expected"] === "string" ? v["expected"] : "",
    initiatives: typeof v["initiatives"] === "string" ? v["initiatives"] : "",
    dependencies: typeof v["dependencies"] === "string" ? v["dependencies"] : "",
    risks: typeof v["risks"] === "string" ? v["risks"] : "",
    completion: typeof v["completion"] === "string" ? v["completion"] : "",
    krs: krs.flatMap((k) =>
      isRecord(k) && typeof k["id"] === "string" && typeof k["text"] === "string"
        ? [{ id: k["id"], text: k["text"] }]
        : [],
    ),
    kpi: {
      name: typeof kpi["name"] === "string" ? kpi["name"] : "",
      formula: typeof kpi["formula"] === "string" ? kpi["formula"] : "",
      baseline: typeof kpi["baseline"] === "string" ? kpi["baseline"] : "",
      target: typeof kpi["target"] === "string" ? kpi["target"] : "",
      frequency: typeof kpi["frequency"] === "string" ? kpi["frequency"] : "",
      owner: typeof kpi["owner"] === "string" ? kpi["owner"] : "",
    },
    plan: {
      nov: typeof plan["nov"] === "string" ? plan["nov"] : "",
      dec: typeof plan["dec"] === "string" ? plan["dec"] : "",
      close: typeof plan["close"] === "string" ? plan["close"] : "",
    },
  };
}

export function buildBackup(s: BackupState, exportedAt = new Date()): BackupFile {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    state: {
      kr: s.kr,
      kpiValue: s.kpiValue,
      notes: s.notes,
      summary: s.summary,
      summaries: s.summaries,
      activeQuarter: s.activeQuarter,
      quarters: s.quarters,
      customFronts: s.customFronts,
      dueDates: s.dueDates,
      closedDates: s.closedDates,
    },
  };
}

/** "Q1-2027" + 27/11/2026 -> "historico-q1-2027-2026-11-27.json" */
export function backupFileName(quarter: string, date = new Date()): string {
  const slug = quarter.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "metas";
  return `historico-${slug}-${date.toISOString().slice(0, 10)}.json`;
}

export function parseBackup(text: string): BackupState {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }
  if (!isRecord(raw)) throw new Error("O arquivo não tem o formato esperado.");
  if (raw["app"] !== BACKUP_APP) throw new Error("Este arquivo não é um backup das metas deste app.");
  const version = raw["version"];
  if (typeof version !== "number" || version > BACKUP_VERSION) {
    throw new Error("Este backup foi gerado por uma versão mais nova do app.");
  }
  const s = raw["state"];
  if (!isRecord(s)) throw new Error("O arquivo não traz os dados das metas.");

  const quarters = Array.isArray(s["quarters"])
    ? sortQuarters(s["quarters"].filter((q): q is string => typeof q === "string"))
    : [];
  const storedActive = typeof s["activeQuarter"] === "string" ? s["activeQuarter"] : BASE_QUARTER;
  const activeUsable = /^Q[1-4]-\d{4}$/.test(storedActive);
  // The quarter being viewed has to stay selectable, so it joins the list when it is missing.
  const withBase = sortQuarters([...quarters, ...(activeUsable ? [storedActive] : [])]);
  const activeQuarter = activeUsable ? storedActive : (withBase[0] ?? BASE_QUARTER);

  return {
    kr: numMap(s["kr"], "kr"),
    kpiValue: numMap(s["kpiValue"], "kpiValue"),
    notes: strMap(s["notes"], "notes"),
    summary: typeof s["summary"] === "string" ? s["summary"] : "",
    summaries: strMap(s["summaries"], "summaries"),
    activeQuarter,
    quarters: withBase,
    dueDates: isRecord(s["dueDates"]) ? strMap(s["dueDates"], "dueDates") : {},
    closedDates: isRecord(s["closedDates"]) ? strMap(s["closedDates"], "closedDates") : {},
    customFronts: (Array.isArray(s["customFronts"]) ? s["customFronts"] : []).map(normalizeFront),
  };
}

export function downloadJson(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type FrontShape = Front;
