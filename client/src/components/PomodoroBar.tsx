import { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { Play, Pause, X } from 'lucide-react';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;
const LONG_BREAK = 15 * 60;

export default function PomodoroBar() {
  const { tasks } = useTaskStore();
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const runningTask = tasks.find(t => t.status === 'in_progress');

  useEffect(() => {
    if (runningTask && runningTask.currentPomodoro) {
      setRunningTaskId(runningTask.id);
      setTimeLeft(runningTask.currentPomodoro.remaining);
      setIsRunning(true);
      setIsBreak(false);
    }
  }, [runningTask]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleComyMTJnU4aAjW79/WiNw0A1tjblC8AANbZ25MyAADW2t2UNgEA19zfkzsB');
    }
  }, []);

  const handleComplete = () => {
    setIsRunning(false);
    
    if (Notification.permission === 'granted') {
      new Notification(isBreak ? '☕ 休息结束！' : '🍅 番茄完成！', {
        body: isBreak ? '继续工作吧' : '休息一下',
        icon: '/tomato.svg',
      });
    }

    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (!isBreak) {
      const completedPomodoros = runningTask ? runningTask.pomodorosCompleted + 1 : 0;
      setTimeLeft(completedPomodoros > 0 && completedPomodoros % 4 === 0 ? LONG_BREAK : BREAK_DURATION);
      setIsBreak(true);
      setIsRunning(true);
    } else {
      setIsBreak(false);
      setTimeLeft(WORK_DURATION);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleAbandon = () => {
    handlePause();
    setTimeLeft(WORK_DURATION);
    setIsBreak(false);
    setRunningTaskId(null);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((isRunning ? BREAK_DURATION : LONG_BREAK) - timeLeft) / (isRunning ? BREAK_DURATION : LONG_BREAK) * 100
    : (WORK_DURATION - timeLeft) / WORK_DURATION * 100;

  return (
    <>
      {'Notification' in window && Notification.permission === 'default' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 glass px-4 py-2 rounded-lg flex items-center gap-3">
          <span className="text-sm">开启番茄钟通知</span>
          <button
            onClick={() => Notification.requestPermission()}
            className="px-3 py-1 bg-primary rounded text-sm"
          >
            允许
          </button>
        </div>
      )}

      <div className={`glass border-t border-border px-4 py-3 ${runningTaskId ? 'pomodoro-pulse' : ''}`}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${isBreak ? 'text-accent' : 'text-gray-400'}`}>
                {isBreak ? '☕ 休息时间' : '🍅 专注中'}
              </span>
              <span className="text-xs text-gray-500">
                {runningTask?.title?.slice(0, 12) || '未选择任务'}{runningTask && runningTask.title.length > 12 ? '...' : ''}
              </span>
            </div>
            
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isBreak ? 'bg-accent' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="font-mono text-xl font-semibold w-20 text-center">
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                onClick={handleResume}
                disabled={!runningTaskId}
                className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg disabled:opacity-30"
              >
                <Play size={16} />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="p-2 bg-accent/20 hover:bg-accent/30 rounded-lg"
              >
                <Pause size={16} />
              </button>
            )}

            <button
              onClick={handleAbandon}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
