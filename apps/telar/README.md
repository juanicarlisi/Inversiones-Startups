# Telar · corte 0 «Salir del artefacto»

Tu año y tus proyectos en un cronograma: áreas → proyectos → tareas, con barras en el tiempo y un tablero. Web instalable
(PWA) que funciona sin internet, con los datos en el dispositivo y copia de seguridad en archivo. Es Plan Maestro
(`apps/plan-maestro/`, que no se tocó) fuera del artefacto de Claude. Producto y roadmap: `oportunidades/proyectos/telar/producto.md`.

## Cómo se arma, se prueba y se usa

```bash
cd apps/telar
python3 build.py                     # arma dist/ (sin empaquetador; versión = hash del contenido)
node --test pruebas/*.test.js        # 27 pruebas del modelo y de la capa de datos
node pruebas/navegador.mjs           # 17 pasos de punta a punta en Chromium + capturas en capturas/
npm install && node pruebas/accesibilidad.mjs   # axe-core en 8 pantallas (claro y oscuro)
node pruebas/servidor.mjs            # sirve dist/ en http://localhost:8787 para usarla
```

`build.py` revisa además que cada `import` exista y que no haya direcciones de terceros en el código; si encuentra una, no arma.
Los íconos se dibujan con `python3 herramientas/icono_svg.py` (SVG) y `node herramientas/iconos.mjs` (PNG); ya están en `src/iconos/`.

**Apagarla:** no hay servidor ni cuenta; nada se publicó. Si algún día se publica, se apaga sacando el sitio; quien la tenga
instalada sigue usándola con sus datos (son suyos) y puede descargar su copia desde el menú.

## Cómo está hecha

| Carpeta | Qué hay |
|---|---|
| `src/modelo/` | Código puro: fechas, plan (altas, orden, mover, barras), vista (filas, columnas, números), historial (deshacer y rehacer), formato (copia, mudanza, CSV), ejemplo «Tu 2027», uso |
| `src/datos/` | Capa de datos aislada: `almacen.js` (IndexedDB o memoria, misma interfaz) y `repositorio.js` (guardado con demora, revisión, aviso a otras pestañas, copia automática diaria y enchufe `sincronizador` para el corte 3) |
| `src/ui/` | Pantalla: cronograma, tablero, detalle, primer minuto, arrastre, registro del service worker |
| `src/sw.js` | Service worker: guarda los archivos de la versión; la nueva espera a que la persona toque «Actualizar» (antes se escribe lo pendiente; los datos están en IndexedDB y no se tocan) |
| `pruebas/` | Unidad (`node --test`), punta a punta y accesibilidad (Playwright del entorno) |
| `capturas/` | 390×844 y 1280×800, claro y oscuro (las rehace `pruebas/navegador.mjs`) |

Formato de la copia: `{ "app": "telar", "formato": 1, "exportado": …, "plan": { areas, projects, tasks } }`, con las mismas claves
que Plan Maestro. Restaurar acepta también el archivo de Plan Maestro y lo que guardaba su base: se revisa todo (ids repetidos,
fechas imposibles, enlaces que no son web, tareas sin proyecto) y se avisa qué se arregló.

## Qué cambió contra Plan Maestro

- **Se conserva:** áreas → proyectos → tareas con color; cronograma con cuatro escalas; tablero por estado, área o proyecto y por
  período; prioridad por orden; fechas clave y hábitos; foco; búsqueda (ahora sin tildes: «reunion» encuentra «reunión»); deshacer;
  copia en JSON y CSV; modo oscuro.
- **Nuevo:** datos en IndexedDB (sin la base del artefacto), funciona sin internet, instalable, fuentes e ícono propios, nada de
  terceros (política de seguridad estricta); arrastrar con el dedo (filas, barras y tarjetas) con una sola lógica de puntero; en el
  celular, tocar una barra la elige con tiradores para estirarla y una píldora abajo (el detalle no tapa el cronograma); rehacer;
  teclado (N, /, T, Alt+flechas, Ctrl+Z, ?); primer minuto con el ejemplo «Tu 2027» y «Armá tu primer proyecto»; «se corrió» en lugar
  de «vencida»; copias automáticas de los últimos 7 días; aviso de copia en archivo vieja; tema claro, oscuro o automático; nombres de
  barras dentro o al lado y fijos al desplazar; mudanza desde Plan Maestro.
