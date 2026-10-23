# Notas de contrato · P4 El hub (18-10-2026; certificado de §13 el 19-10-2026; §13 vuelto a medir con el motor 1.1.0, §16, la auditoría de la cascada y §17 el 23-10-2026)

Lo que el contrato (`contratos/`) o la especificación (`oportunidades/proyectos/anden/corte-1.md`) no fija, fija de forma contradictoria
o que, aplicado al pie de la letra, da un resultado que conviene que la integración conozca. En cada punto: qué pasa, el supuesto con el
que siguió el hub y la propuesta. Decide la integración (corte-1.md §2 y §14.8). Los números son MEDIDOS con el motor de referencia en
Node 22.22.0, en el contenedor del entorno, el 18-10-2026, salvo indicación.

> **Resuelto por la integración (23-10-2026, paso I-1):** camino 2. La prueba `todo` de `pruebas/kpi.test.ts` se borró (la principal ya
> exige el criterio corregido y pasa; el certificado queda como constancia) y el texto para `corte-1.md` §9 está en
> `integracion/CAMBIOS-CONTRATO.md` §10, para que lo pase el orquestador. `hub-chico@1.1.0` sigue como propuesta, sin publicar.
>
> **Lo único que le falta a P4 es una decisión que no es de P4 (23-10-2026, segunda vuelta).** Todas las entregas y pruebas propias de §9
> están hechas y pasan (78 pruebas: 77 pasan, 0 fallan, 1 `todo`; 35 s), salvo «KPI sanos» **al pie de la letra** sobre `hub-chico@1.0.0`,
> que es imposible con esa plantilla (§13: certificado sin correr el hub). El paquete no puede cerrarlo solo: publicar 1.1.0 cambia lo que
> muestra la app y la integración recomendó no hacerlo; corregir el criterio es cambiar `corte-1.md`, que no es de P4. **Hace falta que el
> orquestador elija uno de los dos caminos de §13.** El dueño de P4 recomienda el 2, como la integración: `hub-chico@1.0.0` es el ejemplo de
> §5 (F0, doradas, tamaños de enlace) y cambiarle la dotación para pasar una prueba cambiaría la historia de la decisión. Lo que hace P4
> después, en sus archivos, es corto:
> - **Camino 1 (publicar `hub-chico@1.1.0`):** mover la entrada de `PROPUESTAS` a `PLANTILLAS` en `plantillas/registro.ts`; actualizar
>   la lista de claves en `pruebas/plantillas.test.ts`; en `pruebas/kpi.test.ts` sacar la marca `todo` y correr la prueba literal sobre
>   1.1.0 (la de la propuesta ya pasa en 50 noches, y 0 de 200 noches quedan fuera del rango).
> - **Camino 2 (corregir §9):** en `corte-1.md` §9, P4, «Pruebas propias», reemplazar «KPI sanos en 50 noches del hub chico
>   (`clasificados = paquetes` al horizonte, `finClasificacionMin` entre 120 y 300, sin alertas)» por: «KPI sanos en 50 noches del hub
>   chico (`clasificados = paquetes` al horizonte y sin alertas en todas; `finClasificacionMin` entre 120 y 300 en toda noche sin golpes
>   discretos; una noche con faltas o atraso común puede pasarse, pero la misma noche sin ese golpe —misma semilla y réplica— tiene que
>   caer en el rango)». En P4, borrar la prueba `todo` de `pruebas/kpi.test.ts` (la principal ya exige ese texto y pasa; el certificado
>   queda como constancia de por qué).
>
> **La cascada de las dos noches de afuera, auditada (23-10-2026, segunda vuelta; §13, «Auditoría de la cascada»):** ningún recurso queda
> libre con trabajo al lado y las reglas 9, 10 y 12 se cumplen leídas solo desde la traza. La auditoría encontró dos faltas de rampa en
> otras noches, que se arreglaron (§17): no tocan r21 ni r44 ni las doradas, y de las 200 noches de 1.0.0 cambian solo la r34.
>
> Re-medido por el dueño el 23-10-2026 (200 noches por versión, réplicas 0–199, semilla 20261017, motor de referencia), con los arreglos de
> §17: con 1.0.0, 13 noches fuera de 120–300 min (las mismas 13 de §13), 0 alertas, 0 sin clasificar, P50 192,2 · P90 261,7 · máx 587,9 min
> (el P50 era 193,4 antes de §17: la r34, que pasa de 195,5 a 190,9 min, estaba en la mitad); con la propuesta 1.1.0, 0 fuera, P50 179,8 ·
> P90 197,7 · máx 242,1 min (ninguna de las 200 noches cambia con §17).

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

