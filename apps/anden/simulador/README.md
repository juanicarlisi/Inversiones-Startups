# Andén · simulador (corte 1 «Hub verificado, en escena»)

Un simulador de hubs de clasificación de última milla que corre **entero en el navegador**: sin servidor, sin claves, sin instalar nada.
Abrís un enlace y ves la noche del hub como una película (cada paquete, cada bandeja, cada rampa que se llena), tocás un paquete y te
cuenta qué le pasó y **por qué** (solo causas confirmadas repitiendo la noche con un cambio), mirás las cien noches sobre el plano, probás
«¿y si…?» con la misma suerte en pantalla dividida, y decidís cuánta gente poner con un semáforo que dice cuánto confiar.

- **Especificación:** `oportunidades/proyectos/anden/corte-1.md` (qué se construyó y con qué reglas) y `diseno-maestro.md` (por qué).
- **Estado del corte:** `integracion/salida/informe-salida.json` (cada criterio de salida de §12, medido) y
  `integracion/NOTAS-CONTRATO.md` (qué decidió la integración y qué queda abierto).
- **Nada de esto está publicado.** Publicar pide la consulta legal y el OK del fundador (regla 8 de `CLAUDE.md`).

## Cómo correrlo

Hace falta Node 22.18 o más nuevo (se probó con 22.22.0). Desde esta carpeta:

```bash
npm install          # solo herramientas de desarrollo: esbuild 0.28.2, typescript 6.0.3 y @types/node
npm run construir    # arma dist/ (≈ 0,2 s)
npm run servir       # sirve dist/ en http://127.0.0.1:8080 (solo esta máquina)
```

Abrí `http://127.0.0.1:8080` en un navegador. No abre desde `file://`: usa módulos, Workers y un service worker, que necesitan HTTP.
Para abrir directo una plantilla: `http://127.0.0.1:8080/#t=hub-lazo-noche@1.0.0` (24.000 paquetes) o `#t=hub-chico@1.0.0` (8.000).

Lo que se ve en el primer minuto:

1. **Inicio:** las dos plantillas como miniaturas vivas, «¿Qué tenés que decidir?» y «Abrir un enlace».
2. **Escena:** la noche en 2,5D (o 2D en equipos lentos), con un tablero en vivo (hora, paquetes en jaula y adentro, fila, rampas llenas,
   personas en pausa, lazo detenido y, pasado el corte, cuántos no llegaron), la línea de arriba (costo por paquete con su ±, «perder el
   corte: 1 noche de cada N», confianza y comprobante), la etiqueta de la noche («Noche 23 de 100 · la mediana por hora de fin»), la línea
   de tiempo con los momentos importantes y los tres sellos (motor verificado, reproducida, validación).
   Rueda o pellizco para acercar, arrastrar para mover, doble clic o «Ver todo el hub» para volver.
3. **Tocar** un paquete o una rampa abre su **biografía**: los pasos con hora, las esperas con su causa y, aparte, solo las causas
   confirmadas repitiendo la noche con un cambio («Repetida sin pausas: llegaba a las 05:50, no a las 06:05»).
4. **Cien noches:** cada rampa pintada por la probabilidad de llenarse, el abanico de la hora de fin y la noche mediana, la peor y la mejor.
5. **¿Y si…?:** puestos, personas de rampa, retén, plan de rampas y «balancear el plan»; primero una noche provisoria, después 40 noches
   pareadas con la diferencia, su intervalo y el veredicto, en pantalla dividida (en el teléfono, A y B alternan con un toque).
6. **Decidir:** la probabilidad de cumplir la meta por opción (con su intervalo), la recomendación con semáforo y el formulario que
   pregunta solo lo que puede cambiar la respuesta, hasta «Ya está».
7. **Compartir:** el enlace (plantilla + cambios + receta con la huella agregada de las noches del autor) y su QR; quien lo abre recalcula
   todo en su equipo y ve el sello «reproducida» solo si su huella agregada coincide con la del autor («no coincide» si no).
8. **Presentar** (pantalla completa, flechas del teclado), **comprobante** (receta, huellas, motor 85 de 85, procedencia de cada dato) y
   **modo ingeniero** (el modelo en JSON con validación en vivo, la traza en CSV y la tabla de réplicas).

Español primero; inglés con el selector de la barra (las mismas claves en `textos.es.json` y `textos.en.json` de cada paquete).

## Cómo probarlo

| Comando | Qué prueba | Cuánto tarda (contenedor de 4 núcleos) |
|---|---|---|
| `npm test` | Las 1.066 pruebas de los ocho paquetes y de la integración (arquitectura, R08b, R06 del hub, E01/E02, S01–S03, S08, S09, S11, textos, marcas, Workers, plano) | ≈ 1,5–2 min |
| `npx tsc -p tsconfig.json` | Los tipos (TypeScript «borrable»: Node corre los `.ts` directo) | ≈ 15 s |
| `npm run verificar` | La batería «Andén Verificado» completa con el núcleo de producción: 85 pruebas exigibles contra teoría de colas y casos publicados, S01 y S02 que tienen que fallar, informe en `verificacion/informe/` | ≈ 9 min |
| `npm run r04` | La misma huella en Node y en Chromium (suite rápida, doradas, hub chico con 5 semillas, matemática bit a bit) | ≈ 15 s |
| `npm run e2e` | Los recorridos de punta a punta en Chromium, en 360 × 740 y 1280 × 800, claro y oscuro (primer minuto, decidir, compartir, enlaces hostiles H01 y H07b), con 0 errores de consola; 8 capturas en `integracion/e2e/capturas/` | ≈ 18 min |
| `npm run banco` | Los presupuestos de tiempo, memoria y peso de §11 (mediana de 5 corridas, con la CPU frenada 4× para los cuadros); sale con código 1 mientras alguno no cumpla | ≈ 7 min |
| `npm run informe` | Corre `npm test`, mide invariantes (200 noches por plantilla) y el enlace, junta lo de arriba y escribe `integracion/salida/informe-salida.json` | ≈ 4 min |
| `node integracion/e2e/humo.mjs` | Humo rápido de `dist/` en Chromium (película, cien noches, enlace de ida y vuelta) | ≈ 1 min |
| `node app/pruebas/humo.mjs` | La interfaz con servicios falsos: las 10 pantallas en las 4 combinaciones | ≈ 2 min |

