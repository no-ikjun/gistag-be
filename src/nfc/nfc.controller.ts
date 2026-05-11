import { Body, Controller, Post } from '@nestjs/common';
import { PlaceResponseDto } from '../places/dto/place-response.dto';
import { NfcVerifyDto } from './dto/nfc-verify.dto';
import { NfcService } from './nfc.service';

@Controller('nfc')
export class NfcController {
  constructor(private readonly nfcService: NfcService) {}

  @Post('verify')
  verify(@Body() body: NfcVerifyDto): Promise<{ place: PlaceResponseDto }> {
    return this.nfcService.verify(body);
  }
}
