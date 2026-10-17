# Andén · Realismo logístico: procesos, parámetros y datos (17-10-2026)

> Frente de investigación: **la base de realismo** para que el simulador de Andén modele hubs, depósitos, cross-docks, patios,
> última milla y personas con precisión de ingeniero.
> Fecha de consulta de todas las fuentes: **17-10-2026**. Método: buscador + lectura directa de la fuente cuando el sitio lo
> permitió. Lo que solo se vio como extracto del buscador (sitio con 403/404/503 o PDF no legible) se marca **[extracto]**.
> **Límite honesto:** el cupo de búsquedas web de esta sesión (200 por turno, compartido con los otros frentes) se agotó a mitad
> del trabajo. Lo que quedó sin buscar está en la §10 con el camino para conseguirlo.
> Etiquetas: **HECHO** (fuente y fecha) · **ESTIMACIÓN** (con método) · **HIPÓTESIS** (a validar) · **INFERENCIA** (cuenta o razonamiento propio).
> Todo dato que decida capital o que se publique como referencia se re-verifica en la fuente primaria.

---

## 0. Resumen: lo que cambia el diseño de Andén

1. **La capacidad nominal de un sorter no sirve para simular.** La capacidad útil sale de multiplicar velocidad ÷ paso por
   ocupación, lectura, desvío y disponibilidad: en un ejemplo publicado, 8.640 → 7.338 paquetes/h buenos (−15%), y el propio autor
   avisa que esos factores **no son independientes** (oskon.com.tr). HECHO. Un proveedor de robots de inducción dice que con
   inducción manual los sorters rinden **40–70% de su diseño** por dotación y pausas (plusonerobotics.com, autoinformado). HECHO.
   → Andén tiene que **simular el mecanismo** (huecos, ventanas de desvío, rampa llena, recirculación, persona que induce), no
   multiplicar porcentajes. Ese es el realismo que las calculadoras no pueden dar. INFERENCIA.
2. **El cuello de botella típico de un hub es la persona, no la máquina.** Inducción manual sostenible ≈ **1.600 paquetes/h por
   puesto** (supuesto de diseño publicado), techo ≈ **2.250 paquetes/h**; codificación manual 30 cajas/min de promedio y 50 de
   máximo (datos de 1999). HECHO/ESTIMACIÓN según fuente. El Correo Argentino de Monte Grande: 9.000 paquetes/h con **13 puestos de
   inducción** → ≈ **690 paquetes/h por puesto** a capacidad máxima. INFERENCIA. → Hay que modelar a quien induce con curva de
   aprendizaje, fatiga, pausas y ausentismo. INFERENCIA.
3. **Las excepciones son la mitad del realismo.** Lectura 98,5–99,9% (lo que no se lee va a manual: ~5% en procesos típicos, según
   un proveedor), recirculación ~3% de ejemplo, rampa llena, mal clasificado, **entrega fallida de 2,8% a 33%** según país, año y
   fuente (las más sólidas: 7,6% en Singapur 2016 y 19,6% en Alemania en el primer trimestre de 2025), y la re-entrega falla más
   del doble que la primera. HECHO (fuentes en §2 y §5). Ningún número de estos es estable: tienen que ser
   **distribuciones editables con su fuente**, y el simulador tiene que mostrar el **lazo de re-entregas** (lo que no se entregó hoy
   vuelve al hub mañana y compite por capacidad). INFERENCIA.
4. **Los hubs argentinos se diseñan para el pico, y el pico se mide.** Andreani Pacheco: **26.000 paquetes/h y 520.000/día de
   capacidad, al 20% de uso normal y 50% en picos** (iProfesional, 29-04-2026). HECHO. CyberMonday 2025: ~7 millones de órdenes en
   3 días; el primer semestre de 2026, 181,5 millones de órdenes en el año (≈1,0 millón por día). HECHO/INFERENCIA. En el Hot Sale
   2026 la hora pico del primer día fue **13–14 h** (Facturante vía BAE, 12-05-2026). HECHO. → El simulador necesita **curvas
   horarias y multiplicadores de evento** como objeto central, no un "volumen diario". INFERENCIA.
5. **El personal temporario de pico no rinde como el de planta.** En picking por voz, la eficiencia medida (DEA) de los
   ingresantes subió de **0,46 a 0,61, 0,72 y 0,88**, contra **0,80–0,95** del grupo experimentado, y tardaron **~9 semanas** en
   igualarlo (6 semanas en un sistema semiautomático) (Loske y Klumpp, IFAC 2020, ~1,5 millones de picks). HECHO. Un Hot Sale dura 3–4 días: la dotación de pico
   calculada con la productividad de planta **subestima la gente necesaria**. INFERENCIA, confianza alta. Esto casi nadie lo modela.
6. **En última milla, el tiempo en la parada pesa más que el manejo.** En 6.112 rutas reales de Amazon (2018, EE. UU.): 148
   paradas, 238,5 paquetes, 8,1 h de ruta, de las cuales **4,5 h son servicio y 3,6 h tránsito** (Merchán y otros, Transportation
   Science 2022). HECHO. ≈ **109 s por parada** y **56% del tiempo de ruta en servicio**. INFERENCIA (cuenta). → El modelo de
   tiempo de servicio por tipo de parada (edificio, casa, comercio, con o sin portero) importa tanto como el ruteo. INFERENCIA.
7. **Los equipos automáticos se modelan con cinemática, no con una tasa fija.** Para transelevadores y shuttles existen métodos
   estándar de cálculo de ciclo (FEM 9.851 y FEM 9.860, UNE 58912) que dependen de largo y alto de pasillo, velocidades y
   aceleraciones. HECHO (existencia; los documentos son pagos). Referencias sueltas: 20–40 ciclos dobles/h por pasillo en
   transelevadores de pallets [extracto]; ~31 ciclos dobles/h por shuttle en un caso de 2009. HECHO/INFERENCIA.
8. **Hay datos argentinos públicos suficientes para una plantilla "hub argentino" creíble**: Correo Argentino Monte Grande
   (9.000/h, 240 robots, 13 inducciones, 130 salidas, 1.180 m², ≤ 5 kg), Andreani Pacheco (3 sorters: cross belt de 2 pisos
   18.000/h con 200 salidas + 2 narrow belt de 4.000/h), Andreani CIT Benavídez (8.000/h, 90.000 paquetes/día, 92% por sorter),
   Mercado Libre Don Torcuato (1,5 millones/mes, pico 60.000/día, 11.000 m²). HECHO (prensa que cita a las empresas).
9. **Cada parámetro del simulador tiene que viajar con su procedencia**, igual que `apps/anden/js/referencias.js`: valor, unidad,
   distribución, rango de validez, fuente, fecha y tipo (HECHO/ESTIMACIÓN). Es lo que distingue a Andén de FlexSim: FlexSim te da
   un objeto "sorter" vacío; Andén te da el sorter con **valores de referencia con fuente** y te dice cuáles tenés que reemplazar
   por los tuyos. INFERENCIA.
10. **Ojo con la licencia de los datos abiertos.** El dataset de rutas de Amazon es **CC BY-NC 4.0 (no comercial)**: se pueden
    citar sus estadísticas, pero no meterlo dentro de un producto pago. HECHO (licencia) / INFERENCIA (implicancia).

---

## 1. Cómo se usa este documento

Cada sección trae: (a) la **cadena de proceso** que el simulador tiene que poder representar, (b) los **parámetros** con unidad,
valor de referencia, fuente y etiqueta, y (c) lo que **no encontramos**. Propuesta de formato de parámetro para la biblioteca del
simulador (INFERENCIA; extiende el esquema que ya usa `referencias.js`):

```yaml
induccion_manual_tasa:
  nombre: "Inducción manual a sorter, tasa sostenible por puesto"
  unidad: "paquetes/h por puesto"
  valor: 1600                      # valor por defecto
  distribucion: {tipo: "normal truncada", media: 1600, desvio: null, min: 0, max: 2250}   # desvío: a calibrar con datos propios
  rango_valido: "paquetes ≤ 30 kg, una etiqueta visible, 1 persona"
  tipo: "ESTIMACIÓN"
  fuente: "https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity"
  fecha: "2026-10-17"
  nota: "Techo autoinformado ≈ 2.250/h (Plus One Robotics). Reemplazar por estudio de tiempos propio."
```

Regla para el equipo: **un parámetro sin fuente entra solo como ESTIMACIÓN con método**, y la interfaz lo pinta distinto.

---

## 2. Hubs de clasificación de paquetería y última milla

### 2.1 Cadena del proceso (lo que el simulador tiene que poder representar)

