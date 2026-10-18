// app/falsos/explicacion.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// Biografías, causas, contrafactuales, verificador y momentos falsos, sobre la traza de la maqueta. Usan las claves de texto de
// explicacion/ y escena/ (P7 y P6) con sus variables, para que la interfaz se vea con los textos reales; la lógica es mínima. La app real
// usa las de P7 y P6 (la integración las pasa en Servicios).
import type { Ms } from '../../contratos/tipos-base.ts';
import { ClaseEntidad, TipoMomento, TipoTramo, type Traza } from '../../contratos/traza.ts';
import type { Modelo } from '../../contratos/modelo.ts';
import type { Afirmacion, Biografia, Contrafactual, Frase, PasoBiografia, VerificarFrases, Espera } from '../../contratos/explicacion.ts';
import type { DetectarMomentos, MomentoEscena } from '../../contratos/vistas.ts';
import { Causa } from '../../contratos/traza.ts';
import { horaDeMs } from '../i18n/formato.ts';

const min = (ms: number) => Math.round(ms / 60000);
const af = (valor: number, unidad: string, tramo: number, campo: 'duracion' | 't0' | 't1' | 'a'): Afirmacion =>
  ({ valor, unidad, decimales: 0, fuente: { tipo: 'traza', tramo, campo } });
const frase = (clave: string, vars: Record<string, string | number> = {}, afirmaciones: Afirmacion[] = []): Frase => ({ clave, vars, afirmaciones });

/** Tramos de un paquete, en orden de escritura. */
export function tramosDe(tr: Traza, e: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < tr.tramos.n; i++) if (tr.tramos.e[i] === e && tr.tramos.k[i] < TipoTramo.PERSONA_TRABAJA) out.push(i);
  return out;
}

export function buscarPaquete(tr: Traza, camion: number, indice: number): number {
  const P = tr.paquetes;
  for (let e = 0; e < P.n; e++) if (P.camion[e] === camion && P.indice[e] === indice) return e;
  return -1;
}

function rutaDe(tr: Traza, e: number): string { return tr.catalogo.rutas[tr.paquetes.ruta[e]] ?? '—'; }
function personaRampa(tr: Traza, q: number): string {
  const id = q >= 0 ? q % 16777216 : -1;
  return tr.catalogo.personas[id]?.id ?? '—';
}

