import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildParseTaskPrompt } from './prompts/parse-task.prompt';
import { buildChatTaskPrompt } from './prompts/chat-task.prompt';
import { TaskPriority } from '../task/task.entity';

export interface ChatResponse {
  text: string;
  taskDraft: {
    title: string;
    dueDate?: string | null;
    priority: string;
    category: string;
    estimatedMinutes?: number | null;
    tags: string[];
    description?: string;
  } | null;
  shouldCreate: boolean;
}

export interface ParsedTask {
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  category: string;
  estimatedMinutes?: number;
  tags: string[];
  confidence: number;
  uncertainFields: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('AI_API_URL') || '';
    this.apiKey = this.configService.get<string>('AI_API_KEY') || '';
    this.model = this.configService.get<string>('AI_MODEL') || 'gpt-3.5-turbo';
  }

  async parseTask(rawInput: string): Promise<ParsedTask> {
    const prompt = buildParseTaskPrompt(rawInput);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from AI');
      }

      const jsonContent = this.extractJson(content);
      const parsed = JSON.parse(jsonContent);
      return this.validateAndNormalize(parsed);
    } catch (error) {
      this.logger.error(`AI parsing failed: ${error.message}`);
      return this.fallbackParse(rawInput);
    }
  }

  async chatTask(
    messages: { role: string; content: string }[],
    currentDraft?: any,
  ): Promise<ChatResponse> {
    const systemPrompt = buildChatTaskPrompt();

    const apiMessages = [
      { role: 'system', content: systemPrompt },
    ];

    if (currentDraft) {
      apiMessages.push({
        role: 'system',
        content: `当前任务草稿：${JSON.stringify(currentDraft)}`,
      });
    }

    apiMessages.push(...messages);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from AI');
      }

      const jsonContent = this.extractJson(content);
      const parsed = JSON.parse(jsonContent);
      return this.validateChatResponse(parsed);
    } catch (error) {
      this.logger.error(`AI chat failed: ${error.message}`);
      return {
        text: '抱歉，我暂时无法处理你的请求，请稍后再试。',
        taskDraft: currentDraft ?? null,
        shouldCreate: false,
      };
    }
  }

  private validateChatResponse(parsed: any): ChatResponse {
    return {
      text: parsed.text || '我不太理解，能再说一次吗？',
      taskDraft: parsed.taskDraft
        ? {
            title: parsed.taskDraft.title || '未命名任务',
            dueDate: parsed.taskDraft.dueDate || null,
            priority: parsed.taskDraft.priority || 'medium',
            category: parsed.taskDraft.category || 'other',
            estimatedMinutes: parsed.taskDraft.estimatedMinutes || null,
            tags: Array.isArray(parsed.taskDraft.tags) ? parsed.taskDraft.tags : [],
            description: parsed.taskDraft.description || '',
          }
        : null,
      shouldCreate: !!parsed.shouldCreate,
    };
  }

  private extractJson(content: string): string {
    // Remove markdown code block if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    return content.trim();
  }

  private validateAndNormalize(parsed: any): ParsedTask {
    return {
      title: parsed.title || '未命名任务',
      description: parsed.description || undefined,
      dueDate: parsed.dueDate || undefined,
      priority: this.normalizePriority(parsed.priority),
      category: parsed.category || 'life',
      estimatedMinutes: parsed.estimatedMinutes || undefined,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      uncertainFields: Array.isArray(parsed.uncertainFields) ? parsed.uncertainFields : [],
    };
  }

  private normalizePriority(priority: string): TaskPriority {
    const map: Record<string, TaskPriority> = {
      urgent: TaskPriority.URGENT,
      high: TaskPriority.HIGH,
      medium: TaskPriority.MEDIUM,
      low: TaskPriority.LOW,
    };
    return map[priority?.toLowerCase()] || TaskPriority.MEDIUM;
  }

  private fallbackParse(rawInput: string): ParsedTask {
    return {
      title: rawInput.slice(0, 100),
      priority: TaskPriority.MEDIUM,
      category: 'life',
      tags: [],
      confidence: 0.3,
      uncertainFields: ['title', 'priority', 'category', 'dueDate'],
    };
  }
}
