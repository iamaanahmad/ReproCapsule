import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = dirname(fileURLToPath(import.meta.url));
const publicRoot = resolve(compiledRoot, "../../public");
const contentTypes: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const sendFile = (response: import("node:http").ServerResponse, file: string): void => { response.writeHead(200, { "content-type": contentTypes[extname(file)] ?? "application/octet-stream" }); createReadStream(file).pipe(response); };

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (pathname === "/api/checkout") { response.writeHead(500, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "inventory service is unavailable" })); return; }
  if (pathname.startsWith("/_modules/")) {
    const moduleName = pathname.slice("/_modules/".length);
    const allowed = new Set(["sanitize.js", "validation.js"]);
    const file = resolve(compiledRoot, moduleName);
    if (!allowed.has(moduleName) || !file.startsWith(compiledRoot) || !existsSync(file)) { response.writeHead(404); response.end("Not found"); return; }
    sendFile(response, file); return;
  }
  const safePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = resolve(publicRoot, safePath);
  if (!file.startsWith(publicRoot) || !existsSync(file)) { response.writeHead(404); response.end("Not found"); return; }
  sendFile(response, file);
});
server.listen(4173, "127.0.0.1", () => console.log("ReproCapsule demo is available at http://127.0.0.1:4173"));
