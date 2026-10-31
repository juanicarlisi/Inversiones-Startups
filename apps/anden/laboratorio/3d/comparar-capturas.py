"""Compara dos capturas: % de píxeles que cambian más de un umbral y diferencia media (0-255).
Uso: python3 comparar-capturas.py a.png b.png [umbral=12]. Sirve para (a) verificar que algo se mueve y (b) que la vía GPU y la vía CPU dan la misma imagen."""
import sys
from PIL import Image
import numpy as np
a, b = (np.asarray(Image.open(p).convert('RGB')).astype(int) for p in sys.argv[1:3]); th = int(sys.argv[3]) if len(sys.argv) > 3 else 12
d = np.abs(a - b).max(axis=2); print({'pixeles_cambiados_%': round(float((d > th).mean()) * 100, 3), 'diferencia_media': round(float(d.mean()), 3)})
