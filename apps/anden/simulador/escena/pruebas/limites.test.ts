// escena/pruebas/limites.test.ts · P6. Ninguna posición NaN ni fuera de `limites` en 1.000 instantes (corte-1.md §9 P6), con la traza de
// la maqueta medida (24.000 paquetes) y con trazas sintéticas; y la disposición fija (rampas, estaciones, andenes, fila, mesas) siempre
// adentro de los límites.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { ClaseEntidad, TipoTramo, type Traza } from '../../contratos/traza.ts';
import { EstadoVisual } from '../../contratos/vistas.ts';
import { crearReproductor } from '../reproductor.ts';
import { crearDisposicion, lugarEnFila, type Disposicion, type Limites } from '../disposicion.ts';
import { MAQUETA_90K, PERSONAS, geometriaSintetica, lazoEnMarcha, trazaDeMaquetaCon, trazaSintetica } from './ayudas.ts';

const ESTADOS = new Set<number>(Object.values(EstadoVisual));
const CLASES = new Set<number>(Object.values(ClaseEntidad));

/** Recorre `n` instantes parejos de [inicio − 1 min, fin + 1 min] y junta todo lo que esté mal, con el primer ejemplo de cada cosa. */
function recorrer(tr: Traza, n = 1000): { malos: string[]; maxN: number; recortes: number } {
  const rep = crearReproductor(tr), pos = rep.crearPosiciones(), rec = rep.crearEstadoRecursos();
  const L = tr.geometria.limites, malos: string[] = [];
  let maxN = 0;
  const a = tr.inicio - 60_000, b = tr.fin + 60_000;
  for (let i = 0; i < n; i++) {
    const t = a + ((b - a) * i) / (n - 1);
    rep.posiciones(t, pos);
    rep.recursos(t, rec);
    maxN = Math.max(maxN, pos.n);
    for (let k = 0; k < pos.n; k++) {
      const x = pos.x[k], y = pos.y[k], que = `t = ${t.toFixed(0)} ms, clase ${pos.clase[k]} id ${pos.id[k]}`;
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(pos.ang[k])) malos.push(`${que}: posición no finita (${x}, ${y}, ${pos.ang[k]})`);
      else if (x < L.xmin || x > L.xmax || y < L.ymin || y > L.ymax) malos.push(`${que}: (${x}, ${y}) fuera de ${JSON.stringify(L)}`);
      if (!ESTADOS.has(pos.estado[k])) malos.push(`${que}: estado visual ${pos.estado[k]} desconocido`);
      if (!CLASES.has(pos.clase[k])) malos.push(`${que}: clase ${pos.clase[k]} desconocida`);
    }
    if (!Number.isFinite(rec.pasoLazo)) malos.push(`t = ${t}: pasoLazo ${rec.pasoLazo}`);
    if (!(rec.filaAcumulacion >= 0)) malos.push(`t = ${t}: fila ${rec.filaAcumulacion}`);
    for (let r = 0; r < rec.rampaOcupacion.length; r++) if (!(rec.rampaOcupacion[r] >= 0)) malos.push(`t = ${t}: ocupación de la rampa ${r} = ${rec.rampaOcupacion[r]}`);
  }
  return { malos, maxN, recortes: rep.recortes };
}

test('maqueta de 24.000 paquetes: 1.000 instantes sin NaN, sin nada fuera de los límites, con estados y clases válidos', () => {
  const tr = trazaDeMaqueta(2);
  const { malos, maxN, recortes } = recorrer(tr);
  assert.equal(malos.length, 0, `${malos.length} problemas; los primeros: ${malos.slice(0, 5).join(' · ')}`);
  assert.equal(recortes, 0, `${recortes} posiciones cayeron fuera de los límites y la red de seguridad las recortó (se esperaba 0)`);
  assert.ok(maxN > 100, `en el pico de la noche se esperaban cientos de entidades a la vista y el máximo fue ${maxN}`);
});

test('maqueta de 90.000 paquetes: 1.000 instantes sin NaN ni nada fuera de los límites', () => {
  const tr = trazaDeMaquetaCon(MAQUETA_90K, 3);
  const { malos, maxN, recortes } = recorrer(tr);
  assert.equal(malos.length, 0, `${malos.length} problemas; los primeros: ${malos.slice(0, 5).join(' · ')}`);
  assert.equal(recortes, 0, `${recortes} posiciones recortadas al borde (se esperaba 0)`);
  assert.ok(maxN > 100);
});

