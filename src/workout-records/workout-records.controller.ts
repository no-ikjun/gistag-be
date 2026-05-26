import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecentWorkoutRecordsQueryDto } from './dto/recent-workout-records-query.dto';
import { RecentWorkoutRecordsResponseDto } from './dto/recent-workout-records-response.dto';
import { WorkoutRecordsService } from './workout-records.service';

@ApiTags('workout-records')
@Controller('workout-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class WorkoutRecordsController {
  constructor(private readonly workoutRecordsService: WorkoutRecordsService) {}

  @Get('me/recent')
  @ApiOperation({ summary: '내 최근 운동 기록 조회' })
  @ApiOkResponse({ type: RecentWorkoutRecordsResponseDto })
  findRecent(
    @CurrentUserId() userId: string,
    @Query() query: RecentWorkoutRecordsQueryDto,
  ): Promise<RecentWorkoutRecordsResponseDto> {
    return this.workoutRecordsService.findRecent(userId, query);
  }
}
