// app/sesion.ts · Andén simulador, corte 1 · P8 (interfaz).
// Los datos de la corrida que se está mirando y los pedidos a los servicios: el modelo validado, la noche con traza (la película), las cien
// noches sin traza, su resumen con intervalos, el semáforo y el comprobante, el escenario B de «¿y si…?» con su comparación pareada, la
// decisión y el tamizado. La interfaz nunca calcula un número: los pide acá, y acá se piden a Servicios (la única puerta, contrato).
//
// Reglas que se cumplen en este archivo:
// - nunca un intervalo con una sola noche (la vista previa muestra el valor de su noche, sin intervalo, marcada «provisoria»);
// - A y B se comparan con la misma semilla y las mismas réplicas (servicios.comparar lo exige);
// - una cancelación (el usuario movió algo) no es un error: lo que ya llegó se guarda y lo que faltaba se vuelve a pedir;
// - las noches se guardan por índice de réplica, nunca por orden de llegada.
import { Prioridad, type Comparacion, type Comprobante, type EvaluacionDecision, type Proporcion, type Receta, type Resumen,
  type SalidaSimulacion, type Semaforo } from '../contratos/experimentos.ts';
import type { ModeloValidado, OpParche } from '../contratos/modelo.ts';
import { META_KPI, type KpiId, type ResultadoReplica } from '../contratos/resultados.ts';
import type { Traza } from '../contratos/traza.ts';
import { ClaseEntidad } from '../contratos/traza.ts';
import type { MapaRiesgo, MomentoEscena, Reproductor } from '../contratos/vistas.ts';
import type { Biografia, Contrafactual, Frase } from '../contratos/explicacion.ts';
import type { Pregunta, ResultadoTamizado } from '../contratos/decision.ts';
import type { Enlace } from '../contratos/escena.ts';
import { esCancelacion, semaforoLocal, type ServiciosApp } from './extras.ts';
import type { Almacen, CualNoche, Perillas } from './estado.ts';
import { hayCambios } from './estado.ts';

/** Noches de la confirmación pareada de «¿y si…?» (corte-1.md §9 P8.5). */
export const NOCHES_CONFIRMACION = 40;
/** KPI que se comparan en la pantalla dividida, en este orden. */
export const KPI_COMPARACION: readonly KpiId[] = ['costoPorPaquete', 'pendientesAlCorte', 'finClasificacionMin', 'esperaP90Min'];

export interface NocheVista {
  replica: number;
  salida: SalidaSimulacion;
  traza: Traza;
  reproductor: Reproductor;
  momentos: MomentoEscena[];
}
export type CualNocheMostrada = 'provisoria' | CualNoche | 'receta' | 'elegida';

export type Origen =
  | { tipo: 'plantilla'; clave: string; plantilla: { id: string; version: string }; parche: OpParche[] }
  | { tipo: 'modelo' };

export type Tema = 'modelo' | 'noche' | 'progreso' | 'noches' | 'ysi' | 'decision' | 'error';

export interface EstadoYsi {
  parche: OpParche[];
  mvB: ModeloValidado | null;
  nocheB: NocheVista | null;
  fase: 'nada' | 'previa' | 'lista' | 'confirmando' | 'confirmada';
  comparaciones: Comparacion[];
  nochesB: ResultadoReplica[];
  progreso: number;
}
export interface EstadoDecision {
  fase: 'nada' | 'evaluando' | 'tamizando' | 'listo' | 'cancelado';
  evaluacion: EvaluacionDecision | null;
  ranking: ResultadoTamizado[] | null;
  preguntas: Pregunta[] | null;
  hechas: number;
  maximo: number;
  /** Parámetros que la persona ya contestó (con su valor). */
  respuestas: Record<string, number>;
}

/** Error que la interfaz muestra como aviso (clave i18n y detalle). */
export interface ErrorSesion { clave: string; vars: Record<string, string | number> }

