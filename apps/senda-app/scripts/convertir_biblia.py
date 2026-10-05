#!/usr/bin/env python3
"""Convierte una Biblia en formato USFX (open-bibles / eBible) al formato compacto de Senda.

Uso: python3 scripts/convertir_biblia.py entrada.usfx.xml salida.bib ID "Nombre" "ABREV" "Licencia" "Atribución"

Formato de salida (JSON con extensión .bib para que Metro lo trate como recurso y no como módulo):
{"id", "nombre", "abrev", "licencia", "atribucion", "libros": [{"id": "GEN", "nombre": "Génesis", "caps": [["v1", "v2", ...], ...]}]}
Se quitan los números de Strong, las notas al pie y las referencias cruzadas; queda solo el texto de cada versículo.
"""
import json
import re
import sys
import xml.etree.ElementTree as ET

NOTAS = {"f", "x", "fe", "rem", "toc", "id", "h", "ref"}
SALTAR_TEXTO = {"f", "x", "fe", "rem", "toc", "id", "h", "s", "d", "sp", "ide", "ms", "mt", "ref"}


def main():
    entrada, salida, vid, nombre, abrev, licencia, atrib = sys.argv[1:8]
    raiz = ET.parse(entrada).getroot()
    libros = []
    estado = {"libro": None, "cap": None, "vers": None, "buf": []}

    def cerrar_versiculo():
        if estado["vers"] is not None and estado["libro"] is not None:
            texto = re.sub(r"\s+", " ", "".join(estado["buf"])).strip()
            caps = estado["libro"]["caps"]
            while len(caps) < estado["cap"]:
                caps.append([])
            cap = caps[estado["cap"] - 1]
            n = estado["vers"]
            while len(cap) < n:
                cap.append("")
            cap[n - 1] = (cap[n - 1] + " " + texto).strip() if cap[n - 1] else texto
        estado["vers"] = None
        estado["buf"] = []

    def recorrer(el):
        tag = el.tag
        if tag == "book":
            cerrar_versiculo()
            h = el.find("h")
            nom = (h.text or "").strip() if h is not None else el.get("id")
            estado["libro"] = {"id": el.get("id"), "nombre": nom, "caps": []}
            libros.append(estado["libro"])
        elif tag == "c":
            cerrar_versiculo()
            estado["cap"] = int(re.sub(r"\D", "", el.get("id")) or 0)
        elif tag == "v":
            cerrar_versiculo()
            estado["vers"] = int(re.sub(r"\D.*", "", el.get("id")) or 0)
        elif tag == "ve":
            cerrar_versiculo()
        dentro = estado["vers"] is not None and tag not in SALTAR_TEXTO
        if dentro and el.text and tag not in ("v", "c", "ve", "book"):
            estado["buf"].append(el.text)
        if tag not in SALTAR_TEXTO:
            for hijo in el:
                recorrer(hijo)
        if tag == "book":
            cerrar_versiculo()
        if estado["vers"] is not None and el.tail:
            estado["buf"].append(el.tail)

    recorrer(raiz)
    libros = [b for b in libros if b["caps"]]
    for b in libros:  # versículos vacíos (omitidos en esa versión) quedan como ""
        b["caps"] = [[v for v in cap] for cap in b["caps"]]
    datos = {"id": vid, "nombre": nombre, "abrev": abrev, "licencia": licencia, "atribucion": atrib, "libros": libros}
    with open(salida, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
    nv = sum(len(c) for b in libros for c in b["caps"])
    print(f"{vid}: {len(libros)} libros, {nv} versículos")


if __name__ == "__main__":
    main()
