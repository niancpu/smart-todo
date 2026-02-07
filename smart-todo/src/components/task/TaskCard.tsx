import type { Task, Category } from '@/types';
import { updateTask } from '@/lib/db';
import { useTaskStore } from '@/features/task/hooks';
import { formatRelativeDate, isOverdue } from '@/utils/date';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
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

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.id) return;
    await updateTask(task.id, {
      status: isDone ? 'todo' : 'done',
      completedAt: isDone ? undefined : new Date(),
    });
  };

  return (
    <div
      onClick={() => selectTask(task.id ?? null)}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
        isSelected
          ? 'bg-blue-50 border-blue-300'
          : isDone
            ? 'bg-gray-50 border-gray-100 hover:border-gray-200'
            : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <button
        onClick={toggleStatus}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isDone
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {isDone && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
          <span className={`text-sm truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
            {categoryLabels[task.category]}
          </span>
          {task.dueDate && (
            <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {formatRelativeDate(task.dueDate)}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="text-xs text-gray-400">{task.estimatedMinutes}分钟</span>
          )}
        </div>
      </div>
    </div>
  );
}
