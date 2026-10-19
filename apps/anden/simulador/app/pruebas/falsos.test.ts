// app/pruebas/falsos.test.ts · P8 · los servicios falsos se portan como el contrato pide (si no, la interfaz se desarrollaría contra algo
// que no existe): la noche de la maqueta convertida igual que la fixture, el compilador con el F0 de §5, los parches RFC 6902, el códec de
// ida y vuelta (y contra entradas hostiles), una estadística igual de estricta que la de experimentos/, el reproductor sin posiciones
// inválidas y la cancelación con ErrorCancelado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { TipoTramo, ClaseEntidad } from '../../contratos/traza.ts';
import { Prioridad } from '../../contratos/experimentos.ts';
import type { Modelo, OpParche } from '../../contratos/modelo.ts';
import { BASE, nocheDeMaqueta, semillaMaqueta } from '../falsos/maqueta.ts';
import { aplicarParche, calcularF0, compilarFalso, crearCodecFalso, jsonCanonico } from '../falsos/modelo.ts';
import { compararFalso, nocheSintetica, proporcionFalsa, resumirFalso, wilson, cuantilT } from '../falsos/estadistica.ts';
import { crearReproductorFalso } from '../falsos/vista.ts';
import { plantillaChica, plantillaGrande } from '../falsos/plantillas.ts';
import { crearServiciosFalsos } from '../servicios-falsos.ts';

const cerca = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

test('la noche falsa con HUB_BASE es la misma traza que contratos/fixtures/trazaDeMaqueta (más el resumen por paquete y momentos)', () => {
  const sem = semillaMaqueta(1, 0);
  const a = nocheDeMaqueta(BASE, { semilla: 1, replica: 0, modelo: 'x' }).traza, b = trazaDeMaqueta(sem);
  assert.equal(a.tramos.n, b.tramos.n, `tramos: falsa ${a.tramos.n}, fixture ${b.tramos.n}`);
  for (const col of ['e', 'k', 'r', 'a', 't0', 't1'] as const) {
    let distintos = 0;
    for (let i = 0; i < a.tramos.n; i++) if (a.tramos[col][i] !== b.tramos[col][i]) distintos++;
    assert.equal(distintos, 0, `columna ${col}: ${distintos} valores distintos`);
  }
  assert.equal(a.paquetes.n, b.paquetes.n);
  assert.ok(a.momentos.n > 2, 'la noche falsa trae momentos derivados (corte, primer y último paquete, rampas llenas)');
  for (let i = 1; i < a.momentos.n; i++) assert.ok(a.momentos.t[i] >= a.momentos.t[i - 1], 'momentos en orden de tiempo');
  let sinCamion = 0;
  for (let e = 0; e < a.paquetes.n; e++) if (a.paquetes.camion[e] < 0) sinCamion++;
  assert.equal(sinCamion, 0, 'todo paquete tiene su clave estable (camión, índice)');
});

test('compilador falso: el ejemplo de §5 compila, con I-SUPUESTOS y el F0 de la tabla de §5 (error ≤ 1e-9)', async () => {
  const r = await compilarFalso(plantillaChica());
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.match(r.mv.huella, /^[0-9a-f]{16}$/);
  assert.ok(r.mv.diagnosticos.some((d) => d.codigo === 'I-SUPUESTOS'));
  const f = r.mv.f0;
  assert.ok(cerca(f.llegadaMediaPorHora, 3200));
  assert.ok(cerca(f.capacidadDescargaPorHora, 4320));
  assert.ok(cerca(f.capacidadInduccionPorHora, 3937.5));
  assert.ok(cerca(f.capacidadSorterTeoricaPorHora, 2 / 0.6 * 3600 / 1.06));
  assert.ok(cerca(f.capacidadRampasPorHora, 4725));
  assert.equal(f.cuello, 'induccion');
  assert.equal(f.finEstimado, '24:30');
  assert.deepEqual(calcularF0(plantillaChica()), f);
  const g = await compilarFalso(plantillaGrande());
  assert.ok(g.ok, 'la plantilla grande falsa también compila');
});

test('compilador falso: rechaza esquema desconocido, claves prohibidas, textos largos y parámetros fuera de rango', async () => {
  const m = plantillaChica() as unknown as Record<string, unknown>;
  const conEsquema = await compilarFalso({ ...m, esquema: 'otro/9' });
  assert.ok(!conEsquema.ok && conEsquema.diagnosticos.some((d) => d.clave === 'modelo.diag.E-ESQUEMA.esquema-desconocido'));
  const proto = await compilarFalso(JSON.parse(`{"__proto__": {"x": 1}, ${JSON.stringify(m).slice(1)}`));
  assert.ok(!proto.ok && proto.diagnosticos.some((d) => d.clave === 'modelo.diag.E-ESQUEMA.clave-prohibida'));
  const largo = await compilarFalso({ ...m, titulo: 'x'.repeat(5000) });
  assert.ok(!largo.ok && largo.diagnosticos.some((d) => d.clave === 'modelo.diag.E-ESQUEMA.texto-largo'));
  assert.ok(!(await compilarFalso(null)).ok);
  const fuera = plantillaChica(); fuera.parametros.ausentismo.valor = 2.5;
  const rf = await compilarFalso(fuera);
  assert.ok(!rf.ok && rf.diagnosticos[0].clave === 'modelo.diag.E-RANGO.fuera-de-rango', 'un parámetro fuera de su rango no compila');
  const huellaA = (await compilarFalso(m)), huellaB = (await compilarFalso(JSON.parse(jsonCanonico(m))));
  assert.ok(huellaA.ok && huellaB.ok && huellaA.mv.huella === huellaB.mv.huella, 'misma huella con las claves en otro orden');
});

