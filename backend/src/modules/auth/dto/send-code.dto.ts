import { IsEmail } from 'class-validator';
import { IsAllowedEmailDomain } from '../validators/email-domain.validator';

export class SendCodeDto {
  @IsEmail()
  @IsAllowedEmailDomain()
  email: string;
}
