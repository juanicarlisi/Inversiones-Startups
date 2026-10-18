// verificacion/formulas/colas.ts · Andén simulador, corte 1, P2.
// Valores analíticos de teoría de colas: son los «esperados» de la batería Andén Verificado (corte-1.md §8).
// Regla de determinismo (§1.4): solo + − × ÷ y Math.sqrt. Lo que pide logaritmo, exponencial, seno o coseno recibe una
// MatematicaDeterminista (la del motor, `m.mat`), así el mismo esperado sale idéntico en cualquier motor de JavaScript.
import type { MatematicaDeterminista } from '../../contratos/matematica.ts';

/** Potencia entera por multiplicación (exacta para exponentes chicos; evita la potencia nativa). */
export function potenciaEntera(x: number, n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error(`potenciaEntera: se esperaba un exponente entero ≥ 0 y llegó ${n}`);
  let r = 1;
  for (let i = 0; i < n; i++) r *= x;
  return r;
}

function exigirPositivo(nombre: string, x: number): void {
  if (!(x > 0) || !Number.isFinite(x)) throw new Error(`${nombre}: se esperaba un número positivo y finito y llegó ${x}`);
}
function exigirServidores(c: number): void {
  if (!Number.isInteger(c) || c < 1) throw new Error(`servidores: se esperaba un entero ≥ 1 y llegó ${c}`);
}

// ---------------------------------------------------------------------------------------------------------------------
// Erlang B y C, M/M/c
// ---------------------------------------------------------------------------------------------------------------------

/** Erlang B por la recursión estable B(k) = a·B(k−1) / (k + a·B(k−1)). Probabilidad de rechazo de M/G/c/c con carga a. */
export function erlangB(c: number, a: number): number {
  exigirServidores(c);
  exigirPositivo('erlangB: carga', a);
  let b = 1;
  for (let k = 1; k <= c; k++) b = (a * b) / (k + a * b);
  return b;
}

/** Erlang C: probabilidad de esperar en M/M/c con carga a = λ/μ < c. */
export function erlangC(c: number, a: number): number {
  const b = erlangB(c, a);
  const r = a / c;
  if (r >= 1) throw new Error(`erlangC: la carga por servidor debe ser < 1 y es ${r}`);
  return b / (1 - r * (1 - b));
}

export interface MedidasMMc {
  rho: number;   // ocupación por servidor
  C: number;     // P(esperar) (Erlang C)
  Wq: number;    // espera media en la cola
  W: number;     // tiempo medio en el sistema
  Lq: number;    // largo medio de la cola
  L: number;     // cantidad media en el sistema
}

/** M/M/c estable (λ < c·μ). */
export function mmc(lambda: number, mu: number, c: number): MedidasMMc {
  exigirPositivo('mmc: λ', lambda);
  exigirPositivo('mmc: μ', mu);
  const a = lambda / mu;
  const C = erlangC(c, a);
  const Wq = C / (c * mu - lambda);
  const W = Wq + 1 / mu;
  return { rho: a / c, C, Wq, W, Lq: lambda * Wq, L: lambda * W };
}

/** Tiempo de relajación de la M/M/1 (inversa de la brecha espectral): 1 / (μ (1 − √ρ)²). Sirve para fijar el calentamiento. */
export function relajacionMM1(rho: number, mu = 1): number {
  if (!(rho > 0 && rho < 1)) throw new Error(`relajacionMM1: se esperaba 0 < ρ < 1 y llegó ${rho}`);
  const d = 1 - Math.sqrt(rho);
  return 1 / (mu * d * d);
}

// ---------------------------------------------------------------------------------------------------------------------
// Nacimiento y muerte (M/M/c/K, fuente finita)
// ---------------------------------------------------------------------------------------------------------------------

/** Distribución estacionaria de un proceso de nacimiento y muerte en {0…N}: p(n) ∝ Π λ(k−1)/μ(k). */
export function nacimientoMuerte(lambdaDe: (n: number) => number, muDe: (n: number) => number, N: number): number[] {
  if (!Number.isInteger(N) || N < 1) throw new Error(`nacimientoMuerte: N debe ser entero ≥ 1 y es ${N}`);
  const p = [1];
  for (let n = 1; n <= N; n++) {
    const mu = muDe(n);
    exigirPositivo(`nacimientoMuerte: μ(${n})`, mu);
    p[n] = (p[n - 1] * lambdaDe(n - 1)) / mu;
  }
  let z = 0;
  for (const x of p) z += x;
  return p.map((x) => x / z);
}

export interface MedidasMMcK { pBloqueo: number; L: number; p: number[] }

/** M/M/c/K: K = máximo en el sistema (cola + servicio). pBloqueo = p(K) por PASTA. */
export function mmcK(lambda: number, mu: number, c: number, K: number): MedidasMMcK {
  exigirServidores(c);
  if (!Number.isInteger(K) || K < c) throw new Error(`mmcK: K debe ser entero ≥ c (${c}) y es ${K}`);
  const p = nacimientoMuerte(() => lambda, (n) => Math.min(n, c) * mu, K);
  let L = 0;
  for (let n = 0; n <= K; n++) L += n * p[n];
  return { pBloqueo: p[K], L, p };
}

