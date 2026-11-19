# Capítulo 84 — Sobre sorpresa, testers tercerizados y anuncios (19-11-2026)

## 1. Lo que pidió el fundador

- **Videos:** «los videos quedaron ok por ahora» (el de capacitación corregido y el comercial de 30 s).
- **Álbum:** «como que muestra a quién trae antes de abrirlo? malísimo. tenés que comprar el sobre con talentos y de ahí ves quién es».
  Ritmo intermedio: ni 15 días ni un año para completarlo.
- **Torneos:** «la inscripción a algún torneo capaz también se podría hacer con talentos […] más bien fácil […] a los de Senda, no a los
  de la igle».
- **Testers:** «te acordás que lo íbamos a hacer con un tercerizado? por qué siempre me repetís lo mismo de buscar gente».
- **iPhone:** «lo que quiero es que una persona lo pruebe, tal como venimos haciendo cuando compartí el link».
- **Anuncios:** «¿están bien seteados para que la recaudación sea buena? […] 5 vidas quizás es un montón […] cada 2 veces que perdés en una
  trivia […] en la travesía, luego de completar 2 niveles […] benchmark exhaustivo, análisis profundo».
- **Copa de Verano:** «dejemos la copa, por ahora sin premios».
- **TAD:** la constancia era de la AAIP (paso 1 hecho).

## 2. El sobre del álbum vuelve a ser sorpresa (DEC-2026-11-19-1; commit bf5a5a2 de `senda-app`)

- Se compra con Talentos y al abrirlo se ve quién trae. Nunca una repetida. Los más importantes salen menos (peso 4, 2 y 1).
- 100 Talentos el sobre, uno por día; el primero de cada página, gratis y aparte.
- **ESTIMACIÓN** (simulación con los supuestos de `herramientas/simulacion_talentos.py`, 300 corridas, con llaves y un torneo por semana):
  ~9 semanas quien juega seguido, ~7 quien juega mucho (lo frena el tope diario; sin tope eran 3 a 4 semanas), ~6 meses quien entra de
  vez en cuando.
- En Brasil se ve a quién trae (ECA Digital, art. 20); Brasil entra el 01-03-2027.
- Los cuestionarios de Play y Apple siguen en «no»: los ítems al azar no se compran con plata. Se confirma en la sesión legal.

## 3. Torneos de Senda con Talentos

- Anotarse a un torneo de Senda para todos cuesta 30 Talentos (dos partidas ganadas); al desanotarse se devuelven.
- Si no alcanzan, la tarjeta dice cuánto falta y un botón lleva a jugar.
- Los de la iglesia, los de amigos y la trivia del sermón no cobran. Sin premios de valor; si algún día hay premios, ese torneo va gratis.

## 4. Los testers de Google, tercerizados (DEC-2026-11-19-2)

- No estaba escrito en ningún lado: por eso volvía la propuesta de juntar gente. Quedó en la decisión, en `estado.yaml` y en CLAUDE.md.
- **Recomendado: Testers Community, plan Pro, USD 25 una vez** (25 testers, 13 de margen; informe y respuestas para pedir producción;
  devolución si no se aprueba). Alternativa: PrimeTestLab Enterprise, USD 29,49. Precios leídos en sus páginas el 19-11-2026.
- Orden: crear la app en Play Console → ficha y cuestionarios → prueba cerrada con la versión 1.0.4 → Google la revisa → pagar el
  servicio (con su OK) y darle el enlace → 14 días → pedir producción. Tiene que arrancar antes del 02-12.
- Versiones para la tienda: 1.0.3 (19-11, con los Talentos del 18-11) y **1.0.4** (19-11, con todo lo de este capítulo), las dos
  armadas en GitHub («AAB para Google Play»).

## 5. iPhone con el enlace público de TestFlight

- El enlace: https://testflight.apple.com/join/1uk7NVnt (grupo externo «Probadores»).
- Quien lo prueba instala TestFlight desde el App Store, abre el enlace y toca «Instalar».
- Para que le llegue la última versión, esa compilación tiene que estar agregada al grupo «Probadores» en App Store Connect (la primera
  de cada versión pasa por la revisión beta de Apple).

## 6. Anuncios y vidas