export class Sesion {
  readonly servicios: ServiciosApp;
  readonly almacen: Almacen;
  mv: ModeloValidado | null = null;
  origen: Origen = { tipo: 'modelo' };
  receta: Receta | null = null;
  semilla = 0;
  N = 0;
  resultados: (ResultadoReplica | undefined)[] = [];
  llegadas = 0;
  nochesListas = false;
  mapa: MapaRiesgo | null = null;
  resumenCosto: Resumen | null = null;
  propCorte: Proporcion | null = null;
  semaforo: Semaforo | null = null;
  comprobante: Comprobante | null = null;
  noche: NocheVista | null = null;
  cualNoche: CualNocheMostrada = 'provisoria';
  cargandoNoche = false;
  ysi: EstadoYsi = Sesion.ysiVacio();
  decision: EstadoDecision = Sesion.decisionVacia();
  ultimoError: ErrorSesion | null = null;
  private generacion = 0;
  private pidiendoNoches = false;
  private oyentes = new Set<(t: Tema) => void>();
  private tokenPrevia = 0;
  private previaEnCurso = false;

  constructor(servicios: ServiciosApp, almacen: Almacen) {
    this.servicios = servicios;
    this.almacen = almacen;
  }

  static ysiVacio(): EstadoYsi { return { parche: [], mvB: null, nocheB: null, fase: 'nada', comparaciones: [], nochesB: [], progreso: 0 }; }
  static decisionVacia(): EstadoDecision {
    return { fase: 'nada', evaluacion: null, ranking: null, preguntas: null, hechas: 0, maximo: 0, respuestas: {} };
  }

  suscribir(f: (t: Tema) => void): () => void {
    this.oyentes.add(f);
    return () => { this.oyentes.delete(f); };
  }
  private emitir(t: Tema): void { for (const f of [...this.oyentes]) f(t); }
  private fallar(clave: string, e: unknown): void {
    if (esCancelacion(e)) return;
    this.ultimoError = { clave, vars: { detalle: e instanceof Error ? e.message : String(e) } };
    this.emitir('error');
  }

  get confianza(): number { return this.mv?.modelo.experimento.confianza ?? 0.95; }
  get kpiNoche(): KpiId { return this.mv?.modelo.experimento.kpiNoche ?? 'finClasificacionMin'; }
  /** Noches que ya llegaron, en orden de réplica (sin huecos al principio). */
  get nochesLlegadas(): ResultadoReplica[] { return this.resultados.filter((r): r is ResultadoReplica => r !== undefined); }

  /** Abre un modelo (de una plantilla, de un enlace o del modo ingeniero) y arranca la película y las cien noches. */
  abrir(mv: ModeloValidado, origen: Origen, receta: Receta | null = null): void {
    this.generacion++;
    this.servicios.cancelarDesde(Prioridad.VISTA_PREVIA);
    this.mv = mv; this.origen = origen; this.receta = receta;
    this.semilla = receta?.semilla ?? mv.modelo.experimento.semilla;
    this.N = Math.max(1, receta?.replicas ?? mv.modelo.experimento.nochesEscena);
    this.resultados = new Array(this.N); this.llegadas = 0; this.nochesListas = false;
    this.mapa = null; this.resumenCosto = null; this.propCorte = null; this.semaforo = null; this.comprobante = null;
    this.noche = null; this.ysi = Sesion.ysiVacio(); this.decision = Sesion.decisionVacia(); this.ultimoError = null;
    this.pidiendoNoches = false;
    this.emitir('modelo');
    const inicial = receta?.noche !== undefined && receta.noche < this.N ? receta.noche
      : typeof mv.modelo.experimento.nocheMostrada === 'number' ? Math.min(this.N - 1, mv.modelo.experimento.nocheMostrada) : 0;
    const cual: CualNocheMostrada = receta?.noche !== undefined ? 'receta' : typeof mv.modelo.experimento.nocheMostrada === 'number' ? 'elegida' : 'provisoria';
    void this.cargarNoche(inicial, cual, receta?.t);
    void this.pedirNoches();
  }

