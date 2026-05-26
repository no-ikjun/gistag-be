import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { InfoteamCallbackDto } from './dto/infoteam-callback.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUserId } from './current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('infoteam/token')
  @ApiOperation({
    summary: '인포팀 IdP authorization code → 앱 JWT',
    description:
      '클라이언트가 받은 authorization code를 교환하고, 사용자 upsert 후 자체 access/refresh 토큰을 발급합니다.',
  })
  async infoteamToken(@Body() dto: InfoteamCallbackDto) {
    return this.authService.loginWithInfoteamCode(dto);
  }

  @Post('register')
  @ApiOperation({ summary: '로컬 회원가입 (이메일·비밀번호)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerLocal(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '로컬 로그인' })
  async login(@Body() dto: LoginDto) {
    return this.authService.loginLocal(dto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: '앱 refresh 토큰으로 새 access·refresh 발급 (rotation)',
  })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshSession(dto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'refresh 토큰 무효화' })
  async logout(@Body() dto: LogoutDto) {
    await this.authService.logout(dto.refreshToken);
    return { ok: true as const };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '현재 로그인 사용자 프로필',
    description: 'userId, nickname, email, providerType 반환',
  })
  async me(@CurrentUserId() userId: string) {
    return this.authService.getMe(userId);
  }
}
