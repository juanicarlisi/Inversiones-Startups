"""Exporta la instancia CABA de n paradas a JSON plano para el navegador / JS / WASM. Uso: python3 exportar_web.py 200"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo import Instancia, RAIZ
n = int(sys.argv[1]) if len(sys.argv) > 1 else 200
FF = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0; suf = "" if FF == 1.0 else f"_ff{FF:g}"
d = Instancia(n, fijo_factor=FF).a_dict()
p = os.path.join(RAIZ, "web", "datos", f"caba{n}{suf}.json")
json.dump(d, open(p, "w"), separators=(",", ":"))
print(p, os.path.getsize(p) // 1024, "KB")
