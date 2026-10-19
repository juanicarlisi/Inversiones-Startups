// explicacion/biografia.ts · Andén simulador, corte 1, P7 · La biografía de un paquete, un camión, una persona, una rampa, el lazo o un puesto.
// Es síncrona y no simula: cuenta lo que la traza ya sabe, paso por paso, con cada cifra atada a un tramo (Afirmacion de fuente 'traza').
// Describe esperas con su tipo de la taxonomía («su persona estaba en pausa»), pero NUNCA dice «por culpa de»: la causa confirmada la
// agrega CausasConfirmadas después de correr el contrafactual. Por eso `Biografia.causas` sale siempre vacío.
import { Causa, ClaseEntidad, TipoTramo, claseDeRef, idDeRef } from '../contratos/traza.ts';
import type { Traza } from '../contratos/traza.ts';
import type { ArmarBiografia, Biografia, Espera, Frase, PasoBiografia } from '../contratos/explicacion.ts';
import type { Modelo } from '../contratos/modelo.ts';
import { finDeTramo, tiempoEnHub, tramosDe } from './consulta.ts';
import { esperasDe } from './esperas.ts';
import { afirmarHora, afirmarMinutos, afirmarTramo, crearFrase, horaDe, nombreDe } from './frases.ts';
import { redondear } from './unidades.ts';

/** Una espera de menos de esto (3 s) no es un paso que cuente en la biografía. */
export const ESPERA_MINIMA_MS = 3000;
/** Dos tramos de trabajo de una persona separados por menos de esto (1 min) son el mismo bloque de trabajo. */
const HUECO_DE_TRABAJO_MS = 60000;

function paso(t: Traza, i: number, frase: Frase, espera: Espera | null, hasta?: number): PasoBiografia {
  return { desde: t.tramos.t0[i], hasta: hasta ?? finDeTramo(t, i), frase, espera };
}

function esperasPorTramo(esperas: Espera[]): Map<number, Espera> {
  const m = new Map<number, Espera>();
  for (const e of esperas) if (!m.has(e.evidencia[0])) m.set(e.evidencia[0], e);
  return m;
}

// ---------------------------------------------------------------------------------------------------------------- paquete

/** Percentil (0–100) del tiempo en el hub de este paquete entre los de su noche: 100 · (cuántos tardaron menos) ÷ (cuántos hay). */
function percentilDe(t: Traza, id: number): number | null {
  let total = 0, menores = 0;
  const mio = tiempoEnHub(t, id);
  for (let j = 0; j < t.paquetes.n; j++) {
    if (t.paquetes.creado[j] < 0) continue;
    total++;
    if (tiempoEnHub(t, j) < mio) menores++;
  }
  return total === 0 ? null : redondear((100 * menores) / total, 1);
}

