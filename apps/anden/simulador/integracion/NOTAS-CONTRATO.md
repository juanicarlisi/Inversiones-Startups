# Notas de la integración · corte 1, pasos I-1 (§10.1 a §10.5), I-2 (§10.6, §10.7 y §10.9) e I-3 (§10.8, §10.10 y §10.11) · 19-10-2026; I-1 otra vez el 23-10-2026 (§13)

Qué decidió la integración sobre lo que anotaron los ocho paquetes en sus `NOTAS-CONTRATO.md`, qué quedó cableado, qué cambió en otros
paquetes (cambio mínimo, con sus pruebas en verde) y qué queda para decidir. **`contratos/` no cambió**; lo que los arreglos de la revisión (20-10-2026) cambian de la especificación o extienden por fuera de un
contrato está en `CAMBIOS-CONTRATO.md` (ver §13), y
`pruebas/arquitectura.test.ts` exige que siga idéntico byte a byte al anexo del paso 0 y al código de los Anexos A y B de `corte-1.md`.
Números MEDIDOS en el contenedor del entorno (4 núcleos, Node 22.22.0, Chromium 141) el 19-10-2026.

## 0. Qué hay en `integracion/`

| Archivo | Qué hace |
|---|---|
| `ensamblar.ts` | El único lugar donde se juntan los paquetes: `crearSimularNoche(crearMotor)`, `crearVariante(compilar)`, `crearCodec(resolver, { versionMotor })` con `PLANTILLAS`, `crearContrafactual(simularNoche)`. Recibe el `CrearMotor` (producción por defecto; la referencia en R08b). No importa nada de Node. |
| `ensamblar-bateria.ts` | La batería con el motor de producción (Node). Exporta `crearMotor` para `node verificacion/bateria.ts --motor=integracion/ensamblar-bateria.ts`. |
| `trabajador.ts` | El corazón del Worker: `congelarMatematica`, `motorVigilado`, `crearTrabajador` (protocolo de `mensajes-worker.ts`, cede el hilo entre réplicas, traza transferida sin buffers repetidos). |
| `worker.ts` | Entrada del Web Worker (`dist/worker.js`): congela, arma el hub con el núcleo y atiende `self.onmessage`. |
| `puente.ts` | `crearServicios({ fabrica, trabajadores })`: los `Servicios` reales sobre el planificador de P5; `puertoDeWorker` (Web Worker como `PuertoTrabajador`, con caídas); `trabajadoresPara` (núcleos − 1, de 1 a 7); `crearServiciosNavegador(url)`. |
| `entrada.ts` | Entrada de la página (`dist/entrada.js`): servicios reales + `arrancar(servicios, #app)`. `?depuracion=1` expone `window.__anden` (solo para e2e). |
| `construir.mjs` (+ `.d.mts`) | esbuild 0.28.2 → `dist/` (ESM, minificado, mapas; la entrada con `splitting`: el QR va en un trozo a demanda); copia la cáscara, la PWA y la licencia; escribe `sw.js` con la versión y la lista de archivos. Plan B sin esbuild con `module.stripTypeScriptTypes` (probado en Chromium: misma huella agregada). |
| `servir.mjs` | `dist/` por HTTP en 127.0.0.1 (solo esta máquina), con la CSP también como cabecera. Para el banco: `brotli` (textos precomprimidos, brotli o gzip según acepte el navegador) y `aislado` (COOP y COEP, para medir la memoria). |
| `verificar.ts` | **`npm run verificar`** (I-2, §10.6): R04 en Chromium y R07 con hilos de verdad, después la batería completa con el núcleo y las 85 exigibles en un solo informe (`verificacion/informe/`) y `salida/bateria-nucleo.json` (lo lee el comprobante). |
| `bateria/` | Las 26 exigibles que no son de P2, como `casosExtra`: `casos-nucleo.ts` (K01), `casos-hub.ts` (K02, K03, L01–L07, P02, R05, R06; y el hub chico en R01 y R03), `casos-experimentos.ts` (R07, S12, S13), `casos-estadistica.ts` (S03, S08, S09, S11), `casos-r04.ts`; `modelos-hub.ts` (los modelos de prueba de P4 sin la referencia), `mm1.ts` (la M/M/1 mínima, antes en `pruebas/`), `comun.ts`, `indice.ts`. |
| `r04.mjs` (+ `.d.mts`), `r04/` | **`npm run r04`** (§10.7): empaqueta `r04/pagina.ts` (que corre `r04/huellas.ts`: suite rápida, 66 doradas, hub chico 5 semillas y grande 1 con traza completa, doradas de matemática), la abre en Chromium y compara clave por clave con Node; escribe `salida/r04.json`. |
| `banco.mjs`, `banco/pagina.ts` | **`npm run banco`** (§10.9 y §11): mediana de 5 corridas de cada presupuesto, sin frenar y con CPU 4× para los cuadros; referencia M/M/1 en Node y en Chromium; escribe `salida/banco.json`. |
| `navegador.mjs` | Lo común a R04 y al banco: Playwright y Chromium del entorno (nunca se instalan), qué navegadores hay (Firefox y WebKit, pendientes con su motivo), empaquetar una página de pruebas (con `node:*` vacíos para `verificacion/bateria.ts`). |
| `e2e/humo.mjs` | Abre `dist/` en Chromium con los servicios reales, en 1280 × 800 y 360 × 740, claro y oscuro; enlace de la plantilla grande y de la chica, película y cien noches; 0 errores de consola; enlace de ida y vuelta en el navegador; huella agregada Chromium = Node. |
| `pruebas/` | `arquitectura`, `diferencial` (R08b), `r06-hub`, `e-explicador` (E01, E02), `s-estadistica` (S01–S03), `s-estadistica-whitt` (S08, S09, S11), `textos`, `marcas`, `trabajador`, `puente`, `huella-fuentes` (sello del motor), `bateria-extra` (las 85), `plano` (la escena acepta la traza vacía del plano de P8; §13); ayudas `hilos.ts`, `hilo-trabajador.ts` (la M/M/1 pasó a `bateria/mm1.ts` en I-2). |

## 1. Decisiones sobre las notas de los paquetes

**P1 · núcleo.** (1) `uniforme` puede dar 1 con probabilidad 2⁻⁵³: se acepta la fórmula tal cual (cambiarla movería todas las huellas);
la corrección es de texto (§6.6 y `contratos/azar.ts` dirían «(0, 1]») y queda para cuando se toque el contrato. (2) `correrHasta` más allá
del horizonte: nadie lo llama; sin cambio. (3)(4)(9) validaciones más estrictas del núcleo: se aceptan; el compilador ya rechaza Erlang con
k > 512 (`modelo/esquema.ts`, `MAX_K_ERLANG`). (8) La foto no guarda la traza: R06 del hub pasa (huella y KPI) y, **si se restaura con traza
completa**, la traza sale parcial y el hub la marca con `invariante:tiempo` (MEDIDO). En el corte 1 nadie restaura con traza; queda para
el corte 2 (foto de la traza). (11) La prueba de arquitectura usa la lista ampliada de P1 **más el operador `**`** (es `Math.pow`), con
el árbol sintáctico de TypeScript (no ve comentarios ni textos); no aplica a las pruebas ni a `escena/` (que dibuja con `Math.cos`).

**P2 · verificación.** (1) `npm run verificar` con el núcleo y las 85 exigibles en un solo informe es el paso §10.6 (siguiente): el motor
ya está listo en `ensamblar-bateria.ts`; faltan los 26 `casosExtra` de otros paquetes. **No se cambió `package.json`** en este paso. (4) La
tolerancia de `formulas/` (máx(1e-5 relativo; media unidad de la última cifra impresa)) se acepta: los valores de la tabla de §8 están
redondeados (8,770 por 8,769712; 0,36386 por 0,363864). Propuesta para `corte-1.md`: escribir 8,7697 y 0,363864. (8) `process.hrtime` en
la CLI de la batería: permitido (no es un token de §1.4 y no entra en ningún resultado). (14) `verificacion/informe/` queda versionado como
evidencia; se regenera con el núcleo en §10.6.

**P3 · modelo.** (1) `numero()` y las probabilidades `bernoulli`: **sin cambio de contrato**. P3 y P4 ya toman `p` de un parámetro
`bernoulli` en los campos de probabilidad, y las dos plantillas compilan y corren. (2) Bomba de deflate: se acepta la versión de P3 (no
existe 1 KB → 100 MB). (4) `crearCodec(resolver, { versionMotor: VERSION_MOTOR })`: cableado en `ensamblar.ts`; regla «misma versión mayor»
aceptada para el corte 1 (probado en `puente.test.ts`). (5) La huella dorada `0491977a06fedf2a` de `hub-chico@1.0.0` y que las dos plantillas
compilen sin errores: probado en `puente.test.ts`. (11) `CompressionStream('deflate-raw')` en Chromium 141: ida y vuelta exacta del modelo
completo (6.024 caracteres) y de plantilla + 5 cambios (206), en `e2e/humo.mjs`. Firefox y WebKit, en R04 (§10.7).

**P4 · hub.** (2) igual que P3 (1). (14) R06 con el núcleo de producción: en verde (`r06-hub.test.ts`: fotos a las 22:20, 23:30, 00:45 y
02:10 del chico, 00:00 y 01:30 del grande, la foto clonada con `structuredClone` y restaurada dos veces). (13) **«KPI sanos» de §9 con
`hub-chico@1.0.0`**: ver §3.1 (no se decidió acá).

**P5 · experimentos.** (1) `semaforoDe` va en los servicios (extra que la interfaz ya sabía usar). (2) `evaluarDecisionCon` con
`prioridad` (DECISION para decidir, TAMIZADO para el tamizado). (5) **Workers que se caen, sin tocar el contrato:** `puertoDeWorker` traduce
`error` y `messageerror` del Worker en un mensaje `error` del protocolo por cada trabajo en curso, reemplaza el Worker y, tras 3 caídas
seguidas sin contestar nada, queda «roto» y contesta `error` a todo (nunca deja un trabajo colgado). (8) **Cambio en `experimentos/`**:
`contarControles` usa el catálogo del compilador cuando viene `I-CONTROLES` (P3 cuenta 24 controles y P5 contaba 18 + los informativos: el
comprobante y el compilador decían números distintos). Las 18 de P5 quedan como respaldo; sus pruebas siguen en verde.

**P6 · escena.** Lo que pide cambio de contrato (altura z, jaulas, `nocheMejor`, clases en el catálogo, fixture con parámetros) queda para
el corte 2; la interfaz ya se arregla sin eso. Los estilos de la escena van en los servicios.

**P7 · explicación.** (1) Cableado con la receta propuesta, con un `Simulador` **asíncrono** que pide la noche al planificador (prioridad
CONFIRMACION): ningún contrafactual simula en el hilo de la interfaz. (6) **E01**: ver §2. (11) Tamizado con `replicasMax` 100 por valor
(`REPLICAS_MAX_TAMIZADO`, ESTIMACIÓN; lo mide el banco). **Cambio en `explicacion/`** (lo encontró P8): «la respuesta cambia en hasta 1
puestos» → con n = 1 se usan cuatro claves nuevas `explicacion.pregunta.porque.<variable>.uno` («cambia en 1 puesto»), en es y en, con su
registro en `frases.ts`; las 131 pruebas de P7 siguen en verde.

