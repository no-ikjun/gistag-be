import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NfcTagResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'GISTAG_TAG_123ABC' })
  tagCode!: string;

  @ApiProperty({ nullable: true, example: 1 })
  placeId!: number | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiPropertyOptional({ nullable: true, example: '04:A1:B2:C3:D4:E5:F6' })
  hardwareUid!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'gistag://tag/GISTAG_TAG_123ABC',
  })
  ndefPayload!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'URI' })
  ndefType!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: ['NFC_A', 'NDEF'],
    type: [String],
  })
  techTypes!: string[] | null;

  @ApiPropertyOptional({ nullable: true, example: true })
  isWritable!: boolean | null;

  @ApiPropertyOptional({ nullable: true, example: 144 })
  maxSizeBytes!: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
