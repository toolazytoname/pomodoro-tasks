# 🍅 番茄任务 - 四象限待办应用

> 四象限 + 番茄钟 + 智能代理 — 帮助决策优先级的「思维导航系统」

## 功能特性

### 📊 四象限视图
- 按「紧急程度 × 重要程度」自动分类
- **Q1 紧急重要** - 立即处理 (红色)
- **Q2 重要不紧急** - 计划安排 (橙色)  
- **Q3 紧急不重要** - 尽量委托 (蓝色)
- **Q4 不重要不紧急** - 可以忽略 (灰色)

### 📋 列表视图
- 支持搜索、筛选、多种排序方式
- 按优先级/创建时间/象限排序

### 🔗 依赖关系图
- D3.js 力导向图可视化
- 拖拽、缩放、平移交互
- 节点大小反映工作量

### ⏱️ 番茄钟
- 25 分钟专注 + 5 分钟休息
- 每 4 个番茄后长休息 (15 分钟)
- 浏览器通知 + 声音提醒
- 长时间任务强制休息

### 🤖 智能代理
- 一键发送任务给 Hermes 代理
- 自动带上依赖关系和上下文

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 状态 | Zustand |
| 样式 | TailwindCSS |
| 图表 | D3.js |
| 后端 | Node.js + Fastify |
| ORM | Prisma |
| 数据库 | SQLite (开发) / PostgreSQL (生产) |

## 快速开始

### 前置要求
- Node.js 18+
- npm 9+

### 安装

```bash
# 克隆仓库
git clone https://github.com/toolazytoname/pomodoro-tasks.git
cd pomodoro-tasks

# 安装后端依赖
cd server && npm install

# 安装前端依赖  
cd ../client && npm install
```

### 启动开发服务器

```bash
# 终端 1 - 启动后端
cd server
npm run dev

# 终端 2 - 启动前端
cd client
npm run dev
```

访问 http://localhost:5173

### 数据库初始化

```bash
cd server
npx prisma db push
```

## 部署

### 前端 (Vercel)

```bash
cd client
npm run build
# Vercel 会自动检测并部署
```

或将 Vercel 连接到 GitHub 仓库实现自动部署。

### 后端 (Railway)

1. 在 [Railway](https://railway.app) 创建新项目
2. 连接 GitHub 仓库
3. 设置环境变量：
   - `DATABASE_URL`: PostgreSQL 连接字符串
   - `PORT`: 3001
4. 部署后端

### 后端 (Render)

1. 在 [Render](https://render.com) 创建 Web Service
2. 连接 GitHub 仓库
3. 设置环境变量
4. 部署

## 环境变量

```env
# Server (.env)
DATABASE_URL="file:./dev.db"  # 开发环境
PORT=3001

# 生产环境使用 PostgreSQL
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 获取所有任务 |
| POST | /api/tasks | 创建任务 |
| GET | /api/tasks/:id | 获取单个任务 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |
| POST | /api/pomodoro/start | 开始番茄钟 |
| POST | /api/pomodoro/pause | 暂停 |
| POST | /api/pomodoro/complete | 完成 |
| POST | /api/agent/send | 发送给代理 |

## 优先级算法

```
优先级分数 = (重要程度 × 2 + 紧急程度) × (6 - 工作量)
```

分数越高越应该优先处理。这个算法确保：
- 重要且紧急的任务优先
- 工作量小的任务加分
- 紧急但重要的任务比紧急但不重要的更有价值

## 项目结构

```
pomodoro-tasks/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── stores/         # Zustand 状态管理
│   │   └── App.tsx         # 主应用组件
│   └── package.json
├── server/                 # 后端 Node.js 应用
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型
│   └── src/
│       └── routes/         # API 路由
├── shared/                 # 共享类型定义
│   └── types.ts
└── SPEC.md                 # 详细设计规范
```

## License

MIT
