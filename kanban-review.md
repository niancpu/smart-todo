# 看板功能代码 Review 文档

> 日期：2026-02-11
> 状态：待 Review
> 设计文档：kanban-design.md

---

## 一、修改的文件

### 1. `src/types/index.ts` — 类型定义

**第2行** `export type Status = string;`
- 原来是 `'todo' | 'in_progress' | 'done'`，固定三个值
- 改成 `string` 是因为用户可以自定义看板列（自定义状态），编译时无法穷举所有可能的值

**第5行** `export const DEFAULT_STATUSES = ['todo', 'doing', 'done', 'dropped'] as const;`
- 默认的四种状态，作为常量导出
- `as const` 让 TypeScript 把数组元素的类型推断为字面量（`'todo'`）而不是宽泛的 `string`
- 代码里需要引用默认状态名时用这个常量，避免到处写魔法字符串

**第7-12行** `BoardColumn` 接口
- `id: string` — 列的唯一标识，也是任务 status 字段存的值（如 `'todo'`, `'doing'`）
- `name: string` — 列的显示名称（如 `'ToDo'`, `'Doing'`），展示给用户看的
- `order: number` — 列在看板中的排列顺序，从0开始
- `wipLimit?: number` — WIP（Work In Progress）上限，`?` 表示可选，没设就是不限制

**第14-18行** `BoardConfig` 接口
- `id?: number` — Dexie 自增主键，首次创建时没有，存入数据库后 Dexie 自动分配
- `userId?: string` — 预留给多用户场景，当前单用户可以不填
- `columns: BoardColumn[]` — 该用户的所有看板列配置

**第20-27行** `DEFAULT_BOARD_CONFIG` 常量
- 新用户首次打开应用时写入数据库的默认配置
- 四列：ToDo(order:0)、Doing(order:1, wipLimit:3)、Done(order:2)、Dropped(order:3)
- 只有 Doing 列默认有 WIP 上限 3

**第39行** `sortOrder?: number;`
- Task 接口新增字段，记录任务卡片在看板列内的排序位置
- 拖拽排序时更新这个值，看板按这个字段排序显示
- `?` 可选是因为旧任务没有这个字段，兼容历史数据

---

### 2. `src/lib/db/schema.ts` — Dexie 数据库 Schema

**第2行** `import type { Task, BoardConfig } from '@/types';`
- 新增导入 BoardConfig 类型

**第6行** `boardConfig!: Table<BoardConfig, number>;`
- 声明新表 `boardConfig`，存看板配置
- `Table<BoardConfig, number>` 表示表里存的是 BoardConfig 对象，主键类型是 number
- `!` 是 TypeScript 的非空断言，告诉编译器"这个属性一定会被赋值"（Dexie 在构造函数里通过 stores() 自动赋值）

**第10-12行** `this.version(1).stores({...})`
- 保留原来的 version(1) 定义，不能删——已有用户的数据库是 version(1) 创建的

**第14-16行** `this.version(2).stores({...})`
- 新版本的表结构定义
- tasks 表新增了 `sortOrder` 索引（加在索引列表末尾）
- 新增 `boardConfig` 表，索引为 `++id`（自增主键）和 `userId`

**第17-24行** `.upgrade(tx => {...})`
- 版本升级时执行的迁移函数，只在 version(1) → version(2) 时运行一次
- `tx` 是数据库事务对象
- `tx.table('tasks').toCollection().modify(...)` 遍历所有任务，把 `status === 'in_progress'` 的改成 `'doing'`
- 这样旧数据就和新的状态命名一致了

---

### 3. `src/lib/db/index.ts` — 数据库操作函数

**第2行** 新增导入 `BoardConfig` 类型
**第3行** 新增导入 `DEFAULT_BOARD_CONFIG` 常量

**第33-35行** `getTasksByStatus(status)` — 新增函数
- 按 status 字段查询任务，结果按 sortOrder 排序
- `db.tasks.where('status').equals(status)` 是 Dexie 的查询语法，利用 status 索引快速查找
- `.sortBy('sortOrder')` 按排序字段排序，用于看板列内的卡片顺序

**第51-58行** `getBoardConfig()` — 新增函数
- 读取用户的看板配置
- `db.boardConfig.toCollection().first()` 取第一条记录（当前单用户，只有一条）
- 如果数据库里没有配置（首次使用），自动写入 `DEFAULT_BOARD_CONFIG` 并返回
- 返回时带上 Dexie 分配的 `id`，后续更新时需要这个 id

