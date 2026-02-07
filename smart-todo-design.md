# 智能待办清单应用设计文档

## 项目概述

基于 Tauri 2.0 框架开发的跨平台智能待办清单应用，利用 AI 技术优化传统待办清单的不足，支持桌面端和移动端（Android）。

### 核心特性

- **自然语言输入**：用户可通过自然语言描述任务，AI 自动解析提取时间、事项、优先级等信息
- **智能分类与优先级**：自动识别任务类别，基于截止时间和重要程度自动排序
- **数据追踪与分析**：每日/周/月完成率统计、任务耗时分析、拖延模式识别
- **智能建议**：基于历史数据推荐最佳工作时段、任务拆分建议、负载预警

---

## 技术选型

### 客户端

| 技术 | 用途 |
|------|------|
| Tauri 2.0 | 跨平台框架（桌面端 + Android） |
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Zustand | 客户端状态管理 |
| React Query | 服务端状态管理、缓存 |
| React Router | 路由 |
| Tailwind CSS | 样式 |
| Dexie.js | IndexedDB 封装（离线存储） |

### 后端

| 技术 | 用途 |
|------|------|
| Node.js | 运行时 |
| NestJS | 后端框架 |
| PostgreSQL | 主数据库 |
| Redis | 缓存、会话管理 |
| JWT | 身份认证 |

### AI 服务

- 云端 API（Claude/OpenAI）
- 后端统一代理 AI 请求（安全性、缓存、限流、Prompt 模板管理）

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                 │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │   Tauri 桌面端   │              │   Android 端    │           │
│  │  (React + Rust) │              │  (Tauri 2.0)    │           │
│  └────────┬────────┘              └────────┬────────┘           │
└───────────┼────────────────────────────────┼────────────────────┘
            │                                │
            ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         后端服务层                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API Gateway                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│           │              │              │              │        │
│           ▼              ▼              ▼              ▼        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │  任务服务   │ │  AI 服务    │ │  分析服务   │ │ 用户服务 │  │
│  │ Task CRUD  │ │ NLP解析     │ │ 统计报表    │ │ 认证授权 │  │
│  │ 分类/标签  │ │ 智能建议    │ │ 趋势分析    │ │ 多端同步 │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └────┬─────┘  │
└─────────┼───────────────┼───────────────┼──────────────┼────────┘
          │               │               │              │
          ▼               ▼               ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         数据层                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐    │
│  │ PostgreSQL  │ │   Redis     │ │    Cloud AI API         │    │
│  │ 主数据库    │ │ 缓存/会话   │ │  (Claude/OpenAI)        │    │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 数据模型设计

### 核心实体：Task

```typescript
interface Task {
  id: string
  userId: string
  
  // 基础信息
  title: string                    // 任务标题
  description?: string             // 详细描述
  rawInput?: string                // 用户原始输入（用于AI学习）
  
  // 分类与标签
  category: string                 // AI识别的分类：work/life/study/health...
  tags: string[]                   // 标签
  priority: 'urgent' | 'high' | 'medium' | 'low'
  
  // 时间相关
  createdAt: Date
  dueDate?: Date                   // 截止时间
  estimatedMinutes?: number        // 预估耗时
  actualMinutes?: number           // 实际耗时
  completedAt?: Date
  
  // 状态
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  
  // 重复任务
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
  
  // AI相关
  aiConfidence: number             // AI解析置信度 0-1
  aiSuggestions?: string[]         // AI给出的建议
}
```

### 数据分析实体

```typescript
interface UserAnalytics {
  // 完成率统计
  completionRate: {
    daily: number
    weekly: number
    monthly: number
    byCategory: Record<string, number>
  }
  
  // 时间模式
  timePatterns: {
    mostProductiveHours: number[]      // 高效时段，如 [9, 10, 14, 15]
    averageCompletionTime: number      // 平均完成耗时
    procrastinationRate: number        // 拖延率（超期任务占比）
  }
  
  // 任务特征
  taskInsights: {
    commonCategories: string[]
    averageTasksPerDay: number
    overloadDays: string[]             // 任务过载的日期
  }
}
```

---

## 数据库设计

