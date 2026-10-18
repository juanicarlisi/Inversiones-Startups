// nucleo/motor/motor.ts · El motor de producción (contratos/motor.ts; semántica en corte-1.md §6.1, §6.4 y §6.5).
//
// Misma semántica que la referencia de contratos/referencia/motor-referencia.ts (prueba R08: misma huella), con tres diferencias que
// no cambian ninguna corrida válida y están anotadas en nucleo/NOTAS-CONTRATO.md:
//   1. el calendario es un montículo en columnas de arreglos tipados (rápido y serializable), no un arreglo de objetos;
//   2. implementa foto() y restaurar();
//   3. valida más: bloque registrado, tipo, arg y prioridad enteros de 32 bits, fase 0/1/2, y correrHasta nunca pasa del horizonte.
// Todas las funciones son clausuras (como en la referencia): `const { agendar } = m` funciona.
//
// Rendimiento: el estado que cambia en cada evento (ahora, seq, huella, contadores) vive en un Float64Array y no en variables de la
// clausura. Los carriles de la huella son uint32 (no entran en un entero pequeño de V8) y guardarlos en la clausura obliga a V8 a
// reservar un número en el heap por evento; en el arreglo tipado no hay reserva. MEDIDO el 18-10-2026: +12–17% de eventos por segundo.
import { Fase, type Ms } from '../../contratos/tipos-base.ts';
import type { Bloque, CrearMotor, EstadoBloque, EstadoCorrida, Foto, Motor, OpcionesMotor, ResultadoCorrida } from '../../contratos/motor.ts';
import { crearFuenteAzar } from '../azar/fuente.ts';
import { claveDe } from '../azar/clave.ts';
import { det } from '../matematica/det.ts';
import { crearEscritorTraza } from '../traza/escritor.ts';
import { Calendario } from './calendario.ts';
import { carril1, carril2, H1_INICIO, H2_INICIO, hex16 } from './huella.ts';
import { clonarEstado, columnasDeFoto, exigirMismosBloques, huellasDeRutas, numeroFoto, rutasRepetidas } from './foto.ts';

export const MAX_EVENTOS_POR_DEFECTO = 50_000_000;
export const MAX_MISMO_INSTANTE_POR_DEFECTO = 1_000_000;
const DOS_32 = 4294967296;

// Casillas del estado caliente del motor.
const AHORA = 0; // instante actual (ms)
const SEQ = 1; // próximo seq a asignar
const ACTUAL = 2; // seq del evento en proceso (o del último procesado); −1 al empezar
const EVENTOS = 3; // eventos procesados
const H1 = 4, H2 = 5; // carriles de la huella
const MISMO = 6, T_ANTERIOR = 7; // guardián de lazos de tiempo cero: repeticiones seguidas del mismo instante y ese instante

function validarOpciones(o: OpcionesMotor): void {
  if (o === null || typeof o !== 'object') throw new TypeError('crearMotor: se esperaban opciones { semilla, replica, hasta, traza }');
  for (const nombre of ['semilla', 'replica'] as const) {
    const x = o[nombre];
    if (!Number.isInteger(x) || x < 0 || x > 0xffffffff) {
      throw new RangeError(`crearMotor: se esperaba ${nombre} entera entre 0 y 4.294.967.295 (uint32) y llegó ${x}`);
    }
  }
  if (typeof o.hasta !== 'number' || !(o.hasta >= 0)) {
    throw new RangeError(`crearMotor: se esperaba hasta (horizonte en ms) ≥ 0 y llegó ${o.hasta}`);
  }
  if (o.traza !== 'no' && o.traza !== 'kpi' && o.traza !== 'completa') {
    throw new RangeError(`crearMotor: se esperaba traza 'no', 'kpi' o 'completa' y llegó ${String(o.traza)}`);
  }
  for (const nombre of ['maxEventos', 'maxMismoInstante'] as const) {
    const x = o[nombre];
    if (x !== undefined && (!Number.isInteger(x) || x < 0)) {
      throw new RangeError(`crearMotor: se esperaba ${nombre} entero ≥ 0 (o sin definir) y llegó ${x}`);
    }
  }
}

function esInt32(x: number): boolean {
  return (x | 0) === x;
}

