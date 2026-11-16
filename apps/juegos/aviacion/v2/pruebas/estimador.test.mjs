// El estimador verdadero contra lo que pasa después, y el libro de la empresa.
//   cd apps/juegos/aviacion/v2 && node --test pruebas/*.test.mjs        (o: node pruebas/estimador.test.mjs para ver la tabla)
//
// Tres números por caso:
//   · analítico: la cuenta rápida del modelo (estimarAvion y decisiones), la que había antes;
//   · tarjeta: lo que muestra la tarjeta de decisión (src/estimador.js: gemelos del estado, con y sin la compra, 3 días);
//   · real: lo que pasa de verdad en la partida si se hace la compra y no se toca nada más, medido acá con otra cuenta (por la
//     caja: plata al final menos plata al principio, sin premios ni ventas forzadas, contra la misma partida sin la compra).
// Y aparte, lo que dice la nota «resultado contra lo prometido» cuando la partida sigue con un jugador que compra otras cosas.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../../js/modelo.js';
import { PERFILES, aplicar } from '../../herramientas/perfiles.mjs';
import { estimar, estimarGen, Tandas, Base, costoDecision, avionMasBarato } from '../src/estimador.js';
import * as Libro from '../src/libro.js';
import { partida } from '../herramientas/piloto.mjs';
import { t, plata, numero, fechaTexto, horaTexto } from '../src/ui/textos.js';

// ───────── partidas de prueba ─────────
function jugar(semilla, dias, perfil = 'listo', hastaCap = 1) {
  const s = M.nuevoEstado(semilla), ctx = {};
  for (let i = 0; i < dias * 288; i++) {
    if (i % 6 === 0) { const a = PERFILES[perfil](s, ctx); if (a) aplicar(s, a); }
    for (const e of M.paso(s)) if (e.tipo === 'capitulo') { if (s.cap >= hastaCap) return s; M.avanzarCapitulo(s); }
  }
  return s;
}
const dosRutas = (sem = 7) => { const s = M.nuevoEstado(sem); M.abrirRuta(s, 'BUE', 'MVD'); M.comprarAvion(s, 'golondrina', 'BUE-MVD'); M.abrirRuta(s, 'BUE', 'BHI'); M.comprarAvion(s, 'golondrina', 'BHI-BUE'); for (let i = 0; i < 288; i++) M.paso(s); s.dinero = 60000; return s; };

// Lo que pasa de verdad: la partida sigue 3 días con la compra y sin ella (con su semilla, su clima y el paso de siempre).
function real(s, d, dias = 3) {
  const a = structuredClone(s), b = structuredClone(s);
  const caja = b.dinero; b.dinero = 1e12;
  if (d.tipo === 'ruta') { const r = M.abrirRuta(b, d.a, d.b); const tp = M.avionesDisponibles(b).filter((x) => x.alcance >= r.ruta.km).sort((x, y) => x.precio - y.precio)[0]; M.comprarAvion(b, tp.id, r.ruta.id); }
  else if (d.tipo === 'avion') M.comprarAvion(b, d.id, d.ruta);
  else if (d.tipo === 'faros') M.ponerBalizas(b, d.ruta);
  else M.mejorarTransbordo(b, d.ap);
  const costo = 1e12 - b.dinero; b.dinero = caja - costo;
  const falta = Math.max(0, -b.dinero) + 1; a.dinero += falta; b.dinero += falta;
  M.tomarEventos(b);
  const corre = (g) => { const d0 = g.dinero; let aparte = 0, tormentas = 0; for (let i = 0; i < dias * 288; i++) for (const e of M.paso(g)) { if (e.tipo === 'mision' || e.tipo === 'contrato') aparte += e.premio ?? 0; if (e.tipo === 'ventaForzada') aparte += e.monto ?? 0; if (e.tipo === 'tormenta') tormentas++; } return { neto: g.dinero - d0 - aparte, tormentas }; };
  const ra = corre(a), rb = corre(b);
  return { porDia: Math.round((rb.neto - ra.neto) / dias), costo, tormentas: rb.tormentas };
}
// La cuenta rápida del modelo para la misma decisión (null si el modelo no la calcula).
function analitico(s, d) {
  if (d.tipo === 'avion') return M.estimarAvion(s, d.id, d.ruta);
  const caja = s.dinero; s.dinero = 1e12; let ds; try { ds = M.decisiones(s); } finally { s.dinero = caja; }
  if (d.tipo === 'faros') return ds.find((x) => x.tipo === 'balizas' && x.id === d.ruta)?.efectoDia ?? null;
  if (d.tipo === 'correo') return ds.find((x) => x.tipo === 'transbordo' && x.id === d.ap)?.efectoDia ?? 0;
  if (d.tipo === 'ruta') return ds.find((x) => x.tipo === 'ruta' && x.id === M.idRuta(d.a, d.b) && x.avion)?.efectoDia ?? null;
  return null;
}
const error = (est, r) => Math.abs(est - r) / Math.max(Math.abs(r), 300);   // sobre lo real, con un piso de $ 300 por día