## 13. La plantilla chica, al pie de la letra, la limita la rampa y no la inducción; «KPI sanos» de §9 no se puede cumplir con ella

> **Vuelto a medir el 23-10-2026 con el motor 1.1.0** (los arreglos R1–R5 de la revisión, `integracion/CAMBIOS-CONTRATO.md` §2): motor de
> referencia, Node 22.22.0, semilla 20261017. Las tablas del 18 y 19-10-2026 eran del motor 1.0.0 y quedan reemplazadas por estas. Lo que
> no depende del motor (el certificado de r44, que se calcula sin correr el hub) sigue igual.

- **Qué pasa.** F0 (§5) dice que el cuello es la inducción (ρ 0,81) y la rampa queda en 0,68, pero F0 ignora la caminata y las pausas en
  el pico. En F3 las pausas de rampa caen de 00:10 a 01:15, en el pico; desde 1.1.0 a quien pausa lo releva otra persona (regla 7 de
  1.1.0), pero esa persona atiende dos bloques de rampas a la vez, las rampas se llenan, los paquetes dan vueltas, van a excepción por
  vueltas máximas y el único puesto manual (20 s por paquete, unas cinco veces lo que cuesta en la rampa) pone la cola de la noche: en
  la peor parte de la cola se clasifican ~45 paquetes por cuarto de hora, el ritmo del puesto manual. MEDIDO en 50 noches (réplicas 0–49):

  | Variante del hub chico (motor 1.1.0) | Fin (min) P50 · P90 · máx | Recirculación % P50 · P90 | Pendientes al corte P50 · P90 | P(todo al corte) |
  |---|---|---|---|---|
  | Como está (plantilla 1.0.0) | 189 · 251 · 415 | 2,4 · 10,5 | 0 · 226 | 0,78 |
  | Pausas de rampa de 0 min | 180 · 211 · 415 | 0,0 · 0,1 | 0 · 11 | 0,90 |
  | 7 personas de rampa | 181 · 216 · 416 | 0,2 · 6,2 | 0 · 78 | 0,86 |
  | 4 puestos de inducción | 179 · 212 · 338 | 2,3 · 12,3 | 0 · 6 | 0,88 |
  | 2 puestos de inducción | 216 · 356 · 443 (y r44 sin ningún inductor: `no-termina`) | 0,3 · 7,3 | 120 · 3.042 | 0,40 |

  La fila «sin caminata» de las tablas viejas ya no se puede armar: desde 1.1.0 la caminata es la distancia por el pasillo a 1,2 m/s y
  `caminar` es solo el mínimo, así que `caminar = 0` da exactamente lo mismo que la plantilla (MEDIDO). F0 estima el fin a las 24:30
  (150 min); F3 da la mediana a las 01:09 (189 min).

