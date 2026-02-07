import { IsString, IsOptional, IsIn, IsNumber, IsArray, IsDateString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsIn(['work', 'personal', 'health', 'study', 'shopping', 'other'])
  category?: string;

  @IsOptional() @IsArray()
  tags?: string[];

  @IsOptional() @IsIn(['urgent', 'high', 'medium', 'low'])
  priority?: string;

  @IsOptional() @IsIn(['todo', 'in_progress', 'done'])
  status?: string;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsNumber()
  estimatedMinutes?: number;

  @IsOptional() @IsNumber()
  actualMinutes?: number;

  @IsOptional() @IsDateString()
  completedAt?: string;
}
