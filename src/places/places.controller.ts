import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RecommendedQueryDto } from './dto/recommended-query.dto';
import { PlaceResponseDto } from './dto/place-response.dto';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('recommended')
  getRecommended(
    @Query() query: RecommendedQueryDto,
  ): Promise<PlaceResponseDto[]> {
    return this.placesService.findRecommended(query);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<PlaceResponseDto> {
    return this.placesService.findOne(id);
  }
}
