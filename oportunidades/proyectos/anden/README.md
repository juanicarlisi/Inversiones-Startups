# Andén · El simulador (17-10-2026)

> Índice y resumen del proyecto del simulador de Andén (P2, `../P2-anden.yaml`). Responde a tu pedido del 17-10-2026: llevar Andén al
> simulador logístico más espectacular, profundo, realista y avanzado que exista, por encima de FlexSim. Las calculadoras v0 siguen en
> `apps/anden/` y no cambian.

## Qué es, en criollo

Andén va a ser un **gemelo de decisiones**: le contás tu operación (un hub de clasificación, un depósito, una última milla), la ves
funcionar en el teléfono como una película y la compartís con un enlace. Te dice dónde se traba, cuánta gente hace falta y cuánto cuesta
cada paquete, y cada número sale con la confianza que merece y con una receta que cualquiera puede volver a correr y obtener exactamente lo
mismo.

Tres capas, un solo producto:
- **Abajo, un motor en el que un ingeniero confía más que en FlexSim:** da lo mismo en cualquier teléfono o computadora, pasa en público 85
  pruebas contra la teoría de colas y contra casos publicados, y no deja mostrar un número sin su intervalo.
- **La cara, la escena viva:** abrís un enlace y la noche del hub ya está corriendo. Tocás un paquete atrasado y te cuenta su historia y
  por qué llegó tarde. Ves «las cien noches» pintadas sobre el plano, porque una noche sola miente. Comparás dos propuestas en pantalla
  dividida con la misma suerte: mismos camiones, mismas faltas.
- **La puerta, el estudio por decisión:** en vez de un formulario de cien campos, te pregunta solo lo que cambia la respuesta, en orden de
  cuánto te puede costar equivocarte, y si no sabés un dato te dice cómo medirlo con el teléfono en 3 minutos.

## Por qué gana

1. **Lo que todos ya tienen no alcanza.** En septiembre de 2026 AnyLogic, Simio y Siemens sacaron «la IA arma el modelo» y «en el
   navegador». Si armar un modelo cuesta segundos, lo que vale es poder creerle y que llegue a quien decide.
2. **Se puede comprobar.** Ningún incumbente que hayamos visto publica las pruebas de su motor ni garantiza el mismo resultado en otra
   máquina. Para un fundador anónimo, la prueba pública reemplaza a la cara.
3. **Simula el mecanismo, no tasas.** Bandejas que giran, rampas que se llenan, personas con pausas y faltas, paquetes grandes que ocupan
   dos bandejas, atascos del lazo. Es donde una planilla y los bloques genéricos se equivocan.
4. **Llega a quien decide.** Un enlace o un QR abre en cualquier teléfono sin cuenta y sin placa de video; el modo directorio arma la
   reunión de siete minutos y contesta las preguntas en la sala.
5. **Está hecho para acá:** en español, con costos argentinos que ya tienen las calculadoras, y a precio latinoamericano.

Lo que **no** peleamos: fotorrealismo, física, PLC, robots de seis ejes ni veinte años de bibliotecas. Ahí ganan los grandes y lo decimos.

## Lo nuevo que medimos hoy

- El azar «por dirección» (cada sorteo tiene domicilio fijo: el paquete 233 del camión 7 siempre pesa lo mismo, aunque cambies el hub)
  funciona en el navegador sin herramientas raras: reproduce los vectores oficiales y es rápido (25–41 millones de números por segundo).
- La matemática propia, que hace que dé lo mismo en cualquier navegador, coincide bit a bit con la de Chrome y casi no frena: una noche de
  24.000 paquetes con todo el mecanismo tarda unos 0,2 segundos.
- El peor caso de la maqueta (15% de paquetes dando vueltas) **no era el hub: era cómo estaban repartidas las personas de rampa**. Una
  persona tenía la ruta más pesada y tres rampas más. Repartiéndolas por volumen, en las mismas 60 noches el peor caso baja a 0,03%, sin
  gastar un peso. Por eso el **plan de clasificación** (qué ruta va a qué rampa y quién la vacía) es una decisión central de Andén.

## Qué se construye primero: el corte 1, «Hub verificado, en escena»

