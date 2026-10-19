# Andén simulador · corte 1 · P4 · El hub (`hub/`)

El mecanismo del hub de clasificación de última milla de `corte-1.md` §6.7 en fidelidad **F3** (bandejas, rueda de tiempos, rampas que
se llenan, personas con pausas y faltas) y **F2** (el lazo como demora fija), con su traza completa, sus KPI de §6.9, sus costos y las dos
plantillas publicadas. Corre sobre cualquier implementación del contrato del motor (`contratos/motor.ts`): las pruebas usan
`crearMotorReferencia`; la integración pasa el núcleo de producción. No importa ningún otro paquete.

Lo que este documento fija **entra en la huella**: el orden de registro de los bloques, la numeración de los eventos, el orden de los
eventos iniciales y las direcciones del azar. Cambiar cualquiera de esas cosas es una versión nueva del motor (y otras doradas).

## 1. Entrega (`hub/indice.ts`)

| Export | Qué es |
|---|---|
| `crearSimularNoche(crearMotor): SimularNoche` | Una noche en F3: `(mv, semilla, réplica, { traza }) → { resultado, traza? }` (la traza solo con nivel `'completa'`) |
| `crearSimularNocheF2(crearMotor): SimularNoche` | Lo mismo en F2 (`f2.ts`; dominio de validez en `DOMINIO_F2`: ρ de inducción ≤ 0,5 y sin rampas llenas) |
| `geometria: GeometriaDe` | Geometría del hub en metros para las vistas (`geometria.ts`) |
| `planBalanceado: PlanBalanceado` | El parche `replace /personas/rampa/asignacion → 'por-volumen'` |
| `PLANTILLAS: RegistroPlantillas` | `hub-chico@1.0.0` y `hub-lazo-noche@1.0.0`, congeladas en profundidad; `plantilla(id, versión)` las resuelve |
| `PROPUESTAS: RegistroPlantillas` | Versiones nuevas listas para publicar, **no publicadas**: `hub-chico@1.1.0` (NOTAS-CONTRATO §13). `plantilla()` no las resuelve; publicarlas lo decide la integración |
| `crearAnillo`, `crearRueda` | `AnilloI32` y `RuedaTiempos` de `contratos/motor.ts` (`estructuras/`) |
| `armarNoche(motor, mv, fidelidad?)`, `opcionesNoche(mv, semilla, réplica, traza)` | Para R06 de la integración (§7) y para instrumentar pruebas |
| `ORDEN_BLOQUES`, `EV`, `compilarConfig`, `horizonteMs`, `asignarRampas`, `sorteaAusencia` | Piezas públicas para pruebas y documentación |

## 2. Orden de registro de los bloques

`armarNoche` registra los bloques en este orden (es el `bloque` que mezcla la huella) y después agenda los eventos iniciales.

| Índice | Ruta | Archivo | Qué hace |
|---|---|---|---|
| 0 | `demanda` | `bloques/demanda.ts` | Camiones (turno, desvío, factor del día, atraso común). Su estado incluye el almacén de paquetes (`p.*`) |
| 1 | `personas` | `bloques/personas.ts` | Ausencias, retén, quién trabaja en cada puesto, contabilidad de cada persona |
| 2 | `hub.andenes` | `bloques/andenes.ts` | Playa, andenes, descarga, cintas, contrapresión |
| 3 | `hub.acumulacion` | `bloques/acumulacion.ts` | Fila FIFO antes de la inducción; desvío de no transportables |
| 4 | `hub.induccion` | `bloques/induccion.ts` | Puestos de inducción, temporarios, fatiga, pausas |
| 5 | `hub.sorter` | `bloques/sorter.ts` (F3) · `bloques/lazo-f2.ts` (F2) | Lazo de bandejas, rueda, lectura, vueltas, micro-paradas |
| 6 | `hub.rampas` | `bloques/rampas.ts` | Rampas, jaulas, personas de rampa con su regla, plan, pausas |
| 7 | `hub.excepcion` | `bloques/excepcion.ts` | Rampa de excepción y puestos manuales |
| 8 | `hub.medicion` | `bloques/medicion.ts` | Medición cada cuarto de hora y momento del corte |

**Eventos iniciales, en este orden** (decide los `seq`): `INICIO_TURNO` (personas) → `ABRIR_ANDENES` → `LLEGADA_CAMION` de cada camión en
el orden del modelo → pausas de inducción (por puesto activo y por instante) → pausas de rampa (por persona y por instante) → la primera
micro-parada (si están activas, solo F3) → la primera `MEDICION` → `CORTE`. Además, al armar se abre el tramo `LAZO_MARCHA` desde el
inicio (paso 0) y, si la noche tiene atraso común, el momento `ATRASO_COMUN` en el inicio.

