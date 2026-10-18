// verificacion/flujo/red.ts · Andén simulador, corte 1, P2.
// Un bloque genérico de redes de colas sobre el contrato del motor (contratos/motor.ts). Con él se arman todos los casos de la
// batería Andén Verificado: M/M/c, M/G/1, D/M/1, M/M/c/K, Erlang B, prioridades con y sin preempción, Jackson, redes cerradas,
// fuente finita, M_t/M/∞ y los casos publicados de Law.
//
// Qué modela:
// - estaciones con c servidores (o infinitos: demora pura) y capacidad K (cola + servicio; un arribo con la estación llena se pierde);
// - clases abiertas (llegadas de renovación: Poisson, deterministas, Erlang… o Poisson no homogéneo senoidal por adelgazamiento de
//   Lewis y Shedler) y cerradas (población fija que circula);
// - prioridad por clase (menor primero) y preempción con reanudación: el desalojado vuelve a la cola con su clave original
//   (prioridad, llegada a la estación, orden de llegada) y sigue con el servicio que le faltaba;
// - ruteo probabilístico por clase y estación, sorteado por (trabajo, visita).
//
// Azar por dirección semántica (corte-1.md §6.3, el mismo patrón que el hub): ningún sorteo depende del orden de los eventos ni del
// servidor que atiende. Por eso con 2 o con 3 servidores el trabajo n llega en el mismo instante y pide el mismo servicio (R02), y
// los números aleatorios comunes salen solos. Direcciones (clave = claveDe(ruta, propósito)):
//   llegada:    ('red.<id>', 'llegada.<clase>')       a = n-ésimo intervalo        b = 0        c = 0
//   adelgazar:  ('red.<id>', 'adelgazar.<clase>')     a = n-ésimo candidato        b = 0        c = 0
//   iniciales:  ('red.<id>', 'iniciales.<clase>')     a = índice de la regla       b = 0        c = 0
//   servicio:   ('red.<id>.<estación>', 'servicio')   a = ordinal del trabajo      b = visita   c = 2·clase + (1 si es inicial)
//   ruteo:      ('red.<id>.<estación>', 'ruteo')      a = ordinal del trabajo      b = visita   c = 2·clase + (1 si es inicial)
//
// Eventos del bloque (tipo · arg · fase · prioridad):
//   1 INICIO        · 0      · URGENTE · 0   en t = 0: población cerrada, iniciales y primeras llegadas
//   2 LLEGADA       · clase  · NORMAL  · 0   arribo externo de una clase abierta
//   3 FIN_SERVICIO  · trabajo· NORMAL  · 0   se descarta si su seq ya no es el guardado (lo desalojaron)
//   4 CALENTAMIENTO · 0      · TARDIA  · 0   reinicia los promedios ponderados por tiempo
//   5 OBSERVAR      · índice · TARDIA  · 0   foto de N(t)
//   6 SERIE         · índice · TARDIA  · 0   promedio de N en el intervalo que termina
//
// Estado: todo en arreglos tipados y números (estado() / restaurar()); la configuración compilada es inmutable.
import { aMs, Fase, MS_POR_SEG, type Ms } from '../../contratos/tipos-base.ts';
import type { Direccion, Distribucion } from '../../contratos/azar.ts';
import type { Bloque, CrearMotor, EstadoBloque, EstadoCorrida, Motor, ResultadoCorrida } from '../../contratos/motor.ts';
import { Conteos, PromediosTiempo } from './monitores.ts';

// ---------------------------------------------------------------------------------------------------------------------
// Configuración (datos puros, serializable)
// ---------------------------------------------------------------------------------------------------------------------

export interface EstacionRed {
  id: string;
  /** Entero ≥ 1, o Infinity para una demora pura (todos en servicio a la vez). */
  servidores: number;
  /** Máximo en la estación, cola más servicio. Sin tope por defecto. */
  capacidad?: number;
  /** Tiempo de servicio en unidades del modelo. */
  servicio: Distribucion;
  /** Servicio distinto para alguna clase (por id de clase). */
  servicioPorClase?: Record<string, Distribucion>;
}

export type LlegadasRed =
  /** Intervalos iid: exponencial = Poisson, fija = determinista, erlang… `hasta`: no hay llegadas después de ese instante. */
  | { tipo: 'renovacion'; entre: Distribucion; hasta?: number }
  /** Poisson no homogéneo λ(t) = media · (1 + amplitud · sen(2π t / período)), por adelgazamiento. */
  | { tipo: 'senoidal'; media: number; amplitud: number; periodo: number; hasta?: number };

export interface ClaseRed {
  id: string;
  /** Menor número = más prioridad. 0 por defecto. */
  prioridad?: number;
  /** Si al llegar puede desalojar a un trabajo de menor prioridad (reanudación con clave original). */
  preempta?: boolean;
  /** Estación de entrada (clase abierta) o donde arranca la población (clase cerrada). */
  entrada: string;
  /** Clase abierta. */
  llegadas?: LlegadasRed;
  /** Clase cerrada: cantidad fija de trabajos que circulan. */
  poblacion?: number;
  /** Desde cada estación: [destino, probabilidad]. Lo que falta para 1 sale de la red (en una clase cerrada tiene que sumar 1). */
  ruteo?: Record<string, [string, number][]>;
}

export interface InicialRed { clase: string; estacion: string; cantidad: number | Distribucion }

export interface ConfigRed {
  /** Identifica la red en las claves del azar: dos corridas con el mismo id comparten números aleatorios (CRN). */
  id: string;
  /** Segundos del motor por unidad de tiempo del modelo. Por defecto 1.000: resolución de 10⁻⁶ unidades (ver NOTAS-CONTRATO.md). */
  unidadSeg?: number;
  estaciones: EstacionRed[];
  clases: ClaseRed[];
  /** Fin de la corrida en unidades (el motor se crea con hasta = aMs(horizonte · unidadSeg)). */
  horizonte: number;
  /** Desde cuándo se mide (unidades). 0 por defecto. */
  calentamiento?: number;
  /** Instantes (unidades) en que se registra la cantidad en el sistema. */
  observar?: number[];
  /** Largo (unidades) de los intervalos de la serie de N promedio (para MSER-5). */
  serie?: number;
  /** Termina la corrida cuando salieron tantos trabajos de esa clase (desde t = 0). */
  objetivo?: { clase: string; salidas: number };
  /** Estación donde se mide el tiempo de ciclo y el rendimiento de las clases cerradas. */
  ciclo?: string;
  /** Trabajos de clases abiertas que ya están en t = 0 (arranque cargado o estacionario). */
  iniciales?: InicialRed[];
  /** Registros extra: las primeras n llegadas y sus servicios (ms) y las estancias de cada trabajo medido. */
  registrar?: { primeras?: number; estancias?: boolean };
}

export const TipoEventoRed = { INICIO: 1, LLEGADA: 2, FIN_SERVICIO: 3, CALENTAMIENTO: 4, OBSERVAR: 5, SERIE: 6 } as const;

// ---------------------------------------------------------------------------------------------------------------------
// Validación y compilación
// ---------------------------------------------------------------------------------------------------------------------

function fallar(donde: string, esperado: string, llego: unknown): never {
  let txt: string;
  try { txt = typeof llego === 'string' ? `«${llego}»` : JSON.stringify(llego) ?? String(llego); } catch { txt = String(llego); }
  throw new Error(`red ${donde}: se esperaba ${esperado} y llegó ${txt}`);
}
function finito(x: unknown): x is number { return typeof x === 'number' && Number.isFinite(x); }

