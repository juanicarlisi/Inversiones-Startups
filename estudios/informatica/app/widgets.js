/* ====== Widgets interactivos: cada uno recibe (contenedor, configuración) ====== */
const WIDGETS = {};
const hex = (n, w = 2) => n.toString(16).toUpperCase().padStart(w, '0');
const bin = (n, w = 8) => (n >>> 0).toString(2).padStart(w, '0');

/* Bits: ocho interruptores y sus lecturas */
WIDGETS.bits = (el, cfg) => {
  const nb = cfg.bits || 8; let v = cfg.inicial || 0;
  el.innerHTML = `<div class="bitrow"></div><div class="lecturas"></div><p style="margin:10px 0 0"><label>Escribí un número (0 a ${2 ** nb - 1}): <input type="number" min="0" max="${2 ** nb - 1}" value="${v}" style="width:90px"></label></p>`;
  const row = $('.bitrow', el), lec = $('.lecturas', el), inp = $('input', el);
  const draw = () => {
    row.innerHTML = Array.from({ length: nb }, (_, i) => { const p = nb - 1 - i; return `<button type="button" class="bitbtn" aria-pressed="${(v >> p) & 1 ? 'true' : 'false'}" data-p="${p}" aria-label="Bit de valor ${2 ** p}">${(v >> p) & 1}<small>${2 ** p}</small></button>`; }).join('');
    const ch = v >= 32 && v < 127 ? String.fromCharCode(v) : '—';
    lec.innerHTML = `<div class="lectura"><small>Decimal</small><b>${v}</b></div><div class="lectura"><small>Binario</small><b>${bin(v, nb)}</b></div><div class="lectura"><small>Hexadecimal</small><b>0x${hex(v, nb / 4)}</b></div>${cfg.ascii ? `<div class="lectura"><small>Carácter ASCII</small><b>${esc(ch)}</b></div>` : ''}`;
    inp.value = v;
  };
  row.onclick = e => { const b = e.target.closest('.bitbtn'); if (!b) return; v ^= 1 << +b.dataset.p; draw(); };
  inp.oninput = () => { v = Math.max(0, Math.min(2 ** nb - 1, parseInt(inp.value || '0', 10) || 0)); draw(); inp.value = inp.value; };
  draw();
};

/* Texto → puntos de código → bytes UTF-8 */
WIDGETS.utf8 = (el, cfg) => {
  el.innerHTML = `<label>Escribí algo (probá «ñ», «€», «😀»): <input type="text" value="${esc(cfg.texto || 'Hola ñandú 😀')}" style="width:min(100%,360px)"></label><div class="tabla-w" style="margin-top:10px"><table><thead><tr><th>Carácter</th><th>Punto de código</th><th>Bytes en UTF-8</th><th>En binario</th></tr></thead><tbody></tbody></table></div><p class="tot" style="font:600 .85rem var(--f-ui);color:var(--muted)"></p>`;
  const inp = $('input', el), tb = $('tbody', el), tot = $('.tot', el), enc = new TextEncoder();
  const draw = () => { const cs = [...inp.value].slice(0, 24); tb.innerHTML = cs.map(c => { const b = [...enc.encode(c)]; return `<tr><td style="font-size:1.2rem">${esc(c)}</td><td><code>U+${hex(c.codePointAt(0), 4)}</code></td><td><code>${b.map(x => hex(x)).join(' ')}</code> (${b.length} ${b.length === 1 ? 'byte' : 'bytes'})</td><td><code style="font-size:.74rem">${b.map(x => bin(x)).join(' ')}</code></td></tr>`; }).join(''); tot.textContent = `${[...inp.value].length} caracteres → ${enc.encode(inp.value).length} bytes en UTF-8.`; };
  inp.oninput = draw; draw();
};

