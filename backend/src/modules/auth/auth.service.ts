import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { CodeLoginDto } from './dto/code-login.dto';
import {
  UpdateUsernameDto,
  SendChangeEmailCodeDto,
  ChangeEmailDto,
  SetPasswordDto,
} from './dto/update-profile.dto';
import { EmailService } from './services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private buildUserResponse(user: User) {
    return { id: user.id, email: user.email, username: user.username };
  }

  async register(dto: RegisterDto) {
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('该邮箱已注册');
    }

    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('该用户名已被使用');
    }

    const record = await this.verificationCodeRepository.findOne({
      where: {
        email: dto.email,
        code: dto.code,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!record) {
      throw new UnauthorizedException('验证码无效或已过期');
    }

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: null,
    });
    await this.userRepository.save(user);

    record.used = true;
    await this.verificationCodeRepository.save(record);

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.buildUserResponse(user) };
  }

  async sendRegisterCode(dto: SendCodeDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }

    return this.sendCode(dto.email, 'register');
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('该账号未设置密码，请使用验证码登录');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.buildUserResponse(user) };
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    tokenRecord.revoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    const user = await this.userRepository.findOne({
      where: { id: tokenRecord.userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.buildUserResponse(user) };
  }

  async sendVerificationCode(dto: SendCodeDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('该邮箱未注册');
    }

    return this.sendCode(dto.email, 'login');
  }

  async loginWithCode(dto: CodeLoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('该邮箱未注册');
    }

    const record = await this.verificationCodeRepository.findOne({
      where: {
        email: dto.email,
        code: dto.code,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!record) {
      throw new UnauthorizedException('验证码无效或已过期');
    }

    record.used = true;
    await this.verificationCodeRepository.save(record);

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.buildUserResponse(user) };
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });
    if (tokenRecord) {
      tokenRecord.revoked = true;
      await this.refreshTokenRepository.save(tokenRecord);
    }
  }

  // --- Profile management ---

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password,
    };
  }

  async updateUsername(userId: string, dto: UpdateUsernameDto) {
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existing && existing.id !== userId) {
      throw new ConflictException('该用户名已被使用');
    }

    await this.userRepository.update(userId, { username: dto.username });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return this.buildUserResponse(user!);
  }

  async sendChangeEmailCode(userId: string, dto: SendChangeEmailCodeDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.newEmail },
    });
    if (existing) {
      throw new ConflictException('该邮箱已被占用');
    }

    return this.sendCode(dto.newEmail, 'change-email');
  }

  async changeEmail(userId: string, dto: ChangeEmailDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.newEmail },
    });
    if (existing) {
      throw new ConflictException('该邮箱已被占用');
    }

    const record = await this.verificationCodeRepository.findOne({
      where: {
        email: dto.newEmail,
        code: dto.code,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!record) {
      throw new UnauthorizedException('验证码无效或已过期');
    }

    record.used = true;
    await this.verificationCodeRepository.save(record);

    await this.userRepository.update(userId, { email: dto.newEmail });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return this.buildUserResponse(user!);
  }

  async setPassword(userId: string, dto: SetPasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    if (user.password) {
      if (!dto.currentPassword) {
        throw new BadRequestException('请输入当前密码');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!valid) {
        throw new UnauthorizedException('当前密码错误');
      }
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashed });
    return { message: '密码设置成功' };
  }

  // --- Shared helpers ---

  private async sendCode(
    email: string,
    purpose: 'login' | 'register' | 'change-email',
  ) {
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const recent = await this.verificationCodeRepository.findOne({
      where: {
        email,
        used: false,
        createdAt: MoreThan(sixtySecondsAgo),
      },
    });
    if (recent) {
      throw new BadRequestException('请 60 秒后再试');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const entity = this.verificationCodeRepository.create({ email, code, expiresAt });
    await this.verificationCodeRepository.save(entity);
    await this.emailService.sendVerificationCode(email, code, purpose);

    return { message: '验证码已发送' };
  }

  private async generateTokenPair(user: User) {
    const payload = { sub: user.id, email: user.email, username: user.username };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = uuidv4();
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
    const expiresAt = new Date();
    const days = parseInt(expiresIn) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    const tokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });
    await this.refreshTokenRepository.save(tokenEntity);

    return { accessToken, refreshToken };
  }
}
