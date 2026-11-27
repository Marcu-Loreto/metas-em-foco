import { useRef, useState } from "react";
import { FolderOpen, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { loadLocalHistory, importHistoryText } from "@/lib/local-file-sync";

export function LoadDataButton() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    try {
      if (await loadLocalHistory()) toast.success("Dados carregados do histórico salvo.");
      else input.current?.click();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os dados.");
      input.current?.click();
    } finally { setBusy(false); }
  }
  async function importFile(file: File) {
    setBusy(true);
    try {
      importHistoryText(await file.text());
      toast.success("Dados carregados do arquivo selecionado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler o arquivo.");
    } finally { setBusy(false); }
  }
  return <>
    <Button variant="outline" onClick={load} disabled={busy} className="rounded-full">
      {busy ? <LoaderCircle className="animate-spin" /> : <FolderOpen />}{busy ? "Carregando…" : "Carregar dados"}
    </Button>
    <input ref={input} type="file" accept=".json,.local,application/json" aria-label="Arquivo de histórico" className="hidden" onChange={(event) => {
      const file = event.target.files?.[0];
      if (file) void importFile(file);
      event.target.value = "";
    }} />
  </>;
}