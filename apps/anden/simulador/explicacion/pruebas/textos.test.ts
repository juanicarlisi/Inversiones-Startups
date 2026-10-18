// Textos: las mismas claves en español y en inglés, las mismas variables en cada traducción, ninguna clave huérfana ni sin texto,
// y ninguna marca de la lista negra (corte-1.md §1.6 y §1.7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TIPOS_DE_CAUSA, VARIABLES_POR_CLAVE, crearFrase, todasLasClaves } from '../frases.ts';
import { MENSAJE_FORMULARIO_LISTO } from '../formulario.ts';

const leer = (nombre: string): Record<string, string> => JSON.parse(readFileSync(new URL(`../${nombre}`, import.meta.url), 'utf8'));
const es = leer('textos.es.json');
const en = leer('textos.en.json');

/** Variables `{nombre}` de un texto, ordenadas y sin repetir. */
function variablesDe(texto: string): string[] {
  return [...new Set([...texto.matchAll(/\{([A-Za-z_]\w*)\}/g)].map((m) => m[1]))].sort();
}

const LISTA_NEGRA = [
  'Andreani', 'Mercado Libre', 'MercadoLibre', 'Correo Argentino', 'OCA', 'DHL', 'FedEx', 'UPS', 'Amazon', 'Loginter', 'Urbano', 'Rappi', 'PedidosYa',
];

test('español e inglés tienen exactamente las mismas claves, todas con prefijo explicacion.', () => {
  const soloEs = Object.keys(es).filter((k) => !(k in en));
  const soloEn = Object.keys(en).filter((k) => !(k in es));
  assert.deepEqual(soloEs, [], `claves que están en español y faltan en inglés: ${soloEs.join(', ')}`);
  assert.deepEqual(soloEn, [], `claves que están en inglés y faltan en español: ${soloEn.join(', ')}`);
  for (const k of Object.keys(es)) assert.ok(k.startsWith('explicacion.'), `la clave «${k}» no lleva el prefijo del paquete («explicacion.»)`);
  assert.ok(Object.keys(es).length >= 80, `se esperaban al menos 80 claves y hay ${Object.keys(es).length}`);
});

test('cada clave que el paquete puede emitir tiene texto en los dos idiomas, y cada texto corresponde a una clave que se emite', () => {
  const emitidas = todasLasClaves();
  for (const k of emitidas) {
    assert.ok(typeof es[k] === 'string' && es[k].length > 0, `la clave emitida «${k}» no tiene texto en español`);
    assert.ok(typeof en[k] === 'string' && en[k].length > 0, `la clave emitida «${k}» no tiene texto en inglés`);
  }
  const huerfanas = Object.keys(es).filter((k) => !emitidas.includes(k));
  assert.deepEqual(huerfanas, [], `textos sin clave que los emita (sobran o falta registrarlos en frases.ts): ${huerfanas.join(', ')}`);
});

test('las variables de cada texto son exactamente las que lleva la frase de esa clave (registro de frases.ts), en los dos idiomas', () => {
  for (const [clave, vars] of Object.entries(VARIABLES_POR_CLAVE)) {
    const debian = [...vars].sort();
    // las de «cambio» no son frases: sus variables las llena el cambio (reten, puestos, rampa, capacidad)
    assert.deepEqual(variablesDe(es[clave]), debian, `«${clave}» (es): el texto usa [${variablesDe(es[clave]).join(', ')}] y la frase lleva [${debian.join(', ')}]`);
    assert.deepEqual(variablesDe(en[clave]), debian, `«${clave}» (en): el texto usa [${variablesDe(en[clave]).join(', ')}] y la frase lleva [${debian.join(', ')}]`);
  }
});

test('llenar cada texto con sus variables no deja llaves sueltas', () => {
  for (const idioma of [es, en]) {
    for (const [clave, vars] of Object.entries(VARIABLES_POR_CLAVE)) {
      const lleno = idioma[clave].replace(/\{(\w+)\}/g, (_, n: string) => (vars.includes(n) ? '1' : `?${n}?`));
      assert.ok(!/[{}?]/.test(lleno), `«${clave}» queda con variables sin definir: ${lleno}`);
    }
  }
});

