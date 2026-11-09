/* ====== Estado local (progreso, repaso, notas): todo queda en el navegador ====== */
const KEY = 'infoestudio.v1';
const INTERVALOS = [0, 1, 3, 7, 16, 35];
let ST, _mem = null;
const ESTADO0 = () => ({ hechos: {}, quiz: {}, resp: {}, notas: {}, feyn: {}, aj: { tema: 'auto', tam: 'normal' }, activos: [], ultimo: null });
function cargar() { try { const r = localStorage.getItem(KEY); ST = Object.assign(ESTADO0(), r ? JSON.parse(r) : (_mem || {})); } catch (e) { ST = Object.assign(ESTADO0(), _mem || {}); } }
function guardar() { _mem = ST; try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { /* sin almacenamiento: queda en memoria */ } }
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const sumarDias = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function activo() { const h = hoy(); if (!ST.activos.includes(h)) { ST.activos.push(h); guardar(); } }
function racha() { let n = 0, d = hoy(); if (!ST.activos.includes(d)) d = sumarDias(d, -1); while (ST.activos.includes(d)) { n++; d = sumarDias(d, -1); } return n; }

/* ====== Datos derivados ====== */
const PLAN = DATOS.plan, ORDEN = DATOS.orden, PARTES = DATOS.partes, PARTE = Object.fromEntries(PARTES.map(p => [p.id, p]));
const escrito = id => !!DATOS.dias[id];
const nDias = ORDEN.length, nEscritos = ORDEN.filter(escrito).length;
const GLOS = new Map();
(function () {
  ORDEN.forEach(id => (DATOS.dias[id]?.terminos || []).forEach(t => { const k = norm(t.t); if (!GLOS.has(k)) GLOS.set(k, { t: t.t, d: t.d, dia: id }); }));
  ORDEN.forEach(id => PLAN[id].introduce.forEach(t => { const k = norm(t); if (!GLOS.has(k)) GLOS.set(k, { t, d: null, dia: id }); }));
})();
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const hechosDe = p => p.dias.filter(i => ST.hechos[i]).length;
const hrefDia = id => `#/dia/${id}`;
const tituloCorto = id => `Día ${PLAN[id].n} · ${PLAN[id].titulo}`;
const sigEscrito = (desde) => { for (let i = ORDEN.indexOf(desde) + 1; i < ORDEN.length; i++) if (escrito(ORDEN[i])) return ORDEN[i]; return null; };
function diaDeHoy() { const pend = ORDEN.find(i => escrito(i) && !ST.hechos[i]); return pend || null; }
function preguntasDe(id) { return (DATOS.dias[id]?.repaso || []).map((q, i) => ({ id: `${id}#${i}`, dia: id, q })); }
function todasLasPreguntas() { const r = []; ORDEN.forEach(i => { if (escrito(i)) r.push(...preguntasDe(i)); }); return r; }
function pendientes() { const h = hoy(); return todasLasPreguntas().filter(x => ST.quiz[x.id] && ST.quiz[x.id].n <= h); }