// ───────── los casos ─────────
function casos() {
  const out = [];
  const caso = (nombre, s, d) => out.push({ nombre, s, d });
  { const s = M.nuevoEstado(7); M.abrirRuta(s, 'BUE', 'MVD'); caso('primer avión, Buenos Aires – Montevideo', s, { tipo: 'avion', id: 'golondrina', ruta: 'BUE-MVD' }); }
  caso('segundo avión en la misma ruta (2 rutas, día 2)', dosRutas(), { tipo: 'avion', id: 'golondrina', ruta: 'BUE-MVD' });
  caso('faros en Buenos Aires – Montevideo (día 2)', dosRutas(), { tipo: 'faros', ruta: 'BUE-MVD' });
  caso('ruta a Rosario con su avión (día 2)', dosRutas(), { tipo: 'ruta', a: 'BUE', b: 'ROS' });
  caso('ruta a Mar del Plata con su avión (día 2)', dosRutas(), { tipo: 'ruta', a: 'BUE', b: 'MDQ' });
  caso('agrandar el correo de la base (día 2)', dosRutas(), { tipo: 'correo', ap: 'BUE' });
  for (const [sem, dias] of [[3, 2], [5, 4], [11, 6]]) {
    const s = jugar(sem, dias), pre = `semilla ${sem}, día ${dias + 1}, ${s.rutas.length} rutas y ${s.aviones.length} aviones`;
    const gorda = [...s.rutas].sort((a, b) => b.ingresos - a.ingresos)[0], flaca = [...s.rutas].sort((a, b) => a.ingresos - b.ingresos)[0];
    for (const tp of M.avionesDisponibles(s)) if (tp.alcance >= gorda.km) caso(`${pre}: ${tp.nombre} en ${gorda.id} (la que más cobra)`, s, { tipo: 'avion', id: tp.id, ruta: gorda.id });
    caso(`${pre}: Golondrina en ${flaca.id} (la que menos cobra)`, s, { tipo: 'avion', id: 'golondrina', ruta: flaca.id });
    const sinLuz = s.rutas.find((r) => !r.balizas); if (sinLuz) caso(`${pre}: faros en ${sinLuz.id}`, s, { tipo: 'faros', ruta: sinLuz.id });
    caso(`${pre}: agrandar el correo de la base`, s, { tipo: 'correo', ap: 'BUE' });
    const afuera = ['ROS', 'MDQ', 'COR', 'MDZ', 'NQN', 'ASU', 'REL', 'SAO'].filter((c) => M.ciudadDisponible(s, c) && !M.enRed(s, c));
    for (const c of afuera.slice(0, 2)) { const desde = M.nodosRed(s).sort((a, b) => M.km(a, c) - M.km(b, c))[0]; if (M.puedeAbrirRuta({ ...s, dinero: 1e9 }, desde, c).ok) caso(`${pre}: ruta nueva ${desde}-${c}`, s, { tipo: 'ruta', a: desde, b: c }); }
  }
  return out;
}

let tabla = null;
function medir() {
  if (tabla) return tabla;
  tabla = casos().map(({ nombre, s, d }) => {
    const t0 = performance.now(), e = estimar(s, d), ms = Math.round(performance.now() - t0);
    const an = analitico(s, d), r = real(s, d);
    return { caso: nombre, cuesta: e.costo, analitico: an, tarjeta: e.dejaDia, rango: e.incierto ? `${e.min} a ${e.max}` : '', real: r.porDia,
      'error tarjeta %': Math.round(100 * error(e.dejaDia, r.porDia)), 'error analítico %': an == null ? null : Math.round(100 * error(an, r.porDia)),
      porque: e.motivo?.clave ?? '', ms, _e: e, _r: r };
  });
  return tabla;
}

