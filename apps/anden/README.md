# Andén v0 — calculadoras logísticas con costos argentinos

> Proyecto P2 (`oportunidades/proyectos/P2-anden.yaml`), experimento EXP-10 (`cartera/experimentos/EXP-10-logistic-lab-calculadoras.md`).
> Carpeta **temporal** dentro del repositorio del holding hasta que Andén tenga su repositorio propio (igual que Senda en el sprint 0).
> Construida el 17-10-2026. Marca «Andén» provisoria.

## Qué hipótesis prueba

La de EXP-10: **profesionales y estudiantes de logística usan, y vuelven a usar, calculadoras en español hechas con criterio
profesional y con costos argentinos fechados**, y una cátedra la adopta. Métrica norte del proyecto: **cálculos por semana**
(ya instrumentada, ver «Métricas»). Esta v0 deja todo listo para que en diciembre el fundador solo valide fórmulas y casos.

## Qué hay

Sitio **estático** (HTML + CSS + JavaScript sin framework, sin build, sin dependencias): costo de servidor cero, sin cookies,
sin backend, sin claves. Funciona abriendo `index.html` directo desde el disco o publicado en GitHub Pages o Cloudflare Pages.

| Página | Calculadora | Qué decide |
|---|---|---|
| `tarifa-transportista.html` | 1. Tarifa al transportista vs. ingreso y volumen | Cuánto pagarle al transportista (por paquete, jornada, km u hora) y con cuántos paquetes por ruta cierra |
| `costo-por-recorrido.html` | 2. Costo por recorrido (troncal y última milla) | Costo real por km, hora, parada y paquete; ejemplos de utilitario, moto y camión troncal |
| `costo-laboral.html` | 3. Costo laboral por operario | Costo mensual y por hora productiva (Camioneros 40/89 y Comercio 130/75) |
| `costo-clasificacion.html` | 4. Costo por paquete clasificado (hub) | Personas por turno y costo por paquete, con desglose por proceso |
| `costo-almacenamiento.html` | 5. Costo por proceso de almacenamiento (ABC) | Costo por pallet recibido, posición-mes, línea, pedido y total |
| `peso-volumetrico.html` | 6. Peso volumétrico y cubicaje (puerta de entrada) | Kilos facturables, bultos por pallet y pallets por contenedor |
| `referencias.html` | Todos los valores de referencia | Fuente, fecha y tipo (HECHO o ESTIMACIÓN) de cada número |

Cada calculadora tiene: la decisión que resuelve, entradas con unidad y valor por defecto, insignia que sigue al valor (HECHO o
ESTIMACIÓN con su fecha mientras el número es el de referencia; «TU DATO» con botón para volver cuando lo cambiás; «CALCULADO» cuando
sale de otra calculadora; ámbar si el dato está atrasado) con un globo que muestra fuente, fecha y método sin saltar de lugar,
resultado grande, tarjetas, desglose, tabla de sensibilidad (−40% a +40% de cuatro variables, o la comparación por divisor en la 6),
ejemplo resuelto paso a paso con los números en pantalla, fuentes y fechas, pesos con USD al tipo de cambio de referencia (editable),
escenario guardado en el navegador (`localStorage`, con `try/catch`), enlace para compartir (todos los valores en el `#` de la URL, que
no viaja a ningún servidor; abrir un enlace ajeno no pisa el escenario propio: «Guardarlo como mío» o «Volver al mío»), «Volver a
los valores de referencia» con deshacer, impresión y tema claro/oscuro/automático. En el celular, los datos aparecen primero y la
barra fija de abajo se despliega con las cuatro tarjetas clave. Las calculadoras se conectan: la 2, la 4 y la 5 traen el costo hora
de la 3; la 1 trae el costo por paquete de la 4 y el costo del transportista de la 2.

Además: la 1 compara las cuatro formas de pagarle al transportista con los mismos números y muestra, del lado del transportista, lo
que le queda por día, por mes y por hora, desde cuántos paquetes cubre sus gastos y su tarifa mínima; la 2 y la 5 pasan del costo al
**precio mínimo** (margen e impuestos sobre lo facturado; en la 5 cada actividad se cobra una vez); la 4 calcula la dotación con
personal fijo por proceso o que rota, y con la ventana horaria de cada proceso; la 6 acepta el aforo del transportista en kg por m³
y dibuja cómo armar cada capa del pallet y los pallets en el piso del contenedor (armado por cortes de guillotina).

