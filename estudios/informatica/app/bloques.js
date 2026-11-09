/* ====== Utilidades y marcado en línea ====== */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Convierte el marcado de los textos a HTML seguro.
   **negrita** *cursiva* `código` [[término]] [[texto|término]] [#fuente] [texto](https://enlace) */
function inline(s, ctx) {
  const codigos = [];
  s = String(s == null ? '' : s).replace(/`([^`]+)`/g, (_, c) => { codigos.push(c); return '\u0000' + (codigos.length - 1) + '\u0000'; });
  s = esc(s);
  s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => `<button type="button" class="term" data-t="${esc(norm(b || a))}">${a}</button>`);
  s = s.replace(/\[#([a-z0-9_.-]+)\]/gi, (_, id) => {
    if (!ctx || !ctx.citas) return '';
    let i = ctx.citas.indexOf(id); if (i < 0) { ctx.citas.push(id); i = ctx.citas.length - 1; }
    return `<a class="cita-n" href="#fuente-${i + 1}" title="${esc((DATOS.fuentes[id] || {}).t || id)}">[${i + 1}]</a>`;
  });
  s = s.replace(/\[@(\d\d-\d\d[a-z]?)\]/g, (_, id) => (typeof PLAN !== 'undefined' && PLAN[id]) ? `<a href="#dia-${id}">Día ${PLAN[id].n}</a>` : '');
  s = s.replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (_, t, u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(¿¡"«—])\*([^*\n]+)\*(?=[\s).,;:!?"»—]|$)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codigos[+i])}</code>`);
}
const parrafos = (x, ctx) => (Array.isArray(x) ? x : [x]).map(p => `<p>${inline(p, ctx)}</p>`).join('');

/* ====== Resaltado de código (mínimo, sin dependencias) ====== */
const KW = {
  js: 'const let var function return if else for while do break continue switch case default new class extends import export from async await try catch finally throw typeof instanceof in of null undefined true false this super yield delete void',
  ts: 'const let var function return if else for while do break continue switch case default new class extends implements interface type enum import export from async await try catch finally throw typeof instanceof in of null undefined true false this readonly public private protected as',
  py: 'def return if elif else for while break continue class import from as try except finally raise with lambda pass None True False and or not in is yield async await self',
  sql: 'select from where group by having order limit offset insert into values update set delete create table alter drop index join inner left right full outer cross on as and or not null primary key foreign references unique check default distinct union all with case when then else end in like between exists returning begin commit rollback',
  bash: 'if then else fi for do done while case esac function in echo cd ls cat grep export sudo',
  c: 'int char float double void long short unsigned signed struct union enum typedef static const if else for while do break continue return switch case default sizeof NULL include define',
  json: 'true false null', html: '', css: '', asm: '', go: 'func package import var const type struct interface return if else for range go chan select defer map nil true false', rust: 'fn let mut const struct enum impl trait pub use mod match if else for while loop return self Self true false Some None Ok Err', java: 'public private protected class interface extends implements static final void int long double boolean new return if else for while try catch throw import package null true false this', kotlin: 'fun val var class object interface if else for while when return null true false import package is in', swift: 'func let var class struct enum protocol if else for while switch case return nil true false import guard self init'
};
function resaltar(code, lang) {
  const kws = new Set((KW[lang] || KW.js).split(' ').filter(Boolean));
  const ci = lang === 'sql';
  const reCom = lang === 'py' || lang === 'bash' ? '#[^\\n]*' : lang === 'sql' ? '--[^\\n]*' : lang === 'asm' ? ';[^\\n]*' : '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/';
  const re = new RegExp(`(${reCom})|("(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\\\\.|[^\`\\\\])*\`)|(\\b0x[0-9a-fA-F]+\\b|\\b0b[01]+\\b|\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_$][\\w$]*)(?=\\s*\\()|([A-Za-z_$][\\w$]*)|([<>&])`, 'g');
  let out = '', i = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(i, m.index)); i = re.lastIndex;
    if (m[1]) out += `<span class="c">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="s">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="n">${esc(m[3])}</span>`;
    else if (m[4]) out += kws.has(ci ? m[4].toLowerCase() : m[4]) ? `<span class="k">${esc(m[4])}</span>` : `<span class="f">${esc(m[4])}</span>`;
    else if (m[5]) out += kws.has(ci ? m[5].toLowerCase() : m[5]) ? `<span class="k">${esc(m[5])}</span>` : esc(m[5]);
    else out += esc(m[6]);
  }
  return out + esc(code.slice(i));
}

