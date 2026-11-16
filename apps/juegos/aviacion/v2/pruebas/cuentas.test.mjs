// Las cuentas que se le muestran al jugador cierran: «hoy» es una sola cuenta, la caja del parte de la mañana suma exacto y el
// consejo del parte sale del mismo estimador que la tarjeta. (Arreglos de la prueba a ciegas del 16-11-2026.)
//   cd apps/juegos/aviacion/v2 && node --test pruebas/*.test.mjs        (o: node pruebas/cuentas.test.mjs para ver las tablas)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as M from '../../js/modelo.js';
import { PERFILES } from '../../herramientas/perfiles.mjs';
import { estimar, Tandas, firmaEstado, redondo, avionMasBarato } from '../src/estimador.js';
import * as Libro from '../src/libro.js';
import { partida, hacer } from '../herramientas/piloto.mjs';
import { t, plata, numero, fechaTexto, horaTexto } from '../src/ui/textos.js';

const ui = { t, plata, numero, fecha: (ms) => fechaTexto(new Date(ms)), hora: (ms) => horaTexto(new Date(ms)) };
const fuente = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
// «hoy» medido aparte, con otra cuenta: lo cobrado menos lo cargado a los vuelos y a la tierra, evento por evento no se puede (el
// modelo no los emite), así que se usa la caja: lo que cambió la caja, sin lo comprado, lo vendido ni los premios.
const operacion = (s, caja0, compras, premios, ventas) => s.dinero - caja0 + compras - premios - ventas;

// ───────── «hoy»: una sola cuenta ─────────
test('«hoy» es lo que entró menos lo que salió por operar desde las 6:00: las compras y los premios no entran', () => {
  // la partida de la prueba a ciegas: las dos primeras compras de avión cumplen cada una su misión (el premio entra en el acto)
  for (const comoJuego of [true, false]) {
    const s = M.nuevoEstado(7), L = Libro.nuevo(s), caja0 = s.dinero;
    let compras = 0, premios = 0;
    const paso = () => { const ev = M.paso(s); for (const e of ev) if (e.tipo === 'mision' || e.tipo === 'contrato') premios += e.premio ?? 0; Libro.alPaso(L, s, ev); };
    const comprar = (a, precio) => { const r = hacer(s, L, a, { conPromesa: false, comoJuego }); assert.ok(r.ok, JSON.stringify(a)); compras += precio; };
    comprar({ tipo: 'ruta', a: 'BUE', b: 'MVD' }, M.costoRuta('BUE', 'MVD'));
    comprar({ tipo: 'avion', id: 'golondrina', ruta: 'BUE-MVD' }, 10000);        // cumple la misión 1: + $ 3.000 en el mismo instante
    for (let i = 0; i < 24; i++) paso();
    comprar({ tipo: 'ruta', a: 'BUE', b: 'BHI' }, M.costoRuta('BUE', 'BHI'));
    comprar({ tipo: 'avion', id: 'golondrina', ruta: 'BHI-BUE' }, 10000);        // cumple la misión 2: + $ 5.000
    for (let i = 0; i < 40; i++) paso();
    const premiosVistos = comoJuego ? 8000 + premios : premios;                   // con comoJuego los eventos de la compra no pasan por paso()
    assert.ok(premiosVistos >= 8000, 'las dos primeras misiones se cumplieron al comprar');
    const hoy = Libro.hoyDe(L, s);
    assert.equal(hoy.compras, compras, 'lo comprado es lo que costó, sin descontar premios');
    assert.equal(hoy.premios, premiosVistos, 'los premios van aparte');
    assert.equal(hoy.quedo, hoy.entro - hoy.salio);
    const real = operacion(s, caja0, compras, premiosVistos, 0);
    assert.ok(Math.abs(hoy.quedo - real) <= 1, `hoy ${hoy.quedo} contra lo operado de verdad ${real.toFixed(1)}`);
    assert.ok(hoy.salio < compras / 2, `«salió» no carga con ninguna compra (${hoy.salio})`);
    // el puente con la oficina da el mismo «hoy»
    const d = Libro.datosOficina(L, s, { ui, empresa: { nombre: 'x', color: '#cf3f2c' } }).hoy;
    assert.deepEqual([d.entro, d.salio, d.quedo, d.compras, d.premios], [hoy.entro, hoy.salio, hoy.quedo, hoy.compras, hoy.premios]);
  }
});

