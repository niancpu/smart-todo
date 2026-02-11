import { useChatStore } from '@/features/chat/store';
import { useCreateTask } from '@/features/task/hooks';
import { chatWithAI } from '@/features/ai/chat';

export function useChatHandler() {
  const messages = useChatStore((s) => s.messages);
  const isAiThinking = useChatStore((s) => s.isAiThinking);
  const currentDraft = useChatStore((s) => s.currentDraft);
  const { addMessage, setAiThinking, setCurrentDraft } = useChatStore();
  const { create } = useCreateTask();

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

  return { messages, isAiThinking, handleSend };
}
