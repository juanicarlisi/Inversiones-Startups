// nucleo/traza/escritor.ts · Escritor de traza en columnas (contratos/traza.ts).
//
// Columnas de arreglos tipados que crecen duplicando; terminar() cierra los tramos abiertos en `fin` y recorta cada columna a su
// largo exacto (copia nueva, sin capacidad sobrante: se transfiere entre hilos). Con nivel 'no' o 'kpi' no reserva memoria: todas
// las llamadas son gratis y abrir/tramo devuelven −1, igual que la referencia de contratos/.
// El resultado de terminar() es idéntico al del escritor de referencia para la misma secuencia de llamadas (prueba escritor.test.ts).
import type { Ms } from '../../contratos/tipos-base.ts';
import type { Causa, EscritorTraza, NivelTraza, TipoMomento, TipoTramo, Traza } from '../../contratos/traza.ts';

/** El escritor del núcleo, con su capacidad reservada a la vista (informativo, para las pruebas de memoria). */
export interface EscritorTrazaNucleo extends EscritorTraza {
  readonly capacidadTramos: number;
  readonly capacidadMomentos: number;
  readonly capacidadPaquetes: number;
}

const CAP_TRAMOS = 4096, CAP_MOMENTOS = 256, CAP_PAQUETES = 1024;

/**
 * Tope duro de tramos de una traza (hallazgo SEG-R3 de la revisión del 30-10-2026). El compilador ya rechaza los modelos cuya película
 * estima más de 2.000.000 de tramos (modelo/presupuesto.ts), pero el escritor crecía duplicando sin límite: si una estimación se queda
 * corta, la noche falla con un error que lo dice en lugar de llevar la pestaña a más de 1 GB. La plantilla grande usa ~380.000.
 */
export const MAX_TRAMOS_TRAZA = 4_000_000;

// Copian la columna a una de capacidad c (los huecos nuevos quedan en 0, o en `relleno`).
function crecerF64(a: Float64Array, c: number, relleno = 0): Float64Array<ArrayBuffer> {
  const b = new Float64Array(c); b.set(a); if (relleno !== 0) b.fill(relleno, a.length); return b;
}
function crecerI32(a: Int32Array, c: number): Int32Array<ArrayBuffer> { const b = new Int32Array(c); b.set(a); return b; }
function crecerI16(a: Int16Array, c: number): Int16Array<ArrayBuffer> { const b = new Int16Array(c); b.set(a); return b; }
function crecerU8(a: Uint8Array, c: number): Uint8Array<ArrayBuffer> { const b = new Uint8Array(c); b.set(a); return b; }

