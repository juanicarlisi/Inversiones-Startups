// El libro de la empresa: la historia día por día, lo prometido en cada compra, las notas de la bandeja y los datos que dibuja la
// oficina (el «contrato de datos» de oportunidades/proyectos/hub-nocturno/diseno-carrera.md §5).
//
// Vive en el guardado «extra» de la v2 (hubnocturno.v2.extra → libro): es un objeto simple, sin funciones, con tope de 60 días.
// No usa DOM ni textos fijos: los textos los arma quien lo muestra con la función t() que recibe. Corre igual en node.
//
// Día de la empresa = jornada: de las 6:00 de un día a las 6:00 del siguiente (la noche es parte del día de trabajo). A las 6:00 se
// cierra la jornada y sale el parte de la mañana.
//
// De dónde sale cada número:
//  · por día (entró, salió, cartas, vuelos, a tiempo, tarde): diferencia de los contadores del modelo (s.stats) entre dos 6:00.
//    «Salió» es lo gastado en volar y en tierra; las compras van aparte (el modelo las suma en el mismo contador y acá se restan).
//  · «hoy» (una sola definición para todo el juego: la barra, el parte, el libro de la oficina y el puente): lo que entró menos lo
//    que salió por operar desde el último parte de la mañana (las 6:00). Lo calcula hoyDe(); las compras son inversión y los
//    premios son premios: van aparte y nunca se mezclan en «hoy».
//  · la caja cierra a la vista: caja de ayer + lo que quedó − lo comprado + premios + ventas = caja de hoy (cierreCaja()).
//  · por ruta: diferencia de lo que el modelo lleva por ruta (ingresos, costos, vuelos, unidades), últimos 7 días.
//  · por avión: lo cobrado y lo llevado salen de los eventos de despegue y aterrizaje; lo gastado, de su resultado en el modelo.
import * as M from '../../js/modelo.js';
import { CAPITULOS } from '../../js/datos.js';

export const TOPE_DIAS = 60, DIAS_RUTA = 7, DIAS_PROMESA = 3, TOPE_NOTAS = 30;
const MIN_DIA = 1440;
export const jornadaDe = (s) => Math.floor((s.t0 / 60000 + s.t - 360) / MIN_DIA);
const inicioJornada = (s) => (jornadaDe(s) * MIN_DIA + 360) * 60000;       // fecha (ms) de las 6:00 con que empezó la jornada
const entregas = (s) => s.stats.entregas.correo + s.stats.entregas.pasajeros + s.stats.entregas.carga;
const fotoRuta = (r) => [Math.round(r.ingresos), Math.round(r.costos), r.vuelos, r.unidades ?? 0];
const foto = (s) => ({ ing: s.stats.ingresos, gas: s.stats.gastos, vue: s.stats.vuelos, ent: entregas(s), at: s.stats.aTiempo, ta: s.stats.tarde, din: s.dinero });
const netoAvion = (av) => (av.ing ?? 0) - (av.cos ?? 0);
// Resultado de operar acumulado: lo cobrado menos lo gastado, sin las compras (que el modelo cuenta en el mismo «gastos»).
const opAcum = (L, s) => s.stats.ingresos - s.stats.gastos + L.cAcum;

export function nuevo(s) {
  const L = {
    v: 1, fmt: 2,                // fmt 2 (16-11-2026): las compras se anotan por lo gastado y cada día guarda la caja del día anterior
    n: Math.max(1, Math.floor((s.t + 180) / MIN_DIA) + 1),   // día de la empresa (la partida arranca a las 9:00 del día 1)
    j: jornadaDe(s), f: Math.max(inicioJornada(s), s.t0), t: s.t,
    c: foto(s),
    hoy: { compras: 0, premios: 0, ventas: 0 },
    cAcum: 0,                    // compras acumuladas desde que existe el libro
    dias: [], rutas: {}, flota: {}, promesas: [], notas: [], cambios: [], tormentas: [], leidos: [], sig: 1,
  };
  sincronizar(L, s, true);
  return L;
}
// Un libro guardado se revisa antes de usarlo (nunca rompe una partida): si no sirve, se empieza uno nuevo.
export function abrir(guardado, s) {
  const L = guardado;
  const ok = L && L.v === 1 && Number.isFinite(L.n) && Array.isArray(L.dias) && L.rutas && L.flota && Array.isArray(L.promesas) && Array.isArray(L.notas) && L.c && L.hoy;
  if (!ok) return nuevo(s);
  L.cambios ??= []; L.tormentas ??= []; L.leidos ??= []; L.cAcum ??= 0; L.sig ??= 1; L.hoy.ventas ??= 0;
  // Un libro de antes (fmt 1) anotaba una compra por lo que bajaba la caja: si esa compra cumplía una misión, el premio quedaba
  // descontado de la compra y sin anotar como premio. Lo de los días cerrados ya no se puede saber; lo del día en curso sí: es
  // justo lo que le sobra a la caja. Se corrige una vez, al abrirlo.
  if (!(L.fmt >= 2)) {
    const k = cuenta(L, s);
    // (los premios de misión son miles redondos: lo que sobra por redondeo de lo operado no se le carga a la compra)
    const x = Math.abs(k.otros - Math.round(k.otros / 1000) * 1000) <= 3 ? Math.round(k.otros / 1000) * 1000 : k.otros;
    if (k.cajaAntes != null && x > 3) { L.hoy.compras += x; L.hoy.premios += x; L.cAcum += x; }
    L.fmt = 2;
  }
  sincronizar(L, s, false);
  return L;
}

