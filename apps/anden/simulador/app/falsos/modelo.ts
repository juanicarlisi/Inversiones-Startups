// app/falsos/modelo.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// Versiones falsas y chicas de lo que hace modelo/ (P3): JSON canónico, huella, parches RFC 6902, un compilador que revisa lo justo para
// la interfaz, F0, anonimizar y un códec de enlace. La app real usa las de P3 (la integración las pasa en Servicios): estas existen para
// que la interfaz se desarrolle y se pruebe sin importar otro paquete (corte-1.md §14.3).
import type { Compilar, Diagnostico, EstimacionF0, Modelo, ModeloValidado, OpParche, Variante } from '../../contratos/modelo.ts';
import type { Distribucion } from '../../contratos/azar.ts';
import type { CodecEnlace, Enlace, ErrorEnlace, ResolverPlantilla } from '../../contratos/escena.ts';
import { LIMITES_ENLACE } from '../../contratos/escena.ts';
import type { Receta } from '../../contratos/experimentos.ts';
import { horaASeg, segAHoraLarga } from '../../contratos/tipos-base.ts';
import { esRef, parametro } from '../../contratos/referencias.ts';

// ---------- JSON canónico y huella ----------

export function jsonCanonico(x: unknown): string {
  if (x === null || typeof x !== 'object') return JSON.stringify(x) ?? 'null';
  if (Array.isArray(x)) return `[${x.map((v) => (v === undefined ? 'null' : jsonCanonico(v))).join(',')}]`;
  const o = x as Record<string, unknown>;
  const claves = Object.keys(o).filter((k) => o[k] !== undefined).sort();
  return `{${claves.map((k) => `${JSON.stringify(k)}:${jsonCanonico(o[k])}`).join(',')}}`;
}

