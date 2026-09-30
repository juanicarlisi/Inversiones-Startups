# Experiencia de usuario: colores, movimiento, sonido y pantallas

<div class="enpocas" markdown="1">
**En pocas palabras.** La experiencia es prioridad absoluta y la vara es Duolingo, la mejor app de aprendizaje del mercado. Senda
tiene **dos climas**: el **Santuario** (la Biblia: calma, papel, letra de libro, sin juego) y la **Arena** (Camino y juegos: color,
rebote, sonido). Todo se diseña con teorías probadas (color, movimiento, sonido, leyes de UX), con accesibilidad desde el día 1 y
probándolo con jóvenes reales cada dos semanas.
</div>

## 1. Principios de experiencia

1. **Una acción principal por pantalla**, grande y abajo (donde llega el pulgar).
2. **Valor antes que registro**: la primera lección se hace sin cuenta.
3. **Todo responde**: cada toque tiene una respuesta visual, sonora o táctil en menos de 100 ms.
4. **Deleite con propósito**: animaciones y sonidos que refuerzan un logro, nunca decorativos ni largos.
5. **Rápida y liviana**: abre en menos de 2 segundos, anda en teléfonos baratos y sin conexión.
6. **Clara para todos**: textos cortos, íconos con nombre, lenguaje de un joven de 15 años.
7. **Calma donde se lee, energía donde se juega.**
8. **Accesible**: contraste, tamaño de letra, lector de pantalla, reducir movimiento.

## 2. Los dos climas

| | **Santuario** (Biblia, planes, Oremos) | **Arena** (Camino, Espadeo, juegos) |
|---|---|---|
| Sensación | Paz, foco, reverencia | Alegría, energía, logro |
| Fondo | Crema pergamino (claro), sepia o azul noche (oscuro) | Blanco con acentos de color, fondos ilustrados |
| Letra | Serif de lectura (Literata), 18–20 pt, interlineado amplio | Redondeada (Nunito), grande y en negrita para títulos |
| Color | Casi monocromo; ámbar solo para la Lámpara y el «+» | Paleta completa; un color por pieza de la armadura |
| Movimiento | Mínimo: transiciones suaves de 200–300 ms, sin rebotes | Rebotes, sacudidas, confeti, Lani animada |
| Sonido | Ninguno (salvo el audio de la Biblia y la campana de la Lámpara) | Paleta completa de sonidos |
| Gamificación | Solo la Lámpara | Toda |

## 3. Teorías que guían el diseño

### Color

- **Asociaciones culturales (con cautela):** el azul se asocia con confianza y calma; el ámbar y el naranja con calidez, energía y
  luz; el verde con crecimiento y acierto; el rojo con alerta. La evidencia científica sobre «psicología del color» es débil en
  detalles: se usa como guía, no como ley, y se prueba con usuarios.
- **Contraste antes que gusto:** texto con contraste de 4,5:1 o más (norma WCAG 2.2 AA).
- **Nunca solo color:** cada categoría tiene color **y** ícono; acierto y error usan color **y** forma (tilde / cruz) — el 8% de los
  varones tiene alguna forma de daltonismo.
- **Regla 60-30-10:** 60% neutro, 30% color de marca, 10% acento, para que lo importante resalte (efecto Von Restorff: lo distinto se
  recuerda).

### Movimiento

- **Los 12 principios de la animación de Disney** (anticipación, estirar y encoger, acción secundaria, exageración) para Lani y los
  festejos: la anticipación antes de un salto hace que se sienta vivo.
- **Duraciones:** microinteracciones 100–200 ms; transiciones 250–350 ms; festejos 800 ms–2 s; nada que bloquee más de 3 s sin poder
  saltearse.
- **Curvas:** entrada con desaceleración («ease-out»), salida con aceleración; rebotes con resorte suave (física real, no lineal).
- **El movimiento explica:** la pieza de armadura vuela hacia Lani para mostrar dónde quedó; los Pasos suben contando para mostrar
  cuánto ganaste.
- **Rendimiento:** 60 cuadros por segundo, animaciones en el hilo de la interfaz (Reanimated) y personajes en Rive.
- **Reducir movimiento:** si el sistema lo pide, se reemplazan rebotes y confeti por fundidos.

### Sonido

- **Íconos sonoros («earcons»)**: cada evento tiene un sonido corto que se aprende rápido.
- **Ascendente = bien, descendente = mal**: dos notas que suben (intervalo consonante, como tercera mayor o quinta) se leen como «sí»;
  una nota que baja, suave, como «no», sin asustar (el «buzzer» agresivo genera ansiedad).
- **Breves:** 80–400 ms para interacción; hasta 2 s para festejos.
- **Timbres cálidos y orgánicos** (marimba, campanas suaves, celesta, madera), coherentes con una marca cálida, lejos de lo «arcade»
  estridente.
- **Sonido + vibración sincronizados** (háptica ligera en toques, media en errores, patrones en festejos).
- **Respeto:** modo silencio, volumen de la app, y ningún sonido en el Santuario.
- **Firma sonora:** tres notas ascendentes (un arpegio mayor) que dicen «Sen-da» al abrir la app y en los grandes logros.

### Leyes de la experiencia de usuario

