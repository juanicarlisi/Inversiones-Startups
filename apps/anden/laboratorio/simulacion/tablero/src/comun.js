import { tableFromIPC } from 'apache-arrow';
export const MAXN = Number(new URL(location.href).searchParams.get('n') ?? 1e9);
export async function cargarPaquetes() {
  const t0 = performance.now();
  const buf = await (await fetch('/datos/paquetes.arrow')).arrayBuffer();
  const t1 = performance.now();
  const tabla = tableFromIPC(buf);
  const n = Math.min(tabla.numRows, MAXN);
  const x = tabla.getChild('creado_min').toArray().subarray(0, n), y = tabla.getChild('espera_min').toArray().subarray(0, n);
  const noche = tabla.getChild('noche').toArray().subarray(0, n);
  return { x, y, noche, n, bytes: buf.byteLength, buf, tabla, msFetch: t1 - t0, msParse: performance.now() - t1 };
}
export const pintado = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now()))));
export const heapMB = () => (performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null);
export const mediana = (a) => { const s = [...a].sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
export const redondear = (x) => +x.toFixed(1);
