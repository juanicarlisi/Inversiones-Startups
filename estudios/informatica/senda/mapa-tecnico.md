# Mapa técnico de Senda: cómo está construida de verdad

**Auditado:** 2026-11-09 · **Repo:** `senda-app` (clon local de solo lectura) · **Commit:** `25e08faf5e0d892d256e8e4f2c54b956eb3c1af6`
**Para quién:** el fundador, que estudia ingeniería informática y quiere entender Senda como si la hubiera creado técnicamente.

## Cómo leer este documento

- Todo lo que sigue sale de leer el código y la configuración del repositorio. Cada afirmación lleva la ruta del archivo (relativa a la
  raíz de `senda-app`) y, cuando ayuda, el nombre de la función, tabla o política.
- Uso tres etiquetas, como pide la doctrina del holding:
  - **HECHO (código):** lo leí en el código o en la configuración. Verificable abriendo el archivo citado.
  - **HECHO (doc):** lo dice un documento del repo (`docs/*.md`), pero no lo puedo comprobar solo con el código (por ejemplo, qué cuenta de
    Supabase existe hoy, o si una cuenta de Google Play está abierta).
  - **INFERENCIA / ESTIMACIÓN:** razonamiento mío o cifras que el propio repo marca como estimadas.
- Lo que **no existe** está en la sección 2, con la evidencia de dónde lo busqué. Lo que está **solo planificado** en documentos y no en
  código lo marco así en cada sección (sobre todo en la 8, dinero).
- No copié ningún valor secreto. Donde hay claves o tokens, digo dónde viven, no qué valen.

---

## 0. Ficha

| Dato | Valor | Evidencia |
|---|---|---|
| Commit auditado | `25e08faf5e0d892d256e8e4f2c54b956eb3c1af6` («R28 en Torneos, Ajustes y el avatar; las tarjetas con tono ya no salen grises») | `git log -1` |
| Fecha del commit | 2026-11-08 01:05:58 UTC | `git log -1` |
| Historia | **Un solo commit** en este clon (`git log --oneline` devuelve 1 línea) y una etiqueta `prueba-51`. No se puede reconstruir la evolución desde git; la historia está en los comentarios del código («prueba N») y en los docs | `git tag` |
| Archivos versionados | 1.065 | `git ls-files` |
| Peso del repo | `.git` 79 MB; `assets/` 60 MB; `contenido/` 15 MB; `scripts/` 17 MB; `consola/` 36 MB (archivos de la Consola, ver §3.10) | `du -sh` |
| Nombre de la app | «Senda» · slug de Expo `senda-app-ok` · dueño de Expo `senda-app-ok` | `app.json` |
| Identificador Android / iOS | `com.sendaapp.biblia` (los dos) · esquema de enlaces `senda://` | `app.json` |
| Versiones declaradas | `package.json` dice `1.0.0`; `app.json` dice `0.40.0` y `android.versionCode` 41; el número «de prueba» (51) se escribe al compilar en `src/compilacion.json` (en el repo dice `"desarrollo"`) | `package.json`, `app.json`, `src/compilacion.json` |
| Estado del producto | Preproducción: se prueba con APK de prueba; lanzamiento planeado el 18-12-2026 | `README.md`, `docs/TIENDAS.md` |
| iOS | **Nunca se compiló** para iOS; el repo está preparado (perfiles de EAS, `bundleIdentifier`) pero la primera compilación está pendiente | `docs/TIENDAS.md` §2 punto 3 |
| Repos hermanos | La app vive acá; el proyecto/estrategia vive en el holding (`oportunidades/proyectos/senda/`) | `CLAUDE.md` |

### Líneas de código (conteo real sobre archivos versionados, 2026-11-09)

Conté líneas con un script sobre `git ls-files` (líneas totales, incluye comentarios y blancos). Solo cuento archivos de código y texto
(`.ts .tsx .js .cjs .py .sql .sh .yml .md .html .css`); la columna «Archivos» es de esos mismos tipos (no incluye imágenes, audio ni JSON). Los JSON de
contenido los excluyo del conteo de líneas porque son datos (están medidos en megabytes más abajo).

| Carpeta | Líneas | Archivos | Qué es |
|---|---|---|---|
| `scripts/` | 53.224 | 212 | Python/Node/shell: generación y validación de contenido, arte, sonido, Lany, economía. **~33.400 de esas líneas son Python en `scripts/autor/` (137 archivos)**, en buena parte datos escritos como código (el texto de lecciones y preguntas); esa carpeta tiene además 63 JSON auxiliares (~203.000 líneas) |
| `src/` | 47.226 | 202 | El código de la app (TypeScript/TSX/JS) |
| `supabase/` | 31.143 | 45 | 42 migraciones SQL + 3 funciones de borde. **~25.800 líneas son 10 migraciones generadas** `*_preguntas_clave.sql` (la clave de respuestas) y 1.435 la generada de `nombres_biblicos`: no son lógica |
| `docs/` | 3.196 | 37 | Documentación |
| `web/` | 2.543 | 74 | Sitio público estático (política de privacidad, guías de libros) |
| `material-ministerio/` | 1.226 | 3 | Material del ministerio aliado |
| `consola/` | 1.182 | 2 | Plantilla de la Consola del fundador |
| `pruebas/` | 950 | 8 | Pruebas (arranque en Node y base completa) |
| `.github/` | 688 | 10 | 10 flujos de GitHub Actions |
| raíz | 270 | 5 | `index.ts`, `App.tsx`, `CLAUDE.md`, etc. |

Desglose de `src/` (líneas de TS/TSX/JS):

| Subcarpeta | Líneas |
|---|---|
| `src/pantallas/` | 20.600 |
| `src/componentes/` | 10.847 |
| `src/util/` | 3.703 |
| `src/i18n/` | 2.578 |
| `src/datos/` | 2.523 |
| `src/arte/` | 2.296 (de las cuales `src/arte/generado.ts` son 140 líneas muy largas, 165 KB, generado) |
| `src/lector/` | 1.132 |
| `src/estado/` | 986 |
| `src/lany3d/` | 608 |
| `src/audio/` | 368 |
| `src/lany/` | 243 |
| `src/widget/` | 78 |
| raíz de `src/` (`App.tsx`, `sonido.ts`, `tema.ts`, `navegacion.ts`) | 1.264 |

Por lenguaje (todo el repo versionado): Python 52.502 líneas · TSX 32.884 · SQL 30.907 · TS 13.508 · Markdown 4.834 · HTML 3.692 ·
JS 1.599 · CJS 983 · YAML 688 · Shell 207.

Contenido (datos, no código), en megabytes: `contenido/espadeo.json` 2,9 MB (**5.483 preguntas**: 5.390 publicadas, 12 aprobadas, 81
retiradas) · `contenido/travesia.json` 2,8 MB (**482 lecciones**, 23 rutas, 13 áreas, 3.019 preguntas dentro de las lecciones) ·
`contenido/traducciones/pt/` y `en/` (23 archivos por idioma, la trivia traducida pesa 1,8 MB por idioma) · `assets/biblia/*.bib`
(8 Biblias, ~4 MB cada una, 32 MB en total).

---

## 1. Stack real

Versiones tomadas literalmente de `package.json` (los `~` y `^` son rangos de npm: `~` acepta parches, `^` acepta menores). No hay
carpeta `node_modules` en el clon, así que no pude leer la versión instalada exacta; el `package-lock.json` sí está versionado.

### 1.1 Núcleo de la app

| Tecnología | Versión (package.json) | Para qué se usa en Senda | Dónde se ve |
|---|---|---|---|
| Expo (SDK 57) | `~57.0.26` | Plataforma base: compila Android/iOS/web desde un solo código; «prebuild» genera las carpetas nativas en cada compilación (no se versionan: `/android` y `/ios` están en `.gitignore`) | `package.json`, `app.json`, `.gitignore` |
| React Native | `0.86.3` | Motor de interfaz nativa. Nueva arquitectura requerida por AdMob v17 (dice el doc) | `package.json`, `docs/ANUNCIOS.md` |
| React | `19.2.3` | Librería de componentes | `package.json` |
| TypeScript | `~6.0.3`, modo `strict` | Todo el código de `src/` es TS/TSX salvo 3 archivos JS (`src/arte/lani3d.js`, `src/arte/piezas3d.js`, `src/lany3d/actor.js`) | `tsconfig.json` (extiende `expo/tsconfig.base`, excluye `pruebas` y `supabase`) |
| Hermes (motor JS) | no declarado; viene por defecto del SDK | Compila el JS a bytecode al armar el APK. El doc de peso lo nombra como «JavaScript (Hermes)». **`app.json` no tiene `jsEngine`**, o sea usa el valor por defecto | `docs/PESO.md`, `app.json` |
| Metro | el de Expo | Empaquetador JS. Config propia: trata `.bib`, `.riv`, `.wasm` y `.glb` como recursos (assets), no como módulos | `metro.config.js` |
| react-native-web + react-dom | `~0.21.0` / `19.2.3` | La **vista previa web** de la app completa (`npm run vista-previa`); no se publica como producto | `package.json` (scripts `web`, `web:export`, `vista-previa`), `scripts/vista_previa.py` |

### 1.2 Navegación, estado y datos locales

| Tecnología | Versión | Para qué | Dónde |
|---|---|---|---|
| React Navigation (`native`, `native-stack`, `bottom-tabs`) | `^7.5.0`, `^7.20.0`, `^7.20.0` | 1 pila de ~30 pantallas + 5 pestañas con barra propia. **No se usa Expo Router a propósito** (la vista previa se sirve desde cualquier carpeta) | `src/App.tsx`, `src/navegacion.ts`, `src/componentes/TabBar.tsx`, `CLAUDE.md` |
| react-native-screens / safe-area-context | `~4.26.0` / `~5.7.0` | Pantallas nativas y márgenes seguros | `package.json`, `src/App.tsx` |
| zustand | `^5.0.15` | Estado global. **11 «stores» persistidos** con el middleware `persist` | `src/estado/*.ts` |
| @react-native-async-storage/async-storage | `2.2.0` | Almacén clave-valor del teléfono. Aquí vive **todo** lo local: progreso, ajustes, sesión de Supabase, colas de envío | `src/util/almacen.ts`, `src/util/cuenta.ts` |
| zod | `^4.6.7` | Validación de datos que llegan del servidor. **Usado en 1 solo archivo**: valida la respuesta de `mis_novedades` | `src/util/juntos.ts` (`leerNovedades`) |

### 1.3 Animación, gráficos y arte

| Tecnología | Versión | Para qué | Dónde |
|---|---|---|---|
| react-native-reanimated + react-native-worklets | `4.5.1` / `0.10.1` | Animaciones en el hilo nativo; la vuelta de hoja del lector corre ahí | `src/lector/Libro.tsx` |
| react-native-gesture-handler | `~2.32.0` | Gestos (arrastrar la hoja, toques) | `src/lector/Libro.tsx`, `src/App.tsx` |
| react-native-svg | `15.15.4` | Íconos, retratos, mapas, láminas y diagramas: todo SVG generado por scripts Python | `src/arte/generado.ts`, `src/arte/Arte.tsx`, `scripts/generar_arte.py` |
| Rive (`@rive-app/react-native` + `react-native-nitro-modules`; web: `@rive-app/canvas-lite`) | `0.5.4` + `0.36.5`; `2.43.1` | **Lany**, la mascota animada en 2D. El archivo `.riv` se compila con la herramienta oficial Rive CLI a partir de un fuente RML | `src/componentes/laniRive.tsx`, `src/componentes/laniRive.web.tsx`, `rive/lany/`, `assets/lani/lani.riv`, `scripts/rive/lani.py` |
| three + expo-gl | `^0.186.1` / `~57.0.2` | «Lany Master» en 3D y la fiesta de la armadura. **El Lany 3D está apagado**: `LANY_3D = false` | `src/arte/Arte.tsx` (línea ~108), `src/lany3d/actor.js`, `src/componentes/lany3d.tsx`, `docs/LANY_3D.md` |
| @dicebear/core + @dicebear/avataaars | `9.4.2` | Avatares del perfil dibujados **en el teléfono** (no son imágenes guardadas) | `src/util/avatar.ts` |
| expo-image / expo-linear-gradient | `~57.0.5` / `~57.0.2` | Imágenes con caché; degradados | `src/componentes/visual.tsx`, `src/lector/papel.tsx` |
| Fuentes (@expo-google-fonts) | `literata ^0.4.3`, `plus-jakarta-sans ^0.4.2`, `unbounded ^0.4.1` + `expo-font ~57.0.4` | Tipografías: Unbounded (títulos), Plus Jakarta Sans (interfaz), Literata (Biblia) | `src/App.tsx` (`useFonts`), `src/tema.ts` |

**Skia no está** (la curva de hoja con Skia se probó y se sacó por regla de corte, DEC-2026-11-06-5): no figura en `package.json`.

### 1.4 Audio, voz, notificaciones, anuncios, widget

| Tecnología | Versión | Para qué | Dónde |
|---|---|---|---|
| react-native-audio-api | `~0.13.6` | Motor de sonido principal (Web Audio API sobre Oboe/AAudio): sonidos mezclados y agendados con precisión | `src/audio/motor.ts`, `src/sonido.ts` |
| expo-audio | `~57.0.5` | **Plan B** de sonido si el motor nativo no está | `src/audio/respaldo.ts` |
| expo-speech | `~57.0.3` | Leer la Biblia en voz alta con la voz del teléfono (no hay voz propia de Senda) | `src/util/voz.ts` |
| expo-haptics | `~57.0.3` | Vibración fina | `src/util/haptica.ts` |
| expo-notifications | `~57.0.21` | Avisos locales programados **y** recepción de push de Expo (FCM en Android) | `src/util/avisos.ts`, `src/util/juntos.ts` (`registrarPush`) |
| react-native-google-mobile-ads | `^17.4.0` | Anuncios AdMob (intersticial y video con premio) | `src/util/anuncios.ts`, `app.json` (plugin) |
| react-native-android-widget | `^0.22.1` | Widget «Versículo del día» (solo Android) | `src/widget/tarea.tsx`, `src/widget/VersiculoWidget.tsx`, `index.ts` |

### 1.5 Utilidades nativas y de cuenta

| Tecnología | Versión | Para qué | Dónde |
|---|---|---|---|
| expo-crypto | `~57.0.4` | Generar el desafío PKCE (SHA-256) del inicio de sesión con Google | `src/util/cuenta.ts` (`pkce`) |
| expo-web-browser | `~57.0.3` | Abrir Google en el navegador del teléfono y volver por `senda://auth`; abrir Bible.com | `src/util/cuenta.ts`, `src/datos/biblia.ts` |
| expo-document-picker | `~57.0.3` | Elegir el PDF del sermón | `src/componentes/sermonGrupo.tsx` |
| expo-file-system | `~57.0.7` | Leer las Biblias empaquetadas, leer el PDF, subirlo al almacén | `src/datos/biblia.ts`, `src/util/sermon.ts` |
| expo-clipboard | `~57.0.2` | Copiar códigos y el detalle de un fallo | `src/componentes/fallo.tsx` y 6 pantallas |
| expo-image-picker | `~57.0.20` | Foto de portada de un evento propio | `src/pantallas/Evento.tsx` |
| expo-location | `~57.0.21` | Solo al tocar «Ubicar en el mapa» (buscar dirección de un evento); nunca en segundo plano | `src/util/lugares.ts`, `app.json` |
| expo-screen-orientation | `~57.0.3` | Orientación en «En la frente» | `src/pantallas/EnLaFrente.tsx` |
| expo-asset, expo-splash-screen, expo-status-bar | `~57.0.18`, `~57.0.9`, `~57.0.1` | Recursos, pantalla de arranque, barra de estado | `src/App.tsx`, `src/datos/biblia.ts` |

### 1.6 Pruebas y herramientas de desarrollo

| Tecnología | Versión | Para qué | Dónde |
|---|---|---|---|
| jest + jest-expo + react-test-renderer | `^29.7.0`, `~57.0.6`, `19.1.0` | Prueba de arranque en Node y pruebas de datos. **react-test-renderer es 19.1.0 y React es 19.2.3** (desfase menor de versiones) | `pruebas/arranque/jest.config.js`, `package.json` |
| Playwright (no está en `package.json`) | el que trae el entorno de Claude | Auditoría automática de textos sobre la vista previa web | `scripts/auditoria/textos.cjs` |
| Rive CLI, Blender 4.5 LTS | externas (no npm) | Rive CLI compila a Lany 2D; Blender construyó Lany 3D por código | `scripts/rive/`, `scripts/lany3d/` |
| GitHub Actions | — | Todo el armado: APK, AAB, migraciones, pruebas (ver §11) | `.github/workflows/*.yml` |
| Python 3 | 3.12 en los flujos | Generadores y validadores de contenido | `scripts/` |

**Declaradas pero sin import directo** (HECHO, medido con un script): `@expo/metro-runtime`, `react-dom`, `react-native-web`
(son para la vista previa web), `react-native-nitro-modules` (lo exige Rive) y `react-native-screens` (lo exige React Navigation). No
son paquetes sobrantes: son dependencias «pares». En cambio **`expo-constants` se importa** (`src/util/juntos.ts`, para leer el
`projectId` de Expo) y **no figura en `package.json`**: llega como dependencia indirecta de `expo`.

### 1.7 Servicios externos (lo que no está en `package.json`)

| Servicio | Para qué | Cómo se llama desde la app | Dónde |
|---|---|---|---|
| Supabase (Postgres + Auth + Storage + Edge Functions + pg_cron + pg_net) | Toda la parte social y la cuenta | Llamadas HTTP directas con `fetch` (**no** se usa `supabase-js` en el cliente) | `src/util/cuenta.ts`, `src/util/nube.ts`, `supabase/` |
| PostHog (plan gratis) | Métricas anónimas | HTTP directo a `/batch/` (sin SDK) | `src/util/metricas.ts` |
| Expo Push API (`exp.host`) + FCM (Firebase Cloud Messaging) | Entregar avisos push a Android | La llama **la base de datos** (pg_net), no el teléfono | `supabase/migrations/20261130000005_grupos_grandes.sql` |
| Google AdMob | Anuncios | SDK nativo | `src/util/anuncios.ts` |
| Nominatim (OpenStreetMap) | Buscar la dirección de un evento | `fetch` con límite de 1 por segundo | `src/util/lugares.ts` |
| Anthropic (API de Claude) | **Solo del lado servidor**: arma preguntas de la «trivia del sermón» (función de borde) y trabaja por lotes para producir contenido | SDK `npm:@anthropic-ai/sdk` dentro de la función | `supabase/functions/trivia-sermon/index.ts`, `scripts/lotes/claude_lotes.py` |
| Bible.com / YouVersion | Abrir capítulos de versiones con derechos (RVR1960, NVI…) con un enlace | `Linking`/navegador | `src/datos/biblia.ts` |
| Google Sign-In (vía Supabase Auth) | Guardar/recuperar el progreso | OAuth con PKCE en navegador | `src/util/cuenta.ts` |

Las tres funciones de borde importan: `jsr:@supabase/supabase-js@2`, `npm:@anthropic-ai/sdk` y `npm:unpdf@0.12.1` (extractor de texto de
PDF). No hay `import_map` ni `deno.json` en `supabase/functions/`, así que las versiones de `supabase-js` y del SDK de Anthropic no están
fijadas (la de `unpdf` sí).

---

## 2. Lo que Senda NO usa (con evidencia)

Cada fila dice qué busqué y dónde. «No encontrado» significa que lo busqué con `grep` en `package.json`, `src/`, `supabase/`,
`.github/` y `scripts/`.

| Cosa | ¿Existe? | Evidencia |
|---|---|---|
| **Backend propio / servidor Node / API REST propia** | **No.** No hay carpeta `server/` ni `api/`; no hay Express, Fastify, NestJS. El «backend» es 100 % Supabase: tablas + funciones SQL + 3 funciones de borde | `ls` de la raíz; `supabase/functions/` solo tiene `borrar-cuenta`, `compras`, `trivia-sermon`; `supabase/config.toml` contiene solo `project_id = "senda"` |
| **Base de datos local SQLite / Realm / MMKV / WatermelonDB** | **No.** Lo local es AsyncStorage con JSON | `grep -i "sqlite\|realm\|mmkv"` en `package.json` y `src/`: sin resultados |
| **Redis / caché en servidor** | **No** | `grep -i redis` sin resultados (las únicas coincidencias eran palabras como «Rediseño») |
| **Compras dentro de la app (Google Play Billing, RevenueCat, StoreKit)** | **No hay código de compra en la app.** Existe una función de borde `compras` que verificaría recibos de Google Play, pero **nada en `src/` la llama**. No hay librería de billing en `package.json` | `grep -rn "functions/v1" src` devuelve solo `borrar-cuenta` y `trivia-sermon`; `grep -i "billing\|react-native-iap\|purchases"` sin resultados en `package.json`/`app.json`; ver §8 |
| **Firebase Auth / Firestore / Analytics / Crashlytics** | **No.** Firebase se usa **solo como puerta de entrega de push (FCM)** de Android. Existe `google-services.json` en la raíz pero no hay paquete `firebase` ni `@react-native-firebase/*` | `package.json`; `app.json` (`googleServicesFile`); `docs/EXPO_FIREBASE.md` |
| **`@supabase/supabase-js` en el teléfono** | **No.** El cliente habla con la API REST de Supabase por `fetch` | `grep "supabase-js" src` sin resultados (solo aparece en `supabase/functions/*/index.ts`) |
| **Almacén seguro para el token (`expo-secure-store`, Keychain/Keystore)** | **No.** El token de sesión se guarda en AsyncStorage (texto plano dentro de la sandbox de la app). El propio `docs/SEGURIDAD.md` lo reconoce como pendiente | `src/util/cuenta.ts` (`CLAVE_SESION = "senda-sesion"`), `docs/SEGURIDAD.md` («Lo que queda», última fila) |
| **Actualizaciones por aire (OTA): `expo-updates`, EAS Update, CodePush** | **No.** No está el paquete y `app.json` no tiene la clave `updates`. `eas.json` define «canales» (`prueba`, `produccion`) pero sin `expo-updates` esos canales no hacen nada | `package.json`, `app.json`, `eas.json` |
| **EAS Build / EAS Submit en uso real** | **No se usan en los flujos.** Ningún flujo de `.github/workflows/` llama a `eas`. Se arma con `expo prebuild` + Gradle en GitHub. `eas.json` está preparado para iOS | `grep -rn "eas " .github` sin resultados; `eas.json` |
| **Crash reporting remoto (Sentry, Bugsnag, Crashlytics)** | **No.** Los errores se guardan **solo en el teléfono** (`senda-ultimo-fallo`) y la persona los copia y manda por correo. La única mención a «sentry» en el repo es un patrón en `pruebas/arranque/jest.config.js` | `src/util/guardia.ts`, `src/componentes/fallo.tsx` |
| **Realtime / WebSockets en el cliente** | **No.** Las «salas en vivo» y la «encuesta en vivo» se resuelven con **sondeo** (el teléfono pregunta cada 2 u 8 segundos). La migración sí agrega las tablas a la publicación `supabase_realtime`, pero el cliente no se suscribe | `src/util/salas.ts` (`CADA_MS = 2000`), `src/pantallas/Sala.tsx` línea ~93, `src/componentes/encuestaDia.tsx` línea ~59; `grep -i "realtime\|websocket" src` solo da comentarios |
| **Redux, React Query, Axios, GraphQL, tRPC** | **No** | `package.json` |
| **Lint/formato (ESLint, Prettier) configurados** | **No hay configuración ni paquetes** aunque el código tiene comentarios `eslint-disable` | `ls -a` de la raíz; `package.json` |
| **Chequeo de tipos en CI** | **No.** `tsc --noEmit` es un script manual (`npm run typecheck`); ningún flujo lo corre | `package.json`, `.github/workflows/*.yml` |
| **Pruebas unitarias del código de `src/`** | **Casi no hay.** Las únicas pruebas Jest son `pruebas/arranque/arranque.test.tsx` y `datos.test.tsx` | `find . -name "*.test.*"` |
| **Entorno de staging separado de Supabase** | **No** hay indicios: un `push` a `main` que toca `supabase/**` migra el proyecto real, después de probar en una base descartable | `.github/workflows/supabase.yml` |
| **Cobros de servidor (Stripe, Mercado Pago)** | **No** | `grep` sin resultados |
| **iOS compilado** | **No todavía** | `docs/TIENDAS.md` |
| **Edad verificada en el servidor** | **No.** La edad es una franja que la persona declara en la bienvenida y solo la aplica el cliente | `grep -i "menor_13\|menos13" supabase` sin resultados; `src/util/cuenta.ts` |

