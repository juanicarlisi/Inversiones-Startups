// integracion/informe-salida.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.10 y §12). `npm run informe`.
// Escribe integracion/salida/informe-salida.json: cada criterio de salida de §12 con lo que se midió, de dónde sale y si pasó. Si alguno
// no pasa, el corte queda «cerrado con pendientes» (nunca «cerrado»), con el valor medido y el motivo.
//
// Mide en el momento: `npm test` (con integracion/reportero.mjs, para saber qué pasó en cada archivo), las invariantes I01–I06 en 200 noches
// de cada plantilla con el núcleo de producción, y el enlace (ida y vuelta, tamaños, H01–H12). Lee lo que miden las corridas largas:
// salida/bateria-nucleo.json (npm run verificar), salida/r04.json (npm run r04), salida/banco.json (npm run banco) y salida/e2e.json
// (npm run e2e). Nada se publica.
//
// Uso (desde apps/anden/simulador):  node integracion/informe-salida.mjs [--sin-npm-test]   (con --sin-npm-test usa salida/npm-test.json)
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { huellaFuentes } from './huella-fuentes.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const SALIDA = join(AQUI, 'salida');
const leerJson = (f) => (existsSync(join(SALIDA, f)) ? JSON.parse(readFileSync(join(SALIDA, f), 'utf8')) : null);
const args = process.argv.slice(2);

/** `npm test` con el reportero JSON: totales, por archivo y duración de pared. */
async function correrNpmTest() {
  const destino = join(SALIDA, 'npm-test.json');
  if (args.includes('--sin-npm-test') && existsSync(destino)) return JSON.parse(readFileSync(destino, 'utf8'));
  const t0 = process.hrtime.bigint();
  const codigo = await new Promise((ok) => {
    const p = spawn(process.execPath, ['--test', '--test-reporter=./integracion/reportero.mjs', `--test-reporter-destination=${destino}`,
      '--test-reporter=dot', '--test-reporter-destination=stdout', '**/pruebas/*.test.ts'],
      { cwd: RAIZ, stdio: 'inherit' });
    p.on('exit', (c) => ok(c));
  });
  const segundos = Number(process.hrtime.bigint() - t0) / 1e9;
  const r = JSON.parse(readFileSync(destino, 'utf8'));
  r.segundos = Number(segundos.toFixed(1)); r.codigo = codigo; r.node = process.version; r.fecha = new Date().toISOString().slice(0, 10);
  writeFileSync(destino, `${JSON.stringify(r, null, 2)}\n`);
  return r;
}

/** I01–I06 (§8 y §12.6): 0 alertas en 200 noches de cada plantilla con el núcleo de producción (3 hilos de worker_threads). */
async function invariantes() {
  const { crearServicios } = await import('./puente.ts');
  const { fabricaDeHilos } = await import('./pruebas/hilos.ts');
  const { Prioridad } = await import('../contratos/experimentos.ts');
  const hilos = fabricaDeHilos();
  const S = crearServicios({ fabrica: hilos.fabrica, trabajadores: 3 });
  const out = {};
  try {
    for (const clave of ['hub-chico@1.0.0', 'hub-lazo-noche@1.0.0']) {
      const t0 = Date.now();
      const c = await S.compilar(S.plantillas[clave]);
      if (!c.ok) throw new Error(`${clave} no compila`);
      const rs = await S.noches(c.mv, c.mv.modelo.experimento.semilla, 0, 200, Prioridad.NOCHES);
      const conAlertas = rs.filter((r) => r.alertas.length);
      out[clave] = { noches: rs.length, conAlertas: conAlertas.length, alertas: [...new Set(conAlertas.flatMap((r) => r.alertas))],
        conservacion: rs.every((r) => r.kpi.clasificados <= r.kpi.paquetes), segundos: Math.round((Date.now() - t0) / 100) / 10 };
    }
  } finally { S.cerrar(); await hilos.terminarTodos(); }
  return out;
}

