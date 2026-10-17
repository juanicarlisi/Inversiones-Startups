#!/usr/bin/env node
/*
 * Genera las páginas HTML estáticas de Andén (encabezado, pie y textos para buscadores).
 * No es un paso obligatorio: las páginas ya están generadas y el sitio funciona sin correr nada.
 * Usarlo solo si cambia el encabezado, el pie o los textos de una calculadora:
 *     node herramientas/paginas.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const CALCS = require('../js/calculadoras.js');
const REF = require('../js/referencias.js');
const F = require('../js/formato.js');

const RAIZ = path.join(__dirname, '..');
const esc = CALCS.esc;
const minuscula = s => s.charAt(0).toLowerCase() + s.slice(1);

const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" opacity=".14"/><path d="M6.5 22.5h19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><rect x="9" y="11" width="7.5" height="8" rx="1.6" fill="currentColor"/><rect x="18" y="14" width="5" height="5" rx="1.2" fill="currentColor" opacity=".7"/></svg>';

function encabezado(actual) {
  const items = [{ archivo: 'index.html', texto: 'Inicio' }]
    .concat(CALCS.lista.map(c => ({ archivo: c.archivo, texto: c.numero + '. ' + c.corto })))
    .concat([{ archivo: 'referencias.html', texto: 'Valores de referencia' }]);
  return `<header class="encabezado">
  <div class="encabezado-interior">
    <a class="marca" href="index.html" style="color:var(--acento)">${LOGO}<span style="color:var(--texto)">Andén <small>calculadoras logísticas</small></span></a>
    <details class="menu">
      <summary>Calculadoras</summary>
      <ul>
${items.map(i => `        <li><a href="${i.archivo}"${i.archivo === actual ? ' aria-current="page"' : ''}>${esc(i.texto)}</a></li>`).join('\n')}
      </ul>
    </details>
    <button type="button" id="boton-tema">Tema automático</button>
  </div>
</header>`;
}

function pie() {
  return `<footer class="pie">
  <div class="pie-interior">
    <p><strong>Andén</strong> (nombre provisorio) · Calculadoras logísticas con costos argentinos. Versión 0, en prueba: las fórmulas están en revisión.</p>
    <p>Los resultados son estimaciones para decidir y no reemplazan el asesoramiento contable, laboral ni legal. Sin cookies ni cuentas: lo que cargás queda en tu navegador.
    Valores de referencia del ${esc(F.fecha(REF.ACTUALIZADO))} · <a href="referencias.html">ver todas las fuentes</a>.</p>
  </div>
</footer>`;
}

function documento({ archivo, titulo, descripcion, cuerpo, pagina }) {
  return `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#0f7a55">
<link rel="stylesheet" href="css/anden.css">
<script>try{var t=JSON.parse(localStorage.getItem('anden:tema'));if(t==='claro'||t==='oscuro'){document.documentElement.setAttribute('data-tema',t);}}catch(e){}</script>
</head>
<body data-pagina="${pagina}">
${encabezado(archivo)}
<main id="contenido">
${cuerpo}
</main>
${pie()}
<script src="js/formato.js"></script>
<script src="js/referencias.js"></script>
<script src="js/calculos.js"></script>
<script src="js/calculadoras.js"></script>
<script src="js/app.js"></script>
</body>
</html>
`;
}

const NOSCRIPT = '<noscript><p class="error">Esta calculadora necesita JavaScript activado. No usa cookies ni manda datos a ningún servidor.</p></noscript>';

function paginaCalculadora(c) {
  const cuerpo = `<p class="migas"><a href="index.html">Andén</a> › Calculadora ${c.numero}</p>
<h1>${esc(c.titulo)}</h1>
<p class="decision"><strong>Qué decide:</strong> ${esc(minuscula(c.decision))}</p>
${NOSCRIPT}
<div id="calculadora" data-calc="${c.id}"></div>
<div class="barra-resultado" aria-hidden="true"></div>`;
  return documento({
    archivo: c.archivo, pagina: 'calculadora',
    titulo: `${c.titulo} · Andén`,
    descripcion: `Calculadora gratis en español con costos argentinos de ${REF.PERIODO_PESOS}: ${minuscula(c.decision)}`,
    cuerpo
  });
}

function paginaInicio() {
  const cuerpo = `<section class="portada">
<h1>Calculá tu operación logística con números de acá</h1>
<p>Seis calculadoras para decidir tarifas, costos y dotaciones con valores argentinos fechados y con fuente: convenios de Camioneros y Comercio, combustibles, alquileres logísticos e índices de costos. Cada una muestra el ejemplo resuelto paso a paso.</p>
</section>
<ul class="lista-calc" id="lista-calculadoras">
${CALCS.lista.map(c => `  <li><a class="tarjeta-calc" href="${c.archivo}"><span class="numero">${c.numero}</span><span class="tarjeta-calc-titulo">${esc(c.titulo)}</span><span class="tarjeta-calc-decision">${esc(c.decision)}</span></a></li>`).join('\n')}
</ul>
<section class="bloque">
<h2>Índices y precios de referencia del mes</h2>
<p class="nota">Lo último publicado al ${esc(F.fecha(REF.ACTUALIZADO))}. Se actualizan una vez por mes.</p>
<div id="indices"></div>
</section>
<h2 style="margin-top:1.5rem">Cómo funciona</h2>
<ul class="principios">
  <li><strong>Con fuente y fecha.</strong> Cada valor de referencia dice de dónde sale y si es un dato publicado (HECHO) o un supuesto para el ejemplo (ESTIMACIÓN).</li>
  <li><strong>Todo editable.</strong> Cambiá cualquier número por el tuyo; la cuenta se rehace al instante.</li>
  <li><strong>Sin cuentas ni cookies.</strong> Tu escenario se guarda solo en tu navegador y lo podés compartir con un enlace.</li>
  <li><strong>Para imprimir.</strong> Cada calculadora sale en papel o PDF con los datos, el desglose y las fuentes.</li>
</ul>`;
  return documento({
    archivo: 'index.html', pagina: 'inicio',
    titulo: 'Andén · Calculadoras logísticas con costos argentinos',
    descripcion: 'Calculadoras gratis en español: tarifa al transportista, costo por recorrido, costo laboral (Camioneros y Comercio), costo por paquete clasificado, costo de almacenamiento y peso volumétrico.',
    cuerpo
  });
}

function paginaReferencias() {
  const cuerpo = `<p class="migas"><a href="index.html">Andén</a> › Valores de referencia</p>
<h1>Valores de referencia</h1>
<p class="decision">Todos los números que usan las calculadoras, con su fuente, su fecha y si son un dato publicado o un supuesto de trabajo. Se revisan una vez por mes.</p>
${NOSCRIPT}
<div id="todas-las-referencias"></div>`;
  return documento({
    archivo: 'referencias.html', pagina: 'referencias',
    titulo: 'Valores de referencia · Andén',
    descripcion: 'Índice FADEEAC, CEDOL/UTN, última milla, escalas de Camioneros y Comercio, cargas sociales, combustibles, alquileres logísticos y divisores de peso volumétrico, con fuente y fecha.',
    cuerpo
  });
}

const salidas = [['index.html', paginaInicio()], ['referencias.html', paginaReferencias()]]
  .concat(CALCS.lista.map(c => [c.archivo, paginaCalculadora(c)]));
for (const [archivo, html] of salidas) {
  fs.writeFileSync(path.join(RAIZ, archivo), html);
  console.log('escrito', archivo);
}
