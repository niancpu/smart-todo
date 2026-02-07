import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationCode(
    email: string,
    code: string,
    purpose: 'login' | 'register' | 'change-email' = 'login',
  ): Promise<void> {
    const subjectMap = {
      login: 'Smart Todo - 登录验证码',
      register: 'Smart Todo - 注册验证码',
      'change-email': 'Smart Todo - 换绑邮箱验证码',
    };
    const titleMap = {
      login: '登录验证码',
      register: '注册验证码',
      'change-email': '换绑邮箱验证码',
    };
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: subjectMap[purpose],
      html: `
        <div style="max-width:400px;margin:0 auto;padding:32px;font-family:sans-serif;">
          <h2 style="color:#334155;margin-bottom:16px;">${titleMap[purpose]}</h2>
          <p style="color:#64748b;font-size:14px;">您的验证码为：</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#3b82f6;padding:16px 0;">${code}</div>
          <p style="color:#94a3b8;font-size:12px;">验证码 5 分钟内有效，请勿泄露给他人。</p>
        </div>
      `,
    });
  }
}
