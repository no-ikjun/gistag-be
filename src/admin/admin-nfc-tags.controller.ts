import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminNfcTagsService } from './admin-nfc-tags.service';
import { RegisterAdminNfcTagResponseDto } from './dto/register-admin-nfc-tag-response.dto';
import { RegisterAdminNfcTagDto } from './dto/register-admin-nfc-tag.dto';

@ApiTags('admin')
@Controller('admin/nfc-tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AdminNfcTagsController {
  constructor(private readonly adminNfcTagsService: AdminNfcTagsService) {}

  @Post('register')
  @ApiOperation({
    summary: '운영자: 운동 장소 + NFC 태그 동시 등록',
    description:
      'place 정보로 새 운동 장소를 만들고, hardwareUid를 1차 식별자로 NFC 태그를 ACTIVE 상태로 등록합니다.',
  })
  @ApiCreatedResponse({ type: RegisterAdminNfcTagResponseDto })
  @ApiConflictResponse({ description: '폐기된 태그를 재등록할 수 없음' })
  register(
    @CurrentUserId() userId: string,
    @Body() body: RegisterAdminNfcTagDto,
  ): Promise<RegisterAdminNfcTagResponseDto> {
    return this.adminNfcTagsService.register(userId, body);
  }
}
