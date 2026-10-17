/*
 * Andén — interfaz. Arma cada calculadora a partir de su definición (calculadoras.js),
 * guarda el escenario en el navegador (localStorage), lo comparte por enlace (hash de la URL)
 * y maneja el tema claro u oscuro. Sin cookies, sin servidor, sin claves.
 */
(function () {
  'use strict';
  var F = window.AndenFormato, C = window.AndenCalculos, REF = window.AndenReferencias, CALCS = window.AndenCalculadoras;
  var esc = CALCS.esc;
  var PREFIJO = 'anden:v0:';

  /* ───────────── Almacenamiento seguro (puede no existir o estar bloqueado) ───────────── */
  var almacen = {
    leer: function (k) { try { var s = window.localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    escribir: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    borrar: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* nada */ } }
  };

  /* ───────────── Tema ───────────── */
  var TEMAS = ['auto', 'claro', 'oscuro'];
  var NOMBRE_TEMA = { auto: 'Tema automático', claro: 'Tema claro', oscuro: 'Tema oscuro' };
  function aplicarTema(t) {
    if (t === 'claro' || t === 'oscuro') { document.documentElement.setAttribute('data-tema', t); }
    else { document.documentElement.removeAttribute('data-tema'); }
    var b = document.getElementById('boton-tema');
    if (b) { b.textContent = NOMBRE_TEMA[t] || NOMBRE_TEMA.auto; b.setAttribute('aria-label', (NOMBRE_TEMA[t] || NOMBRE_TEMA.auto) + '. Tocá para cambiar.'); }
  }
  function iniciarTema() {
    var t = almacen.leer('anden:tema') || 'auto';
    aplicarTema(t);
    var b = document.getElementById('boton-tema');
    if (b) {
      b.addEventListener('click', function () {
        var actual = almacen.leer('anden:tema') || 'auto';
        var sig = TEMAS[(TEMAS.indexOf(actual) + 1) % TEMAS.length];
        almacen.escribir('anden:tema', sig);
        aplicarTema(sig);
      });
    }
  }

  /* ───────────── Tipo de cambio global (editable) ───────────── */
  function leerTc() {
    var t = almacen.leer('anden:tc');
    return (typeof t === 'number' && t > 0) ? t : REF.ref('tc_usd');
  }

  /* ───────────── Métricas sin cookies (solo si se publicó con GoatCounter; si no, no hace nada) ─────────────
   * Eventos: calculo:<id> (primera edición de la sesión: la métrica norte «cálculos por semana»),
   * compartir:<id>, imprimir:<id>, importar:<id>, ejemplo:<id>. No se manda ningún número cargado. */
  var medidos = {};
  function medir(evento, unaVez) {
    if (unaVez) { if (medidos[evento]) { return; } medidos[evento] = true; }
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({ path: evento, title: evento, event: true });
      }
    } catch (e) { /* nunca romper la calculadora por una métrica */ }
  }

  /* ───────────── Aviso breve ───────────── */
  var avisoTimer;
  function aviso(texto) {
    var a = document.getElementById('aviso');
    if (!a) { a = document.createElement('div'); a.id = 'aviso'; a.className = 'aviso'; a.setAttribute('role', 'status'); document.body.appendChild(a); }
    a.textContent = texto;
    a.classList.add('visible');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { a.classList.remove('visible'); }, 2600);
  }

  /* ───────────── Referencias ───────────── */
  function insigniaRef(clave) {
    var r = REF.REFERENCIAS[clave];
    if (!r) { return ''; }
    var clase = r.tipo === 'HECHO' ? 'hecho' : 'estimacion';
    var texto = r.tipo === 'HECHO' ? 'HECHO · ' + F.fecha(r.fecha) : 'ESTIMACIÓN';
    return '<a class="insignia ' + clase + '" href="#ref-' + clave + '" title="' + esc(r.nombre) + '">' + texto + '</a>';
  }

  function itemReferencia(clave) {
    var r = REF.REFERENCIAS[clave];
    var valor = (r.valor === 0 && r.unidad === '—') ? '' : ': <span class="ref-valor">' + esc(F.numero(r.valor, Number.isInteger(r.valor) ? 0 : 2)) + ' ' + esc(r.unidad) + '</span>';
    var fuente = r.fuente ? ' <a href="' + esc(r.fuente) + '" rel="noopener" target="_blank">Fuente</a>.' : ' <span class="sin-fuente">Sin fuente: supuesto de trabajo.</span>';
    var extra = (r.metodo ? ' <span class="metodo">Método: ' + esc(r.metodo) + '</span>' : '') + (r.nota ? ' <span class="nota-ref">' + esc(r.nota) + '</span>' : '');
    return '<li id="ref-' + clave + '"><span class="insignia ' + (r.tipo === 'HECHO' ? 'hecho' : 'estimacion') + '">' + r.tipo + '</span> ' +
      '<strong>' + esc(r.nombre) + '</strong>' + valor + ' · ' + esc(F.fecha(r.fecha)) + '.' + fuente + extra + '</li>';
  }

  /* ───────────── Hash de la URL ───────────── */
  function leerHash(cfg) {
    var h = window.location.hash.replace(/^#/, '');
    if (!h) { return null; }
    var params;
    try { params = new URLSearchParams(h); } catch (e) { return null; }
    var v = {}, alguno = false, tc = null;
    var defs = {};
    CALCS.campos(cfg).forEach(function (c) { defs[c.id] = c; });
    params.forEach(function (valor, clave) {
      if (clave === 'tc') { var t = parseFloat(valor); if (t > 0) { tc = t; } return; }
      if (clave === 'preset') { v.preset = valor; return; }
      var c = defs[clave];
      if (!c) { return; }
      if (c.tipo === 'si_no') { v[clave] = valor === '1'; alguno = true; return; }
      if (c.tipo === 'opciones') {
        var op = c.opciones.filter(function (o) { return String(o.valor) === valor; })[0];
        if (op) { v[clave] = op.valor; alguno = true; }
        return;
      }
      var x = parseFloat(valor);
      if (isFinite(x)) { v[clave] = x; alguno = true; }
    });
    return alguno ? { valores: v, tc: tc } : null;
  }

  function escribirHash(cfg, valores, tc) {
    var params = new URLSearchParams();
    CALCS.campos(cfg).forEach(function (c) {
      var x = valores[c.id];
      if (c.tipo === 'si_no') { params.set(c.id, x ? '1' : '0'); }
      else { params.set(c.id, String(x)); }
    });
    if (valores.preset) { params.set('preset', valores.preset); }
    params.set('tc', String(tc));
    try { window.history.replaceState(null, '', '#' + params.toString()); } catch (e) { /* file:// en algunos navegadores */ }
  }

  /* ───────────── Resultado de otra calculadora (para «Traer de…») ───────────── */
  function valoresDe(cfg) {
    var base = CALCS.valoresIniciales(cfg);
    var guardado = almacen.leer(PREFIJO + cfg.id);
    if (guardado && guardado.valores) {
      Object.keys(base).forEach(function (k) { if (guardado.valores[k] !== undefined) { base[k] = guardado.valores[k]; } });
      return { valores: base, guardado: true };
    }
    return { valores: base, guardado: false };
  }

  /* ════════════════════════════ Una calculadora ════════════════════════════ */
  function iniciarCalculadora(raiz, cfg) {
    var tc = leerTc();
    var valores = CALCS.valoresIniciales(cfg);
    var origen = 'referencia';
    var desdeHash = leerHash(cfg);
    var guardado = almacen.leer(PREFIJO + cfg.id);
    if (desdeHash) {
      Object.keys(desdeHash.valores).forEach(function (k) { valores[k] = desdeHash.valores[k]; });
      if (desdeHash.tc) { tc = desdeHash.tc; }
      origen = 'enlace';
    } else if (guardado && guardado.valores) {
      Object.keys(valores).forEach(function (k) { if (guardado.valores[k] !== undefined) { valores[k] = guardado.valores[k]; } });
      origen = 'guardado';
    }
    var todos = CALCS.campos(cfg);
    var porCampo = {};
    todos.forEach(function (c) { porCampo[c.id] = c; });

    raiz.innerHTML = plantilla(cfg, valores, tc, origen);

    var form = raiz.querySelector('form.formulario');
    var nodos = {
      principal: raiz.querySelector('.principal'),
      tarjetas: raiz.querySelector('.tarjetas'),
      desglose: raiz.querySelector('.desglose'),
      sensibilidad: raiz.querySelector('.sensibilidad'),
      pasos: raiz.querySelector('.pasos ol'),
      barra: document.querySelector('.barra-resultado'),
      tc: raiz.querySelector('#tc-valor')
    };

    function visibilidad() {
      todos.forEach(function (c) {
        var nodo = form.querySelector('[data-campo="' + c.id + '"]');
        if (nodo) { nodo.hidden = c.visible ? !c.visible(valores) : false; }
      });
    }

    function guardar() {
      almacen.escribir(PREFIJO + cfg.id, { valores: valores, fecha: new Date().toISOString() });
      escribirHash(cfg, valores, tc);
    }

    function actualizar() {
      var h = CALCS.ayudantes(tc);
      var v = Object.assign({}, valores, { tc: tc });
      var r = cfg.calcular(v);
      var pr = cfg.principal(r, v, h);
      nodos.principal.className = 'principal tarjeta-principal ' + (pr.estado || '');
      nodos.principal.innerHTML = '<p class="principal-etiqueta">' + esc(pr.etiqueta) + '</p>' +
        '<p class="principal-valor">' + esc(pr.valor) + '</p>' +
        '<p class="principal-sub">' + esc(pr.sub) + '</p>';
      if (nodos.barra) {
        nodos.barra.innerHTML = '<span>' + esc(pr.etiqueta) + '</span> <strong>' + esc(pr.valor) + '</strong>';
        nodos.barra.className = 'barra-resultado ' + (pr.estado || '');
      }
      nodos.tarjetas.innerHTML = cfg.tarjetas(r, v, h).map(function (t) {
        return '<div class="tarjeta ' + (t.estado || '') + '"><p class="tarjeta-etiqueta">' + esc(t.etiqueta) + '</p>' +
          '<p class="tarjeta-valor">' + esc(t.valor) + '</p>' + (t.nota ? '<p class="tarjeta-nota">' + esc(t.nota) + '</p>' : '') + '</div>';
      }).join('');
      nodos.desglose.innerHTML = cfg.desglose(r, v, h).map(tablaHtml).join('');
      nodos.sensibilidad.innerHTML = sensibilidadHtml(cfg, v, r, h);
      nodos.pasos.innerHTML = cfg.pasos(r, v, h).map(function (p) { return '<li>' + p + '</li>'; }).join('');
      guardar();
    }

    function ponerValor(id, x) {
      valores[id] = x;
      var input = form.querySelector('#c-' + id);
      if (!input) { return; }
      var c = porCampo[id];
      if (c.tipo === 'si_no') { input.checked = !!x; }
      else if (c.tipo === 'opciones') { input.value = String(x); }
      else { input.value = F.paraCampo(x); input.classList.remove('invalido'); input.removeAttribute('aria-invalid'); }
    }

    form.addEventListener('input', function (ev) {
      var el = ev.target;
      var id = el.getAttribute('data-id');
      if (!id || !porCampo[id]) { return; }
      var c = porCampo[id];
      if (c.tipo === 'si_no' || c.tipo === 'opciones') { return; }
      var x = F.leerNumero(el.value);
      var min = c.min !== undefined ? c.min : 0;
      var ok = isFinite(x) && x >= min && (c.max === undefined || x <= c.max);
      var msj = form.querySelector('#m-' + id);
      if (!ok) {
        el.classList.add('invalido'); el.setAttribute('aria-invalid', 'true');
        if (msj) { msj.textContent = 'Revisá este número' + (c.max !== undefined ? ' (entre ' + F.numero(min, 0) + ' y ' + F.numero(c.max, 0) + ')' : (min > 0 ? ' (mínimo ' + F.numero(min) + ')' : '')) + '.'; }
        return;
      }
      el.classList.remove('invalido'); el.removeAttribute('aria-invalid');
      if (msj) { msj.textContent = ''; }
      valores[id] = x;
      actualizar();
      medir('calculo:' + cfg.id, true);
    });

    form.addEventListener('change', function (ev) {
      var el = ev.target;
      if (el.id === 'preset') {
        var p = cfg.presets.filter(function (x) { return x.id === el.value; })[0];
        if (p) {
          Object.keys(p.valores).forEach(function (k) { ponerValor(k, p.valores[k]); });
          valores.preset = p.id;
          visibilidad(); actualizar();
          aviso('Cargaste el ejemplo: ' + p.nombre);
          medir('ejemplo:' + cfg.id, true);
        }
        return;
      }
      var id = el.getAttribute('data-id');
      if (!id || !porCampo[id]) { return; }
      var c = porCampo[id];
      if (c.tipo === 'si_no') { valores[id] = el.checked; }
      else if (c.tipo === 'opciones') {
        var op = c.opciones.filter(function (o) { return String(o.valor) === el.value; })[0];
        valores[id] = op ? op.valor : c.defecto;
      } else { return; }
      visibilidad(); actualizar();
      medir('calculo:' + cfg.id, true);
    });

    form.addEventListener('focusout', function (ev) {
      var el = ev.target;
      var id = el.getAttribute && el.getAttribute('data-id');
      if (!id || !porCampo[id] || porCampo[id].tipo) { return; }
      if (!el.classList.contains('invalido')) { el.value = F.paraCampo(valores[id]); }
    });

    form.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('button.importar') : null;
      if (!b) { return; }
      var id = b.getAttribute('data-para');
      var c = porCampo[id];
      var otra = CALCS.porId[c.importar.desde];
      var dv = valoresDe(otra);
      var r = otra.calcular(Object.assign({}, dv.valores, { tc: tc }));
      var x = c.importar.salida(r);
      if (!isFinite(x)) { aviso('No se pudo calcular en la calculadora ' + otra.numero + '.'); return; }
      ponerValor(id, x);
      actualizar();
      medir('importar:' + cfg.id, true);
      aviso('Traído de la calculadora ' + otra.numero + (dv.guardado ? ' (tu escenario guardado)' : ' (valores de referencia)') + ': ' + F.paraCampo(x));
    });

    // Tipo de cambio
    nodos.tc.addEventListener('input', function () {
      var x = F.leerNumero(nodos.tc.value);
      if (!(x > 0)) { nodos.tc.classList.add('invalido'); return; }
      nodos.tc.classList.remove('invalido');
      tc = x; almacen.escribir('anden:tc', x); actualizar();
    });
    nodos.tc.addEventListener('focusout', function () { nodos.tc.value = F.paraCampo(tc); });

    // Acciones
    raiz.querySelector('[data-accion="copiar"]').addEventListener('click', function () {
      guardar();
      medir('compartir:' + cfg.id);
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { aviso('Enlace copiado: quien lo abra ve este mismo escenario.'); },
          function () { window.prompt('Copiá el enlace:', url); });
      } else { window.prompt('Copiá el enlace:', url); }
    });
    raiz.querySelector('[data-accion="imprimir"]').addEventListener('click', function () { medir('imprimir:' + cfg.id); window.print(); });
    raiz.querySelector('[data-accion="restablecer"]').addEventListener('click', function () {
      var ini = CALCS.valoresIniciales(cfg);
      Object.keys(ini).forEach(function (k) { if (k !== 'preset') { ponerValor(k, ini[k]); } });
      valores.preset = ini.preset;
      var sel = form.querySelector('#preset'); if (sel && ini.preset) { sel.value = ini.preset; }
      tc = REF.ref('tc_usd'); almacen.borrar('anden:tc'); nodos.tc.value = F.paraCampo(tc);
      visibilidad(); actualizar();
      aviso('Volviste a los valores de referencia.');
    });

    visibilidad();
    actualizar();
    if (origen === 'enlace') { aviso('Abriste un escenario compartido.'); }
  }

  function plantilla(cfg, valores, tc, origen) {
    var R = REF.REFERENCIAS.tc_usd;
    var html = '';
    html += '<div class="barra-tc"><p>Pesos de ' + esc(REF.PERIODO_PESOS) + ', sin IVA. Dólar de referencia: ' +
      '<label class="tc-campo"><span class="sr">Tipo de cambio en pesos por dólar</span>$ <input id="tc-valor" inputmode="decimal" autocomplete="off" value="' + esc(F.paraCampo(tc)) + '"></label> ' +
      '(' + esc(R.nombre) + ', ' + esc(F.fecha(R.fecha)) + '; podés cambiarlo).</p></div>';
    html += '<div class="acciones">' +
      '<button type="button" data-accion="copiar">Copiar enlace</button>' +
      '<button type="button" data-accion="imprimir">Imprimir</button>' +
      '<button type="button" data-accion="restablecer" class="secundario">Volver a los valores de referencia</button>' +
      '<span class="estado-guardado">' + (origen === 'enlace' ? 'Escenario abierto desde un enlace.' : 'Tu escenario se guarda solo en este navegador.') + '</span></div>';
    html += '<div class="calc">';
    html += '<section class="principal tarjeta-principal" aria-live="polite"></section>';
    html += '<form class="formulario" novalidate onsubmit="return false">';
    if (cfg.presets) {
      html += '<div class="preset"><label for="preset">Partir de un ejemplo</label><select id="preset">' +
        cfg.presets.map(function (p) { return '<option value="' + esc(p.id) + '"' + (valores.preset === p.id ? ' selected' : '') + '>' + esc(p.nombre) + '</option>'; }).join('') +
        '</select></div>';
    }
    cfg.grupos.forEach(function (g) {
      html += '<details class="grupo"' + (g.abierto === false ? '' : ' open') + '><summary>' + esc(g.titulo) + '</summary><div class="campos">';
      g.campos.forEach(function (c) { html += campoHtml(c, valores[c.id]); });
      html += '</div></details>';
    });
    html += '</form>';
    html += '<div class="resto">';
    html += '<section class="bloque"><h2>Resultados</h2><div class="tarjetas"></div></section>';
    html += '<section class="bloque"><div class="desglose"></div></section>';
    html += '<section class="bloque"><div class="sensibilidad"></div></section>';
    html += '<section class="bloque pasos"><details open><summary><h2>Cómo se calcula, paso a paso</h2></summary>' +
      '<p class="nota">Con los números de arriba. Con los valores de referencia, es el ejemplo resuelto que verifican las pruebas automáticas de Andén.</p><ol></ol></details></section>';
    html += '<section class="bloque fuentes"><details><summary><h2>Fuentes y fechas de los valores de referencia</h2></summary>' +
      '<p class="nota">HECHO: dato publicado, con fuente y fecha. ESTIMACIÓN: supuesto de trabajo para que el ejemplo funcione; reemplazalo por tu dato. Actualizado el ' + esc(F.fecha(REF.ACTUALIZADO)) + '.</p>' +
      '<ul class="lista-refs">' + clavesRef(cfg).map(itemReferencia).join('') + '</ul></details></section>';
    html += '</div></div>';
    return html;
  }

  function clavesRef(cfg) {
    var vistas = {}, lista = ['tc_usd'];
    vistas.tc_usd = true;
    CALCS.campos(cfg).forEach(function (c) { if (c.ref && !vistas[c.ref]) { vistas[c.ref] = true; lista.push(c.ref); } });
    (cfg.refsExtra || []).forEach(function (k) { if (!vistas[k]) { vistas[k] = true; lista.push(k); } });
    return lista;
  }

  function campoHtml(c, valor) {
    var id = 'c-' + c.id;
    var ins = c.ref ? insigniaRef(c.ref) : '';
    var ayuda = c.ayuda ? '<p class="ayuda" id="a-' + c.id + '">' + esc(c.ayuda) + '</p>' : '';
    var describe = c.ayuda ? ' aria-describedby="a-' + c.id + ' m-' + c.id + '"' : ' aria-describedby="m-' + c.id + '"';
    var importar = c.importar ? '<button type="button" class="importar" data-para="' + c.id + '">' + esc(c.importar.texto) + '</button>' : '';
    if (c.tipo === 'si_no') {
      return '<div class="campo campo-si-no" data-campo="' + c.id + '"><label class="check"><input type="checkbox" id="' + id + '" data-id="' + c.id + '"' + (valor ? ' checked' : '') + describe + '> ' + esc(c.etiqueta) + '</label>' + ayuda + '<p class="mensaje" id="m-' + c.id + '" aria-live="polite"></p></div>';
    }
    if (c.tipo === 'opciones') {
      return '<div class="campo" data-campo="' + c.id + '"><label for="' + id + '">' + esc(c.etiqueta) + '</label>' +
        '<div class="control"><select id="' + id + '" data-id="' + c.id + '"' + describe + '>' +
        c.opciones.map(function (o) { return '<option value="' + esc(String(o.valor)) + '"' + (String(o.valor) === String(valor) ? ' selected' : '') + '>' + esc(o.texto) + '</option>'; }).join('') +
        '</select>' + ins + '</div>' + ayuda + '<p class="mensaje" id="m-' + c.id + '" aria-live="polite"></p></div>';
    }
    return '<div class="campo" data-campo="' + c.id + '"><label for="' + id + '">' + esc(c.etiqueta) + (c.unidad ? ' <span class="unidad">' + esc(c.unidad) + '</span>' : '') + '</label>' +
      '<div class="control"><input id="' + id + '" data-id="' + c.id + '" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + esc(F.paraCampo(valor)) + '"' + describe + '>' + ins + '</div>' +
      ayuda + importar + '<p class="mensaje" id="m-' + c.id + '" aria-live="polite"></p></div>';
  }

  function tablaHtml(t) {
    var clase = t.texto ? 'texto' : 'num';   // t.texto: la segunda columna es texto y puede cortarse en líneas
    var html = '<h2>' + esc(t.titulo) + '</h2><div class="tabla-envoltura"><table' + (t.texto ? ' class="tabla-texto"' : '') + '><thead><tr>' +
      t.columnas.map(function (c, i) { return '<th scope="col"' + (i > 0 ? ' class="' + clase + '"' : '') + '>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      t.filas.map(function (f) { return '<tr>' + f.map(function (x, i) { return i === 0 ? '<th scope="row">' + esc(x) + '</th>' : '<td class="' + clase + '">' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody>' + (t.pie ? '<tfoot><tr>' + t.pie.map(function (x, i) { return i === 0 ? '<th scope="row">' + esc(x) + '</th>' : '<td class="' + clase + '">' + esc(x) + '</td>'; }).join('') + '</tr></tfoot>' : '') +
      '</table></div>';
    return html;
  }

  var ETIQUETA_FACTOR = { 0.6: '−40 %', 0.8: '−20 %', 1: 'Actual', 1.2: '+20 %', 1.4: '+40 %' };
  function sensibilidadHtml(cfg, v, r, h) {
    if (typeof cfg.sensibilidad === 'function') { return tablaHtml(cfg.sensibilidad(r, v, h)); }
    var s = cfg.sensibilidad;
    var cols = s.columnas.map(function (col) {
      var campos = col.campos || [typeof col.campo === 'function' ? col.campo(v) : col.campo];
      return { col: col, celdas: C.FACTORES.map(function (k) {
        var copia = Object.assign({}, v);
        campos.forEach(function (c) { copia[c] = v[c] * k; });
        return { entrada: col.entrada(copia[campos[0]], h), salida: col.salida(cfg.calcular(copia), h) };
      }) };
    });
    var html = '<h2>' + esc(s.titulo) + '</h2><p class="nota">Cada columna mueve un solo dato (arriba, el dato; abajo, el resultado). El resto queda igual.</p>' +
      '<div class="tabla-envoltura"><table class="tabla-sens"><thead><tr><th scope="col">Cambio</th>' +
      cols.map(function (c) { return '<th scope="col" class="num">' + esc(c.col.etiqueta) + '</th>'; }).join('') + '</tr></thead><tbody>';
    C.FACTORES.forEach(function (k, i) {
      html += '<tr' + (k === 1 ? ' class="actual"' : '') + '><th scope="row">' + ETIQUETA_FACTOR[k] + '</th>' +
        cols.map(function (c) { var x = c.celdas[i]; return '<td class="num"><span class="sens-entrada">' + esc(x.entrada) + '</span><span class="sens-salida">' + esc(x.salida) + '</span></td>'; }).join('') + '</tr>';
    });
    return html + '</tbody></table></div>';
  }

  /* ════════════════════════════ Inicio y referencias ════════════════════════════ */
  function iniciarInicio() {
    var lista = document.getElementById('lista-calculadoras');
    if (lista) {
      lista.innerHTML = CALCS.lista.map(function (c) {
        return '<li><a class="tarjeta-calc" href="' + c.archivo + '"><span class="numero">' + c.numero + '</span>' +
          '<span class="tarjeta-calc-titulo">' + esc(c.titulo) + '</span><span class="tarjeta-calc-decision">' + esc(c.decision) + '</span></a></li>';
      }).join('');
    }
    var ind = document.getElementById('indices');
    if (ind) {
      var claves = ['ict_fadeeac', 'cedol_con_transporte', 'cedol_sin_transporte', 'cedol_distribucion_urbana', 'imc_ultima_milla', 'gasoil', 'nafta_super', 'alquiler_logistico', 'tc_usd'];
      ind.innerHTML = '<div class="tabla-envoltura"><table><thead><tr><th scope="col">Indicador</th><th scope="col" class="num">Valor</th><th scope="col" class="num">Fecha</th></tr></thead><tbody>' +
        claves.map(function (k) {
          var r = REF.REFERENCIAS[k];
          return '<tr><th scope="row"><a href="' + esc(r.fuente) + '" rel="noopener" target="_blank">' + esc(r.nombre) + '</a></th><td class="num">' + esc(F.numero(r.valor, Number.isInteger(r.valor) ? 0 : 2) + ' ' + r.unidad) + '</td><td class="num">' + esc(F.fecha(r.fecha)) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
  }

  function iniciarReferencias() {
    var cont = document.getElementById('todas-las-referencias');
    if (!cont) { return; }
    var claves = Object.keys(REF.REFERENCIAS);
    var hechos = claves.filter(function (k) { return REF.REFERENCIAS[k].tipo === 'HECHO'; });
    var est = claves.filter(function (k) { return REF.REFERENCIAS[k].tipo !== 'HECHO'; });
    cont.innerHTML = '<p>Actualizado el ' + esc(F.fecha(REF.ACTUALIZADO)) + ' · ' + hechos.length + ' hechos con fuente y ' + est.length + ' estimaciones marcadas.</p>' +
      '<h2>Hechos (con fuente y fecha)</h2><ul class="lista-refs">' + hechos.map(itemReferencia).join('') + '</ul>' +
      '<h2>Estimaciones (supuestos de trabajo)</h2><ul class="lista-refs">' + est.map(itemReferencia).join('') + '</ul>';
  }

  /* ════════════════════════════ Arranque ════════════════════════════ */
  function iniciar() {
    iniciarTema();
    var anio = document.getElementById('anio');
    if (anio) { anio.textContent = String(new Date().getFullYear()); }
    window.addEventListener('beforeprint', function () {
      Array.prototype.forEach.call(document.querySelectorAll('details'), function (d) { d.setAttribute('data-estaba', d.open ? '1' : '0'); d.open = true; });
    });
    window.addEventListener('afterprint', function () {
      Array.prototype.forEach.call(document.querySelectorAll('details[data-estaba]'), function (d) { d.open = d.getAttribute('data-estaba') === '1'; });
    });
    var raiz = document.getElementById('calculadora');
    if (raiz) {
      var cfg = CALCS.porId[raiz.getAttribute('data-calc')];
      try { iniciarCalculadora(raiz, cfg); }
      catch (e) { raiz.innerHTML = '<p class="error">No se pudo armar la calculadora. Probá recargar la página o volver a los valores de referencia.</p>'; if (window.console) { console.error(e); } }
    }
    iniciarInicio();
    iniciarReferencias();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); }
  else { iniciar(); }
})();
