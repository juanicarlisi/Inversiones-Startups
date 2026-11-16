# Parte 10: Desarrollo mobile (Android e iOS). Notas por día.
Contexto: el estudiante ya sabe SO (incluye Android/iOS a nivel de sistema en la Parte 2: procesos, sandbox, permisos, APK por dentro en 02-31), programación, frontend con React (Parte 6), backend, APIs y bases (Partes 7–9). Esta parte es la app móvil de punta a punta y es la más cercana a Senda. LÍMITES DEL ENTORNO: no hay teléfono, ni emulador con aceleración, ni macOS/Xcode, ni cuentas de Play/App Store/Expo/Firebase. Qué SÍ se puede correr: Node 22 y npm (crear una app Expo mínima en un directorio nuevo del scratchpad con `npx create-expo-app` y `EXPO_OFFLINE=1`; `expo.dev` y `api.expo.dev` están bloqueados; `npx expo prebuild` genera `android/` e `ios/` para leerlos; `npx expo export` genera bundles; Metro/Hermes como en 04-19), OpenJDK 21/17, Gradle (probá si el SDK de Android se puede bajar con `sdkmanager`: si baja liviano, `aapt2`/`apkanalyzer`/`bundletool`/`apksigner`/`keytool`/`d8` permiten inspeccionar y firmar un APK de práctica; si no, usá `keytool` + `jarsigner`/`unzip` sobre un APK propio mínimo y rotulá), kotlinc y Swift para Linux (lenguaje sí, UIKit/SwiftUI no), react-native-web con Playwright para ver componentes. Todo lo de iOS, tiendas y dispositivos reales va por documentación oficial FECHADA (developer.android.com, developer.apple.com, reactnative.dev, docs.expo.dev, firebase.google.com, support.google.com/googleplay/android-developer) y rotulado «según la documentación, no corrido». Verificá versiones vigentes al 16-11-2026 (Android 17? nivel de API objetivo exigido por Play, iOS 27?, React Native, Expo SDK) en fuente oficial; no las des por sabidas. Cuidá el disco compartido (`df -h`; nada de descargas de varios GB sin chequear; borrá por ruta exacta al terminar) y usá puertos propios (22xxx). `rm` con comodines y `pkill`/`kill` por patrón están bloqueados.
SENDA es el caso real en casi todos los días (bloque `senda` breve y verificado donde aplique; los días 10-35 y 10-36 son enteros de Senda): Expo SDK 57, React Native 0.86.3, React 19.2.3, Hermes, React Navigation 7, zustand + AsyncStorage 2.2.0, Reanimated 4, Rive, expo-gl/three, react-native-audio-api, expo-notifications con FCM, AdMob, sin expo-updates (sin OTA), sin compras conectadas, `versionCode` fijo en 41, workflows `apk.yml`/`aab.yml`/`humo.yml`/`firma.yml`, `app.json`, sin carpetas `android/` ni `ios/` versionadas (se generan con prebuild). Fuentes de verdad: /home/user/senda-app (solo lectura, sin npm install) y `senda/mapa-tecnico.md`; el código manda. Hallazgos ya conocidos que se pueden citar con verificación propia: `allowBackup="true"`, sin `SCHEDULE_EXACT_ALARM`, `SYSTEM_ALERT_WINDOW` heredado, token de sesión en AsyncStorage, `aab.yml` sin AdMob ni validadores, 10 fuentes `.ttf` (2,3 MB), APK de 89,1 MB, `LANY_3D = false`.

## 10-01 Cómo funciona una app móvil: tres caminos
Nativa, híbrida (WebView), multiplataforma (RN, Flutter, KMP): qué corre dónde, qué se comparte, costos; cuota de Android/iOS en el mundo y en Argentina (StatCounter con fecha); qué es «la app» en el teléfono (retomá [@02-29]..[@02-31]). Senda: cuál de los tres caminos es y por qué (decisión documentada si existe).

