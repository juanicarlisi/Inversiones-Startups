# Bitácora — Patentes, marcas, derechos de autor y anonimato (28-09-2026)

> Pedido del fundador: cuándo se patenta, si es posible, cuánto cuesta y por qué importa. Se suma lo que de verdad protege a
> proyectos como los nuestros (marca, derechos, velocidad) y cómo sostener el anonimato en las tiendas. No es asesoramiento
> legal: antes de gastar, consulta de 1 hora con un abogado de propiedad intelectual y un contador.

## 1. Patentes

| Tema | Qué dice | Etiqueta | Fuente |
|---|---|---|---|
| Argentina: qué no es invención | Ley 24.481, art. 6: **no se patentan los programas de computación** ni los métodos para actividades comerciales, juegos o intelectuales | HECHO | argentina.gob.ar, INPI |
| Excepción | El software integrado a un dispositivo que produce un efecto técnico en el mundo físico puede entrar como invención | HECHO | esderecho.com.ar (INPI) |
| Período de gracia | Argentina (art. 5): si el inventor divulgó la invención dentro del año anterior a presentar, lo declara y no pierde novedad. EE.UU.: 1 año. Europa: no tiene | HECHO | Ley 24.481; práctica USPTO |
| EE.UU.: patente provisional | USD 65 de tasa para microentidad (sin examen); da 12 meses para presentar la definitiva. Con abogado, la provisional suele costar miles de dólares y la definitiva USD 10.000–20.000+ en todo el proceso | HECHO (tasa) / ESTIMACIÓN (honorarios) | uspto.gov, ipboutiquelaw 2026 |
| EE.UU.: software | Se patenta solo si hay una mejora técnica concreta (no una idea abstracta); es caro y difícil | INFERENCIA (jurisprudencia Alice) | — |

**Aplicado a nuestros proyectos (INFERENCIA):**
- Apps, juegos, contenidos, calculadoras: **no son patentables** en Argentina y casi nunca conviene en EE.UU.
- La idea de Logistic Lab (describir el proceso → simulación): ya hay antecedentes públicos (asistente de AnyLogic, copiloto de
  Siemens, papers de 2025–2026, código abierto). Es muy difícil probar novedad. **No patentar**; proteger con marca, velocidad,
  datos propios y comunidad.
- **Cuándo sí mirarlo:** si aparece una invención técnica concreta (un algoritmo con efecto medible, un dispositivo) **y** el
  proyecto factura > USD 5.000/mes. En ese caso: provisional en EE.UU. **antes** de mostrarla en público (tasa USD 65 + revisión de
  un agente de patentes), y decidir en 12 meses si vale la definitiva.

## 2. Lo que sí protege: marca, derechos y secretos

| Herramienta | Costo 2026 | Cuándo | Fuente |
|---|---|---|---|
| **Marca en Argentina (INPI)** | 100 UMAPI por clase; la UMAPI vale $405,69 en sep-2026 y $412,59 desde el 1-10-2026 → **~$41.000 por clase (≈ USD 27)**; se actualiza por inflación | Antes del lanzamiento público de cada proyecto que siga (clases 9 software, 41 educación/entretenimiento/juegos, 42 software como servicio) | 1mark.ar, esderecho.com.ar, INPI |
| Marca en EE.UU. (USPTO) | USD 350 por clase desde el 18-01-2025 (+ recargos si falta información) | Cuando EE.UU. sea un mercado real (suite para hispanos, juegos) | Reed Smith, Finnegan |
| Marcas en otros países | Argentina **no está en el Protocolo de Madrid**: hay que registrar país por país. El acuerdo con EE.UU. del 5-02-2026 obliga a enviarlo al Congreso antes de fines de 2027 | Solo países donde se facture | 1mark.ar, Marval |
| Derecho de autor del software y los contenidos | Nace solo, sin trámite. Depósito de obra inédita de software en la DNDA: **$1.400**, protege 3 años y se renueva | Sirve como prueba de fecha; opcional | argentina.gob.ar (DNDA) |
| Dominios | .com.ar en NIC Argentina y .com | Con la marca | — |
| Secretos | Banco de preguntas, prompts, datos y modelos de costos no se publican enteros; términos de uso | Siempre | — |

