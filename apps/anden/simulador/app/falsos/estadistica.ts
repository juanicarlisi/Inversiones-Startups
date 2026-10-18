// app/falsos/estadistica.ts · Andén simulador, corte 1 · P8 (interfaz) · SOLO PARA DESARROLLO Y PRUEBAS DE LA INTERFAZ.
// Estadística chica con las definiciones de corte-1.md §7 (IC de t, Wilson, percentiles, pareada) y, sobre todo, igual de ESTRICTA que la
// de experimentos/ (P5): lanza con una sola réplica, con réplicas repetidas o con modelos mezclados. Así las pruebas de humo descubren si
// la interfaz pide un intervalo de una sola noche. También las «cien noches» sintéticas, la decisión, el tamizado, el formulario, el mapa
// de riesgo y el comprobante falsos. Nada de esto es la estadística del producto: esa es la de P5.
import { META_KPI, type KpiId, type ResultadoReplica } from '../../contratos/resultados.ts';
import type {
  Comparacion, Comprobante, EvaluacionConfiguracion, EvaluacionDecision, Proporcion, Resumen, Semaforo,
} from '../../contratos/experimentos.ts';
import type { ModeloValidado, Parametro } from '../../contratos/modelo.ts';
import type { MapaRiesgo } from '../../contratos/vistas.ts';
import type { PlanMedicion, Pregunta, ResultadoTamizado } from '../../contratos/decision.ts';
import { horaASeg } from '../../contratos/tipos-base.ts';
import { central, leerPuntero } from './modelo.ts';

const Z: Record<string, number> = { '0.9': 1.6448536269514722, '0.95': 1.959963984540054, '0.99': 2.5758293035489004 };
const T_CHICOS: Record<string, number[]> = {
  '0.9': [6.3138, 2.92, 2.3534, 2.1318, 2.015, 1.9432, 1.8946, 1.8595, 1.8331, 1.8125],
  '0.95': [12.7062, 4.3027, 3.1824, 2.7764, 2.5706, 2.4469, 2.3646, 2.306, 2.2622, 2.2281],
  '0.99': [63.6567, 9.9248, 5.8409, 4.6041, 4.0321, 3.7074, 3.4995, 3.3554, 3.2498, 3.1693],
};
export function zDe(conf: number): number {
  const z = Z[String(conf)];
  if (z === undefined) throw new Error(`estadística falsa: confianza ${conf} no admitida (se esperaba 0,90, 0,95 o 0,99).`);
  return z;
}
/** Cuantil de t: tabla exacta para ν ≤ 10 y Cornish-Fisher desde ahí (corte-1.md §7). */
export function cuantilT(conf: number, nu: number): number {
  const z = zDe(conf);
  if (nu <= 10) return T_CHICOS[String(conf)][Math.max(1, Math.floor(nu)) - 1];
  return z + (z ** 3 + z) / (4 * nu) + (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * nu * nu);
}
export function wilson(exitos: number, n: number, conf: number): [number, number] {
  const z = zDe(conf), p = exitos / n, d = 1 + z * z / n;
  const centro = (p + z * z / (2 * n)) / d, semi = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return [Math.max(0, centro - semi), Math.min(1, centro + semi)];
}
export function percentil(xs: readonly number[], q: number): number {
  const o = [...xs].sort((a, b) => a - b);
  return o[Math.min(o.length - 1, Math.floor(q * o.length))];
}

function ordenar(rs: readonly ResultadoReplica[], quien: string): ResultadoReplica[] {
  if (rs.length < 2) throw new Error(`${quien}: hacen falta al menos 2 réplicas y llegaron ${rs.length} (nunca un intervalo de una sola noche).`);
  const o = [...rs].sort((a, b) => a.replica - b.replica);
  for (let i = 1; i < o.length; i++) {
    if (o[i].replica === o[i - 1].replica) throw new Error(`${quien}: la réplica ${o[i].replica} está repetida.`);
    if (o[i].modelo !== o[0].modelo) throw new Error(`${quien}: réplicas de dos modelos (${o[0].modelo} y ${o[i].modelo}).`);
  }
  return o;
}