function pasoDePaquete(t: Traza, i: number, esp: Espera | null): PasoBiografia | null {
  const { k, r, a, c, q } = t.tramos;
  const t0 = t.tramos.t0[i], t1 = finDeTramo(t, i), dur = t1 - t0;
  const cat = t.catalogo;
  const esEspera = k[i] === TipoTramo.ACUMULACION || k[i] === TipoTramo.ESPERA_BANDEJA || k[i] === TipoTramo.RAMPA || k[i] === TipoTramo.COLA_MANUAL;
  if (esEspera && dur < ESPERA_MINIMA_MS) return null;
  switch (k[i]) {
    case TipoTramo.DESCARGA: {
      const anden = nombreDe(cat.andenes, r[i], 'A');
      // «tardó 0 min porque se frenó» no explica nada: el freno se cuenta solo si se ve al redondear (≥ 0,1 min)
      const min = c[i] === Causa.BLOQUEO && dur > 0 ? afirmarMinutos(t, i) : null;
      if (min && min.valor > 0) {
        return paso(t, i, crearFrase('explicacion.paso.descarga.bloqueo', { anden, min: min.valor }, [min]), esp);
      }
      const hora = afirmarHora(t, i, 't0');
      return paso(t, i, crearFrase('explicacion.paso.descarga', { camion: nombreDe(cat.camiones, a[i], 'T'), anden, hora: horaDe(t0) }, [hora]), esp);
    }
    case TipoTramo.CINTA:
      return paso(t, i, crearFrase('explicacion.paso.cinta', { cinta: nombreDe(t.geometria.cintas, r[i], 'C') }, []), null);
    case TipoTramo.ACUMULACION: {
      const min = afirmarMinutos(t, i);
      return paso(t, i, crearFrase('explicacion.paso.acumulacion', { min: min.valor }, [min]), esp);
    }
    case TipoTramo.INDUCCION:
      return paso(t, i, crearFrase('explicacion.paso.induccion', { persona: nombreDe(cat.personas, a[i], 'P'), puesto: nombreDe(cat.puestos, r[i], 'I') }, []), null);
    case TipoTramo.ESPERA_BANDEJA: {
      const min = afirmarMinutos(t, i);
      const clave = esp?.causa === Causa.FALLA ? 'explicacion.paso.espera_bandeja.falla' : 'explicacion.paso.espera_bandeja';
      return paso(t, i, crearFrase(clave, { min: min.valor }, [min]), esp);
    }
    case TipoTramo.BANDEJA: {
      if (a[i] > 0) {
        const vuelta = afirmarTramo(t, i, 'a', 'vueltas', 0);
        if (q[i] >= 0 && claseDeRef(q[i]) === ClaseEntidad.RAMPA) {
          return paso(t, i, crearFrase('explicacion.paso.vuelta', { vuelta: vuelta.valor, rampa: nombreDe(cat.rampas, idDeRef(q[i]), 'R') }, [vuelta]), esp);
        }
        return paso(t, i, crearFrase('explicacion.paso.vuelta.sin_rampa', { vuelta: vuelta.valor }, [vuelta]), esp);
      }
      const min = afirmarMinutos(t, i);
      return paso(t, i, crearFrase('explicacion.paso.bandeja', { min: min.valor }, [min]), null);
    }
    case TipoTramo.RAMPA: {
      const min = afirmarMinutos(t, i);
      const rampa = nombreDe(cat.rampas, r[i], 'R');
      if (q[i] < 0 || claseDeRef(q[i]) !== ClaseEntidad.PERSONA) {
        return paso(t, i, crearFrase('explicacion.paso.rampa.sin_persona', { min: min.valor, rampa }, [min]), esp);
      }
      const persona = nombreDe(cat.personas, idDeRef(q[i]), 'P');
      const sufijo = esp?.causa === Causa.PAUSA ? 'pausa' : esp?.causa === Causa.AUSENCIA ? 'ausencia' : esp?.causa === Causa.CIERRE_JAULA ? 'cierre_jaula' : 'ocupada';
      return paso(t, i, crearFrase(`explicacion.paso.rampa.${sufijo}`, { min: min.valor, rampa, persona }, [min]), esp);
    }
    case TipoTramo.MANO:
      return paso(t, i, crearFrase('explicacion.paso.mano', { persona: nombreDe(cat.personas, r[i], 'P') }, []), null);
    case TipoTramo.JAULA: {
      const hora = afirmarHora(t, i, 't0');
      const clave = t0 <= t.corte ? 'explicacion.paso.jaula.antes_del_corte' : 'explicacion.paso.jaula.despues_del_corte';
      // el tramo de la jaula queda abierto hasta el final de la noche: el paso es el instante en que entra
      return paso(t, i, crearFrase(clave, { rampa: nombreDe(cat.rampas, r[i], 'R'), hora: horaDe(t0) }, [hora]), null, t0);
    }
    case TipoTramo.COLA_MANUAL: {
      const sufijo = c[i] === Causa.NO_LEIDO ? 'no_leido' : c[i] === Causa.RAMPA_LLENA ? 'rampa_llena' : c[i] === Causa.NO_TRANSPORTABLE ? 'no_transportable' : null;
      if (sufijo === null) return null;
      const min = afirmarMinutos(t, i);
      return paso(t, i, crearFrase(`explicacion.paso.cola_manual.${sufijo}`, { min: min.valor }, [min]), esp);
    }
    case TipoTramo.MANUAL: {
      const min = afirmarMinutos(t, i);
      return paso(t, i, crearFrase('explicacion.paso.manual', { persona: nombreDe(cat.personas, r[i], 'P'), min: min.valor }, [min]), null);
    }
    default:
      return null;
  }
}

