// integracion/bateria/casos-experimentos.ts · Andén simulador, corte 1 · Integración (corte-1.md §7 y §8). Exigibles de P5 en la batería:
//   R07 · el resumen es idéntico bit a bit con 1 o con 3 trabajadores y llegadas desordenadas: con el hub chico de verdad, en hilos de
//         worker_threads que hacen de Web Workers (el mismo Worker de la app: integracion/trabajador.ts con el núcleo de producción) y el
//         planificador de experimentos/. Es asíncrono: lo mide `medirR07` antes de correr la batería (que es síncrona) y el caso informa;
//   S12 · cobertura del IC de Wilson al 95% para p = 0,9 y n = 100 en 2.000 repeticiones, con los uniformes Philox del motor;
//   S13 · decisión con datos fijos: 19/20 con meta 0,9 → en-duda; 97/100 → cumple; 336/400 → no-cumple.
import type { ModeloValidado } from '../../contratos/modelo.ts';
import type { FabricaTrabajador } from '../../contratos/experimentos.ts';
import { Prioridad } from '../../contratos/experimentos.ts';
import type { KpiId, ResultadoReplica } from '../../contratos/resultados.ts';
import type { Caso } from '../../verificacion/casos/comun.ts';
import { decl, evaluarIdentico, evaluarIntervalo, replicasDe } from '../../verificacion/casos/comun.ts';
import { crearPlanificador, decidirOpcion, huellaAgregada, proporcion, resumir, wilson } from '../../experimentos/indice.ts';
import { conDueno } from './comun.ts';

const ARCHIVO = 'integracion/bateria/casos-experimentos.ts';

// ------------------------------------------------------------------------------------------------ R07

export interface MedicionR07 {
  noches: number;
  /** Orden de llegada de las réplicas con 1 y con 3 trabajadores. */
  llegada1: number[];
  llegada3: number[];
  /** Diferencias encontradas (vacío = idéntico). */
  diferencias: string[];
  kpis: KpiId[];
  huellaAgregada: string;
  segundos: number;
}

/** Permutación determinista (Fisher-Yates con un xorshift32 de semilla fija): para barajar sin Math.random. */
export function barajar<T>(xs: readonly T[], semilla: number): T[] {
  let s = (semilla >>> 0) || 1;
  const u = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const v = [...xs];
  for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); const t = v[i]; v[i] = v[j]; v[j] = t; }
  return v;
}

/**
 * R07 con el hub chico: las mismas `noches` réplicas con 1 y con 3 trabajadores (hilos reales), y el resumen de cada KPI tiene que ser
 * idéntico bit a bit, también con las réplicas barajadas. `reloj` solo mide cuánto tardó (no entra en ningún resultado).
 */
