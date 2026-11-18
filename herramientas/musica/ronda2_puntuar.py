"""Puntúa los clips de la ronda 2: estética (Audiobox Aesthetics), estilo (CLAP) y artefactos (señal) (17-11-2026).

    python ronda2_puntuar.py gen/manifiesto.jsonl puntajes.jsonl      # agrega lo que falte (se puede correr varias veces)
    python ronda2_puntuar.py --archivos a.wav b.wav --estilo piano_orar # puntúa archivos sueltos (p. ej. después del master)

Qué mide:
- Audiobox Aesthetics (Meta, CC BY 4.0): PQ calidad de producción, CE disfrute, CU utilidad, PC complejidad; y la peor ventana de
  10 s en PQ (un tramo roto baja ahí aunque el promedio quede bien).
- CLAP (laion/clap-htsat-unfused, Apache 2.0; larger_clap_music da similitudes ~0 con transformers 5.23, no se usa): parecido del audio con la descripción del estilo y si el clip «se reconoce» como su
  estilo frente a los otros ocho (rango 1 = se reconoce).
- Artefactos por señal: chasquidos (picos de flujo espectral en el agudo), huecos (caídas de nivel en el medio), final cortado,
  aire metálico (energía y planitud por encima de 12 kHz), compatibilidad mono.
Puntaje para elegir (dentro de un mismo estilo): 0,4*CE + 0,4*PQ + 0,2*CU, con descuento si falla el estilo, si la peor
ventana cae mucho o hay huecos. Los «chasquidos» quedan como dato: el piano grabado de verdad también los dispara (ataques).
"""
import argparse, json, subprocess, sys
from pathlib import Path

import numpy as np
import torch

torch.set_num_threads(4)

DESCRIPCION = {
    "piano_orar": "a slow, calm solo grand piano piece, peaceful and reverent",
    "piano_cuerdas": "a slow worship piano piece with soft strings in the background",
    "dormir": "slow ambient pad music for sleep, no drums",
    "bossa": "a bossa nova instrumental with nylon guitar, bass and soft drums",
    "jazz_cafe": "a relaxed jazz piano trio with upright bass and brushes",
    "flamenco": "chill flamenco guitar with hand claps and cajon",
    "guitarra_sola": "a calm solo spanish classical guitar",
    "rumba": "upbeat spanish rumba flamenca with strummed guitars and hand claps",
    "tango": "a tango instrumental with bandoneon, piano and double bass",
}
ESTILO_EXTRA = {  # otros rivales para el rango (cosas que no queremos)
    "x_voces": "a song with a singer and vocals",
    "x_electronica": "electronic dance music with synthesizers and a heavy beat",
    "x_ruido": "noisy, distorted, low quality recording",
}


def cargar(path, sr):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(sr), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).reshape(-1, 2).T.copy()


class Oido:
    def __init__(self, clap=True):
        from audiobox_aesthetics.infer import initialize_predictor
        self.aes = initialize_predictor()
        self.clap = None
        if clap:
            from transformers import ClapModel, ClapProcessor
            self.clap = ClapModel.from_pretrained("laion/clap-htsat-unfused").eval()
            self.proc = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
            textos = list(DESCRIPCION.values()) + list(ESTILO_EXTRA.values())
            self.claves = list(DESCRIPCION) + list(ESTILO_EXTRA)
            with torch.inference_mode():
                t = self.proc(text=textos, return_tensors="pt", padding=True)
                e = self.clap.get_text_features(**t)
                e = e.pooler_output if hasattr(e, "pooler_output") else e
                self.temb = torch.nn.functional.normalize(e, dim=-1)

    def estetica(self, mono16, ventanas=False):
        """Una sola pasada: el modelo puntúa ventanas de 10 s (como el CLI oficial) y de ahí salen el promedio ponderado
        y la peor ventana."""
        from audiobox_aesthetics.infer import make_inference_batch, AXES_NAME
        w = torch.from_numpy(mono16).unsqueeze(0)
        wavs, masks, weights, _ = make_inference_batch([w], 10, 10, sample_rate=16000)
        with torch.inference_mode():
            preds = self.aes.model({"wav": torch.stack(wavs), "mask": torch.stack(masks)})
        pesos = torch.tensor(weights)
        por = {k: self.aes.target_transform[k].inverse(preds[k]).flatten() for k in AXES_NAME}
        r = {k: float((por[k] * pesos).sum() / pesos.sum()) for k in AXES_NAME}
        completas = [i for i, p in enumerate(weights) if p > 0.6]
        r["PQ_peor10s"] = float(min(por["PQ"][i] for i in completas))
        out = {k: round(v, 3) for k, v in r.items()}
        if ventanas:
            out["_ventanas"] = [(i * 10, float(por["CE"][i] + por["PQ"][i])) for i in completas]
            out["_pq"] = [(i * 10, float(por["PQ"][i])) for i in completas]
        return out

    def estilo(self, mono48, estilo):
        trozos = [mono48[i:i + 48000 * 10] for i in range(0, len(mono48) - 48000 * 5, 48000 * 10)]
        with torch.inference_mode():
            a = self.proc(audio=trozos, sampling_rate=48000, return_tensors="pt")
            e = self.clap.get_audio_features(**a)
            e = e.pooler_output if hasattr(e, "pooler_output") else e
            e = torch.nn.functional.normalize(e, dim=-1).mean(0, keepdim=True)
            e = torch.nn.functional.normalize(e, dim=-1)
            sims = (e @ self.temb.T)[0].numpy()
        orden = list(np.argsort(-sims))
        i = self.claves.index(estilo) if estilo in self.claves else None
        return {"clap_sim": round(float(sims[i]), 4) if i is not None else None,
                "clap_rango": (orden.index(i) + 1) if i is not None else None,
                "clap_top": self.claves[orden[0]]}


