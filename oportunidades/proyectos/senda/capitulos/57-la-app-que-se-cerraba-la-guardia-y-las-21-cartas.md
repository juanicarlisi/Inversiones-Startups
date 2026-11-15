# La app que se cerraba al abrir, la guardia y las 21 cartas (la prueba 31)

<div class="enpocas" markdown="1">
**En pocas palabras.** El 21-10-2026 el fundador escribió: «Instalé la app pero cuando la abro se cierra. No funciona. Arreglá eso y
avanzá con todo lo próximo». Esta prueba hace las dos cosas. **El cierre:** no se pudo reproducir (la parte nativa del APK 30 es
idéntica a la del 28, que andaba, y el arranque entero corre sin error en una prueba automática que simula el teléfono con un estado
guardado como el suyo, §2), así que se atacaron las causas posibles y, sobre todo, se cambió lo que pasa cuando algo revienta:
desde ahora **la app no se cierra en silencio**: muestra qué falló, con el detalle para copiar y mandar, «Reintentar» y «Borrar lo
guardado» (§3), y las traducciones y los datos guardados viejos ya no pueden tirarla abajo (§4). **Lo próximo:** las siete cartas que
faltaban, libro por libro: 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses y 1 y 2 Tesalonicenses, 25 lecciones nuevas; «Las
cartas» queda con las 21 y la Travesía en 377 lecciones (§5). Dos APK: la 31 (solo el arreglo) y la **31b**, que trae todo; hay que
probar la 31b (§6). La primera ruta en portugués no entró y es lo primero de la próxima (§7).
</div>

## 1. Lo que dijo el fundador y dónde quedó

| Lo que dijo (resumen) | Dónde quedó |
|---|---|
| «Instalé la app pero cuando la abro se cierra. No funciona. Arreglá eso» | §2 (qué se buscó y qué se encontró), §3 (la guardia), §4 (lo que se endureció), §6 (APK 31 y 31b) |
| «y avanzá con todo lo próximo» | §5 (las 21 cartas, el primer «próximo» del capítulo 56 §8); §7 (lo que no entró y por qué) |

## 2. «Cuando la abro se cierra»: qué se buscó y qué se encontró

El fundador había probado bien el APK 28 («viene bien dentro de todo», capítulo 55). El 29 nunca lo instaló y el 30 se le cierra al
abrir. Así que la causa está entre el 28 y el 30, o en lo que el 30 hace con lo que el teléfono ya tenía guardado del 28. Lo que se
revisó, en orden, y lo que dio (todo HECHO del 21-10-2026):

1. **La parte nativa es idéntica.** Entre el APK 28 y el 30 no cambió ninguna dependencia (`package.json` igual), ni la configuración
   nativa (`app.json` solo cambia la versión), ni el arranque (`index.ts`). Lo que cambió son 51 archivos de la app (pantallas,
   componentes, fechas, voz, textos) y el contenido. Si se cierra, es JavaScript o un dato guardado, no una biblioteca nueva.
2. **El arranque entero corre sin error en Node.** Se armó una prueba automática con el preset de Android de Expo (jest-expo) que
   carga la app desde `index.ts` como lo hace el teléfono, con los módulos nativos simulados, y la dibuja: la bienvenida en una
   instalación nueva, e **Inicio con un estado guardado como el del fundador** (bienvenida vista, racha, lecciones hechas, un evento
   en la agenda, idioma español). Las dos pasan: Inicio muestra «Miércoles 21 de octubre», el saludo, las misiones, la agenda, el
   versículo del día y el desafío, sin una sola clave cruda ni una excepción.
3. **Lo que Hermes (el motor de JavaScript del teléfono) no tiene y Node sí**, revisado en los 51 archivos: no se agregó ningún uso
   nuevo de `Intl`, de expresiones regulares raras, de métodos de arreglo modernos ni de API web (`toLocaleUpperCase`,
   `toLocaleString` y `normalize` se usan exactamente las mismas veces que en el 28). Tampoco hay ninguna traducción dentro de un
   «worklet» de animación, ni ciclos de importación nuevos, ni llamadas a traducción al cargar un módulo.