**第60-63行** `saveBoardConfig(config)` — 新增函数
- `db.boardConfig.put(config)` — Dexie 的 put 方法：有 id 就覆盖已有记录，没 id 就新增
- 之前用的是 `update()`，但 Dexie 的 update 对嵌套对象（columns 数组）的类型推断有问题，改用 put 更简洁

**第66-68行** `bulkUpdateTaskStatus(fromStatus, toStatus)` — 新增函数
- 批量修改任务状态，用于删除看板列时把该列所有任务移到 dropped
- `where('status').equals(fromStatus).modify({ status: toStatus })` 一次性修改所有匹配的记录

---

### 4. `src/components/task/TaskDetail.tsx` — 任务详情面板

**第17-18行** statusLabels 改动
- 原来：`{ todo: '待办', in_progress: '进行中', done: '已完成' }`
- 现在：`{ todo: '待办', doing: '进行中', done: '已完成', dropped: '已放弃' }`
- Record 的 key 类型从 `Status`（固定枚举）改为 `string`（因为 Status 现在是 string）
- 新增 `dropped: '已放弃'`

**第20-22行** statusColors 改动
- 同上，`in_progress` 改为 `doing`，新增 `dropped` 的红色样式

**第169-203行** 状态操作按钮改动
- `todo` 状态：可以"开始执行"（→doing）或"标记完成"（→done）
- `doing` 状态：可以"标记完成"（→done）、"退回待办"（→todo）、"放弃"（→dropped）
- `done` 状态：可以"重新打开"（→todo）
- `dropped` 状态：可以"重新打开"（→todo）
- 每个按钮调用 `handleStatusChange(newStatus)`，更新任务的 status 字段

---

### 5. `src/app/routes.tsx` — 路由配置

**第11行** `import BoardView from '@/components/board/BoardView';`
- 导入看板页面组件

**第25行** `{ path: 'board', element: <BoardView /> },`
- 新增 `/board` 路由，渲染看板页面
- 放在 `tasks` 和 `inbox` 之间

---

### 6. `src/components/layout/Sidebar.tsx` — 侧边栏导航

**第23-32行** 新增看板导航项
- `to: '/board'` — 点击跳转到看板页面
- `label: '看板'` — 显示文字
- icon 是三个竖条的 SVG，视觉上表示看板的三列
- 放在"任务列表"和"收集箱"之间

---

### 7. `src/components/mini/MiniApp.tsx` — 小窗根组件

**第6行** `import MiniBoardView from './MiniBoardView';`
- 导入小窗看板组件

**第8行** Tab 类型新增 `'board'`

**第12行** tabs 数组新增 `{ key: 'board', label: '看板' }`
- 放在"对话"和"日历"之间

**第47行** `{activeTab === 'board' && <MiniBoardView />}`
- 选中看板 tab 时渲染小窗看板组件

---

### 8. `src/pages/Settings.tsx` — 设置页面

**第5行** 新增导入看板 hooks
- `useBoardConfig` — 读取看板配置
- `useUpdateBoardConfig` — 保存看板配置
- `useDeleteColumn` — 删除列

**第14行** 新增导入 `BoardColumn` 类型

**第47-53行** 看板配置相关状态
- `boardConfig` — 当前看板配置（响应式，Dexie 数据变了自动更新）
- `updateBoardConfig` — 保存配置的函数
- `deleteColumn` — 删除列的函数
- `newColumnName` — 新建列时的输入框内容
- `deleteConfirmId` — 当前正在确认删除的列 id（防误删）
- `defaultColumnIds` — 默认四列的 id，这些列不允许删除

**第194-201行** `handleAddColumn` 函数
- 把用户输入的列名转成小写+下划线作为 id（如 "Review" → "review"）
- 检查是否已存在同 id 的列，防止重复
- 新列的 order 设为当前列数（排在最后）
- 保存后清空输入框

**第203-210行** `handleWipChange` 函数
- 修改某列的 WIP 上限
- 输入为空时设为 `undefined`（不限制），否则至少为 1
- 用 `map` 遍历所有列，只修改目标列的 wipLimit

**第212-216行** `handleDeleteColumn` 函数
- 调用 `deleteColumn` hook（内部会把该列任务批量改为 dropped，然后从配置中移除该列）
- 关闭确认弹窗

**第272-327行** 看板设置 UI 区块
- 只在 `boardConfig` 加载完成后渲染（`boardConfig &&`）
- 每列显示：列名 + WIP 上限输入框 + 删除按钮（仅自定义列）
- 删除有二次确认（先显示"删除"，点击后变成"确认/取消"）
- 底部有新建列的输入框和添加按钮，支持回车提交

---

## 二、新建的文件

### 9. `src/features/board/hooks.ts` — 看板数据层 Hooks