export async function medirR07(mv: ModeloValidado, fabrica: FabricaTrabajador, semilla: number, noches = 30,
  reloj: () => number = () => 0): Promise<MedicionR07> {
  const t0 = reloj();
  const correrCon = async (trabajadores: number) => {
    const p = crearPlanificador(fabrica, trabajadores);
    const llegada: ResultadoReplica[] = [];
    try {
      const fin = await p.enviar({ id: `r07-${trabajadores}`, prioridad: Prioridad.NOCHES, mv, semilla, replicas: [0, noches], traza: 'no' }, (r) => llegada.push(r));
      if (fin.completadas !== noches || fin.cancelado) throw new Error(`R07: con ${trabajadores} trabajadores se completaron ${fin.completadas} de ${noches} noches`);
    } finally { p.cerrar(); }
    return llegada;
  };
  const con1 = await correrCon(1);
  const con3 = await correrCon(3);
  const dif: string[] = [];
  const orden = Array.from({ length: noches }, (_, i) => i);
  if (JSON.stringify(con1.map((r) => r.replica)) !== JSON.stringify(orden)) dif.push('con 1 trabajador las réplicas tenían que llegar en orden');
  if (JSON.stringify(con3.map((r) => r.replica)) === JSON.stringify(orden)) dif.push('con 3 trabajadores las réplicas llegaron en orden: la prueba no prueba nada');
  const kpis: KpiId[] = ['finClasificacionMin', 'costoNoche', 'costoPorPaquete', 'esperaP90Min', 'pctAlCorte', 'pendientesAlCorte'];
  for (const kpi of kpis) {
    const a = JSON.stringify(resumir(con1, kpi, 0.95));
    if (JSON.stringify(resumir(con3, kpi, 0.95)) !== a) dif.push(`resumen de «${kpi}» distinto con 1 y con 3 trabajadores`);
    for (const s of [5, 6, 7]) if (JSON.stringify(resumir(barajar(con3, s), kpi, 0.95)) !== a) dif.push(`resumen de «${kpi}» distinto con las réplicas barajadas (${s})`);
  }
  if (JSON.stringify(proporcion(con1, 'pendientesAlCorte', '<=', 0, 0.95)) !== JSON.stringify(proporcion(barajar(con3, 9), 'pendientesAlCorte', '<=', 0, 0.95))) {
    dif.push('la proporción de noches que llegan al corte cambió con el orden');
  }
  const h1 = huellaAgregada([...con1].sort((x, y) => x.replica - y.replica).map((r) => r.huella));
  const h3 = huellaAgregada([...con3].sort((x, y) => x.replica - y.replica).map((r) => r.huella));
  if (h1 !== h3) dif.push(`huella agregada ${h1} con 1 trabajador y ${h3} con 3`);
  return { noches, llegada1: con1.map((r) => r.replica), llegada3: con3.map((r) => r.replica), diferencias: dif, kpis, huellaAgregada: h1,
    segundos: (reloj() - t0) / 1000 };
}

function casoR07(r07: MedicionR07 | null): Caso {
  const caso: Caso = {
    id: 'r07-trabajadores', titulo: 'Resumen idéntico con 1 o 3 trabajadores (hub chico en hilos de verdad)', archivo: ARCHIVO, suite: 'rapida',
    replicas: r07?.noches ?? 0, horizonte: 0, calentamiento: 0,
    pruebas: [{ id: 'R07', nombre: 'Resumen idéntico bit a bit con 1 o con 3 trabajadores y llegadas desordenadas (hub chico, 30 noches, 6 KPI)',
      familia: 'R', tipo: 'exigible', esperado: 'idéntico', criterio: { tipo: 'identico' } }],
    cortas: [],
    correr(ctx) {
      if (!r07) return [conDueno(evaluarIdentico(caso, decl(caso, 'R07'), ctx, 0, ['no se midió: R07 corre con hilos de worker_threads antes de la batería (npm run verificar)'], null), 'P5')];
      const desorden = r07.llegada3.slice(0, 10).join(', ');
      return [conDueno(evaluarIdentico(caso, decl(caso, 'R07'), ctx, r07.noches, r07.diferencias,
        `${r07.kpis.length} KPI idénticos; llegada con 3: ${desorden}…; huella agregada ${r07.huellaAgregada}`), 'P5')];
    },
  };
  return caso;
}

// ------------------------------------------------------------------------------------------------ S12 · S13

function casoS12(): Caso {
  const REPS = 2000, N = 100, P = 0.9;
  const caso: Caso = {
    id: 's12-wilson', titulo: 'Cobertura del IC de Wilson al 95% (p = 0,9; n = 100)', archivo: ARCHIVO, suite: 'rapida',
    replicas: REPS, horizonte: 0, calentamiento: 0,
    pruebas: [{ id: 'S12', nombre: 'Cobertura del IC de Wilson al 95% para p = 0,9 y n = 100 en 2.000 repeticiones', familia: 'S', tipo: 'exigible',
      esperado: { min: 0.93, max: 0.97 }, criterio: { tipo: 'intervalo' } }],
    cortas: [],
    correr(ctx) {
      const reps = replicasDe(ctx, REPS);
      const cubre: number[] = [];
      const dir = { clave: 0, a: 0, b: 0, c: 0 };
      for (let r = 0; r < reps; r++) {
        // cada repetición es una réplica del azar del motor: 100 pruebas Bernoulli(0,9) por dirección (clave, prueba)
        const m = ctx.crearMotor({ semilla: ctx.semilla, replica: r, hasta: 0, traza: 'no' });
        dir.clave = m.claveDe('bateria.s12', 'bernoulli');
        let k = 0;
        for (let i = 0; i < N; i++) { dir.a = i; if (m.azar.uniforme(dir) < P) k++; }
        const [lo, hi] = wilson(k, N, 0.95);
        cubre.push(lo <= P && P <= hi ? 1 : 0);
      }
      return [{ ...conDueno(evaluarIntervalo(caso, decl(caso, 'S12'), ctx, cubre), 'P5'), criterio: 'la cobertura simulada cae entre 93% y 97%' }];
    },
  };
  return caso;
}

