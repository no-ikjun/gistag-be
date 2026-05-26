import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { RecommendedQueryDto } from './dto/recommended-query.dto';
import { PlaceResponseDto } from './dto/place-response.dto';
import { PlacesService } from './places.service';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('nearby')
  @ApiOperation({ summary: '현재 위치 주변 운동 장소 목록' })
  @ApiOkResponse({ type: PlaceResponseDto, isArray: true })
  getNearby(@Query() query: NearbyQueryDto): Promise<PlaceResponseDto[]> {
    return this.placesService.findNearby(query);
  }

  @Get('recommended')
  @ApiOperation({ summary: '추천 장소 목록' })
  @ApiOkResponse({ type: PlaceResponseDto, isArray: true })
  getRecommended(
    @Query() query: RecommendedQueryDto,
  ): Promise<PlaceResponseDto[]> {
    return this.placesService.findRecommended(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '장소 단건 조회' })
  @ApiOkResponse({ type: PlaceResponseDto })
  @ApiNotFoundResponse({ description: '장소를 찾을 수 없음' })
  getById(@Param('id', ParseIntPipe) id: number): Promise<PlaceResponseDto> {
    return this.placesService.findOne(id);
  }
}
