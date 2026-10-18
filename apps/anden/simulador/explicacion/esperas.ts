// explicacion/esperas.ts · Andén simulador, corte 1, P7 · Esperas con taxonomía cerrada (corte-1.md §9, P7, «Esperas»).
//
// Recorre los tramos de una entidad en orden y devuelve sus esperas, cada una con UNA causa de la taxonomía cerrada de
// contratos/traza.ts (`Causa`). No hay causas libres: lo que no entra en una regla de acá no se clasifica.
//
//   paquete  ACUMULACION                      → FILA
//            ESPERA_BANDEJA                   → FALTA_BANDEJA (FALLA si más de la mitad coincide con el lazo detenido)
//            BANDEJA con a > 0                → RAMPA_LLENA (causante: la rampa)
//            RAMPA                            → según lo que hacía la persona asignada (q) en ese lapso:
//                                               PAUSA, AUSENCIA o CIERRE_JAULA (la de más solape) y, si ninguna, PERSONA_OCUPADA
//            COLA_MANUAL                      → su propia causa (NO_LEIDO, RAMPA_LLENA o NO_TRANSPORTABLE)
//            DESCARGA con causa BLOQUEO       → BLOQUEO
//   camión   CAMION_PLAYA con ANDEN_OCUPADO   → ANDEN_OCUPADO
//   persona  pausa, ausencia y cierre de jaula (lo que la saca de su trabajo)
//   rampa    los lapsos en que estuvo llena (momentos RAMPA_LLENA → RAMPA_LIBERA)
//   lazo     LAZO_DETENIDO                    → FALLA
//   puesto   pausas y ausencias de las personas de ese puesto
//
// La evidencia son los índices de los tramos que sostienen la causa: el primero es siempre el tramo de la espera misma.
import { Causa, ClaseEntidad, TipoMomento, TipoTramo, claseDeRef, idDeRef, refDe } from '../contratos/traza.ts';
import type { Traza } from '../contratos/traza.ts';
import type { Espera, EsperasDe } from '../contratos/explicacion.ts';
import { actividadDePersona, finDeTramo, solapeDetenido, tramosDe, tramosDetenidos, vueltasPorRampa } from './consulta.ts';

/** Causas que el explicador puede afirmar (las que tienen un cambio fijo para el contrafactual). El resto se describe, no se afirma. */
export const CAUSAS_AFIRMABLES: readonly Causa[] = [
  Causa.PAUSA, Causa.AUSENCIA, Causa.RAMPA_LLENA, Causa.FALLA, Causa.FILA, Causa.BLOQUEO, Causa.NO_LEIDO, Causa.CIERRE_JAULA,
];

/** Los valores válidos de la taxonomía (para controlar que ninguna espera se salga de ella). */
export const CAUSAS_DE_LA_TAXONOMIA: readonly number[] = Object.values(Causa);

function espera(t: Traza, i: number, causa: Causa, causante: number, extra: number[] = []): Espera {
  return {
    desde: t.tramos.t0[i], hasta: finDeTramo(t, i), donde: t.tramos.k[i] as Espera['donde'], recurso: t.tramos.r[i],
    causa, causante, evidencia: [i, ...extra],
  };
}

/** La causa de una espera en rampa según lo que hacía la persona asignada mientras tanto. */
function causaDeRampa(t: Traza, i: number): { causa: Causa; causante: number; extra: number[] } {
  const q = t.tramos.q[i];
  if (q < 0 || claseDeRef(q) !== ClaseEntidad.PERSONA) return { causa: Causa.PERSONA_OCUPADA, causante: -1, extra: [] };
  const act = actividadDePersona(t, idDeRef(q), t.tramos.t0[i], finDeTramo(t, i));
  // gana la de más solape; si empatan, pausa antes que ausencia y ausencia antes que cierre de jaula
  let causa: Causa = Causa.PERSONA_OCUPADA, mejor = 0, extra: number[] = [];
  if (act.pausa > mejor) { mejor = act.pausa; causa = Causa.PAUSA; extra = act.tramosPausa; }
  if (act.ausente > mejor) { mejor = act.ausente; causa = Causa.AUSENCIA; extra = act.tramosAusente; }
  if (act.cierre > mejor) { mejor = act.cierre; causa = Causa.CIERRE_JAULA; extra = act.tramosCierre; }
  return { causa, causante: q, extra };
}

