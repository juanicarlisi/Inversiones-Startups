// hub/pruebas/traza.test.ts · P4 · La traza del hub cumple contratos/traza.ts: el significado de cada columna por tipo de tramo, la
// causa y el causante, los momentos de §6.8, el resumen por paquete y el catálogo. Lo que dicen los KPI se lee igual en la traza.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Causa, ClaseEntidad, TipoMomento, TipoTramo, claseDeRef, idDeRef } from '../../contratos/traza.ts';
import { aMs, horaASeg } from '../../contratos/tipos-base.ts';
import { geometria } from '../geometria.ts';
import { chico, noche } from './modelos.ts';

// Réplica 0: noche con atraso común, rampas que se llenan y paradas; réplica 1: noche con una falta en inducción.
const s = noche(chico(), 0, 'completa');
const t = s.traza!, T = t.tramos, k = s.resultado.kpi;

function tramosDePaquete(): number[][] {
  const out: number[][] = Array.from({ length: t.paquetes.n }, () => []);
  for (let i = 0; i < T.n; i++) if (T.k[i] >= TipoTramo.DESCARGA && T.k[i] <= TipoTramo.MANUAL) out[T.e[i]].push(i);
  return out;
}
const porPaquete = tramosDePaquete();
const cuantos = (k: number) => { let n = 0; for (let i = 0; i < T.n; i++) if (T.k[i] === k) n++; return n; };
const momentos = (tipo: number) => { const out: number[] = []; for (let i = 0; i < t.momentos.n; i++) if (t.momentos.tipo[i] === tipo) out.push(i); return out; };

test('cabecera, catálogo y geometría de la traza', () => {
  assert.equal(t.version, 1);
  assert.equal(t.tickLazo, 300);
  assert.equal(t.bandejas, 142);
  assert.ok(t.inicio <= aMs(horaASeg('22:00')));
  assert.equal(t.corte, aMs(horaASeg('25:30')));
  assert.ok(t.fin >= aMs(horaASeg('30:00')));
  assert.equal(t.huella, s.resultado.huella);
  assert.deepEqual(t.geometria, geometria(chico()));
  const c = t.catalogo;
  assert.deepEqual(c.personas.map((p) => p.rol), [...Array(3).fill('induccion'), ...Array(6).fill('rampa'), ...Array(6).fill('descarga'), 'excepcion']);
  assert.equal(new Set(c.personas.map((p) => p.id)).size, c.personas.length, 'ids de persona únicos');
  assert.deepEqual(c.camiones.map((x) => x.turno), Array.from({ length: 10 }, (_, i) => aMs(horaASeg('22:00') + i * 900)));
  assert.equal(c.rutas.length, 10);
  assert.equal(c.rampas.length, 12);
  assert.deepEqual(c.puestos, ['I1', 'I2', 'I3', 'I4', 'I5']);
  assert.deepEqual(c.andenes, ['A1', 'A2', 'A3']);
  // columnas de largo exacto
  for (const col of [T.e, T.k, T.r, T.a, T.t0, T.t1, T.c, T.q]) assert.equal(col.length, T.n);
});