- **El criterio literal de §9 es imposible con hub-chico@1.0.0 (no es un problema del hub ni de la semilla).** §9 pide
  `finClasificacionMin` entre 120 y 300 en las 50 noches. Con 1.1.0, 48 de 50 quedan dentro (con 1.0.0 eran 45). Las 2 de afuera:

  | Noche | Fin (min) | Golpe de la noche | La misma noche sin el golpe (números comunes) |
  |---|---|---|---|
  | r21 | 330,8 | atraso común de 29,7 min | 205,1 |
  | r44 | 414,8 | 2 de 3 inductores ausentes (P-I1 y P-I2) | 199,6 |

  r3, r15 y r45 (una persona de rampa ausente) volvieron al rango con el plan por bloques vecinos, la persistencia y el relevo de 1.1.0.
  r44 es **imposible por §6.7**, con cualquier implementación: sin retén (regla 2) los puestos quedan sin persona, y el único inductor
  presente necesita 333,5 min solo para inducir la primera vez a sus 8.319 transportables (Σ de sus tiempos base, sorteados por dirección;
  la cota no depende del mecanismo ni de la versión del motor). **Está certificado sin el hub** (desde el 19-10-2026): `kpi.test.ts`
  sortea con la fuente de referencia de `contratos/` y las direcciones de §6.3 (factor del día, clase y tiempo base de cada (camión,
  índice), faltas de inducción y del retén), sin ningún código de `hub/`, y llega a los mismos 8.460 paquetes, 8.319 transportables,
  1 inductor presente y 333,5 min; después controla que el hub sorteó exactamente eso (misma Σ de tiempos base al milisegundo) y que su
  fin (414,8) no queda antes. Que sea r44 sí es suerte de esta semilla: en 400 noches (réplicas 0–399) es la única con esa cota por encima
  de 300 (la que sigue, r313, con dos inductores ausentes y 7.140 transportables, da 286,3 min). Pero con otra semilla el criterio literal
  tampoco se cumpliría: en 200 noches (réplicas 0–199) quedan **13 fuera del rango (6,5%)**, así que la probabilidad de que 50 noches
  seguidas caigan todas adentro es ≈ 0,935⁵⁰ ≈ 3,5% (cuenta). Las 13 tienen un golpe discreto y las 13 vuelven al rango sin él (MEDIDO
  con números comunes): 11 por atraso común (r21, r51, r61, r89, r96, r102, r104, r126, r152, r154, r199; de 29 a 43 min de atraso, sin él
  terminan entre 178 y 230 min) y 2 por faltas (r44 y r62, con dos personas de rampa ausentes: 587,9 min, 186,3 sin las faltas). El
  atraso común pega mucho más que lo que atrasa: corre el pico de los camiones sobre las pausas de rampa y la cola la pone otra vez el
  puesto manual (r51: 683 paquetes a excepción contra 302 sin el atraso). Elegir una semilla «que pase» sería buscarla entre unas 30: no
  se hace (la prueba usa la de la plantilla, `experimento.semilla`).
  MEDIDO el 23-10-2026 en r21 (misma semilla y réplica, cambiando una cosa por vez), para ver que no es un defecto del hub sino la cadena
  pausas de rampa → rampas llenas → vueltas máximas → un solo puesto manual: tal cual, 330,8 min, 691 paquetes a excepción, 26,5% de
  recirculación, 3,0 h de rampa llena y una cola de ~45 clasificados por cuarto de hora (el ritmo del puesto manual) de 01:45 a 03:30;
  sin el atraso, 205,1 min y 378 a excepción; sin pausas de rampa, 214,6 min, 296 a excepción y 0 vueltas; con 2 puestos manuales,
  239,5 min; con 7 personas de rampa, 242,9 min. Los tres cambios de 1.1.0 atacan las dos clases de noches de afuera: el retén, las
  faltas de inducción (como r44); la séptima persona de rampa y el segundo puesto manual, el atraso común (como r21).