### PostgreSQL 表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 基础信息
  title VARCHAR(500) NOT NULL,
  description TEXT,
  raw_input TEXT,
  
  -- 分类标签
  category VARCHAR(50),
  tags VARCHAR(100)[] DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'medium',
  
  -- 时间
  due_date TIMESTAMP,
  estimated_minutes INT,
  actual_minutes INT,
  completed_at TIMESTAMP,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending',
  
  -- AI 相关
  ai_confidence DECIMAL(3,2),
  ai_metadata JSONB DEFAULT '{}',
  
  -- 同步相关
  client_id VARCHAR(100),
  version INT DEFAULT 1,
  deleted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 重复任务规则表
CREATE TABLE task_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  interval INT DEFAULT 1,
  days_of_week INT[],
  end_date TIMESTAMP,
  last_generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 任务完成记录表（用于数据分析）
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  category VARCHAR(50),
  priority VARCHAR(20),
  estimated_minutes INT,
  actual_minutes INT,
  
  was_overdue BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 每日统计快照
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  overdue_tasks INT DEFAULT 0,
  total_estimated_minutes INT DEFAULT 0,
  total_actual_minutes INT DEFAULT 0,
  
  by_category JSONB DEFAULT '{}',
  by_priority JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- 索引
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX idx_completions_user_date ON task_completions(user_id, completed_at);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);
```

---

## 后端设计

### 模块划分

```
src/
├── modules/
│   ├── auth/           # 认证授权
│   │   ├── jwt 策略
│   │   └── 多端 token 管理
│   │
│   ├── user/           # 用户管理
│   │   └── 用户偏好设置
│   │
│   ├── task/           # 任务核心
│   │   ├── CRUD
│   │   ├── 重复任务生成
│   │   └── 状态流转
│   │
│   ├── ai/             # AI 服务
│   │   ├── 自然语言解析
│   │   ├── 智能分类
│   │   └── 建议生成
│   │
│   ├── analytics/      # 数据分析
│   │   ├── 统计聚合
│   │   └── 趋势计算
│   │
│   └── sync/           # 多端同步
│       ├── 冲突解决
│       └── 增量同步
│
├── common/
│   ├── interceptors/
│   ├── filters/
│   └── guards/
```

### API 设计

```yaml
# 认证
POST   /auth/register          # 注册
POST   /auth/login             # 登录，返回 JWT
POST   /auth/refresh           # 刷新 token

# 任务
GET    /tasks                  # 获取任务列表（支持筛选、分页）
POST   /tasks                  # 创建任务（普通方式）
POST   /tasks/parse            # AI 解析创建（核心接口）
GET    /tasks/:id              # 获取单个任务
PATCH  /tasks/:id              # 更新任务
DELETE /tasks/:id              # 删除任务（软删除）
POST   /tasks/:id/complete     # 完成任务
POST   /tasks/:id/reopen       # 重新打开任务

# 同步
POST   /sync/pull              # 拉取增量更新
POST   /sync/push              # 推送本地变更

# AI 服务
POST   /ai/parse               # 解析自然语言
POST   /ai/suggest             # 获取智能建议

# 数据分析
GET    /analytics/overview     # 总览数据
GET    /analytics/trends       # 趋势数据
GET    /analytics/patterns     # 行为模式分析
```

### 核心接口详细设计

#### AI 解析创建任务

```typescript
// POST /tasks/parse
interface ParseAndCreateRequest {
  rawInput: string
  autoCreate?: boolean
}

interface ParseAndCreateResponse {
  parsed: {
    title: string
    description?: string
    dueDate?: string
    priority: string
    category: string
    estimatedMinutes?: number
    tags: string[]
    confidence: number
    uncertainFields: string[]
  }
  task?: Task
}
```

#### 增量同步

```typescript
// POST /sync/pull
interface SyncPullRequest {
  lastSyncAt: string
  deviceId: string
}

interface SyncPullResponse {
  tasks: Task[]
  deletedIds: string[]
  serverTime: string
}

// POST /sync/push
interface SyncPushRequest {
  deviceId: string
  changes: {
    created: Task[]
    updated: Task[]
    deleted: string[]
  }
}

