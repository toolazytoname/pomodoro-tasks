// Shared types between client and server

export type Quadrant = 1 | 2 | 3 | 4;

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'paused';

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: Quadrant;
  urgency: number;      // 1-5
  importance: number;  // 1-5
  workload: number;      // 1-5 (1=5min, 5=2h)
  estimatedPomodoros: number;

  // Dependencies
  dependsOn: string[];
  dependentTasks: string[];

  // Subtasks
  parentId?: string;
  children: string[];
  isParent: boolean;

  // Pomodoro
  pomodorosCompleted: number;
  currentPomodoro?: {
    startTime: string;
    remaining: number;
  };
  status: TaskStatus;

  // Meta
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PomodoroState {
  taskId?: string;
  duration: number;     // seconds
  remaining: number;     // seconds
  status: 'idle' | 'running' | 'paused' | 'break';
  startedAt?: string;
}

export interface AgentMessage {
  taskId: string;
  agent: 'hermes' | string;
  message: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'completed' | 'failed';
}

// Priority score calculation
export function calcPriority(task: Pick<Task, 'importance' | 'urgency' | 'workload'>): number {
  return (task.importance * 2 + task.urgency) * (6 - task.workload);
}

export function quadrantName(q: Quadrant): string {
  const names: Record<Quadrant, string> = {
    1: '紧急重要',
    2: '重要不紧急',
    3: '紧急不重要',
    4: '不紧急不重要',
  };
  return names[q];
}

export function quadrantColor(q: Quadrant): string {
  const colors: Record<Quadrant, string> = {
    1: '#ef4444',
    2: '#f59e0b',
    3: '#3b82f6',
    4: '#6b7280',
  };
  return colors[q];
}

export function workloadLabel(w: number): string {
  const labels: Record<number, string> = {
    1: '5 分钟',
    2: '15 分钟',
    3: '30 分钟',
    4: '1 小时',
    5: '2 小时',
  };
  return labels[w] ?? `${w * 15} 分钟`;
}
