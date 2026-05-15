import { FastifyInstance } from "fastify";
import { prisma } from "../index.js";

export async function pomodoroRoutes(app: FastifyInstance) {
  app.post<{ Body: { taskId?: string; duration?: number } }>("/start", async (request) => {
    const { taskId, duration = 25 * 60 } = request.body;
    
    if (taskId) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "in_progress",
          currentPomodoro: JSON.stringify({ startTime: new Date().toISOString(), remaining: duration }),
        },
      });
    }
    return { started: true, taskId, duration };
  });

  app.post<{ Body: { taskId?: string; remaining?: number } }>("/pause", async (request) => {
    const { taskId, remaining } = request.body;
    if (taskId) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "paused",
          currentPomodoro: remaining !== undefined
            ? JSON.stringify({ remaining })
            : undefined,
        },
      });
    }
    return { paused: true };
  });

  app.post<{ Body: { taskId?: string } }>("/resume", async (request) => {
    const { taskId } = request.body;
    if (taskId) {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "in_progress" },
      });
    }
    return { resumed: true };
  });

  app.post<{ Body: { taskId?: string } }>("/complete", async (request) => {
    const { taskId } = request.body;
    if (taskId) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "completed",
          completedAt: new Date().toISOString(),
          pomodorosCompleted: { increment: 1 },
          currentPomodoro: null,
        },
      });
    }
    return { completed: true };
  });

  app.post<{ Body: { taskId?: string } }>("/abandon", async (request) => {
    const { taskId } = request.body;
    if (taskId) {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "pending", currentPomodoro: null },
      });
    }
    return { abandoned: true };
  });
}