test('la tarjeta acierta: en cada caso, lo estimado difiere de lo real menos de 30% (y la cuenta rápida del modelo, mucho más)', () => {
  const T = medir();
  console.table(T.map(({ _e, _r, ...fila }) => fila));
  assert.ok(T.length >= 8, `hay ${T.length} casos`);
  for (const f of T) assert.ok(f['error tarjeta %'] < 30, `${f.caso}: tarjeta ${f.tarjeta}, real ${f.real} (${f['error tarjeta %']}%)`);
  const conAn = T.filter((f) => f['error analítico %'] != null);
  const media = (k, l = T) => l.reduce((a, f) => a + f[k], 0) / l.length;
  console.log(`error medio: tarjeta ${media('error tarjeta %').toFixed(1)}% · cuenta rápida del modelo ${media('error analítico %', conAn).toFixed(0)}% (en ${conAn.length} casos) · cuenta rápida con más de 30% de error: ${conAn.filter((f) => f['error analítico %'] >= 30).length} de ${conAn.length}`);
  assert.ok(media('error tarjeta %') < media('error analítico %', conAn) / 5, 'simular gana por mucho a la cuenta rápida');
});

test('si pierde plata, la tarjeta lo dice y da un porqué; si el caso es incierto, lo real cae en el rango', () => {
  for (const f of medir()) {
    if (f.real <= -300) { assert.ok(f._e.pierde, `${f.caso}: pierde ${f.real} y la tarjeta no lo dice`); assert.ok(f._e.motivo?.clave, `${f.caso}: pierde y no dice por qué`); assert.equal(f._e.recuperoDias, null); }
    if (f._e.incierto) assert.ok(f.real >= f._e.min - 300 && f.real <= f._e.max + 300, `${f.caso}: real ${f.real} fuera de ${f._e.min}…${f._e.max}`);
    if (f._e.motivo) assert.ok(t(f._e.motivo.clave) !== f._e.motivo.clave, `falta el texto de ${f._e.motivo.clave}`);
    if (f._e.recuperoDias != null) assert.ok(Math.abs(f._e.recuperoDias - f._e.costo / f._e.dejaDia) < 1e-9);
  }
});

test('una ruta sola no deja nada: la cuenta va con el avión más barato que llega, y el costo suma las dos cosas', () => {
  const s = dosRutas(), d = { tipo: 'ruta', a: 'BUE', b: 'ROS' }, e = estimar(s, d), c = costoDecision(s, d);
  assert.equal(e.avion, avionMasBarato(s, M.km('BUE', 'ROS')).id);
  assert.equal(e.costo, M.costoRuta('BUE', 'ROS') + M.AV[e.avion].precio);
  assert.deepEqual(c.partes.map((p) => p.que), ['ruta', 'avion']);
  // la ruta sin avión: ni cobra ni gasta
  const g = structuredClone(s); M.abrirRuta(g, 'BUE', 'ROS'); const antes = g.stats.ingresos - g.stats.gastos;
  const h = structuredClone(s); for (let i = 0; i < 288; i++) { M.paso(g); M.paso(h); }
  assert.ok(Math.abs((g.stats.ingresos - g.stats.gastos - antes) - (h.stats.ingresos - h.stats.gastos - (s.stats.ingresos - s.stats.gastos))) < 1, 'la ruta sola no cambia el resultado');
  // y lo que no se puede: faros donde ya hay, o un avión que no llega
  const f = structuredClone(s); f.rutas[0].balizas = true;
  assert.equal(costoDecision(f, { tipo: 'faros', ruta: f.rutas[0].id }), null);
  const lejos = jugar(3, 2); const larga = lejos.rutas.find((r) => r.km > 700);
  if (larga) assert.equal(estimar(lejos, { tipo: 'avion', id: 'golondrina', ruta: larga.id }).imposible, 'alcance');
});

