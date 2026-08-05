// worker.js — Consultorio-123 sync relay (Durable Objects, "sordo y desmemoriado
// a proposito"). Un cuarto por sala (codigo de negocio), reenvia mensajes en
// vivo entre los dispositivos conectados a la MISMA sala. NUNCA guarda nada:
// sin el cuarto abierto (todos desconectados), el estado desaparece con el.
// Cifrado E2E lo hace el cliente (sync-realtime.js) — este relay solo ve
// bytes opacos, jamas la clave de sala ni el contenido en claro.
//
// Deploy:
//   1. wrangler deploy   (usa el binding SALAS definido en wrangler.toml)
//   2. La URL queda en https://<worker>.<subdominio>.workers.dev/sala/<id>

export class Sala {
  constructor(state) {
    this.state = state;
    this.conexiones = new Set();
  }

  async fetch(req) {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected websocket", { status: 426 });
    }
    const pair = new WebSocketPair();
    const [cliente, servidor] = Object.values(pair);
    servidor.accept();
    this.conexiones.add(servidor);

    servidor.addEventListener("message", (evento) => {
      // Reenvia a TODOS los demas conectados a esta sala — nunca al remitente,
      // nunca a disco. Si un socket ya se cayo, se descarta en silencio.
      for (const otro of this.conexiones) {
        if (otro !== servidor) {
          try { otro.send(evento.data); } catch (_) { this.conexiones.delete(otro); }
        }
      }
    });

    const salir = () => { this.conexiones.delete(servidor); };
    servidor.addEventListener("close", salir);
    servidor.addEventListener("error", salir);

    return new Response(null, { status: 101, webSocket: cliente });
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/sala\/([^/]+)$/);
    if (!m) return new Response("Not found", { status: 404 });
    const salaId = decodeURIComponent(m[1]).slice(0, 120);
    if (!salaId) return new Response("Falta id de sala", { status: 400 });

    const id = env.SALAS.idFromName(salaId);
    const stub = env.SALAS.get(id);
    return stub.fetch(req);
  },
};
