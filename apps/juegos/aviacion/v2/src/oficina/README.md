# La oficina · el despacho de la base en 1929 (etapa 1 de «la carrera»)

Escena 3D interactiva que funciona como **el menú del juego**: el jugador entra a su despacho y ahí ve su red, sus cuentas, sus
aviones y lo que le llegó. Módulo aparte: no importa el modelo ni `main.js`; recibe datos y pide acciones.

**Qué hipótesis prueba.** El fundador probó la v2 y sintió que «solo aprieta botones». La apuesta de la etapa 1
(`oportunidades/proyectos/hub-nocturno/diseno-carrera.md`, §3 y §5) es que **un lugar propio con los datos de verdad** (nombre en la
placa, la red en la pared, el libro con sus números) lo hace sentirse dueño de una empresa. Se da por buena o no en la prueba a
ciegas de la etapa 1, no acá.

## Verla sin el juego

```bash
cd apps/juegos/aviacion/v2
node herramientas/demo-oficina.mjs --servir     # arma tmp/demo-oficina/ y la sirve en http://localhost:8813  (Ctrl+C la apaga)
node --test pruebas/oficina.test.mjs            # textos (pares es/en, cero jerga) y hojas, sin navegador
node herramientas/medir-oficina.cjs             # cuadros por segundo contra el mapa (necesita :8813 y dist/ en :8812)
node herramientas/demo-oficina.mjs --peso       # cuánto le suma al paquete del juego
```

Parámetros de la página: `?hora=18.8` (hora del juego, 0 a 24) · `?lang=es|en` · `?primera=1` (la primera entrada) ·
`?calidad=alto|medio|bajo` · `?hoja=mapa|libro|flota|bandeja|cuaderno|placa` · `?ejemplo=propio` (ignora el ejemplo real del
juego) · `?manual=1` (el reloj se avanza a mano: `__oficina.depurar.avanzar(segundos)`, para capturas).

La demostración usa `src/oficina-datos-ejemplo.json` si existe (el ejemplo real que deja el juego) y, si no, `ejemplo.js` (una
empresa de 12 días, 4 rutas, 5 aviones y 8 notas, fiel al contrato).

## Cómo se integra

```js
import { crearOficina } from './oficina/oficina.js';
const oficina = crearOficina({
  contenedor,                    // un elemento que cubra la pantalla (la oficina se monta y se desmonta adentro)
  idioma: 'es' | 'en',
  calidad: 'alto' | 'medio' | 'bajo' | { nombre, escala?, fijo? },   // sirve tal cual mundo.calidad del juego
  datos: () => objeto,           // el contrato de datos de la oficina (diseno-carrera.md §5); se vuelve a pedir tras cada acción
  accion: (a) => resultado,      // { tipo: 'nombre' | 'ir' | 'bandeja' | 'leido' | 'salir', … }; puede devolver { ok, salir }
  sonido: (nombre, valor) => {}, // opcional: 'entrar', 'abrir', 'cerrar', 'toque', 'papel', 'puerta', 'placa', 'salir', 'senalar', 'telegrafo'
});
oficina.abrir({ primera?, idioma?, calidad?, hora? });   // crea la escena y entra
oficina.cerrar();    // sale (con un fundido) y libera la escena entera, GPU incluida
oficina.liberar();   // lo mismo, sin transición
oficina.refrescar(); // vuelve a pedir los datos (si el juego cambió algo mientras está abierta)
```

Con el puente que ya tiene el juego (`src/puente-oficina.js`) son **tres pasos**:

1. En `main.js`: `import './oficina/conectar.js';` (crea el contenedor, arma la oficina con `datosOficina` y `accionOficina` y la
   anota con `conectarOficina`). El botón de la oficina aparece solo: `Puente.hayOficina()` pasa a ser verdadero.
2. Que el contrato diga si es la primera vez: `empresa.estrenada` (verdadero o falso). Mientras no venga, `conectar.js` lo anota
   por su cuenta en `localStorage` (`hubnocturno.v2.oficina`).