**P8 · interfaz.** (1) La construcción hace exactamente lo pedido (entrada y PWA en la raíz de `dist/`, QR en un trozo aparte, marcas del
service worker reemplazadas) y los servicios falsos no entran (lo controla `arquitectura.test.ts` sobre el metafile de esbuild). (2) La
prueba de arquitectura permite `app/i18n/diccionarios.ts → <paquete>/textos.<idioma>.json`. (3)(4) estilos y semáforo: en los servicios.
(6) La cancelación por prioridad se mantiene (sin cambio de contrato); `noche` y `noches` se rechazan con `ErrorCancelado`, como espera
`app/sesion.ts`.

## 2. E01: lo que se exige (decisión de la integración)

La letra de §8 pide que todo paquete que pierde el corte esperando ≥ 5 min sobre una pausa tenga la causa PAUSA **confirmada**. Con el corte
a las 00:30 el hub chico pierde el corte por capacidad aunque no haya pausas: solo 17,1% de esos paquetes llega sin pausas (MEDIDO, 50 réplicas). Exigir
la letra sería exigir que el explicador confirme lo que el contrafactual desmiente, que es justo lo que el corte prohíbe. `e-explicador.test.ts`
exige, con el corte de la letra (00:30) **y** con el de la plantilla (01:30), pausas de rampa de 45 min:

- (a) **solidez**: 0 frases de PAUSA sin que el mismo paquete llegue al corte en la misma noche sin pausas, comprobado con una corrida
  aparte de la prueba (no con el contrafactual de P7);
- (b) **completitud**: la frase de PAUSA en ≥ 95% de los paquetes que sí llegan sin pausas.

E02 se exige al pie de la letra (0 frases causales sin confirmar en 50 paquetes × 10 réplicas, cada frase recomprobada con una corrida aparte
y con el cambio fijo de su causa). En `npm test` E01 corre 4 réplicas por escenario; las 50 de la letra corren con `ANDEN_COMPLETA=1` (las dos
tandas pasan los 3 minutos de §12.1) y van al informe de salida. Propuesta para `corte-1.md` §8: reescribir E01 con (a) y (b).

## 3. Lo que queda para decidir (no lo decide este paso)

1. **«KPI sanos» de §9 sobre `hub-chico@1.0.0` (P4, NOTAS §13).** Está certificado que es imposible al pie de la letra (r44 necesita 333,5 min
   de inducción). La prueba literal sigue como `todo` (no rompe `npm test`). **Recomendación de la integración: camino 2** (reescribir §9:
   «fin entre 120 y 300 en toda noche sin golpes discretos; las que los tienen pueden pasarse si el contrafactual sin el golpe cae en el
   rango», que es lo que ya exige y cumple la prueba nº 25) y **no publicar 1.1.0 en este corte**: `hub-chico@1.0.0` es el ejemplo de §5 (F0,
   huella dorada, tamaños de enlace) y cambiar la dotación para pasar una prueba cambia la historia de la decisión. 1.1.0 queda como
   propuesta. Decide el orquestador. **Decidido el 23-10-2026 (§13): camino 2.** La prueba `todo` de P4 se borró; el texto para
   `corte-1.md` §9 está en `CAMBIOS-CONTRATO.md` §10 y lo pasa el orquestador.
2. ~~**El recorrido «decidir» hasta «Ya está» (§10.8).**~~ **Resuelto en I-3** sin tocar las plantillas publicadas: el recorrido abre
   `hub-chico@1.0.0` con los datos de un hub propio por enlace (plantilla + parche: retén 1, 7 de rampa, 2 manuales, corte 03:00) y llega a
   «Ya está» después de contestar dos preguntas (§10). Con la plantilla tal cual la app sigue diciendo «ninguna cumple», que es lo honesto.
3. **Presentar: 4 pasos o «tres actos»** (P8): los 4 pasos cubren los tres actos de §9; lo confirma el fundador.
4. ~~El comprobante del motor dice «0 de 85 (—)» hasta §10.6.~~ **Resuelto en I-2:** `npm run verificar` escribe
   `integracion/salida/bateria-nucleo.json` y la construcción ya pone «85 de 85» con la fecha de la corrida (ver §6).

## 4. Limitaciones conocidas que quedan para el corte 2

- Restaurar una foto con traza completa da una traza parcial (y `invariante:tiempo`): foto de la traza.
- La causa AUSENCIA no se detecta en rampa con la traza actual del hub (P7 §5): no hay causa falsa, hay una causa que no se dice.
- ~~La receta lleva la huella del modelo y no la de las noches: el sello «reproducida» compara entradas (P8 §5).~~ **Resuelto el
  20-10-2026** (hallazgo H1): la receta lleva `h`, la huella agregada del autor (`CAMBIOS-CONTRATO.md` §1).
- `Math.sin` y `Math.cos` en el Worker lanzan solo mientras corre el motor: la geometría de la traza (`posEnLazo` del contrato) los usa
  para dibujar después de la corrida. El resto de la matemática nativa lanza siempre.

## 5. Medido en este paso (19-10-2026)

- `npm test`: 1.005 pruebas, 1.003 pasan, 0 fallan, 1 omitida (la batería completa, con `VERIFICAR=1`) y 1 `todo` (§3.1); 2 min 07 s.
- `npx tsc -p tsconfig.json`: sin errores.
- `npm run construir`: 243 ms; `entrada.js` 411 KB (103 KB brotli) y `worker.js` 125 KB (31 KB brotli): 134 KB brotli de primera carga,
  dentro de los 150 KB de §11 (lo confirma el banco).
- `e2e/humo.mjs`: 0 errores de consola en las cuatro combinaciones; cien noches del hub de 24.000 en 10,8–12,4 s y del chico en 3,7–4,0 s con
  3 Workers; huella agregada de las cien noches del hub chico igual en Chromium y en Node (`d4f7128687bd85cf`).
- R08b: núcleo = referencia en el hub chico (5 semillas), el grande (2 × 2), F2, sin traza y la batería rápida (informe idéntico y 66 doradas).
- E01 completo (`ANDEN_COMPLETA=1`, 50 réplicas por escenario, 4 min 15 s con E02): corte 00:30, 18.577 paquetes pierden el corte esperando
  sobre una pausa, 3.172 (17,1%) llegan sin pausas y los 3.172 tienen la frase, 0 falsas; corte 01:30, 10.883, 10.417 (95,7%) llegan sin
  pausas, 10.399 con la frase (99,8%), 0 falsas. E02: 500 paquetes, 694 frases de una causa y 1 conjunta, 0 sin confirmar; en las 10 noches
  cada causa sola alcanza para perder el corte.
- S01 8,2% · S02 81,2% · S03 94,8% · S08 2.032 [1.685; 2.499] ∋ 1.800 · S09 L = 4,007 (z = 1,03) · S11 sesgo 0,051 (ee 0,055).

## 6. Paso I-2 · §10.6: batería completa con el núcleo de producción (`npm run verificar`)

**Resultado (MEDIDO, 19-10-2026, semilla 20261017):** **85 de 85 exigibles pasan** con el núcleo de producción; S01 (8,0%) y S02 (83,2%)
**fallan como deben**; 5 informativas (V12a–d, C02); **0 reintentos**; 66 doradas iguales; 8.104 corridas de red sin violaciones de
conservación. 8 min 46 s en total (la batería 506 s, más R04 en Chromium y R07 con hilos antes): dentro de los 10 min de §9 P2. Informe
local en `verificacion/informe/` (no se publica) y `integracion/salida/bateria-nucleo.json`, que la construcción pone en el comprobante
(«85 de 85», 19-10-2026). Por dueño: P1 4, P2 59, P4 13, P5 3, I 6.

**Cómo se armaron las 85.** `package.json` › `verificar` pasó de `node verificacion/bateria.ts --completa` (la referencia y solo las 59
de P2) a `node integracion/verificar.ts`. Las 26 que no son de P2 son `casosExtra` (`integracion/bateria/`), corren con el motor que recibe
la batería y devuelven su resultado con su dueño; R04 y R07 son asíncronas (navegador e hilos) y se miden antes. Cambios mínimos en P2
(sus 70 pruebas siguen en verde): `casos/comun.ts` suma las familias K, L y P, el tipo `Dueno` y un campo opcional `reproducibles` (corridas
que no son redes de colas); `casos/r-reproducibilidad.ts` las corre en R01 y R03, así **el hub chico entra en R01 y R03 con 5 semillas**,
como pide §8; `pagina.ts` nombra las familias nuevas y dice «exigibles del corte» cuando son más que las de P2. `pruebas/mm1.ts` pasó a
`bateria/mm1.ts` (lo usan la batería y el banco). `pruebas/bateria-extra.test.ts` (en `npm test`) controla que sean exactamente las 85.

**S03: la causa real y la banda corregida (no es el motor).** En la primera corrida S03 dio 92,2% y pasó recién en el reintento de §8
(2.000 macro-experimentos: 93,25%, al borde de 93,1%). Lo investigué con 25.000 corridas independientes más (5 semillas):
- el motor no tiene sesgo: la media de las medias de réplica es 8,996 (W = 9; cada tanda de 5.000 dentro de ± 1,5 ee) y L de Little
  coincide;
- la cobertura real del método es **93,7%** (4.683 de 5.000 macro-experimentos); remuestreando las medias de réplica (solo su forma) da
  93,4–93,8%; la maqueta, con otro motor y otro azar, midió 94,4% (dentro del ruido);
- la causa: las medias de réplica son **asimétricas** (asimetría 1,1–1,5: con ρ = 0,9 hay períodos ocupados largos) y el IC de t con
  n = 10 cubre de menos con datos asimétricos. La banda de §8, [93,1%; 96,9%], supone que el método cubre exactamente el 95%: con la
  real en 93,6% la prueba cae por azar cerca de la mitad de las veces con 500 macro-experimentos.
**Corrección (reemplazada el 20-10-2026, hallazgo H3: recentrar la banda en lo que dio el mismo método es circular; ahora S03 exige
independencia y sesgo y la cobertura queda informativa como S03c, `CAMBIOS-CONTRATO.md` §4):** la banda se centra en la cobertura real del método con el mismo ancho: **[91,4%; 95,9%]** (93,6% ± 1,96 ee de 500
macro-experimentos, más la incertidumbre del centro). Además, S03 ahora exige que la media de las 5.000 medias no tenga sesgo (|z| ≤ 3,29)
y reporta la asimetría de la corrida. En la corrida final: 92,2% (461 de 500), asimetría 1,29, media 8,966 (z = −1,46) → pasa sin
reintento. `pruebas/s-estadistica.test.ts` usa la misma banda (con su semilla da 94,8%). **Propuesta para `corte-1.md` §8:** S03 «Entre
91,4% y 95,9% (la cobertura real del IC de t con 10 réplicas en esta cola es ≈ 93,6% por la asimetría de las medias; el 95% es nominal)».

