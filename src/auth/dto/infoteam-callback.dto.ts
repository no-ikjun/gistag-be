import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class InfoteamCallbackDto {
  @ApiProperty({ description: 'Authorization code from IdP' })
  @IsString()
  @MinLength(10)
  code!: string;

  @ApiProperty({ description: 'Redirect URI used in the authorize request' })
  @IsString()
  @MinLength(1)
  redirectUri!: string;

  @ApiPropertyOptional({
    description: 'PKCE code_verifier when code_challenge was used',
  })
  @IsOptional()
  @IsString()
  codeVerifier?: string;
}
