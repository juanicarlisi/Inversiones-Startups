// contratos/servicios.ts · CONGELADO. La única puerta de la interfaz (app/) hacia el resto. La arma la integración
// (integracion/puente.ts) con los Workers; la interfaz se desarrolla con una versión falsa sobre la maqueta (app/servicios-falsos.ts).
import type { Anonimizar, Compilar, ModeloValidado, OpParche, Variante } from './modelo.ts';
import type { CodecEnlace } from './escena.ts';
import type { GeometriaDe, PlanBalanceado, RegistroPlantillas } from './hub.ts';
import type { Comprobante, CompararPareado, EvaluacionDecision, Prioridad, Proporcionar, Resumir, SalidaSimulacion, Semaforo } from './experimentos.ts';
import type { ResultadoReplica } from './resultados.ts';
import type { AgregarRiesgo, CrearReproductor, CrearVista, DetectarMomentos, ElegirPiso } from './vistas.ts';
import type { ArmarBiografia, Contrafactual, Frase, VerificarFrases } from './explicacion.ts';
import type { Traza } from './traza.ts';
import type { ArmarFormulario, ResultadoTamizado } from './decision.ts';

export interface Servicios {
  readonly versionMotor: string;
  readonly trabajadores: number;
  readonly plantillas: RegistroPlantillas;
  compilar: Compilar;
  variante: Variante;
  codec: CodecEnlace;
  anonimizar: Anonimizar;
  geometria: GeometriaDe;
  planBalanceado: PlanBalanceado;
  /** Una noche con traza completa (la película). */
  noche(mv: ModeloValidado, semilla: number, replica: number, prioridad: Prioridad): Promise<SalidaSimulacion>;
  /** Noches [desde, hasta) sin traza, devueltas en orden de índice; alProgreso recibe cada una apenas llega. */
  noches(mv: ModeloValidado, semilla: number, desde: number, hasta: number, prioridad: Prioridad,
    alProgreso?: (r: ResultadoReplica) => void): Promise<ResultadoReplica[]>;
  cancelarDesde(p: Prioridad): void;
  resumir: Resumir;
  proporcion: Proporcionar;
  comparar: CompararPareado;
  evaluarDecision(mv: ModeloValidado, alProgreso?: (hechas: number, maximo: number) => void): Promise<EvaluacionDecision>;
  tamizar(mv: ModeloValidado, alProgreso?: (hechos: number, total: number) => void): Promise<ResultadoTamizado[]>;
  formulario: ArmarFormulario;
  agregarRiesgo: AgregarRiesgo;
  detectarMomentos: DetectarMomentos;
  crearReproductor: CrearReproductor;
  crearVista: CrearVista;
  elegirPiso: ElegirPiso;
  biografia: ArmarBiografia;
  contrafactual(mv: ModeloValidado, semilla: number, replica: number, camion: number, indice: number,
    cambio: { clave: string; vars: Record<string, string | number>; parche: OpParche[] }): Promise<Contrafactual>;
  /** Causas confirmadas por contrafactual para un paquete de la noche mostrada (corre simulaciones: es asíncrona). */
  causas(t: Traza, mv: ModeloValidado, camion: number, indice: number): Promise<{ causas: Frase[]; contrafactuales: Contrafactual[] }>;
  verificar: VerificarFrases;
  comprobante(mv: ModeloValidado, rs: ResultadoReplica[], semaforo: Semaforo): Promise<Comprobante>;
}