Los que abren Chromium usan el Playwright y el Chromium que ya están en el entorno: correrlos con `NODE_PATH=/opt/node-tools/node_modules`
(no se instala ningún navegador). Todas las pruebas tienen semilla fija y ninguna depende del reloj (los tiempos van al banco).

## Qué hay

```
contratos/      tipos y funciones mínimas CONGELADOS (el acuerdo entre paquetes), el modelo de ejemplo y el motor de referencia
nucleo/         P1 · motor determinista: calendario en arreglos tipados, Philox4x32-10 por dirección, matemática propia, huella, foto
verificacion/   P2 · la batería: redes de colas genéricas, fórmulas analíticas, casos con esperado y tolerancia, doradas, informe
modelo/         P3 · esquema anden.modelo/1, compilador con 24 controles, F0, presupuesto, parches, JSON canónico, enlace endurecido
hub/            P4 · el hub: camiones, descarga, cintas, acumulación, inducción, sorter de bandejas, rampas, personas, excepción, KPI
experimentos/   P5 · réplicas con planificador, intervalos (t, Wilson, P90), MSER-5, comparación pareada, decisión secuencial, semáforo
escena/         P6 · reproductor de tramos, vistas 2D y 2,5D sin GPU, mapa de las cien noches, momentos, estilos claro y oscuro
explicacion/    P7 · esperas tipadas, biografía, contrafactual dirigido, verificador de frases, tamizado y formulario por decisión
app/            P8 · la interfaz: diez pantallas, i18n, PWA, QR (qrcode-generator 2.0.4, MIT, vendorizado)
integracion/    I  · el ensamblado, el Worker, el puente de servicios, la construcción, las pruebas de integración, la batería con el
                     núcleo, R04, el banco, los recorridos de punta a punta y el informe de salida
```

Cada archivo tiene un solo dueño (`corte-1.md` §2); los paquetes no se importan entre sí: se juntan en `integracion/ensamblar.ts`, y una
prueba de arquitectura lo controla (además de los tokens prohibidos del motor: `Math.random`, `Math.log`, `Date`…).

Dos plantillas públicas e inmutables: `hub-chico@1.0.0` (el ejemplo de §5: 8.000 paquetes, 3 puestos de inducción, 12 rampas) y
`hub-lazo-noche@1.0.0` (24.000 paquetes, 60 rampas, la de portada). Cada número con su fuente o marcado como SUPUESTO; ningún dato de
ninguna empresa.

## Qué no hay (todavía)

Va al corte 2 o después (`corte-1.md` §13): 3D, video, importar planillas, arranque en caliente, variables de control, editor 2D, varios
días, IA, MCP, la página pública «Andén Verificado», y R04 en Firefox, WebKit y teléfonos reales. El corte 1 simula **una noche
terminante** y lo dice; ningún resultado está validado contra días reales (el sello «Sin validar contra días reales» siempre está).

## Estado del corte 1

**Cerrado con pendientes:** 11 de los 12 criterios de salida de `corte-1.md` §12 cumplen (MEDIDO el 19-10-2026; el detalle, en
`integracion/salida/informe-salida.json` y en `integracion/NOTAS-CONTRATO.md` §12). El que no cumple es un presupuesto de §11: el primer
cuadro desde un enlace.

## Lo que queda abierto (lo decide el orquestador o el fundador)

- **Primer cuadro desde el enlace:** la meta de §11 es ≤ 150 ms y se mide ≈ 1,2 s (la noche entera se simula antes de dibujar; con 4G,
  1,9 s). O primer cuadro progresivo en el corte 2, o reescribir la meta.
- **«KPI sanos» de §9 sobre `hub-chico@1.0.0`:** imposible al pie de la letra. La integración eligió (23-10-2026) reescribir el criterio
  y dejar `hub-chico@1.1.0` como propuesta; la prueba `todo` de P4 se borró y falta pasar a `corte-1.md` §9 el texto de
  `integracion/CAMBIOS-CONTRATO.md` §10.
- **E01** se exige reformulado (esperas de ≥ 5 min dentro de la pausa) y **S03** exige independencia y sesgo, con la cobertura del 95%
  como informativa (S03c) (`integracion/NOTAS-CONTRATO.md` §2 y `integracion/CAMBIOS-CONTRATO.md` §4).
- **Motor 1.1.0** (arreglos de la revisión del 19-10-2026): caminata por distancia, plan por volumen en bloques de rampas vecinas,
  persistencia en la rampa, relevo en las pausas, pausas después del fin y utilizaciones por jornada; la receta lleva la huella `h`;
  la decisión secuencial corrige por mirar varias veces (Bonferroni). Todo lo que cambia la especificación está en
  `integracion/CAMBIOS-CONTRATO.md`, para pasarlo a `corte-1.md`. Quedan para el corte 2: R4 (cobertura entre roles, jornada máxima),
  R6–R10 y E-11.
- **Presentar** tiene 4 pasos (los del diseño maestro §5.6) en lugar de «tres actos».
