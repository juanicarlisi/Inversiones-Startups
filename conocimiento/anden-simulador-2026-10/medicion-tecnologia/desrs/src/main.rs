fn main(){ let h: f64 = std::env::args().nth(1).map(|s| s.parse().unwrap()).unwrap_or(2e6);
 let t0=std::time::Instant::now(); let ev=desrs::run(42,h); let dt=t0.elapsed().as_secs_f64();
 println!("{{\"native\":true,\"ev\":{},\"done\":{},\"meanT\":{},\"seconds\":{:.3},\"eventsPerSec\":{:.0}}}",ev,desrs::out(1),desrs::out(2),dt,ev/dt); }