function biografiaDePaquete(t: Traza, m: Modelo, id: number): Biografia {
  if (!Number.isInteger(id) || id < 0 || id >= t.paquetes.n) {
    throw new Error(`armarBiografia: el paquete ${id} no existe en la traza (se esperaba un número entre 0 y ${t.paquetes.n - 1})`);
  }
  const porTramo = esperasPorTramo(esperasDe(t, ClaseEntidad.PAQUETE, id));
  const pasos: PasoBiografia[] = [];
  for (const i of tramosDe(t, 'paquete', id)) {
    const p = pasoDePaquete(t, i, porTramo.get(i) ?? null);
    if (p) pasos.push(p);
  }
  if (t.paquetes.listo[id] < 0) {
    const ultimo = pasos.length > 0 ? pasos[pasos.length - 1].hasta : t.fin;
    pasos.push({ desde: Math.max(ultimo, t.fin), hasta: Math.max(ultimo, t.fin), frase: crearFrase('explicacion.paso.no_termino', {}, []), espera: null });
  }
  const clases = m?.hub?.perfilPaquete?.clases;
  const titulo = crearFrase('explicacion.titulo.paquete', {
    indice: String(t.paquetes.indice[id]),
    camion: nombreDe(t.catalogo.camiones, t.paquetes.camion[id], 'T'),
    ruta: nombreDe(t.catalogo.rutas, t.paquetes.ruta[id], 'Ruta '),
    tamano: clases?.[t.paquetes.clase[id]]?.id ?? String(t.paquetes.clase[id]),
  }, []);
  return { clase: ClaseEntidad.PAQUETE, id, titulo, pasos, percentil: percentilDe(t, id), causas: [] };
}

// ----------------------------------------------------------------------------------------------------------------- camión

function biografiaDeCamion(t: Traza, id: number): Biografia {
  const lista = tramosDe(t, 'camion', id);
  if (lista.length === 0) throw new Error(`armarBiografia: el camión ${id} no tiene tramos en la traza (se esperaba un camión de 0 a ${t.catalogo.camiones.length - 1})`);
  const porTramo = esperasPorTramo(esperasDe(t, ClaseEntidad.CAMION, id));
  const pasos: PasoBiografia[] = [];
  for (const i of lista) {
    const k = t.tramos.k[i];
    if (k === TipoTramo.CAMION_PLAYA) {
      const esp = porTramo.get(i);
      if (!esp) continue;
      const min = afirmarMinutos(t, i);
      pasos.push(paso(t, i, crearFrase('explicacion.paso.camion_espera', { min: min.valor }, [min]), esp));
    } else if (k === TipoTramo.CAMION_ANDEN) {
      const n = afirmarTramo(t, i, 'a', 'paquetes', 0);
      const d = afirmarHora(t, i, 't0'), h = afirmarHora(t, i, 't1');
      const anden = nombreDe(t.catalogo.andenes, t.tramos.r[i], 'A');
      pasos.push(paso(t, i, crearFrase('explicacion.paso.camion_anden',
        { paquetes: n.valor, anden, desde: horaDe(t.tramos.t0[i]), hasta: horaDe(finDeTramo(t, i)) }, [n, d, h]), null));
    }
  }
  const titulo = crearFrase('explicacion.titulo.camion', { camion: nombreDe(t.catalogo.camiones, id, 'T') }, []);
  return { clase: ClaseEntidad.CAMION, id, titulo, pasos, percentil: null, causas: [] };
}

// ---------------------------------------------------------------------------------------------------------------- persona

type CategoriaDePersona = 'activa' | 'pausa' | 'ausente' | 'libre';
function categoriaDe(k: number): CategoriaDePersona {
  if (k === TipoTramo.PERSONA_PAUSA) return 'pausa';
  if (k === TipoTramo.PERSONA_AUSENTE) return 'ausente';
  if (k === TipoTramo.PERSONA_LIBRE) return 'libre';
  return 'activa';   // trabaja, camina, cierra jaula
}

