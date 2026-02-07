export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in_progress' | 'done';
export type Category = 'work' | 'personal' | 'health' | 'study' | 'shopping' | 'other';

export interface Task {
  id?: number;
  userId?: string;
  title: string;
  description?: string;
  rawInput: string;
  category: Category;
  tags: string[];
  priority: Priority;
  status: Status;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  estimatedMinutes?: number;
  actualMinutes?: number;
  recurrence?: string;
  aiConfidence?: number;
  aiSuggestions?: string[];
}

export interface TaskFilter {
  status?: Status | 'all';
  category?: Category;
  priority?: Priority;
  dateRange?: { start: Date; end: Date };
  search?: string;
}

export interface ParseResult {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  category: Category;
  estimatedMinutes?: number;
  tags: string[];
  confidence: number;
  uncertainFields: string[];
}

export interface TaskDraft {
  title: string;
  dueDate?: Date;
  priority: Priority;
  category: Category;
  estimatedMinutes?: number;
  tags: string[];
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  taskDraft?: TaskDraft;
  taskCreated?: boolean;
}