Se construye ahora, en **una sesión**, con ocho equipos de agentes en paralelo y uno de integración. No te pide horas y no se publica.

Trae: el motor con sus 85 pruebas; un hub de última milla completo (camiones, descarga, cintas que se frenan cuando la fila se llena,
inducción con personas, sorter de bandejas, rampas, jaulas, faltas con o sin retén, atascos, plan de clasificación); la película en 2D y
en 2,5D que anda sin placa de video; las cien noches sobre el plano; «¿y si…?» con pantalla dividida y la misma suerte; la historia de cada
paquete con causas confirmadas; la decisión «cuántos puestos para no perder el corte» con su semáforo; el enlace, el QR y el comprobante;
y el modo directorio en tres actos.

Queda para después (corte 2, diciembre a febrero): el 3D, el video, cargar tus planillas, «¿llegamos esta noche?» desde lo pendiente de
hoy, la entrevista con IA y la medición en teléfonos reales.

## Cómo sigue

| Corte | Cuándo | Qué |
|---|---|---|
| 1 | Octubre de 2026 (una sesión) | Hub verificado, en escena (arriba) |
| 2 | Diciembre de 2026 a febrero de 2027 | Tu operación, esta noche: planillas, validación contra días reales, arranque en caliente, 3D, video, IA, agentes |
| 3 | Marzo a mayo de 2027 | Decidir con garantía, a tiempo para el Hot Sale: optimizador, turnos, plan de clasificación óptimo, Pro y pase de evento |
| 4 | Junio a septiembre de 2027 | Lógica propia sin programar y Andén Aula con certificado; el corte de P2 de septiembre no cambia |
| 5 | Octubre a diciembre de 2027 | Varios días con re-entregas, última milla con ruteo, hub nuevo con caso de inversión |
| 6 | 2028 | Frontera: GPU masiva, aprendizaje por refuerzo, planos CAD, fotos y voz, portugués |

Max 5x se comparte con Senda y Hub Nocturno: los cortes 2 en adelante arrancan después de esos lanzamientos y le ceden el lugar a Senda si
hace falta.

## Lo que tenés que decidir

| Decisión | Recomendación | Cuándo |
|---|---|---|
| Consulta de 1 hora con un abogado laboral por la propiedad intelectual de tu empleador | Antes de publicar cualquier cosa del simulador y antes de revisar si la plantilla «parece un hub» (el hub de última milla es justo el dominio de tu trabajo) | Noviembre de 2026 |
| Publicar el corte 1 | Después de la consulta, sin nombres de empresas | Después |
| Teléfonos de prueba (2 o 3 usados) o solo la sonda anónima | Primero la sonda (cuesta ~0) | Corte 2 |
| Revisar las licencias de FlexSim, AnyLogic y Simio antes de comparar en público | Sí, en la misma consulta | Antes del corte 3 |
| Precios y línea de pago | Aprobar una página con botón de interés | Marzo de 2027 |
| Actualizar el caso de negocio de P2 con el simulador | En el comité de noviembre | Noviembre de 2026 |

## Archivos

| Archivo | Qué es |
|---|---|
| `diseno-maestro.md` | El diseño completo: tesis, 15 capacidades, modelo de simulación, arquitectura, experiencia, plantillas, rigor, cortes, riesgos, métricas, precios y fuentes |
| `corte-1.md` | La especificación para construir el corte 1: carpetas, contratos exactos, el modelo de ejemplo completo, la semántica del motor, la batería con valores esperados, los 8 paquetes y la integración |
| `corte-1-paso0/` | El andamio literal del corte 1 (contratos verificados con `tsc` y 6 de 6 pruebas en Node) |
| `medicion-sintesis/` | Las mediciones de hoy: Philox, matemática propia, maqueta con matemática propia, plan de clasificación |
| `visiones/` | Las tres visiones que se sintetizaron (rigor, experiencia, IA nativa) y sus mediciones |
| `../../../conocimiento/anden-simulador-2026-10/` | Los seis informes de investigación (incumbentes, IA, tecnología web, realismo logístico, motor y validación, mercado) |

Todo número de estos documentos lleva su etiqueta (HECHO, MEDIDO, ESTIMACIÓN, HIPÓTESIS o INFERENCIA) y su fuente con fecha.
