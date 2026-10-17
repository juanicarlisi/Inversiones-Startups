# Andén · Corte 1: «Hub verificado, en escena» (especificación para construir, 17-10-2026)

> **Qué es.** La especificación del primer corte del simulador Andén, para construirlo **ya**, en una sesión, con agentes en paralelo.
> Sale del diseño maestro (`diseno-maestro.md`) y resuelve las alertas de los tres jueces que tocan a este corte: azar por dirección
> semántica, estado serializable sin generadores, presupuestos de cómputo medidos y no supuestos, causas confirmadas por contrafactual,
> entrada no confiable, tres sellos que no se mezclan y un corte que entra en una sesión.
>
> **Anexo verificado.** `corte-1-paso0/` (en esta carpeta) es el andamio literal: `package.json`, `tsconfig.json`, los contratos, el
> modelo de ejemplo, un motor de referencia y una traza de la maqueta para desarrollar. Compila con `tsc` 6.0.2 y pasa 6 de 6 pruebas
> en Node 22.22.0 (MEDIDO, 17-10-2026). El Anexo A de este documento copia los contratos literalmente desde ahí.
>
> **Etiquetas:** HECHO · MEDIDO · ESTIMACIÓN · HIPÓTESIS · INFERENCIA (`doctrina/02-estandares-de-evidencia.md`). Ningún número sale de
> la empresa donde trabaja el fundador; los parámetros de la plantilla son públicos o supuestos marcados.

---

## 0. El corte en una página

**Objetivo.** Construir y probar, sin el fundador, un simulador que ya le gana a una planilla y a un video de FlexSim en lo que importa
para decidir la dotación y el plan de un hub de clasificación de última milla: un motor determinista verificado contra teoría, el
mecanismo real del sorter, estadística que no deja mentir, una película que se toca, las cien noches sobre el plano, comparaciones con la
misma suerte, el porqué de cada paquete y una decisión con semáforo, todo en un enlace con su receta.

**Qué entra.**
1. **Núcleo determinista** (`nucleo/`): calendario con fases, milisegundos enteros, Philox4x32-10 por dirección semántica, matemática
   propia, huella de 64 bits, foto y restauración, escritor de traza.
2. **Batería «Andén Verificado»** (`verificacion/`): **85 pruebas exigibles** con valor esperado y tolerancia, más informativas y
   demostraciones que tienen que fallar; trazas doradas por huella.
3. **Modelo** (`modelo/`): esquema `anden.modelo/1`, compilador con chequeos estáticos y contradicciones, borrador analítico F0,
   presupuesto de cómputo, parches RFC 6902, JSON canónico, huella SHA-256, enlace endurecido, anonimizador.
4. **Hub** (`hub/`): camiones con desvío, error de pronóstico y atraso común; descarga, cintas con separación y acumulación con
   contrapresión; inducción con personas, pausas, ausencias, retén y temporarios; sorter de bandejas con rueda de tiempos, paquetes de una
   o dos bandejas, NO-READ, rampas que se llenan, vueltas, excepción y no transportables; personas de rampa con reglas y plan de
   clasificación; jaulas; micro-paradas; KPI y costos. Fidelidades F0, F2 y F3 con su consistencia. Dos plantillas.
5. **Experimentos** (`experimentos/`): réplicas con planificador de prioridades y cancelación, IC de t, Wilson, P90 con IC, MSER-5,
   comparación pareada, evaluación de la decisión con réplicas secuenciales, semáforo y comprobante.
6. **Escena** (`escena/`): reproductor de tramos con fórmulas cerradas, vistas 2D y 2,5D isométrica sin GPU, mapa de las cien noches,
   momentos de la línea de tiempo, estilo claro y oscuro.
7. **Explicación y decisión** (`explicacion/`): esperas con taxonomía cerrada, biografía, contrafactual dirigido que confirma cada causa,
   verificador de frases, tamizado por decisión con pérdida esperada en pesos, formulario por decisión y plan de medición.
8. **Interfaz** (`app/`): inicio con plantillas vivas, escena con línea de tiempo y etiqueta de noche, biografía, cien noches, «¿y si…?»
   con pantalla dividida, decidir, comprobante, compartir con QR, presentar (tres actos), modo ingeniero; español con estructura para
   inglés; PWA local.

**Qué no entra** (va al corte 2, `diseno-maestro.md` §8): 3D, video, importar planillas, arranque en caliente, entrevista con IA, MCP,
variables de control, sonda colectiva, editor 2D, varios días, publicación de cualquier cosa.

**Por qué no es un MVP pobre (INFERENCIA, confianza media-alta).** El hub tiene el mecanismo que una planilla no puede tener (bandejas,
rampas que se llenan, contrapresión, personas con pausas y faltas, paquetes de dos bandejas, micro-paradas); la primera pantalla ya es una
película que se toca, se compara con la misma suerte y se presenta; cada número sale con intervalo, semáforo y receta; cada causa está
confirmada por un contrafactual; y el motor pasa 85 pruebas contra teoría. Ningún incumbente ofrece esa combinación en un teléfono sin
placa de video (INFERENCIA, confianza media; ver el registro de afirmaciones del diseño maestro §1.3 antes de decirlo en público).

**Cómo se construye.** Paso 0 (10–15 minutos, mecánico) → **8 paquetes en paralelo**, cada uno dueño exclusivo de sus archivos → paquete
de **integración**. Cada paquete corre sus pruebas solo, contra los contratos y el motor de referencia, sin esperar a los demás.
ESTIMACIÓN: una sesión larga; cada paquete, 1 a 3 horas de agente; la integración, 1 a 2 horas.

**Criterio de salida:** §12. No se publica nada: publicar pide la consulta legal y el OK del fundador (regla 8 de `CLAUDE.md`).

---

## 1. Reglas técnicas (fijas para todo el corte)

1. **100% en el navegador**, sin servidor ni claves. Node solo corre pruebas y herramientas.
2. **TypeScript borrable** (`erasableSyntaxOnly`): sin `enum`, sin `namespace` con código, sin propiedades en parámetros. Los imports
   llevan la extensión `.ts`. `node --test` corre los `.ts` directo, sin compilar (MEDIDO: Node 22.22.0). `tsc` solo revisa tipos.
3. **Dependencias.** En ejecución, una sola: **qrcode-generator 2.0.4** (MIT), vendorizada con su licencia en `app/vendor/`. De
   desarrollo, fijadas en `package-lock.json`: esbuild 0.28.2 (MIT), typescript 6.0.3 (Apache-2.0), @types/node 22.20.5 (MIT). Playwright
   1.56.1 y Chromium 141 ya están en el entorno (`/opt/node-tools`, `/opt/pw-browsers`): se usan desde ahí con `NODE_PATH`, no se
   instalan. Solo licencias permisivas (MIT, BSD, ISC, Apache-2.0); mediabunny (MPL-2.0) no.
4. **Determinismo.** En `nucleo/`, `hub/`, `verificacion/`, `experimentos/` y `explicacion/` están prohibidos `Math.random`, `Math.log`,
   `Math.exp`, `Math.pow`, `Math.sin`, `Math.cos`, `Math.tan`, `Math.atan2`, `Math.log1p`, `Math.expm1`, `Math.cbrt`, `Math.hypot`,
   `Date`, `performance` y el orden de iteración de objetos con claves numéricas mezcladas. Se usa `m.mat` (o `det` de `nucleo/`). La
   referencia de `contratos/` usa `Math.*` a propósito (es la otra implementación). Una prueba de arquitectura de la integración lo
   verifica sobre el texto de los archivos. `Math.sqrt`, `Math.floor`, `Math.round`, `Math.min`, `Math.max`, `Math.abs`, `Math.imul`,
   `Math.trunc` y `Math.PI` están permitidos.
5. **Inyección del motor.** Ningún paquete importa `nucleo/` durante el corte (puede no existir todavía): las funciones que corren
   simulaciones reciben un `CrearMotor` (`crearSimularNoche(crearMotor)`, `crearBateria(crearMotor)`). En las pruebas propias se pasa
   `crearMotorReferencia`; la integración pasa el de producción.
6. **Interfaz en español, con estructura para inglés.** Ningún texto de interfaz va fijo en el código: claves i18n con prefijo del paquete
   (`app.*`, `escena.*`, `explicacion.*`, `modelo.*`, `experimentos.*`) en archivos `textos.es.json` y `textos.en.json` de cada paquete,
   con las mismas claves (una prueba lo verifica). Números con formato es-AR.
7. **Sin nombres de empresas** en plantillas, textos ni pantallas (lista negra probada: Andreani, Mercado Libre, MercadoLibre, Correo
   Argentino, OCA, DHL, FedEx, UPS, Amazon, Loginter, Urbano, Rappi, PedidosYa). Las empresas solo pueden aparecer en campos `fuente`.
8. **Seguridad.** Todo texto que viene del modelo se pone con `textContent`; nunca `innerHTML` con datos del modelo. `index.html` con CSP
   estricta (`default-src 'self'; script-src 'self'; worker-src 'self' blob:; img-src 'self' data: blob:; style-src 'self'`).
9. **Carpeta:** `apps/anden/simulador/`. Las calculadoras v0 siguen en `apps/anden/` y **no se tocan**.
10. **Nada se publica ni se despliega.** Ningún envío a terceros, ningún gasto.

---

## 2. Estructura de carpetas y dueños

```
apps/anden/simulador/
├── package.json · tsconfig.json                      paso 0 (literal del anexo)
├── README.md                                         I
├── contratos/                                        paso 0 · CONGELADO
│   ├── tipos-base.ts azar.ts matematica.ts motor.ts traza.ts geometria.ts resultados.ts modelo.ts referencias.ts
│   ├── experimentos.ts mensajes-worker.ts escena.ts vistas.ts explicacion.ts decision.ts hub.ts servicios.ts i18n.ts
│   ├── ejemplos/hub-chico.json                       el modelo de ejemplo completo (§5)
│   ├── referencia/motor-referencia.ts                motor de referencia (lento, legible; para avanzar y para R08)
│   ├── fixtures/traza-maqueta.ts · fixtures/maqueta/hub.mjs   traza de la maqueta medida (solo para vistas e interfaz)
│   └── pruebas/paso0.test.ts
├── nucleo/                                           P1
│   ├── azar/ (philox.ts · clave.ts · fuente.ts · distribuciones.ts)
│   ├── matematica/ (det.ts · doradas-mat.json · generar-doradas.ts)
│   ├── motor/ (calendario.ts · motor.ts · huella.ts · foto.ts)
│   ├── traza/escritor.ts · cinematica/trapezoidal.ts · indice.ts · version.ts
│   └── pruebas/
├── verificacion/                                     P2
│   ├── flujo/ (red.ts · monitores.ts)                bloques de colas genéricos sobre el contrato del motor
│   ├── formulas/colas.ts                             valores analíticos
│   ├── casos/ (v-mm1.ts · v-mmc.ts · v-mg1.ts · v-gm1.ts · v-perdida.ts · v-prioridad.ts · v-jackson.ts · v-cerradas.ts ·
│   │           v-mtinf.ts · v-reparador.ts · c-law.ts · d-m.ts · r-reproducibilidad.ts · informativas.ts)
│   ├── bateria.ts · doradas.json · informe/ (generado: resultados.json, informe.html)
│   └── pruebas/
├── modelo/                                           P3
│   ├── esquema.ts · normalizar.ts · chequeos.ts · f0.ts · presupuesto.ts · compilar.ts · variante.ts
│   ├── canonico.ts · huella.ts · parches.ts · enlace.ts · anonimizar.ts · indice.ts
│   ├── textos.es.json · textos.en.json
│   └── pruebas/ (hostiles/: 12 entradas hostiles)
├── hub/                                              P4
│   ├── estructuras/ (anillo.ts · rueda.ts)
│   ├── bloques/ (demanda.ts · andenes.ts · acumulacion.ts · induccion.ts · sorter.ts · rampas.ts · excepcion.ts · personas.ts · medicion.ts)
│   ├── simular.ts · f2.ts · geometria.ts · plan.ts · kpi.ts · costos.ts · indice.ts
│   ├── plantillas/ (hub-chico.json · hub-lazo-noche.json · generar.ts · registro.ts)
│   ├── README.md                                     orden de bloques, eventos y direcciones (lo exige §6)
│   └── pruebas/ (doradas.json)
├── experimentos/                                     P5
│   ├── estadistica/ (t-student.ts · tabla-t.json · wilson.ts · percentiles.ts · mser.ts · resumen.ts · pareada.ts)
│   ├── decision.ts · semaforo.ts · comprobante.ts · planificador.ts · en-proceso.ts · indice.ts
│   ├── textos.es.json · textos.en.json
│   └── pruebas/
├── escena/                                           P6
│   ├── reproductor.ts · lazo.ts · indice-tiempo.ts · componer2d.ts · componeriso.ts · pintar.ts · sprites.ts
│   ├── estilo.ts · piso.ts · riesgo.ts · momentos.ts · indice.ts
│   ├── textos.es.json · textos.en.json
│   └── pruebas/
├── explicacion/                                      P7
│   ├── esperas.ts · biografia.ts · causas.ts · contrafactual.ts · verificador.ts · tamizado.ts · formulario.ts · medicion.ts · indice.ts
│   ├── textos.es.json · textos.en.json
│   └── pruebas/
├── app/                                              P8
│   ├── index.html · estilos.css · arrancar.ts · estado.ts · entrada-falsa.ts · servicios-falsos.ts
│   ├── pantallas/ (inicio.ts · escena.ts · biografia.ts · noches.ts · ysi.ts · decidir.ts · comprobante.ts · compartir.ts ·
│   │              presentar.ts · ingeniero.ts)
│   ├── ui/ (linea-tiempo.ts · tarjeta.ts · deslizador.ts · semaforo.ts · insignia.ts · tabla.ts · etiqueta-noche.ts)
│   ├── i18n/ (traducir.ts · formato.ts · textos.es.json · textos.en.json)
│   ├── pwa/ (sw.js · manifest.webmanifest) · vendor/ (qrcode-generator-2.0.4.js · LICENCIA-qrcode-generator.txt)
│   └── pruebas/ (humo.mjs: recorrido con servicios falsos en Chromium)
└── integracion/                                      I
    ├── ensamblar.ts · worker.ts · puente.ts · entrada.ts · construir.mjs · servir.mjs · banco.mjs · r04.mjs
    ├── e2e/ (correr.mjs · primer-minuto.mjs · decidir.mjs · compartir.mjs · capturas/)
    ├── pruebas/ (arquitectura.test.ts · diferencial.test.ts · e-explicador.test.ts · s-estadistica.test.ts · r06-hub.test.ts ·
    │            textos.test.ts · marcas.test.ts)
    └── salida/ (informe-salida.json: generado)
```

Regla de propiedad: **cada archivo tiene un solo dueño**. Si un paquete necesita algo de otro, usa el contrato; si el contrato no alcanza,
lo anota en `NOTAS-CONTRATO.md` en su carpeta y sigue con un supuesto; la integración decide.

---

## 3. Paso 0: el andamio (lo hace el orquestador antes de lanzar los paquetes)

```bash
mkdir -p apps/anden/simulador
cp -r oportunidades/proyectos/anden/corte-1-paso0/. apps/anden/simulador/ && rm apps/anden/simulador/LEEME.md
cd apps/anden/simulador
npm install                  # si el registro no responde, seguir: las pruebas no lo necesitan
npm test                     # 6 de 6 (contratos/pruebas/paso0.test.ts)
/opt/node-tools/node_modules/.bin/tsc -p tsconfig.json   # o npx tsc; sin errores (con @types/node instalado)
git add -A && git commit -m "Andén simulador, corte 1: paso 0 (contratos congelados)"
```

Desde ese commit, `contratos/` queda **congelado**: solo la integración lo cambia, y si lo cambia vuelve a correr todo.

---

## 4. Los contratos

El código literal está en el **Anexo A**. Resumen de qué define cada archivo y quién lo usa:

| Archivo | Define | Implementa | Consume |
|---|---|---|---|
| `tipos-base.ts` | `Ms`, `Seg`, `aMs` (la única conversión a ms: `Math.round`), `Hora` («HH:MM» con HH de 00 a 47), `Fase`, `Etiqueta` | literal | todos |
| `azar.ts` | `Direccion` (clave, a, b, c), `Distribucion` (11 tipos), `CONSUMO` fijo, `FuenteAzar`, `ClaveDe` | P1 | P2, P4 |
| `matematica.ts` | `MatematicaDeterminista` (log, exp, cos, sin, pow, sqrt) | P1 | P2, P4 |
| `motor.ts` | `Motor`, `Bloque`, `EstadoBloque`, `Foto`, `CrearMotor`, `AnilloI32`, `RuedaTiempos`, `TiempoTrapezoidal` | P1 (motor), P4 (anillo y rueda) | P2, P4, I |
| `traza.ts` | `TipoTramo` y el significado de cada columna por tipo, `Causa` (taxonomía cerrada), `TipoMomento`, `ClaseEntidad`, `refDe`, columnas, `Traza`, `EscritorTraza` | P1 (escritor), P4 (contenido) | P6, P7, P8 |
| `geometria.ts` | `GeometriaHub`, `LazoEstadio`, `posEnLazo` (literal) | P4 | P6 |
| `resultados.ts` | `KPIS` (24), `META_KPI`, `ResultadoReplica` con `alertas` | P4 | P5, P6, P7, P8 |
| `modelo.ts` | Esquema `anden.modelo/1` completo, `Diagnostico`, `EstimacionF0`, `ModeloValidado`, `Compilar`, `Variante`, `Anonimizar`, `EstimarPresupuesto` | P3 | todos |
| `referencias.ts` | `numero`, `distribucion`, `parametro`, `validadoSinChequeos` (solo pruebas) | literal | P4, P7 |
| `experimentos.ts` | `Simulador`, `Resumen`, `Proporcion`, `Comparacion`, `EvaluacionDecision`, `Semaforo`, `Receta`, `Comprobante`, `Prioridad`, `Planificador` y las firmas de sus funciones | P5 | P7, P8, I |
| `mensajes-worker.ts` | Protocolo con cada Worker | I (worker), P5 (planificador) | — |
| `escena.ts` | `LIMITES_ENLACE`, `Enlace`, `CodecEnlace`, `ResolverPlantilla`, `JsonCanonico`, `HuellaModelo`, `AplicarParche` | P3 | P8, I |
| `vistas.ts` | `Reproductor`, `Posiciones`, `EstadoRecursos`, `Vista`, `Piso`, `MapaRiesgo`, `MomentoEscena` | P6 | P8 |
| `explicacion.ts` | `Espera`, `Afirmacion`, `Frase`, `Biografia`, `Contrafactual`, `CausasConfirmadas`, `AlmacenResultados`, `VerificarFrases` | P7 | P8 |
| `decision.ts` | `SupuestoTamizable`, `ResultadoTamizado`, `Pregunta`, `PlanMedicion`, `Tamizar`, `ArmarFormulario` | P7 | P8 |
| `hub.ts` | `SimularNoche`, `GeometriaDe`, `PlanBalanceado`, `RegistroPlantillas` | P4 | I, P8 |
| `servicios.ts` | `Servicios`: la única puerta de la interfaz al resto | I (real), P8 (falsa) | P8 |
| `i18n.ts` | `Diccionario`, `Traducir`, `Formato` | P8 | P8 |

Tres patrones que los contratos imponen:
- **Sin cancelación en el calendario.** Un bloque que quiere invalidar un evento guarda el `seq` que le devolvió `agendar` y, al recibirlo,
  lo descarta si `m.seq` ya no es el que guardó (por ejemplo, el fin de una tarea interrumpida).
- **Todo el estado de un bloque en arreglos tipados y números** (`estado()` y `restaurar()`): sin closures ni objetos. Es lo que permite la
  foto, el rebobinado sin re-simular, el arranque en caliente del corte 2 y la división de trayectorias del corte 5.
- **Toda frase con cifras es una `Frase` con `afirmaciones`**: el verificador controla cada cifra contra su fuente antes de mostrarla.

---

## 5. El modelo de ejemplo completo: hub chico de última milla

Hub de clasificación de última milla en turno noche: 10 camiones de 800 paquetes desde las 22:00 cada 15 minutos, 3 andenes con 2 personas,
cintas a la acumulación (120 lugares), 5 puestos de inducción (3 con persona), un lazo de bandejas basculantes de 85 m (142 bandejas a 2 m/s),
12 rampas para 10 rutas (las dos más pesadas con dos rampas), 6 personas de rampa repartidas por volumen, 1 puesto manual, corte a la 01:30.
Todos los valores tienen fuente o están marcados como supuesto. Es también la plantilla `hub-chico@1.0.0`.