  /** Carga la noche `replica` con traza completa (la que se ve). Mantiene el cabezal si la noche nueva lo contiene. */
  async cargarNoche(replica: number, cual: CualNocheMostrada, t?: number): Promise<void> {
    const mv = this.mv; if (!mv) return;
    const gen = this.generacion;
    this.cargandoNoche = true; this.emitir('noche');
    try {
      const salida = await this.servicios.noche(mv, this.semilla, replica, Prioridad.VISTA_PREVIA);
      if (gen !== this.generacion) return;
      const traza = salida.traza;
      if (!traza) throw new Error('la noche llegó sin traza');
      this.noche = { replica, salida, traza, reproductor: this.servicios.crearReproductor(traza), momentos: this.servicios.detectarMomentos(traza) };
      this.cualNoche = cual;
      this.almacen.despachar({ tipo: 'cargarNoche', inicio: traza.inicio, fin: traza.fin, t });
    } catch (e) {
      if (gen === this.generacion) this.fallar('app.error.noche', e);
    } finally {
      if (gen === this.generacion) { this.cargandoNoche = false; this.emitir('noche'); }
      if (esCancelacionPendiente(this)) void this.pedirNoches();
    }
  }

  /** Pide las noches que faltan (en tramos contiguos). Si se cancela, lo que llegó queda y se puede volver a llamar. */
  async pedirNoches(): Promise<void> {
    const mv = this.mv; if (!mv || this.nochesListas || this.pidiendoNoches) return;
    const gen = this.generacion;
    this.pidiendoNoches = true;
    try {
      let desde = this.resultados.findIndex((r) => r === undefined);
      while (desde >= 0 && desde < this.N) {
        let hasta = desde;
        while (hasta < this.N && this.resultados[hasta] === undefined) hasta++;
        await this.servicios.noches(mv, this.semilla, desde, hasta, Prioridad.NOCHES, (r) => {
          if (gen !== this.generacion || r.replica < 0 || r.replica >= this.N) return;
          if (this.resultados[r.replica] === undefined) this.llegadas++;
          this.resultados[r.replica] = r;
          this.emitir('progreso');
        }).then((rs) => {
          if (gen !== this.generacion) return;
          for (const r of rs) if (r.replica >= 0 && r.replica < this.N && this.resultados[r.replica] === undefined) { this.resultados[r.replica] = r; this.llegadas++; }
        });
        if (gen !== this.generacion) return;
        desde = this.resultados.findIndex((r) => r === undefined);
      }
      await this.alCompletarNoches(gen);
    } catch (e) {
      if (!esCancelacion(e) && gen === this.generacion) this.fallar('app.error.noches', e);
    } finally {
      if (gen === this.generacion) this.pidiendoNoches = false;
    }
  }

  private async alCompletarNoches(gen: number): Promise<void> {
    const mv = this.mv!; const rs = this.nochesLlegadas;
    if (rs.length !== this.N) return;
    const s = this.servicios;
    this.mapa = s.agregarRiesgo(rs, this.kpiNoche);
    if (rs.length >= 2) this.resumenCosto = s.resumir(rs, 'costoPorPaquete', this.confianza);
    this.propCorte = s.proporcion(rs, 'pendientesAlCorte', '<=', 0, this.confianza);
    this.semaforo = s.semaforoDe ? s.semaforoDe(mv, rs) : semaforoLocal(mv, rs, s.resumir);
    this.nochesListas = true;
    this.emitir('noches');
    try {
      const c = await s.comprobante(mv, rs, this.semaforo);
      if (gen !== this.generacion) return;
      this.comprobante = c;
      this.emitir('noches');
    } catch (e) { this.fallar('app.error.comprobante', e); }
    // la noche que se muestra: la de la receta, la elegida en el modelo, o la mediana / peor según el modelo
    if (this.cualNoche === 'provisoria') {
      const pedida = mv.modelo.experimento.nocheMostrada;
      const cual: CualNoche = pedida === 'peor' ? 'peor' : 'mediana';
      await this.mostrarNoche(cual);
    }
  }

