import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { taskRoutes } from './tasks.js';
import { pomodoroRoutes } from './pomodoro.js';
import { prisma } from '../index.js';

describe('Pomodoro API', () => {
  let app: ReturnType<typeof Fastify>;
  let testTaskId: string;

  beforeAll(async () => {
    app = Fastify();
    await app.register(taskRoutes, { prefix: '/api/tasks' });
    await app.register(pomodoroRoutes, { prefix: '/api/pomodoro' });
    await app.ready();

    const res = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { title: '__test__ pomodoro task', quadrant: 1 },
    });
    testTaskId = JSON.parse(res.body).id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.task.deleteMany({ where: { title: { startsWith: '__test__' } } });
  });

  describe('POST /api/pomodoro/start', () => {
    it('should start a pomodoro for a task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pomodoro/start',
        payload: { taskId: testTaskId, duration: 1500 },
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      expect(result.started).toBe(true);
      expect(result.duration).toBe(1500);
    });
  });

  describe('POST /api/pomodoro/pause', () => {
    it('should pause a running pomodoro', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/pomodoro/start',
        payload: { taskId: testTaskId },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/pomodoro/pause',
        payload: { taskId: testTaskId, remaining: 1200 },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).paused).toBe(true);
    });
  });

  describe('POST /api/pomodoro/resume', () => {
    it('should resume a paused pomodoro', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pomodoro/resume',
        payload: { taskId: testTaskId },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).resumed).toBe(true);
    });
  });

  describe('POST /api/pomodoro/complete', () => {
    it('should complete a pomodoro and update task status', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pomodoro/complete',
        payload: { taskId: testTaskId },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).completed).toBe(true);

      const taskRes = await app.inject({
        method: 'GET',
        url: `/api/tasks/${testTaskId}`,
      });
      const task = JSON.parse(taskRes.body);
      expect(task.status).toBe('completed');
      expect(task.completedAt).toBeDefined();
    });
  });

  describe('POST /api/pomodoro/abandon', () => {
    it('should abandon a pomodoro', async () => {
      const taskRes = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { title: '__test__ abandon task', quadrant: 2 },
      });
      const taskId = JSON.parse(taskRes.body).id;

      const response = await app.inject({
        method: 'POST',
        url: '/api/pomodoro/abandon',
        payload: { taskId },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).abandoned).toBe(true);
    });
  });
});
