// hub/indice.ts · Andén simulador, corte 1 · P4 (el hub). Lo que el paquete del hub entrega a los demás (corte-1.md §9, P4).
export { crearSimularNoche, armarNoche, opcionesNoche, ORDEN_BLOQUES, type NocheArmada } from './simular.ts';
export { crearSimularNocheF2, DOMINIO_F2 } from './f2.ts';
export { geometria } from './geometria.ts';
export { planBalanceado, asignarRampas } from './plan.ts';
export { PLANTILLAS, plantilla } from './plantillas/registro.ts';
export { crearAnillo, Anillo } from './estructuras/anillo.ts';
export { crearRueda, Rueda } from './estructuras/rueda.ts';
export { compilarConfig, horizonteMs, type Fidelidad } from './config.ts';
export { EV } from './bloques/comun.ts';
export { sorteaAusencia } from './bloques/personas.ts';