test('biografía de cada paquete: DESCARGA → CINTA → ACUMULACION → … → JAULA, con las columnas del contrato', () => {
  const P = t.paquetes;
  const bandejasDeClase = chico().hub.perfilPaquete.clases.map((c) => c.bandejas);
  const claves = new Set<string>();
  for (let e = 0; e < P.n; e++) {
    const lista = porPaquete[e];
    const tipos = lista.map((i) => T.k[i]);
    assert.equal(tipos[0], TipoTramo.DESCARGA, `paquete ${e}: empieza en la descarga`);
    assert.equal(T.a[lista[0]], P.camion[e], 'DESCARGA: a = camión');
    assert.ok(T.r[lista[0]] >= 0 && T.r[lista[0]] < 3, 'DESCARGA: r = andén');
    assert.equal(tipos[1], TipoTramo.CINTA);
    assert.equal(tipos[2], TipoTramo.ACUMULACION);
    assert.equal(T.c[lista[2]], Causa.FILA);
    const ultimo = lista[lista.length - 1];
    assert.equal(T.k[ultimo], TipoTramo.JAULA, `paquete ${e}: termina en la jaula`);
    assert.equal(P.listo[e], T.t0[ultimo], 'listo = entrada a la jaula');
    assert.ok(T.a[ultimo] % 1000 < 60, 'JAULA: a = jaula·1000 + posición (< capacidad)');
    let vueltas = 0;
    for (const i of lista) {
      if (T.k[i] === TipoTramo.BANDEJA && T.a[i] > 0) {
        vueltas++;
        assert.equal(T.c[i], Causa.RAMPA_LLENA, 'una vuelta extra lleva causa RAMPA_LLENA');
        assert.equal(claseDeRef(T.q[i]), ClaseEntidad.RAMPA, 'y la rampa como causante');
        assert.ok(idDeRef(T.q[i]) < 12);
      }
      if (T.k[i] === TipoTramo.RAMPA) {
        assert.equal(claseDeRef(T.q[i]), ClaseEntidad.PERSONA, 'RAMPA: q = la persona que la atiende');
        assert.ok(['rampa', 'reten'].includes(t.catalogo.personas[idDeRef(T.q[i])].rol));
      }
      if (T.k[i] === TipoTramo.ESPERA_BANDEJA) {
        assert.equal(T.c[i], Causa.FALTA_BANDEJA);
        assert.equal(T.a[i], bandejasDeClase[P.clase[e]], 'ESPERA_BANDEJA: a = bandejas que necesita (1 o 2)');
      }
      if (T.k[i] === TipoTramo.INDUCCION) assert.equal(t.catalogo.personas[T.a[i]].rol === 'induccion' || t.catalogo.personas[T.a[i]].rol === 'reten', true);
    }
    assert.equal(P.vueltas[e], Math.min(255, vueltas), `paquete ${e}: el resumen cuenta sus vueltas extra`);
    const clave = `${P.camion[e]}/${P.indice[e]}`;
    assert.ok(!claves.has(clave), `la clave estable ${clave} se repite`);
    claves.add(clave);
  }
});

test('filas FIFO con fórmula cerrada: la secuencia de la acumulación y de cada rampa crece con el orden de entrada', () => {
  let anterior = -1, tAnterior = -Infinity;
  const porRampa = new Map<number, number>();
  for (let i = 0; i < T.n; i++) {
    if (T.k[i] === TipoTramo.ACUMULACION) {
      assert.equal(T.a[i], anterior + 1, 'ACUMULACION: a = secuencia de entrada, sin saltos');
      assert.ok(T.t0[i] >= tAnterior);
      anterior = T.a[i];
      tAnterior = T.t0[i];
    }
    if (T.k[i] === TipoTramo.RAMPA) {
      const prev = porRampa.get(T.r[i]) ?? -1;
      assert.equal(T.a[i], prev + 1, `RAMPA ${T.r[i]}: a = secuencia en la rampa`);
      porRampa.set(T.r[i], T.a[i]);
    }
  }
});

test('lo que dicen los KPI se lee igual en la traza', () => {
  assert.equal(cuantos(TipoTramo.JAULA), k.clasificados);
  let vueltas = 0, colocaciones = 0;
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.BANDEJA) { if (T.a[i] > 0) vueltas++; else colocaciones++; }
  assert.equal(vueltas, k.vueltasExtra);
  assert.equal(k.recirculacionPct, (100 * vueltas) / colocaciones);
  const aExc = new Set<number>();
  const motivos = new Set<number>();
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.COLA_MANUAL) { aExc.add(T.e[i]); motivos.add(T.c[i]); }
  assert.equal(aExc.size, k.aExcepcion);
  assert.deepEqual([...motivos].sort((a, b) => a - b), [Causa.RAMPA_LLENA, Causa.NO_LEIDO, Causa.NO_TRANSPORTABLE].sort((a, b) => a - b),
    'los tres motivos de excepción aparecen');
  // cada paso por la cola manual termina en un tramo MANUAL de trabajo; los de espera de lugar en la acumulación (motor 1.2.0, HUB-R03)
  // llevan causa BLOQUEO
  let manualTrabajo = 0;
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.MANUAL && T.c[i] !== Causa.BLOQUEO) manualTrabajo++;
  assert.equal(manualTrabajo, cuantos(TipoTramo.COLA_MANUAL));
  assert.equal(momentos(TipoMomento.LAZO_PARA).length, k.paradasLazo);
  assert.equal(momentos(TipoMomento.LAZO_ARRANCA).length, k.paradasLazo);
  let detenido = 0;
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.LAZO_DETENIDO) { detenido += T.t1[i] - T.t0[i]; assert.equal(T.c[i], Causa.FALLA); }
  assert.ok(Math.abs(detenido / 60000 - k.minutosLazoDetenido) < 1e-9);
  assert.ok(momentos(TipoMomento.RAMPA_LLENA).length >= k.rampasQueSeLlenaron);
});

