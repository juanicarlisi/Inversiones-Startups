# Notas de contrato · P4 El hub (18-10-2026)

Lo que el contrato (`contratos/`) o la especificación (`oportunidades/proyectos/anden/corte-1.md`) no fija, fija de forma contradictoria
o que, aplicado al pie de la letra, da un resultado que conviene que la integración conozca. En cada punto: qué pasa, el supuesto con el
que siguió el hub y la propuesta. Decide la integración (corte-1.md §2 y §14.8). Los números son MEDIDOS con el motor de referencia en
Node 22.22.0, en el contenedor del entorno, el 18-10-2026, salvo indicación.

## 1. Ausentismo de los roles que el esquema no cubre

- **Qué pasa.** §6.7 regla 2 dice que las ausencias «se sortean para todas las personas de todos los roles» y §6.3 nombra los roles
  `induccion`, `reten`, `rampa`, `descarga` y `excepcion`, pero el esquema solo tiene `personas.induccion.ausentismo` y
  `personas.rampa.ausentismo`.
- **Supuesto.** El retén usa el ausentismo de inducción (está configurado dentro de `personas.induccion`). Descarga y excepción no faltan
  (probabilidad 0: no se sortea, que es lo mismo que sortear con p = 0).
- **Propuesta.** Agregar `ausentismo` (Num, opcional, por defecto 0) a `personas.descarga` y `personas.excepcion` en `anden.modelo/1.1`.

## 2. Probabilidades que llegan como distribución

- **Qué pasa.** `Sorter.lector.noLeido` es `Num`, pero el ejemplo lo apunta a `@noLeido`, cuyo valor es `{ tipo: 'bernoulli', p: 0.015 }`:
  `numero()` de `contratos/referencias.ts` lanza «es una distribución y se pidió un número».
- **Supuesto.** `config.ts › probabilidad()` acepta un número, un parámetro numérico, un parámetro `bernoulli(p)` o `fija`, y exige
  0 ≤ p ≤ 1. Se usa para `noLeido`, `atrasoComun.probabilidad` y los dos ausentismos.
- **Propuesta.** Un tipo `Prob = number | Ref` documentado como «número o parámetro con bernoulli» en `contratos/modelo.ts`, y que
  `referencias.ts` traiga la función `probabilidad()`.

## 3. El andén no adelanta paquetes a una cinta ocupada (bloqueo después del servicio)

- **Qué pasa.** La regla 4 dice que al terminar la descarga el paquete «entra a su cinta en max(t, última entrada + paso ÷ velocidad)»,
  pero no dice si el andén empieza el paquete siguiente en t o cuando este entró. Leído como «en t», con descarga más rápida que la
  separación de la cinta los paquetes se apilan en la entrada de la cinta (cuentan como «en cintas» para la contrapresión), y como los
  andenes parados vuelven en el orden del modelo, el primero acapara todos los lugares: en L01 el lazo recibía **6.187 paquetes por
  hora en vez de 12.000** (una sola cinta de 6.000/h alimentaba todo).
- **Supuesto.** Las personas del andén sostienen el paquete hasta que entra a la cinta, y el siguiente empieza en ese instante
  (`EV.ANDEN_SIGUE`). El tramo DESCARGA va del inicio de la descarga a la entrada a la cinta (sin huecos con CINTA). Además, la
  contrapresión cuenta acumulación + cintas + **paquetes en descarga**, para que K03 dé 70 exacto con cualquier cantidad de andenes (si
  no, dos andenes que miran a la vez con 69 dejan nacer 71). Con esto: L01 12.000, K02a 21,0 s, K02b 12.000/h, K03 70 (MEDIDO).
- **Propuesta.** Escribirlo así en §6.7 regla 4. En el hub chico no cambia casi nada (la descarga tarda 2,5 s por paquete y la cinta
  separa 0,6 s).

## 4. Los reingresos del puesto manual no frenan con la acumulación llena

- **Qué pasa.** La regla 12 manda el paquete resuelto «al final de la acumulación» sin mirar la contrapresión, que solo frena a los
  andenes. La fila puede pasar los lugares: en 50 noches del hub chico llegó a **138 paquetes con 120 lugares** (26 noches pasaron los 120).
