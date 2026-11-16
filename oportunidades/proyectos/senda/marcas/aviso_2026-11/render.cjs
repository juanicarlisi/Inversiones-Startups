// SVG → PNG con Chromium (el mismo camino que scripts/generar_iconos.cjs de la app): node render.cjs carpeta tamaño
const fs = require("fs"), path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node22/lib/node_modules/playwright");
(async () => {
  const dir = process.argv[2], tam = parseInt(process.argv[3] || "96", 10);
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
  const p = await b.newPage();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".svg"))) {
    const s = fs.readFileSync(path.join(dir, f), "utf8").replace("<svg ", '<svg width="100%" height="100%" ');
    await p.setViewportSize({ width: tam, height: tam });
    await p.setContent(`<html><head><style>html,body{margin:0;background:transparent}</style></head><body><div style="width:${tam}px;height:${tam}px">${s}</div></body></html>`);
    await p.waitForTimeout(80);
    await p.screenshot({ path: path.join(dir, f.replace(".svg", `_${tam}.png`)), omitBackground: true, clip: { x: 0, y: 0, width: tam, height: tam } });
  }
  await b.close();
})();
