import type { TaskDraft } from '@/types';

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: '紧急', color: 'text-red-600 bg-red-50' },
  high: { label: '高', color: 'text-orange-600 bg-orange-50' },
  medium: { label: '中', color: 'text-yellow-600 bg-yellow-50' },
  low: { label: '低', color: 'text-green-600 bg-green-50' },
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
    <div className={`mt-2 rounded-lg border p-3 text-sm ${created ? 'border-green-400 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
      <div className="flex items-center gap-1.5 font-medium text-gray-800">
        {created && (
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {draft.title}
      </div>
      <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
        {draft.dueDate && (
          <span>📅 {formatDate(draft.dueDate)}</span>
        )}
        <span className={`px-1.5 py-0.5 rounded ${prio.color} text-xs`}>{prio.label}</span>
        <span>🏷️ {categoryLabels[draft.category] ?? draft.category}</span>
        {draft.estimatedMinutes && (
          <span>⏱️ {draft.estimatedMinutes}分钟</span>
        )}
      </div>
    </div>
  );
}