```
apps/anden/
├── index.html, referencias.html y las 6 páginas de calculadoras (generadas por herramientas/paginas.js)
├── css/anden.css            estilos (claro, oscuro, 360 px, impresión)
├── js/referencias.js        TODOS los valores de referencia: valor, unidad, fecha, fuente, tipo, método, nota
├── js/calculos.js           fórmulas puras (sin DOM): una función por calculadora
├── js/formato.js            lectura de «1.126.149,40» y formato es-AR
├── js/calculadoras.js       definición de cada calculadora (campos, ejemplos, textos, desglose, sensibilidad, pasos)
├── js/app.js                interfaz: arma la página, guarda, comparte, tema, métricas sin cookies
├── pruebas/*.test.js        59 pruebas con node --test (ejemplos resueltos a mano, casos borde, insignias y humo de la interfaz)
├── pruebas/revisar-sitio.js revisión en Chromium (Playwright): 8 páginas × 4 vistas, tablas, celular 360 × 740, interacción, impresión
├── herramientas/paginas.js  regenera los HTML (encabezado, pie, textos para buscadores); opcional
└── capturas/                4 capturas: 360 px claro y oscuro, escritorio claro y oscuro
```

Resultados con los valores de referencia de octubre de 2026 (todos dependen de supuestos marcados como ESTIMACIÓN):

| Calculadora | Resultado principal |
|---|---|
| 1 | Margen de $ 69.900 por ruta y día (31,4%) con 60 paquetes, $3.900 de ingreso y $2.200 al transportista. Con los mismos números: por jornada $ 65.300 (equilibrio en 40 paquetes), por km $ 77.600 (20), por hora $ 59.300 (18) |
| 2 | Utilitario con chofer a convenio: $ 214.762 por recorrido · $ 1.790 por km · $ 3.304 por paquete (el personal es 58%). Repartidor Flex con su utilitario y monotributo, sin chofer: $ 86.439 por día. Precio mínimo con 15% de margen: $ 252.661 por viaje |
| 3 | Conductor de 1ª (Camioneros, con comida y viático especial): $ 2.198.790 por mes · $ 13.929 por hora productiva · 1,95 veces el básico |
| 4 | $ 336 por paquete clasificado · 13 operarios + 1 supervisor para 8.000 paquetes por turno (12 si el personal rota entre procesos) |
| 5 | $ 60,1 millones por mes · $ 2.882 por pedido · $ 15.173 por posición ocupada · $ 4.547 por pallet recibido · $ 336 por línea. Precio mínimo con 15%: $ 5.349 por pallet, $ 17.851 por posición, $ 395 por línea, $ 2.204 por pedido sin picking |
| 6 | 50 cajas de 40 × 30 × 30 cm y 6 kg: 360 kg facturables (divisor 5.000; 375 kg si el transportista redondea bulto por bulto); 40 cajas por pallet (capas de 10: 6 a lo largo y 4 giradas); 9 pallets en un contenedor de 20 pies |

**IVA.** Los precios de mercado de referencia (combustible, cubiertas, vehículos) son al público, con IVA: es la base de un
monotributista. Un responsable inscripto tiene que cargar ingresos y costos sin IVA: el utilitario baja de $ 214.762 a ~$ 204.846 por
recorrido sacándole el IVA a combustible, cubiertas y vehículo. Los $3.900 de Flex no aclaran IVA: si lo incluyen, son $3.223 netos y
el margen de la calculadora 1 cae de $ 69.900 (31,4%) a $ 31.319 (17,0%).

Observación que sale del cruce 1 ↔ 2 (INFERENCIA sobre supuestos): con $2.200 por paquete y 60 paquetes, el transportista cobra
$125.400 por día, pero un utilitario con chofer valuado a convenio de Camioneros (con comida y viático especial) cuesta ~$214.800 por
recorrido: le faltan $89.400 por día. Un repartidor Flex con su propio utilitario y monotributo (categoría F) gasta ~$86.400 por día y
le quedan $39.000 por día ($936.000 por mes, ~$4.333 por hora en 9 horas), antes de su propio sueldo: cubre gastos desde 42 paquetes
cargados y su tarifa mínima es $1.516 por paquete entregado. El reparto Flex cierra con monotributistas con vehículo propio, no con
choferes de convenio. Vale como primer caso de contenido.

