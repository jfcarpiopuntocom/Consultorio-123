# Plan de fortalecimiento — consultorio-123

Base: `_private/RESEARCH-POSICIONAMIENTO.md`. Documento interno.

Posición que guía todo el plan:

> **el cuaderno digital compartido para consultorios que se niegan a depender
> de la nube.**

No competir en features. La incompletitud es deliberada. Cada fase de abajo
protege o refuerza esa posición; nada agrega features "porque el SaaS las tiene".

---

## Fase 0 — Descubrimiento (COMPLETADO, con evidencia)

Verificaciones hechas sobre el código real, no supuestos:

| Hallazgo | Evidencia | Estado |
|---|---|---|
| Repo público con licencia MIT | `gh repo view` → `isPrivate: false`, `licenseInfo: MIT License`; `LICENSE` línea 1 | Confirmado |
| `package.json` declara ISC, contradiciendo el `LICENSE` MIT | `grep '"license"' package.json` → `"ISC"` | Confirmado |
| **Las 3 apps comparten origen y colisionan en localStorage** | En vivo: `location.origin` = `https://jfcarpiopuntocom.github.io` para las 3; `Object.keys(localStorage)` en consultorio-123 devuelve **12 claves `f123_*` y 0 `c123_*`** | **Confirmado en producción** |
| 33 claves distintas con prefijo `f123_` en el código de consultorio-123 | `grep -roh 'f123_[a-z_0-9]*' docs/*.js \| sort -u \| wc -l` → 33 | Confirmado |
| El gating de licencia existe (worker + estados) | `cloudflare-worker-licencias/worker.js` → `ESTADOS_VALIDOS = ["minima","full","bloqueada"]` | Confirmado |
| `licenciaLimitada()` lee una clave obsoleta y un estado que ya no existe | `mock-backend.js:290-292` lee `f123_owned` y compara con `"limitada"`, estado retirado del worker | **Roto** |
| No hay onboarding de "Añadir a pantalla de inicio" | Solo un comentario en `index.html:80`; ningún flujo en `welcome-ui.js` ni `tutorial-ui.js` | Ausente |
| Sync propio SÍ está desplegado | `consultorio123-sync-relay.jfcarpio.workers.dev` (Durable Objects, E2E) | Existe pero no se comunica |

**API/recursos permitidos para las fases siguientes** (usar SOLO estos, no
inventar): `AMG.Hechos` (`registrar`, `todos`, `verificarCadena`,
`_guardarDirecto`), `AMG.CxC`, `AMG.Ingresos`, `AMG.Inventario`,
`AMG.EstadoResultados`, `AMG.Agenda`, `AMG.Respaldo`, `OCI18n` (`t`, `setLang`,
`getLang`), `window.C123Gate`, `OCBarcode.code128SVG`.

---

## Fase 1 — CRÍTICA: aislar el almacenamiento de las 3 apps

**El problema, en una línea:** GitHub Pages sirve las tres apps desde el mismo
origen (`jfcarpiopuntocom.github.io`), y localStorage es por ORIGEN, no por
carpeta. Como consultorio-123 heredó las 33 claves `f123_*` de friendly-123,
**las tres apps se pisan los datos entre sí en el mismo navegador**: PINs,
intentos de acceso, fotos, preferencias de respaldo y estado del negocio.

Un médico que abra consultorio-123 en el navegador donde antes se abrió
friendly-123 hereda el PIN y el estado del otro negocio. Es pérdida de datos y
un agujero de privacidad entre clientes distintos.

**Qué implementar:**
1. Renombrar las 33 claves `f123_*` → `c123_*` en todo `docs/*.js` de
   consultorio-123. Copiar el patrón de nombres ya usado en las claves que sí
   se migraron (`c123_lang`, `c123_sync_room`, `c123_cf_worker_url`).
2. Escribir una migración única y silenciosa: al arrancar, si existe una clave
   `c123_*` no hacer nada; si NO existe pero sí existe su `f123_*`, **copiarla**
   (no moverla — friendly-123 puede estar en uso en el mismo navegador).
   Marcar con `c123_migrado_v1` para no repetir.