  /** Réplica de la noche mediana, peor o mejor según el KPI de la noche (la mejor no viene en MapaRiesgo: se calcula acá). */
  replicaDe(cual: CualNoche): number | null {
    if (!this.mapa || !this.nochesListas) return null;
    if (cual === 'mediana') return this.mapa.nocheMediana;
    if (cual === 'peor') return this.mapa.nochePeor;
    const k = this.kpiNoche, mas = META_KPI[k].mejor === 'mas';
    const o = [...this.nochesLlegadas].sort((a, b) => (mas ? b.kpi[k] - a.kpi[k] : a.kpi[k] - b.kpi[k]) || a.replica - b.replica);
    return o[0]?.replica ?? null;
  }

  async mostrarNoche(cual: CualNoche): Promise<void> {
    const r = this.replicaDe(cual);
    if (r === null) return;
    if (this.noche && this.noche.replica === r) { this.cualNoche = cual; this.emitir('noche'); return; }
    await this.cargarNoche(r, cual, this.almacen.estado.t);
  }

  // ---------- «¿y si…?» ----------

  /** Parche de las perillas respecto del modelo que se está mirando (A). */
  parcheDe(p: Perillas): OpParche[] {
    const mv = this.mv; if (!mv) return [];
    const ops: OpParche[] = [];
    if (p.puestos !== null) ops.push({ op: 'replace', path: '/personas/induccion/puestosActivos', value: p.puestos });
    if (p.personasRampa !== null) ops.push({ op: 'replace', path: '/personas/rampa/cantidad', value: p.personasRampa });
    if (p.reten !== null) ops.push({ op: 'replace', path: '/personas/induccion/reten', value: p.reten });
    if (p.balanceado) ops.push(...this.servicios.planBalanceado(mv.modelo));
    else if (p.plan !== null) ops.push({ op: 'replace', path: '/personas/rampa/asignacion', value: p.plan });
    return ops;
  }

  /**
   * Vista previa de B: una noche (la misma réplica que A) con el modelo cambiado, marcada «provisoria (1 noche)». Si había otra vista
   * previa en curso se cancela (cancelarDesde también frena las cien noches: después se vuelven a pedir). Al llegar, confirma solo.
   */
  async previsualizar(p: Perillas): Promise<void> {
    const mv = this.mv; if (!mv) return;
    const token = ++this.tokenPrevia, gen = this.generacion;
    if (this.previaEnCurso || this.ysi.fase === 'confirmando') this.servicios.cancelarDesde(Prioridad.VISTA_PREVIA);
    if (!hayCambios(p)) { this.ysi = Sesion.ysiVacio(); this.emitir('ysi'); void this.pedirNoches(); return; }
    const parche = this.parcheDe(p);
    this.ysi = { ...Sesion.ysiVacio(), parche, fase: 'previa' };
    this.emitir('ysi');
    this.previaEnCurso = true;
    try {
      const mvB = await this.servicios.variante(mv, parche);
      if (token !== this.tokenPrevia || gen !== this.generacion) return;
      const replica = this.noche?.replica ?? 0;
      const salida = await this.servicios.noche(mvB, this.semilla, replica, Prioridad.VISTA_PREVIA);
      if (token !== this.tokenPrevia || gen !== this.generacion || !salida.traza) return;
      this.ysi = { ...this.ysi, mvB, fase: 'lista', nocheB: { replica, salida, traza: salida.traza,
        reproductor: this.servicios.crearReproductor(salida.traza), momentos: this.servicios.detectarMomentos(salida.traza) } };
      this.emitir('ysi');
    } catch (e) {
      if (token === this.tokenPrevia) { this.ysi = { ...this.ysi, fase: 'nada' }; this.fallar('app.error.variante', e); this.emitir('ysi'); }
      return;
    } finally {
      if (token === this.tokenPrevia) this.previaEnCurso = false;
      void this.pedirNoches();
    }
    await this.confirmar(token);
  }

