import type { Task, Priority } from '@/types';
import { isSameDay, isToday, WEEKDAY_LABELS } from './calendarUtils';

const priorityDotColors: Record<Priority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
};

interface Props {
  days: Date[];
  currentMonth: number;
  tasks: Task[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export default function MonthView({ days, currentMonth, tasks, selectedDate, onSelectDate }: Props) {
  const getTasksForDay = (date: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-500 py-2">
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {days.map((date, i) => {
          const inMonth = date.getMonth() === currentMonth;
          const today = isToday(date);
          const selected = selectedDate && isSameDay(date, selectedDate);
          const dayTasks = getTasksForDay(date);

          return (
            <div
              key={i}
              onClick={() => onSelectDate(date)}
              className={`min-h-[72px] md:min-h-[80px] p-1.5 border-r border-b border-gray-200 cursor-pointer transition-colors ${
                selected
                  ? 'bg-blue-50'
                  : today
                    ? 'bg-amber-50/50'
                    : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                  today
                    ? 'bg-blue-600 text-white font-bold'
                    : inMonth
                      ? 'text-gray-800'
                      : 'text-gray-300'
                }`}
              >
                {date.getDate()}
              </span>

              {/* Task dots */}
              {dayTasks.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {dayTasks.slice(0, 5).map((t) => (
                    <span
                      key={t.id}
                      className={`w-1.5 h-1.5 rounded-full ${priorityDotColors[t.priority]}`}
                    />
                  ))}
                  {dayTasks.length > 5 && (
                    <span className="text-[10px] text-gray-400 leading-none">+{dayTasks.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
