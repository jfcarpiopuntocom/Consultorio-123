# Plan — Agenda, Citas y Pagos ligados a citas

Perfilado 2026-08-05 (JFC pidió "ir planeando" esto, no construirlo todavía).

## Por qué esto no es un módulo nuevo aislado

Encaja sobre la arquitectura que ya existe, no al lado de ella:

- **hechos.js** (event-sourcing con cadena de hash) ya es el motor correcto
  para citas: una cita agendada, reagendada o cancelada es exactamente un
  "hecho" — nunca se sobreescribe, se acumula. `cita_agendada`,
  `cita_reagendada`, `cita_cancelada`, `cita_completada` como nuevos tipos
  de hecho, mismo patrón que `cxc_cargo`/`cxc_abono`.
- **cxc.js** (Cuentas por Cobrar) ya modela "tratamiento con valor total +
  pago inicial + abonos". Una cita completada que genera un cobro es un
  `cxc_cargo` normal — no hay que inventar un sistema de pagos nuevo, solo
  conectar "cita completada" → "registrar cargo en CxC" (con el vínculo
  citaId guardado en el payload del hecho, para poder ver el historial de
  pagos de una cita específica).
- **ingresos.js** sigue siendo el único lugar donde un pago se vuelve caja
  real — igual que con CxC, una cita pagada en el momento (no a crédito) se
  registra también como ingreso, decisión del dueño, no automática.

## Integraciones externas (Google Calendar / Outlook)

Dos direcciones posibles, no excluyentes:

1. **Espejo de solo lectura** (más simple, primero): la app expone un feed
   ICS/CalDAV de las citas agendadas localmente, que el médico suscribe
   desde su Google Calendar/Outlook personal. Sin OAuth, sin backend nuevo
   — un archivo `.ics` generado client-side y servido como descarga o URL
   estática si hay sync activado.
2. **Sync bidireccional real** (después, requiere OAuth): usar la API de
   Google Calendar / Microsoft Graph para crear/actualizar eventos cuando
   se agenda una cita en Consultorio-123, y escuchar webhooks de cambios
   del lado del calendario externo. Esto SÍ requiere un backend (el Worker
   de licencias ya desplegado, `consultorio123-licencias`, podría ganar un
   endpoint `/calendar/*` que guarde tokens OAuth por instancia — nunca en
   el cliente).

## Multi-dispositivo / multi-doctor

El relay de sync ya desplegado (`consultorio123-sync-relay`, Durable
Objects) es el mismo canal que usaría la agenda para que dos recepcionistas
en dos dispositivos vean el mismo calendario en vivo — no hace falta
infraestructura nueva, solo un nuevo tipo de mensaje sobre el canal que ya
existe.

## Roles y agenda

Con el candado multi-PIN ya restaurado (dueño/empleado), la agenda se presta
naturalmente a que el rol "asistente/recepcionista" tenga permiso de
agendar/reagendar citas sin ver la capa contable — mismo patrón de
proyección por rol que ya usa `lista-dinamica.js` para "modo restringido".

## Orden sugerido cuando se construya (no ahora)

1. `citas.js` — event-sourcing sobre hechos.js (agendar/reagendar/cancelar/
   completar), igual patrón que cxc.js/ingresos.js.
2. Vista de calendario simple (día/semana) en el nav, visible a
   dueño+empleado.
3. Conexión cita completada → cxc.js (cobro) → opcionalmente ingresos.js
   (si se cobra en el momento).
4. Exportar `.ics` de solo lectura (integración más simple, sin backend).
5. OAuth real con Google/Outlook — requiere ampliar
   `consultorio123-licencias` con endpoints de token, y es la pieza con
   más superficie de seguridad (tokens de terceros) — se hace con más
   cuidado y probablemente su propio Worker separado, no mezclado con
   licencias.
