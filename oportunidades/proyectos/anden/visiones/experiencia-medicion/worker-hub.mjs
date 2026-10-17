// Andén · visión «Experiencia» · simula noches enteras en un Worker (el hilo de la interfaz queda libre)
import { simular, HUB_BASE, hubGrande } from './hub.mjs';
self.onmessage = (e) => {
  const { cual, semillas } = e.data; const p = cual === 'base' ? HUB_BASE : hubGrande(); simular(p, 99, { traza: false });
  const ms = []; for (let s = 1; s <= semillas; s++) { const a = performance.now(); simular(p, s); ms.push(performance.now() - a); }
  ms.sort((x, y) => x - y); self.postMessage({ cual, semillas, msNocheMediana: +ms[ms.length >> 1].toFixed(0), msMin: +ms[0].toFixed(0), msMax: +ms[ms.length - 1].toFixed(0) });
};