## 10-02 Android I: arquitectura
Capas (kernel Linux, HAL, ART, framework, apps), Zygote, Binder, ART (AOT/JIT, perfiles), el APK instalado (retomá [@02-31]). Doc oficial de la plataforma. Mostrá lo que se pueda (estructura de un APK propio).

## 10-03 Android II: componentes y manifiesto
Activity, Service, BroadcastReceiver, ContentProvider, Intent (explícito/implícito), filtros, `AndroidManifest.xml` real: generá uno con `expo prebuild` en una app mínima y leelo línea por línea. Senda: su manifiesto generado (hallazgos conocidos).

## 10-04 Kotlin y Jetpack Compose
Kotlin en Android (null safety, corrutinas: retomá [@03-50]), Compose (UI declarativa, funciones componibles, recomposición: paralelos con React de [@06-17]..[@06-20]), XML Views como historia. Corré Kotlin con kotlinc; Compose solo doc.

## 10-05 iOS I: arquitectura
Capas de iOS (Darwin/XNU, Core OS, Core Services, Media, Cocoa Touch), bundle `.app`, sandbox, firma obligatoria, Swift runtime y ARC (retomá [@03-51], [@02-27]..[@02-30]). Solo doc de Apple; rotulado.

## 10-06 iOS II: UIKit, SwiftUI y el ciclo de vida
UIKit vs SwiftUI, AppDelegate/SceneDelegate, `@State`, estados de la app en iOS. Swift corrido en Linux para el lenguaje; UI por doc.

## 10-07 El ciclo de vida de una app móvil
Primer plano, segundo plano, suspendida, terminada por el sistema; por qué se pierde el estado; restauración; diferencias Android/iOS; `AppState` de React Native. Senda: qué guarda y cuándo (`src/util/almacen.ts` con lotes de 400 ms; `AppState` en `App.tsx`: verificá).

## 10-08 Nativo, híbrido y multiplataforma: la comparativa
Cordova/Capacitor, Kotlin Multiplatform, .NET MAUI, RN, Flutter: matriz honesta (rendimiento, acceso a APIs, equipo, contratación, riesgo de plataforma), datos con fecha (encuestas). Sin «mejor».

## 10-09 Flutter y Dart
Dart, árbol de widgets, motor propio (Impeller), compilación AOT, canales de plataforma. Instalá Dart si baja liviano y corré un programa; Flutter completo solo si no pesa demasiado (chequeá disco): si no, doc.

## 10-10 React Native I: qué es y cómo funciona
JS + vistas nativas reales (no WebView), hilo de JS, hilo de UI, módulos nativos, Hermes y bytecode (retomá [@03-43], [@04-19]), Metro. Mostrá con una app mínima: bundle, `hermesc`, árbol de vistas vía react-native-web como aproximación (rotulado).

## 10-11 React Native II: la arquitectura nueva
El puente viejo y sus límites, JSI, Fabric, TurboModules, Codegen, Yoga (layout flex: retomá [@06-06]), estado de adopción con fecha (reactnative.dev/blog). Senda: `newArchEnabled` en su `app.json`/versión (verificá).

## 10-12 Expo: el sistema alrededor de React Native
Qué es Expo (SDK, módulos, CLI), prebuild (config plugins), dev client vs Expo Go, EAS (Build/Submit/Update: precios con fecha), `app.json`. Corré `create-expo-app` + `prebuild` y mostrá qué genera. Senda: su `app.json` y plugins reales; por qué compila con GitHub Actions y no EAS (verificá en `apk.yml` y CLAUDE.md de la app).

## 10-13 Componentes visuales y estilos en React Native
`View`, `Text`, `Image`, `ScrollView`, `FlatList`, `Pressable`, `StyleSheet`, flexbox con dirección por defecto columna, densidad de píxeles (dp/pt), SafeArea, diferencias entre plataformas (`Platform.select`). Senda: `src/componentes/base.tsx` y `useEstilos` (verificá).

## 10-14 Navegación móvil
Pila, pestañas, modales, gesto Atrás (Android) y deslizar (iOS), enlaces profundos (esquema propio, App Links/Universal Links: doc), React Navigation vs Expo Router. Senda: React Navigation 7, 34 pantallas + 5 pestañas, `senda://unirme/…` con regex (retomá [@06-25]).

