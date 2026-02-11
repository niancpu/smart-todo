import { useRef, useEffect } from 'react';
import { useChatHandler } from '@/hooks/useChatHandler';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import ThinkingBubble from '@/components/chat/ThinkingBubble';

export default function MiniChatView() {
  const { messages, isAiThinking, handleSend } = useChatHandler();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAiThinking]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {messages.length === 0 && !isAiThinking && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center mb-2 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
                <rect x="3" y="8" width="18" height="14" rx="2" />
                <circle cx="12" cy="16" r="2" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">告诉我你要做什么</p>
            <p className="text-[10px] mt-1 text-slate-300">例如：「明天下午三点开会」</p>
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
