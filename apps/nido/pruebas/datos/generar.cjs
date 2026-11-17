// Genera una copia de datos INVENTADA con la forma exacta que guarda la app anterior (colecciones mov/<id> y cfg/<id>).
// Sirve para probar la migración. Ningún nombre, monto ni banco es real. Uso: node pruebas/datos/generar.cjs
const fs = require('fs'), path = require('path');
const { cargarVieja } = require('../cargar.cjs');
const V = cargarVieja();
const main = {
  v: 1, inicio: '2026-08', usuarios: ['Persona A', 'Persona B'], tc: 1500, tasa: 7.5, rendMensual: 1.5, caja: 200000,
  cats: V.CATS0.map(c => ({ ...c })).concat([]), ingCats: [
    { id: 'sueldo', n: 'Sueldo', e: '💼', c: '#0F8A5F' }, { id: 'alqprop', n: 'Alquiler de propiedad', e: '🏘️', c: '#2a78d6' },
    { id: 'rend', n: 'Rendimientos', e: '📈', c: '#6250d6' }, { id: 'aguin', n: 'Aguinaldo', e: '🎄', c: '#eda100' }, { id: 'oting', n: 'Otros ingresos', e: '➕', c: '#8792a4' }],
  tarjetas: [{ id: 'tj1', n: 'Visa Banco Uno', cierre: 20 }, { id: 'tj2', n: 'Master Banco Dos', cierre: 0 }],
  destinos: [
    { id: 'retiro', n: 'Retiro', e: '🌅', c: '#6250d6', modo: 'pct', pct: 60, aporte: 0, saldo0: 100000, plazo: 240, meta: 0 },
    { id: 'viaje', n: 'Viaje', e: '✈️', c: '#e0457b', aporte: 50000, saldo0: 0, plazo: 12, meta: 900000 }],
  bolsas: [{ id: 'b1', n: 'Súper', monto: 300000, cats: ['alim', 'limp'] }],
  itemsPropios: [{ n: 'Alfajor de maicena', cat: 'alim' }]
};
const cfg = {
  main,
  plan: { items: [
    { id: 'p1', tipo: 'ingreso', n: 'Sueldo A', cat: 'sueldo', base: 1500000, desde: '2026-08' },
    { id: 'p2', tipo: 'gasto', n: 'Alquiler', cat: 'viv', base: 500000, desde: '2026-08' },
    { id: 'p3', tipo: 'gasto', n: 'Diezmo', cat: 'diez', pct: 10, desde: '2026-08' }] },
  metas: { items: [{ id: 'm1', n: 'Heladera', monto: 900000 }] },
  aprendido: { atun: 'alim', 'yerba_mate': 'alim' }
};
V.applyCfgDocs(cfg);
const mov = {}; let n = 0; const id = () => 'm' + String(++n).padStart(4, '0');
const creado = '2026-11-01T10:00:00.000Z';
const gasto = (fecha, medio, com, items, extra = {}) => { const total = items.reduce((s, i) => s + i.monto, 0); mov[id()] = { tipo: 'gasto', fecha, mes: V.imputar(fecha, medio), medio, com, nota: '', por: n % 2 ? 'Persona A' : 'Persona B', items, total, src: 'manual', creado, ...extra }; };
for (const ym of ['2026-08', '2026-09', '2026-10']) {
  mov[id()] = { tipo: 'ingreso', cat: 'sueldo', fecha: ym + '-05', mes: ym, planId: 'p1', planMes: ym, src: 'plan', medio: 'tr', por: 'Persona A', items: [{ n: 'Sueldo A', cat: 'sueldo', monto: 1500000, cant: 1 }], total: 1500000, com: '', creado };
  mov[id()] = { tipo: 'gasto', fecha: ym + '-10', mes: ym, planId: 'p2', planMes: ym, src: 'plan', medio: 'tr', por: 'Persona B', items: [{ n: 'Alquiler', cat: 'viv', monto: 500000, cant: 1 }], total: 500000, com: '', creado };
  mov[id()] = { tipo: 'gasto', fecha: ym + '-11', mes: ym, planId: 'p3', planMes: ym, src: 'plan', medio: 'ef', por: 'Persona A', items: [{ n: 'Diezmo', cat: 'diez', monto: 150000, cant: 1 }], total: 150000, com: '', creado };
  gasto(ym + '-03', 'deb', 'Súper del barrio', [{ n: 'Leche', cat: 'alim', monto: 3200, cant: 2 }, { n: 'Yerba mate', cat: 'alim', monto: 5100, cant: 1 }, { n: 'Detergente', cat: 'limp', monto: 2900, cant: 1 }]);
  gasto(ym + '-08', 'ef', 'Verdulería', [{ n: 'Verduras', cat: 'alim', monto: 8400, cant: 1 }]);
  gasto(ym + '-15', 'tj1', 'Farmacia', [{ n: 'Farmacia', cat: 'salud', monto: 21000, cant: 1 }]);
  gasto(ym + '-22', 'tj1', 'Nafta', [{ n: 'Nafta', cat: 'trans', monto: 45000, cant: 1 }]); // después del cierre: pasa al segundo mes
  gasto(ym + '-25', 'tj2', 'Netflix', [{ n: 'Netflix', cat: 'sus', monto: 9900, cant: 1 }]);
  mov[id()] = { tipo: 'aporte', fondo: 'viaje', fecha: ym + '-28', mes: ym, planId: 'dest:viaje', planMes: ym, src: 'plan', por: 'Persona A', items: [], total: 50000, com: '', creado };
}
// compra en 6 cuotas con la tarjeta sin cierre
const g = 'g6cuotas';
for (let i = 0; i < 6; i++) mov[id()] = { tipo: 'gasto', fecha: '2026-08-18', mes: V.addM(V.imputar('2026-08-18', 'tj2'), i), medio: 'tj2', com: 'Casa de electro', nota: '', por: 'Persona B', items: [{ n: 'Lavarropas', cat: 'hogar', monto: 120000, cant: 1 }], total: 120000, grupo: g, cuota: { i: i + 1, n: 6 }, src: 'manual', creado };
// fondo: compra pagada con el fondo, retiro, rendimiento de cierre, foto de ticket del artefacto
mov[id()] = { tipo: 'gasto', fecha: '2026-09-20', mes: '2026-09', medio: 'tr', com: 'Pasajes', nota: '', por: 'Persona A', items: [{ n: 'Pasaje de avión', cat: 'trans', monto: 80000, cant: 1 }], total: 80000, pagoFondo: 'viaje', src: 'manual', creado };
mov[id()] = { tipo: 'retiro', fondo: 'retiro', fecha: '2026-10-12', mes: '2026-10', por: 'Persona B', items: [], total: 30000, com: '', src: 'manual', creado };
mov[id()] = { tipo: 'aporte', fondo: 'retiro', fecha: '2026-08-31', mes: '2026-08', planId: 'dest:retiro', planMes: '2026-08', src: 'plan', por: 'Persona A', items: [], total: 120000, com: '', creado };
mov[id()] = { tipo: 'rendimiento', fondo: 'retiro', fecha: '2026-08-31', mes: '2026-08', por: 'Persona A', items: [], total: 3300, com: 'Ajuste de cierre', src: 'cierre', creado };
mov['conFoto'] = { tipo: 'gasto', fecha: '2026-10-02', mes: '2026-10', medio: 'ef', com: 'Panadería', nota: 'ticket', por: 'Persona A', items: [{ n: 'Pan', cat: 'alim', monto: 4200, cant: 1 }], total: 4200, src: 'manual', creado, img: { id: 'x1', url: 'https://ejemplo.invalid/foto.jpg' } };
mov['roto'] = { tipo: 'transferencia rara', fecha: 'ayer', total: 'mucho' };
cfg['cierre_2026-08'] = { ym: '2026-08', cerradoEn: '2026-09-01T09:00:00.000Z', por: 'Persona A', ing: 1500000, cons: 700000, sobra: 800000, fondos: { retiro: { saldoPrev: 100000, aporte: 120000, rend: 3300, valor: 223300, modo: 'pct', pct: 60 }, viaje: { saldoPrev: 0, aporte: 50000, rend: 0, valor: 50000, modo: 'monto', pct: 0 } } };
fs.writeFileSync(path.join(__dirname, 'app-anterior-copia.json'), JSON.stringify({ mov, cfg }, null, 1));
console.log('Escrito pruebas/datos/app-anterior-copia.json con', Object.keys(mov).length, 'movimientos');
