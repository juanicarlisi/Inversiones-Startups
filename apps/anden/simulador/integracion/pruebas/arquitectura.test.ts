// integracion/pruebas/arquitectura.test.ts · Andén simulador, corte 1 · Integración (corte-1.md §10.5 y §12.11).
// Las capas las hacen cumplir pruebas, no la documentación (diseño maestro §4.1.6). Cuatro controles sobre el texto de los archivos:
//  1. imports permitidos por carpeta (§2, §4 y §14.3): cada paquete importa solo de sí mismo y de contratos/; las excepciones van con
//     su motivo en EXCEPCIONES;
//  2. tokens prohibidos de §1.4 (más las demás trascendentes de Math, el acceso indirecto Math[…] y el operador **) en nucleo/, hub/,
//     verificacion/, experimentos/ y explicacion/, fuera de comentarios y textos (se analiza el árbol sintáctico con TypeScript);
//  3. contratos/ sin cambios: idéntico byte a byte a corte-1-paso0/contratos/ y al código del Anexo A y B de corte-1.md;
//  4. el paquete construido (dist/): qué archivos fuente entraron, según el metafile de esbuild (nada de servicios falsos, de la
//     referencia, de las fixtures, de la batería ni de pruebas; y el Worker sin interfaz).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { construir } from '../construir.mjs';

const RAIZ = resolve(fileURLToPath(new URL('../..', import.meta.url)));          // apps/anden/simulador
const REPO = resolve(RAIZ, '../../..');
const PASO0 = join(REPO, 'oportunidades/proyectos/anden/corte-1-paso0/contratos');
const ESPEC = join(REPO, 'oportunidades/proyectos/anden/corte-1.md');
const PAQUETES = ['nucleo', 'verificacion', 'modelo', 'hub', 'experimentos', 'escena', 'explicacion', 'app'] as const;
const DETERMINISTAS = ['nucleo', 'hub', 'verificacion', 'experimentos', 'explicacion'];

function archivos(dir: string, filtro = /\.(ts|mts|mjs|js)$/): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n === 'dist' || n === 'capturas' || n.startsWith('.')) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...archivos(p, filtro)); else if (filtro.test(n)) out.push(p);
  }
  return out;
}
const rel = (p: string) => relative(RAIZ, p).split(sep).join('/');
const esPrueba = (r: string) => /\/pruebas\//.test(r);

/** Imports de un archivo (estáticos, dinámicos con texto literal y re-exportaciones), con su tipo (solo tipos o con valor). */
function importsDe(p: string): { esp: string; soloTipos: boolean; linea: number }[] {
  const fuente = ts.createSourceFile(p, readFileSync(p, 'utf8'), ts.ScriptTarget.Latest, true,
    p.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  const out: { esp: string; soloTipos: boolean; linea: number }[] = [];
  const linea = (n: ts.Node) => fuente.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  const visitar = (n: ts.Node): void => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const c = n.importClause;
      const soloTipos = !!c && (c.isTypeOnly || (!c.name && !!c.namedBindings && ts.isNamedImports(c.namedBindings) &&
        c.namedBindings.elements.length > 0 && c.namedBindings.elements.every((e) => e.isTypeOnly)));
      out.push({ esp: n.moduleSpecifier.text, soloTipos, linea: linea(n) });
    } else if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) {
      out.push({ esp: n.moduleSpecifier.text, soloTipos: n.isTypeOnly, linea: linea(n) });
    } else if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) {
      out.push({ esp: n.arguments[0].text, soloTipos: false, linea: linea(n) });
    }
    ts.forEachChild(n, visitar);
  };
  visitar(fuente);
  return out;
}

/**
 * Excepciones a «cada paquete importa solo de sí mismo y de contratos/», cada una con su motivo. `de` y `a` son prefijos de rutas
 * relativas a apps/anden/simulador (`a` puede ser 'node:' o un paquete de npm).
 */
const EXCEPCIONES: { de: RegExp; a: RegExp; motivo: string }[] = [
  { de: /^app\/i18n\/diccionarios\.ts$/, a: /^(escena|explicacion|modelo|experimentos)\/textos\.(es|en)\.json$/,
    motivo: 'la interfaz junta los textos de todos los paquetes: solo datos, nunca código (app/NOTAS-CONTRATO.md §2)' },
  { de: /^app\/(servicios-falsos\.ts|entrada-falsa\.ts|falsos\/)/, a: /^contratos\/(fixtures|ejemplos|referencia)\//,
    motivo: 'servicios falsos para desarrollar la interfaz sin el resto (corte-1.md §9 P8); no entran en dist/ (control 4)' },
  { de: /^verificacion\/bateria\.ts$/, a: /^(contratos\/referencia\/|node:)/,
    motivo: 'la línea de comandos de la batería usa la referencia si no se le pasa otro motor y escribe el informe (P2, NOTAS §1)' },
  { de: /^(nucleo\/matematica\/generar-doradas\.ts|experimentos\/estadistica\/generar-tabla-t\.ts|hub\/plantillas\/generar\.ts)$/,
    a: /^(contratos\/referencia\/|node:)/, motivo: 'herramientas que generan datos una sola vez (doradas, tabla de t, plantillas); no las importa la app' },
];

