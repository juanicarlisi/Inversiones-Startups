// Las hojas de la oficina: lo que se abre al tocar cada objeto. Cada función recibe los datos del contrato y devuelve HTML.
// No tocan el DOM (se prueban sin navegador). Regla: lo esencial primero, de un vistazo; nada de tablas largas.
import { COLORES_EMPRESA, COLOR_DEFECTO } from './textos.js';

export const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Íconos propios de la oficina (trazo redondo, 24 × 24).
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;
export const ICO = {
  mapa: svg('<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13M15 6.5v13"/>'),
  libro: svg('<path d="M12 6c-2-1.6-5-2-8-1.5v13c3-.5 6-.1 8 1.5 2-1.6 5-2 8-1.5v-13c-3-.5-6-.1-8 1.5z"/><path d="M12 6v13"/>'),
  flota: svg('<path d="M3 13.5 21 8l-2.5 5.5L21 19 3 13.5z" transform="rotate(-18 12 12)"/><path d="M10 12.5 8 19" transform="rotate(-18 12 12)"/>'),
  bandeja: svg('<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6H3v-6z"/>'),
  cuaderno: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12.5 8h3.5M12.5 12h3.5"/>'),
  placa: svg('<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h10"/><circle cx="5.6" cy="9.6" r=".4"/><circle cx="18.4" cy="9.6" r=".4"/><circle cx="5.6" cy="14.4" r=".4"/><circle cx="18.4" cy="14.4" r=".4"/>'),
  avion: svg('<path d="M21 4 3 11l7 2.5L12.5 21z"/><path d="m10 13.5 5-4.5"/>'),
  cartas: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="m3.5 7.5 8.5 6 8.5-6"/>'),
  luz: svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
  luna: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  ir: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  volver: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  si: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  reloj: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  pausa: svg('<path d="M9 6v12M15 6v12"/>'),
  moneda: svg('<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.7.8 2.7 2-1.2 2-2.7 2c-1.2 0-2.2-.5-2.7-1.3M12 6.5V8m0 8v1.5"/>'),
  encargo: svg('<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><circle cx="12" cy="14" r="2.5"/>'),
  resultado: svg('<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>'),
  nota: svg('<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M9 9h6M9 13h3"/>'),
  propuesta: svg('<path d="M3 12 8 7l4 3 4-3 5 5-5 5-4-3-4 3z"/>'),
};
export const ico = (n, clase = '') => `<i class="o-ico ${clase}">${ICO[n] ?? ''}</i>`;

const cab = (id, F, sub) => `<header class="h-cab">${ico(id, 'grande')}<div class="h-tit"><small>${esc(F.t(`o_${id}`))}</small><h2>${sub}</h2></div><button class="h-x" data-of="cerrar" aria-label="${esc(F.t('volverOficina'))}">${ico('x')}</button></header>`;
const vacio = (F, clave, dibujo = '') => `<div class="h-vacio">${dibujo}<p>${esc(F.t(clave))}</p></div>`;   // el título ya está en la cabecera
const medidor = (rotulo, valor, texto, tono = '') => `<div class="medidor ${tono}"><span>${rotulo}</span><div class="m-barra"><i style="width:${Math.round(Math.max(0, Math.min(1, valor)) * 100)}%"></i></div><b>${texto}</b></div>`;
const tonoLleno = (x) => (x >= 0.6 ? 'bien' : x >= 0.4 ? 'medio' : 'mal');

// Cómo va lo prometido contra lo real en una ruta.
export function veredicto(r, hoyDia) {
  if (!r.prometido) return { tipo: 'sin' };
  const pasaron = (hoyDia ?? 0) - (r.abiertaDia ?? 0);
  if (pasaron < 3) return { tipo: 'nueva', faltan: Math.max(1, 3 - pasaron) };
  const p = r.prometido.dejaDia, k = p > 0 ? r.dejaDia / p : (r.dejaDia >= p ? 1 : 0);
  return { tipo: k >= 1.08 ? 'mas' : k >= 0.9 ? 'cumple' : 'menos' };
}