- **Métrica desde el día 1:** «semanas con plan vivo» (3 días de uso o más) se cuenta en el dispositivo, solo con fechas, y se ve en
  el menú. Mide el criterio de salida del corte 0 (4 semanas seguidas de uso del fundador).

## Herramientas elegidas (regla 10; 17-11-2026)

- **IndexedDB del navegador**, sin librería · fuente: MDN «Storage quotas and eviction criteria» · licencia: estándar web · por qué: un
  plan de pocos cientos de KB; SQLite-WASM en OPFS (sqlite.org/wasm, «persistence») pide un Worker y COOP/COEP (VFS «opfs») o no admite
  varias pestañas (VFS «opfs-sahpool»), con la misma cuota y desalojo · regla de corte: si el plan supera ~5 MB o el historial del corte 3
  necesita consultas, SQLite-WASM «opfs-sahpool» en un Worker.
- **Motor de arrastre propio con Pointer Events** · SortableJS 1.15.7 (MIT, github.com/SortableJS/Sortable) evaluado y no adoptado ·
  por qué: el cronograma es una lista plana de tres niveles con «soltar dentro de un proyecto» y las barras se arrastran en horizontal
  por días; con SortableJS harían falta igual dos lógicas propias · regla de corte: si en la prueba de 4 semanas falla en un teléfono
  real, el tablero pasa a SortableJS.
- **Instrument Sans y Bricolage Grotesque** (Fontsource 5.3.0, OFL 1.1) servidas desde el sitio, solo latín (cubre el castellano) ·
  por qué: las mismas de Plan Maestro, sin Google Fonts · regla de corte: ninguna (archivos fijos).
- **Service worker propio** (60 líneas) · Workbox evaluado y no adoptado: para guardar ~35 archivos por versión no suma dependencias ·
  regla de corte: si el corte 3 necesita estrategias de red o sincronización en segundo plano, Workbox.
- **Sin empaquetador:** módulos ES nativos + `build.py` (copia, versión por hash, lista del service worker, controles).
- **axe-core 4.14.1** (MPL-2.0, github.com/dequelabs/axe-core) para auditar accesibilidad, versión fija en `package.json` · regla de
  corte: si deja de mantenerse, Lighthouse.
- **Playwright** del entorno (sin instalar navegadores) para las pruebas en Chromium.

## Lo que queda para el corte 1 (dic-2026 a ene-2027)

- **Capacidad en horas:** horas por tarea, capacidad por semana y por área, carga de cada semana y el veredicto «te cabe / no te cabe»
  (F1 y F2). El formato pasa a 2 con un paso de migración en `formato.js` (las copias viejas se siguen abriendo).
- **Captura rápida** en lenguaje natural rioplatense («llamar al contador el viernes 30 min #impuestos») y paleta de comandos (Ctrl+K).
- **Plantillas:** 20 planes que se arman hacia atrás desde tu fecha (F10); el ejemplo «Tu 2027» pasa a ser una más.
- **Vista «Hoy»** con el diseño de Próximos (pendientes por categoría, lo que estás haciendo late en ámbar, deshacer en el aviso),
  sobre los mismos datos de Telar.
- Importar desde Excel o Google Sheets.

## Lo que no convence todavía

- No se probó en un iPhone ni en un Android de verdad (solo Chromium emulado con toques reales por CDP). Safari puede borrar datos de
  sitios sin uso en 7 días (MDN): por eso la copia automática, el aviso de copia en archivo y pedir instalarla.
- Con cientos de tareas, cada cambio vuelve a dibujar todo el cronograma (como Plan Maestro). Anda bien con el ejemplo; el corte 1
  dibuja solo lo visible (F1).
- El campo de fecha muestra el formato del navegador (en las capturas, mm/dd/aaaa por el navegador de pruebas; en un teléfono en
  castellano, dd/mm/aaaa).
- El nombre «Telar» todavía no está elegido ni verificado (INPI, dominio): cambiarlo es tocar `index.html`, `manifest.webmanifest` y el ícono.