4. **Los ids del contenido no cambiaron:** entre el 28 y hoy no se sacó ni se renombró ninguna área, ruta, sección, nivel ni
   lección (solo se agregaron), así que el progreso guardado no apunta a nada que ya no exista. Los tipos de evento de la agenda
   tampoco cambiaron de id.
5. **La compilación del APK 30 fue limpia** (el registro de GitHub Actions no tiene avisos del empaquetado ni de Hermes) y el
   paquete exportado hoy compila a bytecode de Hermes sin error.

Lo que sí apareció: **dos lugares donde un dato guardado viejo o una clave que no existe cerraban la app**. La función que traduce
(`t()` y `useT()`) hacía `TEXTOS[clave][idioma]`: si la clave no existía, reventaba con «Cannot read property of undefined», y en la
app instalada eso cierra la app sin decir nada. Y la fila de un evento sin título en Inicio mostraba la clave cruda del tipo. Ninguna
de las dos se dispara con el estado que simulamos, pero con el estado real del fundador (31 pruebas de datos guardados desde
septiembre) es una causa plausible que no se puede descartar. **INFERENCIA:** el cierre viene de un error de JavaScript al dibujar o
al arrancar, probablemente ligado a lo que el teléfono tiene guardado; no se pudo reproducir sin ese estado ni sin el registro del
teléfono. Por eso el arreglo no apuesta a una sola causa: endurece las posibles (§4) y, sobre todo, hace que **cualquier** fallo se
vea (§3), para que la próxima vez no haya que adivinar.

## 3. La guardia: la app no se cierra en silencio

Desde el APK 31, si algo revienta, Senda muestra una pantalla en vez de cerrarse: **«Algo falló»**, con qué pasó (el mensaje y las
primeras líneas de la pila), cuándo y dónde (al cargar la app, al dibujar la pantalla o en segundo plano), un botón **«Copiar el
detalle»** (para pegarlo en el chat y mandarlo al equipo, appsenda.ok@gmail.com), **«Reintentar»** y, abajo, con una explicación, **«Borrar
lo guardado y reintentar»**: si el error vuelve cada vez que abre, es probable que un dato guardado viejo lo cause, y borrar lo guardado
reinicia el progreso en ese teléfono. La pantalla no depende de nada de la app (ni tema, ni fuentes, ni textos, ni estado), para que
funcione aunque lo roto sea justamente eso; habla español, portugués o inglés según el idioma elegido.

Cubre las tres formas en que una app de React Native se cierra:

- **al cargar los módulos** (`index.ts` carga la app dentro de un «intento» y, si falla, registra la pantalla de fallo como raíz);
- **al dibujar** (una guardia de React en la raíz, arriba de todo, atrapa el error de cualquier pantalla y muestra la de fallo);
- **en segundo plano** (un temporizador, un gesto, una promesa: el manejador global de errores de React Native, instalado como primer
  módulo de todos, anota el fallo y, en la app instalada, no deja que un error fatal la cierre; la pantalla de fallo aparece encima,
  con «Seguir» además de «Reintentar»). En desarrollo sigue saliendo la caja roja de siempre.

Todo fallo queda anotado en el teléfono, y en **Ajustes → Ayuda y legal** aparece la fila **«Último fallo registrado»**: tocarla copia el
detalle; el tachito lo olvida. Así, aunque la app haya vuelto a abrir bien, el fundador puede mandar lo que pasó. En la vista previa
web, `?demo=fallo` muestra la pantalla (para la Consola y las capturas). Código: `src/util/guardia.ts`, `src/componentes/fallo.tsx`,
`index.ts`.

## 4. Lo que se endureció

- **Ninguna traducción puede cerrar la app.** `t()` y `useT()` devuelven la clave tal cual (y avisan en desarrollo) si la clave no
  existe o si el idioma guardado es raro; la prueba automática lo verifica.
- **Un evento guardado con un tipo que ya no existe cae en «otro»** (`defTipo()` en `datos/agenda.ts`), en Inicio, el calendario,
  Comunidad, el evento y los avisos; antes, `TIPOS[e.tipo].nombre` con un tipo desconocido reventaba.