// Rutas y aviones nuevos entran al libro; los que ya no están, salen. viejo: ya existían cuando se creó el libro (no se sabe desde cuándo).
function sincronizar(L, s, viejo) {
  const ids = new Set();
  for (const r of s.rutas) { ids.add(r.id); L.rutas[r.id] ??= { ab: viejo && r.vuelos > 0 ? null : L.n, c: viejo ? fotoRuta(r) : [0, 0, 0, 0], d: [], prom: null }; }
  for (const id in L.rutas) if (!ids.has(id)) delete L.rutas[id];
  const avs = new Set();
  for (const av of s.aviones) {
    avs.add(String(av.id));
    // e: cobrado · k: cartas (o pasajeros, o toneladas) llevadas · w: lugares ofrecidos en sus despegues · n0: su resultado al entrar
    L.flota[av.id] ??= { cd: viejo && (av.v ?? 0) > 0 ? null : L.n, e: Math.max(0, av.ing ?? 0), k: 0, w: 0, v0: av.v ?? 0 };
  }
  for (const id in L.flota) if (!avs.has(id)) delete L.flota[id];
}

// Lo que el modelo dejó anotado como eventos (en un paso o al aplicar una acción del jugador): premios, ventas forzadas, vuelos.
// Una misión se puede cumplir en el mismo instante de una compra (el avión que completa la ruta pedida): ese premio llega como
// evento de la acción, no de un paso, y también se anota acá.
export function anotarEventos(L, s, eventos) {
  for (const e of eventos ?? []) {
    if (e.tipo === 'despegue') { const a = L.flota[e.avion]; if (a) { a.k += e.carga ?? 0; const av = s.aviones.find((x) => x.id === e.avion); if (av) a.w += M.capTotal(M.AV[av.tipo]); } }
    else if (e.tipo === 'aterrizaje') { const a = L.flota[e.avion]; if (a) a.e += e.ingreso ?? 0; }
    else if (e.tipo === 'mision' || e.tipo === 'contrato') L.hoy.premios += e.premio ?? 0;
    else if (e.tipo === 'ventaForzada') L.hoy.ventas += e.monto ?? 0;
    else if (e.tipo === 'tormenta') { L.tormentas.push([L.n, e.zona ?? []]); if (L.tormentas.length > 8) L.tormentas.shift(); }
  }
}
// Un premio que no llega como evento (el de pasar de capítulo).
export function anotarPremio(L, monto) { if (monto > 0) L.hoy.premios += monto; }
// Para medir lo que cuesta una compra: se toma la marca antes de comprar y costoDesde() da lo que salió de verdad. (No se mide por
// la caja: si la compra cumple una misión, el premio entra en el mismo instante y la caja baja menos que el precio. Medido el
// 16-11-2026 en la prueba a ciegas: «salió» quedaba $ 8.000 de más, los premios de las dos primeras misiones.)
export const marcaGastos = (s) => s.stats.gastos;
export const costoDesde = (s, marca) => s.stats.gastos - marca;

// Después de cada paso del modelo. Devuelve { cerro: n } si a las 6:00 se cerró la jornada n (sale el parte de la mañana).
export function alPaso(L, s, eventos) {
  anotarEventos(L, s, eventos);
  if (s.rutas.length !== Object.keys(L.rutas).length || s.aviones.length !== Object.keys(L.flota).length) sincronizar(L, s, false);
  const j = jornadaDe(s);
  if (j === L.j) return null;
  return { cerro: cerrarJornada(L, s, j) };
}

