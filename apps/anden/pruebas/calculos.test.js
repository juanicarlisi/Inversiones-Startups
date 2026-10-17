/*
 * Pruebas de las fórmulas: cada caso reproduce un ejemplo resuelto a mano (las cuentas
 * están en los comentarios). Se corren con:  node --test pruebas/
 * Las entradas son fijas (no dependen de referencias.js), para que actualizar las
 * referencias cada mes no rompa las pruebas.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/calculos.js');

function cerca(real, esperado, tolerancia, mensaje) {
  const tol = tolerancia === undefined ? 0.01 : tolerancia;
  assert.ok(Math.abs(real - esperado) <= tol, `${mensaje || ''} esperado ${esperado}, dio ${real}`);
}

/* ───────────── 1. Tarifa al transportista ───────────── */
const baseTarifa = {
  ingreso: 3900, paradas: 60, dias: 24, fallidos: 5, reentrega: 80, cobroDevolucion: 0,
  costoPropio: 450, fijosRuta: 0, modalidad: 'paquete', tarifaPaquete: 2200, pagaFallidos: false,
  tarifaJornada: 130000, tarifaKm: 1100, kmFijos: 35, kmPorParada: 1.2,
  tarifaHora: 16000, horasFijas: 1.5, minPorParada: 7, margenObjetivo: 15, costoTransportistaDia: 0
};

test('1. tarifa por paquete entregado: margen, equilibrio y tarifa máxima', () => {
  const r = C.tarifaTransportista(baseTarifa);
  // Entregados = 60 × (1 − 0,05) = 57
  cerca(r.entregados, 57);
  // Re-entregas = 60 × 0,05 × 0,80 = 2,4 ; paquetes nuevos = 60 − 2,4 = 57,6
  cerca(r.reentregas, 2.4);
  cerca(r.nuevos, 57.6);
  // Ingreso = 57 × 3.900 = 222.300
  cerca(r.ingresoRuta, 222300);
  // Pago al transportista = 57 × 2.200 = 125.400 ; costo propio = 60 × 450 = 27.000
  cerca(r.pagoTransportista, 125400);
  cerca(r.costoPropioRuta, 27000);
  // Margen = 222.300 − 125.400 − 27.000 = 69.900  (31,44% del ingreso; 1.226,32 por entregado)
  cerca(r.margenRuta, 69900);
  cerca(r.margenPct, 31.444, 0.001);
  cerca(r.margenPorEntregado, 1226.3158, 0.001);
  // Sin costo fijo por ruta, cada parada deja 0,95×3.900 − 450 − 0,95×2.200 = 1.165: no hay equilibrio que buscar
  cerca(r.contribucionPorParada, 1165);
  assert.equal(r.equilibrio, 0);
  // Tarifa máxima para 15%: (222.300 × 0,85 − 27.000) ÷ 57 = 161.955 ÷ 57 = 2.841,32
  cerca(r.pagoMaximo, 161955);
  cerca(r.tarifaMaxima, 2841.3158, 0.001);
  // Mes: 69.900 × 24 = 1.677.600
  cerca(r.margenMes, 1677600);
});

test('1. tarifa por jornada: el volumen define el equilibrio', () => {
  const r = C.tarifaTransportista({ ...baseTarifa, modalidad: 'jornada' });
  // Margen = 222.300 − 130.000 − 27.000 = 65.300
  cerca(r.margenRuta, 65300);
  // Equilibrio = 130.000 ÷ (0,95 × 3.900 − 450) = 130.000 ÷ 3.255 = 39,94 → 40 paradas
  cerca(r.equilibrio, 39.9386, 0.001);
  assert.equal(r.equilibrioParadas, 40);
  // Tarifa máxima por jornada = 161.955
  cerca(r.tarifaMaxima, 161955);
});

test('1. tarifa por km y por hora', () => {
  const k = C.tarifaTransportista({ ...baseTarifa, modalidad: 'km' });
  // km = 35 + 1,2 × 60 = 107 ; pago = 1.100 × 107 = 117.700 ; margen = 222.300 − 117.700 − 27.000 = 77.600
  cerca(k.km, 107);
  cerca(k.margenRuta, 77600);
  // Equilibrio = 1.100 × 35 ÷ (3.705 − 450 − 1.100 × 1,2) = 38.500 ÷ 1.935 = 19,90 → 20
  assert.equal(k.equilibrioParadas, 20);
  // Tarifa máxima por km = 161.955 ÷ 107 = 1.513,60
  cerca(k.tarifaMaxima, 1513.598, 0.001);

  const h = C.tarifaTransportista({ ...baseTarifa, modalidad: 'hora' });
  // horas = 1,5 + 7 × 60 ÷ 60 = 8,5 ; pago = 16.000 × 8,5 = 136.000 ; margen = 59.300
  cerca(h.horas, 8.5);
  cerca(h.margenRuta, 59300);
  // Equilibrio = 24.000 ÷ (3.705 − 450 − 1.866,67) = 17,29 → 18
  assert.equal(h.equilibrioParadas, 18);
  cerca(h.tarifaMaxima, 19053.53, 0.01);
});

