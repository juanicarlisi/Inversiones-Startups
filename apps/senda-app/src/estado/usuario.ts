// Estado del usuario guardado en el teléfono (sin cuentas todavía). Cuando lleguen las cuentas (v1) se sincroniza con Supabase.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { IdVersion } from "../datos/biblia";
import { reglas } from "../tema";
import { claveDia, sumarDias } from "../util/fechas";

export type Mision = "leer" | "escuchar" | "leccion";

type Estado = {
  nombre: string;
  version: IdVersion;
  tamLetra: number;
  vidas: number;
  vidaDesde: number | null; // desde cuándo corre la recarga de la próxima vida
  talentos: number;
  pasos: number;
  racha: number;
  ultimoDiaPalabra: string | null;
  ultimaLectura: { libro: string; cap: number } | null;
  leidos: Record<string, true>;
  resaltados: Record<string, true>;
  misiones: { fecha: string; hechas: Partial<Record<Mision, true>> };
  lecciones: Record<string, { estrellas: number; fecha: string }>;
  pulso: Record<string, 0 | 1>;
  // acciones
  setNombre: (n: string) => void;
  setVersion: (v: IdVersion) => void;
  setTamLetra: (t: number) => void;
  vidasAhora: (ahora?: number) => { vidas: number; proxima: number | null };
  perderVida: () => void;
  ganar: (talentos: number, pasos?: number) => void;
  marcarPalabraHoy: () => void;
  leerCapitulo: (libro: string, cap: number) => void;
  alternarResaltado: (clave: string) => void;
  completarMision: (m: Mision) => boolean; // true si recién se completó
  terminarLeccion: (id: string, estrellas: number) => void;
  votarPulso: (dia: string, opcion: 0 | 1) => void;
  reiniciar: () => void;
};

const INICIAL = {
  nombre: "",
  version: "rv1909" as IdVersion,
  tamLetra: 19,
  vidas: reglas.vidasGratis,
  vidaDesde: null,
  talentos: 0,
  pasos: 0,
  racha: 0,
  ultimoDiaPalabra: null,
  ultimaLectura: null,
  leidos: {},
  resaltados: {},
  misiones: { fecha: claveDia(), hechas: {} },
  lecciones: {},
  pulso: {},
};

const MS_VIDA = reglas.minutosPorVida * 60_000;

/** Recalcula vidas con el tiempo transcurrido: 1 por hora hasta el máximo del plan gratis. */
function recargar(vidas: number, desde: number | null, ahora: number) {
  if (vidas >= reglas.vidasGratis || desde === null) return { vidas: Math.min(vidas, reglas.vidasGratis), desde: null };
  const ganadas = Math.floor((ahora - desde) / MS_VIDA);
  const total = Math.min(reglas.vidasGratis, vidas + ganadas);
  return { vidas: total, desde: total >= reglas.vidasGratis ? null : desde + ganadas * MS_VIDA };
}

export const useUsuario = create<Estado>()(
  persist(
    (set, get) => ({
      ...INICIAL,
      setNombre: (nombre) => set({ nombre }),
      setVersion: (version) => set({ version }),
      setTamLetra: (tamLetra) => set({ tamLetra: Math.max(15, Math.min(28, tamLetra)) }),
      vidasAhora: (ahora = Date.now()) => {
        const r = recargar(get().vidas, get().vidaDesde, ahora);
        return { vidas: r.vidas, proxima: r.desde === null ? null : r.desde + MS_VIDA };
      },
      perderVida: () => {
        const ahora = Date.now();
        const r = recargar(get().vidas, get().vidaDesde, ahora);
        const vidas = Math.max(0, r.vidas - 1);
        set({ vidas, vidaDesde: r.desde ?? ahora });
      },
      ganar: (talentos, pasos = 0) => set((s) => ({ talentos: s.talentos + talentos, pasos: s.pasos + pasos })),
      marcarPalabraHoy: () => {
        const hoy = claveDia();
        const { ultimoDiaPalabra, racha } = get();
        if (ultimoDiaPalabra === hoy) return;
        const ayer = claveDia(sumarDias(new Date(), -1));
        set({ ultimoDiaPalabra: hoy, racha: ultimoDiaPalabra === ayer ? racha + 1 : 1 });
      },
      leerCapitulo: (libro, cap) => {
        set((s) => ({ ultimaLectura: { libro, cap }, leidos: { ...s.leidos, [`${libro}.${cap}`]: true } }));
      },
      alternarResaltado: (clave) =>
        set((s) => {
          const r = { ...s.resaltados };
          if (r[clave]) delete r[clave];
          else r[clave] = true;
          return { resaltados: r };
        }),
      completarMision: (m) => {
        const hoy = claveDia();
        const actual = get().misiones.fecha === hoy ? get().misiones : { fecha: hoy, hechas: {} };
        if (actual.hechas[m]) return false;
        set((s) => ({ misiones: { fecha: hoy, hechas: { ...actual.hechas, [m]: true } }, talentos: s.talentos + reglas.talentosPorMision, pasos: s.pasos + 10 }));
        return true;
      },
      terminarLeccion: (id, estrellas) =>
        set((s) => ({ lecciones: { ...s.lecciones, [id]: { estrellas: Math.max(estrellas, s.lecciones[id]?.estrellas ?? 0), fecha: claveDia() } } })),
      votarPulso: (dia, opcion) => set((s) => ({ pulso: { ...s.pulso, [dia]: opcion } })),
      reiniciar: () => set({ ...INICIAL, misiones: { fecha: claveDia(), hechas: {} } }),
    }),
    { name: "senda-usuario", storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

export function misionesDeHoy(m: Estado["misiones"]): Partial<Record<Mision, true>> {
  return m.fecha === claveDia() ? m.hechas : {};
}