test('«hoy» vuelve a cero con cada parte de la mañana y coincide con «Quedó» del parte', () => {
  const s = M.nuevoEstado(7), L = Libro.nuevo(s), ctx = {};
  let ultimoHoy = null, partes = 0;
  for (let i = 0; i < 4 * 288; i++) {
    if (i % 6 === 0) { const a = PERFILES.listo(s, ctx); if (a) hacer(s, L, a, { conPromesa: false, comoJuego: true }); }
    const antes = Libro.hoyDe(L, s);
    const ev = M.paso(s), c = Libro.alPaso(L, s, ev);
    if (c?.cerro != null) {
      partes++;
      const p = Libro.parte(L, s, c.cerro), hoy = Libro.hoyDe(L, s);
      // el parte dice lo que venía diciendo la barra (más lo del último paso, que cruzó las 6:00)
      assert.ok(Math.abs(p.quedo - antes.quedo) < 2500, `parte ${p.quedo}, barra un paso antes ${antes.quedo}`);
      assert.ok(Math.abs(hoy.quedo) < 5 && hoy.entro < 5 && hoy.compras === 0 && hoy.premios === 0, `tras el parte, hoy arranca en cero (${JSON.stringify(hoy)})`);
    }
    ultimoHoy = antes;
  }
  assert.ok(partes >= 4 && ultimoHoy);
});

test('una sola función calcula «hoy»: la barra, el puente y el libro la usan (nadie más resta gastos por su cuenta)', () => {
  const main = fuente('main.js');
  assert.ok(/gananciaHoy: Libro\.hoyDe\(libro, s\)\.quedo/.test(main), 'la barra usa Libro.hoyDe');
  assert.ok(!/gananciaHoy: M\.gananciaDia/.test(main), 'la barra ya no usa la ganancia de 24 horas corridas del modelo');
  assert.ok(!/costo: caja - s\.dinero/.test(main) && !/costo: caja - s\.dinero/.test(fuente('../herramientas/piloto.mjs')), 'ninguna compra se mide por la caja');
  assert.ok(/\.\.\.hoyDe\(L, s\)/.test(fuente('libro.js')), 'el puente con la oficina reparte el mismo hoyDe');
});

// ───────── la caja del parte cierra ─────────
function cierres({ semilla, dias, perfil = 'listo', comoJuego = true }) {
  const { s, L, partes } = partida({ semilla, dias, perfil, conPromesa: false, comoJuego });
  return { s, L, partes };
}
test('el parte cierra con la caja, peso por peso: ayer tenías + quedó − compraste + premios + ventas = hoy tenés', () => {
  const filas = [];
  let conCompras = 0, conPremios = 0, sinNada = 0;
  for (const [semilla, dias, perfil, comoJuego] of [[7, 8, 'listo', true], [3, 6, 'listo', false], [5, 10, 'listo', true], [11, 6, 'listo', true]]) {
    const { L, partes } = cierres({ semilla, dias, perfil, comoJuego });
    assert.ok(partes.length >= dias - 1, `semilla ${semilla}: ${partes.length} partes`);
    let cajaAyer = null;
    for (const p of partes) {
      const c = p.cierre, d = p.dia;
      assert.ok(c, 'cada día cerrado trae su cierre');
      assert.equal(c.antes + c.quedo - c.compras + c.premios + c.ventas, c.caja, `semilla ${semilla}, día ${d.n}: ${JSON.stringify(c)}`);
      assert.equal(c.otros, 0, `semilla ${semilla}, día ${d.n}: no sobra plata sin explicar`);
      assert.ok(c.cierra);
      assert.equal(c.quedo, p.quedo, 'el «quedó» de la caja es el del parte');
      assert.equal(c.quedo, d.entro - d.salio);
      if (cajaAyer != null) assert.equal(c.antes, cajaAyer, 'la caja de hoy es la de mañana a la mañana');
      cajaAyer = c.caja;
      if (c.compras) conCompras++; if (c.premios) conPremios++; if (!c.compras && !c.premios && !c.ventas) sinNada++;
      if (semilla === 7) filas.push({ dia: d.n, 'ayer tenías': c.antes, quedó: c.quedo, compraste: -c.compras, premios: c.premios, ventas: c.ventas, 'hoy tenés': c.caja });
    }
    assert.equal(L.dias[0].cajaAntes, 40000, 'el primer día arranca con la plata inicial');
  }
  console.table(filas);
  assert.ok(conCompras >= 4 && conPremios >= 4, `hubo días con compras (${conCompras}) y con premios (${conPremios})`);
  console.log(`días con compras: ${conCompras} · con premios: ${conPremios} · sin compras ni premios: ${sinNada} (el caso sin nada se prueba abajo)`);
});

