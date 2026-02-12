# 看板功能设计文档

> 创建时间：2026年2月
> 状态：设计完成，待实现

---

## 一、功能概述

在 smart-todo 应用中新增看板管理功能，支持主窗口完整看板视图和小窗精简看板视图。

- 主窗口：完整看板，默认 4 列（ToDo / Doing / Done / Dropped），支持拖拽排序和跨列移动，支持用户自定义新增列
- 小窗：仅显示 Doing 列，支持列内拖拽排序，提供归档按钮（选择 Done / Dropped）

## 二、技术选型

- 拖拽库：`@hello-pangea/dnd`（react-beautiful-dnd 的活跃维护 fork）
- 存储：Dexie.js（IndexedDB）
- 窗口间同步：Tauri `emit/listen` 事件 + 共享 IndexedDB

## 三、数据模型变更

### 3.1 Task.status 字段改造

现有 Status 类型为固定枚举：

```ts
// 旧
export type Status = 'todo' | 'in_progress' | 'done';
```

改为字符串类型以支持自定义状态：

```ts
// 新
export type Status = string;
```

- 新建任务默认 `status = 'todo'`，包括 AI 生成的任务
- 任务卡片上可点击标签切换状态
- 相同 status 的任务归入同一看板列

### 3.2 新增 BoardColumn 类型

```ts
interface BoardColumn {
  id: string;        // 唯一标识，如 'todo', 'doing', 'done', 'dropped'
  name: string;      // 显示名称
  order: number;     // 列排序位置
  wipLimit?: number; // WIP 上限（可选）
}
```

### 3.3 新增 BoardConfig 类型

```ts
interface BoardConfig {
  id?: number;
  userId?: string;
  columns: BoardColumn[];
}
```

每个用户一份配置，新用户默认配置：

| id | name | order | wipLimit |
|----|------|-------|----------|
| todo | ToDo | 0 | — |
| doing | Doing | 1 | 3（默认值） |
| done | Done | 2 | — |
| dropped | Dropped | 3 | — |

## 四、存储层变更

### 4.1 Dexie Schema 升级

```ts
this.version(1).stores({
  tasks: '++id, status, category, priority, dueDate, createdAt',
});

this.version(2).stores({
  tasks: '++id, status, category, priority, dueDate, createdAt',
  boardConfig: '++id, userId',
});
```

## 五、主窗口看板

- `DragDropContext` 包裹整个看板区域
- 每列为一个 `Droppable`，列内每张任务卡片为 `Draggable`
- 拖拽完成后更新任务的 `status` 字段并写入 Dexie
- 用户可在设置中新增/删除/重命名列

## 六、小窗看板

- `DragDropContext` 包裹，仅包含 Doing 列（一个 `Droppable`）
- 支持列内拖拽排序
- 每张卡片提供归档按钮，点击后选择 Done 或 Dropped
- 数据变更写入 Dexie 后通过 Tauri `emit` 通知主窗口刷新

## 七、WIP 限制

- 默认仅 Doing 列有 WIP 限制（默认值 3）
- 用户可在前端设置中自定义哪些列启用 WIP 及上限值
- 超过 WIP 上限时：
  - 提示"不宜进行多线任务。"
  - 拒绝新建卡片到该列
  - 拒绝拖入该列

## 八、列删除策略

- 删除自定义列时，该列内所有任务自动变为 Dropped 状态
- 默认四列（ToDo / Doing / Done / Dropped）建议设为不可删除

## 九、窗口间数据同步

- 主窗口和小窗共享同一个 IndexedDB 数据库
- 任一窗口修改数据后：写入 Dexie → 通过 Tauri `emit` 发送数据变更事件 → 另一窗口监听事件后从 Dexie 重新读取
