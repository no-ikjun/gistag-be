import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IssueNfcTagResponseDto } from './dto/issue-nfc-tag-response.dto';
import { NfcTagResponseDto } from './dto/nfc-tag-response.dto';
import { RegisterNfcTagDto } from './dto/register-nfc-tag.dto';
import { UpdateNfcTagPlaceDto } from './dto/update-nfc-tag-place.dto';
import { UpdateNfcTagStatusDto } from './dto/update-nfc-tag-status.dto';
import { NfcService } from './nfc.service';

@ApiTags('nfc')
@Controller('nfc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NfcController {
  constructor(private readonly nfcService: NfcService) {}

  @Post('issue')
  @ApiOperation({ summary: 'NFC 스티커용 tagCode 발급' })
  @ApiCreatedResponse({ type: IssueNfcTagResponseDto })
  issue(): Promise<IssueNfcTagResponseDto> {
    return this.nfcService.issue();
  }

  @Post('register')
  @ApiOperation({ summary: 'NFC 스티커 스캔 정보 등록' })
  @ApiCreatedResponse({ type: NfcTagResponseDto })
  @ApiConflictResponse({ description: '폐기된 태그는 재등록할 수 없음' })
  register(
    @CurrentUserId() userId: string,
    @Body() body: RegisterNfcTagDto,
  ): Promise<NfcTagResponseDto> {
    return this.nfcService.register(userId, body);
  }

  @Patch(':tagId/place')
  @ApiOperation({ summary: 'NFC 스티커 장소 연결 또는 재배치' })
  @ApiCreatedResponse({ type: NfcTagResponseDto })
  updatePlace(
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body() body: UpdateNfcTagPlaceDto,
  ): Promise<NfcTagResponseDto> {
    return this.nfcService.updatePlace(tagId, body);
  }

  @Patch(':tagId/status')
  @ApiOperation({ summary: 'NFC 스티커 상태 변경' })
  @ApiCreatedResponse({ type: NfcTagResponseDto })
  updateStatus(
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body() body: UpdateNfcTagStatusDto,
  ): Promise<NfcTagResponseDto> {
    return this.nfcService.updateStatus(tagId, body);
  }
}