function biografiaDePersona(t: Traza, id: number): Biografia {
  const persona = t.catalogo.personas[id];
  if (!persona) throw new Error(`armarBiografia: la persona ${id} no existe en el catálogo (se esperaba un número entre 0 y ${t.catalogo.personas.length - 1})`);
  const porTramo = esperasPorTramo(esperasDe(t, ClaseEntidad.PERSONA, id));
  // tramos seguidos de trabajo (con menos de un minuto entre uno y otro) son un solo bloque
  const bloques: { cat: CategoriaDePersona; primero: number; ultimo: number }[] = [];
  for (const i of tramosDe(t, 'persona', id)) {
    const cat = categoriaDe(t.tramos.k[i]);
    const previo = bloques.length > 0 ? bloques[bloques.length - 1] : null;
    if (previo && cat === 'activa' && previo.cat === 'activa' && t.tramos.t0[i] - finDeTramo(t, previo.ultimo) <= HUECO_DE_TRABAJO_MS) previo.ultimo = i;
    else bloques.push({ cat, primero: i, ultimo: i });
  }
  const pasos: PasoBiografia[] = [];
  bloques.forEach((b, j) => {
    const previo = j > 0 ? bloques[j - 1] : null;
    if (previo && t.tramos.t0[b.primero] - finDeTramo(t, previo.ultimo) >= HUECO_DE_TRABAJO_MS) {
      const d = afirmarHora(t, previo.ultimo, 't1'), h = afirmarHora(t, b.primero, 't0');
      pasos.push({
        desde: finDeTramo(t, previo.ultimo), hasta: t.tramos.t0[b.primero], espera: null,
        frase: crearFrase('explicacion.paso.persona_libre', { desde: horaDe(finDeTramo(t, previo.ultimo)), hasta: horaDe(t.tramos.t0[b.primero]) }, [d, h]),
      });
    }
    const d = afirmarHora(t, b.primero, 't0'), h = afirmarHora(t, b.ultimo, 't1');
    const desdeTxt = horaDe(t.tramos.t0[b.primero]), hastaTxt = horaDe(finDeTramo(t, b.ultimo));
    let frase: Frase;
    if (b.cat === 'pausa') {
      const min = afirmarMinutos(t, b.primero);
      frase = crearFrase('explicacion.paso.persona_pausa', { min: min.valor, hora: desdeTxt }, [min, d]);
    } else if (b.cat === 'ausente') {
      frase = crearFrase('explicacion.paso.persona_ausente', {}, []);
    } else if (b.cat === 'libre') {
      frase = crearFrase('explicacion.paso.persona_libre', { desde: desdeTxt, hasta: hastaTxt }, [d, h]);
    } else {
      frase = crearFrase('explicacion.paso.persona_activa', { desde: desdeTxt, hasta: hastaTxt }, [d, h]);
    }
    pasos.push({ desde: t.tramos.t0[b.primero], hasta: finDeTramo(t, b.ultimo), frase, espera: porTramo.get(b.primero) ?? null });
  });
  const titulo = crearFrase(`explicacion.titulo.persona.${persona.rol}`, { persona: persona.id }, []);
  return { clase: ClaseEntidad.PERSONA, id, titulo, pasos, percentil: null, causas: [] };
}

// ------------------------------------------------------------------------------------------------------------------ rampa

/** Lapsos en que la rampa tuvo tantos paquetes como su capacidad, sacados de los propios tramos RAMPA (cada borde es el borde de un tramo). */
function lapsosLlena(t: Traza, id: number, capacidad: number): { entra: number; sale: number }[] {
  const { n, k, r, t0 } = t.tramos;
  const eventos: { t: number; delta: 1 | -1; tramo: number }[] = [];
  for (let i = 0; i < n; i++) {
    if (k[i] !== TipoTramo.RAMPA || r[i] !== id) continue;
    eventos.push({ t: t0[i], delta: 1, tramo: i });
    eventos.push({ t: finDeTramo(t, i), delta: -1, tramo: i });
  }
  // en un mismo instante primero se van y después llegan: así un recambio instantáneo no cuenta como «llena»
  eventos.sort((x, y) => x.t - y.t || x.delta - y.delta || x.tramo - y.tramo);
  const lapsos: { entra: number; sale: number }[] = [];
  let ocupacion = 0, entra = -1;
  for (const e of eventos) {
    ocupacion += e.delta;
    if (e.delta === 1 && ocupacion >= capacidad && entra < 0) entra = e.tramo;
    else if (e.delta === -1 && ocupacion < capacidad && entra >= 0) { lapsos.push({ entra, sale: e.tramo }); entra = -1; }
  }
  return lapsos;
}

