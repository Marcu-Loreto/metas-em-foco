import { useGoals } from "@/lib/store";
import { buildBackup, parseBackup } from "@/lib/backup";

/** When the dev server exposes /__local-data, load data/historico.json and keep it updated. */
export function startLocalFileSync(): () => void {
  if (!import.meta.env.DEV) return () => {};
  let unsub = () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancelled = false;
  const save = () =>
    fetch("/__local-data", {
      method: "PUT",
      body: JSON.stringify(buildBackup(useGoals.getState()), null, 2),
    }).catch(() => {});
  void (async () => {
    try {
      const r = await fetch("/__local-data");
      if (cancelled) return;
      if (r.ok) useGoals.setState(parseBackup(await r.text()));
      else if (r.status === 404) await save();
      else return;
    } catch { return; }
    unsub = useGoals.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(save, 600);
    });
  })();
  return () => { cancelled = true; clearTimeout(timer); unsub(); };
}