3. Hacer lo mismo con el nombre de la base IndexedDB: hoy las tres usan
   `amg_hechos_db`. consultorio-123 debe usar `c123_hechos_db`.

**Verificación:**
- [ ] `grep -c 'f123_' docs/*.js` → 0 fuera del bloque de migración
- [ ] En la URL live, con localStorage vacío: crear PIN, recargar, entra bien
- [ ] Abrir friendly-123 live en el mismo navegador: su PIN sigue funcionando y
      no ve datos del consultorio
- [ ] `indexedDB.databases()` muestra `c123_hechos_db` separada de `amg_hechos_db`

**Anti-patrones:** no borrar las claves `f123_*` (romperías friendly-123 en ese
navegador). No hacer la migración en cada arranque. No inventar un "namespace
global" nuevo: usar el prefijo que ya existe.

---

## Fase 2 — Propiedad intelectual: dejar de regalar el producto

**El problema:** hoy el repo es público con MIT. Cualquiera puede clonar,
renombrar y vender consultorio-123 legalmente — incluido el diseño contable de
Manuel García. Esto contradice el modelo de licencia perpetua y es exactamente
la amenaza "copia por competidores en 3–6 meses" del research.

**Decisiones que son de JFC y Manuel, no mías — preguntar antes de ejecutar:**

| Opción | Qué implica |
|---|---|
| A. Repo privado + Pages desde rama pública mínima | El código fuente deja de ser público; solo se publica el build. Máxima protección, requiere separar build de fuente. |
| B. Licencia propietaria en repo público | El código se ve pero no se puede usar comercialmente. Protege legalmente sin esconder nada. Coherente con "verifícalo tú mismo" del manifiesto no-cloud. |
| C. Dual: núcleo propietario + partes MIT | Más trabajo de mantener; útil si se quiere comunidad. |

**Recomendación:** opción B. El argumento de venta del producto es "abre
DevTools y compruébalo tú mismo" — esconder el código lo debilita. Una licencia
propietaria bien redactada frena la clonación comercial sin perder esa
transparencia.

**Qué implementar una vez decidido:**
1. Reemplazar `LICENSE` por el texto elegido, con copyright a nombre de
   **Manuel García de Cuenca y J. F. Carpio** (ambos, no solo JFC — es obra
   conjunta y el nombre de Manuel va primero).
2. Corregir `package.json` (`"license"` hoy dice ISC) para que coincida.
3. Encabezado de licencia corto en `index.html` y en cada `nucleo-*.js`.
4. Nada de esto toca la UI del cliente.

**Verificación:**
- [ ] `LICENSE`, `package.json` y `README.md` dicen lo mismo
- [ ] `gh repo view --json licenseInfo` refleja la licencia nueva
- [ ] El texto nombra a los dos autores en el orden acordado

**Anti-patrón:** no inventar cláusulas legales. Usar un texto estándar conocido
(ej. licencia propietaria/comercial de plantilla) y que JFC lo revise.

---

## Fase 3 — Blindar la debilidad real: iOS y pérdida de datos

El research marca esto como el riesgo técnico #1: en iOS, Safari puede purgar
el almacenamiento de una PWA no instalada, y el respaldo depende del usuario.

**Qué implementar:**
1. **Onboarding de instalación, detectando plataforma.** En iOS Safari mostrar
   una vez, tras el primer login, cómo hacer "Compartir → Añadir a pantalla de
   inicio", explicando en una línea por qué importa (los datos viven aquí). En
   Android/escritorio, usar el evento `beforeinstallprompt` si está disponible.
   Reusar el patrón de tarjeta de `welcome-ui.js`, no inventar un modal nuevo.
2. **Persistencia explícita:** llamar a `navigator.storage.persist()` tras el
   primer login y registrar el resultado. Si el navegador la niega, subir el
   tono del recordatorio de respaldo.
3. **Recordatorio de respaldo con dientes:** `backup-scheduler.js` ya existe.
   Conectarlo a un aviso no descartable si pasaron N días sin exportar, con el
   botón de exportar a un toque. El mínimo mensual no es negociable.