  /** Confirmación pareada: 40 noches de A y de B con la misma semilla y réplicas 0…39, diferencia con IC y veredicto. */
  async confirmar(token = this.tokenPrevia): Promise<void> {
    const mv = this.mv, mvB = this.ysi.mvB; if (!mv || !mvB) return;
    const gen = this.generacion, n = Math.min(NOCHES_CONFIRMACION, Math.max(2, this.N));
    this.ysi = { ...this.ysi, fase: 'confirmando', progreso: 0 }; this.emitir('ysi');
    try {
      const yaA = this.resultados.slice(0, n);
      const a = yaA.every((r) => r !== undefined) ? yaA as ResultadoReplica[]
        : await this.servicios.noches(mv, this.semilla, 0, n, Prioridad.CONFIRMACION);
      if (token !== this.tokenPrevia || gen !== this.generacion) return;
      let llegadas = 0;
      const b = await this.servicios.noches(mvB, this.semilla, 0, n, Prioridad.CONFIRMACION, () => {
        llegadas++; if (token === this.tokenPrevia) { this.ysi = { ...this.ysi, progreso: llegadas / n }; this.emitir('ysi'); }
      });
      if (token !== this.tokenPrevia || gen !== this.generacion) return;
      const comparaciones = KPI_COMPARACION.filter((k) => META_KPI[k].mejor !== 'neutro')
        .map((k) => this.servicios.comparar(a, b, k, this.confianza));
      this.ysi = { ...this.ysi, fase: 'confirmada', comparaciones, nochesB: b, progreso: 1 };
      this.emitir('ysi');
    } catch (e) {
      if (token === this.tokenPrevia && !esCancelacion(e)) { this.ysi = { ...this.ysi, fase: 'lista' }; this.fallar('app.error.confirmacion', e); this.emitir('ysi'); }
    } finally {
      void this.pedirNoches();
    }
  }

  /** Pasa B a ser el modelo que se mira (y se comparte). */
  quedarseConB(): void {
    const mvB = this.ysi.mvB; if (!mvB) return;
    const origen: Origen = this.origen.tipo === 'plantilla'
      ? { ...this.origen, parche: [...this.origen.parche, ...this.ysi.parche] } : { tipo: 'modelo' };
    this.abrir(mvB, origen, null);
  }

  // ---------- decidir ----------

  /** Evalúa la decisión del modelo (réplicas secuenciales) y después tamiza los supuestos para armar el formulario. Cancelable. */
  async decidir(): Promise<void> {
    const mv = this.mv; if (!mv?.modelo.decision) return;
    const gen = this.generacion;
    const respuestas = this.decision.respuestas;
    this.decision = { ...Sesion.decisionVacia(), respuestas, fase: 'evaluando' }; this.emitir('decision');
    try {
      const evaluacion = await this.servicios.evaluarDecision(mv, (hechas, maximo) => {
        if (gen !== this.generacion) return;
        this.decision = { ...this.decision, hechas, maximo }; this.emitir('decision');
      });
      if (gen !== this.generacion) return;
      this.decision = { ...this.decision, evaluacion, fase: 'tamizando', hechas: 0, maximo: 0 }; this.emitir('decision');
      const ranking = await this.servicios.tamizar(mv, (hechas, maximo) => {
        if (gen !== this.generacion) return;
        this.decision = { ...this.decision, hechas, maximo }; this.emitir('decision');
      });
      if (gen !== this.generacion) return;
      const preguntas = this.servicios.formulario(mv, ranking);
      this.decision = { ...this.decision, ranking, preguntas, fase: 'listo' }; this.emitir('decision');
    } catch (e) {
      if (gen !== this.generacion) return;
      if (esCancelacion(e)) { this.decision = { ...this.decision, fase: 'cancelado' }; this.emitir('decision'); return; }
      this.decision = { ...this.decision, fase: 'nada' };
      this.fallar('app.error.decision', e); this.emitir('decision');
    }
  }

