import { useState } from 'react';
import type { Task, Category } from '@/types';
import { updateTask } from '@/lib/db';
import { useTaskStore } from '@/features/task/hooks';
import { formatRelativeDate, isOverdue } from '@/utils/date';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-slate-300',
};

const categoryLabels: Record<Category, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  const isDone = task.status === 'done';
  const overdue = !isDone && isOverdue(task.dueDate);
  const selectTask = useTaskStore((s) => s.selectTask);
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);
  const isSelected = task.id === selectedTaskId;
  const [justCompleted, setJustCompleted] = useState(false);

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.id) return;
    const completing = !isDone;
    if (completing) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 650);
    }
    await updateTask(task.id, {
      status: isDone ? 'todo' : 'done',
      completedAt: isDone ? undefined : new Date(),
    });
  };

  return (
    <div
      onClick={() => selectTask(task.id ?? null)}
      className={`flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
        justCompleted
          ? 'check-card-flash'
          : ''
      } ${
        isSelected
          ? 'glass-heavy ring-2 ring-accent/20 shadow-glow'
          : isDone
            ? 'glass-light opacity-70 hover:opacity-90'
            : 'glass hover:shadow-glass-hover hover:translate-y-[-1px]'
      }`}
    >
      <button
        onClick={toggleStatus}
        className={`relative mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          justCompleted
            ? 'check-pop bg-emerald-400 border-emerald-400 text-white shadow-sm'
            : isDone
              ? 'bg-emerald-400 border-emerald-400 text-white shadow-sm'
              : 'border-slate-300/80 hover:border-accent hover:shadow-glow'
        }`}
      >
        {justCompleted && <span className="check-ripple" />}
        {(isDone || justCompleted) && (
          <svg className={`w-3 h-3 ${justCompleted ? 'check-draw' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
          <span className={`text-sm truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs bg-white/40 text-slate-500 px-1.5 py-0.5 rounded-md">
            {categoryLabels[task.category]}
          </span>
          {task.dueDate && (
            <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {formatRelativeDate(task.dueDate)}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="text-xs text-slate-400">{task.estimatedMinutes}分钟</span>
          )}
        </div>
      </div>
    </div>
  );
}
