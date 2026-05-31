import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RankingsQueryDto } from './dto/rankings-query.dto';
import { RankingsResponseDto } from './dto/rankings-response.dto';
import { RankingsService } from './rankings.service';

@ApiTags('rankings')
@Controller('rankings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get()
  @ApiOperation({ summary: '전체 누적 XP 랭킹 조회 (본인 순위 포함)' })
  @ApiOkResponse({ type: RankingsResponseDto })
  findRankings(
    @CurrentUserId() userId: string,
    @Query() query: RankingsQueryDto,
  ): Promise<RankingsResponseDto> {
    return this.rankingsService.findRankings(userId, query);
  }
}
