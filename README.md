# 🍅 番茄任务 · 四象限待办应用

**四象限 + 番茄钟 + 智能代理** —— 不是普通的待办列表，是一个帮助决策优先级的「思维导航系统」。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)

---

## ✨ 核心功能

### 🗺️ 四象限视图
按照「是否紧急 × 是否重要」将任务分为四个象限：

| 象限 | 说明 | 颜色 |
|------|------|------|
| Q1 紧急重要 | 立即处理，不能拖延 | 🔴 红色 |
| Q2 重要不紧急 | 计划安排，从容应对 | 🟠 橙色 |
| Q3 紧急不重要 | 尽量委托，快速完成 | 🔵 蓝色 |
| Q4 不重要不紧急 | 可以忽略或删除 | ⚪ 灰色 |

### 📊 智能优先级
推荐算法：**优先级分数 = (重要性×2 + 紧急程度) × (6 - 工作量)**

- 工作量越小、越重要、越紧急的任务，优先级越高
- 重要紧急 + 工作量小 = 最高优先

### 🔗 依赖关系图
- 任务之间可以设置依赖（A 依赖 B → B 先完成）
- D3.js 可视化依赖关系
- 避免做无用功，按正确顺序推进

### 🍅 番茄钟
- 默认 25 分钟专注 + 5 分钟休息
- 可自定义时长
- 完成时浏览器通知 + 声音提醒
- **长时间任务 (>4 番茄) 强制休息 15 分钟** — 防止钻牛角尖

### 📦 任务拆分
- 大任务可拆分为子任务
- 子任务继承父任务的象限
- 父任务完成 = 所有子任务完成

