/* ============ AJUSTES ============ */
function vAjustes() {
  const c = cfg(); let h = '<div class="grid two">';
  h += `<div class="card"><h2>Personas</h2><div class="grid3" style="grid-template-columns:1fr 1fr">${c.usuarios.map((u, i) => `<div class="field"><label for="st-u${i}">Persona ${i + 1}</label><input class="inp" id="st-u${i}" data-f="st-user" data-i="${i}" value="${esc(u)}"></div>`).join('')}</div></div>`;
  h += `<div class="card"><h2>Parámetros</h2><div class="grid3" style="grid-template-columns:1fr 1fr">
    <div class="field"><label for="st-tc">Dólar de referencia ($)</label><input class="inp num" id="st-tc" data-f="st-tc" inputmode="decimal" value="${fmtInput(c.tc)}"></div>
    <div class="field"><label for="st-tasa">Rendimiento anual %</label><input class="inp num" id="st-tasa" data-f="st-tasa" inputmode="decimal" value="${String(c.tasa).replace('.', ',')}"></div>
    <div class="field"><label for="st-caja">Plata disponible al empezar ($)</label><input class="inp num" id="st-caja" data-f="st-caja" inputmode="decimal" value="${fmtInput(c.caja)}"></div>
    <div class="field"><label for="st-ini">Empezamos en</label><input class="inp" type="month" id="st-ini" data-f="st-ini" value="${c.inicio}"></div></div>
    <div class="hint" style="margin-top:8px">“Plata disponible al empezar” es lo que tenían líquido (cuenta, efectivo) al comienzo del mes de arranque. Con eso se calcula el disponible de hoy.</div></div>`;
  h += `<div class="card"><h2>Rubros <button class="more" data-act="cat-edit" data-id="">Agregar</button></h2>${c.cats.map(x => `<button class="set-row" data-act="cat-edit" data-id="${x.id}"><span class="ico sm" style="background:${x.c}22">${x.e}</span><span class="grow ell">${esc(x.n)}</span><span class="hint">${x.pres > 0 ? 'presup. ' + compact(x.pres) + (x.presDesde ? ' desde ' + ymShort(x.presDesde) + ' ' + x.presDesde.slice(2, 4) : '') : ''}</span>${IC.chev}</button>`).join('')}</div>`;
  h += `<div class="card"><h2>Plan mensual <button class="more" data-act="plan-edit" data-id="">Agregar</button></h2><div class="hint" style="margin-bottom:6px">Lo que cobran y pagan todos los meses. Aparece en Inicio para confirmarlo con un toque.</div>
    ${['ingreso', 'gasto'].map(t => `<div class="group-h">${t === 'ingreso' ? 'Cobros' : 'Pagos'}</div>${S.plan.items.filter(i => i.tipo === t).map(i => `<button class="set-row" data-act="plan-edit" data-id="${i.id}"><span class="ico sm">${t === 'ingreso' ? ingCatOf(i.cat).e : catOf(i.cat).e}</span><span class="grow ell">${esc(i.n)}</span><span class="num hint">${i.pct ? i.pct + '%' : money(i.base)}</span>${IC.chev}</button>`).join('') || '<div class="hint">Nada todavía.</div>'}`).join('')}</div>`;
  h += `<div class="card"><h2>Tarjetas</h2>${c.tarjetas.map((t, i) => `<div class="set-row"><span class="ico sm">💳</span><span class="grow ell">${esc(t.n)}</span><label class="hint" for="st-ci${i}">cierra el día</label><input class="inp num" style="width:64px;min-height:38px;padding:6px 8px" id="st-ci${i}" data-f="st-cierre" data-i="${i}" inputmode="numeric" value="${t.cierre || ''}" placeholder="—"></div>`).join('')}
    <div class="hint" style="margin-top:6px">Sin día de cierre, todo lo que pagás con tarjeta cuenta en el mes siguiente. Si cargás el día, lo comprado después del cierre pasa al segundo mes.</div></div>`;
  h += `<div class="card"><h2>Esta app</h2><div class="set-row"><span class="grow ink2">Versión</span><b class="num">${APP_BUILD}</b></div><div class="hint">Si acá no dice la versión que te avisé, el teléfono tiene una copia vieja guardada: cerrá del todo el navegador o la app y volvé a abrir el link.</div><div class="sp"></div><button class="btn block" data-act="recargar">Recargar la app</button></div>`;
  const dg = S.cap.diag || {}; const ok = v => `<span class="pill ${v ? 'pos' : 'warn'}">${v ? 'sí' : 'no'}</span>`;
  h += `<div class="card"><h2>Diagnóstico de esta cuenta</h2>
    <div class="set-row"><span class="grow ink2">Conectada a Claude</span>${ok(dg.claude)}</div>
    <div class="set-row"><span class="grow ink2">Base compartida</span>${ok(dg.db)}</div>
    <div class="set-row"><span class="grow ink2">Puede cargar y editar datos</span><span class="pill ${S.canWrite === false ? 'warn' : 'pos'}">${S.canWrite === false ? 'no (solo lectura)' : S.canWrite === true ? 'sí' : 'sin confirmar'}</span></div>
    <div class="set-row"><span class="grow ink2">Lectura de tickets con Claude</span>${ok(dg.sample)}</div>
    <div class="set-row"><span class="grow ink2">Guardar fotos</span>${ok(dg.assets)}</div>
    <div class="hint" style="margin-top:6px">Si algo dice “no”, es una función que Claude no le habilitó a esta cuenta o visor. Sacale captura a esta tarjeta si necesitás avisarme.</div></div>`;
  h += `<div class="card"><h2>Datos</h2><button class="set-row" data-act="export-csv"><span class="grow">Exportar movimientos (CSV)</span>${IC.chev}</button>
    <div class="set-row"><span class="grow ink2">Reglas aprendidas</span><span class="num hint">${Object.keys(S.apr).length} ítems</span></div>
    <div class="set-row"><span class="grow ink2">Conexión</span><span class="pill ${S.mode === 'cloud' ? 'pos' : 'warn'}">${S.mode === 'cloud' ? 'compartida' : 'solo este teléfono'}</span></div>
    <div class="set-row"><span class="grow ink2">Lectura de fotos con Claude</span><span class="pill ${S.cap.sample ? 'pos' : 'warn'}">${S.cap.sample ? (S.cap.images ? 'disponible' : 'a probar') : 'no disponible'}</span></div>
    <a class="set-row" href="https://claude.ai/artifact/UTnbTJ1fUtcaYskFkDWApQ" target="_blank" rel="noopener" style="color:inherit;text-decoration:none"><span class="grow">Abrir en el navegador del celular</span>${IC.chev}</a>
    <div class="set-row"><span class="grow ink2">Guardar fotos de tickets</span><span class="pill ${S.cap.assets ? 'pos' : 'warn'}">${S.cap.assets ? 'sí' : 'solo mientras cargás'}</span></div></div>`;
  return h + '</div>';
}
function abrirCat(id) {
  const nuevo = !id; const x = nuevo ? { id: 'c' + uid(), n: '', e: '🏷️', c: PALETA[0], pres: 0 } : clone(cfg().cats.find(c => c.id === id));
  openSheet({
    title: nuevo ? 'Nuevo rubro' : 'Editar rubro', x, nuevo,
    body: () => `<div class="grid3" style="grid-template-columns:70px 1fr"><div class="field"><label for="ce-e">Ícono</label><input class="inp" id="ce-e" data-f="ce-e" value="${esc(x.e)}" maxlength="4" style="text-align:center;font-size:20px"></div><div class="field"><label for="ce-n">Nombre</label><input class="inp" id="ce-n" data-f="ce-n" value="${esc(x.n)}"></div></div>
    <div class="field"><label>Color</label><div class="chips">${[...new Set([...CATS0.map(c => c.c), ...PALETA])].map(c => `<button class="chip ${x.c === c ? 'on' : ''}" data-act="ce-color" data-k="${c}" style="padding:0;width:34px;height:34px;justify-content:center"><span class="dot" style="background:${c};width:16px;height:16px;border-radius:50%"></span></button>`).join('')}</div></div>
    <div class="field"><label for="ce-p">Presupuesto mensual ($, opcional)</label><input class="inp num" id="ce-p" data-f="ce-p" inputmode="decimal" value="${fmtInput(x.pres)}"><div class="hint">Para rubros que varían (comida, salidas). Se marca en el análisis y entra en la proyección del mes. No lo uses en rubros con pagos fijos del plan.</div></div>
    <div class="field"><label for="ce-pd">Presupuesto desde (mes, opcional)</label><input class="inp" type="month" id="ce-pd" data-f="ce-pd" value="${x.presDesde || ''}"><div class="hint">Antes de ese mes el rubro no tiene presupuesto.</div></div>
    ${!nuevo ? `<button class="btn danger block" data-act="ce-del">Eliminar rubro</button>` : ''}`,
    foot: () => '<button class="btn primary" data-act="ce-save">Guardar</button>'
  });
}
function abrirPlanEdit(id) {
  const nuevo = !id; const it = nuevo ? { id: 'p' + uid(), tipo: 'gasto', n: '', cat: 'otros', base: 0, desde: cfg().inicio, ov: {} } : clone(S.plan.items.find(i => i.id === id));
  it.ov = it.ov || {}; let year = +S.mes.slice(0, 4);
  const def = openSheet({
    title: nuevo ? 'Nuevo en el plan' : 'Editar ' + it.n, it, nuevo, setYear: k => { year += k; paintSheet(def); },
    body: () => {
      const cats = it.tipo === 'ingreso' ? cfg().ingCats : cfg().cats;
      return `<div class="seg"><button class="${it.tipo === 'ingreso' ? 'on' : ''}" data-act="pe-tipo" data-k="ingreso">Cobro</button><button class="${it.tipo === 'gasto' ? 'on' : ''}" data-act="pe-tipo" data-k="gasto">Pago</button></div>
      <div class="field"><label for="pe-n">Nombre</label><input class="inp" id="pe-n" data-f="pe-n" value="${esc(it.n)}" placeholder="Ej: Expensas"></div>
      <div class="field"><label for="pe-c">Rubro</label><select class="inp" id="pe-c" data-f="pe-c">${cats.map(c => `<option value="${c.id}" ${c.id === it.cat ? 'selected' : ''}>${c.e} ${esc(c.n)}</option>`).join('')}</select></div>
      ${it.tipo === 'gasto' ? `<label class="switch"><span>Es un porcentaje de los ingresos que cuentan para el diezmo</span><button class="tg ${it.pct ? 'on' : ''}" data-act="pe-pct" role="switch" aria-checked="${!!it.pct}"></button></label>` : `<div class="hint">El diezmo se calcula solo: 10% de todos los ingresos del mes, menos el plazo fijo (rubro Rendimientos).</div>`}
      ${it.pct ? `<div class="field"><label for="pe-pct">Porcentaje</label><input class="inp num" id="pe-pct" data-f="pe-pct" inputmode="decimal" value="${it.pct}"></div>` : `<div class="field"><label for="pe-b">Monto mensual ($)</label><input class="inp num" id="pe-b" data-f="pe-b" inputmode="decimal" value="${fmtInput(it.base)}"></div>`}
      <div class="grid3" style="grid-template-columns:1fr 1fr"><div class="field"><label for="pe-d">Desde</label><input class="inp" type="month" id="pe-d" data-f="pe-d" value="${it.desde || ''}"></div><div class="field"><label for="pe-h">Hasta (opcional)</label><input class="inp" type="month" id="pe-h" data-f="pe-h" value="${it.hasta || ''}"></div></div>
      ${it.pct ? '' : `<div class="field"><label>Montos distintos por mes</label><div class="row" style="justify-content:center;gap:16px"><button class="icon-btn" data-act="pe-yr" data-k="-1" aria-label="Año anterior">${IC.left}</button><b class="disp">${year}</b><button class="icon-btn" data-act="pe-yr" data-k="1" aria-label="Año siguiente">${IC.right}</button></div>
        <div class="grid3">${MES3.map((m, i) => { const ym = `${year}-${pad(i + 1)}`; return `<div class="field"><label for="ov-${ym}" style="text-transform:none;letter-spacing:0">${m}</label><input class="inp num" style="padding:8px;min-height:38px" id="ov-${ym}" data-f="pe-ov" data-m="${ym}" inputmode="decimal" placeholder="${fmtInput(planBase({ ...it, ov: {} }, ym)) || '0'}" value="${ovHas(it, ym) ? fmtInput(it.ov[ym]) || '0' : ''}"></div>`; }).join('')}</div><div class="hint">Vacío = usa el monto mensual. Poné 0 para que ese mes no aplique.</div></div>`}
      ${!nuevo ? `<button class="btn danger block" data-act="pe-del">Eliminar del plan</button>` : ''}`;
    },
    foot: () => '<button class="btn primary" data-act="pe-save">Guardar</button>'
  });
}
function abrirMeta(id) {
  const nuevo = !id; const x = nuevo ? { id: 'm' + uid(), n: '', monto: 0 } : clone(S.metas.items.find(i => i.id === id));
  openSheet({
    title: nuevo ? 'Nueva meta de compra' : 'Editar meta', x, nuevo,
    body: () => `<div class="field"><label for="me-n">¿Qué querés comprar?</label><input class="inp" id="me-n" data-f="me-n" value="${esc(x.n)}" placeholder="Ej: Sillón"></div><div class="field"><label for="me-m">Costo estimado ($)</label><div class="amount-wrap"><span class="cur">$</span><input id="me-m" data-f="me-m" inputmode="decimal" value="${fmtInput(x.monto)}"></div></div>${!nuevo ? `<button class="btn danger block" data-act="me-del">Eliminar</button>` : ''}`,
    foot: () => '<button class="btn primary" data-act="me-save">Guardar</button>'
  });
}
function pickCat(cb, actual) {
  openSheet({ title: 'Elegir rubro', body: () => `<div class="cats">${catsOrdenadas().map(c => `<button class="cat-b ${actual === c.id ? 'on' : ''}" data-act="pick-cat" data-k="${c.id}"><span class="e">${c.e}</span>${esc(c.n.replace(/ \(.*\)/, ''))}</button>`).join('')}</div>`, cb });
}
async function exportCSV() {
  const rows = [['fecha', 'mes_de_pago', 'tipo', 'comercio', 'item', 'rubro', 'monto', 'medio', 'cargo', 'cuota']];
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  S.movs.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach(m => {
    const cu = m.cuota ? `${m.cuota.i}/${m.cuota.n}` : '';
    if (m.tipo === 'gasto') (m.items || []).forEach(i => rows.push([m.fecha, m.mes, 'gasto', m.com || '', i.n, catOf(i.cat).n, i.monto, medioOf(m.medio).n + (m.pagoFondo ? ' (fondo)' : ''), m.por || '', cu]));
    else rows.push([m.fecha, m.mes, m.tipo, m.com || (destOf(m.fondo) || {}).n || '', m.tipo === 'ingreso' ? ingCatOf(m.cat).n : '', '', m.total, '', m.por || '', '']);
  });
  const csv = '﻿' + rows.map(r => r.map(q).join(',')).join('\n');
  if (S.cap.downloads) { try { await S.cap.downloads.save({ filename: `economia-familiar-${hoy()}.csv`, data: csv }); } catch (e) { if (e && e.code !== 'declined') toast('No se pudo exportar.', null, true); } }
  else toast('Exportar no está disponible en esta vista.', null, true);
}

