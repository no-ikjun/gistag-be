import { ApiProperty } from '@nestjs/swagger';

export class AdminRegisteredTagDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '04A1B2C3D4E5F6' })
  hardwareUid!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class AdminRegisteredPlaceDto {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 'GIST 체육관' })
  name!: string;

  @ApiProperty({ nullable: true, example: 35.2131 })
  latitude!: number | null;

  @ApiProperty({ nullable: true, example: 126.8378 })
  longitude!: number | null;
}

export class RegisterAdminNfcTagResponseDto {
  @ApiProperty({ type: AdminRegisteredTagDto })
  tag!: AdminRegisteredTagDto;

  @ApiProperty({ type: AdminRegisteredPlaceDto })
  place!: AdminRegisteredPlaceDto;
}
