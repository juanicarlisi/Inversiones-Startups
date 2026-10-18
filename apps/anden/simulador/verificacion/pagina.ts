// verificacion/pagina.ts · Andén simulador, corte 1, P2.
// Arma informe.html: una página local, estática y en español con el resultado de la batería. No tiene scripts ni recursos externos
// y no se publica (regla 8 de CLAUDE.md). Todo texto pasa por escapar(): los nombres y motivos vienen de los casos.
import type { InformeBateria } from './bateria.ts';
import type { Esperado, ResultadoPrueba, Simulado } from './casos/comun.ts';

const ENTIDADES: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\u0022': '&quot;', '\u0027': '&#39;' };
/** Escapa &, <, >, comillas dobles y simples para HTML (las comillas van como \u0022 y \u0027 para no confundir a los lectores de código). */
export function escapar(s: string): string {
  return s.replace(/[&<>\u0022\u0027]/g, (c) => ENTIDADES[c]);
}

const NUM = new Intl.NumberFormat('es-AR', { maximumSignificantDigits: 6 });
const PCT = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function numero(x: number | null | undefined): string {
  if (x === null || x === undefined) return '—';
  if (Number.isNaN(x)) return 'sin dato';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
  return NUM.format(x).replace('-', '−');
}
function pct(x: number | null): string { return x === null || !Number.isFinite(x) ? '—' : `${PCT.format(100 * x).replace('-', '−')}%`; }

function valor(v: Esperado | Simulado): string {
  if (v === null) return '—';
  if (typeof v === 'number') return numero(v);
  if (typeof v === 'string') return v;
  if ('min' in v && 'max' in v && Object.keys(v).length === 2) return `[${numero(v.min as number)}; ${numero(v.max as number)}]`;
  return Object.entries(v).map(([k, x]) => `${k} ${numero(x)}`).join(' · ');
}

const ETIQUETA: Record<ResultadoPrueba['estado'], { texto: string; signo: string; clase: string }> = {
  pasa: { texto: 'pasa', signo: '✓', clase: 'pasa' },
  falla: { texto: 'falla', signo: '✗', clase: 'falla' },
  informativa: { texto: 'informativa', signo: 'i', clase: 'info' },
  'debe-fallar-ok': { texto: 'falla como debe', signo: '✓', clase: 'pasa' },
};

const FAMILIAS: Record<string, string> = {
  V: 'V · Teoría de colas', C: 'C · Casos publicados', D: 'D · Degeneradas', M: 'M · Metamórficas y conservación',
  R: 'R · Reproducibilidad', S: 'S · Estadística (demostraciones)',
};

function fila(r: ResultadoPrueba): string {
  const e = ETIQUETA[r.estado];
  const nota = [r.motivo ? `Motivo: ${r.motivo}` : '', r.reintento ? `Reintento con semilla ${r.reintento.semilla} y ${r.reintento.replicas} réplicas (la primera vez: ${r.reintento.primerIntento.motivo ?? 'falló'})` : '']
    .filter(Boolean).map((t) => `<div class="nota">${escapar(t)}</div>`).join('');
  return `<tr>
<td class="id">${escapar(r.id)}</td>
<td>${escapar(r.nombre)}<div class="criterio">${escapar(r.criterio)}</div>${nota}</td>
<td class="n">${escapar(valor(r.esperado))}</td>
<td class="n">${escapar(valor(r.simulado))}</td>
<td class="n">${escapar(r.semiancho === null ? '—' : `± ${numero(r.semiancho)}`)}</td>
<td class="n">${escapar(r.z === null ? '—' : numero(Math.round(r.z * 100) / 100))}</td>
<td class="n">${escapar(pct(r.errorRelativo))}</td>
<td class="n">${escapar(numero(r.n))}</td>
<td><span class="estado ${e.clase}"><span aria-hidden="true">${e.signo}</span> ${escapar(e.texto)}</span></td>
</tr>`;
}