test('estimar no toca la partida y da lo mismo de una vez que por tandas', () => {
  const s = dosRutas(), antes = M.guardar(s), d = { tipo: 'avion', id: 'golondrina', ruta: 'BUE-MVD' };
  const a = estimar(s, d);
  assert.equal(M.guardar(s).replace(/"guardado":\d+/, ''), antes.replace(/"guardado":\d+/, ''), 'la partida quedó igual');
  // por tandas, con un reloj de mentira que corta cada tanda enseguida
  const pend = []; let reloj = 0;
  const T = new Tandas({ ahora: () => (reloj += 3), programar: (f) => pend.push(f) });
  assert.equal(T.pedir(s, d), null);
  assert.equal(T.pedir(s, { tipo: 'faros', ruta: 'BUE-MVD' }), null);
  let vueltas = 0; while (pend.length && vueltas++ < 100000) pend.shift()();
  const b = T.pedir(s, d);
  assert.ok(b && vueltas > 10, `terminó en ${vueltas} tandas`);
  for (const k of ['dejaDia', 'min', 'max', 'costo', 'incierto']) assert.equal(b[k], a[k], k);
  assert.deepEqual(b.efectos, a.efectos);
  assert.ok(T.listo(s, { tipo: 'faros', ruta: 'BUE-MVD' }), 'la segunda tarjeta también quedó hecha (comparten las corridas sin la compra)');
  // el generador cede el control seguido: ninguna tanda se queda con todo
  const it = estimarGen(s, d, { base: new Base(s) }); let n = 0; while (!it.next().done) n++;
  assert.ok(n >= 100, `cedió ${n} veces`);
});

test('la cuenta de una tarjeta es rápida en 1929 (menos de 400 ms cada una en este equipo)', () => {
  const lentas = medir().filter((f) => f.ms >= 400);
  assert.deepEqual(lentas.map((f) => `${f.caso}: ${f.ms} ms`), []);
});

// ───────── el libro y la nota «resultado contra lo prometido» ─────────
const ui = { t, plata, numero, fecha: (ms) => fechaTexto(new Date(ms)), hora: (ms) => horaTexto(new Date(ms)) };

test('resultado contra lo prometido: con la partida siguiendo (otro jugador compra cosas), la mayoría de las notas coincide', () => {
  const filas = [];
  for (const semilla of [3, 5, 11]) {
    const { notas } = partida({ semilla, dias: 7 });
    for (const n of notas) filas.push({ semilla, que: n.que, ruta: n.ruta ?? n.ap, prometido: n.prometido, paso: n.paso, 'error %': Math.round(100 * error(n.paso, n.prometido)), veredicto: n.veredicto, causa: n.causas[0]?.clave ?? '' });
  }
  console.table(filas);
  const cumplio = filas.filter((f) => f.veredicto === 'cumplio').length;
  const errores = filas.map((f) => f['error %']).sort((a, b) => a - b), mediana = errores[Math.floor(errores.length / 2)];
  console.log(`notas: ${filas.length} · «se cumplió»: ${cumplio} (${Math.round(100 * cumplio / filas.length)}%) · error mediano ${mediana}% · con más de 30%: ${errores.filter((e) => e >= 30).length}`);
  assert.ok(filas.length >= 30);
  assert.ok(cumplio / filas.length >= 0.6, `se cumplió ${cumplio} de ${filas.length}`);
  assert.ok(mediana < 30, `error mediano ${mediana}%`);
  for (const f of filas) if (f.veredicto !== 'cumplio') assert.ok(f.causa, 'toda diferencia lleva su porqué');
});

