# Senda · prueba 7 en el teléfono: Lani en 3D, Senda Fiesta con identidad propia, el mapa de toda la app y el proyecto v3

Fecha: 11-10-2026. Desarrollo e investigación de Claude después de que el fundador probó el APK de la prueba 7.

## 1. Lo que contó el fundador (resumen, sin citas textuales)

- Las pruebas de la prueba 7 salieron prácticamente todas bien.
- El baile de Lani le parece un poco infantil. Preguntó si Lani no puede ser 3D, como en Duolingo.
- Pidió actualizar el PDF del proyecto con todo lo conversado desde la última versión.
- Le gusta sumar los minijuegos a campamentos y partidas, y usarlos para el modo tipo Mario Party, con impronta propia y sin réplicas, para no tener problemas legales.
- Pidió un diagrama MECE de toda la app, que permita ver de un vistazo cómo encaja cada cosa. En el PDF y, si conviene, en la Consola.
- Pidió avanzar con lo próximo del roadmap.

## 2. Hechos (con fuente y fecha)

- **Duolingo anima a sus personajes en 2D con Rive**, con una máquina de estados: un personaje con estados reutilizables que la app dispara y mezcla en el momento; la boca se sincroniza con la voz por visemas ([blog de Duolingo](https://blog.duolingo.com/world-character-visemes); [DEV Community](https://dev.to/uianimation/how-duolingo-style-character-animations-are-built-in-rive-and-how-product-teams-integrate-them-into-2k6l)). Consultado el 11-10-2026.
- **Rive:** planes de USD 0, 9 (Cadet), 32 y 120; exportar archivos para usarlos en una app requiere plan pago desde USD 9 por mes; el motor en la app no cobra por uso y lo exportado sigue funcionando aunque se deje de pagar ([precios nuevos de Rive](https://rive.app/blog/new-pricing); [plan de USD 9](https://rive.app/blog/rive-s-new-9-mo-plan)). Vía buscador, 11-10-2026; re-verificar antes de pagar.
- **Rive para React Native:** `@rive-app/react-native` 2.0 (Nitro Modules) soporta Expo SDK 53 o más y React Native 0.78 o más ([repositorio](https://github.com/rive-app/rive-nitro-react-native)). 11-10-2026.
- **expo-gl 57.0.2** (el de Expo SDK 57): en Android dibuja sobre un `TextureView` con `isOpaque = false` (fondo transparente) y su contexto extiende `WebGL2RenderingContext`, lo que pide three.js desde la r163. Verificado en el código del paquete instalado (`node_modules/expo-gl`), 11-10-2026.
- **Compilación:** el APK con expo-gl y three.js 0.186.1 compiló en GitHub Actions en 18 minutos (corrida 38110753249, solo comprobación). La vista previa web pasó a 3,5 MB de código.
- **Derecho de autor y juegos:** la Oficina de Copyright de EE. UU. dice que no protege la idea de un juego, su nombre ni el método para jugarlo; sí el texto, el arte y la música ([circular FL-108, copia archivada de 2004](https://webharvest.gov/peth04/20041015023438/http://www.copyright.gov/fls/fl108.html); [ABA Landslide](https://www.americanbar.org/groups/intellectual_property_law/resources/landslide/archive/why-videogame-rules-are-not-expression-protected-copyright-law/)). **Re-verificar en la versión actual de copyright.gov.**
- **El aspecto sí se protege:** en *Tetris Holding v. Xio* (Nueva Jersey, 2012), el clon perdió por copiar formas, colores y medidas del tablero ([Wikipedia](https://en.wikipedia.org/wiki/Tetris_Holding,_LLC_v._Xio_Interactive,_Inc.)). Fuentes secundarias; la fecha exacta (30 de mayo o junio de 2012) varía según la fuente.
- **Patentes de mecánicas:** Nintendo y The Pokémon Company demandaron en Japón (septiembre de 2024) a Pocketpair por tres patentes de *Palworld* (capturar lanzando un objeto, el indicador de probabilidad y montar criaturas). A julio de 2026 seguía sin fallo ni medidas contra el juego ([Open Class Actions](https://openclassactions.com/news/palworld-nintendo-patent-lawsuit-update-july-2026.php); [PatentArcade](https://www.patentarcade.com/?p=7128)).
- **El género es libre:** *Pummel Party* (Rebuilt Games, septiembre de 2018), tablero con minijuegos para 4 a 8 jugadores, sigue a la venta en Steam con unas 57 mil reseñas, 89% positivas ([Steam](https://store.steampowered.com/app/880940/Pummel_Party); [Nodal](https://nodal.gg/game/pummel-party-880940)).
- **Citas de las reglas de Senda Fiesta** verificadas palabra por palabra contra la RV1909 de la app: Números 9:17, 2 Timoteo 2:15, Éxodo 16:20, Hechos 20:35, Mateo 20:16, Hechos 16:25-26, Nehemías 6:15.

## 3. Inferencias y diseño de Claude

- **Por qué el baile parecía infantil:** saltitos en cada tiempo, aplastarse al caer y vueltas enteras son el lenguaje de los dibujos para chicos. El baile nuevo es un groove de recital juvenil (rodillas, peso de un lado al otro, cabeza que asiente, orejas que llegan tarde), con un gesto propio de la marca (señalar al cielo), aplausos en el 2 y el 4 y manos arriba.
- **Lani 3D hecha con código** (copos de lana en una malla instanciada, cinemática inversa en las piernas, luz de estudio) en lugar de un modelo: cambios en minutos, cero archivos que bajar y el mismo archivo para la app y la Consola. El acabado tiene techo; un artista 3D lo mejoraría con el mismo motor.
- **Senda Fiesta:** la clave para no copiar es que las reglas nazcan del texto (la nube que se mueve, el maná que se echa a perder) y que el juego sea no violento (nadie le roba a nadie). El modo «por turnos con amigos» reusa la semilla por turno de los duelos y cuesta casi cero.
- **El mapa MECE:** tres niveles (lo que usa la persona, lo que la hace andar, lo que la sostiene). Cada función en un solo lugar, con su etapa. Al 11-10-2026: 130 funciones, 64 ya funcionan.

## 4. Lo hecho (prueba 8)

- **App:**
  - Lani 3D en las fiestas (con vuelta a la 2D e interruptor en Ajustes) y la 2D sin saltitos;
  - bienvenida en siete pasos que personaliza la habilidad, la Travesía y la pestaña de inicio;
  - menores de 13 sin anuncios ni estadísticas;
  - duelo contra Lani;
  - `?demo=fiesta` en la vista previa;
  - Consola con «Mapa de la app» y «Lani 3D».
- **Proyecto:**
  - PDF v3 (171 páginas), con tabla de lo que cambió, hoja A3, Senda Fiesta, Lani 3D, octava tanda y capítulo 33;
  - `mapa_total.yaml`, estado, roadmap y DEC-2026-10-11-1.
- **Arreglo de la imprenta:** `informes/imprimir_pdf.cjs` ahora espera a que carguen todas las tipografías. Una impresión salió con letras de reemplazo y cortada a mitad del capítulo 25.
