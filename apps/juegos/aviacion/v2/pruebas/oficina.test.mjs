// Pruebas de la oficina que no necesitan navegador: los textos (pares es/en, cero jerga, largos) y las hojas (se arman con
// el ejemplo propio y con el ejemplo real del juego, en los dos idiomas, sin huecos ni datos inventados).
//   cd apps/juegos/aviacion/v2 && node --test pruebas/oficina.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { TEXTOS_OFICINA, COLORES_EMPRESA, LARGO_NOMBRE, crearTextos, horaNumero, horaTexto } from '../src/oficina/textos.js';
import { HOJAS, ORDEN_OBJETOS, ICO, veredicto, diasDelLibro, hojaBandeja, NOTAS_A_LA_VISTA } from '../src/oficina/hojas.js';
import { datosEjemplo, juegoDeEjemplo } from '../src/oficina/ejemplo.js';

const es = TEXTOS_OFICINA.es, en = TEXTOS_OFICINA.en;
const sinMarcas = (h) => h.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
// Lo que un chico de 12 años no entiende, o lo que el diseño pidió no decir (cartas y paquetes, base, ruta, luces).
const PROHIBIDAS = {
  es: [/\bsacas?\b/i, /transbord/i, /baliza/i, /\bhub\b/i, /clasific/i, /cuello de botella/i, /\bflota\b/i, /\bslots?\b/i, /factor de (carga|ocupaci)/i, /\bocupaci[oó]n\b/i, /rentab/i, /\bROI\b/, /\bKPI/i, /amortiz/i, /\bmargen\b/i, /payback/i, /\bfaros?\b/i, /cambi\w+ de avión/i],
  en: [/\bbags?\b/i, /\bhub\b/i, /bottleneck/i, /\bsort(ing)? cent/i, /\bfleet\b/i, /load factor/i, /\bROI\b/, /\bKPI/i, /payback/i, /amortiz/i, /profitab/i, /transship/i, /\bbeacons?\b/i],
};

test('español e inglés tienen exactamente las mismas claves, y ninguna vacía', () => {
  const a = Object.keys(es).sort(), b = Object.keys(en).sort();
  assert.deepEqual(a.filter((k) => !b.includes(k)), [], 'faltan en inglés');
  assert.deepEqual(b.filter((k) => !a.includes(k)), [], 'faltan en español');
  for (const [L, T] of [['es', es], ['en', en]]) for (const [k, v] of Object.entries(T)) assert.ok(typeof v === 'string' && v.trim().length > 0, `${L}.${k} está vacío`);
});

test('los dos idiomas usan las mismas variables en cada texto', () => {
  const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1].toLowerCase()).sort().join(',');
  for (const k of Object.keys(es)) assert.equal(vars(es[k]), vars(en[k]), `las variables de «${k}» no coinciden`);
});

test('cero jerga en los textos: cartas, base, ruta y luces; nada del oficio', () => {
  for (const L of ['es', 'en']) for (const [k, v] of Object.entries(TEXTOS_OFICINA[L])) for (const re of PROHIBIDAS[L]) assert.ok(!re.test(v), `${L}.${k}: «${v}» usa ${re}`);
});

test('rioplatense: se trata de vos, no de tú ni de usted', () => {
  for (const [k, v] of Object.entries(es)) {
    assert.ok(!/\b(tú|usted|tienes|puedes|quieres|haz|toca|elige|mira)\b/i.test(v.replace(/\{[Tt]oca\}/g, '')), `es.${k}: «${v}» no está en rioplatense`);
  }
});

test('cada objeto tiene nombre, lo que hay detrás, su hoja y su ícono; los rótulos son cortos', () => {
  assert.deepEqual(ORDEN_OBJETOS, ['mapa', 'libro', 'flota', 'bandeja', 'cuaderno', 'placa']);
  for (const id of ORDEN_OBJETOS) {
    assert.equal(typeof HOJAS[id], 'function', `falta la hoja de ${id}`);
    assert.ok(ICO[id], `falta el ícono de ${id}`);
    for (const T of [es, en]) {
      assert.ok(T[`o_${id}`].length <= 14, `el nombre de ${id} es largo: ${T[`o_${id}`]}`);
      assert.ok(T[`o_${id}_s`].length <= 24, `el rótulo de ${id} es largo: ${T[`o_${id}_s`]}`);
    }
  }
});