/** Valida una distribución de duraciones (soporte ≥ 0). */
export function validarDuracion(d: Distribucion | undefined, donde: string): void {
  if (!d || typeof d !== 'object') fallar(donde, 'una distribución', d);
  const no = (cond: boolean, esperado: string) => { if (!cond) fallar(donde, esperado, d); };
  switch (d.tipo) {
    case 'fija': no(finito(d.valor) && d.valor >= 0, 'fija con valor ≥ 0'); break;
    case 'uniforme': no(finito(d.min) && finito(d.max) && d.min >= 0 && d.max >= d.min, 'uniforme con 0 ≤ min ≤ max'); break;
    case 'exponencial': no(finito(d.media) && d.media > 0, 'exponencial con media > 0'); break;
    case 'triangular': no(finito(d.min) && finito(d.moda) && finito(d.max) && d.min >= 0 && d.min <= d.moda && d.moda <= d.max && d.max > d.min,
      'triangular con 0 ≤ min ≤ moda ≤ max y min < max'); break;
    case 'lognormal': no(finito(d.media) && finito(d.cv) && d.media > 0 && d.cv > 0, 'lognormal con media > 0 y cv > 0'); break;
    case 'normal': no(finito(d.media) && finito(d.desvio) && d.desvio >= 0 && finito(d.min) && (d.min as number) >= 0,
      'normal con desvío ≥ 0 y recortada con min ≥ 0'); break;
    case 'erlang': no(Number.isInteger(d.k) && d.k >= 1 && d.k <= 512 && finito(d.media) && d.media > 0, 'erlang con 1 ≤ k ≤ 512 y media > 0'); break;
    case 'weibull': no(finito(d.forma) && finito(d.escala) && d.forma > 0 && d.escala > 0, 'weibull con forma > 0 y escala > 0'); break;
    case 'empirica': no(Array.isArray(d.valores) && d.valores.length >= 1 && d.valores.every((v) => finito(v) && v >= 0), 'empírica con valores ≥ 0'); break;
    case 'discreta': no(Array.isArray(d.valores) && Array.isArray(d.pesos) && d.valores.length >= 1 && d.valores.length === d.pesos.length &&
      d.valores.every((v) => finito(v) && v >= 0) && d.pesos.every((p) => finito(p) && p >= 0) && d.pesos.some((p) => p > 0),
      'discreta con valores ≥ 0 y pesos ≥ 0 (alguno > 0)'); break;
    case 'bernoulli': no(finito(d.p) && d.p >= 0 && d.p <= 1, 'bernoulli con 0 ≤ p ≤ 1'); break;
    default: fallar(donde, 'un tipo de distribución del contrato (azar.ts)', (d as { tipo?: unknown }).tipo);
  }
}

/** Multiplica por f todos los parámetros de tiempo de una distribución de duraciones (para la prueba metamórfica M01). */
export function escalarDuracion(d: Distribucion, f: number): Distribucion {
  switch (d.tipo) {
    case 'fija': return { tipo: 'fija', valor: d.valor * f };
    case 'uniforme': return { tipo: 'uniforme', min: d.min * f, max: d.max * f };
    case 'exponencial': return { tipo: 'exponencial', media: d.media * f };
    case 'triangular': return { tipo: 'triangular', min: d.min * f, moda: d.moda * f, max: d.max * f };
    case 'lognormal': return { tipo: 'lognormal', media: d.media * f, cv: d.cv };
    case 'normal': return { tipo: 'normal', media: d.media * f, desvio: d.desvio * f,
      ...(d.min !== undefined ? { min: d.min * f } : {}), ...(d.max !== undefined ? { max: d.max * f } : {}) };
    case 'erlang': return { tipo: 'erlang', k: d.k, media: d.media * f };
    case 'weibull': return { tipo: 'weibull', forma: d.forma, escala: d.escala * f };
    case 'empirica': return { tipo: 'empirica', valores: d.valores.map((v) => v * f) };
    case 'discreta': return { tipo: 'discreta', valores: d.valores.map((v) => v * f), pesos: d.pesos.slice() };
    case 'bernoulli': return d;
  }
}

/** La misma red con todas las duraciones multiplicadas por f y todas las tasas divididas por f (misma id: mismos números aleatorios). */
export function escalarRed(c: ConfigRed, f: number): ConfigRed {
  const x = (v: number | undefined) => (v === undefined ? undefined : v * f);
  return {
    ...c,
    estaciones: c.estaciones.map((e) => ({
      ...e, servicio: escalarDuracion(e.servicio, f),
      ...(e.servicioPorClase ? { servicioPorClase: Object.fromEntries(Object.entries(e.servicioPorClase).map(([k, d]) => [k, escalarDuracion(d, f)])) } : {}),
    })),
    clases: c.clases.map((k) => {
      if (!k.llegadas) return k;
      const l = k.llegadas;
      const llegadas: LlegadasRed = l.tipo === 'renovacion'
        ? { tipo: 'renovacion', entre: escalarDuracion(l.entre, f), ...(l.hasta !== undefined ? { hasta: l.hasta * f } : {}) }
        : { tipo: 'senoidal', media: l.media / f, amplitud: l.amplitud, periodo: l.periodo * f, ...(l.hasta !== undefined ? { hasta: l.hasta * f } : {}) };
      return { ...k, llegadas };
    }),
    horizonte: c.horizonte * f,
    ...(c.calentamiento !== undefined ? { calentamiento: x(c.calentamiento) } : {}),
    ...(c.observar ? { observar: c.observar.map((t) => t * f) } : {}),
    ...(c.serie !== undefined ? { serie: x(c.serie) } : {}),
  };
}

interface RedCompilada {
  config: ConfigRed;
  S: number;
  C: number;
  ids: { estaciones: string[]; clases: string[] };
  servidores: Float64Array;       // Infinity = demora
  capacidad: Float64Array;        // Infinity = sin tope
  offsetServidor: Int32Array;     // primer índice de servidor de cada estación (finita)
  totalServidores: number;
  servicio: Distribucion[];       // [s·C + k]
  prioridad: Int32Array;
  preempta: Uint8Array;
  entrada: Int32Array;
  abierta: Uint8Array;
  poblacion: Int32Array;
  llegadas: (LlegadasRed | null)[];
  ruteoDestino: Int32Array[];     // [k·S + s]
  ruteoAcum: Float64Array[];      // [k·S + s], probabilidades acumuladas
  unidadSeg: number;              // segundos del motor por unidad del modelo
  msUnidad: number;               // ms del motor por unidad del modelo
  hastaMs: Ms;
  hastaLlegadasMs: Float64Array;  // [k] último instante con llegadas (Infinity = sin límite propio)
  entreCandidatos: (Distribucion | null)[]; // [k] intervalos entre candidatos de las clases senoidales
  primeraAbierta: number;         // clase cuyas primeras llegadas se registran (−1 = ninguna)
  calMs: Ms;
  observarMs: Ms[];
  serieMs: Ms;                    // 0 = sin serie
  objetivoClase: number;          // −1 = sin objetivo
  objetivoSalidas: number;
  ciclo: number;                  // −1 = sin ciclo
  iniciales: { clase: number; estacion: number; cantidad: number | Distribucion }[];
  primeras: number;
  estancias: boolean;
}

