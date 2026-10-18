// escena/pruebas/vista.test.ts · P6. La vista sobre un lienzo (contratos/vistas.ts, CrearVista), probada en Node con un lienzo falso:
// pinta lo compuesto sin coordenadas inválidas, hornea el fondo una sola vez, usa sprites en la isométrica, se redimensiona con el dpr,
// convierte pantalla → mundo (inversa exacta de la proyección) y deja de dibujar al destruirse. Más la elección del piso (ElegirPiso).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoTramo } from '../../contratos/traza.ts';
import type { Piso, Vista } from '../../contratos/vistas.ts';
import { crearReproductor } from '../reproductor.ts';
import { crearVista, crearVistaCon, encuadrarVista } from '../vista.ts';
import { ALTURA_TOQUE_ISO, GANANCIA_GIRO, GIRO_ISO, crearProyector, encuadrar, giroAuto } from '../primitivas.ts';
import { elegirPiso, medidorDeCuadro, MUESTRAS_PISO } from '../piso.ts';
import { estilos } from '../estilo.ts';
import { ContextoFalso, PERSONAS, lazoEnMarcha, lienzoFalso, trazaSintetica } from './ayudas.ts';

function rep() {
  return crearReproductor(trazaSintetica((s) => {
    lazoEnMarcha(s);
    for (let i = 0; i < 6; i++) { s.tramo(i, TipoTramo.BANDEJA, 8 * i, 0, 0, 60_000); s.paquete(i, { creado: 0, listo: 90_000 }); }
    s.tramo(PERSONAS.R1, TipoTramo.PERSONA_TRABAJA, 0, 0, 0, 60_000);
    s.tramo(0, TipoTramo.CAMION_ANDEN, 1, 5, 0, 60_000);
  }));
}
type LienzoFalso = ReturnType<typeof lienzoFalso>;
const comoLienzo = (l: LienzoFalso) => l as unknown as HTMLCanvasElement;

/** Fábrica de lienzos fuera de pantalla falsa: guarda los que creó. */
function fabrica() {
  const creados: LienzoFalso[] = [];
  return {
    creados,
    crear: (ancho: number, alto: number) => {
      const l = lienzoFalso(Math.ceil(ancho), Math.ceil(alto));
      creados.push(l);
      return { lienzo: l as unknown as CanvasImageSource, ctx: l.ctx as unknown as CanvasRenderingContext2D };
    },
  };
}

test('planta 2D sin lienzo fuera de pantalla: pinta todo en el lienzo, con los rótulos y sin coordenadas inválidas', () => {
  const l = lienzoFalso(1280, 800), r = rep();
  const v = crearVistaCon(comoLienzo(l), r, estilos.claro, '2d', { crearLienzo: null, reloj: () => 0 });
  v.dibujar(30_000);
  const c = l.ctx;
  assert.ok((c.llamadas.fill ?? 0) > 10 && (c.llamadas.stroke ?? 0) > 5, `se esperaba que pinte rellenos y trazos (vino ${JSON.stringify(c.llamadas)})`);
  assert.equal(c.noFinitos, 0, 'ninguna coordenada inválida llega al lienzo');
  assert.deepEqual(c.textos, ['R01', 'R02', 'R03', 'A1', 'A2']);
  assert.equal(c.imagenes.length, 0);
});

test('el fondo se hornea una vez y se copia en cada cuadro; se rehace solo si cambia la cámara', () => {
  const l = lienzoFalso(640, 400), r = rep(), f = fabrica();
  const v = crearVistaCon(comoLienzo(l), r, estilos.claro, '2d', { crearLienzo: f.crear, reloj: () => 0 });
  for (let i = 0; i < 3; i++) v.dibujar(30_000 + i * 300);
  assert.equal(f.creados.length, 1, 'un solo lienzo de fondo para tres cuadros');
  assert.equal(l.ctx.imagenes.filter((x) => x === f.creados[0]).length, 3, 'el fondo horneado se copia en cada cuadro');
  assert.equal(l.ctx.textos.length, 0, 'los rótulos están en el fondo horneado, no se repintan');
  assert.deepEqual(f.creados[0].ctx.textos, ['R01', 'R02', 'R03', 'A1', 'A2']);
  v.camara = { ...v.camara, zoom: v.camara.zoom * 1.5 };
  v.dibujar(31_000);
  assert.equal(f.creados.length, 2, 'con otra cámara se hornea otro fondo');
});

