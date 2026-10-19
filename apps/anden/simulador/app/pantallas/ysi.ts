// app/pantallas/ysi.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 5: «¿y si…?».
// Perillas (puestos activos, personas de rampa, retén, plan por volumen o contiguo, «balancear el plan»). Al moverlas, una vista previa
// de UNA noche (la misma suerte que la que se ve), marcada «provisoria (1 noche)», y enseguida la confirmación con 40 noches pareadas:
// diferencia B − A con su intervalo y el veredicto. En escritorio, pantalla dividida sincronizada (un solo cabezal); en 360 px, A y B se
// alternan con un toque.
import type { Contexto, Montar } from '../contexto.ts';
import type { Comparacion } from '../../contratos/experimentos.ts';
import { META_KPI } from '../../contratos/resultados.ts';
import { horaASeg } from '../../contratos/tipos-base.ts';
import { hayCambios, type Perillas } from '../estado.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { crearLienzo } from '../ui/lienzo.ts';
import { bucleReproduccion, controlesReproduccion, crearLineaTiempo } from '../ui/linea-tiempo.ts';
import { deslizador } from '../ui/deslizador.ts';
import { cabecera, progreso, tarjeta } from '../ui/tarjeta.ts';
import { tabla } from '../ui/tabla.ts';
import { etiquetaNoche } from '../ui/etiqueta-noche.ts';
import { botonVolver } from './comun.ts';

function valorKpi(ctx: Contexto, kpi: string, v: number, conSigno = false): string {
  const moneda = ctx.sesion.mv?.modelo.costos.moneda ?? 'ARS';
  const signo = conSigno && v > 0 ? '+' : '';
  if (kpi === 'costoPorPaquete' || kpi === 'costoNoche') return signo + ctx.f.moneda(v, moneda);
  if (kpi.endsWith('Min')) return signo + ctx.t('app.unidad.min', { n: ctx.f.numero(v, 1) });
  return signo + ctx.f.numero(v, Math.abs(v) < 10 && !Number.isInteger(v) ? 1 : 0);
}

/** Veredicto en palabras. Si las n noches dieron exactamente lo mismo en A y en B, se dice «igual» (no «no se distingue»: no hay ruido). */
export function textoVeredicto(ctx: Contexto, c: Comparacion): { clase: string; texto: string } {
  if (c.media === 0 && c.ic[0] === 0 && c.ic[1] === 0) return { clase: 'igual', texto: ctx.t('app.ysi.igualEnTodas', { n: c.n }) };
  if (c.veredicto === 'no-se-distingue' && !(Number.isFinite(c.replicasSugeridas) && (c.replicasSugeridas ?? 0) > 0)) {
    return { clase: c.veredicto, texto: ctx.t('app.ysi.noSeDistingue') };
  }
  return { clase: c.veredicto, texto: ctx.t(`experimentos.veredicto.${c.veredicto}`, { replicasSugeridas: ctx.f.numero(c.replicasSugeridas ?? 0, 0) }) };
}

export function filaComparacion(ctx: Contexto, c: Comparacion): (string | HTMLElement)[] {
  const v = textoVeredicto(ctx, c);
  return [ctx.t(`app.kpi.${c.kpi}`), valorKpi(ctx, c.kpi, c.media, true),
    ctx.t('app.ysi.ic', { bajo: valorKpi(ctx, c.kpi, c.ic[0], true), alto: valorKpi(ctx, c.kpi, c.ic[1], true) }),
    el('span', { class: `veredicto veredicto--${v.clase}` }, v.texto)];
}

