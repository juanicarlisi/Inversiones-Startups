// integracion/verificar.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.6 y §12.2). SOLO NODE.
// `npm run verificar`: la batería «Andén Verificado» COMPLETA con el núcleo de producción y las 85 exigibles del corte en un solo
// informe (las 59 de P2 y las 26 de los demás paquetes, que suma la integración con `casosExtra`), más las demostraciones que tienen que
// fallar (S01, S02) y las informativas. Antes de la batería (que es síncrona) mide lo asíncrono:
//   · R04 en Chromium (integracion/r04.mjs; Firefox y WebKit, pendientes si no están instalados);
//   · R07 con hilos de worker_threads de verdad (1 y 3 trabajadores con el Worker de la app).
// Escribe:
//   verificacion/informe/resultados.json e informe.html    el informe local de P2 (no se publica)
//   integracion/salida/bateria-nucleo.json                  lo que lee la construcción para el comprobante («85 de 85», fecha)
//   integracion/salida/r04.json                             la medición de R04
// Uso (desde apps/anden/simulador):  npm run verificar  ·  node integracion/verificar.ts [--semilla=<n>] [--solo=V01a,L02] [--sin-navegador]
//   [--fecha=AAAA-MM-DD]. Sale con 0 si las 85 pasan y S01/S02 fallan como deben; si no, con 1.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { crearBateria, escribirInforme, fechaDelSistema, leerDoradas, SEMILLA_BATERIA } from '../verificacion/bateria.ts';
import { crearMotorProduccion, ensamblar, VERSION_MOTOR } from './ensamblar.ts';
import { crearCasosExtra, EXIGIBLES_DEL_CORTE, type MedicionR04, type MedicionR07 } from './bateria/indice.ts';
import { medirR07 } from './bateria/casos-experimentos.ts';
import { fabricaDeHilos } from './pruebas/hilos.ts';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
export const SALIDA_BATERIA = join(AQUI, 'salida', 'bateria-nucleo.json');

const reloj = () => Number(process.hrtime.bigint()) / 1e6;
const log = (s: string) => process.stderr.write(`${s}\n`);

/** R07 con el hub chico compilado y 1 y 3 hilos reales. */
async function precalcularR07(semilla: number): Promise<MedicionR07> {
  const E = ensamblar();
  const c = await E.compilar(E.plantillas['hub-chico@1.0.0']);
  if (!c.ok) throw new Error('verificar: hub-chico@1.0.0 no compila');
  const hilos = fabricaDeHilos();
  try { return await medirR07(c.mv, hilos.fabrica, semilla, 30, reloj); } finally { await hilos.terminarTodos(); }
}

