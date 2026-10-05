// Barra inferior flotante con íconos propios; la pestaña activa se enciende en ámbar y salta un poco al tocarla.
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icono, type NombreIcono } from "../arte/Arte";
import { color } from "../tema";
import { haptica } from "../util/haptica";
import { T } from "./base";

const ICONOS: Record<string, { icono: NombreIcono; etiqueta: string }> = {
  Inicio: { icono: "inicio", etiqueta: "Inicio" },
  Biblia: { icono: "biblia", etiqueta: "Biblia" },
  Travesia: { icono: "travesia", etiqueta: "Travesía" },
  Jugar: { icono: "jugar", etiqueta: "Jugar" },
  Comunidad: { icono: "comunidad", etiqueta: "Comunidad" },
};

function Pestana({ activa, icono, etiqueta, onPress }: { activa: boolean; icono: NombreIcono; etiqueta: string; onPress: () => void }) {
  const salto = useRef(new Animated.Value(activa ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(salto, { toValue: activa ? 1 : 0, useNativeDriver: true, speed: 18, bounciness: 14 }).start();
  }, [activa, salto]);
  return (
    <Pressable
      onPress={() => {
        haptica.toque();
        onPress();
      }}
      style={styles.pestana}
      accessibilityRole="tab"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={etiqueta}
    >
      <Animated.View style={{ transform: [{ translateY: salto.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }, { scale: salto.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }}>
        <Icono nombre={icono} tam={22} color={activa ? color.ambar : "rgba(255,255,255,0.45)"} />
      </Animated.View>
      <T v={activa ? "uiExtra" : "uiSemi"} t={10.5} c={activa ? color.blanco : "rgba(255,255,255,0.45)"}>
        {etiqueta}
      </T>
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const ins = useSafeAreaInsets();
  return (
    <View style={[styles.envoltura, { paddingBottom: Math.max(ins.bottom, 10) }]} pointerEvents="box-none">
      <View style={styles.barra}>
        {state.routes.map((ruta, i) => {
          const info = ICONOS[ruta.name];
          return (
            <Pestana
              key={ruta.key}
              activa={state.index === i}
              icono={info.icono}
              etiqueta={info.etiqueta}
              onPress={() => {
                const ev = navigation.emit({ type: "tabPress", target: ruta.key, canPreventDefault: true });
                if (state.index !== i && !ev.defaultPrevented) navigation.navigate(ruta.name);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  envoltura: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  barra: {
    flexDirection: "row",
    height: 66,
    borderRadius: 24,
    backgroundColor: "#140D38",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
    elevation: 16,
  },
  pestana: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, height: "100%" },
});
