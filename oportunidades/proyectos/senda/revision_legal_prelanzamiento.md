# Revisión legal exhaustiva antes de publicar (sesión exclusiva)

**Pedido del fundador (10-11-2026):** «los puntos que me mencionaste, y todos los que puedan haber en backlog para abogados, tenelos en
cuenta y en un momento antes de publicar, te asignás el rol de abogado y analizás todo EXHAUSTIVAMENTE. Una sesión exclusiva para eso.
Y validás contra todo lo que existe. Y ahí de última vemos qué modificar o qué no.» Reemplaza la consulta paga con un abogado
(DEC-2026-11-10-5). **Cuándo:** una sesión dedicada solo a esto, antes de que la ficha de Google Play sea pública (a más tardar la
semana del 07-12 para el lanzamiento del 18-12). Esta lista se completa cada vez que aparezca un tema legal nuevo.

## Cómo se hace
- Rol: abogado de propiedad intelectual, datos personales, consumo y plataformas. Cada punto se valida contra la **fuente primaria
  vigente** (ley, decreto, resolución, política de Google/Apple, licencia original) con fecha de consulta; nada de memoria.
- Para cada punto: qué dice la norma (HECHO con fuente), cómo está Senda hoy (con archivo y línea), el riesgo (probabilidad × daño),
  y la recomendación: cambiar, dejar o preguntar al fundador. Lo que afecte la UX se mide antes (capítulo 48 §6).
- Entregable: un informe para el fundador (corto, en pasos) y los cambios propuestos listos para aplicar; nada se cambia sin su OK si
  toca algo clave de la experiencia.
- Base de partida: `docs/LEGAL.md` de la app, `conocimiento/2026-11-07-senda-chequeo-legal.md`, capítulos 48, 49, 75 y 77,
  `docs/legal/` de la app (marca_inpi, consulta_sba, autorizacion_ministerio).

## Lista de puntos (backlog para abogados)
### Propiedad intelectual y licencias
1. Biblias: RV1909 (dominio público y la fuente digital usada), RVR1960 (tope de 500 versículos con leyenda, consulta a la SBA en
   `docs/legal/consulta_sba.md`, que conste para una app con anuncios), PDT, NBV, BES y las libres en portugués e inglés (BSB, Bíblia
   Livre, Almeida, KJV): licencia exacta de cada una, atribución exigida, si permiten anuncios y si piden «share alike».
2. Enlaces a versiones con derechos (NVI, NTV en Bible.com/YouVersion): que solo sea enlace y no reproducción.
3. Música (Kevin MacLeod, CC BY 4.0): crédito correcto en la app y en la ficha; que no quede ningún tema de Mixkit ni de FreePD.
4. Sonidos (grabaciones CC0 y síntesis propia), imágenes de la trivia (dominio público, a color), mapas y láminas propias.
5. Fuentes tipográficas (Unbounded, Plus Jakarta Sans, Literata: OFL) y librerías de código (licencias de los paquetes del APK).
6. Lany: la ilustración de la entrada se hizo con Gemini (posible falta de derecho de autor propio); el diseño de código (Rive) es
   propio; que no se parezca a personajes de terceros (se corrigió Shaun the Sheep en la prueba 23); términos de uso de Gemini.
7. Logo nuevo (DEC-2026-11-10-4): búsqueda de parecidos; las marcas presentadas en el INPI (SENDA BIBLIA Y JUEGOS y LANY, clases 9 y
   41) y su relación con «SENDA EDUCACIÓN EN CASA», «LA SENDA» y «SENDA PROHIBIDA»; cómo usar ® / ™ mientras está en trámite.
8. Juegos inspirados en otros: «¿Quién es?» (Adivina quién), «Abecé» (no «El Rosco»), «Antes o después», «Nombres por letra», el
   Espadeo con ruleta (Preguntados), la trivia del sermón (Kahoot): mecánicas, nombres, aspecto y patentes.
9. Material del ministerio aliado (Nueva Generación): autorización escrita, alcance («El evangelio, paso a paso»), uso de su nombre
   en «by Nueva Generación».
10. Libros de referencia: que nada esté replicado ni copiado (regla del 20-10); textos generados con la API de Anthropic (términos de
   uso, propiedad del resultado).
11. Contenido que suben los usuarios (PDF del sermón, alias, avatares, nombres de grupos): licencia que nos dan, derechos de autor del
   PDF, retiro ante denuncia.

### Datos personales, menores y seguridad
12. Ley 25.326: inscripción en la AAIP, consentimiento, finalidad, derechos de acceso y supresión, datos sensibles (la fe puede ser
   dato sensible, art. 2 y 7), transferencia internacional (Supabase, PostHog, Anthropic, Expo, Google en EE. UU.).
13. Menores: público 13+, qué pasa con menores de 13 en la bienvenida, consentimiento de padres, Familias de Google Play, chat y
   contacto entre usuarios (amigos, grupos de hasta 10.000, duelos, salas en vivo), lo que se muestra en el perfil público.
14. Privacidad 1.2 y términos 1.0 (web/): que digan lo que la app hace hoy (micrófono para la voz, Google para guardar el progreso,
   anuncios), datos del responsable (nombre y domicilio), borrado de cuenta dentro de la app y por enlace.
15. Seguridad de los datos (formulario de Play) e IARC: que coincidan con lo que la app hace.

### Consumo, publicidad y dinero
16. Ley 24.240 y Disp. 954/2025: botón de arrepentimiento y de baja, información antes de suscribirse (precio, renovación, prueba),
   planes Premium USD 1,99 y Max USD 3,99, regalar Max, talentos (que no se vendan) y sobres del álbum (sin azar pagado; Brasil, Lei
   15.211 art. 20).
17. Anuncios (AdMob): no personalizados, categorías bloqueadas, anuncio al terminar la lección, app-ads.txt, consentimiento (CMP).
18. Torneos, copas, premios y «10 kits por puntos»: cuándo es concurso de habilidad y cuándo sorteo con autorización (Lotería,
   Ley 22.802 art. 10 y normas provinciales); bases y condiciones.
19. Monotributo, Factura E por AdMob, cobros de Google Play en dólares a nombre del fundador (con el contador si hace falta).

### Plataformas y países
20. Políticas de Google Play (contenido de usuarios, IA generativa, religión, menores, metadatos de la ficha) y de la App Store
   (Sign in with Apple, cuentas, contenido de usuarios) antes de la revisión.
21. Lanzamiento en Latinoamérica sin Brasil (DEC-2026-11-07-6): países excluidos en la consola; qué cambia al abrir Brasil (LGPD,
   ECA Digital), EE. UU. (COPPA) y la UE (RGPD, DSA).