test('el libro: el día va de 6 a 6, guarda como mucho 60 días, sobrevive al guardado y arma el contrato de la oficina', () => {
  const { s, L, partes, notas } = partida({ semilla: 3, dias: 6.4 });
  assert.equal(L.dias.length, 6); assert.equal(L.n, 7);
  assert.deepEqual(L.dias.map((d) => d.n), [1, 2, 3, 4, 5, 6]);
  assert.equal(L.dias[0].horas, 21, 'el primer día va de las 9:00 a las 6:00');
  for (const d of L.dias.slice(1)) assert.equal(d.horas, 24);
  // la cuenta del día cierra con la caja: lo que entró, menos lo que salió, menos las compras, más premios y ventas
  let caja = 40000;
  for (const d of L.dias) { caja += d.entro - d.salio - d.compras + d.premios + d.ventas; assert.ok(Math.abs(caja - d.caja) <= 2 * L.dias.length, `día ${d.n}: caja ${d.caja}, cuenta ${caja}`); }
  assert.equal(partes.length, 6);
  for (const p of partes) { assert.ok(p.consejo?.clave && t(p.consejo.clave) !== p.consejo.clave, `consejo ${p.consejo?.clave}`); assert.ok(p.mejor); }
  // ida y vuelta por el guardado «extra» (JSON) y la partida sigue
  const L2 = Libro.abrir(JSON.parse(JSON.stringify(L)), s);
  assert.deepEqual(L2, L);
  const datos = Libro.datosOficina(L2, s, { ui, empresa: { nombre: 'Prueba', color: '#cf3f2c' }, camino: (o, d) => Libro.caminoEncargo(s, o, d, t) });
  assert.deepEqual(Object.keys(datos).sort(), ['bandeja', 'carrera', 'cuaderno', 'dias', 'empresa', 'flota', 'hoy', 'rutas']);
  for (const k of ['n', 'fecha', 'entro', 'salio', 'cartas', 'vuelos', 'aTiempo', 'tarde']) assert.ok(k in datos.dias[0], `dias.${k}`);
  for (const k of ['id', 'nombre', 'km', 'abiertaDia', 'luces', 'aviones', 'entroDia', 'salioDia', 'dejaDia', 'cartasDia', 'llenado', 'prometido']) assert.ok(k in datos.rutas[0], `rutas.${k}`);
  for (const k of ['id', 'nombre', 'tipo', 'ruta', 'compradoDia', 'viajes', 'cartas', 'entro', 'salio', 'llenado', 'estado']) assert.ok(k in datos.flota[0], `flota.${k}`);
  for (const k of ['id', 'tipo', 'titulo', 'texto', 'dia', 'leido', 'acciones']) assert.ok(k in datos.bandeja[0], `bandeja.${k}`);
  for (const k of ['dia', 'fecha', 'hora', 'caja', 'epoca']) assert.ok(k in datos.hoy, `hoy.${k}`);
  assert.equal(datos.hoy.epoca, 1929); assert.equal(datos.empresa.fundada, fechaTexto(new Date(Date.UTC(1929, 10, 1))));
  for (const r of datos.rutas) { assert.ok(r.llenado >= 0 && r.llenado <= 1); assert.ok(Math.abs(r.dejaDia - (r.entroDia - r.salioDia)) <= 1); }
  for (const a of datos.flota) { assert.ok(['volando', 'en tierra', 'durmiendo'].includes(a.estado)); assert.ok(a.llenado >= 0 && a.llenado <= 1); assert.ok(a.entro >= 0 && a.salio >= 0); }
  for (const b of datos.bandeja) { assert.ok(['encargo', 'resultado', 'nota', 'propuesta'].includes(b.tipo)); assert.ok(b.texto && !/\b(res|cz|cj|ban)_\w+/.test(b.texto), b.texto); }
  assert.ok(datos.bandeja.filter((b) => b.tipo === 'resultado').length === notas.length && notas.length > 5);
  assert.ok(JSON.stringify(datos).length < 60000);
  // tope de 60 días
  const larga = partida({ semilla: 5, dias: 64, conPromesa: false, cada: 48 });
  assert.equal(larga.L.dias.length, Libro.TOPE_DIAS); assert.equal(larga.L.dias.at(-1).n, 64);
  for (const x of Object.values(larga.L.rutas)) assert.ok(x.d.length <= Libro.DIAS_RUTA);
  assert.ok(JSON.stringify(larga.L).length < 40000, `el libro de 64 días pesa ${JSON.stringify(larga.L).length} letras`);
});

test('un libro guardado que no sirve (o una partida de antes, sin libro) no rompe nada: se empieza uno de hoy', () => {
  const s = jugar(3, 2);
  for (const roto of [undefined, null, 7, 'x', {}, { v: 1 }, { v: 9, n: 3, dias: [] }, { v: 1, n: 'a', dias: [], rutas: {}, flota: {}, promesas: [], notas: [], c: {}, hoy: {} }]) {
    const L = Libro.abrir(roto, s);
    assert.equal(L.v, 1); assert.equal(L.n, 3); assert.equal(Object.keys(L.rutas).length, s.rutas.length);
    assert.equal(Libro.alPaso(L, s, M.paso(structuredClone(s))), null);
    assert.ok(Libro.datosOficina(L, s, { ui, empresa: { nombre: 'x', color: '#cf3f2c' } }).rutas.length === s.rutas.length);
  }
});

// Para mirar la tabla sin el corredor de pruebas: node pruebas/estimador.test.mjs
