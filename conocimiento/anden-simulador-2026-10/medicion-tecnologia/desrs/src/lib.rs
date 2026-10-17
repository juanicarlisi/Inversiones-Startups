// Medicion propia 17-10-2026: el mismo hub de 3 etapas que medicion-motor/des.js, en Rust (nativo y WebAssembly).
struct Rng(u32);
impl Rng {
    #[inline(always)]
    fn next(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x6D2B79F5);
        let a = self.0;
        let mut t = (a ^ (a >> 15)).wrapping_mul(1 | a);
        t = (t.wrapping_add((t ^ (t >> 7)).wrapping_mul(61 | t))) ^ t;
        ((t ^ (t >> 14)) as f64) / 4294967296.0
    }
}
struct Heap { t: Vec<f64>, k: Vec<i32>, e: Vec<i32>, n: usize }
impl Heap {
    fn new(c: usize) -> Self { Heap { t: vec![0.0; c], k: vec![0; c], e: vec![0; c], n: 0 } }
    #[inline(always)]
    fn push(&mut self, t: f64, k: i32, e: i32) {
        let mut i = self.n; self.n += 1;
        while i > 0 { let p = (i - 1) >> 1; if self.t[p] <= t { break; }
            self.t[i] = self.t[p]; self.k[i] = self.k[p]; self.e[i] = self.e[p]; i = p; }
        self.t[i] = t; self.k[i] = k; self.e[i] = e;
    }
    #[inline(always)]
    fn pop(&mut self) -> (f64, i32, i32) {
        let r = (self.t[0], self.k[0], self.e[0]);
        self.n -= 1; let n = self.n;
        let (t, k, e) = (self.t[n], self.k[n], self.e[n]);
        let mut i = 0;
        loop { let mut c = 2 * i + 1; if c >= n { break; }
            if c + 1 < n && self.t[c + 1] < self.t[c] { c += 1; }
            if self.t[c] >= t { break; }
            self.t[i] = self.t[c]; self.k[i] = self.k[c]; self.e[i] = self.e[c]; i = c; }
        if n > 0 { self.t[i] = t; self.k[i] = k; self.e[i] = e; }
        r
    }
}
struct Ring { b: Vec<i32>, h: usize, l: usize, m: usize }
impl Ring {
    fn new(c: usize) -> Self { Ring { b: vec![0; c], h: 0, l: 0, m: c - 1 } }
    #[inline(always)] fn push(&mut self, x: i32) { let i = (self.h + self.l) & self.m; self.b[i] = x; self.l += 1; }
    #[inline(always)] fn shift(&mut self) -> i32 { let x = self.b[self.h]; self.h = (self.h + 1) & self.m; self.l -= 1; x }
}
static mut OUT: [f64; 4] = [0.0; 4];
#[no_mangle]
pub extern "C" fn run(seed: u32, horizon: f64) -> f64 {
    let mut r = Rng(seed);
    let servers = [4i32, 6, 5];
    let mean = [0.25 * 3.6, 1.0 / 6.0 * 5.4, 0.2 * 4.5];
    let iat = 0.25;
    let mut busy = [0i32; 3];
    let mut qs = [Ring::new(1 << 16), Ring::new(1 << 16), Ring::new(1 << 16)];
    let mut h = Heap::new(1 << 20);
    let mask = (1usize << 22) - 1;
    let mut born = vec![0.0f64; 1 << 22];
    let (mut ev, mut done, mut sum_t, mut id) = (0f64, 0f64, 0f64, 0i32);
    macro_rules! expo { ($m:expr) => { -(1.0 - r.next()).ln() * $m } }
    let e0 = expo!(iat); h.push(e0, 0, -1);
    while h.n > 0 {
        let (t, k, e) = h.pop();
        if t > horizon { break; }
        ev += 1.0;
        let (s_enter, p_enter);
        if k == 0 {
            let p = id; id += 1; born[(p as usize) & mask] = t;
            let d = expo!(iat); h.push(t + d, 0, -1);
            s_enter = 0usize; p_enter = p;
        } else {
            let s = (k - 1) as usize; busy[s] -= 1;
            if qs[s].l > 0 { busy[s] += 1; let q = qs[s].shift(); let d = expo!(mean[s]); h.push(t + d, k, q); }
            if s + 1 < 3 { s_enter = s + 1; p_enter = e; }
            else { done += 1.0; sum_t += t - born[(e as usize) & mask]; continue; }
        }
        let s = s_enter;
        if busy[s] < servers[s] { busy[s] += 1; let d = expo!(mean[s]); h.push(t + d, (s + 1) as i32, p_enter); }
        else { qs[s].push(p_enter); }
    }
    unsafe { OUT[0] = ev; OUT[1] = done; OUT[2] = sum_t / done; }
    ev
}
#[no_mangle] pub extern "C" fn out(i: u32) -> f64 { unsafe { OUT[i as usize] } }
#[no_mangle] pub extern "C" fn f_ln(x: f64) -> f64 { x.ln() }
#[no_mangle] pub extern "C" fn f_exp(x: f64) -> f64 { x.exp() }
#[no_mangle] pub extern "C" fn f_sin(x: f64) -> f64 { x.sin() }
#[no_mangle] pub extern "C" fn f_cos(x: f64) -> f64 { x.cos() }
#[no_mangle] pub extern "C" fn f_pow(x: f64, y: f64) -> f64 { x.powf(y) }
#[no_mangle] pub extern "C" fn f_sqrt(x: f64) -> f64 { x.sqrt() }