```json
{
  "esquema": "anden.modelo/1",
  "familia": "hub-lazo",
  "id": "hub-chico-noche",
  "titulo": "Hub de clasificación chico, turno noche",
  "descripcion": "Hub de última milla con sorter de bandejas: 10 camiones de 800 paquetes, 3 andenes, 5 puestos de inducción (3 con persona), 12 rampas para 10 rutas. Supuestos de ejemplo con su fuente; no es un hub real ni sale de ninguna empresa.",
  "autor": "Andén (plantilla pública de ejemplo)",
  "licencia": "CC-BY-4.0",
  "creado": "2026-10-17",
  "plantilla": { "id": "hub-chico", "version": "1.0.0" },
  "unidades": { "tiempo": "s", "largo": "m", "moneda": "ARS" },
  "parametros": {
    "induccionBase": {
      "valor": { "tipo": "lognormal", "media": 2.4, "cv": 0.35 },
      "unidad": "s por paquete (persona de planta)",
      "etiqueta": "ESTIMACION",
      "fuente": "Oskon: 1.600 paquetes/h sostenibles por puesto como supuesto de diseño (2,25 s); techo autoinformado ~2.250/h (Plus One Robotics). El cv 0,35 es supuesto de la maqueta.",
      "url": "https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity",
      "fecha": "2026-10-17",
      "rango": [1.2, 6],
      "incierto": { "bajo": 2.25, "medio": 2.4, "alto": 4.5 },
      "pregunta": "¿Cuántos paquetes por hora mete una persona en un puesto de inducción?",
      "nota": "2,4 s ≈ 1.500 por hora. El extremo alto (4,5 s ≈ 800 por hora) es el piso del rango que usa la visión ia-nativa."
    },
    "noLeido": {
      "valor": { "tipo": "bernoulli", "p": 0.015 },
      "unidad": "probabilidad por lectura",
      "etiqueta": "ESTIMACION",
      "fuente": "Lectura de 98,5–99% (Oskon, ejemplo de diseño) y 99,9% (Cognex, autoinformado).",
      "url": "https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity",
      "fecha": "2026-10-17",
      "rango": [0, 0.2],
      "incierto": { "bajo": 0.001, "medio": 0.015, "alto": 0.05 },
      "pregunta": "¿Qué parte de los paquetes no lee el túnel y termina en el puesto manual?"
    },
    "ausentismo": {
      "valor": 0.05,
      "unidad": "probabilidad de faltar en la noche, por persona",
      "etiqueta": "ESTIMACION",
      "fuente": "Tope «aceptable» de 5% de las jornadas (ADRHA, citado por la ficha metodológica de la EIL); 12,6% de los empleados privados faltó al menos un día del mes en el tercer trimestre de 2025 (IDESA).",
      "url": "https://argentina.gob.ar/sites/default/files/eil_ausentismo_ficha_metodologica.pdf",
      "fecha": "2026-10-17",
      "rango": [0, 0.3],
      "incierto": { "bajo": 0, "medio": 0.05, "alto": 0.1 },
      "pregunta": "¿Cada cuánto falta alguien del turno? Cuando falta, ¿lo cubre otra persona?",
      "golpeDiscreto": true
    },
    "eficienciaTemporario": {
      "valor": 0.7,
      "unidad": "fracción del ritmo de una persona de planta",
      "etiqueta": "ESTIMACION",
      "fuente": "Loske y Klumpp (IFAC 2020): eficiencia de ingresantes 0,46 → 0,61 → 0,72 → 0,88 contra 0,80–0,95 de los experimentados; 0,70 ≈ 0,61 / 0,875 (período 5, por cuenta).",
      "url": "https://re.public.polimi.it/retrieve/584d3515-aaf1-4de0-8e95-e441327146e8/1-s2.0-S2405896320335205-main.pdf",
      "fecha": "2026-10-17",
      "rango": [0.3, 1],
      "incierto": { "bajo": 0.53, "medio": 0.7, "alto": 1 }
    },
    "ritmoDescarga": {
      "valor": { "tipo": "lognormal", "media": 5, "cv": 0.5 },
      "unidad": "s por paquete por persona (descarga a granel)",
      "etiqueta": "SUPUESTO",
      "fuente": "Sin fuente publicada de paquetes por hora por persona en la descarga a granel (realismo-logistico.md §2.1). 5 s ≈ 720 por hora.",
      "fecha": "2026-10-17",
      "rango": [1, 30],
      "incierto": { "bajo": 3.5, "medio": 5, "alto": 8 },
      "pregunta": "¿Cuántos paquetes por hora baja una persona de un camión a granel?"
    },
    "manejoRampa": {
      "valor": { "tipo": "lognormal", "media": 3, "cv": 0.4 },
      "unidad": "s por paquete (de la rampa a la jaula)",
      "etiqueta": "SUPUESTO",
      "fuente": "No encontramos valores publicados de manejo de rampa (realismo-logistico.md §2.6).",
      "fecha": "2026-10-17",
      "rango": [0.5, 20],
      "incierto": { "bajo": 2, "medio": 3, "alto": 5 }
    },
    "caminarEntreRampas": {
      "valor": 2,
      "unidad": "s al cambiar de rampa",
      "etiqueta": "SUPUESTO",
      "fuente": "Supuesto de la maqueta de medición; la plantilla no usa la distancia real entre rampas.",
      "fecha": "2026-10-17",
      "rango": [0, 60]
    },
    "cierreJaula": {
      "valor": 60,
      "unidad": "s por jaula llena",
      "etiqueta": "SUPUESTO",
      "fuente": "No encontramos minutos de cierre de jaula o saca publicados (realismo-logistico.md §2.6).",
      "fecha": "2026-10-17",
      "rango": [0, 900]
    },
    "tiempoManual": {
      "valor": { "tipo": "lognormal", "media": 20, "cv": 0.5 },
      "unidad": "s por paquete en el puesto manual",
      "etiqueta": "SUPUESTO",
      "fuente": "Releer, reetiquetar y volver a inducir. La codificación manual de 1999 (30 cajas por minuto, Plant Engineering) no incluye resolver la etiqueta.",
      "fecha": "2026-10-17",
      "rango": [2, 300]
    },
    "desvioCamion": {
      "valor": { "tipo": "uniforme", "min": -300, "max": 600 },
      "unidad": "s respecto del turno del camión",
      "etiqueta": "SUPUESTO",
      "fuente": "Supuesto: entre 5 minutos antes y 10 después. No encontramos datos argentinos de cumplimiento de turnos (realismo-logistico.md §4).",
      "fecha": "2026-10-17"
    },
    "errorPronosticoCv": {
      "valor": 0.08,
      "unidad": "coeficiente de variación del volumen del día",
      "etiqueta": "SUPUESTO",
      "fuente": "Sin fuente: error del pronóstico de volumen del día. Reemplazar por el histórico propio.",
      "fecha": "2026-10-17",
      "rango": [0, 0.5],
      "incierto": { "bajo": 0, "medio": 0.08, "alto": 0.2 }
    },
    "probAtrasoComun": {
      "valor": 0.1,
      "unidad": "probabilidad por noche",
      "etiqueta": "SUPUESTO",
      "fuente": "Sin fuente: lluvia, paro o corte de ruta que atrasa a todos los troncales de la noche.",
      "fecha": "2026-10-17",
      "rango": [0, 1],
      "incierto": { "bajo": 0, "medio": 0.1, "alto": 0.25 },
      "golpeDiscreto": true
    },
    "demoraAtrasoComun": {
      "valor": { "tipo": "uniforme", "min": 900, "max": 2700 },
      "unidad": "s de atraso común",
      "etiqueta": "SUPUESTO",
      "fuente": "Sin fuente: entre 15 y 45 minutos.",
      "fecha": "2026-10-17"
    },
    "paradaLazoEntre": {
      "valor": { "tipo": "exponencial", "media": 2700 },
      "unidad": "s entre micro-paradas del lazo (atascos)",
      "etiqueta": "SUPUESTO",
      "fuente": "Sin dato publicado de micro-paradas de sorters; buscar datos de proveedor (diseño maestro §3.8).",
      "fecha": "2026-10-17",
      "golpeDiscreto": true
    },
    "paradaLazoDuracion": {
      "valor": { "tipo": "lognormal", "media": 90, "cv": 0.8 },
      "unidad": "s que dura cada micro-parada",
      "etiqueta": "SUPUESTO",
      "fuente": "Sin dato publicado.",
      "fecha": "2026-10-17"
    },
    "papeleoCamion": {
      "valor": 300,
      "unidad": "s por camión al terminar la descarga",
      "etiqueta": "SUPUESTO",
      "fuente": "Supuesto de la maqueta de medición.",
      "fecha": "2026-10-17"
    },
    "fatigaMaxima": {
      "valor": 0.15,
      "unidad": "fracción de ritmo perdido con fatiga plena",
      "etiqueta": "SUPUESTO",
      "fuente": "Forma exponencial de Jaber, Givi y Neumann (2013), usada por Kim y Jung (WSC 2022); el 0,15 es supuesto de la maqueta.",
      "url": "https://www.informs-sim.org/wsc22papers/148.pdf",
      "fecha": "2026-10-17",
      "nota": "Apagada por defecto: si el tiempo base se midió en planta, ya incluye la fatiga media."
    },
    "fatigaTau": {
      "valor": 5400,
      "unidad": "s de trabajo continuo hasta el 63% de la fatiga plena",
      "etiqueta": "SUPUESTO",
      "fuente": "Supuesto de la maqueta de medición.",
      "fecha": "2026-10-17"
    },
    "costoHoraPersona": {
      "valor": 7085,
      "unidad": "ARS por hora pagada",
      "etiqueta": "ESTIMACION",
      "fuente": "Calculadora 3 de Andén (apps/anden), ejemplo «Peón · Camioneros (CCT 40/89)»: $7.085 por hora pagada y $9.361 por hora productiva. Se usa la pagada porque las pausas y las faltas las modela el simulador.",
      "fecha": "2026-10-17"
    },
    "costoFijoNoche": {
      "valor": 496000,
      "unidad": "ARS por noche (nave y servicios)",
      "etiqueta": "ESTIMACION",
      "fuente": "1.200 m² (supuesto) × (USD 7,1 por m² y mes, Cushman & Wakefield, tercer trimestre de 2026 × $1.535 por dólar + $1.500 por m² y mes de servicios, supuesto de la calculadora 5) ÷ 30 noches. Valores de apps/anden/js/referencias.js.",
      "fecha": "2026-10-17"
    }
  },
  "procedencia": {
    "/hub/perfilPaquete": { "etiqueta": "SUPUESTO", "fuente": "Sin fuente de la mezcla de tamaños; un hub argentino separa irregulares de hasta 1,2 m y 50 kg en otro sorter (prensa del 17-12-2024).", "fecha": "2026-10-17" },
    "/hub/rampas": { "etiqueta": "SUPUESTO", "fuente": "Capacidad de rampa sin valor publicado (realismo-logistico.md §2.6).", "fecha": "2026-10-17" },
    "/hub/planClasificacion": { "etiqueta": "SUPUESTO", "fuente": "Pesos de rutas de ejemplo, decrecientes como un reparto tipo Zipf.", "fecha": "2026-10-17" },
    "/hub/sorter": { "etiqueta": "ESTIMACION", "fuente": "Velocidad 2 m/s y paso 0,6 m dentro de los rangos de tilt tray publicados (2,03 m/s en 1999; 1,8–2,5 m/s en cross belt).", "fecha": "2026-10-17" }
  },
  "calendario": { "inicio": "22:00", "fin": "30:00", "corte": "25:30" },
  "demanda": {
    "camiones": { "serie": true, "cantidad": 10, "primero": "22:00", "cada": 900, "paquetes": 800 },
    "desvio": "@desvioCamion",
    "errorPronostico": { "cv": "@errorPronosticoCv" },
    "atrasoComun": { "probabilidad": "@probAtrasoComun", "demora": "@demoraAtrasoComun" },
    "papeleo": "@papeleoCamion"
  },
  "hub": {
    "andenes": [
      { "id": "A1", "x": -14, "y": -12, "personas": 2 },
      { "id": "A2", "x": -8, "y": -12, "personas": 2 },
      { "id": "A3", "x": -2, "y": -12, "personas": 2 }
    ],
    "playa": { "capacidad": 6 },
    "cintas": [
      { "id": "C1", "desde": "A1", "velocidad": 1, "paso": 0.6, "puntos": [[-14, -10], [-14, -3], [-2, -3]] },
      { "id": "C2", "desde": "A2", "velocidad": 1, "paso": 0.6, "puntos": [[-8, -10], [-8, -3], [-2, -3]] },
      { "id": "C3", "desde": "A3", "velocidad": 1, "paso": 0.6, "puntos": [[-2, -10], [-2, -3]] }
    ],
    "acumulacion": { "largo": 72, "paso": 0.6, "x": -1, "y": -2 },
    "sorter": {
      "id": "S1",
      "tipo": "bandeja-basculante",
      "forma": "estadio",
      "recta": 30,
      "radio": 4,
      "origen": [0, 0],
      "paso": 0.6,
      "velocidad": 2,
      "maxVueltas": 3,
      "lector": { "s": 9, "noLeido": "@noLeido" },
      "paradas": { "activas": true, "entre": "@paradaLazoEntre", "duracion": "@paradaLazoDuracion" }
    },
    "induccion": {
      "puestos": [
        { "id": "I1", "s": 0.5 },
        { "id": "I2", "s": 2 },
        { "id": "I3", "s": 3.5 },
        { "id": "I4", "s": 5 },
        { "id": "I5", "s": 6.5 }
      ],
      "tiempo": "@induccionBase"
    },
    "rampas": [
      { "id": "R01", "s": 12, "lado": -1, "capacidad": 20 },
      { "id": "R02", "s": 15, "lado": -1, "capacidad": 20 },
      { "id": "R03", "s": 18, "lado": -1, "capacidad": 20 },
      { "id": "R04", "s": 21, "lado": -1, "capacidad": 20 },
      { "id": "R05", "s": 24, "lado": -1, "capacidad": 20 },
      { "id": "R06", "s": 27, "lado": -1, "capacidad": 20 },
      { "id": "R07", "s": 44, "lado": 1, "capacidad": 20 },
      { "id": "R08", "s": 47, "lado": 1, "capacidad": 20 },
      { "id": "R09", "s": 50, "lado": 1, "capacidad": 20 },
      { "id": "R10", "s": 53, "lado": 1, "capacidad": 20 },
      { "id": "R11", "s": 56, "lado": 1, "capacidad": 20 },
      { "id": "R12", "s": 59, "lado": 1, "capacidad": 20 }
    ],
    "excepcion": { "id": "RX", "s": 66 },
    "planClasificacion": {
      "multiRampa": "la-menos-llena",
      "rutas": [
        { "id": "Ruta 01", "peso": 0.2, "rampas": ["R01", "R07"] },
        { "id": "Ruta 02", "peso": 0.15, "rampas": ["R02", "R08"] },
        { "id": "Ruta 03", "peso": 0.12, "rampas": ["R03"] },
        { "id": "Ruta 04", "peso": 0.1, "rampas": ["R04"] },
        { "id": "Ruta 05", "peso": 0.09, "rampas": ["R05"] },
        { "id": "Ruta 06", "peso": 0.08, "rampas": ["R06"] },
        { "id": "Ruta 07", "peso": 0.08, "rampas": ["R09"] },
        { "id": "Ruta 08", "peso": 0.07, "rampas": ["R10"] },
        { "id": "Ruta 09", "peso": 0.06, "rampas": ["R11"] },
        { "id": "Ruta 10", "peso": 0.05, "rampas": ["R12"] }
      ]
    },
    "perfilPaquete": {
      "clases": [
        { "id": "chico", "fraccion": 0.7, "bandejas": 1, "transportable": true },
        { "id": "mediano", "fraccion": 0.22, "bandejas": 1, "transportable": true },
        { "id": "grande", "fraccion": 0.06, "bandejas": 2, "transportable": true },
        { "id": "no-transportable", "fraccion": 0.02, "bandejas": 1, "transportable": false }
      ]
    },
    "jaulas": { "capacidad": 60, "cierre": "@cierreJaula" }
  },
  "personas": {
    "induccion": {
      "puestosActivos": 3,
      "temporarios": 0,
      "reten": 0,
      "antiguedadSemanas": 26,
      "ausentismo": "@ausentismo",
      "eficienciaTemporario": "@eficienciaTemporario",
      "pausas": { "duracion": 900, "cada": 7200, "primera": 7200, "escalon": 600 }
    },
    "descarga": { "ritmo": "@ritmoDescarga" },
    "rampa": {
      "cantidad": 6,
      "asignacion": "por-volumen",
      "regla": "la-mas-llena",
      "manejo": "@manejoRampa",
      "caminar": "@caminarEntreRampas",
      "pausas": { "duracion": 900, "cada": 7200, "primera": 7800, "escalon": 600 },
      "ausentismo": "@ausentismo"
    },
    "excepcion": { "cantidad": 1, "tiempo": "@tiempoManual" },
    "fatiga": { "activa": false, "maximo": "@fatigaMaxima", "tau": "@fatigaTau" }
  },
  "costos": { "horaPersona": "@costoHoraPersona", "fijoNoche": "@costoFijoNoche", "moneda": "ARS" },
  "decision": {
    "id": "dotacion-induccion",
    "pregunta": "¿Cuántos puestos de inducción hacen falta para no perder el corte?",
    "tipo": "dotacion",
    "variable": { "ruta": "/personas/induccion/puestosActivos", "min": 2, "max": 5 },
    "restriccion": { "kpi": "pendientesAlCorte", "comparador": "<=", "umbral": 0, "probabilidadMinima": 0.9, "dichoComo": "perder el corte como mucho 1 noche de cada 10" },
    "objetivo": { "minimizar": "costoNoche" },
    "indiferencia": { "kpi": "costoNoche", "valor": 20000 },
    "confianza": 0.95
  },
  "escenarios": [
    { "id": "base", "titulo": "Como está hoy", "parche": [] },
    { "id": "mas-un-puesto", "titulo": "Un puesto de inducción más", "parche": [{ "op": "replace", "path": "/personas/induccion/puestosActivos", "value": 4 }] },
    { "id": "reten", "titulo": "Una persona de retén que cubre faltas", "parche": [{ "op": "replace", "path": "/personas/induccion/reten", "value": 1 }] },
    { "id": "rampas-contiguas", "titulo": "Cada persona de rampa con rampas vecinas", "parche": [{ "op": "replace", "path": "/personas/rampa/asignacion", "value": "contiguas" }] },
    { "id": "pico", "titulo": "Pico de evento: 50% más paquetes por camión", "parche": [{ "op": "replace", "path": "/demanda/camiones/paquetes", "value": 1200 }] }
  ],
  "experimento": {
    "semilla": 20261017,
    "replicasMin": 20,
    "replicasMax": 400,
    "confianza": 0.95,
    "precision": { "kpi": "esperaP90Min", "relativa": 0.05 },
    "nochesEscena": 100,
    "nocheMostrada": "mediana",
    "kpiNoche": "finClasificacionMin"
  }
}
```

**Borrador analítico F0 esperado para este modelo** (lo calcula `modelo/f0.ts`; la prueba exige estos valores con error relativo ≤ 1e-9):

| Campo de `EstimacionF0` | Fórmula (§6.10) | Valor |
|---|---|---|
| `llegadaMediaPorHora` | 8.000 paquetes ÷ (10 camiones × 900 s) | 3.200 |
| `capacidadDescargaPorHora` | 6 personas × 3.600 ÷ 5 s | 4.320 |
| `capacidadInduccionPorHora` | 3 puestos × 3.600 ÷ 2,4 s × (1 − 900 ÷ 7.200) | 3.937,5 |
| `capacidadSorterTeoricaPorHora` | 2 ÷ 0,6 × 3.600 ÷ 1,06 bandejas por paquete | 11.320,7547… |
| `capacidadRampasPorHora` | 6 × 3.600 ÷ (3 s + 60 s ÷ 60) × (1 − 900 ÷ 7.200) | 4.725 |
| `cuello` | el mínimo | `'induccion'` |
| `utilizacion` | 3.200 ÷ capacidad | descarga 0,74074 · inducción 0,81270 · sorter 0,28267 · rampas 0,67725 |
| `finEstimado` | 22:00 + max(2,5 h; 8.000 ÷ 3.937,5 h) | `'24:30'` |

**La plantilla grande `hub-lazo-noche@1.0.0`** (24.000 paquetes; la que abre el enlace de portada) la genera `hub/plantillas/generar.ts`
desde el ejemplo con estas reglas, y se guarda como JSON inmutable: 26 camiones de 923 paquetes desde las 22:00 cada 15 min; 4 andenes de 2
personas; acumulación de 96 m (160 lugares); 6 puestos físicos, 4 con persona; lazo de 70 m de recta y radio 40 ÷ 2π (300 bandejas);
60 rampas de capacidad 25 (25 abajo y 35 arriba, como la maqueta); 50 rutas con pesos 1 ÷ (r+1)^0,7 normalizados, las 10 más pesadas con dos
rampas; 15 personas de rampa por volumen; 2 puestos manuales; corte a las 06:00 (`30:00`); los mismos parámetros. Las dos plantillas son
públicas y nunca cambian: una versión nueva es otro id@versión.

---

## 6. Semántica del motor y del hub (la especificación escrita)

Es la «Test262» del motor: lo que acá se fija decide la huella. La referencia del Anexo B la implementa al pie de la letra para el núcleo.

### 6.1 Orden de los eventos

- Clave total: **(t, fase, prioridad, seq)**, todo ascendente. `seq` es global y creciente (lo asigna `agendar`).
- Fases: `URGENTE` (0) → `NORMAL` (1) → `TARDIA` (2). Prioridad: entero, menor primero; por defecto 0.
- `agendar` lanza error si t no es entero o si t < ahora. El horizonte excluye eventos con t > `hasta`.
- Guardianes: `maxEventos` (50 M por defecto) → estado `'tope-eventos'`; `maxMismoInstante` (1 M) eventos seguidos con el mismo t →
  `'lazo-tiempo-cero'`. El simulador del hub los pasa a `alertas`.

### 6.2 Tiempo

Todo tiempo del modelo está en segundos; el motor trabaja en milisegundos enteros. **Toda** conversión usa `aMs` (`Math.round(s · 1000)`).
Las duraciones sorteadas se convierten en el momento de agendar. El paso del lazo es `tick = aMs(paso ÷ velocidad)` (300 ms en las dos
plantillas). Las horas «HH:MM» se leen con `horaASeg`.

### 6.3 Direcciones del azar del hub (ninguna depende del orden de los eventos)

| Qué se sortea | `claveDe(ruta, propósito)` | a | b | c | Distribución |
|---|---|---|---|---|---|
| Factor de volumen del día | `('demanda', 'errorPronostico')` | 0 | 0 | 0 | lognormal(media 1, cv) |
| ¿Hay atraso común? | `('demanda', 'atrasoComun')` | 0 | 0 | 0 | bernoulli(probabilidad) |
| Demora común | `('demanda', 'demoraComun')` | 0 | 0 | 0 | `demanda.atrasoComun.demora` |
| Desvío del camión | `('demanda', 'desvio')` | camión | 0 | 0 | `demanda.desvio` |
| Ritmo de descarga del paquete | `('personas.descarga', 'ritmo')` | camión | índice | 0 | `personas.descarga.ritmo` |
| Ruta del paquete | `('hub.planClasificacion', 'ruta')` | camión | índice | 0 | discreta(pesos de las rutas) |
| Clase de tamaño | `('hub.perfilPaquete', 'clase')` | camión | índice | 0 | discreta(fracciones) |
| Tiempo base de inducción | `('hub.induccion', 'tiempo')` | camión | índice | intento | `hub.induccion.tiempo` |
| Lectura (NO-READ) | `('hub.sorter', 'lectura')` | camión | índice | intento | bernoulli(noLeido) |
| Manejo en la rampa | `('personas.rampa', 'manejo')` | camión | índice | 0 | `personas.rampa.manejo` |
| Tiempo en el puesto manual | `('personas.excepcion', 'tiempo')` | camión | índice | intento | `personas.excepcion.tiempo` |
| Ausencia de una persona | `('personas.<rol>', 'ausencia')` | ordinal de la persona en su rol | 0 | 0 | bernoulli(ausentismo) |
| Tiempo hasta la parada n | `('hub.sorter', 'paradaEntre')` | n | 0 | 0 | `sorter.paradas.entre` |
| Duración de la parada n | `('hub.sorter', 'paradaDuracion')` | n | 0 | 0 | `sorter.paradas.duracion` |

`camión` es el ordinal del camión en el orden del modelo (0…), `índice` el del paquete dentro del camión (0…), `intento` cuántas veces se
indujo el paquete antes (0 la primera, 1 después del puesto manual). Los roles de ausencia son `induccion`, `reten`, `rampa`, `descarga`,
`excepcion`. Con estas direcciones, agregar un puesto, cambiar la capacidad de una rampa o la asignación de personas **no cambia ningún
atributo de ningún paquete ni ninguna falta** (pruebas R05a y R05b).

### 6.4 Huella de la corrida

Por cada evento procesado, en orden, se mezclan cinco palabras de 32 bits: `t mod 2³²`, `floor(t / 2³²)`, `bloque`, `tipo`, `arg` (las tres
últimas con `>>> 0`). Dos carriles: `h1 = imul(h1 ^ w, 0x01000193) >>> 0` (inicio `0x811c9dc5`) y
`h2 = imul(h2 ^ w, 0x85ebca6b) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0` (inicio `0xc2b2ae35`). La huella es `hex8(h1) + hex8(h2)`.
La **huella agregada** de varias réplicas aplica los mismos dos carriles a los códigos de los caracteres de las huellas, en orden de índice.

### 6.5 Foto

Contiene `ahora`, `seq`, `eventos`, los dos carriles de la huella, el calendario en columnas y, por ruta de bloque, lo que devuelve
`estado()`. `restaurar()` exige el mismo conjunto de bloques registrados en el mismo orden. Prueba: correr hasta T, fotografiar, restaurar en
un motor nuevo con bloques nuevos y seguir da la misma huella final que la corrida continua (R06).

### 6.6 Distribuciones (fórmulas exactas; uᵢ = `uniforme(d, i)`)

| Tipo | Fórmula | Uniformes |
|---|---|---|
| fija | valor | 0 |
| uniforme | min + (max − min)·u₀ | 1 |
| exponencial | −media · log(u₀) | 1 |
| triangular | F = (moda − min)/(max − min); u₀ < F ? min + √(u₀(max − min)(moda − min)) : max − √((1 − u₀)(max − min)(max − moda)) | 1 |
| normal | media + desvío · √(−2 log u₀) · cos(2π u₁), recortada a [min, max] si se dan | 2 |
| lognormal | s² = log(1 + cv²); exp(log(media) − s²/2 + √s² · √(−2 log u₀) · cos(2π u₁)) | 2 |
| erlang | −(media/k) · Σᵢ log(uᵢ), i = 0…k−1 | k |
| weibull | escala · exp(log(−log u₀) / forma) | 1 |
| bernoulli | u₀ < p ? 1 : 0 | 1 |
| discreta | primer i con u₀ ≤ Σ_{j≤i} pesoⱼ / Σ pesos (búsqueda lineal o binaria, mismo resultado) | 1 |
| empírica | pos = u₀ (n − 1); i = ⌊pos⌋; vᵢ + (pos − i)(vᵢ₊₁ − vᵢ) | 1 |

