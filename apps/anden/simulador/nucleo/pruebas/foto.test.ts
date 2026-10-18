// R06 (corte-1.md §6.5 y §8): correr hasta T, fotografiar, restaurar en un motor nuevo con bloques nuevos y seguir da la misma huella
// final que la corrida continua. Más: la foto es una copia, se puede restaurar varias veces y valida bloques y versión.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotor } from '../motor/motor.ts';
import type { Bloque, EstadoBloque, Foto, Motor, OpcionesMotor } from '../../contratos/motor.ts';
import { aleatorioSintetico, distribucionesSintetica, mm1Sintetica, redSintetica } from './modelos-sinteticos.ts';

type Armar = (m: Motor, iniciar: boolean) => Bloque[];
const MODELOS: [string, Armar][] = [
  ['bloque que agenda al azar (64 entidades)', (m, iniciar) => [aleatorioSintetico(m, 64, 60_000, { iniciar })]],
  ['red con fases, prioridades y fallas', (m, iniciar) => redSintetica(m, 4000, { iniciar })],
  ['M/M/1 ρ = 0,9', (m, iniciar) => [mm1Sintetica(m, 20_000, 0.9, { iniciar })]],
  ['las 11 distribuciones y la matemática del motor', (m, iniciar) => [distribucionesSintetica(m, 30_000, { iniciar })]],
];
const OPC: OpcionesMotor = { semilla: 20261017, replica: 4, hasta: 1e12, traza: 'no' };

/** Estado de los bloques como objeto comparable (los arreglos tipados se comparan por contenido). */
function estados(bs: Bloque[]): EstadoBloque[] {
  return bs.map((b) => b.estado());
}

/** Instante del último evento procesado (al vaciarse el calendario, m.ahora salta al horizonte, como en la referencia). */
function ultimoInstante(armar: Armar): number {
  const m = crearMotor(OPC);
  let ultimo = 0;
  for (const b of armar(m, true)) {
    const original = b.manejar.bind(b);
    b.manejar = (mm, tipo, arg) => { ultimo = mm.ahora; original(mm, tipo, arg); };
  }
  m.correr();
  return ultimo;
}

for (const [nombre, armar] of MODELOS) {
  test(`R06 · ${nombre}: foto a mitad de corrida + restaurar en un motor nuevo → misma huella final`, () => {
    // Corrida continua.
    const continuo = crearMotor(OPC);
    const bloquesContinuo = armar(continuo, true);
    const final = continuo.correr();
    assert.ok(final.eventos > 1000, `el modelo tiene que tener movimiento (eventos: ${final.eventos})`);
    const duracion = ultimoInstante(armar);
    // Corrida con foto en varios instantes (25%, 50% y 90% del tiempo simulado).
    for (const fraccion of [0.25, 0.5, 0.9]) {
      const T = Math.floor(duracion * fraccion);
      const a = crearMotor(OPC);
      armar(a, true);
      const hastaT = a.correrHasta(T);
      assert.equal(hastaT.estado, 'pausa');
      const f = a.foto();
      // Motor nuevo, bloques nuevos (sin eventos iniciales: los trae la foto).
      const b = crearMotor(OPC);
      const bloquesB = armar(b, false);
      b.restaurar(f);
      assert.equal(b.ahora, a.ahora);
      assert.equal(b.eventos, a.eventos);
      assert.equal(b.seq, a.seq);
      assert.equal(b.huella(), a.huella(), 'la huella restaurada tiene que ser la de la foto');
      const rb = b.correr();
      assert.deepEqual(rb, final, `foto en T = ${T} ms (${fraccion * 100}%): se esperaba ${JSON.stringify(final)} y salió ${JSON.stringify(rb)}`);
      assert.deepEqual(estados(bloquesB), estados(bloquesContinuo), 'el estado final de los bloques tiene que ser el mismo');
      // El motor original sigue igual después de sacar la foto.
      assert.deepEqual(a.correr(), final, 'sacar la foto no puede cambiar la corrida que sigue');
    }
  });
}

test('la foto es una copia: se restaura dos veces (en dos motores) y da lo mismo, aunque el original siga corriendo', () => {
  const a = crearMotor(OPC);
  aleatorioSintetico(a, 32, 20_000);
  a.correrHasta(200_000);
  const f = a.foto();
  const huellaFoto = a.huella();
  a.correr(); // el original avanza: la foto no tiene que cambiar
  const resultados = [0, 1].map(() => {
    const b = crearMotor(OPC);
    aleatorioSintetico(b, 32, 20_000, { iniciar: false });
    b.restaurar(f);
    assert.equal(b.huella(), huellaFoto);
    return b.correr();
  });
  assert.deepEqual(resultados[0], resultados[1]);
  assert.deepEqual(resultados[0], a.correrHasta(a.ahora), 'restaurada y seguida = continua');
});

