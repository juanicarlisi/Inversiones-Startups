// app/pruebas/plano.test.ts · P8 · el plano del hub mientras se simula la primera noche (ui/plano.ts): una traza vacía bien formada, con la
// geometría y el calendario del modelo, que un reproductor acepta sin dibujar ningún paquete; y que nunca rompe la pantalla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServiciosFalsos } from '../servicios-falsos.ts';
import { crearPlano, REPLICA_PLANO, trazaDelPlano } from '../ui/plano.ts';
import { aMs, horaASeg } from '../../contratos/tipos-base.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import { ClaseEntidad, type Traza } from '../../contratos/traza.ts';

async function chica(): Promise<{ s: ReturnType<typeof crearServiciosFalsos>; mv: ModeloValidado }> {
  const s = crearServiciosFalsos({ retardo: 0 });
  const c = await s.compilar(s.plantillas['hub-chico@1.0.0']);
  assert.ok(c.ok, 'la plantilla chica tiene que compilar');
  return { s, mv: (c as { ok: true; mv: ModeloValidado }).mv };
}

test('trazaDelPlano: columnas vacías de largo exacto, catálogo con los nombres del modelo y el calendario en ms', async () => {
  const { s, mv } = await chica();
  const m = mv.modelo, g = s.geometria(m);
  const tr = trazaDelPlano(mv, g);
  assert.equal(tr.version, 1);
  assert.equal(tr.modelo, mv.huella);
  assert.equal(tr.replica, REPLICA_PLANO, 'la réplica del plano no es ninguna noche');
  for (const [nombre, cols] of [['tramos', tr.tramos], ['momentos', tr.momentos], ['paquetes', tr.paquetes]] as const) {
    assert.equal(cols.n, 0, `${nombre}: n tiene que ser 0`);
    for (const [k, v] of Object.entries(cols)) if (k !== 'n') assert.equal((v as ArrayLike<number>).length, 0, `${nombre}.${k} tiene que tener largo 0`);
  }
  assert.equal(tr.inicio, aMs(horaASeg(m.calendario.inicio)));
  assert.equal(tr.fin, aMs(horaASeg(m.calendario.fin)));
  assert.equal(tr.corte, aMs(horaASeg(m.calendario.corte)));
  assert.equal(tr.tickLazo, aMs(m.hub.sorter.paso / m.hub.sorter.velocidad), 'el paso del lazo del plano es el del modelo (300 ms)');
  assert.equal(tr.bandejas, g.lazo.bandejas);
  assert.deepEqual(tr.catalogo.rampas, m.hub.rampas.map((r) => r.id));
  assert.deepEqual(tr.catalogo.puestos, m.hub.induccion.puestos.map((p) => p.id));
  assert.deepEqual(tr.catalogo.andenes, m.hub.andenes.map((a) => a.id));
  assert.equal(tr.catalogo.personas.length, 0, 'sin personas: nadie se dibuja en un instante que no se simuló');
  assert.equal(tr.geometria, g);
});

test('el plano en un reproductor: ninguna entidad y ningún número inválido en el estado de los recursos', async () => {
  const { s, mv } = await chica();
  const r = s.crearReproductor(trazaDelPlano(mv, s.geometria(mv.modelo)));
  const pos = r.crearPosiciones(), rec = r.crearEstadoRecursos();
  for (const t of [r.inicio, (r.inicio + r.fin) / 2, r.fin]) {
    r.posiciones(t, pos);
    assert.equal(pos.n, 0, `en ${t} ms no tiene que haber ninguna entidad (salieron ${pos.n})`);
    r.recursos(t, rec);
    assert.ok(Number.isFinite(rec.pasoLazo), `el paso del lazo tiene que ser finito y salió ${rec.pasoLazo}`);
    assert.equal(rec.filaAcumulacion, 0);
    assert.ok(rec.rampaOcupacion.every((x) => x === 0), 'ninguna rampa con paquetes');
  }
  const g = s.geometria(mv.modelo), est = g.estaciones[0];
  assert.notEqual(r.tocar(est.x, est.y - 1.1, r.inicio, 2)?.clase, ClaseEntidad.PAQUETE, 'tocar el plano junto a un puesto no encuentra paquetes');
});

test('crearPlano: se arma una vez y, si el reproductor no acepta la traza vacía, da null en lugar de romper la pantalla', async () => {
  const { s, mv } = await chica();
  let llamadas = 0;
  const plano = crearPlano(() => s.geometria(mv.modelo), (t: Traza) => { llamadas++; return s.crearReproductor(t); }, mv);
  const a = plano(), b = plano();
  assert.ok(a);
  assert.equal(a, b, 'el mismo reproductor en cada cuadro');
  assert.equal(llamadas, 1);
  const roto = crearPlano(() => s.geometria(mv.modelo), () => { throw new Error('escena: la traza no trae tramos'); }, mv);
  assert.equal(roto(), null);
  const sinGeometria = crearPlano(() => { throw new Error('geometría inválida'); }, s.crearReproductor, mv);
  assert.equal(sinGeometria(), null);
});
