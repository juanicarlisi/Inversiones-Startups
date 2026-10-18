// verificacion/bateria.ts · Andén simulador, corte 1, P2: la batería «Andén Verificado».
//
// Uso como biblioteca (la integración pasa el núcleo de producción):
//   const b = crearBateria(crearMotor);           b.casos · b.correr({ suite: 'completa' }) · b.generarDoradas() · b.compararDoradas(d)
// Uso por línea de comandos (desde apps/anden/simulador):
//   node verificacion/bateria.ts [--rapida|--completa] [--generar-doradas] [--motor=<módulo que exporta crearMotor>]
//        [--semilla=<n>] [--solo=V01a,C04] [--fecha=AAAA-MM-DD]
//   escribe verificacion/informe/resultados.json e informe.html (local, no se publica). Sin --motor usa la referencia de
//   contratos/; también se puede pasar el módulo con la variable de entorno MOTOR_BATERIA.
//
// La batería corre sobre cualquier implementación del contrato del motor (CrearMotor). Las 59 exigibles de P2 (V 50, C 3, D01,
// M01, M02, R01–R03) viven en casos/; las otras 26 del corte (K, L, P02, R04–R07, S03, S08, S09, S11–S13) son de otros paquetes y la
// integración puede sumarlas al mismo informe con `casosExtra` (ver NOTAS-CONTRATO.md).
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { CrearMotor } from '../contratos/motor.ts';
import type { MatematicaDeterminista } from '../contratos/matematica.ts';
import { correrRed, type MedidasRed } from './flujo/red.ts';
import type { Caso, Contexto, ResultadoPrueba, Suite } from './casos/comun.ts';
import { casosMM1 } from './casos/v-mm1.ts';
import { casosMMc } from './casos/v-mmc.ts';
import { casosMG1 } from './casos/v-mg1.ts';
import { casosGM1 } from './casos/v-gm1.ts';
import { casosPerdida } from './casos/v-perdida.ts';
import { casosPrioridad } from './casos/v-prioridad.ts';
import { casosJackson } from './casos/v-jackson.ts';
import { casosCerradas } from './casos/v-cerradas.ts';
import { casosMtInf } from './casos/v-mtinf.ts';
import { casosReparador } from './casos/v-reparador.ts';
import { casosLaw } from './casos/c-law.ts';
import { casosDM } from './casos/d-m.ts';
import { casosReproducibilidad } from './casos/r-reproducibilidad.ts';
import { casosInformativas } from './casos/informativas.ts';
import { paginaInforme } from './pagina.ts';

/** Semilla de la batería (la de la plantilla de ejemplo). */
export const SEMILLA_BATERIA = 20261017;
/** Exigibles de todo el corte (§8) y las que son de P2. */
export const EXIGIBLES_DEL_CORTE = 85;
export const EXIGIBLES_P2: readonly string[] = [
  ...['a', 'b', 'c'].flatMap((x) => ['V01', 'V02', 'V03', 'V04', 'V05'].map((v) => v + x)),
  ...['a', 'b', 'c'].flatMap((x) => ['V06', 'V07'].map((v) => v + x)),
  'V08', 'V09', 'V10', 'V11', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20', 'V21', 'V22', 'V23a', 'V23b', 'V23c',
  'V24a', 'V24b', 'V24c', 'V25', 'V26', 'V27', 'V28a', 'V28b', 'V28c', 'V28d', 'V29', 'V30',
  'C01', 'C03', 'C04', 'D01', 'M01', 'M02', 'R01', 'R02', 'R03',
];
/** Informativas y demostraciones que tienen que fallar (no cuentan entre las exigibles). */
export const INFORMATIVAS_P2: readonly string[] = ['V12a', 'V12b', 'V12c', 'V12d', 'C02'];
export const DEBEN_FALLAR_P2: readonly string[] = ['S01', 'S02'];
/** Semilla de las doradas y réplicas que se guardan por red corta. */
export const SEMILLA_DORADAS = 20261017;
export const REPLICAS_DORADAS = [0, 1];

