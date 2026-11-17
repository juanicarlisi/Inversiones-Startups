// Service worker: la app funciona sin internet y se actualiza sin perder datos.
// Los datos viven en IndexedDB, que el service worker no toca: actualizar cambia solo los archivos de la app.
// La versión nueva espera a que la persona toque «Actualizar» (antes se escribe todo lo pendiente).

export function registrarSW({ alHaberNueva }) {
  if (!('serviceWorker' in navigator)) return;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (location.protocol !== 'https:' && !local) return;
  let pedida = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Solo se recarga si la persona pidió actualizar (la primera instalación también cambia el controlador).
    if (pedida) location.reload();
  });
  navigator.serviceWorker
    .register('sw.js')
    .then((reg) => {
      const avisar = (w) =>
        alHaberNueva(() => {
          pedida = true;
          w.postMessage({ tipo: 'activar' });
        });
      if (reg.waiting && navigator.serviceWorker.controller) avisar(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) avisar(w);
        });
      });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) reg.update().catch(() => {});
      });
    })
    .catch(() => {
      /* sin service worker la app anda igual, solo que necesita conexión para abrir */
    });
}
