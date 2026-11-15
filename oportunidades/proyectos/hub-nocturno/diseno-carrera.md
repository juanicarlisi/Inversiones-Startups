# Hub Nocturno · Diseño de «la carrera» (15-11-2026)

> Responde a la prueba del fundador del 15-11-2026 (DEC-2026-11-15-4). Se apoya en tres trabajos del mismo día:
> `benchmark-jugadores.md` (15 reglas con evidencia), `aprender-jugando.md` (10 reglas, 11 épocas, 28 conceptos) y el diagnóstico
> medido de la v2 (resumen en §2). Todo lo que sigue es DISEÑO (decisión de Claude sobre esa evidencia), a validar con prueba a ciegas.

## 1. El juego en una frase

Sos el dueño de una empresa de logística aérea que nace en 1929 con un biplano y llega hasta hoy. Antes de cada decisión ves qué
cuesta y qué deja; después ves si se cumplió. Tu oficina es tu lugar: ahí están tu red, tus cuentas, tu flota y las propuestas que
te llegan. Cada época trae una carga nueva y una idea de logística o de empresa que se aprende usándola.

## 2. Lo que se midió en la v2 (HECHO, 15-11-2026, sin placa de video)

| Qué | Medido | Por qué importa |
|---|---|---|
| Reloj | Un día de juego dura 145 s; Buenos Aires–Montevideo, 7 s de vuelo | Todo pasa antes de poder mirarlo |
| Decisiones | 42 en 10 minutos (8 en el primero) | Sensación de apretar botones |
| Carteles | 52 con texto y 138 cifras en 10 minutos; el 36% del tiempo hay uno y 87 s hay dos o más | No se llega a leer |
| Pausa | Con un panel de decisión abierto el reloj sigue (30 min de juego cada 3 s) | Decidir apurado |
| Antes de decidir | Solo el precio; nunca el beneficio ni el plazo de recupero | No se sabe qué conviene |
| El capítulo 1 | Se termina en 8,2 minutos; el 47% del tiempo el consejo fue acelerar | Es corto y con ratos muertos |
| Estimador del modelo | Existe y la v2 no lo usa; acierta el primer avión (12.286 contra 11.688 por día) y erra feo en otros (segundo avión: 672 contra 6.119; ruta a Rosario: 9.434 contra 1.406) | Hay que calibrarlo antes de mostrarlo |
| Zoom | Seis defectos: el gesto de trackpad no tiene tope, la cámara pisa el zoom del jugador, acercar casi no agranda, no entra toda la red, no hay controles a la vista, la rueda sobre un panel mueve la página | Lo que pidió el fundador |

## 3. Pilares

1. **Decidir sabiendo.** Cada compra muestra tres números: cuánto cuesta, cuánto deja por día y en cuántos días se paga. El reloj
   se frena mientras se decide. Después, el juego devuelve el resultado contra lo prometido.
2. **Ritmo de empresario.** La partida nueva arranca en velocidad tranquila. Nunca dos carteles a la vez. Cada mañana, un parte
   de una pantalla: qué entró, qué salió, la mejor y la peor ruta y un consejo.
3. **La oficina.** El despacho de la base es el menú del juego: mapa de pared (la red), libro (las cuentas), estante (la flota),
   bandeja (encargos, resultados, propuestas), cuaderno (lo aprendido), placa (el nombre). Cambia con cada época. Adentro el reloj
   está frenado.
4. **Carrera.** Nombre y color de la empresa, título que crece con metas visibles, reputación desglosada, propuestas de negocio
   (socio, préstamo, oferta por una parte, oferta por todo) que llegan a la bandeja, una por mes como mucho.
5. **Épocas y cargas.** De las cartas de 1929 a los paquetes urgentes, los medicamentos con frío y las compras en línea. Las épocas
   avanzan por metas cumplidas, no por reloj.
6. **Se aprende usándolo.** Cada concepto es algo que hay que usar para ganar; primero se vive y después se nombra, en el cuaderno
   de la oficina. Sin exámenes.
7. **Todo verdadero.** Cada dato histórico va con fuente. Pendiente detectado: no hay respaldo de faros de ruta en la Argentina de
   1929 (el vuelo nocturno de 1928 se guio con fuegos): en la etapa 2 la primera noche se hace con fogatas y luces de pista, y los
   faros llegan después.
8. **Impronta propia.** Lo que el fundador recordó de otros juegos es dirección. Se usan mecánicas genéricas (pausa, épocas,
   ofertas, un lugar como menú); nombre, personajes, dibujo y textos son propios. Lo propio: la noche como reloj del negocio, el sur
   de Sudamérica y la logística real como contenido.

## 4. Etapas (cada una jugable y con prueba a ciegas)

