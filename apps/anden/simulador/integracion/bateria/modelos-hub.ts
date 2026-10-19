// integracion/bateria/modelos-hub.ts · Andén simulador, corte 1 · Integración (corte-1.md §8 y §10.6).
// Los modelos de prueba del hub para las exigibles de P4 en la batería (K02, K03, L01–L07, R05, R06), armados desde la plantilla chica
// con lo mínimo cambiado para aislar un mecanismo. Son los mismos que usa P4 en hub/pruebas/modelos.ts (la integración no puede importar
// pruebas de otro paquete: la prueba de arquitectura lo prohíbe), escritos acá otra vez sin la referencia: la batería los corre con el
// motor que se le pase (el núcleo de producción en `npm run verificar`). Ninguno es una plantilla publicada.
import type { CrearMotor } from '../../contratos/motor.ts';
import type { Distribucion } from '../../contratos/azar.ts';
import type { Modelo, ModeloValidado } from '../../contratos/modelo.ts';
import type { NivelTraza, Traza } from '../../contratos/traza.ts';
import type { ResultadoReplica } from '../../contratos/resultados.ts';
import { validadoSinChequeos } from '../../contratos/referencias.ts';
import { armarNoche, opcionesNoche, PLANTILLAS, type Fidelidad, type NocheArmada } from '../../hub/indice.ts';

export const fija = (valor: number): Distribucion => ({ tipo: 'fija', valor });

/** Copia de la plantilla publicada hub-chico@1.0.0 (el ejemplo de §5), para modificarla sin tocar el registro. */
export function chico(): Modelo {
  return structuredClone(PLANTILLAS['hub-chico@1.0.0']) as Modelo;
}

/**
 * Los modelos de la batería no pasan por el compilador: varios rompen a propósito sus chequeos (ningún puesto activo, rampas de
 * capacidad 0 o enormes) para aislar un mecanismo. Es lo mismo que hace P4 en sus pruebas (contratos/referencias.ts, «solo pruebas»).
 */
export function validado(m: Modelo): ModeloValidado {
  return validadoSinChequeos(m);
}

export interface NocheHub { hub: NocheArmada['hub']; resultado: ResultadoReplica; traza?: Traza }

/** Una noche con acceso al hub (para mirar el estado final además del resultado), con el motor que se pase. */
export function noche(cm: CrearMotor, m: Modelo | ModeloValidado, semilla: number, replica = 0, traza: NivelTraza = 'no',
  fidelidad: Fidelidad = 'F3'): NocheHub {
  const mv = 'modelo' in m && 'huella' in m ? m as ModeloValidado : validado(m as Modelo);
  const motor = cm(opcionesNoche(mv, semilla, replica, traza));
  const n = armarNoche(motor, mv, fidelidad);
  const s = n.cerrar(motor.correr());
  return { hub: n.hub, resultado: s.resultado, traza: s.traza };
}

/** Sin azar en lo que no se prueba: sin desvío, sin error de pronóstico, sin atraso común, sin faltas, sin paradas, sin pausas. */
export function sinRuido(m: Modelo): Modelo {
  m.demanda.desvio = fija(0);
  m.demanda.errorPronostico = { cv: 0 };
  m.demanda.atrasoComun = { probabilidad: 0, demora: fija(0) };
  m.demanda.papeleo = 0;
  m.personas.induccion.ausentismo = 0;
  m.personas.rampa.ausentismo = 0;
  m.personas.induccion.pausas = { ...m.personas.induccion.pausas, primera: 1e6 };
  m.personas.rampa.pausas = { ...m.personas.rampa.pausas, primera: 1e6 };
  m.hub.sorter.paradas = { ...m.hub.sorter.paradas, activas: false };
  return m;
}

/** Rampas sin tope (capacidad enorme). */
export function rampasSinTope(m: Modelo): Modelo {
  for (const r of m.hub.rampas) r.capacidad = 1_000_000;
  return m;
}

/** Todos los paquetes de una bandeja y transportables (o con una fracción `fDos` de dos bandejas). */
export function perfilSimple(m: Modelo, fDos = 0): Modelo {
  m.hub.perfilPaquete = {
    clases: fDos > 0
      ? [{ id: 'chico', fraccion: 1 - fDos, bandejas: 1, transportable: true }, { id: 'grande', fraccion: fDos, bandejas: 2, transportable: true }]
      : [{ id: 'chico', fraccion: 1, bandejas: 1, transportable: true }],
  };
  return m;
}

/**
 * L01–L03: lazo saturado. Un solo puesto activo (I1) con tiempo 0, descarga instantánea (las tres cintas llevan 18.000/h, más que el
 * lazo), acumulación siempre con paquetes, rampas sin tope, sin NO-READ salvo que se pida, sin paradas.
 */
export function lazoSaturado(pNoLeido = 0, fDos = 0): Modelo {
  const m = rampasSinTope(perfilSimple(sinRuido(chico()), fDos));
  m.demanda.camiones = { serie: true, cantidad: 6, primero: '22:00', cada: 900, paquetes: 4000 };
  m.personas.descarga = { ritmo: fija(0) };
  m.hub.induccion.tiempo = fija(0);
  m.personas.induccion.puestosActivos = 1;
  m.hub.sorter.lector = { ...m.hub.sorter.lector, noLeido: pNoLeido };
  return m;
}

/** K02: una sola cinta de 42 m a 2 m/s con paso 0,6 m, descarga instantánea y una acumulación que nunca se llena. */
export function cintaSola(): Modelo {
  const m = sinRuido(chico());
  m.demanda.camiones = { serie: true, cantidad: 1, primero: '22:00', cada: 900, paquetes: 15000 };
  m.personas.descarga = { ritmo: fija(0) };
  m.hub.andenes = [{ id: 'A1', x: -14, y: -12, personas: 1 }];
  m.hub.cintas = [{ id: 'C1', desde: 'A1', velocidad: 2, paso: 0.6, puntos: [[-44, -10], [-2, -10]] }];
  m.hub.acumulacion = { ...m.hub.acumulacion, largo: 60000, paso: 0.6 };
  m.personas.induccion.puestosActivos = 0;
  return m;
}

/** K03: acumulación de 42 m con paso 0,6 m (70 lugares) y ningún puesto activo: los andenes paran por contrapresión. */
export function acumulacionSinInduccion(): Modelo {
  const m = perfilSimple(sinRuido(chico()));
  m.hub.acumulacion = { ...m.hub.acumulacion, largo: 42, paso: 0.6 };
  m.personas.induccion.puestosActivos = 0;
  return m;
}

/** L07: 10 camiones de 400 paquetes (1.600 por hora) y 4 puestos: ρ = 1.600 ÷ (4 · 1.500 · 0,875) ≈ 0,30; rampas sin tope, sin paradas. */
export function modeloL07(): Modelo {
  const m = rampasSinTope(chico());
  m.demanda.camiones = { serie: true, cantidad: 10, primero: '22:00', cada: 900, paquetes: 400 };
  m.personas.induccion.puestosActivos = 4;
  m.hub.sorter.paradas = { ...m.hub.sorter.paradas, activas: false }; // F2 no tiene lazo que parar
  return m;
}
