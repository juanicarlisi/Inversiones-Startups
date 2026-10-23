# Notas de contrato · P8 Interfaz (18-10-2026)

Lo que el contrato (`contratos/`) o la especificación (`oportunidades/proyectos/anden/corte-1.md` §9 P8) no fija, fija de forma ambigua o
no alcanza, y lo que la interfaz hizo por su cuenta. En cada punto: qué pasa, el supuesto con el que siguió P8 y la propuesta. Decide la
integración (corte-1.md §2 y §14.8). **Ningún punto cambia un contrato**: `arrancar(servicios, raiz)` recibe un `Servicios` tal cual
(lo comprueba `tsc`) y todo lo extra es opcional. Los puntos 1 a 4 piden un cableado de la integración; los demás son informativos.

## 1. Cómo se construye y se sirve la interfaz (para `integracion/construir.mjs`)

- **Entrada.** `arrancar(servicios: Servicios, raiz: HTMLElement, opciones?: OpcionesArranque): void` (`app/arrancar.ts`). El tercer parámetro es
  opcional y compatible con la firma de §9: `diccionarios` (si no, los de todos los paquetes), `pwa` (registrar el service worker; por defecto sí
  con http/https), `depuracion` (expone `window.__anden` para las pruebas: **no usar en producción**) e `idioma`.
- **Nombres de los archivos construidos.** `app/index.html` carga `./entrada.js`, `./estilos.css`, `./manifest.webmanifest` y `./icono.svg`, y la
  app registra `./sw.js`: en `dist/` tienen que quedar en la raíz (los de `app/pwa/` se copian ahí). `integracion/entrada.ts` se construye como
  `dist/entrada.js`.
- **QR a demanda.** `pantallas/compartir.ts` importa `../vendor/qrcode-generator-2.0.4.js` con `import()` dinámico: con esbuild `format: 'esm'` y
  `splitting: true` sale en un trozo aparte que solo se baja al abrir «Compartir» (no cuenta en la primera carga). `app/pruebas/humo.mjs` tiene
  `construir(destino)` como ejemplo completo (51–170 ms, MEDIDO).
- **Service worker.** `app/pwa/sw.js` tiene dos marcas que reemplaza la construcción: `/*VERSION*/dev` (por la huella de los archivos) y
  `/*ARCHIVOS_CONSTRUIDOS*/[]` (por la lista de archivos de `dist/`, para guardarlos al instalarse). Sin reemplazarlas igual anda: guarda la
  cáscara y lo demás a medida que se pide.
- **Los servicios falsos no van a `dist/`.** `app/servicios-falsos.ts`, `app/entrada-falsa.ts` y `app/falsos/` son solo para desarrollar y para
  `humo.mjs`; `integracion/entrada.ts` importa `arrancar` y nada más de ahí.

## 2. Los textos de los demás paquetes (i18n)

- **Qué pasa.** §9 P8 pide que `traducir` «junte los `textos.*.json` de todos los paquetes», y §14.3 prohíbe importar otros paquetes.
- **Supuesto.** Un único archivo, `app/i18n/diccionarios.ts`, importa **solo datos** (`escena/`, `explicacion/`, `modelo/` y `experimentos/` →
  `textos.es.json` y `textos.en.json`, con `with { type: 'json' }`), nunca código. `juntarDiccionarios` lanza al arrancar si dos paquetes
  comparten una clave o si una clave no lleva el prefijo de su paquete. Si la integración prefiere inyectarlos, `opciones.diccionarios`.
- **Propuesta.** Que la prueba de arquitectura de la integración permita `app/i18n/diccionarios.ts → <paquete>/textos.<idioma>.json`.

## 3. `Servicios` no trae los estilos de la escena

- **Qué pasa.** `CrearVista` necesita un `Estilo` y la paleta es de P6 (`escena/indice.ts: estilos`), pero `Servicios` no la expone. La vista de
  P6 **lanza** si al `Estilo` le falta un color (`escena/estilo.ts: color()`).