**第7-10行** `useBoardConfig()`
- 用 `useLiveQuery` 包裹 `getBoardConfig()`
- `useLiveQuery` 是 Dexie 的 React hook，当 IndexedDB 中的数据变化时自动重新查询并触发组件重渲染
- 返回 `config ?? null`：查询还没完成时返回 null，完成后返回配置对象

**第13-16行** `useBoardTasks()`
- 查询所有任务，按 sortOrder 排序
- 看板页面用这个 hook 获取所有任务，然后在组件里按 status 分组

**第19-23行** `useMoveTask()`
- 返回一个 `useCallback` 包裹的异步函数
- `useCallback` 确保函数引用稳定，不会每次渲染都创建新函数（性能优化）
- 调用 `updateTask` 更新任务的 status 和 sortOrder

**第26-30行** `useUpdateBoardConfig()`
- 保存看板配置的 hook，同样用 useCallback 包裹

**第33-43行** `useDeleteColumn()`
- 删除列的完整流程：
  1. `bulkUpdateTaskStatus(columnId, 'dropped')` — 该列所有任务状态改为 dropped
  2. `filter` 从配置中移除该列
  3. `map` 重新计算每列的 order（保持连续）
  4. 保存新配置

**第46-49行** `checkWipLimit()` — 纯函数（不是 hook）
- 检查某列的任务数是否已达到 WIP 上限
- `wipLimit == null` 用双等号，同时匹配 `null` 和 `undefined`（即没设上限）
- 返回 `true` 表示已达上限，应该拒绝拖入

---

### 10. `src/components/board/BoardCard.tsx` — 看板卡片组件

**第1行** `import { Draggable } from '@hello-pangea/dnd';`
- Draggable 是拖拽库的核心组件，包裹的元素可以被拖动

**第4-9行** priorityColors / categoryLabels
- 和 TaskCard.tsx 里一样的映射表，用于显示优先级颜色点和分类标签

**第15-18行** Props 接口
- `task: Task` — 要显示的任务数据
- `index: number` — 在列中的位置索引，Draggable 需要这个来计算拖拽位置

**第22行** `<Draggable draggableId={String(task.id)} index={index}>`
- `draggableId` 必须是字符串，且在整个 DragDropContext 内唯一
- `index` 是在当前 Droppable 中的位置

**第23行** `{(provided, snapshot) => (...)}`
- Draggable 使用 render props 模式（函数作为子元素）
- `provided` 包含 ref 和 props，必须绑定到 DOM 元素上拖拽才能工作
- `snapshot` 包含当前拖拽状态（如 `isDragging`）

**第25-27行** `ref={provided.innerRef}` / `{...provided.draggableProps}` / `{...provided.dragHandleProps}`
- `innerRef` — 让拖拽库获取 DOM 节点的引用
- `draggableProps` — 包含定位相关的 style 和 data 属性
- `dragHandleProps` — 绑定拖拽手柄的事件监听器（整个卡片都可拖）

**第28-32行** 拖拽时的样式变化
- 正在拖拽时：`glass-heavy shadow-glow ring-2 ring-accent/20 rotate-2`（加重毛玻璃效果 + 发光 + 蓝色边框 + 微旋转）
- 静止时：`glass hover:shadow-glass-hover`（普通毛玻璃 + 悬停阴影）

**第34-36行** 任务标题行
- 优先级颜色圆点 + 任务标题（超长截断）

**第38-45行** 底部信息行
- 分类标签 + 预估时间（如果有）

---

### 11. `src/components/board/BoardColumn.tsx` — 看板列组件

**第1行** `import { Droppable } from '@hello-pangea/dnd';`
- Droppable 是可放置区域，卡片可以被拖入

**第2行** `import type { ..., BoardColumn as BoardColumnType } from '@/types';`
- 导入时重命名为 BoardColumnType，避免和组件同名冲突

**第5-9行** Props
- `column` — 列配置（名称、WIP 上限等）
- `tasks` — 该列的任务数组
- `isOverWip` — 是否已超过 WIP 上限

**第13行** `w-72 flex-shrink-0`
- 固定宽度 288px，`flex-shrink-0` 防止在 flex 容器中被压缩

**第15-28行** 列头
- 显示列名 + 任务计数
- 如果有 WIP 上限，显示"上限 N"标签
- 超限时标签变红

**第32-36行** WIP 警告
- 超限时显示红色提示条"不宜进行多线任务。"

**第39行** `<Droppable droppableId={column.id}>`
- `droppableId` 对应列的 id（如 `'todo'`, `'doing'`）
- 拖拽结束时，`destination.droppableId` 就是目标列的 id

