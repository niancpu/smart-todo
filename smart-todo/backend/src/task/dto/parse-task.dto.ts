import { IsString } from 'class-validator';

export class ParseTaskDto {
  @IsString()
  rawInput: string;
}
