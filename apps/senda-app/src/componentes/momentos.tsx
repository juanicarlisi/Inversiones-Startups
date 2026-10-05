// Momentos: barra superior (vidas, racha, Talentos), explosión de chispas y celebraciones con Lani.
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

import { Lani, type PoseLani } from "../arte/Arte";
import { useUsuario } from "../estado/usuario";
import { color } from "../tema";
import { mmss } from "../util/fechas";
import { haptica } from "../util/haptica";
import { Chip, T } from "./base";

export function BarraSuperior({ izquierda }: { izquierda?: React.ReactNode }) {
  const racha = useUsuario((s) => s.racha);
  const talentos = useUsuario((s) => s.talentos);
  const vidasAhora = useUsuario((s) => s.vidasAhora);
  useUsuario((s) => s.vidas); // re-render cuando cambian
  const [, tic] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tic((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  const { vidas } = vidasAhora();
  return (
    <View style={styles.barra}>
      <View style={{ flex: 1 }}>{izquierda}</View>
      <Chip icono="vida" valor={vidas} c={color.rojo} />
      <Chip icono="racha" valor={racha} c={color.ambar} />
      <Chip icono="talento" valor={talentos} c={color.oro} />
    </View>
  );
}

export function CuentaVidas() {
  const vidasAhora = useUsuario((s) => s.vidasAhora);
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const { proxima } = vidasAhora(ahora);
  return <T v="uiExtra" t={15} c={color.rojoClaro}>{proxima ? mmss(proxima - ahora) : "ya"}</T>;
}

/** Chispas que salen del centro y se apagan (aciertos, premios). */
export function Chispas({ disparo, colores = [color.oro, color.blanco, color.ambar], n = 14, radio = 90 }: { disparo: number; colores?: string[]; n?: number; radio?: number }) {
  const progreso = useRef(new Animated.Value(0)).current;
  const [semillas, setSemillas] = useState<{ ang: number; dist: number; tam: number; c: string }[]>([]);
  useEffect(() => {
    if (!disparo) return;
    setSemillas(Array.from({ length: n }, (_, i) => ({ ang: (i / n) * Math.PI * 2 + Math.random() * 0.4, dist: radio * (0.6 + Math.random() * 0.5), tam: 5 + Math.random() * 6, c: colores[i % colores.length] })));
    progreso.setValue(0);
    Animated.timing(progreso, { toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [disparo]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!disparo) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: "absolute", left: "50%", top: "50%" }}>
        {semillas.map((s, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: s.tam,
              height: s.tam,
              borderRadius: s.tam,
              backgroundColor: s.c,
              opacity: progreso.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateX: progreso.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(s.ang) * s.dist] }) },
                { translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(s.ang) * s.dist] }) },
                { scale: progreso.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.2, 1.2, 0.6] }) },
              ],
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ── Celebraciones globales (misión cumplida, lección terminada) ──
type Celebracion = { titulo: string; detalle?: string; talentos?: number; pose?: PoseLani } | null;
export const useCelebracion = create<{ actual: Celebracion; mostrar: (c: NonNullable<Celebracion>) => void; cerrar: () => void }>((set) => ({
  actual: null,
  mostrar: (actual) => set({ actual }),
  cerrar: () => set({ actual: null }),
}));

/** Cartel que baja desde arriba con Lani festejando y los Talentos contándose de a uno. */
export function CapaCelebracion() {
  const { actual, cerrar } = useCelebracion();
  const ins = useSafeAreaInsets();
  const y = useRef(new Animated.Value(-200)).current;
  const [cuenta, setCuenta] = useState(0);
  const [disparo, setDisparo] = useState(0);
  useEffect(() => {
    if (!actual) return;
    haptica.premio();
    setDisparo((d) => d + 1);
    setCuenta(0);
    Animated.spring(y, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 10 }).start();
    const total = actual.talentos ?? 0;
    let n = 0;
    const paso = setInterval(() => {
      n = Math.min(total, n + Math.max(1, Math.round(total / 12)));
      setCuenta(n);
      if (n >= total) clearInterval(paso);
    }, 45);
    const fin = setTimeout(() => Animated.timing(y, { toValue: -220, duration: 260, useNativeDriver: true }).start(() => cerrar()), 2600);
    return () => {
      clearInterval(paso);
      clearTimeout(fin);
    };
  }, [actual]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!actual) return null;
  return (
    <Animated.View style={[styles.cel, { top: ins.top + 8, transform: [{ translateY: y }] }]}>
      <Pressable onPress={cerrar} style={styles.celCaja}>
        <View style={{ width: 64, height: 64, alignItems: "center", justifyContent: "flex-end" }}>
          <Chispas disparo={disparo} radio={60} />
          <Lani pose={actual.pose ?? "festejo"} tam={58} vivo={false} />
        </View>
        <View style={{ flex: 1 }}>
          <T v="titulo" t={15} c={color.oro}>
            {actual.titulo}
          </T>
          {actual.detalle ? <T t={13} c={color.texto2}>{actual.detalle}</T> : null}
        </View>
        {actual.talentos ? (
          <T v="titulo" t={18} c={color.oro}>
            +{cuenta}
          </T>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  barra: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, marginBottom: 6 },
  cel: { position: "absolute", left: 12, right: 12, zIndex: 50 },
  celCaja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#241A5C",
    borderWidth: 1.5,
    borderColor: "rgba(255,200,87,0.55)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
});
