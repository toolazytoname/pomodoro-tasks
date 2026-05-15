# 番茄任务 · 四象限待办应用

## 1. Concept & Vision

**四象限 + 番茄钟 + 智能代理** —— 不是普通的待办列表，是一个帮助决策优先级的「思维导航系统」。

当你面对一堆任务时，它会告诉你：
1. **先做什么** — 按四象限 + 工作量智能排序
2. **怎么做** — 依赖关系一目了然，避免做无用功
3. **做多久** — 番茄钟防止钻牛角尖
4. **谁来帮** — 一键把任务交给 AI 代理

视觉风格：**深色玻璃态 + 柔和渐变**，既专业又护眼，适合长时间使用。

---

## 2. Design Language

### 颜色系统
```
背景:       #0f0f1a (深空黑)
表面:       #1a1a2e (卡片背景)
边框:       rgba(255,255,255,0.08)
主色:       #6366f1 (靛蓝)
强调色:     #22d3ee (青色)
成功:       #10b981
警告:       #f59e0b
危险:       #ef4444

四象限:
  Q1 重要+紧急:  #ef4444 (红) - 立即处理
  Q2 重要+不紧急: #f59e0b (橙) - 计划安排
  Q3 不重要+紧急: #3b82f6 (蓝) - 尽量委托
  Q4 不重要+不紧急:#6b7280 (灰) - 可以忽略
```

### 字体
```
主字体: Inter (Latin), "PingFang SC", "Hiragino Sans GB", sans-serif
代码/数字: JetBrains Mono
```

### 动效哲学
- **卡片进入**: fade + scale(0.95→1), 300ms ease-out
- **番茄钟脉冲**: 呼吸式 scale(1→1.05), 2s infinite
- **依赖线流动**: stroke-dashoffset 动画，暗示流向
- **列表拖拽**: 物理感弹簧动画

---

## 3. Data Model

