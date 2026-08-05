/*!
 * help.js — Consultorio-123 · Ayuda contextual
 * ============================================================================
 * Adaptado de help-ui.js (friendly-123): un enlace discreto, no una burbuja
 * de chat flotante — abre una hoja con explicación breve de los 4 módulos y
 * cómo se relacionan entre sí. window.C123Help.abrir() para invocarlo desde
 * cualquier botón "?".
 * ============================================================================
 */
(function (global) {
  "use strict";

  var CONTENIDO =
    '<h3>Ingresos</h3><p>Registra cada entrada de dinero real: caja chica (efectivo) o bancos (transferencia, tarjeta, cheque). Esto alimenta directamente el Estado de Resultados.</p>' +
    '<h3>Inventario</h3><p>Anota tus artículos con precio, inventario inicial, compras y final. El costo de venta se calcula solo: inicial + compras − final.</p>' +
    '<h3>Cuentas por cobrar</h3><p>Registra un tratamiento con su valor total y pago inicial. Cada abono posterior se anota aparte. El saldo pendiente se calcula solo — nunca lo editas a mano.</p>' +
    '<h3>Estado de resultados</h3><p>Se llena solo con Ingresos e Inventario. Tú solo agregas los gastos fijos del mes (salarios, arriendo, servicios, impuestos, varios).</p>' +
    '<h3>¿Por qué un abono de paciente no aparece solo en Ingresos?</h3><p>A propósito: tú decides cuándo un cobro entra a caja de verdad. Si cobraste una cuota en efectivo, regístrala también en Ingresos.</p>' +
    '<h3>Tus datos</h3><p>Todo vive en este dispositivo. Nada sale a internet. Usa "Respaldo de datos" en el menú para guardar una copia periódica.</p>';

  function montar() {
    var overlay = document.createElement("div");
    overlay.id = "help-overlay";
    overlay.className = "help-overlay";
    overlay.innerHTML =
      '<div class="help-sheet" role="dialog" aria-label="Ayuda">' +
      '<div class="help-sheet-header"><h2>Ayuda</h2><button id="help-cerrar" class="help-cerrar" aria-label="Cerrar">✕</button></div>' +
      '<div class="help-sheet-cuerpo">' + CONTENIDO + "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) cerrar(); });
    document.getElementById("help-cerrar").addEventListener("click", cerrar);
    return overlay;
  }

  var overlayEl = null;
  function abrir() {
    if (!overlayEl) overlayEl = montar();
    overlayEl.classList.add("help-overlay--abierto");
  }
  function cerrar() {
    if (overlayEl) overlayEl.classList.remove("help-overlay--abierto");
  }

  global.C123Help = { abrir: abrir, cerrar: cerrar };
})(typeof window !== "undefined" ? window : this);
