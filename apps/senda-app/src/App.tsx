// Raíz de Senda: tipografías, navegación (5 pestañas + pantallas completas) y la capa de celebraciones.
import { Literata_400Regular } from "@expo-google-fonts/literata/400Regular";
import { Literata_400Regular_Italic } from "@expo-google-fonts/literata/400Regular_Italic";
import { Literata_600SemiBold } from "@expo-google-fonts/literata/600SemiBold";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { Unbounded_700Bold } from "@expo-google-fonts/unbounded/700Bold";
import { Unbounded_800ExtraBold } from "@expo-google-fonts/unbounded/800ExtraBold";
import { Unbounded_900Black } from "@expo-google-fonts/unbounded/900Black";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { CapaCelebracion } from "./componentes/momentos";
import { TabBar } from "./componentes/TabBar";
import type { RaizParams, TabsParams } from "./navegacion";
import Biblia from "./pantallas/Biblia";
import Comunidad from "./pantallas/Comunidad";
import Inicio from "./pantallas/Inicio";
import Jugar from "./pantallas/Jugar";
import Leccion from "./pantallas/Leccion";
import Lector from "./pantallas/Lector";
import Travesia from "./pantallas/Travesia";
import { color } from "./tema";

SplashScreen.preventAutoHideAsync().catch(() => {});

const Pila = createNativeStackNavigator<RaizParams>();
const Pestanas = createBottomTabNavigator<TabsParams>();

const tema = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: color.noche, card: color.noche, text: "#fff", primary: color.ambar } };

function Tabs() {
  return (
    <Pestanas.Navigator tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Pestanas.Screen name="Inicio" component={Inicio} />
      <Pestanas.Screen name="Biblia" component={Biblia} />
      <Pestanas.Screen name="Travesia" component={Travesia} />
      <Pestanas.Screen name="Jugar" component={Jugar} />
      <Pestanas.Screen name="Comunidad" component={Comunidad} />
    </Pestanas.Navigator>
  );
}

export default function App() {
  const [listas] = useFonts({
    Unbounded_700Bold,
    Unbounded_800ExtraBold,
    Unbounded_900Black,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_600SemiBold,
  });

  useEffect(() => {
    if (listas) SplashScreen.hideAsync().catch(() => {});
  }, [listas]);

  if (!listas) return <View style={{ flex: 1, backgroundColor: color.noche }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={tema}>
        <Pila.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.noche } }}>
          <Pila.Screen name="Tabs" component={Tabs} />
          <Pila.Screen name="Lector" component={Lector} options={{ animation: "slide_from_right" }} />
          <Pila.Screen name="Leccion" component={Leccion} options={{ animation: "slide_from_bottom", gestureEnabled: false }} />
        </Pila.Navigator>
      </NavigationContainer>
      <CapaCelebracion />
    </SafeAreaProvider>
  );
}
