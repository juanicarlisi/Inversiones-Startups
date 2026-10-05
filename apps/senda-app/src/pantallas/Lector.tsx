// Lector: el «Santuario» (clima calmo, fondo crema, Literata). Tocar un versículo lo resalta; al final, «Terminé».
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icono } from "../arte/Arte";
import { Boton, T } from "../componentes/base";
import { useCelebracion } from "../componentes/momentos";
import { cargarBiblia, limpiarVersiculo, NOMBRES, referencia, VERSIONES, type Biblia } from "../datos/biblia";
import { useUsuario } from "../estado/usuario";
import type { PropsRaiz } from "../navegacion";
import { color, reglas } from "../tema";
import { haptica } from "../util/haptica";

export default function Lector({ navigation, route }: PropsRaiz<"Lector">) {
  const { libro, cap, vers } = route.params;
  const ins = useSafeAreaInsets();
  const version = useUsuario((s) => s.version);
  const tam = useUsuario((s) => s.tamLetra);
  const setTam = useUsuario((s) => s.setTamLetra);
  const resaltados = useUsuario((s) => s.resaltados);
  const alternar = useUsuario((s) => s.alternarResaltado);
  const leerCapitulo = useUsuario((s) => s.leerCapitulo);
  const leidos = useUsuario((s) => s.leidos);
  const marcarPalabraHoy = useUsuario((s) => s.marcarPalabraHoy);
  const completarMision = useUsuario((s) => s.completarMision);
  const ganar = useUsuario((s) => s.ganar);
  const mostrar = useCelebracion((s) => s.mostrar);
  const [biblia, setBiblia] = useState<Biblia | null>(null);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    cargarBiblia(version).then(setBiblia);
  }, [version]);

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [libro, cap]);

  const idx = biblia?.libros.findIndex((l) => l.id === libro) ?? -1;
  const datosLibro = idx >= 0 ? biblia!.libros[idx] : null;
  const versiculos = useMemo(() => (datosLibro?.caps[cap - 1] ?? []).map((t, i) => limpiarVersiculo(t, libro, cap, i + 1)), [datosLibro, libro, cap]);
  const yaLeido = !!leidos[`${libro}.${cap}`];

  const anterior = () => {
    if (!biblia || !datosLibro) return;
    if (cap > 1) navigation.setParams({ libro, cap: cap - 1, vers: undefined });
    else if (idx > 0) navigation.setParams({ libro: biblia.libros[idx - 1].id, cap: biblia.libros[idx - 1].caps.length, vers: undefined });
  };
  const siguiente = () => {
    if (!biblia || !datosLibro) return;
    if (cap < datosLibro.caps.length) navigation.setParams({ libro, cap: cap + 1, vers: undefined });
    else if (idx < biblia.libros.length - 1) navigation.setParams({ libro: biblia.libros[idx + 1].id, cap: 1, vers: undefined });
  };

  const terminar = () => {
    haptica.acierto();
    const nuevo = !yaLeido;
    leerCapitulo(libro, cap);
    marcarPalabraHoy();
    if (nuevo) ganar(0, 10);
    if (completarMision("leer")) mostrar({ titulo: "¡Misión cumplida!", detalle: `Leíste ${referencia(libro, cap)}`, talentos: reglas.talentosPorMision, pose: "festejo" });
    else if (nuevo) mostrar({ titulo: "¡Un rayito más!", detalle: "Tu racha sigue encendida", pose: "saludo" });
    siguiente();
  };

  const abrev = VERSIONES.find((v) => v.id === version)?.abrev;

  return (
    <View style={{ flex: 1, backgroundColor: color.crema, paddingTop: ins.top }}>
      <View style={styles.cab}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Volver">
          <View style={{ transform: [{ rotate: "180deg" }] }}>
            <Icono nombre="flecha" tam={24} color={color.tinta} />
          </View>
        </Pressable>
        <T v="titulo" t={18} c={color.tinta} style={{ flex: 1 }}>{`${NOMBRES[libro] ?? libro} ${cap}`}</T>
        <View style={styles.chipVer}>
          <T v="uiExtra" t={11.5} c={color.indigoM}>{abrev}</T>
        </View>
        <Pressable onPress={() => setTam(tam - 1)} hitSlop={8} accessibilityLabel="Letra más chica">
          <T v="bibliaSemi" t={15} c={color.tintaSuave}>A</T>
        </Pressable>
        <Pressable onPress={() => setTam(tam + 1)} hitSlop={8} accessibilityLabel="Letra más grande">
          <T v="bibliaSemi" t={22} c={color.tinta}>A</T>
        </Pressable>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: ins.bottom + 40 }}>
        {!biblia ? <T c={color.tintaSuave}>Abriendo…</T> : null}
        <T v="biblia" t={tam} c={color.tinta} style={{ lineHeight: tam * 1.62 }}>
          {versiculos.map((t, i) => {
            const clave = `${libro}.${cap}.${i + 1}`;
            const on = !!resaltados[clave] || vers === i + 1;
            return (
              <T
                key={clave}
                v="biblia"
                t={tam}
                c={color.tinta}
                onPress={() => {
                  haptica.toque();
                  alternar(clave);
                }}
                onLongPress={() => Share.share({ message: `«${t}» — ${referencia(libro, cap, i + 1)} (${abrev})` })}
                style={on ? { backgroundColor: "rgba(245,165,36,0.32)" } : undefined}
              >
                <T v="uiExtra" t={tam * 0.55} c="#B07A2A">{` ${i + 1} `}</T>
                {t}{" "}
              </T>
            );
          })}
        </T>
        {biblia ? (
          <View style={{ marginTop: 28, gap: 14 }}>
            <Boton texto={yaLeido ? "SIGUIENTE CAPÍTULO" : "TERMINÉ EL CAPÍTULO"} tono={yaLeido ? "vidrio" : "verde"} onPress={yaLeido ? siguiente : terminar} style={yaLeido ? { opacity: 0.9 } : undefined} />
            <View style={styles.navCaps}>
              <Pressable onPress={anterior} hitSlop={10}>
                <T v="uiBold" t={14} c={color.indigoM}>‹ Anterior</T>
              </Pressable>
              <T t={12} c={color.tintaSuave}>Toca un versículo para resaltarlo · mantén para compartir</T>
              <Pressable onPress={siguiente} hitSlop={10}>
                <T v="uiBold" t={14} c={color.indigoM}>Siguiente ›</T>
              </Pressable>
            </View>
            <T t={11} c={color.tintaSuave}>{biblia.atribucion}</T>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cab: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.cremaBorde },
  chipVer: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: "#ECE8FF" },
  navCaps: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
});
