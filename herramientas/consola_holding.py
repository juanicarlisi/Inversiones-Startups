#!/usr/bin/env python3
"""Consola del Holding: convierte cartera/consola.yaml en la página que se publica como artefacto privado.

Uso:
  python3 herramientas/consola_holding.py            # escribe informes/consola-holding.html
La página guarda lo que marca el fundador (pendientes hechos y notas para Claude) en la base del artefacto:
colecciones `marcas/<id>` y `notas/<proyecto>`. Claude las lee al empezar cada sesión (ArtifactData).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "cartera" / "consola.yaml"
SALIDA = RAIZ / "informes" / "consola-holding.html"

PAGINA = r"""<title>Consola del Holding</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* Tablero de control de un holding chico: una grilla de proyectos, lo que te toca y lo que viene. */
:root {
  --fondo: #f3f5f4; --sup: #ffffff; --sup2: #e9eeec; --tinta: #14201c; --tenue: #5b6a64; --linea: #d5ddd9;
  --acento: #0a6b52; --acento-t: #ffffff; --verde: #0f7a4d; --ambar: #a15c00; --rojo: #b3261e; --gris: #7b8782;
  --verde-f: #dcf0e5; --ambar-f: #f9ead2; --rojo-f: #f8dedb; --gris-f: #e6eae8;
  --cuerpo: "IBM Plex Sans", system-ui, sans-serif; --titulo: "IBM Plex Sans Condensed", "IBM Plex Sans", system-ui, sans-serif;
  --dato: "IBM Plex Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --fondo: #0f1614; --sup: #17201d; --sup2: #1f2a26; --tinta: #e8efec; --tenue: #9aa9a3; --linea: #2b3833;
  --acento: #4fc39f; --acento-t: #06231a; --verde: #5fcf95; --ambar: #f0b45a; --rojo: #ff8a80; --gris: #8d9994;
  --verde-f: #143326; --ambar-f: #3a2a10; --rojo-f: #3d1a17; --gris-f: #222c29; color-scheme: dark; } }
:root[data-theme="dark"] {
  --fondo: #0f1614; --sup: #17201d; --sup2: #1f2a26; --tinta: #e8efec; --tenue: #9aa9a3; --linea: #2b3833;
  --acento: #4fc39f; --acento-t: #06231a; --verde: #5fcf95; --ambar: #f0b45a; --rojo: #ff8a80; --gris: #8d9994;
  --verde-f: #143326; --ambar-f: #3a2a10; --rojo-f: #3d1a17; --gris-f: #222c29; color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--fondo); color: var(--tinta); font: 15px/1.5 var(--cuerpo); }
.marco { max-width: 1120px; margin: 0 auto; padding-block: 20px 56px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { font-family: var(--titulo); margin: 0; text-wrap: balance; letter-spacing: .01em; }
h1 { font-size: 30px; line-height: 1.1; }
h2 { font-size: 20px; }
h3 { font-size: 17px; }
p { margin: 0; }
button { font: inherit; color: inherit; cursor: pointer; }
:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }
.cab { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 8px 24px; }
.cab small { color: var(--tenue); font-family: var(--dato); font-size: 12px; }
.frase { margin-top: 10px; max-width: 70ch; color: var(--tenue); }
.pest { display: flex; gap: 4px; margin: 22px 0 18px; border-bottom: 1px solid var(--linea); overflow-x: auto; }
.pest button { border: 0; background: none; padding: 10px 14px; white-space: nowrap; color: var(--tenue); font-weight: 500;
  border-bottom: 3px solid transparent; margin-bottom: -1px; }
.pest button[aria-selected="true"] { color: var(--tinta); border-bottom-color: var(--acento); }
.pest .cuenta { font-family: var(--dato); font-size: 12px; background: var(--acento); color: var(--acento-t); border-radius: 9px; padding: 1px 7px; margin-left: 6px; }
.grilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.tarjeta { background: var(--sup); border: 1px solid var(--linea); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column;
  gap: 10px; text-align: left; min-width: 0; }
button.tarjeta:hover { border-color: var(--acento); }
.fila { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
.pastilla { font-size: 12px; font-weight: 600; border-radius: 6px; padding: 2px 8px; white-space: nowrap; }
.e-verde { background: var(--verde-f); color: var(--verde); } .e-ambar { background: var(--ambar-f); color: var(--ambar); }
.e-rojo { background: var(--rojo-f); color: var(--rojo); } .e-gris { background: var(--gris-f); color: var(--gris); }
.tenue { color: var(--tenue); } .chico { font-size: 13px; }
.dato { font-family: var(--dato); font-variant-numeric: tabular-nums; }
.barra { height: 6px; background: var(--sup2); border-radius: 3px; overflow: hidden; }
.barra span { display: block; height: 100%; background: var(--acento); }
.etapas { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
.etapas span { height: 5px; border-radius: 2px; background: var(--sup2); }
.etapas span.h { background: var(--acento); } .etapas span.a { background: var(--acento); opacity: .45; }
.seccion { margin-top: 26px; display: flex; flex-direction: column; gap: 12px; }
.lista { display: flex; flex-direction: column; gap: 8px; }
.item { background: var(--sup); border: 1px solid var(--linea); border-radius: 10px; padding: 12px 14px; display: grid;
  grid-template-columns: auto minmax(0, 1fr); gap: 4px 12px; align-items: start; }
.item input[type="checkbox"] { width: 20px; height: 20px; margin-top: 2px; accent-color: var(--acento); }
.item.hecho .que { text-decoration: line-through; color: var(--tenue); }
.item .meta { grid-column: 2; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; color: var(--tenue); }
.quien { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; border-radius: 5px; padding: 1px 6px; }
.q-vos { background: var(--ambar-f); color: var(--ambar); } .q-claude { background: var(--sup2); color: var(--tenue); }
.paso { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 8px 0; border-top: 1px solid var(--linea); }
.paso:first-child { border-top: 0; }
.detalle { background: var(--sup); border: 1px solid var(--linea); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 16px; }
.dos { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 20px; }
.rot { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--tenue); margin-bottom: 4px; }
a { color: var(--acento); }
textarea { width: 100%; min-height: 84px; font: inherit; color: inherit; background: var(--fondo); border: 1px solid var(--linea); border-radius: 8px; padding: 8px 10px; resize: vertical; }
.guardar { align-self: flex-start; background: var(--acento); color: var(--acento-t); border: 0; border-radius: 8px; padding: 7px 14px; font-weight: 600; }
.volver { align-self: flex-start; background: none; border: 1px solid var(--linea); border-radius: 8px; padding: 5px 12px; }
.mes { font-family: var(--titulo); font-size: 15px; color: var(--tenue); margin-top: 10px; }
.aviso { font-size: 13px; color: var(--tenue); min-height: 1.5em; }
@media (max-width: 720px) { .dos { grid-template-columns: 1fr; } h1 { font-size: 24px; } .paso { grid-template-columns: 56px minmax(0, 1fr); } .paso .cuando { grid-column: 2; } }
</style>
<div class="marco">
  <header class="cab">
    <div><h1>Consola del Holding</h1></div>
    <small id="fecha"></small>
  </header>
  <p class="frase" id="frase"></p>
  <nav class="pest" role="tablist" id="pest"></nav>
  <main id="vista"></main>
</div>
<script id="datos" type="application/json">__DATOS__</script>
<script>
(() => {
  const D = JSON.parse(document.getElementById('datos').textContent);
  const $ = (s) => document.querySelector(s);
  const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fecha = (f) => { const [a, m, d] = String(f).split('-').map(Number); return d ? `${d} de ${MESES[m - 1]} de ${a}` : `${MESES[m - 1]} de ${a}`; };
  const corta = (f) => { const [a, m, d] = String(f).split('-').map(Number); return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}`; };
  const ESTADO = { verde: 'En marcha', ambar: 'Atención', rojo: 'Trabado', gris: 'Programado' };
  const P = Object.fromEntries(D.proyectos.map((p) => [p.id, p]));
  const marcas = {}, notas = {};
  let db = null, pest = 'hoy', abierto = null, aviso = '';
  try { pest = localStorage.getItem('consola.pest') || 'hoy'; } catch { /* sin almacenamiento */ }

  const hecho = (id) => !!marcas[id]?.hecho;
  const abiertos = () => D.pendientes.filter((x) => !hecho(x.id)).sort((a, b) => a.prioridad - b.prioridad);
  const etapas = (p) => { const i = D.etapas.indexOf(p.etapa); return `<div class="etapas" title="${esc(p.etapa)}">${D.etapas.map((e, j) => `<span class="${j < i ? 'h' : j === i ? 'a' : ''}"></span>`).join('')}</div>`; };

  function tarjeta(p) {
    return `<button class="tarjeta" data-abrir="${esc(p.id)}">
      <div class="fila"><h3>${esc(p.nombre)}</h3><span class="pastilla e-${esc(p.estado)}">${esc(ESTADO[p.estado])}</span></div>
      <p class="chico tenue">${esc(p.que)}</p>
      ${etapas(p)}
      <div class="fila chico"><span class="tenue">Etapa: ${esc(p.etapa)}</span><span class="dato">${p.avance}%</span></div>
      <div class="chico"><span class="dato">${esc(corta(p.hito.fecha))}</span> · ${esc(p.hito.que)}</div>
    </button>`;
  }
  function pendiente(x) {
    const p = P[x.proyecto];
    return `<label class="item ${hecho(x.id) ? 'hecho' : ''}"><input type="checkbox" data-marca="${esc(x.id)}" ${hecho(x.id) ? 'checked' : ''} ${db ? '' : 'disabled'}>
      <span class="que">${esc(x.que)}</span>
      <span class="meta"><span>${esc(p?.nombre ?? x.proyecto)}</span><span>${esc(x.tiempo)}</span><span>${esc(x.cuando)}</span>${x.donde ? `<span>Dónde: ${esc(x.donde)}</span>` : ''}</span></label>`;
  }
  function vistaHoy() {
    const top = abiertos().slice(0, 3), activos = D.proyectos.filter((p) => p.estado !== 'gris'), resto = D.proyectos.filter((p) => p.estado === 'gris');
    return `<section class="seccion"><h2>Te toca a vos</h2><div class="lista">${top.map(pendiente).join('') || '<p class="tenue">Nada pendiente.</p>'}</div></section>
      <section class="seccion"><h2>En marcha</h2><div class="grilla">${activos.map(tarjeta).join('')}</div></section>
      <section class="seccion"><h2>Programados</h2><div class="grilla">${resto.map(tarjeta).join('')}</div></section>
      <section class="seccion"><h2>Novedades</h2><div>${D.novedades.map((n) => `<div class="paso"><span class="dato chico">${esc(corta(n.fecha))}</span><span>${esc(n.que)}</span></div>`).join('')}</div></section>`;
  }
  function vistaProyecto(p) {
    const enl = (p.enlaces ?? []).map((e) => e.url ? `<li><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.nombre)}</a></li>` : `<li>${esc(e.nombre)}: <span class="dato chico">${esc(e.ruta)}</span></li>`).join('');
    const mios = D.pendientes.filter((x) => x.proyecto === p.id && !hecho(x.id));
    return `<button class="volver" data-abrir="">← Todos los proyectos</button>
      <article class="detalle" style="margin-top:12px">
        <div class="fila"><h2>${esc(p.nombre)}</h2><span class="pastilla e-${esc(p.estado)}">${esc(ESTADO[p.estado])}</span></div>
        <p>${esc(p.que)}</p>
        ${p.nota ? `<p class="chico tenue">${esc(p.nota)}</p>` : ''}
        <div><div class="rot">Dónde está</div>${etapas(p)}<div class="fila chico" style="margin-top:6px"><span>${D.etapas.map((e) => e === p.etapa ? `<b>${esc(e)}</b>` : `<span class="tenue">${esc(e)}</span>`).join(' → ')}</span><span class="dato">${p.avance}%${p.avance_de ? ` ${esc(p.avance_de)}` : ''}</span></div></div>
        <div class="dos">
          <div><div class="rot">Próximos pasos</div>${(p.proximos ?? []).map((x) => `<div class="paso"><span class="quien q-${esc(x.quien)}">${x.quien === 'vos' ? 'Vos' : 'Claude'}</span><span>${esc(x.que)}</span><span class="cuando chico tenue">${esc(x.cuando)}</span></div>`).join('') || '<p class="tenue chico">Sin pasos cargados todavía.</p>'}
            ${(p.hecho ?? []).length ? `<div class="rot" style="margin-top:14px">Hecho</div><ul class="chico" style="margin:0;padding-left:18px">${p.hecho.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}</div>
          <div class="lista">
            <div><div class="rot">Próximo hito</div><p><span class="dato">${esc(fecha(p.hito.fecha))}</span><br>${esc(p.hito.que)}</p></div>
            <div><div class="rot">Cómo gana plata</div><p>${esc(p.gana ?? 'A definir.')}</p></div>
            ${p.corte ? `<div><div class="rot">Regla de corte</div><p class="chico">${esc(p.corte)}</p></div>` : ''}
            ${enl ? `<div><div class="rot">Enlaces</div><ul class="chico" style="margin:0;padding-left:18px">${enl}</ul></div>` : ''}
          </div>
        </div>
        ${mios.length ? `<div><div class="rot">Te toca a vos</div><div class="lista">${mios.map(pendiente).join('')}</div></div>` : ''}
        <div><div class="rot">Tu nota para Claude sobre ${esc(p.nombre)}</div>
          <textarea id="nota" ${db ? '' : 'disabled'} placeholder="${db ? 'Lo que quieras que lea al empezar la próxima sesión.' : 'Las notas se guardan cuando abrís la consola con tu sesión de Claude.'}">${esc(notas[p.id]?.texto ?? '')}</textarea>
          <div class="fila" style="margin-top:8px"><button class="guardar" data-nota="${esc(p.id)}" ${db ? '' : 'disabled'}>Guardar nota</button><span class="aviso" id="aviso">${esc(aviso)}</span></div></div>
      </article>`;
  }
  function vistaPendientes() {
    const ab = abiertos(), he = D.pendientes.filter((x) => hecho(x.id));
    return `<section class="seccion"><h2>Pendientes, por prioridad</h2><div class="lista">${ab.map(pendiente).join('') || '<p class="tenue">Nada pendiente.</p>'}</div></section>
      ${he.length ? `<section class="seccion"><h2>Marcados como hechos</h2><div class="lista">${he.map(pendiente).join('')}</div></section>` : ''}
      <p class="aviso" style="margin-top:12px">${db ? 'Lo que marcás acá lo leo al empezar la próxima sesión.' : 'Para marcar, abrí la consola con tu sesión de Claude.'}</p>`;
  }
  function vistaLinea() {
    const hitos = D.proyectos.map((p) => ({ f: String(p.hito.fecha), p })).sort((a, b) => a.f.localeCompare(b.f));
    let mes = '', out = '';
    for (const h of hitos) {
      const m = h.f.slice(0, 7);
      if (m !== mes) { mes = m; const [a, mm] = m.split('-').map(Number); out += `<div class="mes">${MESES[mm - 1]} de ${a}</div>`; }
      out += `<div class="paso"><span class="dato chico">${esc(corta(h.f))}</span><span><b>${esc(h.p.nombre)}</b> · ${esc(h.p.hito.que)}</span><span class="pastilla e-${esc(h.p.estado)}">${esc(ESTADO[h.p.estado])}</span></div>`;
    }
    return `<section class="seccion"><h2>Lo que viene</h2><div>${out}</div></section>`;
  }

  function pintar() {
    $('#fecha').textContent = `Actualizada el ${fecha(D.actualizado)}`;
    $('#frase').textContent = D.en_una_frase;
    const n = abiertos().length;
    $('#pest').innerHTML = [['hoy', 'Hoy'], ['pendientes', `Te toca a vos${n ? `<span class="cuenta">${n}</span>` : ''}`], ['linea', 'Lo que viene']]
      .map(([id, t]) => `<button role="tab" aria-selected="${pest === id && !abierto}" data-pest="${id}">${t}</button>`).join('');
    $('#vista').innerHTML = abierto && P[abierto] ? vistaProyecto(P[abierto]) : pest === 'pendientes' ? vistaPendientes() : pest === 'linea' ? vistaLinea() : vistaHoy();
  }

  document.addEventListener('click', async (ev) => {
    const t = ev.target.closest('[data-pest],[data-abrir],[data-nota]');
    if (!t) return;
    if (t.dataset.pest) { pest = t.dataset.pest; abierto = null; try { localStorage.setItem('consola.pest', pest); } catch { /* nada */ } pintar(); }
    else if (t.dataset.abrir !== undefined) { abierto = t.dataset.abrir || null; aviso = ''; pintar(); window.scrollTo({ top: 0 }); }
    else if (t.dataset.nota && db) {
      const id = t.dataset.nota, texto = $('#nota').value;
      try { await db.doc(`notas/${id}`).set({ texto, fecha: new Date().toISOString() }); notas[id] = { texto }; aviso = 'Guardada.'; }
      catch { aviso = 'No se pudo guardar. Probá de nuevo.'; }
      const a = $('#aviso'); if (a) a.textContent = aviso;
    }
  });
  document.addEventListener('change', async (ev) => {
    const c = ev.target.closest('[data-marca]');
    if (!c || !db) return;
    const id = c.dataset.marca, v = c.checked;
    marcas[id] = { hecho: v }; pintar();
    try { await db.doc(`marcas/${id}`).set({ hecho: v, fecha: new Date().toISOString() }); }
    catch { marcas[id] = { hecho: !v }; pintar(); }
  });

  pintar();
  (async () => {
    try {
      const base = await window.claude?.use?.('db');
      if (!base) return;
      db = base; pintar();
      base.collection('marcas').onSnapshot((s) => { s.docs.forEach((d) => { marcas[d.id] = d.data() || {}; }); if (!document.activeElement?.matches?.('textarea')) pintar(); }, () => {});
      base.collection('notas').onSnapshot((s) => { s.docs.forEach((d) => { notas[d.id] = d.data() || {}; }); if (!document.activeElement?.matches?.('textarea')) pintar(); }, () => {});
    } catch { /* sin base: la consola se lee igual */ }
  })();
})();
</script>
"""


def main() -> int:
    datos = yaml.safe_load(FUENTE.read_text(encoding="utf-8"))
    ids = [p["id"] for p in datos["proyectos"]]
    for x in datos["pendientes"]:
        if x["proyecto"] not in ids:
            raise SystemExit(f"pendiente {x['id']}: proyecto {x['proyecto']} no existe")
    for p in datos["proyectos"]:
        if p["etapa"] not in datos["etapas"]:
            raise SystemExit(f"{p['id']}: etapa {p['etapa']} no está en la lista")
    crudo = json.dumps(datos, ensure_ascii=False, default=str).replace("</", "<\\/")
    SALIDA.write_text(PAGINA.replace("__DATOS__", crudo), encoding="utf-8")
    print(f"{SALIDA.relative_to(RAIZ)}: {len(datos['proyectos'])} proyectos, {len(datos['pendientes'])} pendientes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
