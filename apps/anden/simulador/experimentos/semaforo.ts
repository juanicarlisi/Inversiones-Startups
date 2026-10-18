// experimentos/semaforo.ts · Andén simulador, corte 1, P5.
// El semáforo de un resultado (corte-1.md §7). Orden de evaluación, de lo más grave a lo más leve:
//   rojo     modelo-con-errores · conservacion · invariante · inestable   (no se muestran números)
//   amarillo fuera-de-dominio · decision-en-duda · pocas-replicas · precision-no-lograda
//   verde    ok
// `fuera-de-dominio` no está en la tabla de §7 pero sí en el contrato (MotivoSemaforo): se evalúa primero entre los amarillos
// porque quita valor a todo lo demás (diseno-maestro.md §7.10.10). El texto de cada motivo es la clave `experimentos.semaforo.<motivo>`
// con las variables de `vars` (ver textos.es.json). Este módulo no escribe frases: devuelve el motivo y los datos.
import type { Diagnostico, ModeloValidado } from '../contratos/modelo.ts';
import type { KpiId, ResultadoReplica } from '../contratos/resultados.ts';
import type { MotivoSemaforo, Semaforo } from '../contratos/experimentos.ts';
import { resumirNumeros } from './estadistica/resumen.ts';

/** Con menos réplicas que estas, el semáforo avisa (corte-1.md §7: «Menos de 20 réplicas»). */
export const MINIMO_REPLICAS = 20;

export interface EntradaSemaforo {
  /** Diagnósticos del compilador (`ModeloValidado.diagnosticos`, o los de un rechazo). Cualquiera con nivel 'error' pone el semáforo en rojo. */
  diagnosticos?: readonly Diagnostico[];
  /** Las réplicas de las que sale el resultado: de acá salen las alertas (y la precisión). */
  resultados?: readonly ResultadoReplica[];
  /** Cantidad de réplicas por configuración. Si falta, es `resultados.length`. En una decisión: el mínimo entre las configuraciones. */
  replicas?: number;
  /** Mínimo de réplicas para no avisar. Por defecto 20. */
  minimoReplicas?: number;
  /** Confianza para medir la precisión (0,90 · 0,95 · 0,99). Por defecto 0,95. */
  confianza?: number;
  /** `experimento.precision` del modelo: el semiancho relativo del IC de t de ese KPI no debe pasar de `relativa` (0,05 = ±5%). */
  precision?: { kpi: KpiId; relativa: number };
  /** Valores de la variable de decisión que siguen en duda al llegar al máximo de réplicas y los que faltarían (null si no se puede estimar). */
  decisionEnDuda?: { valores: readonly number[]; faltan: number | null };
  /** Razones por las que el resultado cae fuera del dominio de validez del modelo (p. ej. «F2 con ρ de inducción > 0,5»). */
  fueraDeDominio?: readonly string[];
}

export const COLOR_DE_MOTIVO: Record<MotivoSemaforo, Semaforo['color']> = {
  'modelo-con-errores': 'rojo', conservacion: 'rojo', invariante: 'rojo', inestable: 'rojo',
  'fuera-de-dominio': 'amarillo', 'decision-en-duda': 'amarillo', 'pocas-replicas': 'amarillo', 'precision-no-lograda': 'amarillo',
  ok: 'verde',
};

/** Clave de texto del motivo (ver textos.es.json / textos.en.json). */
export function claveSemaforo(motivo: MotivoSemaforo): string {
  return `experimentos.semaforo.${motivo}`;
}

type ClaseAlerta = 'conservacion' | 'invariante' | 'inestable';
const GRAVEDAD: ClaseAlerta[] = ['conservacion', 'invariante', 'inestable'];

/** Alertas de `ResultadoReplica.alertas`: 'conservacion', 'invariante:<nombre>', 'no-termina', 'tope-eventos', 'lazo-tiempo-cero'. */
export function clasificarAlerta(alerta: string): { clase: ClaseAlerta; detalle: string } {
  if (alerta === 'conservacion') return { clase: 'conservacion', detalle: alerta };
  if (alerta === 'no-termina' || alerta === 'tope-eventos' || alerta === 'lazo-tiempo-cero') return { clase: 'inestable', detalle: alerta };
  if (alerta.startsWith('invariante:')) return { clase: 'invariante', detalle: alerta.slice('invariante:'.length) || 'sin nombre' };
  return { clase: 'invariante', detalle: alerta };   // una alerta que no conocemos nunca se ignora: es roja
}