// La cuenta de la jornada en curso, con las cifras tal como se muestran (pesos enteros). La usan hoyDe() y el cierre de las 6:00:
// por eso «hoy» en la barra y «Quedó» en el parte son el mismo número.
// La caja tiene que cerrar al peso: caja de antes + entró − salió − compras + premios + ventas = caja de ahora. Lo que el redondeo
// deja suelto (uno o dos pesos) va a «salió». Si sobra más que eso es plata que se movió por otro lado (lo acreditado al volver de
// una ausencia): queda en «otros» y se dice.
function cuenta(L, s) {
  const a = L.c, b = foto(s);
  const compras = Math.round(L.hoy.compras), premios = Math.round(L.hoy.premios), ventas = Math.round(L.hoy.ventas);
  const entro = Math.round(b.ing - a.ing), caja = Math.round(b.din), cajaAntes = Number.isFinite(a.din) ? Math.round(a.din) : null;
  let salio = Math.round(b.gas - a.gas - L.hoy.compras), otros = 0;
  if (cajaAntes != null) {
    const suelto = caja - (cajaAntes + entro - salio - compras + premios + ventas);
    if (Math.abs(suelto) <= 3) salio -= suelto; else otros = suelto;
  }
  return { entro, salio, quedo: entro - salio, compras, premios, ventas, otros, caja, cajaAntes, a, b };
}

function cerrarJornada(L, s, j) {
  sincronizar(L, s, false);
  const k = cuenta(L, s), { a, b } = k;
  const dia = {
    n: L.n, f: L.f,
    entro: k.entro, salio: k.salio,
    cartas: Math.round(b.ent - a.ent), vuelos: b.vue - a.vue, aTiempo: Math.round(b.at - a.at), tarde: Math.round(b.ta - a.ta),
    compras: k.compras, premios: k.premios, ventas: k.ventas, caja: k.caja,
    horas: Math.round((s.t - L.t) / 60),
  };
  if (k.cajaAntes != null) { dia.cajaAntes = k.cajaAntes; if (k.otros) dia.otros = k.otros; }
  L.dias.push(dia);
  if (L.dias.length > TOPE_DIAS) L.dias.splice(0, L.dias.length - TOPE_DIAS);
  for (const r of s.rutas) {
    const x = L.rutas[r.id], f = fotoRuta(r);
    // [día, entró, salió, cartas, vuelos, qué tan llenos salieron (0 a 100), aviones]
    x.d.push([L.n, f[0] - x.c[0], f[1] - x.c[1], f[3] - x.c[3], f[2] - x.c[2], Math.round((r.ocup ?? 0) * 100), s.aviones.filter((v) => v.ruta === r.id).length]);
    if (x.d.length > DIAS_RUTA) x.d.shift();
    x.c = f;
  }
  const cerrado = L.n;
  L.n++; L.j = j; L.f = inicioJornada(s); L.t = s.t; L.c = b; L.hoy = { compras: 0, premios: 0, ventas: 0 };
  return cerrado;
}

// ───────────── compras, ventas y promesas ─────────────
// Se llama justo DESPUÉS de aplicar la decisión en el modelo. est: lo que mostró la tarjeta (estimador.js), calculado ANTES.
// info: { costo (lo que salió de la caja), ruta (id), avion (id del avión comprado), ap }.
export function anotarCompra(L, s, d, est, info) {
  sincronizar(L, s, false);
  const costo = Math.round(info.costo ?? 0);          // los precios son pesos enteros (la resta de dos contadores puede dejar un pelo)
  L.hoy.compras += costo; L.cAcum += costo;
  const ruta = info.ruta ?? null;
  L.cambios.push({ t: s.t, tipo: d.tipo, ruta, ap: info.ap ?? null });
  if (L.cambios.length > 40) L.cambios.shift();
  if (d.tipo === 'ruta') return null;        // abrir una ruta no promete nada: sola no deja nada (la promesa es del avión que se le pone)
  const r = ruta && s.rutas.find((x) => x.id === ruta);
  // la foto del momento de la compra: contra esto se mide lo que pasó
  const p = {
    id: L.sig++, tipo: d.tipo, ruta, avion: info.avion ?? null, tipoAvion: info.tipoAvion ?? null, ap: info.ap ?? null,
    dia: L.n, t: s.t, costo: Math.round(costo),
    base: { ruta: r ? r.ingresos - r.costos : 0, op: opAcum(L, s) },
  };
  return est ? completarPromesa(L, s, p, est) : p;
}
// La cuenta de la tarjeta llega después de la compra (pasa si se compró antes de que terminara): la promesa se completa acá.
export function completarPromesa(L, s, p, est) {
  if (!p || !est || est.imposible || est.dejaDia == null) return null;
  Object.assign(p, {
    dejaDia: est.dejaDia, min: est.min, max: est.max, incierto: !!est.incierto, rec: est.recuperoDias,
    esp: { rutaDia: est.esp?.rutaDia ?? null, empresaDia: est.esp?.empresaDia ?? null },
    ef: est.efectos ?? {},        // lo que esta compra le cambia por día a cada ruta (para no cargarle a otra promesa lo que hizo esta)
  });
  L.promesas.push(p);
  L.promesas.sort((a, b) => a.t - b.t);
  if (L.promesas.length > 40) L.promesas.shift();
  // lo que se espera de la ruta desde esta compra (lo que la oficina compara con lo que deja)
  if (p.ruta && L.rutas[p.ruta] && p.esp.rutaDia != null) L.rutas[p.ruta].prom = { dejaDia: p.esp.rutaDia, recuperoDias: est.recuperoDias == null ? null : +est.recuperoDias.toFixed(1), dia: p.dia };
  return p;
}
export function anotarVenta(L, s, monto, ruta = null) {
  L.hoy.ventas += Math.round(monto ?? 0);
  L.cambios.push({ t: s.t, tipo: 'venta', ruta, ap: null });
  if (L.cambios.length > 40) L.cambios.shift();
  sincronizar(L, s, false);
}
export function anotarCambio(L, s, tipo, ruta = null) {
  L.cambios.push({ t: s.t, tipo, ruta, ap: null });
  if (L.cambios.length > 40) L.cambios.shift();
}