interface SyncPushResponse {
  success: boolean
  conflicts?: {
    taskId: string
    clientVersion: Task
    serverVersion: Task
  }[]
  syncedAt: string
}
```

### AI Prompt 设计

```typescript
const PARSE_TASK_PROMPT = `
你是一个任务解析助手。请从用户输入中提取以下信息，返回 JSON 格式：

- title: 任务标题（简洁）
- description: 补充描述（可选）
- dueDate: 截止时间（ISO格式，基于当前时间 {{currentTime}} 推算）
- priority: 优先级（urgent/high/medium/low）
- category: 分类（work/life/study/health/finance/social）
- estimatedMinutes: 预估耗时（分钟）
- tags: 相关标签数组

用户输入：{{userInput}}

注意：
1. 如果信息不明确，做合理推断并降低 confidence
2. "尽快"="urgent"，"这周内"=本周日截止
3. 返回 confidence 字段表示解析置信度 (0-1)
`
```

### 智能建议触发场景

| 场景 | 建议类型 |
|------|----------|
| 用户添加任务到已超载的日期 | "当天已有 8 个任务，建议移到明天" |
| 连续多日完成率低 | "最近完成率下降，是否需要调整任务量？" |
| 任务预估时间总是不准 | "你的实际耗时通常是预估的 1.5 倍" |
| 识别到高效时段 | "你在上午 9-11 点效率最高，建议安排重要任务" |

### 同步冲突解决策略

采用 **"最后写入胜出 + 用户决策"** 混合策略：

| 情况 | 处理方式 |
|------|----------|
| 修改了不同字段 | 自动合并 |
| 都修改了同一字段，值相同 | 直接通过 |
| 都修改了标题/描述 | 返回冲突，让用户选择 |
| 一端删除，一端修改 | 返回冲突，让用户选择 |

---

## 前端设计

### 目录结构

```
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── components/
│   ├── ui/                     # 基础 UI 组件
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   └── ...
│   │
│   ├── task/                   # 任务相关组件
│   │   ├── TaskInput/          # 自然语言输入框
│   │   ├── TaskCard/
│   │   ├── TaskList/
│   │   ├── TaskDetail/
│   │   ├── TaskEditForm/
│   │   └── ParsePreview/       # AI 解析预览确认
│   │
│   ├── analytics/              # 数据分析组件
│   │   ├── StatsOverview/
│   │   ├── TrendChart/
│   │   ├── CategoryPieChart/
│   │   └── SuggestionCard/
│   │
│   └── layout/
│       ├── Sidebar/
│       ├── Header/
│       └── MobileNav/
│
├── pages/
│   ├── Home/                   # 今日任务
│   ├── Inbox/                  # 收集箱
│   ├── Calendar/               # 日历视图
│   ├── Analytics/              # 数据分析页
│   ├── Settings/               # 设置
│   └── Auth/
│       ├── Login/
│       └── Register/
│
├── features/                   # 业务逻辑
│   ├── task/
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   ├── ai/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── parseUtils.ts
│   │
│   ├── analytics/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── calculations.ts
│   │
│   ├── sync/
│   │   ├── syncManager.ts
│   │   ├── conflictResolver.ts
│   │   ├── offlineQueue.ts
│   │   └── hooks.ts
│   │
│   └── auth/
│       ├── api.ts
│       ├── store.ts
│       └── hooks.ts
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   └── interceptors.ts
│   │
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── migrations.ts
│   │
│   └── tauri/
│       ├── commands.ts
│       └── events.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useOnlineStatus.ts
│
├── utils/
│   ├── date.ts
│   ├── format.ts
│   └── validation.ts
│
├── styles/
│   └── globals.css
│
└── types/
    └── index.ts
```

### 状态管理设计

#### Zustand Store

```typescript
// features/task/store.ts
interface TaskStore {
  tasks: Map<string, Task>
  filter: TaskFilter
  selectedTaskId: string | null
  
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setFilter: (filter: TaskFilter) => void
  selectTask: (id: string | null) => void
}

interface TaskFilter {
  status?: 'pending' | 'completed' | 'all'
  category?: string
  priority?: string
  dateRange?: { start: Date; end: Date }
  search?: string
}

// features/auth/store.ts
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

// features/sync/store.ts
interface SyncStore {
  lastSyncAt: string | null
  isSyncing: boolean
  pendingChanges: number
  conflicts: Conflict[]
  