- **Supuesto.** Literal. Las pruebas controlan la propiedad exacta: lo que entró por las cintas nunca ocupa más que los lugares
  (`invariantes.test.ts`), y la fila pasa los lugares solo por reingresos (`kpi.test.ts`).
- **Propuesta (corte 2).** Que la persona del puesto manual espere lugar con el paquete en la mano, con prioridad sobre los andenes cuando
  se libera uno. Cambia la huella: es otra versión del motor.

## 5. Duraciones sorteadas negativas o NaN

- **Supuesto.** Toda duración sorteada pasa por `duracionMs()`: una negativa vale 0 (p. ej. una normal sin mínimo) y un NaN lanza un error
  que dice qué duración era. El compilador de P3 ya rechaza medias fuera de rango, pero no colas negativas.
- **Propuesta.** Que P3 exija `min ≥ 0` en las normales de duración (`E-RANGO`).

## 6. Orden dentro de un paso del lazo

- **Qué pasa.** La regla 8 dice cómo recorren las estaciones, la 10 qué pasa al llegar a la rampa, pero no cuál va primero en el mismo paso.
- **Supuesto.** Primero la rueda (caídas, vueltas y desvíos a excepción del paso k), después las estaciones. Razón: el contrato de
  `RuedaTiempos` exige `pasoActual < paso ≤ pasoActual + ranuras`; si las estaciones colocaran antes de tomar el paso k, un destino a una
  vuelta entera (k + T) violaría el contrato. Como ninguna estación comparte ranura con una rampa (P3 lo rechaza con
  `E-RANURA-REPETIDA`), el orden no cambia ninguna bandeja; solo hace que «la-menos-llena» vea la ocupación con las caídas del paso.
- **Propuesta.** Fijarlo en §6.7 regla 8.

## 7. Una rampa siempre llena con puesto manual hace un ciclo sin fin

- **Qué pasa.** Con una rampa de capacidad 0, cada paquete de su ruta da maxVueltas + 1 pasadas, va a excepción, vuelve con intento + 1,
  se lee bien y vuelve a dar las mismas vueltas, para siempre (la regla 12 no limita los reingresos). Termina con `no-termina`.
- **Supuesto.** Literal. L04 se prueba sin puesto manual (lo que va a excepción se queda ahí), y da exacto: vueltasExtra = 4 × N_ruta.
- **Propuesta.** Que P3 rechace capacidad 0 fuera de las pruebas, o que el puesto manual mande a la jaula directa (como un no
  transportable) un paquete que ya volvió por vueltas máximas.

## 8. Micro-paradas cuando ya no queda trabajo

- **Qué pasa.** La regla 13 encadena las paradas sin fin: llegarían hasta el horizonte (fin + 8 h) e inflarían `paradasLazo` y
  `minutosLazoDetenido` con paradas de un lazo vacío a las 5 de la mañana.
- **Supuesto.** Una parada no ocurre si el hub ya terminó (todos los camiones descargados y todo paquete en su jaula); no se agendan más.
  El contador de pasos del lazo sigue igual.
- **Propuesta.** Escribirlo en la regla 13.

## 9. Bordes del calendario

- Un camión con turno + desvío < 0 llega en el instante 0 del motor (el motor no acepta tiempos negativos).
- La traza empieza en min(inicio del turno, primera llegada) y termina en max(fin del turno, último evento del hub, último listo); los
  tramos JAULA quedan abiertos y se cierran en ese fin.
- La medición por cuarto de hora sigue hasta el fin del turno y, después, mientras quede trabajo (series de 32 cuartos o más).
- `esperaPlayaMediaMin` promedia sobre los camiones que tomaron andén (uno que no llegó a tomarlo antes del horizonte ya levanta
  `no-termina`). `horasRampaLlena` cierra los intervalos de rampa llena abiertos en max(fin del turno, último listo).
- La capacidad de la playa (`hub.playa.capacidad`) no se aplica: el esquema no dice qué pasa si se llena. Propuesta: un aviso del
  compilador o un momento cuando se supera.