| Etapa | Qué pasa | Variables que mueven el resultado |
|---|---|---|
| Llegada de troncales | Camiones o utilitarios llegan por horario o al azar | Perfil horario de llegadas, paquetes por camión, carga a granel vs. jaulas/pallets, puntualidad |
| Descarga | Manual (a granel) o con zorra/autoelevador | Paquetes/h por persona, personas por andén, andenes disponibles |
| Pre-clasificación / singulación | Separar irregulares, pesados, no transportables | % no transportable por sorter (tamaño, peso, forma) |
| Inducción | Persona o robot pone el paquete en la bandeja/celda | Tasa por puesto, puestos activos, pausas, aprendizaje, "huecos" que deja |
| Lectura | Túnel de cámaras/láser, balanza, cubicadora | Tasa de lectura, NO-READ, doble etiqueta, sin dato de destino |
| Clasificación | Tilt tray, cross belt, zapatas, narrow belt, robots | Velocidad, paso, ocupación, ventana de desvío, disponibilidad |
| Recirculación | Lo que no pudo salir vuelve a dar la vuelta | Rampa llena, NO-READ, desvío tardío, máximo de vueltas |
| Rampas / salidas | El paquete cae a la salida de su destino | Capacidad de la rampa (paquetes), ritmo de vaciado por persona |
| Contenerización | Jaula, saca, bolsa o pallet por destino; cierre y etiquetado | Paquetes por contenedor, tiempo de cierre, contenedores vacíos disponibles |
| Despacho por ola | Se cargan las rutas o troncales según horario de corte | Ventanas de corte, olas, % de paquetes que llegan a su ola |
| Excepciones | Manual: NO-READ, dañados, sin destino, devoluciones, re-entregas | Tasa por tipo, tiempo de resolución, personas |

### 2.2 Tecnologías de clasificación: tasas publicadas

Todas son tasas **nominales** de proveedor salvo indicación; no son lo que rinde un hub en un turno real.

| Tecnología | Equipo / caso | Tasa publicada | Condiciones | Etiqueta | Fuente |
|---|---|---|---|---|---|
| Bandeja basculante (tilt tray) liviana | Tsubakimoto LINISORT S-C | Máx. **2.400 ítems/h** (1 nivel), **4.800** (2 niveles) | 0,1–2 kg; 100×100×10 a 450×350×150 mm | HECHO | tsubakimoto.com |
| Tilt tray | Tsubakimoto LINISORT S-E | Máx. 10.000 ítems/h | Cargas livianas | [extracto] | tsubakimoto.com |
| Tilt tray mediano | GBI Mid Capacity | Hasta **12.000 bandejas/h**; exactitud ≥ **99,95%** informada por clientes | Hasta 4,5 kg (10 lb) | HECHO (datasheet 2017) | gbisorters.com |
| Tilt tray aeropuerto | Siemens VarioTiltTray | Hasta 9.000 valijas/h | Equipaje | [extracto] | siemens-logistics.com |
| Tilt tray cuádruple | EuroSort | Hasta 39.600 ítems/h (ítems chicos) | Joyería, farmacia | [extracto] | eurosort.com |
| Banda cruzada (cross belt) | Interroll MX 025H | Hasta **20.000 ítems/h**, **2,5 m/s** | Hasta 50 kg; el modelo anterior ST 6160 iba a 1,8 m/s | [extracto] | industrial-production.de |
| Cross belt vertical | Interroll MX018V | Hasta 14.000 unidades/h | Hasta 35 kg | [extracto] | materialfluss.de |
| Cross belt de 2 pisos | **Andreani Pacheco (AR)** | **18.000 paquetes/h**, **200 salidas** | Paquetes regulares hasta 600×600×450 mm | HECHO (17-12-2024) | mercado.com.ar |
| Narrow belt | **Andreani Pacheco (AR)** | **2 × 4.000 = 8.000 paquetes/h** | Irregulares o frágiles hasta 1,2 m y 50 kg | HECHO (17-12-2024) | mercado.com.ar |
| Zapatas deslizantes (sliding shoe) | Intelligrated IntelliSort HS 2.0 | **> 350 cajas/min** (≈ 21.000/h) a **650 pies/min (3,30 m/s)** | "Según tamaño de caja y sistema de inducción" | HECHO (catálogo) | pdf.directindustry.com |
| Zapatas | IntelliSort HS (lanzamiento 2010) | Hasta 400 cajas/min (24.000/h) | Misma velocidad | HECHO (10-09-2010) | retailitinsights.com |
| Zapatas | Bastian | Hasta 18.000 cajas/h a 600 pies/min (3,05 m/s) | — | [extracto] | bastiansolutions.com |
| Zapatas | Mathews en el CD de Nike | 230 cajas/min (13.800/h) a 540 pies/min (2,74 m/s) | Caja promedio de 18 pulgadas (0,457 m) | [extracto] | packagingdigest.com |
| Robots móviles (AMR sorter) | **Correo Argentino Monte Grande (AR)**, Libiao T-Sort | **9.000 paquetes/h**, 240 robots, **13 puestos de inducción**, **130 salidas** (60 AMBA + 70 resto del país), 1.180 m² | Hasta 5 kg; segunda etapa hasta 30 kg anunciada para 2026 | HECHO (16-12-2025; 23-01-2026) | mercado.com.ar; logisticsbusiness.com |
| Sorter vertical | **Andreani CIT Benavídez (AR)** | **8.000 paquetes/h**; pasa el **92%** de los **90.000 paquetes/día** de la central | — | HECHO (13-05-2025) | itsitio.com |
| Rangos de 1999 | Plant Engineering | Cross belt hasta 17.000 ítems/h; tilt tray > 400 pies/min (2,03 m/s); "alta velocidad" > 200 cajas/min | Datos viejos | HECHO (01-09-1999) | plantengineering.com |

Cuentas útiles (INFERENCIA):
- Correo Monte Grande: 9.000 ÷ 13 = **≈ 690 paquetes/h por puesto de inducción** y 9.000 ÷ 240 = **37,5 paquetes/h por robot** a
  capacidad máxima declarada. Muy por debajo de los 1.600/h por puesto de un sorter de lazo: en los sorters de robots el límite
  suele ser el robot y el recorrido, no la persona. HIPÓTESIS a verificar con el proveedor.
- Mathews/Nike: a 540 pies/min y 230 cajas/min, cada caja ocupa 2,35 pies de banda: 1,5 de caja y **≈ 0,85 pies (≈ 26 cm) de
  hueco**. La banda está "ocupada" el 64% del largo. Ese hueco es lo que el simulador tiene que generar, no suponer.
- Andreani CIT: 0,92 × 90.000 = 82.800 paquetes/día por sorter ÷ 8.000/h = **≈ 10,4 h a tasa máxima** por día.
- Andreani Pacheco: 520.000/día ÷ 26.000/h = 20 h/día a tasa máxima: la capacidad diaria publicada supone casi 24 × 7.

### 2.3 Fórmula de capacidad y por qué no alcanza

Fuente: oskon.com.tr (artículo de ingeniería; consultado 17-10-2026). HECHO (lo que dice el artículo) / ESTIMACIÓN (sus valores son
de ejemplo):

- **Capacidad teórica** = velocidad (m/s) ÷ paso del producto (m) × 3.600 → ítems/h. Ej.: 2 m/s ÷ 0,8 m = 9.000/h. El paso
  incluye separación segura, tolerancia de medición y tiempo de respuesta del desviador.
- **Capacidad neta** = teórica × ocupación × lectura × desvío correcto × disponibilidad. Ejemplo resuelto: 1,8 m/s ÷ 0,75 m =
  **8.640/h** × 92% de ocupación × 99% de lectura × 99,2% de desvío × 94% de disponibilidad ≈ **7.338 buenos/h**.
- **Inducción** = puestos × tasa sostenible por puesto (ej.: 4 × 1.600 = 6.400/h); **salidas**: si llegan 600/h a una rampa y se
  sacan 500/h, la cola es inevitable.
- **Capacidad del sistema** = el mínimo entre sorter neto, inducción y salidas (en el ejemplo, 6.300/h por las salidas).
- **Disponibilidad**: turno de 8 h − 30 min (reuniones/limpieza) − 15 min (paradas menores) = 7 h 15 min.
- **Recirculación**: 3% de ejemplo; 7.000 buenos + 350 vueltas = 7.350 ciclos de transporte (la recirculación come capacidad).
- **Prueba de aceptación** de ejemplo: ≥ 6.000 desvíos correctos/h durante 2 h seguidas, 99% de lectura, 99,5% de exactitud.
- **Demanda**: intervalos de no más de 15 min; pico sostenible en ventanas de 30 o 60 min. **No hay porcentaje fijo de reserva.**

Por qué no alcanza (INFERENCIA, confianza alta): los factores se acoplan. Una rampa llena genera recirculación, que ocupa bandejas,
que bajan la ocupación disponible para la inducción, que hace esperar a quien induce. Una persona que induce en ráfagas deja huecos.
Solo una simulación de eventos discretos con bandejas, rampas y personas reproduce esto. **Este es el primer diferencial de
realismo de Andén frente a una planilla.**