/* ============ ACCIONES (clicks) ============ */
const ACT = {
  go: el => { S.vista = el.dataset.v; try { history.replaceState(null, '', '#' + S.vista); } catch (e) { } render(); window.scrollTo(0, 0); },
  'mes-prev': () => { S.mes = addM(S.mes, -1); render(); }, 'mes-next': () => { S.mes = addM(S.mes, 1); render(); },
  'mes-pick': () => abrirMesPick(), 'mes-set': el => { S.mes = el.dataset.k; closeSheet(); render(); },
  yr: (el, e, d) => d.yr(+el.dataset.k),
  user: el => { S.user = el.dataset.u; lsSet('ef_user', S.user); render(); },
  nuevo: () => abrirComposer('gasto'), explicar: () => abrirExplicar(),
  'sheet-close': el => closeSheet(sheetOf(el)),
  mfiltro: el => { S.ui.movFiltro = el.dataset.k; render(); }, mvista: el => { S.ui.movVista = el.dataset.k; render(); },
  antab: el => { S.ui.anTab = el.dataset.k; render(); }, base: el => { S.base = el.dataset.k; render(); }, isort: el => { S.ui.itemSort = el.dataset.k; render(); },
  'rubro-tog': el => { const k = el.dataset.k; S.ui.abiertos[k] = !S.ui.abiertos[k]; el.closest('.bar-row').classList.toggle('open', S.ui.abiertos[k]); const b = $('[data-act="exp-todo"]'); },
  'exp-todo': () => { const rub = porRubro(resumenMes(S.mes, S.base).L); const all = rub.every(r => S.ui.abiertos[r.cat]); rub.forEach(r => S.ui.abiertos[r.cat] = !all); render(); },
  'item-open': el => abrirItem(el.dataset.k),
  'mov-open': el => abrirMov(el.dataset.id),
  'mov-agrupar': (el, e, d) => { d.agrupar = !d.agrupar; paintSheet(d); },
  'mov-del': (el, e, d) => { d.confirmar = true; paintSheet(d); }, 'mov-cancel-del': (el, e, d) => { d.confirmar = false; paintSheet(d); },
  'mov-del2': async (el, e, d) => {
    const m = d.m; const todos = m.grupo ? S.movs.filter(x => x.grupo === m.grupo) : [m]; const copia = clone(todos);
    const ok = await guardar(async () => { for (const x of todos) await Store.del('mov', x.id); });
    if (ok) { closeSheet(d); toast(todos.length > 1 ? 'Cuotas eliminadas' : 'Eliminado', async () => { await guardar(async () => { for (const x of copia) await Store.set('mov', x.id, x); }); }); }
  },
  'mov-edit': (el, e, d) => {
    const m = d.m; closeSheet(d);
    const its = m.items || []; const simple = m.tipo === 'gasto' && its.length === 1;
    const ex = { id: m.id, tipo: m.tipo === 'gasto' ? 'gasto' : m.tipo === 'ingreso' ? 'ingreso' : 'fondo', sub: m.tipo, fecha: m.fecha, medio: m.medio || 'ef', por: m.por || userName(), com: m.com || '', nota: m.nota || '', creado: m.creado, grupo: m.grupo, cuota: m.cuota, src: m.src, planId: m.planId, pagoFondo: m.pagoFondo || null, adv: !!(m.pagoFondo || m.nota), medioTouched: true, mesPago: m.tipo === 'gasto' && esTarjeta(m.medio) && !m.pagoFondo ? m.mes : null, mesFijo: m.mes, fecha0: m.fecha, medio0: m.medio || 'ef' };
    if (m.tipo === 'gasto') { if (simple) { Object.assign(ex, { split: false, monto: its[0].monto, cat: its[0].cat, catAuto: false, com: m.com || (its[0].n === catOf(its[0].cat).n ? '' : its[0].n) }); } else Object.assign(ex, { split: true, lines: clone(its).map(l => ({ ...l, auto: false })), monto: 0 }); }
    else if (m.tipo === 'ingreso') Object.assign(ex, { monto: m.total, ingCat: m.cat });
    else Object.assign(ex, { monto: m.total, fondo: m.fondo });
    abrirComposer(ex.tipo, ex);
  },
  'plan-open': el => abrirPlanRow(el.dataset.id), 'plan-todo': () => abrirPlanTodo(),
  'pl-medio': (el, e, d) => { d.medio = el.dataset.k; $$('[data-act="pl-medio"]', d.el).forEach(b => b.classList.toggle('on', b.dataset.k === d.medio)); },
  'pl-ok': (el, e, d) => planOk(d), 'pt-ok': (el, e, d) => planTodoOk(d),
  'pl-undo': async (el, e, d) => { const ms = d.row.real.movs; const cp = clone(ms); const ok = await guardar(async () => { for (const m of ms) await Store.del('mov', m.id); }); if (ok) { closeSheet(d); toast('Deshecho', async () => { await guardar(async () => { for (const m of cp) await Store.set('mov', m.id, m); }); }); } },
  'fondo-open': el => abrirFondo(el.dataset.id), 'fondo-nuevo': () => abrirFondoEdit(null), 'fondo-edit': (el, e, d) => { closeSheet(d); abrirFondoEdit(el.dataset.id); },
  aportar: (el, e, d) => { const dest = destOf(el.dataset.id); if (d && d.id === 'fondo') closeSheet(d); const ap = aportePlan(dest, S.mes); abrirComposer('fondo', { sub: 'aporte', fondo: dest.id, monto: Math.max(0, ap - sum(S.movs.filter(m => m.tipo === 'aporte' && m.fondo === dest.id && m.mes === S.mes), m => m.total)) || ap || 0 }); },
  normalizar: async () => {
    const sobra = sobraEsp(S.mes), tot = sum(cfg().destinos, d => aportePlan(d, S.mes)); if (sobra <= 0 || !tot) return;
    const k = sobra / tot; cfg().destinos.forEach(d => { if (d.modo === 'pct') d.pct = Math.floor((+d.pct || 0) * k * 10) / 10; else d.aporte = Math.floor((+d.aporte || 0) * k / 100) * 100; });
    if (await guardar(saveCfg, 'Aportes ajustados a lo que sobra')) render();
  },
  cerrar: el => abrirCierre(el.dataset.ym),
  recargar: () => { try { location.reload(); } catch (e) { toast('Cerrá y volvé a abrir el link.', null, true); } },
  'rep-modo': async el => { const d = destOf(el.dataset.id), k = el.dataset.k; if (k === 'pct' && !(+d.pct)) { const s = sobraEsp(S.mes); d.pct = s > 0 ? Math.min(100, Math.round((+d.aporte || 0) / s * 1000) / 10) : 0; } d.modo = k; if (await guardar(saveCfg)) render(); },
  'hist-fondo': el => { S.ui.histFondo = el.dataset.k || null; render(); },
  'w-skip': (el, e, d) => { const r = W.rows[+el.dataset.i]; r.skip = !r.skip; el.classList.toggle('on', r.skip); wUpdate(); },
  'w-ok': (el, e, d) => wSave(d),
  'fe-modo': (el, e, d) => { d.d.modo = el.dataset.k; if (d.d.modo === 'pct' && !(+d.d.pct)) { const s = sobraEsp(S.mes); d.d.pct = s > 0 ? Math.min(100, Math.round((+d.d.aporte || 0) / s * 1000) / 10) : 0; } paintSheet(d); },
  'fe-color': (el, e, d) => { d.d.c = el.dataset.k; paintSheet(d); },
  'fe-save': async (el, e, d) => { const x = d.d; if (!x.n.trim()) { toast('Poné un nombre.', null, true); return; } const ds = cfg().destinos; const i = ds.findIndex(y => y.id === x.id); if (i > -1) ds[i] = x; else ds.push(x); if (await guardar(saveCfg, 'Guardado ✓')) closeSheet(d); },
  'fe-del': async (el, e, d) => { const x = d.d; if (S.movs.some(m => m.fondo === x.id || m.pagoFondo === x.id)) { toast('Este destino tiene movimientos: no se puede eliminar.', null, true); return; } cfg().destinos = cfg().destinos.filter(y => y.id !== x.id); if (await guardar(saveCfg, 'Eliminado')) closeSheet(d); },
  'meta-edit': el => abrirMeta(el.dataset.id),
  'meta-comprar': el => { const x = S.metas.items.find(i => i.id === el.dataset.id); abrirComposer('gasto', { monto: x.monto, com: x.n, cat: clasificar(x.n, '') || 'hogar', catAuto: false, metaId: x.id, adv: true }); },
  'me-save': async (el, e, d) => { const x = d.x; if (!x.n.trim()) { toast('Poné qué querés comprar.', null, true); return; } const a = S.metas.items; const i = a.findIndex(y => y.id === x.id); if (i > -1) a[i] = x; else a.push(x); if (await guardar(saveMetas, 'Guardado ✓')) closeSheet(d); },
  'me-del': async (el, e, d) => { S.metas.items = S.metas.items.filter(y => y.id !== d.x.id); if (await guardar(saveMetas, 'Eliminada')) closeSheet(d); },
  'cat-edit': el => abrirCat(el.dataset.id),
  'ce-color': (el, e, d) => { d.x.c = el.dataset.k; paintSheet(d); },
  'ce-save': async (el, e, d) => { const x = d.x; if (!x.n.trim()) { toast('Poné un nombre.', null, true); return; } const a = cfg().cats; const i = a.findIndex(y => y.id === x.id); if (i > -1) a[i] = x; else a.push(x); if (await guardar(saveCfg, 'Guardado ✓')) closeSheet(d); },
  'ce-del': async (el, e, d) => { const x = d.x; if (S.movs.some(m => (m.items || []).some(i => i.cat === x.id)) || S.plan.items.some(i => i.cat === x.id)) { toast('Hay movimientos con este rubro: no se puede eliminar.', null, true); return; } cfg().cats = cfg().cats.filter(y => y.id !== x.id); if (await guardar(saveCfg, 'Eliminado')) closeSheet(d); },
  'plan-edit': el => abrirPlanEdit(el.dataset.id),
  'pe-tipo': (el, e, d) => { d.it.tipo = el.dataset.k; d.it.cat = el.dataset.k === 'ingreso' ? 'sueldo' : 'otros'; d.it.pct = 0; d.it.diez = false; paintSheet(d); },
  'pe-pct': (el, e, d) => { d.it.pct = d.it.pct ? 0 : 10; paintSheet(d); }, 'pe-diez': (el, e, d) => { d.it.diez = !d.it.diez; paintSheet(d); },
  'pe-yr': (el, e, d) => d.setYear(+el.dataset.k),
  'pe-save': async (el, e, d) => { const x = d.it; if (!x.n.trim()) { toast('Poné un nombre.', null, true); return; } if (!x.desde) delete x.desde; if (!x.hasta) delete x.hasta; if (!x.pct) delete x.pct; if (!x.diez) delete x.diez; const a = S.plan.items; const i = a.findIndex(y => y.id === x.id); if (i > -1) a[i] = x; else a.push(x); if (await guardar(savePlan, 'Guardado ✓')) closeSheet(d); },
  'pe-del': async (el, e, d) => { S.plan.items = S.plan.items.filter(y => y.id !== d.it.id); if (await guardar(savePlan, 'Eliminado del plan')) closeSheet(d); },
  'pick-cat': (el, e, d) => { const f = d.cb; closeSheet(d); f(el.dataset.k); },
  'export-csv': () => exportCSV(),
  /* compositor */
  'cp-tipo': el => { CP.tipo = el.dataset.k; cpRefresh(); },
  'cp-sub': el => { CP.sub = el.dataset.k; cpRefresh(); }, 'cp-fondo': el => { CP.fondo = el.dataset.k; cpRefresh(); },
  'cp-cat': el => { CP.cat = el.dataset.k; CP.catAuto = false; const g = $('#cat-grid'); if (g) g.innerHTML = catGrid(); },
  'cp-linecat': el => { const i = +el.dataset.i; pickCat(k => { CP.lines[i].cat = k; CP.lines[i].auto = false; cpRefresh(); }, CP.lines[i].cat); },
  'cp-delline': el => { CP.lines.splice(+el.dataset.i, 1); if (!CP.lines.length) CP.lines.push({ n: '', monto: 0, cat: 'alim', cant: 1, auto: true }); cpRefresh(); },
  'cp-addline': () => { CP.lines.push({ n: '', monto: 0, cat: 'alim', cant: 1, auto: true }); cpRefresh(); setTimeout(() => { const ins = $$('[data-f="ln"]'); if (ins.length) ins[ins.length - 1].focus(); }, 30); },
  'cp-split': () => { CP.split = true; CP.lines = [{ n: CP.com || '', monto: CP.monto || 0, cat: CP.cat, cant: 1, auto: CP.catAuto }, { n: '', monto: 0, cat: 'alim', cant: 1, auto: true }]; cpRefresh(); },
  'cp-medio': el => { CP.medio = el.dataset.k; CP.medioTouched = true; CP.mesPago = null; if (!esTarjeta(CP.medio)) CP.cuotas = 1; cpRefresh(); },
  'cp-mespago': el => { CP.mesPago = el.dataset.k; cpRefresh(); },
  'cp-cuotas': el => { CP.cuotas = +el.dataset.k; cpRefresh(); },
  'cp-ingcat': el => { CP.ingCat = el.dataset.k; cpRefresh(); },
  'cp-por': el => { CP.por = el.dataset.k; cpRefresh(); },
  'cp-pf': el => { CP.pagoFondo = el.dataset.k || null; cpRefresh(); },
  'cp-adv': () => { CP.adv = true; cpRefresh(); },
  'cp-foto': () => { const f = $('#file-ticket'); if (f) { f.value = ''; f.click(); } },
  'cp-pegar': () => abrirPegar(),
  'metas-all': () => { S.ui.metasAll = !S.ui.metasAll; render(); },
  'paste-ok': (el, e, d) => { const t = $('#paste-txt').value; if (!t.trim()) { toast('Pegá el texto primero.', null, true); return; } closeSheet(d); leerTexto(t); },
  'cp-vefoto': () => { const u = CP.foto && CP.foto.url; if (u) openSheet({ title: 'Foto del ticket', body: `<img src="${u}" alt="Ticket" style="width:100%;border-radius:12px">` }); },
  'cp-quitafoto': () => { if (CP.foto && CP.foto.url) URL.revokeObjectURL(CP.foto.url); CP.foto = null; cpRefresh(); },
  'cp-resto': () => { const d = r2(CP.totalTicket - cpTotal()); if (d > 0) { CP.lines.push({ n: 'Sin detallar', monto: d, cat: 'otros', cant: 1, auto: false }); cpRefresh(); } },
  'cp-quick': () => { CP.quick = !CP.quick; cpRefresh(); },
  'cp-save': () => cpSave()
};
document.addEventListener('click', e => {
  if (e.target.closest('label[for="file-ticket"]') && CP) setTimeout(() => { const h = $('#foto-hint'); if (h && CP && !CP.foto && CP.scan.state !== 'loading') h.hidden = false; }, 7000);
  const tip = e.target.closest('[data-tip]');
  if (tip) { const svg = tip.closest('svg'); const ro = $('#ro-' + (svg && svg.dataset.ro)); if (ro) ro.textContent = tip.dataset.tip; return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  const d = sheetOf(el) || SHEETS[SHEETS.length - 1];
  fn(el, e, d);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'q-movs') { S.ui.q = el.value; renderKeep(el); return; }
  if (el.id === 'q-items') { S.ui.itemQ = el.value; renderKeep(el); return; }
  const f = el.dataset && el.dataset.f; if (!f) return;
  if (f === 'rep-pct') { const dd = destOf(el.dataset.id); dd.pct = +el.value; const a = document.getElementById('rp-pct-' + dd.id); if (a) a.textContent = el.value + '%'; const b = document.getElementById('rp-amt-' + dd.id); if (b) b.textContent = money(aportePlan(dd, S.mes)); return; }
  const d = sheetOf(el);
  if (d && d.id === 'cp') { cpInput(f, el.value, el); return; }
  if (d && d.id === 'cierre' && W) {
    if (f === 'w-row') { const r = W.rows[+el.dataset.i]; r.monto = el.value; r.touched = true; }
    else if (f === 'w-ap') { const a = W.ap[el.dataset.id]; a.monto = el.value; a.touched = true; }
    else if (f === 'w-val') { const v = W.val[el.dataset.id]; v.v = el.value; v.touched = true; }
    wUpdate(); return;
  }
  if (!d) return;
  if (f === 'fe-n') d.d.n = el.value; else if (f === 'fe-e') d.d.e = el.value || '💰'; else if (f === 'fe-a') d.d.aporte = parseMonto(el.value); else if (f === 'fe-d') { if (el.value) d.d.desde = el.value; else delete d.d.desde; } else if (f === 'fe-pct') d.d.pct = parseMonto(String(el.value).replace(',', '.')); else if (f === 'fe-s') d.d.saldo0 = parseMonto(el.value); else if (f === 'fe-p') d.d.plazo = parseInt(el.value) || 0; else if (f === 'fe-m') d.d.meta = parseMonto(el.value);
  else if (f === 'ce-n') d.x.n = el.value; else if (f === 'ce-e') d.x.e = el.value || '🏷️'; else if (f === 'ce-p') d.x.pres = parseMonto(el.value); else if (f === 'ce-pd') { if (el.value) d.x.presDesde = el.value; else delete d.x.presDesde; }
  else if (f === 'me-n') d.x.n = el.value; else if (f === 'me-m') d.x.monto = parseMonto(el.value);
  else if (f === 'pe-n') d.it.n = el.value; else if (f === 'pe-b') d.it.base = parseMonto(el.value); else if (f === 'pe-pct') d.it.pct = parseMonto(el.value) || 0; else if (f === 'pe-d') d.it.desde = el.value; else if (f === 'pe-h') d.it.hasta = el.value;
  else if (f === 'pe-ov') { if (el.value.trim() === '') delete d.it.ov[el.dataset.m]; else d.it.ov[el.dataset.m] = parseMonto(el.value); }
});
document.addEventListener('change', async e => {
  const el = e.target, f = el.dataset && el.dataset.f; const d = sheetOf(el);
  if (el.id === 'file-ticket') { if (CP && el.files && el.files.length) { const fs = [...el.files]; el.value = ''; adjuntarFoto(fs); } return; }
  if (f === 'ln' && CP && KNOWN) { const l = CP.lines[+el.dataset.i], k = KNOWN.get(keyOf(el.value)); if (k) { l.cat = S.apr[keyOf(el.value)] || k.cat; l.auto = false; if (!l.monto) l.monto = r2(k.last); cpRefresh(); } return; }
  if (f === 'rep-pct') { await guardar(saveCfg); render(); return; }
  if (f === 'rep-monto') { destOf(el.dataset.id).aporte = parseMonto(el.value); await guardar(saveCfg); render(); return; }
  if (el.id === 'it-cat') { const k = el.dataset.key; await guardar(() => Store.merge('cfg', 'aprendido', { [k]: el.value }), 'Listo: la próxima vez va a ese rubro'); return; }
  if (d && d.id === 'fondo' && f && f.startsWith('fp-')) { d.set(f.slice(3), el.value); paintSheet(d); return; }
  if (d && d.id === 'pe-select') return;
  if (f === 'pe-c' && d) { d.it.cat = el.value; return; }
  if (f === 'fecha' && d && d.id === 'cp') { cpInput('fecha', el.value, el); if (esTarjeta(CP.medio)) cpRefresh(); return; }
  if (!f || !f.startsWith('st-')) return;
  const c = cfg();
  if (f === 'st-user') c.usuarios[+el.dataset.i] = el.value.trim() || c.usuarios[+el.dataset.i];
  else if (f === 'st-tc') c.tc = parseMonto(el.value) || c.tc; else if (f === 'st-tasa') c.tasa = parseMonto(String(el.value).replace(',', '.')) || 0;
  else if (f === 'st-caja') c.caja = parseMonto(el.value); else if (f === 'st-ini') c.inicio = el.value || c.inicio;
  else if (f === 'st-cierre') c.tarjetas[+el.dataset.i].cierre = Math.min(31, parseInt(el.value) || 0);
  if (await guardar(saveCfg)) { if (S.user && !c.usuarios.includes(S.user)) S.user = c.usuarios[0]; render(); }
});
document.addEventListener('paste', e => {
  const z = e.target.closest && e.target.closest('#paste-zone'); if (!z) return;
  const f = [...((e.clipboardData && e.clipboardData.files) || [])].find(x => x.type.startsWith('image/')) || [...((e.clipboardData && e.clipboardData.items) || [])].map(i => i.kind === 'file' ? i.getAsFile() : null).find(x => x && x.type.startsWith('image/'));
  e.preventDefault(); if (!f) { toast('No encontré una imagen copiada. Copiá la captura primero.', null, true); return; }
  const d = sheetOf(z); if (d) closeSheet(d); if (CP) adjuntarFoto([f]);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && SHEETS.length) closeSheet(); });

