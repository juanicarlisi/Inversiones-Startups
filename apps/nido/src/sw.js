/* Service worker de {{NOMBRE}}: deja la app andando sin red.
   - Guarda en caché los archivos de esta versión al instalarse (lista y versión las escribe build.py).
   - Una versión nueva espera hasta que la persona toque «Actualizar» (mensaje {tipo:'activar'}); nunca toca los datos,
     que viven en IndexedDB y no en la caché.
   - Primero la caché y, si falta algo, la red. No guarda nada que venga de otro dominio (la app no lo usa). */
const VERSION = '{{VERSION}}';
const CACHE = 'nido-app-' + VERSION;
const ARCHIVOS = {{ARCHIVOS}};
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS.map(a => new Request(a, { cache: 'reload' })))));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('nido-app-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if (e.data && e.data.tipo === 'activar') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith((async () => (await caches.match('./index.html', { cacheName: CACHE })) || (await caches.match('./index.html')) || fetch(r))());
    return;
  }
  e.respondWith((async () => (await caches.match(r, { cacheName: CACHE, ignoreSearch: true })) || fetch(r))());
});
