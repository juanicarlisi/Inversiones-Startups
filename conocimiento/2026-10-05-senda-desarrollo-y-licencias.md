# Bitácora 05-10-2026 · Senda: RVR1960, nombre y arranque del desarrollo

Contexto: el fundador tomó las 16 decisiones del proyecto v2 (DEC-2026-10-05-1), pidió ver a fondo si se puede usar la RVR1960 sin
licencia, verificar el nombre «Senda» y empezar a desarrollar sin gastar. Datos obtenidos vía buscador (la red del entorno bloqueó la
lectura directa de sba.org.ar, bibles.com, platform.youversion.com, care.api.bible, expo.dev y los registros de dominios).
Confianza: A = fuente primaria o varias concordantes; B = una fuente secundaria confiable; C = indicio a verificar.

## Reina-Valera 1960

| Dato | Fuente | Fecha | Confianza |
|---|---|---|---|
| Texto © Sociedades Bíblicas en América Latina 1960; renovado © Sociedades Bíblicas Unidas 1988; «Reina-Valera 1960» es marca registrada y solo se usa con licencia | Avisos de derechos en BibleGateway, thebible.org y política de la Sociedad Bíblica Argentina (vía buscador) | consultado 05-10-2026 | A |
| Se pueden citar hasta 500 versículos sin permiso escrito, si no son el 50% de un libro, con el aviso de derechos | Política de derechos de las Sociedades Bíblicas / American Bible Society (vía buscador) | 05-10-2026 | B |
| Permisos y licencias: American Bible Society (licensing@americanbible.org) | bibles.com, americanbible.org (vía buscador) | 05-10-2026 | B |
| Ley 11.723, art. 8 (texto del decreto-ley 12.063/1957): las obras anónimas de instituciones o personas jurídicas duran 50 años desde su publicación | argentina.gob.ar / WIPO Lex (vía buscador) | 05-10-2026 | A |
| INFERENCIA: aunque en la Argentina pudiera discutirse el vencimiento, la app se distribuye en el mundo, la marca sigue vigente y las tiendas bajan apps ante reclamos; no se recomienda usarla sin licencia | Razonamiento propio | — | — |
| YouVersion Platform: gratis pero solo para apps no comerciales (sin anuncios, muros de pago ni suscripciones) | Reseñas y guía de YouVersion Platform (vía buscador) | 2026 | B (verificar los términos en platform.youversion.com/terms) |
| API.Bible ofrece la RVR1960; uso comercial con plan Pro desde USD 29 por mes y traducciones desde USD 10 por mes | api.bible y su centro de ayuda (vía buscador) | 2026 | B |

## Biblias libres incorporadas a la app (fuente: github.com/seven1m/open-bibles, descargado el 05-10-2026)

| Versión | Licencia | Versículos |
|---|---|---|
| Reina-Valera 1909 (`spa-rv1909.usfx.xml`) | Dominio público | 31.102 |
| La Biblia en Español Sencillo (`spa-bes.usfx.xml`) | CC BY 4.0 (AudioBiblia.org / Irma Flores) | 31.102 |
| Palabra de Dios para ti (`spa-pddpt.usfx.xml`) | CC BY-SA 4.0 | 31.092 |
| Versión Biblia Libre (`spa-vbl.usfx.xml`) | CC BY-SA 4.0 | No incorporada todavía |

## Nombre «Senda»

| Dato | Fuente | Confianza |
|---|---|---|
| En la búsqueda no aparece una app cristiana llamada «Senda» en Google Play ni en App Store | Buscador, 05-10-2026 | C (búsqueda indirecta) |
| «SendaRide»: app de transporte en EE.UU. (otra categoría) | App Store (vía buscador) | B |
| En Chile, SENDA = Servicio Nacional para la Prevención y Rehabilitación del Consumo de Drogas y Alcohol (Ley 20.502, desde el 01-10-2011) | senda.gob.cl, dipres.gob.cl (vía buscador) | A |
| INPI, dominios (.app, .com, .com.ar) y usuarios de redes | No verificables desde el entorno (bloqueados) | Pendiente del fundador |

## Desarrollo sin gastar

| Dato | Fuente | Confianza |
|---|---|---|
| Expo SDK 57 (expo 57.0.26), React Native 0.86.3 | Registro de npm, 05-10-2026 | A |
| EAS Build gratis: 15 compilaciones Android y 15 iOS por mes, cola de baja prioridad | expo.dev/pricing (vía buscador) | B |
| expo.dev, api.expo.dev y docs.expo.dev bloqueados por la red del entorno; el registro de npm y raw.githubusercontent.com funcionan | Prueba directa, 05-10-2026 | A |
| La integración de GitHub de la sesión no puede crear repositorios (403) | Prueba directa, 05-10-2026 | A |