const permitido = (de: string, a: string) => EXCEPCIONES.some((x) => x.de.test(de) && x.a.test(a));

test('arquitectura · imports: cada paquete usa solo los contratos y su propia carpeta (con las excepciones anotadas)', () => {
  const malos: string[] = [];
  for (const paquete of [...PAQUETES, 'contratos']) {
    for (const p of archivos(join(RAIZ, paquete), /\.(ts|mts|mjs|js)$/)) {
      const r = rel(p);
      if (r.startsWith('contratos/fixtures/maqueta/') || r.startsWith('app/vendor/')) continue; // copias literales de terceros o de la maqueta
      for (const i of importsDe(p)) {
        const destino = i.esp.startsWith('.') ? rel(resolve(dirname(p), i.esp)) : i.esp;
        if (destino.startsWith('../')) { malos.push(`${r}:${i.linea} importa ${i.esp}, fuera de apps/anden/simulador`); continue; }
        const dePaquete = destino.split('/')[0];
        if (dePaquete === paquete) continue;
        if (permitido(r, destino)) continue;
        if (paquete === 'contratos') {
          if (destino.startsWith('node:') && esPrueba(r)) continue;
          malos.push(`${r}:${i.linea} (contratos/) importa ${destino}: los contratos no dependen de nadie`);
          continue;
        }
        if (destino.startsWith('contratos/')) {
          // Fuera de las pruebas, ningún paquete usa la referencia, las fixtures ni los ejemplos (son para probar y para desarrollar).
          if (!esPrueba(r) && /^contratos\/(referencia|fixtures|ejemplos|pruebas)\//.test(destino)) {
            malos.push(`${r}:${i.linea} importa ${destino}: la referencia, las fixtures y los ejemplos son solo para las pruebas`);
          }
          continue;
        }
        if (destino.startsWith('node:')) {
          if (!esPrueba(r)) malos.push(`${r}:${i.linea} importa ${destino}: el código de la app corre en el navegador (Node solo en pruebas y herramientas)`);
          continue;
        }
        if (!destino.includes('/') && esPrueba(r) && destino === 'esbuild') continue;    // app/pruebas/humo.mjs construye con esbuild
        malos.push(`${r}:${i.linea} importa ${destino}${i.soloTipos ? ' (solo tipos)' : ''}: un paquete solo puede usar contratos/ y su carpeta (corte-1.md §14.3)`);
      }
    }
  }
  assert.deepEqual(malos, [], `se esperaban 0 imports fuera de lo permitido y hubo ${malos.length}:\n${malos.join('\n')}`);
});