## 10-15 Estado y datos en el teléfono
Dónde vive el estado (memoria, AsyncStorage, MMKV, SecureStore/Keystore/Keychain, archivos), persistencia con zustand `persist`, migraciones de estado, límites (6 MB de AsyncStorage en Android). Senda: 21 stores con persist, `almacen.ts`, `migrate` sin validar (hallazgos conocidos).

## 10-16 Bases locales y apps offline-first
SQLite en el móvil (expo-sqlite, WatermelonDB, Realm: doc), offline-first, cola de salida, sincronización y conflictos (último gana, por campo, CRDT a nivel de idea). Demo de cola + conflicto en Node. Senda: bandeja de salida de `nube.ts` y `progreso_nube` (verificá cómo resuelve conflictos).

## 10-17 Permisos móviles
Permisos de instalación vs tiempo de ejecución, flujo de pedido y rechazo, justificación (iOS `Info.plist` usage strings), privacidad de plataforma (etiquetas de privacidad, Data safety de Play, ATT de iOS). Senda: permisos reales del manifiesto generado y cuáles sobran (hallazgos).

## 10-18 Notificaciones push I: cómo viajan
App → token → servidor → FCM/APNs → dispositivo; token de dispositivo, carga útil, datos vs notificación, Expo Push como intermediario. Senda: `registrarPush`, tabla de tokens, `enviar_avisos` con `pg_net` (retomá [@08-11]; a lo sumo una vez).

## 10-19 Notificaciones push II: locales, canales y entregabilidad
Notificaciones locales programadas, canales de Android, permiso POST_NOTIFICATIONS (Android 13+), alarmas exactas, Doze y fabricantes que matan apps (dontkillmyapp.com como referencia), entregabilidad. Senda: `src/util/avisos.ts` y `reprogramarAvisos` (sin prueba; sin `SCHEDULE_EXACT_ALARM`).

## 10-20 Segundo plano, batería y límites del sistema
Por qué el SO limita el segundo plano, WorkManager, servicios en primer plano, Background App Refresh/BGTaskScheduler en iOS, Doze y App Standby. Senda: qué hace en segundo plano (casi nada: verificá; widget de Android).

## 10-21 Hardware: cámara, GPS, sensores y biometría
APIs de ubicación (precisa/aproximada), cámara, sensores, biometría (BiometricPrompt, Face ID) y almacenamiento seguro. Solo doc + módulos Expo. Senda: qué hardware usa (vibración, audio; ubicación solo vía texto/Nominatim: verificá).

## 10-22 Animaciones y gráficos de alto rendimiento
Por qué animar en el hilo de UI, Reanimated y worklets, Gesture Handler, Skia, GL/three, Rive (máquinas de estado), 60/120 Hz (retomá [@06-36], [@06-14]). Senda: `Libro.tsx` (worklets), Rive (`rive/lany/`, director), Lany 3D apagado, Skia retirado por regla de corte.

## 10-23 Audio y multimedia en el móvil
Sesión de audio (iOS), audio focus (Android), reproducción en segundo plano, latencia, formatos, mezcla. Senda: `src/sonido.ts` sobre react-native-audio-api, sonidos agendados, música que baja al 45 %.

## 10-24 Firma de apps y certificados
Por qué se firma, keystore y `keytool`, esquemas de firma APK v1–v4, Play App Signing (clave de subida vs clave de firma), en iOS certificados + perfiles de aprovisionamiento. Corré `keytool` + `apksigner`/`jarsigner` sobre un APK de práctica con claves de práctica. Retomá [@05-23]. Senda: `firma.yml`, secretos del keystore (sin valores).

## 10-25 Qué es un APK, un AAB y un IPA
APK por dentro (retomá [@02-31]): DEX, recursos, `lib/` por ABI, manifiesto binario; AAB y bundletool (splits por ABI/densidad/idioma); IPA. Inspeccioná un APK propio. Senda: 89,1 MB y qué pesa (`docs/PESO.md`).

