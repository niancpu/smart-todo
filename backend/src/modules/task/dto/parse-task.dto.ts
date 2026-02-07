import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class ParseTaskDto {
  @IsString()
  @MaxLength(1000)
  rawInput: string;

  @IsOptional()
  @IsBoolean()
  autoCreate?: boolean = false;
}