**Otros números de la corrida final:** K01 exactos (6,32456 = 4·√2,5 s; 8; 19; 54) · K02a 21,000 s en los 15.000 tránsitos · K02b
12.000/h · K03 70 · L01 12.000/h · L02 11.769 (z = 0,59) · L03 10.932 (z = 0,80) · L04 1.456 = 4 × 364 · L05 7.305 caídas y 632 vueltas
exactas · L06 10 paquetes atrasados 599.850 ms · L07 F2/F3 −0,04% (paquetes/h) y −0,51% (tiempo en el hub), z = 0,60 · P02 0,0499
(z = −0,05) · R05a 23.631 paquetes y R05b 7.369 lecturas sin una diferencia · R06 10 fotos (chico 2 semillas × 4 horas, grande 2 horas)
· R07 30 noches, 6 KPI idénticos con 1 y 3 hilos (llegada con 3: 5, 10, 0, 6, 7, 11…) · S08 T·Var(L̄) = 1.485 con IC ∋ 1.800 · S09
L = 3,996 (z = −0,72) · S11 sesgo −0,013 (z = −0,20) · S12 94,05% · S13 en-duda · cumple · no-cumple · R01 170 pares y R03 155 (con
el hub chico).

## 7. Paso I-2 · §10.7: R04 (`npm run r04`)

**Node = Chromium 141.0.7390.37 en 95 de 95 claves** (MEDIDO, 19-10-2026): las 9 pruebas de la suite rápida (valores, z, error y
estado), las 66 doradas de la batería, la huella del modelo de las dos plantillas (`hub-chico@1.0.0` = `0491977a06fedf2a`), el hub chico
con 5 semillas (1, 2, 3, 20261017, 2³² − 1) y el grande con 1, con traza completa (huella, resumen de 64 bits de KPI, recursos, series y
alertas, y otro de toda la traza: tramos, momentos, paquetes y catálogo; la geometría aparte), y las 1.000 doradas de matemática de log,
exp, cos, sin, sqrt y pow (6.000 de 6.000 iguales bit a bit en los dos). 0 errores de consola. La página es una construcción aparte de
`r04/pagina.ts` (no la app) en una carpeta temporal; `verificacion/bateria.ts` entra con sus `node:*` vacíos (nunca se llaman).
**Firefox y WebKit: PENDIENTES.** No están en el entorno (Playwright 1.56.1 trae solo Chromium en `/opt/pw-browsers`) y en esta corrida
no se permite instalar navegadores, así que `npx playwright install` no se intentó (difiere de la letra de §10.7, que pide intentarlo).
`r04.mjs` los corre solos si algún día están instalados. §13 ya los pasa al corte 2 con los teléfonos reales.

## 8. Paso I-2 · §10.9: banco (`npm run banco`)

Mediana de 5 corridas en el contenedor (4 núcleos Xeon 2,8 GHz, sin GPU; Node 22.22.0; Chromium 141), MEDIDO el 19-10-2026 (corrida final;
una anterior dio lo mismo dentro de ±10%). Referencia de la misma corrida (M/M/1 ρ = 0,8 con el núcleo): **2,60 M eventos/s en Node y
1,62 M en el hilo principal de Chromium**; cada tiempo va también como «eventos de la referencia» en `salida/banco.json`. Estado: cumple
(≤ meta), con margen (≤ meta + 30%, §11) o no cumple.

| Presupuesto (§11) | Meta | Mediana (mín–máx) | Estado |
|---|---|---|---|
| Noche de 24.000 con traza, Node | ≤ 400 ms | 258 ms (243–314) | cumple |
| Noche del chico con traza, Node | ≤ 150 ms | 78 ms (72–100) | cumple |
| Cien noches de 24.000 sin traza, 3 Workers, con progreso | ≤ 20 s | 13,2 s (12,5–13,4); 101 avances, el primero a los 172 ms | cumple |
| Vista previa del deslizador (noche de 24.000) | ≤ 600 ms | 556 ms (462–607) | cumple |
| **Primer cuadro desde el enlace, sin red** | ≤ 150 ms | **1.386 ms** (1.246–1.535); el chico, 844 ms | **no cumple** |
| Primer cuadro con red 4G emulada (Fast 4G de DevTools) | ≤ 1,5 s | 1.867 ms (1.806–2.102) | con margen |
| Cuadro 2,5D de 24.000 | ≤ 4 · ≤ 16,7 ms con 4× | 1,49 · 8,25 ms | cumple |
| Cuadro 2D de 24.000 | ≤ 3 · ≤ 10 ms con 4× | 0,70 · 3,40 ms | cumple |
| Tamizado del chico, 3 Workers, cancelable | ≤ 60 s | 44,6 s (43,6–46,0); cancelado en 4 ms | cumple |
| Evaluación de la decisión del chico | ≤ 20 s | 4,0 s (3,8–4,1) | cumple |
| Memoria con la noche de 24.000 y su par dividido | ≤ 150 MB | 44,0 MB (43,3–46,0) | cumple |
| JavaScript de la primera carga, brotli | ≤ 150 KB | 134,7 KB (entrada.js 105,9 + worker.js 32,0 + un trozo de 0,1) | cumple |

**Primer cuadro: por qué no cumple (y qué haría falta).** Hitos medianos sin red, hub de 24.000: `entrada.js` bajado a los 56 ms, DOM listo a
los 173 ms, modelo compilado a los 229 ms, primera pintura a los 299 ms y **película a los 1.386 ms**: ~1,16 s es la noche entera
simulada en un Worker **frío** más armar el reproductor. En un Worker ya caliente la misma noche tarda 330–420 ms y el reproductor
60–170 ms en el hilo principal (MEDIDO aparte); en Node, 258 ms. La meta de 150 ms viene de la maqueta, que medía otra cosa: «descomprimir
+ simular 10 min + dibujar» (`visiones/experiencia.md`). Con la noche entera antes del primer cuadro no se llega ni con todo caliente. Lo
que haría falta (no lo hice en este paso, cambia el protocolo del Worker o la interfaz): (1) primer cuadro progresivo: simular los primeros
minutos, mostrarlos y seguir (como la maqueta); (2) precalentar los Workers al arrancar con una noche corta; (3) armar el índice del
reproductor en el Worker. Propuesta: o se hace (1)–(3) en el corte 2, o §11 mide «primer cuadro» como la maqueta y suma un presupuesto
«película completa» ≤ 1,5 s. **Cambio mínimo que sí hice** (`app/arrancar.ts`, P8): con un enlace no se monta antes el inicio, cuyas
miniaturas vivas pedían dos noches con traza (la de 24.000 incluida) que competían por los Workers y, al cancelarse, obligaban a recrear
Workers fríos. A/B con 5 corridas: grande 1.352 → 1.272 ms, chico 860 → 773 ms, DOM listo 222 → 163 ms. Las 77 pruebas de P8 y el
humo de la integración siguen en verde (0 errores, misma huella agregada).

**Notas de medición.** El cuadro mide `dibujar` (lo que frena CDP); con el rasterizado forzado (getImageData de un píxel) da 6,3 ms el
2,5D y 3,9 ms el 2D sin frenar, y 34 y 21 ms con 4× (informativo: no es un teléfono, §11). Fast 4G = 165 ms de latencia y 8,1 Mbit/s;
con Slow 4G (562,5 ms; 1,44 Mbit/s) el primer cuadro da 3,6–3,7 s (informativo). La app se sirvió con los textos comprimidos con brotli
(como lo haría el alojamiento) y aislada con COOP y COEP para poder usar `measureUserAgentSpecificMemory` (incluye los Workers y los
ArrayBuffer de las trazas: la ventana 34 MB, los 3 Workers 1,5–1,7 MB cada uno, los lienzos 4,1 MB; el heap de JavaScript del hilo
principal, 10,3 MB). La decisión del chico recomienda `null` (ninguna opción cumple con `hub-chico@1.0.0`, §3.2).

## 9. Lo que queda abierto después de I-2

1. **Primer cuadro ≤ 150 ms** (§8): no cumple; decidir entre el primer cuadro progresivo (corte 2) o reescribir el presupuesto.
2. **4G ≤ 1,5 s**: cumple solo con el margen de ±30% (1,87 s); mejora con lo mismo que el punto 1.
3. **S03** (§6) y **la tabla de §8** (8,7697 y 0,363864, §1): correcciones de texto propuestas para `corte-1.md`.
4. **R04 en Firefox y WebKit**: pendiente (no instalados; instalar no está permitido acá).

## 10. Paso I-3 · §10.8: recorridos de punta a punta (`npm run e2e`)

`integracion/e2e/correr.mjs` (con `comun.mjs`, `primer-minuto.mjs`, `decidir.mjs` y `compartir.mjs`) corre los cuatro recorridos sobre
`dist/` con los servicios reales (Workers con el núcleo de producción), en Chromium 141 del entorno, en 1280 × 800 y 360 × 740, claro y
oscuro: 16 recorridos. Exige 0 errores y 0 avisos de consola, 0 errores de página, 0 pedidos fallidos, 0 pedidos a otro sitio que no sea
127.0.0.1, 0 claves de texto faltantes y nada que desborde a lo ancho. Escribe `salida/e2e.json` y deja 8 capturas en `e2e/capturas/`
(con `--revision=<carpeta>`, todas). Los enlaces se arman en Node con el mismo ensamblado que los Workers (R04: Node = Chromium).

- **Primer minuto.** El enlace de la plantilla GRANDE con 1 cambio (rampas vecinas: el plan de un hub «como está hoy») y la receta de la
  peor de las cien noches (la 82: un atraso común, 5.675 paquetes pierden el corte), parada a las 05:58. La película corre (reproducir y
  ver avanzar el cabezal), se vuelve al instante tocando la línea de tiempo, se acerca con la rueda sobre un paquete atrasado, se arrastra
  el plano para traerlo al centro y se lo **toca con el puntero sobre el lienzo** (la posición sale de invertir `aMundo` de una vista
  igual); al volver, la cámara sigue acercada y «Ver todo el hub» la devuelve al encuadre completo. Su biografía muestra la causa
  confirmada («esperó 15,5 min en la rampa R43: la persona estaba en pausa»; sin pausas llegaba a las 05:50). Después las cien noches y
  «¿y si…?» con «balancear el plan»: 40 noches pareadas, pantalla dividida, y «B es mejor» en P90 del tiempo en el hub y en vueltas de más.
  **Por qué el cambio de plan:** `hub-lazo-noche@1.0.0` ya reparte por volumen, así que balancearlo no cambia el modelo; la app ahora lo
  dice («El plan ya reparte las rampas por volumen… B sería igual a A») sin simular ni comparar (lo prueba el recorrido en 1280 claro).
- **Decidir.** Con `hub-chico@1.0.0` tal cual ninguna opción cumple (§3.2). El recorrido abre la plantilla chica con los datos de un hub
  propio, sin tocar la plantilla publicada: retén 1, 7 personas de rampa, 2 puestos manuales (los de la propuesta 1.1.0) y corte a las
  03:00. Recomendación 2 puestos en verde; el formulario pregunta el tiempo de inducción y el error del pronóstico; un dato fuera de rango
  se rechaza; con los dos datos contestados (cada respuesta recalcula decisión y tamizado, 65–85 s) termina en «Ya está: lo que falta no
  cambia la respuesta.».
