// nucleo/indice.ts · Lo que el núcleo determinista (P1) entrega al resto (corte-1.md §9, P1).
// Durante el corte ningún otro paquete importa este archivo: lo inyecta la integración (regla técnica 5).
export { crearMotor, MAX_EVENTOS_POR_DEFECTO, MAX_MISMO_INSTANTE_POR_DEFECTO } from './motor/motor.ts';
export { crearFuenteAzar, UNIFORME_MAX, type FuenteAzarNucleo } from './azar/fuente.ts';
export { claveDe, fnv1a32 } from './azar/clave.ts';
export { philox4x32_10 } from './azar/philox.ts';
export { crearSorteador, ERLANG_K_MAX } from './azar/distribuciones.ts';
export { det } from './matematica/det.ts';
export { crearEscritorTraza, type EscritorTrazaNucleo } from './traza/escritor.ts';
export { tiempoTrapezoidal } from './cinematica/trapezoidal.ts';
export { huellaAgregada, hex16 } from './motor/huella.ts';
export { VERSION_MOTOR } from './version.ts';
