/*
 * Andén — lectura y formato de números en castellano rioplatense.
 * Puro (sin DOM): lo usan la interfaz y las pruebas.
 * Entre el símbolo y el número va un espacio que no se corta (\u00a0).
 */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { raiz.AndenFormato = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /*
   * Lee lo que escribe una persona: «1.126.149,40», «3900», «2,5», «0.44», «$ 1.535».
   * Regla: la coma es decimal y el punto separa miles. Si no hay coma y hay un solo punto
   * seguido de exactamente tres cifras («1.535»), se toma como separador de miles.
   */
  function leerNumero(texto) {
    if (typeof texto === 'number') { return isFinite(texto) ? texto : NaN; }
    if (texto === null || texto === undefined) { return NaN; }
    var s = String(texto).replace(/\s/g, '').replace(/\$|usd|%/gi, '');
    if (s === '') { return NaN; }
    var signo = 1;
    if (s.charAt(0) === '-') { signo = -1; s = s.slice(1); }
    if (s.indexOf(',') >= 0) {
      if (s.split(',').length > 2) { return NaN; }
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      var partes = s.split('.');
      if (partes.length > 2) {
        s = partes.join('');
      } else if (partes.length === 2 && partes[1].length === 3 && partes[0].length > 0 && partes[0] !== '0') {
        s = partes.join('');
      }
    }
    if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) { return NaN; }
    return signo * parseFloat(s);
  }

  var cache = {};
  function formateador(decimales) {
    if (!cache[decimales]) {
      cache[decimales] = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: decimales, maximumFractionDigits: decimales
      });
    }
    return cache[decimales];
  }

  function decimalesAuto(x) {
    var a = Math.abs(x);
    if (a >= 100) { return 0; }
    if (a >= 10) { return 1; }
    return 2;
  }

  function numero(x, decimales) {
    if (typeof x !== 'number' || !isFinite(x)) { return '—'; }
    var d = (decimales === undefined || decimales === null) ? decimalesAuto(x) : decimales;
    var r = formateador(d).format(x);
    return r === '-0' ? '0' : r;
  }

  function pesos(x, decimales) {
    if (typeof x !== 'number' || !isFinite(x)) { return '—'; }
    var d = (decimales === undefined || decimales === null) ? ((Math.abs(x) >= 100 || x === 0) ? 0 : 2) : decimales;
    return (x < 0 ? '−$\u00a0' : '$\u00a0') + numero(Math.abs(x), d);
  }

  function usd(x, decimales) {
    if (typeof x !== 'number' || !isFinite(x)) { return '—'; }
    return (x < 0 ? '−USD\u00a0' : 'USD\u00a0') + numero(Math.abs(x), decimales);
  }

  function porcentaje(x, decimales) {
    if (typeof x !== 'number' || !isFinite(x)) { return '—'; }
    return numero(x, decimales === undefined ? 1 : decimales) + '\u00a0%';
  }

  /* Valor para mostrar dentro de un campo editable (sin símbolo, con separador de miles). */
  function paraCampo(x) {
    if (typeof x !== 'number' || !isFinite(x)) { return ''; }
    var a = Math.abs(x);
    var d = Number.isInteger(x) ? 0 : (a >= 1000 ? 2 : (a >= 1 ? 2 : 4));
    var r = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: d }).format(x);
    return r;
  }

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  /* «2026-10-16» → «16-10-2026»; «2026-09» → «sep-2026»; «2026» → «2026». */
  function fecha(iso) {
    if (!iso) { return 's/f'; }
    var p = String(iso).split('-');
    if (p.length === 3) { return p[2] + '-' + p[1] + '-' + p[0]; }
    if (p.length === 2) { return MESES[parseInt(p[1], 10) - 1].slice(0, 3) + '-' + p[0]; }
    return p[0];
  }

  return {
    leerNumero: leerNumero, numero: numero, pesos: pesos, usd: usd,
    porcentaje: porcentaje, paraCampo: paraCampo, fecha: fecha
  };
});
