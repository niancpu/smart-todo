import type { Task } from '@/types';
import { isSameDay, isToday, WEEKDAY_LABELS } from './calendarUtils';
import { formatRelativeDate, isOverdue } from '@/utils/date';
import { useTaskStore } from '@/features/task/hooks';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-slate-300',
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
            <div className={`flex items-center gap-2 mb-1.5 px-1 ${today ? 'text-accent' : 'text-slate-500'}`}>
              <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full font-medium ${
                today ? 'bg-accent text-white' : ''
              }`}>
                {date.getDate()}
              </span>
              <span className="text-xs font-medium">
                {WEEKDAY_LABELS[date.getDay()]}
              </span>
              <span className="text-xs text-slate-400">
                {date.getMonth() + 1}/{date.getDate()}
              </span>
            </div>

            {dayTasks.length === 0 ? (
              <div className="text-xs text-slate-300 pl-10 py-2">无任务</div>
            ) : (
              <div className="space-y-1.5 pl-2">
                {dayTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const overdue = !isDone && isOverdue(task.dueDate);
                  return (
                    <div
                      key={task.id}
                      onClick={() => selectTask(task.id ?? null)}
                      className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        isDone
                          ? 'glass-light opacity-60'
                          : 'glass hover:shadow-glass-hover hover:translate-y-[-1px]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                      <span className={`text-sm truncate flex-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
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