/* ============ Render y arranque ============ */
const VIEWS = { inicio: vInicio, movs: vMovs, analisis: vAnalisis, fondos: vFondos, ajustes: vAjustes };
function render() {
  if (!S.ready) return;
  const y = window.scrollY;
  try { $('#app').innerHTML = header() + (VIEWS[S.vista] || vInicio)(); }
  catch (err) { console.error(err); $('#app').innerHTML = `<div class="card">${emptyState('⚠️', 'Algo salió mal al mostrar esta pantalla', esc(String(err.message || err)), '<button class="btn" data-act="go" data-v="inicio">Volver al inicio</button>')}</div>`; }
  paintNav(); window.scrollTo(0, y);
}
function renderKeep(el) {
  const id = el.id, pos = el.selectionStart; render(); const n = document.getElementById(id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { } }
}
function onData() {
  if (!S.ready) { if (S.loaded.mov && S.loaded.cfg) { S.ready = true; const b = $('#boot'); if (b) b.remove(); route(); render(); autoMes(); } return; }
  render();
}
function autoMes() { if (S.mes < cfg().inicio && S.mes === ymNow()) S.mes = ymNow(); }
function route() { const h = (location.hash || '').replace('#', ''); if (VIEWS[h]) S.vista = h; }
window.addEventListener('hashchange', () => { route(); render(); });
setTimeout(() => { if (S.ready) render(); }, 3300);
Store.init().catch(e => { console.error(e); $('#boot').innerHTML = '<div class="card">No se pudo iniciar la app. Recargá la página.</div>'; });
