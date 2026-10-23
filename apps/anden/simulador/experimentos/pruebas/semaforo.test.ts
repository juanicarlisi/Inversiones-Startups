// Cada motivo del semáforo de §7, su prioridad y que cada texto tenga todas las variables que usa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clasificarAlerta, claveSemaforo, COLOR_DE_MOTIVO, semaforo, semaforoDe, MINIMO_REPLICAS, claveTextoSemaforo } from '../semaforo.ts';
import { resultadoFalso, validadoEjemplo } from './ayudas.ts';
import type { Diagnostico } from '../../contratos/modelo.ts';
import type { MotivoSemaforo } from '../../contratos/experimentos.ts';

const veinte = (alertas: (i: number) => string[] = () => [], kpi: (i: number) => Record<string, number> = () => ({})) =>
  Array.from({ length: 20 }, (_, i) => resultadoFalso({ replica: i, alertas: alertas(i), kpi: kpi(i) }));
const error = (codigo: string): Diagnostico => ({ codigo, nivel: 'error', ruta: '/x', clave: `modelo.diag.${codigo}` });
const aviso = (codigo: string): Diagnostico => ({ codigo, nivel: 'aviso', ruta: '/x', clave: `modelo.diag.${codigo}` });

test('verde / ok: 20 noches sin nada que advertir', () => {
  const s = semaforo({ resultados: veinte() });
  assert.deepEqual(s, { color: 'verde', motivo: 'ok', vars: { replicas: 20 } });
});

test('rojo / modelo-con-errores: un diagnóstico de nivel error (los avisos no)', () => {
  const s = semaforo({ resultados: veinte(), diagnosticos: [aviso('A-RHO'), error('E-REF'), error('E-RANGO')] });
  assert.deepEqual(s, { color: 'rojo', motivo: 'modelo-con-errores', vars: { errores: 2, codigo: 'E-REF' } });
  assert.equal(semaforo({ resultados: veinte(), diagnosticos: [aviso('A-RHO')] }).color, 'verde', 'un aviso no pone en rojo');
});

test('rojo / conservacion, invariante e inestable (no-termina, tope-eventos y lazo-tiempo-cero)', () => {
  // la primera alerta es la de la réplica 4, que la etiqueta de noche llama «Noche 5»: el texto usa ese número (hallazgo E-09)
  const una = (a: string) => semaforo({ resultados: veinte((i) => (i === 4 || i === 9 ? [a] : [])) });
  assert.deepEqual(una('conservacion'), { color: 'rojo', motivo: 'conservacion', vars: { afectadas: 2, replicas: 20, replica: 5 } });
  assert.deepEqual(una('invariante:rampa-capacidad'), { color: 'rojo', motivo: 'invariante', vars: { afectadas: 2, replicas: 20, replica: 5, nombre: 'rampa-capacidad' } });
  for (const a of ['no-termina', 'tope-eventos', 'lazo-tiempo-cero']) {
    assert.deepEqual(una(a), { color: 'rojo', motivo: 'inestable', vars: { afectadas: 2, replicas: 20, replica: 5, motivo: a } }, `la alerta «${a}» cuenta como inestable`);
  }
  assert.equal(una('algo-que-no-conocemos').motivo, 'invariante', 'una alerta desconocida nunca se ignora');
});

test('prioridad entre rojos: conservación > invariante > inestable, aunque lleguen en réplicas distintas; una réplica con dos alertas de la misma clase cuenta una vez', () => {
  const mezcla = semaforo({ resultados: veinte((i) => (i === 2 ? ['no-termina'] : i === 5 ? ['invariante:x'] : i === 8 ? ['conservacion'] : [])) });
  assert.equal(mezcla.motivo, 'conservacion');
  const sinConservacion = semaforo({ resultados: veinte((i) => (i === 2 ? ['no-termina'] : i === 5 ? ['invariante:x'] : [])) });
  assert.equal(sinConservacion.motivo, 'invariante');
  const doble = semaforo({ resultados: veinte((i) => (i === 3 ? ['no-termina', 'tope-eventos'] : [])) });
  assert.equal(doble.vars.afectadas, 1, 'una noche con dos alertas inestables es una noche afectada');
});

test('el rojo gana a los amarillos: con alertas no importa que haya pocas réplicas o decisión en duda', () => {
  const s = semaforo({ resultados: [resultadoFalso({ replica: 0, alertas: ['conservacion'] })], decisionEnDuda: { valores: [3], faltan: 50 } });
  assert.equal(s.color, 'rojo');
});

