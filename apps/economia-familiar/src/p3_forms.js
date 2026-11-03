/* ============ COMPOSITOR (cargar / editar un movimiento) ============ */
let CP = null; // estado del compositor activo
const ARTIFACT_URL = 'https://claude.ai/artifact/UTnbTJ1fUtcaYskFkDWApQ';
const CAT_HINTS = {
  alim: 'comida, bebidas, almacén, verdura, carne, lácteos, panadería', limp: 'limpieza del hogar, papel higiénico, servilletas, detergente, shampoo, jabón, cuidado personal',
  salud: 'farmacia, médicos, dentista, estudios', comer: 'restaurantes, delivery, café, comida lista', serv: 'luz, gas, agua, internet', cel: 'línea de celular',
  trans: 'Uber, nafta, SUBE, peajes, estacionamiento', hogar: 'muebles, electrodomésticos, ferretería, decoración', ropa: 'ropa y calzado', ocio: 'cine, salidas, juegos, entretenimiento',
  sus: 'suscripciones y apps (Netflix, Spotify, iCloud)', edu: 'cursos, libros, útiles', reg: 'regalos', diez: 'diezmo y ofrendas', deuda: 'pagos de tarjeta, préstamos, cuotas', viv: 'alquiler', exp: 'expensas', otros: 'cualquier otra cosa'
};
function catsOrdenadas() {
  const cnt = {}; S.movs.slice(-400).forEach(m => (m.items || []).forEach(i => { cnt[i.cat] = (cnt[i.cat] || 0) + 1; }));
  const base = cfg().cats.map((c, i) => ({ c, i }));
  return base.sort((a, b) => (cnt[b.c.id] || 0) - (cnt[a.c.id] || 0) || a.i - b.i).map(x => x.c);
}
function nuevoCP(tipo, extra = {}) {
  const ult = lsGet('ef_medio', 'ef');
  return Object.assign({
    id: null, tipo: tipo || 'gasto', sub: 'aporte', fecha: hoy(), medio: medios().some(m => m.id === ult) ? ult : 'ef', com: '', nota: '', por: userName(),
    monto: 0, cat: 'alim', catAuto: true, split: false, lines: [], ingCat: 'sueldo', fondo: (cfg().destinos[0] || {}).id, pagoFondo: null, cuotas: 1,
    scan: { state: 'idle' }, quick: false, adv: false, warn: null, medioTouched: false
  }, extra);
}
function cpTotal() { return CP.tipo === 'gasto' && CP.split ? r2(sum(CP.lines, l => +l.monto || 0)) : (+CP.monto || 0); }
function cpMes() {
  if (CP.mesPago && CP.tipo === 'gasto' && esTarjeta(CP.medio) && !CP.pagoFondo) return CP.mesPago;
  if (CP.mesFijo && CP.fecha === CP.fecha0 && CP.medio === CP.medio0) return CP.mesFijo;
  if (CP.tipo === 'gasto' && !CP.pagoFondo) return imputar(CP.fecha, CP.medio);
  return CP.fecha.slice(0, 7);
}
function abrirComposer(tipo, extra) {
  CP = nuevoCP(tipo, extra); KNOWN = knownItems();
  openSheet({ id: 'cp', title: () => CP.id ? 'Editar movimiento' : 'Nuevo movimiento', body: cpBody, foot: cpFoot, onClose: () => { if (CP && CP.foto && CP.foto.url) URL.revokeObjectURL(CP.foto.url); CP = null; }, after: cpAfter });
}
function cpBody() {
  const t = CP.tipo; let h = '';
  if (!CP.id) h += `<div class="seg"><button class="${t === 'gasto' ? 'on' : ''}" data-act="cp-tipo" data-k="gasto">Gasto</button><button class="${t === 'ingreso' ? 'on' : ''}" data-act="cp-tipo" data-k="ingreso">Ingreso</button><button class="${t === 'fondo' ? 'on' : ''}" data-act="cp-tipo" data-k="fondo">Fondos</button></div>`;
  if (t === 'gasto' && !CP.id) {
    {
      h += `<div class="scan"><label for="file-ticket" role="button" tabindex="0">${IC.cam}Foto<small>Ticket, transferencia, Uber: se lee solo</small></label><button data-act="cp-pegar">${IC.list}Pegar texto<small>Ticket digital o mail</small></button><button data-act="cp-quick">${IC.pen}Escribir rápido<small>“Uber 4500 visa”</small></button></div>`;
      h += `<input type="file" id="file-ticket" accept="image/*" multiple class="sr" tabindex="-1">`;
      h += `<div class="note warn" id="foto-hint" hidden>¿No se abre la galería o la cámara? Algunos visores del celular lo bloquean. Dos salidas: <b>Pegar texto</b> (ahí podés pegar una captura o foto copiada) o <a href="${ARTIFACT_URL}" target="_blank" rel="noopener" style="color:var(--accent);font-weight:800">abrir esta app en el navegador del celular</a> (Chrome o Safari).</div>`;
      if (CP.scan.state === 'loading') h += `<div class="card flat row"><span class="spin"></span><div class="grow"><b>Leyendo el comprobante…</b><div class="hint">Separo cada ítem y lo asigno a su rubro. Tarda unos segundos.</div></div></div>`;
      if (CP.scan.state === 'error') h += `<div class="note neg">${esc(CP.scan.msg)}</div>`;
      if (CP.scan.state === 'ok') h += `<div class="note pos">${esc(CP.scan.msg)}</div>`;
      if (CP.quick) h += `<div class="field"><label for="quick">Escribí lo que gastaste</label><input class="inp" id="quick" placeholder="Ej: carrefour 23400 visa" autocomplete="off" enterkeyhint="done"></div>`;
    }
  }
  if (t === 'fondo') {
    h += `<div class="seg"><button class="${CP.sub === 'aporte' ? 'on' : ''}" data-act="cp-sub" data-k="aporte">Aporté</button><button class="${CP.sub === 'retiro' ? 'on' : ''}" data-act="cp-sub" data-k="retiro">Retiré</button><button class="${CP.sub === 'rendimiento' ? 'on' : ''}" data-act="cp-sub" data-k="rendimiento">Rendimiento</button></div>
    <div class="field"><label>Fondo</label><div class="chips">${cfg().destinos.map(d => `<button class="chip ${CP.fondo === d.id ? 'on' : ''}" data-act="cp-fondo" data-k="${d.id}"><span class="e">${d.e}</span>${esc(d.n)}</button>`).join('')}</div></div>
    <div class="hint">${CP.sub === 'aporte' ? 'La plata pasa de disponible al fondo. No cuenta como gasto.' : CP.sub === 'retiro' ? 'La plata vuelve a estar disponible. Si la usaste para comprar algo, cargalo como gasto “pagado con el fondo”.' : 'Lo que ganó el fondo (intereses, revalorización). Suma al fondo sin tocar tu plata disponible.'}</div>`;
  }
  if (t === 'gasto' && CP.foto) h += `<div class="card flat row" style="padding:8px"><button data-act="cp-vefoto" aria-label="Ver foto"><img src="${CP.foto.url}" alt="Foto del ticket" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block"></button><div class="grow"><b>Foto del ticket</b><div class="hint">Tocá para verla grande.</div></div><button class="icon-btn" data-act="cp-quitafoto" aria-label="Quitar foto">${IC.x}</button></div>`;
  // monto
  if (!(t === 'gasto' && CP.split)) h += `<div class="field"><label for="monto">Monto</label><div class="amount-wrap"><span class="cur">$</span><input id="monto" data-f="monto" inputmode="decimal" autocomplete="off" placeholder="0" value="${CP.monto ? fmtInput(CP.monto) : ''}"></div></div>`;
  else h += `<div class="amount-wrap"><span class="cur">$</span><div class="disp num" style="font-size:38px;font-weight:800" id="split-total">${fmtInput(cpTotal()) || '0'}</div></div>`;
  if (t === 'gasto') {
    if (!CP.split) {
      h += `<div class="field"><label>Rubro</label><div class="cats" id="cat-grid">${catGrid()}</div></div>`;
      h += `<div class="field"><label for="com">¿Dónde o qué?</label><input class="inp" id="com" data-f="com" placeholder="Ej: Verdulería, Uber, Netflix" value="${esc(CP.com)}" autocomplete="off"></div>`;
      h += `<button class="btn ghost sm" data-act="cp-split" style="justify-self:start">Dividir en ítems (ticket con varias cosas)</button>`;
    } else {
      h += `<div class="field"><label>Ítems (${CP.lines.length})</label><div class="lines">${CP.lines.map((l, i) => lineRow(l, i)).join('')}</div></div><button class="btn sm" data-act="cp-addline" style="justify-self:start">+ Agregar ítem</button>
      <datalist id="dl-items">${[...KNOWN.values()].slice(-400).map(x => `<option value="${esc(x.n)}">`).join('')}</datalist>
      <div class="field"><label for="tt">Total que dice el ticket (para chequear)</label><input class="inp num" id="tt" data-f="tt" inputmode="decimal" value="${CP.totalTicket ? fmtInput(CP.totalTicket) : ''}" placeholder="Opcional"><div id="tt-chk">${ttChk()}</div></div>`;
    }
    h += `<div class="field"><label>Cómo pagaste</label><div class="chips">${medios().map(m => `<button class="chip ${CP.medio === m.id ? 'on' : ''}" data-act="cp-medio" data-k="${m.id}">${m.k === 'card' ? '💳' : m.id === 'ef' ? '💵' : m.id === 'deb' ? '🏧' : '🏦'} ${esc(m.n)}</button>`).join('')}</div></div>`;
    if (esTarjeta(CP.medio) && !CP.id) h += `<div class="field"><label>Cuotas</label><div class="chips">${[1, 3, 6, 12].map(n => `<button class="chip ${CP.cuotas === n ? 'on' : ''}" data-act="cp-cuotas" data-k="${n}">${n === 1 ? 'Sin cuotas' : n + ' cuotas'}</button>`).join('')}</div>${CP.cuotas > 1 ? `<div class="hint">${CP.cuotas} cuotas de ${money(cpTotal() / CP.cuotas)}, una por mes.</div>` : ''}</div>`;
    if (esTarjeta(CP.medio) && !CP.pagoFondo) { const f0 = CP.fecha.slice(0, 7), sug = imputar(CP.fecha, CP.medio), act = cpMes(); h += `<div class="field"><label>Se paga en</label><div class="chips">${[0, 1, 2, 3, 4].map(i => addM(f0, i)).map(m => `<button class="chip ${act === m ? 'on' : ''}" data-act="cp-mespago" data-k="${m}">${ymShort(m)} ${m.slice(2, 4)}${m === sug ? ' · sugerido' : ''}</button>`).join('')}</div><div class="hint">Elegí en qué resumen entra${CP.cuotas > 1 ? ' la primera cuota' : ''}.</div></div>`; }
  } else if (t === 'ingreso') {
    h += `<div class="field"><label>Tipo de ingreso</label><div class="chips">${cfg().ingCats.map(c => `<button class="chip ${CP.ingCat === c.id ? 'on' : ''}" data-act="cp-ingcat" data-k="${c.id}"><span class="e">${c.e}</span>${esc(c.n)}</button>`).join('')}</div></div>
    <div class="field"><label for="com">Detalle (opcional)</label><input class="inp" id="com" data-f="com" placeholder="Ej: Sueldo, changa, venta" value="${esc(CP.com)}" autocomplete="off"></div>`;
  }
  h += `<div class="grid3" style="grid-template-columns:1fr 1fr"><div class="field"><label for="fecha">Fecha</label><input class="inp" type="date" id="fecha" data-f="fecha" value="${CP.fecha}"></div>
  <div class="field"><label>Cargó</label><div class="seg" style="padding:3px">${cfg().usuarios.map(u => `<button class="${CP.por === u ? 'on' : ''}" data-act="cp-por" data-k="${esc(u)}">${esc(u)}</button>`).join('')}</div></div></div>`;
  if (t === 'gasto') {
    if (!CP.adv) h += `<button class="link" data-act="cp-adv" style="justify-self:start">Más opciones (pagar con un fondo, nota)</button>`;
    else h += `<div class="field"><label>Pagado con un fondo</label><div class="chips"><button class="chip ${!CP.pagoFondo ? 'on' : ''}" data-act="cp-pf" data-k="">No, con plata del mes</button>${cfg().destinos.map(d => `<button class="chip ${CP.pagoFondo === d.id ? 'on' : ''}" data-act="cp-pf" data-k="${d.id}">${d.e} ${esc(d.n)}</button>`).join('')}</div><div class="hint">Baja el fondo y no cuenta en el consumo del mes.</div></div>
      <div class="field"><label for="nota">Nota</label><input class="inp" id="nota" data-f="nota" value="${esc(CP.nota)}" autocomplete="off"></div>`;
  }
  h += `<div class="note" id="imp">${impText()}</div>`;
  return h;
}
function impText() {
  const mes = cpMes(), f = CP.fecha.slice(0, 7);
  if (CP.tipo === 'gasto' && !CP.pagoFondo && esTarjeta(CP.medio)) return `💳 Con tarjeta: se paga en <b>${ymLabel(mes)}</b>${CP.cuotas > 1 ? ' y los ' + (CP.cuotas - 1) + ' meses siguientes' : ''}.`;
  if (CP.tipo === 'gasto' && CP.pagoFondo) return `Sale del fondo <b>${esc((destOf(CP.pagoFondo) || {}).n || '')}</b>. No cuenta en el consumo de ${ymName(mes).toLowerCase()}.`;
  return `Se cuenta en <b>${ymLabel(mes)}</b>.`;
}
function catGrid() {
  return catsOrdenadas().map(c => `<button class="cat-b ${CP.cat === c.id ? 'on' : ''}" data-act="cp-cat" data-k="${c.id}"><span class="e">${c.e}</span>${esc(c.n.replace(/ \(.*\)/, ''))}</button>`).join('');
}
function lineRow(l, i) {
  const c = catOf(l.cat);
  return `<div class="line" data-i="${i}"><button class="catbtn" data-act="cp-linecat" data-i="${i}" aria-label="Rubro" style="background:${c.c}22">${c.e}</button>
  <input class="inp" data-f="ln" data-i="${i}" list="dl-items" placeholder="Ítem (ej: Atún)" value="${esc(l.n)}" autocomplete="off">
  <input class="inp num" data-f="lm" data-i="${i}" inputmode="decimal" placeholder="Monto" value="${l.monto ? fmtInput(l.monto) : ''}" autocomplete="off">
  <button class="x" data-act="cp-delline" data-i="${i}" aria-label="Quitar">${IC.x}</button></div>`;
}
function cpFoot() {
  const tot = cpTotal();
  return `<button class="btn primary" data-act="cp-save" id="btn-save">${CP.id ? 'Guardar cambios' : CP.tipo === 'gasto' ? 'Guardar gasto' : CP.tipo === 'ingreso' ? 'Guardar ingreso' : 'Guardar'}${tot ? ' · ' + money(tot) : ''}</button>`;
}
function cpAfter() {
  const q = $('#quick'); if (q) { q.focus(); q.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); quickParse(q.value); } }; }
}
function cpRefresh() { const d = SHEETS.find(s => s.id === 'cp'); if (d) paintSheet(d); }
function ttChk() {
  if (!CP.totalTicket) return ''; const d = r2(CP.totalTicket - cpTotal());
  return Math.abs(d) < 1 ? '<span class="pill pos">✓ Coincide con el ticket</span>' : d > 0 ? `<span class="pill warn">Faltan ${money(d)} para llegar al total</span> <button class="link" data-act="cp-resto">Agregar como “Sin detallar”</button>` : `<span class="pill neg">Te pasaste por ${money(-d)}</span>`;
}
function cpUpdMini() {
  const tc = $('#tt-chk'); if (tc) tc.innerHTML = ttChk();
  const imp = $('#imp'); if (imp) imp.innerHTML = impText();
  const b = $('#btn-save'); if (b) b.textContent = (CP.id ? 'Guardar cambios' : CP.tipo === 'gasto' ? 'Guardar gasto' : CP.tipo === 'ingreso' ? 'Guardar ingreso' : 'Guardar') + (cpTotal() ? ' · ' + money(cpTotal()) : '');
  const st = $('#split-total'); if (st) st.textContent = fmtInput(cpTotal()) || '0';
}
function cpInput(f, v, el) {
  if (!CP) return;
  if (f === 'monto') CP.monto = parseMonto(v);
  else if (f === 'com') { CP.com = v; if (!CP.split && CP.catAuto) { const c = clasificar(v, ''); if (c) { CP.cat = c; const g = $('#cat-grid'); if (g) g.innerHTML = catGrid(); } } }
  else if (f === 'nota') CP.nota = v;
  else if (f === 'fecha') { if (v) { CP.fecha = v; if (CP.mesPago && CP.mesPago < v.slice(0, 7)) CP.mesPago = null; } }
  else if (f === 'ln') { const i = +el.dataset.i, l = CP.lines[i]; l.n = v; if (l.auto !== false) { const c = clasificar(v, CP.com); if (c) { l.cat = c; const b = el.parentElement.querySelector('.catbtn'); const cc = catOf(c); b.textContent = cc.e; b.style.background = cc.c + '22'; } } }
  else if (f === 'lm') { CP.lines[+el.dataset.i].monto = parseMonto(v); }
  else if (f === 'tt') CP.totalTicket = parseMonto(v);
  cpUpdMini();
}
function quickParse(txt) {
  const t = norm(txt); const toks = txt.split(/\s+/);
  let monto = 0, resto = [];
  for (const tk of toks) { const n = parseMonto(tk); if (!monto && /^\$?[\d.,]+(k|mil)?$/i.test(tk) && n > 0) monto = n; else resto.push(tk); }
  let medio = null;
  const rr = resto.filter(w => { const x = norm(w); if (/^(efectivo|cash)$/.test(x)) { medio = 'ef'; return false; } if (/^(debito|deb)$/.test(x)) { medio = 'deb'; return false; } if (/^(transferencia|transf|mp|mercadopago)$/.test(x)) { medio = 'tr'; return false; } for (const m of cfg().tarjetas) if (norm(m.n).split(' ').pop() === x || m.id === x) { medio = m.id; return false; } return true; });
  CP.monto = monto; CP.com = rr.join(' ').replace(/^./, c => c.toUpperCase()); if (medio) { CP.medio = medio; CP.medioTouched = true; }
  const c = clasificar(CP.com, ''); if (c) { CP.cat = c; CP.catAuto = true; } CP.quick = false; cpRefresh();
  setTimeout(() => { const m = $('#monto'); if (m && !CP.monto) m.focus(); }, 50);
}
/* --- Ticket: foto de respaldo, texto pegado y autocompletado (sin IA) --- */
async function reducir(file) {
  try {
    const bmp = await createImageBitmap(file); const k = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(b => r(b || file), 'image/jpeg', 0.82));
  } catch (e) { return file; }
}
async function adjuntarFoto(files) {
  files = [].concat(files).slice(0, (S.cap.imgLimits && S.cap.imgLimits.maxCount) || 4);
  CP.scan = { state: 'loading' }; cpRefresh();
  let blobs; try { blobs = await Promise.all(files.map(reducir)); } catch (e) { blobs = files; }
  if (!CP) return;
  if (CP.foto && CP.foto.url) URL.revokeObjectURL(CP.foto.url);
  CP.foto = { blob: blobs[0], blobs, url: URL.createObjectURL(blobs[0]) };
  if (!S.cap.sample) { try { S.cap.sample = await window.claude.use('sample'); if (S.cap.sample && S.cap.sample.limits) { const l = await S.cap.sample.limits(); S.cap.images = !!l.images; } } catch (e) { S.cap.sample = null; } }
  if (S.cap.sample) { await leerTicket(blobs); return; }
  CP.scan = { state: 'error', msg: 'La lectura automática no llegó a esta cuenta (Claude no habilitó esa función para este usuario o visor; podés ver el detalle en Ajustes > Diagnóstico). La foto queda de respaldo: cargá el total y el rubro, o dividí en ítems o pegá el texto del ticket.' };
  cpRefresh();
}
function promptTicket(texto) {
  const cats = cfg().cats.map(c => `- ${c.id}: ${c.n}${CAT_HINTS[c.id] ? ' (' + CAT_HINTS[c.id] + ')' : ''}`).join('\n');
  const ej = Object.entries(S.apr).slice(0, 80).map(([k, v]) => `${k.replace(/_/g, ' ')} → ${v}`).join('; ');
  return `Sos el lector de comprobantes de una app de economía familiar argentina. ${texto ? 'El texto al final es UN solo comprobante copiado y pegado (puede traer ruido: encabezados, CUIT, datos fiscales, publicidad, que debés ignorar)' : 'Las imágenes adjuntas son UN solo comprobante (puede estar en varias fotos)'}: ticket de supermercado, factura, comprobante de transferencia o Mercado Pago, viaje de Uber/Cabify, recibo, etc. Hoy es ${hoy()}.
Respondé SOLO con un JSON con esta forma:
{"total": number, "medio": "efectivo"|"debito"|"credito_visa"|"credito_master"|"transferencia"|null, "tipoDoc": string, "items": [{"n": string, "d": string, "cant": number, "monto": number, "cat": string}], "aviso": string o null}
Reglas:
- "n": nombre corto, genérico y capitalizado del producto, sin marca ni gramaje ni cantidades (ej: "Atún", "Aceite de girasol", "Papel higiénico", "Milanesas de pollo"). Así el mismo producto se agrupa entre compras.
- "d": el texto original de la línea. "cant": unidades o kilos (1 si no se sabe). "monto": importe TOTAL de esa línea en pesos, con descuentos de línea ya aplicados.
- Números con punto decimal, sin símbolos: "1.234,56" se lee 1234.56.
- Incluí TODAS las líneas del ticket. La suma de "monto" debe ser igual a "total". Si hay un descuento general, repartilo o agregalo como una línea con monto negativo llamada "Descuento".
- Si el comprobante es de una sola cosa (Uber, una transferencia, una factura de servicio), devolvé un único ítem.
- "cat": SOLO uno de estos ids de rubro:
${cats}
- Si algo no se lee, no lo inventes: usá null o dejalo fuera y explicalo en "aviso".
${ej ? 'Preferencias de la familia para clasificar (producto → rubro): ' + ej + '.' : ''}${texto ? '\n\nTexto del comprobante:\n"""\n' + texto.slice(0, 12000) + '\n"""' : ''}`;
}
async function leerTicket(blobs) {
  CP.scan = { state: 'loading' }; cpRefresh();
  try {
    const r = await S.cap.sample.json(promptTicket(), { images: blobs, modelTier: 'default', cache: false });
    if (!CP) return; aplicarScan(r);
  } catch (e) {
    if (!CP) return;
    const code = (e && e.code) || 'desconocido';
    const m = { not_granted: 'Para leer la foto necesito tu permiso para usar Claude. Volvé a subirla y aceptá el aviso.', rate_limited: 'Se alcanzó el límite de uso de Claude por ahora. Probá en un rato o cargalo a mano.', image_rejected: 'No pude abrir esa imagen. Probá con otra foto.', invalid_json: 'No logré armar el detalle. Probá con una foto más nítida y completa.', images_unavailable: 'La lectura de fotos no está disponible en esta vista.' }[e && e.code] || 'No pude leer el comprobante. Probá de nuevo o cargalo a mano.';
    console.warn('lectura de ticket', e);
    CP.scan = { state: 'error', msg: m + ' (código: ' + code + '). Mientras tanto cargá el total y el rubro, o pegá el texto del ticket.' }; cpRefresh();
  }
}
function aplicarScan(r) {
  r = r || {}; const catIds = new Set(cfg().cats.map(c => c.id));
  const lines = (Array.isArray(r.items) ? r.items : []).map(it => {
    const n = String(it.n || it.d || 'Ítem').slice(0, 60); let cat = catIds.has(it.cat) ? it.cat : null;
    const k = keyOf(n); if (S.apr[k] && catIds.has(S.apr[k])) cat = S.apr[k]; if (!cat) cat = clasificar(n, '') || 'otros';
    return { n, d: it.d ? String(it.d).slice(0, 120) : '', cant: +it.cant || 1, monto: r2(+it.monto || 0), cat, auto: true };
  }).filter(l => l.monto !== 0);
  if (!lines.length && !(+r.total > 0)) { CP.scan = { state: 'error', msg: 'No encontré importes en la imagen. Probá con otra foto o cargalo a mano.' }; cpRefresh(); return; }
  CP.fecha = hoy();
  const mm = { efectivo: 'ef', debito: 'deb', credito_visa: 'visa', credito_master: 'master', transferencia: 'tr' }[r.medio];
  if (mm && medios().some(m => m.id === mm) && !CP.medioTouched) CP.medio = mm;
  const total = +r.total || 0, s = r2(sum(lines, l => l.monto)); CP.warn = null; if (total) CP.totalTicket = total;
  if (lines.length > 1) {
    const grande = Math.abs(total - s) > Math.max(500, total * 0.03);
    if (total && s < total - 1) { lines.push({ n: 'Sin detallar', d: '', cant: 1, monto: r2(total - s), cat: 'otros', auto: false }); if (grande) CP.warn = `Los ítems leídos sumaban ${money(s)} y el ticket dice ${money(total)}. Puede faltar alguno: la línea “Sin detallar” cubre la diferencia y la podés editar.`; }
    else if (total && s > total + 1 && grande) CP.warn = `Los ítems suman ${money(s)} y el ticket dice ${money(total)}. Revisá los importes.`;
  }
  if (lines.length > 1) { CP.split = true; CP.lines = lines; CP.monto = 0; }
  else { CP.split = false; const l = lines[0] || { n: '', monto: total, cat: 'otros' }; CP.monto = l.monto || total; CP.cat = l.cat; CP.catAuto = false; if (!CP.com && l.n) CP.com = l.n; }
  CP.scan = { state: 'ok', msg: `Listo: ${lines.length > 1 ? lines.length + ' ítems' : '1 ítem'} · ${r.tipoDoc || 'comprobante'}. Revisá los importes y elegí cómo pagaste.${r.aviso ? ' ' + r.aviso : ''}` };
  cpRefresh();
}
const tituloCaso = s => s.toLowerCase().replace(/(^|\s)([a-zñáéíóú])/g, (m, a, b) => a + b.toUpperCase());
function parsearTicket(txt) {
  const out = []; let total = 0; let com = '';
  const primera = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean)[0] || ''; if (primera && !/\d[.,]\d{2}/.test(primera) && primera.length < 50) com = tituloCaso(primera);
  const SKIP = /^(subtotal|sub total|iva|efectivo|cambio|vuelto|tarjeta|debito|credito|descuento total|ahorro|cuit|fecha|hora|ticket|factura|comprobante|cajero|caja|sucursal|gracias|redondeo|importe|pago|cant|precio|art[ií]culo|descripci[oó]n|punto de venta|nro|n[uú]mero|you saved|cod)/i;
  for (let l of txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean)) {
    const m = l.match(/(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+[.,]\d{2})\s*[A-Za-z]{0,2}$/); if (!m) continue;
    const monto = parseMonto(m[1]); if (!monto) continue;
    let name = l.slice(0, m.index).trim();
    if (/^total\b/i.test(l) || /^total\b/i.test(name)) { total = monto; continue; }
    if (SKIP.test(name) || !name) continue;
    let cant = 1; const q = name.match(/^(\d+(?:[.,]\d+)?)\s*[xX*]\s*/); if (q) { cant = parseMonto(q[1]) || 1; name = name.slice(q[0].length); }
    name = name.replace(/-?\d+[.,]\d{2}/g, ' ').replace(/\b\d+([.,]\d+)?\s*(g|gr|grs|kg|kgs|ml|cc|l|lt|lts|u|un|unid)\b/gi, ' ').replace(/\b\d{4,}\b/g, ' ').replace(/\s+[xX]\s*\d+\b/g, ' ').replace(/[*#]+/g, ' ').replace(/\s+/g, ' ').trim();
    const letras = (name.match(/[a-zA-ZñÑáéíóúÁÉÍÓÚ]/g) || []).length; if (name.length < 3 || letras < 3 || letras / name.length < 0.5 || /cuit|ing\.? ?brutos|www|http|@|tel[eé]fono|\btel\b|iva\b|resp\.? ?inscripto|monotributo|domicilio|av\.|calle|\bcp\b|c\.?p\.?\s?\d|ticket n|n[°º]/i.test(name)) continue;
    const n = tituloCaso(name).slice(0, 60); const k = keyOf(n);
    out.push({ n, d: l.slice(0, 120), cant, monto: r2(monto), cat: S.apr[k] || clasificar(n, '') || 'otros', auto: true });
  }
  return { lines: out, total, com };
}
function abrirPegar() {
  openSheet({
    id: 'pegar', title: 'Pegar texto del ticket',
    body: () => `<div class="help">Copiá el texto de un ticket digital, un mail de compra o un PDF y pegalo acá. Claude separa cada ítem con su importe y lo asigna a su rubro.</div><div class="field"><label>Imagen copiada (opcional)</label><div id="paste-zone" contenteditable="true" role="textbox" aria-label="Pegar imagen" class="inp" style="min-height:64px;border:2px dashed var(--line);display:grid;place-items:center;color:var(--muted)" data-ph="Mantené apretado acá y elegí Pegar (sirve una captura o foto que hayas copiado)"></div></div><div class="field"><label for="paste-txt">Texto del ticket</label><textarea class="inp" id="paste-txt" rows="8" placeholder="Ej:&#10;ATUN GOMEZ PARDO 170G   1.850,00&#10;2 x ACEITE GIRASOL 900ML   5.400,00&#10;TOTAL   7.250,00" style="resize:vertical;font-family:inherit"></textarea>`,
    foot: () => '<button class="btn primary" data-act="paste-ok">Armar ítems</button>'
  });
}
function aplicarPegadoLocal(txt) {
  const r = parsearTicket(txt);
  if (!r.lines.length) { toast('No encontré líneas con importe. Pegá el ticket completo.', null, true); return false; }
  const vacias = CP.split ? CP.lines.filter(l => l.n || l.monto) : [];
  CP.split = true; CP.lines = [...vacias, ...r.lines]; CP.monto = 0; if (r.total) CP.totalTicket = r.total;
  CP.scan = { state: 'ok', msg: `${r.lines.length} ítems armados con reglas simples. Revisá nombres, rubros e importes.` }; return true;
}
async function leerTexto(txt) {
  if (S.cap.sample) {
    CP.scan = { state: 'loading' }; cpRefresh();
    try {
      const r = await S.cap.sample.json(promptTicket(txt), { modelTier: 'default', cache: false });
      if (!CP) return; aplicarScan(r); return;
    } catch (e) { console.warn('lectura de texto', e); if (!CP) return; CP.scan = { state: 'idle' }; }
  }
  if (aplicarPegadoLocal(txt)) cpRefresh(); else cpRefresh();
}
let KNOWN = null;
function knownItems() {
  const m = new Map();
  for (const mv of S.movs.slice().sort((a, b) => a.fecha.localeCompare(b.fecha))) if (mv.tipo === 'gasto' && mv.src !== 'backlog') for (const it of mv.items || []) if (it.n) m.set(keyOf(it.n), { n: it.n, cat: it.cat, last: (it.monto / (it.cant || 1)) });
  return m;
}
const addDay = (f, k) => { const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() + k); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

async function cpSave() {
  const tot = cpTotal(); if (!(tot > 0) && !(CP.tipo === 'fondo' && CP.sub === 'rendimiento' && tot !== 0)) { toast('Falta el monto.', null, true); return; }
  const base = { por: CP.por, fecha: CP.fecha, creado: CP.creado || new Date().toISOString() };
  const id = CP.id || uid(); let docs = []; const metaId = CP.metaId;
  if (CP.tipo === 'gasto') {
    let items = CP.split ? CP.lines.filter(l => l.monto).map(l => ({ n: (l.n || '').trim() || catOf(l.cat).n, d: l.d || '', cant: l.cant || 1, monto: r2(+l.monto), cat: l.cat })) : [{ n: (CP.com || '').trim() || catOf(CP.cat).n, cant: 1, monto: r2(tot), cat: CP.cat }];
    if (!items.length) { toast('Agregá al menos un ítem con monto.', null, true); return; }
    const mes0 = cpMes(), card = esTarjeta(CP.medio) && !CP.pagoFondo;
    const n = card && !CP.id ? CP.cuotas : 1, gr = n > 1 ? uid() : (CP.grupo || null);
    for (let i = 0; i < n; i++) {
      const k = n > 1 ? 1 / n : 1;
      const its = items.map(it => ({ ...it, monto: r2(it.monto * k) }));
      docs.push({ id: i === 0 ? id : uid(), data: { ...base, tipo: 'gasto', medio: CP.medio, com: (CP.com || '').trim(), nota: CP.nota || '', items: its, total: r2(sum(its, x => x.monto)), mes: addM(mes0, i), ...(CP.pagoFondo ? { pagoFondo: CP.pagoFondo } : {}), ...(gr ? { grupo: gr } : {}), ...(n > 1 ? { cuota: { i: i + 1, n } } : (CP.cuota ? { cuota: CP.cuota } : {})), src: CP.src || 'manual', ...(CP.planId ? { planId: CP.planId } : {}) } });
    }
    lsSet('ef_medio', CP.medio);
    const nuevos = {}; items.forEach(it => { const k = keyOf(it.n); if (it.n && S.apr[k] !== it.cat) nuevos[k] = it.cat; });
    if (Object.keys(nuevos).length) Store.merge('cfg', 'aprendido', nuevos).catch(() => { });
  } else if (CP.tipo === 'ingreso') {
    const c = ingCatOf(CP.ingCat); docs.push({ id, data: { ...base, tipo: 'ingreso', cat: CP.ingCat, com: (CP.com || '').trim(), items: [{ n: (CP.com || '').trim() || c.n, cat: CP.ingCat, monto: r2(tot), cant: 1 }], total: r2(tot), mes: CP.fecha.slice(0, 7), medio: 'tr', src: CP.src || 'manual', ...(CP.planId ? { planId: CP.planId } : {}) } });
  } else {
    docs.push({ id, data: { ...base, tipo: CP.sub, fondo: CP.fondo, total: r2(tot), mes: CP.fecha.slice(0, 7), com: '', items: [], src: CP.src || 'manual' } });
  }
  if (CP.foto && S.cap.assets && CP.tipo === 'gasto') {
    try { const up = await S.cap.assets.upload(CP.foto.blob); if (up && up.url) docs[0].data.img = { id: up.id, url: up.url }; } catch (e) { /* sin permiso para subir fotos: se guarda igual */ }
  } else if (CP.img && CP.tipo === 'gasto') docs[0].data.img = CP.img;
  const ok = await guardar(async () => { for (const d of docs) await Store.set('mov', d.id, d.data); });
  if (ok) {
    const def = SHEETS.find(s => s.id === 'cp'); closeSheet(def); toast(docs.length > 1 ? `Guardado en ${docs.length} cuotas` : 'Guardado ✓');
    if (metaId) { const x = S.metas.items.find(i => i.id === metaId); if (x) { x.hecha = true; x.real = tot; saveMetas().catch(() => { }); } }
  }
}

/* ============ DETALLE DE UN MOVIMIENTO ============ */
function abrirMov(id) {
  const m = S.movs.find(x => x.id === id); if (!m) return;
  let agrupar = false, confirmar = false;
  const def = openSheet({
    title: () => mvTitle(m),
    body: () => {
      const c = mainCat(m); const its = (m.items || []);
      let h = `<div class="row"><span class="ico" style="background:${c.c}22">${c.e}</span><div class="grow"><div class="disp num" style="font-size:32px;font-weight:800">${money(m.total)}</div><div class="hint">${fechaLarga(m.fecha)}</div></div></div>
      <div class="chips">${m.tipo === 'gasto' ? `<span class="pill">${esc(medioOf(m.medio).n)}</span>` : ''}${m.mes !== m.fecha.slice(0, 7) ? `<span class="pill acc">se paga en ${ymLabel(m.mes)}</span>` : `<span class="pill">cuenta en ${ymLabel(m.mes)}</span>`}<span class="pill">cargó ${esc(m.por || '—')}</span>${m.cuota ? `<span class="pill warn">cuota ${m.cuota.i} de ${m.cuota.n}</span>` : ''}${m.pagoFondo ? `<span class="pill pos">con fondo ${esc((destOf(m.pagoFondo) || {}).n || '')}</span>` : ''}${m.src === 'plan' ? '<span class="pill">del plan</span>' : ''}${m.src === 'backlog' ? '<span class="pill">saldo anterior</span>' : ''}</div>`;
      if (m.nota) h += `<div class="note">${esc(m.nota)}</div>`;
      if (m.img && m.img.url) h += `<img src="${esc(m.img.url)}" alt="Foto del ticket" style="width:100%;max-height:260px;object-fit:cover;border-radius:14px">`;
      if (m.tipo === 'gasto' && its.length) {
        h += `<div class="card flat" style="padding:6px 14px"><div class="row" style="justify-content:space-between;padding:6px 0"><b>${its.length} ${its.length > 1 ? 'ítems' : 'ítem'}</b>${its.length > 1 ? `<button class="link" data-act="mov-agrupar">${agrupar ? 'Ver ítem por ítem' : 'Agrupar por rubro'}</button>` : ''}</div>`;
        if (agrupar) {
          const g = {}; its.forEach(i => { (g[i.cat] = g[i.cat] || []).push(i); });
          Object.entries(g).sort((a, b) => sum(b[1], x => x.monto) - sum(a[1], x => x.monto)).forEach(([cid, arr]) => { const cc = catOf(cid); h += `<div class="mv"><span class="ico sm" style="background:${cc.c}22">${cc.e}</span><span class="grow"><div class="t">${esc(cc.n)}</div><div class="s">${arr.length} ${arr.length > 1 ? 'ítems' : 'ítem'}</div></span><span class="a num">${money(sum(arr, x => x.monto))}</span></div>`; });
        } else its.forEach(i => { const cc = catOf(i.cat); h += `<div class="mv"><span class="ico sm" style="background:${cc.c}22">${cc.e}</span><span class="grow"><div class="t ell">${esc(i.n)}${i.cant > 1 ? ` <span class="muted">×${i.cant}</span>` : ''}</div><div class="s ell">${esc(cc.n)}${i.d && i.d !== i.n ? ' · ' + esc(i.d) : ''}</div></span><span class="a num">${money(i.monto)}</span></div>`; });
        h += '</div>';
      }
      return h;
    },
    foot: () => confirmar
      ? `<button class="btn" data-act="mov-cancel-del">No, volver</button><button class="btn danger" data-act="mov-del2">${m.grupo && m.cuota ? 'Sí, borrar todas las cuotas' : 'Sí, eliminar'}</button>`
      : `<button class="btn danger" data-act="mov-del" aria-label="Eliminar">${IC.trash}</button><button class="btn primary" data-act="mov-edit">Editar</button>`,
    m, get agrupar() { return agrupar; }, set agrupar(v) { agrupar = v; }, set confirmar(v) { confirmar = v; }
  });
}

/* ============ PLAN: confirmar cobros y pagos ============ */
function mesFecha(ym) { return ym === ymNow() ? hoy() : (ym < ymNow() ? ym + '-' + pad(Math.min(daysIn(ym), 28)) : ym + '-01'); }
function abrirPlanRow(id) {
  const ym = S.mes; const row = checklist(ym).find(r => r.it.id === id); if (!row) return;
  const it = row.it; const done = row.real; let monto = done ? done.total : row.plan; let medio = it.medio || (it.tipo === 'gasto' ? 'ef' : 'tr'); let fecha = done ? done.movs[0].fecha : mesFecha(ym);
  const e = it.tipo === 'aporte' ? it.e : (it.tipo === 'ingreso' ? ingCatOf(it.cat).e : catOf(it.cat).e);
  openSheet({
    id: 'plan', title: () => (it.tipo === 'ingreso' ? 'Cobro: ' : it.tipo === 'aporte' ? '' : 'Pago: ') + it.n,
    body: () => `<div class="row"><span class="ico">${e}</span><div class="grow"><div class="hint">Previsto para ${ymName(ym).toLowerCase()}</div><div class="disp num" style="font-size:24px;font-weight:800">${money(row.plan)}</div></div>${done ? '<span class="pill pos">registrado</span>' : ''}</div>
      <div class="field"><label for="pl-monto">${done ? 'Monto registrado' : 'Monto real'}</label><div class="amount-wrap"><span class="cur">$</span><input id="pl-monto" inputmode="decimal" value="${fmtInput(monto)}" autocomplete="off"></div>${it.pct ? '<div class="hint">El diezmo se calcula solo con los ingresos del mes; corregilo si diste otro monto.</div>' : ''}</div>
      ${it.tipo === 'gasto' ? `<div class="field"><label>Cómo lo pagaste</label><div class="chips">${medios().map(m => `<button class="chip ${medio === m.id ? 'on' : ''}" data-act="pl-medio" data-k="${m.id}">${esc(m.n)}</button>`).join('')}</div></div>` : ''}
      <div class="field"><label for="pl-fecha">Fecha</label><input class="inp" type="date" id="pl-fecha" value="${fecha}"></div>`,
    foot: () => (done ? `<button class="btn danger" data-act="pl-undo">Deshacer</button>` : '') + `<button class="btn ${it.tipo === 'ingreso' ? 'pos' : 'primary'}" data-act="pl-ok">${done ? 'Guardar cambio' : it.tipo === 'ingreso' ? 'Cobré' : it.tipo === 'aporte' ? 'Aporté' : 'Pagué'}</button>`,
    it, row, ym, get medio() { return medio; }, set medio(v) { medio = v; }, getMonto: () => parseMonto($('#pl-monto').value), getFecha: () => $('#pl-fecha').value || fecha
  });
}
function movDesdePlan(it, ym, monto, fecha, medio) {
  const base = { por: userName(), fecha, creado: new Date().toISOString(), mes: ym, planId: it.id, src: 'plan', total: r2(monto), com: '' };
  if (it.tipo === 'ingreso') return { ...base, tipo: 'ingreso', cat: it.cat, medio: 'tr', items: [{ n: it.n, cat: it.cat, monto: r2(monto), cant: 1 }] };
  if (it.tipo === 'aporte') return { ...base, tipo: 'aporte', fondo: it.fondo, items: [] };
  return { ...base, tipo: 'gasto', medio: medio || 'ef', items: [{ n: it.n, cat: it.cat, monto: r2(monto), cant: 1 }] };
}
async function planOk(def) {
  const monto = def.getMonto(); if (!(monto > 0)) { toast('Falta el monto.', null, true); return; }
  const { it, row, ym } = def;
  const ok = await guardar(async () => {
    if (row.real) { const [first, ...rest] = row.real.movs; const nm = { ...first, total: r2(monto), fecha: def.getFecha() }; if (nm.items && nm.items[0]) nm.items = [{ ...nm.items[0], monto: r2(monto) }]; await Store.set('mov', first.id, nm); for (const r of rest) await Store.del('mov', r.id); }
    else await Store.set('mov', uid(), movDesdePlan(it, ym, monto, def.getFecha(), def.medio));
  });
  if (ok) { closeSheet(def); toast('Registrado ✓'); }
}
function abrirPlanTodo() {
  const ym = S.mes; const pend = checklist(ym).filter(r => !r.real && r.plan > 0);
  const tipoTot = t => sum(pend.filter(r => r.it.tipo === t), r => r.plan);
  openSheet({
    title: 'Confirmar lo pendiente',
    body: () => `<div class="help">Se registran todos con el monto previsto y la fecha de hoy. Después podés corregir cualquiera tocándolo.</div><div class="card flat" style="padding:6px 14px">${pend.map(r => `<div class="mv"><span class="grow"><div class="t ell">${esc(r.it.n)}</div><div class="s">${r.it.tipo === 'ingreso' ? 'cobro' : r.it.tipo === 'aporte' ? 'aporte' : 'pago'}</div></span><span class="a num">${money(r.plan)}</span></div>`).join('')}</div>
      <div class="note">Cobros ${money(tipoTot('ingreso'))} · Pagos ${money(tipoTot('gasto'))} · Aportes ${money(tipoTot('aporte'))}</div>`,
    foot: () => `<button class="btn primary" data-act="pt-ok">Confirmar ${pend.length}</button>`, pend, ym
  });
}
async function planTodoOk(def) {
  const f = mesFecha(def.ym);
  const ok = await guardar(async () => { for (const r of def.pend) { const cur = checklist(def.ym).find(x => x.it.id === r.it.id); if (cur && !cur.real) await Store.set('mov', uid(), movDesdePlan(r.it, def.ym, r.plan, f, r.it.medio || 'ef')); } });
  if (ok) { closeSheet(def); toast(`${def.pend.length} confirmados ✓`); }
}

/* ============ FONDOS ============ */
const PALETA = ['#2a78d6', '#6250d6', '#0e8fa8', '#1baf7a', '#eda100', '#eb6834', '#e0457b', '#9a6b3f', '#8792a4', '#008300'];
function abrirFondo(id) {
  const d = destOf(id); if (!d) return;
  let plazo = d.plazo || 12, tasa = cfg().tasa, aporte = aportePlan(d, S.mes);
  const def = openSheet({
    id: 'fondo', title: () => d.e + ' ' + d.n,
    body: () => {
      const saldo = saldoFondo(d, S.mes); const tc = cfg().tc;
      const serie = rmFondo(d, tasa, plazo, saldo, aporte, tc); const fin = serie[serie.length - 1]; const gan = fin.v - fin.ap;
      const hist = S.movs.filter(m => m.fondo === d.id || m.pagoFondo === d.id).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 8);
      const need = d.meta > 0 ? aporteNecesario(d.meta, saldo, plazo, tasa, tc) : 0;
      let h = `<div><div class="eyebrow">Saldo confirmado al cierre de ${ymName(S.mes).toLowerCase()}</div><div class="disp num" style="font-size:34px;font-weight:800">${money(saldo)}</div><div class="hint">≈ ${usd(saldo / tc)}</div></div>`;
      if (d.meta > 0) h += `<div><div class="row" style="justify-content:space-between"><b>Meta ${money(d.meta)}</b><span class="pill acc">${Math.min(100, pct(saldo, d.meta))}%</span></div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100, saldo / d.meta * 100)}%;background:${d.c}"></i></div></div>`;
      h += `<div class="card flat"><h2>Proyección</h2><div class="grid3" style="grid-template-columns:1fr 1fr 1fr">
        <div class="field"><label for="fp-aporte">Aporte / mes</label><input class="inp num" id="fp-aporte" data-f="fp-aporte" inputmode="decimal" value="${fmtInput(aporte)}"></div>
        <div class="field"><label for="fp-plazo">Meses</label><input class="inp num" id="fp-plazo" data-f="fp-plazo" inputmode="numeric" value="${plazo}"></div>
        <div class="field"><label for="fp-tasa">Rend. anual %</label><input class="inp num" id="fp-tasa" data-f="fp-tasa" inputmode="decimal" value="${String(tasa).replace('.', ',')}"></div></div>
        <div class="sp"></div>
        ${lineas('fp', [{ pts: serie.map(x => x.v * tc), c: d.c, area: true }, { pts: serie.map(x => x.ap * tc), c: 'var(--muted)', dash: true }], { 0: 'hoy', [plazo]: plazo >= 24 ? Math.round(plazo / 12) + ' años' : plazo + ' m' }, { def: 'Tocá el gráfico', tip: i => `Mes ${i}: ${money(serie[i].v * tc)} (aportaste ${money(serie[i].ap * tc)})`, label: 'Proyección del fondo' })}
        <div class="kpis" style="margin-top:10px"><div class="kpi"><div class="eyebrow">En ${plazo >= 24 ? (plazo / 12).toFixed(1).replace('.', ',') + ' años' : plazo + ' meses'}</div><div class="v num">${money(fin.v * tc)}</div><div class="d muted">${usd(fin.v)}</div></div>
        <div class="kpi"><div class="eyebrow">Rendimiento ganado</div><div class="v num pos">${money(gan * tc)}</div><div class="d muted">de ${money(fin.ap * tc)} aportados</div></div></div>
        ${d.meta > 0 ? `<div class="note" style="margin-top:10px">${need <= aporte ? '✅ Con este aporte llegás a la meta' : `Para llegar a ${money(d.meta)} en ${plazo} meses necesitás aportar <b>${money(need)}</b> por mes (hoy ${money(aporte)}).`}</div>` : ''}
        <div class="hint" style="margin-top:8px">Supuestos: rendimiento constante, tipo de cambio fijo en $ ${miles(tc)}, aportes a fin de cada mes. No es una promesa de rendimiento.</div></div>`;
      if (hist.length) h += `<div class="card flat" style="padding:6px 14px"><div class="group-h" style="margin-top:8px">Movimientos</div>${hist.map(m => mvRow(m, { noimp: true })).join('')}</div>`;
      return h;
    },
    foot: () => `<button class="btn" data-act="fondo-edit" data-id="${d.id}">Editar</button><button class="btn primary" data-act="aportar" data-id="${d.id}">Aporté</button>`,
    set: (k, v) => { if (k === 'aporte') aporte = parseMonto(v); if (k === 'plazo') plazo = Math.max(1, Math.min(720, parseInt(v) || 1)); if (k === 'tasa') tasa = Math.max(0, Math.min(60, parseMonto(String(v).replace(',', '.')) || 0)); },
    paintKeep: true
  });
}
function abrirFondoEdit(id) {
  const base = id ? clone(destOf(id)) : { id: 'f' + uid(), n: '', e: '💰', c: PALETA[cfg().destinos.length % PALETA.length], aporte: 0, saldo0: 0, plazo: 12, meta: 0 };
  const nuevo = !id; const d = base;
  openSheet({
    id: 'fedit', title: () => nuevo ? 'Nuevo destino' : 'Editar ' + d.n,
    body: () => `<div class="grid3" style="grid-template-columns:70px 1fr"><div class="field"><label for="fe-e">Ícono</label><input class="inp" id="fe-e" data-f="fe-e" value="${esc(d.e)}" maxlength="4" style="text-align:center;font-size:20px"></div><div class="field"><label for="fe-n">Nombre</label><input class="inp" id="fe-n" data-f="fe-n" value="${esc(d.n)}" placeholder="Ej: Vacaciones"></div></div>
    <div class="field"><label>Color</label><div class="chips">${PALETA.map(c => `<button class="chip ${d.c === c ? 'on' : ''}" data-act="fe-color" data-k="${c}" style="padding:0;width:38px;height:38px;justify-content:center"><span class="dot" style="background:${c};width:18px;height:18px;border-radius:50%"></span></button>`).join('')}</div></div>
    <div class="field"><label>Cómo se calcula el aporte</label><div class="seg"><button class="${d.modo !== 'pct' ? 'on' : ''}" data-act="fe-modo" data-k="monto">Monto fijo</button><button class="${d.modo === 'pct' ? 'on' : ''}" data-act="fe-modo" data-k="pct">% de lo que sobra</button></div></div>
    ${d.modo === 'pct' ? `<div class="field"><label for="fe-pct">Porcentaje de lo que sobra cada mes</label><input class="inp num" id="fe-pct" data-f="fe-pct" inputmode="decimal" value="${String(+d.pct || 0).replace('.', ',')}"></div>` : `<div class="field"><label for="fe-a">Aporte mensual previsto ($)</label><input class="inp num" id="fe-a" data-f="fe-a" inputmode="decimal" value="${fmtInput(d.aporte)}"></div>`}
    <div class="field"><label for="fe-s">Saldo con el que arrancás ($)</label><input class="inp num" id="fe-s" data-f="fe-s" inputmode="decimal" value="${fmtInput(d.saldo0)}"><div class="hint">Lo que ya tenés guardado en este destino hoy.</div></div>
    <div class="grid3" style="grid-template-columns:1fr 1fr"><div class="field"><label for="fe-p">Plazo (meses)</label><input class="inp num" id="fe-p" data-f="fe-p" inputmode="numeric" value="${d.plazo || ''}"></div><div class="field"><label for="fe-m">Meta ($, opcional)</label><input class="inp num" id="fe-m" data-f="fe-m" inputmode="decimal" value="${fmtInput(d.meta)}"></div></div>
    ${!nuevo ? `<button class="btn danger block" data-act="fe-del">Eliminar destino</button>` : ''}`,
    foot: () => `<button class="btn primary" data-act="fe-save">Guardar</button>`, d, nuevo
  });
}