- **Compartir.** La plantilla chica en la noche mediana, parada a las 23:40: enlace de 78 caracteres (plantilla + receta) con su QR;
  «Abrir en otra pestaña» abre el enlace tal cual (sin modo de depuración) y esa pestaña recalcula todo: misma noche, misma hora, misma
  huella agregada (`d4f7128687bd85cf`), misma huella de la noche y del modelo, y el sello «Los números que ves los calculó este
  dispositivo y coinciden con la receta del autor».
- **Enlace hostil.** H01 (bomba de deflate, 12.978 caracteres) por la URL: aviso en 0,3–0,4 s, vuelta al inicio, la página contesta en
  milisegundos y abre una plantilla.

## 11. Paso I-3 · la experiencia, mirada como alguien que viene de FlexSim (y lo que se arregló)

Recorrí las capturas de las 10 pantallas en las cuatro combinaciones con los servicios reales. Lo que estaba roto, pobre o confuso, y
el arreglo (cambio mínimo en el paquete dueño, con sus pruebas en verde y pruebas nuevas donde hacía falta):

| Qué se veía | Arreglo | Dónde |
|---|---|---|
| **Error de página** al alternar A/B en 360 px: la mitad oculta mide 0 y la vista lanzaba «redimensionar espera ancho… > 0» | Una caja de 0 px no se redimensiona ni se dibuja | `app/ui/lienzo.ts` |
| La película no decía qué pasa **en ese instante** (un simulador de escritorio muestra reloj y contadores) | **Tablero en vivo** sobre el lienzo: hora, paquetes en jaula de N, adentro, fila de inducción, rampas llenas, personas en pausa, lazo detenido y, pasado el corte, cuántos no llegaron; todo de la traza (búsqueda binaria, sin memoria por cuadro); en el teléfono solo hora, jaula y alertas | `app/ui/tablero.ts` (nuevo), `lienzo.ts`, `estilos.css` |
| No se podía **acercar** la escena para ver una rampa | Rueda (anclada al cursor), arrastrar, pellizcar (en pasos de 25%, para reusar los sprites del 2,5D), doble clic o «Ver todo el hub» para volver; un dedo vertical sigue desplazando la página; la cámara se recuerda por modelo y piso (tocar un paquete y volver no la pierde) y queda en `data-camara` del lienzo (la usan los recorridos para saber dónde quedó cada cosa) | `app/ui/camara.ts` (nuevo), `lienzo.ts` (escena, cien noches y presentar) |
| En 4 núcleos el piso salía a veces **2D**: `elegirPiso` mide el 2,5D en el primer segundo, cuando 3 Workers simulan las cien noches y le ganan la CPU al hilo de la interfaz (el banco mide 1,5 ms por cuadro 2,5D con la CPU libre) | Si salió 2D, se vuelve a medir una vez con las cien noches listas y, si el 2,5D anda, se pasa a 2,5D | `app/ui/lienzo.ts`, `escena.ts` (el botón de piso lo refleja) |
| «¿Y si…?» con «balancear el plan» sobre un plan que ya va por volumen: B idéntico a A y una tabla de ceros que decía «No se distingue: haría falta simular unas — noches» | Si el modelo B tiene la misma huella que A, la app lo dice y no compara; una diferencia idéntica en las 40 noches dice «Igual en las 40 noches»; sin cuenta de noches dice «No se distingue»; «Por volumen» se marca al balancear | `app/sesion.ts` (fase `igual`), `app/pantallas/ysi.ts` |
| La comparación no mostraba lo que balancear mejora | Suma «% de vueltas de más» (recirculación) a la pantalla dividida | `app/sesion.ts` (`KPI_COMPARACION`), `ysi.ts` |
| Decidir el hub grande decía «Recomendado: 4» con «No usar» al lado: las noches de 2 puestos no terminan en el horizonte | Un «no-termina» en una opción que **no cumple** (sobrecargada) ya no pone en rojo la decisión; en una que cumple o está en duda, sí. Y con el semáforo en rojo la app no recomienda nada | `experimentos/decision.ts` (+ prueba), `app/pantallas/decidir.ts` |
| El formulario preguntaba «¿«errorPronosticoCv» (…)?» y «Tus datos: induccionBase = 2,4» | Si el parámetro no trae su pregunta, se pregunta por lo que mide («¿Cuánto vale en tu hub el coeficiente de variación del volumen del día?»); los datos dados van con su unidad | `app/pantallas/decidir.ts` |
| Biografía: «La descarga tardó 0 min porque se frenó…», «Tardó más que el 100,0%», «Con el cambio (…) llegaría a las 02:51; sin el cambio llega a las 02:51. Llegaría antes del corte.» | El freno se cuenta si se ve al redondear (≥ 0,1 min); el último es «el paquete que más tardó»; misma hora = «ese cambio no lo adelanta», y el corte solo se menciona si el cambio lo cruza; la línea confirmada lleva la hora de antes («llegaba a las 05:50, no a las 06:05») | `explicacion/biografia.ts`, `app/pantallas/biografia.ts` |
| «Ver un paquete que pierde el corte» en una noche donde ninguno lo pierde | Dice «Ver el paquete que más tardó (ninguno pierde el corte)» | `app/pantallas/escena.ts` |
| Línea de tiempo en 360 px: horas encimadas («22:0023:00») y marcas que se pisan | Las horas van cada 1, 2, 3, 4 o 6 h según el ancho (≥ 48 px entre rótulos); marcas a menos de 16 px no se dibujan (quedan las más importantes); se rearma al cambiar el ancho | `app/ui/linea-tiempo.ts`, `estilos.css` |
| Miniaturas del inicio: un rectángulo vacío mientras se simula | «Simulando una noche…» hasta que hay película | `app/pantallas/inicio.ts`, `estilos.css` |
| Modo ingeniero: «la clasificación terminaría a las 28:30» | Hora del reloj (04:30) | `app/pantallas/comun.ts` (`horaDelDia`), `escena.ts`, `ingeniero.ts` |
| Comprobante: «Se hicieron 24 controles» dos veces | El diagnóstico I-CONTROLES no se repite | `app/pantallas/comprobante.ts` |
| Etiqueta «Calculando la noche…» sobre una mitad B vacía | Sin película B no hay etiqueta (y el lado vacío dice por qué) | `app/pantallas/ysi.ts` |
| La tabla de la decisión no marcaba cuál es la recomendada | La fila recomendada va resaltada (salvo con el semáforo en rojo) | `app/ui/tabla.ts` (`destacada`), `decidir.ts`, `estilos.css` |
| Selector «La noche mediana · La peor · La mejor» partido en dos renglones desparejos en 360 px | En el teléfono es una fila de partes iguales | `estilos.css` |

Pruebas nuevas: `app/pruebas/tablero.test.ts` (3), `app/pruebas/camara.test.ts` (4), la fase `igual` en `sesion.test.ts`, el texto del
contrafactual en `textos-pantalla.test.ts` y la regla del «no-termina» en `experimentos/pruebas/decision.test.ts`. Las pruebas de P8 (84 con
las nuevas), las de P5 (con la nueva) y las de P7, y el humo de P8 con servicios falsos (`app/pruebas/humo.mjs --sin-capturas`, 10 pantallas ×
4 combinaciones) siguen en verde.

Lo que miré y dejé como está (no es roto ni confuso): la escala de riesgo del tema oscuro termina en rosa claro (es la de P6, monótona en
luminancia y probada en grises); el encuadre del 2,5D deja margen alrededor del piso (con zoom ya no importa). Las capturas pueden salir
en 2D o en 2,5D según lo que mida `elegirPiso` en ese momento (las dos son pisos válidos).

`e2e/humo.mjs` (I-1) ahora guarda sus capturas en una carpeta temporal: en `e2e/capturas/` quedan solo las 8 elegidas de los recorridos.

**Corrida final (MEDIDO, 19-10-2026):** 16 de 16 recorridos en verde, 0 errores ni avisos de consola, 0 pedidos fallidos o a otro sitio,
0 claves faltantes, nada desborda; 17,6 min; 8 capturas, 1,17 MB. Película del enlace a los 1,4–1,9 s, cien noches del hub grande a los
11 s, el toque cae en el paquete (el arrastre lo deja a 2 px del puntero), confirmación de «¿y si…?» en 4,2–4,8 s; decidir: primera
respuesta en 87–93 s y cada dato recalcula en 62–81 s. Una lección de la corrida: las coordenadas de un toque se toman justo antes de
tocar (una captura desplaza la página).

## 12. Paso I-3 · §10.10 y §10.11: informe de salida y README

- **`npm run informe`** (`integracion/informe-salida.mjs`) escribe `salida/informe-salida.json`: corre `npm test` con un reportero JSON
  propio (`integracion/reportero.mjs`: totales y resultado por archivo, para atar cada criterio a sus pruebas), mide las invariantes en 200
  noches de cada plantilla y el enlace con el códec de producción, y junta `bateria-nucleo.json`, `r04.json`, `banco.json` y `e2e.json`.
- **README** del simulador en `apps/anden/simulador/README.md`: cómo correrlo, cómo probarlo, qué hay, qué no y qué queda abierto.
- **Excepción nueva en `pruebas/arquitectura.test.ts`:** las herramientas de la integración que miden §12.7 (`e2e/*.mjs` e
  `informe-salida.mjs`) importan el catálogo H01–H12 de P3 (`modelo/pruebas/hostiles/entradas.ts`) como datos; nada de eso entra en `dist/`.
- **Banco repetido** después de los cambios de I-3 (`salida/banco.json`, 399 s): 12 cumplen, 1 con margen, 1 no cumple. Primera carga
  137,8 KB brotli (era 134,7: el tablero y la cámara suman 3 KB; meta 150); primer cuadro desde el enlace 1.238 ms (meta 150, **no cumple**,
  igual que en I-2); con 4G 1.858 ms (con margen); cuadro 2,5D 1,23 / 7,16 ms con CPU 4×; cien noches 10,8 s; vista previa 502 ms;
  tamizado 41,6 s; decisión 3,6 s; memoria 44,3 MB.

**Estado de §12 (MEDIDO, 19-10-2026): 11 de 12 → «cerrado con pendientes».**

| # | Criterio | Medido | Estado |
|---|---|---|---|
| 1 | `npm test` verde en < 3 min | 1.017 pruebas: 1.015 pasan, 0 fallan, 1 `todo` («KPI sanos» de P4), 1 omitida (la batería completa); 118 s | cumple |
| 2 | 85 de 85 con el núcleo; S01 y S02 fallan; informe | 85 de 85, S01 y S02 fallan como deben, 0 reintentos, 66 doradas, informe en `verificacion/informe/` (corrida de I-2; nada de lo que corre la batería cambió después: núcleo, hub, verificación y casos de la integración idénticos, y los cambios de I-3 en experimentos/ y explicacion/ no los usa) | cumple |
| 3 | R08b | `diferencial.test.ts` en verde (chico 5 semillas, grande, F2, sin traza, batería rápida); doradas iguales | cumple |
| 4 | R04 | Node = Chromium 141 en 95 de 95 claves; Firefox y WebKit pendientes (no instalados, no se permite instalar) | cumple (con pendientes) |
| 5 | E01 y E02 | 0 frases causales sin confirmar (E01 con la reformulación de §2; E02 a la letra) | cumple (E01 reformulado: decide el orquestador) |
| 6 | I01–I06 en 200 noches | 0 alertas en 200 noches de cada plantilla con el núcleo (6,8 s y 16,4 s) | cumple |
| 7 | Enlace | ida y vuelta exacta (modelo, parche, receta); 6.024 / 206 / 62 caracteres; H01–H12 (y 3 variantes) rechazadas con su error; la otra pestaña reproduce la huella en las 4 combinaciones | cumple |
| 8 | Recorridos §10.8 | 16 de 16, 0 errores de consola, 8 capturas | cumple |
| 9 | Presupuestos §11 | 12 cumplen, 1 con margen (4G), **1 no cumple: primer cuadro 1.238 ms contra 150** | **no cumple** |
| 10 | Textos | claves es = en; etiqueta de noche y tres sellos en la escena (4 combinaciones); 0 marcas | cumple |
| 11 | Arquitectura | `arquitectura.test.ts` en verde | cumple |
| 12 | Nada publicado | servidor solo en 127.0.0.1; 0 pedidos a otro sitio en los recorridos; ningún script publica; sin commits de la integración | cumple |