- **Auditoría de la cascada (23-10-2026, segunda vuelta; MEDIDO salvo indicación).** Lo que el verificador no había revisado regla por
  regla (pausas de rampa → rampas llenas → excepción → un puesto manual), controlado de dos maneras que no dependen de los contrafactuales:
  1. **Conservación del trabajo, evento por evento** (`pruebas/conservacion-trabajo.test.ts`). Después de cada evento de la noche:
     ningún puesto de inducción libre con paquetes en la acumulación; ningún puesto manual libre con cola; ninguna persona de rampa libre
     con paquetes o una jaula sin cerrar en sus rampas; ninguna rampa a cargo de nadie (o de alguien en pausa) mientras otra persona de
     rampa está fuera de pausa; ningún andén libre con camiones en la playa, quieto con camión o parado con lugar en la acumulación. En
     r21 y r44: 0 faltas. Con los arreglos de §17, 0 faltas en 200 noches de 1.0.0, 100 de la propuesta 1.1.0, 20 de la grande y 20 de la
     grande con 9 personas contiguas (antes de §17: 1 falta de 0,6 min, en la r34 de 1.0.0).
  2. **Reglas 9, 10 y 12 leídas solo de la traza** (sonda fuera del repositorio; la ocupación de cada rampa sale de sus tramos RAMPA). En
     r21: las 2.345 vueltas de más pasan todas con la rampa llena; ninguna de las 8.317 caídas encuentra la rampa llena; los 409 paquetes
     que van a excepción por vueltas lo hacen todos en su cuarta pasada (maxVueltas 3, más 1) y ninguno antes; la cola manual (705
     entradas) se atiende en orden y el único puesto manual nunca hace dos cosas a la vez. En r44 no hay ninguna vuelta: la noche la pone
     la inducción con un solo inductor, como dice el certificado.

  **Qué alarga r21, entonces** (MEDIDO entre 00:10 y 01:15, las pausas de rampa; la lectura es INFERENCIA). No hay gente mirando con
  trabajo al lado: es la regla de que cada persona atiende solo sus rampas (regla 7, bloques por volumen de 1.1.0) con el pico corrido por
  el atraso encima de las pausas. P-R2, cuya única rampa es R03 (12% del volumen), estuvo libre 25 de esos 65 min mientras diez de las doce
  rampas estuvieron llenas entre 8 y 28 min (R06 28, R01 20, R07 19); sin el atraso, P-R2 libre 29 min y ninguna rampa llena más de
  12 min. Quien releva a alguien en pausa atiende dos bloques. **Propuesta para el corte 2** (junto con R6 de la revisión, la rampa
  alternativa de la misma ruta): que una persona libre ayude en una rampa llena de un bloque vecino. No cambia la decisión de §9: r44
  sigue siendo imposible con cualquier regla de rampa.

- **Qué exigen las pruebas (`kpi.test.ts`).** Cuatro pruebas, una por pregunta:
  1. **Sobre 1.0.0, lo más fuerte que es cierto** (pasa). En las 50 noches: 0 alertas, todo clasificado al horizonte, 24 KPI finitos, las
     definiciones de §6.9 y los costos; el fin nunca antes de la cota de la inducción (control del mecanismo); la mediana entre 120 y 300;
     **cada noche fuera de 120–300 tiene un golpe discreto (faltas o atraso común) y el contrafactual con la misma semilla y réplica sin ese
     golpe cae entre 120 y 300** (de a un golpe y, si ninguno solo alcanza, juntos, como el contrafactual de P7); y al menos una noche es
     imposible por la inducción (si eso deja de pasar, la prueba avisa que §9 ya se puede pedir al pie de la letra). Su salida muestra el
     criterio literal («48 de 50») con cada noche de afuera y su explicación.
  2. **El certificado de imposibilidad, sin correr el hub** (pasa): con la semilla de la plantilla, al menos una de las 50 noches tiene la
     cota de la inducción por encima de 300 min calculada solo con la plantilla y §6.3 (r44: 333,5 min), y en esas noches el hub sorteó lo
     mismo y no terminó antes.
  3. **El criterio literal de §9 sobre 1.0.0, como prueba pendiente** (`todo` de `node:test`): corre, falla con las 2 noches de afuera
     (r21 330,8 · r44 414,8 min) y no rompe la suite. El resumen la cuenta como `todo 1`. Queda así a la vista hasta que decida la
     integración; no reusa ninguna noche distinta de las de la prueba 1 (las corre una vez).
  4. **El criterio literal de §9 sobre la propuesta 1.1.0** (pasa): las 50 noches entre 120 y 300 min, todo clasificado, sin alertas.

