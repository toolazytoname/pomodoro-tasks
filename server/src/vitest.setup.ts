import { beforeEach, afterEach } from 'vitest';
import { prisma } from '../src/index.js';

beforeEach(async () => {
  await prisma.task.deleteMany({ where: { title: { startsWith: '__test__' } } });
});

afterEach(async () => {
  await prisma.task.deleteMany({ where: { title: { startsWith: '__test__' } } });
});