## Cómo se corre

```bash
cd apps/anden
node --test                      # 59 pruebas (Node 18 o más nuevo). También: npm test
python3 -m http.server 8080      # o abrir index.html directo; o: npx serve .
node pruebas/revisar-sitio.js    # revisión en navegador (necesita Playwright y Chromium; no hace falta para usar el sitio)
```

Última corrida (17-10-2026, después de la revisión): **59 de 59 pruebas pasan** y la revisión en Chromium dio «Todo bien»: 8 páginas
en 360 px y 1280 px, claro y oscuro, sin scroll horizontal, sin errores de JavaScript ni «NaN» en pantalla, las dos primeras columnas
de cada tabla a la vista; en 360 × 740 el primer dato se ve sin desplazar y la barra se despliega; edición, guardado, enlace ajeno que
no pisa el escenario propio, deshacer, insignias, importación entre calculadoras, validación de números, aforo en kg/m³, tema e
impresión a PDF. Con un divisor obligatorio en 0 (años de uso, recorridos, horas por turno, vida de racks o equipos, días por semana)
el resultado muestra «—» en lugar de un costo más bajo que parece válido.

## Cómo se publica y cómo se apaga

- **Publicar (costo cero; requiere el OK del fundador, porque es publicar con la marca):** repositorio propio de Andén con estos
  archivos en la raíz → GitHub Pages (rama `main`, carpeta `/`) o Cloudflare Pages (sin comando de build, carpeta de salida `/`).
  Dominio propio opcional (verificar antes la marca en el INPI, clases 9, 42 y 41).
- **Apagar:** despublicar Pages (o borrar el proyecto de Cloudflare Pages). No hay servidores, bases de datos ni datos de usuarios:
  lo que cada persona cargó queda solo en su navegador.

## Métricas (desde el día 1, sin cookies)

`app.js` registra eventos **solo si** la página se publicó con un contador sin cookies (GoatCounter: no usa cookies ni guarda IP;
compatible con la Ley 25.326 porque no hay datos personales). Sin contador, no se carga ningún script de terceros.

```bash
ANDEN_GOATCOUNTER=https://<cuenta>.goatcounter.com/count node herramientas/paginas.js   # el fundador crea la cuenta
```

Eventos: visitas por página (usuarios por mes), `calculo:<id>` (primera edición de la sesión: **cálculos por semana**, la métrica norte),
`compartir:<id>`, `imprimir:<id>`, `importar:<id>`, `ejemplo:<id>`. Nunca se manda un número cargado. Alternativa sin código: Web
Analytics de Cloudflare (se activa en el panel, también sin cookies). Umbrales de EXP-10: 500 usuarios por mes o una cátedra en
septiembre de 2027.

## Cómo se actualizan las referencias (una vez por mes, ~30 minutos)

Todo vive en `js/referencias.js`. Cada valor: `valor`, `unidad`, `fecha`, `fuente` (URL), `tipo` (`HECHO` o `ESTIMACIÓN`), `metodo`
(obligatorio en las estimaciones) y `nota`. Las pruebas fallan si un HECHO no tiene fuente o una ESTIMACIÓN no tiene método.

| Qué | Cuándo sale | Dónde |
|---|---|---|
| Índice FADEEAC (11 rubros) | días 2 a 5 | PDF mensual en fadeeac.org.ar (Estudios Económicos y Costos) |
| CEDOL/UTN con y sin transporte, distribución urbana | días 3 a 6 | cedol.org.ar/logistica |
| IMC de última milla (AECA-UM / UTN) | días 3 a 6 | Infobae Movant (el sitio de AECAUM no se pudo abrir) |
| Escalas CCT 40/89 y 130/75 | con cada paritaria | sindicato, cámaras, iProfesional, El Cronista |
| Nafta y gasoil | con cada aumento (a verificar: un diferimiento parcial de impuestos que vencería el 31-10-2026; no se encontró la norma) | precios informados por las petroleras (Res. 314/2016) |
| Contribución extraordinaria de Camioneros a las obras sociales ($29.000) | vence en febrero de 2027: revisar en marzo | Bloomberg Línea, El Economista |
| Monotributo | con cada tabla nueva de ARCA | afip.gob.ar/monotributo/categorias.asp |
| Dólar BNA | cuando se actualiza el sitio | bna.com.ar/Personas |
| ART suma fija | cada mes (disposición SRT) | Boletín Oficial / contadoresenred |
| Seguro de vida obligatorio | cada marzo | SSN |
| Alquiler logístico | cada trimestre | informes de Cushman & Wakefield o Colliers |