/** Valida la configuración y la lleva a arreglos. Los errores dicen qué se esperaba y qué llegó. */
export function compilarRed(c: ConfigRed): RedCompilada {
  if (!c || typeof c !== 'object') fallar('', 'una configuración', c);
  if (typeof c.id !== 'string' || c.id.length === 0) fallar('id', 'un texto no vacío', c.id);
  const unidadSeg = c.unidadSeg ?? 1000;
  if (!(finito(unidadSeg) && unidadSeg > 0)) fallar('unidadSeg', 'un número > 0', unidadSeg);
  const msUnidad = unidadSeg * MS_POR_SEG;
  if (!Array.isArray(c.estaciones) || c.estaciones.length === 0) fallar('estaciones', 'al menos una estación', c.estaciones);
  if (!Array.isArray(c.clases) || c.clases.length === 0) fallar('clases', 'al menos una clase', c.clases);
  const S = c.estaciones.length, C = c.clases.length;
  if (C > 1000) fallar('clases', 'como mucho 1.000 clases', C);
  const idEst = c.estaciones.map((e) => e.id), idCla = c.clases.map((k) => k.id);
  const indiceEst = new Map<string, number>(), indiceCla = new Map<string, number>();
  idEst.forEach((id, i) => {
    if (typeof id !== 'string' || id.length === 0) fallar(`estaciones[${i}].id`, 'un texto no vacío', id);
    if (indiceEst.has(id)) fallar(`estaciones[${i}].id`, 'ids de estación únicos', id);
    indiceEst.set(id, i);
  });
  idCla.forEach((id, i) => {
    if (typeof id !== 'string' || id.length === 0) fallar(`clases[${i}].id`, 'un texto no vacío', id);
    if (indiceCla.has(id)) fallar(`clases[${i}].id`, 'ids de clase únicos', id);
    indiceCla.set(id, i);
  });
  const est = (id: string, donde: string) => { const i = indiceEst.get(id); if (i === undefined) fallar(donde, `una estación existente (${idEst.join(', ')})`, id); return i; };
  const cla = (id: string, donde: string) => { const i = indiceCla.get(id); if (i === undefined) fallar(donde, `una clase existente (${idCla.join(', ')})`, id); return i; };

  const servidores = new Float64Array(S), capacidad = new Float64Array(S), offsetServidor = new Int32Array(S);
  let totalServidores = 0;
  const servicio: Distribucion[] = new Array(S * C);
  c.estaciones.forEach((e, s) => {
    const sv = e.servidores;
    if (!(sv === Infinity || (Number.isInteger(sv) && sv >= 1 && sv <= 100_000))) fallar(`estación ${e.id}: servidores`, 'un entero entre 1 y 100.000, o Infinity', sv);
    servidores[s] = sv;
    const K = e.capacidad ?? Infinity;
    if (!(K === Infinity || (Number.isInteger(K) && K >= 1 && (sv === Infinity || K >= sv)))) fallar(`estación ${e.id}: capacidad`, 'un entero ≥ servidores, o sin tope', K);
    capacidad[s] = K;
    offsetServidor[s] = totalServidores;
    if (sv !== Infinity) totalServidores += sv;
    validarDuracion(e.servicio, `estación ${e.id}: servicio`);
    for (let k = 0; k < C; k++) servicio[s * C + k] = e.servicio;
    if (e.servicioPorClase) for (const [idk, d] of Object.entries(e.servicioPorClase)) {
      const k = cla(idk, `estación ${e.id}: servicioPorClase`);
      validarDuracion(d, `estación ${e.id}: servicio de la clase ${idk}`);
      servicio[s * C + k] = d;
    }
  });

  const prioridad = new Int32Array(C), preempta = new Uint8Array(C), entrada = new Int32Array(C), abierta = new Uint8Array(C), poblacion = new Int32Array(C);
  const llegadas: (LlegadasRed | null)[] = [];
  const ruteoDestino: Int32Array[] = new Array(C * S), ruteoAcum: Float64Array[] = new Array(C * S);
  c.clases.forEach((k, i) => {
    const pr = k.prioridad ?? 0;
    if (!(Number.isInteger(pr) && pr >= 0 && pr < 1_000_000)) fallar(`clase ${k.id}: prioridad`, 'un entero entre 0 y 999.999', pr);
    prioridad[i] = pr;
    preempta[i] = k.preempta ? 1 : 0;
    entrada[i] = est(k.entrada, `clase ${k.id}: entrada`);
    const tieneLleg = k.llegadas !== undefined, tienePob = k.poblacion !== undefined;
    if (tieneLleg === tienePob) fallar(`clase ${k.id}`, 'exactamente una de «llegadas» (abierta) o «poblacion» (cerrada)', { llegadas: k.llegadas, poblacion: k.poblacion });
    if (tieneLleg) {
      const l = k.llegadas!;
      abierta[i] = 1;
      if (l.tipo === 'renovacion') {
        validarDuracion(l.entre, `clase ${k.id}: llegadas.entre`);
        if (l.entre.tipo === 'fija' && l.entre.valor === 0) fallar(`clase ${k.id}: llegadas.entre`, 'un intervalo fijo > 0 (con 0 la corrida no avanza)', l.entre);
      } else if (l.tipo === 'senoidal') {
        if (!(finito(l.media) && l.media > 0)) fallar(`clase ${k.id}: llegadas.media`, 'una tasa > 0', l.media);
        if (!(finito(l.amplitud) && l.amplitud >= 0 && l.amplitud <= 1)) fallar(`clase ${k.id}: llegadas.amplitud`, 'un número entre 0 y 1', l.amplitud);
        if (!(finito(l.periodo) && l.periodo > 0)) fallar(`clase ${k.id}: llegadas.periodo`, 'un período > 0', l.periodo);
      } else fallar(`clase ${k.id}: llegadas.tipo`, '«renovacion» o «senoidal»', (l as { tipo?: unknown }).tipo);
      if (l.hasta !== undefined && !(finito(l.hasta) && l.hasta >= 0)) fallar(`clase ${k.id}: llegadas.hasta`, 'un instante ≥ 0', l.hasta);
      llegadas.push(l);
    } else {
      const N = k.poblacion!;
      if (!(Number.isInteger(N) && N >= 1 && N <= 1_000_000)) fallar(`clase ${k.id}: poblacion`, 'un entero entre 1 y 1.000.000', N);
      poblacion[i] = N;
      llegadas.push(null);
    }
    // Ruteo: filas por estación de origen, probabilidades acumuladas.
    const filas = k.ruteo ?? {};
    for (let s = 0; s < S; s++) { ruteoDestino[i * S + s] = new Int32Array(0); ruteoAcum[i * S + s] = new Float64Array(0); }
    for (const [desde, lista] of Object.entries(filas)) {
      const s = est(desde, `clase ${k.id}: ruteo`);
      if (!Array.isArray(lista)) fallar(`clase ${k.id}: ruteo de ${desde}`, 'una lista de [destino, probabilidad]', lista);
      const dst = new Int32Array(lista.length), acum = new Float64Array(lista.length);
      let a = 0;
      lista.forEach((par, j) => {
        if (!Array.isArray(par) || par.length !== 2) fallar(`clase ${k.id}: ruteo de ${desde}[${j}]`, '[destino, probabilidad]', par);
        dst[j] = est(par[0], `clase ${k.id}: ruteo de ${desde}[${j}]`);
        if (!(finito(par[1]) && par[1] >= 0 && par[1] <= 1)) fallar(`clase ${k.id}: ruteo de ${desde}[${j}]`, 'una probabilidad entre 0 y 1', par[1]);
        a += par[1];
        acum[j] = a;
      });
      if (a > 1 + 1e-12) fallar(`clase ${k.id}: ruteo de ${desde}`, 'probabilidades que sumen como mucho 1', a);
      ruteoDestino[i * S + s] = dst;
      ruteoAcum[i * S + s] = acum;
    }
    if (!abierta[i]) {
      // Una clase cerrada nunca sale: toda estación a la que puede llegar necesita una fila que sume 1, y ninguna puede tener tope.
      const visitadas = new Set<number>([entrada[i]]);
      const pendientes = [entrada[i]];
      while (pendientes.length) {
        const s = pendientes.pop()!;
        const acum = ruteoAcum[i * S + s];
        const suma = acum.length ? acum[acum.length - 1] : 0;
        if (Math.abs(suma - 1) > 1e-9) fallar(`clase cerrada ${k.id}: ruteo de ${idEst[s]}`, 'probabilidades que sumen 1 (una clase cerrada no sale)', suma);
        if (capacidad[s] !== Infinity) fallar(`clase cerrada ${k.id}: estación ${idEst[s]}`, 'estaciones sin tope de capacidad (un trabajo de población fija no se puede perder)', capacidad[s]);
        for (const d of ruteoDestino[i * S + s]) if (!visitadas.has(d)) { visitadas.add(d); pendientes.push(d); }
      }
    }
  });

  if (!(finito(c.horizonte) && c.horizonte > 0)) fallar('horizonte', 'un número de unidades > 0', c.horizonte);
  const hastaMs = aMs(c.horizonte * unidadSeg);
  if (hastaMs > Number.MAX_SAFE_INTEGER / 4) fallar('horizonte', `como mucho ${Number.MAX_SAFE_INTEGER / 4 / msUnidad} unidades`, c.horizonte);
  const cal = c.calentamiento ?? 0;
  if (!(finito(cal) && cal >= 0 && cal < c.horizonte)) fallar('calentamiento', `un número entre 0 y el horizonte (${c.horizonte})`, cal);
  const observar = c.observar ?? [];
  observar.forEach((t, i) => { if (!(finito(t) && t >= 0 && t <= c.horizonte)) fallar(`observar[${i}]`, `un instante entre 0 y ${c.horizonte}`, t); });
  const serie = c.serie ?? 0;
  if (!(finito(serie) && serie >= 0)) fallar('serie', 'un largo de intervalo > 0', serie);
  if (serie > 0 && c.horizonte / serie > 10_000_000) fallar('serie', 'como mucho 10 millones de intervalos', c.horizonte / serie);
  let objetivoClase = -1, objetivoSalidas = 0;
  if (c.objetivo) {
    objetivoClase = cla(c.objetivo.clase, 'objetivo.clase');
    if (!abierta[objetivoClase]) fallar('objetivo.clase', 'una clase abierta (las cerradas no salen)', c.objetivo.clase);
    if (!(Number.isInteger(c.objetivo.salidas) && c.objetivo.salidas >= 1)) fallar('objetivo.salidas', 'un entero ≥ 1', c.objetivo.salidas);
    objetivoSalidas = c.objetivo.salidas;
  }
  const ciclo = c.ciclo === undefined ? -1 : est(c.ciclo, 'ciclo');
  const iniciales = (c.iniciales ?? []).map((x, i) => {
    const k = cla(x.clase, `iniciales[${i}].clase`);
    if (!abierta[k]) fallar(`iniciales[${i}].clase`, 'una clase abierta (la población cerrada ya arranca en su entrada)', x.clase);
    const s = est(x.estacion, `iniciales[${i}].estacion`);
    if (typeof x.cantidad === 'number') {
      if (!(Number.isInteger(x.cantidad) && x.cantidad >= 0 && x.cantidad <= 10_000_000)) fallar(`iniciales[${i}].cantidad`, 'un entero entre 0 y 10.000.000', x.cantidad);
    } else validarDuracion(x.cantidad, `iniciales[${i}].cantidad`);
    return { clase: k, estacion: s, cantidad: x.cantidad };
  });
  const primeras = c.registrar?.primeras ?? 0;
  if (!(Number.isInteger(primeras) && primeras >= 0 && primeras <= 1_000_000)) fallar('registrar.primeras', 'un entero entre 0 y 1.000.000', primeras);
  return {
    config: c, S, C, ids: { estaciones: idEst, clases: idCla }, servidores, capacidad, offsetServidor, totalServidores, servicio,
    prioridad, preempta, entrada, abierta, poblacion, llegadas, ruteoDestino, ruteoAcum, unidadSeg, msUnidad, hastaMs,
    hastaLlegadasMs: Float64Array.from(llegadas, (l) => (l && l.hasta !== undefined ? aMs(l.hasta * unidadSeg) : Infinity)),
    entreCandidatos: llegadas.map((l) => (l && l.tipo === 'senoidal' ? { tipo: 'exponencial', media: 1 / (l.media * (1 + l.amplitud)) } : null)),
    primeraAbierta: abierta.indexOf(1),
    calMs: aMs(cal * unidadSeg), observarMs: observar.map((t) => aMs(t * unidadSeg)), serieMs: serie > 0 ? aMs(serie * unidadSeg) : 0,
    objetivoClase, objetivoSalidas, ciclo, iniciales, primeras, estancias: c.registrar?.estancias === true,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Resultados de una corrida
// ---------------------------------------------------------------------------------------------------------------------

export interface MedidasEstacion {
  id: string;
  /** Promedios ponderados por tiempo en la ventana de medición. */
  L: number; Lq: number; ocupacion: number;
  /** Por clase: espera media en la cola (unidades) y cuántas esperas se midieron. */
  Wq: number[]; nWq: number[];
  /** Por clase: fracción de arribos aceptados que no encontraron servidor libre. */
  pEspera: number[];
  /** Arribos que intentaron entrar en la ventana, y los que se perdieron por la capacidad. */
  intentos: number; bloqueados: number; pBloqueo: number;
}
export interface MedidasClase {
  id: string;
  /** Tiempo medio en el sistema (unidades) de los que llegaron en la ventana y salieron. */
  W: number; nW: number;
  /** Salidas del sistema en la ventana y rendimiento (por unidad). */
  salidas: number;
  /** Clases cerradas: ciclos completados en la estación de ciclo en la ventana, rendimiento y tiempo de ciclo medio. */
  ciclos: number; TH: number; CT: number; nCT: number;
}
export interface MedidasRed {
  id: string;
  semilla: number;
  replica: number;
  /** Largo de la ventana de medición (unidades). */
  ventana: number;
  /** Cantidad media en el sistema (promedio temporal). */
  L: number;
  estaciones: MedidasEstacion[];
  clases: MedidasClase[];
  observaciones: number[];
  serie: number[];
  /** Instante (unidades) en que se cumplió el objetivo; null si no se cumplió o no había. */
  tObjetivo: number | null;
  /** Primeras llegadas y sus servicios, en ms del motor (para R02). */
  primeras: { llegadas: number[]; servicios: number[] } | null;
  /** Estancias en el sistema (unidades), en orden de salida, de los que llegaron en la ventana. */
  estancias: number[] | null;
  /** Violaciones de conservación (vacío si entraron = salieron + adentro en cada estación y en cada clase). */
  conservacion: string[];
  /** Alertas del motor: 'tope-eventos', 'lazo-tiempo-cero'. */
  alertas: string[];
  corrida: { estado: EstadoCorrida; eventos: number; huella: string };
}

// ---------------------------------------------------------------------------------------------------------------------
// El bloque
// ---------------------------------------------------------------------------------------------------------------------

const E = TipoEventoRed;

function crecerF64(a: Float64Array, n: number, relleno = 0): Float64Array {
  const b = new Float64Array(n); b.set(a); if (relleno !== 0) b.fill(relleno, a.length); return b;
}
function crecerI32(a: Int32Array, n: number, relleno = 0): Int32Array {
  const b = new Int32Array(n); b.set(a); if (relleno !== 0) b.fill(relleno, a.length); return b;
}
function crecerU8(a: Uint8Array, n: number): Uint8Array { const b = new Uint8Array(n); b.set(a); return b; }

export class BloqueRed implements Bloque {
  readonly ruta: string;
  readonly cfg: RedCompilada;
  readonly indice: number;
  private readonly m: Motor;
  // Claves del azar (derivadas de la configuración: no son estado).
  private readonly kLlegada: Uint32Array;
  private readonly kAdelgazar: Uint32Array;
  private readonly kIniciales: Uint32Array;
  private readonly kServicio: Uint32Array;
  private readonly kRuteo: Uint32Array;
  private readonly dir: Direccion = { clave: 0, a: 0, b: 0, c: 0 };

  // ---- Estado: trabajos (ranuras reutilizables) ----
  capacidadTrabajos = 0;
  ranurasUsadas = 0;
  jClase: Int32Array = new Int32Array(0);
  jOrdinal: Float64Array = new Float64Array(0);
  jInicial: Uint8Array = new Uint8Array(0);
  jVisita: Float64Array = new Float64Array(0);
  jEstacion: Int32Array = new Int32Array(0);
  jLlegoSistema: Float64Array = new Float64Array(0);
  jLlegoEstacion: Float64Array = new Float64Array(0);
  jClaveSeq: Float64Array = new Float64Array(0);
  jRestante: Float64Array = new Float64Array(0);   // ms de servicio que faltan en la visita actual; −1 = sin sortear
  jInicio: Float64Array = new Float64Array(0);     // comienzo del tramo de servicio actual
  jSeqFin: Float64Array = new Float64Array(0);     // seq del FIN_SERVICIO vigente; −1 = ninguno
  jServidor: Int32Array = new Int32Array(0);     // índice global del servidor (estaciones finitas); −1 = ninguno
  jCicloDesde: Float64Array = new Float64Array(0); // última llegada a la estación de ciclo; −1 = nunca
  libres: Int32Array = new Int32Array(0);
  nLibres = 0;
  // ---- Estado: estaciones ----
  enEstacion: Int32Array;
  ocupados: Int32Array;
  servidorDe: Int32Array;            // trabajo en cada servidor (−1 libre)
  pilaLibres: Int32Array;            // servidores libres de cada estación, apilados desde offsetServidor[s]
  nPilaLibres: Int32Array;           // cuántos libres tiene cada estación
  colas: Int32Array[];               // montículo por estación, ordenado por (prioridad, llegada, orden)
  tamCola: Int32Array;
  entraronEst: Float64Array;
  salieronEst: Float64Array;
  intentosV: Float64Array;           // en la ventana
  bloqueadosV: Float64Array;
  llegadasV: Float64Array;           // [s·C+k] aceptadas en la ventana
  esperaronV: Float64Array;          // [s·C+k]
  // ---- Estado: clases ----
  proximoOrdinal: Float64Array;      // ordinal del próximo trabajo abierto
  proximoIntervalo: Float64Array;    // índice del próximo intervalo o candidato sorteado
  acumLlegada: Float64Array;         // instante (unidades) de la última llegada o candidato: se suma en unidades y se redondea una vez
  ordinalInicial: Float64Array;
  nacidos: Float64Array;
  salidosTot: Float64Array;
  perdidos: Float64Array;
  enSistema: Float64Array;
  salidasV: Float64Array;
  ciclosV: Float64Array;
  // ---- Estado: monitores y registros ----
  prom: PromediosTiempo;             // 0 = N · 1 = N para la serie · 2+3s = en estación · 3+3s = en cola · 4+3s = ocupados
  conteos: Conteos;                  // [s·C+k] = Wq · S·C + k = W · S·C + C + k = CT
  observaciones: Float64Array;
  serie: Float64Array = new Float64Array(0);
  nSerie = 0;
  estanciasReg: Float64Array = new Float64Array(0);
  nEstancias = 0;
  primLlegada: Float64Array;
  primServicio: Float64Array;
  contadorCola = 0;
  detenido = 0;
  tObjetivo = -1;
  salidasObjetivo = 0;
  fin = -1;

  constructor(m: Motor, config: ConfigRed | RedCompilada) {
    this.cfg = 'S' in config ? config : compilarRed(config);
    const c = this.cfg;
    if (m.opciones.hasta !== c.hastaMs) {
      throw new Error(`red ${c.config.id}: el motor se creó con hasta = ${m.opciones.hasta} ms y la red espera ${c.hastaMs} ms (horizonte · unidadSeg · 1000)`);
    }
    this.m = m;
    this.ruta = `red.${c.config.id}`;
    const { S, C } = c;
    this.kLlegada = new Uint32Array(C); this.kAdelgazar = new Uint32Array(C); this.kIniciales = new Uint32Array(C);
    this.kServicio = new Uint32Array(S); this.kRuteo = new Uint32Array(S);
    for (let k = 0; k < C; k++) {
      this.kLlegada[k] = m.claveDe(this.ruta, `llegada.${c.ids.clases[k]}`);
      this.kAdelgazar[k] = m.claveDe(this.ruta, `adelgazar.${c.ids.clases[k]}`);
      this.kIniciales[k] = m.claveDe(this.ruta, `iniciales.${c.ids.clases[k]}`);
    }
    for (let s = 0; s < S; s++) {
      this.kServicio[s] = m.claveDe(`${this.ruta}.${c.ids.estaciones[s]}`, 'servicio');
      this.kRuteo[s] = m.claveDe(`${this.ruta}.${c.ids.estaciones[s]}`, 'ruteo');
    }
    this.enEstacion = new Int32Array(S); this.ocupados = new Int32Array(S);
    this.servidorDe = new Int32Array(c.totalServidores).fill(-1);
    // Pila de libres: el próximo en salir es el de menor índice (determinista; el índice no afecta ningún sorteo).
    this.pilaLibres = new Int32Array(c.totalServidores);
    this.nPilaLibres = new Int32Array(S);
    for (let s = 0; s < S; s++) {
      if (c.servidores[s] === Infinity) continue;
      const o = c.offsetServidor[s], n = c.servidores[s];
      for (let i = 0; i < n; i++) this.pilaLibres[o + i] = o + n - 1 - i;
      this.nPilaLibres[s] = n;
    }
    this.colas = []; for (let s = 0; s < S; s++) this.colas.push(new Int32Array(16));
    this.tamCola = new Int32Array(S);
    this.entraronEst = new Float64Array(S); this.salieronEst = new Float64Array(S);
    this.intentosV = new Float64Array(S); this.bloqueadosV = new Float64Array(S);
    this.llegadasV = new Float64Array(S * C); this.esperaronV = new Float64Array(S * C);
    this.proximoOrdinal = new Float64Array(C); this.proximoIntervalo = new Float64Array(C); this.ordinalInicial = new Float64Array(C);
    this.acumLlegada = new Float64Array(C);
    this.nacidos = new Float64Array(C); this.salidosTot = new Float64Array(C); this.perdidos = new Float64Array(C);
    this.enSistema = new Float64Array(C); this.salidasV = new Float64Array(C); this.ciclosV = new Float64Array(C);
    this.prom = new PromediosTiempo(2 + 3 * S);
    this.conteos = new Conteos(S * C + 2 * C);
    this.observaciones = new Float64Array(c.observarMs.length).fill(Number.NaN);
    this.primLlegada = new Float64Array(c.primeras).fill(Number.NaN);
    this.primServicio = new Float64Array(c.primeras).fill(Number.NaN);
    this.reservarTrabajos(64);
    this.indice = m.registrar(this);
    m.agendar(0, this.indice, E.INICIO, 0, Fase.URGENTE, 0);
    if (c.calMs > 0) m.agendar(c.calMs, this.indice, E.CALENTAMIENTO, 0, Fase.TARDIA, 0);
    c.observarMs.forEach((t, i) => m.agendar(t, this.indice, E.OBSERVAR, i, Fase.TARDIA, 0));
    if (c.serieMs > 0 && c.serieMs <= c.hastaMs) m.agendar(c.serieMs, this.indice, E.SERIE, 0, Fase.TARDIA, 0);
  }

  // ---- Trabajos ----

  private reservarTrabajos(n: number): void {
    const viejo = this.capacidadTrabajos;
    if (n <= viejo) return;
    this.jClase = crecerI32(this.jClase, n); this.jOrdinal = crecerF64(this.jOrdinal, n); this.jInicial = crecerU8(this.jInicial, n);
    this.jVisita = crecerF64(this.jVisita, n); this.jEstacion = crecerI32(this.jEstacion, n, -1);
    this.jLlegoSistema = crecerF64(this.jLlegoSistema, n); this.jLlegoEstacion = crecerF64(this.jLlegoEstacion, n);
    this.jClaveSeq = crecerF64(this.jClaveSeq, n); this.jRestante = crecerF64(this.jRestante, n, -1);
    this.jInicio = crecerF64(this.jInicio, n); this.jSeqFin = crecerF64(this.jSeqFin, n, -1);
    this.jServidor = crecerI32(this.jServidor, n, -1); this.jCicloDesde = crecerF64(this.jCicloDesde, n, -1);
    this.libres = crecerI32(this.libres, n);
    this.capacidadTrabajos = n;
  }

  private nuevoTrabajo(k: number, ordinal: number, inicial: number, t: Ms): number {
    let j: number;
    if (this.nLibres > 0) j = this.libres[--this.nLibres];
    else {
      if (this.ranurasUsadas === this.capacidadTrabajos) this.reservarTrabajos(this.capacidadTrabajos * 2);
      j = this.ranurasUsadas++;
    }
    this.jClase[j] = k; this.jOrdinal[j] = ordinal; this.jInicial[j] = inicial; this.jVisita[j] = 0; this.jEstacion[j] = -1;
    this.jLlegoSistema[j] = t; this.jLlegoEstacion[j] = t; this.jClaveSeq[j] = 0; this.jRestante[j] = -1; this.jInicio[j] = 0;
    this.jSeqFin[j] = -1; this.jServidor[j] = -1; this.jCicloDesde[j] = -1;
    this.nacidos[k] += 1;
    this.enSistema[k] += 1;
    this.prom.sumar(0, 1, t); this.prom.sumar(1, 1, t);
    return j;
  }

  private liberarTrabajo(j: number): void {
    this.jEstacion[j] = -1; this.jSeqFin[j] = -1; this.jServidor[j] = -1;
    this.libres[this.nLibres++] = j;
  }

  private sortear(d: Distribucion, clave: number, a: number, b: number, c: number): number {
    const dir = this.dir;
    dir.clave = clave; dir.a = a; dir.b = b; dir.c = c;
    return this.m.azar.sortear(d, dir);
  }
  private uniforme(clave: number, a: number, b: number, c: number): number {
    const dir = this.dir;
    dir.clave = clave; dir.a = a; dir.b = b; dir.c = c;
    return this.m.azar.uniforme(dir, 0);
  }
  private cDe(j: number): number { return 2 * this.jClase[j] + this.jInicial[j]; }

  // ---- Cola por estación: montículo binario de trabajos con clave (prioridad, llegada, orden) ----

  private antes(x: number, y: number): boolean {
    const px = this.cfg.prioridad[this.jClase[x]], py = this.cfg.prioridad[this.jClase[y]];
    if (px !== py) return px < py;
    const tx = this.jLlegoEstacion[x], ty = this.jLlegoEstacion[y];
    if (tx !== ty) return tx < ty;
    return this.jClaveSeq[x] < this.jClaveSeq[y];
  }
  private encolar(s: number, j: number): void {
    let h = this.colas[s];
    if (this.tamCola[s] === h.length) { h = crecerI32(h, h.length * 2); this.colas[s] = h; }
    let i = this.tamCola[s]++;
    h[i] = j;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.antes(h[i], h[p])) break;
      const t = h[i]; h[i] = h[p]; h[p] = t; i = p;
    }
  }
  private desencolar(s: number): number {
    const h = this.colas[s];
    const n = --this.tamCola[s];
    const top = h[0];
    if (n > 0) {
      h[0] = h[n];
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < n && this.antes(h[l], h[m])) m = l;
        if (r < n && this.antes(h[r], h[m])) m = r;
        if (m === i) break;
        const t = h[i]; h[i] = h[m]; h[m] = t; i = m;
      }
    }
    return top;
  }

  // ---- Mecánica ----

  manejar(m: Motor, tipo: number, arg: number): void {
    if (this.detenido) return;
    switch (tipo) {
      case E.INICIO: this.alIniciar(m); return;
      case E.LLEGADA: this.alLlegar(m, arg); return;
      case E.FIN_SERVICIO: this.alTerminar(m, arg); return;
      case E.CALENTAMIENTO: this.alCalentar(m); return;
      case E.OBSERVAR: this.observaciones[arg] = this.prom.valor[0]; return;
      case E.SERIE: this.alSerie(m); return;
      default: throw new Error(`red ${this.cfg.config.id}: tipo de evento desconocido ${tipo} (se esperaba 1 a 6)`);
    }
  }

  private alIniciar(m: Motor): void {
    const c = this.cfg, t = m.ahora;
    // Población cerrada: todos en su estación de entrada, en orden de ordinal.
    for (let k = 0; k < c.C; k++) {
      if (c.abierta[k]) continue;
      for (let n = 0; n < c.poblacion[k]; n++) this.llegarAEstacion(m, this.nuevoTrabajo(k, n, 0, t), c.entrada[k]);
    }
    // Trabajos abiertos presentes al arrancar.
    c.iniciales.forEach((x, i) => {
      const cant = typeof x.cantidad === 'number' ? x.cantidad : Math.round(this.sortear(x.cantidad, this.kIniciales[x.clase], i, 0, 0));
      for (let n = 0; n < cant; n++) {
        const ord = this.ordinalInicial[x.clase]++;
        this.llegarAEstacion(m, this.nuevoTrabajo(x.clase, ord, 1, t), x.estacion);
      }
    });
    // Primeras llegadas externas.
    for (let k = 0; k < c.C; k++) if (c.abierta[k]) this.agendarProximaLlegada(m, k);
  }

  /**
   * Sortea el próximo intervalo (o candidato, si es senoidal) y agenda la llegada si no pasa del límite. El instante se acumula en
   * unidades y se lleva a ms una sola vez: las llegadas deterministas no derivan (la n-ésima cae en round(n/λ)) y escalar todas las
   * duraciones por 60 escala los instantes por 60 con un error de medio ms (prueba M01).
   */
  private agendarProximaLlegada(m: Motor, k: number): void {
    const l = this.cfg.llegadas[k]!;
    const n = this.proximoIntervalo[k]++;
    const dt = this.sortear(l.tipo === 'renovacion' ? l.entre : this.cfg.entreCandidatos[k]!, this.kLlegada[k], n, 0, 0);
    this.acumLlegada[k] += dt;
    const t = Math.max(m.ahora, aMs(this.acumLlegada[k] * this.cfg.unidadSeg));
    if (t > this.cfg.hastaLlegadasMs[k] || t > this.cfg.hastaMs) return;
    m.agendar(t, this.indice, E.LLEGADA, k, Fase.NORMAL, 0);
  }

  private alLlegar(m: Motor, k: number): void {
    const c = this.cfg, t = m.ahora;
    const l = c.llegadas[k]!;
    const candidato = this.proximoIntervalo[k] - 1;
    this.agendarProximaLlegada(m, k);
    if (l.tipo === 'senoidal') {
      // Adelgazamiento: se acepta con probabilidad λ(t) / λmáx. La fase se reduce a [0, 1) con el período en ms enteros.
      const per = aMs(l.periodo * c.unidadSeg);
      const fase = (t % per) / per;
      const acepta = (1 + l.amplitud * m.mat.sin(2 * Math.PI * fase)) / (1 + l.amplitud);
      if (!(this.uniforme(this.kAdelgazar[k], candidato, 0, 0) < acepta)) return;
    }
    const ord = this.proximoOrdinal[k]++;
    if (ord < c.primeras && k === c.primeraAbierta) this.primLlegada[ord] = t;
    const j = this.nuevoTrabajo(k, ord, 0, t);
    this.llegarAEstacion(m, j, c.entrada[k]);
  }

  private llegarAEstacion(m: Motor, j: number, s: number): void {
    const c = this.cfg, t = m.ahora, k = this.jClase[j], enVentana = t >= c.calMs;
    if (enVentana) this.intentosV[s] += 1;
    if (this.enEstacion[s] >= c.capacidad[s]) {
      // Estación llena: el arribo se pierde (solo clases abiertas: la validación lo garantiza).
      if (enVentana) this.bloqueadosV[s] += 1;
      this.perdidos[k] += 1;
      this.salirDelSistema(m, j, false);
      return;
    }
    this.enEstacion[s] += 1;
    this.entraronEst[s] += 1;
    this.prom.sumar(2 + 3 * s, 1, t);
    this.jEstacion[j] = s;
    this.jLlegoEstacion[j] = t;
    this.jClaveSeq[j] = this.contadorCola++;
    this.jRestante[j] = -1;
    if (s === c.ciclo && !c.abierta[k]) {
      const desde = this.jCicloDesde[j];
      if (desde >= 0) {
        if (desde >= c.calMs) this.conteos.agregar(c.S * c.C + c.C + k, (t - desde) / c.msUnidad);
        if (enVentana) this.ciclosV[k] += 1;
      }
      this.jCicloDesde[j] = t;
    }
    if (enVentana) this.llegadasV[s * c.C + k] += 1;
    if (this.ocupados[s] < c.servidores[s]) { this.iniciarServicio(m, j, s); return; }
    if (c.preempta[k] && this.intentarDesalojar(m, j, s)) return;
    if (enVentana) this.esperaronV[s * c.C + k] += 1;
    this.encolar(s, j);
    this.prom.sumar(3 + 3 * s, 1, t);
  }

  /** Preempción con reanudación: si el que llega iría primero en la cola y hay alguien de menor prioridad en servicio, lo desaloja. */
  private intentarDesalojar(m: Motor, j: number, s: number): boolean {
    const c = this.cfg, pj = c.prioridad[this.jClase[j]];
    if (this.tamCola[s] > 0 && c.prioridad[this.jClase[this.colas[s][0]]] <= pj) return false;
    if (c.servidores[s] === Infinity) return false;
    const o = c.offsetServidor[s], n = c.servidores[s];
    let victima = -1;
    for (let i = o; i < o + n; i++) {
      const v = this.servidorDe[i];
      if (v < 0) continue;
      if (victima < 0) { victima = v; continue; }
      const pv = c.prioridad[this.jClase[v]], pw = c.prioridad[this.jClase[victima]];
      if (pv > pw || (pv === pw && this.jInicio[v] > this.jInicio[victima])) victima = v;
    }
    if (victima < 0 || c.prioridad[this.jClase[victima]] <= pj) return false;
    const t = m.ahora;
    this.jRestante[victima] -= t - this.jInicio[victima];
    this.jSeqFin[victima] = -1;
    this.soltarServidor(victima, s);
    this.ocupados[s] -= 1;
    this.prom.sumar(4 + 3 * s, -1, t);
    this.encolar(s, victima);
    this.prom.sumar(3 + 3 * s, 1, t);
    this.iniciarServicio(m, j, s);
    return true;
  }

  private iniciarServicio(m: Motor, j: number, s: number): void {
    const c = this.cfg, t = m.ahora, k = this.jClase[j];
    if (this.jRestante[j] < 0) {
      // Primera vez que se atiende en esta visita: se sortea el servicio y se mide la espera en la cola.
      const x = this.sortear(c.servicio[s * c.C + k], this.kServicio[s], this.jOrdinal[j], this.jVisita[j], this.cDe(j));
      if (!(x >= 0) || !Number.isFinite(x)) throw new Error(`red ${c.config.id}: servicio sorteado inválido en ${c.ids.estaciones[s]}: ${x}`);
      this.jRestante[j] = aMs(x * c.unidadSeg);
      // Las primeras llegadas y sus servicios se registran solo para la primera clase abierta (R02 usa una sola clase).
      if (this.jVisita[j] === 0 && this.jInicial[j] === 0 && this.jOrdinal[j] < c.primeras && k === c.primeraAbierta) this.primServicio[this.jOrdinal[j]] = this.jRestante[j];
      if (this.jLlegoEstacion[j] >= c.calMs) this.conteos.agregar(s * c.C + k, (t - this.jLlegoEstacion[j]) / c.msUnidad);
    }
    if (c.servidores[s] !== Infinity) {
      if (this.nPilaLibres[s] === 0) throw new Error(`red ${c.config.id}: no hay servidor libre en ${c.ids.estaciones[s]} (ocupados ${this.ocupados[s]} de ${c.servidores[s]})`);
      const libre = this.pilaLibres[c.offsetServidor[s] + --this.nPilaLibres[s]];
      this.servidorDe[libre] = j;
      this.jServidor[j] = libre;
    }
    this.ocupados[s] += 1;
    this.prom.sumar(4 + 3 * s, 1, t);
    this.jInicio[j] = t;
    this.jSeqFin[j] = m.agendar(t + this.jRestante[j], this.indice, E.FIN_SERVICIO, j, Fase.NORMAL, 0);
  }

  private soltarServidor(j: number, s: number): void {
    const i = this.jServidor[j];
    this.servidorDe[i] = -1;
    this.jServidor[j] = -1;
    this.pilaLibres[this.cfg.offsetServidor[s] + this.nPilaLibres[s]++] = i;
  }

  private alTerminar(m: Motor, j: number): void {
    if (this.jSeqFin[j] !== m.seq) return; // evento viejo: el trabajo fue desalojado y su fin se reagendó
    const c = this.cfg, t = m.ahora, s = this.jEstacion[j];
    // Libera el servidor y sale de la estación.
    if (this.jServidor[j] >= 0) this.soltarServidor(j, s);
    this.ocupados[s] -= 1;
    this.enEstacion[s] -= 1;
    this.salieronEst[s] += 1;
    this.prom.sumar(4 + 3 * s, -1, t);
    this.prom.sumar(2 + 3 * s, -1, t);
    this.jSeqFin[j] = -1;
    this.jRestante[j] = -1;
    this.jEstacion[j] = -1;
    // El siguiente de la cola empieza antes de rutear al que sale (si vuelve a esta estación, va al final).
    if (this.tamCola[s] > 0 && this.ocupados[s] < c.servidores[s]) {
      const sig = this.desencolar(s);
      this.prom.sumar(3 + 3 * s, -1, t);
      this.iniciarServicio(m, sig, s);
    }
    // Ruteo sorteado por (trabajo, visita).
    const k = this.jClase[j];
    const dst = c.ruteoDestino[k * c.S + s], acum = c.ruteoAcum[k * c.S + s];
    let destino = -1;
    if (dst.length > 0) {
      const u = this.uniforme(this.kRuteo[s], this.jOrdinal[j], this.jVisita[j], this.cDe(j));
      for (let i = 0; i < dst.length; i++) if (u < acum[i]) { destino = dst[i]; break; }
      // Clase cerrada con probabilidades que suman 1 salvo redondeo: nunca sale.
      if (destino < 0 && !c.abierta[k]) destino = dst[dst.length - 1];
    }
    this.jVisita[j] += 1;
    if (destino < 0) { this.salirDelSistema(m, j, true); return; }
    this.llegarAEstacion(m, j, destino);
  }

  private salirDelSistema(m: Motor, j: number, completo: boolean): void {
    const c = this.cfg, t = m.ahora, k = this.jClase[j];
    this.enSistema[k] -= 1;
    this.prom.sumar(0, -1, t); this.prom.sumar(1, -1, t);
    if (completo) {
      this.salidosTot[k] += 1;
      if (t >= c.calMs) this.salidasV[k] += 1;
      if (this.jLlegoSistema[j] >= c.calMs) {
        const w = (t - this.jLlegoSistema[j]) / c.msUnidad;
        this.conteos.agregar(c.S * c.C + k, w);
        if (c.estancias) {
          if (this.nEstancias === this.estanciasReg.length) this.estanciasReg = crecerF64(this.estanciasReg, Math.max(1024, this.nEstancias * 2));
          this.estanciasReg[this.nEstancias++] = w;
        }
      }
      if (k === c.objetivoClase && ++this.salidasObjetivo === c.objetivoSalidas) {
        // Objetivo cumplido: se anota el instante y el bloque ignora todo lo que queda en el calendario.
        this.tObjetivo = t;
        this.detenido = 1;
      }
    }
    this.liberarTrabajo(j);
  }

  /** Empieza la ventana de medición: reinicia todos los promedios menos el de la serie (índice 1), que lleva su propio intervalo. */
  private alCalentar(m: Motor): void {
    for (let i = 0; i < this.prom.n; i++) if (i !== 1) this.prom.reiniciarIndice(i, m.ahora);
  }

  private alSerie(m: Motor): void {
    const c = this.cfg, t = m.ahora;
    if (this.nSerie === this.serie.length) this.serie = crecerF64(this.serie, Math.max(256, this.nSerie * 2));
    this.serie[this.nSerie++] = this.prom.media(1, t);
    this.prom.reiniciarIndice(1, t);
    if (t + c.serieMs <= c.hastaMs) m.agendar(t + c.serieMs, this.indice, E.SERIE, this.nSerie, Fase.TARDIA, 0);
  }

  finalizar(m: Motor): void {
    // La ventana de medición termina en el horizonte (o cuando se cumplió el objetivo).
    // Si el calendario se vació antes (una oficina que atiende hasta vaciarse), la ventana igual termina en el horizonte.
    void m;
    this.fin = this.detenido ? this.tObjetivo : this.cfg.hastaMs;
  }

  // ---- Medidas y controles ----

  /** Controles de conservación (exactos): por estación, por clase y en el total. Devuelve las violaciones. */
  conservacion(): string[] {
    const c = this.cfg, v: string[] = [];
    let totalEst = 0;
    for (let s = 0; s < c.S; s++) {
      const id = c.ids.estaciones[s];
      if (this.entraronEst[s] !== this.salieronEst[s] + this.enEstacion[s]) {
        v.push(`estación ${id}: entraron ${this.entraronEst[s]} y se esperaba salieron + adentro = ${this.salieronEst[s]} + ${this.enEstacion[s]}`);
      }
      const enServicio = c.servidores[s] === Infinity ? this.ocupados[s] : this.contarServidores(s);
      if (enServicio !== this.ocupados[s]) v.push(`estación ${id}: ${this.ocupados[s]} ocupados anotados y ${enServicio} servidores con trabajo`);
      if (this.enEstacion[s] !== this.ocupados[s] + this.tamCola[s]) {
        v.push(`estación ${id}: ${this.enEstacion[s]} adentro y se esperaba en servicio + en cola = ${this.ocupados[s]} + ${this.tamCola[s]}`);
      }
      if (this.ocupados[s] > c.servidores[s]) v.push(`estación ${id}: ${this.ocupados[s]} en servicio con ${c.servidores[s]} servidores`);
      if (this.enEstacion[s] > c.capacidad[s]) v.push(`estación ${id}: ${this.enEstacion[s]} adentro con capacidad ${c.capacidad[s]}`);
      totalEst += this.enEstacion[s];
    }
    let totalCla = 0;
    for (let k = 0; k < c.C; k++) {
      const id = c.ids.clases[k];
      if (c.abierta[k]) {
        if (this.nacidos[k] !== this.salidosTot[k] + this.perdidos[k] + this.enSistema[k]) {
          v.push(`clase ${id}: nacieron ${this.nacidos[k]} y se esperaba salieron + perdidos + adentro = ${this.salidosTot[k]} + ${this.perdidos[k]} + ${this.enSistema[k]}`);
        }
      } else if (this.enSistema[k] !== c.poblacion[k]) {
        v.push(`clase cerrada ${id}: ${this.enSistema[k]} en el sistema y la población es ${c.poblacion[k]}`);
      }
      totalCla += this.enSistema[k];
    }
    if (totalEst !== totalCla) v.push(`total: ${totalEst} en estaciones y ${totalCla} según las clases`);
    if (this.prom.valor[0] !== totalCla) v.push(`total: el monitor de N marca ${this.prom.valor[0]} y hay ${totalCla}`);
    return v;
  }
  private contarServidores(s: number): number {
    const o = this.cfg.offsetServidor[s], n = this.cfg.servidores[s];
    let x = 0;
    for (let i = o; i < o + n; i++) if (this.servidorDe[i] >= 0) x++;
    return x;
  }

  medidas(r: ResultadoCorrida, semilla: number, replica: number): MedidasRed {
    const c = this.cfg, { S, C } = c;
    const fin = this.fin >= 0 ? this.fin : c.hastaMs;
    const ventanaMs = fin - c.calMs;
    const ventana = ventanaMs / c.msUnidad;
    const estaciones: MedidasEstacion[] = [];
    for (let s = 0; s < S; s++) {
      const Wq: number[] = [], nWq: number[] = [], pEspera: number[] = [];
      for (let k = 0; k < C; k++) {
        Wq.push(this.conteos.media(s * C + k));
        nWq.push(this.conteos.cantidad[s * C + k]);
        const ll = this.llegadasV[s * C + k];
        pEspera.push(ll > 0 ? this.esperaronV[s * C + k] / ll : Number.NaN);
      }
      const cs = c.servidores[s];
      const ocup = this.prom.media(4 + 3 * s, fin);
      estaciones.push({
        id: c.ids.estaciones[s], L: this.prom.media(2 + 3 * s, fin), Lq: this.prom.media(3 + 3 * s, fin),
        ocupacion: cs === Infinity ? ocup : ocup / cs, Wq, nWq, pEspera,
        intentos: this.intentosV[s], bloqueados: this.bloqueadosV[s],
        pBloqueo: this.intentosV[s] > 0 ? this.bloqueadosV[s] / this.intentosV[s] : Number.NaN,
      });
    }
    const clases: MedidasClase[] = [];
    for (let k = 0; k < C; k++) {
      clases.push({
        id: c.ids.clases[k], W: this.conteos.media(S * C + k), nW: this.conteos.cantidad[S * C + k], salidas: this.salidasV[k],
        ciclos: this.ciclosV[k], TH: ventana > 0 ? this.ciclosV[k] / ventana : Number.NaN,
        CT: this.conteos.media(S * C + C + k), nCT: this.conteos.cantidad[S * C + C + k],
      });
    }
    const alertas: string[] = [];
    if (r.estado === 'tope-eventos' || r.estado === 'lazo-tiempo-cero') alertas.push(r.estado);
    return {
      id: c.config.id, semilla, replica, ventana, L: this.prom.media(0, fin), estaciones, clases,
      observaciones: Array.from(this.observaciones), serie: Array.from(this.serie.subarray(0, this.nSerie)),
      tObjetivo: this.tObjetivo >= 0 ? this.tObjetivo / c.msUnidad : null,
      primeras: c.primeras > 0 ? { llegadas: Array.from(this.primLlegada), servicios: Array.from(this.primServicio) } : null,
      estancias: c.estancias ? Array.from(this.estanciasReg.subarray(0, this.nEstancias)) : null,
      conservacion: this.conservacion(), alertas,
      corrida: { estado: r.estado, eventos: r.eventos, huella: r.huella },
    };
  }

  // ---- Foto ----

  estado(): EstadoBloque {
    const e: EstadoBloque = {
      capacidadTrabajos: this.capacidadTrabajos, ranurasUsadas: this.ranurasUsadas, nLibres: this.nLibres,
      jClase: this.jClase.slice(), jOrdinal: this.jOrdinal.slice(), jInicial: this.jInicial.slice(), jVisita: this.jVisita.slice(),
      jEstacion: this.jEstacion.slice(), jLlegoSistema: this.jLlegoSistema.slice(), jLlegoEstacion: this.jLlegoEstacion.slice(),
      jClaveSeq: this.jClaveSeq.slice(), jRestante: this.jRestante.slice(), jInicio: this.jInicio.slice(), jSeqFin: this.jSeqFin.slice(),
      jServidor: this.jServidor.slice(), jCicloDesde: this.jCicloDesde.slice(), libres: this.libres.slice(),
      enEstacion: this.enEstacion.slice(), ocupados: this.ocupados.slice(), servidorDe: this.servidorDe.slice(), tamCola: this.tamCola.slice(),
      pilaLibres: this.pilaLibres.slice(), nPilaLibres: this.nPilaLibres.slice(),
      entraronEst: this.entraronEst.slice(), salieronEst: this.salieronEst.slice(), intentosV: this.intentosV.slice(),
      bloqueadosV: this.bloqueadosV.slice(), llegadasV: this.llegadasV.slice(), esperaronV: this.esperaronV.slice(),
      proximoOrdinal: this.proximoOrdinal.slice(), proximoIntervalo: this.proximoIntervalo.slice(), ordinalInicial: this.ordinalInicial.slice(),
      acumLlegada: this.acumLlegada.slice(),
      nacidos: this.nacidos.slice(), salidosTot: this.salidosTot.slice(), perdidos: this.perdidos.slice(), enSistema: this.enSistema.slice(),
      salidasV: this.salidasV.slice(), ciclosV: this.ciclosV.slice(), observaciones: this.observaciones.slice(),
      serie: this.serie.slice(), nSerie: this.nSerie, estanciasReg: this.estanciasReg.slice(), nEstancias: this.nEstancias,
      primLlegada: this.primLlegada.slice(), primServicio: this.primServicio.slice(),
      contadorCola: this.contadorCola, detenido: this.detenido, tObjetivo: this.tObjetivo, salidasObjetivo: this.salidasObjetivo, fin: this.fin,
      ...this.prom.estado('prom'), ...this.conteos.estado('conteos'),
    };
    for (let s = 0; s < this.cfg.S; s++) e[`cola.${s}`] = this.colas[s].slice();
    return e;
  }

  restaurar(e: EstadoBloque): void {
    const num = (k: string): number => { const v = e[k]; if (typeof v !== 'number') throw new Error(`restaurar red: se esperaba el número «${k}» y llegó ${typeof v}`); return v; };
    const mal = (k: string, tipo: string): never => {
      const v = e[k];
      throw new Error(`restaurar red: se esperaba «${k}» como ${tipo} y llegó ${v === undefined ? 'nada' : typeof v === 'number' ? 'un número' : v.constructor.name}`);
    };
    const f64 = (k: string): Float64Array => { const v = e[k]; return v instanceof Float64Array ? v.slice() : mal(k, 'Float64Array'); };
    const i32 = (k: string): Int32Array => { const v = e[k]; return v instanceof Int32Array ? v.slice() : mal(k, 'Int32Array'); };
    const u8 = (k: string): Uint8Array => { const v = e[k]; return v instanceof Uint8Array ? v.slice() : mal(k, 'Uint8Array'); };
    this.capacidadTrabajos = num('capacidadTrabajos'); this.ranurasUsadas = num('ranurasUsadas'); this.nLibres = num('nLibres');
    this.jClase = i32('jClase'); this.jOrdinal = f64('jOrdinal'); this.jInicial = u8('jInicial');
    this.jVisita = f64('jVisita'); this.jEstacion = i32('jEstacion'); this.jLlegoSistema = f64('jLlegoSistema');
    this.jLlegoEstacion = f64('jLlegoEstacion'); this.jClaveSeq = f64('jClaveSeq'); this.jRestante = f64('jRestante');
    this.jInicio = f64('jInicio'); this.jSeqFin = f64('jSeqFin'); this.jServidor = i32('jServidor');
    this.jCicloDesde = f64('jCicloDesde'); this.libres = i32('libres');
    this.enEstacion = i32('enEstacion'); this.ocupados = i32('ocupados'); this.servidorDe = i32('servidorDe');
    this.tamCola = i32('tamCola'); this.pilaLibres = i32('pilaLibres'); this.nPilaLibres = i32('nPilaLibres'); this.entraronEst = f64('entraronEst'); this.salieronEst = f64('salieronEst');
    this.intentosV = f64('intentosV'); this.bloqueadosV = f64('bloqueadosV'); this.llegadasV = f64('llegadasV');
    this.esperaronV = f64('esperaronV'); this.proximoOrdinal = f64('proximoOrdinal');
    this.proximoIntervalo = f64('proximoIntervalo'); this.ordinalInicial = f64('ordinalInicial'); this.acumLlegada = f64('acumLlegada');
    this.nacidos = f64('nacidos'); this.salidosTot = f64('salidosTot'); this.perdidos = f64('perdidos');
    this.enSistema = f64('enSistema'); this.salidasV = f64('salidasV'); this.ciclosV = f64('ciclosV');
    this.observaciones = f64('observaciones'); this.serie = f64('serie'); this.nSerie = num('nSerie');
    this.estanciasReg = f64('estanciasReg'); this.nEstancias = num('nEstancias');
    this.primLlegada = f64('primLlegada'); this.primServicio = f64('primServicio');
    this.contadorCola = num('contadorCola'); this.detenido = num('detenido'); this.tObjetivo = num('tObjetivo');
    this.salidasObjetivo = num('salidasObjetivo'); this.fin = num('fin');
    this.prom.restaurar(e, 'prom'); this.conteos.restaurar(e, 'conteos');
    for (let s = 0; s < this.cfg.S; s++) this.colas[s] = i32(`cola.${s}`);
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Atajo: una corrida completa
// ---------------------------------------------------------------------------------------------------------------------

export interface OpcionesCorridaRed { maxEventos?: number }

/** Crea el motor, monta la red, corre hasta el horizonte (o el objetivo), finaliza y devuelve las medidas. */
export function correrRed(crearMotor: CrearMotor, config: ConfigRed | RedCompilada, semilla: number, replica: number, o: OpcionesCorridaRed = {}): MedidasRed {
  const cfg = 'S' in config ? config : compilarRed(config);
  const m = crearMotor({ semilla, replica, hasta: cfg.hastaMs, traza: 'no', ...(o.maxEventos !== undefined ? { maxEventos: o.maxEventos } : {}) });
  const red = new BloqueRed(m, cfg);
  const r = m.correr();
  m.finalizar();
  return red.medidas(r, semilla, replica);
}
