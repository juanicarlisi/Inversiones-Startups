// integracion/ensamblar-bateria.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.1). SOLO NODE.
// La batería «Andén Verificado» sobre el motor de producción. Va aparte de ensamblar.ts porque verificacion/bateria.ts usa node:fs y el
// paquete del navegador no lo puede llevar.
//
// También sirve de módulo de motor para la línea de comandos de la batería (exporta `crearMotor`, que es lo que busca `--motor=`):
//   node verificacion/bateria.ts --completa --motor=integracion/ensamblar-bateria.ts
import type { CrearMotor } from '../contratos/motor.ts';
import { crearBateria, type Bateria } from '../verificacion/bateria.ts';
import type { Caso } from '../verificacion/casos/comun.ts';
import { crearMotorProduccion } from './ensamblar.ts';

/** El motor que usa la batería cuando se la llama con `--motor=integracion/ensamblar-bateria.ts`. */
export const crearMotor: CrearMotor = crearMotorProduccion;

/** La batería con el motor de producción (o el que se pase, para comparar con la referencia). */
export function ensamblarBateria(cm: CrearMotor = crearMotorProduccion, casosExtra: Caso[] = []): Bateria {
  return crearBateria(cm, { casosExtra });
}