| Etapa | Qué trae | Se da por buena si |
|---|---|---|
| **1 · Decidir sabiendo** | Tarjetas con los tres números y comparación de aviones; reloj frenado al decidir; velocidad tranquila; un cartel por vez; resultado contra lo prometido; parte de la mañana; oficina (mapa, libro, flota, bandeja, placa); nombre y color de la empresa; zoom arreglado | Quien lo juega a ciegas puede decir, antes de confirmar, qué cuesta y qué deja una ruta; el estimador erra menos de 30% en 8 casos medidos; nunca dos carteles a la vez; los seis defectos de zoom, cerrados |
| **2 · Carrera** | Título y reputación; propuestas de negocio; cuaderno con los 13 conceptos de 1929; la noche verdadera (fogatas, después faros); la plata sigue importando; paso a 1936 y 1946 con pasajeros y paquetes | Quien lo juega cuenta con sus palabras por qué conviene la base; una partida de 1929 dura más de 25 minutos sin ratos muertos |
| **3 · Épocas hasta hoy** | Jet y perecederos, contenedores, envíos de un día para otro, cadena de frío y medicamentos, compras en línea y drones; cargas nuevas (sube la versión del guardado) | Cada época enseña su idea y se entiende sin ayuda |
| **4 · Publicar** | Capa del portal, celular completo, medición en equipos reales; caso de negocio recalculado (portal contra Steam) | Compuertas de DEC-2026-11-15-2 y OK del fundador |

## 5. Etapa 1 en detalle

**Tarjeta de decisión.** Ruta, avión, luces de ruta y agrandar el correo de la base. Tres números con sus palabras («Cuesta»,
«Deja por día», «Se paga en»). Si la estimación es incierta, se muestra un rango. Si pierde plata, se dice y se explica en una
línea. Comprar avión compara los modelos lado a lado con los mismos números. El estimador sale del modelo verdadero: se prefiere
simular la decisión hacia adelante (con y sin ella) antes que una fórmula; se elige midiendo el error.

**Reloj y carteles.** Velocidades: tranquila (la de una partida nueva, la mitad de la normal de hoy), normal y rápida. Panel de
decisión abierto = reloj frenado, con una señal visible. Una fila única de carteles; las cifras de cobro se agrupan por aterrizaje.
El consejo de acelerar deja de ser el relleno: cuando no hay nada que decidir, el juego invita a mirar (seguir un avión, la oficina).

**Resultado contra lo prometido.** A los tres días de cada compra llega una nota a la bandeja: lo prometido, lo que pasó y por qué.

**Parte de la mañana.** A las 6:00 de cada día: entró, salió, quedó; mejor y peor ruta; un consejo. Una pantalla, un toque. Es
también el punto de guardado.

**La oficina (1929).** Una escena 3D propia con el mismo aire de maqueta del juego: escritorio de madera, mapa de pared con
alfileres e hilos (la red de verdad), libro de cuentas, bandeja de alambre, estante con los aviones de la flota, placa de bronce
con el nombre, lámpara, telégrafo y una ventana a la pista con la hora real del juego. Aparece con el primer parte de la mañana
(nunca antes del primer vuelo) y queda a un toque en la barra.

**Nombre y color.** Se elige al estrenar la oficina, con un valor por defecto; se ve en la placa, en la barra y en los aviones.

**Cámara.** Topes al gesto de trackpad; el zoom del jugador no se pisa; acercar agranda de verdad hasta ver el avión de cerca;
alejar hasta que entre toda la red de la época; botones de acercar y alejar, doble toque, «Ver mi red» también en celular; la rueda
nunca mueve la página.

### Contrato de datos de la oficina (la interfaz entre el juego y la escena)

```js
// Lo que la oficina recibe (solo lectura). Lo arma el juego; el historial vive en el guardado «extra», con tope de 60 días.
{
  empresa: { nombre, color, fundada },                    // fundada: texto «1 de nov de 1929»
  hoy: { dia, fecha, hora, caja, epoca },                 // dia: número de día de la partida; epoca: 1929
  dias: [{ n, fecha, entro, salio, cartas, vuelos, aTiempo, tarde }],
  rutas: [{ id, nombre, km, abiertaDia, luces, aviones, entroDia, salioDia, dejaDia, cartasDia, llenado,
            prometido: { dejaDia, recuperoDias } | null }],          // promedios de los últimos 3 días; llenado de 0 a 1
  flota: [{ id, nombre, tipo, ruta, compradoDia, viajes, cartas, entro, salio, llenado, estado }], // estado: volando | en tierra | durmiendo
  bandeja: [{ id, tipo, titulo, texto, dia, leido, acciones }],     // tipo: encargo | resultado | nota | propuesta; acciones: [{ id, texto }]
  cuaderno: [{ id, nombre, frase, estado }],                        // estado: vivido | usado | dominado | null (etapa 2; puede venir vacío)
  carrera: { titulo, siguiente, falta } | null                      // etapa 2
}
// Lo que la oficina pide al juego:
accion({ tipo: 'nombre', nombre, color }) · accion({ tipo: 'ir', a: 'ruta' | 'avion', id }) ·
accion({ tipo: 'bandeja', id, accion }) · accion({ tipo: 'leido', id }) · accion({ tipo: 'salir' })
```

## 6. Lo que no se hace

Oficina, nombre o elección de época antes del primer vuelo. Castigar la pausa. Pantallas de finanzas con tablas largas. Eventos que
se apilan o interrumpen. Cuestionarios. Datos históricos sin fuente. Tocar la v1 o romper las partidas guardadas sin subir la
versión.
