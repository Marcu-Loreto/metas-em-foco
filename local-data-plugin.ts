import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/** Dev-only: reads/writes data/historico.json so the history lives in the project folder. */
export function localDataPlugin(): Plugin {
  const file = path.resolve(process.cwd(), "data/historico.json");
  return {
    name: "local-data-file",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__local-data", (req, res) => {
        if (req.method === "GET") {
          if (!fs.existsSync(file)) { res.statusCode = 404; return res.end(); }
          res.setHeader("Content-Type", "application/json");
          return res.end(fs.readFileSync(file, "utf8"));
        }
        if (req.method === "PUT") {
          let body = "";
          req.on("data", (c) => (body += c));
          req.on("end", () => {
            try {
              JSON.parse(body);
              fs.mkdirSync(path.dirname(file), { recursive: true });
              fs.writeFileSync(file, body);
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
