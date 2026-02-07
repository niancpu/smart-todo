import { db } from '@/lib/db';
import type { Task } from '@/types';

const mockTasks: Omit<Task, 'id'>[] = [
  {
    title: '完成项目周报',
    rawInput: '明天下午完成项目周报',
    category: 'work',
    tags: ['工作'],
    priority: 'high',
    status: 'todo',
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(17, 0, 0, 0); return d; })(),
    createdAt: new Date(),
    estimatedMinutes: 30,
    aiConfidence: 0.85,
  },
  {
    title: '去超市买水果和牛奶',
    rawInput: '今天去超市买水果和牛奶',
    category: 'shopping',
    tags: ['购物'],
    priority: 'medium',
    status: 'todo',
    dueDate: new Date(),
    createdAt: new Date(Date.now() - 3600000),
    aiConfidence: 0.9,
  },
  {
    title: '看完《深入理解计算机系统》第三章',
    rawInput: '这周看完《深入理解计算机系统》第三章',
    category: 'study',
    tags: ['学习'],
    priority: 'medium',
    status: 'todo',
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + (7 - d.getDay())); return d; })(),
    createdAt: new Date(Date.now() - 7200000),
    estimatedMinutes: 120,
    aiConfidence: 0.75,
  },
  {
    title: '晨跑 30 分钟',
    rawInput: '每天早上晨跑30分钟',
    category: 'health',
    tags: ['运动'],
    priority: 'low',
    status: 'done',
    completedAt: new Date(),
    createdAt: new Date(Date.now() - 86400000),
    estimatedMinutes: 30,
    actualMinutes: 35,
    aiConfidence: 0.8,
  },
  {
    title: '准备团队会议 PPT',
    rawInput: '后天上午准备团队会议PPT，很重要',
    category: 'work',
    tags: ['会议'],
    priority: 'urgent',
    status: 'todo',
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(10, 0, 0, 0); return d; })(),
    createdAt: new Date(Date.now() - 10800000),
    estimatedMinutes: 60,
    aiConfidence: 0.92,
  },
  {
    title: '约小李周末看电影',
    rawInput: '约小李周末看电影',
    category: 'personal',
    tags: [],
    priority: 'low',
    status: 'todo',
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7); return d; })(),
    createdAt: new Date(Date.now() - 14400000),
    aiConfidence: 0.65,
  },
];

let seeding: Promise<void> | null = null;

export function seedMockTasks(): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      const count = await db.tasks.count();
      if (count > 0) return;
      await db.tasks.bulkAdd(mockTasks as Task[]);
    })();
  }
  return seeding;
}