function redondear1(x: number): number {
  return Math.round(x * 10) / 10;
}

export function semaforo(e: EntradaSemaforo): Semaforo {
  const resultados = e.resultados ?? [];
  const n = e.replicas ?? resultados.length;

  // 1. Modelo con errores.
  const errores = (e.diagnosticos ?? []).filter((d) => d.nivel === 'error');
  if (errores.length > 0) return { color: 'rojo', motivo: 'modelo-con-errores', vars: { errores: errores.length, codigo: errores[0].codigo } };

  // 2. Alertas del motor o del modelo en alguna noche.
  const ordenadas = [...resultados].sort((a, b) => a.replica - b.replica);
  const porClase = new Map<ClaseAlerta, { afectadas: number; primera: number; detalle: string }>();
  for (const r of ordenadas) {
    const vistas = new Set<ClaseAlerta>();
    for (const a of r.alertas ?? []) {
      const { clase, detalle } = clasificarAlerta(a);
      const previo = porClase.get(clase);
      if (!previo) porClase.set(clase, { afectadas: 1, primera: r.replica, detalle });
      else if (!vistas.has(clase)) previo.afectadas++;
      vistas.add(clase);
    }
  }
  for (const clase of GRAVEDAD) {
    const hallazgo = porClase.get(clase);
    if (!hallazgo) continue;
    const base = { afectadas: hallazgo.afectadas, replicas: ordenadas.length, replica: hallazgo.primera };
    if (clase === 'conservacion') return { color: 'rojo', motivo: 'conservacion', vars: base };
    if (clase === 'invariante') return { color: 'rojo', motivo: 'invariante', vars: { ...base, nombre: hallazgo.detalle } };
    return { color: 'rojo', motivo: 'inestable', vars: { ...base, motivo: hallazgo.detalle } };
  }

  // 3. Amarillos.
  if (e.fueraDeDominio && e.fueraDeDominio.length > 0) {
    return { color: 'amarillo', motivo: 'fuera-de-dominio', vars: { motivo: e.fueraDeDominio.join('; ') } };
  }
  if (e.decisionEnDuda && e.decisionEnDuda.valores.length > 0) {
    return {
      color: 'amarillo', motivo: 'decision-en-duda',
      vars: { valores: e.decisionEnDuda.valores.join(', '), replicas: n, faltan: e.decisionEnDuda.faltan ?? 1_000_000 },
    };
  }
  const minimo = e.minimoReplicas ?? MINIMO_REPLICAS;
  if (n < minimo) return { color: 'amarillo', motivo: 'pocas-replicas', vars: { replicas: n, minimo } };
  if (e.precision) {
    const { kpi, relativa } = e.precision;
    let lograda: number | null = null;
    if (ordenadas.length >= 2) {
      const r = resumirNumeros(ordenadas.map((x) => x.kpi[kpi]), e.confianza ?? 0.95);
      lograda = r.media !== 0 ? r.semiancho / Math.abs(r.media) : (r.semiancho === 0 ? 0 : Infinity);
    }
    if (lograda === null || !(lograda <= relativa)) {
      return {
        color: 'amarillo', motivo: 'precision-no-lograda',
        vars: { kpi, pedida: redondear1(relativa * 100), lograda: lograda === null || !Number.isFinite(lograda) ? 'sin dato' : redondear1(lograda * 100), replicas: n },
      };
    }
  }
  return { color: 'verde', motivo: 'ok', vars: { replicas: n } };
}

/**
 * Atajo para la vista de las noches: arma la entrada con lo que ya dice el modelo (sus diagnósticos, `experimento.confianza` y
 * `experimento.precision`) y las réplicas. `extra` pisa o completa cualquier campo (por ejemplo `fueraDeDominio`).
 */
export function semaforoDe(mv: ModeloValidado, resultados: readonly ResultadoReplica[], extra: Partial<EntradaSemaforo> = {}): Semaforo {
  const e = mv.modelo.experimento;
  return semaforo({ diagnosticos: mv.diagnosticos, resultados, confianza: e.confianza, precision: e.precision, ...extra });
}
