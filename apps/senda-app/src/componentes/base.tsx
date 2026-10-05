// Piezas base de la interfaz: texto, fondo, tarjetas de vidrio, botones con volumen, barras y chips.
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, type TextProps, type TextStyle, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icono, SvgXml, type NombreIcono } from "../arte/Arte";
import { color, fuente, radio } from "../tema";
import { haptica } from "../util/haptica";

const HALO = `<svg viewBox="0 0 400 300" preserveAspectRatio="none"><defs><radialGradient id="h" cx=".5" cy="0" r=".75"><stop offset="0" stop-color="#8C74FF" stop-opacity=".45"/><stop offset=".55" stop-color="#6E56F7" stop-opacity=".12"/><stop offset="1" stop-color="#6E56F7" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#h)"/></svg>`;

type Variante = "titulo" | "tituloNegra" | "tituloMedio" | "ui" | "uiSemi" | "uiBold" | "uiExtra" | "biblia" | "bibliaSemi" | "bibliaItalica";

export function T({ v = "ui", t = 15, c = color.blanco, style, children, ...rest }: TextProps & { v?: Variante; t?: number; c?: string; style?: TextStyle | TextStyle[] }) {
  // Plus Jakarta Sans tiene el espacio angosto: un poco de espaciado entre palabras mejora la lectura en tamaños chicos.
  const extra: TextStyle = v.startsWith("ui") ? { letterSpacing: 0.1 } : {};
  return (
    <Text {...rest} style={[{ fontFamily: fuente[v], fontSize: t, color: c, lineHeight: t * (v.startsWith("titulo") ? 1.18 : 1.35) }, extra, style]}>
      {children}
    </Text>
  );
}

export function Kicker({ children, c = color.oro }: { children: ReactNode; c?: string }) {
  return (
    <T v="uiExtra" t={10.5} c={c} style={{ letterSpacing: 1.4, textTransform: "uppercase" }}>
      {children}
    </T>
  );
}

/** Fondo de la Arena: degradé índigo con un halo de luz arriba. */
export function Fondo({ children, colores, conTab = true }: { children: ReactNode; colores?: readonly [string, string, ...string[]]; conTab?: boolean }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.noche }}>
      <LinearGradient colors={colores ?? [color.indigoClaro, color.indigo, color.noche]} locations={colores ? undefined : [0, 0.38, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.halo} pointerEvents="none">
        <SvgXml xml={HALO} width="100%" height="100%" />
      </View>
      <View style={{ flex: 1, paddingTop: ins.top + 6, paddingBottom: conTab ? 0 : ins.bottom }}>{children}</View>
    </View>
  );
}

export function Vidrio({ children, style, borde }: { children: ReactNode; style?: ViewStyle | ViewStyle[]; borde?: string }) {
  return <View style={[styles.vidrio, borde ? { borderColor: borde } : null, style]}>{children}</View>;
}

type PropsBoton = {
  texto?: string;
  onPress?: () => void;
  tono?: "ambar" | "verde" | "vidrio" | "rojo";
  icono?: NombreIcono;
  chico?: boolean;
  redondo?: number;
  deshabilitado?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
  etiqueta?: string;
};

const TONOS = {
  ambar: { arriba: color.oro, abajo: color.ambar, sombra: color.ambarSombra, texto: color.tintaAmbar },
  verde: { arriba: color.verdeClaro, abajo: color.verde, sombra: color.verdeSombra, texto: color.blanco },
  rojo: { arriba: "#FF6B70", abajo: color.rojo, sombra: "#9E2A2E", texto: color.blanco },
  vidrio: { arriba: "rgba(255,255,255,0.16)", abajo: "rgba(255,255,255,0.08)", sombra: "rgba(0,0,0,0.35)", texto: color.blanco },
} as const;

/** Botón con volumen: se hunde al tocarlo (como un botón físico), con vibración corta. */
export function Boton({ texto, onPress, tono = "ambar", icono, chico, redondo, deshabilitado, style, children, etiqueta }: PropsBoton) {
  const baja = useRef(new Animated.Value(0)).current;
  const k = TONOS[tono];
  const alto = redondo ?? (chico ? 40 : 54);
  const prof = chico ? 3 : 4.5;
  const animar = (v: number) => Animated.spring(baja, { toValue: v, useNativeDriver: true, speed: 40, bounciness: v ? 0 : 8 }).start();
  return (
    <Pressable
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta ?? texto}
      onPressIn={() => {
        animar(1);
        haptica.toque();
      }}
      onPressOut={() => animar(0)}
      onPress={onPress}
      style={[{ height: alto + prof, opacity: deshabilitado ? 0.45 : 1 }, redondo ? { width: redondo } : null, style]}
    >
      <View style={[StyleSheet.absoluteFill, { top: prof, borderRadius: redondo ? alto / 2 : radio.m, backgroundColor: k.sombra }]} />
      <Animated.View style={{ height: alto, transform: [{ translateY: baja.interpolate({ inputRange: [0, 1], outputRange: [0, prof] }) }] }}>
        <LinearGradient
          colors={[k.arriba, k.abajo]}
          style={[styles.botonCara, { borderRadius: redondo ? alto / 2 : radio.m }, tono === "vidrio" ? { borderWidth: 1, borderColor: color.borde } : null]}
        >
          {children ?? (
            <>
              {icono ? <Icono nombre={icono} tam={chico ? 16 : 20} color={k.texto} /> : null}
              {texto ? (
                <T v="titulo" t={chico ? 12 : 14.5} c={k.texto} style={{ letterSpacing: 0.6 }}>
                  {texto}
                </T>
              ) : null}
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function Barra({ p, c = color.verde, alto = 8, fondo = "rgba(255,255,255,0.14)" }: { p: number; c?: string; alto?: number; fondo?: string }) {
  return (
    <View style={{ height: alto, borderRadius: 99, backgroundColor: fondo, overflow: "hidden" }}>
      <View style={{ width: `${Math.max(0, Math.min(100, p))}%`, height: "100%", borderRadius: 99, backgroundColor: c }}>
        <View style={{ position: "absolute", left: 4, right: 4, top: 1.5, height: Math.max(1.5, alto * 0.25), borderRadius: 99, backgroundColor: "rgba(255,255,255,0.35)" }} />
      </View>
    </View>
  );
}

export function Chip({ icono, valor, c }: { icono: NombreIcono; valor: string | number; c: string }) {
  return (
    <View style={styles.chip}>
      <Icono nombre={icono} tam={15} color={c} />
      <T v="uiExtra" t={13}>
        {valor}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: "absolute", top: 0, left: 0, right: 0, height: 340 },
  vidrio: {
    backgroundColor: color.vidrio,
    borderColor: color.borde,
    borderWidth: 1,
    borderRadius: radio.l,
    padding: 14,
  },
  botonCara: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingLeft: 7,
    paddingRight: 10,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: color.borde,
  },
});
