// app/extras.ts · Andén simulador, corte 1 · P8 (interfaz).
// Lo que la interfaz necesita y el contrato de Servicios no trae (NOTAS-CONTRATO.md §3 y §4): los estilos de la escena y el semáforo de un
// conjunto de noches. Son OPCIONALES: si la integración los agrega al objeto de servicios se usan; si no, la interfaz usa su paleta de
// respaldo (ui/paleta.ts) y el semáforo local de abajo, que sigue la tabla de corte-1.md §7 con las mismas variables que experimentos/.
import type { Servicios } from '../contratos/servicios.ts';
import type { Estilo } from '../contratos/vistas.ts';
import type { ModeloValidado } from '../contratos/modelo.ts';
import type { ResultadoReplica } from '../contratos/resultados.ts';
import type { Resumir, Semaforo } from '../contratos/experimentos.ts';

export interface ExtrasServicios {
  /** Los estilos de la escena (escena/indice.ts: `estilos`). */
  estilos?: { claro: Estilo; oscuro: Estilo };
  /** El semáforo de experimentos/ para un conjunto de noches (experimentos/semaforo.ts: `semaforoDe`). */
  semaforoDe?: (mv: ModeloValidado, resultados: ResultadoReplica[]) => Semaforo;
}
export type ServiciosApp = Servicios & ExtrasServicios;

/** Mínimo de noches para decidir (corte-1.md §7). */
export const MINIMO_REPLICAS = 20;

/** ¿El error es una cancelación (el usuario cambió algo) y no una falla? experimentos/ rechaza con un error llamado ErrorCancelado. */
export function esCancelacion(e: unknown): boolean {
  return !!e && typeof e === 'object' && ((e as { name?: string }).name === 'ErrorCancelado' || (e as { cancelado?: boolean }).cancelado === true);
}

/**
 * Semáforo de un conjunto de noches según corte-1.md §7 (orden: rojo por errores del modelo, conservación, invariantes e inestabilidad;
 * amarillo por pocas réplicas o precisión no lograda; si no, verde). Lo usa la interfaz solo si los servicios no traen `semaforoDe`.
 */
export function semaforoLocal(mv: ModeloValidado, rs: readonly ResultadoReplica[], resumir: Resumir): Semaforo {
  const errores = mv.diagnosticos.filter((d) => d.nivel === 'error');
  if (errores.length) return { color: 'rojo', motivo: 'modelo-con-errores', vars: { errores: errores.length, codigo: errores[0].codigo } };
  const replicas = rs.length;
  const conAlerta = (f: (a: string) => boolean) => rs.filter((r) => r.alertas.some(f)).sort((a, b) => a.replica - b.replica);
  const cons = conAlerta((a) => a === 'conservacion');
  if (cons.length) return { color: 'rojo', motivo: 'conservacion', vars: { afectadas: cons.length, replicas, replica: cons[0].replica + 1 } };
  const inv = conAlerta((a) => a.startsWith('invariante'));
  if (inv.length) {
    const nombre = inv[0].alertas.find((a) => a.startsWith('invariante')) ?? 'invariante';
    return { color: 'rojo', motivo: 'invariante', vars: { afectadas: inv.length, replicas, nombre, replica: inv[0].replica + 1 } };
  }
  const ines = conAlerta((a) => a === 'no-termina' || a === 'tope-eventos' || a === 'lazo-tiempo-cero');
  if (ines.length) {
    const motivo = ines[0].alertas.find((a) => a === 'no-termina' || a === 'tope-eventos' || a === 'lazo-tiempo-cero') ?? 'no-termina';
    return { color: 'rojo', motivo: 'inestable', vars: { afectadas: ines.length, replicas, motivo, replica: ines[0].replica + 1 } };
  }
  const otras = conAlerta(() => true);
  if (otras.length) return { color: 'rojo', motivo: 'invariante', vars: { afectadas: otras.length, replicas, nombre: otras[0].alertas[0], replica: otras[0].replica + 1 } };
  if (replicas < MINIMO_REPLICAS) return { color: 'amarillo', motivo: 'pocas-replicas', vars: { replicas, minimo: MINIMO_REPLICAS } };
  const pr = mv.modelo.experimento.precision;
  if (pr && replicas >= 2) {
    const r = resumir([...rs], pr.kpi, mv.modelo.experimento.confianza);
    const lograda = Math.abs(r.media) > 0 ? r.semiancho / Math.abs(r.media) : Infinity;
    if (lograda > pr.relativa) {
      return { color: 'amarillo', motivo: 'precision-no-lograda', vars: { pedida: Math.round(pr.relativa * 1000) / 10, kpi: pr.kpi, replicas,
        lograda: Number.isFinite(lograda) ? Math.round(lograda * 1000) / 10 : 100 } };
    }
  }
  return { color: 'verde', motivo: 'ok', vars: { replicas } };
}