### Task
```typescript
interface Task {
  id: string;              // UUID
  title: string;           // 任务标题
  description?: string;    // 详细描述
  quadrant: 1 | 2 | 3 | 4; // 四象限
  urgency: number;         // 紧急程度 1-5
  importance: number;       // 重要程度 1-5
  workload: number;        // 工作量 1-5 (1=5分钟, 5=2小时)
  estimatedPomodoros: number; // 预估番茄数

  // 依赖
  dependsOn: string[];     // 依赖的任务 ID
  dependentTasks: string[]; // 依赖此任务的任务 ID

  // 拆解
  parentId?: string;       // 父任务 ID
  children?: string[];     // 子任务 ID
  isParent: boolean;       // 是否是父任务(可拆解)

  // 番茄钟
  pomodorosCompleted: number;
  currentPomodoro?: { startTime: string; remaining: number };
  status: 'pending' | 'in_progress' | 'completed' | 'paused';

  // 元数据
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### 推荐算法
```
优先级分数 = (importance * 2 + urgency) * (6 - workload)
```
分数越高越应该优先处理。

---

## 4. Layout & Structure

### 移动端布局 (优先)
```
┌─────────────────────┐
│ [≡] 番茄任务  [⚙]  │  ← Header: 菜单 + 设置
├─────────────────────┤
│ [四象限] [列表] [图] │  ← Tab 切换
├─────────────────────┤
│                     │
│   四象限网格        │  ← 主要内容
│   (2x2 可滚动)      │
│                     │
├─────────────────────┤
│ [🍅 25:00] [▶ 开始] │  ← 底部番茄钟控制条
└─────────────────────┘
```

### 桌面端布局
```
┌────────────────────────────────────────────────┐
│ [≡] 番茄任务                    [🍅 25:00] [👤] │
├────────────┬───────────────────────────────────┤
│            │                                   │
│  侧边栏     │     主内容区                      │
│  - 四象限   │     (四象限/列表/依赖图)           │
│  - 列表    │                                   │
│  - 依赖图  │                                   │
│  - 番茄钟  │                                   │
│  - 送代理  │                                   │
│            │                                   │
└────────────┴───────────────────────────────────┘
```

---

## 5. Features & Interactions

### 5.1 四象限视图
- 2x2 网格，每个象限独立滚动
- 任务卡片按「优先级分数」降序排列
- 长按/右键可编辑任务
- 拖拽可跨象限移动
- 点击卡片展开详情 + 番茄钟

### 5.2 列表视图
- 支持按「象限/标签/创建时间/优先级」排序
- 每行显示：勾选框 + 标题 + 象限色块 + 番茄数 + 依赖图标
- 滑动左滑：删除 | 右滑：完成
- 顶部筛选栏

### 5.3 依赖图视图
- 节点 = 任务卡片
- 边 = 依赖关系 (A→B 表示 B 依赖 A)
- 节点颜色 = 象限颜色
- 节点大小 ∝ 工作量
- 支持缩放/平移
- 点击节点：选中 + 显示详情面板
- 双击节点：开始番茄钟

### 5.4 任务创建/编辑
```
┌──────────────────────────┐
│ 任务标题 *                │
│ [________________]        │
│                          │
│ 描述                     │
│ [____________________]   │
│ [____________________]   │
│                          │
│ 所在象限                  │
│ ○ Q1 紧急重要             │
│ ● Q2 不紧急重要 ← 选中     │
│ ○ Q3 紧急不重要            │
│ ○ Q4 不紧急不重要          │
│                          │
│ 工作量 [●○○○○] 30分钟      │
│                          │
│ 依赖任务                  │
│ [ ] 设计数据库            │
│ [✓] 写 API               │
│                          │
│ 拆解任务                  │
│ [子任务1] [子任务2] [+]   │
│                          │
│ [取消]        [保存]      │
└──────────────────────────┘
```

### 5.5 番茄钟
- 默认 25 分钟专注 + 5 分钟休息
- 可自定义时长
- 运行时显示悬浮窗 (Web API)
- 完成时：浏览器通知 + 声音提醒
- 长时间任务 (>4 番茄)：强制休息 15 分钟
- 番茄数关联任务完成数统计

### 5.6 任务拆分
- 父任务可添加子任务
- 子任务继承父任务的象限
- 父任务完成 = 所有子任务完成
- 拆分后视图缩进显示

### 5.7 送入代理
- 选择任务 → 点击「送代理」
- 可选代理：Hermes (当前)、或其他已配置代理
- 自动生成任务描述 (含上下文、依赖、限制)
- 通过 Feishu 消息发送给代理
- 显示任务发送状态

---

## 6. Component Inventory

| 组件 | 状态 | 说明 |
|------|------|------|
| TaskCard | default / hover / selected / in-progress | 任务卡片 |
| QuadrantView | empty / populated | 四象限网格 |
| ListView | empty / loading / populated | 列表视图 |
| DependencyGraph | empty / populated / focused | 依赖关系图 |
| PomodoroBar | idle / running / paused / break | 底部计时条 |
| PomodoroOverlay | - | 悬浮计时窗口 |
| TaskEditor | create / edit | 任务编辑表单 |
| DependencySelector | - | 依赖选择器 |
| SubtaskList | collapsed / expanded | 子任务列表 |
| AgentSender | idle / sending / sent / error | 代理发送器 |
| TabBar | - | 移动端 Tab |

---

## 7. API Design

### 任务 CRUD
```
GET    /api/tasks              - 获取所有任务
POST   /api/tasks              - 创建任务
GET    /api/tasks/:id          - 获取单个任务
PUT    /api/tasks/:id          - 更新任务
DELETE /api/tasks/:id          - 删除任务
```

### 依赖关系
```
GET    /api/tasks/:id/dependents    - 获取依赖此任务的任务
GET    /api/tasks/:id/dependencies  - 获取此任务依赖的任务
POST   /api/tasks/:id/depend        - 添加依赖
DELETE /api/tasks/:id/depend/:depId - 移除依赖
```

### 子任务
```
GET    /api/tasks/:id/children       - 获取子任务
POST   /api/tasks/:id/children       - 添加子任务
```

### 番茄钟
```
POST   /api/pomodoro/start           - 开始番茄钟
POST   /api/pomodoro/pause           - 暂停
POST   /api/pomodoro/resume          - 继续
POST   /api/pomodoro/complete        - 完成
POST   /api/pomodoro/abandon         - 放弃
```

### 代理
```
POST   /api/agent/send               - 发送任务到代理
```

---

## 8. Technical Approach

### 前端
- React 18 + TypeScript
- Zustand (状态管理)
- React Router (路由)
- TailwindCSS (样式)
- D3.js (依赖图)
- Vite (构建)

### 后端
- Node.js + Fastify
- Prisma ORM
- SQLite (开发) / PostgreSQL (生产)
- WebSocket (实时同步)
- 浏览器通知 API

### 番茄钟实现
- 前端定时器 (精度要求不高)
- Service Worker 后台支持
- Web Notification API
- 完成时触发 Audio API

### 代理集成
- Hermes Gateway API
- 任务格式化 → Feishu 消息
- 支持选择执行代理

---

## 9. 文件结构

```
pomodoro-tasks/
├── SPEC.md
├── client/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/
│       │   ├── TaskCard.tsx
│       │   ├── QuadrantView.tsx
│       │   ├── ListView.tsx
│       │   ├── DependencyGraph.tsx
│       │   ├── PomodoroBar.tsx
│       │   ├── PomodoroOverlay.tsx
│       │   ├── TaskEditor.tsx
│       │   ├── DependencySelector.tsx
│       │   ├── SubtaskList.tsx
│       │   ├── AgentSender.tsx
│       │   └── TabBar.tsx
│       ├── hooks/
│       │   ├── useTasks.ts
│       │   ├── usePomodoro.ts
│       │   └── useWebSocket.ts
│       ├── stores/
│       │   └── taskStore.ts
│       ├── utils/
│       │   ├── priority.ts
│       │   └── api.ts
│       └── views/
│           └── Dashboard.tsx
├── server/
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── tasks.ts
│       │   ├── pomodoro.ts
│       │   └── agent.ts
│       └── services/
│           ├── taskService.ts
│           └── agentService.ts
└── shared/
    └── types.ts
```
