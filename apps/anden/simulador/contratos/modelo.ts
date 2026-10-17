// contratos/modelo.ts · CONGELADO. Esquema anden.modelo/1, familia «hub-lazo» (hub de clasificación con sorter de lazo).
// Unidades fijas en el corte 1: tiempo en segundos, largo en metros. Un campo Num o Dist acepta el valor o '@parametro'.
import type { Distribucion } from './azar.ts';
import type { Etiqueta, Hora, Seg } from './tipos-base.ts';
import type { KpiId } from './resultados.ts';

export type Ref = `@${string}`;
export type Num = number | Ref;
export type Dist = Distribucion | Ref;

export interface Parametro {
  valor: number | Distribucion;
  unidad: string;
  etiqueta: Etiqueta;
  fuente: string;
  url?: string;
  fecha: string;                     // AAAA-MM-DD de consulta
  nota?: string;
  rango?: [number, number];          // el compilador rechaza valores (o medias) fuera del rango
  /** Para el tamizado: tres valores del parámetro (o de su media / p) y sus pesos previos. Por defecto [0,25; 0,5; 0,25]. */
  incierto?: { bajo: number; medio: number; alto: number; pesos?: [number, number, number] };
  pregunta?: string;                 // en criollo, para el formulario por decisión
  golpeDiscreto?: boolean;           // faltas, fallas, lotes: el tamizado lo simula siempre
}

export interface Modelo {
  esquema: 'anden.modelo/1';
  familia: 'hub-lazo';
  id: string;
  titulo: string;
  descripcion?: string;
  autor?: string;
  licencia?: string;
  creado?: string;
  plantilla?: { id: string; version: string };
  unidades: { tiempo: 's'; largo: 'm'; moneda: 'ARS' | 'USD' };
  parametros: Record<string, Parametro>;
  /** Procedencia de valores estructurales que no son parámetros (capacidades, fracciones, layout), por JSON Pointer. */
  procedencia?: Record<string, { etiqueta: Etiqueta; fuente: string; fecha?: string }>;
  calendario: { inicio: Hora; fin: Hora; corte: Hora };
  demanda: Demanda;
  hub: Hub;
  personas: Personas;
  costos: Costos;
  decision?: Decision;
  escenarios?: Escenario[];
  experimento: Experimento;
}

export interface SerieCamiones { serie: true; cantidad: number; primero: Hora; cada: Seg; paquetes: number }
export interface Camion { id: string; turno: Hora; paquetes: number }
export interface Demanda {
  camiones: SerieCamiones | Camion[];
  desvio: Dist;                                   // s respecto del turno, se sortea por camión
  errorPronostico: { cv: Num };                   // factor del día ~ lognormal(media 1, cv), común a todos los camiones
  atrasoComun: { probabilidad: Num; demora: Dist };// golpe del día que atrasa a todos los camiones (s)
  papeleo: Num;                                   // s por camión al terminar la descarga
}

export interface Hub {
  andenes: { id: string; x: number; y: number; personas: number }[];
  playa: { capacidad: number };
  /** Cinta del andén a la acumulación: largo = largo de la polilínea; separación mínima `paso` (m) entre paquetes al entrar. */
  cintas: { id: string; desde: string; velocidad: number; paso: number; puntos: [number, number][] }[];
  /** Cinta con acumulación antes de la inducción: capacidad = floor(largo / paso) paquetes. Si se llena, los andenes paran. */
  acumulacion: { largo: number; paso: number; x: number; y: number };
  sorter: Sorter;
  induccion: { puestos: { id: string; s: number }[]; tiempo: Dist };   // tiempo base por paquete (s), sorteado al nacer
  rampas: { id: string; s: number; lado: -1 | 1; capacidad: number }[];
  excepcion: { id: string; s: number };
  planClasificacion: { rutas: { id: string; peso: number; rampas: string[] }[]; multiRampa: 'alternar' | 'la-menos-llena' };
  perfilPaquete: { clases: { id: string; fraccion: number; bandejas: 1 | 2; transportable: boolean }[] };
  jaulas: { capacidad: number; cierre: Num };
}

export interface Sorter {
  id: string;
  tipo: 'bandeja-basculante' | 'banda-cruzada';
  forma: 'estadio';
  recta: number;
  radio: number;
  origen: [number, number];
  paso: number;
  velocidad: number;
  maxVueltas: number;
  lector: { s: number; noLeido: Num };
  paradas: { activas: boolean; entre: Dist; duracion: Dist };   // micro-paradas: tiempo en marcha entre paradas y duración (s)
}

