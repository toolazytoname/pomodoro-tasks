import { useState, useEffect } from 'react';
import { useTaskStore, QUADRANT_NAMES, QUADRANT_COLORS, WORKLOAD_LABELS, Quadrant, Task } from '../stores/taskStore';
import { X, Trash2, Send, Plus, GitBranch, Clock } from 'lucide-react';

interface Props {
  taskId: string | null;
  onClose: () => void;
}

export default function TaskEditor({ taskId, onClose }: Props) {
  const { tasks, createTask, updateTask, deleteTask } = useTaskStore();
  const existingTask = taskId ? tasks.find(t => t.id === taskId) : null;

  const [form, setForm] = useState({
    title: '',
    description: '',
    quadrant: 2 as Quadrant,
    urgency: 3,
    importance: 3,
    workload: 3,
    estimatedPomodoros: 1,
    dependsOn: [] as string[],
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [showDepSelector, setShowDepSelector] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (existingTask) {
      setForm({
        title: existingTask.title,
        description: existingTask.description || '',
        quadrant: existingTask.quadrant,
        urgency: existingTask.urgency,
        importance: existingTask.importance,
        workload: existingTask.workload,
        estimatedPomodoros: existingTask.estimatedPomodoros,
        dependsOn: existingTask.dependsOn || [],
        tags: existingTask.tags || [],
      });
    }
  }, [existingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      if (existingTask) {
        await updateTask(existingTask.id, form);
      } else {
        await createTask(form as any);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDelete = async () => {
    if (!existingTask) return;
    if (!confirm('确定要删除这个任务吗？')) return;
    await deleteTask(existingTask.id);
    onClose();
  };

  const handleSendToAgent = async () => {
    if (!existingTask) return;
    setSending(true);
    try {
      const res = await fetch('/api/agent/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: existingTask.id, agent: 'hermes' }),
      });
      const data = await res.json();
      alert(`任务已发送给 ${data.agent}\n\n${data.message.slice(0, 100)}...`);
    } catch (err) {
      alert('发送失败');
    }
    setSending(false);
  };

  const toggleDependency = (depId: string) => {
    setForm(f => ({
      ...f,
      dependsOn: f.dependsOn.includes(depId)
        ? f.dependsOn.filter(id => id !== depId)
        : [...f.dependsOn, depId],
    }));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const availableDeps = tasks.filter(
    t => t.id !== taskId && t.status !== 'completed'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {existingTask ? '编辑任务' : '新建任务'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              任务标题 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="输入任务标题..."
              className="w-full px-4 py-3 bg-surface rounded-lg border border-border focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              描述
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="详细描述..."
              rows={3}
              className="w-full px-4 py-3 bg-surface rounded-lg border border-border focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Quadrant */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              所在象限
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([1, 2, 3, 4] as Quadrant[]).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, quadrant: q }))}
                  className={`p-3 rounded-lg border text-sm text-left transition ${
                    form.quadrant === q
                      ? 'border-current bg-current/10'
                      : 'border-border hover:border-white/20'
                  }`}
                  style={{ color: QUADRANT_COLORS[q], borderColor: form.quadrant === q ? QUADRANT_COLORS[q] : undefined }}
                >
                  <span className="font-medium">Q{q}</span>
                  <span className="ml-2 text-gray-400">{QUADRANT_NAMES[q]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency & Importance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                紧急程度: <span className="text-white">{form.urgency}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={form.urgency}
                onChange={e => setForm(f => ({ ...f, urgency: Number(e.target.value) }))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>不急</span><span>非常急</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                重要程度: <span className="text-white">{form.importance}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={form.importance}
                onChange={e => setForm(f => ({ ...f, importance: Number(e.target.value) }))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>不重要</span><span>非常重要</span>
              </div>
            </div>
          </div>

          {/* Workload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              工作量 (预估时间)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                value={form.workload}
                onChange={e => {
                  const w = Number(e.target.value);
                  setForm(f => ({ ...f, workload: w, estimatedPomodoros: Math.ceil(w * 0.8) }));
                }}
                className="flex-1 accent-blue-500"
              />
              <span className="text-sm text-gray-300 w-20">
                {WORKLOAD_LABELS[form.workload]}
              </span>
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <button
              type="button"
              onClick={() => setShowDepSelector(!showDepSelector)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <GitBranch size={16} />
              依赖任务 ({form.dependsOn.length})
            </button>
            
            {showDepSelector && (
              <div className="mt-2 p-3 bg-surface rounded-lg border border-border max-h-40 overflow-y-auto">
                {availableDeps.length === 0 ? (
                  <p className="text-sm text-gray-500">暂无其他任务</p>
                ) : (
                  availableDeps.map(t => (
                    <label key={t.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={form.dependsOn.includes(t.id)}
                        onChange={() => toggleDependency(t.id)}
                        className="rounded"
                      />
                      <span className="text-sm" style={{ color: QUADRANT_COLORS[t.quadrant] }}>
                        Q{t.quadrant}
                      </span>
                      <span className="text-sm truncate">{t.title}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary/20 text-primary rounded text-xs flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="添加标签..."
                className="flex-1 px-3 py-1.5 bg-surface rounded border border-border text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-1.5 bg-primary/20 text-primary rounded text-sm"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="flex gap-2">
            {existingTask && (
              <>
                <button
                  type="button"
                  onClick={handleSendToAgent}
                  disabled={sending}
                  className="px-3 py-2 bg-accent/20 text-accent rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={14} />
                  {sending ? '发送中...' : '送代理'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-1.5 hover:bg-red-500/30"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white rounded-lg text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