/* IEEE 754 de 32 bits */
WIDGETS.ieee = (el, cfg) => {
  el.innerHTML = `<label>Número: <input type="text" value="${esc(cfg.valor || '0.1')}" style="width:150px" inputmode="decimal"></label><div class="bitrow" style="margin-top:12px;gap:3px"></div><div class="lecturas"></div>`;
  const inp = $('input', el), row = $('.bitrow', el), lec = $('.lecturas', el);
  const draw = () => {
    const x = parseFloat(inp.value.replace(',', '.')); if (!isFinite(x)) { row.innerHTML = ''; lec.innerHTML = '<div class="lectura"><small>Resultado</small><b>no es un número</b></div>'; return; }
    const dv = new DataView(new ArrayBuffer(4)); dv.setFloat32(0, x); const u = dv.getUint32(0), s = u >>> 31, e = (u >>> 23) & 255, m = u & 0x7fffff;
    const col = (i, g) => `<span class="bitbtn" style="width:19px;height:30px;font-size:.85rem;display:inline-flex;align-items:center;justify-content:center;border-color:${g};color:${g}">${(u >>> (31 - i)) & 1}</span>`;
    row.innerHTML = Array.from({ length: 32 }, (_, i) => col(i, i === 0 ? 'var(--alerta)' : i < 9 ? 'var(--senal)' : 'var(--circ)')).join('');
    const real = new Float32Array([x])[0];
    lec.innerHTML = `<div class="lectura"><small style="color:var(--alerta)">Signo (1 bit)</small><b>${s}</b></div><div class="lectura"><small style="color:var(--senal)">Exponente (8 bits)</small><b>${e} → 2^${e - 127}</b></div><div class="lectura"><small style="color:var(--circ)">Mantisa (23 bits)</small><b>${m}</b></div><div class="lectura"><small>Lo que guarda de verdad</small><b style="font-size:.9rem">${real.toPrecision(21)}</b></div>`;
  };
  inp.oninput = draw; draw();
};

/* Color RGB */
WIDGETS.color = (el) => {
  el.innerHTML = `<div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center"><div>${['R', 'G', 'B'].map((c, i) => `<label style="display:grid;grid-template-columns:20px 1fr 44px;gap:8px;align-items:center;margin:6px 0">${c}<input type="range" min="0" max="255" value="${[200, 107, 30][i]}"><b class="v" style="font-family:var(--f-mono)"></b></label>`).join('')}</div><div class="mu" style="width:110px;height:110px;border-radius:14px;border:1px solid var(--line)"></div></div><div class="lecturas"></div>`;
  const rs = $$('input', el), vs = $$('.v', el), mu = $('.mu', el), lec = $('.lecturas', el);
  const draw = () => { const v = rs.map(r => +r.value); vs.forEach((x, i) => x.textContent = v[i]); mu.style.background = `rgb(${v})`; lec.innerHTML = `<div class="lectura"><small>Hexadecimal</small><b>#${v.map(x => hex(x)).join('')}</b></div><div class="lectura"><small>24 bits</small><b style="font-size:.78rem">${v.map(x => bin(x)).join(' ')}</b></div><div class="lectura"><small>Colores posibles</small><b>16.777.216</b></div>`; };
  rs.forEach(r => r.oninput = draw); draw();
};

/* Compuertas lógicas con tabla de verdad */
const GATES = { AND: (a, b) => a & b, OR: (a, b) => a | b, XOR: (a, b) => a ^ b, NAND: (a, b) => +!(a & b), NOR: (a, b) => +!(a | b), XNOR: (a, b) => +!(a ^ b), NOT: a => +!a };
WIDGETS.compuertas = (el, cfg) => {
  let g = cfg.compuerta || 'AND', a = 0, b = 0;
  el.innerHTML = `<div class="seg" style="flex-wrap:wrap">${Object.keys(GATES).map(k => `<button type="button" class="btn chico" data-g="${k}">${k}</button>`).join('')}</div><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin:14px 0"><div class="entr"></div><b style="font:700 1.6rem var(--f-mono)">→ <span class="gn"></span> →</b><div><span class="led"></span> <b class="sal" style="font:700 1.3rem var(--f-mono)"></b></div></div><div class="ttabla"></div>`;
  const draw = () => {
    const un = g === 'NOT', r = un ? GATES.NOT(a) : GATES[g](a, b);
    $$('[data-g]', el).forEach(x => x.setAttribute('aria-pressed', x.dataset.g === g));
    $('.entr', el).innerHTML = `<button type="button" class="bitbtn" data-i="a" aria-pressed="${!!a}" aria-label="Entrada A">${a}<small>A</small></button>${un ? '' : `<button type="button" class="bitbtn" data-i="b" aria-pressed="${!!b}" aria-label="Entrada B" style="margin-left:6px">${b}<small>B</small></button>`}`;
    $('.gn', el).textContent = g; $('.led', el).classList.toggle('on', !!r); $('.sal', el).textContent = r;
    const filas = un ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    $('.ttabla', el).innerHTML = `<table><thead><tr>${un ? '<th>A</th>' : '<th>A</th><th>B</th>'}<th>Salida</th></tr></thead><tbody>${filas.map(f => `<tr class="${f[0] === a && (un || f[1] === b) ? 'act' : ''}">${f.map(x => `<td>${x}</td>`).join('')}<td>${un ? GATES.NOT(f[0]) : GATES[g](f[0], f[1])}</td></tr>`).join('')}</tbody></table>`;
  };
  el.onclick = e => { const x = e.target.closest('[data-g]'), y = e.target.closest('[data-i]'); if (x) g = x.dataset.g; if (y) { if (y.dataset.i === 'a') a ^= 1; else b ^= 1; } draw(); };
  draw();
};

