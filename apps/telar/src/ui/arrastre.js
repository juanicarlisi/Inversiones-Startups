// Arrastrar con mouse, dedo y lápiz con una sola lógica (eventos de puntero; producto.md §4.4).
//
// - Mouse y lápiz: empieza al moverse unos píxeles desde donde se apretó.
// - Dedo: según el elemento, empieza enseguida (asas con touch-action:none, como el agarre de una fila) o con una
//   pulsación larga (tarjetas y barras), para que deslizar siga desplazando la pantalla como siempre.
// - Mientras se arrastra: el gesto no desplaza la página, la lista se desplaza sola cerca de los bordes, Escape cancela
//   y el toque que termina el arrastre no cuenta como clic.
//
// Elección (regla 10, 17-11-2026): se evaluó SortableJS 1.15.7 (MIT; según su README, «supports touch devices»,
// autodesplazamiento y onMove para limitar dónde se suelta). No se adoptó: el cronograma es una lista plana con
// tres niveles en la que una tarea también se suelta «dentro» de un proyecto cerrado, y las barras se arrastran en
// horizontal ajustando días; con SortableJS harían falta igual dos lógicas propias. Regla de corte: si en la prueba de
// 4 semanas del fundador el arrastre falla en un teléfono real (iPhone o Android), el tablero pasa a SortableJS.

const MARGEN = 40; // px desde el borde donde empieza el autodesplazamiento
const VEL_MAX = 14; // px por cuadro (≈ 840 px por segundo pegado al borde)

let activo = null; // hay un solo arrastre a la vez en toda la app
let tragarClic = false;

// Un solo escucha no pasivo: mientras hay arrastre con el dedo, el navegador no desplaza.
document.addEventListener(
  'touchmove',
  (e) => {
    if (activo && (activo.sesion || activo.listo)) e.preventDefault();
  },
  { passive: false },
);
document.addEventListener(
  'click',
  (e) => {
    if (tragarClic) {
      e.stopPropagation();
      e.preventDefault();
      tragarClic = false;
    }
  },
  true,
);
document.addEventListener('contextmenu', (e) => {
  if (activo) e.preventDefault();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activo && activo.sesion) {
    e.preventDefault();
    terminar(activo, false);
  }
});

/**
 * raiz: contenedor donde se delega.
 * op = {
 *   asa: selector de lo que se agarra,
 *   ignorar?: selector de lo que no inicia arrastre (botones dentro de la tarjeta),
 *   espera(el, e): milisegundos de pulsación antes de empezar (0 = enseguida),
 *   umbral?: px de movimiento para empezar (mouse y asas inmediatas),
 *   iniciar(el, e) → sesión u null,  mover(sesión, {x, y}),  soltar(sesión),  cancelar?(sesión),
 *   desplazables?(): contenedores que se desplazan solos,  margenIzq?(contenedor): px tapados a la izquierda
 * }
 */
