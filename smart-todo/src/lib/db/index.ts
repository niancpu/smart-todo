import { SmartTodoDB } from './schema';
import type { Task, TaskFilter } from '@/types';

export const db = new SmartTodoDB();

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

export async function addTask(task: Omit<Task, 'id'>): Promise<number> {
  return db.tasks.add(task as Task);
}

export async function updateTask(id: number, changes: Partial<Task>): Promise<void> {
  await db.tasks.update(id, changes);
}

export async function deleteTask(id: number): Promise<void> {
  await db.tasks.delete(id);
}
