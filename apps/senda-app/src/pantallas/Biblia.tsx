// Biblia: elegir versión, libro y capítulo. Lectura gratis y sin anuncios, siempre.
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Icono } from "../arte/Arte";
import { Fondo, Kicker, T, Vidrio } from "../componentes/base";
import { BarraSuperior } from "../componentes/momentos";
import { ABREV, cargarBiblia, NOMBRES, NUEVO_TESTAMENTO_DESDE, referencia, VERSIONES, type Biblia as TBiblia } from "../datos/biblia";
import { useUsuario } from "../estado/usuario";
import type { PropsTab } from "../navegacion";
import { color } from "../tema";
import { haptica } from "../util/haptica";

export default function Biblia({ navigation }: PropsTab<"Biblia">) {
  const version = useUsuario((s) => s.version);
  const setVersion = useUsuario((s) => s.setVersion);
  const ultimaLectura = useUsuario((s) => s.ultimaLectura);
  const leidos = useUsuario((s) => s.leidos);
  const [biblia, setBiblia] = useState<TBiblia | null>(null);
  const [testamento, setTestamento] = useState<"AT" | "NT">("NT");
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    setBiblia(null);
    cargarBiblia(version).then((b) => vivo && setBiblia(b));
    return () => {
      vivo = false;
    };
  }, [version]);

  const libros = biblia?.libros ?? [];
  const corte = libros.findIndex((l) => l.id === NUEVO_TESTAMENTO_DESDE);
  const lista = testamento === "AT" ? libros.slice(0, corte) : libros.slice(corte);

  return (
    <Fondo>
      <BarraSuperior izquierda={<T v="titulo" t={22}>Biblia</T>} />
      <ScrollView contentContainerStyle={styles.cont} showsVerticalScrollIndicator={false}>
        <View style={styles.versiones}>
          {VERSIONES.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => {
                haptica.toque();
                setVersion(v.id);
              }}
              style={[styles.version, v.id === version && styles.versionOn]}
            >
              <T v="uiExtra" t={13} c={v.id === version ? color.tintaAmbar : color.blanco}>
                {v.abrev}
              </T>
            </Pressable>
          ))}
        </View>
        <T t={12.5} c={color.texto3} style={{ marginTop: -4 }}>
          {VERSIONES.find((v) => v.id === version)?.nota}. La Reina-Valera 1960 se suma cuando tengamos su licencia.
        </T>

        {ultimaLectura ? (
          <Pressable onPress={() => navigation.navigate("Lector", ultimaLectura)}>
            <Vidrio style={styles.seguir}>
              <Icono nombre="biblia" tam={22} color={color.verde} />
              <View style={{ flex: 1 }}>
                <Kicker c="#86E5B8">Seguir leyendo</Kicker>
                <T v="uiExtra" t={15}>{referencia(ultimaLectura.libro, ultimaLectura.cap)}</T>
              </View>
              <Icono nombre="flecha" tam={20} color={color.texto2} />
            </Vidrio>
          </Pressable>
        ) : null}

        <View style={styles.segmento}>
          {(["AT", "NT"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTestamento(t)} style={[styles.seg, testamento === t && styles.segOn]}>
              <T v="uiExtra" t={13} c={testamento === t ? color.noche : color.texto2}>
                {t === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}
              </T>
            </Pressable>
          ))}
        </View>

        {!biblia ? <T c={color.texto2}>Abriendo la Biblia…</T> : null}
        {lista.map((l) => {
          const leidosLibro = l.caps.filter((_, i) => leidos[`${l.id}.${i + 1}`]).length;
          const open = abierto === l.id;
          return (
            <View key={l.id} style={styles.libro}>
              <Pressable
                style={styles.libroCab}
                onPress={() => {
                  haptica.toque();
                  setAbierto(open ? null : l.id);
                }}
              >
                <View style={styles.abrev}>
                  <T v="uiExtra" t={12} c={color.oro}>{ABREV[l.id]}</T>
                </View>
                <T v="uiBold" t={15.5} style={{ flex: 1 }}>{NOMBRES[l.id] ?? l.nombre}</T>
                <T v="uiSemi" t={12} c={color.texto3}>{leidosLibro ? `${leidosLibro}/${l.caps.length}` : `${l.caps.length} cap.`}</T>
              </Pressable>
              {open ? (
                <View style={styles.grilla}>
                  {l.caps.map((_, i) => {
                    const leido = !!leidos[`${l.id}.${i + 1}`];
                    return (
                      <Pressable key={i} accessibilityLabel={`${NOMBRES[l.id] ?? l.nombre} ${i + 1}`} onPress={() => navigation.navigate("Lector", { libro: l.id, cap: i + 1 })} style={[styles.cap, leido && styles.capLeido]}>
                        <T v="uiExtra" t={14} c={leido ? color.tintaAmbar : color.blanco}>{i + 1}</T>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
        {biblia ? <T t={11.5} c={color.texto3} style={{ marginTop: 8 }}>{biblia.atribucion}</T> : null}
      </ScrollView>
    </Fondo>
  );
}

const styles = StyleSheet.create({
  cont: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  versiones: { flexDirection: "row", gap: 8 },
  version: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: color.borde },
  versionOn: { backgroundColor: color.ambar, borderColor: color.ambar },
  seguir: { flexDirection: "row", alignItems: "center", gap: 12 },
  segmento: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 99, padding: 4, marginTop: 4 },
  seg: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 99 },
  segOn: { backgroundColor: color.crema },
  libro: { borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  libroCab: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 12 },
  abrev: { width: 40, height: 30, borderRadius: 9, backgroundColor: "rgba(245,165,36,0.14)", alignItems: "center", justifyContent: "center" },
  grilla: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  cap: { width: 46, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  capLeido: { backgroundColor: color.oro },
});