---

## 3. Arquitectura

### 3.1 La idea en una frase

Senda es una **app «primero el teléfono»**: toda la Biblia, el contenido educativo, el progreso, las rachas, los talentos, el álbum y los
ajustes viven **dentro del teléfono** (y funcionan sin internet). La nube (Supabase) se usa **solo para lo que necesita más de una
persona** (amigos, duelos, grupos, torneos, salas, copas, encuestas, eventos para todos), para la cuenta, y para unas métricas
anónimas. Fuente de este principio: `docs/ESCALA.md` §1 y `docs/COSTOS.md` §1; el código lo respeta (ver abajo).

```
┌──────────────────────── TELÉFONO (React Native + Expo) ────────────────────────┐
│ index.ts → guardia de fallos → App.tsx → NavigationContainer (pila + 5 pestañas)│
│  · contenido/*.json (dentro del bundle JS)    · assets/biblia/*.bib (8 Biblias)  │
│  · zustand + AsyncStorage (progreso, ajustes, colas de envío, sesión)            │
│  · utilidades de red: src/util/{cuenta,nube,juntos,grupos,salas,sermon,…}.ts     │
└───────────────┬──────────────────────────────┬──────────────────────┬───────────┘
                │ fetch (HTTP)                 │ fetch (HTTP lotes)   │ SDK nativo
                ▼                              ▼                      ▼
        SUPABASE (proyecto único)         PostHog (métricas)     AdMob (anuncios)
   Auth anónima + Google · PostgREST
   (tablas con RLS + funciones SQL RPC)
   Storage («sermones») · Edge Functions
   pg_cron (3 tareas) · pg_net ──────► Expo Push API ──► FCM ──► teléfono
   Edge «trivia-sermon» ───────────► API de Claude (Anthropic)
```

### 3.2 Mapa de carpetas de `src/` (qué hace cada una y cómo se conectan)

| Carpeta | Qué contiene | Archivos clave | Se conecta con |
|---|---|---|---|
| `src/` (raíz) | Arranque de la app, tema y motor de sonido | `src/App.tsx` (raíz de navegación, fuentes, hidratación, avisos, enlaces profundos), `src/tema.ts` (5 temas, papeles del lector, **`reglas`** del juego), `src/sonido.ts` (motor de sonido: voces superpuestas y agendadas), `src/navegacion.ts` (tipos de rutas y `abrirLector`), `src/compilacion.json` | Todo cuelga de `App.tsx` |
| `src/pantallas/` | 38 pantallas (una por archivo) | `Inicio.tsx`, `Biblia.tsx`, `Lector.tsx`, `Travesia.tsx`, `Leccion.tsx`, `Jugar.tsx` (Espadeo y otros juegos), `Comunidad.tsx`, `Amigos.tsx`, `Duelos.tsx`, `Grupos.tsx`/`Grupo.tsx`, `Torneos.tsx`, `Copa.tsx`, `Sala.tsx`, `Planes.tsx`, `Ajustes.tsx`, `Admin.tsx`, `Bienvenida.tsx`, `Album.tsx`, `Perfil.tsx`, `Calendario.tsx`/`Evento.tsx`, `Legal.tsx` | Leen estado de `src/estado/`, contenido de `src/datos/` y hablan con la nube vía `src/util/` |
| `src/componentes/` | Componentes reutilizables (58 archivos) | `base.tsx` (texto, botones, fondo, vidrio), `TabBar.tsx`, `fallo.tsx` (pantalla de fallo + guardia de React), `anuncio.tsx`, `momentos.tsx` (carteles y celebraciones), `hoja.tsx`, `laniRive.tsx`/`laniRive.web.tsx`/`laniRiveComun.ts`, `lany3d.tsx`, `visual.tsx` (mapas, líneas de tiempo, diagramas, láminas), `sermonGrupo.tsx`, `guardarProgreso.tsx` | Usados por las pantallas |
| `src/estado/` | **Los 11 stores de zustand** que se persisten | `usuario.ts` (vidas, talentos, pasos, racha, lecciones, notas, resaltados, álbum…), `ajustes.ts` (tema, idioma, sonido, **plan**), `misiones.ts`, `repaso.ts` (cajas de Leitner), `habilidad.ts` (Elo por categoría), `copas.ts`, `agenda.ts`, `planes.ts`, `travesia.ts`, `propuestas.ts`, `vistas.ts` | Se guardan con `src/util/almacen.ts` |
| `src/datos/` | Lógica de dominio y **carga de contenido** (29 módulos) | `biblia.ts` (8 versiones, `cargarBiblia`), `leccion.ts` (Travesía), `espadeo.ts` (banco de trivia), `dificultad.ts` (dosificador), `copas.ts`, `puntaje.ts`, `nivel.ts`, `album.ts`, `traducciones.ts`, `legal.ts`, `versiculos.ts` | Importan `contenido/*.json` directamente |
| `src/util/` | **Toda la red y los servicios** (31 módulos) | `cuenta.ts` (Auth + cliente REST), `nube.ts` (respuestas y Pulso), `juntos.ts` (amigos, duelos, push, torneos), `grupos.ts`, `salas.ts`, `sermon.ts`, `respaldo.ts` (copia de progreso), `metricas.ts` (PostHog), `anuncios.ts`/`pausaAnuncio.ts`, `avisos.ts`, `guardia.ts`, `almacen.ts`, `interruptores.ts`, `moderacion.ts`, `perfil.ts`, `avatar.ts`, `lugares.ts` | Los módulos de red dependen de `cuenta.ts` |
| `src/i18n/` | Un solo archivo `textos.ts`: **2.494 claves** con texto en `es`, `pt` y `en` inline | `src/i18n/textos.ts` (`useT`, `t()`, `idiomaActual`) | Todas las pantallas |
| `src/lector/` | Motor del lector tipo libro | `paginar.ts`, `medir.tsx`, `texto.tsx`, `papel.tsx`, `Libro.tsx` (vuelta de hoja en hilo nativo), `marcas.ts` | `Lector.tsx` |
| `src/audio/` | Capa de audio | `motor.ts`, `motor.web.ts`, `respaldo.ts`, `fuentes.ts` (índice de los `.wav`/`.mp3`), `tipos.ts` | `src/sonido.ts` |
| `src/lany/` | «Director» de Lany y su voz (sílabas sin palabras) | `director.ts` (eventos con prioridad, enfriamiento y variedad), `voz.ts` | Las pantallas emiten eventos, no animan |
| `src/lany3d/` | Cargador del Lany Master 3D (apagado) | `cargar.ts`, `actor.js`, `diagnostico.ts` | `src/arte/Arte.tsx` |
| `src/arte/` | Íconos y dibujos | `Arte.tsx` (`Icono`, `Lany`, `Pieza`, `Logo`), `generado.ts`, `mapaBiblia.ts`, `mapaPablo.ts`, `fondosTravesia.ts` | `scripts/generar_arte.py` los genera |
| `src/widget/` | Widget de Android | `tarea.tsx`, `VersiculoWidget.tsx` | Registrado en `index.ts` |

### 3.3 Flujo de arranque, paso a paso

1. **`index.ts`** (el punto de entrada, `"main"` de `package.json`):
   1. Anota la hora de inicio en `globalThis.__sendaT0` (para medir cuánto tarda en mostrarse Inicio).
   2. **`import './src/util/guardia'`** es lo primero: instala el manejador global de errores de JS (`ErrorUtils.setGlobalHandler`) antes de
      que cargue cualquier otro módulo (`src/util/guardia.ts`, función `instalarGuardia`).
   3. Intenta `require('./App')` dentro de un `try/catch`. Si el **grafo de módulos revienta al cargar**, no se cierra la app: se
      muestra `PantallaFallo` con el error (`anotarFallo(e, 'carga')`).
   4. En Android registra el **widget** (`registerWidgetTaskHandler(tareaWidget)`), también dentro de un `try/catch`.
   5. Envuelve todo en `Guardia` (clase de React con `componentDidCatch`, `src/componentes/fallo.tsx`) y llama a `registerRootComponent`.
2. **`App.tsx`** (raíz) solo hace `export { default } from "./src/App"`.
3. **`src/App.tsx`**:
   1. `SplashScreen.preventAutoHideAsync()` mantiene la pantalla de arranque.
   2. Carga las 10 variantes de fuente con `useFonts`.
   3. **`useHidratado()`** espera a que `useUsuario` y `useAjustes` terminen de leer AsyncStorage (para no dibujar un tema o un estado
      equivocado).
   4. Cuando fuentes y datos están listos: oculta el splash, **precarga los sonidos esenciales** (`precargarEsenciales`), mide
      `app_abierta`, registra la apertura (`registrarApertura`: racha de días, «¡Volviste!», firma sonora).
   5. Si la bienvenida ya se vio, dispara en cadena: `despertarCuenta()` → `enviarTurnosPendientes()` → `enviarMarcasPendientes()` →
      `registrarPush()` → `cargarNovedades(true)`. También `cargarEventosNube()` y `reprogramarAvisos()` (notificaciones locales).
   6. Instala oyentes: toque de notificación (`escucharToques`), llegada de push (`escucharLlegadas`), enlaces `senda://unirme/CÓDIGO`
      (`Linking`), paso a segundo plano → `subirProgreso()`, y cada 10 minutos `subirProgreso()`.
   7. Dibuja el navegador: si la bienvenida no se vio, arranca en `Bienvenida`; si se vio, en `Tabs`.
4. **Pantallas por demanda:** salvo `Inicio`, todas las pantallas se declaran con `getComponent={() => require(...)}`. Así, al arrancar
   solo se evalúan los módulos que necesita Inicio (según `docs/PESO.md`: 72 módulos propios en vez de 158).

### 3.4 La guardia de fallos (cómo se ve que la app no se cierra en silencio)

- **Origen:** el APK 30 «se cerraba al abrir» y no se pudo reproducir; se instrumentó la app (comentario de cabecera de `index.ts`, prueba 31).
- **Tres frentes:**
  1. *Al cargar* (`index.ts`, `try/catch` sobre `require('./App')`) → `donde: "carga"`.
  2. *Al dibujar* (`Guardia`, `componentDidCatch`) → `donde: "dibujo"`.
  3. *En segundo plano / fuera de React* (`ErrorUtils.setGlobalHandler`) → `donde: "fondo"`; en la app instalada **un error fatal de JS no
     cierra la app** (`if (__DEV__ || !f.fatal) anterior?.(e, fatal)`).
- **Qué guarda:** `anotarFallo` escribe en AsyncStorage la clave `senda-ultimo-fallo` con mensaje, pila (14 líneas), dónde, cuándo y si
  fue fatal (`src/util/guardia.ts`).
- **Qué ve la persona** (`src/componentes/fallo.tsx`): título «Algo falló», el detalle, y tres botones: «Copiar el detalle»,
  «Reintentar» y «Borrar lo guardado y reintentar» (`borrarTodoLoGuardado` borra todas las claves que empiezan con `senda`). Es la única
  pantalla que **no depende** del tema, las fuentes, `textos.ts` ni el estado (sus textos están en los tres idiomas dentro del propio
  archivo), justo para que funcione aunque lo roto sea eso.
- **«Último fallo registrado»:** en Ajustes (`src/pantallas/Ajustes.tsx`, `ultimoFallo()`), para mandarlo aunque la app haya vuelto a abrir.
- **Límite importante:** esta guardia solo atrapa errores de JavaScript. Un cierre nativo (por ejemplo, un problema de R8 o de una
  librería nativa) **no pasa por acá**; para eso existe la prueba de humo en emulador (§12).

### 3.5 Navegación y pantallas principales

- **Estructura:** `createNativeStackNavigator` (pila de ~30 pantallas) con la pantalla `Tabs` que es un `createBottomTabNavigator` con
  barra propia (`src/componentes/TabBar.tsx`). Los tipos de rutas y parámetros están en `src/navegacion.ts` (`RaizParams`, `TabsParams`).
- **Cinco pestañas:** `Inicio`, `Biblia`, `Travesia`, `Jugar`, `Comunidad` (`src/App.tsx`, función `Tabs`).
- **Pantallas completas (pila):** `Lector`, `Leccion`, `Ajustes`, `Legal`, `Plan`, `Buscar`, `Calendario`, `Evento`, `Proponer`,
  `TriviaIglesia`, `Album`, `Amigos`, `Perfil`, `Avatar`, `Duelos`, `LetraTorneo`, `Torneos`, `Planes`, `Grupos`, `Grupo`, `Sala`, `Admin`,
  `AntesDespues`, `QuienEs`, `EnLaFrente`, `Letra`, `Historias`, `Linea`, `LanyLab`, `Anio`, `Copa`, `BibliaMas`, `Bienvenida`.
- **Enlaces profundos:** esquema `senda://` (`app.json`). Se interpreta `senda://unirme/CÓDIGO`: 8 letras = torneo, 6 = sala en vivo
  (`src/App.tsx`, `abrirEnlace`). `senda://auth` es el retorno del inicio de sesión con Google. Hay también una página
  `https://senda.pages.dev/u/?c=…` que abre la app (`web/u/`, `src/util/juntos.ts`, `urlUnirme`); el sitio todavía no está publicado según `docs/TIENDAS.md`.
- **Modo «demo» solo web:** `?demo=…` en la vista previa (`src/util/demoWeb.ts`, `src/util/juntosDemo.ts`) abre pantallas con datos de
  ejemplo. En el teléfono **no existe** (`Platform.OS !== "web"` lo apaga).

### 3.6 Cómo se cargan los datos de contenido

- **Formato:** archivos JSON en `contenido/`. Cada uno tiene `tipo`, `version`, `estado` por elemento (`borrador` → `en_revision` →
  `aprobada` → `publicada` → `retirada`) y los datos.
- **Dónde viven:** **dentro de la app**. No se consulta ninguna base para obtener una pregunta o una lección. Ejemplo:
  `src/datos/espadeo.ts` hace `import datos from "../../contenido/espadeo.json"` y filtra `BANCO` (todo menos `borrador` y `retirada`);
  `src/datos/leccion.ts` hace lo mismo con `contenido/travesia.json`.
- **Cómo se empaquetan:** Metro mete los JSON importados dentro del bundle de JavaScript, que se compila a bytecode Hermes. `docs/PESO.md`
  mide ese JS en 9,8 MB dentro de un APK de 89,1 MB (compilación del 23-10-2026, ESTIMACIÓN de qué baja el usuario real desde Play).
- **Biblias:** 8 archivos `.bib` (JSON compacto con libros/capítulos/versículos) en `assets/biblia/`, registrados como recursos
  (`metro.config.js` los trata como assets). `src/datos/biblia.ts` → `cargarBiblia(id)` los lee con `expo-asset` + `expo-file-system`, los
  parsea con `JSON.parse` y los guarda en una caché en memoria por versión. Versiones: `rv1909`, `nbv`, `pdt`, `bes` (español),
  `blivre`, `nbvpt` (portugués), `bsb`, `web` (inglés). Las versiones con derechos (RVR1960, NVI…) **no se empaquetan**: se abren en
  Bible.com con un enlace (`VERSIONES_BIBLECOM`).
- **Traducciones del contenido:** `contenido/traducciones/<idioma>/<ruta>.json`, registradas en `src/datos/traducciones.ts` (`INDICE`) con
  `require` **perezoso** (solo se lee cuando la app está en ese idioma). Una ruta se publica en un idioma solo si está **entera**.
- **Cómo se asegura la calidad:** `scripts/validar_contenido.py` (1.268 líneas) comprueba formato, ids únicos, respuestas en rango, que
  cada cita exista en la Biblia (RV1909) y que la «palabra clave» esté en el versículo; revisa también las traducciones contra la
  Biblia libre de cada idioma. Corre en el flujo del APK **antes de compilar** (`.github/workflows/apk.yml`) y a mano.
- **Contenido ≠ servidor, con una excepción:** la **respuesta correcta de cada pregunta del Espadeo se duplica en la base**
  (`preguntas_clave`) para que el servidor corrija duelos, copas, torneos y salas (ver §4 y §17).
- **La tabla `paquetes`** (contenido bajable sin pasar por la tienda) **existe en la base pero el cliente no la usa**
  (`grep "paquetes" src` solo devuelve comentarios). La actualización de contenido hoy requiere un APK nuevo.

### 3.7 Internacionalización (i18n)

- **Un único archivo** `src/i18n/textos.ts` con un objeto `TEXTOS` de **2.494 claves**; cada clave tiene `{ es, pt, en }` inline. La
  función `t(clave)` y el hook `useT()` eligen según `useAjustes().idioma` (`es` | `pt` | `en`).
- **Regla del proyecto:** ningún texto de pantalla escrito en español dentro del código; todo con su clave en los tres idiomas
  (`CLAUDE.md` del holding, prueba 37).
- **Idioma del contenido:** la interfaz y la Biblia cambian de inmediato; el contenido (Travesía, trivia) se publica traducido ruta por
  ruta (`src/datos/traducciones.ts`, `docs/TRADUCCIONES.md`). Español neutro con «tú» para la interfaz.
- **Mensajes de error de la base:** la base devuelve códigos cortos (`raise exception 'apodo_ocupado'`) y la app los traduce con
  `claveError()` → clave `juntos.err.<codigo>` (`src/util/cuenta.ts`).
- **Límite:** los **avisos push** que arma la base están escritos en español dentro del SQL (por ejemplo «Te toca jugar»). La columna
  `push_tokens.idioma` se guarda pero **no se usa** al enviar (`supabase/migrations/20261130000005_grupos_grandes.sql`, `enviar_avisos`).

### 3.8 Estado y persistencia local

- **Patrón:** cada «store» de zustand usa `persist(...)` con un almacenamiento propio, `almacen()` (`src/util/almacen.ts`), que **no
  escribe en cada cambio**: junta los cambios y los escribe de a lotes 400 ms después del primero, y los escribe en el acto al pasar la
  app a segundo plano (`AppState`). Motivo: marcar un versículo era lento (prueba 6).
- **Migraciones del estado local:** `useUsuario` está en versión 5 con una función `migrate` que convierte formatos viejos
  (`src/estado/usuario.ts`).
- **Claves de AsyncStorage** (todas empiezan con `senda-`; las saqué de `src/`): `senda-usuario`, `senda-ajustes`, `senda-travesia`,
  `senda-misiones`, `senda-planes`, `senda-repaso`, `senda-agenda`, `senda-habilidad`, `senda-copas`, `senda-vistas`, `senda-propuestas`
  (los 11 stores) y además: `senda-sesion` (tokens de Supabase), `senda-anonimo` (id aleatorio de métricas), `senda-cola-nube` (respuestas
  sin enviar), `senda-turnos-pendientes`, `senda-marcas-pendientes`, `senda-eventos-nube`, `senda-encuestas`, `senda-torneos-calendario`,
  `senda-novedades-avisadas`, `senda-terminados-vistos`, `senda-normas`, `senda-google`, `senda-avatar`, `senda-interruptores`,
  `senda-ultimo-fallo`, `senda-uso-hoy` y claves de cada juego (`senda-letra`, `senda-quien-es`, `senda-en-la-frente`,
  `senda-antes-despues`, `senda-desafio`, `senda-instrucciones`).
- **Qué hay dentro de `senda-usuario`** (`src/estado/usuario.ts`, tipo `Datos`): nombre, versión de Biblia, vidas y su recarga,
  `talentos`, `pasos`, `racha`, `leidos` (capítulos), `resaltados`, `notas`, `cintas`, `lecciones` (estrellas y fecha), `misiones`,
  `pulso`, `album`, `partidas`, `armaduras` y el `perfil` de la bienvenida (franja de edad, motivos, camino con Dios, dudas, meta).
  **«Tu camino con Dios» y las dudas nunca salen del teléfono** (comentario en el tipo `Perfil`; el evento `bienvenida_terminada` de
  métricas explícitamente no manda la respuesta sobre la fe).
- **Qué se copia a la nube y qué no:** ver §5 (copia con Google) y §13. Todo lo de `SOLO_ESTE_TELEFONO` (`src/util/respaldo.ts`) nunca viaja.

### 3.9 Reglas del juego que viven en el cliente

