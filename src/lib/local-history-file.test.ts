import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { historyFile, readHistory, writeHistory } from "../../local-history-file";

let directory: string;
const text = JSON.stringify({ app: "metas-q4-2026", state: { kr: { "orq-kr1": 100 }, closedDates: { "orq-kr1": "2026-11-19" } } });
beforeEach(() => { directory = fs.mkdtempSync(path.join(os.tmpdir(), "history-recovery-")); });
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

describe("histórico local preservado", () => {
  it("recupera o fechamento de 19/11 sem apagar a cópia preservada", () => {
    const source = path.join(directory, "historico-fechamentos-preservado.local");
    fs.writeFileSync(source, text);
    expect(readHistory(directory)).toBe(text);
    expect(fs.readFileSync(source, "utf8")).toBe(text);
    expect(fs.readFileSync(path.join(directory, "historico.json.local"), "utf8")).toBe(text);
  });
  it("mantém compatibilidade com o JSON já existente", () => {
    fs.writeFileSync(path.join(directory, "historico.json"), text);
    expect(readHistory(directory)).toBe(text);
    expect(historyFile(directory)).toBe(path.join(directory, "historico.json"));
  });
  it("não altera o histórico quando a gravação contém JSON inválido", () => {
    writeHistory(directory, text);
    expect(() => writeHistory(directory, "inválido")).toThrow();
    expect(readHistory(directory)).toBe(text);
  });
  it("não cria histórico vazio durante a leitura sem dados", () => {
    expect(readHistory(directory)).toBeUndefined();
    expect(fs.readdirSync(directory)).toEqual([]);
  });
});