## 13. Paso I-1 otra vez (23-10-2026): los ocho paquetes después de su segunda vuelta

Los ocho paquetes volvieron a pasar por su §9 el 23-10-2026 (arreglos y pruebas nuevas; ningún cambio en `contratos/`). La integración
volvió a ensamblar todo, leyó las secciones nuevas de cada `NOTAS-CONTRATO.md` y resolvió lo que no encajaba. MEDIDO en el contenedor del
entorno (4 núcleos, Node 22.22.0, Chromium 141), con otros procesos corriendo.

**Lo que no encajaba y cómo quedó (cambio mínimo, con las pruebas de cada dueño en verde):**

| Qué | Arreglo | Dónde |
|---|---|---|
| `arquitectura.test.ts` fallaba: `nucleo/pruebas/tokens.test.ts` importa `typescript` (P1 sumó la búsqueda de tokens por árbol sintáctico, la misma que hace esta prueba) | Las pruebas pueden importar las dos dependencias de desarrollo fijadas en `package-lock.json` (§1.3): `esbuild` y `typescript`. El código de la app sigue sin poder importar ningún paquete de npm | `integracion/pruebas/arquitectura.test.ts` |
| «KPI sanos» de §9 sobre `hub-chico@1.0.0` (P4 quedaba «incompleto» esperando esta decisión) | **Camino 2**: §9 se corrige para pedir lo que ya exige y cumple la prueba principal de P4; `hub-chico@1.0.0` sigue siendo el ejemplo de §5 y 1.1.0 queda como propuesta sin publicar. Se borró la prueba `todo` (y su ayuda); el certificado de imposibilidad queda como constancia. Texto para `corte-1.md` §9 en `CAMBIOS-CONTRATO.md` §10 (lo pasa el orquestador: la especificación no es de ningún paquete) | `hub/pruebas/kpi.test.ts`, `hub/NOTAS-CONTRATO.md` (nota de resuelto), `README.md`, `informe-salida.mjs` |
| La interfaz (P8, `app/ui/plano.ts`) dibuja el plano del hub con una traza de `n = 0` mientras simula; ningún contrato le promete que la escena (P6) la acepte (`app/NOTAS-CONTRATO.md` §13.2 a) | La integración lo fija con una prueba sobre las piezas reales (P3 compila, P4 da la geometría, P8 arma la traza, P6 reproduce y compone): las dos plantillas, los dos pisos y los dos temas; 0 entidades, recursos vacíos y finitos, fondo completo con coordenadas finitas, y tocar el plano nunca da un paquete, una persona ni un camión. Sin cambio de contrato (la `crearVistaPlano` de `contratos/vistas.ts` queda como propuesta para el corte 2) | `integracion/pruebas/plano.test.ts` (nuevo) |
| En 360 px el «Simulando una noche…» de las miniaturas del inicio parecía escrito dos veces («Sim» encimado): la píldora entera latía de opacidad 0,55 a 1 y a media opacidad se veían los puestos de inducción del plano debajo de las letras | Late solo el color del texto (`latido-texto`); la píldora queda opaca. Se borró `@keyframes latido`, que no usaba nadie más | `app/estilos.css` |
| `experimentos.comprobante.sin-validar` decía «datos reales» y el sello «días reales» (`app/NOTAS-CONTRATO.md` §13.5, para P5) | Mismo texto que el sello en es y en. Hoy ningún código la usa (la interfaz usa la del sello), pero sigue en el diccionario de P5 y no puede contradecir al sello | `experimentos/textos.es.json`, `textos.en.json` |

**Decisiones sobre lo nuevo de las notas (sin cambio de código):**
- **P1 §13.** `VERSION_MOTOR = '1.1.0'` versiona el motor entero (núcleo + hub): se queda en `nucleo/version.ts` en el corte 1; mudarla o
  separar `VERSION_NUCLEO`, en el corte 2. «(0, 1]» en §6.6 y `contratos/azar.ts`, y los 52 bits, al motor 2.0.0 (cambian todas las huellas).
  Texto propuesto en `CAMBIOS-CONTRATO.md` §11.
- **P2 §4.** La tolerancia ancha solo para los cuatro valores impresos con pocas cifras: aceptada (es más estricta que la de I-1).
- **P3 §12.** Enlace canónico estricto: aceptado (ningún enlace emitido cambia; `e2e/` arma los suyos con el códec). Compilar el enlace en un
  Worker para el peor caso de latencia (≈ 0,5 s en Node, 2–5 s estimados en un teléfono): corte 2, junto con el primer cuadro progresivo.
- **P4 §16 y §17.** Los cuatro arreglos de robustez se aceptan; cambian 1 de 200 noches de `hub-chico@1.0.0` (r34) y la r25 del primer
  minuto, nada que esté fijado en una dorada. La huella agregada de las cien noches del hub chico pasó de `d4f7128687bd85cf` (19-10, motor
  1.0.0) a `a266bb376bb5c8ca` (hoy, Chromium = Node); ninguna prueba la fija (los recorridos la recalculan). Los textos de las reglas 7 y 11
  de 1.1.0 van a `CAMBIOS-CONTRATO.md` §11.
- **P5 §12.** Bonferroni, `icPercentil` sin recortar y los textos del semáforo: ya registrados (`CAMBIOS-CONTRATO.md` §6). KPI neutros
  (P5 §6): `comparar` lanza y la interfaz filtra con `META_KPI` (`app/sesion.ts`, `KPI_COMPARACION`); se acepta sin el cuarto veredicto.
- **P6 §16.** La caminata por el pasillo del lazo queda dibujada como la mide el hub. Escribir su camino en `contratos/traza.ts` (o llevar la
  distancia en `a`) y la acumulación como polilínea: corte 2 (cambian el contrato).
- **P7 §14.** `ResultadoTamizadoConDuda` (superconjunto de `ResultadoTamizado`): aceptado; la interfaz lee `peorCaso`. AUSENCIA en rampa y las
  fuentes `tamizado` y `contrafactual` de `Afirmacion`: corte 2.
- **P8 §13.** `Sesion.sincronizarB()`, el plano mientras se simula y los avisos por pantalla: aceptados. El banco puede informar «plano
  visible» como hito aparte (I-2); la meta de la película no cambia.

**El sello del motor dice «sin verificar» hasta volver a correr la batería (§10.6, paso I-2).** Cinco archivos de la clausura de la batería
cambiaron después de la corrida del 19-10 (`hub/bloques/rampas.ts`, `hub/bloques/sorter.ts`, `modelo/enlace.ts`,
`experimentos/estadistica/percentiles.ts`, `explicacion/indice.ts`): la huella de fuentes ya no es `cf61bfbb…` y la construcción, como debe
(hallazgo H5), pone «sin verificar» en el comprobante. Nada de lo que cambió esta vuelta en la integración está en esa clausura. `npm run
verificar` (≈ 9 min) lo devuelve a «85 de 85» si la batería pasa con el hub de hoy.

**Medido al cerrar esta vuelta (23-10-2026):**
- `npm test`: **1.066 pruebas, 1.065 pasan, 0 fallan, 0 `todo`, 1 omitida** (la batería completa, con `VERIFICAR=1`); 94 s (§12.1: < 3 min).
  Al empezar: 1.065, 1 falla (arquitectura) y 1 `todo` (P4).
- `npx tsc -p tsconfig.json`: 0 errores.
- `npm run construir`: esbuild en 173 ms; `entrada.js` 454,0 KB y `worker.js` 127,7 KB sin comprimir (el peso brotli de la primera carga lo
  mide el banco en I-2; en I-3 era 137,8 KB contra 150); 9 archivos; motor «sin verificar» (ver arriba).
- `e2e/humo.mjs` sobre ese `dist/` con los servicios reales: **0 errores ni avisos de consola, 0 pedidos fallidos** en 1280 × 800 y 360 × 740,
  claro y oscuro; película del enlace del hub de 24.000 en 0,8–1,0 s y del chico en 0,14–0,21 s; cien noches en 6,9–7,9 s y 2,1–2,5 s con 3
  Workers; enlace completo 6.024 caracteres y plantilla + 5 cambios 206, ida y vuelta exacta; huella agregada de las cien noches del hub
  chico **Chromium = Node = `a266bb376bb5c8ca`**. El humo de P8 con servicios falsos (`app/pruebas/humo.mjs --sin-capturas`) también en verde.

## 14. Paso I-2 otra vez (23-10-2026): batería, R04 y banco con los paquetes de la segunda vuelta

MEDIDO en el contenedor del entorno (4 núcleos, Intel Xeon 2,10 GHz, Node 22.22.0, Chromium 141.0.7390.37), con la máquina libre (carga
0,7–1,4). Nada se publicó; el servidor del banco escuchó solo en 127.0.0.1.

**§10.6 · `npm run verificar` (semilla 20261017): 85 de 85 exigibles pasan con el núcleo de producción**, S01 (8,0%) y S02 (83,2%) fallan
como deben, 6 informativas, **0 reintentos**, 66 doradas iguales, 8.104 corridas de red sin violaciones de conservación; 5 min 4 s en total
(la batería 291 s). Mayor |z| de las 54 exigibles con z: 2,47. Por dueño: P1 4, P2 59, P4 13, P5 3, I 6. Lo del hub, que es lo que cambió:
K01–K03 y L01 exactos (12.000/h), L02 11.774 (z = 0,91), L03 10.932 (z = 0,80), L04 1.456 = 4 × 364, L05 y L06 exactos, L07 F2/F3 +0,11%
en paquetes por hora y −0,55% en tiempo en el hub (z = 1,14), P02 0,0499 (z = −0,05), R05a y R05b sin una diferencia, R06 10 fotos
idénticas, R07 30 noches con 1 y 3 hilos idénticas. Estadística: S03 sin sesgo (z = −1,46; cobertura informativa S03c 92,2%), S08
T·Var(L̄) = 1.485 con IC ∋ 1.800, S09 L = 3,996 (z = −0,72), S11 sesgo −0,013 (z = −0,20), S12 94,05%, S13 exacto. Ninguna tolerancia se
tocó. La huella de fuentes nueva es `7e620446…` (135 archivos): coincide con el árbol de trabajo, así que `dist/` vuelve a llevar el sello
«85 de 85 · 23-10-2026» (lo confirmó la construcción del banco).