`src/tema.ts` → `reglas`: **5 vidas** gratis, **1 vida cada 30 minutos**, 1 video = 1 vida, leer devuelve hasta 3 vidas por día,
15 talentos por misión diaria, 10 (15 si perfecta) por lección, 5 por repaso, 50 por la «misión de la semana», sobre del álbum 40
talentos (el primero de cada página gratis), protector de racha 50 talentos (máximo 2), lámpara 10 talentos.
**Atención:** el `CLAUDE.md` de `senda-app` dice «3 vidas, se recupera 1 por hora» y cita `src/tema.ts` como fuente; el código dice 5 y
30 minutos. **El código manda; el documento está desactualizado** (anotado en §17).

### 3.10 Otras carpetas del repo que no son la app

| Carpeta | Qué es |
|---|---|
| `consola/` | Plantilla y escena 3D para armar la **Consola de Senda**, un panel del fundador publicado como artefacto de Claude (se arma con `scripts/consola.py`). No es parte de la app |
| `web/` | Sitio estático generado por `scripts/sitio_web.py`: política de privacidad, términos, «borrar cuenta», 66 guías de libros, `app-ads.txt`, `robots.txt`, `sitemap.xml`. Se publicaría en Cloudflare Pages (no publicado aún según `docs/TIENDAS.md`) |
| `rive/` | Fuente RML de Lany (`rive/lany/`) |
| `tienda/` | Capturas y gráfico para la ficha de Play |
| `difusion/` | Lote de videos y stickers de difusión (los `.mp4` no se versionan) |
| `material-ministerio/` | Material de un ministerio aliado (lectura de contexto, no se copia a la app) |
| `.claude/` | Configuración de Claude Code: un agente (`investigador-tecnologico`) y una skill (`herramientas`) |
| `auditoria-textos.json` | Informe de la auditoría automática de textos (592 KB) |

---

## 4. Backend: Supabase

### 4.1 Qué es y cómo se arma

- **Un solo proyecto de Supabase** (`senda`), sin staging. Supabase es Postgres + Auth + Storage + Edge Functions (Deno) + PostgREST (la
  API REST que se genera sola sobre las tablas y las funciones SQL). `supabase/config.toml` contiene solo `project_id = "senda"`: todo lo
  demás usa los valores por defecto del servicio.
- **Todo el esquema está en 42 archivos de migración** en `supabase/migrations/`, que se aplican con `supabase db push --remote
  --include-all` desde el flujo `.github/workflows/supabase.yml` (CLI fijada en la versión 3.0.0).
- **Los nombres de las migraciones usan fechas adelantadas**, no la fecha real de escritura: `20261101000000_juntos.sql` se escribió el
  24-10-2026 (lo dice su encabezado) y `20261130000008_torneos_enlace.sql` el 07-11-2026. Se hizo así para que queden ordenadas por
  detrás de todo (y por eso el flujo usa `--include-all`). Es una convención del proyecto, no un error.
- **Estado de la base real:** no puedo verificar desde el código si el proyecto vivo ya tiene todas aplicadas; `docs/CUENTAS.md` dice
  que las dos primeras se aplicaron el 06-10-2026 y el resto se aplica al subir a `main` (HECHO (doc)).
- **Extensiones usadas:** `pg_cron` (tareas programadas) y `pg_net` (llamadas HTTP desde SQL), creadas dentro de un bloque `DO` que no
  falla si no se pueden crear (`supabase/migrations/20261101000000_juntos.sql`).

### 4.2 Conteos reales (script sobre las migraciones, 2026-11-09)

| Cosa | Cantidad |
|---|---|
| Tablas en `public` | **41** |
| Tablas con `enable row level security` | **41 (todas)**; ninguna quedó sin RLS |
| Políticas RLS (`create policy`) | 76 (incluye 6 sobre `storage.objects`); varias se reemplazan en migraciones posteriores |
| Funciones SQL en `public` | 93 (114 ocurrencias de `security definer`; **ninguna** `security definer` sin `set search_path`) |
| Triggers | 14 |
| Vistas | 4: `mis_partidas`, `perfiles_publicos` (sin permisos desde la auditoría), `pulso_resultados`, `salud_preguntas` |
| Tareas `pg_cron` | 3 (una se reprograma: `senda_enviar_avisos` pasó de cada 5 min a cada minuto) |
| Funciones de borde | 3 (`borrar-cuenta`, `compras`, `trivia-sermon`) |
| Enums de Postgres | **0** (se usan `text` con `check (… in (…))`) |

### 4.3 Diccionario de datos (las 41 tablas)

Convención: «RLS» es la seguridad por fila. «Solo por funciones» significa que RLS está activo **sin ninguna política que deje leer o
escribir directo**: la app solo puede tocarlas llamando a una función `security definer` (o la clave de servicio, que se salta RLS).
Archivo de origen entre paréntesis (todos en `supabase/migrations/`).

#### Identidad y perfil

| Tabla | Propósito | Columnas principales | Relaciones | RLS |
|---|---|---|---|---|
| `perfiles` | Perfil público mínimo de cada cuenta | `id`, `nombre` (≤40), `apodo` (único sin importar mayúsculas), `codigo` (6 letras, lo genera un trigger), `pais` (2 letras), `lany` (jsonb <2 KB), `nivel` (1–999), `admin`, `visto`, `normas` (fecha), `buscable`, `vitrina` (jsonb <1 KB), `mostrar_vitrina`, `avatar` (jsonb <400 bytes validado por `avatar_valido`), `creado` (`20261026000000_inicio.sql`, `20261101000000_juntos.sql`, `20261111000000_novedades.sql`, `20261124000000_buscar_por_alias.sql`, `20261125000000_perfil_publico.sql`, `20261129000000_moderacion.sql`, `20261130000002_avatar.sql`) | `id` → `auth.users` (borra en cascada) | Cada uno ve **solo su propia fila**. La app solo puede escribir las columnas `id, nombre, pais, nivel, lany` al crear y `nombre, pais, nivel, lany, visto, vitrina, avatar` al actualizar (permisos por columna). `apodo`, `codigo`, `admin`, `normas`, `buscable` solo cambian por funciones |
| `push_tokens` | Token push de cada teléfono | `token` (PK), `usuario`, `plataforma` (android/ios/web), `idioma`, `actualizado` | `usuario` → `auth.users` | 4 políticas: cada uno ve/crea/actualiza/borra los suyos. Máximo 5 teléfonos por persona (lo recorta `guardar_token`) |
| `interruptores` | «Llaves» remotas para apagar funciones sin sacar APK nuevo | `clave` (`direcciones`, `anuncios`, `trivia_ia`), `activo`, `nota` | — | Todos pueden **leer**; escribir solo `cambiar_interruptor()` (administrador) (`20261130000000_interruptores.sql`) |

#### Amigos, duelos y notificaciones

| Tabla | Propósito | Columnas | Relaciones | RLS |
|---|---|---|---|---|
| `amistades` | Grafo de amigos | PK `(de, para)`, `estado` (pendiente/aceptada/bloqueada), `creada` | ambos → `auth.users` | Ver las propias; borrar las propias (el bloqueado no puede levantar el bloqueo). **Sin política de insertar ni actualizar**: todo por `agregar_amigo`, `agregar_amigo_id`, `responder_amistad`, `bloquear` |
| `partidas` | Duelo por turnos del Espadeo | `id`, `jugador_a`, `jugador_b`, `codigo` (único), `modo` (amigo/codigo/azar), `estado` (esperando/en_juego/terminada/vencida/cancelada), `turno_de`, `ronda`, `piezas_a`, `piezas_b` (arrays), `semilla`, `vence_en`, `ganador`, `creada`, `actualizada` | jugadores → `auth.users` | Ver las propias. Escritura solo por `crear_partida`, `unirse_partida`, `jugar_turno` |
| `jugadas` | Cada respuesta de un duelo | `cliente_id` (PK, idempotencia), `partida`, `jugador`, `ronda`, `pregunta`, `respuesta`, `acierto`, `segundos` | → `partidas` (cascada) | Ver las de mis partidas. Se escribe por `jugar_turno` |
| `preguntas_clave` | **La respuesta correcta de cada pregunta del Espadeo**, para corregir en el servidor | `id` (texto), `correcta` (0–3), `cat` (pieza), `nivel` | — | Solo por funciones. Se carga con migraciones **generadas** (`scripts/autor/preguntas_clave.py`) |
| `avisos` | Cola de notificaciones push a enviar | `id`, `usuario`, `titulo`, `cuerpo`, `datos` (jsonb), `enviar_desde`, `enviado` | → `auth.users` | Sin políticas: nadie la lee desde la app |
| `invitaciones_grupo` | Invitaciones pendientes a un grupo | PK `(grupo, usuario)`, `de`, `creada` | → `grupos`, `auth.users` | Solo por funciones (`invitar_a_grupo`, `responder_invitacion_grupo`) |

#### Grupos, eventos, encuestas

| Tabla | Propósito | Columnas | Relaciones | RLS |
|---|---|---|---|---|
| `grupos` | Iglesias, jóvenes, células, familias | `id`, `nombre` (2–60), `tipo`, `codigo` (único, **8 letras**), `pais`, `ciudad`, `creado_por` (nullable), `creado` | `creado_por` → `auth.users` (`on delete set null`) | Ver los grupos donde soy miembro. Cambios solo por funciones (`crear_grupo`, `editar_grupo`, `renovar_codigo_grupo`) |
| `miembros` | Quién está en cada grupo y con qué rol | PK `(grupo, usuario)`, `rol` (lider/ayudante/miembro), `desde`, `titulo` (texto libre ≤30) | → `grupos` (cascada), `auth.users` | Ver a los miembros de mis grupos. Roles, bajas y salidas **solo por funciones** (`cambiar_rol`, `sacar_miembro`, `salir_grupo`, `pasar_liderazgo`, `poner_titulo`) |
| `eventos` | Calendario: eventos «para todos» (los crea el administrador) y de cada grupo | `id`, `alcance` (senda/grupo), `grupo`, `tipo`, `titulo`, `detalle` (≤1000), `inicio`, `fin`, `datos` (jsonb <4 KB), `creado_por`, `creado` | → `grupos` | Los de alcance `senda` los ve **cualquiera, incluso sin cuenta**; los de grupo, sus miembros. Crear: administrador (Senda) o líder (grupo). Un trigger impide cambiar alcance, grupo o autor |
| `encuestas` | Encuesta del día (de Senda o de un grupo) | `id`, `alcance`, `grupo`, `pregunta` (5–160), `opciones` (2–6), `desde`, `hasta`, `creado_por` | → `grupos` | Las de Senda las ve cualquiera; las de grupo, miembros. Crea el administrador o el líder |
| `encuesta_votos` | Un voto por persona por encuesta | PK `(encuesta, votante)`, `opcion`, `creado` | → `encuestas` | Votar solo si la encuesta está vigente y puedo verla; ver solo mi voto |
| `encuesta_conteo` | Totales por opción (se suman con un trigger al votar) | PK `(encuesta, opcion)`, `total` | → `encuestas` | Totales visibles solo de encuestas visibles |

#### Copas, torneos y salas en vivo

| Tabla | Propósito | Columnas | Relaciones | RLS |
|---|---|---|---|---|
| `copas` | Copas de Senda con su ventana y **sus 15 preguntas fijas** | `id`, `desde`, `hasta`, `preguntas` (text[]) | — | Lectura pública. Se carga con `20261127000001_copas.sql` (generada por `scripts/autor/copas_preguntas.py`) |
| `copas_resultados` | La marca oficial de cada persona en cada copa | `cliente_id` (PK), `copa`, `usuario`, `puntos` (0–15000), `aciertos` (0–15), `ms`, `creado`; **único `(copa, usuario)`** | → `auth.users` | Ver la propia. Insertar solo por `marca_copa` |
| `torneos` | Torneos de grupo, entre amigos, «para todos», desafíos al azar | `id`, `grupo` (nullable), `nombre`, `desde`, `hasta` (máx. 14 días), `preguntas` (3–30), `semilla`, `fuente` (banco/sermon), `trivia`, `creado_por`, `juego` (trivia/letra/quien), `letras`, `propias`, `azar`, `abierto`, `codigo` (único, 8 letras), `creado` | → `grupos`, `trivias_sermon` | Ver si `puedo_jugar_torneo(id)`; los `abierto` los ve cualquiera. Se arman por `organizar_torneo`, `crear_torneo`, `lanzar_torneo_senda`, `desafio_azar` |
| `torneo_resultados` | Marca de cada persona en un torneo | `cliente_id` (PK), `torneo`, `usuario`, `puntos`, `aciertos`, `ms`; único `(torneo, usuario)` | → `torneos` | Insertar solo por `marca_torneo`; leer la tabla por `tabla_torneo()` |
| `torneo_invitados` | Invitados/anotados a un torneo | PK `(torneo, usuario)`, `estado` (pendiente/aceptada/rechazada) | → `torneos` | Ver mis invitaciones |
| `torneo_preguntas` | Preguntas escritas por quien arma un torneo, con su respuesta | PK `(torneo, n)`, `pregunta` (3–220), `opciones` (2–4), `correcta`, `ref` | → `torneos` | Solo por funciones. `preguntas_torneo()` devuelve las preguntas **con su respuesta correcta (`c`)** a quien puede jugar el torneo, porque el teléfono corrige en vivo |
| `nombres_biblicos` | **1.421 nombres de personas de la Biblia** para corregir «Nombres por letra» en el servidor | `clave`, `nombre`, `ref`, `conocido` | — | Lectura pública (`20261112000000_nombres_biblicos.sql`, generada) |
| `salas` | Sala en vivo (el líder proyecta, todos responden) | `id`, `codigo` (único, 6 letras), `anfitrion`, `grupo`, `fuente`, `trivia`, `semilla`, `preguntas` (3–30), `preguntas_ids`, `estado` (espera/pregunta/resultado/final/cerrada), `pregunta_actual`, `pregunta_desde`, `creada`, `cerrada_en` | → `grupos`, `trivias_sermon` | Ver la sala donde estoy o que anfitrioneo. El anfitrión la actualiza (estado y pregunta actual); un trigger (`salas_guardia`) impide tocar el resto y fija la hora de la pregunta con el reloj del servidor. **Crear solo con `abrir_sala`** |
| `sala_participantes` | Quién está en la sala y sus puntos | PK `(sala, usuario)`, `apodo` (1–20), `puntos`, `unido` | → `salas` | Ver mi sala. Alta por `unirse_sala`; los puntos solo los suma `responder_sala` |
| `sala_respuestas` | Respuesta de cada participante a cada pregunta | PK `(sala, usuario, pregunta)`, `opcion`, `ms`, `puntos` | → `salas` | Ver las de mi sala |

#### Trivia del sermón, planes y dinero

| Tabla | Propósito | Columnas | Relaciones | RLS |
|---|---|---|---|---|
| `trivias_sermon` | Trivias armadas con IA a partir del PDF de un sermón | `id`, `grupo`, `creado_por`, `titulo` (2–80), `semana`, `estado` (procesando/generando/revisar/lista/archivada/error), `preguntas` (jsonb), `nota`, `uso` (tokens gastados), `pdf_publico`, `creado`, `actualizado` | → `grupos` (cascada), `auth.users` (cascada) | Miembros ven solo las `lista`; el líder ve todas; crea solo si le quedan cupos (`trivias_disponibles()`) y como mucho 2 en espera. Un trigger limita qué puede cambiar el líder desde la app |
| `trivias_cobradas` | **Libro de cupo** de trivias (nadie lo borra), una fila por trivia armada | `trivia` (PK), `usuario`, `creado` | → `auth.users` | Revocado para la app; solo funciones/servidor |
| `suscripciones` | Plan de cada persona (premium/max) | `usuario` (PK), `plan`, `origen` (play/apple/regalo/prueba), `referencia` (token de compra), `desde`, `hasta` | → `auth.users` | Cada uno **lee** la suya; **solo la escribe el servidor** (función `compras` o `regalar_plan`) |
| `compras_play` | Un recibo de Google Play = una cuenta | `token` (PK), `usuario`, `producto`, `creado` | → `auth.users` | Revocado para la app |

#### Moderación y seguridad

| Tabla | Propósito | Columnas | RLS |
|---|---|---|---|
| `denuncias` | Denuncias de perfiles, grupos, eventos, torneos, salas, trivias y preguntas | `id`, `denunciante`, `tipo`, `objeto`, `motivo`, `comentario`, `copia` (lo denunciado en ese momento), `estado`, `creada`, `resuelta`, `nota` | Revocado: solo `denunciar()` (hasta 20/día) y, para el administrador, `denuncias_abiertas()`/`resolver_denuncia()` |
| `intentos_codigo` | Registro de códigos de grupo mal escritos (freno a la fuerza bruta) | `usuario`, `creado` | Revocado; lo usa `ver_grupo_codigo` (20 fallos/hora) |

#### Estadísticas, Pulso y contenido (anónimas)

| Tabla | Propósito | Columnas | RLS |
|---|---|---|---|
| `respuestas` | Respuestas del Espadeo/lecciones para calibrar dificultad | `id`, `anonimo` (uuid aleatorio del teléfono), `pregunta`, `nivel` (1–5), `acierto`, `segundos`, `cliente_id` (único), `creado` | **Insertar abierto** a `anon` y `authenticated` (`with check (true)`); nadie lee |
| `salud_resumen` | Resumen por pregunta (cuántas veces, aciertos, tiempo) que **un trigger suma al insertar** | `pregunta` (PK), `respuestas`, `aciertos`, `segundos_total`, `segundos_n`, `actualizado` | Sin políticas; se lee por la vista `salud_preguntas` (permiso para `anon`). **No encontré quién la lee** (ni la app ni `scripts/`) |
| `pulso_votos` / `pulso_conteo` | Pregunta diaria del Pulso: un voto por teléfono y conteo sumado | `(pulso, anonimo)` PK / `(pulso, opcion)` PK | Insertar abierto; leer los totales por la vista `pulso_resultados` |
| `propuestas_travesia` | Propuestas de travesías nuevas desde la app | `cliente_id` (único), `anonimo`, `area`, `nombre`, `temas`, `para_quien`, `fuentes`, `estado`, `creada` | Solo se puede insertar (estado `recibida`) |
| `progreso_nube` | **Copia del progreso del teléfono** (solo cuentas vinculadas con Google) | `usuario` (PK), `datos` (jsonb, ≤1,5 MB), `bytes`, `actualizado` | Revocado; solo `guardar_progreso()` y `leer_progreso()` (`20261130000006_progreso_nube.sql`) |

#### Tablas que existen pero la app no usa

- `reportes`, `propuestas`, `paquetes` y `progreso` (la versión vieja del respaldo): se crearon en `20261026000000_inicio.sql`; **el
  cliente no las toca** (`grep` en `src/`). `reportes` y `propuestas` aceptan inserciones anónimas pero nadie las envía; `paquetes` sería
  el canal de contenido sin pasar por la tienda; `progreso` fue reemplazada por `progreso_nube`.

### 4.4 Funciones SQL (RPC) agrupadas

Se llaman desde la app con `POST /rest/v1/rpc/<nombre>` (`src/util/cuenta.ts`, función `rpc`). Las 57 funciones que el cliente invoca
(cruzando por script los nombres de las funciones de las migraciones con las cadenas de `src/`) están en esta tabla:

| Área | Funciones | Qué hacen (resumen) |
|---|---|---|
| Identidad | `elegir_apodo`, `apodo_libre`, `aceptar_normas`, `ver_perfil`, `perfiles_de`, `buscar_personas`, `ser_buscable`, `mostrar_vitrina` | Alias único con sugerencia automática; normas; perfil público (nunca lo que lee); búsqueda por alias (≥3 letras, solo `buscable`) |
| Amigos | `agregar_amigo`, `agregar_amigo_id`, `responder_amistad`, `bloquear` | Pedido de amistad (si el otro ya había pedido, quedan amigos); tope de 100 pendientes; bloqueos |
| Duelos | `crear_partida`, `unirse_partida`, `jugar_turno` | Ver §7; `jugar_turno` es el corazón: corrige y avanza el turno |
| Grupos | `crear_grupo`, `mis_grupos`, `miembros_de`, `unirse_grupo`, `ver_grupo_codigo`, `cambiar_rol`, `sacar_miembro`, `salir_grupo`, `editar_grupo`, `renovar_codigo_grupo`, `poner_titulo`, `pasar_liderazgo`, `invitar_a_grupo`, `responder_invitacion_grupo`, `ya_en_grupo` | Topes: 5 como líder, 30 grupos por persona, 10.000 miembros por grupo |
| Torneos | `organizar_torneo`, `crear_torneo`, `lanzar_torneo_senda`, `anotarse_torneo`, `torneos_para_todos`, `unirse_torneo`, `enlace_torneo`, `desafio_azar`, `responder_torneo`, `preguntas_torneo`, `mis_torneos`, `tabla_torneo`, `marca_torneo` (esta última se llama dinámicamente desde `src/util/grupos.ts`) | Topes: 14 días, 5 torneos abiertos por persona (10 para todos), 3 por grupo |
| Copas | `marca_copa`, `tabla_copa` | Puntaje y tabla (ver §7) |
| Salas | `abrir_sala`, `unirse_sala`, `responder_sala` | La base cuenta los 20 s y puntúa |
| Sermón | `trivias_disponibles`, `reclamar_trivia` (la llama la función de borde), `trivias_en_espera` | Cupos y reserva |
| Notificaciones | `guardar_token`, `mis_novedades` | `mis_novedades` junta en un JSON lo que le espera a la persona (amistades, duelos donde le toca, invitaciones, torneos) |
| Progreso | `guardar_progreso`, `leer_progreso` | Copia en la nube (solo con Google) |
| Moderación | `denunciar`, `denuncias_abiertas`, `resolver_denuncia` | Cola del administrador |
| Administración | `regalar_plan`, `cambiar_interruptor` | Solo si `perfiles.admin` |
| Internas (la app no puede llamarlas) | `cerrar_vencidas`, `enviar_avisos`, `limpiar_viejo`, `tiene_max`, `corregir_partida`, `corregir_lista`, `corregir_letras`, `corregir_quien`, `letras_al_azar`, `apodo_de`, `codigo_nuevo`, `preparar_borrado` (la llama la función de borde con la sesión de la persona) | Revocadas a `anon` y `authenticated` en la auditoría (`20261127000000_seguridad.sql`, sección M1) |

Además hay funciones auxiliares de política (`soy_miembro`, `soy_lider`, `soy_admin`, `estoy_en_sala`, `puedo_jugar_torneo`,
`mi_rol`, `mi_plan`) y de validación (`texto_permitido`, `apodo_valido`, `avatar_valido`).

### 4.5 Triggers

