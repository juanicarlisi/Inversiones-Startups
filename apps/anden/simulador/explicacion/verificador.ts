// explicacion/verificador.ts · Andén simulador, corte 1, P7 · Verificador de frases (corte-1.md §9, P7, «Frases»).
//
// Ninguna cifra se muestra sin que alguien haya controlado de dónde sale. Para cada afirmación de cada frase:
//   1. la fuente existe (el tramo, el experimento, el KPI, el parámetro);
//   2. el valor coincide con la fuente al redondeo que dice la afirmación (`decimales`);
//   3. el sentido (`sube`/`baja`/`igual`) coincide con el signo de la fuente;
//   4. `diferenciaReal` solo es verdadero si el IC de la comparación excluye el cero.
// Además, las frases del propio explicador (`explicacion.paso.*`, `.causa.*`, `.titulo.*`) tienen que respaldar cada cifra y cada hora
// que llevan en sus variables con una afirmación: una cifra que viaja suelta en `vars` se rechaza como «sin-fuente».
//
// Convenciones de las afirmaciones (todas dentro del contrato; el resto de los textos es libre):
//  · fuente 'traza': `unidad` ∈ {ms, s, min, h} (duración o instante) u `hora` (minuto entero desde la medianoche del día del turno);
//    con campo 'a' la unidad es una etiqueta («vueltas», «paquetes») y el valor es la columna `a` tal cual.
//  · fuente 'experimento': campo 'prob' en `%` se compara contra 100·p; el resto, contra el valor del KPI en su unidad.
//  · fuente 'parametro': el valor central del parámetro; con sufijo, `nombre.bajo|medio|alto` (de `incierto`) y `nombre.min|max` (de `rango`).
//  · con `sentido` el valor puede venir como magnitud: se compara |valor| contra |fuente|, y el sentido contra el signo de la fuente.
import type { Afirmacion, AlmacenResultados, Frase, MotivoFalla, Verificacion, VerificarFrases } from '../contratos/explicacion.ts';
import type { Traza } from '../contratos/traza.ts';
import { segAHora } from '../contratos/tipos-base.ts';
import { valorDeTramo } from './frases.ts';
import { valorCentral } from './parametros.ts';
import { mismaCifra, redondear } from './unidades.ts';

/** Prefijos de las frases que arma este paquete: a esas se les exige además que cada cifra de `vars` tenga su afirmación. */
export const PREFIJOS_CONTROLADOS: readonly string[] = ['explicacion.paso.', 'explicacion.causa.', 'explicacion.titulo.'];

type Esperado = { ok: true; valor: number; ic: [number, number] | null } | { ok: false; motivo: MotivoFalla };
const inexistente: Esperado = { ok: false, motivo: 'fuente-inexistente' };
const NO_COINCIDE: Esperado = { ok: false, motivo: 'valor-distinto' };

function buscarTraza(almacen: AlmacenResultados, trazaId: string | undefined): Traza | undefined {
  const trazas = almacen.trazas ?? {};
  if (trazaId !== undefined) return Object.hasOwn(trazas, trazaId) ? trazas[trazaId] : undefined;
  const ids = Object.keys(trazas);
  return ids.length === 1 ? trazas[ids[0]] : undefined;
}

function esperadoDeTraza(a: Afirmacion & { fuente: { tipo: 'traza' } }, almacen: AlmacenResultados, trazaId: string | undefined): Esperado {
  const f = a.fuente;
  const t = buscarTraza(almacen, trazaId);
  if (!t) return inexistente;
  if (!Number.isInteger(f.tramo) || f.tramo < 0 || f.tramo >= t.tramos.n) return inexistente;
  if (f.campo !== 'duracion' && f.campo !== 't0' && f.campo !== 't1' && f.campo !== 'a') return inexistente;
  const v = valorDeTramo(t, f.tramo, f.campo, a.unidad);
  return v === null ? NO_COINCIDE : { ok: true, valor: v, ic: null };
}

function esperadoDeExperimento(a: Afirmacion & { fuente: { tipo: 'experimento' } }, almacen: AlmacenResultados): Esperado {
  const f = a.fuente;
  const todos = almacen.experimentos ?? {};
  if (!Object.hasOwn(todos, f.id)) return inexistente;
  const ex = todos[f.id];
  switch (f.campo) {
    case 'media': { const r = ex.resumen?.[f.kpi]; return r ? { ok: true, valor: r.media, ic: null } : inexistente; }
    case 'p90': { const r = ex.resumen?.[f.kpi]; return r ? { ok: true, valor: r.p90, ic: null } : inexistente; }
    case 'diferencia': { const c = ex.comparacion?.[f.kpi]; return c ? { ok: true, valor: c.media, ic: c.ic } : inexistente; }
    case 'prob': return ex.prop ? { ok: true, valor: a.unidad === '%' ? ex.prop.p * 100 : ex.prop.p, ic: null } : inexistente;
    default: return inexistente;
  }
}