test('traza sintética con todo tipo de tramos (personas, camiones, lazo, excepción): 1.000 instantes sin problemas', () => {
  const tr = trazaSintetica((s) => {
    lazoEnMarcha(s);
    s.tramo(0, TipoTramo.CAMION_ANDEN, 0, 3, 0, 900_000);
    s.tramo(1, TipoTramo.CAMION_PLAYA, -1, 0, 100_000, 900_000);
    s.tramo(1, TipoTramo.CAMION_ANDEN, 0, 1, 900_000, 1_200_000);
    for (let i = 0; i < 40; i++) {
      const t = i * 30_000;
      s.tramo(i, TipoTramo.DESCARGA, i % 2, 0, t, t + 2000);
      s.tramo(i, TipoTramo.CINTA, i % 2, 0, t + 2000, t + 11_000);
      s.tramo(i, TipoTramo.ACUMULACION, 0, i, t + 11_000, t + 41_000);
      s.tramo(i, TipoTramo.INDUCCION, i % 2, i % 2, t + 41_000, t + 43_400);
      s.tramo(i, TipoTramo.BANDEJA, (i * 7) % 50, i % 3, t + 43_400, t + 60_000);
      if (i % 5 === 0) {
        s.tramo(i, TipoTramo.COLA_MANUAL, 0, i / 5, t + 60_000, t + 70_000);
        s.tramo(i, TipoTramo.MANUAL, PERSONAS.X1, 0, t + 70_000, t + 90_000);
        s.tramo(i, TipoTramo.JAULA, 0, Math.floor(i / 5), t + 90_000, 3_600_000);
        s.paquete(i, { creado: t, listo: t + 90_000 });
      } else {
        s.tramo(i, TipoTramo.RAMPA, i % 3, i, t + 60_000, t + 80_000);
        s.tramo(i, TipoTramo.MANO, PERSONAS.R1, i % 3, t + 80_000, t + 83_000);
        s.tramo(i, TipoTramo.JAULA, i % 3, i, t + 83_000, 3_600_000);
        s.paquete(i, { creado: t, listo: t + 83_000 });
      }
    }
    s.tramo(PERSONAS.R1, TipoTramo.PERSONA_CAMINA, 2, 0, 500_000, 510_000);
    s.tramo(PERSONAS.R2, TipoTramo.PERSONA_CIERRA_JAULA, 1, 0, 600_000, 660_000);
    s.tramo(PERSONAS.I2, TipoTramo.PERSONA_PAUSA, 1, 0, 700_000, 1_600_000);
  });
  const { malos, recortes } = recorrer(tr);
  assert.equal(malos.length, 0, `${malos.length} problemas; los primeros: ${malos.slice(0, 5).join(' · ')}`);
  assert.equal(recortes, 0, `${recortes} posiciones recortadas al borde (se esperaba 0)`);
});

test('caminata por el pasillo con el plano justo: en la curva el pasillo se arrima al lazo y nada sale de los límites ni salta', () => {
  // A la derecha del estadio (x hasta 10,91 m) quedan solo 0,59 m de plano: el pasillo de 3,8 m no entra y se achica en la curva.
  const geo = geometriaSintetica();
  geo.limites = { ...geo.limites, xmax: 11.5 };
  const g = PERSONAS.R1;
  const tr = trazaSintetica((s) => {
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 1, 0, 0, 1000);
    s.tramo(g, TipoTramo.PERSONA_CAMINA, 2, 0, 1000, 11_800);
    s.tramo(g, TipoTramo.PERSONA_TRABAJA, 2, 0, 11_800, 13_000);
  }, { geometria: geo });
  const rep = crearReproductor(tr), pos = rep.crearPosiciones(), L = geo.limites;
  let antes: [number, number] | null = null, saltoMax = 0;
  for (let t = 0; t < 13_000; t += 100) {
    rep.posiciones(t, pos);
    let k = -1;
    for (let i = 0; i < pos.n; i++) if (pos.clase[i] === ClaseEntidad.PERSONA && pos.id[i] === g) k = i;
    assert.ok(k >= 0, `en t = ${t} ms se esperaba ver a P-R1`);
    const x = pos.x[k], y = pos.y[k];
    assert.ok(x >= L.xmin && x <= L.xmax && y >= L.ymin && y <= L.ymax, `en t = ${t} ms P-R1 está en (${x.toFixed(3)}, ${y.toFixed(3)}), fuera de ${JSON.stringify(L)}`);
    if (antes) saltoMax = Math.max(saltoMax, Math.hypot(x - antes[0], y - antes[1]));
    antes = [x, y];
  }
  assert.equal(rep.recortes, 0, `${rep.recortes} posiciones recortadas al borde (se esperaba 0: el pasillo se achica solo)`);
  assert.ok(saltoMax <= 0.6, `la caminata tiene que ser continua (a 1 m/s, ≤ 0,6 m cada 100 ms) y saltó ${saltoMax.toFixed(3)} m`);
});

