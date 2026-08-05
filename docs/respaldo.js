/*!
 * respaldo.js — Consultorio-123 · Respaldo soberano de datos
 * ============================================================================
 * Adaptado de backup-scheduler.js (friendly-123). Misma filosofía: "el
 * respaldo va a TI, no a nosotros". Sin backend propio todavía (eso es v2.0,
 * "respaldo automático en la nube"), así que v1.0 hace lo más automático
 * posible sin servidor: exporta un .json con TODOS los datos del consultorio
 * (hechos de ingresos/CxC + inventario + gastos fijos) y lo descarga al
 * dispositivo. El dueño lo guarda donde quiera — correo propio, USB, Drive.
 *
 * Importar restaura los hechos tal cual (misma cadena de hash, mismos ids) —
 * no duplica nada porque hechos.js usa "put" (upsert) por id, así que
 * reimportar un respaldo ya aplicado es inofensivo (idempotente).
 * ============================================================================
 */
(function (global) {
  "use strict";

  function exportarTodo() {
    var datos = { version: 1, generado: Date.now() };
    return global.AMG.Hechos.todos().then(function (hechos) {
      datos.hechos = hechos;
      datos.inventario = JSON.parse(localStorage.getItem("c123_inventario_v1") || "[]");
      datos.gastosFijos = JSON.parse(localStorage.getItem("c123_gastos_fijos_v1") || "{}");
      return datos;
    });
  }

  function descargar(datos) {
    var blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var fecha = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "consultorio-123-respaldo_" + fecha + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // Restaura hechos (put por id: idempotente, no duplica) + inventario/gastos
  // (reemplaza tal cual — son snapshots, no flujos, así que "restaurar" es
  // simplemente "usar el snapshot del archivo").
  function importar(datos) {
    if (!datos || !Array.isArray(datos.hechos)) {
      return Promise.reject(new Error("Archivo de respaldo inválido"));
    }
    var escrituras = datos.hechos.map(function (h) {
      return global.AMG.Hechos._guardarDirecto ? global.AMG.Hechos._guardarDirecto(h) : Promise.resolve();
    });
    if (datos.inventario) {
      try { localStorage.setItem("c123_inventario_v1", JSON.stringify(datos.inventario)); } catch (_) {}
    }
    if (datos.gastosFijos) {
      try { localStorage.setItem("c123_gastos_fijos_v1", JSON.stringify(datos.gastosFijos)); } catch (_) {}
    }
    return Promise.all(escrituras);
  }

  global.AMG = global.AMG || {};
  global.AMG.Respaldo = { VERSION: "1.0.0", exportarTodo: exportarTodo, descargar: descargar, importar: importar };
})(typeof window !== "undefined" ? window : this);
