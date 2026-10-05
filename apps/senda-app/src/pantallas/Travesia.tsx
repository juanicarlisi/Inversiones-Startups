// Travesía: el mapa de la sección con sus niveles. Hoy está abierta la primera lección; el resto se arma en los sprints 2 y 3.
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

import { Icono, Lani, SvgXml, type NombreIcono } from "../arte/Arte";
import { MAPA_TRAVESIA } from "../arte/generado";
import { Kicker, T } from "../componentes/base";
import { BarraSuperior } from "../componentes/momentos";
import { LECCION_CREACION } from "../datos/leccion";
import { useUsuario } from "../estado/usuario";
import type { PropsTab } from "../navegacion";
import { color } from "../tema";
import { haptica } from "../util/haptica";

type Nodo = { titulo: string; x: number; y: number; tipo: "leccion" | "cofre" | "jefe" };
const NODOS: Nodo[] = [
  { titulo: "La creación", x: 0.42, y: 0.84, tipo: "leccion" },
  { titulo: "Adán y Eva", x: 0.62, y: 0.72, tipo: "leccion" },
  { titulo: "Caín y Abel", x: 0.4, y: 0.6, tipo: "leccion" },
  { titulo: "Cofre", x: 0.6, y: 0.48, tipo: "cofre" },
  { titulo: "Noé", x: 0.4, y: 0.36, tipo: "leccion" },
  { titulo: "Babel", x: 0.6, y: 0.24, tipo: "leccion" },
  { titulo: "Jefe: el diluvio", x: 0.46, y: 0.11, tipo: "jefe" },
];

function NodoMapa({ nodo, estado, onPress }: { nodo: Nodo; estado: "hecho" | "actual" | "bloqueado"; onPress: () => void }) {
  const sacude = useRef(new Animated.Value(0)).current;
  const grande = estado === "actual" || nodo.tipo === "jefe";
  const tam = grande ? 72 : 60;
  const fondo = estado === "hecho" ? color.ambar : estado === "actual" ? color.verde : nodo.tipo === "jefe" ? "#5A43D6" : "#4B3F86";
  const sombra = estado === "hecho" ? color.ambarSombra : estado === "actual" ? color.verdeSombra : "#241A5A";
  const icono: NombreIcono = estado === "hecho" ? "check" : estado === "actual" ? "tri" : nodo.tipo === "cofre" ? "cofre" : nodo.tipo === "jefe" ? "corona" : "candado";
  const press = () => {
    if (estado === "bloqueado") {
      haptica.error();
      Animated.sequence([-1, 1, -1, 1, 0].map((v) => Animated.timing(sacude, { toValue: v, duration: 55, useNativeDriver: true }))).start();
      return;
    }
    haptica.firme();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ translateX: sacude.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] }) }] }}>
      {estado === "actual" ? <View style={[styles.aura, { width: tam + 26, height: tam + 22, borderRadius: (tam + 26) / 2, left: -13, top: -11 }]} /> : null}
      <Pressable onPress={press} accessibilityLabel={nodo.titulo}>
        <View style={{ width: tam, height: tam * 0.88 + 6 }}>
          <View style={[styles.nodoBase, { width: tam, height: tam * 0.88, borderRadius: tam / 2, top: 6, backgroundColor: sombra }]} />
          <View style={[styles.nodoBase, { width: tam, height: tam * 0.88, borderRadius: tam / 2, backgroundColor: fondo, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.22)" }]}>
            <Icono nombre={icono} tam={grande ? 30 : 24} color={estado === "bloqueado" ? (nodo.tipo === "cofre" ? color.oro : "#A99FD6") : "#fff"} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function Travesia({ navigation }: PropsTab<"Travesia">) {
  const { width, height } = useWindowDimensions();
  const lecciones = useUsuario((s) => s.lecciones);
  const hecha = !!lecciones[LECCION_CREACION.id];
  const altoMapa = Math.max(520, height - 250);

  return (
    <View style={{ flex: 1, backgroundColor: color.noche }}>
      <View style={StyleSheet.absoluteFill}>
        <SvgXml xml={MAPA_TRAVESIA} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>
      <View style={{ flex: 1, paddingTop: 50 }}>
        <BarraSuperior />
        <View style={styles.seccion}>
          <View style={{ flex: 1 }}>
            <Kicker c="#E6FFF1">Ruta Fundamentos · Sección 1</Kicker>
            <T v="titulo" t={19}>Los comienzos</T>
          </View>
          <View style={styles.seccionIco}>
            <Icono nombre="mapa" tam={20} color="#fff" />
          </View>
        </View>
        <View style={{ height: altoMapa, marginHorizontal: 16 }}>
          {NODOS.map((n, i) => {
            const estado = i === 0 ? (hecha ? "hecho" : "actual") : i === 1 && hecha ? "actual" : "bloqueado";
            const left = n.x * (width - 32) - 36;
            const top = n.y * altoMapa - 36;
            return (
              <View key={n.titulo} style={{ position: "absolute", left, top }}>
                {estado === "actual" ? (
                  <View style={styles.tip}>
                    <View style={styles.tipCaja}>
                      <T v="titulo" t={11} c={color.verdeSombra}>{i === 0 ? "EMPEZAR" : "PRÓXIMAMENTE"}</T>
                    </View>
                  </View>
                ) : null}
                <NodoMapa
                  nodo={n}
                  estado={estado}
                  onPress={() => {
                    if (i === 0) navigation.navigate("Leccion");
                  }}
                />
              </View>
            );
          })}
          <View style={{ position: "absolute", left: (hecha ? 0.62 : 0.42) * (width - 32) - 112, top: (hecha ? 0.72 : 0.84) * altoMapa - 70 }} pointerEvents="none">
            <Lani pose="saludo" tuLani tam={64} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 20,
    backgroundColor: color.verde,
    shadowColor: color.verdeSombra,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  seccionIco: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.18)", alignItems: "center", justifyContent: "center" },
  nodoBase: { position: "absolute", left: 0 },
  aura: { position: "absolute", backgroundColor: "rgba(47,191,113,0.25)", borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  tip: { position: "absolute", top: -40, left: -40, right: -40, alignItems: "center" },
  tipCaja: { backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
});