### 2.4 Inducción: personas y robots

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Inducción manual sostenible por puesto (supuesto de diseño) | **1.600 ítems/h** | ESTIMACIÓN (del autor; recomienda estudio de tiempos propio) | oskon.com.tr |
| Techo de la inducción manual | **≈ 2.250 paquetes/h** | HECHO autoinformado por proveedor de robots | plusonerobotics.com |
| Robot de inducción (InductOne) | Ráfagas hasta **2.800 paquetes/h**; +8% de rendimiento en pico | HECHO autoinformado | plusonerobotics.com |
| Sorter con inducción manual | **40–70%** de su capacidad de diseño (dotación y pausas) | HECHO autoinformado | plusonerobotics.com |
| Codificación manual | Promedio **30 cajas/min** (1.800/h), máximo **50** (3.000/h) | HECHO (1999) | plantengineering.com |
| Rangos de inducción por tasa | Baja 10–40 cajas/min; media 40–80 (2 estaciones manuales) | HECHO (1999) | plantengineering.com |
| Inducción robotizada sin operador (Intralox) | "Más de 7.500 paquetes/h" en paquetería | HECHO autoinformado (28-07-2026) | parcelandpostexpo.com |
| Rotación y entrenamiento en ambientes de alta rotación | Rotación hasta **50%**; entrenamiento ≈ **USD 2.000 por persona** | HECHO autoinformado | plusonerobotics.com |

### 2.5 Lectura, NO-READ y exactitud

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Lectura de túneles (proveedor) | **99,9%** | HECHO autoinformado | cognex.com |
| Lectura de ejemplo en diseño | 98,5–99% | ESTIMACIÓN (ejemplo) | oskon.com.tr |
| NO-READ de ejemplo | 2% → 160 ítems/h a manual sobre 8.000/h | ESTIMACIÓN (ejemplo) | oskon.com.tr |
| Paquetes que van a procesos de respaldo | "Típicamente **5%**" | HECHO autoinformado | primevision.com (folleto) |
| Costo de 99% de lectura en un sitio grande | ≈ 1.268 NO-READ/día; ≈ USD 166.425/año de retrabajo | [extracto] (fecha desconocida) | inboundlogistics.com |
| Exactitud de clasificación (tilt tray) | ≥ 99,95% | HECHO autoinformado | gbisorters.com |

Causas típicas que el simulador debería poder separar (INFERENCIA; no encontramos tasas por causa con fuente): etiqueta dañada o
arrugada (bolsas de polietileno), etiqueta tapada o abajo, dos etiquetas, código sin destino en el sistema, paquete fuera de medida.

### 2.6 Recirculación, rampas y contenedores

- **Recirculación**: no encontramos una tasa de referencia publicada por un operador; solo el 3% de ejemplo de oskon.com.tr.
  Vanderlande dice que su control de flujo "balancea el volumen para minimizar la recirculación y aumentar la capacidad"
  (vanderlande.com, cualitativo). HECHO. → Parámetro **a calibrar**; el simulador debe calcularla, no recibirla. INFERENCIA.
- **Salidas**: Andreani 200 salidas en su cross belt; Correo 130 salidas para 130 destinos (60 AMBA, 70 nacional). HECHO.
- **Capacidad de rampa y vaciado**: no encontramos valores publicados (paquetes por rampa, minutos de cierre de jaula o saca).
  Hueco. Se cubre con el dato del fundador (conocimiento general, sin datos de su empresa) o con estudio de tiempos. INFERENCIA.

### 2.7 Tiempos de proceso, olas y horarios de corte (datos argentinos)

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Tiempo de un paquete en el circuito automático de Andreani Pacheco | **≈ 90 s** | HECHO (29-04-2026) | iprofesional.com |
| Recepción + clasificación en Pacheco | De **2 días a menos de 4 h**; 16 pasos manuales → 1 movimiento continuo | HECHO | iprofesional.com |
| Uso de la capacidad de Pacheco | **20%** normal, **50%** proyectado en picos | HECHO | iprofesional.com |
| Red Andreani | **928.000** productos cada 24 h; 300–400 camiones grandes | HECHO | iprofesional.com |
| Promesa nacional Andreani | 24 h para procesar y transportar + 24 h para entregar | HECHO (13-05-2025) | itsitio.com |
| Envíos Flex (Mercado Libre) | Mismo día en AMBA "según el horario de corte"; exige **cumplimiento en el día > 90%** para seguir activo | HECHO (15-05-2026) | base.com |
| Horario de corte que fija el vendedor Flex | Entre 13 y 17 h según la operación | [extracto] | base.com |
| ML Don Torcuato (última milla, con Loginter) | **1,5 millones de paquetes/mes**; pico **60.000/día**; 11.000 m²; ~200 empleos directos | HECHO (06-06-2026) | mercado.com.ar |

INFERENCIA: con 20% de uso normal, Pacheco procesaría del orden de 100 mil paquetes/día en días comunes; con 50% en pico, unos 260
mil. Es una lectura de la nota, no un dato de la empresa.

---

## 3. Depósitos

### 3.1 Cadena del proceso

Recepción (descarga, control, etiquetado) → ubicación (putaway) → almacenamiento → reposición (de reserva a picking) → preparación
de pedidos (picking por zona, por ola, por lote, goods-to-person) → consolidación → embalaje (packing) → despacho. Para cada etapa,
el simulador necesita: tiempo por unidad de trabajo (pallet, línea, unidad, pedido), recorrido, recurso (persona, autoelevador,
robot, transelevador) y regla de prioridad.

### 3.2 Referencias de desempeño (WERC)

WERC (Warehousing Education and Research Council, EE. UU.) publica el **DC Measures** anual: es la referencia de la industria.

| Métrica (WERC 2025, "mejor de su clase") | Valor | Unidad |
|---|---|---|
| Envíos a tiempo | ≥ 99,5 | % de pedidos |
| Capacidad de depósito usada (promedio) | ≥ 90 | % |
| Capacidad usada en pico | ≥ 100 | % |
| Exactitud de picking | ≥ 99,68 | % |
| Dock-to-stock (de la llegada a ubicado y registrado) | < 3,5 | horas |
| Exactitud de inventario por ubicación | ≥ 99,5 | % |
| Ciclo interno del pedido (de recibido a despachado) | < 3,36 | horas |
| Ciclo total del pedido (de la compra a la recepción) | < 6 | horas |
| Recepciones sin daño | ≥ 99,07 | % |
| **Líneas preparadas y despachadas por persona-hora** | **≥ 70** | líneas/persona·h |
| Listo para despachar a tiempo | ≥ 99,5 | % |
| Horas extra sobre horas totales | < 1,88 | % |

Fuente: infografía de Yale (Hyster-Yale) que reproduce el WERC DC Measures 2025 (yale.com; consultada 17-10-2026). HECHO
(fuente secundaria autorizada). El informe completo con medianas es pago (WERC). Dato viejo: en el DC Measures 2018 las líneas por
persona-hora tenían **mediana 35** y mejor de su clase **≥ 92,8** [extracto de honeywell.com; la página ya no se lee]. La
diferencia entre 2018 y 2025 puede ser de definición o de muestra: no comparar sin leer el informe. INFERENCIA.

### 3.3 Picking: cómo se reparte el tiempo y cuánto rinde

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Recorrido sobre el tiempo de picking (persona a producto) | **≈ 50%** (Tompkins, *Facilities Planning*) | [extracto, secundaria] | locatible.com |
| Reparto en un estudio alemán | Recorrido ≈ 50%, paradas 10–25%, tomar el producto 25–35% | [extracto] | cejsh.icm.edu.pl |
| Picking en el costo del depósito | 50–70% (Tompkins y otros 2011, citado) / ≈ 55% | [extracto] | arxiv.org / varias |
| Picking por pieza | 100–400 picks/h por persona; menos con cargas pesadas | HECHO (enciclopedia sectorial, 03-08-2026) | racklify.com |
| Líneas por hora (todos los métodos) | 20–120 líneas/h según complejidad y recorrido | HECHO (íd.) | racklify.com |
| Exactitud objetivo | ≥ 99,5% (e-commerce), ≥ 99,9% (regulados) | HECHO (íd.) | racklify.com |
| AMR colaborativos (Locus) en GEODIS Dallas | **65 → 98 unidades/h** (+51%); 12 robots; 40.000 pies² (≈ 3.716 m²); −75% de horas extra | HECHO (vinculado al proveedor, 03-05-2024) | geodis.com |
| AMR (Locus) en DHL | 78 → 150 unidades/h | [extracto, perfil de Prologis] | prologis.com |
| AutoStore en Outdoor Network | **≈ 300 picks/h por puerto** (pedidos multilínea); 16 puertos de picking + 15 de reposición; 79 robots; > 41.600 cajas | HECHO (04-11-2024) | mmh.com |
| Puertos AutoStore (nominal) | ConveyorPort 240 cajas/h (entrepiso) o 180 (piso); CarouselPort 400; RelayPort hasta 650; FusionPort hasta 550; PickUpPort hasta 170 | [extracto]: la página leída directo no mostró números | autostoresystem.com |
| Flow rack de alta densidad vs. pallet (2,36 millones de picks, 192 personas) | Picking **−4,60%** de tiempo; reposición **+38,65%** de tiempo | HECHO (IJPE 2023) | ideas.repec.org |

