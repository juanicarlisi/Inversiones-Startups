// integracion/trabajador.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.2).
// El corazón del Worker de simulación, separado de `self` para poder probarlo en Node (pruebas/trabajador.test.ts) y en un hilo de
// worker_threads (pruebas/hilo-trabajador.ts). worker.ts lo conecta a `self.onmessage` en el navegador.
//
// Dos piezas:
//  1. `congelarMatematica(Math)`: reemplaza Math.random y la matemática nativa no exacta por funciones que lanzan (Object.defineProperty,
//     no configurables). Así, si algún día el motor o el hub usaran `Math.log` en vez de `m.mat.log`, la corrida falla en el acto en vez
//     de dar una huella distinta en otro navegador (diseño maestro §4.1.6). `Math.sin` y `Math.cos` lanzan solo MIENTRAS CORRE EL MOTOR:
//     fuera de él los necesita la geometría de la traza (contratos/geometria.ts: posEnLazo, que es solo para dibujar y nunca entra a la
//     huella). Lo controla `vigilar`, que envuelve correr y finalizar del motor.
//  2. `crearTrabajador(...)`: atiende el protocolo de contratos/mensajes-worker.ts. Corre los trabajos en orden de llegada, de a una
//     réplica, cediendo el hilo entre réplica y réplica para que un 'cancelar' se atienda enseguida, y devuelve cada resultado con las
//     columnas de la traza TRANSFERIDAS (sin copiar: 1 millón de eventos en 8 ms contra 5,1 s como objetos, diseño maestro §4.8).
import type { Simulador } from '../contratos/experimentos.ts';
import type { CrearMotor, Motor } from '../contratos/motor.ts';
import type { MensajeAlTrabajador, MensajeDelTrabajador } from '../contratos/mensajes-worker.ts';
import type { Traza } from '../contratos/traza.ts';

// ------------------------------------------------------------------------------------------------ matemática nativa congelada

/** Siempre prohibidas en un Worker de simulación (corte-1.md §1.4 y las demás trascendentes, que tampoco fija el estándar). */
export const PROHIBIDAS_SIEMPRE = [
  'random', 'log', 'exp', 'pow', 'tan', 'atan2', 'log1p', 'expm1', 'cbrt', 'hypot',
  'log10', 'log2', 'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh',
] as const;
/** Prohibidas mientras corre el motor; permitidas para dibujar la geometría (posEnLazo de contratos/geometria.ts). */
export const PROHIBIDAS_EN_EL_MOTOR = ['sin', 'cos'] as const;

let enElMotor = 0;

/** ¿Está corriendo el motor en este hilo? (adentro, Math.sin y Math.cos congelados lanzan) */
export function motorCorriendo(): boolean {
  return enElMotor > 0;
}

/** Corre `f` marcando que el motor está corriendo: adentro, Math.sin y Math.cos (congelados) lanzan. */
export function vigilar<T>(f: () => T): T {
  enElMotor++;
  try { return f(); } finally { enElMotor--; }
}

/** ¿Ya está congelada esta matemática? */
export function estaCongelada(M: Math = Math): boolean {
  const d = Object.getOwnPropertyDescriptor(M, 'random');
  return !!d && d.configurable === false && d.writable === false && (d.value as { anden?: boolean }).anden === true;
}

/**
 * Congela Math.random y la matemática nativa no exacta del objeto `M` (por defecto el `Math` global del hilo). Las funciones exactas por
 * IEEE 754 (sqrt, floor, round, min, max, abs, imul, trunc, sign, ceil, fround, clz32) siguen disponibles. Idempotente.
 */
export function congelarMatematica(M: Math = Math): void {
  if (estaCongelada(M)) return;
  const fijar = (nombre: string, f: (...a: number[]) => number) => {
    (f as { anden?: boolean }).anden = true;
    Object.defineProperty(M, nombre, { value: f, writable: false, configurable: false, enumerable: false });
  };
  for (const nombre of PROHIBIDAS_SIEMPRE) {
    fijar(nombre, () => {
      throw new Error(`Math.${nombre} está congelada en el Worker de simulación: el motor usa su matemática determinista (m.mat) y su azar por dirección (m.azar), nunca la nativa (corte-1.md §1.4)`);
    });
  }
  for (const nombre of PROHIBIDAS_EN_EL_MOTOR) {
    const nativa = (M as unknown as Record<string, (x: number) => number>)[nombre].bind(M);
    fijar(nombre, (x: number) => {
      if (enElMotor > 0) {
        throw new Error(`Math.${nombre} está congelada mientras corre el motor: dentro de la simulación se usa m.mat.${nombre} (corte-1.md §1.4); fuera de ella solo se permite para dibujar la geometría`);
      }
      return nativa(x);
    });
  }
}

/** Envuelve un CrearMotor para que su `correr`, `correrHasta` y `finalizar` corran vigilados (ver `vigilar`). */
export function motorVigilado(cm: CrearMotor): CrearMotor {
  return (o) => {
    const m = cm(o);
    const correr = m.correr.bind(m), correrHasta = m.correrHasta.bind(m), finalizar = m.finalizar.bind(m);
    // Se reemplazan los métodos en el mismo objeto (y no con un envoltorio) porque los bloques reciben este mismo motor en manejar().
    Object.defineProperty(m, 'correr', { value: () => vigilar(correr), configurable: true, writable: true });
    Object.defineProperty(m, 'correrHasta', { value: (h: number) => vigilar(() => correrHasta(h)), configurable: true, writable: true });
    Object.defineProperty(m, 'finalizar', { value: () => vigilar(finalizar), configurable: true, writable: true });
    return m as Motor;
  };
}

