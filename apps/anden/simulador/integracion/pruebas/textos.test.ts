// integracion/pruebas/textos.test.ts · Andén simulador, corte 1 · Integración (corte-1.md §1.6, §10.5 y §12.10).
// Ningún texto de interfaz va fijo en el código: todo sale de claves i18n con el prefijo de su paquete, en español y en inglés con las
// mismas claves. Acá se controla con todo junto (lo que cada paquete no puede ver solo):
//  1. cada paquete: es y en con exactamente las mismas claves, todas con su prefijo, sin textos vacíos y con las mismas variables {x};
//  2. el diccionario que arma la interfaz (app/i18n/diccionarios.ts) junta los cinco sin choques;
//  3. toda clave escrita como texto en el código de la app y de los paquetes existe (o, si se arma con una plantilla, existe alguna con
//     ese comienzo);
//  4. toda clave EMITIDA corriendo de verdad (compilar las plantillas, una noche de cada una con el núcleo de producción, momentos,
//     biografías de cada clase de entidad, causas confirmadas, semáforo, formulario y plan de medición) existe en es y en, y sus
//     variables cubren todas las {x} del texto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { ClaseEntidad, type Traza } from '../../contratos/traza.ts';
import type { Frase } from '../../contratos/explicacion.ts';
import type { EvaluacionDecision } from '../../contratos/experimentos.ts';
import type { ResultadoTamizado } from '../../contratos/decision.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import { diccionariosDeTodos } from '../../app/i18n/diccionarios.ts';
import { variablesDe } from '../../app/i18n/traducir.ts';
import { detectarMomentos, CLAVE_CLASE, CLAVE_PERSONA, CLAVE_PUESTO, CLAVE_ESTADO, claveRiesgo, textoEstado } from '../../escena/indice.ts';
import {
  armarBiografia, armarFormulario, causasConfirmadas, cierreDelFormulario, fraseDeMedicion, planDeMedicion, supuestosDe, todasLasClaves,
} from '../../explicacion/indice.ts';
import { claveSemaforo, semaforo, semaforoDe } from '../../experimentos/indice.ts';
import { ensamblar } from '../ensamblar.ts';

const RAIZ = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const PAQUETES: Record<string, string> = {
  app: 'app/i18n', escena: 'escena', explicacion: 'explicacion', modelo: 'modelo', experimentos: 'experimentos',
};
const leer = (p: string) => JSON.parse(readFileSync(join(RAIZ, p), 'utf8')) as Record<string, string>;
const dic = diccionariosDeTodos();

test('textos · cada paquete: es y en con las mismas claves, su prefijo, sin vacíos y con las mismas variables', () => {
  const malos: string[] = [];
  for (const [prefijo, carpeta] of Object.entries(PAQUETES)) {
    const es = leer(`${carpeta}/textos.es.json`), en = leer(`${carpeta}/textos.en.json`);
    const ke = Object.keys(es).sort(), ki = Object.keys(en).sort();
    for (const k of ke) if (!(k in en)) malos.push(`${carpeta}: «${k}» está en español y no en inglés`);
    for (const k of ki) if (!(k in es)) malos.push(`${carpeta}: «${k}» está en inglés y no en español`);
    for (const k of ke) {
      if (!k.startsWith(`${prefijo}.`)) malos.push(`${carpeta}: «${k}» no lleva el prefijo «${prefijo}.»`);
      if (typeof es[k] !== 'string' || es[k].trim() === '') malos.push(`${carpeta}: «${k}» está vacío en español`);
      if (k in en && (typeof en[k] !== 'string' || en[k].trim() === '')) malos.push(`${carpeta}: «${k}» está vacío en inglés`);
      if (k in en) {
        const ve = variablesDe(es[k]).sort().join(','), vi = variablesDe(en[k]).sort().join(',');
        if (ve !== vi) malos.push(`${carpeta}: «${k}» usa {${ve}} en español y {${vi}} en inglés`);
      }
    }
  }
  assert.deepEqual(malos, [], `textos con problemas:\n${malos.join('\n')}`);
});

test('textos · el diccionario de la interfaz junta los cinco paquetes sin choques y con las mismas claves en es y en', () => {
  const total = Object.values(PAQUETES).reduce((s, c) => s + Object.keys(leer(`${c}/textos.es.json`)).length, 0);
  assert.equal(Object.keys(dic.es).length, total, 'el diccionario español tiene que tener todas las claves de los cinco paquetes');
  assert.deepEqual(Object.keys(dic.en).sort(), Object.keys(dic.es).sort(), 'es y en tienen que tener las mismas claves');
});

// ------------------------------------------------------------------------------------------------ claves escritas en el código

const RE_CLAVE = /^(app|escena|explicacion|modelo|experimentos)\.[A-Za-z0-9_.-]*[A-Za-z0-9_]$/;
const RE_COMIENZO = /^(app|escena|explicacion|modelo|experimentos)\.[A-Za-z0-9_.-]*$/;