// Resultado contra lo prometido: a los 3 días de cada compra. «Lo que pasó» = lo prometido más lo que la ruta (o la empresa, si la
// compra fue agrandar el correo) hizo de más o de menos que lo que se esperaba de ella. Lo esperado es lo que dio el gemelo al
// comprar, más lo que las compras hechas después le iban a cambiar a esa misma ruta según sus propias cuentas (así una compra no
// carga con lo que hizo otra). Si después de la compra no se tocó nada, las dos cifras coinciden; si difieren, la nota dice qué
// cambió en el medio.
const TOLERANCIA = 0.3, PISO_TOL = 300;
export function revisarPromesas(L, s) {
  const nuevas = [];
  for (const p of [...L.promesas]) {
    if (s.t - p.t < DIAS_PROMESA * MIN_DIA) continue;
    L.promesas.splice(L.promesas.indexOf(p), 1);
    const dias = (s.t - p.t) / MIN_DIA;
    // las compras posteriores, con la parte de estos días en que ya estaban hechas
    const despues = L.promesas.filter((q) => q.t > p.t && q.t < s.t).map((q) => [q, (s.t - q.t) / (s.t - p.t)]);
    let paso = null;
    if (p.tipo === 'correo') {
      if (p.esp.empresaDia == null) continue;
      const otras = despues.reduce((a, [q, f]) => a + q.dejaDia * f, 0);
      paso = p.dejaDia + ((opAcum(L, s) - p.base.op) / dias - p.esp.empresaDia - otras);
    } else {
      const r = s.rutas.find((x) => x.id === p.ruta);
      if (!r || p.esp.rutaDia == null) continue;                                       // la ruta ya no existe: no hay qué comparar
      if (p.tipo === 'avion' && p.avion != null && !s.aviones.some((a) => a.id === p.avion)) continue; // el avión se vendió
      const otras = despues.reduce((a, [q, f]) => a + (q.ef?.[p.ruta] ?? 0) * f, 0);
      paso = p.dejaDia + ((r.ingresos - r.costos - p.base.ruta) / dias - p.esp.rutaDia - otras);
    }
    paso = Math.round(paso);
    const tol = Math.max(PISO_TOL, TOLERANCIA * Math.abs(p.dejaDia));
    const bajo = p.incierto ? Math.min(p.min, p.dejaDia) : p.dejaDia, alto = p.incierto ? Math.max(p.max, p.dejaDia) : p.dejaDia;
    const veredicto = paso < bajo - tol ? 'menos' : paso > alto + tol ? 'mas' : 'cumplio';
    const nota = { id: `res-${p.id}`, tipo: 'resultado', dia: L.n, que: p.tipo, ruta: p.ruta, tipoAvion: p.tipoAvion, ap: p.ap, compradoDia: p.dia,
      prometido: p.dejaDia, min: p.incierto ? p.min : null, max: p.incierto ? p.max : null, paso, veredicto, causas: veredicto === 'cumplio' ? [] : causasDe(L, s, p) };
    L.notas.push(nota);
    if (L.notas.length > TOPE_NOTAS) L.notas.shift();
    nuevas.push(nota);
  }
  return nuevas;
}
// Qué cambió entre la compra y hoy que explique la diferencia (claves de texto, la primera es la que más pesa).
function causasDe(L, s, p) {
  const out = [];
  const despues = L.cambios.filter((c) => c.t > p.t);
  const r = p.ruta && s.rutas.find((x) => x.id === p.ruta);
  const puntas = r ? [r.a, r.b] : [p.ap];
  const torm = L.tormentas.find(([n, zona]) => n >= p.dia && (p.tipo === 'correo' || zona.some((z) => puntas.includes(z))));
  if (torm) out.push({ clave: 'cz_tormenta', ciudad: torm[1].find((z) => puntas.includes(z)) ?? torm[1][0] });
  if (p.tipo === 'correo') { if (despues.length) out.push({ clave: 'cz_compras' }); }
  else {
    const mias = despues.filter((c) => c.ruta === p.ruta);
    if (mias.some((c) => c.tipo === 'avion')) out.push({ clave: 'cz_otroAvion' });
    if (mias.some((c) => c.tipo === 'faros')) out.push({ clave: 'cz_faros' });
    if (mias.some((c) => c.tipo === 'venta')) out.push({ clave: 'cz_venta' });
    if (mias.some((c) => c.tipo === 'salida')) out.push({ clave: 'cz_salida' });
    if (despues.some((c) => c.ruta !== p.ruta && ['ruta', 'avion', 'correo', 'venta', 'cierre'].includes(c.tipo))) out.push({ clave: 'cz_red' });
  }
  if (!out.length) out.push({ clave: 'cz_nose' });
  return out;
}

