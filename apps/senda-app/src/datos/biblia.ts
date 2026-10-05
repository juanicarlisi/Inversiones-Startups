// Biblias libres empaquetadas con la app (sin costo de licencia). La RVR1960 se suma cuando haya licencia (capítulo 7).
import { Asset } from "expo-asset";
import { Platform } from "react-native";

export type IdVersion = "rv1909" | "bes" | "pdt";

export type Libro = { id: string; nombre: string; caps: string[][] };
export type Biblia = { id: IdVersion; nombre: string; abrev: string; licencia: string; atribucion: string; libros: Libro[] };

export const VERSIONES: { id: IdVersion; abrev: string; nombre: string; nota: string }[] = [
  { id: "rv1909", abrev: "RV1909", nombre: "Reina-Valera 1909", nota: "La Reina-Valera clásica (dominio público)" },
  { id: "bes", abrev: "BES", nombre: "Biblia en Español Sencillo", nota: "Lenguaje simple y actual (CC BY 4.0)" },
  { id: "pdt", abrev: "PDT", nombre: "Palabra de Dios para ti", nota: "Traducción moderna (CC BY-SA 4.0)" },
];

const ARCHIVOS: Record<IdVersion, number> = {
  rv1909: require("../../assets/biblia/rv1909.bib"),
  bes: require("../../assets/biblia/bes.bib"),
  pdt: require("../../assets/biblia/pdt.bib"),
};

const cache: Partial<Record<IdVersion, Promise<Biblia>>> = {};

async function leerTexto(mod: number): Promise<string> {
  const asset = Asset.fromModule(mod);
  if (Platform.OS === "web") {
    const r = await fetch(asset.uri);
    return r.text();
  }
  await asset.downloadAsync();
  const { File } = await import("expo-file-system");
  return new File(asset.localUri ?? asset.uri).text();
}

export function cargarBiblia(id: IdVersion): Promise<Biblia> {
  if (!cache[id]) {
    cache[id] = leerTexto(ARCHIVOS[id]).then((t) => JSON.parse(t) as Biblia);
    cache[id]!.catch(() => delete cache[id]);
  }
  return cache[id]!;
}

// Libros: abreviatura y testamento (orden protestante de 66 libros, ids USFM).
export const ABREV: Record<string, string> = {
  GEN: "Gn", EXO: "Éx", LEV: "Lv", NUM: "Nm", DEU: "Dt", JOS: "Jos", JDG: "Jue", RUT: "Rt", "1SA": "1 S", "2SA": "2 S", "1KI": "1 R",
  "2KI": "2 R", "1CH": "1 Cr", "2CH": "2 Cr", EZR: "Esd", NEH: "Neh", EST: "Est", JOB: "Job", PSA: "Sal", PRO: "Pr", ECC: "Ec",
  SNG: "Cnt", ISA: "Is", JER: "Jer", LAM: "Lm", EZK: "Ez", DAN: "Dn", HOS: "Os", JOL: "Jl", AMO: "Am", OBA: "Abd", JON: "Jon",
  MIC: "Mi", NAM: "Nah", HAB: "Hab", ZEP: "Sof", HAG: "Hag", ZEC: "Zac", MAL: "Mal", MAT: "Mt", MRK: "Mr", LUK: "Lc", JHN: "Jn",
  ACT: "Hch", ROM: "Ro", "1CO": "1 Co", "2CO": "2 Co", GAL: "Gá", EPH: "Ef", PHP: "Fil", COL: "Col", "1TH": "1 Ts", "2TH": "2 Ts",
  "1TI": "1 Ti", "2TI": "2 Ti", TIT: "Tit", PHM: "Flm", HEB: "He", JAS: "Stg", "1PE": "1 P", "2PE": "2 P", "1JN": "1 Jn", "2JN": "2 Jn",
  "3JN": "3 Jn", JUD: "Jud", REV: "Ap",
};

export const NOMBRES: Record<string, string> = {
  GEN: "Génesis", EXO: "Éxodo", LEV: "Levítico", NUM: "Números", DEU: "Deuteronomio", JOS: "Josué", JDG: "Jueces", RUT: "Rut",
  "1SA": "1 Samuel", "2SA": "2 Samuel", "1KI": "1 Reyes", "2KI": "2 Reyes", "1CH": "1 Crónicas", "2CH": "2 Crónicas", EZR: "Esdras",
  NEH: "Nehemías", EST: "Ester", JOB: "Job", PSA: "Salmos", PRO: "Proverbios", ECC: "Eclesiastés", SNG: "Cantares", ISA: "Isaías",
  JER: "Jeremías", LAM: "Lamentaciones", EZK: "Ezequiel", DAN: "Daniel", HOS: "Oseas", JOL: "Joel", AMO: "Amós", OBA: "Abdías",
  JON: "Jonás", MIC: "Miqueas", NAM: "Nahúm", HAB: "Habacuc", ZEP: "Sofonías", HAG: "Hageo", ZEC: "Zacarías", MAL: "Malaquías",
  MAT: "Mateo", MRK: "Marcos", LUK: "Lucas", JHN: "Juan", ACT: "Hechos", ROM: "Romanos", "1CO": "1 Corintios", "2CO": "2 Corintios",
  GAL: "Gálatas", EPH: "Efesios", PHP: "Filipenses", COL: "Colosenses", "1TH": "1 Tesalonicenses", "2TH": "2 Tesalonicenses",
  "1TI": "1 Timoteo", "2TI": "2 Timoteo", TIT: "Tito", PHM: "Filemón", HEB: "Hebreos", JAS: "Santiago", "1PE": "1 Pedro",
  "2PE": "2 Pedro", "1JN": "1 Juan", "2JN": "2 Juan", "3JN": "3 Juan", JUD: "Judas", REV: "Apocalipsis",
};

export const NUEVO_TESTAMENTO_DESDE = "MAT";

export function referencia(libro: string, cap: number, vers?: number): string {
  return `${NOMBRES[libro] ?? libro} ${cap}${vers ? `:${vers}` : ""}`;
}

/** Limpia detalles de la edición fuente: encabezados acrósticos del Salmo 119 y mayúsculas iniciales («EN el principio»). */
export function limpiarVersiculo(texto: string, libro: string, cap: number, vers: number): string {
  let t = texto;
  if (libro === "PSA" && cap === 119) t = t.replace(/^[A-ZÑ]{2,8}\.\s+/, "");
  // La edición fuente abre cada capítulo en versalitas («Y HABÍA un hombre»): se normaliza a minúsculas.
  if (vers === 1) {
    const palabras = t.split(" ");
    for (let k = 0; k < Math.min(3, palabras.length); k++) {
      const w = palabras[k];
      if (w.length > 1 && w === w.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(w)) palabras[k] = k === 0 ? w[0] + w.slice(1).toLowerCase() : w.toLowerCase();
    }
    t = palabras.join(" ");
  }
  return t;
}