/** El enlace (§9 P3 y §12.7): ida y vuelta exacta, tamaños y H01–H12, con el códec de producción (plantillas publicadas y versión del motor). */
async function enlace() {
  const { ensamblarModelo, plantillas, VERSION_MOTOR } = await import('./ensamblar.ts');
  const { HOSTILES } = await import('../modelo/pruebas/hostiles/entradas.ts');
  const { compilar, codec } = ensamblarModelo();
  const m = plantillas['hub-chico@1.0.0'];
  const c = await compilar(m);
  const fm = await codec.codificar({ tipo: 'modelo', modelo: m });
  const dm = await codec.decodificar(fm);
  const cm = dm.ok && dm.enlace.tipo === 'modelo' ? await compilar(dm.enlace.modelo) : null;
  const parche = [['/personas/induccion/puestosActivos', 4], ['/personas/induccion/reten', 1], ['/personas/rampa/cantidad', 7],
    ['/personas/rampa/asignacion', 'contiguas'], ['/demanda/camiones/paquetes', 900]].map(([path, value]) => ({ op: 'replace', path, value }));
  const fp = await codec.codificar({ tipo: 'plantilla', plantilla: { id: 'hub-chico', version: '1.0.0' }, parche });
  const dp = await codec.decodificar(fp);
  const receta = { v: 1, modelo: c.mv.huella, motor: VERSION_MOTOR, semilla: 20261017, replicas: 100, noche: 37, t: 91_800_000, vel: 600, esc: ['base', 'mas-un-puesto'] };
  const fr = await codec.codificar({ tipo: 'receta', receta });
  const dr = await codec.decodificar(fr);
  const hostiles = [];
  for (const h of HOSTILES) {
    const t0 = Date.now();
    const r = await codec.decodificar(await h.fragmento());
    hostiles.push({ id: h.id, esperado: h.esperado, obtenido: r.ok ? 'aceptado' : r.error, ms: Date.now() - t0 });
  }
  return {
    idaYVueltaModelo: !!cm?.ok && cm.mv.huella === c.mv.huella,
    idaYVueltaParche: dp.ok && dp.enlace.tipo === 'plantilla' && JSON.stringify(dp.enlace.parche) === JSON.stringify(parche),
    idaYVueltaReceta: dr.ok && dr.enlace.tipo === 'receta' && JSON.stringify(dr.enlace.receta) === JSON.stringify(receta),
    caracteresModelo: fm.length, caracteresPlantillaMas5: fp.length, caracteresReceta: fr.length,
    hostiles, hostilesRechazados: hostiles.filter((x) => x.obtenido === x.esperado).length,
    h01aH12: hostiles.filter((x) => /^H\d\d$/.test(x.id)).every((x) => x.obtenido === x.esperado),
  };
}

const archivo = (npm, nombre) => {
  const k = Object.keys(npm.archivos).find((f) => f.endsWith(nombre));
  return k ? npm.archivos[k] : null;
};
const verdes = (a) => !!a && a.falla === 0 && a.pasa > 0;

/**
 * La última revisión de la experiencia (I-3, 30-10-2026): qué se veía pobre o confuso en las capturas y cómo quedó. El detalle, con el
 * antes y el después, en integracion/NOTAS-CONTRATO.md §16.
 */
const REVISION_EXPERIENCIA = [
  { que: 'La biografía ponía los quince pasos del paquete antes del porqué: en 360 px la causa confirmada quedaba fuera de la primera pantalla',
    arreglo: 'Primero «Por qué (solo lo confirmado)» y después «Lo que le pasó»', donde: 'app/pantallas/biografia.ts' },
  { que: 'El mapa de las cien noches se dibujaba sobre un instante de la noche: paquetes, bandejas y rampas cargadas tapaban las placas de riesgo; en 360 px, en 2,5D, las rampas eran rayitas sin color legible',
    arreglo: 'El mapa va sobre el plano vacío del hub y en planta (2D), con cada tobogán pintado por su probabilidad de llenarse; la etiqueta de noche pasa al selector de noche',
    donde: 'app/pantallas/noches.ts' },
  { que: 'En la pantalla dividida de escritorio cada mitad medía 58vh (una regla de 1100 px pisaba la de la mitad) y el hub, largo y bajo, ocupaba un tercio: 200 px vacíos y la tabla del veredicto fuera de la pantalla',
    arreglo: 'Cada mitad con proporción 16:9 (entre 240 px y 56vh)', donde: 'app/estilos.css' },
];