## 10. F2

- Sin bandejas: tramo BANDEJA con r = −1, sin ESPERA_BANDEJA; rampas sin tope (la invariante de capacidad se controla solo en F3); sin
  micro-paradas (no hay lazo que parar); misma ruta de bloque `hub.sorter` y mismas direcciones del azar.
- L07 se lee de dos maneras: con números comunes la diferencia de F2 contra F3 es ≤ 2% (MEDIDO: 0,5% en el tiempo medio en el hub y
  0,04% en paquetes por hora, 20 noches), y contra réplicas independientes la diferencia no pasa 3,29 errores estándar. Con números
  comunes el error estándar de la diferencia es tan chico que un sesgo real pero despreciable (la espera de bandeja de F3) lo pasaría.

## 11. Personas: lo que la especificación no dice

- **Fatiga** solo en inducción (la regla 6 la define ahí). El diseño maestro §3.5 la asocia a la persona: si también va en rampa, decidir.
- **Retén:** el que cubre toma el horario de pausas del lugar que cubre; un retén sin nadie que cubrir no hace nada, no tiene pausas y
  cobra la noche (regla 1: «por persona presente (y el retén)»). Las personas ausentes no cobran.
- **Persona de rampa al empezar:** está en la primera rampa de su lista (el primer paquete ahí no camina).
- **No transportable** resuelto en el manual: entra a la jaula de la primera rampa de su ruta; si la completa, la jaula queda pendiente de
  cierre y la cierra la persona de esa rampa en su próxima tarea.
- **RAMPA q** es la persona que atiende la rampa después de redistribuir las de las ausentes. Por eso un paquete en una rampa de alguien
  que faltó muestra la persona ocupada que la cubre, no la ausencia: el explicador (P7) puede cruzarlo con los momentos `AUSENCIA`.
- **Descarga:** un tramo PERSONA_TRABAJA por camión y persona (a = 0), no por paquete.
- **No se emiten tramos PERSONA_LIBRE** (libre = sin tramo); duplicarían los tramos de personas.
- **Lectura:** desde el intento 1 no se sortea (regla 12: «su lectura ya no falla»). R05b compara la lectura del intento 0.
- **aExcepcion** cuenta paquetes distintos (uno que vuelve dos veces cuenta una).

## 12. Momentos con histéresis

`ACUMULACION_LLENA` se emite cuando un andén para por contrapresión y `ACUMULACION_LIBERA` cuando ningún andén está parado y lo ocupado
(acumulación + cintas + en descarga) baja al 80% de los lugares. Sin histéresis, en saturación saldría un par de momentos por paquete.

## 13. La plantilla chica, al pie de la letra, la limita la rampa y no la inducción

- **Qué pasa.** F0 (§5) dice que el cuello es la inducción (ρ 0,81) y la rampa queda en 0,68, pero F0 ignora la caminata y las pausas en el
  pico. En F3, con dos rampas por persona y «la-mas-llena», la persona cambia de rampa casi en cada paquete (2 s más por paquete), y las
  pausas de rampa caen de 00:10 a 01:15, en el pico, sin retén: las rampas de quien pausa se llenan en unos 4 minutos, los paquetes dan
  vueltas, van a excepción por vueltas máximas y el único puesto manual (20 s por paquete) se satura. MEDIDO en 50 noches:

  | Variante del hub chico | Fin (min) P50 · P90 · máx | Recirculación % P50 · P90 | A excepción P50 | Pendientes al corte P50 · P90 |
  |---|---|---|---|---|
  | Como está (plantilla 1.0.0) | 217 · 305 · 428 | 9,0 · 23,9 | 442 | 22 · 418 |
  | Sin caminata entre rampas | 208 · 253 · 427 | 7,9 · 11,2 | 409 | 0 · 158 |
  | Pausas de rampa de 0 min | 181 · 216 · 415 | 0,0 · 14,7 | 285 | 0 · 102 |
  | 7 personas de rampa | 206 · 256 · 428 | 8,0 · 11,1 | 396 | 0 · 138 |
  | 4 puestos de inducción | 208 · 318 · 351 | 9,2 · 27,0 | 436 | 0 · 314 |
  | 2 puestos de inducción | 240 · 359 · 449 | 9,6 · 13,1 | 432 | 182 · 3.054 |

  F0 estima el fin a las 24:30 (150 min); F3 da la mediana a las 01:37 (217 min).