test('la primera vez: dos frases cortas, un nombre por defecto propio y un recorrido de tres pasos', () => {
  for (const T of [es, en]) {
    assert.ok(`${T.p_frase1} ${T.p_frase2}`.length <= 110, 'las dos frases de la puerta son cortas');
    assert.ok((`${T.p_frase1} ${T.p_frase2}`.match(/[.!?](\s|$)/g) ?? []).length <= 3, 'son dos frases (la segunda puede llevar dos puntos)');
    for (const k of ['r_mapa', 'r_libro', 'r_flota']) { assert.ok(sinMarcas(T[k]).length <= 90, `${k} es largo`); assert.equal((T[k].match(/<b>/g) ?? []).length, 1, `${k} nombra una sola cosa`); }
    assert.ok(T.nombreDefecto.length >= 8 && T.nombreDefecto.length <= LARGO_NOMBRE, 'el nombre por defecto entra en la placa');
    // ninguna empresa real de correo aéreo o aerolínea de la región
    assert.ok(!/aeroposta|a[eé]ropostale|lat[eé]co[eè]re|panagra|nyrba|aerol[ií]neas argentinas|austral|pluna|varig|lan chile|latam|lade\b|condor|cruzeiro|zonda|lapa\b|fama\b|correo argentino/i.test(T.nombreDefecto), 'el nombre por defecto no es el de una empresa real');
  }
  assert.equal(COLORES_EMPRESA.length, 8);
  for (const [k, c] of COLORES_EMPRESA) { assert.ok(es[k] && en[k], `falta el nombre del color ${k}`); assert.match(c, /^#[0-9a-f]{6}$/); }
});

test('formatos: plata, porcentajes y la hora en número o en texto', () => {
  const F = crearTextos('es'), G = crearTextos('en');
  assert.equal(F.plata(86395).replace(/\s/g, ' '), '$ 86.395'); assert.equal(G.plata(86395).replace(/\s/g, ' '), '$ 86,395');
  assert.equal(F.plata(-500).replace(/\s/g, ' '), '−$ 500'); assert.equal(F.plataSigno(410).replace(/\s/g, ' '), '+$ 410');
  assert.equal(F.pct(0.807).replace(/\s/g, ' '), '81 %');
  assert.equal(horaNumero('18:35'), 18 + 35 / 60); assert.equal(horaNumero(9.5), 9.5); assert.equal(horaNumero(undefined, 7), 7); assert.equal(horaTexto(9.5), '09:30'); assert.equal(horaTexto('18:35'), '18:35');
  assert.match(crearTextos('es', true).t('pista'), /Tocá/); assert.match(crearTextos('es', false).t('pista'), /Hacé clic/);
});

// ── las hojas, con datos ──
const juegos = [['ejemplo propio', (L) => datosEjemplo(L)]];
const real = new URL('../src/oficina-datos-ejemplo.json', import.meta.url);
if (existsSync(real)) juegos.push(['ejemplo real del juego', () => JSON.parse(readFileSync(real, 'utf8'))]);

for (const [nombre, hacer] of juegos) {
  test(`las seis hojas se arman con el ${nombre}, sin huecos, en los dos idiomas`, () => {
    for (const L of ['es', 'en']) {
      const F = crearTextos(L, true), d = hacer(L);
      for (const id of ORDEN_OBJETOS) {
        const h = HOJAS[id](d, F, id === 'flota' ? {} : undefined), txt = sinMarcas(h);
        assert.ok(!/undefined|NaN|\[object|null\b/.test(txt), `${L}.${id}: hay un hueco → ${txt.match(/.{0,40}(undefined|NaN|\[object|null).{0,40}/)?.[0]}`);
        assert.ok(!/\{\w+\}/.test(txt), `${L}.${id}: quedó una variable sin llenar → ${txt.match(/.{0,30}\{\w+\}.{0,30}/)?.[0]}`);
        assert.ok(h.includes('data-of="cerrar"'), `${L}.${id}: la hoja tiene cómo volver`);
        // lo propio de la oficina (rótulos y títulos) sin jerga; los textos que manda el juego se prueban en su propia prueba
        if (nombre === 'ejemplo propio') for (const re of PROHIBIDAS[L]) assert.ok(!re.test(txt), `${L}.${id}: «${txt.match(new RegExp(`.{0,30}${re.source}.{0,30}`, 'i'))?.[0]}» usa ${re}`);
      }
    }
  });
}

test('tu red: lo esencial primero (cuánto deja), la mejor ruta arriba y lo prometido contra lo real', () => {
  const F = crearTextos('es'), d = datosEjemplo('es'), h = HOJAS.mapa(d, F), txt = sinMarcas(h);
  assert.ok(txt.indexOf('13.600') < txt.indexOf('Montevideo'), 'el total del día va antes que las rutas');
  assert.ok(txt.indexOf('Montevideo') < txt.indexOf('Bahía Blanca') && txt.indexOf('Bahía Blanca') < txt.indexOf('Rosario'), 'ordenadas por lo que dejan');
  assert.equal((h.match(/data-of="ir" data-a="ruta"/g) ?? []).length, d.rutas.length, 'cada ruta se puede ir a ver');
  assert.equal(veredicto(d.rutas[0], 13).tipo, 'mas'); assert.equal(veredicto(d.rutas[1], 13).tipo, 'cumple'); assert.equal(veredicto(d.rutas[2], 13).tipo, 'menos');
  assert.equal(veredicto(d.rutas[3], 13).tipo, 'nueva', 'una ruta de menos de tres días todavía no se juzga');
  assert.equal(veredicto({ ...d.rutas[0], prometido: null }, 13).tipo, 'sin');
  assert.match(txt, /Con luces: vuela de noche/); assert.match(txt, /Pierde por día/);
  assert.ok(!/<table/i.test(h), 'sin tablas');
});

test('las cuentas: entró, salió y quedó del último día, un gráfico con una barra por día y lo de hoy si el juego lo manda', () => {
  const F = crearTextos('es'), d = datosEjemplo('es'), h = HOJAS.libro(d, F), txt = sinMarcas(h);
  for (const p of ['Entró', 'Salió', 'Quedó', '31.700', '18.100', '13.600', 'Cartas llevadas']) assert.ok(txt.includes(p), `falta «${p}»`);
  assert.equal((h.match(/class="bar /g) ?? []).length, 12);
  const conHoy = { ...d, hoy: { ...d.hoy, entro: 5000, salio: 6200, cartas: 40, vuelos: 6, aTiempo: 6, tarde: 0 } };
  assert.equal(diasDelLibro(conHoy, F).at(-1).hoy, true);
  assert.match(HOJAS.libro(conHoy, F), /class="bar neg hoy/);
  assert.match(sinMarcas(HOJAS.libro({ ...d, dias: [] }, F)), /Volvé mañana/);
});

test('tus aviones: uno por tarjeta, con su ruta por nombre, qué hace ahora y cómo ir a verlo', () => {
  const F = crearTextos('es'), d = datosEjemplo('es'), h = HOJAS.flota(d, F, {}), txt = sinMarcas(h);
  assert.equal((h.match(/class="tarjeta avion"/g) ?? []).length, 5);
  assert.equal((h.match(/data-of="ir" data-a="avion"/g) ?? []).length, 5);
  for (const p of ['Volando', 'En tierra', 'Durmiendo', 'Buenos Aires – Montevideo', 'Ganó', 'Perdió', 'Viajes']) assert.ok(txt.includes(p), `falta «${p}»`);
  assert.ok(!txt.includes('BUE-MVD'), 'la ruta se dice por su nombre, no por su código');
});

test('bandeja: lo sin leer primero, las acciones que trae cada nota y «ya lo leí»; con muchas notas no se muestran todas juntas', () => {
  const F = crearTextos('es'), d = datosEjemplo('es'), h = HOJAS.bandeja(d, F);
  assert.ok(h.indexOf('data-nota="n1"') < h.indexOf('data-nota="n6"'), 'las leídas van al final');
  assert.equal((h.match(/data-of="leido"/g) ?? []).length, 5);
  assert.equal((h.match(/data-of="bandeja"/g) ?? []).length, 5, 'dos encargos con dos acciones y un resultado con una');
  assert.match(sinMarcas(h), /5 sin leer/);
  const muchas = { ...d, bandeja: Array.from({ length: 30 }, (_, i) => ({ id: `x${i}`, tipo: 'nota', titulo: `Nota ${i}`, texto: 'Texto.', dia: i, leido: false, acciones: [] })) };
  assert.equal((hojaBandeja(muchas, F).match(/class="tarjeta nota/g) ?? []).length, NOTAS_A_LA_VISTA);
  assert.match(hojaBandeja(muchas, F), /data-of="masNotas"/);
  assert.equal((hojaBandeja(muchas, F, true).match(/class="tarjeta nota/g) ?? []).length, 30);
  // lo que manda el juego se muestra tal cual, pero nunca como HTML
  assert.ok(!HOJAS.bandeja({ ...d, bandeja: [{ id: 'z', tipo: 'nota', titulo: '<img src=x onerror=alert(1)>', texto: '<b>hola</b>', dia: 1, leido: false, acciones: [] }] }, F).includes('<img'));
});

test('cuaderno: en la etapa 1 llega vacío y se muestra como cuaderno nuevo, sin inventar contenido', () => {
  for (const L of ['es', 'en']) {
    const F = crearTextos(L), h = HOJAS.cuaderno(datosEjemplo(L), F), txt = sinMarcas(h);
    assert.ok(txt.includes(F.t('cuadernoNuevo_t')) && txt.includes(F.t('cuadernoNuevo')));
    assert.ok(!h.includes('class="tarjeta apunte'), 'no hay apuntes inventados');
  }
  const con = HOJAS.cuaderno({ cuaderno: [{ id: 'a', nombre: 'La base', frase: 'Las cartas llegan en un avión y siguen en otro.', estado: 'usado' }] }, crearTextos('es'));
  assert.match(sinMarcas(con), /La base.*Lo usaste|Lo usaste.*La base/);
});

test('tu empresa: el nombre y el color se cambian acá; sin nombre, se propone el de defecto', () => {
  const F = crearTextos('es'), h = HOJAS.placa(datosEjemplo('es', { primera: true }), F);
  assert.match(h, /value="Correo Aéreo Lucero"/); assert.match(h, new RegExp(`maxlength="${LARGO_NOMBRE}"`));
  assert.equal((h.match(/data-of="color"/g) ?? []).length, 8);
  assert.match(sinMarcas(HOJAS.placa(datosEjemplo('es'), F)), /Fundada el 1 de nov de 1929/);
});

test('el ejemplo propio cumple el contrato de datos y el juego de mentira aplica las acciones', () => {
  const d = datosEjemplo('es');
  assert.deepEqual(Object.keys(d).sort(), ['bandeja', 'carrera', 'cuaderno', 'dias', 'empresa', 'flota', 'hoy', 'rutas']);
  assert.equal(d.dias.length, 12); assert.equal(d.rutas.length, 4); assert.equal(d.flota.length, 5); assert.equal(d.bandeja.length, 8);
  for (const r of d.rutas) assert.deepEqual(Object.keys(r).sort(), ['abiertaDia', 'aviones', 'cartasDia', 'dejaDia', 'entroDia', 'id', 'km', 'llenado', 'luces', 'nombre', 'prometido', 'salioDia']);
  for (const a of d.flota) { assert.ok(['volando', 'en tierra', 'durmiendo'].includes(a.estado)); assert.ok(d.rutas.some((r) => r.id === a.ruta)); }
  for (const n of d.bandeja) assert.ok(['encargo', 'resultado', 'nota', 'propuesta'].includes(n.tipo));
  for (const r of d.rutas) assert.equal(r.dejaDia, r.entroDia - r.salioDia, 'lo que deja es lo que entra menos lo que sale');
  const j = juegoDeEjemplo('es');
  j.accion({ tipo: 'leido', id: 'n1' }); assert.equal(j.datos().bandeja.find((n) => n.id === 'n1').leido, true);
  j.accion({ tipo: 'nombre', nombre: 'Alas del Sur', color: '#27457f' }); assert.deepEqual([j.datos().empresa.nombre, j.datos().empresa.color], ['Alas del Sur', '#27457f']);
  j.accion({ tipo: 'bandeja', id: 'n4', accion: 'aceptar' }); assert.deepEqual(j.datos().bandeja.find((n) => n.id === 'n4').acciones, []);
});
