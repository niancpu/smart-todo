import { SmartTodoDB } from './schema';
import type { Task, TaskFilter, BoardConfig } from '@/types';
import { DEFAULT_BOARD_CONFIG } from '@/types';

export const db = new SmartTodoDB();

// ========== Task 操作 ==========

export async function getAllTasks(filter?: TaskFilter): Promise<Task[]> {
  let collection = db.tasks.orderBy('createdAt');

  const tasks = await collection.reverse().toArray();

  if (!filter) return tasks;

  return tasks.filter((task) => {
    if (filter.status && filter.status !== 'all' && task.status !== filter.status) return false;
    if (filter.category && task.category !== filter.category) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !task.rawInput.toLowerCase().includes(q)) return false;
    }
    if (filter.dateRange) {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      if (d < filter.dateRange.start || d > filter.dateRange.end) return false;
    }
    return true;
  });
}

export async function getTasksByStatus(status: string): Promise<Task[]> {
  return db.tasks.where('status').equals(status).sortBy('sortOrder');
}

export async function addTask(task: Omit<Task, 'id'>): Promise<number> {
  return db.tasks.add(task as Task);
}

export async function updateTask(id: number, changes: Partial<Task>): Promise<void> {
  await db.tasks.update(id, changes);
}

/** 切换任务状态，自动处理 doing 计时和 done 完成时间 */
export async function changeTaskStatus(id: number, newStatus: string): Promise<void> {
  const task = await db.tasks.get(id);
  if (!task || task.status === newStatus) return;

  const changes: Partial<Task> = { status: newStatus };

  // 离开 doing → 累加已用时间，清除计时起点
  if (task.status === 'doing' && task.doingStartedAt) {
    const elapsed = Date.now() - new Date(task.doingStartedAt).getTime();
    changes.doingElapsedMs = (task.doingElapsedMs ?? 0) + elapsed;
    changes.doingStartedAt = undefined;
  }

  // 进入 doing → 记录计时起点
  if (newStatus === 'doing') {
    changes.doingStartedAt = new Date();
  }

  // 进入 done → 记录完成时间
  if (newStatus === 'done') {
    changes.completedAt = new Date();
  }

  // 离开 done → 清除完成时间
  if (task.status === 'done') {
    changes.completedAt = undefined;
  }

  await db.tasks.update(id, changes);
}

export async function deleteTask(id: number): Promise<void> {
  await db.tasks.delete(id);
}

// ========== BoardConfig 操作 ==========

export async function getBoardConfig(): Promise<BoardConfig> {
  const config = await db.boardConfig.toCollection().first();
  if (config) return config;

  // 首次使用，写入默认配置
  const id = await db.boardConfig.add(DEFAULT_BOARD_CONFIG);
  return { ...DEFAULT_BOARD_CONFIG, id };
}

export async function saveBoardConfig(config: BoardConfig): Promise<void> {
  // put = 有id就覆盖，没id就新增
  await db.boardConfig.put(config);
}

// 批量更新任务状态（删除列时用）
export async function bulkUpdateTaskStatus(fromStatus: string, toStatus: string): Promise<void> {
  await db.tasks.where('status').equals(fromStatus).modify({ status: toStatus });
}

// 批量删除某状态的所有任务（删除 dropped 列时用）
export async function bulkDeleteTasksByStatus(status: string): Promise<void> {
  await db.tasks.where('status').equals(status).delete();
}