- **La propuesta `hub-chico@1.1.0` sigue lista para publicar (desde el 18-10-2026).** Es una plantilla guardada,
  `hub/plantillas/hub-chico-1.1.0.json`, exportada como `PROPUESTAS['hub-chico@1.1.0']` (`registro.ts` e `indice.ts`) y **fuera de
  `PLANTILLAS`**: la app, el enlace y `plantilla(id, versión)` no la ven. La genera `generarHubChico110` (`generar.ts`) desde 1.0.0 con
  `PARCHE_HUB_CHICO_1_1_0` (retén 1, 7 personas de rampa, 2 puestos manuales); `plantillas.test.ts` controla que el generador la reproduzca
  exacta, que fuera de los metadatos sea 1.0.0 + el parche (mismo id de modelo, mismos parámetros, misma decisión, misma semilla), que la
  procedencia de los tres valores sea SUPUESTO con fuente y fecha, que ningún escenario quede sin efecto (el «reten» de 1.0.0 pasa a
  «sin-reten»), y le aplica lo mismo que a las publicadas: coherencia, geometría, textos ≤ 1.000 caracteres sin caracteres de control y
  lista negra. El compilador de P3 la aceptaba sin errores ni avisos el 19-10-2026 (solo `I-SUPUESTOS` e `I-CONTROLES`).

- **Lo medido con el motor 1.1.0** (200 noches, réplicas 0–199):

  | Versión de la plantilla | Fin (min) P50 · P90 · máx | Noches fuera de 120–300 | Alertas | Sin clasificar | P(todo al corte) | Costo medio por noche |
  |---|---|---|---|---|---|---|
  | 1.0.0 | 193 · 262 · 588 | 13 de 200 (6,5%) | 0 | 0 | 0,730 | $1,38 M |
  | 1.1.0 (propuesta) | 180 · 198 · 242 | 0 de 200 | 0 | 0 | 0,940 | $1,54 M |

- **La decisión con 1.1.0 ahora tiene respuesta** (MEDIDO, 400 noches por valor, réplicas 0–399, Wilson al 95% como dice §7):

  | Puestos activos | P(todo al corte) | Wilson 95% | Estado con meta 0,9 | Costo medio |
  |---|---|---|---|---|
  | 2 | 0,4675 (187 de 400) | 0,419 – 0,516 | no-cumple | $1,49 M |
  | 3 | 0,9500 (380 de 400) | 0,924 – 0,967 | **cumple** | $1,54 M |
  | 4 | 0,9725 (389 de 400) | 0,951 – 0,985 | cumple | $1,60 M |
  | 5 | 0,9750 (390 de 400) | 0,955 – 0,986 | cumple | $1,65 M |

  Con la regla de §7 la recomendación es **3 puestos**; con la corrección por mirar varias veces de la integración (confianza 99,75% por
  mirada, `CAMBIOS-CONTRATO.md` §6) el extremo inferior de 3 con 400 noches da 0,906 (cuenta): sigue cumpliendo. Con el motor 1.0.0 el
  3 quedaba «en duda» (0,9175). Con la plantilla 1.0.0 ningún valor llega a 0,9 (200 noches: 0,360 · 0,730 · 0,820 · 0,775, los cuatro
  «no-cumple»): el atraso común y la cola del puesto manual ponen el techo, y 5 puestos rinde menos que 4 porque cargan más las rampas.