test('1. del lado del transportista: lo que le queda, desde cuántos paquetes y su tarifa mínima', () => {
  const r = C.tarifaTransportista({ ...baseTarifa, costoTransportistaDia: 86400, horasTransportista: 9 });
  // Cobra 57 × 2.200 = 125.400 ; le quedan 125.400 − 86.400 = 39.000 por día, 936.000 por mes, 4.333,33 por hora
  cerca(r.gananciaTransportistaDia, 39000);
  cerca(r.gananciaTransportistaMes, 936000);
  cerca(r.gananciaTransportistaHora, 4333.333, 0.001);
  // Cubre su costo desde 86.400 ÷ (2.200 × 0,95) = 41,3 → 42 paquetes cargados ; tarifa mínima 86.400 ÷ 57 = 1.515,79
  assert.equal(r.equilibrioTransportista, 42);
  cerca(r.tarifaMinimaTransportista, 1515.789, 0.001);
  // Las unidades de la tarifa salen del cálculo (no de dividir el pago por la tarifa, que falla con tarifa 0)
  assert.equal(r.unidadesTarifa, 57);
  assert.equal(C.tarifaTransportista({ ...baseTarifa, tarifaPaquete: 0 }).unidadesTarifa, 57);
});

test('1. ramas: fallidos pagos, cobro por devolución y fijos por ruta', () => {
  // Pagando también los fallidos: 60 × 2.200 = 132.000 ; con $1.000 por devolución: ingreso 222.300 + 0,6 × 1.000 = 222.900
  // y $20.000 fijos por ruta: margen = 222.900 − 132.000 − 27.000 − 20.000 = 43.900
  const r = C.tarifaTransportista({ ...baseTarifa, pagaFallidos: true, cobroDevolucion: 1000, fijosRuta: 20000 });
  cerca(r.pagoTransportista, 132000);
  cerca(r.ingresoRuta, 222900);
  cerca(r.margenRuta, 43900);
  // Aporte por parada = 0,95 × 3.900 + 0,05 × 0,2 × 1.000 − 450 − 2.200 = 1.065 → equilibrio 20.000 ÷ 1.065 = 18,8 → 19
  cerca(r.contribucionPorParada, 1065);
  assert.equal(r.equilibrioParadas, 19);
});

test('1. si cada parada pierde plata, no hay volumen que la salve', () => {
  const r = C.tarifaTransportista({ ...baseTarifa, tarifaPaquete: 3800 });
  // 0,95 × 3.900 − 450 − 0,95 × 3.800 = −355 por parada
  cerca(r.contribucionPorParada, -355);
  assert.equal(r.equilibrio, Infinity);
});

/* ───────────── 2. Costo por recorrido ───────────── */
const baseRecorrido = {
  valorVehiculo: 33000000, residualPct: 35, vidaAnios: 5, tasaCapitalPct: 8, patentePct: 3,
  seguroMes: 110000, cocheraMes: 120000, otrosFijosMes: 40000,
  consumoL100: 10, precioCombustible: 2089, cubiertasCantidad: 4, cubiertaPrecio: 310740, cubiertaVidaKm: 45000,
  mantenimientoKm: 80, peajesRecorrido: 0, choferHora: 14000, acompanantes: 0, acompananteHora: 0,
  kmRecorrido: 120, horasRecorrido: 9, paradasRecorrido: 60, paquetesRecorrido: 65, recorridosMes: 24,
  gastosGeneralesPct: 8
};

