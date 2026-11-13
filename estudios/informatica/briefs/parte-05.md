# Parte 5: Redes e Internet. Notas por día.
Contexto: el estudiante ya sabe qué es un SO, procesos, archivos, la terminal, bits y programar en JS (Partes 1 a 4). Esta parte explica cómo viajan los datos. Todo lo que se pueda se muestra corriendo de verdad: `ip`, `ss`, `dig`, `curl -v`, `openssl s_client`, `tcpdump`/`tshark` si se pueden instalar, sockets de Python/Node en localhost, `ping` y `traceroute` si el entorno los permite. LIMITACIÓN DEL ENTORNO: la salida a Internet pasa por un proxy HTTPS; ICMP, UDP y DNS directos pueden estar bloqueados o filtrados. Probá primero qué anda y rotulá cada medición («medido en esta VM, detrás de un proxy: no representa una conexión doméstica»). Lo que no se pueda correr, se muestra con capturas armadas a mano claramente rotuladas como ilustrativas, o con tráfico generado en localhost. Nunca escanees ni ataques redes ajenas; solo localhost y tus propios programas. Logística: los paralelos con rutas, depósitos, cross-docking y etiquetas de envío sirven, con su límite dicho. Senda como caso solo en 05-31 y apariciones breves y verificadas (senda/mapa-tecnico.md).

## 05-01 Qué es una red y por qué se inventó
Para qué sirve conectar máquinas, conmutación de circuitos (telefonía) vs de paquetes (Baran, Davies, Kleinrock: verificá fuentes serias), ARPANET 1969 y el primer mensaje, nodo, paquete, por qué se parte la información. Demo: partí un mensaje en paquetes numerados y rearmalo desordenado en un programa corto. Verificá fechas en fuente primaria (p. ej. RFC 2555, Internet Society, Computer History Museum).

## 05-02 Capas y modelos: OSI y TCP/IP
El problema que resuelven las capas, modelo OSI de 7 y TCP/IP de 4/5 y por qué se enseñan ambos (OSI fue un estándar que perdió frente a TCP/IP en la práctica: verificá), encapsulamiento y PDU con un ejemplo concreto de bytes (armá una trama Ethernet+IP+TCP+HTTP de mentira y mostrá qué cabecera agrega cada capa; mejor aún, capturá una real en loopback con tcpdump/tshark o Scapy). Diagrama `capas`. Analogía honesta: sobres dentro de sobres, con su límite.

## 05-03 Ethernet, switches y direcciones MAC
LAN, Ethernet (Metcalfe, 1973-76: verificá), la trama, dirección MAC (OUI, 48 bits, unicast/broadcast), cómo un switch aprende (tabla MAC: simulá la tabla en código), diferencia con el hub, colisiones y CSMA/CD solo como historia. Mostrá las MAC de las interfaces de esta VM con `ip link`. Mencioná la aleatorización de MAC en teléfonos (verificá en doc de Android/Apple).

## 05-04 Wi-Fi y radio
Qué es Wi-Fi (IEEE 802.11 y la marca de la Wi-Fi Alliance), bandas 2,4/5/6 GHz, canales y solapamiento, SSID, punto de acceso, interferencia, por qué la velocidad anunciada no es la real (medio compartido, half-duplex), generaciones (Wi-Fi 4/5/6/6E/7: verificá tabla con fecha), seguridad WPA2/WPA3 solo a nivel de idea (cifrado vendrá después). El entorno no tiene radio: no inventes mediciones; calculá ejemplos (p. ej. tiempo de aire) y rotulalos. Senda no aparece.

## 05-05 Direcciones IP versión 4
Dirección IP como etiqueta de ubicación (no de identidad), IPv4 de 32 bits, octetos, notación decimal con puntos, clases como historia, hosts, direcciones especiales (loopback 127/8, 0.0.0.0, broadcast, link-local 169.254/16: RFC 1122, RFC 3927). Widget `cidr` si sirve. Mostrá `ip addr` real de la VM. Ejercicios de conversión binaria↔decimal (retomá Parte 0/1).

## 05-06 Subredes, máscaras y CIDR
Máscara de subred, notación `/24`, CIDR (RFC 4632), calcular red, broadcast, rango de hosts y cantidad de direcciones, direcciones privadas (RFC 1918), por qué se divide una red, agregación de rutas. Usá el widget `cidr` y verificá cada cálculo con el módulo `ipaddress` de Python (mostrá el código corrido). Logística: el paralelo con zonas de reparto, con límite.