function fuentes(dir: string): string[] {
  const out: string[] = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (n !== 'pruebas' && n !== 'falsos' && n !== 'vendor') out.push(...fuentes(p)); }
    else if (n.endsWith('.ts') && !/^(servicios-falsos|entrada-falsa)\.ts$/.test(n)) out.push(p);
  }
  return out;
}

test('textos · toda clave escrita en el código existe en es y en (y las que se arman con una plantilla tienen alguna con ese comienzo)', () => {
  const malos: string[] = [];
  let vistas = 0;
  for (const carpeta of ['app', 'escena', 'explicacion', 'modelo', 'experimentos', 'integracion']) {
    for (const p of fuentes(join(RAIZ, carpeta))) {
      const f = ts.createSourceFile(p, readFileSync(p, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      const donde = (n: ts.Node) => `${relative(RAIZ, p).split(sep).join('/')}:${f.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
      const visitar = (n: ts.Node): void => {
        if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && RE_CLAVE.test(n.text) && !ts.isImportDeclaration(n.parent)) {
          vistas++;
          if (!(n.text in dic.es) || !(n.text in dic.en)) {
            // un texto con forma de clave que es el comienzo de varias (p. ej. 'explicacion.causa') también vale
            if (!Object.keys(dic.es).some((k) => k.startsWith(`${n.text}.`))) malos.push(`${donde(n)} «${n.text}» no existe`);
          }
        } else if (ts.isTemplateExpression(n) && RE_COMIENZO.test(n.head.text) && n.head.text.includes('.')) {
          vistas++;
          if (!Object.keys(dic.es).some((k) => k.startsWith(n.head.text))) malos.push(`${donde(n)} ninguna clave empieza con «${n.head.text}»`);
        }
        ts.forEachChild(n, visitar);
      };
      visitar(f);
    }
  }
  assert.ok(vistas > 200, `se esperaban más de 200 claves escritas en el código y se vieron ${vistas}`);
  assert.deepEqual(malos, [], `claves del código que no están en los textos:\n${malos.join('\n')}`);
});

// ------------------------------------------------------------------------------------------------ claves emitidas de verdad

interface Emitida { clave: string; vars: Record<string, string | number>; de: string }

function controlar(emitidas: Emitida[]): string[] {
  const malos: string[] = [];
  for (const { clave, vars, de } of emitidas) {
    for (const idioma of ['es', 'en'] as const) {
      const texto = dic[idioma][clave];
      if (texto === undefined) { malos.push(`${de}: «${clave}» no existe en ${idioma}`); continue; }
      for (const v of variablesDe(texto)) if (!(v in vars)) malos.push(`${de}: «${clave}» (${idioma}) usa {${v}} y la frase no la trae`);
    }
  }
  return malos;
}
const deFrase = (f: Frase, de: string): Emitida => ({ clave: f.clave, vars: f.vars, de });

test('textos · todo lo que emiten los paquetes al correr (con el núcleo de producción) existe en es y en con sus variables', async () => {
  const E = ensamblar();
  const emitidas: Emitida[] = [];
  const noches: { mv: ModeloValidado; t: Traza; clave: string }[] = [];
  for (const clave of Object.keys(E.plantillas)) {
    const c = await E.compilar(E.plantillas[clave]);
    assert.ok(c.ok, `la plantilla ${clave} tiene que compilar`);
    if (!c.ok) return;
    for (const d of c.mv.diagnosticos) emitidas.push({ clave: d.clave, vars: d.vars ?? {}, de: `${clave}: diagnóstico ${d.codigo}` });
    const s = E.simularNoche(c.mv, c.mv.modelo.experimento.semilla, 0, { traza: 'completa' });
    noches.push({ mv: c.mv, t: s.traza!, clave });
    for (const m of detectarMomentos(s.traza!)) emitidas.push({ clave: m.clave, vars: m.vars, de: `${clave}: momento ${m.tipo}` });
    // semáforo de una noche (pocas réplicas) y de cada motivo
    const sem = semaforoDe(c.mv, [s.resultado]);
    emitidas.push({ clave: claveSemaforo(sem.motivo), vars: sem.vars, de: `${clave}: semáforo` });
  }
  // un modelo con errores y cada motivo del semáforo, con las variables que entrega experimentos/
  for (const e of [
    semaforo({ diagnosticos: [{ codigo: 'E-REF', nivel: 'error', ruta: '/x', clave: 'modelo.diag.E-REF' }] }),
    semaforo({ replicas: 5 }), semaforo({ replicas: 100, decisionEnDuda: { valores: [3], faltan: 1000 } }),
    semaforo({ replicas: 100, fueraDeDominio: ['F2 con ρ de inducción > 0,5'] }), semaforo({ replicas: 100 }),
  ]) emitidas.push({ clave: claveSemaforo(e.motivo), vars: e.vars, de: `semáforo ${e.motivo}` });

  // biografías de todas las clases de entidad y causas de paquetes que pierden el corte, en las dos plantillas
  for (const { mv, t, clave } of noches) {
    const P = t.paquetes;
    const ids: [ClaseEntidad, number][] = [];
    for (let e = 0; e < P.n; e += Math.max(1, Math.floor(P.n / 40))) ids.push([ClaseEntidad.PAQUETE, e]);
    for (let i = 0; i < t.catalogo.personas.length; i++) ids.push([ClaseEntidad.PERSONA, i]);
    for (let i = 0; i < t.catalogo.camiones.length; i++) ids.push([ClaseEntidad.CAMION, i]);
    for (let i = 0; i < t.catalogo.rampas.length; i += 3) ids.push([ClaseEntidad.RAMPA, i]);
    for (let i = 0; i < t.catalogo.puestos.length; i++) ids.push([ClaseEntidad.PUESTO, i]);
    ids.push([ClaseEntidad.EQUIPO, 0]);
    for (const [cl, id] of ids) {
      const b = armarBiografia(t, mv.modelo, cl, id);
      emitidas.push(deFrase(b.titulo, `${clave}: biografía ${cl}/${id}`));
      for (const paso of b.pasos) emitidas.push(deFrase(paso.frase, `${clave}: paso de la biografía ${cl}/${id}`));
    }
    if (clave === 'hub-chico@1.0.0') {
      let probados = 0;
      for (let e = P.n - 1; e >= 0 && probados < 6; e -= 97) {
        if (P.listo[e] >= 0 && P.listo[e] <= t.corte) continue;
        probados++;
        const r = await causasConfirmadas(t, mv, t.semilla, t.replica, P.camion[e], P.indice[e],
          (cambio) => E.contrafactual(E.simularNoche, mv, t.semilla, t.replica, P.camion[e], P.indice[e], cambio, E.variante));
        for (const f of r.causas) emitidas.push(deFrase(f, `${clave}: causa del paquete ${e}`));
        for (const c of r.contrafactuales) emitidas.push({ clave: c.cambio.clave, vars: c.cambio.vars, de: `${clave}: cambio del contrafactual` });
      }
    }
  }

  // formulario por decisión (con un ranking armado a mano: el tamizado real tarda minutos) y plan de medición
  const mv = noches[0].mv;
  const ev = (rec: number | null): EvaluacionDecision => ({ decision: 'dotacion-induccion', configuraciones: [], recomendacion: rec,
    semaforo: { color: 'verde', motivo: 'ok', vars: { replicas: 20 } }, replicasUsadas: 80 });
  const ranking: ResultadoTamizado[] = supuestosDe(mv).map((s, i) => ({
    parametro: s.parametro, decisiones: [2, 3, 4], cambiaDecision: true, perdidaEsperada: 1e6 - i, corrimientoObjetivo: 1, replicas: 20,
    evaluaciones: [ev(2), ev(3), ev(4)],
  }));
  const preguntas = armarFormulario(mv, ranking);
  assert.ok(preguntas.length > 0, 'con una pérdida esperada grande el formulario tiene que preguntar algo');
  for (const p of preguntas) {
    emitidas.push(deFrase(p.porQue, `formulario: ${p.parametro}`));
    emitidas.push(deFrase(fraseDeMedicion(p.medir), `plan de medición: ${p.parametro}`));
  }
  emitidas.push(deFrase(fraseDeMedicion(planDeMedicion('x', 0.6, 0.15, 30)), 'plan de medición'));
  for (const r of [[], ranking, ranking.map((x) => ({ ...x, decisiones: [null, null, null] as [null, null, null] }))]) {
    const c = cierreDelFormulario(r);
    emitidas.push({ clave: c.clave, vars: {}, de: `cierre del formulario (${c.motivo})` });
  }

  // registros de claves que los paquetes exportan
  for (const k of todasLasClaves()) if (!(k in dic.es) || !(k in dic.en)) emitidas.push({ clave: k, vars: {}, de: 'registro de explicacion/' });
  for (const k of [...Object.values(CLAVE_ESTADO), ...CLAVE_PERSONA, ...CLAVE_PUESTO, ...CLAVE_CLASE, claveRiesgo(0), claveRiesgo(0.5), claveRiesgo(1)]) {
    emitidas.push({ clave: k, vars: { puesto: 'I1', minutos: 5 }, de: 'claves de escena/' });
  }
  for (let e = 0; e <= 6; e++) { const x = textoEstado(e); emitidas.push({ clave: x.clave, vars: x.vars, de: `estado visual ${e}` }); }

  const malos = controlar(emitidas);
  const distintas = new Set(emitidas.map((x) => x.clave)).size;
  console.log(`textos · ${emitidas.length} emisiones, ${distintas} claves distintas, ${malos.length} problemas`);
  assert.ok(distintas >= 80, `se esperaban al menos 80 claves distintas emitidas (MEDIDO el 19-10-2026: 88) y hubo ${distintas}`);
  assert.deepEqual(malos.slice(0, 30), [], `claves emitidas con problemas (${malos.length}):\n${malos.slice(0, 30).join('\n')}`);
});
