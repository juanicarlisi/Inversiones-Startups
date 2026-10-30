// app/pantallas/biografia.ts · Andén simulador, corte 1 · P8 (interfaz). Pantalla 3: la biografía de lo que se tocó.
// Pasos con hora y duración (cada frase pasa por el verificador antes de mostrarse), causas CONFIRMADAS por contrafactual («Confirmado:
// sin pausas, llegaba a las 00:12») y un «¿y si…?» que corre el contrafactual de un cambio sobre ESTE paquete con la misma suerte.
// Lo que no se pudo confirmar no se afirma (diseño maestro A9).
import type { Contexto, Montar } from '../contexto.ts';
import { Causa, ClaseEntidad, claseDeRef, idDeRef } from '../../contratos/traza.ts';
import type { Biografia, Contrafactual, Frase } from '../../contratos/explicacion.ts';
import type { ModeloValidado } from '../../contratos/modelo.ts';
import type { Traza } from '../../contratos/traza.ts';
import { esRef } from '../../contratos/referencias.ts';
import { el, limpiezas, poner } from '../ui/dom.ts';
import { cabecera, tarjeta } from '../ui/tarjeta.ts';
import { botonVolver, textoFrase } from './comun.ts';
import { textoEtiquetaNoche } from '../ui/etiqueta-noche.ts';
import { duracionEntreHoras } from '../i18n/formato.ts';
import type { CualNocheMostrada, NocheVista } from '../sesion.ts';

const NOMBRE_CAUSA: Record<number, string> = Object.fromEntries(Object.entries(Causa).map(([k, v]) => [v, k.toLowerCase()]));

/** Cambios fijos por causa (corte-1.md §9 P7) que tienen sentido para las esperas de esta biografía, sin repetir. */
export function cambiosDe(bio: Biografia, mv: ModeloValidado, tr: Traza): Contrafactual['cambio'][] {
  const m = mv.modelo, out: Contrafactual['cambio'][] = [], vistos = new Set<string>();
  const sumar = (c: Contrafactual['cambio']) => { const k = `${c.clave}|${JSON.stringify(c.vars)}`; if (!vistos.has(k)) { vistos.add(k); out.push(c); } };
  for (const p of bio.pasos) {
    const w = p.espera; if (!w) continue;
    switch (w.causa) {
      case Causa.FILA: case Causa.BLOQUEO: {
        const n = m.personas.induccion.puestosActivos + 1;
        if (n <= m.hub.induccion.puestos.length) sumar({ clave: 'explicacion.cambio.fila', vars: { puestos: n }, parche: [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: n }] });
        break;
      }
      case Causa.RAMPA_LLENA: {
        const id = w.causante >= 0 && claseDeRef(w.causante) === ClaseEntidad.RAMPA ? tr.catalogo.rampas[idDeRef(w.causante)] : undefined;
        const i = id ? m.hub.rampas.findIndex((r) => r.id === id) : -1;
        if (i >= 0) {
          const capacidad = m.hub.rampas[i].capacidad * 2;
          sumar({ clave: 'explicacion.cambio.rampa_llena', vars: { rampa: id!, capacidad }, parche: [{ op: 'replace', path: `/hub/rampas/${i}/capacidad`, value: capacidad }] });
        }
        break;
      }
      case Causa.PAUSA: case Causa.PERSONA_OCUPADA:
        if (m.personas.rampa.pausas.duracion > 0) sumar({ clave: 'explicacion.cambio.pausa', vars: {}, parche: [{ op: 'replace', path: '/personas/rampa/pausas/duracion', value: 0 }] });
        break;
      case Causa.AUSENCIA:
        sumar({ clave: 'explicacion.cambio.ausencia', vars: { reten: m.personas.induccion.reten + 1 }, parche: [{ op: 'replace', path: '/personas/induccion/reten', value: m.personas.induccion.reten + 1 }] });
        break;
      case Causa.FALLA:
        if (m.hub.sorter.paradas.activas) sumar({ clave: 'explicacion.cambio.falla', vars: {}, parche: [{ op: 'replace', path: '/hub/sorter/paradas/activas', value: false }] });
        break;
      case Causa.CIERRE_JAULA:
        sumar({ clave: 'explicacion.cambio.cierre_jaula', vars: {}, parche: [{ op: 'replace', path: '/hub/jaulas/cierre', value: 0 }] });
        break;
      case Causa.NO_LEIDO: {
        const ref = m.hub.sorter.lector.noLeido;
        if (esRef(ref)) {
          const v = m.parametros[ref.slice(1)]?.valor;
          const value = typeof v === 'object' && v.tipo === 'bernoulli' ? { tipo: 'bernoulli', p: 0 } : 0;
          sumar({ clave: 'explicacion.cambio.no_leido', vars: {}, parche: [{ op: 'replace', path: `/parametros/${ref.slice(1)}/valor`, value }] });
        } else sumar({ clave: 'explicacion.cambio.no_leido', vars: {}, parche: [{ op: 'replace', path: '/hub/sorter/lector/noLeido', value: 0 }] });
        break;
      }
    }
  }
  return out;
}

