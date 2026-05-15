import { useMemo } from 'react';
import { useTaskStore, calcPriority, QUADRANT_NAMES, QUADRANT_COLORS, Quadrant, Task } from '../stores/taskStore';
import TaskCard from './TaskCard';

interface Props {
  onEdit: (id: string) => void;
}

const QUADRANTS: Quadrant[] = [1, 2, 3, 4];

export default function QuadrantView({ onEdit }: Props) {
  const { tasks } = useTaskStore();

  const tasksByQuadrant = useMemo(() => {
    const grouped: Record<Quadrant, Task[]> = { 1: [], 2: [], 3: [], 4: [] };
    
    tasks
      .filter(t => t.status !== 'completed')
      .forEach(task => {
        if (grouped[task.quadrant]) {
          grouped[task.quadrant].push(task);
        }
      });

    // Sort by priority within each quadrant
    Object.keys(grouped).forEach(q => {
      grouped[Number(q) as Quadrant].sort((a, b) => calcPriority(b) - calcPriority(a));
    });

    return grouped;
  }, [tasks]);

  return (
    <div className="h-full grid grid-cols-2 grid-rows-2 gap-2 p-2 overflow-hidden">
      {QUADRANTS.map(q => (
        <div
          key={q}
          className="glass rounded-xl flex flex-col overflow-hidden"
          style={{ borderTop: `3px solid ${QUADRANT_COLORS[q]}` }}
        >
          {/* Quadrant Header */}
          <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: QUADRANT_COLORS[q] }}
              />
              <span className="text-xs font-medium text-gray-300">
                {QUADRANT_NAMES[q]}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {tasksByQuadrant[q].length}
            </span>
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tasksByQuadrant[q].length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                暂无任务
              </div>
            ) : (
              tasksByQuadrant[q].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  compact
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
