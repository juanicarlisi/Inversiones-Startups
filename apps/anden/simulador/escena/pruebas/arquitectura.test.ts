// escena/pruebas/arquitectura.test.ts · P6. Límites del paquete leídos del texto de los archivos (corte-1.md §1, §2 y §14; diseño maestro
// §4.3: la escena «no puede mover algo que no esté en la traza»):
// - el código de la escena importa solo contratos (sin la referencia ni las fixtures) y archivos propios; ningún otro paquete;
// - ninguna puerta a HTML (innerHTML, outerHTML, insertAdjacentHTML, document.write) ni código armado en ejecución (eval, new Function);
// - nada de azar ni de reloj de pared: Math.random y Date no aparecen (el reloj del pulso de la selección se inyecta).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const CARPETA = fileURLToPath(new URL('..', import.meta.url));
const PRUEBAS = join(CARPETA, 'pruebas');
const codigo = readdirSync(CARPETA).filter((f) => f.endsWith('.ts')).map((f) => ({ f, texto: readFileSync(join(CARPETA, f), 'utf8') }));
const pruebas = readdirSync(PRUEBAS).filter((f) => f.endsWith('.ts')).map((f) => ({ f: `pruebas/${f}`, texto: readFileSync(join(PRUEBAS, f), 'utf8') }));

/** Texto sin comentarios (para que la explicación de una regla no la rompa). */
const sinComentarios = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
const importsDe = (t: string) => [...t.matchAll(/(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

test('el código de la escena importa solo contratos y archivos propios, siempre con extensión .ts', () => {
  assert.ok(codigo.length >= 15, `se esperaban los archivos del paquete y hay ${codigo.length}`);
  for (const { f, texto } of codigo) {
    for (const ruta of importsDe(texto)) {
      const ok = /^\.\/[a-z0-9-]+\.ts$/.test(ruta) || /^\.\.\/contratos\/[a-z0-9-]+\.ts$/.test(ruta);
      assert.ok(ok, `${f} importa «${ruta}»: la escena solo puede importar ./archivo.ts o ../contratos/archivo.ts`);
    }
  }
});

test('las pruebas importan contratos (con su referencia y fixtures), el paquete y sus ayudas, y Node; ningún otro paquete', () => {
  for (const { f, texto } of pruebas) {
    for (const ruta of importsDe(texto)) {
      const ok = ruta.startsWith('node:') || /^\.\.\/[a-z0-9-]+\.ts$/.test(ruta) || /^\.\/[a-z0-9-]+\.ts$/.test(ruta)
        || /^\.\.\/\.\.\/contratos\/[a-z0-9/.-]+\.(ts|mjs)$/.test(ruta);
      assert.ok(ok, `${f} importa «${ruta}», que no es de la escena, de contratos ni de Node`);
    }
  }
});

test('ninguna puerta a HTML ni código armado en ejecución; ni azar ni reloj de pared', () => {
  const prohibidos: [RegExp, string][] = [
    [/\binnerHTML\b/, 'innerHTML'], [/\bouterHTML\b/, 'outerHTML'], [/\binsertAdjacentHTML\b/, 'insertAdjacentHTML'],
    [/\bdocument\.write\b/, 'document.write'], [/\beval\s*\(/, 'eval'], [/\bnew\s+Function\b/, 'new Function'],
    [/\bMath\.random\b/, 'Math.random'], [/\bDate\b/, 'Date'],
  ];
  for (const { f, texto } of codigo) {
    const t = sinComentarios(texto);
    for (const [re, nombre] of prohibidos) assert.ok(!re.test(t), `${f} usa ${nombre}`);
  }
});

test('ningún texto de interfaz fijo en el código: lo único que va al lienzo como texto son ids del modelo', () => {
  // las primitivas de texto solo se arman con r.id o a.id (datos del modelo, recortados): nunca con un literal
  // (primitivas.ts solo declara el tipo PTexto)
  let vistas = 0;
  for (const { f, texto } of codigo.filter((x) => x.f !== 'primitivas.ts')) {
    for (const m of texto.matchAll(/tipo:\s*'texto'[^}]*?texto:\s*([\w.]+(?:\([^)]*\))?)/g)) {
      assert.match(m[1].trim(), /^[ra]\.id\.slice\(0, 8\)$/, `${f}: una primitiva de texto con «${m[1].trim()}» (solo se permiten ids del modelo)`);
      vistas++;
    }
  }
  assert.equal(vistas, 2, 'rótulos de los andenes en la planta y de las rampas en las dos vistas (rotulos.ts)');
});