/** Máquinas y reparador (fuente finita): N máquinas, cada una falla a tasa α mientras anda, r reparadores a tasa μ. Rotas en promedio. */
export function reparador(N: number, alfa: number, mu: number, reparadores = 1): number {
  const p = nacimientoMuerte((n) => (N - n) * alfa, (n) => Math.min(n, reparadores) * mu, N);
  let L = 0;
  for (let n = 0; n <= N; n++) L += n * p[n];
  return L;
}

// ---------------------------------------------------------------------------------------------------------------------
// M/G/1, GI/M/1, aproximaciones
// ---------------------------------------------------------------------------------------------------------------------

/** Pollaczek-Khinchine: Wq de la M/G/1 = λ E[S²] / (2 (1 − ρ)). */
export function pollaczekKhinchine(lambda: number, ES: number, ES2: number): number {
  const rho = lambda * ES;
  if (!(rho < 1)) throw new Error(`pollaczekKhinchine: ρ debe ser < 1 y es ${rho}`);
  return (lambda * ES2) / (2 * (1 - rho));
}

/** Segundo momento de una lognormal de media m y coeficiente de variación cv: m² (1 + cv²). */
export function segundoMomentoLognormal(media: number, cv: number): number {
  return media * media * (1 + cv * cv);
}

export interface MedidasDM1 { sigma: number; Wq: number; pEspera: number }

/**
 * D/M/1 exacta (caso GI/M/1 con llegadas deterministas cada 1/λ): σ es la raíz en (0, 1) de σ = exp(−μ (1 − σ) / λ).
 * Wq = σ / (μ (1 − σ)) y P(esperar) = σ. Se resuelve por iteración de punto fijo (contractiva cerca de la raíz).
 */
export function dm1(lambda: number, mu: number, mat: MatematicaDeterminista): MedidasDM1 {
  const rho = lambda / mu;
  if (!(rho > 0 && rho < 1)) throw new Error(`dm1: se esperaba 0 < ρ < 1 y llegó ${rho}`);
  let s = 0;
  for (let i = 0; i < 1_000_000; i++) {
    const n = mat.exp((-mu * (1 - s)) / lambda);
    if (Math.abs(n - s) < 1e-15) { s = n; break; }
    s = n;
  }
  return { sigma: s, Wq: s / (mu * (1 - s)), pEspera: s };
}

/** Kingman (aproximación de tráfico pesado para G/G/1): Wq ≈ ρ/(1−ρ) · (ca² + cs²)/2 · E[S]. */
export function kingman(rho: number, ca2: number, cs2: number, ES: number): number {
  return (rho / (1 - rho)) * ((ca2 + cs2) / 2) * ES;
}

/** Allen-Cunneen (aproximación para G/G/c): Wq ≈ C(c, a) / (c μ − λ) · (ca² + cs²)/2. */
export function allenCunneen(lambda: number, mu: number, c: number, ca2: number, cs2: number): number {
  return (erlangC(c, lambda / mu) / (c * mu - lambda)) * ((ca2 + cs2) / 2);
}

// ---------------------------------------------------------------------------------------------------------------------
// Prioridades (un servidor, servicio exponencial común)
// ---------------------------------------------------------------------------------------------------------------------

/** Residuo medio W0 = Σ λᵢ E[Sᵢ²] / 2 con servicio exponencial de tasa μ para todas las clases (E[S²] = 2/μ²). */
function residuo(lambdas: number[], mu: number, hasta: number): number {
  let w = 0;
  for (let i = 0; i <= hasta; i++) w += (lambdas[i] * 2) / (mu * mu) / 2;
  return w;
}
function sigmaAcum(lambdas: number[], mu: number, hasta: number): number {
  let s = 0;
  for (let i = 0; i <= hasta; i++) s += lambdas[i] / mu;
  return s;
}

/** Cobham: prioridad sin preempción. Wq de la clase k (0 = la más alta) = W0 / ((1 − σₖ₋₁)(1 − σₖ)). */
export function cobham(lambdas: number[], mu: number): number[] {
  const W0 = residuo(lambdas, mu, lambdas.length - 1);
  return lambdas.map((_, k) => {
    const s1 = k === 0 ? 0 : sigmaAcum(lambdas, mu, k - 1);
    const s2 = sigmaAcum(lambdas, mu, k);
    if (!(s2 < 1)) throw new Error(`cobham: la carga acumulada hasta la clase ${k} debe ser < 1 y es ${s2}`);
    return W0 / ((1 - s1) * (1 - s2));
  });
}

/**
 * Prioridad con preempción y reanudación: tiempo en el sistema de la clase k =
 * E[S] / (1 − σₖ₋₁) + Rₖ / ((1 − σₖ₋₁)(1 − σₖ)), con Rₖ = Σ_{i≤k} λᵢ E[Sᵢ²] / 2 (las clases más bajas no la afectan).
 */
