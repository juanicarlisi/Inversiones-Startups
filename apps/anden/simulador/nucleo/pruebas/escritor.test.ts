// Escritor de traza (contratos/traza.ts): largos exactos, cierre de abiertos en `fin`, niveles 'no' y 'kpi' sin memoria, e
// igualdad con el escritor de referencia para la misma secuencia de llamadas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearEscritorTraza } from '../traza/escritor.ts';
import { crearEscritorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { Causa, TipoMomento, TipoTramo, type EscritorTraza, type NivelTraza, type Traza } from '../../contratos/traza.ts';
import type { GeometriaHub } from '../../contratos/geometria.ts';

const GEOMETRIA = { limites: { xmin: 0, ymin: 0, xmax: 1, ymax: 1 } } as unknown as GeometriaHub;
function datos(fin: number): Omit<Traza, 'tramos' | 'momentos' | 'paquetes' | 'version'> {
  return {
    modelo: 'prueba', semilla: 1, replica: 2, tickLazo: 300, bandejas: 142, inicio: 0, fin, corte: fin - 1,
    catalogo: { personas: [], camiones: [], rutas: [], rampas: [], puestos: [], andenes: [] }, geometria: GEOMETRIA, huella: 'abc',
  };
}

/** Una secuencia larga y variada de llamadas (crecimiento, cierres con y sin a, huecos en ids de paquete). */
function escribir(w: EscritorTraza): number[] {
  const abiertos: number[] = [];
  let s = 12345;
  // Congruencial con los 16 bits altos (los bajos de un congruencial módulo 2^32 tienen períodos cortos).
  const azar = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s >>> 16; };
  for (let i = 0; i < 12_000; i++) {
    const r = azar() % 10;
    if (r < 4) abiertos.push(w.abrir(i, TipoTramo.ACUMULACION, azar() % 5, i, i * 10, Causa.FILA));
    else if (r < 6 && abiertos.length) w.cerrar(abiertos.splice(azar() % abiertos.length, 1)[0], i * 10 + 5, r === 5 ? 77 : undefined);
    else if (r < 8) w.tramo(i, TipoTramo.BANDEJA, azar() % 142, 0, i * 10, i * 10 + 300, Causa.RAMPA_LLENA, 4 * 16777216 + 3);
    else if (r < 9) w.momento(i * 10, TipoMomento.RAMPA_LLENA, azar() % 12, i / 7);
    else {
      const id = (i * 3) % 4000; // con huecos y repeticiones
      w.paquete(id, id % 10, id, id % 50, id % 4, i * 10);
      if (azar() % 2 === 0) w.paqueteListo(id, i * 10 + 999, azar() % 4);
    }
  }
  return abiertos;
}

test('largos exactos: cada columna tiene largo n y un buffer sin capacidad sobrante', () => {
  const w = crearEscritorTraza('completa');
  escribir(w);
  const t = w.terminar(datos(1_000_000));
  for (const [grupo, cols] of [['tramos', t.tramos], ['momentos', t.momentos], ['paquetes', t.paquetes]] as const) {
    const n = cols.n;
    assert.ok(n > 0, `${grupo}: tiene que haber contenido`);
    for (const [k, v] of Object.entries(cols)) {
      if (k === 'n') continue;
      const col = v as Float64Array;
      assert.equal(col.length, n, `${grupo}.${k}: largo ${col.length} en vez de ${n}`);
      assert.equal(col.buffer.byteLength, n * col.BYTES_PER_ELEMENT, `${grupo}.${k}: el buffer tiene capacidad sobrante (no se puede transferir limpio)`);
    }
  }
  assert.equal(t.version, 1);
  assert.equal(t.huella, 'abc');
  assert.equal(t.corte, 999_999);
});

