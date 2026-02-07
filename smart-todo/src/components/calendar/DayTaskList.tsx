import type { Task } from '@/types';
import { isOverdue, formatRelativeDate } from '@/utils/date';
import { useTaskStore } from '@/features/task/hooks';
import { WEEKDAY_LABELS } from './calendarUtils';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-slate-300',
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
    <div className="mt-4 animate-fade-in-up">
      <h3 className="text-sm font-display font-medium text-slate-700 mb-2">
        {date.getMonth() + 1}月{date.getDate()}日 周{WEEKDAY_LABELS[date.getDay()]}
        <span className="text-slate-400 ml-2">({tasks.length} 个任务)</span>
      </h3>

      {tasks.length === 0 ? (
        <div className="text-sm text-slate-400 py-4 text-center glass rounded-xl">
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
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isDone
                    ? 'glass-light opacity-70 hover:opacity-90'
                    : 'glass hover:shadow-glass-hover hover:translate-y-[-1px]'
                }`}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-white/40 text-slate-500 px-1.5 py-0.5 rounded-md">
                      {categoryLabels[task.category] ?? task.category}
                    </span>
                    {overdue && (
                      <span className="text-xs text-red-500 font-medium">{formatRelativeDate(task.dueDate)}</span>
                    )}
                    {task.estimatedMinutes && (
                      <span className="text-xs text-slate-400">{task.estimatedMinutes}分钟</span>
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