export async function huellaDeTexto(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto);
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(h.subarray(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------- Parches RFC 6902 ----------

function partes(puntero: string): string[] {
  if (puntero === '') return [];
  if (!puntero.startsWith('/')) throw new Error(`parche: el puntero «${puntero}» tiene que empezar con «/».`);
  return puntero.slice(1).split('/').map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
}

/** Aplica add, remove, replace y test sin tocar el original. Lanza con el puntero y el motivo si algo no se puede. */
export function aplicarParche<T>(doc: T, ops: readonly OpParche[]): T {
  let raiz: unknown = structuredClone(doc);
  for (const op of ops) {
    const ps = partes(op.path);
    if (ps.length === 0) {
      if (op.op === 'test') { if (jsonCanonico(raiz) !== jsonCanonico(op.value)) throw new Error('parche: test falló en la raíz'); continue; }
      if (op.op === 'remove') throw new Error('parche: no se puede quitar la raíz');
      raiz = structuredClone(op.value);
      continue;
    }
    let padre = raiz as Record<string, unknown> | unknown[];
    for (const p of ps.slice(0, -1)) {
      const sig = Array.isArray(padre) ? padre[Number(p)] : (padre as Record<string, unknown>)?.[p];
      if (sig === null || typeof sig !== 'object') throw new Error(`parche: «${op.path}» no existe (falta «${p}»).`);
      padre = sig as Record<string, unknown> | unknown[];
    }
    const ultimo = ps[ps.length - 1];
    if (Array.isArray(padre)) {
      const i = ultimo === '-' ? padre.length : Number(ultimo);
      if (!Number.isInteger(i) || i < 0 || i > padre.length || (op.op !== 'add' && i >= padre.length)) {
        throw new Error(`parche: índice «${ultimo}» fuera de la lista en «${op.path}».`);
      }
      if (op.op === 'add') padre.splice(i, 0, structuredClone(op.value));
      else if (op.op === 'remove') padre.splice(i, 1);
      else if (op.op === 'replace') padre[i] = structuredClone(op.value);
      else if (jsonCanonico(padre[i]) !== jsonCanonico(op.value)) throw new Error(`parche: test falló en «${op.path}».`);
    } else {
      const o = padre as Record<string, unknown>;
      const existe = Object.prototype.hasOwnProperty.call(o, ultimo);
      if (op.op !== 'add' && !existe) throw new Error(`parche: «${op.path}» no existe.`);
      if (op.op === 'add' || op.op === 'replace') o[ultimo] = structuredClone(op.value);
      else if (op.op === 'remove') delete o[ultimo];
      else if (jsonCanonico(o[ultimo]) !== jsonCanonico(op.value)) throw new Error(`parche: test falló en «${op.path}».`);
    }
  }
  return raiz as T;
}

/** Valor en un JSON Pointer (o undefined). */
export function leerPuntero(doc: unknown, puntero: string): unknown {
  let x: unknown = doc;
  for (const p of partes(puntero)) {
    if (x === null || typeof x !== 'object') return undefined;
    x = Array.isArray(x) ? x[Number(p)] : (x as Record<string, unknown>)[p];
  }
  return x;
}

// ---------- F0 (corte-1.md §6.10) ----------

export function mediaDe(d: Distribucion): number {
  switch (d.tipo) {
    case 'fija': return d.valor;
    case 'uniforme': return (d.min + d.max) / 2;
    case 'exponencial': case 'lognormal': case 'normal': case 'erlang': return d.media;
    case 'triangular': return (d.min + d.moda + d.max) / 3;
    case 'bernoulli': return d.p;
    case 'weibull': return d.escala;
    case 'discreta': { const s = d.pesos.reduce((a, b) => a + b, 0); return d.valores.reduce((a, v, i) => a + v * d.pesos[i], 0) / s; }
    case 'empirica': return d.valores.reduce((a, b) => a + b, 0) / d.valores.length;
  }
}
/** Valor central de un campo Num o Dist (número, distribución o «@parametro»). */
export function central(m: Modelo, x: unknown): number {
  if (typeof x === 'number') return x;
  if (esRef(x)) { const v = parametro(m, x).valor; return typeof v === 'number' ? v : mediaDe(v); }
  if (x && typeof x === 'object' && 'tipo' in x) return mediaDe(x as Distribucion);
  return NaN;
}

export function calcularF0(m: Modelo): EstimacionF0 {
  const cam = m.demanda.camiones;
  let paquetes: number, ventana: number, primero: number;
  if (Array.isArray(cam)) {
    paquetes = cam.reduce((a, c) => a + c.paquetes, 0);
    const turnos = cam.map((c) => horaASeg(c.turno)).sort((a, b) => a - b);
    primero = turnos[0] ?? 0;
    const intervalos = turnos.slice(1).map((t, i) => t - turnos[i]).sort((a, b) => a - b);
    ventana = (turnos[turnos.length - 1] - primero) + (intervalos[Math.floor(intervalos.length / 2)] ?? 0);
  } else {
    paquetes = cam.cantidad * cam.paquetes; ventana = cam.cantidad * cam.cada; primero = horaASeg(cam.primero);
  }
  const llegada = ventana > 0 ? paquetes / ventana * 3600 : paquetes * 3600;
  const personasAnden = m.hub.andenes.reduce((a, x) => a + x.personas, 0);
  const descarga = personasAnden * 3600 / central(m, m.personas.descarga.ritmo);
  const pi = m.personas.induccion.pausas;
  const induccion = m.personas.induccion.puestosActivos * 3600 / central(m, m.hub.induccion.tiempo) * (1 - pi.duracion / pi.cada);
  const bandejas = m.hub.perfilPaquete.clases.reduce((a, c) => a + c.fraccion * c.bandejas, 0);
  const sorter = m.hub.sorter.velocidad / m.hub.sorter.paso * 3600 / bandejas;
  const pr = m.personas.rampa.pausas;
  const rampas = m.personas.rampa.cantidad * 3600 / (central(m, m.personas.rampa.manejo) + central(m, m.hub.jaulas.cierre) / m.hub.jaulas.capacidad)
    * (1 - pr.duracion / pr.cada);
  const caps = { descarga, induccion, sorter, rampas } as const;
  let cuello: EstimacionF0['cuello'] = 'descarga';
  for (const k of ['induccion', 'sorter', 'rampas'] as const) if (caps[k] < caps[cuello]) cuello = k;
  const fin = primero + Math.max(ventana, paquetes / caps[cuello] * 3600);
  return {
    llegadaMediaPorHora: llegada, capacidadDescargaPorHora: descarga, capacidadInduccionPorHora: induccion,
    capacidadSorterTeoricaPorHora: sorter, capacidadRampasPorHora: rampas, cuello,
    utilizacion: { descarga: llegada / descarga, induccion: llegada / induccion, sorter: llegada / sorter, rampas: llegada / rampas },
    finEstimado: Number.isFinite(fin) && fin < 48 * 3600 ? segAHoraLarga(fin) : '47:59',
  };
}

// ---------- Compilador falso ----------

const PROHIBIDAS = new Set(['__proto__', 'constructor', 'prototype']);
const REQUERIDOS = ['esquema', 'familia', 'id', 'titulo', 'unidades', 'parametros', 'calendario', 'demanda', 'hub', 'personas', 'costos', 'experimento'];

function revisarProfundo(x: unknown, ruta: string, d: Diagnostico[], prof = 0): void {
  if (prof > LIMITES_ENLACE.maxProfundidadJson) { d.push({ codigo: 'E-ESQUEMA', nivel: 'error', ruta, clave: 'modelo.diag.E-ESQUEMA.profundidad', vars: { max: LIMITES_ENLACE.maxProfundidadJson } }); return; }
  if (typeof x === 'string' && x.length > LIMITES_ENLACE.maxLargoTexto) {
    d.push({ codigo: 'E-ESQUEMA', nivel: 'error', ruta, clave: 'modelo.diag.E-ESQUEMA.texto-largo', vars: { largo: x.length, max: LIMITES_ENLACE.maxLargoTexto } });
  } else if (typeof x === 'number' && !Number.isFinite(x)) {
    d.push({ codigo: 'E-ESQUEMA', nivel: 'error', ruta, clave: 'modelo.diag.E-ESQUEMA.no-finito', vars: {} });
  } else if (x && typeof x === 'object') {
    for (const k of Object.keys(x)) {
      if (PROHIBIDAS.has(k)) { d.push({ codigo: 'E-ESQUEMA', nivel: 'error', ruta: `${ruta}/${k}`, clave: 'modelo.diag.E-ESQUEMA.clave-prohibida', vars: { clave: k } }); continue; }
      revisarProfundo((x as Record<string, unknown>)[k], `${ruta}/${k.replace(/~/g, '~0').replace(/\//g, '~1')}`, d, prof + 1);
    }
  }
}

/** Compilador falso: revisa forma, claves prohibidas, textos y números, cuenta supuestos y calcula F0 y la huella. */
export const compilarFalso: Compilar = async (x) => {
  const d: Diagnostico[] = [];
  if (x === null || typeof x !== 'object' || Array.isArray(x)) {
    return { ok: false, diagnosticos: [{ codigo: 'E-ESQUEMA', nivel: 'error', ruta: '', clave: 'modelo.diag.E-ESQUEMA', vars: {} }] };
  }
  revisarProfundo(x, '', d);
  const o = x as Record<string, unknown>;
  for (const c of REQUERIDOS) if (!(c in o)) d.push({ codigo: 'E-ESQUEMA', nivel: 'error', ruta: `/${c}`, clave: 'modelo.diag.E-ESQUEMA.requerido', vars: { campo: c } });
  if ('esquema' in o && o.esquema !== 'anden.modelo/1') {
    d.push({ codigo: 'E-ESQUEMA', nivel: 'error', ruta: '/esquema', clave: 'modelo.diag.E-ESQUEMA.esquema-desconocido', vars: { valor: String(o.esquema), opciones: 'anden.modelo/1' } });
  }
  if (d.some((z) => z.nivel === 'error')) return { ok: false, diagnosticos: d };
  const m = structuredClone(x) as Modelo;
  let f0: EstimacionF0;
  try {
    f0 = calcularF0(m);
    const ip = m.personas.induccion.puestosActivos;
    if (!Number.isInteger(ip) || ip < 0) throw new Error('puestosActivos');
    if (ip > m.hub.induccion.puestos.length) {
      return { ok: false, diagnosticos: [{ codigo: 'E-PUESTOS', nivel: 'error', ruta: '/personas/induccion/puestosActivos', clave: 'modelo.diag.E-PUESTOS', vars: { activos: ip, puestos: m.hub.induccion.puestos.length } }] };
    }
  } catch {
    return { ok: false, diagnosticos: [{ codigo: 'E-ESQUEMA', nivel: 'error', ruta: '', clave: 'modelo.diag.E-ESQUEMA', vars: {} }] };
  }
  for (const [nombre, p] of Object.entries(m.parametros)) {
    const v = typeof p.valor === 'number' ? p.valor : mediaDe(p.valor);
    if (p.rango && (v < p.rango[0] || v > p.rango[1])) {
      return { ok: false, diagnosticos: [{ codigo: 'E-RANGO', nivel: 'error', ruta: `/parametros/${nombre}/valor`, clave: 'modelo.diag.E-RANGO.fuera-de-rango',
        vars: { valor: v, min: p.rango[0], max: p.rango[1] } }] };
    }
  }
  for (const [k, u] of Object.entries(f0.utilizacion)) {
    if (u >= 1) d.push({ codigo: 'A-RHO', nivel: 'aviso', ruta: '', clave: `modelo.diag.A-RHO.${k}`, vars: { rho: Math.round(u * 100) / 100 } });
  }
  if (horaASeg(f0.finEstimado) > horaASeg(m.calendario.corte)) {
    d.push({ codigo: 'A-CORTE-IMPOSIBLE', nivel: 'aviso', ruta: '/calendario/corte', clave: 'modelo.diag.A-CORTE-IMPOSIBLE', vars: { fin: f0.finEstimado, corte: m.calendario.corte } });
  }
  const params = Object.values(m.parametros);
  const supuestos = params.filter((p) => p.etiqueta === 'SUPUESTO').length;
  d.push({ codigo: 'I-SUPUESTOS', nivel: 'info', ruta: '/parametros', clave: 'modelo.diag.I-SUPUESTOS', vars: { n: supuestos, total: params.length } });
  return { ok: true, mv: { modelo: m, huella: await huellaDeTexto(jsonCanonico(m)), diagnosticos: d, f0 } };
};

export function crearVarianteFalsa(compilar: Compilar): Variante {
  return async (mv: ModeloValidado, parche: OpParche[]) => {
    const r = await compilar(aplicarParche(mv.modelo, parche));
    if (!r.ok) throw new Error(`variante inválida: ${r.diagnosticos.map((z) => z.codigo).join(', ')}`);
    return r.mv;
  };
}

// ---------- Anonimizar (falso) ----------

function dosCifras(x: number): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  const e = Math.floor(Math.log10(Math.abs(x))) - 1;
  return Math.round(x / 10 ** e) * 10 ** e;
}
export function anonimizarFalso(m: Modelo, semilla: number): Modelo {
  const c = structuredClone(m);
  delete c.autor; delete c.descripcion;
  c.id = 'modelo-anonimo'; c.titulo = 'Hub anonimizado';
  const f = 0.8 + 0.45 * (((Math.imul(semilla | 0, 0x9e3779b1) >>> 0) % 10000) / 10000);
  const cam = c.demanda.camiones;
  if (Array.isArray(cam)) for (const x of cam) x.paquetes = Math.round(x.paquetes * f); else cam.paquetes = Math.round(cam.paquetes * f);
  c.hub.planClasificacion.rutas.forEach((r, i) => { r.id = `Ruta ${String(i + 1).padStart(2, '0')}`; });
  for (const k of ['costoHoraPersona', 'costoFijoNoche']) {
    const p = c.parametros[k];
    if (p && typeof p.valor === 'number') { p.valor = dosCifras(p.valor); p.fuente = 'Valor redondeado al anonimizar.'; }
  }
  return c;
}

// ---------- Códec de enlace (falso: deflate-raw + base64url, receta en JSON) ----------

function aBase64url(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function deBase64url(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('base64url');
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
async function transformar(bytes: Uint8Array, flujo: CompressionStream | DecompressionStream, tope = Infinity): Promise<Uint8Array> {
  const lector = new Blob([bytes as BlobPart]).stream().pipeThrough(flujo).getReader();
  const trozos: Uint8Array[] = []; let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.length;
    if (total > tope) { await lector.cancel(); throw new Error('bomba'); }
    trozos.push(value);
  }
  const out = new Uint8Array(total); let i = 0;
  for (const t of trozos) { out.set(t, i); i += t.length; }
  return out;
}
async function comprimir(texto: string): Promise<string> {
  return aBase64url(await transformar(new TextEncoder().encode(texto), new CompressionStream('deflate-raw')));
}
async function descomprimir(s: string): Promise<string> {
  return new TextDecoder().decode(await transformar(deBase64url(s), new DecompressionStream('deflate-raw'), LIMITES_ENLACE.maxBytesDescomprimidos));
}

export function crearCodecFalso(resolver: ResolverPlantilla, compilar: Compilar): CodecEnlace {
  const fallo = (error: ErrorEnlace, detalle?: string) => ({ ok: false as const, error, detalle });
  return {
    async codificar(e: Enlace) {
      const p: string[] = [];
      if (e.tipo === 'modelo') p.push(`m=${await comprimir(jsonCanonico(e.modelo))}`);
      else if (e.tipo === 'plantilla') {
        p.push(`t=${e.plantilla.id}@${e.plantilla.version}`);
        if (e.parche.length) p.push(`p=${await comprimir(jsonCanonico(e.parche))}`);
      }
      if (e.receta) p.push(`r=${aBase64url(new TextEncoder().encode(jsonCanonico(e.receta)))}`);
      const s = p.join('&');
      if (s.length > LIMITES_ENLACE.maxCaracteres) throw new Error(`enlace: muy-largo: ${s.length} caracteres`);
      return s;
    },
    async decodificar(fragmento: string) {
      if (fragmento.length > LIMITES_ENLACE.maxCaracteres) return fallo('muy-largo', `${fragmento.length} caracteres`);
      const campos = new Map<string, string>();
      for (const par of fragmento.replace(/^#/, '').split('&')) {
        const i = par.indexOf('=');
        if (i <= 0) return fallo('formato', par.slice(0, 20));
        campos.set(par.slice(0, i), par.slice(i + 1));
      }
      let receta: Receta | undefined;
      try {
        const r = campos.get('r');
        if (r !== undefined) receta = JSON.parse(new TextDecoder().decode(deBase64url(r))) as Receta;
      } catch { return fallo('formato', 'receta'); }
      try {
        if (campos.has('m')) {
          const texto = await descomprimir(campos.get('m')!);
          let x: unknown;
          try { x = JSON.parse(texto); } catch { return fallo('json-invalido'); }
          const c = await compilar(x);
          if (!c.ok) return fallo('esquema', c.diagnosticos[0]?.codigo);
          return { ok: true as const, enlace: receta ? { tipo: 'modelo' as const, modelo: c.mv.modelo, receta } : { tipo: 'modelo' as const, modelo: c.mv.modelo } };
        }
        if (campos.has('t')) {
          const [id, version] = campos.get('t')!.split('@');
          if (!id || !version || !resolver(id, version)) return fallo('plantilla-desconocida', campos.get('t'));
          const parche = campos.has('p') ? JSON.parse(await descomprimir(campos.get('p')!)) as OpParche[] : [];
          return { ok: true as const, enlace: { tipo: 'plantilla' as const, plantilla: { id, version }, parche, ...(receta ? { receta } : {}) } };
        }
        if (receta) return { ok: true as const, enlace: { tipo: 'receta' as const, receta } };
        return fallo('formato');
      } catch (err) {
        return fallo(String((err as Error).message).includes('bomba') ? 'bomba' : 'formato', String((err as Error).message));
      }
    },
  };
}
