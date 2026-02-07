import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { IsAllowedEmailDomain } from '../validators/email-domain.validator';

export class UpdateUsernameDto {
  @IsString()
  @Length(2, 20)
  username: string;
}

export class SendChangeEmailCodeDto {
  @IsEmail()
  @IsAllowedEmailDomain()
  newEmail: string;
}

export class ChangeEmailDto {
  @IsEmail()
  @IsAllowedEmailDomain()
  newEmail: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class SetPasswordDto {
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