/* ============ ÍTEM (historial y proyección) ============ */
function abrirItem(key) {
  const o = statsItems(null, null).find(x => x.key === key);
  if (!o) { toast('Todavía no hay compras de ese ítem.', null, true); return; }
  const p = proyItem(o); const c = catOf(o.cat);
  const hist = o.hist.sort((a, b) => a.f.localeCompare(b.f)); const unit = hist.map(h => h.monto / (h.cant || 1));
  openSheet({
    title: () => o.n,
    body: () => `<div class="row"><span class="ico" style="background:${c.c}22">${c.e}</span><div class="grow"><div class="disp num" style="font-size:30px;font-weight:800">${money(o.total)}</div><div class="hint">${esc(c.n)} · ${o.veces} ${o.veces > 1 ? 'compras' : 'compra'}</div></div></div>
    <div class="kpis"><div class="kpi"><div class="eyebrow">Promedio por compra</div><div class="v num">${money(o.total / o.veces)}</div></div><div class="kpi"><div class="eyebrow">Por mes (ritmo)</div><div class="v num">${money(p.mensual)}</div></div><div class="kpi"><div class="eyebrow">Proyección anual</div><div class="v num">${money(p.anual)}</div><div class="d muted">${p.confianza === 'baja' ? 'estimado, pocas compras' : 'según tu ritmo'}</div></div></div>
    ${hist.length > 2 ? `<div class="card flat"><h2>Precio por unidad</h2>${lineas('it', [{ pts: unit, c: c.c, area: true }], { 0: fechaCorta(hist[0].f).slice(4), [hist.length - 1]: fechaCorta(hist[hist.length - 1].f).slice(4) }, { h: 120, def: 'Tocá el gráfico', tip: i => `${fechaCorta(hist[i].f)} · ${money(unit[i])} por unidad`, label: 'Evolución del precio' })}</div>` : ''}
    <div class="card flat" style="padding:6px 14px">${hist.slice().reverse().slice(0, 12).map(h => `<div class="mv"><span class="grow"><div class="t ell">${esc(h.com || 'Sin comercio')}</div><div class="s">${fechaCorta(h.f)}${h.cant > 1 ? ' · ×' + h.cant : ''}</div></span><span class="a num">${money(h.monto)}</span></div>`).join('')}</div>
    <div class="field"><label>Siempre clasificar como…</label><select class="inp" id="it-cat" data-key="${key}">${cfg().cats.map(x => `<option value="${x.id}" ${x.id === o.cat ? 'selected' : ''}>${x.e} ${esc(x.n)}</option>`).join('')}</select><div class="hint">Vale para las próximas veces que cargues este ítem.</div></div>`
  });
}

