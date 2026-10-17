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

Cada calculadora tiene: la decisión que resuelve, entradas con unidad y valor por defecto, insignia HECHO/ESTIMACIÓN con fecha en
cada valor de referencia, resultado grande, tarjetas, desglose, tabla de sensibilidad (−40% a +40% de cuatro variables, o la
comparación por divisor en la 6), ejemplo resuelto paso a paso con los números en pantalla, fuentes y fechas, pesos con USD al tipo
de cambio de referencia (editable), escenario guardado en el navegador (`localStorage`, con `try/catch`), enlace para compartir (todos
los valores en el `#` de la URL, que no viaja a ningún servidor), impresión y tema claro/oscuro/automático. Las calculadoras se
conectan: la 2, la 4 y la 5 traen el costo hora de la 3; la 1 trae el costo por paquete de la 4 y el costo del transportista de la 2.

```
apps/anden/
├── index.html, referencias.html y las 6 páginas de calculadoras (generadas por herramientas/paginas.js)
├── css/anden.css            estilos (claro, oscuro, 360 px, impresión)
├── js/referencias.js        TODOS los valores de referencia: valor, unidad, fecha, fuente, tipo, método, nota
├── js/calculos.js           fórmulas puras (sin DOM): una función por calculadora
├── js/formato.js            lectura de «1.126.149,40» y formato es-AR
├── js/calculadoras.js       definición de cada calculadora (campos, ejemplos, textos, desglose, sensibilidad, pasos)
├── js/app.js                interfaz: arma la página, guarda, comparte, tema, métricas sin cookies
├── pruebas/*.test.js        41 pruebas con node --test (ejemplos resueltos a mano + prueba de humo de la interfaz)
├── pruebas/revisar-sitio.js revisión en Chromium (Playwright): 8 páginas × 4 vistas, interacción, impresión y capturas
├── herramientas/paginas.js  regenera los HTML (encabezado, pie, textos para buscadores); opcional
└── capturas/                4 capturas: 360 px claro y oscuro, escritorio claro y oscuro
```

Resultados con los valores de referencia de octubre de 2026 (todos dependen de supuestos marcados como ESTIMACIÓN):

| Calculadora | Resultado principal |
|---|---|
| 1 | Margen de $ 69.900 por ruta y día (31,4%) con 60 paquetes, $3.900 de ingreso y $2.200 al transportista |
| 2 | Utilitario: $ 201.154 por recorrido · $ 1.676 por km · $ 3.095 por paquete |
| 3 | Conductor de 1ª (Camioneros): $ 1.980.969 por mes · $ 12.549 por hora productiva · 1,76 veces el básico |
| 4 | $ 336 por paquete clasificado · 13 operarios + 1 supervisor para 8.000 paquetes por turno |
| 5 | $ 60,1 millones por mes · $ 2.984 por pedido · $ 15.173 por posición ocupada |
| 6 | 50 cajas de 40 × 30 × 30 cm y 6 kg: 360 kg facturables (divisor 5.000); 40 cajas por pallet |

Observación que sale del cruce 1 ↔ 2 (INFERENCIA sobre supuestos): con $2.200 por paquete y 60 paquetes, el transportista cobra
$125.400 por día, pero un utilitario con chofer valuado a convenio de Camioneros (con comida) cuesta ~$201.000 por recorrido. El reparto
Flex solo cierra con choferes monotributistas, más paquetes por ruta o vehículos más baratos. Vale como primer caso de contenido.

## Cómo se corre

```bash
cd apps/anden
node --test                      # 41 pruebas (Node 18 o más nuevo). También: npm test
python3 -m http.server 8080      # o abrir index.html directo; o: npx serve .
node pruebas/revisar-sitio.js    # revisión en navegador (necesita Playwright y Chromium; no hace falta para usar el sitio)
```

