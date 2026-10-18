// escena/pruebas/estilo.test.ts · P6. Contraste (corte-1.md §9 P6): todo par texto/fondo del estilo ≥ 4,5:1 y los estados distinguibles en
// escala de grises (diferencia de luminancia ≥ 15% o forma distinta), en los dos temas. Además: gráficos ≥ 3:1 sobre donde se dibujan
// (WCAG 1.4.11), una forma distinta por estado, la escala de riesgo monótona y los dos temas con los mismos nombres de color.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EstadoVisual } from '../../contratos/vistas.ts';
import {
  CLAVE_ESTADO, COLOR_ESTADO, ESTADOS, FORMA_ESTADO, PARES_GRAFICOS, PARES_TEXTO, claveRiesgo, color, colorRiesgo, conMovimientoReducido,
  contraste, estilos, luminancia, mezclar, nivelRiesgo, rgb, sombrear,
} from '../estilo.ts';

const TEMAS = [estilos.claro, estilos.oscuro];

test('los dos temas tienen los mismos nombres de color y todos son #rrggbb', () => {
  assert.deepEqual(Object.keys(estilos.oscuro.colores).sort(), Object.keys(estilos.claro.colores).sort());
  for (const e of TEMAS) for (const [k, v] of Object.entries(e.colores)) assert.match(v, /^#[0-9a-f]{6}$/, `${e.tema}.${k} = «${v}» no es #rrggbb`);
  assert.equal(estilos.claro.tema, 'claro');
  assert.equal(estilos.oscuro.tema, 'oscuro');
});

test('contraste: todo par texto/fondo del estilo ≥ 4,5:1 (WCAG AA), en los dos temas', () => {
  for (const e of TEMAS) for (const [t, f] of PARES_TEXTO) {
    const c = contraste(color(e, t), color(e, f));
    assert.ok(c >= 4.5, `${e.tema}: ${t} (${e.colores[t]}) sobre ${f} (${e.colores[f]}) tiene ${c.toFixed(2)}:1 y se exige 4,5:1`);
  }
});

test('contraste: cada estado y cada persona ≥ 3:1 sobre el piso, la bandeja y el tobogán; las alarmas ≥ 3:1 donde se pintan', () => {
  for (const e of TEMAS) for (const [g, f] of PARES_GRAFICOS) {
    const c = contraste(color(e, g), color(e, f));
    assert.ok(c >= 3, `${e.tema}: ${g} (${e.colores[g]}) sobre ${f} (${e.colores[f]}) tiene ${c.toFixed(2)}:1 y se exige 3:1`);
  }
});

test('estados distinguibles en escala de grises: para cada par, forma distinta o luminancia que difiere ≥ 15%', () => {
  for (const e of TEMAS) {
    for (let i = 0; i < ESTADOS.length; i++) for (let j = i + 1; j < ESTADOS.length; j++) {
      const a = ESTADOS[i], b = ESTADOS[j];
      const dl = Math.abs(luminancia(color(e, COLOR_ESTADO[a])) - luminancia(color(e, COLOR_ESTADO[b])));
      assert.ok(FORMA_ESTADO[a] !== FORMA_ESTADO[b] || dl >= 0.15,
        `${e.tema}: los estados ${a} y ${b} tienen la misma forma (${FORMA_ESTADO[a]}) y una diferencia de luminancia de ${(dl * 100).toFixed(1)}%`);
    }
  }
});

test('una forma propia por estado (también se distinguen sin color), un color y una clave i18n por estado', () => {
  const formas = ESTADOS.map((s) => FORMA_ESTADO[s]);
  assert.equal(new Set(formas).size, ESTADOS.length, `formas repetidas: ${formas.join(', ')}`);
  assert.deepEqual([...ESTADOS].sort(), Object.values(EstadoVisual).sort(), 'están todos los estados del contrato');
  for (const s of ESTADOS) {
    assert.ok(COLOR_ESTADO[s] in estilos.claro.colores, `el estado ${s} no tiene color`);
    assert.match(CLAVE_ESTADO[s], /^escena\.estado\./);
  }
});

test('escala de riesgo: 5 pasos monótonos en luminancia (≥ 1,25:1 entre vecinos), con su clave de leyenda', () => {
  for (const e of TEMAS) {
    const L = [0, 1, 2, 3, 4].map((i) => luminancia(color(e, `riesgo${i}`)));
    const sube = L[4] > L[0];
    for (let i = 1; i < 5; i++) {
      assert.ok(sube ? L[i] > L[i - 1] : L[i] < L[i - 1], `${e.tema}: la escala de riesgo no es monótona en el paso ${i}`);
      const c = contraste(color(e, `riesgo${i}`), color(e, `riesgo${i - 1}`));
      assert.ok(c >= 1.25, `${e.tema}: riesgo${i - 1} y riesgo${i} casi no se distinguen en grises (${c.toFixed(2)}:1)`);
    }
  }
  const casos: [number, number][] = [[0, 0], [Number.NaN, 0], [0.05, 1], [0.1, 2], [0.29, 2], [0.3, 3], [0.59, 3], [0.6, 4], [1, 4]];
  for (const [p, n] of casos) {
    assert.equal(nivelRiesgo(p), n, `p = ${p}: se esperaba el paso ${n}`);
    assert.equal(colorRiesgo(p), `riesgo${n}`);
    assert.equal(claveRiesgo(p), `escena.riesgo.nivel${n}`);
  }
});

test('cuentas de color: luminancia y contraste WCAG con valores de control', () => {
  assert.equal(luminancia('#ffffff'), 1);
  assert.equal(luminancia('#000000'), 0);
  assert.equal(contraste('#000000', '#ffffff'), 21);
  assert.equal(contraste('#777777', '#777777'), 1);
  assert.ok(Math.abs(contraste('#767676', '#ffffff') - 4.54) < 0.01, 'el gris #767676 sobre blanco es el clásico 4,54:1');
  assert.deepEqual(rgb('#abc'), [0xaa, 0xbb, 0xcc]);
  assert.throws(() => rgb('azul'), /color inválido «azul» \(se esperaba #rrggbb\)/);
  assert.equal(mezclar('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(sombrear('#808080', 0.5), '#404040');
});

test('color() avisa con el nombre si falta; movimiento reducido conserva tema y colores', () => {
  assert.throws(() => color(estilos.claro, 'noExiste'), /el estilo «claro» no tiene el color «noExiste»/);
  const r = conMovimientoReducido(estilos.oscuro, true);
  assert.equal(r.reducirMovimiento, true);
  assert.equal(r.tema, 'oscuro');
  assert.equal(r.colores, estilos.oscuro.colores);
  assert.equal(estilos.claro.reducirMovimiento, false);
  assert.ok(Object.isFrozen(estilos.claro) && Object.isFrozen(estilos.claro.colores), 'los estilos publicados no se pueden cambiar');
});