**第40行** `{(provided, snapshot) => (...)}`
- 同样是 render props 模式
- `snapshot.isDraggingOver` 表示是否有卡片正悬停在此区域上方

**第44-48行** 拖入时的样式变化
- 有卡片悬停时：浅蓝色背景 + 虚线边框
- 正常状态：半透明白色背景

**第53行** `{provided.placeholder}`
- 必须放在 Droppable 内部，拖拽时用来占位（保持列的高度）

---

### 12. `src/components/board/BoardView.tsx` — 主窗口看板页面

**第9-11行** 状态初始化
- `config` — 看板配置（从 Dexie 响应式读取）
- `allTasks` — 所有任务
- `wipWarning` — 是否显示 WIP 超限提示

**第14-26行** `tasksByColumn` — 按列分组任务
- `useMemo` 缓存计算结果，只在 config 或 allTasks 变化时重新计算
- 先为每列创建空数组，再遍历所有任务按 status 分入对应列
- 如果任务的 status 不在任何列中（比如列被删了但任务还没迁移），会被忽略

**第28-70行** `onDragEnd` — 拖拽结束回调
- `useCallback` 包裹，依赖 config、tasksByColumn、allTasks
- **第29行** 解构 `source`（来源位置）、`destination`（目标位置）、`draggableId`（被拖的卡片 id）
- **第30行** 没有 destination 说明拖到了无效区域，直接返回
- **第32行** 判断是否同列内排序
- **第37-44行** 跨列移动时检查 WIP：如果目标列已满，显示警告 2 秒后自动消失，拒绝移动
- **第49行** 复制目标列的任务数组（不直接修改原数组）
- **第51-54行** 同列排序：从原位置移除，插入新位置
- **第55-60行** 跨列移动：从所有任务中找到被拖的任务，插入目标列的指定位置
- **第63-69行** 批量更新：遍历目标列所有任务，更新 status 和 sortOrder
  - `Promise.all` 并行执行所有更新操作

**第74行** 按 order 排序列（确保显示顺序正确）

**第81-85行** WIP 超限提示条
- `wipWarning` 为 true 时显示红色提示"不宜进行多线任务。"

**第87-102行** 看板布局
- `DragDropContext` 包裹整个看板，绑定 `onDragEnd`
- `flex gap-4 overflow-x-auto` — 水平排列，列多了可以横向滚动
- 遍历排序后的列，为每列计算 isOverWip，渲染 BoardColumn

---

### 13. `src/components/mini/MiniBoardView.tsx` — 小窗看板组件

**第8-11行** 查询 Doing 状态的任务
- `db.tasks.where('status').equals('doing').sortBy('sortOrder')` — 只查 doing 状态
- `useLiveQuery` 响应式，数据变了自动更新

**第13行** `archiveId` — 当前打开归档菜单的任务 id

**第15-23行** `onDragEnd` — 列内拖拽排序
- 只有一列，所以只处理列内重排
- 复制数组 → 移除原位置 → 插入新位置 → 批量更新 sortOrder

**第25-31行** `handleArchive` — 归档操作
- 把任务状态改为 `'done'` 或 `'dropped'`
- 如果是完成，同时记录 `completedAt` 时间
- 关闭归档菜单

**第46行** `<Droppable droppableId="mini-doing">`
- 小窗的 Droppable id 和主窗口不同（`'mini-doing'` vs `'doing'`），因为它们在不同的 DragDropContext 中，不会冲突

**第50行** `<Draggable key={task.id} draggableId={String(task.id)} index={index}>`
- 每个任务卡片可拖拽

**第60行** 蓝色小圆点表示 doing 状态

**第64-90行** 归档按钮和下拉菜单
- 点击勾号图标切换归档菜单的显示/隐藏
- 菜单有两个选项："完成"（→done）和"放弃"（→dropped）
- `glass-heavy` 毛玻璃效果的下拉菜单

**第95行** `{provided.placeholder}` — Droppable 必需的占位元素

---

## 三、新增依赖

- `@hello-pangea/dnd` — react-beautiful-dnd 的活跃维护 fork，提供 DragDropContext / Droppable / Draggable 三个核心组件

## 四、数据迁移

- Dexie version 1 → 2 时，自动把所有 `status === 'in_progress'` 的任务改为 `'doing'`
- 已有任务数据不会丢失

## 五、未改动但需要注意的文件

- `src/features/task/hooks.ts` 第60行：`useCreateTask` 里 `status: 'todo'` 已经是正确的默认值，不需要改
- `src/features/task/seed.ts`：mock 数据只用了 `'todo'` 和 `'done'`，不需要改
- `src/features/analytics/calculations.ts`：只检查 `'done'` 状态，不需要改