- **Consecuencia para la prueba «KPI sanos».** §9 pide `finClasificacionMin` entre 120 y 300 en 50 noches; con la plantilla literal, 5 de
  50 noches pasan los 300 (la peor, 428: dos de tres inductores ausentes; las otras, una persona de rampa ausente sin retén con volumen
  alto o atraso común). La prueba exige, en las 50 noches, todo clasificado, 0 alertas y fin dentro del turno (≤ 480); la mediana entre
  120 y 300, y entre 120 y 300 en todas las noches sin faltas ni atraso común (28 de 50; la peor, 246).
- **Consecuencia para la decisión de la plantilla** («¿cuántos puestos de inducción para no perder el corte?»). Sigue teniendo sentido
  (con 2 puestos se pierde mucho más), pero un cuarto puesto aumenta la recirculación: la respuesta depende de la rampa, y el tamizado
  (P7) debería mostrar que la caminata y las pausas de rampa mueven la decisión.
- **Propuesta.** Dejarlo como hallazgo del simulador (es justo lo que una planilla no ve) y, para la plantilla de portada, publicar
  `hub-chico@1.1.0` con un retén de rampa o 7 personas de rampa; que F0 (P3) sume la caminata (`caminar` en cada paquete en el peor caso)
  y la pausa del pico, o que el aviso `A-RHO` mire la rampa con la caminata.

## 14. Fotos y restauración

- El estado de los paquetes acepta otro largo (otra réplica: otro factor del día y otra cantidad de paquetes), con todos los arreglos por
  paquete del mismo largo entre sí. Todo lo demás exige el mismo largo: una foto de otro modelo se rechaza diciendo qué esperaba.
- La traza no viaja en la foto (P1, nota 8): al restaurar, los índices de tramos abiertos se olvidan y el escritor nuevo empieza vacío.
  Huella y KPI no cambian (lo prueba `foto.test.ts`).
- Para R06 de la integración el hub exporta `armarNoche` y `opcionesNoche` (README §7). `armarNoche` agenda los eventos iniciales y la
  restauración los reemplaza por el calendario de la foto.
- **Adelanto para la integración (MEDIDO el 18-10-2026 con un guion aparte, fuera de `hub/`: el paquete no importa `nucleo/`).** Con el
  núcleo de producción de P1 tal como está hoy, el hub da la misma huella, los mismos 24 KPI y la misma cantidad de tramos que con la
  referencia (hub chico y grande, semillas 1 y 20261017, traza completa: R08 del hub), y R06 con su `foto()` real da la misma huella y
  los mismos KPI (foto a las 00:00, las dos plantillas). Una noche con traza completa con el núcleo: 73 ms el hub chico y 169 ms el
  grande, ya calientes (presupuestos de §11: 150 y 400 ms).

## 15. Plantilla grande: lo que eligió el generador

§5 da las cantidades, no la disposición. `generar.ts` eligió: rampas a 18 + 2·i m (25 abajo) y a 91 + 1,95·i m (35 arriba), como la
maqueta; rampa i → lugar (i·37) mod 60 (lugar p < 50 → ruta p; p ≥ 50 → segunda rampa de la ruta p − 50), para repartir las rutas grandes
por el lazo; seis puestos a 0,5 + 1,5·i m; lector a 10 m; excepción a 159,5 m; andenes en x = −20, −14, −8, −2; playa de 8; la decisión
hasta 6 puestos; escenario «pico» con 1.385 paquetes por camión. «Los mismos parámetros» incluye el costo fijo de una nave de 1.200 m²:
para 24.000 paquetes probablemente queda chica (propuesta: corregirlo en `hub-lazo-noche@1.1.0` con su fuente).
MEDIDO en 30 noches: recirculación P90 0,4% con «por-volumen» contra 1,6% con «contiguas» (máximo 0,5% contra 14,7%).
