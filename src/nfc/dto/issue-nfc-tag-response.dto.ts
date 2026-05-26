import { ApiProperty } from '@nestjs/swagger';

export class IssueNfcTagResponseDto {
  @ApiProperty({ example: 1 })
  tagId!: number;

  @ApiProperty({ example: 'GISTAG_TAG_123ABC' })
  tagCode!: string;

  @ApiProperty({ example: 'gistag://tag/GISTAG_TAG_123ABC' })
  ndefPayload!: string;

  @ApiProperty({ example: 'URI' })
  ndefType!: string;
}
