// Pruebas de verificacion/formulas/colas.ts: cada valor esperado de la tabla de corte-1.md §8 sale de una fórmula con error ≤ 1e-5.
// La tabla imprime los valores redondeados (por ejemplo 8,770 para E[N(66 h)] = 8,76971…): la tolerancia es la mayor entre 1e-5
// relativo y media unidad de la última cifra impresa (ver NOTAS-CONTRATO.md). También se prueba que la batería use estas fórmulas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matNativa } from '../../contratos/referencia/motor-referencia.ts';
import { crearMotorReferencia } from '../../contratos/referencia/motor-referencia.ts';
import * as f from '../formulas/colas.ts';
import { crearBateria } from '../bateria.ts';

/** Tabla de §8 tal como está impresa (con punto decimal) y la fórmula que la produce. */
const TABLA: [string, string, () => number][] = [
  ['V01a', '1', () => f.mmc(0.5, 1, 1).Wq], ['V02a', '1', () => f.mmc(0.5, 1, 1).L], ['V03a', '0.5', () => f.mmc(0.5, 1, 1).rho], ['V04a', '0.5', () => f.mmc(0.5, 1, 1).C],
  ['V01b', '4', () => f.mmc(0.8, 1, 1).Wq], ['V02b', '4', () => f.mmc(0.8, 1, 1).L], ['V03b', '0.8', () => f.mmc(0.8, 1, 1).rho], ['V04b', '0.8', () => f.mmc(0.8, 1, 1).C],
  ['V01c', '9', () => f.mmc(0.9, 1, 1).Wq], ['V02c', '9', () => f.mmc(0.9, 1, 1).L], ['V03c', '0.9', () => f.mmc(0.9, 1, 1).rho], ['V04c', '0.9', () => f.mmc(0.9, 1, 1).C],
  ['V06a', '0.64719', () => f.mmc(2.4, 1, 3).C], ['V07a', '1.07865', () => f.mmc(2.4, 1, 3).Wq],
  ['V06b', '0.76249', () => f.mmc(4.5, 1, 5).C], ['V07b', '1.52499', () => f.mmc(4.5, 1, 5).Wq],
  ['V06c', '0.36386', () => f.mmc(45, 1, 50).C], ['V07c', '0.072773', () => f.mmc(45, 1, 50).Wq],
  ['V08', '4.5', () => f.pollaczekKhinchine(0.9, 1, 1)],
  ['V09', '3.79167', () => f.pollaczekKhinchine(0.7, 1, f.segundoMomentoLognormal(1, 1.5))],
  ['V10', '4.17866', () => f.dm1(0.9, 1, matNativa).Wq], ['V11', '0.80690', () => f.dm1(0.9, 1, matNativa).pEspera],
  ['V13', '0.181818', () => f.mmcK(2, 1, 2, 5).pBloqueo], ['V14', '2.72727', () => f.mmcK(2, 1, 2, 5).L],
  ['V15', '0.078741', () => f.erlangB(10, 7)], ['V16', '0.078741', () => f.erlangB(10, 7)],
  ['V17', '1.14286', () => f.cobham([0.3, 0.5], 1)[0]], ['V18', '5.71429', () => f.cobham([0.3, 0.5], 1)[1]],
  ['V19', '1.42857', () => f.preempcionReanudacion([0.3, 0.5], 1)[0]], ['V20', '7.14286', () => f.preempcionReanudacion([0.3, 0.5], 1)[1]],
  ...((): [string, string, () => number][] => {
    const j = () => f.jackson([1, 0, 0], [{ c: 2, mu: 1 }, { c: 1, mu: 1.2 }, { c: 1, mu: 0.5 }], [[0, 0.7, 0.3], [0.2, 0, 0], [0, 0, 0]]);
    return [['V21', '6.17266', () => j().Ltotal], ['V22', '6.17266', () => j().Wtotal], ['V23a', '1.75654', () => j().L[0]],
      ['V23b', '2.10843', () => j().L[1]], ['V23c', '2.30769', () => j().L[2]]];
  })(),
  ['V24a TH', '0.25', () => f.pennyFabDeterminista([2, 2, 2, 2], 2).TH], ['V24a CT', '8', () => f.pennyFabDeterminista([2, 2, 2, 2], 2).CT],
  ['V24b TH', '0.5', () => f.pennyFabDeterminista([2, 2, 2, 2], 4).TH], ['V24b CT', '8', () => f.pennyFabDeterminista([2, 2, 2, 2], 4).CT],
  ['V24c TH', '0.5', () => f.pennyFabDeterminista([2, 2, 2, 2], 6).TH], ['V24c CT', '12', () => f.pennyFabDeterminista([2, 2, 2, 2], 6).CT],
  ['V25', '0.285714', () => f.mva([2, 2, 2, 2], 4).TH], ['V26', '14', () => f.mva([2, 2, 2, 2], 4).CT],
  ['V27', '0.437838', () => f.mva([1, 2, 1.5, 0.5], 5).TH],
  ['V28a', '17.060', () => f.mtInfMedia(20, 0.6, 24, 1, 48, matNativa)], ['V28b', '31.230', () => f.mtInfMedia(20, 0.6, 24, 1, 54, matNativa)],
  ['V28c', '22.940', () => f.mtInfMedia(20, 0.6, 24, 1, 60, matNativa)], ['V28d', '8.770', () => f.mtInfMedia(20, 0.6, 24, 1, 66, matNativa)],
  ['V30', '0.639522', () => f.reparador(5, 0.1, 1, 1)],
  // Informativas V12 (valores de motor-validacion.md §7.1).
  ['V12a', '4.5', () => f.kingman(0.9, 0.5, 0.5, 1)], ['V12b', '0.8889', () => f.allenCunneen(1.6, 1, 2, 0.5, 0.5)],
  ['V12c', '0.5744', () => f.allenCunneen(3.4, 1, 4, 0.5, 0.5)], ['V12d', '1.8669', () => f.allenCunneen(3.4, 1, 4, 1, 2.25)],
];