## 3. Eventos (tipo, fase y prioridad)

Fases y prioridades de `corte-1.md` §6.8. `arg` es el número que viaja con el evento (entra en la huella).

| Tipo | Nombre | Bloque | Fase · prioridad | `arg` | Qué pasa |
|---|---|---|---|---|---|
| 1 | `LLEGADA_CAMION` | demanda | NORMAL · 0 | camión | Momento `CAMION_LLEGA` (y `CAMION_ATRASADO` si > 15 min); toma andén o espera en la playa |
| 10 | `ABRIR_ANDENES` | hub.andenes | NORMAL · 0 (en el inicio) | 0 | Los camiones que llegaron antes del inicio toman andén |
| 11 | `FIN_DESCARGA` | hub.andenes | NORMAL · 0 | andén | Nace el paquete; entra a su cinta en max(t, última entrada + paso ÷ velocidad) |
| 12 | `ANDEN_LIBRE` | hub.andenes | NORMAL · 0 | andén | Fin del papeleo: el andén toma el primer camión de la playa |
| 13 | `ANDEN_SIGUE` | hub.andenes | NORMAL · 0 | andén | El paquete que esperaba hueco entró a la cinta: el andén empieza el que sigue |
| 20 | `LLEGA_ACUMULACION` | hub.acumulacion | NORMAL · 0 | paquete | Fin de la cinta: entra a la fila |
| 30 | `FIN_INDUCCION` | hub.induccion | NORMAL · 0 | puesto | El paquete espera bandeja (F3) o sale (F2) |
| 31 | `PAUSA_INICIO_INDUCCION` | hub.induccion | URGENTE · 0 | puesto | Empieza la pausa (o queda pendiente hasta que termine la tarea) |
| 32 | `PAUSA_FIN_INDUCCION` | hub.induccion | NORMAL · 0 | puesto | Fin de la pausa |
| 40 | `PASO` | hub.sorter | NORMAL · **9** | paso k | Un paso del lazo (se descarta si una parada lo invalidó: `m.seq` distinto del guardado) |
| 41 | `PARADA_INICIO` | hub.sorter | URGENTE · 0 | n | Micro-parada n (no se para si ya no queda trabajo) |
| 42 | `PARADA_FIN` | hub.sorter | URGENTE · 0 | n | Arranca el lazo; agenda la parada n + 1 |
| 43 | `LLEGA_RAMPA_F2` | hub.sorter (F2) | NORMAL · 0 | paquete | En F2, el paquete llega a su rampa o a la excepción |
| 50 | `FIN_CAMINATA` | hub.rampas | NORMAL · 0 | persona de rampa | Llegó a la rampa: toma un paquete o cierra la jaula |
| 51 | `FIN_MANEJO` | hub.rampas | NORMAL · 0 | persona de rampa | El paquete entra a la jaula (listo) |
| 52 | `FIN_CIERRE` | hub.rampas | NORMAL · 0 | persona de rampa | Jaula cerrada (momento `JAULA_CERRADA`) |
| 53 | `PAUSA_INICIO_RAMPA` | hub.rampas | URGENTE · 0 | persona de rampa | Como en inducción |
| 54 | `PAUSA_FIN_RAMPA` | hub.rampas | NORMAL · 0 | persona de rampa | Como en inducción |
| 60 | `FIN_MANUAL` | hub.excepcion | NORMAL · 0 | puesto manual | Vuelve a la acumulación (intento + 1) o, si no es transportable, a la jaula de su ruta |
| 70 | `INICIO_TURNO` | personas | URGENTE · 0 (en el inicio) | 0 | Ausencias de todos los roles, retén, plan de rampas, puestos listos |
| 80 | `MEDICION` | hub.medicion | TARDIA · 0 | 0 | Cierra el cuarto de hora (máximo de la fila y clasificados) |
| 81 | `CORTE` | hub.medicion | TARDIA · 0 | 0 | Momento `CORTE` |

**Dentro de un paso del lazo** (fijado por este paquete; NOTAS-CONTRATO §6): primero la rueda (lo que llega a su rampa en ese paso cae,
da otra vuelta o va a excepción, en orden de llegada a la rueda) y después las estaciones en el orden del modelo. Después de colocar,
los puestos libres toman de la fila (de menor a mayor índice). El paso k + 1 se agenda si queda algo en bandejas o esperando bandeja.

## 4. Direcciones del azar (§6.3)

