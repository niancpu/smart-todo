import type { ParseResult } from '@/types';
import { httpClient } from '@/lib/http';

export async function parseTask(rawInput: string): Promise<ParseResult> {
  const data = await httpClient.post<any>('/tasks/parse', { rawInput });
  return {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    estimatedMinutes: data.estimatedMinutes ?? undefined,
  };
}