  cancelarDecision(): void {
    if (this.decision.fase === 'evaluando' || this.decision.fase === 'tamizando') this.servicios.cancelarDesde(Prioridad.DECISION);
    // si quedaron noches a medio pedir, se retoman
    void this.pedirNoches();
  }

  /**
   * La persona contesta una pregunta con su dato: el parámetro pasa a ese valor central, con etiqueta DATO_USUARIO y sin `incierto`
   * (ya no es un supuesto), el modelo se recompila y se vuelve a decidir.
   */
  async responder(parametro: string, valor: number): Promise<void> {
    const mv = this.mv; if (!mv) return;
    const p = mv.modelo.parametros[parametro]; if (!p || !Number.isFinite(valor)) return;
    const base = `/parametros/${parametro.replace(/~/g, '~0').replace(/\//g, '~1')}`;
    const v = p.valor;
    let nuevo: unknown = valor;
    if (typeof v === 'object') {
      if (v.tipo === 'bernoulli') nuevo = { ...v, p: valor };
      else if ('media' in v) nuevo = { ...v, media: valor };
      else if (v.tipo === 'fija') nuevo = { ...v, valor };
      else nuevo = { tipo: 'fija', valor };
    }
    const hoy = new Date().toISOString().slice(0, 10);
    const ops: OpParche[] = [
      { op: 'replace', path: `${base}/valor`, value: nuevo },
      { op: 'replace', path: `${base}/etiqueta`, value: 'DATO_USUARIO' },
      { op: 'replace', path: `${base}/fuente`, value: 'Dato propio cargado en el formulario por decisión.' },
      { op: 'replace', path: `${base}/fecha`, value: hoy },
    ];
    if (p.incierto) ops.push({ op: 'remove', path: `${base}/incierto` });
    try {
      const mvNuevo = await this.servicios.variante(mv, ops);
      const respuestas = { ...this.decision.respuestas, [parametro]: valor };
      const origen: Origen = this.origen.tipo === 'plantilla' ? { ...this.origen, parche: [...this.origen.parche, ...ops] } : { tipo: 'modelo' };
      this.abrir(mvNuevo, origen, null);
      this.decision = { ...Sesion.decisionVacia(), respuestas };
      void this.decidir();
    } catch (e) { this.fallar('app.error.variante', e); }
  }

  // ---------- biografía y causas ----------

  biografia(clase: ClaseEntidad, id: number): Biografia | null {
    if (!this.noche || !this.mv) return null;
    return this.servicios.biografia(this.noche.traza, this.mv.modelo, clase, id);
  }

  /** Verifica frases contra la traza que se mira y el modelo; devuelve cuáles pasaron. */
  verificar(frases: Frase[]): boolean[] {
    if (!this.noche || !this.mv) return frases.map(() => false);
    const id = 'noche';
    const v = this.servicios.verificar(frases, { experimentos: {}, trazas: { [id]: this.noche.traza }, modelo: this.mv.modelo }, id);
    const malas = new Set(v.fallas.map((f) => f.frase));
    return frases.map((_, i) => !malas.has(i));
  }

  async causas(id: number): Promise<{ causas: Frase[]; contrafactuales: Contrafactual[] } | null> {
    if (!this.noche || !this.mv) return null;
    const P = this.noche.traza.paquetes;
    if (id < 0 || id >= P.n) return null;
    return this.servicios.causas(this.noche.traza, this.mv, P.camion[id], P.indice[id]);
  }

