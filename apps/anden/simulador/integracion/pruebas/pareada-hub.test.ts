// integracion/pruebas/pareada-hub.test.ts · Andén simulador, corte 1 · Integración (hallazgo EST-02 de la revisión del 30-10-2026).
//
// La comparación pareada de «¿y si…?» medida con noches REALES del hub, no con exponenciales ni mezclas armadas a mano. El pozo
// (datos/pares-hub-chico.json, lo genera datos/generar-pares-hub.ts con el núcleo de producción) tiene 600 pares de hub-chico@1.0.0
// contra 4 puestos de inducción activos: las mismas noches en A y en B. Sus diferencias tienen las colas que rompían el IC de t
// (asimetría ≈ 12 en la espera P90, media y mediana de signo contrario). Con remuestreo del pozo (la distribución real de B − A) se
// exige, con la configuración de la app (las cien noches de A, cada indicador al 99%) y con la de antes (40 noches al 95%):
//   · el IC de la mediana (la noche típica que muestra la tabla) cubre la mediana del pozo al menos el nominal − 3 ee;
//   · el veredicto (prueba del signo) contradice a la mayoría de las noches del pozo como mucho (1 − confianza)/2 + 3 ee de las veces.
// Y se deja medido por qué el IC de t ya no decide: en la espera P90 y en el costo por paquete cubre la media menos del 80%.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { KpiId, ResultadoReplica } from '../../contratos/resultados.ts';
import { comparar } from '../../experimentos/estadistica/pareada.ts';
import { VERSION_MOTOR } from '../../nucleo/version.ts';
import { CONFIANZA_COMPARACIONES, KPI_COMPARACION, NOCHES_CONFIRMACION } from '../../app/sesion.ts';
import { ensamblar } from '../ensamblar.ts';
import { ARCHIVO_PARES, KPIS_PARES, diferenciasDe, modelosDelPozo, type PozoPares } from './datos/generar-pares-hub.ts';

const POZO = JSON.parse(readFileSync(ARCHIVO_PARES, 'utf8')) as PozoPares;
/** Confirmaciones remuestreadas por indicador y configuración. */
const M = 2000;

/** Generador congruencial (Numerical Recipes) con semilla fija: la prueba da siempre lo mismo. */
function uniformes(semilla: number): () => number {
  let x = semilla >>> 0;
  return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return (x + 0.5) / 4294967296; };
}
const resultado = (kpi: KpiId, valor: number, replica: number) =>
  ({ semilla: 1, replica, kpi: { [kpi]: valor }, alertas: [] }) as unknown as ResultadoReplica;

test('EST-02 · el pozo de noches reales es del motor de hoy y de los indicadores que compara «¿y si…?»', async () => {
  assert.equal(POZO.motor, VERSION_MOTOR,
    `el pozo es del motor ${POZO.motor} y el de hoy es ${VERSION_MOTOR}: regeneralo con node integracion/pruebas/datos/generar-pares-hub.ts`);
  assert.deepEqual([...KPIS_PARES], [...KPI_COMPARACION], 'los indicadores del pozo tienen que ser los de app/sesion.ts › KPI_COMPARACION');
  for (const k of KPIS_PARES) assert.equal(POZO.diferencias[k]?.length, POZO.noches, `«${k}» trae ${POZO.diferencias[k]?.length} pares y se esperaban ${POZO.noches}`);
  // las tres primeras réplicas, simuladas de nuevo, dan las mismas diferencias (el archivo no quedó viejo con el mismo número de versión)
  const E = ensamblar();
  const { a, b } = await modelosDelPozo(E);
  for (let r = 0; r < 3; r++) {
    const d = diferenciasDe(E, a, b, r);
    for (const k of KPIS_PARES) {
      const guardado = POZO.diferencias[k][r];
      assert.ok(Math.abs(d[k] - guardado) <= 1e-9 * Math.max(1, Math.abs(d[k])),
        `réplica ${r}, «${k}»: el pozo dice ${guardado} y el motor de hoy da ${d[k]}; regenerá el pozo`);
    }
  }
});

for (const [n, confianza, nombre] of [[NOCHES_CONFIRMACION, CONFIANZA_COMPARACIONES, 'la de la app'], [40, 0.95, 'la de antes']] as const) {
  test(`EST-02 · con noches reales del hub (${n} noches al ${confianza * 100}%, ${nombre}): el IC de la mediana cubre y el veredicto no contradice a la mayoría`, () => {
    const informe: string[] = [];
    for (const kpi of KPIS_PARES) {
      const z = POZO.diferencias[kpi], N = z.length;
      const orden = [...z].sort((x, y) => x - y);
      const mediana = N % 2 === 1 ? orden[(N - 1) / 2] : 0.5 * (orden[N / 2 - 1] + orden[N / 2]);
      const media = z.reduce((s, x) => s + x, 0) / N;
      const bajan = z.filter((x) => x < 0).length, suben = z.filter((x) => x > 0).length;
      const u = uniformes(20261031 + n);
      let cubreMediana = 0, cubreMedia = 0, contraMayoria = 0, veredictos = 0;
      for (let k = 0; k < M; k++) {
        const a: ResultadoReplica[] = [], b: ResultadoReplica[] = [];
        for (let i = 0; i < n; i++) { a.push(resultado(kpi, 0, i)); b.push(resultado(kpi, z[Math.floor(u() * N)], i)); }
        const c = comparar(a, b, kpi, confianza);
        if (c.icMediana && c.icMediana[0] <= mediana && mediana <= c.icMediana[1]) cubreMediana++;
        if (c.ic[0] <= media && media <= c.ic[1]) cubreMedia++;
        if (c.veredicto !== 'no-se-distingue') {
          veredictos++;
          const diceQueBaja = c.bMenor > c.bMayor;
          if ((diceQueBaja && suben > bajan) || (!diceQueBaja && bajan > suben)) contraMayoria++;
        }
      }
      const ee = Math.sqrt((confianza * (1 - confianza)) / M);
      informe.push(`${kpi}: mediana ${cubreMediana / M}, media con t ${cubreMedia / M}, ${veredictos} veredictos, ${contraMayoria} contra la mayoría`);
      assert.ok(cubreMediana / M >= confianza - 3 * ee,
        `«${kpi}»: el IC de la mediana cubrió ${(100 * cubreMediana / M).toFixed(1)}% y se esperaba al menos ${(100 * (confianza - 3 * ee)).toFixed(1)}%`);
      assert.ok(contraMayoria / M <= (1 - confianza) / 2 + 3 * ee,
        `«${kpi}»: ${contraMayoria} de ${M} veredictos contra la mayoría de las noches del pozo (${bajan} bajan, ${suben} suben)`);
      // por qué el IC de t ya no decide: con las colas del hub no cubre la media ni de cerca
      if (kpi === 'esperaP90Min' || kpi === 'costoPorPaquete') {
        assert.ok(cubreMedia / M < 0.8, `«${kpi}»: el IC de t cubrió la media ${(100 * cubreMedia / M).toFixed(1)}% (se esperaba < 80% con estas colas)`);
      }
    }
    console.log(`EST-02 · ${n} noches al ${confianza}: ${informe.join(' · ')}`);
  });
}
