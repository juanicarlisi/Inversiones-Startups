// integracion/e2e/correr.mjs · Andén simulador, corte 1 · Integración (corte-1.md §10.8 y §12.8). `npm run e2e`.
// Los recorridos de punta a punta sobre dist/ (los servicios REALES: Workers con el núcleo de producción) en el Chromium del entorno,
// en 360 × 740 y 1280 × 800, claro y oscuro:
//   1. primer minuto  (primer-minuto.mjs)   enlace de la plantilla grande → película → tocar un paquete atrasado → causa confirmada →
//                                           cien noches → «¿y si…?» con «balancear el plan» → pantalla dividida con veredicto
//   2. decidir        (decidir.mjs)         formulario hasta «Ya está», tabla por opción y recomendación con semáforo
//   3. compartir      (compartir.mjs)       enlace y QR → otra pestaña: misma huella agregada y sello «reproducida en este dispositivo»
//   4. enlace hostil  (compartir.mjs)       H01 por la URL: aviso y sin cuelgue
// Exige 0 errores y 0 avisos de consola, 0 errores de página, 0 pedidos fallidos, 0 claves de texto faltantes y nada que desborde a lo
// ancho. Guarda 8 capturas representativas en e2e/capturas/ (con --revision=<carpeta>, todas las de todas las combinaciones) y el
// resultado en integracion/salida/e2e.json (lo lee el informe de salida, §10.10).
//
// Uso (desde apps/anden/simulador):
//   NODE_PATH=/opt/node-tools/node_modules node integracion/e2e/correr.mjs [--sin-construir] [--solo=1280-claro] [--recorridos=primer,decidir,compartir,hostil]
//                                                                         [--revision=<carpeta>]
// Tarda ~15 min con las cuatro combinaciones (decidir recalcula el tamizado después de cada respuesta: ~1 min cada vez).
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { construir, DIST } from '../construir.mjs';
import { servir } from '../servir.mjs';
import { CHROMIUM, COMBOS, capturar, etiquetaCombo, playwright, prepararEnlaces } from './comun.mjs';
import { primerMinuto } from './primer-minuto.mjs';
import { decidir } from './decidir.mjs';
import { compartir, enlaceHostil } from './compartir.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CAPTURAS = join(AQUI, 'capturas');
const SALIDA = resolve(AQUI, '..', 'salida', 'e2e.json');
const args = process.argv.slice(2);
const arg = (n) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const solo = arg('solo');
const revision = arg('revision') ? resolve(arg('revision')) : null;
const recorridos = (arg('recorridos') ?? 'primer,decidir,compartir,hostil').split(',');

/**
 * Las capturas que quedan en el repositorio: una por recorrido y momento, repartidas entre las cuatro combinaciones (8, < 3 MB).
 * La clave es «<combinación>/<momento>»; el valor, el nombre del archivo.
 */
const SELECCION = {
  '1280-oscuro/primer-minuto-escena': '01-primer-minuto-pelicula-1280-oscuro.png',
  '1280-claro/primer-minuto-zoom': '02-primer-minuto-zoom-al-paquete-1280-claro.png',
  '360-claro/primer-minuto-biografia': '03-biografia-causa-confirmada-360-claro.png',
  '360-oscuro/primer-minuto-cien-noches': '04-cien-noches-360-oscuro.png',
  '1280-claro/primer-minuto-ysi': '05-ysi-balancear-pantalla-dividida-1280-claro.png',
  '1280-oscuro/decidir-ya-esta': '06-decidir-ya-esta-1280-oscuro.png',
  '360-oscuro/compartir-qr': '07-compartir-qr-360-oscuro.png',
  '360-claro/enlace-hostil': '08-enlace-hostil-inicio-360-claro.png',
};

