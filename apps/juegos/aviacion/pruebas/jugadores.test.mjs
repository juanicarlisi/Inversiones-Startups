// El instrumento de medición: los perfiles solo juegan con lo que ve una persona, y las herramientas devuelven lo que prometen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as M from '../js/modelo.js';
import { correr } from '../herramientas/jugadores.mjs';
import * as D from '../herramientas/diferencial.mjs';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// el código de los perfiles, sin comentarios (los comentarios pueden nombrar modelo.js)
const fuente = fs.readFileSync(path.join(dir, 'herramientas/perfiles.mjs'), 'utf8').split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');

test('los perfiles no importan modelo.js ni usan funciones fuera de la API de la interfaz', () => {
  const imports = [...fuente.matchAll(/import\s[^;]*from\s+'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(imports, ['./interfaz.mjs'], 'solo importan la puerta de la interfaz');
  assert.ok(!/modelo\.js/.test(fuente));
  const usados = new Set([...fuente.matchAll(/\bI\.([A-Za-z_]\w*)/g)].map((m) => m[1]));
  for (const u of usados) assert.ok(M.API_INTERFAZ.includes(u), `I.${u} no es de la interfaz`);
  for (const k of M.API_INTERFAZ) assert.ok(k in M, `API_INTERFAZ nombra ${k}, que modelo.js no exporta`);
});

test('los perfiles solo leen campos visibles del estado', () => {
  const prohibidos = ['colas', 'transbordo', 'acum', 'tbAcum', 'semilla', 'verRed', 'stats', 'ronda', 'contratos', 'banco', 'mision', 'flags', 'diario', 'ultSalida', 'ultVuelo', 'clima'];
  for (const p of prohibidos) assert.ok(!new RegExp(`\\bs\\.${p}\\b`).test(fuente), `lee s.${p}`);
});

test('jugadores.mjs imprime el JSON prometido; con --novedad, la línea de tiempo del novato', () => {
  const salida = execFileSync('node', ['herramientas/jugadores.mjs', '--perfil', 'literal', '--semilla', '1', '--minutos', '12'], { cwd: dir, encoding: 'utf8' });
  const r = JSON.parse(salida);
  for (const k of ['primerDespegue', 'primerCobro', 'misiones', 'capitulos', 'minPorCapitulo', 'huecoMaxNovedad', 'gananciaDia', 'cajaMin', 'trabadas'])
    assert.ok(k in r, `falta ${k}`);
  assert.ok(r.misiones.every((m) => typeof m.min === 'number' && typeof m.duracion === 'number'));
  assert.ok('10' in r.gananciaDia);
  const nov = execFileSync('node', ['herramientas/jugadores.mjs', '--novedad', '--semilla', '1'], { cwd: dir, encoding: 'utf8' });
  assert.match(nov, /hueco máximo/);
  assert.ok(nov.split('\n').filter((l) => /min/.test(l)).length > 5);
});

// Se mide el tiempo de CPU del proceso (no el de reloj): node --test corre los archivos de prueba en paralelo y el reloj mediría
// la competencia por el procesador, no lo que tardan las herramientas.
test('las 4 corridas de perfil con semilla 1 y diferencial.mjs terminan en menos de 60 s en total', () => {
  const c0 = process.cpuUsage(), t0 = Date.now();
  for (const p of ['literal', 'novato', 'listo', 'compraTodo']) correr(p, { semilla: 1 }); // lo mismo que la línea de comandos
  const d = { a: D.casoA(), b: D.casoB(), c: D.casoC(), d: D.casoD(), e: D.casoE(), f: D.casoF() };
  const cpu = process.cpuUsage(c0), seg = (cpu.user + cpu.system) / 1e6;
  assert.ok(seg < 60, `${seg.toFixed(1)} s de CPU (${((Date.now() - t0) / 1000).toFixed(1)} s de reloj)`);
  for (const k of ['a', 'b', 'c', 'd', 'e', 'f']) assert.ok(d[k], `caso ${k}`);
});

test('diferencial.mjs: las metas del ruteo (c, d) y del hub (a) se cumplen', () => {
  const d = JSON.parse(execFileSync('node', ['herramientas/diferencial.mjs', '--json', '--sin-f'], { cwd: dir, encoding: 'utf8' }));
  assert.ok(d.c.ok, `estrella contra cadena: ${d.c.dif}%`);
  assert.ok(d.d.ok, `rutas vacías: ${d.d.dif}%`);
  assert.ok(d.a.ok, `transbordo nivel 0 → 2: ${d.a.dif}%`);
  assert.ok(d.e.ok, `clima: ${d.e.dif}%`);
});