// ───────────── lecturas ─────────────
// Promedio por día de una ruta en sus últimos 3 días cerrados; si todavía no cerró ninguno, lo que va de la jornada llevado a un día.
export function ritmoRuta(L, s, r) {
  const x = L.rutas[r.id];
  if (!x) return { entroDia: 0, salioDia: 0, dejaDia: 0, cartasDia: 0, llenado: r.ocup ?? 0, dias: 0 };
  const ult = x.d.filter((d) => d[0] >= L.n - DIAS_PROMESA && d[0] >= (x.ab ?? 0));
  if (ult.length) {
    const k = ult.length, sum = (i) => ult.reduce((a, d) => a + d[i], 0);
    const vue = sum(4);
    return { entroDia: Math.round(sum(1) / k), salioDia: Math.round(sum(2) / k), dejaDia: Math.round((sum(1) - sum(2)) / k), cartasDia: Math.round(sum(3) / k),
      llenado: +(vue ? ult.reduce((a, d) => a + d[5] * d[4], 0) / vue / 100 : (r.ocup ?? 0)).toFixed(2), dias: k };
  }
  const f = fotoRuta(r), horas = Math.max(0, (s.t - L.t) / 60), esc = horas >= 3 ? 24 / horas : 1;
  return { entroDia: Math.round((f[0] - x.c[0]) * esc), salioDia: Math.round((f[1] - x.c[1]) * esc), dejaDia: Math.round((f[0] - x.c[0] - f[1] + x.c[1]) * esc),
    cartasDia: Math.round((f[3] - x.c[3]) * esc), llenado: +(r.ocup ?? 0).toFixed(2), dias: 0 };
}
// «Hoy»: lo que va de la jornada en curso, desde el último parte de la mañana (las 6:00). ESTA es la única cuenta de «hoy» del
// juego: la usan la barra del mapa, el libro de la oficina y el puente. quedo = entró − salió por operar (volar y estar en tierra);
// las compras, los premios y las ventas van aparte.
export function hoyDe(L, s) {
  const k = cuenta(L, s), { a, b } = k;
  return { entro: k.entro, salio: k.salio, quedo: k.quedo, cartas: Math.round(b.ent - a.ent), vuelos: b.vue - a.vue,
    aTiempo: Math.round(b.at - a.at), tarde: Math.round(b.ta - a.ta), compras: k.compras, premios: k.premios, ventas: k.ventas };
}
// El cierre de caja de un día cerrado, con las cifras tal como se muestran: antes + quedo − compras + premios + ventas + otros = caja
// (exacto, peso por peso). null si el día es de un guardado de antes, que no anotaba la caja del día anterior.
export function cierreCaja(dia) {
  if (!dia || !Number.isFinite(dia.cajaAntes)) return null;
  const c = { antes: dia.cajaAntes, quedo: dia.entro - dia.salio, compras: dia.compras ?? 0, premios: dia.premios ?? 0, ventas: dia.ventas ?? 0, otros: dia.otros ?? 0, caja: dia.caja };
  c.cierra = c.antes + c.quedo - c.compras + c.premios + c.ventas + c.otros === c.caja;
  return c;
}