Pasos: (1) editar valores, fechas y fuentes en `js/referencias.js`; (2) cambiar `ACTUALIZADO` y `PERIODO_PESOS`; (3) `node --test`;
(4) `node herramientas/paginas.js` (actualiza la fecha del pie); (5) `node pruebas/revisar-sitio.js`; (6) publicar. Las pruebas de
fórmulas usan entradas fijas, así que actualizar referencias no las rompe.

## HECHO y ESTIMACIÓN (al 17-10-2026)

**45 hechos con fuente y fecha**, entre ellos: dólar BNA $1.535 (16-10, fuente primaria); FADEEAC septiembre +2,55% (30,3% en el año,
41% en 12 meses; PDF primario con los 11 rubros); CEDOL septiembre +2,55% / +2,22% (fuente primaria); IMC última milla +1,85%;
Camioneros de octubre según la Planilla N° 247 y Bloomberg Línea (conductor de 1ª $1.126.149,40; peón $1.028.525,78; comida
$17.231,89 y viático especial $8.646,93 por día trabajado; contribución extraordinaria a las obras sociales $29.000 hasta febrero de
2027); básicos de Comercio de septiembre vigentes en octubre (Maestranza A $1.183.900 + $120.000 no remunerativos), presentismo 8,33%,
antigüedad 1%; contribuciones 18% / 20,4% / 5% RIFL y 7,5% RIFL + FAL de pyme desde noviembre (Ley 27.802 arts. 60 y 76, leídos en el
Boletín Oficial; RG ARCA 5907/2026); obra social 6% (Ley 23.660; la Ley 27.802 art. 165 lo ratifica desde 2027, verificado en el
Boletín Oficial); detracción $7.003,68; ART suma fija $1.935 (Disp. SRT 9/2026); seguro de vida $424,62; vacaciones 14 días; tope de 48
horas; monotributo categoría F $150.784,21 (ARCA, desde el 01-08-2026); nafta súper YPF $2.089 y gasoil $2.195 (16-10, con IVA);
tarifas Flex de operadores en CABA ($3.900 y $4.200, sin aclarar IVA); alquiler logístico USD 7,1/m² (Cushman, 3T-2026); divisores
6.000, 3.000 y 1.000 (DHL) y 5.000 (express); medidas de pallets y contenedores.

**20 estimaciones marcadas** (cada una con su método): ART variable 5%; ausentismo 5%; tiempo no productivo 12,5%; feriados
(conteo propio: 16); jornada del ejemplo 48 h en 6 días; pago al transportista $2.200; todo el ejemplo de tarifa (60 paquetes, 5%
fallidos, 80% re-entregas, $450 de costo propio); valores de vehículos (avisos de MercadoLibre, con IVA) y todos los supuestos de los
ejemplos de recorrido; productividades de hub y depósito (por hora productiva; picking 50 líneas por hora = ~70% del «mejor de su
clase» de WERC; clasificación 200 paquetes por hora, contra 74 del correo de EE.UU. con todas las horas); superficies, equipos,
sistemas y estructura de hub y depósito; servicios del edificio $1.500/m²; costo del capital 8% real; contribución extraordinaria a
OSECAC $28.000 (vigencia sin confirmar); supuestos de pallet.

## Qué validar: lo que respondió la revisión y lo que queda para el fundador

La revisión del 17-10-2026 (ingeniería, laboral, fuentes y producto) contestó con fuente buena parte de las 8 dudas. Lo que queda
abierto es criterio del fundador o necesita hablar con terceros (eso requiere su aprobación).

**Respondido con fuente (ya aplicado):**

1. **Comida de Camioneros.** Vale $17.231,89 por día trabajado en octubre (Planilla N° 247, calcularsueldo 15-10-2026; Bloomberg Línea
   07-10-2026). El ítem 4.1.12 del CCT 40/89 la paga a todo el personal salvo larga distancia, por día efectivamente trabajado, y el
   4.1.13 suma un **viático especial** de $8.646,93 con la misma regla; ninguno paga cargas (ítem 4.2.11, art. 106 LCT; transcripción del
   fallo CNAT Sala VIII «J., A. R. y otros c/ Covelia S.A.»). Ahora el conductor lleva los dos: comida 17,7% y viático 8,9% del costo.