`uniforme(d, i)`: bloque Philox `sub = i >> 1` con clave `(semilla, d.clave)` y contador `(réplica, d.a, d.b, (d.c & 0xffffff)·256 + sub)`;
con salida (x₀, x₁, x₂, x₃), si i es par se usa (x₀, x₁) y si es impar (x₂, x₃): `u = ((hi >>> 5)·2²⁶ + (lo >>> 6) + 0,5) / 2⁵³`, siempre
en (0, 1).

### 6.7 Reglas del hub (F3)

1. **Calendario del turno.** `inicio`, `fin` y `corte` con `horaASeg`. Horizonte: `fin + 8 h`. La gente trabaja mientras haya paquetes; las
   horas pagadas son `max(fin − inicio, último paquete − inicio)` por persona presente (y el retén).
2. **Ausencias** (en `inicio`, fase URGENTE): se sortean para todas las personas de todos los roles. El retén cubre, en este orden, los
   puestos de inducción ausentes (de menor a mayor índice) y después las personas de rampa ausentes. Un retén que cubre inducción rinde como
   planta (eficiencia 1).
3. **Camiones.** Llegada = turno + desvío + (demora común si la noche tiene atraso común). Paquetes del camión = `round(paquetes × factor del
   día)`. Puede llegar antes de `inicio`, pero se descarga desde `inicio`. Si no hay andén libre, espera en la playa (FIFO por llegada). Al
   terminar el último paquete, `papeleo` segundos y el andén queda libre.
4. **Descarga.** Andén con p personas: el paquete i tarda `ritmo(i) ÷ p`; al terminar **nace** (tramo DESCARGA desde el inicio de su
   descarga) y entra a su cinta en `max(t, última entrada + paso ÷ velocidad)`; viaja `largo ÷ velocidad` (tramo CINTA). Antes de empezar
   cada paquete, si `en acumulación + en cintas ≥ capacidad de la acumulación` (`floor(largo ÷ paso + 1e-9)`), el andén **para** (contrapresión;
   el tramo DESCARGA que sigue lleva causa BLOQUEO si estuvo parado) y vuelve cuando la inducción saca un paquete.
5. **Acumulación** FIFO (tramo ACUMULACION con `a` = secuencia de entrada). Los **no transportables** se desvían al salir de la acumulación
   directo a la cola manual (COLA_MANUAL, causa NO_TRANSPORTABLE), sin pasar por inducción.
6. **Inducción.** Puestos con persona: los primeros `puestosActivos` en el orden del modelo; los últimos `temporarios` de esos son
   temporarios (eficiencia `eficienciaTemporario`). Un puesto libre toma el primero de la fila. Tiempo = base del paquete × factor de fatiga
   (1 + máximo · (1 − exp(−(t − última pausa) / τ)) si está activa; si no, 1) ÷ eficiencia. Después espera bandeja (ESPERA_BANDEJA).
   **Pausas:** la persona i de un rol las tiene en `inicio + primera + i·escalón + m·cada` (m = 0, 1, …) mientras sean < `fin`; si está
   ocupada, la pausa espera a que termine la tarea y dura lo mismo.
7. **Plan de clasificación y personas de rampa.** Peso esperado de una rampa = peso de su ruta ÷ cantidad de rampas de la ruta.
   - `'por-volumen'`: rampas de mayor a menor peso (empate: orden del modelo), cada una a la persona presente con menos carga (empate: menor
     índice).
   - `'contiguas'`: la rampa r (orden del modelo) a la persona `floor(r · n ÷ R)`; las rampas de una persona ausente sin cubrir pasan a la
     siguiente presente.
   - lista explícita: como dice; las de una ausente sin cubrir, a la siguiente presente.
   `planBalanceado(m)` devuelve el parche que pone `'por-volumen'`.
8. **Sorter.** `T = round(largo ÷ paso)` bandejas; la bandeja j está en el paso k en la ranura `(j + k) mod T`; la ranura de un punto a
   distancia s es `round(s ÷ paso) mod T`. La estación de ranura σ ve la bandeja `(σ − k) mod T`. El lazo marcha de forma continua desde
   `inicio` salvo en las paradas; los eventos de paso (fase NORMAL, prioridad 9: después de los demás eventos del mismo instante) solo se
   agendan mientras hay paquetes en bandejas o esperando bandeja, pero el contador k avanza igual (se recalcula al volver la actividad).
   En cada paso, las estaciones se recorren en orden del modelo: un paquete de una bandeja necesita la bandeja que ve libre; uno de dos, esa
   y la siguiente que llegará (`(σ − k − 1) mod T`), y ocupa las dos.
9. **Al colocar:** lectura (intento del paquete); NO-READ → destino excepción. Si no, la rampa de su ruta (`'la-menos-llena'`: menor
   ocupación más en camino, empate por orden; `'alternar'`: rotación por ruta). Se agenda en la rueda para el paso
   `k + ((ranura destino − ranura estación) mod T)` (si da 0, `k + T`). Tramo BANDEJA con `a` = 0.
10. **Al pasar por la rampa destino:** si `ocupación < capacidad`, cae (libera su o sus bandejas; tramo RAMPA con `q` = la persona asignada).
    Si no, **una vuelta más** (`vueltasExtra` + 1; se cierra el tramo BANDEJA y se abre otro con `a` = vueltas, causa RAMPA_LLENA y
    `q = refDe(RAMPA, r)`); con `maxVueltas = m`, a la vuelta número m + 1 va a excepción (un paquete con la rampa siempre llena suma m + 1).
    La excepción acepta siempre.
11. **Personas de rampa.** Una persona libre elige entre sus rampas con paquetes según la regla: `'la-mas-llena'` (mayor ocupación; empate:
    orden), `'la-que-se-llena-antes'` (menor (capacidad − ocupación) ÷ peso esperado; empate: orden), `'en-orden'` (la siguiente con
    paquetes después de la última atendida). Si cambia de rampa, camina `caminar` s (PERSONA_CAMINA). Manejo del paquete (MANO) → jaula
    (JAULA). Al completar la jaula, la cierra (`cierre` s, PERSONA_CIERRA_JAULA) y empieza otra. Pausas como en la regla 6.
12. **Excepción.** Puestos manuales FIFO: tiempo manual del paquete (intento); después, si es transportable, vuelve al final de la
    acumulación con intento + 1 y su lectura ya no falla; si no es transportable, va directo a la jaula de la primera rampa de su ruta y cuenta
    como clasificado.
13. **Micro-paradas** (si `activas`): la parada n empieza `entre(n)` segundos después del fin de la anterior (la primera, desde `inicio`), en
    fase URGENTE, y dura `duracion(n)`; durante la parada no hay pasos (tramo LAZO_DETENIDO, causa FALLA) y al volver la grilla de pasos
    sigue desde el reinicio: el paso kₚ + i ocurre en `t_reinicio + i·tick`. Todo lo que estaba en bandejas se atrasa lo mismo.
14. **Corte** (fase TARDIA): momento CORTE; los KPI «al corte» cuentan los paquetes con `0 ≤ listo ≤ corte`.
15. **Medición** (fase TARDIA, cada 15 min desde `inicio`): máximo de la acumulación en el cuarto de hora y paquetes que entraron a jaula.
16. **Invariantes** que el simulador controla en cada noche y pasa a `alertas` si fallan: `conservacion` (nacidos = en jaula + adentro al
    final), `invariante:rampa-capacidad` (nunca más que la capacidad), `invariante:bandeja-unica` (una bandeja, a lo sumo un paquete),
    `invariante:tiempo` (todo tramo con t1 ≥ t0 y los tramos de un paquete encadenados sin huecos), `invariante:pausa` (nadie trabaja en
    pausa), `no-termina` (quedó trabajo en el horizonte).

### 6.8 Eventos del hub y momentos

El paquete del hub elige sus bloques y la numeración de sus tipos de evento y los documenta en `hub/README.md` (entran en las doradas). Lo
que se fija acá son las fases y prioridades, porque deciden el resultado:

| Evento | Fase | Prioridad |
|---|---|---|
| Ausencias y retén (en `inicio`); inicio y fin de una micro-parada; inicio de una pausa | URGENTE | 0 |
| Llegada de camión; fin de la descarga de un paquete; llegada a la acumulación; fin de inducción; fin de manejo, de caminata o de cierre de jaula; fin del manual; fin de una pausa; andén libre | NORMAL | 0 |
| Paso del lazo | NORMAL | 9 |
| Corte; medición de cada cuarto de hora | TARDIA | 0 |

Momentos que el hub emite en la traza: CAMION_LLEGA (v = minutos de atraso respecto del turno), CAMION_ATRASADO (si el atraso > 15 min),
ATRASO_COMUN (v = minutos), RAMPA_LLENA y RAMPA_LIBERA (r = rampa), LAZO_PARA y LAZO_ARRANCA, PAUSA_INICIO y PAUSA_FIN (r = persona),
AUSENCIA (r = persona), REEMPLAZO (r = retén, v = persona cubierta), JAULA_CERRADA (r = rampa), CORTE, PRIMER_PAQUETE,
ULTIMO_CLASIFICADO, ACUMULACION_LLENA y ACUMULACION_LIBERA.

### 6.9 Indicadores (definiciones exactas)

| KPI | Definición |
|---|---|
| paquetes | Paquetes nacidos |
| clasificados | Paquetes con `listo ≥ 0` (en jaula) al horizonte |
| pendientesAlCorte | paquetes − #(0 ≤ listo ≤ corte) |
| pctAlCorte | 100 · (paquetes − pendientesAlCorte) ÷ paquetes |
| todoAntesDelCorte | 1 si pendientesAlCorte = 0; si no, 0 |
| finClasificacionMin | (máximo listo − inicio) ÷ 60.000 |
| recirculacionPct | 100 · vueltasExtra ÷ colocaciones en bandeja |
| vueltasExtra | Pasadas por la rampa destino llena |
| noLeidosPct | 100 · lecturas fallidas ÷ colocaciones |
| aExcepcion | Paquetes que llegaron a la excepción (NO-READ, vueltas máximas, no transportables) |
| esperaMediaMin, esperaP50Min, esperaP90Min | Sobre (listo − creado) ÷ 60.000 de los clasificados; P_q = x₍min(n−1, ⌊q·n⌋)₎ con x ordenado ascendente |
| utilInduccionPct | 100 · Σ tiempo induciendo ÷ (personas de inducción presentes · (fin − inicio)) |
| inductoresPresentes | Puestos con persona presente (propia o del retén) |
| ausentes | Personas ausentes de todos los roles (cubiertas o no) |
| horasRampaLlena | Σ de las rampas del tiempo con ocupación = capacidad, en horas |
| rampasQueSeLlenaron | Rampas que estuvieron llenas al menos una vez |
| paradasLazo · minutosLazoDetenido | Cantidad y duración total de micro-paradas |
| esperaPlayaMediaMin | Media sobre camiones de (andén asignado − llegada) ÷ 60.000 |
| horasPersonaPagadas | Regla 1 de §6.7 |
| costoNoche | horasPersonaPagadas · horaPersona + fijoNoche |
| costoPorPaquete | costoNoche ÷ max(1, clasificados) |

### 6.10 F0 y F2

- **F0** (`modelo/f0.ts`, sin azar): paquetes = Σ paquetes nominales; ventana = cantidad × cada (serie) o último − primero + mediana de los
  intervalos (lista); `llegadaMediaPorHora = paquetes ÷ ventana`. Descarga = Σ personas de andén × 3.600 ÷ media(ritmo). Inducción =
  puestosActivos × 3.600 ÷ media(tiempo) × (1 − duración ÷ cada). Sorter = velocidad ÷ paso × 3.600 ÷ Σ(fracción · bandejas) (F0 ignora
  que los no transportables no pasan por el sorter). Rampas = personas de rampa × 3.600 ÷ (media(manejo) + cierre ÷ capacidad de jaula) ×
  (1 − duración ÷ cada) (F0 ignora la caminata). `media(·)` de una distribución: su media analítica (lognormal: media; uniforme:
  (min + max)/2; triangular: (min + moda + max)/3; fija: valor; exponencial: media; erlang: media; normal: media). Cuello = la menor
  capacidad. `finEstimado = primer turno + max(ventana, paquetes ÷ capacidad del cuello)`, en formato `segAHoraLarga`.
- **F2** (`hub/f2.ts`): igual que F3 pero el lazo es una demora fija por paquete = (distancia en ranuras de la estación a la rampa) ×
  tick, sin bandejas (no hay espera de bandeja ni vueltas: las rampas no tienen tope). Sirve para la consistencia L07 y para el dominio de
  validez: «F2 reproduce a F3 con ρ de inducción ≤ 0,5 y sin rampas llenas».

---

## 7. Estadística (definiciones exactas)

| Qué | Definición |
|---|---|
| Confianzas admitidas | 0,90 · 0,95 · 0,99 (otras lanzan error) |
| Cuantil normal | z = 1,6448536269514722 · 1,959963984540054 · 2,5758293035489004 |
| Cuantil de t | Tabla precalculada (`tabla-t.json`) para ν = 1…200 y las tres confianzas, generada con la beta incompleta regularizada y bisección; para ν > 200, Cornish-Fisher: t ≈ z + (z³ + z)/(4ν) + (5z⁵ + 16z³ + 3z)/(96ν²). Control: t(0,975; ν) = 12,7062 · 4,3027 · 2,5706 · 2,2281 · 2,0930 · 2,0423 · 1,9840 para ν = 1, 2, 5, 10, 19, 30, 100 |
| IC de la media | x̄ ± t(1 − α/2; n − 1) · s ÷ √n, con s la desviación muestral (n − 1). n ≥ 2 |
| Wilson | centro = (p̂ + z²/2n) ÷ (1 + z²/n); semiancho = z · √(p̂(1 − p̂)/n + z²/4n²) ÷ (1 + z²/n). Control: 19 de 20 → [0,7639; 0,9911]; 97 de 100 → [0,9155; 0,9897] |
| Percentil | P_q = x₍min(n−1, ⌊q·n⌋)₎ con x ordenado |
| IC del P90 | rangos l = ⌊nq − z√(nq(1−q))⌋ y u = ⌈nq + z√(nq(1−q))⌉ recortados a [0, n−1]; null si n < 20 |
| MSER-5 | Lotes de 5 sobre la **serie promedio entre réplicas**; para d = 0…⌊m/2⌋ lotes, MSER(d) = Σ_{j>d}(Y_j − Ȳ_d)² ÷ (m − d)²; se elige el mínimo |
| Pareada | Zᵢ = Bᵢ − Aᵢ (misma semilla y réplica, si no lanza); IC de t sobre Z; `b-mejor` si el IC excluye el 0 en el sentido bueno del KPI (`META_KPI.mejor`), `a-mejor` al revés, si no `no-se-distingue` con `replicasSugeridas = ⌈n · (semiancho ÷ (|media|/2))²⌉` |
| Estado de una configuración | `cumple` si el extremo inferior de Wilson ≥ meta; `no-cumple` si el superior < meta; si no, `en-duda` |
| Réplicas secuenciales | `replicasIniciales` (20) por valor; después tandas (`tanda` = 20) solo a los valores en duda, con índices de réplica que siguen, hasta que ninguno queda en duda o se llega a `replicasMax` (400) por valor |
| Recomendación | El menor valor que `cumple` si todos los menores `no-cumplen`; si alguno sigue `en-duda`, null |

**Semáforo:**

| Color | Motivo | Cuándo |
|---|---|---|
| rojo | `modelo-con-errores` | El compilador dio algún error |
| rojo | `conservacion`, `invariante`, `inestable` | Alguna réplica trae esa alerta (`no-termina` cuenta como `inestable`) |
| amarillo | `decision-en-duda` | Hay recomendación pendiente: algún valor relevante quedó en duda al llegar a `replicasMax` |
| amarillo | `pocas-replicas` | Menos de 20 réplicas |
| amarillo | `precision-no-lograda` | Se pidió precisión (`experimento.precision`) y el semiancho relativo no la alcanzó |
| verde | `ok` | Nada de lo anterior |

**Comprobante:** receta (huella del modelo, versión del motor, semilla, réplicas, noche, instante, velocidad, escenarios), huella agregada,
motor (versión, pruebas exigibles, cuántas pasaron, fecha de la batería), modelo (controles, pasaron, avisos), semáforo, procedencia (cuántos
parámetros de cada etiqueta) y validación (`'sin-validar'` en todo el corte 1).

---

## 8. La batería de validación

Criterio de aprobación de cada prueba estocástica: **|error| ≤ 3,29 errores estándar y error relativo ≤ 3% (≤ 2% en probabilidades)**, con
réplicas y horizontes que den un semiancho del 95% ≤ 2% del valor (≤ 1% en probabilidades); como mínimo, los de
`conocimiento/anden-simulador-2026-10/medicion-motor/validacion.js`. Las deterministas, exactas (error relativo ≤ 1e-9). Política de falsa
alarma: con 85 pruebas a 3,29 errores estándar, P(alguna falla por azar) ≈ 1 − 0,999⁸⁵ ≈ 8% por corrida (cuenta); una falla se re-corre
sola con otra semilla y 4 veces más réplicas, y es error del motor solo si vuelve a fallar. IDs únicos (el juez arquitecto encontró
repetidos en la maqueta). Unidad de tiempo = tiempo medio de servicio (μ = 1) salvo indicación.

| ID | Prueba | Esperado | Suite | Dueño |
|---|---|---|---|---|
| V01a–V05a | M/M/1 ρ = 0,5: Wq · L · ocupación · P(esperar) · Little (L − λW) | 1 · 1 · 0,5 · 0,5 · 0 (Little: \|·\| ≤ 3,29 ee) | completa | P2 |
| V01b–V05b | M/M/1 ρ = 0,8 | 4 · 4 · 0,8 · 0,8 · 0 | completa | P2 |
| V01c–V05c | M/M/1 ρ = 0,9 | 9 · 9 · 0,9 · 0,9 · 0 | completa | P2 |
| V06a–V07a | M/M/3, λ = 2,4: Erlang C · Wq | 0,64719 · 1,07865 | completa | P2 |
| V06b–V07b | M/M/5, λ = 4,5 | 0,76249 · 1,52499 | completa | P2 |
| V06c–V07c | M/M/50, λ = 45 | 0,36386 · 0,072773 | completa | P2 |
| V08 | M/D/1 ρ = 0,9: Wq (Pollaczek-Khinchine) | 4,5 | completa | P2 |
| V09 | M/G/1 lognormal (media 1, cv 1,5), ρ = 0,7: Wq | 3,79167 | completa | P2 |
| V10 · V11 | D/M/1 ρ = 0,9 (σ = e^{−(1−σ)/ρ} = 0,80690): Wq · P(esperar) | 4,17866 · 0,80690 | completa | P2 |
| V13 · V14 | M/M/2/5, λ = 2: P(rechazo) · L | 0,181818 · 2,72727 | completa | P2 |
| V15 | M/M/10/10, 7 Erl: Erlang B | 0,078741 | completa | P2 |
| V16 | M/G/10/10 lognormal cv = 2: insensibilidad de Erlang B | 0,078741 | completa | P2 |
| V17 · V18 | Prioridad sin preempción (Cobham), λ = (0,3; 0,5): Wq alta · baja | 1,14286 · 5,71429 | completa | P2 |
| V19 · V20 | Prioridad con preempción y reanudación: tiempo en sistema alta · baja | 1,42857 · 7,14286 | completa | P2 |
| V21 · V22 | Red de Jackson (λ = 1; nodo 1 M/M/2 μ = 1 → 70% al 2 y 30% al 3; nodo 2 M/M/1 μ = 1,2 → 20% vuelve al 1; nodo 3 M/M/1 μ = 0,5): L total · W total | 6,17266 · 6,17266 | completa | P2 |
| V23a–V23c | Ídem: L₁ · L₂ · L₃ | 1,75654 · 2,10843 · 2,30769 | completa | P2 |
| V24a–V24c | Penny Fab determinista (4 estaciones de 2 h, 1 máquina), N = 2, 4, 6: TH y CT | 0,25/h y 8 h · 0,5/h y 8 h · 0,5/h y 12 h (exactas, error ≤ 0,1% por el arranque) | rápida | P2 |
| V25 · V26 | Línea exponencial balanceada N = 4: TH · CT | 0,285714/h · 14 h | completa | P2 |
| V27 | Red cerrada desbalanceada (1; 2; 1,5; 0,5 h), N = 5, MVA: TH | 0,437838/h | completa | P2 |
| V28a–V28d | M_t/M/∞, λ̄ = 20/h, β = 0,6, ciclo 24 h, μ = 1/h: E[N(t)] en t = 48, 54, 60, 66 h (400 réplicas) | 17,060 · 31,230 · 22,940 · 8,770 | completa | P2 |
| V29 | Ídem: varianza/media de N(t) | 1 (± 3,29 ee) | completa | P2 |
| V30 | Fuente finita: 5 máquinas, falla 0,1/h, 1 reparador a 1/h: máquinas rotas en promedio | 0,639522 | completa | P2 |
| C01 | Law (WSC 2023): oficina 9–17 h, 5 empleados, llegadas exp(1 min), servicio exp(4,5 min), atiende hasta vaciarse: demora media | Dentro de [4,58; 6,78] (publicado 5,68 ± 1,10) | completa | P2 |
| C03 | Ídem: diferencia 5 contra 6 empleados, pareada | Dentro de [3,40; 5,38] (4,39 ± 0,99) | completa | P2 |
| C04 | Law: fábrica, máquina U[0,65; 0,70] + inspector U[0,75; 0,80], 10% de retrabajo, fallas exp(6 h) por calendario, reparación U[8; 12] min con reanudación: horas para 2.000 piezas | Dentro de [32,69; 33,81] (33,25 ± 0,56) | completa | P2 |
| D01 | Degenerada: M/M/1 λ = 1,2, μ = 1: la cola crece con pendiente λ − μ | 0,2 (± 5%) | rápida | P2 |
| M01 | Metamórfica: multiplicar por 60 todas las duraciones y dividir por 60 todas las tasas (misma semilla) | Todos los KPI de tiempo × 60 con error relativo ≤ 1e-6 | rápida | P2 |
| M02 | Conservación por bloque: entraron = salieron + adentro, en cada caso de la batería | Exacta | rápida | P2 |
| R01 | Misma semilla y réplica → misma huella (cada caso de la batería y el hub chico, 5 semillas) | Idénticas | rápida | P2 · P4 |
| R02 | Números comunes: con 2 o con 3 servidores, las primeras 50 llegadas y sus servicios son idénticos | Idénticos | rápida | P2 |
| R03 | Otra réplica → otra huella | Distintas | rápida | P2 |
| R04 | La misma huella en Node y en Chromium (y en Firefox y WebKit si Playwright los instala) para los casos rápidos, el hub chico (5 semillas) y las doradas de matemática | Idénticas | integración | I |
| R05a | Agregar un puesto de inducción activo no cambia ruta, clase, tiempo base, manejo ni ninguna falta de ningún paquete (comparados uno a uno por (camión, índice)) | Idénticos | rápida | P4 |
| R05b | Bajar la capacidad de las rampas (más vueltas) no cambia la lectura de ningún (paquete, intento) | Idénticas | rápida | P4 |
| R06 | Foto a mitad de la corrida + restaurar en un motor nuevo → misma huella final (bloque sintético en P1; hub chico en I) | Idéntica | rápida · integración | P1 · I |
| R07 | Resumen idéntico bit a bit con 1 o con 3 trabajadores y llegadas desordenadas | Idéntico | rápida | P5 |
| K01a–K01d | Trapezoidal, vmáx 2 m/s, a 0,5 m/s²: 5 · 8 · 30 · 100 m | 6,3246 · 8,0000 · 19,0000 · 54,0000 s | rápida | P1 |
| K02a · K02b | Cinta de 42 m a 2 m/s con paso 0,6 m: tránsito · capacidad con descarga instantánea | 21,0 s · 12.000/h (± 1) | rápida | P4 |
| K03 | Acumulación de 42 m con paso 0,6 m y ningún puesto activo: paquetes que entran antes de que paren los andenes | 70 exacto | rápida | P4 |
| L01 | Lazo saturado (1 puesto con tiempo 0, rampas sin tope, sin NO-READ, todo de 1 bandeja, sin paradas): colocaciones por hora en régimen | velocidad ÷ paso × 3.600 = 12.000 (± 1) | rápida | P4 |
| L02 | Ídem con NO-READ 2%: caídas en la rampa correcta en la primera pasada por hora | 11.760 (± 3,29 ee binomial) | rápida | P4 |
| L03 | Ídem con 10% de paquetes de dos bandejas: paquetes por hora | 12.000 ÷ 1,10 = 10.909 (± 3,29 ee) | rápida | P4 |
| L04 | Una ruta con su rampa de capacidad 0 y maxVueltas = 3: vueltasExtra | N_ruta × 4, exacto | rápida | P4 |
| L05 | Rueda: un paquete colocado en el paso k desde la ranura σₑ cae en el paso k + ((σᵣ − σₑ) mod T) | Exacto | rápida | P4 |
| L06 | Parada forzada en el paso kₚ con reinicio en t′: el paso kₚ + i ocurre en t′ + i·tick y cada caída en tránsito se atrasa lo mismo | Exacto | rápida | P4 |
| L07 | Consistencia F2/F3 con ρ de inducción ≈ 0,3 y rampas sin tope: paquetes por hora y tiempo medio en el hub | Diferencia ≤ 2% (y ≤ 3,29 ee) | rápida | P4 |
| P02 | Ausentismo 5%: fracción de ausentes en 10.000 sorteos (2.000 noches × 5 personas; solo el sorteo, sin correr la noche) | 0,05 ± 0,0072 (3,29 ee) | rápida | P4 |
| S03 | Cobertura del IC del 95% con 10 réplicas independientes con borrado (M/M/1, W = 9) en 500 macro-experimentos | Entre 93,1% y 96,9% | integración | I |
| S08 | Whitt: T · Var(L̄) en M/M/1 ρ = 0,8 | 1.800 (dentro del IC del 95%) | integración | I |
| S09 | M/M/1 ρ = 0,8 con arranque estacionario y sin calentamiento: L | 4 (± 3,29 ee) | integración | I |
| S11 | MSER-5 sobre el promedio de 10 réplicas con arranque cargado (100 en sistema): sesgo de L | \|sesgo\| ≤ 3,29 ee (maqueta: +0,017 ± 0,144) | integración | I |
| S12 | Cobertura del IC de Wilson al 95% para p = 0,9 y n = 100 en 2.000 repeticiones | Entre 93% y 97% | rápida | P5 |
| S13 | Decisión con datos fijos: 19/20 con meta 0,9 → `en-duda`; 97/100 → `cumple`; 336/400 → `no-cumple` | Exacto | rápida | P5 |

