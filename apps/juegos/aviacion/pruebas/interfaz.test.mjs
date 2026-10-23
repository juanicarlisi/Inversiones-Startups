// La interfaz v1 vista desde node: textos en los dos idiomas, un HTML por destino, el paquete del candidato sin anuncios, el uso
// de la API del modelo y las lecturas nuevas del modelo (ficha de avión y resumen de capítulo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { TEXTOS } from '../js/i18n.js';
import * as M from '../js/modelo.js';
import { todos, DESTINOS } from '../herramientas/destinos.mjs';
import { archivosDe, rutasAbsolutas } from '../herramientas/empaquetar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (f) => readFileSync(path.join(RAIZ, f), 'utf8');

test('i18n: todas las claves existen en es y en, sin textos del otro idioma', () => {
  const es = Object.keys(TEXTOS.es), en = Object.keys(TEXTOS.en);
  assert.deepEqual(es.filter((k) => !(k in TEXTOS.en)), [], 'claves que faltan en inglés');
  assert.deepEqual(en.filter((k) => !(k in TEXTOS.es)), [], 'claves que faltan en español');
  // inglés sin español: tildes y eñes solo en nombres propios (ciudades, aviones) y en «»
  const propios = /Bahía Blanca|Río Gallegos|Córdoba|Panamá|Iguazú|Río de Janeiro|São Paulo|Bogotá|Asunción|Tucumán|Neuquén|Chajá|Cauquén|Halcón|Cormorán|Golondrina|Tero|Español|«[^»]*»/g;
  const malos = en.filter((k) => /[áéíóúñ¿¡]/i.test(TEXTOS.en[k].replace(propios, '')));
  assert.deepEqual(malos, [], `en inglés hay texto en español: ${malos.map((k) => `${k}=${TEXTOS.en[k]}`).join(' | ')}`);
  // español sin inglés: palabras comunes del inglés
  const ingles = /\b(the|and|you|your|with|from|planes?|route|cash|day|night|mission|round)\b/i;
  const malosEs = es.filter((k) => ingles.test(TEXTOS.es[k].replace(/\{[^}]+\}/g, '')) && k !== 'idioma' && k !== 'lenguaOtra');
  assert.deepEqual(malosEs, [], `en español hay texto en inglés: ${malosEs.join(', ')}`);
  // las mismas variables {x} en los dos idiomas
  for (const k of es) {
    const vars = (s) => [...s.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1]).sort().join(',');
    assert.equal(vars(TEXTOS.en[k]), vars(TEXTOS.es[k]), `variables distintas en ${k}`);
  }
});

test('la portada tiene 15 palabras como máximo por idioma y no dice «Tap» con mouse ni «Click» con dedo', () => {
  for (const l of ['es', 'en']) {
    const palabras = `${TEXTOS[l].portadaSub} ${TEXTOS[l].inicioTexto}`.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w));
    assert.ok(palabras.length <= 15, `${l}: ${palabras.length} palabras`);
    for (const k of ['guia1', 'guia2', 'guia3', 'guiaRuta', 'guiaSaltear']) assert.ok(TEXTOS[l][k].replace('{Toca}', 'x').replace('{ciudad}', 'x').split(/\s+/).length <= 6, `${l}.${k} con más de 6 palabras`);
  }
  for (const l of ['es', 'en']) for (const [k, v] of Object.entries(TEXTOS[l])) {
    assert.ok(!/\b(Tap|Tocá|tap|tocá)\b/.test(v) || k.startsWith('ronda'), `${l}.${k} usa un verbo fijo en vez de {Toca}`);
  }
});

