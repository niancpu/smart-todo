import type { Task } from '@/types';
import { isOverdue, formatRelativeDate } from '@/utils/date';
import { useTaskStore } from '@/features/task/hooks';
import { WEEKDAY_LABELS } from './calendarUtils';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
};

const categoryLabels: Record<string, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};

interface Props {
  date: Date;
  tasks: Task[];
}

export default function DayTaskList({ date, tasks }: Props) {
  const selectTask = useTaskStore((s) => s.selectTask);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        {date.getMonth() + 1}月{date.getDate()}日 周{WEEKDAY_LABELS[date.getDay()]}
        <span className="text-gray-400 ml-2">({tasks.length} 个任务)</span>
      </h3>

      {tasks.length === 0 ? (
        <div className="text-sm text-gray-400 py-4 text-center bg-white rounded-lg border border-gray-200">
          当天没有任务
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isDone = task.status === 'done';
            const overdue = !isDone && isOverdue(task.dueDate);
            return (
              <div
                key={task.id}
                onClick={() => selectTask(task.id ?? null)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isDone
                    ? 'bg-gray-50 border-gray-100 hover:border-gray-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {categoryLabels[task.category] ?? task.category}
                    </span>
                    {overdue && (
                      <span className="text-xs text-red-500 font-medium">{formatRelativeDate(task.dueDate)}</span>
                    )}
                    {task.estimatedMinutes && (
                      <span className="text-xs text-gray-400">{task.estimatedMinutes}分钟</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