**Demostraciones que tienen que fallar** (cuentan como aprobadas si fallan): S01, IC «ingenuo» con una sola corrida (cobertura < 90%; maqueta
8,4%); S02, medias por lotes con 20 lotes (cobertura < 90%; maqueta 82,2%). **Informativas** (se reportan, no deciden): V12a–V12d (Kingman
y Allen-Cunneen contra simulación: la maqueta midió +3,6% a +9%), C02 (Law con 6 empleados, 1,30 sin IC publicado), L08 (F0 contra F3
saturado: diferencia y explicación).

Cuenta de exigibles: V 50 + C 3 + D/M 3 + R 8 + K 7 + L 7 + P 1 + S 6 = **85**.

**Otras pruebas del corte** (no son de la batería del motor, pero son criterio de salida):
- **E01** (integración): hub chico con corte a las 00:30 y pausas de rampa de 45 min: en 50 réplicas, todo paquete que pierde el corte con
  una espera en rampa de ≥ 5 min superpuesta a una pausa tiene la causa PAUSA **confirmada** por el contrafactual «sin pausas de rampa».
- **E02** (integración): dos causas que se sobredeterminan (una micro-parada forzada de 40 min y pausas de rampa de 40 min, cada una
  suficiente para perder el corte): **ninguna** frase causal de una sola causa se muestra sin confirmar; la causa conjunta aparece solo si el
  contrafactual conjunto la confirma. 0 frases causales sin confirmar en 50 paquetes × 10 réplicas.
- **R08** (P1 y la integración): el núcleo de producción da la misma huella que la referencia de `contratos/` en los mismos modelos
  (sintéticos en P1; batería y hub en I).
- **I01–I06** (P4 con 20 noches por plantilla en `npm test`; la integración con 200 noches y el núcleo de producción): las invariantes de
  §6.7 regla 16: 0 alertas.
- **H01–H12** (P3): entradas hostiles rechazadas (§9, P3).

---

## 9. Los paquetes de trabajo

Todos los paquetes arrancan a la vez después del paso 0. Cada uno escribe **solo** en sus archivos (§2), corre `npm test` filtrando sus
pruebas (`node --test "<carpeta>/pruebas/*.test.ts"`) y termina con un commit propio. Las «pruebas de integración» las corre el paquete I,
pero el código que tiene que hacerlas pasar es del paquete que se indica.

### P1 · Núcleo determinista (`nucleo/`)

- **Objetivo.** El motor de producción: rápido, determinista entre motores de JavaScript y serializable.
- **Entrega** (`nucleo/indice.ts`): `crearMotor: CrearMotor`, `crearFuenteAzar(semilla, replica): FuenteAzar`, `claveDe: ClaveDe`,
  `det: MatematicaDeterminista`, `crearEscritorTraza(nivel): EscritorTraza`, `tiempoTrapezoidal: TiempoTrapezoidal`,
  `VERSION_MOTOR = '1.0.0'`, `philox4x32_10`.
- **Cómo.** Montículo en columnas de arreglos tipados que se agrandan duplicando (t Float64, fase Uint8, prioridad Int32, seq Float64,
  bloque/tipo/arg Int32); la clave de §6.1. Philox como en el Anexo B (medido: 25–41 M de uniformes por segundo). `det` con las
  adaptaciones de fdlibm de `oportunidades/proyectos/anden/medicion-sintesis/detmath.mjs` y `conocimiento/.../medicion-tecnologia/detlog.mjs`
  (`sin` con el mismo esquema que `cos`). Huella §6.4. Foto §6.5. Escritor de traza con columnas que se agrandan y `terminar()` que recorta a
  largo exacto; con nivel `'no'` o `'kpi'` no reserva memoria de tramos.
- **Pruebas propias.** Philox: los 3 vectores de Random123. `claveDe`: FNV-1a('a') = 0xe40c292c, ('foobar') = 0xbf9cf968. `uniforme`
  siempre en (0, 1) en 10⁶ sorteos; valores fijos para una dirección dada (dorados). Distribuciones: media y varianza dentro de 3,29 ee en
  10⁶ sorteos para las 11; consumo de uniformes igual a `CONSUMO` (contando bloques Philox pedidos). `det`: 0 diferencias de bits con
  `Math.*` de V8 en 10⁶ valores por función (log en (0,1) y en 10^±300; exp en (−700, 700); cos y sin en [0, 2π]; en ±1.000, informativo) y coincidencia
  exacta con `doradas-mat.json` (1.000 entradas por función, generadas una vez con `generar-doradas.ts`). Motor: orden (t, fase,
  prioridad, seq) con un bloque sintético; rechazo de tiempos no enteros y del pasado; `lazo-tiempo-cero` y `tope-eventos`; `correrHasta`;
  **R06** con un bloque sintético que agenda al azar; huella de una secuencia fija de 5 eventos (dorada); **R08a**: misma huella que
  `crearMotorReferencia` en 3 modelos sintéticos. **K01a–d.** Escritor: largos exactos, cierre de abiertos en `fin`, nivel `'no'`.
  Rendimiento (informativo): eventos por segundo de una M/M/1 sintética (meta ≥ 4 M/s en el contenedor de referencia).
- **Hecho cuando** todas pasan y una búsqueda de los tokens prohibidos de §1.4 en `nucleo/` (fuera de comentarios) da cero.
- **Tamaño.** ESTIMACIÓN: 900–1.400 líneas con pruebas; 1,5–2,5 h de agente.

### P2 · Verificación (`verificacion/`)

- **Objetivo.** La batería «Andén Verificado» y sus doradas, corriendo sobre cualquier implementación del contrato del motor.
- **Entrega.** `crearBateria(crearMotor: CrearMotor)` que devuelve `{ casos, correr(opciones) }`; `node verificacion/bateria.ts
  [--rapida|--completa] [--generar-doradas]` escribe `verificacion/informe/resultados.json` (por prueba: id, nombre, esperado, simulado,
  semiancho, z, error relativo, n, estado `'pasa' | 'falla' | 'informativa' | 'debe-fallar-ok'`) y `informe.html` (página local, estática,
  en español, no se publica).
- **Cómo.** `flujo/red.ts`: un bloque genérico de redes de colas (estaciones con c servidores, capacidad K, clases con prioridad,
  preempción con reanudación y clave original, ruteo probabilístico sorteado por (trabajo, visita), población cerrada, fuente finita,
  llegadas Poisson, deterministas o no homogéneas por adelgazamiento) con atributos sorteados al nacer y direcciones semánticas
  (`claveDe('red.<id>', ...)`). `monitores.ts`: promedios ponderados por tiempo y conteos. `formulas/colas.ts`: Erlang C y B, M/M/c/K,
  Pollaczek-Khinchine, σ de GI/M/1, Cobham, preempción con reanudación, Jackson, MVA, M_t/M/∞, fuente finita. Cada caso de §8 en
  `casos/` con id, esperado (calculado con `formulas/` cuando hay fórmula), tolerancia, réplicas y horizonte.
- **Pruebas propias.** `formulas/` reproduce cada valor esperado de §8 con error ≤ 1e-5. Suite rápida con `crearMotorReferencia`: V24a–c,
  D01, M01, M02, R01–R03 y las doradas (si `doradas.json` existe; si no, se generan y se commitean con `--generar-doradas`). La completa
  corre con `VERIFICAR=1` (no entra en `npm test`).
- **Pruebas de integración que tiene que hacer pasar.** La batería completa con el núcleo de producción; R08b (mismas huellas que con la
  referencia).
- **Hecho cuando** la suite rápida pasa con la referencia y la completa pasa con la referencia (todas las exigibles de su dueño).
- **Tamaño.** ESTIMACIÓN: 1.200–1.800 líneas; 2–3 h. Tiempo de la completa: ≤ 10 min en el contenedor (la maqueta de generadores tardó
  319 s; bloques compilados, más rápido).

### P3 · Modelo y enlace (`modelo/`)

- **Objetivo.** Que ningún número se calcule con un modelo inválido, y que ningún enlace hostil cuelgue un teléfono.
- **Entrega** (`modelo/indice.ts`): `compilar: Compilar`, `crearVariante(compilar): Variante`, `calcularF0: CalcularF0`,
  `estimarPresupuesto: EstimarPresupuesto`, `jsonCanonico: JsonCanonico`, `huellaModelo: HuellaModelo`, `aplicarParche: AplicarParche`,
  `crearCodec: CrearCodec`, `anonimizar: Anonimizar`; textos de diagnósticos en `textos.es.json` y `textos.en.json`.
- **Cómo.** Validador escrito a mano (sin dependencias) de todo `anden.modelo/1`: tipos, requeridos, ids únicos, referencias (`@param`,
  rampas, andenes, rutas), rangos de parámetros, números finitos, textos ≤ `maxLargoTexto` y sin caracteres de control, claves prohibidas
  (`__proto__`, `constructor`, `prototype`). Chequeos (código · nivel): `E-ESQUEMA`, `E-REF`, `E-RANGO`, `E-ID-DUPLICADO`,
  `E-S-FUERA-DEL-LAZO`, `E-RANURA-REPETIDA` (dos estaciones o rampas en la misma ranura), `E-FRACCIONES` (perfil ≠ 1 ± 1e-9),
  `A-PESOS` (rutas que no suman 1: se normalizan con aviso), `E-PUESTOS` (activos > físicos), `E-TEMPORARIOS`, `E-HORAS`, `E-PAUSAS`
  (duración ≥ cada), `E-RAMPA-SIN-PERSONA`, `E-RUTA-SIN-RAMPA`, `E-PRESUPUESTO`, `A-RHO` (alguna utilización F0 ≥ 1), `A-CORTE-IMPOSIBLE`
  (`finEstimado` > corte), `I-SUPUESTOS` (cuántos parámetros son SUPUESTO). Huella: SHA-256 (`crypto.subtle`) del JSON canónico, 16 hex.
  Enlace: JSON canónico → `CompressionStream('deflate-raw')` → base64url; al decodificar, descompresión con contador de bytes que corta en
  `maxBytesDescomprimidos`, parseo con tope de profundidad y nodos, compilación, presupuesto. Presupuesto: paquetes = Σ nominales × (1 + 4 ·
  cv del pronóstico); eventos ≈ paquetes × 14 + (horizonte ÷ tick). Anonimizar: rutas «Ruta 01…», volúmenes × f con f ∈ [0,8; 1,25]
  derivado de la semilla, costos redondeados a 2 cifras significativas, sin `autor` ni `descripcion`.
- **Pruebas propias.** El ejemplo compila sin errores y con `I-SUPUESTOS`; **F0 del ejemplo con los valores de §5**; 30 modelos mutados
  inválidos, cada uno con el código esperado; JSON canónico: `{"b":1,"a":[2,{"d":3,"c":4}]}` → `{"a":[2,{"c":4,"d":3}],"b":1}`; la misma
  huella con claves en otro orden; parches RFC 6902 (add con `-`, remove, replace, test que falla, escapes `~0` y `~1`, original intacto);
  enlace ida y vuelta exacto; tamaños: el ejemplo completo ≤ 8.000 caracteres (MEDIDO: 6.006 con zlib, 6.022 con CompressionStream), plantilla + parche de 5 cambios ≤ 400,
  receta ≤ 160. **H01–H12**, rechazadas con el error esperado: bomba de deflate (1 KB → 100 MB), JSON con 1.000 niveles, 10⁶ nodos, texto de
  1 MB, `"__proto__"`, `1e999`, `paquetes: 1e9` (presupuesto), `paso: 0`, `velocidad: -1`, esquema desconocido, plantilla desconocida,
  fragmento con caracteres fuera de base64url. Un título con `<script>` se acepta como texto (lo prueba P8 al mostrarlo).
- **Hecho cuando** todas pasan.
- **Tamaño.** ESTIMACIÓN: 1.200–1.600 líneas; 2–3 h.

### P4 · El hub (`hub/`)

- **Objetivo.** El mecanismo del hub de §6.7 en F3 (y F2), con su traza completa, sus KPI, sus costos y sus dos plantillas.
- **Entrega** (`hub/indice.ts`): `crearSimularNoche(crearMotor): SimularNoche`, `crearSimularNocheF2(crearMotor): SimularNoche`,
  `geometria: GeometriaDe`, `planBalanceado: PlanBalanceado`, `PLANTILLAS: RegistroPlantillas` (`hub-chico@1.0.0`, `hub-lazo-noche@1.0.0`),
  `crearAnillo`, `crearRueda`; `hub/README.md` con el orden de registro de bloques, los tipos de evento y las direcciones (§6.3).
- **Cómo.** Partir de la maqueta medida (`oportunidades/proyectos/anden/visiones/experiencia-medicion/hub.mjs`, que se puede leer pero no
  importar) y llevarla al contrato: estado solo en arreglos tipados (anillos para la acumulación, las rampas y la excepción; rueda de tiempos
  del lazo), direcciones de §6.3 (nunca un flujo por fuente ni sorteos en orden), reglas de §6.7 completas (retén, dos bandejas, no
  transportables, paradas, plan, reglas de rampa, pausas de rampa), tramos con causa y causante, momentos, resumen por paquete, KPI de §6.9,
  alertas. Usar `m.mat` para toda la matemática. `simularNoche` arma el motor con `traza` según el pedido, registra los bloques, corre,
  finaliza y devuelve `{ resultado, traza? }`.
- **Pruebas propias** (con `crearMotorReferencia`; ≤ 90 s en total): **L01–L07, K02a–b, K03, P02, R05a–b, I01–I06**; R01 en el hub chico (5
  semillas); doradas del hub chico (5 semillas: huella y KPI; se generan y commitean la primera vez); plan: en 30 noches de la plantilla
  grande, el P90 de recirculación con `'por-volumen'` ≤ con `'contiguas'` (la medición de la síntesis dio 0,01% contra 7,2%); I01–I06 en 20 noches por plantilla; KPI sanos en 50
  noches del hub chico (`clasificados = paquetes` al horizonte, `finClasificacionMin` entre 120 y 300, sin alertas); la geometría de las dos
  plantillas dentro de sus límites; ningún nombre de la lista negra en las plantillas.
- **Pruebas de integración que tiene que hacer pasar.** R06 del hub con el núcleo de producción; R04 del hub; E01 y E02 (con P7); presupuestos.
- **Hecho cuando** todas sus pruebas pasan y `hub/README.md` está completo.
- **Tamaño.** ESTIMACIÓN: 1.800–2.600 líneas; 2,5–3,5 h. Es el paquete más grande: si se atrasa, F2 y la regla `'la-que-se-llena-antes'`
  son lo último.

### P5 · Experimentos y estadística (`experimentos/`)

- **Objetivo.** Que ningún número salga sin su intervalo, y que la decisión diga cuándo no está segura.
- **Entrega** (`experimentos/indice.ts`): `resumir: Resumir`, `proporcion: Proporcionar`, `comparar: CompararPareado`,
  `evaluarDecision: EvaluarDecision`, `semaforo(...)`, `armarComprobante: ArmarComprobante`, `crearPlanificador: CrearPlanificador`,
  `trabajadorEnProceso: TrabajadorEnProceso`, `mser5(serie)`, `cuantilT(conf, ν)`, `wilson(exitos, n, conf)`, `percentil`, `icPercentil`;
  textos del semáforo (`experimentos.semaforo.<motivo>`).
- **Cómo.** Fórmulas de §7. El planificador mantiene una cola por prioridad (y FIFO dentro de cada una), reparte rangos de réplicas en
  trozos (1 para la vista previa, 5 para las noches), entrega cada resultado apenas llega y agrega siempre por índice; `cancelar` saca lo
  encolado y, si un trabajador está en medio de un trozo cancelado, lo termina y crea otro con la fábrica. `trabajadorEnProceso` corre el
  simulador en el mismo hilo (con `setTimeout(0)` entre réplicas para poder cancelar). `evaluarDecision` arma las variantes con
  `variante(mv, [{ op: 'replace', path: decision.variable.ruta, value: v }])`.
- **Pruebas propias** (con datos sintéticos y un simulador falso): valores de control de §7 (t, Wilson, z); percentiles e IC del P90 con
  cobertura 94–98% en 2.000 muestras exponenciales de n = 100; MSER-5 encuentra el corte de una serie con transitorio conocido (lineal en
  los primeros 200 puntos) entre 150 y 300; pareada con diferencia conocida; **S12, S13**; secuencial: con un simulador falso de
  probabilidades conocidas por valor (0,60 · 0,80 · 0,97 · 0,995 para 2, 3, 4 y 5; meta 0,9), recomienda 4 en ≥ 95% de 200 corridas y usa
  en promedio menos del 60% de las réplicas de correr 400 fijas por valor; semáforo: cada motivo de la tabla de §7; **R07**; planificador: prioridades respetadas,
  cancelación inmediata (ningún resultado de un trabajo cancelado llega después de cancelar), reemplazo de un trabajador terminado.
- **Hecho cuando** todas pasan.
- **Tamaño.** ESTIMACIÓN: 1.000–1.400 líneas; 2 h.

### P6 · Escena (`escena/`)

- **Objetivo.** Que lo que se ve sea exactamente lo que se calculó, a 60 cuadros por segundo sin placa de video.
- **Entrega** (`escena/indice.ts`): `crearReproductor: CrearReproductor`, `crearVista: CrearVista`, `elegirPiso: ElegirPiso`,
  `agregarRiesgo: AgregarRiesgo`, `detectarMomentos: DetectarMomentos`, `estilos: { claro: Estilo; oscuro: Estilo }`,
  `componer2d(...)` y `componerIso(...)` (puras, devuelven listas de primitivas); textos `escena.*`.
- **Cómo.** Índice de tramos por intervalos de 60 s para encontrar en O(visibles) los tramos activos en t. Posiciones con fórmulas cerradas:
  cinta interpolada sobre la polilínea; fila de la acumulación y de cada rampa por `secuencia − salidas hasta t` (salidas por búsqueda
  binaria en los t1 ordenados); bandeja por k(t) con fracción desde los tramos LAZO_MARCHA y LAZO_DETENIDO; personas en su puesto o
  caminando. Estados visuales: `DANDO_VUELTA` (BANDEJA con a > 0), `EXCEPCION`, `ESPERANDO`, `ATRASADO` (paquetes con `listo > corte` o −1).
  Cada vista compone primero una lista de primitivas (pura, probada en Node) y después la pinta en Canvas 2D; la isométrica usa sprites
  horneados por estado y orden por profundidad (como `visiones/experiencia-medicion/vistas.mjs`, que se puede leer). Estilo: paleta por
  estado con forma además de color, claro y oscuro, movimiento reducido. Riesgo desde `ResultadoReplica` (nunca desde trazas). Momentos
  desde la traza más derivados (primer paquete que pierde el corte, fila máxima), con importancia.
- **Pruebas propias** (con la traza de la maqueta y trazas sintéticas): posición de la bandeja en los bordes de cada paso y durante una
  parada; lugar en la fila; extremos de la cinta; ninguna posición NaN ni fuera de `limites` en 1.000 instantes; `tocar` devuelve la entidad
  sembrada; lista de primitivas: cantidad y orden por profundidad en la isométrica; `agregarRiesgo` con resultados sintéticos (probabilidades,
  percentiles, noche mediana y peor); momentos ordenados; **contraste**: todo par texto/fondo del estilo ≥ 4,5:1 y los estados distinguibles
  en escala de grises (diferencia de luminancia ≥ 15% o forma distinta); costo informativo de `posiciones` en el hub de 90k de la maqueta
  (≤ 1 ms por cuadro en Node).
- **Hecho cuando** todas pasan.
- **Tamaño.** ESTIMACIÓN: 1.400–2.000 líneas; 2–3 h.

### P7 · Explicación y decisión (`explicacion/`)

- **Objetivo.** El porqué de cada paquete sin causas falsas, y las preguntas que cambian la decisión.
- **Entrega** (`explicacion/indice.ts`): `esperasDe: EsperasDe`, `armarBiografia: ArmarBiografia`, `crearContrafactual(sim):
  ContrafactualDirigido`, `causasConfirmadas: CausasConfirmadas`, `verificarFrases: VerificarFrases`, `supuestosDe: SupuestosDe`, `tamizar: Tamizar`,
  `armarFormulario: ArmarFormulario`, `planDeMedicion: PlanDeMedicion`; textos `explicacion.*`.
