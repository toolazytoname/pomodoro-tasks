import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { taskRoutes } from "./routes/tasks.js";
import { pomodoroRoutes } from "./routes/pomodoro.js";
import { agentRoutes } from "./routes/agent.js";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(websocket);

app.get("/health", async () => ({ status: "ok" }));

app.register(taskRoutes, { prefix: "/api/tasks" });
app.register(pomodoroRoutes, { prefix: "/api/pomodoro" });
app.register(agentRoutes, { prefix: "/api/agent" });

const start = async () => {
  try {
    await app.listen({ port: 3001 });
    console.log("Server running on http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