2. **Básico de octubre.** $1.126.149,40 es el de la Planilla N° 247 y de Bloomberg Línea: 1,7% sobre $1.095.276,83 más $12.252,86
   incorporados desde la suma de $18.000. El Economista e iProfesional ($1.113.896,53) aplican solo el 1,7%. Resuelto.
3. **Supuestos laborales.** SAC como 1/12 y día de vacaciones ÷ 25 (LCT art. 155) son la práctica normal; presentismo sobre básico +
   antigüedad y la suma no remunerativa de Comercio (cuenta para adicionales, SAC y vacaciones; paga OSECAC) coinciden con el acuerdo.
   Cambios: las 48 horas pasan a ESTIMACIÓN editable (es un tope, no la jornada de todos); la calculadora avisa si las vacaciones no
   coinciden con la antigüedad (LCT art. 150: 14, 21, 28 o 35 días); nueva opción RIFL + FAL (7,5%).
4. **Fallidos.** El modelo cierra en régimen estable (paquetes nuevos = entregados + devueltos; equilibrio y tarifa máxima bien en las
   cuatro modalidades). Se agregó la comparación de las cuatro formas de pagar.
5. **Espacio 44% del hub.** La cuenta está bien (un turno sobre 2.500 m²); con dos turnos (52 por mes) baja a 29% y el paquete a $257.
   Se agregó la estructura del hub (en 0 por defecto) y la dotación con ventanas y personal que rota.
6. **Reparto del depósito.** El picking ya no carga espacio operativo (muelles, playa, packing): se hace en los pasillos de los racks,
   que paga almacenamiento. La línea pasa de $489 a $336, el pallet de $3.693 a $4.547 y el pedido de $2.984 a $2.882; el total no cambia.
7. **Costo por recorrido.** Amortización sobre reposición con reventa, 8% real sobre el capital promedio y 8% de gastos generales son
   coherentes con precios de hoy y con los rubros de FADEEAC.
8. **Aforo terrestre.** No hay un aforo único en Argentina: lo fija cada transportista (DHL: «varían según la ubicación y el
   transportista»). Se sacó «aforo terrestre habitual» del 3.000 (queda como el ejemplo de tren de DHL) y se agregó «Aforo de tu
   transportista (kg por m³)», que se convierte en divisor (1.000.000 ÷ aforo: 300 → 3.333; 250 → 4.000).

**Queda para el fundador:**

1. **¿Se paga comida y viático especial en el reparto urbano de última milla?** La norma dice que sí para todo el personal salvo larga
   distancia; Bloomberg los menciona entre los ítems del chofer de larga distancia. Valen 26,6% del costo del conductor.
2. **¿El peón del hub o del depósito cobra comida y viático?** (CCT 40/89, mismos ítems.) Hoy va sin ninguno. Con los dos, el peón
   pasa de $1.477.783 a $2.061.381 por mes y de $9.361 a $13.058 por hora productiva; el hub, de $336 a $383 por paquete; el depósito,
   de $60,1 a $64,6 millones por mes (pedido de $2.882 a $3.258). Si el personal del hub está en otro convenio, se deja en 0.
3. **IVA.** ¿Los $3.900–$4.200 de Flex incluyen IVA? Preguntarles a los operadores (es contactar terceros: requiere tu OK). Si los
   incluyen, el margen del ejemplo cae a $31.319. También: si el aviso del camión incluye IVA y a qué alícuota, y si el alquiler de
   Cushman es con o sin IVA. Mejora posible: un selector «responsable inscripto / monotributo» que netee el IVA de los insumos.
4. **Costo del chofer por recorrido.** Hoy son horas × costo por hora productiva, sin jornada ni horas extra: si las 9 horas son de
   presencia, el personal queda ~12% alto (con la hora presente, el utilitario baja de $214.762 a $198.119). Decidir si se pide
   «horas de presencia» y se agregan jornadas y horas extra (LCT art. 201), y si el camión troncal suma pernoctada ($20.070,36 en
   octubre) y viático por km de larga distancia.