- **Cómo.**
  - Esperas: recorrer los tramos del paquete en orden. ACUMULACION → FILA; ESPERA_BANDEJA → FALTA_BANDEJA (o FALLA si más de la mitad se
    superpone con LAZO_DETENIDO); BANDEJA con a > 0 → RAMPA_LLENA (causante: la rampa); RAMPA → según lo que hacía la persona causante
    (`q`) en ese lapso: PERSONA_PAUSA → PAUSA, PERSONA_AUSENTE → AUSENCIA, PERSONA_CIERRA_JAULA → CIERRE_JAULA, si no PERSONA_OCUPADA;
    COLA_MANUAL → su causa; DESCARGA con causa BLOQUEO → BLOQUEO. La evidencia son los índices de los tramos usados.
  - Causas: candidatas = esperas de ≥ 5 min o ≥ 20% del tiempo en el hub. Cada causa tiene su cambio fijo (parche): PAUSA → pausas del rol
    con duración 0; AUSENCIA → retén + 1; RAMPA_LLENA → capacidad de esa rampa × 2; FALLA → sin micro-paradas; FILA o BLOQUEO → un puesto
    activo más; NO_LEIDO → noLeido 0; CIERRE_JAULA → cierre 0; FALTA_BANDEJA → sin causa propia (no se afirma). El contrafactual corre la
    variante con la **misma semilla y réplica**, busca el mismo paquete por (camión, índice) y **confirma** si ahora llega antes del corte (o
    antes por ≥ 5 min si ya llegaba). Solo las confirmadas se muestran como causa. Con k ≤ 3 causas no confirmadas de a una, se prueba el
    cambio conjunto y, si confirma, se muestra la causa conjunta.
  - Frases: claves `explicacion.paso.<tipo>` y `explicacion.causa.<tipo>` con variables y afirmaciones (fuente de cada cifra). Verificador:
    la fuente existe; el valor coincide al redondeo; el sentido coincide con el signo; `diferenciaReal` solo si el IC excluye el cero.
  - Tamizado: supuestos = parámetros con `incierto` que el modelo usa de verdad (si `temporarios = 0`, `eficienciaTemporario` no aplica).
    Para cada uno, variantes con el valor bajo y el alto (el medio es el modelo), `evaluar` cada una, decisiones d_bajo, d_medio, d_alto y
    **pérdida esperada** = Σ pesoᵢ · |costoᵢ(dᵢ) − costoᵢ(d_medio)| con el costo medio de la configuración (si dᵢ es null, se usa el máximo de
    la variable y se marca). Orden por pérdida esperada; el corrimiento del KPI va como dato secundario.
  - Formulario: preguntas en ese orden, solo las de pérdida esperada ≥ `decision.indiferencia.valor`; cuando no queda ninguna, el mensaje
    «Ya está: lo que falta no cambia la respuesta». Plan de medición: n = ⌈(1,96 · cv ÷ ε)²⌉ con ε = 0,15 y el cv de la distribución (0,5 si
    no tiene), minutos = ⌈n · segundos por observación ÷ 60⌉ (cv 0,6 → 62 observaciones).
- **Pruebas propias** (trazas sintéticas hechas a mano y la de la maqueta; simulador falso para el contrafactual y el tamizado): cada causa
  de la taxonomía detectada en su traza sintética; ninguna causa fuera de la taxonomía; biografía con pasos encadenados; verificador: 200
  frases verdaderas → 0 fallas y 20 falsas sembradas (valor, signo, «diferencia real» con IC que cruza el cero, sin fuente) → 20 de 20
  detectadas; contrafactual con un simulador falso que rescata el paquete → `confirma = true`, y uno que no → `false`; tamizado con un
  modelo falso donde solo un supuesto cambia la decisión → primero en el ranking con pérdida > 0 y los demás con 0; formulario se detiene
  bajo la indiferencia; plan de medición (cv 0,6 → 62).
- **Pruebas de integración que tiene que hacer pasar.** E01 y E02 con el hub real.
- **Hecho cuando** todas pasan.
- **Tamaño.** ESTIMACIÓN: 1.200–1.700 líneas; 2–3 h.

### P8 · Interfaz (`app/`)

- **Objetivo.** El primer minuto de §5.3 del diseño maestro, en 360 px y en escritorio, claro y oscuro, en español.
- **Entrega.** `arrancar(servicios: Servicios, raiz: HTMLElement): void` en `app/arrancar.ts` (la integración la llama con los servicios
  reales); `app/entrada-falsa.ts` y `app/servicios-falsos.ts` (implementa `Servicios` sobre `trazaDeMaqueta` y resultados sintéticos, para
  desarrollar y para `humo.mjs`); `traducir` y `formato` (i18n que junta los `textos.*.json` de todos los paquetes); `index.html` con CSP;
  PWA (`sw.js` que guarda los archivos construidos; `manifest.webmanifest`); QR con qrcode-generator 2.0.4 vendorizado con su licencia.
- **Pantallas** (cada una una función que monta y desmonta; el estado en `estado.ts`, puro y probado):
  1. **Inicio:** las dos plantillas como miniaturas vivas (2D, ×600) con nombre de problema; «Abrir un enlace»; «¿Qué tenés que decidir?».
  2. **Escena:** lienzo con el piso elegido; una línea arriba («Costo por paquete $X (± Y) · Perder el corte: 1 noche de cada N · Confianza:
     [semáforo] · Comprobante»); **etiqueta de noche obligatoria** («Noche 37 de 100 · la mediana por hora de fin»); línea de tiempo con
     marcas y cabezal arrastrable; reproducir, pausa, ×1 a ×3.600, rebobinar; botones Cien noches, ¿Y si…?, Decidir, Compartir, Presentar,
     piso (2D / 2,5D), modo ingeniero. Tocar algo abre su biografía.
  3. **Biografía:** pasos con hora y duración, causas confirmadas («Confirmado: sin las pausas de rampa llegaba a las 00:12»), botón
     «¿y si…?» que corre el contrafactual.
  4. **Cien noches:** capa de riesgo sobre el plano (probabilidad de llenarse por rampa) y panel con el abanico de la hora de fin (P10, P50,
     P90) y el selector mediana / peor / mejor; la barra muestra el progreso mientras llegan las noches.
  5. **¿Y si…?:** perillas (puestos activos, personas de rampa, retén, plan por volumen o contiguo, «balancear el plan»); vista previa
     marcada «provisoria (1 noche)»; confirmación con 40 noches pareadas: diferencia con IC y veredicto; **pantalla dividida sincronizada**
     en escritorio y alternancia A/B con un toque en 360 px.
  6. **Decidir:** la pregunta de la decisión; el formulario (pregunta, por qué, referencia con su insignia, rango, «medilo» con el plan);
     progreso del tamizado (cancelable); tabla por valor (probabilidad de cumplir con su IC, estado, costo medio); recomendación con semáforo.
  7. **Comprobante:** receta, huella agregada, motor (85 de 85), controles del modelo, procedencia con insignias por etiqueta, y los tres
     sellos con su texto exacto (diseño maestro §5.9).
  8. **Compartir:** enlace (plantilla + parche si se puede; si no, modelo completo), QR, anonimizar activado por defecto, aviso de qué viaja
     en el enlace, copiar.
  9. **Presentar:** modo directorio v0 en tres actos (§5.6 del diseño), pantalla completa, Wake Lock, flechas del teclado.
  10. **Ingeniero:** JSON del modelo con validación en vivo y diagnósticos, descarga de la traza en CSV, tabla de réplicas.
- **Pruebas propias.** `estado.ts` (transiciones de pantallas y de selección); `traducir` (claves `app.*` iguales en es y en, variables);
  `formato` es-AR (1.234,5; 12,5%; $ 1.234; 00:30; «1 h 05 min»); ninguna asignación a `innerHTML` en `app/` salvo plantillas estáticas sin
  datos (búsqueda en el texto); lista negra de marcas en `app/i18n`; `humo.mjs`: construye con esbuild la entrada falsa, abre Chromium
  (`NODE_PATH=/opt/node-tools/node_modules`), recorre las 10 pantallas en 360 × 740 y 1280 × 800, claro y oscuro, sin errores de consola, y
  guarda capturas en `app/pruebas/capturas/`; un título con `<script>` se muestra como texto.
- **Hecho cuando** todas pasan y las 40 capturas existen.
- **Tamaño.** ESTIMACIÓN: 2.000–2.800 líneas; 3–4 h.

---

## 10. El paquete de integración (I)

Arranca cuando los ocho terminan (o con los que haya, en ese orden: P1, P3, P4, P5, P2, P7, P6, P8).

1. **Ensamblar** (`integracion/ensamblar.ts`): `simularNoche = crearSimularNoche(crearMotor)` y lo mismo con la batería y el contrafactual;
   `variante = crearVariante(compilar)`; `codec = crearCodec((id, v) => PLANTILLAS[`${id}@${v}`] ?? null)`.
2. **Worker** (`integracion/worker.ts`): atiende `MensajeAlTrabajador`, congela `Math.random` y la matemática nativa al arrancar
   (`Object.defineProperty` para que fallen), corre `simularNoche` y devuelve los resultados con las columnas de la traza **transferidas**.
3. **Puente** (`integracion/puente.ts`): arma los `Servicios` reales con `crearPlanificador(() => new Worker(...), navigator.hardwareConcurrency − 1)`
   (mínimo 1, máximo 7). `integracion/entrada.ts` llama a `arrancar(servicios, raíz)`.
4. **Construir y servir:** `construir.mjs` empaqueta con esbuild 0.28.2 la entrada y el Worker (formato ESM, minificado, con mapas) en
   `dist/`, copia `index.html`, estilos, PWA y vendor; si esbuild no está, usa `module.stripTypeScriptTypes` de Node y reescribe las
   extensiones de los imports. `servir.mjs` sirve `dist/` por HTTP local (el simulador no abre desde `file://`: MEDIDO en `tecnologia-web.md`).
5. **Pruebas de integración** (`integracion/pruebas/`): `arquitectura.test.ts` (imports permitidos por carpeta según §4; tokens prohibidos de
  §1.4; `contratos/` sin cambios respecto del anexo); `diferencial.test.ts` (**R08b**); `r06-hub.test.ts`; `e-explicador.test.ts` (**E01,
  E02**); `s-estadistica.test.ts` (**S01–S03, S08, S09, S11**); `textos.test.ts` (toda clave emitida en las pruebas existe en es y en, y las
  dos tienen las mismas claves); `marcas.test.ts` (lista negra en plantillas, textos y `dist/`).
6. **Batería completa** con el núcleo de producción (`npm run verificar`) y su informe local.
7. **R04** (`r04.mjs`): abre en Chromium una página que corre los casos rápidos, el hub chico (5 semillas) y las doradas de matemática, y
   compara las huellas con las de Node. Intenta `npx playwright install firefox webkit` (con el Playwright de `/opt/node-tools`); si
   instala, repite en los dos; si no, deja anotado por qué en el informe (R04 queda «Node = Chromium», con Firefox y WebKit pendientes).
8. **Recorridos de punta a punta** (`e2e/`, Playwright con Chromium del entorno): **primer minuto** (abrir el enlace de la plantilla grande →
  la película corre → tocar un paquete atrasado → biografía con una causa confirmada → cien noches → «¿y si…?» con «balancear el plan» →
  pantalla dividida con veredicto); **decidir** (formulario hasta «Ya está», tabla, recomendación con semáforo); **compartir** (enlace y QR;
  abrir el enlace en otra pestaña da la misma huella y el sello «reproducida en este dispositivo»); **enlace hostil** (H01 por URL: aviso,
  sin cuelgue). En 360 × 740 y 1280 × 800, claro y oscuro; capturas en `e2e/capturas/`; 0 errores de consola.
9. **Banco** (`banco.mjs`, §11): mediana de 5 corridas, con la CPU sin frenar y frenada 4× por CDP.
10. **Informe de salida** (`integracion/salida/informe-salida.json`): cada criterio de §12 con su valor medido y si pasó.
11. **README del simulador** (cómo correr, cómo probar, qué hay, qué no) y commit.

---

## 11. Presupuestos (los mide el banco)

Contenedor de referencia: el del entorno (4 núcleos virtuales, sin GPU, ±15–30% entre corridas). Para no fallar al azar, cada presupuesto se
evalúa con la **mediana de 5 corridas** y un margen de ±30%; los que dependen de la máquina también se reportan como cociente contra una
referencia medida en la misma corrida (eventos por segundo de una M/M/1 sintética).

| Presupuesto | Meta | Base |
|---|---|---|
| Noche del hub de 24.000 con traza completa, Node | ≤ 400 ms | Maqueta con matemática propia: 172–196 ms (MEDIDO hoy) |
| Noche del hub chico con traza, Node | ≤ 150 ms | ESTIMACIÓN: un tercio de la grande |
| Cien noches del hub de 24.000 sin traza, 3 Workers en Chromium | ≤ 20 s, con progreso visible | ESTIMACIÓN: 100 × 0,25 s ÷ 3 |
| Vista previa del deslizador (una noche completa del hub de 24.000) | ≤ 600 ms | Ídem |
| Primer cuadro desde el enlace, sin red | ≤ 150 ms | Maqueta: 28–42 ms (MEDIDO) |
| Primer cuadro con red 4G emulada | ≤ 1,5 s | Meta del diseño; a confirmar en teléfonos reales (corte 2) |
| Cuadro 2,5D del hub de 24.000 | ≤ 4 ms sin frenar · ≤ 16,7 ms con CPU 4× | Maqueta: 1,8 · 6,8 ms (MEDIDO) |
| Cuadro 2D del hub de 24.000 | ≤ 3 ms · ≤ 10 ms con CPU 4× | Maqueta: 0,8–1,3 · 4,1 ms (MEDIDO) |
| Tamizado del hub chico, 3 Workers | ≤ 60 s, cancelable | ESTIMACIÓN: ~17 variantes × 4 valores × 20 noches |
| Evaluación de la decisión del hub chico | ≤ 20 s | ESTIMACIÓN |
| Memoria de la pestaña con la noche de 24.000 y su par de la pantalla dividida | ≤ 150 MB | Traza: ~8 MB por noche (ESTIMACIÓN) |
| JavaScript de la primera carga (sin vendor), brotli | ≤ 150 KB | Maqueta: núcleo + vistas 8,2 KB brotli (MEDIDO) |

El freno de CPU de CDP frena el JavaScript, no la rasterización: **no es un teléfono** (alerta del arquitecto). La medición en teléfonos
reales es del corte 2 y es condición para publicar.

---

## 12. Criterios de salida del corte 1 (todos medibles)

1. `npm test` en verde en Node 22 (paso 0 + los ocho paquetes + integración) en menos de 3 minutos.
2. `npm run verificar`: **85 de 85 exigibles** con el núcleo de producción; S01 y S02 fallan como deben; informe local generado.
3. **R08b:** el núcleo de producción y la referencia dan la misma huella en la batería rápida y en el hub chico.
4. **R04:** las mismas huellas en Node y Chromium (Firefox y WebKit si se pudieron instalar; si no, pendientes con el motivo).
5. **E01 y E02** en verde: 0 frases causales sin confirmar.
6. Invariantes I01–I06: 0 alertas en 200 noches de cada plantilla.
7. Enlace: ida y vuelta exacta; ejemplo completo ≤ 8.000 caracteres; plantilla + parche de 5 cambios ≤ 400; receta ≤ 160; H01–H12
   rechazadas; abrir el enlace en otra pestaña reproduce la huella.
8. Recorridos de §10.8 sin errores de consola en 360 × 740 y 1280 × 800, claro y oscuro, con sus capturas.
9. Presupuestos de §11 dentro del margen.
10. Textos: todas las claves en es y en; la etiqueta de noche y los tres sellos presentes en la escena; ningún nombre de la lista negra.
11. Prueba de arquitectura en verde (imports, tokens prohibidos, contratos intactos).
12. Nada publicado ni enviado a terceros.

Si un criterio no se cumple, la integración lo anota en el informe de salida con el valor medido y el corte queda «cerrado con
pendientes», nunca «cerrado».

---

## 13. Qué queda para el corte 2

3D con three.js 0.186.1 y su regla de elección; video con WebCodecs y webm-muxer 5.1.4; importar CSV y XLSX en el Worker; ajuste de
distribuciones; validación conducida por traza; arranque en caliente desde el estado de hoy con la foto; variables de control; R04 en
Firefox y WebKit y en teléfonos reales (sonda colectiva, con OK); MCP local; entrevista en texto con IA (proxy con tope, con OK y
presupuesto aprobado); editor 2D con parches; plantilla del nodo de última milla; motores inmutables y corpus de compatibilidad; página
«Andén Verificado» en borrador; registro de afirmaciones (`diseno-maestro.md` §1.3).

---

## 14. Reglas para los agentes

1. Leer este documento entero, el diseño maestro §3–§4 y los contratos antes de escribir una línea.
2. Escribir solo en los archivos de su paquete. No tocar `contratos/` (anotar en `NOTAS-CONTRATO.md`).
3. No importar `nucleo/` ni otro paquete: usar los contratos, la referencia y las fixtures.
4. Cada número de las plantillas con su fuente o marcado como SUPUESTO; ningún dato de la empresa del fundador; ningún nombre de empresa.
5. Toda prueba con semilla fija; ninguna prueba depende del reloj de la máquina (los tiempos van al banco, no a `npm test`).
6. Un archivo de prueba por tema, nombres en español, mensajes de error que digan qué se esperaba y qué salió.
7. Commit propio al terminar, con el paquete en el mensaje («Andén simulador, corte 1, P4: hub F3 con …»).
8. Si algo de esta especificación es imposible o contradictorio, no inventar: anotarlo en `NOTAS-CONTRATO.md` con la propuesta y seguir.

---

## Anexo A · Contratos (código literal de `corte-1-paso0/contratos/`)

### `contratos/tipos-base.ts`

```ts
// contratos/tipos-base.ts · Andén simulador, corte 1 · CONGELADO: se cambia solo en el paquete de integración.
/** Tiempo del motor: milisegundos enteros (exactos en float64 hasta 2^53 ms ≈ 285.000 años). */
export type Ms = number;
/** Segundos: la unidad de tiempo de los modelos (anden.modelo/1). */
export type Seg = number;
export const MS_POR_SEG = 1000;
/** Única conversión de segundos del modelo a ms del motor. Regla fija de redondeo: Math.round. */
export function aMs(s: Seg): Ms {
  return Math.round(s * MS_POR_SEG);
}
/** «HH:MM» con HH de 00 a 47. «30:00» son las 06:00 del día siguiente al que empieza el turno. */
export type Hora = string;
export function horaASeg(h: Hora): Seg {
  const m = /^(\d{2}):(\d{2})$/.exec(h);
  if (!m) throw new Error(`hora inválida: ${h}`);
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 47 || mm > 59) throw new Error(`hora fuera de rango: ${h}`);
  return hh * 3600 + mm * 60;
}
export function segAHora(s: Seg): Hora {
  const m = Math.floor(s / 60);
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
/** Igual que segAHora pero sin módulo 24 (formato Hora del modelo: «24:30» son las 00:30 del día siguiente). */
export function segAHoraLarga(s: Seg): Hora {
  const m = Math.floor(s / 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
/** Fases dentro del mismo instante: urgente (paradas, ausencias, interrupciones) → normal → tardía (medición y observación). */
export const Fase = { URGENTE: 0, NORMAL: 1, TARDIA: 2 } as const;
export type Fase = (typeof Fase)[keyof typeof Fase];
/** Etiquetas de evidencia (doctrina/02-estandares-de-evidencia.md) más el dato que trae el usuario. */
export type Etiqueta = 'HECHO' | 'MEDIDO' | 'ESTIMACION' | 'HIPOTESIS' | 'SUPUESTO' | 'DATO_USUARIO';
export type Idioma = 'es' | 'en';
```

### `contratos/azar.ts`

```ts
// contratos/azar.ts · CONGELADO.
// Azar por dirección semántica con Philox4x32-10 (Random123). Clave = (semilla, clave de la dirección).
// Contador = (réplica, a, b, (c << 8) | sub). Un sorteo nunca depende del orden de los eventos ni del índice de un servidor.

/**
 * Dirección de un sorteo. Convención obligatoria (corte-1.md §6.3):
 * - clave: claveDe(rutaDelBloque, proposito), p. ej. claveDe('demanda.camiones', 'desvio');
 * - a: ordinal estable de la entidad en su fuente (camión, persona, falla n-ésima);
 * - b: segundo índice estable (paquete dentro del camión) o 0;
 * - c: intento o vuelta (lectura número c del paquete) o 0. Máximo 2^24 − 1.
 */
export interface Direccion {
  clave: number;
  a: number;
  b: number;
  c: number;
}

export type Distribucion =
  | { tipo: 'fija'; valor: number }
  | { tipo: 'uniforme'; min: number; max: number }
  | { tipo: 'exponencial'; media: number }
  | { tipo: 'triangular'; min: number; moda: number; max: number }
  | { tipo: 'lognormal'; media: number; cv: number }
  | { tipo: 'normal'; media: number; desvio: number; min?: number; max?: number }
  | { tipo: 'erlang'; k: number; media: number }
  | { tipo: 'weibull'; forma: number; escala: number }
  | { tipo: 'bernoulli'; p: number }
  | { tipo: 'discreta'; valores: number[]; pesos: number[] }
  | { tipo: 'empirica'; valores: number[] };

/** Uniformes que consume cada distribución. Fijo: es la base de los números aleatorios comunes. 'k' = k uniformes. */
export const CONSUMO: Record<Distribucion['tipo'], number | 'k'> = {
  fija: 0, uniforme: 1, exponencial: 1, triangular: 1, lognormal: 2, normal: 2,
  erlang: 'k', weibull: 1, bernoulli: 1, discreta: 1, empirica: 1,
};

export interface FuenteAzar {
  readonly semilla: number;
  readonly replica: number;
  /** Los 4 uint32 del bloque Philox número `sub` (0–255) de la dirección. */
  bloque(d: Direccion, sub: number, out: Uint32Array): void;
  /** El i-ésimo uniforme en (0, 1), 53 bits, de la dirección: i = 2·sub + (0 | 1). */
  uniforme(d: Direccion, i?: number): number;
  /** Sorteo con consumo fijo. Usa los uniformes 0, 1, 2… de la dirección. */
  sortear(dist: Distribucion, d: Direccion): number;
}

/** FNV-1a de 32 bits sobre los bytes UTF-8 de `${ruta}/${proposito}`. La implementa el núcleo; la firma es contrato. */
export type ClaveDe = (ruta: string, proposito: string) => number;
```

### `contratos/matematica.ts`

```ts
// contratos/matematica.ts · CONGELADO.
// Solo + − × ÷ y sqrt (exactas por IEEE 754): el mismo resultado bit a bit en Node, Chrome, Firefox y Safari.
// Prohibido en el motor: Math.random, Math.log, Math.exp, Math.pow, Math.sin, Math.cos, Math.tan, Math.atan2, Date, performance.
export interface MatematicaDeterminista {
  log(x: number): number;
  exp(x: number): number;
  /** Reducción de Cody-Waite con dos términos, válida para |x| ≤ 1.000 (fuera de ese rango lanza error). El motor solo la usa en [0, 2π). */
  cos(x: number): number;
  sin(x: number): number;
  /** exp(y·log(x)) para x > 0; pow(0, y>0) = 0; pow(x, 0) = 1. No es correctamente redondeada, pero es determinista. */
  pow(x: number, y: number): number;
  /** Math.sqrt: exacta por IEEE 754, permitida. */
  sqrt(x: number): number;
}
```

### `contratos/motor.ts`

