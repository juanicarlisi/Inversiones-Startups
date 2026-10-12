# El desarrollo hasta hoy

<div class="enpocas" markdown="1">
**En pocas palabras.** El desarrollo empezó el 05-10-2026. En una semana salieron once versiones de prueba, y cada una cambió algo
de lo que el fundador marcó. Hoy funcionan 82 de las 154 funciones del mapa de toda la app (capítulo {{cap:06}}). Lo que más se
adelantó: la Biblia (casi completa para el lanzamiento: directa, rápida, con lectura continua y el «+» de estudio), la Travesía
(12 rutas abiertas, 128 lecciones publicadas, con una línea clara en cada una) y el Espadeo de práctica, con Lani ya en Rive. Lo que
más falta: los duelos con amigos, las cuentas y la confirmación de dos revisores doctrinales.
</div>

## 1. Cuánto falta para el lanzamiento, por área

{{ESTADO}}

El avance es una ESTIMACIÓN de Claude con un criterio fijo: cuenta solo lo que funciona en la app de prueba y pasó por la vista
previa, no lo que está diseñado en este proyecto. Lo actualiza Claude al cerrar cada sesión (`estado.yaml`) y se ve en la Consola.

## 2. Cómo trabajamos: una prueba, una tanda de cambios

1. **Vos probás** el APK en el teléfono (o la vista previa en el navegador) y contás qué cambiarías.
2. **Claude lo registra** en el capítulo {{cap:31}} («tandas»), sin citas textuales, con qué quedó y dónde.
3. **Claude lo hace**: código en `juanicarlisi/senda-app`, contenido validado contra la RV1909, sonidos y arte propios.
4. **Sale la prueba siguiente**: el APK lo arma GitHub Actions (gratis) y queda en la pestaña Releases; la vista previa y la Consola
   se publican como páginas privadas.
5. **Se actualiza el proyecto**: este documento, el estado, el roadmap y el mapa de toda la app.

**Las reglas que salieron de las pruebas** (quedaron como reglas del repositorio de la app):

- **Nada infantil, nivel profesional.** Si una pantalla, un sonido o una animación se ve más pobre que Duolingo o Preguntados, no sale.
- **Lo hace el teléfono.** Biblia, Travesía, Espadeo solo, sonido y la Lani 3D no cuestan servidor. El servidor guarda solo lo compartido.
- **Crecer sin rehacer.** Cada proveedor detrás de un módulo propio; las etapas de escala son configuración, no reescritura.
- **Las ideas del fundador son semillas.** Se evalúan, se fusionan y se mejoran («así no → mejor así»); nunca se copian.
- **Todo enseña y edifica** (prueba 9). Si una función o un juego no ayuda a aprender o a vivir algo de Dios y de su Palabra, no va.
- **Una línea clara** (prueba 11). En las rutas que cuentan una historia, cada lección dice qué pasó antes, qué pasa, cuándo y qué
  sigue; cada capítulo, qué se aprende. Lo que no está en la Biblia lleva su fuente y lo dudoso se dice.

## 3. Lo que sigue

| Cuándo | Qué | Quién |
|---|---|---|
| Esta semana | Probar la prueba 11: Lani en Rive, la música nueva, el gran relato, Pablo, Testigos fieles, La historia de la Iglesia, el «+» y las vidas; enviar el pedido de la RVR1960 a la Sociedad Bíblica Argentina | Vos |
| Antes del 26-10 | Elegir 1 o 2 revisores doctrinales que confirmen lo publicado (128 lecciones y 137 preguntas) | Vos |
| Sprint 2 (26-10 al 8-11) | Los 66 libros y Personajes; más paquetes del «+»; cuentas anónimas y respaldo del progreso; misiones reales | Claude |
| Sprint 3 (9 al 22-11) | Duelos por turnos con amigos y rival al azar, partidas abiertas que vencen a las 72 h, avisos push; banco grande de preguntas | Claude; vos creás las cuentas gratis de Expo y Firebase |
| Antes del 15-11 | Cuenta de Google Play (USD 25) para la prueba cerrada de 12 testers durante 14 días | Vos |
| Sprint 4 (23-11 al 6-12) | Tu Lani (atuendos y vehículos, en 3D si te gusta), Giro diario, accesibilidad y la prueba cerrada | Claude y los testers |
| 18-12-2026 | Lanzamiento en Android | Juntos |