/* Sumador: semisumador o completo armado con compuertas */
WIDGETS.sumador = (el, cfg) => {
  const completo = cfg.completo !== false; let a = 0, b = 0, c = 0;
  el.innerHTML = `<div class="entr" style="display:flex;gap:8px"></div><div class="lecturas" style="margin-top:14px"></div><p class="trad" style="font:500 .92rem var(--f-ui);margin:12px 0 0"></p>`;
  const draw = () => {
    const x1 = a ^ b, s = completo ? x1 ^ c : x1, co = completo ? (a & b) | (c & x1) : a & b;
    $('.entr', el).innerHTML = [['a', 'A', a], ['b', 'B', b]].concat(completo ? [['c', 'Acarreo de entrada', c]] : []).map(([k, n, v]) => `<button type="button" class="bitbtn" data-i="${k}" aria-pressed="${!!v}" aria-label="${n}" style="width:${k === 'c' ? 64 : 44}px">${v}<small>${n.length > 2 ? 'Cin' : n}</small></button>`).join('');
    $('.lecturas', el).innerHTML = `<div class="lectura"><small>A XOR B</small><b>${x1}</b></div><div class="lectura"><small>A AND B</small><b>${a & b}</b></div><div class="lectura"><small>Suma (bit)</small><b>${s}</b></div><div class="lectura"><small>Acarreo de salida</small><b>${co}</b></div>`;
    $('.trad', el).innerHTML = `En números: <b>${a} + ${b}${completo ? ' + ' + c : ''} = ${a + b + (completo ? c : 0)}</b> → en binario <b>${co}${s}</b> (acarreo ${co}, bit de suma ${s}).`;
  };
  el.onclick = e => { const y = e.target.closest('[data-i]'); if (!y) return; ({ a: () => a ^= 1, b: () => b ^= 1, c: () => c ^= 1 })[y.dataset.i](); draw(); };
  draw();
};