`clave = claveDe(ruta, propósito)` (FNV-1a de 32 bits de `ruta/propósito`), contador `(réplica, a, b, (c << 8) | sub)`. Ninguna depende
del orden de los eventos: agregar un puesto, cambiar la capacidad de una rampa o la asignación de personas no cambia ningún atributo de
ningún paquete ni ninguna falta (pruebas R05a y R05b).

| Qué se sortea | `claveDe(ruta, propósito)` | a | b | c | Distribución | Dónde |
|---|---|---|---|---|---|---|
| Factor de volumen del día | `('demanda', 'errorPronostico')` | 0 | 0 | 0 | lognormal(media 1, cv); no se sortea si cv = 0 | `demanda.ts` |
| ¿Hay atraso común? | `('demanda', 'atrasoComun')` | 0 | 0 | 0 | bernoulli(probabilidad); no se sortea si p = 0 | `demanda.ts` |
| Demora común | `('demanda', 'demoraComun')` | 0 | 0 | 0 | `demanda.atrasoComun.demora` (solo si hay atraso) | `demanda.ts` |
| Desvío del camión | `('demanda', 'desvio')` | camión | 0 | 0 | `demanda.desvio` | `demanda.ts` |
| Ritmo de descarga | `('personas.descarga', 'ritmo')` | camión | índice | 0 | `personas.descarga.ritmo` | `andenes.ts` |
| Ruta del paquete | `('hub.planClasificacion', 'ruta')` | camión | índice | 0 | discreta(pesos de las rutas) | `paquetes.ts` |
| Clase de tamaño | `('hub.perfilPaquete', 'clase')` | camión | índice | 0 | discreta(fracciones) | `paquetes.ts` |
| Tiempo base de inducción | `('hub.induccion', 'tiempo')` | camión | índice | intento | `hub.induccion.tiempo` | `induccion.ts` |
| Lectura (NO-READ) | `('hub.sorter', 'lectura')` | camión | índice | 0 | bernoulli(noLeido); desde el intento 1 no falla y no se sortea | `sorter.ts` |
| Manejo en la rampa | `('personas.rampa', 'manejo')` | camión | índice | 0 | `personas.rampa.manejo` (se sortea al nacer) | `paquetes.ts` |
| Tiempo en el puesto manual | `('personas.excepcion', 'tiempo')` | camión | índice | intento | `personas.excepcion.tiempo` | `excepcion.ts` |
| Ausencia de una persona | `('personas.<rol>', 'ausencia')` | ordinal en su rol | 0 | 0 | bernoulli(ausentismo) | `personas.ts` |
| Tiempo hasta la parada n | `('hub.sorter', 'paradaEntre')` | n | 0 | 0 | `sorter.paradas.entre` | `sorter.ts` |
| Duración de la parada n | `('hub.sorter', 'paradaDuracion')` | n | 0 | 0 | `sorter.paradas.duracion` | `sorter.ts` |

Roles de ausencia: `induccion` y `reten` con `personas.induccion.ausentismo`; `rampa` con `personas.rampa.ausentismo`; `descarga` y
`excepcion` no tienen ausentismo en el esquema y no se sortean (NOTAS-CONTRATO §1).

## 5. Lo que el hub escribe en la traza

Numeración global de personas (`catalogo.personas`): inducción (`P-I1`…, una por puesto activo), retén (`P-T1`…), rampa (`P-R1`…),
descarga (`P-D1`…, por andén en orden) y excepción (`P-X1`…). Camiones de una serie: `T01`, `T02`…

| Tramo | e · r · a · c · q |
|---|---|
| `CAMION_PLAYA` | camión · −1 · 0 · `ANDEN_OCUPADO` si esperó con el turno abierto · −1 (solo si esperó) |
| `CAMION_ANDEN` | camión · andén · paquetes del camión |
| `DESCARGA` | paquete · andén · camión · `BLOQUEO` si el andén estuvo parado por contrapresión. Va desde que el andén lo empezó hasta que entra a la cinta |
| `CINTA` | paquete · cinta · 0 (tránsito largo ÷ velocidad) |
| `ACUMULACION` | paquete · 0 · secuencia de entrada · `FILA` |
| `INDUCCION` | paquete · puesto · persona |
| `ESPERA_BANDEJA` | paquete · puesto · bandejas que necesita · `FALTA_BANDEJA` (solo F3) |
| `BANDEJA` | paquete · bandeja delantera (−1 en F2) · vuelta · `RAMPA_LLENA` y q = ref(RAMPA, r) en las vueltas extra. Un paquete de dos bandejas ocupa también la de atrás (j − 1) |
| `RAMPA` | paquete · rampa · secuencia en la rampa · q = ref(PERSONA, quien la atiende) |
| `MANO` | paquete · persona · rampa |
| `JAULA` | paquete · rampa · jaula·1000 + posición (queda abierto hasta el fin de la traza) |
| `COLA_MANUAL` | paquete · 0 · secuencia · `NO_LEIDO`, `RAMPA_LLENA` (vueltas máximas) o `NO_TRANSPORTABLE` |
| `MANUAL` | paquete · persona · 0 |
| `PERSONA_TRABAJA` | persona · puesto, rampa, andén o puesto manual · paquete (0 en la descarga: un tramo por camión) |
| `PERSONA_CAMINA` · `PERSONA_CIERRA_JAULA` | persona de rampa · rampa · 0 |
| `PERSONA_PAUSA` | persona · puesto (inducción) o última rampa · 0 |
| `PERSONA_AUSENTE` | persona · puesto (inducción) o −1 · 0, de inicio a fin del turno |
| `LAZO_MARCHA` · `LAZO_DETENIDO` | −1 · 0 · paso al inicio del tramo (`FALLA` en el detenido) |