// ── Tu red ──
export function hojaMapa(d, F) {
  const rutas = [...(d.rutas ?? [])].sort((a, b) => b.dejaDia - a.dejaDia), n = rutas.length;
  if (!n) return `${cab('mapa', F, esc(F.t('redVacia_t')))}<div class="h-cuerpo">${vacio(F, 'redVacia')}</div>`;
  const total = rutas.reduce((a, r) => a + r.dejaDia, 0);
  const tarjetas = rutas.map((r, i) => {
    const v = veredicto(r, d.hoy?.dia), pierde = r.dejaDia < 0;
    const sello = n > 1 && i === 0 ? `<span class="sello oro">${esc(F.t('laMejor'))}</span>` : n > 2 && i === n - 1 ? `<span class="sello gris">${esc(F.t('laPeor'))}</span>` : '';
    let promesa = '';
    if (v.tipo === 'sin') promesa = `<p class="promesa neutra">${esc(F.t('sinPromesa', { n: r.abiertaDia }))}</p>`;
    else if (v.tipo === 'nueva') promesa = `<p class="promesa neutra">${ico('reloj')}${esc(v.faltan === 1 ? F.t('rutaNueva1') : F.t('rutaNueva', { n: v.faltan }))}</p>`;
    else {
      const max = Math.max(1, r.prometido.dejaDia, r.dejaDia), bien = v.tipo !== 'menos';
      promesa = `<div class="promesa ${bien ? 'bien' : 'mal'}">
        <div class="p-fila"><span>${esc(F.t('prometio'))}</span><div class="p-barra"><i style="width:${Math.max(3, r.prometido.dejaDia / max * 100).toFixed(0)}%"></i></div><b>${F.plata(r.prometido.dejaDia)}</b></div>
        <div class="p-fila real"><span>${esc(F.t('deja'))}</span><div class="p-barra"><i style="width:${Math.max(3, Math.max(0, r.dejaDia) / max * 100).toFixed(0)}%"></i></div><b>${F.plata(r.dejaDia)}</b></div>
        <em>${ico(bien ? 'si' : 'reloj')}${esc(F.t(v.tipo === 'mas' ? 'cumpleMas' : v.tipo === 'cumple' ? 'cumple' : 'cumpleMenos'))}</em></div>`;
    }
    return `<section class="tarjeta ruta" data-ruta="${esc(r.id)}">
      <div class="t-cab"><h3>${esc(r.nombre)}</h3>${sello}</div>
      <div class="t-num ${pierde ? 'mal' : 'bien'}"><b>${F.plata(Math.abs(r.dejaDia))}</b><small>${esc(F.t(pierde ? 'pierdeDia' : 'dejaDia'))}</small></div>
      ${medidor(esc(F.t('llenado')), r.llenado, esc(F.t('lleno', { pct: F.pct(r.llenado) })), tonoLleno(r.llenado))}
      <ul class="chips"><li>${ico('avion')}${esc(r.aviones === 1 ? F.t('avion1') : r.aviones ? F.t('avionesN', { n: r.aviones }) : F.t('sinAvion'))}</li><li>${ico('cartas')}${esc(F.t('cartasDia', { n: F.numero(r.cartasDia) }))}</li><li class="${r.luces ? 'luz' : 'sinluz'}">${ico(r.luces ? 'luz' : 'luna')}${esc(F.t(r.luces ? 'conLuces' : 'sinLuces'))}</li></ul>
      ${promesa}
      <div class="t-pie"><button class="b-ver" data-of="ir" data-a="ruta" data-id="${esc(r.id)}">${esc(F.t('verRuta'))}${ico('ir')}</button></div>
    </section>`;
  }).join('');
  return `${cab('mapa', F, esc(n === 1 ? F.t('redResumen1') : F.t('redResumenN', { n })))}
    <p class="h-lema ${total < 0 ? 'mal' : ''}">${F.t(total < 0 ? 'redPierde' : 'redDeja', { monto: F.plata(Math.abs(total)) })}</p>
    <div class="h-cuerpo">${tarjetas}</div>`;
}