**§10.7 · R04: Node = Chromium 141 en 95 de 95 claves** (9 de la suite rápida, 66 doradas, 2 huellas de modelo, 12 del hub: el chico con 5
semillas y el grande con 1, con traza completa, y 6 grupos de doradas de matemática con 0 distintas), 0 errores de consola, 4,5 s en la
página. **Firefox y WebKit: pendientes**, con el mismo motivo de §7 (no están en el entorno y esta corrida no permite instalarlos).

**§10.9 · banco (mediana de 5 corridas; referencia M/M/1: 3,99 M eventos/s en Node y 2,49 M en Chromium): 12 cumplen, 1 con margen,
1 no cumple.**

| Presupuesto (§11) | Meta | Mediana (mín–máx) | Estado | 19-10 |
|---|---|---|---|---|
| Noche de 24.000 con traza, Node | ≤ 400 ms | 180 ms (171–207) | cumple | 254 |
| Noche del chico con traza, Node | ≤ 150 ms | 56 ms (54–60) | cumple | 75 |
| Cien noches de 24.000, 3 Workers, con progreso | ≤ 20 s | 7,9 s (7,6–8,3); 101 avances, el primero a los 109 ms | cumple | 10,8 |
| Vista previa del deslizador | ≤ 600 ms | 307 ms (283–378) | cumple | 502 |
| **Primer cuadro desde el enlace, sin red** | ≤ 150 ms | **953 ms** (813–959); el chico, 550 ms | **no cumple** | 1.238 |
| Primer cuadro con Fast 4G | ≤ 1,5 s | 1.534 ms (1.437–1.602); Slow 4G 3,3 s (informativo) | con margen (+2,3%) | 1.858 |
| Cuadro 2,5D de 24.000 | ≤ 4 · ≤ 16,7 ms con 4× | 0,97 · 5,05 ms (con rasterizado 3,4 · 19,7) | cumple | 1,23 · 7,16 |
| Cuadro 2D de 24.000 | ≤ 3 · ≤ 10 ms con 4× | 0,42 · 1,75 ms (con rasterizado 2,1 · 10,4) | cumple | 0,54 · 3,06 |
| Tamizado del chico, 3 Workers, cancelable | ≤ 60 s | **58,5 s** (57,4–61,7); cancelado en 1 ms | cumple (justo) | 41,6 |
| Evaluación de la decisión del chico | ≤ 20 s | 6,0 s (5,6–6,1); recomienda `null` | cumple | 3,6 |
| Memoria con la noche de 24.000 y su par | ≤ 150 MB | 45,5 MB (45,2–47,7) | cumple | 44,3 |
| JavaScript de la primera carga, brotli | ≤ 150 KB | **145,7 KB** (entrada.js 113,7 + worker.js 31,9 + trozo 0,1) | cumple (3% de holgura) | 137,8 |

- **Hitos del primer cuadro (mediana, sin red, hub de 24.000):** `entrada.js` 36 ms, `worker.js` 66, DOM listo 109, primera pintura 185,
  modelo compilado 150, **plano visible 192 ms** (172–223; hito nuevo e informativo, `data-plano="1"`, app/NOTAS-CONTRATO.md §13.2 b),
  película 953. El plano no es la película (no tiene un instante simulado) y no cambia el estado del presupuesto: sigue sin cumplir por la
  misma causa de §8 (la noche entera, en un Worker frío, antes del primer cuadro). Con Fast 4G: plano 802 ms y película 1.534.
- **Tamizado: más lento por más noches, no por un motor más lento (MEDIDO con una sonda en Node con 3 hilos, el mismo código de servicios
  del 19-10 contra el de hoy):** el tamizado del hub chico pasó de 1.200 noches (25,4 s) a 2.640 (51,9 s) y la decisión de 80 a 220
  noches (2,3 → 5,2 s); el costo por noche bajó un 7%. Las noches de más vienen de las reglas de parada que entraron el 20-10 (Bonferroni
  sobre 20 miradas en `evaluarDecision`, CAMBIOS-CONTRATO.md §6, y el tamizado con «en duda» de P7 §14.2). Cumple por la regla de §11
  (mediana), pero 2 de 5 corridas pasaron de 60 s: en un teléfono no va a llegar. Opciones para decidir (cambian la estadística, no las
  toca este paso): reusar en cada extremo las noches de la evaluación base (números comunes), bajar `REPLICAS_MAX_TAMIZADO` (100) o
  tamizar con una tanda fija y decidir después con la evaluación completa solo los supuestos que mueven la decisión.
- **Primera carga:** 145,7 KB contra 150 (era 137,8 el 19-10): lo que sumó la segunda vuelta de los paquetes son 7,9 KB brotli (no lo
  desglosé por paquete). Cualquier pantalla nueva del corte 2 tiene que ir en un trozo aparte o el presupuesto se rompe.
- `npm test` después de todo esto: 1.066 pruebas, 1.065 pasan, 0 fallan, 0 `todo`, 1 omitida (la batería con `VERIFICAR=1`); 93 s.
  `tsc` sin errores. Único cambio de código de este paso: `integracion/banco.mjs` (el hito «plano visible»; no entra en la huella de la
  batería).

**Abierto después de este I-2:** (1) primer cuadro ≤ 150 ms: no cumple (953 ms); decidir entre el primer cuadro progresivo (corte 2) o
reescribir el presupuesto; (2) 4G con margen (1.534 ms, +2,3%); (3) tamizado al límite (58,5 s de 60); (4) R04 en Firefox y WebKit,
pendiente; (5) los textos de `corte-1.md` §8, §9 y §6.6 de `CAMBIOS-CONTRATO.md` §4, §10 y §11, para el orquestador.

## 15. Paso I-3 otra vez (23-10-2026): recorridos, la experiencia mirada de nuevo, informe de salida y README

MEDIDO en el contenedor del entorno (4 núcleos, Node 22.22.0, Chromium 141.0.7390.37). Nada se publicó: el servidor escuchó solo en
127.0.0.1 y los recorridos cuentan 0 pedidos a otro sitio.

**§10.8 · Recorridos con el código de hoy.** La primera corrida (antes de tocar nada) pasó los 16 recorridos, pero las capturas mostraban
cosas que alguien que viene de FlexSim marca en el primer minuto. Lo que estaba roto, pobre o confuso, y el arreglo (cambio mínimo en el
paquete dueño, con sus pruebas en verde y pruebas nuevas):

| Qué se veía | Arreglo | Dónde |
|---|---|---|
| **La cola del puesto manual salía del edificio**: las columnas de la excepción seguían hacia los costados sin límite y, en la peor noche del primer minuto (2.455 paquetes esperando el puesto manual a las 05:04), la fila era una línea violeta de decenas de metros por encima del lazo y fuera del piso | Una **pila acotada** junto a la mesa: 8 × 5 lugares por capa, 4 capas que suben en la 2,5D (0,3 m cada una); desde la última capa los lugares se repiten. Las vistas no dibujan los paquetes que quedan exactamente debajo de otro (salvo el seleccionado): el cuadro 2,5D de ese instante bajó de 21,6 a 4,1 ms y el 2D de 6,9 a 2,9 ms, y el piso deja de caer a 2D en las noches trabadas | `escena/disposicion.ts` (`lugarEnRampa`, `CAPACIDAD_PILA`), `escena/reproductor.ts` (`PosicionesEscena.tapado`, extensión propia de P6), `componeriso.ts`, `componer2d.ts`, `buffers.ts`; pruebas nuevas en `reproductor.test.ts` y `componer.test.ts` |
| La pila no decía cuántos son | El tablero en vivo suma «**N en el puesto manual**» (de la traza: tramos COLA_MANUAL abiertos en t, con búsqueda binaria), en rojo desde 100; en el teléfono solo cuando está en rojo | `app/ui/tablero.ts`, textos `app.tablero.unoEnManual` y `enManual` (es y en), `estilos.css`; prueba nueva en `tablero.test.ts` |
| **El primer minuto abría a las 08:38**, con el turno terminado a las 06:00: el enlace se paraba en la mitad de la espera más larga del paquete, que en la peor noche es la cola manual hasta media mañana | El enlace se para en la causa **confirmada** del paquete, durante el turno: a las 05:04, con el paquete dando una vuelta porque su rampa está llena y 12 rampas llenas a la vista. El recorrido falla si el enlace no muestra la causa antes del corte | `integracion/e2e/comun.mjs`, `primer-minuto.mjs` |
| La biografía decía «Paquete 710 del camión T26» del paquete 711 (el índice desde 0 y el camión desde 1) | El paquete también se cuenta desde 1 | `explicacion/biografia.ts` (+ su prueba). Está en la clausura de la batería: se volvió a correr `npm run verificar` (abajo) |
| En 360 × 740 el botón de reproducir y la línea de tiempo quedaban **debajo del borde** (la cabecera ocupaba 396 px: título en 3 renglones, nombre del modelo cortado en la barra, franja de supuestos en 2 renglones) | Cabecera compacta en el teléfono: título en 2 renglones como mucho, la barra sin el nombre cortado, la franja de supuestos en su versión corta («20 valores de referencia, no tuyos», como en el diseño maestro §5.9; la larga sigue en escritorio). La película empieza en 333 px y el botón de reproducir termina en 733 de 740 | `app/estilos.css`, `app/ui/etiqueta-noche.ts`, textos `app.franja.supuestosCorto` y `conPropiosCorto` |
| El aviso de error en el tema oscuro: texto blanco sobre rojo claro, **2,8:1** | Texto oscuro sobre el rojo del tema oscuro (7,0:1); en claro sigue blanco sobre rojo oscuro (6,6:1) | `app/estilos.css` (`--sobre-rojo`) |
| Decidir preguntaba «¿Cuántos paquetes por hora mete una persona…?» y contestaba «Referencia: 2,4 s por paquete»; «(2,25, 2,4 o 4,5)» con comas decimales y de lista mezcladas; «Tu dato (s por paquete (persona de planta))» | Con una unidad en segundos por paquete se muestran también los paquetes por hora («2,4 s por paquete (≈ 1.500 paquetes por hora)»; el rango, «de 800 a 1.600 paquetes por hora»); los tres valores van con punto y coma; «Tu dato, en s por paquete (persona de planta)» | `app/pantallas/decidir.ts`, textos de `app/i18n` y `explicacion/textos.es.json` |

Lo que miré y dejé como está: el 2,5D del hub grande deja margen alrededor del piso (el hub es muy apaisado y el encuadre es isométrico:
con zoom no importa); en la tabla apilada del teléfono, «$ 1.484.594 (± $ 6.746)» parte el renglón en el «±» (arreglarlo pide espacios
duros en `formato.moneda`, y §9 P8 fija «$ 1.234» con espacio común); la escena no arranca sola al abrir un enlace con receta (quien lo armó
la dejó parada en un instante: es lo que quiere mostrar). Los dos pisos (2D y 2,5D) son válidos y las capturas pueden salir en cualquiera.