export const montarBiografia: Montar = (raiz, ctx) => {
  const L = limpiezas(), s = ctx.sesion;
  // La biografía queda ATADA a la noche con la que se armó (hallazgo UX-01 y UX-09): su etiqueta lo dice, sus causas y su «¿y si…?»
  // corren sobre esa noche aunque la escena cambie de noche mientras está abierta, y si cambia se avisa y se ofrece la misma entidad
  // en la noche nueva.
  let armada: { limpiar(): void } | null = null;
  const armar = (noche: NocheVista | null, cual: CualNocheMostrada) => {
    armada?.limpiar();
    raiz.replaceChildren();
    armada = armarBiografia(raiz, ctx, noche, cual, (otra, otraCual) => armar(otra, otraCual));
  };
  armar(s.noche, s.cualNoche);
  return () => { armada?.limpiar(); L.correr(); };
};

function armarBiografia(raiz: HTMLElement, ctx: Contexto, noche: NocheVista | null, cual: CualNocheMostrada,
  rearmar: (noche: NocheVista, cual: CualNocheMostrada) => void): { limpiar(): void } {
  const L = limpiezas(), s = ctx.sesion;
  const sel = ctx.almacen.estado.seleccion;
  const bio = sel && noche ? s.biografia(sel.clase, sel.id, noche) : null;
  if (!bio || !noche || !s.mv || !sel) {
    raiz.append(cabecera(ctx.t('app.bio.titulo'), botonVolver(ctx)), el('p', null, ctx.t('app.bio.nada')));
    raiz.dataset.listo = '1';
    return { limpiar: () => L.correr() };
  }
  const mv = s.mv;
  // el verificador controla cada cifra contra su fuente: una frase que no pasa no se muestra (se dice que se retuvo)
  const frases: Frase[] = [bio.titulo, ...bio.pasos.map((p) => p.frase)];
  const ok = s.verificar(frases, noche);
  const decir = (f: Frase, i: number) => (ok[i] ? textoFrase(ctx, f) : ctx.t('app.bio.retenida'));
  const titulo = decir(bio.titulo, 0);
  const lista = el('ol', { class: 'pasos' }, ...bio.pasos.map((p, i) => {
    const dur = p.hasta - p.desde;
    return el('li', { class: `paso${p.espera ? ' paso--espera' : ''}`, 'data-paso': i },
      el('span', { class: 'paso__hora' }, ctx.f.hora(p.desde)),
      el('span', { class: 'paso__texto' }, decir(p.frase, i + 1),
        // la duración se calcula con las horas que se leen (truncadas al minuto): «de 02:24 a 02:35 · 11 min» (hallazgo UX-17)
        dur > 0 && !('min' in p.frase.vars) && !('espera' in p.frase.vars) ? el('span', { class: 'paso__duracion' }, ` · ${duracionEntreHoras(p.desde, p.hasta)}`) : null,
        p.espera ? el('span', { class: `paso__causa paso__causa--${NOMBRE_CAUSA[p.espera.causa] ?? 'otra'}` }, ctx.t(`app.causa.${NOMBRE_CAUSA[p.espera.causa] ?? 'ninguna'}`)) : null));
  }));
  // la etiqueta de la noche de ESTA biografía (regla 9 del contrato de honestidad: ninguna noche sin su etiqueta)
  const etiqueta = el('p', { class: 'etiqueta-noche', 'data-etiqueta-noche': 'bio' }, textoEtiquetaNoche(ctx, noche, cual, s.N));
  const avisoNoche = el('div', { class: 'bio__aviso-noche', 'aria-live': 'polite', hidden: true });
  const verEnNoche = el('button', { type: 'button', class: 'boton boton--primario', 'data-accion': 'ver-en-noche', onclick: () => {
    const t0 = bio.pasos[0]?.desde;
    // si la escena ya muestra otra noche, se vuelve a la de esta historia (la ya calculada), con su etiqueta
    if (s.noche !== noche) s.volverANoche(noche, cual, t0);
    else if (t0 !== undefined) ctx.almacen.despachar({ tipo: 'cabezal', t: t0 });
    ctx.ir('escena');
  } }, ctx.t('app.bio.verEnNoche'));
  const pintarAvisoNoche = () => {
    const actual = s.noche;
    if (!actual || actual === noche || actual.replica === noche.replica) { avisoNoche.hidden = true; avisoNoche.replaceChildren(); return; }
    const otroId = s.mismaEntidad(sel.clase, sel.id, noche, actual);
    avisoNoche.hidden = false;
    poner(avisoNoche, el('p', null, ctx.t('app.bio.otraNoche', { esta: noche.replica + 1, otra: actual.replica + 1 })),
      otroId !== null ? el('button', { type: 'button', class: 'boton', 'data-accion': 'bio-otra-noche', onclick: () => {
        ctx.almacen.despachar({ tipo: 'seleccionar', seleccion: { clase: sel.clase, id: otroId } });
        rearmar(actual, s.cualNoche);
      } }, ctx.t('app.bio.verEnLaOtra', { otra: actual.replica + 1 })) : null);
  };
  L.sumar(s.suscribir((tema) => { if (tema === 'noche') pintarAvisoNoche(); }));
  const partes: HTMLElement[] = [];
  if (bio.percentil !== null) {
    // nunca «más que el 100%»: el último es «el que más tardó»; si no, se trunca hacia abajo (99,96 → 99,9)
    const p = bio.percentil >= 99 ? Math.floor(bio.percentil * 10) / 10 : Math.floor(bio.percentil);
    partes.push(el('p', { class: 'bio__percentil' }, p >= 100 ? ctx.t('app.bio.elQueMasTardo', { noche: noche.replica + 1 })
      : ctx.t('app.bio.percentil', { p: ctx.f.numero(p, p >= 99 ? 1 : 0), noche: noche.replica + 1 })));
  }
  const pasosTarjeta = tarjeta(ctx.t('app.bio.pasos'), 'bio__pasos', bio.pasos.length ? lista : el('p', null, ctx.t('app.bio.sinPasos')));

  const esPaquete = bio.clase === ClaseEntidad.PAQUETE;
  const causasCaja = el('div', { class: 'bio__causas', 'aria-live': 'polite' });
  const ysiCaja = el('div', { class: 'bio__ysi' });
  // Primero el porqué confirmado y después los pasos (revisión de la experiencia, I-3, 30-10-2026): con la lista de pasos arriba, en
  // 360 px la causa confirmada quedaba debajo de quince renglones, fuera de la primera pantalla, y es lo que la persona vino a buscar.
  if (esPaquete) partes.push(tarjeta(ctx.t('app.bio.causas'), 'bio__causas-tarjeta', causasCaja));
  partes.push(pasosTarjeta);
  if (esPaquete) {
    const cambios = cambiosDe(bio, mv, noche.traza);
    const resultado = el('p', { class: 'bio__ysi-resultado', 'aria-live': 'polite', 'data-ysi-resultado': '' });
    partes.push(tarjeta(ctx.t('app.bio.ysi'), 'bio__ysi-tarjeta',
      el('p', { class: 'nota' }, ctx.t('app.bio.ysiNota')),
      cambios.length ? el('div', { class: 'bio__ysi-botones' }, ...cambios.map((c) => el('button', { type: 'button', class: 'boton', 'data-accion': 'contrafactual',
        onclick: async () => {
          resultado.textContent = ctx.t('app.bio.ysiCalculando');
          try {
            const cf = await s.contrafactual(sel.id, c, noche);
            if (cf) resultado.textContent = textoContrafactual(ctx, cf);
          } catch { resultado.textContent = ctx.t('app.error.contrafactual'); }
        } }, ctx.t(c.clave, c.vars)))) : el('p', null, ctx.t('app.bio.ysiSinCambios')),
      resultado, ysiCaja));
  }
  raiz.append(cabecera(titulo, botonVolver(ctx), verEnNoche), etiqueta, avisoNoche, ...partes);
  pintarAvisoNoche();
  raiz.dataset.listo = esPaquete ? '0' : '1';
  if (esPaquete) {
    poner(causasCaja, el('p', { class: 'nota', role: 'status' }, ctx.t('app.bio.buscandoCausas')));
    let vivo = true;
    L.sumar(() => { vivo = false; });
    s.causas(sel.id, noche).then((r) => {
      if (!vivo) return;
      raiz.dataset.listo = '1';
      if (!r) { poner(causasCaja, el('p', null, ctx.t('app.bio.sinCausas'))); return; }
      const okC = s.verificar(r.causas, noche);
      const mostrables = r.causas.filter((_, i) => okC[i]);
      const confirmados = r.contrafactuales.filter((c) => c.confirma);
      if (!mostrables.length) { poner(causasCaja, el('p', null, ctx.t('app.bio.sinCausas'))); return; }
      poner(causasCaja,
        el('ul', { class: 'causas' }, ...mostrables.map((f) => el('li', { class: 'causa', 'data-causa': f.clave }, textoFrase(ctx, f)))),
        confirmados.length ? el('ul', { class: 'confirmados' }, ...confirmados.map((c) => el('li', { class: 'confirmado' },
          el('span', { class: 'confirmado__marca', 'aria-hidden': 'true' }, '✓'),
          // con la hora de antes al lado («llegaba a las 05:50, no a las 06:05»): lo que agrega esta línea a la frase de la causa
          textoConfirmado(ctx, c)))) : null);
    }).catch(() => { if (vivo) { raiz.dataset.listo = '1'; poner(causasCaja, el('p', null, ctx.t('app.error.causas'))); } });
  }
  return { limpiar: () => L.correr() };
}