/** Crea un motor. Ver contratos/motor.ts. */
export const crearMotor: CrearMotor = (opciones: OpcionesMotor): Motor => {
  validarOpciones(opciones);
  const o: Readonly<OpcionesMotor> = Object.freeze({ ...opciones });
  const horizonte = o.hasta;
  const maxEventos = o.maxEventos ?? MAX_EVENTOS_POR_DEFECTO;
  const maxMismo = o.maxMismoInstante ?? MAX_MISMO_INSTANTE_POR_DEFECTO;

  const bloques: Bloque[] = [];
  const cal = new Calendario();
  const E = new Float64Array(8);
  E[ACTUAL] = -1; E[H1] = H1_INICIO; E[H2] = H2_INICIO; E[T_ANTERIOR] = -1;
  let procesando = false; // true mientras corre correrHasta (foto, restaurar y correr no se pueden llamar desde manejar)

  const azar = crearFuenteAzar(o.semilla, o.replica);
  const traza = crearEscritorTraza(o.traza);

  const registrar = (b: Bloque): number => {
    if (b === null || typeof b !== 'object' || typeof b.manejar !== 'function') {
      throw new TypeError('registrar: se esperaba un bloque con manejar(m, tipo, arg), estado() y restaurar(e)');
    }
    if (typeof b.ruta !== 'string' || b.ruta.length === 0) {
      throw new TypeError(`registrar: se esperaba una ruta de texto no vacía (p. ej. 'hub.sorter') y llegó ${String(b.ruta)}`);
    }
    bloques.push(b);
    return bloques.length - 1;
  };

  const agendar = (t: Ms, bloque: number, tipo: number, arg: number, fase: Fase = Fase.NORMAL, prioridad = 0): number => {
    if (!Number.isInteger(t)) {
      throw new TypeError(`agendar: se esperaba un tiempo entero en ms y llegó ${t} (bloque ${bloque}, tipo ${tipo}); convertí los segundos con aMs()`);
    }
    if (t < E[AHORA]) {
      throw new RangeError(`agendar: tiempo en el pasado: t = ${t} ms < ahora = ${E[AHORA]} ms (bloque ${bloque}, tipo ${tipo})`);
    }
    if (!esInt32(bloque) || bloque < 0 || bloque >= bloques.length) {
      throw new RangeError(`agendar: se esperaba el índice de un bloque registrado (0…${bloques.length - 1}) y llegó ${bloque}`);
    }
    if (!esInt32(tipo)) throw new TypeError(`agendar: se esperaba tipo entero de 32 bits y llegó ${tipo} (bloque ${bloque})`);
    if (!esInt32(arg)) throw new TypeError(`agendar: se esperaba arg entero de 32 bits y llegó ${arg} (bloque ${bloque}, tipo ${tipo})`);
    if (fase !== Fase.URGENTE && fase !== Fase.NORMAL && fase !== Fase.TARDIA) {
      throw new RangeError(`agendar: se esperaba fase 0 (URGENTE), 1 (NORMAL) o 2 (TARDIA) y llegó ${fase}`);
    }
    if (!esInt32(prioridad)) throw new TypeError(`agendar: se esperaba prioridad entera de 32 bits y llegó ${prioridad}`);
    const s = E[SEQ];
    cal.poner(t, fase, prioridad, s, bloque, tipo, arg);
    E[SEQ] = s + 1;
    return s;
  };

  const correrHasta = (hasta: Ms): ResultadoCorrida => {
    if (procesando) throw new Error('correrHasta: no se puede llamar desde manejar() (el motor ya está corriendo)');
    if (typeof hasta !== 'number' || hasta !== hasta) throw new TypeError(`correrHasta: se esperaba un instante en ms y llegó ${hasta}`);
    // El horizonte de las opciones manda siempre: nunca se procesa un evento con t > opciones.hasta (§6.1).
    const limite = hasta < horizonte ? hasta : horizonte;
    let estado: EstadoCorrida = 'sin-eventos';
    // Copias locales de lo que el bucle toca en cada evento; se escriben en E antes de cada manejar() (que puede leer m.ahora,
    // m.seq, m.eventos o m.huella()) y al salir, también si manejar lanza.
    let eventos = E[EVENTOS], h1 = E[H1], h2 = E[H2], mismo = E[MISMO], tAnterior = E[T_ANTERIOR];
    procesando = true;
    try {
      while (cal.n > 0) {
        const t = cal.t[0];
        if (t > limite) { estado = hasta >= horizonte ? 'horizonte' : 'pausa'; break; }
        if (eventos >= maxEventos) { estado = 'tope-eventos'; break; }
        const b = cal.bloque[0], tipo = cal.tipo[0], arg = cal.arg[0];
        E[ACTUAL] = cal.seq[0];
        cal.quitarPrimero();
        E[AHORA] = t;
        E[EVENTOS] = ++eventos;
        if (t === tAnterior) {
          if (++mismo > maxMismo) { estado = 'lazo-tiempo-cero'; break; }
        } else {
          mismo = 0;
          tAnterior = t;
        }
        // Huella §6.4: t mod 2³², ⌊t / 2³²⌋, bloque, tipo, arg. Como t es un entero ≥ 0, t − ⌊t / 2³²⌋·2³² es exactamente
        // t mod 2³² y evita el `%` de punto flotante (que V8 resuelve con una llamada lenta); con t < 2³² (49 días) es t.
        let w0 = t, w1 = 0;
        if (t >= DOS_32) { w1 = Math.floor(t / DOS_32); w0 = t - w1 * DOS_32; }
        const w2 = b >>> 0, w3 = tipo >>> 0, w4 = arg >>> 0;
        h1 = carril1(carril1(carril1(carril1(carril1(h1, w0), w1), w2), w3), w4);
        h2 = carril2(carril2(carril2(carril2(carril2(h2, w0), w1), w2), w3), w4);
        E[H1] = h1; E[H2] = h2;
        bloques[b].manejar(m, tipo, arg);
      }
    } finally {
      procesando = false;
      E[MISMO] = mismo; E[T_ANTERIOR] = tAnterior;
    }
    if (estado === 'sin-eventos' || estado === 'pausa' || estado === 'horizonte') E[AHORA] = Math.max(E[AHORA], limite);
    return { estado, ahora: E[AHORA], eventos: E[EVENTOS], huella: hex16(E[H1], E[H2]) };
  };

  const foto = (): Foto => {
    if (procesando) throw new Error('foto: no se puede sacar desde manejar(); sacala entre corridas (por ejemplo, después de correrHasta)');
    const rutas = bloques.map((b) => b.ruta);
    const repetidas = rutasRepetidas(rutas);
    if (repetidas.length > 0) {
      throw new Error(`foto: hay bloques con la misma ruta (${repetidas.join(', ')}); la foto identifica cada bloque por su ruta`);
    }
    const estados = Object.create(null) as Record<string, EstadoBloque>;
    for (const b of bloques) {
      if (typeof b.estado !== 'function') throw new TypeError(`foto: el bloque «${b.ruta}» no tiene estado()`);
      estados[b.ruta] = clonarEstado(b.estado(), b.ruta);
    }
    return {
      version: 1,
      ahora: E[AHORA],
      seq: E[SEQ],
      eventos: E[EVENTOS],
      huella: [E[H1], E[H2]],
      calendario: {
        ...cal.columnas(),
        actual: E[ACTUAL], mismo: E[MISMO], tAnterior: E[T_ANTERIOR],
        bloques: bloques.length, rutas: huellasDeRutas(rutas),
        semilla: o.semilla, replica: o.replica,
      },
      bloques: estados,
    };
  };

  const restaurar = (f: Foto): void => {
    if (procesando) throw new Error('restaurar: no se puede llamar desde manejar()');
    if (f === null || typeof f !== 'object' || f.version !== 1) {
      throw new TypeError(`restaurar: se esperaba una foto versión 1 y llegó ${f === null || typeof f !== 'object' ? String(f) : `versión ${String(f.version)}`}`);
    }
    // Primero se valida todo; recién después se toca el estado.
    exigirMismosBloques(f, bloques.map((b) => b.ruta));
    const columnas = columnasDeFoto(f);
    const fAhora = f.ahora;
    if (typeof fAhora !== 'number' || !(fAhora >= 0)) throw new RangeError(`restaurar: la foto trae ahora = ${fAhora}; se esperaba ≥ 0`);
    const fSeq = numeroFoto(f, 'seq', f.seq, true);
    const fEventos = numeroFoto(f, 'eventos', f.eventos, true);
    const c = f.calendario;
    const fActual = numeroFoto(f, 'calendario.actual', c.actual, true);
    const fMismo = numeroFoto(f, 'calendario.mismo', c.mismo, true);
    const fTAnterior = numeroFoto(f, 'calendario.tAnterior', c.tAnterior, false);
    if (!Array.isArray(f.huella) || f.huella.length !== 2) throw new TypeError('restaurar: la foto tiene que traer huella: [h1, h2]');
    const [fh1, fh2] = f.huella;
    for (const h of [fh1, fh2]) {
      if (!Number.isInteger(h) || h < 0 || h > 0xffffffff) throw new RangeError(`restaurar: carril de huella inválido: ${h} (se esperaba uint32)`);
    }
    for (const b of bloques) {
      if (typeof b.restaurar !== 'function') throw new TypeError(`restaurar: el bloque «${b.ruta}» no tiene restaurar(e)`);
      b.restaurar(clonarEstado(f.bloques[b.ruta], b.ruta));
    }
    cal.cargar(columnas);
    E[AHORA] = fAhora; E[SEQ] = fSeq; E[EVENTOS] = fEventos; E[ACTUAL] = fActual;
    E[MISMO] = fMismo; E[T_ANTERIOR] = fTAnterior; E[H1] = fh1; E[H2] = fh2;
  };

  const m: Motor = {
    get ahora() { return E[AHORA]; },
    get seq() { return E[ACTUAL]; },
    get eventos() { return E[EVENTOS]; },
    opciones: o,
    azar,
    mat: det,
    traza,
    claveDe,
    registrar,
    agendar,
    correr: () => correrHasta(horizonte),
    correrHasta,
    foto,
    restaurar,
    huella: () => hex16(E[H1], E[H2]),
    finalizar: () => { for (const b of bloques) b.finalizar?.(m); },
  };
  return m;
};
