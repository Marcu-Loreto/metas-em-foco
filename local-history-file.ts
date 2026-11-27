import fs from "node:fs";
import path from "node:path";

/** Node-only Vite tooling. Private JSON remains readable without entering source commits. */
export function historyFile(directory: string): string {
  const privateFile = path.join(directory, "historico.json.local");
  const legacy = path.join(directory, "historico.json");
  return fs.existsSync(privateFile) || !fs.existsSync(legacy) ? privateFile : legacy;
}

export function writeHistory(directory: string, text: string): void {
  JSON.parse(text);
  fs.mkdirSync(directory, { recursive: true });
  const file = historyFile(directory);
  const temporary = `${file}.tmp.local`;
  fs.writeFileSync(temporary, text);
  fs.renameSync(temporary, file);
}

export function readHistory(directory: string): string | undefined {
  const file = historyFile(directory);
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  if (!fs.existsSync(directory)) return undefined;
  const preserved = fs.readdirSync(directory)
    .filter((name) => /^historico-.*preservado.*\.local$/.test(name))
    .map((name) => path.join(directory, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const candidate of preserved) {
    const text = fs.readFileSync(candidate, "utf8");
    try {
      const backup = JSON.parse(text);
      if (backup?.app !== "metas-q4-2026" || !backup.state) continue;
      writeHistory(directory, text);
      return text;
    } catch { continue; }
  }
  return undefined;
}