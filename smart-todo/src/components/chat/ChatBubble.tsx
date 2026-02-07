import type { ChatMessage } from '@/types';
import TaskCard from './TaskCard';

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] glass-btn rounded-2xl rounded-br-md px-4 py-2.5 text-sm">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.role === 'system') {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-slate-400 bg-white/30 rounded-full px-3 py-1">
          {message.text}
        </span>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex justify-start gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
          <rect x="3" y="8" width="18" height="14" rx="2" />
          <circle cx="12" cy="16" r="2" />
        </svg>
      </div>
      <div className="max-w-[85%] glass rounded-2xl rounded-bl-md px-4 py-3">
        <div className="text-sm text-slate-700 whitespace-pre-line">{message.text}</div>
        {message.taskDraft && (
          <TaskCard draft={message.taskDraft} created={message.taskCreated} />
        )}
      </div>
    </div>
  );
}