test('la foto trae el calendario en columnas de largo exacto y los campos de corte-1.md §6.5', () => {
  const a = crearMotor(OPC);
  const bloques = redSintetica(a, 500);
  a.correrHasta(60_000);
  const f: Foto = a.foto();
  assert.equal(f.version, 1);
  assert.deepEqual(f.huella.length, 2);
  const c = f.calendario;
  const n = c.n as number;
  assert.ok(n > 0, 'a mitad de corrida tiene que haber eventos pendientes');
  for (const k of ['t', 'fase', 'prioridad', 'seq', 'bloque', 'tipo', 'arg']) {
    assert.equal((c[k] as ArrayLike<number>).length, n, `calendario.${k} tiene que tener largo exacto ${n}`);
  }
  assert.deepEqual(Object.keys(f.bloques).sort(), ['sintetico.fallas', 'sintetico.fuente', 'sintetico.observador', 'sintetico.servidor']);
  assert.equal(c.bloques, 4);
  assert.ok(c.rutas instanceof Float64Array && c.rutas.length === 4);
  // Los estados de bloque son copias, no los arreglos vivos del bloque.
  const enFoto = f.bloques['sintetico.servidor'].cola as Int32Array, vivo = bloques[1].estado().cola as Int32Array;
  assert.ok(enFoto instanceof Int32Array);
  assert.notEqual(enFoto, vivo, 'la foto no puede compartir el arreglo vivo del bloque');
  assert.deepEqual(enFoto, vivo, 'pero tiene que tener el mismo contenido');
});

test('la foto se puede restaurar con otra réplica a propósito (división de trayectorias): el azar que sigue es el de la nueva', () => {
  const a = crearMotor(OPC);
  aleatorioSintetico(a, 16, 10_000);
  a.correrHasta(100_000);
  const f = a.foto();
  const b = crearMotor({ ...OPC, replica: OPC.replica + 1 });
  aleatorioSintetico(b, 16, 10_000, { iniciar: false });
  b.restaurar(f);
  assert.equal(b.huella(), a.huella(), 'hasta la foto, la historia es la misma');
  assert.notEqual(b.correr().huella, a.correr().huella, 'después de la foto, otra réplica sigue otro camino');
});

test('restaurar exige el mismo conjunto de bloques en el mismo orden, y la versión 1', () => {
  const a = crearMotor(OPC);
  redSintetica(a, 300);
  a.correrHasta(30_000);
  const f = a.foto();
  // Menos bloques.
  const b = crearMotor(OPC);
  aleatorioSintetico(b, 4, 100, { iniciar: false });
  assert.throws(() => b.restaurar(f), /la foto tiene 4 bloques y el motor tiene 1 registrados; se esperaba el mismo conjunto de bloques en el mismo orden/);
  // Mismos bloques en otro orden.
  const c = crearMotor(OPC);
  const bloques = redSintetica(c, 300, { iniciar: false });
  const d = crearMotor(OPC);
  for (const blq of [bloques[1], bloques[0], bloques[2], bloques[3]]) d.registrar(blq);
  assert.throws(() => d.restaurar(f), /el bloque 0 registrado es «sintetico.servidor», pero en la foto el bloque 0 es otro/);
  // Versión desconocida y foto sin estado de un bloque.
  assert.throws(() => c.restaurar({ ...f, version: 2 as 1 }), /se esperaba una foto versión 1 y llegó versión 2/);
  const sinServidor = { ...f, bloques: { ...f.bloques } };
  delete sinServidor.bloques['sintetico.servidor'];
  assert.throws(() => c.restaurar(sinServidor), /la foto no trae el estado del bloque «sintetico.servidor»/);
  // Columna del calendario de otro tipo.
  assert.throws(() => c.restaurar({ ...f, calendario: { ...f.calendario, t: new Int32Array(f.calendario.n as number) } }),
    /calendario\.t tiene que ser un Float64Array/);
  // Y con todo bien, restaura.
  assert.doesNotThrow(() => c.restaurar(f));
});

test('la foto exige estado() con arreglos tipados y números, y rutas únicas', () => {
  const m = crearMotor(OPC);
  m.registrar({ ruta: 'prueba.mal', manejar() {}, estado: () => ({ fila: [1, 2, 3] as unknown as Int32Array }), restaurar() {} });
  assert.throws(() => m.foto(), /estado\(\) del bloque «prueba.mal», clave «fila»: se esperaba un arreglo tipado o un número y llegó un arreglo común/);
  const n = crearMotor(OPC);
  const b: Bloque = { ruta: 'repetida', manejar() {}, estado: () => ({}), restaurar() {} };
  n.registrar(b);
  n.registrar({ ...b });
  assert.throws(() => n.foto(), /hay bloques con la misma ruta \(repetida\)/);
});
