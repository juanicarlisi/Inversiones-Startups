// integracion/ensamblar.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.1).
// El único lugar donde se juntan los paquetes: el motor de producción (nucleo/) se inyecta en el hub, el compilador en la variante, las
// plantillas publicadas en el códec del enlace y el simulador en el contrafactual. Ningún paquete se importa a otro: lo hace este archivo.
//
// Corre en el navegador (interfaz y Worker) y en Node (pruebas): no importa nada de Node. La batería (verificacion/bateria.ts usa
// node:fs) se ensambla aparte, en ensamblar-bateria.ts, para que no entre en el paquete del navegador.
//
// Todo recibe el `CrearMotor` como parámetro (por defecto, el de producción): así la prueba diferencial R08b arma lo mismo con la
// referencia de contratos/ y compara.
import type { CrearMotor } from '../contratos/motor.ts';
import type { SimularNoche, RegistroPlantillas } from '../contratos/hub.ts';
import type { CodecEnlace, ResolverPlantilla } from '../contratos/escena.ts';
import type { Variante } from '../contratos/modelo.ts';
import type { ContrafactualDirigido } from '../contratos/explicacion.ts';
import { crearMotor, VERSION_MOTOR } from '../nucleo/indice.ts';
import { crearSimularNoche, crearSimularNocheF2, PLANTILLAS } from '../hub/indice.ts';
import { compilar, crearCodec, crearVariante } from '../modelo/indice.ts';
import { crearContrafactual } from '../explicacion/indice.ts';

/** El motor de producción (P1). Es el que corre en los Workers y en la batería de la integración. */
export const crearMotorProduccion: CrearMotor = crearMotor;
export { VERSION_MOTOR };

/** Las plantillas publicadas (inmutables) y su resolución por id y versión, para el códec del enlace. */
export const plantillas: RegistroPlantillas = PLANTILLAS;
export const resolverPlantilla: ResolverPlantilla = (id, version) => PLANTILLAS[`${id}@${version}`] ?? null;

/** Lo que corre en el Worker: una noche del hub (F3) y su versión F2, sobre el motor que se pase. */
export function ensamblarSimulador(cm: CrearMotor = crearMotor): { simularNoche: SimularNoche; simularNocheF2: SimularNoche } {
  return { simularNoche: crearSimularNoche(cm), simularNocheF2: crearSimularNocheF2(cm) };
}

/** Lo que corre en el hilo de la interfaz para el modelo: compilar, variantes y el enlace con las plantillas publicadas. */
export function ensamblarModelo(): { compilar: typeof compilar; variante: Variante; codec: CodecEnlace } {
  return {
    compilar,
    variante: crearVariante(compilar),
    // Con la versión del motor: una receta hecha con otra versión mayor se rechaza (modelo/NOTAS-CONTRATO.md §4).
    codec: crearCodec(resolverPlantilla, { versionMotor: VERSION_MOTOR }),
  };
}

export interface Ensamblado {
  versionMotor: string;
  crearMotor: CrearMotor;
  simularNoche: SimularNoche;
  simularNocheF2: SimularNoche;
  compilar: typeof compilar;
  variante: Variante;
  codec: CodecEnlace;
  plantillas: RegistroPlantillas;
  /** Contrafactual dirigido con el simulador de este ensamblado como respaldo (explicacion/NOTAS-CONTRATO.md §1). */
  contrafactual: ContrafactualDirigido;
}

/** Todo junto, en el mismo hilo (Node y pruebas). La interfaz usa puente.ts, que corre las noches en Workers. */
export function ensamblar(cm: CrearMotor = crearMotor): Ensamblado {
  const sim = ensamblarSimulador(cm);
  const mod = ensamblarModelo();
  return {
    versionMotor: VERSION_MOTOR,
    crearMotor: cm,
    ...sim,
    ...mod,
    plantillas: PLANTILLAS,
    contrafactual: crearContrafactual(sim.simularNoche),
  };
}
