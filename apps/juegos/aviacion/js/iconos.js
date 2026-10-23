// Íconos propios en SVG en línea (trazo de 2 px, puntas redondeadas, caja de 24): reemplazan los emoji, que se ven distinto en
// cada sistema. Heredan el color del texto (currentColor). El logo y el favicon también se dibujan acá, por código.

const trazo = (d, extra = '') => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;
const lleno = (d) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">${d}</svg>`;

export const ICONOS = {
  pausa: trazo('<path d="M9 5v14M15 5v14"/>'),
  play: lleno('<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>'),
  rapido: lleno('<path d="M3 6.2v11.6a.9.9 0 0 0 1.4.75L12 13.2v4.6a.9.9 0 0 0 1.4.75l8.3-5.8a.9.9 0 0 0 0-1.5l-8.3-5.8A.9.9 0 0 0 12 6.2v4.6L4.4 5.45A.9.9 0 0 0 3 6.2z"/>'),
  muyRapido: lleno('<path d="M1.5 7v10a.8.8 0 0 0 1.25.66L8 13.9v3.1a.8.8 0 0 0 1.25.66L14.5 13.9v3.1a.8.8 0 0 0 1.25.66l6.9-4.98a.8.8 0 0 0 0-1.32l-6.9-4.98A.8.8 0 0 0 14.5 7v3.1L9.25 6.34A.8.8 0 0 0 8 7v3.1L2.75 6.34A.8.8 0 0 0 1.5 7z"/>'),
  menu: trazo('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  centrar: trazo('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  mas: trazo('<path d="M12 5v14M5 12h14"/>'),
  menos: trazo('<path d="M5 12h14"/>'),
  cerrar: trazo('<path d="M6 6l12 12M18 6L6 18"/>'),
  // avión visto desde arriba, como en el mapa
  avion: lleno('<path d="M21.6 11.2l-7.6-1.9-3.4-6.6a1 1 0 0 0-.9-.5H8.6l1.9 7.2-4.2-.6-1.6-2.3a.6.6 0 0 0-.5-.3H2.6l.9 4.8-.9 4.8h1.6a.6.6 0 0 0 .5-.3l1.6-2.3 4.2-.6-1.9 7.2h1.1a1 1 0 0 0 .9-.5l3.4-6.6 7.6-1.9a.8.8 0 0 0 0-1.6z"/>'),
  ruta: trazo('<path d="M4 8h14l-3-3M20 16H6l3 3"/>'),
  baliza: trazo('<path d="M12 3l3 9-3 9-3-9z"/><path d="M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4"/>'),
  luna: trazo('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  sol: trazo('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  rutas: trazo('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>'),
  hub: trazo('<circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M5.6 18.4l4.3-4.3M14.1 9.9l4.3-4.3"/>'),
  saca: trazo('<path d="M7 8h10l2 12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  alerta: trazo('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>'),
  info: trazo('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>'),
  arriba: trazo('<path d="M6 15l6-6 6 6"/>'),
  abajo: trazo('<path d="M6 9l6 6 6-6"/>'),
  derecha: trazo('<path d="M9 6l6 6-6 6"/>'),
  izquierda: trazo('<path d="M15 6l-6 6 6 6"/>'),
  chequeo: trazo('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  sonido: trazo('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  mudo: trazo('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
  idioma: trazo('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'),
  reiniciar: trazo('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>'),
  estrella: trazo('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
  contrato: trazo('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'),
  medalla: trazo('<circle cx="12" cy="15" r="5"/><path d="M8.5 10.5L6 3h4l2 5 2-5h4l-2.5 7.5"/>'),
  ayuda: trazo('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.01"/>'),
  mano: lleno('<path d="M9 2.5a1.5 1.5 0 0 1 1.5 1.5v6.2l.6-.1a1.5 1.5 0 0 1 1.9 1l.1.2.5-.1a1.5 1.5 0 0 1 1.8 1l.1.3.4-.1a1.5 1.5 0 0 1 1.9 1.4V18a4.5 4.5 0 0 1-4.5 4.5h-1.6a4.5 4.5 0 0 1-3.7-1.9l-3.2-4.6a1.4 1.4 0 0 1 2.1-1.8L7.5 15.6V4A1.5 1.5 0 0 1 9 2.5z"/>'),
  reloj: trazo('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
};

export const icono = (n) => ICONOS[n] ?? '';

// Logo: el hub de noche. Un disco azul noche, la luna creciente, los radios del hub en ámbar y una baliza en el centro.
export function logoSvg(tam = 64) {
  return `<svg class="logo" width="${tam}" height="${tam}" viewBox="0 0 64 64" role="img" aria-label="Hub Nocturno">
  <defs><radialGradient id="lg-f" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#22325a"/><stop offset="1" stop-color="#0b1222"/></radialGradient></defs>
  <circle cx="32" cy="32" r="30" fill="url(#lg-f)" stroke="#f2b84b" stroke-width="2"/>
  <path d="M44 15a12 12 0 1 0 6 18 10 10 0 0 1-6-18z" fill="#f6e6bf" opacity=".9"/>
  <g stroke="#f2b84b" stroke-width="2.4" stroke-linecap="round"><path d="M32 40l-14 8M32 40l15 7M32 40l-4 14M32 40l-17-4M32 40l6 13"/></g>
  <circle cx="18" cy="48" r="2.4" fill="#f2b84b"/><circle cx="47" cy="47" r="2.4" fill="#f2b84b"/><circle cx="28" cy="54" r="2" fill="#f2b84b"/>
  <circle cx="15" cy="36" r="2" fill="#f2b84b"/><circle cx="38" cy="53" r="2" fill="#f2b84b"/>
  <circle cx="32" cy="40" r="5" fill="#fff3d0" stroke="#f2b84b" stroke-width="2"/></svg>`;
}
// El mismo logo como favicon (data URI). Va también escrito en el <head> de cada HTML para que se vea antes de cargar el código.
export const faviconSvg = () => `data:image/svg+xml,${encodeURIComponent(logoSvg(64).replace(' role="img" aria-label="Hub Nocturno"', ' xmlns="http://www.w3.org/2000/svg"'))}`;