export function preempcionReanudacion(lambdas: number[], mu: number): number[] {
  return lambdas.map((_, k) => {
    const s1 = k === 0 ? 0 : sigmaAcum(lambdas, mu, k - 1);
    const s2 = sigmaAcum(lambdas, mu, k);
    if (!(s2 < 1)) throw new Error(`preempcionReanudacion: la carga acumulada hasta la clase ${k} debe ser < 1 y es ${s2}`);
    const R = residuo(lambdas, mu, k);
    return 1 / mu / (1 - s1) + R / ((1 - s1) * (1 - s2));
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// Redes abiertas (Jackson) y cerradas (MVA)
// ---------------------------------------------------------------------------------------------------------------------

export interface NodoJackson { c: number; mu: number }
export interface MedidasJackson { lambdas: number[]; L: number[]; Ltotal: number; Wtotal: number }

/**
 * Red de Jackson abierta: λᵢ = γᵢ + Σⱼ λⱼ P[j][i] (eliminación de Gauss con pivoteo parcial); cada nodo es una M/M/cᵢ.
 * `externas[i]` = tasa externa al nodo i; `P[i][j]` = probabilidad de ir de i a j (lo que falta a 1 sale de la red).
 */
export function jackson(externas: number[], nodos: NodoJackson[], P: number[][]): MedidasJackson {
  const n = nodos.length;
  if (externas.length !== n || P.length !== n) throw new Error(`jackson: se esperaban ${n} tasas y ${n} filas de ruteo`);
  // Sistema (I − Pᵀ) λ = γ.
  const A: number[][] = [];
  for (let i = 0; i < n; i++) {
    const fila: number[] = [];
    for (let j = 0; j < n; j++) fila.push((i === j ? 1 : 0) - P[j][i]);
    fila.push(externas[i]);
    A.push(fila);
  }
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    if (Math.abs(A[piv][col]) < 1e-14) throw new Error('jackson: las ecuaciones de tráfico no tienen solución única (¿ruteo cerrado?)');
    [A[col], A[piv]] = [A[piv], A[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      for (let k = col; k <= n; k++) A[r][k] -= f * A[col][k];
    }
  }
  const lambdas = A.map((fila, i) => fila[n] / fila[i]);
  const L = lambdas.map((l, i) => mmc(l, nodos[i].mu, nodos[i].c).L);
  let Ltotal = 0;
  for (const x of L) Ltotal += x;
  let gamma = 0;
  for (const g of externas) gamma += g;
  return { lambdas, L, Ltotal, Wtotal: Ltotal / gamma };
}

export interface MedidasMVA { TH: number; CT: number; L: number[] }

/** Análisis de valor medio exacto para una red cerrada de estaciones de una máquina con medias `medias` y población N. */
export function mva(medias: number[], N: number): MedidasMVA {
  if (!Number.isInteger(N) || N < 1) throw new Error(`mva: N debe ser entero ≥ 1 y es ${N}`);
  let L = medias.map(() => 0);
  let X = 0;
  for (let k = 1; k <= N; k++) {
    const W = medias.map((s, i) => s * (1 + L[i]));
    let suma = 0;
    for (const w of W) suma += w;
    X = k / suma;
    L = W.map((w) => X * w);
  }
  return { TH: X, CT: N / X, L };
}

/** Penny Fab determinista (Hopp y Spearman): mejor caso. TH = min(N / T0, rb) y CT = max(T0, N / rb). */
export function pennyFabDeterminista(medias: number[], N: number): { TH: number; CT: number } {
  let T0 = 0;
  let cuello = 0;
  for (const s of medias) { T0 += s; if (s > cuello) cuello = s; }
  const rb = 1 / cuello;
  return { TH: Math.min(N / T0, rb), CT: Math.max(T0, N / rb) };
}

// ---------------------------------------------------------------------------------------------------------------------
// M_t/M/∞ con llegadas senoidales
// ---------------------------------------------------------------------------------------------------------------------

/**
 * E[N(t)] de la M_t/M/∞ que arranca vacía en t = 0 con λ(t) = λ̄ (1 + β sen(γ t)) y servicio exponencial de tasa μ:
 * λ̄/μ (1 − e^{−μt}) + λ̄ β (μ sen γt − γ cos γt + γ e^{−μt}) / (μ² + γ²). N(t) es Poisson: la varianza es igual a la media.
 * El argumento del seno y del coseno se reduce a [0, 2π) con el período (la matemática propia solo vale para |x| ≤ 1.000).
 */
export function mtInfMedia(lb: number, beta: number, periodo: number, mu: number, t: number, mat: MatematicaDeterminista): number {
  const gam = (2 * Math.PI) / periodo;
  const fase = (2 * Math.PI * (t % periodo)) / periodo;
  const e = mat.exp(-mu * t);
  return (lb / mu) * (1 - e) + (lb * beta * (mu * mat.sin(fase) - gam * mat.cos(fase) + gam * e)) / (mu * mu + gam * gam);
}
