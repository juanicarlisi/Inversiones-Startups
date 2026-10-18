// experimentos/en-proceso.ts · Andén simulador, corte 1, P5.
// Trabajador en el mismo hilo (Node y pruebas): habla el protocolo de mensajes-worker.ts pero corre el simulador acá mismo.
// Entre réplica y réplica cede el hilo con setTimeout(0): así un `cancelar` o un `terminar()` que llega mientras tanto se atiende
// antes de empezar la réplica siguiente (en un Worker real la cancelación inmediata es terminar el Worker; esto la imita).
import type { FabricaTrabajador, PuertoTrabajador, Simulador, TrabajadorEnProceso } from '../contratos/experimentos.ts';
import type { MensajeAlTrabajador, MensajeDelTrabajador } from '../contratos/mensajes-worker.ts';

type Correr = Extract<MensajeAlTrabajador, { tipo: 'correr' }>;

export interface OpcionesEnProceso {
  /** Cada cuántas réplicas ceder el hilo. Por defecto 1 (después de cada una, como pide la especificación). */
  cederCada?: number;
}

export function trabajadorEnProcesoCon(sim: Simulador, motor: string, opciones: OpcionesEnProceso = {}): FabricaTrabajador {
  const cederCada = Math.max(1, Math.floor(opciones.cederCada ?? 1));
  return (): PuertoTrabajador => {
    let receptor: ((m: MensajeDelTrabajador) => void) | null = null;
    let vivo = true;
    let corriendo: Correr | null = null;
    let temporizador: ReturnType<typeof setTimeout> | null = null;
    const cola: Correr[] = [];
    const cancelados = new Set<string>();

    const decir = (m: MensajeDelTrabajador): void => { if (vivo && receptor) receptor(m); };
    const mensajeDe = (e: unknown): string => (e instanceof Error ? e.message : String(e));

    function siguienteTrabajo(): void {
      if (!vivo || corriendo || cola.length === 0) return;
      const m = cola.shift()!;
      corriendo = m;
      programar(() => paso(m, m.desde, 0));
    }
    function programar(f: () => void): void {
      temporizador = setTimeout(() => { temporizador = null; f(); }, 0);
    }
    /** Corre la réplica `r` (y las siguientes hasta ceder) del trabajo `m`. */
    function paso(m: Correr, r: number, hechas: number): void {
      if (!vivo) return;
      if (cancelados.has(m.id)) { cancelados.delete(m.id); corriendo = null; decir({ tipo: 'fin', id: m.id, completadas: hechas }); siguienteTrabajo(); return; }
      if (r >= m.hasta) { corriendo = null; decir({ tipo: 'fin', id: m.id, completadas: hechas }); siguienteTrabajo(); return; }
      let salida;
      try {
        salida = sim(m.mv, m.semilla, r, { traza: m.traza });
      } catch (e) {
        corriendo = null;
        decir({ tipo: 'error', id: m.id, mensaje: mensajeDe(e) });
        siguienteTrabajo();
        return;
      }
      decir(salida.traza ? { tipo: 'resultado', id: m.id, resultado: salida.resultado, traza: salida.traza }
                         : { tipo: 'resultado', id: m.id, resultado: salida.resultado });
      const total = hechas + 1;
      if (total % cederCada === 0 || r + 1 >= m.hasta) programar(() => paso(m, r + 1, total));
      else paso(m, r + 1, total);
    }

    return {
      enviar(m) {
        if (!vivo) return;
        if (m.tipo === 'correr') {
          if (!Number.isInteger(m.desde) || !Number.isInteger(m.hasta) || m.desde < 0 || m.hasta < m.desde) {
            programar(() => decir({ tipo: 'error', id: m.id, mensaje: `rango de réplicas inválido [${m.desde}, ${m.hasta})` }));
            return;
          }
          cola.push(m);
          siguienteTrabajo();
        } else if (m.tipo === 'cancelar') {
          const i = cola.findIndex((c) => c.id === m.id);
          if (i >= 0) cola.splice(i, 1);                       // todavía no había empezado: se descarta sin responder
          else if (corriendo?.id === m.id) cancelados.add(m.id);
        } else if (m.tipo === 'sonda') {
          programar(() => decir({ tipo: 'listo', motor }));
        }
      },
      alRecibir(f) { receptor = f; },
      terminar() {
        vivo = false;
        if (temporizador) { clearTimeout(temporizador); temporizador = null; }
        cola.length = 0;
        corriendo = null;
      },
    };
  };
}

/** Trabajador en proceso con la firma del contrato (cede el hilo después de cada réplica). */
export const trabajadorEnProceso: TrabajadorEnProceso = (sim, motor) => trabajadorEnProcesoCon(sim, motor);