- **Propuesta para la integración** (decide; el hub no publica nada). Dos caminos, no excluyentes:
  1. **Publicar `hub-chico@1.1.0`.** El cambio, en archivos de P4, es mover la entrada de `PROPUESTAS` a `PLANTILLAS` en
     `hub/plantillas/registro.ts`, cambiar en `plantillas.test.ts` la lista de claves que espera el registro, y en `kpi.test.ts` sacar
     la marca `todo` (la prueba 3 pasa a correr sobre la versión publicada que la integración elija para «el hub chico»; la prueba 4 ya
     pasa). Efectos en otros paquetes: el inicio de P8 recorre todas las claves del registro, así que mostraría dos tarjetas del hub
     chico (conviene mostrar solo la última versión de cada id); el F0 de §5 y las pruebas de P3 siguen sobre 1.0.0, que no cambia; los
     enlaces `t=hub-chico@1.0.0` siguen abriendo lo mismo. Con 1.1.0 «decidir» recomienda 3 puestos con semáforo verde (tabla de arriba).
  2. **Corregir §9** si 1.0.0 sigue siendo la plantilla de la prueba (lo que recomienda la integración, `integracion/NOTAS-CONTRATO.md`
     §3.1): «`finClasificacionMin` entre 120 y 300 en toda noche sin golpes discretos; las que tienen faltas o atraso común pueden
     pasarse, pero el contrafactual sin el golpe tiene que caer en el rango», que es exactamente lo que exige la prueba 1. En ese caso,
     borrar la prueba 3 (la 2, el certificado, queda como constancia de por qué).
  Además: que F0 (P3) sume la caminata y la pausa del pico, o que el aviso `A-RHO` mire la rampa con la caminata y el puesto manual; hoy
  F0 dice «cuello: inducción» (ρ 0,81) en las dos versiones del hub chico, cuyo cuello en F3 es la rampa con la excepción. Y, para el
  corte 2, que el puesto manual tenga un tope de reingresos o que la persona de la excepción espere lugar (§4 y §7 de estas notas): es lo
  que convierte un atraso de 30 min en dos horas más de noche.

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
  **Vuelto a medir el 19-10-2026** con el núcleo de hoy (mismo guion aparte): R08 del hub igual en las 8 corridas (dos plantillas,
  semillas 1 y 20261017, réplicas 0 y 3: misma huella, 24 KPI idénticos, misma cantidad de tramos, 0 alertas); R06 con `foto()` a las
  00:00 y a la 01:30, las dos plantillas: misma huella y mismos KPI que la corrida continua. Mediana de 5 noches con traza completa, ya
  calientes y con otras pruebas corriendo en paralelo: 91 ms el chico y 241 ms el grande (informativo; lo mide el banco).

## 15. Plantilla grande: lo que eligió el generador

§5 da las cantidades, no la disposición. `generar.ts` eligió: rampas a 18 + 2·i m (25 abajo) y a 91 + 1,95·i m (35 arriba), como la
maqueta; rampa i → lugar (i·37) mod 60 (lugar p < 50 → ruta p; p ≥ 50 → segunda rampa de la ruta p − 50), para repartir las rutas grandes
por el lazo; seis puestos a 0,5 + 1,5·i m; lector a 10 m; excepción a 159,5 m; andenes en x = −20, −14, −8, −2; playa de 8; la decisión
hasta 6 puestos; escenario «pico» con 1.385 paquetes por camión. «Los mismos parámetros» incluye el costo fijo de una nave de 1.200 m²:
para 24.000 paquetes probablemente queda chica (propuesta: corregirlo en `hub-lazo-noche@1.1.0` con su fuente).
MEDIDO en 30 noches con el motor 1.0.0: recirculación P90 0,4% con «por-volumen» contra 1,6% con «contiguas» (máximo 0,5% contra 14,7%).
**Con el motor 1.1.0 (23-10-2026, réplicas 0–29):** con las 15 personas de rampa de la plantilla ninguna rampa se llena con ninguno de los
dos planes y los dos P90 dan 0%: la prueba de §9 («P90 por volumen ≤ contiguas en 30 noches de la grande») se cumple, pero no distingue
nada. Por eso `plan-grande.test.ts` la corre tal cual y además con 9 personas de rampa, donde el plan decide: P90 0,011% contra 29,5%,
media 0,003% contra 6,5% y P(todo antes del corte) 1,00 contra 0,83 (con 8 personas: 0,27% contra 43,0%, y una noche de «contiguas» que
no termina). Propuesta para §9: pedir la comparación con la dotación de rampa del recorrido (9), que es donde se ve lo que la prueba
quiere proteger.

