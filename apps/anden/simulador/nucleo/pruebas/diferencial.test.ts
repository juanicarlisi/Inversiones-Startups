// R08a (corte-1.md §8): el núcleo de producción da la MISMA huella que crearMotorReferencia en los mismos modelos sintéticos.
// La referencia usa Math.* nativo y un montículo de objetos; el núcleo, matemática propia y columnas: coincidir bit a bit prueba que
// la semántica (orden, azar, distribuciones, huella, guardianes) es la misma.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotor } from '../motor/motor.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import type { Bloque, CrearMotor, Motor, OpcionesMotor, ResultadoCorrida } from '../../contratos/motor.ts';
import { aleatorioSintetico, distribucionesSintetica, mm1Sintetica, redSintetica } from './modelos-sinteticos.ts';

type Armar = (m: Motor) => Bloque[];
const MODELOS: [string, Armar][] = [
  ['M/M/1 ρ = 0,8 (20.000 clientes)', (m) => [mm1Sintetica(m, 20_000, 0.8)]],
  ['red con fases, prioridades, fallas urgentes y observador tardío (5.000 trabajos)', (m) => redSintetica(m, 5000)],
  ['las 11 distribuciones con log, exp, sin, cos, pow y sqrt dentro de la huella (40.000 pasos)', (m) => [distribucionesSintetica(m, 40_000)]],
  ['bloque que agenda al azar con descartes por seq (64 entidades)', (m) => [aleatorioSintetico(m, 64, 50_000)]],
];

function correr(crear: CrearMotor, armar: Armar, o: OpcionesMotor): ResultadoCorrida {
  const m = crear(o);
  armar(m);
  return m.correr();
}

for (const [nombre, armar] of MODELOS) {
  test(`R08a · ${nombre}: misma huella que la referencia en 5 semillas y réplicas`, () => {
    for (const [semilla, replica] of [[1, 0], [20261017, 0], [20261017, 1], [0xffffffff, 7], [12345, 99]]) {
      const o: OpcionesMotor = { semilla, replica, hasta: 1e12, traza: 'no' };
      const nucleo = correr(crearMotor, armar, o), referencia = correr(crearMotorReferencia, armar, o);
      assert.deepEqual(nucleo, referencia, `semilla ${semilla}, réplica ${replica}: núcleo ${JSON.stringify(nucleo)} · referencia ${JSON.stringify(referencia)}`);
    }
  });
}

test('R08a · otra réplica da otra huella (y la misma, la misma) en los cuatro modelos', () => {
  for (const [nombre, armar] of MODELOS) {
    const a = correr(crearMotor, armar, { semilla: 5, replica: 0, hasta: 1e12, traza: 'no' });
    const b = correr(crearMotor, armar, { semilla: 5, replica: 1, hasta: 1e12, traza: 'no' });
    const c = correr(crearMotor, armar, { semilla: 5, replica: 0, hasta: 1e12, traza: 'no' });
    assert.notEqual(a.huella, b.huella, `${nombre}: otra réplica tiene que dar otra huella`);
    assert.deepEqual(a, c, `${nombre}: misma réplica, misma corrida`);
  }
});

test('R08a · correrHasta por tramos (pausas) da los mismos resultados intermedios que la referencia', () => {
  const o: OpcionesMotor = { semilla: 3, replica: 2, hasta: 4_000_000, traza: 'no' };
  const a = crearMotor(o), b = crearMotorReferencia(o);
  redSintetica(a, 3000); redSintetica(b, 3000);
  for (let t = 0; t <= 4_000_000; t += 137_000) assert.deepEqual(a.correrHasta(t), b.correrHasta(t), `correrHasta(${t})`);
  assert.deepEqual(a.correr(), b.correr());
});

test('R08a · con traza completa, el núcleo escribe exactamente la misma traza que la referencia', () => {
  const o: OpcionesMotor = { semilla: 8, replica: 0, hasta: 1e12, traza: 'completa' };
  const trazas = [crearMotor, crearMotorReferencia].map((crear) => {
    const m = crear(o);
    redSintetica(m, 2000);
    aleatorioSintetico(m, 8, 3000);
    const r = m.correr();
    m.finalizar();
    return m.traza.terminar({
      modelo: 'sintetico', semilla: o.semilla, replica: o.replica, tickLazo: 300, bandejas: 0, inicio: 0, fin: r.ahora, corte: r.ahora,
      catalogo: { personas: [], camiones: [], rutas: [], rampas: [], puestos: [], andenes: [] },
      geometria: {} as never, huella: r.huella,
    });
  });
  assert.ok(trazas[0].tramos.n > 1000 && trazas[0].momentos.n > 100, 'la traza tiene que tener contenido');
  assert.deepEqual(trazas[0], trazas[1]);
});