3. `npm run construir`. No hay archivos nuevos que copiar: el mapa de pared usa `activos/costa.webp` y `activos/alturas.webp`,
   que el juego ya descarga.

**Apagarla:** sacar el `import` de `conectar.js`. Sin escena anotada el juego no muestra el botón y todo sigue como antes.

**Quién cierra.** Al tocar «Volver al mapa» la oficina llama a `accion({ tipo: 'salir' })` y, si después sigue abierta, se cierra
sola. Con «Verla en el mapa» llama a `accion({ tipo: 'ir', … })` y se cierra si la acción devuelve `{ salir: true }` o no devuelve
nada. `cerrar()` se puede llamar dos veces sin problema.

## Qué hay adentro

| Objeto | Qué muestra en 3D (datos de verdad) | Su hoja |
|---|---|---|
| **Mapa de pared** | Papel de época con la costa, el relieve y los ríos reales; un alfiler por ciudad de la red (la base, dorado) y un hilo por ruta con el color de la empresa; cuentas doradas en las rutas con luces | **Tu red**: cada ruta con lo que deja por día, llenado, si tiene luces y lo prometido contra lo real |
| **Libro de cuentas** | Las dos páginas con los números de los últimos días | **Las cuentas**: entró, salió y quedó; una barra por día; cartas llevadas y cuántas llegaron a tiempo |
| **Estante** | Un modelo por cada avión (los mismos de `mundo/aviones.js`), con la librea de la empresa; las tablas crecen con la flota | **Tus aviones**: ruta, viajes, cartas, lo que ganó, llenado, qué hace ahora y «Verlo en el mapa» |
| **Bandeja de alambre** | Tantas hojas como notas sin leer (al leer una, la hoja sale volando) | **Bandeja**: encargos, resultados y notas, con sus acciones y «Ya lo leí» |
| **Cuaderno** | Cerrado, con su lápiz | **Cuaderno**: en la etapa 1 llega vacío y se muestra como cuaderno nuevo |
| **Placa de bronce** | El nombre grabado y un filete con el color | **Tu empresa**: nombre y color, con vista previa en la placa, los aviones y la alfombra |

Además: el reloj de pared marca la hora del juego y el almanaque, la fecha; la lámpara se enciende al atardecer; el telégrafo recibe
ráfagas y su cinta avanza; por la ventana se ve la pista de la base (despegan los tipos de avión de la flota; de noche, solo si
alguna ruta tiene luces) y el faro girando. La hora del juego manda la luz: un solo foco con sombra entra por la ventana (sol o
luna), con polvo en el rayo; los colores salen de `mundo/cielo.js`, el mismo cielo del mapa.

**Primera vez** (`abrir({ primera: true })`): la puerta de «Dirección» se abre, dos frases, el nombre (por defecto «Correo Aéreo
Lucero»: buscado el 15-11-2026, no hay empresa real con ese nombre) y el color, y un recorrido de tres toques (mapa, libro, estante).

**Celular** (más alto que ancho): otra distribución de la misma oficina (estantes arriba, mapa y ventana, escritorio abajo),
rótulos siempre a la vista y hojas a pantalla completa (con la hoja abierta el 3D deja de dibujarse).

## Archivos

| Archivo | Qué hace |
|---|---|
| `oficina.js` | La API, la interfaz (barra, rótulos sin choques, hojas) y el bucle |
| `escena.js` | Arma la escena, la cámara y sus viajes, qué objeto hay bajo el cursor, niveles de calidad |
| `cuarto.js` · `muebles.js` · `mapa-pared.js` · `afuera.js` | Los modelos, por código (ninguna imagen ni modelo ajeno) |
| `luces.js` | La luz según la hora, el rayo, el polvo y los reflejos |
| `kit.js` | Piezas fundidas por material con color por vértice y texturas hechas por código |
| `hojas.js` · `textos.js` | El contenido de cada hoja (HTML, sin tocar el DOM) y los textos en español e inglés |
| `primera.js` | La primera entrada |
| `ejemplo.js` · `demo/` | Datos de ejemplo y la página de demostración |
| `conectar.js` | El enganche con `puente-oficina.js` |

