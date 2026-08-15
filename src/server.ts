import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../public");
const contentTypes: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (pathname === "/api/checkout") {
    response.writeHead(500, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "inventory service is unavailable" }));
    return;
  }
  const safePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = resolve(root, safePath);
  if (!file.startsWith(root) || !existsSync(file)) { response.writeHead(404); response.end("Not found"); return; }
  response.writeHead(200, { "content-type": contentTypes[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
});
server.listen(4173, () => console.log("ReproCapsule demo is available at http://localhost:4173"));
