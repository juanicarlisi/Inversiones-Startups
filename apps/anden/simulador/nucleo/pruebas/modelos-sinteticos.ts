// nucleo/pruebas/modelos-sinteticos.ts · Modelos sintéticos para probar el motor sin depender del hub (R06, R08a, rendimiento).
// Cada uno usa SOLO el contrato del motor (m.azar, m.mat, m.claveDe, m.agendar, m.traza), guarda todo su estado en arreglos tipados y
// números (estado()/restaurar(), corte-1.md §4) y sortea por dirección semántica. `iniciar: false` arma los bloques sin agendar los
// eventos iniciales: es lo que se usa para restaurar una foto en un motor nuevo.
import { aMs, Fase } from '../../contratos/tipos-base.ts';
import { TipoMomento, TipoTramo } from '../../contratos/traza.ts';
import type { Bloque, EstadoBloque, Motor } from '../../contratos/motor.ts';
import type { Direccion, Distribucion } from '../../contratos/azar.ts';

export interface OpcionesModelo { iniciar?: boolean }

function num(e: EstadoBloque, k: string): number {
  const v = e[k];
  if (typeof v !== 'number') throw new TypeError(`estado: se esperaba un número en «${k}»`);
  return v;
}
function col<T>(e: EstadoBloque, k: string, Tipo: new (n: number) => T): T {
  const v = e[k];
  if (!(v instanceof (Tipo as unknown as typeof Float64Array))) throw new TypeError(`estado: se esperaba ${Tipo.name} en «${k}»`);
  return v as unknown as T;
}

// -------------------------------------------------------------------------------------------------------------------------------
// 1) M/M/1: llegadas exponenciales de media 1 s y servicio exponencial de media ρ s. Dos eventos por cliente.
// -------------------------------------------------------------------------------------------------------------------------------
export function mm1Sintetica(m: Motor, clientes: number, rho: number, o: OpcionesModelo = {}): Bloque {
  const LLEGADA = 1, FIN = 2;
  const kEntre = m.claveDe('sintetico.mm1', 'entre'), kServ = m.claveDe('sintetico.mm1', 'servicio');
  const entre: Distribucion = { tipo: 'exponencial', media: 1 }, servicioDist: Distribucion = { tipo: 'exponencial', media: rho };
  const dir: Direccion = { clave: 0, a: 0, b: 0, c: 0 };
  let nacidos = 0, ocupado = 0, ini = 0, fin = 0, esperaTotal = 0;
  let fila = new Int32Array(clientes), servicio = new Float64Array(clientes), llegada = new Float64Array(clientes);
  let yo = -1;
  const b: Bloque = {
    ruta: 'sintetico.mm1',
    manejar(m, tipo, arg) {
      if (tipo === LLEGADA) {
        const id = nacidos++;
        llegada[id] = m.ahora;
        dir.clave = kServ; dir.a = id;
        servicio[id] = aMs(m.azar.sortear(servicioDist, dir));
        if (nacidos < clientes) {
          dir.clave = kEntre; dir.a = id + 1;
          m.agendar(m.ahora + aMs(m.azar.sortear(entre, dir)), yo, LLEGADA, 0);
        }
        if (ocupado === 0) { ocupado = 1; m.agendar(m.ahora + servicio[id], yo, FIN, id); } else fila[fin++] = id;
      } else {
        void arg;
        if (ini < fin) {
          const id = fila[ini++];
          esperaTotal += m.ahora - llegada[id];
          m.agendar(m.ahora + servicio[id], yo, FIN, id);
        } else ocupado = 0;
      }
    },
    estado: () => ({ nacidos, ocupado, ini, fin, esperaTotal, fila, servicio, llegada }),
    restaurar(e) {
      nacidos = num(e, 'nacidos'); ocupado = num(e, 'ocupado'); ini = num(e, 'ini'); fin = num(e, 'fin'); esperaTotal = num(e, 'esperaTotal');
      fila = col(e, 'fila', Int32Array); servicio = col(e, 'servicio', Float64Array); llegada = col(e, 'llegada', Float64Array);
    },
  };
  yo = m.registrar(b);
  if (o.iniciar !== false) m.agendar(0, yo, LLEGADA, 0);
  return b;
}

