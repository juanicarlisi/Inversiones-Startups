// Capturas y mediciones con Chromium (Playwright del entorno). Uso: node herramientas/captura.mjs <nombre|todo> ...
import { createRequire } from "node:module"; import { spawn } from "node:child_process"; import fs from "node:fs";
const require = createRequire("/opt/node-tools/node_modules/"); const { chromium } = require("playwright");
const PORT = 8765, CH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const JOBS = {
  "local-300": { q: "base=local&n=300&t=900", png: "01-local-300-camiones.png" },
  "local-300-puntos": { q: "base=local&n=300&t=900&heads=dots&glow=1", png: "02-local-300-puntos.png" },
  "pmtiles-300": { q: "base=pmtiles&n=300&t=900", png: "03-pmtiles-protomaps-300.png" },
  "ofm-300": { q: "base=ofm&n=300&t=900", png: "04-openfreemap-300.png", proxy: true },
  "pmtiles-zoom": { q: "base=pmtiles&n=300&t=900&zoom=17.2&pitch=62&bearing=35&lng=-58.4437&lat=-34.5995", png: "05-pmtiles-camiones-cerca.png" },
  "or0": { q: "base=local&n=300&t=900&heads=trucks&glow=0&bld=0&zoom=19.4&pitch=0&bearing=0&lng=-58.4348&lat=-34.6011&yawoff=0&rolloff=90&truck=3", png: "x-or0.png", w: 700, h: 450 },
  "or90": { q: "base=local&n=300&t=900&heads=trucks&glow=0&bld=0&zoom=19.4&pitch=0&bearing=0&lng=-58.4348&lat=-34.6011&yawoff=90&rolloff=90&truck=3", png: "x-or90.png", w: 700, h: 450 },
  "or180": { q: "base=local&n=300&t=900&heads=trucks&glow=0&bld=0&zoom=19.4&pitch=0&bearing=0&lng=-58.4348&lat=-34.6011&yawoff=180&rolloff=90&truck=3", png: "x-or180.png", w: 700, h: 450 },
  "or270": { q: "base=local&n=300&t=900&heads=trucks&glow=0&bld=0&zoom=19.4&pitch=0&bearing=0&lng=-58.4348&lat=-34.6011&yawoff=270&rolloff=90&truck=3", png: "x-or270.png", w: 700, h: 450 },
  "calor": { q: "base=pmtiles&n=300&t=900&heat=1&heads=none&zoom=14.2&pitch=45", png: "06-pmtiles-calor.png" },
  "cenital": { q: "base=pmtiles&n=300&t=1500&heads=dots&pitch=0&bearing=0&zoom=14.4&bld=0", png: "07-cenital-trazas.png" },
};
const BENCH = [ // [base, n, heads, extra]
  ["local", 300, "none", "&bld=0&glow=0"], ["local", 300, "dots", "&bld=0&glow=0"], ["local", 1000, "dots", "&bld=0&glow=0"], ["local", 3000, "dots", "&bld=0&glow=0"], ["local", 10000, "dots", "&bld=0&glow=0"],
  ["local", 300, "trucks", "&bld=0&glow=0"], ["local", 3000, "trucks", "&bld=0&glow=0"], ["local", 300, "trucks", ""], ["pmtiles", 300, "trucks", ""],
  ["local", 1000, "dots", "&bld=0&glow=0&round=0"] ];
const args = process.argv.slice(2); const want = args.length ? args : ["todo"];
const srv = spawn("node", ["herramientas/servidor.mjs", String(PORT)], { stdio: "ignore" }); await new Promise(r => setTimeout(r, 600));
const launch = (proxy) => chromium.launch({ executablePath: CH, headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl", "--disable-dev-shm-usage"] });
async function pagina(b, q, w = 1600, h = 900) { const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const p = await ctx.newPage(); const logs = [];
  p.on("console", m => { if (["error", "warning"].includes(m.type())) logs.push(m.type() + ": " + m.text().slice(0, 200)); }); p.on("pageerror", e => logs.push("pageerror: " + String(e).slice(0, 200)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html?${q}`); try { await p.waitForFunction("window.__listo === true", null, { timeout: 120000 }); } catch (e) { console.log("NO LISTO", q, JSON.stringify(logs).slice(0, 600), await p.evaluate("JSON.stringify({err: window.__errores, ready: document.readyState})").catch(x => "evaluate: " + x)); throw e; } return { p, logs, ctx }; }
let r_load = 0;
try {
  for (const [name, j] of Object.entries(JOBS)) { if (!want.includes("todo") && !want.includes(name)) continue;
    const b = await launch(j.proxy); const { p, logs, ctx } = await pagina(b, j.q, j.w || 1600, j.h || 900);
    await p.waitForFunction("window.__quieto === true", null, { timeout: 120000 }); await p.waitForTimeout(j.proxy ? 4000 : 1500);
    await p.screenshot({ path: "capturas/" + j.png, timeout: 90000 }); const err = await p.evaluate("window.__errores||[]");
    console.log(name, "->", j.png, "| errores mapa:", JSON.stringify(err).slice(0, 300), "| consola:", JSON.stringify(logs).slice(0, 300)); await ctx.close(); await b.close(); }
  const bsel = want.filter(w => /^bench:\d+$/.test(w)).map(w => +w.split(":")[1]);
  if (want.includes("todo") || want.includes("bench") || bsel.length) { const res = [];
    for (const [bi, [base, n, heads, extra]] of BENCH.entries()) { if (bsel.length && !bsel.includes(bi)) continue; const b = await launch(); const { p, logs, ctx } = await pagina(b, `base=${base}&n=${n}&heads=${heads}${extra}&bench=6&speed=120`, 640, 360); r_load = fs.readFileSync("/proc/loadavg", "utf8").split(" ")[0];
      await p.waitForFunction("window.__bench", null, { timeout: 900000 }); const r = await p.evaluate("window.__bench"); r.carga_cpu_1min = +r_load; r.nucleos = 4; res.push(r); console.log(JSON.stringify(r)); if (logs.length) console.log("  consola:", JSON.stringify(logs).slice(0, 300)); await ctx.close(); await b.close(); }
    fs.writeFileSync(bsel.length ? `datos/medidas_fps_${bsel.join("_")}.json` : "datos/medidas_fps.json", JSON.stringify(res, null, 1)); }
} finally { srv.kill(); }
