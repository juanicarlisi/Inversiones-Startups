// pruebas/enlace.test.ts · P3 · El códec del enlace: ida y vuelta exacta, tamaños, recetas, base64url y robustez.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import {
  aBase64url, codificarReceta, crearCodec, crearCodecContrato, decodificarReceta, deBase64url, MAX_ESCENARIOS_RECETA, problemaReceta,
} from '../enlace.ts';
import { compilar } from '../compilar.ts';
import { jsonCanonico } from '../canonico.ts';
import { LIMITES_ENLACE } from '../../contratos/escena.ts';
import type { Enlace } from '../../contratos/escena.ts';
import type { Receta } from '../../contratos/experimentos.ts';
import type { OpParche } from '../../contratos/modelo.ts';
import { Lcg, ejemploJson, ejemploModelo, resolverEjemplo, resumen } from './ayudas.ts';

const codec = crearCodec(resolverEjemplo);
const PLANTILLA = { id: 'hub-chico', version: '1.0.0' };
const HUELLA_EJEMPLO = '0491977a06fedf2a';
const RECETA: Receta = { v: 1, modelo: HUELLA_EJEMPLO, motor: '1.0.0', semilla: 20261017, replicas: 100, noche: 37, t: 5_400_000, vel: 600, esc: ['base', 'mas-un-puesto'] };
const PARCHE_5: OpParche[] = [
  { op: 'replace', path: '/personas/induccion/puestosActivos', value: 4 },
  { op: 'replace', path: '/personas/induccion/reten', value: 1 },
  { op: 'replace', path: '/personas/rampa/asignacion', value: 'contiguas' },
  { op: 'replace', path: '/demanda/camiones/paquetes', value: 1200 },
  { op: 'replace', path: '/parametros/ausentismo/valor', value: 0.08 },
];

async function idaYVuelta(e: Enlace): Promise<Enlace> {
  const f = await codec.codificar(e);
  const r = await codec.decodificar(f);
  assert.ok(r.ok, `no decodificó su propio fragmento: ${JSON.stringify(r)}`);
  return r.enlace;
}

test('ida y vuelta exacta del modelo completo (sin y con receta)', async () => {
  const m = ejemploModelo();
  assert.deepEqual(await idaYVuelta({ tipo: 'modelo', modelo: m }), { tipo: 'modelo', modelo: m });
  assert.deepEqual(await idaYVuelta({ tipo: 'modelo', modelo: m, receta: RECETA }), { tipo: 'modelo', modelo: m, receta: RECETA });
});

test('ida y vuelta exacta de plantilla + parche (sin y con receta) y de la plantilla sola', async () => {
  const e1: Enlace = { tipo: 'plantilla', plantilla: PLANTILLA, parche: PARCHE_5 };
  assert.deepEqual(await idaYVuelta(e1), e1);
  const e2: Enlace = { tipo: 'plantilla', plantilla: PLANTILLA, parche: [] };
  assert.deepEqual(await idaYVuelta(e2), e2);
  assert.equal(await codec.codificar(e2), 't=hub-chico@1.0.0', 'sin parche no se escribe «p»');
});

test('ida y vuelta exacta de solo la receta', async () => {
  const e: Enlace = { tipo: 'receta', receta: RECETA };
  assert.deepEqual(await idaYVuelta(e), e);
});

test('plantilla + parche + receta: la receta tiene que ser de la huella del modelo ya parchado', async () => {
  const parchado = await compilar((await import('../parches.ts')).aplicarParche(ejemploModelo(), PARCHE_5));
  assert.ok(parchado.ok, parchado.ok ? '' : resumen(parchado.diagnosticos));
  const buena: Receta = { ...RECETA, modelo: parchado.mv.huella };
  const e: Enlace = { tipo: 'plantilla', plantilla: PLANTILLA, parche: PARCHE_5, receta: buena };
  assert.deepEqual(await idaYVuelta(e), e);
  // Con la huella de otro modelo, el enlace se rechaza: la película no sería la del autor.
  const mala = await codec.decodificar(await codec.codificar({ ...e, receta: { ...buena, modelo: HUELLA_EJEMPLO } }));
  assert.ok(!mala.ok && mala.error === 'esquema' && /receta de otro modelo/.test(mala.detalle ?? ''), JSON.stringify(mala));
  const mala2 = await codec.decodificar(await codec.codificar({ tipo: 'modelo', modelo: ejemploModelo(), receta: { ...RECETA, modelo: '0000000000000000' } }));
  assert.ok(!mala2.ok && mala2.error === 'esquema');
});

