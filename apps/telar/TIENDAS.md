# Telar en Google Play: camino recomendado

> 17-11-2026. Nada de esto se ejecutó: no se empaquetó, no se creó ninguna cuenta ni se publicó (regla 8). Lo marcado como HECHO
> se verificó ese día en la fuente que se cita.

## La recomendación

**Capacitor 8, Android primero, en el corte 4 (sep–dic 2027).** No conviene pasar antes por una Trusted Web Activity (TWA) con
Bubblewrap: lo que el corte 4 promete (el widget «Hoy» y los avisos) no se puede hacer bien desde una TWA sin un servidor, y Telar
está pensado para no tenerlo.

| Lo que Telar necesita | TWA con Bubblewrap | Capacitor |
|---|---|---|
| Mismo código que la web | Sí: abre la PWA publicada | Sí: la misma carpeta `dist/` adentro de la app |
| Datos en el dispositivo | En el almacenamiento de Chrome; la app nativa «no tiene acceso directo al contenido web ni a ningún estado web» (HECHO, developer.chrome.com/docs/android/trusted-web-activity) | En el WebView propio de la app |
| Widget «Hoy» en la pantalla de inicio | Un widget es nativo y no puede leer el plan guardado en Chrome (INFERENCIA de lo anterior) | El plan escribe el resumen de hoy con Preferences, que en Android usa SharedPreferences (HECHO, capacitorjs.com/docs/apis/preferences, v8); un widget nativo lo lee |
| Avisos sin servidor (recordatorios) | Solo notificaciones web (push), que necesitan un servidor que las mande | Local Notifications agenda avisos «sin un servidor que envíe push» (HECHO, capacitorjs.com/docs/apis/local-notifications, v8); Android 12+ pide `SCHEDULE_EXACT_ALARM` para la hora exacta y Android 13 el permiso de notificaciones |
| Requisitos extra | Publicar la PWA en un dominio propio y verificarlo con Digital Asset Links (la app y el sitio «del mismo desarrollador») | Ninguno: la app lleva sus archivos |
| Herramienta | `@bubblewrap/cli` 1.27.0 (npm, 09-10-2026), Apache-2.0, Node 18+; su README aclara «not an officially supported Google product» | `@capacitor/core` y `@capacitor/android` 8.6.2 (npm, 16-11-2026), `@capacitor/local-notifications` 8.3.1, MIT |

**Cuándo sí una TWA:** si se quisiera estar en Play antes del corte 4 solo para que la busquen ahí (sin widget ni avisos). No se
recomienda: suma un dominio y un trámite de verificación para algo que la PWA instalable ya da.

**Ojo con la mudanza web → app:** con Capacitor los datos viven en la app, separados del navegador. La persona que use la web
pasa sus datos con la copia en archivo (ya funciona) o, desde el corte 3, con la sincronización cifrada.

## Lo que pide Google Play hoy (HECHO, ayuda oficial de Play Console, consultada el 17-11-2026)

- **Cuentas personales creadas después del 13-11-2023:** antes de publicar en producción tienen que «run a closed test for their app
  with a minimum of 12 testers who have been opted in continuously for at least 14 days»; si alguien sale y vuelve, los 14 días tienen
  que ser seguidos. Después se pide el acceso a producción desde el Panel («Apply for production», tres bloques de preguntas) y la
  revisión «usually takes seven days or less» (support.google.com/googleplay/android-developer/answer/14151465).
- **¿Por cada app nueva?** El artículo habla de «their app» pero no dice si se repite por app o una vez por cuenta. Supuesto prudente
  (HIPÓTESIS a confirmar en la consola): se repite por cada app nueva.
- **Cuentas de organización:** el artículo de la prueba cerrada no las menciona; el requisito se escribe solo para cuentas
  personales, así que (INFERENCIA) una cuenta de organización no lo tiene. Crear una cuenta de organización exige un número
  **D-U-N-S** («To create a developer account for an organization, you must provide a D-U-N-S number»), que Dun & Bradstreet da
  gratis; Google advierte sobre terceros que cobran por tramitarlo (support.google.com/googleplay/android-developer/answer/13634885).
- **Para el holding:** hay una cuenta de Play creada para Senda. Si es personal y posterior a noviembre de 2023, Telar tendría su
  propia prueba cerrada de 12 personas por 14 días. Si para entonces existe la empresa del holding (prevista antes de cobrar, feb-2027),
  conviene una cuenta de organización con D-U-N-S: sin la prueba cerrada y con los cobros a nombre de la empresa. Es decisión del
  fundador (plata, cuenta y terceros).

## Pasos

**Del fundador (cuando llegue el corte 4; ninguno ahora):**
1. Elegir con qué cuenta de Play sale Telar: la personal ya creada o una de organización (D-U-N-S gratis + empresa del holding).
2. Si es personal: juntar 12 personas para la prueba cerrada durante 14 días seguidos (pueden ser las de las entrevistas del corte 1).
3. Aprobar la ficha de la tienda, la política de privacidad (Telar no junta datos: todo queda en el teléfono) y la publicación.

**De Claude (todo listo para apretar el botón):**
1. Proyecto Capacitor sobre `dist/` (`npx cap add android`), con los íconos que ya están en `src/iconos/` (también el adaptable).
2. Avisos locales (Local Notifications) y el widget «Hoy» nativo leyendo el resumen que escribe la app con Preferences.
3. Compilación del paquete firmado en GitHub Actions (sin subirlo), con la prueba de punta a punta corriendo antes.
4. Ficha de la tienda, capturas, política de privacidad y el formulario de seguridad de los datos («no se recopilan datos»), y la
   guía para los 12 de la prueba cerrada.
5. Volver a verificar en la ayuda de Play Console, el día que se haga, todo lo de arriba (cambia seguido).
