# NOTAS-CONTRATO · P2 (verificacion/)

Lo que el contrato o la especificación no alcanzan a fijar para la batería «Andén Verificado», el supuesto con el que seguí y mi propuesta.
Decide la integración (corte-1.md §2 y §14.8). Fecha: 18-10-2026.

## 1. `npm run verificar` corre con la referencia si no se le pasa otro motor

- **Hecho.** `package.json` (paso 0) tiene `"verificar": "node verificacion/bateria.ts --completa"`. P2 no puede importar `nucleo/`.
- **Supuesto.** Sin argumentos la CLI usa `crearMotorReferencia`. Acepta `--motor=<módulo que exporte crearMotor>` o la variable
  `MOTOR_BATERIA` y lo carga con `import()` dinámico (no es un import estático de `nucleo/`).
- **Propuesta para §12.2 (85 de 85 con el núcleo de producción).** Cambiar el script a
  `node verificacion/bateria.ts --completa --motor=nucleo/indice.ts`, o correr `MOTOR_BATERIA=nucleo/indice.ts npm run verificar`.
  También se puede desde código: `crearBateria(crearMotor).correr({ suite: 'completa', doradas: leerDoradas() })` y `escribirInforme(inf)`.

## 2. Las 85 exigibles en un solo informe

- **Hecho.** P2 es dueño de 59 (V 50, C01, C03, C04, D01, M01, M02, R01–R03). Las otras 26 son de P1 (K01a–d, R06), P4 (K02a–b, K03,
  L01–L07, P02, R05a–b), P5 (R07, S12, S13) e I (R04, S03, S08, S09, S11). Están en las pruebas de sus paquetes.
- **Supuesto.** El informe muestra «59 de 59 exigibles de P2» y aparte «exigibles del corte: 85».
- **Propuesta.** La integración envuelve las 26 como `Caso` (el tipo está en `casos/comun.ts`) y las suma con
  `crearBateria(crearMotor, { casosExtra })`. Así un solo `resultados.json` cuenta las 85. Los ids repetidos se rechazan con un error.
- Para S03, S08, S09 y S11, `flujo/red.ts` ya trae lo que necesitan:
  - `iniciales`: arranque estacionario con una `discreta` geométrica truncada, o arranque cargado con 100;
  - `serie`: N promedio por intervalo, para MSER-5;
  - `registrar.estancias`: estancia de cada cliente, para las coberturas;
  - `observar`.
  S01 y S02 ya están en la batería (`casos/informativas.ts`, caso `s-cobertura`) y la integración puede reutilizarlos.

## 3. Unidad de tiempo de la batería: 1 unidad = 1.000 s del motor

- **Hecho.** §8 fija la unidad en el tiempo medio de servicio y el motor trabaja en ms enteros (§6.2).
- **Supuesto.** Cada red convierte con `aMs(x · unidadSeg)` y `unidadSeg = 1.000` por defecto (1 unidad = 10⁶ ms, resolución de
  10⁻⁶ unidades).
- **Por qué.** M01 pide error ≤ 1e-6 al multiplicar las duraciones por 60. Con 1 unidad = 1 s, el redondeo a ms (5·10⁻⁴ relativo por
  sorteo) y los cambios de orden entre eventos casi simultáneos la harían fallar por resolución y no por un error del motor.
- **Margen.** El horizonte más largo (M/M/1 con ρ = 0,9: 407.600 unidades) queda en 4,1·10¹¹ ms, lejos de 2⁵³.
- **Llegadas.** El instante de cada llegada se acumula en unidades y se lleva a ms una sola vez. Así una llegada determinista no
  deriva (la n-ésima cae en round(n/λ)) y escalar por 60 escala los instantes con medio ms de error.

## 4. Tolerancia de `formulas/` contra la tabla de §8

- **Hecho.** La tabla imprime valores redondeados: 8,770 para E[N(66 h)] = 8,769712 y 0,36386 para el Erlang C de la M/M/50 = 0,363864.
  Con 1e-5 relativo estricto, esas dos fallan por la impresión y no por la fórmula (3,3·10⁻⁵ y 1,2·10⁻⁵).
- **Supuesto.** Tolerancia = máx(1e-5 relativo; media unidad de la última cifra impresa) (`pruebas/formulas.test.ts`). La batería usa
  como esperado el valor exacto de la fórmula, nunca el redondeado.
- **Propuesta.** En la tabla, escribir 8,7697 y 0,363864, o dejar escrita la regla.

## 5. Diseño de réplicas y horizontes por encima del mínimo de validacion.js

§8 pide un semiancho del 95% ≤ 2% del valor (≤ 1% en probabilidades) y «como mínimo, los de validacion.js». Donde el mínimo no alcanzaba:

- **V28a–d.** 2.000 réplicas en vez de las 400 de la tabla. Con 400, el semiancho de E[N(66 h)] es 3,3% del valor, y con el tope de
  error relativo de 3% la prueba fallaría por azar alrededor de 7% de las veces. Con 2.000 queda en 1,45% (MEDIDO, 18-10-2026).
- **V06c y V07c (M/M/50).** 1.200.000 llegadas medidas en vez de 400.000: el semiancho de Wq baja de 2,75% (maqueta) a 1,76% (MEDIDO).
- **M/M/5.** 600.000 llegadas (1,69%).
- **M/D/1.** 300.000 unidades.

Todo lo demás usa exactamente el diseño de validacion.js. `pruebas/bateria.test.ts` comprueba esos mínimos.