Última corrida (17-10-2026): **41 de 41 pruebas pasan** y la revisión en Chromium dio «Todo bien»: 8 páginas en 360 px y 1280 px,
claro y oscuro, sin scroll horizontal, sin errores de JavaScript ni «NaN» en pantalla; edición, guardado, enlace compartido, importación
entre calculadoras, validación de números, tema e impresión a PDF (6 páginas A4).

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
| Nafta y gasoil | con cada aumento (ojo: 01-11-2026 vence el congelamiento parcial de impuestos) | precios informados por las petroleras (Res. 314/2016) |
| Dólar BNA | cuando se actualiza el sitio | bna.com.ar/Personas |
| ART suma fija | cada mes (disposición SRT) | Boletín Oficial / contadoresenred |
| Seguro de vida obligatorio | cada marzo | SSN |
| Alquiler logístico | cada trimestre | informes de Cushman & Wakefield o Colliers |

Pasos: (1) editar valores, fechas y fuentes en `js/referencias.js`; (2) cambiar `ACTUALIZADO` y `PERIODO_PESOS`; (3) `node --test`;
(4) `node herramientas/paginas.js` (actualiza la fecha del pie); (5) `node pruebas/revisar-sitio.js`; (6) publicar. Las pruebas de
fórmulas usan entradas fijas, así que actualizar referencias no las rompe.

## HECHO y ESTIMACIÓN (al 17-10-2026)

**42 hechos con fuente y fecha**, entre ellos: dólar BNA $1.535 (16-10, fuente primaria); FADEEAC septiembre +2,55% (30,3% en el año,
41% en 12 meses; PDF primario con los 11 rubros); CEDOL septiembre +2,55% / +2,22% (fuente primaria); IMC última milla +1,85%;
básicos de Camioneros de octubre (conductor de 1ª $1.126.149,40; peón $1.028.525,78), comida $16.219,85 (julio), contribución a la
obra social del sindicato $29.000; básicos de Comercio de septiembre vigentes en octubre (Maestranza A $1.183.900 + $120.000 no
remunerativos), presentismo 8,33%, antigüedad 1%; contribuciones 18% / 20,4% / 5% RIFL (Ley 27.802, RG ARCA 5907/2026: el Fondo de
Asistencia Laboral desde noviembre no cambia el total); obra social 6% (Ley 23.660, ratificado por la Ley 27.802 desde 2027);
detracción $7.003,68; ART suma fija $1.935 (Disp. SRT 9/2026); seguro de vida $424,62; vacaciones 14 días; jornada 48 h; nafta súper
YPF $2.089 y gasoil $2.195 (16-10); tarifas Flex de operadores en CABA ($3.900 y $4.200); alquiler logístico USD 7,1/m² (Cushman,
3T-2026); divisores 6.000, 3.000 y 1.000 (DHL) y 5.000 (express); medidas de pallets y contenedores.

**19 estimaciones marcadas** (cada una con su método): ART variable 5%; ausentismo 5%; tiempo no productivo 12,5%; feriados
(conteo propio: 16); pago al transportista $2.200; todo el ejemplo de tarifa (60 paquetes, 5% fallidos, 80% re-entregas, $450 de
costo propio); valores de vehículos (avisos de MercadoLibre) y todos los supuestos de los ejemplos de recorrido; productividades de
hub y depósito (picking 50 líneas por hora = ~70% del «mejor de su clase» de WERC; clasificación 200 paquetes por hora, contra 74 del
correo de EE.UU. con todas las horas); superficies, equipos, sistemas y estructura de hub y depósito; servicios del edificio
$1.500/m²; costo del capital 8% real; contribución extraordinaria a OSECAC $28.000 (vigencia sin confirmar); supuestos de pallet.

## Qué tiene que validar el fundador (lista corta)

1. **Comida de Camioneros (calc. 3):** se suma $16.219,85 por día trabajado a todo conductor de corta distancia. Pesa **18,5%** del
   costo mensual. ¿Se paga así en distribución urbana? Falta el valor de octubre (el dato es de julio).
2. **Básico de Camioneros de octubre (calc. 3):** El Cronista da $1.126.149,40 (incluye $12.252,86 incorporados al básico) y El
   Economista $1.113.896,53. Se usó el primero. Confirmar con la planilla del sindicato.
