// Corre web/index.html en Chromium (Playwright del entorno) y devuelve el resultado de PyVRP-WASM. Uso: node probar_navegador.mjs <n> <segundos> <semilla> [rebanada]
import { createRequire } from "node:module"; import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const require = createRequire("/opt/node-tools/node_modules/"); const { chromium } = require("playwright");
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); const [n = 200, t = 10, seed = 1, slice = 0, iter = 0] = process.argv.slice(2).map(Number);
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm", ".json": "application/json", ".py": "text/x-python", ".whl": "application/zip", ".zip": "application/zip" };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split("?")[0]); const f = path.join(raiz, u); if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); });
await new Promise(ok => srv.listen(0, "127.0.0.1", ok)); const puerto = srv.address().port;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", headless: true, args: ["--disable-dev-shm-usage"] });
const p = await (await b.newContext()).newPage(); const logs = []; p.on("console", m => { if (["error", "warning"].includes(m.type())) logs.push(m.text().slice(0, 160)); }); p.on("pageerror", e => logs.push("pageerror " + String(e).slice(0, 160)));
const t0 = Date.now(); await p.goto(`http://127.0.0.1:${puerto}/rust-wasm/index.html?n=${n}&t=${t}&suf=${process.argv[7] || ""}`);
await p.waitForFunction("window.__listo === true", null, { timeout: 600000 }); const r = await p.evaluate("window.__resultado");
const nav = await p.evaluate(() => navigator.userAgent); console.log(JSON.stringify({ n, limite_s: t, semilla: seed, rebanada: slice, iter_fijas: iter, total_ms: Date.now() - t0, ua: nav.match(/Chrome\/[\d.]+/)?.[0], ...r, consola: logs.slice(0, 3) })); await b.close(); srv.close();