| Trigger | Tabla | Qué hace |
|---|---|---|
| `respuestas_salud` | `respuestas` | Suma al resumen `salud_resumen` en cada respuesta (por eso leer es barato) |
| `pulso_votos_conteo`, `encuesta_voto_suma` | `pulso_votos`, `encuesta_votos` | Suman al conteo al votar |
| `perfil_codigo` | `perfiles` | Genera el código de amigo de 6 letras sin confundibles (sin O/0, I/1/L) |
| `perfiles_textos`, `grupos_textos`, `miembros_textos`, `eventos_textos`, `torneos_textos`, `sala_participantes_textos`, `trivias_sermon_textos` | varias | **Filtro de palabras** (español, portugués, inglés): si el texto no pasa, `texto_no_permitido`. En el campo `nombre` del perfil, si no pasa, se guarda vacío sin frenar |
| `eventos_fijos` | `eventos` | No deja cambiar alcance, grupo ni autor |
| `trivias_sermon_guardia` | `trivias_sermon` | Limita qué puede tocar el líder desde la app |
| `salas_guardia` | `salas` | Protege las columnas fijas; fija `pregunta_desde` con `now()` |

### 4.6 Índices y tareas programadas

- **Índices relevantes:** `perfiles_apodo_unico` (único sobre `lower(apodo)`), `copas_tabla (copa, puntos desc, aciertos desc, ms asc)`,
  `partidas_a/b/vencen/azar` (parciales por estado), `avisos_pendientes` (parcial donde `enviado is null`), `respuestas_creado`,
  `respuestas_cliente_id` (único, para idempotencia), `jugadas_partida`, `miembros_usuario`, `eventos_senda`, `eventos_grupo`.
- **`pg_cron`** (`supabase/migrations/…`):
  - `senda_enviar_avisos`: **cada minuto** (`20261130000005_grupos_grandes.sql`) → `enviar_avisos()`.
  - `senda_cerrar_vencidas`: cada 15 minutos → `cerrar_vencidas()` (duelos vencidos: gana el que jugó último; recordatorio a las 6 horas; cancela
    los «al azar» que nadie tomó en 3 días).
  - `senda_limpiar_viejo`: todos los días 07:17 UTC (04:17 en Buenos Aires) → `limpiar_viejo()`: borra respuestas de más de 30 días, cierra salas
    abiertas más de 6 horas y borra las cerradas a los 30 días, borra duelos terminados de más de 180 días y votos de encuestas cerradas
    hace 60 días (`20261109000000_limpieza.sql`).
- **Fuera de Supabase:** el flujo `.github/workflows/limpieza.yml` corre los **lunes 07:17 UTC** y borra del almacén los PDF de sermones
  huérfanos (`scripts/limpiar_sermones.sh`).

### 4.7 Almacén (Storage)

- **Un solo bucket privado `sermones`** (`20261120000000_sermon_pdf.sql`): límite 6.291.456 bytes por archivo (6 MB) y solo
  `application/pdf`. La ruta es `<id del grupo>/<id de la trivia>.pdf`. Políticas: solo el líder sube/reemplaza/borra; los miembros
  descargan **solo si** la trivia está `lista` y `pdf_publico` está prendido; el cliente pide un enlace firmado de **1 hora**
  (`enlacePdf` en `src/util/sermon.ts`).
- La creación del bucket está dentro de un `DO` que se salta si no existe el esquema `storage` (por eso la base de prueba de GitHub, un
  Postgres pelado, no lo prueba).

### 4.8 Funciones de borde (Edge Functions, Deno)

Se despliegan con `supabase functions deploy trivia-sermon compras borrar-cuenta` desde `.github/workflows/supabase.yml`.

| Función | Archivo | Qué hace | Cómo se invoca | Secretos que usa (nombres) |
|---|---|---|---|---|
| `trivia-sermon` | `supabase/functions/trivia-sermon/index.ts` | Recibe `{trivia, pdf (base64)}` o `{trivia, texto}`. Verifica sesión con `auth.getUser()`; revisa el interruptor `trivia_ia`; **reserva el cupo con `reclamar_trivia` antes** de gastar; extrae texto del PDF con `unpdf` (si no hay texto, manda el PDF a Claude); pide a Claude 8–12 preguntas en JSON (modelo por defecto `claude-opus-5-5`, con `max_tokens` 16000, pensamiento adaptativo, por streaming); valida el JSON (4 opciones distintas, `correcta` 1–4, mínimo 4 válidas); guarda en `trivias_sermon` estado `revisar` y anota tokens en `uso`. Si Claude falla antes de responder, **devuelve el cupo** | `POST /functions/v1/trivia-sermon` desde `subirSermon()` (`src/util/sermon.ts`), con el token de la persona | `ANTHROPIC_API_KEY`, `MODELO_TRIVIA` (opcional), claves de Supabase del entorno |
| `borrar-cuenta` | `supabase/functions/borrar-cuenta/index.ts` | (1) borra del almacén los PDF compartidos de las trivias de la persona; (2) llama `preparar_borrado()` con la sesión de la persona (ningún grupo queda sin líder); (3) borra el usuario con la clave de servicio, lo que dispara el borrado **en cascada** | `POST /functions/v1/borrar-cuenta` desde `borrarCuenta()` (`src/util/cuenta.ts`) | clave de servicio del entorno |
| `compras` | `supabase/functions/compras/index.ts` | Verifica un recibo de Google Play con la API Android Publisher (cuenta de servicio, JWT RS256), exige: producto exacto, suscripción vigente, **`obfuscatedExternalAccountId` = SHA-256 del id de la cuenta**, un recibo por cuenta (`compras_play`); reconoce (acknowledge) la compra; escribe `suscripciones` | **Nadie la invoca hoy** (ver §8) | `PLAY_CUENTA_SERVICIO`, `PLAY_PAQUETE` |

Notas verificadas:
- Las tres funciones usan `Deno.serve`, exigen `POST` y devuelven textos de error cortos; **no hay `deno.json` ni `config.toml` con
  `verify_jwt`**, así que rige el valor por defecto de Supabase (verificar el JWT) — INFERENCIA, el repo no lo fija.
- `trivia-sermon` es **síncrona**: la app espera en la misma petición mientras Claude responde (`peticion` no tiene timeout propio,
  `src/util/cuenta.ts`).
- No existe la función de borde «avisos» que mencionan comentarios de la migración `20261101000000_juntos.sql`: los avisos los envía la
  base con `pg_net` (ver §9).

### 4.9 Qué corre en el cliente y qué en la base

| Qué | Dónde | Evidencia |
|---|---|---|
| Mostrar contenido, lector, Travesía, Espadeo en solitario, dosificador de dificultad (Elo), repaso espaciado, vidas, racha, talentos, nivel, álbum, calendario personal, avisos locales | **Teléfono** | `src/estado/`, `src/datos/`, `src/util/avisos.ts` |
| «Duelo contra Lany» (turno de Lany simulado) | **Teléfono** | `src/datos/rival.ts` |
| Corregir un turno de duelo, decidir turnos/ganador/vencimientos | **Base** | `jugar_turno`, `cerrar_vencidas` |
| Puntaje de copas y torneos (con las respuestas y tiempos que manda el teléfono) | **Base** | `corregir_partida`, `marca_copa`, `marca_torneo` |
| Puntaje y tiempo de las salas en vivo | **Base** (el tiempo con `now()` del servidor) | `responder_sala`, `salas_guardia` |
| Validar alias, filtrar insultos, topes de grupos/torneos/amigos | **Base** | `elegir_apodo`, `texto_permitido`, funciones de grupos |
| Armar preguntas desde un PDF | **Edge + Claude** | `supabase/functions/trivia-sermon/index.ts` |
| Mandar push | **Base** (pg_net) → Expo → FCM | `enviar_avisos()` |
| Contar vidas, talentos, nivel | **Solo el teléfono** (la base no los conoce, salvo `perfiles.nivel` que el teléfono copia) | `src/util/cuenta.ts` (`entrar`) |

---

## 5. Cuentas e identidad

### 5.1 Cómo es el registro

- **No hay registro con correo ni contraseña.** La cuenta es **anónima**: se crea sola, sin pedir nada, la primera vez que la persona toca
  algo social (agregar un amigo, un rival al azar, unirse a un grupo, votar la encuesta). Es la función de «anonymous sign-ins» de
  Supabase Auth (`POST /auth/v1/signup` con cuerpo `{ "data": {} }`, en `llamarAuth("signup", …)`, `src/util/cuenta.ts`, función
  `asegurarCuenta`).
- **Condiciones previas** que el cliente exige: (1) que la bienvenida no haya marcado «Menos de 13» (`menor_13`); (2) que la persona
  acepte las **normas** (hoja `NormasGlobal`; `pedirNormas()` en `src/util/moderacion.ts`).
- **Quién debe activarlo:** el fundador tiene que prender «Anonymous sign-ins» en Supabase y bajar el límite de altas por IP
  (`docs/SEGURIDAD.md`, «Lo que queda»). Si no está prendido, la app muestra «todavía no disponible» (`desactivada`).

### 5.2 Cómo se crea y verifica la sesión

1. **Sesión:** Supabase devuelve `access_token` (JWT, dura ~1 hora), `refresh_token` y `user.id`. La app guarda
   `{access_token, refresh_token, expires_at, usuario}` en AsyncStorage bajo la clave **`senda-sesion`** (`guardarSesion`).
2. **Cada pedido** lleva dos cosas (`cabeceras()` en `src/util/cuenta.ts`): `apikey: <clave pública del proyecto>` y
   `Authorization: Bearer <access_token>`. La clave pública (`EXPO_PUBLIC_SUPABASE_ANON_KEY`) está **dentro de la app** a propósito; no es
   secreta. La inyecta el flujo de compilación (ver §11).
3. **Verificación del lado del servidor:** PostgREST valida la firma del JWT y expone el `sub` como `auth.uid()` dentro de las políticas RLS
   y de las funciones SQL. Las funciones de borde llaman `supabase.auth.getUser()`.
4. **Renovación:** `asegurarCuenta()` renueva con `POST /auth/v1/token?grant_type=refresh_token` cuando faltan menos de 60 segundos para
   vencer; `peticion()` reintenta **una vez** tras un `401`. Si el refresh token ya no sirve, **se descarta la sesión y la próxima vez se crea
   una cuenta nueva** (`sesion_vencida`): la cuenta vieja queda en la base «sin forma de entrar». Por eso importa «Guardar mi cuenta».
5. **Perfil:** `entrar()` (`src/util/cuenta.ts`) lee `perfiles?id=eq.<uid>`; si no existe, hace `POST /rest/v1/perfiles` con
   `{id, nombre, pais, nivel}`; el trigger `perfil_codigo` genera el código de amigo; después `elegir_apodo` (RPC) asigna un alias libre
   parecido al nombre de la bienvenida (o «Peregrino» + números), y se registra la versión de normas aceptada, se sube el avatar y la
   «vitrina» si cambiaron.

### 5.3 Qué es el alias, el código y qué no se guarda

- **Alias (`perfiles.apodo`):** único en todo Senda (índice sobre `lower(apodo)`), 3–20 caracteres (letras, números, espacio, `. _ -`),
  sin palabras reservadas (nada que contenga `senda`, `admin`, `soporte`, `moderador`, `oficial`, `staff`, `lany`; no «Jesús», «Dios»,
  «Cristo») y sin pasar el filtro de insultos. Lo elige la base con `elegir_apodo` (`20261111000000_novedades.sql`,
  `20261129000000_moderacion.sql`).
- **Código de amigo:** 6 letras en un alfabeto sin ambigüedades; sirve para que te agreguen. Los grupos y las salas usan códigos
  parecidos (grupos 8 letras; salas 6).
- **A la base nunca van** correo ni nombre real obligatorios: el «nombre» es el texto que la persona puso en la bienvenida (editable y
  filtrado). Solo si vincula Google, el correo queda en la tabla de Auth de Supabase (no en `perfiles`); la app lo lee para mostrar «con
  qué correo guardaste» (`estadoGoogle`).

### 5.4 Guardar y recuperar el progreso con Google

- **Guardar** (`vincularGoogle`): pide a Supabase `GET /auth/v1/user/identities/authorize` con PKCE (S256, `expo-crypto`) y
  `skip_http_redirect=true`; abre Google en el navegador (`expo-web-browser`); vuelve por `senda://auth` con un código; canjea con
  `POST /auth/v1/token?grant_type=pkce`. **Mismo `user.id`**: alias, amigos y grupos siguen. Requiere en Supabase: proveedor Google
  prendido, «Allow manual linking» y `senda://auth` en Redirect URLs (a cargo del fundador, `docs/SEGURIDAD.md`).
- **Qué se sube** (`src/util/respaldo.ts`): `armarCopia()` toma **todas las claves de AsyncStorage que empiezan con `senda`** excepto una
  lista de «solo de este teléfono» (sesión, colas, último fallo, interruptores…). Tope: 400.000 caracteres por clave y 1.400.000 en total.
  Se sube con `guardar_progreso(p_datos)`.
- **Cuándo:** al pasar la app a segundo plano y cada 10 minutos, **solo si cambió** (huella DJB2 de las claves); `src/App.tsx`.
- **Reglas en la base** (`20261130000006_progreso_nube.sql`): solo cuentas **no anónimas**; el dato debe ser un objeto JSON; máx. 1,5 MB;
  **no más de una escritura cada 10 segundos** (devuelve la fecha anterior si se repite).
- **Recuperar** (otro teléfono o reinstalar, `src/componentes/guardarProgreso.tsx`): «Entrar con Google» → `entrarConGoogle()` canjea el
  código **sin reemplazar la sesión aún** → `copiaDe(sesion)` (`leer_progreso`) muestra nivel, talentos y fecha de la copia → si la persona
  confirma, `aplicarCopia()` **reemplaza** lo local (borra claves que no estén en la copia, escribe las de la copia, rehidrata los stores).
- **Quién gana si hay progreso en los dos lados:** no hay fusión por campo. **Gana la copia que la persona elige traer**, reemplazando el
  teléfono. `docs/ESCALA.md` §6 proponía una fusión por campo («el mayor gana») que **no se implementó**.

### 5.5 Borrar la cuenta

Ajustes → «Tu cuenta» → «Borrar mi cuenta» (dos toques). Pasos: `borrarCuenta()` (`src/util/cuenta.ts`) → `POST /functions/v1/borrar-cuenta` →
la función borra los PDF compartidos, pasa los grupos que la persona lideraba solo al miembro más antiguo (primero un ayudante; si no queda
nadie, borra el grupo), y borra el usuario con la clave de servicio. La base borra **en cascada** perfil, amistades, avisos, tokens, duelos
jugados, marcas, votos, invitaciones, suscripción, copia de progreso y trivias (`20261128000000_borrar_cuenta.sql`); lo que creó para un
grupo (grupos, eventos, torneos, encuestas) **queda sin autor** (`creado_por` pasa a `null`). En el teléfono se borran la sesión y las claves
sociales y **se cambia el id anónimo de métricas** (`nuevoIdAnonimo`). Lo leído, notas y progreso de juego solo quedan en el teléfono (hay
otro botón, «Borrar mis datos»). Por la web: `web/borrar-cuenta.html` indica pedirlo **por correo**, manual (`contenido/legal.json`).

### 5.6 Qué dice `docs/SEGURIDAD.md` y qué verifiqué yo

- **Dice:** auditoría independiente del 07-11-2026, **14 ataques reproducidos y corregidos** (2 críticos, 4 altos, 5 medios, 3 bajos) en
  `20261127000000_seguridad.sql`; `bash pruebas/nube/correr.sh` pasa todos los pasos (hoy 186 según el doc; **conté 188 llamadas a `paso()`**
  en `pruebas/nube/recorrido.py`).
- **Verifiqué en el SQL:**
  - 41 de 41 tablas con RLS (script sobre todas las migraciones).
  - Todas las funciones `security definer` fijan `search_path = public`.
  - El permiso de `perfiles` es por columna (`revoke insert, update … grant insert (id, nombre, pais, nivel, lany)`), así nadie se pone
    `admin` (`20261111000000_novedades.sql`).
  - `eventos`: el trigger `eventos_fijos` y el `with check` impiden «subir» un evento de grupo a evento de Senda (C1).
  - `trivias_cobradas` + `reclamar_trivia` con `pg_advisory_xact_lock`: no se puede gastar sin techo la API de Claude (C2).
  - `compras_play`: un recibo por cuenta (A1, solo en la función `compras`, que no se invoca aún).
  - `perfiles_publicos` sin permisos y `perfiles_de()` solo con relación (A3).
  - Duelos: pieza = categoría de la pregunta, «Carga» de 3 aciertos, sin repetir preguntas, tope de 40 jugadas (A4).
  - Salas: 20 segundos y lista de preguntas guardadas por la base.
  - Tope de intentos de código de grupo (M3) y tamaños máximos (M4/M5).
- **Lo que el doc deja pendiente** (sección «Lo que queda»): Play Integrity, tope de pedidos de amistad por hora y límite de intentos en
  `unirse_partida`/`unirse_sala`/`agregar_amigo`, mover la sesión a `expo-secure-store`, secreto para la contraseña del almacén de
  claves, y bajar los límites de altas anónimas por IP en el panel de Supabase.
- **Observaciones mías** (no están en el doc): ver §17 (puntos 2 y 3: tiempos de copas autodeclarados y edad solo en el cliente).

---

## 6. Comunicación app ↔ Supabase

### 6.1 Cliente usado

- **No se usa `supabase-js`.** Todo es `fetch` directo contra la API de Supabase. Dos archivos concentran la red (regla del proyecto:
  «cada proveedor detrás de su módulo», `CLAUDE.md`):
  - `src/util/cuenta.ts`: sesión + cuatro funciones de acceso: `peticion(ruta, init)`, `rpc(nombre, args)`, `leer(tabla, consulta)`,
    `escribir(tabla, cuerpo, op)`, más `cabecerasArchivo` y `urlNube` para subir el PDF.
  - `src/util/nube.ts`: el canal **anónimo** (sin cuenta): respuestas del Espadeo, voto del Pulso y propuestas de travesías, con su
    propia función `cabeceras()` y solo la clave pública.
- **Endpoints que se usan** (todos bajo `EXPO_PUBLIC_SUPABASE_URL`):
  - `POST /auth/v1/signup`, `POST /auth/v1/token?grant_type=refresh_token|pkce`, `GET /auth/v1/user`, `GET /auth/v1/user/identities/authorize`,
    `GET /auth/v1/authorize`, `POST /auth/v1/logout` (`src/util/cuenta.ts`).
  - `GET|POST|PATCH|DELETE /rest/v1/<tabla>` (PostgREST) y `POST /rest/v1/rpc/<función>`.
  - `POST /functions/v1/borrar-cuenta` y `POST /functions/v1/trivia-sermon`.
  - `POST /storage/v1/object/sermones/<grupo>/<trivia>.pdf` y `POST /storage/v1/object/sign/sermones/…` (enlace firmado).
  - Tablas/vistas leídas directo (con RLS): `perfiles`, `amistades`, `mis_partidas`, `eventos`, `encuestas`, `encuesta_votos`,
    `encuesta_conteo`, `salas`, `sala_participantes`, `trivias_sermon`, `torneos`, `interruptores`, `pulso_resultados`.
- **Si no hay URL y clave**, la nube queda apagada: `NUBE_ACTIVA` y `CUENTAS_ACTIVAS` son `false` y la app funciona solo local
  (`src/util/nube.ts`, `src/util/cuenta.ts`).

### 6.2 Errores, reintentos y modo sin conexión

- **Errores de regla:** las funciones SQL lanzan `raise exception 'codigo_corto'`; `peticion()` toma `message` si es `^[a-z_]+$` y lo
  convierte en `ErrorCuenta(codigo)`. La pantalla lo traduce con `claveError()` a `juntos.err.<codigo>` (hay 53 códigos conocidos en
  la lista `CONOCIDOS`). Si la red falla: `ErrorCuenta("sin_senal")`.
- **Tres «bandejas de salida»** persistentes en AsyncStorage (idempotentes con un `cliente_id` generado en el teléfono):
  1. **Respuestas del Espadeo** (`src/util/nube.ts`): cola `senda-cola-nube`, tope 500 filas, lotes de 50, `POST /rest/v1/respuestas?on_conflict=cliente_id`
     con `Prefer: resolution=ignore-duplicates`. **Reintento con espera creciente y azar:** 5 s, 10 s, 20 s… hasta 10 min
     (`5000 * 2**(fallos-1)` × (0,5–1,5)). Se intenta a los 8–15 s de abrir y cada 45–55 s, y al pasar a segundo plano.
  2. **Turnos de duelo** (`src/util/juntos.ts`, `jugarTurno`): si falla por `sin_senal` o `error_nube`, el turno queda en `senda-turnos-pendientes`
     y se manda al abrir la app (`enviarTurnosPendientes`). Un error de regla (`no_es_tu_turno`, `partida_cerrada`) **no** se reintenta.
  3. **Marcas de copas y torneos** (`src/util/grupos.ts`): `senda-marcas-pendientes` (hasta 20), se mandan al abrir.
- **Lo demás no tiene cola:** si no hay señal al unirse a un grupo o aceptar un amigo, la acción falla y se muestra el error.
- **Datos guardados para ver sin red:** `useEventosNube` (eventos), `useNovedades` (lo último que llegó), `senda-interruptores`.
- **Idempotencia del servidor:** `jugadas.cliente_id` PK; `respuestas.cliente_id` único; `copas_resultados (copa, usuario)` único;
  `jugar_turno` devuelve la partida tal cual si ya vio ese `cliente_id`.
- **Validación de lo que llega:** solo `mis_novedades` pasa por **zod** (`leerNovedades`, descarta filas mal formadas). El resto se
  asume bien formado (se declaran tipos TS con `as`). Las reglas de `CLAUDE.md` piden validar todo con zod; **hoy se cumple en un solo
  punto** (anotado en §17).

### 6.3 Sincronización del progreso

Ver §5.4: copia completa (no incremental), por segundo plano y cada 10 minutos, solo con Google. La base **no** guarda el progreso de las cuentas
anónimas; para esas cuentas el teléfono es la única copia.

### 6.4 «Tiempo real»: cómo funciona de verdad

No hay WebSockets en el cliente. Todo «en vivo» es **sondeo (polling)**:

| Qué | Cada cuánto | Dónde |
|---|---|---|
| Novedades (duelos, amigos, invitaciones, torneos) en Inicio | al entrar y cada **45 s** mientras la pantalla está a la vista | `src/pantallas/Inicio.tsx` (~línea 308), `src/util/juntos.ts` (`cargarNovedades`, mínimo 30 s entre pedidos) |
| Sala en vivo | cada **2 s** mientras la pantalla de la sala está abierta (solo la fila de la sala durante una pregunta; la tabla se pide al cambiar de estado) | `src/pantallas/Sala.tsx`, `src/util/salas.ts` (`CADA_MS = 2000`, `verSala`) |
| Resultados de la encuesta del día | cada **8 s** mientras la tarjeta está a la vista | `src/componentes/encuestaDia.tsx` |
| Eventos de la nube | al abrir y como mucho cada 5 min | `src/util/eventosNube.ts` |
| Interruptores remotos | una vez por apertura (timeout 5 s) | `src/util/interruptores.ts` |

La migración agrega `salas`, `sala_participantes` y `encuesta_conteo` a la publicación `supabase_realtime`, pero **ningún código del cliente
se suscribe**. El plan de pasar las salas a Realtime está documentado como palanca futura (`docs/ESCALA.md` §5, `docs/CAPACIDAD.md` §4).

---

## 7. Progreso, puntos, coronas/copas, talentos, álbum, duelos y torneos

**Nota sobre «coronas»:** en el código no existe un objeto «corona» de juego. «corona» es el nombre de un sonido y un ícono. Lo que se
parece a una corona son las **copas** (`src/datos/copas.ts`, `src/pantallas/Copa.tsx`), las **estrellas de lección** y la **armadura
completa**. Los repaso uno por uno.

### 7.1 Tabla resumen: dónde vive cada cosa

| Concepto | Dónde se guarda y decide | Quién escribe | Archivos |
|---|---|---|---|
| **Talentos** (moneda que se gana y se gasta) | **Solo teléfono** (`senda-usuario.talentos`). No se venden nunca | `ganar()`, `gastarTalentos()`, `abrirSobreAlbum()` | `src/estado/usuario.ts` |
| **Pasos y nivel** | Pasos en el teléfono (`pasos`); el **nivel** se calcula de los pasos (`nivelDe`) y se **copia** a `perfiles.nivel` al entrar a la cuenta. Nunca baja | `ganar(talentos, pasos)` | `src/datos/nivel.ts`, `src/util/cuenta.ts` (`entrar`) |
| **Vidas** | Solo teléfono; recarga por tiempo (`vidasAhora`), por video o por leer | `perderVida()`, `ganarVida()` | `src/estado/usuario.ts`, `src/tema.ts` |
| **Racha** | Solo teléfono; se calcula del último día con Palabra, con «Día libre» y «Protectores» | `marcarPalabraHoy()` | `src/estado/usuario.ts` |
| **Estrellas de lección** | Solo teléfono (`lecciones[id] = {estrellas, fecha}`) | `terminarLeccion()` | `src/estado/usuario.ts`, `src/pantallas/Leccion.tsx` |
| **Piezas de la armadura** (Espadeo en solitario) | Teléfono; en duelos, **la base** | `ganarPieza` / `jugar_turno` | `src/pantallas/Jugar.tsx`, SQL |
| **Álbum de figuritas** | Solo teléfono (`album`); el resultado de cada sobre es aleatorio en el cliente (`sortearFigurita`); gasta Talentos | `abrirSobreAlbum()` | `src/estado/usuario.ts`, `src/datos/album.ts`, `src/datos/rareza.ts` |
| **Habilidad (dificultad)** | Teléfono, modelo tipo Elo por categoría | `registrar` | `src/estado/habilidad.ts`, `src/datos/dificultad.ts` |
| **Copas (puntos y puesto)** | **Base** (la marca oficial); copia local de la marca | `marca_copa()` | SQL, `src/pantallas/Copa.tsx` |
| **Torneos** | **Base** | `marca_torneo()` | SQL, `src/util/grupos.ts` |
| **Duelos** | **Base** | `jugar_turno()` | SQL, `src/util/juntos.ts` |
| **Salas en vivo** | **Base** | `responder_sala()` | SQL, `src/util/salas.ts` |
| **Vitrina del perfil público** (álbum, armaduras, copas) | Se calcula en el teléfono y se **sube** a `perfiles.vitrina`; la base suma los «duelos ganados» desde `partidas` | `subirVitrina()` | `src/util/perfil.ts`, `ver_perfil` |

**Consecuencia de diseño (HECHO):** la economía personal (talentos, nivel, vidas, racha) es **autoridad del cliente**. Un usuario que modifique
su teléfono puede darse talentos o nivel. Hoy no hay dinero en juego, y la base nunca usa esos valores para ranking oficial,
salvo `perfiles.nivel`, que se **muestra** (con tope 1–999) a amigos y en listas.

### 7.2 Paso a paso: terminar una lección de la Travesía (recompensa individual)

1. La persona responde la última pregunta: `avanzar()` en `src/pantallas/Leccion.tsx`.
2. `ganar(talentosFin, perfecta ? 20 : 15)`: `talentosFin` es 10 (lección), 15 (perfecta = todos aciertos y **sin usar Lámparas**) o 5 (repaso).
   Los pasos son 15 o 20.
3. Si no es repaso, `terminarLeccion(id, estrellas)`: guarda el máximo de estrellas y la fecha.
4. `medir("leccion_terminada", …)` (PostHog, solo si la persona no apagó estadísticas).
5. `completarMision("leccion")`: una vez por día suma `talentosPorMision` = 15 talentos y 10 pasos.
6. El store (`zustand persist`) marca el cambio y `almacen()` lo escribe en AsyncStorage 400 ms después o al pasar a segundo plano.
7. **Si la cuenta está guardada con Google**, la próxima subida (segundo plano o 10 min) copia el nuevo `senda-usuario` a `progreso_nube`.
   Si no, **no sale del teléfono**.

### 7.3 Paso a paso: una copa (la única «corona» con tabla de todos)

1. Las copas están en `src/datos/copas.ts` (`COPAS`: `adviento-2026` 19-12-2026, `pascua-2027`, `pentecostes-2027`); las **15 preguntas fijas** de
   cada una están en `contenido/copas_preguntas.json` y **la misma lista está en la base** (`copas.preguntas`,
   `supabase/migrations/20261127000001_copas.sql`), generadas ambas por `scripts/autor/copas_preguntas.py`.
2. En `src/pantallas/Copa.tsx` la persona responde 15 preguntas con 20 s cada una. El cliente calcula puntos de **muestra**
   (`puntosRespuesta` en `src/datos/puntaje.ts`: 1000 al instante, 500 al agotar el tiempo, 0 si falla) y guarda la marca local
   (`useCopas.guardarMarca`).
3. Al terminar, si es la partida oficial y hay cuenta: `guardarMarcaNube("copa", id, jugadas)` (`src/util/grupos.ts`) arma
   `[{pregunta, respuesta, ms}, …]` y llama `rpc("marca_copa", {p_copa, p_cliente_id, p_jugadas})`. Si no hay señal queda en la bandeja
   `senda-marcas-pendientes`.
4. **En la base** (`marca_copa`, `20261127000000_seguridad.sql`): (a) exige sesión; (b) exige que la copa esté abierta (`now() between desde and hasta`, si no
   `torneo_cerrado`); (c) se queda solo con las jugadas cuya pregunta esté en la lista fija; (d) `corregir_partida(jugadas, 20, 15)` corrige
   cada respuesta contra `preguntas_clave`, ignora repetidas, y calcula `round(1000 * (1 - (t/total)/2))` por acierto, con un **piso de 300 ms** por
   respuesta; (e) si la persona no tenía marca en esa copa, inserta en `copas_resultados` (**la primera partida es la oficial**; una restricción
   única `(copa, usuario)` lo garantiza); (f) devuelve `aciertos, puntos, ms, oficial`.
5. La tabla: `tabla_copa(p_copa, p_grupo, p_pais)` devuelve los 50 primeros y el puesto propio ordenando por puntos, luego aciertos, luego
   menor tiempo; el filtro por grupo exige ser miembro.
6. Si la persona reinstala, la copia local se pierde pero **la base ya
   tiene su marca oficial** (y rechazaría otra).

**Límite verificado:** el tiempo `ms` de cada respuesta lo **informa el teléfono** (en `corregir_partida` solo se acota a ≥300 ms y ≤ el total). Un cliente alterado
puede declarar 300 ms en cada respuesta y obtener el puntaje máximo de velocidad. La base sí impide responder preguntas ajenas, repetir o cobrar dos marcas.
En las salas en vivo, en cambio, **el tiempo lo mide la base** (`now() - pregunta_desde`).

### 7.4 Paso a paso: un duelo del Espadeo (`jugar_turno`)

1. **Crear:** `crearPartida(modo, rival?)` (`src/util/juntos.ts`) → `crear_partida(p_modo, p_rival)`. Modos: `amigo` (exige amistad aceptada), `codigo`
   (se comparte un código de 6 letras), `azar` (si hay una partida «esperando» de otra persona con turno jugado, se entra con `for update skip locked`; si no, se crea una con
   tu turno; `20261103000000_azar_primero.sql`). Tope: 20 partidas abiertas por persona (`tope_partidas`).
2. **Jugar un turno:** la persona responde preguntas «hasta fallar»; el teléfono junta `[{cliente_id, pregunta, respuesta, segundos, pieza}]` y llama
   `jugarTurno(partida, jugadas)` → `jugar_turno(p_partida, p_cliente_id, p_jugadas)`.
3. **En la base** (`20261127000000_seguridad.sql`): bloquea la fila (`for update`); si el `cliente_id` ya se vio, devuelve la partida (reintento);
   verifica que la partida esté abierta y que sea tu turno; máximo 40 jugadas; por cada jugada: corrige con `preguntas_clave`, descarta
   repetidas de esa partida (no suman pero no cortan), guarda en `jugadas`; **la pieza se gana solo con 3 aciertos de «Carga» y si la pieza es
   la categoría de la pregunta**; corta el turno en el primer error.
4. **Fin de turno:** si ya tenés 6 piezas → `terminada` y ganás; si la ronda llega a 25 → gana quien tenga más piezas; si no, pasa el turno al rival,
   `ronda+1`, `vence_en = now()+72 h`, y se inserta una fila en `avisos` («Te toca jugar»).
5. **Vencimiento:** `cerrar_vencidas()` (cada 15 min) marca `vencida` y da ganador al que jugó último; avisa 6 horas antes.
6. **Visualización:** `mis_partidas` (vista) y `mis_novedades()`; el cliente muestra «Te esperan» en Inicio.

### 7.5 Álbum, nivel y vitrina

- **Sobre del álbum:** `abrirSobreAlbum(pagina, candidatos)` filtra figuritas que no tenés este año, cobra 40 talentos (el primer sobre de cada
  página es gratis) y elige al azar con `sortearFigurita` (`src/datos/rareza.ts`), en el teléfono. La figurita dorada se logra con una pregunta.
  No hay compra con dinero real: `docs/TIENDAS.md` y `docs/ECONOMIA.md` lo afirman; el código solo gasta talentos.
- **Nivel:** `nivelDe(pasos)`: del nivel *n* al *n+1* hacen falta `100 + 50·(n−1)` pasos; nunca baja (`src/datos/nivel.ts`).
- **Vitrina pública:** el teléfono sube cuántas figuritas, armaduras y copas tiene (`perfil.ts`); no sube nada de lo leído. Cualquiera puede
  ocultarla (`mostrar_vitrina`).

### 7.6 Torneos y salas

- **Torneos** (`organizar_torneo`, `lanzar_torneo_senda`, `desafio_azar`, `unirse_torneo`): hasta 14 días, 3–30 preguntas, tipos trivia, «Nombres por letra» y «¿Quién es?»;
  corregidos por `corregir_partida`, `corregir_lista`, `corregir_letras` (con la tabla `nombres_biblicos`) y `corregir_quien`. En «¿Quién es?» la base **no tiene el
  tablero**; puntúa con lo que cuenta el teléfono (cuántas preguntas hizo y si acertó, con topes): «un juego entre conocidos, no una copa»
  (`20261122000000_desafios.sql`).
- **Salas** (`abrir_sala`, `unirse_sala`, `responder_sala`): el anfitrión controla la secuencia (PATCH a `salas` con `estado` y `pregunta_actual`);
  cada respuesta puntúa `500 + 500 × (1 − ms/20000)`; tope de personas: **10 sin Max** y **500 con Max** (la base mira `tiene_max(anfitrión)`).

---

## 8. Dinero: publicidad, planes y cobros

**Resumen honesto (lo más importante de esta sección):** hoy hay **publicidad implementada** (AdMob, con IDs de prueba hasta que existan los
reales). **No hay ningún cobro implementado de punta a punta**: existe el diseño de planes, tablas y una función de borde para verificar
recibos de Google Play, pero la app **no tiene código de compra** y el «plan» que ve el usuario es **un interruptor local** que se elige en
una pantalla de prueba.

### 8.1 Publicidad (AdMob): IMPLEMENTADO EN CÓDIGO

| Aspecto | Qué hace | Dónde |
|---|---|---|
| Librería | `react-native-google-mobile-ads` `^17.4.0` (Invertase, Apache-2.0) | `package.json`, `docs/ANUNCIOS.md` |
| Formatos | **Intersticial** (al terminar un juego o salir de una lección terminada) y **video con premio** (+1 vida, lo elige la persona) | `src/util/anuncios.ts` (`mostrarAnuncio`, `mostrarVideoConPremio`) |
| IDs de la app | En `app.json` están los **IDs de ejemplo públicos de Google** (`ca-app-pub-3940256099942544~…`, tanto Android como iOS) y `delayAppMeasurementInit: true`. El flujo del APK los reemplaza solo si existen las variables de GitHub `ADMOB_APP_ANDROID`, `ADMOB_INTERSTICIAL`, `ADMOB_PREMIO` | `app.json`, `.github/workflows/apk.yml` (paso «Anuncios (AdMob)») |
| IDs de bloque | `EXPO_PUBLIC_ADMOB_INTERSTICIAL` y `EXPO_PUBLIC_ADMOB_PREMIO` (no son secretos: viajan en la app). Si faltan, usa `TestIds` de Google y los anuncios dicen «Test Ad» (`ANUNCIOS_DE_PRUEBA = !ID_INTERSTICIAL`) | `src/util/anuncios.ts` |
| Cuándo hay anuncio | `tocaAnuncio()`: **no en las 2 primeras actividades del día** (`LIBRES_POR_DIA = 2`) y **como mucho uno cada 4 minutos** (`ESPERA_MS`); solo al terminar un juego o salir de una lección; **nunca** en la Biblia ni en medio de una lección. El estado está **en memoria**: al reabrir la app se reinicia la cuenta | `src/util/pausaAnuncio.ts`, `src/pantallas/Jugar.tsx` (~l. 623), `src/pantallas/Leccion.tsx` (~l. 179) |
| A quién | Nunca a menores de 13 (`edad() === "menos13"`); nunca con plan Premium/Max (`plan !== "gratis"`); **sin personalizar** (`requestNonPersonalizedAdsOnly: true`) y contenido «G» (`maxAdContentRating`); de 13 a 17 se marca `tagForUnderAgeOfConsent` | `src/util/anuncios.ts` (`opciones`, `preparar`) |
| Consentimiento | Formulario UMP de Google solo donde la ley lo exige (UE, Reino Unido, Suiza, algunos estados de EE. UU.); se pide recién al primer anuncio | `src/util/anuncios.ts` (`AdsConsent.gatherConsent`) |
| Apagado remoto | Interruptor `anuncios` de la tabla `interruptores` | `src/util/interruptores.ts` |
| Precarga | Al entrar a un juego o lección se deja un intersticial cargado | `precargarAnuncio()` |
| Web | La vista previa web muestra un cartel simulado de 5 s (`AnuncioDeMuestra`) | `src/componentes/anuncio.tsx`, `src/util/admob.ts` (devuelve `null`) |

**Brecha detectada (HECHO, código):** el flujo que arma el **AAB para Google Play** (`.github/workflows/aab.yml`) **no inyecta los IDs de AdMob**
(`grep -c ADMOB` da 0 en `aab.yml` y 8 en `apk.yml`). Un AAB construido hoy con ese flujo saldría con los IDs de prueba de Google
(anuncios «Test Ad», sin ingresos). Tampoco corre el validador de contenido ni las pruebas.

### 8.2 Planes y suscripciones: DISEÑO + BASE LISTA; APP NO CONECTADA

**Lo que existe:**

1. **Diseño** de tres planes (Gratis, Premium sin anuncios, Max con salas en vivo y trivia del sermón) con precios propuestos
   (Premium USD 2,49/mes en Latinoamérica; Max USD 5,99) en `docs/SUSCRIPCIONES.md`. **Está marcado como decisión pendiente del fundador
   (DEC-2026-10-24-4)**; los números son ESTIMACIONES con fuentes fechadas.
2. **Tablas y reglas en la base:** `suscripciones` (plan, origen, `hasta`), `compras_play` (un recibo por cuenta), funciones `tiene_max()`,
   `mi_plan()`, `trivias_disponibles()` (8 por mes con Max, 1 de prueba sin Max), tope de personas en salas (10 sin Max, 500 con Max)
   (`supabase/migrations/20261101000000_juntos.sql`, `20261104000000_topes_planes.sql`, `20261127000000_seguridad.sql`).
3. **Función de borde `compras`** (`supabase/functions/compras/index.ts`): verifica con la API Android Publisher y escribe la suscripción.
   Reconoce 4 productos: `senda_premium_mensual`, `senda_premium_trimestral`, `senda_max_mensual`, `senda_max_trimestral`.
4. **Regalo manual:** `regalar_plan(codigo, plan, dias)` (solo administrador) escribe `suscripciones` con origen `regalo`; hay un
   botón en `src/pantallas/Admin.tsx`. Sirve para iglesias piloto «mientras no estén las compras».

**Lo que NO existe (verificado):**

- **No hay código de compra en la app:** ni librería de billing en `package.json`, ni pantalla que lance el flujo de Google Play, ni
  llamada a `/functions/v1/compras` (`grep -rn "functions/v1" src` → solo `borrar-cuenta` y `trivia-sermon`).
- **El cliente nunca consulta `mi_plan()` ni la tabla `suscripciones`** (`grep` sin resultados en `src/`). Es decir, **aunque el fundador
  regale un Max con `regalar_plan`, la interfaz del teléfono no lo refleja**; solo cambian las reglas que aplica la base (cupos de trivia y
  tamaño de sala).
- **El «plan» que ve la persona es local:** `useAjustes().plan` (`"gratis" | "premium" | "max"`) en `src/estado/ajustes.ts`, que se
  cambia tocando «Probar» en la pantalla `src/pantallas/Planes.tsx`. Esa pantalla **dice de sí misma** «En esta versión de prueba eliges el
  plan acá» (`planes.modoPrueba` en `src/i18n/textos.ts`). Ese valor controla: sin anuncios, vidas ilimitadas y los textos de Torneos/Sala.
  **No hay nada que oculte ese selector en una versión de producción** (no hay `__DEV__` ni condición de compilación en `Planes.tsx`).
- **Faltan** (lo dicen los propios documentos): el aviso en tiempo real de Google (RTDN por Pub/Sub) para renovaciones y reembolsos
  (`docs/SEGURIDAD.md`, `supabase/functions/compras/index.ts` encabezado) y las cuentas de Play/AdMob.
- **Decisión del fundador:** lanzar con anuncios y **sin suscripciones**; cobrar suscripciones espera a la figura legal
  (`docs/SUSCRIPCIONES.md` §6; DEC-2026-10-25-2 solo monotributo).

### 8.3 Cobros en general

- No hay pasarela de pagos propia, ni Stripe, ni Mercado Pago (`grep` sin resultados). Google Play cobraría y Senda recibiría el recibo.
- **Talentos:** moneda interna que se gana jugando; **nunca se venden** (regla del producto, `docs/ECONOMIA.md`, `docs/TIENDAS.md` §5).
- **Álbum:** los sobres cuestan Talentos, no dinero (`src/estado/usuario.ts`, `abrirSobreAlbum`).
- **Los costos que sí paga el proyecto hoy** están en §14 (Supabase, PostHog, Claude para la trivia del sermón y para lotes de contenido).

---

## 9. Notificaciones

Hay **dos sistemas distintos**, con quién envía diferente:

### 9.1 Avisos locales (los programa el propio teléfono)

- **Quién:** `expo-notifications`, desde `src/util/avisos.ts`. **No hay servidor involucrado.**
- **Qué:** recordatorio de eventos propios (a la hora, 10 min, 1 hora o 1 día antes; las próximas 6 fechas si se repiten), copas que la
  persona marcó con la campana (noche anterior a las 19 h y mañana del día a las 10 h), eventos del calendario de Senda y de los grupos
  (una hora antes), y un recordatorio diario a la hora elegida (máximo uno por día; si ese día ya hubo Palabra, no se manda).
- **Cuándo:** `reprogramarAvisos()` **cancela todo y reprograma todo** (`cancelAllScheduledNotificationsAsync`): al abrir la app y cada vez que cambian eventos,
  recordatorio o el «hoy ya leí» (`src/App.tsx`, suscripciones de zustand con un retardo de 600 ms).
- **Canales de Android:** `eventos_v4`, `recordatorio_v4`, `senda_v4`; sonido propio `aviso_v4.wav` (declarado en el plugin
  `expo-notifications` de `app.json`, junto con ícono y color). Los canales viejos (`_v2`, `_v3`) se borran porque Android no deja cambiar el sonido de un canal creado.

### 9.2 Push remoto (Duelos, amigos, grupos, torneos)

1. **Registro del token** (`registrarPush` en `src/util/juntos.ts`): necesita `extra.eas.projectId` (está en `app.json`); si la persona ya dio
   permiso (o se lo pide al entrar a Amigos/Duelos/Jugar), llama `getExpoPushTokenAsync({ projectId })` → token de Expo → `rpc("guardar_token", …)`.
2. **Dónde se guarda:** tabla `push_tokens` (token PK, usuario, plataforma, idioma). Un teléfono = una cuenta (el token cambia de dueño si cambia
   de cuenta); máximo 5 por persona.
3. **Quién arma el mensaje:** funciones SQL que insertan en la cola `avisos`: `agregar_amigo`, `responder_amistad`, `crear_partida`, `unirse_partida`,
   `jugar_turno` («Te toca jugar», «Tu rival completó la armadura»), `cerrar_vencidas` («Te quedan 6 horas»), `invitar_a_grupo`,
   `responder_invitacion_grupo`, `anotarse_torneo`, `desafio_azar`, `regalar_plan`, `preparar_borrado`.