test('tamaños (corte-1.md §9): ejemplo completo ≤ 8.000 caracteres, plantilla + parche de 5 cambios ≤ 400, receta ≤ 160', async () => {
  const completo = await codec.codificar({ tipo: 'modelo', modelo: ejemploModelo() });
  assert.ok(completo.length <= 8000, `el ejemplo completo mide ${completo.length} caracteres y el máximo es 8.000`);
  assert.ok(completo.length <= LIMITES_ENLACE.maxCaracteres);
  const conParche = await codec.codificar({ tipo: 'plantilla', plantilla: PLANTILLA, parche: PARCHE_5 });
  assert.ok(conParche.length <= 400, `plantilla + parche de 5 cambios mide ${conParche.length} caracteres y el máximo es 400`);
  const receta = codificarReceta(RECETA);
  assert.ok(receta.length <= 160, `la receta mide ${receta.length} caracteres y el máximo es 160`);
  // Una receta mínima (sin noche, instante, velocidad ni escenarios) ocupa lo mínimo.
  const minima = codificarReceta({ v: 1, modelo: HUELLA_EJEMPLO, motor: '1.0.0', semilla: 1, replicas: 20 });
  assert.ok(minima.length <= 30, `la receta mínima mide ${minima.length} caracteres`);
  // Referencia: lo que mide el mismo JSON canónico con zlib (MEDIDO en corte-1.md: 6.006 con zlib, 6.022 con CompressionStream).
  const zlib = aBase64url(deflateRawSync(Buffer.from(jsonCanonico(ejemploModelo()), 'utf8'))).length + 2;
  assert.ok(Math.abs(completo.length - zlib) <= 80, `CompressionStream (${completo.length}) y zlib (${zlib}) difieren demasiado`);
});

test('el fragmento solo usa caracteres de URL seguros: letras, números, - _ = & @', async () => {
  for (const e of [{ tipo: 'modelo', modelo: ejemploModelo(), receta: RECETA }, { tipo: 'plantilla', plantilla: PLANTILLA, parche: PARCHE_5, receta: RECETA }, { tipo: 'receta', receta: RECETA }] as Enlace[]) {
    const f = await codec.codificar(e);
    assert.match(f, /^[A-Za-z0-9_\-=&@.]+$/, f.slice(0, 60));
    assert.equal(encodeURIComponent(f.replace(/[&=@]/g, '')), f.replace(/[&=@]/g, ''), 'hay caracteres que un navegador tendría que escapar');
  }
});

test('la codificación es determinista: el mismo enlace da el mismo fragmento, con las claves del modelo en cualquier orden', async () => {
  const m = ejemploModelo();
  const f1 = await codec.codificar({ tipo: 'modelo', modelo: m });
  const f2 = await codec.codificar({ tipo: 'modelo', modelo: m });
  assert.equal(f1, f2);
  const invertido = {} as Record<string, unknown>;
  for (const k of Object.keys(m).reverse()) invertido[k] = (m as unknown as Record<string, unknown>)[k];
  assert.equal(await codec.codificar({ tipo: 'modelo', modelo: invertido as never }), f1);
});

test('el «#» inicial se acepta', async () => {
  const f = await codec.codificar({ tipo: 'receta', receta: RECETA });
  const r = await codec.decodificar('#' + f);
  assert.ok(r.ok && r.enlace.tipo === 'receta');
});

test('el orden de las partes del fragmento no importa', async () => {
  const f = await codec.codificar({ tipo: 'plantilla', plantilla: PLANTILLA, parche: PARCHE_5, receta: { ...RECETA, modelo: HUELLA_EJEMPLO } });
  const partes = f.split('&').reverse().join('&');
  const r = await codec.decodificar(partes);
  // La receta es de otro modelo (el parchado), así que se rechaza por eso y no por el orden:
  assert.ok(!r.ok && r.error === 'esquema' && /receta de otro modelo/.test(r.detalle ?? ''));
  const f2 = await codec.codificar({ tipo: 'plantilla', plantilla: PLANTILLA, parche: [], receta: RECETA });
  const r2 = await codec.decodificar(f2.split('&').reverse().join('&'));
  assert.ok(r2.ok && r2.enlace.tipo === 'plantilla');
});

