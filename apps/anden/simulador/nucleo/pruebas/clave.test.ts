// claveDe: FNV-1a de 32 bits sobre UTF-8 de `${ruta}/${proposito}` (contratos/azar.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claveDe, fnv1a32 } from '../azar/clave.ts';
import { claveDe as claveDeReferencia } from '../../contratos/referencia/motor-referencia.ts';

/** FNV-1a con TextEncoder: la definición literal, para comparar la codificación a mano. */
function fnvConTextEncoder(s: string): number {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(s)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h;
}

test('FNV-1a de 32 bits: vectores estándar', () => {
  assert.equal(fnv1a32(''), 0x811c9dc5, 'FNV-1a("") es la base de desplazamiento');
  assert.equal(fnv1a32('a'), 0xe40c292c, `FNV-1a("a"): se esperaba e40c292c y salió ${fnv1a32('a').toString(16)}`);
  assert.equal(fnv1a32('foobar'), 0xbf9cf968, `FNV-1a("foobar"): se esperaba bf9cf968 y salió ${fnv1a32('foobar').toString(16)}`);
});

test('claveDe(ruta, propósito) = FNV-1a("ruta/propósito") y coincide con la referencia', () => {
  assert.equal(claveDe('a', 'b'), fnv1a32('a/b'));
  const casos: [string, string][] = [
    ['hub.sorter', 'lectura'], ['hub.induccion', 'tiempo'], ['personas.rampa', 'ausencia'], ['demanda', 'errorPronostico'],
    ['red.estación-ñandú', 'servicio'], ['', ''], ['x', 'y/z'],
  ];
  for (const [r, p] of casos) {
    assert.equal(claveDe(r, p), claveDeReferencia(r, p), `claveDe('${r}', '${p}') difiere de la referencia`);
    assert.ok(Number.isInteger(claveDe(r, p)) && claveDe(r, p) >= 0 && claveDe(r, p) <= 0xffffffff, 'la clave tiene que ser uint32');
  }
});

test('la codificación UTF-8 a mano es idéntica a TextEncoder (acentos, emoji, sustitutos sueltos)', () => {
  const textos = [
    'ñ', 'á é í ó ú', 'Ruta 01', '€', '中文', '🚚📦', 'a\u0000b', '\ud800', 'x\udc00y', '\ud83d', '🚚', '􏿿',
    'mezcla: ñ 🚚 \ud800 fin', String.fromCharCode(0x7f, 0x80, 0x7ff, 0x800, 0xffff),
  ];
  for (const s of textos) assert.equal(fnv1a32(s), fnvConTextEncoder(s), `FNV-1a(${JSON.stringify(s)}) difiere de TextEncoder`);
  // Y en 5.000 textos al azar con puntos de código de todos los planos (semilla fija).
  let semilla = 7;
  const azar = () => { semilla = (Math.imul(semilla, 1103515245) + 12345) >>> 0; return semilla >>> 8; };
  for (let i = 0; i < 5000; i++) {
    let s = '';
    const largo = azar() % 12;
    for (let j = 0; j < largo; j++) {
      const r = azar() % 4;
      s += r === 0 ? String.fromCharCode(azar() % 0x80) : r === 1 ? String.fromCharCode(azar() % 0x10000)
        : r === 2 ? String.fromCodePoint(0x10000 + (azar() % 0xfffff)) : String.fromCharCode(0xd800 + (azar() % 0x800));
    }
    assert.equal(fnv1a32(s), fnvConTextEncoder(s), `FNV-1a difiere de TextEncoder en el texto ${JSON.stringify(s)}`);
  }
});
