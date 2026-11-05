/* ============ Iconos ============ */
const IC = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".6"/><circle cx="3.5" cy="12" r=".6"/><circle cx="3.5" cy="18" r=".6"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  fondos: '<svg viewBox="0 0 24 24"><path d="M3 10l9-6 9 6"/><path d="M5 10v9M9.5 10v9M14.5 10v9M19 10v9M3 21h18"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 00-14.5-4M4 4v4h4"/><path d="M4 13a8 8 0 0014.5 4M20 20v-4h-4"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg>'
};

/* ============ Toast, hojas ============ */
let toastT = null;
function toast(msg, undo, err) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.setAttribute('role', 'status');
  t.innerHTML = `<span>${esc(msg)}</span>` + (undo ? '<button data-act="toast-undo">Deshacer</button>' : '');
  if (undo) t.querySelector('button').onclick = () => { t.remove(); undo(); };
  document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), undo ? 6000 : 3200);
}
let SHEETS = [];
const val = v => typeof v === 'function' ? v() : v;
function openSheet(def) {
  const el = document.createElement('div'); el.className = 'scrim';
  el.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="sh-h"><h3></h3><button class="icon-btn" data-act="sheet-close" aria-label="Cerrar">' + IC.x + '</button></div><div class="sh-b"></div><div class="sh-f"></div></div>';
  def.el = el; $('#sheets').appendChild(el); SHEETS.push(def);
  el.addEventListener('mousedown', e => { if (e.target === el) closeSheet(def); });
  paintSheet(def); if (def.onOpen) def.onOpen(def);
  return def;
}
function paintSheet(def) {
  const b = $('.sh-b', def.el), st = b.scrollTop;
  $('h3', def.el).textContent = val(def.title);
  b.innerHTML = val(def.body);
  const f = $('.sh-f', def.el), fh = val(def.foot); f.innerHTML = fh || ''; f.style.display = fh ? '' : 'none';
  b.scrollTop = st; if (def.after) def.after(def);
}
function closeSheet(def) {
  def = def || SHEETS[SHEETS.length - 1]; if (!def) return;
  def.el.remove(); SHEETS = SHEETS.filter(s => s !== def); if (def.onClose) def.onClose();
}
const sheetOf = el => { const sc = el.closest('.scrim'); return SHEETS.find(s => s.el === sc); };

/* ============ Gráficos SVG ============ */
function donut(segs, centro, sub) {
  const R = 54, Cc = 2 * Math.PI * R, tot = sum(segs, s => s.v) || 1; let off = 0;
  const arcs = segs.filter(s => s.v > 0).map(s => {
    const len = s.v / tot * Cc, gap = segs.length > 1 ? Math.min(2, len / 3) : 0;
    const a = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${s.c}" stroke-width="16" stroke-dasharray="${Math.max(0, len - gap)} ${Cc}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;
    off += len; return a;
  }).join('');
  return `<svg viewBox="0 0 140 140" role="img" aria-label="Distribución"><circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--surface2)" stroke-width="16"/>${arcs}
  <text class="donut-c" x="70" y="68" text-anchor="middle">${esc(centro)}</text><text x="70" y="84" text-anchor="middle">${esc(sub || '')}</text></svg>`;
}
function barras(id, cols, o = {}) { // cols: [{l, v, c, v2, hatch, tip}]
  const W = 340, H = o.h || 150, pl = 4, pb = 20, pt = 8, n = cols.length, bw = (W - pl) / n;
  const max = Math.max(1, ...cols.map(c => Math.max(c.v, c.v2 || 0))) * 1.08;
  const y = v => pt + (H - pb - pt) * (1 - v / max);
  let g = '';
  [0.5, 1].forEach(f => { const yy = y(max / 1.08 * f); g += `<line class="ax" x1="0" x2="${W}" y1="${yy}" y2="${yy}" stroke-dasharray="${f === 1 ? '' : '3 4'}"/>`; });
  g += `<text x="0" y="${y(max / 1.08) - 3}" style="font-size:9.5px">${esc(compact(max / 1.08))}</text>`;
  cols.forEach((c, i) => {
    const x = pl + i * bw + bw * .17, w = bw * .66, h = Math.max(0, (H - pb - pt) * c.v / max);
    if (c.v > 0) g += `<path d="${roundTop(x, y(c.v), w, h, Math.min(5, w / 2))}" fill="${c.c}" ${c.hatch ? 'opacity=".55"' : ''}/>`;
    if (c.v2 != null) { const yy = y(c.v2); g += `<line x1="${x - 1}" x2="${x + w + 1}" y1="${yy}" y2="${yy}" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>`; }
    g += `<text x="${x + w / 2}" y="${H - 5}" text-anchor="middle" style="${c.sel ? 'fill:var(--ink);font-weight:800' : ''}">${esc(c.l)}</text>`;
    g += `<rect class="hit" x="${pl + i * bw}" y="0" width="${bw}" height="${H}" data-tip="${esc(c.tip || '')}"/>`;
  });
  return `<div class="readout num" id="ro-${id}">${esc(o.def || ' ')}</div><svg class="chart" data-ro="${id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Gráfico de barras')}">${g}</svg>`;
}
function roundTop(x, y, w, h, r) { r = Math.min(r, h); return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; }
function lineas(id, series, xl, o = {}) { // series [{pts, c, dash, area}], xl: etiquetas por punto (índices) -> {i: label}
  const W = 340, H = o.h || 170, pl = 4, pb = 20, pt = 10, n = series[0].pts.length;
  const all = series.flatMap(s => s.pts), mn = Math.min(0, ...all), mx = Math.max(1, ...all) * 1.06, rng = (mx - mn) || 1, max = mx;
  const X = i => pl + (W - pl - 8) * (n === 1 ? 0 : i / (n - 1)), Y = v => pt + (H - pb - pt) * (1 - (v - mn) / rng);
  let g = '';
  [0, 1].forEach(f => { const yy = f ? Y(mx / 1.06) : Y(0); g += `<line class="ax" x1="0" x2="${W}" y1="${yy}" y2="${yy}" stroke-dasharray="${f === 1 ? '' : '3 4'}"/>`; });
  g += `<text x="0" y="${Y(mx / 1.06) - 3}" style="font-size:9.5px">${esc(o.yfmt ? o.yfmt(mx / 1.06) : compact(mx / 1.06))}</text>`;
  if (mn < 0) g += `<text x="0" y="${Y(mn) - 3}" style="font-size:9.5px">${esc(compact(mn))}</text>`;
  series.forEach(s => {
    const d = s.pts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
    if (s.area) g += `<path d="${d}L${X(n - 1)},${Y(0)}L${X(0)},${Y(0)}Z" fill="${s.c}" opacity=".13"/>`;
    g += `<path d="${d}" fill="none" stroke="${s.c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="5 5"' : ''}/>`;
    g += `<circle cx="${X(n - 1)}" cy="${Y(s.pts[n - 1])}" r="4" fill="${s.c}" stroke="var(--surface)" stroke-width="2"/>`;
  });
  Object.entries(xl).forEach(([i, l]) => g += `<text x="${Math.min(W - 14, Math.max(8, X(+i)))}" y="${H - 5}" text-anchor="middle">${esc(l)}</text>`);
  const step = Math.max(1, Math.floor(n / 60));
  for (let i = 0; i < n; i += step) g += `<rect class="hit" x="${X(i) - (W / n) / 2 * step}" y="0" width="${Math.max(6, (W / n) * step)}" height="${H}" data-tip="${esc(o.tip ? o.tip(i) : '')}"/>`;
  return `<div class="readout num" id="ro-${id}">${esc(o.def || ' ')}</div><svg class="chart" data-ro="${id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Gráfico de líneas')}">${g}</svg>`;
}

