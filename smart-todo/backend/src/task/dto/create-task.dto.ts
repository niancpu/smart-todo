import { IsString, IsOptional, IsIn, IsNumber, IsArray, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  rawInput?: string;

  @IsOptional() @IsIn(['work', 'personal', 'health', 'study', 'shopping', 'other'])
  category?: string;

  @IsOptional() @IsArray()
  tags?: string[];

  @IsOptional() @IsIn(['urgent', 'high', 'medium', 'low'])
  priority?: string;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsNumber()
  estimatedMinutes?: number;

  @IsOptional() @IsNumber()
  aiConfidence?: number;

  @IsOptional() @IsArray()
  aiSuggestions?: string[];
}
