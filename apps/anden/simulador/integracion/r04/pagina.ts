// integracion/r04/pagina.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.7). Entrada de la página de R04 en el navegador.
// r04.mjs la empaqueta con esbuild en una carpeta temporal, la sirve por HTTP local y la abre con Playwright; la página expone
// window.__r04(), que calcula las mismas huellas que Node (huellas.ts) en el motor de JavaScript del navegador. No se publica.
import { calcularHuellas, type HuellasR04 } from './huellas.ts';

declare global {
  interface Window { __r04?: () => Promise<HuellasR04 & { ms: number; agente: string }> }
}

window.__r04 = async () => {
  const t0 = performance.now();
  const r = await calcularHuellas();
  return { ...r, ms: performance.now() - t0, agente: navigator.userAgent };
};
const estado = document.getElementById('estado');
if (estado) estado.textContent = 'Lista para medir R04.';
document.body.dataset.listo = '1';