// ── Las cuentas ──
// «A tiempo» y «tarde» cuentan lo que mande el juego: si suman como las cartas, son cartas; si suman como los vuelos, vuelos.
const cuentaCartas = (x) => Math.abs((x.aTiempo ?? 0) + (x.tarde ?? 0) - (x.cartas ?? 0)) <= Math.abs((x.aTiempo ?? 0) + (x.tarde ?? 0) - (x.vuelos ?? 0));
export function filaDia(x, F) {
  const q = x.entro - x.salio, porCartas = cuentaCartas(x);
  const puntual = `${F.numero(x.aTiempo)} ${esc(F.t('aTiempo'))}${x.tarde ? ` · <b class="mal">${F.numero(x.tarde)} ${esc(F.t('tarde'))}</b>` : ''}`;
  // las compras, los premios y las ventas van aparte: no son parte de lo que entró ni de lo que salió por volar
  const aparte = [x.compras ? F.t('apCompraste', { monto: F.plata(x.compras) }) : '', x.premios ? F.t('apPremios', { monto: F.plata(x.premios) }) : '', x.ventas ? F.t('apVendiste', { monto: F.plata(x.ventas) }) : ''].filter(Boolean);
  return `<div class="tres"><div><small>${esc(F.t('entro'))}</small><b>${F.plata(x.entro)}</b></div><div><small>${esc(F.t('salio'))}</small><b>${F.plata(x.salio)}</b></div><div class="${q < 0 ? 'mal' : 'bien'}"><small>${esc(F.t('quedo'))}</small><b>${F.plataSigno(q)}</b></div></div>
    ${aparte.length ? `<p class="d-aparte"><b>${esc(F.t('aparte'))}</b> ${esc(aparte.join(' · '))}</p>` : ''}
    <p class="d-pie">${porCartas ? `<span>${ico('cartas')}${F.numero(x.cartas)} ${esc(F.t('cartas').toLowerCase())}: ${puntual}</span><span>${ico('avion')}${F.numero(x.vuelos)} ${esc(F.t('vuelos').toLowerCase())}</span>`
    : `<span>${ico('cartas')}${F.numero(x.cartas)} ${esc(F.t('cartas').toLowerCase())}</span><span>${ico('avion')}${puntual}</span>`}</p>`;
}
// Los días que muestra el libro: los cerrados y, si el juego lo manda, lo que va de hoy.
export function diasDelLibro(d, F) {
  const dias = (d.dias ?? []).slice(-13).map((x) => ({ ...x }));
  const h = d.hoy ?? {};
  if (h.entro != null && h.salio != null && !dias.some((x) => x.n === h.dia)) dias.push({ n: h.dia, fecha: h.fecha, entro: h.entro, salio: h.salio, cartas: h.cartas ?? 0, vuelos: h.vuelos ?? 0, aTiempo: h.aTiempo ?? 0, tarde: h.tarde ?? 0, compras: h.compras ?? 0, premios: h.premios ?? 0, ventas: h.ventas ?? 0, hoy: true });
  return dias;
}
export function hojaLibro(d, F, elegido = null) {
  const dias = diasDelLibro(d, F), caja = d.hoy?.caja ?? 0;
  const cabecera = cab('libro', F, `<span class="h-chico">${esc(F.t('enCaja'))}</span> ${F.plata(caja)}`);
  if (!dias.length) return `${cabecera}<div class="h-cuerpo">${vacio(F, 'libroVacio')}</div>`;
  const cerrados = dias.filter((x) => !x.hoy), base0 = cerrados.length ? cerrados : dias;
  const sel = dias.find((x) => x.n === elegido) ?? base0[base0.length - 1];
  const q = dias.map((x) => x.entro - x.salio), arriba = Math.max(1, ...q), abajo = Math.max(0, ...q.map((v) => -v)), rango = arriba + abajo;
  const base = abajo / rango;
  const barras = dias.map((x, i) => {
    const v = q[i], h = Math.max(0.025, Math.abs(v) / rango);
    return `<button class="bar ${v < 0 ? 'neg' : 'pos'}${x.hoy ? ' hoy' : ''}${x.n === sel.n ? ' sel' : ''}" data-of="dia" data-n="${x.n}" style="--h:${h.toFixed(3)}" aria-label="${esc(x.hoy ? F.t('hoyVa') : F.t('diaN', { n: x.n }))}: ${esc(F.plataSigno(v))}"><i></i><span>${x.hoy ? esc(F.t('hoyCorto')) : x.n}</span></button>`;
  }).join('');
  const qc = base0.map((x) => x.entro - x.salio), total = qc.reduce((a, v) => a + v, 0), cartas = base0.reduce((a, x) => a + x.cartas, 0), aT = base0.reduce((a, x) => a + x.aTiempo, 0), ta = base0.reduce((a, x) => a + x.tarde, 0), vuelos = base0.reduce((a, x) => a + (x.vuelos ?? 0), 0);
  const parte = aT + ta ? aT / (aT + ta) : 1, porCartas = cuentaCartas(base0[base0.length - 1]);
  const puntual = ta === 0 ? F.t('todasATiempo') : parte >= 0.95 ? F.t('casiTodas') : F.t('deCada10', { n: Math.max(0, Math.min(9, Math.round(parte * 10))) });
  return `${cabecera}
    <p class="h-lema ${total < 0 ? 'mal' : ''}">${esc(cerrados.length ? F.t(total < 0 ? 'perdioTotal' : 'quedoTotal', { dias: F.dias(base0.length).replace(/^(en|in) /, '') }) : F.t(total < 0 ? 'perdioHoy' : 'quedoHoy'))} <b>${F.plata(Math.abs(total))}</b></p>
    <div class="h-cuerpo">
      <section class="tarjeta dia"><div class="t-cab"><h3 id="of-dia-t">${esc(sel.hoy ? F.t('hoyVa') : F.t('diaN', { n: sel.n }))}</h3><span class="d-fecha">${esc(sel.fecha ?? '')}</span></div><div id="of-dia">${filaDia(sel, F)}</div></section>
      <section class="tarjeta grafico"><div class="t-cab"><h3>${esc(F.t('ultimos'))}</h3></div>
        <div class="barras" style="--base:${base.toFixed(3)}">${barras}</div><p class="h-ayuda">${esc(F.t('graficoAyuda'))}</p></section>
      <div class="dos">
        <section class="tarjeta dato">${ico('cartas', 'grande')}<small>${esc(F.t('cartasLlevadas'))}</small><b>${F.numero(cartas)}</b><em>${esc(F.dias(base0.length))}</em></section>
        <section class="tarjeta dato">${ico(porCartas ? 'reloj' : 'avion', 'grande')}<small>${esc(F.t(porCartas ? 'cartasATiempo' : 'vuelos'))}</small><b>${F.numero(aT)}${porCartas ? '' : ` <span>${esc(F.t('aTiempo'))}</span>`}</b><em>${ta ? `<span class="mal">${F.numero(ta)} ${esc(F.t('tarde'))}</span> · ` : ''}${esc(puntual)}</em></section>
      </div>
    </div>`;
}