4. **Quién envía y cuándo:** la tarea `pg_cron` **`senda_enviar_avisos` cada minuto** ejecuta `enviar_avisos()`:
   - toma hasta **3.000 avisos** pendientes (`for update skip locked`);
   - agrupa los **iguales** (mismo título, cuerpo y datos, por hash `md5`) en pedidos de **100 tokens** (el máximo que admite Expo por pedido);
   - hace `net.http_post` a `https://exp.host/--/api/v2/push/send` con `sound: default` y `channelId: senda_v4`;
   - marca todo como enviado y **borra los enviados hace más de 7 días**.
5. **De Expo al teléfono:** Expo entrega por FCM (Firebase) en Android. La clave FCM V1 está cargada **en Expo** (`docs/EXPO_FIREBASE.md`); el `google-services.json` va en la app.
6. **En el teléfono:** `setNotificationHandler` muestra el banner aunque la app esté abierta; al **llegar** una push se vuelve a pedir
   `mis_novedades` (`escucharLlegadas`); al **tocarla** (`escucharToques`) se navega según `data` (`partida`, `pantalla`, `tipo`).
- **Lo que no hace (verificado):** no lee los «recibos» de Expo, así que los tokens inválidos no se limpian (solo se recortan a 5 por
  persona); el idioma del token se guarda pero **el texto del aviso es siempre español** (viene escrito dentro del SQL).
- **Hallazgo a confirmar en un teléfono:** `registrarPush` llama a `asegurarCuenta()` (`src/util/juntos.ts`) y se ejecuta en cada arranque si ya hay permiso de
  notificaciones (`src/App.tsx`). Como la bienvenida pide ese permiso para el recordatorio diario (`src/pantallas/Bienvenida.tsx` ~l. 499),
  **un adulto que aceptó avisos y nunca usó nada social podría ver la hoja de normas y recibir una cuenta anónima** al segundo arranque
  (INFERENCIA por lectura del flujo; `docs/CAPACIDAD.md` §4 planea justamente «avisos push sin cuenta» como mejora futura, lo que confirma que hoy el
  registro del token crea la cuenta).

---

## 10. Imágenes y archivos

| Tipo | Dónde se almacena | Evidencia |
|---|---|---|
| Íconos, logo, splash, favicon | **Empaquetados** en la app (`assets/*.png`, `assets/marca/`), generados por `scripts/generar_iconos.cjs` | `app.json`, `assets/` |
| Íconos de la interfaz, retratos de personajes, mapas, líneas de tiempo, diagramas, láminas animadas | **No son imágenes: son SVG/datos generados por código** y metidos en `src/arte/generado.ts`, `src/arte/mapaBiblia.ts`, `contenido/retratos.json`, `contenido/laminas.json`, `contenido/diagramas.json`; se dibujan con `react-native-svg` | `scripts/arte/*.py`, `src/componentes/visual.tsx` |
| Lany | `assets/lani/lani.riv` (Rive), `assets/lani/lany.glb` (3D, apagado), PNG de poses | `src/componentes/laniRive.tsx` |
| Sonidos y música | 102 archivos de sonido en `assets/sonidos/` (86 `.wav` y 15 `.mp3`; 17 MB en total) más `CREDITOS.md`; según los documentos la música es de Kevin MacLeod (CC BY 4.0) y los demás sonidos son propios o CC0 (`assets/sonidos/CREDITOS.md`, `docs/LEGAL.md`) | `src/audio/fuentes.ts` |
| Biblias | `assets/biblia/*.bib` (32 MB) | `src/datos/biblia.ts` |
| Fotos/láminas de dominio público para la trivia | **Ninguna hoy**: el registro `FOTOS` está vacío (se sacaron los grabados de Doré) | `src/datos/fotos.ts` |
| Avatares de perfil | **No hay archivos de imagen.** Se guarda en la base un objeto de <400 bytes (`perfiles.avatar`) con los nombres de las partes y **DiceBear lo dibuja en el teléfono** | `src/util/avatar.ts`, `supabase/migrations/20261130000002_avatar.sql` |
| Foto de portada de un evento propio | **Solo en el teléfono** (URI del archivo; no se sube) | `src/pantallas/Evento.tsx`, `src/datos/agenda.ts` |
| PDF del sermón | Viaja **una vez** (base64) a la función de borde, que lo lee y lo descarta. **Solo si el líder lo prende** (`pdf_publico`) queda en el bucket privado `sermones` (≤6 MB, enlaces firmados de 1 hora) | `src/util/sermon.ts`, `supabase/functions/trivia-sermon/index.ts`, `supabase/migrations/20261120000000_sermon_pdf.sql` |
| Sitio web | `web/` (HTML estático generado), pensado para Cloudflare Pages | `scripts/sitio_web.py` |

**No hay CDN de imágenes ni subida de fotos de usuario** (más allá del PDF). El «arte generado» son scripts Python que producen SVG/JSON a
partir de reglas: `scripts/arte/` (7.190 líneas), `scripts/generar_arte.py`.

---

## 11. Publicación y actualizaciones

### 11.1 Cómo se arma la app (sin EAS Build)

- **Se compila en GitHub Actions** con `expo prebuild --platform android --no-install` (genera la carpeta `android/` en el momento) y
  `./gradlew assembleRelease` (APK) o `bundleRelease` (AAB). **No se usa EAS Build** (ningún flujo llama a `eas`); `eas.json` existe para
  iOS más adelante.
- **Perfiles de `eas.json`:** `prueba` (distribución interna, canal `prueba`, iOS dispositivo), `produccion` (`autoIncrement: true`, canal
  `produccion`, Android `app-bundle`, iOS `m-medium`), y `submit.produccion` (Android pista `internal`). `cli.appVersionSource` es `remote`.
  Como las compilaciones no pasan por EAS, **`autoIncrement` y `appVersionSource` no tienen efecto hoy**.
- **Versionado real:** `app.json` tiene `version: "0.40.0"` y `android.versionCode: 41` **fijos**. El número de «prueba» se escribe en
  `src/compilacion.json` en cada armado de APK (`{"prueba": N, "fecha": …}`; N = número de la corrida de GitHub o el que se pase a mano) y se muestra en Ajustes
  y en la pantalla de fallo (`VERSION_SENDA` en `src/componentes/fallo.tsx`). **Ningún flujo sube `versionCode`**: Google Play exige uno mayor
  en cada AAB, así que habrá que subirlo a mano antes de cada envío (anotado en §17).

### 11.2 Los 10 flujos de GitHub Actions (`.github/workflows/`)

Solo **dos** se disparan solos; los otros ocho son manuales (`workflow_dispatch`).

| Flujo | Disparador | Qué hace | Salida |
|---|---|---|---|
| `apk.yml` «APK de prueba» | Manual (entradas: nota, número, publicar, `r8`, `emulador`) | Libera disco, instala Node 22/Java 17, `npm ci`, escribe `src/compilacion.json`, **corre el validador de contenido, la prueba de arranque (Jest) y la prueba de la base**, despierta Supabase, inyecta claves públicas (`EXPO_PUBLIC_*`) y AdMob, `expo prebuild`, R8 opcional, `assembleRelease` solo **arm64-v8a** (con `emulador` suma x86_64), imprime el peso por parte | **GitHub Release «prerelease»** `prueba-N` con `senda-prueba-N.apk` |
| `aab.yml` «AAB para Google Play» | Manual | Como arriba pero **sin validadores ni pruebas ni AdMob**; firma con la clave de carga si están los 4 secretos (si no, firma de depuración con aviso); `bundleRelease` todas las arquitecturas | Artefacto privado `senda-N.aab` (30 días); se sube a Play **a mano** |
| `firma.yml` «Clave de firma (una vez)» | Manual (la contraseña es una **entrada** del flujo) | Genera el almacén de claves RSA 2048 válido 30 años con `keytool` | Artefacto privado (7 días) con el `.keystore`, su base64 y un LEEME |
| `supabase.yml` «Base de datos (Supabase)» | **Automático**: `push` a `main` que toque `supabase/migrations/**` o `supabase/functions/**`; y manual | Job `probar`: Postgres local + `pruebas/nube/correr.sh`. Job `migrar` (solo si pasó): `supabase link`, `db push --remote --include-all --yes`, `functions deploy trivia-sermon compras borrar-cuenta` | Base y funciones actualizadas |
| `supabase-despertar.yml` | Manual | Si el plan gratis pausó el proyecto, lo reactiva (`scripts/supabase_despertar.sh`) | — |
| `limpieza.yml` | **Automático**: lunes 07:17 UTC; y manual (por defecto «solo listar») | Borra del almacén los PDF de sermones sin trivia (`scripts/limpiar_sermones.sh`) | — |
| `humo.yml` «Prueba de humo» | Manual | Compila para x86_64 (con R8 por defecto), levanta un **emulador Android 34**, instala, abre la app, pasa la bienvenida, recorre las 5 pestañas y **falla si el proceso muere, si aparece «Algo falló» o si logcat trae errores de clase Java** | Artefacto `humo` (capturas, logcat, `gfxinfo`) |
| `lotes.yml` «Lotes de Claude» | Manual | Corre `scripts/lotes/claude_lotes.py` (API de lotes de Anthropic: traducciones y revisión de contenido) | Borradores en `contenido/borradores/` en la rama `lotes` |
| `biblias.yml` | Manual | Baja Biblias libres de eBible (`scripts/biblias.py`) y **hace commit y push** | Archivos nuevos en `assets/biblia` |
| `candidatos.yml` | Manual | Baja candidatos de sonido y voces libres | Rama `candidatos` |

**Secretos y variables que usan los flujos** (nombres, no valores): `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`,
`POSTHOG_KEY`, `ANTHROPIC_API_KEY`, `ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`; variables
`ADMOB_APP_ANDROID`, `ADMOB_INTERSTICIAL`, `ADMOB_PREMIO`.

### 11.3 Firma y tipos de archivo

- **APK de prueba:** sale con la clave de **depuración** que genera Expo por defecto (lo dice `docs/PRUEBAS.md`): sirve para instalar en
  teléfonos de prueba, **no para Play**. Como todas las pruebas usan la misma firma, cada APK se instala encima del anterior conservando los datos.
- **AAB de producción:** firmado con la **clave de carga** (`firma.yml` la crea; vive en secretos de GitHub). Google Play guarda la clave
  final (Play App Signing). La contraseña del almacén se escribe como entrada del flujo `firma.yml` (el propio `docs/SEGURIDAD.md` marca
  pasarla a secreto como pendiente).
- **R8** (achicar el código Java/Kotlin y recursos): `scripts/android_r8.sh` agrega `android.enableMinifyInReleaseBuilds=true` y reglas
  `-keep` para Rive, Nitro, audio, widget y GL. En `apk.yml` está **apagado por defecto** (`r8: false`); en `humo.yml` **encendido por defecto**.
- **Peso** (según `docs/PESO.md`, ESTIMACIÓN/medición del 23-10): APK de 89,1 MB (arm64); con R8 el APK 37 pesó 87,1 MB.

### 11.4 Cómo llega una versión nueva al teléfono

| Camino | Pasos |
|---|---|
| **Hoy (pruebas)** | Alguien dispara `apk.yml` → GitHub arma el APK → publica un Release «Senda · prueba N» → la persona abre `github.com/…/releases` desde el teléfono, baja el APK y lo instala encima (Android pide permitir orígenes desconocidos). **No hay actualización automática** |
| **Producción (previsto)** | `aab.yml` → se baja el AAB → se sube a mano a Play Console → prueba cerrada (12 testers, 14 días) → producción → Google Play actualiza las instalaciones |
| **Actualizaciones por aire (OTA)** | **No existen** (ver §2). Cambiar contenido (una pregunta, una lección) **exige un APK/AAB nuevo**, salvo lo que ya vive en la base |
| **Cosas que sí cambian sin APK** | (1) **Interruptores** de la tabla `interruptores` (apagar anuncios, direcciones, trivia con IA); (2) todo lo que dependa de **funciones SQL** (reglas de duelos, topes, filtros); (3) contenido social (eventos y encuestas del administrador) |
| **Sin versión mínima** | No existe un control de «versión mínima soportada». Una migración que cambie la firma de una función puede romper APK viejos (ver §17) |

---

## 12. Calidad y detección de errores

### 12.1 Pruebas automáticas

| Prueba | Qué cubre | Dónde corre | Archivo |
|---|---|---|---|
| **Arranque en Node** | Carga **todo el grafo de módulos** de la app con el preset de Android (Jest + `jest-expo/android`, con 16 `jest.mock` que simulan módulos nativos) y **dibuja `Inicio` con un estado guardado** como el de una persona que ya usó la app. **10 pruebas en total** (6 de arranque y 4 de datos): también la bienvenida en instalación nueva, que una clave de traducción inexistente no revienta, que la guardia atrape un error al dibujar, que un evento guardado con tipo viejo no rompa, `leerNovedades` (zod descarta filas malformadas), el director de Lany (prioridad y enfriamiento) y el avatar (convierte v1, valida v2) | `apk.yml` (antes de compilar) y `npm run prueba:arranque` | `pruebas/arranque/arranque.test.tsx`, `datos.test.tsx`, `jest.config.js` |
| **La base completa** | Crea un Postgres con lo mínimo de Supabase (`pruebas/nube/supabase_minimo.sql`: roles `anon`/`authenticated`/`service_role`, `auth.users`, `auth.uid()`, un simulador de `pg_net`), aplica **todas** las migraciones y recorre amigos, duelos, grupos, eventos, encuestas, torneos, copa, sermón y salas **como lo hace la app** (rol + `sub` del token). **~188 comprobaciones** (llamadas a `paso()`; el doc dice 186), incluidos los 14 ataques de la auditoría que deben fallar | `apk.yml` y `supabase.yml` (job `probar`), o `bash pruebas/nube/correr.sh` | `pruebas/nube/recorrido.py`, `correr.sh` |
| **Prueba de humo** | App real en un emulador Android: no se cierra, no muestra el fallo, logcat sin errores de clase | `humo.yml` | `scripts/humo_emulador.sh` |
| **Validador de contenido** | Formato, ids, citas existentes, palabra clave en el versículo, huecos de las traducciones contra la Biblia de cada idioma, voseo prohibido, glosario | `apk.yml` y a mano | `scripts/validar_contenido.py` |
| **Auditoría de textos** | Playwright sobre la vista previa web (360×800, letra normal y 1,2×): textos que se pisan, se salen del cuadro o quedan tapados; recorre pantallas, portadas de lecciones y preguntas del Espadeo | A mano antes de cada APK | `scripts/auditoria/textos.cjs`, `scripts/arte/medir.py`, `auditoria-textos.json` |

**Lo que no prueba nada de esto:** las funciones de borde (se «prueban con la base viva», `pruebas/nube/recorrido.py` docstring), las push de
Expo, las compras, AdMob real, ni el comportamiento en dispositivos físicos. No hay prueba de carga (planificada en `docs/ESCALA.md` §7).

### 12.2 Validadores de contenido de autoría (`scripts/autor/`)

Cada lección o pregunta nace de un script Python y pasa reglas automáticas **antes de entrar**:
`scripts/autor/principio.py` (ningún nombre se pregunta antes de presentarse; ficha del personaje), `scripts/autor/glosario.py` (glosario automático),
`scripts/autor/trivia_taller.py` (reglas de las preguntas nuevas: versículo no repetido en otro banco, la correcta no se adivina por el largo,
citas entre «» solo textuales), `scripts/autor/versiones_por_versiculo.py` (qué versión libre usar por versículo), y
`scripts/lotes/incorporar.py` (lo que devuelven los lotes de Claude entra **solo si pasa el validador**).

### 12.3 Detección de errores en producción

- **Guardia de fallos** (§3.4): captura errores de JS en carga, dibujo y segundo plano; los guarda y muestra «Último fallo registrado» en Ajustes.
  **Todo queda en el teléfono**; la persona lo copia y lo manda por correo (`appsenda.ok@gmail.com`). **No hay envío automático de errores.**
- **PostHog** (sin SDK, HTTP): se mandan eventos de uso, **no errores**. Ver abajo.
- **Logs de funciones de borde:** `console.error` dentro de las funciones, que quedan en el panel de Supabase (nunca en la app).
- **Sentry/Crashlytics/Firebase Analytics:** no hay (ver §2). Esto es una decisión implícita: privacidad y costo; la consecuencia es que un fallo
  nativo (que no pasa por la guardia de JS) en el teléfono de un usuario **no se entera nadie** salvo que lo cuente.

### 12.4 Métricas (telemetría) con PostHog

- **Cómo:** `src/util/metricas.ts`, `medir(evento, props, {muestra})`. Cola en memoria; se envía cada 30 s, al llegar a 20 eventos y al
  salir de la app, por `POST <host>/batch/`. Si falla, reencola hasta 200 eventos.
- **Qué lleva cada evento:** `distinct_id` (un uuid aleatorio guardado en `senda-anonimo`, nunca un nombre ni correo), `plataforma`,
  `version_app` (constante `VERSION_METRICAS = "0.13"`, **no** cambia con cada compilación), `$geoip_disable: true`.
- **Eventos (60+ nombres):** `app_abierta`, `capitulo_leido` (sin libro ni capítulo), `ejercicio_respondido` (con **muestra 1 de cada 10**), `leccion_terminada`,
  `pieza_ganada`, `duelo_creado`, `sala_abierta`, `sermon_subido`, `plan_prueba`, etc. (`grep medir(` en `src/`).
- **Control del usuario:** Ajustes → «Estadísticas anónimas». **Por defecto está encendido** (`estadisticas: true`); en la bienvenida se
  apaga si eligió «Menos de 13».
- **Quién las lee:** PostHog (plan gratis, 1 millón de eventos por mes según `docs/COSTOS.md`). Los tableros se arman a mano (`docs/CUENTAS.md` §4).
- **Respuestas del Espadeo a Supabase:** además de PostHog, **cada** respuesta va entera a la tabla `respuestas` (con un `anonimo` aleatorio) para
  calcular la «salud» de cada pregunta; `MUESTRA_RESPUESTAS = 1` en `src/util/nube.ts` es la palanca para bajarla. **No encontré en este repo
  ningún lector de `salud_preguntas`** (ni la app ni los scripts); `docs/DIFICULTAD.md` dice que lo usaría la Consola.

---

## 13. Seguridad: qué protege qué

| Capa | Qué protege | Cómo | Evidencia |
|---|---|---|---|
| **RLS en las 41 tablas** | Que cada persona vea y toque solo lo suyo o lo de sus grupos | Políticas por `auth.uid()`; lo sensible, **sin ninguna política** (solo funciones) | `supabase/migrations/*.sql`; auditoría `docs/SEGURIDAD.md` |
| **Permisos por columna** | Que nadie se marque administrador ni cambie su alias/código a mano | `grant insert/update (columnas)` sobre `perfiles` | `20261111000000_novedades.sql` |
| **Funciones `security definer`** con `search_path` fijo | Que las reglas de negocio las decida la base, no el teléfono | De las 93 funciones de `public`, las de reglas son `security definer` (114 ocurrencias) y ninguna sin `search_path`; `revoke execute … from public, anon` en las internas | `20261127000000_seguridad.sql` |
| **Idempotencia** | Que un reintento no duplique | `cliente_id` único en respuestas, jugadas y marcas | §6.2 |
| **Limitación de tasa / topes (en SQL)** | Abusos | `intentos_codigo` (20 fallos/hora), `denunciar` (20/día), `agregar_amigo` (100 pendientes), `guardar_progreso` (1/10 s), partidas abiertas (20), grupos (5 líder/30 total), torneos, 40 jugadas por turno, tamaños máximos en `perfiles`, `eventos`, `progreso`, etc. | migraciones citadas |
| **Moderación** | Contenido ofensivo | Filtro de palabras en triggers; normas aceptadas; denunciar/bloquear; cola del administrador; alias sin «senda/admin/oficial/…» | `20261129000000_moderacion.sql`, `src/util/moderacion.ts` |
| **Costos de IA** | Que nadie gaste sin techo la API de Claude | `trivias_cobradas` (libro inborrable) + `reclamar_trivia` (con candado `pg_advisory_xact_lock`) **antes** de llamar a Claude; máximo 2 en espera; interruptor `trivia_ia` | `20261127000000_seguridad.sql`, `supabase/functions/trivia-sermon/index.ts` |
| **Almacén privado** | PDF de sermones | Bucket no público, solo líder sube, miembros descargan con enlace de 1 hora | `20261120000000_sermon_pdf.sql` |
| **Secretos** | Claves | **Nunca van en el repo.** Las de GitHub viven en *Secrets/Variables*; las de las funciones de borde, en *Edge Functions → Secrets* de Supabase; la clave FCM V1, en Expo | `docs/CUENTAS.md`, `docs/EXPO_FIREBASE.md` |
| **Lo que sí viaja dentro de la app (público por diseño)** | — | URL del proyecto de Supabase, clave «publishable»/«anon», clave de PostHog, IDs de AdMob, `google-services.json`, `projectId` de Expo | `.github/workflows/apk.yml`, `app.json` |
| **R8 (ofuscación Java)** | Hace más difícil leer el código nativo | Opcional (`scripts/android_r8.sh`); **no ofusca el JavaScript** (el bundle Hermes incluye todo el contenido y las reglas del cliente) | `docs/PESO.md` |
| **Privacidad (documento)** | Información al usuario | `contenido/legal.json` es la **fuente única**; se muestra en la app (`src/datos/legal.ts`, `src/pantallas/Legal.tsx`) y en el sitio (`web/privacidad.html`, `terminos.html`). Versión 1.1 / 1.0 del 07-11-2026 «para revisión de un abogado»; el nombre del responsable **está vacío** (`responsable.nombre: ""`) | `contenido/legal.json`, `docs/TIENDAS.md` §7 |
| **Menores de 13** | Reducir riesgo | Sin cuenta, sin anuncios, sin estadísticas, sin amigos/grupos/salas. **Solo lo aplica el cliente** según lo que declaró la persona | `src/util/cuenta.ts`, `src/util/anuncios.ts`, `src/pantallas/Bienvenida.tsx` |
| **Permisos de Android** | Mínimo | Se bloquea `RECORD_AUDIO`; ubicación solo al tocar un botón; fotos solo si se elige una; audio sin permisos | `app.json` |

