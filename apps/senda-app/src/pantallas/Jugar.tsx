// Jugar: Espadeo de práctica (solo). Ruleta → pregunta → 3 aciertos llenan la Carga → Prueba de pieza → la pieza vuela a tu armadura.
// Los duelos con amigos, la Liga y el Viernes de Espadeo llegan con las cuentas (sprints 4 a 6).
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Emblema, Icono, Lani, Pieza, SvgXml } from "../arte/Arte";
import { RULETA } from "../arte/generado";
import { Barra, Boton, Fondo, Kicker, T, Vidrio } from "../componentes/base";
import { BarraSuperior, Chispas, CuentaVidas, useCelebracion } from "../componentes/momentos";
import { preguntaAlAzar, type PreguntaEspadeo } from "../datos/espadeo";
import { useUsuario } from "../estado/usuario";
import type { PropsTab } from "../navegacion";
import { categorias, color, ordenCategorias, type Categoria } from "../tema";
import { haptica } from "../util/haptica";

type Fase = "inicio" | "ruleta" | "armeria" | "pregunta" | "respuesta" | "pieza" | "completa";
const SEG = 360 / 7;
const SEGUNDOS = 25;

export default function Jugar(_: PropsTab<"Jugar">) {
  const vidasAhora = useUsuario((s) => s.vidasAhora);
  useUsuario((s) => s.vidas);
  const perderVida = useUsuario((s) => s.perderVida);
  const ganar = useUsuario((s) => s.ganar);
  const mostrar = useCelebracion((s) => s.mostrar);

  const [fase, setFase] = useState<Fase>("inicio");
  const [piezas, setPiezas] = useState<Categoria[]>([]);
  const [carga, setCarga] = useState(0);
  const [cat, setCat] = useState<Categoria>("escudo");
  const [preg, setPreg] = useState<PreguntaEspadeo | null>(null);
  const [esPrueba, setEsPrueba] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [ocultas, setOcultas] = useState<number[]>([]);
  const [luces, setLuces] = useState(3);
  const [seg, setSeg] = useState(SEGUNDOS);
  const [disparo, setDisparo] = useState(0);
  const giro = useRef(new Animated.Value(0)).current;
  const angulo = useRef(0);
  const vuelo = useRef(new Animated.Value(0)).current;

  // reloj de la pregunta
  useEffect(() => {
    if (fase !== "pregunta") return;
    setSeg(SEGUNDOS);
    const t = setInterval(() => setSeg((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [fase, preg]);
  useEffect(() => {
    if (fase === "pregunta" && seg <= 0) responder(-1);
  }, [seg]); // eslint-disable-line react-hooks/exhaustive-deps

  const empezar = () => {
    if (vidasAhora().vidas <= 0) return;
    perderVida(); // empezar una partida usa una vida (capítulo 17)
    setPiezas([]);
    setCarga(0);
    setLuces(3);
    setFase("ruleta");
  };

  const girar = () => {
    haptica.firme();
    const k = Math.floor(Math.random() * 7);
    const destino = angulo.current + 360 * 5 + ((360 - (k + 0.5) * SEG - (angulo.current % 360) + 720) % 360);
    angulo.current = destino;
    Animated.timing(giro, { toValue: destino, duration: 3200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      haptica.premio();
      if (k === 6) {
        setFase("armeria");
        return;
      }
      abrirPregunta(ordenCategorias[k], false);
    });
  };

  const abrirPregunta = (c: Categoria, prueba: boolean, excepto?: string) => {
    setCat(c);
    setEsPrueba(prueba);
    setPreg(preguntaAlAzar(c, excepto));
    setSel(null);
    setOcultas([]);
    setFase("pregunta");
  };

  const responder = (k: number) => {
    if (!preg) return;
    setSel(k);
    const bien = k === preg.correcta;
    if (bien) {
      haptica.acierto();
      setDisparo((d) => d + 1);
    } else haptica.error();
    setFase("respuesta");
  };

  const seguir = () => {
    if (!preg) return;
    const bien = sel === preg.correcta;
    if (esPrueba) {
      if (bien && !piezas.includes(cat)) {
        const nuevas = [...piezas, cat];
        setPiezas(nuevas);
        setCarga(0);
        vuelo.setValue(0);
        Animated.spring(vuelo, { toValue: 1, useNativeDriver: true, speed: 9, bounciness: 9 }).start();
        setDisparo((d) => d + 1);
        haptica.premio();
        setFase(nuevas.length === 6 ? "completa" : "pieza");
        if (nuevas.length === 6) {
          ganar(20, 15);
          setTimeout(() => mostrar({ titulo: "¡Armadura completa!", detalle: "Ganaste la partida de práctica", talentos: 20, pose: "armadura" }), 600);
        }
        return;
      }
      setCarga(0);
      setFase("ruleta");
      return;
    }
    if (!bien) {
      setCarga(0);
      setFase("ruleta");
      return;
    }
    const nueva = Math.min(3, carga + 1);
    setCarga(nueva);
    if (nueva === 3) {
      // Carga llena: Prueba de pieza de esta categoría (o la Armería si ya la tenés)
      if (piezas.includes(cat)) setFase("armeria");
      else abrirPregunta(cat, true, preg.enunciado);
      return;
    }
    setFase("ruleta");
  };

  const usarLuz = () => {
    if (!preg || luces <= 0 || ocultas.length) return;
    haptica.toque();
    const malas = preg.opciones.map((_, k) => k).filter((k) => k !== preg.correcta);
    setOcultas(malas.sort(() => Math.random() - 0.5).slice(0, 2));
    setLuces(luces - 1);
  };

  const c = categorias[cat];
  const rot = giro.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] });

  return (
    <Fondo>
      <BarraSuperior izquierda={<T v="titulo" t={22}>Espadeo</T>} />
      <ScrollView contentContainerStyle={styles.cont} showsVerticalScrollIndicator={false}>
        <Vidrio style={styles.hud}>
          <View style={{ flex: 1, gap: 6 }}>
            <Kicker>Tu armadura</Kicker>
            <T v="titulo" t={18}>{`${piezas.length} de 6`}</T>
            <View style={{ flexDirection: "row", gap: 4 }}>
              {ordenCategorias.map((k) => (
                <Pieza key={k} clave={k} tam={30} apagada={!piezas.includes(k)} />
              ))}
            </View>
          </View>
          <Animated.View style={{ transform: [{ scale: vuelo.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.25, 1] }) }] }}>
            <Emblema ganadas={piezas} tam={76} />
          </Animated.View>
        </Vidrio>

        {fase === "inicio" ? (
          <View style={styles.centro}>
            <Lani pose="guardia" tuLani tam={150} />
            <T v="titulo" t={22} style={{ textAlign: "center" }}>Completa la armadura de Dios</T>
            <T c={color.texto2} style={{ textAlign: "center" }}>
              Gira la ruleta, responde y llena la Carga con 3 aciertos. Después, la Prueba de pieza: si aciertas, ganas esa pieza.
            </T>
            {vidasAhora().vidas > 0 ? (
              <Boton texto="EMPEZAR PARTIDA" onPress={empezar} style={{ alignSelf: "stretch", marginTop: 8 }} />
            ) : (
              <View style={{ alignItems: "center", gap: 4 }}>
                <T v="uiBold" c={color.rojoClaro}>Sin vidas por ahora</T>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <T c={color.texto2}>La próxima vuelve en</T>
                  <CuentaVidas />
                </View>
              </View>
            )}
            <T t={12} c={color.texto3}>Empezar una partida usa 1 vida. Duelos con amigos, Liga y Viernes de Espadeo: muy pronto.</T>
          </View>
        ) : null}

        {fase === "ruleta" ? (
          <View style={styles.centro}>
            <View style={styles.ruedaCaja}>
              <Animated.View style={{ transform: [{ rotate: rot }] }}>
                <SvgXml xml={RULETA} width={270} height={270} />
              </Animated.View>
              <View style={styles.centroRueda}>
                <T v="titulo" t={11} c={color.oro}>GIRAR</T>
              </View>
              <View style={styles.puntero} />
            </View>
            <View style={styles.carga}>
              <Kicker>Carga</Kicker>
              {[0, 1, 2].map((k) => (
                <View key={k} style={[styles.cargaSeg, k < carga && styles.cargaOn]} />
              ))}
            </View>
            <Boton texto="¡GIRAR!" onPress={girar} style={{ alignSelf: "stretch" }} />
          </View>
        ) : null}

        {fase === "armeria" ? (
          <View style={styles.centro}>
            <Icono nombre="corona" tam={44} color={color.oro} />
            <T v="titulo" t={22} c={color.oro}>¡Armería!</T>
            <T c={color.texto2} style={{ textAlign: "center" }}>Elige qué pieza quieres probar ganar.</T>
            <View style={styles.armeria}>
              {ordenCategorias.map((k) => {
                const tiene = piezas.includes(k);
                return (
                  <Pressable key={k} disabled={tiene} onPress={() => abrirPregunta(k, true)} style={[styles.armeriaOp, { borderColor: categorias[k].color, opacity: tiene ? 0.35 : 1 }]}>
                    <Pieza clave={k} tam={48} />
                    <T v="uiExtra" t={12.5}>{categorias[k].nombre}</T>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {(fase === "pregunta" || fase === "respuesta") && preg ? (
          <View style={{ gap: 12 }}>
            <View style={[styles.catCab, { backgroundColor: c.color }]}>
              <Pieza clave={cat} tam={44} />
              <View style={{ flex: 1 }}>
                <Kicker c="#fff">{esPrueba ? `Prueba de pieza · ${c.pieza}` : c.pieza}</Kicker>
                <T v="titulo" t={19}>{c.nombre}</T>
              </View>
              <T v="titulo" t={16}>{fase === "pregunta" ? `${Math.max(0, seg)} s` : ""}</T>
            </View>
            <Barra p={(seg / SEGUNDOS) * 100} c={seg > 8 ? color.verde : color.rojo} alto={8} />
            <T v="titulo" t={20} style={{ marginVertical: 6 }}>{preg.enunciado}</T>
            <View style={styles.opsGrid}>
              {preg.opciones.map((o, k) => {
                if (ocultas.includes(k)) return <View key={o} style={[styles.opE, { opacity: 0 }]} />;
                const res = fase === "respuesta";
                const esOk = res && k === preg.correcta;
                const esMal = res && sel === k && k !== preg.correcta;
                return (
                  <Pressable
                    key={o}
                    disabled={res}
                    onPress={() => responder(k)}
                    style={[styles.opE, { borderBottomColor: esOk ? color.verdeSombra : esMal ? "#9E2A2E" : `${c.color}` }, esOk && { backgroundColor: color.verde }, esMal && { backgroundColor: color.rojo }]}
                  >
                    <T v="uiExtra" t={15} c={esOk || esMal ? "#fff" : color.tinta} style={{ textAlign: "center" }}>{o}</T>
                    {esOk ? <Chispas disparo={disparo} radio={90} /> : null}
                  </Pressable>
                );
              })}
            </View>
            {fase === "pregunta" ? (
              <View style={styles.comodines}>
                <Comodin icono="luz" nombre="Luz" cantidad={luces} onPress={usarLuz} />
                {(["reloj", "doble", "cambio", "pista", "tribuna"] as const).map((ic, k) => (
                  <Comodin key={ic} icono={ic} nombre={["Tiempo", "Doble", "Cambio", "Pista", "Tribuna"][k]} cantidad={0} />
                ))}
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <T v="uiBold" t={15} c={sel === preg.correcta ? "#86E5B8" : color.rojoClaro}>
                  {sel === preg.correcta ? (esPrueba ? "¡Prueba superada!" : "¡Correcto! +1 de Carga") : sel === -1 ? "Se terminó el tiempo." : "Esta vez no. La Carga vuelve a cero."}
                </T>
                <T t={13.5} c={color.texto2}>{`${preg.cita} · ${preg.opciones[preg.correcta]}`}</T>
                <Boton texto="SEGUIR" tono={sel === preg.correcta ? "verde" : "vidrio"} onPress={seguir} />
              </View>
            )}
          </View>
        ) : null}

        {fase === "pieza" || fase === "completa" ? (
          <View style={styles.centro}>
            <Kicker>{fase === "completa" ? "¡Armadura completa!" : "Prueba de pieza superada"}</Kicker>
            <View style={{ width: 200, height: 170, alignItems: "center", justifyContent: "center" }}>
              <Chispas disparo={disparo} radio={120} n={20} colores={[c.color, color.oro, "#fff"]} />
              {fase === "completa" ? (
                <Lani pose="armadura" tam={150} />
              ) : (
                <Animated.View style={{ transform: [{ scale: vuelo.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }, { rotate: vuelo.interpolate({ inputRange: [0, 1], outputRange: ["-25deg", "0deg"] }) }] }}>
                  <Pieza clave={cat} tam={130} />
                </Animated.View>
              )}
            </View>
            <T v="titulo" t={24} c={color.oro} style={{ textAlign: "center" }}>
              {fase === "completa" ? "¡La armadura es tuya!" : `¡Ganaste ${c.pieza === "Botas" ? "las" : c.pieza === "Espada" || c.pieza === "Coraza" ? "la" : "el"} ${c.pieza}!`}
            </T>
            <T v="bibliaItalica" t={15} c={color.texto2} style={{ textAlign: "center" }}>{`${c.versiculo}`}</T>
            {fase === "completa" ? <Boton texto="JUGAR OTRA (1 VIDA)" onPress={empezar} deshabilitado={vidasAhora().vidas <= 0} style={{ alignSelf: "stretch" }} /> : <Boton texto="SEGUIR" onPress={() => setFase("ruleta")} style={{ alignSelf: "stretch" }} />}
          </View>
        ) : null}
      </ScrollView>
    </Fondo>
  );
}

function Comodin({ icono, nombre, cantidad, onPress }: { icono: "luz" | "reloj" | "doble" | "cambio" | "pista" | "tribuna"; nombre: string; cantidad: number; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress || cantidad <= 0} style={[styles.comodin, (!onPress || cantidad <= 0) && { opacity: 0.4 }]}>
      <Icono nombre={icono} tam={20} color="#fff" />
      <T v="uiBold" t={10}>{nombre}</T>
      <View style={styles.comodinN}>
        <T v="uiExtra" t={10} c={color.tintaAmbar}>{cantidad}</T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cont: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  hud: { flexDirection: "row", alignItems: "center", gap: 12 },
  centro: { alignItems: "center", gap: 12, paddingTop: 6 },
  ruedaCaja: { width: 280, height: 280, alignItems: "center", justifyContent: "center", marginTop: 6 },
  centroRueda: { position: "absolute", width: 64, height: 64, borderRadius: 32, backgroundColor: color.noche, borderWidth: 3, borderColor: color.oro, alignItems: "center", justifyContent: "center" },
  puntero: {
    position: "absolute",
    top: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 24,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fff",
  },
  carga: { flexDirection: "row", alignItems: "center", gap: 8 },
  cargaSeg: { width: 46, height: 10, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.15)" },
  cargaOn: { backgroundColor: color.ambar, shadowColor: color.ambar, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  armeria: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  armeriaOp: { width: 100, alignItems: "center", gap: 4, paddingVertical: 10, borderRadius: 16, borderWidth: 2, backgroundColor: "rgba(255,255,255,0.06)" },
  catCab: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 18 },
  opsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  opE: { width: "48%", flexGrow: 1, minHeight: 64, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 10, borderBottomWidth: 5 },
  comodines: { flexDirection: "row", gap: 6 },
  comodin: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 8, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: color.borde },
  comodinN: { position: "absolute", top: -6, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: color.ambar, alignItems: "center", justifyContent: "center" },
});
