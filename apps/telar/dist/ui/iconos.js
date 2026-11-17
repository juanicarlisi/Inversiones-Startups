// Íconos de trazo (dibujados acá, sin librerías externas).
const s = (d, extra = '') => `<svg class="ic"${extra} viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

export const ic = {
  chev: s('<path d="m9 6 6 6-6 6"/>'),
  grip: s('<circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/>', ' style="width:14px"'),
  up: s('<path d="m6 15 6-6 6 6"/>'),
  down: s('<path d="m6 9 6 6 6-6"/>'),
  plus: s('<path d="M12 5v14M5 12h14"/>'),
  check: s('<path d="m5 12 5 5 9-10"/>'),
  star: '<svg class="ic star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  starLinea: s('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  x: s('<path d="M6 6l12 12M18 6 6 18"/>'),
  top: s('<path d="M5 4h14M12 20V9M6 14l6-6 6 6"/>'),
  bajar: s('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  subir: s('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'),
  area: s('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18"/>'),
  tabla: s('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  copias: s('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'),
  sol: s('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  teclado: s('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
  instalar: s('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
  ejemplo: s('<path d="M4 19V5a2 2 0 0 1 2-2h12v14H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12"/>'),
};
