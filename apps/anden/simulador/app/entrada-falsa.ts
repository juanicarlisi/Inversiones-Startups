// app/entrada-falsa.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// Arranca la interfaz con los servicios falsos (maqueta + resultados sintéticos) en vez de los reales. La construye y la abre
// pruebas/humo.mjs; la integración usa integracion/entrada.ts con los servicios de verdad.
import { arrancar } from './arrancar.ts';
import { crearServiciosFalsos } from './servicios-falsos.ts';

const raiz = document.getElementById('app');
if (!raiz) throw new Error('index.html tiene que tener un <div id="app">');
const parametros = new URLSearchParams(location.search);
arrancar(crearServiciosFalsos({ retardo: Number(parametros.get('retardo') ?? 12) }), raiz, {
  depuracion: true,
  pwa: parametros.get('pwa') !== '0',
  idioma: parametros.get('idioma') === 'en' ? 'en' : undefined,
});
