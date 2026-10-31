// Jerarquias de contraccion (fast_paths, Apache-2.0/MIT) expuestas por ABI C a WebAssembly, sin wasm-bindgen.
use fast_paths::{FastGraph, InputGraph, PathCalculator};
use std::cell::RefCell;

struct Estado { g: FastGraph, calc: PathCalculator }
thread_local! { static ST: RefCell<Option<Estado>> = RefCell::new(None); }

#[no_mangle] pub extern "C" fn reservar(n: usize) -> *mut u8 { let mut v = Vec::<u8>::with_capacity(n); let p = v.as_mut_ptr(); std::mem::forget(v); p }
#[no_mangle] pub extern "C" fn liberar(p: *mut u8, n: usize) { unsafe { drop(Vec::from_raw_parts(p, 0, n)); } }

/// n nodos, m aristas dirigidas (src,dst: u32; w: u32 en milisegundos). Devuelve la cantidad de aristas de la jerarquia (incl. atajos).
#[no_mangle] pub extern "C" fn construir(n: usize, m: usize, src: *const u32, dst: *const u32, w: *const u32) -> usize {
    let (s, d, ww) = unsafe { (std::slice::from_raw_parts(src, m), std::slice::from_raw_parts(dst, m), std::slice::from_raw_parts(w, m)) };
    let mut ig = InputGraph::new();
    for i in 0..m { ig.add_edge(s[i] as usize, d[i] as usize, ww[i].max(1) as usize); }
    ig.freeze();
    let fg = fast_paths::prepare(&ig);
    let calc = fast_paths::create_calculator(&fg);
    let _ = n;
    let e = fg.get_num_out_edges() + fg.get_num_in_edges();
    ST.with(|c| *c.borrow_mut() = Some(Estado { g: fg, calc }));
    e
}
/// Peso del camino mas corto en ms, o -1 si no hay camino.
#[no_mangle] pub extern "C" fn consulta(a: usize, b: usize) -> i64 {
    ST.with(|c| { let mut c = c.borrow_mut(); let e = c.as_mut().unwrap();
        match e.calc.calc_path(&e.g, a, b) { Some(p) => p.get_weight() as i64, None => -1 } })
}
/// Escribe los nodos del camino en out (u32); devuelve cuantos (0 si no hay camino).
#[no_mangle] pub extern "C" fn camino(a: usize, b: usize, out: *mut u32, cap: usize) -> usize {
    ST.with(|c| { let mut c = c.borrow_mut(); let e = c.as_mut().unwrap();
        match e.calc.calc_path(&e.g, a, b) { Some(p) => { let nodes = p.get_nodes(); let k = nodes.len().min(cap);
            let o = unsafe { std::slice::from_raw_parts_mut(out, cap) }; for i in 0..k { o[i] = nodes[i] as u32; } k }, None => 0 } })
}
