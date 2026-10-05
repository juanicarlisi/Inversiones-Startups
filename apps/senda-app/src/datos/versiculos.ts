// Versículos del día (uno por día, rotando). El texto sale de la versión que elige cada usuario.
import { diaDelAnio } from "../util/fechas";

export type Ref = { libro: string; cap: number; vers: number };

export const VERSICULOS_DEL_DIA: Ref[] = [
  { libro: "PSA", cap: 119, vers: 105 }, { libro: "JHN", cap: 3, vers: 16 }, { libro: "JOS", cap: 1, vers: 9 },
  { libro: "PHP", cap: 4, vers: 13 }, { libro: "PRO", cap: 3, vers: 5 }, { libro: "ISA", cap: 41, vers: 10 },
  { libro: "MAT", cap: 11, vers: 28 }, { libro: "ROM", cap: 8, vers: 28 }, { libro: "PSA", cap: 23, vers: 1 },
  { libro: "JER", cap: 29, vers: 11 }, { libro: "1CO", cap: 13, vers: 4 }, { libro: "GAL", cap: 5, vers: 22 },
  { libro: "MAT", cap: 5, vers: 14 }, { libro: "PSA", cap: 46, vers: 1 }, { libro: "LAM", cap: 3, vers: 22 },
  { libro: "2TI", cap: 1, vers: 7 }, { libro: "HEB", cap: 11, vers: 1 }, { libro: "ROM", cap: 12, vers: 2 },
  { libro: "PSA", cap: 37, vers: 4 }, { libro: "MAT", cap: 6, vers: 33 }, { libro: "JHN", cap: 14, vers: 6 },
  { libro: "ISA", cap: 40, vers: 31 }, { libro: "1JN", cap: 4, vers: 19 }, { libro: "EPH", cap: 2, vers: 8 },
  { libro: "PSA", cap: 139, vers: 14 }, { libro: "COL", cap: 3, vers: 23 }, { libro: "1PE", cap: 5, vers: 7 },
  { libro: "MIC", cap: 6, vers: 8 }, { libro: "JAS", cap: 1, vers: 5 }, { libro: "ROM", cap: 15, vers: 13 },
  { libro: "PSA", cap: 121, vers: 1 }, { libro: "JHN", cap: 15, vers: 5 }, { libro: "DEU", cap: 31, vers: 6 },
  { libro: "PRO", cap: 4, vers: 23 }, { libro: "MAT", cap: 28, vers: 20 }, { libro: "2CO", cap: 5, vers: 17 },
  { libro: "PSA", cap: 51, vers: 10 }, { libro: "ISA", cap: 43, vers: 2 }, { libro: "1TH", cap: 5, vers: 16 },
  { libro: "ECC", cap: 12, vers: 1 },
];

export function versiculoDeHoy(d: Date = new Date()): Ref {
  return VERSICULOS_DEL_DIA[diaDelAnio(d) % VERSICULOS_DEL_DIA.length];
}