export async function principal(args: string[]): Promise<number> {
  const opcion = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
  for (const a of args) if (!/^--(semilla|solo|fecha)=/.test(a) && a !== '--sin-navegador' && a !== '--completa') {
    throw new Error(`argumento desconocido ${a}; se esperaba --semilla=, --solo=, --fecha=, --sin-navegador o --completa`);
  }
  const semilla = opcion('semilla') === undefined ? SEMILLA_BATERIA : Number(opcion('semilla'));
  if (!Number.isInteger(semilla) || semilla < 0 || semilla > 0xffffffff) throw new Error(`--semilla: se esperaba un entero entre 0 y 4294967295 y llegó ${opcion('semilla')}`);
  const solo = opcion('solo')?.split(',');
  const quiere = (id: string) => !solo || solo.includes(id);
  const t0 = reloj();

  // 1. Lo asíncrono, antes de la batería
  let r04: MedicionR04 | null = null, motivoR04: string | undefined;
  if (quiere('R04')) {
    if (args.includes('--sin-navegador')) motivoR04 = 'se pidió --sin-navegador: R04 no se midió';
    else {
      try {
        const { correrR04 } = await import('./r04.mjs');
        r04 = await correrR04({ log });
      } catch (e) { motivoR04 = `R04 no se pudo medir: ${e instanceof Error ? e.message : String(e)}`; log(motivoR04); }
    }
  }
  let r07: MedicionR07 | null = null;
  if (quiere('R07')) {
    log('R07 · hub chico con 1 y 3 hilos de worker_threads…');
    r07 = await precalcularR07(semilla);
    log(`  ${r07.noches} noches, ${r07.diferencias.length} diferencias, llegada con 3: ${r07.llegada3.slice(0, 12).join(', ')}… (${r07.segundos.toFixed(1)} s)`);
  }

  // 2. La batería completa con el núcleo y las 85 exigibles
  const bateria = crearBateria(crearMotorProduccion, { casosExtra: crearCasosExtra({ r04, r07, motivoR04 }) });
  const motor = `núcleo de producción (nucleo/, versión ${VERSION_MOTOR})`;
  const inf = bateria.correr({
    suite: 'completa', semilla, motor, reloj, doradas: leerDoradas(), ...(solo ? { ids: solo } : {}),
    alProgreso: (c, i, n) => log(`[${i + 1}/${n}] ${c.id}: ${c.titulo}`),
  });
  inf.fecha = opcion('fecha') ?? process.env.FECHA_BATERIA ?? fechaDelSistema();

  // 3. Las exigibles corridas tienen que ser exactamente las 85 del corte (si no se pidió un subconjunto)
  const corridas = inf.resultados.filter((r) => r.tipo === 'exigible').map((r) => r.id);
  const faltan = EXIGIBLES_DEL_CORTE.filter((id) => !corridas.includes(id));
  const sobran = corridas.filter((id) => !EXIGIBLES_DEL_CORTE.includes(id));
  if (!solo && (faltan.length || sobran.length || corridas.length !== 85)) {
    inf.resumen.aprobada = false;
    log(`las exigibles corridas no son las 85 del corte: faltan [${faltan.join(', ')}], sobran [${sobran.join(', ')}], corridas ${corridas.length}`);
  }
  const { json, html } = escribirInforme(inf);
  const r = inf.resumen;
  if (!solo) {
    mkdirSync(dirname(SALIDA_BATERIA), { recursive: true });
    writeFileSync(SALIDA_BATERIA, `${JSON.stringify({
      version: VERSION_MOTOR, motor, fecha: inf.fecha, semilla, suite: inf.suite,
      pruebasExigibles: r.exigiblesCorridas, pasaron: r.pasaron, fallaron: r.fallaron,
      debeFallar: r.debeFallar, debeFallarOk: r.debeFallarOk, informativas: r.informativas, reintentos: r.reintentos,
      doradas: inf.doradas.estado, conservacion: inf.conservacion, aprobada: r.aprobada, segundos: (reloj() - t0) / 1000,
      fallas: inf.resultados.filter((x) => x.tipo === 'exigible' && x.estado !== 'pasa').map((x) => `${x.id}: ${x.motivo ?? ''}`),
      porDueno: Object.fromEntries(['P1', 'P2', 'P4', 'P5', 'I'].map((d) => [d, inf.resultados.filter((x) => x.tipo === 'exigible' && x.dueno === d).length])),
      r04: r04 ? { estado: r04.estado, alcance: r04.alcance, claves: r04.claves, pendientes: r04.pendientes } : { estado: 'sin-medir', motivo: motivoR04 },
    }, null, 2)}\n`);
  }
  for (const x of inf.resultados) if (x.estado === 'falla') log(`FALLA ${x.id} · ${x.nombre}: ${x.motivo ?? ''}`);
  for (const x of inf.resultados) if (x.reintento) log(`reintento ${x.id}: primera vez ${x.reintento.primerIntento.motivo ?? 'falló'}; con semilla ${x.reintento.semilla} → ${x.estado}`);
  if (inf.doradas.distintas.length) for (const d of inf.doradas.distintas.slice(0, 20)) log(`DORADA distinta: ${d}`);
  const rel = (p: string) => relative(RAIZ, p);
  process.stdout.write(`Andén Verificado (completa, ${motor}): ${r.pasaron} de ${r.exigiblesCorridas} exigibles pasan; ` +
    `${r.debeFallarOk} de ${r.debeFallar} demostraciones fallan como deben; ${r.informativas} informativas; ${r.reintentos} reintentos; ` +
    `doradas ${inf.doradas.estado} (${inf.doradas.comparadas}); ${((reloj() - t0) / 1000).toFixed(1)} s.\n` +
    `${r.aprobada ? 'APROBADA' : 'NO APROBADA'} · ${rel(json)} · ${rel(html)}${solo ? '' : ` · ${rel(SALIDA_BATERIA)}`}\n`);
  return r.aprobada ? 0 : 1;
}

const esPrincipal = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (esPrincipal) {
  principal(process.argv.slice(2)).then((codigo) => { process.exitCode = codigo; }, (e: unknown) => {
    process.stderr.write(`${e instanceof Error ? e.stack ?? e.message : String(e)}\n`);
    process.exitCode = 2;
  });
}
