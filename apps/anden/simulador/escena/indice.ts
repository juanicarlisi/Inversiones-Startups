// escena/indice.ts · Andén simulador, corte 1 · P6 (escena). La entrega del paquete (corte-1.md §9 P6).
// Reproductor de tramos con fórmulas cerradas, vistas 2D y 2,5D isométrica sin GPU (componer puro + pintar en Canvas 2D), elección del
// piso, mapa de las cien noches, momentos de la línea de tiempo y estilos claro y oscuro. Los textos de la interfaz están en
// textos.es.json y textos.en.json (claves 'escena.*'); la escena no escribe texto de interfaz en el lienzo, solo ids del modelo.
import type {
  AgregarRiesgo, CrearReproductor, CrearVista, DetectarMomentos, ElegirPiso, Estilo,
} from '../contratos/vistas.ts';
import { crearReproductor as crearReproductorEscena } from './reproductor.ts';
import { crearVista as crearVistaCanvas } from './vista.ts';
import { elegirPiso as elegir } from './piso.ts';
import { agregarRiesgo as agregar } from './riesgo.ts';
import { detectarMomentos as detectar } from './momentos.ts';
import { estilos as paleta } from './estilo.ts';

export const crearReproductor: CrearReproductor = crearReproductorEscena;
export const crearVista: CrearVista = crearVistaCanvas;
export const elegirPiso: ElegirPiso = elegir;
export const agregarRiesgo: AgregarRiesgo = agregar;
export const detectarMomentos: DetectarMomentos = detectar;
export const estilos: { claro: Estilo; oscuro: Estilo } = paleta;

export { componer2d, type Composicion, type Capa } from './componer2d.ts';
export { componerIso } from './componeriso.ts';
export { pintar } from './pintar.ts';
export { crearVistaCon, encuadrarVista } from './vista.ts';
export { crearProyector, encuadrar, type Primitiva, type Marco } from './primitivas.ts';
export { medidorDeCuadro, UMBRAL_ISO_MS } from './piso.ts';
export { elegirNoche, type CualNoche } from './riesgo.ts';
export { MomentoDerivado, claveMomento } from './momentos.ts';
export { narrar } from './narracion.ts';
export {
  conMovimientoReducido, CLAVE_ESTADO, COLOR_ESTADO, FORMA_ESTADO, PARES_TEXTO, contraste, luminancia, type Forma,
} from './estilo.ts';
export {
  EstadoPersona, EstadoPuesto, UMBRAL_ESPERA_MS, esReproductorEscena, type PosicionesEscena, type ReproductorEscena,
} from './reproductor.ts';
