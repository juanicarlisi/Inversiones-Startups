// Imprime un HTML a PDF con Chromium (Playwright). Uso: node informes/imprimir_pdf.cjs entrada.html salida.pdf "Título"
// Requiere playwright (en este entorno: NODE_PATH=/opt/node22/lib/node_modules).
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const [entrada, salida, titulo = "Informe"] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(entrada), { waitUntil: "networkidle" });
  await page.pdf({
    path: salida,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    margin: { top: "18mm", bottom: "18mm", left: "17mm", right: "17mm" },
    headerTemplate: `<div style="width:100%;font-size:7.5px;color:#898781;padding:0 17mm;font-family:'Liberation Sans',sans-serif;display:flex;justify-content:space-between;"><span>${titulo}</span><span>Uso privado · sep-2026</span></div>`,
    footerTemplate: `<div style="width:100%;font-size:7.5px;color:#898781;padding:0 17mm;font-family:'Liberation Sans',sans-serif;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  });
  await browser.close();
  console.log("PDF escrito en", salida);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
