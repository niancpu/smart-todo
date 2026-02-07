import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsEnum(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @IsString()
  @MaxLength(2000)
  content: string;
}

class TaskDraftDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsString()
  priority: string;

  @IsString()
  category: string;

  @IsOptional()
  estimatedMinutes?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class ChatTaskDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TaskDraftDto)
  currentDraft?: TaskDraftDto;
}
