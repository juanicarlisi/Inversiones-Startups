// hub/pruebas/azar.test.ts · P4 · Azar por dirección en el hub (corte-1.md §6.3 y §8): P02, R05a, R05b y R01.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claveDe, crearFuenteAzarReferencia, crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import { sorteaAusencia } from '../bloques/personas.ts';
import { crearSimularNoche } from '../simular.ts';
import type { Hub } from '../bloques/comun.ts';
import { chico, noche, SEMILLA, validado } from './modelos.ts';

test('P02 · ausentismo 5%: la fracción de ausentes en 10.000 sorteos (2.000 noches × 5 personas) es 0,05 ± 0,0072', () => {
  const clave = claveDe('personas.rampa', 'ausencia');
  let ausentes = 0;
  for (let noche = 0; noche < 2000; noche++) {
    const azar = crearFuenteAzarReferencia(SEMILLA, noche);
    for (let persona = 0; persona < 5; persona++) if (sorteaAusencia(azar, clave, persona, 0.05)) ausentes++;
  }
  const p = ausentes / 10000, ee = Math.sqrt((0.05 * 0.95) / 10000);
  assert.ok(Math.abs(p - 0.05) <= 3.29 * ee, `fracción de ausentes ${p} fuera de 0,05 ± ${(3.29 * ee).toFixed(4)}`);
  assert.equal(sorteaAusencia(crearFuenteAzarReferencia(1, 1), clave, 0, 0), false, 'con p = 0 nadie falta');
});

/** Atributos de cada paquete por su clave estable (camión, índice). */
function atributos(h: Hub): Map<string, { ruta: number; clase: number; base0: number; manejo: number; noLeido: number }> {
  const P = h.P.S, out = new Map<string, { ruta: number; clase: number; base0: number; manejo: number; noLeido: number }>();
  for (let e = 0; e < P.nacidos; e++) {
    out.set(`${P.camion[e]}/${P.indice[e]}`, { ruta: P.ruta[e], clase: P.clase[e], base0: P.base0[e], manejo: P.manejo[e], noLeido: P.noLeido[e] });
  }
  return out;
}

/** Ausencias por (rol, ordinal en el rol). */
function ausencias(h: Hub): Map<string, number> {
  const out = new Map<string, number>(), cuenta = new Map<string, number>();
  h.cfg.catalogo.personas.forEach((p, g) => {
    const i = cuenta.get(p.rol) ?? 0;
    cuenta.set(p.rol, i + 1);
    out.set(`${p.rol}/${i}`, h.personas.S.presente[g]);
  });
  return out;
}

test('R05a · agregar un puesto de inducción activo no cambia ruta, clase, tiempo base, manejo ni ninguna falta', () => {
  for (const replica of [0, 3, 7]) {
    const a = noche(chico(), replica);
    const m = chico();
    m.personas.induccion.puestosActivos = 4;
    const b = noche(m, replica);
    const A = atributos(a.hub), B = atributos(b.hub);
    assert.equal(A.size, B.size, 'nacen los mismos paquetes');
    let comparados = 0;
    for (const [clave, x] of A) {
      const y = B.get(clave);
      assert.ok(y, `el paquete ${clave} tiene que existir en los dos escenarios`);
      assert.equal(y.ruta, x.ruta, `${clave}: ruta`);
      assert.equal(y.clase, x.clase, `${clave}: clase`);
      assert.equal(y.manejo, x.manejo, `${clave}: manejo`);
      if (x.base0 >= 0 && y.base0 >= 0) { assert.equal(y.base0, x.base0, `${clave}: tiempo base de inducción`); comparados++; }
    }
    assert.ok(comparados > 7000, `se compararon ${comparados} tiempos base`);
    const fa = ausencias(a.hub), fb = ausencias(b.hub);
    for (const [quien, presente] of fa) assert.equal(fb.get(quien), presente, `réplica ${replica}: la falta de ${quien} no puede cambiar`);
    assert.notEqual(a.resultado.huella, b.resultado.huella, 'la corrida sí cambia');
  }
});

test('R05b · bajar la capacidad de las rampas (más vueltas) no cambia la lectura de ningún (paquete, intento)', () => {
  const a = noche(chico(), 2);
  const m = chico();
  for (const r of m.hub.rampas) r.capacidad = 6;
  const b = noche(m, 2);
  assert.ok(b.resultado.kpi.vueltasExtra > a.resultado.kpi.vueltasExtra, 'con rampas más chicas hay más vueltas');
  const A = atributos(a.hub), B = atributos(b.hub);
  let leidos = 0;
  for (const [clave, x] of A) {
    const y = B.get(clave)!;
    if (x.noLeido !== 2 && y.noLeido !== 2) { assert.equal(y.noLeido, x.noLeido, `${clave}: la lectura del intento 0 cambió`); leidos++; }
  }
  assert.ok(leidos > 7000, `se compararon ${leidos} lecturas`);
});

test('R01 · misma semilla y réplica → misma huella (hub chico, 5 semillas); otra réplica → otra huella', () => {
  const sim = crearSimularNoche(crearMotorReferencia), mv = validado(chico());
  const vistas = new Set<string>();
  for (const semilla of [1, 2, 3, SEMILLA, 4294967295]) {
    const h1 = sim(mv, semilla, 0, { traza: 'no' }).resultado, h2 = sim(mv, semilla, 0, { traza: 'no' }).resultado;
    assert.equal(h2.huella, h1.huella, `semilla ${semilla}: la huella tiene que repetirse`);
    assert.deepEqual(h2.kpi, h1.kpi, `semilla ${semilla}: los KPI tienen que repetirse`);
    vistas.add(h1.huella);
  }
  assert.equal(vistas.size, 5, 'cinco semillas, cinco huellas');
  assert.notEqual(sim(mv, 1, 1, { traza: 'no' }).resultado.huella, sim(mv, 1, 0, { traza: 'no' }).resultado.huella);
});

test('la traza no cambia la corrida: misma huella y mismos KPI con traza «no», «kpi» y «completa»', () => {
  const sim = crearSimularNoche(crearMotorReferencia), mv = validado(chico());
  const r = (['no', 'kpi', 'completa'] as const).map((nivel) => sim(mv, SEMILLA, 4, { traza: nivel }));
  assert.equal(r[1].resultado.huella, r[0].resultado.huella);
  assert.equal(r[2].resultado.huella, r[0].resultado.huella);
  assert.deepEqual(r[2].resultado.kpi, r[0].resultado.kpi);
  assert.equal(r[0].traza, undefined);
  assert.equal(r[1].traza, undefined);
  assert.ok(r[2].traza && r[2].traza.tramos.n > 50000);
});
