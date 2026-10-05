// Inicio: la semana a la vista, el versículo del día, seguir, misiones y la pantalla termina (sin feed infinito).
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";

import { Icono, Lani } from "../arte/Arte";
import { Barra, Boton, Fondo, Kicker, T, Vidrio } from "../componentes/base";
import { BarraSuperior, useCelebracion } from "../componentes/momentos";
import { cargarBiblia, limpiarVersiculo, referencia, VERSIONES } from "../datos/biblia";
import { eventosDelDia } from "../datos/calendario";
import { LECCION_CREACION } from "../datos/leccion";
import { versiculoDeHoy } from "../datos/versiculos";
import { misionesDeHoy, useUsuario, type Mision } from "../estado/usuario";
import type { PropsTab } from "../navegacion";
import { color, reglas } from "../tema";
import { DIAS, DIAS_CORTOS, MESES, claveDia, saludo, semanaDe } from "../util/fechas";

const MISIONES: { id: Mision; texto: string; color: string }[] = [
  { id: "leer", texto: "Lee un capítulo de la Biblia", color: color.verde },
  { id: "escuchar", texto: "Escucha el versículo del día", color: color.oro },
  { id: "leccion", texto: "Completa una lección de la Travesía", color: "#3D7BFF" },
];

export default function Inicio({ navigation }: PropsTab<"Inicio">) {
  const hoy = new Date();
  const nombre = useUsuario((s) => s.nombre);
  const version = useUsuario((s) => s.version);
  const ultimaLectura = useUsuario((s) => s.ultimaLectura);
  const misiones = misionesDeHoy(useUsuario((s) => s.misiones));
  const lecciones = useUsuario((s) => s.lecciones);
  const completarMision = useUsuario((s) => s.completarMision);
  const mostrar = useCelebracion((s) => s.mostrar);
  const ref = useMemo(() => versiculoDeHoy(hoy), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [texto, setTexto] = useState<string | null>(null);
  const abrev = VERSIONES.find((v) => v.id === version)?.abrev ?? "";

  useEffect(() => {
    let vivo = true;
    cargarBiblia(version).then((b) => {
      const libro = b.libros.find((l) => l.id === ref.libro);
      const t = libro?.caps[ref.cap - 1]?.[ref.vers - 1] ?? "";
      if (vivo) setTexto(limpiarVersiculo(t, ref.libro, ref.cap, ref.vers));
    });
    return () => {
      vivo = false;
    };
  }, [version, ref]);

  const noche = hoy.getHours() >= 23 || hoy.getHours() < 5;
  const semana = semanaDe(hoy);
  const eventos = eventosDelDia(hoy);
  const hechas = Object.keys(misiones).length;
  const leccionHecha = !!lecciones[LECCION_CREACION.id];

  const escuchar = () => {
    if (!texto) return;
    Speech.stop();
    Speech.speak(`${texto}. ${referencia(ref.libro, ref.cap, ref.vers)}.`, { language: "es-ES", rate: 0.95 });
    if (completarMision("escuchar")) mostrar({ titulo: "¡Misión cumplida!", detalle: "Escuchaste el versículo del día", talentos: reglas.talentosPorMision });
  };

  return (
    <Fondo>
      <BarraSuperior />
      <ScrollView contentContainerStyle={styles.cont} showsVerticalScrollIndicator={false}>
        <View style={styles.hola}>
          <View style={{ flex: 1 }}>
            <Kicker>{`${DIAS[hoy.getDay()]} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`}</Kicker>
            <T v="titulo" t={26} style={{ marginTop: 2 }}>
              {`¡${saludo(hoy)}${nombre ? `, ${nombre}` : ""}!`}
            </T>
            {noche ? <T t={13.5} c={color.texto2}>Ya es tarde: un versículo y a descansar.</T> : null}
          </View>
          <Lani pose={noche ? "dormida" : "saludo"} tuLani tam={78} />
        </View>

        <View style={styles.tira}>
          {semana.map((d) => {
            const esHoy = claveDia(d) === claveDia(hoy);
            const ev = eventosDelDia(d)[0];
            return (
              <View key={claveDia(d)} style={[styles.dia, esHoy && styles.diaHoy]}>
                <T v="uiBold" t={10} c={esHoy ? color.tintaAmbar : color.texto3}>
                  {DIAS_CORTOS[d.getDay()]}
                </T>
                <T v="uiExtra" t={15} c={esHoy ? color.tintaAmbar : color.blanco}>
                  {d.getDate()}
                </T>
                <View style={[styles.punto, { backgroundColor: esHoy ? color.tintaAmbar : ev.color }]} />
              </View>
            );
          })}
        </View>
        {eventos.map((e) => (
          <Pressable key={e.titulo} onPress={() => navigation.navigate("Comunidad")} style={[styles.evento, { borderLeftColor: e.color, backgroundColor: `${e.color}22` }]}>
            <T v="uiExtra" t={12.5} c={e.color}>
              {e.hora}
            </T>
            <T v="uiBold" t={13.5} style={{ flex: 1 }}>
              {e.titulo}
            </T>
          </Pressable>
        ))}

        <View style={styles.vd}>
          <Kicker c="#6B3F00">Versículo del día</Kicker>
          <T v="bibliaSemi" t={18} c={color.tintaAmbar} style={{ marginVertical: 8, lineHeight: 26 }}>
            {texto ? `«${texto}»` : " "}
          </T>
          <View style={styles.vdPie}>
            <T v="uiBold" t={12.5} c="#5A3500">{`${referencia(ref.libro, ref.cap, ref.vers)} · ${abrev}`}</T>
            <View style={{ flexDirection: "row", gap: 18 }}>
              <Pressable onPress={escuchar} hitSlop={10} accessibilityLabel="Escuchar el versículo">
                <Icono nombre="parlante" tam={22} color="#5A3500" />
              </Pressable>
              <Pressable
                hitSlop={10}
                accessibilityLabel="Compartir el versículo"
                onPress={() => Share.share({ message: `«${texto}» — ${referencia(ref.libro, ref.cap, ref.vers)} (${abrev})\n\nLo leí hoy en Senda.` })}
              >
                <Icono nombre="compartir" tam={22} color="#5A3500" />
              </Pressable>
            </View>
          </View>
        </View>

        <Vidrio style={styles.fila}>
          <View style={styles.circulo}>
            <Icono nombre="biblia" tam={22} color={color.verde} />
          </View>
          <View style={{ flex: 1 }}>
            <Kicker c="#86E5B8">{ultimaLectura ? "Seguir leyendo" : "Empezar a leer"}</Kicker>
            <T v="uiExtra" t={15}>
              {ultimaLectura ? referencia(ultimaLectura.libro, ultimaLectura.cap) : "Juan 1"}
            </T>
          </View>
          <Boton tono="verde" icono="tri" redondo={46} etiqueta="Abrir la Biblia" onPress={() => navigation.navigate("Lector", ultimaLectura ?? { libro: "JHN", cap: 1 })} />
        </Vidrio>

        <Vidrio style={styles.fila}>
          <View style={styles.circulo}>
            <Icono nombre="travesia" tam={22} color="#8FB5FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Kicker c="#8FB5FF">Travesía · Fundamentos</Kicker>
            <T v="uiExtra" t={15}>
              {leccionHecha ? "La creación · Repasar" : "La creación · Lección 1"}
            </T>
          </View>
          <Boton tono="ambar" icono="tri" redondo={46} etiqueta="Empezar la lección" onPress={() => navigation.navigate("Leccion")} />
        </Vidrio>

        <Vidrio>
          <View style={styles.misCab}>
            <Kicker>Misiones de hoy</Kicker>
            <T v="uiExtra" t={12.5} c={color.texto2}>{`${hechas} de 3`}</T>
          </View>
          {MISIONES.map((m) => {
            const ok = !!misiones[m.id];
            return (
              <View key={m.id} style={styles.mision}>
                <View style={[styles.check, ok && { backgroundColor: m.color, borderColor: m.color }]}>{ok ? <Icono nombre="check" tam={14} color="#fff" /> : null}</View>
                <T v="uiSemi" t={13.5} c={ok ? color.texto2 : color.blanco} style={{ flex: 1 }}>
                  {m.texto}
                </T>
                <View style={{ width: 70 }}>
                  <Barra p={ok ? 100 : 0} c={m.color} alto={7} />
                </View>
                <View style={{ width: 24, alignItems: "flex-end" }}>
                  {ok ? <Icono nombre="check" tam={16} color={color.oro} /> : <T v="uiExtra" t={12} c={color.oro}>{`${reglas.talentosPorMision}`}</T>}
                </View>
              </View>
            );
          })}
        </Vidrio>

        <View style={styles.dos}>
          <Pressable style={[styles.tile, { borderColor: `${color.ambar}88`, backgroundColor: `${color.ambar}22` }]} onPress={() => navigation.navigate("Jugar")}>
            <Icono nombre="jugar" tam={24} color={color.ambar} />
            <T v="uiExtra" t={13.5}>Ruleta de Espadeo</T>
          </Pressable>
          <Pressable style={[styles.tile, { borderColor: "#17B3D188", backgroundColor: "#17B3D122" }]} onPress={() => navigation.navigate("Comunidad")}>
            <Icono nombre="grafico" tam={24} color="#7FDDEE" />
            <T v="uiExtra" t={13.5}>Pulso de hoy</T>
          </Pressable>
        </View>
        <T t={12} c={color.texto3} style={{ textAlign: "center", marginTop: 8 }}>
          Eso es todo por hoy. Sin scroll infinito.
        </T>
      </ScrollView>
    </Fondo>
  );
}

const styles = StyleSheet.create({
  cont: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  hola: { flexDirection: "row", alignItems: "flex-end", marginBottom: -8 },
  tira: { flexDirection: "row", gap: 6 },
  dia: { flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)" },
  diaHoy: { backgroundColor: color.ambar, shadowColor: color.ambarSombra, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 0, height: 3 } },
  punto: { width: 5, height: 5, borderRadius: 3, marginTop: 3 },
  evento: { flexDirection: "row", alignItems: "center", gap: 10, borderLeftWidth: 3, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  vd: {
    backgroundColor: color.ambar,
    borderRadius: 20,
    padding: 16,
    shadowColor: color.ambarSombra,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  vdPie: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  circulo: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  misCab: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  mision: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  dos: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 18, borderWidth: 1 },
});
