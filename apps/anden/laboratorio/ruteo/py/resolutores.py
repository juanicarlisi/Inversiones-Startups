"""PyVRP y OR-Tools sobre la MISMA instancia, mismas matrices enteras, mismo objetivo (fijo + costo de arcos por perfil de vehiculo).
Cada funcion devuelve {rutas, curva[(segundos, costo_mUSD)], iteraciones, ...}. La factibilidad y el costo reportados salen de modelo.evaluar, no del solucionador."""
import time
import numpy as np
from modelo import Instancia, evaluar

BIG = 2 ** 40


def resolver_pyvrp(inst, segundos, semilla=1, inicial=None, display=False, max_iter=None):
    from pyvrp import Model
    from pyvrp.stop import MaxRuntime, MaxIterations
    m = Model()
    L = [m.add_location(x=int(inst.deposito["lon"] * 1e5), y=int(inst.deposito["lat"] * 1e5))]
    for c in inst.clientes:
        L.append(m.add_location(x=int(c["lon"] * 1e5), y=int(c["lat"] * 1e5)))
    dep = m.add_depot(L[0], tw_early=int(inst.tw_ini[0]), tw_late=int(inst.tw_fin[0]))
    locs = list(L)
    for k, c in enumerate(inst.clientes):
        m.add_client(L[k + 1], delivery=int(c["demanda"]), service_duration=int(c["servicio_s"]),
                     tw_early=int(c["tw_ini"]), tw_late=int(c["tw_fin"]))
    perfiles = {}
    tipos_vt = []
    for T in inst.flota:
        p = m.add_profile(name=T["tipo"]); perfiles[T["tipo"]] = p
        dm, cm = inst.dur[T["tipo"]], inst.costo[T["tipo"]]
        for i, a in enumerate(locs):
            for j, b in enumerate(locs):
                if i != j: m.add_edge(a, b, distance=int(cm[i, j]), duration=int(dm[i, j]), profile=p)   # "distance" = costo del arco en mUSD
        tipos_vt.append(m.add_vehicle_type(num_available=T["cantidad"], capacity=T["capacidad"], start_depot=dep, end_depot=dep,
                                           fixed_cost=T["fijo_mUSD"], tw_early=int(inst.tw_ini[0]), tw_late=int(inst.tw_fin[0]),
                                           shift_duration=T["jornada_max_s"], unit_distance_cost=1, unit_duration_cost=0,
                                           profile=p, name=T["tipo"]))
    t0 = time.time()
    res = m.solve(stop=(MaxIterations(max_iter) if max_iter else MaxRuntime(segundos)), seed=semilla, display=display, collect_stats=True, initial_solution=inicial)
    el = time.time() - t0
    best = res.best
    from pyvrp import ActivityType
    rutas = []
    for r in best.routes():
        rutas.append((m.vehicle_types[r.vehicle_type()].name, [int(a.idx) + 1 for a in r.schedule() if a.type == ActivityType.CLIENT]))
    curva = []; mejor = None; acum = 0.0
    for dato, rt_ in zip(res.stats.data, res.stats.runtimes):
        acum += rt_
        if dato.best_feas and (mejor is None or dato.best_cost < mejor):
            mejor = dato.best_cost; curva.append((round(acum, 3), int(dato.best_cost)))
    return {"rutas": rutas, "curva": curva, "iteraciones": res.num_iterations, "segundos": el, "modelo": m, "best": best,
            "feasible_pyvrp": bool(res.is_feasible()), "costo_pyvrp": int(res.cost()) if res.is_feasible() else None}


