// experimentos/comprobante.ts · Andén simulador, corte 1, P5.
// El comprobante de un resultado: la receta para reproducirlo, la huella agregada de las réplicas, qué motor y qué modelo lo
// produjeron, el semáforo, de dónde salen los parámetros y el estado de la validación (corte-1.md §7, «Comprobante»).
// Tres sellos que no se mezclan (diseno-maestro.md §5.9): REPRODUCIDO (la huella), VERIFICADO (el motor contra la teoría)
// y VALIDADO (contra datos reales). En el corte 1 la validación es siempre 'sin-validar'.
import type { ArmarComprobante, Comprobante, Receta, Semaforo } from '../contratos/experimentos.ts';
import type { Diagnostico, ModeloValidado } from '../contratos/modelo.ts';
import type { Etiqueta } from '../contratos/tipos-base.ts';
import { ordenarPorReplica } from './estadistica/resumen.ts';

/** Los controles estáticos del compilador (corte-1.md §9, P3). Un control «pasa» si no dejó ningún diagnóstico de nivel error. */
export const CODIGOS_DE_CONTROL: readonly string[] = [
  'E-ESQUEMA', 'E-REF', 'E-RANGO', 'E-ID-DUPLICADO', 'E-S-FUERA-DEL-LAZO', 'E-RANURA-REPETIDA', 'E-FRACCIONES', 'A-PESOS', 'E-PUESTOS',
  'E-TEMPORARIOS', 'E-HORAS', 'E-PAUSAS', 'E-RAMPA-SIN-PERSONA', 'E-RUTA-SIN-RAMPA', 'E-PRESUPUESTO', 'A-RHO', 'A-CORTE-IMPOSIBLE',
  'I-SUPUESTOS',
];

const hex8 = (x: number): string => (x >>> 0).toString(16).padStart(8, '0');

/**
 * Huella agregada (§6.4): los mismos dos carriles de la huella de la corrida, aplicados a los códigos de los caracteres de las
 * huellas por réplica, en orden de índice de réplica. Cambiar una sola réplica cambia la huella agregada.
 */
export function huellaAgregada(huellasEnOrden: readonly string[]): string {
  let h1 = 0x811c9dc5, h2 = 0xc2b2ae35;
  for (const huella of huellasEnOrden) {
    for (let i = 0; i < huella.length; i++) {
      const w = huella.charCodeAt(i);
      h1 = Math.imul(h1 ^ w, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ w, 0x85ebca6b) >>> 0;
      h2 = (h2 ^ (h2 >>> 13)) >>> 0;
    }
  }
  return hex8(h1) + hex8(h2);
}

const CLAVE_PROCEDENCIA: Record<Etiqueta, keyof Comprobante['procedencia']> = {
  HECHO: 'hecho', MEDIDO: 'medido', ESTIMACION: 'estimacion', HIPOTESIS: 'hipotesis', SUPUESTO: 'supuesto', DATO_USUARIO: 'datoUsuario',
};

export function contarProcedencia(mv: ModeloValidado): Comprobante['procedencia'] {
  const cuenta: Comprobante['procedencia'] = { hecho: 0, medido: 0, estimacion: 0, hipotesis: 0, supuesto: 0, datoUsuario: 0 };
  for (const [nombre, parametro] of Object.entries(mv.modelo.parametros)) {
    const clave = CLAVE_PROCEDENCIA[parametro.etiqueta];
    if (!clave) throw new Error(`el parámetro «${nombre}» trae una etiqueta de procedencia desconocida: «${String(parametro.etiqueta)}»`);
    cuenta[clave]++;
  }
  return cuenta;
}

export function contarControles(diagnosticos: readonly Diagnostico[]): Comprobante['modelo'] {
  // Integración (integracion/NOTAS-CONTRATO.md §1): si el compilador informa su propio catálogo (I-CONTROLES, modelo/chequeos.ts:
  // CONTROLES), ese es el total de controles; así el comprobante dice lo mismo que el compilador. Los informativos no son controles.
  const resumen = diagnosticos.find((d) => d.codigo === 'I-CONTROLES' && typeof d.vars?.controles === 'number');
  if (resumen) {
    const controles = resumen.vars!.controles as number;
    const conError = new Set(diagnosticos.filter((d) => d.nivel === 'error').map((d) => d.codigo));
    return { controles, pasaron: Math.max(0, controles - conError.size), avisos: diagnosticos.filter((d) => d.nivel === 'aviso').length };
  }
  const codigos = new Set(CODIGOS_DE_CONTROL);
  for (const d of diagnosticos) codigos.add(d.codigo);                      // un control que el compilador agregue también cuenta
  const conError = new Set(diagnosticos.filter((d) => d.nivel === 'error').map((d) => d.codigo));
  return {
    controles: codigos.size,
    pasaron: codigos.size - conError.size,
    avisos: diagnosticos.filter((d) => d.nivel === 'aviso').length,
  };
}

export const armarComprobante: ArmarComprobante = async (mv, rs, semaforo: Semaforo, motor, recetaParcial) => {
  if (rs.length === 0) throw new Error('armarComprobante: no hay réplicas; un comprobante sin resultados no certifica nada');
  const orden = ordenarPorReplica(rs, 'armarComprobante');
  for (let i = 0; i < orden.length; i++) {
    const r = orden[i];
    if (r.modelo !== mv.huella) {
      throw new Error(`armarComprobante: la réplica ${r.replica} es del modelo ${r.modelo} y el comprobante es del modelo ${mv.huella}`);
    }
    if (r.semilla !== recetaParcial.semilla) {
      throw new Error(`armarComprobante: la réplica ${r.replica} usó la semilla ${r.semilla} y la receta dice ${recetaParcial.semilla}`);
    }
    if (r.replica !== i) {
      throw new Error(`armarComprobante: las réplicas tienen que ser 0 a ${orden.length - 1} sin saltos para que la receta las reproduzca; en el lugar ${i} llegó la réplica ${r.replica}`);
    }
  }
  if (recetaParcial.replicas !== orden.length) {
    throw new Error(`armarComprobante: la receta dice ${recetaParcial.replicas} réplicas y llegaron ${orden.length}`);
  }
  const receta: Receta = { v: 1, modelo: mv.huella, motor: motor.version, semilla: recetaParcial.semilla, replicas: recetaParcial.replicas };
  if (recetaParcial.noche !== undefined) receta.noche = recetaParcial.noche;
  if (recetaParcial.t !== undefined) receta.t = recetaParcial.t;
  if (recetaParcial.vel !== undefined) receta.vel = recetaParcial.vel;
  if (recetaParcial.esc !== undefined) receta.esc = [...recetaParcial.esc];
  return {
    receta,
    huellaAgregada: huellaAgregada(orden.map((r) => r.huella)),
    motor: { ...motor },
    modelo: contarControles(mv.diagnosticos),
    semaforo,
    procedencia: contarProcedencia(mv),
    validacion: { estado: 'sin-validar' },
  };
};
