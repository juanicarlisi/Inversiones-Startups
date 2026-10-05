# Senda: benchmark de navegación, Biblias libres y RVR1960 (05-10-2026)

Investigación hecha a pedido del fundador después de probar la vista previa del sprint 0. Datos obtenidos por buscador el
05-10-2026; **verificar en la fuente primaria antes de decidir plata**.

## 1. Navegación: barra de pestañas abajo vs. menú desplegable arriba

| Tipo | Dato | Fuente |
|---|---|---|
| HECHO | Nielsen Norman Group, estudio cuantitativo con 179 participantes: la navegación escondida (hamburguesa) bajó ~20 % el descubrimiento, subió la dificultad percibida y fue 39 % más lenta en escritorio y 15 % en el teléfono | [Smart Insights, resumen del estudio de NN/g](https://www.smartinsights.com/digital-marketing-strategy/are-hamburger-menus-hidden-navigation-good-for-ux/) |
| HECHO | Facebook (2013) pasó de menú lateral a barra inferior: más uso, satisfacción y sensación de velocidad. Zeebox: con pestañas, +55 % frecuencia semanal y +8,7 % diaria frente a hamburguesa. Redbooth (2015): +65 % usuarios diarios y +70 % duración de sesión al pasar a pestañas | [The Next Web](https://thenextweb.com/news/ux-designers-side-drawer-navigation-costing-half-user-engagement), [BodyGuardz A/B](https://www.bodyguardz.com/blogs/news/bottom-navigation-menu-smartphone-hand-pain-study) |
| HECHO | Spotify en iOS con barra de pestañas: +9 % de toques en general y +30 % en elementos del menú | [Smart Insights](https://www.smartinsights.com/digital-marketing-strategy/are-hamburger-menus-hidden-navigation-good-for-ux/) |
| HECHO | Steven Hoober (2013, 1.300 personas): 49 % usa una mano, 36 % sostiene con una y toca con la otra, 15 % dos pulgares; 75 % de las interacciones son con el pulgar | [UXmatters](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php) |
| HECHO | NN/g: solo tres íconos se entienden sin texto (inicio, imprimir, lupa); los íconos con etiqueta se identifican mejor | [UX Collective](https://uxdesign.cc/do-icons-need-labels-6cb4f4282c00) |
| HECHO | Material 3: barra de navegación para 3 a 5 destinos principales. Apple HIG: barra de pestañas para navegar, entre 3 y 5 en iPhone; iOS 26 suma la barra que se achica al hacer scroll (`tabBarMinimizeBehavior`) | [Material 3 (SAP Fiori, uso)](https://www.sap.com/design-system/fiori-design-android/v25-4/components/m3-standard-components/navigation-bar/usage), [Apple HIG](https://developer-rno.apple.com/design/human-interface-guidelines/components/navigation-and-search/tab-bars), [Donny Wals](https://www.donnywals.com/exploring-tab-bars-on-ios-26-with-liquid-glass/) |
| HECHO | Duolingo navega con la barra inferior (lecciones, perfil, tienda) y rediseñó sus pestañas para unificarlas | [Blog de Duolingo](https://blog.duolingo.com/core-tabs-redesign) |
| INFERENCIA | Para Senda (5 destinos, uso con una mano, jóvenes que conocen Duolingo e Instagram) la barra inferior con etiquetas es la mejor opción; perfil y ajustes en el avatar arriba a la izquierda | — |

## 2. Versiones de la Biblia en español con licencia libre (catálogo de eBible)

| Versión | Licencia | Veredicto |
|---|---|---|
| Reina-Valera 1909 | Dominio público | En la app |
| Biblica® Open Nueva Biblia Viva (spaonbv) | CC BY-SA 4.0; copiar y distribuir sin cambios, conservar el título y el aviso de Biblica | **Sumada al sprint 1** (bajada con GitHub Actions; 66 libros, 30.952 versículos) |
| Palabra de Dios para ti (spapddpt) | CC BY-SA 4.0 (open-bibles); titular según eBible: Asociación Bíblica Latinoamericana | En la app |
| La Biblia en Español Sencillo (spabes) | CC BY 4.0 | En la app |
| Versión Biblia Libre (spavbl) | CC BY-SA 4.0 | No por ahora: poco conocida; traductor (J. Gallagher) con trasfondo adventista |
| Santa Biblia Libre para el Mundo (spablm) | Dominio público | No: traducción de la World English Bible, usa «Yahvé», incluye deuterocanónicos |
| Reina Valera Gómez (sparvg) | CC BY-NC-ND 4.0 (no comercial) | Pedir permiso (borrador listo) |
| Valera 1602 Purificada (sparvp) | Sin confirmar | Revisar antes |
| LBLA, NBLH (Lockman) | Con derechos | Solo con licencia |

Fuentes: metadatos de eBible en [BibleNLP/ebible](https://github.com/BibleNLP/ebible), [README de open-bibles](https://github.com/seven1m/open-bibles),
[derechos de la NBV](https://ebible.org/spaonbv/copyright.htm), [VBL](https://ebible.org/spavbl/copyright.htm),
[RVG](https://ebible.org/sparvg/copyright.htm), [BLM](https://ebible.org/pdf/spablm/spablm_INT.pdf),
[Free Bible Version](https://ebible.org/engfbv/copr.htm).

## 3. RVR1960: ¿hay algo más barato que ~USD 39 por mes?

| Tipo | Dato | Fuente |
|---|---|---|
| HECHO | API.Bible: uso comercial con plan Pro (USD 29+/mes) y licencia por traducción con derechos: USD 10/mes hasta 5.000 usuarios, 25 hasta 20.000, 75 hasta 50.000, 150 hasta 100.000, 250 por encima | [API.Bible Express Licensing](https://care.api.bible/article/409-express-licensing-for-commercial-use) |
| HECHO (corrige el capítulo 7 de la v2.1) | La regla de citar hasta 500 versículos sin permiso exige que la obra sea de **uso no comercial** | [ABS Rights and Permissions](https://bibles.com/pages/american-bible-society-rights-and-permissions) |
| HECHO | Bible Brain (Faith Comes By Hearing): gratis, pero la licencia prohíbe cobrar a los usuarios | [faith.tools](https://faith.tools/app/153-bible-brain-api) |
| HECHO | YouVersion Platform: solo apps no comerciales | (bitácora del 05-10, primera tanda) |
| HECHO | En Bible.com la RVR1960 es la versión 149 (`bible.com/bible/149/JHN.3.RVR1960`) | [Bible.com](https://www.bible.com/audio-bible-app-versions/149-rvr1960-biblia-reina-valera-1960) |
| INFERENCIA | No hay vía legal más barata que API.Bible para tener el texto dentro de la app. Puente gratuito: enlace al capítulo en Bible.com. Además, pedir precio de ministerio (gratis) | — |

## 4. Infraestructura sin costo

- El entorno de Claude no llega a eBible ni a expo.dev; **GitHub Actions sí** (minutos gratis de GitHub): un flujo baja Biblias de
  eBible y otro arma el APK de prueba sin cuenta de Expo (debug-signed, solo arm64) y lo publica en Releases.