**Batería (§10.6) otra vez**, por el cambio de `explicacion/biografia.ts` (está en la clausura de fuentes de la batería, H5): `npm run
verificar` 85 de 85 exigibles, S01 y S02 fallan como deben, 0 reintentos, 66 doradas, 8.104 corridas sin violaciones de conservación, en
320 s; los mismos valores que en §14 (el motor es determinista y la biografía no entra en ninguna prueba de la batería). Huella de fuentes
nueva: `a116020e…`; `dist/` lleva «85 de 85 · 23-10-2026».

**Un recorrido intermitente.** En una corrida completa, «decidir» en 360 oscuro no llegó a la escena en 60 s (los otros 15 pasaron); la
misma combinación sola pasó, y 6 vueltas seguidas de «película grande → ¿y si…? → cerrar → abrir decidir» en el mismo contexto abrieron la
escena en 0,6–1,4 s. No lo pude reproducir. `e2e/comun.mjs` ahora dice qué se ve cuando una pantalla no llega (pantalla, si está lista,
aviso, «cargando», si hay modelo y película, service worker), para que la próxima vez se sepa la causa.

## 16. Paso I-3 otra vez (30-10-2026): recorridos con el código de hoy, la experiencia mirada de nuevo, informe de salida y README

MEDIDO en el contenedor del entorno (4 núcleos, Node 22.22.0, Chromium 141.0.7390.37). Nada se publicó: el servidor escuchó solo en
127.0.0.1 y los recorridos cuentan 0 pedidos a otro sitio. `contratos/` no cambió.

**Antes de tocar nada.** Con el árbol del commit `909205e` los recorridos de la primera combinación (1280 × 800 claro: primer minuto,
decidir, compartir y enlace hostil) y el primer minuto de la segunda pasaron sin errores de consola. Se cortó esa corrida para mirar las
capturas y arreglar lo que se veía mal antes de la corrida completa.

**Lo que se veía pobre o confuso para alguien que viene de FlexSim, y el arreglo** (cambio mínimo en `app/`, con sus 96 pruebas y su humo con servicios falsos en verde):

| Qué se veía | Arreglo | Dónde |
|---|---|---|
| La biografía ponía los quince pasos del paquete antes del porqué: en 360 px la causa **confirmada** (lo que la persona vino a buscar al tocar el paquete) quedaba debajo de quince renglones, fuera de la primera pantalla, y la captura «biografía con causa confirmada» no la mostraba | Primero «Por qué (solo lo confirmado)» y después «Lo que le pasó»; el «¿y si…?» del paquete sigue al final | `app/pantallas/biografia.ts` |
| El mapa de las cien noches se dibujaba sobre un **instante** de la noche que se ve (las 05:04 de la peor): paquetes, bandejas y rampas cargadas tapaban las placas de riesgo, y en 360 px, en 2,5D, el hub quedaba en diagonal y las rampas eran rayitas sin color legible. Además mezclaba dos cosas: un mapa de cien noches con la etiqueta de una | El mapa va **sobre el plano** del hub (la traza vacía de `ui/plano.ts`, como pide §9 P8: «capa de riesgo sobre el plano») y **en planta**: cada tobogán entero pintado por su probabilidad de llenarse, en 1280 y en 360 (vertical). La etiqueta de noche pasa al selector «mediana / peor / mejor», que es lo que cambia la noche de la escena. Tocar una rampa sigue abriendo su biografía en la noche de la escena | `app/pantallas/noches.ts` |
| En la tabla apilada del teléfono, la fila destacada (la opción recomendada, con su barra y su margen) partía la cifra en el «±»: «$ 1.484.594 (± $» y «6.746)» en otro renglón | En la tabla apilada la cifra va en un renglón y, si falta lugar, el que se acomoda en dos es el rótulo («Costo por / noche»). Revisado también en la comparación de «¿y si…?», que se apila igual | `app/estilos.css` |
| En la pantalla dividida de escritorio cada mitad medía 58vh (la regla de 1100 px de `.escena__caja` pisaba la de `.escena__caja--mitad`) y el hub, largo y bajo, ocupaba un tercio del lienzo: unos 200 px vacíos debajo de cada mitad empujaban la tabla del veredicto fuera de la pantalla | En lado a lado, cada mitad con proporción 16:9 (entre 240 px y 56vh): el hub llena la mitad y la tabla sube 140 px | `app/estilos.css` |

**Decidir tarda en cerrarse.** En el recorrido (plantilla chica con los datos de un hub propio), la recomendación con su semáforo aparece a
los 17–18 s (MEDIDO hoy en 1280 y en 360, con las cien noches de la escena calculándose al mismo tiempo) y el formulario llega a «Ya está»
recién a los ~150 s; después de contestar la única pregunta, otros ~135 s. Mientras tanto la pantalla muestra la tabla, la recomendación y
el progreso del tamizado con lo que falta, y se puede cancelar: no es un cuelgue, pero alguien que viene de FlexSim lo va a sentir lento.
Es la misma causa del tamizado al límite de §14 (las reglas de parada del 20-10 piden más noches); las tres salidas de §14 cambian la
estadística y las decide el orquestador. `e2e/decidir.mjs` ahora registra también cuándo aparece la recomendación (`recomendacionS`).

Lo que miré y dejé como está: en 360 px el 2,5D del hub grande queda en diagonal (el encuadre isométrico no gira el hub; la persona puede
pasar a planta con un toque y acercar con el pellizco); el mapa de riesgo no rotula las rampas en el encuadre completo (60 rampas en
1.160 px no entran; la lista «Las rampas que más se llenan» las nombra y acercando se rotulan); la pregunta de la plantilla dice «paquetes
por hora» y el parámetro está en segundos por paquete (la plantilla publicada es inmutable; la pantalla ya muestra las dos unidades).

**Segunda mirada a las capturas (30-10-2026, después de la corrida completa de las 20:10).** Lo que todavía se veía roto: en la planta
acercada sobre el paquete, cada rampa llena era una flecha de rombos encimados. El tobogán mide 1,05 × 1,3 m en las dos plantillas
publicadas (MEDIDO con `crearDisposicion`) y sus 25 lugares (20 en el chico) iban en dos columnas a lo largo: 8 cm entre cajas de 42 cm,
o sea, cada caja tapaba a seis vecinas. En la 2,5D la rampa llena era una franja chata. Arreglo, solo de dibujo y con el cambio mínimo en
`escena/`, sin tocar ningún número:
- `disposicion.ts`: el tobogán se llena como una pila. Por capa entran 2 cajas a lo largo (paso de 0,44 m) y 3 a lo ancho (0,4 m), y las
  capas suben 0,28 m (el alto de la caja) hasta cubrir la capacidad: 5 capas en el hub grande y 4 en el chico (`grillaRampa`,
  `ALTURA_CAPA_RAMPA`). La pila del puesto manual no cambió.
- `reproductor.ts`: la altura de cada caja sale de su capa, y `PosicionesEscena.celda` lleva el lado del lugar.
- `componer2d.ts`: en la planta cada glifo entra en su lugar (0,8 del lado, nunca menos de 3 px).
- Prueba nueva en `escena/pruebas/reproductor.test.ts`: dentro del tobogán, sin encimarse en una capa, nunca una capa de más y la altura
  por capa. Las 102 pruebas de P6 y `tsc` pasan.
- Comprobado en capturas de la planta acercada (claro y oscuro) y de la 2,5D, y la huella de la batería no cambia (`escena/` no está en
  sus fuentes).

**Corrida completa con el código de hoy** (`npm run e2e`, 20:22–20:52; MEDIDO): los 16 recorridos pasan, con 0 errores y 0 avisos de
consola, 0 pedidos a otro sitio y 0 claves faltantes. Quedan 8 capturas de 1.249 KB en total.
- Huella agregada de las cien noches del hub chico en la otra pestaña: `a266bb376bb5c8ca` en las cuatro combinaciones. Del primer
  minuto: `b88addd1e5e5b8d3`.
- Decidir duró de 340 a 419 s por combinación, contra 283 a 295 s en la corrida de las 20:10:
  - la recomendación apareció a los 18 a 33 s y la primera respuesta a los 160 a 264 s;
  - la máquina estaba compartida: carga de 7 en 4 núcleos, con otro Chromium y otras pruebas de otra sesión corriendo al mismo tiempo;
  - es la misma lentitud de §14, ahora agravada por la carga.
- El JavaScript de la primera carga medido sobre `dist/` de hoy: 146,5 KB brotli, contra 145,7 KB el 23-10 y un tope de 150 KB.

**Informe de salida (§10.10, MEDIDO el 30-10-2026):** 11 de 12 criterios cumplen y el corte queda **cerrado con pendientes**. El que no
cumple es el 9: el primer cuadro desde el enlace tarda 953 ms contra 150.
- `npm test`: 1.070 pruebas, 1.069 pasan, 0 fallan, 0 `todo` y 1 omitida (la batería completa).
  - Con la máquina libre tardó 144 s; la carga al empezar era de 5,5, la del propio `npm test`.
  - Con otra sesión usando el contenedor (carga de 9 en 4 núcleos) había tardado 290 y 357 s.
  - Por eso `informe-salida.mjs` guarda ahora la carga junto al tiempo y lo avisa en la nota del criterio 1.
- El informe dice de cuándo es cada medición (`corridas`):
  - la batería, R04 y el banco son del 23-10: desde entonces no cambió ningún archivo de la batería, porque su huella de fuentes coincide;
  - `npm test`, las invariantes, el enlace y los recorridos son de hoy;
  - la primera carga se vuelve a medir sobre `dist/` de hoy: 146,5 KB.

## 17. Arreglos de la revisión del 30-10-2026 (31-10-2026)

Catorce hallazgos confirmados (seguridad, estadística, hub y experiencia) y los menores baratos. Lo que cambia la especificación o
extiende un tipo congelado está en `CAMBIOS-CONTRATO.md` §12; `contratos/` no cambió. MEDIDO = en el contenedor (4 núcleos compartidos).

**Seguridad (SEG-R1 a SEG-R4).**
- El esquema acota la geometría (±5 km, recta 2 km, radio 500 m, cintas y acumulación 2 km), las listas (200 andenes, 500 rampas, 100
  puestos) y las personas (50 por andén, 2.000 por rol). Los enlaces de 6 KB que tiraban o colgaban la pestaña (acumulación a 1e9 m,
  origen en 1e12, andén y cinta a 1e9, recta de 300.000 m, 1,9 millones de personas) ahora se rechazan al leerlos: H13–H17 en
  `modelo/pruebas/hostiles/entradas.ts`, y el recorrido del enlace hostil abre H13 por la URL.
- Defensa en el dibujo por si el esquema cambia: grilla de a lo sumo 200 líneas por eje, muestreo de recorridos de a lo sumo 4.000
  puntos, 400 piezas por tramo de cinta, y lo que queda fuera del lienzo (bandejas, entidades) no se compone. Prueba: un hub de 1e9 m se
  compone en menos de 5 s con la grilla acotada (`escena/pruebas/componer.test.ts`).
- Presupuesto: `E-PRESUPUESTO dibujo` con más de 5.000 bandejas (las plantillas tienen 142 y 300); los tramos de las personas cuentan en
  la película (2 por persona de andén y camión); el escritor de la traza corta en 4 millones de tramos con un error que lo dice.
