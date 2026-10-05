import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RaizParams = {
  Tabs: undefined;
  Lector: { libro: string; cap: number; vers?: number };
  Leccion: undefined;
};

export type TabsParams = { Inicio: undefined; Biblia: undefined; Travesia: undefined; Jugar: undefined; Comunidad: undefined };

export type PropsRaiz<K extends keyof RaizParams> = NativeStackScreenProps<RaizParams, K>;
export type PropsTab<K extends keyof TabsParams> = CompositeScreenProps<BottomTabScreenProps<TabsParams, K>, NativeStackScreenProps<RaizParams>>;