## 05-07 IPv6
Agotamiento de IPv4 (fechas de IANA y RIR: verificá en fuente oficial), IPv6 de 128 bits, notación abreviada, tipos (global, link-local fe80::/10, ULA), por qué no hay NAT «necesario», adopción con porcentaje FECHADO (Google IPv6 statistics o APNIC: verificá en vivo y citá fecha), coexistencia (doble pila, túneles). Mostrá `ip -6 addr` y expandí/abreviá direcciones con `ipaddress`. Argentina: adopción según APNIC/Google si hay dato (rotulá fuente y fecha).

## 05-08 Routers y el camino de un paquete
Qué hace un router, tabla de ruteo (mostrá `ip route` real), salto y TTL, longest prefix match (implementalo en código corto y probalo), rutas estáticas vs dinámicas, ideas de protocolos de ruteo (OSPF, BGP solo conceptual), sistema autónomo (ASN) y BGP como pegamento de Internet con un incidente real documentado (p. ej. Facebook/Meta 4-10-2021: verificá en el postmortem oficial de Meta y Cloudflare). Diagrama `grafo` de saltos.

## 05-09 Del módem a Internet: ISP, fibra, cable y celular
ISP, last mile, módem/ONT, WAN, tecnologías de acceso (ADSL, cable, fibra FTTH, celular 4G/5G, satélite): rangos típicos con fuente y fecha, simétrico vs asimétrico, CGNAT y por qué tu IP pública no es tuya. Cables submarinos (TeleGeography: verificá cifras y fecha) y puntos de intercambio (IXP; Argentina: CABASE/IXP Buenos Aires, verificá). Logística: el paralelo con la última milla, con su límite.

## 05-10 NAT: por qué tu casa tiene una sola IP pública
Problema (escasez de IPv4), NAT/PAT con tabla de traducciones, IP privada/pública, reenvío de puertos, por qué NAT rompe conexiones entrantes y qué hacen los juegos/VoIP (hole punching, STUN: conceptual, RFC 8489 verificada). Mostrá tu IP privada vs la vista desde afuera si el entorno lo permite (rotulá); simulá una tabla NAT en código. Aclará que NAT no es un firewall de seguridad.

## 05-11 DHCP y ARP: cómo un dispositivo se une a una red
Qué pasa al conectar un teléfono: DHCP (DORA: Discover/Offer/Request/Ack, RFC 2131), arrendamiento de IP, puerta de enlace, DNS que entrega; ARP (RFC 826) para pasar de IP a MAC, tabla ARP (`ip neigh` real), ARP spoofing solo como idea defensiva. Si se puede, capturá DHCP/ARP en una red virtual local (namespace de red: `ip netns` con veth, si el entorno lo permite) y mostrá los paquetes; si no, ilustración rotulada.

## 05-12 DNS I: la agenda de Internet
Por qué existen los nombres (HOSTS.TXT, Mockapetris 1983, RFC 1034/1035), nombre de dominio y jerarquía, tipos de registros (A, AAAA, CNAME, MX, TXT, NS), zona. Consultá registros reales con `dig`/`nslookup`/`getent` (si el DNS directo está bloqueado, probá DNS sobre HTTPS vía curl a un resolvedor público y rotulá). Mostrá el formato binario de un mensaje DNS armado a mano con Python (`struct`) y decodificado.

## 05-13 DNS II: resolución paso a paso, caché y TTL
Resolvedor recursivo vs servidores autoritativos, servidores raíz (13 identidades, cientos de instancias anycast: verificá en root-servers.org), TLD, delegación, caché y TTL (propagación DNS: desmitificá), registrador de dominios vs hosting, `dig +trace` si es posible, DNSSEC/DoH/DoT solo a nivel de idea con RFC. Implementá un resolvedor «de juguete» con una zona inventada. Logística: el paralelo con la guía telefónica/de direcciones, con límite.

## 05-14 Puertos y sockets
Puerto (16 bits), servicios escuchando, puertos conocidos (80, 443, 22, 53; registro IANA: verificá), socket como extremo de comunicación (dirección+puerto+protocolo), la tupla de 5 elementos. Retomá [@02-*] de procesos y descriptores. Demo real: levantá un servidor en localhost, mirá `ss -ltnp`, conectate con `nc`/Python/Node y mirá la conexión. API de sockets BSD (historia 4.2BSD, 1983: verificá). Ejercicio: qué proceso escucha en un puerto.