- «Saltar al contenido» ya no cambia el fragmento (que es el enlace del modelo): mueve el foco a `<main>`. hashchange solo abre
  fragmentos `m=`, `t=`, `p=`, `r=`. El enlace tiene nombre accesible.

**Estadística (EST-01 a EST-04, REV-D1, y EST-05, EST-06, EST-09, EST-10).**
- Decisión secuencial: cada lado del Wilson con su z calibrado por programación dinámica exacta (`experimentos/estadistica/secuencial.ts`).
  Con 20/20/400 y meta 0,9: z 2,37 y 2,98, errores exactos 2,46% y 2,10%, y con p = 0,94 se confirma el 73% (Bonferroni: 39%). MEDIDO de
  paso: Bonferroni del lado de «no cumple» se quedaba corto con metas altas (3,19% con 0,95; 5,09% con 0,99). La meta inalcanzable con
  el presupuesto de noches se avisa en el semáforo.
- S13 de la batería corre la regla de la interfaz (`decidirOpcion`): 97/100 → en duda; 116/120 → cumple.
- Comparación pareada: veredicto por la prueba del signo exacta; la noche típica (mediana de B − A) con su IC por estadísticos de orden;
  las noches atípicas (Iglewicz–Hoaglin) en una nota. En 2.000 confirmaciones de 40 noches con la anatomía medida en el hub chico (una de
  cada 40 noches con 100–250 min de más): el IC de la mediana cubre ≥ 93%, el de t no llega a 90% de la media, y nunca «A es mejor» cuando
  B es mejor en la mayoría de las noches.
- «¿Y si…?»: confirma con las cien noches de A (antes 40), cada indicador al 99% (cinco a la vez), semáforo de A y de B (en rojo, la tabla
  sin números ni veredictos y «Quedarme con B» secundaria con el motivo; lo mismo en el acto 2 de presentar), y el botón principal lo
  deciden los indicadores de la decisión (restricción y objetivo), no un conteo de votos. «Iguales en la práctica» solo con el intervalo y
  el promedio dentro del mínimo; si no, «no alcanza para saber» con el rango.
- Decidir: 199 de 200 no se redondea a «100%» y un extremo de 0,8996 contra la meta 0,90 va con un decimal. «Perder el corte» con 26% dice
  «1 de cada 4», no «3 de cada 10». Comentarios de cotas numéricas corregidos (Cornish-Fisher < 2e-6; zDeCola …051).

**Hub, motor 1.2.0 (HUB-R01 a HUB-R03, REV-D7, REV-D8).** MEDIDO con `hub-chico@1.1.0` (propuesta):
- La vuelta del puesto manual espera lugar en la mesa: la fila máxima queda en 120 de 120 lugares (antes 154; 18 de 20 noches por
  encima con 3 personas de rampa). En esa configuración extrema (3 personas para 12 rampas, recirculación 175%) 1 de 20 noches ya no
  termina en el horizonte: antes la acumulación «absorbía» de más. El arreglo trajo un caso de reentrada (la acumulación llamaba a la
  inducción desde adentro de `tomar` y un puesto recibía dos paquetes): se cuida con un contador en `hub/bloques/acumulacion.ts`.
- Costos: con 25% de faltas la noche cuesta 1.490.685 contra 1.572.920 sin faltas (−5,2%; antes −10%) y termina 68 min más tarde. Lo
  que sigue «ahorrando» es la mitad no pagada de las faltas; el costo de perder el corte no está en `costoNoche` (está en la restricción
  de la decisión).
- Con 2.000 paquetes por camión: espera P90 del contrato 7,2 min contra 187,6 min desde la llegada del camión (estadía del camión P90 232,6
  min) con la mitad de los paquetes fuera del corte. La biografía del paquete empieza con su camión (hora de llegada y espera en la playa).
- `personaOcupadaPct` ya no pasa de 100% y la traza llega hasta su último tramo en las noches que no terminan.
- E02 (sobredeterminación): con el motor 1.2.0 y corte 26:00, 8 de 10 noches sobredeterminaban (el escenario lo exige en 9); con corte
  25:00, 10 de 10 y 0 frases causales sin confirmar en 500 paquetes.

**Experiencia (EXP-01 a EXP-03 y los menores EXP-05 a EXP-11, SEG-R7).**
- `reconciliar()` (`app/ui/dom.ts`): repinta comparando el árbol nuevo con el que hay y conserva los nodos con la misma etiqueta y
  `data-accion` (con su foco y sus manejadores), como las bibliotecas de «morphing» del DOM. La escena, el comprobante y el progreso de
  decidir ya no destruyen el botón con foco en cada noche que llega. El recorrido del enlace hostil lo comprueba con 3 noches.
- Mientras la película corre a la vista, a lo sumo 2 Workers calculan (`TRABAJADORES_CON_PELICULA`); al pausarla o salir de la
  escena, todos (`limite` en el planificador y `reactivar()`).
- Rótulos de rampa en una pasada final con pastilla (`escena/rotulos.ts`): las llenas, las casi llenas (≥ 80%) y la seleccionada
  siempre, de al menos 10 px; acercado, todas; sin encimarse. El tablero nombra las llenas («R09 llena», «3 rampas llenas: R01, R07, R09»).
- Menores: las pausas superpuestas dicen el rol (dos tarjetas distintas en el comprobante); el semáforo traduce el id del KPI; «la rampa
  se llenó a las 01:05» en lugar de «de 01:05 a 01:05»; bordes de controles ≥ 3:1 en claro y oscuro (y el selector de idioma con el borde
  fuerte); el botón de tema dice «Tema: Auto» y su nombre accesible empieza con eso; Anterior y Siguiente pegados abajo en Presentar en el
  teléfono; si el simulador no carga, un texto para la persona y el detalle en la consola.
- SEG-R5, en parte: al anonimizar se quitan la licencia y la frase de la meta (texto libre que podía decir «Confidencial ACME» o nombrar
  al cliente), y el aviso de compartir dice ahora que viajan las fuentes y los enlaces de los datos que no son propios. Reemplazar también
  esas fuentes choca con una decisión anterior y probada de P3 («las fuentes públicas quedan: el lector las necesita»): lo decide el
  orquestador.

**Lo que no se hizo en esta vuelta (y por qué).** HUB-R04 a HUB-R12 (capacidad de la excepción, pausas y faltas de descarga y del
puesto manual, el retén que cubre pausas, utilización por ventana, jaulas parciales, reasignación dinámica de rampa, campos que no hacen
nada, tiempos por tamaño) cambian el esquema o el motor más allá de un arreglo: corte 2. Lo demás que quedó pendiente acá (EST-07, EST-08,
SEG-R6, EXP-04, EXP-12, EXP-13, REV-D5) se hizo en las dos vueltas siguientes (§18).

## 18. Segunda y tercera vuelta de los arreglos de la revisión del 30-10-2026 (31-10-2026)

`contratos/` no cambió; lo que cambia la especificación está en `CAMBIOS-CONTRATO.md` §12.5 y §12.6.

**Segunda vuelta.**
- REV-D2: el IC de t que muestra la app (`resumirNumeros`) se cruza en `npm test` con la implementación independiente de la batería
  (`integracion/pruebas/ic-t-cruzado.test.ts`); el sello sigue sin medirlo (S03 mide independencia y sesgo, `CAMBIOS-CONTRATO.md` §4).
- REV-D5: R04 corre también en Bun (JavaScriptCore) si el entorno lo tiene; el alcance de R04 dice qué motores se compararon.
- SEG-R6: el banco registra la carga del sistema y la referencia M/M/1 contra la del equipo libre; con la máquina cargada la corrida es
  «no concluyente» y no cuenta para el criterio 9.
- EST-07: cada ± dice su confianza (resumen y Decidir) y el abanico de Presentar lleva el IC de P10, P50 y P90. EST-08: «Ya está» no
  promete que nada cambia la respuesta cuando un supuesto la mueve por menos que la zona de indiferencia.
- EXP-04: la película de un modelo recién abierto arranca un minuto antes del primer camión. EXP-12: los avisos van arriba y no tapan el
  eje ni la velocidad. EXP-13: título de las plantillas públicas en el idioma de la interfaz («≈ 24.000 paquetes por noche»). HUB-R07: «%
  del turno con la inducción ocupada».

**Tercera vuelta (lo que faltaba de los confirmados).**
- HUB-R01, el explicador: la espera DENTRO del camión (andenes ocupados o cola de descarga, desde la llegada del camión o el inicio del turno
  hasta que empieza la descarga del paquete) es una candidata a causa con su cambio fijo, «una persona más de descarga en cada andén»
  (`explicacion/causas.ts › esperaEnCamion`, tipo `descarga`, textos es/en). MEDIDO (hub-chico@1.1.0, 2.000 paquetes por camión): de 9.171
  paquetes tarde, ninguno queda sin candidata (antes 1.410). En esa saturación el contrafactual no la confirma (el cuello es la
  inducción) y no se afirma; con los andenes como cuello la confirma en 40 de 40. La biografía ofrece ese «¿y si…?» cuando el camión esperó
  en la playa. E01 y E02 siguen en 0 frases sin confirmar (E02: 840 frases de una causa y 6 conjuntas en 500 paquetes).
- EST-04: «Seguir simulando (hasta N noches por opción)» en Decidir cuando la decisión queda en duda al llegar al máximo (parche a
  `experimento.replicasMax`, hasta 2.000, el tope de la calibración exacta; `app/pantallas/decidir.ts › maximoParaSeguir`).
- EST-02: prueba de cobertura con noches REALES del hub (`integracion/pruebas/pareada-hub.test.ts` y el pozo de 600 pares
  `integracion/pruebas/datos/pares-hub-chico.json`, que la prueba ata a la versión del motor resimulando las tres primeras réplicas). Con
  la configuración de la app (cien noches, 99%) el IC de la mediana cubre 98,9–100% en los cinco indicadores y ningún veredicto contradice a
  la mayoría de las noches; el IC de t cubre la media 68% en la espera P90 y en el costo por paquete.
- REV-D6: R06 de la batería exige que la foto tomada apenas restaurada sea igual a la original y que `correrHasta(T)` deje `ahora = T`
  (la mutación «restaurar sin seq» ahora falla en 10 de 10 fotos).
- HUB-R11, en parte: aviso `A-SORTER-TIPO` cuando el sorter es de banda cruzada (el motor del corte 1 lo simula como bandejas). HUB-R13: la
  propuesta 1.1.0 dice que `caminarEntreRampas` es el mínimo y que la caminata va por la distancia sobre el lazo.
- SEG-R6, primera carga: con los arreglos de esta revisión había pasado a 154,2 KB brotli contra 150. Los textos en inglés (≈ 63 KB, 14,8 KB
  comprimidos) van ahora en un trozo que se baja al elegir el idioma (`app/i18n/cargar.ts`, `diccionario-es.ts`, `diccionario-en.ts`;
  `diccionarios.ts` sigue juntando los dos para las pruebas): primera carga 143,1 KB. El recorrido del enlace hostil lo comprueba (el
  trozo no se pide en español, se pide una vez al pasar a inglés, `?idioma=en` arranca en inglés) y el informe mide la primera carga con
  los trozos que la entrada importa de forma estática.