## 6. La precisión es parte del criterio

Una prueba estocástica que no llega al semiancho de §8 sale `falla`, con el motivo «precisión insuficiente». Después se re-corre con 4
veces más réplicas, como cualquier falla. Así un diseño con pocas réplicas no puede pasar por tener un intervalo ancho. Si la integración
prefiere que sea solo un aviso, se cambia en `casos/comun.ts` (`evaluarEstadistico`).

## 7. Intervalos publicados y detalles de las pruebas

- **C01.** Se usa [4,58; 6,78], el de §8 (5,68 ± 1,10). validacion.js usaba 6,79.
- **C03.** Se usa [3,40; 5,38], el de §8. La maqueta usaba 3,39.
- **V29.** Se evalúa en t = 54 h: §8 no dice el instante y la maqueta usaba ese. El error estándar de la razón varianza/media para un
  Poisson de media λ es √(2/(n−1) + 1/(λn)).
- **M01.** Corre sobre la versión corta de cada caso: 33 redes y 846 valores comparados.
- **M02.** Se cuentan todas las corridas de la ejecución: 744 en la suite rápida y alrededor de 8.100 en la completa.
- **R01.** Cubre la versión corta de cada caso con 5 semillas. El hub chico con 5 semillas es de P4.

## 8. Reloj y fecha sin `Date` ni `performance`

- **Hecho.** §1.4 prohíbe `Date` y `performance` en `verificacion/`.
- **Supuesto.** La CLI mide cuánto tarda cada caso con `process.hrtime.bigint()`, que pasa como `reloj` y solo va al informe, nunca a un
  resultado ni a las doradas. La fecha del informe sale de `--fecha=`, de `FECHA_BATERIA` o de la hora de modificación de un archivo
  marca (`fechaDelSistema`, con la conversión pura `fechaDeMs` probada).
- **Propuesta.** Si la prueba de arquitectura de I también prohíbe `process.hrtime`, permitirlo en `verificacion/bateria.ts` (es la
  herramienta de Node, no la simulación), o que la integración pase el reloj con `correr({ reloj })`.

## 9. El motor no tiene `detener()`

- **Hecho.** C04 termina al llegar a 2.000 piezas buenas.
- **Supuesto.** El bloque anota el instante y desde ahí ignora los eventos que quedan en el calendario. Esos eventos se siguen
  procesando y entran en la huella.
- **Propuesta para el corte 2.** `Motor.detener()`.

## 10. Cuánto vale `ahora` al final de `correr()`

- **Hecho.** El contrato no dice qué vale `ahora` cuando el calendario se vacía antes del horizonte. La referencia lo lleva a `hasta`.
- **Supuesto.** El bloque mide siempre hasta `opciones.hasta` (o hasta el objetivo) y no depende de ese valor. Exige que el motor se cree
  con `hasta = aMs(horizonte · unidadSeg)`; si no, falla con un error que lo dice.
- **Propuesta.** Fijar en `motor.ts` que, con estado `'sin-eventos'`, `ahora` termina en `hasta`.

## 11. La referencia no implementa foto ni restaurar

- **Hecho.** La referencia no implementa `foto()` ni `restaurar()`.
- **Supuesto.** El bloque de redes implementa `estado()` y `restaurar()` con solo arreglos tipados y números. Se prueba la ida y vuelta del
  bloque a mitad de una corrida (`pruebas/red.test.ts`).
- **Pendiente.** Seguir corriendo después de restaurar y obtener la misma huella final (R06 con una red) queda para P1 o I, con el
  núcleo de producción.

## 12. Direcciones del azar de las redes

| Clave | a | b | c |
|---|---|---|---|
| `claveDe('red.<id>', 'llegada.<clase>')` | n-ésimo intervalo | — | — |
| `claveDe('red.<id>', 'adelgazar.<clase>')` | n-ésimo candidato | — | — |
| `claveDe('red.<id>.<estación>', 'servicio')` | ordinal del trabajo | visita | 2·clase + 1 si arrancó en el sistema |
| `claveDe('red.<id>.<estación>', 'ruteo')` | ordinal del trabajo | visita | 2·clase + 1 si arrancó en el sistema |

Dos corridas con el mismo `id` de red comparten números aleatorios: así se arma C03 (5 contra 6 empleados) y R02. Está documentado en
la cabecera de `flujo/red.ts`.

## 13. R08b con la batería

- `crearBateria(crearMotorProduccion).compararDoradas(leerDoradas())` tiene que dar 0 distintas en 66 corridas.
- Más fuerte: la batería completa con el núcleo tiene que dar un `resultados.json` idéntico al de la referencia, salvo `motor`, `fecha` y
  `segundos`. Los resultados son función pura del motor y la semilla (`pruebas/rapida.test.ts` lo prueba).

## 14. Campos del informe

- **Hecho.** `resultados.json` trae lo que pide §9: id, nombre, esperado, simulado, semiancho, z, error relativo, n y estado, con estado
  `'pasa' | 'falla' | 'informativa' | 'debe-fallar-ok'`.
- **Agregado.** Familia, suite, tipo, dueño, caso, criterio en texto, semiancho relativo, réplicas, semilla, motivo y reintento.
- **Doradas.** Van en una sección aparte (`doradas`), porque no son pruebas de §8.
- **Pendiente de decisión.** `verificacion/informe/` es generado. Propuesta: commitearlo como evidencia de la corrida del corte, o
  agregarlo a `.gitignore`. Decide I.
