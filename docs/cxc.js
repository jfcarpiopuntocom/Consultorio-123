/*!
 * cxc.js — Consultorio-123 · Cuentas por Cobrar
 * ============================================================================
 * Adaptado de cartera.js (friendly-123). Mismo patrón exacto: el saldo de un
 * paciente nunca se guarda como campo mutable, siempre se DERIVA sumando los
 * hechos "cxc_cargo"/"cxc_abono" ya persistidos por hechos.js (event-sourcing
 * con cadena de hash — ver hechos.js). Esto es lo que hace imposible que un
 * saldo "se pierda" o se pise entre dos dispositivos.
 *
 * cxc_cargo -> se registra un tratamiento (resta del saldo del paciente).
 * cxc_abono -> el paciente paga una cuota o el total (suma al saldo).
 * Saldo negativo = el paciente debe. Saldo cero = al día.
 * ============================================================================
 */
(function (global) {
  "use strict";

  var TIPOS = { cargo: "cxc_cargo", abono: "cxc_abono" };

  function bus() {
    try { return global.AMG && global.AMG.EventBus; } catch (_) { return null; }
  }

  // Único punto de escritura. tipo: "cargo" | "abono". monto siempre positivo;
  // el signo lo decide el tipo, nunca quien llama.
  function registrarMovimiento(pacienteId, tipo, monto, concepto) {
    if (tipo !== "cargo" && tipo !== "abono") {
      return Promise.reject(new Error("cxc: tipo debe ser 'cargo' o 'abono'"));
    }
    var m = Number(monto);
    if (!(m > 0)) return Promise.reject(new Error("cxc: monto debe ser mayor a cero"));
    if (!pacienteId) return Promise.reject(new Error("cxc: falta pacienteId"));

    var payload = {
      pacienteId: String(pacienteId),
      monto: +m.toFixed(2),
      concepto: String(concepto || "").slice(0, 300)
    };

    var eventBus = bus();
    if (eventBus) eventBus.emit("cxc_" + tipo + ":completado", { payload: payload });

    if (global.AMG && global.AMG.Hechos && global.AMG.Hechos.registrar) {
      return global.AMG.Hechos.registrar(TIPOS[tipo], payload);
    }
    return Promise.reject(new Error("cxc: AMG.Hechos no disponible"));
  }

  // Registra un tratamiento nuevo: un cargo inicial por el valor total, y si
  // hay pago inicial, un abono inmediato. Devuelve las dos escrituras.
  function registrarTratamiento(pacienteId, concepto, valorTotal, pagoInicial) {
    var inicial = Number(pagoInicial) || 0;
    return registrarMovimiento(pacienteId, "cargo", valorTotal, concepto).then(function (hechoCargo) {
      if (inicial > 0) {
        return registrarMovimiento(pacienteId, "abono", inicial, "Pago inicial — " + concepto)
          .then(function (hechoAbono) { return { cargo: hechoCargo, abono: hechoAbono }; });
      }
      return { cargo: hechoCargo, abono: null };
    });
  }

  // Deriva el saldo y el historial de UN paciente reproduciendo todos los
  // hechos conocidos. Nunca lee ni escribe un campo "saldo" guardado.
  function saldoDePaciente(pacienteId) {
    if (!global.AMG || !global.AMG.Hechos || !global.AMG.Hechos.todos) {
      return Promise.resolve({ saldo: 0, movimientos: [] });
    }
    return global.AMG.Hechos.todos().then(function (todos) {
      var mios = todos.filter(function (h) {
        return (h.tipo === TIPOS.cargo || h.tipo === TIPOS.abono) &&
          h.datos && h.datos.payload && String(h.datos.payload.pacienteId) === String(pacienteId);
      });
      var saldo = 0;
      var movimientos = mios.map(function (h) {
        var signo = h.tipo === TIPOS.cargo ? -1 : 1;
        var monto = Number(h.datos.payload.monto) || 0;
        saldo += signo * monto;
        return {
          tipo: h.tipo === TIPOS.cargo ? "cargo" : "abono",
          monto: monto,
          concepto: h.datos.payload.concepto || "",
          fecha: h.ts
        };
      });
      movimientos.sort(function (a, b) { return a.fecha - b.fecha; });
      return { saldo: +saldo.toFixed(2), movimientos: movimientos };
    });
  }

  // Saldo pendiente de TODOS los pacientes conocidos (para el listado general
  // y para alimentar el Estado de Resultados — el CxC no cuenta como ingreso
  // hasta que se cobra, ver estado-resultados.js).
  function saldosTotales() {
    if (!global.AMG || !global.AMG.Hechos || !global.AMG.Hechos.todos) {
      return Promise.resolve([]);
    }
    return global.AMG.Hechos.todos().then(function (todos) {
      var mios = todos.filter(function (h) {
        return (h.tipo === TIPOS.cargo || h.tipo === TIPOS.abono) &&
          h.datos && h.datos.payload && h.datos.payload.pacienteId;
      });
      var porPaciente = {};
      mios.forEach(function (h) {
        var id = String(h.datos.payload.pacienteId);
        var signo = h.tipo === TIPOS.cargo ? -1 : 1;
        var monto = Number(h.datos.payload.monto) || 0;
        porPaciente[id] = (porPaciente[id] || 0) + signo * monto;
      });
      return Object.keys(porPaciente).map(function (id) {
        return { pacienteId: id, saldo: +porPaciente[id].toFixed(2) };
      });
    });
  }

  global.AMG = global.AMG || {};
  global.AMG.CxC = {
    VERSION: "1.0.0",
    registrarMovimiento: registrarMovimiento,
    registrarTratamiento: registrarTratamiento,
    saldoDePaciente: saldoDePaciente,
    saldosTotales: saldosTotales
  };
})(typeof window !== "undefined" ? window : this);