export function resumirFalso(rs: ResultadoReplica[], kpi: KpiId, confianza: number): Resumen {
  const o = ordenar(rs, 'resumir');
  const x = o.map((r) => r.kpi[kpi]), n = x.length;
  const media = x.reduce((a, b) => a + b, 0) / n;
  const desvio = Math.sqrt(x.reduce((a, b) => a + (b - media) ** 2, 0) / (n - 1));
  const semiancho = cuantilT(confianza, n - 1) * desvio / Math.sqrt(n);
  const s = [...x].sort((a, b) => a - b);
  let icP90: [number, number] | null = null;
  if (n >= 20) {
    const z = zDe(confianza), c = n * 0.9, h = z * Math.sqrt(n * 0.9 * 0.1);
    icP90 = [s[Math.max(0, Math.floor(c - h))], s[Math.min(n - 1, Math.ceil(c + h))]];
  }
  return { kpi, n, media, desvio, confianza, ic: [media - semiancho, media + semiancho], semiancho, p50: percentil(x, 0.5), p90: percentil(x, 0.9),
    icP90, min: s[0], max: s[n - 1] };
}

export function proporcionFalsa(rs: ResultadoReplica[], kpi: KpiId, comparador: '<=' | '>=', umbral: number, confianza: number): Proporcion {
  if (rs.length < 1) throw new Error('proporcion: no hay réplicas.');
  const exitos = rs.filter((r) => (comparador === '<=' ? r.kpi[kpi] <= umbral : r.kpi[kpi] >= umbral)).length;
  return { exitos, n: rs.length, p: exitos / rs.length, ic: wilson(exitos, rs.length, confianza), metodo: 'wilson', confianza };
}

export function compararFalso(a: ResultadoReplica[], b: ResultadoReplica[], kpi: KpiId, confianza: number): Comparacion {
  if (META_KPI[kpi].mejor === 'neutro') throw new Error(`comparar: «${kpi}» no tiene un sentido mejor (es neutro).`);
  const A = ordenar(a, 'comparar'), B = ordenar(b, 'comparar');
  if (A.length !== B.length || A.some((r, i) => r.replica !== B[i].replica || r.semilla !== B[i].semilla)) {
    throw new Error('comparar: A y B no tienen exactamente las mismas (semilla, réplica).');
  }
  const z = A.map((r, i) => B[i].kpi[kpi] - r.kpi[kpi]), n = z.length;
  const media = z.reduce((x, y) => x + y, 0) / n;
  const de = Math.sqrt(z.reduce((x, y) => x + (y - media) ** 2, 0) / (n - 1));
  const semi = cuantilT(confianza, n - 1) * de / Math.sqrt(n);
  const ic: [number, number] = [media - semi, media + semi];
  const menos = META_KPI[kpi].mejor === 'menos';
  let veredicto: Comparacion['veredicto'] = 'no-se-distingue';
  if (ic[1] < 0) veredicto = menos ? 'b-mejor' : 'a-mejor';
  else if (ic[0] > 0) veredicto = menos ? 'a-mejor' : 'b-mejor';
  const replicasSugeridas = veredicto === 'no-se-distingue' && media !== 0 ? Math.ceil(n * (semi / (Math.abs(media) / 2)) ** 2) : null;
  return { kpi, n, pareada: true, media, ic, veredicto, replicasSugeridas };
}

// ---------- azar chico y estable para lo sintético (no es el azar del motor) ----------

function mezclar(a: number, b: number): number {
  let h = (Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be59b, 0xc2b2ae35)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d) >>> 0; h ^= h >>> 15; h = Math.imul(h, 0x846ca68b) >>> 0; h ^= h >>> 16;
  return h >>> 0;
}
function crearAzar(semilla: number): () => number {
  let s = semilla >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function normal(u: () => number): number { return Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u()); }

/**
 * Noches sintéticas alrededor de una noche base de la maqueta: el «día» de la réplica r sale de (semilla, r) y NO del modelo, así que A y B
 * con la misma semilla comparten la suerte (números aleatorios comunes) y la diferencia sale del modelo, como en la comparación real.
 */
