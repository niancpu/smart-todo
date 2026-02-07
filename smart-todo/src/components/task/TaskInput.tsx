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
          className="flex-1 resize-none rounded-xl glass-input px-4 py-2.5 text-sm placeholder:text-slate-400 font-body"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isPending}
          className="px-5 py-2.5 glass-btn text-sm font-medium rounded-xl whitespace-nowrap"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" className="opacity-30" />
                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              解析中
            </span>
          ) : '添加'}
        </button>
      </div>
      {data && (
        <ParsePreview result={data} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
}
