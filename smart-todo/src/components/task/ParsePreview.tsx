import { useState } from 'react';
import type { ParseResult, Priority, Category } from '@/types';
import { formatDate } from '@/utils/date';

const priorityLabels: Record<Priority, string> = {
  urgent: '紧急', high: '高', medium: '中', low: '低',
};
const categoryLabels: Record<Category, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};

interface Props {
  result: ParseResult;
  onConfirm: (result: ParseResult) => void;
  onCancel: () => void;
  compact?: boolean;
  disabled?: boolean;
}

export default function ParsePreview({ result, onConfirm, onCancel, compact, disabled }: Props) {
  const [edited, setEdited] = useState<ParseResult>(result);

  const isUncertain = (field: string) =>
    result.confidence < 0.7 || result.uncertainFields.includes(field);

  const fieldClass = (field: string) =>
    isUncertain(field)
      ? 'border-amber-300/60 bg-amber-50/40'
      : '';

  const confidenceColor =
    result.confidence >= 0.8 ? 'bg-emerald-400/15 text-emerald-600'
    : result.confidence >= 0.6 ? 'bg-amber-400/15 text-amber-600'
    : 'bg-red-400/15 text-red-600';

  return (
    <div className={compact ? 'space-y-3' : 'rounded-xl glass p-4 space-y-4 animate-scale-in'}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-medium text-slate-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
            <rect x="3" y="8" width="18" height="14" rx="2" />
            <circle cx="12" cy="16" r="2" />
          </svg>
          AI 解析结果
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${confidenceColor}`}>
          置信度 {Math.round(result.confidence * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-400 mb-1">
            标题 {isUncertain('title') && <span className="text-amber-500">· AI不确定</span>}
          </label>
          <input
            type="text"
            value={edited.title}
            onChange={(e) => setEdited({ ...edited, title: e.target.value })}
            disabled={disabled}
            className={`w-full rounded-xl glass-input px-3 py-1.5 text-sm ${fieldClass('title')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            优先级 {isUncertain('priority') && <span className="text-amber-500">· AI不确定</span>}
          </label>
          <select
            value={edited.priority}
            onChange={(e) => setEdited({ ...edited, priority: e.target.value as Priority })}
            disabled={disabled}
            className={`w-full rounded-xl glass-input px-3 py-1.5 text-sm ${fieldClass('priority')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {Object.entries(priorityLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            分类 {isUncertain('category') && <span className="text-amber-500">· AI不确定</span>}
          </label>
          <select
            value={edited.category}
            onChange={(e) => setEdited({ ...edited, category: e.target.value as Category })}
            disabled={disabled}
            className={`w-full rounded-xl glass-input px-3 py-1.5 text-sm ${fieldClass('category')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            截止日期 {isUncertain('dueDate') && <span className="text-amber-500">· AI不确定</span>}
          </label>
          <input
            type="date"
            value={edited.dueDate ? formatDate(edited.dueDate) : ''}
            onChange={(e) => setEdited({ ...edited, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
            disabled={disabled}
            className={`w-full rounded-xl glass-input px-3 py-1.5 text-sm ${fieldClass('dueDate')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">预估时间（分钟）</label>
          <input
            type="number"
            value={edited.estimatedMinutes ?? ''}
            onChange={(e) => setEdited({ ...edited, estimatedMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
            disabled={disabled}
            className={`w-full rounded-xl glass-input px-3 py-1.5 text-sm ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      {edited.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {edited.tags.map((tag) => (
            <span key={tag} className="text-xs bg-white/50 text-slate-500 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-slate-500 border border-white/30 rounded-xl hover:bg-white/40 transition-all"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(edited)}
            className="px-4 py-1.5 text-sm glass-btn rounded-xl"
          >
            确认创建
          </button>
        </div>
      )}
    </div>
  );
}
