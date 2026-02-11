import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import WeekView from '@/components/calendar/WeekView';
import { getWeekDays, getWeekRange } from '@/components/calendar/calendarUtils';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const range = useMemo(() => getWeekRange(currentDate), [currentDate]);

  const tasks = useLiveQuery(
    () =>
      db.tasks
        .where('dueDate')
        .between(range.start, range.end, true, true)
        .toArray(),
    [range.start.getTime(), range.end.getTime()]
  ) ?? [];

  const goPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const s = weekDays[0];
  const e = weekDays[6];
  const label = `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Navigation */}
      <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
        <button onClick={goPrev} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          <button onClick={goToday} className="text-[10px] text-accent hover:text-blue-600 font-medium">今天</button>
        </div>
        <button onClick={goNext} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week view */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <WeekView days={weekDays} tasks={tasks} />
      </div>
    </div>
  );
}
