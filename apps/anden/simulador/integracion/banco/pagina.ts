// integracion/banco/pagina.ts · Andén simulador, corte 1 · Integración (corte-1.md §11). Página de referencia del banco en el navegador.
// §11 pide reportar los presupuestos que dependen de la máquina también como cociente contra una referencia medida en la misma corrida:
// los eventos por segundo de una M/M/1 sintética (integracion/bateria/mm1.ts) con el núcleo de producción. Esta página la corre en el
// hilo principal del navegador; banco.mjs la abre junto a la app. No se publica.
import { crearMotor } from '../../nucleo/indice.ts';
import { correrMM1 } from '../bateria/mm1.ts';

declare global {
  interface Window { __referencia?: (horizonte: number, replica: number) => { eventos: number; ms: number; huella: string } }
}

window.__referencia = (horizonte, replica) => {
  const t0 = performance.now();
  const r = correrMM1(crearMotor, { id: 'banco', lambda: 0.8, mu: 1, horizonte }, 20261017, replica);
  return { eventos: r.eventos, ms: performance.now() - t0, huella: r.huella };
};
const estado = document.getElementById('estado');
if (estado) estado.textContent = 'Lista para medir la referencia del banco.';
document.body.dataset.listo = '1';
