import type { Task, Category, Priority } from '@/types';
import { isOverdue } from '@/utils/date';

export interface Overview {
  total: number;
  completed: number;
  completionRate: number;
  overdue: number;
  avgEstimatedMinutes: number;
}

export interface DailyTrend {
  date: string;
  completed: number;
  created: number;
}

export interface CategoryStat {
  category: Category;
  label: string;
  total: number;
  completed: number;
  completionRate: number;
}

export interface PriorityStat {
  priority: Priority;
  label: string;
  total: number;
  completed: number;
  completionRate: number;
}

export interface Suggestion {
  icon: string;
  title: string;
  description: string;
}

const categoryLabels: Record<Category, string> = {
  work: '工作',
  personal: '个人',
  health: '健康',
  study: '学习',
  shopping: '购物',
  other: '其他',
};

const priorityLabels: Record<Priority, string> = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低',
};

function toDateKey(d: Date): string {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calcOverview(tasks: Task[]): Overview {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue = tasks.filter((t) => t.status !== 'done' && isOverdue(t.dueDate)).length;
  const withEstimate = tasks.filter((t) => t.estimatedMinutes != null);
  const avgEstimatedMinutes =
    withEstimate.length > 0
      ? Math.round(withEstimate.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0) / withEstimate.length)
      : 0;

  return { total, completed, completionRate, overdue, avgEstimatedMinutes };
}

export function calcDailyTrend(tasks: Task[], days = 7): DailyTrend[] {
  const result: DailyTrend[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const completed = tasks.filter(
      (t) => t.completedAt && toDateKey(t.completedAt) === key
    ).length;
    const created = tasks.filter(
      (t) => t.createdAt && toDateKey(t.createdAt) === key
    ).length;
    result.push({ date: key, completed, created });
  }

  return result;
}

export function calcCategoryStats(tasks: Task[]): CategoryStat[] {
  const categories: Category[] = ['work', 'personal', 'health', 'study', 'shopping', 'other'];
  return categories
    .map((category) => {
      const filtered = tasks.filter((t) => t.category === category);
      const total = filtered.length;
      const completed = filtered.filter((t) => t.status === 'done').length;
      return {
        category,
        label: categoryLabels[category],
        total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    })
    .filter((s) => s.total > 0);
}

export function calcPriorityStats(tasks: Task[]): PriorityStat[] {
  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
  return priorities
    .map((priority) => {
      const filtered = tasks.filter((t) => t.priority === priority);
      const total = filtered.length;
      const completed = filtered.filter((t) => t.status === 'done').length;
      return {
        priority,
        label: priorityLabels[priority],
        total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    })
    .filter((s) => s.total > 0);
}

export function generateSuggestions(tasks: Task[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const overview = calcOverview(tasks);

  if (tasks.length === 0) return suggestions;

  if (overview.completionRate < 50) {
    suggestions.push({
      icon: '!',
      title: '完成率偏低',
      description: `当前完成率仅 ${overview.completionRate}%，建议将大任务拆分为更小的可执行步骤。`,
    });
  }

  if (overview.overdue > 0) {
    suggestions.push({
      icon: '⏰',
      title: `${overview.overdue} 个任务已逾期`,
      description: '建议优先处理逾期任务，或调整截止日期为更合理的时间。',
    });
  }

  const highPriorityPending = tasks.filter(
    (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done'
  );
  if (highPriorityPending.length > 3) {
    suggestions.push({
      icon: '▲',
      title: '高优先级任务较多',
      description: `有 ${highPriorityPending.length} 个高优先级任务待完成，建议重新评估优先级，聚焦最重要的事项。`,
    });
  }

  const trend = calcDailyTrend(tasks, 7);
  const totalCompleted7d = trend.reduce((s, d) => s + d.completed, 0);
  if (totalCompleted7d === 0 && tasks.length > 0) {
    suggestions.push({
      icon: '△',
      title: '最近 7 天无完成记录',
      description: '尝试从最简单的任务开始，建立完成的节奏感。',
    });
  }

  if (overview.completionRate >= 80) {
    suggestions.push({
      icon: '★',
      title: '完成率很高！',
      description: `当前完成率 ${overview.completionRate}%，保持这个节奏！`,
    });
  }

  return suggestions;
}