test('parches RFC 6902: add con «-», remove, replace, test, escapes ~0 y ~1, y el original intacto', () => {
  const doc = { a: [1, 2], 'b/c': { 'd~e': 1 }, f: 'x' };
  const copia = structuredClone(doc);
  const ops: OpParche[] = [
    { op: 'add', path: '/a/-', value: 3 }, { op: 'replace', path: '/b~1c/d~0e', value: 2 }, { op: 'remove', path: '/f' },
    { op: 'test', path: '/a/0', value: 1 }, { op: 'add', path: '/g', value: { h: 1 } },
  ];
  assert.deepEqual(aplicarParche(doc, ops), { a: [1, 2, 3], 'b/c': { 'd~e': 2 }, g: { h: 1 } });
  assert.deepEqual(doc, copia, 'el original no cambia');
  assert.throws(() => aplicarParche(doc, [{ op: 'test', path: '/f', value: 'y' }]), /test falló/);
  assert.throws(() => aplicarParche(doc, [{ op: 'replace', path: '/nada', value: 1 }]), /no existe/);
});

test('códec falso: ida y vuelta de plantilla + parche + receta y de modelo completo; entradas hostiles rechazadas', async () => {
  const reg: Record<string, Modelo> = { 'hub-chico@1.0.0': plantillaChica() };
  const codec = crearCodecFalso((id, v) => reg[`${id}@${v}`] ?? null, compilarFalso);
  const parche: OpParche[] = [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }];
  const receta = { v: 1 as const, modelo: '0123456789abcdef', motor: '1.0.0', semilla: 20261017, replicas: 100, noche: 36, t: 88_200_000, vel: 600 };
  const f = await codec.codificar({ tipo: 'plantilla', plantilla: { id: 'hub-chico', version: '1.0.0' }, parche, receta });
  assert.match(f, /^t=hub-chico@1\.0\.0&p=[A-Za-z0-9_-]+&r=[A-Za-z0-9_-]+$/);
  const d = await codec.decodificar(f);
  assert.ok(d.ok && d.enlace.tipo === 'plantilla');
  if (d.ok && d.enlace.tipo === 'plantilla') { assert.deepEqual(d.enlace.parche, parche); assert.deepEqual(d.enlace.receta, receta); }
  const fm = await codec.codificar({ tipo: 'modelo', modelo: plantillaChica() });
  const dm = await codec.decodificar(fm);
  assert.ok(dm.ok && dm.enlace.tipo === 'modelo' && jsonCanonico(dm.enlace.modelo) === jsonCanonico(plantillaChica()));
  const malo = await codec.decodificar('m=%%%no-es-base64');
  assert.ok(!malo.ok && malo.error === 'formato');
  const desconocida = await codec.decodificar('t=otra@9.9.9');
  assert.ok(!desconocida.ok && desconocida.error === 'plantilla-desconocida');
  const largo = await codec.decodificar('m=' + 'A'.repeat(20000));
  assert.ok(!largo.ok && largo.error === 'muy-largo');
  // bomba: 300 KB de ceros comprimidos se cortan en el tope de bytes descomprimidos
  const ceros = new Uint8Array(300_000);
  const comp = new Uint8Array(await new Response(new Blob([ceros]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
  let s = ''; for (const b of comp) s += String.fromCharCode(b);
  const bomba = await codec.decodificar('m=' + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
  assert.ok(!bomba.ok && bomba.error === 'bomba', `se esperaba «bomba» y salió ${JSON.stringify(bomba)}`);
});

test('estadística falsa: tan estricta como experimentos/ (nunca un intervalo de una sola noche)', async () => {
  const s = crearServiciosFalsos({ retardo: 0 });
  const c = await s.compilar(plantillaChica());
  assert.ok(c.ok); if (!c.ok) return;
  const rs = await s.noches(c.mv, 7, 0, 30, Prioridad.NOCHES);
  assert.equal(rs.length, 30);
  assert.throws(() => resumirFalso(rs.slice(0, 1), 'costoPorPaquete', 0.95), /al menos 2 réplicas/);
  assert.throws(() => resumirFalso([rs[0], rs[0]], 'costoPorPaquete', 0.95), /repetida/);
  assert.throws(() => resumirFalso(rs, 'costoPorPaquete', 0.8), /no admitida/);
  const r = resumirFalso(rs, 'costoPorPaquete', 0.95);
  assert.equal(r.n, 30);
  assert.ok(r.ic[0] < r.media && r.media < r.ic[1] && r.icP90 !== null);
  assert.throws(() => compararFalso(rs, rs.slice(0, 20), 'costoPorPaquete', 0.95), /mismas/);
  assert.throws(() => compararFalso(rs, rs, 'paquetes', 0.95), /neutro/);
  const cero = compararFalso(rs, rs, 'costoPorPaquete', 0.95);
  assert.equal(cero.media, 0); assert.equal(cero.veredicto, 'no-se-distingue'); assert.equal(cero.replicasSugeridas, null);
  const p = proporcionFalsa(rs, 'pendientesAlCorte', '<=', 1e12, 0.95);
  assert.equal(p.p, 1);
});

test('valores de control de §7: Wilson 19/20 y 97/100, t(0,975; ν)', () => {
  const w1 = wilson(19, 20, 0.95), w2 = wilson(97, 100, 0.95);
  assert.ok(cerca(w1[0], 0.7639, 1e-4) && cerca(w1[1], 0.9911, 1e-4), `19/20 → ${w1}`);
  assert.ok(cerca(w2[0], 0.9155, 1e-4) && cerca(w2[1], 0.9897, 1e-4), `97/100 → ${w2}`);
  assert.ok(cerca(cuantilT(0.95, 1), 12.7062, 1e-4));
  assert.ok(cerca(cuantilT(0.95, 30), 2.0423, 2e-3));
  assert.ok(cerca(cuantilT(0.95, 100), 1.984, 1e-3));
});

test('noches sintéticas: la misma (semilla, réplica) da lo mismo; A y B comparten la suerte del día', async () => {
  const s = crearServiciosFalsos({ retardo: 0 });
  const a = await s.compilar(plantillaChica()), b = await s.compilar(aplicarParche(plantillaChica(), [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 }]));
  assert.ok(a.ok && b.ok); if (!a.ok || !b.ok) return;
  const base = (await s.noche(a.mv, 3, 0, Prioridad.NOCHES)).resultado;
  assert.deepEqual(nocheSintetica(base, a.mv, 3, 5), nocheSintetica(base, a.mv, 3, 5));
  const ra = await s.noches(a.mv, 3, 0, 10, Prioridad.NOCHES), rb = await s.noches(b.mv, 3, 0, 10, Prioridad.NOCHES);
  assert.deepEqual(ra.map((r) => r.replica), rb.map((r) => r.replica));
  const cmp = s.comparar(ra, rb, 'costoPorPaquete', 0.95);
  assert.equal(cmp.pareada, true);
});

test('reproductor falso: 1.000 instantes sin NaN ni posiciones fuera del piso; tocar devuelve lo que hay', () => {
  const tr = nocheDeMaqueta(BASE, { semilla: 4, replica: 0, modelo: 'x' }).traza;
  const r = crearReproductorFalso(tr), p = r.crearPosiciones(), rec = r.crearEstadoRecursos(), L = tr.geometria.limites;
  let malos = 0, total = 0;
  for (let i = 0; i < 1000; i++) {
    const t = tr.inicio + (tr.fin - tr.inicio) * (i / 1000);
    r.posiciones(t, p); r.recursos(t, rec);
    for (let j = 0; j < p.n; j++) {
      total++;
      if (!Number.isFinite(p.x[j]) || !Number.isFinite(p.y[j]) || p.x[j] < L.xmin - 1 || p.x[j] > L.xmax + 1 || p.y[j] < L.ymin - 1 || p.y[j] > L.ymax + 1) malos++;
    }
    assert.ok(Number.isFinite(rec.pasoLazo));
  }
  assert.ok(total > 10000, `se esperaban muchas posiciones y hubo ${total}`);
  assert.equal(malos, 0, `${malos} posiciones inválidas de ${total}`);
  const t = tr.inicio + (tr.fin - tr.inicio) * 0.3;
  r.posiciones(t, p);
  const toque = r.tocar(p.x[0], p.y[0], t, 0.05);
  assert.deepEqual(toque, { clase: ClaseEntidad.PAQUETE, id: p.id[0] });
  let tramosPaquete = 0;
  for (let i = 0; i < tr.tramos.n; i++) if (tr.tramos.k[i] === TipoTramo.BANDEJA) tramosPaquete++;
  assert.ok(tramosPaquete > 0);
});

test('servicios falsos: cancelarDesde rechaza lo cancelado con ErrorCancelado y no toca las prioridades menores', async () => {
  const s = crearServiciosFalsos({ retardo: 5 });
  const c = await s.compilar(plantillaChica()); assert.ok(c.ok); if (!c.ok) return;
  const noches = s.noches(c.mv, 1, 0, 50, Prioridad.NOCHES);
  const previa = s.noche(c.mv, 1, 0, Prioridad.VISTA_PREVIA);
  s.cancelarDesde(Prioridad.NOCHES);
  await assert.rejects(noches, (e: Error) => e.name === 'ErrorCancelado');
  const v = await previa;
  assert.ok(v.traza && v.resultado.kpi.paquetes > 0, 'la vista previa (prioridad menor) sigue');
});
