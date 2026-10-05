// Lección de la Travesía: 6 preguntas, vidas, chispas al acertar, «uff» al errar (Lani nunca se burla) y la cita siempre.
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icono, Lani } from "../arte/Arte";
import { Barra, Boton, Fondo, Kicker, T } from "../componentes/base";
import { Chispas, CuentaVidas, useCelebracion } from "../componentes/momentos";
import { LECCION_CREACION, type Pregunta } from "../datos/leccion";
import { useUsuario } from "../estado/usuario";
import type { PropsRaiz } from "../navegacion";
import { color, reglas } from "../tema";
import { haptica } from "../util/haptica";

type Fase = "pregunta" | "bien" | "mal" | "fin" | "sinvidas";

function opcionesDe(p: Pregunta): string[] {
  return p.tipo === "vf" ? ["Verdadero", "Falso"] : p.opciones;
}
function correctaDe(p: Pregunta): number {
  return p.tipo === "vf" ? (p.correcta ? 0 : 1) : p.correcta;
}

export default function Leccion({ navigation }: PropsRaiz<"Leccion">) {
  const ins = useSafeAreaInsets();
  const leccion = LECCION_CREACION;
  const vidasAhora = useUsuario((s) => s.vidasAhora);
  useUsuario((s) => s.vidas);
  const perderVida = useUsuario((s) => s.perderVida);
  const ganar = useUsuario((s) => s.ganar);
  const completarMision = useUsuario((s) => s.completarMision);
  const terminarLeccion = useUsuario((s) => s.terminarLeccion);
  const mostrar = useCelebracion((s) => s.mostrar);

  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [fase, setFase] = useState<Fase>(vidasAhora().vidas > 0 ? "pregunta" : "sinvidas");
  const [aciertos, setAciertos] = useState(0);
  const [seguidas, setSeguidas] = useState(0);
  const [disparo, setDisparo] = useState(0);
  const sacude = useRef(new Animated.Value(0)).current;
  const panel = useRef(new Animated.Value(0)).current;

  const p = leccion.preguntas[i];
  const ops = useMemo(() => opcionesDe(p), [p]);
  const ok = correctaDe(p);
  const vidas = vidasAhora().vidas;

  useEffect(() => {
    Animated.spring(panel, { toValue: fase === "bien" || fase === "mal" ? 1 : 0, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
  }, [fase, panel]);

  const comprobar = () => {
    if (sel === null) return;
    if (sel === ok) {
      haptica.acierto();
      setAciertos((a) => a + 1);
      setSeguidas((s) => s + 1);
      setDisparo((d) => d + 1);
      setFase("bien");
    } else {
      haptica.error();
      setSeguidas(0);
      perderVida();
      Animated.sequence([-1, 1, -1, 1, 0].map((v) => Animated.timing(sacude, { toValue: v, duration: 60, useNativeDriver: true }))).start();
      setFase("mal");
    }
  };

  const continuar = () => {
    if (fase === "mal" && vidasAhora().vidas <= 0) {
      setFase("sinvidas");
      return;
    }
    if (i + 1 >= leccion.preguntas.length) {
      const perfecta = aciertos === leccion.preguntas.length;
      const talentos = perfecta ? reglas.talentosLeccionPerfecta : reglas.talentosLeccion;
      ganar(talentos, perfecta ? 20 : 15);
      terminarLeccion(leccion.id, perfecta ? 3 : aciertos >= 4 ? 2 : 1);
      setDisparo((d) => d + 1);
      setFase("fin");
      haptica.premio();
      if (completarMision("leccion")) setTimeout(() => mostrar({ titulo: "¡Misión cumplida!", detalle: "Completaste una lección", talentos: reglas.talentosPorMision }), 900);
      return;
    }
    setI(i + 1);
    setSel(null);
    setFase("pregunta");
  };

  if (fase === "sinvidas") {
    return (
      <Fondo conTab={false}>
        <View style={[styles.centro, { paddingBottom: ins.bottom + 20 }]}>
          <Lani pose="desmayo" tam={150} vivo={false} />
          <T v="titulo" t={24} style={{ textAlign: "center" }}>¡Uy! Te quedaste sin vidas</T>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <T c={color.texto2}>La próxima vuelve en</T>
            <CuentaVidas />
          </View>
          <View style={{ alignSelf: "stretch", gap: 10, marginTop: 10 }}>
            <Opcion icono="biblia" c={color.verde} titulo="Leer la Biblia mientras tanto" detalle="Leer nunca gasta vidas" onPress={() => navigation.navigate("Tabs")} />
            <Opcion icono="play" c={color.ambar} titulo="Ver un video (+1 vida)" detalle="Llega con las tiendas" deshabilitado />
            <Opcion icono="corona" c={color.violeta} titulo="Senda Max: vidas ilimitadas" detalle="Llega en marzo de 2027" deshabilitado />
          </View>
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
            <T v="uiBold" c={color.texto2}>Salir</T>
          </Pressable>
        </View>
      </Fondo>
    );
  }

  if (fase === "fin") {
    const perfecta = aciertos === leccion.preguntas.length;
    return (
      <Fondo conTab={false}>
        <View style={[styles.centro, { paddingBottom: ins.bottom + 20 }]}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Chispas disparo={disparo} radio={140} n={22} />
            <Lani pose="festejo" tuLani tam={170} />
          </View>
          <Kicker>{leccion.seccion}</Kicker>
          <T v="titulo" t={26} c={color.oro} style={{ textAlign: "center" }}>{perfecta ? "¡Lección perfecta!" : "¡Lección completa!"}</T>
          <View style={styles.resumen}>
            <Dato valor={`${aciertos}/${leccion.preguntas.length}`} etiqueta="aciertos" />
            <Dato valor={`+${perfecta ? reglas.talentosLeccionPerfecta : reglas.talentosLeccion}`} etiqueta="Talentos" />
            <Dato valor={perfecta ? "3" : aciertos >= 4 ? "2" : "1"} etiqueta="estrellas" />
          </View>
          <T c={color.texto2} style={{ textAlign: "center", paddingHorizontal: 20 }}>Lo que fallaste vuelve en tu repaso. Mañana sigue «Adán y Eva».</T>
          <Boton texto="SEGUIR" onPress={() => navigation.goBack()} style={{ alignSelf: "stretch", marginTop: 12 }} />
        </View>
      </Fondo>
    );
  }

  const imparable = fase === "bien" && seguidas >= 3;
  return (
    <Fondo conTab={false}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Salir de la lección">
          <Icono nombre="cruz" tam={22} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Barra p={((i + (fase === "pregunta" ? 0 : 1)) / leccion.preguntas.length) * 100} alto={12} />
        </View>
        <View style={styles.vidas}>
          <Icono nombre="vida" tam={18} color={color.rojo} />
          <T v="uiExtra">{vidas}</T>
        </View>
      </View>
      <View style={styles.cuerpo}>
        <Kicker>{p.tipo === "vf" ? "¿Verdadero o falso?" : "Elige la respuesta"}</Kicker>
        <T v="titulo" t={22} style={{ marginTop: 6, marginBottom: 20 }}>{p.enunciado}</T>
        <Animated.View style={{ gap: 12, transform: [{ translateX: sacude.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] }}>
          {ops.map((o, k) => {
            const elegido = sel === k;
            const mostrarOk = fase !== "pregunta" && k === ok;
            const mostrarMal = fase === "mal" && elegido;
            return (
              <Pressable
                key={o}
                disabled={fase !== "pregunta"}
                onPress={() => {
                  haptica.toque();
                  setSel(k);
                }}
                style={[styles.op, elegido && styles.opSel, mostrarOk && styles.opOk, mostrarMal && styles.opMal]}
              >
                <View style={[styles.opLetra, (mostrarOk || mostrarMal || elegido) && { borderColor: "transparent", backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <T v="uiExtra" t={13}>{String.fromCharCode(65 + k)}</T>
                </View>
                <T v="uiBold" t={16.5} style={{ flex: 1 }}>{o}</T>
                {mostrarOk ? <Icono nombre="check" tam={20} color="#fff" /> : null}
                {mostrarOk && fase === "bien" ? <Chispas disparo={disparo} radio={110} /> : null}
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
      {fase === "pregunta" ? (
        <View style={[styles.pie, { paddingBottom: ins.bottom + 16 }]}>
          <Boton texto="COMPROBAR" tono={sel === null ? "vidrio" : "verde"} deshabilitado={sel === null} onPress={comprobar} />
        </View>
      ) : (
        <Animated.View
          style={[
            styles.panel,
            { paddingBottom: ins.bottom + 16, backgroundColor: fase === "bien" ? "#17824A" : "#8E2B33" },
            { transform: [{ translateY: panel.interpolate({ inputRange: [0, 1], outputRange: [260, 0] }) }] },
          ]}
        >
          <View style={styles.panelFila}>
            <Lani pose={fase === "bien" ? "festejo" : "uff"} tam={64} vivo={false} />
            <View style={{ flex: 1 }}>
              <T v="titulo" t={18}>{fase === "bien" ? (imparable ? `¡Imparable! ${seguidas} seguidas` : "¡Bien!") : "Casi. La respuesta era:"}</T>
              {fase === "mal" ? <T v="uiBold" t={15}>{ops[ok]}</T> : null}
              <Pressable onPress={() => navigation.navigate("Lector", { libro: p.cita.libro, cap: p.cita.cap, vers: p.cita.vers })}>
                <T v="uiSemi" t={13.5} c="rgba(255,255,255,0.85)" style={{ marginTop: 2 }}>
                  {p.cita.txt} · <T v="uiExtra" t={13.5} c="#fff" style={{ textDecorationLine: "underline" }}>Leer el pasaje</T>
                </T>
              </Pressable>
            </View>
          </View>
          <Boton texto="CONTINUAR" tono={fase === "bien" ? "verde" : "rojo"} onPress={continuar} />
        </Animated.View>
      )}
    </Fondo>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <View style={styles.dato}>
      <T v="titulo" t={22} c={color.oro}>{valor}</T>
      <T t={12} c={color.texto2}>{etiqueta}</T>
    </View>
  );
}

function Opcion({ icono, c, titulo, detalle, onPress, deshabilitado }: { icono: "biblia" | "play" | "corona"; c: string; titulo: string; detalle: string; onPress?: () => void; deshabilitado?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={deshabilitado} style={[styles.opcion, { borderColor: `${c}99`, backgroundColor: `${c}22`, opacity: deshabilitado ? 0.55 : 1 }]}>
      <View style={[styles.opcionIco, { backgroundColor: c }]}>
        <Icono nombre={icono} tam={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <T v="uiExtra" t={15}>{titulo}</T>
        <T t={12.5} c={color.texto2}>{detalle}</T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingTop: 6 },
  vidas: { flexDirection: "row", alignItems: "center", gap: 4 },
  cuerpo: { flex: 1, paddingHorizontal: 20, paddingTop: 26 },
  op: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.14)",
    borderBottomWidth: 5,
  },
  opSel: { borderColor: color.oro, backgroundColor: "rgba(255,200,87,0.14)" },
  opOk: { backgroundColor: color.verde, borderColor: color.verdeClaro },
  opMal: { backgroundColor: color.rojo, borderColor: "#FF6B70" },
  opLetra: { width: 30, height: 30, borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  pie: { paddingHorizontal: 20 },
  panel: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16, borderTopLeftRadius: 26, borderTopRightRadius: 26, gap: 14 },
  panelFila: { flexDirection: "row", alignItems: "center", gap: 12 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 20 },
  resumen: { flexDirection: "row", gap: 10, marginVertical: 6 },
  dato: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", minWidth: 90 },
  opcion: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1.5 },
  opcionIco: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