INFERENCIA de diseño: si el recorrido es la mitad del tiempo, **el layout y la secuencia de picking son el modelo**, y una tasa
fija de "líneas por hora" esconde exactamente lo que el usuario quiere decidir (slotting, olas, lotes, zonas). El simulador tiene que
calcular recorridos sobre el plano. El ejemplo del flow rack muestra además que **toda mejora de picking tiene un costo escondido
en reposición**: el modelo tiene que tener las dos.

**Slotting ABC**: no encontramos con fuente una curva de concentración típica (el "80/20" es folclore sin respaldo que hayamos
leído). → Se calcula con el historial de pedidos del usuario (curva de Pareto real por SKU). INFERENCIA.

### 3.4 AS/RS, shuttles y robots: ciclos

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Transelevador de pallets | **20–40 ciclos dobles/h por pasillo** | [extracto]; la página ya no existe (410) | robotomated.com |
| Ejercicio de libro (pasillo 240 pies × 60 pies, 400 y 60 pies/min, 18 s de toma/depósito, 85% de uso) | 1,6 min ciclo simple; 2,7 min ciclo doble; 35,6 transacciones/h | [extracto] | dr.ddn.upes.ac.in |
| Multishuttle en Ferdinand Gross (2009) | Zona "roaming": 20 shuttles, 59.000 posiciones, **615 ciclos dobles/h** (≈ 31 por shuttle); zona "captive": 12 shuttles, 5.000 posiciones, 514/h (≈ 43 por shuttle) | HECHO (05-11-2009) / INFERENCIA (por shuttle) | logisticsmanager.com |
| Multishuttle (nominal) | Hasta 1.200 entradas+salidas/h (proveedor); 700/h (prensa) | [extracto] | dematic.com; scdigest.com |
| Parámetro de forma del almacén | a = (H/L) × (Vx/Vy); ideal a = 1; resultados confiables con 0,5 ≤ a ≤ 2 (norma UNE 58912) | HECHO (17-05-2021) | interlakemecalux.com |
| Métodos estándar de ciclo | FEM 9.851 (transelevadores) y **FEM 9.860** (vehículos/shuttles: ciclos simple, doble y múltiple del elevador) | HECHO (existencia; documento pago) | vdmashop.de |
| AutoStore, robots | 30–40 cajas/h por robot en los sitios más rápidos | [extracto] | autostoresystem.com |

INFERENCIA de diseño: el motor de Andén tiene que **calcular** el ciclo con cinemática (aceleración, velocidad máxima en cada eje,
tiempo de toma y depósito, posición) siguiendo la lógica de los métodos FEM, y ofrecer las tasas de arriba solo como control de
cordura. Así el usuario puede cambiar el alto del rack o el largo del pasillo y ver qué pasa, que es la pregunta real.

### 3.5 Autoelevadores y reach trucks

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Velocidad de traslado sin carga | Jungheinrich ETV 214 / ETM 216: **11 km/h** (la serie llega a 14); Bobcat 7 Series Plus: **12 km/h**; Mitsubishi SENSIA EM: 12–14,5 km/h | HECHO (fichas de fabricante) [extracto] | jungheinrich.co.uk; bobcat.com; directindustry.com |
| Velocidad de elevación | 0,28–0,45 m/s con carga; 0,45–0,7 m/s sin carga; Bobcat 0,35 / 0,60 m/s; un Hyster hasta 0,8 m/s | HECHO (fichas) [extracto] | íd.; mhe.jjsea.com |
| Minutos por pallet ubicado (putaway) | **No encontrado** | — | — |

Las fichas dan velocidades máximas; en un pasillo real se usan perfiles con aceleración, giros y límites de seguridad. INFERENCIA.
El tiempo por pallet sale del modelo (recorrido + elevación + toma/depósito + congestión), y se valida con un estudio de tiempos.

### 3.6 Congestión en pasillos, reposición, packing y despacho

No encontramos valores de referencia con fuente para: bloqueo en pasillos angostos, tiempos de reposición por tipo de ubicación
(salvo el +38,65% del flow rack), tiempos de embalaje por pedido ni tiempos de carga en despacho. Hueco (§10). La congestión no se
parametriza con un número: **emerge** si el simulador modela pasillos como recursos con capacidad (uno o dos sentidos) y personas
o vehículos como agentes. INFERENCIA. Un trabajo académico calcula los dos primeros momentos del tiempo de picking para cuatro
heurísticas de recorrido y modela un depósito con c preparadores como cola M/G/c (Engels y otros, arXiv 2201.05025, 13-01-2022):
sirve como **prueba automática** del motor. HECHO.

---

## 4. Cross-dock y patio

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Descarga de un camión paletizado vs. a granel (carne en cajas, Supervalu) | **62 min vs. 142 min** | HECHO (estudio 1995–96, nota 23-02-1998) | supermarketnews.com |
| Tiempo puerta a puerta del camión | **97 min vs. 241 min** | HECHO (íd.) | supermarketnews.com |
| Cajas descargadas por hora | **559 vs. 281** | HECHO (íd.) | supermarketnews.com |
| Ahorro por camión al paletizar | USD 119,81 (de 1997) | HECHO (íd.) | supermarketnews.com |
| Contenedor paletizado vs. a granel | 30–60 min con autoelevador vs. 3–5 h manual | [extracto, glosario de proveedor] | wearewarp.com |
| Íd., otra fuente | 15–30 min (1 operador) vs. 2–4 h (2–4 personas) | [extracto] | boxumold.com |
| Dock-to-stock "mejor de su clase" | < 3,5 h | HECHO | yale.com (WERC 2025) |
| Camiones grandes en la red Andreani | 300–400 | HECHO | iprofesional.com |

Lo que el simulador tiene que representar (INFERENCIA): andenes como recursos; turnos de camiones (citas) con distribución de
adelanto/atraso; playa de espera con capacidad; reglas de asignación de andén (primero llegado, por prioridad, por destino);
descarga a granel vs. en jaulas/pallets (la diferencia es de 2 a 4 veces, según las fuentes de arriba); tiempo de estadía del
camión (dwell) y del producto en el cross-dock. **No encontramos** datos argentinos de cumplimiento de turnos, espera en playa ni
estadía de camiones. Hueco (§10).

---

## 5. Transporte y última milla

### 5.1 Lo que dicen 9.184 rutas reales (Amazon, 2018)

Dataset del Amazon Last Mile Routing Research Challenge (Merchán y otros, *Transportation Science*, 2022; licencia **CC BY-NC
4.0**). 6.112 rutas de entrenamiento en Seattle, Los Ángeles, Austin, Chicago y Boston. HECHO:

| Por ruta | P10 | Media | P90 | Desvío |
|---|---|---|---|---|
| Paradas | 105 | **148,0** | 186 | 31,0 |
| Paquetes | 197 | **238,5** | 278 | 31,0 |
| Paquetes con ventana horaria | 2 | 18,6 | 40 | 15,2 |
| Tiempo total de ruta (h) | 7,1 | **8,1** | 9,1 | 0,8 |
| Tiempo de tránsito (h) | 2,6 | **3,6** | 4,6 | 0,7 |
| Tiempo de servicio (h) | 3,4 | **4,5** | 5,6 | 0,9 |

(Las 3.072 rutas de evaluación dan casi lo mismo: 141,9 paradas, 237,5 paquetes, 8,0 h, servicio 4,6 h.) El "tiempo de servicio
planificado" por paquete incluye estacionar y entregar (según una fuente secundaria; el paper lo define como "el tiempo que se espera
que requiera servir el paquete"). Cada paquete trae estado: entregado, intento fallido o rechazado.

Cuentas (INFERENCIA): **≈ 109 s de servicio por parada**, ≈ 68 s por paquete, 1,61 paquetes por parada, ≈ 88 s de manejo entre
paradas, **56% del tiempo de ruta en servicio** y solo 7,8% de paquetes con ventana horaria. Son rutas de EE. UU. en camioneta: en
AMBA con moto, edificios con portero y estacionamiento difícil, los números serán otros. HIPÓTESIS a calibrar.