test('la caja también cierra con ventas y con un día sin vuelos', () => {
  const s = M.nuevoEstado(7), L = Libro.nuevo(s);
  const paso = () => Libro.alPaso(L, s, M.paso(s));
  let cerro = null;
  for (let i = 0; i < 288 && cerro == null; i++) cerro = paso()?.cerro ?? null;        // día 1: no se compró nada
  let c = Libro.parte(L, s, cerro).cierre;
  assert.deepEqual([c.antes, c.quedo, c.compras, c.premios, c.ventas, c.caja], [40000, 0, 0, 0, 0, 40000]);
  for (const a of [{ tipo: 'ruta', a: 'BUE', b: 'MVD' }, { tipo: 'avion', id: 'golondrina', ruta: 'BUE-MVD' }, { tipo: 'avion', id: 'golondrina', ruta: 'BUE-MVD' }]) assert.ok(hacer(s, L, a, { conPromesa: false, comoJuego: true }).ok);
  for (let i = 0; i < 60; i++) paso();
  assert.ok(hacer(s, L, { tipo: 'vender', id: s.aviones[1].id }, { conPromesa: false, comoJuego: true }).ok);
  cerro = null; for (let i = 0; i < 288 && cerro == null; i++) cerro = paso()?.cerro ?? null;
  c = Libro.parte(L, s, cerro).cierre;
  assert.equal(c.ventas, 6000); assert.equal(c.compras, 23000); assert.equal(c.premios, 3000);
  assert.equal(c.antes + c.quedo - c.compras + c.premios + c.ventas, c.caja); assert.equal(c.otros, 0);
});

test('un libro guardado con el formato de antes carga bien: se corrige lo del día en curso y los días viejos no muestran caja', () => {
  // se arma un libro como los de antes: las compras por la diferencia de caja y sin anotar los premios que entraron al comprar
  const s = M.nuevoEstado(7), L = Libro.nuevo(s);
  const vieja = (a) => { const caja = s.dinero; const r = a.tipo === 'ruta' ? M.abrirRuta(s, a.a, a.b) : M.comprarAvion(s, a.id, a.ruta); assert.ok(r.ok); Libro.anotarCompra(L, s, a.tipo === 'ruta' ? a : { tipo: 'avion', id: a.id, ruta: a.ruta }, null, { costo: caja - s.dinero, ruta: r.ruta?.id ?? a.ruta }); M.tomarEventos(s); };
  vieja({ tipo: 'ruta', a: 'BUE', b: 'MVD' }); vieja({ tipo: 'avion', id: 'golondrina', ruta: 'BUE-MVD' });
  for (let i = 0; i < 30; i++) Libro.alPaso(L, s, M.paso(s));
  delete L.fmt; for (const d of L.dias) delete d.cajaAntes;
  const malo = structuredClone(L);
  assert.equal(Math.round(malo.hoy.compras), 10000, 'el libro viejo anotó $ 10.000 de compras (eran $ 13.000)');
  const guardado = JSON.parse(JSON.stringify(L));
  const A = Libro.abrir(guardado, s), hoy = Libro.hoyDe(A, s);
  assert.equal(A.fmt, 2);
  assert.equal(hoy.compras, 13000); assert.equal(hoy.premios, 3000);
  assert.ok(Math.abs(hoy.quedo - operacion(s, 40000, 13000, 3000, 0)) <= 1);
  assert.equal(Libro.cierreCaja({ n: 1, entro: 5, salio: 3, caja: 9 }), null, 'un día de antes no trae la caja del día anterior: no se muestra la línea');
  // y abrirlo dos veces no corrige dos veces
  const B = Libro.abrir(JSON.parse(JSON.stringify(A)), s);
  assert.equal(Libro.hoyDe(B, s).compras, 13000);
});

