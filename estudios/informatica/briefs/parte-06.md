# Parte 6: Frontend (la parte de la web que se ve y se toca). Notas por día.
Contexto: el estudiante ya sabe bits, SO, terminal, programar en JS, git, npm, y en la Parte 5 vio DNS, HTTP, TLS, cookies y caché. Esta parte es el lado del navegador. Herramientas reales: Playwright con Chromium está instalado (usalo para capturas, medir layout, árbol de accesibilidad y trazas de rendimiento; `require('playwright')`), Node 22 y npm (el registro responde por el proxy: instalá React, Vue, Svelte, Vite, etc. en directorios nuevos del scratchpad, nunca dentro del repo ni de senda-app). Los ejemplos de código `ejecutable` del armador corren en un Worker sin DOM: para DOM, mostrá HTML/CSS/JS con `terminal` real (Playwright) o bloques `codigo` no ejecutables y, cuando convenga, el widget `contraste`; el armador también puede incrustar `diagrama` de tipo `svg`. Ver `ESCRIBIR.md` para lo que el HTML de un día puede mostrar. Mostrá resultados medidos (tiempos de render, tamaños de bundle) rotulados como «medido en esta VM». Versiones y tendencias (React, Next, Vue…) llevan fecha y fuente oficial (react.dev, nextjs.org, vuejs.org, angular.dev, svelte.dev, MDN, web.dev, W3C/WHATWG): verificá la versión vigente al 13-11-2026 con `npm view`. Logística: paralelos (formularios de pedido, tableros de seguimiento, etiquetas de envío). Evitá repetir lo de HTTP/cookies de la Parte 5: enlazá con [@05-xx]. Senda NO es una app web: es React Native (Expo) con vista previa web (react-native-web); aparece en 06-43 y con menciones breves y verificadas donde corresponda (React, zustand, zod, expo-image ya están en `package.json`: verificá versiones). Todo texto de interfaz de Senda va en español neutro, pero los días van en rioplatense.

## 06-01 Qué es la web: documentos, enlaces y aplicaciones
Web ≠ Internet (retomá [@05-18]), hipertexto, Berners-Lee 1989-91, navegadores (Mosaic, Netscape, IE, Chrome, Firefox, Safari: cuotas de mercado con fecha y fuente, p. ej. StatCounter), W3C y WHATWG (quién define los estándares hoy: verificá en whatwg.org y w3.org), documento vs aplicación, «la web como plataforma». Demo: una página mínima servida y vista con Playwright (captura).

## 06-02 HTML I: estructura y semántica
Etiquetas, atributos, árbol del documento, `<!doctype html>`, `<head>` vs `<body>`, elementos semánticos (header, nav, main, article, section, footer) y por qué importan (accesibilidad, buscadores), HTML válido/tolerante (el parser perdona errores: mostralo con una página rota y el árbol resultante extraído con Playwright). Spec: HTML Living Standard.

## 06-03 HTML II: formularios, enlaces y multimedia
`<form>`, `<input>` y tipos, `<label>`, validación nativa, `<a>`, rutas relativas y absolutas, `<img>` con `alt`, `srcset`, `<video>`/`<audio>`, `<picture>`, qué hace el navegador al enviar un formulario (el pedido HTTP real: GET vs POST, mostralo contra un servidor local propio; retomá [@05-18]).

## 06-04 CSS I: selectores, cascada y especificidad
Selectores, cascada (origen, especificidad, orden), herencia, cómo calcula el navegador qué regla gana (cálculo de especificidad con ejemplos corridos con `getComputedStyle` en Playwright), `@layer` (verificá soporte en MDN/caniuse con fecha), problemas típicos (`!important`).

## 06-05 CSS II: el modelo de caja y las unidades
Content, padding, border, margin, `box-sizing`, colapso de márgenes, unidades (px, em, rem, %, vw/vh, dvh, ch), display block/inline/inline-block. Medí cajas reales con Playwright (`getBoundingClientRect`). Un diagrama SVG de la caja.

## 06-06 CSS III: Flexbox
Contenedor flex, eje principal y transversal, `justify-content`, `align-items`, `flex-grow/shrink/basis`, `gap`, `flex-wrap`, casos de uso (barras, tarjetas, centrado). Capturas de Playwright de variantes lado a lado. Errores típicos.

## 06-07 CSS IV: Grid y diseño moderno
Grid vs Flex (cuándo cada uno), pistas, `fr`, `grid-template-areas`, `minmax`, `auto-fit/auto-fill`, subgrid (soporte verificado con fecha), `aspect-ratio`, `clamp()`, `:has()`. Un layout completo corrido y capturado.

