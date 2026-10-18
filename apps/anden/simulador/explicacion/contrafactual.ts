// explicacion/contrafactual.ts · Andén simulador, corte 1, P7 · Contrafactual dirigido a un paquete (corte-1.md §9, P7, «Causas»).
//
// «¿Este paquete habría llegado al corte sin esa pausa?» se contesta repitiendo LA MISMA noche (misma semilla y misma réplica, con el
// cambio de la causa) y buscando el mismo paquete por su clave estable (camión, índice). Con el azar por dirección semántica, un cambio
// que no toca la demanda deja intactos los atributos de todos los paquetes: la única diferencia es el cambio.
// Confirma si ahora llega antes del corte; o, si ya llegaba antes, si llega al menos 5 minutos antes.
//
// Las noches se recuerdan (por simulador, modelo, semilla, réplica y parche): cincuenta paquetes de la misma noche comparten la noche
// base y la variante, y no hay que simularlas cincuenta veces. Una noche es una función pura de sus entradas, así que recordarla es seguro;
// un fallo no se recuerda.
import { ClaseEntidad } from '../contratos/traza.ts';
import type { Contrafactual, ContrafactualDirigido } from '../contratos/explicacion.ts';
import type { SalidaSimulacion, Simulador } from '../contratos/experimentos.ts';
import type { ModeloValidado } from '../contratos/modelo.ts';
import type { Ms } from '../contratos/tipos-base.ts';

/** Un paquete que ya llegaba antes del corte «mejora» si ahora llega al menos esto antes (5 minutos). */
export const MARGEN_DE_ADELANTO_MS: Ms = 5 * 60 * 1000;
const TOPE_DE_NOCHES_RECORDADAS = 64;

/** Lo único que el contrafactual necesita de una noche: el corte y cuándo quedó listo cada paquete. */
interface NocheCompacta { corte: Ms; n: number; camion: Int32Array; indice: Int32Array; listo: Float64Array }

const RECUERDO = new WeakMap<Simulador, WeakMap<ModeloValidado, Map<string, Promise<NocheCompacta>>>>();

function recordar(sim: Simulador, mv: ModeloValidado, clave: string, crear: () => Promise<NocheCompacta>): Promise<NocheCompacta> {
  let porModelo = RECUERDO.get(sim);
  if (!porModelo) { porModelo = new WeakMap(); RECUERDO.set(sim, porModelo); }
  let noches = porModelo.get(mv);
  if (!noches) { noches = new Map(); porModelo.set(mv, noches); }
  const hecha = noches.get(clave);
  if (hecha) return hecha;
  const p = crear();
  noches.set(clave, p);
  p.catch(() => { if (noches.get(clave) === p) noches.delete(clave); });
  if (noches.size > TOPE_DE_NOCHES_RECORDADAS) {
    const masVieja = noches.keys().next().value;
    if (masVieja !== undefined) noches.delete(masVieja);
  }
  return p;
}

async function simularCompacta(sim: Simulador, mv: ModeloValidado, semilla: number, replica: number): Promise<NocheCompacta> {
  const salida: SalidaSimulacion = await Promise.resolve(sim(mv, semilla, replica, { traza: 'completa' }));
  const t = salida?.traza;
  if (!t) {
    throw new Error(`contrafactual: se pidió una noche con traza «completa» (semilla ${semilla}, réplica ${replica}) y el simulador no devolvió traza`);
  }
  return { corte: t.corte, n: t.paquetes.n, camion: t.paquetes.camion, indice: t.paquetes.indice, listo: t.paquetes.listo };
}

function buscar(noche: NocheCompacta, camion: number, indice: number): { existe: boolean; listo: Ms | null } {
  for (let i = 0; i < noche.n; i++) {
    if (noche.camion[i] === camion && noche.indice[i] === indice) {
      const l = noche.listo[i];
      return { existe: true, listo: l >= 0 ? l : null };
    }
  }
  return { existe: false, listo: null };
}

function estado(noche: NocheCompacta, listo: Ms | null): { listo: Ms | null; antesDelCorte: boolean } {
  return { listo, antesDelCorte: listo !== null && listo <= noche.corte };
}

/**
 * Crea el contrafactual dirigido. `simPorDefecto` es el simulador que se usa si quien llama no pasa uno propio: la firma del contrato
 * (`ContrafactualDirigido`) ya trae el simulador como primer argumento, así que el de la fábrica es opcional (NOTAS-CONTRATO §1).
 */
export function crearContrafactual(simPorDefecto?: Simulador): ContrafactualDirigido {
  return async (sim, mv, semilla, replica, camion, indice, cambio, variante) => {
    const simulador = sim ?? simPorDefecto;
    if (typeof simulador !== 'function') throw new Error('contrafactual: se esperaba un simulador (Simulador) y no llegó ninguno');
    if (typeof variante !== 'function') throw new Error('contrafactual: se esperaba la función `variante` que aplica el parche al modelo y no llegó');
    if (!cambio || !Array.isArray(cambio.parche)) throw new Error('contrafactual: se esperaba un cambio con su parche (lista de operaciones) y llegó otra cosa');
    for (const [nombre, valor] of [['semilla', semilla], ['réplica', replica], ['camión', camion], ['índice', indice]] as const) {
      if (!Number.isInteger(valor) || valor < 0) throw new Error(`contrafactual: se esperaba ${nombre} entero y no negativo y llegó ${String(valor)}`);
    }

    const base = await recordar(simulador, mv, `${semilla}:${replica}`, () => simularCompacta(simulador, mv, semilla, replica));
    const antesBusqueda = buscar(base, camion, indice);
    if (!antesBusqueda.existe) {
      throw new Error(`contrafactual: el paquete (camión ${camion}, índice ${indice}) no existe en la noche base (semilla ${semilla}, réplica ${replica}); se esperaba uno de los ${base.n} paquetes de esa noche`);
    }
    const variada = await recordar(simulador, mv, `${semilla}:${replica}:${JSON.stringify(cambio.parche)}`, async () => {
      const mvVariante = await variante(mv, cambio.parche);
      return simularCompacta(simulador, mvVariante, semilla, replica);
    });
    const despuesBusqueda = buscar(variada, camion, indice);

    const antes = estado(base, antesBusqueda.listo);
    const despues = estado(variada, despuesBusqueda.listo);
    const confirma = !antes.antesDelCorte
      ? despues.antesDelCorte
      : antes.listo !== null && despues.listo !== null && antes.listo - despues.listo >= MARGEN_DE_ADELANTO_MS;
    return { clase: ClaseEntidad.PAQUETE, camion, indice, cambio, semilla, replica, antes, despues, confirma } satisfies Contrafactual;
  };
}