export function paginaInforme(inf: InformeBateria): string {
  const r = inf.resumen;
  const familias = [...new Set(inf.resultados.map((x) => x.familia))];
  const tablas = familias.map((f) => {
    const filas = inf.resultados.filter((x) => x.familia === f).map(fila).join('\n');
    return `<h2>${escapar(FAMILIAS[f] ?? f)}</h2>
<div class="tabla"><table>
<thead><tr><th>ID</th><th>Prueba</th><th>Esperado</th><th>Simulado</th><th>Semiancho 95%</th><th>z</th><th>Error relativo</th><th>n</th><th>Estado</th></tr></thead>
<tbody>
${filas}
</tbody></table></div>`;
  }).join('\n');
  const veredicto = r.aprobada
    ? `Aprobada: ${r.pasaron} de ${r.exigiblesCorridas} exigibles de P2 pasan`
    : `No aprobada: ${r.fallaron} de ${r.exigiblesCorridas} exigibles de P2 fallan`;
  const dor = inf.doradas;
  const textoDoradas = dor.estado === 'no-pedidas' ? 'no se compararon en esta corrida'
    : dor.estado === 'sin-archivo' ? 'no hay doradas.json (se generan con --generar-doradas)'
    : `${dor.comparadas} corridas comparadas, ${dor.distintas.length} distintas`;
  const casos = inf.casos.map((c) => `<tr><td class="id">${escapar(c.id)}</td><td>${escapar(c.titulo)}</td><td class="n">${escapar(numero(c.replicas))}</td>
<td class="n">${escapar(numero(c.horizonte))}</td><td class="n">${escapar(numero(c.calentamiento))}</td><td>${escapar(c.pruebas.join(' · '))}</td>
<td class="n">${escapar(c.segundos === undefined ? '—' : numero(Math.round(c.segundos * 10) / 10))}</td></tr>`).join('\n');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>Andén Verificado · informe</title>
<style>
:root { --fondo: #fbfaf7; --texto: #1d1d1b; --suave: #5b5b57; --borde: #dedbd2; --pasa: #1d6b3a; --pasa-fondo: #e3f2e7;
  --falla: #a3201a; --falla-fondo: #fbe5e3; --info: #2f4f8a; --info-fondo: #e6ecf7; --tarjeta: #ffffff; }
@media (prefers-color-scheme: dark) { :root { --fondo: #161614; --texto: #ecebe6; --suave: #a8a69f; --borde: #34332f; --pasa: #7fd49b;
  --pasa-fondo: #173322; --falla: #ff9a8f; --falla-fondo: #3a1b18; --info: #9bb8f0; --info-fondo: #1b2740; --tarjeta: #1e1e1b; } }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px 16px 48px; background: var(--fondo); color: var(--texto); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 1180px; margin: 0 auto; }
h1 { font-size: 26px; margin: 0 0 4px; } h2 { font-size: 18px; margin: 32px 0 8px; }
.sub { color: var(--suave); margin: 0 0 20px; }
.veredicto { padding: 14px 16px; border-radius: 10px; font-weight: 600; margin: 16px 0; border: 1px solid var(--borde); }
.veredicto.si { background: var(--pasa-fondo); color: var(--pasa); } .veredicto.no { background: var(--falla-fondo); color: var(--falla); }
.cifras { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 12px 0 8px; }
.cifra { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 10px; padding: 10px 12px; }
.cifra b { display: block; font-size: 22px; font-variant-numeric: tabular-nums; } .cifra span { color: var(--suave); font-size: 13px; }
.tabla { overflow-x: auto; border: 1px solid var(--borde); border-radius: 10px; background: var(--tarjeta); }
table { border-collapse: collapse; width: 100%; min-width: 860px; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--borde); vertical-align: top; }
th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--suave); font-weight: 600; }
tr:last-child td { border-bottom: 0; }
td.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; } td.id { font-weight: 600; white-space: nowrap; }
.criterio, .nota { color: var(--suave); font-size: 13px; } .nota { margin-top: 2px; }
.estado { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; }
.estado.pasa { background: var(--pasa-fondo); color: var(--pasa); } .estado.falla { background: var(--falla-fondo); color: var(--falla); }
.estado.info { background: var(--info-fondo); color: var(--info); }
footer { color: var(--suave); font-size: 13px; margin-top: 32px; }
</style>
</head>
<body>
<main>
<h1>Andén Verificado</h1>
<p class="sub">Batería de validación del motor contra teoría de colas y casos publicados · suite ${escapar(inf.suite === 'completa' ? 'completa' : 'rápida')} ·
motor: ${escapar(inf.motor)} · semilla ${escapar(String(inf.semilla))}${inf.fecha ? ` · ${escapar(inf.fecha)}` : ''}</p>
<div class="veredicto ${r.aprobada ? 'si' : 'no'}">${escapar(veredicto)}${r.debeFallar > 0 ? escapar(` · demostraciones que tienen que fallar: ${r.debeFallarOk} de ${r.debeFallar} fallan como deben`) : ''}</div>
<div class="cifras">
<div class="cifra"><b>${escapar(numero(r.pasaron))}</b><span>exigibles que pasan</span></div>
<div class="cifra"><b>${escapar(numero(r.fallaron))}</b><span>exigibles que fallan</span></div>
<div class="cifra"><b>${escapar(numero(r.informativas))}</b><span>informativas</span></div>
<div class="cifra"><b>${escapar(numero(r.reintentos))}</b><span>reintentos por azar</span></div>
<div class="cifra"><b>${escapar(`${r.exigiblesP2} de ${r.exigiblesDelCorte}`)}</b><span>exigibles del corte que son de P2</span></div>
</div>
<p class="sub">Doradas por huella: ${escapar(textoDoradas)}. Conservación: ${escapar(numero(inf.conservacion.corridas))} corridas revisadas,
${escapar(numero(inf.conservacion.violaciones))} violaciones.</p>
${tablas}
<h2>Casos corridos</h2>
<div class="tabla"><table>
<thead><tr><th>Caso</th><th>Qué es</th><th>Réplicas</th><th>Horizonte</th><th>Calentamiento</th><th>Pruebas</th><th>Segundos</th></tr></thead>
<tbody>
${casos}
</tbody></table></div>
<footer>Criterio de §8 del corte 1: estocásticas con |error| ≤ 3,29 errores estándar y error relativo ≤ 3% (≤ 2% en probabilidades),
con un diseño que da un semiancho del 95% ≤ 2% del valor (≤ 1% en probabilidades); una falla se re-corre sola con otra semilla y cuatro
veces más réplicas y es error del motor solo si vuelve a fallar. Deterministas, exactas. Página local generada por
<code>node verificacion/bateria.ts</code>; no se publica.</footer>
</main>
</body>
</html>
`;
}