## 05-15 UDP: rápido y sin garantías
Datagrama, cabecera de 8 bytes (RFC 768, mostrála con `struct`), sin conexión, pérdida y reordenamiento, cuándo conviene (DNS, VoIP, juegos, streaming, QUIC). Demo: emisor y receptor UDP en localhost; simulá pérdida (p. ej. `tc netem` si hay permisos; si no, simulación en el programa) y mostrá que nada se retransmite. Checksum de UDP.

## 05-16 TCP I: conexiones confiables
Por qué hace falta TCP, saludo de tres vías (SYN, SYN-ACK, ACK), números de secuencia y ACK, retransmisión, cierre (FIN), estados (`ss -tan` real), RFC 9293 (verificá que es el estándar vigente que reemplazó a RFC 793). Capturá un saludo real en loopback con tcpdump/tshark/Scapy y anotalo. Diagrama `secuencia`.

## 05-17 TCP II: control de flujo y de congestión
Ventana deslizante, control de flujo (ventana anunciada), congestión (colapso de 1986, Van Jacobson 1988: verificá), slow start, AIMD, RTT, CUBIC y BBR (nombrar con fuente: RFC 9438 CUBIC; BBR papers de Google). Simulá en código la evolución de la ventana y graficala con un diagrama SVG. Mostrá `ss -ti` real con cwnd y rtt en loopback.

## 05-18 HTTP I: el idioma de la web
Tim Berners-Lee y la web (CERN 1989-91: verificá con info.cern.ch), URL, solicitud/respuesta en texto plano, métodos (GET, POST, PUT, DELETE, HEAD), códigos de estado por familia (RFC 9110, la semántica vigente). Hablá HTTP a mano con `nc` o un socket a un servidor local propio y luego `curl -v`. Diagrama `secuencia`. Logística: pedido/remito, con límite.

## 05-19 HTTP II: encabezados, cookies y caché
Encabezados clave (Host, Content-Type, Content-Length, User-Agent, Accept, Authorization), cookies (Set-Cookie, atributos HttpOnly, Secure, SameSite: RFC 6265 y su actualización, verificá estado), caché HTTP (Cache-Control, ETag, If-None-Match, 304), por qué HTTP es sin estado y cómo las cookies lo parchan. Demo: servidor propio en localhost con ETag y pedidos condicionales corridos. Adelanto de sesiones/autenticación sin profundizar (vendrá en Backend y Seguridad).

## 05-20 HTTP/1.1, HTTP/2 y HTTP/3
Problemas de HTTP/1.1 (head-of-line blocking, varias conexiones), HTTP/2 (multiplexación, HPACK, RFC 9113), HTTP/3 sobre QUIC/UDP (RFC 9114 y RFC 9000; verificá), adopción con porcentaje FECHADO (W3Techs o Cloudflare Radar: verificá en vivo). Probá `curl --http1.1/--http2` contra un servidor local (p. ej. nginx/caddy/node http2 si instala) y, si curl lo soporta, `--http3` solo si disponible; si no, doc. Mostrá la diferencia con una tabla comparada.

## 05-21 Criptografía para la red: cifrado simétrico y asimétrico
Confidencialidad, integridad, autenticidad; cifrado simétrico (AES, tamaño de clave), clave compartida y su problema, asimétrico (clave pública/privada, RSA y curvas elípticas a nivel de idea), intercambio de claves Diffie-Hellman (1976: verificá), hash vs cifrado (no confundir), nunca inventar criptografía propia. Demo: AES-GCM y X25519 con `openssl` o el módulo `crypto` de Node (claves de juguete efímeras), DH con números chicos en código para ver la idea (rotulá que es de juguete). Sin secretos reales.

## 05-22 TLS y HTTPS: el candado
Historia SSL→TLS (SSL 2/3, TLS 1.0–1.3; RFC 8446 para 1.3), qué garantiza el candado y qué no, handshake TLS 1.3 paso a paso, claves de sesión, `openssl s_client` real contra un servidor local propio con certificado autofirmado de práctica (y contra un sitio público si el proxy lo permite, rotulado). Diagrama `secuencia`. Mito: «el candado significa que el sitio es confiable».

## 05-23 Certificados y PKI
Certificado X.509 (campos reales de un certificado leído con `openssl x509 -text`), autoridad certificadora, cadena de confianza (raíz, intermedia, hoja), almacenes de confianza, Let's Encrypt (ACME, RFC 8555; validez de 90 días: verificá vigencia), revocación (CRL/OCSP: estado actual, verificá), Certificate Transparency a nivel de idea. Generá tu propia CA de práctica y firmá un certificado local; verificá la cadena.

