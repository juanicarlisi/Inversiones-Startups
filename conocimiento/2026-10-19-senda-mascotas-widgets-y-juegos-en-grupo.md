# Senda, prueba 20: mascotas que la gente quiere, widgets de Android y juegos para jugar en grupo

**Fecha:** 19-10-2026. **Para:** capítulo 45 del proyecto Senda. **Etiquetas:** HECHO (fuente y fecha), ESTIMACIÓN, HIPÓTESIS,
INFERENCIA. La red del entorno bloquea varios sitios: lo que viene de motor de búsqueda o de fuentes secundarias se marca.

## 1. Cómo animan los personajes las apps que la gente quiere

- **HECHO (blog de Duolingo, «Building character», leído el 18-10-2026):** cada personaje tiene su animación propia que se reproduce
  cada vez que el alumno responde bien; después de varias correctas seguidas hay «interludios» que premian la racha; al terminar la
  lección, los personajes cruzan la pantalla. El texto no describe reacciones al error. Principios declarados: «contenido sólido,
  pero no sin momentos de deleite y rareza»; la marca «camina la línea entre lo auténtico y lo descabellado»; los personajes son
  personas modernas «entrañablemente torcidas a la manera de Duolingo», no seres fantásticos.
- **HECHO (Rive, caso «Duolingo's AI-powered Video Call brings Lily to life», leído el 18-10-2026):** Lily no está preanimada
  reacción por reacción: una máquina de estados mezcla piezas modulares en tiempo real (se inclina si algo le interesa, entrecierra
  los ojos o niega con la cabeza si no entiende, levanta una ceja y asiente si la impresionan, pone los ojos en blanco si no);
  **ocho animaciones de cabeza y ocho de cuerpo se combinan en más de 64 variaciones de reposo**, así el ocio nunca se repite igual;
  las partes de la cara se apilan «como una risografía» y la cabeza y el cuerpo son artboards separados; el archivo pesa menos de
  un megabyte.
- **HECHO (Marketing Week, entrevista al CMO de Duolingo; TechCrunch 18-2-2025; fuentes secundarias):** la campaña de la «muerte»
  del búho (febrero de 2025) costó unos pocos miles de dólares y generó el doble de contenido de usuarios que algunos anuncios del
  Super Bowl; la resurrección se ató al producto (XP de los usuarios) y llegó a 1.700 millones de impresiones (podcast Jawbreaker,
  secundaria). Lección repetida por los analistas: **años de personalidad coherente antes del golpe**; los memes salieron del
  comportamiento del producto (los recordatorios «amenazantes») y la marca los adoptó.
- **HECHO (Appbot, análisis de 40.294 reseñas de Finch, leído el 18-10-2026):** los usuarios le ponen nombre al pájaro, lo llaman
  compañero y vuelven «porque los espera»; una reseña que perdió la cuenta tras dos años de racha lo contó como perder a un
  compañero, no datos. Riesgo documentado: culpa y ansiedad si no se abre la app («mi pájaro va a estar triste»).
- **INFERENCIA (qué toma Senda):** reacciones **al error** graciosas y nunca burlonas (Duolingo no las tiene: es un espacio libre),
  variación para que nada se repita igual, y un personaje con comportamiento coherente durante meses antes de cualquier «golpe» de
  difusión. Nunca culpa ni amenaza: Lany invita, no reclama (regla del capítulo 36).

## 2. Widgets en Android y en la pantalla de bloqueo

- **HECHO (Expo, documentación de `expo-widgets`, SDK 56 a 58, leída el 18-10-2026):** la biblioteca oficial de Expo para widgets y
  Live Activities es **solo iOS**; no existe en Expo Go, requiere development build.
- **HECHO (npm, 18-10-2026):** `react-native-android-widget` versión 0.22.1, `peerDependencies: expo >= 54`; dibuja el widget con un
  árbol de componentes propios (FlexWidget, TextWidget…) que se traduce a vistas nativas de Android, y trae su plugin de
  configuración de Expo (se declara cada widget en app.json y `expo prebuild` genera el receptor, el XML y el layout).
- **HECHO (Droid-Life y 9to5Google, 6-3-2025; Neowin; fuentes secundarias):** Google anunció que los widgets de pantalla de bloqueo
  vuelven a los teléfonos con **Android 16 QPR1** (lanzamiento previsto para fines del verano boreal de 2025); en el teléfono se ven
  en una columna cuando está en el cargador o en un dock; **vale cualquier widget de pantalla de inicio sin código extra**; el momento
  en cada marca lo decide el fabricante. Re-verificar en las notas de Android antes de prometerlo en la tienda.
- **INFERENCIA:** un solo widget «Versículo del día» de inicio cubre las dos cosas; en los teléfonos sin Android 16 queda como widget
  de inicio. Costo: una dependencia más y un receptor nativo; se prueba en el APK de la prueba 20.

## 3. Juegos de salón que funcionan en grupo con un solo teléfono

- **HECHO (mecánicas de dominio público; INFERENCIA sobre su aplicación):** «nombres que empiecen con…» (categorías por letra), la
  papa caliente con reloj, votar a ciegas y conversar antes de revelar, y el teléfono que pasa de mano en mano son mecánicas de
  juego de mesa y de salón de décadas (Scattergories/Tutti Frutti, Hot Potato, los juegos de deducción social); no copian ninguna app.
  Senda las usa con nombre y aspecto propios y con la Biblia como campo.
- **HECHO (contenido de la app, 19-10-2026):** la lista de nombres para «Nombres por letra» tiene 255 nombres de personas de la
  Biblia, cada uno verificado contra el texto de la RV1909 del capítulo citado (scripts/autor/nombres.py; 21 letras con al menos
  un nombre; se juega con las 19 que tienen cuatro o más).

## 4. Libros de referencia: cruce con la clasificación del fundador

- **HECHO (repositorio `estudios-biblicos-con-ani`, carpeta genesis/trabajo/clasificacion, 19-10-2026):** 1.060 archivos
  clasificados: A 540, B 211, C 151, D 135, E 23; 496 (B, C y D) borrados de la copia de trabajo.
- **HECHO (cruce con docs/LIBROS_REFERENCIA3.md de la app):** 76 de los 471 «reconocidos» del inventario por nombre de archivo
  quedaron en B, C, D o E al mirar portadas y datos de edición. **Ninguna nota del contenido de Senda cita un libro de esa
  biblioteca** (listado completo de los campos «fuente» de contenido/travesia.json): se usaron obras de referencia estándar y fuentes
  primarias. Desde hoy manda la clasificación A del fundador.