**Qué datos se guardan de la persona** (según el código):
- **En el teléfono (nunca sale):** capítulos leídos, notas, resaltados, cintas, racha, talentos, vidas, progreso de lecciones, respuestas de la bienvenida (incluido «tu camino con Dios» y las dudas), álbum, agenda, ajustes.
- **En PostHog (anónimo):** eventos de uso con un id aleatorio; sin nombre ni lo que lee (salvo el `pregunta` id de las respuestas muestreadas).
- **En Supabase si usa lo social:** id de cuenta anónima, alias, nombre elegido, país del teléfono (2 letras, de la configuración, no la ubicación), nivel, avatar, vitrina (conteos de juego), normas aceptadas, amistades, bloqueos, duelos y jugadas, marcas de copas y torneos, pertenencia a grupos y roles, token push, denuncias, respuestas del Espadeo (con un id aleatorio sin relación a la cuenta), voto del Pulso, propuestas; trivias del sermón (preguntas, no el PDF salvo que se comparta); y, si guarda con Google, **el correo en la tabla de Auth de Supabase** y la copia del progreso.
- **Con terceros:** Google (AdMob: ID de publicidad, IP estimada), Anthropic (el contenido del PDF del sermón, solo si el líder lo sube), OpenStreetMap (el texto que escribió en «Dónde»).

---

## 14. Escalabilidad y costos

### 14.1 Qué dicen los documentos (todo ESTIMACIÓN salvo precios fechados)

- `docs/ESCALA.md`: principios (offline primero, lotes idempotentes, resúmenes en vez de lecturas de lo crudo, contenido estático, lo competitivo
  en el servidor, cada proveedor detrás de un módulo) y el camino por etapas: 0 (gratis, <1 mil) → 1 (Supabase Pro, hasta 100 mil) → 2
  (CDN de contenido, réplica de lectura, particionar `respuestas`) → 3 (millones, tiempo real dedicado). **Aclara que se activa con datos, no antes.**
- `docs/CAPACIDAD.md` (modelo en `scripts/economia/capacidad.py`): con la configuración de hoy (Supabase gratis, salas por sondeo cada 2 s,
  respuestas guardadas 30 días, PostHog gratis) aguanta **unas 5.700 personas activas por mes**; el primer tope es el **tráfico (5 GB/mes)**,
  no la base; la alarma del 70 % suena cerca de 4.100. De ahí: Pro (USD 25/mes) hasta ~100 mil personas (USD 25–40/mes) y después el servidor
  crece por tamaños (USD 202 a 250 mil; USD 1.782 a 1 millón; USD 10.297 a 5 millones **por mes, solo servidor**).
- `docs/COSTOS.md`: «siete reglas del costo mínimo» y una lista de seis preguntas antes de tocar el servidor. Meta: menos de USD 0,002 por
  persona activa por mes en la etapa 1.
- **La trivia del sermón** (Claude) cuesta ~USD 0,25 cada una según el doc (27 mil tokens de entrada, 7 mil de salida con Opus 5.5); con
  Max a USD 5,99 el tope es 8 por mes para no perder plata (`docs/SUSCRIPCIONES.md` §5).
- **Lotes de contenido con la API de Claude:** USD 200 de créditos promocionales (vencen el 22-11-2026), estimado ya gastado ~USD 196
  (`CLAUDE.md` del holding, prueba 48). Quedan USD 8,97 sin recarga automática.

### 14.2 Cuellos de botella que verifiqué en el diseño real

1. **Sondeo de salas cada 2 segundos por participante** (`src/util/salas.ts`, `src/pantallas/Sala.tsx`): una sala de 500 personas son ~250 pedidos por segundo a PostgREST
   solo para esa sala. El doc dice que cambia a Realtime recién desde ~25 mil personas por mes.
2. **Sondeo de `mis_novedades` cada 45 s en Inicio** (`src/pantallas/Inicio.tsx`): una función con 5 subconsultas, que se ejecuta por cada teléfono con la pantalla abierta; los límites (`limit 20/10`) la acotan.
3. **`tabla_copa` recorre todas las marcas de la copa** (`row_number() over (...)` sobre `copas_resultados` filtrada y recién después `puesto <= 50`): hay índice, pero cada
   consulta de tabla ordena todo el conjunto de la copa. Con una copa multitudinaria (el día del evento) es el primer candidato a materializar.
4. **Fila caliente en `salud_resumen`:** cada respuesta del Espadeo hace un `upsert` sobre la fila de **esa pregunta** (`sumar_salud`); preguntas muy jugadas concentran
   escrituras sobre una misma fila (contención de bloqueo). Con 5.400 preguntas se reparte, pero las más populares serán puntos calientes.
5. **Cola de avisos en la misma base:** `enviar_avisos()` corre cada minuto y procesa hasta 3.000 avisos/min (180 mil/hora); un evento para un grupo de 10.000 personas se
   envía en ~4 minutos, no en horas (mejora de la migración `20261130000005_grupos_grandes.sql`). Con más de 3.000 avisos por minuto sostenidos se acumula cola.
6. **Proyecto único, región única, sin réplica de lectura, sin staging.** Un `push` a `main` migra el proyecto real.
7. **Plan gratis de Supabase se pausa tras ~7 días con poca actividad** (`scripts/supabase_despertar.sh`): para un lanzamiento hay que estar en Pro.
8. **El cliente carga mucho contenido en el bundle** (JS 9,8 MB; 2,9 + 2,8 MB de JSON de contenido; 8 Biblias de 4 MB descargadas al abrir cada versión): mitigado con
   carga perezosa de pantallas y de traducciones (`docs/PESO.md`), pero es el costo de «todo en la app».
9. **Auth por usuario activo:** cada instalación que crea cuenta anónima cuenta como usuario activo de Supabase Auth (50 mil gratis al mes en el plan gratis, después USD 0,00325 en Pro según `docs/COSTOS.md`).
   Y, por el hallazgo de §9.2, muchas instalaciones crearían cuenta aunque no usen nada social.

### 14.3 Qué se hizo ya para escalar (verificado en código)

- Respuestas en lotes de 50 con `cliente_id` único y reintentos con espera exponencial y **azar (jitter)** (`src/util/nube.ts`).
- Resúmenes por trigger en vez de recorrer filas (`salud_resumen`, `pulso_conteo`, `encuesta_conteo`).
- Limpieza nocturna (`limpiar_viejo`) en tandas de 50.000.
- `jugar_turno` con `for update` sobre la fila de la partida; emparejamiento al azar con `for update skip locked` (sin bloqueos entre jugadores).
- Avisos agrupados de a 100 tokens.
- Contenido, Biblia y progreso 100 % locales: leer, jugar solo y repasar cuestan **cero** en servidor.
- Un módulo por proveedor (`cuenta.ts`/`nube.ts`, `metricas.ts`, `avisos.ts`, `almacen.ts`, `anuncios.ts`): cambiar de proveedor no toca pantallas.

---

## 15. Las 16 preguntas del fundador, respondidas con el flujo real

Cada respuesta sigue el camino real del código. Cuando algo «todavía no existe», lo digo.

### 1) ¿Qué sucede cuando un usuario se registra?

**Primero hay que distinguir dos cosas que en Senda son separadas:** el *perfil local* (bienvenida) y la *cuenta en la nube* (anónima).

**A. Bienvenida (sin red, sin cuenta):** al abrir por primera vez, `src/App.tsx` arranca en la pantalla `Bienvenida` porque
`useUsuario.bienvenidaVista` es `false`. La persona elige nombre, franja de edad, qué la trae, cuánto sabe, su camino con Dios, sus dudas y su
meta diaria (`src/pantallas/Bienvenida.tsx`, `src/datos/bienvenida.ts`). Al terminar (`terminar()`), todo se guarda **solo en el teléfono**
(`senda-usuario.perfil`). Si eligió «Menos de 13», se apagan las estadísticas. Se elige una ruta inicial de la Travesía. No se toca Supabase.

**B. Cuenta en la nube (anónima y automática), la primera vez que se necesita:**
1. El disparador es `asegurarCuenta()` (`src/util/cuenta.ts`), llamada por cualquier acción social (agregar amigo, rival al azar, unirse
   a un grupo, votar la encuesta, abrir sala…).
2. Si la franja es «Menos de 13» → se lanza `ErrorCuenta("menor_13")` y **no se crea nada**.
3. Se muestra la **hoja de normas** (`pedirNormas()`, `src/util/moderacion.ts`); sin «Acepto» no sigue (`ErrorCuenta("normas")`).
4. `POST /auth/v1/signup` con `{"data": {}}` crea el usuario **anónimo** en Supabase Auth y devuelve el JWT y el refresh token.
5. La sesión se guarda en AsyncStorage (`senda-sesion`).
6. `entrar()`: crea la fila de `perfiles` (`POST /rest/v1/perfiles` con `id`, `nombre`, `pais`, `nivel`); el trigger `perfil_codigo` genera el
   código de amigo de 6 letras; el filtro de palabras revisa el nombre; `elegir_apodo` (RPC) asigna un **alias único**; se registra la
   versión de normas (`aceptar_normas`); se sube el avatar y la vitrina si existen.
7. `registrarPush()` guarda el token de avisos (si hay permiso).

**Atención (hallazgo, §9.2):** como `registrarPush` también llama a `asegurarCuenta()` en cada arranque cuando ya hay permiso de
notificaciones, la cuenta anónima podría crearse sin que la persona haya hecho nada social.

**No pasa:** pedir correo, contraseña o teléfono; verificar la edad; mandar el correo. Para volver a entrar en otro teléfono hay que
«Guardar mi progreso» con Google (pregunta 3).

### 2) ¿Dónde se guarda su información?

| Qué | Dónde | Cuándo sale del teléfono |
|---|---|---|
| Progreso (lecciones, racha, talentos, vidas, nivel, álbum), lo leído, notas, resaltados, cintas, agenda, ajustes, respuestas de la bienvenida | **AsyncStorage** (11 stores `senda-*` y claves sueltas), archivo local de la app | Solo la **copia de progreso** si la persona guardó su cuenta con Google (`progreso_nube`) |
| Sesión de la cuenta (tokens) | AsyncStorage `senda-sesion` | Nunca |
| Perfil social (alias, código, país, nivel, avatar, vitrina, normas) | Tabla `perfiles` (Supabase) | — |
| Amigos, bloqueos, duelos, jugadas, marcas de copas/torneos, grupos, roles, salas, votos de encuestas, denuncias, token push | Tablas de Supabase (ver §4.3) | — |
| Estadísticas de uso | PostHog (id aleatorio) | Se puede apagar |
| Respuestas del Espadeo (calibrar dificultad) | Tabla `respuestas` (con id aleatorio) | Se puede apagar con «Estadísticas anónimas» (`useAjustes.estadisticas`) |
| Correo (solo si vincula Google) | Tabla de Auth de Supabase (no en `perfiles`) | — |
| PDF de sermón | No se guarda, salvo que el líder lo comparta: bucket `sermones` | — |
| Contenido (Biblias, lecciones, preguntas) | **Dentro de la app** (APK) | Nunca se «baja» |

### 3) ¿Cómo se verifica su identidad?

- **No hay verificación de identidad «real»**: ni correo, ni teléfono, ni documento. La «identidad» es la **posesión del token** de una cuenta
  anónima de Supabase Auth. Si se pierde el teléfono (o se borra el almacenamiento) sin haber guardado con Google, **la cuenta se pierde**.
- **Qué verifica el servidor en cada pedido:** PostgREST comprueba la firma del JWT (que emitió Supabase Auth), extrae el `sub`
  (= `auth.uid()`) y lo usa en las políticas RLS y funciones. Las funciones de borde llaman `auth.getUser()`.
- **Con Google (opcional):** `vincularGoogle()` agrega una identidad de Google a la misma cuenta (OAuth con PKCE); desde ahí
  `is_anonymous` pasa a `false` y `guardar_progreso` se habilita. `entrarConGoogle()` permite volver a esa cuenta en otro teléfono.
- **Edad:** autodeclarada, solo la aplica el cliente (no hay control en la base).
- **Administrador:** es una columna `perfiles.admin` que el fundador marca **a mano** en Supabase; la base la vuelve a verificar en cada
  función (`soy_admin()`); un usuario no puede escribirla (permiso por columna).

### 4) ¿Cómo se comunica la app con el backend?

Por **HTTPS con `fetch`**, sin SDK de Supabase. Todas las llamadas pasan por `src/util/cuenta.ts` (`peticion`, `rpc`, `leer`, `escribir`) o,
para lo anónimo, por `src/util/nube.ts`. Los pedidos llevan `apikey` (clave pública) y `Authorization: Bearer <JWT de la persona>`. Hay tres
tipos de destino: **PostgREST** (`/rest/v1/<tabla>` y `/rest/v1/rpc/<función>`), **Auth** (`/auth/v1/...`) y **funciones de borde / Storage**
(`/functions/v1/...`, `/storage/v1/...`). Los errores de reglas vuelven como código corto y la app los traduce; si falla la red, `sin_senal`
y, para tres cosas (respuestas, turnos de duelo, marcas de copas), queda una bandeja de salida con reintentos. Detalle en §6.

### 5) ¿Cómo se obtiene y muestra el contenido?

- **No se «obtiene»: ya está en la app.** Ejemplo concreto, abrir una lección: la pestaña `Travesia` (`src/pantallas/Travesia.tsx`) lista las
  rutas de `RUTAS` (`src/datos/leccion.ts`, que importó `contenido/travesia.json`); al tocar un nivel navega a `Leccion` con un `id`;
  `leccion(id)` arma el objeto con sus preguntas (y, si el idioma no es español, `traducirLeccion` mezcla el texto de
  `contenido/traducciones/<idioma>/<ruta>.json`); `Leccion.tsx` muestra una pregunta por vez; la «Lámpara» y las citas muestran el texto del
  pasaje leyéndolo de la Biblia local con `pasajesDe`/`cargarBiblia` (`src/datos/citas.ts`, `src/datos/biblia.ts`).
- **Biblia:** `cargarBiblia(id)` lee `assets/biblia/<versión>.bib` (JSON), lo parsea y lo guarda en una caché en memoria; el lector
  (`src/lector/`) mide, pagina y dibuja el texto como un libro.
- **Trivia:** `BANCO` de `src/datos/espadeo.ts` (5.390 publicadas + 12 aprobadas); `dificultad.ts` elige cada pregunta con una probabilidad objetivo de acierto
  que sube y baja en «olas».
- **Lo que sí viene de la red:** eventos y encuestas de Senda, torneos, duelos, novedades, tablas (§6.4); el resto es local.
- **Cómo se asegura que el contenido sea correcto:** `scripts/validar_contenido.py` en el armado del APK (§12).

### 6) ¿Cómo se registran sus avances?

Cada avance es una **acción de un store de zustand** (`src/estado/usuario.ts` y compañía): `leerCapitulo`, `terminarLeccion`, `ganar`,
`marcarPalabraHoy`, `completarMision`, `registrarHabilidad`, `anotarRepaso`, etc. El middleware `persist` + `almacen()`
(`src/util/almacen.ts`) los escribe en AsyncStorage (diferido 400 ms o al ir a segundo plano). **No se mandan al servidor en tiempo real.**
Se suben solo en tres casos: (a) la **copia completa** para cuentas guardadas con Google (`subirProgreso`, §5.4); (b) **eventos agregados anónimos**
a PostHog (`medir`); (c) lo **competitivo** (duelos, copas, torneos, salas), que va a la base porque necesita al otro jugador.

### 7) ¿Cómo se actualiza una corona o recompensa?

(En Senda no hay «coronas»; las recompensas son **talentos, pasos/nivel, estrellas, piezas de armadura, figuritas y copas**; las copas son lo
más parecido a una corona.)

- **Recompensas personales (talentos, pasos, estrellas, racha, misiones):** las suma el **teléfono** con `ganar()`, `terminarLeccion()`,
  `completarMision()` y se guardan en AsyncStorage. Paso a paso con archivos: §7.2.
- **Copa (puesto en una tabla de todos):** la decide la **base** con `marca_copa()` y `tabla_copa()`. Paso a paso: §7.3. Resumen:
  teléfono manda `[{pregunta, respuesta, ms}]` → la base corrige con `preguntas_clave`, puntúa 500–1000 por acierto, guarda **solo la primera partida**
  en `copas_resultados` (restricción única) y devuelve `aciertos/puntos/oficial`.
- **Duelo (armadura, ganador):** `jugar_turno()` en la base: §7.4.
- **Qué pasa si no hay red:** la recompensa personal se aplica igual (es local); la marca de copa/turno queda en una bandeja y se manda al
  volver (`enviarTurnosPendientes`, `enviarMarcasPendientes`).

### 8) ¿Cómo se procesan las compras?

**Todavía no existe en el código de la app.** No hay librería de billing, ni pantalla de compra, ni llamada a la función de borde `compras`
(§8.2). Lo que hay: (1) el **diseño** de planes y precios en `docs/SUSCRIPCIONES.md`; (2) la **función de borde `compras`** lista para verificar recibos de
Google Play; (3) las **tablas** `suscripciones` y `compras_play`; (4) un **«regalo» manual** (`regalar_plan`) que el administrador puede
dar con el código de amigo. El «plan» que ve el usuario hoy es un interruptor local de prueba (`src/pantallas/Planes.tsx`). El flujo
previsto (según los docs) es: Google Play cobra → la app manda el token de compra a `/functions/v1/compras` → la función lo verifica con Google
(`purchases.subscriptionsv2.get`), comprueba que el comprador sea esta cuenta (`obfuscatedExternalAccountId`) → escribe `suscripciones` → la app
leería `mi_plan()`. **Ese último tramo (la app que compra y que lee el plan) no está construido.**

### 9) ¿Cómo se integra la publicidad?

- **Librería** `react-native-google-mobile-ads` + plugin en `app.json` (con IDs de ejemplo de Google hasta tener los reales).
- **Flujo:** al entrar a un juego o a una lección, `precargarAnuncio()` deja un intersticial cargado; al terminar, la pantalla pregunta
  `tocaAnuncio()` (`src/util/pausaAnuncio.ts`: no en las 2 primeras actividades del día, y 1 cada 4 min como mucho); si toca,
  `AnuncioSimulado` (`src/componentes/anuncio.tsx`) llama a `mostrarAnuncio()` (`src/util/anuncios.ts`) que inicia el SDK (con consentimiento UMP donde corresponde),
  muestra y sigue. Nunca bloquea: si no hay anuncio listo, la persona sigue.
- **Reglas:** nunca menores de 13, nunca con plan pago (local), nunca en la Biblia; sin personalizar; apagable por el interruptor remoto `anuncios`.
- **IDs reales:** se inyectan en el APK desde variables de GitHub (`apk.yml`), **no en el AAB** (`aab.yml`). Detalle en §8.1.

### 10) ¿Cómo funcionan las notificaciones?

Dos sistemas (§9). **Locales:** el teléfono programa recordatorios con `expo-notifications` (`reprogramarAvisos`). **Remotas (push):** una función
SQL inserta una fila en `avisos`; la tarea `pg_cron` `senda_enviar_avisos` (cada minuto) agrupa de a 100 tokens y hace `net.http_post` a la API de
Expo; Expo entrega por FCM; al llegar, la app refresca sus «novedades»; al tocar, navega a la pantalla indicada. El token se registra con
`registrarPush` → `guardar_token`. Falta: leer recibos de Expo y traducir los textos.

### 11) ¿Dónde se almacenan las imágenes?

**En la propia app** (empaquetadas) o **no existen como archivos**: los íconos, mapas y retratos son SVG/datos generados; los avatares son un
objeto JSON de la base que DiceBear dibuja en el teléfono; la foto de portada de un evento queda en el teléfono. **La única subida de archivos es el
PDF del sermón** (bucket privado `sermones`, solo si el líder lo comparte). Tabla completa en §10.

### 12) ¿Cómo se actualiza la aplicación?

**No hay actualización por aire (OTA).** Cambiar la app = **compilar un APK/AAB nuevo** y que llegue al teléfono: hoy, descargando el APK de un Release de
GitHub e instalándolo encima; en producción, subiendo el AAB a Google Play (a mano) y que Play lo distribuya. Lo único que cambia sin APK son los
**interruptores** de la base, la lógica de **funciones SQL** y el contenido social del administrador. Detalle y flujos en §11.4.

### 13) ¿Qué ocurre cuando se modifica una funcionalidad?

1. **Se edita el código o el contenido** (en las sesiones de Claude Code): los cambios de contenido pasan por scripts de autoría
   (`scripts/autor/*.py`) y `scripts/validar_contenido.py`; los de la app, por `npx tsc --noEmit` (manual) y la prueba de arranque.
2. **Si toca la base:** se agrega una **migración nueva** (nunca se edita una vieja). Al hacer `push` a `main`, `supabase.yml` aplica primero
   **todas** las migraciones en una base descartable y corre el recorrido de la base (~188 comprobaciones); si pasa, aplica a Supabase real con `db push --include-all`
   y re-despliega las 3 funciones.
3. **Si toca la app:** hay que **disparar a mano** `apk.yml`: corre validador, arranque y recorrido de la base; compila; publica el Release.
   Quien tiene el APK viejo no se entera: tiene que instalar el nuevo.
4. **Si cambia una pregunta del Espadeo:** hay que **regenerar la clave** `preguntas_clave` con `scripts/autor/preguntas_clave.py` (una migración nueva); **hoy
   nada lo fuerza ni lo comprueba** (hallazgo, §17 punto 1).
5. **Riesgo de compatibilidad:** no hay versión mínima; varias migraciones hacen `drop function` de una firma antigua (`abrir_sala`, `miembros_de`,
   `perfiles_de`, `organizar_torneo`), por lo que un APK viejo que llame a la firma vieja falla. Mientras la app no esté en tiendas, el riesgo es
   bajo (se instala el último APK); **después del lanzamiento será un tema real**.

### 14) ¿Cómo se protege la información?

En capas (§13): (1) todo lo personal **se queda en el teléfono**; (2) en la nube, **RLS en las 41 tablas** y reglas como funciones SQL
`security definer`; (3) **permisos por columna** y funciones internas cerradas; (4) **topes y frenos** (códigos de grupo, denuncias, tamaño, cupos de IA);
(5) **filtro de palabras y moderación**; (6) **secretos fuera del repo**; (7) tráfico por **HTTPS**; (8) **borrado de cuenta** en cascada; (9) **estadísticas anónimas y apagables**;
(10) un **bucket privado** con enlaces de 1 hora para el PDF. **Lo débil** (para ser honestos): el token de sesión está en AsyncStorage sin cifrar,
el bundle JS no está ofuscado, la edad no se verifica en el servidor, la economía del cliente es manipulable, no hay Play Integrity.

### 15) ¿Cómo se detectan errores?