## 16. Dos arreglos de robustez (23-10-2026) que no cambian ninguna huella de las plantillas

Encontrados con sondas fuera del repositorio sobre modelos que el esquema permite y las plantillas no usan. Ninguno pasa en las
plantillas publicadas (MEDIDO contando cuántas veces actúa cada guarda: 0 en 50 noches del chico, 50 de la propuesta 1.1.0 y 20 de la
grande), así que las doradas de `pruebas/doradas.json`, R08 y R04 no cambian; las pruebas nuevas están en `pruebas/bordes.test.ts` y
fallan con el código anterior. **Lo que sí cambia, para la integración:** en el hub del primer minuto (`integracion/e2e/comun.mjs` ›
`PARCHE_PRIMER_MINUTO`: la grande con 9 personas de rampa y «contiguas», semilla 20261017) la guarda de la jaula actúa en 1 de las 100
noches de la escena, la r25 (una vez): esa noche tiene otra huella y otros KPI. La noche que muestra el recorrido es la peor, r19 (851,7
min), y no cambia; el recorrido calcula todo al correr, así que no hay doradas que regenerar.

1. **El lazo tomaba dos veces el mismo paso y la noche se cortaba** (`rueda.tomar: el paso tiene que ser mayor que el último tomado`).
   Con tareas de 0 s (descarga, inducción, manejo y manual fijos en 0, que el esquema acepta): un paso dejaba el lazo vacío y, en el mismo
   instante, un paquete que volvía del puesto manual se inducía en 0 s y pedía otra vez ese paso. En 3 de 5 noches del chico así armado
   la simulación tiraba un error en lugar de devolver un resultado. **Arreglo** (`bloques/sorter.ts` › `agendarPaso`): nunca se agenda un
   paso que ya se tomó; el próximo posible es el siguiente de la grilla. La regla 8 no lo decía porque supone tiempos positivos.
2. **Una jaula se daba por cerrada antes de completarse y la siguiente quedaba sin cerrar.** Con el relevo de 1.1.0: la persona que
   releva camina a cerrar una jaula de la dueña en pausa; si la dueña vuelve en esa caminata, parada en esa rampa, la cierra en el acto, y
   el relevo llegaba y «cerraba» otra vez: la cuenta de jaulas pendientes quedaba en −1, se daba por cerrada la jaula siguiente antes de
   completarse y esa, al completarse, nunca se cerraba. Los totales coincidían y ningún KPI lo mostraba (MEDIDO: 148 veces en 100 noches
   de un hub de dos rampas con jaulas de 1 paquete y 40% de no transportables). **Arreglo** (`bloques/rampas.ts` › `ejecutar`): quien
   llega a cerrar una jaula que ya cerró otra persona busca otra tarea, como cuando llega a una rampa que otro vació. **Supuesto** (la
   regla 11 no lo dice): cierra la jaula la primera persona que llega. **Propuesta:** escribirlo en la regla 11 de 1.1.0.
   Además, el momento `JAULA_CERRADA` decía en `v` la última jaula completa de la rampa y no la que se cerró; si mientras se cerraba una se
   completaba otra (un no transportable que entra directo desde el puesto manual), salían dos momentos con la misma jaula. Ahora `v` es la
   jaula que cerró esa persona (`S.cerrando` en el estado de `hub.rampas`). Una foto tomada con el código anterior no se restaura con este
   (falta «cerrando» y se rechaza diciéndolo); en el corte 1 las fotos no se guardan entre versiones, así que no afecta a nadie.

## 17. Dos faltas de rampa que encontró la auditoría de la cascada (23-10-2026, segunda vuelta), con su arreglo

