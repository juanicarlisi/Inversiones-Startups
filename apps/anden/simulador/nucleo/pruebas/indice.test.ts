// La entrega de P1 (corte-1.md §9): nucleo/indice.ts exporta todo lo pedido, con los tipos del contrato.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as nucleo from '../indice.ts';
import type { CrearMotor } from '../../contratos/motor.ts';
import type { ClaveDe, FuenteAzar } from '../../contratos/azar.ts';
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';
import type { EscritorTraza, NivelTraza } from '../../contratos/traza.ts';
import type { TiempoTrapezoidal } from '../../contratos/motor.ts';

// Chequeo de tipos (lo verifica tsc): cada entrega cumple su tipo del contrato.
const _crearMotor: CrearMotor = nucleo.crearMotor;
const _crearFuenteAzar: (semilla: number, replica: number) => FuenteAzar = nucleo.crearFuenteAzar;
const _claveDe: ClaveDe = nucleo.claveDe;
const _det: MatematicaDeterminista = nucleo.det;
const _crearEscritorTraza: (nivel: NivelTraza) => EscritorTraza = nucleo.crearEscritorTraza;
const _tiempoTrapezoidal: TiempoTrapezoidal = nucleo.tiempoTrapezoidal;
const _philox: (c0: number, c1: number, c2: number, c3: number, k0: number, k1: number, out: Uint32Array) => void = nucleo.philox4x32_10;
void [_crearMotor, _crearFuenteAzar, _claveDe, _det, _crearEscritorTraza, _tiempoTrapezoidal, _philox];

test('la entrega de P1 está completa: crearMotor, crearFuenteAzar, claveDe, det, crearEscritorTraza, tiempoTrapezoidal, VERSION_MOTOR, philox4x32_10', () => {
  for (const nombre of ['crearMotor', 'crearFuenteAzar', 'claveDe', 'crearEscritorTraza', 'tiempoTrapezoidal', 'philox4x32_10'] as const) {
    assert.equal(typeof nucleo[nombre], 'function', `falta ${nombre} en nucleo/indice.ts`);
  }
  assert.equal(typeof nucleo.det, 'object');
  for (const f of ['log', 'exp', 'cos', 'sin', 'pow', 'sqrt'] as const) assert.equal(typeof nucleo.det[f], 'function', `falta det.${f}`);
  assert.equal(nucleo.VERSION_MOTOR, '1.0.0');
});

test('un motor del índice corre de punta a punta con traza completa', () => {
  const m = nucleo.crearMotor({ semilla: 20261017, replica: 0, hasta: 10_000, traza: 'completa' });
  let yo = -1;
  yo = m.registrar({
    ruta: 'prueba.indice',
    manejar(m, tipo, arg) {
      const i = m.traza.tramo(arg, 51, 0, 0, m.ahora, m.ahora + 100);
      assert.ok(i >= 0);
      if (arg < 9) m.agendar(m.ahora + 100, yo, tipo, arg + 1);
    },
    estado: () => ({}), restaurar() {},
  });
  m.agendar(0, yo, 1, 0);
  const r = m.correr();
  assert.equal(r.eventos, 10);
  const t = m.traza.terminar({
    modelo: 'x', semilla: 20261017, replica: 0, tickLazo: 300, bandejas: 0, inicio: 0, fin: r.ahora, corte: r.ahora,
    catalogo: { personas: [], camiones: [], rutas: [], rampas: [], puestos: [], andenes: [] }, geometria: {} as never, huella: r.huella,
  });
  assert.equal(t.tramos.n, 10);
  assert.equal(t.huella, m.huella());
});
