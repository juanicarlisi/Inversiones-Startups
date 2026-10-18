// Huella de la corrida (corte-1.md §6.4): dorada de una secuencia fija de 5 eventos, cálculo independiente y huella agregada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearMotor } from '../motor/motor.ts';
import { hex16, huellaAgregada, H1_INICIO, H2_INICIO } from '../motor/huella.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { Fase } from '../../contratos/tipos-base.ts';
import type { Bloque, CrearMotor } from '../../contratos/motor.ts';

/** La §6.4 escrita de la forma más literal posible, para comparar. */
function huellaLiteral(eventos: [number, number, number, number][]): string {
  let h1 = 0x811c9dc5, h2 = 0xc2b2ae35;
  for (const [t, bloque, tipo, arg] of eventos) {
    for (const w of [t % 4294967296, Math.floor(t / 4294967296), bloque >>> 0, tipo >>> 0, arg >>> 0]) {
      h1 = Math.imul(h1 ^ w, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ w, 0x85ebca6b) >>> 0;
      h2 = (h2 ^ (h2 >>> 13)) >>> 0;
    }
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

/** Cinco eventos fijos, con un t mayor que 2^32 (ejercita la segunda palabra) y args negativos y extremos. */
function cincoEventos(crear: CrearMotor) {
  const m = crear({ semilla: 1, replica: 0, hasta: 1e13, traza: 'no' });
  const b = (ruta: string): Bloque => ({ ruta, manejar() {}, estado: () => ({}), restaurar() {} });
  const i = m.registrar(b('fijo')), j = m.registrar(b('fijo2'));
  m.agendar(0, i, 1, 0);
  m.agendar(1500, j, 2, -1, Fase.URGENTE, 3);
  m.agendar(1500, i, 3, 2147483647, Fase.TARDIA);
  m.agendar(4294967296 + 7, j, 4, 12345);
  m.agendar(9_000_000_000_001, i, 5, -2147483648, Fase.NORMAL, -5);
  return m.correr();
}

test('huella dorada de una secuencia fija de 5 eventos', () => {
  const r = cincoEventos(crearMotor);
  assert.equal(r.huella, '6135c75dc656764b', `se esperaba la huella 6135c75dc656764b y salió ${r.huella}`);
  assert.equal(r.eventos, 5);
  // Orden de proceso: (0) · (1500 URGENTE) · (1500 TARDIA) · (2^32 + 7) · (9·10^12 + 1).
  assert.equal(r.huella, huellaLiteral([[0, 0, 1, 0], [1500, 1, 2, -1], [1500, 0, 3, 2147483647], [4294967303, 1, 4, 12345],
    [9_000_000_000_001, 0, 5, -2147483648]]));
  assert.equal(cincoEventos(crearMotorReferencia).huella, r.huella, 'la referencia tiene que dar la misma huella');
});

test('huella inicial (sin eventos) y formato de 16 caracteres hexadecimales', () => {
  const m = crearMotor({ semilla: 1, replica: 0, hasta: 1, traza: 'no' });
  assert.equal(m.huella(), '811c9dc5c2b2ae35');
  assert.equal(hex16(H1_INICIO, H2_INICIO), '811c9dc5c2b2ae35');
  assert.equal(hex16(0, 0xf), '000000000000000f');
  assert.match(cincoEventos(crearMotor).huella, /^[0-9a-f]{16}$/);
});

test('huella agregada: los dos carriles sobre los códigos de los caracteres de las huellas, en orden de índice', () => {
  const huellas = ['6135c75dc656764b', '811c9dc5c2b2ae35', '0123456789abcdef'];
  let h1 = 0x811c9dc5, h2 = 0xc2b2ae35;
  for (const s of huellas) for (let i = 0; i < s.length; i++) {
    const w = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ w, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ w, 0x85ebca6b) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  }
  const esperada = h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  assert.equal(huellaAgregada(huellas), esperada);
  assert.notEqual(huellaAgregada([huellas[1], huellas[0], huellas[2]]), esperada, 'el orden de las réplicas cuenta');
  assert.equal(huellaAgregada([]), '811c9dc5c2b2ae35');
});
