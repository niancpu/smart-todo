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
    { label: '总任务数', value: String(overview.total), icon: '◈' },
    { label: '完成率', value: `${overview.completionRate}%`, icon: '✓' },
    { label: '逾期任务', value: String(overview.overdue), icon: '⚠' },
    { label: '平均预估', value: overview.avgEstimatedMinutes > 0 ? `${overview.avgEstimatedMinutes}分钟` : '--', icon: '◷' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
              {card.icon}
            </span>
            <span className="text-xs text-gray-500">{card.label}</span>
          </div>
          <div className="text-2xl font-semibold text-gray-800">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ trend }: { trend: DailyTrend[] }) {
  const maxCompleted = Math.max(...trend.map((d) => d.completed), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">最近 7 天完成趋势</h3>
      <div className="flex items-end gap-2 h-40">
        {trend.map((day) => {
          const heightPercent = (day.completed / maxCompleted) * 100;
          const dateLabel = day.date.slice(5); // MM-DD
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">
                {day.completed > 0 ? day.completed : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '120px' }}>
                <div
                  className="w-full bg-blue-400 rounded-t transition-all"
                  style={{
                    height: day.completed > 0 ? `${Math.max(heightPercent, 8)}%` : '0%',
                  }}
                />
              </div>
              <span className="text-xs text-gray-400">{dateLabel}</span>
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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">分类统计</h3>
      {stats.length === 0 ? (
        <p className="text-sm text-gray-400">暂无数据</p>
      ) : (
        <div className="space-y-3">
          {stats.map((stat) => {
            const widthPercent = (stat.total / maxTotal) * 100;
            return (
              <div key={stat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="text-xs text-gray-400">
                    {stat.total} 个 · 完成 {stat.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all"
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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">智能建议</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((s, i) => (
          <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {s.icon}
            </span>
            <div>
              <div className="text-sm font-medium text-gray-700">{s.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>
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
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-800">数据分析</h2>
      <StatsOverview overview={overview} />
      <TrendChart trend={trend} />
      <CategoryBreakdown stats={categoryStats} />
      <SuggestionCards suggestions={suggestions} />
    </div>
  );
}