test('2. costo por recorrido de un utilitario de última milla', () => {
  const r = C.costoRecorrido(baseRecorrido);
  // Amortización = 33.000.000 × (1 − 0,35) ÷ 60 meses = 357.500
  cerca(r.amortizacionMes, 357500);
  // Capital = 33.000.000 × (1 + 0,35) ÷ 2 × 8% ÷ 12 = 148.500
  cerca(r.capitalMes, 148500);
  // Patente = 33.000.000 × 3% ÷ 12 = 82.500
  cerca(r.patenteMes, 82500);
  // Fijos = 357.500 + 148.500 + 82.500 + 110.000 + 120.000 + 40.000 = 858.500 → ÷ 24 = 35.770,83 por recorrido
  cerca(r.fijosMes, 858500);
  cerca(r.fijoRecorrido, 35770.8333, 0.001);
  // Combustible = 10 L/100 km × 2.089 = 208,90 $/km ; cubiertas = 4 × 310.740 ÷ 45.000 = 27,62 $/km
  cerca(r.combustibleKm, 208.9);
  cerca(r.cubiertasKm, 27.6213, 0.001);
  // Variable = 208,90 + 27,62 + 80 = 316,52 $/km → × 120 km = 37.982,56
  cerca(r.variableKm, 316.5213, 0.001);
  cerca(r.variableRecorrido, 37982.56, 0.01);
  // Chofer = 9 h × 14.000 = 126.000
  cerca(r.personalRecorrido, 126000);
  // Subtotal = 35.770,83 + 37.982,56 + 126.000 = 199.753,39 ; gastos generales 8% = 15.980,27
  cerca(r.subtotal, 199753.39, 0.01);
  cerca(r.partes.gastosGenerales, 15980.27, 0.01);
  // Total = 215.733,66 ; por km 1.797,78 ; por hora 23.970,41 ; por parada 3.595,56 ; por paquete 3.318,98
  cerca(r.total, 215733.66, 0.01);
  cerca(r.porKm, 1797.78, 0.01);
  cerca(r.porHora, 23970.41, 0.01);
  cerca(r.porParada, 3595.56, 0.01);
  cerca(r.porPaquete, 3318.98, 0.01);
});

/* ───────────── 3. Costo laboral ───────────── */
const baseLaboral = {
  basico: 1126149.40, antiguedadAnios: 0, antiguedadPct: 1, presentismoPct: 0, adicionalesRem: 0,
  noRem: 0, noRemIntegra: false, noRemContribPct: 0, viaticoDia: 16219.85,
  contribucionesPct: 18, obraSocialPct: 6, detraccion: 7003.68, artPct: 5, artFija: 1935,
  seguroVida: 424.62, aportesConvenio: 29000,
  horasSemana: 48, diasSemana: 6, vacacionesDias: 14, feriados: 16, ausentismoPct: 5, improductivoPct: 12.5
};

test('3. costo laboral de un conductor de 1ª (CCT 40/89)', () => {
  const r = C.costoLaboral(baseLaboral);
  // SAC = 1.126.149,40 ÷ 12 = 93.845,78
  cerca(r.sacMes, 93845.78, 0.01);
  // Plus de vacaciones = 1.126.149,40 × 14 × (1/25 − 1/30) ÷ 12 = 8.758,94
  cerca(r.plusVacacionesMes, 8758.94, 0.01);
  // Base de contribuciones = sueldo + SAC + plus = 1.228.754,12
  cerca(r.baseContribuciones, 1228754.12, 0.01);
  // Contribuciones = (1.228.754,12 − 7.003,68) × 18% = 219.915,08
  cerca(r.contribuciones, 219915.08, 0.01);
  // Obra social = 1.228.754,12 × 6% = 73.725,25 ; ART = 1.228.754,12 × 5% + 1.935 = 63.372,71
  cerca(r.obraSocial, 73725.25, 0.01);
  cerca(r.art, 63372.71, 0.01);
  // Días presentes por año = (6 × 365 ÷ 7 − 14 × 6 ÷ 7 − 16) × 0,95 = (312,857 − 12 − 16) × 0,95 = 270,614
  // Días trabajados por mes = 22,551 ; comida = 16.219,85 × 22,551 = 365.776,93
  cerca(r.diasTrabajadosMes, 22.5512, 0.0001);
  cerca(r.viaticosMes, 365776.93, 0.01);
  // Total = 1.126.149,40 + 93.845,78 + 8.758,94 + 365.776,93 + 219.915,08 + 73.725,25 + 63.372,71 + 424,62 + 29.000
  cerca(r.total, 1980968.70, 0.01);
  // Horas productivas = 270,614 × 8 h ÷ 12 × (1 − 0,125) = 157,858 por mes → 12.549,03 por hora
  cerca(r.horasProductivasMes, 157.8583, 0.0001);
  cerca(r.costoHoraProductiva, 12549.03, 0.01);
  // Horas pagadas = 48 × 365 ÷ 7 ÷ 12 = 208,57 → 9.497,80 por hora pagada
  cerca(r.costoHoraPagada, 9497.80, 0.01);
});

