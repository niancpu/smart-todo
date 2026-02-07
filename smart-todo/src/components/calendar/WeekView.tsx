import type { Task } from '@/types';
import { isSameDay, isToday, WEEKDAY_LABELS } from './calendarUtils';
import { formatRelativeDate, isOverdue } from '@/utils/date';
import { useTaskStore } from '@/features/task/hooks';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
};

interface Props {
  days: Date[];
  tasks: Task[];
}

export default function WeekView({ days, tasks }: Props) {
  const selectTask = useTaskStore((s) => s.selectTask);

  const getTasksForDay = (date: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));

  return (
    <div className="space-y-3">
      {days.map((date, i) => {
        const today = isToday(date);
        const dayTasks = getTasksForDay(date);

        return (
          <div key={i}>
            <div className={`flex items-center gap-2 mb-1.5 px-1 ${today ? 'text-blue-600' : 'text-gray-600'}`}>
              <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full font-medium ${
                today ? 'bg-blue-600 text-white' : ''
              }`}>
                {date.getDate()}
              </span>
              <span className="text-xs font-medium">
                {WEEKDAY_LABELS[date.getDay()]}
              </span>
              <span className="text-xs text-gray-400">
                {date.getMonth() + 1}/{date.getDate()}
              </span>
            </div>

            {dayTasks.length === 0 ? (
              <div className="text-xs text-gray-300 pl-10 py-2">无任务</div>
            ) : (
              <div className="space-y-1.5 pl-2">
                {dayTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const overdue = !isDone && isOverdue(task.dueDate);
                  return (
                    <div
                      key={task.id}
                      onClick={() => selectTask(task.id ?? null)}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-gray-50 border-gray-100'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                      <span className={`text-sm truncate flex-1 ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </span>
                      {overdue && (
                        <span className="text-[10px] text-red-500 flex-shrink-0">{formatRelativeDate(task.dueDate)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
