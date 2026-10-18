// escena/pruebas/tocar.test.ts · P6. `tocar` devuelve la entidad sembrada (corte-1.md §9 P6): lo que se mueve primero; si no hay nada que se
// mueva cerca, la rampa o el puesto; si no, el lazo; y nada fuera del radio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trazaDeMaqueta } from '../../contratos/fixtures/traza-maqueta.ts';
import { ClaseEntidad, TipoTramo } from '../../contratos/traza.ts';
import { posEnLazo } from '../../contratos/geometria.ts';
import { crearReproductor } from '../reproductor.ts';
import { LAZO, PERSONAS, dist, lazoEnMarcha, trazaSintetica } from './ayudas.ts';

function sembrada() {
  return trazaSintetica((s) => {
    lazoEnMarcha(s);
    s.tramo(0, TipoTramo.INDUCCION, 0, PERSONAS.I1, 1000, 5000);
    s.tramo(PERSONAS.I1, TipoTramo.PERSONA_TRABAJA, 0, 0, 1000, 5000);
    s.tramo(1, TipoTramo.CINTA, 1, 0, 0, 10_000);
    s.paquete(0, { creado: 0, listo: 60_000 });
    s.paquete(1, { creado: 0, listo: 60_000 });
  });
}

test('tocar un paquete, una persona y un paquete en movimiento devuelve justo esa entidad', () => {
  const rep = crearReproductor(sembrada()), D = rep.disposicion;
  const mano = D.estaciones[0].mano, op = D.estaciones[0].operador;
  assert.deepEqual(rep.tocar(mano[0], mano[1], 3000, 0.3), { clase: ClaseEntidad.PAQUETE, id: 0 }, 'en la mano del puesto I1 está el paquete 0');
  assert.deepEqual(rep.tocar(op[0], op[1], 3000, 0.3), { clase: ClaseEntidad.PERSONA, id: PERSONAS.I1 }, 'en el lugar del operador está P-I1');
  // el paquete 1 va por la cinta C2 (de (−2, −8) a (−2, −3) en 10 s): a los 5 s, en (−2, −5,5)
  assert.deepEqual(rep.tocar(-2.05, -5.5, 5000, 0.3), { clase: ClaseEntidad.PAQUETE, id: 1 });
  assert.equal(rep.tocar(-2.05, -5.5, 9_000, 0.3), null, 'a los 9 s el paquete ya no está ahí');
});

test('sin nada que se mueva cerca, tocar devuelve la rampa, el puesto o el lazo; lejos de todo, null', () => {
  const rep = crearReproductor(sembrada()), D = rep.disposicion, R = D.rampas[2];
  const medio = [(R.ini[0] + R.fin[0]) / 2, (R.ini[1] + R.fin[1]) / 2];
  assert.deepEqual(rep.tocar(medio[0], medio[1], 3000, 0.3), { clase: ClaseEntidad.RAMPA, id: 2 });
  assert.deepEqual(rep.tocar(R.jaula[0], R.jaula[1], 3000, 0.3), { clase: ClaseEntidad.RAMPA, id: 2 }, 'la jaula es parte de su rampa');
  const b = D.estaciones[1].base;
  assert.deepEqual(rep.tocar(b[0], b[1], 3000, 0.2), { clase: ClaseEntidad.PUESTO, id: 1 });
  const o = [0, 0, 0];
  posEnLazo(LAZO, 12, o); // la curva de la derecha, lejos de puestos y rampas
  assert.deepEqual(rep.tocar(o[0], o[1], 3000, 0.3), { clase: ClaseEntidad.EQUIPO, id: 0 }, 'sobre el lazo, el sorter');
  assert.equal(rep.tocar(-8, 9, 3000, 0.5), null);
  assert.equal(rep.tocar(Number.NaN, 0, 3000, 1), null, 'coordenadas que no son números: nada');
  assert.equal(rep.tocar(0, 0, 3000, -1), null, 'radio negativo: nada');
});

test('maqueta: 300 entidades elegidas con semilla fija se encuentran tocando su posición exacta', () => {
  const rep = crearReproductor(trazaDeMaqueta(2)), pos = rep.crearPosiciones();
  let x = 12345; // generador lineal congruente con semilla fija (la prueba no depende del reloj ni de Math.random)
  const azar = () => { x = (Math.imul(x, 1103515245) + 12345) >>> 0; return x / 4294967296; };
  let probadas = 0;
  while (probadas < 300) {
    const t = rep.inicio + azar() * (rep.fin - rep.inicio);
    rep.posiciones(t, pos);
    if (pos.n === 0) continue;
    const k = Math.floor(azar() * pos.n), px = pos.x[k], py = pos.y[k], clase = pos.clase[k], id = pos.id[k];
    const r = rep.tocar(px, py, t, 0.05);
    assert.ok(r, `t = ${t}: tocar (${px}, ${py}) no devolvió nada y ahí está la entidad ${clase}/${id}`);
    if (r.clase !== clase || r.id !== id) {
      // otra entidad exactamente en el mismo lugar es válida (empate); cualquier otra cosa, no
      const p2 = rep.crearPosiciones();
      rep.posiciones(t, p2);
      let d = Infinity;
      for (let i = 0; i < p2.n; i++) if (p2.clase[i] === r.clase && p2.id[i] === r.id) d = dist(p2.x[i], p2.y[i], px, py);
      assert.equal(d, 0, `t = ${t}: se tocó ${clase}/${id} y volvió ${r.clase}/${r.id}, a ${d} m`);
    }
    probadas++;
  }
});
