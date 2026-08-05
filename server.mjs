import { createServer } from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";

const development = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const portFlagIndex = process.argv.findIndex((argument) => argument === "--port");
const requestedPort = portFlagIndex >= 0 ? process.argv[portFlagIndex + 1] : undefined;
const port = Number(process.env.PORT || requestedPort || 3000);

const app = next({ dev: development, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((request, response) => handle(request, response));
const websocketServer = new WebSocketServer({ server, path: "/ws/hazards" });

globalThis.__broadcastHazardUpdate = (event) => {
    const payload = JSON.stringify(event);

    for (const client of websocketServer.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    }
};

websocketServer.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected", at: Date.now() }));
});

server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
});
