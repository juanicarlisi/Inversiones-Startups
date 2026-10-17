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

  /* Precio mínimo para ganar un margen sobre el precio (y pagar impuestos sobre lo facturado): costo ÷ (1 − m − i). */
  function precioConMargen(costo, margenPct, impuestosPct) {
    var k = 1 - pct(margenPct) - pct(impuestosPct);
    return k > 0 ? div(costo, k) : NaN;
  }

  /* Días de vacaciones según la antigüedad (LCT art. 150): hasta 5 años, 14; hasta 10, 21; hasta 20, 28; más, 35. */
  function vacacionesLey(anios) {
    var a = n(anios);
    return a <= 5 ? 14 : (a <= 10 ? 21 : (a <= 20 ? 28 : 35));
  }

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
    var gananciaTranspDia = costoTransp > 0 ? pagoTransportista - costoTransp : NaN;
    // Del lado del transportista (pago por paquete): paquetes cargados que cubren su costo del día.
    var cobraPorCargado = modalidad === 'paquete' ? n(e.tarifaPaquete) * (pagaFallidos ? 1 : (1 - f)) : NaN;
    var equilibrioTransp = (costoTransp > 0 && cobraPorCargado > 0) ? Math.ceil(costoTransp / cobraPorCargado - 1e-9) : NaN;

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
      unidadesTarifa: unidadesTarifa,
      margenMes: margenRuta * dias,
      ingresoMes: ingreso * dias,
      gananciaTransportistaDia: gananciaTranspDia,
      gananciaTransportistaMes: gananciaTranspDia * dias,
      gananciaTransportistaHora: div(gananciaTranspDia, n(e.horasTransportista)),
      equilibrioTransportista: equilibrioTransp,
      tarifaMinimaTransportista: costoTransp > 0 ? div(costoTransp, unidadesTarifa) : NaN
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 2. Costo por recorrido (troncal y última milla)
   * ════════════════════════════════════════════════════════════════════ */
  function costoRecorrido(e) {
    var valor = n(e.valorVehiculo);
    var residual = pct(e.residualPct);
    var vidaMeses = n(e.vidaAnios) * 12;
    // Con un divisor obligatorio en 0 (años de uso, recorridos por mes) el resultado es NaN y la pantalla muestra «—»:
    // nunca se borra un costo en silencio. Sin vehículo (valor 0) no hay amortización.
    var amortizacionMes = valor > 0 ? div(valor * (1 - residual), vidaMeses) : 0;
    var capitalMes = valor * (1 + residual) / 2 * pct(e.tasaCapitalPct) / 12;
    var patenteMes = valor * pct(e.patentePct) / 12;
    var seguroMes = n(e.seguroMes);
    var cocheraMes = n(e.cocheraMes);
    var otrosMes = n(e.otrosFijosMes);
    var fijosMes = amortizacionMes + capitalMes + patenteMes + seguroMes + cocheraMes + otrosMes;

    var recorridosMes = n(e.recorridosMes);
    var fijoRecorrido = div(fijosMes, recorridosMes);

    var combustibleKm = n(e.consumoL100) / 100 * n(e.precioCombustible);
    var costoCubiertas = n(e.cubiertasCantidad) * n(e.cubiertaPrecio);
    var cubiertasKm = costoCubiertas > 0 ? div(costoCubiertas, n(e.cubiertaVidaKm)) : 0;
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
    var subtotal = suma(Object.keys(partes).map(function (k) { return partes[k]; }));
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
      kmMes: km * recorridosMes,
      tarifario: {
        viaje: precioConMargen(total, e.margenPct, e.impuestosPct),
        km: precioConMargen(div(total, km), e.margenPct, e.impuestosPct),
        hora: precioConMargen(div(total, horas), e.margenPct, e.impuestosPct),
        paquete: precioConMargen(div(total, paquetes), e.margenPct, e.impuestosPct)
      }
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 3. Costo laboral por operario (Argentina)
   * ════════════════════════════════════════════════════════════════════
   * Supuestos (a validar): presentismo sobre básico + antigüedad; SAC = 1/12 de la base;
   * día de vacaciones pagado como sueldo ÷ 25 (LCT art. 155) en lugar de ÷ 30;
   * la detracción solo sobre el sueldo mensual; ART sobre la parte remunerativa.
   * Comida y viático especial (Camioneros) por día efectivamente trabajado, sin cargas sociales.
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
    var diasLaborablesAnio = diasSemana > 0 ? diasSemana * SEMANAS_POR_ANIO : NaN;
    var vacacionesLaborables = vacDias * diasSemana / DIAS_POR_SEMANA_CALENDARIO;
    var diasPresentesAnio = Math.max(0, (diasLaborablesAnio - vacacionesLaborables - n(e.feriados)) * (1 - pct(e.ausentismoPct)));
    var horasPresentesMes = diasPresentesAnio * horasDia / 12;
    var horasProductivasMes = horasPresentesMes * (1 - pct(e.improductivoPct));
    var horasPagadasMes = n(e.horasSemana) * SEMANAS_POR_ANIO / 12;
    var diasTrabajadosMes = diasPresentesAnio / 12;
    var comidaMes = n(e.viaticoDia) * diasTrabajadosMes;
    var viaticoEspecialMes = n(e.viaticoEspecialDia) * diasTrabajadosMes;
    var viaticosMes = comidaMes + viaticoEspecialMes;

    var cargas = contribuciones + obraSocial + contribNoRem + art + seguroVida + aportesConvenio;
    var total = remunerativo + noRem + sacMes + plusVacacionesMes + viaticosMes + cargas;

    return {
      remunerativo: remunerativo, noRemunerativo: noRem,
      sacMes: sacMes, plusVacacionesMes: plusVacacionesMes, viaticosMes: viaticosMes,
      comidaMes: comidaMes, viaticoEspecialMes: viaticoEspecialMes,
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
      sueldoBruto: remunerativo + noRem,      // antes de los aportes del trabajador: no es lo que cobra en mano
      vacacionesLey: vacacionesLey(e.antiguedadAnios)
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 4. Costo por paquete clasificado (hub de media y última milla)
   * ════════════════════════════════════════════════════════════════════
   * El costo hora es por hora productiva (sale de la calculadora 3): ya incluye pausas,
   * vacaciones, feriados y ausentismo. Cada persona presente aporta «horas productivas por turno».
   * Ventana de cada proceso: las horas productivas en que tiene que hacerse (0 = todo el turno);
   * la carga, por ejemplo, tiene que terminar antes de que salgan las rutas.
   * Personal fijo por proceso: se suman los techos de cada proceso. Personal que rota: el máximo entre
   * techo(horas-hombre totales ÷ horas del turno) y la mayor cuadrilla simultánea. Es el mínimo exacto si las
   * ventanas no se superponen o duran todo el turno; si dos ventanas cortas se superponen, hacen falta más.
   */
  function costoClasificacion(e) {
    var V = n(e.paquetesTurno);
    var hp = n(e.horasProdTurno);
    var ch = n(e.costoHora);
    var rt = pct(e.retrabajoPct);
    var polivalente = !!e.polivalente;
    var defs = [
      { id: 'induccion', nombre: 'Descarga e inducción', prod: n(e.prodInduccion), retrabajo: false, ventana: n(e.ventanaInduccion) },
      { id: 'clasificacion', nombre: 'Clasificación por ruta', prod: n(e.prodClasificacion), retrabajo: true, ventana: n(e.ventanaClasificacion) },
      { id: 'carga', nombre: 'Armado de rutas y carga', prod: n(e.prodCarga), retrabajo: false, ventana: n(e.ventanaCarga) }
    ];
    var procesos = defs.filter(function (p) { return p.prod > 0; }).map(function (p) {
      var volumen = V * (1 + (p.retrabajo ? rt : 0));
      var horasHombre = volumen / p.prod;
      var w = p.ventana > 0 ? Math.min(p.ventana, hp) : hp;   // con horas por turno en 0, NaN: se muestra «—»
      var personas = Math.ceil(div(horasHombre, w) - 1e-9);
      if (personas < 0) { personas = 0; }
      return {
        id: p.id, nombre: p.nombre, productividad: p.prod, volumen: volumen,
        horasHombre: horasHombre, ventana: w, personas: personas,
        utilizacion: div(horasHombre, personas * hp) * 100
      };
    });
    var dedicados = suma(procesos.map(function (p) { return p.personas; }));
    var hhTotal = suma(procesos.map(function (p) { return p.horasHombre; }));
    var mayorCuadrilla = procesos.reduce(function (a, p) { return Math.max(a, p.personas); }, 0);
    var rotando = Math.max(Math.ceil(div(hhTotal, hp) - 1e-9), mayorCuadrilla);
    var operarios = polivalente ? rotando : dedicados;
    var costoOperarios = operarios * hp * ch;
    procesos.forEach(function (p) {
      p.costo = polivalente ? costoOperarios * div(p.horasHombre, hhTotal) : p.personas * hp * ch;
    });
    var supervisores = n(e.operariosPorSupervisor) > 0 ? Math.ceil(operarios / n(e.operariosPorSupervisor) - 1e-9) : 0;
    var costoSupervision = supervisores * hp * ch * n(e.factorSupervisor);

    var turnosMes = n(e.turnosMes);
    var espacioMes = n(e.m2) * (n(e.alquilerUsdM2) * n(e.tc) + n(e.serviciosM2));
    var inv = n(e.equiposInversion);
    var equiposMes = (inv > 0 ? div(inv, n(e.equiposVidaAnios) * 12) : 0) + inv * pct(e.equiposMantPct) / 12 + inv / 2 * pct(e.tasaCapitalPct) / 12;
    var espacioTurno = div(espacioMes, turnosMes);
    var equiposTurno = div(equiposMes, turnosMes);
    var sistemasTurno = div(n(e.sistemasMes), turnosMes);
    var estructuraTurno = div(n(e.estructuraMes), turnosMes);
    var insumosTurno = n(e.insumosPaquete) * V;

    var totalTurno = costoOperarios + costoSupervision + espacioTurno + equiposTurno + sistemasTurno + estructuraTurno + insumosTurno;
    var cuello = procesos.reduce(function (a, b) { return (!a || b.horasHombre > a.horasHombre) ? b : a; }, null);
    var horasTotales = (operarios + supervisores) * hp;

    // Cuánto hay que ahorrar para que sobre una persona (la dotación va por escalones enteros).
    var ahorroParaUna = NaN, mejoraParaUna = NaN;
    if (polivalente) {
      if (operarios - 1 >= mayorCuadrilla && operarios > 1) {
        ahorroParaUna = hhTotal - (operarios - 1) * hp;
        mejoraParaUna = (hhTotal / ((operarios - 1) * hp) - 1) * 100;
      }
    } else if (cuello && cuello.personas > 1) {
      ahorroParaUna = cuello.horasHombre - (cuello.personas - 1) * cuello.ventana;
      mejoraParaUna = (cuello.horasHombre / ((cuello.personas - 1) * cuello.ventana) - 1) * 100;
    }

    return {
      procesos: procesos,
      polivalente: polivalente,
      dedicados: dedicados, rotando: rotando, horasHombreTotales: hhTotal,
      operarios: operarios, supervisores: supervisores,
      personasTurno: operarios + supervisores,
      utilizacionOperarios: div(hhTotal, operarios * hp) * 100,
      costoOperarios: costoOperarios, costoSupervision: costoSupervision,
      espacioMes: espacioMes, equiposMes: equiposMes,
      espacioTurno: espacioTurno, equiposTurno: equiposTurno, sistemasTurno: sistemasTurno, estructuraTurno: estructuraTurno,
      insumosTurno: insumosTurno,
      totalTurno: totalTurno,
      porPaquete: div(totalTurno, V),
      manoDeObraPorPaquete: div(costoOperarios + costoSupervision, V),
      paquetesPorHoraHombre: div(V, horasTotales),
      totalMes: totalTurno * turnosMes,
      procesoQueMasHorasLleva: cuello ? cuello.nombre : '',
      ahorroParaSacarUna: ahorroParaUna,
      mejoraParaSacarUna: mejoraParaUna
    };
  }

  /* ════════════════════════════════════════════════════════════════════
   * 5. Costo por proceso de almacenamiento (costeo por actividades)
   * ════════════════════════════════════════════════════════════════════
   * Asignación (a validar): el espacio de almacenamiento y los racks van a «almacenamiento»;
   * el espacio operativo (muelles, playa, packing) se reparte entre recepción, packing y despacho según horas-hombre
   * (el picking se hace en los pasillos de los racks, que ya están en almacenamiento);
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

    // Sin volumen, la actividad no lleva horas; con volumen y productividad 0, NaN (se muestra «—»).
    function horasDe(volumen, prod) { return volumen > 0 ? div(volumen, prod) : 0; }
    var horas = {
      recepcion: horasDe(pallets, n(e.prodRecepcion)),
      almacenamiento: n(e.horasInventarioMes),
      picking: horasDe(lineas, n(e.prodPicking)),
      packing: horasDe(pedidos, n(e.prodPacking)),
      despacho: horasDe(pedidos, n(e.prodDespacho))
    };
    var horasOperativas = horas.recepcion + horas.picking + horas.packing + horas.despacho;
    var horasTotales = horasOperativas + horas.almacenamiento;
    // El espacio operativo (muelles, playa, packing) lo usan recepción, packing y despacho; el picking se hace en los
    // pasillos de los racks, que ya paga almacenamiento.
    var horasEspacioOperativo = horas.recepcion + horas.packing + horas.despacho;

    var espacioAlmacenamiento = n(e.m2Almacenamiento) * precioM2;
    var espacioOperativo = n(e.m2Operativo) * precioM2;
    var inv = posTotales * n(e.rackInversionPosicion);
    var racksMes = (inv > 0 ? div(inv, n(e.rackVidaAnios) * 12) : 0) + inv / 2 * pct(e.tasaCapitalPct) / 12;
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
        : (k === 'picking' || !(horasEspacioOperativo > 0) ? 0 : espacioOperativo * horas[k] / horasEspacioOperativo);
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
    var costoPedidoSinPicking = div(porId.packing.total + porId.despacho.total, pedidos);
    var mi = e.margenPct, im = e.impuestosPct;

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
      costoPedidoSinPicking: costoPedidoSinPicking,
      total: total,
      // Tarifario: cada actividad se cobra una sola vez (el pedido va sin el picking, que se cobra por línea).
      tarifario: {
        pallet: precioConMargen(div(porId.recepcion.total, pallets), mi, im),
        posicionOcupada: precioConMargen(div(porId.almacenamiento.total, posOcupadas), mi, im),
        posicionDisponible: precioConMargen(div(porId.almacenamiento.total, posTotales), mi, im),
        linea: precioConMargen(porLinea, mi, im),
        pedido: precioConMargen(costoPedidoSinPicking, mi, im),
        facturacionMes: precioConMargen(total, mi, im)
      }
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
      facturableSumandoBultos: facturableBulto * cantidad,   // si el transportista redondea cada bulto por separado
      cobraPorVolumen: pvEnvio > realEnvio,
      densidad: div(real, volCm3 / 1e6),
      densidadCorte: div(1e6, divisor),
      diferenciaKg: facturableEnvio - realEnvio
    };
  }

  /* Armado de respaldo: una orientación o dos bloques (corte guillotina). Solo cuenta, no dice dónde va cada caja. */
  function mejorCapaDosBloques(L, W, p, q) {
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

  /* Mejor capa por cortes de guillotina: programación dinámica sobre los «patrones normales» (las medidas que se
   * pueden armar como a·p + b·q). Devuelve la cantidad y dónde va cada caja, para dibujarla e imprimirla.
   * Trabaja en milímetros enteros: la caja se redondea hacia arriba y el área hacia abajo (nunca promete de más).
   * Si las medidas dan demasiados patrones (cajas muy chicas para el área), usa el armado de dos bloques, sin dibujo. */
  var MAX_PATRONES = 120;
  var memoCapa = {}, clavesMemo = [];
  function patronesNormales(largo, a, b) {
    var vistos = {}, lista = [];
    for (var i = 0; i * a <= largo; i++) {
      for (var j = 0; i * a + j * b <= largo; j++) {
        var x = i * a + j * b;
        if (!vistos[x]) { vistos[x] = true; lista.push(x); if (lista.length > MAX_PATRONES) { return null; } }
      }
    }
    return lista.sort(function (u, v) { return u - v; });
  }
  function indiceHasta(lista, x) {   // el mayor patrón ≤ x (el 0 siempre está)
    var lo = 0, hi = lista.length - 1;
    while (lo < hi) { var m = (lo + hi + 1) >> 1; if (lista[m] <= x) { lo = m; } else { hi = m - 1; } }
    return lo;
  }
  function capaGuillotina(L, W, p, q) {
    var Lm = Math.floor(L * 10 + 1e-6), Wm = Math.floor(W * 10 + 1e-6);
    var pm = Math.ceil(p * 10 - 1e-6), qm = Math.ceil(q * 10 - 1e-6);
    var NL = patronesNormales(Lm, pm, qm), NW = patronesNormales(Wm, pm, qm);
    if (!NL || !NW) { return null; }
    var nl = NL.length, nw = NW.length, f = [], eleccion = [];
    for (var i = 0; i < nl; i++) {
      f.push(new Array(nw)); eleccion.push(new Array(nw));
      for (var j = 0; j < nw; j++) {
        var l = NL[i], w = NW[j];
        var a0 = Math.floor(l / pm) * Math.floor(w / qm), a1 = Math.floor(l / qm) * Math.floor(w / pm);
        var mejor = Math.max(a0, a1), el = { t: 'f', girada: a1 > a0 };
        for (var k = 1; k < i; k++) {                     // corte a lo largo
          var r = indiceHasta(NL, l - NL[k]);
          var v = f[k][j] + f[r][j];
          if (v > mejor) { mejor = v; el = { t: 'l', k: k, r: r }; }
        }
        for (var k2 = 1; k2 < j; k2++) {                  // corte a lo ancho
          var r2 = indiceHasta(NW, w - NW[k2]);
          var v2 = f[i][k2] + f[i][r2];
          if (v2 > mejor) { mejor = v2; el = { t: 'a', k: k2, r: r2 }; }
        }
        f[i][j] = mejor; eleccion[i][j] = el;
      }
    }
    var cajas = [];
    (function armar(i, j, x0, y0) {
      var el = eleccion[i][j];
      if (el.t === 'l') { armar(el.k, j, x0, y0); armar(el.r, j, x0 + NL[el.k], y0); return; }
      if (el.t === 'a') { armar(i, el.k, x0, y0); armar(i, el.r, x0, y0 + NW[el.k]); return; }
      var bl = el.girada ? qm : pm, ba = el.girada ? pm : qm;
      for (var a = 0; (a + 1) * bl <= NL[i]; a++) {
        for (var b = 0; (b + 1) * ba <= NW[j]; b++) {
          cajas.push({ x: (x0 + a * bl) / 10, y: (y0 + b * ba) / 10, largo: bl / 10, ancho: ba / 10, girada: el.girada });
        }
      }
    })(nl - 1, nw - 1, 0, 0);
    return { cantidad: f[nl - 1][nw - 1], cajas: cajas };
  }

  /* La mejor capa de rectángulos p×q en un área L×W, con el dibujo cuando se puede. */
  function planoCapa(L, W, p, q) {
    if (!(p > 0 && q > 0 && L > 0 && W > 0)) { return { cantidad: 0, cajas: [] }; }
    var clave = [L, W, p, q].join('|');
    if (memoCapa[clave]) { return memoCapa[clave]; }
    var g = capaGuillotina(L, W, p, q);
    var respaldo = mejorCapaDosBloques(L, W, p, q);
    var res = (g && g.cantidad >= respaldo) ? g : { cantidad: respaldo, cajas: null };
    memoCapa[clave] = res; clavesMemo.push(clave);
    if (clavesMemo.length > 60) { delete memoCapa[clavesMemo.shift()]; }
    return res;
  }
  function mejorCapa(L, W, p, q) { return planoCapa(L, W, p, q).cantidad; }

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
      var plano = planoCapa(L, W, o.p, o.q);
      var porCapa = plano.cantidad;
      var capas = o.alto > 0 ? Math.floor(alturaUtil / o.alto + 1e-9) : 0;
      if (capas < 0) { capas = 0; }
      var porAltura = porCapa * capas;
      var bultos = Math.max(0, Math.min(porAltura, maxPorPeso));
      if (!mejor || bultos > mejor.bultos) {
        mejor = { orientacion: o.nombre, porCapa: porCapa, capas: capas, porAltura: porAltura, bultos: bultos, altoCaja: o.alto, plano: plano, base: [o.p, o.q] };
      }
    });
    var bultos = mejor.bultos;
    var limitadoPor = bultos < mejor.porAltura ? 'peso' : 'altura y base';
    var capasUsadas = mejor.porCapa > 0 ? Math.ceil(bultos / mejor.porCapa - 1e-9) : 0;
    var alturaCargada = n(e.alturaPallet) + capasUsadas * mejor.altoCaja;
    var volCaja = l * a * h;
    var cantidad = Math.max(0, Math.round(n(e.cantidad)));
    var giradas = mejor.plano.cajas ? mejor.plano.cajas.filter(function (c) { return c.girada; }).length : NaN;
    return {
      orientacion: mejor.orientacion,
      porCapa: mejor.porCapa,
      capa: { cajas: mejor.plano.cajas, largo: L, ancho: W, baseCaja: mejor.base, giradas: giradas, derechas: mejor.porCapa - giradas },
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
    var plano = planoCapa(n(e.largoInterior), n(e.anchoInterior), n(e.palletLargo), n(e.palletAncho));
    var piso = plano.cantidad;
    var niveles = e.apilable && n(e.alturaPalletCargado) > 0
      ? Math.max(1, Math.floor(n(e.altoInterior) / n(e.alturaPalletCargado) + 1e-9)) : 1;
    if (n(e.alturaPalletCargado) > n(e.altoInterior)) { niveles = 0; }
    return { piso: piso, niveles: niveles, total: piso * niveles, plano: { cajas: plano.cajas, largo: n(e.largoInterior), ancho: n(e.anchoInterior) } };
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
    planoCapa: planoCapa,
    redondearArriba: redondearArriba,
    sensibilidad: sensibilidad,
    precioConMargen: precioConMargen,
    vacacionesLey: vacacionesLey,
    FACTORES: [0.6, 0.8, 1, 1.2, 1.4]
  };
});
