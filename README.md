# Consultorio-123

**Tu consultorio, en color.**

Software de gestión para consultorios médicos, clínicas privadas y consultorios dentales. Construido sobre la misma arquitectura sin nube de [friendly-123](https://github.com/jfcarpiopuntocom/friendly-123): PWA local-first, sin servidor obligatorio, sin suscripción.

Por Manuel Garcia de Cuenca y J. F. Carpio.

---

## v1.0 — Módulos

- **Ingresos** — caja chica + bancos, registro por paciente/concepto/forma de pago
- **Inventario** — costo de venta automático (inicial + compras − final)
- **Cuentas por Cobrar** — tratamientos en cuotas, saldo pendiente por paciente
- **Estado de Resultados** — alimentado automáticamente por los 3 módulos anteriores, margen bruto/neto

## Pensado para v2.0 (arquitectura modular desde ya)

- Agenda de citas + integración Google Calendar / Outlook
- Historial de pacientes
- Control de gastos variables
- Dashboard con indicadores mensuales
- Reportes PDF/Excel
- Roles (médico / admin / asistente)
- Respaldo automático en la nube

## Plataformas objetivo

Web/PWA instalable, con meta de empaquetado para Android, iOS, Windows y Mac. Datos siempre locales al dispositivo.

## Correr localmente

```bash
npm install
npm start
```

---

## Datos y privacidad

Ver [PRIVACY.md](./PRIVACY.md). Los datos del consultorio no salen del dispositivo.

## Licencia

Ver `LICENSE`.