test('isométrica: las entidades salen de sprites horneados (uno por clave), o del glifo si no hay dónde hornear', () => {
  const r = rep();
  const l = lienzoFalso(1280, 800), f = fabrica();
  const v = crearVistaCon(comoLienzo(l), r, estilos.claro, 'iso', { crearLienzo: f.crear, reloj: () => 0 });
  v.dibujar(30_000);
  const pos = r.crearPosiciones();
  r.posiciones(30_000, pos);
  const sprites = l.ctx.imagenes.filter((x) => x !== f.creados[0]);
  assert.equal(sprites.length, pos.n, 'un drawImage por entidad');
  assert.ok(new Set(sprites).size <= 3, `paquete, persona y camión: a lo sumo 3 sprites distintos (vinieron ${new Set(sprites).size})`);
  const antes = f.creados.length;
  v.dibujar(30_300);
  assert.equal(f.creados.length, antes, 'el siguiente cuadro no hornea nada nuevo');
  const l2 = lienzoFalso(1280, 800);
  crearVistaCon(comoLienzo(l2), r, estilos.claro, 'iso', { crearLienzo: null }).dibujar(30_000);
  assert.equal(l2.ctx.imagenes.length, 0, 'sin lienzos fuera de pantalla no hay drawImage');
  assert.equal(l2.ctx.noFinitos, 0);
});

test('redimensionar ajusta el lienzo al dpr y vuelve a encuadrar si la cámara era la automática', () => {
  const l = lienzoFalso(10, 10), r = rep();
  const v = crearVistaCon(comoLienzo(l), r, estilos.claro, '2d', { crearLienzo: null });
  v.redimensionar(360, 740, 2);
  assert.deepEqual([l.width, l.height], [720, 1480]);
  assert.deepEqual(v.camara, encuadrar(r.disposicion.limites, { ancho: 360, alto: 740 }, '2d'));
  v.dibujar(30_000);
  assert.deepEqual(l.ctx.transformaciones.at(-1), [2, 0, 0, 2, 0, 0], 'lo móvil se pinta con la escala del dpr');
  const propia = { cx: 1, cy: 2, zoom: 33, giro: 0 };
  v.camara = { ...propia };
  v.redimensionar(1280, 800, 1);
  assert.deepEqual(v.camara, propia, 'una cámara que movió la persona no se pisa al redimensionar');
  encuadrarVista(v, r, 1280, 800);
  assert.deepEqual(v.camara, encuadrar(r.disposicion.limites, { ancho: 1280, alto: 800 }, '2d'));
  assert.throws(() => v.redimensionar(0, 740, 2), /redimensionar espera ancho, alto y dpr > 0 \(vinieron 0, 740 y 2\)/);
});

test('aMundo es la inversa exacta de la proyección (planta y, en la isométrica, a la altura de toque)', () => {
  const r = rep();
  for (const piso of ['2d', 'iso'] as Piso[]) {
    const l = lienzoFalso(800, 600);
    const v: Vista = crearVistaCon(comoLienzo(l), r, estilos.claro, piso, { crearLienzo: null });
    v.redimensionar(800, 600, 1);
    const p = crearProyector(piso, v.camara, { ancho: 800, alto: 600 }), o = [0, 0];
    for (const [x, y] of [[0, 0], [4.8, -1.2], [-7.5, 8.25], [14, -12]]) {
      p.aPantalla(x, y, piso === 'iso' ? ALTURA_TOQUE_ISO : 0, o);
      const [mx, my] = v.aMundo(o[0], o[1]);
      assert.ok(Math.abs(mx - x) < 1e-9 && Math.abs(my - y) < 1e-9, `${piso}: (${x}, ${y}) → pantalla → mundo dio (${mx}, ${my})`);
    }
  }
});

