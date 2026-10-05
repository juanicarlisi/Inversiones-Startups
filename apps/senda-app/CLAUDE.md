# CLAUDE.md — Senda (la app)

Senda es una app cristiana para que los jóvenes conozcan la Biblia **jugando, leyendo y en comunidad**, con nivel profesional.
El proyecto completo (producto, diseño, economía, roadmap, decisiones) vive en el repositorio del holding:
`juanicarlisi/Inversiones-Startups` → `oportunidades/proyectos/senda/` (PDF: `informes/2026-10-senda-proyecto-v2.pdf`).
Si algo de este repo contradice al proyecto, manda el proyecto; si el fundador decide algo nuevo, se actualizan los dos.

## Reglas no negociables

1. **La experiencia es la prioridad número uno.** Nada infantil, nada aburrido, nada «hecho en Claude». Cada pantalla pasa la
   *prueba de la grilla*: al lado de Duolingo, Preguntados o Candy Crush no se ve más pobre.
2. **Diseño emocional en cada función** (ver `docs/DISENO_EMOCIONAL.md`): qué emoción buscamos, con qué animación, sonido,
   vibración y texto. Lani nunca se burla ni culpa.
3. **Textos de la interfaz en español neutro con «tú»** (decisión del fundador, 05-10-2026). Los comentarios del código pueden ir
   en rioplatense. Sin emojis del sistema en la interfaz: íconos propios (`src/arte`).
4. **La Biblia es gratis y sin anuncios, siempre.** Leer nunca gasta vidas. Nada que se pague da ventaja en lo oficial.
5. **Sin IA para los usuarios** (ni en Berea ni en Senda Reunión). La API de Claude solo se usa por detrás para producir contenido.
6. **Todo gasto, cuenta nueva, publicación o mensaje a terceros lo aprueba el fundador** antes (regla 8 del holding).
7. **Licencias**: solo textos bíblicos libres (RV1909, BES, PDT) hasta tener licencia de la RVR1960. Cada versión muestra su
   atribución. Las preguntas y lecciones son propias y citan el pasaje.

## Reglas del juego vigentes (fuente: `src/tema.ts` → `reglas`)

- Vidas: **3 gratis, se recupera 1 por hora** (decisión 05-10-2026). Repasar **no** devuelve vidas por ahora.
- Gastan vida: un error en la Travesía y empezar una partida individual. Nunca: leer, escuchar, salas, Liga, eventos en vivo.
- Misiones del día: 15 Talentos cada una. Lección: 10 (15 si es perfecta).

## Stack

- **Expo SDK 57** + React Native 0.86 + TypeScript estricto. Una base para Android, iOS y web.
- Navegación: **React Navigation 7** (pila + pestañas con barra propia). No se usa Expo Router a propósito: la vista previa web
  se sirve desde una carpeta cualquiera y no debe depender de la URL. Se reevalúa cuando haya enlaces universales (v1).
- Estado: **zustand** + AsyncStorage (`src/estado/usuario.ts`). Cuentas y sincronización con Supabase en el sprint 2.
- Arte: SVG con `react-native-svg` generados por `scripts/generar_arte.py` desde `scripts/arte/senda_visual.py`
  (bocetos de dirección; Lani pasa a Rive cuando esté el arte final).
- Tipografías (SIL OFL): Unbounded (títulos), Plus Jakarta Sans (interfaz), Literata (Biblia), vía `@expo-google-fonts/*`.
- Biblias: `assets/biblia/*.bib` (JSON compacto) generadas con `scripts/convertir_biblia.py` desde open-bibles (USFX).

## Comandos

```bash
npm install
npx tsc --noEmit                     # tipos (obligatorio antes de cada commit)
npm run vista-previa                 # export web + carpeta vista-previa/ con rutas relativas
npx expo install <paquete>           # siempre así, para versiones compatibles con el SDK
python3 scripts/generar_arte.py      # regenera src/arte/generado.ts
```

En el entorno de Claude en la nube, `expo.dev` y `api.expo.dev` están bloqueados por la red: usar `EXPO_OFFLINE=1`. Para compilar
APK con EAS hace falta una cuenta de Expo (gratis) y permitir esos dominios en la configuración del entorno.

## Estructura

```
src/
  App.tsx            fuentes, navegación, capa de celebraciones
  tema.ts            colores, tipografías, espacios, reglas del juego
  arte/              Arte.tsx (Icono, Lani, Pieza, Emblema, Vehiculo, Logo) y generado.ts (no editar)
  componentes/       base (T, Fondo, Vidrio, Boton, Barra, Chip), momentos (barra superior, chispas, celebraciones), TabBar
  datos/             biblia, versículos del día, lección, banco de Espadeo, calendario, Pulso
  estado/            usuario (vidas, racha, Talentos, misiones, lecturas, resaltados)
  pantallas/         Inicio, Biblia, Lector, Travesia, Leccion, Jugar, Comunidad
scripts/             convertir_biblia.py, generar_arte.py, vista_previa.py
docs/                SPRINTS.md (plan al MVP), DISENO_EMOCIONAL.md, PRUEBAS.md
```

## Hecho es hecho

Tipos sin errores · probado en la vista previa web (capturas a 390 px de ancho) · textos en español neutro · estados vacíos y de
error diseñados · animación + vibración + (cuando haya) sonido en los momentos clave · accesibilidad (etiquetas en botones) ·
sin datos inventados presentados como reales (lo de ejemplo dice «ejemplo»).
