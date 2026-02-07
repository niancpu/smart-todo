import { useState } from 'react';
import type { Task, Priority, Category } from '@/types';
import { formatDate } from '@/utils/date';

const priorityLabels: Record<Priority, string> = {
  urgent: '紧急', high: '高', medium: '中', low: '低',
};
const categoryLabels: Record<Category, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};

interface Props {
  task: Task;
  onSave: (changes: Partial<Task>) => void;
  onCancel: () => void;
}

export default function TaskEditForm({ task, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [category, setCategory] = useState<Category>(task.category);
  const [dueDate, setDueDate] = useState(task.dueDate ? formatDate(task.dueDate) : '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes?.toString() ?? '');
  const [tags, setTags] = useState(task.tags.join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-500 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>标题</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>描述</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="添加详细描述..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>优先级</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
            {Object.entries(priorityLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>分类</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={inputClass}>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>截止日期</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>预估时间（分钟）</label>
          <input type="number" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} min="0" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>标签（逗号分隔）</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="例如：会议, 重要" />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          取消
        </button>
        <button type="submit" disabled={!title.trim()} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          保存
        </button>
      </div>
    </form>
  );
}
