// La primera entrada a la oficina: la puerta se abre, dos frases, el nombre y el color de la empresa (con un valor por
// defecto) y un recorrido de tres toques por lo principal. Todo corre con el reloj de la escena (se puede avanzar a mano).
import { V } from './kit.js';
import { ico, esc, muestras } from './hojas.js';
import { COLOR_DEFECTO } from './textos.js';

const RECORRIDO = ['mapa', 'libro', 'flota'];

export function correrPrimera({ E, capa, velo, F, datos, accion, sonar, alTerminar, alCambiarEmpresa }) {
  const t = F.t;
  let reloj = 0, etapa = 'puerta', puerta = 0, abriendo = false, paso = -1, color = datos.empresa?.color || COLOR_DEFECTO, vivo = true, espera = null;
  const frente = E.ponerFrente(t('puerta'));
  E.irA(E.posePuerta(), 0);
  E.fijarPasillo(V(0.25, 2.35, E.plan.frente + 1.5), 3.2);     // la luz del pasillo
  capa.hidden = false;
  capa.innerHTML = `<p class="pr-frase" data-n="1">${esc(t('p_frase1'))}</p><p class="pr-frase" data-n="2">${esc(t('p_frase2'))}</p><button class="pr-saltar" data-of="saltarPrimera">${esc(t('saltar'))}</button>`;
  const frase = (n) => capa.querySelectorAll('.pr-frase').forEach((p) => p.classList.toggle('ver', +p.dataset.n === n));
  const guion = [
    [0.15, () => velo.classList.add('fuera')],
    [0.9, () => frase(1)],
    [3.7, () => { frase(2); abriendo = true; sonar('puerta'); }],
    [4.5, () => E.irA(E.poseUmbral(), 2.5)],
    [6.9, () => { E.irA(E.casa, 2.5); E.fijarPasillo(null, 0); }],
    [8.2, () => frase(0)],
    [9.5, () => pedirNombre()],
  ];
  let k = 0;

  function pedirNombre() {
    if (etapa !== 'puerta') return;
    etapa = 'nombre'; k = guion.length; frase(0);
    velo.classList.add('fuera'); E.fijarPasillo(null, 0);
    puerta = 1; if (E.puerta) E.puerta.eje.rotation.y = 1.9;
    const nombre = datos.empresa?.nombre || t('nombreDefecto');
    alCambiarEmpresa(nombre, color);
    E.irA(E.poseObjeto('placa', { abajo: E.vertical ? 0.5 : 0.46 }), 1.7);
    E.senalar('placa');
    capa.innerHTML = `<form class="pr-tarjeta" data-of="formPrimera" autocomplete="off">
      <h2>${esc(t('p_nombre_t'))}</h2><p>${esc(t('p_nombre'))}</p>
      <input type="text" name="nombre" maxlength="24" spellcheck="false" autocomplete="off" value="${esc(nombre)}" aria-label="${esc(t('nombre'))}">
      <label>${esc(t('p_color'))}</label>${muestras(F, color)}
      <button class="b-pri" type="submit">${esc(t('p_listo'))}</button></form>`;
    const campo = capa.querySelector('input');
    campo.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(() => vivo && alCambiarEmpresa(campo.value.trim() || t('nombreDefecto'), color), 110); });
    if (!matchMedia('(pointer: coarse)').matches) { campo.focus({ preventScroll: true }); campo.select(); }
    setTimeout(() => { if (vivo) E.quitarFrente(); }, 1800);
  }
  function elegirColor(c, boton) {
    color = c;
    capa.querySelectorAll('.muestra').forEach((m) => { const si = m === boton; m.classList.toggle('sel', si); m.setAttribute('aria-checked', si); });
    alCambiarEmpresa(capa.querySelector('input')?.value.trim() || t('nombreDefecto'), color);
    sonar('toque');
  }
  function confirmar() {
    if (etapa !== 'nombre') return;
    clearTimeout(espera);
    const nombre = (capa.querySelector('input')?.value ?? '').trim().slice(0, 24) || t('nombreDefecto');
    alCambiarEmpresa(nombre, color);
    accion({ tipo: 'nombre', nombre, color });
    sonar('placa');
    etapa = 'recorrido'; irPaso(0);
  }
  function irPaso(i) {
    paso = i;
    if (i >= RECORRIDO.length) return terminar();
    const id = RECORRIDO[i];
    E.senalar(id);
    E.irA(E.poseObjeto(id, { abajo: E.vertical ? 0.3 : 0.26 }), 1.35);
    capa.innerHTML = `<div class="pr-globo">${ico(id)}<div><small>${esc(t('r_paso', { n: i + 1 }))}</small>${t(`r_${id}`)}</div><button class="b-pri" data-of="pasoPrimera">${esc(t(i === RECORRIDO.length - 1 ? 'listo' : 'siguiente'))}</button></div>`;
    sonar('toque');
  }
  function terminar() {
    if (!vivo) return;
    vivo = false; etapa = 'fin';
    capa.hidden = true; capa.replaceChildren();
    E.senalar(null); E.quitarFrente(); E.fijarPasillo(null, 0);
    E.irA(E.casa, 1.35);
    alTerminar();
  }
  return {
    get etapa() { return etapa; }, get paso() { return paso; },
    cuadro(dt) {
      if (!vivo) return;
      reloj += dt;
      while (etapa === 'puerta' && k < guion.length && reloj >= guion[k][0]) guion[k++][1]();
      if (abriendo && E.puerta) {
        // la puerta gira con peso: arranca despacio, se pasa apenas y vuelve
        puerta = Math.min(1, puerta + dt / 2.7);
        const u = puerta, e = 1 - (1 - u) ** 3, rebote = Math.sin(u * Math.PI) * 0.035 * (1 - u);
        E.puerta.eje.rotation.y = (e + rebote) * 1.9;
      }
    },
    // acciones que llegan de la interfaz
    saltar() { if (etapa === 'puerta') pedirNombre(); },
    color: elegirColor,
    confirmar,
    siguiente() { if (etapa === 'recorrido') irPaso(paso + 1); },
    cortar() { vivo = false; clearTimeout(espera); },
  };
}