// -------------------------------------------------------------------------------------------------------------------------------
// 2) Red con fases y prioridades: fuente con empates en el mismo instante, dos servidores con dos clases (prioridad sin
//    preempción), fallas URGENTES que interrumpen el servicio (patrón de descarte por seq: no hay cancelación), reanudación
//    con el tiempo restante y un observador TARDIO cada 15 minutos que escribe momentos en la traza.
// -------------------------------------------------------------------------------------------------------------------------------
export function redSintetica(m: Motor, trabajos: number, o: OpcionesModelo = {}): Bloque[] {
  const LLEGA = 1, TRABAJO = 10, FIN = 11, FALLA = 12, REPARA = 13, PROXIMA_FALLA = 20, MEDIR = 30;
  const C = 2;
  const kEntre = m.claveDe('sintetico.fuente', 'entre'), kClase = m.claveDe('sintetico.fuente', 'clase');
  const kServ = m.claveDe('sintetico.servidor', 'servicio'), kFalla = m.claveDe('sintetico.fallas', 'entre');
  const kRepara = m.claveDe('sintetico.fallas', 'reparacion');
  const dir: Direccion = { clave: 0, a: 0, b: 0, c: 0 };
  const entre: Distribucion = { tipo: 'uniforme', min: 0, max: 4 }; // redondeado a segundos enteros: muchos empates
  const clase: Distribucion = { tipo: 'discreta', valores: [0, 1], pesos: [0.3, 0.7] };
  const servicios: Distribucion[] = [{ tipo: 'erlang', k: 2, media: 3 }, { tipo: 'triangular', min: 1, moda: 2, max: 9 }];
  const entreFallas: Distribucion = { tipo: 'weibull', forma: 1.5, escala: 900 };
  const reparacion: Distribucion = { tipo: 'normal', media: 60, desvio: 20, min: 5, max: 200 };
  let iFuente = -1, iServidor = -1, iFallas = -1, iObservador = -1;

  // Fuente
  let generados = 0;
  const fuente: Bloque = {
    ruta: 'sintetico.fuente',
    manejar(m) {
      const id = generados++;
      dir.clave = kClase; dir.a = id; dir.b = 0; dir.c = 0;
      const cl = m.azar.sortear(clase, dir);
      // La clase decide la prioridad del evento en el servidor: en el mismo instante, la clase 0 entra primero.
      m.agendar(m.ahora, iServidor, TRABAJO, id * 2 + cl, Fase.NORMAL, cl);
      if (generados < trabajos) {
        dir.clave = kEntre; dir.a = id + 1;
        const s = Math.round(m.azar.sortear(entre, dir));
        m.agendar(m.ahora + aMs(s), iFuente, LLEGA, 0);
      }
    },
    estado: () => ({ generados }),
    restaurar(e) { generados = num(e, 'generados'); },
  };

  // Servidor: C servidores, dos filas por clase, servicio sorteado por (trabajo), interrupción por falla con reanudación.
  let cola = new Int32Array(trabajos * 2 + 8); // dos anillos simples: clase 0 en [0, trabajos), clase 1 en [trabajos, 2·trabajos)
  let ini0 = 0, fin0 = 0, ini1 = 0, fin1 = 0, caido = 0, terminados = 0;
  let enServicio = new Int32Array(C).fill(-1), seqFin = new Float64Array(C).fill(-1), finPrevisto = new Float64Array(C);
  let restante = new Float64Array(C);
  let tramoServicio = new Int32Array(C).fill(-1);
  const empezar = (m: Motor, s: number, codigo: number, duracion: number) => {
    enServicio[s] = codigo;
    finPrevisto[s] = m.ahora + duracion;
    seqFin[s] = m.agendar(m.ahora + duracion, iServidor, FIN, s);
    tramoServicio[s] = m.traza.abrir(codigo >> 1, TipoTramo.SERVICIO, s, codigo & 1, m.ahora);
  };
  const tomarDeLaFila = (m: Motor, s: number) => {
    if (caido === 1) return;
    let codigo = -1;
    if (ini0 < fin0) codigo = cola[ini0++]; else if (ini1 < fin1) codigo = cola[trabajos + ini1++];
    if (codigo < 0) { enServicio[s] = -1; seqFin[s] = -1; return; }
    dir.clave = kServ; dir.a = codigo >> 1; dir.b = 0; dir.c = 0;
    empezar(m, s, codigo, aMs(m.azar.sortear(servicios[codigo & 1], dir)));
  };
  const servidor: Bloque = {
    ruta: 'sintetico.servidor',
    manejar(m, tipo, arg) {
      if (tipo === TRABAJO) {
        if ((arg & 1) === 0) cola[fin0++] = arg; else cola[trabajos + fin1++] = arg;
        for (let s = 0; s < C; s++) if (enServicio[s] < 0) tomarDeLaFila(m, s);
      } else if (tipo === FIN) {
        const s = arg;
        if (m.seq !== seqFin[s]) return; // evento viejo (lo invalidó una falla): se descarta
        m.traza.cerrar(tramoServicio[s], m.ahora);
        terminados++;
        tomarDeLaFila(m, s);
      } else if (tipo === FALLA) {
        caido = 1;
        for (let s = 0; s < C; s++) {
          if (enServicio[s] >= 0 && seqFin[s] >= 0) {
            restante[s] = finPrevisto[s] - m.ahora;
            seqFin[s] = -1; // invalida el FIN agendado
            m.traza.cerrar(tramoServicio[s], m.ahora);
          }
        }
      } else if (tipo === REPARA) {
        caido = 0;
        for (let s = 0; s < C; s++) {
          if (enServicio[s] >= 0) empezar(m, s, enServicio[s], restante[s]); else tomarDeLaFila(m, s);
        }
      }
    },
    estado: () => ({ cola, ini0, fin0, ini1, fin1, caido, terminados, enServicio, seqFin, finPrevisto, restante, tramoServicio }),
    restaurar(e) {
      cola = col(e, 'cola', Int32Array); ini0 = num(e, 'ini0'); fin0 = num(e, 'fin0'); ini1 = num(e, 'ini1'); fin1 = num(e, 'fin1');
      caido = num(e, 'caido'); terminados = num(e, 'terminados');
      enServicio = col(e, 'enServicio', Int32Array); seqFin = col(e, 'seqFin', Float64Array);
      finPrevisto = col(e, 'finPrevisto', Float64Array); restante = col(e, 'restante', Float64Array);
      tramoServicio = col(e, 'tramoServicio', Int32Array);
    },
  };

  // Fallas: la n-ésima falla empieza entre(n) después de la reparación anterior (dirección por n, no por orden de eventos).
  let nFalla = 0;
  const fallas: Bloque = {
    ruta: 'sintetico.fallas',
    manejar(m, tipo) {
      if (tipo === PROXIMA_FALLA) {
        m.agendar(m.ahora, iServidor, FALLA, nFalla, Fase.URGENTE);
        m.traza.momento(m.ahora, TipoMomento.LAZO_PARA, 0, nFalla);
        dir.clave = kRepara; dir.a = nFalla; dir.b = 0; dir.c = 0;
        const dura = aMs(m.azar.sortear(reparacion, dir));
        m.agendar(m.ahora + dura, iServidor, REPARA, nFalla, Fase.URGENTE);
        nFalla++;
        if (generadosPendientes()) {
          dir.clave = kFalla; dir.a = nFalla;
          m.agendar(m.ahora + dura + aMs(m.azar.sortear(entreFallas, dir)), iFallas, PROXIMA_FALLA, nFalla, Fase.URGENTE);
        }
      }
    },
    estado: () => ({ nFalla }),
    restaurar(e) { nFalla = num(e, 'nFalla'); },
  };
  const generadosPendientes = () => generados < trabajos || ini0 < fin0 || ini1 < fin1;

  // Observador TARDIO: mide cada 15 minutos mientras haya trabajo; nunca cambia lo que mide.
  let mediciones = 0, maxFila = 0;
  const observador: Bloque = {
    ruta: 'sintetico.observador',
    manejar(m) {
      mediciones++;
      const enFila = (fin0 - ini0) + (fin1 - ini1);
      if (enFila > maxFila) maxFila = enFila;
      m.traza.momento(m.ahora, TipoMomento.ACUMULACION_LLENA, 0, enFila);
      if (generadosPendientes()) m.agendar(m.ahora + 900_000, iObservador, MEDIR, mediciones, Fase.TARDIA);
    },
    estado: () => ({ mediciones, maxFila }),
    restaurar(e) { mediciones = num(e, 'mediciones'); maxFila = num(e, 'maxFila'); },
  };

  iFuente = m.registrar(fuente);
  iServidor = m.registrar(servidor);
  iFallas = m.registrar(fallas);
  iObservador = m.registrar(observador);
  if (o.iniciar !== false) {
    m.agendar(0, iFuente, LLEGA, 0);
    m.agendar(0, iObservador, MEDIR, 0, Fase.TARDIA);
    dir.clave = kFalla; dir.a = 0; dir.b = 0; dir.c = 0;
    m.agendar(aMs(m.azar.sortear(entreFallas, dir)), iFallas, PROXIMA_FALLA, 0, Fase.URGENTE);
  }
  return [fuente, servidor, fallas, observador];
}