// ------------------------------------------------------------------------------------------------ transferir la traza

/** Los ArrayBuffer de las columnas de la traza, sin repetir (transferir dos veces el mismo buffer es un error del navegador). */
export function buffersDeTraza(t: Traza): ArrayBuffer[] {
  const vistos = new Set<ArrayBuffer>();
  const agregar = (cols: object) => {
    for (const v of Object.values(cols)) {
      if (ArrayBuffer.isView(v) && v.buffer instanceof ArrayBuffer) vistos.add(v.buffer);
    }
  };
  agregar(t.tramos);
  agregar(t.momentos);
  agregar(t.paquetes);
  return [...vistos];
}

// ------------------------------------------------------------------------------------------------ el protocolo

type Correr = Extract<MensajeAlTrabajador, { tipo: 'correr' }>;

export interface OpcionesTrabajador {
  /** Una noche (el hub de producción en el Worker real; uno falso en las pruebas). */
  simular: Simulador;
  /** Versión del motor que se contesta a la sonda. */
  version: string;
  /** Envía un mensaje al hilo de la interfaz, transfiriendo los buffers que se indiquen. */
  enviar: (m: MensajeDelTrabajador, transferir: ArrayBuffer[]) => void;
  /** Cede el hilo para que entren los mensajes pendientes (un 'cancelar'). Por defecto, un MessageChannel o setTimeout(0). */
  ceder?: () => Promise<void>;
  /** Reloj en ms para `msCalculo` (informativo: nunca entra a la huella ni a la comparación). */
  reloj?: () => number;
}

/** Cede el hilo sin el mínimo de 4 ms de setTimeout anidado (MessageChannel), o con setTimeout(0) si no hay MessageChannel. */
export function crearCeder(): () => Promise<void> {
  if (typeof MessageChannel === 'function') {
    const canal = new MessageChannel();
    const pendientes: (() => void)[] = [];
    canal.port1.onmessage = () => { pendientes.shift()?.(); };
    // En Node, un puerto con onmessage mantiene vivo el proceso: se libera cuando no hay nada pendiente.
    const puerto = canal.port1 as unknown as { unref?: () => void; ref?: () => void };
    puerto.unref?.();
    return () => new Promise<void>((r) => {
      pendientes.push(() => { if (pendientes.length === 0) puerto.unref?.(); r(); });
      puerto.ref?.();
      canal.port2.postMessage(0);
    });
  }
  return () => new Promise<void>((r) => setTimeout(r, 0));
}

function mensajeDe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Devuelve la función que atiende cada MensajeAlTrabajador. Los trabajos 'correr' se hacen de a uno, en orden de llegada. 'cancelar'
 * saca un trabajo de la cola o corta el que está corriendo antes de su réplica siguiente; en los dos casos contesta 'fin' con las
 * réplicas que alcanzó a completar. Un error del simulador contesta 'error' con su mensaje y sigue con el trabajo siguiente.
 */
export function crearTrabajador(o: OpcionesTrabajador): (m: MensajeAlTrabajador) => void {
  const ceder = o.ceder ?? crearCeder();
  const cola: Correr[] = [];
  const cancelados = new Set<string>();
  let corriendo: Correr | null = null;

  async function correrTrabajo(m: Correr): Promise<void> {
    let hechas = 0;
    for (let r = m.desde; r < m.hasta; r++) {
      if (cancelados.has(m.id)) break;
      const t0 = o.reloj?.();
      let salida;
      try {
        salida = o.simular(m.mv, m.semilla, r, { traza: m.traza });
      } catch (e) {
        o.enviar({ tipo: 'error', id: m.id, mensaje: `réplica ${r}: ${mensajeDe(e)}` }, []);
        return;
      }
      const resultado = t0 === undefined ? salida.resultado : { ...salida.resultado, msCalculo: (o.reloj?.() ?? t0) - t0 };
      if (salida.traza) {
        o.enviar({ tipo: 'resultado', id: m.id, resultado, traza: salida.traza }, buffersDeTraza(salida.traza));
      } else {
        o.enviar({ tipo: 'resultado', id: m.id, resultado }, []);
      }
      hechas++;
      await ceder();
    }
    o.enviar({ tipo: 'fin', id: m.id, completadas: hechas }, []);
  }

  async function bombear(): Promise<void> {
    if (corriendo) return;
    while (cola.length > 0) {
      const m = cola.shift()!;
      corriendo = m;
      try {
        await correrTrabajo(m);
      } finally {
        cancelados.delete(m.id);
        corriendo = null;
      }
    }
  }

  return (m) => {
    if (!m || typeof m !== 'object') return;
    switch (m.tipo) {
      case 'sonda':
        o.enviar({ tipo: 'listo', motor: o.version }, []);
        return;
      case 'cancelar': {
        const i = cola.findIndex((c) => c.id === m.id);
        if (i >= 0) { cola.splice(i, 1); o.enviar({ tipo: 'fin', id: m.id, completadas: 0 }, []); }
        else if (corriendo?.id === m.id) cancelados.add(m.id);
        return;
      }
      case 'correr':
        if (!Number.isInteger(m.desde) || !Number.isInteger(m.hasta) || m.desde < 0 || m.hasta < m.desde) {
          o.enviar({ tipo: 'error', id: m.id, mensaje: `rango de réplicas inválido: se esperaba [desde, hasta) con enteros 0 ≤ desde ≤ hasta y llegó [${m.desde}, ${m.hasta})` }, []);
          return;
        }
        cola.push(m);
        void bombear();
        return;
      default:
        // Un mensaje desconocido no se contesta: el protocolo es cerrado (contratos/mensajes-worker.ts).
        return;
    }
  };
}