/* Mezcla estable por pregunta: el orden de las opciones no cambia entre visitas */
function semilla(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mezclar(n, s) { const a = [...Array(n).keys()]; let x = semilla(s) || 1; const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ====== Aplicación de ajustes ====== */
function aplicarAjustes() {
  const r = document.documentElement, a = ST.aj;
  if (a.tema === 'claro') r.dataset.theme = 'light'; else if (a.tema === 'oscuro') r.dataset.theme = 'dark'; else delete r.dataset.theme;
  if (a.tam === 'grande') r.dataset.size = 'grande'; else if (a.tam === 'chica') r.dataset.size = 'chica'; else delete r.dataset.size;
}
function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:90;background:var(--ink);color:var(--bg);padding:10px 18px;border-radius:999px;font:600 .88rem var(--f-ui);box-shadow:var(--sombra);transition:opacity .3s'; document.body.appendChild(t); } t.textContent = msg; t.style.opacity = 1; clearTimeout(t._t); t._t = setTimeout(() => t.style.opacity = 0, 2600); }

/* ====== Navegación lateral ====== */
function anillo(p) { const r = 12, c = 2 * Math.PI * r; return `<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="${r}" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="15" cy="15" r="${r}" fill="none" stroke="var(--circ)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p / 100)}"/></svg>`; }
function dibujarNav(actualId) {
  const act = actualId && PLAN[actualId] ? PLAN[actualId].parte : null;
  $('#nav').innerHTML = `<a class="item${location.hash === '#/' || !location.hash ? ' actual' : ''}" href="#/">⌂ Inicio</a><a class="item" href="#/mapa">▦ El mapa completo</a><a class="item" href="#/repaso">↻ Repaso${pendientes().length ? ` <span class="chip" style="margin-left:auto">${pendientes().length}</span>` : ''}</a><a class="item" href="#/glosario">Aa Glosario</a><a class="item" href="#/fuentes">❡ Fuentes</a><a class="item" href="#/ayuda">? Cómo usar el estudio</a><h4>Las 22 partes</h4>` +
    PARTES.map(p => { const h = hechosDe(p), ab = p.id === act; return `<details class="parte" ${ab ? 'open' : ''}><summary><span class="pn">Parte ${p.num}</span><span class="pt">${esc(p.nombre)}</span><span class="pc">${h}/${p.dias.length}</span><span class="barrita"><i style="width:${pct(h, p.dias.length)}%"></i></span></summary>${p.dias.map(i => `<a class="dia-l${ST.hechos[i] ? ' hecho' : ''}${i === actualId ? ' actual' : ''}${escrito(i) ? '' : ' pend'}" href="${hrefDia(i)}"><span class="n">${PLAN[i].n}</span><span>${esc(PLAN[i].titulo)}</span></a>`).join('')}</details>`; }).join('');
  const hechos = Object.keys(ST.hechos).length;
  $('#anillo').innerHTML = `${anillo(pct(hechos, nDias))}<span>${hechos} / ${nDias}</span>`;
}

/* ====== Vistas ====== */
const VISTAS = {};
function vistaInicio() {
  const hechos = Object.keys(ST.hechos).length, hd = diaDeHoy(), pend = pendientes().length;
  const min = Object.keys(ST.hechos).reduce((s, i) => s + (DATOS.dias[i]?.minutos || 0), 0);
  const prs = Object.values(ST.quiz); const ok = prs.reduce((s, q) => s + q.ok, 0), tot = prs.reduce((s, q) => s + q.ok + q.ko, 0);
  return `<div class="ancha"><section class="hero"><span class="ojo">${hechos ? 'Seguís en camino' : 'Para empezar'}</span><h1>${hechos ? 'Hoy toca:' : 'Informática, tecnología y desarrollo de software, desde cero.'}${hd ? `<br><span style="font-weight:600">Día ${PLAN[hd].n} · ${esc(PLAN[hd].titulo)}</span>` : ''}</h1><p>${hd ? esc(DATOS.dias[hd].bajada) : 'Un estudio integral para entender cómo funciona todo lo que hay debajo de una app: de los bits a la nube, hasta poder leer y decidir sobre un producto como Senda.'}</p><div class="acciones">${hd ? `<a class="btn prim" href="${hrefDia(hd)}">${hechos ? 'Continuar' : 'Empezar el Día 1'} →</a>` : `<span class="btn">${nEscritos ? 'Completaste todos los días disponibles' : 'Los primeros días están en preparación'}</span>`}${pend ? `<a class="btn" href="#/repaso">Repasar ${pend} pregunta${pend > 1 ? 's' : ''}</a>` : ''}<a class="btn" href="#/ayuda">Cómo usar el estudio</a></div></section>
  <div class="stats"><div class="stat"><b>${hechos}</b><span>días completados de ${nEscritos} disponibles</span></div><div class="stat"><b>${racha()}</b><span>días seguidos</span></div><div class="stat"><b>${Math.round(min / 60 * 10) / 10} h</b><span>de estudio acumuladas</span></div><div class="stat"><b>${tot ? pct(ok, tot) + '%' : '—'}</b><span>de aciertos en las preguntas</span></div></div>
  <div class="nota vigencia" style="margin-top:0"><span class="et">Estado del estudio</span><p style="margin:0">El plan completo tiene <b>${nDias} días en ${PARTES.length} partes</b> (unos ${Math.round(nDias * 25 / 60)} horas de estudio). Hoy hay <b>${nEscritos}</b> días escritos; el resto aparece en el mapa como «próximamente» con su título y los conceptos que va a presentar, para que veas todo el camino desde ahora. Versión del ${esc(DATOS.meta.generado)}.</p></div>
  <h2 style="margin-top:30px">Las 22 partes</h2><div class="grid-partes">${PARTES.map(p => { const h = hechosDe(p), e = p.dias.filter(escrito).length; return `<a class="tarjeta" href="#/parte/${p.id}"><span class="pn">Parte ${p.num} · ${p.dias.length} días</span><b>${esc(p.nombre)}</b><p>${esc(p.resumen)}</p><div class="barrita"><i style="width:${pct(h, p.dias.length)}%"></i></div><small>${h} hechos · ${e} escritos de ${p.dias.length}</small></a>`; }).join('')}</div></div>`;
}
VISTAS.inicio = vistaInicio;

function filaDia(i) {
  const p = PLAN[i], d = DATOS.dias[i], hecho = ST.hechos[i];
  return `<a class="fila-dia${hecho ? ' hecho' : ''}${d ? '' : ' pend'}" href="${hrefDia(i)}"><span class="n">${p.n}</span><span><b>${esc(p.titulo)}</b><small>${d ? esc(d.bajada) : 'Presenta: ' + esc(p.introduce.slice(0, 4).join(' · '))}</small></span><span class="est">${hecho ? '✓ hecho' : d ? d.minutos + ' min' : 'próximamente'}</span></a>`;
}
function vistaParte(id) {
  const p = PARTE[id]; if (!p) return vistaNoEncontrada();
  const i = PARTES.indexOf(p), ant = PARTES[i - 1], sig = PARTES[i + 1];
  return `<div class="ancha"><span class="ojo">Parte ${p.num} de ${PARTES.length}</span><h1 class="titulo">${esc(p.nombre)}</h1><p class="bajada">${esc(p.resumen)}</p><div class="meta"><span class="tag">${p.dias.length} días</span><span class="tag">${hechosDe(p)} hechos</span><span class="tag">${p.dias.filter(escrito).length} escritos</span></div><div class="puntos" aria-label="Mapa de la parte">${p.dias.map(d => `<a class="cuad tipo-${PLAN[d].tipo}${escrito(d) ? ' escrito' : ''}${ST.hechos[d] ? ' hecho' : ''}" href="${hrefDia(d)}" title="${esc(tituloCorto(d))}"></a>`).join('')}</div><div class="lista-dias">${p.dias.map(filaDia).join('')}</div><div class="nav-dia">${ant ? `<a href="#/parte/${ant.id}"><small>← Parte ${ant.num}</small><b>${esc(ant.nombre)}</b></a>` : '<span class="solo"></span>'}${sig ? `<a href="#/parte/${sig.id}"><small>Parte ${sig.num} →</small><b>${esc(sig.nombre)}</b></a>` : ''}</div></div>`;
}
VISTAS.parte = vistaParte;

function vistaNoEncontrada() { return `<div class="hoja proximamente"><h1 class="titulo">No encontré esa página</h1><p><a class="btn prim" href="#/">Volver al inicio</a></p></div>`; }

function vistaMapa() {
  return `<div class="ancha"><span class="ojo">Todo el camino</span><h1 class="titulo">El mapa completo</h1><p class="bajada">Cada cuadradito es un día. Verde oscuro: lo hiciste. Verde claro: está escrito. Gris: viene después. Círculo: cierre de parte. Borde ámbar: día anclado a Senda.</p>${PARTES.map(p => `<h3><a href="#/parte/${p.id}" style="text-decoration:none;color:inherit">Parte ${p.num} · ${esc(p.nombre)}</a></h3><div class="puntos">${p.dias.map(d => `<a class="cuad tipo-${PLAN[d].tipo}${escrito(d) ? ' escrito' : ''}${ST.hechos[d] ? ' hecho' : ''}" href="${hrefDia(d)}" title="${esc(tituloCorto(d))}"></a>`).join('')}</div>`).join('')}</div>`;
}
VISTAS.mapa = vistaMapa;

/* ----- Día ----- */
function quizHTML(id, preguntas) {
  return `<section class="quiz" id="quiz"><h2 style="margin-top:0">Poné a prueba lo que entendiste</h2><p style="font:400 .92rem var(--f-ui);color:var(--muted)">Responder sin mirar el texto es lo que más fija el conocimiento. Las que contestes vuelven en el repaso, cada vez más espaciadas.</p>${preguntas.map((q, i) => {
    const qid = `${id}#${i}`, ord = mezclar(q.o.length, qid), r = ST.resp[qid];
    return `<div class="preg" data-qid="${qid}"><p>${i + 1}. ${inline(q.p)}</p>${ord.map(k => { let c = ''; if (r !== undefined) { c = k === q.c ? ' bien' : (k === r ? ' mal' : ''); if (k === r) c += ' elegida'; } return `<button type="button" class="op${c}" data-o="${k}" ${r !== undefined ? 'disabled' : ''}>${inline(q.o[k])}</button>`; }).join('')}<div class="expl" ${r === undefined ? 'hidden' : ''}>${r !== undefined ? (r === q.c ? '<b>Correcto.</b> ' : '<b>No era esa.</b> ') + inline(q.e) : ''}</div>${r !== undefined ? '<button type="button" class="btn chico" data-acc="reintentar" style="margin-top:8px">Intentar de nuevo</button>' : ''}</div>`;
  }).join('')}<p class="puntaje" id="puntaje"></p></section>`;
}
function puntajeQuiz(id, n) { let ok = 0, resp = 0; for (let i = 0; i < n; i++) { const r = ST.resp[`${id}#${i}`]; if (r !== undefined) { resp++; if (r === DATOS.dias[id].repaso[i].c) ok++; } } return { ok, resp }; }