test('un HTML por destino, generado desde index.html; solo rutas relativas; el candidato no lleva anuncios', () => {
  const gen = todos();
  for (const archivo of Object.keys(DESTINOS)) assert.equal(leer(archivo), gen[archivo], `${archivo} desactualizado: correr node herramientas/destinos.mjs`);
  assert.ok(!/<script[^>]+src="https?:/.test(leer('index.html')), 'index.html no carga ningún SDK');
  assert.ok(leer('crazygames.html').includes('https://sdk.crazygames.com/crazygames-sdk-v3.js'));
  assert.ok(leer('crazygames.html').includes('content="basico"'));
  const cand = archivosDe('crazygames');
  assert.deepEqual(rutasAbsolutas(cand), []);
  assert.ok(Object.keys(cand).length < 1500);
  assert.ok(!('js/anuncios.js' in cand), 'el candidato no lleva js/anuncios.js');
  for (const [f, c] of Object.entries(cand)) assert.ok(!/requestAd|commercialBreak|rewardedBreak/.test(String(c)), `código de anuncios en ${f}`);
  assert.ok('js/anuncios.js' in archivosDe('poki'));
});

test('la interfaz usa del modelo solo lo que declara API_INTERFAZ', () => {
  const usados = new Set();
  for (const f of readdirSync(path.join(RAIZ, 'js')).filter((x) => x.endsWith('.js') && x !== 'modelo.js')) {
    for (const m of leer(`js/${f}`).matchAll(/\bM\.([A-Za-z_]\w*)/g)) usados.add(m[1]);
  }
  const fuera = [...usados].filter((k) => !M.API_INTERFAZ.includes(k));
  assert.deepEqual(fuera, [], `la interfaz usa algo fuera de API_INTERFAZ: ${fuera.join(', ')}`);
});

test('fichaAvion: carga por destino, llegada e ingreso estimado igual a lo que liquida el aterrizaje', () => {
  const s = M.nuevoEstado(3);
  M.tomarEventos(s);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  let f = null;
  for (let i = 0; i < 6 && !(f && f.fase === 'vuelo'); i++) { M.paso(s); f = M.fichaAvion(s, s.aviones[0].id); }
  assert.equal(f.fase, 'vuelo');
  assert.ok(f.unidades > 0 && f.carga[0].d === 'MVD');
  assert.ok(f.llegaEn > 0 && f.ingresoEst > 0 && f.costo > 0);
  const antes = s.stats.ingresos;
  let ev = [];
  for (let i = 0; i < 40; i++) { ev = M.paso(s); if (ev.some((e) => e.tipo === 'aterrizaje')) break; }
  const at = ev.find((e) => e.tipo === 'aterrizaje');
  assert.ok(at, 'aterrizó');
  assert.ok(Math.abs(at.ingreso - f.ingresoEst) <= 1, `estimado ${f.ingresoEst}, cobrado ${at.ingreso}`);
  assert.equal(at.netoViaje, at.ingreso - f.costo);
  assert.ok(s.stats.ingresos > antes);
  assert.equal(M.fichaAvion(s, 9999), null);
});

test('resumenCapitulo: cuenta desde el comienzo del capítulo (entregas, km, % a tiempo y mejor ruta)', () => {
  const s = M.nuevoEstado(4);
  M.tomarEventos(s);
  M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD');
  for (let i = 0; i < 200; i++) M.paso(s);
  const r = M.resumenCapitulo(s);
  assert.equal(r.cap, 1);
  assert.ok(r.entregas.correo > 0 && r.km > 0);
  assert.ok(r.aTiempo > 0 && r.aTiempo <= 1);
  assert.equal(r.mejorRuta.id, 'BUE-MVD');
  // al pasar de capítulo, el resumen vuelve a cero
  s.misiones = ['m1_primera', 'm1_segunda', 'm1_transbordo', 'm1_noche', 'm1_sur', 'm1_gallegos', 'm1_caja'];
  assert.equal(M.avanzarCapitulo(s).ok, true);
  const r2 = M.resumenCapitulo(s);
  assert.equal(r2.entregas.correo, 0); assert.equal(r2.km, 0);
  // y el guardado conserva el punto de partida del capítulo
  const r3 = M.resumenCapitulo(M.restaurar(M.guardar(s)));
  assert.deepEqual(r3.entregas, r2.entregas);
});
