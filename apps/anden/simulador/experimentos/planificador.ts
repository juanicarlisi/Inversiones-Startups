// experimentos/planificador.ts · Andén simulador, corte 1, P5.
// Planificador de réplicas (diseno-maestro.md §4.8): cola por prioridad (FIFO dentro de cada una), rangos de réplicas repartidos en
// trozos, cada resultado se entrega apenas llega, cancelación inmediata y reemplazo del trabajador que estaba en medio de un trozo
// cancelado. El planificador NO agrega: cada resultado trae su índice de réplica y quien agrega ordena por índice (`resumir`, etc.).
//
// Garantías (todas probadas en pruebas/planificador.test.ts):
//  1. Un trozo de menor número de Prioridad sale antes que cualquiera de mayor número, aunque haya llegado después.
//     No hay expropiación: un trozo que ya está corriendo termina (o se cancela).
//  2. Después de `cancelar(id)` o `cancelarDesde(p)` NUNCA llega otro resultado de ese trabajo, ni siquiera uno que el trabajador
//     ya había terminado de calcular: se ignora todo mensaje de un trabajador que se terminó.
//  3. Un trabajador que estaba corriendo un trozo cancelado se termina (`terminar()`) y se reemplaza con la fábrica, así
//     la CPU vuelve a estar libre al instante y no hay que esperar a que acabe una noche que ya nadie quiere.
//  4. Un error del simulador rechaza el `enviar` de ese trabajo (con el mensaje original) y cancela el resto del trabajo.
import { Prioridad } from '../contratos/experimentos.ts';
import type { FabricaTrabajador, Planificador, PuertoTrabajador, Trabajo } from '../contratos/experimentos.ts';
import type { MensajeDelTrabajador } from '../contratos/mensajes-worker.ts';
import type { ResultadoReplica } from '../contratos/resultados.ts';
import type { Traza } from '../contratos/traza.ts';
import { ordenarPorReplica } from './estadistica/resumen.ts';

/** Réplicas por trozo según la prioridad: 1 para la vista previa y la confirmación (el usuario espera), 5 para el resto. */
export function tamanoDeTrozo(p: Prioridad): number {
  return p === Prioridad.VISTA_PREVIA || p === Prioridad.CONFIRMACION ? 1 : 5;
}

export interface OpcionesPlanificador {
  /** Réplicas por trozo para cada prioridad. Por defecto `tamanoDeTrozo`. */
  tamanoTrozo?: (p: Prioridad) => number;
  /**
   * Cuántos trabajadores pueden estar ocupados a la vez en este momento (por defecto, todos). Lo usa el navegador para dejarle núcleos
   * al dibujo mientras corre la película (hallazgo EXP-02 de la revisión del 30-10-2026); si sube, llamar a `reactivar()`.
   */
  limite?: () => number;
}

/** El planificador con `reactivar()`: vuelve a repartir trabajo cuando el límite de trabajadores ocupados sube. */
export type PlanificadorAjustable = Planificador & { reactivar(): void };

interface Trozo {
  trabajo: Activo;
  idMensaje: string;
  desde: number;
  hasta: number;
  recibidas: number;
}
interface Activo {
  t: Trabajo;
  alResultado: (r: ResultadoReplica, traza?: Traza) => void;
  pendientes: number;          // trozos que todavía no terminaron
  entregadas: number;          // resultados ya entregados
  terminado: boolean;
  resolver: (x: { completadas: number; cancelado: boolean }) => void;
  rechazar: (e: Error) => void;
}
interface Ranura { puerto: PuertoTrabajador; trozo: Trozo | null; vivo: boolean }

const PRIORIDADES: Prioridad[] = [Prioridad.VISTA_PREVIA, Prioridad.CONFIRMACION, Prioridad.NOCHES, Prioridad.DECISION, Prioridad.TAMIZADO];