/* CPU de juguete: buscar → decodificar → ejecutar */
WIDGETS.microcpu = (el, cfg) => {
  const prog = cfg.prog || ['LOADI 5', 'ADD 12', 'STORE 13', 'HALT'], mem0 = cfg.mem || [], NM = 16;
  let S;
  const reset = () => { S = { pc: 0, a: 0, mem: Array.from({ length: NM }, (_, i) => mem0[i] || 0), fase: 'listo', ir: '', tocado: -1, ciclos: 0, fin: false, msg: 'Apretá «Siguiente fase» para empezar el primer ciclo.' }; };
  reset();
  el.innerHTML = `<div class="cpu"><div><h5>Programa (en memoria)</h5><div class="prog"></div></div><div><h5>CPU</h5><div class="regs"></div><h5>Memoria de datos (16 celdas)</h5><div class="mem"></div></div></div><div class="pasos-c"><button type="button" class="btn chico prim" data-a="fase">Siguiente fase ▸</button><button type="button" class="btn chico" data-a="instr">Instrucción completa ⏭</button><button type="button" class="btn chico" data-a="todo">Correr todo</button><button type="button" class="btn chico" data-a="reset">↺ Reiniciar</button></div><div class="paso-txt" aria-live="polite"></div>`;
  const parse = s => { const [o, n] = s.trim().split(/\s+/); return [o.toUpperCase(), n === undefined ? null : parseInt(n, 10)]; };
  const draw = () => {
    $('.prog', el).innerHTML = prog.map((p, i) => `<div class="${i === S.pc && !S.fin ? 'pc' : ''}">${String(i).padStart(2, '0')}: ${esc(p)}</div>`).join('');
    $('.regs', el).innerHTML = `<div class="reg"><small>CONTADOR (PC)</small>${S.pc}</div><div class="reg"><small>ACUMULADOR (A)</small>${S.a}</div><div class="reg"><small>INSTRUCCIÓN (IR)</small><span style="font-size:.82rem">${esc(S.ir || '—')}</span></div><div class="reg" style="background:var(--senal-soft);border-color:var(--senal)"><small>FASE</small><span style="font-size:.82rem">${S.fase}</span></div>`;
    $('.mem', el).innerHTML = S.mem.map((v, i) => `<div class="${i === S.tocado ? 'tocado' : ''}"><small>[${i}]</small>${v}</div>`).join('');
    $('.paso-txt', el).textContent = S.msg + (S.fin ? ` (${S.ciclos} ciclos)` : '');
  };
  const fase = () => {
    if (S.fin) return;
    if (S.fase === 'listo' || S.fase === 'ejecutar') { S.ir = prog[S.pc] || 'HALT'; S.fase = 'buscar'; S.tocado = -1; S.msg = `BUSCAR: la CPU lee la instrucción de la posición ${S.pc} del programa y la copia al registro de instrucción.`; }
    else if (S.fase === 'buscar') { const [o, n] = parse(S.ir); S.fase = 'decodificar'; S.msg = `DECODIFICAR: la unidad de control separa «${o}» (qué hacer)${n !== null ? ` de ${n} (con qué dato o dirección)` : ''} y prepara los circuitos necesarios.`; }
    else {
      const [o, n] = parse(S.ir); let t = ''; S.fase = 'ejecutar'; S.ciclos++;
      const sig = () => { S.pc++; };
      if (o === 'LOADI') { S.a = n & 255; t = `A ← ${n}.`; sig(); }
      else if (o === 'LOAD') { S.a = S.mem[n]; S.tocado = n; t = `A ← memoria[${n}] = ${S.a}.`; sig(); }
      else if (o === 'ADD') { const r = S.a + S.mem[n]; S.tocado = n; t = `A ← ${S.a} + memoria[${n}] (${S.mem[n]}) = ${r & 255}${r > 255 ? ' (se desbordó: máximo 255)' : ''}.`; S.a = r & 255; sig(); }
      else if (o === 'SUB') { const r = S.a - S.mem[n]; S.tocado = n; t = `A ← ${S.a} − ${S.mem[n]} = ${r & 255}.`; S.a = r & 255; sig(); }
      else if (o === 'STORE') { S.mem[n] = S.a; S.tocado = n; t = `memoria[${n}] ← ${S.a}.`; sig(); }
      else if (o === 'JMP') { S.pc = n; t = `El contador salta a ${n}.`; }
      else if (o === 'JNZ') { if (S.a !== 0) { S.pc = n; t = `A no es 0: salta a ${n}.`; } else { t = 'A es 0: sigue de largo.'; sig(); } }
      else if (o === 'HALT') { S.fin = true; t = 'La CPU se detiene.'; }
      else { S.fin = true; t = 'Instrucción desconocida: se detiene.'; }
      S.msg = `EJECUTAR: ${t}`;
    }
    draw();
  };
  const instr = () => { if (S.fin) return; do fase(); while (S.fase !== 'ejecutar' && !S.fin); };
  el.onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a === 'fase') fase(); else if (b.dataset.a === 'instr') instr(); else if (b.dataset.a === 'reset') { reset(); draw(); }
    else { let k = 0; while (!S.fin && k++ < 500) instr(); }
  };
  draw();
};

