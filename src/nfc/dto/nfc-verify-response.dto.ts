import { ApiProperty } from '@nestjs/swagger';
import { PlaceResponseDto } from '../../places/dto/place-response.dto';

export class NfcVerifyResponseDto {
  @ApiProperty({ type: PlaceResponseDto })
  place!: PlaceResponseDto;
}
