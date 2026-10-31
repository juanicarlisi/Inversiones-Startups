"""Streamlit: tablero INTERNO de análisis del oráculo (no es producto). Lee resultados/estadistico-*.json."""
import glob, json, os
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Andén · oráculo SimPy", layout="wide")
st.title("Andén · oráculo SimPy contra el motor")
aqui = os.path.dirname(os.path.abspath(__file__))
archivos = sorted(glob.glob(os.path.join(aqui, "..", "resultados", "estadistico-*.json")))
if not archivos:
    st.warning("Sin resultados: correr oraculo/estadistico.py")
    st.stop()
nombre = st.selectbox("Escenario y modo", [os.path.basename(a)[len("estadistico-"):-5] for a in archivos])
d = json.load(open(os.path.join(aqui, "..", "resultados", f"estadistico-{nombre}.json")))
lado = st.radio("Comparar contra", ["motorF2", "motorF3"], horizontal=True)
df = pd.DataFrame(d[lado]).T.reset_index(names="KPI")
df["ok"] = df["ok"].map({True: "sí", False: "NO"})
c1, c2 = st.columns([2, 1])
c1.dataframe(df[["KPI", "simpy", "motor", "relPct", "z", "ok"]], use_container_width=True, hide_index=True)
c2.metric("KPI dentro del criterio", f"{(df['ok'] == 'sí').sum()} de {len(df)}")
st.bar_chart(df.set_index("KPI")["z"])