- **Inicio:** un evento sin título mostraba la clave cruda del tipo («tipo.culto»); ahora se traduce.
- **La prueba de arranque en Node** (seis casos: carga desde `index.ts`, Inicio con estado guardado, bienvenida, clave inexistente,
  guardia que atrapa un error al dibujar, tipo de evento viejo) queda en la sesión como herramienta; para que corra en cualquier
  máquina hay que sumar `jest-expo` a las dependencias de desarrollo (próximo, §8).

## 5. Las 21 cartas: 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses y 1 y 2 Tesalonicenses

El primer «próximo» del capítulo 56 §8. Siete secciones nuevas de «Las cartas» en el orden del Nuevo Testamento, 25 lecciones con
sus repasos (`scripts/autor/cartas_restantes.py`):

- **2 Corintios** (6): «Antes de abrir 2 Corintios» (1–2, con la línea de la Iglesia en el tercer viaje); «Un nuevo pacto y un tesoro
  en vasos de barro» (3–4, con el Sinaí en la línea del Éxodo, por el velo de Moisés); «Nueva criatura y embajadores de Cristo» (5–7);
  «La ofrenda: Dios ama al dador alegre» (8–9); «Pablo se defiende: las armas y los sufrimientos» (10–11, con Damasco en la línea);
  «Bástate mi gracia: el aguijón y la prueba final» (12–13).
- **Gálatas** (4): «Antes de abrir Gálatas: un solo evangelio» (1–2, Pedro en Antioquía); «Hijos de Abraham por la fe: la ley fue el
  ayo» (3, con el árbol de Abraham); «Hijos, no siervos: Abba, Padre» (4, Agar y Sara); «Libres por el Espíritu: el fruto y la
  siembra» (5–6, con el diagrama del fruto del Espíritu).
- **Efesios** (5): «Bendecidos en Cristo» (1); «Por gracia sois salvos: de muertos a un solo cuerpo» (2); «El amor de Cristo que no se
  mide y un solo cuerpo» (3–4); «Hijos de luz: la vida nueva en casa» (5); «La armadura de Dios» (6, con el diagrama de la armadura:
  las seis piezas que se ganan en Senda, nombradas desde el texto).
- **Filipenses** (3): «El vivir es Cristo» (1); «El sentir de Cristo: humildad hasta la cruz» (2); «Prosigo al blanco; gozaos en el
  Señor siempre» (3–4).
- **Colosenses** (3): «Cristo, imagen del Dios invisible» (1); «Cristo basta: nadie los engañe con filosofías ni reglas» (2);
  «Resucitados con Cristo: la vida nueva, la casa y los saludos» (3–4).
- **1 y 2 Tesalonicenses** (4, una sección): «Una iglesia ejemplo» (1 Tes 1–3); «Santidad, trabajo y la venida del Señor» (1 Tes 4–5);
  «El día del Señor no llegó» (2 Tes 1–2); «Si alguno no quiere trabajar, tampoco coma» (2 Tes 3).

**1 Corintios pasa a sección propia** («1 Corintios»; antes compartía «1 y 2 Corintios»): cada carta tiene su repaso, y el repaso de
una sección se arma con las preguntas de todas sus lecciones. «Las cartas» queda con **15 secciones y 93 lecciones**; la Travesía,
con **377 lecciones y 522 niveles** (HECHO, validador del 21-10).