5. **Inductor del depósito.** ¿Espacio por m² de cada actividad (campos de m² de muelles, packing y despacho) en lugar de horas?
   ¿Partir la estructura en edificio (por m² o posiciones) y gestión (por horas o transacciones)?
6. **Productividades, superficie y ventanas del hub.** ¿Son realistas 2.500 m² y un turno para 8.000 paquetes, y las productividades
   del ejemplo? ¿Qué ventanas horarias tienen la inducción, la clasificación y la carga? (Con tu experiencia general, sin datos de tu
   empresa.)
7. **Aforo de mercado.** Referencias publicadas: 333 kg/m³ (carretera europea, cbm3.net y Transportes Callizo), 300 kg/m³ (NTC&Logística
   para Brasil, SETCESP 24-10-2016), 250 kg/m³ (cbm3.net). ¿Los ofrecemos como opciones (ESTIMACIÓN) o esperamos 2 o 3 tarifarios de
   expresos argentinos? Pedirlos es contactar terceros.
8. **Costo laboral, pendientes con dato pero sin confirmar:** adicional de vacaciones de Camioneros ($26.305,99 por día gozado, Planilla
   247; ¿remunerativo?); en Comercio, seguro de retiro La Estrella (1,6% a cargo del empleador desde 07-2025) y aporte a INACAP (0,5% del
   salario de Maestranza A), con base a confirmar; si el Decreto 612/2026 excluye el 6% de OSECAC sobre la suma no remunerativa; la
   detracción adicional de $10.000 para empleadores de hasta 25 trabajadores (Ley 27.541 art. 23: confirmar si es por empleador); la
   alícuota de ART por actividad (Res. SRT 23/2026); y si el bono de Camioneros de $1.200.000 (cuatro cuotas desde enero de 2027) se
   prorratea en el costo mensual.
9. **Productividades por hora trabajada o productiva.** Ahora se piden por hora productiva (sin pausas) y la ayuda dice cómo convertir
   un dato por hora trabajada (× 1,14). ¿Agregamos un selector?

## Qué queda para la v1

- Validación del fundador y ajuste de fórmulas; segundo ejemplo resuelto «real» (anónimo) por calculadora.
- Repositorio propio, dominio y publicación (con su OK); contador sin cookies activado.
- Actualización mensual semiautomática de índices (script que lea el PDF de FADEEAC y la nota de CEDOL y proponga el cambio).
- Botón «actualizar mis costos con el índice del mes» en la calculadora 2 (los rubros ya siguen la estructura de FADEEAC).
- Textos para buscadores pre-renderizados (hoy el ejemplo paso a paso lo arma el JavaScript), datos estructurados y una página por
  pregunta frecuente («cuánto cobrar por paquete en CABA», «costo por km de un camión»).
- Más categorías de convenio (escala completa de Comercio y Camioneros: recibidor/clasificador de guías, embalador, autoelevadorista,
  distribuidor domiciliario de correo privado; mensajería en moto CCT 722/15), larga distancia (km y pernoctada) y horas extra.
- Comparar dos escenarios completos (A y B) y descargar el desglose en CSV con fuente y fecha por fila.
- Títulos y portada con la pregunta que la gente busca («¿Cuánto pagarle al repartidor por paquete?») y entradas por perfil.
- Contenedor o camión con carga útil y alto de puerta; varias medidas de caja en un mismo envío.
- Calculadora de Full vs. Flex vs. despacho propio, ruteo y dotación por curva de volumen (Hot Sale, CyberMonday).
- Exportar el escenario a planilla y versión para cátedras con consignas.
- Inglés y portugués.

## Seguridad, datos y propiedad intelectual

- Sin cookies, sin cuentas, sin servidor, sin claves ni credenciales. El escenario vive en `localStorage` del usuario; el enlace
  compartido lleva los valores en el `#`, que el navegador no envía a ningún servidor.
- Ningún dato personal (Ley 25.326). Nada identifica al fundador ni a su empleador: todos los valores son públicos y genéricos, y
  ningún modelo sale del simulador de su empresa (Ley 11.723 art. 4 inc. d; LCT arts. 82, 85 y 88).
- No usa la API de Claude: costo de IA por usuario = 0. El simulador conversacional de la v1 sí la va a usar (estimar entonces).