**El informe:** `conocimiento/2026-11-19-senda-anuncios-y-vidas.md` (benchmark con fuentes, análisis y modelo) y
`herramientas/simulacion_anuncios.py` (corrido el 19-11: los números del informe coinciden).

**Hallazgos:**
1. El contador de «2 libres por día» vivía en memoria y volvía a cero cada vez que el sistema cerraba la app: salían ~28 % menos
   intersticiales de los que dice la regla.
2. La guía 2.5.18 de Apple pide poder denunciar un anuncio inapropiado: no estaba.
3. Bajar a 3 vidas no suma plata (más videos, ~9 % menos juego: entre −8 % y +5 % según cuántos miren el video, antes de contar a los
   que se van) y corta una lección de un principiante a la mitad unas 30 veces más seguido (14,8 % contra 0,5 %).
4. «Cada 2 derrotas» en la trivia equivale a «cada 2 turnos» y castiga al que más pierde; en los duelos con personas no había ningún
   anuncio hasta el final.
5. En la Travesía, «cada 2 niveles» mostraría menos anuncios que hoy (hoy hay uno al terminar cada lección, con reloj).

**ESTIMACIÓN, USD por día cada 1.000 activos en Latinoamérica:** hoy 1,57; con el contador arreglado 2,10; con lo recomendado 2,30;
con la propuesta del fundador 2,90 pero con ~12 % menos activos al estabilizarse. Lo que más mueve la plata no es la cantidad de
anuncios: con 15 % de activos en EE. UU., ese país pone el 56 % del ingreso.

**Lo que se hizo** (commit a2a5906 de `senda-app`; `docs/ANUNCIOS.md`):
- el contador del día se guarda en el teléfono; el día de instalación sin intersticiales; tope de 12 por día;
- en los duelos con personas, un intersticial al mandar cada 2 turnos (la idea del fundador donde sí suma), con el reloj de 4 minutos;
- un video con premio reinicia el reloj;
- tabla `parametros` en Supabase: vidas, minutos por vida, reloj, libres, tope, turnos de duelo y día de instalación, para ajustar sin
  otra versión;
- «Reportar un anuncio» en Ajustes → Ayuda;
- 68 pruebas en verde (7 nuevas en `pruebas/arranque/anuncios.test.tsx`).

**Lo que espera la decisión del fundador** (DEC-2026-11-19-3, propuesta):
1. Las vidas siguen en 5 (recomendado) o bajan a 3 o 4 (se cambia en `parametros` sin otra versión).
2. En la Travesía, que la lección gaste 1 vida al empezar y los errores no (y la perfecta la devuelva): una lección empezada se termina
   siempre.
3. Cuando haya volumen, una prueba «intensa» (reloj de 3 minutos) al 20 % de las personas nuevas.

**Regla de corte:** se retrocede si la vuelta del día 7 cae 1,5 puntos o más (o la del día 1, 2 puntos), si más del 20 % de los
intersticiales de un lugar terminan la sesión, si más del 10 % de las reseñas de 1-2 estrellas hablan de anuncios o vidas, o si la nota
baja de 4,5. Con 1.500 personas nuevas por grupo solo se detectan ~3,5 puntos de D7; para 1,5 hacen falta ~9.000 por grupo.

**Limitaciones:** no hay eCPM publicado por formato para Argentina ni Colombia (se usa el de Latinoamérica); la rebaja por anuncios sin
personalizar (×0,55) es una HIPÓTESIS; algunos centros de ayuda (Etermax, King) no se pudieron leer.

## 7. Herramientas (regla 10)

- Servicio de testers: Testers Community (testerscommunity.com), elegido por precio, margen de testers, garantía y reseñas; corte: si
  Google no aprueba producción, se usa la garantía de devolución y se pasa a PrimeTestLab.
- Parámetros remotos: la misma Supabase de la app (sin servicio nuevo).

## 8. Lo que queda del fundador

1. Play Console, tarea por tarea (la primera, en el chat: crear la app y contestar las preguntas).
2. Pagar el servicio de testers (USD 25) cuando la prueba cerrada esté creada.
3. La decisión sobre vidas y Travesía (DEC-2026-11-19-3).
4. AAIP, paso 2 (inscribir la base de datos de Senda).
5. INPI: firmar y pagar las cuatro marcas antes de que la ficha sea pública.