// El parte de la mañana del día n (el último cerrado si no se dice): números, mejor y peor ruta y un consejo que sale de los datos.
export function parte(L, s, n = null) {
  const dia = n == null ? L.dias[L.dias.length - 1] : L.dias.find((d) => d.n === n);
  if (!dia) return null;
  const filas = [];
  for (const r of s.rutas) {
    const d = L.rutas[r.id]?.d.find((x) => x[0] === dia.n);
    if (!d) continue;
    filas.push({ id: r.id, a: r.a, b: r.b, entro: d[1], salio: d[2], deja: d[1] - d[2], cartas: d[3], vuelos: d[4], llenado: d[5] / 100, aviones: d[6], luces: !!r.balizas, minCarga: r.minCarga ?? 0.6 });
  }
  const conAvion = filas.filter((f) => f.aviones > 0);
  const orden = [...conAvion].sort((x, y) => y.deja - x.deja);
  const mejor = orden[0] ?? null, peor = orden.length >= 2 ? orden[orden.length - 1] : null;
  return { dia, quedo: dia.entro - dia.salio, cierre: cierreCaja(dia), mejor, peor, consejo: consejoDe(L, s, dia, filas), rutas: filas };
}
// Un consejo por mañana, el primero que aplique. Cada uno mira un dato de ayer; ninguno es una frase fija.
function consejoDe(L, s, dia, filas) {
  const conAvion = filas.filter((f) => f.aviones > 0);
  const sinAvion = filas.find((f) => f.aviones === 0);
  if (sinAvion) return { clave: 'cj_sinAvion', ruta: sinAvion.id };
  const pierde = [...conAvion].filter((f) => f.deja < -100 && f.vuelos > 0).sort((x, y) => x.deja - y.deja)[0];
  if (pierde) {
    if (pierde.llenado < 0.45 && pierde.aviones >= 2) return { clave: 'cj_sobraAvion', ruta: pierde.id, pct: Math.round(pierde.llenado * 100), monto: -pierde.deja };
    if (pierde.llenado < 0.45 && pierde.minCarga < 0.6) return { clave: 'cj_saleVacio', ruta: pierde.id, pct: Math.round(pierde.llenado * 100), monto: -pierde.deja };
    return { clave: 'cj_pierde', ruta: pierde.id, monto: -pierde.deja };
  }
  // aviones que durmieron: rutas con avión y sin luces, con aviones que no vuelan de noche (solo cuando la época lo exige)
  if (s.cap === 1 && s.flags?.primeraNoche) {
    const dormidas = conAvion.filter((f) => !f.luces && s.aviones.some((a) => a.ruta === f.id && !M.AV[a.tipo].nocturno)).sort((x, y) => y.deja - x.deja);
    if (dormidas.length) return { clave: 'cj_duermen', ruta: dormidas[0].id, n: s.aviones.filter((a) => !M.AV[a.tipo].nocturno && dormidas.some((f) => f.id === a.ruta)).length, costo: M.costoBalizas(s.rutas.find((r) => r.id === dormidas[0].id), s) };
  }
  const total = dia.aTiempo + dia.tarde;
  if (total >= 20 && dia.tarde / total >= 0.2) {
    const cola = M.enTransbordo(s, M.HUB) / M.capacidadTransbordo(s, M.HUB);
    return cola >= 1 && M.costoTransbordo(s, M.HUB) != null ? { clave: 'cj_tardeCola', de: Math.round(total / dia.tarde) } : { clave: 'cj_tarde', de: Math.round(total / dia.tarde) };
  }
  const llena = [...conAvion].filter((f) => f.llenado >= 0.9 && f.vuelos >= 3).sort((x, y) => y.deja - x.deja)[0];
  if (llena) return { clave: 'cj_llena', ruta: llena.id, pct: Math.round(llena.llenado * 100) };
  if (!conAvion.length) return { clave: 'cj_empezar' };
  return dia.entro - dia.salio > 0 ? { clave: 'cj_bien', n: conAvion.length } : { clave: 'cj_flojo' };
}