test('3. conductor de 1ª con comida y viático especial (ítem 4.1.13)', () => {
  const r = C.costoLaboral({ ...baseLaboral, viaticoEspecialDia: 8646.93 });
  // Viático especial = 8.646,93 × 22,5512 = 194.998,57 ; comida + viático = 365.776,93 + 194.998,57 = 560.775,49
  cerca(r.viaticoEspecialMes, 194998.57, 0.01);
  cerca(r.comidaMes, 365776.93, 0.01);
  cerca(r.viaticosMes, 560775.49, 0.01);
  // Sin cargas: el total sube exactamente eso → 1.980.968,70 + 194.998,57 = 2.175.967,27 ; ÷ 157,858 h = 13.784,30
  cerca(r.total, 2175967.27, 0.01);
  cerca(r.costoHoraProductiva, 13784.30, 0.01);
  // Las cargas se miden sobre el sueldo bruto (remunerativo + no remunerativo), no sobre lo que cobra en mano
  cerca(r.sueldoBruto, 1126149.40, 0.01);
});

test('3. vacaciones según la antigüedad (LCT art. 150) y días que no pueden dar negativo', () => {
  assert.deepEqual([0, 5, 6, 10, 11, 20, 21].map(C.vacacionesLey), [14, 14, 21, 21, 28, 28, 35]);
  assert.equal(C.costoLaboral({ ...baseLaboral, antiguedadAnios: 7 }).vacacionesLey, 21);
  // 400 feriados: los días presentes quedan en 0 (no negativos) y el costo por hora no se puede calcular
  const r = C.costoLaboral({ ...baseLaboral, feriados: 400 });
  assert.equal(r.horasProductivasMes, 0);
  assert.ok(Number.isNaN(r.costoHoraProductiva));
});

test('3. costo laboral de Maestranza A (CCT 130/75) con suma no remunerativa que integra', () => {
  const r = C.costoLaboral({
    ...baseLaboral, basico: 1183900, antiguedadAnios: 3, presentismoPct: 8.33,
    noRem: 120000, noRemIntegra: true, noRemContribPct: 6, viaticoDia: 0, aportesConvenio: 28000
  });
  // Factor = (1 + 3 × 1%) × (1 + 8,33%) = 1,115799
  // Remunerativo = 1.183.900 × 1,115799 = 1.320.994,44 ; no remunerativo = 120.000 × 1,115799 = 133.895,88
  cerca(r.remunerativo, 1320994.44, 0.01);
  cerca(r.noRemunerativo, 133895.88, 0.01);
  // SAC = (1.320.994,44 + 133.895,88) ÷ 12 = 121.240,86
  cerca(r.sacMes, 121240.86, 0.01);
  // Contribuciones = (1.320.994,44 × 1,091111 − 7.003,68) × 18% = 258.182,64
  cerca(r.contribuciones, 258182.64, 0.01);
  // OSECAC sobre lo no remunerativo = 133.895,88 × 1,091111 × 6% = 8.765,72
  cerca(r.contribNoRem, 8765.72, 0.01);
  // Total = 2.043.303,66
  cerca(r.total, 2043303.66, 0.01);
});

/* ───────────── 4. Costo por paquete clasificado ───────────── */
const baseHub = {
  paquetesTurno: 8000, horasProdTurno: 7, costoHora: 12000, retrabajoPct: 3,
  prodInduccion: 500, prodClasificacion: 200, prodCarga: 300,
  operariosPorSupervisor: 15, factorSupervisor: 1.4, turnosMes: 26,
  m2: 2500, alquilerUsdM2: 7.1, tc: 1535, serviciosM2: 1500,
  equiposInversion: 45000000, equiposVidaAnios: 5, equiposMantPct: 10, tasaCapitalPct: 8,
  sistemasMes: 500000, insumosPaquete: 60
};