### 5.2 Entregas fallidas y re-entregas

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Alemania, éxito al primer intento | **92,79%** (T1 2024) → **80,42%** (T1 2025): falla 7,2% → 19,6% | HECHO (Parcel Perform 2025, vía secundaria) | urbify.com |
| Singapur (Ninja Van) | Falla del primer intento a domicilio **7,6%**; el segundo y tercer intento fallan **más del doble** | HECHO (tesis SUTD, 2016) | repository.sutd.edu.sg |
| España (CNMC) | ≈ 20% de paquetes no entregados al primer intento (2021); ≈ EUR 15 por entrega fallida; > EUR 3.200 millones/año del sector | [extracto] | americaretail-malls.com |
| "Hasta 20%" no llega al primer intento; hasta USD 17 por orden | Atribuido a Harvard Business Review por prensa argentina; **no vimos el estudio original** | [extracto] | mercado.com.ar; baenegocios.com (30-08-2024) |
| Reino Unido (InPost) | 1 de cada 3 paquetes falla al primer intento | [extracto] | retailgazette.co.uk |
| Éxito al primer intento EE. UU. / Reino Unido / Irlanda | 97,2% / 93,7% / 88,07% (sin fuente clara) | [extracto] | smartroutes.io |
| Costo de una entrega fallida (Reino Unido, estudio viejo) | GBP 12,89 (USD 17,78); 5,6% de pedidos no llegan | [extracto] | parcelbroker.co.uk |
| Causa principal | ~90% de las fallidas por ausencia del cliente (estimación de un operador español) | [extracto] | merca2.es |
| **Argentina** | **No encontramos una tasa publicada** | — | — |

INFERENCIA de diseño: la tasa de falla varía de 2,8% a 33% según país, año y fuente: **es una distribución con incertidumbre, no
un número**. El simulador necesita: probabilidad de falla por tipo de destino y franja horaria, decisión de qué se hace con el
paquete (vuelve al hub, punto de retiro, segundo intento), y el **efecto de arrastre** sobre la capacidad del día siguiente. Con
Flex exigiendo > 90% de cumplimiento en el día, el KPI de corte natural para AMBA es "% entregado el mismo día".

### 5.3 Contexto argentino de última milla

- ~**1 millón de entregas por día** en el país (Infobae/Movant, 27-09-2026; citado en
  `conocimiento/2026-09-28-logistic-lab-ia-y-calculos.md`). HECHO (prensa).
- Envíos Flex: mismo día en AMBA; el vendedor fija zonas por código postal, horario de corte y límite diario de envíos
  (base.com 15-05-2026; upseller.com [extracto]). HECHO.
- Tarifas por envío, índice de costos de última milla (AECA-UM / C3T-UTN), escalas de Camioneros y combustibles: ya están con
  fuente y fecha en `apps/anden/js/referencias.js` (17-10-2026). HECHO.
- **No encontramos**: paquetes por ruta y por día de repartidores Flex en AMBA, tiempos por parada en CABA, velocidades por franja
  horaria. Hueco (§10).

---

## 6. Personas

### 6.1 Curvas de aprendizaje

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Ley de Wright | Costo (o tiempo) de la unidad x: C_x = C₁ · x^(log₂ b); b = cociente de progreso | HECHO | en.wikipedia.org (Experience curve effect) |
| Cocientes típicos | b = 0,75–0,90 (10–25% de mejora por cada duplicación); repetitivo electrónico 90–95% | HECHO | íd. |
| Picking por voz, ingresantes vs. experimentados (5 ingresantes, 7 semanas medidas por media semana, ≈ 278.000 picks en 1.630 h) | Eficiencia DEA de los ingresantes **0,46 → 0,61 → 0,72 → 0,88** (períodos 3, 5, 7 y 9 del estudio); grupo experimentado estable entre **0,80 y 0,95** | HECHO | Loske y Klumpp, IFAC 2020 (re.public.polimi.it) |
| Tiempo para igualar a los experimentados | **≈ 7–9 semanas** en picking manual por voz; **6 semanas** en un sistema semiautomático (≈ 1 millón de picks en 3.630 h) | HECHO | íd. |
| Explicar bien el sistema al ingresante | Mejora el punto de partida de la curva | HECHO (cualitativo) | íd. |
| Grosse y Glock (IJPE 2015) | El aprendizaje cambia los tiempos de picking; conviene asignar a quien aprende más lento a la zona de mayor rotación | HECHO (resumen; los parámetros están en el texto pago) | ideas.repec.org |

INFERENCIA de diseño: cada persona del modelo tiene **antigüedad** y una curva (por defecto tipo Wright con b editable, calibrada con
el caso de arriba). Para el pico, el usuario elige cuántos temporarios y desde cuándo los entrena; el simulador muestra cuánto
rinden. Esto convierte "¿cuánta gente necesito para el Hot Sale?" en una pregunta que se responde bien.

### 6.2 Fatiga, pausas y suplementos

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Modelo de fatiga-recuperación (Jaber, Givi y Neumann 2013) | La fatiga se acumula exponencialmente con el tiempo (índice λ) y la pausa la recupera (índice μ) | HECHO | informs-sim.org (WSC 2022) |
| Parámetros usados para 4 grupos de preparadores temporarios (joven con/sin experiencia, mayor con/sin experiencia) | λ = 0,0069 / 0,0077 / 0,0085 / 0,0096; μ = 0,0096 / 0,0085 / 0,0077 / 0,0069; fatiga máxima admitida 0,906 | ESTIMACIÓN (los autores los generaron por computadora, "inspirados en la literatura y el caso") | informs-sim.org |
| Resultado | Con el esquema de pausas de la empresa, los grupos mayores superan la fatiga máxima; pausas a medida la bajan | HECHO | íd. |
| Cámara de frío (−21 °C; 40 preparadores; 514.953 visitas a ubicaciones; 4 meses) | Curva en "S horizontal" entre tiempo trabajado desde la pausa y tiempo de picking: hay una ventana óptima después de cada pausa, que depende de su largo | HECHO (IJPE 2025; números finos en el texto pago) | ideas.repec.org |
| Suplemento personal (trabajo liviano, 8 h sin pausas organizadas) | **2–5%** (10–24 min por día); más con calor, humedad o trabajo pesado | HECHO (apuntes de estudio del trabajo, EMU) | staff.emu.edu.tr |
| Pausas organizadas habituales | Una a media mañana y otra a media tarde, de **5 a 15 min** cada una | HECHO (íd.) | staff.emu.edu.tr |
| Andén v0 (calculadoras) | 12,5% de tiempo no productivo (1 h de cada 8) | ESTIMACIÓN propia | `apps/anden/js/referencias.js` |

INFERENCIA de diseño: la productividad de cada persona en el simulador = base × aprendizaje(antigüedad) × fatiga(tiempo desde la
pausa) × condición (frío, calor, peso). Las pausas son eventos programados que también bajan la capacidad de la línea (ver el
40–70% de uso de sorters con inducción manual).

### 6.3 Ausentismo, turnos y rotación (Argentina)

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Medición oficial | Encuesta de Indicadores Laborales (EIL, Ministerio de Trabajo): mensual desde agosto de 2012; ≈ 3.500 empresas privadas de 5–10+ personas en 12 aglomerados; indicadores: % de personal ausente, días por ausente, **% de ausencias diarias sobre jornadas laborables**, composición por motivo (11 motivos) | HECHO | argentina.gob.ar (ficha metodológica EIL) |
| Tope aceptable según empresas medianas y grandes | **5%** de las horas o días teóricos | HECHO (ADRHA, citado por la EIL) | argentina.gob.ar |
| Empleados privados registrados que faltaron al menos un día en el mes (3er trim. 2025) | **12,6%**; 49% por enfermedad no laboral; 20% de las faltas sin aviso; 6 de cada 10 empresas con faltas en el mes | HECHO (IDESA en Infobae, nota del 19-02-2026) | eleconomista.com.ar |
| Referencia España (industria, 2025) | 8,18% | [extracto] (Adecco) | adeccogroup.com |
| Jornada máxima | 8 h/día o 48 h/semana (Ley 11.544) | HECHO | `referencias.js` |
| Vacaciones, feriados | 14 días corridos (< 5 años); 16 feriados en días hábiles en 2026 | HECHO / ESTIMACIÓN | `referencias.js` |

INFERENCIA: el 5% que usa Andén v0 como supuesto ahora tiene un ancla (tope "aceptable" según ADRHA), pero el valor real por
sector tiene que salir del indicador "% de ausencias diarias" de la EIL. Ausentismo en el simulador: por día y por persona, con
probabilidad mayor los lunes y después de feriados es una **HIPÓTESIS** que no pudimos respaldar con fuente.

---

## 7. Distribuciones de llegada y de servicio

### 7.1 Volúmenes y picos del e-commerce argentino

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Primer semestre 2026 (CACE/Kantar) | **181,5 millones de órdenes** (+21%), 248 millones de artículos (+22%), $19.533.815 millones (+28%), ticket $107.597 | HECHO (21-08-2026) | mercado.com.ar |
| Promedio diario implícito, 1er semestre 2026 | ≈ **1,0 millón de órdenes/día**; 1,37 artículos por orden | INFERENCIA (181 días) | — |
| CyberMonday 2025 (3 al 5-11-2025) | ≈ **7 millones de órdenes** (+24%), 12,1 millones de unidades (+15%), $639.000 millones (+29%), ticket $92.000, descuento promedio 31%, ~900 empresas | HECHO (encuesta Kantar a participantes, 10-11-2025) | mercado.com.ar |
| Promedio diario implícito, CyberMonday 2025 | ≈ **2,33 millones de órdenes/día**; 1,73 unidades por orden | INFERENCIA | — |
| Hot Sale 2026 (11 al 14-05-2026, primeras horas) | Facturación +35,14% interanual entre las 11 y las 15 del primer día; **hora pico 13–14 h**; comprobantes −2,61% (109.791); ticket $96.878; 77% desde el celular | HECHO (Facturante y relevamiento sin nombre, vía BAE, 12-05-2026) | baenegocios.com |
| Balance final del Hot Sale 2026 | **No lo encontramos** publicado | — | — |

