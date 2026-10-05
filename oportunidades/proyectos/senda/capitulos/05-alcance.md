# Alcance

<div class="enpocas" markdown="1">
**En pocas palabras.** Primero la app, para Android y iOS a la vez (una sola base de código), publicada en todo el mundo desde el
primer día en español. A fines de 2027 se podrá entrar a una sala desde el navegador; portugués, inglés y la web completa llegan en
2028. Público principal: de 13 años en adelante; chicos más chicos solo después, con modo familia y control de los padres.
</div>

## 1. Alcance geográfico e idiomas

| Etapa | Idiomas | Mercados | Biblias |
|---|---|---|---|
| **Etapa 1** (dic-2026 → 2027) | Español neutro, con variantes locales de algunas palabras y juegos | Toda Latinoamérica, hispanos de EE.UU. y España. La app se publica en todas las tiendas del mundo desde el día 1 | Reina-Valera (RV1909 libre; RVR1960 con licencia), NTV, NVI, DHH y TLA con licencia; Español Sencillo y Palabra de Dios para ti libres (ya en la app) |
| **Etapa 2** (2028) | Portugués (Brasil, marzo) e inglés (segundo semestre) | Brasil (47,4 M de evangélicos), Portugal, EE.UU. y el mundo anglófono | Libres (Nova Bíblia Viva, Bíblia Livre; BSB, KJV, WEB) y las más usadas con licencia |
| **Etapa 3** (2029 en adelante) | Francés y otros según datos | Donde ya haya descargas espontáneas | eBible.org y YouVersion Platform cubren cientos de idiomas |

Criterios para abrir un idioma: (1) Biblias disponibles (libres o con licencia accesible), (2) 5% o más de las descargas ya vienen de
esa región y (3) al menos un revisor nativo para lo doctrinal.

## 2. Plataformas

| Plataforma | Cuándo | Cómo |
|---|---|---|
| **Android** (teléfonos y tablets) | Lanzamiento, dic-2026 | Misma base de código (React Native con Expo) |
| **iOS** (iPhone y iPad) | Lanzamiento, dic-2026 | Misma base de código; se compila en la nube, sin necesidad de una Mac |
| **Páginas web mínimas** | Desde oct-2026 | Sitio, privacidad, páginas de cada logro o desafío compartido (atraen visitas desde Google y llevan a la tienda) |
| **Entrar a una sala desde el navegador** | v3 (oct–nov 2027) | Que un chico sin la app pueda jugar en la reunión con un código; después se le propone instalar |
| **App web completa** | 2028 | Jugar y estudiar desde la computadora; proyectar Senda Reunión desde una notebook |
| **Widgets** (Android e iOS) | v1 (2027) | Versículo del día, racha y el próximo evento del calendario |
| **Relojes, TV, asistentes de voz** | Fuera de alcance por ahora | Se evalúan en 2029 |

## 3. Público y edades

| Franja | Qué puede hacer | Por qué |
|---|---|---|
| **Menores de 13** | Al lanzamiento no pueden crear cuenta (pantalla de edad neutral). Desde 2028: modo familia con consentimiento de los padres | Las reglas de las tiendas y de varios países exigen consentimiento parental y anuncios certificados |
| **13 a 15** | Todo lo de aprendizaje, juego y liga (en su franja); amigos por código, QR o dentro de su grupo; rivales al azar solo de su franja; sin mensajes; anuncios no personalizados; encuestas sin temas sensibles | Protección de menores |
| **16 a 17** | Igual que 13–15, más buscar amigos por usuario, proponer preguntas y Estados con plantillas | Autonomía progresiva |
| **18 o más** | Todo, incluidas las herramientas de líder y las encuestas de estudio | — |

Apple ofrece una API que informa la franja de edad sin pedir la fecha de nacimiento; se usa donde esté disponible.

## 4. Qué incluye (visión completa, por etapas)

