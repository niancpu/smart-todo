import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useIsMobile } from '@/hooks/useMediaQuery';
import TaskDetail from '@/components/task/TaskDetail';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayTaskList from '@/components/calendar/DayTaskList';
import {
  getMonthDays,
  getWeekDays,
  getMonthRange,
  getWeekRange,
  isSameDay,
  MONTH_LABELS,
} from '@/components/calendar/calendarUtils';

type ViewMode = 'month' | 'week';

export default function Calendar() {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'week' : 'month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const range = useMemo(
    () => (viewMode === 'month' ? getMonthRange(year, month) : getWeekRange(currentDate)),
    [viewMode, year, month, currentDate]
  );

  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where('dueDate')
        .between(range.start, range.end, true, true)
        .toArray(),
    [range.start.getTime(), range.end.getTime()]
  ) ?? [];

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate));
  }, [selectedDate, tasks]);

  const goNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
    setSelectedDate(null);
  };

  const goPrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
    setSelectedDate(null);
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const headerLabel =
    viewMode === 'month'
      ? `${year}年 ${MONTH_LABELS[month]}`
      : (() => {
          const s = weekDays[0];
          const e = weekDays[6];
          return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`;
        })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">日历</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            月
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            周
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2.5">
        <button
          onClick={goPrev}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">{headerLabel}</span>
          <button
            onClick={goToday}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            今天
          </button>
        </div>
        <button
          onClick={goNext}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar body */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        {viewMode === 'month' ? (
          <MonthView
            days={monthDays}
            currentMonth={month}
            tasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        ) : (
          <WeekView days={weekDays} tasks={tasks} />
        )}
      </div>

      {/* Selected day task list (month view only) */}
      {viewMode === 'month' && selectedDate && (
        <DayTaskList date={selectedDate} tasks={selectedDayTasks} />
      )}

      {/* Task detail panel */}
      <TaskDetail />
    </div>
  );
}