export interface OpcionesBateria {
  suite?: Suite;
  semilla?: number;
  /** Solo los casos que tienen alguna de estas pruebas. */
  ids?: string[];
  /** Re-correr una falla estocástica con otra semilla y 4 veces más réplicas (§8). Sí por defecto. */
  reintentar?: boolean;
  /** Doradas contra las que comparar (null = no hay archivo; sin el campo = no se comparan). */
  doradas?: ArchivoDoradas | null;
  /** Nombre del motor para el informe. */
  motor?: string;
  /** Reloj en ms para medir cuánto tarda cada caso (solo el informe; nunca entra en un resultado). */
  reloj?: () => number;
  alProgreso?: (caso: Caso, indice: number, total: number) => void;
}

export interface CorridaDorada { caso: string; etiqueta: string; replica: number; huella: string; eventos: number }
export interface ArchivoDoradas {
  version: 1;
  descripcion: string;
  semilla: number;
  motor: string;
  corridas: CorridaDorada[];
}

export interface InformeBateria {
  version: 1;
  bateria: 'Andén Verificado';
  suite: Suite;
  semilla: number;
  motor: string;
  fecha: string | null;
  resumen: {
    exigiblesDelCorte: number;
    exigiblesP2: number;
    exigiblesCorridas: number;
    pasaron: number;
    fallaron: number;
    informativas: number;
    debeFallar: number;
    debeFallarOk: number;
    reintentos: number;
    aprobada: boolean;
    segundos?: number;
  };
  resultados: ResultadoPrueba[];
  casos: { id: string; titulo: string; archivo: string; suite: Suite; replicas: number; horizonte: number; calentamiento: number; pruebas: string[]; segundos?: number }[];
  doradas: { estado: 'pasa' | 'falla' | 'no-pedidas' | 'sin-archivo'; comparadas: number; distintas: string[] };
  conservacion: { corridas: number; violaciones: number };
}

export interface Bateria {
  readonly casos: Caso[];
  correr(o?: OpcionesBateria): InformeBateria;
  generarDoradas(motor?: string): ArchivoDoradas;
  compararDoradas(d: ArchivoDoradas): { comparadas: number; distintas: string[] };
}

/** Todos los casos de P2, en el orden del informe. */
export function casosP2(mat: MatematicaDeterminista): Caso[] {
  return [
    ...casosMM1(), ...casosMMc(), ...casosMG1(), ...casosGM1(mat), ...casosPerdida(), ...casosPrioridad(), ...casosJackson(),
    ...casosCerradas(), ...casosMtInf(mat), ...casosReparador(), ...casosLaw(), ...casosDM(), ...casosReproducibilidad(),
    ...casosInformativas(),
  ];
}

function esReintentable(r: ResultadoPrueba, c: Caso): boolean {
  const d = c.pruebas.find((p) => p.id === r.id)!;
  if (d.tipo !== 'exigible') return false;
  const t = d.criterio.tipo;
  return t === 'estadistico' || t === 'z' || t === 'intervalo' || (t === 'relativo' && d.criterio.tolRel > 0.01);
}

