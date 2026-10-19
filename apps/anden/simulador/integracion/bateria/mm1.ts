// integracion/bateria/mm1.ts · Andén simulador, corte 1 · Integración. Una M/M/1 FIFO mínima sobre el contrato del motor, para las
// pruebas de estadística S03, S08, S09 y S11 (corte-1.md §8; en la batería y en integracion/pruebas/), que piden miles de corridas: por
// eso es un bloque chico y rápido y no la red genérica de verificacion/ (que hace mucho más y es ~3 veces más lenta en esta cola). El
// banco la usa también como referencia de eventos por segundo (§11).
//
// Azar por dirección (corte-1.md §6.3): el intervalo n-ésimo y el servicio del cliente n-ésimo no dependen del orden de los eventos.
//   intervalo   ('prueba.mm1.<id>', 'llegada')   a = n                 b = 0   c = 0
//   servicio    ('prueba.mm1.<id>', 'servicio')  a = ordinal           b = 0   c = 0 (1 para los que ya estaban en t = 0)
//   arranque    ('prueba.mm1.<id>', 'inicial')   a = 0                 b = 0   c = 0 (cantidad inicial geométrica, arranque estacionario)
// Tiempo: 1 unidad del modelo = 10⁶ ms del motor (resolución de 10⁻⁶ unidades, como la batería: verificacion/NOTAS-CONTRATO.md §3).
import { Fase } from '../../contratos/tipos-base.ts';
import type { Bloque, CrearMotor, EstadoBloque, Motor } from '../../contratos/motor.ts';
import type { Direccion, Distribucion } from '../../contratos/azar.ts';

export const MS_POR_UNIDAD = 1_000_000;

export interface ConfigMM1 {
  id: string;
  /** Tasa de llegadas y de servicio (por unidad de tiempo). */
  lambda: number;
  mu: number;
  /** Fin de la corrida y comienzo de la medición (unidades). */
  horizonte: number;
  calentamiento?: number;
  /** Clientes en el sistema en t = 0: un número fijo (arranque cargado) o 'estacionario' (geométrica de razón ρ). */
  inicial?: number | 'estacionario';
  /** Largo de los intervalos de la serie de N promedio (unidades), para MSER-5. */
  serie?: number;
  /** Guardar la estancia de cada cliente que llegó en la ventana de medición y salió antes del horizonte. */
  estancias?: boolean;
}

export interface MedidasMM1 {
  /** Cantidad media en el sistema en [calentamiento, horizonte] (promedio temporal). */
  L: number;
  estancias: number[] | null;
  serie: number[] | null;
  /** Clientes en t = 0. */
  inicial: number;
  eventos: number;
  huella: string;
}

const LLEGADA = 1, FIN = 2, SERIE = 3, CALENTAR = 4;

class BloqueMM1 implements Bloque {
  readonly ruta: string;
  private readonly c: Required<Omit<ConfigMM1, 'inicial' | 'serie'>> & { serie: number };
  private readonly kLlegada: number;
  private readonly kServicio: number;
  private readonly kInicial: number;
  // objetos reutilizados en cada sorteo (sin reservar memoria por evento)
  private readonly distLlegada: Distribucion;
  private readonly distServicio: Distribucion;
  private readonly dir: Direccion = { clave: 0, a: 0, b: 0, c: 0 };
  indice = 0;
  // estado (solo números y arreglos tipados)
  n = 0;                                  // en el sistema
  llegadas = 0;                           // ordinal de la próxima llegada
  tLlegadaUnidades = 0;                   // instante acumulado de la última llegada (unidades, sin redondear)
  fila = new Float64Array(64);            // llegada (ms) de cada cliente en el sistema, en orden FIFO (anillo)
  filaOrdinal = new Float64Array(64);     // ordinal del cliente (−1 si estaba en t = 0)
  cabeza = 0;
  area = 0;                               // ∫ N dt desde el último reinicio (ms·clientes)
  tUltimo = 0;
  areaSerie = 0;
  readonly estancias: number[] = [];
  readonly serie: number[] = [];
  inicial = 0;

  constructor(m: Motor, c: ConfigMM1) {
    this.ruta = `prueba.mm1.${c.id}`;
    this.c = { id: c.id, lambda: c.lambda, mu: c.mu, horizonte: c.horizonte, calentamiento: c.calentamiento ?? 0, estancias: c.estancias ?? false,
      serie: c.serie ?? 0 };
    this.kLlegada = m.claveDe(this.ruta, 'llegada');
    this.kServicio = m.claveDe(this.ruta, 'servicio');
    this.kInicial = m.claveDe(this.ruta, 'inicial');
    this.distLlegada = { tipo: 'exponencial', media: 1 / c.lambda };
    this.distServicio = { tipo: 'exponencial', media: 1 / c.mu };
  }