export function nocheSintetica(base: ResultadoReplica, mv: ModeloValidado, semilla: number, replica: number): ResultadoReplica {
  const u = crearAzar(mezclar(semilla, replica));
  const zDia = normal(u), atraso = u() < 0.1, z2 = normal(u);
  const m = mv.modelo, inicio = horaASeg(m.calendario.inicio), corteMin = (horaASeg(m.calendario.corte) - inicio) / 60;
  const fin = Math.max(60, base.kpi.finClasificacionMin * (1 + 0.05 * zDia) + (atraso ? 22 : 0) + 3 * z2);
  const paquetes = Math.max(1, Math.round(base.kpi.paquetes * (1 + 0.04 * zDia)));
  const ritmo = paquetes / Math.max(60, fin);
  const pendientes = fin > corteMin ? Math.min(paquetes, Math.round((fin - corteMin) * ritmo * 0.9)) : 0;
  const costoNoche = base.kpi.costoNoche * (1 + 0.015 * z2) + Math.max(0, fin - base.kpi.finClasificacionMin) * 400;
  const NR = base.porRecurso.rampaMinutosLlena.length;
  const minLlena = Array.from({ length: NR }, (_, i) => Math.max(0, base.porRecurso.rampaMinutosLlena[i] * (0.6 + 0.8 * u()) + 6 * (0.6 * zDia + normal(u)) - 4 - 0.15 * i));
  const k = { ...base.kpi };
  Object.assign(k, {
    paquetes, clasificados: paquetes, pendientesAlCorte: pendientes, pctAlCorte: 100 * (paquetes - pendientes) / paquetes,
    todoAntesDelCorte: pendientes === 0 ? 1 : 0, finClasificacionMin: fin, costoNoche, costoPorPaquete: costoNoche / paquetes,
    esperaP90Min: Math.max(1, base.kpi.esperaP90Min * (1 + 0.08 * zDia)), esperaMediaMin: Math.max(1, base.kpi.esperaMediaMin * (1 + 0.06 * zDia)),
    rampasQueSeLlenaron: minLlena.filter((x) => x > 0).length, horasRampaLlena: minLlena.reduce((a, b) => a + b, 0) / 60,
  });
  return {
    ...base, semilla, replica, kpi: k, huella: mezclar(mezclar(semilla, replica), base.huella.length).toString(16).padStart(8, '0') + (mezclar(replica, 7) >>> 0).toString(16).padStart(8, '0'),
    porRecurso: { ...base.porRecurso, rampaMinutosLlena: minLlena },
    series: { filaInduccionMax: base.series.filaInduccionMax.map((x) => Math.max(0, Math.round(x * (1 + 0.12 * zDia)))), clasificados: base.series.clasificados.slice() },
  };
}

export function agregarRiesgoFalso(rs: ResultadoReplica[], kpi: KpiId): MapaRiesgo {
  const n = rs.length;
  if (n === 0) return { noches: 0, rampaProbLlena: new Float32Array(0), rampaMinutosLlenaP90: new Float32Array(0), filaP50: new Float32Array(0),
    filaP90: new Float32Array(0), finClasificacionMin: { p10: NaN, p50: NaN, p90: NaN }, nocheMediana: -1, nochePeor: -1 };
  const NR = rs[0].porRecurso.rampaMinutosLlena.length, Q = Math.max(...rs.map((r) => r.series.filaInduccionMax.length));
  const prob = new Float32Array(NR), p90 = new Float32Array(NR), f50 = new Float32Array(Q), f90 = new Float32Array(Q);
  for (let i = 0; i < NR; i++) {
    const v = rs.map((r) => r.porRecurso.rampaMinutosLlena[i] ?? 0);
    prob[i] = v.filter((x) => x > 0).length / n; p90[i] = percentil(v, 0.9);
  }
  for (let q = 0; q < Q; q++) { const v = rs.map((r) => r.series.filaInduccionMax[q] ?? 0); f50[q] = percentil(v, 0.5); f90[q] = percentil(v, 0.9); }
  const fin = rs.map((r) => r.kpi.finClasificacionMin);
  const orden = [...rs].sort((a, b) => a.kpi[kpi] - b.kpi[kpi] || a.replica - b.replica);
  const peor = META_KPI[kpi].mejor === 'mas' ? orden[0] : orden[n - 1];
  return { noches: n, rampaProbLlena: prob, rampaMinutosLlenaP90: p90, filaP50: f50, filaP90: f90,
    finClasificacionMin: { p10: percentil(fin, 0.1), p50: percentil(fin, 0.5), p90: percentil(fin, 0.9) },
    nocheMediana: orden[Math.floor(n / 2)].replica, nochePeor: peor.replica };
}

// ---------- decisión, tamizado y formulario (sintéticos) ----------

/** P(cumplir) sintética por valor de la variable: sube con la holgura de la etapa que la variable agranda. */
function probCumplir(mv: ModeloValidado, v: number): number {
  const m = mv.modelo, actual = Number(leerPuntero(m, m.decision!.variable.ruta));
  const f0 = mv.f0, capPorUnidad = f0.capacidadInduccionPorHora / Math.max(1, actual);
  const rho = f0.llegadaMediaPorHora / Math.max(1e-9, capPorUnidad * v);
  return Math.max(0, Math.min(1, 1 - (rho / 0.85) ** 10));
}