export function crearEscritorTraza(nivel: NivelTraza): EscritorTrazaNucleo {
  if (nivel !== 'no' && nivel !== 'kpi' && nivel !== 'completa') {
    throw new RangeError(`crearEscritorTraza: se esperaba nivel 'no', 'kpi' o 'completa' y llegó ${String(nivel)}`);
  }
  const completa = nivel === 'completa';

  // ---- Tramos ----
  let nT = 0, capT = completa ? CAP_TRAMOS : 0;
  let e = new Int32Array(capT), k = new Uint8Array(capT), r = new Int32Array(capT), a = new Int32Array(capT);
  let t0 = new Float64Array(capT), t1 = new Float64Array(capT), c = new Uint8Array(capT), q = new Int32Array(capT);
  const crecerTramos = () => {
    if (capT >= MAX_TRAMOS_TRAZA) {
      throw new RangeError(`traza: la película pasó el tope de ${MAX_TRAMOS_TRAZA} tramos (presupuesto de la traza); el modelo pide más de lo que entra en la memoria de un teléfono`);
    }
    capT = Math.min(capT * 2, MAX_TRAMOS_TRAZA);
    e = crecerI32(e, capT); k = crecerU8(k, capT); r = crecerI32(r, capT); a = crecerI32(a, capT);
    t0 = crecerF64(t0, capT); t1 = crecerF64(t1, capT); c = crecerU8(c, capT); q = crecerI32(q, capT);
  };

  // ---- Momentos ----
  let nM = 0, capM = completa ? CAP_MOMENTOS : 0;
  let mt = new Float64Array(capM), mtipo = new Uint8Array(capM), mr = new Int32Array(capM), mv = new Float64Array(capM);
  const crecerMomentos = () => {
    capM *= 2;
    mt = crecerF64(mt, capM); mtipo = crecerU8(mtipo, capM); mr = crecerI32(mr, capM); mv = crecerF64(mv, capM);
  };

  // ---- Paquetes (indexados por id; un id sin paquete() queda como en la referencia: 0 y NaN) ----
  let nP = 0, capP = completa ? CAP_PAQUETES : 0;
  let pCamion = new Int32Array(capP), pIndice = new Int32Array(capP), pRuta = new Int16Array(capP), pClase = new Uint8Array(capP);
  let pCreado = new Float64Array(capP).fill(NaN), pListo = new Float64Array(capP).fill(NaN), pVueltas = new Uint8Array(capP);
  const asegurarPaquete = (id: number) => {
    if (!Number.isInteger(id) || id < 0) throw new RangeError(`traza: se esperaba un id de paquete entero ≥ 0 y llegó ${id}`);
    if (id < capP) return;
    let cap = capP;
    while (cap <= id) cap *= 2;
    pCamion = crecerI32(pCamion, cap); pIndice = crecerI32(pIndice, cap); pRuta = crecerI16(pRuta, cap); pClase = crecerU8(pClase, cap);
    pCreado = crecerF64(pCreado, cap, NaN); pListo = crecerF64(pListo, cap, NaN); pVueltas = crecerU8(pVueltas, cap);
    capP = cap;
  };

  const tramo = (ent: number, tipo: TipoTramo, rec: number, aux: number, desde: Ms, hasta: Ms, causa: Causa = 0 as Causa, causante = -1): number => {
    if (!completa) return -1;
    if (nT === capT) crecerTramos();
    const i = nT++;
    e[i] = ent; k[i] = tipo; r[i] = rec; a[i] = aux; t0[i] = desde; t1[i] = hasta; c[i] = causa; q[i] = causante;
    return i;
  };

  const escritor: EscritorTrazaNucleo = {
    nivel,
    get capacidadTramos() { return capT; },
    get capacidadMomentos() { return capM; },
    get capacidadPaquetes() { return capP; },
    abrir: (ent, tipo, rec, aux, desde, causa, causante) => tramo(ent, tipo, rec, aux, desde, Infinity, causa, causante),
    cerrar: (i, hasta, aux) => {
      if (i < 0 || !completa) return;
      if (!(i < nT) || !Number.isInteger(i)) throw new RangeError(`traza.cerrar: el tramo ${i} no existe (hay ${nT})`);
      t1[i] = hasta;
      if (aux !== undefined) a[i] = aux;
    },
    tramo,
    momento: (t: Ms, tipo: TipoMomento, rec: number, valor: number) => {
      if (!completa) return;
      if (nM === capM) crecerMomentos();
      const i = nM++;
      mt[i] = t; mtipo[i] = tipo; mr[i] = rec; mv[i] = valor;
    },
    paquete: (id, camion, indice, ruta, clase, creado) => {
      if (!completa) return;
      asegurarPaquete(id);
      pCamion[id] = camion; pIndice[id] = indice; pRuta[id] = ruta; pClase[id] = clase; pCreado[id] = creado;
      pListo[id] = -1; pVueltas[id] = 0;
      if (id >= nP) nP = id + 1;
    },
    paqueteListo: (id, listo, vueltas) => {
      if (!completa) return;
      asegurarPaquete(id);
      pListo[id] = listo; pVueltas[id] = vueltas;
    },
    terminar: (datos): Traza => {
      const fin = datos.fin;
      for (let i = 0; i < nT; i++) if (t1[i] === Infinity) t1[i] = fin;
      return {
        ...datos,
        version: 1,
        tramos: {
          n: nT, e: e.slice(0, nT), k: k.slice(0, nT), r: r.slice(0, nT), a: a.slice(0, nT),
          t0: t0.slice(0, nT), t1: t1.slice(0, nT), c: c.slice(0, nT), q: q.slice(0, nT),
        },
        momentos: { n: nM, t: mt.slice(0, nM), tipo: mtipo.slice(0, nM), r: mr.slice(0, nM), v: mv.slice(0, nM) },
        paquetes: {
          n: nP, camion: pCamion.slice(0, nP), indice: pIndice.slice(0, nP), ruta: pRuta.slice(0, nP), clase: pClase.slice(0, nP),
          creado: pCreado.slice(0, nP), listo: pListo.slice(0, nP), vueltas: pVueltas.slice(0, nP),
        },
      };
    },
  };
  return escritor;
}
