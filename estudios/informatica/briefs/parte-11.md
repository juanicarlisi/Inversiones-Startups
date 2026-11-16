# Parte 11: Escritorio y software empresarial. Notas por día.
Contexto: el estudiante ya recorrió SO, programación, web, backend, APIs, bases y mobile (Partes 1–10). Esta parte es corta y de mapa: cómo es el software de escritorio y el que usan las empresas, con foco especial en logística (el fundador conoce logística: usá su vocabulario con precisión y sin inventar datos del rubro). ENTORNO: Linux sin pantalla; se puede correr Node/Electron solo en modo headless si instala (xvfb por apt; chequeá disco), Tauri requiere toolchain de Rust (ya hay) pero sus dependencias de sistema pueden pesar: si no entra liviano, doc. .NET 10 SDK y OpenJDK están (consola; WPF/WinUI/AppKit solo por documentación oficial). Odoo Community puede correrse solo si instala sin llenar el disco (probablemente no: usá documentación oficial y, si querés mostrar un modelo de datos, replicá un mini-ERP inventado en SQLite/Postgres propio). Productos comerciales (SAP, Oracle, Dynamics, Salesforce, etc.): solo documentación y sitios oficiales con fecha; precios y cuotas de mercado únicamente con fuente y fecha (Gartner/IDC suelen estar tras muro de pago: si no se puede leer, no se cita la cifra). Nada de recomendaciones de compra. Argentina: facturación electrónica de ARCA (ex AFIP) ya se vio en 08-16: retomalo con [@08-16]. Datos de ejemplo siempre inventados. Cuidá el disco, puertos 23xxx, `rm` con comodines y `pkill`/`kill` por patrón bloqueados. Senda casi no aparece (no es software de escritorio ni empresarial): solo donde ilustre algo verificable (la Consola como tablero interno; scripts Python como herramientas internas). No mencionar proyectos privados del fundador.

## 11-01 Aplicaciones de escritorio: nativas y multiplataforma
Qué es una app de escritorio hoy, toolkits (Win32/WinUI, AppKit/SwiftUI, GTK, Qt), multiplataforma (Electron, Tauri, Flutter desktop, .NET MAUI, Qt), binario por plataforma, por qué muchas apps de escritorio son web empaquetada. Ejemplo mínimo corrido (GTK/Qt con Python si instala liviano, o una CLI + TUI) y rotulado.

## 11-02 Windows y macOS: Win32, WPF, WinUI, AppKit
Historia y capas de UI de Windows (Win32 → WinForms → WPF → UWP → WinUI 3) y macOS (AppKit, Catalyst, SwiftUI); por qué conviven; qué significa para mantener una app 20 años. Solo doc oficial fechada.

## 11-03 Electron y Tauri
Electron (Chromium + Node, proceso principal y de render, IPC, seguridad: `contextIsolation`), costo en memoria y tamaño (medí si podés instalar Electron y correrlo con xvfb; si no, doc), Tauri (WebView del sistema + Rust), apps conocidas hechas con cada uno (con fuente). VS Code como caso (retomá [@04-02]).

## 11-04 Java y .NET en escritorio y empresas
Swing/JavaFX, WinForms/WPF, aplicaciones de línea de negocio, ClickOnce/Java Web Start (historia), por qué siguen vivas. Corré un programa de consola en Java y .NET que modele una pantalla de ABM con datos inventados (sin UI) y explicá lo demás por doc.

## 11-05 Instaladores, ejecutables y actualizadores
MSI/MSIX, dmg/pkg y notarización, deb/rpm/AppImage/Flatpak/Snap (armá un .deb o AppImage mínimo real y mostralo por dentro: retomá [@02-xx] paquetes), firma de código, actualizadores automáticos (Squirrel, Sparkle, electron-updater) y su riesgo de cadena de suministro.

## 11-06 Offline, archivos y dispositivos en escritorio
Acceso a archivos y permisos, sandbox de escritorio (macOS App Sandbox, Flatpak portals), impresoras y drivers (CUPS), lectores de código de barras/balanzas (HID/serie: muy presentes en depósitos), bases locales (SQLite) y sincronización. Demo: leer un «lector» simulado por stdin/puerto serie virtual.

## 11-07 El panorama del software empresarial
Sistemas de registro vs de compromiso, suites vs best-of-breed, on-premise vs SaaS, quién compra y cómo (licencias, implementadores), mapa de siglas (ERP, CRM, SCM, WMS, TMS, MES, HCM, BI). Un mapa en diagrama.

## 11-08 ERP: SAP, Oracle, Odoo y Dynamics
Qué es un ERP (un modelo de datos compartido: contabilidad, compras, ventas, stock), módulos, personalización vs configuración y por qué los proyectos de ERP fracasan (casos documentados con fuente seria, p. ej. informes públicos), Odoo como ERP abierto (licencias LGPL/Enterprise: verificá). Mini-ERP inventado en SQL para mostrar el asiento que une ventas, stock y contabilidad.

## 11-09 CRM y facturación
CRM (contactos, oportunidades, embudo), Salesforce/HubSpot (doc), facturación electrónica (ARCA: retomá [@08-16]; CAE, tipos de comprobante: verificá doc oficial vigente), integración CRM–ERP. Embudo con datos inventados y su SQL.

## 11-10 TMS y WMS: el software de la logística
WMS (recepción, ubicaciones, picking, olas, inventario cíclico), TMS (planificación de cargas, ruteo, seguimiento, prueba de entrega), optimización de rutas (VRP: por qué es difícil: retomá complejidad [@03-32]; corré un VRP chico con OR-Tools si instala por pip, con direcciones inventadas), última milla, integración con ERP y e-commerce. El día más cercano al fundador: precisión en el vocabulario, sin datos de mercado sin fuente.

## 11-11 MES, SCADA e industria
MES, SCADA, PLC, tecnología operativa vs TI, protocolos (Modbus, OPC UA: doc), por qué la seguridad industrial es distinta (sistemas de 20 años, disponibilidad primero), ISA-95 como mapa. Demo: un servidor/cliente Modbus de juguete con una biblioteca Python si instala; si no, tramas explicadas.

## 11-12 Gestión documental y flujos de trabajo
Gestión documental, BPM y motores de flujo (BPMN: un diagrama real simple), firma electrónica y firma digital (Argentina: Ley 25.506, verificá texto oficial; no es asesoramiento legal), aprobaciones, RPA a nivel de idea. Una máquina de estados de aprobación corrida.

## 11-13 BI y planificación
BI (tableros, métricas, modelo dimensional: retomá [@09-16]), herramientas (Power BI, Tableau, Looker, Metabase: doc y licencias), planificación S&OP, por qué Excel sigue ganando. Un tablero mínimo de logística con datos inventados (SQL + una tabla/gráfico SVG del armador).

## 11-14 Sistemas heredados y modernización
Qué es un sistema legado (funciona y nadie quiere tocarlo), COBOL y mainframes hoy (retomá [@03-47]), riesgos de reescribir (retomá [@07-27]), patrón estrangulador (Fowler: verificá), capa anticorrupción (retomá [@08-15]), migraciones por etapas. Caso inventado de logística.

## 11-15 Cierre de la Parte 11: el mapa del software empresarial (tipo R)
Mapa empresarial (escritorio → sistemas de registro → logística e industria → flujos y BI → legado), un caso recorrido (un pedido que atraviesa CRM, ERP, WMS, TMS y BI), tabla «pregunta típica → día», 8–12 preguntas. Al final.