/**
 * S13 · la decisión con datos fijos, por el MISMO camino que la interfaz (hallazgo REV-D1 de la revisión del 30-10-2026). Antes medía
 * `estadoConfiguracion` (el Wilson al 95% de una sola mirada), que la decisión no usa: la decisión mira hasta 20 veces y cada lado del
 * Wilson tiene su z calibrado (experimentos/estadistica/secuencial.ts). Ahora cada caso cuenta la proporción con `proporcion` y decide con
 * `decidirOpcion`, que es lo que `evaluarDecision` hace con cada configuración en cada mirada (meta 0,9, confianza 0,95, 20 iniciales,
 * tandas de 20, hasta 400 noches). Con los mismos datos, el Wilson de una mirada decía «cumple» en 97/100; la decisión real dice «en
 * duda» y recién confirma un 97% con 116 de 120.
 */
function casoS13(): Caso {
  const casos: [number, number, string][] = [
    [19, 20, 'en-duda'], [20, 20, 'en-duda'], [97, 100, 'en-duda'], [116, 120, 'cumple'], [60, 60, 'cumple'], [336, 400, 'no-cumple'],
  ];
  const esperado = casos.map((c) => c[2]).join(' · ');
  const caso: Caso = {
    id: 's13-decision', titulo: 'Estado de una configuración con datos fijos (la regla secuencial calibrada de la decisión)', archivo: ARCHIVO, suite: 'rapida',
    replicas: 1, horizonte: 0, calentamiento: 0,
    pruebas: [{ id: 'S13', nombre: 'Decisión con datos fijos y la regla de la interfaz (meta 0,9; 20/20/400): 19/20, 20/20 y 97/100 → en-duda; 116/120 y 60/60 → cumple; 336/400 → no-cumple', familia: 'S',
      tipo: 'exigible', esperado, criterio: { tipo: 'identico' } }],
    cortas: [],
    correr(ctx) {
      const dif: string[] = [], salio: string[] = [];
      const opciones = { replicasIniciales: 20, tanda: 20, replicasMax: 400 };
      for (const [k, n, esperadoK] of casos) {
        // n noches del mismo modelo: las primeras k llegan al corte (0 pendientes), las demás no
        const rs = Array.from({ length: n }, (_, i) => ({ replica: i, semilla: 1, modelo: 'datos-fijos', kpi: { pendientesAlCorte: i < k ? 0 : 5 } }) as unknown as ResultadoReplica);
        const prop = proporcion(rs, 'pendientesAlCorte', '<=', 0, 0.95);
        const d = decidirOpcion(prop.exitos, prop.n, 0.9, 0.95, opciones);
        salio.push(d.estado);
        if (prop.exitos !== k || prop.n !== n || prop.metodo !== 'wilson') dif.push(`${k}/${n}: la proporción contó ${prop.exitos}/${prop.n} con ${prop.metodo}`);
        if (d.estado !== esperadoK) {
          dif.push(`${k}/${n} con meta 0,9: se esperaba «${esperadoK}» y salió «${d.estado}» (Wilson de la decisión [${d.ic.map((x) => x.toFixed(4)).join('; ')}], ` +
            `z ${d.regla.zCumple.toFixed(4)} / ${d.regla.zNoCumple.toFixed(4)}, ${d.regla.metodo})`);
        }
      }
      return [conDueno(evaluarIdentico(caso, decl(caso, 'S13'), ctx, casos.length, dif, salio.join(' · ')), 'P5')];
    },
  };
  return caso;
}

export function casosExperimentos(r07: MedicionR07 | null): Caso[] {
  return [casoR07(r07), casoS12(), casoS13()];
}