// ───────────── el contrato de datos de la oficina ─────────────
// ui: { t(clave, vars), plata(n), numero(n), fecha(ms) → texto, hora(ms) → texto }  ·  empresa: { nombre, color }
// camino(o, d) → { ok, texto } (opcional): si un encargo ya se puede cumplir.
export function datosOficina(L, s, { ui, empresa, caja = null, camino = null }) {
  const { t, plata, numero, fecha, hora } = ui;
  const nomAp = (id) => M.AP[id]?.nombre ?? id;
  const nomRuta = (r) => `${nomAp(r.a)} – ${nomAp(r.b)}`;
  const ahora = s.t0 + s.t * 60000;
  const c0 = CAPITULOS[0].inicio;
  const rutas = s.rutas.map((r) => {
    const x = L.rutas[r.id] ?? {}, k = ritmoRuta(L, s, r);
    return { id: r.id, nombre: nomRuta(r), km: Math.round(r.km), abiertaDia: x.ab ?? 1, luces: M.iluminada(s, r), aviones: s.aviones.filter((a) => a.ruta === r.id).length,
      entroDia: k.entroDia, salioDia: k.salioDia, dejaDia: k.dejaDia, cartasDia: k.cartasDia, llenado: k.llenado,
      prometido: x.prom ? { dejaDia: x.prom.dejaDia, recuperoDias: x.prom.recuperoDias } : null };
  });
  const orden = {};
  const flota = s.aviones.map((av) => {
    const x = L.flota[av.id] ?? { cd: null, e: 0, k: 0, w: 0 }, tp = M.AV[av.tipo];
    const n = (orden[av.tipo] = (orden[av.tipo] ?? 0) + 1);
    const entro = Math.max(x.e, netoAvion(av), 0), salio = Math.max(0, entro - netoAvion(av));
    return { id: av.id, nombre: `${tp.nombre} ${n}`, tipo: av.tipo, ruta: av.ruta, compradoDia: x.cd ?? 1, viajes: av.v ?? 0, cartas: Math.round(x.k),
      entro: Math.round(entro), salio: Math.round(salio), llenado: +(x.w ? Math.min(1, x.k / x.w) : 0).toFixed(2),
      estado: av.fase === 'vuelo' ? 'volando' : av.espera === 'noche' ? 'durmiendo' : 'en tierra' };
  });
  const dias = L.dias.map((d) => ({ n: d.n, fecha: fecha(d.f), entro: d.entro, salio: d.salio, cartas: d.cartas, vuelos: d.vuelos, aTiempo: d.aTiempo, tarde: d.tarde,
    compras: d.compras, premios: d.premios, ventas: d.ventas ?? 0, caja: d.caja, ...(Number.isFinite(d.cajaAntes) ? { cajaAntes: d.cajaAntes } : {}) }));
  const leido = (id) => L.leidos.includes(id);
  const bandeja = [];
  // encargos: los ofrecidos (con «Aceptar») y los aceptados (con su avance)
  const u = (c, n) => (c === 'correo' ? t(n === 1 ? 'carta' : 'cartas') : t(`u_${c}`));
  const plazo = (min) => { const h = Math.max(1, Math.round(min / 60)); return h >= 48 ? `${Math.round(h / 24)} d` : `${h} h`; };
  for (const c of s.contratos.tablero) {
    const cam = camino?.(c.o, c.d);
    bandeja.push({ id: `enc-${c.id}`, tipo: 'encargo', titulo: t('encargo'),
      texto: `${t('encargoTxt', { n: numero(c.n), u: u(c.c, c.n), a: nomAp(c.o), b: nomAp(c.d) })}. ${t('ban_plazo', { t: plazo(c.dias * MIN_DIA), monto: plata(c.premio) })}${cam ? ` ${cam.texto}` : ''}`,
      dia: L.n, leido: leido(`enc-${c.id}`), acciones: s.contratos.activos.length < M.CONTRATO.maxActivos ? [{ id: 'aceptar', texto: t('aceptar') }] : [] });
  }
  for (const c of s.contratos.activos) {
    bandeja.push({ id: `enc-${c.id}`, tipo: 'encargo', titulo: t('ban_encargoEnCurso'),
      texto: `${t('encargoTxt', { n: numero(c.n), u: u(c.c, c.n), a: nomAp(c.o), b: nomAp(c.d) })}. ${t('ban_avance', { n: numero(c.hechas), m: numero(c.n), t: plazo(Math.max(0, c.vence - s.t)), monto: plata(c.premio) })}`,
      dia: L.n, leido: leido(`enc-${c.id}`), acciones: [] });
  }
  for (const nota of L.notas) bandeja.push({ ...textoResultado(nota, s, ui), id: nota.id, tipo: 'resultado', dia: nota.dia, leido: leido(nota.id),
    acciones: nota.ruta && s.rutas.some((r) => r.id === nota.ruta) ? [{ id: 'ver', texto: t('ban_verRuta') }] : [] });
  for (const d of L.dias.slice(-3)) {
    bandeja.push({ id: `parte-${d.n}`, tipo: 'nota', titulo: t('parte_t', { n: d.n }),
      texto: t('ban_parte', { entro: plata(d.entro), salio: plata(d.salio), quedo: plata(d.entro - d.salio) }), dia: d.n + 1, leido: leido(`parte-${d.n}`), acciones: [] });
  }
  const peso = { resultado: 0, encargo: 1, nota: 2, propuesta: 0 };
  bandeja.sort((x, y) => y.dia - x.dia || peso[x.tipo] - peso[y.tipo]);
  return {
    // estrenada (si el juego lo dice): el jugador ya eligió nombre y color; la oficina lo pide la primera vez que se entra
    empresa: { nombre: empresa.nombre, color: empresa.color, fundada: fecha(Date.UTC(c0.a, c0.m - 1, c0.d)), ...(empresa.estrenada != null ? { estrenada: !!empresa.estrenada } : {}) },
    hoy: { dia: L.n, fecha: fecha(ahora), hora: hora(ahora), caja: Math.round(caja ?? s.dinero), epoca: M.capitulo(s).inicio.a, ...hoyDe(L, s) },
    dias, rutas, flota, bandeja,
    cuaderno: [],        // etapa 2
    carrera: null,       // etapa 2
  };
}