```ts
// contratos/motor.ts · CONGELADO.
// Motor de eventos discretos determinista. Todo lo que hay en el calendario y en los bloques es numérico y vive en arreglos
// tipados: por eso se puede fotografiar, restaurar, clonar y portar a WebAssembly sin reescribir los bloques.
import type { Fase, Ms } from './tipos-base.ts';
import type { ClaveDe, FuenteAzar } from './azar.ts';
import type { EscritorTraza, NivelTraza } from './traza.ts';
import type { MatematicaDeterminista } from './matematica.ts';

export interface OpcionesMotor {
  semilla: number;               // uint32
  replica: number;               // uint32
  hasta: Ms;                     // horizonte: no se procesan eventos con t > hasta
  traza: NivelTraza;
  /** Guardián contra modelos que no terminan. Por defecto 50.000.000. */
  maxEventos?: number;
  /** Guardián contra lazos de tiempo cero: eventos seguidos en el mismo instante. Por defecto 1.000.000. */
  maxMismoInstante?: number;
}

/** Estado completo de un bloque, sin closures ni objetos: solo arreglos tipados y números. */
export type EstadoBloque = Record<string, Float64Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Uint8Array | number>;

export interface Bloque {
  /** Ruta estable en el esquema (p. ej. 'hub.sorter'): identifica el bloque en la foto y alimenta las claves del azar. */
  readonly ruta: string;
  /** El motor lo llama con cada evento agendado para este bloque. `m.seq` es el número de secuencia de ese evento. */
  manejar(m: Motor, tipo: number, arg: number): void;
  estado(): EstadoBloque;
  restaurar(e: EstadoBloque): void;
  /** Al final de la corrida: cierra tramos abiertos y calcula indicadores. */
  finalizar?(m: Motor): void;
}

export type EstadoCorrida = 'sin-eventos' | 'horizonte' | 'pausa' | 'tope-eventos' | 'lazo-tiempo-cero';

export interface ResultadoCorrida {
  estado: EstadoCorrida;
  ahora: Ms;
  eventos: number;
  huella: string;
}

export interface Foto {
  version: 1;
  ahora: Ms;
  seq: number;
  eventos: number;
  huella: [number, number];
  /** Calendario serializado (columnas del montículo). */
  calendario: Record<string, Float64Array | Int32Array | Uint8Array | number>;
  bloques: Record<string, EstadoBloque>;
}

export interface Motor {
  readonly ahora: Ms;
  /** Secuencia del evento que se está procesando (para descartar eventos viejos: no hay cancelación en el calendario). */
  readonly seq: number;
  readonly eventos: number;
  readonly opciones: Readonly<OpcionesMotor>;
  readonly azar: FuenteAzar;
  readonly mat: MatematicaDeterminista;
  readonly traza: EscritorTraza;
  readonly claveDe: ClaveDe;
  /** Registra un bloque y devuelve su índice. El orden de registro es parte del modelo (y de la huella). */
  registrar(b: Bloque): number;
  /**
   * Agenda un evento. Orden total del calendario: (t, fase, prioridad, seq). Lanza error si t no es entero o si t < ahora.
   * Devuelve el seq asignado (creciente).
   */
  agendar(t: Ms, bloque: number, tipo: number, arg: number, fase?: Fase, prioridad?: number): number;
  /** Procesa eventos hasta el horizonte o hasta que no queden. */
  correr(): ResultadoCorrida;
  /** Procesa eventos con t ≤ hasta y deja ahora = hasta (para fotos y para tramos de escena). */
  correrHasta(hasta: Ms): ResultadoCorrida;
  foto(): Foto;
  restaurar(f: Foto): void;
  /** Huella de 64 bits en 16 caracteres hex sobre todos los eventos procesados (corte-1.md §6.4). */
  huella(): string;
  /** Llama a finalizar() de cada bloque en orden de registro. */
  finalizar(): void;
}

export type CrearMotor = (o: OpcionesMotor) => Motor;

/** Cola FIFO de enteros en un arreglo tipado que se agranda duplicando. Serializable. La implementa hub/estructuras/ (P4). */
export interface AnilloI32 {
  readonly largo: number;
  poner(x: number): void;
  sacar(): number;          // lanza si está vacía
  mirar(i?: number): number; // i-ésimo desde el frente (0 = el primero)
  vaciar(): void;
  estado(): EstadoBloque;
  restaurar(e: EstadoBloque): void;
}

/**
 * Rueda de tiempos para equipos con reloj propio (el lazo del sorter): `ranuras` = cantidad de pasos de una vuelta.
 * agendar(paso, x) exige pasoActual < paso ≤ pasoActual + ranuras. tomar(paso, f) llama f(x) en orden de llegada (FIFO)
 * para todo lo agendado en ese paso, y vacía la ranura ANTES de llamar a f (lo que f agende para paso + ranuras queda para
 * la próxima vuelta). Serializable. La implementa hub/estructuras/ (P4).
 */
export interface RuedaTiempos {
  readonly ranuras: number;
  agendar(paso: number, x: number): void;
  tomar(paso: number, f: (x: number) => void): number;
  estado(): EstadoBloque;
  restaurar(e: EstadoBloque): void;
}

/** Tiempo de un recorrido con perfil trapezoidal (o triangular si no llega a la velocidad máxima). Segundos. */
export type TiempoTrapezoidal = (distancia: number, velocidadMax: number, aceleracion: number, frenado?: number) => number;
```

### `contratos/traza.ts`

```ts
// contratos/traza.ts · CONGELADO.
// La traza es la única fuente de las vistas, de la biografía, del explicador y del narrador: lo que se ve es lo que se calculó.
// Formato columnar por tramos (quién, qué, dónde, desde, hasta, por qué). Las posiciones se calculan con fórmulas cerradas.
import type { Ms } from './tipos-base.ts';
import type { GeometriaHub } from './geometria.ts';

export type NivelTraza = 'no' | 'kpi' | 'completa';

export const ClaseEntidad = { PAQUETE: 0, PERSONA: 1, CAMION: 2, EQUIPO: 3, RAMPA: 4, PUESTO: 5 } as const;
export type ClaseEntidad = (typeof ClaseEntidad)[keyof typeof ClaseEntidad];

/** Referencia a una entidad de cualquier clase en un Int32: clase · 2^24 + id. -1 = nadie. */
export function refDe(clase: ClaseEntidad, id: number): number { return clase * 16777216 + id; }
export function claseDeRef(q: number): ClaseEntidad { return Math.floor(q / 16777216) as ClaseEntidad; }
export function idDeRef(q: number): number { return q % 16777216; }

/**
 * Tipos de tramo. Significado de las columnas por tipo (e = entidad, r = recurso, a = auxiliar):
 * CAMION_PLAYA     e camión · r -1 · a 0 · c ANDEN_OCUPADO si esperó
 * CAMION_ANDEN     e camión · r andén · a paquetes del camión
 * DESCARGA         e paquete · r andén · a camión
 * CINTA            e paquete · r cinta · a 0 (posición lineal entre t0 y t1 sobre la polilínea de la cinta)
 * ACUMULACION      e paquete · r 0 · a secuencia de entrada (lugar en la fila = a − salidas hasta t) · c FILA
 * INDUCCION        e paquete · r puesto · a persona
 * ESPERA_BANDEJA   e paquete · r puesto · a bandejas que necesita (1 o 2) · c FALTA_BANDEJA
 * BANDEJA          e paquete · r bandeja (0..T−1) · a vuelta (0 = primera) · c RAMPA_LLENA y q = ref(RAMPA, r) si es una vuelta extra
 * RAMPA            e paquete · r rampa · a secuencia en la rampa (lugar = a − tomados hasta t) · q = ref(PERSONA, persona asignada)
 * MANO             e paquete · r persona · a rampa
 * JAULA            e paquete · r rampa · a jaula·1000 + posición
 * COLA_MANUAL      e paquete · r 0 · a secuencia · c motivo (NO_LEIDO | RAMPA_LLENA por vueltas máximas | NO_TRANSPORTABLE)
 * MANUAL           e paquete · r persona · a 0
 * PERSONA_*        e persona · r puesto, rampa o andén según el rol · a paquete (si trabaja) o 0
 * LAZO_MARCHA      e -1 · r 0 · a paso del lazo al inicio del tramo (k0); en marcha k(t) = k0 + floor((t − t0) / tickLazo)
 * LAZO_DETENIDO    e -1 · r 0 · a paso del lazo (constante) · c FALLA
 */
export const TipoTramo = {
  CAMION_PLAYA: 1, CAMION_ANDEN: 2,
  DESCARGA: 10, CINTA: 11, ACUMULACION: 12, INDUCCION: 13, ESPERA_BANDEJA: 14, BANDEJA: 15, RAMPA: 16, MANO: 17, JAULA: 18,
  COLA_MANUAL: 19, MANUAL: 20,
  PERSONA_TRABAJA: 30, PERSONA_LIBRE: 31, PERSONA_PAUSA: 32, PERSONA_CAMINA: 33, PERSONA_AUSENTE: 34, PERSONA_CIERRA_JAULA: 35,
  LAZO_MARCHA: 40, LAZO_DETENIDO: 41,
  COLA: 50, SERVICIO: 51,
} as const;
export type TipoTramo = (typeof TipoTramo)[keyof typeof TipoTramo];

/** Taxonomía tipada de esperas (no hay «causas» libres: el explicador solo puede afirmar una de estas). */
export const Causa = {
  NINGUNA: 0, FILA: 1, BLOQUEO: 2, FALTA_BANDEJA: 3, RAMPA_LLENA: 4, PAUSA: 5, AUSENCIA: 6, FALLA: 7, CIERRE_JAULA: 8,
  NO_LEIDO: 9, PERSONA_OCUPADA: 10, ANDEN_OCUPADO: 11, NO_TRANSPORTABLE: 12,
} as const;
export type Causa = (typeof Causa)[keyof typeof Causa];

export const TipoMomento = {
  CAMION_LLEGA: 1, CAMION_ATRASADO: 2, ATRASO_COMUN: 3,
  RAMPA_LLENA: 10, RAMPA_LIBERA: 11,
  LAZO_PARA: 20, LAZO_ARRANCA: 21,
  PAUSA_INICIO: 30, PAUSA_FIN: 31, AUSENCIA: 32, REEMPLAZO: 33,
  JAULA_CERRADA: 40,
  CORTE: 50, PRIMER_PAQUETE: 51, ULTIMO_CLASIFICADO: 52,
  ACUMULACION_LLENA: 60, ACUMULACION_LIBERA: 61,
} as const;
export type TipoMomento = (typeof TipoMomento)[keyof typeof TipoMomento];

/** Columnas de tramos. Cada arreglo tiene largo exacto n (sin capacidad sobrante: se transfiere entre hilos). */
export interface ColumnasTramos {
  n: number;
  e: Int32Array; k: Uint8Array; r: Int32Array; a: Int32Array;
  t0: Float64Array; t1: Float64Array;
  c: Uint8Array;   // Causa
  q: Int32Array;   // causante: refDe(clase, id) o -1
}
/** Momentos puntuales: r = recurso o persona según el tipo; v = valor (minutos de atraso, persona cubierta, etc.). */
export interface ColumnasMomentos {
  n: number;
  t: Float64Array; tipo: Uint8Array; r: Int32Array; v: Float64Array;
}
/** Resumen por paquete, indexado por el id de la traza. Clave estable entre escenarios: (camion, indice). */
export interface ColumnasPaquetes {
  n: number;
  camion: Int32Array; indice: Int32Array; ruta: Int16Array; clase: Uint8Array;
  creado: Float64Array; listo: Float64Array; // listo = entró a la jaula; -1 si no terminó
  vueltas: Uint8Array;
}
export interface Catalogo {
  personas: { id: string; rol: 'induccion' | 'reten' | 'descarga' | 'rampa' | 'excepcion' }[];
  camiones: { id: string; turno: Ms }[];
  rutas: string[];
  rampas: string[];
  puestos: string[];
  andenes: string[];
}

export interface Traza {
  version: 1;
  modelo: string;      // huella del modelo
  semilla: number;
  replica: number;
  tickLazo: Ms;        // ms que tarda una bandeja en avanzar un paso
  bandejas: number;    // T
  inicio: Ms;
  fin: Ms;
  corte: Ms;
  tramos: ColumnasTramos;
  momentos: ColumnasMomentos;
  paquetes: ColumnasPaquetes;
  catalogo: Catalogo;
  geometria: GeometriaHub;
  huella: string;      // huella de la corrida (la del motor)
}

export interface EscritorTraza {
  readonly nivel: NivelTraza;
  /** Abre un tramo con t1 = Infinity y devuelve su índice (−1 si nivel ≠ 'completa'). */
  abrir(e: number, k: TipoTramo, r: number, a: number, t0: Ms, c?: Causa, q?: number): number;
  cerrar(i: number, t1: Ms, a?: number): void;
  tramo(e: number, k: TipoTramo, r: number, a: number, t0: Ms, t1: Ms, c?: Causa, q?: number): number;
  momento(t: Ms, tipo: TipoMomento, r: number, v: number): void;
  paquete(id: number, camion: number, indice: number, ruta: number, clase: number, creado: Ms): void;
  paqueteListo(id: number, listo: Ms, vueltas: number): void;
  /** Cierra los tramos abiertos en `fin` y devuelve la traza con columnas de largo exacto. */
  terminar(datos: Omit<Traza, 'tramos' | 'momentos' | 'paquetes' | 'version'>): Traza;
}
```

### `contratos/geometria.ts`

```ts
// contratos/geometria.ts · CONGELADO. Geometría del hub en metros (la calcula el paquete del hub; la usan las vistas).
export interface LazoEstadio {
  forma: 'estadio';
  recta: number;            // largo de cada recta (m)
  radio: number;            // radio de las curvas (m)
  origen: [number, number]; // inicio de la recta de abajo
  largo: number;            // 2·recta + 2π·radio
  paso: number;             // m entre bandejas
  bandejas: number;         // round(largo / paso)
}
export interface GeometriaHub {
  lazo: LazoEstadio;
  estaciones: { id: string; s: number; x: number; y: number }[];
  lector: { s: number; x: number; y: number };
  rampas: { id: string; s: number; lado: -1 | 1; x: number; y: number; capacidad: number; ruta: string }[];
  excepcion: { id: string; s: number; x: number; y: number };
  andenes: { id: string; x: number; y: number }[];
  cintas: { id: string; anden: string; puntos: [number, number][]; largo: number }[];
  acumulacion: { x: number; y: number; capacidad: number };
  limites: { xmin: number; ymin: number; xmax: number; ymax: number };
}
/**
 * Posición sobre el lazo tipo estadio a la distancia s (m) desde el origen, en sentido antihorario:
 * recta de abajo hacia +x, curva derecha, recta de arriba hacia −x, curva izquierda. Escribe [x, y, ángulo] en out.
 * Usa Math.cos/Math.sin nativos: es solo para dibujar, nunca entra al motor ni a la huella.
 */
export function posEnLazo(l: LazoEstadio, s: number, out: Float64Array | number[]): void {
  const L = l.largo, R = l.radio, Lr = l.recta, [x0, y0] = l.origen;
  let d = ((s % L) + L) % L;
  if (d < Lr) { out[0] = x0 + d; out[1] = y0; out[2] = 0; return; }
  d -= Lr;
  if (d < Math.PI * R) { const a = -Math.PI / 2 + d / R; out[0] = x0 + Lr + R * Math.cos(a); out[1] = y0 + R + R * Math.sin(a); out[2] = a + Math.PI / 2; return; }
  d -= Math.PI * R;
  if (d < Lr) { out[0] = x0 + Lr - d; out[1] = y0 + 2 * R; out[2] = Math.PI; return; }
  d -= Lr;
  const a = Math.PI / 2 + d / R; out[0] = x0 + R * Math.cos(a); out[1] = y0 + R + R * Math.sin(a); out[2] = a + Math.PI / 2;
}
```

### `contratos/resultados.ts`

```ts
// contratos/resultados.ts · CONGELADO. Indicadores de una réplica (una noche) del hub.
export const KPIS = [
  'paquetes', 'clasificados', 'pendientesAlCorte', 'pctAlCorte', 'todoAntesDelCorte', 'finClasificacionMin',
  'recirculacionPct', 'vueltasExtra', 'noLeidosPct', 'aExcepcion', 'esperaMediaMin', 'esperaP50Min', 'esperaP90Min',
  'utilInduccionPct', 'inductoresPresentes', 'ausentes', 'horasRampaLlena', 'rampasQueSeLlenaron', 'paradasLazo',
  'minutosLazoDetenido', 'esperaPlayaMediaMin', 'horasPersonaPagadas', 'costoNoche', 'costoPorPaquete',
] as const;
export type KpiId = (typeof KPIS)[number];
/** Unidad y sentido de cada KPI (para textos, semáforo y comparaciones). */
export const META_KPI: Record<KpiId, { unidad: string; mejor: 'mas' | 'menos' | 'neutro' }> = {
  paquetes: { unidad: 'paquetes', mejor: 'neutro' }, clasificados: { unidad: 'paquetes', mejor: 'mas' },
  pendientesAlCorte: { unidad: 'paquetes', mejor: 'menos' }, pctAlCorte: { unidad: '%', mejor: 'mas' },
  todoAntesDelCorte: { unidad: '0/1', mejor: 'mas' }, finClasificacionMin: { unidad: 'min desde el inicio', mejor: 'menos' },
  recirculacionPct: { unidad: '%', mejor: 'menos' }, vueltasExtra: { unidad: 'vueltas', mejor: 'menos' },
  noLeidosPct: { unidad: '%', mejor: 'menos' }, aExcepcion: { unidad: 'paquetes', mejor: 'menos' },
  esperaMediaMin: { unidad: 'min', mejor: 'menos' }, esperaP50Min: { unidad: 'min', mejor: 'menos' },
  esperaP90Min: { unidad: 'min', mejor: 'menos' }, utilInduccionPct: { unidad: '%', mejor: 'neutro' },
  inductoresPresentes: { unidad: 'personas', mejor: 'neutro' }, ausentes: { unidad: 'personas', mejor: 'menos' },
  horasRampaLlena: { unidad: 'h', mejor: 'menos' }, rampasQueSeLlenaron: { unidad: 'rampas', mejor: 'menos' },
  paradasLazo: { unidad: 'paradas', mejor: 'menos' }, minutosLazoDetenido: { unidad: 'min', mejor: 'menos' },
  esperaPlayaMediaMin: { unidad: 'min', mejor: 'menos' }, horasPersonaPagadas: { unidad: 'h', mejor: 'menos' },
  costoNoche: { unidad: 'moneda del modelo', mejor: 'menos' }, costoPorPaquete: { unidad: 'moneda del modelo por paquete', mejor: 'menos' },
};
export interface ResultadoReplica {
  modelo: string;        // huella del modelo
  semilla: number;
  replica: number;
  huella: string;        // huella de la corrida
  kpi: Record<KpiId, number>;
  /** Por recurso, en el orden del modelo (rampas, personas, puestos). */
  porRecurso: {
    rampaRecibidos: number[];
    rampaVueltas: number[];
    rampaMinutosLlena: number[];
    personaOcupadaPct: number[];
    puestoInducidos: number[];
  };
  /** Series por cuarto de hora desde el inicio del turno. */
  series: {
    filaInduccionMax: number[];   // máximo de paquetes en la acumulación en cada cuarto de hora
    clasificados: number[];       // paquetes que entraron a la jaula en cada cuarto de hora
  };
  /**
   * Alertas del modelo en esta noche (el semáforo las pasa a rojo): 'conservacion' (entraron ≠ salieron + adentro),
   * 'invariante:<nombre>' (p. ej. 'invariante:rampa-capacidad'), 'no-termina' (quedó trabajo al llegar al horizonte),
   * 'tope-eventos', 'lazo-tiempo-cero'. Vacío si todo está bien.
   */
  alertas: string[];
  eventos: number;
  /** Informativo: nunca entra a la huella ni a la comparación. */
  msCalculo?: number;
}
```

### `contratos/modelo.ts`