test('encuadrar deja todo el piso adentro del marco; en un teléfono parado el plano apaisado se gira un cuarto de vuelta', () => {
  const lim = rep().disposicion.limites;
  for (const piso of ['2d', 'iso'] as Piso[]) {
    for (const marco of [{ ancho: 1280, alto: 800 }, { ancho: 360, alto: 740 }]) {
      const cam = encuadrar(lim, marco, piso), p = crearProyector(piso, cam, marco), o = [0, 0];
      for (const [x, y] of [[lim.xmin, lim.ymin], [lim.xmax, lim.ymin], [lim.xmin, lim.ymax], [lim.xmax, lim.ymax]]) {
        p.aPantalla(x, y, 0, o);
        assert.ok(o[0] >= 11.9 && o[0] <= marco.ancho - 11.9 && o[1] >= 11.9 && o[1] <= marco.alto - 11.9,
          `${piso} ${marco.ancho}×${marco.alto}: la esquina (${x}, ${y}) cae en (${o[0].toFixed(1)}, ${o[1].toFixed(1)}), fuera del marco con 12 px de margen`);
      }
    }
  }
  const apaisado = { xmin: -20, ymin: -5, xmax: 40, ymax: 15 };
  assert.equal(giroAuto(apaisado, { ancho: 1280, alto: 800 }, '2d'), 0, 'en una pantalla ancha, sin girar');
  assert.equal(giroAuto(apaisado, { ancho: 360, alto: 740 }, '2d'), Math.PI / 2, 'en un teléfono parado, un cuarto de vuelta');
  const z0 = encuadrar(apaisado, { ancho: 360, alto: 740 }, '2d', 12, 0).zoom, z1 = encuadrar(apaisado, { ancho: 360, alto: 740 }, '2d').zoom;
  assert.ok(z1 >= z0 * GANANCIA_GIRO, `girado se ve más grande: ${z1.toFixed(2)} contra ${z0.toFixed(2)} px por m`);
  assert.equal(giroAuto({ xmin: 0, ymin: 0, xmax: 10, ymax: 10 }, { ancho: 360, alto: 740 }, 'iso'), GIRO_ISO, 'un piso cuadrado no se gira');
});

test('destruir: la vista deja de dibujar; un lienzo sin contexto 2D se rechaza con un mensaje claro', () => {
  const l = lienzoFalso(320, 200), r = rep();
  const v = crearVistaCon(comoLienzo(l), r, estilos.claro, '2d', { crearLienzo: null });
  v.dibujar(30_000);
  const antes = JSON.stringify(l.ctx.llamadas);
  v.destruir();
  v.dibujar(31_000);
  assert.equal(JSON.stringify(l.ctx.llamadas), antes, 'después de destruir no se pinta nada');
  const sinCtx = { width: 10, height: 10, getContext: () => null } as unknown as HTMLCanvasElement;
  assert.throws(() => crearVista(sinCtx, r, estilos.claro, '2d'), /el lienzo no da un contexto 2D/);
});

test('el lienzo falso es fiel: un ContextoFalso cuenta los métodos que usa el pintor', () => {
  const c = new ContextoFalso();
  c.beginPath(); c.moveTo(0, 0); c.lineTo(Number.NaN, 1); c.fill();
  assert.deepEqual(c.llamadas, { beginPath: 1, moveTo: 1, lineTo: 1, fill: 1 });
  assert.equal(c.noFinitos, 1);
});

// ---- Elegir el piso (ElegirPiso) ----

test('elegirPiso: iso si la mediana del cuadro 2,5D tarda ≤ 10 ms; si no, la planta', () => {
  assert.equal(elegirPiso(() => 2), 'iso');
  assert.equal(elegirPiso(() => 10), 'iso', 'justo 10 ms todavía es iso');
  assert.equal(elegirPiso(() => 10.5), '2d');
  const serie = (xs: number[]) => { let i = 0; return () => xs[Math.min(i++, xs.length - 1)]; };
  assert.equal(elegirPiso(serie([34, 1, 1, 1, 1, 1, 1])), 'iso', 'el primer cuadro (cambio de modo del navegador) no cuenta');
  assert.equal(elegirPiso(serie([1, 30, 30, 30, 2, 2, 2])), '2d', 'mediana de 30, 30, 30, 2, 2, 2 → 30 ms');
});

test('elegirPiso: una medida que falla, no es número o es negativa elige la planta; la medición dura a lo sumo el primer segundo', () => {
  assert.equal(elegirPiso(() => { throw new Error('sin lienzo'); }), '2d');
  assert.equal(elegirPiso(() => Number.NaN), '2d');
  assert.equal(elegirPiso(() => -1), '2d');
  let llamadas = 0;
  elegirPiso(() => { llamadas++; return 1; });
  assert.equal(llamadas, MUESTRAS_PISO);
  llamadas = 0;
  assert.equal(elegirPiso(() => { llamadas++; return 400; }), '2d');
  assert.equal(llamadas, 3, 'con cuadros de 400 ms se corta al pasar el segundo (400 + 400 + 400)');
});

test('medidorDeCuadro mide lo que tarda dibujar con el reloj que se le pasa', () => {
  const l = lienzoFalso(320, 200), r = rep();
  const v = crearVistaCon(comoLienzo(l), r, estilos.claro, 'iso', { crearLienzo: null });
  let ahora = 100;
  const medir = medidorDeCuadro(v, 30_000, () => (ahora += 3));
  assert.equal(medir(), 3);
  assert.ok((l.ctx.llamadas.fill ?? 0) > 0, 'medir dibuja de verdad');
});
