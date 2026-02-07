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
      <div className="flex items-center justify-between animate-fade-in">
        <h2 className="text-xl font-display font-semibold text-slate-800">日历</h2>
        <div className="flex items-center gap-1 glass-light p-0.5 rounded-xl">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
              viewMode === 'month' ? 'bg-white/80 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            月
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
              viewMode === 'week' ? 'bg-white/80 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            周
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between glass rounded-xl px-4 py-2.5">
        <button
          onClick={goPrev}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white/40 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-display font-semibold text-slate-800">{headerLabel}</span>
          <button
            onClick={goToday}
            className="text-xs text-accent hover:text-accent-dark font-medium transition-colors"
          >
            今天
          </button>
        </div>
        <button
          onClick={goNext}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white/40 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar body */}
      <div className="glass rounded-xl p-3">
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
