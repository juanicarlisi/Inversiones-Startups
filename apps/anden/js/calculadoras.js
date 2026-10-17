/*
 * Andén — definición de cada calculadora: campos (con unidad, valor por defecto y referencia),
 * ejemplos para arrancar, resultados, desglose, sensibilidad y ejemplo paso a paso.
 * Las fórmulas están en calculos.js; acá solo se arma lo que se muestra.
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) {
    module.exports = fabrica(require('./formato.js'), require('./calculos.js'), require('./referencias.js'));
  } else {
    raiz.AndenCalculadoras = fabrica(raiz.AndenFormato, raiz.AndenCalculos, raiz.AndenReferencias);
  }
})(typeof self !== 'undefined' ? self : this, function (F, C, REF) {
  'use strict';

  var ref = REF.ref;
  function redondear(x, paso) { return Math.round(x / paso) * paso; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Ayudantes de formato que reciben el tipo de cambio vigente en la pantalla. */
  function ayudantes(tc) {
    return {
      tc: tc,
      p: function (x, d) { return F.pesos(x, d); },
      u: function (x) { return F.usd(x / tc, Math.abs(x / tc) >= 100 ? 0 : 2); },
      n: function (x, d) { return F.numero(x, d); },
      pc: function (x, d) { return F.porcentaje(x, d); },
      kg: function (x) { return F.numero(x, Math.abs(x) >= 100 ? 0 : 1) + ' kg'; },
      esc: esc
    };
  }

  /* ════════════ Calculadora 3 primero: las demás toman de acá el costo hora ════════════ */
  var COMUNES_LABORAL = {
    adicionalesRem: 0,
    contribucionesPct: ref('contrib_general'), obraSocialPct: ref('obra_social'), detraccion: ref('detraccion'),
    artPct: ref('art_alicuota'), artFija: ref('art_suma_fija'), seguroVida: ref('seguro_vida'),
    horasSemana: ref('jornada_pactada'), diasSemana: 6, vacacionesDias: ref('vacaciones_minimo'),
    feriados: ref('feriados_2026'), ausentismoPct: ref('ausentismo'), improductivoPct: ref('improductivo'),
    antiguedadAnios: 0
  };
  /* Cada ejemplo define las mismas claves (una prueba lo verifica): así, al pasar de uno a otro no queda nada del anterior.
   * «refs» dice de qué referencia sale cada valor del ejemplo, para que la insignia muestre la que corresponde. */
  function refsComercio(basico) {
    return { basico: basico, antiguedadPct: 'cct130_antiguedad', presentismoPct: 'cct130_presentismo', noRem: 'cct130_no_remunerativa', aportesConvenio: 'cct130_osecac_extra' };
  }
  var PRESETS_LABORAL = [
    { id: 'c40_conductor1', nombre: 'Conductor de 1ª · Camioneros (CCT 40/89), con comida y viático especial', valores: {
      basico: ref('cct40_conductor_1'), antiguedadPct: ref('cct40_antiguedad'), presentismoPct: 0,
      noRem: 0, noRemIntegra: false, noRemContribPct: 0, viaticoDia: ref('cct40_comida'), viaticoEspecialDia: ref('cct40_viatico_especial'),
      aportesConvenio: ref('cct40_obra_social_empresa') } },
    { id: 'c40_peon', nombre: 'Peón de carga y descarga · Camioneros (CCT 40/89), sin comida ni viático', valores: {
      basico: ref('cct40_peon'), antiguedadPct: ref('cct40_antiguedad'), presentismoPct: 0,
      noRem: 0, noRemIntegra: false, noRemContribPct: 0, viaticoDia: 0, viaticoEspecialDia: 0,
      aportesConvenio: ref('cct40_obra_social_empresa') }, refs: { basico: 'cct40_peon' } },
    { id: 'c130_maestranza', nombre: 'Maestranza A · Comercio (CCT 130/75)', valores: {
      basico: ref('cct130_maestranza_a'), antiguedadPct: ref('cct130_antiguedad'), presentismoPct: ref('cct130_presentismo'),
      noRem: ref('cct130_no_remunerativa'), noRemIntegra: true, noRemContribPct: ref('obra_social'), viaticoDia: 0, viaticoEspecialDia: 0,
      aportesConvenio: ref('cct130_osecac_extra') }, refs: refsComercio('cct130_maestranza_a') },
    { id: 'c130_auxiliar', nombre: 'Auxiliar A · Comercio (CCT 130/75)', valores: {
      basico: ref('cct130_auxiliar_a'), antiguedadPct: ref('cct130_antiguedad'), presentismoPct: ref('cct130_presentismo'),
      noRem: ref('cct130_no_remunerativa'), noRemIntegra: true, noRemContribPct: ref('obra_social'), viaticoDia: 0, viaticoEspecialDia: 0,
      aportesConvenio: ref('cct130_osecac_extra') }, refs: refsComercio('cct130_auxiliar_a') },
    { id: 'c130_administrativo', nombre: 'Administrativo A · Comercio (CCT 130/75)', valores: {
      basico: ref('cct130_administrativo_a'), antiguedadPct: ref('cct130_antiguedad'), presentismoPct: ref('cct130_presentismo'),
      noRem: ref('cct130_no_remunerativa'), noRemIntegra: true, noRemContribPct: ref('obra_social'), viaticoDia: 0, viaticoEspecialDia: 0,
      aportesConvenio: ref('cct130_osecac_extra') }, refs: refsComercio('cct130_administrativo_a') }
  ];
  function valoresLaboral(idPreset) {
    var p = PRESETS_LABORAL.filter(function (x) { return x.id === idPreset; })[0];
    var v = {};
    Object.keys(COMUNES_LABORAL).forEach(function (k) { v[k] = COMUNES_LABORAL[k]; });
    Object.keys(p.valores).forEach(function (k) { v[k] = p.valores[k]; });
    return v;
  }
  var LAB_CONDUCTOR = C.costoLaboral(valoresLaboral('c40_conductor1'));
  var LAB_PEON = C.costoLaboral(valoresLaboral('c40_peon'));
  var HORA_CONDUCTOR = redondear(LAB_CONDUCTOR.costoHoraProductiva, 100);
  var HORA_PEON = redondear(LAB_PEON.costoHoraProductiva, 100);
  var HORAS_PROD_DIA_PEON = Math.round(LAB_PEON.horasProductivasMes / LAB_PEON.diasTrabajadosMes * 10) / 10;
  var HORAS_PROD_MES_PEON = Math.round(LAB_PEON.horasProductivasMes * 10) / 10;

  /* «Del costo al precio» (calculadoras 2 y 5): el margen se mide sobre el precio, igual que en la 1. */
  var CAMPOS_PRECIO = [
    { id: 'margenPct', etiqueta: 'Margen que querés ganar', unidad: '% del precio', defecto: 15, max: 99,
      ayuda: 'Se mide sobre el precio, igual que en la calculadora 1.' },
    { id: 'impuestosPct', etiqueta: 'Impuestos sobre lo facturado (ingresos brutos, débitos y créditos)', unidad: '% del precio', defecto: 0, max: 99,
      ayuda: 'Cargá la alícuota de tu jurisdicción y actividad. No incluyas el IVA.' }
  ];

  var importarHora = { desde: 'laboral', texto: 'Traer de la calculadora 3', salida: function (r) { return redondear(r.costoHoraProductiva, 10); } };

  /* ════════════════════════════ 1. Tarifa al transportista ════════════════════════════ */
  var CAMPO_TARIFA = { paquete: 'tarifaPaquete', jornada: 'tarifaJornada', km: 'tarifaKm', hora: 'tarifaHora' };
  var MODALIDADES_TARIFA = [
    { valor: 'paquete', texto: 'Por paquete' }, { valor: 'jornada', texto: 'Por jornada' },
    { valor: 'km', texto: 'Por kilómetro' }, { valor: 'hora', texto: 'Por hora' }];

  var tarifa = {
    id: 'tarifa', numero: 1, archivo: 'tarifa-transportista.html',
    titulo: 'Tarifa al transportista vs. ingreso y volumen',
    corto: 'Tarifa al transportista',
    decision: 'Cuánto le podés pagar al transportista (por paquete, jornada, km u hora) y con cuántos paquetes por ruta te cierra.',
    grupos: [
      { titulo: 'Lo que cobrás', campos: [
        { id: 'ingreso', etiqueta: 'Ingreso por paquete entregado', unidad: '$ por paquete', defecto: ref('flex_caba_falco'), ref: 'flex_caba_falco',
          ayuda: 'Lo que te paga el vendedor o la plataforma por cada entrega lograda, en la misma base que tus costos: si sos monotributista, el total que cobrás; si sos responsable inscripto, sin IVA. Operadores de Envíos Flex publican $3.900–$4.200 para CABA sin aclarar si incluyen IVA: si lo incluyen, $3.900 son $3.223 netos.' },
        { id: 'cobroDevolucion', etiqueta: 'Cobro por paquete devuelto al vendedor', unidad: '$ por paquete', defecto: 0,
          ayuda: 'Si te pagan algo cuando el paquete no se entregó y vuelve. Si no, dejá 0.' }
      ] },
      { titulo: 'Volumen de la ruta', campos: [
        { id: 'paradas', etiqueta: 'Paquetes cargados por ruta y día', unidad: 'paquetes', defecto: 60, ref: 'supuestos_tarifa',
          ayuda: 'Todo lo que sale en el vehículo, incluidas las re-entregas de días anteriores.' },
        { id: 'dias', etiqueta: 'Días que sale la ruta por mes', unidad: 'días', defecto: 24, ref: 'supuestos_tarifa' },
        { id: 'fallidos', etiqueta: 'Entregas fallidas', unidad: '% de los paquetes cargados', defecto: 5, ref: 'supuestos_tarifa', max: 100 },
        { id: 'reentrega', etiqueta: 'Fallidos que vuelven a salir', unidad: '% de los fallidos', defecto: 80, ref: 'supuestos_tarifa', max: 100,
          ayuda: 'El resto se devuelve al vendedor. Las re-entregas ocupan lugar en rutas de otros días.' }
      ] },
      { titulo: 'Cómo le pagás al transportista', campos: [
        { id: 'modalidad', tipo: 'opciones', etiqueta: 'Modalidad de pago', defecto: 'paquete', opciones: MODALIDADES_TARIFA,
          ayuda: 'Abajo, en «Las cuatro formas de pagar», ves las otras con tus mismos números.' },
        { id: 'tarifaPaquete', etiqueta: 'Pago por paquete', unidad: '$ por paquete', defecto: ref('pago_transportista_paquete'), ref: 'pago_transportista_paquete',
          visible: function (v) { return v.modalidad === 'paquete'; } },
        { id: 'pagaFallidos', tipo: 'si_no', etiqueta: 'También pagás los paquetes que fallan (por visita)', defecto: false,
          visible: function (v) { return v.modalidad === 'paquete'; } },
        { id: 'tarifaJornada', etiqueta: 'Pago por jornada', unidad: '$ por día', defecto: 130000, ref: 'supuestos_tarifa',
          visible: function (v) { return v.modalidad === 'jornada'; } },
        { id: 'tarifaKm', etiqueta: 'Pago por kilómetro', unidad: '$ por km', defecto: 1100, ref: 'supuestos_tarifa',
          visible: function (v) { return v.modalidad === 'km'; } },
        { id: 'tarifaHora', etiqueta: 'Pago por hora', unidad: '$ por hora', defecto: 16000, ref: 'supuestos_tarifa',
          visible: function (v) { return v.modalidad === 'hora'; } },
        { id: 'kmFijos', etiqueta: 'Km fijos por ruta (ida y vuelta a la zona)', unidad: 'km', defecto: 35, ref: 'supuestos_tarifa',
          visible: function (v) { return v.modalidad === 'km'; } },
        { id: 'kmPorParada', etiqueta: 'Km entre paradas', unidad: 'km por parada', defecto: 1.2, ref: 'supuestos_tarifa',
          visible: function (v) { return v.modalidad === 'km'; } },
        { id: 'horasFijas', etiqueta: 'Horas fijas por ruta (carga y traslado)', unidad: 'horas', defecto: 1.5, ref: 'supuestos_tarifa',
          visible: function (v) { return v.modalidad === 'hora'; } },
        { id: 'minPorParada', etiqueta: 'Minutos por parada', unidad: 'minutos', defecto: 7, ref: 'supuestos_tarifa',
          visible: function (v) { return v.modalidad === 'hora'; } }
      ] },
      { titulo: 'Tus costos y tu meta', campos: [
        { id: 'costoPropio', etiqueta: 'Costo propio por paquete cargado', unidad: '$ por paquete', defecto: 450, ref: 'supuestos_tarifa',
          ayuda: 'Hub, clasificación, sistema, seguro de la carga, administración.',
          importar: { desde: 'hub', texto: 'Traer de la calculadora 4', salida: function (r) { return redondear(r.porPaquete, 1); } } },
        { id: 'fijosRuta', etiqueta: 'Costo fijo propio por ruta y día', unidad: '$ por día', defecto: 0,
          ayuda: 'Supervisión, ruteo u otros costos que pagás por cada ruta que sale.' },
        { id: 'margenObjetivo', etiqueta: 'Margen que querés ganar', unidad: '% del ingreso', defecto: 15, max: 99 }
      ] },
      { titulo: '¿Sos el transportista? Lo que le queda (opcional)', abierto: false, campos: [
        { id: 'costoTransportistaDia', etiqueta: 'Lo que le cuesta al transportista salir un día', unidad: '$ por jornada', defecto: 0,
          ayuda: 'Traé de la calculadora 2 el ejemplo «Repartidor Flex» (sin chofer): lo que queda es lo que gana por su trabajo. Si traés un ejemplo con chofer a convenio, lo que queda es lo que gana por encima de ese sueldo.',
          importar: { desde: 'recorrido', texto: 'Traer de la calculadora 2', salida: function (r) { return redondear(r.total, 100); } } },
        { id: 'horasTransportista', etiqueta: 'Horas que trabaja por día', unidad: 'horas', defecto: 9, ref: 'supuestos_vehiculo',
          visible: function (v) { return v.costoTransportistaDia > 0; } }
      ] }
    ],
    calcular: function (v) { return C.tarifaTransportista(v); },
    principal: function (r, v, h) {
      return {
        etiqueta: 'Margen por ruta y día',
        valor: h.p(r.margenRuta),
        sub: h.pc(r.margenPct) + ' del ingreso · ' + h.p(r.margenPorEntregado) + ' por paquete entregado · ' + h.u(r.margenMes) + ' por mes',
        estado: r.margenRuta < 0 ? 'mal' : (r.margenPct < v.margenObjetivo ? 'atencion' : 'bien')
      };
    },
    tarjetas: function (r, v, h) {
      var eq;
      if (r.equilibrio === 0) {
        eq = { etiqueta: 'Punto de equilibrio', valor: 'Desde el primer paquete',
          nota: 'Sin costos fijos por ruta, cada paquete deja ' + h.p(r.contribucionPorParada) + ': el margen por paquete no depende del volumen. Pagando por paquete, el riesgo de volumen lo corre el transportista.' };
      } else if (!isFinite(r.equilibrio)) {
        eq = { etiqueta: 'Punto de equilibrio', valor: 'No cierra con ningún volumen', estado: 'mal',
          nota: 'Cada paquete cargado pierde ' + h.p(-r.contribucionPorParada) + ': más volumen es más pérdida.' };
      } else {
        eq = { etiqueta: 'Punto de equilibrio', valor: h.n(r.equilibrioParadas, 0) + ' paquetes por ruta',
          estado: v.paradas < r.equilibrio ? 'mal' : '',
          nota: 'Por debajo, la ruta pierde plata. Cada paquete aporta ' + h.p(r.contribucionPorParada) + ' para cubrir ' + h.p(r.fijoPorRuta) + ' fijos.' };
      }
      var actual = v[CAMPO_TARIFA[v.modalidad]];
      var t = [
        { etiqueta: 'Margen por mes (una ruta)', valor: h.p(r.margenMes), nota: h.u(r.margenMes) + ' · ' + h.n(v.dias, 0) + ' días' },
        eq,
        { etiqueta: 'Tarifa máxima al transportista', valor: h.p(r.tarifaMaxima) + ' por ' + r.unidadTarifa,
          estado: actual > r.tarifaMaxima ? 'atencion' : '',
          nota: 'Para ganar ' + h.pc(v.margenObjetivo, 0) + ' del ingreso. Hoy pagás ' + h.p(actual) + '.' },
        { etiqueta: 'Paquetes nuevos por ruta', valor: h.n(r.nuevos, 1),
          nota: 'El resto son re-entregas (' + h.n(r.reentregas, 1) + ' por día). Se devuelven ' + h.n(r.devoluciones, 1) + '.' }
      ];
      if (v.costoTransportistaDia > 0) {
        t.push({ etiqueta: 'Le queda al transportista', valor: h.p(r.gananciaTransportistaDia) + ' por día',
          estado: r.gananciaTransportistaDia < 0 ? 'mal' : '',
          nota: h.p(r.gananciaTransportistaMes) + ' por mes · ' + h.p(r.gananciaTransportistaHora) + ' por hora (' + h.n(v.horasTransportista, 1) + ' h). Si es negativo, pierde plata (o gana menos que el sueldo que cargaste en la 2).' });
        t.push({ etiqueta: 'Tarifa mínima para el transportista', valor: h.p(r.tarifaMinimaTransportista) + ' por ' + r.unidadTarifa,
          estado: actual < r.tarifaMinimaTransportista ? 'atencion' : '',
          nota: (isFinite(r.equilibrioTransportista) ? 'Con tu pago, cubre sus gastos desde ' + h.n(r.equilibrioTransportista, 0) + ' paquetes cargados. ' : '') + 'Por debajo de esta tarifa no cubre lo que le cuesta salir.' });
      }
      return t;
    },
    desglose: function (r, v, h) {
      var E = r.entregados, d = v.dias;
      function fila(nombre, x) { return [nombre, h.p(x), h.p(x / E), h.p(x * d)]; }
      // Las cuatro formas de pagar con los mismos datos (cada una con la tarifa cargada en su campo).
      var conCostoTransp = v.costoTransportistaDia > 0;
      var formas = MODALIDADES_TARIFA.map(function (o) {
        return { o: o, r: C.tarifaTransportista(Object.assign({}, v, { modalidad: o.valor })) };
      });
      var mejor = formas.reduce(function (a, b) { return b.r.margenRuta > a.r.margenRuta ? b : a; });
      var comparacion = {
        titulo: 'Las cuatro formas de pagar, con tus números',
        nota: 'Mismos paquetes, fallidos y costos; cada fila usa la tarifa cargada para esa forma (para cambiarla, elegila en «Modalidad de pago»). Las tarifas por jornada, km y hora del ejemplo son supuestos. La tarifa máxima es la que deja el ' + h.pc(v.margenObjetivo, 0) + ' de margen.',
        columnas: ['Forma de pago', 'Margen por ruta y día', 'Tarifa máxima', 'Equilibrio', 'Tarifa', 'Pago del día']
          .concat(conCostoTransp ? ['Le queda al transportista'] : []),
        filas: formas.map(function (x) {
          var q = x.r;
          var eqTxt = q.equilibrio === 0 ? 'Desde el primer paquete'
            : (!isFinite(q.equilibrio) ? 'No cierra' : h.n(q.equilibrioParadas, 0) + ' paquetes');
          var marcas = [];
          if (x.o.valor === v.modalidad) { marcas.push('la que elegiste'); }
          if (x === mejor) { marcas.push('más margen para vos'); }
          return [x.o.texto + (marcas.length ? ' (' + marcas.join(', ') + ')' : ''),
            h.p(q.margenRuta) + ' (' + h.pc(q.margenPct) + ')', h.p(q.tarifaMaxima) + ' por ' + q.unidadTarifa,
            eqTxt, h.p(v[CAMPO_TARIFA[x.o.valor]]) + ' por ' + q.unidadTarifa, h.p(q.pagoTransportista)]
            .concat(conCostoTransp ? [h.p(q.gananciaTransportistaDia) + ' por día'] : []);
        })
      };
      return [{
        titulo: 'Desglose por ruta',
        columnas: ['Concepto', 'Por ruta y día', 'Por paquete entregado', 'Por mes'],
        filas: [
          fila('Ingreso por entregas', E * v.ingreso),
          fila('Cobro por devoluciones', r.devoluciones * v.cobroDevolucion),
          fila('Pago al transportista', -r.pagoTransportista),
          fila('Costo propio por paquete cargado', -v.costoPropio * v.paradas),
          fila('Costo fijo propio por ruta', -v.fijosRuta)
        ],
        pie: fila('Margen', r.margenRuta)
      }, comparacion];
    },
    sensibilidad: {
      titulo: 'Margen por ruta y día si cambia…',
      columnas: [
        { campo: 'paradas', etiqueta: 'Paquetes por ruta', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.margenRuta); } },
        { campo: function (v) { return CAMPO_TARIFA[v.modalidad]; }, etiqueta: 'Pago al transportista', entrada: function (x, h) { return h.p(x); }, salida: function (r, h) { return h.p(r.margenRuta); } },
        { campo: 'fallidos', etiqueta: '% de fallidos', entrada: function (x, h) { return h.pc(x); }, salida: function (r, h) { return h.p(r.margenRuta); } },
        { campo: 'ingreso', etiqueta: 'Ingreso por paquete', entrada: function (x, h) { return h.p(x); }, salida: function (r, h) { return h.p(r.margenRuta); } }
      ]
    },
    pasos: function (r, v, h) {
      var f = v.fallidos / 100, pasoPago;
      if (v.modalidad === 'paquete') {
        pasoPago = 'Pago al transportista = ' + (v.pagaFallidos ? 'paquetes cargados ' + h.n(v.paradas, 0) : 'entregados ' + h.n(r.entregados, 1)) + ' × ' + h.p(v.tarifaPaquete) + ' = <b>' + h.p(r.pagoTransportista) + '</b>.';
      } else if (v.modalidad === 'jornada') {
        pasoPago = 'Pago al transportista = una jornada = <b>' + h.p(r.pagoTransportista) + '</b>.';
      } else if (v.modalidad === 'km') {
        pasoPago = 'Km de la ruta = ' + h.n(v.kmFijos) + ' + ' + h.n(v.kmPorParada) + ' × ' + h.n(v.paradas, 0) + ' = ' + h.n(r.km, 1) + ' km. Pago = ' + h.n(r.km, 1) + ' × ' + h.p(v.tarifaKm) + ' = <b>' + h.p(r.pagoTransportista) + '</b>.';
      } else {
        pasoPago = 'Horas de la ruta = ' + h.n(v.horasFijas) + ' + ' + h.n(v.minPorParada) + ' min × ' + h.n(v.paradas, 0) + ' ÷ 60 = ' + h.n(r.horas, 2) + ' h. Pago = ' + h.n(r.horas, 2) + ' × ' + h.p(v.tarifaHora) + ' = <b>' + h.p(r.pagoTransportista) + '</b>.';
      }
      var eq = r.equilibrio === 0 ? 'no hay costo fijo por ruta, así que no hay volumen mínimo'
        : (!isFinite(r.equilibrio) ? 'el aporte es negativo: no hay volumen que cierre'
          : 'equilibrio = ' + h.p(r.fijoPorRuta) + ' ÷ ' + h.p(r.contribucionPorParada) + ' = ' + h.n(r.equilibrio, 1) + ' → <b>' + h.n(r.equilibrioParadas, 0) + ' paquetes</b>');
      return [
        'Entregados = paquetes cargados × (1 − fallidos) = ' + h.n(v.paradas, 0) + ' × (1 − ' + h.pc(v.fallidos) + ') = <b>' + h.n(r.entregados, 1) + '</b>. Fallan ' + h.n(r.fallidos, 1) + ': vuelven a salir ' + h.n(r.reentregas, 1) + ' y se devuelven ' + h.n(r.devoluciones, 1) + '.',
        'Ingreso = ' + h.n(r.entregados, 1) + ' × ' + h.p(v.ingreso) + ' + ' + h.n(r.devoluciones, 1) + ' × ' + h.p(v.cobroDevolucion) + ' = <b>' + h.p(r.ingresoRuta) + '</b>.',
        pasoPago,
        'Costo propio = ' + h.n(v.paradas, 0) + ' × ' + h.p(v.costoPropio) + ' + ' + h.p(v.fijosRuta) + ' = <b>' + h.p(r.costoPropioRuta) + '</b>.',
        'Margen = ' + h.p(r.ingresoRuta) + ' − ' + h.p(r.pagoTransportista) + ' − ' + h.p(r.costoPropioRuta) + ' = <b>' + h.p(r.margenRuta) + '</b> (' + h.pc(r.margenPct) + ' del ingreso).',
        'Cada paquete cargado aporta (1 − ' + h.n(f, 2) + ') × ' + h.p(v.ingreso) + ' + devoluciones − ' + h.p(v.costoPropio) + ' − pago variable = ' + h.p(r.contribucionPorParada) + '; ' + eq + '.',
        'Tarifa máxima = (ingreso × (1 − ' + h.pc(v.margenObjetivo, 0) + ') − costo propio) ÷ unidades = (' + h.p(r.ingresoRuta) + ' × ' + h.n(1 - v.margenObjetivo / 100, 2) + ' − ' + h.p(r.costoPropioRuta) + ') ÷ ' + h.n(r.unidadesTarifa, 1) + ' = <b>' + h.p(r.tarifaMaxima) + ' por ' + r.unidadTarifa + '</b>.'
      ];
    },
    refsExtra: ['flex_caba_jn', 'imc_ultima_milla', 'imc_estructura', 'cedol_distribucion_urbana']
  };

  /* ════════════════════════════ 2. Costo por recorrido ════════════════════════════ */
  /* Todos los ejemplos definen el personal: así, al volver del repartidor sin chofer a otro ejemplo, el chofer vuelve. */
  var PERSONAL_CONVENIO = { choferHora: HORA_CONDUCTOR, acompanantes: 0, acompananteHora: HORA_PEON };
  function conPersonal(valores, personal) {
    var v = {};
    Object.keys(valores).forEach(function (k) { v[k] = valores[k]; });
    Object.keys(personal).forEach(function (k) { v[k] = personal[k]; });
    return v;
  }
  var UTILITARIO = {
    valorVehiculo: ref('utilitario_valor'), residualPct: 35, vidaAnios: 5, seguroMes: 110000, patentePct: 3, cocheraMes: 120000, otrosFijosMes: 40000,
    consumoL100: 10, precioCombustible: ref('nafta_super'), cubiertasCantidad: 4, cubiertaPrecio: ref('cubierta_utilitario'), cubiertaVidaKm: 45000,
    mantenimientoKm: 80, peajesRecorrido: 0,
    kmRecorrido: 120, horasRecorrido: 9, paradasRecorrido: 60, paquetesRecorrido: 65, recorridosMes: 24 };
  var PRESETS_RECORRIDO = [
    { id: 'utilitario', nombre: 'Utilitario de última milla (nafta) · chofer valuado a Camioneros', valores: conPersonal(UTILITARIO, PERSONAL_CONVENIO) },
    { id: 'flexero', nombre: 'Repartidor Flex con su propio utilitario (monotributo, sin chofer)',
      valores: conPersonal(UTILITARIO, { choferHora: 0, acompanantes: 0, acompananteHora: HORA_PEON, otrosFijosMes: 40000 + ref('monotributo_servicios') }) },
    { id: 'moto', nombre: 'Moto 110 cc de reparto · chofer valuado a Camioneros (1ª, con comida y viático)', valores: conPersonal({
      valorVehiculo: ref('moto_valor'), residualPct: 25, vidaAnios: 3, seguroMes: 18000, patentePct: 2, cocheraMes: 30000, otrosFijosMes: 15000,
      consumoL100: 2.5, precioCombustible: ref('nafta_super'), cubiertasCantidad: 2, cubiertaPrecio: 55000, cubiertaVidaKm: 15000,
      mantenimientoKm: 25, peajesRecorrido: 0,
      kmRecorrido: 90, horasRecorrido: 8, paradasRecorrido: 35, paquetesRecorrido: 35, recorridosMes: 24 }, PERSONAL_CONVENIO),
      refs: { valorVehiculo: 'moto_valor', cubiertaPrecio: 'supuestos_vehiculo' } },
    { id: 'camion', nombre: 'Camión troncal (tractor y semi, gasoil) · sin viático por km ni pernocte (v1)', valores: conPersonal({
      valorVehiculo: ref('camion_valor'), residualPct: 30, vidaAnios: 8, seguroMes: 650000, patentePct: 2.5, cocheraMes: 200000, otrosFijosMes: 150000,
      consumoL100: 36, precioCombustible: ref('gasoil'), cubiertasCantidad: 18, cubiertaPrecio: 750000, cubiertaVidaKm: 120000,
      mantenimientoKm: 180, peajesRecorrido: 60000,
      kmRecorrido: 640, horasRecorrido: 11, paradasRecorrido: 2, paquetesRecorrido: 4000, recorridosMes: 22 }, PERSONAL_CONVENIO),
      refs: { valorVehiculo: 'camion_valor', precioCombustible: 'gasoil', cubiertaPrecio: 'supuestos_vehiculo' } }
  ];
  function deP(id, campo) { return PRESETS_RECORRIDO[0].valores[campo]; }

  var RUBRO_FADEEAC = {
    combustible: 'Combustible', neumaticos: 'Neumáticos', reparaciones: 'Reparaciones', materialRodante: 'Material rodante',
    personal: 'Personal', seguros: 'Seguros', patentes: 'Patentes y tasas', costoFinanciero: 'Costo financiero',
    peaje: 'Peaje', cocheraYOtros: 'Gastos generales', gastosGenerales: 'Gastos generales'
  };
  var NOMBRE_PARTE = {
    combustible: 'Combustible', neumaticos: 'Neumáticos', reparaciones: 'Reparaciones, mantenimiento y lubricantes',
    materialRodante: 'Material rodante (amortización)', personal: 'Personal (chofer y acompañantes)', seguros: 'Seguros',
    patentes: 'Patentes y tasas', costoFinanciero: 'Costo financiero del vehículo', peaje: 'Peajes',
    cocheraYOtros: 'Cochera y otros fijos', gastosGenerales: 'Gastos generales y administración'
  };
  function variacionFadeeac(rubro) {
    var d = REF.REFERENCIAS.ict_fadeeac.detalle.filter(function (x) { return x.rubro === rubro; })[0];
    return d ? d.mensual : NaN;
  }

  var recorrido = {
    id: 'recorrido', numero: 2, archivo: 'costo-por-recorrido.html',
    titulo: 'Costo por recorrido (troncal y última milla)',
    corto: 'Costo por recorrido',
    decision: 'Cuánto te cuesta de verdad cada recorrido: por km, por hora, por parada y por paquete.',
    presets: PRESETS_RECORRIDO, presetInicial: 'utilitario',
    grupos: [
      { titulo: 'Vehículo (costos fijos)', campos: [
        { id: 'valorVehiculo', etiqueta: 'Valor del vehículo (nuevo, o lo que vale hoy el tuyo si es usado)', unidad: '$', defecto: deP(0, 'valorVehiculo'), ref: 'utilitario_valor',
          ayuda: 'Valor de reposición: lo que costaría comprarlo hoy. Los ejemplos usan el 0 km; si tu vehículo es usado, poné lo que vale hoy y los años que le quedan de uso.' },
        { id: 'residualPct', etiqueta: 'Valor de reventa al final', unidad: '% del valor', defecto: 35, ref: 'supuestos_vehiculo', max: 100 },
        { id: 'vidaAnios', etiqueta: 'Años de uso', unidad: 'años', defecto: 5, ref: 'supuestos_vehiculo', min: 1 },
        { id: 'tasaCapitalPct', etiqueta: 'Costo del capital inmovilizado', unidad: '% anual real', defecto: ref('tasa_capital'), ref: 'tasa_capital',
          ayuda: 'Lo que ganarías con esa plata en una inversión segura en dólares.' },
        { id: 'seguroMes', etiqueta: 'Seguro', unidad: '$ por mes', defecto: 110000, ref: 'supuestos_vehiculo' },
        { id: 'patentePct', etiqueta: 'Patente', unidad: '% del valor por año', defecto: 3, ref: 'supuestos_vehiculo' },
        { id: 'cocheraMes', etiqueta: 'Cochera', unidad: '$ por mes', defecto: 120000, ref: 'supuestos_vehiculo' },
        { id: 'otrosFijosMes', etiqueta: 'Otros fijos (rastreo, VTV, lavado)', unidad: '$ por mes', defecto: 40000, ref: 'supuestos_vehiculo' }
      ] },
      { titulo: 'Costos por kilómetro', campos: [
        { id: 'consumoL100', etiqueta: 'Consumo', unidad: 'litros cada 100 km', defecto: 10, ref: 'supuestos_vehiculo',
          ayuda: 'En reparto urbano, con paradas, se consume más que lo que dice la ficha.' },
        { id: 'precioCombustible', etiqueta: 'Precio del combustible', unidad: '$ por litro', defecto: ref('nafta_super'), ref: 'nafta_super' },
        { id: 'cubiertasCantidad', etiqueta: 'Cantidad de cubiertas', unidad: 'cubiertas', defecto: 4, ref: 'supuestos_vehiculo' },
        { id: 'cubiertaPrecio', etiqueta: 'Precio por cubierta', unidad: '$', defecto: ref('cubierta_utilitario'), ref: 'cubierta_utilitario' },
        { id: 'cubiertaVidaKm', etiqueta: 'Duración de las cubiertas', unidad: 'km', defecto: 45000, ref: 'supuestos_vehiculo', min: 1 },
        { id: 'mantenimientoKm', etiqueta: 'Mantenimiento, reparaciones y lubricantes', unidad: '$ por km', defecto: 80, ref: 'supuestos_vehiculo' },
        { id: 'peajesRecorrido', etiqueta: 'Peajes', unidad: '$ por recorrido', defecto: 0, ref: 'supuestos_vehiculo' }
      ] },
      { titulo: 'Personal', campos: [
        { id: 'choferHora', etiqueta: 'Costo del chofer', unidad: '$ por hora productiva', defecto: HORA_CONDUCTOR, calculado: 3,
          ayuda: 'Por defecto, un conductor de 1ª de Camioneros con cargas, aguinaldo, vacaciones, comida y viático especial de corta distancia (calculadora 3). Es un supuesto: si reparte un mensajero en moto (CCT 722/15) o un monotributista, cargá su costo por hora; si manejás vos, poné 0 y mirá en la calculadora 1 lo que te queda. Larga distancia (viático por km y pernocte) todavía no está incluida.',
          importar: importarHora },
        { id: 'acompanantes', etiqueta: 'Acompañantes', unidad: 'personas', defecto: 0 },
        { id: 'acompananteHora', etiqueta: 'Costo de cada acompañante', unidad: '$ por hora productiva', defecto: HORA_PEON, calculado: 3,
          visible: function (v) { return v.acompanantes > 0; }, importar: importarHora }
      ] },
      { titulo: 'El recorrido', campos: [
        { id: 'kmRecorrido', etiqueta: 'Km por recorrido', unidad: 'km', defecto: 120, ref: 'supuestos_vehiculo' },
        { id: 'horasRecorrido', etiqueta: 'Horas por recorrido', unidad: 'horas', defecto: 9, ref: 'supuestos_vehiculo',
          ayuda: 'Se multiplican por el costo por hora productiva del chofer, que ya reparte las pausas: si cargás horas de presencia (con pausas), el personal queda algo alto. Horas extra y jornadas de más de 8 horas: a validar.' },
        { id: 'paradasRecorrido', etiqueta: 'Paradas por recorrido', unidad: 'paradas', defecto: 60, ref: 'supuestos_vehiculo' },
        { id: 'paquetesRecorrido', etiqueta: 'Paquetes o bultos por recorrido', unidad: 'unidades', defecto: 65, ref: 'supuestos_vehiculo' },
        { id: 'recorridosMes', etiqueta: 'Recorridos por mes', unidad: 'recorridos', defecto: 24, ref: 'supuestos_vehiculo', min: 1,
          ayuda: 'Reparte los costos fijos: con más recorridos, cada uno sale más barato.' },
        { id: 'gastosGeneralesPct', etiqueta: 'Gastos generales y administración', unidad: '% sobre el resto', defecto: 8, ref: 'supuestos_vehiculo' }
      ] },
      { titulo: 'Del costo al precio', abierto: false, campos: CAMPOS_PRECIO }
    ],
    calcular: function (v) { return C.costoRecorrido(v); },
    principal: function (r, v, h) {
      return { etiqueta: 'Costo por recorrido', valor: h.p(r.total),
        sub: h.p(r.porKm) + ' por km · ' + h.p(r.porPaquete) + ' por paquete · ' + h.p(r.porHora) + ' por hora · ' + h.u(r.total) +
          (r.partes.personal > 0 ? ' · incluye personal: ' + h.p(r.partes.personal) + ' (' + h.pc(r.partes.personal / r.total * 100, 0) + ')' : ' · sin chofer pago') };
    },
    tarjetas: function (r, v, h) {
      return [
        { etiqueta: 'Por km', valor: h.p(r.porKm), nota: 'Sin personal: ' + h.p(r.sinPersonalPorKm) + ' por km' },
        { etiqueta: 'Por hora', valor: h.p(r.porHora), nota: h.n(v.horasRecorrido, 1) + ' h por recorrido' },
        { etiqueta: 'Por parada', valor: h.p(r.porParada), nota: h.n(v.paradasRecorrido, 0) + ' paradas' },
        { etiqueta: 'Por paquete', valor: h.p(r.porPaquete), nota: h.n(v.paquetesRecorrido, 0) + ' paquetes o bultos' },
        { etiqueta: 'Por mes', valor: h.p(r.costoMes), nota: h.u(r.costoMes) + ' · ' + h.n(r.kmMes, 0) + ' km' },
        { etiqueta: 'Fijos del vehículo por mes', valor: h.p(r.fijosMes), nota: h.p(r.fijoRecorrido) + ' por recorrido' }
      ];
    },
    desglose: function (r, v, h) {
      var claves = ['personal', 'combustible', 'neumaticos', 'reparaciones', 'materialRodante', 'costoFinanciero', 'seguros', 'patentes', 'peaje', 'cocheraYOtros', 'gastosGenerales'];
      return [{
        titulo: 'Estructura del costo (con los rubros del índice FADEEAC)',
        columnas: ['Rubro', 'Por recorrido', '% del total', 'Por km', 'Variación FADEEAC sep-2026'],
        filas: claves.map(function (k) {
          var x = r.partes[k];
          return [NOMBRE_PARTE[k], h.p(x), h.pc(x / r.total * 100), h.p(x / v.kmRecorrido), h.pc(variacionFadeeac(RUBRO_FADEEAC[k]), 2)];
        }),
        pie: ['Total', h.p(r.total), '100 %', h.p(r.porKm), h.pc(ref('ict_fadeeac'), 2) + ' (general)']
      }, {
        titulo: 'Tarifario mínimo sugerido (elegí una sola forma de cobrar)',
        nota: 'Precio mínimo = costo ÷ (1 − margen − impuestos), con margen ' + h.pc(v.margenPct, 0) + ' e impuestos ' + h.pc(v.impuestosPct, 1) + ' sobre lo facturado. En la misma base que tus costos (con IVA si sos monotributista; si sos responsable inscripto, el precio va sin IVA y el IVA se suma en la factura). Vale para este recorrido.',
        columnas: ['Forma de cobro', 'Costo', 'Precio mínimo'],
        filas: [
          ['Por viaje', h.p(r.total), h.p(r.tarifario.viaje)],
          ['Por km', h.p(r.porKm), h.p(r.tarifario.km)],
          ['Por hora', h.p(r.porHora), h.p(r.tarifario.hora)],
          ['Por paquete', h.p(r.porPaquete), h.p(r.tarifario.paquete)]
        ]
      }];
    },
    sensibilidad: {
      titulo: 'Qué pasa si cambia…',
      columnas: [
        { campo: 'paquetesRecorrido', etiqueta: 'Paquetes por recorrido → costo por paquete', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.porPaquete); } },
        { campo: 'precioCombustible', etiqueta: 'Combustible → costo por km', entrada: function (x, h) { return h.p(x); }, salida: function (r, h) { return h.p(r.porKm); } },
        { campo: 'recorridosMes', etiqueta: 'Recorridos por mes → costo por recorrido', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.total); } },
        { campo: 'choferHora', etiqueta: 'Costo del chofer → costo por recorrido', entrada: function (x, h) { return h.p(x); }, salida: function (r, h) { return h.p(r.total); } }
      ]
    },
    pasos: function (r, v, h) {
      return [
        'Amortización = ' + h.p(v.valorVehiculo) + ' × (1 − ' + h.pc(v.residualPct, 0) + ') ÷ (' + h.n(v.vidaAnios, 0) + ' años × 12) = <b>' + h.p(r.amortizacionMes) + ' por mes</b>.',
        'Costo del capital = ' + h.p(v.valorVehiculo) + ' × (1 + ' + h.pc(v.residualPct, 0) + ') ÷ 2 × ' + h.pc(v.tasaCapitalPct, 0) + ' ÷ 12 = <b>' + h.p(r.capitalMes) + ' por mes</b> (sobre el capital promedio).',
        'Patente = ' + h.p(v.valorVehiculo) + ' × ' + h.pc(v.patentePct) + ' ÷ 12 = ' + h.p(r.patenteMes) + '. Fijos = amortización + capital + patente + seguro + cochera + otros = <b>' + h.p(r.fijosMes) + ' por mes</b> → ÷ ' + h.n(v.recorridosMes, 0) + ' recorridos = <b>' + h.p(r.fijoRecorrido) + '</b>.',
        'Combustible = ' + h.n(v.consumoL100) + ' L ÷ 100 × ' + h.p(v.precioCombustible) + ' = ' + h.p(r.combustibleKm) + ' por km. Cubiertas = ' + h.n(v.cubiertasCantidad, 0) + ' × ' + h.p(v.cubiertaPrecio) + ' ÷ ' + h.n(v.cubiertaVidaKm, 0) + ' km = ' + h.p(r.cubiertasKm) + ' por km. Más mantenimiento ' + h.p(v.mantenimientoKm) + ' = <b>' + h.p(r.variableKm) + ' por km</b>.',
        'Variable del recorrido = ' + h.p(r.variableKm) + ' × ' + h.n(v.kmRecorrido, 0) + ' km + peajes ' + h.p(v.peajesRecorrido) + ' = <b>' + h.p(r.variableRecorrido) + '</b>.',
        'Personal = ' + h.n(v.horasRecorrido, 1) + ' h × (' + h.p(v.choferHora) + (v.acompanantes > 0 ? ' + ' + h.n(v.acompanantes, 0) + ' × ' + h.p(v.acompananteHora) : '') + ') = <b>' + h.p(r.personalRecorrido) + '</b>.',
        'Subtotal = ' + h.p(r.fijoRecorrido) + ' + ' + h.p(r.variableRecorrido) + ' + ' + h.p(r.personalRecorrido) + ' = ' + h.p(r.subtotal) + '; gastos generales ' + h.pc(v.gastosGeneralesPct, 0) + ' = ' + h.p(r.partes.gastosGenerales) + '. <b>Total = ' + h.p(r.total) + '</b>.',
        'Por km = ' + h.p(r.total) + ' ÷ ' + h.n(v.kmRecorrido, 0) + ' = <b>' + h.p(r.porKm) + '</b>; por hora ÷ ' + h.n(v.horasRecorrido, 1) + ' = ' + h.p(r.porHora) + '; por parada ÷ ' + h.n(v.paradasRecorrido, 0) + ' = ' + h.p(r.porParada) + '; por paquete ÷ ' + h.n(v.paquetesRecorrido, 0) + ' = <b>' + h.p(r.porPaquete) + '</b>.',
        'Precio mínimo por viaje = ' + h.p(r.total) + ' ÷ (1 − ' + h.pc(v.margenPct, 0) + ' − ' + h.pc(v.impuestosPct, 1) + ') = <b>' + h.p(r.tarifario.viaje) + '</b> (por paquete, ' + h.p(r.tarifario.paquete) + ').'
      ];
    },
    refsExtra: ['moto_valor', 'camion_valor', 'gasoil', 'monotributo_servicios', 'cct40_conductor_1', 'cct40_peon', 'cct40_comida', 'cct40_viatico_especial', 'ict_fadeeac', 'ict_fadeeac_12m', 'cedol_distribucion_urbana']
  };

  /* ════════════════════════════ 3. Costo laboral ════════════════════════════ */
  var laboral = {
    id: 'laboral', numero: 3, archivo: 'costo-laboral.html',
    titulo: 'Costo laboral por operario',
    corto: 'Costo laboral',
    decision: 'Cuánto cuesta de verdad una persona por mes y por hora productiva, con cargas, aguinaldo, vacaciones y ausencias.',
    presets: PRESETS_LABORAL, presetInicial: 'c40_conductor1',
    grupos: [
      { titulo: 'Sueldo de convenio', campos: [
        { id: 'basico', etiqueta: 'Sueldo básico', unidad: '$ por mes', defecto: ref('cct40_conductor_1'), ref: 'cct40_conductor_1',
          ayuda: 'Elegí arriba una categoría o cargá el básico de tu convenio.' },
        { id: 'antiguedadAnios', etiqueta: 'Antigüedad', unidad: 'años', defecto: 0 },
        { id: 'antiguedadPct', etiqueta: 'Adicional por antigüedad', unidad: '% por año', defecto: ref('cct40_antiguedad'), ref: 'cct40_antiguedad' },
        { id: 'presentismoPct', etiqueta: 'Presentismo', unidad: '% de básico + antigüedad', defecto: 0, ref: 'cct130_presentismo',
          ayuda: 'Comercio: 8,33% (art. 40). Camioneros: 0 en este ejemplo.' },
        { id: 'adicionalesRem', etiqueta: 'Otros adicionales remunerativos', unidad: '$ por mes', defecto: 0,
          ayuda: 'Horas extra promedio, adicionales por tarea, premios que pagan cargas.' }
      ] },
      { titulo: 'Sumas no remunerativas y viáticos', campos: [
        { id: 'noRem', etiqueta: 'Suma fija no remunerativa', unidad: '$ por mes', defecto: 0, ref: 'cct130_no_remunerativa' },
        { id: 'noRemIntegra', tipo: 'si_no', etiqueta: 'La suma cuenta para antigüedad, presentismo, aguinaldo y vacaciones', defecto: false },
        { id: 'noRemContribPct', etiqueta: 'Contribución que paga la suma no remunerativa', unidad: '%', defecto: 0,
          ayuda: 'En Comercio paga la obra social (6%).' },
        { id: 'viaticoDia', etiqueta: 'Comida por día trabajado (no remunerativa)', unidad: '$ por día', defecto: ref('cct40_comida'), ref: 'cct40_comida',
          ayuda: 'Camioneros, ítem 4.1.12: todo el personal salvo larga distancia, por cada día efectivamente trabajado. No paga cargas sociales.' },
        { id: 'viaticoEspecialDia', etiqueta: 'Viático especial por día trabajado (no remunerativo)', unidad: '$ por día', defecto: ref('cct40_viatico_especial'), ref: 'cct40_viatico_especial',
          ayuda: 'Camioneros, ítem 4.1.13: con la misma regla que la comida. No paga cargas sociales.' }
      ] },
      { titulo: 'Cargas del empleador', campos: [
        { id: 'contribucionesPct', tipo: 'opciones', etiqueta: 'Régimen de contribuciones', defecto: ref('contrib_general'), ref: 'contrib_general', opciones: [
          { valor: ref('contrib_general'), texto: '18% · régimen general (la mayoría de las pymes)', ref: 'contrib_general' },
          { valor: ref('contrib_grandes'), texto: '20,4% · grandes empresas de servicios o comercio', ref: 'contrib_grandes' },
          { valor: ref('contrib_rifl'), texto: '5% · alta nueva con el RIFL (48 meses)', ref: 'contrib_rifl' },
          { valor: ref('contrib_rifl_fal_pyme'), texto: '7,5% · RIFL + FAL de pyme (desde noviembre de 2026)', ref: 'contrib_rifl_fal_pyme' }],
          ayuda: 'Desde el devengado de noviembre de 2026, el Fondo de Asistencia Laboral (FAL) ya está dentro del 18% y del 20,4%; con el RIFL se paga aparte (pyme 2,5%; gran empresa 1%: 6% en total).' },
        { id: 'obraSocialPct', etiqueta: 'Obra social', unidad: '%', defecto: ref('obra_social'), ref: 'obra_social' },
        { id: 'detraccion', etiqueta: 'Detracción por trabajador', unidad: '$ por mes', defecto: ref('detraccion'), ref: 'detraccion' },
        { id: 'artPct', etiqueta: 'ART (alícuota variable)', unidad: '%', defecto: ref('art_alicuota'), ref: 'art_alicuota',
          ayuda: 'Cambia mucho según actividad y siniestralidad: poné la de tu contrato.' },
        { id: 'artFija', etiqueta: 'ART (suma fija)', unidad: '$ por mes', defecto: ref('art_suma_fija'), ref: 'art_suma_fija' },
        { id: 'seguroVida', etiqueta: 'Seguro de vida obligatorio', unidad: '$ por mes', defecto: ref('seguro_vida'), ref: 'seguro_vida' },
        { id: 'aportesConvenio', etiqueta: 'Aportes de convenio a cargo de la empresa', unidad: '$ por mes', defecto: ref('cct40_obra_social_empresa'), ref: 'cct40_obra_social_empresa',
          ayuda: 'Camioneros: contribución a la obra social del sindicato. Comercio: contribución extraordinaria a OSECAC (a confirmar).' }
      ] },
      { titulo: 'Jornada y ausencias', campos: [
        { id: 'horasSemana', etiqueta: 'Horas por semana', unidad: 'horas', defecto: ref('jornada_pactada'), ref: 'jornada_pactada',
          ayuda: '48 es el tope legal y la base de la planilla de Camioneros. Si tu jornada es menor (por ejemplo, 44 o 45 horas en 5 días), cargala.' },
        { id: 'diasSemana', etiqueta: 'Días por semana', unidad: 'días', defecto: 6, min: 1, max: 7 },
        { id: 'vacacionesDias', etiqueta: 'Vacaciones', unidad: 'días corridos por año', defecto: ref('vacaciones_minimo'), ref: 'vacaciones_minimo',
          ayuda: 'LCT art. 150: 14 días hasta 5 años de antigüedad; 21 hasta 10; 28 hasta 20; 35 con más de 20.' },
        { id: 'feriados', etiqueta: 'Feriados en días laborables', unidad: 'días por año', defecto: ref('feriados_2026'), ref: 'feriados_2026',
          ayuda: 'Con semana de 5 días, en 2026 son 15. Comercio: el 26 de septiembre (Día del Empleado de Comercio) se trata como feriado y en 2026 cae sábado; con semana de 6 días, sumá uno. Camioneros: el 15 de diciembre (Día del Trabajador Camionero), si se trabaja, se paga con recargo.' },
        { id: 'ausentismoPct', etiqueta: 'Ausentismo', unidad: '% de los días', defecto: ref('ausentismo'), ref: 'ausentismo', max: 100 },
        { id: 'improductivoPct', etiqueta: 'Tiempo no productivo en la jornada', unidad: '% de las horas', defecto: ref('improductivo'), ref: 'improductivo', max: 100,
          ayuda: 'Pausas, arranque, cierre, esperas.' }
      ] }
    ],
    calcular: function (v) { return C.costoLaboral(v); },
    principal: function (r, v, h) {
      return { etiqueta: 'Costo mensual total', valor: h.p(r.total),
        sub: h.u(r.total) + ' · ' + h.p(r.costoHoraProductiva) + ' por hora productiva · ' + h.n(r.factorSobreBasico, 2) + ' veces el básico' };
    },
    tarjetas: function (r, v, h) {
      var t = [
        { etiqueta: 'Por hora productiva', valor: h.p(r.costoHoraProductiva), nota: 'Es el que usan las calculadoras 2, 4 y 5.' },
        { etiqueta: 'Por hora pagada', valor: h.p(r.costoHoraPagada), nota: h.n(r.horasPagadasMes, 1) + ' h pagadas por mes' },
        { etiqueta: 'Por día presente', valor: h.p(r.costoDiaPresente), nota: h.n(r.diasTrabajadosMes, 1) + ' días trabajados por mes' },
        { etiqueta: 'Horas productivas por mes', valor: h.n(r.horasProductivasMes, 1) + ' h', nota: 'De ' + h.n(r.horasPagadasMes, 1) + ' pagadas (' + h.pc(r.horasProductivasMes / r.horasPagadasMes * 100, 0) + ')' },
        { etiqueta: 'Cargas del empleador', valor: h.p(r.cargas), nota: h.pc(r.cargas / r.sueldoBruto * 100) + ' sobre el sueldo bruto (remunerativo + no remunerativo, antes de los aportes del trabajador)' }
      ];
      if (v.vacacionesDias < r.vacacionesLey) {
        t.push({ etiqueta: 'Vacaciones según la antigüedad', valor: h.n(r.vacacionesLey, 0) + ' días', estado: 'atencion',
          nota: 'Con ' + h.n(v.antiguedadAnios, 0) + ' años de antigüedad, la LCT (art. 150) da ' + h.n(r.vacacionesLey, 0) + ' días y cargaste ' + h.n(v.vacacionesDias, 0) + ': cambialo en «Vacaciones».' });
      }
      return t;
    },
    desglose: function (r, v, h) {
      var filas = [
        ['Básico y adicionales remunerativos', r.remunerativo], ['Suma no remunerativa', r.noRemunerativo],
        ['Aguinaldo (SAC, 1/12)', r.sacMes], ['Plus de vacaciones (día ÷ 25)', r.plusVacacionesMes],
        ['Comida', r.comidaMes], ['Viático especial', r.viaticoEspecialMes], ['Contribuciones a la seguridad social', r.contribuciones],
        ['Obra social', r.obraSocial], ['Contribución sobre lo no remunerativo', r.contribNoRem],
        ['ART', r.art], ['Seguro de vida obligatorio', r.seguroVida], ['Aportes de convenio de la empresa', r.aportesConvenio]
      ].filter(function (f) { return f[1] !== 0; });
      return [{
        titulo: 'Desglose del costo mensual',
        columnas: ['Concepto', 'Por mes', 'Por hora productiva', '% del total'],
        filas: filas.map(function (f) { return [f[0], h.p(f[1]), h.p(f[1] / r.horasProductivasMes), h.pc(f[1] / r.total * 100)]; }),
        pie: ['Total', h.p(r.total), h.p(r.costoHoraProductiva), '100 %']
      }];
    },
    sensibilidad: {
      titulo: 'Qué pasa si cambia…',
      columnas: [
        { campo: 'basico', etiqueta: 'Básico → costo mensual', entrada: function (x, h) { return h.p(x); }, salida: function (r, h) { return h.p(r.total); } },
        { campo: 'ausentismoPct', etiqueta: 'Ausentismo → costo por hora productiva', entrada: function (x, h) { return h.pc(x); }, salida: function (r, h) { return h.p(r.costoHoraProductiva); } },
        { campo: 'improductivoPct', etiqueta: 'Tiempo no productivo → costo por hora productiva', entrada: function (x, h) { return h.pc(x); }, salida: function (r, h) { return h.p(r.costoHoraProductiva); } },
        { campo: 'viaticoDia', etiqueta: 'Comida por día → costo mensual', entrada: function (x, h) { return h.p(x); }, salida: function (r, h) { return h.p(r.total); } }
      ]
    },
    pasos: function (r, v, h) {
      var fa = (1 + v.antiguedadAnios * v.antiguedadPct / 100) * (1 + v.presentismoPct / 100);
      return [
        'Remunerativo = ' + h.p(v.basico) + ' × (1 + ' + h.n(v.antiguedadAnios, 0) + ' años × ' + h.pc(v.antiguedadPct, 0) + ') × (1 + ' + h.pc(v.presentismoPct, 2) + ') + ' + h.p(v.adicionalesRem) + ' = <b>' + h.p(r.remunerativo) + '</b> (factor ' + h.n(fa, 4) + ').',
        'No remunerativo = ' + h.p(v.noRem) + (v.noRemIntegra ? ' × ' + h.n(fa, 4) : '') + ' = <b>' + h.p(r.noRemunerativo) + '</b>.',
        'Aguinaldo = (remunerativo' + (v.noRemIntegra ? ' + no remunerativo' : '') + ') ÷ 12 = <b>' + h.p(r.sacMes) + '</b>. Plus de vacaciones = base × ' + h.n(v.vacacionesDias, 0) + ' días × (1/25 − 1/30) ÷ 12 = <b>' + h.p(r.plusVacacionesMes) + '</b>.',
        'Base de contribuciones = remunerativo + su aguinaldo + su plus de vacaciones = <b>' + h.p(r.baseContribuciones) + '</b>.',
        'Seguridad social = (' + h.p(r.baseContribuciones) + ' − ' + h.p(v.detraccion) + ') × ' + h.pc(v.contribucionesPct) + ' = ' + h.p(r.contribuciones) + '. Obra social = base × ' + h.pc(v.obraSocialPct, 0) + ' = ' + h.p(r.obraSocial) + '. ART = base × ' + h.pc(v.artPct) + ' + ' + h.p(v.artFija) + ' = ' + h.p(r.art) + '.',
        'Días presentes por año = (' + h.n(v.diasSemana, 0) + ' × 365 ÷ 7 − ' + h.n(v.vacacionesDias, 0) + ' × ' + h.n(v.diasSemana, 0) + ' ÷ 7 − ' + h.n(v.feriados, 0) + ' feriados) × (1 − ' + h.pc(v.ausentismoPct) + ') = ' + h.n(r.diasTrabajadosMes * 12, 1) + ' → <b>' + h.n(r.diasTrabajadosMes, 2) + ' por mes</b>. Comida y viático = (' + h.p(v.viaticoDia) + ' + ' + h.p(v.viaticoEspecialDia) + ') × ' + h.n(r.diasTrabajadosMes, 2) + ' = ' + h.p(r.viaticosMes) + '.',
        'Total = remunerativo + no remunerativo + aguinaldo + plus + comida y viático + cargas (' + h.p(r.cargas) + ') = <b>' + h.p(r.total) + '</b>.',
        'Horas productivas = ' + h.n(r.diasTrabajadosMes, 2) + ' días × ' + h.n(r.horasDia, 2) + ' h × (1 − ' + h.pc(v.improductivoPct) + ') = ' + h.n(r.horasProductivasMes, 1) + ' h. <b>Costo por hora productiva = ' + h.p(r.costoHoraProductiva) + '</b>.'
      ];
    },
    refsExtra: ['cct40_conductor_2', 'cct40_conductor_3', 'cct40_peon', 'cct130_maestranza_a', 'cct130_auxiliar_a', 'cct130_administrativo_a', 'cct130_antiguedad', 'cct130_osecac_extra', 'contrib_grandes', 'contrib_rifl', 'contrib_rifl_fal_pyme', 'jornada_maxima']
  };

  /* ════════════════════════════ 4. Costo por paquete clasificado ════════════════════════════ */
  var importarHorasDia = { desde: 'laboral', texto: 'Traer de la calculadora 3', salida: function (r) { return Math.round(r.horasProductivasMes / r.diasTrabajadosMes * 10) / 10; } };

  var hub = {
    id: 'hub', numero: 4, archivo: 'costo-clasificacion.html',
    titulo: 'Costo por paquete clasificado (hub de media y última milla)',
    corto: 'Costo de clasificación',
    decision: 'Cuántas personas necesitás por turno para tu volumen y cuánto te cuesta cada paquete que pasa por el hub.',
    grupos: [
      { titulo: 'Volumen y turno', campos: [
        { id: 'paquetesTurno', etiqueta: 'Paquetes por turno', unidad: 'paquetes', defecto: 8000, ref: 'supuestos_hub' },
        { id: 'horasProdTurno', etiqueta: 'Horas productivas por persona y turno', unidad: 'horas', defecto: HORAS_PROD_DIA_PEON, calculado: 3, min: 0.5,
          ayuda: 'Las horas que de verdad produce cada persona presente. Las pausas ya están en el costo hora.', importar: importarHorasDia },
        { id: 'turnosMes', etiqueta: 'Turnos por mes (todo el hub)', unidad: 'turnos', defecto: 26, ref: 'supuestos_hub', min: 1,
          ayuda: 'Reparte el espacio, los equipos, los sistemas y la estructura.' },
        { id: 'polivalente', tipo: 'si_no', etiqueta: 'El personal rota entre procesos', defecto: false,
          ayuda: 'Si cada persona hace un solo proceso, se suman las cuadrillas. Si rotan, alcanza con las horas-hombre totales (y la cuadrilla más grande que trabaja a la vez).' }
      ] },
      { titulo: 'Productividad por puesto', campos: [
        { id: 'prodInduccion', etiqueta: 'Descarga e inducción', unidad: 'paquetes por hora productiva', defecto: 500, ref: 'prod_otros', ayuda: 'Poné 0 si el proceso no existe.' },
        { id: 'prodClasificacion', etiqueta: 'Clasificación por ruta', unidad: 'paquetes por hora productiva', defecto: ref('prod_clasificacion'), ref: 'prod_clasificacion',
          ayuda: 'Por hora productiva (sin pausas), porque el costo hora ya las reparte. Si tu dato es por hora trabajada (todas las horas del turno), multiplicalo por 1,14 (= 1 ÷ 0,875).' },
        { id: 'prodCarga', etiqueta: 'Armado de rutas y carga', unidad: 'paquetes por hora productiva', defecto: 300, ref: 'prod_otros' },
        { id: 'retrabajoPct', etiqueta: 'Re-trabajo (paquetes que se clasifican dos veces)', unidad: '% del volumen', defecto: 3, ref: 'prod_otros', max: 100 },
        { id: 'ventanaInduccion', etiqueta: 'Ventana de la descarga e inducción', unidad: 'horas productivas dentro del turno', defecto: 0, ref: 'supuestos_hub',
          ayuda: '0 = todo el turno. Si un proceso tiene que hacerse en menos horas (por ejemplo, la carga antes de que salgan las rutas), hace falta más gente a la vez.' },
        { id: 'ventanaClasificacion', etiqueta: 'Ventana de la clasificación', unidad: 'horas productivas dentro del turno', defecto: 0, ref: 'supuestos_hub' },
        { id: 'ventanaCarga', etiqueta: 'Ventana del armado de rutas y carga', unidad: 'horas productivas dentro del turno', defecto: 0, ref: 'supuestos_hub' }
      ] },
      { titulo: 'Personal', campos: [
        { id: 'costoHora', etiqueta: 'Costo del operario', unidad: '$ por hora productiva', defecto: HORA_PEON, calculado: 3,
          ayuda: 'Por defecto, un peón de Camioneros sin comida ni viático (calculadora 3; si los cobra, es una duda abierta).', importar: importarHora },
        { id: 'operariosPorSupervisor', etiqueta: 'Operarios por supervisor', unidad: 'personas', defecto: 15, ref: 'supuestos_hub' },
        { id: 'factorSupervisor', etiqueta: 'Costo del supervisor', unidad: 'veces el del operario', defecto: 1.4, ref: 'supuestos_hub' }
      ] },
      { titulo: 'Espacio, equipos y sistemas', campos: [
        { id: 'm2', etiqueta: 'Superficie del hub', unidad: 'm²', defecto: 2500, ref: 'supuestos_hub' },
        { id: 'alquilerUsdM2', etiqueta: 'Alquiler', unidad: 'USD por m² por mes', defecto: ref('alquiler_logistico'), ref: 'alquiler_logistico' },
        { id: 'serviciosM2', etiqueta: 'Servicios del edificio', unidad: '$ por m² por mes', defecto: ref('servicios_edificio'), ref: 'servicios_edificio' },
        { id: 'equiposInversion', etiqueta: 'Equipos (inversión total)', unidad: '$', defecto: 45000000, ref: 'supuestos_hub' },
        { id: 'equiposVidaAnios', etiqueta: 'Vida útil de los equipos', unidad: 'años', defecto: 5, ref: 'supuestos_hub', min: 1 },
        { id: 'equiposMantPct', etiqueta: 'Mantenimiento de equipos', unidad: '% de la inversión por año', defecto: 10, ref: 'supuestos_hub' },
        { id: 'tasaCapitalPct', etiqueta: 'Costo del capital', unidad: '% anual real', defecto: ref('tasa_capital'), ref: 'tasa_capital' },
        { id: 'sistemasMes', etiqueta: 'Sistemas y software', unidad: '$ por mes', defecto: 500000, ref: 'supuestos_hub' },
        { id: 'insumosPaquete', etiqueta: 'Insumos (etiquetas, precintos)', unidad: '$ por paquete', defecto: 60, ref: 'supuestos_hub' },
        { id: 'estructuraMes', etiqueta: 'Estructura y administración (jefe de operaciones, administración, seguros)', unidad: '$ por mes', defecto: 0,
          ayuda: 'El ejemplo no la incluye. Cargala para comparar con la calculadora 5, que sí tiene estructura.' }
      ] }
    ],
    calcular: function (v) { return C.costoClasificacion(v); },
    principal: function (r, v, h) {
      return { etiqueta: 'Costo por paquete clasificado', valor: h.p(r.porPaquete),
        sub: h.n(r.operarios, 0) + ' operarios' + (r.polivalente ? ' que rotan' : '') + ' y ' + h.n(r.supervisores, 0) + (r.supervisores === 1 ? ' supervisor' : ' supervisores') + ' por turno · ' + h.p(r.totalTurno) + ' por turno · ' + h.u(r.totalMes) + ' por mes' };
    },
    tarjetas: function (r, v, h) {
      return [
        { etiqueta: 'Personas por turno', valor: h.n(r.personasTurno, 0), nota: h.n(r.operarios, 0) + ' operarios + ' + h.n(r.supervisores, 0) + ' de supervisión. ' +
          (r.polivalente ? 'Con personal fijo por proceso serían ' + h.n(r.dedicados, 0) + ' operarios.' : 'Si rotaran entre procesos, alcanzaría con ' + h.n(r.rotando, 0) + '.') },
        { etiqueta: 'Costo por turno', valor: h.p(r.totalTurno), nota: h.u(r.totalTurno) },
        { etiqueta: 'Costo por mes', valor: h.p(r.totalMes), nota: h.n(v.turnosMes, 0) + ' turnos' },
        { etiqueta: 'Mano de obra por paquete', valor: h.p(r.manoDeObraPorPaquete), nota: h.pc(r.manoDeObraPorPaquete / r.porPaquete * 100, 0) + ' del costo' },
        { etiqueta: 'Paquetes por hora-hombre', valor: h.n(r.paquetesPorHoraHombre, 1), nota: 'Productividad global, con supervisión' },
        { etiqueta: r.polivalente ? 'Para que sobre una persona' : 'Proceso que más horas lleva',
          valor: r.polivalente ? (isFinite(r.ahorroParaSacarUna) ? h.n(r.ahorroParaSacarUna, 1) + ' h-h menos' : 'No alcanza') : r.procesoQueMasHorasLleva,
          nota: !isFinite(r.ahorroParaSacarUna) ? 'La dotación va por personas enteras: con estos números no se puede sacar una persona mejorando la productividad.'
            : (r.polivalente ? 'Por turno, en todos los procesos (+' + h.pc(r.mejoraParaSacarUna, 1) + ' de productividad).'
              : 'Para que sobre una persona ahí hacen falta ' + h.n(r.ahorroParaSacarUna, 1) + ' horas-hombre menos por turno (+' + h.pc(r.mejoraParaSacarUna, 1) + ' de productividad). La dotación va por escalones: mejorar un poco puede no ahorrar a nadie.') }
      ];
    },
    desglose: function (r, v, h) {
      var porTurno = [
        ['Operarios', r.costoOperarios], ['Supervisión', r.costoSupervision], ['Espacio (alquiler y servicios)', r.espacioTurno],
        ['Equipos (amortización, mantenimiento y capital)', r.equiposTurno], ['Sistemas', r.sistemasTurno],
        ['Estructura y administración', r.estructuraTurno], ['Insumos', r.insumosTurno]
      ].filter(function (f) { return f[0] !== 'Estructura y administración' || f[1] !== 0; });
      return [
        { titulo: 'Dotación por proceso',
          nota: r.polivalente ? 'El personal rota: «Personas a la vez» es la cuadrilla que necesita cada proceso en su ventana; el costo se reparte por horas-hombre.' : '',
          columnas: ['Proceso', r.polivalente ? 'Personas a la vez' : 'Personas', 'Costo por turno', 'Ocupación', 'Horas-hombre', 'Ventana', 'Volumen', 'Paquetes por hora'],
          filas: r.procesos.map(function (p) { return [p.nombre, h.n(p.personas, 0), h.p(p.costo), r.polivalente ? '—' : h.pc(p.utilizacion, 0), h.n(p.horasHombre, 1), h.n(p.ventana, 1) + ' h', h.n(p.volumen, 0), h.n(p.productividad, 0)]; }),
          pie: ['Total operarios', h.n(r.operarios, 0), h.p(r.costoOperarios), h.pc(r.utilizacionOperarios, 0), h.n(r.horasHombreTotales, 1), '', '', ''] },
        { titulo: 'Desglose del costo',
          columnas: ['Concepto', 'Por turno', 'Por paquete', '% del total'],
          filas: porTurno.map(function (f) { return [f[0], h.p(f[1]), h.p(f[1] / v.paquetesTurno), h.pc(f[1] / r.totalTurno * 100)]; }),
          pie: ['Total', h.p(r.totalTurno), h.p(r.porPaquete), '100 %'] }
      ];
    },
    sensibilidad: {
      titulo: 'Qué pasa si cambia…',
      columnas: [
        { campo: 'paquetesTurno', etiqueta: 'Volumen → costo por paquete', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.porPaquete); } },
        { campo: 'paquetesTurno', etiqueta: 'Volumen → personas por turno', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.n(r.personasTurno, 0); } },
        { campo: 'prodClasificacion', etiqueta: 'Productividad de clasificación → costo por paquete', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.porPaquete); } },
        { campo: 'costoHora', etiqueta: 'Costo hora → costo por paquete', entrada: function (x, h) { return h.p(x); }, salida: function (r, h) { return h.p(r.porPaquete); } }
      ]
    },
    pasos: function (r, v, h) {
      var pasos = r.procesos.map(function (p) {
        return p.nombre + ': ' + h.n(p.volumen, 0) + ' paquetes ÷ ' + h.n(p.productividad, 0) + ' por hora = ' + h.n(p.horasHombre, 1) + ' horas-hombre ÷ ' + h.n(p.ventana, 1) + ' h ' + (p.ventana < v.horasProdTurno ? 'de ventana' : 'por persona') + ' = ' + h.n(p.horasHombre / p.ventana, 2) + ' → <b>' + h.n(p.personas, 0) + ' personas</b>' + (p.id === 'clasificacion' && v.retrabajoPct > 0 ? ' (el volumen incluye ' + h.pc(v.retrabajoPct, 0) + ' de re-trabajo)' : '') + '.';
      });
      pasos.push(r.polivalente
        ? 'El personal rota: operarios = el mayor entre ' + h.n(r.horasHombreTotales, 1) + ' horas-hombre ÷ ' + h.n(v.horasProdTurno, 1) + ' h (→ ' + h.n(Math.ceil(r.horasHombreTotales / v.horasProdTurno - 1e-9), 0) + ') y la cuadrilla más grande = <b>' + h.n(r.operarios, 0) + '</b>. Es el mínimo si las ventanas no se superponen; si se superponen, hacen falta más. Con personal fijo por proceso serían ' + h.n(r.dedicados, 0) + '.'
        : 'Supone personal fijo por proceso: operarios = suma de las cuadrillas = <b>' + h.n(r.operarios, 0) + '</b>. Si rotaran entre procesos, alcanzaría con ' + h.n(r.rotando, 0) + '.');
      pasos.push('Supervisión = ' + h.n(r.operarios, 0) + ' operarios ÷ ' + h.n(v.operariosPorSupervisor, 0) + ' → <b>' + h.n(r.supervisores, 0) + '</b>.');
      pasos.push('Mano de obra = (' + h.n(r.operarios, 0) + ' + ' + h.n(r.supervisores, 0) + ' × ' + h.n(v.factorSupervisor, 2) + ') × ' + h.n(v.horasProdTurno, 1) + ' h × ' + h.p(v.costoHora) + ' = <b>' + h.p(r.costoOperarios + r.costoSupervision) + '</b> por turno.');
      pasos.push('Espacio = ' + h.n(v.m2, 0) + ' m² × (USD ' + h.n(v.alquilerUsdM2, 2) + ' × ' + h.p(h.tc) + ' + ' + h.p(v.serviciosM2) + ') = ' + h.p(r.espacioMes) + ' por mes ÷ ' + h.n(v.turnosMes, 0) + ' turnos = <b>' + h.p(r.espacioTurno) + '</b>.');
      pasos.push('Equipos = ' + h.p(v.equiposInversion) + ' ÷ (' + h.n(v.equiposVidaAnios, 0) + ' × 12) + mantenimiento ' + h.pc(v.equiposMantPct, 0) + ' anual + capital ' + h.pc(v.tasaCapitalPct, 0) + ' sobre la mitad = ' + h.p(r.equiposMes) + ' por mes → <b>' + h.p(r.equiposTurno) + '</b> por turno. Sistemas ' + h.p(r.sistemasTurno) + (r.estructuraTurno > 0 ? '; estructura ' + h.p(r.estructuraTurno) : '') + '; insumos ' + h.n(v.paquetesTurno, 0) + ' × ' + h.p(v.insumosPaquete) + ' = ' + h.p(r.insumosTurno) + '.');
      pasos.push('Total por turno = <b>' + h.p(r.totalTurno) + '</b> ÷ ' + h.n(v.paquetesTurno, 0) + ' paquetes = <b>' + h.p(r.porPaquete) + ' por paquete</b>.');
      return pasos;
    },
    refsExtra: ['cct40_peon', 'improductivo', 'cedol_sin_transporte', 'imc_ultima_milla']
  };
  function suma(lista, campo) { return lista.reduce(function (a, x) { return a + x[campo]; }, 0); }

  /* ════════════════════════════ 5. Costo de almacenamiento ════════════════════════════ */
  var NOMBRE_ACTIVIDAD = { recepcion: 'Recepción', almacenamiento: 'Almacenamiento', picking: 'Picking', packing: 'Packing', despacho: 'Despacho' };
  var deposito = {
    id: 'deposito', numero: 5, archivo: 'costo-almacenamiento.html',
    titulo: 'Costo por proceso de almacenamiento (costeo por actividades)',
    corto: 'Costo de almacenamiento',
    decision: 'Cuánto te cuesta cada pallet recibido, cada posición por mes, cada línea preparada y cada pedido despachado, dónde se va la plata y el precio mínimo a cobrar.',
    grupos: [
      { titulo: 'Personal', campos: [
        { id: 'costoHora', etiqueta: 'Costo del operario', unidad: '$ por hora productiva', defecto: HORA_PEON, calculado: 3, importar: importarHora,
          ayuda: 'Por defecto, un peón de Camioneros sin comida ni viático (calculadora 3).' },
        { id: 'horasProdMesPersona', etiqueta: 'Horas productivas por persona y mes', unidad: 'horas', defecto: HORAS_PROD_MES_PEON, calculado: 3,
          ayuda: 'Solo para contar personas equivalentes.', importar: { desde: 'laboral', texto: 'Traer de la calculadora 3', salida: function (r) { return Math.round(r.horasProductivasMes * 10) / 10; } } }
      ] },
      { titulo: 'Recepción', campos: [
        { id: 'palletsRecibidos', etiqueta: 'Pallets recibidos', unidad: 'pallets por mes', defecto: 1200, ref: 'supuestos_deposito' },
        { id: 'prodRecepcion', etiqueta: 'Productividad (descarga, control y ubicación)', unidad: 'pallets por hora productiva', defecto: 10, ref: 'prod_otros' },
        { id: 'otrosRecepcionMes', etiqueta: 'Otros costos directos (autoelevador, etc.)', unidad: '$ por mes', defecto: 1500000, ref: 'supuestos_deposito' }
      ] },
      { titulo: 'Almacenamiento', campos: [
        { id: 'posicionesTotales', etiqueta: 'Posiciones de pallet', unidad: 'posiciones', defecto: 2000, ref: 'supuestos_deposito' },
        { id: 'ocupacionPct', etiqueta: 'Ocupación promedio', unidad: '%', defecto: 85, ref: 'supuestos_deposito', max: 100 },
        { id: 'm2Almacenamiento', etiqueta: 'Superficie de almacenamiento (con pasillos)', unidad: 'm²', defecto: 1800, ref: 'supuestos_deposito' },
        { id: 'rackInversionPosicion', etiqueta: 'Rack por posición', unidad: '$ por posición', defecto: 120000, ref: 'supuestos_deposito' },
        { id: 'rackVidaAnios', etiqueta: 'Vida útil del rack', unidad: 'años', defecto: 15, ref: 'supuestos_deposito', min: 1 },
        { id: 'horasInventarioMes', etiqueta: 'Horas de inventario y reubicación', unidad: 'horas-hombre por mes', defecto: 80, ref: 'supuestos_deposito' },
        { id: 'otrosAlmacenamientoMes', etiqueta: 'Otros costos directos (seguro, control de plagas)', unidad: '$ por mes', defecto: 0 }
      ] },
      { titulo: 'Picking', campos: [
        { id: 'lineasMes', etiqueta: 'Líneas preparadas', unidad: 'líneas por mes', defecto: 30000, ref: 'supuestos_deposito', ayuda: 'Una línea es un artículo distinto dentro de un pedido.' },
        { id: 'prodPicking', etiqueta: 'Productividad', unidad: 'líneas por hora productiva', defecto: ref('prod_picking'), ref: 'prod_picking',
          ayuda: 'Por hora productiva (sin pausas), porque el costo hora ya las reparte. Si tu dato es por hora trabajada (como lo da un WMS o un informe), multiplicalo por 1,14 (= 1 ÷ 0,875).' },
        { id: 'otrosPickingMes', etiqueta: 'Otros costos directos', unidad: '$ por mes', defecto: 0 }
      ] },
      { titulo: 'Packing', campos: [
        { id: 'pedidosMes', etiqueta: 'Pedidos', unidad: 'pedidos por mes', defecto: 10000, ref: 'supuestos_deposito' },
        { id: 'prodPacking', etiqueta: 'Productividad', unidad: 'pedidos por hora productiva', defecto: 30, ref: 'prod_otros' },
        { id: 'insumosPedido', etiqueta: 'Insumos de embalaje', unidad: '$ por pedido', defecto: 350, ref: 'prod_otros' },
        { id: 'otrosPackingMes', etiqueta: 'Otros costos directos', unidad: '$ por mes', defecto: 0 }
      ] },
      { titulo: 'Despacho', campos: [
        { id: 'prodDespacho', etiqueta: 'Productividad (consolidar y cargar)', unidad: 'pedidos por hora productiva', defecto: 120, ref: 'prod_otros' },
        { id: 'otrosDespachoMes', etiqueta: 'Otros costos directos (autoelevador, etc.)', unidad: '$ por mes', defecto: 1500000, ref: 'supuestos_deposito' }
      ] },
      { titulo: 'Espacio y estructura', campos: [
        { id: 'm2Operativo', etiqueta: 'Superficie operativa (muelles, playa, packing)', unidad: 'm²', defecto: 700, ref: 'supuestos_deposito',
          ayuda: 'Se reparte entre recepción, packing y despacho según sus horas-hombre. El picking no lleva parte: se hace en los pasillos de los racks, que ya paga almacenamiento.' },
        { id: 'alquilerUsdM2', etiqueta: 'Alquiler', unidad: 'USD por m² por mes', defecto: ref('alquiler_logistico'), ref: 'alquiler_logistico' },
        { id: 'serviciosM2', etiqueta: 'Servicios del edificio', unidad: '$ por m² por mes', defecto: ref('servicios_edificio'), ref: 'servicios_edificio' },
        { id: 'estructuraMes', etiqueta: 'Estructura (administración, supervisión, sistema, seguridad)', unidad: '$ por mes', defecto: 9000000, ref: 'supuestos_deposito',
          ayuda: 'Se reparte entre las actividades según las horas-hombre de cada una.' },
        { id: 'tasaCapitalPct', etiqueta: 'Costo del capital', unidad: '% anual real', defecto: ref('tasa_capital'), ref: 'tasa_capital' }
      ] },
      { titulo: 'Del costo al precio', abierto: false, campos: CAMPOS_PRECIO }
    ],
    calcular: function (v) { return C.costoAlmacenamiento(v); },
    principal: function (r, v, h) {
      return { etiqueta: 'Costo total del depósito por mes', valor: h.p(r.total),
        sub: h.u(r.total) + ' · ' + h.p(r.porPedido) + ' por pedido · ' + h.p(r.porPosicionOcupada) + ' por posición ocupada' };
    },
    tarjetas: function (r, v, h) {
      return [
        { etiqueta: 'Por pallet recibido', valor: h.p(r.porPalletRecibido), nota: h.n(v.palletsRecibidos, 0) + ' pallets por mes' },
        { etiqueta: 'Por posición y mes', valor: h.p(r.porPosicionOcupada), nota: 'Ocupada. Disponible: ' + h.p(r.porPosicionDisponible) + ' · ' + h.n(r.m2PorPosicion, 2) + ' m² por posición' },
        { etiqueta: 'Por línea', valor: h.p(r.porLinea), nota: h.n(r.lineasPorPedido, 1) + ' líneas por pedido' },
        { etiqueta: 'Por pedido', valor: h.p(r.porPedido), nota: 'Picking ' + h.p(r.porLinea * r.lineasPorPedido) + ' + packing ' + h.p(r.packingPorPedido) + ' + despacho ' + h.p(r.despachoPorPedido) },
        { etiqueta: 'Personas equivalentes', valor: h.n(r.personasEquivalentes, 1), nota: h.n(r.horasTotales, 0) + ' horas-hombre por mes' }
      ];
    },
    desglose: function (r, v, h) {
      var inductor = {
        recepcion: [v.palletsRecibidos, 'pallet'], almacenamiento: [v.posicionesTotales * v.ocupacionPct / 100, 'posición ocupada'],
        picking: [v.lineasMes, 'línea'], packing: [v.pedidosMes, 'pedido'], despacho: [v.pedidosMes, 'pedido']
      };
      var t = r.tarifario;
      return [{
        titulo: 'Costeo por actividades (por mes)',
        nota: 'Espacio: almacenamiento paga sus m² y los racks; el espacio operativo se reparte por horas entre recepción, packing y despacho. Estructura: por horas-hombre entre las cinco actividades.',
        columnas: ['Actividad', 'Costo unitario', 'Total', 'Horas-hombre', 'Mano de obra', 'Otros directos', 'Espacio', 'Estructura'],
        filas: r.actividades.map(function (a) {
          var ind = inductor[a.id];
          return [NOMBRE_ACTIVIDAD[a.id] + ' (por ' + ind[1] + ')', h.p(a.total / ind[0]), h.p(a.total), h.n(a.horasHombre, 0), h.p(a.manoDeObra), h.p(a.otros), h.p(a.espacio), h.p(a.estructura)];
        }),
        pie: ['Total', '', h.p(r.total), h.n(r.horasTotales, 0), '', '', '', '']
      }, {
        titulo: 'Tarifario mínimo sugerido (cada actividad se cobra una vez)',
        nota: 'Precio mínimo = costo ÷ (1 − margen − impuestos), con margen ' + h.pc(v.margenPct, 0) + ' e impuestos ' + h.pc(v.impuestosPct, 1) + ' sobre lo facturado. El pedido va sin el picking, que se cobra por línea. En la misma base que tus costos (si sos responsable inscripto, el IVA se suma en la factura).',
        columnas: ['Concepto', 'Costo', 'Precio mínimo'],
        filas: [
          ['Recepción, por pallet', h.p(r.porPalletRecibido), h.p(t.pallet)],
          ['Almacenaje, por posición ocupada y mes', h.p(r.porPosicionOcupada), h.p(t.posicionOcupada)],
          ['Almacenaje, por posición reservada y mes (si el cliente paga todas)', h.p(r.porPosicionDisponible), h.p(t.posicionDisponible)],
          ['Picking, por línea', h.p(r.porLinea), h.p(t.linea)],
          ['Packing y despacho, por pedido (sin el picking)', h.p(r.costoPedidoSinPicking), h.p(t.pedido)]
        ],
        pie: ['Facturación del mes (cobrando por posición ocupada)', h.p(r.total), h.p(t.facturacionMes)]
      }];
    },
    sensibilidad: {
      titulo: 'Qué pasa si cambia…',
      columnas: [
        { campos: ['pedidosMes', 'lineasMes'], etiqueta: 'Pedidos (y líneas) → costo por pedido', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.porPedido); } },
        { campo: 'palletsRecibidos', etiqueta: 'Pallets recibidos → costo por pallet', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.porPalletRecibido); } },
        { campo: 'prodPicking', etiqueta: 'Productividad de picking → costo por línea', entrada: function (x, h) { return h.n(x, 0); }, salida: function (r, h) { return h.p(r.porLinea); } },
        { campo: 'alquilerUsdM2', etiqueta: 'Alquiler → costo por posición', entrada: function (x, h) { return 'USD ' + h.n(x, 2); }, salida: function (r, h) { return h.p(r.porPosicionOcupada); } }
      ]
    },
    pasos: function (r, v, h) {
      var a = {}; r.actividades.forEach(function (x) { a[x.id] = x; });
      var ho = a.recepcion.horasHombre + a.packing.horasHombre + a.despacho.horasHombre;
      return [
        'Precio del m² = USD ' + h.n(v.alquilerUsdM2, 2) + ' × ' + h.p(h.tc) + ' + ' + h.p(v.serviciosM2) + ' = <b>' + h.p(r.precioM2) + ' por m² por mes</b>.',
        'Horas-hombre: recepción ' + h.n(v.palletsRecibidos, 0) + ' ÷ ' + h.n(v.prodRecepcion, 0) + ' = ' + h.n(a.recepcion.horasHombre, 1) + '; picking ' + h.n(v.lineasMes, 0) + ' ÷ ' + h.n(v.prodPicking, 0) + ' = ' + h.n(a.picking.horasHombre, 1) + '; packing ' + h.n(v.pedidosMes, 0) + ' ÷ ' + h.n(v.prodPacking, 0) + ' = ' + h.n(a.packing.horasHombre, 1) + '; despacho ' + h.n(v.pedidosMes, 0) + ' ÷ ' + h.n(v.prodDespacho, 0) + ' = ' + h.n(a.despacho.horasHombre, 1) + '; inventario ' + h.n(v.horasInventarioMes, 0) + '. Total <b>' + h.n(r.horasTotales, 1) + '</b>.',
        'Mano de obra de cada actividad = horas × ' + h.p(v.costoHora) + '. Ejemplo, picking: ' + h.n(a.picking.horasHombre, 1) + ' × ' + h.p(v.costoHora) + ' = ' + h.p(a.picking.manoDeObra) + '.',
        'Almacenamiento: ' + h.n(v.m2Almacenamiento, 0) + ' m² × ' + h.p(r.precioM2) + ' + racks (' + h.n(v.posicionesTotales, 0) + ' × ' + h.p(v.rackInversionPosicion) + ' ÷ ' + h.n(v.rackVidaAnios, 0) + ' años ÷ 12 + capital) ' + h.p(r.racksMes) + ' = ' + h.p(a.almacenamiento.espacio) + '.',
        'Espacio operativo = ' + h.n(v.m2Operativo, 0) + ' m² × ' + h.p(r.precioM2) + ', repartido por horas entre recepción, packing y despacho (' + h.n(ho, 1) + ' h; el picking se hace en los pasillos de los racks, que paga almacenamiento). Estructura ' + h.p(v.estructuraMes) + ' repartida por horas entre las cinco actividades.',
        'Costos unitarios: recepción ' + h.p(a.recepcion.total) + ' ÷ ' + h.n(v.palletsRecibidos, 0) + ' = <b>' + h.p(r.porPalletRecibido) + ' por pallet</b>; almacenamiento ' + h.p(a.almacenamiento.total) + ' ÷ ' + h.n(v.posicionesTotales * v.ocupacionPct / 100, 0) + ' posiciones ocupadas = <b>' + h.p(r.porPosicionOcupada) + '</b>; picking ÷ líneas = <b>' + h.p(r.porLinea) + ' por línea</b>.',
        'Por pedido = (picking + packing + despacho) ÷ ' + h.n(v.pedidosMes, 0) + ' = (' + h.p(a.picking.total) + ' + ' + h.p(a.packing.total) + ' + ' + h.p(a.despacho.total) + ') ÷ ' + h.n(v.pedidosMes, 0) + ' = <b>' + h.p(r.porPedido) + '</b>.',
        'Precio mínimo = costo ÷ (1 − ' + h.pc(v.margenPct, 0) + ' − ' + h.pc(v.impuestosPct, 1) + '): por pallet <b>' + h.p(r.tarifario.pallet) + '</b>, por posición ocupada <b>' + h.p(r.tarifario.posicionOcupada) + '</b>, por línea <b>' + h.p(r.tarifario.linea) + '</b> y por pedido sin picking <b>' + h.p(r.tarifario.pedido) + '</b>.'
      ];
    },
    refsExtra: ['cct40_peon', 'improductivo', 'cedol_sin_transporte']
  };

  /* ════════════════════════════ 6. Peso volumétrico y cubicaje ════════════════════════════ */
  var PALLETS = {
    p1200x1000: { largo: 120, ancho: 100, texto: '1.200 × 1.000 mm (el más usado en Argentina)' },
    p1200x800: { largo: 120, ancho: 80, texto: '1.200 × 800 mm (europallet)' },
    p1219x1016: { largo: 121.9, ancho: 101.6, texto: '1.219 × 1.016 mm (americano)' },
    otro: { texto: 'Otra medida' }
  };
  var ESPACIOS = {
    c20: { largo: 589.8, ancho: 235.2, alto: 239.3, texto: 'Contenedor de 20 pies' },
    c40: { largo: 1202.5, ancho: 235.2, alto: 239.3, texto: 'Contenedor de 40 pies' },
    c40hc: { largo: 1203, ancho: 235, alto: 269, texto: 'Contenedor de 40 pies High Cube' },
    otro: { texto: 'Otra caja (camión, semi, utilitario)' }
  };
  var DIVISORES = [
    { valor: ref('divisor_express'), texto: '5.000 · courier y express (200 kg/m³)', ref: 'divisor_express' },
    { valor: ref('divisor_aereo'), texto: '6.000 · carga aérea (1:6, 167 kg/m³)', ref: 'divisor_aereo' },
    { valor: ref('divisor_tren'), texto: '3.000 · tren (1:3, ejemplo de DHL; 333 kg/m³)', ref: 'divisor_tren' },
    { valor: ref('divisor_maritimo'), texto: '1.000 · marítimo consolidado (1 m³ = 1 t)', ref: 'divisor_maritimo' }
  ];
  /* Dibujo de una capa (vista de arriba) en SVG: solo números calculados acá, nada que venga del usuario como texto. */
  function d1(x) { return String(Math.round(x * 10) / 10); }
  function dibujoPlano(plano, etiqueta) {
    if (!plano || !plano.cajas || !(plano.largo > 0 && plano.ancho > 0)) { return ''; }
    return '<svg class="plano" viewBox="0 0 ' + d1(plano.largo) + ' ' + d1(plano.ancho) + '" role="img" aria-label="' + esc(etiqueta) + '">' +
      '<rect class="plano-base" x="0" y="0" width="' + d1(plano.largo) + '" height="' + d1(plano.ancho) + '" vector-effect="non-scaling-stroke"/>' +
      plano.cajas.map(function (c) {
        return '<rect class="plano-caja' + (c.girada ? ' girada' : '') + '" x="' + d1(c.x) + '" y="' + d1(c.y) + '" width="' + d1(c.largo) + '" height="' + d1(c.ancho) + '" vector-effect="non-scaling-stroke"/>';
      }).join('') + '</svg>';
  }
  function armadoCapa(cub, h) {
    var b = cub.capa.baseCaja;
    if (!isFinite(cub.capa.giradas)) { return h.n(cub.porCapa, 0) + ' cajas'; }
    if (cub.capa.giradas === 0) { return h.n(cub.porCapa, 0) + ' cajas, todas de ' + h.n(b[0], 1) + ' × ' + h.n(b[1], 1) + ' cm a lo largo del pallet'; }
    if (cub.capa.derechas === 0) { return h.n(cub.porCapa, 0) + ' cajas, todas giradas (' + h.n(b[1], 1) + ' × ' + h.n(b[0], 1) + ' cm a lo largo del pallet)'; }
    return h.n(cub.capa.derechas, 0) + ' con el lado de ' + h.n(b[0], 1) + ' cm a lo largo del pallet y ' + h.n(cub.capa.giradas, 0) + ' giradas';
  }

  var AFORO = -1;   // valor de la opción «Aforo de tu transportista (kg por m³)»
  function divisorDe(v) { return v.divisor === 0 ? v.divisorOtro : (v.divisor === AFORO ? div(1e6, v.aforoOtro) : v.divisor); }
  function div(a, b) { return b > 0 ? a / b : NaN; }
  function medidasPallet(v) {
    var p = PALLETS[v.pallet] || PALLETS.p1200x1000;
    return v.pallet === 'otro' ? { largo: v.palletLargoOtro, ancho: v.palletAnchoOtro } : p;
  }
  function medidasEspacio(v) {
    var e = ESPACIOS[v.espacio] || ESPACIOS.c20;
    return v.espacio === 'otro' ? { largo: v.espacioLargo, ancho: v.espacioAncho, alto: v.espacioAlto } : e;
  }

  var volumetrico = {
    id: 'volumetrico', numero: 6, archivo: 'peso-volumetrico.html', sinPesos: true,
    titulo: 'Peso volumétrico y cubicaje',
    corto: 'Peso volumétrico',
    decision: 'Cuántos kilos te van a cobrar por un envío y cuántas cajas entran en un pallet o en un contenedor.',
    grupos: [
      { titulo: 'La caja o bulto', campos: [
        { id: 'largo', etiqueta: 'Largo', unidad: 'cm', defecto: 40 },
        { id: 'ancho', etiqueta: 'Ancho', unidad: 'cm', defecto: 30 },
        { id: 'alto', etiqueta: 'Alto', unidad: 'cm', defecto: 30 },
        { id: 'pesoReal', etiqueta: 'Peso real de cada bulto', unidad: 'kg', defecto: 6 },
        { id: 'cantidad', etiqueta: 'Cantidad de bultos', unidad: 'bultos', defecto: 50, min: 1 }
      ] },
      { titulo: 'Cómo cobra el transporte', campos: [
        { id: 'divisor', tipo: 'opciones', etiqueta: 'Divisor', defecto: ref('divisor_express'), ref: 'divisor_express',
          opciones: DIVISORES.map(function (d) { return { valor: d.valor, texto: d.texto, ref: d.ref }; })
            .concat([{ valor: AFORO, texto: 'Aforo de tu transportista (kg por m³)', ref: null }, { valor: 0, texto: 'Otro divisor (cm³ por kg)', ref: null }]),
          ayuda: 'Peso volumétrico = largo × ancho × alto en cm ÷ divisor. Se cobra el mayor entre real y volumétrico. En camión, en Argentina, cada transportista fija su aforo: pedíselo y cargalo en kg por m³ (300 kg/m³ = divisor 3.333; 250 kg/m³ = divisor 4.000). Confirmá el de tu contrato.' },
        { id: 'aforoOtro', etiqueta: 'Aforo de tu transportista', unidad: 'kg por m³', defecto: 250, visible: function (v) { return v.divisor === AFORO; }, min: 1,
          ayuda: 'Se convierte en divisor: 1.000.000 ÷ aforo. El 250 de arriba es solo un ejemplo: cargá el de tu contrato.' },
        { id: 'divisorOtro', etiqueta: 'Tu divisor', unidad: 'cm³ por kg', defecto: 4000, visible: function (v) { return v.divisor === 0; }, min: 1 },
        { id: 'redondeo', tipo: 'opciones', etiqueta: 'Redondeo', defecto: 0.5, opciones: [
          { valor: 0.5, texto: 'Hacia arriba al medio kilo' }, { valor: 1, texto: 'Hacia arriba al kilo' }, { valor: 0, texto: 'Sin redondeo' }] }
      ] },
      { titulo: 'Pallet', campos: [
        { id: 'pallet', tipo: 'opciones', etiqueta: 'Tipo de pallet', defecto: 'p1200x1000', ref: 'pallets_iso',
          opciones: Object.keys(PALLETS).map(function (k) { return { valor: k, texto: PALLETS[k].texto, ref: k === 'otro' ? null : 'pallets_iso' }; }) },
        { id: 'palletLargoOtro', etiqueta: 'Largo del pallet', unidad: 'cm', defecto: 120, visible: function (v) { return v.pallet === 'otro'; } },
        { id: 'palletAnchoOtro', etiqueta: 'Ancho del pallet', unidad: 'cm', defecto: 100, visible: function (v) { return v.pallet === 'otro'; } },
        { id: 'alturaMaxima', etiqueta: 'Altura máxima total (con el pallet)', unidad: 'cm', defecto: 160, ref: 'supuestos_pallet' },
        { id: 'alturaPallet', etiqueta: 'Alto del pallet vacío', unidad: 'cm', defecto: 15, ref: 'supuestos_pallet' },
        { id: 'pesoMaxPallet', etiqueta: 'Peso máximo por pallet (con el pallet)', unidad: 'kg', defecto: 1000, ref: 'supuestos_pallet' },
        { id: 'pesoPalletVacio', etiqueta: 'Peso del pallet vacío', unidad: 'kg', defecto: 25, ref: 'supuestos_pallet' },
        { id: 'cualquierLado', tipo: 'si_no', etiqueta: 'La caja se puede acostar (no tiene «este lado arriba»)', defecto: false }
      ] },
      { titulo: 'Contenedor o caja del vehículo', abierto: false, campos: [
        { id: 'espacio', tipo: 'opciones', etiqueta: 'Dónde se cargan los pallets', defecto: 'c20', ref: 'contenedores',
          opciones: Object.keys(ESPACIOS).map(function (k) { return { valor: k, texto: ESPACIOS[k].texto, ref: k === 'otro' ? null : 'contenedores' }; }) },
        { id: 'espacioLargo', etiqueta: 'Largo interior', unidad: 'cm', defecto: 1360, visible: function (v) { return v.espacio === 'otro'; } },
        { id: 'espacioAncho', etiqueta: 'Ancho interior', unidad: 'cm', defecto: 245, visible: function (v) { return v.espacio === 'otro'; } },
        { id: 'espacioAlto', etiqueta: 'Alto interior', unidad: 'cm', defecto: 260, visible: function (v) { return v.espacio === 'otro'; } },
        { id: 'apilable', tipo: 'si_no', etiqueta: 'Los pallets se pueden apilar', defecto: false }
      ] }
    ],
    calcular: function (v) {
      var dv = divisorDe(v);
      var pv = C.pesoVolumetrico({ largo: v.largo, ancho: v.ancho, alto: v.alto, pesoReal: v.pesoReal, cantidad: v.cantidad, divisor: dv, redondeo: v.redondeo });
      var mp = medidasPallet(v);
      var cub = C.cubicaje({
        largo: v.largo, ancho: v.ancho, alto: v.alto, pesoReal: v.pesoReal, cantidad: v.cantidad,
        palletLargo: mp.largo, palletAncho: mp.ancho, alturaPallet: v.alturaPallet, alturaMaxima: v.alturaMaxima,
        pesoMaxPallet: v.pesoMaxPallet, pesoPalletVacio: v.pesoPalletVacio, cualquierLado: v.cualquierLado
      });
      var me = medidasEspacio(v);
      var esp = C.palletsEnEspacio({ largoInterior: me.largo, anchoInterior: me.ancho, altoInterior: me.alto,
        palletLargo: mp.largo, palletAncho: mp.ancho, apilable: v.apilable, alturaPalletCargado: cub.alturaCargada });
      var comparacion = DIVISORES.map(function (d) {
        var x = C.pesoVolumetrico({ largo: v.largo, ancho: v.ancho, alto: v.alto, pesoReal: v.pesoReal, cantidad: v.cantidad, divisor: d.valor, redondeo: v.redondeo });
        return { texto: d.texto, divisor: d.valor, corte: x.densidadCorte, volumetrico: x.pesoVolEnvio, facturable: x.facturableEnvio };
      });
      return { pv: pv, cub: cub, esp: esp, divisor: dv, pallet: mp, espacio: me, comparacion: comparacion,
        bultosPorContenedor: esp.total * cub.bultosPorPallet };
    },
    principal: function (r, v, h) {
      return { etiqueta: 'Peso facturable del envío', valor: h.kg(r.pv.facturableEnvio),
        sub: 'Volumétrico ' + h.kg(r.pv.pesoVolEnvio) + ' · real ' + h.kg(r.pv.pesoRealEnvio) + ' · ' + (r.pv.cobraPorVolumen ? 'te cobran por volumen' : 'te cobran por peso'),
        estado: r.pv.cobraPorVolumen ? 'atencion' : '' };
    },
    tarjetas: function (r, v, h) {
      return [
        { etiqueta: 'Un bulto solo', valor: h.kg(r.pv.facturableBulto) + ' facturables', nota: 'Volumétrico ' + h.kg(r.pv.pesoVolBulto) + ' · ' + h.n(r.pv.volumenBultoM3, 3) + ' m³. El envío se calcula sobre el total' +
          (Math.abs(r.pv.facturableSumandoBultos - r.pv.facturableEnvio) > 1e-9 ? '; si tu transportista suma y redondea bulto por bulto, serían ' + h.kg(r.pv.facturableSumandoBultos) : '') + '. Confirmalo en tu contrato.' },
        { etiqueta: 'Densidad de tu carga', valor: h.n(r.pv.densidad, 0) + ' kg/m³', nota: 'Si pesa menos de ' + h.n(r.pv.densidadCorte, 0) + ' kg/m³, te cobran por volumen.' },
        { etiqueta: 'Bultos por pallet', valor: h.n(r.cub.bultosPorPallet, 0), nota: h.n(r.cub.porCapa, 0) + ' por capa × ' + h.n(r.cub.capasUsadas, 0) + ' capas · limita ' + r.cub.limitadoPor },
        { etiqueta: 'Pallets necesarios', valor: h.n(r.cub.palletsNecesarios, 0), nota: 'Para ' + h.n(v.cantidad, 0) + ' bultos · ' + h.kg(r.cub.pesoPallet) + ' y ' + h.n(r.cub.alturaCargada, 0) + ' cm cada uno' },
        { etiqueta: 'Pallets en ' + (ESPACIOS[v.espacio] || ESPACIOS.c20).texto.toLowerCase(), valor: h.n(r.esp.total, 0),
          nota: h.n(r.esp.piso, 0) + ' en el piso' + (v.apilable ? ' × ' + h.n(r.esp.niveles, 0) + ' niveles' : ', sin apilar') + ' · ' + h.n(r.bultosPorContenedor, 0) + ' bultos' }
      ];
    },
    desglose: function (r, v, h) {
      return [{
        titulo: 'Cubicaje del pallet', texto: true,
        columnas: ['Dato', 'Valor'],
        filas: [
          ['Pallet', h.n(r.pallet.largo, 1) + ' × ' + h.n(r.pallet.ancho, 1) + ' cm'],
          ['Posición de la caja', r.cub.orientacion],
          ['Cajas por capa', h.n(r.cub.porCapa, 0)],
          ['Capas que entran en altura', h.n(r.cub.capas, 0)],
          ['Máximo por peso', isFinite(r.cub.maxPorPeso) ? h.n(r.cub.maxPorPeso, 0) + ' cajas' : 'sin límite'],
          ['Bultos por pallet', h.n(r.cub.bultosPorPallet, 0) + ' (limita ' + r.cub.limitadoPor + ')'],
          ['Altura cargada', h.n(r.cub.alturaCargada, 0) + ' cm'],
          ['Peso del pallet armado', h.kg(r.cub.pesoPallet)],
          ['Aprovechamiento del volumen', h.pc(r.cub.aprovechamiento)]
        ]
      }, {
        titulo: 'Cómo armar cada capa (vista de arriba)',
        nota: armadoCapa(r.cub, h) + '. En verde, las cajas a lo largo; en azul, las giradas. Armado por cortes rectos (guillotina): puede haber armados trabados que entren una caja más.',
        svg: dibujoPlano(r.cub.capa, 'Capa de ' + r.cub.porCapa + ' cajas sobre el pallet')
      }, {
        titulo: 'Pallets en el piso de ' + (ESPACIOS[v.espacio] || ESPACIOS.c20).texto.toLowerCase() + ' (vista de arriba)',
        nota: h.n(r.esp.piso, 0) + ' pallets en el piso' + (v.apilable ? ' × ' + h.n(r.esp.niveles, 0) + ' niveles' : ', sin apilar') + '. No controla la carga útil ni el alto de la puerta: verificalos con tu transporte.',
        svg: dibujoPlano(r.esp.plano, r.esp.piso + ' pallets en el piso')
      }].filter(function (t) { return t.svg !== ''; });
    },
    sensibilidad: function (r, v, h) {
      return {
        titulo: 'El mismo envío con cada divisor',
        columnas: ['Modo y divisor', 'Corte (kg/m³)', 'Peso volumétrico', 'Peso facturable'],
        filas: r.comparacion.map(function (c) { return [c.texto, h.n(c.corte, 0), h.kg(c.volumetrico), h.kg(c.facturable)]; })
      };
    },
    pasos: function (r, v, h) {
      var mp = r.pallet;
      return [
        'Volumen de un bulto = ' + h.n(v.largo, 1) + ' × ' + h.n(v.ancho, 1) + ' × ' + h.n(v.alto, 1) + ' = ' + h.n(r.pv.volumenBultoM3 * 1e6, 0) + ' cm³ (' + h.n(r.pv.volumenBultoM3, 3) + ' m³).',
        'Peso volumétrico del envío = ' + h.n(r.pv.volumenEnvioM3 * 1e6, 0) + ' cm³ ÷ ' + h.n(r.divisor, 0) + ' = <b>' + h.kg(r.pv.pesoVolEnvio) + '</b>; peso real = ' + h.n(v.cantidad, 0) + ' × ' + h.kg(v.pesoReal) + ' = ' + h.kg(r.pv.pesoRealEnvio) + '. Se cobra el mayor' + (v.redondeo > 0 ? ', redondeado hacia arriba' : '') + ': <b>' + h.kg(r.pv.facturableEnvio) + '</b>.' +
          (Math.abs(r.pv.facturableSumandoBultos - r.pv.facturableEnvio) > 1e-9 ? ' Si tu transportista redondea cada bulto por separado: ' + h.n(v.cantidad, 0) + ' × ' + h.kg(r.pv.facturableBulto) + ' = <b>' + h.kg(r.pv.facturableSumandoBultos) + '</b> (confirmalo en tu contrato).' : ''),
        'Cajas por capa en un pallet de ' + h.n(mp.largo, 1) + ' × ' + h.n(mp.ancho, 1) + ' cm: se prueban cortes rectos con la caja a lo largo y girada → <b>' + h.n(r.cub.porCapa, 0) + '</b> (' + armadoCapa(r.cub, h) + '; ver el dibujo).',
        'Capas = (' + h.n(v.alturaMaxima, 0) + ' − ' + h.n(v.alturaPallet, 0) + ') cm ÷ alto de la caja → ' + h.n(r.cub.capas, 0) + '. Por peso entran (' + h.n(v.pesoMaxPallet, 0) + ' − ' + h.n(v.pesoPalletVacio, 0) + ') ÷ ' + h.kg(v.pesoReal) + ' = ' + (isFinite(r.cub.maxPorPeso) ? h.n(r.cub.maxPorPeso, 0) : 'sin límite') + '. Bultos por pallet = <b>' + h.n(r.cub.bultosPorPallet, 0) + '</b>.',
        'Pallets necesarios = ' + h.n(v.cantidad, 0) + ' ÷ ' + h.n(r.cub.bultosPorPallet, 0) + ' → <b>' + h.n(r.cub.palletsNecesarios, 0) + '</b>. En el contenedor o caja entran ' + h.n(r.esp.piso, 0) + ' en el piso' + (v.apilable ? ' × ' + h.n(r.esp.niveles, 0) + ' niveles' : '') + ' = <b>' + h.n(r.esp.total, 0) + ' pallets</b>.'
      ];
    },
    refsExtra: ['divisor_aereo', 'divisor_tren', 'divisor_maritimo']
  };

  var lista = [tarifa, recorrido, laboral, hub, deposito, volumetrico];
  var porId = {};
  lista.forEach(function (c) { porId[c.id] = c; });

  /* Valores iniciales de una calculadora: defectos de los campos + el ejemplo inicial. */
  function valoresIniciales(cfg) {
    var v = {};
    cfg.grupos.forEach(function (g) { g.campos.forEach(function (c) { v[c.id] = c.defecto; }); });
    if (cfg.presets && cfg.presetInicial) {
      var p = cfg.presets.filter(function (x) { return x.id === cfg.presetInicial; })[0];
      Object.keys(p.valores).forEach(function (k) { v[k] = p.valores[k]; });
      v.preset = p.id;
    }
    return v;
  }

  function campos(cfg) {
    var r = [];
    cfg.grupos.forEach(function (g) { g.campos.forEach(function (c) { r.push(c); }); });
    return r;
  }

  /* Insignia de un campo: depende del valor que tiene AHORA, no del campo.
   * Devuelve null (sin insignia) o { clase, texto, clave, nota, volverA }.
   * traido: lo que daría ahora «Traer de…» (NaN si no se sabe). */
  function igual(a, b) {
    if (typeof a === 'number' && typeof b === 'number') { return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)); }
    return a === b;
  }
  function mesesEntre(desde, hasta) {
    var a = String(desde).split('-'), b = String(hasta).split('-');
    return a.length < 2 ? 0 : (b[0] - a[0]) * 12 + (b[1] - a[1]);
  }
  function insignia(cfg, c, valores, traido) {
    if (!c.ref && !c.calculado && !c.importar) { return null; }
    var x = valores[c.id];
    var p = (cfg.presets || []).filter(function (q) { return q.id === valores.preset; })[0];
    var clave = (p && p.refs && p.refs[c.id] !== undefined) ? p.refs[c.id] : (c.ref || null);
    if (c.tipo === 'opciones') {
      var op = c.opciones.filter(function (o) { return igual(o.valor, x); })[0];
      if (op && op.ref !== undefined) { clave = op.ref; }
    } else if (c.tipo !== 'si_no') {
      var esperado = (p && p.valores[c.id] !== undefined) ? p.valores[c.id] : c.defecto;
      var desde = c.importar ? porId[c.importar.desde].numero : c.calculado;
      var nota = 'Sale de la calculadora ' + desde + ', que incluye estimaciones: revisalas ahí.';
      if (c.importar && igual(x, traido)) { return { clase: 'calculado', texto: 'CALCULADO · calc. ' + desde, nota: nota }; }
      if (!igual(x, esperado)) { return { clase: 'tu-dato', texto: 'TU DATO', clave: clave, volverA: esperado }; }
      if (c.calculado) { return x === 0 ? null : { clase: 'calculado', texto: 'CALCULADO · calc. ' + c.calculado, nota: nota }; }   // un 0 del ejemplo (sin chofer) no es un cálculo
    }
    if (!clave) { return null; }
    var r = REF.REFERENCIAS[clave];
    if (r.unidad !== '—' && typeof x === 'number' && !igual(x, r.valor)) { return null; }   // nunca una insignia sobre otro número
    if (r.tipo !== 'HECHO') { return { clase: 'estimacion', texto: 'ESTIMACIÓN', clave: clave }; }
    var atraso = r.atrasado ? mesesEntre(r.fecha, REF.ACTUALIZADO) : 0;
    return { clase: atraso > 0 ? 'atrasado' : 'hecho', clave: clave,
      texto: 'HECHO · ' + F.fecha(r.fecha) + (atraso > 0 ? ' · ' + atraso + (atraso === 1 ? ' mes' : ' meses') + ' de atraso' : '') };
  }

  return {
    insignia: insignia,
    lista: lista, porId: porId, valoresIniciales: valoresIniciales, campos: campos, ayudantes: ayudantes, esc: esc,
    HORA_CONDUCTOR: HORA_CONDUCTOR, HORA_PEON: HORA_PEON
  };
});