function tolerancia(impreso: string): number {
  const v = Number(impreso);
  const dec = impreso.includes('.') ? impreso.split('.')[1].length : 0;
  let mediaUnidad = 0.5;
  for (let i = 0; i < dec; i++) mediaUnidad /= 10;
  return Math.max(1e-5 * Math.abs(v), mediaUnidad);
}

test('formulas/ reproduce cada valor esperado de la tabla de §8 (error ≤ 1e-5 o media unidad de la última cifra impresa)', () => {
  for (const [id, impreso, formula] of TABLA) {
    const v = formula(), e = Number(impreso), tol = tolerancia(impreso);
    assert.ok(Math.abs(v - e) <= tol, `${id}: la tabla dice ${impreso} y la fórmula da ${v} (diferencia ${Math.abs(v - e)}, tolerancia ${tol})`);
  }
});

test('Erlang B y C: casos de borde y recursión', () => {
  assert.equal(f.erlangB(1, 1), 0.5);
  assert.ok(Math.abs(f.erlangC(1, 0.5) - 0.5) < 1e-15, 'en la M/M/1, P(esperar) = ρ');
  assert.throws(() => f.erlangC(2, 2), /carga por servidor debe ser < 1 y es 1/);
  assert.throws(() => f.erlangB(0, 1), /servidores: se esperaba un entero ≥ 1 y llegó 0/);
});

test('M/M/c/K con K = c es Erlang B; fuente finita con N = 1 es la fórmula de un reparador', () => {
  const k = f.mmcK(7, 1, 10, 10);
  assert.ok(Math.abs(k.pBloqueo - f.erlangB(10, 7)) < 1e-15, `${k.pBloqueo} ≠ ${f.erlangB(10, 7)}`);
  // Una máquina: rota en promedio α / (α + μ).
  assert.ok(Math.abs(f.reparador(1, 0.1, 1) - 0.1 / 1.1) < 1e-15);
});

test('prioridades: con una sola clase Cobham y preempción dan la M/M/1', () => {
  assert.ok(Math.abs(f.cobham([0.8], 1)[0] - f.mmc(0.8, 1, 1).Wq) < 1e-12);
  assert.ok(Math.abs(f.preempcionReanudacion([0.8], 1)[0] - f.mmc(0.8, 1, 1).W) < 1e-12);
});

test('Jackson con un solo nodo es la M/M/c; MVA con N = 1 da el tiempo de ciclo sin espera', () => {
  const j = f.jackson([2], [{ c: 3, mu: 1 }], [[0]]);
  assert.ok(Math.abs(j.Ltotal - f.mmc(2, 1, 3).L) < 1e-12);
  const m = f.mva([1, 2, 1.5, 0.5], 1);
  assert.ok(Math.abs(m.CT - 5) < 1e-12 && Math.abs(m.TH - 0.2) < 1e-12, `CT ${m.CT}, TH ${m.TH}`);
});

test('M_t/M/∞ con amplitud 0 es la M/M/∞ que arranca vacía: λ/μ (1 − e^{−μt})', () => {
  const v = f.mtInfMedia(20, 0, 24, 1, 3, matNativa);
  assert.ok(Math.abs(v - 20 * (1 - matNativa.exp(-3))) < 1e-12, `${v}`);
});

test('la batería usa las fórmulas: cada esperado declarado coincide con la tabla', () => {
  const casos = crearBateria(crearMotorReferencia).casos;
  const declarado = new Map(casos.flatMap((c) => c.pruebas.map((p) => [p.id, p.esperado] as const)));
  for (const [id, impreso] of TABLA) {
    const base = id.split(' ')[0];
    const d = declarado.get(base);
    assert.ok(d !== undefined, `la batería no declara ${base}`);
    const v = typeof d === 'number' ? d : (d as Record<string, number>)[id.split(' ')[1]];
    assert.ok(Math.abs(v - Number(impreso)) <= tolerancia(impreso), `${id}: la batería espera ${v} y la tabla dice ${impreso}`);
  }
});

test('las fórmulas rechazan entradas fuera de dominio con mensajes claros', () => {
  assert.throws(() => f.pollaczekKhinchine(1, 1, 1), /ρ debe ser < 1 y es 1/);
  assert.throws(() => f.dm1(1, 1, matNativa), /se esperaba 0 < ρ < 1 y llegó 1/);
  assert.throws(() => f.mmcK(1, 1, 3, 2), /K debe ser entero ≥ c \(3\) y es 2/);
  assert.throws(() => f.potenciaEntera(2, -1), /exponente entero ≥ 0 y llegó -1/);
});
