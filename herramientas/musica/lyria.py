"""Lyria 3.5 (Google, API de Gemini) para los mismos estilos de la ronda 2. LISTO, SIN CORRER (17-11-2026).

Decisión del fundador del 17-11-2026: por ahora todo gratis. Este script queda preparado para cuando haya clave; sin
GEMINI_API_KEY solo muestra el plan y el costo y sale sin llamar a nada.

Qué hace falta para activarlo (lo hace el fundador; regla 8, gasta plata):
  1. Proyecto en Google AI Studio con facturación activa (Lyria no tiene capa gratis).
  2. Una clave de la API de Gemini, en la variable de entorno GEMINI_API_KEY (nunca en el repositorio).
  3. Poner un tope de gasto en el proyecto de Google Cloud.

Uso:
    python lyria.py                           # sin clave: muestra plan y costo
    GEMINI_API_KEY=... python lyria.py --estilos bossa,tango --tomas 3 --salida /ruta
    GEMINI_API_KEY=... python lyria.py --modelo lyria-3-clip-preview   # 30 s, mitad de precio, para explorar prompts

Datos de la documentación oficial (aistudio.google.com/docs/music-generation y /docs/pricing, leídas el 17-11-2026):
  - Modelos: `lyria-3.5` (tema entero, «un par de minutos»; el largo se pide en el texto, también con marcas de tiempo
    «[0:00 - 0:30] ...») y `lyria-3-clip-preview` (siempre 30 s).
  - Precio por pedido: lyria-3.5 USD 0,08; lyria-3-clip-preview USD 0,04. Sin capa gratis.
  - API de Interactions: POST https://generativelanguage.googleapis.com/v1beta/interactions, encabezados
    `x-goog-api-key` y `Api-Revision: 2026-05-20`, cuerpo {"model", "input", "response_format": {"type": "audio"}}.
    El audio vuelve en base64 en steps[type=model_output].content[type=audio].data; por defecto MP3, 44,1 kHz estéreo.
    Para WAV la documentación muestra `response_format.mime_type = "audio/wav"` solo en el ejemplo de la CLI (opción --wav,
    probarla en el primer pedido; si da error, se pide MP3 y se convierte).
  - Sin semilla ni prompt negativo: lo instrumental se pide en el texto («Instrumental only, no vocals»). Todo lleva SynthID.
  - Términos: Google no reclama la propiedad de lo generado; puede generar algo similar para otros.
"""
import argparse, base64, json, os, sys, time, urllib.error, urllib.request
from pathlib import Path

URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
PRECIO = {"lyria-3.5": 0.08, "lyria-3-clip-preview": 0.04}

# Mismos estilos que ronda2_prompts.py, escritos para Lyria: estructura con marcas de tiempo, sin nombres de artistas.
ESTILOS = {
    "piano_orar": ("Instrumental only, no vocals. A 2-minute solo grand piano piece for quiet prayer, D flat major, 60 BPM, "
                   "slow and tender hymn-like melody, soft open chords, gentle sustain pedal, warm close-miked concert grand in a "
                   "small stone chapel with natural reverb. No other instruments. [0:00 - 0:20] soft intro; [0:20 - 1:30] simple "
                   "melody that grows a little; [1:30 - 2:00] quiet ending on a long chord."),
    "piano_cuerdas": ("Instrumental only, no vocals. A 2-minute reverent piano piece, E flat major, 60 BPM: a grand piano leads a "
                      "slow lyrical melody while a very soft legato string ensemble holds long chords far behind it. No drums. "
                      "Warm concert hall, peaceful and hopeful."),
    "dormir": ("Instrumental only, no vocals. A 3-minute ambient piece for deep sleep, F major, no beat: warm slowly breathing "
               "pads, a soft low drone and a few distant felt-piano notes with long tails. Dark, smooth, no sharp sounds."),
    "bossa": ("Instrumental only, no vocals. A 2-minute elegant bossa nova for a café, D major, 128 BPM: nylon-string guitar with "
              "the syncopated bossa groove and major seventh chords, upright bass, brushes with rim clicks, a flute and a soft "
              "piano sharing a relaxed melody. Warm live studio sound."),
    "jazz_cafe": ("Instrumental only, no vocals. A 2-minute relaxed jazz piano trio for a coffee shop, F major, 92 BPM: acoustic "
                  "piano with a lyrical melody and rich chords, walking upright bass, soft brushes and ride cymbal. Intimate club "
                  "recording."),
    "flamenco": ("Instrumental only, no vocals. A 2-minute chill flamenco piece for a Spanish restaurant, E Phrygian with the "
                 "Andalusian cadence, 100 BPM: flamenco guitar with lyrical melody, soft rasgueados and picado runs, muted hand "
                 "claps and a gentle cajón. Sunny, elegant, never loud."),
    "guitarra_sola": ("Instrumental only, no vocals. A 2-minute calm solo Spanish classical guitar, nylon strings, A minor with "
                      "Andalusian color, 80 BPM, fingerpicked arpeggios and a singing melody, warm close-miked wooden room. No "
                      "other instruments."),
    "rumba": ("Instrumental only, no vocals. A 2-minute cheerful Spanish rumba flamenca for a tapas bar, A minor, 108 BPM: one "
              "nylon guitar strums the rumba pattern, another plays a catchy melody, soft cajón, light hand claps and a round "
              "bass. Happy and relaxed, never harsh."),
    "tango": ("Instrumental only, no vocals. A 2-minute elegant tango lounge piece for a late dinner, D minor, 112 BPM: a "
              "yearning bandoneón melody, marcato piano, double bass, a soft violin countermelody and a light downtempo beat. "
              "Warm, polished, nocturnal."),
}