function biografiaDeRampa(t: Traza, id: number): Biografia {
  const geo = t.geometria.rampas[id];
  if (!geo) throw new Error(`armarBiografia: la rampa ${id} no existe en la geometría (se esperaba un número entre 0 y ${t.geometria.rampas.length - 1})`);
  const pasos: PasoBiografia[] = [];
  if (geo.capacidad > 0) {
    for (const l of lapsosLlena(t, id, geo.capacidad)) {
      const d = afirmarHora(t, l.entra, 't0'), h = afirmarHora(t, l.sale, 't1');
      pasos.push({
        desde: t.tramos.t0[l.entra], hasta: finDeTramo(t, l.sale), espera: null,
        frase: crearFrase('explicacion.paso.rampa_llena', { desde: horaDe(t.tramos.t0[l.entra]), hasta: horaDe(finDeTramo(t, l.sale)) }, [d, h]),
      });
    }
  }
  const { n, k, r, e } = t.tramos;
  for (let i = 0; i < n; i++) {
    if (k[i] !== TipoTramo.PERSONA_CIERRA_JAULA || r[i] !== id) continue;
    const min = afirmarMinutos(t, i), hora = afirmarHora(t, i, 't0');
    pasos.push(paso(t, i, crearFrase('explicacion.paso.rampa_cierra_jaula',
      { persona: nombreDe(t.catalogo.personas, e[i], 'P'), hora: horaDe(t.tramos.t0[i]), min: min.valor }, [hora, min]), null));
  }
  pasos.sort((x, y) => x.desde - y.desde || x.hasta - y.hasta);
  const titulo = crearFrase('explicacion.titulo.rampa', { rampa: nombreDe(t.catalogo.rampas, id, 'R'), ruta: geo.ruta }, []);
  return { clase: ClaseEntidad.RAMPA, id, titulo, pasos, percentil: null, causas: [] };
}

// ------------------------------------------------------------------------------------------------------- lazo y puesto

function biografiaDelLazo(t: Traza, id: number): Biografia {
  const pasos: PasoBiografia[] = [];
  for (const esp of esperasDe(t, ClaseEntidad.EQUIPO, id)) {
    const i = esp.evidencia[0];
    const min = afirmarMinutos(t, i), hora = afirmarHora(t, i, 't0');
    pasos.push(paso(t, i, crearFrase('explicacion.paso.lazo_detenido', { min: min.valor, hora: horaDe(t.tramos.t0[i]) }, [min, hora]), esp));
  }
  return { clase: ClaseEntidad.EQUIPO, id, titulo: crearFrase('explicacion.titulo.equipo', {}, []), pasos, percentil: null, causas: [] };
}

function biografiaDePuesto(t: Traza, id: number): Biografia {
  if (id < 0 || id >= t.catalogo.puestos.length) {
    throw new Error(`armarBiografia: el puesto ${id} no existe en el catálogo (se esperaba un número entre 0 y ${t.catalogo.puestos.length - 1})`);
  }
  const pasos: PasoBiografia[] = [];
  for (const esp of esperasDe(t, ClaseEntidad.PUESTO, id)) {
    const i = esp.evidencia[0];
    if (esp.causa === Causa.PAUSA) {
      const min = afirmarMinutos(t, i), hora = afirmarHora(t, i, 't0');
      pasos.push(paso(t, i, crearFrase('explicacion.paso.persona_pausa', { min: min.valor, hora: horaDe(t.tramos.t0[i]) }, [min, hora]), esp));
    } else {
      pasos.push(paso(t, i, crearFrase('explicacion.paso.persona_ausente', {}, []), esp));
    }
  }
  const titulo = crearFrase('explicacion.titulo.puesto', { puesto: nombreDe(t.catalogo.puestos, id, 'I') }, []);
  return { clase: ClaseEntidad.PUESTO, id, titulo, pasos, percentil: null, causas: [] };
}

/**
 * Biografía de una entidad de la traza. Síncrona: no simula. Los pasos van en orden de tiempo y los de un paquete quedan encadenados
 * (cada uno empieza donde terminó el anterior, salvo las esperas de menos de 3 s, que no cuentan como paso).
 */
export const armarBiografia: ArmarBiografia = (t, m, clase, id) => {
  switch (clase) {
    case ClaseEntidad.PAQUETE: return biografiaDePaquete(t, m, id);
    case ClaseEntidad.CAMION: return biografiaDeCamion(t, id);
    case ClaseEntidad.PERSONA: return biografiaDePersona(t, id);
    case ClaseEntidad.RAMPA: return biografiaDeRampa(t, id);
    case ClaseEntidad.EQUIPO: return biografiaDelLazo(t, id);
    case ClaseEntidad.PUESTO: return biografiaDePuesto(t, id);
    default: throw new Error(`armarBiografia: la clase ${String(clase)} no es una clase de entidad conocida (se esperaba 0 a 5)`);
  }
};
