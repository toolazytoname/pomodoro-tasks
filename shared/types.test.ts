import { describe, it, expect } from 'vitest';
import { calcPriority, quadrantName, quadrantColor, workloadLabel } from '../../shared/types.js';

describe('Shared utility functions', () => {
  describe('calcPriority', () => {
    it('should calculate priority correctly for urgent important small task', () => {
      const priority = calcPriority({ importance: 5, urgency: 5, workload: 1 });
      expect(priority).toBe(75); // (5*2 + 5) * (6-1) = 75
    });

    it('should calculate priority correctly for non-urgent unimportant large task', () => {
      const priority = calcPriority({ importance: 1, urgency: 1, workload: 5 });
      expect(priority).toBe(3); // (1*2 + 1) * (6-5) = 3
    });

    it('should give higher priority to smaller workloads', () => {
      const bigTask = calcPriority({ importance: 3, urgency: 3, workload: 5 });
      const smallTask = calcPriority({ importance: 3, urgency: 3, workload: 1 });
      expect(smallTask).toBeGreaterThan(bigTask);
    });

    it('should give higher priority to more important tasks', () => {
      const important = calcPriority({ importance: 5, urgency: 3, workload: 3 });
      const unimportant = calcPriority({ importance: 1, urgency: 3, workload: 3 });
      expect(important).toBeGreaterThan(unimportant);
    });

    it('should give higher priority to more urgent tasks', () => {
      const urgent = calcPriority({ importance: 3, urgency: 5, workload: 3 });
      const notUrgent = calcPriority({ importance: 3, urgency: 1, workload: 3 });
      expect(urgent).toBeGreaterThan(notUrgent);
    });
  });

  describe('quadrantName', () => {
    it('should return correct names for all quadrants', () => {
      expect(quadrantName(1)).toBe('紧急重要');
      expect(quadrantName(2)).toBe('重要不紧急');
      expect(quadrantName(3)).toBe('紧急不重要');
      expect(quadrantName(4)).toBe('不紧急不重要');
    });
  });

  describe('quadrantColor', () => {
    it('should return correct colors for all quadrants', () => {
      expect(quadrantColor(1)).toBe('#ef4444');
      expect(quadrantColor(2)).toBe('#f59e0b');
      expect(quadrantColor(3)).toBe('#3b82f6');
      expect(quadrantColor(4)).toBe('#6b7280');
    });
  });

  describe('workloadLabel', () => {
    it('should return correct labels for all workload levels', () => {
      expect(workloadLabel(1)).toBe('5 分钟');
      expect(workloadLabel(2)).toBe('15 分钟');
      expect(workloadLabel(3)).toBe('30 分钟');
      expect(workloadLabel(4)).toBe('1 小时');
      expect(workloadLabel(5)).toBe('2 小时');
    });
  });
});
