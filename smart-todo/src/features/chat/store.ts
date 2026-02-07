import { create } from 'zustand';
import type { ChatMessage, TaskDraft } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  isAiThinking: boolean;
  currentDraft: TaskDraft | null;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  setAiThinking: (v: boolean) => void;
  setCurrentDraft: (draft: TaskDraft | null) => void;
  clearChat: () => void;
}

let counter = 0;
const genId = () => `msg_${Date.now()}_${++counter}`;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isAiThinking: false,
  currentDraft: null,

  addMessage: (msg) => {
    const id = genId();
    set((s) => ({
      messages: [...s.messages, { ...msg, id, timestamp: new Date() }],
    }));
    return id;
  },

  setAiThinking: (v) => set({ isAiThinking: v }),
  setCurrentDraft: (draft) => set({ currentDraft: draft }),
  clearChat: () => set({ messages: [], isAiThinking: false, currentDraft: null }),
}));
