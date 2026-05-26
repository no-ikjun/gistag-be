import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const NFC_TAG_STATUSES = [
  'UNASSIGNED',
  'ACTIVE',
  'INACTIVE',
  'RETIRED',
] as const;

export type NfcTagStatus = (typeof NFC_TAG_STATUSES)[number];

export class UpdateNfcTagStatusDto {
  @ApiProperty({ enum: NFC_TAG_STATUSES, example: 'INACTIVE' })
  @IsIn(NFC_TAG_STATUSES)
  status!: NfcTagStatus;
}