- **Supuesto.** `ServiciosApp = Servicios & { estilos?; semaforoDe? }` (`app/extras.ts`): si los servicios traen `estilos`, se usan; si no,
  `app/ui/paleta.ts` tiene una paleta de respaldo con **los mismos nombres de color** que P6 al 18-10-2026 (si P6 agrega un color, el respaldo
  queda corto y la vista lanzaría con un mensaje claro). El `reducirMovimiento` sale de `prefers-reduced-motion`.
- **Propuesta.** La integración agrega `estilos` (los de `escena/`) al objeto de servicios; en el corte 2, `estilos` en `contratos/servicios.ts`.

## 4. `Servicios` no trae el semáforo de un conjunto de noches

- **Qué pasa.** La línea de la escena y el comprobante necesitan el semáforo de las cien noches. `evaluarDecision` trae el suyo, pero para las
  noches de la escena no hay función en `Servicios` (P5 la ofrece como `semaforoDe(mv, resultados)`, `experimentos/NOTAS-CONTRATO.md` §1).
- **Supuesto.** Si los servicios traen `semaforoDe`, se usa; si no, `semaforoLocal` (`app/extras.ts`) con la tabla de §7 en el mismo orden y con
  las mismas variables que los textos `experimentos.semaforo.*` (lo prueba `pruebas/semaforo.test.ts`, en es y en).
- **Propuesta.** La integración pasa `semaforoDe` de P5; en el corte 2, `semaforoDe` en `contratos/servicios.ts`.

## 5. La receta no trae la huella de lo calculado: el sello «reproducida en este dispositivo»

- **Qué pasa.** Diseño maestro §5.9: el sello aparece «si la huella recalculada coincide con la de la receta», pero `Receta` solo trae la huella
  del **modelo**, no la de las noches (y el códec de P3 rechaza campos desconocidos en la receta).
- **Supuesto.** El sello dice «reproducida» cuando el enlace trajo receta, el modelo abierto tiene la huella de la receta, el motor es la misma
  versión y las noches se terminaron de calcular en este dispositivo (`Sesion.selloReproducida()`: `reproducida`, `calculando`, `otro-motor`,
  `sin-receta`, cada uno con su texto). Con un motor determinista y verificado (R04) es la misma cuenta, pero compara **entradas**, no
  **salidas**. La huella agregada y la de la noche que se ve están en el comprobante (para que el recorrido «compartir» de §10.8 las compare).
- **Propuesta (corte 2).** `huella?: string` (la agregada) en `Receta`, para que el dispositivo compare su resultado con el del autor.
- **Resuelto el 20-10-2026 (hallazgos H1 y E-01).** El códec lleva `h` (la huella agregada del autor) como campo extra opcional de la receta
  (`integracion/CAMBIOS-CONTRATO.md` §1). `Sesion.selloReproducida()` compara la huella agregada que calculó este dispositivo con `h`:
  `reproducida` si coinciden (y coinciden réplicas y semilla), `no-coincide` si no, `sin-huella` si el enlace no la trae (receta vieja o
  modelo anonimizado: «no se puede comprobar»), además de `sin-receta`, `otro-motor` y `calculando`. El modelo anonimizado no lleva `h`.

## 6. Cancelar una vista previa cancela también las cien noches

- **Qué pasa.** `cancelarDesde(p)` cancela todo lo de prioridad ≥ p: para cortar una vista previa vieja de «¿y si…?» (prioridad 0) se cancela
  también la confirmación, las noches, la decisión y el tamizado.
- **Supuesto.** `Sesion` cancela solo si hay una vista previa o una confirmación en curso; guarda las noches **por índice de réplica** a medida que
  llegan y, después de una cancelación, vuelve a pedir solo los tramos que faltan (`pedirNoches`). La decisión cancelada queda «cancelada» con un
  botón para volver a calcular (nunca resultados a medias). Una cancelación se reconoce por `error.name === 'ErrorCancelado'` (P5).
