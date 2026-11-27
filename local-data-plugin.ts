import path from "node:path";
import type { Plugin } from "vite";
import { readHistory, writeHistory } from "./local-history-file";

/** Dev-only: reads/writes JSON in data/, recovering preserved private history when needed. */
export function localDataPlugin(): Plugin {
  const directory = path.resolve(process.cwd(), "data");
  return {
    name: "local-data-file",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__local-data", (req, res): void => {
        if (req.method === "GET") {
          let text: string | undefined;
          try { text = readHistory(directory); }
          catch { res.statusCode = 500; res.end(); return; }
          if (text === undefined) { res.statusCode = 404; res.end(); return; }
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(text);
          return;
        }
        if (req.method === "PUT") {
          let body = "";
          req.on("data", (c) => (body += c));
          req.on("end", () => {
            try {
              writeHistory(directory, body);
              res.statusCode = 204;
            } catch { res.statusCode = 400; }
            res.end();
          });
          return;
        }
        res.statusCode = 405; res.end();
      });
    },
  };
}