def resolver_ortools(inst, segundos, primera="PATH_CHEAPEST_ARC", meta="GUIDED_LOCAL_SEARCH", display=False, inicial=None):
    from ortools.constraint_solver import pywrapcp, routing_enums_pb2
    flota = []
    for T in inst.flota:
        flota += [T] * T["cantidad"]
    nv = len(flota)
    man = pywrapcp.RoutingIndexManager(inst.n + 1, nv, 0)
    rt = pywrapcp.RoutingModel(man)
    # tiempo (viaje + servicio en el origen) por tipo de vehiculo
    cb_t = {}
    for T in inst.flota:
        d = inst.dur[T["tipo"]].tolist(); sv = inst.servicio.tolist()
        def f(i, j, d=d, sv=sv):
            a, b = man.IndexToNode(i), man.IndexToNode(j)
            return d[a][b] + sv[a]
        cb_t[T["tipo"]] = rt.RegisterTransitCallback(f)
    cb_c = {}
    for T in inst.flota:
        cm = inst.costo[T["tipo"]].tolist()
        def g(i, j, cm=cm):
            return cm[man.IndexToNode(i)][man.IndexToNode(j)]
        cb_c[T["tipo"]] = rt.RegisterTransitCallback(g)
    for v, T in enumerate(flota):
        rt.SetArcCostEvaluatorOfVehicle(cb_c[T["tipo"]], v)
        rt.SetFixedCostOfVehicle(int(T["fijo_mUSD"]), v)
    dem = inst.demanda.tolist()
    cb_d = rt.RegisterUnaryTransitCallback(lambda i: dem[man.IndexToNode(i)])
    rt.AddDimensionWithVehicleCapacity(cb_d, 0, [int(T["capacidad"]) for T in flota], True, "Cap")
    horizonte = int(inst.tw_fin[0])
    rt.AddDimensionWithVehicleTransits([cb_t[T["tipo"]] for T in flota], horizonte, horizonte, False, "Tiempo")
    td = rt.GetDimensionOrDie("Tiempo")
    for c in range(1, inst.n + 1):
        td.CumulVar(man.NodeToIndex(c)).SetRange(int(inst.tw_ini[c]), int(inst.tw_fin[c]))
    for v, T in enumerate(flota):
        td.CumulVar(rt.Start(v)).SetRange(int(inst.tw_ini[0]), int(inst.tw_fin[0]))
        td.CumulVar(rt.End(v)).SetRange(int(inst.tw_ini[0]), int(inst.tw_fin[0]))
        td.SetSpanUpperBoundForVehicle(int(T["jornada_max_s"]), v)
        rt.AddVariableMinimizedByFinalizer(td.CumulVar(rt.Start(v)))
        rt.AddVariableMinimizedByFinalizer(td.CumulVar(rt.End(v)))
    p = pywrapcp.DefaultRoutingSearchParameters()
    p.first_solution_strategy = getattr(routing_enums_pb2.FirstSolutionStrategy, primera)
    p.local_search_metaheuristic = getattr(routing_enums_pb2.LocalSearchMetaheuristic, meta)
    p.time_limit.FromMilliseconds(int(segundos * 1000))
    p.log_search = display
    curva = []; t0 = time.time()
    mejor_cb = [None]
    def cb():
        v = int(rt.CostVar().Value())
        if mejor_cb[0] is None or v < mejor_cb[0]:
            mejor_cb[0] = v; curva.append((round(time.time() - t0, 3), v))
    rt.AddAtSolutionCallback(cb)
    sol = rt.SolveWithParameters(p)
    el = time.time() - t0
    if sol is None:
        return {"rutas": None, "curva": curva, "segundos": el, "estado": rt.status()}
    rutas = []
    for v, T in enumerate(flota):
        idx = rt.Start(v); seq = []
        while not rt.IsEnd(idx):
            n = man.IndexToNode(idx)
            if n != 0: seq.append(n)
            idx = sol.Value(rt.NextVar(idx))
        if seq: rutas.append((T["tipo"], seq))
    return {"rutas": rutas, "curva": curva, "segundos": el, "estado": rt.status(), "costo_ortools": sol.ObjectiveValue()}


def costo_en(curva, t):
    """Mejor costo conocido a los t segundos segun la curva de mejoras."""
    mejor = None
    for s, c in curva:
        if s <= t: mejor = c
    return mejor


if __name__ == "__main__":
    inst = Instancia(30)
    a = resolver_pyvrp(inst, 3)
    print("pyvrp", evaluar(inst, a["rutas"]), a["costo_pyvrp"], a["iteraciones"], a["curva"][-2:])
    b = resolver_ortools(inst, 3)
    print("ortools", evaluar(inst, b["rutas"]) if b["rutas"] else b, b.get("costo_ortools"), b["curva"][-2:])


def resolver_vroom(inst, nivel=5, hilos=1):
    """VROOM 1.15 (pyvroom). Mismo objetivo: fijo + per_km (matriz de distancias por perfil). VROOM no expresa 'jornada maxima' separada de la ventana del vehiculo:
    el evaluador independiente dice si la solucion viola la jornada."""
    import vroom
    inp = vroom.Input()
    for T in inst.flota:
        inp.set_durations_matrix(T["tipo"], inst.dur[T["tipo"]].astype(int).tolist())
        inp.set_distances_matrix(T["tipo"], inst.dist.astype(int).tolist())
    vid = 0; tipo_de_vid = {}
    for T in inst.flota:
        for _ in range(T["cantidad"]):
            vid += 1; tipo_de_vid[vid] = T["tipo"]
            inp.add_vehicle(vroom.Vehicle(vid, start=0, end=0, profile=T["tipo"], capacity=[int(T["capacidad"])],
                                          time_window=vroom.TimeWindow(int(inst.tw_ini[0]), int(inst.tw_fin[0])),
                                          costs=vroom.VehicleCosts(fixed=int(T["fijo_mUSD"]), per_hour=0, per_km=int(T["por_km_mUSD"]))))
    for c in range(1, inst.n + 1):
        inp.add_job(vroom.Job(c, location=c, default_service=int(inst.servicio[c]), delivery=[int(inst.demanda[c])],
                              time_windows=[vroom.TimeWindow(int(inst.tw_ini[c]), int(inst.tw_fin[c]))]))
    t0 = time.time()
    sol = inp.solve(exploration_level=nivel, nb_threads=hilos)
    el = time.time() - t0
    df = sol.routes
    rutas = []
    if len(df):
        for v, g in df.groupby("vehicle_id"):
            seq = [int(i) for i in g[g["type"] == "job"]["id"].tolist()]
            if seq: rutas.append((tipo_de_vid[int(v)], seq))
    return {"rutas": rutas, "curva": [(round(el, 3), None)], "segundos": el, "resumen": str(sol.summary.cost)}


if __name__ == "__main__" and False:
    pass


def solucion_pyvrp(modelo, rutas):
    """Convierte rutas [(tipo, [posiciones 1..n])] en pyvrp.Solution para usarla como solucion inicial (arranque en caliente)."""
    from pyvrp import Route, Solution
    data = modelo.data()
    vt = {v.name: i for i, v in enumerate(modelo.vehicle_types)}
    rs = [Route(data, [int(c) - 1 for c in ruta], vt[tipo]) for tipo, ruta in rutas]
    return Solution(data, rs)