/* ============ Piezas de pantalla ============ */
function mainCat(m) {
  if (m.tipo === 'ingreso') return { e: ingCatOf(m.cat).e, n: ingCatOf(m.cat).n, c: ingCatOf(m.cat).c };
  if (m.tipo === 'aporte' || m.tipo === 'retiro' || m.tipo === 'rendimiento') { const d = destOf(m.fondo); return { e: d ? d.e : '🏦', n: d ? d.n : 'Fondo', c: d ? d.c : '#6250d6' }; }
  const its = (m.items || []).slice().sort((a, b) => b.monto - a.monto); const c = catOf(its[0] ? its[0].cat : m.cat);
  return { e: c.e, n: c.n, c: c.c, multi: new Set(its.map(i => i.cat)).size > 1 };
}
function mvTitle(m) {
  if (m.com) return m.com;
  if (m.tipo === 'aporte') return 'Aporte a ' + (destOf(m.fondo) || { n: 'fondo' }).n;
  if (m.tipo === 'retiro') return 'Retiro de ' + (destOf(m.fondo) || { n: 'fondo' }).n;
  if (m.tipo === 'rendimiento') return 'Rendimiento de ' + (destOf(m.fondo) || { n: 'fondo' }).n;
  const its = m.items || []; if (its.length === 1) return its[0].n || catOf(its[0].cat).n; if (m.tipo === 'ingreso') return ingCatOf(m.cat).n;
  return its.length ? (its[0].n || 'Compra') + ' y ' + (its.length - 1) + ' más' : 'Movimiento';
}
function mvRow(m, opts = {}) {
  const c = mainCat(m); const its = (m.items || []).length;
  const sign = m.tipo === 'ingreso' || m.tipo === 'retiro' || m.tipo === 'rendimiento' ? '+' : '';
  const cls = m.tipo === 'ingreso' || m.tipo === 'rendimiento' ? 'pos' : m.tipo === 'aporte' ? 'acc' : '';
  const bits = [];
  if (m.tipo === 'gasto') { if (its > 1) bits.push(its + ' ítems'); else bits.push(c.n); bits.push(medioOf(m.medio).n); }
  else if (m.tipo === 'ingreso') bits.push(c.n); else bits.push('Fondo');
  if (m.cuota && m.cuota.n > 1) bits.push(`cuota ${m.cuota.i}/${m.cuota.n}`);
  if (m.pagoFondo) bits.push('con ' + (destOf(m.pagoFondo) || { n: 'fondo' }).n);
  bits.push(m.por || '');
  const imp = m.mes !== m.fecha.slice(0, 7) && !opts.noimp ? `<span class="pill acc" style="margin-left:6px">se paga en ${ymShort(m.mes)}</span>` : '';
  return `<button class="mv" data-act="mov-open" data-id="${m.id}"><span class="ico" style="background:${c.c}22">${c.e}</span>
  <span class="grow"><div class="t ell">${esc(mvTitle(m))}${imp}</div><div class="s ell">${esc(bits.filter(Boolean).join(' · '))}</div></span>
  <span class="a num ${cls === 'pos' ? 'pos' : cls === 'acc' ? '' : ''}" style="${cls === 'acc' ? 'color:var(--accent)' : ''}">${sign}${money(m.total)}</span></button>`;
}
function delta(a, b, invert) { // variación porcentual vs mes anterior
  if (!b) return '';
  const p = Math.round((a - b) / b * 100); if (p === 0) return '<span class="pill">igual que el mes anterior</span>';
  const bad = invert ? p < 0 : p > 0;
  return `<span class="pill ${bad ? 'neg' : 'pos'}">${p > 0 ? '▲' : '▼'} ${Math.abs(p)}% vs ${ymShort(addM(S.mes, -1)).toLowerCase()}</span>`;
}
function emptyState(emoji, t, s, btn) { return `<div class="empty"><div class="big">${emoji}</div><b>${t}</b>${s}${btn ? `<div class="sp"></div>${btn}` : ''}</div>`; }

/* ============ Encabezado y navegación ============ */
function header() {
  if (S.vista === 'ajustes') return `<div class="top"><button class="icon-btn" data-act="go" data-v="inicio" aria-label="Volver">${IC.left}</button><div class="mes"><span class="lbl">Ajustes</span></div></div>`;
  const u = cfg().usuarios;
  return `<div class="top"><div class="mes"><button class="icon-btn" data-act="mes-prev" aria-label="Mes anterior">${IC.left}</button><button class="lbl" data-act="mes-pick" aria-label="${ymLabel(S.mes)}">${ymName(S.mes)}<small>${S.mes.slice(0, 4)}${S.mes === ymNow() ? ' · este mes' : ''}</small></button><button class="icon-btn" data-act="mes-next" aria-label="Mes siguiente">${IC.right}</button></div>
  <div class="who" role="group" aria-label="Quién carga">${u.map(n => `<button class="${n === userName() ? 'on' : ''}" data-act="user" data-u="${esc(n)}" aria-label="Carga ${esc(n)}"><span class="full">${esc(n)}</span><span class="ini">${esc(n.slice(0, 1))}</span></button>`).join('')}</div>
  <button class="icon-btn" data-act="recargar" aria-label="Actualizar">${IC.refresh}</button>
  <button class="icon-btn" data-act="go" data-v="ajustes" aria-label="Ajustes">${IC.gear}</button></div>
  ${S.canWrite === false ? '<div class="note neg" style="margin:4px 0 8px"><b>Tu cuenta solo puede mirar.</b> Para cargar, Juan tiene que invitarte como <b>Editor</b> desde Compartir y apagar el link público (con el link público, las cuentas de afuera quedan solo de lectura).</div>' : ''}
  ${S.mode === 'cloud' && (S.cache.mov || S.cache.cfg) && Date.now() - S.t0 > 3000 ? '<div class="sync">Estás viendo los últimos datos guardados en este teléfono; todavía no llegaron los más nuevos. Revisá la conexión o tocá Recargar en Ajustes.</div>' : ''}
  ${S.mode === 'local' ? '<div class="sync">Modo local: lo que cargues queda solo en este teléfono. Abrí el enlace desde la sesión de Claude para compartir con el otro.</div>' : ''}`;
}
function pendientes() {
  const n = new Date(); const ym = ymNow();
  return checklist(ym).filter(r => !r.real && (r.plan > 0 || r.it.recordar)).length;
}
function paintNav() {
  const it = (v, ic, l) => `<button class="it ${S.vista === v ? 'on' : ''}" data-act="go" data-v="${v}" aria-label="${l}">${ic}<span>${l}</span>${v === 'inicio' && pendientes() ? `<span class="badge">${pendientes()}</span>` : ''}</button>`;
  $('#nav').innerHTML = it('inicio', IC.home, 'Inicio') + it('movs', IC.list, 'Movimientos') +
    `<button class="fab" data-act="nuevo" aria-label="Cargar un movimiento">${IC.plus}</button>` + it('analisis', IC.chart, 'Análisis') + it('fondos', IC.fondos, 'Fondos');
}