// -------------------------------------------------------------------------------------------------------------------------------
// 3) Las 11 distribuciones y la matemática del motor dentro de la huella: cada evento sortea una distribución distinta, usa
//    m.mat (log, exp, sin, cos, pow, sqrt) y mete los BITS del resultado en el arg del evento siguiente. Si el núcleo y la
//    referencia difirieran en un solo bit de un sorteo, la huella cambiaría.
// -------------------------------------------------------------------------------------------------------------------------------
export const DISTRIBUCIONES_DE_PRUEBA: Distribucion[] = [
  { tipo: 'fija', valor: 2.5 },
  { tipo: 'uniforme', min: -3, max: 7 },
  { tipo: 'exponencial', media: 2700 },
  { tipo: 'triangular', min: 1, moda: 2, max: 6 },
  { tipo: 'normal', media: 10, desvio: 3, min: 4, max: 15 },
  { tipo: 'lognormal', media: 2.4, cv: 0.35 },
  { tipo: 'erlang', k: 3, media: 6 },
  { tipo: 'weibull', forma: 1.5, escala: 2 },
  { tipo: 'bernoulli', p: 0.015 },
  { tipo: 'discreta', valores: [10, 20, 30, 40], pesos: [0.2, 0.15, 0.12, 0.53] },
  { tipo: 'empirica', valores: [1, 2, 4, 8, 16] },
];