4. **Arreglar `licenciaLimitada()`** (`mock-backend.js:290`): lee `f123_owned`
   y compara contra `"limitada"`, un estado que el worker ya no emite. Hoy
   siempre devuelve false, así que los topes del plan gratis no se aplican.

**Verificación:**
- [ ] En iOS (o emulando user-agent), el aviso de instalación aparece una vez y
      no vuelve tras instalarse (`display-mode: standalone`)
- [ ] `navigator.storage.persisted()` devuelve true tras aceptar
- [ ] Forzando la fecha del último respaldo a 40 días atrás, el aviso aparece
- [ ] `licenciaLimitada()` devuelve true con `c123_owned.licenseEstado = "minima"`

**Anti-patrones:** no usar APIs que Safari no soporta (nada de
`beforeinstallprompt` en iOS: ahí es instrucción manual). No prometer en la UI
que los datos están a salvo si `persist()` fue denegado.

---

## Fase 4 — Matar la percepción de "incompleto" mostrando lo que ya existe

El research dice que el mayor riesgo de imagen es parecer incompleto. Pero
sync, roles, integridad y agenda **ya están construidos y desplegados** — y en
ninguna parte se le dice al usuario. La debilidad no es técnica, es de
comunicación.

**Qué implementar:**
1. Una vista o sección de Avanzado que muestre en lenguaje llano lo que el
   producto ya garantiza: sync entre dispositivos (con su código de sala),
   roles con PIN separado, historial con cadena de hash verificable (botón
   "Verificar historial" ya existe en Respaldo), respaldo soberano, agenda con
   exportación a Google Calendar y Outlook.
2. Probar el sync end-to-end entre dos navegadores contra el relay ya
   desplegado y documentar el resultado. Hoy nadie ha verificado que funcione
   en consultorio-123.
3. Documentar explícitamente lo que NO hace y por qué (sin HCE, sin
   facturación): convertir la objeción en postura. Va al manual, no a la UI.

**Verificación:**
- [ ] Dos navegadores con el mismo código de sala ven el mismo movimiento
- [ ] "Verificar historial" responde correctamente sobre datos reales
- [ ] La sección nueva no inventa capacidades que no existen

**Anti-patrón:** no anunciar "respaldo en la nube" ni nada que contradiga el
manifiesto local-first.

---

## Fase 5 — Decisión de mercado: facturación electrónica (SRI)

El research lo marca como posible deal-breaker en Ecuador y México. Es una
decisión de producto de JFC y Manuel, no técnica.

Tres caminos, con su consecuencia:
- **No hacerlo** (coherente con el posicionamiento): hay que decirlo claro en
  el material de venta, y aceptar que se pierden clínicas que facturan.
- **Exportar en formato que el contador use** (CSV/Excel compatible): mucho
  menos trabajo, cubre buena parte del dolor sin volverse un POS.
- **Integrar SRI**: rompe la promesa de "no es un POS" y trae carga regulatoria
  por país.

**Recomendación:** el camino intermedio. Es el que menos compromete la posición.

---

## Fase 6 — Verificación final

- [ ] Las 3 apps abren en el mismo navegador sin pisarse datos (Fase 1)
- [ ] Licencia coherente en `LICENSE`, `package.json`, `README.md` (Fase 2)
- [ ] `grep -rn 'f123_' docs/*.js` → solo el bloque de migración
- [ ] Sin texto invisible: ningún `-bg` de fondo con `-dk` de texto
- [ ] Semáforo en 5 colores, sin azul, un tono plano por estado
- [ ] Sin rayas horizontales detrás de contenido (nada de CRT)
- [ ] La URL live carga, se navega y el PIN funciona con localStorage limpio
- [ ] `sw.js` con caché bumpeado y `version.json` al día

---

## Orden recomendado

1. **Fase 1** (colisión de datos) — es un bug de pérdida de datos en producción.
2. **Fase 2** (licencia) — cada día que pasa el producto es legalmente copiable.
3. **Fase 3** (iOS y respaldo) — protege al cliente.
4. **Fase 4** (comunicar lo construido) — barato, alto impacto comercial.
5. **Fase 5** (SRI) — decisión, no ejecución.

Las fases 2 y 5 requieren decisión de JFC y Manuel antes de tocar nada.
