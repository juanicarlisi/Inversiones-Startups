// app/pruebas/claves.test.ts · P8 · toda clave de texto que el código de la interfaz pide existe en español y en inglés (las fijas, que se
// leen del código, y las que se arman con un nombre: causas, etiquetas, indicadores, noches, actos, sellos, temas y planes). Y ningún texto
// de app/ queda sin usar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { archivosApp, leer } from './ayudas.ts';
import { diccionariosDeTodos, TEXTOS_APP } from '../i18n/diccionarios.ts';
import { Causa } from '../../contratos/traza.ts';
import { KPIS } from '../../contratos/resultados.ts';
import { ETIQUETAS } from '../ui/insignia.ts';
import { ACTOS } from '../estado.ts';

const PREFIJOS = ['app', 'escena', 'explicacion', 'modelo', 'experimentos'];
const codigo = archivosApp(['.ts']).filter((p) => !p.includes('/pruebas/')).map(leer).join('\n');

/** Claves escritas literalmente en el código ('prefijo.algo'). */
function clavesFijas(): string[] {
  const re = new RegExp(`'((?:${PREFIJOS.join('|')})\\.[A-Za-z0-9_.\\-]+)'`, 'g');
  return [...new Set([...codigo.matchAll(re)].map((m) => m[1]))].filter((k) => !k.endsWith('.')).sort();
}

/** Claves que el código arma con un nombre (`app.kpi.${kpi}`…): todas las que pueden salir. */
function clavesArmadas(): string[] {
  const causas = Object.keys(Causa).map((k) => k.toLowerCase());
  return [
    ...causas.map((c) => `app.causa.${c}`),
    ...ETIQUETAS.flatMap((e) => [`app.etiqueta.${e}`, `app.etiqueta.${e}.ayuda`]),
    ...KPIS.map((k) => `app.kpi.${k}`),
    ...['provisoria', 'mediana', 'peor', 'mejor', 'receta', 'elegida', 'previa'].map((c) => `app.noche.etiqueta.${c}`),
    ...Array.from({ length: ACTOS }, (_, i) => ['titulo', 'subtitulo', 'corto'].map((x) => `app.presentar.acto${i}.${x}`)).flat(),
    ...['reproducida', 'sin-receta', 'otro-motor', 'calculando'].map((x) => `app.sello.reproducida.${x}`),
    ...['sistema', 'claro', 'oscuro'].flatMap((x) => [`app.tema.${x}`, `app.tema.corto.${x}`]),
    ...['por-volumen', 'contiguas'].map((x) => `app.ysi.plan.${x}`),
    ...['hub-chico', 'hub-lazo-noche'].map((x) => `app.plantilla.${x}.problema`),
    // de otros paquetes, armadas por la interfaz
    ...['verde', 'amarillo', 'rojo'].map((c) => `experimentos.semaforo.color.${c}`),
    ...['ok', 'precision-no-lograda', 'decision-en-duda', 'pocas-replicas', 'inestable', 'conservacion', 'invariante', 'fuera-de-dominio', 'modelo-con-errores']
      .map((m) => `experimentos.semaforo.${m}`),
    ...['cumple', 'no-cumple', 'en-duda'].map((x) => `experimentos.estado.${x}`),
    ...['b-mejor', 'a-mejor', 'no-se-distingue'].map((x) => `experimentos.veredicto.${x}`),
    ...[0, 1, 2, 3, 4].map((n) => `escena.riesgo.nivel${n}`),
    ...['mediana', 'peor', 'mejor'].map((x) => `escena.riesgo.noche.${x}`),
    ...['descarga', 'induccion', 'sorter', 'rampas'].map((x) => `modelo.etapa.${x}`),
    ...['error', 'aviso', 'info'].map((x) => `modelo.nivel.${x}`),
    ...['formato', 'muy-largo', 'bomba', 'json-invalido', 'json-profundo', 'esquema', 'presupuesto', 'plantilla-desconocida', 'version-motor']
      .map((x) => `modelo.enlace.${x}`),
    ...['fila', 'bloqueo', 'rampa_llena', 'pausa', 'ausencia', 'falla', 'cierre_jaula', 'no_leido'].map((x) => `explicacion.cambio.${x}`),
    ...['listo', 'en_duda', 'ninguna_cumple'].map((x) => `explicacion.formulario.${x}`),
  ];
}

test('cada clave fija del código existe en español y en inglés', () => {
  const d = diccionariosDeTodos();
  const fijas = clavesFijas();
  assert.ok(fijas.length > 250, `se esperaban más de 250 claves fijas en el código y se encontraron ${fijas.length}`);
  const faltan = fijas.filter((k) => !(k in d.es) || !(k in d.en));
  assert.deepEqual(faltan, [], `claves que el código usa y no están en los diccionarios: ${faltan.join(', ')}`);
});

test('cada clave armada con un nombre existe en español y en inglés', () => {
  const d = diccionariosDeTodos();
  const faltan = clavesArmadas().filter((k) => !(k in d.es) || !(k in d.en));
  assert.deepEqual(faltan, [], `claves armadas que no están en los diccionarios: ${faltan.join(', ')}`);
});

test('ningún texto de app/ queda sin usar', () => {
  const usadas = new Set([...clavesFijas(), ...clavesArmadas()]);
  const sobran = Object.keys(TEXTOS_APP.es).filter((k) => !usadas.has(k));
  assert.deepEqual(sobran, [], `textos de app/ que nadie usa: ${sobran.join(', ')}`);
});
