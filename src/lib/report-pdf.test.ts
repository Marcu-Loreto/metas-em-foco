import { describe, it, expect } from "vitest";
import { reportFileName, reportDueDate } from "./report-pdf";

describe("reportFileName", () => {
  it("traz a data no nome do arquivo", () => {
    expect(reportFileName("Q4-2026", new Date(2026, 10, 19))).toBe(
      "relatorio-q4-2026-ia-agentica-2026-11-19.pdf",
    );
  });
  it("complete mês e dia com zero", () => {
    expect(reportFileName("Q1-2027", new Date(2027, 0, 5))).toBe(
      "relatorio-q1-2027-ia-agentica-2027-01-05.pdf",
    );
  });
});

describe("datas de finalização no relatório", () => {
  it("inclui a data definida e os dias restantes", () => {
    expect(reportDueDate("2026-12-31", new Date(2026, 10, 27))).toBe("31/12/2026 · Faltam 34 dias");
  });
  it("não inventa um prazo quando a data não foi definida", () => {
    expect(reportDueDate(undefined)).toBe("Não definida");
  });
});
