import { useGoals } from "@/lib/store";
import { buildBackup, parseBackup } from "@/lib/backup";

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let loading = 0;
let canSave = false;

export function importHistoryText(text: string) {
  const state = parseBackup(text);
  canSave = true;
  useGoals.setState(state);
  return state;
}

/** Reload without letting a pending empty-browser save overwrite the file first. */
export async function loadLocalHistory(): Promise<boolean> {
  if (!import.meta.env.DEV) return false;
  clearTimeout(saveTimer);
  loading += 1;
  try {
    const response = await fetch("/__local-data", { cache: "no-store" });
    if (response.status === 404) { canSave = true; return false; }
    if (!response.ok) throw new Error("Não foi possível ler o histórico salvo. Selecione seu arquivo JSON.");
    const state = parseBackup(await response.text());
    canSave = true;
    useGoals.setState(state);
    return true;
  } finally { loading -= 1; }
}

/** Browser hydration precedes file loading; only later edits trigger writes. */
export function startLocalFileSync(): () => void {
  canSave = false;
  let unsub = () => {};
  let cancelled = false;
  const save = () =>
    fetch("/__local-data", {
      method: "PUT",
      body: JSON.stringify(buildBackup(useGoals.getState()), null, 2),
    }).catch(() => {});
  void (async () => {
    try {
      await useGoals.persist.rehydrate();
      if (cancelled || !import.meta.env.DEV) return;
      try { await loadLocalHistory(); } catch { /* Keep writes paused until recovery succeeds. */ }
      if (cancelled) return;
    } catch { return; }
    unsub = useGoals.subscribe(() => {
      if (loading || cancelled || !canSave) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, 600);
    });
  })();
  return () => { cancelled = true; clearTimeout(saveTimer); unsub(); };
}
