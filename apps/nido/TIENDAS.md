# Nido en Google Play: camino recomendado (verificado el 17-11-2026)

> No se empaquetó nada. Esto es el plan para el corte 3 (may–jul 2027). Lo marcado HECHO tiene fuente y fecha; lo marcado
> INFERENCIA es razonamiento propio; lo que dice «verificar» hay que mirarlo en la Play Console en el momento.

## 1. Recomendación: Capacitor, no Trusted Web Activity

**Decisión: empaquetar con Capacitor 8 (hoy 8.6.2, MIT) en el corte 3. La web instalable sigue siendo la misma base de código.**

| Necesidad del producto (funciones 4 a 6) | Trusted Web Activity (Bubblewrap 1.27.0) | Capacitor 8 |
|---|---|---|
| Compartir un comprobante desde Mercado Pago o el banco | Sí: Bubblewrap configura el Web Share Target del manifiesto (HECHO, README de Bubblewrap) | Sí: filtro de intención nativo + plugin |
| Widget en la pantalla de inicio | No lo trae (HECHO: el README no lo menciona). Habría que escribirlo a mano en el proyecto Android, que `bubblewrap update` pisa (HECHO: «files added manually… will be deleted or overwritten when update is executed») | Sí, con código nativo propio en el proyecto, que Capacitor no pisa |
| Leer el aviso del banco (servicio de notificaciones) | Igual que el widget: código nativo a mano | Sí, plugin nativo propio |
| Que el widget y el aviso del banco **lean y escriban los datos** | INFERENCIA: en una TWA los datos viven en el almacenamiento de Chrome; un servicio nativo de la app no puede leer ese IndexedDB | Los datos viven en el WebView de la propia app; un plugin los comparte con la parte nativa |
| Persistencia de los datos | Como en Chrome | HECHO (docs de Capacitor, guía Storage): IndexedDB «se puede marcar como persistido» en Android; en iOS el sistema puede reclamarlo. Para iPhone (corte 4) conviene SQLite nativo detrás de la misma capa `Store` |

**Por qué no empezar con TWA y cambiar después:** INFERENCIA: pasar de TWA a Capacitor cambia dónde están los datos
(Chrome → WebView propio). Habría que hacer una migración más para cada familia. Yendo directo a Capacitor, la familia
migra una sola vez (de la app vieja a Nido) y después solo actualiza.

**Regla de corte:** si en el corte 3 el widget y el aviso del banco se postergan, una TWA alcanza para estar en la tienda
rápido (solo compartir); en ese caso, decidirlo antes de la primera publicación, nunca después.

## 2. Requisitos actuales de Google Play para una app de finanzas personales

| Requisito | Qué dice hoy | Fuente (consultada el 17-11-2026) |
|---|---|---|
| Declaración de funciones financieras | **Obligatoria para todas las apps**, también las que no ofrecen funciones financieras («Even developers with apps that do not offer any financial features must complete this form»). Las categorías son préstamos, pagos, compras en cuotas propias, inversión y «servicios de apoyo» (asesoramiento, seguros, «otros»). **No hay una categoría «presupuesto personal»**: verificar en la consola si corresponde «Otros» o «no ofrece funciones financieras» (Nido no mueve plata, no presta, no asesora) | [Play Console Help 13849271](https://support.google.com/googleplay/android-developer/answer/13849271?hl=en) |
| Seguridad de los datos (Data safety) | Obligatoria para todas las apps, aunque no recolecten nada. Solo cuenta como «recolectado» lo que **sale del teléfono**: en el corte 0 y con datos solo locales, Nido no recolecta; desde el corte 1 (sincronización cifrada) sí, y se declara | [Play Console Help 10787469](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en) |
| Política de privacidad | Obligatoria (sin ella no se completa la sección de seguridad de los datos), con enlace público | misma fuente |
| Prueba cerrada para cuentas personales | Cuentas personales creadas **después del 13-11-2023**: prueba cerrada con **al menos 12 testers** con la prueba activa **14 días seguidos** antes de pedir producción (antes eran 20). La página dice «for their app» y **no aclara si se repite en cada app nueva**: hay que asumir que sí (INFERENCIA) | [Play Console Help 14151465](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) |
| Nivel de API | Desde el 31-08-2026, apps nuevas y actualizaciones con **Android 16 (API 36)** o más | [developer.android.com, target-sdk](https://developer.android.com/google/play/requirements/target-sdk) |
| Leer notificaciones de otras apps (aviso del banco) | La página de permisos sensibles (©2026) **no menciona** el acceso a notificaciones; sí exige pedir permisos sensibles solo para una función central, respetar el «no» y avisar de forma visible. Verificar de nuevo antes del corte 3; el producto ya lo prevé como función opcional (si la tienda no la acepta, quedan compartir y resumen) | [Play Console Help 16558241](https://support.google.com/googleplay/android-developer/answer/16558241?hl=en) |
| Borrar la cuenta | Solo aplica cuando haya cuentas (corte 1): la app y una página web tienen que permitir pedir el borrado | Política de datos de usuario de Play (verificar en el corte 1) |

## 3. Pasos

**Del fundador (dinero, cuentas y terceros, regla 8):**
1. Elegir el nombre (Alero o Nido) y pedir la búsqueda en el INPI (clases 9, 36 y 42).
2. Decidir con qué cuenta de desarrollador se publica. La cuenta «Senda App» es personal: si Nido sale desde ahí, el
   nombre del desarrollador que se ve en la tienda es el mismo para las dos apps y hace falta otra prueba de 12 testers.
   Alternativa: la cuenta de organización de la empresa del holding, que también hace falta para cobrar Nido Plus.
3. Conseguir 12 testers que se queden 14 días (puede ser la misma red de la prueba de Senda).
4. Dominio y página pública con la política de privacidad (Claude la redacta; se revisa con abogado, Ley 25.326).
5. Aprobar la publicación.

**De Claude (corte 3):**
1. Proyecto Capacitor 8 sobre `web/` (sin cambiar la app); íconos y pantalla de inicio desde `arte/`.
2. Plugin nativo para el widget, el filtro de intención para compartir y el servicio de notificaciones (opcional, con aviso visible).
3. Capa `Store` con almacenamiento persistido en Android (y SQLite nativo para iPhone en el corte 4), sin tocar pantallas.
4. Completar los formularios (funciones financieras, seguridad de los datos, permisos) listos para que el fundador los envíe.
5. Firma con Play App Signing; la clave de subida nunca entra al repositorio.
