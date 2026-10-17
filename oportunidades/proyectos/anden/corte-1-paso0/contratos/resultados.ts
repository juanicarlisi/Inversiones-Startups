// contratos/resultados.ts · CONGELADO. Indicadores de una réplica (una noche) del hub.
export const KPIS = [
  'paquetes', 'clasificados', 'pendientesAlCorte', 'pctAlCorte', 'todoAntesDelCorte', 'finClasificacionMin',
  'recirculacionPct', 'vueltasExtra', 'noLeidosPct', 'aExcepcion', 'esperaMediaMin', 'esperaP50Min', 'esperaP90Min',
  'utilInduccionPct', 'inductoresPresentes', 'ausentes', 'horasRampaLlena', 'rampasQueSeLlenaron', 'paradasLazo',
  'minutosLazoDetenido', 'esperaPlayaMediaMin', 'horasPersonaPagadas', 'costoNoche', 'costoPorPaquete',
] as const;
export type KpiId = (typeof KPIS)[number];
/** Unidad y sentido de cada KPI (para textos, semáforo y comparaciones). */
export const META_KPI: Record<KpiId, { unidad: string; mejor: 'mas' | 'menos' | 'neutro' }> = {
  paquetes: { unidad: 'paquetes', mejor: 'neutro' }, clasificados: { unidad: 'paquetes', mejor: 'mas' },
  pendientesAlCorte: { unidad: 'paquetes', mejor: 'menos' }, pctAlCorte: { unidad: '%', mejor: 'mas' },
  todoAntesDelCorte: { unidad: '0/1', mejor: 'mas' }, finClasificacionMin: { unidad: 'min desde el inicio', mejor: 'menos' },
  recirculacionPct: { unidad: '%', mejor: 'menos' }, vueltasExtra: { unidad: 'vueltas', mejor: 'menos' },
  noLeidosPct: { unidad: '%', mejor: 'menos' }, aExcepcion: { unidad: 'paquetes', mejor: 'menos' },
  esperaMediaMin: { unidad: 'min', mejor: 'menos' }, esperaP50Min: { unidad: 'min', mejor: 'menos' },
  esperaP90Min: { unidad: 'min', mejor: 'menos' }, utilInduccionPct: { unidad: '%', mejor: 'neutro' },
  inductoresPresentes: { unidad: 'personas', mejor: 'neutro' }, ausentes: { unidad: 'personas', mejor: 'menos' },
  horasRampaLlena: { unidad: 'h', mejor: 'menos' }, rampasQueSeLlenaron: { unidad: 'rampas', mejor: 'menos' },
  paradasLazo: { unidad: 'paradas', mejor: 'menos' }, minutosLazoDetenido: { unidad: 'min', mejor: 'menos' },
  esperaPlayaMediaMin: { unidad: 'min', mejor: 'menos' }, horasPersonaPagadas: { unidad: 'h', mejor: 'menos' },
  costoNoche: { unidad: 'moneda del modelo', mejor: 'menos' }, costoPorPaquete: { unidad: 'moneda del modelo por paquete', mejor: 'menos' },
};
export interface ResultadoReplica {
  modelo: string;        // huella del modelo
  semilla: number;
  replica: number;
  huella: string;        // huella de la corrida
  kpi: Record<KpiId, number>;
  /** Por recurso, en el orden del modelo (rampas, personas, puestos). */
  porRecurso: {
    rampaRecibidos: number[];
    rampaVueltas: number[];
    rampaMinutosLlena: number[];
    personaOcupadaPct: number[];
    puestoInducidos: number[];
  };
  /** Series por cuarto de hora desde el inicio del turno. */
  series: {
    filaInduccionMax: number[];   // máximo de paquetes en la acumulación en cada cuarto de hora
    clasificados: number[];       // paquetes que entraron a la jaula en cada cuarto de hora
  };
  /**
   * Alertas del modelo en esta noche (el semáforo las pasa a rojo): 'conservacion' (entraron ≠ salieron + adentro),
   * 'invariante:<nombre>' (p. ej. 'invariante:rampa-capacidad'), 'no-termina' (quedó trabajo al llegar al horizonte),
   * 'tope-eventos', 'lazo-tiempo-cero'. Vacío si todo está bien.
   */
  alertas: string[];
  eventos: number;
  /** Informativo: nunca entra a la huella ni a la comparación. */
  msCalculo?: number;
}