  private servicioMs(m: Motor, ordinal: number, inicial: boolean): number {
    const d = this.dir;
    d.clave = this.kServicio; d.a = ordinal; d.c = inicial ? 1 : 0;
    return Math.round(m.azar.sortear(this.distServicio, d) * MS_POR_UNIDAD);
  }
  private acumular(t: number): void {
    const d = (t - this.tUltimo) * this.n;
    this.area += d;
    this.areaSerie += d;
    this.tUltimo = t;
  }
  private poner(llegada: number, ordinal: number): void {
    const cap = this.fila.length;
    if (this.n >= cap) {
      const f = new Float64Array(cap * 2), o = new Float64Array(cap * 2);
      for (let i = 0; i < this.n; i++) { f[i] = this.fila[(this.cabeza + i) % cap]; o[i] = this.filaOrdinal[(this.cabeza + i) % cap]; }
      this.fila = f; this.filaOrdinal = o; this.cabeza = 0;
    }
    const j = (this.cabeza + this.n) % this.fila.length;
    this.fila[j] = llegada; this.filaOrdinal[j] = ordinal;
    this.n++;
  }
  private agendarLlegada(m: Motor): void {
    const d = this.dir;
    d.clave = this.kLlegada; d.a = this.llegadas; d.c = 0;
    this.tLlegadaUnidades += m.azar.sortear(this.distLlegada, d);
    const t = Math.round(this.tLlegadaUnidades * MS_POR_UNIDAD);
    if (t <= m.opciones.hasta) m.agendar(t, this.indice, LLEGADA, 0, Fase.NORMAL);
  }

  iniciar(m: Motor, inicial: number | 'estacionario'): void {
    let n0 = 0;
    if (inicial === 'estacionario') {
      const rho = this.c.lambda / this.c.mu;
      const u = m.azar.uniforme({ clave: this.kInicial, a: 0, b: 0, c: 0 });
      n0 = Math.floor(m.mat.log(u) / m.mat.log(rho));            // P(N = n) = (1 − ρ) ρⁿ
    } else n0 = inicial;
    this.inicial = n0;
    for (let i = 0; i < n0; i++) this.poner(0, -1 - i);
    if (n0 > 0) m.agendar(this.servicioMs(m, 0, true), this.indice, FIN, 0, Fase.NORMAL);
    this.agendarLlegada(m);
    if (this.c.calentamiento > 0) m.agendar(Math.round(this.c.calentamiento * MS_POR_UNIDAD), this.indice, CALENTAR, 0, Fase.TARDIA);
    if (this.c.serie > 0) {
      const k = Math.floor(this.c.horizonte / this.c.serie + 1e-9);
      for (let i = 1; i <= k; i++) m.agendar(Math.round(i * this.c.serie * MS_POR_UNIDAD), this.indice, SERIE, i, Fase.TARDIA);
    }
  }

  manejar(m: Motor, tipo: number): void {
    const t = m.ahora;
    this.acumular(t);
    if (tipo === LLEGADA) {
      const ordinal = this.llegadas++;
      this.poner(t, ordinal);
      if (this.n === 1) m.agendar(t + this.servicioMs(m, ordinal, false), this.indice, FIN, 0, Fase.NORMAL);
      this.agendarLlegada(m);
    } else if (tipo === FIN) {
      const llegada = this.fila[this.cabeza];
      this.cabeza = (this.cabeza + 1) % this.fila.length;
      this.n--;
      if (this.c.estancias && llegada >= this.c.calentamiento * MS_POR_UNIDAD) {
        this.estancias.push((t - llegada) / MS_POR_UNIDAD);
      }
      if (this.n > 0) {
        const o = this.filaOrdinal[this.cabeza];
        m.agendar(t + this.servicioMs(m, o < 0 ? -1 - o : o, o < 0), this.indice, FIN, 0, Fase.NORMAL);
      }
    } else if (tipo === CALENTAR) {
      this.area = 0;
    } else if (tipo === SERIE) {
      this.serie.push(this.areaSerie / (this.c.serie * MS_POR_UNIDAD));
      this.areaSerie = 0;
    }
  }

  estado(): EstadoBloque {
    return { n: this.n, llegadas: this.llegadas, tLlegadaUnidades: this.tLlegadaUnidades, fila: this.fila.slice(), filaOrdinal: this.filaOrdinal.slice(),
      cabeza: this.cabeza, area: this.area, tUltimo: this.tUltimo, areaSerie: this.areaSerie };
  }
  restaurar(e: EstadoBloque): void {
    this.n = e.n as number; this.llegadas = e.llegadas as number; this.tLlegadaUnidades = e.tLlegadaUnidades as number;
    this.fila = (e.fila as Float64Array).slice(); this.filaOrdinal = (e.filaOrdinal as Float64Array).slice();
    this.cabeza = e.cabeza as number; this.area = e.area as number; this.tUltimo = e.tUltimo as number; this.areaSerie = e.areaSerie as number;
  }
  finalizar(m: Motor): void {
    this.acumular(Math.max(this.tUltimo, m.opciones.hasta));
  }
  medida(): Omit<MedidasMM1, 'eventos' | 'huella'> {
    const ventana = (this.c.horizonte - this.c.calentamiento) * MS_POR_UNIDAD;
    return { L: this.area / ventana, estancias: this.c.estancias ? this.estancias : null, serie: this.c.serie > 0 ? this.serie : null, inicial: this.inicial };
  }
}

/** Una corrida de la M/M/1 con el motor que se pase. */
export function correrMM1(cm: CrearMotor, c: ConfigMM1, semilla: number, replica: number): MedidasMM1 {
  const m = cm({ semilla, replica, hasta: Math.round(c.horizonte * MS_POR_UNIDAD), traza: 'no' });
  const b = new BloqueMM1(m, c);
  b.indice = m.registrar(b);
  b.iniciar(m, c.inicial ?? 0);
  const r = m.correr();
  if (r.estado !== 'horizonte' && r.estado !== 'sin-eventos') throw new Error(`M/M/1 ${c.id}: la corrida terminó con estado ${r.estado}`);
  m.finalizar();
  return { ...b.medida(), eventos: r.eventos, huella: r.huella };
}