test('4. hub: personal que rota y ventanas de cada proceso', () => {
  // Personal que rota: techo(83,87 horas-hombre ÷ 7 h) = 12 operarios (con personal fijo, 3 + 6 + 4 = 13)
  const rota = C.costoClasificacion({ ...baseHub, polivalente: true });
  assert.equal(rota.operarios, 12);
  assert.equal(rota.dedicados, 13);
  cerca(rota.costoOperarios, 12 * 7 * 12000);
  // Ventanas de 2, 3 y 2 h (una después de la otra, suman 7): 16 ÷ 2 = 8 ; 41,2 ÷ 3 = 13,7 → 14 ; 26,67 ÷ 2 = 13,3 → 14
  const v = { ...baseHub, ventanaInduccion: 2, ventanaClasificacion: 3, ventanaCarga: 2 };
  const fijo = C.costoClasificacion(v);
  assert.deepEqual(fijo.procesos.map(p => p.personas), [8, 14, 14]);
  assert.equal(fijo.operarios, 36);
  // Las mismas ventanas con personal que rota: el mayor entre 12 y la cuadrilla más grande (14)
  assert.equal(C.costoClasificacion({ ...v, polivalente: true }).operarios, 14);
  // Ventana 0 = todo el turno; una ventana más larga que el turno se limita al turno
  assert.deepEqual(C.costoClasificacion({ ...baseHub, ventanaCarga: 12 }).procesos.map(p => p.personas), [3, 6, 4]);
});

test('4. hub: cuánto falta para que sobre una persona, y estructura', () => {
  const r = C.costoClasificacion(baseHub);
  // Clasificación: 41,2 h-h con 6 personas de 7 h → sobra una con 41,2 − 5 × 7 = 6,2 h-h menos (+17,7 % de productividad)
  cerca(r.ahorroParaSacarUna, 6.2, 1e-9);
  cerca(r.mejoraParaSacarUna, 17.714, 0.001);
  // Estructura de $2.600.000 por mes ÷ 26 turnos = 100.000 por turno → +12,50 por paquete
  const e = C.costoClasificacion({ ...baseHub, estructuraMes: 2600000 });
  cerca(e.estructuraTurno, 100000);
  cerca(e.porPaquete - r.porPaquete, 12.5, 1e-9);
});

test('4. hub: dotación por proceso y costo por paquete', () => {
  const r = C.costoClasificacion(baseHub);
  // Inducción: 8.000 ÷ 500 = 16 h-h → 16 ÷ 7 = 2,29 → 3 personas
  // Clasificación: 8.000 × 1,03 = 8.240 ÷ 200 = 41,2 h-h → 5,89 → 6 personas
  // Carga: 8.000 ÷ 300 = 26,67 h-h → 3,81 → 4 personas
  assert.deepEqual(r.procesos.map(p => p.personas), [3, 6, 4]);
  assert.equal(r.operarios, 13);
  assert.equal(r.supervisores, 1);
  // Mano de obra = 13 × 7 × 12.000 = 1.092.000 ; supervisión = 1 × 7 × 12.000 × 1,4 = 117.600
  cerca(r.costoOperarios, 1092000);
  cerca(r.costoSupervision, 117600);
  // Espacio = 2.500 m² × (7,1 × 1.535 + 1.500) = 30.996.250 por mes → ÷ 26 = 1.192.163,46
  cerca(r.espacioMes, 30996250);
  cerca(r.espacioTurno, 1192163.46, 0.01);
  // Equipos = 45 M ÷ 60 + 45 M × 10% ÷ 12 + 22,5 M × 8% ÷ 12 = 1.275.000 por mes → 49.038,46 por turno
  cerca(r.equiposMes, 1275000);
  // Total por turno = 1.092.000 + 117.600 + 1.192.163,46 + 49.038,46 + 19.230,77 + 480.000 = 2.950.032,69
  cerca(r.totalTurno, 2950032.69, 0.01);
  // Por paquete = 2.950.032,69 ÷ 8.000 = 368,75
  cerca(r.porPaquete, 368.754, 0.001);
  assert.equal(r.procesoQueMasHorasLleva, 'Clasificación por ruta');
});

/* ───────────── 5. Costo por proceso de almacenamiento ───────────── */
const baseDeposito = {
  costoHora: 12000, horasProdMesPersona: 157.858, alquilerUsdM2: 7.1, tc: 1535, serviciosM2: 1500,
  palletsRecibidos: 1200, prodRecepcion: 10, otrosRecepcionMes: 1500000,
  posicionesTotales: 2000, ocupacionPct: 85, m2Almacenamiento: 1800, rackInversionPosicion: 120000, rackVidaAnios: 15,
  horasInventarioMes: 80, otrosAlmacenamientoMes: 0,
  lineasMes: 30000, prodPicking: 70, otrosPickingMes: 0,
  pedidosMes: 10000, prodPacking: 30, insumosPedido: 350, otrosPackingMes: 0,
  prodDespacho: 120, otrosDespachoMes: 1500000,
  m2Operativo: 700, estructuraMes: 9000000, tasaCapitalPct: 8
};

