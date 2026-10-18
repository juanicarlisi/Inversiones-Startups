// Arquitectura del paquete: lo que corte-1.md §1.4, §1.5 y §4.3 prohíben, verificado sobre el texto de los archivos de explicacion/.
//  · nada de azar nativo, matemática nativa no determinista, reloj ni DOM;
//  · imports solo de contratos/ y del propio paquete (nunca nucleo/, hub/, modelo/, experimentos/, escena/, verificacion/, app/, integracion/);
//  · el índice exporta toda la entrega del contrato.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import * as indice from '../indice.ts';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));

function archivos(dir: string): string[] {
  const salida: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) salida.push(...archivos(join(dir, e.name)));
    else if (e.name.endsWith('.ts')) salida.push(join(dir, e.name));
  }
  return salida.sort();
}

/** Quita comentarios de bloque y de línea (respetando comillas simples y dobles en la misma línea). */
function sinComentarios(texto: string): string {
  const sinBloques = texto.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  return sinBloques.split('\n').map((linea) => {
    let comilla = '';
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i];
      if (comilla) { if (c === '\\') i++; else if (c === comilla) comilla = ''; continue; }
      if (c === '"' || c === "'" || c === '`') { comilla = c; continue; }
      if (c === '/' && linea[i + 1] === '/' && linea[i - 1] !== ':') return linea.slice(0, i);
    }
    return linea;
  }).join('\n');
}

// Los nombres se arman por partes para que este archivo no contenga, él mismo, los tokens que prohíbe.
const MATH_PROHIBIDAS = ['ran' + 'dom', 'lo' + 'g', 'ex' + 'p', 'po' + 'w', 'si' + 'n', 'co' + 's', 'ta' + 'n', 'atan' + '2', 'log' + '1p', 'expm' + '1', 'cb' + 'rt', 'hyp' + 'ot'];
const OTROS_PROHIBIDOS = ['Da' + 'te', 'perfor' + 'mance', 'docu' + 'ment', 'win' + 'dow', 'inner' + 'HTML'];

const todos = archivos(RAIZ);
const delPaquete = todos.filter((f) => !f.includes('/pruebas/'));

test('hay archivos que revisar (y están los de la entrega de la especificación)', () => {
  const nombres = delPaquete.map((f) => f.slice(RAIZ.length));
  for (const n of ['esperas.ts', 'biografia.ts', 'causas.ts', 'contrafactual.ts', 'verificador.ts', 'tamizado.ts', 'formulario.ts', 'medicion.ts', 'indice.ts']) {
    assert.ok(nombres.includes(n), `falta ${n} (corte-1.md §2, P7)`);
  }
});

test('ni el paquete ni sus pruebas usan la matemática nativa prohibida, el reloj, el azar nativo ni el DOM (§1.4)', () => {
  for (const f of todos) {
    const codigo = sinComentarios(readFileSync(f, 'utf8'));
    for (const nombre of MATH_PROHIBIDAS) {
      assert.equal(new RegExp(`\\bMath\\.${nombre}\\b`).test(codigo), false, `${f.slice(RAIZ.length)} usa Math.${nombre}, prohibido en explicacion/`);
    }
    for (const nombre of OTROS_PROHIBIDOS) {
      assert.equal(new RegExp(`\\b${nombre}\\b`).test(codigo), false, `${f.slice(RAIZ.length)} usa «${nombre}», prohibido en explicacion/`);
    }
    assert.equal(new RegExp('\\bev' + 'al\\s*\\(|new\\s+Fun' + 'ction\\b').test(codigo), false, `${f.slice(RAIZ.length)} evalúa código en ejecución`);
    assert.equal(/\*\*(?!\/)/.test(codigo.replace(/\*\*\//g, '')), false, `${f.slice(RAIZ.length)} usa el operador de potencia`);
  }
});

test('el código del paquete no itera con for…in (el orden de las claves numéricas mezcladas no está fijado, §1.4)', () => {
  for (const f of delPaquete) {
    const codigo = sinComentarios(readFileSync(f, 'utf8'));
    assert.equal(/\bfor\s*\(\s*(const|let|var)\s+\w+\s+in\b/.test(codigo), false, `${f.slice(RAIZ.length)} usa for…in`);
  }
});

test('los imports del paquete son de ./ (propio) y ../contratos/; las pruebas, además, de ../ y node:', () => {
  for (const f of todos) {
    const esPrueba = f.includes('/pruebas/');
    const texto = sinComentarios(readFileSync(f, 'utf8'));
    const rutas = [...texto.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const r of rutas) {
      // el paquete: ./ propio y ../contratos/; las pruebas, además, node:, un archivo del paquete (../x.ts) y ../../contratos/
      const ok = esPrueba
        ? /^node:/.test(r) || /^\.\//.test(r) || /^\.\.\/[\w-]+\.ts$/.test(r) || /^\.\.\/\.\.\/contratos\//.test(r)
        : /^\.\//.test(r) || /^\.\.\/contratos\//.test(r);
      assert.ok(ok, `${f.slice(RAIZ.length)} importa «${r}»: solo se permite ${esPrueba ? 'node:, ./, ../ propio y ../../contratos/' : './ y ../contratos/'} (corte-1.md §14.3)`);
      if (r.endsWith('.json') || r.startsWith('node:')) continue;
      assert.ok(r.endsWith('.ts'), `${f.slice(RAIZ.length)} importa «${r}» sin la extensión .ts (§1.2)`);
    }
  }
});

test('ningún archivo del paquete usa enum, namespace con código ni propiedades en parámetros (TypeScript borrable, §1.2)', () => {
  for (const f of todos) {
    const codigo = sinComentarios(readFileSync(f, 'utf8'));
    assert.equal(/^\s*(export\s+)?(const\s+)?enum\s/m.test(codigo), false, `${f.slice(RAIZ.length)} declara un enum`);
    assert.equal(/^\s*(export\s+)?namespace\s/m.test(codigo), false, `${f.slice(RAIZ.length)} declara un namespace`);
    assert.equal(/constructor\s*\([^)]*\b(public|private|protected|readonly)\s/.test(codigo), false, `${f.slice(RAIZ.length)} usa propiedades en parámetros`);
  }
});

test('indice.ts exporta toda la entrega del contrato (corte-1.md §9, P7) y nada de eso es indefinido', () => {
  const entrega = [
    'esperasDe', 'armarBiografia', 'crearContrafactual', 'causasConfirmadas', 'verificarFrases', 'supuestosDe', 'tamizar', 'armarFormulario', 'planDeMedicion',
  ] as const;
  for (const nombre of entrega) assert.equal(typeof (indice as Record<string, unknown>)[nombre], 'function', `indice.ts no exporta la función «${nombre}»`);
  assert.equal(typeof indice.crearContrafactual(), 'function', 'crearContrafactual() devuelve el contrafactual dirigido');
  for (const [nombre, valor] of Object.entries(indice)) assert.notEqual(valor, undefined, `indice.ts exporta «${nombre}» indefinido`);
});