test('codificar rechaza lo que no se puede escribir, diciendo qué esperaba', async () => {
  await assert.rejects(codec.codificar({ tipo: 'plantilla', plantilla: { id: 'Hub Chico', version: '1.0.0' }, parche: [] }), /plantilla inválida: se esperaba «id@x\.y\.z»/);
  await assert.rejects(codec.codificar({ tipo: 'plantilla', plantilla: { id: 'hub-chico', version: '1.0' }, parche: [] }), /plantilla inválida/);
  await assert.rejects(codec.codificar({ tipo: 'otro' } as unknown as Enlace), /tipo desconocido "otro"/);
  await assert.rejects(codec.codificar({ tipo: 'receta', receta: { ...RECETA, modelo: 'xyz' } }), /receta inválida: modelo: se esperaban 16 caracteres hex/);
  // Un modelo con 25 textos incompresibles de 900 caracteres: pasa los 16.000 caracteres del fragmento.
  const m = ejemploModelo();
  const lcg = new Lcg(3);
  m.procedencia = {};
  for (let i = 0; i < 25; i++) {
    m.procedencia[`/relleno/${i}`] = { etiqueta: 'SUPUESTO', fuente: Array.from({ length: 900 }, () => String.fromCharCode(33 + lcg.hasta(90))).join('') };
  }
  await assert.rejects(codec.codificar({ tipo: 'modelo', modelo: m }), /muy-largo: el fragmento tiene \d+ caracteres y el máximo es 16000/);
});

test('modelo con campos de más o inválidos: el decodificador lo rechaza con «esquema» y el detalle', async () => {
  const m = ejemploModelo() as unknown as Record<string, unknown>;
  m.campoDeMas = 1;
  const r = await codec.decodificar(await codec.codificar({ tipo: 'modelo', modelo: m as never }));
  assert.ok(!r.ok && r.error === 'esquema' && /E-ESQUEMA en \/campoDeMas/.test(r.detalle ?? ''), JSON.stringify(r));
});

test('versión del motor: con la opción, una receta de otra versión mayor se rechaza; sin la opción, nunca', async () => {
  const f = await codec.codificar({ tipo: 'receta', receta: { ...RECETA, motor: '2.3.1' } });
  assert.ok((await codec.decodificar(f)).ok, 'sin la opción versionMotor no hay chequeo');
  const estricto = crearCodec(resolverEjemplo, { versionMotor: '1.4.0' });
  const r = await estricto.decodificar(f);
  assert.ok(!r.ok && r.error === 'version-motor' && /2\.3\.1.*1\.4\.0/.test(r.detalle ?? ''), JSON.stringify(r));
  const f2 = await estricto.codificar({ tipo: 'receta', receta: { ...RECETA, motor: '1.9.9' } });
  assert.ok((await estricto.decodificar(f2)).ok, 'la misma versión mayor (1.x) se acepta');
});

test('crearCodec cumple la firma CrearCodec del contrato', () => {
  const c = crearCodecContrato(resolverEjemplo);
  assert.equal(typeof c.codificar, 'function');
  assert.equal(typeof c.decodificar, 'function');
});

test('fuzz: el decodificador no lanza ante fragmentos al azar ni ante fragmentos válidos con un carácter cambiado', async () => {
  const lcg = new Lcg(20261018);
  const ALF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  for (let i = 0; i < 300; i++) {
    const n = lcg.hasta(120);
    let s = '';
    for (let j = 0; j < n; j++) s += ALF[lcg.hasta(64)];
    for (const pref of ['m=', 'p=', 'r=', 't=hub-chico@1.0.0&p=', 'm=' + 'A'.repeat(lcg.hasta(20)) + '&r=']) {
      const r = await codec.decodificar(pref + s);
      assert.equal(typeof r.ok, 'boolean');
    }
  }
  const validos = [
    await codec.codificar({ tipo: 'modelo', modelo: ejemploModelo(), receta: RECETA }),
    await codec.codificar({ tipo: 'plantilla', plantilla: PLANTILLA, parche: PARCHE_5 }),
  ];
  for (const f of validos) {
    for (let k = 0; k < 150; k++) {
      const pos = lcg.hasta(f.length);
      const c = ALF[lcg.hasta(64)];
      const roto = f.slice(0, pos) + c + f.slice(pos + 1);
      const r = await codec.decodificar(roto);
      assert.equal(typeof r.ok, 'boolean');
      if (r.ok && r.enlace.tipo !== 'receta') {
        // Si por casualidad sigue siendo un enlace válido, lo que devuelve tiene que compilar.
        const modelo = r.enlace.tipo === 'modelo' ? r.enlace.modelo : null;
        if (modelo) assert.ok((await compilar(modelo)).ok);
      }
    }
  }
});

// ---- base64url ----

