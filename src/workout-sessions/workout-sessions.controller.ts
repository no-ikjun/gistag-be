import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CancelWorkoutSessionDto } from './dto/cancel-workout-session.dto';
import { FinishWorkoutSessionDto } from './dto/finish-workout-session.dto';
import { FinishWorkoutSessionResponseDto } from './dto/finish-workout-session-response.dto';
import { StartWorkoutSessionDto } from './dto/start-workout-session.dto';
import { ActivePeersResponseDto } from './dto/active-peers-response.dto';
import {
  ActiveWorkoutSessionResponseDto,
  StartWorkoutSessionResponseDto,
} from './dto/workout-session-response.dto';
import { WorkoutSessionsService } from './workout-sessions.service';

@ApiTags('workout-sessions')
@Controller('workout-sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class WorkoutSessionsController {
  constructor(
    private readonly workoutSessionsService: WorkoutSessionsService,
  ) {}

  @Get('active')
  @ApiOperation({ summary: '진행 중인 운동 세션 조회' })
  @ApiOkResponse({ type: ActiveWorkoutSessionResponseDto })
  getActive(
    @CurrentUserId() userId: string,
  ): Promise<ActiveWorkoutSessionResponseDto> {
    return this.workoutSessionsService.getActive(userId);
  }

  @Get('active/peers')
  @ApiOperation({ summary: '같은 장소에서 운동 중인 다른 사용자 조회' })
  @ApiOkResponse({ type: ActivePeersResponseDto })
  getActivePeers(
    @CurrentUserId() userId: string,
  ): Promise<ActivePeersResponseDto> {
    return this.workoutSessionsService.getActivePeers(userId);
  }

  @Post('start')
  @ApiOperation({ summary: '운동 세션 시작' })
  @ApiCreatedResponse({ type: StartWorkoutSessionResponseDto })
  @ApiConflictResponse({ description: '이미 진행 중인 운동 세션이 있음' })
  @ApiUnprocessableEntityResponse({ description: '태그와 장소 매핑 불일치' })
  start(
    @CurrentUserId() userId: string,
    @Body() body: StartWorkoutSessionDto,
  ): Promise<StartWorkoutSessionResponseDto> {
    return this.workoutSessionsService.start(userId, body);
  }

  @Post(':sessionId/finish')
  @ApiOperation({ summary: '운동 세션 종료 및 기록 확정' })
  @ApiOkResponse({ type: FinishWorkoutSessionResponseDto })
  @ApiNotFoundResponse({ description: '세션이 없거나 내 세션이 아님' })
  @ApiConflictResponse({ description: '이미 취소되었거나 비정상 종료 상태' })
  @ApiUnprocessableEntityResponse({ description: '최소 운동 시간 미만' })
  finish(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: FinishWorkoutSessionDto,
  ): Promise<FinishWorkoutSessionResponseDto> {
    return this.workoutSessionsService.finish(userId, sessionId, body);
  }

  @Post(':sessionId/cancel')
  @ApiOperation({ summary: '운동 세션 취소' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  cancel(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: CancelWorkoutSessionDto,
  ): Promise<{ ok: true }> {
    return this.workoutSessionsService.cancel(userId, sessionId, body);
  }
}
