import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserStatsResponseDto } from './dto/user-stats-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('onboarding')
  @ApiOperation({ summary: '온보딩 정보 최초 저장' })
  @ApiCreatedResponse({ type: UserProfileResponseDto })
  @ApiConflictResponse({ description: '이미 온보딩 완료됨' })
  submitOnboarding(
    @CurrentUserId() userId: string,
    @Body() body: SubmitOnboardingDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.submitOnboarding(userId, body);
  }

  @Get('profile')
  @ApiOperation({ summary: '사용자 프로필 조회 (온보딩 포함)' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  getProfile(@CurrentUserId() userId: string): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: '사용자 프로필 수정 (온보딩 포함)' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiNotFoundResponse({ description: '온보딩 미완료' })
  updateProfile(
    @CurrentUserId() userId: string,
    @Body() body: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(userId, body);
  }

  @Get('me/stats')
  @ApiOperation({ summary: '내 누적 스탯 조회 (level / XP / streak)' })
  @ApiOkResponse({ type: UserStatsResponseDto })
  getStats(@CurrentUserId() userId: string): Promise<UserStatsResponseDto> {
    return this.usersService.getStats(userId);
  }
}