3. **Supuestos del costo laboral (calc. 3):** presentismo sobre básico + antigüedad; aguinaldo como 1/12; día de vacaciones a sueldo ÷ 25;
   detracción solo sobre el mensual; la suma no remunerativa de Comercio cuenta para adicionales, aguinaldo y vacaciones y paga 6% de
   obra social; jornada de 48 h en 6 días; ART 5%; ausentismo 5%; 1 hora no productiva de cada 8.
4. **Modelo de fallidos (calc. 1):** el fallido no se cobra; el 80% vuelve a salir otro día (ocupa lugar en otra ruta y se cobra una
   vez al entregarse); el resto se devuelve sin cobro. El costo propio es por paquete cargado y el pago al transportista, por entregado.
   El margen objetivo se mide sobre el ingreso. ¿Así se piensa en la práctica?
5. **Productividades (calc. 4 y 5):** descarga e inducción 500, clasificación 200 y carga 300 paquetes por hora-persona; 7 horas
   productivas de 8; 1 supervisor cada 15 a 1,4 veces el costo; recepción 10 pallets/h, picking 50 líneas/h, packing 30 pedidos/h,
   despacho 120 pedidos/h. Con 2.500 m² y un turno, **el espacio es 44% del costo del hub** (mano de obra 35%, insumos 18%):
   ¿realista?
6. **Reparto de costos en el depósito (calc. 5):** espacio operativo y estructura repartidos por horas-hombre; espacio de
   almacenamiento y racks solo a almacenamiento; costo por posición sobre las posiciones ocupadas. ¿O preferís otro inductor (m² por
   actividad, pedidos)?
7. **Costo por recorrido (calc. 2):** amortización lineal sobre valor de reposición con valor de reventa, más 8% real sobre el capital
   promedio, más 8% de gastos generales. Los valores de los tres ejemplos (consumos, mantenimiento, seguros, peajes) son supuestos.
8. **Aforo terrestre (calc. 6):** se ofrece 3.000 (1:3, 333 kg/m³, el ejemplo de tren de DHL) como «aforo terrestre habitual». En
   Argentina cada transportista fija el suyo: ¿qué valor usa el mercado (300 kg/m³, 250 kg/m³)? Altura de pallet 160 cm y 1.000 kg.

## Qué queda para la v1

- Validación del fundador y ajuste de fórmulas; segundo ejemplo resuelto «real» (anónimo) por calculadora.
- Repositorio propio, dominio y publicación (con su OK); contador sin cookies activado.
- Actualización mensual semiautomática de índices (script que lea el PDF de FADEEAC y la nota de CEDOL y proponga el cambio).
- Botón «actualizar mis costos con el índice del mes» en la calculadora 2 (los rubros ya siguen la estructura de FADEEAC).
- Textos para buscadores pre-renderizados (hoy el ejemplo paso a paso lo arma el JavaScript), datos estructurados y una página por
  pregunta frecuente («cuánto cobrar por paquete en CABA», «costo por km de un camión»).
- Más categorías de convenio (escala completa de Comercio y Camioneros, autoelevadoristas, mensajería en moto CCT 722/15), larga
  distancia (km y pernoctada) y horas extra.
- Calculadora de Full vs. Flex vs. despacho propio, ruteo y dotación por curva de volumen (Hot Sale, CyberMonday).
- Exportar el escenario a planilla y versión para cátedras con consignas.
- Inglés y portugués.

## Seguridad, datos y propiedad intelectual

- Sin cookies, sin cuentas, sin servidor, sin claves ni credenciales. El escenario vive en `localStorage` del usuario; el enlace
  compartido lleva los valores en el `#`, que el navegador no envía a ningún servidor.
- Ningún dato personal (Ley 25.326). Nada identifica al fundador ni a su empleador: todos los valores son públicos y genéricos, y
  ningún modelo sale del simulador de su empresa (Ley 11.723 art. 4 inc. d; LCT arts. 82, 85 y 88).
- No usa la API de Claude: costo de IA por usuario = 0. El simulador conversacional de la v1 sí la va a usar (estimar entonces).
