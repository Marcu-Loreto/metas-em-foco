import { describe, expect, it } from "vitest";
import { daysLeft, daysLeftLabel } from "./due";
const today = new Date(2026, 10, 27);
describe("dias restantes", () => {
  it("conta dias até a data final", () => expect(daysLeft("2026-12-31", today)).toBe(34));
  it("zero no dia", () => expect(daysLeftLabel(daysLeft("2026-11-27", today))).toBe("Vence hoje"));
  it("negativo quando atrasada", () => expect(daysLeftLabel(daysLeft("2026-11-24", today))).toBe("Atrasada 3 dias"));
});