test('amarillo / decision-en-duda: algún valor relevante en duda al llegar al máximo, con cuántas noches faltarían', () => {
  const s = semaforo({ resultados: veinte(), replicas: 400, decisionEnDuda: { valores: [3, 4], faltan: 120 } });
  assert.deepEqual(s, { color: 'amarillo', motivo: 'decision-en-duda', vars: { valores: '3, 4', replicas: 400, faltan: 120 } });
  // si no se puede estimar, no se inventa un número: `faltan` no va y el texto es la variante «sin estimación» (hallazgo E-10)
  const sinEstimar = semaforo({ resultados: veinte(), decisionEnDuda: { valores: [3], faltan: null } });
  assert.equal(sinEstimar.vars.faltan, undefined);
  assert.equal(claveTextoSemaforo(sinEstimar), 'experimentos.semaforo.decision-en-duda.sin-estimacion');
  assert.equal(claveTextoSemaforo(s), 'experimentos.semaforo.decision-en-duda');
  assert.equal(semaforo({ resultados: veinte(), decisionEnDuda: { valores: [], faltan: null } }).color, 'verde', 'sin valores en duda no hay aviso');
});

test('amarillo / pocas-replicas: menos de 20 (por defecto) o menos que el mínimo pedido', () => {
  assert.deepEqual(semaforo({ resultados: veinte().slice(0, 19) }), { color: 'amarillo', motivo: 'pocas-replicas', vars: { replicas: 19, minimo: 20 } });
  assert.equal(MINIMO_REPLICAS, 20);
  assert.equal(semaforo({ resultados: veinte().slice(0, 19), minimoReplicas: 10 }).color, 'verde');
  assert.equal(semaforo({ resultados: veinte(), minimoReplicas: 50 }).motivo, 'pocas-replicas');
  assert.equal(semaforo({ replicas: 5 }).motivo, 'pocas-replicas', 'sin resultados, con la cantidad dicha');
  assert.equal(semaforo({}).motivo, 'pocas-replicas', 'sin nada: cero noches');
});

test('amarillo / precision-no-lograda: se pidió precisión y el semiancho relativo no la alcanzó; verde si la alcanzó', () => {
  // esperaP90Min alterna 9 y 11 → media 10, desvío ≈ 1,026, semiancho ≈ 0,48 → ±4,8%
  const rs = veinte(() => [], (i) => ({ esperaP90Min: i % 2 === 0 ? 9 : 11 }));
  const justa = semaforo({ resultados: rs, precision: { kpi: 'esperaP90Min', relativa: 0.05 } });
  assert.deepEqual(justa, { color: 'verde', motivo: 'ok', vars: { replicas: 20 } }, 'con ±4,8% alcanza para ±5%');
  const exigente = semaforo({ resultados: rs, precision: { kpi: 'esperaP90Min', relativa: 0.02 } });
  assert.deepEqual(exigente, { color: 'amarillo', motivo: 'precision-no-lograda', vars: { kpi: 'esperaP90Min', pedida: 2, lograda: 4.8, replicas: 20 } });
  const cero = veinte(() => [], () => ({ esperaP90Min: 0 }));
  assert.equal(semaforo({ resultados: cero, precision: { kpi: 'esperaP90Min', relativa: 0.01 } }).color, 'verde', 'una constante exacta tiene precisión perfecta');
});

test('amarillo / fuera-de-dominio: con las razones, y antes que los demás amarillos', () => {
  const s = semaforo({ resultados: veinte().slice(0, 3), fueraDeDominio: ['F2 con ρ de inducción 0,8', 'rampas llenas'], decisionEnDuda: { valores: [3], faltan: 10 } });
  assert.deepEqual(s, { color: 'amarillo', motivo: 'fuera-de-dominio', vars: { motivo: 'F2 con ρ de inducción 0,8; rampas llenas' } });
  assert.equal(semaforo({ resultados: veinte(), fueraDeDominio: [] }).color, 'verde');
});

test('cada motivo del contrato tiene color y los nueve están cubiertos por estas pruebas', () => {
  const motivos: MotivoSemaforo[] = ['ok', 'precision-no-lograda', 'decision-en-duda', 'pocas-replicas', 'inestable', 'conservacion', 'invariante', 'fuera-de-dominio', 'modelo-con-errores'];
  for (const m of motivos) assert.ok(COLOR_DE_MOTIVO[m], `falta el color de «${m}»`);
  assert.equal(Object.keys(COLOR_DE_MOTIVO).length, motivos.length);
  assert.deepEqual(['rojo', 'rojo', 'rojo', 'rojo', 'amarillo', 'amarillo', 'amarillo', 'amarillo', 'verde'],
    ['modelo-con-errores', 'conservacion', 'invariante', 'inestable', 'fuera-de-dominio', 'decision-en-duda', 'pocas-replicas', 'precision-no-lograda', 'ok'].map((m) => COLOR_DE_MOTIVO[m as MotivoSemaforo]));
});

test('clasificarAlerta separa el nombre de la invariante', () => {
  assert.deepEqual(clasificarAlerta('invariante:rampa-capacidad'), { clase: 'invariante', detalle: 'rampa-capacidad' });
  assert.deepEqual(clasificarAlerta('invariante:'), { clase: 'invariante', detalle: 'sin nombre' });
  assert.deepEqual(clasificarAlerta('conservacion'), { clase: 'conservacion', detalle: 'conservacion' });
});