test('5. depósito: costeo por actividades', () => {
  const r = C.costoAlmacenamiento(baseDeposito);
  const a = Object.fromEntries(r.actividades.map(x => [x.id, x]));
  // Precio del m² = 7,1 × 1.535 + 1.500 = 12.398,50
  cerca(r.precioM2, 12398.5);
  // Horas: recepción 1.200 ÷ 10 = 120 ; picking 30.000 ÷ 70 = 428,57 ; packing 10.000 ÷ 30 = 333,33 ; despacho 10.000 ÷ 120 = 83,33 ; inventario 80
  cerca(a.recepcion.horasHombre, 120);
  cerca(a.picking.horasHombre, 428.5714, 0.0001);
  cerca(r.horasTotales, 1045.2381, 0.0001);
  // Racks = 2.000 × 120.000 = 240 M → 240 M ÷ 180 + 120 M × 8% ÷ 12 = 1.333.333,33 + 800.000 = 2.133.333,33
  cerca(r.racksMes, 2133333.33, 0.01);
  // El espacio operativo (muelles, playa, packing) va a recepción, packing y despacho: 120 + 333,33 + 83,33 = 536,67 h.
  // Recepción = 120 × 12.000 + 1.500.000 + 700 × 12.398,5 × 120 ÷ 536,67 + 9.000.000 × 120 ÷ 1.045,24 = 5.913.892,19
  cerca(a.recepcion.total, 5913892.19, 0.01);
  // El picking se hace en los pasillos de los racks, que paga almacenamiento: no lleva espacio operativo
  assert.equal(a.picking.espacio, 0);
  // Almacenamiento = 80 × 12.000 + 1.800 × 12.398,5 + 2.133.333,33 + 9.000.000 × 80 ÷ 1.045,24 = 26.099.471,60
  cerca(a.almacenamiento.total, 26099471.60, 0.01);
  cerca(r.total, 61172440.48, 0.01);
  // Unitarios (el total no cambia: solo se mueve el reparto del espacio operativo)
  cerca(r.porPalletRecibido, 4928.24, 0.01);
  cerca(r.porPosicionOcupada, 15352.63, 0.01);   // ÷ (2.000 × 85%) = ÷ 1.700
  cerca(r.porLinea, 294.44, 0.01);
  cerca(r.porPedido, 2915.91, 0.01);             // (picking + packing + despacho) ÷ 10.000
  cerca(r.personasEquivalentes, 6.6214, 0.001);
});

test('5. depósito: tarifario mínimo (el pedido va sin el picking, que se cobra por línea)', () => {
  const r = C.costoAlmacenamiento({ ...baseDeposito, margenPct: 15, impuestosPct: 0 });
  // Pedido sin picking = (packing 15.760.811,63 + despacho 4.565.202,91) ÷ 10.000 = 2.032,60 → ÷ 0,85 = 2.391,29
  cerca(r.costoPedidoSinPicking, 2032.60, 0.01);
  cerca(r.tarifario.pedido, 2391.29, 0.01);
  // Pallet 4.928,24 ÷ 0,85 = 5.797,93 ; línea 294,44 ÷ 0,85 = 346,40 ; facturación 61.172.440,48 ÷ 0,85 = 71.967.577,04
  cerca(r.tarifario.pallet, 5797.93, 0.01);
  cerca(r.tarifario.linea, 346.40, 0.01);
  cerca(r.tarifario.facturacionMes, 71967577.04, 0.01);
  // Cobrar pedido con picking y además la línea cobraría el picking dos veces: la suma del tarifario es la facturación
  const t = r.tarifario;
  cerca(t.pallet * 1200 + t.posicionOcupada * 1700 + t.linea * 30000 + t.pedido * 10000, t.facturacionMes, 0.05);
});

/* ───────────── 6. Peso volumétrico y cubicaje ───────────── */
test('6. peso volumétrico: el ejemplo de DHL (2 bultos de 120 × 80 × 50 cm)', () => {
  const base = { largo: 120, ancho: 80, alto: 50, pesoReal: 0, cantidad: 2, redondeo: 0 };
  // Aéreo: 120 × 80 × 50 ÷ 6.000 × 2 = 160 kg ; marítimo ÷ 1.000 = 960 kg ; tren ÷ 3.000 = 320 kg
  cerca(C.pesoVolumetrico({ ...base, divisor: 6000 }).pesoVolEnvio, 160);
  cerca(C.pesoVolumetrico({ ...base, divisor: 1000 }).pesoVolEnvio, 960);
  cerca(C.pesoVolumetrico({ ...base, divisor: 3000 }).pesoVolEnvio, 320);
});