const fallas = [];
const fallar = (m) => { fallas.push(m); console.error(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

async function principal() {
  const t0 = Date.now();
  if (!args.includes('--sin-construir')) {
    const r = await construir();
    console.log(`construido con ${r.plan}: ${r.archivos.length} archivos en dist/ (motor: ${r.motor ? `${r.motor.pasaron} de ${r.motor.pruebasExigibles}` : 'sin verificar'})`);
  }
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('no hay dist/: correr sin --sin-construir');
  console.log('preparando los enlaces en Node (mismo ensamblado que los Workers)…');
  const prep = await prepararEnlaces({ log: (m) => console.log(`  · ${m}`) });
  mkdirSync(CAPTURAS, { recursive: true });
  if (revision) mkdirSync(revision, { recursive: true });
  const elegidas = new Set();
  const servidor = await servir({ raiz: DIST });
  const { chromium } = playwright();
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const resultado = { fecha: new Date().toISOString().slice(0, 10), chromium: browser.version(), combinaciones: {}, enlaces: {
    primerMinuto: { caracteres: prep.primerMinuto.length, noche: prep.peor + 1, paquete: prep.paquete, atrasadosEnLaNoche: prep.atrasadosEnLaPeor },
    decidir: { caracteres: prep.decidir.length }, hostil: { caracteres: prep.hostil.length },
  } };
  try {
    for (const combo of COMBOS) {
      const etiqueta = etiquetaCombo(combo);
      if (solo && solo !== etiqueta) continue;
      console.log(`\n${etiqueta} (${combo.ancho} × ${combo.alto})`);
      const contexto = await browser.newContext({ viewport: { width: combo.ancho, height: combo.alto }, colorScheme: combo.tema === 'oscuro' ? 'dark' : 'light' });
      const guardar = async (momento, page, opciones = {}) => {
        const clave = `${etiqueta}/${momento}`;
        if (revision) await capturar(page, join(revision, `${momento}-${etiqueta}.png`), opciones);
        if (SELECCION[clave]) {
          const archivo = join(CAPTURAS, SELECCION[clave]);
          if (revision) copyFileSync(join(revision, `${momento}-${etiqueta}.png`), archivo); else await capturar(page, archivo, opciones);
          elegidas.add(SELECCION[clave]);
        }
      };
      const base = servidor.url;
      const comun = { contexto, base, etiqueta, combo, prep, fallar, ok, guardar };
      const r = (resultado.combinaciones[etiqueta] = {});
      const pasos = [['primer', 'primerMinuto', primerMinuto], ['decidir', 'decidir', decidir], ['compartir', 'compartir', compartir], ['hostil', 'enlaceHostil', enlaceHostil]];
      for (const [corto, nombre, f] of pasos) {
        if (!recorridos.includes(corto)) continue;
        const antes = fallas.length, tr = Date.now();
        let salida = { datos: null, errores: [] };
        try { salida = await f(comun); } catch (e) { fallar(`${etiqueta} · ${nombre}: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`); }
        for (const e of salida.errores) fallar(`${etiqueta} · ${nombre}: ${e}`);
        r[nombre] = { pasa: fallas.length === antes, segundos: Math.round((Date.now() - tr) / 1000), erroresConsola: salida.errores.length, datos: salida.datos,
          fallas: fallas.slice(antes) };
      }
      await contexto.close();
    }
  } finally {
    await browser.close();
    await servidor.cerrar();
  }
  // en la carpeta quedan solo las capturas elegidas
  for (const f of readdirSync(CAPTURAS)) if (f.endsWith('.png') && !Object.values(SELECCION).includes(f)) rmSync(join(CAPTURAS, f));
  const peso = readdirSync(CAPTURAS).filter((f) => f.endsWith('.png')).reduce((s, f) => s + statSync(join(CAPTURAS, f)).size, 0);
  resultado.capturas = { archivos: readdirSync(CAPTURAS).filter((f) => f.endsWith('.png')).sort(), bytes: peso };
  resultado.fallas = fallas;
  resultado.minutos = Number(((Date.now() - t0) / 60_000).toFixed(1));
  resultado.completo = !solo && recorridos.length === 4;
  resultado.pasa = fallas.length === 0;
  if (!solo && recorridos.length === 4) writeFileSync(SALIDA, `${JSON.stringify(resultado, null, 2)}\n`);
  console.log(`\n${fallas.length ? `FALLÓ: ${fallas.length} problemas` : 'PASÓ'} · ${resultado.capturas.archivos.length} capturas (${(peso / 1024).toFixed(0)} KB) en e2e/capturas · ${resultado.minutos} min`);
  process.exitCode = fallas.length ? 1 : 0;
}

principal().catch((e) => { console.error(e); process.exitCode = 1; });