| Ley | Qué dice | Aplicación |
|---|---|---|
| Hick | Más opciones, más tiempo para decidir | 5 pestañas; 3–4 opciones por pregunta |
| Fitts | Los objetivos grandes y cercanos se tocan más rápido | Botones de 48 px o más, abajo |
| Jakob | La gente espera que tu app funcione como las que ya conoce | Patrones de Duolingo y Preguntados |
| Miller | Se retienen pocos elementos a la vez | Lecciones cortas, pasos de a uno |
| Pico-final | Se recuerda el mejor momento y el final | Cada sesión termina con un festejo y la «Palabra para hoy» |
| Gradiente de meta | Cuanto más cerca de la meta, más esfuerzo | Barras de progreso visibles |
| Zeigarnik | Lo incompleto se recuerda | «Te falta 1 lección para terminar la unidad» (sin presión) |
| Umbral de Doherty | Por debajo de 400 ms la interacción se siente instantánea | Respuestas locales, sincronización en segundo plano |
| Estética-usabilidad | Lo lindo se percibe más fácil de usar | Nivel visual de primera |

### Conducta

- **Modelo de Fogg** (conducta = motivación × facilidad × disparador): hábito diario con disparador (aviso a tu hora), facilidad
  (lección de 3 minutos) y motivación (Lámpara, amigos).
- **Modelo «Hooked»** (disparador → acción → recompensa variable → inversión) usado **con ética**: la recompensa variable está en
  cofres ganados y el Maná del día, sin pago; la inversión es progreso real (conocimiento, versículos guardados).

## 4. Sistema de diseño

### Paleta

{{PALETA}}

| Token | Color | Uso |
|---|---|---|
| Ámbar Lámpara | #F5A524 | Marca, Lámpara, «+», acento principal |
| Azul Noche | #1E2A5A | Marca, títulos, modo oscuro del Santuario |
| Verde Brote | #2FA66A | Acierto, progreso, botón principal de avanzar |
| Rojo Granada | #D9434B | Error (suave), vidas |
| Crema Pergamino | #FFF8EC | Fondo de lectura claro |
| Tinta | #1B1B1F | Texto principal |
| Escudo de la fe (AT) | #2F80ED | Pieza de Espadeo |
| Calzado del evangelio | #EB5757 | Pieza de Espadeo |
| Yelmo de la salvación | #9B51E0 | Pieza de Espadeo |
| Espada del Espíritu | #F2994A | Pieza de Espadeo |
| Cinto de la verdad | #27AE60 | Pieza de Espadeo |
| Coraza de justicia | #F2C94C (texto oscuro encima) | Pieza de Espadeo |

Modo oscuro completo en toda la app; en el Santuario, además, sepia.

### Tipografía (todas con licencia libre)

| Uso | Tipo | Por qué |
|---|---|---|
| Interfaz y juegos | **Nunito** (redondeada) | Amigable, muy legible, con muchos pesos |
| Títulos de juego | **Fredoka** | Divertida, gruesa, con personalidad |
| Lectura de la Biblia | **Literata** | Diseñada para leer mucho en pantalla (la usa Google Play Libros) |
| Números | Cifras tabulares | Contadores que no «saltan» |

### Otros tokens

Espaciado en múltiplos de 4 px · bordes redondeados de 12–20 px (formas amables) · sombras suaves con un «borde inferior» de 3–4 px en
botones (el botón «se hunde» al tocarlo, como en Duolingo) · íconos redondeados de trazo grueso · ilustraciones planas con sombras
suaves, mismo estilo que Lani.

### Componentes

Botón principal y secundario, tarjeta de pregunta, opción de respuesta, barra de progreso, contador de Lámpara y Talentos, hoja
inferior (el «+»), ruleta, nodo del camino, tarjeta de logro, avatar, fila de liga, modal de recompensa, carga («Lani pensando»),
estados vacíos y de error. Cada componente con sus estados (normal, presionado, deshabilitado, cargando, acierto, error) y su
animación.

## 5. Pantallas clave

{{MOCKS_UX}}

## 6. Voz y tono de la app

- **Español neutro de Latinoamérica** con «tú» para toda la región, y variantes locales (voseo en Argentina y Uruguay, «Basta» en
  México) que se activan por país. **Decisión pendiente** (capítulo {{cap:27}}).
- Frases cortas, cálidas, con humor suave; nunca sermón ni reto.
- Errores explicados sin culpa («Casi. La respuesta era José, Génesis 37:28»).
- Lani habla en primera persona; la app, en un tono amigable y claro.

## 7. Cómo se asegura la calidad de la experiencia

1. **Prototipo antes de construir** cada módulo grande (en la app misma, detrás de un interruptor).
2. **Pruebas con 5 jóvenes** cada dos semanas (se detectan la mayoría de los problemas de usabilidad con 5 personas).
3. **Métricas de experiencia:** tasa de finalización de la primera lección, tiempo hasta el primer acierto, abandono por pantalla,
   calificación en tiendas (meta 4,7) y encuesta de usabilidad (SUS) cada trimestre.
4. **Grabaciones de sesiones anónimas** (con permiso y sin datos personales) para ver dónde se traban.
5. **Lista de control antes de cada versión:** contraste, tamaño de letra grande, lector de pantalla, modo oscuro, sin conexión,
   teléfono de gama baja, textos traducidos.
