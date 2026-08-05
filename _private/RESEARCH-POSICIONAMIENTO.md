# Research de posicionamiento — consultorio-123

Investigación aportada por JFC (2026-08-05). Documento interno: **nada de esto
va a la UI ni al material del cliente**. Es la base estratégica del plan de
fortalecimiento.

---

## 1. Panorama de alternativas

El software médico en LATAM y España es un océano rojo: todos compiten por ser
el SaaS cloud más completo.

### A. SaaS cloud todo-en-uno (suscripción, datos en su nube)

| Producto | Mercado | Precio aprox. | Qué hace | Por qué no somos eso |
|---|---|---|---|---|
| MedsAdmin | Ecuador | $40/mes + extras | HCE, recetas, facturación SRI, agenda WhatsApp | POS + HCE completo, suscripción perpetua |
| Clinic Cloud | España/LATAM | 57–90 EUR/mes | Agenda multicentro, HCE, facturación, VeriFactu | Cloud 100%, móvil lento, sin offline real |
| Medesk | LATAM | SaaS | PMS completo: agenda, HCE, facturación, inventario | Todo en su servidor, sin local-first |
| Luna Salud | México | No público | Inventario médico integrado a HCE en tiempo real | Grandes clínicas y laboratorios |
| Doctolib / Doctoralia | Europa/LATAM | 25–300 EUR/mes | Directorio + agenda + marketing | Captación de pacientes, no gestión interna |
| Medicloud / DrApp / Turnito | Argentina | $14.400–$26.900 ARS/mes | Turnos, HCE, recetas, cobros | Ninguno es inventario-first |

**Dato clave:** el coste total de propiedad a 3 años de un SaaS médico estándar
va de **5.500 a 7.500 EUR** (suscripción + formación + migración + módulos).
Ese es el dolor que eliminamos.

### B. Inventario médico específico

| Producto | Modelo | ¿Offline? | Nota |
|---|---|---|---|
| ArbiMed | Cloud/SaaS | No | Análisis de transacciones |
| Medilink | Cloud | No | Insumos, alertas de stock, vencimientos |
| Medinven | iPad + cloud sync | Parcial | Escaneo HIBC/RFID, inventario de campo |

Ninguno es un cuaderno digital compartido: son sistemas de stock con mentalidad
de almacén, no de consultorio.

### C. Local-first / privacy-first (primos lejanos)

| Producto | Tipo | Hace bien | No hace |
|---|---|---|---|
| Pain Tracker (CrisisCore) | PWA open source | Local-first real, IndexedDB, cifrado | Es para pacientes, no clínicas |
| ItemMind | iOS nativo | Inventario 100% offline, sin cuentas | Hogares, no médico, sin multiusuario |
| Retinelle | iOS | Inventario privado, sin server | Sin enfoque médico ni compartido |

**Vacío identificado:** no existe una PWA local-first, multiusuario, con lenguaje
de colores, diseñada para que un consultorio funcione como cuaderno digital
compartido sin depender de la nube.

---

## 2. PWA para consultorio: pros y contras

| A favor | En contra |
|---|---|
| Sin fricción de instalación: se abre el navegador y ya | Discovery difícil: no estamos en tiendas de apps |
| Actualizaciones invisibles, críticas para el soporte | iOS es el enemigo: Safari limita push, background sync y persistencia |
| Cross-platform real: escritorio, tablet y móvil con una codebase | Sin app store optimization |
| Local-first posible: SW + IndexedDB, datos nunca salen | El respaldo es responsabilidad del usuario |
| Sin comisión del 30% de Apple/Google | Percepción de "menos profesional" que un software instalado |
| Ligero, no ocupa GB | Dependencia del navegador |

**Veredicto:** para un producto local-first, privacy-first y sin suscripción, la
PWA es la única arquitectura que tiene sentido. Hay que mitigar iOS con
onboarding que enseñe "Añadir a pantalla de inicio" y con exportaciones locales
automáticas.

---

## 3. FODA

### Fortalezas
- Modelo antifrágil: licencia perpetua, sin sangrado mensual.
- Soberanía de datos: todo en el dispositivo. En LATAM, con conectividad
  inestable y desconfianza hacia la nube, es posicionamiento, no solo técnica.
- Sistema Simon: colores en vez de hojas de cálculo, baja la barrera para
  personal no técnico.
- Made in Cuenca / jfcarpio + avatiun: marca con cara y credibilidad técnica.
- No es POS: se evita la complejidad regulatoria de facturación por país.
- Multi-ubicación real (sedes/oficinas físicas).