/* ============ INICIO ============ */
function vInicio() {
  const ym = S.mes, R = esperado(ym), now = ymNow();
  const cur = ym === now, fut = ym > now;
  const hayAlgo = S.movs.length || S.plan.items.length;
  if (!hayAlgo) return `<div class="card">${emptyState('👋', 'Empecemos', 'Cargá tu primer gasto con el botón <b style="display:inline">+</b>. Podés sacarle foto al ticket y se arma solo.', `<button class="btn primary" data-act="nuevo">Cargar un gasto</button>`)}</div>`;
  // Mes actual y futuros: se muestra el mes entero (lo confirmado + lo que falta del plan). Meses pasados: lo real.
  const esp = ym >= now;
  const ingV = esp ? R.ingEsp : R.ing, consV = esp ? R.consEsp : R.cons, aporV = esp ? R.aporEsp : R.apor;
  const resV = ingV - consV, sinV = resV - aporV + R.ret;
  const tot = Math.max(ingV, consV + Math.max(0, aporV), 1);
  const wCons = consV / tot * 100, wApor = Math.max(0, aporV) / tot * 100, wSin = Math.max(0, 100 - wCons - wApor);
  const falta = Math.max(0, R.consEsp - R.cons);
  const ac = acumulado(ym);
  let h = '<div class="grid two">';
  h += `<div class="card hero span2"><div class="trio">
    <div><div class="eyebrow">${esp ? 'Entra' : 'Entró'}</div><div class="big num pos">${compact(ingV)}</div><div class="cap">${esp ? (R.ingP > 0 ? 'cobrado ' + compact(R.ing) : 'todo cobrado') : 'cobrado'}</div></div>
    <div><div class="eyebrow">${esp ? 'Sale' : 'Salió'}</div><div class="big num">${compact(consV)}</div><div class="cap">${esp ? (falta > 500 ? 'pagado ' + compact(R.cons) : 'todo pagado') : 'gastado'}</div></div>
    <div><div class="eyebrow">${esp ? 'Sobra' : 'Resultado'}</div><div class="big num ${resV < 0 ? 'neg' : 'pos'}">${compact(resV)}</div><div class="cap">${esp ? 'entra − sale, del mes entero' : 'ahorro del mes'}</div></div></div>
    <div class="stack" role="img" aria-label="Qué se hace con lo que entra"><i style="width:${wCons}%;background:var(--ink2)"></i><i style="width:${wApor}%;background:var(--accent)"></i><i style="width:${wSin}%;background:var(--pos)"></i></div>
    <div class="leg">
      <div class="li"><span class="dot" style="background:var(--ink2)"></span>Consumo (gastos)<small>${pct(consV, ingV)}%</small><b class="num">${money(consV)}</b></div>
      <div class="li"><span class="dot" style="background:var(--accent)"></span>Aportado a fondos<small>${pct(aporV, ingV)}%</small><b class="num">${money(aporV)}</b></div>
      <div class="li"><span class="dot" style="background:var(--pos)"></span>Queda disponible<small>${pct(Math.max(0, sinV), ingV)}%</small><b class="num ${sinV < 0 ? 'neg' : ''}">${money(sinV)}</b></div>
    </div>
    ${esp ? '<div class="hint" style="margin-top:10px">Incluye lo que todavía no confirmaste. A medida que confirmás cobros y pagos, se ajusta con los montos reales.</div>' : ''}
    ${resV < 0 && ingV > 0 ? '<div class="note neg" style="margin-top:12px">Este mes sale más de lo que entra. Mirá en Análisis qué rubro pesa más.</div>' : ''}
    <div style="margin-top:10px"><button class="link" data-act="explicar">¿Cómo se cuenta cada cosa?</button></div></div>`;
  h += `<div class="tiles span2"><button class="tile" data-act="go" data-v="fondos"><div class="eyebrow">Sobra acumulada</div><div class="v num ${ac.libre < 0 ? 'neg' : ''}">${money(ac.libre)}</div><div class="hint">al cierre de ${ymName(ym).toLowerCase()}, sin destino todavía</div></button>
    <button class="tile" data-act="go" data-v="fondos"><div class="eyebrow">Patrimonio</div><div class="v num">${money(ac.total)}</div><div class="hint">sobra + fondos, con rendimiento estimado</div></button></div>`;
  const sc = primerMesSinCerrar();
  if (sc) h += `<div class="card span2" style="border:2px solid var(--accent)"><h2>Terminó ${ymName(sc).toLowerCase()}</h2><div class="help">Actualizá los montos reales, contá cuánto vale hoy cada fondo y cerrá el mes. Queda guardado el histórico para ver cuánto rindió.</div><div class="sp"></div><button class="btn primary block" data-act="cerrar" data-ym="${sc}">Cerrar ${ymName(sc).toLowerCase()}</button></div>`;
  // checklist
  const rows = checklist(ym);
  if (rows.length) {
    const grupos = [['ingreso', 'Cobros'], ['gasto', 'Pagos del mes'], ['aporte', 'Aportes a fondos']];
    const pend = rows.filter(r => !r.real && r.plan > 0), pendTodos = rows.filter(r => !r.real && (r.plan > 0 || r.it.recordar));
    h += `<div class="card"><h2>Para este mes ${pendTodos.length ? `<span class="pill warn">${pendTodos.length} pendiente${pendTodos.length > 1 ? 's' : ''}</span>` : '<span class="pill pos">Todo al día</span>'}</h2>`;
    for (const [tipo, lab] of grupos) {
      const rs = rows.filter(r => r.it.tipo === tipo); if (!rs.length) continue;
      h += `<div class="group-h">${lab}</div>`;
      for (const r of rs) {
        const done = !!r.real; const e = r.it.tipo === 'aporte' ? r.it.e : (r.it.tipo === 'ingreso' ? ingCatOf(r.it.cat).e : catOf(r.it.cat).e);
        h += `<button class="chk ${done ? 'done' : ''}" data-act="plan-open" data-id="${esc(r.it.id)}"><span class="cb">${IC.check}</span><span class="grow"><div class="nm ell">${e} ${esc(r.it.n)}</div><div class="sub">${done ? 'registrado' + (Math.round(r.real.total) !== Math.round(r.plan) ? ' · previsto ' + money(r.plan) : '') : (r.recordatorio ? 'recordatorio · cargá el monto cuando llegue' : r.it.pct ? '10% de los ingresos' : fut ? 'previsto' : 'tocá para confirmar')}</div></span><span class="amt num ${done ? 'pos' : ''}">${r.recordatorio ? '<span class="muted" style="font-weight:700">sin monto</span>' : money(done ? r.real.total : r.plan)}</span></button>`;
      }
    }
    if (pend.length > 1) h += `<div class="sp"></div><button class="btn block" data-act="plan-todo">Confirmar todo lo pendiente (${pend.length})</button>`;
    h += '</div>';
  }
  if (ym <= now && ym >= cfg().inicio && sc !== ym) h += `<div class="span2"><button class="btn block ghost" data-act="cerrar" data-ym="${ym}">${S.cierres[ym] ? '✓ ' + ymName(ym) + ' cerrado · volver a ajustar' : 'Cerrar ' + ymName(ym).toLowerCase() + ' ahora'}</button></div>`;
  // tarjetas
  const tj = tarjetasMes(ym), tj2 = tarjetasMes(addM(ym, 1));
  if (tj.some(x => x.total) || tj2.some(x => x.total)) {
    h += '<div class="card"><h2>Tarjetas</h2>';
    for (let i = 0; i < tj.length; i++) {
      const a = tj[i], b = tj2[i]; if (!a.total && !b.total) continue;
      if (a.total) h += `<div class="mv"><span class="ico">💳</span><span class="grow"><div class="t">${esc(a.t.n)}</div><div class="s">Se paga en ${ymName(ym).toLowerCase()}${a.previo ? ' · incluye ' + money(a.previo) + ' de saldo anterior' + (a.pagado ? ' (ya pagado)' : '') : ''}</div></span><span class="a num">${money(a.total)}</span></div>`;
      if (b.total) h += `<div class="mv"><span class="ico">💳</span><span class="grow"><div class="t">${esc(a.t.n)}</div><div class="s">Ya acumulado para ${ymName(addM(ym, 1)).toLowerCase()}</div></span><span class="a num ink2">${money(b.total)}</span></div>`;
    }
    h += '</div>';
  }
  h += cardBolsas(ym);
  // rubros
  const pr = porRubro(R.L).slice(0, 6), totR = sum(porRubro(R.L), r => r.total);
  if (pr.length) {
    h += `<div class="card"><h2>En qué se va <button class="more" data-act="go" data-v="analisis">Ver análisis</button></h2>`;
    pr.forEach(r => { const c = catOf(r.cat); h += `<div class="bar-row"><div class="hd"><span class="ico sm" style="background:${c.c}22">${c.e}</span><span class="n ell">${esc(c.n)}</span><span class="v num">${money(r.total)}</span></div><div class="bar"><i style="width:${r.total / pr[0].total * 100}%;background:${c.c}"></i></div></div>`; });
    h += '</div>';
  }
  // últimos
  const ult = R.L.filter(m => m.src !== 'plan' && !m.omitido).sort((a, b) => (b.fecha + (b.creado || '')).localeCompare(a.fecha + (a.creado || ''))).slice(0, 6);
  if (ult.length) h += `<div class="card"><h2>Últimos movimientos <button class="more" data-act="go" data-v="movs">Ver todos</button></h2>${ult.map(m => mvRow(m)).join('')}</div>`;
  return h + '</div>';
}

