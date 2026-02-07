import type { TaskDraft } from '@/types';

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: '紧急', color: 'text-red-600 bg-red-400/10' },
  high: { label: '高', color: 'text-orange-600 bg-orange-400/10' },
  medium: { label: '中', color: 'text-blue-600 bg-blue-400/10' },
  low: { label: '低', color: 'text-emerald-600 bg-emerald-400/10' },
};

const categoryLabels: Record<string, string> = {
  work: '工作', personal: '个人', health: '健康',
  study: '学习', shopping: '购物', other: '其他',
};

function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  let dayStr = '';
  if (diffDays <= 0) dayStr = '今天';
  else if (diffDays === 1) dayStr = '明天';
  else if (diffDays === 2) dayStr = '后天';
  else dayStr = `${d.getMonth() + 1}月${d.getDate()}日`;

  const hours = d.getHours();
  const minutes = d.getMinutes();
  if (hours > 0 || minutes > 0) {
    const period = hours < 12 ? '上午' : '下午';
    const h = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    dayStr += ` ${period}${h}:${String(minutes).padStart(2, '0')}`;
  }
  return dayStr;
}

interface Props {
  draft: TaskDraft;
  created?: boolean;
}

export default function TaskCard({ draft, created }: Props) {
  const prio = priorityConfig[draft.priority] ?? priorityConfig.medium;

  return (
    <div className={`mt-2 rounded-xl p-3 text-sm ${created ? 'bg-emerald-400/10 border border-emerald-300/30' : 'bg-white/30 border border-white/20'}`}>
      <div className="flex items-center gap-1.5 font-medium text-slate-700">
        {created && (
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {draft.title}
      </div>
      <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-400">
        {draft.dueDate && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(draft.dueDate)}
          </span>
        )}
        <span className={`px-1.5 py-0.5 rounded-md ${prio.color} text-xs`}>{prio.label}</span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          {categoryLabels[draft.category] ?? draft.category}
        </span>
        {draft.estimatedMinutes && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {draft.estimatedMinutes}分钟
          </span>
        )}
      </div>
    </div>
  );
}
