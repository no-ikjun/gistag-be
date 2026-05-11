import { IsNotEmpty, IsString } from 'class-validator';

export class NfcVerifyDto {
  @IsString()
  @IsNotEmpty()
  tagUid!: string;
}
