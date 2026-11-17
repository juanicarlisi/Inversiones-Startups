# Remanso y Sobremesa · Plan de los canales de música hechos con Claude (17-11-2026)

> Pedido del fundador (17-11-2026): crear los canales de música de YouTube con Claude (toda la música, las imágenes y los videos),
> con las herramientas que haya, lo más barato y de la mejor calidad posible; lo pago, solo si no es monstruoso. Decisión:
> DEC-2026-11-17-9. Fichas: `../P9-remanso.yaml` (al día) y `../P8-sobremesa.yaml`.
>
> Se apoya en cuatro trabajos del mismo día:
> - `conocimiento/2026-11-17-musica-ia-herramientas.md`: generadores, modelos abiertos, imagen, animación, directo y subida, con
>   precios y licencias en fuente oficial.
> - `conocimiento/2026-11-17-musica-ia-youtube-mercado.md`: reglas de YouTube, 15 canales comparables, pago por vista, derechos,
>   SADAIC y el caso a tres años.
> - `conocimiento/2026-11-17-musica-ia-taller.md`: música compuesta por Claude y tocada con instrumentos grabados, medida.
> - La prueba de Stable Audio 3 en esta máquina (§2).

## 1. Lo que cambia el plan (HECHOS)

| Hecho | Fuente y fecha | Qué cambia |
|---|---|---|
| Desde el 01-02-2027 el programa de socios pide 1.000 suscriptores y **8.000 horas** en un año (antes 4.000), o 20 M de vistas de Shorts en 90 días; los que ya están adentro quedan exentos | Anuncio de YouTube del 10-08-2026; 9to5Google, vidIQ, Metricool y otros (17-11-2026) | Monetizar tarda el doble: el corte pasa de 9 a 12 meses. No hay forma realista de entrar antes del 01-02 con un canal nuevo |
| YouTube no monetiza lo genérico, repetitivo o hecho con plantilla; una imagen fija con música está en riesgo | Política de contenido no auténtico, aclaración del 16-07-2026 | Cada video tiene un concepto propio y una capa humana a la vista (consignas, versículos, capítulos) |
| La música de oración en español paga ~USD 0,6-1,2 por mil vistas | ESTIMACIÓN con fuentes de terceros (bitácora de mercado §3.1) | La ficha suponía 2: menos plata por vista |
| La música compuesta por una IA (también la que Claude escribe nota por nota) no tiene autor humano protegible | Oficina de Derechos de Autor de EE. UU. (ene-2025); la Corte Suprema no revisó Thaler (02-03-2026) | No se registra en Content ID; se guarda la procedencia de cada tema para defenderse de reclamos |
| Stable Audio 3 (modelo abierto, entrenado con música con licencia) **corre en la máquina de Claude sin GPU**, más rápido que el tiempo real | Prueba propia del 17-11-2026 (§2) | Música generada gratis para Sobremesa y para colchones de ambiente |
| ElevenLabs Music prohíbe armar una biblioteca de música en sus planes; Suno no tiene API oficial | Términos de cada uno (09-10-2026 y 03-09-2026) | Quedan afuera de la cadena |

## 2. Lo que se probó hoy (HECHO, máquina de Claude: 4 núcleos, sin GPU)

| Vía | Qué salió | Tiempo | Costo | Nota franca (sin oído humano todavía) |
|---|---|---|---|---|
| **Claude compone nota por nota** (MIDI) y lo toca con el piano de concierto Salamander (licencia CC BY 3.0, con crédito), reverb con respuestas al impulso de Voxengo, master a −14 LUFS | «Junto a aguas de reposo», 3:35; bossa «Tarde en Colegiales», 1:20 | Piano: 9 s de render y 45 s de master | USD 0 | Piano 6/10 (bueno de mercado: 8); bossa 4/10 (la guitarra y las escobillas libres suenan a demo) |
| **Stable Audio 3 medium** (licencia comunitaria de Stability) en CPU | Piano para orar, ambiente para dormir, bossa y tango lounge, de 45 a 60 s cada uno | 31-40 s por clip (≈1,3 veces el tiempo real) | USD 0 | Falta escuchar: el ranking a ciegas independiente lo pone 80 puntos debajo de Lyria 3.5 y 150 debajo de Suno |
| **Video** | Paisaje de agua al amanecer dibujado por código, con movimiento lento del agua y la luz, título en EB Garamond; 1920×1080 | Una hora de video se arma en segundos (ciclo de 20 s repetido) | USD 0 | Se ve profesional y no «hecho con IA» |