export function biografiaFalsa(tr: Traza, _m: Modelo, clase: ClaseEntidad, id: number): Biografia {
  const T = tr.tramos, C = tr.catalogo, NR = C.rampas.length;
  if (clase === ClaseEntidad.RAMPA) {
    const pasos: PasoBiografia[] = [];
    let desde = -1;
    for (let i = 0; i < tr.momentos.n && pasos.length < 12; i++) {
      if (tr.momentos.r[i] !== id) continue;
      if (tr.momentos.tipo[i] === TipoMomento.RAMPA_LLENA) desde = tr.momentos.t[i];
      else if (tr.momentos.tipo[i] === TipoMomento.RAMPA_LIBERA && desde >= 0) {
        const hasta = tr.momentos.t[i];
        pasos.push({ desde, hasta, frase: frase('explicacion.paso.rampa_llena', { desde: horaDeMs(desde), hasta: horaDeMs(hasta) }), espera: null });
        desde = -1;
      }
    }
    return { clase, id, titulo: frase('explicacion.titulo.rampa', { rampa: C.rampas[id] ?? String(id), ruta: tr.geometria.rampas[id]?.ruta ?? '—' }),
      pasos, percentil: null, causas: [] };
  }
  if (clase !== ClaseEntidad.PAQUETE) {
    return { clase, id, titulo: frase('explicacion.titulo.equipo'), pasos: [], percentil: null, causas: [] };
  }
  const P = tr.paquetes, pasos: PasoBiografia[] = [];
  const espera = (i: number, causa: Causa, causante = -1): Espera =>
    ({ desde: T.t0[i], hasta: T.t1[i], donde: T.k[i] as Espera['donde'], recurso: T.r[i], causa, causante, evidencia: [i] });
  for (const i of tramosDe(tr, id)) {
    const k = T.k[i], d = T.t1[i] - T.t0[i], m = min(d);
    let f: Frase | null = null; let w: Espera | null = null;
    switch (k) {
      case TipoTramo.DESCARGA:
        f = frase('explicacion.paso.descarga', { camion: C.camiones[P.camion[id]]?.id ?? `${P.camion[id] + 1}`, anden: C.andenes[T.r[i]] ?? '—', hora: horaDeMs(T.t0[i]) },
          [af(Math.floor(T.t0[i] / 60000), 'hora', i, 't0')]); break;
      case TipoTramo.CINTA: f = frase('explicacion.paso.cinta', { cinta: tr.geometria.cintas[T.r[i]]?.id ?? '—' }); break;
      case TipoTramo.ACUMULACION:
        if (d < 3000) break;
        f = frase('explicacion.paso.acumulacion', { min: m }, [af(m, 'min', i, 'duracion')]); w = espera(i, Causa.FILA); break;
      case TipoTramo.INDUCCION: f = frase('explicacion.paso.induccion', { persona: C.personas[T.r[i]]?.id ?? '—', puesto: C.puestos[T.r[i]] ?? '—' }); break;
      case TipoTramo.BANDEJA:
        if (T.a[i] > 0) { f = frase('explicacion.paso.vuelta', { vuelta: T.a[i], rampa: C.rampas[P.ruta[id]] ?? '—' }, [af(T.a[i], 'vueltas', i, 'a')]); w = espera(i, Causa.RAMPA_LLENA); }
        else f = frase('explicacion.paso.bandeja', { min: m }, [af(m, 'min', i, 'duracion')]);
        break;
      case TipoTramo.RAMPA:
        if (T.r[i] >= NR) { f = frase('explicacion.paso.cola_manual.no_leido', { min: m }, [af(m, 'min', i, 'duracion')]); w = espera(i, Causa.NO_LEIDO); break; }
        if (d < 3000) break;
        f = frase('explicacion.paso.rampa.ocupada', { min: m, rampa: C.rampas[T.r[i]] ?? '—', persona: personaRampa(tr, T.q[i]) }, [af(m, 'min', i, 'duracion')]);
        w = espera(i, Causa.PERSONA_OCUPADA, T.q[i]); break;
      case TipoTramo.MANO: f = frase('explicacion.paso.mano', { persona: C.personas[C.puestos.length + T.r[i]]?.id ?? '—' }); break;
      case TipoTramo.MANUAL: f = frase('explicacion.paso.manual', { persona: C.personas.filter((p) => p.rol === 'excepcion')[T.r[i]]?.id ?? '—', min: m }, [af(m, 'min', i, 'duracion')]); break;
      case TipoTramo.JAULA:
        f = frase(T.t0[i] <= tr.corte ? 'explicacion.paso.jaula.antes_del_corte' : 'explicacion.paso.jaula.despues_del_corte',
          { rampa: C.rampas[T.r[i]] ?? '—', hora: horaDeMs(T.t0[i]) }, [af(Math.floor(T.t0[i] / 60000), 'hora', i, 't0')]);
        pasos.push({ desde: T.t0[i], hasta: T.t0[i], frase: f, espera: null }); f = null; break;
    }
    if (f) pasos.push({ desde: T.t0[i], hasta: T.t1[i], frase: f, espera: w });
  }
  if (P.listo[id] < 0) pasos.push({ desde: tr.fin, hasta: tr.fin, frase: frase('explicacion.paso.no_termino'), espera: null });
  const propio = (P.listo[id] >= 0 ? P.listo[id] : tr.fin) - P.creado[id];
  let menos = 0;
  for (let e = 0; e < P.n; e++) if (((P.listo[e] >= 0 ? P.listo[e] : tr.fin) - P.creado[e]) < propio) menos++;
  return {
    clase, id,
    titulo: frase('explicacion.titulo.paquete', { indice: P.indice[id] + 1, camion: C.camiones[P.camion[id]]?.id ?? '—', ruta: rutaDe(tr, id), tamano: 'chico' }),
    pasos, percentil: Math.round(1000 * menos / Math.max(1, P.n)) / 10, causas: [],
  };
}

/** Causas «confirmadas» falsas: vueltas de más → rampa llena; fila larga → un puesto más. El «contrafactual» resta minutos fijos. */
export function causasFalsas(tr: Traza, m: Modelo, e: number): { causas: Frase[]; contrafactuales: Contrafactual[] } {
  if (e < 0) return { causas: [], contrafactuales: [] };
  const P = tr.paquetes, T = tr.tramos, listo = P.listo[e] >= 0 ? P.listo[e] : null;
  const antesDelCorte = listo !== null && listo <= tr.corte;
  const causas: Frase[] = [], contrafactuales: Contrafactual[] = [];
  let fila = 0, vueltas = 0, rampa = -1;
  for (const i of tramosDe(tr, e)) {
    if (T.k[i] === TipoTramo.ACUMULACION) fila += T.t1[i] - T.t0[i];
    if (T.k[i] === TipoTramo.BANDEJA && T.a[i] > vueltas) vueltas = T.a[i];
    if (T.k[i] === TipoTramo.RAMPA && T.r[i] < tr.catalogo.rampas.length) rampa = T.r[i];
  }
  const cf = (clave: string, vars: Record<string, string | number>, adelanto: Ms, parche: Contrafactual['cambio']['parche']): Contrafactual => {
    const despues = listo === null ? tr.corte - 60_000 : listo - adelanto;
    const confirma = antesDelCorte ? adelanto >= 300_000 : despues <= tr.corte;
    return { clase: ClaseEntidad.PAQUETE, camion: P.camion[e], indice: P.indice[e], cambio: { clave, vars, parche }, semilla: tr.semilla, replica: tr.replica,
      antes: { listo, antesDelCorte }, despues: { listo: despues, antesDelCorte: despues <= tr.corte }, confirma };
  };
  if (vueltas > 0 && rampa >= 0) {
    const cap = tr.geometria.rampas[rampa]?.capacidad ?? 20;
    const c = cf('explicacion.cambio.rampa_llena', { rampa: tr.catalogo.rampas[rampa], capacidad: cap * 2 }, 18 * 60_000,
      [{ op: 'replace', path: `/hub/rampas/${Math.min(rampa, m.hub.rampas.length - 1)}/capacidad`, value: cap * 2 }]);
    contrafactuales.push(c);
    if (c.confirma) causas.push(frase('explicacion.causa.rampa_llena', { vueltas, rampa: tr.catalogo.rampas[rampa] }));
  }
  if (fila >= 300_000) {
    const puestos = m.personas.induccion.puestosActivos + 1;
    const c = cf('explicacion.cambio.fila', { puestos }, Math.round(fila * 0.7),
      [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: puestos }]);
    contrafactuales.push(c);
    if (c.confirma) causas.push(frase('explicacion.causa.fila', { espera: min(fila) }));
  }
  return { causas, contrafactuales };
}