async function principal() {
  const fecha = new Date().toISOString().slice(0, 10);
  console.log('npm test (con el reportero JSON)…');
  const npm = await correrNpmTest();
  console.log('invariantes en 200 noches por plantilla…');
  const inv = await invariantes();
  console.log('enlace…');
  const enl = await enlace();
  const bat = leerJson('bateria-nucleo.json'), r04 = leerJson('r04.json'), banco = leerJson('banco.json'), e2e = leerJson('e2e.json');
  const criterios = [];
  const criterio = (n, texto, pasa, medido, fuente, nota = null) => criterios.push({ n, criterio: texto, pasa, medido, fuente, ...(nota ? { nota } : {}) });

  // 1
  criterio(1, '`npm test` en verde en Node 22 (paso 0 + los ocho paquetes + integración) en menos de 3 minutos',
    npm.totales.falla === 0 && npm.codigo === 0 && npm.segundos < 180,
    { pruebas: npm.totales.pasa + npm.totales.falla + npm.totales.todo + npm.totales.omitida, pasan: npm.totales.pasa, fallan: npm.totales.falla,
      todo: npm.totales.todo, omitidas: npm.totales.omitida, segundos: npm.segundos, node: npm.node, fallas: npm.fallas },
    'integracion/salida/npm-test.json (integracion/reportero.mjs)',
    npm.totales.todo || npm.totales.omitida
      ? `${npm.totales.todo ? `Hay ${npm.totales.todo} prueba(s) \`todo\` (desde el 23-10-2026 no debería quedar ninguna: «KPI sanos» de P4 se resolvió ` +
        'con el camino 2, integracion/CAMBIOS-CONTRATO.md §10). ' : ''}La omitida es la batería completa dentro de npm test (corre con \`npm run verificar\`).`
      : null);
  // 2
  const informeLocal = existsSync(join(RAIZ, 'verificacion', 'informe', 'informe.html')) && existsSync(join(RAIZ, 'verificacion', 'informe', 'resultados.json'));
  // la batería vale para el código de hoy solo si la huella de sus fuentes coincide (hallazgo H5: antes bastaba el texto de la versión)
  const fuentesHoy = huellaFuentes();
  const mismasFuentes = bat?.fuentes?.sha256 === fuentesHoy.sha256;
  criterio(2, '`npm run verificar`: 85 de 85 exigibles con el núcleo de producción; S01 y S02 fallan como deben; informe local generado',
    !!bat && bat.pasaron === 85 && bat.pruebasExigibles === 85 && bat.debeFallarOk === 2 && informeLocal && mismasFuentes,
    bat ? { exigibles: bat.pruebasExigibles, pasaron: bat.pasaron, fallaron: bat.fallaron, debeFallarOk: `${bat.debeFallarOk} de ${bat.debeFallar}`,
      reintentos: bat.reintentos, doradas: bat.doradas, porDueno: bat.porDueno, segundos: Math.round(bat.segundos), fecha: bat.fecha, informeLocal,
      motor: bat.motor ?? null, fuentes: { archivos: fuentesHoy.archivos, sha256: fuentesHoy.sha256, coincideConLaCorrida: mismasFuentes } } : null,
    'integracion/salida/bateria-nucleo.json · verificacion/informe/ · integracion/huella-fuentes.mjs',
    'S03 exige réplicas sin sesgo y sin correlación entre vecinas (|z| ≤ 3,29); la cobertura del 95% queda informativa como S03c (hallazgo H3). ' +
    'Las pruebas con ee de las réplicas usan t(0,9995; n − 1) (H4). Texto propuesto para corte-1.md §8 en integracion/CAMBIOS-CONTRATO.md §4 y §5.');
  // 3
  const dif = archivo(npm, 'integracion/pruebas/diferencial.test.ts');
  criterio(3, 'R08b: el núcleo de producción y la referencia dan la misma huella en la batería rápida y en el hub chico',
    verdes(dif) && bat?.doradas === 'pasa', { pruebas: dif, doradasBateria: bat?.doradas },
    'integracion/pruebas/diferencial.test.ts (en npm test) · 66 doradas de la batería generadas con la referencia');
  // 4
  const chromium = r04?.navegadores?.find((x) => x.nombre === 'chromium');
  criterio(4, 'R04: las mismas huellas en Node y Chromium (Firefox y WebKit si se pudieron instalar; si no, pendientes con el motivo)',
    !!chromium && chromium.estado === 'pasa' && chromium.iguales === chromium.comparadas,
    r04 ? { claves: r04.claves, chromium: chromium ? `${chromium.iguales} de ${chromium.comparadas} iguales (${chromium.version})` : null,
      matematicaDistinta: chromium?.matDistintas, pendientes: r04.pendientes?.map((p) => `${p.nombre}: ${p.motivo}`) } : null,
    'integracion/salida/r04.json (npm run r04)', 'Firefox y WebKit pendientes: no están en el entorno y no se permitió instalarlos (corte-1.md §13 los pasa al corte 2).');
  // 5
  const eExp = archivo(npm, 'integracion/pruebas/e-explicador.test.ts');
  criterio(5, 'E01 y E02 en verde: 0 frases causales sin confirmar', verdes(eExp),
    { pruebas: eExp, completo50Replicas: 'E01: 0 frases de PAUSA falsas en 50 réplicas con corte 00:30 (3.172 de 3.172 con frase) y 01:30 (10.399 de 10.417); ' +
      'E02: 0 frases sin confirmar en 500 paquetes (ANDEN_COMPLETA=1, 19-10-2026, NOTAS-CONTRATO.md §5)' },
    'integracion/pruebas/e-explicador.test.ts (4 réplicas por escenario en npm test; 50 con ANDEN_COMPLETA=1)',
    'E01 se exige reformulado (solidez: 0 frases de PAUSA sin que el paquete llegue sin pausas; completitud ≥ 95%): con el corte a las 00:30 solo el ' +
    '17,1% de esos paquetes llega aunque no haya pausas, y la letra de §8 obligaría a afirmar lo que el contrafactual desmiente. Decide el orquestador.');
  // 6
  criterio(6, 'Invariantes I01–I06: 0 alertas en 200 noches de cada plantilla', Object.values(inv).every((x) => x.noches === 200 && x.conAlertas === 0),
    inv, 'medido por este script con el núcleo de producción (3 hilos)');
  // 7
  const e2eCompartir = e2e ? Object.values(e2e.combinaciones).map((c) => c.compartir) : [];
  const reabre = e2eCompartir.length === 4 && e2eCompartir.every((c) => c?.pasa);
  criterio(7, 'Enlace: ida y vuelta exacta; ejemplo completo ≤ 8.000 caracteres; plantilla + parche de 5 cambios ≤ 400; receta ≤ 160; H01–H12 rechazadas; abrir el enlace en otra pestaña reproduce la huella',
    enl.idaYVueltaModelo && enl.idaYVueltaParche && enl.idaYVueltaReceta && enl.caracteresModelo <= 8000 && enl.caracteresPlantillaMas5 <= 400 &&
      enl.caracteresReceta <= 160 && enl.h01aH12 && reabre,
    { ...enl, otraPestanaMismaHuella: e2eCompartir.map((c) => c?.datos?.huellaAgregada ?? null), otraPestanaEnLas4: reabre },
    'medido por este script (códec de producción) · integracion/salida/e2e.json (recorrido compartir)');
  // 8
  const recorridos = e2e ? Object.entries(e2e.combinaciones).flatMap(([k, c]) => Object.entries(c).map(([r, x]) => ({ combinacion: k, recorrido: r, pasa: x.pasa, segundos: x.segundos, erroresConsola: x.erroresConsola }))) : [];
  criterio(8, 'Recorridos de §10.8 sin errores de consola en 360 × 740 y 1280 × 800, claro y oscuro, con sus capturas',
    !!e2e && e2e.pasa && e2e.completo && recorridos.length === 16 && recorridos.every((x) => x.pasa && x.erroresConsola === 0) && (e2e.capturas?.archivos?.length ?? 0) >= 6,
    e2e ? { recorridos, capturas: e2e.capturas, chromium: e2e.chromium, minutos: e2e.minutos, fallas: e2e.fallas, fecha: e2e.fecha } : null,
    'integracion/salida/e2e.json (npm run e2e) · integracion/e2e/capturas/',
    'Primer minuto con el enlace de la plantilla grande + 2 cambios (9 personas de rampa con rampas vecinas) y la receta de la peor noche, ' +
    'parada durante el turno en el instante en que se ve la causa confirmada del paquete (desde el 23-10-2026; antes abría a media mañana, con ' +
    'el turno terminado), para que «balancear el plan» tenga algo que balancear; con la plantilla tal cual el plan ya va por volumen y la app lo ' +
    'dice sin comparar (también se prueba). Decidir, con la plantilla chica + los datos de un hub propio (retén 1, 7 de rampa, 2 manuales, corte ' +
    '03:00): con hub-chico@1.0.0 tal cual ninguna opción cumple.');
  // 9
  const noCumplen = banco?.presupuestos?.filter((p) => p.estado === 'no-cumple') ?? null;
  criterio(9, 'Presupuestos de §11 dentro del margen', !!banco && noCumplen.length === 0,
    banco ? { presupuestos: banco.presupuestos.map((p) => ({ id: p.id, meta: p.meta, unidad: p.unidad, mediana: p.mediana, estado: p.estado })),
      resumen: banco.resumen, maquina: banco.maquina } : null,
    'integracion/salida/banco.json (npm run banco: mediana de 5 corridas, ±30%)',
    noCumplen?.length ? `No cumple: ${noCumplen.map((p) => `${p.nombre} (${Math.round(p.mediana)} ${p.unidad} contra ${p.meta})`).join('; ')}. ` +
      'La meta de 150 ms viene de la maqueta, que dibujaba después de simular 10 min; el corte 1 simula la noche entera en un Worker antes del ' +
      'primer cuadro. Decide el orquestador: primer cuadro progresivo en el corte 2 o reescribir el presupuesto (NOTAS-CONTRATO.md §8).' : null);
  // 10
  const tex = archivo(npm, 'integracion/pruebas/textos.test.ts'), mar = archivo(npm, 'integracion/pruebas/marcas.test.ts');
  const escenas = e2e ? Object.values(e2e.combinaciones).map((c) => c.primerMinuto?.datos) : [];
  const sellosYEtiqueta = escenas.length === 4 && escenas.every((d) => d?.sellos?.length === 3 && /^Noche \d+ de 100 · /.test(d?.etiquetaNoche ?? ''));
  criterio(10, 'Textos: todas las claves en es y en; la etiqueta de noche y los tres sellos presentes en la escena; ningún nombre de la lista negra',
    verdes(tex) && verdes(mar) && sellosYEtiqueta, { textos: tex, marcas: mar, escena: escenas.map((d) => ({ etiqueta: d?.etiquetaNoche, sellos: d?.sellos })) },
    'integracion/pruebas/textos.test.ts y marcas.test.ts (npm test) · e2e (0 claves faltantes en los 16 recorridos)');
  // 11
  const arq = archivo(npm, 'integracion/pruebas/arquitectura.test.ts');
  criterio(11, 'Prueba de arquitectura en verde (imports, tokens prohibidos, contratos intactos)', verdes(arq), { pruebas: arq },
    'integracion/pruebas/arquitectura.test.ts (npm test)');
  // 12
  const servirLocal = /listen\(puerto, '127\.0\.0\.1'/.test(readFileSync(join(AQUI, 'servir.mjs'), 'utf8'));
  const pedidosAfuera = e2e ? e2e.fallas.filter((f) => /pedido a otro sitio/.test(f)).length : null;
  const scripts = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')).scripts;
  const publica = Object.entries(scripts).filter(([k, v]) => /publish|deploy|wrangler|gh-pages|vercel|netlify/.test(`${k} ${v}`)).map(([k]) => k);
  criterio(12, 'Nada publicado ni enviado a terceros', servirLocal && pedidosAfuera === 0 && publica.length === 0,
    { servidorSolo127001: servirLocal, pedidosAOtrosSitiosEnLosRecorridos: pedidosAfuera, scriptsQuePublican: publica },
    'integracion/servir.mjs · integracion/salida/e2e.json · package.json', 'Ningún commit ni envío desde la integración: los commits los hace el orquestador.');

  const pasan = criterios.filter((c) => c.pasa).length;
  const informe = {
    corte: 'Andén simulador, corte 1 «Hub verificado, en escena»',
    especificacion: 'oportunidades/proyectos/anden/corte-1.md §12',
    fecha,
    entorno: { node: process.version, maquina: banco?.maquina ?? null },
    estado: pasan === criterios.length ? 'cerrado' : 'cerrado con pendientes',
    cumplen: pasan, de: criterios.length,
    criterios,
    decisionesAbiertas: [
      '«KPI sanos» de §9 sobre hub-chico@1.0.0: la integración eligió el camino 2 (23-10-2026; la prueba `todo` de P4 se borró); falta pasar a corte-1.md §9 el texto de integracion/CAMBIOS-CONTRATO.md §10. hub-chico@1.1.0 queda como propuesta.',
      'Presupuesto «primer cuadro ≤ 150 ms»: primer cuadro progresivo en el corte 2 o reescribir la meta.',
      'E01 reformulado (solidez + completitud, esperas ≥ 5 min dentro de la pausa) y S03 como independencia + sesgo con la cobertura informativa (S03c): confirmar y pasar a corte-1.md §8.',
      'Motor 1.1.0 (caminata por distancia, plan por volumen en bloques vecinos, persistencia, relevo en las pausas, pausas después del fin, utilizaciones por jornada), la huella `h` en la receta, Bonferroni en la decisión secuencial y el tope de tramos: pasar a corte-1.md (integracion/CAMBIOS-CONTRATO.md).',
      'R4 (cobertura entre roles y jornada máxima), R6–R10 y E-11: quedan para el corte 2 (integracion/CAMBIOS-CONTRATO.md §9).',
      'Presentar en 4 pasos (los de diseño maestro §5.6) en lugar de «tres actos»: lo confirma el fundador.',
      'Tamizado del hub chico al límite de su presupuesto (mediana cerca de 60 s, alguna corrida por encima) desde las reglas de parada del 20-10: reusar las noches de la evaluación base, bajar REPLICAS_MAX_TAMIZADO o tamizar con una tanda fija (integracion/NOTAS-CONTRATO.md §14). Cambia la estadística: decide el orquestador.',
      'Primera carga a menos de 5 KB brotli del tope de 150 KB: lo que sume el corte 2 va en trozos aparte.',
      'Textos de corte-1.md que quedaron viejos (integracion/CAMBIOS-CONTRATO.md §11): §6.6 «(0, 1]», VERSION_MOTOR como versión del motor completo (hoy 1.1.0), reglas 7 y 11 del motor 1.1.0 y la prueba del plan con 9 personas de rampa. La especificación no es de ningún paquete: la corrige el orquestador.',
      'R04 en Firefox y WebKit: pendientes (no están en el entorno y no se instalan); van al corte 2 con los teléfonos reales.',
    ],
    // lo que se arregló al mirar las capturas como alguien que viene de FlexSim (integracion/NOTAS-CONTRATO.md §16)
    revisionExperiencia: REVISION_EXPERIENCIA,
  };
  writeFileSync(join(SALIDA, 'informe-salida.json'), `${JSON.stringify(informe, null, 2)}\n`);
  console.log(`\ninforme de salida: ${pasan} de ${criterios.length} criterios cumplen → ${informe.estado}`);
  for (const c of criterios) console.log(`  ${c.pasa ? '✓' : '✗'} ${c.n}. ${c.criterio}`);
}

principal().catch((e) => { console.error(e); process.exitCode = 1; });
