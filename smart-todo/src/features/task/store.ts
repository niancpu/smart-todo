import { create } from 'zustand';
import type { TaskFilter } from '@/types';

interface TaskStoreState {
  filter: TaskFilter;
  selectedTaskId: number | null;
  setFilter: (filter: Partial<TaskFilter>) => void;
  selectTask: (id: number | null) => void;
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  filter: { status: 'all' },
  selectedTaskId: null,
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
  selectTask: (id) => set({ selectedTaskId: id }),
}));