/** Todos los puntos fijos que dibuja la escena. */
function puntosFijos(D: Disposicion): [string, number, number][] {
  const p: [string, number, number][] = [];
  for (const r of [...D.rampas, D.excepcion]) for (const k of ['base', 'ini', 'fin', 'persona', 'jaula'] as const) p.push([`${r.id}.${k}`, r[k][0], r[k][1]]);
  for (const e of D.estaciones) for (const k of ['base', 'borde', 'mano', 'operador'] as const) p.push([`${e.id}.${k}`, e[k][0], e[k][1]]);
  for (const a of D.andenes) for (const k of ['base', 'salida', 'camion'] as const) p.push([`${a.id}.${k}`, a[k][0], a[k][1]]);
  D.mesas.forEach((m, i) => p.push([`mesa ${i}`, m[0], m[1]]));
  const o = [0, 0];
  for (const l of [0, D.fila.columnas - 1, D.fila.capacidad - 1]) { lugarEnFila(D.fila, l, o); p.push([`fila ${l}`, o[0], o[1]]); }
  return p;
}
function fuera(L: Limites, pts: [string, number, number][]): string[] {
  return pts.filter(([, x, y]) => !(x >= L.xmin && x <= L.xmax && y >= L.ymin && y <= L.ymax)).map(([n, x, y]) => `${n} (${x.toFixed(2)}, ${y.toFixed(2)})`);
}

test('la disposición fija queda adentro de los límites (maqueta de 24.000, de 90.000 y sintética)', () => {
  for (const [nombre, g, mesas] of [
    ['maqueta 24k', trazaDeMaqueta(2).geometria, 2], ['maqueta 90k', trazaDeMaquetaCon(MAQUETA_90K, 1).geometria, 4], ['sintética', geometriaSintetica(), 1],
  ] as const) {
    const D = crearDisposicion(g, mesas);
    const malos = fuera(D.limites, puntosFijos(D));
    assert.deepEqual(malos, [], `${nombre}: puntos fuera de los límites: ${malos.join(', ')}`);
    assert.equal(D.mesas.length, mesas, `${nombre}: una mesa por persona de excepción`);
    assert.ok(D.alcance >= 1.2 && D.alcance <= 5, `${nombre}: el largo de las rampas tiene que estar entre 1,2 y 5 m y es ${D.alcance}`);
  }
});

test('las rampas salen hacia el lado del signo de y de `lado` (en las rectas, exactamente (0, lado))', () => {
  const D = crearDisposicion(geometriaSintetica(), 1);
  assert.deepEqual(D.rampas.map((r) => [Math.round(r.dir[0] * 1e9) / 1e9, Math.round(r.dir[1] * 1e9) / 1e9]), [[0, -1], [0, -1], [0, 1]]);
  for (const r of D.rampas) assert.ok(r.jaula[1] * r.dir[1] > r.base[1] * r.dir[1], `${r.id}: la jaula queda más afuera que el lazo`);
});

test('la fila de la acumulación tiene lugar para toda su capacidad y empieza en el punto de la geometría', () => {
  const g = geometriaSintetica(), D = crearDisposicion(g, 1);
  assert.ok(D.fila.columnas * D.fila.filas >= g.acumulacion.capacidad);
  const o = [0, 0];
  lugarEnFila(D.fila, 0, o);
  assert.deepEqual(o, [g.acumulacion.x, g.acumulacion.y]);
  // dos lugares distintos nunca caen en el mismo punto
  const vistos = new Set<string>();
  for (let l = 0; l < g.acumulacion.capacidad; l++) { lugarEnFila(D.fila, l, o); vistos.add(`${o[0].toFixed(6)},${o[1].toFixed(6)}`); }
  assert.equal(vistos.size, g.acumulacion.capacidad);
});