export function crearBateria(crearMotor: CrearMotor, o: { casosExtra?: Caso[] } = {}): Bateria {
  if (typeof crearMotor !== 'function') throw new Error(`crearBateria: se esperaba una función CrearMotor y llegó ${typeof crearMotor}`);
  const mat = crearMotor({ semilla: 0, replica: 0, hasta: 0, traza: 'no' }).mat;
  const casos = [...casosP2(mat), ...(o.casosExtra ?? [])];
  const ids = new Set<string>();
  for (const c of casos) for (const p of c.pruebas) {
    if (ids.has(p.id)) throw new Error(`crearBateria: el id de prueba ${p.id} está repetido (caso ${c.id}); los ids tienen que ser únicos`);
    ids.add(p.id);
  }

  const generarDoradas = (motor = 'sin nombre'): ArchivoDoradas => {
    const corridas: CorridaDorada[] = [];
    for (const c of casos) for (const r of c.cortas) for (const replica of REPLICAS_DORADAS) {
      const m = correrRed(crearMotor, r.config, SEMILLA_DORADAS, replica);
      corridas.push({ caso: c.id, etiqueta: r.etiqueta, replica, huella: m.corrida.huella, eventos: m.corrida.eventos });
    }
    return {
      version: 1, semilla: SEMILLA_DORADAS, motor, corridas,
      descripcion: 'Huellas doradas de la batería Andén Verificado: la versión corta de cada caso con la semilla fija y las réplicas 0 y 1. ' +
        'Si cambia una huella sin que se haya cambiado a propósito el modelo del caso o la semántica del motor, hay un error. ' +
        'Se regeneran con node verificacion/bateria.ts --generar-doradas.',
    };
  };

  const compararDoradas = (d: ArchivoDoradas): { comparadas: number; distintas: string[] } => {
    if (!d || d.version !== 1 || !Array.isArray(d.corridas)) throw new Error('compararDoradas: se esperaba un archivo de doradas versión 1 con «corridas»');
    const actuales = generarDoradas();
    const clave = (x: CorridaDorada) => `${x.caso}/${x.etiqueta}/r${x.replica}`;
    const guardadas = new Map(d.corridas.map((x) => [clave(x), x]));
    const distintas: string[] = [];
    for (const a of actuales.corridas) {
      const g = guardadas.get(clave(a));
      if (!g) distintas.push(`${clave(a)}: no está en doradas.json (¿caso nuevo? regenerar con --generar-doradas)`);
      else if (g.huella !== a.huella || g.eventos !== a.eventos) distintas.push(`${clave(a)}: se esperaba la huella ${g.huella} (${g.eventos} eventos) y salió ${a.huella} (${a.eventos} eventos)`);
      guardadas.delete(clave(a));
    }
    for (const k of guardadas.keys()) distintas.push(`${k}: está en doradas.json pero el caso ya no existe`);
    return { comparadas: actuales.corridas.length, distintas };
  };

  const correr = (op: OpcionesBateria = {}): InformeBateria => {
    const suite = op.suite ?? 'rapida';
    const semilla = (op.semilla ?? SEMILLA_BATERIA) >>> 0;
    let seleccion = casos.filter((c) => suite === 'completa' || c.suite === 'rapida');
    if (op.ids && op.ids.length) {
      const pedidos = new Set(op.ids);
      seleccion = seleccion.filter((c) => c.pruebas.some((p) => pedidos.has(p.id)));
    }
    seleccion = [...seleccion.filter((c) => !c.alFinal), ...seleccion.filter((c) => c.alFinal)];
    let corridas = 0;
    const violaciones: string[] = [];
    const contexto = (s: number, factor: number): Contexto => ({
      crearMotor, mat, semilla: s, factorReplicas: factor, suite,
      casos: () => casos,
      alCorrer: (caso: string, me: MedidasRed) => {
        corridas++;
        for (const v of me.conservacion) violaciones.push(`${caso} (semilla ${me.semilla}, réplica ${me.replica}): ${v}`);
        for (const a of me.alertas) violaciones.push(`${caso} (semilla ${me.semilla}, réplica ${me.replica}): alerta del motor ${a}`);
      },
      conservacion: () => ({ corridas, violaciones: violaciones.slice() }),
    });
    const resultados: ResultadoPrueba[] = [];
    const infoCasos: InformeBateria['casos'] = [];
    let reintentos = 0;
    const t0 = op.reloj?.();
    seleccion.forEach((caso, i) => {
      op.alProgreso?.(caso, i, seleccion.length);
      const tc = op.reloj?.();
      let rs = caso.correr(contexto(semilla, 1));
      const fallas = rs.filter((r) => r.estado === 'falla' && esReintentable(r, caso));
      if (fallas.length && op.reintentar !== false) {
        const s2 = (semilla + 1_000_003) >>> 0;
        const otra = caso.correr(contexto(s2, 4));
        reintentos += fallas.length;
        rs = rs.map((r) => {
          if (!fallas.includes(r)) return r;
          const n = otra.find((x) => x.id === r.id)!;
          return { ...n, reintento: { semilla: s2, replicas: n.replicas, primerIntento: { simulado: r.simulado, z: r.z, errorRelativo: r.errorRelativo, ...(r.motivo ? { motivo: r.motivo } : {}) } } };
        });
      }
      resultados.push(...rs);
      const tf = op.reloj?.();
      infoCasos.push({ id: caso.id, titulo: caso.titulo, archivo: caso.archivo, suite: caso.suite, replicas: caso.replicas, horizonte: caso.horizonte,
        calentamiento: caso.calentamiento, pruebas: caso.pruebas.map((p) => p.id), ...(tc !== undefined && tf !== undefined ? { segundos: (tf - tc) / 1000 } : {}) });
    });
    let doradas: InformeBateria['doradas'] = { estado: 'no-pedidas', comparadas: 0, distintas: [] };
    if (op.doradas === null) doradas = { estado: 'sin-archivo', comparadas: 0, distintas: [] };
    else if (op.doradas) { const c = compararDoradas(op.doradas); doradas = { estado: c.distintas.length ? 'falla' : 'pasa', ...c }; }
    const exig = resultados.filter((r) => r.tipo === 'exigible');
    const debe = resultados.filter((r) => r.tipo === 'debe-fallar');
    const pasaron = exig.filter((r) => r.estado === 'pasa').length;
    const debeOk = debe.filter((r) => r.estado === 'debe-fallar-ok').length;
    const tFin = op.reloj?.();
    return {
      version: 1, bateria: 'Andén Verificado', suite, semilla, motor: op.motor ?? 'sin nombre', fecha: null,
      resumen: {
        exigiblesDelCorte: EXIGIBLES_DEL_CORTE, exigiblesP2: EXIGIBLES_P2.length, exigiblesCorridas: exig.length, pasaron,
        fallaron: exig.length - pasaron, informativas: resultados.filter((r) => r.estado === 'informativa').length,
        debeFallar: debe.length, debeFallarOk: debeOk, reintentos,
        aprobada: pasaron === exig.length && debeOk === debe.length && doradas.estado !== 'falla',
        ...(t0 !== undefined && tFin !== undefined ? { segundos: (tFin - t0) / 1000 } : {}),
      },
      resultados, casos: infoCasos, doradas, conservacion: { corridas, violaciones: violaciones.length },
    };
  };

  return { casos, correr, generarDoradas, compararDoradas };
}

