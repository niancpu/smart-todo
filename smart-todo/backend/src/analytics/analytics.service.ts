import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../task/task.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}

  async getOverview(userId: string) {
    const tasks = await this.taskRepo.find({ where: { userId } });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const now = new Date();
    const overdue = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
    ).length;

    const tasksWithEstimate = tasks.filter(t => t.estimatedMinutes != null);
    const avgEstimatedMinutes = tasksWithEstimate.length > 0
      ? Math.round(tasksWithEstimate.reduce((sum, t) => sum + t.estimatedMinutes, 0) / tasksWithEstimate.length)
      : 0;

    return { total, completed, completionRate, overdue, avgEstimatedMinutes };
  }

  async getTrends(userId: string) {
    const days: { date: string; created: number; completed: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const created = await this.taskRepo
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId })
        .andWhere("substr(task.createdAt, 1, 10) = :dateStr", { dateStr })
        .getCount();

      const completed = await this.taskRepo
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId })
        .andWhere("substr(task.completedAt, 1, 10) = :dateStr", { dateStr })
        .getCount();

      days.push({ date: dateStr, created, completed });
    }

    return days;
  }

  async getCategories(userId: string) {
    const tasks = await this.taskRepo.find({ where: { userId } });

    const map = new Map<string, { total: number; completed: number }>();
    for (const task of tasks) {
      const cat = task.category || 'other';
      if (!map.has(cat)) map.set(cat, { total: 0, completed: 0 });
      const entry = map.get(cat)!;
      entry.total++;
      if (task.status === 'done') entry.completed++;
    }

    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      completed: stats.completed,
    }));
  }
}
