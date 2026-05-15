import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { taskRoutes } from './tasks.js';
import { agentRoutes } from './agent.js';
import { prisma } from '../index.js';

describe('Agent API', () => {
  let app: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    app = Fastify();
    await app.register(taskRoutes, { prefix: '/api/tasks' });
    await app.register(agentRoutes, { prefix: '/api/agent' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.task.deleteMany({ where: { title: { startsWith: '__test__' } } });
  });

  describe('POST /api/agent/send', () => {
    it('should format task message for Hermes', async () => {
      const taskARes = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { 
          title: '__test__ design doc', 
          quadrant: 2,
          description: 'Design the architecture',
          workload: 3,
        },
      });
      const taskA = JSON.parse(taskARes.body);

      const taskBRes = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { 
          title: '__test__ implement feature', 
          quadrant: 1,
          description: 'Implement the feature',
          workload: 4,
          dependsOn: [taskA.id],
        },
      });
      const taskB = JSON.parse(taskBRes.body);

      const response = await app.inject({
        method: 'POST',
        url: '/api/agent/send',
        payload: { taskId: taskB.id, agent: 'hermes' },
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      expect(result.success).toBe(true);
      expect(result.agent).toBe('hermes');
      expect(result.message).toContain('__test__ implement feature');
      expect(result.message).toContain('依赖任务');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/agent/send',
        payload: { taskId: 'non-existent', agent: 'hermes' },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