// ── Tus aviones ──
export function hojaFlota(d, F, retratos = {}) {
  const flota = d.flota ?? [], n = flota.length;
  if (!n) return `${cab('flota', F, esc(F.t('flotaVacia_t')))}<div class="h-cuerpo">${vacio(F, 'flotaVacia')}</div>`;
  const rutas = Object.fromEntries((d.rutas ?? []).map((r) => [r.id, r.nombre]));
  const clase = { volando: 'volando', 'en tierra': 'tierra', durmiendo: 'durmiendo' };
  const cuenta = { volando: 0, tierra: 0, durmiendo: 0 };
  for (const a of flota) cuenta[clase[a.estado] ?? 'tierra']++;
  const tarjetas = flota.map((a) => {
    const gano = (a.entro ?? 0) - (a.salio ?? 0), e = clase[a.estado] ?? 'tierra';
    return `<section class="tarjeta avion">
      <div class="a-foto">${retratos[a.tipo] ? `<img src="${retratos[a.tipo]}" alt="">` : ico('avion', 'grande')}</div>
      <div class="a-info">
        <div class="t-cab"><h3>${esc(a.nombre)}</h3><span class="estado ${e}"><i></i>${esc(F.t(`e_${e}`))}</span></div>
        <p class="a-ruta">${ico('mapa')}${esc(rutas[a.ruta] ?? a.ruta ?? F.t('sinRuta'))}</p>
        ${medidor('', a.llenado, esc(F.t('saleLleno', { pct: F.pct(a.llenado) })), tonoLleno(a.llenado))}
      </div>
      <div class="tres chico"><div><small>${esc(F.t('viajes'))}</small><b>${F.numero(a.viajes)}</b></div><div><small>${esc(F.t('cartasAvion'))}</small><b>${F.numero(a.cartas)}</b></div><div class="${gano < 0 ? 'mal' : 'bien'}"><small>${esc(F.t(gano < 0 ? 'perdio' : 'gano'))}</small><b>${F.plata(Math.abs(gano))}</b></div></div>
      <div class="t-pie"><button class="b-ver" data-of="ir" data-a="avion" data-id="${esc(a.id)}">${esc(F.t('verAvion'))}${ico('ir')}</button></div>
    </section>`;
  }).join('');
  const resumen = ['volando', 'tierra', 'durmiendo'].filter((k) => cuenta[k]).map((k) => `<span class="estado ${k}"><i></i>${cuenta[k]} ${esc(F.t(`e_${k}`).toLowerCase())}</span>`).join('');
  return `${cab('flota', F, esc(n === 1 ? F.t('flota1') : F.t('flotaN', { n })))}<p class="h-lema fila">${resumen}</p><div class="h-cuerpo">${tarjetas}</div>`;
}