/** Verificador falso: controla que la fuente de cada cifra exista (tramo de la traza, parámetro del modelo). */
export const verificarFalso: VerificarFrases = (frases, almacen, trazaId) => {
  const fallas: { frase: number; afirmacion: number; motivo: 'sin-fuente' | 'fuente-inexistente' }[] = [];
  const ids = Object.keys(almacen.trazas);
  const tr = trazaId !== undefined ? almacen.trazas[trazaId] : ids.length === 1 ? almacen.trazas[ids[0]] : undefined;
  frases.forEach((f, i) => f.afirmaciones.forEach((a, j) => {
    if (a.fuente.tipo === 'traza' && (!tr || a.fuente.tramo < 0 || a.fuente.tramo >= tr.tramos.n)) fallas.push({ frase: i, afirmacion: j, motivo: 'fuente-inexistente' });
    if (a.fuente.tipo === 'parametro' && !almacen.modelo.parametros[a.fuente.nombre.split('.')[0]]) fallas.push({ frase: i, afirmacion: j, motivo: 'fuente-inexistente' });
  }));
  return { ok: fallas.length === 0, fallas };
};

/** Momentos de la línea de tiempo (con las claves de escena/): corte, primer y último paquete, primeras rampas llenas, primer atrasado. */
export const detectarMomentosFalso: DetectarMomentos = (tr) => {
  const M = tr.momentos, out: MomentoEscena[] = [];
  const vistas = new Set<number>();
  for (let i = 0; i < M.n; i++) {
    const t = M.t[i], r = M.r[i];
    switch (M.tipo[i]) {
      case TipoMomento.CORTE: out.push({ t, tipo: M.tipo[i], r, importancia: 5, clave: 'escena.momento.corte', vars: { hora: horaDeMs(t), pendientes: M.v[i] } }); break;
      case TipoMomento.PRIMER_PAQUETE: out.push({ t, tipo: M.tipo[i], r, importancia: 2, clave: 'escena.momento.primerPaquete', vars: {} }); break;
      case TipoMomento.ULTIMO_CLASIFICADO: out.push({ t, tipo: M.tipo[i], r, importancia: 4, clave: 'escena.momento.ultimoClasificado', vars: { hora: horaDeMs(t) } }); break;
      case TipoMomento.RAMPA_LLENA:
        if (vistas.has(r) || vistas.size >= 8) break;
        vistas.add(r);
        out.push({ t, tipo: M.tipo[i], r, importancia: 3, clave: 'escena.momento.rampaLlena', vars: { rampa: tr.catalogo.rampas[r] ?? String(r), ruta: tr.geometria.rampas[r]?.ruta ?? '—' } });
        break;
    }
  }
  // primer paquete (por hora de creación) que no llega al corte
  let primero = -1;
  for (let e = 0; e < tr.paquetes.n; e++) {
    const l = tr.paquetes.listo[e];
    if ((l < 0 || l > tr.corte) && tr.paquetes.creado[e] >= 0 && (primero < 0 || tr.paquetes.creado[e] < tr.paquetes.creado[primero])) primero = e;
  }
  if (primero >= 0) {
    out.push({ t: tr.paquetes.creado[primero], tipo: 100, r: primero, importancia: 5, clave: 'escena.momento.primerAtrasado',
      vars: { camion: tr.catalogo.camiones[tr.paquetes.camion[primero]]?.id ?? '—', ruta: tr.catalogo.rutas[tr.paquetes.ruta[primero]] ?? '—' } });
  }
  return out.sort((a, b) => a.t - b.t || b.importancia - a.importancia || a.tipo - b.tipo);
};