function esperadoDeParametro(a: Afirmacion & { fuente: { tipo: 'parametro' } }, almacen: AlmacenResultados): Esperado {
  const parametros = almacen.modelo?.parametros ?? {};
  const nombre = a.fuente.nombre;
  if (Object.hasOwn(parametros, nombre)) {
    const v = valorCentral(parametros[nombre].valor);
    return Number.isFinite(v) ? { ok: true, valor: v, ic: null } : NO_COINCIDE;
  }
  const punto = nombre.lastIndexOf('.');
  if (punto <= 0) return inexistente;
  const base = nombre.slice(0, punto), sufijo = nombre.slice(punto + 1);
  if (!Object.hasOwn(parametros, base)) return inexistente;
  const p = parametros[base];
  let v: number | undefined;
  if (sufijo === 'bajo' || sufijo === 'medio' || sufijo === 'alto') v = p.incierto?.[sufijo];
  else if (sufijo === 'min') v = p.rango?.[0];
  else if (sufijo === 'max') v = p.rango?.[1];
  return v === undefined ? inexistente : { ok: true, valor: v, ic: null };
}

/** Motivo por el que una afirmación no se sostiene, o `null` si se sostiene. */
export function verificarAfirmacion(a: Afirmacion, almacen: AlmacenResultados, trazaId?: string): MotivoFalla | null {
  const f = a?.fuente as Afirmacion['fuente'] | undefined;
  if (!f || typeof f !== 'object') return 'sin-fuente';
  let esperado: Esperado;
  switch (f.tipo) {
    case 'traza': esperado = esperadoDeTraza({ ...a, fuente: f }, almacen, trazaId); break;
    case 'experimento': esperado = esperadoDeExperimento({ ...a, fuente: f }, almacen); break;
    case 'parametro': esperado = esperadoDeParametro({ ...a, fuente: f }, almacen); break;
    default: return 'sin-fuente';
  }
  if (!esperado.ok) return esperado.motivo;
  if (!Number.isFinite(a.valor) || !Number.isInteger(a.decimales) || a.decimales < 0 || a.decimales > 6) return 'valor-distinto';
  const fuente = esperado.valor;

  if (a.sentido !== undefined) {
    // el valor puede ser la magnitud: se compara contra |fuente| y el sentido contra el signo de la fuente
    if (!mismaCifra(Math.abs(a.valor), Math.abs(fuente), a.decimales)) return 'valor-distinto';
    const real = redondear(fuente, a.decimales) === 0 ? 'igual' : fuente > 0 ? 'sube' : 'baja';
    if (a.sentido !== real) return 'signo-invertido';
    if (a.valor < 0 && a.sentido === 'sube') return 'signo-invertido';
  } else if (!mismaCifra(a.valor, fuente, a.decimales)) {
    return redondear(a.valor, a.decimales) === -redondear(fuente, a.decimales) ? 'signo-invertido' : 'valor-distinto';
  }

  if (a.diferenciaReal === true) {
    const ic = esperado.ic;
    if (!ic || (ic[0] <= 0 && ic[1] >= 0)) return 'diferencia-no-real';
  }
  return null;
}

/** ¿La clave es de las que arma este paquete? (a esas se les controlan también las cifras de `vars`). */
export function esFraseControlada(clave: string): boolean {
  return PREFIJOS_CONTROLADOS.some((p) => clave.startsWith(p));
}

const HORA = /^\d{1,2}:\d{2}$/;
/**
 * Cifras y horas de `vars` que ninguna afirmación respalda. Un número tiene que coincidir (al redondeo de la afirmación) con el valor de
 * alguna; una hora «HH:MM» tiene que ser la hora de alguna afirmación de unidad `hora`.
 */
export function cifrasSinRespaldo(f: Frase): string[] {
  const afirmaciones = Array.isArray(f.afirmaciones) ? f.afirmaciones : [];
  const sueltas: string[] = [];
  for (const nombre of Object.keys(f.vars ?? {})) {
    const v = f.vars[nombre];
    if (typeof v === 'number') {
      if (!afirmaciones.some((a) => Number.isInteger(a.decimales) && a.decimales >= 0 && a.decimales <= 6 && mismaCifra(a.valor, v, a.decimales))) sueltas.push(nombre);
    } else if (HORA.test(v)) {
      if (!afirmaciones.some((a) => a.unidad === 'hora' && Number.isFinite(a.valor) && segAHora(Math.floor(a.valor) * 60) === v.padStart(5, '0'))) sueltas.push(nombre);
    }
  }
  return sueltas;
}

/**
 * Controla todas las afirmaciones de todas las frases contra el almacén (`trazaId` elige la traza de las fuentes 'traza'; si no se da y
 * el almacén tiene una sola, es esa). `ok` es verdadero solo si no hay ninguna falla.
 */
export const verificarFrases: VerificarFrases = (frases, almacen, trazaId) => {
  if (!Array.isArray(frases)) throw new TypeError(`verificarFrases: se esperaba una lista de frases y llegó ${typeof frases}`);
  const fallas: Verificacion['fallas'] = [];
  frases.forEach((frase, fi) => {
    const afirmaciones = Array.isArray(frase.afirmaciones) ? frase.afirmaciones : [];
    afirmaciones.forEach((a, ai) => {
      const motivo = verificarAfirmacion(a, almacen, trazaId);
      if (motivo) fallas.push({ frase: fi, afirmacion: ai, motivo });
    });
    if (esFraseControlada(frase.clave)) {
      // una cifra suelta no tiene afirmación a la que apuntar: el índice es −1
      for (let n = cifrasSinRespaldo(frase).length; n > 0; n--) fallas.push({ frase: fi, afirmacion: -1, motivo: 'sin-fuente' });
    }
  });
  return { ok: fallas.length === 0, fallas };
};
