// Pruebas del paso 0: los contratos se copiaron bien y la referencia y la maqueta funcionan. Tienen que dar 6 de 6.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearMotorReferencia, claveDe } from '../referencia/motor-referencia.ts';
import { trazaDeMaqueta } from '../fixtures/traza-maqueta.ts';
import { esRef, parametro } from '../referencias.ts';
import { Fase, horaASeg, segAHoraLarga } from '../tipos-base.ts';
import type { Bloque, Motor } from '../motor.ts';
import type { Modelo, Ref } from '../modelo.ts';

function mm1(m: Motor, n: number) {
  const kEntre = claveDe('fuente', 'entre'), kServ = claveDe('fuente', 'servicio');
  let nacidos = 0, ocupado = false, sumaWq = 0;
  const llegadaDe: number[] = [], servDe: number[] = [], fila: number[] = [];
  const b: Bloque = {
    ruta: 'mm1',
    manejar(m, tipo, arg) {
      if (tipo === 1) {
        const id = nacidos++; llegadaDe[id] = m.ahora;
        servDe[id] = Math.round(1000 * m.azar.sortear({ tipo: 'exponencial', media: 1 }, { clave: kServ, a: id, b: 0, c: 0 }));
        if (nacidos < n) m.agendar(m.ahora + Math.round(1000 * m.azar.sortear({ tipo: 'exponencial', media: 2 }, { clave: kEntre, a: id + 1, b: 0, c: 0 })), 0, 1, 0);
        if (!ocupado) { ocupado = true; m.agendar(m.ahora + servDe[id], 0, 2, id); } else fila.push(id);
      } else if (fila.length) { const id = fila.shift()!; sumaWq += m.ahora - llegadaDe[id]; m.agendar(m.ahora + servDe[id], 0, 2, id); } else ocupado = false;
      void arg;
    },
    estado: () => ({}), restaurar: () => {},
  };
  const i = m.registrar(b); m.agendar(0, i, 1, 0, Fase.NORMAL);
  return () => sumaWq / n / 1000;
}
test('la referencia corre una M/M/1 con ρ = 0,5 y da Wq ≈ 1 s', () => {
  let s = 0; const R = 20;
  for (let r = 0; r < R; r++) { const m = crearMotorReferencia({ semilla: 7, replica: r, hasta: 1e12, traza: 'no' }); const wq = mm1(m, 20000); m.correr(); s += wq(); }
  assert.ok(Math.abs(s / R - 1) < 0.05, `Wq = ${s / R}`);
});
test('misma semilla y réplica → misma huella; otra réplica → otra', () => {
  const h = (r: number) => { const m = crearMotorReferencia({ semilla: 7, replica: r, hasta: 1e12, traza: 'no' }); mm1(m, 2000); return m.correr().huella; };
  assert.equal(h(1), h(1)); assert.notEqual(h(1), h(2));
});
test('Philox4x32-10 de la referencia reproduce los vectores de Random123', async () => {
  const { philox4x32_10 } = await import('../referencia/motor-referencia.ts');
  const o = new Uint32Array(4), hex = () => Array.from(o, (x) => x.toString(16).padStart(8, '0')).join(' ');
  philox4x32_10(0, 0, 0, 0, 0, 0, o); assert.equal(hex(), '6627e8d5 e169c58d bc57ac4c 9b00dbd8');
  philox4x32_10(0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff, o); assert.equal(hex(), '408f276d 41c83b0e a20bc7c6 6d5451fd');
  philox4x32_10(0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822, 0x299f31d0, o); assert.equal(hex(), 'd16cfe09 94fdcceb 5001e420 24126ea1');
});
test('FNV-1a de 32 bits y claveDe', () => {
  const fnv = (s: string) => { let h = 0x811c9dc5; for (const b of new TextEncoder().encode(s)) h = Math.imul(h ^ b, 0x01000193) >>> 0; return h; };
  assert.equal(fnv('a'), 0xe40c292c); assert.equal(fnv('foobar'), 0xbf9cf968); assert.equal(claveDe('a', 'b'), fnv('a/b'));
});
test('el modelo de ejemplo: todas las referencias existen y las horas se leen', () => {
  const m = JSON.parse(readFileSync(new URL('../ejemplos/hub-chico.json', import.meta.url), 'utf8')) as Modelo;
  const refs: string[] = []; const recorrer = (x: unknown) => { if (esRef(x)) refs.push(x); else if (x && typeof x === 'object') for (const v of Object.values(x)) recorrer(v); };
  recorrer({ ...m, parametros: undefined });
  assert.ok(refs.length >= 20); for (const r of refs) assert.ok(parametro(m, r as Ref));
  assert.equal(horaASeg(m.calendario.corte), 91800); assert.equal(segAHoraLarga(88200), '24:30');
});
test('la maqueta produce una traza con el contrato', () => {
  const t = trazaDeMaqueta(2);
  assert.equal(t.tramos.e.length, t.tramos.n); assert.ok(t.tramos.n > 150000); assert.ok(t.paquetes.n > 20000);
  assert.equal(t.geometria.rampas.length, 60);
  let mal = 0; for (let i = 0; i < t.tramos.n; i++) if (!(t.tramos.t1[i] >= t.tramos.t0[i])) mal++;
  assert.equal(mal, 0);
});
