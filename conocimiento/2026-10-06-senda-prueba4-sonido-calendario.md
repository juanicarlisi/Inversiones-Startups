# Senda · lo que trajo la prueba 4 en el teléfono: Biblia sin cortes, firma sonora, calendario, cuentas y licencias

Fecha: 06-10-2026 · Investigación y desarrollo de Claude después de la prueba 4 del fundador (Samsung).

## 1. Lo que contó el fundador (resumen, sin citas textuales)

- La Biblia de papel mejoró mucho, pero la hoja salía cortada abajo y se trababa al usarla. Desde un plan, el Salmo 1 aparecía solo y
  al pasar la hoja únicamente estaba «Terminar capítulo».
- El sonido de la ruleta es feo; los demás mejoraron. Al ganar una pieza no había festejo. Pidió investigar a fondo Preguntados (su
  mejor época) y otras apps de referencia, sin imitar, para que Senda tenga sonidos propios que se reconozcan.
- Calendario: eventos propios, y como evolutivo grupos con roles (líder, coordinador, miembros) donde el líder o el coordinador arman la
  agenda de todos; video, fotos, recordatorios, fechas tope de entrega.
- Evolutivo: un juego de carrera con Lani, con el espíritu de Senda y sin copiar.
- Creó Supabase (token sin vencimiento y con todos los permisos) y PostHog. Envió los dos primeros correos de licencia; se trabó con
  los formularios.

## 2. Causas encontradas (INFERENCIA de Claude, verificada en la vista web)

- **Corte abajo:** la grilla de renglones no tenía en cuenta el tamaño de letra del sistema (Samsung lo agranda): el texto quedaba más
  alto que lo medido y la hoja lo cortaba. Ahora la escala del sistema entra en el tamaño de letra del lector y el texto de la grilla
  no se vuelve a escalar.
- **Trabas:** al empezar y al terminar cada vuelta de hoja se desarmaban y rearmaban hasta cinco bloques de texto. Ahora las hojas
  vecinas quedan montadas y solo cambia su papel. Además, la medición de capítulos vecinos espera a que la hoja esté quieta y la
  posición se guarda con la hoja quieta.
- **Salmo 1 solo:** el bloque «Terminé» medía unos 5 renglones y no entraba en los 2 que sobraban. Ahora ocupa 2. Desde un plan dice
  «Terminé · sigue Salmos 2» y pasa solo al siguiente.

## 3. Benchmark de sonido y enganche (para la firma sonora)

- **HECHO:** Preguntados se volvió masivo con una consigna clásica, la de las preguntas como en los programas de TV, más las conexiones
  sociales. Tenía 6 personajes por categoría, una corona cada 3 aciertos, la ruleta («Willy») y 25 rondas [Diario de Cuyo, 2014;
  GameFAQs].
- **HECHO:** Trivia Crack 2 (2018) recibió quejas por las vidas que cortan el juego y por los anuncios; para varios reseñadores
  cambiaba poco respecto del original [Megacool/Medal; Common Sense Media; Android Police].
  - **Lección para Senda:** no cortar la sesión con límites artificiales y no cambiar lo que funcionaba.
- **HECHO:** en un experimento en clase con Kahoot!, quitar el audio cambió de forma significativa la concentración, el compromiso, el
  disfrute y la motivación, y el audio mejoró la dinámica del aula [Wang y Lieberoth, ECGBL 2016].
- **HECHO:** Duolingo usa una campanita breve en cada acierto como micro-recompensa, y la llevó a su publicidad del Super Bowl [Out of
  Scope].
- **HECHO:** sobre los logos sonoros:
  - un logo sonoro dura de 2 a 5 segundos y debe ser simple y usarse en todos los puntos de contacto;
  - los estudios hallan que unas seis notas, agrupadas y acentuadas, se recuerdan mejor;
  - el de Intel son 5 notas [Inkbot; IRPR Sound; academia.edu].
- **HECHO:** en las ruletas físicas, el clic sale de una lengüeta flexible que golpea cada clavo; cuando la rueda ya no tiene velocidad
  para pasar un clavo, se detiene [patente US10803699].
- **HECHO:** el «juice» (sonido y animación que responden a cada acción) hace que un juego se sienta vivo, pero en exceso es ruido
  [Jonasson y Purho, «Juice it or lose it»; Wayline].
- **Aplicado:**
  - un instrumento propio (marimba con campanita), un motivo de 4 notas en re mayor y todos los momentos grandes hechos con el mismo
    material;
  - la ruleta con clics reales sincronizados con cada casillero y una nota por categoría al frenar;
  - el festejo de pieza en cuatro tiempos (anticipación, golpe, recompensa y calma) sincronizado con su sonido;
  - los sonidos chicos (acierto, error), que al fundador ya le gustaban, quedan como estaban.

## 4. Cuentas

- **HECHO (06-10-2026):** el flujo de GitHub aplicó la migración `20261026000000_inicio.sql` al proyecto de Supabase del fundador
  («Applying migration… Finished supabase db push»), con los secretos del repositorio.