export const montarYsi: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  const mv = s.mv;
  if (!mv) { ctx.ir('inicio'); return () => {}; }
  const m = mv.modelo, p0 = ctx.almacen.estado.perillas;
  const despachar = (nombre: 'puestos' | 'personasRampa' | 'reten', original: number) => (v: number) =>
    ctx.almacen.despachar({ tipo: 'perilla', nombre, valor: v === original ? null : v });
  const puestosOrig = m.personas.induccion.puestosActivos, rampaOrig = m.personas.rampa.cantidad, retenOrig = m.personas.induccion.reten;
  const perPuestos = deslizador({ etiqueta: ctx.t('app.ysi.puestos'), min: 1, max: Math.max(1, m.hub.induccion.puestos.length), valor: p0.puestos ?? puestosOrig,
    accion: 'perilla-puestos', alCambiar: despachar('puestos', puestosOrig), menos: ctx.t('app.ysi.menos'), mas: ctx.t('app.ysi.mas') });
  const perRampa = deslizador({ etiqueta: ctx.t('app.ysi.personasRampa'), min: 1, max: Math.max(1, m.hub.rampas.length), valor: p0.personasRampa ?? rampaOrig,
    accion: 'perilla-rampa', alCambiar: despachar('personasRampa', rampaOrig), menos: ctx.t('app.ysi.menos'), mas: ctx.t('app.ysi.mas') });
  const perReten = deslizador({ etiqueta: ctx.t('app.ysi.reten'), min: 0, max: 4, valor: p0.reten ?? retenOrig,
    accion: 'perilla-reten', alCambiar: despachar('reten', retenOrig), menos: ctx.t('app.ysi.menos'), mas: ctx.t('app.ysi.mas') });
  const planOrig = typeof m.personas.rampa.asignacion === 'string' ? m.personas.rampa.asignacion : null;
  const planes = (['por-volumen', 'contiguas'] as const).map((pl) => el('button', { type: 'button', role: 'radio', class: 'selector__opcion',
    'data-accion': `plan-${pl}`, onclick: () => ctx.almacen.despachar({ tipo: 'perilla', nombre: 'plan', valor: pl === planOrig ? null : pl }) },
  ctx.t(`app.ysi.plan.${pl}`)));
  const balancear = el('button', { type: 'button', class: 'boton', 'data-accion': 'balancear',
    onclick: () => ctx.almacen.despachar({ tipo: 'balancear', activo: !ctx.almacen.estado.perillas.balanceado }) }, ctx.t('app.ysi.balancear'));
  const reiniciar = el('button', { type: 'button', class: 'boton boton--suave', 'data-accion': 'reiniciar-perillas',
    onclick: () => { ctx.almacen.despachar({ tipo: 'reiniciarPerillas' }); perPuestos.poner(puestosOrig); perRampa.poner(rampaOrig); perReten.poner(retenOrig); } },
  ctx.t('app.ysi.reiniciar'));
  const perillas = tarjeta(ctx.t('app.ysi.perillas'), 'ysi__perillas', perPuestos.nodo, perRampa.nodo, perReten.nodo,
    el('div', { class: 'perilla' }, el('span', { class: 'perilla__etiqueta' }, ctx.t('app.ysi.plan')),
      el('div', { class: 'selector', role: 'radiogroup', 'aria-label': ctx.t('app.ysi.plan') }, ...planes)),
    el('div', { class: 'ysi__botones' }, balancear, reiniciar));

  // pantalla dividida: A y B con el mismo cabezal
  const etqA = etiquetaNoche(ctx, 'A'), etqB = etiquetaNoche(ctx, 'B');
  const lienzoA = crearLienzo(ctx, { reproductor: () => s.noche?.reproductor ?? null, tocable: true, etiqueta: ctx.t('app.ysi.lienzoA'), clase: 'escena__caja--mitad', tablero: 'compacto' });
  const lienzoB = crearLienzo(ctx, { reproductor: () => s.ysi.nocheB?.reproductor ?? null, tocable: false, etiqueta: ctx.t('app.ysi.lienzoB'), clase: 'escena__caja--mitad', tablero: 'compacto' });
  L.sumar(lienzoA.destruir); L.sumar(lienzoB.destruir);
  const vacioB = el('p', { class: 'dividida__vacio' });
  const ladoA = el('div', { class: 'dividida__lado', 'data-lado': 'A' }, el('h2', { class: 'dividida__titulo' }, ctx.t('app.ysi.ladoA')), etqA.nodo, lienzoA.nodo);
  const ladoB = el('div', { class: 'dividida__lado', 'data-lado': 'B' }, el('h2', { class: 'dividida__titulo' }, ctx.t('app.ysi.ladoB')), etqB.nodo, lienzoB.nodo,
    vacioB);
  const alternar = el('button', { type: 'button', class: 'boton boton--primario dividida__alternar', 'data-accion': 'alternar-ab',
    onclick: () => ctx.almacen.despachar({ tipo: 'lado' }) });
  const dividida = el('div', { class: 'dividida' }, ladoA, ladoB);
  const linea = crearLineaTiempo(ctx, { momentos: () => s.noche?.momentos ?? [], corte: () => s.noche?.traza.corte ?? null, minImportancia: () => 3 });
  L.sumar(linea.destruir);
  const controles = controlesReproduccion(ctx);
  const estado = el('div', { class: 'ysi__estado', 'aria-live': 'polite' });
  const quedarse = el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'quedarse-con-b',
    onclick: () => { s.quedarseConB(); ctx.almacen.despachar({ tipo: 'reiniciarPerillas' }); ctx.ir('escena'); } }, ctx.t('app.ysi.quedarse'));
  raiz.append(cabecera(ctx.t('app.ysi.titulo'), botonVolver(ctx)), perillas,
    el('section', { class: 'tarjeta ysi__escena' }, alternar, dividida, linea.nodo, controles.nodo), estado);

  const pintar = () => {
    const e = ctx.almacen.estado, p = e.perillas, y = s.ysi;
    // «balancear el plan» es repartir por volumen (corte-1.md §6.7.7): se marca esa opción
    const planVisto = p.balanceado ? 'por-volumen' : (p.plan ?? planOrig);
    planes.forEach((b, i) => b.setAttribute('aria-checked', String(planVisto === (['por-volumen', 'contiguas'] as const)[i])));
    balancear.setAttribute('aria-pressed', String(p.balanceado));
    reiniciar.disabled = !hayCambios(p);
    const ancho = ctx.esAncho();
    dividida.dataset.modo = ancho ? 'lado-a-lado' : 'alternada';
    dividida.dataset.visible = e.lado;
    alternar.hidden = ancho || !y.nocheB;
    alternar.textContent = ctx.t(e.lado === 'A' ? 'app.ysi.verB' : 'app.ysi.verA');
    ladoB.classList.toggle('dividida__lado--vacio', !y.nocheB);
    vacioB.textContent = ctx.t(y.fase === 'igual' ? 'app.ysi.bIgualA' : y.fase === 'previa' ? 'app.ysi.calculandoPrevia' : 'app.ysi.moveUnaPerilla');
    etqA.actualizar(); etqB.actualizar();
    // estado de la comparación
    const partes: HTMLElement[] = [];
    if (y.fase === 'nada') partes.push(el('p', { class: 'nota' }, ctx.t('app.ysi.instrucciones')));
    if (y.fase === 'previa') partes.push(el('p', { class: 'nota', role: 'status' }, ctx.t('app.ysi.calculandoPrevia')));
    if (y.fase === 'igual') {
      partes.push(el('p', { class: 'ysi__igual', 'data-ysi': 'igual', role: 'status' },
        ctx.t(p.balanceado && planOrig === 'por-volumen' ? 'app.ysi.yaBalanceado' : 'app.ysi.sinCambioReal')));
    }
    if (y.nocheB && s.noche && (y.fase === 'lista' || y.fase === 'confirmando' || y.fase === 'confirmada')) {
      const a = s.noche.salida.resultado.kpi, b = y.nocheB.salida.resultado.kpi;
      const ini = horaASeg(m.calendario.inicio) * 1000, h = (min: number) => ctx.f.hora(ini + min * 60000);
      partes.push(el('div', { class: 'ysi__previa', 'data-ysi': 'previa' },
        el('p', { class: y.fase === 'confirmada' ? 'ysi__nocheVista' : 'etiqueta-provisoria' }, ctx.t(y.fase === 'confirmada' ? 'app.ysi.nocheQueSeVe' : 'app.ysi.provisoria')),
        el('p', null, ctx.t('app.ysi.previaDetalle', { finA: h(a.finClasificacionMin), finB: h(b.finClasificacionMin),
          pendA: ctx.f.numero(a.pendientesAlCorte, 0), pendB: ctx.f.numero(b.pendientesAlCorte, 0) }))));
    }
    if (y.fase === 'confirmando') partes.push(progreso(y.progreso, ctx.t('app.ysi.confirmando', { n: Math.round(y.progreso * 40) })));
    if (y.fase === 'confirmada') {
      const conSentido = y.comparaciones.filter((c) => META_KPI[c.kpi].mejor !== 'neutro');
      partes.push(el('div', { class: 'ysi__confirmada', 'data-ysi': 'confirmada' },
        el('p', { class: 'ysi__titular' }, ctx.t('app.ysi.confirmada', { n: conSentido[0]?.n ?? 0 })),
        tabla([ctx.t('app.ysi.col.kpi'), ctx.t('app.ysi.col.diferencia'), ctx.t('app.ysi.col.ic'), ctx.t('app.ysi.col.veredicto')],
          conSentido.map((c) => filaComparacion(ctx, c)), { titulo: ctx.t('app.ysi.tablaTitulo'), numericas: [1, 2], accion: 'comparacion', apilable: true }),
        quedarse));
    }
    poner(estado, ...partes);
    raiz.dataset.listo = y.fase === 'confirmada' || y.fase === 'nada' || y.fase === 'igual' ? '1' : '0';
    lienzoA.redibujar(); lienzoB.redibujar();
  };
  pintar();
  let previas: Perillas = ctx.almacen.estado.perillas;
  L.sumar(ctx.almacen.suscribir((n, a) => {
    if (n.t !== a.t || n.inicio !== a.inicio || n.fin !== a.fin) linea.actualizar();
    if (n.t !== a.t || n.reproduciendo !== a.reproduciendo || n.velocidad !== a.velocidad) controles.actualizar();
    if (n.perillas !== previas) { previas = n.perillas; void s.previsualizar(n.perillas); }
    if (n.lado !== a.lado || n.perillas !== a.perillas) pintar();
  }));
  L.sumar(s.suscribir((tema) => { if (tema === 'ysi' || tema === 'noche') pintar(); }));
  const mq = matchMedia('(min-width: 900px)');
  const alCambiarAncho = () => pintar();
  mq.addEventListener('change', alCambiarAncho);
  L.sumar(() => mq.removeEventListener('change', alCambiarAncho));
  L.sumar(bucleReproduccion(ctx));
  // si se vuelve a esta pantalla con perillas movidas y sin B, se recalcula
  if (hayCambios(p0) && !s.ysi.nocheB && s.ysi.fase === 'nada') void s.previsualizar(p0);
  return () => L.correr();
};
