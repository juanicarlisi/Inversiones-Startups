// contratos/hub.ts · CONGELADO. Lo que exporta el paquete del hub para los demás.
import type { Modelo, OpParche } from './modelo.ts';
import type { GeometriaHub } from './geometria.ts';
import type { Simulador } from './experimentos.ts';

/** Una noche del hub (fidelidad F3, mecanismo). */
export type SimularNoche = Simulador;
export type GeometriaDe = (m: Modelo) => GeometriaHub;
/** Escenario «balancear el plan»: asignación de personas de rampa por volumen esperado (corte-1.md §6.7, regla 7). */
export type PlanBalanceado = (m: Modelo) => OpParche[];
/** Plantillas publicadas e inmutables, por 'id@versión' (p. ej. 'hub-lazo-noche@1.0.0', 'hub-chico@1.0.0'). */
export type RegistroPlantillas = Readonly<Record<string, Modelo>>;