## 05-24 Firewalls, proxies y VPN
Firewall (filtrado por puertos/estado; `nft`/`iptables` solo lectura o en un namespace propio), proxy (forward) y proxy inverso, VPN y túnel (WireGuard: verificá doc oficial; IPsec solo nombrarlo), para qué sirve cada uno y para qué NO. Nota: este entorno sale a Internet por un proxy: mostrá cómo `HTTPS_PROXY` y CONNECT funcionan (el túnel CONNECT, RFC 9110) sin revelar credenciales ni direcciones internas sensibles. Demo: proxy inverso propio en localhost.

## 05-25 CDN y balanceadores de carga
Qué resuelve una CDN (cercanía, caché, absorber carga), nodo de borde, anycast, balanceador de carga (L4 vs L7, algoritmos: round robin, menos conexiones, hash), health checks, sticky sessions. Demo local: balanceador chico (nginx o Node) frente a dos servidores propios con una caída simulada. Proveedores solo con datos fechados y fuente. Logística: cross-docking/centros de distribución, con límite.

## 05-26 WebSockets y conexiones de larga vida
Problema del polling, long polling, Server-Sent Events, WebSocket (RFC 6455, upgrade desde HTTP, tramas), cuándo usar cada uno, costo de mantener conexiones abiertas (memoria por conexión: medilo con un servidor local y N clientes, rotulado). Demo: chat mínimo local. Senda: la app no usa WebSocket propio salvo que verifiques lo contrario en el código (verificá antes de afirmar; Supabase Realtime: ¿se usa? mirá `src/util/nube*` y el mapa técnico).

## 05-27 Latencia, ancho de banda y la velocidad de la luz
Latencia vs ancho de banda vs throughput, retardo de propagación (velocidad de la luz en fibra ≈ 2/3 c: cálculo Buenos Aires–Virginia/São Paulo con distancias fuente), producto ancho-retardo, por qué más ancho de banda no siempre acelera, regiones de nube cercanas. Calculá y rotulá mínimos físicos vs mediciones reales de la VM (HTTP a un servidor público: tiempos con `curl -w`, rotulado como medido detrás de un proxy). Senda: dónde está la región de Supabase de Senda (verificá en el mapa técnico; si no consta, decilo).

## 05-28 Herramientas de red: ping, traceroute, curl, dig
Qué mide cada una, ICMP, TTL, cómo funciona traceroute (TTL creciente: demostralo con un programa propio si se permiten sockets raw o con la herramienta si hay permisos), `curl` con opciones útiles, `dig`, `ss`, `ip`, `nc`, DevTools de red del navegador (Playwright puede capturar un HAR: usalo). Mostrá qué anda y qué no en este entorno y por qué (proxy/ICMP). Un recetario corto de diagnóstico: «no carga la página» en pasos.

## 05-29 Laboratorio: seguir una solicitud real (tipo L)
`curl -v` y `--trace-time`/`-w` contra un servidor local y uno público, captura de tráfico en loopback con tcpdump/tshark (instalalo si se puede), cronograma de red (DNS, conexión, TLS, primer byte, descarga) con un HAR de Playwright. Al menos 5 ejercicios con solución que corriste.

## 05-30 Qué pasa cuando escribís una URL y apretás Enter
Integración de todo: cache del navegador → DNS → TCP → TLS → HTTP → renderizado (solo mencionado; el navegador se verá en Frontend). Línea de tiempo con tiempos medidos de un caso real armado (HAR) y la capa de cada paso con vínculos [@id] a los días de esta parte. Diagrama `secuencia` y una `linea-tiempo` con milisegundos rotulados.

## 05-31 Senda habla con Supabase: la red real de un toque (tipo S)
Seguí UNA llamada real de Senda a Supabase desde el código (`src/util/nube*`): URL base (sin copiar valores de claves), cabeceras `apikey`/`Authorization` (qué es la clave anónima y qué NO protege: verificá en la doc de Supabase), PostgREST (`/rest/v1/`) y RPC (`/rest/v1/rpc/`), bandeja de salida con reintentos (backoff verificado en el código: tope 320–480 s según mapa técnico), HTTPS/TLS. Armá la solicitud equivalente con un ejemplo INVENTADO contra un servidor local imitando el formato (no llames al Supabase real). Mínimo 2 bloques `senda` y 4 archivos reales. Hallazgos de Senda reales en la hoja de `RETOMAR/VERIFICACION`.

## 05-32 Cierre de la Parte 5: Internet en una página (tipo R)
Mapa de capas de red (de la señal al HTTPS), un recorrido de un toque de punta a punta, repaso de las 31 lecciones con enlaces [@id], 8–12 preguntas. Escribilo al final, cuando existan los demás días.
