import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const user = await this.userService.create(email, password);
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await this.userService.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    const stored = this.refreshTokens.get(refreshToken);
    if (!stored || stored.expiresAt < Date.now()) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userService.findById(stored.userId);
    if (!user) throw new UnauthorizedException('User not found');
    this.refreshTokens.delete(refreshToken);
    return this.generateTokens(user);
  }

  async logout(refreshToken: string) {
    this.refreshTokens.delete(refreshToken);
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = crypto.randomUUID();
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    };
  }
}
