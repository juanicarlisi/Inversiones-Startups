# Medicion propia del 17-10-2026. Uso: python3 -I des_simpy.py <horizonte_min> <carpeta_con_simpy_4.1.1>
import sys, time, random
sys.path.insert(0, sys.argv[2])
import simpy
H = float(sys.argv[1])
rng = random.Random(42)
servers = [4, 6, 5]; mean = [0.9, 0.9, 0.9]; iat = 0.25
env = simpy.Environment()
res = [simpy.Resource(env, c) for c in servers]
stats = {"done": 0, "sumT": 0.0}
def paquete(env):
    t0 = env.now
    for s in range(3):
        with res[s].request() as req:
            yield req
            yield env.timeout(rng.expovariate(1/mean[s]))
    stats["done"] += 1; stats["sumT"] += env.now - t0
def llegadas(env):
    while True:
        yield env.timeout(rng.expovariate(1/iat))
        env.process(paquete(env))
env.process(llegadas(env))
t = time.perf_counter(); env.run(until=H); dt = time.perf_counter() - t
print({"done": stats["done"], "meanT": stats["sumT"]/stats["done"], "seconds": round(dt,3), "paquetes_por_s": round(stats["done"]/dt)})
