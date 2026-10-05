// Componentes de arte: íconos propios, Lani (con respiración y parpadeo), piezas de la armadura, emblema, vehículos y logo.
// Los SVG salen de scripts/generar_arte.py (bocetos de dirección; el arte final lo hacen especialistas y Lani pasará a Rive).
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, View, type ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";

import { categorias, type Categoria } from "../tema";
import { ICONOS, LANI, LOGO, LOGO_CLARO, PIEZAS, TU_LANI, VEHICULOS } from "./generado";

export type NombreIcono = keyof typeof ICONOS;

export function Icono({ nombre, tam = 20, color = "#FFFFFF" }: { nombre: NombreIcono; tam?: number; color?: string }) {
  const xml = useMemo(() => ICONOS[nombre].split("{c}").join(color), [nombre, color]);
  return <SvgXml xml={xml} width={tam} height={tam} />;
}

export type PoseLani = keyof typeof LANI;
export type PoseTuLani = keyof typeof TU_LANI;

type PropsLani = {
  pose?: PoseLani;
  tam?: number;
  tuLani?: boolean;
  vivo?: boolean; // respira y parpadea
  style?: ViewStyle;
};

/** Lani: respira (escala suave) y parpadea cada pocos segundos cuando está «viva». */
export function Lani({ pose = "reposo", tam = 120, tuLani = false, vivo = true, style }: PropsLani) {
  const respira = useRef(new Animated.Value(0)).current;
  const [parpadeo, setParpadeo] = useState(false);

  useEffect(() => {
    if (!vivo) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(respira, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(respira, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    let vivoTimer = true;
    let t: ReturnType<typeof setTimeout>;
    const programar = () => {
      t = setTimeout(() => {
        if (!vivoTimer) return;
        setParpadeo(true);
        setTimeout(() => setParpadeo(false), 140);
        programar();
      }, 2600 + Math.random() * 2600);
    };
    programar();
    return () => {
      vivoTimer = false;
      clearTimeout(t);
      loop.stop();
    };
  }, [vivo, respira]);

  const xml = useMemo(() => {
    const fuente: Record<string, string> = tuLani ? TU_LANI : LANI;
    const conParpadeo = `${pose}_parpadeo`;
    if (parpadeo && fuente[conParpadeo]) return fuente[conParpadeo];
    return fuente[pose] ?? LANI[pose];
  }, [pose, tuLani, parpadeo]);

  const escalaY = respira.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  const sube = respira.interpolate({ inputRange: [0, 1], outputRange: [0, -tam * 0.012] });
  return (
    <Animated.View style={[{ width: tam, height: tam * 1.2, transform: [{ translateY: sube }, { scaleY: escalaY }] }, style]}>
      <SvgXml xml={xml} width={tam} height={tam * 1.2} />
    </Animated.View>
  );
}

export function Pieza({ clave, tam = 48, apagada = false }: { clave: Categoria; tam?: number; apagada?: boolean }) {
  return (
    <View style={{ opacity: apagada ? 0.35 : 1 }}>
      <SvgXml xml={PIEZAS[clave]} width={tam} height={tam} />
    </View>
  );
}

/** Silueta del guerrero con las 6 piezas: las ganadas se encienden con el color de su categoría. */
export function Emblema({ ganadas, tam = 56, rival = false }: { ganadas: Categoria[]; tam?: number; rival?: boolean }) {
  const col = (k: Categoria) => (ganadas.includes(k) ? categorias[k].color : "#ffffff26");
  const xml = `<svg viewBox="0 0 64 64">
<circle cx="32" cy="32" r="30" fill="${rival ? "#ffffff12" : "#00000038"}" stroke="#ffffff55" stroke-width="1.2"/>
<path d="M24 19c0-6 3.6-10 8-10s8 4 8 10v3H24z" fill="${col("casco")}"/>
<path d="M23 24h18l2 13H21z" fill="${col("coraza")}"/>
<rect x="21.5" y="37.5" width="21" height="4" rx="1.6" fill="${col("cinturon")}"/>
<path d="M23.5 43h6.5l-.6 11h-6.8zM34 43h6.5l1 11h-6.8z" fill="${col("botas")}"/>
<path d="M9 27l8-3 8 3v6c0 6-3.5 10-8 12-4.5-2-8-6-8-12z" fill="${col("escudo")}"/>
<path d="M50 10l3 3-9 21-3-1.5z" fill="${col("espada")}"/><path d="M40 31l7 3.4" stroke="${col("espada")}" stroke-width="3" stroke-linecap="round"/>
</svg>`;
  return <SvgXml xml={xml} width={tam} height={tam} />;
}

export function Vehiculo({ tipo, tam = 80 }: { tipo: keyof typeof VEHICULOS; tam?: number }) {
  return <SvgXml xml={VEHICULOS[tipo]} width={tam} height={tam * 0.58} />;
}

export function Logo({ tam = 40, claro = false }: { tam?: number; claro?: boolean }) {
  return <SvgXml xml={claro ? LOGO_CLARO : LOGO} width={tam} height={tam} />;
}

export { SvgXml };