## 06-08 CSS V: diseño responsive
Viewport y `<meta name="viewport">`, mobile-first, media queries, container queries (soporte con fecha), imágenes responsivas, unidades fluidas. Capturas en 3 anchos con Playwright. Teléfonos de Argentina: dato de uso móvil con fuente y fecha si existe; no inventar.

## 06-09 CSS VI: tipografía, color, variables y modo oscuro
Variables CSS (`--x`), temas, `prefers-color-scheme`, contraste (usá el widget `contraste`, ratio WCAG), fuentes web (`@font-face`, `font-display`, formatos WOFF2), colores modernos (oklch: soporte con fecha). Senda tiene temas (5) y papeles: mencionar solo si lo verificás en `src/tema.ts`.

## 06-10 Cómo un navegador dibuja la página
Pipeline: bytes → parseo → DOM + CSSOM → árbol de render → layout → pintura → composición; qué invalida cada etapa (layout thrash). Medí con una traza de Chromium vía Playwright/CDP (`Tracing`, o `performance` entries) un caso real; `will-change`, propiedades que solo componen (transform, opacity). Fuentes: web.dev, docs de Chromium (RenderingNG).

## 06-11 El DOM: la página como árbol manipulable
Nodos, `document.querySelector`, crear/insertar/borrar, `textContent` vs `innerHTML` (XSS como adelanto de la Parte 15), colecciones vivas vs estáticas. Demo ejecutada con Playwright; también un mini-DOM en el Worker del armador solo si es útil.

## 06-12 Eventos: cómo la página escucha
`addEventListener`, objeto evento, captura/burbujeo (mostrá el orden con un árbol anidado ejecutado), `preventDefault`, `stopPropagation`, delegación, eventos pasivos, `input` vs `change`. Demo con Playwright.

## 06-13 JavaScript en el navegador: fetch, temporizadores y Web APIs
`fetch` (promesas: retomá [@03-41]), `setTimeout/setInterval`, `JSON`, `AbortController`, errores de red vs HTTP (fetch no rechaza en 404: mostralo), Web APIs como puente al navegador (no son parte de JS). Contra un servidor local propio.

## 06-14 El hilo principal, el event loop del navegador y la fluidez
Hilo principal único, tareas, microtareas, `requestAnimationFrame`, jank (≥16,7 ms por cuadro), Long Tasks, Web Workers (retomá [@03-40]); medí una tarea larga que congela la UI y la versión con Worker (Playwright + Performance API), 60/120 Hz.

## 06-15 Laboratorio: una página interactiva sin frameworks (tipo L)
Lista de tareas con estado en variables, render manual y los problemas que aparecen (sincronizar estado y DOM): construir paso a paso (HTML+CSS+JS), probado con Playwright, al menos 5 ejercicios con solución corrida. Dejar planteado el dolor que resolverán los frameworks.

## 06-16 Por qué existen los frameworks: el problema del estado
UI = f(estado), UI declarativa vs imperativa, historia (jQuery, Backbone, Angular.js, React 2013, Vue, Svelte; fechas verificadas), el costo de sincronizar a mano. Mini-framework de juguete (≈30 líneas) que re-renderiza desde el estado, rotulado como juguete.

## 06-17 React I: componentes, JSX y props
Instalá React real (versión vigente: verificá con `npm view react version`), componentes como funciones, JSX (se compila a llamadas: mostrá la salida de esbuild/Babel), props, composición, `children`. Renderizá a HTML con `react-dom/server` en Node para mostrar salida real. Fuente: react.dev.

## 06-18 React II: estado y re-render
`useState`, qué dispara un re-render, estado inmutable, batching, flujo unidireccional, errores clásicos (mutar estado). Mostrá con `react-dom/server`+jsdom o Playwright un contador y contá los renders. Fuente: react.dev.

## 06-19 React III: efectos y ciclo de vida
`useEffect`, dependencias, limpieza, carreras de red (stale closure, race con fetch), `useRef`, cuándo NO usar efectos (react.dev «You Might Not Need an Effect»). Demo medida con Playwright.

## 06-20 React IV: virtual DOM, reconciliación y keys
Qué es el DOM virtual (y qué NO es: no es «más rápido que el DOM»), reconciliación, por qué las `key` importan (demo de estado que salta de fila por mala key), Fiber a nivel de idea (verificá en react.dev/legacy docs). Medí con Playwright la cantidad de nodos DOM tocados.