test('terminar cierra los tramos abiertos en fin; cerrar con a cambia el auxiliar', () => {
  const w = crearEscritorTraza('completa');
  const a = w.abrir(1, TipoTramo.INDUCCION, 2, 3, 100);
  const b = w.abrir(2, TipoTramo.INDUCCION, 2, 3, 200, Causa.PAUSA, 7);
  const c = w.abrir(3, TipoTramo.BANDEJA, 9, 0, 300);
  w.cerrar(b, 250);
  w.cerrar(c, 900, 2);
  const t = w.terminar(datos(5000));
  assert.deepEqual(Array.from(t.tramos.t1), [5000, 250, 900]);
  assert.deepEqual(Array.from(t.tramos.a), [3, 3, 2]);
  assert.deepEqual(Array.from(t.tramos.c), [0, Causa.PAUSA, 0]);
  assert.deepEqual(Array.from(t.tramos.q), [-1, 7, -1]);
  assert.equal(a, 0);
});

test("niveles 'no' y 'kpi': no reservan memoria, abrir/tramo devuelven −1 y la traza sale vacía", () => {
  for (const nivel of ['no', 'kpi'] as NivelTraza[]) {
    const w = crearEscritorTraza(nivel);
    assert.equal(w.nivel, nivel);
    assert.deepEqual([w.capacidadTramos, w.capacidadMomentos, w.capacidadPaquetes], [0, 0, 0], `nivel ${nivel}: no tiene que reservar memoria`);
    assert.equal(w.abrir(1, TipoTramo.CINTA, 0, 0, 0), -1);
    assert.equal(w.tramo(1, TipoTramo.CINTA, 0, 0, 0, 5), -1);
    escribir(w);
    w.cerrar(-1, 5);
    assert.deepEqual([w.capacidadTramos, w.capacidadMomentos, w.capacidadPaquetes], [0, 0, 0], `nivel ${nivel}: escribir no reserva memoria`);
    const t = w.terminar(datos(10));
    assert.deepEqual([t.tramos.n, t.momentos.n, t.paquetes.n, t.tramos.e.length], [0, 0, 0, 0]);
  }
});

test('el escritor del núcleo produce exactamente la traza del escritor de referencia, en los tres niveles', () => {
  for (const nivel of ['completa', 'kpi', 'no'] as NivelTraza[]) {
    const a = crearEscritorTraza(nivel), b = crearEscritorReferencia(nivel);
    escribir(a); escribir(b);
    assert.deepEqual(a.terminar(datos(200_000)), b.terminar(datos(200_000)), `nivel ${nivel}: la traza difiere de la referencia`);
  }
});

test('paquetes: resumen por id, con −1 en listo hasta que entra a la jaula y huecos como en la referencia', () => {
  const w = crearEscritorTraza('completa');
  w.paquete(0, 3, 0, 7, 1, 1000);
  w.paquete(2, 3, 2, 8, 2, 2000);
  w.paqueteListo(2, 9000, 1);
  const p = w.terminar(datos(10_000)).paquetes;
  assert.equal(p.n, 3);
  assert.deepEqual(Array.from(p.listo).map(String), ['-1', 'NaN', '9000']);
  assert.deepEqual(Array.from(p.vueltas), [0, 0, 1]);
  assert.deepEqual(Array.from(p.ruta), [7, 0, 8]);
});

test('errores claros: nivel desconocido, cerrar un tramo que no existe, id de paquete inválido', () => {
  assert.throws(() => crearEscritorTraza('todo' as NivelTraza), /se esperaba nivel 'no', 'kpi' o 'completa' y llegó todo/);
  const w = crearEscritorTraza('completa');
  w.abrir(1, TipoTramo.CINTA, 0, 0, 0);
  assert.throws(() => w.cerrar(5, 10), /traza\.cerrar: el tramo 5 no existe \(hay 1\)/);
  assert.throws(() => w.paquete(-1, 0, 0, 0, 0, 0), /se esperaba un id de paquete entero ≥ 0 y llegó -1/);
  assert.throws(() => w.paquete(1.5, 0, 0, 0, 0, 0), RangeError);
});
