/*
 * Andén — fórmulas de las calculadoras (módulo puro: sin DOM, sin red, sin estado).
 *
 * Todas las funciones reciben un objeto de entradas con números ya leídos y devuelven
 * un objeto de resultados. Los porcentajes entran en unidades de por ciento (5 = 5%).
 * Las pruebas de `pruebas/calculos.test.js` reproducen un ejemplo resuelto a mano de cada una.
 */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { raiz.AndenCalculos = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DIAS_POR_SEMANA_CALENDARIO = 7;
  var SEMANAS_POR_ANIO = 365 / 7;

  function n(x) { return (typeof x === 'number' && isFinite(x)) ? x : 0; }
  function div(a, b) { return (b === 0 || !isFinite(b)) ? NaN : a / b; }
  function pct(x) { return n(x) / 100; }
  function suma(lista) { return lista.reduce(function (a, b) { return a + b; }, 0); }

  /* ════════════════════════════════════════════════════════════════════
   * 1. Tarifa al transportista vs. ingreso y volumen (por ruta y día)
   * ════════════════════════════════════════════════════════════════════
   * Una «parada» es un paquete cargado en la ruta (incluye las re-entregas de días anteriores).
   * De cada parada: (1 − f) se entrega y cobra; f falla. De los fallidos, r vuelve a salir otro día
   * (ocupa lugar en una ruta futura) y (1 − r) se devuelve al vendedor.
   */
  function tarifaTransportista(e) {
    var A = n(e.paradas);
    var f = pct(e.fallidos);
    var r = pct(e.reentrega);
    var p = n(e.ingreso);
    var d = n(e.cobroDevolucion);
    var cp = n(e.costoPropio);
    var fr = n(e.fijosRuta);
    var modalidad = e.modalidad || 'paquete';
    var pagaFallidos = !!e.pagaFallidos;

    var entregados = A * (1 - f);
    var fallidos = A * f;
    var reentregas = fallidos * r;
    var devoluciones = fallidos * (1 - r);
    var nuevos = A - reentregas;
    var km = n(e.kmFijos) + n(e.kmPorParada) * A;
    var horas = n(e.horasFijas) + n(e.minPorParada) * A / 60;

    var ingreso = entregados * p + devoluciones * d;

    // Pago al transportista: parte fija por ruta (K_t) y parte por parada (v_t).
    var Kt = 0, vt = 0, unidadesTarifa = 1, nombreUnidad = 'ruta';
    if (modalidad === 'paquete') {
      vt = n(e.tarifaPaquete) * (pagaFallidos ? 1 : (1 - f));
      unidadesTarifa = pagaFallidos ? A : entregados;
      nombreUnidad = pagaFallidos ? 'paquete cargado' : 'paquete entregado';
    } else if (modalidad === 'jornada') {
      Kt = n(e.tarifaJornada);
      unidadesTarifa = 1; nombreUnidad = 'jornada';
    } else if (modalidad === 'km') {
      Kt = n(e.tarifaKm) * n(e.kmFijos);
      vt = n(e.tarifaKm) * n(e.kmPorParada);
      unidadesTarifa = km; nombreUnidad = 'km';
    } else if (modalidad === 'hora') {
      Kt = n(e.tarifaHora) * n(e.horasFijas);
      vt = n(e.tarifaHora) * n(e.minPorParada) / 60;
      unidadesTarifa = horas; nombreUnidad = 'hora';
    }
    var pagoTransportista = Kt + vt * A;
    var costoPropioRuta = cp * A + fr;
    var margenRuta = ingreso - pagoTransportista - costoPropioRuta;

    // Punto de equilibrio: margen(A) = A·u − K = 0
    var u = (1 - f) * p + f * (1 - r) * d - cp - vt;
    var K = fr + Kt;
    var equilibrio;
    if (u <= 0) { equilibrio = Infinity; }           // no cierra con ningún volumen
    else if (K <= 0) { equilibrio = 0; }             // cierra desde el primer paquete
    else { equilibrio = K / u; }

    // Tarifa máxima al transportista para el margen objetivo m (sobre el ingreso)
    var m = pct(e.margenObjetivo);
    var pagoMaximo = ingreso * (1 - m) - costoPropioRuta;
    var tarifaMaxima = div(pagoMaximo, unidadesTarifa);

    var dias = n(e.dias);
    var costoTransp = n(e.costoTransportistaDia);

    return {
      entregados: entregados, fallidos: fallidos, reentregas: reentregas, devoluciones: devoluciones,
      nuevos: nuevos, km: km, horas: horas,
      ingresoRuta: ingreso,
      pagoTransportista: pagoTransportista,
      costoPropioRuta: costoPropioRuta,
      margenRuta: margenRuta,
      margenPct: div(margenRuta, ingreso) * 100,
      margenPorEntregado: div(margenRuta, entregados),
      margenPorNuevo: div(margenRuta, nuevos),
      ingresoPorEntregado: div(ingreso, entregados),
      pagoPorEntregado: div(pagoTransportista, entregados),
      contribucionPorParada: u,
      fijoPorRuta: K,
      equilibrio: equilibrio,
      equilibrioParadas: isFinite(equilibrio) ? Math.ceil(equilibrio - 1e-9) : Infinity,
      pagoMaximo: pagoMaximo,
      tarifaMaxima: tarifaMaxima,
      unidadTarifa: nombreUnidad,
      margenMes: margenRuta * dias,
      ingresoMes: ingreso * dias,
      gananciaTransportistaDia: costoTransp > 0 ? pagoTransportista - costoTransp : NaN,
      gananciaTransportistaMes: costoTransp > 0 ? (pagoTransportista - costoTransp) * dias : NaN
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 2. Costo por recorrido (troncal y última milla)
   * ════════════════════════════════════════════════════════════════════ */
  function costoRecorrido(e) {
    var valor = n(e.valorVehiculo);
    var residual = pct(e.residualPct);
    var vidaMeses = n(e.vidaAnios) * 12;
    var amortizacionMes = div(valor * (1 - residual), vidaMeses);
    var capitalMes = valor * (1 + residual) / 2 * pct(e.tasaCapitalPct) / 12;
    var patenteMes = valor * pct(e.patentePct) / 12;
    var seguroMes = n(e.seguroMes);
    var cocheraMes = n(e.cocheraMes);
    var otrosMes = n(e.otrosFijosMes);
    var fijosMes = amortizacionMes + capitalMes + patenteMes + seguroMes + cocheraMes + otrosMes;

    var recorridosMes = n(e.recorridosMes);
    var fijoRecorrido = div(fijosMes, recorridosMes);

    var combustibleKm = n(e.consumoL100) / 100 * n(e.precioCombustible);
    var cubiertasKm = div(n(e.cubiertasCantidad) * n(e.cubiertaPrecio), n(e.cubiertaVidaKm));
    if (!isFinite(cubiertasKm)) { cubiertasKm = 0; }
    var mantenimientoKm = n(e.mantenimientoKm);
    var variableKm = combustibleKm + cubiertasKm + mantenimientoKm;

    var km = n(e.kmRecorrido);
    var horas = n(e.horasRecorrido);
    var peajes = n(e.peajesRecorrido);
    var choferRecorrido = horas * n(e.choferHora);
    var acompRecorrido = horas * n(e.acompanantes) * n(e.acompananteHora);

    var partes = {
      combustible: combustibleKm * km,
      neumaticos: cubiertasKm * km,
      reparaciones: mantenimientoKm * km,
      materialRodante: div(amortizacionMes, recorridosMes),
      personal: choferRecorrido + acompRecorrido,
      seguros: div(seguroMes, recorridosMes),
      patentes: div(patenteMes, recorridosMes),
      costoFinanciero: div(capitalMes, recorridosMes),
      peaje: peajes,
      cocheraYOtros: div(cocheraMes + otrosMes, recorridosMes)
    };
    var subtotal = suma(Object.keys(partes).map(function (k) { return n(partes[k]); }));
    partes.gastosGenerales = subtotal * pct(e.gastosGeneralesPct);
    var total = subtotal + partes.gastosGenerales;

    var paradas = n(e.paradasRecorrido);
    var paquetes = n(e.paquetesRecorrido);
    return {
      amortizacionMes: amortizacionMes, capitalMes: capitalMes, patenteMes: patenteMes, fijosMes: fijosMes,
      fijoRecorrido: fijoRecorrido,
      combustibleKm: combustibleKm, cubiertasKm: cubiertasKm, mantenimientoKm: mantenimientoKm, variableKm: variableKm,
      variableRecorrido: variableKm * km + peajes,
      personalRecorrido: choferRecorrido + acompRecorrido,
      partes: partes,
      subtotal: subtotal,
      total: total,
      porKm: div(total, km),
      porHora: div(total, horas),
      porParada: div(total, paradas),
      porPaquete: div(total, paquetes),
      sinPersonalPorKm: div(total - partes.personal * (1 + pct(e.gastosGeneralesPct)), km),
      costoMes: total * recorridosMes,
      kmMes: km * recorridosMes
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 3. Costo laboral por operario (Argentina)
   * ════════════════════════════════════════════════════════════════════
   * Supuestos (a validar): presentismo sobre básico + antigüedad; SAC = 1/12 de la base;
   * día de vacaciones pagado como sueldo ÷ 25 (LCT art. 155) en lugar de ÷ 30;
   * la detracción solo sobre el sueldo mensual; ART sobre la parte remunerativa.
   */
  function costoLaboral(e) {
    var basico = n(e.basico);
    var factorAdicionales = (1 + n(e.antiguedadAnios) * pct(e.antiguedadPct)) * (1 + pct(e.presentismoPct));
    var remunerativo = basico * factorAdicionales + n(e.adicionalesRem);
    var integra = !!e.noRemIntegra;
    var noRem = integra ? n(e.noRem) * factorAdicionales : n(e.noRem);

    var vacDias = n(e.vacacionesDias);
    var plusVacFactor = vacDias * (1 / 25 - 1 / 30) / 12;   // costo extra mensualizado del día de vacaciones
    var baseSac = remunerativo + (integra ? noRem : 0);
    var sacMes = baseSac / 12;
    var plusVacacionesMes = baseSac * plusVacFactor;

    var baseContribuciones = remunerativo * (1 + 1 / 12 + plusVacFactor);
    var baseNoRem = integra ? noRem * (1 + 1 / 12 + plusVacFactor) : noRem;

    var contribuciones = Math.max(0, baseContribuciones - n(e.detraccion)) * pct(e.contribucionesPct);
    var obraSocial = baseContribuciones * pct(e.obraSocialPct);
    var contribNoRem = baseNoRem * pct(e.noRemContribPct);
    var art = baseContribuciones * pct(e.artPct) + n(e.artFija);
    var seguroVida = n(e.seguroVida);
    var aportesConvenio = n(e.aportesConvenio);

    // Horas
    var diasSemana = n(e.diasSemana);
    var horasDia = div(n(e.horasSemana), diasSemana);
    var diasLaborablesAnio = diasSemana * SEMANAS_POR_ANIO;
    var vacacionesLaborables = vacDias * diasSemana / DIAS_POR_SEMANA_CALENDARIO;
    var diasPresentesAnio = (diasLaborablesAnio - vacacionesLaborables - n(e.feriados)) * (1 - pct(e.ausentismoPct));
    var horasPresentesMes = diasPresentesAnio * horasDia / 12;
    var horasProductivasMes = horasPresentesMes * (1 - pct(e.improductivoPct));
    var horasPagadasMes = n(e.horasSemana) * SEMANAS_POR_ANIO / 12;
    var diasTrabajadosMes = diasPresentesAnio / 12;
    var viaticosMes = n(e.viaticoDia) * diasTrabajadosMes;

    var cargas = contribuciones + obraSocial + contribNoRem + art + seguroVida + aportesConvenio;
    var total = remunerativo + noRem + sacMes + plusVacacionesMes + viaticosMes + cargas;

    return {
      remunerativo: remunerativo, noRemunerativo: noRem,
      sacMes: sacMes, plusVacacionesMes: plusVacacionesMes, viaticosMes: viaticosMes,
      baseContribuciones: baseContribuciones,
      contribuciones: contribuciones, obraSocial: obraSocial, contribNoRem: contribNoRem,
      art: art, seguroVida: seguroVida, aportesConvenio: aportesConvenio,
      cargas: cargas,
      total: total,
      horasDia: horasDia,
      diasTrabajadosMes: diasTrabajadosMes,
      horasPagadasMes: horasPagadasMes,
      horasPresentesMes: horasPresentesMes,
      horasProductivasMes: horasProductivasMes,
      costoHoraProductiva: div(total, horasProductivasMes),
      costoHoraPagada: div(total, horasPagadasMes),
      costoDiaPresente: div(total, diasTrabajadosMes),
      factorSobreBasico: div(total, basico),
      sueldoBolsillo: remunerativo + noRem
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 4. Costo por paquete clasificado (hub de media y última milla)
   * ════════════════════════════════════════════════════════════════════
   * El costo hora es por hora productiva (sale de la calculadora 3): ya incluye pausas,
   * vacaciones, feriados y ausentismo. Cada persona presente aporta «horas productivas por turno».
   */
  function costoClasificacion(e) {
    var V = n(e.paquetesTurno);
    var hp = n(e.horasProdTurno);
    var ch = n(e.costoHora);
    var rt = pct(e.retrabajoPct);
    var defs = [
      { id: 'induccion', nombre: 'Descarga e inducción', prod: n(e.prodInduccion), retrabajo: false },
      { id: 'clasificacion', nombre: 'Clasificación por ruta', prod: n(e.prodClasificacion), retrabajo: true },
      { id: 'carga', nombre: 'Armado de rutas y carga', prod: n(e.prodCarga), retrabajo: false }
    ];
    var procesos = defs.filter(function (p) { return p.prod > 0; }).map(function (p) {
      var volumen = V * (1 + (p.retrabajo ? rt : 0));
      var horasHombre = volumen / p.prod;
      var personas = Math.ceil(div(horasHombre, hp) - 1e-9);
      if (!isFinite(personas) || personas < 0) { personas = 0; }
      return {
        id: p.id, nombre: p.nombre, productividad: p.prod, volumen: volumen,
        horasHombre: horasHombre, personas: personas,
        utilizacion: div(horasHombre, personas * hp) * 100,
        costo: personas * hp * ch
      };
    });
    var operarios = suma(procesos.map(function (p) { return p.personas; }));
    var supervisores = n(e.operariosPorSupervisor) > 0 ? Math.ceil(operarios / n(e.operariosPorSupervisor) - 1e-9) : 0;
    var costoOperarios = operarios * hp * ch;
    var costoSupervision = supervisores * hp * ch * n(e.factorSupervisor);

    var turnosMes = n(e.turnosMes);
    var espacioMes = n(e.m2) * (n(e.alquilerUsdM2) * n(e.tc) + n(e.serviciosM2));
    var inv = n(e.equiposInversion);
    var equiposMes = div(inv, n(e.equiposVidaAnios) * 12) + inv * pct(e.equiposMantPct) / 12 + inv / 2 * pct(e.tasaCapitalPct) / 12;
    if (!isFinite(equiposMes)) { equiposMes = 0; }
    var espacioTurno = div(espacioMes, turnosMes);
    var equiposTurno = div(equiposMes, turnosMes);
    var sistemasTurno = div(n(e.sistemasMes), turnosMes);
    var insumosTurno = n(e.insumosPaquete) * V;

    var totalTurno = costoOperarios + costoSupervision + espacioTurno + equiposTurno + sistemasTurno + insumosTurno;
    var cuello = procesos.reduce(function (a, b) { return (!a || b.horasHombre > a.horasHombre) ? b : a; }, null);
    var horasTotales = (operarios + supervisores) * hp;

    return {
      procesos: procesos,
      operarios: operarios, supervisores: supervisores,
      personasTurno: operarios + supervisores,
      costoOperarios: costoOperarios, costoSupervision: costoSupervision,
      espacioMes: espacioMes, equiposMes: equiposMes,
      espacioTurno: espacioTurno, equiposTurno: equiposTurno, sistemasTurno: sistemasTurno, insumosTurno: insumosTurno,
      totalTurno: totalTurno,
      porPaquete: div(totalTurno, V),
      manoDeObraPorPaquete: div(costoOperarios + costoSupervision, V),
      paquetesPorHoraHombre: div(V, horasTotales),
      totalMes: totalTurno * turnosMes,
      procesoQueMasHorasLleva: cuello ? cuello.nombre : ''
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 5. Costo por proceso de almacenamiento (costeo por actividades)
   * ════════════════════════════════════════════════════════════════════
   * Asignación (a validar): el espacio de almacenamiento y los racks van a «almacenamiento»;
   * el espacio operativo se reparte entre recepción, picking, packing y despacho según horas-hombre;
   * los gastos de estructura se reparten entre las cinco actividades según horas-hombre.
   */
  function costoAlmacenamiento(e) {
    var ch = n(e.costoHora);
    var precioM2 = n(e.alquilerUsdM2) * n(e.tc) + n(e.serviciosM2);
    var pallets = n(e.palletsRecibidos);
    var lineas = n(e.lineasMes);
    var pedidos = n(e.pedidosMes);
    var posTotales = n(e.posicionesTotales);
    var posOcupadas = posTotales * pct(e.ocupacionPct);

    var horas = {
      recepcion: div(pallets, n(e.prodRecepcion)),
      almacenamiento: n(e.horasInventarioMes),
      picking: div(lineas, n(e.prodPicking)),
      packing: div(pedidos, n(e.prodPacking)),
      despacho: div(pedidos, n(e.prodDespacho))
    };
    Object.keys(horas).forEach(function (k) { if (!isFinite(horas[k])) { horas[k] = 0; } });
    var horasOperativas = horas.recepcion + horas.picking + horas.packing + horas.despacho;
    var horasTotales = horasOperativas + horas.almacenamiento;

    var espacioAlmacenamiento = n(e.m2Almacenamiento) * precioM2;
    var espacioOperativo = n(e.m2Operativo) * precioM2;
    var inv = posTotales * n(e.rackInversionPosicion);
    var racksMes = div(inv, n(e.rackVidaAnios) * 12) + inv / 2 * pct(e.tasaCapitalPct) / 12;
    if (!isFinite(racksMes)) { racksMes = 0; }
    var estructura = n(e.estructuraMes);
    var otros = {
      recepcion: n(e.otrosRecepcionMes),
      almacenamiento: n(e.otrosAlmacenamientoMes),
      picking: n(e.otrosPickingMes),
      packing: n(e.otrosPackingMes) + n(e.insumosPedido) * pedidos,
      despacho: n(e.otrosDespachoMes)
    };

    var actividades = ['recepcion', 'almacenamiento', 'picking', 'packing', 'despacho'].map(function (k) {
      var manoDeObra = horas[k] * ch;
      var espacio = k === 'almacenamiento'
        ? espacioAlmacenamiento + racksMes
        : (horasOperativas > 0 ? espacioOperativo * horas[k] / horasOperativas : 0);
      var estr = horasTotales > 0 ? estructura * horas[k] / horasTotales : 0;
      return { id: k, horasHombre: horas[k], manoDeObra: manoDeObra, otros: otros[k], espacio: espacio, estructura: estr,
        total: manoDeObra + otros[k] + espacio + estr };
    });
    var porId = {};
    actividades.forEach(function (a) { porId[a.id] = a; });
    var total = suma(actividades.map(function (a) { return a.total; }));

    var porLinea = div(porId.picking.total, lineas);
    var packingPorPedido = div(porId.packing.total, pedidos);
    var despachoPorPedido = div(porId.despacho.total, pedidos);
    var personasEquivalentes = div(horasTotales, n(e.horasProdMesPersona));

    return {
      actividades: actividades,
      precioM2: precioM2, racksMes: racksMes,
      horasTotales: horasTotales,
      personasEquivalentes: personasEquivalentes,
      porPalletRecibido: div(porId.recepcion.total, pallets),
      porPosicionOcupada: div(porId.almacenamiento.total, posOcupadas),
      porPosicionDisponible: div(porId.almacenamiento.total, posTotales),
      m2PorPosicion: div(n(e.m2Almacenamiento), posTotales),
      porLinea: porLinea,
      lineasPorPedido: div(lineas, pedidos),
      packingPorPedido: packingPorPedido,
      despachoPorPedido: despachoPorPedido,
      porPedido: div(porId.picking.total + porId.packing.total + porId.despacho.total, pedidos),
      total: total
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 6. Peso volumétrico y cubicaje
   * ════════════════════════════════════════════════════════════════════ */
  function redondearArriba(x, paso) {
    if (!paso || paso <= 0) { return x; }
    return Math.ceil(x / paso - 1e-9) * paso;
  }

  function pesoVolumetrico(e) {
    var volCm3 = n(e.largo) * n(e.ancho) * n(e.alto);
    var divisor = n(e.divisor);
    var cantidad = Math.max(1, Math.round(n(e.cantidad)));
    var paso = n(e.redondeo);
    var pvBulto = div(volCm3, divisor);
    var real = n(e.pesoReal);
    var facturableBulto = redondearArriba(Math.max(real, pvBulto), paso);
    var volTotalCm3 = volCm3 * cantidad;
    var pvEnvio = div(volTotalCm3, divisor);
    var realEnvio = real * cantidad;
    var facturableEnvio = redondearArriba(Math.max(realEnvio, pvEnvio), paso);
    return {
      volumenBultoM3: volCm3 / 1e6,
      volumenEnvioM3: volTotalCm3 / 1e6,
      pesoVolBulto: pvBulto,
      facturableBulto: facturableBulto,
      pesoVolEnvio: pvEnvio,
      pesoRealEnvio: realEnvio,
      facturableEnvio: facturableEnvio,
      cobraPorVolumen: pvEnvio > realEnvio,
      densidad: div(real, volCm3 / 1e6),
      densidadCorte: div(1e6, divisor),
      diferenciaKg: facturableEnvio - realEnvio
    };
  }

  /* Mejor cantidad de rectángulos p×q en un área L×W: una orientación o dos bloques (corte guillotina). */
  function mejorCapa(L, W, p, q) {
    if (p <= 0 || q <= 0 || L <= 0 || W <= 0) { return 0; }
    function fila(largo, ancho, a, b) { return Math.floor(largo / a + 1e-9) * Math.floor(ancho / b + 1e-9); }
    var mejor = Math.max(fila(L, W, p, q), fila(L, W, q, p));
    var i, resto;
    for (i = 0; i * p <= L + 1e-9; i++) {           // bloques a lo largo de L
      resto = L - i * p;
      mejor = Math.max(mejor, i * Math.floor(W / q + 1e-9) + fila(resto, W, q, p));
    }
    for (i = 0; i * q <= L + 1e-9; i++) {
      resto = L - i * q;
      mejor = Math.max(mejor, i * Math.floor(W / p + 1e-9) + fila(resto, W, p, q));
    }
    for (i = 0; i * p <= W + 1e-9; i++) {           // bloques a lo ancho de W
      resto = W - i * p;
      mejor = Math.max(mejor, i * Math.floor(L / q + 1e-9) + fila(L, resto, p, q));
    }
    for (i = 0; i * q <= W + 1e-9; i++) {
      resto = W - i * q;
      mejor = Math.max(mejor, i * Math.floor(L / p + 1e-9) + fila(L, resto, q, p));
    }
    return mejor;
  }

  function cubicaje(e) {
    var l = n(e.largo), a = n(e.ancho), h = n(e.alto);
    var L = n(e.palletLargo), W = n(e.palletAncho);
    var alturaUtil = n(e.alturaMaxima) - n(e.alturaPallet);
    var pesoCaja = n(e.pesoReal);
    var orientaciones = [{ alto: h, p: l, q: a, nombre: 'parada (como viene)' }];
    if (e.cualquierLado) {
      orientaciones.push({ alto: a, p: l, q: h, nombre: 'acostada sobre el lateral largo' });
      orientaciones.push({ alto: l, p: a, q: h, nombre: 'acostada sobre el lateral corto' });
    }
    var maxPorPeso = pesoCaja > 0 ? Math.floor((n(e.pesoMaxPallet) - n(e.pesoPalletVacio)) / pesoCaja + 1e-9) : Infinity;
    var mejor = null;
    orientaciones.forEach(function (o) {
      var porCapa = mejorCapa(L, W, o.p, o.q);
      var capas = o.alto > 0 ? Math.floor(alturaUtil / o.alto + 1e-9) : 0;
      if (capas < 0) { capas = 0; }
      var porAltura = porCapa * capas;
      var bultos = Math.max(0, Math.min(porAltura, maxPorPeso));
      if (!mejor || bultos > mejor.bultos) {
        mejor = { orientacion: o.nombre, porCapa: porCapa, capas: capas, porAltura: porAltura, bultos: bultos, altoCaja: o.alto };
      }
    });
    var bultos = mejor.bultos;
    var limitadoPor = bultos < mejor.porAltura ? 'peso' : 'altura y base';
    var capasUsadas = mejor.porCapa > 0 ? Math.ceil(bultos / mejor.porCapa - 1e-9) : 0;
    var alturaCargada = n(e.alturaPallet) + capasUsadas * mejor.altoCaja;
    var volCaja = l * a * h;
    var cantidad = Math.max(0, Math.round(n(e.cantidad)));
    return {
      orientacion: mejor.orientacion,
      porCapa: mejor.porCapa,
      capas: mejor.capas,
      capasUsadas: capasUsadas,
      bultosPorPallet: bultos,
      limitadoPor: limitadoPor,
      maxPorPeso: maxPorPeso,
      alturaCargada: alturaCargada,
      pesoPallet: n(e.pesoPalletVacio) + bultos * pesoCaja,
      aprovechamiento: div(bultos * volCaja, L * W * alturaUtil) * 100,
      palletsNecesarios: bultos > 0 ? Math.ceil(cantidad / bultos - 1e-9) : Infinity
    };
  }

  /* Pallets por contenedor o caja de camión: posiciones en el piso y, si se apilan, niveles. */
  function palletsEnEspacio(e) {
    var piso = mejorCapa(n(e.largoInterior), n(e.anchoInterior), n(e.palletLargo), n(e.palletAncho));
    var niveles = e.apilable && n(e.alturaPalletCargado) > 0
      ? Math.max(1, Math.floor(n(e.altoInterior) / n(e.alturaPalletCargado) + 1e-9)) : 1;
    if (n(e.alturaPalletCargado) > n(e.altoInterior)) { niveles = 0; }
    return { piso: piso, niveles: niveles, total: piso * niveles };
  }

  /* ════════════════════════════════════════════════════════════════════
   * Sensibilidad: vuelve a calcular cambiando un campo por factores (0,6 … 1,4).
   * ════════════════════════════════════════════════════════════════════ */
  function sensibilidad(funcion, entradas, campo, factores, salida) {
    return factores.map(function (k) {
      var copia = {};
      Object.keys(entradas).forEach(function (c) { copia[c] = entradas[c]; });
      copia[campo] = n(entradas[campo]) * k;
      return { factor: k, valor: salida(funcion(copia)) };
    });
  }

  return {
    tarifaTransportista: tarifaTransportista,
    costoRecorrido: costoRecorrido,
    costoLaboral: costoLaboral,
    costoClasificacion: costoClasificacion,
    costoAlmacenamiento: costoAlmacenamiento,
    pesoVolumetrico: pesoVolumetrico,
    cubicaje: cubicaje,
    palletsEnEspacio: palletsEnEspacio,
    mejorCapa: mejorCapa,
    redondearArriba: redondearArriba,
    sensibilidad: sensibilidad,
    FACTORES: [0.6, 0.8, 1, 1.2, 1.4]
  };
});