/**
 * La línea de una causa confirmada, con la hora de antes al lado («llegaba a las 05:50, no a las 06:05»). Si tal como está el paquete no
 * llega a una jaula esa noche, lo dice con palabras (antes salía «no a las no llega»).
 */
export function textoConfirmado(ctx: Contexto, c: Contrafactual): string {
  const cambio = ctx.t(c.cambio.clave, c.cambio.vars);
  if (c.despues.listo === null) return ctx.t('app.bio.confirmadoSinHora', { cambio });
  const hora = ctx.f.hora(c.despues.listo);
  if (c.antes.listo === null) return ctx.t('app.bio.confirmadoNoLlegaba', { cambio, hora });
  return ctx.t('app.bio.confirmado', { cambio, hora, antes: ctx.f.hora(c.antes.listo) });
}

export function textoContrafactual(ctx: Contexto, cf: Contrafactual): string {
  const cambio = ctx.t(cf.cambio.clave, cf.cambio.vars);
  const antes = cf.antes.listo === null ? ctx.t('app.bio.noLlega') : ctx.f.hora(cf.antes.listo);
  if (cf.despues.listo === null) {
    // «tampoco» solo si tal como está tampoco llega; si llega y con el cambio no, se dice al revés
    return cf.antes.listo === null ? ctx.t('app.bio.ysiNoLlega', { cambio, antes }) : ctx.t('app.bio.ysiYaNoLlega', { cambio, antes });
  }
  const hora = ctx.f.hora(cf.despues.listo);
  if (cf.antes.listo === null) {
    const base = ctx.t('app.bio.ysiLlegaNoLlegaba', { cambio, hora });
    return cf.despues.antesDelCorte ? `${base} ${ctx.t('app.bio.ysiAntesDelCorte')}` : `${base} ${ctx.t('app.bio.ysiDespuesDelCorte')}`;
  }
  // a la misma hora (al minuto): el cambio no le sirve a este paquete; decirlo así, sin «llegaría… llega» con dos horas iguales
  if (cf.antes.listo !== null && hora === antes) return ctx.t('app.bio.ysiIgual', { cambio, hora });
  const base = ctx.t('app.bio.ysiLlega', { cambio, hora, antes });
  // el corte solo se menciona si el cambio lo cruza (rescata un paquete atrasado) o si sigue sin llegar a tiempo
  if (cf.despues.antesDelCorte && !cf.antes.antesDelCorte) return `${base} ${ctx.t('app.bio.ysiAntesDelCorte')}`;
  if (!cf.despues.antesDelCorte) return `${base} ${ctx.t('app.bio.ysiDespuesDelCorte')}`;
  return base;
}
