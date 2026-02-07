import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';

export class TaskQueryDto {
  @IsOptional() @IsIn(['todo', 'in_progress', 'done'])
  status?: string;

  @IsOptional() @IsIn(['work', 'personal', 'health', 'study', 'shopping', 'other'])
  category?: string;

  @IsOptional() @IsIn(['urgent', 'high', 'medium', 'low'])
  priority?: string;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional() @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional() @IsNumberString()
  page?: string = '1';

  @IsOptional() @IsNumberString()
  limit?: string = '20';
}
