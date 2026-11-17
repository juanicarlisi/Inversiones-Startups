/* ============ Nido: primer uso, tus datos (respaldo), avisos y web instalable ============ */

/* ---------- Primer uso ---------- */
S.ob = { paso: 0, nombres: ['', ''], tarjetas: [], otra: '', ejemplo: false };
const necesitaBienvenida = () => !Store.local.cfg.main && !S.movs.length;
function obPuntos(p) { return `<div class="ob-dots" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i === p ? 'on' : i < p ? 'ok' : ''}"></i>`).join('')}</div>`; }
function vBienvenida() {
  const o = S.ob; let h = '<div class="ob">';
  if (o.paso === 0) {
    metrica('inicio-bienvenida');
    h += `<div class="ob-hero"><div class="ob-logo">${ICONO_SVG}</div><h1 class="disp">${esc(MARCA.nombre)}</h1><p class="ob-lema">${esc(MARCA.lema)}</p></div>
    <ul class="ob-lista">
      <li><span class="ob-i">⚡</span><span><b>Un gasto en segundos.</b> Escribís “1500 verdu” y listo.</span></li>
      <li><span class="ob-i">💳</span><span><b>Entiende cuotas y tarjetas.</b> Cada compra cuenta en el mes en que se paga.</span></li>
      <li><span class="ob-i">🔒</span><span><b>Tus números, en tu teléfono.</b> Sin claves del banco y sin cuentas.</span></li>
    </ul>
    <div class="ob-pie"><button class="btn primary block" data-act="ob-sig">Empezar</button><button class="btn ghost block" data-act="ob-importar">Ya tengo datos: importarlos</button></div>`;
  } else if (o.paso === 1) {
    h += `${obPuntos(1)}<h2 class="ob-t disp">¿Quiénes llevan la plata de la casa?</h2><p class="ob-s">Así se sabe quién cargó cada cosa. Es opcional.</p>
    <div class="field"><label for="ob-n0">Tu nombre</label><input class="inp" id="ob-n0" data-f="ob-n" data-i="0" value="${esc(o.nombres[0])}" maxlength="24" autocomplete="given-name" enterkeyhint="next"></div>
    <div class="field"><label for="ob-n1">Tu pareja u otra persona</label><input class="inp" id="ob-n1" data-f="ob-n" data-i="1" value="${esc(o.nombres[1])}" maxlength="24" autocomplete="off" enterkeyhint="next"></div>
    <div class="ob-pie"><button class="btn primary block" data-act="ob-sig">${o.nombres.some(Boolean) ? 'Siguiente' : 'Saltar'}</button><button class="btn ghost block" data-act="ob-atras">Atrás</button></div>`;
  } else {
    h += `${obPuntos(2)}<h2 class="ob-t disp">¿Con qué tarjetas de crédito pagan?</h2><p class="ob-s">Efectivo, débito y transferencia ya están. Si no usan tarjeta, seguí de largo.</p>
    <div class="chips" role="group" aria-label="Tarjetas">${TARJETAS0.map(t => `<button class="chip ${o.tarjetas.includes(t.id) ? 'on' : ''}" data-act="ob-tj" data-k="${t.id}" aria-pressed="${o.tarjetas.includes(t.id)}">💳 ${esc(t.n)}</button>`).join('')}${o.tarjetas.filter(x => !TARJETAS0.some(t => t.id === x)).map(x => `<button class="chip on" data-act="ob-tj" data-k="${esc(x)}" aria-pressed="true">💳 ${esc(x)}</button>`).join('')}</div>
    <div class="field"><label for="ob-otra">Otra tarjeta</label><div class="row" style="gap:8px"><input class="inp grow" id="ob-otra" data-f="ob-otra" value="${esc(o.otra)}" maxlength="30" placeholder="Ej: la del banco" autocomplete="off"><button class="btn" data-act="ob-tj-otra">Sumar</button></div></div>
    <label class="switch ob-ej"><span>Ver un ejemplo con números inventados<div class="hint">Para recorrer la app antes de cargar lo tuyo. Se borra con un toque.</div></span><button class="tg ${o.ejemplo ? 'on' : ''}" data-act="ob-ej" role="switch" aria-checked="${o.ejemplo}" aria-label="Ver un ejemplo"></button></label>
    <div class="ob-pie"><button class="btn primary block" data-act="ob-fin">Listo: cargar mi primer gasto</button><button class="btn ghost block" data-act="ob-atras">Atrás</button></div>`;
  }
  h += `<input type="file" id="file-import" accept=".json,.csv,application/json,text/csv" class="sr" tabindex="-1">`;
  return h + '</div>';
}
async function obTerminar() {
  const o = S.ob, c = cfgInicial({ nombres: o.nombres, tarjetas: o.tarjetas, ejemplo: o.ejemplo });
  const ok = await guardar(async () => {
    await Store.set('cfg', 'main', c);
    if (o.ejemplo) {
      const ej = datosEjemplo(c, ymNow());
      for (const m of ej.movs) await Store.set('mov', uid(), m);
      await Store.set('cfg', 'plan', { items: ej.plan });
    }
  });
  if (!ok) return;
  S.user = c.usuarios[0]; S.vista = 'inicio'; S.mes = ymNow(); render();
  Store.pedirPersistencia();
  abrirComposer('gasto', { quick: true });
}

/* ---------- Avisos arriba de cada pantalla ---------- */
function avisosArriba() {
  let h = '';
  if (S.pwa.nueva) h += `<div class="aviso acc"><span class="grow">Hay una versión nueva de ${esc(MARCA.nombre)}. Tus datos no se tocan.</span><button class="btn sm primary" data-act="pwa-actualizar">Actualizar</button></div>`;
  if (S.pwa.recargar) h += `<div class="aviso warn"><span class="grow">Se abrió una versión más nueva en otra pestaña.</span><button class="btn sm" data-act="pwa-recargar">Recargar</button></div>`;
  if (Store.memoria) h += `<div class="aviso neg"><span class="grow"><b>Este navegador no deja guardar.</b> Lo que cargues se pierde al cerrar (puede pasar en una ventana privada). Guardá un respaldo antes de salir.</span></div>`;
  if (hayEjemplo()) h += `<div class="aviso"><span class="grow">Estás viendo <b>números de ejemplo</b>, inventados.</span><button class="btn sm" data-act="ej-borrar">Borrar el ejemplo</button></div>`;
  else if (pideRespaldo()) h += `<div class="aviso"><span class="grow">Tus datos viven solo en este teléfono. Guardá un respaldo cada tanto.</span><button class="btn sm" data-act="respaldo">Guardar</button><button class="icon-btn" data-act="respaldo-luego" aria-label="Recordármelo más adelante">${IC.x}</button></div>`;
  return h;
}
function pideRespaldo() {
  const reales = S.movs.filter(m => !m.ejemplo).length; if (reales < 15) return false;
  const ult = +lsGet('nido_ultimo_respaldo', 0), luego = +lsGet('nido_respaldo_luego', 0), dia = 864e5;
  return Date.now() - ult > 30 * dia && Date.now() - luego > 7 * dia;
}

/* ---------- Tus datos ---------- */
function descargar(nombre, texto, tipo) {
  const blob = new Blob([texto], { type: tipo || 'application/octet-stream' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = nombre; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function guardarRespaldo() {
  descargar(nombreRespaldo(), JSON.stringify(armarRespaldo(Store.todo()), null, 1), 'application/json');
  lsSet('nido_ultimo_respaldo', String(Date.now())); render(); toast('Respaldo guardado en Descargas');
}
function cardDatos() {
  const ult = +lsGet('nido_ultimo_respaldo', 0);
  const per = Store.memoria ? '<span class="pill neg">no se guarda</span>' : Store.persistente ? '<span class="pill pos">sí</span>' : '<span class="pill warn">lo decide el navegador</span>';
  return `<div class="card span2"><h2>Tus datos</h2>
    <div class="note">Todo lo que cargás queda guardado en este dispositivo, no en internet. Para pasarlo a otro teléfono o no perderlo, guardá un respaldo cada tanto.</div>
    <div class="set-row"><span class="grow ink2">Guardado permanente</span>${per}${!Store.persistente && !Store.memoria ? '<button class="btn sm" data-act="persistir">Pedirlo</button>' : ''}</div>
    <div class="set-row"><span class="grow ink2">Espacio usado</span><span class="num hint" id="espacio">…</span></div>
    <div class="set-row"><span class="grow ink2">Último respaldo</span><span class="hint">${ult ? fechaLarga(new Date(ult).toISOString().slice(0, 10)) : 'nunca'}</span></div>
    <div class="sp"></div>
    <div class="btns col"><button class="btn primary" data-act="respaldo">Guardar respaldo completo</button><button class="btn" data-act="importar">Importar un respaldo o la app anterior</button><button class="btn" data-act="export-csv">Exportar movimientos para planilla (CSV)</button>
    ${hayEjemplo() ? '<button class="btn" data-act="ej-borrar">Borrar el ejemplo</button>' : ''}<button class="btn danger" data-act="borrar-todo">Borrar todos los datos de este dispositivo</button></div>
    <input type="file" id="file-import" accept=".json,.csv,application/json,text/csv" class="sr" tabindex="-1"></div>`;
}
async function pintarEspacio() {
  const e = $('#espacio'); if (!e) return; const r = await Store.espacio();
  e.textContent = r && r.usage != null ? (r.usage < 1e6 ? Math.max(1, Math.round(r.usage / 1e3)) + ' kB' : (r.usage / 1e6).toFixed(1).replace('.', ',') + ' MB') : 'no disponible';
}
function cardApp() {
  const m = S.met || {}, cerr = (m.mesesCerrados || []).length;
  return `<div class="card span2"><h2>Esta app</h2>
    <div class="set-row"><span class="grow ink2">Versión</span><b class="num">${esc(APP_BUILD)}</b></div>
    ${S.pwa.instalable ? `<button class="set-row" data-act="pwa-instalar"><span class="grow">Instalar ${esc(MARCA.nombre)} en este dispositivo</span>${IC.chev}</button>` : ''}
    ${S.pwa.nueva ? '<button class="set-row" data-act="pwa-actualizar"><span class="grow">Actualizar a la versión nueva</span>' + IC.chev + '</button>' : `<button class="set-row" data-act="pwa-buscar"><span class="grow">Buscar actualización</span>${IC.chev}</button>`}
    <div class="group-h">Tu uso (queda en este dispositivo)</div>
    <div class="set-row"><span class="grow ink2">Gastos cargados</span><b class="num">${m.gastos || 0}</b></div>
    <div class="set-row"><span class="grow ink2">Meses cerrados</span><b class="num">${cerr}</b></div>
    ${m.segundosHastaPrimerGasto != null ? `<div class="set-row"><span class="grow ink2">Del inicio al primer gasto</span><b class="num">${m.segundosHastaPrimerGasto} s</b></div>` : ''}
    <div class="hint" style="margin-top:8px">Tipografías Manrope y Bricolage Grotesque (SIL Open Font License 1.1) · base local con idb (ISC).</div></div>`;
}
let IMPORT = null;
async function leerArchivoImport(f) {
  let r; try { r = leerRespaldo(await f.text(), f.name); } catch (e) { toast(e.message || 'No se pudo leer el archivo.', null, true); return; }
  IMPORT = r; const s = r.resumen, hay = S.movs.length > 0 || !!Store.local.cfg.main;
  const origen = { nido: 'un respaldo de ' + MARCA.nombre, 'app-anterior': 'la copia completa de la app anterior', 'csv-anterior': 'los movimientos de la app anterior (CSV)' }[r.origen];
  openSheet({
    id: 'import', title: 'Importar datos',
    body: () => `<div class="note">Es ${origen}.</div>
      <div class="kpis"><div class="kpi"><div class="eyebrow">Movimientos</div><div class="v num">${miles(s.movs)}</div></div><div class="kpi"><div class="eyebrow">Plan mensual</div><div class="v num">${s.plan}</div></div><div class="kpi"><div class="eyebrow">Meses cerrados</div><div class="v num">${s.cierres}</div></div><div class="kpi"><div class="eyebrow">Fondos</div><div class="v num">${s.fondos}</div></div></div>
      ${r.avisos.map(a => `<div class="note warn">${esc(a)}</div>`).join('')}
      ${hay ? `<div class="note neg"><b>Reemplaza lo que hay en este dispositivo.</b> Antes se descarga un respaldo de lo actual, por las dudas.</div>` : ''}`,
    foot: () => `<button class="btn" data-act="sheet-close">Cancelar</button><button class="btn primary" data-act="import-ok">${hay ? 'Respaldar y reemplazar' : 'Importar'}</button>`,
    onClose: () => { IMPORT = null; }
  });
}
async function confirmarImport(def) {
  const r = IMPORT; if (!r) return; const hay = S.movs.length > 0 || !!Store.local.cfg.main;
  if (hay) guardarRespaldo();
  const ok = await guardar(() => Store.reemplazar(r.datos)); if (!ok) return;
  closeSheet(def); S.mes = ymNow(); S.vista = 'inicio'; metrica('importacion'); render();
  toast(`Listo: ${miles(r.resumen.movs)} movimientos importados`);
}

/* ---------- Web instalable: service worker, actualización sin perder datos, instalar ---------- */
S.pwa = { reg: null, nueva: false, instalable: null, pedido: false, recargar: false };
function registrarSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js').then(reg => {
    S.pwa.reg = reg;
    const vigilar = w => w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) { S.pwa.nueva = true; render(); } });
    if (reg.waiting && navigator.serviceWorker.controller) { S.pwa.nueva = true; render(); }
    reg.addEventListener('updatefound', () => vigilar(reg.installing));
  }).catch(e => console.warn('service worker', e));
  // Solo se recarga cuando la persona tocó «Actualizar»: la primera instalación no interrumpe nada.
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (S.pwa.pedido) location.reload(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.pwa.reg) S.pwa.reg.update().catch(() => { }); });
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.pwa.instalable = e; if (S.ready) render(); });
window.addEventListener('appinstalled', () => { S.pwa.instalable = null; Store.pedirPersistencia(); if (S.ready) render(); });
function avisoRecargar() { S.pwa.recargar = true; if (S.ready) render(); }

/* ---------- Tema claro / oscuro ---------- */
function aplicarTema() {
  const t = lsGet('nido_tema', 'auto'), r = document.documentElement;
  if (t === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', t);
  $$('meta[name="theme-color"]').forEach(m => { const fijo = t === 'auto' ? m.dataset.tema : t; m.setAttribute('content', fijo === 'dark' ? MARCA.colorOscuro : MARCA.colorClaro); });
}

/* ---------- Acciones ---------- */
const ACT_NIDO = {
  'ob-sig': () => { S.ob.paso++; render(); window.scrollTo(0, 0); setTimeout(() => { const i = $('#ob-n0'); if (i) i.focus(); }, 30); },
  'ob-atras': () => { S.ob.paso = Math.max(0, S.ob.paso - 1); render(); },
  'ob-tj': el => { const k = el.dataset.k, a = S.ob.tarjetas, i = a.indexOf(k); if (i > -1) a.splice(i, 1); else a.push(k); render(); },
  'ob-tj-otra': () => { const v = S.ob.otra.trim(); if (v && !S.ob.tarjetas.includes(v)) S.ob.tarjetas.push(v); S.ob.otra = ''; render(); },
  'ob-ej': () => { S.ob.ejemplo = !S.ob.ejemplo; render(); },
  'ob-fin': () => obTerminar(),
  'ob-importar': () => { const f = $('#file-import'); if (f) { f.value = ''; f.click(); } },
  importar: () => { const f = $('#file-import'); if (f) { f.value = ''; f.click(); } },
  'import-ok': (el, e, d) => confirmarImport(d),
  respaldo: () => guardarRespaldo(),
  'respaldo-luego': () => { lsSet('nido_respaldo_luego', String(Date.now())); render(); },
  persistir: async () => { const p = await Store.pedirPersistencia(); render(); toast(p ? 'Listo: el navegador no va a borrar tus datos' : 'El navegador no lo concedió por ahora. Instalar la app suele alcanzar.', null, !p); },
  'ej-borrar': async () => {
    const movs = S.movs.filter(m => m.ejemplo), plan = S.plan.items.filter(i => i.ejemplo);
    const ok = await guardar(async () => { for (const m of movs) await Store.del('mov', m.id); if (plan.length) { S.plan.items = S.plan.items.filter(i => !i.ejemplo); await savePlan(); } });
    if (ok) toast('Ejemplo borrado: ahora, lo tuyo');
  },
  'borrar-todo': () => openSheet({ id: 'borrar', title: '¿Borrar todo?', body: '<div class="help">Se borran todos los movimientos, el plan, los fondos y la configuración de <b>este dispositivo</b>. No se puede deshacer. Si querés conservar algo, guardá antes un respaldo.</div>', foot: () => '<button class="btn" data-act="respaldo">Guardar respaldo</button><button class="btn danger" data-act="borrar-ok">Borrar todo</button>' }),
  'borrar-ok': async (el, e, d) => { const ok = await guardar(() => Store.borrarTodo()); if (ok) { closeSheet(d); S.ob = { paso: 0, nombres: ['', ''], tarjetas: [], otra: '', ejemplo: false }; S.user = null; render(); } },
  'tg-mayordomia': async () => {
    const c = cfg(); c.mayordomia = !c.mayordomia;
    if (c.mayordomia && !c.cats.some(x => x.id === 'diez')) c.cats.push(clone(CAT_DIEZ));
    if (!c.mayordomia && !S.movs.some(m => (m.items || []).some(i => i.cat === 'diez')) && !S.plan.items.some(i => i.cat === 'diez')) c.cats = c.cats.filter(x => x.id !== 'diez');
    if (await guardar(saveCfg)) render();
  },
  'tj-add': async () => { const c = cfg(); const n = c.tarjetas.length + 1; c.tarjetas.push({ id: 't' + uid(), n: 'Tarjeta ' + n, cierre: 0 }); if (await guardar(saveCfg)) { render(); setTimeout(() => { const i = $$('[data-f="st-tjn"]').pop(); if (i) { i.focus(); i.select(); } }, 30); } },
  'tj-del': async el => { const c = cfg(), t = c.tarjetas[+el.dataset.i]; if (!t) return; if (S.movs.some(m => m.medio === t.id) || S.plan.items.some(i => i.medio === t.id || i.tarjeta === t.id)) { toast('Esta tarjeta tiene movimientos: no se puede quitar. Podés cambiarle el nombre.', null, true); return; } c.tarjetas = c.tarjetas.filter(x => x !== t); if (await guardar(saveCfg, 'Tarjeta quitada')) render(); },
  tema: el => { lsSet('nido_tema', el.dataset.k); aplicarTema(); render(); },
  'cp-quick-ok': () => { const q = $('#quick'); if (q) quickParse(q.value); },
  'pwa-actualizar': () => { const w = S.pwa.reg && S.pwa.reg.waiting; if (!w) { location.reload(); return; } S.pwa.pedido = true; w.postMessage({ tipo: 'activar' }); },
  'pwa-recargar': () => location.reload(),
  'pwa-buscar': async () => { if (!S.pwa.reg) { toast('La actualización automática no está disponible acá.', null, true); return; } try { await S.pwa.reg.update(); } catch (e) { } setTimeout(() => toast(S.pwa.nueva ? 'Hay una versión nueva: tocá Actualizar' : 'Ya tenés la última versión'), 900); },
  'pwa-instalar': async () => { const ev = S.pwa.instalable; if (!ev) return; ev.prompt(); try { await ev.userChoice; } catch (e) { } S.pwa.instalable = null; render(); }
};
document.addEventListener('input', e => {
  const el = e.target, f = el.dataset && el.dataset.f; if (!f) return;
  if (f === 'ob-n') { S.ob.nombres[+el.dataset.i] = el.value; const b = $('[data-act="ob-sig"]'); if (b) b.textContent = S.ob.nombres.some(x => x.trim()) ? 'Siguiente' : 'Saltar'; }
  else if (f === 'ob-otra') S.ob.otra = el.value;
});
document.addEventListener('keydown', e => {
  const el = e.target; if (e.key !== 'Enter' || !el.dataset) return;
  if (el.id === 'ob-n0') { e.preventDefault(); const n = $('#ob-n1'); if (n) n.focus(); }
  else if (el.id === 'ob-n1') { e.preventDefault(); ACT_NIDO['ob-sig'](); }
  else if (el.id === 'ob-otra') { e.preventDefault(); ACT_NIDO['ob-tj-otra'](); }
});
document.addEventListener('change', e => { const el = e.target; if (el.id === 'file-import' && el.files && el.files[0]) { const f = el.files[0]; el.value = ''; leerArchivoImport(f); } });

function arrancar() {
  aplicarTema(); registrarSW();
  Store.init().catch(e => { console.error(e); const b = $('#boot'); if (b) b.innerHTML = '<div class="card">No se pudo abrir la app. Cerrala y volvé a abrirla.</div>'; });
}