INFERENCIA (cautela): 2,33 vs. 1,0 millones por día sugiere que un evento duplica largamente la demanda diaria, pero **no son
comparables**: CyberMonday mide solo a las empresas participantes (incluye turismo y pasajes, que no generan paquetes) y el semestre
mide todo el mercado de otro año. El multiplicador real de paquetes en un hub sale del dato del usuario o de una fuente del operador;
Andreani da una pista: 20% → 50% de uso de capacidad, o sea **×2,5** en picos. HECHO (dato) / INFERENCIA (lectura).

### 7.2 Perfil horario

| Dato | Valor | Etiqueta | Fuente |
|---|---|---|---|
| EE. UU., > 1 millón de órdenes (SureBright, 06-05-2026) | 0–5 h: 6,4%; 6–11 h: 23,4%; **11–15 h: 36,4%**; 15–18 h: 24,2%; 18–23 h: 19,2%. Mediodía y 13 h: **7,5% cada una** (máximo); 9 h: 5,8%; 18 h: 4,8%; 19 h: 4,4% | HECHO (empresa con interés comercial; muestra de su red) | surebright.com |
| Argentina, Hot Sale 2026 | Hora pico 13–14 h del primer día | HECHO | baenegocios.com |
| Argentina, perfil horario de un día normal | **No encontrado** | — | — |

Ojo: el perfil de **compras** no es el perfil de **llegadas al hub**. Entre una y otra están el horario de corte del vendedor (Flex:
13–17 h [extracto]), las colectas y los troncales. El simulador necesita dos curvas: la de pedidos y la de llegadas físicas, con la
lógica que transforma una en otra. INFERENCIA.

### 7.3 Qué distribuciones usar (método, no dato)

No encontramos con fuente leída en esta sesión un catálogo de "distribuciones que usa la industria" por proceso. Lo que sigue es
**práctica estándar de simulación** (INFERENCIA, confianza alta; a respaldar con bibliografía en la próxima sesión):
- **Llegadas**: proceso de Poisson **no homogéneo** con tasa por intervalo de 15 min (coincide con el "no más de 15 min" de
  oskon.com.tr) × multiplicador por día de semana × multiplicador de evento. Los camiones, en cambio, llegan **por turno** con un
  desvío (adelanto/atraso), no al azar.
- **Tiempos de servicio humanos**: distribuciones asimétricas a la derecha y positivas (lognormal, gamma o triangular cuando solo
  hay mínimo/moda/máximo), **ajustadas a los datos del usuario** cuando existan.
- **Fallas de equipos**: tiempo entre fallas y tiempo de reparación separados, para que la disponibilidad salga del modelo.
- **Lo que hay que probar automáticamente**: estaciones simples contra colas M/M/c, la ley de Little y las fórmulas del picking
  (Engels y otros 2022), como ya propone `frontera-ia.md` §4.3.

---

## 8. KPIs estándar (con unidades y fórmula)

| KPI | Fórmula | Unidad | Referencia con fuente |
|---|---|---|---|
| Throughput | Unidades buenas procesadas ÷ tiempo | paquetes/h, líneas/h, pallets/h | Tasas de §2–§3 |
| Productividad laboral | Unidades ÷ horas-persona pagadas (o presentes) | líneas/persona·h | WERC 2025: ≥ 70 (mejor de su clase) |
| **OEE adaptado a logística** | Disponibilidad × Rendimiento × Calidad | % | Ver nota |
| Disponibilidad | Tiempo en marcha ÷ tiempo programado | % | oskon.com.tr: 94–95% de ejemplo |
| Rendimiento | (Tasa ideal × unidades) ÷ tiempo en marcha | % | — |
| Calidad | Unidades bien clasificadas al primer paso ÷ total | % | GBI ≥ 99,95% (proveedor) |
| TEEP | Carga (programado ÷ calendario) × OEE | % | en.wikipedia.org (OEE) |
| Utilización de un recurso | Tiempo ocupado ÷ tiempo disponible | % | Andreani 20% / 50% de la capacidad |
| Dwell time (estadía) | Salida − entrada, por paquete o camión | h (media, P90) | — |
| Dock-to-stock | Ubicado y registrado − llegada | h | WERC 2025: < 3,5 h |
| Ciclo interno del pedido | Despachado − recibido | h | WERC 2025: < 3,36 h |
| Turn time del camión | Salida por portón − entrada | min | Supervalu: 97 (pallet) vs. 241 (granel) |
| Tasa de NO-READ | No leídos ÷ inducidos | % | 0,1–5% según fuente (§2.5) |
| Tasa de recirculación | Vueltas extra ÷ inducidos | % | 3% de ejemplo (sin dato real) |
| Mal clasificados | Paquetes en salida equivocada ÷ clasificados | % o ppm | ≤ 0,05% (GBI, proveedor) |
| % que llega a su ola / corte | Paquetes listos antes del corte ÷ paquetes con ese corte | % | Flex: > 90% entregado en el día |
| Éxito al primer intento | Entregados al primer intento ÷ intentados | % | 80,4–97,2% según país (§5.2) |
| Costo por paquete | Costo total del proceso ÷ paquetes | $/paquete | Calculadora 4 de Andén v0: $336 (ESTIMACIÓN) |
| Nivel de servicio / OTIF | Pedidos a tiempo y completos ÷ pedidos | % | WERC 2025: envíos a tiempo ≥ 99,5% |
| Horas extra | Horas extra ÷ horas totales | % | WERC 2025: < 1,88% |

Nota sobre OEE: es una métrica de manufactura (Disponibilidad × Rendimiento × Calidad); no hay un estándar de "OEE logístico". La
adaptación de arriba es propia (INFERENCIA). El "85% de clase mundial" que circula **no tiene fuente** y la propia Wikipedia lo
cuestiona como meta (HECHO): Andén no debería usarlo como referencia.

INFERENCIA de diseño: todo KPI de tiempo se muestra con **media y P90** (no solo promedio), y todo KPI tiene que poder abrirse para
ver **qué recurso y qué excepción lo explica** (por ejemplo, "el 60% de la espera en inducción viene de las pausas de 10:00").

---

## 9. Datos argentinos que se pueden conseguir

| Fuente | Qué da | Frecuencia | Acceso | Estado |
|---|---|---|---|---|
| EIL (Ministerio de Trabajo) | Ausentismo: % ausente, días, motivos, % de jornadas perdidas; también dotación y rotación | Mensual | Público | Ficha metodológica leída; falta bajar la serie por rama |
| CACE / Kantar | Órdenes, unidades, facturación por semestre y por evento (Hot Sale, CyberMonday) | Semestral y por evento | Notas de prensa públicas; informe completo, a pedido | Leído (1S 2026, CyberMonday 2025) |
| Facturante (vía prensa) | Facturación y comprobantes por franja horaria durante eventos | Por evento | Prensa | Leído (Hot Sale 2026) |
| Tiendanube | Ventas de pymes por evento y categoría | Por evento | Prensa | No leído (cupo agotado) |
| CEDOL / C3T-UTN, FADEEAC, AECA-UM | Índices mensuales de costos logísticos, transporte y última milla | Mensual | Público | Ya en `referencias.js` |
| Camioneros (CCT 40/89) y Comercio (CCT 130/75) | Escalas salariales | Por acuerdo | Público | Ya en `referencias.js` |
| Cushman & Wakefield | Alquiler y vacancia de naves logísticas | Trimestral | Público | Ya en `referencias.js` |
| Prensa sectorial (Mercado, iProfesional, Cronista, iProUP, ITSitio, Infobae/Movant) | Capacidades de hubs, sorters, superficies, dotación | Cuando anuncian | Público | Leído (Andreani, Correo, Mercado Libre) |
| Mercado Libre (ayuda y operadores Flex) | Reglas de Flex, tarifas de operadores | Mensual | Público | Parcial |
| Datos abiertos de la Ciudad de Buenos Aires | Tránsito, velocidades, restricciones de carga y descarga | Variable | Público | **A verificar** (no buscado) |
| El usuario | Exportes de WMS/TMS, planillas de volumen, tiempos | — | Privado, en su navegador | El dato que manda; Andén ajusta distribuciones |
| El fundador | Conocimiento general de hubs de última milla (sin datos de su empresa) | Una vez | Mayo de 2027 (recordatorio del P2) | Pendiente |

---

## 10. Lo que no encontramos y cómo cerrarlo

El cupo de búsquedas se agotó; esto quedó abierto (en orden de importancia para el producto):

