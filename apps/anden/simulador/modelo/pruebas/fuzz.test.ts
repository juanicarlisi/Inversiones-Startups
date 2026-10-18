// pruebas/fuzz.test.ts · P3 · Fuzz determinista (semilla fija) del compilador: cambia hojas del ejemplo y del hub grande por valores
// raros y comprueba las propiedades que no pueden fallar nunca, sea cual sea la entrada:
//   · compilar no lanza y siempre devuelve un resultado ordenado;
//   · un rechazo trae al menos un diagnóstico de nivel error;
//   · un modelo aceptado es seguro de correr: números finitos, presupuesto y memoria dentro de los topes, lazo con ≥ 2 bandejas y
//     tick ≥ 1 ms, F0 sin NaN, y compilarlo otra vez da la misma huella.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compilar } from '../compilar.ts';
import { LIMITES_ENLACE } from '../../contratos/escena.ts';
import { bandejasLazo, tickMs } from '../f0.ts';
import { estimarPresupuesto, eventosRecurrentes, lugaresDeMemoria, MAX_LUGARES_MEMORIA } from '../presupuesto.ts';
import { Lcg, ejemploJson, hubGrandeJson, resumen } from './ayudas.ts';

const VALORES: unknown[] = [
  null, true, false, 'x', '', -1, 0, 1, 2, 0.5, 3.5, 1e308, -1e308, 1e-300, 2 ** 53, 4294967295, 1e9, 1e12, -0, [], {}, [1, 2], '@x', '@induccionBase',
  '@ausentismo', '@noLeido', '@errorPronosticoCv', { tipo: 'fija', valor: 3 }, { tipo: 'lognormal', media: 1, cv: 0 }, { tipo: 'bernoulli', p: 0.5 },
  { tipo: 'exponencial', media: 1e-9 }, { tipo: 'uniforme', min: 0, max: 1e12 }, '22:00', '47:59', '99:99', Infinity, NaN,
];

type Ruta = (string | number)[];
function hojas(x: unknown, ruta: Ruta, out: Ruta[]): void {
  if (Array.isArray(x)) x.forEach((e, i) => hojas(e, [...ruta, i], out));
  else if (x !== null && typeof x === 'object') for (const k of Object.keys(x)) hojas((x as Record<string, unknown>)[k], [...ruta, k], out);
  else out.push(ruta);
}
function todosFinitos(x: unknown): boolean {
  if (typeof x === 'number') return Number.isFinite(x);
  if (Array.isArray(x)) return x.every(todosFinitos);
  if (x !== null && typeof x === 'object') return Object.values(x).every(todosFinitos);
  return true;
}

async function fuzz(nombre: string, base: () => unknown, semilla: number, vueltas: number): Promise<{ ok: number; rechazados: number }> {
  const lcg = new Lcg(semilla);
  const plano: Ruta[] = [];
  hojas(base(), [], plano);
  let ok = 0, rechazados = 0;
  for (let i = 0; i < vueltas; i++) {
    const m = base() as Record<string, unknown>;
    const cambios: string[] = [];
    for (let c = 1 + lcg.hasta(3); c > 0; c--) {
      const r = plano[lcg.hasta(plano.length)];
      let p: unknown = m;
      for (let k = 0; k < r.length - 1; k++) p = (p as Record<string | number, unknown> | undefined)?.[r[k]];
      const v = VALORES[lcg.hasta(VALORES.length)];
      if (p !== null && typeof p === 'object') {
        (p as Record<string | number, unknown>)[r[r.length - 1]] = v;
        cambios.push(`/${r.join('/')} = ${typeof v === 'number' && !Number.isFinite(v) ? String(v) : JSON.stringify(v)}`);
      }
    }
    const donde = `${nombre} #${i}: ${cambios.join(' ; ')}`;
    let r;
    try {
      r = await compilar(m);
    } catch (e) {
      assert.fail(`compilar lanzó (${(e as Error).message}) con ${donde}`);
    }
    if (!r.ok) {
      rechazados++;
      assert.ok(r.diagnosticos.some((d) => d.nivel === 'error'), `rechazo sin ningún diagnóstico de error: ${donde}`);
      continue;
    }
    ok++;
    const mod = r.mv.modelo;
    assert.ok(todosFinitos(mod), `modelo aceptado con números no finitos: ${donde}`);
    const p = estimarPresupuesto(mod);
    assert.ok(p.paquetes <= LIMITES_ENLACE.maxPaquetesEstimados, `paquetes ${p.paquetes} sobre el tope: ${donde}`);
    assert.ok(p.eventos <= LIMITES_ENLACE.maxEventosEstimados, `eventos ${p.eventos} sobre el tope: ${donde}`);
    assert.ok(p.eventos + eventosRecurrentes(mod) <= LIMITES_ENLACE.maxEventosEstimados, `eventos con recurrentes sobre el tope: ${donde}`);
    assert.ok(lugaresDeMemoria(mod) <= MAX_LUGARES_MEMORIA, `lugares de memoria ${lugaresDeMemoria(mod)} sobre el tope: ${donde}`);
    assert.ok(bandejasLazo(mod.hub.sorter) >= 2 && tickMs(mod.hub.sorter) >= 1, `lazo inviable aceptado: ${donde}`);
    for (const [k, v] of Object.entries({ ...r.mv.f0, ...r.mv.f0.utilizacion })) assert.ok(!(typeof v === 'number' && Number.isNaN(v)), `F0 tiene NaN en ${k}: ${donde}`);
    assert.match(r.mv.f0.finEstimado, /^\d{2}:\d{2}$/, donde);
    const otra = await compilar(mod);
    assert.ok(otra.ok && otra.mv.huella === r.mv.huella, `compilar no es idempotente: ${donde} ${otra.ok ? '' : resumen(otra.diagnosticos)}`);
  }
  return { ok, rechazados };
}

test('fuzz del ejemplo: 1.500 modelos con 1 a 3 hojas cambiadas por valores raros', async () => {
  const r = await fuzz('ejemplo', ejemploJson, 20261018, 1500);
  assert.ok(r.ok >= 30 && r.rechazados >= 500, `el fuzz tiene que tocar las dos ramas: ${JSON.stringify(r)}`);
});

test('fuzz del hub grande: 600 modelos', async () => {
  const r = await fuzz('grande', hubGrandeJson, 7, 600);
  assert.ok(r.ok >= 5 && r.rechazados >= 200, `el fuzz tiene que tocar las dos ramas: ${JSON.stringify(r)}`);
});