/* Crecimiento: n, log n, n log n, n², 2^n */
WIDGETS.bigo = (el, cfg) => {
  el.innerHTML = `<label style="display:block;margin-bottom:8px">Tamaño de la entrada n = <b class="nv"></b><input type="range" min="1" max="${cfg.max || 30}" value="10"></label><svg viewBox="0 0 640 260" style="width:100%;height:auto"></svg><div class="lecturas"></div>`;
  const r = $('input', el), svg = $('svg', el);
  const F = [['log n', n => Math.log2(n), 'var(--circ)'], ['n', n => n, 'var(--azul)'], ['n log n', n => n * Math.log2(n), 'var(--ok)'], ['n²', n => n * n, 'var(--senal)'], ['2ⁿ', n => 2 ** n, 'var(--alerta)']];
  const draw = () => {
    const n = +r.value, M = +r.max; $('.nv', el).textContent = n;
    const topY = Math.max(n * n, 20), toY = v => 240 - Math.min(1, v / topY) * 225;
    let s = '<line x1="30" y1="240" x2="630" y2="240" stroke="var(--line)"/>';
    F.forEach(([nm, f, c]) => { let d = ''; for (let i = 1; i <= M; i++) { const x = 30 + (i - 1) / (M - 1) * 600; d += `${i === 1 ? 'M' : 'L'}${x},${toY(f(i))}`; } s += `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2"/><text x="${634 - 4}" y="${Math.max(12, toY(f(M))) + 4}" text-anchor="end" font-size="11" fill="${c}" style="fill:${c}">${nm}</text>`; });
    s += `<line x1="${30 + (n - 1) / (M - 1) * 600}" y1="10" x2="${30 + (n - 1) / (M - 1) * 600}" y2="240" stroke="var(--muted)" stroke-dasharray="4 4"/>`;
    svg.innerHTML = s;
    $('.lecturas', el).innerHTML = F.map(([nm, f, c]) => `<div class="lectura"><small style="color:${c}">${nm}</small><b>${f(n) >= 1e9 ? f(n).toExponential(1) : Math.round(f(n)).toLocaleString('es-AR')}</b></div>`).join('');
  };
  r.oninput = draw; draw();
};

/* Calculadora CIDR */
WIDGETS.cidr = (el, cfg) => {
  el.innerHTML = `<label>Dirección con prefijo: <input type="text" value="${esc(cfg.valor || '192.168.1.37/24')}" style="width:190px"></label><div class="lecturas" style="margin-top:12px"></div>`;
  const inp = $('input', el), lec = $('.lecturas', el), ip = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const draw = () => {
    const m = inp.value.trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/); if (!m) { lec.innerHTML = '<div class="lectura"><small>Formato</small><b style="font-size:.85rem">a.b.c.d/prefijo</b></div>'; return; }
    const o = m.slice(1, 5).map(Number), p = +m[5]; if (o.some(x => x > 255) || p > 32) { lec.innerHTML = '<div class="lectura"><small>Error</small><b>valor fuera de rango</b></div>'; return; }
    const n = ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0, mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0, red = (n & mask) >>> 0, bc = (red | (~mask >>> 0)) >>> 0, hosts = p >= 31 ? 2 ** (32 - p) : 2 ** (32 - p) - 2;
    lec.innerHTML = [['Máscara', ip(mask)], ['Red', ip(red)], ['Broadcast', ip(bc)], ['Primer host', ip(p >= 31 ? red : red + 1)], ['Último host', ip(p >= 31 ? bc : bc - 1)], ['Hosts utilizables', hosts.toLocaleString('es-AR')], ['IP en binario', o.map(x => bin(x)).join('.')]].map(([a, b]) => `<div class="lectura"><small>${a}</small><b style="font-size:${a === 'IP en binario' ? '.72rem' : '1rem'}">${b}</b></div>`).join('');
  };
  inp.oninput = draw; draw();
};

/* Hash SHA-256 en vivo */
WIDGETS.hash = (el, cfg) => {
  el.innerHTML = `<label>Texto: <input type="text" value="${esc(cfg.texto || 'hola')}" style="width:min(100%,320px)"></label><div class="lecturas" style="margin-top:10px"><div class="lectura" style="grid-column:1/-1"><small>SHA-256</small><b class="h" style="font-size:.8rem"></b></div></div><p style="font:500 .85rem var(--f-ui);margin:8px 0 0;color:var(--muted)">Cambiá una sola letra y mirá cuánto cambia todo.</p>`;
  const inp = $('input', el), out = $('.h', el);
  const draw = async () => { try { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inp.value)); out.textContent = [...new Uint8Array(d)].map(x => hex(x)).join(''); } catch (e) { out.textContent = 'Tu navegador no permite calcularlo acá.'; } };
  inp.oninput = draw; draw();
};

function montarWidgets(raiz) {
  $$('.widget[data-w]', raiz).forEach(w => {
    const f = WIDGETS[w.dataset.w], c = $('.wc', w); if (!f) { c.textContent = '[widget ' + w.dataset.w + ' no disponible]'; return; }
    try { f(c, JSON.parse(w.dataset.cfg || '{}')); } catch (e) { c.textContent = 'No se pudo cargar este widget: ' + e.message; }
  });
}