**La prueba que decide:** la página «Escuchá las pruebas» (https://claude.ai/artifact/DW5Qn3vJdCZQ8kttz5Cn7a) tiene los clips a ciegas,
con el mismo volumen, y guarda las notas del fundador (base del artefacto, colección `votos`). Claude las lee al empezar la próxima
sesión. Correspondencia (no está a la vista en la página hasta que el fundador la pide): A = compuesto por Claude; B y C = Stable
Audio 3; D = bossa compuesta por Claude; E = bossa de Stable Audio 3; F = tango lounge de Stable Audio 3.

## 3. La cadena de producción (decisión de Claude, regla 10)

| Pieza | Elección | Por qué | Regla de corte |
|---|---|---|---|
| Música de Remanso (piano para orar) | **Compuesta por Claude** con Salamander; arreglos propios de himnos de dominio público verificado | Gratis, piano grabado de verdad, cada tema es único (contenido auténtico ante YouTube), procedencia documentada | Si en la prueba de escucha B o C le ganan a A, el piano pasa a Stable Audio 3. Si ninguno llega a 7, se prueba Lyria 3.5 (USD 0,08 por tema) y, para el piano compuesto, un piano pago (Pianoteq, precio a verificar, con OK) |
| Colchones (Dormir, Estudio) | **Stable Audio 3** en la máquina de Claude | Gratis, sin cuentas para generar, entrenado con datos con licencia | Si suena a máquina en la prueba, Lyria 3.5 |
| Música de Sobremesa | **Stable Audio 3**, o **Lyria 3.5** si la prueba de escucha lo pide | Los instrumentos libres no alcanzan para un ensamble (bossa 4/10) | Lo decide la prueba de escucha (D, E, F) |
| Imágenes y escenas | **Dibujadas por Claude en código** (identidad propia); Nano Banana 2.1 (USD 0,05 por imagen) solo para variar miniaturas | Distintas de todo lo que hay; nada que parezca «hecho con IA» | Si el clic en miniaturas queda debajo de 2% con más de 10 mil impresiones, se prueba otra dirección visual una vez |
| Armado | **ffmpeg** en la máquina de Claude | Gratis y rápido | — |
| Directos | **Un servidor chico** (Hetzner, desde EUR 5,49 por mes) que transmite con ffmpeg: directo semanal de 11 h archivado y 24/7 desde el mes 2 | Las 11 h archivadas suman horas; el 24/7 hace hábito | Contratarlo pide el OK del fundador |
| Subida | **YouTube Data API** con el proyecto de Google Cloud del fundador, en producción | 100 subidas por día; en modo prueba el permiso vence a los 7 días | — |

## 4. Presupuesto por mes (ESTIMACIÓN)

| Nivel | Qué compra | Costo |
|---|---|---|
| **Cero** | Remanso entero (música, escenas, videos, cortos) y Sobremesa con Stable Audio 3, sin directos 24/7 | **USD 0** |
| **Base (recomendado desde el mes 2)** | Lo anterior + un servidor para los directos de los dos canales | **~USD 6** |
| **Más calidad** | Lo anterior + Lyria 3.5 para Sobremesa (dos videos por semana) + imágenes de Nano Banana + animaciones cortas | **~USD 30** |
| **Tope** | Más volumen, la prueba a ciegas con más jueces y un segundo servidor | **~USD 70** |

Nada de esto se gasta sin el OK del fundador (regla 8). La capacidad de Claude que usan los canales sale del plan Max que ya se paga.

## 5. Formato de salida (resumen; detalle en la bitácora de mercado §10)

**Remanso, serie «Aguas de Reposo», salida en enero de 2027 (el mes del ayuno).** 8 videos el primer día: 4 de oración guiada sin voz
(20-30 min, capítulos Adorar, Confesar, Agradecer, Pedir, Escuchar, Leer, con consignas y versículos en pantalla verificados con las
reglas de Senda) y 4 de fondo (1 y 3 horas). Dos por semana los primeros tres meses. Directo semanal de 11 h archivado («Noche de
oración») y 24/7 desde el mes 2. Cortos de 20-40 s con un versículo. Cruce con Senda: banda sonora propia de la app (sus juegos
no pueden usar música de Mixkit) y enlaces en las dos direcciones.

**Sobremesa, «Bossa y jazz para la sobremesa», solo si Remanso pasa la compuerta del mes 6** (julio de 2027). Un estilo con
identidad porteña; tango lounge a los 6 meses. La venta a locales queda cerrada hasta tener una opinión legal escrita (SADAIC,
AADI-CAPIF, Fondo Nacional de las Artes) y un reproductor propio: los términos de YouTube no permiten pasar su música en un local.

**Reglas de oro:** declarar siempre el contenido sintético; pocos videos y distintos; capa humana a la vista; identidad propia (sin
rostros, sin imágenes de Jesús, sin imitar artistas); texto bíblico verificado; verificar derechos en YouTube Studio antes de
publicar; guardar la procedencia; no registrar Content ID; nada que infle vistas.

## 6. Caso y cortes

| | Este plan (valor esperado por mes, ESTIMACIÓN) | Chance de que monetice |
|---|---|---|
| Remanso | ~USD 25 a fines de 2027, ~100 en 2028, ~190 en 2029 | ~30-35% |
| Sobremesa (YouTube) | ~USD 80, 220 y 350 a los 12, 24 y 36 meses (~130 a 36 meses si la audiencia es latinoamericana) | ~28% |
| Los dos | ~USD 350 por mes esperados a tres años; 65-70% de chance de que ninguno monetice | — |

Por qué igual conviene (INFERENCIA): cuesta casi cero en plata, poca atención del fundador y le da a Senda música propia; si pega,
es un activo que paga solo. **Cortes:** mes 6 de Remanso (200 suscriptores y 2.000 horas, si no se dejan de hacer videos nuevos y
Sobremesa no arranca); mes 12 (1.000 suscriptores y 8.000 horas, si no se corta YouTube); dos rechazos por contenido no auténtico o
un reclamo válido: pausa y auditoría.

## 7. Quién hace qué

**Claude:** compone y genera la música, dibuja las escenas, arma los videos, escribe títulos, descripciones y consignas (con el
validador de Senda), prepara los 8 videos de salida, mide y reporta.

**El fundador (regla 8):**
1. Escuchar la prueba a ciegas y votar (15 minutos).
2. Crear los canales de YouTube con su cuenta (o la del holding) cuando estén los 8 videos.
3. Registrarse gratis en la licencia comunitaria de Stability si se usa Stable Audio 3 para publicar.
4. Crear el proyecto de Google Cloud para que Claude suba los videos (con un prompt para Claude en Chrome).
5. Aprobar el servidor de los directos (~USD 6 por mes) en el mes 2.
