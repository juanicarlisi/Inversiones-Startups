// modelo/compilar.ts · P3 · El compilador: que ningún número se calcule con un modelo inválido.
// Etapas: copia segura (entrada no confiable) → esquema → normalización → chequeos (con F0 y presupuesto) → huella.
// La única etapa asíncrona es la huella (SHA-256 con crypto.subtle); `revisar` hace todo lo demás de forma síncrona.
import type { Compilar, Diagnostico, EstimacionF0, Modelo } from '../contratos/modelo.ts';
import { CONTROLES, chequear } from './chequeos.ts';
import { copiaSegura, crearColector, validarEsquema } from './esquema.ts';
import { huellaModelo } from './huella.ts';
import { normalizar } from './normalizar.ts';

export type Revision =
  | { ok: true; modelo: Modelo; diagnosticos: Diagnostico[]; f0: EstimacionF0 }
  | { ok: false; diagnosticos: Diagnostico[] };

/**
 * Revisión síncrona (sin huella). Con `profundo` también compila cada escenario y cada valor de la decisión, para que un modelo
 * que trae un escenario roto no se acepte. Devuelve siempre una copia nueva: nunca modifica `x`.
 */
export function revisar(x: unknown, o: { profundo: boolean } = { profundo: true }): Revision {
  const c = crearColector();
  const copia = copiaSegura(x);
  if (!copia.ok) {
    c.error('E-ESQUEMA', copia.fallo.ruta, copia.fallo.caso, copia.fallo.vars);
    return { ok: false, diagnosticos: c.lista };
  }
  if (!validarEsquema(copia.valor, c)) return { ok: false, diagnosticos: c.lista };
  const m = normalizar(copia.valor as Modelo, c);
  const f0 = chequear(m, c, { profundo: o.profundo, revisar: (y) => revisar(y, { profundo: false }) });
  if (!f0 || c.errores > 0) return { ok: false, diagnosticos: c.lista };

  const nombres = Object.keys(m.parametros);
  const supuestos = nombres.filter((k) => m.parametros[k].etiqueta === 'SUPUESTO').length;
  c.info('I-SUPUESTOS', '/parametros', undefined, { n: supuestos, total: nombres.length });
  const conDiagnostico = new Set(c.lista.map((d) => d.codigo));
  const pasaron = CONTROLES.filter((k) => !conDiagnostico.has(k)).length;
  c.info('I-CONTROLES', '', undefined, { controles: CONTROLES.length, pasaron, avisos: c.avisos });
  return { ok: true, modelo: m, diagnosticos: c.lista, f0 };
}

/** Compila un modelo (texto ya parseado, entrada no confiable): valida, normaliza, chequea y calcula F0 y la huella. */
export const compilar: Compilar = async (x: unknown) => {
  const r = revisar(x, { profundo: true });
  if (!r.ok) return { ok: false, diagnosticos: r.diagnosticos };
  const huella = await huellaModelo(r.modelo);
  return { ok: true, mv: { modelo: r.modelo, huella, diagnosticos: r.diagnosticos, f0: r.f0 } };
};
