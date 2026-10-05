# Senda: dificultad de la trivia, contactos de licencias, cuentas de servicios y presupuesto mínimo

Fecha: 2026-10-05 · Investigación de Claude para la cuarta tanda de pedidos del fundador (después de probar el APK de la prueba 2).
Método: buscador (las páginas de Biblica, Tyndale, ABS y varias más están bloqueadas en el entorno de Claude). Lo que decide plata
se re-verifica en la fuente primaria antes de gastar.

## 1. Dificultad en juegos de preguntas y práctica adaptativa

- **HECHO** — Duolingo (Birdbrain) estima, para cada ejercicio y persona, la probabilidad de acertar con un modelo logístico que
  ajusta a la vez la dificultad del ejercicio y la habilidad del alumno; si el alumno viene bien, le da ejercicios con ~70 % de chance,
  y si viene mal, más fáciles. Fuente: [IEEE Spectrum](https://spectrum.ieee.org/duolingo).
- **HECHO** — El sistema Elo se usa en educación para estimar a la vez la habilidad de cada alumno y la dificultad de cada pregunta
  (cada respuesta es un «partido»); Pelánek y otros lo aplicaron a la práctica adaptativa de hechos. Fuentes: [Masaryk University
  (Elo-based learner modeling)](https://www.muni.cz/en/research/publications/1359654), [arXiv 2507.19728](https://arxiv.org/pdf/2507.19728).
- **HECHO** — Regla de diseño de trivias: abrir fácil y cerrar difícil (~90 % de acierto en la primera pregunta, ~70 % en el medio,
  30–40 % en las últimas) y la «regla 70/30» (70 % accesibles). Fuente: [Woobox, trivia quiz question design](https://cdn.woobox.com/articles/trivia-quiz-question-design).
- **HECHO** — HQ Trivia y ¿Quién quiere ser millonario? suben la dificultad pregunta a pregunta; en HQ el salto era tan brusco que
  las últimas eran casi imposibles (críticas de jugadores). Fuente: [The Pitt News](https://pittnews.com/article/126689/opinions/hq-trivia-fad-tires-trivia-fans/amp).
- **HECHO** — «Regla del 85 %»: el aprendizaje es más rápido con ~85 % de acierto (Wilson, Shenhav, Straccia y Cohen, Nature
  Communications, 2019). Fuente: [PMC6831579](https://pmc.ncbi.nlm.nih.gov/articles/PMC6831579).
- **HECHO** — Preguntados: fábrica de preguntas con calificación de jugadores; el sistema aprende qué preguntas son relevantes para
  cada usuario. No se encontró documentación pública de cómo dosifica la dificultad. Fuente: [Diario de Cuyo](https://www.diariodecuyo.com.ar/noticias/fabricando-preguntas-694802.html).
- **INFERENCIA** — Para Senda: 5 niveles, habilidad por categoría estilo Elo, «ola» de probabilidad objetivo (promedio ≈ 73 %),
  rescate, preguntas de oro sin penalidad. Simulación propia (30 partidas × 14 preguntas por perfil): jugador medio ~70 % de acierto.

## 2. Contactos de licencias (corregidos)

- **HECHO** — American Bible Society: pedidos de permiso por correo a **licensing@americanbible.org** (página «Bible Copyright
  Compliance»); apps móviles requieren permiso escrito. Fuente: [ABS](https://bibles.com/pages/american-bible-society-rights-and-permissions).
- **HECHO** — Tyndale: **permissions@tyndale.com** (y formulario en tyndale.com/permissions/form); hasta 500 versículos sin permiso
  escrito, más o uso comercial con permiso. Fuente: [Tyndale permissions](https://www.tyndale.com/permissions).
- **HECHO** — Lockman: «Permission to Quote Request Form» en lockman.org; PO Box 2279, La Habra, CA 90631; (714) 879-3055. Fuente:
  [Lockman](https://www.lockman.org/?p=3).
- Sin cambios: Biblica (formulario), RVG (correo publicado en eBible.org), Sociedad Bíblica Argentina (sin correo público encontrado;
  queda como pedido opcional).

## 3. Cuentas de servicios

- **HECHO** — Supabase: proyecto nuevo con nombre, contraseña de base y región; claves en Settings → API; para CI se usan
  `SUPABASE_ACCESS_TOKEN` (supabase.com/dashboard/account/tokens), `SUPABASE_DB_PASSWORD` y el id del proyecto con `supabase db push`.
  Fuentes: [Vercel Academy](https://blog.vercel.com/academy/subscription-store/supabase-project-setup.md), [Finalist tech blog](https://techblog.finalist.nl/blog/deploying-supabase-migrations-github-actions).
- **HECHO** — PostHog: registro, elección de nube US o EU, «Project API key» (empieza con `phc_`) en Project Settings. Fuente:
  [Lovable docs (PostHog)](https://docs.lovable.dev/integrations/posthog).

## 4. Presupuesto

- **INFERENCIA** — Con Claude haciendo interfaz, animación, íconos, sonido (CC0) y contenido, el gasto único imprescindible del primer
  año es la cuenta de Google Play (USD 25) más IA de traducción en 2027 (USD 30): **USD 55**. Lo profesional (USD 5.974) es opcional.