export function hacerArrastrable(raiz, op) {
  raiz.addEventListener('pointerdown', (e) => {
    if (activo || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const el = e.target.closest(op.asa);
    if (!el || !raiz.contains(el)) return;
    if (op.ignorar && e.target.closest(op.ignorar)) return;
    const ms = op.espera(el, e);
    const c = { op, el, x0: e.clientX, y0: e.clientY, pid: e.pointerId, tipo: e.pointerType, e0: e, listo: ms === 0, sesion: null, ultimo: { x: e.clientX, y: e.clientY }, raf: 0 };
    activo = c;
    if (ms > 0) {
      c.timer = setTimeout(() => {
        if (activo !== c) return;
        c.listo = true;
        empezar(c);
      }, ms);
    }
    if (e.pointerType === 'mouse') e.preventDefault(); // sin selección de texto al arrastrar
  });
}

window.addEventListener('pointermove', (e) => {
  const c = activo;
  if (!c || e.pointerId !== c.pid) return;
  c.ultimo = { x: e.clientX, y: e.clientY };
  if (!c.sesion) {
    const d = Math.hypot(e.clientX - c.x0, e.clientY - c.y0);
    if (!c.listo) {
      // Con el dedo, moverse antes de la pulsación larga es desplazar: se suelta el candidato.
      if (d > 8) descartar(c);
      return;
    }
    if (d >= (c.op.umbral ?? 5)) empezar(c);
    return;
  }
  c.op.mover(c.sesion, c.ultimo);
});
window.addEventListener('pointerup', (e) => {
  if (activo && e.pointerId === activo.pid) terminar(activo, true);
});
window.addEventListener('pointercancel', (e) => {
  if (activo && e.pointerId === activo.pid) terminar(activo, false);
});
window.addEventListener('blur', () => {
  if (activo) terminar(activo, false);
});

function empezar(c) {
  if (c.sesion) return;
  const s = c.op.iniciar(c.el, c.e0);
  if (!s) {
    descartar(c);
    return;
  }
  c.sesion = s;
  document.body.classList.add('arrastrando');
  if (c.tipo === 'touch' && navigator.vibrate) {
    try {
      navigator.vibrate(8);
    } catch {
      /* algunos navegadores lo bloquean */
    }
  }
  c.op.mover(s, c.ultimo);
  const paso = () => {
    if (activo !== c) return;
    if (autodesplazar(c)) c.op.mover(c.sesion, c.ultimo);
    c.raf = requestAnimationFrame(paso);
  };
  c.raf = requestAnimationFrame(paso);
}

function autodesplazar(c) {
  if (!c.op.desplazables) return false;
  const { x, y } = c.ultimo;
  let movio = false;
  for (const el of c.op.desplazables()) {
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const izq = r.left + (c.op.margenIzq ? c.op.margenIzq(el) : 0);
    const dentroX = x >= r.left && x <= r.right;
    const dentroY = y >= r.top - MARGEN && y <= r.bottom + MARGEN;
    if (dentroX && el.scrollHeight > el.clientHeight) {
      const v = y < r.top + MARGEN ? -vel(r.top + MARGEN - y) : y > r.bottom - MARGEN ? vel(y - (r.bottom - MARGEN)) : 0;
      if (v) {
        const antes = el.scrollTop;
        el.scrollTop += v;
        movio ||= el.scrollTop !== antes;
      }
    }
    if (dentroY && y >= r.top && y <= r.bottom && el.scrollWidth > el.clientWidth) {
      const v = x < izq + MARGEN ? -vel(izq + MARGEN - x) : x > r.right - MARGEN ? vel(x - (r.right - MARGEN)) : 0;
      if (v) {
        const antes = el.scrollLeft;
        el.scrollLeft += v;
        movio ||= el.scrollLeft !== antes;
      }
    }
  }
  return movio;
}
const vel = (d) => Math.min(VEL_MAX, Math.max(2, (d / MARGEN) * VEL_MAX));

function descartar(c) {
  clearTimeout(c.timer);
  if (activo === c) activo = null;
}

function terminar(c, soltar) {
  clearTimeout(c.timer);
  cancelAnimationFrame(c.raf);
  activo = null;
  document.body.classList.remove('arrastrando');
  if (!c.sesion) return;
  tragarClic = true;
  setTimeout(() => (tragarClic = false), 0);
  if (soltar) c.op.soltar(c.sesion);
  else if (c.op.cancelar) c.op.cancelar(c.sesion);
}

/** Copia visual que sigue al puntero (no recibe eventos). */
export function crearFantasma(origen, clase) {
  const r = origen.getBoundingClientRect();
  const f = origen.cloneNode(true);
  f.removeAttribute('id');
  f.classList.add('fantasma', clase);
  f.style.width = r.width + 'px';
  f.setAttribute('aria-hidden', 'true');
  document.body.appendChild(f);
  return { el: f, dx: 0, dy: 0, r };
}

export function moverFantasma(fan, x, y, extra = '') {
  fan.el.style.transform = `translate(${x - fan.dx}px,${y - fan.dy}px)${extra}`;
}
