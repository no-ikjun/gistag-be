import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NfcVerifyDto } from './dto/nfc-verify.dto';
import { NfcVerifyResponseDto } from './dto/nfc-verify-response.dto';
import { NfcService } from './nfc.service';

@ApiTags('nfc')
@Controller('nfc')
export class NfcController {
  constructor(private readonly nfcService: NfcService) {}

  @Post('verify')
  @ApiOperation({ summary: 'NFC 태그 검증 및 연결 장소 조회' })
  @ApiOkResponse({ type: NfcVerifyResponseDto })
  @ApiNotFoundResponse({ description: '미등록 또는 비활성 태그' })
  verify(@Body() body: NfcVerifyDto): Promise<NfcVerifyResponseDto> {
    return this.nfcService.verify(body);
  }
}
