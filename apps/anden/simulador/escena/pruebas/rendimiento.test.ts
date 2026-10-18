// escena/pruebas/rendimiento.test.ts · P6. Costo INFORMATIVO de `posiciones` en el hub de 90.000 paquetes de la maqueta (corte-1.md §9 P6:
// meta ≤ 1 ms por cuadro en Node). Se informa con t.diagnostic y no decide nada: ninguna prueba depende del reloj de la máquina
// (§14.5); los presupuestos de verdad los mide el banco de la integración (§11). Lo único que se exige es que el recorrido termine con
// entidades a la vista.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearReproductor } from '../reproductor.ts';
import { componer2d } from '../componer2d.ts';
import { componerIso } from '../componeriso.ts';
import { encuadrar } from '../primitivas.ts';
import { estilos } from '../estilo.ts';
import { MAQUETA_90K, trazaDeMaquetaCon } from './ayudas.ts';

const META_MS = 1;
let cache: ReturnType<typeof trazaDeMaquetaCon> | null = null;
/** La traza de 90.000 se arma una vez para las dos pruebas (tarda ~1 s). */
const traza90k = () => (cache ??= trazaDeMaquetaCon(MAQUETA_90K, 1));

/** Mediana y P90 de una lista de tiempos (ms). */
function resumen(xs: number[]): { p50: number; p90: number } {
  const s = xs.slice().sort((a, b) => a - b);
  return { p50: s[Math.floor(s.length / 2)], p90: s[Math.min(s.length - 1, Math.floor(0.9 * s.length))] };
}

test('costo informativo: posiciones y recursos por cuadro en el hub de 90.000 de la maqueta (meta ≤ 1 ms)', (t) => {
  let a = performance.now();
  const tr = traza90k();
  const msTraza = performance.now() - a;
  a = performance.now();
  const rep = crearReproductor(tr);
  const msReproductor = performance.now() - a;
  const pos = rep.crearPosiciones(), rec = rep.crearEstadoRecursos();
  // reproducción a ×600 durante toda la noche: un cuadro cada 10 s de simulación (60 cuadros por segundo de pantalla)
  const paso = 10_000, n = Math.floor((rep.fin - rep.inicio) / paso);
  for (let i = 0; i < 60; i++) { rep.posiciones(rep.inicio + i * paso, pos); rep.recursos(rep.inicio + i * paso, rec); } // calentar
  const tiempos: number[] = [];
  let maxVisibles = 0;
  for (let i = 0; i < n; i++) {
    const ti = rep.inicio + i * paso;
    a = performance.now();
    rep.posiciones(ti, pos);
    rep.recursos(ti, rec);
    tiempos.push(performance.now() - a);
    maxVisibles = Math.max(maxVisibles, pos.n);
  }
  const r = resumen(tiempos);
  t.diagnostic(`maqueta 90k: ${tr.paquetes.n} paquetes, ${tr.tramos.n} tramos; traza ${msTraza.toFixed(0)} ms, reproductor ${msReproductor.toFixed(0)} ms`);
  t.diagnostic(`posiciones + recursos: mediana ${r.p50.toFixed(3)} ms, P90 ${r.p90.toFixed(3)} ms por cuadro en ${n} cuadros (máximo ${maxVisibles} entidades); meta ≤ ${META_MS} ms: ${r.p90 <= META_MS ? 'cumple' : 'NO cumple'}`);
  assert.ok(maxVisibles > 0, 'en algún cuadro tiene que haber entidades a la vista');
});

test('costo informativo: composición de la capa móvil (planta y 2,5D) en la maqueta de 90.000', (t) => {
  const rep = crearReproductor(traza90k());
  const marco = { ancho: 1280, alto: 800 };
  for (const piso of ['2d', 'iso'] as const) {
    const camara = encuadrar(rep.disposicion.limites, marco, piso), f = piso === 'iso' ? componerIso : componer2d;
    const tiempos: number[] = [];
    let prims = 0;
    for (let i = 0; i < 120; i++) {
      const ti = rep.inicio + ((rep.fin - rep.inicio) * (i + 0.5)) / 120;
      const a = performance.now();
      prims = f({ rep, t: ti, marco, camara, estilo: estilos.claro, capa: 'movil' }).length;
      if (i >= 10) tiempos.push(performance.now() - a);
    }
    const r = resumen(tiempos);
    t.diagnostic(`${piso}: componer la capa móvil, mediana ${r.p50.toFixed(2)} ms y P90 ${r.p90.toFixed(2)} ms (${prims} primitivas en el último cuadro); pintar se mide en el navegador`);
    assert.ok(prims > 0);
  }
});