export function crearPlanificador(fabrica: FabricaTrabajador, trabajadores: number, opciones: OpcionesPlanificador = {}): PlanificadorAjustable {
  if (!Number.isInteger(trabajadores) || trabajadores < 1) {
    throw new Error(`crearPlanificador: la cantidad de trabajadores tiene que ser un entero ≥ 1 y llegó ${trabajadores}`);
  }
  const tamanoTrozo = opciones.tamanoTrozo ?? tamanoDeTrozo;
  const colas: Trozo[][] = PRIORIDADES.map(() => []);
  const activos = new Map<string, Activo>();
  const ranuras: Ranura[] = [];
  let cerrado = false;
  let contador = 0;

  function nuevaRanura(): Ranura {
    const ranura: Ranura = { puerto: fabrica(), trozo: null, vivo: true };
    ranura.puerto.alRecibir((m) => alMensaje(ranura, m));
    return ranura;
  }

  /** Termina el trabajador de la ranura i y pone otro en su lugar (salvo que el planificador ya esté cerrado). */
  function reemplazar(i: number): void {
    const vieja = ranuras[i];
    vieja.vivo = false;
    vieja.trozo = null;
    try { vieja.puerto.terminar(); } catch { /* un trabajador que no se deja terminar ya no nos importa: se ignoran sus mensajes */ }
    if (!cerrado) ranuras[i] = nuevaRanura();
  }

  function siguienteTrozo(): Trozo | null {
    for (const cola of colas) if (cola.length > 0) return cola.shift()!;
    return null;
  }

  function bombear(): void {
    if (cerrado) return;
    const limite = opciones.limite ? Math.max(1, Math.floor(opciones.limite())) : ranuras.length;
    let ocupadas = 0;
    for (const r of ranuras) if (r.vivo && r.trozo) ocupadas++;
    for (let i = 0; i < ranuras.length; i++) {
      if (ocupadas >= limite) return;
      const ranura = ranuras[i];
      if (!ranura.vivo || ranura.trozo) continue;
      const trozo = siguienteTrozo();
      if (!trozo) return;
      ranura.trozo = trozo;               // antes de enviar: un puerto que responda en el acto no puede pisar este estado
      ocupadas++;
      const t = trozo.trabajo.t;
      try {
        ranura.puerto.enviar({ tipo: 'correr', id: trozo.idMensaje, mv: t.mv, semilla: t.semilla, desde: trozo.desde, hasta: trozo.hasta, traza: t.traza });
      } catch (e) {
        fallar(trozo.trabajo, new Error(`no se pudo enviar el trabajo «${t.id}» al trabajador: ${mensajeDe(e)}`));
        return bombear();
      }
    }
  }

  /** Cierra un trabajo: lo saca de las colas, termina y reemplaza a quien lo estaba corriendo y resuelve o rechaza su promesa. */
  function cerrarTrabajo(trabajo: Activo, como: { cancelado: true } | { error: Error } | { cancelado: false }): void {
    if (trabajo.terminado) return;
    trabajo.terminado = true;
    activos.delete(trabajo.t.id);
    for (const cola of colas) {
      for (let i = cola.length - 1; i >= 0; i--) if (cola[i].trabajo === trabajo) cola.splice(i, 1);
    }
    for (let i = 0; i < ranuras.length; i++) {
      if (ranuras[i].trozo?.trabajo === trabajo) reemplazar(i);
    }
    if ('error' in como) trabajo.rechazar(como.error);
    else trabajo.resolver({ completadas: trabajo.entregadas, cancelado: como.cancelado });
  }

  function fallar(trabajo: Activo, error: Error): void { cerrarTrabajo(trabajo, { error }); }

  function alMensaje(ranura: Ranura, m: MensajeDelTrabajador): void {
    if (!ranura.vivo) return;                                  // lo que diga un trabajador terminado ya no cuenta (garantía 2)
    const trozo = ranura.trozo;
    if (!trozo || (m.tipo !== 'listo' && m.id !== trozo.idMensaje)) return;
    const trabajo = trozo.trabajo;
    if (trabajo.terminado) return;
    if (m.tipo === 'resultado') {
      trozo.recibidas++;
      trabajo.entregadas++;
      try {
        trabajo.alResultado(m.resultado, m.traza);
      } catch (e) {
        fallar(trabajo, new Error(`el receptor de resultados del trabajo «${trabajo.t.id}» lanzó un error: ${mensajeDe(e)}`));
        bombear();
      }
    } else if (m.tipo === 'fin') {
      ranura.trozo = null;
      const esperadas = trozo.hasta - trozo.desde;
      if (trozo.recibidas !== esperadas) {
        fallar(trabajo, new Error(`el trabajador terminó el trozo [${trozo.desde}, ${trozo.hasta}) del trabajo «${trabajo.t.id}» con ${trozo.recibidas} resultados y se esperaban ${esperadas}`));
      } else if (--trabajo.pendientes === 0) {
        cerrarTrabajo(trabajo, { cancelado: false });
      }
      bombear();
    } else if (m.tipo === 'error') {
      ranura.trozo = null;
      fallar(trabajo, new Error(`el simulador falló en el trabajo «${trabajo.t.id}» (réplicas ${trozo.desde} a ${trozo.hasta - 1}): ${m.mensaje}`));
      bombear();
    }
    // 'listo' (respuesta a la sonda): no cambia nada
  }

  for (let i = 0; i < trabajadores; i++) ranuras.push(nuevaRanura());

  return {
    trabajadores,
    reactivar: bombear,
    enviar(t, alResultado) {
      if (cerrado) return Promise.reject(new Error('el planificador está cerrado: no acepta trabajos nuevos'));
      if (activos.has(t.id)) return Promise.reject(new Error(`ya hay un trabajo en curso con el id «${t.id}»; cada trabajo necesita un id propio`));
      const indice = PRIORIDADES.indexOf(t.prioridad);
      if (indice < 0) return Promise.reject(new Error(`prioridad desconocida: ${String(t.prioridad)}`));
      const [desde, hasta] = t.replicas;
      if (!Number.isInteger(desde) || !Number.isInteger(hasta) || desde < 0 || hasta < desde) {
        return Promise.reject(new Error(`rango de réplicas inválido para «${t.id}»: se esperaba [desde, hasta) con enteros 0 ≤ desde ≤ hasta y llegó [${desde}, ${hasta})`));
      }
      if (hasta === desde) return Promise.resolve({ completadas: 0, cancelado: false });
      const tamano = Math.max(1, Math.floor(tamanoTrozo(t.prioridad)));
      return new Promise((resolver, rechazar) => {
        const trabajo: Activo = { t, alResultado, pendientes: 0, entregadas: 0, terminado: false, resolver, rechazar };
        for (let a = desde; a < hasta; a += tamano) {
          const b = Math.min(hasta, a + tamano);
          colas[indice].push({ trabajo, idMensaje: `${t.id}#${contador++}`, desde: a, hasta: b, recibidas: 0 });
          trabajo.pendientes++;
        }
        activos.set(t.id, trabajo);
        bombear();
      });
    },
    cancelar(id) {
      const trabajo = activos.get(id);
      if (!trabajo) return;
      cerrarTrabajo(trabajo, { cancelado: true });
      bombear();
    },
    cancelarDesde(p) {
      for (const trabajo of [...activos.values()]) if (trabajo.t.prioridad >= p) cerrarTrabajo(trabajo, { cancelado: true });
      bombear();
    },
    cerrar() {
      if (cerrado) return;
      cerrado = true;                                          // primero: así cancelar los trabajos no crea trabajadores de reemplazo
      for (const trabajo of [...activos.values()]) cerrarTrabajo(trabajo, { cancelado: true });
      for (const ranura of ranuras) {
        ranura.vivo = false;
        try { ranura.puerto.terminar(); } catch { /* ídem */ }
      }
    },
  };
}

function mensajeDe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Atajo: corre un trabajo completo y devuelve los resultados ORDENADOS POR ÍNDICE DE RÉPLICA (nunca por orden de llegada).
 * Las trazas, si el trabajo las pide, no se retienen: llegan por `alResultado`.
 */
export async function correrYAgregar(
  p: Planificador, t: Trabajo, alResultado?: (r: ResultadoReplica, traza?: Traza) => void,
): Promise<{ resultados: ResultadoReplica[]; completadas: number; cancelado: boolean }> {
  const recibidos: ResultadoReplica[] = [];
  const fin = await p.enviar(t, (r, traza) => { recibidos.push(r); alResultado?.(r, traza); });
  return { resultados: ordenarPorReplica(recibidos, `trabajo «${t.id}»`), ...fin };
}
