// HN-14 y HN-27: la capa de portal (máquina de estados, eventos sin repetir, init que no bloquea, locale) y la capa del lanzamiento
// completo (anuncios con sus reglas), con SDK simulados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearPortal, detectarSdk } from '../js/portal.js';
import { crearAnuncios, crearAlmacen, BANDERAS, CORTE_MIN_MS, OFERTA_MIN_MS } from '../js/anuncios.js';

// SDK de CrazyGames simulado: registra cada llamada.
function sdkCrazy({ initMs = 0, locale = 'es-AR', falla = false, adblock = false, ad = 'fin' } = {}) {
  const llamadas = [];
  const datos = new Map();
  return {
    llamadas,
    init: () => new Promise((ok, mal) => setTimeout(() => (falla ? mal(new Error('x')) : ok()), initMs)),
    game: { gameplayStart: () => llamadas.push('gameplayStart'), gameplayStop: () => llamadas.push('gameplayStop'), loadingStart: () => llamadas.push('loadingStart'),
      loadingStop: () => llamadas.push('loadingStop'), happytime: () => llamadas.push('happytime') },
    user: { systemInfo: { locale } },
    ad: {
      requestAd: (tipo, cb) => { llamadas.push(`ad:${tipo}`); cb.adStarted?.(); setTimeout(() => (ad === 'fin' ? cb.adFinished() : cb.adError('nofill')), 5); },
      hasAdblock: async () => adblock,
    },
    data: { getItem: (k) => (datos.has(k) ? datos.get(k) : null), setItem: (k, v) => datos.set(k, String(v)), removeItem: (k) => datos.delete(k), clear: () => datos.clear() },
  };
}
const sinRepetidos = (l) => l.every((x, i) => i === 0 || x !== l[i - 1]);

test('máquina de estados: gameplayStart al quedar jugable, gameplayStop en ventanas y pausa, nunca dos iguales seguidos', async () => {
  const sdk = sdkCrazy();
  const p = crearPortal({ nombre: 'crazygames', sdk });
  assert.equal(p.estado, 'cargando');
  assert.equal(await p.iniciar(), true);
  p.cargaTermino();
  assert.equal(p.estado, 'menu');
  // el juego avisa su situación en cada cuadro: muchas veces lo mismo
  for (let i = 0; i < 5; i++) p.situacion({ jugable: false });   // portada
  for (let i = 0; i < 5; i++) p.situacion({ jugable: true });    // «Empezar»
  for (let i = 0; i < 3; i++) p.situacion({ jugable: false });   // ventana o pausa
  for (let i = 0; i < 3; i++) p.situacion({ jugable: true });
  p.pausar(); p.pausar(); p.jugar(); p.jugar();
  const juego = sdk.llamadas.filter((x) => x.startsWith('gameplay'));
  assert.deepEqual(juego, ['gameplayStart', 'gameplayStop', 'gameplayStart', 'gameplayStop', 'gameplayStart']);
  assert.ok(sinRepetidos(sdk.llamadas), sdk.llamadas.join(','));
  assert.deepEqual(sdk.llamadas.slice(0, 2), ['loadingStart', 'loadingStop']);
});

test('init con Promise.race de 3 s: si el SDK no responde, el juego arranca igual (y no llama al SDK antes de iniciar)', async () => {
  const sdk = sdkCrazy({ initMs: 10000 });
  const p = crearPortal({ nombre: 'crazygames', sdk, espera: 60 });
  const t0 = Date.now();
  assert.equal(await p.iniciar(), false);
  assert.ok(Date.now() - t0 < 1000);
  p.cargaTermino(); p.jugar();
  assert.ok(p.registro.some((x) => x.evento === 'initSinRespuesta'));
  const caido = crearPortal({ nombre: 'crazygames', sdk: sdkCrazy({ falla: true }), espera: 60 });
  assert.equal(await caido.iniciar(), false);
});

test('el locale del SDK de CrazyGames manda; sin SDK no hay locale; detectarSdk encuentra cada portal', async () => {
  const p = crearPortal({ nombre: 'crazygames', sdk: sdkCrazy({ locale: 'es-ES' }) });
  await p.iniciar();
  assert.equal(p.locale(), 'es-ES');
  assert.equal(crearPortal().locale(), null);
  assert.equal(detectarSdk({}).nombre, 'ninguno');
  assert.equal(detectarSdk({ CrazyGames: { SDK: {} } }).nombre, 'crazygames');
  assert.equal(detectarSdk({ PokiSDK: {} }).nombre, 'poki');
});

test('Poki: gameplayStart y gameplayStop sin repetir; gameLoadingFinished al terminar la carga', async () => {
  const llamadas = [];
  const sdk = { init: async () => {}, gameplayStart: () => llamadas.push('start'), gameplayStop: () => llamadas.push('stop'), gameLoadingFinished: () => llamadas.push('cargado') };
  const p = crearPortal({ nombre: 'poki', sdk });
  await p.iniciar(); p.cargaTermino();
  for (const j of [true, true, false, false, true]) p.situacion({ jugable: j });
  assert.deepEqual(llamadas, ['cargado', 'start', 'stop', 'start']);
});

