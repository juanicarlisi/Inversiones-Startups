// Medicion propia del 17-10-2026: ¿cuantas replicas hacen falta para no equivocar la decision del ejemplo de voi.js?
// Uso: node precision.js  -> P(exito) de 4 y 5 puestos con los valores medios, con 20, 100 y 400 replicas (IC 95% de Wilson).
'use strict';
const { pExito, BASE } = require('./voi.js');
const wilson = (p, n) => { const z = 1.96, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d; return [+(c - h).toFixed(3), +(c + h).toFixed(3)]; };
const out = [];
for (const R of [20, 100, 400]) for (const c of [4, 5]) { const r = pExito(BASE, c, R); out.push({ replicas: R, puestos: c, p_exito: r.p, ic95: wilson(r.p, R) }); }
// teoria del ausentismo (independiente de la simulacion): con 4 puestos y 5% de faltas, P(no falta nadie) = 0,95^4
out.push({ control: 'P(no falta ninguno de 4) = 0,95^4', valor: +(0.95 ** 4).toFixed(4) });
console.log(JSON.stringify(out, null, 1));