// ───────── el consejo del parte y la tarjeta ─────────
test('decir en redondo no cambia el número: dos cifras que pesan, nunca más de un 5% de diferencia', () => {
  assert.deepEqual([14365, 11574, 2521, 7338, 754, 1059, 32447, 96, 0, -8504].map(redondo), [14000, 12000, 2500, 7300, 750, 1100, 32000, 100, 0, -8500]);
  for (let n = 100; n < 300000; n = Math.round(n * 1.13 + 1)) assert.ok(Math.abs(redondo(n) - n) / n <= 0.05, `${n} → ${redondo(n)}`);
});

test('el consejo del parte sale del mismo estimador que la tarjeta: con el estado sin cambiar, coinciden al peso (5 casos)', () => {
  // cinco mañanas de dos partidas: a las 6:00 se hace la cuenta del consejo (como prepararParte) y después se abre la tarjeta
  const filas = [];
  for (const semilla of [7, 5]) {
    const s = M.nuevoEstado(semilla), L = Libro.nuevo(s), ctx = {};
    const T = new Tandas({ programar: () => {} });
    for (let i = 0; i < 6 * 288 && filas.length < 5; i++) {
      if (i % 6 === 0) { const a = PERFILES.listo(s, ctx); if (a) hacer(s, L, a, { conPromesa: false, comoJuego: true }); }
      const c = Libro.alPaso(L, s, M.paso(s));
      if (c?.cerro == null) continue;
      const p = Libro.parte(L, s, c.cerro);
      // el consejo «otro avión donde salen más llenos» (el de la prueba a ciegas), en la ruta que más dejó
      const fila = [...p.rutas].filter((f) => f.aviones > 0).sort((x, y) => y.llenado - x.llenado || y.deja - x.deja)[0];
      if (!fila) continue;
      const r = s.rutas.find((x) => x.id === fila.id), tp = avionMasBarato(s, r.km), d = { tipo: 'avion', id: tp.id, ruta: r.id };
      const firma = firmaEstado(s);
      T.pedir(s, d, { urgente: true }); while (T.pendientes()) T.tanda();
      const consejo = T.listo(s, d, firma);                    // lo que guarda el parte
      const tarjeta = T.pedir(s, d, { urgente: true });        // lo que muestra la tarjeta si se abre desde el parte (reloj frenado)
      assert.ok(consejo && tarjeta, 'las dos cuentas están');
      assert.equal(tarjeta, consejo, 'es la misma cuenta, no otra parecida');
      assert.equal(tarjeta.dejaDia, estimar(s, d).dejaDia, 'y es la del estimador verdadero');
      // si el reloj corre un rato antes de abrir la tarjeta, el estado es otro y la cuenta puede moverse: se mide (no se exige)
      const g = structuredClone(s); for (let k = 0; k < 12; k++) M.paso(g);      // una hora de juego después
      const despues = estimar(g, d).dejaDia;
      filas.push({ partida: semilla, dia: p.dia.n, ruta: r.id, 'consejo dice': `unos ${redondo(consejo.dejaDia)}`, 'cuenta del consejo': consejo.dejaDia, 'tarjeta (sin cambios)': tarjeta.dejaDia, diferencia: tarjeta.dejaDia - consejo.dejaDia, 'tarjeta 1 h después': despues, 'dif. 1 h después %': Math.round(100 * (despues - consejo.dejaDia) / Math.max(300, Math.abs(consejo.dejaDia))) });
    }
  }
  console.table(filas);
  assert.equal(filas.length, 5);
  for (const f of filas) assert.equal(f.diferencia, 0);
});

test('el parte dice el consejo en redondo («unos») y ofrece ver la cuenta; la tarjeta la muestra al peso', () => {
  const main = fuente('main.js');
  assert.ok(/tandas\.listo\(s, c\.decision, partePend\.firma\)/.test(main), 'el consejo usa la cuenta hecha a la hora del parte');
  assert.ok(/dejaEnRedondo\(mejor\.e\)/.test(main) && /data-accion="verConsejo"/.test(main));
  for (const k of ['cj_llena', 'cj_duermen', 'cj_duerme1', 'cj_tardeCola']) for (const lengua of ['es', 'en']) {
    const v = (lengua === 'es' ? t(k, {}) : null);
    if (v) assert.ok(/\{deja\}/.test(v) && !/\{deja\} más/.test(v), `${k}: «${v}»`);
  }
  assert.ok(/unos/.test(t('unos', { monto: '$ 1' })) || /about/.test(t('unos', { monto: '$ 1' })));
});

// Para mirar las tablas sin el corredor de pruebas: node pruebas/cuentas.test.mjs