test('lanzamiento completo: un corte solo al cerrar capítulo y nunca más de uno cada 3 min; el audio se silencia y vuelve', async () => {
  let reloj = 1_000_000;
  const sdk = sdkCrazy();
  const silencio = [];
  const almacen = crearAlmacen({ nombre: 'crazygames', sdk }, { get: () => null, set: () => true, remove: () => {} });
  const a = crearAnuncios({ portal: { nombre: 'crazygames', sdk }, silenciar: (x) => silencio.push(x), ahora: () => reloj, almacen, simulado: false });
  const espera = a.corteCapitulo();
  assert.equal(a.enAnuncio, true, 'durante el anuncio la simulación no avanza');
  assert.equal(await espera, 'fin');
  assert.equal(a.enAnuncio, false);
  assert.deepEqual(silencio, [true, false]);
  reloj += CORTE_MIN_MS - 1000;
  assert.equal(await a.corteCapitulo(), 'espera', 'no más de uno cada 3 minutos');
  reloj += 2000;
  assert.equal(await a.corteCapitulo(), 'fin');
  assert.deepEqual(sdk.llamadas.filter((x) => x.startsWith('ad:')), ['ad:midgame', 'ad:midgame']);
  // con error, el audio vuelve igual
  const sdk2 = sdkCrazy({ ad: 'error' });
  const s2 = [];
  const b = crearAnuncios({ portal: { nombre: 'crazygames', sdk: sdk2 }, silenciar: (x) => s2.push(x), ahora: () => reloj, almacen: crearAlmacen(null, { get: () => null, set: () => true, remove: () => {} }), simulado: false });
  assert.equal(await b.corteCapitulo(), 'error');
  assert.deepEqual(s2, [true, false]);
});

test('video con premio: apagado por la bandera legal; con la bandera, solo 30 min de ausencia, 15 min entre ofertas y sin bloqueador; nunca paga sin anuncio', async () => {
  let reloj = 5_000_000;
  const mem = new Map();
  const almacen = { get: (k) => mem.get(k) ?? null, set: (k, v) => { mem.set(k, v); return true; }, remove: (k) => mem.delete(k) };
  const sdk = sdkCrazy();
  const a = crearAnuncios({ portal: { nombre: 'crazygames', sdk }, ahora: () => reloj, almacen, simulado: false });
  assert.equal(BANDERAS.videoConPremio, false, 'el candidato y la v1.1 arrancan con la bandera apagada');
  assert.equal(await a.puedeOfrecerVideo(3600), false);
  BANDERAS.videoConPremio = true;
  try {
    assert.equal(await a.puedeOfrecerVideo(29 * 60), false, 'menos de 30 min: no');
    assert.equal(await a.puedeOfrecerVideo(31 * 60), true);
    reloj += OFERTA_MIN_MS - 1000;
    assert.equal(await a.puedeOfrecerVideo(3600), false, '15 min entre ofertas');
    reloj += 2000;
    assert.equal(await a.puedeOfrecerVideo(3600), true);
    assert.equal(await a.videoConPremio(), true);
    // con error: no paga
    const b = crearAnuncios({ portal: { nombre: 'crazygames', sdk: sdkCrazy({ ad: 'error' }) }, ahora: () => reloj, almacen: { get: () => null, set: () => true, remove: () => {} }, simulado: false });
    assert.equal(await b.videoConPremio(), false);
    // con bloqueador: no se ofrece
    const c = crearAnuncios({ portal: { nombre: 'crazygames', sdk: sdkCrazy({ adblock: true }) }, ahora: () => reloj, almacen: { get: () => null, set: () => true, remove: () => {} }, simulado: false });
    assert.equal(await c.puedeOfrecerVideo(3600), false);
    // sin portal y fuera de localhost: nunca
    const d = crearAnuncios({ portal: null, ahora: () => reloj, almacen: { get: () => null, set: () => true, remove: () => {} }, simulado: false });
    assert.equal(await d.puedeOfrecerVideo(3600), false);
    assert.equal(await d.videoConPremio(), false);
  } finally { BANDERAS.videoConPremio = false; }
});

test('módulo de datos: guarda en el SDK y en local, lee primero del SDK y migra lo local al primer arranque', () => {
  const sdk = sdkCrazy();
  const local = new Map([['hubnocturno.partida.v1', '{"v":2}']]);
  const l = { get: (k) => local.get(k) ?? null, set: (k, v) => { local.set(k, v); return true; }, remove: (k) => local.delete(k) };
  const al = crearAlmacen({ nombre: 'crazygames', sdk }, l);
  assert.equal(al.conModulo, true);
  assert.equal(al.migrar(['hubnocturno.partida.v1', 'hubnocturno.partida.respaldo']), 1);
  assert.equal(sdk.data.getItem('hubnocturno.partida.v1'), '{"v":2}');
  al.set('x', 'y');
  assert.equal(sdk.data.getItem('x'), 'y'); assert.equal(local.get('x'), 'y');
  assert.equal(al.migrar(['hubnocturno.partida.v1']), 0, 'no pisa lo que ya está en el módulo');
  const sinSdk = crearAlmacen(null, l);
  assert.equal(sinSdk.conModulo, false);
  assert.equal(sinSdk.get('x'), 'y');
});