test('base64url: ida y vuelta para todos los largos de 0 a 300 bytes y rechazo de lo que no es del alfabeto', () => {
  const lcg = new Lcg(11);
  for (let n = 0; n <= 300; n++) {
    const b = new Uint8Array(n);
    for (let i = 0; i < n; i++) b[i] = lcg.hasta(256);
    const s = aBase64url(b);
    assert.match(s, /^[A-Za-z0-9_-]*$/);
    assert.equal(s.length, Math.ceil((n * 4) / 3), `largo de la codificación de ${n} bytes`);
    assert.deepEqual(deBase64url(s), b, `ida y vuelta de ${n} bytes`);
    assert.equal(Buffer.from(s, 'base64url').equals(Buffer.from(b)), true, 'coincide con base64url de Node');
  }
  assert.equal(aBase64url(new Uint8Array([0xfb, 0xff, 0xfe])), '-__-', 'usa - y _ en lugar de + y /');
  for (const mala of ['a+b', 'a/b', 'a=', 'a b', 'ñ', 'a\u0000', 'abcde', 'a', '%41']) assert.equal(deBase64url(mala), null, `«${mala}» tiene que rechazarse`);
});

// ---- receta binaria ----

test('receta: ida y vuelta de todas las combinaciones de campos opcionales', () => {
  const mod = HUELLA_EJEMPLO;
  const casos: Receta[] = [
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 0, replicas: 1 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 4294967295, replicas: 1000 },
    // con la huella agregada de las noches del autor (bit 5, hallazgo H1): viaja y vuelve igual
    { v: 1, modelo: mod, motor: '1.1.0', semilla: 20261017, replicas: 100, noche: 22, h: '0123456789abcdef' } as Receta,
    { v: 1, modelo: '00000000ffffffff', motor: '12.345.6789', semilla: 20261017, replicas: 400, noche: 0 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, t: 0 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, t: 2 ** 53 - 1 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, vel: 1 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, vel: 3600 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, vel: 0.5 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, vel: 1 / 3 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, vel: 1e6 },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, esc: [] },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, esc: ['base'] },
    { v: 1, modelo: mod, motor: '1.0.0', semilla: 1, replicas: 20, esc: ['año', 'ñandú-2', '😀', 'x'.repeat(64)] },
    RECETA,
  ];
  for (const r of casos) {
    const s = codificarReceta(r);
    const d = decodificarReceta(s);
    assert.ok(d.ok, `no decodificó ${JSON.stringify(r)}: ${JSON.stringify(d)}`);
    assert.deepEqual(d.receta, r);
    assert.equal(codificarReceta(d.receta), s, 'la codificación es canónica');
  }
});

test('receta: valida cada campo con un mensaje que dice qué se esperaba', () => {
  const ok: Receta = { v: 1, modelo: HUELLA_EJEMPLO, motor: '1.0.0', semilla: 1, replicas: 20 };
  assert.equal(problemaReceta(ok), null);
  const malas: [Partial<Receta> | Record<string, unknown>, RegExp][] = [
    [{ v: 2 }, /v: se esperaba 1 y llegó 2/],
    [{ modelo: 'ABCDEF0123456789' }, /modelo: se esperaban 16 caracteres hex en minúscula/],
    [{ modelo: 'abc' }, /modelo/],
    [{ motor: '1.0' }, /motor: se esperaba una versión «x\.y\.z»/],
    [{ motor: '1.0.0-beta' }, /motor/],
    [{ semilla: -1 }, /semilla: se esperaba un entero de 32 bits sin signo/],
    [{ semilla: 4294967296 }, /semilla/],
    [{ semilla: 1.5 }, /semilla/],
    [{ replicas: 0 }, /replicas: se esperaba un entero entre 1 y 1000/],
    [{ replicas: 1001 }, /replicas/, ],
    [{ replicas: 100000 }, /replicas/],
    [{ noche: 1000 }, /noche: se esperaba un entero entre 0 y 999/],
    [{ h: 'ABCDEF0123456789' }, /h: se esperaba la huella agregada/],
    [{ h: 'abc' }, /h: /],
    [{ noche: -1 }, /noche/],
    [{ noche: 1.5 }, /noche/],
    [{ t: -1 }, /t: se esperaban ms enteros no negativos/],
    [{ t: 1.5 }, /t: /],
    [{ vel: 0 }, /vel: se esperaba un número mayor que 0/],
    [{ vel: -1 }, /vel/],
    [{ vel: Infinity }, /vel/],
    [{ vel: NaN }, /vel/],
    [{ vel: 1e7 }, /vel/],
    [{ esc: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] }, new RegExp(`hasta ${MAX_ESCENARIOS_RECETA} ids`)],
    [{ esc: [''] }, /cada id es un texto de 1 a 64 caracteres/],
    [{ esc: ['x'.repeat(65)] }, /cada id es un texto/],
    [{ esc: ['con\nsalto'] }, /cada id es un texto/],
    [{ esc: [5 as unknown as string] }, /cada id es un texto/],
    [{ extra: 1 }, /campo desconocido en la receta: extra/],
  ];
  for (const [cambio, patron] of malas) {
    const p = problemaReceta({ ...ok, ...cambio } as Receta);
    assert.ok(p !== null && patron.test(p), `con ${JSON.stringify(cambio)} se esperaba un problema que case con ${patron} y salió ${p}`);
    assert.throws(() => codificarReceta({ ...ok, ...cambio } as Receta), /receta inválida/);
  }
  assert.ok(problemaReceta(null as unknown as Receta) !== null);
});

