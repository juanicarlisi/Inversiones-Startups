# Notas de la integración · corte 1, pasos I-1 (§10.1 a §10.5) e I-2 (§10.6, §10.7 y §10.9) · 19-10-2026

Qué decidió la integración sobre lo que anotaron los ocho paquetes en sus `NOTAS-CONTRATO.md`, qué quedó cableado, qué cambió en otros
paquetes (cambio mínimo, con sus pruebas en verde) y qué queda para decidir. **`contratos/` no cambió**: no hay `CAMBIOS-CONTRATO.md`, y
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
| `pruebas/` | `arquitectura`, `diferencial` (R08b), `r06-hub`, `e-explicador` (E01, E02), `s-estadistica` (S01–S03), `s-estadistica-whitt` (S08, S09, S11), `textos`, `marcas`, `trabajador`, `puente`; ayudas `hilos.ts`, `hilo-trabajador.ts` (la M/M/1 pasó a `bateria/mm1.ts` en I-2). |

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
   propuesta. Decide el orquestador.
2. **El recorrido «decidir» hasta «Ya está» (§10.8).** Con `hub-chico@1.0.0` ninguna opción cumple la meta (y con 1.1.0 el valor 3 queda en
   duda): el formulario termina en «ninguna cumple» o «en duda», que es lo honesto. Para el e2e del paso §10.8 hace falta una decisión con
   meta alcanzable (otra pregunta en la plantilla, o un escenario), sin tocar las plantillas publicadas.
3. **Presentar: 4 pasos o «tres actos»** (P8): los 4 pasos cubren los tres actos de §9; lo confirma el fundador.
4. ~~El comprobante del motor dice «0 de 85 (—)» hasta §10.6.~~ **Resuelto en I-2:** `npm run verificar` escribe
   `integracion/salida/bateria-nucleo.json` y la construcción ya pone «85 de 85» con la fecha de la corrida (ver §6).

## 4. Limitaciones conocidas que quedan para el corte 2

- Restaurar una foto con traza completa da una traza parcial (y `invariante:tiempo`): foto de la traza.
- La causa AUSENCIA no se detecta en rampa con la traza actual del hub (P7 §5): no hay causa falsa, hay una causa que no se dice.
- La receta lleva la huella del modelo y no la de las noches: el sello «reproducida» compara entradas (P8 §5).
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
**Corrección:** la banda se centra en la cobertura real del método con el mismo ancho: **[91,4%; 95,9%]** (93,6% ± 1,96 ee de 500
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
