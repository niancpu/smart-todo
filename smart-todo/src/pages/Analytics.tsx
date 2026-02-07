import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Task } from '@/types';
import {
  calcOverview,
  calcDailyTrend,
  calcCategoryStats,
  generateSuggestions,
  type Overview,
  type DailyTrend,
  type CategoryStat,
  type Suggestion,
} from '@/features/analytics/calculations';

function StatsOverview({ overview }: { overview: Overview }) {
  const cards = [
    {
      label: '总任务数', value: String(overview.total),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1.5" />
        </svg>
      ),
    },
    {
      label: '完成率', value: `${overview.completionRate}%`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: '逾期任务', value: String(overview.overdue),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: '平均预估', value: overview.avgEstimatedMinutes > 0 ? `${overview.avgEstimatedMinutes}分钟` : '--',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
      {cards.map((card) => (
        <div key={card.label} className="glass rounded-xl p-4 hover:shadow-glass-hover transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              {card.icon}
            </span>
            <span className="text-xs text-slate-400">{card.label}</span>
          </div>
          <div className="text-2xl font-display font-semibold text-slate-800">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ trend }: { trend: DailyTrend[] }) {
  const maxCompleted = Math.max(...trend.map((d) => d.completed), 1);

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-display font-medium text-slate-700 mb-4">最近 7 天完成趋势</h3>
      <div className="flex items-end gap-2 h-40">
        {trend.map((day) => {
          const heightPercent = (day.completed / maxCompleted) * 100;
          const dateLabel = day.date.slice(5);
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400 font-medium">
                {day.completed > 0 ? day.completed : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '120px' }}>
                <div
                  className="w-full bg-gradient-to-t from-accent/80 to-accent-light/60 rounded-t-lg transition-all duration-500"
                  style={{
                    height: day.completed > 0 ? `${Math.max(heightPercent, 8)}%` : '0%',
                  }}
                />
              </div>
              <span className="text-xs text-slate-400">{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryBreakdown({ stats }: { stats: CategoryStat[] }) {
  const maxTotal = Math.max(...stats.map((s) => s.total), 1);

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-display font-medium text-slate-700 mb-4">分类统计</h3>
      {stats.length === 0 ? (
        <p className="text-sm text-slate-400">暂无数据</p>
      ) : (
        <div className="space-y-3">
          {stats.map((stat) => {
            const widthPercent = (stat.total / maxTotal) * 100;
            return (
              <div key={stat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{stat.label}</span>
                  <span className="text-xs text-slate-400">
                    {stat.total} 个 · 完成 {stat.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-accent to-accent-light h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SuggestionCards({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-display font-medium text-slate-700 mb-4">智能建议</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((s, i) => (
          <div key={i} className="flex gap-3 p-3 bg-white/30 rounded-xl hover:bg-white/50 transition-colors">
            <span className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <div>
              <div className="text-sm font-medium text-slate-700">{s.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const tasks = useLiveQuery(() => db.tasks.toArray()) as Task[] | undefined;
  const taskList = tasks ?? [];

  const overview = calcOverview(taskList);
  const trend = calcDailyTrend(taskList, 7);
  const categoryStats = calcCategoryStats(taskList);
  const suggestions = generateSuggestions(taskList);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <h2 className="text-xl font-display font-semibold text-slate-800 animate-fade-in">数据分析</h2>
      <StatsOverview overview={overview} />
      <TrendChart trend={trend} />
      <CategoryBreakdown stats={categoryStats} />
      <SuggestionCards suggestions={suggestions} />
    </div>
  );
}