test('6. peso facturable con divisor 5.000 y redondeo al medio kilo', () => {
  const r = C.pesoVolumetrico({ largo: 40, ancho: 30, alto: 30, pesoReal: 6, cantidad: 50, divisor: 5000, redondeo: 0.5 });
  // Bulto: 36.000 cm³ ÷ 5.000 = 7,2 kg > 6 kg reales → 7,5 kg facturables
  cerca(r.pesoVolBulto, 7.2);
  cerca(r.facturableBulto, 7.5);
  // Envío: 1,8 m³ → 360 kg volumétricos contra 300 kg reales → 360 kg
  cerca(r.volumenEnvioM3, 1.8);
  cerca(r.facturableEnvio, 360);
  // Si el transportista redondea cada bulto por separado: 50 × 7,5 = 375 kg (el envío entero, 360)
  cerca(r.facturableSumandoBultos, 375);
  assert.equal(r.cobraPorVolumen, true);
  // Densidad = 6 ÷ 0,036 = 166,7 kg/m³ ; corte = 1.000.000 ÷ 5.000 = 200 kg/m³
  cerca(r.densidad, 166.667, 0.001);
  cerca(r.densidadCorte, 200);
});

test('6. cubicaje: cajas de 40 × 30 × 30 en pallet de 1.000 × 1.200', () => {
  // Capa: un bloque de 120 × 40 con cajas giradas (4) + 120 × 60 con cajas derechas (3 × 2 = 6) = 10 por capa
  assert.equal(C.mejorCapa(120, 100, 40, 30), 10);
  const r = C.cubicaje({
    largo: 40, ancho: 30, alto: 30, pesoReal: 6, cantidad: 50,
    palletLargo: 120, palletAncho: 100, alturaPallet: 15, alturaMaxima: 160,
    pesoMaxPallet: 1000, pesoPalletVacio: 25, cualquierLado: false
  });
  // Capas = (160 − 15) ÷ 30 = 4,83 → 4 ; bultos = 40 ; por peso entrarían (1.000 − 25) ÷ 6 = 162
  assert.equal(r.porCapa, 10);
  assert.equal(r.capas, 4);
  assert.equal(r.bultosPorPallet, 40);
  assert.equal(r.limitadoPor, 'altura y base');
  // Altura cargada = 15 + 4 × 30 = 135 cm ; peso = 25 + 40 × 6 = 265 kg
  cerca(r.alturaCargada, 135);
  cerca(r.pesoPallet, 265);
  // Aprovechamiento = 40 × 36.000 ÷ (120 × 100 × 145) = 82,76%
  cerca(r.aprovechamiento, 82.7586, 0.001);
  // Para 50 cajas: 2 pallets
  assert.equal(r.palletsNecesarios, 2);
});

test('6. capa por cortes de guillotina: 42 × 28 en un pallet de 120 × 100 entra 9 (antes 8) y el dibujo es válido', () => {
  // Franja de 28 cm con 2 cajas giradas + bloque de 84 cm con 2 + 2 + 3 cajas (28 + 84 ≤ 120 y 28 + 28 + 42 ≤ 100)
  assert.equal(C.mejorCapa(120, 100, 42, 28), 9);
  // Cada caja dentro del pallet y sin superponerse, en casos de 15 a 60 cm sobre 120 × 100 y 120 × 80
  let semilla = 7;
  const azar = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
  for (let n = 0; n < 60; n++) {
    const L = 120, W = n % 2 ? 100 : 80, p = 15 + Math.round(azar() * 45), q = 15 + Math.round(azar() * 45);
    const plano = C.planoCapa(L, W, p, q);
    assert.ok(plano.cajas, `${p}×${q}: sin dibujo`);
    assert.equal(plano.cajas.length, plano.cantidad, `${p}×${q}`);
    plano.cajas.forEach((a, i) => {
      assert.ok(a.x >= 0 && a.y >= 0 && a.x + a.largo <= L + 1e-9 && a.y + a.ancho <= W + 1e-9, `${p}×${q}: caja ${i} afuera`);
      plano.cajas.slice(i + 1).forEach(b => {
        const separadas = a.x + a.largo <= b.x + 1e-9 || b.x + b.largo <= a.x + 1e-9 || a.y + a.ancho <= b.y + 1e-9 || b.y + b.ancho <= a.y + 1e-9;
        assert.ok(separadas, `${p}×${q}: cajas superpuestas`);
      });
    });
    // Nunca menos que el armado de una orientación
    assert.ok(plano.cantidad >= Math.max(Math.floor(L / p) * Math.floor(W / q), Math.floor(L / q) * Math.floor(W / p)));
  }
});

