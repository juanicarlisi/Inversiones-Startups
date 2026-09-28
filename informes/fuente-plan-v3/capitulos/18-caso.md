# Cuánta plata, proyecto por proyecto, hasta 2031

Estas tablas responden lo que pediste: cuánto dejaría cada proyecto por mes, año por año, y cuánto suma el holding con los proyectos
principales y con los secundarios. Cada número sale del caso de negocio de su ficha (usuarios, conversión, precio, costos) y de una
simulación de 4.000 futuros posibles. **Son estimaciones, no promesas.**

## Lo esperado, con las chances de cada proyecto

Ingreso neto promedio por mes en cada año (USD). Suma lo que pasa si funciona y si no, según las chances; por eso es la mejor
guía para decidir, aunque ningún año real se va a parecer exactamente a este promedio.

{{TABLA_ESPERADO}}

![Ingreso esperado por proyecto](graficos/apilado.svg)

## Si cada proyecto funciona (escenario normal)

Lo que dejaría cada proyecto **si funciona**, en su escenario normal. No se pueden sumar como si todos fueran a funcionar: lo más
probable es que funcionen algunos (por eso existe la tabla de arriba).

{{TABLA_NORMAL}}

## El rango: del peor caso razonable al muy bueno

![Rango del ingreso del holding](graficos/abanico.svg)

{{TABLA_RANGO}}

<div class="duo">
<div class="caja"><h4>📖 Cómo leerlo</h4>
<ul>
<li><b>2026–2027 es inversión:</b> entra poco y el holding paga sus herramientas con tu aporte.</li>
<li><b>2028 es el año bisagra:</b> {{v:p1000_28}} de chances de superar USD 1.000 por mes a fin de año.</li>
<li><b>2030:</b> la mitad de los futuros simulados quedan por encima de {{v:p50_dic30}} por mes; uno de cada diez, por debajo de {{v:p10_dic30}}.</li>
<li><b>La renta</b> junta tu aporte y la mitad de las ganancias: su capital llega a {{v:capital_dic30_p50}} a fin de 2030 (mediana).</li>
</ul></div>
<div class="caja no"><h4>⚠️ Cuidado con los números</h4>
<ul>
<li>Las chances y los usuarios son estimaciones propias con datos de 2026.</li>
<li>El modelo ya supone que a veces todo falla junto (falta de tiempo, cambio de trabajo) y que la difusión puede salir mejor o peor para todos a la vez.</li>
<li>No incluye los canales extra (ChatGPT, plantillas, insertables), pilotos municipales ni la venta de un activo: si salen, es plata de más.</li>
<li>El peor caso razonable a 3 años es poner {{v:acum36_p10}} de más (herramientas, empresa, marcas y la app comprada, sin contar lo que valdría revenderla).</li>
</ul></div>
</div>

## Principales y secundarios

Los secundarios son las 7 ideas del backlog que mejor encajan, activadas de a una desde fines de 2028 cuando se liberan horas
(lo más probable es que alguno de los principales se corte y deje su lugar). En promedio suman poco, pero cada uno es un boleto más.
Cada uno pide 3–5 horas por semana los primeros tres meses y 1–3 después; como la mayoría se corta a los 3–6 meses, en promedio
ocupan {{v:horas_sec_2030}} horas por semana en 2030, sobre un plan base de {{v:horas_base_2030}}. Si todos los principales siguen
vivos, los secundarios se posponen o se hacen con horas extra que decidas vos.

{{TABLA_SECUNDARIOS}}