test('arquitectura · imports: integracion/ no importa pruebas de otros paquetes ni los servicios falsos', () => {
  const malos: string[] = [];
  for (const p of archivos(join(RAIZ, 'integracion'))) {
    const r = rel(p);
    for (const i of importsDe(p)) {
      if (!i.esp.startsWith('.')) continue;
      const destino = rel(resolve(dirname(p), i.esp));
      // Única excepción (I-3): las herramientas de la integración que miden §12.7 (los recorridos y el informe de salida) usan el catálogo
      // H01–H12 de P3 como DATOS, sin copiarlo; nunca entra en dist/ (lo controla la prueba del paquete construido).
      const catalogoHostil = destino === 'modelo/pruebas/hostiles/entradas.ts' && /^integracion\/(e2e\/[^/]+\.mjs|informe-salida\.mjs)$/.test(r);
      if (!catalogoHostil && /^(nucleo|verificacion|modelo|hub|experimentos|escena|explicacion|app)\/pruebas\//.test(destino)) malos.push(`${r}:${i.linea} importa ${destino}`);
      if (/^app\/(servicios-falsos|entrada-falsa|falsos\/)/.test(destino)) malos.push(`${r}:${i.linea} importa ${destino}`);
    }
  }
  assert.deepEqual(malos, [], `la integración no puede depender de pruebas ni de servicios falsos de otros paquetes:\n${malos.join('\n')}`);
});

// ------------------------------------------------------------------------------------------------ tokens prohibidos

/** §1.4 más las demás trascendentes de Math (P1, NOTAS-CONTRATO §11): ninguna está fijada bit a bit por el estándar. */
const TRASCENDENTES = ['random', 'log', 'exp', 'pow', 'sin', 'cos', 'tan', 'atan2', 'log1p', 'expm1', 'cbrt', 'hypot',
  'log10', 'log2', 'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh'];

/** Usos prohibidos en un archivo, analizando el árbol sintáctico (los comentarios y los textos no cuentan). */
function tokensProhibidos(p: string, texto = readFileSync(p, 'utf8')): string[] {
  const fuente = ts.createSourceFile(p, texto, ts.ScriptTarget.Latest, true, p.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  const out: string[] = [];
  const donde = (n: ts.Node) => `${rel(p)}:${fuente.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
  const esMath = (e: ts.Expression) => ts.isIdentifier(e) && e.text === 'Math';
  const visitar = (n: ts.Node): void => {
    if (ts.isPropertyAccessExpression(n) && esMath(n.expression) && TRASCENDENTES.includes(n.name.text)) out.push(`${donde(n)} Math.${n.name.text}`);
    else if (ts.isElementAccessExpression(n) && esMath(n.expression)) out.push(`${donde(n)} Math[…] (acceso indirecto)`);
    else if (ts.isIdentifier(n) && (n.text === 'Date' || n.text === 'performance')) {
      const padre = n.parent;
      const esNombreDePropiedad = (ts.isPropertyAccessExpression(padre) && padre.name === n) || (ts.isPropertyAssignment(padre) && padre.name === n) ||
        (ts.isMethodDeclaration(padre) && padre.name === n) || (ts.isPropertySignature(padre) && padre.name === n);
      if (!esNombreDePropiedad) out.push(`${donde(n)} ${n.text}`);
    } else if (ts.isBinaryExpression(n) && (n.operatorToken.kind === ts.SyntaxKind.AsteriskAsteriskToken ||
      n.operatorToken.kind === ts.SyntaxKind.AsteriskAsteriskEqualsToken)) {
      out.push(`${donde(n)} operador ** (es Math.pow: no está fijado bit a bit)`);
    }
    ts.forEachChild(n, visitar);
  };
  visitar(fuente);
  return out;
}

test('arquitectura · el detector de tokens ve el código y no los comentarios ni los textos', () => {
  const M = 'Ma' + 'th';
  const ejemplo = [
    `// ${M}.log(1) en un comentario no cuenta`,
    `const a = "${M}.exp(2) en un texto tampoco"; const b = \`${M}.cos(3)\`;`,
    `const c = ${M}.sqrt(4) + ${M}.floor(1.5) + ${M}.imul(2, 3);`,
    `const d = ${M}.pow(2, 3); const e = ${M}['sin'](1); const f = 2 ** 3; const g = new ${'Da' + 'te'}(); const h = { ${'Da' + 'te'}: 1 }.${'Da' + 'te'};`,
  ].join('\n');
  const t = tokensProhibidos(join(RAIZ, 'integracion/pruebas/ejemplo.ts'), ejemplo).map((x) => x.replace(/^.*:\d+ /, ''));
  assert.deepEqual(t, [`${M}.pow`, `${M}[…] (acceso indirecto)`, 'operador ** (es Math.pow: no está fijado bit a bit)', 'Da' + 'te']);
});

test('arquitectura · tokens prohibidos de §1.4 en nucleo/, hub/, verificacion/, experimentos/ y explicacion/: cero', () => {
  const malos: string[] = [];
  let revisados = 0;
  for (const paquete of DETERMINISTAS) {
    for (const p of archivos(join(RAIZ, paquete), /\.(ts|mts)$/)) {
      const r = rel(p);
      // Las pruebas pueden comparar contra la matemática nativa (lo hacen a través de matNativa de contratos/referencia) y la CLI
      // de la batería mide su propio tiempo con process.hrtime: lo que se exige es el código que corre en el motor y en la app.
      if (esPrueba(r)) continue;
      revisados++;
      malos.push(...tokensProhibidos(p));
    }
  }
  assert.ok(revisados > 80, `se esperaban más de 80 archivos de código en los cinco paquetes deterministas y se revisaron ${revisados}`);
  assert.deepEqual(malos, [], `se esperaban 0 usos prohibidos (corte-1.md §1.4) y hubo ${malos.length}:\n${malos.join('\n')}`);
});

// ------------------------------------------------------------------------------------------------ contratos intactos