1. **Perfil horario argentino de un día normal** (pedidos y llegadas al hub). → Tiendanube y Mercado Libre publican notas por evento;
   pedir a 2–3 usuarios piloto su exporte; la Consola de Andén puede aprender del dato del usuario sin que salga del navegador.
2. **Tasa de entrega fallida en Argentina.** → Buscar en prensa de Correo Argentino, Andreani y AECA-UM; preguntar en comunidades de
   repartidores (con la regla 90/10, sin vender).
3. **Paquetes por ruta y tiempos por parada en AMBA (moto y utilitario).** → Conocimiento general del fundador; grupos de "flexeros";
   un estudio propio con la app de ruteo (P5) si se construye.
4. **Recirculación, capacidad de rampa y tiempos de cierre de contenedor medidos en un hub real.** → Papers de simulación de hubs
   (Winter Simulation Conference tiene casos de paquetería); proveedores (BEUMER, Vanderlande, Fives) publican casos.
5. **Tiempos de putaway, reposición, packing y carga por unidad.** → MTM/MOST y estudios de tiempos publicados; WERC (pago).
6. **Fórmulas FEM 9.851 / 9.860.** → Comprar los documentos (VDMA) cuando se construya el módulo AS/RS, o usar los papers abiertos que
   las aplican (simlab.mas.bg.ac.rs).
7. **Medianas del WERC 2025 y los rangos por tipo de depósito.** → Informe pago; o los resúmenes de los patrocinadores.
8. **Datos de patio en Argentina** (cumplimiento de turnos, espera en playa, estadía). → Proveedores de gestión de turnos de la
   región; FADEEAC; casos de cross-dock de supermercados.
9. **Curva de concentración ABC típica por rubro.** → Del historial del usuario; papers con datos de e-commerce.
10. **Balance oficial del Hot Sale 2026.** → Nota de CACE de mayo de 2026.

---

## 11. Implicancias concretas para el diseño (INFERENCIA)

1. **Biblioteca de parámetros con procedencia** como pieza central del producto: cada bloque (sorter, puesto de inducción,
   autoelevador, ruta) llega con valores de referencia, su distribución, su fuente, su fecha y su insignia HECHO/ESTIMACIÓN, y el
   informe final dice **qué supuestos pesan más en el resultado** (análisis de sensibilidad) para que el usuario sepa qué medir.
2. **Modelar mecanismos, no tasas**: bandejas con paso, ventana de desvío y vueltas; rampas con capacidad y vaciado; pasillos como
   recursos; transelevadores con cinemática; rutas con tiempo de servicio por tipo de parada. Las tasas publicadas quedan como
   **control de cordura** ("tu sorter rinde 7.300/h; el proveedor dice 9.000/h nominales; la diferencia viene de...").
3. **La persona como agente con estado**: antigüedad (aprendizaje), fatiga desde la última pausa, pausas programadas, ausentismo
   diario, puesto. Es lo que FlexSim deja al usuario y lo que más mueve el resultado en un hub con inducción manual.
4. **Excepciones de primera clase**: NO-READ, recirculación, mal clasificado, dañado, no transportable, entrega fallida y re-entrega
   como flujos visibles en 2D/3D (otro color, otra ruta), con su propio KPI y su costo.
5. **Calendario y picos como objeto**: curva de pedidos cada 15 min, curva de llegadas físicas, cortes, olas y multiplicadores de
   evento (Hot Sale, CyberMonday, Black Friday) con el calendario argentino; dotación de pico con temporarios que aprenden.
6. **Plantillas argentinas calibradas con datos públicos**: "Hub tipo Correo Monte Grande (sorter de robots)", "Hub con cross belt
   de 2 pisos", "Nodo de última milla tipo Don Torcuato", "Depósito pyme con picking por voz". Cada una con sus fuentes. Ningún
   incumbente las tiene.
7. **KPIs con dispersión y explicación**: media y P90 siempre; OEE adaptado con sus tres factores separados; costo por paquete
   conectado a las calculadoras v0 (costo laboral, alquiler, índices).
8. **Validación automática del motor** con casos de solución conocida (M/M/c, ley de Little, momentos del tiempo de picking).
9. **Datos con licencia limpia**: usar solo estadísticas citadas del dataset de Amazon (CC BY-NC); nada de incrustarlo.
10. **Lo que hay que preguntar al usuario en la entrevista** (para el "Contame tu operación"): volumen por hora en un día normal y
    en el pico, cortes, cantidad de puestos y personas por puesto, tasa de NO-READ si la conoce, % de fallidas, tiempos por parada.
    Si no sabe, Andén propone el valor de referencia de este documento **y lo marca como supuesto**.

---

## Fuentes (todas consultadas el 17-10-2026)

Lectura directa salvo **[extracto]** (solo vimos el resumen del buscador porque el sitio dio 403/404/410/503 o el PDF no se pudo leer).

**Hubs y sorters**
- Oskon — cómo calcular la capacidad de un sorter: https://www.oskon.com.tr/en/blog/how-to-calculate-sorter-capacity
- Plus One Robotics — caso de Pensilvania (inducción manual vs. robot): https://www.plusonerobotics.com/case-studies/pennsylvania-facility-turns-its-sorter-into-a-24-7-revenue-engine
- Intralox en Parcel+Post Expo (28-07-2026): https://parcelandpostexpo.com/exhibitor-news/how-zero-operator-parcel-induction-helps-maximize-loop-sorter-performance
- Plant Engineering, "Conveyor sortation systems" (01-09-1999): https://www.plantengineering.com/?p=5094
- Tsubakimoto LINISORT S-C: https://tsubakimoto.com/materials-handling/products/linisort-s-c/ ; S-E [extracto]: https://tsubakimoto.com/materials-handling/products/linisorts-e/
- GBI Mid Capacity Sorter (datasheet 2017): https://gbisorters.com/wp-content/uploads/2019/01/Datasheet_GBI_Mid_Capacity_Sorter_2017.pdf
- Siemens VarioTiltTray [extracto]: https://www.siemens-logistics.com/en/airport-logistics/baggage-handling-systems/variotilttray
- EuroSort quad tilt tray [extracto]: https://www.eurosort.com/product/quad-tilt-tray-sorter/
- Interroll MX 025H [extracto]: https://www.industrial-production.de/materials-handling/high-performance-sorter-from-interroll--crossbelt-sorter-processes-20-000-pieces-per-hour.htm ; MX018V [extracto]: https://www.materialfluss.de/conveyor-and-lifting-technology/interroll-introduces-new-vertical-crossbelt-sorter.htm ; página de producto: https://www.interroll.com/benefit-high-performance-crossbelt-sorter/
- Vanderlande CROSSORTER: https://www.vanderlande.com/us/systems/sortation/crossorter/
- Intelligrated/Carat IntelliSort HS 2.0: https://pdf.directindustry.com/pdf/carat-usa/intellisort-hs-20/58734-1123742.html ; lanzamiento 2010: https://www.retailitinsights.com/doc/intelligrated-expands-intellisort-family-with-0001
- Bastian shoe sorter [extracto]: https://bastiansolutions.com/solutions/technology/conveyor-systems/bastian-conveyor-sortation/shoe-sorter
- Nike/Mathews [extracto]: https://www.packagingdigest.com/packaging-design/nike-dc-soars-into-uncharted-production-output
- Cognex, sorting tunnels [extracto]: https://www.cognex.com/industries/logistics/sortation/ship-sorter-scanning
- Prime Vision, folleto Sight Solutions [extracto]: https://primevision.com/wp-content/uploads/2023/03/Sight_Solutions_brochure_compressed.pdf
- Inbound Logistics, tunnel scanning [extracto]: https://www.inboundlogistics.com/articles/tunnel-scanning-in-consolidation-warehouses/

