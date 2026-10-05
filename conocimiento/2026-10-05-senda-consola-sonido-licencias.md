# Senda: gobierno de la app (Consola), sonidos libres, voces y licencias protestantes

Fecha: 2026-10-05 · Investigación de Claude para la tercera tanda de pedidos del fundador (después de probar el sprint 1).
Método: buscador (varias páginas oficiales están bloqueadas por la red del entorno: biblica.com, lockman.org, care.api.bible,
kenney.nl, freesound.org, huggingface.co). Lo que decide plata se re-verifica en la fuente primaria antes de gastar.

## 1. Cómo gobiernan su contenido las apps de referencia

- **HECHO** — Preguntados tiene la «Fábrica de preguntas»: los jugadores envían preguntas, otros las califican; con una calificación
  positiva de al menos 100 jugadores pasan a un estado «casi lista», y de ~20.000 propuestas por día llegan ~1.000 al equipo de
  Etermax, que hace el filtro final. Fuentes: [Diario de Cuyo](https://www.diariodecuyo.com.ar/noticias/fabricando-preguntas-694802.html),
  [Etermax](https://etermax.com/news/la-experiencia-de-los-usuarios-que-define-a-preguntados).
- **HECHO** — Duolingo arma cursos con herramientas internas, un «contenido compartido» (curso base que se adapta a muchos idiomas)
  y métricas de calidad por curso e ítem que se dan a quienes escriben. Fuente: [blog de Duolingo](https://blog.duolingo.com/how-were-improving-duolingos-course-creation-process).
- **HECHO** — PostHog gratis (2026): 1 millón de eventos por mes, 5.000 grabaciones, 1 millón de pedidos de interruptores, 1.500
  respuestas de encuestas, 1 proyecto, equipo ilimitado; después, ~USD 0,00005 por evento. Fuente: [Costbench](https://costbench.com/software/product-analytics/posthog/free-plan/).
- **HECHO** — Supabase gratis: 500 MB de base, 1 GB de archivos, 50.000 usuarios activos por mes; los proyectos gratis se pausan tras
  7 días sin uso. Fuente: [Jetadmin](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/).
- **HECHO** — Retool gratis hasta 5 usuarios (Team desde USD 10 por usuario); Appsmith, Tooljet y Budibase son libres y se alojan
  en un servidor de ~USD 10 por mes. Fuentes: [Automation Atlas](https://automationatlas.io/answers/best-retool-alternatives-2026/),
  [OSSAlt](https://ossalt.com/guides/open-source-alternatives-to-retool-2026).
- **HECHO** — CMS con git: Keystatic, TinaCMS y Decap; las funciones editoriales (aprobaciones, programación) son inmaduras o faltan.
  Fuente: [Lucky Media](https://www.luckymedia.dev/compare/decap-cms-vs-keystatic).
- **INFERENCIA** — Con Claude como equipo de desarrollo, una consola a medida cuesta lo mismo que configurar una herramienta genérica
  y además muestra el proyecto (avance, presupuesto, licencias, pendientes). Decisión: capítulo 32 del proyecto, DEC-2026-10-05-3.

## 2. Sonidos libres de uso comercial

- **HECHO** — Todos los paquetes de audio de Kenney (Interface Sounds 100, UI Audio 50, RPG Audio, Impact Sounds, Casino Audio,
  Music Jingles, Digital Audio) son **CC0** (dominio público): uso comercial sin atribución obligatoria. Fuentes:
  [gtstu.com](https://gtstu.com/?p=5011), [OpenGameArt](https://opengameart.org/content/interface-sounds).
- **HECHO** — Freesound permite filtrar por licencia CC0; las vistas previas en mp3 se pueden bajar sin cuenta.
- Se bajaron por GitHub Actions (rama `candidatos` del repositorio de la app) para que el fundador elija de oído en la Sala de sonidos.

## 3. Voces para leer la Biblia

- **HECHO** — Google Cloud Text-to-Speech, gratis por mes: 4 M de caracteres en voces Standard y WaveNet, 1 M en Neural2 y 1 M en
  Chirp 3 HD; después USD 4 (WaveNet), 16 (Neural2) y 30 (Chirp 3 HD) por millón. Fuente: [Costbench](https://costbench.com/software/ai-voice-tools/google-cloud-text-to-speech/).
- **ESTIMACIÓN** — La RV1909 tiene ~3,5–4 M de caracteres: con WaveNet entra en el cupo gratis de un mes; con Chirp 3 HD, ~USD 0 en
  4 meses o ~USD 80–100 de una vez. Requiere cuenta de Google Cloud con tarjeta (regla 8).
- **HECHO** — Piper (motor de voz libre) tiene voces en español de México (`es_MX-claude-high`, `es_MX-ald-medium`) y Argentina;
  Kokoro-82M (Apache 2.0) tiene voces en español. Fuente: [tts.ai](https://tts.ai/voices/piper/?lang=gl), [bash-prompt.net](https://bash-prompt.net/guides/bash-piper-audio/).
  La licencia de cada voz de Piper está en su MODEL_CARD (se guarda junto con las muestras).
- **INFERENCIA** — La voz «fea y española» que oyó el fundador viene de que la app tomaba la primera voz en español del navegador o
  del teléfono (a veces la de España o una robótica de escritorio). Se corrigió: ahora se ordenan por región y calidad y se puede elegir.

## 4. Licencias de las versiones protestantes

| Versión | Titular | Canal | Fuente |
|---|---|---|---|
| RVR1960, RVR1995, RVC, DHH, TLA | Sociedades Bíblicas Unidas (vía American Bible Society) | Formulario de permisos de la ABS; Copyrights Administrator UBS, 1989 NW 88th Court, Miami; API.Bible | [ABS](https://bibles.com/pages/american-bible-society-rights-and-permissions), [Bible Gateway (DHH)](https://BibleGateWay.com/versions/Dios-Habla-Hoy-DHH-Biblia/) |
| NTV | Tyndale House Publishers | permisos@tyndale.com (más de 500 versículos o uso comercial: permiso escrito) | [PDF de Tyndale](https://files.tyndale.com/thpdata/firstChapters/978-1-4964-2987-2.pdf) |
| NVI | Biblica, Inc. | Formulario «Permission Request Form» | [Biblica](https://www.biblica.com/permission-request-form/) |
| LBLA, NBLA | The Lockman Foundation | «Permission to Quote Request Form»; PO Box 2279, La Habra, CA; +1 714 879-3055 | [Lockman](https://www.lockman.org/?p=3) |

- **HECHO** — La cita libre de 500 versículos de DHH, RVR1995 y RVC (SBU) vale solo para uso no comercial y estudio personal.
  Fuente: [Bible Gateway](https://BibleGateWay.com/versions/Dios-Habla-Hoy-DHH-Biblia/).
- **HECHO** — Todas estas versiones están en Bible.com (YouVersion), que no da licencias a apps comerciales. Fuente: [Bible.com](https://bible.com/languages/spa).
- Pedidos redactados en `oportunidades/proyectos/senda/borradores/` (no enviados; requieren el OK del fundador).
