"""Elección de los 3 candidatos por estilo de la ronda 2 (18-11-2026), con el criterio que dejó la calibración contra el oído
del fundador: el evaluador automático NO decide cuál es mejor (en la ronda 1 puso arriba lo que el fundador puso abajo).

    AESVENV/bin/python ronda2_elegir.py puntajes.jsonl manifiesto.jsonl --salida seleccion_r2.json

Cómo elige:
1. Descarta lo roto o flojo de verdad, con motivo escrito (señal y evaluador solo como filtro):
   - CLAP lo oye como voz, electrónica o ruido (rival «x_»), o no reconoce el estilo (rango > 5 de 12);
   - mono puro (correlación L/R >= 0,99) o fase invertida (correlación < -0,3: suena hueco y se cae en mono);
   - flojo de verdad: puntaje más de 1,5 desvíos por debajo del promedio de su estilo;
   - la revisión a ojo del espectrograma (--excluir): artefactos que el evaluador no ve, como parciales metálicos que ondulan
     por encima de los armónicos del instrumento (el evaluador le había dado a uno de esos la calidad más alta de su forma);
   - ningún tramo de 45 s sano: en todos hay una ventana de 10 s con calidad de producción (PQ) 0,6 o más por debajo del
     promedio del propio clip (un tramo roto).
   Lo que NO descarta (probado el 18-11 y dejado como dato): los «huecos» (caídas de 30 dB) son casi siempre cortes musicales
   (en rumba aparecen en el mismo segundo con dos semillas distintas del mismo pedido) y los «saltos» de timbre CLAP entre
   bloques de 10 s no tienen validación: con un umbral por estilo descartaban 11 de 14 tangos, justo los que CLAP reconoce como
   tango. Los dos solo ayudan a elegir el tramo.
2. Elige 3 por estilo con VARIEDAD de forma de pedir (T, N, C, TG = prompt con etiquetas, narrativo, corto, guía+negativo): uno
   por forma, así el voto del fundador también dice qué forma de pedir conviene. Primero la forma de la etapa 2 (8 semillas).
3. Dentro de cada forma van primero los que CLAP reconoce como su estilo (rango 1: con la regla anterior los tres tangos
   elegidos sonaban, para CLAP, a jazz o a flamenco); después los que tienen un tramo sin cortes de silencio (los cortes pueden
   ser musicales, pero tres rumbas con cortes de 0,4 s en silencio digital cada 8 compases no dejan comparar); después el
   PARECIDO a lo que el fundador prefirió en la ronda 1 (similitud CLAP audio-audio con el clip de Stable Audio 3 mejor votado
   de su familia: piano p3 = 5, bossa c2 = 6, tango c3 = 6). Donde no hay referencia (dormir, española: comparar flamenco con
   la bossa lo empujaría a sonar a bossa) desempata la estabilidad (peor ventana).
4. El tramo de 45 s (inicio 0, 10, 20 o 30 s): entre los sanos, primero los que no tienen cortes ni el salto más grande del
   clip, después los que no tienen cortes; entre esos, el de mejor promedio de ventanas del evaluador (uso permitido: elegir tramo dentro de un mismo clip), y
   solo si gana por más de 0,15 al primero; si no, el primero.
"""
import argparse, json, os, statistics, sys
from collections import defaultdict
from pathlib import Path

import numpy as np
import torch

sys.path.insert(0, str(Path(__file__).parent))
from ronda2_puntuar import Oido, cargar  # noqa: E402

# clips de la ronda 1 decodificados a WAV y nivelados a -14 LUFS (ronda1_p3.wav, ronda1_c2.wav, ronda1_c3.wav)
ESCUCHA1 = Path(os.environ.get("R2_DIR", "/tmp/claude-0/-home-user/918eaeee-0db4-56e9-bb55-8ead9bee57c1/scratchpad/r2")) / "ref"
REF = {"piano_orar": "ronda1_p3.wav", "piano_cuerdas": "ronda1_p3.wav", "bossa": "ronda1_c2.wav",
       "jazz_cafe": "ronda1_c2.wav", "tango": "ronda1_c3.wav"}
DUR, INICIOS = 45, (0, 10, 20, 30)
SR = 48000


