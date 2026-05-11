import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NfcVerifyDto {
  @ApiProperty({
    example: 'DEMO-NFC-UID-001',
    description: 'NFC 태그 UID 또는 식별값',
  })
  @IsString()
  @IsNotEmpty()
  tagUid!: string;
}
