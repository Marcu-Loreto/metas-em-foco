import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGoals } from "./store";
import { buildBackup } from "./backup";
import { loadLocalHistory, startLocalFileSync, importHistoryText } from "./local-file-sync";

let stop = () => {};
beforeEach(() => {
  localStorage.clear();
  useGoals.setState({ kr: {}, kpiValue: {}, notes: {}, summary: "", summaries: {}, quarters: ["Q4-2026"], activeQuarter: "Q4-2026", customFronts: [], dueDates: {}, closedDates: {} });
});
afterEach(() => { stop(); vi.unstubAllGlobals(); });
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("carregar dados do JSON", () => {
  it("recupera o KR1 concluído e sua data sem alterar os registros fechados", async () => {
    const saved = buildBackup({ ...useGoals.getState(), kr: { "orq-kr1": 100 }, dueDates: { "orq-kr1": "2026-11-19" }, closedDates: { "orq-kr1": "2026-11-19" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(saved))));
    expect(await loadLocalHistory()).toBe(true);
    expect(useGoals.getState().kr["orq-kr1"]).toBe(100);
    expect(useGoals.getState().closedDates["orq-kr1"]).toBe("2026-11-19");
    expect(useGoals.getState().dueDates["orq-kr1"]).toBe("2026-11-19");
  });
  it("não substitui o arquivo por valores vazios quando a leitura retorna 404", async () => {
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(new Response(null, { status: 404 })));
    vi.stubGlobal("fetch", fetcher);
    stop = startLocalFileSync();
    await wait(700);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[1]).toEqual({ cache: "no-store" });
  });
  it("cancela a gravação pendente ao carregar os dados salvos", async () => {
    const saved = buildBackup({ ...useGoals.getState(), kr: { "orq-kr1": 100 } });
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(saved))));
    vi.stubGlobal("fetch", fetcher);
    stop = startLocalFileSync();
    await wait(30);
    useGoals.getState().setNote("orq", "Mudança pendente");
    await loadLocalHistory();
    await wait(700);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(useGoals.getState().notes["orq"]).toBeUndefined();
  });
  it("recusa JSON inválido sem apagar o estado atual", async () => {
    useGoals.getState().setKr("orq-kr1", 100);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("inválido")));
    await expect(loadLocalHistory()).rejects.toThrow(/JSON válido/);
    expect(useGoals.getState().kr["orq-kr1"]).toBe(100);
  });
  it("retoma a gravação após importar o JSON quando a leitura inicial falhou", async () => {
    const saved = buildBackup({ ...useGoals.getState(), kr: { "orq-kr1": 100 }, closedDates: { "orq-kr1": "2026-11-19" } });
    const fetcher = vi.fn().mockImplementation((_url: string, options?: { method?: string; body?: string }) => Promise.resolve(new Response(null, { status: options?.method === "PUT" ? 204 : 500 })));
    vi.stubGlobal("fetch", fetcher);
    stop = startLocalFileSync();
    await wait(30);
    importHistoryText(JSON.stringify(saved));
    await wait(700);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const written = JSON.parse(fetcher.mock.calls[1]?.[1]?.body ?? "{}");
    expect(written.state.closedDates["orq-kr1"]).toBe("2026-11-19");
  });
});