  async contrafactual(id: number, cambio: Contrafactual['cambio']): Promise<Contrafactual | null> {
    if (!this.noche || !this.mv) return null;
    const P = this.noche.traza.paquetes;
    return this.servicios.contrafactual(this.mv, this.semilla, this.noche.replica, P.camion[id], P.indice[id], cambio);
  }

  // ---------- compartir ----------

  /** Receta de lo que se está mirando (la del comprobante más la noche, el cabezal y la velocidad). */
  receta(): Receta | null {
    const mv = this.mv; if (!mv) return null;
    const e = this.almacen.estado;
    const base = this.comprobante?.receta ?? { v: 1 as const, modelo: mv.huella, motor: this.servicios.versionMotor, semilla: this.semilla, replicas: this.N };
    const r: Receta = { ...base, modelo: mv.huella };
    if (this.noche) r.noche = this.noche.replica;
    if (this.noche && e.t > e.inicio) r.t = Math.round(e.t);
    r.vel = e.velocidad;
    return r;
  }

  /**
   * Arma el enlace. Con anonimizar: si el modelo es una plantilla con cambios que no tocan datos propios (parámetros, costos, demanda),
   * viaja la plantilla y el parche (no hay nada que anonimizar); si no, viaja el modelo completo anonimizado, con su propia receta.
   */
  async enlace(anonimizar: boolean): Promise<{ fragmento: string; enlace: Enlace; anonimizado: boolean; plantilla: boolean }> {
    const mv = this.mv; if (!mv) throw new Error('no hay modelo abierto');
    const receta = this.receta();
    const sensible = (op: OpParche) => /^\/(parametros|costos|demanda|procedencia|titulo|descripcion|autor)/.test(op.path);
    if (this.origen.tipo === 'plantilla' && (!anonimizar || !this.origen.parche.some(sensible))) {
      const e: Enlace = { tipo: 'plantilla', plantilla: this.origen.plantilla, parche: this.origen.parche, ...(receta ? { receta } : {}) };
      return { fragmento: await this.servicios.codec.codificar(e), enlace: e, anonimizado: false, plantilla: true };
    }
    if (!anonimizar) {
      const e: Enlace = { tipo: 'modelo', modelo: mv.modelo, ...(receta ? { receta } : {}) };
      return { fragmento: await this.servicios.codec.codificar(e), enlace: e, anonimizado: false, plantilla: false };
    }
    // semilla secreta de anonimizar: nunca la de la receta (con ella se recuperarían los volúmenes; modelo/NOTAS-CONTRATO.md §9)
    const sem = new Uint32Array(1); crypto.getRandomValues(sem);
    const anon = this.servicios.anonimizar(mv.modelo, sem[0]);
    const c = await this.servicios.compilar(anon);
    if (!c.ok) throw new Error('el modelo anonimizado no compila');
    const e: Enlace = { tipo: 'modelo', modelo: c.mv.modelo, ...(receta ? { receta: { ...receta, modelo: c.mv.huella } } : {}) };
    return { fragmento: await this.servicios.codec.codificar(e), enlace: e, anonimizado: true, plantilla: false };
  }

  /** Estado del sello «Reproducida en este dispositivo» (diseño maestro §5.9). */
  selloReproducida(): 'reproducida' | 'sin-receta' | 'otro-motor' | 'calculando' {
    if (!this.receta || !this.mv) return 'sin-receta';
    if (this.receta.motor !== this.servicios.versionMotor) return 'otro-motor';
    if (!this.nochesListas) return 'calculando';
    return this.receta.modelo === this.mv.huella ? 'reproducida' : 'sin-receta';
  }
}

/** ¿Quedaron noches por pedir (porque una vista previa las canceló)? */
function esCancelacionPendiente(s: Sesion): boolean {
  return !!s.mv && !s.nochesListas;
}
