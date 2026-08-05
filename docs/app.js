/*!
 * app.js — Consultorio-123 · UI y ruteo de los 4 módulos v1.0
 * ============================================================================
 * Vanilla JS, sin framework, sin build step. Ruteo por hash (#/modulo) para
 * que cada pantalla sea un link directo y el botón "atrás" del navegador
 * funcione. v1.0 no tiene una base de pacientes separada (eso es v2.0,
 * "historial de pacientes") — el nombre del paciente escrito en el formulario
 * ES el identificador (pacienteId) que usa cxc.js.
 * ============================================================================
 */
(function () {
  "use strict";

  var vista = document.getElementById("vista");

  function fmt(n) {
    return "$" + (Number(n) || 0).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fecha(ts) {
    return new Date(ts).toLocaleDateString("es-EC", { year: "numeric", month: "short", day: "numeric" });
  }

  // ---------------------------------------------------------------------
  // Menú principal
  // ---------------------------------------------------------------------
  function vistaMenu() {
    vista.innerHTML =
      '<nav class="menu-grid">' +
      '<a class="menu-card" href="#/ingresos"><span class="menu-card-icono">💵</span><span class="menu-card-texto">Ingresos</span><span class="menu-card-sub">Caja chica y bancos</span></a>' +
      '<a class="menu-card" href="#/inventario"><span class="menu-card-icono">📦</span><span class="menu-card-texto">Inventario</span><span class="menu-card-sub">Costo de venta</span></a>' +
      '<a class="menu-card" href="#/cxc"><span class="menu-card-icono">👥</span><span class="menu-card-texto">Cuentas por cobrar</span><span class="menu-card-sub">Tratamientos y abonos</span></a>' +
      '<a class="menu-card" href="#/resultados"><span class="menu-card-icono">📈</span><span class="menu-card-texto">Estado de resultados</span><span class="menu-card-sub">Utilidad del mes</span></a>' +
      "</nav>";
  }

  function botonMenu() {
    return '<a class="btn" href="#/menu" style="margin-bottom:16px">&larr; Menú</a>';
  }

  // ---------------------------------------------------------------------
  // Ingresos
  // ---------------------------------------------------------------------
  function vistaIngresos() {
    vista.innerHTML =
      botonMenu() +
      '<div class="card">' +
      '<h2 class="card-titulo">Registrar ingreso</h2>' +
      '<form id="form-ingreso">' +
      '<div class="form-group"><label>Paciente</label><input name="paciente" required></div>' +
      '<div class="form-group"><label>Concepto</label><input name="concepto" required></div>' +
      '<div class="form-group"><label>Valor</label><input name="monto" type="number" step="0.01" min="0.01" required></div>' +
      '<div class="form-group"><label>Cuenta</label><select name="cuenta">' +
      '<option value="caja_chica">Caja chica (efectivo)</option>' +
      '<option value="bancos">Bancos (transferencia/tarjeta/cheque)</option>' +
      "</select></div>" +
      '<div class="form-group"><label>Forma de pago</label><input name="formaPago" placeholder="Efectivo, tarjeta, transferencia..."></div>' +
      '<div class="form-group"><label>Observaciones</label><textarea name="observaciones"></textarea></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Guardar ingreso</button>' +
      "</form></div>" +
      '<div id="totales-ingresos" class="card"></div>' +
      '<div id="tabla-ingresos"></div>';

    document.getElementById("form-ingreso").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      window.AMG.Ingresos.registrar({
        paciente: f.get("paciente"),
        concepto: f.get("concepto"),
        monto: f.get("monto"),
        cuenta: f.get("cuenta"),
        formaPago: f.get("formaPago"),
        observaciones: f.get("observaciones")
      }).then(function () {
        e.target.reset();
        renderIngresos();
      });
    });

    renderIngresos();
  }

  function renderIngresos() {
    window.AMG.Ingresos.listar().then(function (info) {
      document.getElementById("totales-ingresos").innerHTML =
        '<div class="total-row"><span>Total caja chica</span><span class="total-valor">' + fmt(info.totalCajaChica) + "</span></div>" +
        '<div class="total-row" style="margin-top:8px"><span>Total bancos</span><span class="total-valor">' + fmt(info.totalBancos) + "</span></div>" +
        '<div class="total-row" style="margin-top:8px;background-color:var(--verde);color:var(--branco)"><span>INGRESOS TOTALES</span><span class="total-valor">' + fmt(info.total) + "</span></div>";

      var filas = info.movimientos.map(function (m) {
        return "<tr><td>" + fecha(m.fecha) + "</td><td>" + esc(m.paciente) + "</td><td>" + esc(m.concepto) +
          "</td><td>" + fmt(m.monto) + '</td><td><span class="badge">' + (m.cuenta === "caja_chica" ? "Caja chica" : "Bancos") + "</span></td></tr>";
      }).join("");

      document.getElementById("tabla-ingresos").innerHTML = info.movimientos.length
        ? '<div class="table"><table><thead><tr><th>Fecha</th><th>Paciente</th><th>Concepto</th><th>Valor</th><th>Cuenta</th></tr></thead><tbody>' + filas + "</tbody></table></div>"
        : "";
    });
  }

  // ---------------------------------------------------------------------
  // Inventario
  // ---------------------------------------------------------------------
  function vistaInventario() {
    vista.innerHTML =
      botonMenu() +
      '<div class="card">' +
      '<h2 class="card-titulo">Agregar / actualizar artículo</h2>' +
      '<form id="form-inventario">' +
      '<input type="hidden" name="id">' +
      '<div class="form-group"><label>Nombre del artículo</label><input name="nombre" required></div>' +
      '<div class="form-group"><label>Precio unitario</label><input name="precio" type="number" step="0.01" min="0"></div>' +
      '<div class="form-group"><label>Inventario inicial</label><input name="inicial" type="number" step="0.01" min="0"></div>' +
      '<div class="form-group"><label>Compras</label><input name="compras" type="number" step="0.01" min="0"></div>' +
      '<div class="form-group"><label>Inventario final</label><input name="final" type="number" step="0.01" min="0"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Guardar artículo</button>' +
      "</form></div>" +
      '<div id="totales-inventario" class="card"></div>' +
      '<div id="tabla-inventario"></div>';

    document.getElementById("form-inventario").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      window.AMG.Inventario.guardarItem({
        id: f.get("id") || undefined,
        nombre: f.get("nombre"),
        precio: f.get("precio"),
        inicial: f.get("inicial"),
        compras: f.get("compras"),
        final: f.get("final")
      });
      e.target.reset();
      renderInventario();
    });

    renderInventario();
  }

  function renderInventario() {
    var info = window.AMG.Inventario.listar();
    document.getElementById("totales-inventario").innerHTML =
      '<div class="total-row"><span>TOTAL COSTO DE VENTA</span><span class="total-valor">' + fmt(info.totalCostoVenta) + "</span></div>";

    var filas = info.items.map(function (it) {
      return "<tr><td>" + esc(it.nombre) + "</td><td>" + fmt(it.precio) + "</td><td>" + fmt(it.inicial) +
        "</td><td>" + fmt(it.compras) + "</td><td>" + fmt(it.final) + "</td><td>" + fmt(it.costoVenta) +
        '</td><td><button class="btn btn-danger" data-eliminar="' + esc(it.id) + '" style="min-height:36px;padding:6px 14px">Quitar</button></td></tr>';
    }).join("");

    document.getElementById("tabla-inventario").innerHTML = info.items.length
      ? '<div class="table"><table><thead><tr><th>Artículo</th><th>Precio</th><th>Inicial</th><th>Compras</th><th>Final</th><th>Costo venta</th><th></th></tr></thead><tbody>' + filas + "</tbody></table></div>"
      : "";

    document.querySelectorAll("[data-eliminar]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.AMG.Inventario.eliminarItem(btn.getAttribute("data-eliminar"));
        renderInventario();
      });
    });
  }

  // ---------------------------------------------------------------------
  // Cuentas por cobrar
  // ---------------------------------------------------------------------
  function vistaCxc() {
    vista.innerHTML =
      botonMenu() +
      '<div class="card">' +
      '<h2 class="card-titulo">Nuevo tratamiento</h2>' +
      '<form id="form-tratamiento">' +
      '<div class="form-group"><label>Paciente</label><input name="paciente" required></div>' +
      '<div class="form-group"><label>Tratamiento</label><input name="concepto" required></div>' +
      '<div class="form-group"><label>Valor total</label><input name="valorTotal" type="number" step="0.01" min="0.01" required></div>' +
      '<div class="form-group"><label>Pago inicial (opcional)</label><input name="pagoInicial" type="number" step="0.01" min="0" value="0"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Registrar tratamiento</button>' +
      "</form></div>" +
      '<div class="card">' +
      '<h2 class="card-titulo">Registrar abono</h2>' +
      '<form id="form-abono">' +
      '<div class="form-group"><label>Paciente</label><input name="paciente" required></div>' +
      '<div class="form-group"><label>Valor del abono</label><input name="monto" type="number" step="0.01" min="0.01" required></div>' +
      '<div class="form-group"><label>Concepto</label><input name="concepto" placeholder="Cuota 2 de 4..."></div>' +
      '<button type="submit" class="btn btn-success btn-block">Registrar abono</button>' +
      "</form></div>" +
      '<div id="tabla-cxc"></div>';

    document.getElementById("form-tratamiento").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      window.AMG.CxC.registrarTratamiento(f.get("paciente").trim(), f.get("concepto"), f.get("valorTotal"), f.get("pagoInicial"))
        .then(function () { e.target.reset(); renderCxc(); });
    });

    document.getElementById("form-abono").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      window.AMG.CxC.registrarMovimiento(f.get("paciente").trim(), "abono", f.get("monto"), f.get("concepto"))
        .then(function () { e.target.reset(); renderCxc(); });
    });

    renderCxc();
  }

  function renderCxc() {
    window.AMG.CxC.saldosTotales().then(function (saldos) {
      var pendientes = saldos.filter(function (s) { return s.saldo < 0; });
      var totalPendiente = pendientes.reduce(function (a, s) { return a + Math.abs(s.saldo); }, 0);

      var filas = saldos.sort(function (a, b) { return a.saldo - b.saldo; }).map(function (s) {
        var debe = s.saldo < 0;
        return "<tr><td>" + esc(s.pacienteId) + '</td><td><span class="badge ' + (debe ? "badge-danger" : "badge-success") +
          '">' + (debe ? "Debe " + fmt(Math.abs(s.saldo)) : "Al día") + "</span></td></tr>";
      }).join("");

      document.getElementById("tabla-cxc").innerHTML =
        '<div class="total-row" style="margin-bottom:16px;background-color:var(--vermelho);color:var(--branco)"><span>TOTAL PENDIENTE DE COBRO</span><span class="total-valor">' + fmt(totalPendiente) + "</span></div>" +
        (saldos.length
          ? '<div class="table"><table><thead><tr><th>Paciente</th><th>Saldo</th></tr></thead><tbody>' + filas + "</tbody></table></div>"
          : "");
    });
  }

  // ---------------------------------------------------------------------
  // Estado de resultados
  // ---------------------------------------------------------------------
  function vistaResultados() {
    var g = window.AMG.EstadoResultados.leerGastos();
    vista.innerHTML =
      botonMenu() +
      '<div class="card">' +
      '<h2 class="card-titulo">Gastos fijos del mes</h2>' +
      '<form id="form-gastos">' +
      '<div class="form-group"><label>Salarios</label><input name="salarios" type="number" step="0.01" min="0" value="' + g.salarios + '"></div>' +
      '<div class="form-group"><label>Arriendo</label><input name="arriendo" type="number" step="0.01" min="0" value="' + g.arriendo + '"></div>' +
      '<div class="form-group"><label>Servicios</label><input name="servicios" type="number" step="0.01" min="0" value="' + g.servicios + '"></div>' +
      '<div class="form-group"><label>Impuestos</label><input name="impuestos" type="number" step="0.01" min="0" value="' + g.impuestos + '"></div>' +
      '<div class="form-group"><label>Gastos varios</label><input name="gastosVarios" type="number" step="0.01" min="0" value="' + g.gastosVarios + '"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">Guardar gastos</button>' +
      "</form></div>" +
      '<div id="resumen-resultados"></div>';

    document.getElementById("form-gastos").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      window.AMG.EstadoResultados.guardarGastos({
        salarios: f.get("salarios"), arriendo: f.get("arriendo"), servicios: f.get("servicios"),
        impuestos: f.get("impuestos"), gastosVarios: f.get("gastosVarios")
      });
      renderResultados();
    });

    renderResultados();
  }

  function fila(label, valor, destacado) {
    return '<div class="total-row"' + (destacado ? ' style="margin-top:8px;background-color:var(--amarillo)"' : ' style="margin-top:8px;background-color:var(--crema);box-shadow:none"') +
      "><span>" + esc(label) + '</span><span class="total-valor">' + fmt(valor) + "</span></div>";
  }

  function renderResultados() {
    window.AMG.EstadoResultados.calcular().then(function (r) {
      document.getElementById("resumen-resultados").innerHTML =
        '<div class="card"><h2 class="card-titulo">Estado de resultados</h2>' +
        '<div class="total-row" style="background-color:var(--verde);color:var(--branco)"><span>Ingresos totales</span><span class="total-valor">' + fmt(r.ingresosTotales) + "</span></div>" +
        fila("(-) Costo de venta", r.costoVenta) +
        fila("Utilidad bruta", r.utilidadBruta, true) +
        fila("(-) Gastos fijos", r.gastosFijos) +
        '<div class="total-row" style="margin-top:8px;background-color:var(--laranja);color:var(--branco)"><span>UTILIDAD NETA</span><span class="total-valor">' + fmt(r.utilidadNeta) + "</span></div>" +
        '<div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">' +
        '<span class="badge badge-info">Margen bruto ' + r.margenBruto + "%</span>" +
        '<span class="badge badge-info">Margen neto ' + r.margenNeto + "%</span>" +
        "</div></div>";
    });
  }

  // ---------------------------------------------------------------------
  // Ruteo
  // ---------------------------------------------------------------------
  var RUTAS = {
    "#/menu": vistaMenu,
    "#/ingresos": vistaIngresos,
    "#/inventario": vistaInventario,
    "#/cxc": vistaCxc,
    "#/resultados": vistaResultados
  };

  function ruteo() {
    var hash = location.hash || "#/menu";
    (RUTAS[hash] || vistaMenu)();
  }

  // app.js no rutea nada hasta que gate.js confirma PIN correcto (o hasta que
  // se crea el PIN por primera vez). Si el candado ya se cerró antes de que
  // este script termine de cargar, "desbloqueado" en window ya está en true.
  window.addEventListener("hashchange", ruteo);
  window.addEventListener("c123-desbloqueado", ruteo);
  if (window.__c123Desbloqueado) ruteo();
})();
