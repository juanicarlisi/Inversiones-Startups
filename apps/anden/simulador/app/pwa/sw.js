// app/pwa/sw.js · Andén simulador, corte 1 · P8 (interfaz). Service worker de la PWA local.
// Guarda los archivos construidos para que la app ande sin red (presentar en una sala sin wifi, diseño maestro §5.6). No hay servidor de
// datos: todo lo que la app calcula se calcula en el dispositivo y el modelo viaja en el fragmento del enlace (#), que nunca llega acá.
// - Al instalarse guarda la cáscara y la lista de archivos construidos (la escribe el paso de construcción en ARCHIVOS_CONSTRUIDOS).
// - La página (navegación): primero la red, para recibir versiones nuevas; sin red, la copia guardada.
// - El resto de los archivos del mismo origen: la copia guardada y, en segundo plano, se actualiza.
// Para invalidar todo, cambiar VERSION (la construcción la reemplaza por la huella de los archivos).
const VERSION = 'anden-c1-/*VERSION*/dev';
const CASCARA = ['./', './index.html', './estilos.css', './entrada.js', './manifest.webmanifest', './icono.svg'];
const ARCHIVOS_CONSTRUIDOS = /*ARCHIVOS_CONSTRUIDOS*/[];

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // uno por uno: si falta un archivo, se guardan los demás
    await Promise.all([...new Set([...CASCARA, ...ARCHIVOS_CONSTRUIDOS])].map((u) => cache.add(u).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const claves = await caches.keys();
    await Promise.all(claves.filter((k) => k.startsWith('anden-') && k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;
  if (pedido.mode === 'navigate') {
    evento.respondWith((async () => {
      try {
        const r = await fetch(pedido);
        const cache = await caches.open(VERSION);
        await cache.put('./index.html', r.clone()).catch(() => null);
        return r;
      } catch {
        return (await caches.match('./index.html')) ?? (await caches.match('./')) ?? Response.error();
      }
    })());
    return;
  }
  evento.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const guardada = await cache.match(pedido);
    const deRed = fetch(pedido).then((r) => { if (r.ok) cache.put(pedido, r.clone()).catch(() => null); return r; }).catch(() => null);
    if (guardada) { evento.waitUntil(deRed); return guardada; }
    return (await deRed) ?? Response.error();
  })());
});
