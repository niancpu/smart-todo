import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { CodeLoginDto } from './dto/code-login.dto';
import {
  UpdateUsernameDto,
  SendChangeEmailCodeDto,
  ChangeEmailDto,
  SetPasswordDto,
} from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('send-register-code')
  @HttpCode(HttpStatus.OK)
  sendRegisterCode(@Body() dto: SendCodeDto) {
    return this.authService.sendRegisterCode(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendVerificationCode(dto);
  }

  @Post('login-with-code')
  @HttpCode(HttpStatus.OK)
  loginWithCode(@Body() dto: CodeLoginDto) {
    return this.authService.loginWithCode(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  // --- Profile management ---

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateUsername(@Request() req: any, @Body() dto: UpdateUsernameDto) {
    return this.authService.updateUsername(req.user.userId, dto);
  }

  @Post('send-change-email-code')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  sendChangeEmailCode(@Request() req: any, @Body() dto: SendChangeEmailCodeDto) {
    return this.authService.sendChangeEmailCode(req.user.userId, dto);
  }

  @Post('change-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  changeEmail(@Request() req: any, @Body() dto: ChangeEmailDto) {
    return this.authService.changeEmail(req.user.userId, dto);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  setPassword(@Request() req: any, @Body() dto: SetPasswordDto) {
    return this.authService.setPassword(req.user.userId, dto);
  }
}