export function distribucionesSintetica(m: Motor, pasos: number, o: OpcionesModelo = {}): Bloque {
  const PASO = 1;
  const clave = m.claveDe('sintetico.distribuciones', 'sorteo');
  const dir: Direccion = { clave, a: 0, b: 0, c: 0 };
  const bits = new Float64Array(1), palabras = new Int32Array(bits.buffer);
  let hechos = 0, suma = 0;
  let yo = -1;
  const b: Bloque = {
    ruta: 'sintetico.distribuciones',
    manejar(m) {
      const i = hechos++;
      const dist = DISTRIBUCIONES_DE_PRUEBA[i % DISTRIBUCIONES_DE_PRUEBA.length];
      dir.a = i; dir.b = i % 7; dir.c = i % 3;
      const x = m.azar.sortear(dist, dir);
      const u = m.azar.uniforme(dir, 2 + (i % 5));
      // Matemática del motor sobre el sorteo: todo entra a la huella por los bits.
      const y = m.mat.sin(2 * Math.PI * u) + m.mat.cos(6 * u) + m.mat.exp(-u * 3) + m.mat.log(1 + u) + m.mat.pow(1 + u, 2.5) + m.mat.sqrt(u);
      suma += x;
      bits[0] = x * 1.000001 + y;
      const arg = palabras[0] ^ palabras[1];
      if (hechos < pasos) {
        const demora = aMs(Math.min(100, Math.abs(x) + Math.abs(y)));
        m.agendar(m.ahora + demora, yo, PASO, arg, (i % 3) as Fase, i % 4);
      }
    },
    estado: () => ({ hechos, suma }),
    restaurar(e) { hechos = num(e, 'hechos'); suma = num(e, 'suma'); },
  };
  yo = m.registrar(b);
  if (o.iniciar !== false) m.agendar(0, yo, PASO, 0);
  return b;
}

