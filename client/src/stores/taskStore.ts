import { create } from 'zustand';

export type Quadrant = 1 | 2 | 3 | 4;
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'paused';

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: Quadrant;
  urgency: number;
  importance: number;
  workload: number;
  estimatedPomodoros: number;
  dependsOn: string[];
  dependentTasks: string[];
  parentId?: string;
  children: string[];
  isParent: boolean;
  pomodorosCompleted: number;
  currentPomodoro?: { startTime: string; remaining: number };
  status: TaskStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId: string | null;
  
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'pomodorosCompleted' | 'children' | 'dependentTasks' | 'currentPomodoro'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
  startPomodoro: (taskId: string, duration?: number) => Promise<void>;
  pausePomodoro: (taskId: string, remaining: number) => Promise<void>;
  resumePomodoro: (taskId: string) => Promise<void>;
  completePomodoro: (taskId: string) => Promise<void>;
  abandonPomodoro: (taskId: string) => Promise<void>;
}

const API_BASE = '/api';

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  selectedTaskId: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const tasks = await res.json();
      set({ tasks, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const task = await res.json();
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: async (id, updates) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const updated = await res.json();
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    }));
  },

  selectTask: (id) => set({ selectedTaskId: id }),

  startPomodoro: async (taskId, duration = 25 * 60) => {
    await fetch(`${API_BASE}/pomodoro/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, duration }),
    });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'in_progress' as TaskStatus, currentPomodoro: { startTime: new Date().toISOString(), remaining: duration } }
          : t
      ),
    }));
  },

  pausePomodoro: async (taskId, remaining) => {
    await fetch(`${API_BASE}/pomodoro/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, remaining }),
    });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'paused' as TaskStatus, currentPomodoro: { ...t.currentPomodoro!, remaining } }
          : t
      ),
    }));
  },

  resumePomodoro: async (taskId) => {
    await fetch(`${API_BASE}/pomodoro/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'in_progress' as TaskStatus } : t
      ),
    }));
  },

  completePomodoro: async (taskId) => {
    await fetch(`${API_BASE}/pomodoro/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'completed' as TaskStatus, pomodorosCompleted: t.pomodorosCompleted + 1, currentPomodoro: undefined, completedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  abandonPomodoro: async (taskId) => {
    await fetch(`${API_BASE}/pomodoro/abandon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'pending' as TaskStatus, currentPomodoro: undefined }
          : t
      ),
    }));
  },
}));

export function calcPriority(task: Pick<Task, 'importance' | 'urgency' | 'workload'>): number {
  return (task.importance * 2 + task.urgency) * (6 - task.workload);
}

export const QUADRANT_NAMES: Record<Quadrant, string> = {
  1: '紧急重要',
  2: '重要不紧急',
  3: '紧急不重要',
  4: '不紧急不重要',
};

export const QUADRANT_COLORS: Record<Quadrant, string> = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#3b82f6',
  4: '#6b7280',
};

export const WORKLOAD_LABELS: Record<number, string> = {
  1: '5 分钟',
  2: '15 分钟',
  3: '30 分钟',
  4: '1 小时',
  5: '2 小时',
};
