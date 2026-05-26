import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token issued by /auth/login or /auth/infoteam/token',
  })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
