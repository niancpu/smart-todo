import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const ALLOWED_DOMAINS = [
  'qq.com',
  '163.com',
  'outlook.com',
  'hotmail.com',
  'gmail.com',
];

@ValidatorConstraint({ async: false })
export class IsAllowedEmailDomainConstraint
  implements ValidatorConstraintInterface
{
  validate(email: string) {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return ALLOWED_DOMAINS.includes(domain);
  }

  defaultMessage() {
    return '仅支持 qq.com, 163.com, outlook.com, hotmail.com, gmail.com 邮箱';
  }
}

export function IsAllowedEmailDomain(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAllowedEmailDomainConstraint,
    });
  };
}