/* ============ Hojas chicas ============ */
function abrirMesPick() {
  let year = +S.mes.slice(0, 4);
  const def = openSheet({
    title: 'Elegir mes',
    body: () => `<div class="row" style="justify-content:center;gap:18px"><button class="icon-btn" data-act="yr" data-k="-1" aria-label="Año anterior">${IC.left}</button><b class="disp" style="font-size:24px">${year}</b><button class="icon-btn" data-act="yr" data-k="1" aria-label="Año siguiente">${IC.right}</button></div>
    <div class="grid3">${MESES.map((m, i) => { const ym = `${year}-${pad(i + 1)}`; return `<button class="chip ${ym === S.mes ? 'on' : ''}" data-act="mes-set" data-k="${ym}" style="justify-content:center">${m.slice(0, 3)}${ym === ymNow() ? ' •' : ''}</button>`; }).join('')}</div>
    <button class="btn block" data-act="mes-set" data-k="${ymNow()}">Ir al mes actual</button>`,
    yr: k => { year += k; paintSheet(def); }
  });
}
function abrirExplicar() {
  openSheet({
    title: 'Cómo se cuenta cada cosa', body: `<div class="help"><p style="margin:0 0 10px"><b>Entró</b> = sueldos, alquiler que cobrás y rendimientos que te llegan al bolsillo.</p>
    <p style="margin:0 0 10px"><b>Salió</b> = consumo: lo que gastaste y ya no vuelve. Con tarjeta cuenta en el mes en que pagás el resumen, no el día de la compra.</p>
    <p style="margin:0 0 10px"><b>Resultado</b> = entró − salió. Es lo que el mes te dejó para ahorrar o invertir.</p>
    <p style="margin:0 0 10px"><b>Aportado a fondos</b> = la parte del resultado que mandaste a jubilación, casa, auto, etc. <b>No es un gasto</b>: sigue siendo tuyo y aparece en tu patrimonio.</p>
    <p style="margin:0 0 10px"><b>Queda disponible</b> = resultado − aportes. Es plata líquida sin destino todavía.</p>
    <p style="margin:0"><b>El mes siguiente</b> el fondo no vuelve a restar: solo cuentan los aportes nuevos. Por eso nada se cuenta dos veces.</p></div>`
  });
}

