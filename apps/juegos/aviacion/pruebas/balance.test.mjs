// Curva de progresión (HN-10), medida con el perfil novato en juego activo (semillas 1 a 3): minutos por capítulo, historia de 55 a
// 75 minutos, ninguna sequía de novedades y, al terminar, el juego sigue con contratos y rondas con medalla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/modelo.js';
import { correr } from '../herramientas/jugadores.mjs';

const corridas = [1, 2, 3].map((semilla) => ({ semilla, r: correr('novato', { semilla, minutos: 80 }) }));
// hueco máximo entre novedades dentro de [desde, hasta] (en minutos reales)
const hueco = (r, desde, hasta) => {
  let antes = desde, h = 0;
  for (const n of r.novedades) { if (n.min < desde) continue; if (n.min > hasta) break; h = Math.max(h, n.min - antes); antes = n.min; }
  return Math.max(h, Math.min(hasta, r.final.min) - antes);
};

test('minutos por capítulo: 8 a 12, 15 a 20 y 30 a 45; la historia entera, de 55 a 75', () => {
  for (const { semilla, r } of corridas) {
    const [c1, c2, c3] = r.minPorCapitulo.map((c) => c.min);
    assert.ok(c1 >= 8 && c1 <= 12, `semilla ${semilla}: capítulo 1 en ${c1} min`);
    assert.ok(c2 >= 15 && c2 <= 20, `semilla ${semilla}: capítulo 2 en ${c2} min`);
    assert.ok(c3 >= 30 && c3 <= 45, `semilla ${semilla}: capítulo 3 en ${c3} min`);
    const total = r.capitulos[2].min;
    assert.ok(total >= 55 && total <= 75, `semilla ${semilla}: historia en ${total} min`);
  }
});

test('ninguna sequía de novedades: 5 min en la primera hora, 6 min en el capítulo 3; la primera ronda antes del minuto 12', () => {
  for (const { semilla, r } of corridas) {
    assert.ok(hueco(r, 0, 60) <= 5, `semilla ${semilla}: ${hueco(r, 0, 60).toFixed(1)} min sin novedad en la primera hora`);
    const fin2 = r.capitulos[1].min, fin3 = r.capitulos[2].min;
    assert.ok(hueco(r, fin2, fin3) <= 6, `semilla ${semilla}: ${hueco(r, fin2, fin3).toFixed(1)} min sin novedad en el capítulo 3`);
    // en los capítulos 1 y 2, un hito de la historia (misión o desbloqueo) cada 2 a 4 minutos en promedio
    const hitos = r.novedades.filter((n) => n.min <= fin2 && ['mision', 'ciudadesNuevas', 'avionNuevo'].includes(n.tipo)).map((n) => n.min);
    const unicos = [...new Set(hitos)];
    const medio = fin2 / unicos.length;
    assert.ok(medio >= 1.5 && medio <= 4, `semilla ${semilla}: un hito cada ${medio.toFixed(1)} min`);
    assert.ok(r.bancoListo < 12, `semilla ${semilla}: banco a los ${r.bancoListo} min`);
    assert.ok(r.primeraRonda !== null && r.primeraRonda < 12, `semilla ${semilla}: primera ronda a los ${r.primeraRonda} min`);
  }
});

test('al terminar la historia el juego sigue: contratos, rondas con medalla y objetivos a la vista', () => {
  for (const { semilla, r } of corridas) {
    const fin = r.novedades.find((n) => n.tipo === 'finHistoria');
    assert.ok(fin, `semilla ${semilla}: falta el evento finHistoria`);
    const s = r.estado;
    assert.ok(M.historiaTerminada(s));
    assert.equal(M.avanzarCapitulo(s).ok, false);
    assert.ok(M.misionesActivas(s).length >= 2, 'contratos a la vista');
    let rondas = 0, contratos = 0;
    for (let i = 0; i < 8 * 1440 / M.PASO; i++) for (const e of M.paso(s)) { if (e.tipo === 'resultadoNoche') rondas++; if (e.tipo === 'contratosNuevos') contratos++; }
    assert.ok(rondas >= 2 && contratos >= 6, `semilla ${semilla}: ${rondas} rondas y ${contratos} tableros en 8 días después del final`);
  }
});