test('semaforoDe toma del modelo los diagnósticos, la confianza y la precisión pedida (el ejemplo pide ±5% en esperaP90Min)', () => {
  const mv = validadoEjemplo();
  const rs = veinte(() => [], (i) => ({ esperaP90Min: 10 + (i % 2 === 0 ? 3 : -3) }));          // ±3 sobre 10: semiancho ≈ 12%
  const s = semaforoDe(mv, rs);
  assert.equal(s.motivo, 'precision-no-lograda'); assert.equal(s.vars.kpi, 'esperaP90Min'); assert.equal(s.vars.pedida, 5);
  assert.equal(semaforoDe({ ...mv, diagnosticos: [error('E-REF')] }, rs).motivo, 'modelo-con-errores');
  assert.equal(semaforoDe(mv, rs, { precision: undefined }).motivo, 'ok', 'extra pisa lo del modelo');
  assert.equal(semaforoDe(mv, veinte(), { fueraDeDominio: ['F2 con ρ alto'] }).motivo, 'fuera-de-dominio');
});

// ---- textos ----
const leer = (f: string) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')) as Record<string, string>;
const variablesDe = (texto: string) => [...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);

test('textos: cada motivo tiene su clave experimentos.semaforo.<motivo> en español y en inglés, y el texto solo usa variables que el semáforo entrega', () => {
  const es = leer('textos.es.json'), en = leer('textos.en.json');
  const ejemplos: Record<MotivoSemaforo, ReturnType<typeof semaforo>> = {
    'ok': semaforo({ resultados: veinte() }),
    'modelo-con-errores': semaforo({ resultados: veinte(), diagnosticos: [error('E-REF')] }),
    'conservacion': semaforo({ resultados: veinte((i) => (i === 0 ? ['conservacion'] : [])) }),
    'invariante': semaforo({ resultados: veinte((i) => (i === 0 ? ['invariante:x'] : [])) }),
    'inestable': semaforo({ resultados: veinte((i) => (i === 0 ? ['no-termina'] : [])) }),
    'fuera-de-dominio': semaforo({ resultados: veinte(), fueraDeDominio: ['x'] }),
    'decision-en-duda': semaforo({ resultados: veinte(), decisionEnDuda: { valores: [3], faltan: 5 } }),
    'pocas-replicas': semaforo({ resultados: veinte().slice(0, 5) }),
    'precision-no-lograda': semaforo({ resultados: veinte(() => [], (i) => ({ esperaP90Min: i })), precision: { kpi: 'esperaP90Min', relativa: 0.001 } }),
  };
  for (const [motivo, s] of Object.entries(ejemplos)) {
    assert.equal(s.motivo, motivo, `el ejemplo de «${motivo}» produjo «${s.motivo}»`);
    const clave = claveSemaforo(s.motivo);
    assert.equal(clave, `experimentos.semaforo.${motivo}`);
    for (const [idioma, textos] of [['es', es], ['en', en]] as const) {
      assert.ok(typeof textos[clave] === 'string' && textos[clave].length > 10, `falta el texto «${clave}» en ${idioma}`);
      for (const v of variablesDe(textos[clave])) assert.ok(v in s.vars, `el texto «${clave}» (${idioma}) usa {${v}} y el semáforo solo entrega ${Object.keys(s.vars).join(', ')}`);
      for (const v of Object.keys(s.vars)) assert.ok(variablesDe(textos[clave]).includes(v), `el semáforo entrega «${v}» y el texto «${clave}» (${idioma}) no lo usa`);
    }
  }
});

test('textos: la variante «sin estimación» de la duda usa solo las variables que el semáforo entrega (y nunca {faltan}, que ahí no existe)', () => {
  const es = leer('textos.es.json'), en = leer('textos.en.json');
  const s = semaforo({ resultados: veinte(), replicas: 400, decisionEnDuda: { valores: [3, 4], faltan: null } });
  const clave = claveTextoSemaforo(s);
  assert.equal(clave, 'experimentos.semaforo.decision-en-duda.sin-estimacion');
  for (const [idioma, textos] of [['es', es], ['en', en]] as const) {
    assert.ok(typeof textos[clave] === 'string' && textos[clave].length > 10, `falta el texto «${clave}» en ${idioma}`);
    assert.deepEqual(variablesDe(textos[clave]).sort(), Object.keys(s.vars).sort(), `el texto «${clave}» (${idioma}) y las variables del semáforo tienen que coincidir`);
  }
});

test('textos: es y en tienen exactamente las mismas claves, todas con prefijo experimentos., y las mismas variables en cada una', () => {
  const es = leer('textos.es.json'), en = leer('textos.en.json');
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  for (const k of Object.keys(es)) {
    assert.ok(k.startsWith('experimentos.'), `la clave «${k}» no tiene el prefijo experimentos.`);
    assert.deepEqual(variablesDe(es[k]).sort(), variablesDe(en[k]).sort(), `variables distintas entre es y en en «${k}»`);
  }
});
