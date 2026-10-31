// integracion/entrada.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.3). Punto de entrada de la página (dist/entrada.js).
// Arma los servicios reales (puente.ts: Workers con el motor de producción) y arranca la interfaz de app/ en el <div id="app">.
// Nada de app/servicios-falsos.ts ni de app/falsos/ entra acá (lo controla pruebas/arquitectura.test.ts sobre el paquete construido).
import type { Comprobante } from '../contratos/experimentos.ts';
import { arrancar } from '../app/arrancar.ts';
import { crearServiciosNavegador, TRABAJADORES_CON_PELICULA } from './puente.ts';

/** Lo pone construir.mjs (esbuild `define`): el resultado de la batería con el motor de producción, si hay una corrida. */
declare const __ANDEN_MOTOR__: Comprobante['motor'] | null;

const raiz = document.getElementById('app');
if (!raiz) throw new Error('index.html tiene que tener un <div id="app">: no se encontró dónde montar la interfaz');

const motor = typeof __ANDEN_MOTOR__ === 'object' && __ANDEN_MOTOR__ !== null ? __ANDEN_MOTOR__ : undefined;
// worker.js queda junto a entrada.js en dist/ (construir.mjs): la URL se resuelve contra este módulo, no contra la página.
const servicios = crearServiciosNavegador(new URL('./worker.js', import.meta.url), motor);
addEventListener('pagehide', (ev) => { if (!(ev as PageTransitionEvent).persisted) servicios.cerrar(); });
const parametros = new URLSearchParams(location.search);
arrancar(servicios, raiz, {
  // window.__anden solo para los recorridos de punta a punta (e2e/): nunca en un enlace que se comparte.
  depuracion: parametros.get('depuracion') === '1',
  idioma: parametros.get('idioma') === 'en' ? 'en' : undefined,
  // mientras la película corre a la vista, a lo sumo TRABAJADORES_CON_PELICULA calculan: el resto de los núcleos dibuja (hallazgo EXP-02)
  alPelicula: (corre) => servicios.limitarTrabajadores(corre ? TRABAJADORES_CON_PELICULA : null),
});