def pedir(clave, modelo, texto, wav):
    cuerpo = {"model": modelo, "input": texto, "response_format": {"type": "audio"}}
    if wav:
        cuerpo["response_format"]["mime_type"] = "audio/wav"
    req = urllib.request.Request(URL, data=json.dumps(cuerpo).encode(), method="POST", headers={
        "Content-Type": "application/json", "Api-Revision": "2026-05-20", "x-goog-api-key": clave})
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.load(r)
    audios, textos = [], []
    for paso in resp.get("steps", []):
        if paso.get("type") != "model_output":
            continue
        for c in paso.get("content", []):
            if c.get("type") == "audio" and c.get("data"):
                audios.append(base64.b64decode(c["data"]))
            elif c.get("type") == "text":
                textos.append(c.get("text", ""))
    if not audios:
        raise RuntimeError("la respuesta no trajo audio: " + json.dumps(resp)[:600])
    return audios[-1], "\n".join(textos)


def extension(b):
    return ".wav" if b[:4] == b"RIFF" else ".mp3"


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--modelo", default="lyria-3.5", choices=list(PRECIO))
    ap.add_argument("--estilos", default=",".join(ESTILOS))
    ap.add_argument("--tomas", type=int, default=4, help="pedidos por estilo (no hay semilla: cada pedido sale distinto)")
    ap.add_argument("--salida", default="lyria_salidas")
    ap.add_argument("--wav", action="store_true", help="pedir WAV (response_format.mime_type)")
    a = ap.parse_args()
    estilos = [e for e in a.estilos.split(",") if e]
    n = len(estilos) * a.tomas
    costo = n * PRECIO[a.modelo]
    print(f"Plan: {len(estilos)} estilos x {a.tomas} tomas = {n} pedidos a {a.modelo} -> USD {costo:.2f}")
    clave = os.environ.get("GEMINI_API_KEY")
    if not clave:
        print("Sin GEMINI_API_KEY: no se llama a la API (decisión del 17-11-2026: por ahora todo gratis).")
        sys.exit(0)
    out = Path(a.salida); out.mkdir(parents=True, exist_ok=True)
    for est in estilos:
        for i in range(1, a.tomas + 1):
            base = out / f"lyria__{est}__{a.modelo}__t{i}"
            if any(base.with_suffix(x).exists() for x in (".wav", ".mp3")):
                continue
            t0 = time.time()
            try:
                audio, texto = pedir(clave, a.modelo, ESTILOS[est], a.wav)
            except urllib.error.HTTPError as e:
                print(f"{est} t{i}: HTTP {e.code} {e.read()[:300]!r}"); continue
            dest = base.with_suffix(extension(audio)); dest.write_bytes(audio)
            with open(out / "manifiesto.jsonl", "a") as f:
                f.write(json.dumps({"id": base.name, "estilo": est, "modelo": a.modelo, "prompt": ESTILOS[est], "archivo": str(dest),
                                    "texto_modelo": texto, "segundos_api": round(time.time() - t0, 1),
                                    "usd": PRECIO[a.modelo], "fecha": time.strftime("%Y-%m-%d")}, ensure_ascii=False) + "\n")
            print(f"{dest.name} ({round(time.time() - t0)} s)")
    print("Después: puntuar con ronda2_puntuar.py --archivos ... y postproducir con ronda2_post.py como los de Stable Audio 3.")
