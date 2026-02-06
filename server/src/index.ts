import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@risk/shared";
import { setupSocketHandlers } from "./socket/handler.js";

const PORT = Number(process.env.PORT) || 3001;

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

const io = new Server<ClientToServerEvents, ServerToClientEvents>(fastify.server, {
  cors: { origin: "*" },
});

// Health check endpoint
fastify.get("/health", async () => ({ status: "ok" }));

// Wire up all Socket.io game event handlers
setupSocketHandlers(io);

try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  fastify.log.info(`Server listening on port ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