// El texto de una nota «resultado contra lo prometido»: qué se compró, lo prometido, lo que pasó y, si difiere, por qué.
export function textoResultado(nota, s, ui) {
  const { t, plata } = ui;
  const nomAp = (id) => M.AP[id]?.nombre ?? id;
  const r = nota.ruta ? s.rutas.find((x) => x.id === nota.ruta) : null;
  const [a, b] = nota.ruta ? nota.ruta.split('-') : [];
  const nombreRuta = nota.ruta ? (a === M.HUB || b === M.HUB ? t('rutaA', { ciudad: nomAp(a === M.HUB ? b : a) }) : `${nomAp(r?.a ?? a)} – ${nomAp(r?.b ?? b)}`) : '';
  const que = nota.que === 'avion' ? t('res_avion', { avion: M.AV[nota.tipoAvion]?.nombre ?? '', ruta: nombreRuta })
    : nota.que === 'ruta' ? t('res_ruta', { ruta: nombreRuta }) : nota.que === 'faros' ? t('res_faros', { ruta: nombreRuta }) : t('res_correo', { ciudad: nomAp(nota.ap) });
  const prom = nota.min != null ? t('entre', { a: plata(nota.min), b: plata(nota.max) }) : plata(nota.prometido);
  const causa = nota.causas?.[0];
  const porque = causa ? t(causa.clave, { ciudad: causa.ciudad ? nomAp(causa.ciudad) : '' }) : '';
  const veredicto = t(`res_${nota.veredicto}`);
  return { titulo: que, prometido: prom, paso: plata(nota.paso), veredicto, porque,
    texto: `${t('res_linea', { prometido: prom, paso: plata(nota.paso) })} ${veredicto}${porque ? ` ${porque}` : ''}` };
}

// Lo que hace falta de verdad para cumplir un encargo: en el modelo sus cartas salen solo si hay un camino de rutas con avión entre
// las dos ciudades. Si lo hay, dice por dónde pasan; si no, qué ruta o qué avión falta.
export function caminoEncargo(s, o, d, t) {
  const R = M.red(s), nombre = (id) => M.AP[id].nombre;
  if (R.sig[o]?.[d]) {
    const escalas = [];
    for (let a = R.sig[o][d], i = 0; a && a !== d && i < 8; a = R.sig[a]?.[d], i++) escalas.push(a);
    if (!escalas.length) return { ok: true, texto: t('enc_directo') };
    if (escalas.length === 1 && escalas[0] === M.HUB) return { ok: true, texto: t('enc_base') };
    return { ok: true, texto: t('enc_escala', { ciudad: escalas.map(nombre).join(', ') }) };
  }
  // falta una punta: la ciudad a la que todavía no llega ningún avión (primero el destino)
  for (const c of [d, o]) {
    if (R.adj[c]) continue;
    const sinAvion = s.rutas.some((r) => (r.a === c || r.b === c) && !s.aviones.some((a) => a.ruta === r.id));
    return { ok: false, texto: t(sinAvion ? 'enc_faltaAvion' : 'enc_faltaRuta', { ciudad: nombre(c) }) };
  }
  return { ok: false, texto: t('enc_faltaUnir', { a: nombre(o), b: nombre(d) }) };
}

export function marcarLeido(L, id) {
  if (!L.leidos.includes(id)) { L.leidos.push(id); if (L.leidos.length > 80) L.leidos.shift(); }
}
