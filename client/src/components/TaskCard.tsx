import { useTaskStore, QUADRANT_COLORS, WORKLOAD_LABELS, Task } from '../stores/taskStore';
import { Play, Pause, CheckCircle, Clock, GitBranch, Split } from 'lucide-react';

interface Props {
  task: Task;
  onEdit: (id: string) => void;
  compact?: boolean;
}

export default function TaskCard({ task, onEdit, compact = false }: Props) {
  const { startPomodoro, completePomodoro } = useTaskStore();

  const handlePomodoro = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'in_progress') {
      completePomodoro(task.id);
    } else {
      startPomodoro(task.id);
    }
  };

  const isInProgress = task.status === 'in_progress';

  return (
    <div
      onClick={() => onEdit(task.id)}
      className={`glass rounded-lg p-3 cursor-pointer task-card ${
        isInProgress ? 'ring-1 ring-primary' : ''
      }`}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: QUADRANT_COLORS[task.quadrant] }}
          />
          <span className="text-xs text-gray-400">
            Q{task.quadrant}
          </span>
        </div>
        
        {/* Pomodoro indicator */}
        <div className="flex items-center gap-1">
          {task.isParent && (
            <span title="可拆分" className="text-accent">
              <Split size={12} />
            </span>
          )}
          {(task.dependsOn.length > 0 || task.dependentTasks.length > 0) && (
            <span title="有依赖" className="text-gray-400">
              <GitBranch size={12} />
            </span>
          )}
          <span className="text-xs text-gray-500">
            <Clock size={12} className="inline mr-0.5" />
            {task.pomodorosCompleted}/{task.estimatedPomodoros}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-medium text-sm mb-1 ${compact ? 'line-clamp-2' : ''} ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
        {task.title}
      </h3>

      {/* Footer */}
      {!compact && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {WORKLOAD_LABELS[task.workload]}
          </span>
          
          <button
            onClick={handlePomodoro}
            className={`p-1.5 rounded-lg transition ${
              isInProgress
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-primary/20 text-primary hover:bg-primary/30'
            }`}
          >
            {isInProgress ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      )}

      {compact && (
        <button
          onClick={handlePomodoro}
          className={`mt-2 text-xs px-2 py-1 rounded transition ${
            isInProgress
              ? 'bg-green-500/20 text-green-400'
              : 'bg-primary/20 text-primary'
          }`}
        >
          {isInProgress ? '⏸ 暂停' : '▶ 开始'}
        </button>
      )}
    </div>
  );
}