### Oportunidades
- Fatiga de suscripción: clínicas pequeñas hartas de pagar $40–120/mes por
  software que usan al 20%.
- Regulación de datos de salud (GDPR, HIPAA, NOM-024 en México, ley de datos
  en Ecuador) hace que "sin nube" sea argumento de venta cada vez más fuerte.
- Brecha digital: muchos consultorios siguen en papel o Excel. No quieren un
  ERP médico, quieren un cuaderno que no se pierda.
- Escasez de software médico offline-first.
- Sin lock-in de proveedor, la recomendación entre colegas no tiene fricción.
- Etiquetas imprimibles: puente físico-digital que el SaaS cloud hace mal.

### Debilidades
- **Sin sync entre dispositivos** (nota: ya está construido y desplegado, ver
  plan — la debilidad real es que no se comunica ni se prueba).
- Recuperación depende del usuario: sin servidor no se resetean PINs ni se
  recuperan datos si olvidó el correo.
- Sin facturación electrónica: en Ecuador (SRI) o México (SAT) puede ser
  deal-breaker.
- Descubrimiento: marketing 100% inbound/directo.
- Percepción de "menos completo" frente a MedsAdmin o Medesk.
- Dependencia del navegador y del dispositivo.

### Amenazas
- Gigantes bajando precios o lanzando plan básico gratuito.
- Cambio regulatorio que exija datos en servidores certificados.
- Mejora de conectividad diluye el argumento offline.
- **Copia por competidores: un SaaS podría clonar el sistema Simon en 3–6 meses.**
- Cambios en políticas de navegadores sobre almacenamiento local.
- Expectativa de mercado de "todo integrado" (HCE + facturación + agenda):
  elegimos no hacerlo, pero eso exige educar al mercado.

---

## 4. Porter invertido — dónde están atrapados los grandes

En vez de preguntar "¿cómo nos posicionamos?", se pregunta "¿dónde están los
competidores atrapados y qué nichos dejan libres?".

| Estrategia | Dónde están atrapados | Qué deja libre |
|---|---|---|
| Cost leadership | Para sostener $40–90/mes deben estandarizar y eliminar personalización | **Cost focus:** licencia perpetua, amortizada cuesta una fracción; estructura de costos mínima |
| Diferenciación amplia | Doctolib/Doctoralia dependen de infraestructura cloud masiva | **Differentiation focus:** ser el único que garantiza que los datos nunca salen del dispositivo |
| Nicho | Los nichos cloud siguen asumiendo "más features, más integraciones" | **Nicho invertido:** menos features, más control |

**La paradoja que se explota:** los grandes no pueden copiarnos sin destruir su
modelo. Si Medesk lanza "offline sin suscripción", mata su MRR. Si Clinic Cloud
dice "tus datos nunca salen", pierde su ventaja de acceso desde cualquier lugar.

---

## 5. Blue Ocean — matriz ERRC

| Acción | Océano rojo | consultorio-123 |
|---|---|---|
| **Eliminar** | Suscripción obligatoria, servidores cloud, HCE compleja, facturación | Licencia perpetua, datos locales, sin HCE, sin facturación |
| **Reducir** | Complejidad de onboarding, clicks por operación, dependencia de red, TCO | Onboarding de 5 min, un toque = una operación, cero red, TCO 10x menor |
| **Elevar** | Inventario como almacén, opacidad sobre quién tiene los datos | Inventario por sedes reales, trazabilidad total, privacidad extrema |
| **Crear** | — | Sistema Simon, cuaderno digital compartido con PIN separado para contabilidad, etiquetas físicas imprimibles, cierre de día |

La curva de valor es **anti-correlacionada** con la del SaaS estándar: no somos
una versión peor del SaaS, somos otra categoría para otro usuario.

---

## Conclusión estratégica

La posición no es "software médico barato". Es:

> **el cuaderno digital compartido para consultorios que se niegan a depender
> de la nube.**

- No competir en features con MedsAdmin ni Clinic Cloud.
- No intentar ser un POS.
- Ser el estándar del consultorio que tiene un rack de insumos, una asistente
  que anota en papel, y un médico que quiere saber qué comprar hoy antes de abrir.

El mayor riesgo es la percepción de "incompleto". La mayor oportunidad es que
**la incompletitud es deliberada**: se hace una sola cosa mejor que nadie y se
elimina todo lo demás.