- **HECHO:** los tokens personales de Supabase pueden vencer (duraciones prefijadas, una fecha de hasta un año o nunca) y registran su
  uso. Hay tokens «con alcance», que permiten elegir organizaciones, proyectos y permisos; están en alfa pública y no todas las cuentas
  los tienen [Supabase changelog #38248; docs de Personal Access Tokens].
  - **Recomendación:** cambiarlo por uno que venza en un año y, si aparece la opción, con alcance solo al proyecto «senda».
  - No es urgente: el token vive solo como secreto de GitHub.
- **Hecho en la app:**
  - respuestas anónimas del Espadeo y votos del Pulso a Supabase, con lectura de los resultados reales;
  - el APK detecta la región de PostHog y el tipo de clave pública de Supabase, y prueba la lectura al compilar;
  - política de privacidad 0.2.

## 5. Licencias

- **HECHO:** Biblica no suele licenciar productos o software en desarrollo; con el producto terminado se manda el formulario. El
  texto completo de una traducción solo se licencia a una persona jurídica registrada, con documentación [biblica.com/permissions,
  según el buscador].
  - **Campos del formulario:** solicitante, si pide como empresa o como persona, traducción, formato, pasajes, porcentaje, editorial,
    fecha, precio, costo de desarrollo, declaración de fe, funciones, qué tiene de único, si pide inicio de sesión, anuncios,
    suscripción, otras traducciones y estado de distribución.
- **HECHO:** el formulario de Lockman exige una dirección postal para dar el permiso. Pide nombre, empresa y tipo, dirección, correo,
  web, título del proyecto, traducción, formatos, destinatarios, porcentaje de versículos, si es personal o gratuito, editorial y
  pedidos especiales [lockman.org, según el buscador].
- **Decisión recomendada:** NVI y LBLA después del lanzamiento y con la empresa del holding (enero o febrero de 2027). Los campos
  quedaron listos, uno por uno, en la Consola.

## 6. Evolutivos registrados

- **Grupos con roles y agenda compartida:** capítulo 13, sección 3b.
  - **HECHO:** Planning Center, que domina en EE. UU., cobra de USD 14 a 119 por mes por producto; su app para miembros (Church
    Center) es gratis para las iglesias que lo usan [faith.tools / subger, 2026].
- **Lani corre:** capítulo 10, sección 10.
  - **INFERENCIA:** las mecánicas de juego no se protegen con derecho de autor; sí el arte, los personajes y la presentación.
  - En la búsqueda del 06-10-2026 no apareció ninguna patente sobre carreras de tres carriles. Antes de construir: búsqueda de
    patentes y consulta legal.

## Fuentes

- Diario de Cuyo (2014), Preguntados y duelos: https://diariodecuyo.com.ar/mundo/-Preguntados-prepara-duelos-entre-muchos-jugadores-al-mismo-tiempo-20140518-0097.html
- GameFAQs, Trivia Crack FAQ: https://gamefaqs.gamespot.com/android/205239-trivia-crack/faqs/74422
- Megacool/Medal, Trivia Crack 2: https://megacool.medal.tv/blog/how-trivia-crack-2-built-on-the-success-of-the-original-and-5-things-it-could-do-better/
- Common Sense Media, Trivia Crack 2: https://www.commonsensemedia.org/app-reviews/trivia-crack-2
- Android Police, Trivia Crack 2: https://www.androidpolice.com/2018/10/16/trivia-crack-2-hands-prettier-package/
- Wang y Lieberoth, «The effect of points and audio… using Kahoot!» (ECGBL 2016): https://folk.idi.ntnu.no/alfw/publications/ECGBL2016-Effect_of_points_and_audio_in_Kahoot.pdf
- Out of Scope, sonidos de producto (Duolingo): https://out-of-scope-product.beehiiv.com/p/duolingo-has-it-venmo-has-it-even-slack-has-it-your-product-doesn-t
- Inkbot, logos sonoros: https://inkbotdesign.com/famous-sonic-branding-examples/
- IRPR Sound, cómo diseñar un logo sonoro: https://sounddesign.irpr.agency/guides/how-to-design-a-sonic-logo/
- Patente US10803699, ruleta con sonido: https://patents.google.com/patent/US10803699
- Wayline, exceso de «juice»: https://www.wayline.io/blog/juice-overload-sensory-feedback-hurts-gameplay
- Supabase, vencimiento y uso de tokens: https://supabase.com/changelog/38248-personal-access-tokens-expiration-usage-tracking
- Supabase, Personal Access Tokens: https://supabase.com/docs/guides/platform/personal-access-tokens
- Biblica, permisos y formulario: https://www.biblica.com/permissions/ · https://www.biblica.com/permission-request-form/
- Lockman, formulario de permiso: https://www.lockman.org/permission-to-quote-request-form/
- Planning Center (faith.tools): https://faith.tools/app/planning-center
