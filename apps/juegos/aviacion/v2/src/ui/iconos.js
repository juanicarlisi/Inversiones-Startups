// Íconos del juego, dibujados a mano en SVG (formas propias). Los de conceptos van a color; los de botones, en una tinta.
const svg = (cuerpo, vb = '0 0 32 32') => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
const L = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';

export const ICONOS = {
  // ── conceptos ──
  carta: svg(`<rect x="3" y="7" width="26" height="18" rx="3" fill="#fdf3d7" stroke="#14203a" stroke-width="2"/>
    <path d="M4 9l12 9 12-9" fill="none" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M6 25l3-4M11 25l3-4M16 25l3-4M21 25l3-4" stroke="#e2573e" stroke-width="2.4"/><path d="M8.5 25l3-4M13.5 25l3-4M18.5 25l3-4M23.5 25l3-4" stroke="#3b7dd8" stroke-width="2.4"/>
    <rect x="3" y="7" width="26" height="18" rx="3" fill="none" stroke="#14203a" stroke-width="2"/>`),
  cartas: svg(`<rect x="13" y="13" width="16" height="14" rx="2" fill="#d79a52" stroke="#14203a" stroke-width="2"/><path d="M21 13v14M13 19h16" stroke="#14203a" stroke-width="1.6"/>
    <rect x="2" y="5" width="21" height="15" rx="2.5" fill="#fdf3d7" stroke="#14203a" stroke-width="2"/><path d="M3 7l9.5 7 9.5-7" fill="none" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M5 20l2.5-3.5M9.5 20l2.5-3.5" stroke="#e2573e" stroke-width="2.2"/><path d="M7.2 20l2.5-3.5" stroke="#3b7dd8" stroke-width="2.2"/>`),
  avion: svg(`<path d="M29 14c0 1.7-2 3-5 3h-4l-6 9h-4l3-9H8l-3 3H2l2-5-2-5h3l3 3h5L10 4h4l6 9h4c3 0 5 .3 5 1z" fill="#fdf3d7" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M17 13h7" stroke="#e2573e" stroke-width="2.2" stroke-linecap="round"/>`),
  ruta: svg(`<path d="M6 24C8 10 22 8 26 9" fill="none" stroke="#f2b84b" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>
    <circle cx="6" cy="24" r="4" fill="#e2573e" stroke="#14203a" stroke-width="2"/><circle cx="26" cy="9" r="4" fill="#37b6a6" stroke="#14203a" stroke-width="2"/>`),
  base: svg(`<path d="M4 28V15l12-9 12 9v13z" fill="#fdf3d7" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/><path d="M2 16L16 5l14 11" fill="none" stroke="#e2573e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 13.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#f2b84b" stroke="#14203a" stroke-width="1.5" stroke-linejoin="round"/>`),
  faro: svg(`<path d="M12 29l2-16h4l2 16z" fill="#fdf3d7" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/><path d="M12.7 23h6.6M13.4 18h5.2" stroke="#e2573e" stroke-width="2.4"/>
    <circle cx="16" cy="9" r="4" fill="#ffd76a" stroke="#14203a" stroke-width="2"/><path d="M3 9h5M24 9h5M6 2l3.5 3M26 2l-3.5 3M6 16l3.5-3M26 16l-3.5-3" stroke="#ffd76a" stroke-width="2.4" stroke-linecap="round"/>`),
  moneda: svg(`<circle cx="16" cy="16" r="13" fill="#f2b84b" stroke="#14203a" stroke-width="2"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#b8791f" stroke-width="1.6"/>
    <path d="M19.5 12.5c-.6-1.4-1.9-2-3.6-2-2 0-3.4 1-3.4 2.6 0 3.6 7.200 1.600 7.200 5.300 0 1.700-1.500 2.800-3.700 2.800-1.900 0-3.400-.8-4-2.400M16 8v16" fill="none" stroke="#7a4a0e" stroke-width="2.2" stroke-linecap="round"/>`),
  mision: svg(`<path d="M16 2.5l4 8.300 9.100 1.200-6.700 6.300 1.700 9-8.100-4.400-8.100 4.400 1.700-9L2.900 12l9.100-1.200z" fill="#f2b84b" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 8.500l2.200 4.600 5 .7-3.700 3.500.9 5-4.400-2.400" fill="#ffe29a"/>`),
  encargo: svg(`<path d="M7 4h15l4 4v20H7z" fill="#fdf3d7" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/><path d="M11 11h10M11 15.500h10M11 20h5" stroke="#14203a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="22" cy="23" r="5" fill="#e2573e" stroke="#14203a" stroke-width="2"/><path d="M19.500 27l-1 4 3.500-2 3.500 2-1-4" fill="#e2573e" stroke="#14203a" stroke-width="1.6" stroke-linejoin="round"/>`),
  ganancia: svg(`<rect x="4" y="18" width="6" height="10" rx="1.5" fill="#37b6a6" stroke="#14203a" stroke-width="2"/><rect x="13" y="12" width="6" height="16" rx="1.5" fill="#5aa9e6" stroke="#14203a" stroke-width="2"/>
    <rect x="22" y="5" width="6" height="23" rx="1.5" fill="#f2b84b" stroke="#14203a" stroke-width="2"/><path d="M4 11l7-5 4 2 6-5" fill="none" stroke="#e2573e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`),
  pasajero: svg(`<circle cx="16" cy="9" r="5.500" fill="#f3c9a0" stroke="#14203a" stroke-width="2"/><path d="M5 29c0-7 4.500-11 11-11s11 4 11 11z" fill="#5aa9e6" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/>`),
  carga: svg(`<path d="M4 10l12-6 12 6v13l-12 6-12-6z" fill="#d79a52" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/><path d="M4 10l12 6 12-6M16 16v13" fill="none" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/><path d="M10 7l12 6v5" fill="none" stroke="#fdf3d7" stroke-width="2.4"/>`),
  sol: svg(`<circle cx="16" cy="16" r="6.500" fill="#ffd76a" stroke="#14203a" stroke-width="2"/><path d="M16 2.500v4M16 25.500v4M2.500 16h4M25.500 16h4M6.500 6.500l2.800 2.800M22.700 22.700l2.800 2.800M6.500 25.500l2.800-2.800M22.700 9.300l2.800-2.800" stroke="#ffd76a" stroke-width="2.600" stroke-linecap="round"/>`),
  luna: svg(`<path d="M22 4a12.500 12.500 0 1 0 6 17.500A10.500 10.500 0 0 1 22 4z" fill="#fdf3d7" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="8" r="1.200" fill="#fdf3d7"/><circle cx="5" cy="14" r=".9" fill="#fdf3d7"/>`),
  tormenta: svg(`<path d="M9 20a6 6 0 1 1 1.500-11.800A8 8 0 0 1 26 11a5 5 0 0 1-1 9.900z" fill="#9fb0cc" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/><path d="M17 17l-4 6h4l-2 6 6-8h-4l2-4z" fill="#ffd76a" stroke="#14203a" stroke-width="1.600" stroke-linejoin="round"/>`),
  dormido: svg(`<path d="M5 8h8l-8 9h8M17 5h6l-6 7h6M19 17h8l-8 9h8" fill="none" stroke="#bcd0ff" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/>`),
  // ── botones (una tinta) ──
  pausa: svg(`<rect x="8" y="6" width="5.500" height="20" rx="2" fill="currentColor"/><rect x="18.500" y="6" width="5.500" height="20" rx="2" fill="currentColor"/>`),
  play: svg(`<path d="M10 5.500v21a1.500 1.500 0 0 0 2.300 1.300l16-10.500a1.500 1.500 0 0 0 0-2.600l-16-10.500A1.500 1.500 0 0 0 10 5.500z" fill="currentColor"/>`),
  rapido: svg(`<path d="M3 7v18a1.300 1.300 0 0 0 2 1.100L16 18v7a1.300 1.300 0 0 0 2 1.100l11.500-9a1.300 1.300 0 0 0 0-2.200L18 5.900A1.300 1.300 0 0 0 16 7v7L5 5.900A1.300 1.300 0 0 0 3 7z" fill="currentColor"/>`),
  // velocidades: una, dos y tres puntas (tranquila, normal, rápida)
  vel1: svg(`<path d="M11 6.500v19a1.400 1.400 0 0 0 2.200 1.200l13.500-9.500a1.400 1.400 0 0 0 0-2.400L13.200 5.300A1.400 1.400 0 0 0 11 6.500z" fill="currentColor"/>`),
  vel2: svg(`<path d="M4 7.500v17a1.300 1.300 0 0 0 2 1.100l10-7.300v6.200a1.300 1.300 0 0 0 2 1.100l11-8.500a1.300 1.300 0 0 0 0-2.200l-11-8.500a1.300 1.300 0 0 0-2 1.100v6.200L6 6.400a1.300 1.300 0 0 0-2 1.100z" fill="currentColor"/>`),
  vel3: svg(`<path d="M1.500 8.500v15a1.100 1.100 0 0 0 1.800.9l7.200-6v5.100a1.100 1.100 0 0 0 1.800.9l7.200-6v5.100a1.100 1.100 0 0 0 1.800.9l9-7.500a1.100 1.100 0 0 0 0-1.800l-9-7.500a1.100 1.100 0 0 0-1.800.9v5.100l-7.200-6a1.100 1.100 0 0 0-1.800.9v5.100l-7.200-6a1.100 1.100 0 0 0-1.800.9z" fill="currentColor"/>`),
  menos: svg(`<path d="M6 16h20" ${L}/>`),
  oficina: svg(`<path d="M3 13h26v4H3zM6 17v10M26 17v10M12 17h9v6h-9z" ${L}/><path d="M20 13V8l5-3" ${L}/><circle cx="26" cy="5.500" r="2" fill="currentColor"/>`),
  menu: svg(`<path d="M6 9h20M6 16h20M6 23h20" ${L}/>`),
  cerrar: svg(`<path d="M8 8l16 16M24 8L8 24" ${L}/>`),
  sonido: svg(`<path d="M5 12v8h5l7 6V6l-7 6z" fill="currentColor"/><path d="M21 11a7 7 0 0 1 0 10M24.500 7.500a12 12 0 0 1 0 17" ${L}/>`),
  mudo: svg(`<path d="M5 12v8h5l7 6V6l-7 6z" fill="currentColor"/><path d="M22 12l7 8M29 12l-7 8" ${L}/>`),
  musica: svg(`<path d="M12 24V7l15-3v17" ${L}/><circle cx="8.500" cy="24" r="4" fill="currentColor"/><circle cx="23.500" cy="21" r="4" fill="currentColor"/>`),
  idioma: svg(`<circle cx="16" cy="16" r="12" ${L}/><path d="M4 16h24M16 4c-5 4-5 20 0 24M16 4c5 4 5 20 0 24" ${L}/>`),
  libro: svg(`<path d="M16 8c-3-2.500-7-3-11-2v19c4-1 8-.5 11 2 3-2.500 7-3 11-2V6c-4-1-8-.5-11 2zM16 8v19" ${L}/>`),
  red: svg(`<circle cx="16" cy="16" r="4" fill="currentColor"/><path d="M16 3v5M16 24v5M3 16h5M24 16h5" ${L}/><circle cx="16" cy="16" r="9.500" ${L}/>`),
  graficos: svg(`<path d="M4 24l8-11 5 6 4-5 7 10z" fill="currentColor"/><circle cx="23" cy="8" r="3" fill="currentColor"/>`),
  reinicio: svg(`<path d="M6 16a10 10 0 1 0 3-7.200M6 5v5h5" ${L}/>`),
  flecha: svg(`<path d="M7 16h17M17 8l8 8-8 8" ${L}/>`),
  atras: svg(`<path d="M25 16H8M15 8l-8 8 8 8" ${L}/>`),
  mas: svg(`<path d="M16 6v20M6 16h20" ${L}/>`),
  check: svg(`<path d="M6 17l7 7L27 9" ${L}/>`),
  ojo: svg(`<path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z" ${L}/><circle cx="16" cy="16" r="4" fill="currentColor"/>`),
  candado: svg(`<rect x="6" y="14" width="20" height="14" rx="3" fill="currentColor"/><path d="M10 14v-4a6 6 0 0 1 12 0v4" ${L}/>`),
  mano: svg(`<path d="M13 15V5.500a2.500 2.500 0 0 1 5 0V14l6.500 1.500A3.500 3.500 0 0 1 27 19l-1 6a5 5 0 0 1-5 4h-5a6 6 0 0 1-5-2.500L6 19a2.200 2.200 0 0 1 3.500-2.500z" fill="#fdf3d7" stroke="#14203a" stroke-width="2" stroke-linejoin="round"/>`, '0 0 32 32'),
};
export const icono = (n, clase = '') => `<i class="ico ${clase}" data-ico="${n}">${ICONOS[n] ?? ''}</i>`;

export function logo(tam = 96) {
  return `<svg class="logo" viewBox="0 0 64 64" width="${tam}" height="${tam}" role="img" aria-label="Hub Nocturno">
    <circle cx="32" cy="32" r="30" fill="#14203a" stroke="#f2b84b" stroke-width="2.500"/>
    <path d="M45 13a13 13 0 1 0 7 20 11 11 0 0 1-7-20z" fill="#fdf3d7"/>
    <path d="M10 46l25-10 5-8 3.500 1-2.500 8 10 6.500-2 2.500-11-3-9 5.500-1-1 5-6.500z" fill="#f2b84b" stroke="#14203a" stroke-width="1.200" stroke-linejoin="round"/>
    <circle cx="14" cy="18" r="1.300" fill="#fdf3d7"/><circle cx="22" cy="11" r="1" fill="#fdf3d7"/><circle cx="20" cy="26" r=".9" fill="#fdf3d7"/></svg>`;
}
