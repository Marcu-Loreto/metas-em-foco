import { describe, it, expect } from "vitest";
import { FRONTS } from "@/data/goals";
import { frontPct, overallPct, status } from "./progress";

describe("progress", () => {
  it("front % is the average of its KRs", () => {
    const f = FRONTS[0]!;
    expect(frontPct(f, { [f.krs[0]!.id]: 100, [f.krs[1]!.id]: 50 })).toBe(38);
  });
  it("P0 fronts carry 80% of the overall weight", () => {
    const kr: Record<string, number> = {};
    FRONTS.filter((f) => f.priority === "P0").forEach((f) => f.krs.forEach((k) => (kr[k.id] = 100)));
    expect(overallPct(FRONTS, kr)).toBe(80);
  });
  it("status flags risk when far behind the calendar", () => {
    expect(status(10, new Date(Date.UTC(2026, 11, 20)))).toBe("risco");
    expect(status(100)).toBe("concluido");
  });
});

import { quarterRange } from "@/lib/quarters";
describe("quarters", () => {
  it("Q1/2027 vai de 1º jan a 31 mar", () => {
    const r = quarterRange("Q1-2027");
    expect(new Date(r.start).toISOString().slice(0, 10)).toBe("2027-01-01");
    expect(new Date(r.end).toISOString().slice(0, 10)).toBe("2027-03-31");
  });
});