test('el lazo: tramos de marcha y detenido contiguos desde el inicio, con el paso del lazo en a', () => {
  const lazo: number[] = [];
  for (let i = 0; i < T.n; i++) if (T.k[i] === TipoTramo.LAZO_MARCHA || T.k[i] === TipoTramo.LAZO_DETENIDO) lazo.push(i);
  lazo.sort((x, y) => T.t0[x] - T.t0[y]);
  assert.equal(T.t0[lazo[0]], aMs(horaASeg('22:00')));
  assert.equal(T.k[lazo[0]], TipoTramo.LAZO_MARCHA);
  for (let j = 1; j < lazo.length; j++) {
    assert.equal(T.t0[lazo[j]], T.t1[lazo[j - 1]], 'sin huecos');
    assert.notEqual(T.k[lazo[j]], T.k[lazo[j - 1]], 'alternan');
    if (T.k[lazo[j]] === TipoTramo.LAZO_MARCHA) assert.equal(T.a[lazo[j]], T.a[lazo[j - 1]], 'la marcha sigue desde el paso en que paró');
    assert.equal(T.e[lazo[j]], -1);
  }
});

test('momentos del hub (§6.8)', () => {
  const llega = momentos(TipoMomento.CAMION_LLEGA);
  assert.equal(llega.length, 10, 'uno por camión');
  for (const i of llega) {
    const c = t.momentos.r[i];
    assert.ok(Math.abs(t.momentos.v[i] - (t.momentos.t[i] - t.catalogo.camiones[c].turno) / 60000) < 1e-9, 'v = minutos de atraso');
  }
  const atrasados = momentos(TipoMomento.CAMION_ATRASADO);
  assert.equal(atrasados.length, llega.filter((i) => t.momentos.v[i] > 15).length);
  assert.equal(momentos(TipoMomento.ATRASO_COMUN).length, 1, 'esta noche tiene atraso común');
  assert.deepEqual(momentos(TipoMomento.CORTE).map((i) => t.momentos.t[i]), [t.corte]);
  assert.equal(momentos(TipoMomento.PRIMER_PAQUETE).length, 1);
  const ultimo = momentos(TipoMomento.ULTIMO_CLASIFICADO);
  assert.equal(ultimo.length, 1);
  assert.equal(t.momentos.t[ultimo[0]], Math.max(...t.paquetes.listo));
  assert.equal(momentos(TipoMomento.PAUSA_INICIO).length, momentos(TipoMomento.PAUSA_FIN).length);
  assert.ok(momentos(TipoMomento.PAUSA_INICIO).length >= 9, 'las pausas de las 9 personas con pausas');
  assert.ok(momentos(TipoMomento.JAULA_CERRADA).length >= 100, 'se cierran jaulas');
  assert.ok(momentos(TipoMomento.RAMPA_LIBERA).length > 0);
});

test('una noche con una falta en inducción: AUSENCIA, PERSONA_AUSENTE y el puesto sin persona', () => {
  const u = noche(chico(), 1, 'completa'), tu = u.traza!;
  assert.equal(u.resultado.kpi.ausentes, 1);
  const i = Array.from({ length: tu.momentos.n }, (_, j) => j).find((j) => tu.momentos.tipo[j] === TipoMomento.AUSENCIA)!;
  const quien = tu.momentos.r[i];
  assert.equal(tu.catalogo.personas[quien].rol, 'induccion');
  let ausente = -1, induce = 0;
  for (let j = 0; j < tu.tramos.n; j++) {
    if (tu.tramos.k[j] === TipoTramo.PERSONA_AUSENTE) { ausente = j; assert.equal(tu.tramos.e[j], quien); }
    if (tu.tramos.k[j] === TipoTramo.INDUCCION && tu.tramos.a[j] === quien) induce++;
  }
  assert.ok(ausente >= 0, 'tramo PERSONA_AUSENTE de la persona que falta');
  assert.equal(induce, 0, 'quien falta no induce');
  assert.equal(u.resultado.kpi.inductoresPresentes, 2);
  assert.equal(u.resultado.porRecurso.personaOcupadaPct[quien], 0);
});
