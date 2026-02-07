import { useState } from 'react';
import { useParseTask } from '@/features/task/hooks';
import ParsePreview from './ParsePreview';
import { useCreateTask } from '@/features/task/hooks';
import type { ParseResult } from '@/types';

export default function TaskInput() {
  const [input, setInput] = useState('');
  const { mutate, isPending, data, reset } = useParseTask();
  const { create } = useCreateTask();

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || isPending) return;
    await mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConfirm = async (result: ParseResult) => {
    await create({
      title: result.title,
      description: result.description,
      rawInput: input,
      category: result.category,
      tags: result.tags,
      priority: result.priority,
      dueDate: result.dueDate,
      estimatedMinutes: result.estimatedMinutes,
      aiConfidence: result.confidence,
    });
    setInput('');
    reset();
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入任务，例如：明天下午3点开会"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isPending}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isPending ? '解析中...' : '添加'}
        </button>
      </div>
      {data && (
        <ParsePreview result={data} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
}
