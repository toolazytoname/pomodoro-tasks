import { useState, useMemo } from 'react';
import { useTaskStore, calcPriority, QUADRANT_COLORS, Quadrant, Task } from '../stores/taskStore';
import TaskCard from './TaskCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface Props {
  onEdit: (id: string) => void;
}

type SortBy = 'priority' | 'created' | 'quadrant';

export default function ListView({ onEdit }: Props) {
  const { tasks } = useTaskStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [filterQuadrant, setFilterQuadrant] = useState<Quadrant | 'all'>('all');

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => t.status !== 'completed');

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    // Filter by quadrant
    if (filterQuadrant !== 'all') {
      result = result.filter(t => t.quadrant === filterQuadrant);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return calcPriority(b) - calcPriority(a);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'quadrant':
          return a.quadrant - b.quadrant;
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, search, sortBy, filterQuadrant]);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} className="text-gray-500 shrink-0" />
          <button
            onClick={() => setFilterQuadrant('all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${
              filterQuadrant === 'all'
                ? 'bg-primary/20 text-primary'
                : 'bg-surface text-gray-400 hover:bg-white/5'
            }`}
          >
            全部
          </button>
          {([1, 2, 3, 4] as Quadrant[]).map(q => (
            <button
              key={q}
              onClick={() => setFilterQuadrant(q)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition ${
                filterQuadrant === q
                  ? 'text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
              style={filterQuadrant === q ? { backgroundColor: QUADRANT_COLORS[q] + '33', color: QUADRANT_COLORS[q] } : {}}
            >
              Q{q}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-3">
        <ArrowUpDown size={14} className="text-gray-500" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-surface text-sm text-gray-400 rounded px-2 py-1 border border-border"
        >
          <option value="priority">按优先级</option>
          <option value="created">按创建时间</option>
          <option value="quadrant">按象限</option>
        </select>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">🍅</p>
            <p>暂无任务</p>
            <p className="text-sm mt-1">点击右上角添加新任务</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  );
}