(a) **En el teléfono:** la guardia captura errores de JS y muestra una pantalla con el detalle; queda «Último fallo registrado» en Ajustes; la persona lo copia y
lo manda por correo (**no se envía solo**). (b) **Antes de entregar:** el validador de contenido, la prueba de arranque, la prueba de la base
(~188 comprobaciones), la prueba de humo en emulador y la auditoría de textos (§12). (c) **En la base y las funciones:** `console.error` y los registros del panel de Supabase;
códigos de error cortos que la app traduce. (d) **Uso:** PostHog muestra qué se usa y cuánto, no errores. No hay Sentry/Crashlytics: un fallo nativo en el
teléfono de un usuario no llega al equipo salvo que lo cuente.

### 16) ¿Cómo se mantiene el funcionamiento cuando aumenta la cantidad de usuarios?

- **Primero, no depender del servidor:** Biblia, contenido, progreso y juegos en solitario son locales; ese tráfico **no existe** en el
  servidor y por eso no crece con los usuarios.
- **Para lo que sí va al servidor:** envíos por **lotes idempotentes** con reintento exponencial con azar; **contadores sumados por trigger**; lecturas de resúmenes;
  **limpieza nocturna**; competitivo resuelto en **funciones SQL** (sin servidores propios); push agrupadas de a 100.
- **Etapas planificadas** (`docs/ESCALA.md`, `docs/CAPACIDAD.md`; ESTIMACIONES): hoy ~5.700 personas/mes en el plan gratis (el primer tope es el
  tráfico); pasar a Supabase Pro a ~4.000; a 25 mil, salas por Realtime; a 100 mil, servidor Small y CDN de contenido; a 250 mil, push sin cuenta y
  muestreo de respuestas; a un millón, servicio de tiempo real dedicado.
- **Lo que no existe todavía:** una **prueba de carga** (el doc la plantea como paso previo a la etapa 2), un **entorno de staging**, una **réplica de
  lectura**, y **alertas** automáticas (están descritas como configuraciones a hacer en los paneles de Supabase/PostHog).
- **Cuellos de botella concretos** que verifiqué: sondeo de salas cada 2 s (500 personas = ~250 pedidos/s), `tabla_copa` que ordena todas las marcas, fila caliente en
  `salud_resumen`, cola de avisos de 3.000/min, y el efecto de que cada instalación cree una cuenta (§14.2).

---

## 16. Índice de archivos importantes (rutas válidas para citar)

Todas las rutas son relativas a la raíz de `senda-app` y **existen** (verificado con un script al terminar el informe).

### Configuración y arranque

| Ruta | Qué es |
|---|---|
| `package.json` | Dependencias, versiones y scripts (`prueba:arranque`, `vista-previa`, `typecheck`) |
| `app.json` | Configuración de Expo: identificador, plugins nativos, permisos, versión 0.40.0 / versionCode 41, AdMob de prueba |
| `eas.json` | Perfiles de EAS (preparados; no se usan en los flujos) |
| `tsconfig.json` | TypeScript estricto, extiende la base de Expo |
| `metro.config.js` | Metro: `.bib`, `.riv`, `.wasm`, `.glb` como recursos |
| `index.ts` | Punto de entrada real: guardia, carga protegida de `App`, widget |
| `App.tsx` | Reexporta `src/App.tsx` |
| `src/App.tsx` | Raíz de la app: fuentes, hidratación, navegación, avisos, enlaces, copia de progreso |
| `src/compilacion.json` | Número y fecha de la prueba (lo escribe el flujo del APK) |
| `CLAUDE.md` | Reglas de trabajo del repo (con algunos datos desactualizados, §17.8) |
| `google-services.json` | Configuración de Firebase para FCM (no secreta; no copiar sus valores) |

### Estado, datos y reglas (`src/`)

| Ruta | Qué es |
|---|---|
| `src/tema.ts` | Temas visuales y **`reglas`** del juego (vidas, talentos, precios) |
| `src/estado/usuario.ts` | Store del progreso (vidas, talentos, pasos, racha, lecciones, álbum) y sus migraciones |
| `src/estado/ajustes.ts` | Ajustes, idioma, estadísticas y el **plan simulado** |
| `src/util/almacen.ts` | Persistencia diferida en AsyncStorage |
| `src/datos/biblia.ts` | Las 8 versiones de Biblia, `cargarBiblia`, búsqueda, enlaces a Bible.com |
| `src/datos/leccion.ts` | Travesía: rutas, áreas, lecciones, tipos de pregunta |
| `src/datos/espadeo.ts` | Banco de trivia y selección por idioma |
| `src/datos/dificultad.ts` | Dosificador de dificultad tipo Elo |
| `src/datos/copas.ts` | Copas de Senda y sus preguntas fijas |
| `src/datos/puntaje.ts` | Puntaje 500–1000 por acierto y velocidad |
| `src/datos/nivel.ts` | Curva de nivel por pasos |
| `src/datos/traducciones.ts` | Carga perezosa del contenido en portugués e inglés |
| `src/i18n/textos.ts` | Las 2.494 claves de texto en es/pt/en |
| `src/sonido.ts` | Motor de sonido (voces superpuestas y agendadas) |
| `src/lany/director.ts` | Director de eventos de Lany |

### Red, cuenta y servicios (`src/util/`)

| Ruta | Qué es |
|---|---|
| `src/util/cuenta.ts` | Cuenta anónima, sesión, cliente REST (`peticion`, `rpc`, `leer`, `escribir`), Google, borrar cuenta |
| `src/util/nube.ts` | Canal anónimo: respuestas del Espadeo (con bandeja), Pulso, propuestas |
| `src/util/juntos.ts` | Amigos, duelos (con bandeja), push, novedades, torneos |
| `src/util/grupos.ts` | Grupos, eventos, tablas de copa/torneo, marcas con bandeja |
| `src/util/salas.ts` | Salas en vivo por sondeo cada 2 s |
| `src/util/sermon.ts` | Trivia del sermón: PDF → función de borde → revisión |
| `src/util/respaldo.ts` | Copia del progreso a la nube (cuentas con Google) |
| `src/util/metricas.ts` | PostHog por HTTP |
| `src/util/anuncios.ts` | AdMob: SDK, consentimiento, precarga |
| `src/util/pausaAnuncio.ts` | Regla de cuándo toca un anuncio |
| `src/util/avisos.ts` | Notificaciones locales y escucha de push |
| `src/util/guardia.ts` | Guardia de errores globales |
| `src/util/interruptores.ts` | Interruptores remotos |
| `src/util/moderacion.ts` | Normas, denunciar, bloquear |
| `src/util/avatar.ts` | Avatares con DiceBear |
| `src/componentes/fallo.tsx` | Pantalla de fallo y guardia de React |
| `src/componentes/anuncio.tsx` | Anuncio real (teléfono) o cartel simulado (web) |
| `src/componentes/guardarProgreso.tsx` | Hoja «Guardar/recuperar mi progreso» con Google |

### Pantallas con lógica importante

| Ruta | Qué es |
|---|---|
| `src/pantallas/Leccion.tsx` | Flujo de una lección: preguntas, vidas, recompensa, anuncio |
| `src/pantallas/Jugar.tsx` | Espadeo (solitario, duelo, rival al azar), ruleta, anuncio |
| `src/pantallas/Copa.tsx` | Copa/torneo: 15 preguntas, marca y tabla |
| `src/pantallas/Sala.tsx` | Sala en vivo |
| `src/pantallas/Planes.tsx` | Selector de plan (simulado) |
| `src/pantallas/Admin.tsx` | Panel del administrador (eventos, encuestas, denuncias, regalar plan) |

### Base de datos y funciones (`supabase/`)

| Ruta | Qué es |
|---|---|
| `supabase/config.toml` | Solo `project_id` |
| `supabase/migrations/20261026000000_inicio.sql` | Base inicial: respuestas, Pulso, perfiles, paquetes |
| `supabase/migrations/20261027000000_escala.sql` | Idempotencia y resúmenes por trigger |
| `supabase/migrations/20261101000000_juntos.sql` | Amigos, duelos, grupos, eventos, copas, torneos, encuestas, suscripciones, salas, push, cron |
| `supabase/migrations/20261107000000_grupos.sql` | Roles y puntaje corregido en la base |
| `supabase/migrations/20261109000000_limpieza.sql` | Limpieza programada |
| `supabase/migrations/20261111000000_novedades.sql` | Alias único, permisos por columna, invitaciones, torneos de cualquiera, `mis_novedades` |
| `supabase/migrations/20261121000000_preguntas_clave.sql` | **Última** clave de respuestas generada |
| `supabase/migrations/20261127000000_seguridad.sql` | Las 14 correcciones de la auditoría |
| `supabase/migrations/20261129000000_moderacion.sql` | Filtro de palabras, denuncias, normas |
| `supabase/migrations/20261130000005_grupos_grandes.sql` | Avisos en tandas, grupos de 10.000 |
| `supabase/migrations/20261130000006_progreso_nube.sql` | Copia del progreso |
| `supabase/functions/trivia-sermon/index.ts` | Función de borde que llama a Claude |
| `supabase/functions/borrar-cuenta/index.ts` | Borrado de cuenta |
| `supabase/functions/compras/index.ts` | Verificación de recibos de Google Play (sin uso aún) |

### Flujos, pruebas y scripts

| Ruta | Qué es |
|---|---|
| `.github/workflows/apk.yml` | Arma el APK de prueba con validadores |
| `.github/workflows/aab.yml` | Arma el AAB para Play |
| `.github/workflows/supabase.yml` | Prueba y aplica migraciones y funciones |
| `.github/workflows/humo.yml` | Prueba de humo en emulador |
| `.github/workflows/firma.yml` | Crea la clave de carga |
| `.github/workflows/limpieza.yml` | Limpieza semanal de PDF |
| `pruebas/arranque/arranque.test.tsx` | Prueba de arranque en Node |
| `pruebas/nube/recorrido.py` | Recorrido de la base completa (~188 comprobaciones) |
| `pruebas/nube/correr.sh` | Arma la base de prueba y corre el recorrido |
| `scripts/validar_contenido.py` | Validador de todo el contenido |
| `scripts/android_r8.sh` | Activa R8 |
| `scripts/humo_emulador.sh` | Recorrido en el emulador |
| `scripts/supabase_despertar.sh` | Despierta Supabase pausado |
| `scripts/autor/preguntas_clave.py` | Genera la clave de respuestas para la base |
| `scripts/autor/copas_preguntas.py` | Genera las copas |
| `scripts/lotes/claude_lotes.py` | Lotes con la API de Claude |
| `scripts/economia/capacidad.py` | Modelo de capacidad y costos |
| `scripts/auditoria/textos.cjs` | Auditoría automática de textos |

### Contenido y documentos

| Ruta | Qué es |
|---|---|
| `contenido/espadeo.json` | Trivia (5.483 entradas) |
| `contenido/travesia.json` | Travesía (482 lecciones) |
| `contenido/legal.json` | Política de privacidad, términos y borrado (fuente única) |
| `contenido/copas_preguntas.json` | Las 15 preguntas fijas de cada copa |
| `assets/biblia/rv1909.bib` | Biblia por defecto (JSON compacto) |
| `docs/SEGURIDAD.md` | Auditoría de seguridad y pendientes |
| `docs/CUENTAS.md` | Cuentas de servicios y qué hace cada una |
| `docs/ESCALA.md` | Arquitectura para escalar |
| `docs/COSTOS.md` | Reglas de costo mínimo |
| `docs/CAPACIDAD.md` | Cuánta gente aguanta y cuánto cuesta |
| `docs/ANUNCIOS.md` | Cómo se integran los anuncios |
| `docs/SUSCRIPCIONES.md` | Planes, precios y topes (propuesta) |
| `docs/PRUEBAS.md` | Cómo probar y cómo instalar el APK |
| `docs/TIENDAS.md` | Camino a Google Play y App Store |
| `docs/EXPO_FIREBASE.md` | Expo y Firebase para push |
| `docs/PESO.md` | Peso del APK y rendimiento |
| `docs/LANZAMIENTO.md` | Mapa de «Juntos» (lo social) para el lanzamiento |

---

## 17. Deuda técnica y decisiones discutibles (con evidencia)

Ordenadas por impacto. Las cuatro primeras son las que más importan antes de lanzar. Cada una sirve como material de criterio de ingeniería:
qué se decidió, por qué tenía sentido, y dónde duele.

### 17.1 La «clave de respuestas» vive duplicada y ya está desincronizada

**Qué hay:** la respuesta correcta de cada pregunta del Espadeo está **dos veces**: en el contenido (`contenido/espadeo.json`, que viaja en la app) y en la
tabla `preguntas_clave` de la base, cargada por **migraciones generadas** (`scripts/autor/preguntas_clave.py`). La base necesita su copia para corregir
duelos, copas, torneos y salas sin confiar en el teléfono (decisión correcta de diseño anti-trampa).

**Evidencia (medida con un script el 2026-11-09):** comparé los ids vivos de `contenido/espadeo.json` (estado distinto de `borrador` y `retirada`)
con los de la última migración (`supabase/migrations/20261121000000_preguntas_clave.sql`):
- **5.402 preguntas vivas** en el contenido vs **5.371** claves → **104 preguntas vivas no tienen clave** (por ejemplo las `bot-46001…` y `cas-46xxx`);
- **73 claves** pertenecen a preguntas ya retiradas;
- **4 de las preguntas fijas de las copas no tienen clave**: `bot-46004` (Navidad), `cas-46004` (Pascua), `bot-46062` y `cas-46005` (Pentecostés).
- Las respuestas de las preguntas que sí están coinciden (0 diferencias).

**Por qué importa:** una pregunta sin clave se corrige como **error** (`jugar_turno`, `corregir_partida` y `responder_sala` hacen `select … if found and …`).
La copa de Navidad (19-12-2026) saldría con una pregunta que nadie puede acertar en la tabla de todos.
**Por qué pasó:** ningún paso del armado lo comprueba (`scripts/validar_contenido.py` no menciona `preguntas_clave`; `pruebas/nube/recorrido.py` solo
usa las claves que ya están en la base). **Costo extra:** cada versión de la clave es una migración de 100–230 KB (10 archivos, ~25.800 líneas) que se
vuelve a aplicar entera.
**Criterio:** cuando una verdad vive en dos lugares, hace falta una **prueba automática de igualdad** (o generar la clave en el momento del despliegue en vez de versionarla como migración).

### 17.2 El «plan» es un interruptor local y la compra no está conectada

**Evidencia:** `useAjustes().plan` se cambia con «Probar» en `src/pantallas/Planes.tsx` y controla anuncios y vidas (`src/pantallas/Jugar.tsx`,
`src/pantallas/Leccion.tsx`, `src/pantallas/Duelos.tsx`); no hay gating de producción. El cliente **nunca lee** `mi_plan()` ni `suscripciones`; la función de borde
`compras` no tiene llamador. `aab.yml` no inyecta los IDs de AdMob (§8.1).
**Por qué importa:** si se publicara tal cual, cualquier persona podría quitarse los anuncios gratis; y un Max regalado con `regalar_plan` no se vería en la app.
**Criterio:** la **fuente de verdad de lo que se paga debe ser el servidor** (el cliente solo la refleja); para una versión de tienda conviene ocultar el selector con una condición de compilación y leer el plan al iniciar sesión.

### 17.3 La autoridad está en el cliente para la economía y para el tiempo de las copas

**Evidencia:** talentos, pasos, vidas, racha y nivel se calculan y guardan en el teléfono (`src/estado/usuario.ts`); `perfiles.nivel` lo escribe el teléfono (solo se acota a 1–999 por una
restricción). En copas y torneos, el tiempo de cada respuesta (`ms`) lo informa el teléfono y la base solo lo acota (`corregir_partida`, piso de 300 ms).
**Por qué es una decisión razonable hoy:** no hay dinero ni premios en juego; es offline-first; la base ya valida lo importante (qué preguntas, cuáles aciertos, una marca por persona).
**Dónde duele:** si algún día hay premios (hay planes de sorteos y «10 kits por puntos», `CLAUDE.md` del holding), un cliente alterado puede declarar 300 ms por pregunta y ganar la copa.
**Criterio:** definir **qué cosas tienen valor** y mover solo esas a la autoridad del servidor (por ejemplo, medir el tiempo con `now()` de la base como ya se hace en las salas).

### 17.4 Integración y entrega continuas flojas, y producción sin entorno intermedio

**Evidencia:**
- **8 de 10 flujos son manuales**; los únicos automáticos son `supabase.yml` (en `push` a `main`) y `limpieza.yml` (semanal).
- Ningún flujo corre `tsc --noEmit` ni lint (ESLint no está instalado aunque el código tiene `eslint-disable`).
- `aab.yml` (el que va a Play) **no corre validadores ni pruebas** (`apk.yml` sí).
- `versionCode` fijo en `app.json` (41): Play exige uno mayor en cada subida y nada lo incrementa.
- **No hay staging**: `supabase.yml` prueba en una base descartable y luego migra **directo producción**.
- `react-test-renderer` 19.1.0 con React 19.2.3; `expo-constants` se importa sin estar declarado (`src/util/juntos.ts`).
**Por qué importa:** los errores de tipos o un AAB sin pruebas pueden llegar a una tienda; el proceso depende de que alguien se acuerde de disparar y revisar.
**Criterio:** automatizar el **mínimo común** (tipos + validador + arranque) en cada cambio y **que el flujo de producción reutilice el mismo armado que el de prueba**.

### 17.5 Seguridad operativa y cuenta creada «de más»

**Evidencia:**
- El token de sesión está en AsyncStorage sin cifrar, y Android lo incluye en su copia de respaldo a propósito (`docs/SEGURIDAD.md`, última fila); la mejora está agendada pero no hecha.
- El `SUPABASE_ACCESS_TOKEN` es **un token personal con todos los permisos** (según `docs/CUENTAS.md`) y se usa **en cada compilación** solo para pedirle a Supabase la clave pública (`apk.yml`, `aab.yml`);
  para ese fin bastaría guardar la clave pública como variable del repositorio, sin exponer un token de tanto alcance a cada armado.
- La contraseña del almacén de claves de Play se pasa como **entrada visible del flujo** `firma.yml`.
- No hay Play Integrity ni tope de pedidos de amistad por hora (pendientes en el propio doc).
- La **edad** solo se controla en el cliente: la base no sabe nada de edad (`grep` en `supabase/`).
- Posible **cuenta anónima creada sin acción social** por `registrarPush` (§9.2), con la hoja de normas apareciendo al arrancar.
**Criterio:** principio de **mínimo privilegio** para tokens, y que cada creación de cuenta ocurra por una acción consciente de la persona.

### 17.6 Observabilidad casi nula

**Evidencia:** no hay reporte remoto de errores (§12.3); `version_app` de PostHog es una constante (`"0.13"`) que no cambia con cada compilación (`src/util/metricas.ts`); la vista
`salud_preguntas` se alimenta pero **no hay lector en el repo**; no hay prueba de carga; los errores de las funciones de borde solo quedan en el panel de Supabase.
**Por qué importa:** con miles de teléfonos distintos, un cierre nativo (que la guardia de JS no ve) o una regresión en una versión concreta pasarían desapercibidos hasta que alguien escriba.
**Criterio:** decidir deliberadamente el equilibrio **privacidad ↔ visibilidad**; hoy se eligió privacidad total, y eso tiene un costo operativo.

### 17.7 Compatibilidad entre versiones y contenido sin actualización por aire

**Evidencia:** migraciones con `drop function if exists public.abrir_sala(text, uuid, uuid, smallint)`, `miembros_de(uuid)`, `perfiles_de(uuid[])` y `organizar_torneo(…)`
(`supabase/migrations/20261127000000_seguridad.sql`, `20261111000000_novedades.sql`, `20261130000002_avatar.sql`, `20261130000005_grupos_grandes.sql`, `20261130000008_torneos_enlace.sql`);
no existe «versión mínima soportada»; la tabla `paquetes` (contenido sin pasar por la tienda) no se usa; corregir una pregunta exige un APK nuevo.
**Por qué importa:** en cuanto haya gente con versiones distintas instaladas, una migración puede romper a los que no actualizaron, y una errata en una lección tarda lo que tarde la revisión de la tienda.
**Criterio:** definir una **política de compatibilidad** (funciones nuevas con nombre nuevo + retirar las viejas más tarde) y decidir cuándo conviene OTA o paquetes de contenido.

### 17.8 Documentación que ya no coincide con el código

Verificado contra el código:
- `CLAUDE.md` de la app: «Vidas: 3 gratis, se recupera 1 por hora» y cita `src/tema.ts` como fuente; **el código dice 5 vidas y 1 cada 30 minutos** (`reglas.vidasGratis`, `reglas.minutosPorVida`).
- `docs/LANZAMIENTO.md` §3: «guarda los tokens en el almacén seguro (`expo-secure-store`)»; **el código usa AsyncStorage** y `expo-secure-store` no está en `package.json`.
- `docs/LANZAMIENTO.md` §1: «nada de sondeos»; **las salas y la encuesta se resuelven con sondeo**.
- `docs/ESCALA.md` §6: sincronización con «fusión por campo»; **el código reemplaza la copia entera** (`aplicarCopia`).
- Un comentario de `20261101000000_juntos.sql` habla de una función de borde «avisos» que **no existe**; los avisos los manda la base con `pg_net`.
- `docs/PESO.md` habla de 405 lecciones y 728 preguntas; hoy hay **482 lecciones y 5.402 preguntas vivas** (el doc está fechado el 23-10).
**Criterio:** en un proyecto trabajado por IA a ritmo alto, la documentación se desactualiza en cuanto cambia el código; conviene tratar `docs/` como fuente secundaria y **dejar que el código y las pruebas manden** (como hace este informe).

### Lo que está bien resuelto (para equilibrar el criterio)

- **Offline-first de verdad** y contenido 100 % local: costo de servidor cero para lo individual.
- **Idempotencia con `cliente_id`** + bandejas de salida con reintento exponencial y azar.
- **La lógica oficial en SQL** (`security definer`, RLS en las 41 tablas, permisos por columna), con una **prueba de ~188 comprobaciones que incluye los ataques** de la auditoría.
- **Tope de costo de IA** a prueba de carreras (`trivias_cobradas` + `pg_advisory_xact_lock`) y un **interruptor remoto**.
- **Guardia de fallos** que mantiene la app viva y deja el detalle a mano, más una **prueba de humo en emulador** que atrapa lo que la guardia de JS no ve.
- **Cada proveedor detrás de un módulo** (`cuenta`, `nube`, `metricas`, `avisos`, `almacen`, `anuncios`): cambiar de proveedor no toca las pantallas.