// ── Bandeja ──
export const NOTAS_A_LA_VISTA = 10;
export function hojaBandeja(d, F, todas = false) {
  const notas = [...(d.bandeja ?? [])].sort((a, b) => (a.leido - b.leido) || (b.dia - a.dia)), sin = notas.filter((x) => !x.leido).length;
  if (!notas.length) return `${cab('bandeja', F, esc(F.t('bandejaVacia_t')))}<div class="h-cuerpo">${vacio(F, 'bandejaVacia')}</div>`;
  const tipos = ['encargo', 'resultado', 'nota', 'propuesta'];
  const visibles = todas ? notas : notas.slice(0, Math.max(NOTAS_A_LA_VISTA, Math.min(sin, NOTAS_A_LA_VISTA)));
  const lista = visibles.map((x) => {
    const tipo = tipos.includes(x.tipo) ? x.tipo : 'nota', acc = (x.acciones ?? []);
    // un resultado puede traer sus dos números aparte (lo prometido y lo que pasó): se muestran lado a lado
    const cuerpo = x.prometido != null && x.paso != null
      ? `<div class="n-dos"><div><small>${esc(F.t('notaPrometido'))}</small><b>${esc(x.prometido)}</b></div><div><small>${esc(F.t('notaPaso'))}</small><b>${esc(x.paso)}</b></div></div>${x.veredicto || x.porque ? `<p><b>${esc(x.veredicto ?? '')}</b> ${esc(x.porque ?? '')}</p>` : ''}`
      : `<p>${esc(x.texto)}</p>`;
    return `<section class="tarjeta nota tipo-${tipo}${x.leido ? ' leida' : ''}" data-nota="${esc(x.id)}">
      <div class="n-cab"><span class="n-tipo">${ico(tipo)}${esc(F.t(`tipo_${tipo}`))}</span><span class="n-dia">${esc(F.t('diaN', { n: x.dia }))}</span></div>
      <h3>${esc(x.titulo)}</h3>${cuerpo}
      <div class="n-acc">${acc.map((a, i) => `<button class="${i ? 'b-sec' : 'b-pri'}" data-of="bandeja" data-id="${esc(x.id)}" data-accion="${esc(a.id)}">${esc(a.texto)}</button>`).join('')}${x.leido ? `<span class="n-leida">${ico('si')}${esc(F.t('leido'))}</span>` : `<button class="b-leer" data-of="leido" data-id="${esc(x.id)}">${ico('si')}${esc(F.t('yaLei'))}</button>`}</div>
    </section>`;
  }).join('');
  const resto = notas.length - visibles.length;
  return `${cab('bandeja', F, esc(sin === 0 ? F.t('todoLeido') : sin === 1 ? F.t('sinLeer1') : F.t('sinLeerN', { n: sin })))}
    ${sin > 1 ? `<p class="h-lema"><button class="b-linea" data-of="leerTodo">${ico('si')}${esc(F.t('leerTodo'))}</button></p>` : ''}
    <div class="h-cuerpo">${lista}${resto > 0 ? `<button class="b-sec mas" data-of="masNotas">${esc(F.t('masViejas', { n: resto }))}</button>` : ''}</div>`;
}

