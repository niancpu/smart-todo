import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addTask, updateTask, deleteTask } from '@/lib/db';
import { mockParseTask as parseTask } from '@/features/ai/mock';
import { useTaskStore } from './store';
import type { Task, TaskFilter, ParseResult } from '@/types';

export { useTaskStore } from './store';

export function useTasks(filter?: TaskFilter) {
  const storeFilter = useTaskStore((s) => s.filter);
  const activeFilter = filter ?? storeFilter;

  const tasks = useLiveQuery(async () => {
    let collection = db.tasks.orderBy('createdAt');
    const all = await collection.reverse().toArray();

    return all.filter((task) => {
      if (activeFilter.status && activeFilter.status !== 'all' && task.status !== activeFilter.status)
        return false;
      if (activeFilter.category && task.category !== activeFilter.category) return false;
      if (activeFilter.priority && task.priority !== activeFilter.priority) return false;
      if (activeFilter.search) {
        const q = activeFilter.search.toLowerCase();
        if (!task.title.toLowerCase().includes(q) && !task.rawInput.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [activeFilter.status, activeFilter.category, activeFilter.priority, activeFilter.search]);

  return tasks ?? [];
}

export function useTask(id: number | null) {
  return useLiveQuery(
    () => (id != null ? db.tasks.get(id) : undefined),
    [id]
  );
}

export function useUpdateTask() {
  return useCallback(async (id: number, changes: Partial<Task>) => {
    await updateTask(id, changes);
  }, []);
}

export function useDeleteTask() {
  const selectTask = useTaskStore((s) => s.selectTask);
  return useCallback(async (id: number) => {
    await deleteTask(id);
    selectTask(null);
  }, [selectTask]);
}

export function useCreateTask() {
  const create = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    await addTask({
      ...taskData,
      status: 'todo',
      createdAt: new Date(),
    });
  }, []);

  return { create };
}

export function useParseTask() {
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<ParseResult | null>(null);

  const mutate = useCallback(async (rawInput: string) => {
    setIsPending(true);
    try {
      const result = await parseTask(rawInput);
      setData(result);
      return result;
    } finally {
      setIsPending(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
  }, []);

  return { mutate, isPending, data, reset };
}