```ts
// contratos/modelo.ts · CONGELADO. Esquema anden.modelo/1, familia «hub-lazo» (hub de clasificación con sorter de lazo).
// Unidades fijas en el corte 1: tiempo en segundos, largo en metros. Un campo Num o Dist acepta el valor o '@parametro'.
import type { Distribucion } from './azar.ts';
import type { Etiqueta, Hora, Seg } from './tipos-base.ts';
import type { KpiId } from './resultados.ts';

export type Ref = `@${string}`;
export type Num = number | Ref;
export type Dist = Distribucion | Ref;

export interface Parametro {
  valor: number | Distribucion;
  unidad: string;
  etiqueta: Etiqueta;
  fuente: string;
  url?: string;
  fecha: string;                     // AAAA-MM-DD de consulta
  nota?: string;
  rango?: [number, number];          // el compilador rechaza valores (o medias) fuera del rango
  /** Para el tamizado: tres valores del parámetro (o de su media / p) y sus pesos previos. Por defecto [0,25; 0,5; 0,25]. */
  incierto?: { bajo: number; medio: number; alto: number; pesos?: [number, number, number] };
  pregunta?: string;                 // en criollo, para el formulario por decisión
  golpeDiscreto?: boolean;           // faltas, fallas, lotes: el tamizado lo simula siempre
}

export interface Modelo {
  esquema: 'anden.modelo/1';
  familia: 'hub-lazo';
  id: string;
  titulo: string;
  descripcion?: string;
  autor?: string;
  licencia?: string;
  creado?: string;
  plantilla?: { id: string; version: string };
  unidades: { tiempo: 's'; largo: 'm'; moneda: 'ARS' | 'USD' };
  parametros: Record<string, Parametro>;
  /** Procedencia de valores estructurales que no son parámetros (capacidades, fracciones, layout), por JSON Pointer. */
  procedencia?: Record<string, { etiqueta: Etiqueta; fuente: string; fecha?: string }>;
  calendario: { inicio: Hora; fin: Hora; corte: Hora };
  demanda: Demanda;
  hub: Hub;
  personas: Personas;
  costos: Costos;
  decision?: Decision;
  escenarios?: Escenario[];
  experimento: Experimento;
}

export interface SerieCamiones { serie: true; cantidad: number; primero: Hora; cada: Seg; paquetes: number }
export interface Camion { id: string; turno: Hora; paquetes: number }
export interface Demanda {
  camiones: SerieCamiones | Camion[];
  desvio: Dist;                                   // s respecto del turno, se sortea por camión
  errorPronostico: { cv: Num };                   // factor del día ~ lognormal(media 1, cv), común a todos los camiones
  atrasoComun: { probabilidad: Num; demora: Dist };// golpe del día que atrasa a todos los camiones (s)
  papeleo: Num;                                   // s por camión al terminar la descarga
}

export interface Hub {
  andenes: { id: string; x: number; y: number; personas: number }[];
  playa: { capacidad: number };
  /** Cinta del andén a la acumulación: largo = largo de la polilínea; separación mínima `paso` (m) entre paquetes al entrar. */
  cintas: { id: string; desde: string; velocidad: number; paso: number; puntos: [number, number][] }[];
  /** Cinta con acumulación antes de la inducción: capacidad = floor(largo / paso) paquetes. Si se llena, los andenes paran. */
  acumulacion: { largo: number; paso: number; x: number; y: number };
  sorter: Sorter;
  induccion: { puestos: { id: string; s: number }[]; tiempo: Dist };   // tiempo base por paquete (s), sorteado al nacer
  rampas: { id: string; s: number; lado: -1 | 1; capacidad: number }[];
  excepcion: { id: string; s: number };
  planClasificacion: { rutas: { id: string; peso: number; rampas: string[] }[]; multiRampa: 'alternar' | 'la-menos-llena' };
  perfilPaquete: { clases: { id: string; fraccion: number; bandejas: 1 | 2; transportable: boolean }[] };
  jaulas: { capacidad: number; cierre: Num };
}

export interface Sorter {
  id: string;
  tipo: 'bandeja-basculante' | 'banda-cruzada';
  forma: 'estadio';
  recta: number;
  radio: number;
  origen: [number, number];
  paso: number;
  velocidad: number;
  maxVueltas: number;
  lector: { s: number; noLeido: Num };
  paradas: { activas: boolean; entre: Dist; duracion: Dist };   // micro-paradas: tiempo en marcha entre paradas y duración (s)
}

export interface Pausas { duracion: Seg; cada: Seg; primera: Seg; escalon: Seg }
export interface Personas {
  induccion: {
    puestosActivos: number;          // cuántos puestos tienen persona (≤ puestos físicos)
    temporarios: number;             // cuántos de esos son temporarios (los últimos)
    reten: number;                   // personas de retén que cubren ausencias (primero inducción, después rampa)
    antiguedadSemanas: number;       // informativo en el corte 1 (el aprendizaje por semanas es del corte 3)
    ausentismo: Num;                 // probabilidad de faltar en la noche, por persona
    eficienciaTemporario: Num;       // productividad relativa de un temporario (multiplica la tasa)
    pausas: Pausas;
  };
  descarga: { ritmo: Dist };          // s por paquete por persona de andén
  rampa: {
    cantidad: number;
    asignacion: 'por-volumen' | 'contiguas' | string[][];
    regla: 'la-mas-llena' | 'la-que-se-llena-antes' | 'en-orden';
    manejo: Dist;                    // s por paquete de la rampa a la jaula
    caminar: Num;                    // s al cambiar de rampa
    pausas: Pausas;
    ausentismo: Num;
  };
  excepcion: { cantidad: number; tiempo: Dist };   // s por paquete en el puesto manual
  fatiga: { activa: boolean; maximo: Num; tau: Num }; // apagada por defecto (corte-1.md §5.3, doble conteo)
}

export interface Costos { horaPersona: Num; fijoNoche: Num; moneda: 'ARS' | 'USD' }

export interface Decision {
  id: string;
  pregunta: string;
  tipo: 'dotacion';
  /** JSON Pointer (RFC 6901) a un entero del modelo, p. ej. '/personas/induccion/puestosActivos'. */
  variable: { ruta: string; min: number; max: number };
  /** P(kpi comparador umbral) ≥ probabilidadMinima. */
  restriccion: { kpi: KpiId; comparador: '<=' | '>='; umbral: number; probabilidadMinima: number; dichoComo: string };
  objetivo: { minimizar: KpiId };
  indiferencia: { kpi: KpiId; valor: number };
  confianza: number;
}

export type OpParche =
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }
  | { op: 'test'; path: string; value: unknown };

export interface Escenario { id: string; titulo: string; parche: OpParche[] }

export interface Experimento {
  semilla: number;
  replicasMin: number;
  replicasMax: number;
  confianza: number;
  precision?: { kpi: KpiId; relativa: number };
  nochesEscena: number;
  nocheMostrada: 'mediana' | 'peor' | number;
  kpiNoche: KpiId;                    // con qué KPI se ordenan las noches para elegir la mediana y la peor
}

/** Diagnóstico del compilador: el texto sale de i18n con la clave y las variables. */
export interface Diagnostico {
  codigo: string;                     // p. ej. 'E-UNIDAD', 'E-REF', 'A-RHO', 'A-LITTLE'
  nivel: 'error' | 'aviso' | 'info';
  ruta: string;                       // JSON Pointer al campo
  clave: string;                      // clave i18n
  vars?: Record<string, string | number>;
}

/** Borrador analítico (F0): cuentas de capacidad que salen en microsegundos y sirven de alarma, nunca de respuesta. */
export interface EstimacionF0 {
  llegadaMediaPorHora: number;
  capacidadDescargaPorHora: number;
  capacidadInduccionPorHora: number;
  capacidadSorterTeoricaPorHora: number;   // velocidad / paso · 3600
  capacidadRampasPorHora: number;
  cuello: 'descarga' | 'induccion' | 'sorter' | 'rampas';
  utilizacion: { descarga: number; induccion: number; sorter: number; rampas: number };
  finEstimado: Hora;                       // con capacidades medias, sin azar
}

export interface ModeloValidado {
  modelo: Modelo;
  huella: string;                          // SHA-256 del JSON canónico, 16 hex
  diagnosticos: Diagnostico[];
  f0: EstimacionF0;
}

/** Compila un modelo (texto ya parseado, entrada no confiable): valida, normaliza, chequea y calcula F0 y la huella. */
export type Compilar = (x: unknown) => Promise<{ ok: true; mv: ModeloValidado } | { ok: false; diagnosticos: Diagnostico[] }>;
/** Aplica un parche y vuelve a compilar: así se arman los escenarios, las variantes de la decisión y los contrafactuales. */
export type Variante = (mv: ModeloValidado, parche: OpParche[]) => Promise<ModeloValidado>;
export type CalcularF0 = (m: Modelo) => EstimacionF0;
/** Para compartir: renombra rutas, rampas y personas, escala volúmenes y redondea costos de forma determinista con la semilla. */
export type Anonimizar = (m: Modelo, semilla: number) => Modelo;
/** Presupuesto estimado ANTES de correr (para rechazar entradas que colgarían el teléfono de quien abre un enlace). */
export type EstimarPresupuesto = (m: Modelo) => { paquetes: number; eventos: number };
```

### `contratos/referencias.ts`

```ts
// contratos/referencias.ts · CONGELADO (código literal, lo usan todos los paquetes).
import type { Distribucion } from './azar.ts';
import type { Dist, Modelo, ModeloValidado, Num, Parametro, Ref } from './modelo.ts';

export function esRef(x: unknown): x is Ref {
  return typeof x === 'string' && x.startsWith('@');
}
export function parametro(m: Modelo, r: Ref): Parametro {
  const p = m.parametros[r.slice(1)];
  if (!p) throw new Error(`parámetro inexistente: ${r}`);
  return p;
}
/** Valor numérico de un campo Num. Un parámetro con distribución 'fija' cuenta como número. */
export function numero(m: Modelo, x: Num): number {
  if (!esRef(x)) return x;
  const v = parametro(m, x).valor;
  if (typeof v === 'number') return v;
  if (v.tipo === 'fija') return v.valor;
  throw new Error(`${x} es una distribución y se pidió un número`);
}
/** Distribución de un campo Dist. Un parámetro numérico cuenta como distribución 'fija'. */
export function distribucion(m: Modelo, x: Dist): Distribucion {
  if (!esRef(x)) return x;
  const v = parametro(m, x).valor;
  return typeof v === 'number' ? { tipo: 'fija', valor: v } : v;
}
/** SOLO PARA PRUEBAS: envuelve un modelo sin pasar por el compilador (huella '0000000000000000', sin diagnósticos). */
export function validadoSinChequeos(m: Modelo): ModeloValidado {
  return {
    modelo: m, huella: '0000000000000000', diagnosticos: [],
    f0: { llegadaMediaPorHora: 0, capacidadDescargaPorHora: 0, capacidadInduccionPorHora: 0, capacidadSorterTeoricaPorHora: 0,
      capacidadRampasPorHora: 0, cuello: 'induccion', utilizacion: { descarga: 0, induccion: 0, sorter: 0, rampas: 0 }, finEstimado: '00:00' },
  };
}
```

### `contratos/experimentos.ts`

```ts
// contratos/experimentos.ts · CONGELADO. Réplicas, estadística por defecto, decisión, semáforo y comprobante.
import type { Ms } from './tipos-base.ts';
import type { ModeloValidado, Variante } from './modelo.ts';
import type { KpiId, ResultadoReplica } from './resultados.ts';
import type { NivelTraza, Traza } from './traza.ts';
import type { MensajeAlTrabajador, MensajeDelTrabajador } from './mensajes-worker.ts';

/** Una noche: función pura de (modelo, semilla, réplica). La implementa el paquete del hub. */
export type Simulador = (mv: ModeloValidado, semilla: number, replica: number, o: { traza: NivelTraza }) => SalidaSimulacion;
export interface SalidaSimulacion { resultado: ResultadoReplica; traza?: Traza }

export interface Resumen {
  kpi: KpiId;
  n: number;
  media: number;
  desvio: number;
  confianza: number;
  ic: [number, number];          // t de Student sobre réplicas independientes; nunca sobre una sola corrida
  semiancho: number;
  p50: number;
  p90: number;
  icP90: [number, number] | null; // estadísticos de orden (binomial); null si n < 20
  min: number;
  max: number;
}
export interface Proporcion { exitos: number; n: number; p: number; ic: [number, number]; metodo: 'wilson'; confianza: number }
export interface Comparacion {
  kpi: KpiId;
  n: number;
  pareada: true;                 // misma semilla y réplica en A y B (números aleatorios comunes)
  media: number;                 // media de B − A
  ic: [number, number];
  veredicto: 'b-mejor' | 'a-mejor' | 'no-se-distingue';
  /** Si no se distingue: réplicas que harían falta para que el semiancho sea la mitad de |media| (null si media = 0). */
  replicasSugeridas: number | null;
}

export type EstadoConfiguracion = 'cumple' | 'no-cumple' | 'en-duda';
export interface EvaluacionConfiguracion {
  valor: number;                 // valor de la variable de decisión
  prop: Proporcion;              // P(restricción) con su IC de Wilson
  estado: EstadoConfiguracion;   // cumple: IC inferior ≥ meta · no-cumple: IC superior < meta · en-duda: el IC cruza la meta
  objetivo: Resumen;             // KPI a minimizar
}
export interface EvaluacionDecision {
  decision: string;
  configuraciones: EvaluacionConfiguracion[];
  recomendacion: number | null;  // el menor valor que «cumple», si todos los menores «no cumplen»; si no, null
  semaforo: Semaforo;
  replicasUsadas: number;
}

export type MotivoSemaforo =
  | 'ok' | 'precision-no-lograda' | 'decision-en-duda' | 'pocas-replicas' | 'inestable' | 'conservacion' | 'invariante'
  | 'fuera-de-dominio' | 'modelo-con-errores';
export interface Semaforo { color: 'verde' | 'amarillo' | 'rojo'; motivo: MotivoSemaforo; vars: Record<string, string | number> }

export interface Receta {
  v: 1;
  modelo: string;               // huella del modelo
  motor: string;                // versión del motor, p. ej. '1.0.0'
  semilla: number;
  replicas: number;
  noche?: number;               // réplica que se muestra en la escena
  t?: Ms;                       // instante del cabezal
  vel?: number;                 // velocidad de reproducción
  esc?: string[];               // escenarios (ids) en pantalla dividida
}
export interface Comprobante {
  receta: Receta;
  huellaAgregada: string;       // huella de las huellas por réplica, en orden de índice
  motor: { version: string; pruebasExigibles: number; pasaron: number; fecha: string };
  modelo: { controles: number; pasaron: number; avisos: number };
  semaforo: Semaforo;
  procedencia: { hecho: number; medido: number; estimacion: number; hipotesis: number; supuesto: number; datoUsuario: number };
  validacion: { estado: 'sin-validar' } | { estado: 'validado'; dias: number; dentroDelIntervalo: number };
}

export const Prioridad = { VISTA_PREVIA: 0, CONFIRMACION: 1, NOCHES: 2, DECISION: 3, TAMIZADO: 4 } as const;
export type Prioridad = (typeof Prioridad)[keyof typeof Prioridad];

export interface Trabajo {
  id: string;
  prioridad: Prioridad;
  mv: ModeloValidado;
  semilla: number;
  replicas: [number, number];    // [desde, hasta)
  traza: NivelTraza;
}
/** Planificador de réplicas: prioridades, cancelación inmediata, agregación por índice (nunca por orden de llegada). */
export interface Planificador {
  readonly trabajadores: number;
  enviar(t: Trabajo, alResultado: (r: ResultadoReplica, traza?: Traza) => void): Promise<{ completadas: number; cancelado: boolean }>;
  cancelar(id: string): void;
  cancelarDesde(p: Prioridad): void;   // cancela todo lo de prioridad ≥ p (p. ej. al mover el deslizador)
  cerrar(): void;
}
/** Abstracción de un Worker (Web Worker en el navegador; en proceso o worker_threads en Node). */
export interface PuertoTrabajador {
  enviar(m: MensajeAlTrabajador, transferir?: Transferable[]): void;
  alRecibir(f: (m: MensajeDelTrabajador) => void): void;
  terminar(): void;
}
export type FabricaTrabajador = () => PuertoTrabajador;

// ---- Funciones (firmas congeladas; las implementa experimentos/) ----
export type Resumir = (rs: ResultadoReplica[], kpi: KpiId, confianza: number) => Resumen;
export type Proporcionar = (rs: ResultadoReplica[], kpi: KpiId, comparador: '<=' | '>=', umbral: number, confianza: number) => Proporcion;
/** Pareado por índice de réplica: a[i] y b[i] tienen que tener la misma semilla y réplica (lanza si no). */
export type CompararPareado = (a: ResultadoReplica[], b: ResultadoReplica[], kpi: KpiId, confianza: number) => Comparacion;
/** Réplicas secuenciales: replicasIniciales por valor de la variable y después tandas solo para los valores «en duda». */
export type EvaluarDecision = (mv: ModeloValidado, p: Planificador, variante: Variante,
  o: { replicasIniciales: number; tanda: number; replicasMax: number; alProgreso?: (hechas: number, maximo: number) => void }) => Promise<EvaluacionDecision>;
export type ArmarComprobante = (mv: ModeloValidado, rs: ResultadoReplica[], semaforo: Semaforo,
  motor: Comprobante['motor'], receta: Omit<Receta, 'v' | 'modelo' | 'motor'>) => Promise<Comprobante>;
export type CrearPlanificador = (fabrica: FabricaTrabajador, trabajadores: number) => Planificador;
/** Trabajador en el mismo hilo (Node y pruebas): corre el simulador al recibir 'correr'. */
export type TrabajadorEnProceso = (sim: Simulador, motor: string) => FabricaTrabajador;
```

### `contratos/mensajes-worker.ts`

```ts
// contratos/mensajes-worker.ts · CONGELADO. Protocolo entre la interfaz (o el planificador) y cada Worker de simulación.
import type { ModeloValidado } from './modelo.ts';
import type { ResultadoReplica } from './resultados.ts';
import type { NivelTraza, Traza } from './traza.ts';

export type MensajeAlTrabajador =
  | { tipo: 'correr'; id: string; mv: ModeloValidado; semilla: number; desde: number; hasta: number; traza: NivelTraza }
  | { tipo: 'cancelar'; id: string }
  | { tipo: 'sonda' };   // pide { tipo: 'listo' } con la versión del motor

export type MensajeDelTrabajador =
  | { tipo: 'listo'; motor: string }
  | { tipo: 'resultado'; id: string; resultado: ResultadoReplica; traza?: Traza }   // las columnas de la traza viajan transferidas
  | { tipo: 'fin'; id: string; completadas: number }
  | { tipo: 'error'; id: string; mensaje: string };
```

### `contratos/escena.ts`

```ts
// contratos/escena.ts · CONGELADO. La escena viaja en el fragmento (#) del enlace: nunca llega a un servidor.
import type { Modelo, OpParche } from './modelo.ts';
import type { Receta } from './experimentos.ts';

/** Límites de toda entrada que llega por enlace, QR o galería (entrada no confiable). */
export const LIMITES_ENLACE = {
  maxCaracteres: 16000,
  maxBytesDescomprimidos: 262144,
  maxProfundidadJson: 32,
  maxNodosJson: 20000,
  maxLargoTexto: 1000,
  maxPaquetesEstimados: 2000000,
  maxEventosEstimados: 50000000,
} as const;

export type Enlace =
  | { tipo: 'modelo'; modelo: Modelo; receta?: Receta }
  | { tipo: 'plantilla'; plantilla: { id: string; version: string }; parche: OpParche[]; receta?: Receta }
  | { tipo: 'receta'; receta: Receta };

export type ErrorEnlace =
  | 'formato' | 'muy-largo' | 'bomba' | 'json-invalido' | 'json-profundo' | 'esquema' | 'presupuesto'
  | 'plantilla-desconocida' | 'version-motor';

/** Devuelve la plantilla publicada (inmutable) o null si no existe. La inyecta la integración (plantillas del paquete del hub). */
export type ResolverPlantilla = (id: string, version: string) => Modelo | null;
export interface CodecEnlace {
  /** Fragmento sin '#': 'm=<deflate-raw base64url>&r=<receta>' · 't=<id>@<versión>&p=<parche>&r=…' · 'r=<receta>'. */
  codificar(e: Enlace): Promise<string>;
  decodificar(fragmento: string): Promise<{ ok: true; enlace: Enlace } | { ok: false; error: ErrorEnlace; detalle?: string }>;
}
export type CrearCodec = (resolver: ResolverPlantilla) => CodecEnlace;
/** JSON canónico: claves ordenadas por código de unidad UTF-16, sin espacios, números con JSON.stringify. */
export type JsonCanonico = (x: unknown) => string;
/** SHA-256 (crypto.subtle) del JSON canónico, primeros 16 caracteres hex. */
export type HuellaModelo = (m: Modelo) => Promise<string>;
/** Aplica un parche RFC 6902 (add, remove, replace, test) sin modificar el original; lanza si un 'test' falla. */
export type AplicarParche = (doc: Modelo, ops: OpParche[]) => Modelo;
```

### `contratos/vistas.ts`

```ts
// contratos/vistas.ts · CONGELADO. Reproductor de tramos y vistas 2D / 2,5D. La vista nunca le pide nada al motor.
import type { Ms } from './tipos-base.ts';
import type { ClaseEntidad, Traza } from './traza.ts';
import type { KpiId, ResultadoReplica } from './resultados.ts';

/** Estado visual de una entidad móvil (el color sale del estilo, la forma distingue en escala de grises). */
export const EstadoVisual = {
  NORMAL: 0, DANDO_VUELTA: 1, EXCEPCION: 2, ESPERANDO: 3, ATRASADO: 4, SELECCIONADO: 5, EN_CAMION: 6,
} as const;
export type EstadoVisual = (typeof EstadoVisual)[keyof typeof EstadoVisual];

/** Salida reutilizable del reproductor (sin asignar memoria por cuadro). Coordenadas en metros. */
export interface Posiciones {
  n: number;
  x: Float32Array; y: Float32Array; ang: Float32Array;
  estado: Uint8Array;      // EstadoVisual
  clase: Uint8Array;       // ClaseEntidad
  id: Int32Array;
}
export interface EstadoRecursos {
  pasoLazo: number;                // k(t) con fracción (para animar bandejas)
  lazoDetenido: boolean;
  rampaOcupacion: Float32Array;    // paquetes en cada rampa
  rampaLlena: Uint8Array;
  filaAcumulacion: number;
  puestoEstado: Uint8Array;        // 0 libre · 1 induce · 2 espera bandeja · 3 pausa · 4 sin persona
  personaEstado: Uint8Array;       // 0 libre · 1 trabaja · 2 pausa · 3 camina · 4 ausente · 5 cierra jaula
}
export interface Reproductor {
  readonly traza: Traza;
  readonly inicio: Ms;
  readonly fin: Ms;
  /** Capacidad máxima de entidades visibles a la vez (para dimensionar Posiciones). */
  readonly maxVisibles: number;
  crearPosiciones(): Posiciones;
  crearEstadoRecursos(): EstadoRecursos;
  posiciones(t: Ms, out: Posiciones): void;
  recursos(t: Ms, out: EstadoRecursos): void;
  /** Entidad más cercana a (x, y) en metros dentro del radio, en el instante t. */
  tocar(x: number, y: number, t: Ms, radio: number): { clase: ClaseEntidad; id: number } | null;
}
export type CrearReproductor = (t: Traza) => Reproductor;

export type Piso = '2d' | 'iso';
export interface Camara { cx: number; cy: number; zoom: number; giro: number }
export interface Estilo { tema: 'claro' | 'oscuro'; colores: Record<string, string>; reducirMovimiento: boolean }
export interface OpcionesDibujo { seleccion?: { clase: ClaseEntidad; id: number } | null; riesgo?: MapaRiesgo | null; fantasma?: Reproductor | null }
export interface Vista {
  readonly piso: Piso;
  camara: Camara;
  dibujar(t: Ms, o?: OpcionesDibujo): void;
  redimensionar(ancho: number, alto: number, dpr: number): void;
  /** Pantalla (px) → mundo (m), para tocar. */
  aMundo(px: number, py: number): [number, number];
  destruir(): void;
}
export type CrearVista = (lienzo: HTMLCanvasElement | OffscreenCanvas, r: Reproductor, estilo: Estilo, piso: Piso) => Vista;
/** Mide el primer segundo y elige: 'iso' si el cuadro 2,5D tarda ≤ 10 ms; si no, '2d'. El 3D (corte 2) se suma con su regla. */
export type ElegirPiso = (medirCuadroIsoMs: () => number) => Piso;

/** Cien noches pintadas sobre el plano (se arma con ResultadoReplica, sin trazas completas). */
export interface MapaRiesgo {
  noches: number;
  rampaProbLlena: Float32Array;        // fracción de noches en que la rampa se llenó al menos una vez
  rampaMinutosLlenaP90: Float32Array;
  filaP50: Float32Array;               // por cuarto de hora
  filaP90: Float32Array;
  finClasificacionMin: { p10: number; p50: number; p90: number };
  nocheMediana: number;                // réplica que es la mediana según kpiNoche
  nochePeor: number;                   // réplica que es la peor según kpiNoche
}
export type AgregarRiesgo = (resultados: ResultadoReplica[], kpiNoche: KpiId) => MapaRiesgo;

/** Marca de la línea de tiempo. titulo es una clave i18n con variables. */
export interface MomentoEscena { t: Ms; tipo: number; r: number; importancia: number; clave: string; vars: Record<string, string | number> }
export type DetectarMomentos = (t: Traza) => MomentoEscena[];
```

### `contratos/explicacion.ts`

```ts
// contratos/explicacion.ts · CONGELADO. Esperas tipadas, biografías, contrafactuales y frases verificables.
import type { Ms } from './tipos-base.ts';
import type { Causa, ClaseEntidad, TipoTramo, Traza } from './traza.ts';
import type { KpiId } from './resultados.ts';
import type { Comparacion, Proporcion, Resumen, Simulador } from './experimentos.ts';
import type { Modelo, ModeloValidado, OpParche, Variante } from './modelo.ts';

export interface Espera {
  desde: Ms;
  hasta: Ms;
  donde: TipoTramo;
  recurso: number;
  causa: Causa;
  causante: number;              // refDe(clase, id) o -1
  evidencia: number[];           // índices de tramos de la traza que sostienen la causa
}

/** Una cifra dentro de una frase, con de dónde sale. Ninguna frase se muestra con una cifra sin fuente. */
export interface Afirmacion {
  valor: number;
  unidad: string;
  decimales: number;
  fuente:
    | { tipo: 'traza'; tramo: number; campo: 'duracion' | 't0' | 't1' | 'a' }
    | { tipo: 'experimento'; id: string; kpi: KpiId; campo: 'media' | 'p90' | 'diferencia' | 'prob' }
    | { tipo: 'parametro'; nombre: string };
  sentido?: 'sube' | 'baja' | 'igual';
  diferenciaReal?: boolean;      // solo puede ser true si el IC de la comparación excluye el cero
}
export interface Frase { clave: string; vars: Record<string, string | number>; afirmaciones: Afirmacion[] }

export interface PasoBiografia { desde: Ms; hasta: Ms; frase: Frase; espera: Espera | null }
export interface Biografia {
  clase: ClaseEntidad;
  id: number;
  titulo: Frase;
  pasos: PasoBiografia[];
  /** Percentil del tiempo en el hub de este paquete entre los de su noche (0–100), si es un paquete. */
  percentil: number | null;
  /** Siempre vacío al salir de ArmarBiografia (que es síncrona y no simula): lo llena CausasConfirmadas. */
  causas: Frase[];
}
export type ArmarBiografia = (t: Traza, m: Modelo, clase: ClaseEntidad, id: number) => Biografia;
export type EsperasDe = (t: Traza, clase: ClaseEntidad, id: number) => Espera[];

export interface Contrafactual {
  clase: ClaseEntidad;
  /** Clave estable del paquete (camion, indice): sobrevive al cambio de escenario. */
  camion: number;
  indice: number;
  cambio: { clave: string; vars: Record<string, string | number>; parche: OpParche[] };
  semilla: number;
  replica: number;
  antes: { listo: Ms | null; antesDelCorte: boolean };
  despues: { listo: Ms | null; antesDelCorte: boolean };
  /** El cambio movió el resultado de ESTE paquete en el sentido que afirma la causa. */
  confirma: boolean;
}
export type ContrafactualDirigido = (
  sim: Simulador, mv: ModeloValidado, semilla: number, replica: number, camion: number, indice: number,
  cambio: Contrafactual['cambio'], variante: Variante,
) => Promise<Contrafactual>;

/**
 * Candidatas = esperas largas del paquete; para cada una corre su contrafactual (cambio fijo por causa, corte-1.md §9 P7) con la misma
 * semilla y réplica, y devuelve como causa solo las confirmadas (más la conjunta si ninguna sola confirma y la conjunta sí).
 */
export type CausasConfirmadas = (t: Traza, mv: ModeloValidado, semilla: number, replica: number, camion: number, indice: number,
  contrafactual: (cambio: Contrafactual['cambio']) => Promise<Contrafactual>) => Promise<{ causas: Frase[]; contrafactuales: Contrafactual[] }>;

export interface AlmacenResultados {
  experimentos: Record<string, { resumen?: Partial<Record<KpiId, Resumen>>; comparacion?: Partial<Record<KpiId, Comparacion>>; prop?: Proporcion }>;
  trazas: Record<string, Traza>;
  modelo: Modelo;
}
export type MotivoFalla = 'sin-fuente' | 'valor-distinto' | 'signo-invertido' | 'diferencia-no-real' | 'fuente-inexistente';
export interface Verificacion { ok: boolean; fallas: { frase: number; afirmacion: number; motivo: MotivoFalla }[] }
export type VerificarFrases = (frases: Frase[], almacen: AlmacenResultados, trazaId?: string) => Verificacion;
```

