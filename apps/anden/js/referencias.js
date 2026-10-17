/*
 * Andén — valores de referencia (un solo archivo, se actualiza cada mes).
 *
 * Cada valor lleva:
 *   valor   número que usan las calculadoras
 *   unidad  en qué se mide
 *   fecha   a qué fecha corresponde el dato (AAAA-MM-DD o AAAA-MM)
 *   fuente  URL donde se consultó (null si es un supuesto sin fuente)
 *   tipo    'HECHO' (dato publicado, con fuente) o 'ESTIMACIÓN' (supuesto de trabajo, con método)
 *   metodo  cómo se obtuvo (obligatorio en las estimaciones)
 *   nota    aclaraciones y alertas
 *
 * Regla: nunca un número sin fuente o sin método. Lo que no se pudo confirmar va como ESTIMACIÓN.
 * Consultado el 17-10-2026. Para actualizar: ver README.md, sección «Cómo se actualizan las referencias».
 */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { raiz.AndenReferencias = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ACTUALIZADO = '2026-10-17';
  var PERIODO_PESOS = 'octubre de 2026';

  var R = {
    /* ───────────── Tipo de cambio ───────────── */
    tc_usd: {
      nombre: 'Dólar oficial Banco Nación (billete, venta)',
      valor: 1535, unidad: '$ por USD', fecha: '2026-10-16',
      fuente: 'https://www.bna.com.ar/Personas', tipo: 'HECHO',
      nota: 'Compra $1.485. Divisa: $1.509 / $1.518.'
    },

    /* ───────────── Índices de costos ───────────── */
    ict_fadeeac: {
      nombre: 'Índice de Costos del Transporte (FADEEAC), variación de septiembre de 2026',
      valor: 2.55, unidad: '% mensual', fecha: '2026-09',
      fuente: 'https://www.fadeeac.org.ar/wp-content/uploads/2026/10/Septiembre-2026.pdf', tipo: 'HECHO',
      nota: 'Acumulado enero–septiembre 2026: 30,3%. Últimos 12 meses: 41% (Agrofy, 06-10-2026). Mide 11 rubros; auditado por la FCE-UBA. El PDF tiene fecha 30-09-2026 y se subió en octubre.',
      detalle: [
        { rubro: 'Combustible', mensual: 2.87, acumulado2026: 38.38 },
        { rubro: 'Lubricantes', mensual: 0.00, acumulado2026: 30.79 },
        { rubro: 'Neumáticos', mensual: 3.08, acumulado2026: 17.10 },
        { rubro: 'Reparaciones', mensual: 0.76, acumulado2026: 15.33 },
        { rubro: 'Material rodante', mensual: 0.22, acumulado2026: 4.88 },
        { rubro: 'Personal', mensual: 2.49, acumulado2026: 30.90 },
        { rubro: 'Seguros', mensual: 0.42, acumulado2026: 4.33 },
        { rubro: 'Patentes y tasas', mensual: 0.00, acumulado2026: 28.59 },
        { rubro: 'Costo financiero', mensual: 2.59, acumulado2026: 17.32 },
        { rubro: 'Gastos generales', mensual: 5.05, acumulado2026: 47.80 },
        { rubro: 'Peaje', mensual: 5.00, acumulado2026: 59.93 }
      ]
    },
    ict_fadeeac_12m: {
      nombre: 'Índice FADEEAC, variación de los últimos 12 meses',
      valor: 41, unidad: '% interanual', fecha: '2026-09',
      fuente: 'https://news.agrofy.com.ar/noticia/216735/costo-transporte-cargas-acumulo-suba-303-nueve-meses-impacto-gasoil', tipo: 'HECHO',
      nota: 'Dato informado por FADEEAC en su comunicado de septiembre de 2026.'
    },
    cedol_con_transporte: {
      nombre: 'Índice de Costos Logísticos CEDOL/UTN, con transporte',
      valor: 2.55, unidad: '% mensual', fecha: '2026-09',
      fuente: 'https://www.cedol.org.ar/logistica/los-costos-logisticos-aumentaron-255-en-septiembre-2/', tipo: 'HECHO',
      nota: 'Acumulado 2026: 30,26%. Elaborado por el C3T de la UTN. Publicado el 03-10-2026.'
    },
    cedol_sin_transporte: {
      nombre: 'Índice de Costos Logísticos CEDOL/UTN, sin transporte',
      valor: 2.22, unidad: '% mensual', fecha: '2026-09',
      fuente: 'https://www.cedol.org.ar/logistica/los-costos-logisticos-aumentaron-255-en-septiembre-2/', tipo: 'HECHO',
      nota: 'Acumulado 2026: 28,17%. En septiembre: film stretch +8,59%, energía +2,67%, seguridad +2,68%; pallets y alquileres sin cambios.'
    },
    cedol_distribucion_urbana: {
      nombre: 'CEDOL/UTN, distribución urbana con acompañante',
      valor: 2.52, unidad: '% mensual', fecha: '2026-09',
      fuente: 'https://www.cedol.org.ar/logistica/los-costos-logisticos-aumentaron-255-en-septiembre-2/', tipo: 'HECHO',
      nota: 'Acumulado 2026: 32,47%. Sin acompañante: 2,55% mensual y 31,21% acumulado.'
    },
    imc_ultima_milla: {
      nombre: 'Índice de Mayores Costos de Última Milla (AECA-Última Milla / C3T-UTN)',
      valor: 1.85, unidad: '% mensual', fecha: '2026-09',
      fuente: 'https://www.infobae.com/movant/2026/10/06/los-costos-logisticos-volvieron-a-subir-en-septiembre-impulsados-por-salarios-y-combustibles/', tipo: 'HECHO',
      nota: 'Acumulado 2026: 30,95%. Postal: 2,10% mensual y 31,09% acumulado. Promedio de los últimos 12 meses: 2,88%. Fuente secundaria (el sitio de AECAUM no fue accesible desde el entorno).'
    },
    imc_estructura: {
      nombre: 'Estructura de costos de la última milla según el IMC',
      valor: 47, unidad: '% mano de obra', fecha: '2023-08-25',
      fuente: 'https://www.iprofesional.com/economia/387730-servicio-de-ultima-milla-y-postal-nuevo-indice-mensual-de-costos', tipo: 'HECHO',
      nota: 'Mano de obra 47%, transporte 41%, otros 12% (postal: 65/23/12). Dato de 2023: el peso actual puede ser distinto.'
    },

    /* ───────────── Convenio de Camioneros (CCT 40/89) ───────────── */
    cct40_conductor_1: {
      nombre: 'CCT 40/89 · Conductor de primera categoría, básico',
      valor: 1126149.40, unidad: '$ por mes', fecha: '2026-10',
      fuente: 'https://calcularsueldo.com.ar/?p=16246', tipo: 'HECHO',
      nota: 'Planilla N° 247 del CCT 40/89 (haberes de octubre de 2026, que se cobran a principios de noviembre; nota del 15-10-2026): $46.922,89 por día y $8.798,04 la hora extra al 50%. Bloomberg Línea (07-10-2026, https://www.bloomberglinea.com/latinoamerica/argentina/cuanto-cobran-los-camioneros-en-argentina-en-octubre-de-2026-segun-cada-categoria-y-cuando-se-paga-el-bono/) da el mismo valor y explica la cuenta: 1,7% sobre los $1.095.276,83 de septiembre más $12.252,86 que se incorporan al básico desde la suma no remunerativa de $18.000 (1.095.276,83 × 1,017 + 12.252,86 = 1.126.149,40). El Economista e iProfesional informan $1.113.896,53 porque aplican solo el 1,7%. Según Bloomberg Línea (que cita a Infobae), el acuerdo está homologado y falta publicarlo en el Boletín Oficial. Acuerdo de septiembre de 2026 a febrero de 2027.'
    },
    cct40_conductor_2: {
      nombre: 'CCT 40/89 · Conductor de segunda categoría, básico',
      valor: 1106080.99, unidad: '$ por mes', fecha: '2026-10',
      fuente: 'https://calcularsueldo.com.ar/?p=16246', tipo: 'HECHO',
      nota: 'Planilla N° 247; Bloomberg Línea (07-10-2026) da el mismo valor. El Economista informa $1.094.046,48 porque no suma la incorporación de la suma de $18.000.'
    },
    cct40_conductor_3: {
      nombre: 'CCT 40/89 · Conductor de tercera categoría, básico',
      valor: 1085992.26, unidad: '$ por mes', fecha: '2026-10',
      fuente: 'https://calcularsueldo.com.ar/?p=16246', tipo: 'HECHO',
      nota: 'Planilla N° 247; Bloomberg Línea (07-10-2026) da el mismo valor. El Economista informa $1.074.176,32 porque no suma la incorporación de la suma de $18.000.'
    },
    cct40_peon: {
      nombre: 'CCT 40/89 · Peón de carga y descarga, básico',
      valor: 1028525.78, unidad: '$ por mes', fecha: '2026-10',
      fuente: 'https://calcularsueldo.com.ar/?p=16246', tipo: 'HECHO',
      nota: 'Planilla N° 247; Bloomberg Línea (07-10-2026) da el mismo valor.'
    },
    cct40_comida: {
      nombre: 'CCT 40/89 · Comida por día trabajado (corta distancia y locales), no remunerativa',
      valor: 17231.89, unidad: '$ por día trabajado', fecha: '2026-10',
      fuente: 'https://calcularsueldo.com.ar/?p=16246', tipo: 'HECHO',
      nota: 'Planilla N° 247 (haberes de octubre de 2026; nota del 15-10-2026). Bloomberg Línea (07-10-2026) da el mismo valor. Zona general; con coeficiente 1,2: $20.678,27; con 1,4: $24.124,65. En julio era $16.219,85 (iProfesional) y en mayo, $15.318. Ítem 4.1.12 del convenio: la cobra todo el personal salvo el de larga distancia (cap. 4.2), por cada día efectivamente trabajado; no pide comprobantes ni paga cargas sociales (ítem 4.2.11 y art. 106 de la LCT), según la transcripción del fallo CNAT Sala VIII «J., A. R. y otros c/ Covelia S.A.» (https://abogados.com.ar/el-caracter-remuneratorio-o-no-de-los-rubros-viaticos-y-comida-en-el-cct-4089/36101). A validar: si en la práctica se paga en el reparto urbano.'
    },
    cct40_viatico_especial: {
      nombre: 'CCT 40/89 · Viático especial por día trabajado (ítem 4.1.13), no remunerativo',
      valor: 8646.93, unidad: '$ por día trabajado', fecha: '2026-10',
      fuente: 'https://calcularsueldo.com.ar/?p=16246', tipo: 'HECHO',
      nota: 'Planilla N° 247 (haberes de octubre de 2026; nota del 15-10-2026). Bloomberg Línea (07-10-2026) da el mismo valor. Zona general; con coeficiente 1,2: $10.376,32; con 1,4: $12.105,70. Ítem 4.1.13: igual que la comida, lo cobra todo el personal salvo el de larga distancia, por cada día efectivamente trabajado, sin comprobantes ni cargas sociales (ítem 4.2.11), según la transcripción del fallo CNAT Sala VIII «J., A. R. y otros c/ Covelia S.A.» (https://abogados.com.ar/el-caracter-remuneratorio-o-no-de-los-rubros-viaticos-y-comida-en-el-cct-4089/36101). A validar: si en la práctica se paga en el reparto urbano.'
    },
    cct40_antiguedad: {
      nombre: 'CCT 40/89 · Antigüedad',
      valor: 1, unidad: '% del básico por año', fecha: '2026-05',
      fuente: 'https://www.iprofesional.com/management/454524-camioneros-2026-como-quedo-la-nueva-escala-salarial-tras-el-ultimo-acuerdo-paritario', tipo: 'HECHO'
    },
    cct40_obra_social_empresa: {
      nombre: 'CCT 40/89 · Contribución patronal extraordinaria a las obras sociales del sector',
      valor: 29000, unidad: '$ por mes y trabajador', fecha: '2026-09',
      fuente: 'https://eleconomista.com.ar/economia/nuevos-sueldos-camioneros-cuanto-cobra-chofer-octubre-millonario-bono-llegara-2027-n98672', tipo: 'HECHO',
      nota: 'Bloomberg Línea (07-10-2026): sube de $25.000 a $29.000 por trabajador entre septiembre de 2026 y febrero de 2027. Es extraordinaria: revisar en marzo de 2027.'
    },

    /* ───────────── Convenio de Comercio (CCT 130/75) ───────────── */
    cct130_maestranza_a: {
      nombre: 'CCT 130/75 · Maestranza A, básico',
      valor: 1183900, unidad: '$ por mes', fecha: '2026-09',
      fuente: 'https://calcularsueldo.com.ar/?p=15517', tipo: 'HECHO',
      nota: 'calcularsueldo (30-07-2026): septiembre de 2026, $1.303.900 = $1.183.900 de básico + $120.000 no remunerativos. iProfesional (01-10-2026, https://www.iprofesional.com/impuestos/465355-empleados-de-comercio-cuanto-cobra-cada-categoria-en-octubre-2026) confirma que la escala de septiembre sigue en octubre: FAECYS y las cámaras se reúnen en octubre para revisarla.'
    },
    cct130_administrativo_a: {
      nombre: 'CCT 130/75 · Administrativo A, básico',
      valor: 1196632, unidad: '$ por mes', fecha: '2026-09',
      fuente: 'https://calcularsueldo.com.ar/?p=15517', tipo: 'HECHO',
      nota: 'calcularsueldo (30-07-2026): septiembre de 2026, $1.316.632 = $1.196.632 de básico + $120.000 no remunerativos. Sigue vigente en octubre (iProfesional, 01-10-2026).'
    },
    cct130_auxiliar_a: {
      nombre: 'CCT 130/75 · Auxiliar A / Cajero A / Vendedor A, básico',
      valor: 1200875, unidad: '$ por mes', fecha: '2026-09',
      fuente: 'https://calcularsueldo.com.ar/?p=15517', tipo: 'HECHO',
      nota: 'calcularsueldo (30-07-2026): septiembre de 2026, $1.320.875 = $1.200.875 de básico + $120.000 no remunerativos (Cajero A y Vendedor A, igual). Sigue vigente en octubre (iProfesional, 01-10-2026).'
    },
    cct130_no_remunerativa: {
      nombre: 'CCT 130/75 · Suma fija no remunerativa',
      valor: 120000, unidad: '$ por mes', fecha: '2026-09',
      fuente: 'https://calcularsueldo.com.ar/?p=15517', tipo: 'HECHO',
      nota: 'Se incorpora al básico a razón de $20.000 por mes entre diciembre de 2026 y mayo de 2027. Cuenta para presentismo, antigüedad, SAC y vacaciones y paga contribuciones a OSECAC (blogdelcontador, acuerdo de abril de 2026). A confirmar con un laboralista: el Decreto 612/2026 (BO 20-07-2026) fija la base de los aportes y contribuciones de convenio a cargo del empleador sin las sumas no remunerativas, y podría excluir ese 6%.'
    },
    cct130_presentismo: {
      nombre: 'CCT 130/75 · Presentismo (art. 40)',
      valor: 8.33, unidad: '% de la remuneración', fecha: '2022-07',
      fuente: 'https://www.consejosalta.org.ar/wp-content/uploads/CONSULTA-Empleados-de-comercio-18.pdf', tipo: 'HECHO',
      nota: 'Una doceava parte de la remuneración; se pierde con más de una ausencia injustificada en el mes. Fuente: consulta del Consejo Profesional de Ciencias Económicas de Salta (PDF de julio de 2022, art. 40 del CCT 130/75, que sigue igual).'
    },
    cct130_antiguedad: {
      nombre: 'CCT 130/75 · Antigüedad',
      valor: 1, unidad: '% por año', fecha: '2026-10',
      fuente: 'https://www.iprofesional.com/impuestos/465355-empleados-de-comercio-cuanto-cobra-cada-categoria-en-octubre-2026', tipo: 'HECHO',
      nota: 'Sobre conceptos remunerativos y no remunerativos (salvo asignaciones extraordinarias por única vez).'
    },
    cct130_osecac_extra: {
      nombre: 'CCT 130/75 · Contribución extraordinaria a OSECAC',
      valor: 28000, unidad: '$ por mes y trabajador', fecha: '2026-04',
      fuente: 'https://blogdelcontador.com.ar/news-46474-empleados-de-comercio-claves-del-acuerdo-2026-con-aumento-confirmado-y-sumas-fijas-mensuales', tipo: 'ESTIMACIÓN',
      metodo: 'Monto del acuerdo de abril de 2026; no se pudo confirmar que siga vigente en octubre.',
      nota: 'Verificar con el acuerdo vigente.'
    },

    /* ───────────── Cargas sociales ───────────── */
    contrib_general: {
      nombre: 'Contribuciones patronales, régimen general (Ley 27.541 art. 19 inc. b; la mayoría de las pymes)',
      valor: 18, unidad: '% de la remuneración', fecha: '2026-10-01',
      fuente: 'https://www.tg-cq.com/post/rg-fal', tipo: 'HECHO',
      nota: 'SIPA + INSSJP + Fondo Nacional de Empleo + Asignaciones Familiares. Desde noviembre de 2026 incluye el Fondo de Asistencia Laboral (1% o 2,5%) sin cambiar el total (RG ARCA 5907/2026, BO 01-10-2026; Ley 27.802 de Modernización Laboral).'
    },
    contrib_grandes: {
      nombre: 'Contribuciones patronales, grandes empresas de servicios o comercio (inc. a)',
      valor: 20.4, unidad: '% de la remuneración', fecha: '2026-10-01',
      fuente: 'https://www.tg-cq.com/post/rg-fal', tipo: 'HECHO',
      nota: 'Empleadores de servicios o comercio con ventas por encima del tope de mediana empresa tramo 2.'
    },
    contrib_rifl: {
      nombre: 'Contribuciones con el Régimen de Incentivo a la Formalización Laboral (RIFL)',
      valor: 5, unidad: '% de la remuneración', fecha: '2026-05-04',
      fuente: 'https://abeledogottheil.com.ar/regimen-de-incentivo-a-la-formalizacion-laboral-rifl-reduccion-de-contribuciones-patronales-por-48-meses-decreto-315-2026/', tipo: 'HECHO',
      nota: '2% SIPA/FNE/AAFF + 3% INSSJP, durante 48 meses, para altas nuevas entre el 01-05-2026 y el 30-04-2027 que cumplan requisitos (Decreto 315/2026). No aclara si alcanza a la obra social: se asume que no. El Fondo de Asistencia Laboral se paga aparte: ver la opción «RIFL + FAL».'
    },
    contrib_rifl_fal_pyme: {
      nombre: 'Contribuciones con el RIFL más el Fondo de Asistencia Laboral de una MiPyME (desde el devengado de noviembre de 2026)',
      valor: 7.5, unidad: '% de la remuneración', fecha: '2026-11',
      fuente: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/339128', tipo: 'HECHO',
      nota: 'RIFL 5% + FAL 2,5%. Ley 27.802 (BO 06-03-2026): el art. 60 fija el FAL en 2,5% para MiPyME y 1% para grandes empresas, y el art. 76 compensa el FAL con una reducción de las contribuciones, «excepto» en las relaciones del RIFL: ahí se paga encima. El FAL rige desde el devengado de noviembre de 2026 (RG ARCA 5907/2026, BO 01-10-2026, según https://www.tg-cq.com/post/rg-fal). Para una gran empresa con RIFL: 5% + 1% = 6%.'
    },
    obra_social: {
      nombre: 'Contribución patronal a la obra social (Ley 23.660)',
      valor: 6, unidad: '% de la remuneración', fecha: '2026-10',
      fuente: 'https://www.argentina.gob.ar/normativa/nacional/ley-23660-62/actualizacion', tipo: 'HECHO',
      nota: 'La Ley 27.802 (BO 06-03-2026, https://www.boletinoficial.gob.ar/detalleAviso/primera/339128) sustituye el inc. a) del art. 16 de la Ley 23.660 con una contribución del 6% para lo que se devengue desde el 01-01-2027 (art. 165) y deroga desde esa fecha el primer párrafo del art. 74 de la Ley 11.672 (art. 166): el total sigue en 6%. Verificado en el texto del Boletín Oficial.'
    },
    detraccion: {
      nombre: 'Detracción mensual por trabajador (Ley 27.541 art. 22)',
      valor: 7003.68, unidad: '$ por mes', fecha: '2019-12',
      fuente: 'https://blogdelcontador.com.ar/news-25608-claves-y-vigencia-de-la-nueva-detraccion-de-contribuciones-patronales', tipo: 'HECHO',
      nota: 'Monto fijo sin actualizar desde 2019: hoy pesa menos de 0,2% del costo.'
    },
    art_alicuota: {
      nombre: 'ART, alícuota variable',
      valor: 5, unidad: '% de la remuneración', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuesto de trabajo sin fuente: no se encontró la alícuota promedio 2026 por actividad. La SRT publica promedios por actividad (Resolución SRT 23/2026). Reemplazar por la cotización de la ART.'
    },
    art_suma_fija: {
      nombre: 'ART, suma fija por trabajador (Fondo Fiduciario de Enfermedades Profesionales)',
      valor: 1935, unidad: '$ por mes', fecha: '2026-09',
      fuente: 'https://contadoresenred.com/valor-suma-fija-art-septiembre-2026-disposicion-9-2026/', tipo: 'HECHO',
      nota: 'Disposición SRT 9/2026, devengado septiembre de 2026, se paga desde octubre. Se actualiza todos los meses por RIPTE.'
    },
    seguro_vida: {
      nombre: 'Seguro colectivo de vida obligatorio (Decreto 1567/74)',
      valor: 424.62, unidad: '$ por mes y trabajador', fecha: '2026-03',
      fuente: 'https://siap.blogdelcontador.com.ar/?p=82673', tipo: 'HECHO',
      nota: 'Capital asegurado $2.071.300 (5,5 salarios mínimos). Se actualiza cada marzo. A cargo del empleador.'
    },
    vacaciones_minimo: {
      nombre: 'Vacaciones con menos de 5 años de antigüedad (LCT art. 150)',
      valor: 14, unidad: 'días corridos por año', fecha: '2026-10',
      fuente: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552', tipo: 'HECHO',
      nota: '21 días de 5 a 10 años; 28 de 10 a 20; 35 con más de 20. El día de vacaciones se paga como sueldo ÷ 25 (art. 155).'
    },
    jornada_maxima: {
      nombre: 'Jornada máxima legal (Ley 11.544)',
      valor: 48, unidad: 'horas por semana', fecha: '2026-10',
      fuente: 'https://www.argentina.gob.ar/normativa/nacional/ley-11544-63368', tipo: 'HECHO',
      nota: 'Ocho horas diarias o 48 semanales: es un tope, no la jornada de todos. La Ley 27.802 (BO 06-03-2026) sustituyó el art. 3 (excepciones) y derogó el art. 6 de la Ley 11.544 (arts. 100 y 208; https://www.boletinoficial.gob.ar/detalleAviso/primera/339128).'
    },
    jornada_pactada: {
      nombre: 'Jornada semanal del ejemplo (48 horas en 6 días)',
      valor: 48, unidad: 'horas por semana', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Se toma el tope legal (Ley 11.544: 48 horas por semana), que es también la base de la planilla del CCT 40/89 (día = mensual ÷ 24; hora = día ÷ 8). Reemplazar por la jornada de tu convenio o contrato (por ejemplo, 44 o 45 horas en 5 días).'
    },
    feriados_2026: {
      nombre: 'Feriados nacionales de 2026 que caen de lunes a sábado',
      valor: 16, unidad: 'días por año', fecha: '2026',
      fuente: 'https://www.argentina.gob.ar/feriados', tipo: 'ESTIMACIÓN',
      metodo: 'Conteo propio de los 16 feriados de la Ley 27.399 en el calendario 2026 (15 de lunes a viernes y el 20 de junio, sábado), con las fechas trasladables publicadas por medios. No incluye días no laborables.'
    },
    ausentismo: {
      nombre: 'Ausentismo (enfermedad, licencias, faltas)',
      valor: 5, unidad: '% de los días laborables', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuesto de trabajo sin fuente pública local. Reemplazar por el dato propio.'
    },
    improductivo: {
      nombre: 'Tiempo no productivo dentro de la jornada (pausas, arranque, cierre)',
      valor: 12.5, unidad: '% de las horas presentes', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuesto de trabajo: una hora de cada ocho.'
    },

    /* ───────────── Combustibles ───────────── */
    nafta_super: {
      nombre: 'Nafta súper YPF (promedio CABA y provincia de Buenos Aires)',
      valor: 2089, unidad: '$ por litro', fecha: '2026-10-16',
      fuente: 'https://www.eldestapeweb.com/economia/precio-de-la-nafta-en-caba-y-pba-a-cuanto-cotizan-los-combustibles-hoy-viernes-16-de-octubre-20261016701', tipo: 'HECHO',
      nota: 'Precio de surtidor al público: incluye IVA (21%) e impuestos a los combustibles; sin IVA son $1.726,45. Precios informados por las petroleras (Res. 314/2016). Shell $2.192,19; Axion $2.179; Puma $2.110,20. A verificar (sin fuente citada): un diferimiento parcial de impuestos a los combustibles que vencería el 31-10-2026; buscar el decreto en el Boletín Oficial.'
    },
    gasoil: {
      nombre: 'Gasoil YPF (promedio CABA y provincia de Buenos Aires)',
      valor: 2195, unidad: '$ por litro', fecha: '2026-10-16',
      fuente: 'https://www.eldestapeweb.com/economia/precio-de-la-nafta-en-caba-y-pba-a-cuanto-cotizan-los-combustibles-hoy-viernes-16-de-octubre-20261016701', tipo: 'HECHO',
      nota: 'Precio de surtidor al público, con IVA (21%); sin IVA son $1.814,05. Gasoil premium YPF $2.379. Shell $2.344,52; Axion $2.388,50; Puma $2.278,50.'
    },

    /* ───────────── Envíos Flex (lo que cobran los operadores al vendedor) ───────────── */
    flex_caba_falco: {
      nombre: 'Envíos Flex, tarifa base CABA publicada por un operador (Falco Envíos)',
      valor: 3900, unidad: '$ por envío', fecha: '2026-10-17',
      fuente: 'https://falcoenvios.com/tarifas-envios-flex/', tipo: 'HECHO',
      nota: 'Sin fecha de actualización en la página (consultada el 17-10-2026). No menciona IVA ni «precio final»: no se sabe si los $3.900 lo incluyen (si lo incluyen, el neto es $3.223). En sus preguntas frecuentes, la misma página dice «nuestras tarifas van desde 3000$ en capital federal». Fuera de CABA, por zona de entrega: franja 1 $5.500, franja 2 $6.900, franja 3 $8.300.'
    },
    flex_caba_jn: {
      nombre: 'Envíos Flex, tarifa CABA publicada por un operador (Lenz Envíos, en jnenvios.com)',
      valor: 4200, unidad: '$ por envío', fecha: '2026-10-17',
      fuente: 'https://jnenvios.com/tarifas-envios-flex/', tipo: 'HECHO',
      nota: 'La página es de Lenz Envíos. No menciona IVA. Es una tarifa con descuento «para brindarte la oportunidad de iniciar», y cobran $5.000 por punto de retiro si se envían menos de 5 paquetes en el día. Cordón I $5.900; II $8.000; III $9.400. Sin fecha de actualización en la página.'
    },
    pago_transportista_paquete: {
      nombre: 'Pago al transportista por paquete entregado',
      valor: 2200, unidad: '$ por paquete', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuesto de trabajo sin fuente: no se encontró un dato público de cuánto pagan los operadores a los repartidores. Equivale a ~56% de la tarifa de $3.900.'
    },

    monotributo_servicios: {
      nombre: 'Monotributo, categoría F, locaciones y prestaciones de servicios (cuota mensual total)',
      valor: 150784.21, unidad: '$ por mes', fecha: '2026-08-01',
      fuente: 'https://www.afip.gob.ar/monotributo/categorias.asp', tipo: 'HECHO',
      nota: 'Valores de ARCA desde el 01-08-2026 (consultados el 17-10-2026): impuesto integrado $78.573,20 + aportes al SIPA $29.386,76 + obra social $42.824,25. Categoría F: ingresos brutos de hasta $45.151.659,41 por año. La E ($119.811,45) llega hasta $36.028.231,33 y la A ($49.527,18), hasta $12.009.410,45. El ejemplo del repartidor Flex factura 57 × $2.200 × 24 × 12 = $36.115.200 por año: cae en la F. Actualizar con cada tabla nueva de ARCA.'
    },

    /* ───────────── Inmuebles logísticos ───────────── */
    alquiler_logistico: {
      nombre: 'Alquiler pedido promedio del mercado logístico relevado por Cushman & Wakefield (Buenos Aires)',
      valor: 7.1, unidad: 'USD por m² por mes', fecha: '2026-09',
      fuente: 'https://bankmagazine.com.ar/en-el-tercer-trimestre-los-inmuebles-logisticos/', tipo: 'HECHO',
      nota: 'Cushman & Wakefield, tercer trimestre de 2026 (nota del 12-10-2026). Vacancia 11,1%. Por corredor: San Eduardo USD 8; Ruta 8 USD 7; Ruta 9 USD 6,9; Oeste USD 6,6. Es precio pedido, no de cierre. La nota no aclara si es con o sin IVA.'
    },
    servicios_edificio: {
      nombre: 'Servicios del edificio (energía, seguridad, limpieza, mantenimiento)',
      valor: 1500, unidad: '$ por m² por mes', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuesto de trabajo sin fuente (~USD 1 por m²). Reemplazar por las facturas propias.'
    },

    /* ───────────── Vehículos (para los presets de la calculadora de recorrido) ───────────── */
    utilitario_valor: {
      nombre: 'Utilitario chico 0 km (tipo Kangoo, Partner, Fiorino)',
      valor: 33000000, unidad: '$', fecha: '2026-10-17',
      fuente: 'https://vehiculos.mercadolibre.com.ar/kangoo-partner-berlingo', tipo: 'ESTIMACIÓN',
      metodo: 'Punto medio redondeado de avisos de MercadoLibre y Kavak consultados el 17-10-2026 ($21 a $41 millones según modelo y versión). Son precios de aviso al público, con IVA incluido.'
    },
    moto_valor: {
      nombre: 'Moto 110 cc 0 km',
      valor: 1600000, unidad: '$', fecha: '2026-10-17',
      fuente: 'https://motos.mercadolibre.com.ar/motomel/blitz-110/', tipo: 'ESTIMACIÓN',
      metodo: 'Avisos de MercadoLibre de Motomel Blitz 110 modelo 2026 consultados el 17-10-2026 ($1,29 a $1,80 millones). Son precios de aviso al público, con IVA incluido.'
    },
    camion_valor: {
      nombre: 'Tractor 0 km con semirremolque',
      valor: 307000000, unidad: '$', fecha: '2026-10-17',
      fuente: 'https://vehiculos.mercadolibre.com.ar/camiones/manual/nuevo/2026/', tipo: 'ESTIMACIÓN',
      metodo: 'Tractor Mercedes-Benz Actros 2045 0 km publicado a USD 150.830 (MercadoLibre, 17-10-2026) más un semirremolque supuesto de USD 50.000 (sin fuente), al dólar de $1.535. No se verificó si el aviso incluye IVA ni su alícuota (un bien de capital puede tributar 10,5%): verificar.'
    },
    cubierta_utilitario: {
      nombre: 'Cubierta 195/65 R15 91H (Formula Evo, de Pirelli)',
      valor: 310740, unidad: '$ por cubierta', fecha: '2026-10-17',
      fuente: 'https://www.easy.com.ar/cubierta-195-65r15-91h-f-evo-pirelli-1320626/p', tipo: 'HECHO',
      nota: 'Un solo comercio; precio con IVA (21%) incluido: $256.810 sin impuestos nacionales (310.740 ÷ 256.810 = 1,21). En la revisión del mismo día no se pudo volver a leer (la página carga el precio con JavaScript): reverificar con 2 o 3 comercios.'
    },
    supuestos_vehiculo: {
      nombre: 'Consumos, vida útil, seguros, cocheras, mantenimiento y recorridos de los ejemplos',
      valor: 0, unidad: '—', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuestos de trabajo sin fuente para que los ejemplos funcionen: consumo urbano, vida de cubiertas, mantenimiento por km, seguro (comparadores de 2026 dan $35.000–$140.000 por mes para autos), patente (CABA cobra entre 1,5% y 4,5% del valor según medios), cochera, peajes, vida útil, km, horas y paradas por recorrido. Cada usuario tiene que poner los suyos.'
    },
    supuestos_tarifa: {
      nombre: 'Volumen, fallidos, costos propios y pagos alternativos del ejemplo de tarifa',
      valor: 0, unidad: '—', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuestos de trabajo sin fuente: 60 paquetes por ruta, 24 días por mes, 5% de fallidos, 80% de re-entregas, $450 de costo propio por paquete y pagos de $130.000 por jornada, $1.100 por km o $16.000 por hora.'
    },
    supuestos_hub: {
      nombre: 'Volumen, superficie, equipos y sistemas del ejemplo de hub',
      valor: 0, unidad: '—', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuestos de trabajo sin fuente: 8.000 paquetes por turno, 26 turnos por mes, 2.500 m², $45 millones en equipos (escáneres, zorras, jaulas, mesas), $500.000 por mes de sistemas y $60 de insumos por paquete.'
    },
    supuestos_deposito: {
      nombre: 'Volúmenes, superficies, racks y estructura del ejemplo de depósito',
      valor: 0, unidad: '—', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuestos de trabajo sin fuente: 1.200 pallets recibidos, 2.000 posiciones al 85%, 30.000 líneas y 10.000 pedidos por mes, 1.800 m² de almacenamiento y 700 m² operativos, $120.000 de rack por posición y $9 millones por mes de estructura.'
    },

    /* ───────────── Productividades (anclas externas) ───────────── */
    prod_picking: {
      nombre: 'Picking: líneas preparadas y despachadas por persona y hora',
      valor: 50, unidad: 'líneas por hora-persona', fecha: '2025',
      fuente: 'https://www.yale.com/globalassets/coms/yale/north-america/documents/white-papers/snack-drawer/YALE-1520_WERC-DC-Metrics-infographic.pdf', tipo: 'ESTIMACIÓN',
      metodo: 'El informe DC Measures 2025 de WERC (Estados Unidos), según la infografía de Yale, pone el «mejor de su clase» en 70 o más líneas por persona-hora. Es un techo, no un promedio: se toma ~70% de ese valor como supuesto para una pyme. Reemplazar por la medición propia.'
    },
    prod_clasificacion: {
      nombre: 'Clasificación manual de paquetes por hora',
      valor: 200, unidad: 'paquetes por hora-persona', fecha: '2026-10',
      fuente: 'https://www.oversight.gov/sites/default/files/documents/reports/2019-12/20-064-R20.pdf', tipo: 'ESTIMACIÓN',
      metodo: 'Supuesto de trabajo. Ancla externa: el correo de EE.UU. promedió 74 paquetes por hora en clasificación manual (2019), contando todas las horas del centro; un puesto de clasificación a rutas con escáner rinde bastante más. Es el primer número a validar.'
    },
    prod_otros: {
      nombre: 'Productividades de descarga, carga, recepción, packing y despacho',
      valor: 0, unidad: '—', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuestos de trabajo sin fuente pública local. Reemplazar por mediciones propias (tiempos y movimientos o datos del sistema).'
    },

    /* ───────────── Peso volumétrico y cubicaje ───────────── */
    divisor_express: {
      nombre: 'Divisor de peso volumétrico, courier y express internacional (DHL Express, UPS, FedEx)',
      valor: 5000, unidad: 'cm³ por kg', fecha: '2026',
      fuente: 'https://blog.gettransport.com/es/logistics-guide/chargeable-volumetric-weight-calculation-2026/', tipo: 'HECHO',
      nota: 'Equivale a 200 kg por m³. Muchos redondean hacia arriba al medio kilo. Clientes grandes negocian otro divisor.'
    },
    divisor_aereo: {
      nombre: 'Divisor de peso volumétrico, carga aérea (relación 1:6, IATA)',
      valor: 6000, unidad: 'cm³ por kg', fecha: '2026-10-17',
      fuente: 'https://www.dhl.com/ar-es/home/global-forwarding/centro-de-educacion-del-transporte-de-carga/calculo-de-pesos-facturables.html', tipo: 'HECHO',
      nota: 'Equivale a 166,7 kg por m³. Fecha = consulta de la página de DHL. Segunda fuente: gettransport (16-07-2026) da 6.000 y 167 kg por m³.'
    },
    divisor_tren: {
      nombre: 'Divisor de peso volumétrico, tren (relación 1:3)',
      valor: 3000, unidad: 'cm³ por kg', fecha: '2026-10-17',
      fuente: 'https://www.dhl.com/ar-es/home/global-forwarding/centro-de-educacion-del-transporte-de-carga/calculo-de-pesos-facturables.html', tipo: 'HECHO',
      nota: 'Equivale a 333 kg por m³. Fecha = consulta de la página de DHL, que da 1:3 para tren y aclara que en carretera «las relaciones de densidad varían según la ubicación y el transportista». No hay un aforo terrestre único en Argentina: cada transportista fija el suyo.'
    },
    divisor_maritimo: {
      nombre: 'Divisor de peso volumétrico, marítimo consolidado LCL (relación 1:1)',
      valor: 1000, unidad: 'cm³ por kg', fecha: '2026-10-17',
      fuente: 'https://www.dhl.com/ar-es/home/global-forwarding/centro-de-educacion-del-transporte-de-carga/calculo-de-pesos-facturables.html', tipo: 'HECHO',
      nota: '1 m³ = 1.000 kg. En contenedor completo (FCL) se cobra por contenedor. Fecha = consulta de la página de DHL. Segunda fuente: gettransport (16-07-2026), «un CBM se establece en 1000 kg».'
    },
    pallets_iso: {
      nombre: 'Medidas de pallets normalizadas (ISO 6780)',
      valor: 1200, unidad: 'mm (lado largo)', fecha: '2003',
      fuente: 'https://www.iso.org/standard/30081.html', tipo: 'HECHO',
      nota: '1.000 × 1.200 mm (el más usado en Argentina, conocido como pallet ARLOG: a validar), 800 × 1.200 mm (europallet), 1.016 × 1.219 mm (americano).'
    },
    contenedores: {
      nombre: 'Medidas interiores de contenedores dry (aproximadas)',
      valor: 589.8, unidad: 'cm (largo interior del 20 pies)', fecha: '2026-10-17',
      fuente: 'https://www.icontainers.com/es/ayuda/contenedor-20-pies/', tipo: 'HECHO',
      nota: '20 pies: 589,8 × 235,2 × 239,3 cm. 40 pies: 1.202,5 × 235,2 × 239,3 cm. 40 HC: 1.203 × 235 × 269 cm. La fuente aclara que la tara varía según el fabricante; las medidas son aproximadas.'
    },
    supuestos_pallet: {
      nombre: 'Altura máxima, peso máximo y peso propio del pallet',
      valor: 0, unidad: '—', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Supuestos de trabajo: altura total 160 cm, 1.000 kg por pallet, 25 kg el pallet vacío y 15 cm de alto. Usar los que pida el cliente, el transporte o el rack.'
    },

    /* ───────────── Costo del capital ───────────── */
    tasa_capital: {
      nombre: 'Costo del capital inmovilizado (tasa real anual)',
      valor: 8, unidad: '% anual', fecha: '2026-10',
      fuente: null, tipo: 'ESTIMACIÓN',
      metodo: 'Se usa la vara de una inversión segura en dólares (6–8% anual). Como los precios están en pesos de hoy, es una tasa real.'
    }
  };

  function ref(clave) {
    var r = R[clave];
    if (!r) { throw new Error('Referencia inexistente: ' + clave); }
    return r.valor;
  }

  return { ACTUALIZADO: ACTUALIZADO, PERIODO_PESOS: PERIODO_PESOS, REFERENCIAS: R, ref: ref };
});