export function evaluacionSintetica(mv: ModeloValidado, replicasMax = 400): EvaluacionDecision {
  const d = mv.modelo.decision;
  if (!d) throw new Error('evaluarDecision: el modelo no tiene decisión.');
  const conf = d.confianza, meta = d.restriccion.probabilidadMinima;
  const valores: number[] = [];
  for (let v = d.variable.min; v <= d.variable.max; v++) valores.push(v);
  const n = new Map<number, number>(valores.map((v) => [v, 20]));
  const estado = (v: number) => {
    const k = n.get(v)!, ex = Math.round(probCumplir(mv, v) * k), ic = wilson(ex, k, conf);
    return { ex, ic, e: ic[0] >= meta ? 'cumple' as const : ic[1] < meta ? 'no-cumple' as const : 'en-duda' as const };
  };
  for (;;) {
    const menorCumple = valores.find((v) => estado(v).e === 'cumple') ?? Infinity;
    const enDuda = valores.filter((v) => v < menorCumple && estado(v).e === 'en-duda' && n.get(v)! < replicasMax);
    if (!enDuda.length) break;
    for (const v of enDuda) n.set(v, Math.min(replicasMax, n.get(v)! + 20));
  }
  const costoHora = 7085, base = 496000;
  const configuraciones: EvaluacionConfiguracion[] = valores.map((v) => {
    const k = n.get(v)!, s = estado(v), p = probCumplir(mv, v);
    const media = base + (40 + v * 8) * costoHora + (1 - p) * 120000;
    return {
      valor: v, prop: { exitos: s.ex, n: k, p: s.ex / k, ic: s.ic, metodo: 'wilson', confianza: conf }, estado: s.e,
      objetivo: { kpi: d.objetivo.minimizar, n: k, media, desvio: media * 0.03, confianza: conf, ic: [media * 0.99, media * 1.01], semiancho: media * 0.01,
        p50: media, p90: media * 1.04, icP90: k >= 20 ? [media * 1.02, media * 1.06] : null, min: media * 0.94, max: media * 1.08 },
    };
  });
  let recomendacion: number | null = null; let enDuda = false;
  for (const c of configuraciones) {
    if (c.estado === 'cumple') { recomendacion = c.valor; break; }
    if (c.estado === 'en-duda') { enDuda = true; break; }
  }
  const replicasUsadas = configuraciones.reduce((a, c) => a + c.prop.n, 0);
  const semaforo: Semaforo = enDuda
    ? { color: 'amarillo', motivo: 'decision-en-duda', vars: { valores: configuraciones.filter((c) => c.estado === 'en-duda').map((c) => c.valor).join(', '), replicas: replicasMax, faltan: 400 } }
    : { color: 'verde', motivo: 'ok', vars: { replicas: replicasUsadas } };
  return { decision: d.id, configuraciones, recomendacion: enDuda ? null : recomendacion, semaforo, replicasUsadas };
}

/** Importancia sintética de cada supuesto para la decisión (en pesos por noche): la inducción manda, el ausentismo pesa algo. */
const PESO_SINTETICO: Record<string, number> = { induccionBase: 52000, ausentismo: 26000, errorPronosticoCv: 9000, noLeido: 3000 };

export function tamizadoSintetico(mv: ModeloValidado): ResultadoTamizado[] {
  const ev = evaluacionSintetica(mv);
  const d = ev.recomendacion;
  return Object.entries(mv.modelo.parametros)
    .filter(([, p]) => p.incierto && p.etiqueta !== 'DATO_USUARIO')
    .map(([nombre]) => {
      const perdida = PESO_SINTETICO[nombre] ?? 0;
      const salto = perdida >= 20000 ? 1 : 0;
      return {
        parametro: nombre, decisiones: [d === null ? null : d - (perdida > 40000 ? 1 : 0), d, d === null ? null : d + salto] as [number | null, number | null, number | null],
        cambiaDecision: salto > 0, perdidaEsperada: perdida, corrimientoObjetivo: perdida * 0.4, replicas: ev.replicasUsadas * 3,
        evaluaciones: [ev, ev, ev] as [EvaluacionDecision, EvaluacionDecision, EvaluacionDecision],
      };
    })
    .sort((a, b) => b.perdidaEsperada - a.perdidaEsperada || a.parametro.localeCompare(b.parametro));
}