## 06-21 React V: contexto, rendimiento y hooks avanzados
`useContext`, re-renders por contexto, `memo`, `useMemo`, `useCallback` (cuándo sí y cuándo no), React Compiler (estado al 13-11-2026: verificá), renderizado concurrente (`useTransition`, `Suspense`). Medí un caso con y sin memo.

## 06-22 Estado global: Context, Redux, zustand y señales
Cuándo hace falta estado global, store, reductor, selectores, comparación Redux Toolkit / zustand / señales. Senda usa zustand + AsyncStorage (`src/estado/usuario.ts`, `ajustes.ts`): mostrá un bloque `senda` con código real verificado (versión de zustand del `package.json`); reproducí el patrón en un ejemplo propio.

## 06-23 Estado del servidor contra estado de la interfaz
Caché del cliente, revalidación, stale-while-revalidate (RFC 5861: retomá [@05-19]), TanStack Query / SWR: qué problema resuelven; un mini-caché propio (~40 líneas) con invalidación y su problema. Senda: no usa TanStack Query (verificá con grep): cómo resuelve «datos del servidor» (`src/util/nube.ts`, estado en zustand).

## 06-24 Formularios y validación
Controlados vs no controlados, validación en cliente (nunca basta: el servidor valida), esquemas con zod (instalá y mostrá errores reales), accesibilidad de errores (`aria-describedby`), UX de formularios. Senda usa zod (verificá `package.json` y un archivo real que lo use).

## 06-25 Routing y navegación
History API (`pushState`, `popstate`), router del cliente, enlaces profundos, rutas dinámicas, 404 en SPA (servir `index.html`), React Router/TanStack Router solo nombrar. Mini-router propio probado con Playwright (botón Atrás). Senda: React Navigation 7 en lugar de Expo Router por decisión documentada en CLAUDE.md de Senda (verificá `src/App.tsx`).

## 06-26 CSR, SSR, SSG, ISR e hidratación
Los modos de renderizado con la misma página servida de las cuatro maneras (HTML inicial, JS inicial, TTFB y LCP medidos con Playwright, rotulados), hidratación y sus costos, SEO. Cuadro comparativo con cuándo usar cada uno.

## 06-27 Next.js: qué agrega a React
App Router, componentes de servidor, acciones de servidor, caché, Vercel (modelo de negocio y precios: solo con fecha y fuente; nada de recomendaciones de compra). Instalá `create-next-app` si el entorno lo permite (en el scratchpad), compilá y mostrá la salida (rutas estáticas vs dinámicas). Versión vigente verificada.

## 06-28 Vue: otra respuesta al mismo problema
Reactividad con proxies, plantillas, Composition API, SFC; comparación honesta con React (mismo problema, otra solución). Instalá Vue, mostrá `ref/reactive` y la compilación de una plantilla.

## 06-29 Angular: el framework que trae todo
Todo incluido (router, forms, HTTP, DI), TypeScript, inyección de dependencias, RxJS (idea de flujo de eventos), señales en Angular, historia (AngularJS→Angular 2). Usá Angular CLI si instala; si no, doc oficial rotulada. Dónde se usa (empresas): solo con fuente.

## 06-30 Svelte, Solid y la compilación como estrategia
Compilador de UI, reactividad fina sin DOM virtual, señales (TC39 signals: estado de la propuesta con fecha), runes de Svelte 5. Compilá un componente Svelte real y mostrá el JS generado.

## 06-31 Cómo elegir un framework
Criterios (equipo, ecosistema, contratación, costo de cambio, rendimiento, longevidad), encuestas con fecha y fuente (State of JS, Stack Overflow 2026), matriz de decisión con cuándo NO usar framework; el caso «mismo componente» en 3 frameworks medido en tamaño de bundle. Honestidad: no hay «mejor».

## 06-32 Tailwind y los estilos en la era de los componentes
CSS utilitario, CSS Modules, CSS-in-JS (en runtime vs build time y por qué decayó), problemas de escalado del CSS global, `@scope`/`@layer`. Instalá Tailwind (versión vigente verificada) y mostrá el CSS generado y su tamaño.

## 06-33 Sistemas de diseño y bibliotecas de componentes
Tokens de diseño, bibliotecas (Radix, shadcn/ui, MUI: nombrarlas con licencia verificada), Storybook, consistencia. Senda: `docs/MARCO_UX.md` y tokens en `src/tema.ts` (verificá antes de citar). Un mini sistema de tokens con CSS variables mostrado.

