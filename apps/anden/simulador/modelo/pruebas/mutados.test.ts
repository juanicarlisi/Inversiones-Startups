// pruebas/mutados.test.ts · P3 · Modelos mutados: cada uno tiene que dar el diagnóstico esperado, con su JSON Pointer y su nivel.
// (corte-1.md §9, P3: «30 modelos mutados inválidos, cada uno con el código esperado»; acá son más de 100.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compilar } from '../compilar.ts';
import { CASOS, nivelDe } from './mutaciones.ts';
import { resumen } from './ayudas.ts';

test('hay al menos 30 modelos mutados y todos los nombres son distintos', () => {
  assert.ok(CASOS.length >= 30, `hay ${CASOS.length} casos y se piden al menos 30`);
  const nombres = new Set(CASOS.map((c) => c.nombre));
  assert.equal(nombres.size, CASOS.length, 'hay nombres de caso repetidos');
});

for (const caso of CASOS) {
  test(`mutado: ${caso.nombre} → ${caso.clave.replace('modelo.diag.', '')}`, async () => {
    const r = await compilar(caso.entrada());
    const nivel = nivelDe(caso.clave);
    const ds = r.ok ? r.mv.diagnosticos : r.diagnosticos;
    if (nivel === 'error') assert.equal(r.ok, false, `se esperaba que el compilador rechazara el modelo y lo aceptó (${resumen(ds)})`);
    else assert.equal(r.ok, true, `se esperaba que el modelo compilara con ${caso.clave} y se rechazó (${resumen(ds)})`);
    const hallados = ds.filter((d) => d.clave === caso.clave);
    assert.ok(hallados.length > 0, `se esperaba el diagnóstico ${caso.clave} y salió: ${resumen(ds)}`);
    for (const d of hallados) assert.equal(d.nivel, nivel, `el nivel de ${d.clave} debería ser ${nivel} y es ${d.nivel}`);
    if (caso.ruta !== undefined) {
      assert.ok(hallados.some((d) => d.ruta === caso.ruta), `se esperaba ${caso.clave} en ${caso.ruta || '(raíz)'} y salió en ${hallados.map((d) => d.ruta || '(raíz)').join(', ')}`);
    }
  });
}