test('6. cubicaje limitado por peso', () => {
  const r = C.cubicaje({
    largo: 40, ancho: 30, alto: 30, pesoReal: 30, cantidad: 100,
    palletLargo: 120, palletAncho: 100, alturaPallet: 15, alturaMaxima: 160,
    pesoMaxPallet: 1000, pesoPalletVacio: 25, cualquierLado: false
  });
  // Por peso: (1.000 − 25) ÷ 30 = 32,5 → 32 cajas (por altura entrarían 40)
  assert.equal(r.bultosPorPallet, 32);
  assert.equal(r.limitadoPor, 'peso');
});

test('6. pallets en un contenedor de 20 pies', () => {
  // 1.000 × 1.200: 4 filas de 120 × 2 a lo ancho + 1 girado en el resto = 9 ; europallet: 11
  assert.equal(C.palletsEnEspacio({ largoInterior: 589.8, anchoInterior: 235.2, altoInterior: 239.3, palletLargo: 120, palletAncho: 100, apilable: false, alturaPalletCargado: 135 }).total, 9);
  assert.equal(C.palletsEnEspacio({ largoInterior: 589.8, anchoInterior: 235.2, altoInterior: 239.3, palletLargo: 120, palletAncho: 80, apilable: false, alturaPalletCargado: 135 }).total, 11);
});

test('2. tarifario mínimo del recorrido: costo ÷ (1 − margen − impuestos)', () => {
  const r = C.costoRecorrido({ ...baseRecorrido, margenPct: 15, impuestosPct: 0 });
  // 215.733,66 ÷ 0,85 = 253.804,31 por viaje ; 3.318,98 ÷ 0,85 = 3.904,68 por paquete
  cerca(r.tarifario.viaje, 253804.31, 0.01);
  cerca(r.tarifario.paquete, 3904.68, 0.01);
  // Con 5 % de impuestos sobre lo facturado: 100 ÷ (1 − 0,15 − 0,05) = 125
  cerca(C.precioConMargen(100, 15, 5), 125, 1e-9);
  assert.ok(Number.isNaN(C.precioConMargen(100, 60, 40)));   // margen + impuestos de 100 %: no hay precio
});

/* ───────────── Divisores en cero: nunca se borra un costo en silencio ───────────── */
test('con un divisor obligatorio en cero el resultado no es un número (la pantalla muestra «—»)', () => {
  const nan = x => assert.ok(Number.isNaN(x), `esperado NaN, dio ${x}`);
  nan(C.costoRecorrido({ ...baseRecorrido, recorridosMes: 0 }).total);
  nan(C.costoRecorrido({ ...baseRecorrido, vidaAnios: 0 }).total);
  nan(C.costoRecorrido({ ...baseRecorrido, cubiertaVidaKm: 0 }).total);
  // Sin vehículo (valor 0) no hay amortización que dividir: el resto se calcula
  assert.ok(Number.isFinite(C.costoRecorrido({ ...baseRecorrido, valorVehiculo: 0, vidaAnios: 0 }).total));
  nan(C.costoLaboral({ ...baseLaboral, diasSemana: 0 }).total);
  nan(C.costoClasificacion({ ...baseHub, horasProdTurno: 0 }).porPaquete);
  nan(C.costoClasificacion({ ...baseHub, equiposVidaAnios: 0 }).porPaquete);
  assert.ok(Number.isFinite(C.costoClasificacion({ ...baseHub, equiposInversion: 0, equiposVidaAnios: 0 }).porPaquete));
  nan(C.costoAlmacenamiento({ ...baseDeposito, rackVidaAnios: 0 }).total);
  nan(C.costoAlmacenamiento({ ...baseDeposito, prodPicking: 0 }).total);
  // Sin volumen, la actividad no lleva horas aunque la productividad sea 0
  assert.ok(Number.isFinite(C.costoAlmacenamiento({ ...baseDeposito, lineasMes: 0, prodPicking: 0 }).total));
});

/* ───────────── Sensibilidad ───────────── */
test('sensibilidad: el margen por jornada crece con el volumen', () => {
  const filas = C.sensibilidad(C.tarifaTransportista, { ...baseTarifa, modalidad: 'jornada' }, 'paradas', C.FACTORES, r => r.margenRuta);
  assert.equal(filas.length, 5);
  // Con 36 paradas (−40%): 36 × 3.255 − 130.000 = −12.820
  cerca(filas[0].valor, -12820);
  cerca(filas[2].valor, 65300);
  assert.ok(filas[4].valor > filas[3].valor);
});