## 10-26 Cómo se compila una app móvil
Gradle (tareas, variantes), compilación JS → Hermes, recursos, DEX (d8), R8 (minificar/ofuscar/shrink), Xcode/xcodebuild, EAS Build vs CI propio. Senda: `apk.yml` paso a paso (tiempos reales si están en los logs o docs), R8 con prueba de humo.

## 10-27 Google Play: cuentas, pistas y revisión
Cuenta de desarrollador (USD 25, verificación de identidad, requisito de 12 testers por 14 días para cuentas personales: verificá vigencia), pistas (interna, cerrada, abierta, producción), lanzamiento escalonado, políticas, Data safety, nivel de API objetivo exigido. Senda: `docs/TIENDAS.md` y pendientes del fundador (sin presionar).

## 10-28 Apple App Store: programa, TestFlight y revisión
Apple Developer Program (USD 99/año), TestFlight, App Review Guidelines, etiquetas de privacidad, requisitos de Xcode/SDK. Solo doc con fecha. Senda: sin build de iOS todavía (verificá).

## 10-29 Actualizaciones: tienda y OTA
Actualización por tienda (tiempos de revisión), in-app updates, OTA (expo-updates/CodePush retirado: verificá), qué se puede y qué no por OTA (solo JS/activos; políticas de tiendas), versiones mínimas. Senda: sin expo-updates; «cada APK trae todo»; implicancias.

## 10-30 Compatibilidad entre dispositivos y versiones
Nivel de API (min/target/compile), distribución de versiones de Android (fuente oficial con fecha), fragmentación, densidades y tamaños, ABIs, iOS (adopción rápida). Senda: min/target SDK reales del prebuild y prueba en pantallas chicas (360×800).

## 10-31 Monetización I: publicidad móvil
Cómo funciona la publicidad in-app (subasta, eCPM, fill rate, formatos), AdMob, mediación, consentimiento (UMP, GDPR, ATT), `app-ads.txt`, políticas para público joven. Números solo con fuente y fecha, rotulados; sin promesas de ingresos. Senda: `admob.ts`, `pausaAnuncio.ts`, cartel simulado, IDs como variables.

## 10-32 Monetización II: suscripciones y compras dentro de la app
Play Billing, StoreKit, comisión (15/30 % y cambios regulatorios: verificá con fecha), validación de recibos en servidor, RevenueCat, estados de una suscripción. Senda: función `compras` escrita y sin llamar; planes como interruptor local (hallazgos); propuesta de precios pendiente de decisión del fundador (no opinar).

## 10-33 Rendimiento y calidad móvil
Tiempo de arranque (frío/tibio), ANR, tasa libre de fallos, Android vitals, perfiladores, reportes de fallos (Crashlytics/Sentry: doc). Senda: guardia y pantalla de fallo propias, sin reporte remoto, carga diferida, `docs/PESO.md`.

## 10-34 Del código al teléfono: el viaje completo
Integración: de `git push` a la app abierta en un teléfono (compilación, firma, subida, revisión, descarga, instalación, primer arranque), con vínculos [@id] a los días de la parte.

## 10-35 La app Senda por dentro: de App.tsx a la pantalla (tipo S)
Arranque real (`index.ts` guardia → `App.tsx`: fuentes, datos guardados, navegación, bienvenida), stores, capa de arte y audio, director de Lany; ≥2 bloques `senda`, ≥4 archivos reales; todo verificado en el código.

## 10-36 Cómo se publica y actualiza Senda (tipo S)
`apk.yml`, `aab.yml`, `humo.yml`, `firma.yml`, `supabase.yml`: qué hace cada uno, versión de compilación, qué falta para tienda (hallazgos: `aab.yml` sin AdMob ni validadores, `versionCode` fijo); ≥2 bloques `senda`, ≥4 archivos reales.

## 10-37 Cierre de la Parte 10: la app móvil de punta a punta (tipo R)
Mapa móvil, caso recorrido, tabla «pregunta típica → día», 8–12 preguntas. Al final.