// ---------------------------------------------------------------------------------------------------------------------
// Archivos
// ---------------------------------------------------------------------------------------------------------------------

export const RUTA_DORADAS = fileURLToPath(new URL('./doradas.json', import.meta.url));
export const DIR_INFORME = fileURLToPath(new URL('./informe/', import.meta.url));

export function leerDoradas(ruta = RUTA_DORADAS): ArchivoDoradas | null {
  if (!existsSync(ruta)) return null;
  return JSON.parse(readFileSync(ruta, 'utf8')) as ArchivoDoradas;
}

export function escribirDoradas(d: ArchivoDoradas, ruta = RUTA_DORADAS): void {
  // Una corrida por línea: los cambios de huella se leen fácil en un diff.
  const lineas = d.corridas.map((c) => `    ${JSON.stringify(c)}`).join(',\n');
  writeFileSync(ruta, `{\n  "version": 1,\n  "descripcion": ${JSON.stringify(d.descripcion)},\n  "semilla": ${d.semilla},\n  "motor": ${JSON.stringify(d.motor)},\n  "corridas": [\n${lineas}\n  ]\n}\n`);
}

/** NaN e Infinity no existen en JSON: se escriben como texto para que el informe no pierda información. */
function aJson(x: unknown): string {
  return JSON.stringify(x, (_, v) => (typeof v === 'number' && !Number.isFinite(v) ? String(v) : v), 2);
}

export function escribirInforme(inf: InformeBateria, dir = DIR_INFORME): { json: string; html: string } {
  mkdirSync(dir, { recursive: true });
  const json = resolve(dir, 'resultados.json'), html = resolve(dir, 'informe.html');
  writeFileSync(json, `${aJson(inf)}\n`);
  writeFileSync(html, paginaInforme(inf));
  return { json, html };
}

/**
 * Fecha local (UTC−3, Buenos Aires) leída del sistema de archivos: se escribe un archivo marca y se toma su hora de modificación.
 * La batería no usa el reloj del lenguaje (regla §1.4 para verificacion/); la fecha solo va al informe.
 */
export function fechaDelSistema(dir = DIR_INFORME): string {
  mkdirSync(dir, { recursive: true });
  const marca = resolve(dir, '.marca-de-fecha');
  writeFileSync(marca, '');
  const ms = statSync(marca).mtimeMs;
  rmSync(marca);
  return fechaDeMs(ms);
}

