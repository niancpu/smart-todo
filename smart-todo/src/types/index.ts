export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Status = string;
export type Category = 'work' | 'personal' | 'health' | 'study' | 'shopping' | 'other';

export const DEFAULT_STATUSES = ['todo', 'doing', 'done', 'dropped'] as const;

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  wipLimit?: number;
}

export interface BoardConfig {
  id?: number;
  userId?: string;
  columns: BoardColumn[];
}

export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  columns: [
    { id: 'todo', name: 'ToDo', order: 0 },
    { id: 'doing', name: 'Doing', order: 1, wipLimit: 3 },
    { id: 'done', name: 'Done', order: 2 },
    { id: 'dropped', name: 'Dropped', order: 3 },
  ],
};

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
  sortOrder?: number;
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