## Decisiones (regla 10: una por necesidad)

| Necesidad | Elección | Por qué | Regla de corte |
|---|---|---|---|
| Renderizador | **Propio**, se crea al entrar y se destruye al salir (`forceContextLoss`) | Aísla a la oficina del juego (ningún estado compartido que romper mientras `main.js` cambia), deja fundir la entrada sobre el mapa y devuelve toda la memoria al salir. Costo: compilar sus programas al entrar (queda detrás del fundido) y un segundo contexto mientras está abierta | Si en celulares reales la entrada tarda más de un segundo o hay dos contextos de más, pasar a compartir el del juego |
| Motor, posproceso, tipografías | Los del juego (three 0.186.1, postprocessing 6.39.5, Fraunces y Nunito) | Mismo aspecto, cero peso nuevo | — |
| Modelos | Por código, como el resto del juego; los aviones son los de `mundo/aviones.js` (geometría copiada para no atar la caché del juego a este renderizador) | Pesan cero bytes y son propios | Blender + glTF si un mueble necesita más detalle del que da el código |
| Mapa de pared | Dibujado en un lienzo con `costa.webp` y `alturas.webp` (NOAA ETOPO 2022 y Natural Earth, dominio público) | Es la red de verdad sobre la geografía de verdad, sin descargar nada nuevo | — |
| Sombras | Un foco lejano con mapa de sombras solo sobre el hueco de la ventana | Sombra nítida de las varillas con 1.024 px; nada fuera del rayo paga | — |
| Cámara | Viajes propios entre poses (curva suave y un arco leve) | Son poses fijas: `camera-controls` (la del mapa) no suma acá | Si se quiere caminar por la oficina, usar `camera-controls` |

**Niveles de calidad** (los del juego): **alto** (materiales completos, sombras de 2.048, posproceso con MSAA, sombra de la
lámpara), **medio** (boiserie y piso con material simple, sombras de 1.024, posproceso con SMAA), **bajo** (todo con material
simple salvo el metal, sin posproceso). La resolución baja sola si no llega a 27 cuadros (misma regla que el mapa).

## Lo medido (16-11-2026)

**Peso.** `node herramientas/demo-oficina.mjs --peso`: el paquete del juego pasa de 1.546 KB a 1.699 KB (**+153 KB; con gzip, +54 KB**),
con los estilos adentro. **Ningún archivo nuevo para descargar** (los muebles y las texturas se hacen por código; el mapa usa las
dos imágenes del relieve que el juego ya baja).

**Cuadros por segundo contra el mapa.** `node herramientas/medir-oficina.cjs` (un cuadro del mapa y uno de la oficina por turno,
esperando a la GPU). Este entorno **no tiene placa de video** (SwiftShader) y la máquina se comparte con otros procesos: las cifras son
un piso y lo que vale es la relación. Mediana de 7 cuadros, con el ejemplo real del juego (9 rutas, 22 aviones en el estante):

| Pantalla | Nivel | Mapa | Oficina de día | Oficina de noche | Oficina ÷ mapa (en cuadros por segundo) |
|---|---|---|---|---|---|
| 1280×720 | bajo | 197 ms (5,1 cps) | 469 ms (2,1) | 464 ms (2,2) | 0,42 · 0,42 |
| 1280×720 | medio | 453 ms (2,2) | 672 ms (1,5) | 732 ms (1,4) | 0,67 · 0,62 |
| 1280×720 | alto | 961 ms (1,0) | 1.240 ms (0,8) | 1.383 ms (0,7) | 0,78 · 0,69 |
| 390×844 | bajo | 105 ms (9,6) | 229 ms (4,4) | 223 ms (4,5) | 0,46 · 0,47 |
| 390×844 | medio | 241 ms (4,2) | 321 ms (3,1) | 311 ms (3,2) | 0,75 · 0,77 |
| 390×844 | alto | 699 ms (1,4) | 595 ms (1,7) | 663 ms (1,5) | 1,17 · 1,05 |