  setSyncing: (status: boolean) => void
  addPendingChange: () => void
  clearPendingChanges: () => void
  setConflicts: (conflicts: Conflict[]) => void
}
```

#### React Query Hooks

```typescript
// features/task/hooks.ts
export function useTasks(filter: TaskFilter) {
  return useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => taskApi.list(filter),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useParseTask() {
  return useMutation({
    mutationFn: aiApi.parse,
  })
}
```

### 核心交互流程

#### 自然语言输入流程

```
用户输入 ──▶ AI 解析 ──▶ ParsePreview 展示 ──▶ 用户确认/修改 ──▶ 创建任务
```

**置信度处理策略**：当 AI 解析置信度 < 0.7 时，高亮不确定字段让用户修改。

#### TaskInput 组件示例

```tsx
export function TaskInput() {
  const [input, setInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  
  const parseMutation = useParseTask()
  const createMutation = useCreateTask()
  
  const handleSubmit = async () => {
    if (!input.trim()) return
    
    const result = await parseMutation.mutateAsync({ rawInput: input })
    setParseResult(result)
    setShowPreview(true)
  }
  
  const handleConfirm = async (editedData: Partial<Task>) => {
    await createMutation.mutateAsync({
      ...parseResult.parsed,
      ...editedData,
      rawInput: input
    })
    setInput('')
    setShowPreview(false)
  }
  
  return (
    <div className="task-input">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入任务，例如：明天下午开会"
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
      />
      <button onClick={handleSubmit} disabled={parseMutation.isPending}>
        {parseMutation.isPending ? '解析中...' : '添加'}
      </button>
      
      {showPreview && parseResult && (
        <ParsePreview
          result={parseResult}
          onConfirm={handleConfirm}
          onCancel={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
```

### 离线支持架构

```
用户操作
    │
    ▼
useOnlineStatus()
    │
    ├── 在线 ──▶ 直接请求 API + 更新本地 DB
    │
    └── 离线 ──▶ 写入 IndexedDB + 加入离线队列
                        │
                        ▼ 网络恢复
                   SyncManager
                   批量同步队列
                   处理冲突
```

#### 离线队列实现

```typescript
interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'task'
  data: any
  timestamp: number
}

class OfflineQueue {
  private db: Dexie
  
  async add(operation: Omit<OfflineOperation, 'id' | 'timestamp'>) {
    await this.db.offlineQueue.add({
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    })
  }
  
  async process() {
    const operations = await this.db.offlineQueue
      .orderBy('timestamp')
      .toArray()
    
    for (const op of operations) {
      try {
        await this.executeOperation(op)
        await this.db.offlineQueue.delete(op.id)
      } catch (error) {
        if (isConflictError(error)) {
          // 处理冲突
        } else {
          break
        }
      }
    }
  }
}
```

### 响应式设计

| 桌面端 | 移动端 |
|--------|--------|
| 左侧固定 Sidebar | 底部 Tab 导航 |
| 任务列表 + 右侧详情面板 | 列表页/详情页切换 |
| 输入框固定在顶部 | 底部浮动按钮，点击展开输入 |
| 日历视图为月视图 | 默认周视图，可切换 |

```tsx
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

function AppLayout() {
  const isMobile = useIsMobile()
  
  return (
    <div className="app">
      {isMobile ? <MobileNav /> : <Sidebar />}
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## 开发规范

### Git 分支策略

- `main`: 生产环境
- `develop`: 开发环境
- `feature/*`: 功能分支
- `fix/*`: 修复分支

### 代码规范

- ESLint + Prettier
- TypeScript 严格模式
- 组件使用函数式 + Hooks
- 命名规范：组件 PascalCase，函数/变量 camelCase，常量 UPPER_SNAKE_CASE

### 测试策略

- 单元测试：Jest + React Testing Library
- E2E 测试：Playwright
- 覆盖率目标：核心业务逻辑 > 80%

---

## 部署架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   NestJS    │────▶│ PostgreSQL  │
│  反向代理   │     │   后端服务   │     │   数据库    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Redis     │
                    │   缓存      │
                    └─────────────┘
```

- 后端部署在用户服务器
- 使用 Docker 容器化部署
- Nginx 做反向代理和 SSL 终结
