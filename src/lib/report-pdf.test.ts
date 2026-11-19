import { describe, it, expect } from "vitest";
import { reportFileName } from "./report-pdf";

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
