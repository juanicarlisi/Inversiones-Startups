# Notas de contrato · P6 La escena (18-10-2026)

Lo que el contrato (`contratos/vistas.ts`, `contratos/traza.ts`, `contratos/geometria.ts`) o la especificación
(`oportunidades/proyectos/anden/corte-1.md` §9 P6) no fija, fija de forma ambigua o que conviene que la integración y la interfaz (P8)
conozcan. En cada punto: qué pasa, el supuesto con el que siguió la escena y la propuesta. Decide la integración (corte-1.md §2 y §14.8).
Los números son MEDIDOS en Node 22.22.0 y en el Chromium 141 del entorno, en el contenedor de referencia, el 18-10-2026.

## 1. El `Reproductor` del contrato no alcanza para las vistas

- **Qué pasa.** Para dibujar la 2,5D hace falta la altura de cada entidad (un paquete en la bandeja va a 1,15 m; en la rampa, a 0,6 m), el
  nivel de la jaula en curso de cada rampa, si un paquete ocupa dos bandejas y la disposición fija (dónde va cada tobogán, la fila, la
  playa). `Reproductor` y `Posiciones` no lo tienen.
- **Supuesto.** `crearReproductor` devuelve un `ReproductorEscena` (extiende `Reproductor`): `crearPosiciones()` agrega `z: Float32Array`;
  además `disposicion`, `reloj`, `capacidadJaula`, `instante(t)`, `bandejasDe(paquete)`, `jaulas(t, nivel, numero)`, `colaExcepcion(t)` y
  `recortes`. `CrearVista` acepta cualquier `Reproductor`: si no es de la escena (`esReproductorEscena`), dibuja sin jaulas, todo de una
  bandeja y con alturas por defecto.
- **Propuesta (corte 2).** `z?: Float32Array` opcional en `Posiciones` y `jaulas`/`bandejasDe` en `Reproductor`.

## 2. `lado` de una rampa

- **Qué pasa.** `GeometriaHub.rampas[].lado` es `-1 | 1` sin definición. Puede leerse como «signo de y hacia donde sale» o como
  «afuera/adentro del estadio».
- **Supuesto.** Signo de y hacia donde sale la rampa: en las rectas la salida es exactamente `(0, lado)`; en una curva, la normal del lazo
  cuyo y tiene ese signo. Así lo usan la maqueta, `hub/geometria.ts` y las dos plantillas (abajo −1, arriba +1: en los dos casos, hacia
  afuera). Lo prueba `pruebas/limites.test.ts`.
- **Propuesta.** Escribirlo en `contratos/geometria.ts`. Si se prefiere «afuera/adentro», es un cambio de esquema con migración.

## 3. La acumulación es un punto

- **Qué pasa.** `GeometriaHub.acumulacion` trae `x`, `y` y `capacidad`, pero no la forma ni la dirección de la fila.
- **Supuesto.** La fila se dibuja como un bloque en serpentina de paso 0,5 m que empieza en ese punto (lugar 0 = el próximo en ir a la
  inducción) y se orienta, entre 8 orientaciones, hacia donde menos choca con el lazo, las cintas, las rampas, los puestos y los andenes.
  Es solo dibujo: el lugar en la fila sigue siendo `a − salidas hasta t`.
- **Propuesta (corte 2, editor 2D).** Una polilínea para la acumulación en la geometría (como las cintas).

## 4. Orden de los tramos de una entidad

- **Qué pasa.** El contrato no dice si los tramos de una entidad se escriben en orden de `t0`. El reproductor encadena los tramos de cada
  paquete (para saber si lo que sigue es la cola manual, o para recorrer el lazo en F2) y busca el último tramo de cada persona.
- **Supuesto.** Los de un paquete, en orden de escritura (el hub los escribe encadenados: cada tramo empieza donde terminó el anterior).
  Los de las personas y las jaulas se ordenan por `t0` si no vienen ordenados (`pruebas/reproductor.test.ts` lo prueba con tramos al revés).
- **Propuesta.** Fijar en `contratos/traza.ts`: «los tramos de una entidad se escriben en orden de t0».

## 5. Códigos de `EstadoRecursos` y sus textos

