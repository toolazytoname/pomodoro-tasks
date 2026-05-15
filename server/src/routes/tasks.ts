import { FastifyInstance } from "fastify";
import { prisma } from "../index.js";

export async function taskRoutes(app: FastifyInstance) {
  // Get all tasks
  app.get("/", async () => {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return tasks.map(parseTask);
  });

  // Create task
  app.post("/", async (request) => {
    const body = request.body as Record<string, any>;
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        quadrant: body.quadrant,
        urgency: body.urgency || 3,
        importance: body.importance || 3,
        workload: body.workload || 3,
        estimatedPomodoros: body.estimatedPomodoros || 1,
        dependsOn: JSON.stringify(body.dependsOn || []),
        dependentTasks: JSON.stringify(body.dependentTasks || []),
        parentId: body.parentId || null,
        children: JSON.stringify(body.children || []),
        isParent: body.isParent || false,
        pomodorosCompleted: body.pomodorosCompleted || 0,
        currentPomodoro: body.currentPomodoro
          ? JSON.stringify(body.currentPomodoro)
          : null,
        status: body.status || "pending",
        tags: JSON.stringify(body.tags || []),
      },
    });
    return parseTask(task);
  });

  // Get single task
  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const task = await prisma.task.findUnique({
      where: { id: request.params.id },
    });
    if (!task) {
      reply.code(404);
      return { error: "Task not found" };
    }
    return parseTask(task);
  });

  // Update task
  app.put<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const body = request.body as Record<string, any>;
    const data: any = {};
    
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.quadrant !== undefined) data.quadrant = body.quadrant;
    if (body.urgency !== undefined) data.urgency = body.urgency;
    if (body.importance !== undefined) data.importance = body.importance;
    if (body.workload !== undefined) data.workload = body.workload;
    if (body.estimatedPomodoros !== undefined) data.estimatedPomodoros = body.estimatedPomodoros;
    if (body.dependsOn !== undefined) data.dependsOn = JSON.stringify(body.dependsOn);
    if (body.dependentTasks !== undefined) data.dependentTasks = JSON.stringify(body.dependentTasks);
    if (body.parentId !== undefined) data.parentId = body.parentId;
    if (body.children !== undefined) data.children = JSON.stringify(body.children);
    if (body.isParent !== undefined) data.isParent = body.isParent;
    if (body.pomodorosCompleted !== undefined) data.pomodorosCompleted = body.pomodorosCompleted;
    if (body.currentPomodoro !== undefined) {
      data.currentPomodoro = body.currentPomodoro ? JSON.stringify(body.currentPomodoro) : null;
    }
    if (body.status !== undefined) data.status = body.status;
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
    if (body.completedAt !== undefined) {
      data.completedAt = body.completedAt ? new Date(body.completedAt) : null;
    }

    const task = await prisma.task.update({
      where: { id: request.params.id },
      data,
    });
    return parseTask(task);
  });

  // Delete task
  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    await prisma.task.delete({ where: { id: request.params.id } });
    return { success: true };
  });

  // Get children
  app.get<{ Params: { id: string } }>("/:id/children", async (request) => {
    const task = await prisma.task.findUnique({ where: { id: request.params.id } });
    if (!task) return { error: "Not found" };
    const childIds: string[] = JSON.parse(task.children || "[]");
    const children = await prisma.task.findMany({
      where: { id: { in: childIds } },
    });
    return children.map(parseTask);
  });
}

function parseTask(t: any) {
  return {
    ...t,
    dependsOn: JSON.parse(t.dependsOn || "[]"),
    dependentTasks: JSON.parse(t.dependentTasks || "[]"),
    children: JSON.parse(t.children || "[]"),
    tags: JSON.parse(t.tags || "[]"),
    currentPomodoro: t.currentPomodoro ? JSON.parse(t.currentPomodoro) : undefined,
  };
}
