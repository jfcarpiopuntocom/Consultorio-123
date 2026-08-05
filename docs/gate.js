/*!
 * gate.js — Consultorio-123 · Splash + candado de PIN
 * ============================================================================
 * v1.0: un solo PIN local (no hay roles todavía — eso es v2.0, "control de
 * usuarios: médico/admin/asistente"). El PIN se guarda con un hash simple
 * (SHA-256 vía WebCrypto si está disponible) en localStorage — nunca en
 * texto plano — y NUNCA sale del dispositivo.
 *
 * Flujo: splash (marca, ~1s o toque) -> candado de PIN (primer uso: crear
 * PIN de 4 dígitos; usos siguientes: pedirlo) -> app.js toma el control.
 * app.js no rutea nada hasta que este archivo dispara "c123-desbloqueado".
 * ============================================================================
 */
(function () {
  "use strict";

  var PIN_KEY = "c123_pin_hash_v1";
  var SPLASH_MS = 1100;

  function $(id) { return document.getElementById(id); }

  function hash(txt) {
    try {
      if (window.crypto && window.crypto.subtle) {
        return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt))
          .then(function (buf) {
            return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
          });
      }
    } catch (_) {}
    // Fallback no criptográfico — mejor que nada si WebCrypto no está.
    var h = 0;
    for (var i = 0; i < txt.length; i++) { h = ((h << 5) - h + txt.charCodeAt(i)) | 0; }
    return Promise.resolve("w:" + h.toString(16));
  }

  function pinGuardado() {
    try { return localStorage.getItem(PIN_KEY); } catch (_) { return null; }
  }

  function guardarPin(pin) {
    return hash(pin).then(function (h) {
      try { localStorage.setItem(PIN_KEY, h); } catch (_) {}
      return h;
    });
  }

  function pinCorrecto(pin) {
    var guardado = pinGuardado();
    if (!guardado) return Promise.resolve(false);
    return hash(pin).then(function (h) { return h === guardado; });
  }

  // ---------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------
  function montar() {
    var overlay = document.createElement("div");
    overlay.id = "gate";
    overlay.className = "gate-overlay";
    overlay.innerHTML =
      '<div class="gate-splash" id="gate-splash">' +
      '<div class="gate-logo">C123</div>' +
      '<div class="gate-marca">Consultorio 123</div>' +
      '<div class="gate-tagline">Tu consultorio, en color</div>' +
      "</div>" +
      '<div class="gate-pin" id="gate-pin" hidden>' +
      '<div class="gate-logo gate-logo--sm">C123</div>' +
      '<h2 id="gate-pin-titulo">Ingresa tu PIN</h2>' +
      '<p id="gate-pin-sub" class="gate-sub"></p>' +
      '<div class="gate-pin-dots" id="gate-pin-dots"></div>' +
      '<div class="gate-pin-pad" id="gate-pin-pad"></div>' +
      '<p id="gate-pin-error" class="gate-pin-error" hidden>PIN incorrecto. Intenta de nuevo.</p>' +
      "</div>";
    document.body.appendChild(overlay);
    return overlay;
  }

  function montarTeclado(padEl, dotsEl, longitud, onCompleto) {
    var entrada = [];
    padEl.innerHTML = "";
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "borrar"].forEach(function (tecla) {
      var b = document.createElement("button");
      b.type = "button";
      if (tecla === "") {
        b.className = "gate-pin-key gate-pin-key--vacio";
        b.disabled = true;
        b.setAttribute("aria-hidden", "true");
      } else if (tecla === "borrar") {
        b.className = "gate-pin-key gate-pin-key--borrar";
        b.textContent = "⌫";
        b.addEventListener("click", function () {
          entrada.pop();
          pintar();
        });
      } else {
        b.className = "gate-pin-key";
        b.textContent = tecla;
        b.addEventListener("click", function () {
          if (entrada.length >= longitud) return;
          entrada.push(tecla);
          pintar();
          if (entrada.length === longitud) {
            setTimeout(function () { onCompleto(entrada.join("")); entrada = []; pintar(); }, 120);
          }
        });
      }
      padEl.appendChild(b);
    });
    function pintar() {
      dotsEl.innerHTML = "";
      for (var i = 0; i < longitud; i++) {
        var d = document.createElement("span");
        d.className = "gate-pin-dot" + (i < entrada.length ? " gate-pin-dot--lleno" : "");
        dotsEl.appendChild(d);
      }
    }
    pintar();
    return { limpiar: function () { entrada = []; pintar(); } };
  }

  function desbloquear(overlay) {
    overlay.classList.add("gate-overlay--cerrando");
    setTimeout(function () {
      overlay.remove();
      window.dispatchEvent(new CustomEvent("c123-desbloqueado"));
    }, 220);
  }

  function iniciarCandado(overlay) {
    var titulo = $("gate-pin-titulo");
    var sub = $("gate-pin-sub");
    var dots = $("gate-pin-dots");
    var pad = $("gate-pin-pad");
    var errorEl = $("gate-pin-error");
    var existente = pinGuardado();
    var creandoPrimero = null; // primer PIN capturado, en espera de confirmación

    function modoCrear() {
      titulo.textContent = "Crea tu PIN";
      sub.textContent = "4 dígitos. Lo vas a necesitar cada vez que abras la app.";
      errorEl.hidden = true;
      teclado = montarTeclado(pad, dots, 4, function (pin) {
        if (!creandoPrimero) {
          creandoPrimero = pin;
          titulo.textContent = "Confirma tu PIN";
          sub.textContent = "Escríbelo una vez más.";
          teclado.limpiar();
          return;
        }
        if (pin === creandoPrimero) {
          guardarPin(pin).then(function () { desbloquear(overlay); });
        } else {
          errorEl.textContent = "Los PIN no coinciden. Empecemos de nuevo.";
          errorEl.hidden = false;
          creandoPrimero = null;
          titulo.textContent = "Crea tu PIN";
          sub.textContent = "4 dígitos. Lo vas a necesitar cada vez que abras la app.";
          teclado.limpiar();
        }
      });
    }

    function modoIngresar() {
      titulo.textContent = "Ingresa tu PIN";
      sub.textContent = "";
      errorEl.hidden = true;
      teclado = montarTeclado(pad, dots, 4, function (pin) {
        pinCorrecto(pin).then(function (ok) {
          if (ok) { desbloquear(overlay); return; }
          errorEl.hidden = false;
          teclado.limpiar();
        });
      });
    }

    var teclado;
    if (existente) modoIngresar(); else modoCrear();
  }

  function arrancar() {
    var overlay = montar();
    setTimeout(function () {
      $("gate-splash").hidden = true;
      $("gate-pin").hidden = false;
      iniciarCandado(overlay);
    }, SPLASH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