def artefactos(st, sr=44100):
    """Medidas de señal sobre el estéreo a 44,1 kHz."""
    mono = st.mean(0)
    n = 2048; hop = 512
    win = np.hanning(n).astype(np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(mono, n)[::hop] * win
    spec = np.abs(np.fft.rfft(frames, axis=1)) + 1e-9
    freqs = np.fft.rfftfreq(n, 1 / sr)
    hi = freqs > 12000
    e_tot = (spec ** 2).sum(1)
    e_hi = (spec[:, hi] ** 2).sum(1)
    hf_ratio = float(e_hi.sum() / e_tot.sum())
    flat_hi = float(np.exp(np.log(spec[:, hi]).mean(1)).mean() / spec[:, hi].mean(1).mean())
    # chasquidos: flujo positivo en 6-16 kHz, picos muy por encima de la mediana
    band = (freqs > 6000) & (freqs < 16000)
    lb = np.log(spec[:, band])
    flux = np.maximum(lb[1:] - lb[:-1], 0).mean(1)
    med = np.median(flux) + 1e-6
    mad = np.median(np.abs(flux - med)) + 1e-6
    z = (flux - med) / mad
    chasquidos = int((z > 25).sum())
    # nivel por cuadro
    rms = np.sqrt((frames ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(rms)
    cuerpo = db[int(len(db) * 0.05):int(len(db) * 0.92)]
    ref = np.median(cuerpo)
    huecos = int((cuerpo < ref - 30).sum())
    # final: últimos 1,5 s contra los 5 s anteriores (un corte en seco o un ruido final)
    fps = sr / hop
    ult = db[-int(1.5 * fps):].mean(); ant = db[-int(6.5 * fps):-int(1.5 * fps)].mean()
    ult_hi = e_hi[-int(1.5 * fps):].mean() / (e_tot[-int(1.5 * fps):].mean() + 1e-12)
    l, r = st[0], st[1]
    corr = float(np.corrcoef(l, r)[0, 1]) if l.std() > 0 and r.std() > 0 else 1.0
    rms_mono = np.sqrt((((l + r) / 2) ** 2).mean())
    rms_st = np.sqrt(((l ** 2 + r ** 2) / 2).mean()) + 1e-12
    mono_perdida = float(20 * np.log10(rms_mono / rms_st + 1e-12))
    # silbidos: líneas finas y quietas por encima de 7 kHz (prominencia sobre la mediana local del espectro promedio)
    from scipy.ndimage import median_filter
    lp = 10 * np.log10((spec ** 2).mean(0) + 1e-20)
    prom = lp - median_filter(lp, size=21, mode="nearest")
    tono = float(prom[freqs > 7000].max())
    return {"tono_agudo_db": round(tono, 1), "hf_ratio": round(hf_ratio, 5), "planitud_agudo": round(flat_hi, 4), "chasquidos": chasquidos,
            "huecos": huecos, "final_db": round(float(ult - ant), 2), "final_agudo": round(float(ult_hi), 5),
            "corr_lr": round(corr, 3), "perdida_mono_db": round(mono_perdida, 2),
            "pico": round(float(np.abs(st).max()), 3)}


def puntaje(f):
    base = 0.4 * f["CE"] + 0.4 * f["PQ"] + 0.2 * f["CU"]
    pena = 0.0
    if f.get("clap_rango") and f["clap_rango"] > 4:
        pena += 0.3
    if f.get("clap_top", "").startswith("x_"):
        pena += 0.5
    if f["huecos"] > 20:
        pena += 0.2
    if f["PQ_peor10s"] < f["PQ"] - 0.6:
        pena += 0.2
    return round(base - pena, 3)


def medir(oido, wav, estilo):
    st = cargar(wav, 44100)
    m16 = cargar(wav, 16000).mean(0)
    f = oido.estetica(m16)
    if oido.clap is not None:
        f |= oido.estilo(cargar(wav, 48000).mean(0), estilo)
    f |= artefactos(st)
    f["puntaje"] = puntaje(f)
    return f


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("manifiesto", nargs="?")
    ap.add_argument("salida", nargs="?")
    ap.add_argument("--archivos", nargs="*")
    ap.add_argument("--estilo")
    ap.add_argument("--sin-clap", action="store_true")
    a = ap.parse_args()
    oido = Oido(clap=not a.sin_clap)
    if a.archivos:
        for w in a.archivos:
            f = medir(oido, w, a.estilo)
            print(json.dumps({"wav": w} | f, ensure_ascii=False))
        sys.exit()
    hechos = set()
    if Path(a.salida).exists():
        hechos = {json.loads(l)["id"] for l in open(a.salida)}
    for l in open(a.manifiesto):
        c = json.loads(l)
        if not c.get("ok") or c["id"] in hechos:
            continue
        f = medir(oido, c["wav"], c["estilo"])
        fila = {k: c[k] for k in ("id", "estilo", "forma", "seed", "cfg", "wav")} | f
        with open(a.salida, "a") as out:
            out.write(json.dumps(fila, ensure_ascii=False) + "\n")
        hechos.add(c["id"])
        print(f"{c['id']}: puntaje {f['puntaje']} PQ {f['PQ']} CE {f['CE']} clap#{f.get('clap_rango')} ({f.get('clap_top')}) "
              f"chasq {f['chasquidos']} huecos {f['huecos']}", flush=True)
