"""Benchmarks publicados (Solomon 100 clientes y Gehring-Homberger 200 clientes, VRPTW) con PyVRP y OR-Tools a presupuesto de tiempo corto.
Instancias y mejores soluciones conocidas (BKS) de https://github.com/PyVRP/Instances (carpeta VRPTW; BKS de CVRPLIB). Redondeo DIMACS (distancias truncadas a 1 decimal).
Objetivo: solo distancia total (convencion DIMACS), flota limitada por la instancia. Uso: python3 benchmark_literatura.py <dir_instancias> <segundos> <procesos> [instancias...]"""
import json, os, sys, time
from multiprocessing import Pool
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def bks(path):
    for l in open(path):
        if l.startswith("Cost"): return float(l.split()[1])


def pyvrp_run(args):
    import pyvrp
    from pyvrp.stop import MaxRuntime
    ruta, seg, semilla = args
    data = pyvrp.read(ruta, round_func="dimacs")
    t = time.time(); c0 = time.process_time(); res = pyvrp.solve(data, stop=MaxRuntime(seg), seed=semilla, display=False); el = time.time() - t; cpu = time.process_time() - c0
    ok = res.is_feasible()
    return {"solver": f"pyvrp_s{semilla}", "factible": bool(ok), "costo": res.cost() / 10 if ok else None, "veh": res.best.num_routes(), "seg": round(el, 2), "cpu": round(cpu, 2), "it": res.num_iterations}


def ortools_run(args):
    import pyvrp
    from ortools.constraint_solver import pywrapcp, routing_enums_pb2
    ruta, seg, primera = args
    data = pyvrp.read(ruta, round_func="dimacs")
    nc = data.num_clients; vt = data.vehicle_type(0); nv = vt.num_available
    D = data.distance_matrix(0).tolist() if hasattr(data.distance_matrix(0), "tolist") else data.distance_matrix(0)
    T = data.duration_matrix(0).tolist()
    cl = data.clients(); dep = data.depots()[0]
    serv = [0] * (nc + 1); dem = [0] * (nc + 1)
    for i, c in enumerate(cl, start=1):
        serv[i] = int(c.service_duration); dem[i] = int(c.delivery[0])
    man = pywrapcp.RoutingIndexManager(nc + 1, nv, 0); rt = pywrapcp.RoutingModel(man)
    cd = rt.RegisterTransitCallback(lambda i, j: int(D[man.IndexToNode(i)][man.IndexToNode(j)]))
    rt.SetArcCostEvaluatorOfAllVehicles(cd)
    ct = rt.RegisterTransitCallback(lambda i, j: int(T[man.IndexToNode(i)][man.IndexToNode(j)]) + serv[man.IndexToNode(i)])
    cq = rt.RegisterUnaryTransitCallback(lambda i: dem[man.IndexToNode(i)])
    rt.AddDimensionWithVehicleCapacity(cq, 0, [int(vt.capacity[0])] * nv, True, "Cap")
    H = int(max(c.tw_late for c in cl) + max(serv) + max(T[i][0] for i in range(nc + 1)))   # la ventana del deposito viene sin limite en estas instancias
    rt.AddDimension(ct, H, H, False, "Tiempo"); td = rt.GetDimensionOrDie("Tiempo")
    for i, c in enumerate(cl, start=1):
        td.CumulVar(man.NodeToIndex(i)).SetRange(int(c.tw_early), int(c.tw_late))
    for v in range(nv):
        td.CumulVar(rt.Start(v)).SetRange(int(dep.tw_early), H); td.CumulVar(rt.End(v)).SetRange(int(dep.tw_early), H)
    p = pywrapcp.DefaultRoutingSearchParameters()
    p.first_solution_strategy = getattr(routing_enums_pb2.FirstSolutionStrategy, primera)
    p.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    p.time_limit.FromMilliseconds(int(seg * 1000))
    t = time.time(); c0 = time.process_time(); sol = rt.SolveWithParameters(p); el = time.time() - t; cpu = time.process_time() - c0
    if sol is None: return {"solver": f"ortools_{primera}", "factible": False, "costo": None, "veh": None, "seg": round(el, 2), "cpu": round(cpu, 2)}
    veh = sum(1 for v in range(nv) if not rt.IsEnd(sol.Value(rt.NextVar(rt.Start(v)))))
    return {"solver": f"ortools_{primera}", "factible": True, "costo": sol.ObjectiveValue() / 10, "veh": veh, "seg": round(el, 2), "cpu": round(cpu, 2)}


def tarea(a):
    kind, nombre, ruta, seg, par = a
    r = pyvrp_run((ruta, seg, par)) if kind == "pyvrp" else ortools_run((ruta, seg, par))
    r["instancia"] = nombre; return r


if __name__ == "__main__":
    base, seg, procs = sys.argv[1], float(sys.argv[2]), int(sys.argv[3])
    nombres = sys.argv[4:] or ["Solomon/R101", "Solomon/R201", "Solomon/RC101", "Solomon/RC201", "Solomon/C101", "Solomon/C201",
                               "GH200/R1_2_1", "GH200/R2_2_1", "GH200/RC1_2_1", "GH200/RC2_2_1", "GH200/C1_2_1", "GH200/C2_2_1"]
    trabajos = []
    for nom in nombres:
        ruta = os.path.join(base, nom + ".vrp")
        for s in (1, 2, 3): trabajos.append(("pyvrp", nom, ruta, seg, s))
        for f in ("PARALLEL_CHEAPEST_INSERTION", "SAVINGS", "PATH_CHEAPEST_ARC"): trabajos.append(("ortools", nom, ruta, seg, f))
    carga0 = os.getloadavg()[0]; t0 = time.time()
    with Pool(procs) as P: res = P.map(tarea, trabajos, chunksize=1)
    out = {"segundos": seg, "procesos": procs, "carga_ini_fin": [carga0, os.getloadavg()[0]], "duracion_s": round(time.time() - t0), "bks": {}, "resultados": res}
    for nom in nombres: out["bks"][nom] = bks(os.path.join(base, nom + ".sol"))
    os.makedirs(os.path.join(RAIZ, "resultados"), exist_ok=True)
    json.dump(out, open(os.path.join(RAIZ, "resultados", f"literatura_{int(seg)}s.json"), "w"), indent=1)
    print("listo", out["duracion_s"], "s")
