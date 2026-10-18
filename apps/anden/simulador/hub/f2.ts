// hub/f2.ts · Andén simulador, corte 1 · P4 (el hub).
// Fidelidad F2 (corte-1.md §6.10): igual que F3 pero el lazo es una demora fija por paquete = (distancia en ranuras de la estación a
// la rampa) × tick, sin bandejas: no hay espera de bandeja ni vueltas (las rampas no tienen tope) ni micro-paradas. El bloque del
// lazo F2 está en bloques/lazo-f2.ts; todo lo demás (camiones, andenes, acumulación, inducción, rampas, personas, excepción) es el
// mismo código que F3. Sirve para la consistencia L07 y para el dominio de validez: «F2 reproduce a F3 con ρ de inducción ≤ 0,5 y
// sin rampas llenas».
import type { CrearMotor } from '../contratos/motor.ts';
import type { SimularNoche } from '../contratos/hub.ts';
import { crearSimularNocheCon } from './simular.ts';

/** Dominio en el que F2 reproduce a F3 (lo verifica L07 en hub/pruebas/consistencia-f2.test.ts). */
export const DOMINIO_F2 = { rhoInduccionMax: 0.5, rampasLlenas: false } as const;

export function crearSimularNocheF2(crearMotor: CrearMotor): SimularNoche {
  return crearSimularNocheCon(crearMotor, 'F2');
}
