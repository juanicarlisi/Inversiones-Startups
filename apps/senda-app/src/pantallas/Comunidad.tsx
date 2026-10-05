// Comunidad: el calendario de la semana Senda, Pulso, invitar amigos y ajustes. Grupos y cuentas llegan en la v1.
import { useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, TextInput, View } from "react-native";

import { Icono } from "../arte/Arte";
import { Boton, Fondo, Kicker, T, Vidrio } from "../componentes/base";
import { BarraSuperior } from "../componentes/momentos";
import { eventosDelDia } from "../datos/calendario";
import { pulsoDeHoy } from "../datos/pulso";
import { useUsuario } from "../estado/usuario";
import type { PropsTab } from "../navegacion";
import { color, fuente } from "../tema";
import { DIAS, DIAS_CORTOS, MESES, claveDia, semanaDe } from "../util/fechas";
import { haptica } from "../util/haptica";

export default function Comunidad(_: PropsTab<"Comunidad">) {
  const hoy = new Date();
  const [dia, setDia] = useState(hoy);
  const nombre = useUsuario((s) => s.nombre);
  const setNombre = useUsuario((s) => s.setNombre);
  const votos = useUsuario((s) => s.pulso);
  const votar = useUsuario((s) => s.votarPulso);
  const reiniciar = useUsuario((s) => s.reiniciar);
  const [confirmar, setConfirmar] = useState(false);
  const semana = semanaDe(hoy);
  const eventos = eventosDelDia(dia);
  const pulso = pulsoDeHoy(hoy);
  const voto = votos[claveDia(hoy)];

  return (
    <Fondo>
      <BarraSuperior izquierda={<T v="titulo" t={22}>Comunidad</T>} />
      <ScrollView contentContainerStyle={styles.cont} showsVerticalScrollIndicator={false}>
        <View style={styles.calCab}>
          <T v="titulo" t={18}>{MESES[dia.getMonth()][0].toUpperCase() + MESES[dia.getMonth()].slice(1)}</T>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[["Senda", color.ambar], ["Mía", color.violeta], ["Grupo", color.verde]].map(([n, c]) => (
              <View key={n} style={[styles.capa, { borderColor: c, backgroundColor: `${c}33` }]}>
                <T v="uiExtra" t={10.5}>{n}</T>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.tira}>
          {semana.map((d) => {
            const on = claveDia(d) === claveDia(dia);
            const esHoy = claveDia(d) === claveDia(hoy);
            return (
              <Pressable
                key={claveDia(d)}
                onPress={() => {
                  haptica.toque();
                  setDia(d);
                }}
                style={[styles.d, on && styles.dOn]}
              >
                <T v="uiBold" t={10} c={on ? color.noche : color.texto3}>{DIAS_CORTOS[d.getDay()]}</T>
                <T v="uiExtra" t={16} c={on ? color.noche : color.blanco}>{d.getDate()}</T>
                <View style={[styles.punto, { backgroundColor: esHoy && !on ? color.ambar : eventosDelDia(d)[0].color }]} />
              </Pressable>
            );
          })}
        </View>
        <Kicker c={color.texto2}>{`${DIAS[dia.getDay()]} ${dia.getDate()}`}</Kicker>
        {eventos.map((e) => (
          <View key={e.titulo} style={[styles.ev, { borderLeftColor: e.color }]}>
            <T v="uiExtra" t={13} c={e.color} style={{ width: 66 }}>{e.hora}</T>
            <View style={{ flex: 1 }}>
              <T v="uiExtra" t={15}>{e.titulo}</T>
              <T t={12.5} c={color.texto2}>{e.detalle}</T>
              <T t={11.5} c={color.texto3}>{e.capa === "senda" ? "Calendario de Senda" : e.capa === "grupo" ? "Calendario del grupo (ejemplo)" : "Mi calendario"}</T>
            </View>
          </View>
        ))}

        <Vidrio style={{ gap: 10 }}>
          <Kicker c="#7FDDEE">Pulso · la pregunta de hoy</Kicker>
          <T v="titulo" t={18}>{pulso.pregunta}</T>
          {pulso.opciones.map((o, k) => {
            const p = pulso.ejemplo[k];
            const elegido = voto === k;
            return (
              <Pressable
                key={o}
                disabled={voto !== undefined}
                onPress={() => {
                  haptica.firme();
                  votar(claveDia(hoy), k as 0 | 1);
                }}
                style={[styles.op, elegido && { borderColor: color.verdeClaro }]}
              >
                {voto !== undefined ? <View style={[styles.opBarra, { width: `${p}%`, backgroundColor: k === 0 ? color.verde : "rgba(255,255,255,0.18)" }]} /> : null}
                <T v="uiExtra" t={14.5} style={{ flex: 1 }}>{o}</T>
                {voto !== undefined ? <T v="uiExtra" t={14.5}>{`${p}%`}</T> : null}
              </Pressable>
            );
          })}
          <T t={11.5} c={color.texto3}>{voto !== undefined ? "Porcentajes de ejemplo: los reales llegan cuando haya cuentas." : "Tu respuesta es anónima."}</T>
        </Vidrio>

        <Vidrio style={styles.fila}>
          <Icono nombre="comunidad" tam={26} color={color.violeta} />
          <View style={{ flex: 1 }}>
            <T v="uiExtra" t={15}>Invita a un amigo</T>
            <T t={12.5} c={color.texto2}>Cuando tengamos cuentas, ganan los dos.</T>
          </View>
          <Boton chico tono="vidrio" icono="compartir" onPress={() => Share.share({ message: "Estoy probando Senda, una app para conocer la Biblia jugando. ¿Te sumas?" })} />
        </Vidrio>

        <Vidrio style={{ gap: 10 }}>
          <Kicker c={color.texto2}>Ajustes</Kicker>
          <T v="uiSemi" t={13.5} c={color.texto2}>¿Cómo te llamamos?</T>
          <TextInput
            value={nombre}
            onChangeText={(t) => setNombre(t.slice(0, 20))}
            placeholder="Tu nombre o apodo"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={styles.input}
          />
          {confirmar ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Boton chico tono="rojo" texto="BORRAR" onPress={() => { reiniciar(); setConfirmar(false); }} style={{ flex: 1 }} />
              <Boton chico tono="vidrio" texto="CANCELAR" onPress={() => setConfirmar(false)} style={{ flex: 1 }} />
            </View>
          ) : (
            <Pressable onPress={() => setConfirmar(true)}>
              <T v="uiBold" t={13} c={color.rojoClaro}>Reiniciar datos de prueba</T>
            </Pressable>
          )}
          <T t={11.5} c={color.texto3}>Versión de prueba (sprint 0). Todo queda guardado solo en este dispositivo.</T>
        </Vidrio>
      </ScrollView>
    </Fondo>
  );
}

const styles = StyleSheet.create({
  cont: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  calCab: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  capa: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  tira: { flexDirection: "row", gap: 6 },
  d: { flex: 1, alignItems: "center", paddingVertical: 7, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)" },
  dOn: { backgroundColor: "#fff" },
  punto: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  ev: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.07)", borderLeftWidth: 4 },
  op: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 46, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1.5, borderColor: "transparent", overflow: "hidden" },
  opBarra: { position: "absolute", left: 0, top: 0, bottom: 0 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: { fontFamily: fuente.uiBold, fontSize: 16, color: "#fff", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: color.borde },
});