function vistaDia(id) {
  const p = PLAN[id]; if (!p) return vistaNoEncontrada();
  const d = DATOS.dias[id], parte = PARTE[p.parte], i = ORDEN.indexOf(id), ant = ORDEN[i - 1], sig = ORDEN[i + 1];
  const cab = `<span class="ojo">Parte ${parte.num} · ${esc(parte.nombre)} · Día ${p.n} de ${nDias}</span><h1 class="titulo">${esc(p.titulo)}</h1>`;
  const navDia = `<nav class="nav-dia" aria-label="Días">${ant ? `<a href="${hrefDia(ant)}"><small>← Día ${PLAN[ant].n}</small><b>${esc(PLAN[ant].titulo)}</b></a>` : '<span class="solo"></span>'}${sig ? `<a href="${hrefDia(sig)}"><small>Día ${PLAN[sig].n} →</small><b>${esc(PLAN[sig].titulo)}</b></a>` : ''}</nav>`;
  if (!d) return `<div class="hoja">${cab}<div class="proximamente"><p class="bajada" style="margin-bottom:6px">Este día todavía no está escrito.</p><p>Va a presentar: ${p.introduce.map(t => `<span class="chip">${esc(t)}</span>`).join(' ')}</p><p style="font:400 .9rem var(--f-ui);color:var(--muted)">Mientras tanto, seguí con el último día disponible.</p>${diaDeHoy() ? `<a class="btn prim" href="${hrefDia(diaDeHoy())}">Ir a mi próximo día</a>` : ''}</div>${navDia}</div>`;
  const ctx = { citas: [] };
  const cuerpo = renderBloques(d.bloques, ctx);
  const vig = { principio: ['permanente', 'Principio permanente'], mixto: ['mixto', 'Principio + herramientas'], herramienta: ['cambia', 'Herramientas que cambian'] }[d.vigencia] || ['permanente', 'Principio permanente'];
  const llevas = `<section class="llevas"><h2>Lo que te llevás</h2><ul>${d.recap.map(r => `<li>${inline(r, ctx)}</li>`).join('')}</ul></section>`;
  const apoya = (d.se_apoya_en || []).filter(x => PLAN[x]);
  const profundizar = (d.para_profundizar || []).length || (d.videos || []).length ? `<h2>Para profundizar</h2><div class="recursos">${(d.para_profundizar || []).map(r => { const f = DATOS.fuentes[r.fuente] || {}, u = r.url || f.url; const inner = `<b>${esc(r.t || f.t)}</b><span>${esc(r.nota || '')}${f.a ? ` · ${esc(f.a)}` : ''}</span>`; return u ? `<a class="recurso" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : `<div class="recurso">${inner}</div>`; }).join('')}${(d.videos || []).map(v => `<a class="recurso" href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.q)}" target="_blank" rel="noopener noreferrer"><b>▶ Buscar en YouTube: ${esc(v.q)}</b><span>${esc(v.por_que || '')}</span></a>`).join('')}</div>` : '';
  const terminos = (d.terminos || []).length ? `<h2>Palabras que presentó este día</h2><div class="glos-lista">${d.terminos.map(t => `<div class="glos-item"><b>${esc(t.t)}</b><p>${inline(t.d)}</p></div>`).join('')}</div>` : '';
  const fuentes = ctx.citas.length ? `<h2>Fuentes citadas</h2><div class="fuentes-d"><ol>${ctx.citas.map((c, k) => { const f = DATOS.fuentes[c] || { t: c }; return `<li id="fuente-${k + 1}">${esc(f.a ? f.a + '. ' : '')}<i>${esc(f.t)}</i>${f.anio ? ` (${esc(f.anio)})` : ''}${f.url ? ` — <a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">enlace</a>` : ''}</li>`; }).join('')}</ol></div>` : '';
  const hecho = !!ST.hechos[id];
  return `<article class="hoja" data-dia="${id}">${cab}<p class="bajada">${inline(d.bajada)}</p>
  <div class="meta"><span class="tag">⏱ ${d.minutos} min</span><span class="tag ${vig[0]}" title="${d.vigencia === 'principio' ? 'Esto no cambia con las modas: sigue valiendo dentro de veinte años.' : 'Parte de lo que sigue depende de versiones y productos actuales; revisado ' + esc(d.revisado || DATOS.meta.generado) + '.'}">${vig[1]}</span>${p.tipo === 'L' ? '<span class="tag">Laboratorio</span>' : ''}${p.tipo === 'S' ? '<span class="tag" style="color:var(--senal)">◆ Senda</span>' : ''}</div>
  <div class="acciones"><button type="button" class="btn ${hecho ? 'ok' : 'prim'}" data-acc="hecho" data-id="${id}">${hecho ? '✓ Día completado' : 'Marcar como hecho'}</button><button type="button" class="btn" data-acc="imprimir">Imprimir / PDF</button></div>
  <section class="panel objetivos"><h3>Al terminar el día vas a poder</h3><ul>${d.objetivos.map(o => `<li>${inline(o)}</li>`).join('')}</ul></section>
  ${d.venis_de || apoya.length ? `<p class="venis">${d.venis_de ? inline(d.venis_de) + ' ' : ''}${apoya.length ? `Se apoya en: ${apoya.map(x => `<a href="${hrefDia(x)}">Día ${PLAN[x].n}</a>`).join(', ')}.` : ''}</p>` : ''}
  <div class="gancho">${parrafos(d.gancho, ctx)}</div>
  ${cuerpo}${llevas}${quizHTML(id, d.repaso)}
  <section class="escribir"><h2>Explicalo con tus palabras</h2><p>${inline(d.feynman)}</p><textarea id="feyn" placeholder="Escribilo como si se lo explicaras a un amigo que no sabe nada del tema…" data-id="${id}">${esc(ST.feyn[id] || '')}</textarea><p style="font:400 .84rem var(--f-ui);color:var(--muted)">Se guarda en este navegador. Si no podés explicarlo sin mirar, volvé al texto: ahí está lo que falta.</p></section>
  ${profundizar}${terminos}${fuentes}
  ${d.siguiente ? `<p class="venis" style="margin-top:28px"><b>Mañana:</b> ${inline(d.siguiente)}</p>` : ''}
  <div class="acciones" style="justify-content:center;margin-top:24px"><button type="button" class="btn ${hecho ? 'ok' : 'prim'}" data-acc="hecho" data-id="${id}">${hecho ? '✓ Día completado' : 'Marcar como hecho'}</button></div>${navDia}</article>`;
}
VISTAS.dia = vistaDia;

/* ----- Repaso espaciado ----- */
let REP = null;
function vistaRepaso() {
  const h = hoy(), todas = todasLasPreguntas().filter(x => ST.quiz[x.id]);
  if (!REP) { const cola = todas.filter(x => ST.quiz[x.id].n <= h); REP = { cola: cola.sort(() => Math.random() - .5), hechas: 0, ok: 0, modo: 'debidas', total: cola.length }; }
  const q = REP.cola[0];
  const intro = `<span class="ojo">Repaso espaciado</span><h1 class="titulo">Repaso</h1>`;
  if (!todas.length) return `<div class="hoja">${intro}<p class="bajada">Todavía no hay nada para repasar: las preguntas aparecen acá apenas respondas las de un día.</p><a class="btn prim" href="#/">Ir al inicio</a></div>`;
  if (!q) return `<div class="hoja">${intro}<div class="panel"><p class="bajada" style="margin:0 0 8px">${REP.hechas ? `Terminaste: ${REP.ok} de ${REP.hechas} bien.` : 'No tenés nada pendiente hoy.'}</p><p style="font:400 .92rem var(--f-ui)">Tenés ${todas.length} preguntas en tu mazo. Las que fallás vuelven mañana; las que acertás se espacian: 1, 3, 7, 16 y 35 días.</p><button type="button" class="btn prim" data-acc="rep-azar">Repasar 10 al azar igual</button></div></div>`;
  const ord = mezclar(q.q.o.length, q.id + (REP.hechas));
  return `<div class="hoja">${intro}<p style="font:600 .85rem var(--f-ui);color:var(--muted)">Quedan ${REP.cola.length} · del <a href="${hrefDia(q.dia)}">Día ${PLAN[q.dia].n}: ${esc(PLAN[q.dia].titulo)}</a></p><div class="preg" data-qid="${q.id}" data-rep="1"><p>${inline(q.q.p)}</p>${ord.map(k => `<button type="button" class="op" data-o="${k}">${inline(q.q.o[k])}</button>`).join('')}<div class="expl" hidden></div><button type="button" class="btn prim" data-acc="rep-sig" hidden style="margin-top:10px">Siguiente →</button></div></div>`;
}
VISTAS.repaso = vistaRepaso;

/* ----- Glosario, fuentes, ayuda ----- */
function vistaGlosario() {
  const items = [...GLOS.values()].sort((a, b) => norm(a.t).localeCompare(norm(b.t)));
  const def = items.filter(x => x.d).length;
  return `<div class="hoja"><span class="ojo">Glosario</span><h1 class="titulo">Todas las palabras</h1><p class="bajada">${def} con definición (de los días escritos) y ${items.length - def} que se definirán cuando se escriba su día.</p><input class="entrada-input" id="glos-q" type="search" placeholder="Buscar una palabra…" aria-label="Buscar en el glosario"><div class="glos-lista" id="glos-l">${glosItems(items, '')}</div></div>`;
}
function glosItems(items, q) {
  const k = norm(q); return items.filter(x => !k || norm(x.t).includes(k) || (x.d && norm(x.d).includes(k))).slice(0, 400).map(x => `<div class="glos-item"><b>${esc(x.t)}</b> <small>· <a href="${hrefDia(x.dia)}">Día ${PLAN[x.dia].n}</a></small><p>${x.d ? inline(x.d) : '<em style="color:var(--muted)">Se define cuando se escriba su día.</em>'}</p></div>`).join('') || '<p>Sin resultados.</p>';
}
VISTAS.glosario = vistaGlosario;

function vistaFuentes() {
  const uso = {};
  ORDEN.forEach(i => { const d = DATOS.dias[i]; if (!d) return; const s = new Set(); JSON.stringify(d).replace(/\[#([a-z0-9_.-]+)\]/gi, (_, x) => { s.add(x); return ''; }); (d.para_profundizar || []).forEach(r => r.fuente && s.add(r.fuente)); (d.bloques || []).forEach(b => b.fuente && s.add(b.fuente)); s.forEach(x => (uso[x] = uso[x] || []).push(i)); });
  const tipos = { libro: 'Libros', rfc: 'Estándares y RFC', paper: 'Artículos científicos', doc: 'Documentación oficial', curso: 'Cursos abiertos', articulo: 'Artículos y ensayos' };
  const ids = Object.keys(uso).sort();
  return `<div class="hoja"><span class="ojo">Bibliografía viva</span><h1 class="titulo">Fuentes</h1><p class="bajada">Las ${ids.length} fuentes citadas hasta ahora, con los días que las usan. Se priorizan la documentación oficial, los estándares y las obras de referencia.</p>${Object.entries(tipos).map(([t, nom]) => { const l = ids.filter(x => (DATOS.fuentes[x] || {}).tipo === t); return l.length ? `<h2>${nom}</h2><div class="glos-lista">${l.map(x => { const f = DATOS.fuentes[x]; return `<div class="glos-item"><b>${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.t)}</a>` : esc(f.t)}</b>${f.anio ? ` <small>(${esc(f.anio)})</small>` : ''}<p>${esc(f.a || '')}${f.nota ? ' — ' + esc(f.nota) : ''}</p><small>Días: ${uso[x].map(i => `<a href="${hrefDia(i)}">${PLAN[i].n}</a>`).join(', ')}</small></div>`; }).join('')}</div>` : ''; }).join('')}</div>`;
}
VISTAS.fuentes = vistaFuentes;

function vistaAyuda() {
  return `<div class="hoja"><span class="ojo">Guía</span><h1 class="titulo">Cómo usar el estudio</h1>
  <h2>La idea</h2><p>Un día, entre 20 y 30 minutos. Cada día toma un solo grupo de ideas y se apoya en los anteriores: nunca aparece una palabra sin haberla presentado antes. El camino va de cero (qué es un bit) hasta poder entender una app real como Senda, de punta a punta, y tomar decisiones técnicas con criterio.</p>
  <h2>Cómo es un día</h2><ol><li><b>Al terminar vas a poder…</b>: el objetivo concreto.</li><li><b>La lectura</b>, con analogías, diagramas, ejemplos y pequeños laboratorios que se tocan.</li><li><b>Frená y pensá</b>: una pregunta para intentar contestar <i>antes</i> de ver la respuesta.</li><li><b>◆ En Senda</b>: dónde aparece esa idea en el código real de la app (con rutas de archivos).</li><li><b>Lo que te llevás</b> y <b>preguntas de repaso</b>: si fallás, no pasa nada; vuelven en el repaso.</li><li><b>Explicalo con tus palabras</b>: lo que más cuesta y lo que más sirve.</li><li><b>Para profundizar</b>: documentación oficial, RFC, libros y papers. Es optativo.</li></ol>
  <h2>Principio o herramienta</h2><p>Cada día lleva una etiqueta: <span class="tag permanente">Principio permanente</span> son ideas que siguen valiendo dentro de décadas (cómo funciona una CPU); <span class="tag cambia">Herramientas que cambian</span> mezclan ideas con productos y versiones actuales, que se revisan contra la documentación oficial y llevan fecha. Lo que cambia siempre está marcado en un recuadro <i>«Esto cambia con el tiempo»</i>.</p>
  <h2>Repaso espaciado</h2><p>Las preguntas que respondés pasan a un mazo. Las acertadas vuelven a los 1, 3, 7, 16 y 35 días; las falladas, al día siguiente. Cinco minutos por día en <a href="#/repaso">Repaso</a> valen más que releer.</p>
  <h2>Atajos y ajustes</h2><ul><li><kbd>/</kbd> o <kbd>Ctrl</kbd>+<kbd>K</kbd>: buscar en todo el estudio.</li><li><kbd>←</kbd> <kbd>→</kbd>: día anterior y siguiente.</li><li>Las palabras con subrayado punteado se tocan para ver su definición.</li><li>Tema claro/oscuro y tamaño de letra en el engranaje. Imprimir o guardar como PDF cualquier día.</li></ul>
  <h2>Tus datos</h2><p>Todo (progreso, respuestas, notas) se guarda <b>en este navegador</b>. Desde el engranaje podés bajar una copia y volver a cargarla en otra computadora o teléfono.</p></div>`;
}
VISTAS.ayuda = vistaAyuda;

/* ====== Router ====== */
function ruta() {
  const h = location.hash.replace(/^#\/?/, ''), [v, arg] = h.split('/');
  return { v: v || 'inicio', arg };
}
function renderizar() {
  const { v, arg } = ruta(), main = $('#main'), app = $('#app');
  if (v !== 'repaso') REP = null;
  const f = VISTAS[v] || (() => vistaNoEncontrada());
  main.innerHTML = f(arg);
  const esDia = v === 'dia' && PLAN[arg] && escrito(arg);
  app.classList.toggle('con-rail', esDia);
  $('#rail').hidden = !esDia;
  if (v === 'dia' && PLAN[arg]) { ST.ultimo = arg; guardar(); document.title = `Día ${PLAN[arg].n} · ${PLAN[arg].titulo} — Informática desde cero`; } else document.title = 'Informática desde cero — Estudio integral';
  dibujarNav(v === 'dia' ? arg : null);
  $('#barra-inf').innerHTML = v === 'dia' && PLAN[arg] ? barraInf(arg) : '';
  window.scrollTo(0, 0); main.focus({ preventScroll: true });
  if (esDia) { montarWidgets(main); armarRail(arg); puntaje(arg); }
  if (v === 'glosario') { const items = [...GLOS.values()].sort((a, b) => norm(a.t).localeCompare(norm(b.t))); $('#glos-q').oninput = e => $('#glos-l').innerHTML = glosItems(items, e.target.value); }
  $('#nav').classList.remove('abierto'); $('#velo').hidden = true;
  actualizarLectura();
}
function barraInf(id) { const i = ORDEN.indexOf(id), a = ORDEN[i - 1], s = ORDEN[i + 1]; return `${a ? `<a class="btn" href="${hrefDia(a)}">← Anterior</a>` : ''}${s ? `<a class="btn prim" href="${hrefDia(s)}">Siguiente →</a>` : ''}`; }
function puntaje(id) { const d = DATOS.dias[id], el = $('#puntaje'); if (!el || !d) return; const { ok, resp } = puntajeQuiz(id, d.repaso.length); el.textContent = resp ? `Llevás ${ok} de ${d.repaso.length} bien${resp === d.repaso.length ? (ok === d.repaso.length ? ' — ¡perfecto!' : '. Releé lo que falló y probá de nuevo.') : '.'}` : ''; }
function armarRail(id) {
  const d = DATOS.dias[id], hs = $$('h2[id^="s"]', $('#main'));
  $('#rail').innerHTML = `<section><h4>En este día</h4><nav class="toc">${hs.map(h => `<a href="#" data-sc="${h.id}">${h.textContent}</a>`).join('')}<a href="#" data-sc="quiz">Preguntas de repaso</a></nav></section>${(d.terminos || []).length ? `<section><h4>Palabras nuevas</h4><div class="chips">${d.terminos.map(t => `<button type="button" class="chip term" data-t="${esc(norm(t.t))}">${esc(t.t)}</button>`).join('')}</div></section>` : ''}<section><h4>Mis notas</h4><textarea id="notas" data-id="${id}" placeholder="Dudas, ideas, cosas para preguntar…">${esc(ST.notas[id] || '')}</textarea></section>`;
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.toc a').forEach(a => a.classList.toggle('vivo', a.dataset.sc === e.target.id)); }), { rootMargin: '-80px 0px -70% 0px' }); hs.forEach(h => io.observe(h)); const q = $('#quiz'); if (q) io.observe(q); }
}
function actualizarLectura() { const b = $('#prog-lectura'), h = document.documentElement; const t = h.scrollHeight - h.clientHeight; b.style.width = (t > 0 ? Math.min(100, 100 * h.scrollTop / t) : 0) + '%'; }

/* ====== Eventos ====== */
let POP = null;
function cerrarPop() { if (POP) { POP.remove(); POP = null; } }
function abrirTermino(btn) {
  cerrarPop(); const k = btn.dataset.t, g = GLOS.get(k);
  const pop = document.createElement('div'); pop.className = 'pop'; pop.setAttribute('role', 'dialog');
  pop.innerHTML = g ? `<b>${esc(g.t)}</b>${g.d ? inline(g.d) : '<em>Se explica en un día que todavía no está escrito.</em>'}<small>${PLAN[g.dia] ? `Se presenta en el <a href="${hrefDia(g.dia)}">Día ${PLAN[g.dia].n}</a>` : ''}</small>` : '<em>Este término se explica más adelante.</em>';
  document.body.appendChild(pop); const r = btn.getBoundingClientRect();
  pop.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 8)) + 'px';
  pop.style.top = (window.scrollY + r.bottom + 6) + 'px'; POP = pop;
}
function responder(card, k) {
  const qid = card.dataset.qid, [dia, idx] = qid.split('#'), q = DATOS.dias[dia].repaso[+idx], bien = k === q.c, rep = card.dataset.rep;
  const h = hoy(); const prev = ST.quiz[qid] || { b: 0, n: h, ok: 0, ko: 0 };
  if (bien) { prev.ok++; prev.b = Math.min(5, (rep ? prev.b : 0) + 1); } else { prev.ko++; prev.b = 0; }
  prev.n = sumarDias(h, INTERVALOS[prev.b] || 1); if (!bien) prev.n = rep ? h : sumarDias(h, 1);
  ST.quiz[qid] = prev; if (!rep) ST.resp[qid] = k; activo(); guardar();
  $$('.op', card).forEach(o => { o.disabled = true; const ok = +o.dataset.o === q.c; o.classList.toggle('bien', ok); if (+o.dataset.o === k) { o.classList.add('elegida'); if (!ok) o.classList.add('mal'); } });
  const ex = $('.expl', card); ex.hidden = false; ex.innerHTML = (bien ? '<b>Correcto.</b> ' : '<b>No era esa.</b> ') + inline(q.e);
  if (rep) { REP.hechas++; if (bien) REP.ok++; else REP.cola.push(REP.cola[0]); $('[data-acc="rep-sig"]', card).hidden = false; REP.cola.shift(); }
  else { puntaje(dia); if (!$('[data-acc="reintentar"]', card)) card.insertAdjacentHTML('beforeend', '<button type="button" class="btn chico" data-acc="reintentar" style="margin-top:8px">Intentar de nuevo</button>'); }
}
document.addEventListener('click', e => {
  const t = e.target;
  const term = t.closest('.term'); if (term) { e.preventDefault(); abrirTermino(term); return; }
  if (POP && !t.closest('.pop')) cerrarPop();
  const sc = t.closest('[data-sc]'); if (sc) { e.preventDefault(); const el = document.getElementById(sc.dataset.sc); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const op = t.closest('.op'); if (op && !op.disabled) { responder(op.closest('.preg'), +op.dataset.o); return; }
  const b = t.closest('[data-acc]'); if (!b) return; const a = b.dataset.acc;
  if (a === 'hecho') { const id = b.dataset.id; if (ST.hechos[id]) delete ST.hechos[id]; else { ST.hechos[id] = Date.now(); activo(); const s = sigEscrito(id); toast(s ? '¡Día completado! Mañana: ' + PLAN[s].titulo : '¡Día completado!'); } guardar(); renderizar(); }
  else if (a === 'imprimir') window.print();
  else if (a === 'copiar') { const c = b.closest('.codigo').innerText.replace(/^.*\n/, ''); navigator.clipboard?.writeText(c).then(() => toast('Código copiado')); }
  else if (a === 'js-run') { const f = b.closest('[data-js]'); correrJS($('textarea', f).value, $('.salida', f)); }
  else if (a === 'js-reset') { const f = b.closest('[data-js]'), ta = $('textarea', f); ta.value = ta.dataset.orig; $('.salida', f).textContent = 'Apretá «Ejecutar» para ver la salida.'; }
  else if (a === 'reintentar') { const card = b.closest('.preg'), qid = card.dataset.qid; delete ST.resp[qid]; guardar(); const [dia] = qid.split('#'); const sy = window.scrollY; renderizar(); window.scrollTo(0, sy); }
  else if (a.startsWith('seq-')) seq(b.closest('.seq'), a);
  else if (a === 'rep-sig') renderizar();
  else if (a === 'rep-azar') { const todas = todasLasPreguntas().filter(x => ST.quiz[x.id]).sort(() => Math.random() - .5).slice(0, 10); REP = { cola: todas, hechas: 0, ok: 0, total: todas.length }; renderizar(); }
  else if (a === 'menu') { $('#nav').classList.toggle('abierto'); $('#velo').hidden = !$('#nav').classList.contains('abierto'); }
  else if (a === 'ajustes') $('#ajustes').hidden = !$('#ajustes').hidden;
  else if (a === 'buscar') abrirBuscador();
  else if (a === 'tema') { ST.aj.tema = b.dataset.v; guardar(); aplicarAjustes(); marcarAjustes(); }
  else if (a === 'tam') { ST.aj.tam = b.dataset.v; guardar(); aplicarAjustes(); marcarAjustes(); }
  else if (a === 'bajar') bajarCopia();
  else if (a === 'subir') $('#archivo').click();
  else if (a === 'borrar') { if (confirm('Esto borra tu progreso, notas y repasos de este navegador. ¿Seguro?')) { ST = ESTADO0(); guardar(); renderizar(); toast('Borrado'); } }
});
function seq(box, a) {
  const tot = +box.dataset.total, msgs = $$('.msg', box), txt = $('.paso-txt', box), li = $$('details li', box);
  let i = box._i === undefined ? -1 : box._i;
  if (a === 'seq-sig') i = Math.min(tot - 1, i + 1); else if (a === 'seq-ant') i = Math.max(0, i - 1); else i = -1;
  box._i = i; msgs.forEach((m, k) => m.classList.toggle('apagado', i >= 0 && k !== i));
  const hit = li.find(x => +x.dataset.i === i); txt.hidden = !(i >= 0 && hit); if (hit) txt.innerHTML = `<b>Paso ${i + 1} de ${tot}.</b> ${hit.innerHTML}`;
  $('[data-acc="seq-sig"]', box).textContent = i >= 0 && i < tot - 1 ? 'Siguiente ▸' : i === tot - 1 ? 'Fin' : 'Paso a paso ▸';
}
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'notas') { ST.notas[t.dataset.id] = t.value; clearTimeout(t._g); t._g = setTimeout(guardar, 400); }
  if (t.id === 'feyn') { ST.feyn[t.dataset.id] = t.value; clearTimeout(t._g); t._g = setTimeout(() => { guardar(); activo(); }, 600); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { cerrarPop(); cerrarBuscador(); $('#ajustes').hidden = true; return; }
  const edit = /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
  if ((e.key === '/' && !edit) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); abrirBuscador(); return; }
  if (!edit && !e.ctrlKey && !e.metaKey && !e.altKey && ruta().v === 'dia' && PLAN[ruta().arg]) { const i = ORDEN.indexOf(ruta().arg); if (e.key === 'ArrowLeft' && i > 0) location.hash = hrefDia(ORDEN[i - 1]); if (e.key === 'ArrowRight' && i < ORDEN.length - 1) location.hash = hrefDia(ORDEN[i + 1]); }
});
window.addEventListener('scroll', actualizarLectura, { passive: true });
window.addEventListener('hashchange', renderizar);
document.addEventListener('keydown', e => { if (e.key === 'Tab' && !$('#nav').classList.contains('abierto')) return; });
document.addEventListener('keydown', e => { if (e.key === 'Tab' && e.target.tagName === 'TEXTAREA' && e.target.closest('.codigo')) { e.preventDefault(); const t = e.target, s = t.selectionStart; t.value = t.value.slice(0, s) + '  ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 2; } });

/* ====== Ajustes y copia de seguridad ====== */
function marcarAjustes() { $$('#ajustes [data-acc="tema"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === ST.aj.tema)); $$('#ajustes [data-acc="tam"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === ST.aj.tam)); }
function bajarCopia() { const blob = new Blob([JSON.stringify({ version: 1, fecha: new Date().toISOString(), estado: ST }, null, 1)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `informatica-progreso-${hoy()}.json`; a.click(); toast('Copia descargada'); }
function subirCopia(f) { const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.estado) throw 0; ST = Object.assign(ESTADO0(), d.estado); guardar(); aplicarAjustes(); renderizar(); toast('Copia cargada'); } catch (e) { toast('Ese archivo no es una copia válida'); } }; r.readAsText(f); }

/* ====== Buscador ====== */
let INDICE = null;
function construirIndice() {
  INDICE = [];
  ORDEN.forEach(id => { const p = PLAN[id], d = DATOS.dias[id]; const texto = d ? [d.bajada, d.gancho, d.objetivos.join(' '), JSON.stringify(d.bloques).replace(/"[a-z0-9_]+":/gi, ' ').replace(/[\[\]{}"\\]/g, ' '), (d.terminos || []).map(t => t.t + ' ' + t.d).join(' ')].flat().join(' ') : p.introduce.join(' '); INDICE.push({ id, tipo: 'dia', titulo: `Día ${p.n} · ${p.titulo}`, t: norm(p.titulo), terms: norm(p.introduce.join(' ')), texto: norm(texto), crudo: texto, esc: !!d }); });
  GLOS.forEach(g => INDICE.push({ id: g.dia, tipo: 'term', titulo: g.t, t: norm(g.t), terms: '', texto: norm(g.d || ''), crudo: g.d || '', esc: !!g.d }));
}
function buscar(q) {
  const ts = norm(q).split(' ').filter(x => x.length > 1); if (!ts.length) return [];
  return INDICE.map(it => { let s = 0; for (const t of ts) { if (it.t.includes(t)) s += it.tipo === 'term' ? 9 : 6; if (it.terms.includes(t)) s += 4; const n = it.texto.split(t).length - 1; if (n) s += Math.min(n, 6); else if (ts.length > 1) { s = 0; break; } } return { it, s }; }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 30);
}
function resaltarSnippet(crudo, q) { const t = norm(q).split(' ').find(x => x.length > 1); if (!t) return ''; const n = norm(crudo), i = n.indexOf(t); if (i < 0) return esc(crudo.slice(0, 120)); const ini = Math.max(0, i - 50); return esc((ini ? '…' : '') + crudo.slice(ini, ini + 130)).replace(new RegExp(esc(crudo.slice(i, i + t.length)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), m => `<mark>${m}</mark>`); }
function abrirBuscador() {
  if (!INDICE) construirIndice(); cerrarBuscador();
  const f = document.createElement('div'); f.className = 'buscador-fondo'; f.id = 'busc';
  f.innerHTML = `<div class="buscador" role="dialog" aria-label="Buscar"><input type="search" placeholder="Buscar un tema, una palabra o un día…" aria-label="Buscar"><div class="res"></div></div>`; document.body.appendChild(f);
  const inp = $('input', f), res = $('.res', f); let sel = 0, lista = [];
  const pintar = () => { const q = inp.value; lista = buscar(q); res.innerHTML = q.trim().length < 2 ? '<p style="padding:12px;color:var(--muted);font-size:.9rem">Escribí al menos dos letras. Busca en títulos, conceptos, glosario y todo el texto de los días escritos.</p>' : lista.length ? lista.map(({ it }, i) => `<a href="${hrefDia(it.id)}" class="${i === sel ? 'sel' : ''}"><b>${it.tipo === 'term' ? 'Término: ' : ''}${esc(it.titulo)}</b>${it.esc ? '' : ' <small style="display:inline">(próximamente)</small>'}<small>${resaltarSnippet(it.crudo, q)}</small></a>`).join('') : '<p style="padding:12px;color:var(--muted)">Sin resultados.</p>'; };
  inp.oninput = () => { sel = 0; pintar(); };
  inp.onkeydown = e => { if (e.key === 'ArrowDown') { sel = Math.min(lista.length - 1, sel + 1); pintar(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); pintar(); e.preventDefault(); } else if (e.key === 'Enter' && lista[sel]) { location.hash = hrefDia(lista[sel].it.id); cerrarBuscador(); } };
  f.onclick = e => { if (e.target === f || e.target.closest('a')) cerrarBuscador(); };
  pintar(); inp.focus();
}
function cerrarBuscador() { $('#busc')?.remove(); }

/* ====== Arranque ====== */
function iniciar() {
  cargar(); aplicarAjustes(); marcarAjustes();
  $('#archivo').onchange = e => e.target.files[0] && subirCopia(e.target.files[0]);
  renderizar();
}
iniciar();