export interface Pausas { duracion: Seg; cada: Seg; primera: Seg; escalon: Seg }
export interface Personas {
  induccion: {
    puestosActivos: number;          // cuántos puestos tienen persona (≤ puestos físicos)
    temporarios: number;             // cuántos de esos son temporarios (los últimos)
    reten: number;                   // personas de retén que cubren ausencias (primero inducción, después rampa)
    antiguedadSemanas: number;       // informativo en el corte 1 (el aprendizaje por semanas es del corte 3)
    ausentismo: Num;                 // probabilidad de faltar en la noche, por persona
    eficienciaTemporario: Num;       // productividad relativa de un temporario (multiplica la tasa)
    pausas: Pausas;
  };
  descarga: { ritmo: Dist };          // s por paquete por persona de andén
  rampa: {
    cantidad: number;
    asignacion: 'por-volumen' | 'contiguas' | string[][];
    regla: 'la-mas-llena' | 'la-que-se-llena-antes' | 'en-orden';
    manejo: Dist;                    // s por paquete de la rampa a la jaula
    caminar: Num;                    // s al cambiar de rampa
    pausas: Pausas;
    ausentismo: Num;
  };
  excepcion: { cantidad: number; tiempo: Dist };   // s por paquete en el puesto manual
  fatiga: { activa: boolean; maximo: Num; tau: Num }; // apagada por defecto (corte-1.md §5.3, doble conteo)
}

export interface Costos { horaPersona: Num; fijoNoche: Num; moneda: 'ARS' | 'USD' }

export interface Decision {
  id: string;
  pregunta: string;
  tipo: 'dotacion';
  /** JSON Pointer (RFC 6901) a un entero del modelo, p. ej. '/personas/induccion/puestosActivos'. */
  variable: { ruta: string; min: number; max: number };
  /** P(kpi comparador umbral) ≥ probabilidadMinima. */
  restriccion: { kpi: KpiId; comparador: '<=' | '>='; umbral: number; probabilidadMinima: number; dichoComo: string };
  objetivo: { minimizar: KpiId };
  indiferencia: { kpi: KpiId; valor: number };
  confianza: number;
}

export type OpParche =
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }
  | { op: 'test'; path: string; value: unknown };

export interface Escenario { id: string; titulo: string; parche: OpParche[] }

export interface Experimento {
  semilla: number;
  replicasMin: number;
  replicasMax: number;
  confianza: number;
  precision?: { kpi: KpiId; relativa: number };
  nochesEscena: number;
  nocheMostrada: 'mediana' | 'peor' | number;
  kpiNoche: KpiId;                    // con qué KPI se ordenan las noches para elegir la mediana y la peor
}

/** Diagnóstico del compilador: el texto sale de i18n con la clave y las variables. */
export interface Diagnostico {
  codigo: string;                     // p. ej. 'E-UNIDAD', 'E-REF', 'A-RHO', 'A-LITTLE'
  nivel: 'error' | 'aviso' | 'info';
  ruta: string;                       // JSON Pointer al campo
  clave: string;                      // clave i18n
  vars?: Record<string, string | number>;
}

/** Borrador analítico (F0): cuentas de capacidad que salen en microsegundos y sirven de alarma, nunca de respuesta. */
export interface EstimacionF0 {
  llegadaMediaPorHora: number;
  capacidadDescargaPorHora: number;
  capacidadInduccionPorHora: number;
  capacidadSorterTeoricaPorHora: number;   // velocidad / paso · 3600
  capacidadRampasPorHora: number;
  cuello: 'descarga' | 'induccion' | 'sorter' | 'rampas';
  utilizacion: { descarga: number; induccion: number; sorter: number; rampas: number };
  finEstimado: Hora;                       // con capacidades medias, sin azar
}

export interface ModeloValidado {
  modelo: Modelo;
  huella: string;                          // SHA-256 del JSON canónico, 16 hex
  diagnosticos: Diagnostico[];
  f0: EstimacionF0;
}

/** Compila un modelo (texto ya parseado, entrada no confiable): valida, normaliza, chequea y calcula F0 y la huella. */
export type Compilar = (x: unknown) => Promise<{ ok: true; mv: ModeloValidado } | { ok: false; diagnosticos: Diagnostico[] }>;
/** Aplica un parche y vuelve a compilar: así se arman los escenarios, las variantes de la decisión y los contrafactuales. */
export type Variante = (mv: ModeloValidado, parche: OpParche[]) => Promise<ModeloValidado>;
export type CalcularF0 = (m: Modelo) => EstimacionF0;
/** Para compartir: renombra rutas, rampas y personas, escala volúmenes y redondea costos de forma determinista con la semilla. */
export type Anonimizar = (m: Modelo, semilla: number) => Modelo;
/** Presupuesto estimado ANTES de correr (para rechazar entradas que colgarían el teléfono de quien abre un enlace). */
export type EstimarPresupuesto = (m: Modelo) => { paquetes: number; eventos: number };
