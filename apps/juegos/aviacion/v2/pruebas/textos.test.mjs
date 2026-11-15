// Pruebas de la capa de presentación que no necesitan navegador: los textos cumplen las reglas de claridad.
//   cd apps/juegos/aviacion/v2 && node --test pruebas/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { TEXTOS, GLOSARIO } from '../src/ui/textos.js';
import { ICONOS } from '../src/ui/iconos.js';
import { MISIONES, AVIONES } from '../../js/datos.js';

test('español e inglés tienen exactamente las mismas claves', () => {
  const es = Object.keys(TEXTOS.es).sort(), en = Object.keys(TEXTOS.en).sort();
  assert.deepEqual(es.filter((k) => !en.includes(k)), [], 'faltan en inglés');
  assert.deepEqual(en.filter((k) => !es.includes(k)), [], 'faltan en español');
});

test('cero jerga: ni sacas, ni transbordos, ni balizas, ni «hub» fuera del nombre del juego', () => {
  const prohibidas = { es: [/\bsacas?\b/i, /transbord/i, /baliza/i, /\bhub\b/i, /clasific/i, /cuello de botella/i], en: [/\bbags?\b/i, /\bhub\b/i, /bottleneck/i, /\bsort(ing)? cent/i] };
  for (const lengua of ['es', 'en']) for (const [k, v] of Object.entries(TEXTOS[lengua])) {
    if (k === 'titulo') continue;
    for (const re of prohibidas[lengua]) assert.ok(!re.test(v), `${lengua}.${k}: «${v}» usa ${re}`);
  }
});

test('el glosario tiene 8 términos como mucho, cada uno con su ícono, su nombre y una sola frase', () => {
  assert.ok(GLOSARIO.length <= 8 && GLOSARIO.length >= 6);
  for (const [ico, clave] of GLOSARIO) {
    assert.ok(ICONOS[ico], `falta el ícono ${ico}`);
    for (const lengua of ['es', 'en']) {
      assert.ok(TEXTOS[lengua][`${clave}_t`], `falta el nombre de ${clave} en ${lengua}`);
      const frase = TEXTOS[lengua][clave];
      assert.ok(frase && frase.length <= 90, `${lengua}.${clave} es larga: ${frase}`);
      assert.ok((frase.match(/[.!?]/g) ?? []).length <= 2, `${lengua}.${clave} tiene más de dos frases`);
    }
  }
});

test('todas las misiones y todos los aviones tienen su texto en los dos idiomas', () => {
  for (const lengua of ['es', 'en']) {
    for (const m of MISIONES) assert.ok(TEXTOS[lengua][m.id], `falta ${lengua}.${m.id}`);
    for (const a of AVIONES) assert.ok(TEXTOS[lengua][`a_${a.id}`], `falta ${lengua}.a_${a.id}`);
  }
});

test('la entrada cuenta la historia en dos frases y la guía pide una sola acción por paso', () => {
  for (const lengua of ['es', 'en']) {
    const intro = `${TEXTOS[lengua].intro1} ${TEXTOS[lengua].intro2}`;
    assert.ok(intro.length < 200, 'la entrada es corta');
    for (const k of ['g_tocar', 'g_ruta', 'g_avion']) assert.equal((TEXTOS[lengua][k].match(/<b>[^<]*[.!]<\/b>/g) ?? []).length, 1, `${lengua}.${k} marca una sola acción`);
  }
});

test('lo que no se entendió en la prueba a ciegas no vuelve: ni «cambiar de avión» ni «el correo ordena»', () => {
  for (const [k, v] of Object.entries(TEXTOS.es)) {
    assert.ok(!/cambi\w+ de avión/i.test(v), `es.${k}: «${v}» habla de cambiar de avión`);
    assert.ok(!/correo ordena/i.test(v), `es.${k}: «${v}»`);
  }
  for (const [k, v] of Object.entries(TEXTOS.en)) assert.ok(!/change planes|sorts up to/i.test(v), `en.${k}: «${v}»`);
  for (const lengua of ['es', 'en']) {
    const ayuda = TEXTOS[lengua].ayuda_m1_transbordo;
    assert.ok(ayuda && ayuda.length <= 125, `${lengua}: la misión 3 lleva su explicación corta`);
    assert.ok(/\{n\}.*\{u\}/.test(TEXTOS[lengua].agrandarExplica), `${lengua}: agrandar el correo dice qué se compra (cuántas por hora)`);
  }
});

test('cada opción de una decisión dice qué pasa si se la elige y cada encargo dice si se puede cumplir', () => {
  for (const lengua of ['es', 'en']) {
    const T = TEXTOS[lengua];
    for (const v of [0, 30, 60, 90]) {
      assert.ok(T[`sale${v}`] && T[`salePista${v}`], `${lengua}: falta el efecto de la opción ${v}`);
      assert.ok(T[`salePista${v}`].length <= 80, `${lengua}.salePista${v} es larga`);
    }
    for (const k of ['ord_primero', 'ord_todas', 'ord_tarde']) assert.ok(T[k], `${lengua}: falta ${k}`);
    assert.ok(T.ord_primero.includes('{ciudad}') && T.ord_tarde.includes('{ciudad}'));
    for (const k of ['enc_directo', 'enc_base', 'enc_escala', 'enc_faltaRuta', 'enc_faltaAvion', 'enc_faltaUnir']) assert.ok(T[k] && T[k].length <= 60, `${lengua}.${k}`);
    assert.equal((T.g_noche.match(/<b>[^<]*<\/b>/g) ?? []).length, 1, `${lengua}.g_noche pide una sola acción`);
  }
});