/* ====== Diagramas ====== */
const kc = k => (k ? ' k-' + k : '');
const D = {
  capas(b, ctx) {
    return `<div class="capas">${b.capas.map(c => `<div class="capa${kc(c.k)}"><b>${inline(c.n, ctx)}</b><span>${inline(c.d || '', ctx)}</span></div>`).join('')}</div>`;
  },
  flujo(b, ctx) {
    return `<div class="flujo">${b.filas.map((fila, i) => {
      const nodos = fila.nodos || fila;
      const html = nodos.map((n, j) => `${j ? `<div class="flecha">→${n.e ? `<small>${esc(n.e)}</small>` : ''}</div>` : ''}<div class="nodo${kc(n.k)}">${inline(n.t, ctx)}${n.s ? `<small>${inline(n.s, ctx)}</small>` : ''}</div>`).join('');
      return `${i && fila.baja ? `<div class="baja">${inline(fila.baja, ctx)}</div>` : ''}<div class="fila-f">${html}</div>`;
    }).join('')}</div>`;
  },
  celdas(b, ctx) {
    return `<div class="celdas">${b.filas.map(f => `<div class="fila-c">${f.e ? `<span class="et">${inline(f.e, ctx)}</span>` : ''}${f.celdas.map(c => { c = typeof c === 'object' ? c : { t: c }; return `<div class="celda${kc(c.k)}">${esc(c.t)}${c.s ? `<small>${esc(c.s)}</small>` : ''}</div>`; }).join('')}${f.nota ? `<span class="et">${inline(f.nota, ctx)}</span>` : ''}</div>`).join('')}</div>`;
  },
  arbol(b, ctx) {
    const nodo = n => `<li><span class="tn${kc(n.k)}">${inline(n.t, ctx)}${n.s ? `<small>${inline(n.s, ctx)}</small>` : ''}</span>${n.h && n.h.length ? `<ul>${n.h.map(nodo).join('')}</ul>` : ''}</li>`;
    return `<ul class="arbol">${nodo(b.raiz)}</ul>`;
  },
  'linea-tiempo'(b, ctx) {
    return `<ul class="lt">${b.eventos.map(e => `<li><span class="a">${esc(e.a)}</span> <b>${inline(e.t, ctx)}</b>${e.d ? `<p>${inline(e.d, ctx)}</p>` : ''}</li>`).join('')}</ul>`;
  },
  comparar(b, ctx) {
    return `<div class="comparar">${[b.izq, b.der].map(l => `<div class="${kc(l.k).trim()}"><h4>${inline(l.t, ctx)}</h4><ul>${l.items.map(i => `<li>${inline(i, ctx)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  },
  svg(b) {
    const s = String(b.x || '');
    if (!/^\s*<svg[\s>]/.test(s) || /<script|on\w+\s*=|javascript:|<foreignObject|<iframe/i.test(s)) return '<p><em>[diagrama no válido]</em></p>';
    return s;
  },
  secuencia(b, ctx, id) {
    const A = b.actores, n = A.length, W = Math.max(720, n * 150), pad = 70, gap = n > 1 ? (W - 2 * pad) / (n - 1) : 0;
    const X = i => n > 1 ? pad + i * gap : W / 2, top = 56, paso = 52, H = top + 30 + b.mensajes.length * paso;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(b.cap || 'Diagrama de secuencia')}"><defs><marker id="fl${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink)"/></marker></defs>`;
    A.forEach((a, i) => {
      s += `<line x1="${X(i)}" y1="${top - 8}" x2="${X(i)}" y2="${H - 8}" stroke="var(--line)" stroke-width="2" stroke-dasharray="5 5"/>`;
      s += `<g class="${kc(a.k).trim()}"><rect x="${X(i) - 62}" y="8" width="124" height="38" rx="9" fill="var(--kb,var(--surface-2))" stroke="var(--kc,var(--muted))" stroke-width="1.6"/><text x="${X(i)}" y="32" text-anchor="middle" font-size="13" font-weight="700">${esc(a.n || a)}</text></g>`;
    });
    b.mensajes.forEach((m, i) => {
      const y = top + 24 + i * paso, x1 = X(m.de), x2 = X(m.a), dash = m.resp ? ' stroke-dasharray="6 4"' : '';
      s += `<g class="msg" data-i="${i}">`;
      const halo = 'style="paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round"';
      if (m.de === m.a) { const dir = x1 > W * 0.55 ? -1 : 1; s += `<path d="M${x1} ${y - 10} h${34 * dir} v22 h${-34 * dir}" fill="none" stroke="var(--ink)" stroke-width="1.6" marker-end="url(#fl${id})"/><text x="${x1 + 42 * dir}" y="${y + 6}" text-anchor="${dir > 0 ? 'start' : 'end'}" font-size="12.5" ${halo}>${i + 1}. ${esc(m.t)}</text>`; }
      else s += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--ink)" stroke-width="1.7"${dash} marker-end="url(#fl${id})"/><text x="${(x1 + x2) / 2}" y="${y - 7}" text-anchor="middle" font-size="12.5" ${halo}>${i + 1}. ${esc(m.t)}</text>`;
      s += '</g>';
    });
    s += '</svg>';
    const expl = b.mensajes.map((m, i) => m.d ? `<li data-i="${i}">${inline(m.d, ctx)}</li>` : '').join('');
    return `<div class="seq" data-total="${b.mensajes.length}">${s}<div class="pasos-c"><button type="button" class="btn chico" data-acc="seq-ant">◂ Anterior</button><button type="button" class="btn chico prim" data-acc="seq-sig">Paso a paso ▸</button><button type="button" class="btn chico" data-acc="seq-todo">Ver todo</button></div><div class="paso-txt" aria-live="polite" hidden></div>${expl ? `<details class="nota-det"><summary style="cursor:pointer;font:700 .85rem var(--f-ui);color:var(--circ);margin-top:10px">Leer cada paso explicado</summary><ol>${expl}</ol></details>` : ''}</div>`;
  },
  grafo(b, ctx, id) {
    const W = 800, H = b.alto || 360, px = x => 50 + x * 7, py = y => 30 + y * (H - 60) / 100;
    const N = Object.fromEntries(b.nodos.map(n => [n.id, n]));
    const w = n => Math.max(56, 8.2 * (n.t || n.id).length + 22);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(b.cap || 'Diagrama')}"><defs><marker id="ar${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>`;
    (b.aristas || []).forEach(e => {
      const a = N[e.de], z = N[e.a]; if (!a || !z) return;
      const x1 = px(a.x), y1 = py(a.y), x2 = px(z.x), y2 = py(z.y);
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ra = Math.min(w(a) / 2, 22 + Math.abs(dx / L) * 0) , rz = Math.abs(dy / L) > .6 ? 20 : w(z) / 2;
      const ox1 = x1 + dx / L * (Math.abs(dy / L) > .6 ? 20 : ra + 2), oy1 = y1 + dy / L * (Math.abs(dy / L) > .6 ? 20 : 0), ox2 = x2 - dx / L * (rz + 3), oy2 = y2 - dy / L * (Math.abs(dy / L) > .6 ? 22 : 0);
      s += `<line x1="${ox1}" y1="${oy1}" x2="${ox2}" y2="${oy2}" stroke="var(--muted)" stroke-width="1.8"${e.dash ? ' stroke-dasharray="6 4"' : ''}${e.dir ? ` marker-end="url(#ar${id})"` : ''}/>`;
      if (e.t) s += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" text-anchor="middle" font-size="11.5" style="paint-order:stroke;stroke:var(--surface);stroke-width:4px">${esc(e.t)}</text>`;
    });
    b.nodos.forEach(n => { const x = px(n.x), y = py(n.y), ww = w(n); s += `<g class="${kc(n.k).trim()}"><rect x="${x - ww / 2}" y="${y - 19}" width="${ww}" height="38" rx="10" fill="var(--kb,var(--surface-2))" stroke="var(--kc,var(--muted))" stroke-width="1.7"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="600">${esc(n.t || n.id)}</text></g>`; });
    return s + '</svg>';
  }
};

