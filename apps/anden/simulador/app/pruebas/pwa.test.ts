// app/pruebas/pwa.test.ts · P8 · la PWA local (manifest y service worker), y qrcode-generator 2.0.4 vendorizado con su licencia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP, leer } from './ayudas.ts';
import qrcode from '../vendor/qrcode-generator-2.0.4.js';

test('manifest: nombre, inicio y alcance relativos, pantalla sola, colores e ícono', () => {
  const m = JSON.parse(leer(join(APP, 'pwa', 'manifest.webmanifest')));
  assert.equal(m.short_name, 'Andén');
  assert.equal(m.start_url, './');
  assert.equal(m.scope, './');
  assert.equal(m.display, 'standalone');
  assert.equal(m.lang, 'es-AR');
  assert.match(m.background_color, /^#[0-9a-f]{6}$/);
  assert.ok(m.icons.length >= 1 && m.icons.every((i: { src: string }) => i.src === './icono.svg'));
  assert.match(leer(join(APP, 'pwa', 'icono.svg')), /^<svg[^>]*viewBox="0 0 64 64"/);
});

test('service worker: guarda la cáscara y los archivos construidos, red primero para la página, borra versiones viejas', () => {
  const sw = leer(join(APP, 'pwa', 'sw.js'));
  for (const marca of ['/*VERSION*/', '/*ARCHIVOS_CONSTRUIDOS*/[]']) assert.ok(sw.includes(marca), `falta la marca ${marca} que reemplaza la construcción`);
  for (const ev of ['install', 'activate', 'fetch']) assert.ok(sw.includes(`addEventListener('${ev}'`), `el service worker no atiende «${ev}»`);
  for (const f of ['./index.html', './estilos.css', './entrada.js', './manifest.webmanifest']) assert.ok(sw.includes(`'${f}'`), `la cáscara no guarda ${f}`);
  assert.match(sw, /pedido\.mode === 'navigate'/);
  assert.match(sw, /caches\.delete/);
  assert.ok(!/importScripts|eval\(/.test(sw));
  // tiene que ser JavaScript válido (se carga tal cual, sin construir)
  assert.doesNotThrow(() => new Function(sw.replace(/self\./g, 'globalThis.')));
});

test('qrcode-generator 2.0.4: el archivo vendorizado es el del paquete npm (SHA-256) y lleva su licencia MIT', () => {
  const js = readFileSync(join(APP, 'vendor', 'qrcode-generator-2.0.4.js'));
  assert.equal(createHash('sha256').update(js).digest('hex'), 'ea91d7118a5395289170da848b7c6758b996163bfbccf312591ab65a4911b7c0');
  const lic = leer(join(APP, 'vendor', 'LICENCIA-qrcode-generator.txt'));
  assert.match(lic, /The MIT License/);
  assert.match(lic, /Copyright \(c\) 2009 Kazuhiko Arase/);
  assert.match(lic, /ea91d7118a5395289170da848b7c6758b996163bfbccf312591ab65a4911b7c0/);
});

test('el QR de un enlace de plantilla entra con corrección L y es determinista', () => {
  const url = `https://ejemplo.invalid/anden/#t=hub-chico@1.0.0&p=${'A'.repeat(300)}&r=${'B'.repeat(60)}`;
  const hacer = () => { const q = qrcode(0, 'L'); q.addData(url, 'Byte'); q.make(); return q; };
  const a = hacer(), b = hacer();
  const n = a.getModuleCount();
  assert.ok(n >= 21 && n <= 177, `módulos ${n}`);
  let oscuros = 0, iguales = true;
  for (let f = 0; f < n; f++) for (let k = 0; k < n; k++) { if (a.isDark(f, k)) oscuros++; if (a.isDark(f, k) !== b.isDark(f, k)) iguales = false; }
  assert.ok(iguales, 'el mismo texto da el mismo QR');
  assert.ok(oscuros > n * n * 0.3 && oscuros < n * n * 0.7, `proporción de módulos oscuros rara: ${oscuros} de ${n * n}`);
  // patrón de posición arriba a la izquierda: borde oscuro de 7 × 7
  for (let i = 0; i < 7; i++) { assert.ok(a.isDark(0, i) && a.isDark(6, i) && a.isDark(i, 0) && a.isDark(i, 6)); }
});

test('service worker: sin red, la copia de la app nunca es un 404 ni un archivo cualquiera abierto como página (hallazgo SEG-04)', async () => {
  const sw = leer(join(APP, 'pwa', 'sw.js'));
  const oyentes: Record<string, (ev: unknown) => void> = {};
  const guardado = new Map<string, { status: number; tipo: string }>();
  const cache = {
    put: async (clave: string, r: { status: number; headers: Headers }) => { guardado.set(clave, { status: r.status, tipo: r.headers.get('content-type') ?? '' }); },
    match: async () => undefined, add: async () => undefined,
  };
  const entorno = {
    addEventListener: (tipo: string, f: (ev: unknown) => void) => { oyentes[tipo] = f; },
    location: { origin: 'http://127.0.0.1:8080', href: 'http://127.0.0.1:8080/sw.js' },
    skipWaiting: async () => undefined, clients: { claim: async () => undefined },
  };
  const respuestas: Record<string, { status: number; tipo: string; cuerpo: string }> = {
    '/': { status: 200, tipo: 'text/html; charset=utf-8', cuerpo: '<!doctype html>' },
    '/no-existe': { status: 404, tipo: 'text/plain; charset=utf-8', cuerpo: 'no está' },
    '/sw.js': { status: 200, tipo: 'text/javascript', cuerpo: '//' },
    '/otra.html': { status: 200, tipo: 'text/html', cuerpo: '<p>otra</p>' },
  };
  const fetchFalso = async (pedido: { url: string }) => {
    const r = respuestas[new URL(pedido.url).pathname];
    return new Response(r.cuerpo, { status: r.status, headers: { 'content-type': r.tipo } });
  };
  const correr = new Function('self', 'caches', 'fetch', 'Response', sw);
  correr(entorno, { open: async () => cache, keys: async () => [], match: async () => undefined }, fetchFalso, Response);
  const navegar = async (ruta: string) => {
    let promesa: Promise<unknown> | null = null;
    oyentes.fetch({ request: { method: 'GET', mode: 'navigate', url: `http://127.0.0.1:8080${ruta}` }, respondWith: (p: Promise<unknown>) => { promesa = p; } });
    await promesa;
  };
  for (const ruta of ['/no-existe', '/sw.js', '/otra.html']) await navegar(ruta);
  assert.equal(guardado.size, 0, `no se tenía que guardar nada como la app y se guardó ${JSON.stringify([...guardado])}`);
  await navegar('/');
  assert.deepEqual(guardado.get('./index.html'), { status: 200, tipo: 'text/html; charset=utf-8' }, 'la página de la app sí se guarda');
});