No se escriben tramos `PERSONA_LIBRE`: libre es «sin tramo». Los tramos de cada paquete están encadenados sin huecos desde el inicio de
su descarga (`creado`) hasta su jaula (`listo`); lo controla el almacén al escribirlos y, otra vez, `kpi.ts` sobre la traza terminada.

Momentos: `CAMION_LLEGA` (r = camión, v = minutos de atraso), `CAMION_ATRASADO`, `ATRASO_COMUN` (v = minutos), `RAMPA_LLENA` y
`RAMPA_LIBERA` (r = rampa, v = ocupación), `LAZO_PARA` y `LAZO_ARRANCA` (v = n), `PAUSA_INICIO` y `PAUSA_FIN` (r = persona), `AUSENCIA`
(r = persona), `REEMPLAZO` (r = retén, v = persona cubierta), `JAULA_CERRADA` (r = rampa, v = jaula), `CORTE`, `PRIMER_PAQUETE`,
`ULTIMO_CLASIFICADO` (r = paquete), `ACUMULACION_LLENA` (cuando un andén para) y `ACUMULACION_LIBERA` (ningún andén parado y lo ocupado
baja al 80% de los lugares). La traza empieza en min(inicio, primera llegada) y termina en max(fin del turno, último evento, último listo).

## 6. KPI, costos y alertas

`kpi.ts` calcula los 24 KPI con las definiciones exactas de §6.9, `porRecurso` (por rampa, persona y puesto, en el orden del modelo) y
`series` por cuarto de hora. `costos.ts`: horas pagadas = presentes (con el retén presente) × max(fin − inicio, último listo − inicio);
costo = horas × hora pagada + fijo de la noche. Alertas, en este orden: `conservacion` (cada lugar cuenta lo mismo que su bloque y todo
nacido está en algún lugar), `invariante:rampa-capacidad`, `invariante:bandeja-unica`, `invariante:tiempo`, `invariante:pausa`,
`no-termina`, `tope-eventos`, `lazo-tiempo-cero`.

## 7. Estado, foto y R06

Todo el estado de cada bloque vive en un objeto plano de arreglos tipados y números (`S`) más sus anillos y su rueda; `estado()` lo vuelca
con prefijos (`playa.`, `fila.`, `fila<r>.`, `cola.`, `rueda.`, `p.`) y `restaurar()` lo reemplaza por copias, validando tipo y largo (una
foto de otro modelo se rechaza diciendo qué se esperaba). La traza no viaja en la foto: después de restaurar, el escritor nuevo solo
tiene lo que pasó desde la foto. R06 con el núcleo de producción:

```ts
const o = opcionesNoche(mv, semilla, replica, 'no');
const m1 = crearMotor(o); armarNoche(m1, mv); m1.correrHasta(T); const foto = m1.foto();
const m2 = crearMotor(o); const noche = armarNoche(m2, mv); m2.restaurar(foto);
const { resultado } = noche.cerrar(m2.correr());   // misma huella y mismos KPI que la corrida continua
```

`hub/pruebas/foto.test.ts` ya lo verifica con un motor de prueba con foto (`pruebas/motor-con-foto.ts`, la semántica de la referencia más
foto y restauración): misma huella y mismos KPI con fotos a las 22:20, 23:30, 00:45 y 02:10 del hub chico y a las 01:00 del grande.

## 8. Plantillas