Cómo se escribieron, como siempre: con el texto de la RV1909 de la app abierto capítulo por capítulo (las 41 capítulos, leídos
enteros); **cada cita entre comillas está textual** (una verificación propia comparó las 2.300 citas de las 25 lecciones con el texto,
además del validador); los huecos de «completar» usan palabras que la RVR1960 conserva («consolar», «olor», «vivifica», «libertad»,
«fe», «criatura», «pobre», «alegre», «gracia», «ayo», «Hijo», «sangre», «cabeza», «obras», «sol», «perdonó», «armadura», «sentir»,
«querer», «premio», «corazones», «reino», «imagen», «bautismo», «arriba», «abundancia», «vivo», «santificación», «ladrón», «bueno»,
«doctrina», «fiel», «trabajar»); las palabras viejas van explicadas en la historia («salud», salvación; «potencia», poder;
«flaco», débil; «caridad», amor; «anatema»; «ayo»; «arras»; «cota»; «yelmo»; «doctores»; «conversar», comportarse; «embarazar»,
estorbar; «holgarse», alegrarse). **Lo interpretativo se marca y nada de doctrinas secundarias:** la elección y la predestinación de
Efesios 1 se presentan con lo que el texto dice y la nota de que las iglesias protestantes entienden de maneras distintas cómo encaja
con la responsabilidad de cada uno; el matrimonio de Efesios 5, con la medida que el texto pone (amar como Cristo amó) y la misma
nota sobre la aplicación de los detalles; el orden de la venida de 1 Tesalonicenses 4, con lo que dice y «consolaos»; el hombre de
pecado y «lo que impide» de 2 Tesalonicenses 2, sin nombrarlos (el texto no lo hace); el aguijón de 2 Corintios 12, sin adivinarlo;
«primogénito de toda criatura» (Colosenses 1:15) explicado desde el versículo siguiente (todo fue creado por él). Las notas finales de
la RV1909 («Enviada de Roma…») no se usan como dato. Los libros de referencia se usaron para entender y chequear doctrina, nunca para
replicar un bosquejo ni copiar una frase (capítulo 55 §2). Cada lección nueva lleva un visual que dice algo verdadero del pasaje
(líneas de la Iglesia, el Éxodo y Jesús; los diagramas del árbol de Abraham, el fruto del Espíritu, un cuerpo y la armadura).

## 6. Las APK

- **APK 31** (`senda-prueba-31.apk`, release `prueba-31`, 88,2 MB): solo el arreglo (§3 y §4), publicada primero para que el arreglo
  estuviera afuera cuanto antes.
- **APK 31b** (`senda-prueba-31b.apk`, release `prueba-31b`): todo el APK 31 más las 21 cartas. **Es la única que hace falta probar.**
  Qué mirar: que abra; Travesía → Las cartas → 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses, 1 y 2 Tesalonicenses;
  Ajustes → Ayuda y legal (si hubo un fallo, la fila «Último fallo registrado»).
- **Si se vuelve a cerrar o aparece «Algo falló»:** tocá «Copiar el detalle» y pegalo en el chat (es lo que falta para encontrar la
  causa exacta); si querés seguir usando la app ya, «Borrar lo guardado y reintentar» (se pierde el progreso de ese teléfono; vuelve
  a abrir en la bienvenida). Si se cierra sin mostrar nada, decilo igual: eso también es un dato (significaría que falla antes de que
  cargue el primer módulo, que es lo único que la guardia no puede atrapar).

{{PANTALLAS31}}

## 7. Lo que no entró

- **La primera ruta de contenido en portugués** («El gran relato», 42 lecciones; `docs/TRADUCCIONES.md`): es un trabajo de una prueba
  entera (el plan la estima en 4 a 6 horas con verificación versículo por versículo contra la Bíblia Livre, más el motor que lea
  `contenido/traducciones/pt/`, que todavía no existe) y no entraba en esta sin bajar la calidad. Queda como lo primero de la próxima.
- **Más historias para «Vivir la historia»** (José y sus hermanos, Elías en el Carmelo, el ciego de Juan 9): son para después del
  21-12; las 10 de hasta ahí están.
- **Las dos lecciones sin visual** (la parábola del hijo y Job) siguen sin visual a propósito: no apareció nada que no fuerce el texto.
- **El archivo de la RVR1960:** sigue sin aparecer y nada depende de él (capítulo 55 §3).

## 8. Pendientes y decisiones

1. **Fundador:** probar el **APK 31b** (trae absolutamente todo); si se cierra o sale «Algo falló», copiar el detalle y pegarlo en el
   chat; lo pendiente de las pruebas 24 a 30 (el archivo de la RVR1960, la consulta a la Sociedad Bíblica, subrayado o corchetes, el
   color de Lany, la fila de versión, el sonido del tachado, lo de la Consola).
2. **Claude (próximas):** la primera ruta en portugués («El gran relato», con el motor de traducciones y el validador en portugués);
   la prueba de arranque en Node como parte del repositorio (sumar `jest-expo` y correrla en GitHub Actions antes de cada APK, para que
   ningún APK salga sin pasar el arranque simulado); los profetas mayores o más libros jugables, según lo que pida el fundador; más
   historias para «Vivir la historia» después del 21-12; el comparador con el archivo de la 1960 si aparece.
