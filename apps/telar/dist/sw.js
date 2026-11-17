// Service worker de Telar. build.py reemplaza VERSION y ARCHIVOS al armar (no editar en dist/).
const VERSION = '28125d414c';
const ARCHIVOS = [
  "./",
  "app.js",
  "datos/almacen.js",
  "datos/repositorio.js",
  "estilos.css",
  "fuentes/bricolage-grotesque-latin-600-normal.woff2",
  "fuentes/bricolage-grotesque-latin-700-normal.woff2",
  "fuentes/instrument-sans-latin-400-normal.woff2",
  "fuentes/instrument-sans-latin-500-normal.woff2",
  "fuentes/instrument-sans-latin-600-normal.woff2",
  "iconos/apple-touch-icon.png",
  "iconos/icono-192.png",
  "iconos/icono-512.png",
  "iconos/icono-maskable-192.png",
  "iconos/icono-maskable-512.png",
  "iconos/telar.svg",
  "index.html",
  "manifest.webmanifest",
  "modelo/ejemplo.js",
  "modelo/fechas.js",
  "modelo/formato.js",
  "modelo/historial.js",
  "modelo/plan.js",
  "modelo/vista.js",
  "tema.js",
  "ui/arrastre.js",
  "ui/cronograma.js",
  "ui/estado.js",
  "ui/iconos.js",
  "ui/panel.js",
  "ui/primer-minuto.js",
  "ui/registro-sw.js",
  "ui/tablero.js",
  "ui/util.js",
  "version.js"
];
const CACHE = 'telar-' + VERSION;

self.addEventListener('install', (e) => {
  // Se guardan todos los archivos de esta versión. No se activa sola: espera que la app lo pida.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith('telar-') && k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.tipo === 'activar') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    // Cualquier dirección de la app abre la app guardada (también ?nueva=1 del atajo).
    e.respondWith(caches.open(CACHE).then((c) => c.match('index.html')).then((res) => res || fetch(r)));
    return;
  }
  e.respondWith(caches.open(CACHE).then((c) => c.match(r, { ignoreSearch: true })).then((res) => res || fetch(r)));
});
