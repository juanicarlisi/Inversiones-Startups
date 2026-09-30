# Alcance

<div class="enpocas" markdown="1">
**En pocas palabras.** Primero la app, para Android y iOS a la vez (una sola base de código), publicada en todo el mundo desde el
primer día en español. Portugués, inglés y la versión web llegan en 2028. Público principal: de 13 años en adelante; chicos más
chicos solo después, con modo familia y control de los padres.
</div>

## 1. Alcance geográfico e idiomas

| Etapa | Idiomas | Mercados | Biblias libres disponibles |
|---|---|---|---|
| **Etapa 1** (dic-2026 → 2027) | Español neutro (con variantes locales de algunas palabras y juegos) | Toda Latinoamérica, hispanos de EE.UU. y España. La app se publica en todas las tiendas del mundo desde el día 1 | Reina-Valera 1909, Nueva Biblia Viva (abierta, 2008), Biblia Libre para el Mundo, Español Sencillo, Versión Biblia Libre |
| **Etapa 2** (2028) | Portugués (Brasil) e inglés | Brasil (47,4 M de evangélicos), Portugal, EE.UU. y el resto del mundo anglófono | Nova Bíblia Viva (abierta), Bíblia Livre; Berean Standard Bible, KJV, WEB |
| **Etapa 3** (2029 en adelante) | Francés y otros según datos (África francófona, Haití) | Donde la app ya tenga descargas espontáneas | eBible.org tiene traducciones libres en cientos de idiomas |

Criterios para abrir un idioma nuevo: (1) una Biblia moderna con licencia libre, (2) 5% o más de las descargas ya vienen de esa
región, y (3) al menos un revisor nativo para el contenido doctrinal.

## 2. Plataformas

| Plataforma | Cuándo | Cómo |
|---|---|---|
| **Android** (teléfonos y tablets) | Lanzamiento, dic-2026 | Misma base de código (React Native con Expo) |
| **iOS** (iPhone y iPad) | Lanzamiento, dic-2026 | Misma base de código; se compila en la nube, sin necesidad de una Mac |
| **Páginas web mínimas** | Desde oct-2026 | Sitio de la marca, política de privacidad, páginas para compartir versículos y resultados (atraen visitas desde Google) |
| **App web completa** | 2028 | Reutiliza la lógica de la app; sirve para jugar en la computadora, proyectar Senda Reunión desde una notebook y entrar a una sala sin instalar |
| **Widgets** (Android e iOS) | v2 (2027) | Versículo del día y racha en la pantalla de inicio |
| **Relojes, TV, asistentes de voz** | Fuera de alcance por ahora | Se evalúan en 2029 |

## 3. Público y edades

| Franja | Qué puede hacer | Por qué |
|---|---|---|
| **Menores de 13** | Al lanzamiento no pueden crear cuenta (pantalla de edad neutral). Desde 2028: modo familia con consentimiento de los padres | Las reglas de las tiendas y de varios países exigen consentimiento parental y anuncios certificados |
| **13 a 15** | Todo lo de aprendizaje y juego; amigos solo por código o dentro de su grupo de iglesia; sin mensajes; anuncios no personalizados | Protección de menores |
| **16 a 17** | Igual que 13–15, más proponer preguntas y reacciones con amigos | Autonomía progresiva |
| **18 o más** | Todo, incluidas las herramientas de líder | — |

Apple ofrece una API que informa la franja de edad sin pedir la fecha de nacimiento; se usa donde esté disponible.

## 4. Qué incluye (visión completa, por etapas)

| Pilar | Módulos | Etapa de lanzamiento |
|---|---|---|
| Leer | Biblia (versiones, audio, «+», notas, planes), Lámpara (racha), versículo del día | MVP y v1 |
| Aprender | Camino (niveles), Guardá la Palabra (memorizar), Preparados (apologética) | MVP, v2, v3 |
| Jugar | Espadeo (duelo, ¡Desenvainá!, desafío del día), Dibujalo, Tutti Frutti, el Rosco, el Impostor, ¿Quién soy?, Palabra del día, Maná del día | MVP a v3 |
| Juntos | Perfil, amigos, grupos, Senda Reunión, Liga Senda, Copa Senda, Oremos, Agenda | MVP a v3 |
| Crecer | Planes y desafíos con fecha, Berea (IA), Senda Púlpito, Biblioteca, Tu año en la Palabra | MVP a 2028 |

El detalle por versión está en el roadmap (capítulo {{cap:26}}).

## 5. Qué no incluye

- Chat abierto o mensajes privados entre desconocidos; mensajes entre menores.
- Ofrendas, donaciones a iglesias o cualquier manejo de dinero de terceros.
- Gestión de iglesias (membresía, finanzas, asistencia).
- Contenido propio de una denominación o posiciones en temas en los que las iglesias protestantes discrepan (se muestran posturas).
- Versiones bíblicas con derechos sin licencia (la RVR1960 entra solo con licencia; las demás, con un botón para abrirlas en otra app).
- Publicidad dentro de la Biblia, del Camino o de cualquier contenido de lectura.

## 6. Requisitos no funcionales (cómo tiene que andar)

| Requisito | Meta |
|---|---|
| Funciona sin conexión | Biblia, Camino y juegos individuales andan sin internet; se sincroniza al volver |
| Celulares de gama baja | Fluido en Android 9 o más nuevo con 2 GB de RAM |
| Velocidad | Abre en menos de 2 segundos; cada toque responde en menos de 100 ms; animaciones a 60 cuadros por segundo |
| Tamaño | Menos de 60 MB para instalar; Biblias y audios se descargan aparte |
| Estabilidad | 99,5% o más de sesiones sin cierre inesperado |
| Accesibilidad | Contraste AA, letra ajustable, lector de pantalla, reducir movimiento, subtítulos |
| Privacidad | Datos mínimos; se puede exportar y borrar la cuenta desde la app |
| Disponibilidad del servicio | 99,5% mensual |
| Idiomas | Todo texto de la interfaz traducible desde el día 1 (nada escrito a mano en el código) |
| Medición | Cada función nueva sale con sus eventos de analítica definidos |

## 7. Supuestos y restricciones

- **Tus horas:** 5 por semana hasta diciembre de 2026 y menos después (ver el holding). Claude hace el 80–90% del trabajo técnico y de
  contenido; vos decidís, probás, aprobás y ponés la cara hacia adentro de la comunidad, no hacia afuera.
- **Plata:** ver el presupuesto en tres niveles (capítulo {{cap:25}}). Lo grande se paga por tramos, solo si el tramo anterior funciona.
- **Anonimato:** la cuenta de desarrollador muestra el nombre del titular. Se publica primero con tu cuenta personal sin compras
  dentro y la app se transfiere a la empresa del holding antes de activar la suscripción (las dos tiendas permiten transferir apps).
- **Doctrina:** protestante amplio, con revisores de tu comunidad para todo lo doctrinal.
- **Licencias:** solo contenido libre o con licencia; las licencias con «compartir igual» se respetan (capítulo {{cap:22}}).