function esperasDePaquete(t: Traza, id: number): Espera[] {
  const salida: Espera[] = [];
  const { k, t0, a, c, q } = t.tramos;
  let rampaDeLaUltimaVuelta = -1;     // causante de la última vuelta extra: sirve a la cola manual por vueltas máximas
  for (const i of tramosDe(t, 'paquete', id)) {
    const fin = finDeTramo(t, i);
    const largo = fin - t0[i];
    switch (k[i]) {
      case TipoTramo.ACUMULACION:
        if (largo > 0) salida.push(espera(t, i, Causa.FILA, -1));
        break;
      case TipoTramo.ESPERA_BANDEJA: {
        if (!(largo > 0)) break;
        const det = solapeDetenido(t, t0[i], fin);
        if (det.ms * 2 > largo) salida.push(espera(t, i, Causa.FALLA, refDe(ClaseEntidad.EQUIPO, 0), det.tramos));
        else salida.push(espera(t, i, Causa.FALTA_BANDEJA, -1));
        break;
      }
      case TipoTramo.BANDEJA:
        if (a[i] > 0) {
          const causante = q[i] >= 0 && claseDeRef(q[i]) === ClaseEntidad.RAMPA ? q[i] : -1;
          rampaDeLaUltimaVuelta = causante;
          if (largo > 0) salida.push(espera(t, i, Causa.RAMPA_LLENA, causante));
        }
        break;
      case TipoTramo.RAMPA:
        if (largo > 0) {
          const r = causaDeRampa(t, i);
          salida.push(espera(t, i, r.causa, r.causante, r.extra));
        }
        break;
      case TipoTramo.COLA_MANUAL:
        if (largo > 0 && (c[i] === Causa.NO_LEIDO || c[i] === Causa.RAMPA_LLENA || c[i] === Causa.NO_TRANSPORTABLE)) {
          const propio = q[i] >= 0 && claseDeRef(q[i]) === ClaseEntidad.RAMPA ? q[i] : -1;
          const causante = c[i] === Causa.RAMPA_LLENA ? (propio >= 0 ? propio : rampaDeLaUltimaVuelta) : -1;
          salida.push(espera(t, i, c[i] as Causa, causante));
        }
        break;
      case TipoTramo.DESCARGA:
        if (largo > 0 && c[i] === Causa.BLOQUEO) salida.push(espera(t, i, Causa.BLOQUEO, q[i]));
        break;
      default:
        break;
    }
  }
  return salida;
}

function esperasDeCamion(t: Traza, id: number): Espera[] {
  const salida: Espera[] = [];
  const { k, t0, c, q } = t.tramos;
  for (const i of tramosDe(t, 'camion', id)) {
    if (k[i] === TipoTramo.CAMION_PLAYA && c[i] === Causa.ANDEN_OCUPADO && finDeTramo(t, i) > t0[i]) {
      salida.push(espera(t, i, Causa.ANDEN_OCUPADO, q[i]));
    }
  }
  return salida;
}

const CAUSA_DE_PERSONA: Partial<Record<number, Causa>> = {
  [TipoTramo.PERSONA_PAUSA]: Causa.PAUSA,
  [TipoTramo.PERSONA_AUSENTE]: Causa.AUSENCIA,
  [TipoTramo.PERSONA_CIERRA_JAULA]: Causa.CIERRE_JAULA,
};
function esperasDePersona(t: Traza, id: number): Espera[] {
  const salida: Espera[] = [];
  for (const i of tramosDe(t, 'persona', id)) {
    const causa = CAUSA_DE_PERSONA[t.tramos.k[i]];
    if (causa !== undefined && finDeTramo(t, i) > t.tramos.t0[i]) salida.push(espera(t, i, causa, refDe(ClaseEntidad.PERSONA, id)));
  }
  return salida;
}