def emb_ventanas(oido, wav, paso=5):
    """Embeddings CLAP de ventanas de 10 s cada `paso` s (normalizados)."""
    x = cargar(wav, SR).mean(0)
    ini = list(range(0, int(len(x) / SR) - 9, paso))
    trozos = [x[i * SR:(i + 10) * SR] for i in ini]
    with torch.inference_mode():
        a = oido.proc(audio=trozos, sampling_rate=SR, return_tensors="pt")
        e = oido.clap.get_audio_features(**a)
        e = e.pooler_output if hasattr(e, "pooler_output") else e
        e = torch.nn.functional.normalize(e, dim=-1).numpy()
    return ini, e


def saltos(ini, e):
    """Distancia coseno entre el bloque [t, t+10) y el siguiente [t+10, t+20): (t+10, distancia) = salto en t+10 s."""
    pos = {t: i for i, t in enumerate(ini)}
    return [(t + 10, float(1 - e[i] @ e[pos[t + 10]])) for t, i in pos.items() if t + 10 in pos]


def media_emb(e):
    m = e.mean(0)
    return m / np.linalg.norm(m)


def huecos_pos(wav, sr=44100):
    """Segundos donde el nivel cae 30 dB por debajo de la mediana (misma regla que ronda2_puntuar.artefactos)."""
    st = cargar(wav, sr); m = st.mean(0); n, hop = 2048, 512
    fr = np.lib.stride_tricks.sliding_window_view(m, n)[::hop]
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1) + 1e-12))
    a, b = int(len(db) * 0.05), int(len(db) * 0.92)
    ref = np.median(db[a:b])
    return sorted({round(i * hop / sr, 1) for i in range(a, b) if db[i] < ref - 30})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("puntajes"); ap.add_argument("manifiesto"); ap.add_argument("--salida", required=True)
    ap.add_argument("--n", type=int, default=3)
    ap.add_argument("--excluir", help="JSON {id: motivo} de la revisión a ojo de los espectrogramas (artefactos que el "
                                      "evaluador no ve, p. ej. parciales metálicos)")
    a = ap.parse_args()
    excluir = json.load(open(a.excluir)) if a.excluir else {}
    filas = [json.loads(l) for l in open(a.puntajes)]
    man = {json.loads(l)["id"]: json.loads(l) for l in open(a.manifiesto)}
    oido = Oido()
    cache_p = Path(a.salida).with_name("medidas_elegir.json")
    cache = json.load(open(cache_p)) if cache_p.exists() else {}
    refs = {}
    for est, f in REF.items():
        if f not in refs:
            refs[f] = media_emb(emb_ventanas(oido, ESCUCHA1 / f)[1])
    por = defaultdict(list)
    for f in filas:
        por[f["estilo"]].append(f)
    # forma de la etapa 2 = la que tiene más semillas
    sel, informe = [], {}
    for est, fs in por.items():
        cuenta = defaultdict(int)
        for f in fs:
            cuenta[f["forma"]] += 1
        forma2 = max(cuenta, key=cuenta.get)
        mu, sd = statistics.mean(f["puntaje"] for f in fs), statistics.pstdev(f["puntaje"] for f in fs)
        for f in fs:
            if f["id"] not in cache:  # las medidas de cada clip se guardan: cambiar las reglas no obliga a medir de nuevo
                ini, e = emb_ventanas(oido, f["wav"])
                est16 = oido.estetica(cargar(f["wav"], 16000).mean(0), ventanas=True)
                cache[f["id"]] = {"saltos": saltos(ini, e), "huecos": huecos_pos(f["wav"]),
                                  "sim_ref": round(float(media_emb(e) @ refs[REF[est]]), 4) if est in REF else None,
                                  "vent": est16["_ventanas"], "pq": est16["_pq"]}
                json.dump(cache, open(cache_p, "w"))
            m = cache[f["id"]]
            f["_saltos"], f["_huecos"], f["sim_ref"], f["_vent"] = m["saltos"], m["huecos"], m["sim_ref"], m["vent"]
        filas_est = []
        for f in fs:
            pq = cache[f["id"]]["pq"]
            mot = []
            if f["clap_top"].startswith("x_"):
                mot.append(f"CLAP lo oye como {f['clap_top']}")
            if f["clap_rango"] > 5:
                mot.append(f"no se reconoce como su estilo (rango CLAP {f['clap_rango']})")
            if f["corr_lr"] >= 0.99:
                mot.append(f"mono puro (corr {f['corr_lr']})")
            if f["corr_lr"] < -0.3:
                mot.append(f"fase invertida (corr {f['corr_lr']}, pierde {f['perdida_mono_db']} dB en mono)")
            if f["id"] in excluir:
                mot.append("revisión a ojo: " + excluir[f["id"]])
            if f["puntaje"] < mu - 1.5 * sd:
                mot.append(f"flojo (puntaje {f['puntaje']} contra {mu:.2f} ± {sd:.2f})")
            media_pq = sum(v for _, v in pq) / len(pq)
            sanos = [t0 for t0 in INICIOS
                     if all(v >= media_pq - 0.6 for t, v in pq if t >= t0 and t + 10 <= t0 + DUR)
                     and any(t >= t0 and t + 10 <= t0 + DUR for t, _ in pq)]
            if not sanos:
                mot.append(f"todos los tramos de 45 s tienen una ventana rota (PQ mínima {min(v for _, v in pq):.2f} "
                           f"contra {media_pq:.2f})")
            salto_t, salto_d = max(f["_saltos"], key=lambda x: x[1])
            def sin_huecos(t0):
                return not [h for h in f["_huecos"] if t0 + 0.5 <= h <= t0 + DUR - 3]
            # «limpio» = hay un tramo sano sin cortes de silencio. El salto mayor no cuenta para limpio (todo clip tiene uno,
            # aunque sea chico): solo sirve para preferir, entre tramos sin cortes, el que no lo contiene
            f["_limpio"] = any(sin_huecos(t) for t in sanos)
            f["_tramos"] = ([t for t in sanos if sin_huecos(t) and not (t < salto_t < t + DUR)]
                            or [t for t in sanos if sin_huecos(t)] or sanos)
            f["_mot"] = mot
            filas_est.append({"id": f["id"], "forma": f["forma"], "descartado": mot, "sim_ref": f["sim_ref"],
                              "tramos_sanos": sanos, "tramo_limpio": f["_limpio"], "tramos_preferidos": f["_tramos"], "huecos_s": f["_huecos"][:6],
                              "salto_max": [salto_t, round(salto_d, 3)]})
        vivos = [f for f in fs if not f["_mot"]]
        # primero los que CLAP reconoce como su estilo (rango 1), después los que tienen un tramo sin cortes de silencio,
        # después el parecido con lo que prefirió el fundador (o la estabilidad)
        clave = ((lambda f: (f["clap_rango"] > 1, not f["_limpio"], -f["sim_ref"])) if est in REF
                 else (lambda f: (f["clap_rango"] > 1, not f["_limpio"], -f["PQ_peor10s"])))
        formas = sorted({f["forma"] for f in vivos}, key=lambda fo: (fo != forma2, min(clave(f) for f in vivos if f["forma"] == fo)))
        elegidos = []
        for fo in formas:
            if len(elegidos) < a.n:
                elegidos.append(sorted([f for f in vivos if f["forma"] == fo], key=clave)[0])
        for f in sorted(vivos, key=clave):  # si hay menos de 3 formas vivas, se completa con la mejor forma
            if len(elegidos) < a.n and f not in elegidos:
                elegidos.append(f)
        for f in elegidos:
            # tramo: mejor promedio de ventanas del evaluador entre los limpios; 0 salvo que otro gane por > 0,15
            vs = f["_vent"]
            def media(t0):
                d = [v for t, v in vs if t >= t0 and t + 10 <= t0 + DUR]
                return sum(d) / len(d)
            mejor = max(f["_tramos"], key=media)
            base = f["_tramos"][0]
            ini = mejor if media(mejor) > media(base) + 0.15 else base
            sel.append({"id": f["id"], "estilo": est, "forma": f["forma"], "seed": f["seed"], "wav": f["wav"], "inicio": ini,
                        "prompt": man[f["id"]]["prompt"], "cfg": man[f["id"]]["cfg"], "sim_ref": f["sim_ref"],
                        "aes_puntaje": f["puntaje"], "aes_PQ": f["PQ"], "aes_CE": f["CE"], "corr_lr": f["corr_lr"]})
        informe[est] = {"forma_etapa2": forma2, "vivos": len(vivos), "de": len(fs),
                        "elegidos": [f["id"] for f in elegidos], "clips": filas_est}
        print(f"{est}: {len(vivos)}/{len(fs)} vivos; elegidos {[f['id'] for f in elegidos]}", flush=True)
    json.dump(sel, open(a.salida, "w"), ensure_ascii=False, indent=1)
    json.dump(informe, open(Path(a.salida).with_name(Path(a.salida).stem + "_informe.json"), "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
