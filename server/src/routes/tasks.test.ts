import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { taskRoutes } from './tasks.js';
import { prisma } from '../index.js';

describe('Task API', () => {
  let app: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    app = Fastify();
    await app.register(taskRoutes, { prefix: '/api/tasks' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.task.deleteMany({ where: { title: { startsWith: '__test__' } } });
  });

  describe('GET /api/tasks', () => {
    it('should return empty array initially', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
      });
      expect(response.statusCode).toBe(200);
      const tasks = JSON.parse(response.body);
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: '__test__ task 1',
        description: 'Test description',
        quadrant: 1,
        urgency: 5,
        importance: 5,
        workload: 2,
        estimatedPomodoros: 1,
        status: 'pending',
        tags: ['test'],
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: taskData,
      });

      expect(response.statusCode).toBe(200);
      const task = JSON.parse(response.body);
      expect(task.title).toBe('__test__ task 1');
      expect(task.quadrant).toBe(1);
      expect(task.urgency).toBe(5);
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeDefined();
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a single task', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { title: '__test__ get single', quadrant: 2 },
      });
      const created = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: 'GET',
        url: `/api/tasks/${created.id}`,
      });

      expect(response.statusCode).toBe(200);
      const task = JSON.parse(response.body);
      expect(task.id).toBe(created.id);
      expect(task.title).toBe('__test__ get single');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks/non-existent-id',
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { title: '__test__ update me', quadrant: 3 },
      });
      const created = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: 'PUT',
        url: `/api/tasks/${created.id}`,
        payload: { title: '__test__ updated title', quadrant: 1 },
      });

      expect(response.statusCode).toBe(200);
      const updated = JSON.parse(response.body);
      expect(updated.title).toBe('__test__ updated title');
      expect(updated.quadrant).toBe(1);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { title: '__test__ delete me', quadrant: 4 },
      });
      const created = JSON.parse(createResponse.body);

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/tasks/${created.id}`,
      });

      expect(deleteResponse.statusCode).toBe(200);

      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/tasks/${created.id}`,
      });
      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe('Task dependencies', () => {
    it('should set dependsOn relationship', async () => {
      const resA = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { title: '__test__ task A', quadrant: 1 },
      });
      const taskA = JSON.parse(resA.body);

      const resB = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { 
          title: '__test__ task B', 
          quadrant: 1,
          dependsOn: [taskA.id],
        },
      });
      const taskB = JSON.parse(resB.body);

      expect(taskB.dependsOn).toContain(taskA.id);
    });
  });
});