**Lectura franca:** en una GPU por software la oficina dibuja a **menos de la mitad de la velocidad del mapa en el nivel bajo**,
a dos tercios o tres cuartos en el medio y parecido en el alto. Es una escena de interior con luces y sombras de verdad contra un terreno con un solo material a medida.
Lo que más rindió al optimizar fue el **orden de dibujo** (three ordena lo opaco por material: el piso y las paredes se pintaban
enteros y después se les pintaba encima; con los muebles primero y lo de afuera al final el cuadro bajó un 40 %), después los
materiales simples en lo mate y sacar luces. Lo que queda para el nivel bajo, si en equipos reales hiciera falta: un material a
medida para el cuarto (el sol de la ventana calculado, sin mapa de sombras). La resolución ya baja sola por debajo de 27 cuadros
y `conectar.js` arranca con la misma escala de resolución que tenga el mapa. **Falta medir en una GPU real.**

**Fugas.** Abrir y cerrar 10 veces (usando una hoja en cada vuelta): cero errores de JavaScript, el contenedor queda vacío, las
mismas 283 geometrías y 19 texturas en cada apertura, y con la oficina cerrada no queda vivo ningún renderizador, escena ni malla
(contados por prototipo con el depurador). La memoria de JavaScript con la oficina cerrada pasa de 15,6 a 16,8 MB en las 10
vueltas: comparando dos fotos de la memoria, lo que crece es código compilado por el motor de JavaScript, no objetos de la oficina.
*Hallazgo:* three 0.186 guarda una textura compartida entre renderizadores (la tabla DFG) y cada renderizador que se destruye
queda vivo colgado de ella; la oficina la suelta al salir (`escena.js`, `liberar`). **Al mapa le pasa lo mismo con
`mundo.retratos()`**, que crea y destruye un renderizador cada vez que cambia el color de la empresa.

**Pruebas.** `pruebas/oficina.test.mjs`: 16 de 16 (pares es/en, variables, cero jerga, rioplatense, largos, las seis hojas con el
ejemplo propio y con el real, el contrato). Recorrido con clics de verdad en escritorio (español) y en celular (inglés): todas las
acciones del contrato llegan al juego, cero errores. Dentro del juego de verdad (paquete armado con `conectar.js`, sin tocar
`main.js`): la primera vez, el nombre y el color llegan al juego, marcar como leído, salir y volver a entrar, cero errores.

## Qué falta y qué no convence todavía

1. **Nadie la vio en una GPU real ni la probó a ciegas.** Todo lo de aspecto y de fluidez está juzgado con capturas de un
   navegador sin placa de video.
2. **El rayo de sol** es una bruma suave, no rayos nítidos; visto de frente casi desaparece (a propósito: se notaban las capas).
3. **Lo de afuera** se ve por una ventana angosta: alcanza para la pista, el faro y un avión que pasa, pero no luce como el mapa.
4. **El sillón, la campera del perchero y el corredor de la puerta** son lo menos trabajado; la veta de la madera, de cerca, es
   demasiado pareja.
5. **En celular** los rótulos tapan parte del escritorio (los objetos de la mesa son chicos en vertical).
6. **Lo señalado** se marca con un resplandor, un leve movimiento y el rótulo; no hay contorno.
7. **Sonido:** la oficina avisa cada gesto (`sonido(nombre)`), pero no tiene sonidos propios: `conectar.js` usa los que el juego ya
   tiene. El tictac del reloj, el telégrafo y el papel están por hacer (y por escuchar).
8. **El contrato** no dice si es la primera vez (`empresa.estrenada`) ni de qué ciudades es cada ruta (se deduce del id
   «AAA-BBB»); «a tiempo» y «tarde» cuentan cartas en el ejemplo real y vuelos en el diseño: la hoja se adapta sola.
9. **Épocas siguientes:** el mapa de pared ya cambia de encuadre según `hoy.epoca`, pero los muebles son los de 1929.
