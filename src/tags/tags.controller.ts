import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TagResolveDto } from './dto/tag-resolve.dto';
import { TagResolveResponseDto } from './dto/tag-resolve-response.dto';
import { TagsService } from './tags.service';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post('resolve')
  @ApiOperation({ summary: 'NFC tagCode 검증 및 연결 장소 조회' })
  @ApiOkResponse({ type: TagResolveResponseDto })
  @ApiNotFoundResponse({ description: '태그를 찾을 수 없음' })
  @ApiUnprocessableEntityResponse({
    description: '비활성 태그 또는 장소에 연결되지 않은 태그',
  })
  resolve(@Body() body: TagResolveDto): Promise<TagResolveResponseDto> {
    return this.tagsService.resolve(body);
  }
}