test('arquitectura · contratos/ es idéntico byte a byte al anexo del paso 0 (corte-1-paso0/contratos)', () => {
  const cambios = existsSync(join(RAIZ, 'integracion/CAMBIOS-CONTRATO.md'));
  const ahora = archivos(join(RAIZ, 'contratos'), /.*/).map(rel).sort();
  const anexo = archivos(PASO0, /.*/).map((p) => `contratos/${relative(PASO0, p).split(sep).join('/')}`).sort();
  assert.deepEqual(ahora, anexo, 'contratos/ tiene que tener exactamente los mismos archivos que el anexo del paso 0');
  const distintos = ahora.filter((r) => !readFileSync(join(RAIZ, r)).equals(readFileSync(join(PASO0, r.slice('contratos/'.length)))));
  assert.deepEqual(distintos, [], `contratos/ cambió respecto del anexo en: ${distintos.join(', ')}` +
    (cambios ? ' (hay integracion/CAMBIOS-CONTRATO.md: actualizar el anexo junto con el cambio)' : ' y no hay integracion/CAMBIOS-CONTRATO.md que lo documente'));
});

test('arquitectura · contratos/ coincide con el código de los Anexos A y B de corte-1.md', () => {
  const espec = readFileSync(ESPEC, 'utf8');
  const bloques = [...espec.matchAll(/### `(contratos\/[^`]+)`\n\n```ts\n([\s\S]*?)\n```/g)].map((m) => ({ ruta: m[1], codigo: m[2] }));
  const b = /## Anexo B[^\n]*`corte-1-paso0\/(contratos\/referencia\/motor-referencia\.ts)`[\s\S]*?```ts\n([\s\S]*?)\n```/.exec(espec);
  if (b) bloques.push({ ruta: b[1], codigo: b[2] });
  assert.equal(bloques.length, 19, `se esperaban los 18 contratos del Anexo A y la referencia del Anexo B, y encontré ${bloques.length}`);
  const distintos = bloques.filter(({ ruta, codigo }) => readFileSync(join(RAIZ, ruta), 'utf8').replace(/\n+$/, '') !== codigo.replace(/\n+$/, ''));
  assert.deepEqual(distintos.map((x) => x.ruta), [], 'estos contratos no coinciden con el código literal del anexo');
});

// ------------------------------------------------------------------------------------------------ lo que entra en dist/

test('arquitectura · el paquete construido lleva solo código de la app (nada de falsos, referencia, fixtures, batería ni pruebas)', async () => {
  const destino = mkdtempSync(join(tmpdir(), 'anden-arq-'));
  try {
    const r = await construir({ destino });
    assert.equal(r.plan, 'esbuild', 'la construcción tiene que usar esbuild (está en package-lock.json)');
    const meta = r.metafile!;
    const entradasDe = (salida: string) => Object.keys(meta.outputs[salida]?.inputs ?? {});
    const claveDe = (nombre: string) => Object.keys(meta.outputs).find((k) => k.endsWith(`/${nombre}`) || k === nombre)!;
    const entrada = entradasDe(claveDe('entrada.js')), worker = entradasDe(claveDe('worker.js'));
    assert.ok(entrada.includes('integracion/entrada.ts') && entrada.includes('app/arrancar.ts'), 'entrada.js tiene que llevar la entrada y la interfaz');
    assert.ok(worker.includes('integracion/worker.ts') && worker.some((x) => x.startsWith('nucleo/')) && worker.some((x) => x.startsWith('hub/')),
      'worker.js tiene que llevar el núcleo y el hub');
    const todas = Object.keys(meta.inputs);
    const prohibidas = todas.filter((x) => /^(app\/(servicios-falsos|entrada-falsa)\.ts|app\/falsos\/|contratos\/(referencia|fixtures|ejemplos)\/|verificacion\/|.*\/pruebas\/)/.test(x) || x.startsWith('node:'));
    assert.deepEqual(prohibidas, [], `no pueden entrar en dist/: ${prohibidas.join(', ')}`);
    const workerConInterfaz = worker.filter((x) => /^(app|escena)\//.test(x));
    assert.deepEqual(workerConInterfaz, [], `el Worker no lleva interfaz ni vistas: ${workerConInterfaz.join(', ')}`);
    // el QR va en un trozo aparte: no cuenta en la primera carga
    assert.ok(!entrada.some((x) => x.includes('qrcode-generator')), 'qrcode-generator tiene que quedar en un trozo que se baja a demanda');
    for (const f of ['index.html', 'estilos.css', 'manifest.webmanifest', 'icono.svg', 'sw.js', 'entrada.js', 'worker.js', 'vendor/LICENCIA-qrcode-generator.txt']) {
      assert.ok(existsSync(join(destino, f)), `falta dist/${f}`);
    }
    const sw = readFileSync(join(destino, 'sw.js'), 'utf8');
    assert.ok(!sw.includes('/*VERSION*/') && !sw.includes('/*ARCHIVOS_CONSTRUIDOS*/'), 'sw.js tiene que salir con la versión y la lista de archivos reemplazadas');
    assert.match(sw, /"\.\/worker\.js"/, 'el service worker tiene que guardar worker.js para andar sin red');
  } finally {
    rmSync(destino, { recursive: true, force: true });
  }
});
