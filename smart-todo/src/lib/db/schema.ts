import Dexie, { type Table } from 'dexie';
import type { Task } from '@/types';

export class SmartTodoDB extends Dexie {
  tasks!: Table<Task, number>;

  constructor() {
    super('SmartTodoDB');
    this.version(1).stores({
      tasks: '++id, status, category, priority, dueDate, createdAt',
    });
  }
}
