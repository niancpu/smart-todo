import { useRef, useEffect } from 'react';
import { useChatHandler } from '@/hooks/useChatHandler';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import ThinkingBubble from './ThinkingBubble';

export default function ChatView() {
  const { messages, isAiThinking, handleSend } = useChatHandler();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAiThinking]);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 && !isAiThinking && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center mb-4 shadow-glow">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
                <rect x="3" y="8" width="18" height="14" rx="2" />
                <circle cx="12" cy="16" r="2" />
              </svg>
            </div>
            <p className="text-lg font-display font-medium text-slate-600 mb-1">你好!</p>
            <p className="text-sm text-slate-400">告诉我你要做什么，我来帮你创建任务</p>
            <p className="text-xs mt-2 text-slate-300">例如：「明天下午三点开会」「周五前完成报告」</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isAiThinking && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={isAiThinking} />
    </div>
  );
}
