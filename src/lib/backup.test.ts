import { describe, it, expect } from "vitest";
import {
  BACKUP_APP,
  backupFileName,
  buildBackup,
  parseBackup,
  type BackupState,
} from "@/lib/backup";

const state: BackupState = {
  kr: { "gov-kr1": 15, "gov-kr2": 30, "uau-kr1": 100 },
  kpiValue: { gov: 40 },
  notes: { gov: "Guardrails em revisão." },
  summary: "Fechamento de dezembro.",
  summaries: { "Q1-2027": "Primeira meta do ano." },
  activeQuarter: "Q1-2027",
  quarters: ["Q4-2026", "Q1-2027"],
  dueDates: { gov: "2026-12-31" },
  customFronts: [
    {
      id: "x1",
      quarter: "Q1-2027",
      priority: "P1",
      name: "Meta teste",
      objective: "Objetivo",
      justification: "",
      okrObjective: "",
      expected: "",
      initiatives: "",
      dependencies: "",
      risks: "",
      completion: "",
      krs: [{ id: "x1-kr1", text: "KR único" }],
      kpi: { name: "", formula: "", baseline: "", target: "", frequency: "", owner: "" },
      plan: { nov: "", dec: "", close: "" },
    },
  ],
};

const D = new Date("2026-11-27T12:00:00Z");

describe("backupFileName", () => {
  it("traz o quarter e a data no nome do arquivo", () => {
    expect(backupFileName("Q1-2027", D)).toBe("historico-q1-2027-2026-11-27.json");
  });
  it("mantém o quarter base legível", () => {
    expect(backupFileName("Q4-2026", D)).toBe("historico-q4-2026-2026-11-27.json");
  });
});

describe("buildBackup + parseBackup", () => {
  it("preserva todos os dados num ida e volta", () => {
    const file = buildBackup(state, D);
    expect(file.app).toBe(BACKUP_APP);
    expect(file.exportedAt).toBe("2026-11-27T12:00:00.000Z");
    expect(parseBackup(JSON.stringify(file))).toEqual(state);
  });

  it("limita percentuais fora de 0–100", () => {
    const file = buildBackup({ ...state, kr: { "gov-kr1": 150, "gov-kr2": -8 } }, D);
    const back = parseBackup(JSON.stringify(file));
    expect(back.kr["gov-kr1"]).toBe(100);
    expect(back.kr["gov-kr2"]).toBe(0);
  });

  it("aceita um quarter ativo que não está na lista", () => {
    const file = buildBackup({ ...state, activeQuarter: "Q2-2027" }, D);
    const back = parseBackup(JSON.stringify(file));
    expect(back.activeQuarter).toBe("Q2-2027");
    expect(back.quarters).toContain("Q2-2027");
  });
});

describe("parseBackup rejeita arquivos ruins", () => {
  it("recusa texto que não é JSON", () => {
    expect(() => parseBackup("não é json")).toThrow(/JSON válido/);
  });
  it("recusa arquivo de outro app", () => {
    expect(() => parseBackup(JSON.stringify({ ...buildBackup(state, D), app: "outro" }))).toThrow(
      /não é um backup/,
    );
  });
  it("recusa versão mais nova", () => {
    expect(() =>
      parseBackup(JSON.stringify({ ...buildBackup(state, D), version: 99 })),
    ).toThrow(/versão mais nova/);
  });
  it("descarta metas sem nome ou quarter", () => {
    const file = buildBackup(state, D);
    const broken = JSON.stringify({ ...file, state: { ...file.state, customFronts: [{ id: "z" }] } });
    expect(() => parseBackup(broken)).toThrow(/quarter/);
  });
});
