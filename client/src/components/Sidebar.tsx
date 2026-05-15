import { LayoutGrid, List, GitBranch, Send, Timer } from 'lucide-react';

type View = 'quadrant' | 'list' | 'graph';

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  className?: string;
}

const navItems = [
  { id: 'quadrant' as View, label: '四象限', icon: LayoutGrid },
  { id: 'list' as View, label: '列表', icon: List },
  { id: 'graph' as View, label: '依赖图', icon: GitBranch },
];

export default function Sidebar({ view, setView, className = '' }: SidebarProps) {
  return (
    <aside className={`w-48 border-r border-border glass flex flex-col py-4 ${className}`}>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              view === id
                ? 'bg-primary/20 text-primary'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-border">
        <div className="px-3 py-2 text-xs text-gray-500">
          <p className="font-medium text-gray-400 mb-1">快捷提示</p>
          <p>重要紧急 + 工作量小 = 优先处理</p>
        </div>
      </div>
    </aside>
  );
}
