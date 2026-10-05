// Sistema de diseño de Senda (paleta B: ámbar + índigo). Fuente: proyecto completo v2, capítulo 19.
export const color = {
  ambar: "#F5A524",
  oro: "#FFC857",
  ambarOsc: "#D9860F",
  ambarSombra: "#B87710",
  tintaAmbar: "#2A1700",
  noche: "#1C1446",
  nocheProfunda: "#140E33",
  indigo: "#2E2170",
  indigoM: "#3A2A8C",
  indigoClaro: "#4A37A8",
  violeta: "#6E56F7",
  verde: "#2FBF71",
  verdeClaro: "#4AD98C",
  verdeSombra: "#1E8A50",
  rojo: "#E5484D",
  rojoClaro: "#FF8E92",
  crema: "#FFF8EC",
  cremaBorde: "#EFE3CC",
  tinta: "#17151F",
  tintaSuave: "#5B5560",
  blanco: "#FFFFFF",
  texto2: "rgba(255,255,255,0.74)",
  texto3: "rgba(255,255,255,0.5)",
  vidrio: "rgba(255,255,255,0.09)",
  vidrioFuerte: "rgba(255,255,255,0.14)",
  borde: "rgba(255,255,255,0.14)",
  sombra: "rgba(0,0,0,0.28)",
} as const;

export type Categoria = "escudo" | "espada" | "casco" | "coraza" | "cinturon" | "botas";

export const categorias: Record<Categoria, { pieza: string; nombre: string; color: string; claro: string; versiculo: string; que: string }> = {
  escudo: { pieza: "Escudo", nombre: "Héroes", color: "#3D7BFF", claro: "#8FB5FF", versiculo: "Efesios 6:16", que: "Personajes de toda la Biblia" },
  espada: { pieza: "Espada", nombre: "Palabra", color: "#FF8A2B", claro: "#FFC08C", versiculo: "Efesios 6:17", que: "Versículos, citas y libros" },
  casco: { pieza: "Casco", nombre: "Historia", color: "#9C6BFF", claro: "#C9B0FF", versiculo: "Efesios 6:17", que: "La gran historia y sus épocas" },
  coraza: { pieza: "Coraza", nombre: "Vida", color: "#22C17A", claro: "#86E5B8", versiculo: "Efesios 6:14", que: "Cómo vivir: mandamientos y sabiduría" },
  cinturon: { pieza: "Cinturón", nombre: "Verdad", color: "#17B3D1", claro: "#7FDDEE", versiculo: "Efesios 6:14", que: "Lo central de la fe" },
  botas: { pieza: "Botas", nombre: "Mapa", color: "#FF5470", claro: "#FFA3B2", versiculo: "Efesios 6:15", que: "Lugares, viajes y geografía" },
};

export const ordenCategorias: Categoria[] = ["escudo", "espada", "casco", "coraza", "cinturon", "botas"];

// Nombres de familia tal como se registran con useFonts (src/App.tsx).
export const fuente = {
  titulo: "Unbounded_800ExtraBold",
  tituloNegra: "Unbounded_900Black",
  tituloMedio: "Unbounded_700Bold",
  ui: "PlusJakartaSans_500Medium",
  uiSemi: "PlusJakartaSans_600SemiBold",
  uiBold: "PlusJakartaSans_700Bold",
  uiExtra: "PlusJakartaSans_800ExtraBold",
  biblia: "Literata_400Regular",
  bibliaSemi: "Literata_600SemiBold",
  bibliaItalica: "Literata_400Regular_Italic",
} as const;

export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;
export const radio = { s: 10, m: 14, l: 20, xl: 28, pill: 999 } as const;

// Reglas del juego decididas por el fundador (05-10-2026).
export const reglas = {
  vidasGratis: 3,
  minutosPorVida: 60,
  talentosPorMision: 15,
  talentosLeccion: 10,
  talentosLeccionPerfecta: 15,
} as const;