- **Propuesta.** Cancelación por trabajo en `Servicios` (un `AbortSignal` en `noche`/`noches`, o que devuelvan un id para `cancelar(id)`).

## 7. Lo que la interfaz arma porque `Servicios` no lo expone (con un solo dueño en el corte 2)

- **«La mejor noche».** `MapaRiesgo` trae la mediana y la peor; la mejor la calcula `Sesion.replicaDe('mejor')` con `kpiNoche` y `META_KPI.mejor`
  (P6 la ofrece como `elegirNoche`, `escena/NOTAS-CONTRATO.md` §10). Propuesta: `nocheMejor` en `MapaRiesgo`.
- **Los cambios del «¿y si…?» de la biografía.** `pantallas/biografia.ts: cambiosDe` arma el cambio fijo por causa de §9 P7 (FILA/BLOQUEO → un
  puesto más; RAMPA_LLENA → esa rampa al doble; PAUSA/PERSONA_OCUPADA → sin pausas de rampa; AUSENCIA → retén + 1; FALLA → sin micro-paradas;
  CIERRE_JAULA → cierre 0; NO_LEIDO → `noLeido` 0), con los textos `explicacion.cambio.*`. Ofrece solo lo que cambia algo (no «un puesto más» si
  no hay puestos físicos libres). Propuesta: exponer `cambioDeCausa` de P7 en `Servicios`.
- **La hora del contrafactual.** «Confirmado: sin pausas, llegaba a las 00:12» se arma con `explicacion.cambio.<tipo>` y `Contrafactual.despues.listo`
  (como propone `explicacion/NOTAS-CONTRATO.md` §4): no es una frase con afirmaciones, es el resultado de una simulación.
- **El cierre del formulario.** Sin preguntas: «Ya está» (`explicacion.formulario.listo`) solo si hay recomendación; si la decisión quedó en duda,
  `en_duda`; si ninguna opción cumple, `ninguna_cumple` (la regla de `cierreDelFormulario` de P7, que no está en `Servicios`).
- **La verificación de frases.** Toda frase de la biografía y de las causas pasa por `servicios.verificar` con la traza que se ve (id `'noche'`) y el
  modelo; una frase que no pasa no se muestra y se dice que se retuvo.

## 8. Contestar una pregunta del formulario cambia el modelo

- **Supuesto.** «Usar mi dato» valida el número contra `Parametro.rango` (el de validez, no el de `incierto`) y aplica un parche: el valor central
  (la media o la `p` de la distribución, conservando el cv), `etiqueta: 'DATO_USUARIO'`, la fuente y la fecha, y quita `incierto` (ya no es un
  supuesto). Recompila con `variante`, vuelve a abrir el modelo (película y noches) y vuelve a decidir. Si el modelo venía de una plantilla, el
  parche se suma al de la plantilla.
- **Ojo (P7 §11).** Con `hub-chico@1.0.0` real ninguna opción cumple la meta: el formulario termina en `ninguna_cumple`, no en «Ya está». La
  interfaz lo dice tal cual; el recorrido «decidir» de §10.8 necesita una plantilla con meta alcanzable.

## 9. Compartir: qué viaja

- Con «anonimizar» (activado por defecto): si el modelo es una plantilla y el parche no toca `/parametros`, `/costos`, `/demanda`, `/procedencia`,
  `/titulo`, `/descripcion` ni `/autor`, viaja **plantilla + parche** (no hay nada propio que anonimizar); si no, el **modelo completo anonimizado**,
  con una semilla de anonimizar sacada de `crypto.getRandomValues` (nunca la de la receta: `modelo/NOTAS-CONTRATO.md` §9) y una receta con la
  huella del modelo anonimizado. El aviso dice qué viaja, que los textos libres viajan tal cual y que quien lo abra verá los números del modelo
  anonimizado. `codificar` **lanza** si pasa de 16.000 caracteres: se atrapa y se avisa.
