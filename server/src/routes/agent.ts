import { FastifyInstance } from "fastify";
import { prisma } from "../index.js";

export async function agentRoutes(app: FastifyInstance) {
  app.post<{ Body: { taskId: string; agent?: string } }>("/send", async (request, reply) => {
    const { taskId, agent = "hermes" } = request.body;
    
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      reply.code(404);
      return { error: "Task not found" };
    }

    // Build context for the agent
    const dependsOnIds: string[] = JSON.parse(task.dependsOn || "[]");
    const dependsOn = dependsOnIds.length
      ? await prisma.task.findMany({ where: { id: { in: dependsOnIds } } })
      : [];
    
    const childrenIds: string[] = JSON.parse(task.children || "[]");
    const children = childrenIds.length
      ? await prisma.task.findMany({ where: { id: { in: childrenIds } } })
      : [];

    const context = {
      task: {
        title: task.title,
        description: task.description,
        quadrant: task.quadrant,
        workload: task.workload,
        estimatedPomodoros: task.estimatedPomodoros,
        status: task.status,
      },
      dependsOn: dependsOn.map(t => ({ id: t.id, title: t.title, status: t.status })),
      children: children.map(t => ({ id: t.id, title: t.title, status: t.status })),
    };

    // Format message for Hermes
    const message = formatHermesMessage(context);

    // In production, this would call the Hermes Gateway API
    // For now, we log it and return the formatted message
    console.log(`[Agent] Sending task to ${agent}:`, message);

    return {
      success: true,
      agent,
      taskId,
      message,
      sentAt: new Date().toISOString(),
      status: "pending",
    };
  });
}

function formatHermesMessage(ctx: any): string {
  const quadrantNames = ["", "紧急重要", "重要不紧急", "紧急不重要", "不紧急不重要"];
  const qName = quadrantNames[ctx.task.quadrant] || "未知";
  const workloadLabels = ["", "5分钟", "15分钟", "30分钟", "1小时", "2小时"];
  const workload = workloadLabels[ctx.task.workload] || "未知";

  let msg = `📋 **新任务请求**\\n\\n`;
  msg += `**任务**: ${ctx.task.title}\\n`;
  if (ctx.task.description) msg += `**描述**: ${ctx.task.description}\\n`;
  msg += `**象限**: ${qName}\\n`;
  msg += `**预估工作量**: ${workload} (${ctx.task.estimatedPomodoros}个番茄)\\n`;
  
  if (ctx.dependsOn.length > 0) {
    msg += `\\n**依赖任务** (需先完成):\\n`;
    ctx.dependsOn.forEach((d: any) => {
      msg += `- [${d.status === "completed" ? "✓" : "○"}] ${d.title}\\n`;
    });
  }
  
  if (ctx.children.length > 0) {
    msg += `\\n**子任务** (已拆分):\\n`;
    ctx.children.forEach((c: any) => {
      msg += `- [${c.status === "completed" ? "✓" : "○"}] ${c.title}\\n`;
    });
  }
  
  msg += `\\n---\\n*来自番茄任务 App*`;
  return msg;
}