**Contenido hecho con IA:** en EE.UU. no se registra lo generado solo con IA (Informe de la Oficina de Derechos de Autor, 29-01-2025;
Thaler v. Perlmutter, D.C. Circuit, 18-03-2025; la Corte Suprema no lo revisó, 2-03-2026). "Escribir un prompt" no alcanza: hace
falta aporte humano (letra, arreglos, selección, edición). Consecuencia para la música y las imágenes con IA: **otros las pueden
copiar** y no se puede usar Content ID sobre lo puramente generado → el valor está en la curaduría, la marca y el canal.

## 3. Anonimato: qué muestran las tiendas

| Tienda | Cuenta personal | Cuenta de organización | Fuente |
|---|---|---|---|
| Google Play | Muestra **nombre legal y país**; si la app tiene compras dentro, **también la dirección completa**. Las cuentas personales nuevas necesitan 12 testers durante 14 días | Muestra el nombre y la dirección de la empresa; **no necesita los 12 testers**; pide número D-U-N-S (gratis, hasta 30 días) | support.google.com, dev.to, ontest.app |
| Apple App Store | Tu nombre legal figura como vendedor (no se admiten alias) | Figura la empresa; pide D-U-N-S | developer.apple.com |
| Android fuera de Play | Verificación obligatoria de desarrolladores desde el 30-09-2026 (primero Brasil, Indonesia, Singapur y Tailandia; luego global) | Igual | Android Developers Blog, The Hacker News |

**Opciones de empresa para publicar sin tu nombre** (ESTIMACIONES de proveedores, re-verificar):

| Opción | Costo | Ventajas | Cuidados |
|---|---|---|---|
| SAS en Argentina (IGJ, por TAD, ~1 semana) | $500.000–1.500.000 de arranque con profesionales + contador mensual | Factura local, D-U-N-S, cuentas locales | Socios publicados en el Boletín Oficial; obligaciones impositivas y contables mensuales |
| LLC en EE.UU. (Wyoming USD 60/año de tasa estatal; New Mexico sin reporte anual) + agente registrado (~USD 100–300/año) | USD 300–600 el primer año | No publica dueños en el registro estatal; cuenta de empresa en tiendas; acceso a Stripe y bancos de EE.UU. | Formulario 5472 anual obligatorio (multa de USD 25.000 si no se presenta); hay que declararla en Argentina (contador); regla 8: requiere tu aprobación |

**Recomendación (INFERENCIA):**
1. Hasta el primer ingreso: publicar la suite **sin compras dentro** desde cuenta personal solo si aceptás que se vea tu nombre y
   país; si no, esperar la empresa.
2. **Antes de activar suscripciones (mes 3–6):** decidir SAS o LLC con un contador (1 consulta). La empresa pasa a ser **el holding**:
   dueña de marcas, dominios, cuentas y apps (también sirve para vender un activo más adelante).
3. Registrar en el INPI las marcas de los proyectos que pasen su primer hito (≈ USD 27 por clase).
4. Patentes: no por ahora; revisar solo si aparece una invención técnica y el proyecto factura > USD 5.000/mes.

Fuentes: argentina.gob.ar (Ley 24.481 y DNDA); portaltramites.inpi.gob.ar; esderecho.com.ar; 1mark.ar; unamarca.com.ar;
uspto.gov; ipboutiquelaw.com; reedsmith.com; finnegan.com; marval.com; skadden.com; mayerbrown.com (cert denegado 2026);
rimonlaw.com; support.google.com/googleplay/android-developer; dev.to; ontest.app; developer.apple.com;
android-developers.googleblog.com (mar-2026); thehackernews.com (jun-2026); developargentina.com; contaonline.com.ar;
thompsonstein.com; defentux.com.