/** AAAA-MM-DD en Buenos Aires (UTC−3) para un instante en ms desde la época. Días civiles por el algoritmo de Howard Hinnant. */
export function fechaDeMs(ms: number): string {
  const z = Math.floor((ms - 3 * 3_600_000) / 86_400_000) + 719_468;
  const era = Math.floor(z / 146_097), doe = z - era * 146_097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const mes = mp < 10 ? mp + 3 : mp - 9;
  const anio = yoe + era * 400 + (mes <= 2 ? 1 : 0);
  return `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------------------------------------------------
// Línea de comandos
// ---------------------------------------------------------------------------------------------------------------------

async function cargarMotor(ruta: string | undefined): Promise<{ crearMotor: CrearMotor; nombre: string }> {
  if (!ruta) {
    const { crearMotorReferencia } = await import('../contratos/referencia/motor-referencia.ts');
    return { crearMotor: crearMotorReferencia, nombre: 'referencia (contratos/referencia/motor-referencia.ts)' };
  }
  const mod = (await import(pathToFileURL(resolve(ruta)).href)) as { crearMotor?: unknown };
  if (typeof mod.crearMotor !== 'function') throw new Error(`--motor=${ruta}: se esperaba un módulo que exporte la función crearMotor y exporta ${Object.keys(mod).join(', ') || 'nada'}`);
  return { crearMotor: mod.crearMotor as CrearMotor, nombre: ruta };
}

export async function principal(args: string[]): Promise<number> {
  const opcion = (nombre: string) => args.find((a) => a.startsWith(`--${nombre}=`))?.slice(nombre.length + 3);
  const conocidas = ['--rapida', '--completa', '--generar-doradas'];
  for (const a of args) if (!conocidas.includes(a) && !/^--(motor|semilla|solo|fecha)=/.test(a)) {
    throw new Error(`argumento desconocido ${a}; se esperaba --rapida, --completa, --generar-doradas, --motor=, --semilla=, --solo= o --fecha=`);
  }
  const suite: Suite = args.includes('--completa') ? 'completa' : 'rapida';
  const { crearMotor, nombre } = await cargarMotor(opcion('motor') ?? process.env.MOTOR_BATERIA);
  const semillaTxt = opcion('semilla');
  const semilla = semillaTxt === undefined ? SEMILLA_BATERIA : Number(semillaTxt);
  if (!Number.isInteger(semilla) || semilla < 0 || semilla > 0xffffffff) throw new Error(`--semilla: se esperaba un entero entre 0 y 4294967295 y llegó ${semillaTxt}`);
  const bateria = crearBateria(crearMotor);
  const log = (s: string) => process.stderr.write(`${s}\n`);
  if (args.includes('--generar-doradas')) {
    const d = bateria.generarDoradas(nombre);
    escribirDoradas(d);
    log(`doradas: ${d.corridas.length} corridas escritas en ${RUTA_DORADAS}`);
  }
  const reloj = () => Number(process.hrtime.bigint()) / 1e6;
  const inf = bateria.correr({
    suite, semilla, motor: nombre, reloj, doradas: leerDoradas(),
    ...(opcion('solo') ? { ids: opcion('solo')!.split(',') } : {}),
    alProgreso: (c, i, n) => log(`[${i + 1}/${n}] ${c.id}: ${c.titulo}`),
  });
  inf.fecha = opcion('fecha') ?? process.env.FECHA_BATERIA ?? fechaDelSistema();
  const { json, html } = escribirInforme(inf);
  const r = inf.resumen;
  for (const x of inf.resultados) if (x.estado === 'falla') log(`FALLA ${x.id} · ${x.nombre}: ${x.motivo ?? ''}`);
  if (inf.doradas.distintas.length) for (const d of inf.doradas.distintas.slice(0, 20)) log(`DORADA distinta: ${d}`);
  process.stdout.write(`Andén Verificado (${suite}, motor ${nombre}): ${r.pasaron} de ${r.exigiblesCorridas} exigibles pasan` +
    `${r.debeFallar ? `; ${r.debeFallarOk} de ${r.debeFallar} demostraciones fallan como deben` : ''}; ${r.informativas} informativas; ` +
    `${r.reintentos} reintentos; doradas ${inf.doradas.estado} (${inf.doradas.comparadas} comparadas)` +
    `${r.segundos !== undefined ? `; ${r.segundos.toFixed(1)} s` : ''}.\n${r.aprobada ? 'APROBADA' : 'NO APROBADA'} · ${json} · ${html}\n`);
  return r.aprobada ? 0 : 1;
}

const esPrincipal = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (esPrincipal) {
  principal(process.argv.slice(2)).then((codigo) => { process.exitCode = codigo; }, (e: unknown) => {
    process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`);
    process.exitCode = 2;
  });
}