test('receta: bytes mal formados se rechazan con «formato» o «esquema», nunca con una excepción', () => {
  const buena = codificarReceta(RECETA);
  const bytes = deBase64url(buena)!;
  const mal = (b: Uint8Array) => decodificarReceta(aBase64url(b));
  // Truncada en cada posición.
  for (let n = 0; n < bytes.length; n++) {
    const r = mal(bytes.subarray(0, n));
    assert.ok(!r.ok, `la receta truncada a ${n} bytes se aceptó`);
  }
  // Un byte de más al final.
  const mas = new Uint8Array(bytes.length + 1); mas.set(bytes);
  assert.ok(!mal(mas).ok);
  // Versión de formato desconocida, banderas desconocidas, bandera de float sin vel.
  const v = Uint8Array.from(bytes); v[0] = 9;
  assert.ok(!mal(v).ok);
  const sinBanderas = decodificarReceta(codificarReceta({ v: 1, modelo: HUELLA_EJEMPLO, motor: '1.0.0', semilla: 1, replicas: 20 }));
  assert.ok(sinBanderas.ok);
  const b0 = deBase64url(codificarReceta({ v: 1, modelo: HUELLA_EJEMPLO, motor: '1.0.0', semilla: 1, replicas: 20 }))!;
  const b1 = Uint8Array.from(b0); b1[b1.length - 1] = 0x20; // bandera desconocida (bit 5)
  assert.ok(!mal(b1).ok);
  const b2 = Uint8Array.from(b0); b2[b2.length - 1] = 0x08; // float sin vel
  assert.ok(!mal(b2).ok);
  // Enteros no canónicos (con un cero a la derecha) o demasiado largos.
  const noCanonico = Uint8Array.from([1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0x81, 0x00, 20, 0]);
  const r = mal(noCanonico);
  assert.ok(!r.ok && /no canónico/.test(r.detalle), JSON.stringify(r));
  const largo = Uint8Array.from([1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01, 20, 0]);
  assert.ok(!mal(largo).ok);
  // UTF-8 inválido en un id de escenario.
  const conEsc = codificarReceta({ v: 1, modelo: HUELLA_EJEMPLO, motor: '1.0.0', semilla: 1, replicas: 20, esc: ['a'] });
  const be = Uint8Array.from(deBase64url(conEsc)!); be[be.length - 1] = 0xff;
  assert.ok(!mal(be).ok);
  // Al azar: nunca lanza.
  const lcg = new Lcg(5);
  for (let i = 0; i < 500; i++) {
    const b = new Uint8Array(lcg.hasta(40));
    for (let j = 0; j < b.length; j++) b[j] = lcg.hasta(256);
    if (b.length > 0 && lcg.hasta(2) === 0) b[0] = 1;
    const d = mal(b);
    assert.equal(typeof d.ok, 'boolean');
  }
  assert.ok(!decodificarReceta('+++').ok);
});

test('el enlace del modelo completo reproduce la huella: compilar el modelo decodificado da la misma huella que el original', async () => {
  const original = await compilar(ejemploJson());
  assert.ok(original.ok);
  const r = await codec.decodificar(await codec.codificar({ tipo: 'modelo', modelo: original.mv.modelo, receta: { ...RECETA, modelo: original.mv.huella } }));
  assert.ok(r.ok && r.enlace.tipo === 'modelo');
  const otra = await compilar(r.enlace.modelo);
  assert.ok(otra.ok);
  assert.equal(otra.mv.huella, original.mv.huella);
  assert.equal(r.enlace.receta?.modelo, original.mv.huella);
});

test('el título con <script> viaja intacto por el enlace', async () => {
  const m = ejemploModelo();
  m.titulo = '<script>alert("x")</script>';
  const r = await codec.decodificar(await codec.codificar({ tipo: 'modelo', modelo: m }));
  assert.ok(r.ok && r.enlace.tipo === 'modelo' && r.enlace.modelo.titulo === '<script>alert("x")</script>');
});