- `plantillas/hub-chico.json` = `contratos/ejemplos/hub-chico.json` (copia exacta, lo prueba `plantillas.test.ts`).
- `plantillas/hub-lazo-noche.json` la genera `plantillas/generar.ts` con las reglas de §5: rampas a 18 + 2·i m (25 abajo) y a 91 + 1,95·i m
  (35 arriba), como la maqueta; rampa i → lugar (i·37) mod 60 (lugar p < 50 → ruta p; p ≥ 50 → segunda rampa de la ruta p − 50), para
  repartir las rutas grandes por el lazo; andenes en x = −20, −14, −8, −2; decisión hasta 6 puestos; escenario «pico» con 1.385 paquetes.
  Para regenerarla (solo para una versión nueva): `ANDEN_GENERAR=1 node --test hub/pruebas/plantillas.test.ts`.
- `plantillas/hub-chico-1.1.0.json` (**propuesta, no publicada**; `PROPUESTAS` en `registro.ts`) la genera `generarHubChico110` de
  `generar.ts`: hub-chico@1.0.0 + `PARCHE_HUB_CHICO_1_1_0` (retén 1, 7 personas de rampa, 2 puestos manuales), con la procedencia de los
  tres valores como SUPUESTO y el escenario «reten» cambiado por «sin-reten». Es la que cumple al pie de la letra «KPI sanos» de §9; con
  1.0.0 no se puede (NOTAS-CONTRATO §13). Publicarla es mover su entrada de `PROPUESTAS` a `PLANTILLAS` en `registro.ts` y actualizar la
  lista que controla `plantillas.test.ts`.

## 9. Pruebas (`node --test "hub/**/*.test.ts"`, con `crearMotorReferencia`)

| Archivo | Qué prueba |
|---|---|
| `estructuras.test.ts` | Anillo y rueda: FIFO, crecimiento, rangos, estado y restaurar |
| `cintas.test.ts` | **K02a**, **K02b**, **K03** |
| `lazo.test.ts` | **L01–L06** (y L08 informativa) |
| `consistencia-f2.test.ts` | **L07** |
| `azar.test.ts` | **P02**, **R05a**, **R05b**, **R01** (5 semillas); la traza no cambia la corrida |
| `invariantes.test.ts` | **I01–I06** en 20 noches por plantilla, con las alertas y leyendo la traza |
| `doradas.test.ts` | Huella, eventos y 24 KPI de 5 semillas del hub chico (`doradas.json`) |
| `kpi.test.ts` | KPI sanos en 50 noches del hub chico: 0 alertas, todo clasificado, definiciones de §6.9 y costos; el fin entre 120 y 300 min o, si no, un golpe discreto confirmado por contrafactual (NOTAS-CONTRATO §13: el criterio literal es imposible con 1.0.0); el criterio literal de §9 sobre 1.0.0 como prueba **pendiente** (`todo`: falla, lo muestra y no rompe la suite hasta que decida la integración); el criterio literal sobre la propuesta `hub-chico@1.1.0` (pasa); percentiles |
| `plan.test.ts` | Asignación por volumen, contiguas y lista; 30 noches de la grande: P90 de recirculación por volumen ≤ contiguas |
| `foto.test.ts` | R06 del hub (adelantado) y rechazo de fotos de otro modelo |
| `traza.test.ts` | Columnas por tipo de tramo, causas y causantes, momentos, resumen por paquete, catálogo |
| `personas.test.ts` | Retén, temporarios, fatiga y pausas contra el sorteo de cada paquete |
| `variantes.test.ts` | Camiones en lista, `alternar`, reglas `la-que-se-llena-antes` y `en-orden`, retén y F2 |
| `plantillas.test.ts` | Las dos plantillas y la propuesta 1.1.0: generadores, reglas de §5, 1.1.0 = 1.0.0 + parche, geometría dentro de los límites, textos ≤ 1.000 caracteres y lista negra de marcas |
| `tokens.test.ts` | Ningún token prohibido de §1.4 en `hub/` |

MEDIDO el 18-10-2026 (Node 22.22.0, contenedor de 4 núcleos, carga ≈ 1, motor de **referencia**, mediana de 5 noches; informativo):
hub chico (≈ 7.900 paquetes) 94 ms sin traza y 101 ms con traza completa (93.000 tramos, 11,8 por paquete; 10,0 eventos por paquete);
hub grande (≈ 23.700 paquetes) 187 ms sin traza y 297 ms con traza (277.000 tramos; 8,1 eventos por paquete). Los 16 archivos (67
pruebas: 66 pasan y 1 pendiente, el criterio literal de §9 sobre 1.0.0) tardan 19–21 s de reloj (dos corridas, el 18-10-2026; el límite
de §9 es 90 s). Los presupuestos de §11 los mide el banco de la integración con el núcleo de producción.
