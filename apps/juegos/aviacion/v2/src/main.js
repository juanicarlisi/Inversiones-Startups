// Prueba del mundo (provisorio).
import * as M from '../../js/modelo.js';
import { AEROPUERTOS } from '../../js/datos.js';
import { Mundo } from './mundo/mundo.js';
import urlAlturas from '../activos/alturas.webp';
import urlSuelo from '../activos/suelo.webp';
import './ui/estilo.css';

const q = new URLSearchParams(location.search);
async function arrancar() {
  const mundoJson = await (await fetch('activos/mundo.json')).json();
  const mundo = new Mundo(document.querySelector('#mundo'));
  await mundo.iniciar({ alturas: urlAlturas, suelo: urlSuelo }, mundoJson, AEROPUERTOS, M.HUB);
  const s = M.nuevoEstado(1);
  let acc = 0, vel = +(q.get('vel') ?? 1), ultimo = performance.now();
  window.__hn = { mundo, s, M, vel: (v) => { vel = v; } };
  addEventListener('resize', () => mundo.medir());
  document.querySelector('#carga').classList.add('fuera');
  function cuadro(ahora) {
    const dt = Math.min(0.25, (ahora - ultimo) / 1000); ultimo = ahora;
    acc += dt * M.MIN_POR_SEG * vel;
    while (acc >= M.PASO) { M.paso(s); acc -= M.PASO; }
    mundo.sincronizar(s, acc, dt, { disponible: (id) => M.ciudadDisponible(s, id), hora: M.hora(s) + acc / 60, minPorSeg: M.MIN_POR_SEG * Math.max(vel, 0.001), corriendo: vel > 0 });
    mundo.cuadro(ahora);
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
}
arrancar();