function cvDeParametro(p: Parametro): number {
  const v = p.valor;
  if (typeof v === 'object' && 'cv' in v) return v.cv;
  if (typeof v === 'object' && v.tipo === 'exponencial') return 1;
  return 0.5;
}
export function planMedicionFalso(parametro: string, cv: number, errorRelativo: number, segundos: number): PlanMedicion {
  const observaciones = Math.ceil((1.96 * cv / errorRelativo) ** 2);
  return { parametro, cv, errorRelativo, observaciones, minutos: Math.ceil(observaciones * segundos / 60) };
}
export function formularioSintetico(mv: ModeloValidado, ranking: ResultadoTamizado[]): Pregunta[] {
  const m = mv.modelo, umbral = m.decision?.indiferencia.valor ?? 0;
  return ranking.filter((r) => r.perdidaEsperada >= umbral && m.parametros[r.parametro]?.incierto)
    .map((r, i) => {
      const p = m.parametros[r.parametro], inc = p.incierto!;
      const dm = r.decisiones[1] ?? 0, nCambio = Math.max(...r.decisiones.map((x) => (x === null ? 0 : Math.abs(x - dm))));
      const segundos = /^s\b/.test(p.unidad) ? central(m, `@${r.parametro}`) + 10 : 10;
      return {
        parametro: r.parametro, orden: i + 1, texto: p.pregunta ?? `${r.parametro} (${p.unidad})`,
        porQue: { clave: 'explicacion.pregunta.porque.puestos', vars: { medio: inc.medio, bajo: inc.bajo, alto: inc.alto, n: nCambio },
          afirmaciones: [{ valor: inc.medio, unidad: p.unidad, decimales: 2, fuente: { tipo: 'parametro', nombre: `${r.parametro}.medio` } }] },
        referencia: { valor: central(m, `@${r.parametro}`), fuente: p.fuente, etiqueta: p.etiqueta },
        rango: [inc.bajo, inc.alto] as [number, number],
        medir: planMedicionFalso(r.parametro, cvDeParametro(p), 0.15, segundos),
        perdidaEsperada: r.perdidaEsperada,
      };
    });
}

// ---------- comprobante ----------

/** Huella agregada (corte-1.md §6.4): los dos carriles sobre los códigos de las huellas en orden de réplica. */
export function huellaAgregada(huellas: string[]): string {
  let h1 = 0x811c9dc5, h2 = 0xc2b2ae35;
  for (const h of huellas) for (let i = 0; i < h.length; i++) {
    const w = h.charCodeAt(i);
    h1 = Math.imul(h1 ^ w, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ w, 0x85ebca6b) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}
export function comprobanteFalso(mv: ModeloValidado, rs: ResultadoReplica[], semaforo: Semaforo, version: string): Comprobante {
  const o = [...rs].sort((a, b) => a.replica - b.replica);
  if (!o.length) throw new Error('comprobante: no hay réplicas.');
  o.forEach((r, i) => { if (r.replica !== i) throw new Error(`comprobante: las réplicas tienen que ser 0…N−1 sin saltos (falta la ${i}).`); });
  const proc = { hecho: 0, medido: 0, estimacion: 0, hipotesis: 0, supuesto: 0, datoUsuario: 0 };
  const sumar = (e: string) => {
    if (e === 'HECHO') proc.hecho++; else if (e === 'MEDIDO') proc.medido++; else if (e === 'ESTIMACION') proc.estimacion++;
    else if (e === 'HIPOTESIS') proc.hipotesis++; else if (e === 'SUPUESTO') proc.supuesto++; else if (e === 'DATO_USUARIO') proc.datoUsuario++;
  };
  for (const p of Object.values(mv.modelo.parametros)) sumar(p.etiqueta);
  for (const p of Object.values(mv.modelo.procedencia ?? {})) sumar(p.etiqueta);
  const errores = new Set(mv.diagnosticos.filter((d) => d.nivel === 'error').map((d) => d.codigo)).size;
  return {
    receta: { v: 1, modelo: mv.huella, motor: version, semilla: o[0].semilla, replicas: o.length },
    huellaAgregada: huellaAgregada(o.map((r) => r.huella)),
    motor: { version, pruebasExigibles: 85, pasaron: 85, fecha: '2026-10-18' },
    modelo: { controles: 18, pasaron: 18 - errores, avisos: mv.diagnosticos.filter((d) => d.nivel === 'aviso').length },
    semaforo, procedencia: proc, validacion: { estado: 'sin-validar' },
  };
}
