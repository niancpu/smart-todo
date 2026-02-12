import Dexie, { type Table } from 'dexie';
import type { Task, BoardConfig } from '@/types';

export class SmartTodoDB extends Dexie {
  tasks!: Table<Task, number>;
  boardConfig!: Table<BoardConfig, number>;

  constructor() {
    super('SmartTodoDB');
    this.version(1).stores({
      tasks: '++id, status, category, priority, dueDate, createdAt',
    });

    this.version(2).stores({
      tasks: '++id, status, category, priority, dueDate, createdAt, sortOrder',
      boardConfig: '++id, userId',
    }).upgrade(tx => {
      // 把旧的 'in_progress' 状态迁移为 'doing'
      return tx.table('tasks').toCollection().modify(task => {
        if (task.status === 'in_progress') {
          task.status = 'doing';
        }
      });
    });
  }
}