### `contratos/decision.ts`

```ts
// contratos/decision.ts · CONGELADO. Preguntar lo que cambia la decisión (sin IA en el corte 1: formularios).
import type { Frase } from './explicacion.ts';
import type { EvaluacionDecision } from './experimentos.ts';
import type { ModeloValidado, Variante } from './modelo.ts';

export interface SupuestoTamizable {
  parametro: string;             // nombre en modelo.parametros (tiene que tener `incierto`)
  valores: [number, number, number];
  pesos: [number, number, number];
  golpeDiscreto: boolean;
}
export interface ResultadoTamizado {
  parametro: string;
  decisiones: [number | null, number | null, number | null];   // recomendación con el valor bajo, medio y alto
  cambiaDecision: boolean;
  /** Pérdida esperada de decidir hoy con el valor medio: Σ pesoᵢ · |costo(dᵢ) − costo(d_medio)|, en moneda del modelo por noche. */
  perdidaEsperada: number;
  /** Cuánto se corre el KPI objetivo entre los extremos con la decisión del valor medio (ranking clásico, secundario). */
  corrimientoObjetivo: number;
  replicas: number;
  evaluaciones: [EvaluacionDecision, EvaluacionDecision, EvaluacionDecision];
}
/** Cancelable: el planificador corre las evaluaciones con prioridad TAMIZADO y las cancela si el usuario cambia algo. */
export type Tamizar = (mv: ModeloValidado, supuestos: SupuestoTamizable[], evaluar: (mv: ModeloValidado) => Promise<EvaluacionDecision>,
  variante: Variante, o: { alProgreso?: (hechos: number, total: number) => void }) => Promise<ResultadoTamizado[]>;
/** Los supuestos tamizables salen de los parámetros con `incierto`. */
export type SupuestosDe = (mv: ModeloValidado) => SupuestoTamizable[];

/** n ≈ (1,96 · cv / ε)²: observaciones para estimar la media con error relativo ε al 95%. */
export interface PlanMedicion { parametro: string; cv: number; errorRelativo: number; observaciones: number; minutos: number }
export interface Pregunta {
  parametro: string;
  orden: number;
  texto: string;                 // la pregunta en criollo (de Parametro.pregunta)
  porQue: Frase;                 // «cambia la respuesta en hasta N puestos»
  referencia: { valor: number; fuente: string; etiqueta: string };
  rango: [number, number];
  medir: PlanMedicion;
  perdidaEsperada: number;
}
export type ArmarFormulario = (mv: ModeloValidado, ranking: ResultadoTamizado[]) => Pregunta[];
export type PlanDeMedicion = (parametro: string, cv: number, errorRelativo: number, segundosPorObservacion: number) => PlanMedicion;
```

### `contratos/hub.ts`

```ts
// contratos/hub.ts · CONGELADO. Lo que exporta el paquete del hub para los demás.
import type { Modelo, OpParche } from './modelo.ts';
import type { GeometriaHub } from './geometria.ts';
import type { Simulador } from './experimentos.ts';

/** Una noche del hub (fidelidad F3, mecanismo). */
export type SimularNoche = Simulador;
export type GeometriaDe = (m: Modelo) => GeometriaHub;
/** Escenario «balancear el plan»: asignación de personas de rampa por volumen esperado (corte-1.md §6.7, regla 7). */
export type PlanBalanceado = (m: Modelo) => OpParche[];
/** Plantillas publicadas e inmutables, por 'id@versión' (p. ej. 'hub-lazo-noche@1.0.0', 'hub-chico@1.0.0'). */
export type RegistroPlantillas = Readonly<Record<string, Modelo>>;
```

### `contratos/servicios.ts`

```ts
// contratos/servicios.ts · CONGELADO. La única puerta de la interfaz (app/) hacia el resto. La arma la integración
// (integracion/puente.ts) con los Workers; la interfaz se desarrolla con una versión falsa sobre la maqueta (app/servicios-falsos.ts).
import type { Anonimizar, Compilar, ModeloValidado, OpParche, Variante } from './modelo.ts';
import type { CodecEnlace } from './escena.ts';
import type { GeometriaDe, PlanBalanceado, RegistroPlantillas } from './hub.ts';
import type { Comprobante, CompararPareado, EvaluacionDecision, Prioridad, Proporcionar, Resumir, SalidaSimulacion, Semaforo } from './experimentos.ts';
import type { ResultadoReplica } from './resultados.ts';
import type { AgregarRiesgo, CrearReproductor, CrearVista, DetectarMomentos, ElegirPiso } from './vistas.ts';
import type { ArmarBiografia, Contrafactual, Frase, VerificarFrases } from './explicacion.ts';
import type { Traza } from './traza.ts';
import type { ArmarFormulario, ResultadoTamizado } from './decision.ts';

export interface Servicios {
  readonly versionMotor: string;
  readonly trabajadores: number;
  readonly plantillas: RegistroPlantillas;
  compilar: Compilar;
  variante: Variante;
  codec: CodecEnlace;
  anonimizar: Anonimizar;
  geometria: GeometriaDe;
  planBalanceado: PlanBalanceado;
  /** Una noche con traza completa (la película). */
  noche(mv: ModeloValidado, semilla: number, replica: number, prioridad: Prioridad): Promise<SalidaSimulacion>;
  /** Noches [desde, hasta) sin traza, devueltas en orden de índice; alProgreso recibe cada una apenas llega. */
  noches(mv: ModeloValidado, semilla: number, desde: number, hasta: number, prioridad: Prioridad,
    alProgreso?: (r: ResultadoReplica) => void): Promise<ResultadoReplica[]>;
  cancelarDesde(p: Prioridad): void;
  resumir: Resumir;
  proporcion: Proporcionar;
  comparar: CompararPareado;
  evaluarDecision(mv: ModeloValidado, alProgreso?: (hechas: number, maximo: number) => void): Promise<EvaluacionDecision>;
  tamizar(mv: ModeloValidado, alProgreso?: (hechos: number, total: number) => void): Promise<ResultadoTamizado[]>;
  formulario: ArmarFormulario;
  agregarRiesgo: AgregarRiesgo;
  detectarMomentos: DetectarMomentos;
  crearReproductor: CrearReproductor;
  crearVista: CrearVista;
  elegirPiso: ElegirPiso;
  biografia: ArmarBiografia;
  contrafactual(mv: ModeloValidado, semilla: number, replica: number, camion: number, indice: number,
    cambio: { clave: string; vars: Record<string, string | number>; parche: OpParche[] }): Promise<Contrafactual>;
  /** Causas confirmadas por contrafactual para un paquete de la noche mostrada (corre simulaciones: es asíncrona). */
  causas(t: Traza, mv: ModeloValidado, camion: number, indice: number): Promise<{ causas: Frase[]; contrafactuales: Contrafactual[] }>;
  verificar: VerificarFrases;
  comprobante(mv: ModeloValidado, rs: ResultadoReplica[], semaforo: Semaforo): Promise<Comprobante>;
}
```

### `contratos/i18n.ts`

```ts
// contratos/i18n.ts · CONGELADO. Español primero; inglés con la misma estructura de claves. Ningún texto de interfaz va fijo en el código.
import type { Idioma } from './tipos-base.ts';
/** 'pantalla.elemento.detalle' → 'Texto con {variable}'. Las claves son las mismas en todos los idiomas (una prueba lo verifica). */
export type Diccionario = Record<string, string>;
export type Traducir = (clave: string, vars?: Record<string, string | number>) => string;
export interface Formato {
  idioma: Idioma;
  numero(x: number, decimales?: number): string;       // es-AR: 1.234,5
  porcentaje(x: number, decimales?: number): string;   // x en 0–1
  moneda(x: number, moneda: 'ARS' | 'USD'): string;
  hora(ms: number): string;                            // HH:MM, módulo 24
  duracion(ms: number): string;                        // «1 h 05 min», «45 s»
}
```

## Anexo B · Motor de referencia (código literal de `corte-1-paso0/contratos/referencia/motor-referencia.ts`)

Es la semántica del núcleo escrita como programa: Philox, la conversión a uniformes, las distribuciones, el orden del calendario y la huella
exactamente como en §6. El núcleo de producción tiene que dar las mismas huellas (R08).

```ts
// contratos/referencia/motor-referencia.ts · Implementación de REFERENCIA del contrato del motor: simple, lenta y legible.
// Para qué: (1) que los paquetes corran su código antes de que exista nucleo/ y (2) la prueba diferencial R08: el núcleo de
// producción tiene que dar la MISMA huella que esta referencia en los mismos modelos. Usa Math.* nativo (en V8 coincide bit a bit
// con la matemática propia: MEDIDO el 17-10-2026); no implementa foto ni restaurar. No se usa en la app.
import { Fase, type Ms } from '../tipos-base.ts';
import type { Direccion, Distribucion, FuenteAzar } from '../azar.ts';
import type { Bloque, EstadoCorrida, Motor, OpcionesMotor, ResultadoCorrida, Foto } from '../motor.ts';
import type { MatematicaDeterminista } from '../matematica.ts';
import type { Causa, EscritorTraza, NivelTraza, TipoMomento, TipoTramo, Traza } from '../traza.ts';

// ---- Philox4x32-10 (Salmon y otros, SC11) ----
const M0 = 0xd2511f53, M1 = 0xcd9e8d57, W0 = 0x9e3779b9, W1 = 0xbb67ae85;
function mulhi(a: number, b: number): number {
  const a0 = a & 0xffff, a1 = a >>> 16, b0 = b & 0xffff, b1 = b >>> 16;
  const p00 = a0 * b0, p01 = a0 * b1, p10 = a1 * b0, p11 = a1 * b1;
  const mid = (p00 >>> 16) + (p01 & 0xffff) + (p10 & 0xffff);
  return (p11 + (p01 >>> 16) + (p10 >>> 16) + (mid >>> 16)) >>> 0;
}
export function philox4x32_10(c0: number, c1: number, c2: number, c3: number, k0: number, k1: number, out: Uint32Array): void {
  for (let r = 0; r < 10; r++) {
    const h0 = mulhi(M0, c0), l0 = Math.imul(M0, c0) >>> 0, h1 = mulhi(M1, c2), l1 = Math.imul(M1, c2) >>> 0;
    const n0 = (h1 ^ c1 ^ k0) >>> 0, n2 = (h0 ^ c3 ^ k1) >>> 0;
    c0 = n0; c1 = l1; c2 = n2; c3 = l0; k0 = (k0 + W0) >>> 0; k1 = (k1 + W1) >>> 0;
  }
  out[0] = c0; out[1] = c1; out[2] = c2; out[3] = c3;
}
const UTF8 = new TextEncoder();
/** FNV-1a de 32 bits sobre los bytes UTF-8 de `${ruta}/${proposito}`. */
export function claveDe(ruta: string, proposito: string): number {
  let h = 0x811c9dc5;
  for (const b of UTF8.encode(`${ruta}/${proposito}`)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h >>> 0;
}
export const matNativa: MatematicaDeterminista = {
  log: Math.log, exp: Math.exp, cos: Math.cos, sin: Math.sin, sqrt: Math.sqrt,
  pow: (x, y) => (y === 0 ? 1 : x === 0 ? 0 : Math.exp(y * Math.log(x))),
};
export function crearFuenteAzarReferencia(semilla: number, replica: number, mat: MatematicaDeterminista = matNativa): FuenteAzar {
  const out = new Uint32Array(4);
  const bloque = (d: Direccion, sub: number, o: Uint32Array) =>
    philox4x32_10(replica >>> 0, d.a >>> 0, d.b >>> 0, ((d.c & 0xffffff) * 256 + (sub & 0xff)) >>> 0, semilla >>> 0, d.clave >>> 0, o);
  const uniforme = (d: Direccion, i = 0): number => {
    bloque(d, i >> 1, out);
    const hi = (i & 1) === 0 ? out[0] : out[2], lo = (i & 1) === 0 ? out[1] : out[3];
    return ((hi >>> 5) * 67108864 + (lo >>> 6) + 0.5) / 9007199254740992;
  };
  const normal = (d: Direccion): number => mat.sqrt(-2 * mat.log(uniforme(d, 0))) * mat.cos(2 * Math.PI * uniforme(d, 1));
  const sortear = (x: Distribucion, d: Direccion): number => {
    switch (x.tipo) {
      case 'fija': return x.valor;
      case 'uniforme': return x.min + (x.max - x.min) * uniforme(d, 0);
      case 'exponencial': return -x.media * mat.log(uniforme(d, 0));
      case 'triangular': {
        const u = uniforme(d, 0), f = (x.moda - x.min) / (x.max - x.min);
        return u < f ? x.min + mat.sqrt(u * (x.max - x.min) * (x.moda - x.min)) : x.max - mat.sqrt((1 - u) * (x.max - x.min) * (x.max - x.moda));
      }
      case 'normal': {
        const v = x.media + x.desvio * normal(d);
        return Math.min(x.max ?? Infinity, Math.max(x.min ?? -Infinity, v));
      }
      case 'lognormal': {
        const s2 = mat.log(1 + x.cv * x.cv);
        return mat.exp(mat.log(x.media) - s2 / 2 + mat.sqrt(s2) * normal(d));
      }
      case 'erlang': { let s = 0; for (let i = 0; i < x.k; i++) s += mat.log(uniforme(d, i)); return -(x.media / x.k) * s; }
      case 'weibull': return x.escala * mat.exp(mat.log(-mat.log(uniforme(d, 0))) / x.forma);
      case 'bernoulli': return uniforme(d, 0) < x.p ? 1 : 0;
      case 'discreta': {
        const u = uniforme(d, 0); let tot = 0; for (const p of x.pesos) tot += p;
        let ac = 0; for (let i = 0; i < x.valores.length; i++) { ac += x.pesos[i] / tot; if (u <= ac) return x.valores[i]; }
        return x.valores[x.valores.length - 1];
      }
      case 'empirica': {
        const v = x.valores, pos = uniforme(d, 0) * (v.length - 1), i = Math.floor(pos);
        return i >= v.length - 1 ? v[v.length - 1] : v[i] + (pos - i) * (v[i + 1] - v[i]);
      }
    }
  };
  return { semilla, replica, bloque, uniforme, sortear };
}

// ---- Traza (referencia: arreglos comunes, columnas al terminar) ----
export function crearEscritorReferencia(nivel: NivelTraza): EscritorTraza {
  const T: number[][] = [[], [], [], [], [], [], [], []]; // e k r a t0 t1 c q
  const Mo: number[][] = [[], [], [], []];
  const P: number[][] = [[], [], [], [], [], [], []];       // camion indice ruta clase creado listo vueltas
  const completa = nivel === 'completa';
  const tramo = (e: number, k: TipoTramo, r: number, a: number, t0: Ms, t1: Ms, c: Causa = 0 as Causa, q = -1): number => {
    if (!completa) return -1;
    const i = T[0].length; [e, k, r, a, t0, t1, c, q].forEach((v, j) => T[j].push(v)); return i;
  };
  return {
    nivel,
    abrir: (e, k, r, a, t0, c, q) => tramo(e, k, r, a, t0, Infinity, c, q),
    cerrar: (i, t1, a) => { if (i < 0) return; T[5][i] = t1; if (a !== undefined) T[3][i] = a; },
    tramo,
    momento: (t, tipo: TipoMomento, r, v) => { if (!completa) return; [t, tipo, r, v].forEach((x, j) => Mo[j].push(x)); },
    paquete: (id, camion, indice, ruta, clase, creado) => { if (!completa) return; P[0][id] = camion; P[1][id] = indice; P[2][id] = ruta; P[3][id] = clase; P[4][id] = creado; P[5][id] = -1; P[6][id] = 0; },
    paqueteListo: (id, listo, vueltas) => { if (!completa) return; P[5][id] = listo; P[6][id] = vueltas; },
    terminar: (datos): Traza => {
      for (let i = 0; i < T[5].length; i++) if (T[5][i] === Infinity) T[5][i] = datos.fin;
      const n = T[0].length, np = P[0].length;
      return {
        ...datos, version: 1,
        tramos: { n, e: Int32Array.from(T[0]), k: Uint8Array.from(T[1]), r: Int32Array.from(T[2]), a: Int32Array.from(T[3]),
          t0: Float64Array.from(T[4]), t1: Float64Array.from(T[5]), c: Uint8Array.from(T[6]), q: Int32Array.from(T[7]) },
        momentos: { n: Mo[0].length, t: Float64Array.from(Mo[0]), tipo: Uint8Array.from(Mo[1]), r: Int32Array.from(Mo[2]), v: Float64Array.from(Mo[3]) },
        paquetes: { n: np, camion: Int32Array.from(P[0]), indice: Int32Array.from(P[1]), ruta: Int16Array.from(P[2]), clase: Uint8Array.from(P[3]),
          creado: Float64Array.from(P[4]), listo: Float64Array.from(P[5]), vueltas: Uint8Array.from(P[6]) },
      };
    },
  };
}

// ---- Motor de referencia ----
interface Ev { t: Ms; fase: number; prio: number; seq: number; bloque: number; tipo: number; arg: number }
const antes = (x: Ev, y: Ev) => x.t < y.t || (x.t === y.t && (x.fase < y.fase || (x.fase === y.fase && (x.prio < y.prio || (x.prio === y.prio && x.seq < y.seq)))));
export function crearMotorReferencia(o: OpcionesMotor): Motor {
  const heap: Ev[] = [], bloques: Bloque[] = [];
  let ahora = 0, seq = 0, actual = -1, eventos = 0, h1 = 0x811c9dc5, h2 = 0xc2b2ae35, mismo = 0, tAnterior = -1;
  const maxEv = o.maxEventos ?? 50_000_000, maxMismo = o.maxMismoInstante ?? 1_000_000;
  const mezclar = (w: number) => { h1 = Math.imul(h1 ^ w, 0x01000193) >>> 0; h2 = Math.imul(h2 ^ w, 0x85ebca6b) >>> 0; h2 = (h2 ^ (h2 >>> 13)) >>> 0; };
  const hex = () => h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  const subir = (i: number) => { while (i > 0) { const p = (i - 1) >> 1; if (!antes(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
  const bajar = (i: number) => { for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && antes(heap[l], heap[m])) m = l; if (r < heap.length && antes(heap[r], heap[m])) m = r; if (m === i) return; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } };
  const sacar = (): Ev => { const top = heap[0], last = heap.pop()!; if (heap.length) { heap[0] = last; bajar(0); } return top; };
  const correrHasta = (hasta: Ms): ResultadoCorrida => {
    let estado: EstadoCorrida = 'sin-eventos';
    while (heap.length) {
      if (heap[0].t > hasta) { estado = hasta >= o.hasta ? 'horizonte' : 'pausa'; break; }
      if (eventos >= maxEv) { estado = 'tope-eventos'; break; }
      const e = sacar(); ahora = e.t; actual = e.seq; eventos++;
      if (e.t === tAnterior) { if (++mismo > maxMismo) { estado = 'lazo-tiempo-cero'; break; } } else { mismo = 0; tAnterior = e.t; }
      mezclar(e.t % 4294967296); mezclar(Math.floor(e.t / 4294967296)); mezclar(e.bloque >>> 0); mezclar(e.tipo >>> 0); mezclar(e.arg >>> 0);
      bloques[e.bloque].manejar(m, e.tipo, e.arg);
    }
    if (estado === 'sin-eventos' || estado === 'pausa' || estado === 'horizonte') ahora = Math.max(ahora, Math.min(hasta, o.hasta));
    return { estado, ahora, eventos, huella: hex() };
  };
  const azar = crearFuenteAzarReferencia(o.semilla, o.replica);
  const traza = crearEscritorReferencia(o.traza);
  const m: Motor = {
    get ahora() { return ahora; }, get seq() { return actual; }, get eventos() { return eventos; },
    opciones: o, azar, mat: matNativa, traza, claveDe,
    registrar: (b) => { bloques.push(b); return bloques.length - 1; },
    agendar: (t, bloque, tipo, arg, fase = Fase.NORMAL, prioridad = 0) => {
      if (!Number.isInteger(t)) throw new Error(`tiempo no entero: ${t}`);
      if (t < ahora) throw new Error(`tiempo en el pasado: ${t} < ${ahora}`);
      heap.push({ t, fase, prio: prioridad, seq, bloque, tipo, arg }); subir(heap.length - 1); return seq++;
    },
    correr: () => correrHasta(o.hasta),
    correrHasta,
    foto: (): Foto => { throw new Error('la referencia no implementa foto()'); },
    restaurar: () => { throw new Error('la referencia no implementa restaurar()'); },
    huella: hex,
    finalizar: () => { for (const b of bloques) b.finalizar?.(m); },
  };
  return m;
}
```

## Anexo C · Fuentes

- Diseño maestro y sus fuentes: `oportunidades/proyectos/anden/diseno-maestro.md` §13.
- Mediciones usadas en este corte: `oportunidades/proyectos/anden/medicion-sintesis/` (Philox, matemática propia, maqueta con matemática
  propia, plan de clasificación; 17-10-2026), `visiones/experiencia-medicion/` (película, enlace, pisos de dibujo, pantalla dividida),
  `conocimiento/anden-simulador-2026-10/medicion-motor/` (batería de referencia y valores esperados), `medicion-tecnologia/` (determinismo,
  transferencia entre hilos, IndexedDB, `file://`).
- Random123, vectores de prueba (consultado el 17-10-2026): https://raw.githubusercontent.com/DEShawResearch/random123/main/tests/kat_vectors
- Law (2023), WSC, casos C01–C04 y cobertura: https://informs-sim.org/wsc23papers/124.pdf
- npm, versiones y licencias (17-10-2026): https://www.npmjs.com/package/esbuild · https://www.npmjs.com/package/qrcode-generator ·
  https://www.npmjs.com/package/typescript · https://www.npmjs.com/package/@types/node · https://www.npmjs.com/package/three ·
  https://www.npmjs.com/package/webm-muxer · https://www.npmjs.com/package/mediabunny
- FNV-1a (vectores estándar 'a' → 0xe40c292c y 'foobar' → 0xbf9cf968): http://www.isthe.com/chongo/tech/comp/fnv/ (conocimiento previo,
  verificado por cálculo en `contratos/pruebas/paso0.test.ts`).
