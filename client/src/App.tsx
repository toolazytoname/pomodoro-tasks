import { useEffect, useState } from 'react';
import { useTaskStore } from './stores/taskStore';
import QuadrantView from './components/QuadrantView';
import ListView from './components/ListView';
import DependencyGraph from './components/DependencyGraph';
import PomodoroBar from './components/PomodoroBar';
import TaskEditor from './components/TaskEditor';
import Sidebar from './components/Sidebar';
import { Menu, Settings } from 'lucide-react';

type View = 'quadrant' | 'list' | 'graph';

export default function App() {
  const { fetchTasks, loading, error } = useTaskStore();
  const [view, setView] = useState<View>('quadrant');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openEditor = (taskId?: string) => {
    setEditingTask(taskId || null);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingTask(null);
  };

  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border glass">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition md:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/tomato.svg" alt="🍅" className="w-7 h-7" />
            <h1 className="text-lg font-semibold">番茄任务</h1>
          </div>
        </div>
        <button
          onClick={() => openEditor()}
          className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition"
        >
          + 新任务
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <Sidebar view={view} setView={setView} className="hidden md:flex" />

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 h-full">
              <Sidebar view={view} setView={(v) => { setView(v); setSidebarOpen(false); }} className="h-full" />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">加载中...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6 glass rounded-xl max-w-md">
                <p className="text-red-400 mb-2">⚠️ {error}</p>
                <button
                  onClick={() => fetchTasks()}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm"
                >
                  重试
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="h-full">
              {view === 'quadrant' && <QuadrantView onEdit={openEditor} />}
              {view === 'list' && <ListView onEdit={openEditor} />}
              {view === 'graph' && <DependencyGraph onEdit={openEditor} />}
            </div>
          )}
        </main>
      </div>

      {/* Pomodoro Bar */}
      <PomodoroBar />

      {/* Task Editor Modal */}
      {showEditor && (
        <TaskEditor taskId={editingTask} onClose={closeEditor} />
      )}
    </div>
  );
}