// ── Cuaderno ──
export function hojaCuaderno(d, F) {
  const c = d.cuaderno ?? [];
  if (!c.length) return `${cab('cuaderno', F, esc(F.t('cuadernoNuevo_t')))}<div class="h-cuerpo">${vacio(F, 'cuadernoNuevo', '<div class="renglones" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>')}</div>`;
  const lista = c.map((x) => `<section class="tarjeta apunte ${x.estado ? `est-${esc(x.estado)}` : ''}"><div class="t-cab"><h3>${esc(x.nombre)}</h3>${x.estado ? `<span class="sello ${x.estado === 'dominado' ? 'oro' : 'gris'}">${esc(F.t(`est_${x.estado}`))}</span>` : ''}</div><p>${esc(x.frase)}</p></section>`).join('');
  return `${cab('cuaderno', F, esc(c.length === 1 ? F.t('aprendido1') : F.t('aprendidoN', { n: c.length })))}<div class="h-cuerpo">${lista}</div>`;
}

// ── Tu empresa ──
export function muestras(F, elegido) {
  const actual = (elegido || COLOR_DEFECTO).toLowerCase();
  return `<div class="muestras" role="radiogroup" aria-label="${esc(F.t('color'))}">${COLORES_EMPRESA.map(([k, c]) => `<button type="button" class="muestra${c === actual ? ' sel' : ''}" role="radio" aria-checked="${c === actual}" data-of="color" data-color="${c}" style="--c:${c}" title="${esc(F.t(k))}" aria-label="${esc(F.t(k))}"></button>`).join('')}</div>`;
}
export function hojaPlaca(d, F) {
  const e = d.empresa ?? {}, k = d.carrera;
  return `${cab('placa', F, esc(e.nombre || F.t('nombreDefecto')))}
    <div class="h-cuerpo">
      <form class="tarjeta empresa" data-of="formNombre">
        <label for="of-nombre">${esc(F.t('nombre'))}</label>
        <input id="of-nombre" name="nombre" type="text" maxlength="24" autocomplete="off" spellcheck="false" value="${esc(e.nombre || F.t('nombreDefecto'))}">
        <p class="h-ayuda">${esc(F.t('nombreAyuda'))}</p>
        <label>${esc(F.t('color'))}</label>
        ${muestras(F, e.color)}
        <button class="b-pri" type="submit">${esc(F.t('guardar'))}</button>
      </form>
      ${e.fundada ? `<p class="fundada">${esc(F.t('fundada', { fecha: e.fundada }))}</p>` : ''}
      ${k ? `<section class="tarjeta carrera"><small>${esc(F.t('tuTitulo'))}</small><h3>${esc(k.titulo)}</h3>${k.siguiente ? `<p><b>${esc(F.t('loQueSigue'))}:</b> ${esc(k.siguiente)}</p>` : ''}${k.falta ? `<p><b>${esc(F.t('teFalta'))}:</b> ${esc(k.falta)}</p>` : ''}</section>` : ''}
    </div>`;
}

export const HOJAS = { mapa: hojaMapa, libro: hojaLibro, flota: hojaFlota, bandeja: hojaBandeja, cuaderno: hojaCuaderno, placa: hojaPlaca };
export const ORDEN_OBJETOS = ['mapa', 'libro', 'flota', 'bandeja', 'cuaderno', 'placa'];
