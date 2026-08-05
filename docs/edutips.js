/*!
 * edutips.js — Consultorio-123 · Tip contable del día
 * ============================================================================
 * Adaptado de edutips.js (friendly-123). Una reflexión corta al pie del
 * Estado de Resultados que enseña a leer los números que ya están en
 * pantalla — no agrega un número nuevo. Un tip por día, determinístico (el
 * mismo índice todo el día según la fecha), para que no cambie bajo los ojos
 * del dueño si recarga la página varias veces.
 * ============================================================================
 */
(function (global) {
  "use strict";

  var TIPS = [
    "Si tu margen bruto cae mes a mes sin que hayas bajado precios, revisa el costo de venta: puede ser que estés comprando insumos más caros o desperdiciando material.",
    "La utilidad neta no es \"lo que te queda para gastar\" — primero separa lo que vas a reinvertir en el consultorio (equipo, insumos) antes de tocarla.",
    "Un margen neto negativo un mes no es una emergencia si sabes por qué (una compra grande de inventario, por ejemplo). Es emergencia si no puedes explicarlo.",
    "Las cuentas por cobrar no son ingreso todavía. Un tratamiento a 4 cuotas grande puede verse bien en el papel y dejarte sin caja el mes que necesitas pagar arriendo.",
    "Compara tu margen bruto (antes de gastos fijos) con tu margen neto (después). Si la diferencia es enorme, tus gastos fijos están comiéndose la ganancia — vale la pena revisarlos.",
    "El costo de venta de un mes con poca actividad puede verse alto si compraste insumos por adelantado. Míralo en promedio de 2-3 meses, no aislado.",
    "Cobrar puntual no es solo cuestión de caja: cada cuota pendiente que se alarga es dinero que ya trabajaste y todavía no es tuyo.",
  ];

  function tipDeHoy() {
    var hoy = new Date();
    var diaDelAno = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 86400000);
    return TIPS[diaDelAno % TIPS.length];
  }

  global.AMG = global.AMG || {};
  global.AMG.EduTips = { VERSION: "1.0.0", tipDeHoy: tipDeHoy };
})(typeof window !== "undefined" ? window : this);
