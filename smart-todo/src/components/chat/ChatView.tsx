import { useRef, useEffect } from 'react';
import { useChatStore } from '@/features/chat/store';
import { useCreateTask } from '@/features/task/hooks';
import { chatWithAI } from '@/features/ai/chat';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

function ThinkingBubble() {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-white text-xs font-bold">AI</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1 items-center h-5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export default function ChatView() {
  const messages = useChatStore((s) => s.messages);
  const isAiThinking = useChatStore((s) => s.isAiThinking);
  const currentDraft = useChatStore((s) => s.currentDraft);
  const { addMessage, setAiThinking, setCurrentDraft } = useChatStore();
  const { create } = useCreateTask();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAiThinking]);

  const handleSend = async (text: string) => {
    addMessage({ role: 'user', text });
    setAiThinking(true);
    try {
      const history = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }));
      const response = await chatWithAI(text, currentDraft, history);
      if (response.shouldCreate && response.updatedDraft) {
        const draft = response.updatedDraft;
        await create({
          title: draft.title,
          description: draft.description,
          rawInput: text,
          category: draft.category,
          tags: draft.tags,
          priority: draft.priority,
          dueDate: draft.dueDate,
          estimatedMinutes: draft.estimatedMinutes,
        });
        addMessage({
          role: 'assistant',
          text: response.text,
          taskDraft: draft,
          taskCreated: true,
        });
        setCurrentDraft(null);
      } else {
        setCurrentDraft(response.updatedDraft);
        addMessage({
          role: 'assistant',
          text: response.text,
          taskDraft: response.updatedDraft ?? undefined,
        });
      }
    } finally {
      setAiThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 && !isAiThinking && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">AI</span>
            </div>
            <p className="text-lg font-medium text-gray-600 mb-1">你好！</p>
            <p className="text-sm">告诉我你要做什么，我来帮你创建任务</p>
            <p className="text-xs mt-2 text-gray-300">例如：「明天下午三点开会」「周五前完成报告」</p>
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