test('crearFrase solo acepta claves del registro y exactamente sus variables', () => {
  assert.throws(() => crearFrase('explicacion.paso.inventado', {}, []), /la clave «explicacion.paso.inventado» no está en el registro/);
  assert.throws(() => crearFrase('explicacion.paso.acumulacion', {}, []), /se esperaba con las variables \[min\] y llegaron \[\]/);
  assert.throws(() => crearFrase('explicacion.paso.acumulacion', { min: 1, de_mas: 2 }, []), /llegaron \[de_mas, min\]/);
  const f = crearFrase('explicacion.paso.acumulacion', { min: 1.5 }, []);
  assert.equal(f.clave, 'explicacion.paso.acumulacion');
});

test('una causa por tipo: frase de causa, de adelanto, de componente de la conjunta y cambio, en los dos idiomas', () => {
  for (const tipo of TIPOS_DE_CAUSA) {
    for (const base of ['causa', 'cambio']) {
      const clave = `explicacion.${base}.${tipo}`;
      assert.ok(es[clave] && en[clave], `falta ${clave}`);
    }
    for (const extra of [`explicacion.causa.${tipo}.adelanto`, `explicacion.causa.conjunta.${tipo}`]) assert.ok(es[extra] && en[extra], `falta ${extra}`);
  }
});

test('el mensaje de cierre del formulario es el de la especificación', () => {
  assert.equal(MENSAJE_FORMULARIO_LISTO, 'explicacion.formulario.listo');
  assert.equal(es[MENSAJE_FORMULARIO_LISTO], 'Ya está: lo que falta no cambia la respuesta.');
  assert.match(en[MENSAJE_FORMULARIO_LISTO], /what is left does not change the answer/);
});

test('toda causa confirmada dice que fue confirmada con la misma noche, y ninguna frase afirma causa sin decir «confirmado»', () => {
  for (const tipo of TIPOS_DE_CAUSA) {
    assert.match(es[`explicacion.causa.${tipo}`], /Confirmado: repetida la misma noche/, `explicacion.causa.${tipo} (es)`);
    assert.match(es[`explicacion.causa.${tipo}.adelanto`], /Confirmado: repetida la misma noche/, `explicacion.causa.${tipo}.adelanto (es)`);
    assert.match(en[`explicacion.causa.${tipo}`], /Confirmed: rerunning the same night/, `explicacion.causa.${tipo} (en)`);
    assert.match(en[`explicacion.causa.${tipo}.adelanto`], /Confirmed: rerunning the same night/, `explicacion.causa.${tipo}.adelanto (en)`);
  }
  // la biografía describe, no culpa: ningún texto de paso dice «por culpa», «gracias a» ni «provocó»
  for (const [clave, texto] of Object.entries(es)) {
    if (clave.startsWith('explicacion.paso.')) assert.doesNotMatch(texto, /por culpa|gracias a|provocó|causó|se debió/i, `${clave}: la biografía no afirma causas`);
  }
});

test('ningún nombre de empresa de la lista negra en los textos (palabras completas, con mayúsculas como se escriben)', () => {
  for (const [idioma, textos] of [['es', es], ['en', en]] as const) {
    for (const [clave, texto] of Object.entries(textos)) {
      for (const marca of LISTA_NEGRA) {
        const aparece = new RegExp(`(^|[^\\p{L}])${marca}($|[^\\p{L}])`, 'u').test(texto);
        assert.equal(aparece, false, `${idioma} «${clave}» nombra a «${marca}»`);
      }
    }
  }
});

test('voseo rioplatense en las instrucciones al usuario del español («medilo»), sin tuteo', () => {
  assert.match(es['explicacion.medicion.resumen'], /Medilo/);
  for (const [clave, texto] of Object.entries(es)) assert.doesNotMatch(texto, /\b(mide|tienes|puedes|quieres)\b/i, `${clave}: tuteo`);
});