/* ====== Bloques ====== */
const ETQ = { analogia: 'Pensalo así', idea: 'La idea clave', ojo: 'Ojo', mito: 'Mito y realidad', dato: 'Dato', historia: 'Historia', vigencia: 'Esto cambia con el tiempo', pregunta: 'Frená y pensá' };
let _id = 0;
const B = {
  h: (b, c) => `<h2 id="s${c.h2++}">${inline(b.x, c)}</h2>`,
  h3: (b, c) => `<h3>${inline(b.x, c)}</h3>`,
  p: (b, c) => parrafos(b.x, c),
  lista: (b, c) => { const t = b.ord ? 'ol' : 'ul'; return `<${t}>${b.items.map(i => `<li>${inline(i, c)}</li>`).join('')}</${t}>`; },
  nota: (b, c) => `<aside class="nota ${esc(b.k || 'idea')}"><span class="et">${esc(b.titulo || ETQ[b.k] || 'Nota')}</span>${parrafos(b.x, c)}${b.lista ? `<ul>${b.lista.map(i => `<li>${inline(i, c)}</li>`).join('')}</ul>` : ''}</aside>`,
  pensa: (b, c) => `<aside class="nota pregunta"><span class="et">Frená y pensá</span>${parrafos(b.x, c)}<details><summary>Ver una respuesta posible</summary><div>${parrafos(b.resp, c)}</div></details></aside>`,
  tabla: (b, c) => `<figure><div class="tabla-w"><table><thead><tr>${b.cab.map(h => `<th>${inline(h, c)}</th>`).join('')}</tr></thead><tbody>${b.filas.map(f => `<tr>${f.map(x => `<td>${inline(x, c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${b.cap ? `<figcaption class="cap">${inline(b.cap, c)}</figcaption>` : ''}</figure>`,
  codigo: (b, c) => {
    const id = 'cod' + (++_id), lang = b.lang || 'js';
    if (b.ejecutable) return `<figure class="codigo" data-js><div class="cab"><span>${esc(lang)} · editable</span><span><button type="button" class="btn" data-acc="js-reset">Restaurar</button> <button type="button" class="btn" data-acc="js-run">▶ Ejecutar</button></span></div><textarea spellcheck="false" aria-label="Código editable" data-orig="${esc(b.x)}">${esc(b.x)}</textarea><div class="salida" aria-live="polite">Apretá «Ejecutar» para ver la salida.</div>${b.cap ? `<figcaption class="cap" style="padding:0 14px 10px;color:#9fb0c0">${inline(b.cap, c)}</figcaption>` : ''}</figure>`;
    return `<figure class="codigo"><div class="cab"><span>${esc(lang)}</span><button type="button" class="btn" data-acc="copiar">Copiar</button></div><pre><code>${resaltar(b.x, lang)}</code></pre>${b.cap ? `<figcaption class="cap" style="padding:0 14px 10px;color:#9fb0c0">${inline(b.cap, c)}</figcaption>` : ''}</figure>`;
  },
  terminal: (b, c) => `<figure class="terminal"><div class="barra-t"><i></i><i></i><i></i></div><div class="cuerpo">${b.lineas.map(l => (l.c != null ? `<span class="p">${esc(l.p || '$')} </span>${esc(l.c)}\n` : '') + (l.s ? `<span class="out">${esc(l.s)}</span>` : '')).join('')}</div>${b.cap ? `<figcaption class="cap" style="padding:0 14px 10px">${inline(b.cap, c)}</figcaption>` : ''}</figure>`,
  diagrama: (b, c) => {
    const f = D[b.tipo]; if (!f) return `<p><em>[diagrama ${esc(b.tipo)} no soportado]</em></p>`;
    return `<figure class="diag">${f(b, c, ++_id)}${b.cap ? `<figcaption class="cap">${inline(b.cap, c)}</figcaption>` : ''}</figure>`;
  },
  pasos: (b, c) => `${b.titulo ? `<h3>${inline(b.titulo, c)}</h3>` : ''}<ol class="pasos">${b.pasos.map(p => `<li><b>${inline(p.t, c)}</b>${parrafos(p.x, c)}</li>`).join('')}</ol>`,
  cita: (b, c) => `<figure class="cita"><blockquote>«${esc(b.x)}»</blockquote><figcaption>${inline(b.autor || '', c)}${b.fuente ? ` ${inline('[#' + b.fuente + ']', c)}` : ''}</figcaption></figure>`,
  ejercicio: (b, c) => `<aside class="nota idea" style="border-left-color:var(--senal)"><span class="et" style="color:var(--senal)">Probalo vos</span>${parrafos(b.x, c)}${b.pista ? `<details><summary>Una pista</summary><div>${parrafos(b.pista, c)}</div></details>` : ''}${b.solucion ? `<details><summary>Ver una solución</summary><div>${parrafos(b.solucion, c)}</div></details>` : ''}</aside>`,
  widget: (b) => `<section class="widget" data-w="${esc(b.n)}" data-cfg='${esc(JSON.stringify(b.cfg || {}))}'><span class="wt">${esc(b.titulo || 'Probalo')}</span><div class="wc"></div>${b.cap ? `<p style="margin:10px 0 0;font:400 .88rem var(--f-ui);color:var(--muted)">${esc(b.cap)}</p>` : ''}</section>`,
  senda: (b, c) => `<aside class="senda"><span class="et">◆ En Senda</span>${b.titulo ? `<h3>${inline(b.titulo, c)}</h3>` : ''}${parrafos(b.x, c)}${b.archivos && b.archivos.length ? `<div class="rutas">${b.archivos.map(a => `<code>${esc(a)}</code>`).join('')}</div>` : ''}</aside>`
};
function renderBloques(bloques, ctx) {
  ctx.h2 = 0;
  return bloques.map(b => (B[b.t] ? B[b.t](b, ctx) : `<p><em>[bloque ${esc(b.t)} desconocido]</em></p>`)).join('\n');
}

/* ====== Corredor de JavaScript (Worker con límite de tiempo) ====== */
function correrJS(codigo, salida) {
  const fuente = `const __o=[];const __f=a=>a.map(x=>{if(typeof x==='string')return x;try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ');
const console={log:(...a)=>__o.push(__f(a)),error:(...a)=>__o.push('error: '+__f(a)),warn:(...a)=>__o.push('aviso: '+__f(a)),table:(...a)=>__o.push(__f(a))};
onmessage=async e=>{try{const r=await (async()=>{${codigo}\n})();postMessage({o:__o,r:r===undefined?undefined:__f([r])})}catch(err){postMessage({o:__o,e:String(err&&err.message||err)})}}`;
  salida.classList.remove('err'); salida.textContent = 'Ejecutando…';
  try {
    const w = new Worker(URL.createObjectURL(new Blob([fuente], { type: 'text/javascript' })));
    const t = setTimeout(() => { w.terminate(); salida.classList.add('err'); salida.textContent = 'Se cortó a los 3 segundos: ¿un bucle que no termina?'; }, 3000);
    w.onmessage = e => { clearTimeout(t); w.terminate(); const d = e.data; salida.textContent = (d.o.join('\n') + (d.r ? `\n→ ${d.r}` : '') + (d.e ? `\nError: ${d.e}` : '')).trim() || '(sin salida: usá console.log para mostrar algo)'; salida.classList.toggle('err', !!d.e); };
    w.onerror = e => { clearTimeout(t); salida.classList.add('err'); salida.textContent = 'Error: ' + (e.message || 'de sintaxis'); };
    w.postMessage(1);
  } catch (e) {
    try { const out = []; const fake = { log: (...a) => out.push(a.join(' ')) }; new Function('console', codigo)(fake); salida.textContent = out.join('\n') || '(sin salida)'; } catch (err) { salida.classList.add('err'); salida.textContent = 'Error: ' + err.message; }
  }
}