// -------------------------------------------------------------------------------------------------------------------------------
// 4) Bloque que agenda al azar (para R06): K entidades; cada evento sortea una demora, a veces agenda en el mismo instante con otra
//    fase y otra prioridad, a veces invalida el evento pendiente de otra entidad (descarte por seq).
// -------------------------------------------------------------------------------------------------------------------------------
export function aleatorioSintetico(m: Motor, entidades: number, eventosMax: number, o: OpcionesModelo = {}): Bloque {
  const TOCA = 1, EXTRA = 2;
  const kDemora = m.claveDe('sintetico.aleatorio', 'demora'), kExtra = m.claveDe('sintetico.aleatorio', 'extra');
  const kOtra = m.claveDe('sintetico.aleatorio', 'otra'), kFase = m.claveDe('sintetico.aleatorio', 'fase');
  const demora: Distribucion = { tipo: 'lognormal', media: 30, cv: 1.2 };
  const extra: Distribucion = { tipo: 'bernoulli', p: 0.3 };
  const otra: Distribucion = { tipo: 'discreta', valores: Array.from({ length: entidades }, (_, i) => i), pesos: Array.from({ length: entidades }, () => 1) };
  const faseDist: Distribucion = { tipo: 'discreta', valores: [0, 1, 2], pesos: [1, 2, 1] };
  const dir: Direccion = { clave: 0, a: 0, b: 0, c: 0 };
  let veces = new Float64Array(entidades), ultimoSeq = new Float64Array(entidades).fill(-1);
  let procesados = 0, descartados = 0, extras = 0;
  let yo = -1;
  const reagendar = (m: Motor, ent: number) => {
    dir.clave = kDemora; dir.a = ent; dir.b = veces[ent]; dir.c = 0;
    const d = aMs(m.azar.sortear(demora, dir));
    ultimoSeq[ent] = m.agendar(m.ahora + d, yo, TOCA, ent);
  };
  const b: Bloque = {
    ruta: 'sintetico.aleatorio',
    manejar(m, tipo, arg) {
      procesados++;
      if (procesados >= eventosMax) return;
      if (tipo === TOCA) {
        if (m.seq !== ultimoSeq[arg]) { descartados++; return; }
        const ent = arg;
        veces[ent]++;
        dir.clave = kExtra; dir.a = ent; dir.b = veces[ent]; dir.c = 0;
        if (m.azar.sortear(extra, dir) === 1) {
          extras++;
          dir.clave = kOtra;
          const o2 = m.azar.sortear(otra, dir);
          dir.clave = kFase;
          const f = m.azar.sortear(faseDist, dir) as Fase;
          // Mismo instante, otra fase y otra prioridad; y la otra entidad se reagenda (su evento pendiente queda viejo).
          m.agendar(m.ahora, yo, EXTRA, o2, f, (ent + o2) % 5);
          reagendar(m, o2);
        }
        reagendar(m, ent);
      } else {
        // EXTRA: solo deja rastro en la huella (tipo y arg) y en la traza.
        m.traza.momento(m.ahora, TipoMomento.REEMPLAZO, arg, procesados);
      }
    },
    estado: () => ({ veces, ultimoSeq, procesados, descartados, extras }),
    restaurar(e) {
      veces = col(e, 'veces', Float64Array); ultimoSeq = col(e, 'ultimoSeq', Float64Array);
      procesados = num(e, 'procesados'); descartados = num(e, 'descartados'); extras = num(e, 'extras');
    },
  };
  yo = m.registrar(b);
  if (o.iniciar !== false) for (let ent = 0; ent < entidades; ent++) reagendar(m, ent);
  return b;
}