Encontradas con el auditor de conservación del trabajo (§13, «Auditoría de la cascada»; `pruebas/conservacion-trabajo.test.ts`). Las
pruebas nuevas fallan con el código anterior (MEDIDO sobre una copia del hub sin estos dos arreglos, fuera del repositorio) y pasan con
este. Las dos son de la regla del relevo de 1.1.0 (R3), que se agregó después de las pruebas originales.

1. **Una jaula que completaba un relevo cuando la dueña ya había vuelto de la pausa quedaba sin aviso** (`bloques/rampas.ts` ›
   `finManejo`). Quien relevaba seguía con un paquete en la mano cuando la dueña volvía y recuperaba sus rampas; si ese paquete completaba
   la jaula, la jaula quedaba pendiente para la dueña, pero nadie le avisaba: si estaba libre, se quedaba libre hasta que le cayera otro
   paquete. En la r34 de 1.0.0 (semilla de la plantilla), 0,6 min; en 200 noches de 1.0.0 es la única vez; en 200 de la propuesta 1.1.0,
   20 de la grande y 100 del hub del primer minuto, ninguna. **Arreglo:** al terminar de manejar, si la rampa la atiende ahora otra
   persona y está libre, se le avisa (`atender`; si no hay jaula pendiente no hace nada). **Supuesto** (la regla 11 dice «al completar la
   jaula, la cierra»; con relevo no dice quién): la cierra quien atiende la rampa, como toda jaula pendiente (§16). **Propuesta:**
   escribirlo en la regla 11 de 1.1.0.
2. **Las rampas de alguien que empezaba la pausa sin relevo disponible quedaban sin nadie hasta el fin de esa pausa** (`bloques/rampas.ts`
   › `terminarPausa`). El relevo se elige cuando empieza la pausa; si en ese momento todas las demás personas de rampa estaban en pausa,
   las rampas quedaban a cargo de la persona en pausa y, cuando otra volvía, recuperaba solo las suyas. **Arreglo:** quien vuelve de su
   pausa toma también las rampas que están a cargo de alguien en pausa (la dueña las recupera al volver, como siempre). Con tres personas
   de rampa presentes o más y las pausas de las plantillas no pasa nunca (a lo sumo dos en pausa a la vez); con dos personas y pausas
   superpuestas pasaba en las 5 noches del modelo de la prueba, y en el hub chico con 2 personas de rampa en 51 de 60 noches. **Propuesta:**
   escribir en la regla 7 de 1.1.0 «durante la pausa sus rampas las atiende la siguiente persona presente que no esté en pausa; si no hay
   ninguna, la primera que vuelva de la suya».

**Lo que cambia** (MEDIDO, huellas con y sin los arreglos, motor de referencia, semilla de cada plantilla): las doradas de
`pruebas/doradas.json`, r21 y r44 no cambian. Cambia 1 de 200 noches de `hub-chico@1.0.0` (r34: fin 195,5 → 190,9 min; el P50 de las 200
pasa de 193,4 a 192,2 min) y ninguna de las 200 de la propuesta 1.1.0, de las 20 de la grande, de las 30 de la grande con 9 personas de
rampa (por volumen o contiguas) ni de las 100 del hub del primer minuto (`integracion/e2e/comun.mjs` › `PARCHE_PRIMER_MINUTO`). En las
tablas de la decisión de §13 (400 noches por valor con 1.1.0 y 200 con 1.0.0) cambian a lo sumo 2 noches por valor y P(todo al corte) da
los mismos valores en las ocho filas; lo mismo en el hub del recorrido «decidir» (chico con retén 1, 7 personas de rampa, 2 puestos
manuales y corte a las 03:00; 400 noches por valor de 2 a 5 puestos: 0,9950 · 1,0000 · 1,0000 · 0,9975 con y sin los arreglos). El
estado de `hub.rampas` no tiene claves nuevas: las fotos siguen siendo compatibles.