**Argentina: hubs, operadores y e-commerce**
- Andreani Pacheco, sorters (17-12-2024): https://mercado.com.ar/protagonistas/andreani-convierte-su-planta-de-pacheco-en-el-hub-logistico-mas-automatizado-del-pais
- Andreani, inversión de USD 30 millones (29-04-2026): https://www.iprofesional.com/tecnologia/453613-andreani-invierte-us30-millones-en-tecnologia-en-su-hub-pacheco-y-expande-su-operacion-a-miami
- Andreani, capacidad 8.000 → 26.000/h (16-12-2024): https://www.cronista.com/negocios/por-el-boom-del-e-commerce-andreani-cuadruplicara-su-capacidad-de-procesar-paquetes/
- Andreani CIT Benavídez y Hot Sale (13-05-2025): https://www.itsitio.com/ar/?p=180846
- Correo Argentino Monte Grande (18-12-2025): https://mercado.com.ar/innovacion/correo-argentino-inaugura-sistema-robotico-que-triplica-la-capacidad-operativa-logistica-en-monte-grande
- Libiao en Correo Argentino (23-01-2026): https://logisticsbusiness.com/materials-handling/amr-agv/first-fully-robotic-parcel-hub-in-argentina/
- Mercado Libre Don Torcuato (06-06-2026): https://mercado.com.ar/negocios/mercado-libre-inauguro-un-centro-logistico-de-ultima-milla-en-don-torcuato
- Envíos Flex y Same Day, Base (15-05-2026): https://base.com/es-AR/blog/envios-flex-y-same-day-en-buenos-aires-con-base/
- Envíos Flex en Capital Federal, Base (horario de corte 13–17 h) [extracto]: https://base.com/es-AR/blog/?p=18386
- Configuración de Flex, UpSeller [extracto]: https://www.upseller.com/es/doc-article/554
- CACE primer semestre 2026 (21-08-2026): https://mercado.com.ar/tendencias/cace-el-comercio-electronico-facturo-19-533-815-millones-en-el-primer-semestre
- CyberMonday 2025 (10-11-2025): https://mercado.com.ar/tendencias/cybermonday-2025-alcanzo-639-000-millones-y-reunio-a-mas-de-ocho-millones-de-usuarios
- Hot Sale 2026, primeras horas (12-05-2026): https://www.baenegocios.com/amp/hot-sale-2026-los-argentinos-gastan-casi-100-000-por-compra/
- Entregas fallidas, BAE (30-08-2024): https://www.baenegocios.com/negocios/Ecommerce-20-de-los-paquetes-no-llegan-en-el-primer-envio-20240830-0051.html
- Logística de fin de año y entregas fallidas [extracto]: https://mercado.com.ar/movilidad/la-logistica-de-fin-de-ano-en-argentina-expone-desafios-criticos-y-perdidas-por-entregas-fallidas

**Depósitos**
- WERC DC Measures 2025, infografía Yale: https://www.yale.com/globalassets/coms/yale/north-america/documents/white-papers/snack-drawer/YALE-1520_WERC-DC-Metrics-infographic.pdf
- WERC 2018 vía Honeywell [extracto]: https://www.honeywell.com/us/en/news/featured-stories/2020/02/which-metrics-matter-most-to-dc-operations
- Racklify, zone picking (03-08-2026, act. 08-10-2026): https://racklify.com/encyclopedia/zone-picking-productivity-metrics-kpis-benchmarks-and-measurement/
- Recorrido ≈ 50% [extracto]: https://locatible.com/blog/?p=782 ; https://cejsh.icm.edu.pl/cejsh/element/bwmeta1.element.desklight-867b7413-d66c-42f8-bcb0-889227c43a17/c/E_2014_iss3_138-150.pdf
- Engels, Adan, Boxma y Resing, heurísticas de recorrido (arXiv 2201.05025, 13-01-2022): https://arxiv.org/abs/2201.05025
- GEODIS + Locus (03-05-2024): https://geodis.com/us-en/resources/case-studies/mini-logistics-case-study-mobile-robotics
- DHL + Locus [extracto]: https://groundbreakers.prologis.com/magazine/rick-faulk
- AutoStore en Outdoor Network (04-11-2024): https://www.mmh.com/article/doubling_productivity_at_outdoor_network
- AutoStore, puertos [extracto]: https://autostoresystem.com/faq/workstations ; https://autostoresystem.com/insights/proven-efficiency-data-backed-high-throughput-warehouse-solution
- Loske, Klumpp, Grosse, Modica y Glock, flow rack (IJPE 261, 2023): https://ideas.repec.org/a/eee/proeco/v261y2023ics0925527323001196.html
- Multishuttle en Ferdinand Gross (05-11-2009): https://www.logisticsmanager.com/12679-multishuttle-boosts-productivity-for-ferdinand-gross
- Dematic Multishuttle [extracto]: https://dematic.com/en-au/lp/multishuttle ; https://www.scdigest.com/ASSETS/DIST_NEWS/09-02-16-1.php
- Interlake Mecalux, ciclos combinados (17-05-2021): https://www.interlakemecalux.com/blog/combined-cycle
- FEM 9.860 (VDMA): https://vdmashop.de/en/material-handling/fem/377/fem-9.860guideline-cycle-time-calculation-for-automated-vehicle-storage-and-retrieval-systems-english?c=11
- Robotomated, guía AS/RS [extracto; página dada de baja]: https://robotomated.com/learn/warehouse/asrs-systems-complete-guide
- Ejercicio de AS/RS [extracto]: https://dr.ddn.upes.ac.in/bitstream/123456789/3583/60/EM8_ESE_MAY21_SOE_VIII__B.Tech%20%28ME%29_MECH4003_Theory%20Of%20Automation.pdf
- Reach trucks [extracto]: https://www.jungheinrich.co.uk/products/forklift-hire/truck/rtd/etv-214-1079352 ; https://bobcat.com/oc/en/equipment/warehouse-equipment/reach-truck-1-8-to-2-tons-7-series-plus ; https://www.directindustry.com/prod/mitsubishi-forklift-trucks/product-17797-2395223.html ; https://mhe.jjsea.com/?p=2791

**Cross-dock y patio**
- Supervalu, paletizado vs. granel (23-02-1998): https://www.supermarketnews.com/archive/palletization-cuts-product-turnaround-times-study
- Floor-loaded [extracto]: https://www.wearewarp.com/glossary/floor-loaded-freight ; https://www.boxumold.com/en/comparisons/palletization-vs-floor-loading
- Racklify, granel vs. paletizado (05-08-2026): https://racklify.com/encyclopedia/floor-loaded-versus-palletized-unloading-costs-speed-and-risk/

**Última milla**
- Merchán y otros, dataset Amazon (Transportation Science 2022): https://cdn.amazon.science/1f/02/349d1f594f8d8f97b21ebc02c7b2/2021-amazon-last-mile-routing-research-challenge-data-set.pdf ; registro y licencia: https://registry.opendata.aws/amazon-last-mile-challenges
- Urbify, Parcel Perform Alemania: https://www.urbify.com/en/blog/why-failed-deliveries-hurt-and-how-urbify-fixes-it
- Ninja Van, tesis SUTD (2016): https://repository.sutd.edu.sg/esploro/outputs/graduate/Impact-of-a-Delivery-Point-Network/9910595409846
- España/CNMC [extracto]: https://americaretail-malls.com/paises/espana/entregas-fallidas-del-ecommerce-generan-perdidas-millonarias-al-ano/
- InPost UK [extracto]: https://www.retailgazette.co.uk/?p=200282
- Smartroutes [extracto]: https://smartroutes.io/blogs/delivery-success-rates-key-stats-for-retail-and-ecommerce/
- Parcel Broker, costo de fallidas [extracto]: https://parcelbroker.co.uk/articles/the-true-cost-of-failed-delivery/
- Merca2, causas [extracto]: https://www.merca2.es/ultima-milla-reto-conquistar-comercio-online

**Personas**
- Loske y Klumpp, curvas de aprendizaje en picking (IFAC 2020): https://re.public.polimi.it/retrieve/584d3515-aaf1-4de0-8e95-e441327146e8/1-s2.0-S2405896320335205-main.pdf
- Grosse y Glock (IJPE 170, 2015): https://ideas.repec.org/a/eee/proeco/v170y2015ipcp882-890.html
- Ley de Wright: https://en.wikipedia.org/wiki/Experience_curve_effect
- Kim y Jung, pausas y fatiga (WSC 2022): https://www.informs-sim.org/wsc22papers/148.pdf
- Ranasinghe, Loske y Grosse, cámara de frío (IJPE 283, 2025): https://ideas.repec.org/a/eee/proeco/v283y2025ics0925527325000453.html
- Suplementos (apuntes de estudio del trabajo, EMU): https://staff.emu.edu.tr/orhankorhan/Documents/courses/ieng301-mane301/Lecture-Notes/spring2019-2020/CH22.pdf
- EIL, ficha metodológica de ausentismo: https://argentina.gob.ar/sites/default/files/eil_ausentismo_ficha_metodologica.pdf
- IDESA sobre ausentismo (19-02-2026): https://eleconomista.com.ar/politica/reforma-laboral-alerta-ausentismo-126-n92728
- Adecco España [extracto]: https://www.adeccogroup.com/-/media/project/adecco-group/adeccogroup/spain-content/2026-press-releases/2026-07-14-ndp-xv-informe-anual-adecco-empresa-saludable-gestion-absentismo.pdf

**Demanda y KPIs**
- SureBright, órdenes por hora en EE. UU. (06-05-2026): https://www.surebright.com/research/when-do-us-shoppers-buy-analysis-of-million-orders-reveals-how-hour-of-the-day-influences-customer-behavior
- OEE: https://en.wikipedia.org/wiki/Overall_equipment_effectiveness

**Del repositorio**
- `apps/anden/js/referencias.js` (valores argentinos con fuente, 17-10-2026)
- `conocimiento/2026-09-28-logistic-lab-ia-y-calculos.md` (1 millón de entregas por día, Infobae/Movant 27-09-2026)
- `conocimiento/anden-simulador-2026-10/frontera-ia.md` y `incumbentes.md` (frentes hermanos)
