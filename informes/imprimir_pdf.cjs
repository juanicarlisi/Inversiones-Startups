// Imprime un HTML a PDF con Chromium (Playwright). Uso: node informes/imprimir_pdf.cjs entrada.html salida.pdf "Título" [css] ["mes-año"]
// Con "css", el tamaño y los márgenes de cada página salen del CSS (@page, páginas con nombre como una hoja A3 apaisada).
// Requiere playwright (en este entorno: NODE_PATH=/opt/node22/lib/node_modules).
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const [entrada, salida, titulo = "Informe", modo = "", fecha = "sep-2026"] = process.argv.slice(2);
  const css = modo === "css";
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(entrada), { waitUntil: "networkidle" });
  await page.pdf({
    path: salida,
    format: "A4",
    preferCSSPageSize: css,
    printBackground: true,
    displayHeaderFooter: true,
    margin: css ? undefined : { top: "18mm", bottom: "18mm", left: "17mm", right: "17mm" },
    headerTemplate: `<div style="width:100%;font-size:7.5px;color:#898781;padding:0 17mm;font-family:'Liberation Sans',sans-serif;display:flex;justify-content:space-between;"><span>${titulo}</span><span>Uso privado · ${fecha}</span></div>`,
    footerTemplate: `<div style="width:100%;font-size:7.5px;color:#898781;padding:0 17mm;font-family:'Liberation Sans',sans-serif;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  });
  await browser.close();
  console.log("PDF escrito en", salida);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