- **Qué pasa.** `puestoEstado` y `personaEstado` tienen sus códigos solo en un comentario del contrato.
- **Supuesto.** La escena exporta `EstadoPuesto` y `EstadoPersona` con esos códigos y las claves i18n de cada uno (`CLAVE_PUESTO`,
  `CLAVE_PERSONA`), más `CLAVE_CLASE` (nombre de cada clase de entidad), `CLAVE_ESTADO` y `textoEstado(estado)` (clave y variables de cada
  estado visual: «esperando» lleva `{minutos}` = 5, el umbral `UMBRAL_ESPERA_MS`) y `claveRiesgo(p)` (leyenda de la capa de riesgo). Los
  textos de puesto llevan `{puesto}` (el id del catálogo, que pone la interfaz). Libre es «sin tramo» (el hub no escribe `PERSONA_LIBRE`).
- **Propuesta.** Pasar las dos constantes a `contratos/vistas.ts`.

## 6. Momentos derivados y el nombre del campo de la clave

- **Qué pasa.** §9 P6 pide momentos «más derivados (primer paquete que pierde el corte, fila máxima)», que no están en `TipoMomento`. Y el
  comentario de `MomentoEscena` dice «titulo es una clave i18n» pero el campo se llama `clave`.
- **Supuesto.** `MomentoDerivado.PRIMER_ATRASADO = 100` (t = creación del primer paquete, por hora de creación, que no llega al corte;
  r = ese paquete) y `MomentoDerivado.FILA_MAXIMA = 101` (t = primer instante en que la fila de la acumulación llega a su máximo de la
  noche; v en `vars.paquetes`). Importancia de 1 (detalle) a 5 (clave): CORTE y PRIMER_ATRASADO, 5. Orden: t ascendente, importancia
  descendente, tipo y recurso ascendentes. Un paquete con `creado < 0` cuenta como pendiente pero no marca instante.
- **Propuesta.** Reservar en `contratos/traza.ts` el rango `TipoMomento ≥ 100` para la escena, y corregir el comentario («clave»).

## 7. El instante `fin` y los tramos abiertos

- **Qué pasa.** `EscritorTraza.terminar` cierra los tramos abiertos en `fin` (las jaulas, el último tramo del lazo). Con la regla «activo
  en t0 ≤ t < t1», en `fin` no hay nada activo y el último cuadro saldría vacío.
- **Supuesto.** El reproductor acota el instante a `[inicio, fin − 1 ms]` (y lanza un `RangeError` si no es un número finito).
- **Propuesta.** Escribir en `contratos/traza.ts` que un tramo está activo en `[t0, t1)`.

## 8. El lazo: qué es `a` en `LAZO_DETENIDO`

- **Qué pasa.** `LAZO_DETENIDO` lleva «a = paso del lazo (constante)», sin decir si es el último paso que ocurrió o el primero que no.
- **Supuesto.** El primero que no ocurrió (`kRef + ⌈(t_parada − tRef) ÷ tick⌉`, como lo escribe `hub/bloques/sorter.ts`), que es el `a`
  del `LAZO_MARCHA` que sigue. Para que el dibujo sea continuo y caiga exacto en la ranura en el borde de cada paso, el último medio paso
  antes de la parada se recorre comprimido entre el último paso y la parada (las bandejas llegan a la ranura `kp` cuando el lazo para y
  se quedan ahí). Lo prueba `pruebas/lazo.test.ts` (borde de cada paso, parada a mitad de un paso y justo en un paso, reinicio).
- **Propuesta.** Escribirlo en el comentario de `TipoTramo.LAZO_DETENIDO`.

## 9. Paquetes de dos bandejas en F2

- **Qué pasa.** La escena sabe que un paquete ocupa dos bandejas por su `ESPERA_BANDEJA` con `a = 2`. En F2 no hay espera de bandeja, y
  `ColumnasPaquetes.clase` es un índice a `perfilPaquete.clases`, que la traza no trae.
- **Supuesto.** En F2 todos se dibujan de una bandeja (F2 no tiene bandejas: el lazo es una demora).
- **Propuesta.** Agregar `clases: { id: string; bandejas: 1 | 2 }[]` al `Catalogo`.

## 10. El mapa de riesgo: bordes que el contrato no fija

- **Supuesto.** Sin noches (mientras llegan), `agregarRiesgo` devuelve un mapa vacío con `nocheMediana = nochePeor = −1` y percentiles
  `NaN`. La noche mediana es la de la posición ⌊n/2⌋ al ordenar por `kpiNoche` (la misma que el P50); la peor sigue `META_KPI.mejor`
  (`'neutro'` se toma como «menos es mejor»); empates, a la menor réplica. Una noche que no tuvo un cuarto de hora (terminó antes) cuenta
  como fila 0 en ese cuarto. Se rechaza mezclar modelos o noches con distinta cantidad de rampas. Percentiles con la definición de §7.