- **QR.** Hasta 2.000 caracteres (un QR de tipo 40 con corrección L lleva 2.953 bytes): una plantilla con parche entra (≈ 520 caracteres con 10
  cambios, MEDIDO); un modelo completo (≈ 5.500–6.000) no, y se ofrece copiar. Propuesta (corte 2): QR de plantilla + receta, o enlace corto.

## 10. Para P6 y P7 (informativo)

- **P7:** `explicacion.pregunta.porque.puestos` dice «en hasta 1 puestos» con `n = 1`: falta el singular. **Resuelto** (P7 sumó `explicacion.pregunta.porque.puestos.uno`; los
  servicios falsos de `app/falsos/` lo usan desde el 23-10-2026).
- **P6:** la interfaz da una alternativa sin puntero al toque sobre el lienzo («Ver un paquete que pierde el corte», «Ver la rampa que más se llena»,
  con `porRecurso.rampaMinutosLlena` de la noche que se ve) y elige el piso una vez por página con `elegirPiso`, midiendo una vista 2,5D de prueba
  sobre el mismo lienzo. Para tocar usa `vista.aMundo` (vale con la cámara girada, `escena/NOTAS-CONTRATO.md` §12).

## 11. Historial del navegador

- «Atrás» del navegador = «volver» de la app (cada pantalla nueva empuja una entrada). Ir a otro fragmento (`#…`) también dispara `popstate`
  en los navegadores: la app lo distingue porque cambió el fragmento, y lo atiende `hashchange` (abre el enlace nuevo). Abrir una plantilla
  reemplaza el fragmento por `#t=<id>@<versión>` (recargar la página vuelve a la misma plantilla).

## 12. PWA

- El ícono es un SVG (`app/pwa/icono.svg`). Chromium pide además PNG de 192 y 512 px para ofrecer «instalar»: la app anda sin red igual (el
  service worker no depende del ícono). Propuesta: que la construcción genere los PNG desde el SVG (corte 2).

## 13. Corrida del 23-10-2026: lo que se arregló y lo que se sumó (ningún punto cambia un contrato)

Estado al empezar: 88 de 88 pruebas propias, `tsc` sin errores y el humo en verde, pero las 40 capturas eran del 18-10-2026 (antes de los
arreglos de la integración y de la revisión). Se volvieron a correr y a mirar una por una; lo que salió:

1. **«¿Y si…?» mostraba A y B de noches distintas como «la misma suerte» (error, arreglado).** Si se movía una perilla mientras la noche
   de A era la provisoria (la 1) y después llegaban las cien noches, A pasaba sola a la mediana (la 77 en `hub-lazo-noche@1.0.0` con los
   servicios reales) y B se quedaba en la 1: la pantalla dividida, la línea «La noche que se ve, con la misma suerte en A y en B…» y la
   etiqueta de B («Noche 1 de 100 · la mediana…») decían algo falso. Ahora `Sesion.sincronizarB()` rehace la película de B con la noche
   de A cada vez que A cambia de noche (la provisoria → la mediana, o la peor o la mejor elegidas en las cien noches); mientras tanto B no
   se muestra («Rehaciendo B con la noche N, la misma que se ve en A…»). La comparación de las 40 noches no cambia: no depende de la noche
   que se ve. Prueba: `sesion.test.ts` («con la noche provisoria…»), que fallaba antes del arreglo; el humo controla que las etiquetas de
   A y B digan la misma noche; con los servicios reales (construido aparte en una carpeta temporal) A 77 = B 77 en 1280 y 360 px.