/** Lapsos en que una rampa estuvo llena, de los momentos RAMPA_LLENA y RAMPA_LIBERA; la evidencia son las vueltas que causó. */
function esperasDeRampa(t: Traza, id: number): Espera[] {
  const salida: Espera[] = [];
  const m = t.momentos;
  let desde = -1;
  const vueltas = vueltasPorRampa(t).get(id) ?? [];
  const cerrar = (hasta: number) => {
    const prueba: number[] = [];
    for (const i of vueltas) {
      if (t.tramos.t0[i] >= hasta) continue;
      if (finDeTramo(t, i) > desde && prueba.length < 8) prueba.push(i);
    }
    salida.push({
      desde, hasta, donde: TipoTramo.RAMPA, recurso: id, causa: Causa.RAMPA_LLENA, causante: refDe(ClaseEntidad.RAMPA, id), evidencia: prueba,
    });
  };
  for (let j = 0; j < m.n; j++) {
    if (m.r[j] !== id) continue;
    if (m.tipo[j] === TipoMomento.RAMPA_LLENA && desde < 0) desde = m.t[j];
    else if (m.tipo[j] === TipoMomento.RAMPA_LIBERA && desde >= 0) { if (m.t[j] > desde) cerrar(m.t[j]); desde = -1; }
  }
  if (desde >= 0 && t.fin > desde) cerrar(t.fin);
  return salida;
}

function esperasDelLazo(t: Traza): Espera[] {
  const salida: Espera[] = [];
  for (const i of tramosDetenidos(t)) {
    if (finDeTramo(t, i) > t.tramos.t0[i]) salida.push(espera(t, i, Causa.FALLA, refDe(ClaseEntidad.EQUIPO, 0)));
  }
  return salida;
}

/** Pausas y ausencias de las personas de inducción asignadas a ese puesto (la columna r de esos tramos es el puesto). */
function esperasDePuesto(t: Traza, id: number): Espera[] {
  const salida: Espera[] = [];
  const { n, k, e, r } = t.tramos;
  for (let i = 0; i < n; i++) {
    if (r[i] !== id || (k[i] !== TipoTramo.PERSONA_PAUSA && k[i] !== TipoTramo.PERSONA_AUSENTE)) continue;
    const persona = t.catalogo.personas[e[i]];
    if (!persona || (persona.rol !== 'induccion' && persona.rol !== 'reten')) continue;
    if (finDeTramo(t, i) > t.tramos.t0[i]) salida.push(espera(t, i, CAUSA_DE_PERSONA[k[i]] as Causa, refDe(ClaseEntidad.PERSONA, e[i])));
  }
  salida.sort((x, y) => x.desde - y.desde || x.evidencia[0] - y.evidencia[0]);
  return salida;
}

/**
 * Esperas de una entidad, ordenadas por inicio. Una espera tiene siempre una causa de la taxonomía; las que no entran en una regla
 * no se devuelven. Para un paquete que no existe devuelve [].
 */
export const esperasDe: EsperasDe = (t, clase, id) => {
  switch (clase) {
    case ClaseEntidad.PAQUETE: return esperasDePaquete(t, id);
    case ClaseEntidad.CAMION: return esperasDeCamion(t, id);
    case ClaseEntidad.PERSONA: return esperasDePersona(t, id);
    case ClaseEntidad.RAMPA: return esperasDeRampa(t, id);
    case ClaseEntidad.EQUIPO: return esperasDelLazo(t);
    case ClaseEntidad.PUESTO: return esperasDePuesto(t, id);
    default: return [];
  }
};