## 06-34 Accesibilidad
WCAG 2.2 (niveles A/AA/AAA, verificá en w3.org), ARIA (primera regla: no usar ARIA si hay HTML nativo), árbol de accesibilidad real extraído con Playwright (`accessibility.snapshot` o `ariaSnapshot`), navegación por teclado, foco, contraste (widget), lectores de pantalla (NVDA, VoiceOver, TalkBack: solo doc). axe-core corrido sobre una página con errores y la corregida. Senda: etiquetas de accesibilidad (`accessibilityLabel`) con grep verificado.

## 06-35 UX/UI: principios de interfaz
Jerarquía visual, retroalimentación, ley de Fitts y de Hick (con la fórmula y su fuente), heurísticas de Nielsen (nngroup.com), patrones; ejemplos propios de buen y mal diseño con capturas generadas por vos. Senda: MARCO_UX.md como caso (verificá antes) y la «prueba de la grilla»; sin opinar sobre otras apps como hecho.

## 06-36 Animaciones y movimiento
Transiciones y animaciones CSS, `transform/opacity`, 60 fps, easing, Web Animations API, `prefers-reduced-motion`, medición con Performance API de un cuadro caído. Senda (Reanimated, Rive): mencionar solo con evidencia de `package.json`.

## 06-37 Almacenamiento en el navegador
`localStorage` (síncrono, 5 MB aprox: verificá), `sessionStorage`, IndexedDB, Cache API, cuota (`navigator.storage.estimate()`), persistencia y evicción. Demo con Playwright. Comparación con AsyncStorage de Senda (límite 6 MB por defecto ya hallado; verificá).

## 06-38 Cookies, sesiones y la política del mismo origen
Origen, same-origin policy, CORS (preflight: mostrá un pedido real bloqueado y su arreglo con un servidor local), cookies de sesión, `SameSite`, CSRF a nivel de idea (profundiza Parte 15), por qué la app móvil de Senda no tiene CORS (no corre en un navegador, salvo la vista previa web: ¿qué pasa con CORS ahí? verificá en el código/Supabase doc).

## 06-39 PWA y Service Workers
Manifiesto web, Service Worker (ciclo de vida, caché, estrategias), modo offline, instalación, notificaciones push web (soporte iOS con fecha), límites frente a una app nativa. Demo con Playwright de una PWA mínima offline. Senda: ¿es PWA? verificá antes de afirmar (web/ sin publicar).

## 06-40 Rendimiento web
Core Web Vitals (LCP, INP, CLS: definiciones y umbrales vigentes con fuente web.dev y fecha), carga diferida, bundle, compresión (gzip/brotli: medilo), caché, imágenes (AVIF/WebP). Medí con Playwright/Lighthouse (instalalo si se puede) una página lenta y la corregida.

## 06-41 El ecosistema de build de JavaScript
Por qué hay un paso de build, bundlers (webpack, esbuild, Rollup, Vite, Turbopack, Rolldown/rspack: estado actual verificado), transpilación, minificación, tree shaking, monorepos (workspaces, Turborepo, Nx). Mostrá un build real con esbuild y Vite y compará tamaños y tiempos (medido). Senda: Metro (retomá [@04-19]).

## 06-42 Testing del frontend
Testing Library (probar lo que ve el usuario), pruebas de componentes (Vitest/Jest), Playwright E2E, pirámide aplicada al frontend (retomá [@04-15]), pruebas visuales. Escribí y corré pruebas reales de un componente y un E2E. Senda: Jest en 10 pruebas (verificado en 04-13/04-16) y la prueba de humo como E2E.

## 06-43 Senda también corre en el navegador (tipo S)
react-native-web, la exportación web, la vista previa (`npm run vista-previa`, `?demo=...`; leé `src/` y `scripts/vista_previa.py`), qué comparte y qué no con el móvil (módulos nativos con `.web`), límites. ≥2 bloques `senda`, ≥4 archivos reales. NO ejecutes npm install en senda-app: leé el código. Verificá cada afirmación.

## 06-44 Cierre de la Parte 6: del HTML a la interfaz profesional (tipo R)
Mapa del frontend (capas: HTML/CSS/DOM → JS del navegador → framework → estado → rendering → estilos y sistema de diseño → accesibilidad/rendimiento/testing), un caso recorrido de punta a punta (pantalla de seguimiento de pedidos), tabla «pregunta típica → día», 8–12 preguntas. Escribilo al final.
