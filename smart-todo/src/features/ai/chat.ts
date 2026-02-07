import type { TaskDraft } from '@/types';
import { httpClient } from '@/lib/http';

export interface AIChatResponse {
  text: string;
  updatedDraft: TaskDraft | null;
  shouldCreate: boolean;
}

interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithAI(
  userText: string,
  currentDraft: TaskDraft | null,
  history: ChatMessagePayload[] = [],
): Promise<AIChatResponse> {
  const messages: ChatMessagePayload[] = [
    ...history,
    { role: 'user', content: userText },
  ];

  const body: { messages: ChatMessagePayload[]; currentDraft?: any } = { messages };

  if (currentDraft) {
    body.currentDraft = {
      ...currentDraft,
      dueDate: currentDraft.dueDate ? currentDraft.dueDate.toISOString() : null,
    };
  }

  const json = await httpClient.post<any>('/tasks/chat', body);
  const data = json.data ?? json;

  const draft = data.taskDraft
    ? {
        title: data.taskDraft.title,
        dueDate: data.taskDraft.dueDate ? new Date(data.taskDraft.dueDate) : undefined,
        priority: data.taskDraft.priority,
        category: data.taskDraft.category,
        estimatedMinutes: data.taskDraft.estimatedMinutes ?? undefined,
        tags: data.taskDraft.tags ?? [],
        description: data.taskDraft.description ?? undefined,
      }
    : null;

  return {
    text: data.text,
    updatedDraft: draft,
    shouldCreate: !!data.shouldCreate,
  };
}
