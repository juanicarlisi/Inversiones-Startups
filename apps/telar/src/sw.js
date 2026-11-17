// Service worker de Telar. build.py reemplaza VERSION y ARCHIVOS al armar (no editar en dist/).
const VERSION = '__VERSION__';
const ARCHIVOS = __ARCHIVOS__;
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