/* ============ MOVIMIENTOS ============ */
function vMovs() {
  const U = S.ui; const R = resumenMes(S.mes, 'pago');
  let L = R.L.filter(m => !m.omitido);
  if (U.movFiltro === 'gasto') L = L.filter(m => m.tipo === 'gasto'); else if (U.movFiltro === 'ingreso') L = L.filter(m => m.tipo === 'ingreso'); else if (U.movFiltro === 'fondo') L = L.filter(m => ['aporte', 'retiro', 'rendimiento'].includes(m.tipo));
  const q = norm(U.q);
  let h = `<div class="search" style="margin-bottom:10px">${IC.search}<input class="inp" id="q-movs" placeholder="Buscar comercio, ítem, nota…" value="${esc(U.q)}" autocomplete="off"></div>
  <div class="seg" style="margin-bottom:10px">${[['todo', 'Todo'], ['gasto', 'Gastos'], ['ingreso', 'Ingresos'], ['fondo', 'Fondos']].map(([k, l]) => `<button class="${U.movFiltro === k ? 'on' : ''}" data-act="mfiltro" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="seg" style="margin-bottom:6px"><button class="${U.movVista === 'compras' ? 'on' : ''}" data-act="mvista" data-k="compras">Por compra</button><button class="${U.movVista === 'items' ? 'on' : ''}" data-act="mvista" data-k="items">Línea por línea</button></div>
  <div class="hint" style="margin:6px 4px 0">Mostrando lo que se paga en ${ymName(S.mes).toLowerCase()}.</div>`;
  if (U.movVista === 'compras') {
    if (q) L = L.filter(m => norm([m.com, m.nota, mvTitle(m), ...(m.items || []).map(i => i.n)].join(' ')).includes(q));
    L.sort((a, b) => (b.fecha + (b.creado || '')).localeCompare(a.fecha + (a.creado || '')));
    if (!L.length) return h + `<div class="card" style="margin-top:12px">${emptyState('🧾', 'Nada por acá', 'Todavía no hay movimientos con ese filtro.', `<button class="btn primary" data-act="nuevo">Cargar uno</button>`)}</div>`;
    const dias = new Map(); L.forEach(m => { if (!dias.has(m.fecha)) dias.set(m.fecha, []); dias.get(m.fecha).push(m); });
    for (const [f, ms] of dias) {
      const tot = sum(ms.filter(esConsumo), m => m.total);
      h += `<div class="day-h"><span>${fechaCorta(f)}</span><span class="num">${tot ? money(tot) : ''}</span></div><div class="card" style="padding:4px 14px">${ms.map(m => mvRow(m)).join('')}</div>`;
    }
  } else {
    let lines = []; for (const m of L) if (m.tipo === 'gasto') for (const it of m.items || []) lines.push({ ...it, m });
    if (q) lines = lines.filter(l => norm([l.n, l.d, l.m.com, catOf(l.cat).n].join(' ')).includes(q));
    lines.sort((a, b) => b.m.fecha.localeCompare(a.m.fecha) || b.monto - a.monto);
    if (!lines.length) return h + `<div class="card" style="margin-top:12px">${emptyState('🔎', 'Sin líneas', 'Acá aparece cada ítem de cada compra.', '')}</div>`;
    h += `<div class="day-h"><span>${lines.length} líneas</span><span class="num">${money(sum(lines, l => l.monto))}</span></div><div class="card" style="padding:4px 14px">` + lines.map(l => {
      const c = catOf(l.cat);
      return `<button class="mv" data-act="mov-open" data-id="${l.m.id}"><span class="ico sm" style="background:${c.c}22">${c.e}</span><span class="grow"><div class="t ell">${esc(l.n || c.n)}${l.cant > 1 ? ` <span class="muted">×${l.cant}</span>` : ''}</div><div class="s ell">${fechaCorta(l.m.fecha)} · ${esc(l.m.com || c.n)}</div></span><span class="a num">${money(l.monto)}</span></button>`;
    }).join('') + '</div>';
  }
  return h;
}

/* ============ ANÁLISIS ============ */
function vAnalisis() {
  const U = S.ui, ym = S.mes, now = ymNow();
  const R = resumenMes(ym, S.base), P = resumenMes(addM(ym, -1), S.base);
  const rub = porRubro(R.L), totR = sum(rub, r => r.total);
  const transc = ym === now ? +hoy().slice(8, 10) : (ym < now ? daysIn(ym) : 1);
  let h = `<div class="seg" style="margin-bottom:12px">${[['rubros', 'Rubros'], ['items', 'Ítems'], ['evol', 'Evolución'], ['proy', 'Proyección']].map(([k, l]) => `<button class="${U.anTab === k ? 'on' : ''}" data-act="antab" data-k="${k}">${l}</button>`).join('')}</div>`;
  const E = esperado(ym), PO = planOriginal(ym), top = rub[0];
  const kRub = `<div class="kpi"><div class="eyebrow">Rubro más pesado</div><div class="v ell" style="font-size:16px">${top ? catOf(top.cat).e + ' ' + esc(catOf(top.cat).n) : '—'}</div><div class="d muted">${top ? pct(top.total, totR) + '% de lo gastado' : ''}</div></div>`;
  if (S.base === 'pago') {
    const dv = PO ? E.consEsp - PO.cons : 0, falta = Math.max(0, E.consEsp - E.cons), resEsp = E.ingEsp - E.consEsp;
    h += `<div class="kpis" style="margin-bottom:14px">
    <div class="kpi"><div class="eyebrow">Gastado hasta hoy</div><div class="v num">${compact(E.cons)}</div><div class="d muted">${falta > 500 ? 'faltan ' + compact(falta) + ' por pagar' : 'todo pagado'}</div></div>
    <div class="kpi"><div class="eyebrow">Gasto esperado del mes</div><div class="v num">${compact(E.consEsp)}</div><div class="d">${PO ? (Math.abs(dv) < 1000 ? '<span class="pill">según el plan</span>' : `<span class="pill ${dv > 0 ? 'neg' : 'pos'}">${dv > 0 ? '▲' : '▼'} ${compact(Math.abs(dv))} ${dv > 0 ? 'sobre' : 'bajo'} el plan</span>`) : '<span class="muted">sin plan para este mes</span>'}</div></div>
    <div class="kpi"><div class="eyebrow">Resultado esperado</div><div class="v num ${resEsp < 0 ? 'neg' : 'pos'}">${compact(resEsp)}</div><div class="d muted">hoy: ${compact(E.res)}</div></div>${kRub}</div>`;
  } else {
    h += `<div class="kpis" style="margin-bottom:14px">
    <div class="kpi"><div class="eyebrow">Compras del mes</div><div class="v num">${compact(R.cons)}</div><div class="d">${delta(R.cons, P.cons)}</div></div>
    <div class="kpi"><div class="eyebrow">Por día</div><div class="v num">${compact(R.cons / Math.max(1, transc))}</div><div class="d muted">${ym === now ? 'en ' + transc + ' días' : 'promedio del mes'}</div></div>${kRub}
    <div class="kpi"><div class="eyebrow">Resultado</div><div class="v num ${R.res < 0 ? 'neg' : 'pos'}">${compact(R.res)}</div><div class="d muted">${R.ing ? pct(R.res, R.ing) + '% de lo que entró' : 'sin ingresos cargados'}</div></div></div>`;
  }
  h += `<div class="row" style="margin-bottom:12px;justify-content:space-between"><span class="hint">Ver por</span><div class="seg" style="width:auto"><button class="${S.base === 'pago' ? 'on' : ''}" data-act="base" data-k="pago">Mes de pago</button><button class="${S.base === 'compra' ? 'on' : ''}" data-act="base" data-k="compra">Fecha de compra</button></div></div>`;
  if (U.anTab === 'rubros') h += anRubros(rub, totR, R);
  else if (U.anTab === 'items') h += anItems(R);
  else if (U.anTab === 'evol') h += anEvol();
  else h += anProy();
  return h;
}
function anRubros(rub, totR, R) {
  const cb = cardBolsas(S.mes);
  if (!rub.length) return `<div class="card">${emptyState('📊', 'Sin gastos este mes', 'Cuando cargues gastos, acá ves en qué se va la plata.', '')}</div>`;
  const top = rub.slice(0, 7), otros = sum(rub.slice(7), r => r.total);
  const segs = top.map(r => ({ v: r.total, c: catOf(r.cat).c })); if (otros) segs.push({ v: otros, c: '#8792a4' });
  const abiertos = S.ui.abiertos;
  let h = cb ? cb.replace('<div class="card">', '<div class="card" style="margin-bottom:14px">') : '';
  h += `<div class="card"><div class="donut-wrap">${donut(segs, compact(totR), 'gastado')}<div class="grow" style="min-width:150px">${top.map(r => `<div class="li" style="display:flex;align-items:center;gap:8px;font-size:13px;padding:2px 0"><span class="dot" style="background:${catOf(r.cat).c}"></span><span class="ell grow">${esc(catOf(r.cat).n)}</span><b class="num">${pct(r.total, totR)}%</b></div>`).join('')}${otros ? `<div class="li" style="display:flex;align-items:center;gap:8px;font-size:13px;padding:2px 0"><span class="dot" style="background:#8792a4"></span><span class="ell grow">Otros rubros</span><b class="num">${pct(otros, totR)}%</b></div>` : ''}</div></div></div>`;
  h += `<div class="card" style="margin-top:14px"><h2>Rubros y sus ítems <button class="more" data-act="exp-todo">${rub.every(r => abiertos[r.cat]) ? 'Colapsar todo' : 'Expandir todo'}</button></h2>`;
  rub.forEach(r => {
    const c = catOf(r.cat), open = !!abiertos[r.cat];
    h += `<div class="bar-row ${open ? 'open' : ''}"><button class="hd" data-act="rubro-tog" data-k="${r.cat}" style="width:100%"><span class="ico sm" style="background:${c.c}22">${c.e}</span><span class="n ell">${esc(c.n)}</span><span class="pill">${pct(r.total, totR)}%</span><span class="v num">${money(r.total)}</span>${IC.chev}</button>
      <div class="bar"><i style="width:${r.total / rub[0].total * 100}%;background:${c.c}"></i>${presDe(c, S.mes) > 0 ? `<span class="mark" style="left:${Math.min(100, presDe(c, S.mes) / rub[0].total * 100)}%" title="Presupuesto"></span>` : ''}</div>
      ${presDe(c, S.mes) > 0 ? `<div class="hint">Presupuesto ${money(presDe(c, S.mes))} · ${r.total > presDe(c, S.mes) ? '<span class="neg">te pasaste ' + money(r.total - presDe(c, S.mes)) + '</span>' : 'te quedan ' + money(presDe(c, S.mes) - r.total)}</div>` : ''}
      <div class="sub-wrap">${r.items.map(it => `<button class="bar-row sub" data-act="item-open" data-k="${it.key}" style="width:100%"><div class="hd"><span class="n ell">${esc(it.n)}${it.veces > 1 ? ` <span class="muted">×${it.veces}</span>` : ''}</span><span class="v num">${money(it.total)}</span></div><div class="bar"><i style="width:${it.total / r.items[0].total * 100}%;background:${c.c};opacity:.75"></i></div></button>`).join('')}</div></div>`;
  });
  return h + '</div>';
}
function anItems(R) {
  const U = S.ui; let items = []; const map = new Map();
  for (const l of lineasDe(R.L)) { const k = keyOf(l.n || catOf(l.cat).n); if (!map.has(k)) map.set(k, { key: k, n: l.n || catOf(l.cat).n, cat: l.cat, total: 0, veces: 0, cant: 0 }); const o = map.get(k); o.total += l.monto; o.veces++; o.cant += +l.cant || 1; }
  items = [...map.values()]; const q = norm(U.itemQ); if (q) items = items.filter(i => norm(i.n).includes(q));
  items.sort(U.itemSort === 'veces' ? (a, b) => b.veces - a.veces || b.total - a.total : U.itemSort === 'nombre' ? (a, b) => a.n.localeCompare(b.n) : (a, b) => b.total - a.total);
  const tot = sum(items, i => i.total);
  let h = `<div class="search" style="margin-bottom:10px">${IC.search}<input class="inp" id="q-items" placeholder="Buscar atún, aceite, papel higiénico…" value="${esc(U.itemQ)}" autocomplete="off"></div>
  <div class="seg" style="margin-bottom:12px">${[['monto', 'Más caros'], ['veces', 'Más seguido'], ['nombre', 'A–Z']].map(([k, l]) => `<button class="${U.itemSort === k ? 'on' : ''}" data-act="isort" data-k="${k}">${l}</button>`).join('')}</div>`;
  if (!items.length) return h + `<div class="card">${emptyState('🧺', 'Sin ítems', 'Acá aparece cada producto o servicio, línea por línea.', '')}</div>`;
  h += `<div class="card"><h2>${items.length} ítems <span class="muted num" style="font-size:14px">${money(tot)}</span></h2>`;
  items.forEach(i => { const c = catOf(i.cat); h += `<button class="bar-row" data-act="item-open" data-k="${i.key}" style="width:100%"><div class="hd"><span class="ico sm" style="background:${c.c}22">${c.e}</span><span class="n ell">${esc(i.n)}</span><span class="v num">${money(i.total)}</span></div><div class="bar"><i style="width:${i.total / items[0].total * 100}%;background:${c.c}"></i></div><div class="hint">${i.veces} ${i.veces > 1 ? 'veces' : 'vez'} · promedio ${money(i.total / i.veces)} · ${esc(c.n)}</div></button>`; });
  return h + '</div>';
}
function filaMes(ym) {
  const now = ymNow();
  if (S.base === 'compra') { const r = resumenMes(ym, 'compra'); return { ym, ing: r.ing, cons: r.cons, apor: r.apor, res: r.res, fut: ym > now, esp: false, plan: null }; }
  const e = esperado(ym); const fut = ym >= now;
  return { ym, ing: fut ? e.ingEsp : e.ing, cons: fut ? e.consEsp : e.cons, apor: fut ? e.aporEsp : e.apor, res: (fut ? e.ingEsp - e.consEsp : e.res), fut: ym > now, esp: fut, plan: planOriginal(ym) };
}
/* Lo que sobró en todos los meses anteriores al año (desde que empezamos): se arrastra al acumulado del año */
function arrastreAnio(year) {
  let acc = 0; const ini = cfg().inicio, fin = `${year - 1}-12`;
  for (let m = ini, n = 0; m <= fin && n < 120; m = addM(m, 1), n++) acc += filaMes(m).res;
  return acc;
}
function serieAnio(year) {
  const out = []; const acc0 = arrastreAnio(year); let acc = acc0;
  for (let i = 1; i <= 12; i++) { const row = filaMes(`${year}-${pad(i)}`); acc += row.res; row.acum = acc; out.push(row); }
  out.arrastre = acc0; return out;
}
function anEvol() {
  const year = S.mes.slice(0, 4), s = serieAnio(year);
  const cols = s.map(x => ({ l: ymShort(x.ym)[0], v: x.cons, v2: x.ing || null, c: 'var(--accent)', hatch: x.esp, sel: x.ym === S.mes, tip: `${ymLabel(x.ym)} · gasto ${money(x.cons)} · entra ${money(x.ing)} · resultado ${money(x.res)}${x.esp ? ' (esperado)' : ''}` }));
  const T = { ing: sum(s, x => x.ing), cons: sum(s, x => x.cons), res: sum(s, x => x.res) }; const arr = s.arrastre || 0;
  const dif = x => x.plan ? x.cons - x.plan.cons : null;
  const dfmt = d => d == null ? '<span class="muted">—</span>' : Math.abs(d) < 1000 ? '<span class="muted">=</span>' : `<span class="${d > 0 ? 'neg' : 'pos'}">${d > 0 ? '+' : '−'}${compact(Math.abs(d)).replace('−', '')}</span>`;
  let h = `<div class="card"><h2>Gasto mes a mes · ${year}</h2>${barras('evo', cols, { def: 'Tocá un mes', label: 'Gasto por mes' })}
  <div class="hint" style="margin-top:6px">Barra clara = esperado (lo confirmado + lo que falta del plan). La raya negra marca lo que entra. Al confirmar pagos, cada mes se ajusta solo con los montos reales.</div></div>
  <div class="card" style="margin-top:14px"><h2>Resultado acumulado · ${year}</h2>${arr ? `<div class="hint" style="margin-bottom:6px">Arranca en ${money(arr)}, lo que sobró hasta diciembre de ${year - 1}.</div>` : ''}${lineas('acum', [{ pts: s.map(x => x.acum), c: 'var(--pos)', area: true }], { 0: 'Ene', 5: 'Jun', 11: 'Dic' }, { def: 'Tocá el gráfico', tip: i => `${ymLabel(s[i].ym)} · resultado del mes ${money(s[i].res)} · acumulado ${money(s[i].acum)}`, label: 'Resultado acumulado' })}</div>
  <div class="card" style="margin-top:14px"><h2>Mes a mes</h2><div class="scrollx"><table class="tbl"><thead><tr><th>Mes</th><th>Entra</th><th>Gasto</th><th>vs plan</th><th>Resultado</th><th>Acumulado</th></tr></thead><tbody>
  ${arr ? `<tr><td>Arrastre de ${year - 1}</td><td></td><td></td><td></td><td></td><td><b>${compact(arr)}</b></td></tr>` : ''}${s.map(x => `<tr><td>${ymName(x.ym)}${x.esp ? ' <span class="muted">·esp.</span>' : ''}</td><td>${compact(x.ing)}</td><td>${compact(x.cons)}</td><td>${dfmt(dif(x))}</td><td class="${x.res < 0 ? 'neg' : 'pos'}">${compact(x.res)}</td><td class="${x.acum < 0 ? 'neg' : ''}"><b>${compact(x.acum)}</b></td></tr>`).join('')}
  <tr><td><b>Total</b></td><td><b>${compact(T.ing)}</b></td><td><b>${compact(T.cons)}</b></td><td></td><td class="${T.res < 0 ? 'neg' : 'pos'}"><b>${compact(T.res)}</b></td><td><b>${compact(s[11].acum)}</b></td></tr></tbody></table></div>
  <div class="hint" style="margin-top:8px">“vs plan” compara el gasto esperado del mes con lo planeado originalmente: rojo = más que el plan, verde = menos. El resultado es antes de aportes a fondos.</div></div>`;
  return h;
}
function anProy() {
  const year = +S.mes.slice(0, 4); const P = proyAnio(year); const tot = sum(P, p => p.total);
  const s = serieAnio(year); const ing = sum(s, x => x.ing);
  const conf = P.some(p => p.conf === 'baja');
  let h = `<div class="kpis" style="margin-bottom:14px"><div class="kpi"><div class="eyebrow">Gasto proyectado ${year}</div><div class="v num">${compact(tot)}</div><div class="d muted">≈ ${compact(tot / 12)} por mes</div></div>
  <div class="kpi"><div class="eyebrow">Entra proyectado</div><div class="v num">${compact(ing)}</div><div class="d muted">según plan y cobros reales</div></div>
  <div class="kpi"><div class="eyebrow">Resultado proyectado</div><div class="v num ${ing - tot < 0 ? 'neg' : 'pos'}">${compact(ing - tot)}</div><div class="d muted">antes de aportes a fondos</div></div></div>`;
  h += `<div class="card"><h2>Por rubro</h2>`;
  if (!P.length) h += emptyState('📈', 'Todavía no hay con qué proyectar', 'Con un mes de gastos cargados ya se puede estimar el año.', '');
  else {
    h += `<div class="scrollx"><table class="tbl"><thead><tr><th>Rubro</th><th>Hasta ahora</th><th>Resto</th><th>Año</th></tr></thead><tbody>${P.map(p => { const c = catOf(p.cat); return `<tr><td>${c.e} ${esc(c.n)}${p.conf === 'baja' && !p.tienePlan ? ' <span class="pill warn">estimado</span>' : ''}</td><td>${compact(p.ytd)}</td><td>${compact(p.rest)}</td><td><b>${compact(p.total)}</b></td></tr>`; }).join('')}</tbody></table></div>`;
    h += `<div class="hint" style="margin-top:8px">Cómo se calcula: lo ya gastado, más los pagos fijos y presupuestos que faltan, más, en rubros sin plan, el ritmo de los últimos meses${conf ? ' (con poco historial todavía: se afina solo a medida que cargás)' : ''}.</div>`;
  }
  h += '</div>';
  const IT = statsItems(null, null).map(o => ({ ...o, p: proyItem(o) })).sort((a, b) => b.p.anual - a.p.anual).slice(0, 40);
  h += `<div class="card" style="margin-top:14px"><h2>Por ítem</h2>`;
  if (!IT.length) h += emptyState('🧺', 'Sin ítems todavía', '', '');
  else {
    h += `<div class="scrollx"><table class="tbl"><thead><tr><th>Ítem</th><th>Por mes</th><th>Año</th></tr></thead><tbody>${IT.map(o => `<tr data-act="item-open" data-k="${o.key}" style="cursor:pointer"><td>${catOf(o.cat).e} ${esc(o.n)} ${o.p.confianza === 'baja' ? '<span class="pill warn">estimado</span>' : ''}</td><td>${compact(o.p.mensual)}</td><td><b>${compact(o.p.anual)}</b></td></tr>`).join('')}</tbody></table></div>
    <div class="hint" style="margin-top:8px">Es lo que gastarías en un año si seguís comprando a este ritmo (total de cada ítem ÷ días desde que lo cargaste × 365). "Estimado" = pocas compras o poco tiempo.</div>`;
  }
  return h + '</div>';
}

/* ============ FONDOS ============ */
function vFondos() {
  const ym = S.mes, ds = cfg().destinos, E = esperado(ym), ac = acumulado(ym), confF = sum(cfg().destinos, d => saldoFondo(d, ym));
  const saldos = ds.map(d => ({ d, s: ac.fondos[d.id], c: saldoFondo(d, ym) }));
  const patr = ac.total;
  const aporteTot = sum(ds, d => aportePlan(d, ym));
  const sobra = E.ingEsp - E.consEsp;
  let h = '<div class="grid two">';
  h += `<div class="card hero span2"><div class="eyebrow">Patrimonio al cierre de ${ymName(ym).toLowerCase()}</div><div class="big num" style="font-size:34px">${money(patr)}</div><div class="cap">≈ ${usd(patr / cfg().tc)} al dólar de referencia ($ ${miles(cfg().tc)}) · en fondos ya confirmado: ${money(confF)}</div><div class="sp"></div>
  <div class="stack">${saldos.filter(x => x.s > 0).map(x => `<i style="width:${x.s / Math.max(1, patr) * 100}%;background:${x.d.c}"></i>`).join('')}${ac.libre > 0 ? `<i style="width:${ac.libre / Math.max(1, patr) * 100}%;background:var(--pos)"></i>` : ''}</div>
  <div class="leg"><div class="li"><span class="dot" style="background:var(--pos)"></span>Sobra acumulada, sin destino<b class="num ${ac.libre < 0 ? 'neg' : ''}">${money(ac.libre)}</b></div>${saldos.map(x => `<div class="li"><span class="dot" style="background:${x.d.c}"></span>${x.d.e} ${esc(x.d.n)}<b class="num">${money(x.s)}</b></div>`).join('')}</div>
  <div class="hint" style="margin-top:10px">Incluye lo confirmado y lo previsto hasta ${ymName(ym).toLowerCase()}, más un rendimiento estimado de <b>${String(+(rendMes() * 100).toFixed(2)).replace('.', ',')}% mensual</b> que se compone mes a mes (${money(ac.totalRendEst)} acumulado). Al cerrar cada mes cargás el valor real y el patrimonio pasa a usar ese.</div></div>`;
  if (aporteTot > 0 && sobra > 0 && aporteTot > sobra + 1000) {
    h += `<div class="note warn span2"><b>Tus aportes previstos (${money(aporteTot)}) superan lo que sobra en ${ymName(ym).toLowerCase()} (${money(sobra)}).</b> Eso equivale al ${Math.round(aporteTot / sobra * 100)}% de lo que sobra. <button class="link" data-act="normalizar">Ajustar proporcionalmente</button></div>`;
  }
  h += cardReparto(ym);
  h += `<div class="card span2"><h2>Aportes de ${ymName(ym).toLowerCase()}</h2>`;
  saldos.forEach(({ d, s, c }) => {
    const ap = S.movs.filter(m => m.tipo === 'aporte' && m.fondo === d.id && m.mes === ym); const hecho = sum(ap, m => m.total);
    const apPlan = aportePlan(d, ym); const share = sobra > 0 && apPlan ? Math.round(apPlan / sobra * 100) : 0;
    h += `<div class="bar-row"><div class="hd"><button class="hd grow" data-act="fondo-open" data-id="${d.id}" style="gap:10px"><span class="ico sm" style="background:${d.c}22">${d.e}</span><span class="n ell">${esc(d.n)}</span><span class="v num">${money(s)}</span>${IC.chev}</button></div>
    <div class="bar"><i style="width:${apPlan ? Math.min(100, hecho / apPlan * 100) : (hecho ? 100 : 0)}%;background:${d.c}"></i></div>
    <div class="row" style="justify-content:space-between"><span class="hint">${hecho ? 'Aportaste ' + money(hecho) : 'Todavía no aportaste'} de ${money(apPlan)} previstos${share ? ' · ' + share + '% de lo que sobra' : ''}${Math.round(c) !== Math.round(s) ? ' · confirmado ' + money(c) : ''}</span>
    <button class="btn sm ${hecho >= apPlan && apPlan ? '' : 'primary'}" data-act="aportar" data-id="${d.id}">${hecho ? 'Sumar otro' : 'Aporté'}</button></div></div>`;
  });
  h += `<div class="sp"></div><button class="btn block ghost" data-act="fondo-nuevo">+ Nuevo destino</button></div>`;
  h += cardHist();
  // metas de compra
  const mt = S.metas.items;
  h += `<div class="card"><h2>Metas de compra <button class="more" data-act="meta-edit" data-id="">Agregar</button></h2>`;
  if (!mt.length) h += `<div class="hint">Anotá lo que querés comprar (sillón, microondas, un viaje) con su costo estimado. Cuando lo comprás, se registra como gasto.</div>`;
  else {
    const pend = mt.filter(x => !x.hecha), cmp = mt.filter(x => x.hecha);
    h += `<div class="hint" style="margin-bottom:6px">Pendientes: <b class="num">${money(sum(pend, x => x.monto))}</b> en ${pend.length} cosas</div>`;
    (S.ui.metasAll ? pend : pend.slice(0, 6)).forEach(x => h += `<div class="mv"><button class="grow row" data-act="meta-edit" data-id="${x.id}" style="align-items:flex-start"><span class="ico sm">🎯</span><span class="grow"><div class="t" style="white-space:normal;overflow-wrap:anywhere">${esc(x.n)}</div><div class="s num">${money(x.monto)}</div></span></button><button class="btn sm" data-act="meta-comprar" data-id="${x.id}">Compré</button></div>`);
    if (pend.length > 6) h += `<button class="btn block ghost" data-act="metas-all">${S.ui.metasAll ? 'Ver menos' : 'Ver las ' + (pend.length - 6) + ' restantes'}</button>`;
    if (cmp.length) h += `<div class="group-h">Compradas</div>` + cmp.map(x => `<div class="mv"><span class="ico sm">✅</span><span class="grow"><div class="t ink2" style="white-space:normal;overflow-wrap:anywhere">${esc(x.n)}</div></span><span class="a num ink2">${money(x.real || x.monto)}</span></div>`).join('');
  }
  h += '</div>';
  h += `<div class="card"><h2>Cómo se cuenta</h2><div class="help"><p style="margin:0 0 8px"><b>Consumo</b> es lo que gastás y no vuelve: súper, alquiler, salidas. Es lo único que resta del resultado del mes.</p>
  <p style="margin:0 0 8px"><b>Aportar a un fondo</b> no es un gasto: la plata pasa de “disponible” al fondo y sigue siendo tuya. Se cuenta una sola vez, el mes que aportás. En los meses siguientes solo suman los aportes nuevos y el rendimiento.</p>
  <p style="margin:0 0 8px"><b>Sobra acumulada</b> = lo que fue sobrando mes a mes después de aportar, sin destino todavía. <b>Patrimonio</b> = sobra acumulada + saldo de todos los fondos.</p>
  <p style="margin:0"><b>Si usás un fondo para comprar algo</b> (el auto, un viaje), se registra el gasto “pagado con el fondo”: baja el fondo y no ensucia el consumo del mes.</p></div></div>`;
  return h + '</div>';
}

function cardReparto(ym) {
  const ds = cfg().destinos, sobra = sobraEsp(ym); const plan = ds.map(d => aportePlan(d, ym)); const tot = sum(plan);
  const pctTot = sobra > 0 ? Math.round(tot / sobra * 100) : 0, libre = sobra - tot;
  let h = `<div class="card span2"><h2>Cómo repartís lo que sobra <span class="pill">${ymName(ym)}: ${compact(sobra)}</span></h2><div class="hint" style="margin-bottom:6px">Elegí por fondo un monto fijo o un % de lo que sobra. Con %, el aporte se recalcula solo cada mes con lo que realmente sobre. Los % suman 100% o menos; lo que no asignes queda disponible.</div>`;
  ds.forEach((d, i) => {
    const pm = d.modo === 'pct';
    h += `<div class="bar-row"><div class="hd"><span class="ico sm" style="background:${d.c}22">${d.e}</span><span class="n ell">${esc(d.n)}</span><span class="v num" id="rp-amt-${d.id}">${money(plan[i])}</span></div>
    <div class="seg" style="padding:3px"><button class="${!pm ? 'on' : ''}" data-act="rep-modo" data-id="${d.id}" data-k="monto">Monto fijo</button><button class="${pm ? 'on' : ''}" data-act="rep-modo" data-id="${d.id}" data-k="pct">% de lo que sobra</button></div>
    ${pm ? `<div class="row"><input type="range" min="0" max="100" step="1" value="${Math.min(100, +d.pct || 0)}" data-f="rep-pct" data-id="${d.id}" style="flex:1;accent-color:var(--accent)" aria-label="Porcentaje para ${esc(d.n)}"><b class="num" style="width:56px;text-align:right" id="rp-pct-${d.id}">${String(+d.pct || 0).replace('.', ',')}%</b></div>` : `<div class="row"><input class="inp num" data-f="rep-monto" data-id="${d.id}" inputmode="decimal" value="${fmtInput(d.aporte)}" aria-label="Monto fijo para ${esc(d.n)}"><span class="hint" style="white-space:nowrap">${sobra > 0 ? Math.round(plan[i] / sobra * 100) : 0}% de lo que sobra</span></div>`}</div>`;
  });
  h += `<div class="row" style="justify-content:space-between;margin-top:10px"><span class="hint">Repartido <b class="num">${pctTot}%</b> · ${libre >= 0 ? 'queda libre ' : 'te pasás por '}<b class="num ${libre < 0 ? 'neg' : 'pos'}">${money(Math.abs(libre))}</b></span>${pctTot > 100 ? '<button class="btn sm" data-act="normalizar">Normalizar a 100%</button>' : ''}</div></div>`;
  return h;
}
function cardHist() {
  const ds = cfg().destinos, f = S.ui.histFondo, sel = ds.filter(d => !f || d.id === f), now = ymNow();
  const aport = sum(sel, d => aportadoNeto(d, now)), gan = sum(sel, d => gananciaFondo(d, now)), valor = sum(sel, d => saldoFondo(d, now));
  const rows = histRows(f);
  let h = `<div class="card span2"><h2>Rendimiento e histórico</h2><div class="chips scroll" style="margin-bottom:10px"><button class="chip ${!f ? 'on' : ''}" data-act="hist-fondo" data-k="">Todos</button>${ds.map(d => `<button class="chip ${f === d.id ? 'on' : ''}" data-act="hist-fondo" data-k="${d.id}">${d.e} ${esc(d.n.split(' ')[0])}</button>`).join('')}</div>
  <div class="kpis"><div class="kpi"><div class="eyebrow">Aportado</div><div class="v num">${compact(aport)}</div></div><div class="kpi"><div class="eyebrow">Hoy vale</div><div class="v num">${compact(valor)}</div></div><div class="kpi"><div class="eyebrow">Ganancia</div><div class="v num ${gan < 0 ? 'neg' : 'pos'}">${compact(gan)}</div><div class="d muted">${aport > 0 ? (gan / aport * 100).toFixed(1).replace('.', ',') + '% sobre lo aportado' : ''}</div></div></div>`;
  if (!rows.length) return h + `<div class="note" style="margin-top:10px">Cuando cierres el primer mes (botón <b>Cerrar mes</b> en Inicio) vas a ver acá cuánto rinde cada fondo, mes a mes.</div></div>`;
  const ps = rows.filter(r => r.pct != null);
  if (ps.length >= 3) { const prod = ps.reduce((a, r) => a * (1 + r.pct / 100), 1); const an = (Math.pow(prod, 12 / ps.length) - 1) * 100; h += `<div class="note" style="margin-top:10px">Promedio mensual <b>${(ps.reduce((a, r) => a + r.pct, 0) / ps.length).toFixed(2).replace('.', ',')}%</b> · anualizado aproximado <b>${an.toFixed(1).replace('.', ',')}%</b> (con ${ps.length} meses cerrados: tomalo como orientación).</div>`; }
  if (rows.length >= 2) h += `<div style="margin-top:12px">${lineas('hist', [{ pts: rows.map(r => r.valor), c: f ? destOf(f).c : 'var(--accent)', area: true }, { pts: rows.map(r => r.aportado), c: 'var(--muted)', dash: true }], { 0: ymShort(rows[0].ym), [rows.length - 1]: ymShort(rows[rows.length - 1].ym) }, { def: 'Tocá el gráfico · raya punteada = lo aportado', tip: i => `${ymLabel(rows[i].ym)} · vale ${money(rows[i].valor)} · aportado ${money(rows[i].aportado)}`, label: 'Valor contra aportado' })}</div>`;
  h += `<div class="scrollx" style="margin-top:8px"><table class="tbl"><thead><tr><th>Mes</th><th>Sobró</th><th>Aportado</th><th>Rindió</th><th>%</th></tr></thead><tbody>${rows.slice().reverse().map(r => `<tr><td>${ymName(r.ym)}</td><td>${compact(r.sobra || 0)}</td><td>${compact(r.apor)}</td><td class="${r.rend < 0 ? 'neg' : 'pos'}">${compact(r.rend)}</td><td>${r.pct == null ? '—' : r.pct.toFixed(2).replace('.', ',') + '%'}</td></tr>`).join('')}</tbody></table></div>
  <div class="hint" style="margin-top:8px">“Rindió” es la diferencia entre lo que valía el fondo al cerrar el mes y lo que tenías más lo aportado. El % se calcula sobre el saldo inicial más la mitad del aporte del mes.</div></div>`;
  return h;
}

function cardBolsas(ym) {
  const bs = bolsasDe(ym); if (!bs.length) return '';
  let h = `<div class="card"><h2>Presupuesto del mes</h2>`;
  bs.forEach(b => {
    const u = bolsaUso(b, ym), pc = Math.min(100, u.gastado / b.monto * 100), col = u.pasado > 0 ? 'var(--neg)' : pc > 85 ? 'var(--warn)' : 'var(--accent)';
    h += `<div class="bar-row"><div class="hd"><span class="n ell">🛒 ${esc(b.n)}</span><span class="v num">${money(u.gastado)} <span class="muted" style="font-weight:600">de ${money(b.monto)}</span></span></div><div class="bar"><i style="width:${pc}%;background:${col}"></i></div>
    <div class="hint">${u.pasado > 0 ? `<span class="neg">Te pasaste ${money(u.pasado)}</span>` : `Te quedan <b class="num">${money(u.queda)}</b>`} · lo que cargues en ${(b.cats || []).map(id => esc(catOf(id).n)).join(' y ')} se descuenta solo</div></div>`;
  });
  return h + '</div>';
}