/* ============ CIERRE DE MES ============ */
let W = null;
function abrirCierre(ym) {
  const R = resumenMes(ym, 'pago'), ds = cfg().destinos;
  W = { ym, R, rows: checklist(ym, true).map(x => ({ it: x.it, plan: x.plan, real: x.real, monto: x.real ? x.real.total : x.plan, touched: false, skip: false })), ap: {}, val: {} };
  ds.forEach(d => { W.ap[d.id] = { hecho: !!realPlan('dest:' + d.id, ym), ya: sum(S.movs.filter(m => m.tipo === 'aporte' && m.fondo === d.id && m.mes === ym), m => m.total), touched: false, monto: '' }; W.val[d.id] = { touched: false, v: '' }; });
  openSheet({ id: 'cierre', title: 'Cerrar ' + ymLabel(ym), body: wBody, foot: () => `<button class="btn primary" data-act="w-ok">Cerrar ${ymName(ym).toLowerCase()}</button>`, onClose: () => { W = null; }, after: () => wUpdate() });
}
function wCalc() {
  let dz = 0; W.rows.forEach(r => { if (r.it.tipo === 'ingreso' && r.it.diez) dz += r.real ? r.real.total : (r.skip ? 0 : parseMonto(r.monto)); });
  W.rows.forEach(r => { r.eff = r.real ? r.real.total : r.skip ? 0 : (r.it.pct && !r.touched) ? r2(dz * r.it.pct / 100) : parseMonto(r.monto); });
  const ing = W.R.ing + sum(W.rows.filter(r => !r.real && r.it.tipo === 'ingreso'), r => r.eff), cons = W.R.cons + sum(W.rows.filter(r => !r.real && r.it.tipo === 'gasto'), r => r.eff), sobra = ing - cons;
  cfg().destinos.forEach(d => {
    const a = W.ap[d.id]; a.sug = d.modo === 'pct' ? Math.max(0, Math.round(sobra * (+d.pct || 0) / 100 / 100) * 100) : (+d.aporte || 0);
    a.eff = a.hecho ? 0 : (a.touched ? parseMonto(a.monto) : a.sug);
    const v = W.val[d.id]; v.base = saldoFondo(d, W.ym) + a.eff; v.eff = v.touched ? parseMonto(v.v) : v.base; v.dif = v.eff - v.base;
  });
  return { ing, cons, sobra };
}
function wBody() {
  const pend = W.rows.filter(r => !r.real), hechos = W.rows.filter(r => r.real);
  let h = `<div class="note">Cargá lo que realmente pasó en ${ymName(W.ym).toLowerCase()}. Lo que ya confirmaste no se toca.</div>`;
  if (pend.length) {
    h += `<div class="field"><label>Cobros y pagos que faltan confirmar</label><div class="lines">` + W.rows.map((r, i) => r.real ? '' : `<div class="card flat" style="padding:10px"><div class="row" style="justify-content:space-between"><b class="ell">${esc(r.it.n)}</b><span class="hint">previsto ${money(r.plan)}</span></div><div class="row" style="margin-top:6px"><input class="inp num" id="w-r-${i}" data-f="w-row" data-i="${i}" inputmode="decimal" value="${fmtInput(r.monto)}" aria-label="Monto real de ${esc(r.it.n)}"><button class="chip ${r.skip ? 'on' : ''}" data-act="w-skip" data-i="${i}">No pasó</button></div></div>`).join('') + '</div></div>';
  }
  if (hechos.length) h += `<div class="hint">${hechos.length} ya confirmados: ${esc(hechos.map(r => r.it.n).join(', '))}.</div>`;
  h += `<div class="card flat"><div class="grid3"><div><div class="eyebrow">Entró</div><div class="num" style="font-weight:800" id="w-ing"></div></div><div><div class="eyebrow">Salió</div><div class="num" style="font-weight:800" id="w-cons"></div></div><div><div class="eyebrow">Sobró</div><div class="num" style="font-weight:800" id="w-sobra"></div></div></div></div>`;
  h += `<div class="field"><label>Cuánto aportaste a cada fondo</label><div class="lines">${cfg().destinos.map(d => { const a = W.ap[d.id]; return a.hecho ? `<div class="card flat row" style="padding:10px"><span class="ico sm" style="background:${d.c}22">${d.e}</span><span class="grow">${esc(d.n)}</span><b class="num">${money(a.ya)}</b><span class="pill pos">confirmado</span></div>` : `<div class="card flat" style="padding:10px"><div class="row" style="justify-content:space-between"><b class="ell">${d.e} ${esc(d.n)}</b><span class="hint" id="w-as-${d.id}"></span></div><input class="inp num" style="margin-top:6px" id="w-a-${d.id}" data-f="w-ap" data-id="${d.id}" inputmode="decimal" aria-label="Aporte a ${esc(d.n)}"></div>`; }).join('')}</div></div>`;
  h += `<div class="field"><label>Cuánto vale hoy cada fondo</label><div class="hint">Mirá el saldo real donde lo tengas. La diferencia con lo aportado queda registrada como rendimiento.</div><div class="lines">${cfg().destinos.map(d => `<div class="card flat" style="padding:10px"><div class="row" style="justify-content:space-between"><b class="ell">${d.e} ${esc(d.n)}</b><span class="hint num" id="w-dif-${d.id}"></span></div><input class="inp num" style="margin-top:6px" id="w-v-${d.id}" data-f="w-val" data-id="${d.id}" inputmode="decimal" aria-label="Valor actual de ${esc(d.n)}"></div>`).join('')}</div></div>`;
  return h;
}
function wUpdate() {
  if (!W) return; const c = wCalc(); const set = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; }; const act = document.activeElement;
  set('w-ing', money(c.ing)); set('w-cons', money(c.cons)); set('w-sobra', money(c.sobra));
  const so = document.getElementById('w-sobra'); if (so) so.className = 'num ' + (c.sobra < 0 ? 'neg' : 'pos');
  W.rows.forEach((r, i) => { const e = document.getElementById('w-r-' + i); if (e && e !== act && !r.touched) { e.value = fmtInput(r.eff); } if (e) e.disabled = r.skip; });
  cfg().destinos.forEach(d => {
    const a = W.ap[d.id], v = W.val[d.id];
    const ea = document.getElementById('w-a-' + d.id); if (ea && ea !== act && !a.touched) ea.value = fmtInput(a.sug);
    set('w-as-' + d.id, d.modo === 'pct' ? `${String(+d.pct || 0).replace('.', ',')}% de ${compact(c.sobra)}` : 'monto fijo');
    const ev = document.getElementById('w-v-' + d.id); if (ev && ev !== act && !v.touched) ev.value = fmtInput(Math.round(v.base));
    const base = Math.max(1, v.base - (a.eff || 0) / 2), p = v.dif / base * 100;
    set('w-dif-' + d.id, Math.abs(v.dif) < 1 ? 'sin cambios' : `${v.dif > 0 ? 'rindió +' : 'perdió −'}${money(Math.abs(v.dif)).replace('−', '')} (${p.toFixed(2).replace('.', ',')}%)`);
  });
}
async function wSave(def) {
  const c = wCalc(), ym = W.ym, fecha = finDeMes(ym), movs = [];
  W.rows.forEach(r => { if (r.real) return; const m = movDesdePlan(r.it, ym, r.eff, fecha, 'ef'); if (!(r.eff > 0)) { m.omitido = true; m.total = 0; if (m.items && m.items[0]) m.items[0].monto = 0; } movs.push(m); });
  const fondos = {};
  for (const d of cfg().destinos) {
    const a = W.ap[d.id], v = W.val[d.id], plan = aportePlan(d, ym);
    if (!a.hecho && (a.eff > 0 || plan > 0)) { const m = movDesdePlan({ id: 'dest:' + d.id, tipo: 'aporte', fondo: d.id }, ym, a.eff, fecha); if (!(a.eff > 0)) { m.omitido = true; m.total = 0; } movs.push(m); }
    if (Math.abs(v.dif) >= 1) movs.push({ tipo: 'rendimiento', fondo: d.id, total: r2(v.dif), mes: ym, fecha, por: userName(), items: [], com: 'Ajuste de cierre', src: 'cierre', creado: new Date().toISOString() });
    const rendPrev = sum(S.movs.filter(m => m.tipo === 'rendimiento' && m.fondo === d.id && m.mes === ym), m => m.total);
    fondos[d.id] = { saldoPrev: saldoFondo(d, addM(ym, -1)), aporte: a.ya + (a.eff || 0), rend: r2(rendPrev + v.dif), valor: r2(v.eff), modo: d.modo || 'monto', pct: +d.pct || 0 };
  }
  const doc = { ym, cerradoEn: new Date().toISOString(), por: userName(), ing: r2(c.ing), cons: r2(c.cons), sobra: r2(c.sobra), fondos };
  const ok = await guardar(async () => { for (const m of movs) await Store.set('mov', uid(), m); await Store.set('cfg', 'cierre_' + ym, doc); });
  if (ok) { closeSheet(def); toast(ymName(ym) + ' cerrado ✓'); }
}
