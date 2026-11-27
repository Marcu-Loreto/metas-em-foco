import { beforeEach, describe, expect, it } from "vitest";
import { deadlineStatus, localDate } from "./closure";
import { useGoals } from "./store";
import { FRONTS } from "@/data/goals";

const now = new Date(2026, 10, 27);
describe("status de fechamento real", () => {
  it("KR1 fechado em 19/11 não fica atrasado em 27/11 se a estimativa era 19/11", () => {
    expect(deadlineStatus("2026-11-19", "2026-11-19", 100, now)?.label).toBe("Fechada no prazo");
  });
  it("fechamento antes da estimativa indica adiantado", () => {
    expect(deadlineStatus("2026-12-11", "2026-11-19", 100, now)?.label).toBe("Adiantado");
  });
  it("fechamento após a estimativa indica fechada com atraso", () => {
    expect(deadlineStatus("2026-12-11", "2026-12-13", 100, now)?.label).toBe("Fechada com atraso");
  });
  it("concluído sem fechamento conhecido não acumula atraso", () => {
    expect(deadlineStatus("2026-11-19", undefined, 100, now)?.tone).toBe("neutral");
  });
  it("KR aberto continua mostrando dias de atraso", () => {
    expect(deadlineStatus("2026-11-19", undefined, 85, now)?.label).toBe("Atrasada 8 dias");
  });
});

describe("registro de fechamento", () => {
  beforeEach(() => useGoals.setState({ kr: {}, closedDates: {}, dueDates: {}, customFronts: [] }));
  it("salva a data real de 19/11 e conclui o KR sem alterar a estimativa", () => {
    useGoals.setState({ dueDates: { orq: "2026-12-11", "orq-kr1": "2026-11-19" } });
    useGoals.getState().setClosedDate("orq-kr1", "2026-11-19");
    expect(useGoals.getState().closedDates["orq-kr1"]).toBe("2026-11-19");
    expect(useGoals.getState().kr["orq-kr1"]).toBe(100);
    expect(useGoals.getState().dueDates["orq-kr1"]).toBe("2026-11-19");
  });
  it("permite fechamento real após o prazo da meta sem ampliar sua estimativa", () => {
    useGoals.setState({ dueDates: { orq: "2026-12-11", "orq-kr1": "2026-12-11" } });
    useGoals.getState().setClosedDate("orq-kr1", "2026-12-13");
    expect(useGoals.getState().closedDates["orq-kr1"]).toBe("2026-12-13");
    expect(useGoals.getState().dueDates["orq"]).toBe("2026-12-11");
  });
  it("ao completar um KR registra hoje automaticamente e ao reabrir remove o fechamento", () => {
    useGoals.getState().setKr("orq-kr1", 100);
    expect(useGoals.getState().closedDates["orq-kr1"]).toBe(localDate());
    useGoals.getState().setKr("orq-kr1", 85);
    expect(useGoals.getState().closedDates["orq-kr1"]).toBeUndefined();
  });
  it("fecha a meta na última data real dos KRs e reabre junto com eles", () => {
    const front = FRONTS.find((f) => f.id === "orq");
    if (!front) throw new Error("Meta orq não encontrada");
    for (const [i, k] of front.krs.entries()) useGoals.getState().setClosedDate(k.id, i === 0 ? "2026-11-19" : "2026-11-20");
    expect(useGoals.getState().closedDates["orq"]).toBe("2026-11-20");
    useGoals.getState().setKr("orq-kr1", 50);
    expect(useGoals.getState().closedDates["orq"]).toBeUndefined();
  });
  it("fechamento explícito da meta conclui KRs e preserva os fechamentos já registrados", () => {
    useGoals.getState().setClosedDate("orq-kr1", "2026-11-19");
    useGoals.getState().setClosedDate("orq", "2026-11-27");
    expect(useGoals.getState().closedDates["orq"]).toBe("2026-11-27");
    expect(useGoals.getState().closedDates["orq-kr1"]).toBe("2026-11-19");
    expect(useGoals.getState().closedDates["orq-kr2"]).toBe("2026-11-27");
    expect(useGoals.getState().kr["orq-kr2"]).toBe(100);
  });
});