import type { ChatMessage } from '@/types';
import TaskCard from './TaskCard';

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.role === 'system') {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
          {message.text}
        </span>
      </div>
    );
  }

  // assistant
  return (
    <div className="flex justify-start gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-white text-xs font-bold">AI</span>
      </div>
      <div className="max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="text-sm text-gray-800 whitespace-pre-line">{message.text}</div>
        {message.taskDraft && (
          <TaskCard draft={message.taskDraft} created={message.taskCreated} />
        )}
      </div>
    </div>
  );
}
