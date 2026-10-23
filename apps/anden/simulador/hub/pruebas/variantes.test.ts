// hub/pruebas/variantes.test.ts · P4 · Lo que el esquema permite y las plantillas no usan: camiones en lista, 'alternar', las reglas
// 'la-que-se-llena-antes' y 'en-orden', retén y F2 en el hub entero. Cada variante corre sin alertas y con todo clasificado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoTramo } from '../../contratos/traza.ts';
import { chico, noche, rampasSinTope } from './modelos.ts';

const sana = (s: ReturnType<typeof noche>, donde: string) => {
  assert.deepEqual(s.resultado.alertas, [], `${donde}: sin alertas`);
  assert.equal(s.resultado.kpi.clasificados, s.resultado.kpi.paquetes, `${donde}: todo clasificado`);
};

test('camiones en lista: turnos y paquetes de cada uno, con su id en el catálogo', () => {
  const m = chico();
  m.demanda.camiones = [
    { id: 'Troncal norte', turno: '22:10', paquetes: 900 },
    { id: 'Troncal sur', turno: '22:40', paquetes: 1500 },
    { id: 'Retiro tardío', turno: '23:55', paquetes: 300 },
  ];
  m.demanda.errorPronostico = { cv: 0 };
  const s = noche(m, 0, 'completa');
  sana(s, 'camiones en lista');
  assert.equal(s.resultado.kpi.paquetes, 2700);
  assert.deepEqual(s.traza!.catalogo.camiones.map((c) => c.id), ['Troncal norte', 'Troncal sur', 'Retiro tardío']);
  const T = s.traza!.tramos, porCamion = [0, 0, 0];
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.CAMION_ANDEN) porCamion[T.e[i]] = T.a[i];
  assert.deepEqual(porCamion, [900, 1500, 300], 'CAMION_ANDEN: a = paquetes del camión');
});

test("multiRampa 'alternar': las dos rampas de una ruta reciben por turnos", () => {
  const m = rampasSinTope(chico());
  m.hub.planClasificacion.multiRampa = 'alternar';
  m.hub.sorter.lector = { ...m.hub.sorter.lector, noLeido: 0 };
  const s = noche(m, 0, 'completa');
  sana(s, "'alternar'");
  // sin rampas llenas ni NO-READ, cada colocación de la Ruta 01 alterna R01 y R07 (y la Ruta 02, R02 y R08)
  const r = s.resultado.porRecurso.rampaRecibidos;
  const noTransportablesPorRuta = (ruta: number) => { const P = s.hub.P.S; let n = 0; for (let e = 0; e < P.nacidos; e++) if (P.ruta[e] === ruta && P.clase[e] === 3) n++; return n; };
  assert.ok(Math.abs(r[0] - r[6]) <= 1 + noTransportablesPorRuta(0), `R01 ${r[0]} y R07 ${r[6]}`);
  assert.ok(Math.abs(r[1] - r[7]) <= 1 + noTransportablesPorRuta(1), `R02 ${r[1]} y R08 ${r[7]}`);
});

for (const regla of ['la-que-se-llena-antes', 'en-orden'] as const) {
  test(`regla de rampa '${regla}': la noche corre entera y las personas atienden todas sus rampas`, () => {
    const m = chico();
    m.personas.rampa.regla = regla;
    const s = noche(m, 3, 'completa');
    sana(s, regla);
    const T = s.traza!.tramos, atendidas = new Map<number, Set<number>>();
    for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.MANO) { if (!atendidas.has(T.r[i])) atendidas.set(T.r[i], new Set()); atendidas.get(T.r[i])!.add(T.a[i]); }
    // Desde el motor 1.1.0 una rampa la atiende su persona y, en las pausas de esa persona, quien la releva: se cuentan rampas distintas.
    const todas = new Set([...atendidas.values()].flatMap((x) => [...x]));
    assert.equal(todas.size, 12, 'entre todas las personas atendieron las 12 rampas');
  });
}

test('retén y F2 con el hub entero: corren sanos', () => {
  const m = chico();
  m.personas.induccion.reten = 1;
  sana(noche(m, 5), 'retén');
  sana(noche(rampasSinTope(chico()), 5, 'completa', 'F2'), 'F2');
});