### 🤖 送入代理
- 一键将任务发送给 AI 代理（如 Hermes）
- 自动生成任务描述（含上下文、依赖、限制）
- 支持多种代理

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────┐
│                 前端 (React + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ 四象限视图 │  │ 列表视图  │  │ 依赖图    │  ...     │
│  └──────────┘  └──────────┘  └──────────┘           │
│                    状态管理 (Zustand)                 │
│               Supabase JS 客户端 (直接通信)            │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│           Supabase Edge Functions (Deno)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ 任务 CRUD │  │ 番茄钟API │  │ 代理发送  │          │
│  └──────────┘  └──────────┘  └──────────┘           │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│             Supabase PostgreSQL                      │
└─────────────────────────────────────────────────────┘
```

> **遗留代码注意**：`server/` 目录下有旧版 Fastify + Prisma 后端（端口 3001），该实现已被 Supabase Edge Functions 替代，前端不再使用。

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 + TypeScript | 响应式，跨平台 |
| 状态 | Zustand | 轻量状态管理 |
| 样式 | TailwindCSS | 原子化 CSS |
| 图表 | D3.js | 依赖关系可视化 |
| 构建 | Vite | 快速开发构建 |
| 后端 | Supabase Edge Functions | Deno，无服务器计算 |
| 数据库 | Supabase PostgreSQL | 托管数据库 |
| 测试 | Vitest | 快速单元测试 |
| CI/CD | GitHub Actions | 自动测试部署 |
| 部署 | Vercel (前端) + Supabase (后端) | 云端托管 |

---

## 📁 项目结构

```
pomodoro-tasks/
├── client/                    # 前端应用 (React)
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── TaskCard.tsx   # 任务卡片
│   │   │   ├── QuadrantView.tsx # 四象限视图
│   │   │   ├── ListView.tsx   # 列表视图
│   │   │   ├── DependencyGraph.tsx # D3依赖图
│   │   │   ├── PomodoroBar.tsx # 番茄钟控制条
│   │   │   ├── TaskEditor.tsx # 任务编辑器
│   │   │   ├── Sidebar.tsx    # 侧边栏
│   │   │   └── ...
│   │   ├── stores/
│   │   │   └── taskStore.ts  # Zustand 状态管理
│   │   └── lib/
│   │       └── supabase.ts   # Supabase 客户端
│   ├── package.json
│   └── vite.config.ts
│
├── supabase/                  # Supabase 后端
│   ├── functions/             # Edge Functions (Deno)
│   │   ├── _shared/
│   │   │   └── db.ts         # 共享数据库工具
│   │   ├── tasks/index.ts    # 任务 CRUD
│   │   ├── pomodoro/index.ts # 番茄钟 API
│   │   ├── agent/index.ts    # 代理发送
│   │   └── health/index.ts   # 健康检查
│   └── migrations/           # 数据库迁移 SQL
│
├── server/                    # ⚠️ 遗留代码 (已废弃)
│   ├── src/
│   │   ├── routes/           # Fastify 路由 (已停用)
│   │   │   ├── tasks.ts
│   │   │   ├── pomodoro.ts
│   │   │   └── agent.ts
│   │   └── index.ts
│   └── prisma/
│       └── schema.prisma     # Prisma 模型 (已停用)
│
├── shared/                    # 共享类型
│   └── types.ts              # TypeScript 类型定义
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI
│
├── docker-compose.yml        # ⚠️ 遗留 (Fastify 本地开发，已停用)
├── DEPLOY.md                 # 当前部署指南 (Vercel + Supabase)
├── SPEC.md                   # 详细设计规范
└── README.md
```

---

## 🚀 快速开始

### 前置要求
- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- Vercel CLI (`npm install -g vercel`)

### 1. 克隆项目

```bash
git clone https://github.com/toolazytoname/pomodoro-tasks.git
cd pomodoro-tasks
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

在 `supabase/` 目录配置你的 Supabase 项目后：

```bash
cd supabase
supabase functions deploy tasks
supabase functions deploy pomodoro
supabase functions deploy agent
supabase functions deploy health
```

### 4. 配置前端环境变量

创建 `client/.env.local`（不要提交到 Git）：

```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_FUNCTIONS_URL=https://<your-project>.supabase.co/functions/v1
```

### 5. 启动开发服务器

```bash
cd client
npm run dev
```

前端会自动连接 Supabase 云端。

### 6. 运行测试

```bash
# 共享类型测试
npm run test --workspace=shared

# 服务端测试 (如有需要)
npm run test --workspace=server
```

---

## 🐳 旧版 Docker 部署（已废弃）

> ⚠️ 以下 Docker 部署方式适用于 `server/` 目录下的旧版 Fastify 后端，已被 Supabase Edge Functions 替代，仅作历史参考。

```bash
# 旧版 Fastify 后端本地开发
cd server
npm run dev

# 旧版 Docker Compose (Fastify + PostgreSQL)
docker-compose up -d
```

---

## 📡 API 文档

### 任务 API

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/tasks` | 获取所有任务 |
| `POST` | `/api/tasks` | 创建任务 |
| `GET` | `/api/tasks/:id` | 获取单个任务 |
| `PUT` | `/api/tasks/:id` | 更新任务 |
| `DELETE` | `/api/tasks/:id` | 删除任务 |
| `GET` | `/api/tasks/:id/children` | 获取子任务 |

### 番茄钟 API

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/pomodoro/start` | 开始番茄钟 |
| `POST` | `/api/pomodoro/pause` | 暂停 |
| `POST` | `/api/pomodoro/resume` | 继续 |
| `POST` | `/api/pomodoro/complete` | 完成 |
| `POST` | `/api/pomodoro/abandon` | 放弃 |

### 代理 API

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/agent/send` | 发送任务到代理 |

详细 API 文档请参考 [API.md](./API.md)

---

## 🧪 测试

### 测试文件

- `shared/types.test.ts` - 共享类型和工具函数测试
- `server/src/routes/tasks.test.ts` - 任务 CRUD 测试（旧版 Fastify）
- `server/src/routes/pomodoro.test.ts` - 番茄钟 API 测试（旧版 Fastify）
- `server/src/routes/agent.test.ts` - 代理发送测试（旧版 Fastify）

---

## 🎨 设计规范

### 颜色系统

```
背景:       #0f0f1a (深空黑)
表面:       #1a1a2e (卡片背景)
边框:       rgba(255,255,255,0.08)
主色:       #6366f1 (靛蓝)
强调色:     #22d3ee (青色)

四象限:
  Q1 紧急重要:  #ef4444 (红)
  Q2 重要不紧急: #f59e0b (橙)
  Q3 紧急不重要: #3b82f6 (蓝)
  Q4 不紧急不重要:#6b7280 (灰)
```

### 字体

- 主字体: Inter (Latin), "PingFang SC", "Hiragino Sans GB", sans-serif
- 代码/数字: JetBrains Mono

### 动效

- 卡片进入: fade + scale(0.95→1), 300ms ease-out
- 番茄钟脉冲: 呼吸式 scale(1→1.05), 2s infinite
- 依赖线流动: stroke-dashoffset 动画

---

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [React](https://react.dev/) - UI 框架
- [Supabase](https://supabase.com/) - 后端即服务
- [D3.js](https://d3js.org/) - 数据可视化
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理
- [Vitest](https://vitest.dev/) - 测试框架
- [Vercel](https://vercel.com/) - 前端托管