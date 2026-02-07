import { IsEmail, IsString, Length } from 'class-validator';
import { IsAllowedEmailDomain } from '../validators/email-domain.validator';

export class CodeLoginDto {
  @IsEmail()
  @IsAllowedEmailDomain()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