2. **El plano del hub mientras se simula (nuevo, `app/ui/plano.ts`).** Al abrir un enlace, la escena mostraba un rectángulo vacío y
   «Calculando la noche…» durante ≈ 1,2 s. Ahora dibuja el **plano vacío** (andenes, cintas, acumulación, lazo, puestos y rampas) con
   «Calculando la noche en este dispositivo…» encima, sin tablero, sin toques y sin marcarse lista (no es un instante simulado: no hay
   paquetes ni personas); las miniaturas del inicio hacen lo mismo. La línea de tiempo no inventa horas sin noche (los controles quedan
   desactivados y la hora dice «—»; antes decía «00:00»). Es una traza con `n = 0` en tramos, momentos y paquetes, `replica = -1`, la
   geometría de `servicios.geometria` y el calendario del modelo; si el reproductor o la vista la rechazan, no se dibuja nada (como antes).
   - **MEDIDO (23-10-2026, verificación local con los servicios reales, no se publicó nada):** plano a los 275–374 ms del comienzo de la
     navegación y película a los 1,2–1,6 s, en 1280 × 800 y 360 × 740, 0 errores ni avisos de consola. La escena real de P6 acepta la
     traza vacía en las dos plantillas, los dos pisos y los dos temas (0 excepciones, el plano completo dibujado).
   - **Lo que NO cambia:** el presupuesto «primer cuadro desde el enlace ≤ 150 ms» de §11 mide la película (`sesion.noche`), y sigue sin
     cumplirse; el plano no es la película y no se cuenta como tal. Mejora lo que se ve mientras se espera, no la medición.
   - **Propuesta.** (a) Que P6 se comprometa a aceptar una traza con `n = 0` (una prueba en `escena/pruebas/`), porque hoy anda pero no
     está en su contrato; o, en el corte 2, una `crearVistaPlano(geometria)` en `contratos/vistas.ts`. (b) Si el banco quiere, puede
     informar aparte «plano visible» (el lienzo con `data-plano="1"`) como hito, sin cambiar la meta de la película.
3. **Avisos.** El de «la película pasó de la noche 1 (provisoria) a la 5, la mediana» salía en cualquier pantalla (en el formulario de
   decidir después de cada dato, en el comprobante, en la biografía, que queda atada a su noche): ahora solo donde se ve la película
   (`PANTALLAS_CON_PELICULA` en `estado.ts`: escena, cien noches, «¿y si…?» y presentar). Y un aviso informativo (copiado, cambio de
   noche) se va al cambiar de pantalla; uno de error se queda hasta que se cierra o vence (`estado.ts`, probado en `estado.test.ts`).
4. **«Quedarme con B» cuando B es peor en todo.** Si ningún indicador mejora con B y alguno empeora (sin contar lo igual en la práctica),
   el botón deja de ser la acción principal y se dice «Con estos cambios ningún indicador mejora y alguno empeora: hoy, A es mejor.»
   (`balanceDeB` en `pantallas/ysi.ts`, probado en `textos-pantalla.test.ts`).
5. **Textos.** La tarjeta «Validación» del comprobante usaba `experimentos.comprobante.sin-validar` («Sin validar contra datos reales») y
   el sello dice «Sin validar contra **días** reales» (diseño maestro §5.9): ahora usa el texto del sello y explica qué quiere decir. En el
   comprobante el sello del motor ya no lleva «(ver)» (llevaba al mismo comprobante). En el formulario, la referencia de cada pregunta
   decía «Hoy suponemos…» dos veces seguidas (la de P7 y la de la interfaz): ahora es «Referencia: 2,4 s por paquete (persona de planta)».
   **Para P5 (informativo):** `experimentos.comprobante.sin-validar` podría decir «días reales», como el sello.
6. **Humo (`pruebas/humo.mjs`).** Suma: el aviso del cambio de noche aparece en la escena; A y B muestran la misma noche; el plano se ve
   mientras se simula un enlace y desaparece con la película; ningún aviso de error en el recorrido normal; y los avisos informativos se
   cierran antes de capturar (las capturas muestran la pantalla, no el aviso que quedó de la anterior). Las 40 capturas, regeneradas.
7. **Visto con la integración (informativo):** `integracion/pruebas/arquitectura.test.ts` falla hoy por `nucleo/pruebas/tokens.test.ts`
   (importa `typescript`), un cambio en curso de P1; `app/` no tiene ningún import fuera de lo permitido.
