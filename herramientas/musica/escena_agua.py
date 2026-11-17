"""Escena «agua quieta al amanecer» dibujada por código (numpy + Pillow), sin generadores de imágenes.

Produce:
  - un ciclo de T segundos (cuadros PNG o tubería a ffmpeg) que se repite sin costura:
    brillo del sol sobre el agua que titila, ondas muy suaves y la luz que respira;
  - un PNG con el título (capa con transparencia) para superponer con fundido.

Todo se calcula en luz lineal (sRGB -> lineal -> sRGB) para que los degradés sean limpios,
y se agrega grano fino para que el códec no haga escalones (banding).

Uso:
  python escena_agua.py ciclo <ancho> <alto> <fps> <segundos> | ffmpeg -f rawvideo ...
  python escena_agua.py titulo <salida.png> "<Título>" "<subtítulo>"
  python escena_agua.py cuadro <salida.png> <t_segundos>
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy.ndimage import gaussian_filter, map_coordinates

W, H = 1920, 1080
HZ = int(H * 0.585)          # línea del horizonte
SOL_X = int(W * 0.635)
T = 12.0                     # período del ciclo (s)
RNG = np.random.default_rng(1129)


def hex2lin(h):
    c = np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin2srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)


def degradado(stops, n):
    pos = np.array([p for p, _ in stops])
    cols = np.stack([hex2lin(c) for _, c in stops])
    t = np.linspace(0, 1, n)
    return np.stack([np.interp(t, pos, cols[:, k]) for k in range(3)], axis=1).astype(np.float32)


def ruido_suave(h, w, sy, sx, semilla):
    r = np.random.default_rng(semilla).standard_normal((h, w)).astype(np.float32)
    r = gaussian_filter(r, (sy, sx), mode="wrap")
    return (r - r.mean()) / (r.std() + 1e-9)


# ------------------------------------------------------------------ cielo
def cielo():
    frio = degradado([(0, "#0b1230"), (0.33, "#222d57"), (0.6, "#56527a"), (0.8, "#a9808a"),
                      (0.93, "#d9a488"), (1, "#e9c39c")], HZ)
    calido = degradado([(0, "#0e1434"), (0.33, "#2a315c"), (0.6, "#735f82"), (0.8, "#d29486"),
                        (0.93, "#f2b688"), (1, "#f9dcaa")], HZ)
    x = np.arange(W, dtype=np.float32)
    wx = np.exp(-((x - SOL_X) / (W * 0.42)) ** 2)[None, :, None]
    img = frio[:, None, :] * (1 - wx) + calido[:, None, :] * wx
    # nubes finas tipo estrato, iluminadas desde abajo cerca del sol
    n = ruido_suave(HZ, W, 5, 160, 7) + 0.6 * ruido_suave(HZ, W, 2.5, 60, 8)
    y = np.arange(HZ, dtype=np.float32)[:, None] / HZ
    banda = np.exp(-((y - 0.56) / 0.09) ** 2) + 0.7 * np.exp(-((y - 0.74) / 0.05) ** 2)
    a = np.clip((n - 0.55) * 0.55, 0, 1) * banda * 0.55
    col_nube = hex2lin("#e7a98f") * wx[0] + hex2lin("#8b6f86") * (1 - wx[0])
    img = img * (1 - a[..., None]) + col_nube[None] * a[..., None]
    return img.astype(np.float32)


def resplandor(alto):
    """Capa aditiva del sol (se modula en el tiempo: la luz que respira)."""
    yy, xx = np.mgrid[0:alto, 0:W].astype(np.float32)
    d2 = (xx - SOL_X) ** 2 + ((yy - HZ) * 1.25) ** 2
    g = (0.30 * np.exp(-d2 / (2 * 70 ** 2)) + 0.17 * np.exp(-d2 / (2 * 260 ** 2))
         + 0.035 * np.exp(-d2 / (2 * 700 ** 2)))
    disco = np.clip((22 - np.sqrt(d2)) / 2.5, 0, 1) * (yy < HZ - 3)   # el sol asoma: la mitad bajo el horizonte
    return (g[..., None] * hex2lin("#ffd29a") + disco[..., None] * hex2lin("#fff0d2") * 0.95).astype(np.float32)


# ------------------------------------------------------------------ colinas
def perfil(semilla, base, amp, escala):
    x = np.arange(W, dtype=np.float32)
    r = gaussian_filter(np.random.default_rng(semilla).standard_normal(W), escala, mode="nearest")
    r = r / np.abs(r).max()
    return base + amp * r


def colinas(img):
    x = np.arange(W, dtype=np.float32)
    # lejana: loma amplia a la izquierda que baja hacia el sol, y una línea baja a la derecha
    lejos = HZ - (5 + 46 * np.exp(-((x - W * 0.13) / (W * 0.15)) ** 2) + 30 * np.exp(-((x - W * 0.30) / (W * 0.09)) ** 2)
                  + 12 * np.exp(-((x - W * 0.42) / (W * 0.06)) ** 2) + 16 * np.exp(-((x - W * 0.93) / (W * 0.10)) ** 2)
                  + perfil(3, 0, 7, 22) + perfil(5, 0, 1.6, 2.5) * (x < W * 0.55))   # textura de monte arriba de la loma
    cerca = HZ - (2 + 30 * np.exp(-((x - W * 0.05) / (W * 0.13)) ** 2) + perfil(4, 0, 3, 18))
    yy = np.arange(HZ, dtype=np.float32)[:, None]
    for borde, color, mezcla in ((lejos, "#7d6683", 0.80), (cerca, "#3d3246", 0.92)):
        m = np.clip(yy - borde[None, :] + 0.5, 0, 1)  # borde con antialias
        # bruma: la colina se funde con el cielo cerca del horizonte
        bruma = np.clip((HZ - yy) / 60, 0, 1) * 0.25 + 0.75
        c = hex2lin(color)
        img[:HZ] = img[:HZ] * (1 - m[..., None] * mezcla) + (c[None, None] * bruma[..., None]) * m[..., None] * mezcla
    return img


# ------------------------------------------------------------------ agua
def preparar_agua(cielo_rgb):
    alto = H - HZ
    y = np.arange(alto, dtype=np.float32)
    d = y / alto                                   # 0 en el horizonte, 1 abajo
    prof = 26.0 / (y + 5.0)                        # profundidad en perspectiva
    fres = (0.88 - 0.38 * d ** 0.8)[:, None, None]  # Fresnel aproximado
    tinte = hex2lin("#202a45")[None, None]
    return dict(alto=alto, d=d, prof=prof, fres=fres, tinte=tinte)


def capas_destello(n_capas=6, n=2600):
    """Destellos del sol sobre el agua repartidos en capas que titilan con fases distintas."""
    alto = H - HZ
    capas = np.zeros((n_capas, alto, W), np.float32)
    u = RNG.random(n)
    y = (alto * (u ** 1.9)).astype(int)            # más densos cerca del horizonte
    d = y / alto
    sig = 10 + 190 * d ** 1.05
    x = SOL_X + RNG.standard_normal(n) * sig
    largo = (3 + 46 * d * RNG.random(n) + 4 * RNG.random(n)).astype(int)
    brillo = np.exp(-((x - SOL_X) / (sig * 1.15)) ** 2) * (1.15 - 0.6 * d) * (0.35 + 0.65 * RNG.random(n))
    capa = RNG.integers(0, n_capas, n)
    for i in range(n):
        x0, x1 = int(x[i] - largo[i] / 2), int(x[i] + largo[i] / 2)
        if 0 <= y[i] < alto and x1 > 0 and x0 < W:
            xs = np.arange(max(0, x0), min(W, x1))
            perf = np.sin(np.pi * (xs - x0) / max(1, x1 - x0)) ** 1.5
            capas[capa[i], y[i], xs] += brillo[i] * perf
    capas = gaussian_filter(capas, (0, 0.6, 1.2))
    return capas


# ------------------------------------------------------------------ cuadro
class Escena:
    def __init__(self):
        c = colinas(cielo())
        self.cielo = c
        self.resp = resplandor(H)
        self.agua = preparar_agua(c)
        self.destellos = capas_destello()
        self.fases = RNG.random(len(self.destellos)) * 2 * np.pi
        self.frec = RNG.integers(1, 4, len(self.destellos))
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        self.vineta = (1 - 0.16 * np.clip(r - 0.45, 0, 1) ** 1.6)[..., None].astype(np.float32)
        self.xx = xx[HZ:]
        self.yy = yy[HZ:]

    def cuadro(self, t, grano=True):
        w = 2 * np.pi * t / T
        respira = 1.0 + 0.045 * np.sin(w) + 0.015 * np.sin(2 * w + 1.3)
        img = np.empty((H, W, 3), np.float32)
        sky = self.cielo + self.resp[:HZ] * respira
        img[:HZ] = sky
        # reflejo: fila espejada del cielo con desplazamiento de ondas (periódico en T)
        A = self.agua
        y = np.arange(A["alto"], dtype=np.float32)
        p = A["prof"][:, None]
        dx = (0.8 + 9.0 * A["d"][:, None] ** 1.4) * (
            0.6 * np.sin(2 * np.pi * (3.1 * p) + w + self.xx * 0.0031)
            + 0.4 * np.sin(2 * np.pi * (5.3 * p) - 2 * w + self.xx * 0.0057 + 0.7))
        dy = (0.3 + 3.0 * A["d"][:, None]) * np.sin(2 * np.pi * (4.2 * p) + w + self.xx * 0.0023)
        src_y = np.clip(HZ - 1 - (y[:, None] * 0.92 + dy), 0, HZ - 1)
        src_x = np.clip(self.xx + dx, 0, W - 1)
        refl = np.stack([map_coordinates(sky[..., k], [src_y, src_x], order=1, mode="nearest") for k in range(3)], -1)
        agua = refl * A["fres"] * 0.86 + A["tinte"] * (1 - A["fres"]) * 0.5
        # bandas de onda muy suaves que brillan y se apagan
        bandas = 1 + 0.05 * np.sin(2 * np.pi * (6.0 * p) + 3 * w + self.xx * 0.0015) * (0.3 + A["d"][:, None])
        agua *= bandas[..., None]
        # destellos del sol (cada capa con su fase y frecuencia entera: el ciclo cierra)
        dest = np.zeros(agua.shape[:2], np.float32)
        for k in range(len(self.destellos)):
            dest += self.destellos[k] * (0.5 + 0.5 * np.sin(self.frec[k] * w + self.fases[k])) ** 2
        agua += dest[..., None] * hex2lin("#ffe2a6") * 1.25 * respira
        # bruma cálida sobre el horizonte
        bruma = np.exp(-((y - 4) / 26) ** 2)[:, None, None] * hex2lin("#f0c49a") * 0.22 * respira
        img[HZ:] = agua + bruma
        img[HZ - 30:HZ] += (np.exp(-((np.arange(30)[::-1]) / 14) ** 2)[:, None, None] * hex2lin("#f0c49a") * 0.12 * respira)
        img *= self.vineta
        out = lin2srgb(img) * 255
        if grano:
            out += np.random.default_rng(int(t * 1000)).normal(0, 1.1, out.shape)
        return np.clip(out + 0.5, 0, 255).astype(np.uint8)


def titulo(ruta, texto, sub):
    esc = 2
    im = Image.new("RGBA", (W * esc, H * esc), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype("/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Regular.otf", 62 * esc)
    f2 = ImageFont.truetype("/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Italic.otf", 27 * esc)
    x, y = 128 * esc, 858 * esc
    # espaciado de letras a mano (tracking) para el título
    cx = x
    for ch in texto:
        d.text((cx, y), ch, font=f1, fill=(248, 236, 218, 232))
        cx += d.textlength(ch, font=f1) + 3.2 * esc
    d.line([(x + 2 * esc, y + 92 * esc), (x + 56 * esc, y + 92 * esc)], fill=(248, 220, 180, 170), width=2 * esc)
    d.text((x, y + 104 * esc), sub, font=f2, fill=(240, 226, 206, 190))
    sombra = im.split()[3].filter(ImageFilter.GaussianBlur(9 * esc)).point(lambda v: int(v * 0.35))
    fondo = Image.new("RGBA", im.size, (10, 10, 25, 0))
    fondo.putalpha(sombra)
    im = Image.alpha_composite(fondo, im).resize((W, H), Image.LANCZOS)
    im.save(ruta)


if __name__ == "__main__":
    modo = sys.argv[1]
    if modo == "titulo":
        titulo(sys.argv[2], sys.argv[3], sys.argv[4])
    elif modo == "cuadro":
        e = Escena()
        Image.fromarray(e.cuadro(float(sys.argv[3]))).save(sys.argv[2])
    elif modo == "ciclo":
        fps, seg = int(sys.argv[4]), float(sys.argv[5])
        e = Escena()
        for i in range(int(round(fps * seg))):
            sys.stdout.buffer.write(e.cuadro(i / fps).tobytes())
