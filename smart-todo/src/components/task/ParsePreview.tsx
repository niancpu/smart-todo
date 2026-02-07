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
      ? 'border-yellow-400 bg-yellow-50'
      : 'border-gray-300 bg-white';

  const confidenceColor =
    result.confidence >= 0.8 ? 'bg-green-100 text-green-800'
    : result.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800';

  return (
    <div className={compact ? 'space-y-3' : 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4'}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">AI 解析结果</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceColor}`}>
          置信度 {Math.round(result.confidence * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">
            标题 {isUncertain('title') && <span className="text-yellow-600">· AI不确定</span>}
          </label>
          <input
            type="text"
            value={edited.title}
            onChange={(e) => setEdited({ ...edited, title: e.target.value })}
            disabled={disabled}
            className={`w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${fieldClass('title')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            优先级 {isUncertain('priority') && <span className="text-yellow-600">· AI不确定</span>}
          </label>
          <select
            value={edited.priority}
            onChange={(e) => setEdited({ ...edited, priority: e.target.value as Priority })}
            disabled={disabled}
            className={`w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${fieldClass('priority')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {Object.entries(priorityLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            分类 {isUncertain('category') && <span className="text-yellow-600">· AI不确定</span>}
          </label>
          <select
            value={edited.category}
            onChange={(e) => setEdited({ ...edited, category: e.target.value as Category })}
            disabled={disabled}
            className={`w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${fieldClass('category')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            截止日期 {isUncertain('dueDate') && <span className="text-yellow-600">· AI不确定</span>}
          </label>
          <input
            type="date"
            value={edited.dueDate ? formatDate(edited.dueDate) : ''}
            onChange={(e) => setEdited({ ...edited, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
            disabled={disabled}
            className={`w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${fieldClass('dueDate')} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">预估时间（分钟）</label>
          <input
            type="number"
            value={edited.estimatedMinutes ?? ''}
            onChange={(e) => setEdited({ ...edited, estimatedMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
            disabled={disabled}
            className={`w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      {edited.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {edited.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(edited)}
            className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            确认创建
          </button>
        </div>
      )}
    </div>
  );
}