- **Qué falta.** La pantalla de cien noches (§9 P8.4) tiene el selector «mediana / peor / mejor» y `MapaRiesgo` no trae la mejor.
  La escena exporta `elegirNoche(resultados, kpi, 'mejor')`.
- **Propuesta.** `nocheMejor` en `MapaRiesgo`.

## 11. Opciones de la vista que el contrato no deja pasar

- **Qué pasa.** `CrearVista` recibe solo lienzo, reproductor, estilo y piso. Para probar en Node (sin `OffscreenCanvas`) y para que la
  integración elija dónde hornear, hace falta inyectar la fábrica de lienzos fuera de pantalla y el reloj del pulso de la selección.
- **Supuesto.** `crearVista` (el del contrato) usa `OffscreenCanvas` o un `<canvas>` del documento y `performance.now`; `crearVistaCon(…,
  { crearLienzo, reloj })` deja inyectarlos. El reloj solo anima el halo de la selección (nunca toca un número) y con movimiento reducido
  no se usa.

## 12. La cámara puede venir girada

- **Qué pasa.** En un teléfono parado (360 × 740), un hub apaisado sin girar ocupa una franja de un tercio de la pantalla.
- **Supuesto.** `encuadrar` sin giro elige `giroAuto`: un cuarto de vuelta más si así el hub se ve al menos 1,25 veces más grande (en la
  planta 0 → π/2; en la 2,5D 24° → 114°). La interfaz no puede suponer `camara.giro = 0`: para tocar usa `vista.aMundo`, que es la inversa
  exacta de la proyección con cualquier giro (lo prueba `pruebas/vista.test.ts`).

## 13. Red de seguridad de los límites

- **Supuesto.** Toda posición se recorta a `geometria.limites` antes de entregarla (un número fuera del piso nunca llega al lienzo), y el
  reproductor cuenta cuántas recortó (`recortes`). Las pruebas exigen 0 en 1.000 instantes de la maqueta de 24.000 y de 90.000 y de una
  traza sintética, para que el recorte no tape un error de las fórmulas. MEDIDO también con un guion aparte (fuera de `escena/`, el paquete
  no importa `hub/`) sobre trazas reales del hub con la referencia: 0 recortes y 0 posiciones inválidas en 3 noches de cada plantilla.

## 14. La fixture de la maqueta solo arma la de 24.000

- **Qué pasa.** §9 P6 pide el costo de `posiciones` «en el hub de 90k de la maqueta», y `contratos/fixtures/traza-maqueta.ts` solo convierte
  `HUB_BASE`.
- **Supuesto.** `pruebas/ayudas.ts` trae una copia del conversor con la geometría generalizada (`trazaDeMaquetaCon(parametros, semilla)`) y
  usa `hubGrande()` de la maqueta (sin tocar `contratos/`).
- **Propuesta.** Que la fixture acepte los parámetros: `trazaDeMaqueta(semilla, parametros = HUB_BASE)`.

## 15. Lo que la escena entrega y lo que mide (para la integración)

- **Entrega** (`escena/indice.ts`): `crearReproductor`, `crearVista`, `elegirPiso`, `agregarRiesgo`, `detectarMomentos`, `estilos` (claro y
  oscuro), `componer2d` y `componerIso` (puras), más `pintar`, `crearVistaCon`, `encuadrarVista`, `encuadrar`, `giroAuto`, `medidorDeCuadro`,
  `elegirNoche`, `narrar` (para la región `aria-live`), las claves i18n de estados, puestos, personas, clases y riesgo, y las cuentas de
  contraste. Textos en `textos.es.json` y `textos.en.json` (65 claves `escena.*`, las mismas en los dos idiomas).
- **Costo (MEDIDO, informativo; los presupuestos los mide el banco de §11).** `posiciones + recursos` en la maqueta de 90.000: mediana
  0,13 ms y P90 0,24 ms por cuadro en Node (meta ≤ 1 ms). Componer la capa móvil de la 90.000: 0,9 ms la planta y 1,7 ms la 2,5D (Node).
  Cuadro completo en Chromium (1280 × 800, dpr 2, ya caliente, mediana de 60): hub chico 0,2 ms la planta y 0,5 ms la 2,5D; hub de 24.000
  0,3 ms y 1,1 ms (presupuestos de §11: 3 ms y 4 ms).
