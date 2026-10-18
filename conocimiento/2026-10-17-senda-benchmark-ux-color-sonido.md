# Senda: qué hacen las mejores apps con el color, el movimiento y el sonido (benchmark para la prueba 19)

Bitácora del 17-10-2026. Pedido del fundador: que Senda sea la mejor app de la tienda en UX y diseño; siente la app «corta de
colores, muy llana» (piensa en Candy Crush), quiere música de fondo en los juegos como la de los juegos de mesa del iPad y una
música de inicio de nivel Apple. Se estudiaron las fuentes abiertas de las apps de referencia y se compararon con las capturas de
Senda (prueba 18). La red del entorno no abre pixabay.com ni chosic.com; Mixkit limita las páginas por minuto.

## 1. Hechos

| # | Hecho | Fuente y fecha |
|---|---|---|
| 1 | Duolingo construye todo sobre **un** color saturado reservado a la acción principal (Feather Green #58CC02) y una paleta secundaria de acentos vivos: Macaw #1CB0F6, Cardinal #FF4B4B, Fox #FF9600, Bee #FFC800, Beetle #CE82FF; los neutros (Eel, Wolf, Hare, Swan, Polar, Snow) arman la estructura «para no competir con los colores de marca»; los acentos también van como fondos a toda pantalla | [design.duolingo.com/identity/color](https://design.duolingo.com/identity/color) (vía buscador; la página redirige hoy al blog) y [DESIGN.md de shadcn.io](https://www.shadcn.io/design/duolingo/raw), 17-10-2026 |
| 2 | En Duolingo cada acento significa algo: rojo = errores y racha rota, naranja = racha, dorado = XP, violeta = premium y liga alta, celeste = acción secundaria y foco | Ídem (lectura de terceros sobre los tokens semánticos) |
| 3 | Los botones de Duolingo tienen un «labio» plano de 3 a 4 px abajo y se hunden al apretar; no hay sombras difusas ni degradados en tarjetas: la profundidad la ponen las ilustraciones y los personajes, y la tipografía (DIN Round) usa solo dos pesos | Ídem |
| 4 | El principio de tono de Duolingo: «confianza por contención juguetona, no ablandamiento corporativo»; sirve igual para chicos y adultos sin ser infantil | Ídem |
| 5 | En juegos casuales, los colores más saturados producen tiempos de reacción más cortos; las guías de paleta para juegos recomiendan que la interfaz tenga más contraste y saturación que el fondo, y **reservar los colores más intensos para los premios y los aciertos**, con tonos más calmos durante el juego de rutina, para no cansar | Tesis Universidad Europea (psicología del color en la interfaz del videojuego); guías de paleta para juegos (psu.com, 2025-2026) |
| 6 | Apple (WWDC19, «Designing Audio-Haptic Experiences»): tres principios, **causalidad** (el sonido hace evidente su causa, como lo haría un objeto físico), **armonía** (sonido, háptica y pantalla cuentan una sola historia, sin latencia) y **utilidad** (sonido solo donde suma; nunca en interacciones menores). El sonido de Apple Pay se eligió «ni demasiado alegre ni demasiado duro»; los impactos, cortos y precisos, con volumen según la fuerza | [nonstrict.eu/wwdcindex/wwdc2019/810](https://nonstrict.eu/wwdcindex/wwdc2019/810/) (transcripción), 17-10-2026 |
| 7 | Mixkit publica música con la «Mixkit Stock Music Free License»: uso comercial y no comercial sin atribución; el catálogo se baja directo (assets.mixkit.co/music/<id>/<id>.mp3). Las etiquetas «happy» traen 36 temas; la mayoría, infantiles | [mixkit.co/license](https://mixkit.co/license/), [mixkit.co/free-stock-music/tag/happy](https://mixkit.co/free-stock-music/tag/happy/), 17-10-2026 |
| 8 | Pixabay declara que todo su contenido se puede usar sin atribución, también comercialmente (Pixabay License); el sitio no abre desde el entorno (403) | [pixabay.com/service/faq](https://pixabay.com/service/faq/) vía buscador |
| 9 | La biblioteca de Kevin MacLeod (incompetech) tiene 1.443 temas con etiquetas de «sensación» (Bright 329, Bouncy 303, Relaxed 354, Grooving 374, Calming 307, Uplifting 154) y género (jazz, pop, world, soundtrack); licencia CC BY 4.0 | incompetech.com/music/royalty-free/pieces.json, 17-10-2026 |
| 10 | Finch (mascota de autocuidado, Editors' Choice de Apple): su encanto se atribuye a la **metáfora de la mascota** (todo el mundo entiende que cuidar al pajarito lo hace crecer), a la respuesta inmediata de cada acción sobre el personaje y a un tono sin culpa; las críticas le marcan el exceso de opciones al empezar | Critiques de Pratt (2025-2026), screensdesign.com |

## 2. Lo que se ve en Senda hoy (capturas de la prueba 18, 390 puntos)

- **Una sola atmósfera para las cinco pestañas:** índigo profundo + ámbar + blanco. Es coherente y de marca, pero Inicio, Biblia,
  Travesía, Jugar y Comunidad se sienten la misma pantalla. Los únicos colores «de más» son el verde de aciertos, los azules de
  las tarjetas del Nuevo Testamento y los colores de la ruleta.
- **Las tarjetas son todas iguales:** vidrio translúcido con borde fino. En Jugar, los cinco juegos nuevos son cinco filas idénticas
  con el mismo ícono ámbar: no se distinguen ni invitan.
- **Lany es el único elemento con volumen y vida.** Bien: es lo que hay que amplificar, no reemplazar.
- **Tipografía y botones ya están a nivel:** botón con labio y hundimiento (igual que Duolingo), títulos pesados, etiquetas en
  mayúsculas con espaciado.

## 3. Inferencias y decisiones de diseño (razonamiento propio)

1. **«Más color» no es más saturación en todo: es color con significado y por lugar.** Se mantiene el índigo como lienzo (la
   identidad) y el ámbar como acción principal, y se suma una paleta de **acentos vivos con sentido** (como Duolingo), cada uno
   dueño de una pestaña y de una familia de cosas:
   - ámbar/sol: Inicio, la acción principal, la luz de la marca;
   - celeste (agua): Biblia, lectura, planes;
   - menta (senda): Travesía, avance, aciertos;
   - coral (fuego): Jugar, Espadeo, energía;
   - uva: Comunidad, iglesia, premium;
   - más tres de apoyo: turquesa (calendario), rosa frambuesa (temporadas y desafíos), naranja (racha).
2. **La pestaña activa «prende» su color** (ícono, rayita de luz y halo del fondo): al cambiar de pestaña cambia el clima, no el
   mundo. Lo mismo para las secciones de la Travesía (ya tienen fondos propios).
3. **Tarjetas con tinte**: una tarjeta por familia con su degradado suave (del color al 22 % al 6 %) y borde del color; la de
   vidrio neutro queda para listas y ajustes. Los cinco juegos pasan a **losetas de color** con su ícono en un disco del color y
   un detalle propio.
4. **Lo intenso, para los premios** (hecho 5): la fiesta de la armadura, el acierto, la racha y las temporadas tienen permiso de
   brillar; el resto, calmo. Así no cansa ni parece un casino.
5. **Sonido, con las tres reglas de Apple**: cada sonido con causa evidente (ya se cumple: ascendente = bien, descendente = mal),
   sincronizado con la háptica y la animación, y **música solo donde suma**: en los juegos (de fondo, baja, en bucle, apagable en
   un toque) y en la bienvenida; nunca en la Biblia ni en la lección.
6. **Música de inicio:** lo que falló en las cinco versiones anteriores no es el estilo sino la **calidad de producción** (sonido
   sintetizado o de biblioteca vieja). Se cambia de estrategia: temas producidos por compositores profesionales con licencia para
   apps (Mixkit, sin atribución), elegidos por tres criterios: cálido, moderno y con instrumentos reales (guitarra, piano, palmas,
   silbido), de 95 a 120 por minuto, sin voz, sin aire infantil ni «corporativo genérico». El fundador escucha los candidatos en la
   Consola y la app lleva el que más se acerque a su pedido.
7. **Música de los juegos de mesa del iPad:** jazz liviano, bossa, acústico con marimba y ukelele, a volumen bajo y con bucle sin
   costura. Cada juego de Senda tiene su clima: Espadeo (pop acústico con pulso), ¿Quién es? (jazz liviano de pensar), En la frente
   (ritmo de fiesta en grupo), Antes o después (ambiente), Vivir la historia (acústico calmo de relato).
8. **Lany en 3D, siempre, no conviene** por tres razones medibles: el 3D en tiempo real (three.js sobre OpenGL) gasta batería y
   calienta el teléfono en pantallas donde Lany está siempre a la vista; obliga a mantener dos Lanys (la de Rive tiene 99
   animaciones y 16 expresiones, la 3D unas pocas) y rompe la consistencia (dos aspectos distintos del mismo personaje). La opción
   mejor para la UX es **una sola Lany con volumen** (la de Rive, con más luz y sombra) y el 3D reservado a los momentos de fiesta,
   con un botón para verlo al instante desde Ajustes. Es lo que hace Duolingo: Duo no es 3D en la app; parece 3D por el dibujo.
