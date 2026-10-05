// Vibraciones cortas y con intención (capítulo 19, coreografía de cada momento). En la web no hacen nada.
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const activo = Platform.OS !== "web";

export const haptica = {
  toque: () => activo && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  firme: () => activo && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  acierto: () => activo && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  error: () => activo && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
  premio: () => activo && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}),
};