| Pilar | Módulos | Lanzamiento |
|---|---|---|
| Leer | Biblia (versiones, audio, «+», notas, planes), racha, versículo del día | MVP y v1 |
| Aprender | Travesía: Ruta Fundamentos (toda la Biblia, completa en junio de 2027), Rutas temáticas (Héroes, Mapas, 66 Libros, Preparados, Profecías y más), Repaso del día, niveles Profundo y Maestría | MVP a 2028 |
| Jugar | Espadeo (duelos, Escuadra, ¡Desenvainá!, Desafío del día), Dibujalo, Oveja Perdida, Tutti Frutti, Abecé, ¿Quién soy?, ¡Prohibido!, Palabra del día, Antes o después, Giro diario | MVP a v3 |
| Juntos | Perfil y Tu Lani, amigos, grupos, calendario (Senda, personal y del grupo o iglesia), Liga Senda, Copas, la semana Senda, Pulso, Estados, Oremos, Senda Reunión, Senda Púlpito | MVP a v3 |
| Crecer | Berea: planes, desafíos con fecha, Ayuno de redes, De memoria, *Primero la Palabra*; Biblioteca (2028); Tu año en Senda | MVP a 2028 |

El detalle por versión está en el roadmap (capítulo {{cap:30}}).

## 5. Qué no incluye

- Chat abierto o mensajes privados entre desconocidos; mensajes entre menores.
- Un asistente de IA para hacerle preguntas, o una IA que arme reuniones o mensajes del pastor.
- Botones que manden a otras apps para leer la Biblia o ver videos: todo lo que ofrece Senda pasa dentro de Senda.
- Ofrendas, donaciones a iglesias o cualquier manejo de dinero de terceros.
- Gestión administrativa de iglesias (membresía formal, finanzas).
- Contenido propio de una denominación o posiciones en temas en los que las iglesias protestantes discrepan (se muestran posturas).
- Versiones bíblicas con derechos sin licencia.
- Publicidad dentro de la Biblia o en medio de una lección de la Travesía.

## 6. Requisitos no funcionales (cómo tiene que andar)

| Requisito | Meta |
|---|---|
| Nivel visual | Cada pantalla pasa la «prueba de la grilla» (capítulo {{cap:19}}) antes de publicarse |
| Funciona sin conexión | Biblia, Travesía y juegos individuales andan sin internet; se sincroniza al volver |
| Celulares de gama baja | Fluido en Android 9 o más nuevo con 2 GB de RAM; efectos que se simplifican solos si el teléfono no da |
| Velocidad | Abre en menos de 2 segundos; cada toque responde en menos de 100 ms; animaciones a 60 cuadros por segundo |
| Tamaño | Menos de 80 MB para instalar; Biblias, audios y paquetes de imágenes se descargan aparte |
| Estabilidad | 99,5% o más de sesiones sin cierre inesperado |
| Accesibilidad | Contraste AA, letra ajustable, lector de pantalla, reducir movimiento, subtítulos, colores con forma o ícono |
| Privacidad | Datos mínimos; encuestas de estudio anónimas; se puede exportar y borrar la cuenta desde la app |
| Disponibilidad del servicio | 99,5% mensual; 99,9% durante eventos en vivo |
| Idiomas | Todo texto de la interfaz traducible desde el día 1 |
| Medición | Cada función nueva sale con sus eventos de analítica definidos |

## 7. Supuestos y restricciones

- **Tus horas:** 5 por semana hasta diciembre de 2026 y algo menos después. Claude hace el 80–90% del trabajo técnico y de contenido;
  vos decidís, probás, aprobás y cuidás la comunidad.
- **Plata:** menú de calidad en tres niveles (capítulo {{cap:29}}); lo grande se paga por tramos, solo si el tramo anterior funciona.
- **Velocidad:** el roadmap comprimido supone Claude con más horas de trabajo desde diciembre (decisión en el capítulo {{cap:31}}).
- **Anonimato:** la cuenta de desarrollador muestra el nombre del titular. Se publica primero con tu cuenta personal sin compras
  dentro y la app se transfiere a la empresa del holding antes de activar la suscripción.
- **Doctrina:** protestante amplio, con revisores de tu comunidad para todo lo doctrinal.
- **Licencias:** solo contenido libre o con licencia; las licencias con «compartir igual» se respetan (capítulo {{cap:26}}).
