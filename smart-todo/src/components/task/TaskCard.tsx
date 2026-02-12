import { useState } from 'react';
import type { Task, Category } from '@/types';
import { changeTaskStatus } from '@/lib/db';
import { useTaskStore } from '@/features/task/hooks';
import { formatRelativeDate, isOverdue } from '@/utils/date';
import { useDoingTimer } from '@/hooks/useDoingTimer';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-slate-300',
};

const categoryLabels: Record<Category, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};

const statusLabels: Record<string, string> = {
  todo: 'ToDo', doing: 'Doing', done: 'Done', dropped: 'Dropped',
};

const statusColors: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-500',
  doing: 'bg-blue-100 text-blue-600',
  done: 'bg-emerald-100 text-emerald-600',
  dropped: 'bg-slate-100 text-slate-400',
};

interface Props {
  task: Task;
  showCheckbox?: boolean;
  showDueDate?: boolean;
  compact?: boolean;
}

export default function TaskCard({ task, showCheckbox = true, showDueDate = true, compact = false }: Props) {
  const isDone = task.status === 'done';
  const overdue = !isDone && isOverdue(task.dueDate);
  const selectTask = useTaskStore((s) => s.selectTask);
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);
  const isSelected = task.id === selectedTaskId;
  const [justCompleted, setJustCompleted] = useState(false);
  const timer = useDoingTimer(task);

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.id) return;
    const completing = !isDone;
    if (completing) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 650);
    }
    await changeTaskStatus(task.id, isDone ? 'todo' : 'done');
  };

  const statusLabel = statusLabels[task.status] ?? task.status;
  const statusColor = statusColors[task.status] ?? 'bg-slate-100 text-slate-500';

  if (compact) {
    return (
      <div
        onClick={() => selectTask(task.id ?? null)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors cursor-pointer group"
      >
        {showCheckbox && (
          <button
            onClick={toggleStatus}
            className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 hover:border-blue-400 transition-colors flex items-center justify-center"
          >
            {isDone && (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
        <span className={`text-xs truncate flex-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
          {task.title}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-[10px] px-1 py-0.5 rounded ${statusColor}`}>{statusLabel}</span>
          {timer && (
            <span className={`text-[10px] ${timer.isOvertime ? 'text-red-500' : 'text-slate-400'}`}>
              {timer.text}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => selectTask(task.id ?? null)}
      className={`flex items-start gap-3 ${compact ? 'p-2' : 'p-3.5'} rounded-xl transition-all duration-200 cursor-pointer ${
        justCompleted ? 'check-card-flash' : ''
      } ${
        isSelected
          ? 'glass-heavy ring-2 ring-accent/20 shadow-glow'
          : isDone
            ? 'glass-light opacity-70 hover:opacity-90'
            : 'glass hover:shadow-glass-hover hover:translate-y-[-1px]'
      }`}
    >
      {showCheckbox && (
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
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
          <span className={`text-sm truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded-md ${statusColor}`}>
            {statusLabel}
          </span>
          <span className="text-xs bg-white/40 text-slate-500 px-1.5 py-0.5 rounded-md">
            {categoryLabels[task.category]}
          </span>
          {timer && (
            <span className={`text-xs ${timer.isOvertime ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {timer.text}
            </span>
          )}
          {showDueDate && task.dueDate && (
            <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {formatRelativeDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
